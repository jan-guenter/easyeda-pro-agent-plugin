/** Opaque original poststate result; JSON or a matching storage census cannot
 * issue this token or an original caller/persistence capability. */
import type { CurrentFootprintInverseNativeDeleteCallerResult } from "./current-footprint-inverse-native-delete-caller-origin.ts";
import type { CurrentFootprintInverseNativeDeleteMainSource } from "./current-footprint-inverse-native-delete-main-source.ts";
import type { CurrentFootprintInverseNativeDeletePoststateCollector, CurrentFootprintInverseNativeDeletePoststateData } from "./current-footprint-inverse-native-delete-poststate-collector.ts";

export interface CurrentFootprintInverseNativeDeletePoststateResult {
  readonly profile: "private.current-footprint-inverse-native-delete-poststate-result.v1";
}
export interface CurrentFootprintInverseNativeDeletePoststateOriginal {
  readonly source: CurrentFootprintInverseNativeDeleteMainSource;
  readonly caller: CurrentFootprintInverseNativeDeleteCallerResult;
  readonly controller: CurrentFootprintInverseNativeDeletePoststateCollector;
  readonly data: Readonly<CurrentFootprintInverseNativeDeletePoststateData>;
  readonly current: () => void;
  readonly assertOriginalExit: () => void;
}
