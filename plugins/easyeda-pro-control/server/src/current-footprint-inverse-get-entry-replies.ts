/** Exact paused current209 GET chain. These are inert Inspector facts, never
 * a native Event, original GetJob, row or rearm capability. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_FUNCTIONS as FUNCTIONS } from "./current-footprint-inverse-get-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_WORKER_SITE as SITE } from "./current-footprint-inverse-get-worker-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_FUNCTIONS as RPC } from "./current-footprint-inverse-delete-rpc-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_NATIVE_EVENT_CALLERS as CALLERS } from "./current-footprint-inverse-delete-native-event-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const remote=z.looseObject({type:z.string()});const scope=z.looseObject({type:z.string(),object:remote});
const frame=z.strictObject({callFrameId:handle,functionName:z.string().max(128),functionLocation:location,location,url:z.string().max(8192),scopeChain:z.array(scope).max(16),this:remote,canBeRestarted:z.boolean().optional()});
const event=z.strictObject({method:z.literal("Debugger.paused"),sessionId:handle,params:z.strictObject({callFrames:z.array(frame).length(7),reason:z.enum(["other","debugCommand"]),hitBreakpoints:z.tuple([handle]),asyncStackTrace:z.unknown().optional(),asyncStackTraceId:z.unknown().optional()})});
const expected=freezeDeep([
 {functionName:SITE.functionName,lineNumber:SITE.functionLine,columnNumber:SITE.functionColumn,pausedColumn:SITE.columnNumber},
 {functionName:FUNCTIONS.handler.name,lineNumber:FUNCTIONS.handler.lineNumber,columnNumber:FUNCTIONS.handler.columnNumber,pausedColumn:137_923},
 {functionName:RPC.service.name,lineNumber:RPC.service.lineNumber,columnNumber:RPC.service.columnNumber,pausedColumn:8431},
 ...CALLERS.map(row=>({functionName:row.functionName,lineNumber:row.lineNumber,columnNumber:row.columnNumber,pausedColumn:row.pausedColumn})),
]);
function need(value:boolean):asserts value{if(!value){throw new Error("FOOTPRINT_INVERSE_GET_ENTRY_STACK");}}
export function currentFootprintInverseGetEntryFrames(input:unknown,sessionId:string,scriptId:string,breakpointId:string):Readonly<{entryFrame:string;serviceFrame:string;eventFrame:string}>{const value=event.parse(capture(input));need(value.sessionId===sessionId&&value.params.hitBreakpoints[0]===breakpointId&&expected.length===7);const ids=new Set<string>();for(const[index,row]of expected.entries()){const actual=value.params.callFrames[index];need(actual!==undefined&&actual.functionName===row.functionName&&!ids.has(actual.callFrameId)&&actual.functionLocation.scriptId===scriptId&&actual.functionLocation.lineNumber===row.lineNumber&&actual.functionLocation.columnNumber===row.columnNumber&&actual.location.scriptId===scriptId&&actual.location.lineNumber===row.lineNumber&&actual.location.columnNumber===row.pausedColumn);ids.add(actual.callFrameId);}const entry=value.params.callFrames[0];const service=value.params.callFrames[2];const native=value.params.callFrames[6];need(entry!==undefined&&service!==undefined&&native!==undefined);return Object.freeze({entryFrame:entry.callFrameId,serviceFrame:service.callFrameId,eventFrame:native.callFrameId});}
export const CURRENT_FOOTPRINT_INVERSE_GET_ENTRY_STACK=expected;
