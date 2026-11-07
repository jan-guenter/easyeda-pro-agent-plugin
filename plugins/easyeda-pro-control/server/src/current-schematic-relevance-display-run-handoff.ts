/** Fixed original run/callback handoff only. Structural values do not issue
 * either origin, continue a pause or install an application callback. */
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

export interface CurrentSchematicRelevanceDisplayActionCallbackOrigin { readonly profile: "private.current-schematic-relevance-display-action-callback-origin.v1" }
export type CurrentSchematicRelevanceDisplayActionCallbackSetup = (origin: CurrentSchematicRelevanceDisplayActionCallbackOrigin) => Promise<void>;
/** Core arms this original event lane before the once-only run resume. The
 * run owner separately requires its native write ACK and resumed event before
 * handing the still-held callback entry to its original setup. */
export interface CurrentSchematicRelevanceDisplayActionCallbackHandoff {
  readonly assertArmed: () => void;
  readonly observeOriginalEvent: (event: DiagnosticEvent) => boolean;
  readonly entry: Promise<CurrentSchematicRelevanceDisplayActionCallbackOrigin>;
  readonly fail: () => void;
}
