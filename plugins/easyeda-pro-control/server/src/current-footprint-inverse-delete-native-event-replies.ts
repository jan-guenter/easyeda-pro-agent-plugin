/** Original before-qe stack selection only. Native getter/target/trust and
 * full forwarded-envelope identity must be joined separately before use. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { currentFootprintInverseDeleteJobFrame } from "./current-footprint-inverse-delete-job-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_NATIVE_EVENT_CALLERS as CALLERS } from "./current-footprint-inverse-delete-native-event-source.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});const frame=z.looseObject({callFrameId:handle,functionName:z.string(),functionLocation:location,location});const event=z.looseObject({params:z.looseObject({callFrames:z.array(frame).min(8).max(64)})});
function need(value:boolean):asserts value{if(!value){throw new Error("FOOTPRINT_INVERSE_DELETE_NATIVE_EVENT_STACK");}}
export function currentFootprintInverseDeleteNativeEventFrame(input:unknown,sessionId:string,scriptId:string,breakpointId:string):string{
 const service=currentFootprintInverseDeleteJobFrame(input,sessionId,scriptId,breakpointId);const parsed=event.parse(capture(input));need(parsed.params.callFrames[3]?.callFrameId===service);const ids=new Set(parsed.params.callFrames.slice(0,4).map(row=>row.callFrameId));need(ids.size===4);
 for(const expected of CALLERS){const row=parsed.params.callFrames[expected.index];need(row!==undefined&&!ids.has(row.callFrameId)&&row.functionName===expected.functionName&&row.functionLocation.scriptId===scriptId&&row.functionLocation.lineNumber===expected.lineNumber&&row.functionLocation.columnNumber===expected.columnNumber&&row.location.scriptId===scriptId&&row.location.lineNumber===expected.lineNumber&&row.location.columnNumber===expected.pausedColumn);ids.add(row.callFrameId);}
 const callback=parsed.params.callFrames[7];need(callback!==undefined);return callback.callFrameId;
}
/** Conservative native dispatch stack: no additional JavaScript caller may
 * manually invoke the registered callback during another delivery. Actual
 * browser native getters and full original sender custody remain mandatory. */
export function currentFootprintInverseDeleteNativeDeliveryFrame(input:unknown,sessionId:string,scriptId:string,breakpointId:string):string{
 const selected=currentFootprintInverseDeleteNativeEventFrame(input,sessionId,scriptId,breakpointId);need(event.parse(capture(input)).params.callFrames.length===8);return selected;
}
