/** Seven-record original Main identity. Visible fields cannot recreate the
 * original selected-file cursor, Save body or callback lineage. */
import type { CurrentPcbViaMainBackendBindings } from "./current-pcb-via-main-origin.ts";

export interface CurrentSchematicRelevanceDisplaySaveMainOrigin {
  readonly profile: "private.current-schematic-relevance-display-save-main-origin.v1";
}
export type CurrentSchematicRelevanceDisplaySaveMainBackendBindings = Omit<CurrentPcbViaMainBackendBindings,
  "structureRequest" | "requireStructureArmed" | "startStructure" | "structureExpected" | "originalStructureEffects" |
  "liveHistoryRequest" | "originalLiveHistoryRequestObjectId" | "originalLiveHistoryRows">;
export interface CurrentSchematicRelevanceDisplaySaveMainBindings extends CurrentSchematicRelevanceDisplaySaveMainBackendBindings {
  readonly assertSaveAttempt: () => void;
}
export type CurrentSchematicRelevanceDisplaySaveMainSetup = (origin: CurrentSchematicRelevanceDisplaySaveMainOrigin) => Promise<void>;
