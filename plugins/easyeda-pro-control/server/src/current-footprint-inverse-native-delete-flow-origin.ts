/** Only the original Core may issue these same-worker continuation tokens. */
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import type {CurrentFootprintInverseWorkerController} from "./current-footprint-inverse-v4-worker-controller.ts";
import type {CurrentFootprintInverseNativeDeleteFlowController,CurrentFootprintInverseNativeDeleteFlowData} from "./current-footprint-inverse-native-delete-flow-controller.ts";

export interface CurrentFootprintInverseNativeDeleteFlowOrigin{readonly profile:"private.current-footprint-inverse-native-delete-flow-origin.v1"}
export interface CurrentFootprintInverseNativeDeleteFlowResult{readonly profile:"private.current-footprint-inverse-native-delete-flow-result.v1"}
export interface CurrentFootprintInverseNativeDeleteFlowOriginal{readonly worker:CurrentFootprintInverseWorkerController;readonly controller:CurrentFootprintInverseNativeDeleteFlowController;readonly event:DiagnosticEvent;readonly current:()=>void}
export interface CurrentFootprintInverseNativeDeleteFlowResultOriginal extends CurrentFootprintInverseNativeDeleteFlowOriginal{readonly data:Readonly<CurrentFootprintInverseNativeDeleteFlowData>}
export {requireOriginalCurrentFootprintInverseNativeDeleteFlowOrigin,requireOriginalCurrentFootprintInverseNativeDeleteFlowResult}from "./current-footprint-inverse-v4-native-owner.ts";
