/** Fresh native query sender held only from its actual preceding result.
 * No JSON, old public worker or sender DTO can issue this Core registry. */
import type {CurrentFootprintInverseNativeReferenceQueryResult} from "./current-footprint-inverse-native-reference-query-result.ts";
import type {CurrentFootprintInverseNativeReferenceNextKind} from "./current-footprint-inverse-native-reference-next-sender-protocol.ts";
import type {CurrentFootprintInverseNativeReferenceNextOriginalSenderHold} from "./current-footprint-inverse-native-reference-next-call-controller.ts";
import type {CurrentFootprintInverseNativeReferenceNextSenderPrepared} from "./current-footprint-inverse-native-reference-next-sender-collector.ts";

export interface CurrentFootprintInverseNativeReferenceNextCall{readonly profile:"private.current-footprint-inverse-native-reference-next-call.v1"}
export interface CurrentFootprintInverseNativeReferenceNextCallBindings{
 readonly previous:CurrentFootprintInverseNativeReferenceQueryResult;readonly kind:CurrentFootprintInverseNativeReferenceNextKind;
 readonly sender:CurrentFootprintInverseNativeReferenceNextSenderPrepared;readonly receipt:string;readonly uiScriptId:string;readonly managerScriptId:string;
 readonly assertCurrent:()=>void;readonly assertOriginalHeld:()=>CurrentFootprintInverseNativeReferenceNextOriginalSenderHold;
}
export {requireOriginalCurrentFootprintInverseNativeReferenceNextCall} from "./current-footprint-inverse-v4-native-owner.ts";
