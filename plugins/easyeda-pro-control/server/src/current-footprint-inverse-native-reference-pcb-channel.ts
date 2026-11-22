/** Original native-task worker-channel entry. The public UI row/toast route,
 * inner RPC body, native post and accepted worker Job remain separate. */
import type { CurrentFootprintInverseNativeReferencePcbManager, CurrentFootprintInverseNativeReferencePcbManagerOriginBindings } from "./current-footprint-inverse-native-reference-pcb-manager.ts";
import type { CurrentFootprintInverseNativeReferencePcbChannelOriginal } from "./current-footprint-inverse-native-reference-pcb-channel-controller.ts";

export interface CurrentFootprintInverseNativeReferencePcbChannel { readonly profile: "private.current-footprint-inverse-native-reference-pcb-channel.v1" }
export interface CurrentFootprintInverseNativeReferencePcbChannelOriginBindings {
  readonly manager: CurrentFootprintInverseNativeReferencePcbManager;
  readonly originalData: CurrentFootprintInverseNativeReferencePcbManagerOriginBindings["originalData"];
  readonly registration: CurrentFootprintInverseNativeReferencePcbManagerOriginBindings["registration"];
  readonly scripts: CurrentFootprintInverseNativeReferencePcbManagerOriginBindings["scripts"];
  readonly assertCurrent: () => void;
  readonly assertOriginalHeld: () => CurrentFootprintInverseNativeReferencePcbChannelOriginal;
}
export { requireOriginalCurrentFootprintInverseNativeReferencePcbChannel } from "./current-footprint-inverse-v4-native-owner.ts";
