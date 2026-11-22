/** Core-only original enrollment. No data/JSON registration entrypoint. */
import type{DiagnosticEvent}from"./current-pcb-diagnostic-protocol.ts";
import type{CurrentFootprintInverseWorkerController}from"./current-footprint-inverse-v4-worker-controller.ts";
import type{CurrentFootprintInverseNativeDeleteReturnController}from"./current-footprint-inverse-native-delete-return-controller.ts";

export interface CurrentFootprintInverseNativeDeleteReturnOrigin{readonly profile:"private.current-footprint-inverse-native-delete-return-origin.v1"}
export interface CurrentFootprintInverseNativeDeleteReturnOriginal{
 readonly worker:CurrentFootprintInverseWorkerController;readonly controller:CurrentFootprintInverseNativeDeleteReturnController;
 readonly event:DiagnosticEvent;readonly current:()=>void;
}
