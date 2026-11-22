/** Actual original native DEL inner RPC entry. This is not an accepted
 * worker Job and grants no post, clock, parser, publication or Save body. */
import type {CurrentFootprintInverseNativeDeleteExecutionCall} from "./current-footprint-inverse-native-delete-execution-call.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionInnerRpc} from "./current-footprint-inverse-native-delete-execution-transfer.ts";

export interface CurrentFootprintInverseNativeDeleteExecutionInnerRpcOrigin{readonly profile:"private.current-footprint-inverse-native-delete-execution-inner-rpc.v1"}
export interface CurrentFootprintInverseNativeDeleteExecutionInnerRpcBindings{readonly call:CurrentFootprintInverseNativeDeleteExecutionCall;readonly original:CurrentFootprintInverseNativeDeleteExecutionInnerRpc;readonly assertCurrent:()=>void;readonly assertOriginalHeld:()=>void}
export {requireOriginalCurrentFootprintInverseNativeDeleteExecutionInnerRpcOrigin} from "./current-footprint-inverse-v4-native-owner.ts";
