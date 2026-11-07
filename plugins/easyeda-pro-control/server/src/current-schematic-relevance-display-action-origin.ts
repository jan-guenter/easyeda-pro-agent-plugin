/** Only the original SCH owner issues this holder/intent-bound readonly role. */
import type { CurrentSchematicDisplayActionCommand } from "./current-schematic-display-action-protocol.ts";

export interface CurrentSchematicRelevanceDisplayActionOrigin { readonly profile: "private.current-schematic-relevance-display-action-origin.v1" }
export interface CurrentSchematicDisplayActionBindings {
  readonly holderObjectId: string; readonly targetJson: string; readonly operationJson: string;
  readonly request: (command: CurrentSchematicDisplayActionCommand, cleanup: boolean) => Promise<unknown>;
  readonly assertCurrent: () => Promise<void>; readonly assertOriginalGenerationExited: () => Promise<void>; readonly fail: () => void;
}

/** The original seven-record owner alone issues the exact three-point guard. */
export interface CurrentSchematicRelevanceDisplayActionGuardObservation {
  readonly profile: "private.current-schematic-relevance-display-action-guard-observation.v1";
  readonly originalRunnerEntryPointArmed: true; readonly originalSetterPointsArmed: true;
  readonly actualInvocationObserved: false; readonly continuationAuthorized: false; readonly modifyAuthorized: false; readonly saveAuthorized: false;
}
