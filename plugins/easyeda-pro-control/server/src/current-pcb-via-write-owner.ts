/** Original native Via owner and exact observation lookups. No structural
 * owner interface, injected function table or serialized packet can issue it. */
export { CurrentPcbViaWriteOwner, startCurrentPcbViaWriteOwner, assertOriginalCurrentPcbViaWriteOwner,
  currentPcbViaWriteAllocationOutcome, originalCurrentPcbViaWriteNoResource, requireOriginalCurrentPcbViaWriteNoResourceProof, requireOriginalCurrentPcbViaNativeObservation, requireOriginalCurrentPcbViaSceneObservation,
  requireOriginalCurrentPcbViaWriteStage, originalCurrentPcbViaWriteClosedEffects, originalCurrentPcbViaWriteTarget, originalCurrentPcbViaWriteTermination, assertOriginalCurrentPcbViaWriteTermination } from "./current-pcb-diagnostic-owner.ts";
export type { CurrentPcbViaClockSetup, CurrentPcbViaMainSetup, CurrentPcbViaNativeObservation, CurrentPcbViaSaveWorkerSetup, CurrentPcbViaSceneObservation } from "./current-pcb-diagnostic-owner.ts";
export type { CurrentPcbViaWriteNoResourceProof } from "./current-pcb-diagnostic-owner.ts";
