/** Original inverse renderer and body custody used by the dormant Main readers.
 * Core retains responsibility for issuing the source and its serialisation result. */
import type { CurrentFootprintCopyNativeTarget, CurrentFootprintInverseNativeOwner } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintDeleteObservedPlan } from "./current-footprint-delete-observed-plan.ts";
import type { CurrentFootprintDeletePlan } from "./current-footprint-delete-plan.ts";
import type { CurrentFootprintInverseMainHistoryBaseline } from "./current-footprint-inverse-main-history-baseline.ts";
import type { CurrentFootprintInverseNativeDeletePublicationResult } from "./current-footprint-inverse-native-delete-publication-token.ts";
import type { CurrentFootprintInversePreparedCheckpoint } from "./current-footprint-inverse-prepared-checkpoint.ts";
import type { CurrentFootprintSavedFlowCacheInput } from "./current-footprint-saved-flow-cache-data.ts";

export interface CurrentFootprintInverseNativeDeleteMainSource {
  readonly profile: "private.current-footprint-inverse-native-delete-main-source.v1";
}

export interface CurrentFootprintInverseNativeDeleteMainSourceOriginal {
  readonly naturalTail?: {
    readonly profile: "private.current-footprint-inverse-native-delete-main-tail-prerequisite.v1";
    readonly assertBeforeOriginalUpload: () => void;
    readonly assertCurrent: () => void;
  };
  readonly owner: CurrentFootprintInverseNativeOwner;
  readonly prepared: CurrentFootprintInversePreparedCheckpoint;
  readonly serialization: { readonly profile: "private.current-footprint-inverse-native-delete-serialization-result.v1" };
  readonly publication: CurrentFootprintInverseNativeDeletePublicationResult;
  readonly bodyPlan: CurrentFootprintDeletePlan | CurrentFootprintDeleteObservedPlan;
  readonly source: CurrentFootprintCopyNativeTarget;
  readonly beforeInventory: CurrentFootprintCopyNativeTarget["before"];
  readonly target: CurrentFootprintCopyNativeTarget["target"];
  readonly flowInput: CurrentFootprintSavedFlowCacheInput;
  readonly historyBaseline: CurrentFootprintInverseMainHistoryBaseline;
  readonly projectUuid: string;
  readonly branchUuid: string;
  readonly projectKey: string;
  readonly path: string;
  readonly assertCurrent: () => void;
  readonly assertBeforeOriginalUpload: () => void;
  readonly assertOriginalExit: () => void;
  readonly originalUploadWritten: () => boolean;
}
