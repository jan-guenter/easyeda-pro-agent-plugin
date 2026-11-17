/** Inert expectations from a complete original opening reader. Core binds
 * the result to its private full-purpose source; no data label grants IO. */
import { canonicalJson } from "./core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { SqlCell, SqlTable } from "./sqlite-inventory-core.ts";
import { assertCurrentFootprintSourcePlanInventory } from "./current-footprint-source-plan.ts";
import type { CurrentFootprintForwardHeadSource } from "./current-footprint-forward-head-origin.ts";
import { decodeCurrentFootprintSourceHistory } from "./symbol-sql-comparator.ts";
import { captureCurrentFootprintSavedFlowCacheInput, deriveCurrentFootprintSavedFlowCacheData } from "./current-footprint-saved-flow-cache-data.ts";
import { deriveCurrentFootprintInverseInitialCacheData } from "./current-footprint-inverse-initial-cache-data.ts";
import { deriveCurrentFootprintInverseInitialSyncData } from "./current-footprint-inverse-initial-sync-data.ts";

type Scalar = string | number | null;
const fields = ["id", "uuid", "parent", "key", "is_lock", "num", "snapshot_num", "created_at", "updated_at", "lock_time"] as const;
function need(value: boolean): asserts value { if (!value) { throw new Error("FORWARD_WRITER_ORIGINAL_STARTUP_DATA"); } }
function scalar(value: SqlCell | undefined): Scalar {
  need(value !== undefined); if (value.kind === "null") { return null; }
  if (value.kind === "integer") { const number = Number(value.decimal); need(Number.isSafeInteger(number) && String(number) === value.decimal); return number; }
  need(value.kind === "text"); const bytes = Buffer.from(value.hex, "hex"), text = bytes.toString("utf8"); need(Buffer.from(text).equals(bytes)); return text;
}
function rows(table: SqlTable): readonly Readonly<Record<string, Scalar>>[] {
  const names = table.columns.map(column => { need(typeof column["name"] === "string"); return column["name"]; }); need(new Set(names).size === names.length);
  return table.rows.map(row => { need(row.cells.length === names.length); return Object.freeze(Object.fromEntries(names.map((name, index) => [name, scalar(row.cells[index])]))); });
}
/** Reuse the exact vendor parser and complete eight-job bounds. Unsupported
 * history counts, snapshots and body sizes fail before any native resume. */
export async function deriveCurrentFootprintForwardWriterStartupData(source: CurrentFootprintForwardHeadSource): Promise<Readonly<{
  input: ReturnType<typeof captureCurrentFootprintSavedFlowCacheInput>; flow: ReturnType<typeof deriveCurrentFootprintSavedFlowCacheData>;
  cache: ReturnType<typeof deriveCurrentFootprintInverseInitialCacheData>; sync: ReturnType<typeof deriveCurrentFootprintInverseInitialSyncData>;
  canonical: string; nativeWorkerOwnershipVerified: false; continuationAuthorized: false;
}>> {
  const { before, sourcePlan } = source, completion = readerCompletion(before), target = sourcePlan.source;
  const current = (): void => { assertCurrentFootprintSourcePlanInventory(sourcePlan, before); need(readerCompletion(before) === completion && before.checkpointSha256 === sourcePlan.beforeCheckpointSha256); };
  current(); const decoded = await decodeCurrentFootprintSourceHistory(before, { projectUuid: target.projectUuid, branchUuid: target.branchUuid }); current();
  need(decoded.history.documents.some(document => document.uuid === target.footprintUuid && document.docType === "FOOTPRINT") && decoded.links.length === decoded.chunks.length);
  const tables = before.tables.filter(table => table.name === `project_history_${target.branchUuid}`); need(tables.length === 1 && tables[0] !== undefined);
  const heads = rows(tables[0]).map(row => Object.fromEntries(fields.map(name => { const value = row[name]; need(value !== undefined); return [name, value]; })));
  need(heads.every(row => typeof row["id"] === "number")); heads.sort((left, right) => Number(right["id"]) - Number(left["id"]));
  const chunks = decoded.chunks.map((plaintext, index) => { const link = decoded.links[index]; need(link !== undefined); return Object.freeze({ historyUuid: link.historyUuid, ordinal: link.ordinal, plaintext, plaintextSha256: link.plaintextSha256 }); });
  const input = captureCurrentFootprintSavedFlowCacheInput({ projectUuid: target.projectUuid, branchUuid: target.branchUuid, headHistoryUuid: decoded.history.headHistoryUuid, heads, chunks });
  const flow = deriveCurrentFootprintSavedFlowCacheData(input);
  const cache = deriveCurrentFootprintInverseInitialCacheData(flow), sync = deriveCurrentFootprintInverseInitialSyncData(input, flow); current();
  return Object.freeze({ input, flow, cache, sync, canonical: canonicalJson({ input, flow, cache, sync }), nativeWorkerOwnershipVerified: false as const, continuationAuthorized: false as const });
}
