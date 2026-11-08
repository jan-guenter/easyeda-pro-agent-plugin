/** Exact source-owned result stops and the actual two callback closure forms. */
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_RESULT_POINTS as POINTS } from "./current-footprint-inverse-get-result-source.ts";
import { currentFootprintInverseGetSendPause } from "./current-footprint-inverse-get-send-replies.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.enum(["object","function","undefined","number","string","boolean"]),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional(),unserializableValue:z.string().optional()});
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.strictObject({callFrameId:handle,functionName:z.string(),functionLocation:location,location,url:z.string(),scopeChain:z.array(z.unknown()).max(16),this:remote,canBeRestarted:z.boolean().optional()});
const packet=z.strictObject({method:z.literal("Debugger.paused"),sessionId:handle,params:z.strictObject({callFrames:z.array(frame).min(1).max(64),reason:z.enum(["other","debugCommand"]),hitBreakpoints:z.tuple([handle]),asyncStackTrace:z.unknown().optional(),asyncStackTraceId:z.unknown().optional()})});
export interface CurrentFootprintInverseGetResultHeld{readonly role:keyof typeof POINTS|"onMessage";readonly frame:string;readonly caller:string|null;readonly push:string|null;readonly kind:"native"|"local"|null;}
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_GET_RESULT_PAUSE");}}
export function currentFootprintInverseGetResultPause(input:unknown,sessionId:string,scripts:Readonly<{ui:string;manager:string}>,points:ReadonlyMap<string,keyof typeof POINTS>,onMessagePoint:string):Readonly<CurrentFootprintInverseGetResultHeld>{
 const raw=packet.parse(capture(input));need(raw.sessionId===sessionId);const id=raw.params.hitBreakpoints[0];
 if(id===onMessagePoint){const held=currentFootprintInverseGetSendPause(input,sessionId,scripts,new Map([[id,"onMessage"]]));return Object.freeze({role:"onMessage",frame:held.frame,caller:held.caller,push:null,kind:held.onMessageKind});}
 const role=points.get(id);need(role!==undefined);const p=POINTS[role],top=raw.params.callFrames[0];need(top!==undefined);const script=scripts[p.file];
 const same=(index:number,name:string,line:number,fn:number,pc:number):void=>{const f=raw.params.callFrames[index];need(f!==undefined&&f.functionName===name&&f.functionLocation.scriptId===script&&f.functionLocation.lineNumber===line&&f.functionLocation.columnNumber===fn&&f.location.scriptId===script&&f.location.lineNumber===line&&f.location.columnNumber===pc);};
 same(0,p.name,p.lineNumber,p.functionColumn,p.columnNumber);
 let push:string|null=null;
 if(role==="managerReply"||role==="uiReply"){need(raw.params.callFrames.length===2);same(1,"",p.lineNumber,p.file==="manager"?7233:29_931,p.file==="manager"?7242:29_940);}
 if(role==="managerCallback"||role==="uiCallback"){need(raw.params.callFrames.length===5);const manager=p.file==="manager";same(1,"execute",p.lineNumber,manager?6004:28_690,manager?6035:28_722);same(2,"push",p.lineNumber,manager?6585:29_277,manager?6679:29_371);same(3,"rpcReply",p.lineNumber,manager?7650:30_350,manager?7681:30_381);same(4,"",p.lineNumber,manager?7233:29_931,manager?7242:29_940);const f=raw.params.callFrames[2];need(f!==undefined);push=f.callFrameId;}
 return Object.freeze({role,frame:top.callFrameId,caller:raw.params.callFrames[1]?.callFrameId??null,push,kind:null});
}
const scopeField=z.strictObject({name:z.string(),value:z.strictObject({type:z.literal("object"),subtype:z.literal("internal#scope"),className:z.literal("Object"),description:z.string(),objectId:handle}),writable:z.literal(true),enumerable:z.literal(true),configurable:z.literal(true),isOwn:z.literal(true)});
export function currentFootprintInverseGetResultScope(input:unknown,kind:"subscribeOnce"|"anonymous"|"formatter"):string{const fields=z.strictObject({result:z.array(scopeField).min(kind==="formatter"?2:3).max(kind==="formatter"?3:6)}).parse(capture(input)).result;need(fields[0]?.value.description===(kind==="subscribeOnce"?"Closure (subscribeOnce)":"Closure")&&fields.at(-1)?.value.description==="Global");for(const[index,field]of fields.entries()){need(field.name===String(index));if(index>0&&index<fields.length-1){if(kind==="formatter"){need(index===1&&field.value.description==="Script");}else{need(field.value.description==="Closure"||field.value.description==="Closure (rpcCall)"||index===fields.length-2&&field.value.description==="Script");}}}const first=fields[0];need(first!==undefined);return first.value.objectId;}
