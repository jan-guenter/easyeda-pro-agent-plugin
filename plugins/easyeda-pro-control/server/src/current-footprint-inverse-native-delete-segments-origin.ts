/** Opaque original Core enrollment only; no data/JSON registration entry. */
import type{DiagnosticEvent}from"./current-pcb-diagnostic-protocol.ts";
import type{CurrentFootprintInverseWorkerController}from"./current-footprint-inverse-v4-worker-controller.ts";
import type{CurrentFootprintInverseNativeDeleteSegmentsController}from"./current-footprint-inverse-native-delete-segments-controller.ts";

export interface CurrentFootprintInverseNativeDeleteSegmentsOrigin{readonly profile:"private.current-footprint-inverse-native-delete-segments-origin.v1"}
export interface CurrentFootprintInverseNativeDeleteSegmentsOriginal{
 readonly worker:CurrentFootprintInverseWorkerController;readonly controller:CurrentFootprintInverseNativeDeleteSegmentsController;
 readonly event:DiagnosticEvent;readonly current:()=>void;
}
