/** Fixed source/native/primitive decoding; matching Inspector data alone
 * cannot issue a timer origin, retained callback, resume or effect grant. */
import {z} from "zod";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_GUARD_SOURCE as GUARD,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BINDING_PROGRAMS as PROGRAMS} from "./current-footprint-forward-writer-ticket-timer-bindings.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SITES as SITES} from "./current-footprint-forward-writer-ticket-timer-source.ts";
import {currentFootprintInverseLookupNativeCallable,qualifyCurrentFootprintInverseLookupNativeConstructor} from "./current-footprint-inverse-lookup-native-metadata.ts";
import {decodeCurrentGeneratedSyncCallee} from "./current-generated-initial-sync-replies.ts";
import {decodeCurrentNativeFunctionMetadata} from "./current-native-function-metadata.ts";
import type {CurrentNativeFunctionProfile} from "./current-native-function-metadata.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import type {CurrentFootprintForwardWriterTicketTimerRole as Role} from "./current-footprint-forward-writer-ticket-timer-origin.ts";

const handle=z.string().regex(/^[A-Za-z0-9_.:-]{1,256}$/u);
const remote=z.looseObject({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()});
const loc=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.looseObject({callFrameId:handle,functionName:z.string(),location:loc,functionLocation:loc,returnValue:z.unknown().optional()});
const paused=z.looseObject({reason:z.literal("other"),hitBreakpoints:z.tuple([handle]),callFrames:z.array(frame).min(1).max(64)});
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`FORWARD_TICKET_TIMER_${code}`);}}
export function qualifyCurrentFootprintForwardWriterTicketTimerNative(input:unknown,actual:unknown,profile:CurrentNativeFunctionProfile):void{
 currentFootprintInverseLookupNativeCallable(actual,profile.name);
 if(profile.name==="Promise"||profile.name==="Symbol"){qualifyCurrentFootprintInverseLookupNativeConstructor(input,actual,profile.name);}else{decodeCurrentNativeFunctionMetadata(input,profile);}
}
export function qualifyCurrentFootprintForwardWriterTicketTimerMethod(input:unknown,actual:unknown,profile:Readonly<{name:string;arity:number;async:boolean;regular:boolean;lineNumber:number;columnNumber:number;source:string}>,scriptId:string):void{
 const value=remote.parse(captureCurrentPcbStringClockReply(actual).value);need(value.type==="function"&&value.subtype===undefined&&value.className==="Function"&&value.objectId!==undefined&&value.description===profile.source,"METHOD_SOURCE");
 decodeCurrentGeneratedSyncCallee(input,profile,scriptId);
}
export function qualifyCurrentFootprintForwardWriterTicketTimerGuard(input:unknown,actual:unknown):string{
 const value=remote.parse(captureCurrentPcbStringClockReply(actual).value);need(value.type==="function"&&value.subtype===undefined&&value.className==="Function"&&value.objectId!==undefined&&value.description===GUARD,"GUARD_SOURCE");
 const internal=z.strictObject({name:z.string(),value:remote});const schema=z.looseObject({internalProperties:z.array(internal).min(3).max(4)});const raw=schema.parse(captureCurrentPcbStringClockReply(input).value);
 const location=loc.parse(raw.internalProperties.find(row=>row.name==="[[FunctionLocation]]")?.value.value);
 const offset=PROGRAMS.capture.indexOf(GUARD);need(offset!==-1,"GUARD_IN_CAPTURE");const before=PROGRAMS.capture.slice(0,offset);const lineNumber=before.split("\n").length-1;const last=before.lastIndexOf("\n");const columnNumber=last===-1?offset+1:offset-last-1;
 decodeCurrentGeneratedSyncCallee(input,{name:"check",arity:0,async:false,regular:false,lineNumber,columnNumber},location.scriptId);return location.scriptId;
}
export function currentFootprintForwardWriterTicketTimerFrame(input:unknown,role:Role,point:string,scriptId:string):string{
 const value=paused.parse(captureCurrentPcbStringClockReply(input).value);const top=value.callFrames[0];const site=SITES[role];need(top!==undefined&&value.hitBreakpoints[0]===point,"ORIGINAL_POINT");
 need(top.functionName===""&&top.location.scriptId===scriptId&&top.functionLocation.scriptId===scriptId&&top.location.lineNumber===site.lineNumber&&top.location.columnNumber===site.columnNumber&&top.functionLocation.lineNumber===site.functionLineNumber&&top.functionLocation.columnNumber===site.functionColumnNumber,"SOURCE_FRAME");
 if(top.returnValue!==undefined){need(role!=="entry","ENTRY_RETURN_VALUE");z.strictObject({type:z.literal("undefined")}).parse(top.returnValue);}return top.callFrameId;
}
const timerId=z.number().int().min(1).max(2_147_483_647).nullable();const ticket=z.number().int().min(0).max(Number.MAX_SAFE_INTEGER-1);const slotValue=z.strictObject({timer:timerId,ticket});const slotResult=z.strictObject({type:z.literal("object"),value:slotValue});export const currentFootprintForwardWriterTicketTimerSlotSchema=z.strictObject({result:slotResult});
