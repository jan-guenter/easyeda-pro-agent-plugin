/** Separate original pre-project origins. Their central owner registries,
 * not these interfaces or serialized fields, issue native worker custody. */
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentProjectSaveStructureCommand } from "./current-project-save-structure-protocol.ts";
import type { GeneratedFixtureOpenCheckpoint } from "./managed-fixture-generated-open-checkpoint.ts";
import type { GeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";

export interface CurrentPcbViaSaveStructureOrigin { readonly profile: "private.current-pcb-via-save-structure-origin.v1" }
export interface CurrentSchematicDisplaySaveStructureOrigin { readonly profile: "private.current-schematic-display-save-structure-origin.v1" }
export interface CurrentFootprintInverseStructureOrigin { readonly profile: "private.current-footprint-inverse-structure-origin.v1" }
export type CurrentProjectSaveStructureOrigin = CurrentPcbViaSaveStructureOrigin | CurrentSchematicDisplaySaveStructureOrigin | CurrentFootprintInverseStructureOrigin;
export interface CurrentProjectSaveStructureEvent { readonly method: "Debugger.paused" | "Debugger.resumed"; readonly sessionId: string; readonly params: unknown }
export interface CurrentGeneratedProjectSaveStructureBindings {
  readonly sessionId: string; readonly scriptId: string; readonly uniqueContextId: string;
  readonly prepared: GeneratedFixtureOpenCheckpoint | GeneratedSchematicFixtureOpenCheckpoint;
  readonly request: (command: CurrentProjectSaveStructureCommand, cleanup: boolean, retainAllocationReply?: (reply: unknown) => void) => Promise<unknown>;
  /** One original controller router lane for the seven producer constructor
   * captures, pre-EP bootstrap and later held structure publication. It waits the same retained source
   * resume Promise before reading; it never starts another native event poll. */
  readonly nextEvent: () => Promise<CurrentProjectSaveStructureEvent>;
  readonly assertCurrent: () => Promise<void>; readonly assertStartupPending: () => void; readonly assertOperationPending: () => void;
  readonly assertOriginalGenerationExited: () => Promise<void>; readonly fail: () => void;
}
/** A separate inverse data checkpoint may reach only the shared original
 * constructor collector. Generated packet/startup/history expectations reject it. */
export type CurrentFootprintInverseStructureBindings = Omit<CurrentGeneratedProjectSaveStructureBindings, "prepared"> & Readonly<{ prepared: CurrentFootprintForwardSavedCheckpoint }>;
export type CurrentProjectSaveStructureBindings = Omit<CurrentGeneratedProjectSaveStructureBindings, "prepared"> & Readonly<{ prepared: CurrentGeneratedProjectSaveStructureBindings["prepared"] | CurrentFootprintForwardSavedCheckpoint }>;
/** Issued only by the original main service after all history/project SQL
 * native callbacks complete. No SDK/worker Save acknowledgement is required:
 * that continuation may still be paused behind the structure packet. */
export interface CurrentProjectHistorySqlCompletion { readonly profile: "private.current-project-history-sql-completion.v1" }
export interface CurrentProjectHistorySqlCompletionValue {
  readonly projectUuid: string; readonly branchUuid: string; readonly documentUuid: string;
  readonly bodySha256: string; readonly saveHeadTicket: number; readonly workerClock: number;
  readonly workerEditVersion: string | null;
  readonly originalHistoryNativeCallbacksCompleted: true; readonly selectedSqlStillFenced: true;
}

/** Opaque inverse-only setup hold. It never grants a generated startup resume. */
export interface CurrentFootprintInverseBootstrapHeld { readonly profile: "private.current-footprint-inverse-bootstrap-held.v1" }
export interface CurrentFootprintInverseBootstrapArguments {
  readonly sessionId: string; readonly scriptId: string; readonly uniqueContextId: string;
  readonly project: string; readonly uploadWrapper: string; readonly structureWrapper: string;
  readonly uploadCallback: string; readonly debounce: string; readonly structureCallback: string;
}
export type CurrentFootprintInverseBootstrapPrepared = CurrentFootprintForwardSavedCheckpoint;
