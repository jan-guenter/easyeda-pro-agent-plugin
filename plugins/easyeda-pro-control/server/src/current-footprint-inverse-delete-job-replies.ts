/** Data-only original paused stack selector. Core must retain that exact
 * event through its Entry and prove the separate forwarded job before use. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { currentFootprintInverseDeleteEntryPause } from "./current-footprint-inverse-delete-entry-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_FUNCTIONS as RPC } from "./current-footprint-inverse-delete-rpc-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_CALLEES as CALLEES } from "./current-footprint-inverse-delete-binding-source.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frameSchema=z.looseObject({callFrameId:handle,functionName:z.string(),functionLocation:location,location});
const eventSchema=z.looseObject({params:z.looseObject({callFrames:z.array(frameSchema).min(4).max(64)})});
function need(value:boolean):asserts value{if(!value){throw new Error("FOOTPRINT_INVERSE_DELETE_JOB_STACK");}}
export function currentFootprintInverseDeleteJobFrame(input:unknown,sessionId:string,scriptId:string,breakpointId:string):string{
 const first=currentFootprintInverseDeleteEntryPause(input,sessionId,scriptId,breakpointId);const event=eventSchema.parse(capture(input));
 const expected=[CALLEES.find(row=>row.key==="deleteData"),RPC.handler,RPC.service];const columns=[40_416,138_712,8431];need(event.params.callFrames[0]?.callFrameId===first);const ids=new Set([first]);
 for(const[index,row]of expected.entries()){const frame=event.params.callFrames[index+1];need(row!==undefined&&frame!==undefined&&frame.functionName===row.name&&frame.functionLocation.scriptId===scriptId&&frame.functionLocation.lineNumber===row.lineNumber&&frame.functionLocation.columnNumber===row.columnNumber&&frame.location.scriptId===scriptId&&frame.location.lineNumber===row.lineNumber&&frame.location.columnNumber===columns[index]&&!ids.has(frame.callFrameId));ids.add(frame.callFrameId);}
 const service=event.params.callFrames[3];need(service!==undefined&&service.location.columnNumber===8431);return service.callFrameId;
}
