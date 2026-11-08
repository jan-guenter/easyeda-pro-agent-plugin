/** Exact original synchronous empty-check and dropped-async caller stack. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { qualifyCurrentFootprintInversePublicDeleteSource } from "./current-footprint-inverse-public-delete-source.ts";
import { qualifyCurrentFootprintSourceFunctionMetadata } from "./current-footprint-source-function-metadata.ts";

export const CURRENT_FOOTPRINT_INVERSE_DELETE_PREFIX_C_SOURCE=Object.freeze({start:15_338_483,end:15_340_587,name:"c",arity:0,kind:"function",async:true,strict:false,parent:null,lineNumber:1935,columnNumber:400}as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()}),remote=z.looseObject({type:z.string(),objectId:handle.optional()});
const frame=z.strictObject({callFrameId:handle,functionName:z.string(),functionLocation:location,location,url:z.string(),scopeChain:z.array(z.unknown()).max(16),this:remote,returnValue:remote.optional(),canBeRestarted:z.boolean().optional()});
const packet=z.strictObject({method:z.literal("Debugger.paused"),sessionId:handle,params:z.strictObject({callFrames:z.array(frame).min(1).max(6),reason:z.enum(["other","debugCommand"]),hitBreakpoints:z.tuple([handle]),asyncStackTrace:z.unknown().optional(),asyncStackTraceId:z.unknown().optional()})});
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_DELETE_PREFIX_REPLY");}}
export interface CurrentFootprintInverseDeletePrefixHeld{readonly role:"l"|"c"|"rpc";readonly frames:readonly string[];readonly point:string;}
export function currentFootprintInverseDeletePrefixPause(input:unknown,sessionId:string,scripts:Readonly<{ui:string;manager:string}>,profile:"ui"|"manager",role:"l"|"c"|"rpc",point:string,lIndex:0|1|2=0):CurrentFootprintInverseDeletePrefixHeld{
 const scriptId=scripts.ui;const raw=packet.parse(capture(input));need(raw.sessionId===sessionId&&raw.params.hitBreakpoints[0]===point);let expected:readonly(readonly(string|number|undefined)[])[];
 if(role==="l"){expected=[["l",1933,28_709,1933,28_725],["yw",1933,28_667,1935,[2816,2868,2916][lIndex]]];}
 else if(role==="c"){expected=[["c",1935,400,1935,427],["yw",1933,28_667,1935,4472]];}
 else{expected=[["rpcCall",profile==="ui"?1033:0,profile==="ui"?30_110:7412,profile==="ui"?1033:0,profile==="ui"?30_128:7429],["deleteFootprint",1171,115_165,1171,115_194],["deleteFootprint",1171,128_844,1171,128_869],["",1935,1083,1935,1090],["c",1935,400,1935,1075],["yw",1933,28_667,1935,4472]];}

 need(raw.params.callFrames.length===expected.length);for(const[index,f]of raw.params.callFrames.entries()){const e=expected[index];need(e!==undefined&&f.functionName===e[0]&&f.functionLocation.scriptId===(role==="rpc"&&index===0?scripts[profile]:scriptId)&&f.functionLocation.lineNumber===e[1]&&f.functionLocation.columnNumber===e[2]&&f.location.scriptId===(role==="rpc"&&index===0?scripts[profile]:scriptId)&&f.location.lineNumber===e[3]&&f.location.columnNumber===e[4]);}return Object.freeze({role,frames:Object.freeze(raw.params.callFrames.map(f=>f.callFrameId)),point});
}
export function qualifyCurrentFootprintInverseDeletePrefixC(text:unknown,metadata:unknown,scriptId:string,source:string):string{qualifyCurrentFootprintInversePublicDeleteSource("ui",source);const row=CURRENT_FOOTPRINT_INVERSE_DELETE_PREFIX_C_SOURCE;need(typeof text==="string"&&text===source.slice(row.start,row.end)&&Buffer.byteLength(text)===2104&&createHash("sha256").update(text).digest("hex")==="e2702c72f8b0136b70c27f1eb1139f6d576c3372afada8f663520990a24a37cb");return qualifyCurrentFootprintSourceFunctionMetadata(metadata,row,scriptId);}
