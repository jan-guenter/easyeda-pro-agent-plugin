/** Original Wire stages retain their own issuer. The data projection keeps
 * false provenance fields and cannot authorize callbacks, SQL or Save. */
import type { GeneratedSchematicWireLifecycleProjectedEffect } from "./generated-schematic-wire-lifecycle-effect.ts";

export interface GeneratedSchematicWireNativeEffect {
  readonly profile: "private.generated-schematic-wire-native-effect.v1";
  readonly projection: GeneratedSchematicWireLifecycleProjectedEffect;
  readonly originalNativeStagesJoined: true;
}
export { qualifyOriginalGeneratedSchematicWireEffect, requireOriginalGeneratedSchematicWireEffect } from "./current-pcb-diagnostic-owner.ts";
