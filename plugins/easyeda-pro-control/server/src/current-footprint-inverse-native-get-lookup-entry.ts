/** Core-owned original native GET invocation. The held getter entry is
 * distinct from a completed GET, native accepted Job or reference result. */
import type { CurrentFootprintInverseNativeGetReadiness } from "./current-footprint-inverse-native-get-readiness.ts";
import type { CurrentFootprintInverseNativeGetLookupOriginal } from "./current-footprint-inverse-native-get-lookup-controller.ts";

export interface CurrentFootprintInverseNativeGetLookupEntryBindings {
  readonly readiness: CurrentFootprintInverseNativeGetReadiness;
  readonly assertCurrent: () => void;
  /** Fresh owner/event/write custody only. Remote descriptors and the getter
   * body dependencies must be reproved separately before a future resume. */
  readonly assertOriginalHeld: () => CurrentFootprintInverseNativeGetLookupOriginal;
}
export { requireOriginalCurrentFootprintInverseNativeGetLookupEntry } from "./current-pcb-diagnostic-owner.ts";
