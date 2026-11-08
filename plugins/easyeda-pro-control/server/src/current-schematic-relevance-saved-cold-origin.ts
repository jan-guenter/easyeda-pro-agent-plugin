/** Own original readonly loading receipt. It can describe completed historical
 * worker observations after cleanup, but never authorize a replacement owner. */
import type { GeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import type { CurrentSchematicRelevanceSavedLoadingPreparation } from "./current-schematic-relevance-saved-cache-control.ts";
import type { CurrentSchematicRelevanceSavedColdObservedData } from "./current-schematic-relevance-saved-cold-observer.ts";
import type { CurrentPcbViaSavedLoadProjectSourceHeld } from "./current-pcb-via-saved-load-bootstrap.ts";
import type { CurrentPcbViaSavedLoadWorkerPair } from "./current-pcb-via-saved-load-controller.ts";

export interface CurrentSchematicRelevanceSavedColdObservation { readonly profile: "private.current-schematic-relevance-saved-cold-observation.v1" }
export interface CurrentSchematicRelevanceSavedColdObservationBindings {
  readonly prepared: GeneratedSchematicRelevanceSavedReadbackPlan; readonly loadingPreparation: CurrentSchematicRelevanceSavedLoadingPreparation;
  readonly data: CurrentSchematicRelevanceSavedColdObservedData; readonly originalSource: CurrentPcbViaSavedLoadProjectSourceHeld;
  readonly originalWorkerPair: CurrentPcbViaSavedLoadWorkerPair;
  readonly originalNativeCompletionAcknowledged: true; readonly selectedSqlStayedReadonly: true; readonly reopenedVerified: false;
}
export { requireOriginalCurrentSchematicRelevanceSavedColdObservation } from "./current-pcb-diagnostic-owner.ts";
