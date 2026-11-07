/** Live data only. The original owner and its actual SQL/body/read registries
 * supply every input; public JSON cannot issue this private reference. */
import { canonicalJson, sha256Text } from "./core.ts";
import { assertOriginalCurrentPcbViaWriteOwner } from "./current-pcb-via-write-owner.ts";
import type { CurrentPcbViaWriteOwner } from "./current-pcb-via-write-owner.ts";
import { requireOriginalCurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { decodeNativeHistoryChunk } from "./native-history.ts";
import { compareCurrentPcbViaLiveHistoryCacheData } from "./current-pcb-via-live-history-cache-data.ts";
import type { CurrentPcbViaLiveHistoryCacheData } from "./current-pcb-via-live-history-cache-data.ts";

export interface CurrentPcbViaLiveHistoryCachePlan { readonly profile: "private.current-pcb-via-live-history-cache-plan.v1" }
interface Original {
  readonly owner: CurrentPcbViaWriteOwner; readonly plan: CurrentPcbViaWritePlan; readonly data: CurrentPcbViaLiveHistoryCacheData; readonly text: string;
  readonly assertCurrent: () => void;
}
const issued = new WeakMap<CurrentPcbViaLiveHistoryCachePlan, Original>();
const pending = new WeakMap<CurrentPcbViaWriteOwner, Readonly<{ plan: CurrentPcbViaWritePlan; promise: Promise<CurrentPcbViaLiveHistoryCachePlan> }>>();
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_LIVE_HISTORY_CACHE_ORIGINAL"); } }
export function prepareCurrentPcbViaLiveHistoryCachePlan(owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan): Promise<CurrentPcbViaLiveHistoryCachePlan> {
  assertOriginalCurrentPcbViaWriteOwner(owner); const original = requireOriginalCurrentPcbViaWritePlan(plan);
  const previous = pending.get(owner); if (previous !== undefined) { need(previous.plan === plan); return previous.promise; }
  const effects = owner.requireViaHistorySqlEffects(plan), live = owner.requireViaLiveHistoryBody(plan), native = owner.requireViaLiveHistoryRows(plan);
  const initial = owner.requireViaInitialCacheData(plan), initialBranch = owner.requireViaInitialBranchData(plan);
  const current = (): void => {
    assertOriginalCurrentPcbViaWriteOwner(owner); need(requireOriginalCurrentPcbViaWritePlan(plan) === original); readerCompletion(original.inventory);
    const body = owner.requireViaLiveHistoryBody(plan);
    need(owner.requireViaHistorySqlEffects(plan) === effects && body.delta === live.delta && body.workerValue === live.workerValue && body.clock === live.clock && owner.requireViaLiveHistoryRows(plan) === native &&
      owner.requireViaInitialCacheData(plan) === initial && owner.requireViaInitialBranchData(plan) === initialBranch && initial.initialSourceSha256 === original.qualification.sourceSha256 && initial.initialLogicalSha256 === original.inventory.logicalSha256 &&
      effects.initialLogicalSha256 === plan.initialLogicalSha256 && effects.bodySha256 === live.delta.bodySha256 && live.delta.dataStr === live.workerValue.body && live.clock === live.workerValue.clock);
  };
  current();
  const promise = (async (): Promise<CurrentPcbViaLiveHistoryCachePlan> => {
    const plaintext = await decodeNativeHistoryChunk({ historyUuid: effects.historyUuid, keyHex: effects.keyHex, dataBase64: effects.dataBase64 }); current();
    need(sha256Text(plaintext) === effects.plaintextSha256);
    const data = compareCurrentPcbViaLiveHistoryCacheData({ projectUuid: plan.target.projectUuid, branchUuid: plan.target.branchUuid, documentUuid: plan.target.documentUuid,
      body: live.delta.dataStr, clock: live.clock, plaintext, initial, initialBranch, effects, native }); current();
    const token: CurrentPcbViaLiveHistoryCachePlan = Object.freeze({ profile: "private.current-pcb-via-live-history-cache-plan.v1" });
    issued.set(token, { owner, plan, data, text: canonicalJson(data), assertCurrent: current }); return token;
  })(); pending.set(owner, { plan, promise }); return promise;
}
/** Current private comparison data only. Actual worker method/Promise/cache
 * custody and each continuation remain separate operation-owned proofs. */
export function requireOriginalCurrentPcbViaLiveHistoryCachePlan(token: CurrentPcbViaLiveHistoryCachePlan, owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan): CurrentPcbViaLiveHistoryCacheData {
  const original = issued.get(token); need(original !== undefined && original.owner === owner && original.plan === plan && original.text === canonicalJson(original.data));
  original.assertCurrent(); return original.data;
}
