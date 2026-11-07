/** A matching object cannot issue SCH clock custody. Only the original SCH
 * native owner binds these two sessions, its SDK tuple and selected worker. */
import type { CurrentSchematicDisplayClockCommand } from "./current-schematic-display-clock-protocol.ts";
import type { CurrentSchematicDisplaySaveSource } from "./current-schematic-display-save-source.ts";

export interface CurrentSchematicDisplayClockOrigin { readonly profile: "private.current-schematic-display-clock-origin.v1" }
export type CurrentSchematicDisplayClockRealm = "worker" | "ui";
export interface CurrentSchematicDisplayClockEvent { readonly method: "Debugger.paused" | "Debugger.resumed"; readonly sessionId: string; readonly params: unknown }
export interface CurrentSchematicDisplayClockBindings {
  readonly workerSessionId: string; readonly uiSessionId: string; readonly workerScriptId: string; readonly workerUniqueContextId: string;
  readonly uiSdkObjectId: string; readonly windowTabId: string; readonly workerSource: CurrentSchematicDisplaySaveSource;
  readonly request: (command: CurrentSchematicDisplayClockCommand, realm: CurrentSchematicDisplayClockRealm, cleanup: boolean) => Promise<unknown>;
  /** One original finite poll pump routes each paused/resumed pair by its
   * actual installed breakpoint ID; no reader abandons a pending native call. */
  readonly nextEvent: () => Promise<CurrentSchematicDisplayClockEvent>;
  readonly assertCurrent: () => Promise<void>;
  /** Original attempt remains retained even after SDK acknowledgement. */
  readonly assertSaveAttempt: () => void;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly fail: () => void;
}
