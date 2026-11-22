/** Own inverse source hold. This is an original-process token; inert fixed
 * bootstrap source data alone cannot construct it or authorize a delete. */
import type { CurrentFootprintInversePreparedCheckpoint } from "./current-footprint-inverse-prepared-checkpoint.ts";
import type { CurrentPcbViaSavedLoadProjectSourceHeld } from "./current-pcb-via-saved-load-bootstrap.ts";
import type { CurrentFootprintInverseWorkerPair } from "./current-footprint-inverse-v4-worker-controller.ts";

export interface CurrentFootprintInverseWorkerOrigin { readonly profile: "private.current-footprint-inverse-worker-origin.v1"; }
export interface CurrentFootprintInverseWorkerBindings {
  readonly prepared: CurrentFootprintInversePreparedCheckpoint; readonly pair: CurrentFootprintInverseWorkerPair;
  readonly source: CurrentPcbViaSavedLoadProjectSourceHeld; readonly projectInitialSourceRemainsPaused: true;
  readonly assertCurrent: () => Promise<void>; readonly deleteInvocationAuthorized: false; readonly executionAuthorized: false;
}

/** Original constructor receipt. Matching data cannot issue a live bootstrap
 * hold or a delete grant; the central private registry owns both references. */
export interface CurrentFootprintInverseConstruction { readonly profile: "private.current-footprint-inverse-construction.v1" }
