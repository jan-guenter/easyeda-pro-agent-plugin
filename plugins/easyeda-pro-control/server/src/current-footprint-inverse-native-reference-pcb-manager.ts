/** Original internal GET manager entry. The actual getData body, native
 * transport, accepted worker Job and raw result remain outside this origin. */
import type { CurrentFootprintInverseNativeReferencePcbCallback, CurrentFootprintInverseNativeReferencePcbCallbackOriginBindings } from "./current-footprint-inverse-native-reference-pcb-callback.ts";
import type { CurrentFootprintInverseNativeReferencePcbManagerOriginal } from "./current-footprint-inverse-native-reference-pcb-manager-controller.ts";
import type { CurrentFootprintInverseNativeDeleteRegistrationPrepared } from "./current-footprint-inverse-native-delete-registration-collector.ts";

export interface CurrentFootprintInverseNativeReferencePcbManager { readonly profile: "private.current-footprint-inverse-native-reference-pcb-manager.v1" }
export interface CurrentFootprintInverseNativeReferencePcbManagerOriginBindings {
  readonly callback: CurrentFootprintInverseNativeReferencePcbCallback;
  /** These are retained comparison roots, with no spent hold or reprove call. */
  readonly originalData: Pick<CurrentFootprintInverseNativeReferencePcbCallbackOriginBindings, "callData" | "dependencyData">;
  readonly registration: CurrentFootprintInverseNativeDeleteRegistrationPrepared;
  readonly scripts: Readonly<{ ui: string; manager: string; prepared: string; invoke: string }>;
  readonly assertCurrent: () => void;
  readonly assertOriginalHeld: () => CurrentFootprintInverseNativeReferencePcbManagerOriginal;
}
export { requireOriginalCurrentFootprintInverseNativeReferencePcbManager } from "./current-footprint-inverse-v4-native-owner.ts";
