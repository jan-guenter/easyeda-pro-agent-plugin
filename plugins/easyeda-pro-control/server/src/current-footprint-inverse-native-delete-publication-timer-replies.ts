/** Exact original timer frame and final null-slot data decoders. */
import {z} from "zod";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SITES as SITES} from "./current-footprint-forward-writer-ticket-timer-source.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";

type Role="entry"|"returned"|"selfReturned";

const handle=z.string().regex(/^[A-Za-z0-9_.:-]{1,256}$/u);
const loc=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.looseObject({callFrameId:handle,functionName:z.string(),location:loc,functionLocation:loc,returnValue:z.unknown().optional()});
const paused=z.looseObject({reason:z.literal("other"),hitBreakpoints:z.tuple([handle]),callFrames:z.array(frame).min(1).max(64)});
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_PUBLICATION_TIMER_${code}`);}}
export function currentFootprintInverseNativeDeletePublicationTimerFrame(input:unknown,role:Role,point:string,scriptId:string):string{
 const value=paused.parse(captureCurrentPcbStringClockReply(input).value);const top=value.callFrames[0];const site=SITES[role];need(top!==undefined&&value.hitBreakpoints[0]===point,"ORIGINAL_POINT");
 need(top.functionName===""&&top.location.scriptId===scriptId&&top.functionLocation.scriptId===scriptId&&top.location.lineNumber===site.lineNumber&&top.location.columnNumber===site.columnNumber&&top.functionLocation.lineNumber===site.functionLineNumber&&top.functionLocation.columnNumber===site.functionColumnNumber,"SOURCE_FRAME");
 if(top.returnValue!==undefined){need(role!=="entry","ENTRY_RETURN_VALUE");z.strictObject({type:z.literal("undefined")}).parse(top.returnValue);}return top.callFrameId;
}
const timerId=z.number().int().min(1).max(2_147_483_647).nullable();const ticket=z.number().int().min(0).max(Number.MAX_SAFE_INTEGER-1);const slotValue=z.strictObject({timer:timerId,ticket});const slotResult=z.strictObject({type:z.literal("object"),value:slotValue});export const currentFootprintInverseNativeDeletePublicationTimerSlotSchema=z.strictObject({result:slotResult});
