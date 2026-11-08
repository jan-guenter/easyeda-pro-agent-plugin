/** Exact source event and fulfilled native Promise observations only. They
 * cannot mint the original SDK, worker delivery or deletion completion. */
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_COLLATERAL_RUN_POINTS as POINTS } from "./current-footprint-inverse-delete-collateral-run-programs.ts";
import type { CurrentFootprintInverseDeleteCollateralRunRole as Role } from "./current-footprint-inverse-delete-collateral-run-programs.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.enum(["object","function","string","number","boolean","undefined"]),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()});
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.strictObject({callFrameId:handle,functionName:z.string(),functionLocation:location,location,url:z.string(),scopeChain:z.array(z.unknown()).max(16),this:remote,returnValue:remote.optional(),canBeRestarted:z.boolean().optional()});
const event=z.strictObject({method:z.literal("Debugger.paused"),sessionId:handle,params:z.strictObject({callFrames:z.array(frame).min(1).max(4),reason:z.enum(["other","debugCommand"]),hitBreakpoints:z.tuple([handle]),asyncStackTrace:z.unknown().optional(),asyncStackTraceId:z.unknown().optional()})});
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_DELETE_COLLATERAL_RUN_REPLY");}}
/** Require the original source role, caller chain and actual async return handle. */
export function currentFootprintInverseDeleteCollateralRunPause(input:unknown,role:Role,session:string,script:string,point:string):Readonly<{frame:string;returnPromise:string|null}>{
 const p=POINTS[role],raw=event.parse(capture(input));need(raw.sessionId===session&&raw.params.hitBreakpoints[0]===point);let name="yy";if(role==="p4"||role==="p4Returned"){name="P4";}else if(role==="ja"||role==="jaReturned"){name="Ja";}const expected:{name:string;line:number;fnLine:number;fn:number;pc:number}[]=[{name,line:p.line,fnLine:p.line,fn:p.fn,pc:p.pc}];if(role==="p4"||role==="p4Returned"){expected.push({name:"Ja",line:1321,fnLine:1321,fn:124_325,pc:124_681});}if(role!=="jaReturned"){expected.push({name:"c",line:1935,fnLine:1935,fn:400,pc:name==="yy"?1590:1547},{name:"yw",line:1935,fnLine:1933,fn:28_667,pc:4472});}need(raw.params.callFrames.length===expected.length);
 for(const[index,r]of expected.entries()){const f=raw.params.callFrames[index];need(f!==undefined&&f.functionName===r.name&&f.functionLocation.scriptId===script&&f.functionLocation.lineNumber===r.fnLine&&f.functionLocation.columnNumber===r.fn&&f.location.scriptId===script&&f.location.lineNumber===r.line&&f.location.columnNumber===r.pc);}
 const top=raw.params.callFrames[0];need(top!==undefined);let promise:string|null=null;if(role.endsWith("Returned")){const returned=z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle}).parse(top.returnValue);promise=returned.objectId;}else{need(top.returnValue===undefined);}return Object.freeze({frame:top.callFrameId,returnPromise:promise});
}
const prototype=z.strictObject({name:z.literal("[[Prototype]]"),value:z.strictObject({type:z.literal("object"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle})});
const state=z.strictObject({name:z.literal("[[PromiseState]]"),value:z.strictObject({type:z.literal("string"),value:z.literal("fulfilled")})});
const result=z.strictObject({name:z.literal("[[PromiseResult]]"),value:z.strictObject({type:z.literal("undefined")})});
/** The exact Promise prototype pointer is additionally compared by the fixed
 * I11 promise program against the original same-realm receipt. */
export function qualifyCurrentFootprintInverseDeleteCollateralRunPromise(input:unknown):void{z.strictObject({result:z.tuple([]),internalProperties:z.tuple([prototype,state,result])}).parse(capture(input));}
