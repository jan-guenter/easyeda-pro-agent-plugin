/** Original post-reference direct-native DEL first-statement origin only.
 * The private Core registry binds its original event and pending request;
 * matching data authorizes no worker body, clock, publication or Save. */
import type {CurrentFootprintInverseNativeReferenceQueryResult} from "./current-footprint-inverse-native-reference-query-result.ts";
import type {CurrentFootprintInverseNativeDeleteSenderPrepared} from "./current-footprint-inverse-native-delete-sender-collector.ts";
import type {CurrentFootprintInverseNativeDeleteRegistrationPrepared} from "./current-footprint-inverse-native-delete-registration-collector.ts";
import type {CurrentFootprintInverseNativeDeleteCollateralPrepared} from "./current-footprint-inverse-native-delete-collateral-collector.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionOriginalSenderHold} from "./current-footprint-inverse-native-delete-execution-call-controller.ts";

export interface CurrentFootprintInverseNativeDeleteExecutionCall{readonly profile:"private.current-footprint-inverse-native-delete-execution-call.v1"}
export interface CurrentFootprintInverseNativeDeleteExecutionCallBindings{
 readonly previous:CurrentFootprintInverseNativeReferenceQueryResult;
 readonly sender:CurrentFootprintInverseNativeDeleteSenderPrepared;
 readonly registration:CurrentFootprintInverseNativeDeleteRegistrationPrepared;
 readonly collateral:CurrentFootprintInverseNativeDeleteCollateralPrepared;
 readonly receipt:string;readonly uiScriptId:string;readonly managerScriptId:string;
 readonly assertCurrent:()=>void;
 readonly assertOriginalHeld:()=>CurrentFootprintInverseNativeDeleteExecutionOriginalSenderHold;
}
export {requireOriginalCurrentFootprintInverseNativeDeleteExecutionCall} from "./current-footprint-inverse-v4-native-owner.ts";
