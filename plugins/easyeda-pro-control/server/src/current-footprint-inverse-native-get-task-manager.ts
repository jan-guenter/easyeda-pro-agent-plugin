/** Original internal GET manager entry. The actual getData body, native
 * transport, accepted worker Job and raw result remain outside this origin. */
import type { CurrentFootprintInverseNativeGetTaskCallback, CurrentFootprintInverseNativeGetTaskCallbackOriginBindings } from "./current-footprint-inverse-native-get-task-callback.ts";
import type { CurrentFootprintInverseNativeGetTaskManagerOriginal } from "./current-footprint-inverse-native-get-task-manager-controller.ts";
import type { CurrentFootprintInverseNativeDeleteRegistrationPrepared } from "./current-footprint-inverse-native-delete-registration-collector.ts";

export interface CurrentFootprintInverseNativeGetTaskManager { readonly profile: "private.current-footprint-inverse-native-get-task-manager.v1" }
export interface CurrentFootprintInverseNativeGetTaskManagerOriginBindings {
  readonly callback: CurrentFootprintInverseNativeGetTaskCallback;
  /** These are retained comparison roots, with no spent hold or reprove call. */
  readonly originalData: Pick<CurrentFootprintInverseNativeGetTaskCallbackOriginBindings, "callData" | "dependencyData">;
  readonly registration: CurrentFootprintInverseNativeDeleteRegistrationPrepared;
  readonly scripts: Readonly<{ ui: string; manager: string; prepared: string; invoke: string }>;
  readonly assertCurrent: () => void;
  readonly assertOriginalHeld: () => CurrentFootprintInverseNativeGetTaskManagerOriginal;
}
export { requireOriginalCurrentFootprintInverseNativeGetTaskManager } from "./current-pcb-diagnostic-owner.ts";
