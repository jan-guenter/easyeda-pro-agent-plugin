/** Original native-intent GET preparation. No public Call/GetResult, supplied
 * row JSON or equal-shaped token can issue this separate Core capability. */
import type { CurrentFootprintInverseNativeDeleteIntent } from "./current-footprint-inverse-native-delete-intent.ts";
import type { CurrentFootprintInverseNativeDeleteQualification } from "./current-footprint-inverse-native-delete-qualification.ts";

export interface CurrentFootprintInverseNativeGetReadiness { readonly profile: "private.current-footprint-inverse-native-get-readiness.v1" }
export interface CurrentFootprintInverseNativeGetReadinessBindings {
  readonly intent: CurrentFootprintInverseNativeDeleteIntent; readonly qualification: CurrentFootprintInverseNativeDeleteQualification;
  readonly assertCurrent: () => void;
  /** Reprove original idle/admission/cursor custody. This does not reprove
   * remote descriptors or live lexicals for a future sender/body continuation. */
  readonly assertOriginalReady: () => void;
}
export { requireOriginalCurrentFootprintInverseNativeGetReadiness } from "./current-pcb-diagnostic-owner.ts";
