/** Opaque private registry interfaces. Neither these labels nor serialized
 * matching data can issue an owner, a worker event or a drain continuation. */
import type{DiagnosticEvent}from"./current-pcb-diagnostic-protocol.ts";
import type{CurrentFootprintInverseWorkerController}from"./current-footprint-inverse-v4-worker-controller.ts";
import type{CurrentFootprintInverseNativeDeleteDrainController,CurrentFootprintInverseNativeDeleteDrainData}from"./current-footprint-inverse-native-delete-drain-controller.ts";

export interface CurrentFootprintInverseNativeDeleteDrainOrigin{readonly profile:"private.current-footprint-inverse-native-delete-drain-origin.v1"}
export interface CurrentFootprintInverseNativeDeleteDrainResult{readonly profile:"private.current-footprint-inverse-native-delete-drain-result.v1"}
export interface CurrentFootprintInverseNativeDeleteDrainOriginal{
 readonly worker:CurrentFootprintInverseWorkerController;readonly controller:CurrentFootprintInverseNativeDeleteDrainController;
 readonly event:DiagnosticEvent;readonly current:()=>void;
}
export interface CurrentFootprintInverseNativeDeleteDrainCompleted extends CurrentFootprintInverseNativeDeleteDrainOriginal{readonly data:Readonly<CurrentFootprintInverseNativeDeleteDrainData>}
