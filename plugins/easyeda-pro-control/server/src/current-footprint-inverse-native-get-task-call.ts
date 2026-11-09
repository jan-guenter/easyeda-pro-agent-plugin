/** Original internal native-task GET Call. This route omits public UI row and
 * toast parity. The held Call grants no RPC body, accepted worker Job or DEL. */
import type { CurrentFootprintInverseNativeGetReadiness } from "./current-footprint-inverse-native-get-readiness.ts";
import type { CurrentFootprintInverseNativeGetTaskOriginalSenderHold } from "./current-footprint-inverse-native-get-task-call-controller.ts";
import type { CurrentFootprintInverseNativeGetTaskSenderPrepared } from "./current-footprint-inverse-native-get-task-sender-collector.ts";

export interface CurrentFootprintInverseNativeGetTaskCall { readonly profile: "private.current-footprint-inverse-native-get-task-call.v1" }
export interface CurrentFootprintInverseNativeGetTaskCallBindings {
  readonly readiness: CurrentFootprintInverseNativeGetReadiness;
  readonly sender: CurrentFootprintInverseNativeGetTaskSenderPrepared;
  readonly receipt: string;
  readonly uiScriptId: string;
  readonly managerScriptId: string;
  readonly assertCurrent: () => void;
  /** Fresh original owner/write/event custody; no permission to resume. */
  readonly assertOriginalHeld: () => CurrentFootprintInverseNativeGetTaskOriginalSenderHold;
}
export { requireOriginalCurrentFootprintInverseNativeGetTaskCall } from "./current-pcb-diagnostic-owner.ts";
