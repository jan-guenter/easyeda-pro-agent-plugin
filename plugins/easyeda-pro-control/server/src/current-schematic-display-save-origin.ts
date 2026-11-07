/** Implemented only by the original pre-project suspended schematic worker birth.
 * A structural interface or serialized field can never issue this capability. */
import type { CurrentSchematicDisplaySaveCommand } from "./current-schematic-display-save-protocol.ts";
import type { CurrentSchematicDisplaySaveSource } from "./current-schematic-display-save-source.ts";

export interface CurrentSchematicDisplaySaveWorkerOrigin { readonly profile: "private.current-schematic-display-save-worker-origin.v1" | "private.current-schematic-relevance-display-save-worker-origin.v1" | "private.current-schematic-wire-edit-save-worker-origin.v1" }
export interface CurrentSchematicDisplaySaveWorkerEvent { readonly method: "Debugger.paused" | "Debugger.resumed"; readonly sessionId: string; readonly params: unknown }
export interface CurrentSchematicDisplaySaveWorkerBindings {
  readonly sessionId: string; readonly scriptId: string; readonly uniqueContextId: string; readonly source: CurrentSchematicDisplaySaveSource;
  readonly request: (command: CurrentSchematicDisplaySaveCommand, cleanup: boolean) => Promise<unknown>;
  /** The original native owner supplies a finite deadline and retains the
   * same request through settlement/Job abort; no race-and-forget reader. */
  readonly nextEvent: () => Promise<CurrentSchematicDisplaySaveWorkerEvent>;
  readonly assertCurrent: () => Promise<void>;
  readonly assertSaveAttempt: () => void;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly fail: () => void;
}
