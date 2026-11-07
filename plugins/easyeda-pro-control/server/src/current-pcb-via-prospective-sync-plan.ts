/** Actual completed history effects can predict the branch row before the
 * worker issues its GET. Native history timestamps remain late-bound. */
import { sha256Text } from "./core.ts";
import { assertOriginalCurrentPcbViaWriteOwner } from "./current-pcb-via-write-owner.ts";
import type { CurrentPcbViaWriteOwner } from "./current-pcb-via-write-owner.ts";
import { requireOriginalCurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { compareCurrentPcbViaProspectiveSyncData } from "./current-pcb-via-prospective-sync-data.ts";
import type { CurrentPcbViaProspectiveSyncData } from "./current-pcb-via-prospective-sync-data.ts";

export interface CurrentPcbViaProspectiveSyncPlan { readonly profile: "private.current-pcb-via-prospective-sync-plan.v1" }
export type { CurrentPcbViaProspectiveSyncData } from "./current-pcb-via-prospective-sync-data.ts";
interface Original { readonly owner: CurrentPcbViaWriteOwner; readonly plan: CurrentPcbViaWritePlan; readonly data: CurrentPcbViaProspectiveSyncData; readonly assertCurrent: () => void }
const issued = new WeakMap<CurrentPcbViaProspectiveSyncPlan, Original>();
const prepared = new WeakMap<CurrentPcbViaWriteOwner, CurrentPcbViaProspectiveSyncPlan>();
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_PROSPECTIVE_SYNC_ORIGINAL"); } }
export function prepareCurrentPcbViaProspectiveSyncPlan(owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan): CurrentPcbViaProspectiveSyncPlan {
  assertOriginalCurrentPcbViaWriteOwner(owner); const original = requireOriginalCurrentPcbViaWritePlan(plan);
  const previous = prepared.get(owner); if (previous !== undefined) { requireOriginalCurrentPcbViaProspectiveSyncPlan(previous, owner, plan); return previous; }
  const effects = owner.requireViaHistorySqlEffects(plan); const live = owner.requireViaLiveHistoryBody(plan); const initial = owner.requireViaInitialCacheData(plan); const branch = owner.requireViaInitialBranchData(plan);
  const current = (): void => {
    assertOriginalCurrentPcbViaWriteOwner(owner); need(requireOriginalCurrentPcbViaWritePlan(plan) === original); readerCompletion(original.inventory);
    const body = owner.requireViaLiveHistoryBody(plan);
    need(owner.requireViaHistorySqlEffects(plan) === effects && body.delta === live.delta && body.workerValue === live.workerValue && body.clock === live.clock && owner.requireViaInitialCacheData(plan) === initial && owner.requireViaInitialBranchData(plan) === branch && effects.projectUuid === plan.target.projectUuid && effects.branchUuid === plan.target.branchUuid && effects.bodySha256 === live.delta.bodySha256 && effects.bodySha256 === sha256Text(live.workerValue.body) && initial.initialSourceSha256 === original.qualification.sourceSha256 && initial.initialLogicalSha256 === original.inventory.logicalSha256 && effects.initialLogicalSha256 === plan.initialLogicalSha256 && branch.projectUuid === initial.projectUuid && branch.branchUuid === initial.branchUuid && branch.historyUuid === initial.historyUuid && effects.historyNum === (effects.mode === "mutable" ? 1 : 0));
  }; current();
  const data = compareCurrentPcbViaProspectiveSyncData({ projectUuid: plan.target.projectUuid, branchUuid: plan.target.branchUuid, documentUuid: plan.target.documentUuid, effects, initial, branch }); current();
  const token: CurrentPcbViaProspectiveSyncPlan = Object.freeze({ profile: "private.current-pcb-via-prospective-sync-plan.v1" });
  issued.set(token, { owner, plan, data, assertCurrent: current }); prepared.set(owner, token); return token;
}
export function requireOriginalCurrentPcbViaProspectiveSyncPlan(token: CurrentPcbViaProspectiveSyncPlan, owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan): CurrentPcbViaProspectiveSyncData {
  const original = issued.get(token); need(original !== undefined && original.owner === owner && original.plan === plan); original.assertCurrent(); return original.data;
}
