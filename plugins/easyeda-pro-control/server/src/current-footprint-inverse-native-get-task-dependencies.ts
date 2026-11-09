/** Original Core dependency data for the internal GET route. A completed
 * preparation is not a fresh resume/worker acceptance or Job permission. */
import type { CurrentFootprintInverseNativeGetTaskCall } from "./current-footprint-inverse-native-get-task-call.ts";
import type { CurrentFootprintInverseNativeGetTaskDependencyGraph } from "./current-footprint-inverse-native-get-task-dependencies-collector.ts";
import type { CurrentFootprintInverseGetIntrinsicGraph } from "./current-footprint-inverse-get-intrinsics-collector.ts";

export interface CurrentFootprintInverseNativeGetTaskDependencies { readonly profile: "private.current-footprint-inverse-native-get-task-dependencies.v1" }
export interface CurrentFootprintInverseNativeGetTaskDependencyBindings {
  readonly call: CurrentFootprintInverseNativeGetTaskCall;
  readonly graph: CurrentFootprintInverseNativeGetTaskDependencyGraph;
  /** The spent metadata collector's reprove function is deliberately absent. */
  readonly native: Omit<CurrentFootprintInverseGetIntrinsicGraph, "reprove">;
  readonly assertCurrent: () => void;
}
export { requireOriginalCurrentFootprintInverseNativeGetTaskDependencies } from "./current-pcb-diagnostic-owner.ts";
