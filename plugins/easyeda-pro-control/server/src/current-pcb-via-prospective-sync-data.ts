/** Source-derived pre-GET candidate only. This pure comparison grants no
 * original owner, native row, request, worker or continuation authority. */
import { canonicalJson } from "./core.ts";
import { CURRENT_GENERATED_INITIAL_BRANCH_API_FIELDS as FIELDS } from "./current-generated-initial-branch-source.ts";
import type { CurrentGeneratedInitialFlowCacheData } from "./current-generated-initial-flow-cache-plan.ts";
import type { CurrentGeneratedInitialBranchData } from "./current-generated-initial-branch-plan.ts";
import type { CurrentProjectHistorySqlEffects } from "./current-project-history-sql-effects.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentPcbViaProspectiveSyncData {
  readonly projectUuid: string; readonly branchUuid: string; readonly documentUuid: string; readonly historyUuid: string;
  readonly mode: "append" | "mutable"; readonly historyNum: 0 | 1;
  readonly initialHeadIndexBody: string; readonly branchBody: string; readonly historyBodySha256: string;
  readonly actualHistoryRowsVerified: false; readonly workerContinuationAuthorized: false;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_PROSPECTIVE_SYNC_DATA"); } }
export function compareCurrentPcbViaProspectiveSyncData(input: Readonly<{
  projectUuid: string; branchUuid: string; documentUuid: string;
  effects: CurrentProjectHistorySqlEffects; initial: CurrentGeneratedInitialFlowCacheData; branch: CurrentGeneratedInitialBranchData;
}>): CurrentPcbViaProspectiveSyncData {
  const { branch, branchUuid, documentUuid, effects, initial, projectUuid } = input;
  need(initial.projectUuid === projectUuid && initial.branchUuid === branchUuid && branch.projectUuid === projectUuid && branch.branchUuid === branchUuid && branch.historyUuid === initial.historyUuid && effects.projectUuid === projectUuid && effects.branchUuid === branchUuid && effects.historyNum === (effects.mode === "mutable" ? 1 : 0));
  const row: unknown = JSON.parse(branch.body); need(row !== null && typeof row === "object" && !Array.isArray(row));
  const entries = Object.entries(row); need(canonicalJson(entries.map(([key]) => key)) === canonicalJson(FIELDS));
  const value = Object.fromEntries(entries); need(value["uuid"] === branchUuid && value["project_uuid"] === projectUuid && value["history_uuid"] === initial.historyUuid && value["project_histories_id"] === 1);
  value["history_uuid"] = effects.historyUuid; value["project_histories_id"] = effects.mode === "append" ? 2 : 1;
  return freezeDeep({ projectUuid, branchUuid, documentUuid, historyUuid: effects.historyUuid, mode: effects.mode, historyNum: effects.historyNum,
    initialHeadIndexBody: initial.headIndex.body, branchBody: JSON.stringify(value), historyBodySha256: effects.bodySha256, actualHistoryRowsVerified: false, workerContinuationAuthorized: false });
}
