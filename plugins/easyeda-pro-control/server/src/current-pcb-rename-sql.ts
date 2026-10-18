/** Dormant complete logical SQL relation for one ordinary PCB title change.
 * Supplied clocks/actors and sealed pure projections are comparison inputs,
 * never native ownership, dispatch permission or queue-completion evidence.
 */
import { z } from "zod";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { canonicalJson, isRecord, sha256Text } from "./core.ts";
import { verifyCurrentPcbRenameHistory } from "./current-pcb-rename-history.ts";
import type { CurrentPcbRenameHistoryProjection } from "./current-pcb-rename-history.ts";
import { prepareCurrentPcbRenameStructureSql } from "./current-pcb-rename-structure-sql.ts";
import { decodeNativeHistoryChunk, isNativeDocumentDeleted, parseNativeRecords } from "./native-history.ts";
import { nativeProjectSymbolSqlSchema } from "./native-project-sql-schema.ts";
import { MAX_ENCODED_BYTES } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type CurrentPcbRenameStructureProjection = Parameters<typeof prepareCurrentPcbRenameStructureSql>[0]["projection"];
type Values = Readonly<Record<string, string | bigint | null>>;
const UUID = /^[a-f0-9]{32}$/u, UUID_V4 = /^[a-f0-9]{12}4[a-f0-9]{3}[89ab][a-f0-9]{15}$/u;
const integerSchema = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine((value) => !Object.is(value, -0));
const timeSchema = integerSchema.max(8_640_000_000_000_000);
const offsetSchema = z.number().int().min(-840).max(840).refine((value) => !Object.is(value, -0));
const witnessSchema = z.object({ projectUuid: z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u), branchUuid: z.string().regex(UUID),
  backendActorUuid: z.string().regex(UUID), client: z.string().regex(/^[a-f0-9]{16}$/u),
  documentClockMinMs: timeSchema, documentClockMaxMs: timeSchema, backendClockMinMs: timeSchema, backendClockMaxMs: timeSchema,
  backendLocalOffsetMinutes: offsetSchema, agedHead: z.object({ createdAtLiteral: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u),
    nativeParsedLocalMs: timeSchema, nativeTimezoneOffsetMinutes: offsetSchema }).strict().optional(),
}).strict().refine((value) => value.documentClockMaxMs >= value.documentClockMinMs && value.documentClockMaxMs - value.documentClockMinMs <= 60_000 &&
  value.backendClockMaxMs >= value.backendClockMinMs && value.backendClockMaxMs - value.backendClockMinMs <= 60_000);
export type CurrentPcbRenameSqlWitness = z.infer<typeof witnessSchema>;
const headerSchema = z.object({ docType: z.literal("PCB"), client: z.string().regex(/^[a-f0-9]{16}$/u),
  uuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u), updateTime: timeSchema, version: z.string().min(1).max(128),
  editVersion: z.string().min(1).max(128).optional() }).strict();
const LIMITATIONS = Object.freeze({ executionAuthorized: false, producerBindingVerified: false, actorProvenanceVerified: false,
  clockProvenanceVerified: false, queueCompletionVerified: false, generationClosureVerified: false,
  persistentUploadReplayExcluded: false, reopened: false } as const);
export interface CurrentPcbRenameSqlPlan extends Readonly<typeof LIMITATIONS> {
  readonly profile: "private.current-pcb-rename-sql-plan.v1";
  readonly beforeSqlSha256: string;
  readonly targetUuid: string;
  readonly expectedTicket: number;
  readonly updatedStructureRows: number;
  readonly headEligibility: "locked" | "aged-unlocked";
  readonly originalDocumentCount: number;
  readonly originalHistoryRows: number;
  readonly originalHistoryChunks: number;
  readonly maximumPlaintextBytes: number;
  readonly maximumCiphertextBase64Bytes: number;
  readonly maximumEncodedSqlBytes: number;
}
interface Prepared {
  readonly before: Inventory;
  readonly historyProjection: CurrentPcbRenameHistoryProjection;
  readonly structureProjection: CurrentPcbRenameStructureProjection;
  readonly witness: CurrentPcbRenameSqlWitness;
  readonly project: SqlRow;
  readonly branch: SqlRow;
  readonly structures: readonly SqlRow[];
  readonly history: SqlTable;
  readonly data: SqlTable;
  readonly structureTable: SqlTable;
  readonly oldHead: string;
  readonly historyId: bigint;
  readonly chunkId: bigint;
  readonly sequence: SqlRow;
}
const plans = new WeakMap<CurrentPcbRenameSqlPlan, Prepared>();
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(`Current PCB rename SQL: ${message}`); } }
function fields(value: unknown, names?: readonly string[]): Record<string, unknown> {
  need(isRecord(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null), "plain input required");
  const keys = Reflect.ownKeys(value);
  need(keys.length <= 12 && keys.every((key) => typeof key === "string" && (names === undefined || names.includes(key))), "input keys differ");
  if (names !== undefined) { need(keys.length === names.length, "input keys missing"); }
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(typeof key === "string" && descriptor !== undefined && Object.hasOwn(descriptor, "value"), "input accessors refused");
    Object.defineProperty(result, key, { value: descriptor.value as unknown, enumerable: true });
  }
  return result;
}
function captureWitness(value: unknown): CurrentPcbRenameSqlWitness {
  const captured = fields(value), result = witnessSchema.parse({ ...captured,
    ...(captured["agedHead"] === undefined ? {} : { agedHead: fields(captured["agedHead"]) }) });
  // SQL defaults and local project bookkeeping use four-digit calendar years.
  // Reserve their representable range now, including an offset crossing a year.
  for (const time of [result.backendClockMinMs, result.backendClockMaxMs]) {
    for (const offset of [0, result.backendLocalOffsetMinutes * 60_000]) {
      const date = new Date(time + offset);
      need(Number.isFinite(date.getTime()) && /^\d{4}-\d{2}-\d{2}T/u.test(date.toISOString()), "backend SQL calendar capacity exceeded");
    }
  }
  if (result.agedHead !== undefined) { Object.freeze(result.agedHead); } return Object.freeze(result);
}
function text(value: SqlCell | undefined): string {
  need(value?.kind === "text", "expected SQL TEXT"); const bytes = Buffer.from(value.hex, "hex"), result = bytes.toString("utf8");
  need(Buffer.from(result).equals(bytes), "SQL text is not exact UTF8"); return result;
}
function integer(value: SqlCell | null | undefined): bigint { need(value?.kind === "integer", "expected SQL INTEGER"); return BigInt(value.decimal); }
function table(inventory: Inventory, name: string): SqlTable {
  const matches = inventory.tables.filter((entry) => entry.name === name);
  need(matches.length === 1 && matches[0] !== undefined, "required table is not unique"); return matches[0];
}
function field(owner: SqlTable, row: SqlRow, name: string): SqlCell {
  const index = owner.columns.findIndex((column) => column["name"] === name), value = row.cells[index];
  need(index !== -1 && value !== undefined, "required column missing"); return value;
}
function unique(owner: SqlTable, name: string, expected: string): SqlRow {
  const matches = owner.rows.filter((row) => text(field(owner, row, name)) === expected);
  need(matches.length === 1 && matches[0] !== undefined, "required row identity is not unique"); return matches[0];
}
function cell(value: string | bigint | null): SqlCell {
  if (value === null) { return { kind: "null" }; }
  return typeof value === "bigint" ? { kind: "integer", decimal: value.toString() } : { kind: "text", hex: Buffer.from(value).toString("hex") };
}
function patch(owner: SqlTable, row: SqlRow, values: Values): SqlRow {
  need(Object.keys(values).every((name) => owner.columns.some((column) => column["name"] === name)), "unknown projected column");
  return { ...row, cells: row.cells.map((original, index) => {
    const name = owner.columns[index]?.["name"]; need(typeof name === "string", "column name missing");
    return Object.hasOwn(values, name) ? cell(values[name] ?? null) : original;
  }) };
}
function insert(owner: SqlTable, id: bigint, values: Values): SqlRow {
  need(owner.columns.length === Object.keys(values).length, "insert must supply every column");
  return patch(owner, { rowid: cell(id), cells: owner.columns.map(() => ({ kind: "null" })) }, values);
}
function maximumId(owner: SqlTable): bigint {
  let maximum = 0n;
  for (const row of owner.rows) {
    const id = integer(field(owner, row, "id")); need(id > 0n && integer(row.rowid) === id, "positive ID/rowid association differs");
    if (id > maximum) { maximum = id; }
  }
  need(maximum < BigInt(Number.MAX_SAFE_INTEGER), "allocation capacity exhausted"); return maximum;
}
function supported(inventory: Inventory, branchUuid: string): void {
  const completion = readerCompletion(inventory);
  need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null, "original completed SQL reader required");
  need(canonicalJson(inventory.schema) === canonicalJson(nativeProjectSymbolSqlSchema(branchUuid).entries), "fixed native schema differs");
  // oxlint-disable-next-line unicorn/text-encoding-identifier-case -- Exact SQLite PRAGMA spelling.
  need(inventory.properties["encoding"] === "UTF-8", "native SQL encoding differs");
}
function wallMs(value: string): number {
  need(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(value), "SQL timestamp syntax differs");
  const result = Date.parse(`${value.replace(" ", "T")}Z`);
  need(Number.isFinite(result) && new Date(result).toISOString().slice(0, 19).replace("T", " ") === value, "SQL timestamp calendar differs"); return result;
}
function headEligibility(head: SqlRow, owner: SqlTable, witness: CurrentPcbRenameSqlWitness): CurrentPcbRenameSqlPlan["headEligibility"] {
  const locked = integer(field(owner, head, "is_lock")); need(locked === 0n || locked === 1n, "history lock refused");
  if (locked === 1n) { need(witness.agedHead === undefined, "locked head cannot consume age witness"); return "locked"; }
  const age = witness.agedHead;
  need(age !== undefined && age.createdAtLiteral === text(field(owner, head, "created_at")) &&
    age.nativeTimezoneOffsetMinutes === -witness.backendLocalOffsetMinutes &&
    Math.abs(age.nativeParsedLocalMs - wallMs(age.createdAtLiteral)) <= 840 * 60_000, "independently bound native head age required");
  const adjusted = age.nativeParsedLocalMs - age.nativeTimezoneOffsetMinutes * 60_000;
  need(Number.isSafeInteger(adjusted) && witness.backendClockMinMs - adjusted >= 61_000, "head is not aged throughout the selection window"); return "aged-unlocked";
}
function branchParent(before: Inventory, branch: SqlRow, witness: CurrentPcbRenameSqlWitness): void {
  const branches = table(before, "branches"), parent = field(branches, branch, "parent_uuid");
  if (parent.kind === "null") { return; }
  const uuid = text(parent); need(UUID.test(uuid) && uuid !== witness.branchUuid, "branch parent identity refused");
  const start = unique(branches, "uuid", uuid);
  need(text(field(branches, start, "name")) === "start" && integer(field(branches, start, "node")) === 1n &&
    integer(field(branches, start, "delete_status")) === 0n && text(field(branches, start, "project_uuid")) === witness.projectUuid &&
    field(branches, start, "parent_uuid").kind === "null" && field(branches, start, "history_uuid").kind === "null", "branch parent is not the empty terminal start node");
}
function actor(before: Inventory, uuid: string): { username: string; nickname: string } {
  const users = table(before, "users"); need(users.rows.length <= 4096, "project user bound exceeded");
  const matches = users.rows.filter((row) => text(field(users, row, "uuid")) === uuid); need(matches.length <= 1, "project actor is ambiguous");
  const row = matches[0];
  return { username: row === undefined ? "" : text(field(users, row, "username")), nickname: row === undefined ? "" : text(field(users, row, "nickname")) };
}
function originalHistory(history: CurrentPcbRenameHistoryProjection): void {
  need(history !== null && typeof history === "object", "original history projection required");
  const descriptor = Object.getOwnPropertyDescriptor(history, "chunkText");
  need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "history projection accessor refused");
  verifyCurrentPcbRenameHistory(history, descriptor.value);
}
function bindProjections(history: CurrentPcbRenameHistoryProjection, structure: CurrentPcbRenameStructureProjection, witness: CurrentPcbRenameSqlWitness, before: Inventory): void {
  originalHistory(history);
  need(history.targetUuid === structure.targetUuid && history.documentTime === structure.documentTime, "history/structure identity or clock differs");
  need(history.documentTime >= witness.documentClockMinMs && history.documentTime <= witness.documentClockMaxMs &&
    history.backendTime >= witness.backendClockMinMs && history.backendTime <= witness.backendClockMaxMs, "projection clock lies outside separate witness bounds");
  const selectedActor = actor(before, witness.backendActorUuid);
  const expectedEdit = `{"type":"EDIT_HEAD"}||${JSON.stringify({ uuid: witness.backendActorUuid, username: selectedActor.username,
    nickname: selectedActor.nickname, updateTime: history.backendTime })}`;
  const header = `{"type":"DOCHEAD","ticket":${history.expectedTicket}}||${JSON.stringify({ docType: "PCB", client: witness.client,
    uuid: history.targetUuid, updateTime: history.documentTime, version: String(history.documentTime), editVersion: "3.2.206" })}`;
  need(history.chunkText === `${expectedEdit}|\n${header}|\n{"type":"META","ticket":${history.expectedTicket},"id":"META"}||${history.afterMetaText}`,
    "projection actor/client or exact native framing differs");
}
async function bindHistory(before: Inventory, history: CurrentPcbRenameHistoryProjection, structure: CurrentPcbRenameStructureProjection, witness: CurrentPcbRenameSqlWitness): Promise<{
  documentCount: number; historyRows: number; chunks: number;
}> {
  // This decoder is document-type neutral; no symbol plan/authority is reused.
  const decoded = await decodeCurrentSymbolPreEditHistory(before, { projectUuid: witness.projectUuid, branchUuid: witness.branchUuid });
  need(decoded.maximumTicket + 1 === history.expectedTicket, "next ticket differs from complete raw history");
  need(decoded.history.historyRowCount < 64 && decoded.history.chunkCount < 4096 && decoded.history.plaintextBytes + Buffer.byteLength(history.chunkText) <= 8_388_608,
    "post-append complete-history capacity exceeded");
  const targets = decoded.history.documents.filter((document) => document.uuid === history.targetUuid);
  const target = targets[0];
  need(targets.length === 1 && target !== undefined && target.docType === "PCB" && !isNativeDocumentDeleted(target), "active ordinary PCB target missing");
  const header = headerSchema.parse(target.metadata);
  const metadata = target.records.filter((entry) => entry.id === "META" || entry.type === "META");
  need(metadata.length === 1 && metadata[0]?.id === "META" && metadata[0].type === "META" && JSON.stringify(metadata[0].body) === history.beforeMetaText,
    "original exact PCB metadata differs");
  const afterTree: unknown = JSON.parse(structure.afterStructureText), beforeTree: unknown = JSON.parse(structure.beforeStructureText);
  need(isRecord(beforeTree) && isRecord(beforeTree["pcbs"]) && isRecord(afterTree) && isRecord(afterTree["pcbs"]), "structure PCB collections missing");
  const newPcb = afterTree["pcbs"][history.targetUuid], oldPcb = beforeTree["pcbs"][history.targetUuid];
  const newMeta: unknown = JSON.parse(history.afterMetaText), oldMeta = metadata[0].body;
  need(isRecord(oldPcb) && isRecord(newPcb) && isRecord(newMeta) && header.uuid === history.targetUuid &&
    oldPcb["title"] === oldMeta["title"] && oldPcb["board"] === oldMeta["board"] && oldPcb["parent_uuid"] === oldMeta["parent"] && oldPcb["source"] === oldMeta["source"] &&
    oldPcb["version"] === header.version && oldPcb["updateTime"] === header.updateTime && (oldPcb["docType"] === undefined || oldPcb["docType"] === 3) &&
    newPcb["title"] === newMeta["title"], "history and complete structure baseline/projection disagree");
  let scannedBytes = 0, scannedRows = 0;
  for (const chunk of decoded.chunks) {
    for (const line of chunk.split("|\n")) {
      const entries = parseNativeRecords(line), entry = entries[0];
      need(entries.length === 1 && entry !== undefined, "raw history framing differs");
      if (entry.header["type"] === "DOCHEAD" && entry.body?.["uuid"] === history.targetUuid) {
        const previous = headerSchema.parse(entry.body);
        need(history.documentTime > previous.updateTime, "new clock must exceed every prior target header");
      }
      scannedRows += 1; scannedBytes += Buffer.byteLength(line);
      if (scannedRows >= 128 || scannedBytes >= 65_536) { scannedRows = 0; scannedBytes = 0; await yieldProofEventLoop(); }
    }
    await yieldProofEventLoop();
  }
  return { documentCount: decoded.history.documents.length, historyRows: decoded.history.historyRowCount, chunks: decoded.history.chunkCount };
}
function budget(prepared: Prepared): Pick<CurrentPcbRenameSqlPlan, "maximumPlaintextBytes" | "maximumCiphertextBase64Bytes" | "maximumEncodedSqlBytes"> {
  const maximumPlaintextBytes = Buffer.byteLength(prepared.historyProjection.chunkText);
  const fixed = maximumPlaintextBytes + Math.floor(maximumPlaintextBytes / 8) + Math.floor(maximumPlaintextBytes / 256) + Math.floor(maximumPlaintextBytes / 512) + 4;
  const stored = maximumPlaintextBytes + Math.floor(maximumPlaintextBytes / 32) + Math.floor(maximumPlaintextBytes / 128) + Math.floor(maximumPlaintextBytes / 2048) + 7;
  const maximumCiphertextBase64Bytes = 4 * Math.ceil((Math.max(fixed, stored) + 34) / 3);
  need(maximumCiphertextBase64Bytes <= 2_097_152, "new history SQL cell capacity exceeded");
  const large = BigInt(Number.MAX_SAFE_INTEGER), uuid = "0".repeat(32), wall = "2000-01-01 00:00:00";
  const additions = [insert(prepared.history, large, { id: large, uuid, parent: uuid, snapshot: null, key: uuid, is_lock: 0n,
    num: 0n, created_at: wall, updated_at: wall, lock_time: "1970-01-01 08:00:00", snapshot_num: 0n }),
  insert(prepared.data, large, { id: large, uuid, history_uuid: uuid, dataStr: "A".repeat(maximumCiphertextBase64Bytes), created_at: wall, updated_at: wall })];
  let growth = additions.reduce((sum, row) => sum + Buffer.byteLength(JSON.stringify(row)) + 1, 0);
  for (const value of [wall, prepared.witness.backendActorUuid, uuid, large]) { growth += Buffer.byteLength(JSON.stringify(cell(value))); }
  growth += prepared.structures.length * (Buffer.byteLength(JSON.stringify(cell(large))) + Buffer.byteLength(JSON.stringify(cell(prepared.structureProjection.afterStructureText))));
  const rows = prepared.before.tables.reduce((sum, owner) => sum + owner.rows.length, 0) + 2;
  const cells = prepared.before.tables.reduce((sum, owner) => sum + owner.rows.length * (owner.columns.length + (owner.withoutRowid ? 0 : 1)), 0) +
    additions.reduce((sum, row) => sum + row.cells.length + 1, 0);
  const maximumEncodedSqlBytes = Buffer.byteLength(JSON.stringify(prepared.before)) + growth;
  need(rows <= 100_000 && cells <= 250_000 && maximumEncodedSqlBytes <= MAX_ENCODED_BYTES, "complete SQL reader capacity exceeded");
  return { maximumPlaintextBytes, maximumCiphertextBase64Bytes, maximumEncodedSqlBytes };
}

/** APP52f51ce4 new-head transaction plus separate xB bookkeeping and structure
 * UPDATE. The closed source, original backend, retained worker and quiescent
 * native producers must be established by a future coordinator, not this plan.
 * Both projections already contain exact supplied timestamps. This is therefore
 * a supplied-evidence comparison plan, not an executable pre-dispatch plan. A
 * future issuer must freeze intended metadata and clock windows before dispatch
 * and derive exact times only from its original retained native evidence.
 */
export async function prepareCurrentPcbRenameSql(input: Readonly<{ before: Inventory; historyProjection: CurrentPcbRenameHistoryProjection;
  structureProjection: CurrentPcbRenameStructureProjection; witness: CurrentPcbRenameSqlWitness }>): Promise<CurrentPcbRenameSqlPlan> {
  const captured = fields(input, ["before", "historyProjection", "structureProjection", "witness"]);
  const before = input.before, historyProjection = input.historyProjection, structureProjection = input.structureProjection;
  need(captured["before"] === before && captured["historyProjection"] === historyProjection && captured["structureProjection"] === structureProjection, "input identity changed");
  const witness = captureWitness(captured["witness"]); supported(before, witness.branchUuid); originalHistory(historyProjection);
  const completion = readerCompletion(before);
  const structurePlan = await prepareCurrentPcbRenameStructureSql({ before, projection: structureProjection, projectUuid: witness.projectUuid,
    branchUuid: witness.branchUuid, ticket: historyProjection.expectedTicket });
  bindProjections(historyProjection, structureProjection, witness, before);
  const baseline = await bindHistory(before, historyProjection, structureProjection, witness);
  const branches = table(before, "branches"), projects = table(before, "projects");
  need(projects.rows.length === 1, "native all-project bookkeeping requires one project row");
  const branch = unique(branches, "uuid", witness.branchUuid), project = unique(projects, "uuid", witness.projectUuid); branchParent(before, branch, witness);
  const history = table(before, `project_history_${witness.branchUuid}`), oldHead = text(field(branches, branch, "history_uuid"));
  const eligibility = headEligibility(unique(history, "uuid", oldHead), history, witness);
  const data = table(before, "history_data"), sequenceTable = table(before, "sqlite_sequence");
  const sequence = unique(sequenceTable, "name", "history_data");
  const sequenceValue = integer(field(sequenceTable, sequence, "seq"));
  need(sequenceValue >= maximumId(data) && sequenceValue < BigInt(Number.MAX_SAFE_INTEGER), "AUTOINCREMENT capacity exhausted");
  const structureTable = table(before, "project_structures"), structures = structureTable.rows.filter((row) => text(field(structureTable, row, "branch_uuid")) === witness.branchUuid);
  need(structures.length === structurePlan.updatedStructureRows, "structure relation changed");
  const prepared: Prepared = { before, historyProjection, structureProjection, witness, project, branch, structures, history, data, structureTable, oldHead,
    historyId: maximumId(history) + 1n, chunkId: sequenceValue + 1n, sequence };
  const capacities = budget(prepared); supported(before, witness.branchUuid); need(readerCompletion(before) === completion, "original SQL reader changed");
  const plan: CurrentPcbRenameSqlPlan = Object.freeze({ profile: "private.current-pcb-rename-sql-plan.v1", beforeSqlSha256: before.logicalSha256,
    targetUuid: historyProjection.targetUuid, expectedTicket: historyProjection.expectedTicket, updatedStructureRows: structures.length,
    headEligibility: eligibility, originalDocumentCount: baseline.documentCount, originalHistoryRows: baseline.historyRows,
    originalHistoryChunks: baseline.chunks, ...capacities, ...LIMITATIONS });
  plans.set(plan, prepared); return plan;
}
function newRow(owner: SqlTable, id: bigint): SqlRow {
  const matches = owner.rows.filter((row) => integer(field(owner, row, "id")) === id);
  need(matches.length === 1 && matches[0] !== undefined, "exact newly allocated row missing"); return matches[0];
}
function sqlTime(value: string, witness: CurrentPcbRenameSqlWitness, local = false): string {
  const utc = wallMs(value) - (local ? witness.backendLocalOffsetMinutes * 60_000 : 0);
  need(utc >= Math.floor(witness.backendClockMinMs / 1000) * 1000 && utc <= Math.floor(witness.backendClockMaxMs / 1000) * 1000,
    "SQL timestamp lies outside independent backend clock bounds"); return value;
}
function sameCell(left: SqlCell, right: SqlCell | undefined): boolean {
  if (left.kind !== right?.kind) { return false; } if (left.kind === "null") { return true; }
  if (left.kind === "integer") { return right.kind === "integer" && left.decimal === right.decimal; }
  if (left.kind === "real") { return right.kind === "real" && left.ieee754le === right.ieee754le; }
  return (right.kind === "blob" || right.kind === "text") && left.hex === right.hex;
}
async function exactRows(expected: readonly SqlRow[], observed: readonly SqlRow[], name: string): Promise<void> {
  need(expected.length === observed.length, `row count differs in ${name}`);
  const pending = new Map<string, SqlRow>(); let cells = 0, encodedBytes = 0;
  for (const row of expected) {
    need(row.rowid?.kind === "integer" && !pending.has(row.rowid.decimal), "source rowid identity differs"); pending.set(row.rowid.decimal, row);
    cells += 1; if (cells >= 128) { cells = 0; await yieldProofEventLoop(); }
  }
  for (const row of observed) {
    need(row.rowid?.kind === "integer", "observed rowid identity differs"); const wanted = pending.get(row.rowid.decimal);
    need(wanted !== undefined && wanted.cells.length === row.cells.length, `row identity differs in ${name}`);
    for (const [index, value] of wanted.cells.entries()) {
      need(sameCell(value, row.cells[index]), `full SQL delta differs in ${name}`); cells += 1;
      encodedBytes += value.kind === "text" || value.kind === "blob" ? value.hex.length : 32;
      if (cells >= 128 || encodedBytes >= 65_536) { cells = 0; encodedBytes = 0; await yieldProofEventLoop(); }
    }
    pending.delete(row.rowid.decimal);
  }
  need(pending.size === 0, `row multiplicity differs in ${name}`);
}

/** Observe only native-generated UUID/key/ciphertext and bounded SQL default
 * times. All intended document/structure bytes and row allocation are fixed by
 * preparation. Matching SQL cannot establish original producer or completion.
 */
export async function verifyCurrentPcbRenameSql(plan: CurrentPcbRenameSqlPlan, after: Inventory): Promise<Readonly<Record<string, unknown>>> {
  const prepared = plans.get(plan); need(prepared !== undefined, "original prepared PCB SQL plan required");
  const { before, historyProjection, structureProjection, witness, history, data, structureTable } = prepared;
  supported(before, witness.branchUuid); supported(after, witness.branchUuid);
  const afterCompletion = readerCompletion(after), beforeCompletion = readerCompletion(before);
  need(canonicalJson(before.properties) === canonicalJson(after.properties), "persisted SQL properties changed");
  const afterData = table(after, "history_data"), afterHistory = table(after, history.name);
  const chunk = newRow(afterData, prepared.chunkId), head = newRow(afterHistory, prepared.historyId);
  const headUuid = text(field(afterHistory, head, "uuid")), key = text(field(afterHistory, head, "key"));
  need(UUID_V4.test(headUuid) && UUID.test(key) && !history.rows.some((row) => text(field(history, row, "uuid")) === headUuid) &&
    !data.rows.some((row) => text(field(data, row, "uuid")).split("-")[0] === headUuid || text(field(data, row, "history_uuid")) === headUuid), "new history UUID/key invalid or colliding");
  const encoded = text(field(afterData, chunk, "dataStr")); need(encoded.length <= plan.maximumCiphertextBase64Bytes, "history encoding exceeds reserved capacity");
  const plaintext = await decodeNativeHistoryChunk({ historyUuid: headUuid, keyHex: key, dataBase64: encoded });
  need(Buffer.byteLength(plaintext) <= plan.maximumPlaintextBytes, "history plaintext exceeds reserved capacity");
  verifyCurrentPcbRenameHistory(historyProjection, plaintext);
  const chunkTime = sqlTime(text(field(afterData, chunk, "created_at")), witness), headTime = sqlTime(text(field(afterHistory, head, "created_at")), witness);
  const branches = table(before, "branches"), projects = table(before, "projects"), sequence = table(before, "sqlite_sequence");
  const afterProjects = table(after, "projects"), projectAfter = unique(afterProjects, "uuid", witness.projectUuid);
  const projectTime = sqlTime(text(field(afterProjects, projectAfter, "updated_at")), witness, true);
  const expected = new Map<string, readonly SqlRow[]>([[history.name, [...history.rows, insert(history, prepared.historyId,
    { id: prepared.historyId, uuid: headUuid, parent: prepared.oldHead, snapshot: null, key, is_lock: 0n, num: 0n,
      created_at: headTime, updated_at: headTime, lock_time: "1970-01-01 08:00:00", snapshot_num: 0n })]],
  ["history_data", [...data.rows, insert(data, prepared.chunkId, { id: prepared.chunkId, uuid: headUuid, history_uuid: headUuid,
    dataStr: encoded, created_at: chunkTime, updated_at: chunkTime })]],
  ["projects", [patch(projects, prepared.project, { updated_at: projectTime, modifier_uuid: witness.backendActorUuid })]],
  ["branches", branches.rows.map((row) => row === prepared.branch ? patch(branches, row, { history_uuid: headUuid }) : row)],
  ["project_structures", structureTable.rows.map((row) => prepared.structures.includes(row) ? patch(structureTable, row,
    { ticket: BigInt(plan.expectedTicket), structure: structureProjection.afterStructureText }) : row)],
  ["sqlite_sequence", sequence.rows.map((row) => row === prepared.sequence ? patch(sequence, row, { seq: prepared.chunkId }) : row)]]);
  need(before.tables.length === after.tables.length, "SQL table inventory changed");
  for (const prior of before.tables) {
    const observed = table(after, prior.name);
    need(!prior.withoutRowid && !observed.withoutRowid && prior.strict === observed.strict && canonicalJson(prior.columns) === canonicalJson(observed.columns),
      `SQL descriptor differs in ${prior.name}`);
    await exactRows(expected.get(prior.name) ?? prior.rows, observed.rows, prior.name); await yieldProofEventLoop();
  }
  need(readerCompletion(before) === beforeCompletion && readerCompletion(after) === afterCompletion && plans.get(plan) === prepared, "original proof inputs changed");
  return Object.freeze({ profile: "private.current-pcb-rename-full-sql-effect.v1", exactLogicalSqlEffect: true, wholeRenameSqlEffectVerified: true,
    beforeSqlSha256: before.logicalSha256, afterSqlSha256: after.logicalSha256, headEligibility: plan.headEligibility,
    expectedPlaintextSha256: sha256Text(plaintext), generatedCiphertextSha256: sha256Text(encoded), newHistoryUuid: headUuid,
    newHistoryId: prepared.historyId.toString(), newChunkId: prepared.chunkId.toString(), expectedTicket: plan.expectedTicket,
    updatedStructureRows: plan.updatedStructureRows, originalDocumentCount: plan.originalDocumentCount,
    originalHistoryRowsPreserved: plan.originalHistoryRows, originalHistoryChunksPreserved: plan.originalHistoryChunks, ...LIMITATIONS });
}
