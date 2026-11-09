/** One original Core readonly native-route qualification. The prospective
 * sender is pre-query data: reference RPCs spend its ticket comparison and a
 * later DEL must prepare fresh originals. This token is neither Call nor Job. */
import type { CurrentFootprintInverseNativeDeleteIntent } from "./current-footprint-inverse-native-delete-intent.ts";

export interface CurrentFootprintInverseNativeDeleteQualification { readonly profile: "private.current-footprint-inverse-native-delete-qualification.v1" }
export interface CurrentFootprintInverseNativeDeleteQualificationBindings { readonly intent: CurrentFootprintInverseNativeDeleteIntent; readonly assertCurrent: () => void; readonly assertIdleCustody: () => void }
export { requireOriginalCurrentFootprintInverseNativeDeleteQualification } from "./current-pcb-diagnostic-owner.ts";
