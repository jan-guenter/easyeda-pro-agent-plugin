import type {CurrentFootprintSavedFlowCacheInput}from "./current-footprint-saved-flow-cache-data.ts";
/** Original inverse renderer/body custody supplied only by Core. Source data
 * and callbacks in JSON cannot enroll a Main runner or admit SQL writes. */
import type {CurrentFootprintDeletePlan} from "./current-footprint-delete-plan.ts";
import type {CurrentFootprintDeleteObservedPlan} from "./current-footprint-delete-observed-plan.ts";
import type {CurrentFootprintInverseNativeDeleteSerializationResult} from "./current-footprint-inverse-native-delete-serialization-origin.ts";
import type {CurrentFootprintInverseNativeDeletePublicationResult} from "./current-footprint-inverse-native-delete-publication-token.ts";
import type {CurrentFootprintInversePreparedCheckpoint} from "./current-footprint-inverse-prepared-checkpoint.ts";
// oxlint-disable-next-line import/no-cycle -- Type-only late Core registry seam; initialization cannot issue authority.
import type {CurrentFootprintCopyNativeTarget,CurrentFootprintInverseNativeOwner} from "./current-footprint-inverse-v4-native-owner.ts";
import type {CurrentFootprintInverseMainHistoryBaseline} from "./current-footprint-inverse-main-history-baseline.ts";

export interface CurrentFootprintInverseNativeDeleteMainSource{readonly profile:"private.current-footprint-inverse-native-delete-main-source.v1"}
export interface CurrentFootprintInverseNativeDeleteMainSourceOriginal{
 readonly naturalTail?:Readonly<{profile:"private.current-footprint-inverse-native-delete-main-tail-prerequisite.v1";assertBeforeOriginalUpload:()=>void;assertCurrent:()=>void}>;
 readonly owner:CurrentFootprintInverseNativeOwner;readonly prepared:CurrentFootprintInversePreparedCheckpoint;
 readonly serialization:CurrentFootprintInverseNativeDeleteSerializationResult;readonly publication:CurrentFootprintInverseNativeDeletePublicationResult;
 readonly bodyPlan:CurrentFootprintDeletePlan|CurrentFootprintDeleteObservedPlan;readonly source:CurrentFootprintCopyNativeTarget;readonly beforeInventory:CurrentFootprintCopyNativeTarget["before"];
 readonly target:CurrentFootprintCopyNativeTarget["target"];readonly flowInput:CurrentFootprintSavedFlowCacheInput;readonly historyBaseline:CurrentFootprintInverseMainHistoryBaseline;
 readonly projectUuid:string;readonly branchUuid:string;readonly projectKey:string;readonly path:string;
 readonly assertCurrent:()=>void;readonly assertBeforeOriginalUpload:()=>void;readonly assertOriginalExit:()=>void;readonly originalUploadWritten:()=>boolean;
}
export {requireOriginalCurrentFootprintInverseNativeDeleteMainSource,requireOriginalCurrentFootprintInverseNativeDeleteMainSourceAfterOriginalExit} from "./current-footprint-inverse-v4-native-owner.ts";
