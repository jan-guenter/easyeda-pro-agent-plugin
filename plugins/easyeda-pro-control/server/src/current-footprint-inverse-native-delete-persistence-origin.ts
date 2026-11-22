/** Native deletion's original completed Main evidence. Matching rows or
 * caller closures cannot issue this Core-retained token. */
import type { CurrentFootprintInverseNativeDeleteMainSource, CurrentFootprintInverseNativeDeleteMainSourceOriginal } from "./current-footprint-inverse-native-delete-main-source.ts";
import type { CurrentFootprintInverseNativeDeleteMainTailObservation, CurrentFootprintInverseNativeDeleteMainTailProjection } from "./current-footprint-inverse-native-delete-main-tail-controller.ts";
import type { CurrentFootprintInverseNativeDeletePoststateResult } from "./current-footprint-inverse-native-delete-poststate-origin.ts";
import type { CurrentProjectHistorySqlEffects } from "./current-project-history-sql-effects.ts";

export interface CurrentFootprintInverseNativeDeletePersistenceOrigin {
  readonly profile: "private.current-footprint-inverse-native-delete-persistence-origin.v1";
}
export interface CurrentFootprintInverseNativeDeletePersistenceOriginal {
  readonly source: CurrentFootprintInverseNativeDeleteMainSource;
  readonly main: CurrentFootprintInverseNativeDeleteMainSourceOriginal;
  readonly poststate: CurrentFootprintInverseNativeDeletePoststateResult;
  readonly effects: CurrentProjectHistorySqlEffects;
  readonly tail: CurrentFootprintInverseNativeDeleteMainTailObservation;
  readonly projection: CurrentFootprintInverseNativeDeleteMainTailProjection;
  readonly current: () => void;
  readonly assertOriginalExit: () => void;
}
