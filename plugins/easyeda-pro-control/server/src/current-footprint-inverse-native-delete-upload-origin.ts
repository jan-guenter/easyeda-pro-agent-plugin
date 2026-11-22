/** Core-only original enrollment. No data/JSON registration entrypoint. */
import type{DiagnosticEvent}from"./current-pcb-diagnostic-protocol.ts";
import type{CurrentFootprintInverseWorkerController}from"./current-footprint-inverse-v4-worker-controller.ts";
import type{CurrentFootprintInverseNativeDeleteUploadController}from"./current-footprint-inverse-native-delete-upload-controller.ts";

export interface CurrentFootprintInverseNativeDeleteUploadOrigin{readonly profile:"private.current-footprint-inverse-native-delete-upload-origin.v1"}
export interface CurrentFootprintInverseNativeDeleteUploadOriginal{
 readonly worker:CurrentFootprintInverseWorkerController;readonly controller:CurrentFootprintInverseNativeDeleteUploadController;
 readonly event:DiagnosticEvent;readonly current:()=>void;
}
