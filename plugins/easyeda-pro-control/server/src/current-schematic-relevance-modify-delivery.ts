/** Actual original-worker receive data at the still-held batch entry. Only
 * the enclosing Core retains this value; it grants no batch body or Save. */
import type { CurrentSchematicRelevanceModifyWorkerPrepared } from "./current-schematic-relevance-modify-worker-collector.ts";
import type { CurrentSchematicRelevanceModifyEventPrepared } from "./current-schematic-relevance-modify-event-collector.ts";
import type { CurrentSchematicRelevanceModifyBodyPrepared } from "./current-schematic-relevance-modify-body-collector.ts";
import type { CurrentSchematicRelevanceModifyControlHeld } from "./current-schematic-relevance-modify-control-controller.ts";

export interface CurrentSchematicRelevanceModifyBatchHeld {
  /** The original fixed [this,s] capture, already joined to this event and
   * PROJECT. Future preparation must reprove it while the same entry is held. */
  readonly frameObjectId: string;
  readonly worker: CurrentSchematicRelevanceModifyWorkerPrepared; readonly event: CurrentSchematicRelevanceModifyEventPrepared; readonly body: CurrentSchematicRelevanceModifyBodyPrepared; readonly held: CurrentSchematicRelevanceModifyControlHeld;
  readonly originalNativePostReturned: true; readonly originalWorkerBatchBodyHeld: true;
  readonly workerTextObserved: false; readonly workerCompleted: false; readonly modifyCompleted: false; readonly saveAuthorized: false;
}
