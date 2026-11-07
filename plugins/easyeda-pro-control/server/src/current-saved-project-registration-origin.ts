/** Nominal private intent only. The original saved Core's private registry,
 * retained exact MainBackendRunner and pending once-consumed dispatch supply
 * authority. This shape and serialized data cannot recreate that registry. */
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import type { CurrentPcbViaWriteClosedCheckpoint } from "./current-pcb-via-write-closed-checkpoint.ts";

export interface CurrentSavedProjectRegistrationIntent { readonly profile: "private.current-saved-project-registration-intent.v1" }
export interface CurrentSavedProjectRegistrationBindings {
  readonly prepared: CurrentPcbViaWriteClosedCheckpoint;
  readonly target: CurrentDisposableOpenSealedTarget;
  readonly assertCurrent: () => Promise<void>;
  /** Requires the actual original registration pipe Promise to remain pending;
   * an enrolled plan, callback identity or copied data alone is insufficient. */
  readonly assertOriginalDispatchPending: () => void;
}
