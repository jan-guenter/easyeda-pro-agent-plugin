/** A partial original trace ends with the CM ticket body held. Its native
 * timer ID and pending Promise are evidence, never completion capabilities. */
import type { CurrentSchematicRelevanceModifyCmHeld } from "./current-schematic-relevance-modify-cm-delivery.ts";
import type { CurrentSchematicRelevanceModifyCmControlHeld } from "./current-schematic-relevance-modify-cm-control-controller.ts";
import type { CurrentSchematicRelevanceModifyCanvasBefore, CurrentSchematicRelevanceModifyCanvasConstructed, CurrentSchematicRelevanceModifyCanvasDataChangeEntry, CurrentSchematicRelevanceModifyCanvasEntry, CurrentSchematicRelevanceModifyCanvasExecutor, CurrentSchematicRelevanceModifyCanvasRegistered } from "./current-schematic-relevance-modify-canvas-collector.ts";

export interface CurrentSchematicRelevanceModifyCanvasTicketHeld {
 readonly cm: CurrentSchematicRelevanceModifyCmHeld; readonly before: CurrentSchematicRelevanceModifyCanvasBefore; readonly data: CurrentSchematicRelevanceModifyCanvasDataChangeEntry;
 readonly entry: CurrentSchematicRelevanceModifyCanvasEntry; readonly executor: CurrentSchematicRelevanceModifyCanvasExecutor; readonly constructed: CurrentSchematicRelevanceModifyCanvasConstructed; readonly registered: CurrentSchematicRelevanceModifyCanvasRegistered;
 readonly returnedFrameObjectId: string; readonly held: CurrentSchematicRelevanceModifyCmControlHeld;
 readonly originalOnChangeResumeConsumed: true; readonly originalCanvasResumesConsumed: 6; readonly originalTicketBodyHeld: true;
 readonly workerTextObserved: false; readonly nativeCanvasTimerDeliveryVerified: false; readonly workerCompleted: false; readonly modifyCompleted: false; readonly saveAuthorized: false;
}
