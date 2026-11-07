/** Separate inverse intent. Only the inverse Core's private original registry
 * and its actual pending original UI request can grant recent-path bookkeeping. */
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";

export interface CurrentFootprintInverseRegistrationIntent { readonly profile: "private.current-footprint-inverse-registration-intent.v1" }
export interface CurrentFootprintInverseRegistrationBindings {
  readonly prepared: CurrentFootprintForwardSavedCheckpoint;
  readonly target: CurrentDisposableOpenSealedTarget;
  readonly assertCurrent: () => Promise<void>;
  readonly assertOriginalDispatchPending: () => void;
  /** Actual original written request/result only; a supplied no-dispatch DTO
   * cannot qualify an unused main sequence. */
  readonly assertOriginalNoDispatchResult: () => void;
}
