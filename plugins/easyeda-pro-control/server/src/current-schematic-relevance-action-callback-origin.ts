/** Original callback entry custody. This read lane cannot continue a setter. */
import type { CurrentSchematicRelevanceDisplayActionCallbackOrigin } from "./current-schematic-relevance-display-run-handoff.ts";
import type { CurrentSchematicRelevanceFirstSetterReceipt } from "./current-schematic-relevance-first-setter-cursor.ts";
import type { CurrentSchematicRelevanceActionCallbackEntry } from "./current-schematic-relevance-action-callback-cursor.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand } from "./current-schematic-relevance-display-modify-entry-protocol.ts";

export type { CurrentSchematicRelevanceDisplayActionCallbackOrigin } from "./current-schematic-relevance-display-run-handoff.ts";
export interface CurrentSchematicRelevanceActionCallbackBindings {
  readonly nextEntryCommand: () => CurrentSchematicRelevanceDisplayModifyEntryCommand | null;
  readonly requestEntry: (command: CurrentSchematicRelevanceDisplayModifyEntryCommand) => Promise<unknown>;
  readonly nextFirstSetterCommand: () => CurrentSchematicRelevanceDisplayModifyEntryCommand | null;
  readonly requestFirstSetter: (command: CurrentSchematicRelevanceDisplayModifyEntryCommand) => Promise<unknown>;
  readonly requireOriginalFirstSetter: () => CurrentSchematicRelevanceFirstSetterReceipt;
  readonly continueToFirstSetter: () => Promise<void>;
  readonly requireOriginalEntry: () => CurrentSchematicRelevanceActionCallbackEntry;
  readonly assertCurrent: () => Promise<void>; readonly fail: () => void;
}
export type CurrentSchematicRelevanceActionCallbackOriginalOrigin = CurrentSchematicRelevanceDisplayActionCallbackOrigin;
