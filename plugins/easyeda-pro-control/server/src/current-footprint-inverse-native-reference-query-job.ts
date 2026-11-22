import type {CurrentFootprintInverseNativeReferenceNextWorkerKind} from "./current-footprint-inverse-native-reference-next-worker-manager-programs.ts";
import type {CurrentFootprintInverseNativeReferenceNextCall} from "./current-footprint-inverse-native-reference-next-call.ts";
import type {CurrentFootprintInverseNativeReferenceNextWorkerFlow,CurrentFootprintInverseNativeReferenceNextWorkerForwarded} from "./current-footprint-inverse-native-reference-next-worker-flow.ts";
import type {CurrentFootprintInverseNativeReferenceNextWorkerForwardOriginal} from "./current-footprint-inverse-native-reference-next-worker-forward-controller.ts";
/** Core-issued native query custody. Public yw/worker registry tokens cannot create it. */
import type { CurrentFootprintInverseReferenceQueryJobBindings } from "./current-footprint-inverse-reference-query-job.ts";
import type { CurrentFootprintInverseNativeGetTaskUiResult } from "./current-footprint-inverse-native-get-task-ui-result.ts";

import type { CurrentFootprintInverseNativeReferencePcbForwardOriginal } from "./current-footprint-inverse-native-reference-pcb-forward-controller.ts";
import type { CurrentFootprintInverseNativeReferencePcbChannelOriginBindings } from "./current-footprint-inverse-native-reference-pcb-channel.ts";
import type { CurrentFootprintInverseNativeReferenceReadiness } from "./current-footprint-inverse-native-reference-worker.ts";

export interface CurrentFootprintInverseNativeReferenceQueryJob { readonly profile: "private.current-footprint-inverse-native-reference-query-job.v1" }
interface Common {
 readonly readiness: CurrentFootprintInverseNativeReferenceReadiness;
 readonly getResult: CurrentFootprintInverseNativeGetTaskUiResult;
 readonly footprintUuid: string; readonly replyTopic: string;
 readonly nativeEnvelope: CurrentFootprintInverseReferenceQueryJobBindings["nativeEnvelope"];
 readonly nativeOrigin: string;
 readonly assertOriginalUiHeld: () => void; readonly consumeOriginalUiHold: () => void;
 readonly assertCurrent: () => void; readonly assertOriginalForwarded: () => void;
}
export type CurrentFootprintInverseNativeReferenceQueryJobBindings=Readonly<Common&{kind:"pcb-all";forwarded:CurrentFootprintInverseNativeReferencePcbForwardOriginal;channelData:Pick<CurrentFootprintInverseNativeReferencePcbChannelOriginBindings,"originalData"|"registration"|"scripts">}>|Readonly<Common&{kind:CurrentFootprintInverseNativeReferenceNextWorkerKind;call:CurrentFootprintInverseNativeReferenceNextCall;flow:CurrentFootprintInverseNativeReferenceNextWorkerFlow;forwarded:CurrentFootprintInverseNativeReferenceNextWorkerForwardOriginal;originalForwarded:CurrentFootprintInverseNativeReferenceNextWorkerForwarded}>;
export { requireOriginalCurrentFootprintInverseNativeReferenceQueryJob } from "./current-footprint-inverse-v4-native-owner.ts";
