/** Original internal GET callback origin after the first RPC prefix transfer.
 * Public SDK/tw tokens and the consumed first-entry Call cannot issue it. */
import type { CurrentFootprintInverseNativeReferencePcbCall, CurrentFootprintInverseNativeReferencePcbCallBindings } from "./current-footprint-inverse-native-reference-pcb-call.ts";
import type { CurrentFootprintInverseNativeReferencePcbDependencies, CurrentFootprintInverseNativeReferencePcbDependencyBindings } from "./current-footprint-inverse-native-reference-pcb-dependencies.ts";
import type { CurrentFootprintInverseNativeReferencePcbCallbackOriginal } from "./current-footprint-inverse-native-reference-pcb-callback-controller.ts";

export interface CurrentFootprintInverseNativeReferencePcbCallback { readonly profile: "private.current-footprint-inverse-native-reference-pcb-callback.v1" }
export interface CurrentFootprintInverseNativeReferencePcbCallbackOriginBindings {
  readonly call: CurrentFootprintInverseNativeReferencePcbCall;
  readonly dependencies: CurrentFootprintInverseNativeReferencePcbDependencies;
  /** Original preparation data; their spent hold/reprove guards are not used. */
  readonly callData: Pick<CurrentFootprintInverseNativeReferencePcbCallBindings, "sender" | "receipt" | "uiScriptId" | "managerScriptId">;
  readonly dependencyData: Pick<CurrentFootprintInverseNativeReferencePcbDependencyBindings, "graph" | "native">;
  readonly assertCurrent: () => void;
  readonly assertOriginalHeld: () => CurrentFootprintInverseNativeReferencePcbCallbackOriginal;
}
export { requireOriginalCurrentFootprintInverseNativeReferencePcbCallback } from "./current-footprint-inverse-v4-native-owner.ts";
