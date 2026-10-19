/** Original completed-SQL SCH metadata only. No live observer or writer. */
import { z } from "zod";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { isRecord, sha256Json, sha256Text } from "./core.ts";
import { CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES, CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_PEERS,
  currentSchematicRenamePreflightRequestSchema, parseCurrentSchematicRenamePreflightRequest } from "./current-schematic-rename-preflight.ts";
import type { CurrentSchematicRenamePeer, CurrentSchematicRenamePreflightRequest } from "./current-schematic-rename-preflight.ts";
import { currentSchematicStoredHeaderSchema } from "./current-schematic-stored-header.ts";
import { isNativeDocumentDeleted, parseNativeRecords } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";

// Pinned worker b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928.
// Dg1909909 increments model data tickets, including tombstones. Dg.get1911033
// Projects name/display_name; nr.schematic1810933 uses structure.name.
// Method ar.setEditData1857162 advances version/time by updateTime, not header ticket.
type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Decoded = Awaited<ReturnType<typeof decodeCurrentSymbolPreEditHistory>>;
type Target = CurrentSchematicRenamePreflightRequest["target"];
const identifier = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const title = currentSchematicRenamePreflightRequestSchema.shape.desiredTitle;
const metadataSchema = z.object({ title, source: z.literal(""), board: z.union([z.literal(""), identifier]), zIndex: z.null() }).strict();
const structureEntrySchema = z.object({ uuid: identifier, name: title, board: metadataSchema.shape.board, source: z.literal(""),
  version: currentSchematicStoredHeaderSchema.shape.version, updateTime: currentSchematicStoredHeaderSchema.shape.updateTime }).strict();
const pageHeaderSchema = currentSchematicStoredHeaderSchema.extend({ docType: z.literal("SCH_PAGE") }).strict();
const LIMITATIONS = Object.freeze({ executionAuthorized: false, originalOwnerVerified: false, producerBindingVerified: false,
  actorProvenanceVerified: false, clockProvenanceVerified: false, nativeNamePolicyVerified: false, queueCompletionVerified: false,
  schematicSubscriberCompletionVerified: false, generationClosureVerified: false, persistentUploadReplayExcluded: false,
  fullSqlEffectVerified: false, reopened: false } as const);
export interface CurrentSchematicNativeMetadata extends Readonly<typeof LIMITATIONS> {
  readonly profile: "private.current-schematic-native-metadata.v1";
  readonly request: Readonly<CurrentSchematicRenamePreflightRequest>;
  readonly peers: readonly Readonly<CurrentSchematicRenamePeer>[];
  readonly sourcePeers: readonly Readonly<{ uuid: string; title: string; board: string; metadataSha256: string; headerSha256: string }>[];
  readonly baseline: Readonly<{ sqlSha256: string; checkpointSha256: string; historySha256: string; rawHistorySha256: string;
    targetSourceSha256: string; targetHeaderSha256: string; headHistoryUuid: string; maximumTicket: number;
    maximumTargetHeaderTime: number; maximumTargetNativeTime: number; documentCount: number; historyRows: number; chunks: number }>;
  readonly maximumTicket: number;
  readonly nativeTitleSubset: "locale-invariant-printable-ascii-without-capital-i";
  readonly projectionSha256: string;
}
interface RawSchematic { readonly headerTicket: number; readonly updateTime: number; readonly version: string; dataTicket: number;
  nativeUpdateTime: number; nativeVersion: string; }
interface RawPage { readonly updateTime: number; readonly version: string; parent: string | undefined; }
const originals = new WeakMap<CurrentSchematicNativeMetadata, Readonly<{ before: Inventory; completion: ReturnType<typeof readerCompletion> }>>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current schematic native metadata: ${message}`); }
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
  // Ne1845057 can use desktop toLocaleLowerCase. Capital I is locale-sensitive
  // Even in ASCII; no caller-selected locale stands in for the actual worker.
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
function structure(before: Inventory, target: Target): Record<string, unknown> {
  const tables = before.tables.filter(table => table.name === "project_structures"); const table = tables[0];
  need(tables.length === 1 && table !== undefined, "SQL table identity differs");
  const rows = table.rows.filter(row => text(field(table, row, "branch_uuid")) === target.branchUuid); const first = rows[0];
  need(first !== undefined, "selected structure is missing"); const encoded = text(field(table, first, "structure"));
  need(rows.every(row => text(field(table, row, "project_uuid")) === target.projectUuid && text(field(table, row, "structure")) === encoded), "selected structures disagree");
  const tree: unknown = JSON.parse(encoded);
  need(isRecord(tree) && isRecord(tree["schematics"]) && isRecord(tree["owner"]) && tree["owner"]["uuid"] === target.ownerUuid, "schematic structure or owner differs");
  return tree["schematics"];
}
function pageHeader(entry: ReturnType<typeof parseNativeRecords>[number], pages: Map<string, RawPage>): string {
  const header = pageHeaderSchema.parse(entry.body), prior = pages.get(header.uuid);
  need(header.updateTime > 0 && (prior === undefined || (header.updateTime >= prior.updateTime &&
    (header.updateTime !== prior.updateTime || header.version === prior.version))), "child header time/version order is unsupported");
  pages.set(header.uuid, { updateTime: header.updateTime, version: header.version, parent: prior?.parent }); return header.uuid;
}
function pageParent(entry: ReturnType<typeof parseNativeRecords>[number], page: RawPage | undefined): void {
  const body = entry.body;
  need(page !== undefined && body !== null && body["source"] === "", "ordinary child metadata required");
  const parent = identifier.parse(body["schematic"]);
  need(page.parent === undefined || page.parent === parent, "historical child reparenting is unsupported"); page.parent = parent;
}
function childClocks(pages: ReadonlyMap<string, RawPage>, schematics: ReadonlyMap<string, RawSchematic>): void {
  // Worker onHeadChange2119165 calls schematic.setEditData for an already
  // Associated SCH_PAGE. META handling at2106505 also propagates the sheet clock
  // To its newly recorded parent. ar.setEditData1857162 advances only for a
  // Strictly newer timestamp, independent of the document/data ticket. Stable
  // Ordinary parent lineages therefore retain the maximum direct/child clock.
  // Refuse equal maximum timestamps with distinct versions: their winner can
  // Depend on replay order. Deleted pages still contribute historical clocks.
  for (const page of pages.values()) {
    const parent = page.parent === undefined ? undefined : schematics.get(page.parent);
    need(parent !== undefined, "historical child parent is missing or inactive");
    if (page.updateTime > parent.nativeUpdateTime) { parent.nativeUpdateTime = page.updateTime; parent.nativeVersion = page.version; }
  }
  for (const page of pages.values()) {
    const parent = page.parent === undefined ? undefined : schematics.get(page.parent);
    need(parent !== undefined && (page.updateTime !== parent.nativeUpdateTime || page.version === parent.nativeVersion),
      "equal-time child/parent versions are order-dependent");
  }
}
async function rawSchematicClocks(decoded: Decoded, active: ReadonlySet<string>): Promise<ReadonlyMap<string, RawSchematic>> {
  const pages = new Map<string, RawPage>(), result = new Map<string, RawSchematic>(); let bytes = 0;
  for (const chunk of decoded.chunks) {
    let current: string | undefined, currentPage: string | undefined;
    for (const line of chunk.split("|\n")) {
      const records = parseNativeRecords(line); const entry = records[0]; need(records.length === 1 && entry !== undefined, "raw record framing differs");
      const type = entry.header["type"];
      if (type === "DOCHEAD") {
        const uuid = entry.body?.["uuid"]; current = typeof uuid === "string" && active.has(uuid) ? uuid : undefined;
        currentPage = entry.body?.["docType"] === "SCH_PAGE" ? pageHeader(entry, pages) : undefined;
        if (current !== undefined) {
          const header = currentSchematicStoredHeaderSchema.parse(entry.body), prior = result.get(current), ticket = integer(entry.header["ticket"]);
          need(header.updateTime > 0 && (prior === undefined || (ticket >= prior.headerTicket && header.updateTime >= prior.updateTime &&
            (header.updateTime !== prior.updateTime || header.version === prior.version))), "schematic header time/version order is unsupported");
          result.set(current, { headerTicket: ticket, updateTime: header.updateTime, version: header.version,
            nativeUpdateTime: header.updateTime, nativeVersion: header.version, dataTicket: prior?.dataTicket ?? -1 });
        }
      } else if (type !== "EDIT_HEAD" && current !== undefined) {
        const schematic = result.get(current); need(schematic !== undefined, "raw schematic header missing");
        schematic.dataTicket = Math.max(schematic.dataTicket, integer(entry.header["ticket"]));
      } else if (type === "META" && currentPage !== undefined) {
        pageParent(entry, pages.get(currentPage));
      }
      bytes += Buffer.byteLength(line); if (bytes >= 65_536) { bytes = 0; await yieldProofEventLoop(); }
    }
    await yieldProofEventLoop();
  }
  childClocks(pages, result);
  return result;
}
async function projectedPeers(decoded: Decoded, tree: Record<string, unknown>, target: Target, desiredTitle: string): Promise<Readonly<{
  peers: CurrentSchematicNativeMetadata["peers"]; sourcePeers: CurrentSchematicNativeMetadata["sourcePeers"];
  maximumTargetHeaderTime: number; maximumTargetNativeTime: number;
}>> {
  const documents = decoded.history.documents.filter(document => document.docType === "SCH" && !isNativeDocumentDeleted(document));
  need(documents.length <= CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_PEERS && documents.length === Object.keys(tree).length, "complete schematic peer membership differs");
  const raw = await rawSchematicClocks(decoded, new Set(documents.map(document => document.uuid))); const peers: CurrentSchematicRenamePeer[] = [];
  const sourcePeers: CurrentSchematicNativeMetadata["sourcePeers"][number][] = []; const desired = nativeTitle(desiredTitle);
  for (const document of documents) {
    const metadata = document.records.filter(record => record.id === "META" || record.type === "META"); const meta = metadata[0];
    const clock = raw.get(document.uuid), header = currentSchematicStoredHeaderSchema.parse(document.metadata);
    need(metadata.length === 1 && meta?.id === "META" && meta.type === "META" && clock !== undefined && clock.dataTicket >= 0 && header.uuid === document.uuid &&
      clock.updateTime === header.updateTime && clock.version === header.version, "ordinary schematic source/header projection differs");
    const encoded = JSON.stringify(meta.body), parsed = metadataSchema.parse(meta.body); const entry = structureEntrySchema.parse(tree[document.uuid]);
    need(JSON.stringify(parsed) === encoded && Buffer.from(encoded).toString("utf8") === encoded, "canonical schematic metadata differs");
    need(JSON.stringify(entry) === JSON.stringify(tree[document.uuid]) && entry.uuid === document.uuid && entry.name === parsed.title &&
      entry.board === parsed.board && entry.version === clock.nativeVersion && entry.updateTime === clock.nativeUpdateTime, "complete schematic peer history/tree differs");
    const name = nativeTitle(parsed.title);
    // Dg.getIdByName1913613 returns an existing target UUID even for a case-only
    // Rename. This initial subset requires empty-string lookup, so refuse every
    // Collision, including the target; do not invent a target-ID exception.
    need(name !== desired, "schematic name collision including case-only rename");
    peers.push({ uuid: document.uuid, name, displayName: parsed.title, source: "", version: clock.nativeVersion,
      boardUuid: parsed.board, ticket: clock.dataTicket, updateTime: clock.nativeUpdateTime });
    sourcePeers.push({ uuid: document.uuid, title: parsed.title, board: parsed.board, metadataSha256: sha256Text(encoded), headerSha256: sha256Json(document.metadata) });
  }
  const targetClock = raw.get(target.schematicUuid); need(targetClock !== undefined, "target schematic missing");
  return freezeDeep({ peers: peers.toSorted((left, right) => left.uuid < right.uuid ? -1 : Number(left.uuid > right.uuid)), sourcePeers,
    maximumTargetHeaderTime: targetClock.updateTime, maximumTargetNativeTime: targetClock.nativeUpdateTime });
}
/** No witness is supplied before native actor/client/clock observations. The
 * reused decoder is document-type neutral; no SYMBOL or PCB lifecycle token
 * is accepted. Child sheets and other documents remain separate proof work.
 */
export async function prepareCurrentSchematicNativeMetadata(input: Readonly<{ before: Inventory; target: Target; desiredTitle: string }>): Promise<CurrentSchematicNativeMetadata> {
  const captured = own(input, ["before", "target", "desiredTitle"]); const before = input.before, completion = readerCompletion(before);
  need(captured["before"] === before && completion.exitCode === 0, "original SQL reader changed or incomplete");
  const target = freezeDeep(currentSchematicRenamePreflightRequestSchema.shape.target.parse(own(captured["target"], ["projectUuid", "branchUuid", "ownerUuid", "schematicUuid"])));
  const desiredTitle = title.parse(captured["desiredTitle"]); nativeTitle(desiredTitle);
  const decoded = await decodeCurrentSymbolPreEditHistory(before, { projectUuid: target.projectUuid, branchUuid: target.branchUuid });
  need(decoded.history.projectOwnerUuid === target.ownerUuid, "project owner differs");
  const projected = await projectedPeers(decoded, structure(before, target), target, desiredTitle), selected = projected.peers.find(peer => peer.uuid === target.schematicUuid);
  const documents = decoded.history.documents.filter(document => document.uuid === target.schematicUuid); const document = documents[0];
  need(selected !== undefined && documents.length === 1 && document !== undefined, "unique target schematic missing");
  const { uuid: _uuid, ...expectedBefore } = selected;
  const request = parseCurrentSchematicRenamePreflightRequest({ target, expectedBefore, desiredTitle });
  const body = freezeDeep({ profile: "private.current-schematic-native-metadata.v1" as const, request, peers: projected.peers, sourcePeers: projected.sourcePeers,
    baseline: { sqlSha256: before.logicalSha256, checkpointSha256: before.checkpointSha256, historySha256: decoded.history.semanticSha256,
      rawHistorySha256: sha256Json(decoded.links), targetSourceSha256: document.semanticSha256, targetHeaderSha256: sha256Json(document.metadata),
      headHistoryUuid: decoded.history.headHistoryUuid, maximumTicket: decoded.maximumTicket, maximumTargetHeaderTime: projected.maximumTargetHeaderTime,
      maximumTargetNativeTime: projected.maximumTargetNativeTime,
      documentCount: decoded.history.documents.length, historyRows: decoded.history.historyRowCount, chunks: decoded.history.chunkCount },
    maximumTicket: decoded.maximumTicket, nativeTitleSubset: "locale-invariant-printable-ascii-without-capital-i" as const, ...LIMITATIONS });
  need(Buffer.byteLength(JSON.stringify(body)) <= CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES, "projection exceeds preflight bound");
  need(readerCompletion(before) === completion, "original SQL reader changed");
  const result = Object.freeze({ ...body, projectionSha256: sha256Json(body) }); originals.set(result, { before, completion }); return result;
}
export function assertOriginalCurrentSchematicNativeMetadata(projection: CurrentSchematicNativeMetadata, before: Inventory): void {
  const original = originals.get(projection); need(original !== undefined && original.before === before && readerCompletion(before) === original.completion,
    "original SQL metadata projection required");
}
