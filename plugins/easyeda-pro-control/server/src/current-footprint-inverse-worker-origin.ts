/** Own inverse source hold. This is an original-process token; inert fixed
 * bootstrap source data alone cannot construct it or authorize a delete. */
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentPcbViaSavedLoadProjectSourceHeld } from "./current-pcb-via-saved-load-bootstrap.ts";
import type { CurrentFootprintInverseWorkerPair } from "./current-footprint-inverse-worker-controller.ts";

export interface CurrentFootprintInverseWorkerOrigin { readonly profile: "private.current-footprint-inverse-worker-origin.v1"; }
export interface CurrentFootprintInverseWorkerBindings {
  readonly prepared: CurrentFootprintForwardSavedCheckpoint; readonly pair: CurrentFootprintInverseWorkerPair;
  readonly source: CurrentPcbViaSavedLoadProjectSourceHeld; readonly projectInitialSourceRemainsPaused: true;
  readonly assertCurrent: () => Promise<void>; readonly deleteInvocationAuthorized: false; readonly executionAuthorized: false;
}
