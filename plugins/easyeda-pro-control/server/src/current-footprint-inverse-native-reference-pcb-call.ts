/** Original first native reference RPC held at its first statement. A DTO
 * cannot construct its private Core registry entry or any worker/result grant. */
import type{CurrentFootprintInverseNativeGetTaskUiResult}from"./current-footprint-inverse-native-get-task-ui-result.ts";
import type{CurrentFootprintInverseNativeReferencePcbOriginalSenderHold}from"./current-footprint-inverse-native-reference-pcb-call-controller.ts";
import type{CurrentFootprintInverseNativeReferencePcbSenderPrepared}from"./current-footprint-inverse-native-reference-pcb-sender-collector.ts";

export interface CurrentFootprintInverseNativeReferencePcbCall{readonly profile:"private.current-footprint-inverse-native-reference-pcb-call.v1"}
export interface CurrentFootprintInverseNativeReferencePcbCallBindings{
 readonly result:CurrentFootprintInverseNativeGetTaskUiResult;readonly sender:CurrentFootprintInverseNativeReferencePcbSenderPrepared;
 readonly receipt:string;readonly uiScriptId:string;readonly managerScriptId:string;
 readonly assertCurrent:()=>void;readonly assertOriginalHeld:()=>CurrentFootprintInverseNativeReferencePcbOriginalSenderHold;
}
export{requireOriginalCurrentFootprintInverseNativeReferencePcbCall}from"./current-footprint-inverse-v4-native-owner.ts";
