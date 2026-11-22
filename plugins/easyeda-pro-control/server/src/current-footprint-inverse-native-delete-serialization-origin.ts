/** Core-only original serialization enrollment and held upload custody. */
import type {CurrentFootprintDeletePlan} from "./current-footprint-delete-plan.ts";
import type {CurrentFootprintDeleteObservedPlan} from "./current-footprint-delete-observed-plan.ts";
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import type {CurrentFootprintInverseWorkerController} from "./current-footprint-inverse-v4-worker-controller.ts";
import type {CurrentFootprintInverseNativeDeleteSerializationController} from "./current-footprint-inverse-v4-native-delete-serialization-controller.ts";
import type {CurrentFootprintInverseNativeDeleteSerializationData} from "./current-footprint-inverse-v4-native-delete-serialization-observer.ts";

export interface CurrentFootprintInverseNativeDeleteSerializationOrigin{readonly profile:"private.current-footprint-inverse-native-delete-serialization-origin.v1"}
export interface CurrentFootprintInverseNativeDeleteSerializationResult{readonly profile:"private.current-footprint-inverse-native-delete-serialization-result.v1"}
export interface CurrentFootprintInverseNativeDeleteSerializationOriginal{readonly worker:CurrentFootprintInverseWorkerController;readonly controller:CurrentFootprintInverseNativeDeleteSerializationController;readonly event:DiagnosticEvent;readonly current:()=>void}
export interface CurrentFootprintInverseNativeDeleteSerializationResultOriginal extends CurrentFootprintInverseNativeDeleteSerializationOriginal{readonly bodyPlan:CurrentFootprintDeletePlan|CurrentFootprintDeleteObservedPlan;readonly data:Readonly<CurrentFootprintInverseNativeDeleteSerializationData>}
export {requireOriginalCurrentFootprintInverseNativeDeleteSerializationOrigin,requireOriginalCurrentFootprintInverseNativeDeleteSerializationResult} from "./current-footprint-inverse-v4-native-owner.ts";
