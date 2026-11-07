/** Only the original SCH owner issues this holder/intent-bound readonly role. */
import type { CurrentSchematicDisplayActionCommand } from "./current-schematic-display-action-protocol.ts";

export interface CurrentSchematicDisplayActionOrigin { readonly profile: "private.current-schematic-display-action-origin.v1" }
export interface CurrentSchematicDisplayActionBindings {
  readonly holderObjectId: string; readonly targetJson: string; readonly operationJson: string;
  readonly request: (command: CurrentSchematicDisplayActionCommand, cleanup: boolean) => Promise<unknown>;
  readonly assertCurrent: () => Promise<void>; readonly assertOriginalGenerationExited: () => Promise<void>; readonly fail: () => void;
}
