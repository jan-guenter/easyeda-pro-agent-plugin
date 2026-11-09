/** Actual original internal worker GET completion. It omits public UI row
 * and toast parity and cannot stand in for the separate genuine UI return. */
import type { CurrentFootprintInverseNativeGetTaskJob } from "./current-footprint-inverse-native-get-task-job.ts";
import type { observeCurrentFootprintInverseNativeGetTaskCompletion } from "./current-footprint-inverse-native-get-task-completion-observer.ts";
import type { CurrentFootprintInversePublicRowData } from "./current-footprint-inverse-public-row-data.ts";

export interface CurrentFootprintInverseNativeGetTaskWorkerCompletion { readonly profile: "private.current-footprint-inverse-native-get-task-worker-completion.v1" }
export interface CurrentFootprintInverseNativeGetTaskWorkerCompletionBindings {
  readonly job: CurrentFootprintInverseNativeGetTaskJob;
  readonly worker: Awaited<ReturnType<typeof observeCurrentFootprintInverseNativeGetTaskCompletion>>;
  readonly rowData: CurrentFootprintInversePublicRowData;
  readonly assertCurrent: () => void;
  /** Require the separate unconsumed UI return before its later transfer. */
  readonly assertOriginalUiHeld: () => void;
}
export { requireOriginalCurrentFootprintInverseNativeGetTaskWorkerCompletion } from "./current-pcb-diagnostic-owner.ts";
