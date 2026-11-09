/** Original native-task worker-channel entry. The public UI row/toast route,
 * inner RPC body, native post and accepted worker Job remain separate. */
import type { CurrentFootprintInverseNativeGetTaskManager, CurrentFootprintInverseNativeGetTaskManagerOriginBindings } from "./current-footprint-inverse-native-get-task-manager.ts";
import type { CurrentFootprintInverseNativeGetTaskChannelOriginal } from "./current-footprint-inverse-native-get-task-channel-controller.ts";

export interface CurrentFootprintInverseNativeGetTaskChannel { readonly profile: "private.current-footprint-inverse-native-get-task-channel.v1" }
export interface CurrentFootprintInverseNativeGetTaskChannelOriginBindings {
  readonly manager: CurrentFootprintInverseNativeGetTaskManager;
  readonly originalData: CurrentFootprintInverseNativeGetTaskManagerOriginBindings["originalData"];
  readonly registration: CurrentFootprintInverseNativeGetTaskManagerOriginBindings["registration"];
  readonly scripts: CurrentFootprintInverseNativeGetTaskManagerOriginBindings["scripts"];
  readonly assertCurrent: () => void;
  readonly assertOriginalHeld: () => CurrentFootprintInverseNativeGetTaskChannelOriginal;
}
export { requireOriginalCurrentFootprintInverseNativeGetTaskChannel } from "./current-pcb-diagnostic-owner.ts";
