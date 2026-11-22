/** Opaque actual cold-manager read result. Core alone issues it after the
 * original readonly generation, replay checks and exact function reads. */
export interface CurrentFootprintInverseNativeDeleteColdReadResult{readonly profile:"private.current-footprint-inverse-native-delete-cold-read-result.v1"}
export {requireOriginalCurrentFootprintInverseNativeDeleteColdReadResult,requireOriginalCurrentFootprintInverseNativeDeleteColdReadResultAfterOriginalExit} from "./current-footprint-inverse-v4-native-owner.ts";
