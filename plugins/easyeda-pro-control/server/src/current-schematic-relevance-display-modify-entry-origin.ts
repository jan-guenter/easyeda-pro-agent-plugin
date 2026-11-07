/** Only the original SCH generation issues this still-held invocation role. */
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand } from "./current-schematic-relevance-display-modify-entry-protocol.ts";

export interface CurrentSchematicRelevanceDisplayModifyEntryOrigin { readonly profile: "private.current-schematic-relevance-display-modify-entry-origin.v1" }
export interface CurrentSchematicRelevanceDisplayModifyEntryBindings {
  readonly holderObjectId: string; readonly idleActionObjectId: string; readonly targetJson: string; readonly operationJson: string;
  readonly waitOriginalRunEntry: () => Promise<Readonly<{ callFrameId: string }>>;
  readonly request: (command: CurrentSchematicRelevanceDisplayModifyEntryCommand) => Promise<unknown>;
  readonly assertCurrent: () => Promise<void>;
  readonly fail: () => void;
}
