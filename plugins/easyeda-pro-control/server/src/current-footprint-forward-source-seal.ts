/** Original forward source sealing and complete closed baseline equality.
 * These opaque references issue no writer or saved-generation authority. */
import { types } from "node:util";
import { canonicalJson, sha256Json } from "./core.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import type { Inventory } from "./closed-sql-equality.ts";
import { captureCurrentFootprintCopyClosedSnapshot, requireCurrentFootprintCopyClosedSnapshot } from "./current-footprint-copy-closed-snapshot.ts";
import { CurrentFootprintCopyForwardNativeOwner, assertOriginalCurrentFootprintCopyForwardNativeOwner,
  originalCurrentFootprintCopyNativeTarget, originalCurrentFootprintCopyNativeTermination } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCopyNativeTarget } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCopyOpeningOwner, CurrentFootprintCopyOpeningResult } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentFootprintCopyPreparation } from "./current-footprint-copy-preparation.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import { loadRuntimeMachineProfile } from "./machine-profile.ts";

export interface CurrentFootprintForwardSourceSeal {
  readonly beforeCheckpointSha256: string;
  readonly beforeSqlSha256: string;
  readonly sourceBindingSha256: string;
}
interface Retained {
  readonly owner: CurrentFootprintCopyForwardNativeOwner;
  readonly origin: CurrentFootprintCopyNativeTarget;
  readonly text: string;
  readonly seal: CurrentFootprintForwardSourceSeal;
}
const seals = new WeakMap<CurrentFootprintForwardSourceSeal, Retained>();
const attempted = new WeakSet<object>(), closed = new WeakSet<CurrentFootprintForwardSourceSeal>();
// oxlint-disable-next-line typescript/unbound-method -- Invoke only on the registry-checked original private-field owner below.
const sealSource = CurrentFootprintCopyForwardNativeOwner.prototype.sealFootprintCopyExecutionSource;
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_FORWARD_SOURCE_SEAL_ORIGINAL_REQUIRED"); } }
function requireOriginal(held: Retained): void {
  assertOriginalCurrentFootprintCopyForwardNativeOwner(held.owner);
  need(held.owner.sealFootprintCopyExecutionSource === sealSource && originalCurrentFootprintCopyNativeTarget(held.owner) === held.origin &&
    canonicalJson({ ...held.origin, before: undefined }) === held.text && seals.get(held.seal) === held);
}
/** The original private seal does all opening/preparation/checkpoint authority
 * checks. No JSON descriptor or caller-provided verifier can replace them. */
export async function sealCurrentFootprintForwardSource(owner: unknown, operationId: string,
  opening: CurrentFootprintCopyOpeningOwner, result: CurrentFootprintCopyOpeningResult, preparation: CurrentFootprintCopyPreparation,
  checkpoint: CheckpointReceipt): Promise<CurrentFootprintForwardSourceSeal> {
  need(owner !== null && typeof owner === "object" && !types.isProxy(owner) && owner instanceof CurrentFootprintCopyForwardNativeOwner);
  assertOriginalCurrentFootprintCopyForwardNativeOwner(owner);
  need(owner.sealFootprintCopyExecutionSource === sealSource && !attempted.has(owner)); attempted.add(owner);
  const configured = await loadRuntimeMachineProfile();
  assertOriginalCurrentFootprintCopyForwardNativeOwner(owner);
  await sealSource.call(owner, operationId, opening, result, preparation, checkpoint, configured.profile.runtime);
  assertOriginalCurrentFootprintCopyForwardNativeOwner(owner);
  const origin = originalCurrentFootprintCopyNativeTarget(owner), text = canonicalJson({ ...origin, before: undefined });
  need(origin.operationId === operationId && origin.checkpoint === checkpoint && origin.before.checkpointSha256 === checkpoint.checkpointSha256);
  const seal = Object.freeze({ beforeCheckpointSha256: origin.before.checkpointSha256, beforeSqlSha256: origin.before.logicalSha256,
    sourceBindingSha256: sha256Json({ ...origin, before: undefined }) });
  const held = Object.freeze({ owner, origin, text, seal }); seals.set(seal, held); requireOriginal(held); return seal;
}
/** Once-only observation after the actual original root and whole Job exited.
 * The existing closed reader retains its original termination/checkpoint proof. */
export async function proveCurrentFootprintForwardClosedBaseline(seal: CurrentFootprintForwardSourceSeal): Promise<Readonly<{
  before: Inventory; after: Inventory; closedCheckpointSha256: string; closedSqlSha256: string;
}>> {
  need(seal !== null && typeof seal === "object" && !types.isProxy(seal));
  const held = seals.get(seal); need(held !== undefined && !closed.has(seal)); requireOriginal(held); closed.add(seal);
  const termination = originalCurrentFootprintCopyNativeTermination(held.owner);
  const after = await captureCurrentFootprintCopyClosedSnapshot(held.owner, termination); requireOriginal(held);
  const snapshot = requireCurrentFootprintCopyClosedSnapshot(held.owner, after);
  await compareCompleteClosedSql(held.origin.before, after); requireOriginal(held);
  need(requireCurrentFootprintCopyClosedSnapshot(held.owner, after) === snapshot);
  return Object.freeze({ before: held.origin.before, after,
    closedCheckpointSha256: snapshot.checkpoint.checkpointSha256, closedSqlSha256: after.logicalSha256 });
}
