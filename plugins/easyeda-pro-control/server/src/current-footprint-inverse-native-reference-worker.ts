/** Distinct Core-issued native readiness; public reference origins cannot grant it. */
import type { CurrentFootprintInverseNativeGetTaskUiResult } from "./current-footprint-inverse-native-get-task-ui-result.ts";
import type { CurrentFootprintInverseReferenceData } from "./current-footprint-inverse-v4-public-row-data.ts";

import type { CurrentFootprintInverseNativeReferenceQueryJob } from "./current-footprint-inverse-native-reference-query-job.ts";

export interface CurrentFootprintInverseNativeReferenceReadiness { readonly profile: "private.current-footprint-inverse-native-reference-readiness.v1" }
export interface CurrentFootprintInverseNativeReferenceReadinessBindings {
 readonly getResult: CurrentFootprintInverseNativeGetTaskUiResult; readonly data: CurrentFootprintInverseReferenceData;
 readonly assertCurrent: () => void; readonly assertOriginalReady: () => void;
}
export { requireOriginalCurrentFootprintInverseNativeReferenceReadiness, consumeOriginalCurrentFootprintInverseNativeReferenceReadiness } from "./current-footprint-inverse-v4-native-owner.ts";

/** Issued only after the original native delivery and full successful worker return. */
export interface CurrentFootprintInverseNativeReferenceWorkerCompletion { readonly profile: "private.current-footprint-inverse-native-reference-worker-completion.v1" }
export interface CurrentFootprintInverseNativeReferenceWorkerCompletionBindings {
 readonly job: CurrentFootprintInverseNativeReferenceQueryJob; readonly data: CurrentFootprintInverseReferenceData; readonly assertCurrent: () => void;
}
export { requireOriginalCurrentFootprintInverseNativeReferenceWorkerCompletion } from "./current-footprint-inverse-v4-native-owner.ts";
