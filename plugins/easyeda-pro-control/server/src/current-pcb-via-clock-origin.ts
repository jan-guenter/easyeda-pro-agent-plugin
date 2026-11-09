/** A matching object cannot issue Via clock custody. Only the original Via
 * native owner binds these two sessions, its SDK tuple and selected worker. */
import type { CurrentPcbViaClockCommand } from "./current-pcb-via-clock-protocol.ts";
import type { CurrentPcbViaSaveSource } from "./current-pcb-via-save-source.ts";

export interface CurrentPcbViaClockOrigin { readonly profile: "private.current-pcb-via-clock-origin.v1" }
export type CurrentPcbViaClockRealm = "worker" | "ui";
export interface CurrentPcbViaClockEvent { readonly method: "Debugger.paused" | "Debugger.resumed"; readonly sessionId: string; readonly params: unknown }
export interface CurrentPcbViaClockBindings {
  readonly workerSessionId: string; readonly uiSessionId: string; readonly workerScriptId: string; readonly workerUniqueContextId: string;
  readonly uiSdkObjectId: string; readonly windowTabId: string; readonly workerSource: CurrentPcbViaSaveSource;
  readonly request: (command: CurrentPcbViaClockCommand, realm: CurrentPcbViaClockRealm, cleanup: boolean) => Promise<unknown>;
  /** One original finite poll pump routes each paused/resumed pair by its
   * actual installed breakpoint ID; no reader abandons a pending native call. */
  readonly nextEvent: () => Promise<CurrentPcbViaClockEvent>;
  readonly assertCurrent: () => Promise<void>;
  /** Original attempt remains retained even after SDK acknowledgement. */
  readonly assertSaveAttempt: () => void;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly fail: () => void;
}
