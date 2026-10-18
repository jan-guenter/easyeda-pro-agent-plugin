/** Dormant pre-dispatch intent. Original SQL reader identity is retained, but
 * supplied clock/client observations do not issue native writer authority.
 */
import { z } from "zod";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import { prepareCurrentPcbRenameHistory } from "./current-pcb-rename-history.ts";
import { prepareCurrentPcbRenameSql } from "./current-pcb-rename-sql.ts";
import type { CurrentPcbRenameSqlWitness } from "./current-pcb-rename-sql.ts";
import { prepareCurrentPcbRenameStructure } from "./current-pcb-rename-structure.ts";
import { currentPcbStoredHeaderSchema as headerSchema } from "./current-pcb-stored-header.ts";
import { isNativeDocumentDeleted, parseNativeRecords } from "./native-history.ts";
import type { NativeDocumentSnapshot } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";
// oxlint-disable-next-line import/max-dependencies -- Share stored-header admission and the maintained complete-history decoder rather than duplicate either rule.
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Decoded = Awaited<ReturnType<typeof decodeCurrentSymbolPreEditHistory>>;
const identifier = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const account = z.string().regex(/^[a-f0-9]{32}$/u);
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(value => !Object.is(value, -0));
const time = integer.max(8_640_000_000_000_000);
const title = z.string().min(1).max(512).refine(value => value.trim() === value && !/\p{Cc}/u.test(value));
const metadataSchema = z.object({ title, parent: z.literal(""), source: z.literal(""),
  board: z.union([z.literal(""), identifier]), zIndex: z.null() }).strict();
const targetSchema = z.object({ projectUuid: z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u), branchUuid: account,
  ownerUuid: account, pcbUuid: identifier }).strict();
const offset = z.number().int().min(-840).max(840).refine(value => !Object.is(value, -0));
const witnessSchema = z.object({ projectUuid: targetSchema.shape.projectUuid, branchUuid: account, backendActorUuid: account,
  client: headerSchema.shape.client, documentClockMinMs: time, documentClockMaxMs: time,
  backendClockMinMs: time, backendClockMaxMs: time, backendLocalOffsetMinutes: offset,
  agedHead: z.object({ createdAtLiteral: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u),
    nativeParsedLocalMs: time, nativeTimezoneOffsetMinutes: offset }).strict().optional(),
}).strict().refine(value => value.documentClockMaxMs >= value.documentClockMinMs && value.documentClockMaxMs - value.documentClockMinMs <= 60_000 &&
  value.backendClockMaxMs >= value.backendClockMinMs && value.backendClockMaxMs - value.backendClockMinMs <= 60_000);
const LIMITATIONS = Object.freeze({ executionAuthorized: false, originalOwnerVerified: false, producerBindingVerified: false,
  actorProvenanceVerified: false, clockProvenanceVerified: false, nativeNamePolicyVerified: false,
  queueCompletionVerified: false, generationClosureVerified: false, persistentUploadReplayExcluded: false, reopened: false } as const);
interface Peer {
  readonly uuid: string; readonly title: string; readonly board: string; readonly metadataSha256: string; readonly headerSha256: string;
}
export interface CurrentPcbRenamePreparation extends Readonly<typeof LIMITATIONS> {
  readonly profile: "private.current-pcb-rename-preparation.v1";
  readonly target: Readonly<z.infer<typeof targetSchema>>;
  readonly desiredTitle: string;
  readonly beforeMetaText: string;
  readonly baseline: Readonly<{ sqlSha256: string; checkpointSha256: string; historySha256: string; rawHistorySha256: string;
    targetSourceSha256: string; targetHeaderSha256: string; headHistoryUuid: string; maximumTicket: number;
    maximumTargetHeaderTime: number; documentCount: number; historyRows: number; chunks: number }>;
  readonly peers: readonly Readonly<Peer>[];
  readonly witness: Readonly<CurrentPcbRenameSqlWitness>;
  readonly capacity: Readonly<{ maximumPlaintextBytes: number; maximumCiphertextBase64Bytes: number; maximumEncodedSqlBytes: number }>;
  readonly preparationSha256: string;
}
interface Prepared {
  readonly before: Inventory;
  readonly target: z.infer<typeof targetSchema>;
  readonly desiredTitle: string;
  readonly beforeMetaText: string;
  readonly structureText: string;
  readonly header: z.infer<typeof headerSchema>;
  readonly maximumTicket: number;
  readonly maximumTargetHeaderTime: number;
  readonly witness: CurrentPcbRenameSqlWitness;
  readonly actor: Readonly<{ uuid: string; username: string; nickname: string }>;
}
const preparations = new WeakMap<CurrentPcbRenamePreparation, Prepared>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current PCB rename preparation: ${message}`); }
}
function data(value: unknown, names?: readonly string[]): Record<string, unknown> {
  need(isRecord(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null), "plain input required");
  const keys = Reflect.ownKeys(value), result: Record<string, unknown> = {};
  need(keys.length <= 12 && (names === undefined || keys.length === names.length) &&
    keys.every(key => typeof key === "string" && (names === undefined || names.includes(key))), "input fields differ");
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(typeof key === "string" && descriptor !== undefined && Object.hasOwn(descriptor, "value"), "input accessors refused");
    Object.defineProperty(result, key, { value: descriptor.value as unknown, enumerable: true });
  }
  return result;
}
function text(value: SqlCell): string {
  need(value.kind === "text", "expected SQL TEXT"); const bytes = Buffer.from(value.hex, "hex"), result = bytes.toString("utf8");
  need(Buffer.from(result).equals(bytes), "SQL text is not exact UTF8"); return result;
}
function table(before: Inventory, name: string): SqlTable {
  const selected = before.tables.filter(entry => entry.name === name);
  need(selected.length === 1 && selected[0] !== undefined, "SQL table identity differs"); return selected[0];
}
function field(owner: SqlTable, row: SqlRow, name: string): SqlCell {
  const value = row.cells[owner.columns.findIndex(column => column["name"] === name)];
  need(value !== undefined, "SQL column is missing"); return value;
}
function pcb(document: NativeDocumentSnapshot): { metadata: z.infer<typeof metadataSchema>; header: z.infer<typeof headerSchema>; text: string } {
  const rows = document.records.filter(entry => entry.id === "META" || entry.type === "META"); const entry = rows[0];
  need(document.docType === "PCB" && !isNativeDocumentDeleted(document) && rows.length === 1 && entry?.id === "META" && entry.type === "META", "ordinary PCB metadata missing");
  const metadata = metadataSchema.parse(entry.body); const header = headerSchema.parse(document.metadata), source = JSON.stringify(entry.body);
  need(header.uuid === document.uuid && JSON.stringify(metadata) === source && Buffer.from(source).toString("utf8") === source, "canonical PCB metadata differs");
  return { metadata, header, text: source };
}
async function maximumHeader(decoded: Decoded, uuid: string): Promise<number> {
  let maximum = -1, scanned = 0;
  for (const chunk of decoded.chunks) {
    for (const line of chunk.split("|\n")) {
      const entries = parseNativeRecords(line), entry = entries[0];
      need(entries.length === 1 && entry !== undefined, "raw history record framing differs");
      if (entry.header["type"] === "DOCHEAD" && entry.body?.["uuid"] === uuid) {
        maximum = Math.max(maximum, headerSchema.parse(entry.body).updateTime);
      }
      scanned += Buffer.byteLength(line);
      if (scanned >= 65_536) { scanned = 0; await yieldProofEventLoop(); }
    }
    await yieldProofEventLoop();
  }
  need(maximum >= 0, "target raw header is missing"); return maximum;
}
function structure(before: Inventory, branchUuid: string): string {
  const owner = table(before, "project_structures"), rows = owner.rows.filter(row => text(field(owner, row, "branch_uuid")) === branchUuid);
  const first = rows[0]; need(first !== undefined, "selected structure is missing");
  const result = text(field(owner, first, "structure"));
  need(rows.every(row => text(field(owner, row, "structure")) === result), "selected structures disagree"); return result;
}
function actor(before: Inventory, uuid: string): Prepared["actor"] {
  const users = table(before, "users"); need(users.rows.length <= 4096, "user inventory exceeds bound");
  const rows = users.rows.filter(row => text(field(users, row, "uuid")) === uuid), selected = rows[0];
  need(rows.length <= 1, "backend actor is ambiguous");
  return Object.freeze({ uuid, username: selected === undefined ? "" : text(field(users, selected, "username")),
    nickname: selected === undefined ? "" : text(field(users, selected, "nickname")) });
}
function peers(decoded: Decoded, structureText: string, targetUuid: string, desiredTitle: string): readonly Readonly<Peer>[] {
  const tree: unknown = JSON.parse(structureText); need(isRecord(tree) && isRecord(tree["pcbs"]), "PCB structure is missing");
  const collection = tree["pcbs"], values: Peer[] = [];
  for (const document of decoded.history.documents.filter(value => value.docType === "PCB" && !isNativeDocumentDeleted(value))) {
    const current = pcb(document), entry = collection[document.uuid];
    need(isRecord(entry) && entry["uuid"] === document.uuid && entry["title"] === current.metadata.title &&
      entry["board"] === current.metadata.board && entry["source"] === "" && entry["parent_uuid"] === "" &&
      entry["version"] === current.header.version && entry["updateTime"] === current.header.updateTime &&
      (entry["docType"] === undefined || entry["docType"] === 3), "complete PCB peer history/tree differs");
    // Worker b849bd12 Sg.updateData at1906142 defaults renameKey=false. Its
    // Method getDataByTitle at1903167 uses Ne at1845057, which conditionally
    // Selects locale lowercasing. This is an adapter collision screen only;
    // The original native reader must apply the actual policy before dispatch.
    need(document.uuid === targetUuid || current.metadata.title.toLowerCase() !== desiredTitle.toLowerCase(), "peer PCB name collision");
    values.push({ uuid: document.uuid, title: current.metadata.title, board: current.metadata.board,
      metadataSha256: sha256Text(current.text), headerSha256: sha256Json(document.metadata) });
  }
  need(values.length <= 4096 && values.length === Object.keys(collection).length, "complete PCB peer membership differs");
  return freezeDeep(values);
}
async function projections(prepared: Prepared, documentTime: number, backendTime: number): Promise<Readonly<{
  history: ReturnType<typeof prepareCurrentPcbRenameHistory>; structure: ReturnType<typeof prepareCurrentPcbRenameStructure>;
  sql: Awaited<ReturnType<typeof prepareCurrentPcbRenameSql>>;
}>> {
  const { witness, target, header } = prepared;
  const history = prepareCurrentPcbRenameHistory({ targetUuid: target.pcbUuid, beforeMetaText: prepared.beforeMetaText, desiredTitle: prepared.desiredTitle,
    maximumTargetHeaderTime: prepared.maximumTargetHeaderTime, client: witness.client, maximumTicket: prepared.maximumTicket, documentTime, backendTime,
    documentClock: { minimumMs: witness.documentClockMinMs, maximumMs: witness.documentClockMaxMs },
    backendClock: { minimumMs: witness.backendClockMinMs, maximumMs: witness.backendClockMaxMs }, backendActor: prepared.actor });
  const projected = prepareCurrentPcbRenameStructure({ structureText: prepared.structureText, targetUuid: target.pcbUuid, expectedOwnerUuid: target.ownerUuid,
    expectedBefore: { title: metadataSchema.parse(JSON.parse(prepared.beforeMetaText)).title, version: header.version, updateTime: header.updateTime },
    desiredTitle: prepared.desiredTitle, documentTime });
  const sql = await prepareCurrentPcbRenameSql({ before: prepared.before, historyProjection: history, structureProjection: projected, witness });
  return Object.freeze({ history, structure: projected, sql });
}

/** Freeze intention before mutation. The maximum clock endpoints reserve exact
 * Worst-case decimal lengths through the maintained history/SQL serializers.
 * They are budget values only, not a claim about a generated native timestamp.
 */
export async function prepareCurrentPcbRename(input: Readonly<{ before: Inventory; target: z.infer<typeof targetSchema>;
  desiredTitle: string; witness: CurrentPcbRenameSqlWitness }>): Promise<CurrentPcbRenamePreparation> {
  const captured = data(input, ["before", "target", "desiredTitle", "witness"]); const before = input.before;
  need(captured["before"] === before, "original SQL inventory changed");
  const completion = readerCompletion(before), target = freezeDeep(targetSchema.parse(data(captured["target"])));
  const rawWitness = data(captured["witness"]), witness = freezeDeep(witnessSchema.parse({ ...rawWitness,
    ...(rawWitness["agedHead"] === undefined ? {} : { agedHead: data(rawWitness["agedHead"]) }) }));
  const desiredTitle = title.parse(captured["desiredTitle"]);
  need(witness.projectUuid === target.projectUuid && witness.branchUuid === target.branchUuid, "clock witness target differs");
  // This decoder is document-type neutral. No SYMBOL plan or private lifecycle
  // Token is relabeled as a PCB preparation.
  const decoded = await decodeCurrentSymbolPreEditHistory(before, { projectUuid: target.projectUuid, branchUuid: target.branchUuid });
  need(decoded.history.projectOwnerUuid === target.ownerUuid, "project owner differs");
  const matches = decoded.history.documents.filter(document => document.uuid === target.pcbUuid); const document = matches[0];
  need(matches.length === 1 && document !== undefined, "unique target is missing");
  const current = pcb(document), maximumTargetHeaderTime = await maximumHeader(decoded, target.pcbUuid);
  need(desiredTitle !== current.metadata.title && witness.documentClockMinMs > maximumTargetHeaderTime,
    "unchanged title or document clock window overlaps prior headers");
  const structureText = structure(before, target.branchUuid); const pcbPeers = peers(decoded, structureText, target.pcbUuid, desiredTitle);
  const prepared: Prepared = Object.freeze({ before, target, desiredTitle, beforeMetaText: current.text, structureText, header: freezeDeep(current.header),
    maximumTicket: decoded.maximumTicket, maximumTargetHeaderTime, witness, actor: actor(before, witness.backendActorUuid) });
  const reserved = await projections(prepared, witness.documentClockMaxMs, witness.backendClockMaxMs);
  const body = freezeDeep({ profile: "private.current-pcb-rename-preparation.v1" as const, target, desiredTitle, beforeMetaText: current.text,
    baseline: { sqlSha256: before.logicalSha256, checkpointSha256: before.checkpointSha256, historySha256: decoded.history.semanticSha256,
      rawHistorySha256: sha256Json(decoded.links), targetSourceSha256: document.semanticSha256, targetHeaderSha256: sha256Json(document.metadata),
      headHistoryUuid: decoded.history.headHistoryUuid, maximumTicket: decoded.maximumTicket, maximumTargetHeaderTime,
      documentCount: decoded.history.documents.length, historyRows: decoded.history.historyRowCount, chunks: decoded.history.chunkCount },
    peers: pcbPeers, witness, capacity: { maximumPlaintextBytes: reserved.sql.maximumPlaintextBytes,
      maximumCiphertextBase64Bytes: reserved.sql.maximumCiphertextBase64Bytes, maximumEncodedSqlBytes: reserved.sql.maximumEncodedSqlBytes }, ...LIMITATIONS });
  need(Buffer.byteLength(JSON.stringify(body)) <= 1_048_576, "serialized preparation capacity exceeded");
  need(readerCompletion(before) === completion, "original SQL reader changed");
  const result = Object.freeze({ ...body, preparationSha256: sha256Json(body) }); preparations.set(result, prepared); return result;
}

/** Bind supplied exact observed times to the original immutable intent, never
 * Choose intended title/baseline/actor from a post-write state. This remains a
 * Data comparator. A future retained issuer must prove timestamp provenance.
 */
export async function bindCurrentPcbRenameTimes(preparation: CurrentPcbRenamePreparation, input: unknown): ReturnType<typeof projections> {
  const prepared = preparations.get(preparation); need(prepared !== undefined, "original PCB preparation required");
  const observed = z.object({ documentTime: time, backendTime: time }).strict().parse(data(input, ["documentTime", "backendTime"]));
  const result = await projections(prepared, observed.documentTime, observed.backendTime);
  for (const key of ["maximumPlaintextBytes", "maximumCiphertextBase64Bytes", "maximumEncodedSqlBytes"] as const) {
    need(result.sql[key] <= preparation.capacity[key], "observed times exceed reserved capacity");
  }
  need(preparations.get(preparation) === prepared && canonicalJson(preparation.witness) === canonicalJson(prepared.witness), "original PCB preparation changed");
  return result;
}
