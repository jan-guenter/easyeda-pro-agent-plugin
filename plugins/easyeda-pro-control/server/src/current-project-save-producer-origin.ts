/** Private original owner issuance only. Fields and structurally equal
 * objects provide neither worker custody nor a producer continuation. */
import type { CurrentProjectSaveProducerRole } from "./current-project-save-producer-source.ts";
import type { CurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import type { CurrentProjectSaveStructureEvent } from "./current-project-save-structure-origin.ts";

export interface CurrentPcbViaSaveProducerOrigin { readonly profile: "private.current-pcb-via-save-producer-origin.v1" }
export interface CurrentSchematicDisplaySaveProducerOrigin { readonly profile: "private.current-schematic-display-save-producer-origin.v1" | "private.current-schematic-relevance-display-save-producer-origin.v1" }
export type CurrentProjectSaveProducerOrigin = CurrentPcbViaSaveProducerOrigin | CurrentSchematicDisplaySaveProducerOrigin;
export interface CurrentProjectSaveProducerHeldCall { readonly profile: "private.current-project-save-producer-held-call.v1" }
export interface CurrentProjectSaveProducerBindings {
  readonly sessionId: string; readonly scriptId: string;
  readonly request: (command: CurrentProjectSaveProducerCommand) => Promise<unknown>;
  readonly retainHeldCall: () => CurrentProjectSaveProducerHeldCall;
  readonly nextEvent: () => Promise<CurrentProjectSaveStructureEvent>;
  /** Native object IDs are original private captures, never MCP arguments. */
  readonly originalBreakpoint: (role: CurrentProjectSaveProducerRole) => string;
  readonly originalIntrinsics: () => string;
  readonly originalReceivers: () => Readonly<{ project: string; wrapper: string; callback: string }>;
  readonly assertCurrent: () => Promise<void>;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly fail: () => void;
}
