import type {CurrentFootprintInverseNativeReferenceNextWorkerKind} from "./current-footprint-inverse-native-reference-next-worker-manager-programs.ts";
import type {CurrentFootprintInverseNativeReferenceNextWorkerResultReceipt} from "./current-footprint-inverse-native-reference-next-worker-result-observer.ts";
/** Core-issued complete native query return; supplied empty data grant nothing. */
import type { CurrentFootprintInverseNativeReferenceWorkerCompletion } from "./current-footprint-inverse-native-reference-worker.ts";
import type { CurrentFootprintInverseNativeReferencePcbResultReceipt } from "./current-footprint-inverse-native-reference-pcb-result-observer.ts";
import type {CurrentFootprintInverseNativeReferenceSchematicReceipt} from "./current-footprint-inverse-native-reference-schematic-result-observer.ts";
import type {CurrentFootprintInverseNativeReferenceNextCall} from "./current-footprint-inverse-native-reference-next-call.ts";

export interface CurrentFootprintInverseNativeReferenceQueryResult { readonly profile: "private.current-footprint-inverse-native-reference-query-result.v1" }
interface Pcb {
 readonly kind: "pcb-all"; readonly completion: CurrentFootprintInverseNativeReferenceWorkerCompletion;
 readonly observations: CurrentFootprintInverseNativeReferencePcbResultReceipt; readonly assertCurrent: () => void;
}
export type CurrentFootprintInverseNativeReferenceQueryResultBindings=Readonly<Pcb>|Readonly<{kind:"schematic";call:CurrentFootprintInverseNativeReferenceNextCall;previous:CurrentFootprintInverseNativeReferenceQueryResult;observations:CurrentFootprintInverseNativeReferenceSchematicReceipt;assertCurrent:()=>void}>|Readonly<{kind:CurrentFootprintInverseNativeReferenceNextWorkerKind;completion:CurrentFootprintInverseNativeReferenceWorkerCompletion;call:CurrentFootprintInverseNativeReferenceNextCall;previous:CurrentFootprintInverseNativeReferenceQueryResult;observations:CurrentFootprintInverseNativeReferenceNextWorkerResultReceipt;assertCurrent:()=>void}>;
export { requireOriginalCurrentFootprintInverseNativeReferenceQueryResult } from "./current-footprint-inverse-v4-native-owner.ts";
