/** Closed internal source-cursor identity. Neither member issues authority;
 * each original purpose retains its own factory, packet registry and sender. */
import type { CurrentPcbViaMainOrigin } from "./current-pcb-via-main-origin.ts";
import type { CurrentSchematicRelevanceDisplaySaveMainOrigin } from "./current-schematic-relevance-display-save-main-origin.ts";

export type CurrentSelectedProjectMainOrigin = CurrentPcbViaMainOrigin | CurrentSchematicRelevanceDisplaySaveMainOrigin;
