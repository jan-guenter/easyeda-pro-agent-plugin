/** Original native Via owner and exact observation lookups. No structural
 * owner interface, injected function table or serialized packet can issue it. */
export { CurrentPcbViaWriteOwner, startCurrentPcbViaWriteOwner, assertOriginalCurrentPcbViaWriteOwner,
  currentPcbViaWriteAllocationOutcome, requireOriginalCurrentPcbViaNativeObservation, requireOriginalCurrentPcbViaSceneObservation,
  requireOriginalCurrentPcbViaWriteStage } from "./current-pcb-diagnostic-owner.ts";
export type { CurrentPcbViaNativeObservation, CurrentPcbViaSceneObservation } from "./current-pcb-diagnostic-owner.ts";
