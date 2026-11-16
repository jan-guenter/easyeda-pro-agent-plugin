/** Opaque original V4 caller interfaces. Matching metadata/JSON cannot issue
 * an owner, accepted Job, native event, caller result or persistence grant. */
import type{DiagnosticEvent}from"./current-pcb-diagnostic-protocol.ts";
import type{CurrentFootprintInverseWorkerController}from"./current-footprint-inverse-worker-controller.ts";
import type{CurrentFootprintInverseNativeDeleteCallerController,CurrentFootprintInverseNativeDeleteCallerData}from"./current-footprint-inverse-native-delete-caller-controller.ts";

export interface CurrentFootprintInverseNativeDeleteCallerOrigin{readonly profile:"private.current-footprint-inverse-native-delete-caller-origin.v1"}
export interface CurrentFootprintInverseNativeDeleteCallerResult{readonly profile:"private.current-footprint-inverse-native-delete-caller-result.v1"}
export interface CurrentFootprintInverseNativeDeleteCallerOriginal{
 readonly worker:CurrentFootprintInverseWorkerController;readonly controller:CurrentFootprintInverseNativeDeleteCallerController;
 readonly event:DiagnosticEvent;readonly current:()=>void;
}
export interface CurrentFootprintInverseNativeDeleteCallerCompleted extends CurrentFootprintInverseNativeDeleteCallerOriginal{readonly data:Readonly<CurrentFootprintInverseNativeDeleteCallerData>}
