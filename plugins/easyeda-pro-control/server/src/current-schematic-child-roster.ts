/** Original closed SQL -> ordinary SCH child roster -> supplied AST comparison.
 * This is not a live observer, startup issuer, subscriber or rename dispatcher.
 * Native anchors are zero-based UTF16 offsets in the pinned sources:
 * SCH d9d6a955bf40d57daf9f27f31e0fff3191715ff50582418ad0922beb71b424bd;
 * Worker b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928.
 */
import { z } from "zod";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { CURRENT_SCHEMATIC_CHILD_LIMITATIONS, CURRENT_SCHEMATIC_CHILD_MAX_COUNT, currentSchematicChildAstSchema,
  currentSchematicChildKvSchema, currentSchematicChildStoredHeaderSchema, parseCurrentSchematicChildObservation } from "./current-schematic-child-roster-contract.ts";
import type { CurrentSchematicChildAst, CurrentSchematicChildKv } from "./current-schematic-child-roster-contract.ts";
import { assertOriginalCurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import type { CurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import { selectCurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import type { CurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import { isNativeDocumentDeleted, parseNativeRecords } from "./native-history.ts";
import type { NativeDocumentSnapshot } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, SqlRow, SqlTable, readExactSqlInventory } from "./sqlite-inventory.ts";
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Decoded = Awaited<ReturnType<typeof decodeCurrentSymbolPreEditHistory>>;
const shape = currentSchematicChildKvSchema.shape;
const metadataSchema = z.object({ title: shape.display_title, schematic: shape.schematic_uuid, source: z.literal(""), zIndex: shape.zIndex }).strict();
// WORKER nr.sheet1811070 serializes the unassigned model docType as absent.
// Its vg.get1919022 independently supplies the native getter's constant type 1.
// Refuse an explicit stored field: a later native tree refresh would remove it,
// Violating this lifecycle's unchanged-child relation.
const structureSchema = currentSchematicChildKvSchema.omit({ project_uuid: true, display_title: true, ticket: true, docType: true }).strict();
export interface CurrentSchematicChildRoster extends Readonly<typeof CURRENT_SCHEMATIC_CHILD_LIMITATIONS> {
  readonly profile: "private.current-schematic-child-roster.v1";
  readonly nativeChildTitlePolicy: "ascii-fold-projection-requires-exact-native-match";
  readonly sqlSha256: string;
  readonly metadataProjectionSha256: string;
  readonly historySha256: string;
  readonly childKv: Readonly<Record<string, Readonly<CurrentSchematicChildKv>>>;
  readonly targetAst: Readonly<CurrentSchematicChildAst>;
  readonly startupInput: Readonly<CurrentSymbolStartupExpectation>;
  readonly projectionSha256: string;
}
const originals = new WeakMap<CurrentSchematicChildRoster, Readonly<{ before: Inventory; metadata: CurrentSchematicNativeMetadata;
  completion: ReturnType<typeof readerCompletion> }>>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current schematic child roster: ${message}`); }
}
/** Exact original historical identities only. This grants no live authority. */
export function assertOriginalCurrentSchematicChildRoster(prepared: CurrentSchematicChildRoster, before: Inventory, metadata: CurrentSchematicNativeMetadata): void {
  const original = originals.get(prepared);
  need(original !== undefined && original.before === before && original.metadata === metadata && readerCompletion(before) === original.completion,
    "original prepared roster/reader/metadata required");
  assertOriginalCurrentSchematicNativeMetadata(metadata, before);
}
function meta(document: NativeDocumentSnapshot): Readonly<Record<string, unknown>> {
  const entries = document.records.filter(entry => entry.id === "META" || entry.type === "META"), entry = entries[0];
  need(entries.length === 1 && entry?.id === "META" && entry.type === "META", "unique ordinary metadata required"); return entry.body;
}
function text(cell: SqlCell): string {
  need(cell.kind === "text", "SQL TEXT required"); const bytes = Buffer.from(cell.hex, "hex"), result = bytes.toString("utf8");
  need(Buffer.from(result).equals(bytes), "exact UTF8 required"); return result;
}
function field(table: SqlTable, row: SqlRow, name: string): SqlCell {
  const value = row.cells[table.columns.findIndex(column => column["name"] === name)]; need(value !== undefined, "SQL column missing"); return value;
}
function sheetTree(before: Inventory, metadata: CurrentSchematicNativeMetadata): Record<string, unknown> {
  const tables = before.tables.filter(table => table.name === "project_structures"); const table = tables[0];
  need(tables.length === 1 && table !== undefined, "unique structure required"); const { target } = metadata.request;
  const rows = table.rows.filter(row => text(field(table, row, "branch_uuid")) === target.branchUuid); const row = rows[0];
  need(row !== undefined, "selected structure missing"); const encoded = text(field(table, row, "structure"));
  need(rows.every(entry => text(field(table, entry, "project_uuid")) === target.projectUuid && text(field(table, entry, "structure")) === encoded), "structure copies differ");
  const tree: unknown = JSON.parse(encoded);
  need(isRecord(tree) && isRecord(tree["sheets"]) && isRecord(tree["blockSymbols"]) && Object.keys(tree["blockSymbols"]).length === 0,
    "sheet tree missing or block-symbol/reuse structure unsupported"); return tree["sheets"];
}
async function tickets(decoded: Decoded, active: ReadonlySet<string>): Promise<ReadonlyMap<string, number>> {
  const result = new Map<string, number>(); let bytes = 0;
  // Worker vg1917700 accumulates data tickets, including tombstones; DOCHEAD
  // Tickets do not advance this getter field. A materialized-only max is wrong.
  for (const chunk of decoded.chunks) {
    let current: string | undefined;
    for (const line of chunk.split("|\n")) {
      const records = parseNativeRecords(line); const entry = records[0]; need(records.length === 1 && entry !== undefined, "record framing differs");
      if (entry.header["type"] === "DOCHEAD") {
        const uuid = entry.body?.["uuid"]; current = typeof uuid === "string" && active.has(uuid) ? uuid : undefined;
      } else if (entry.header["type"] !== "EDIT_HEAD" && current !== undefined) {
        const value = shape.ticket.parse(entry.header["ticket"]); result.set(current, Math.max(result.get(current) ?? -1, value));
      }
      bytes += Buffer.byteLength(line); if (bytes >= 65_536) { bytes = 0; await yieldProofEventLoop(); }
    }
    await yieldProofEventLoop();
  }
  return result;
}
function ordinarySymbols(active: readonly NativeDocumentSnapshot[]): void {
  for (const document of active.filter(entry => entry.docType === "SYMBOL")) {
    const data = meta(document);
    // SCH b6@5745153 resolves a block symbol by title, including rename-driven
    // Reassociation during Ja. Reject every active block/reuse symbol, not just
    // A current title match. WORKER1931780 returns local metadata; b6 filters
    // Exact docType, not source. A canonical library-origin pair is provenance
    // For an already stored ordinary symbol, not a request to fetch its origin.
    // Referenced templates still need complete local PART/startup validation.
    const source = data["source"];
    need(typeof source === "string" && /^(?:|[a-f0-9]{32}\|[a-f0-9]{32})$/u.test(source) &&
      (data["docType"] === 2 || data["docType"] === 18 || data["docType"] === 20),
    "unsupported library origin or block-symbol/reuse template");
  }
}
async function projectChildren(decoded: Decoded, tree: Record<string, unknown>, metadata: CurrentSchematicNativeMetadata): Promise<Record<string, CurrentSchematicChildKv>> {
  const pages = decoded.history.documents.filter(document => document.docType === "SCH_PAGE" && !isNativeDocumentDeleted(document));
  need(pages.length > 0 && pages.length <= CURRENT_SCHEMATIC_CHILD_MAX_COUNT && pages.length === Object.keys(tree).length,
    "complete linked-page membership or supported count differs (empty lazy managers unsupported)");
  const rawTickets = await tickets(decoded, new Set(pages.map(page => page.uuid))), result: Record<string, CurrentSchematicChildKv> = {};
  const positions = new Map<string, Set<number>>();
  for (const page of pages) {
    const raw = meta(page); const data = metadataSchema.parse(raw); const header = currentSchematicChildStoredHeaderSchema.parse(page.metadata);
    const entry = structureSchema.parse(tree[page.uuid]);
    need(JSON.stringify(data) === JSON.stringify(raw) && header.uuid === page.uuid && metadata.peers.some(peer => peer.uuid === data.schematic), "canonical ordinary page metadata/header differs");
    const expected = { uuid: page.uuid, title: data.title, schematic_uuid: data.schematic, zIndex: data.zIndex, source: "", version: header.version, updateTime: header.updateTime };
    need(canonicalJson(entry) === canonicalJson(expected), "complete page history/tree differs");
    const order = positions.get(data.schematic) ?? new Set<number>(); need(!order.has(data.zIndex), "ambiguous equal-zIndex child order unsupported");
    order.add(data.zIndex); positions.set(data.schematic, order);
    result[page.uuid] = currentSchematicChildKvSchema.parse({ ...expected, docType: 1, project_uuid: metadata.request.target.projectUuid,
      title: data.title.toLowerCase(), display_title: data.title, ticket: rawTickets.get(page.uuid) });
  }
  return result;
}
/** Pinned SCH d9d6a955: w9@5766787 prunes membership, compares child count
 * with tempAst.sort.length and may Xl/mM-initialize missing pages. N1@5469012
 * rebuilds the container; mM@5446807 projects these sheet fields. Unique zIndex
 * Avoids guessing sort tie order. Original metadata projects ordinary stable
 * Child-derived container clocks, including deleted pages, while excluding
 * Historical reparenting and ambiguous equal-time versions.
 * The neutral startup selector contributes data premises only, never its owner.
 */
export async function prepareCurrentSchematicChildRoster(metadata: CurrentSchematicNativeMetadata, before: Inventory): Promise<CurrentSchematicChildRoster> {
  assertOriginalCurrentSchematicNativeMetadata(metadata, before); const completion = readerCompletion(before), { target, expectedBefore } = metadata.request;
  const decoded = await decodeCurrentSymbolPreEditHistory(before, { projectUuid: target.projectUuid, branchUuid: target.branchUuid });
  need(decoded.history.semanticSha256 === metadata.baseline.historySha256, "original decoded history differs");
  ordinarySymbols(decoded.history.documents.filter(document => !isNativeDocumentDeleted(document)));
  const childKv = await projectChildren(decoded, sheetTree(before, metadata), metadata), startupInput = selectCurrentSymbolStartupExpectation(decoded.history);
  const selected = Object.values(childKv).filter(child => child.schematic_uuid === target.schematicUuid).toSorted((left, right) => left.zIndex - right.zIndex);
  const targetAst = currentSchematicChildAstSchema.parse({ uuid: target.schematicUuid, title: expectedBefore.name, displayTitle: expectedBefore.displayName,
    board: expectedBefore.boardUuid, version: expectedBefore.version, updateTime: expectedBefore.updateTime, blockSymbolUuid: "",
    sort: selected.map(child => child.uuid), sheets: Object.fromEntries(selected.map(child => [child.uuid,
      { uuid: child.uuid, title: child.title, displayTitle: child.display_title, zIndex: child.zIndex }])) });
  const body = freezeDeep({ profile: "private.current-schematic-child-roster.v1" as const,
    nativeChildTitlePolicy: "ascii-fold-projection-requires-exact-native-match" as const, sqlSha256: before.logicalSha256,
    metadataProjectionSha256: metadata.projectionSha256, historySha256: decoded.history.semanticSha256, childKv, targetAst, startupInput, ...CURRENT_SCHEMATIC_CHILD_LIMITATIONS });
  assertOriginalCurrentSchematicNativeMetadata(metadata, before); need(readerCompletion(before) === completion, "original reader changed");
  const result = Object.freeze({ ...body, projectionSha256: sha256Json(body) }); originals.set(result, { before, metadata, completion }); return result;
}
/** Supplied equality cannot establish native JS object identity, callback
 * completion, no child initialization, nor any persistent or external effect.
 * A future fixed observer must retain both AST receivers, manager, child-map
 * reader and startup holders before this relation can support a live preflight.
 */
export function compareCurrentSchematicChildRoster(prepared: CurrentSchematicChildRoster, before: Inventory, raw: unknown): Readonly<Record<string, unknown>> {
  const original = originals.get(prepared); need(original !== undefined && original.before === before && readerCompletion(before) === original.completion, "original prepared roster/reader required");
  assertOriginalCurrentSchematicNativeMetadata(original.metadata, before);
  const observation = parseCurrentSchematicChildObservation(raw), sample = observation.samples[0], { target } = original.metadata.request;
  need(canonicalJson(observation.target) === canonicalJson(target) && sample.manager.prjUuid === target.projectUuid, "target/project differs");
  need(canonicalJson(sample.childKv) === canonicalJson(prepared.childKv), "complete child KV differs");
  need(canonicalJson(sample.ast.schematic) === canonicalJson(prepared.targetAst) && canonicalJson(sample.tempAst.schematic) === canonicalJson(prepared.targetAst), "target AST membership/count/order or metadata differs");
  return Object.freeze({ profile: "private.current-schematic-child-roster-comparison.v1", sqlSha256: before.logicalSha256,
    projectionSha256: prepared.projectionSha256, observationSha256: sha256Json(observation), historicalChildRosterMatched: true,
    targetAstMembershipAndOrderMatched: true, suppliedSettledHoldersMatched: true, ...CURRENT_SCHEMATIC_CHILD_LIMITATIONS });
}
