/** Original consumed transfers are retained as a private partial trace. The
 * Canvas timer is still held and none of these data fields issues completion. */
import type { CurrentSchematicRelevanceModifyCanvasTicketHeld } from "./current-schematic-relevance-modify-canvas-delivery.ts";
import type { CurrentSchematicRelevanceModifyCanvasHeld } from "./current-schematic-relevance-modify-canvas-controller.ts";
import type { CurrentSchematicRelevanceModifyReturnBatchReturned, CurrentSchematicRelevanceModifyReturnBefore, CurrentSchematicRelevanceModifyReturnCleared, CurrentSchematicRelevanceModifyReturnHandlerReturned, CurrentSchematicRelevanceModifyReturnIntroduced, CurrentSchematicRelevanceModifyReturnTimerEntry, CurrentSchematicRelevanceModifyReturnWebsocket } from "./current-schematic-relevance-modify-return-collector.ts";

export interface CurrentSchematicRelevanceModifyReturnTimerHeld {
 readonly canvas: CurrentSchematicRelevanceModifyCanvasTicketHeld;
 readonly before: CurrentSchematicRelevanceModifyReturnBefore; readonly introduced: CurrentSchematicRelevanceModifyReturnIntroduced; readonly cleared: CurrentSchematicRelevanceModifyReturnCleared;
 readonly websocket: CurrentSchematicRelevanceModifyReturnWebsocket; readonly batchReturned: CurrentSchematicRelevanceModifyReturnBatchReturned; readonly handlerReturned: CurrentSchematicRelevanceModifyReturnHandlerReturned; readonly timer: CurrentSchematicRelevanceModifyReturnTimerEntry;
 readonly held: CurrentSchematicRelevanceModifyCanvasHeld; readonly notificationTimerCancelled: true; readonly notificationTimerId: number; readonly canvasTimerId: number;
 readonly publicTicketNotificationParity: false; readonly originalCmReturnsConsumed: true; readonly originalHandlerReturned: true; readonly originalTextSerialCompleted: true; readonly originalCanvasTimerBodyHeld: true;
 readonly nativeCanvasTimerDeliveryVerified: false; readonly workerCompleted: false; readonly modifyCompleted: false; readonly saveAuthorized: false;
}
