/** Strict held manager DEL body/method stacks. The projected argument checks
 * and genuine original continuation still precede every runtime advancement. */
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_POINTS as POINTS } from "./current-footprint-inverse-delete-send-source.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const remote=z.strictObject({type:z.enum(["object","function","undefined","string","number","boolean"]),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()});
const frame=z.strictObject({callFrameId:handle,functionName:z.string(),functionLocation:location,location,url:z.string(),scopeChain:z.array(z.unknown()).max(16),this:remote,returnValue:remote.optional(),canBeRestarted:z.boolean().optional()});
const paused=z.strictObject({method:z.literal("Debugger.paused"),sessionId:handle,params:z.strictObject({callFrames:z.array(frame).min(13).max(14),reason:z.enum(["other","debugCommand"]),hitBreakpoints:z.tuple([handle]),asyncStackTrace:z.unknown().optional(),asyncStackTraceId:z.unknown().optional()})});
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_DELETE_SEND_PAUSE");}}
interface Row{readonly name:string;readonly file:"ui"|"manager";readonly lineNumber:number;readonly columnNumber:number;readonly functionColumn:number;readonly pcLine?:number;}
/** Admit the selected original breakpoint and complete synchronous DEL caller
 * chain, before the original worker RPC body is allowed to execute. */
export function currentFootprintInverseDeleteSendPause(input:unknown,session:string,scripts:Readonly<{ui:string;manager:string}>,points:ReadonlyMap<string,keyof typeof POINTS>,profile:"ui"|"manager"):Readonly<{role:keyof typeof POINTS;frame:string;caller:string}>{
 const raw=paused.parse(capture(input));need(raw.sessionId===session);const role=points.get(raw.params.hitBreakpoints[0]);need(role!==undefined);const expected:Row[]=[POINTS[role]];
 if(role==="method"){expected.push({name:"",file:"manager",lineNumber:108,columnNumber:42_435,functionColumn:42_386});}
 expected.push({name:"",file:"manager",lineNumber:107,columnNumber:158_447,functionColumn:158_442},{name:"",file:"manager",lineNumber:108,columnNumber:25_079,functionColumn:25_065},
  ...(profile==="ui"?[{name:"",file:"ui"as const,lineNumber:1033,columnNumber:29_881,functionColumn:29_836},{name:"execute",file:"ui"as const,lineNumber:1033,columnNumber:28_722,functionColumn:28_690},{name:"publish",file:"ui"as const,lineNumber:1033,columnNumber:29_076,functionColumn:29_000},{name:"",file:"ui"as const,lineNumber:1033,columnNumber:30_178,functionColumn:30_140},{name:"rpcCall",file:"ui"as const,lineNumber:1033,columnNumber:30_128,functionColumn:30_110}]:[{name:"",file:"manager"as const,lineNumber:0,columnNumber:7184,functionColumn:7139},{name:"execute",file:"manager"as const,lineNumber:0,columnNumber:6035,functionColumn:6004},{name:"publish",file:"manager"as const,lineNumber:0,columnNumber:6387,functionColumn:6311},{name:"",file:"manager"as const,lineNumber:0,columnNumber:7479,functionColumn:7441},{name:"rpcCall",file:"manager"as const,lineNumber:0,columnNumber:7429,functionColumn:7412}]),
  {name:"deleteFootprint",file:"ui",lineNumber:1171,columnNumber:115_194,functionColumn:115_165},{name:"deleteFootprint",file:"ui",lineNumber:1171,columnNumber:128_869,functionColumn:128_844},{name:"",file:"ui",lineNumber:1935,columnNumber:1090,functionColumn:1083},{name:"c",file:"ui",lineNumber:1935,columnNumber:1075,functionColumn:400},{name:"yw",file:"ui",lineNumber:1933,columnNumber:4472,functionColumn:28_667,pcLine:1935});
 need(raw.params.callFrames.length===expected.length);for(const[index,row]of expected.entries()){const actual=raw.params.callFrames[index];need(actual!==undefined&&actual.returnValue===undefined&&actual.functionName===row.name&&actual.functionLocation.scriptId===scripts[row.file]&&actual.functionLocation.lineNumber===row.lineNumber&&actual.functionLocation.columnNumber===row.functionColumn&&actual.location.scriptId===scripts[row.file]&&actual.location.lineNumber===(row.pcLine??row.lineNumber)&&actual.location.columnNumber===row.columnNumber);}
 const caller=raw.params.callFrames[1],top=raw.params.callFrames[0];need(top!==undefined&&caller!==undefined);return Object.freeze({role,frame:top.callFrameId,caller:caller.callFrameId});
}
