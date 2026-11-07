/** A distinct fresh scene origin, issuable only after the actual reader's
 * cold-load, page, source and original-context reproof. No JSON issuer exists. */
import type { GeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";

export interface CurrentSchematicRelevanceSavedSceneOrigin { readonly profile: "private.current-schematic-relevance-saved-scene-origin.v1" }
export interface CurrentSchematicRelevanceSavedSceneBindings {
  readonly prepared: GeneratedSchematicRelevanceSavedReadbackPlan;
  readonly windowTabId: string;
  readonly assertCurrent: () => Promise<void>;
}
