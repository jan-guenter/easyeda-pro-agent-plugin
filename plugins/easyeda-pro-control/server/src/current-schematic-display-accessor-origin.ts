/** Only the actual original SCH owner can bind this passive metadata origin. */
import type { CurrentSchematicDisplayAccessorCommand } from "./current-schematic-display-accessor-protocol.ts";

export interface CurrentSchematicDisplayAccessorOrigin { readonly profile: "private.current-schematic-display-accessor-origin.v1" }
export interface CurrentSchematicDisplayAccessorBindings {
  readonly sessionId: string; readonly holderObjectId: string; readonly targetJson: string; readonly operationJson: string;
  readonly request: (command: CurrentSchematicDisplayAccessorCommand, cleanup: boolean) => Promise<unknown>;
  readonly assertCurrent: () => Promise<void>; readonly assertOriginalGenerationExited: () => Promise<void>; readonly fail: () => void;
}
