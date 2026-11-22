/** Actual original Core-issued internal GET UI return. Supplied observations
 * alone issue no token; public/reference/DEL/Save routes remain separate. */
import type { CurrentFootprintInverseNativeGetTaskWorkerCompletion } from "./current-footprint-inverse-native-get-task-worker-completion.ts";
import type { CurrentFootprintInverseNativeGetTaskResultReceipt } from "./current-footprint-inverse-v4-native-get-task-result-observer.ts";

export interface CurrentFootprintInverseNativeGetTaskUiResult { readonly profile:"private.current-footprint-inverse-native-get-task-ui-result.v1" }
export interface CurrentFootprintInverseNativeGetTaskUiResultBindings {
 readonly workerCompletion:CurrentFootprintInverseNativeGetTaskWorkerCompletion;
 readonly observations:CurrentFootprintInverseNativeGetTaskResultReceipt;
 readonly assertCurrent:()=>void;
}
export {requireOriginalCurrentFootprintInverseNativeGetTaskUiResult} from "./current-footprint-inverse-v4-native-owner.ts";
