/** Original native reference dependency data; prior native intrinsics are comparison values. A completed
 * preparation is not a fresh resume/worker acceptance or Job permission. */
import type { CurrentFootprintInverseNativeReferencePcbCall } from "./current-footprint-inverse-native-reference-pcb-call.ts";
import type { CurrentFootprintInverseNativeReferencePcbDependencyGraph } from "./current-footprint-inverse-native-reference-pcb-dependencies-collector.ts";
import type { CurrentFootprintInverseGetIntrinsicGraph } from "./current-footprint-inverse-get-intrinsics-collector.ts";

export interface CurrentFootprintInverseNativeReferencePcbDependencies { readonly profile: "private.current-footprint-inverse-native-reference-pcb-dependencies.v1" }
export interface CurrentFootprintInverseNativeReferencePcbDependencyBindings {
  readonly call: CurrentFootprintInverseNativeReferencePcbCall;
  readonly graph: CurrentFootprintInverseNativeReferencePcbDependencyGraph;
  /** The spent metadata collector's reprove function is deliberately absent. */
  readonly native: Omit<CurrentFootprintInverseGetIntrinsicGraph, "reprove">;
  readonly assertCurrent: () => void;
}
export { requireOriginalCurrentFootprintInverseNativeReferencePcbDependencies } from "./current-footprint-inverse-v4-native-owner.ts";
