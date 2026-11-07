/** Original inverse-only intent. Temporary loop suspension/RAF cancellation
 * has no selected design, Save, native-owner transfer or replay authority. */
export interface CurrentFootprintInverseLibraryRefreshIntent {readonly profile:"private.current-footprint-inverse-library-refresh-intent.v1"}
export interface CurrentFootprintInverseLibraryRefreshEnrollment {
 readonly assertCurrent:()=>void;readonly assertBeforeAttempt:()=>void;readonly assertOriginalAttempted:()=>void;readonly assertPublished:()=>Promise<void>;
}
export {requireOriginalCurrentFootprintInverseLibraryRefreshIntent,enrollCurrentFootprintInverseLibraryRefreshIntent,consumeCurrentFootprintInverseLibraryRefreshIntent} from "./current-pcb-diagnostic-owner.ts";
