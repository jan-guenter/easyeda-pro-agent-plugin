/** Core-only clock enrollment and completed original producer custody.
 * Profile JSON cannot recreate either original registry entry. */
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import type { CurrentFootprintInverseWorkerController } from "./current-footprint-inverse-v4-worker-controller.ts";
import type { CurrentFootprintInverseNativeDeleteClockController } from "./current-footprint-inverse-v4-native-delete-clock-controller.ts";
import type { CurrentFootprintInverseNativeDeleteClockData } from "./current-footprint-inverse-native-delete-clock-observer.ts";

export interface CurrentFootprintInverseNativeDeleteClockOrigin { readonly profile: "private.current-footprint-inverse-native-delete-clock-origin.v1" }
export interface CurrentFootprintInverseNativeDeleteClockOriginal {
  readonly worker: CurrentFootprintInverseWorkerController; readonly controller: CurrentFootprintInverseNativeDeleteClockController;
  readonly event: DiagnosticEvent; readonly current: () => void;
}
export interface CurrentFootprintInverseNativeDeleteClockResult { readonly profile: "private.current-footprint-inverse-native-delete-clock-result.v1" }
export interface CurrentFootprintInverseNativeDeleteClockResultOriginal extends CurrentFootprintInverseNativeDeleteClockOriginal { readonly data: Readonly<CurrentFootprintInverseNativeDeleteClockData> }
export { requireOriginalCurrentFootprintInverseNativeDeleteClockOrigin, requireOriginalCurrentFootprintInverseNativeDeleteClockResult } from "./current-footprint-inverse-v4-native-owner.ts";
