/** Bind the original opening preparation to a later PCB transition. This
 * callback verifies the historical managed backup and returns the same completed
 * SQL reader. It never reads a replacement baseline or admits a native route. */
import { canonicalJson, sha256Json } from "./core.ts";
import type { CurrentDisposableOpenCheckpoint, verifyHistoricalCurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import type { CurrentDisposableOpenPreparationCheckpoint, CurrentDisposableOpenSealedTarget, CurrentDisposableOpenTarget } from "./current-disposable-open.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
export interface CurrentPcb209StartupPreparation {
  readonly sealedTarget: CurrentDisposableOpenSealedTarget;
  readonly prepared: CurrentDisposableOpenCheckpoint;
  readonly preparedText: string;
  readonly originalTarget: CurrentDisposableOpenTarget;
  readonly commonInventory: Inventory | null;
}
export interface CurrentPcb209StartupCheckpointBinding {
  readonly checkpointReceiptSha256: string;
  readonly beforeSqlSha256: string;
  readonly target: CurrentDisposableOpenSealedTarget;
  readonly preparationCheckpoint: CurrentDisposableOpenPreparationCheckpoint;
}
export interface CurrentPcb209StartupCheckpointOwner {
  /** The original lifecycle checks its retained preparation, opening result,
   * native owner and complete journal snapshot on both sides of each await. */
  readonly assertOriginal: () => Promise<void>;
  readonly verifyHistorical: typeof verifyHistoricalCurrentDisposableOpenCheckpoint;
}
function need(value: boolean, code: string): asserts value {
  if (!value) { throw new Error(`PCB209_STARTUP_CHECKPOINT_${code}`); }
}
export function currentPcb209StartupCheckpointCallback(preparation: CurrentPcb209StartupPreparation,
  binding: CurrentPcb209StartupCheckpointBinding, owner: CurrentPcb209StartupCheckpointOwner): () => Promise<Inventory> {
  const before = preparation.commonInventory;
  need(before !== null, "ORIGINAL_SQL_REQUIRED");
  const completion = readerCompletion(before), originalTarget = preparation.originalTarget, prepared = preparation.prepared;
  const bindingText = canonicalJson(binding), preparedText = preparation.preparedText, targetText = canonicalJson(originalTarget);
  const assertOriginal = owner.assertOriginal, verifyHistorical = owner.verifyHistorical;
  let attempted = false;
  const current = (): void => {
    need(owner.assertOriginal === assertOriginal && owner.verifyHistorical === verifyHistorical &&
      preparation.prepared === prepared && preparation.originalTarget === originalTarget && preparation.commonInventory === before &&
      preparation.preparedText === preparedText && canonicalJson(prepared) === preparedText &&
      canonicalJson(binding) === bindingText && canonicalJson(originalTarget) === targetText &&
      canonicalJson(preparation.sealedTarget) === canonicalJson(binding.target) && prepared.preparationCheckpoint !== undefined &&
      canonicalJson(prepared.preparationCheckpoint) === canonicalJson(binding.preparationCheckpoint), "ORIGINAL_PREPARATION_CHANGED");
    need(readerCompletion(before) === completion && completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
      before.logicalSha256 === binding.beforeSqlSha256 && before.checkpointSha256 === prepared.checkpoint.checkpointSha256 &&
      sha256Json(prepared.checkpoint) === binding.checkpointReceiptSha256, "ORIGINAL_SQL_BINDING");
    const evidence = prepared.targetEvidence, target = preparation.sealedTarget;
    need(evidence.projectUuid === target.projectUuid && evidence.branchUuid === target.branchUuid && evidence.documentUuid === target.documentUuid &&
      evidence.docType === "PCB" && evidence.sourceSha256 === target.expectedSourceSha256 &&
      evidence.checkpointSha256 === before.checkpointSha256 && canonicalJson({ ...originalTarget, branchUuid: evidence.branchUuid }) === canonicalJson(target),
    "ORIGINAL_TARGET_BINDING");
  };
  current();
  return async (): Promise<Inventory> => {
    need(!attempted, "CONSUMED"); attempted = true;
    current(); await assertOriginal.call(owner); current();
    await verifyHistorical.call(owner, prepared, originalTarget); current();
    await assertOriginal.call(owner); current();
    return before;
  };
}
