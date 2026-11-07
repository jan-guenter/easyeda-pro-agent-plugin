/** Genuine saved-checkpoint and flow preparation only. This plan supplies
 * expected row data and cannot create a worker, runtime row or delete grant. */
import { canonicalJson } from "./core.ts";
import { requireOriginalCurrentFootprintForwardSavedCheckpoint, verifyCurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import { currentFootprintCopyV2SavedTarget } from "./current-footprint-copy-v2-saved-source.ts";
import { requireOriginalCurrentFootprintSavedFlowCacheInput, requireOriginalCurrentFootprintSavedFlowCachePlan } from "./current-footprint-saved-flow-cache-plan.ts";
import type { CurrentFootprintSavedFlowCachePlan } from "./current-footprint-saved-flow-cache-plan.ts";
import { deriveCurrentFootprintInversePublicRowData } from "./current-footprint-inverse-public-row-data.ts";
import type { CurrentFootprintInversePublicRowData } from "./current-footprint-inverse-public-row-data.ts";
import { readerCompletion } from "./sqlite-inventory.ts";

export interface CurrentFootprintInversePublicRowPlan { readonly profile: "private.current-footprint-inverse-public-row-plan.v1" }
type Prior = ReturnType<typeof requireOriginalCurrentFootprintForwardSavedCheckpoint>;
interface Original {
  readonly prepared: CurrentFootprintForwardSavedCheckpoint; readonly flow: CurrentFootprintSavedFlowCachePlan;
  readonly prior: Prior; readonly completion: ReturnType<typeof readerCompletion>; readonly input: ReturnType<typeof requireOriginalCurrentFootprintSavedFlowCacheInput>;
  readonly data: CurrentFootprintInversePublicRowData; readonly text: string;
}
const issued = new WeakMap<CurrentFootprintInversePublicRowPlan, Readonly<Original>>();
const pending = new WeakMap<CurrentFootprintForwardSavedCheckpoint, Readonly<{ flow: CurrentFootprintSavedFlowCachePlan; promise: Promise<CurrentFootprintInversePublicRowPlan> }>>();
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_PUBLIC_ROW_PLAN_ORIGINAL"); } }
function current(original: Omit<Original, "data" | "text">): void {
  const prior = requireOriginalCurrentFootprintForwardSavedCheckpoint(original.prepared);
  requireOriginalCurrentFootprintSavedFlowCachePlan(original.flow, original.prepared);
  need(prior.owner === original.prior.owner && prior.writer === original.prior.writer && prior.writerAfter === original.prior.writerAfter && prior.inventory === original.prior.inventory &&
    prior.projection === original.prior.projection && prior.savedRead === original.prior.savedRead && prior.paired === original.prior.paired && prior.snapshot === original.prior.snapshot &&
    prior.snapshot.inventory === prior.inventory && readerCompletion(prior.inventory) === original.completion && requireOriginalCurrentFootprintSavedFlowCacheInput(original.flow, original.prepared) === original.input);
}
export function prepareCurrentFootprintInversePublicRowPlan(prepared: CurrentFootprintForwardSavedCheckpoint, flow: CurrentFootprintSavedFlowCachePlan): Promise<CurrentFootprintInversePublicRowPlan> {
  const prior = requireOriginalCurrentFootprintForwardSavedCheckpoint(prepared);
  const completion = readerCompletion(prior.inventory);
  const input = requireOriginalCurrentFootprintSavedFlowCacheInput(flow, prepared);
  const original = Object.freeze({ prepared, flow, prior, completion, input }); current(original);
  const previous = pending.get(prepared); if (previous !== undefined) { need(previous.flow === flow); return previous.promise; }
  const promise = (async (): Promise<CurrentFootprintInversePublicRowPlan> => {
    await verifyCurrentFootprintForwardSavedCheckpoint(prepared); current(original);
    const target = currentFootprintCopyV2SavedTarget(prior.projection); need(input.projectUuid === target.projectUuid && input.branchUuid === target.branchUuid);
    const data = deriveCurrentFootprintInversePublicRowData(input, target.footprintUuid, prior.inventory); current(original);
    await verifyCurrentFootprintForwardSavedCheckpoint(prepared); current(original);
    const token: CurrentFootprintInversePublicRowPlan = Object.freeze({ profile: "private.current-footprint-inverse-public-row-plan.v1" });
    issued.set(token, Object.freeze({ ...original, data, text: canonicalJson(data) })); return token;
  })(); pending.set(prepared, Object.freeze({ flow, promise })); return promise;
}
export function requireOriginalCurrentFootprintInversePublicRowPlan(token: CurrentFootprintInversePublicRowPlan, prepared: CurrentFootprintForwardSavedCheckpoint, flow: CurrentFootprintSavedFlowCachePlan): CurrentFootprintInversePublicRowData {
  const original = issued.get(token); need(original !== undefined && original.prepared === prepared && original.flow === flow && original.text === canonicalJson(original.data)); current(original); return original.data;
}
