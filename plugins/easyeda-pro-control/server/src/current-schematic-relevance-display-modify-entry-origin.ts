/** Only the original SCH generation issues this still-held invocation role. */
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import type { CurrentSchematicRelevanceRawCapture } from "./current-schematic-relevance-action-raw-cursor.ts";

export interface CurrentSchematicRelevanceDisplayModifyEntryOrigin { readonly profile: "private.current-schematic-relevance-display-modify-entry-origin.v1" }
export interface CurrentSchematicRelevanceDisplayModifyEntryBindings {
  readonly holderObjectId: string; readonly idleActionObjectId: string; readonly targetJson: string; readonly operationJson: string;
  readonly waitOriginalRunEntry: () => Promise<Readonly<{ callFrameId: string }>>;
  readonly request: (command: CurrentSchematicRelevanceDisplayModifyEntryCommand) => Promise<unknown>;
  readonly nextRawCommand: () => CurrentSchematicRelevanceDisplayModifyEntryCommand | null;
  readonly requireRawCapture: () => CurrentSchematicRelevanceRawCapture;
  readonly assertCurrent: () => Promise<void>;
  readonly fail: () => void;
}
