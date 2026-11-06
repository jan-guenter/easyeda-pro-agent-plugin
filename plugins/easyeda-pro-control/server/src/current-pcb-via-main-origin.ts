/** Visible fields issue no main cursor. Only the retained original selected
 * backend can populate the private registry used by the Via native owner. */
import type { CurrentPcbViaMainCommand } from "./current-pcb-via-main-protocol.ts";
import type { CurrentFootprintCopyMainRequestSource } from "./current-footprint-copy-main-request-source.ts";
import type { CurrentSelectedFileMainRequestObservation } from "./current-selected-file-main-request-reader.ts";

export interface CurrentPcbViaMainOrigin { readonly profile: "private.current-pcb-via-main-origin.v1" }
export interface CurrentPcbViaMainEvent { readonly method: "Debugger.paused" | "Debugger.resumed"; readonly params: unknown }
export interface CurrentPcbViaMainBackendBindings {
  readonly scriptId: string; readonly constructionObjectId: string; readonly source: CurrentFootprintCopyMainRequestSource;
  readonly persistentDriverBreakpointId: string;
  readonly request: (command: CurrentPcbViaMainCommand, cleanup: boolean) => Promise<unknown>;
  readonly nextEvent: () => Promise<CurrentPcbViaMainEvent>;
  readonly observeRequest: () => Promise<CurrentSelectedFileMainRequestObservation>;
  readonly requireOriginalRequest: (packet: CurrentSelectedFileMainRequestObservation) => void;
  readonly continueReadonlyRequest: (packet: CurrentSelectedFileMainRequestObservation) => Promise<void>;
  readonly assertCurrent: () => Promise<void>;
  readonly fail: () => void;
}
export interface CurrentPcbViaMainBindings extends CurrentPcbViaMainBackendBindings { readonly assertSaveAttempt: () => void }
