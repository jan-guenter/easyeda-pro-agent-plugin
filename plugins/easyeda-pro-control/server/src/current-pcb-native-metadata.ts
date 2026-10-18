/** Original completed-SQL projection only. No caller actor/client/clock is
 * required, and no process, producer, startup or mutation authority is issued.
 */
import { z } from "zod";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import { CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES, currentPcbRenamePreflightRequestSchema,
  parseCurrentPcbRenamePreflightRequest } from "./current-pcb-rename-preflight.ts";
import type { CurrentPcbRenamePreflightRequest, CurrentPcbRenamePreflightResult } from "./current-pcb-rename-preflight.ts";
import { currentPcbStoredHeaderSchema } from "./current-pcb-stored-header.ts";
import { isNativeDocumentDeleted, parseNativeRecords } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Decoded = Awaited<ReturnType<typeof decodeCurrentSymbolPreEditHistory>>;
type Peer = CurrentPcbRenamePreflightResult["peers"][number];
type Target = CurrentPcbRenamePreflightRequest["target"];
const identifier = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const metadataSchema = z.object({ title: currentPcbRenamePreflightRequestSchema.shape.desiredTitle,
  parent: z.literal(""), source: z.literal(""), board: z.union([z.literal(""), identifier]), zIndex: z.null() }).strict();
const LIMITATIONS = Object.freeze({ executionAuthorized: false, originalOwnerVerified: false, producerBindingVerified: false,
  actorProvenanceVerified: false, clockProvenanceVerified: false, nativeNamePolicyVerified: false,
  queueCompletionVerified: false, generationClosureVerified: false, persistentUploadReplayExcluded: false, reopened: false } as const);
export interface CurrentPcbNativeMetadata extends Readonly<typeof LIMITATIONS> {
  readonly profile: "private.current-pcb-native-metadata.v1";
  readonly request: Readonly<CurrentPcbRenamePreflightRequest>;
  readonly peers: readonly Readonly<Peer>[];
  readonly sourcePeers: readonly Readonly<{ uuid: string; title: string; board: string; metadataSha256: string; headerSha256: string }>[];
  readonly baseline: Readonly<{ sqlSha256: string; checkpointSha256: string; historySha256: string; rawHistorySha256: string;
    targetSourceSha256: string; targetHeaderSha256: string; headHistoryUuid: string; maximumTicket: number;
    maximumTargetHeaderTime: number; documentCount: number; historyRows: number; chunks: number }>;
  readonly maximumTicket: number;
  readonly nativeTitleSubset: "locale-invariant-printable-ascii-without-capital-i";
  readonly projectionSha256: string;
}
interface RawPcb { readonly headerTicket: number; readonly updateTime: number; readonly version: string; dataTicket: number; }
const originals = new WeakMap<CurrentPcbNativeMetadata, Readonly<{ before: Inventory; completion: ReturnType<typeof readerCompletion> }>>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current PCB native metadata: ${message}`); }
}
function own(value: unknown, names: readonly string[]): Record<string, unknown> {
  need(isRecord(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) &&
    Reflect.ownKeys(value).length === names.length, "exact own-data input required");
  const result: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "input accessors or fields refused");
    Object.defineProperty(result, name, { value: descriptor.value as unknown, enumerable: true });
  }
  return result;
}
function integer(value: unknown): number {
  need(typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && !Object.is(value, -0), "raw ticket differs"); return value;
}
function nativeTitle(value: string): string {
  // Worker b849bd12 Ne at1845057 can select desktop toLocaleLowerCase.
  // Capital I is locale-sensitive even in ASCII; no worker locale is invented.
  need(/^[\u0020-\u007E]+$/u.test(value) && !value.includes("I"), "title is outside the locale-invariant ASCII subset");
  return value.toLowerCase();
}
function text(value: SqlCell): string {
  need(value.kind === "text", "expected SQL TEXT"); const bytes = Buffer.from(value.hex, "hex"), result = bytes.toString("utf8");
  need(Buffer.from(result).equals(bytes), "SQL text is not exact UTF8"); return result;
}
function field(owner: SqlTable, row: SqlRow, name: string): SqlCell {
  const value = row.cells[owner.columns.findIndex(column => column["name"] === name)];
  need(value !== undefined, "SQL column is missing"); return value;
}
function structure(before: Inventory, branchUuid: string): Record<string, unknown> {
  const tables = before.tables.filter(table => table.name === "project_structures"); const table = tables[0];
  need(tables.length === 1 && table !== undefined, "SQL table identity differs");
  const rows = table.rows.filter(row => text(field(table, row, "branch_uuid")) === branchUuid); const first = rows[0];
  need(first !== undefined, "selected structure is missing"); const encoded = text(field(table, first, "structure"));
  need(rows.every(row => text(field(table, row, "structure")) === encoded), "selected structures disagree");
  const tree: unknown = JSON.parse(encoded); need(isRecord(tree) && isRecord(tree["pcbs"]), "PCB structure is missing"); return tree["pcbs"];
}
async function rawPcbClocks(decoded: Decoded, active: ReadonlySet<string>): Promise<ReadonlyMap<string, RawPcb>> {
  const result = new Map<string, RawPcb>(); let bytes = 0;
  for (const chunk of decoded.chunks) {
    let current: string | undefined;
    for (const line of chunk.split("|\n")) {
      const records = parseNativeRecords(line); const entry = records[0]; need(records.length === 1 && entry !== undefined, "raw record framing differs");
      const type = entry.header["type"];
      if (type === "DOCHEAD") {
        const uuid = entry.body?.["uuid"]; current = typeof uuid === "string" && active.has(uuid) ? uuid : undefined;
        if (current !== undefined) {
          const header = currentPcbStoredHeaderSchema.parse(entry.body), prior = result.get(current), ticket = integer(entry.header["ticket"]);
          // Method ar.setEditData at1857162 advances time/version by updateTime, not
          // DOCHEAD ticket. Admit only histories where both projections agree.
          need(header.updateTime > 0 && (prior === undefined || (ticket >= prior.headerTicket && header.updateTime >= prior.updateTime &&
            (header.updateTime !== prior.updateTime || header.version === prior.version))), "PCB header time/version order is unsupported");
          result.set(current, { headerTicket: ticket, updateTime: header.updateTime, version: header.version, dataTicket: prior?.dataTicket ?? -1 });
        }
      } else if (type !== "EDIT_HEAD" && current !== undefined) {
        const pcb = result.get(current); need(pcb !== undefined, "raw PCB header missing");
        // Sg.onDataChange at1899987 includes data tombstones in model ticket.
        // DOCHEAD and setEditData do not raise the model's data ticket.
        pcb.dataTicket = Math.max(pcb.dataTicket, integer(entry.header["ticket"]));
      }
      bytes += Buffer.byteLength(line); if (bytes >= 65_536) { bytes = 0; await yieldProofEventLoop(); }
    }
    await yieldProofEventLoop();
  }
  return result;
}
async function projectedPeers(decoded: Decoded, tree: Record<string, unknown>, target: Target, desiredTitle: string): Promise<Readonly<{
  peers: CurrentPcbNativeMetadata["peers"]; sourcePeers: CurrentPcbNativeMetadata["sourcePeers"]; maximumTargetHeaderTime: number;
}>> {
  const documents = decoded.history.documents.filter(document => document.docType === "PCB" && !isNativeDocumentDeleted(document));
  need(documents.length <= 4096 && documents.length === Object.keys(tree).length, "complete PCB peer membership differs");
  const raw = await rawPcbClocks(decoded, new Set(documents.map(document => document.uuid))), result: Peer[] = [], sourcePeers: CurrentPcbNativeMetadata["sourcePeers"][number][] = [];
  for (const document of documents) {
    const metadata = document.records.filter(record => record.id === "META" || record.type === "META"); const meta = metadata[0];
    const clock = raw.get(document.uuid), entry = tree[document.uuid], header = currentPcbStoredHeaderSchema.parse(document.metadata);
    need(metadata.length === 1 && meta?.id === "META" && meta.type === "META" && clock !== undefined && clock.dataTicket >= 0 && header.uuid === document.uuid &&
      clock.updateTime === header.updateTime && clock.version === header.version, "ordinary PCB source/header projection differs");
    const encoded = JSON.stringify(meta.body), parsed = metadataSchema.parse(meta.body);
    need(JSON.stringify(parsed) === encoded && Buffer.from(encoded).toString("utf8") === encoded, "canonical PCB metadata differs");
    need(isRecord(entry) && entry["uuid"] === document.uuid && entry["title"] === parsed.title && entry["board"] === parsed.board &&
      entry["source"] === "" && entry["parent_uuid"] === "" && entry["version"] === header.version && entry["updateTime"] === header.updateTime &&
      (entry["docType"] === undefined || entry["docType"] === 3), "complete PCB peer history/tree differs");
    const title = nativeTitle(parsed.title); need(document.uuid === target.pcbUuid || title !== nativeTitle(desiredTitle), "peer PCB name collision");
    // Sg.get at1901353 uses source/version/board || "". Exact admitted strings
    // Preserve those fallbacks without inferring values from missing fields.
    result.push({ uuid: document.uuid, title, displayTitle: parsed.title, parentUuid: "", source: "", version: header.version,
      boardUuid: parsed.board, ticket: clock.dataTicket, updateTime: header.updateTime, docType: 3 });
    sourcePeers.push({ uuid: document.uuid, title: parsed.title, board: parsed.board, metadataSha256: sha256Text(encoded), headerSha256: sha256Json(document.metadata) });
  }
  const targetClock = raw.get(target.pcbUuid); need(targetClock !== undefined, "target PCB missing");
  return freezeDeep({ peers: result.toSorted((left, right) => left.uuid < right.uuid ? -1 : Number(left.uuid > right.uuid)), sourcePeers,
    maximumTargetHeaderTime: targetClock.updateTime });
}
/** No witness is accepted: this runs before first native actor/client reads. */
export async function prepareCurrentPcbNativeMetadata(input: Readonly<{ before: Inventory; target: Target; desiredTitle: string }>): Promise<CurrentPcbNativeMetadata> {
  const captured = own(input, ["before", "target", "desiredTitle"]); const before = input.before, completion = readerCompletion(before);
  need(captured["before"] === before, "original SQL reader changed");
  need(completion.exitCode === 0, "original SQL reader is incomplete");
  const target = freezeDeep(currentPcbRenamePreflightRequestSchema.shape.target.parse(own(captured["target"], ["projectUuid", "branchUuid", "ownerUuid", "pcbUuid"])));
  const desiredTitle = currentPcbRenamePreflightRequestSchema.shape.desiredTitle.parse(captured["desiredTitle"]); nativeTitle(desiredTitle);
  const decoded = await decodeCurrentSymbolPreEditHistory(before, { projectUuid: target.projectUuid, branchUuid: target.branchUuid });
  need(decoded.history.projectOwnerUuid === target.ownerUuid, "project owner differs");
  const projected = await projectedPeers(decoded, structure(before, target.branchUuid), target, desiredTitle), selected = projected.peers.find(peer => peer.uuid === target.pcbUuid);
  const documents = decoded.history.documents.filter(document => document.uuid === target.pcbUuid); const document = documents[0];
  need(selected !== undefined && documents.length === 1 && document !== undefined, "unique target PCB missing");
  const { uuid: _uuid, ...expectedBefore } = selected;
  const request = freezeDeep(parseCurrentPcbRenamePreflightRequest({ target, expectedBefore, desiredTitle }));
  const body = freezeDeep({ profile: "private.current-pcb-native-metadata.v1" as const, request, peers: projected.peers, sourcePeers: projected.sourcePeers,
    baseline: { sqlSha256: before.logicalSha256, checkpointSha256: before.checkpointSha256, historySha256: decoded.history.semanticSha256,
      rawHistorySha256: sha256Json(decoded.links), targetSourceSha256: document.semanticSha256, targetHeaderSha256: sha256Json(document.metadata),
      headHistoryUuid: decoded.history.headHistoryUuid, maximumTicket: decoded.maximumTicket, maximumTargetHeaderTime: projected.maximumTargetHeaderTime,
      documentCount: decoded.history.documents.length, historyRows: decoded.history.historyRowCount, chunks: decoded.history.chunkCount },
    maximumTicket: decoded.maximumTicket, nativeTitleSubset: "locale-invariant-printable-ascii-without-capital-i" as const, ...LIMITATIONS });
  need(Buffer.byteLength(JSON.stringify(body)) <= CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES, "projection exceeds preflight bound");
  need(readerCompletion(before) === completion, "original SQL reader changed");
  const result = Object.freeze({ ...body, projectionSha256: sha256Json(body) }); originals.set(result, { before, completion }); return result;
}
export function assertOriginalCurrentPcbNativeMetadata(projection: CurrentPcbNativeMetadata, before: Inventory): void {
  const original = originals.get(projection); need(original !== undefined && original.before === before && readerCompletion(before) === original.completion,
    "original SQL metadata projection required");
}
/** Complete peer/ticket comparison only; no client or actor is synthesized. */
export function compareCurrentPcbNativeMetadata(projection: CurrentPcbNativeMetadata, before: Inventory, observed: CurrentPcbRenamePreflightResult): void {
  assertOriginalCurrentPcbNativeMetadata(projection, before);
  need(canonicalJson(observed.target) === canonicalJson(projection.request.target) && observed.desiredTitle === projection.request.desiredTitle &&
    canonicalJson(observed.expectedBefore) === canonicalJson(projection.request.expectedBefore) && canonicalJson(observed.peers) === canonicalJson(projection.peers) &&
    observed.clientTicketObservation.maxTicket === projection.maximumTicket, "complete observed PCB metadata differs from original SQL");
}
