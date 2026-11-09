/** Join the actual still-held qe, original DEL handler/service and native
 * message caller. This observes source packets and issues no runtime Job. */
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { currentFootprintInverseDeleteJobFrame } from "./current-footprint-inverse-delete-job-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_NATIVE_EVENT_CALLERS as CALLERS } from "./current-footprint-inverse-delete-native-event-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_WORKER_FORWARD_EXPRESSIONS as E } from "./current-footprint-inverse-delete-worker-forward-programs.ts";
import { qualifyCurrentFootprintInverseNativeDeliveryEvent } from "./current-footprint-inverse-native-delivery-replies.ts";
import { currentFootprintInverseLookupObject as object } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";
import type { CurrentFootprintInverseDeleteForwardIo as Io } from "./current-footprint-inverse-delete-forward-io.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, functionName: z.string(), functionLocation: location, location, returnValue: z.never().optional() });
const packet = z.looseObject({ params: z.looseObject({ callFrames: z.array(frame).length(8) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_DELETE_WORKER_FORWARD_OBSERVATION"); } }
/** Core supplies its original event and the prospective reply only from its
 * accepted original IGIVE sender, retaining both independent source receipts. */
/** Join the complete actual qe/DEL service/native caller stack with the
 * consumed original queue and packet. Native Event metadata alone proves
 * neither trusted delivery nor original Job or worker completion. */
export async function collectCurrentFootprintInverseDeleteWorkerForward(b: Readonly<{ io: Io; event: unknown; sessionId: string; scriptId: string; breakpointId: string; prelude: string; link: string; bound: string; replyTopic: string }>): Promise<Readonly<{ handlerFrame: string; serviceFrame: string; nativeFrame: string; servicePacket: string; nativeEvent: string; handlerArgumentsMatch: true; nativeEventMetadataMatch: true; runtimeJobIssued: false; workerDeleteCompleted: false; dispatchAuthorized: false }>> {
  b.io.current(); const service = currentFootprintInverseDeleteJobFrame(b.event, b.sessionId, b.scriptId, b.breakpointId); const frames = packet.parse(capture(b.event)).params.callFrames; const handler = frames[2]; const native = frames[7]; need(handler !== undefined && native !== undefined && new Set(frames.map(value => value.callFrameId)).size === 8);
  for (const row of CALLERS) { const actual = frames[row.index]; need(actual !== undefined && actual.functionName === row.functionName && actual.functionLocation.scriptId === b.scriptId && actual.functionLocation.lineNumber === row.lineNumber && actual.functionLocation.columnNumber === row.columnNumber && actual.location.scriptId === b.scriptId && actual.location.lineNumber === row.lineNumber && actual.location.columnNumber === row.pausedColumn); }
  const projected = await b.io.frame("worker-handler", handler.callFrameId, E.handler, 2, false); truth(await b.io.call("worker-handler", [projected.id, b.prelude, b.link, b.bound])); const serviceFrame = await b.io.frame("worker-service", service, E.service, 7, false); const selected = await b.io.tuple("worker-packet", [b.prelude, b.link, b.bound], 6, b.replyTopic, serviceFrame.id);
  const nativeFrame = await b.io.frame("worker-native", native.callFrameId, E.native, 2, false); const event = nativeFrame.values[1]; need(event !== undefined); qualifyCurrentFootprintInverseNativeDeliveryEvent(nativeFrame.packets[1]); b.io.current(); return Object.freeze({ handlerFrame: projected.id, serviceFrame: serviceFrame.id, nativeFrame: nativeFrame.id, servicePacket: selected.id, nativeEvent: object(event), handlerArgumentsMatch: true, nativeEventMetadataMatch: true, runtimeJobIssued: false, workerDeleteCompleted: false, dispatchAuthorized: false });
}
