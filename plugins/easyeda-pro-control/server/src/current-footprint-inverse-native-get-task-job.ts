/** One fresh internal backend GET accepted by the original worker callback.
 * Public UI row/toast parity and GET body/result/reference/DEL remain separate. */
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskChannel } from "./current-footprint-inverse-native-get-task-channel.ts";
import type { CurrentFootprintInverseNativeGetTaskAcceptedData } from "./current-footprint-inverse-native-get-task-accept-collector.ts";
import type { CurrentFootprintInverseNativeGetTaskForwardOriginal } from "./current-footprint-inverse-native-get-task-forward-controller.ts";

export interface CurrentFootprintInverseNativeGetTaskJob { readonly profile: "private.current-footprint-inverse-native-get-task-job.v1" }
export interface CurrentFootprintInverseNativeGetTaskJobBindings {
  readonly channel: CurrentFootprintInverseNativeGetTaskChannel;
  readonly originalEvent: DiagnosticEvent;
  readonly accepted: CurrentFootprintInverseNativeGetTaskAcceptedData;
  readonly forwarded: CurrentFootprintInverseNativeGetTaskForwardOriginal;
  readonly assertCurrent: () => void;
  /** Reprove both actual pauses and this worker's completed observation. A
   * cached accepted tuple or equal-shaped event cannot replace their custody. */
  readonly assertOriginalHeld: () => void;
}
export { requireOriginalCurrentFootprintInverseNativeGetTaskJob } from "./current-pcb-diagnostic-owner.ts";
