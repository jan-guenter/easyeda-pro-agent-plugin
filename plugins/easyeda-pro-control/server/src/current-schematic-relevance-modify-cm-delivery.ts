/** Historical data from the original nested CM continuation. Core alone
 * retains the actual held events; this packet grants no further body or Save. */
import type { CurrentSchematicRelevanceModifyBatchHeld } from "./current-schematic-relevance-modify-delivery.ts";
import type { CurrentSchematicRelevanceModifyCmBefore, CurrentSchematicRelevanceModifyCmEntry } from "./current-schematic-relevance-modify-cm-collector.ts";
import type { CurrentSchematicRelevanceModifyCmDeltaPrepared } from "./current-schematic-relevance-modify-cm-delta-collector.ts";
import type { CurrentSchematicRelevanceModifyCmControlHeld } from "./current-schematic-relevance-modify-cm-control-controller.ts";

export interface CurrentSchematicRelevanceModifyCmHeld {
 readonly batch: CurrentSchematicRelevanceModifyBatchHeld;
 readonly before: CurrentSchematicRelevanceModifyCmBefore;
 readonly entry: CurrentSchematicRelevanceModifyCmEntry;
 readonly delta: CurrentSchematicRelevanceModifyCmDeltaPrepared;
 readonly held: CurrentSchematicRelevanceModifyCmControlHeld;
 readonly originalBatchResumeConsumed: true;
 readonly originalRemoteResumeConsumed: true;
 readonly originalOnChangeBodyHeld: true;
 readonly workerTextObserved: false;
 readonly workerCompleted: false;
 readonly modifyCompleted: false;
 readonly saveAuthorized: false;
}
