/** Actual native DEL post and original accepted before-clock event. This
 * token grants no clock, parser, publication, saved mutation or cold absence. */
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionInnerRpcOrigin} from "./current-footprint-inverse-native-delete-execution-inner-rpc.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionAcceptedData} from "./current-footprint-inverse-native-delete-execution-accept-collector.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionForwardOriginal} from "./current-footprint-inverse-native-delete-execution-forward-controller.ts";

export interface CurrentFootprintInverseNativeDeleteExecutionJob{readonly profile:"private.current-footprint-inverse-native-delete-execution-job.v1"}
export interface CurrentFootprintInverseNativeDeleteExecutionJobBindings{
 readonly innerRpc:CurrentFootprintInverseNativeDeleteExecutionInnerRpcOrigin;readonly event:DiagnosticEvent;
 readonly accepted:CurrentFootprintInverseNativeDeleteExecutionAcceptedData;readonly forwarded:CurrentFootprintInverseNativeDeleteExecutionForwardOriginal;
 readonly assertCurrent:()=>void;readonly assertOriginalHeld:()=>void;readonly assertOriginalUiHeld:()=>void;readonly consumeOriginalUiHold:()=>void;
}
export {requireOriginalCurrentFootprintInverseNativeDeleteExecutionJob} from "./current-footprint-inverse-v4-native-owner.ts";
