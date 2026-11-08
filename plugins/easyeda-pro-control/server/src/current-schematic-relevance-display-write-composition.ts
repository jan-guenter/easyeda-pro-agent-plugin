/** Fixed original group interface. Presence alone proves no effect, Save,
 * worker completion or SQL result; each original receipt is joined separately. */
import type { GeneratedSchematicRelevanceDisplayStageResult } from "./generated-schematic-relevance-display.ts";
import type { GeneratedSchematicRelevanceDisplayNativeEffect } from "./generated-schematic-relevance-display-effect.ts";
import type { CurrentSchematicRelevanceDisplaySaveDrained } from "./current-schematic-relevance-display-save-drained.ts";

export interface CurrentSchematicRelevanceDisplayWriteComposition {
  readonly continueOriginalRun: () => Promise<void>;
  readonly waitOriginalModification: () => Promise<GeneratedSchematicRelevanceDisplayStageResult>;
  readonly observeAfterModification: () => Promise<GeneratedSchematicRelevanceDisplayStageResult>;
  readonly armSaveClock: (effect: GeneratedSchematicRelevanceDisplayNativeEffect) => Promise<void>;
  readonly prepareSaveMain: (effect: GeneratedSchematicRelevanceDisplayNativeEffect) => Promise<void>;
  readonly observeOriginalSave: () => Promise<void>;
  readonly serviceSaveLocalCalls: () => Promise<void>;
  readonly drainOriginalSave: () => Promise<void>;
  readonly requireOriginalSaveDrained: () => CurrentSchematicRelevanceDisplaySaveDrained;
}
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_COMPOSITION_METHODS = Object.freeze([
  "continueOriginalRun", "waitOriginalModification", "observeAfterModification", "armSaveClock", "prepareSaveMain", "observeOriginalSave",
  "serviceSaveLocalCalls", "drainOriginalSave", "requireOriginalSaveDrained",
] as const satisfies readonly (keyof CurrentSchematicRelevanceDisplayWriteComposition)[]);
