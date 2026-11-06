/** Implemented only by the original pre-project suspended Via worker birth.
 * A structural interface or serialized field can never issue this capability. */
import type { CurrentPcbViaSaveCommand } from "./current-pcb-via-save-protocol.ts";
import type { CurrentPcbViaSaveSource } from "./current-pcb-via-save-source.ts";

export interface CurrentPcbViaSaveWorkerOrigin { readonly profile: "private.current-pcb-via-save-worker-origin.v1" }
export interface CurrentPcbViaSaveWorkerEvent { readonly method: "Debugger.paused" | "Debugger.resumed"; readonly sessionId: string; readonly params: unknown }
export interface CurrentPcbViaSaveWorkerBindings {
  readonly sessionId: string; readonly scriptId: string; readonly uniqueContextId: string; readonly source: CurrentPcbViaSaveSource;
  readonly request: (command: CurrentPcbViaSaveCommand, cleanup: boolean) => Promise<unknown>;
  /** The original native owner supplies a finite deadline and retains the
   * same request through settlement/Job abort; no race-and-forget reader. */
  readonly nextEvent: () => Promise<CurrentPcbViaSaveWorkerEvent>;
  readonly assertCurrent: () => Promise<void>;
  readonly assertSaveAttempt: () => void;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly fail: () => void;
}
