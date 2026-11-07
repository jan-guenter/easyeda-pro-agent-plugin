/** Original seven-record native-stage proof. The inert projected effect keeps
 * its original false provenance fields and is never reinterpreted as a grant. */
import type { GeneratedSchematicRelevanceDisplayProjectedEffect } from "./generated-schematic-relevance-display-effect-data.ts";

export interface GeneratedSchematicRelevanceDisplayNativeEffect {
  readonly profile: "private.generated-schematic-relevance-display-native-effect.v1";
  readonly projection: GeneratedSchematicRelevanceDisplayProjectedEffect;
  readonly originalNativeStagesJoined: true;
}
// The original native issuer owns the registry. Type-only imports cannot reconstruct its proof.
export { qualifyOriginalGeneratedSchematicRelevanceDisplayEffect, requireOriginalGeneratedSchematicRelevanceDisplayEffect } from "./current-pcb-diagnostic-owner.ts";
