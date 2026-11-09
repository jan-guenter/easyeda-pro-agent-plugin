/** Original internal GET callback origin after the first RPC prefix transfer.
 * Public SDK/tw tokens and the consumed first-entry Call cannot issue it. */
import type { CurrentFootprintInverseNativeGetTaskCall, CurrentFootprintInverseNativeGetTaskCallBindings } from "./current-footprint-inverse-native-get-task-call.ts";
import type { CurrentFootprintInverseNativeGetTaskDependencies, CurrentFootprintInverseNativeGetTaskDependencyBindings } from "./current-footprint-inverse-native-get-task-dependencies.ts";
import type { CurrentFootprintInverseNativeGetTaskCallbackOriginal } from "./current-footprint-inverse-native-get-task-callback-controller.ts";

export interface CurrentFootprintInverseNativeGetTaskCallback { readonly profile: "private.current-footprint-inverse-native-get-task-callback.v1" }
export interface CurrentFootprintInverseNativeGetTaskCallbackOriginBindings {
  readonly call: CurrentFootprintInverseNativeGetTaskCall;
  readonly dependencies: CurrentFootprintInverseNativeGetTaskDependencies;
  /** Original preparation data; their spent hold/reprove guards are not used. */
  readonly callData: Pick<CurrentFootprintInverseNativeGetTaskCallBindings, "sender" | "receipt" | "uiScriptId" | "managerScriptId">;
  readonly dependencyData: Pick<CurrentFootprintInverseNativeGetTaskDependencyBindings, "graph" | "native">;
  readonly assertCurrent: () => void;
  readonly assertOriginalHeld: () => CurrentFootprintInverseNativeGetTaskCallbackOriginal;
}
export { requireOriginalCurrentFootprintInverseNativeGetTaskCallback } from "./current-pcb-diagnostic-owner.ts";
