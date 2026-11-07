/** Issued only for one original still-held seven-record run. No structural
 * value supplies the private owner/cursor enrollment. */
import type { CurrentSchematicRelevanceRunPrefixCommand } from "./current-schematic-relevance-run-prefix-protocol.ts";
import type { CurrentSchematicRelevanceRunPrefixCapture } from "./current-schematic-relevance-run-prefix-cursor.ts";

export interface CurrentSchematicRelevanceRunPrefixOrigin { readonly profile: "private.current-schematic-relevance-run-prefix-origin.v1" }
export interface CurrentSchematicRelevanceRunPrefixBindings {
  readonly nextCommand: () => CurrentSchematicRelevanceRunPrefixCommand | null;
  readonly request: (command: CurrentSchematicRelevanceRunPrefixCommand) => Promise<unknown>;
  readonly complete: () => Promise<void>;
  readonly requireCapture: () => CurrentSchematicRelevanceRunPrefixCapture;
  readonly assertCurrent: () => Promise<void>;
  readonly fail: () => void;
}
