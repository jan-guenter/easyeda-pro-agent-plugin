import type { CurrentSchematicRelevancePrimitiveCommand } from "./current-schematic-relevance-primitive-protocol.ts";
import type { CurrentSchematicRelevancePrimitivePrepared, CurrentSchematicRelevancePrimitiveRecordHeld } from "./current-schematic-relevance-primitive-cursor.ts";
import type { CurrentSchematicRelevanceUiPublicationCommand } from "./current-schematic-relevance-ui-publication-protocol.ts";
import type { CurrentSchematicRelevanceUiPublicationReceipt } from "./current-schematic-relevance-ui-publication-cursor.ts";
/** Original callback entry custody. This read lane cannot continue a setter. */
import type { CurrentSchematicRelevanceDisplayActionCallbackOrigin } from "./current-schematic-relevance-display-run-handoff.ts";
import type { CurrentSchematicRelevanceActiveHistoryReceipt } from "./current-schematic-relevance-active-history-cursor.ts";
import type { CurrentSchematicRelevanceFirstSetterReceipt } from "./current-schematic-relevance-first-setter-cursor.ts";
import type { CurrentSchematicRelevanceSetAttributeReceipt, CurrentSchematicRelevanceUnderlineBridgeReceipt } from "./current-schematic-relevance-underline-bridge-cursor.ts";
import type { CurrentSchematicRelevanceActionCallbackEntry } from "./current-schematic-relevance-action-callback-cursor.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand } from "./current-schematic-relevance-display-modify-entry-protocol.ts";

export type { CurrentSchematicRelevanceDisplayActionCallbackOrigin } from "./current-schematic-relevance-display-run-handoff.ts";
export interface CurrentSchematicRelevanceActionCallbackBindings {
  readonly nextEntryCommand: () => CurrentSchematicRelevanceDisplayModifyEntryCommand | null;
  readonly requestEntry: (command: CurrentSchematicRelevanceDisplayModifyEntryCommand) => Promise<unknown>;
  readonly nextFirstSetterCommand: () => CurrentSchematicRelevanceDisplayModifyEntryCommand | null;
  readonly requestFirstSetter: (command: CurrentSchematicRelevanceDisplayModifyEntryCommand) => Promise<unknown>;
  readonly requireOriginalFirstSetter: () => CurrentSchematicRelevanceFirstSetterReceipt;
  readonly nextUnderlineBridgeCommand: () => CurrentSchematicRelevanceDisplayModifyEntryCommand | null;
  readonly requestUnderlineBridge: (command: CurrentSchematicRelevanceDisplayModifyEntryCommand) => Promise<unknown>;
  readonly requireOriginalUnderlineBridge: () => CurrentSchematicRelevanceUnderlineBridgeReceipt;
  readonly continueToSetAttribute: () => Promise<void>;
  readonly nextSetAttributeCommand: () => CurrentSchematicRelevanceDisplayModifyEntryCommand | null;
  readonly requestSetAttribute: (command: CurrentSchematicRelevanceDisplayModifyEntryCommand) => Promise<unknown>;
  readonly nextActiveHistoryCommand: () => CurrentSchematicRelevanceDisplayModifyEntryCommand | null;
  readonly requestActiveHistory: (command: CurrentSchematicRelevanceDisplayModifyEntryCommand) => Promise<unknown>;
  readonly nextPrimitiveBeforeCommand: () => CurrentSchematicRelevancePrimitiveCommand | null;
  readonly requestPrimitiveBefore: (command: CurrentSchematicRelevancePrimitiveCommand) => Promise<unknown>;
  readonly requireOriginalPrimitivePrepared: () => CurrentSchematicRelevancePrimitivePrepared;
  readonly continueToRecord: () => Promise<void>;
  readonly nextPrimitiveRecordCommand: () => CurrentSchematicRelevancePrimitiveCommand | null;
  readonly requestPrimitiveRecord: (command: CurrentSchematicRelevancePrimitiveCommand) => Promise<unknown>;
  readonly requireOriginalPrimitiveRecordHeld: () => CurrentSchematicRelevancePrimitiveRecordHeld;
  readonly nextUiPublicationCommand: () => CurrentSchematicRelevanceUiPublicationCommand | null;
  readonly requestUiPublication: (command: CurrentSchematicRelevanceUiPublicationCommand) => Promise<unknown>;
  readonly requireOriginalUiPublication: () => CurrentSchematicRelevanceUiPublicationReceipt;
  readonly requireOriginalActiveHistory: () => CurrentSchematicRelevanceActiveHistoryReceipt;
  readonly requireOriginalSetAttribute: () => CurrentSchematicRelevanceSetAttributeReceipt;
  readonly continueToFirstSetter: () => Promise<void>;
  readonly requireOriginalEntry: () => CurrentSchematicRelevanceActionCallbackEntry;
  readonly assertCurrent: () => Promise<void>; readonly fail: () => void;
}
export type CurrentSchematicRelevanceActionCallbackOriginalOrigin = CurrentSchematicRelevanceDisplayActionCallbackOrigin;
