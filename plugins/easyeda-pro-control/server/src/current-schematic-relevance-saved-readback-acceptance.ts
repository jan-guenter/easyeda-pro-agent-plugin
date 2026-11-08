/** Final historical acceptance joins five original receipts. It performs no
 * native request, Save, file edit or upgrade of the earlier false flags. */
import { canonicalJson } from "./core.ts";
import { assertOriginalCurrentSchematicRelevanceSavedReadbackOwner, originalCurrentSchematicRelevanceSavedReadbackNormalClose,
  originalCurrentSchematicRelevanceSavedReadbackTarget, originalCurrentSchematicRelevanceSavedReadbackTermination } from "./current-schematic-relevance-saved-readback-owner.ts";
import type { CurrentSchematicRelevanceSavedReadbackOwner } from "./current-schematic-relevance-saved-readback-owner.ts";
import { requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import { requireOriginalCurrentSchematicRelevanceSavedColdObservation } from "./current-schematic-relevance-saved-cold-origin.ts";
import type { CurrentSchematicRelevanceSavedColdObservation } from "./current-schematic-relevance-saved-cold-origin.ts";
import { requireOriginalCurrentSchematicRelevanceSavedSceneObservation } from "./current-schematic-relevance-saved-scene-controller.ts";
import type { CurrentSchematicRelevanceSavedSceneObservation } from "./current-schematic-relevance-saved-scene-controller.ts";
import type { CurrentSchematicRelevanceSavedSceneOrigin } from "./current-schematic-relevance-saved-scene-origin.ts";
import { requireOriginalCurrentSchematicRelevanceSavedReadbackClosedData } from "./current-schematic-relevance-saved-readback-closed-proof.ts";
import type { CurrentSchematicRelevanceSavedReadbackClosedData } from "./current-schematic-relevance-saved-readback-closed-proof.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentSchematicRelevanceSavedReadbackAcceptance {
  readonly schema: "private.current-schematic-relevance-saved-readback-acceptance.v1";
  readonly operationId: string; readonly projectUuid: string; readonly branchUuid: string;
  readonly pageUuid: string; readonly schematicUuid: string; readonly textId: string;
  readonly savedFileSha256: string; readonly savedSqlLogicalSha256: string;
  readonly savedHeadHistoryUuid: string; readonly savedHistorySourceSha256: string; readonly reopenedSceneSourceSha256: string;
  readonly sourceRecordCount: 7; readonly persistentPeerCount: 6; readonly endpointMarkerCount: 2;
  readonly originalColdLoadVerified: true; readonly exactRequestedBodyVerified: true;
  readonly completePeerBodyRosterPreserved: true; readonly explicitRelevanceAttributePreserved: true;
  readonly normalCloseAcknowledged: true; readonly originalRootAndJobClosed: true;
  readonly originalHelperReleased: true; readonly exactSavedCompleteSqlUnchanged: true;
  readonly persistenceVerified: true; readonly reopenedVerified: true;
  readonly historicalObservationOnly: true; readonly executionAuthorized: false; readonly writerAuthority: false;
}
interface Inputs {
  readonly owner: CurrentSchematicRelevanceSavedReadbackOwner;
  readonly cold: CurrentSchematicRelevanceSavedColdObservation;
  readonly origin: CurrentSchematicRelevanceSavedSceneOrigin;
  readonly scene: CurrentSchematicRelevanceSavedSceneObservation;
  readonly closed: CurrentSchematicRelevanceSavedReadbackClosedData;
}
interface Original {
  readonly inputs: Inputs; readonly normalClose: object; readonly termination: object;
  readonly result: CurrentSchematicRelevanceSavedReadbackAcceptance; readonly text: string;
}
const originals = new WeakMap<CurrentSchematicRelevanceSavedReadbackOwner, Original>();
const issued = new WeakMap<CurrentSchematicRelevanceSavedReadbackAcceptance, Original>();
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_SAVED_READBACK_ACCEPTANCE_ORIGINAL"); } }
function same(left: Inputs, right: Inputs): boolean {
  return left.owner === right.owner && left.cold === right.cold && left.origin === right.origin && left.scene === right.scene && left.closed === right.closed;
}
function joined(input: Inputs): Readonly<{ plan: ReturnType<typeof requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan>;
  cold: ReturnType<typeof requireOriginalCurrentSchematicRelevanceSavedColdObservation>;
  scene: ReturnType<typeof requireOriginalCurrentSchematicRelevanceSavedSceneObservation>; normalClose: object; termination: object }> {
  const { owner, cold, origin, scene, closed } = input;
  assertOriginalCurrentSchematicRelevanceSavedReadbackOwner(owner);
  const prepared = originalCurrentSchematicRelevanceSavedReadbackTarget(owner);
  const plan = requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(prepared);
  const loaded = requireOriginalCurrentSchematicRelevanceSavedColdObservation(cold, owner, prepared);
  const observed = requireOriginalCurrentSchematicRelevanceSavedSceneObservation(scene, owner, origin);
  const captured = requireOriginalCurrentSchematicRelevanceSavedReadbackClosedData(closed, owner);
  const normalClose = originalCurrentSchematicRelevanceSavedReadbackNormalClose(owner), termination = originalCurrentSchematicRelevanceSavedReadbackTermination(owner);
  const status = owner.status();
  const target = plan.data.target;
  const loading = plan.data.loading;
  const projection = observed.projection;
  need(status.released && status.helperClosed && !status.busy && status.closeConsumed && status.binding !== null &&
    loaded.prepared === prepared && loaded.originalNativeCompletionAcknowledged && loaded.selectedSqlStayedReadonly &&
    loaded.data.projectUuid === target.projectUuid && loaded.data.branchUuid === target.branchUuid && loaded.data.pageUuid === target.pageUuid &&
    loaded.data.schematicUuid === target.schematicUuid && loaded.data.headHistoryUuid === loading.headHistoryUuid && loaded.data.sourceSha256 === loading.sourceSha256 &&
    loaded.data.exactCipherAndPlaintextChunks === 2 && loaded.data.emptyLocalIndexObserved && loaded.data.originalReadyAndResumeObserved &&
    projection.operationId === plan.data.operationId && projection.projectUuid === target.projectUuid && projection.branchUuid === target.branchUuid &&
    projection.pageUuid === target.pageUuid && projection.schematicUuid === target.schematicUuid && projection.textId === plan.closed.args.operation.textId &&
    projection.exactProjectedTextBodyVerified && projection.completePeerBodyRosterPreserved && projection.explicitRelevanceAttributePreserved &&
    closed.sourceSha256 === target.sourceSha256 && captured.sourceSnapshot.sha256 === target.sourceSha256 && captured.rawHistory !== null &&
    closed.inventoryLogicalSha256 === captured.inventory.logicalSha256 && closed.inventoryLogicalSha256 === plan.closed.checkpoint.vacuumProjection.sourceLogicalSha256);
  return Object.freeze({ plan, cold: loaded, scene: observed, normalClose, termination });
}

/** Repeated lookup returns only the same original result. Foreign receipts
 * cannot replace a completed observation or recreate ownership from JSON. */
export function acceptOriginalCurrentSchematicRelevanceSavedReadback(owner: CurrentSchematicRelevanceSavedReadbackOwner,
  cold: CurrentSchematicRelevanceSavedColdObservation, origin: CurrentSchematicRelevanceSavedSceneOrigin,
  scene: CurrentSchematicRelevanceSavedSceneObservation, closed: CurrentSchematicRelevanceSavedReadbackClosedData): CurrentSchematicRelevanceSavedReadbackAcceptance {
  const inputs = Object.freeze({ owner, cold, origin, scene, closed }), original = originals.get(owner), proof = joined(inputs);
  if (original !== undefined) { need(same(original.inputs, inputs) && original.normalClose === proof.normalClose && original.termination === proof.termination); return original.result; }
  const target = proof.plan.data.target;
  const result: CurrentSchematicRelevanceSavedReadbackAcceptance = freezeDeep({ schema: "private.current-schematic-relevance-saved-readback-acceptance.v1",
    operationId: proof.plan.data.operationId, projectUuid: target.projectUuid, branchUuid: target.branchUuid, pageUuid: target.pageUuid, schematicUuid: target.schematicUuid,
    textId: proof.scene.projection.textId, savedFileSha256: closed.sourceSha256, savedSqlLogicalSha256: closed.inventoryLogicalSha256,
    savedHeadHistoryUuid: proof.cold.data.headHistoryUuid, savedHistorySourceSha256: proof.cold.data.sourceSha256, reopenedSceneSourceSha256: proof.scene.projection.sourceSha256,
    sourceRecordCount: 7, persistentPeerCount: 6, endpointMarkerCount: 2, originalColdLoadVerified: true, exactRequestedBodyVerified: true,
    completePeerBodyRosterPreserved: true, explicitRelevanceAttributePreserved: true, normalCloseAcknowledged: true, originalRootAndJobClosed: true,
    originalHelperReleased: true, exactSavedCompleteSqlUnchanged: true, persistenceVerified: true, reopenedVerified: true,
    historicalObservationOnly: true, executionAuthorized: false, writerAuthority: false });
  const held = Object.freeze({ inputs, normalClose: proof.normalClose, termination: proof.termination, result, text: canonicalJson(result) });
  originals.set(owner, held); issued.set(result, held); return result;
}
export function requireOriginalCurrentSchematicRelevanceSavedReadbackAcceptance(result: CurrentSchematicRelevanceSavedReadbackAcceptance,
  owner: CurrentSchematicRelevanceSavedReadbackOwner): CurrentSchematicRelevanceSavedReadbackAcceptance {
  const original = issued.get(result); need(original !== undefined && original.inputs.owner === owner && originals.get(owner) === original && original.text === canonicalJson(result));
  const proof = joined(original.inputs); need(proof.normalClose === original.normalClose && proof.termination === original.termination); return result;
}
