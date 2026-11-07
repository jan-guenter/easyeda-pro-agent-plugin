/** Genuine completed saved-data issuer for the separate inverse generation.
 * Original runtime handles remain historical; this plan grants no worker IO. */
import { canonicalJson } from "./core.ts";
import { requireOriginalCurrentFootprintForwardSavedCheckpoint, verifyCurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import { currentFootprintCopyV2SavedTarget } from "./current-footprint-copy-v2-saved-source.ts";
import { captureCurrentFootprintSavedFlowCacheInput, deriveCurrentFootprintSavedFlowCacheData } from "./current-footprint-saved-flow-cache-data.ts";
import type { CurrentFootprintSavedFlowCacheData, CurrentFootprintSavedFlowCacheInput } from "./current-footprint-saved-flow-cache-data.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory, SqlCell, SqlTable } from "./sqlite-inventory-core.ts";
import { decodeCurrentFootprintSourceHistory } from "./symbol-sql-comparator.ts";

export interface CurrentFootprintSavedFlowCachePlan { readonly profile: "private.current-footprint-saved-flow-cache-plan.v1" }
type Prior = ReturnType<typeof requireOriginalCurrentFootprintForwardSavedCheckpoint>;
type Scalar = string | number | null;
interface Original { readonly prepared: CurrentFootprintForwardSavedCheckpoint; readonly prior: Prior; readonly completion: ReturnType<typeof readerCompletion>; readonly data: CurrentFootprintSavedFlowCacheData; readonly text: string; readonly input:CurrentFootprintSavedFlowCacheInput; readonly inputText:string }
const issued = new WeakMap<CurrentFootprintSavedFlowCachePlan, Original>();
const pending = new WeakMap<CurrentFootprintForwardSavedCheckpoint, Promise<CurrentFootprintSavedFlowCachePlan>>();
const fields = ["id", "uuid", "parent", "key", "is_lock", "num", "snapshot_num", "created_at", "updated_at", "lock_time"] as const;
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_SAVED_FLOW_CACHE_PLAN"); } }
function table(inventory: NativeSqlInventory, name: string): SqlTable { const matches = inventory.tables.filter(value => value.name === name); need(matches.length === 1 && matches[0] !== undefined); return matches[0]; }
function scalar(input: SqlCell | undefined): Scalar {
  need(input !== undefined); if (input.kind === "null") { return null; }
  if (input.kind === "integer") { const value = Number(input.decimal); need(Number.isSafeInteger(value) && String(value) === input.decimal); return value; }
  need(input.kind === "text"); const bytes = Buffer.from(input.hex, "hex"), text = bytes.toString("utf8"); need(Buffer.from(text).equals(bytes)); return text;
}
function rows(value: SqlTable): readonly Readonly<Record<string, Scalar>>[] {
  const names = value.columns.map(column => { need(typeof column["name"] === "string"); return column["name"]; }); need(new Set(names).size === names.length);
  return value.rows.map(row => { need(row.cells.length === names.length); return Object.freeze(Object.fromEntries(names.map((name, index) => [name, scalar(row.cells[index])]))); });
}
function one(values: readonly Readonly<Record<string, Scalar>>[], uuid: string): Readonly<Record<string, Scalar>> { const matches = values.filter(value => value["uuid"] === uuid); need(matches.length === 1 && matches[0] !== undefined); return matches[0]; }
function current(prepared: CurrentFootprintForwardSavedCheckpoint, prior: Prior, completion: ReturnType<typeof readerCompletion>): void {
  const same = requireOriginalCurrentFootprintForwardSavedCheckpoint(prepared);
  need(same.writer === prior.writer && same.owner === prior.owner && same.writerAfter === prior.writerAfter && same.inventory === prior.inventory && same.projection === prior.projection &&
    same.savedRead === prior.savedRead && same.paired === prior.paired && same.snapshot === prior.snapshot && readerCompletion(prior.inventory) === completion && prior.snapshot.inventory === prior.inventory && prior.inventory.checkpointSha256 === prior.snapshot.checkpoint.checkpointSha256);
}
/** Retain one original data preparation Promise. The independent complete
 * source-byte reproof brackets decryption and exact source parser projection. */
export function prepareCurrentFootprintSavedFlowCachePlan(prepared: CurrentFootprintForwardSavedCheckpoint): Promise<CurrentFootprintSavedFlowCachePlan> {
  const prior = requireOriginalCurrentFootprintForwardSavedCheckpoint(prepared); const completion = readerCompletion(prior.inventory);
  const old = pending.get(prepared); if (old !== undefined) { return old; }
  const promise = (async (): Promise<CurrentFootprintSavedFlowCachePlan> => {
    current(prepared, prior, completion); await verifyCurrentFootprintForwardSavedCheckpoint(prepared); current(prepared, prior, completion);
    const target = currentFootprintCopyV2SavedTarget(prior.projection); const branches = rows(table(prior.inventory, "branches")); const branch = one(branches, target.branchUuid);
    need(branch["project_uuid"] === target.projectUuid && branch["node"] === 0 && branch["delete_status"] === 0);
    const parent = branch["parent_uuid"]; need(parent === null || typeof parent === "string");
    if (parent !== null) { const start = one(branches, parent); need(start["name"] === "start" && start["node"] === 1 && start["delete_status"] === 0 && start["project_uuid"] === target.projectUuid && start["parent_uuid"] === null && start["history_uuid"] === null); }
    const decoded = await decodeCurrentFootprintSourceHistory(prior.inventory, { projectUuid: target.projectUuid, branchUuid: target.branchUuid }); current(prepared, prior, completion);
    need(decoded.history.documents.some(document => document.uuid === target.footprintUuid && document.docType === "FOOTPRINT") && decoded.links.length === decoded.chunks.length && decoded.history.headHistoryUuid === branch["history_uuid"]);
    const heads = rows(table(prior.inventory, `project_history_${target.branchUuid}`)).map(row => Object.fromEntries(fields.map(name => { const value = row[name]; need(value !== undefined); return [name, value]; })));
    need(heads.every(row => typeof row["id"] === "number")); heads.sort((left, right) => Number(right["id"]) - Number(left["id"]));
    const chunks = decoded.chunks.map((plaintext, index) => { const link = decoded.links[index]; need(link !== undefined); return Object.freeze({ historyUuid: link.historyUuid, ordinal: link.ordinal, plaintext, plaintextSha256: link.plaintextSha256 }); });
    const input=captureCurrentFootprintSavedFlowCacheInput({ projectUuid: target.projectUuid, branchUuid: target.branchUuid, headHistoryUuid: decoded.history.headHistoryUuid, heads, chunks });
    const data = deriveCurrentFootprintSavedFlowCacheData(input);
    current(prepared, prior, completion); await verifyCurrentFootprintForwardSavedCheckpoint(prepared); current(prepared, prior, completion);
    const plan: CurrentFootprintSavedFlowCachePlan = Object.freeze({ profile: "private.current-footprint-saved-flow-cache-plan.v1" });
    issued.set(plan, Object.freeze({ prepared, prior, completion, data, text: canonicalJson(data),input,inputText:canonicalJson(input) })); return plan;
  })(); pending.set(prepared, promise); return promise;
}
export function requireOriginalCurrentFootprintSavedFlowCachePlan(plan: CurrentFootprintSavedFlowCachePlan, prepared: CurrentFootprintForwardSavedCheckpoint): CurrentFootprintSavedFlowCacheData {
  const original = issued.get(plan); need(original !== undefined && original.prepared === prepared && original.text === canonicalJson(original.data) && original.inputText === canonicalJson(original.input)); current(prepared, original.prior, original.completion); return original.data;
}
/** Original immutable complete decrypted source only. It reconstructs no
 * runtime, Promise, worker, clock or ownership from the prior generation. */
export function requireOriginalCurrentFootprintSavedFlowCacheInput(plan:CurrentFootprintSavedFlowCachePlan,prepared:CurrentFootprintForwardSavedCheckpoint):CurrentFootprintSavedFlowCacheInput {
  requireOriginalCurrentFootprintSavedFlowCachePlan(plan,prepared);const original=issued.get(plan);need(original!==undefined&&original.prepared===prepared);return original.input;
}
export interface CurrentFootprintSavedFlowCachePlanModule {
  readonly prepareCurrentFootprintSavedFlowCachePlan: typeof prepareCurrentFootprintSavedFlowCachePlan;
  readonly requireOriginalCurrentFootprintSavedFlowCachePlan: typeof requireOriginalCurrentFootprintSavedFlowCachePlan;
}
