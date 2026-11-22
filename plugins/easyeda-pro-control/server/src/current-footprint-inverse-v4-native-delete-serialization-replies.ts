/** Exact paused-frame and fulfilled serialization Promise readers. */
import {z} from "zod";
import {captureCurrentFootprintDeleteWorkerEncoding} from "./current-footprint-delete-observed-plan.ts";
import type {CurrentFootprintDeleteWorkerEncoding} from "./current-footprint-delete-observed-plan.ts";
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import {captureCurrentFootprintInverseDeleteBindingReply as capture} from "./current-footprint-inverse-delete-binding-capture.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_BEGIN as BEGIN,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_SITES as SITES} from "./current-footprint-inverse-native-delete-serialization-profile.ts";
import {currentFootprintInverseNativeDeleteClockNative as native} from "./current-footprint-inverse-native-delete-clock-replies.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const remote=z.strictObject({type:z.string().max(64),subtype:z.string().max(128).optional(),className:z.string().max(128).optional(),description:z.string().max(8192).optional(),objectId:handle.optional(),value:z.unknown().optional()});
const frame=z.looseObject({callFrameId:handle,functionName:z.string().max(256),functionLocation:location,location,returnValue:remote.optional()});
const packet=z.looseObject({reason:z.literal("other"),hitBreakpoints:z.array(handle).max(1),callFrames:z.array(frame).min(1).max(32)});
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_SERIALIZATION_REPLY");}}
export function currentFootprintInverseNativeDeleteSerializationPause(event:DiagnosticEvent,role:"begin"|keyof typeof SITES,session:string,script:string,point:string|null):Readonly<{frame:string;returned:string|null}>{
 need(event.method==="Debugger.paused"&&event.sessionId===session);const p=packet.parse(capture(event.params));const top=p.callFrames[0];const site=role==="begin"?BEGIN:SITES[role];
 need(top!==undefined&&(point===null?p.hitBreakpoints.length===1:p.hitBreakpoints.length===1&&p.hitBreakpoints[0]===point)&&top.functionName===site.functionName&&top.location.scriptId===script&&top.location.lineNumber===site.lineNumber&&top.location.columnNumber===site.columnNumber&&top.functionLocation.scriptId===script&&top.functionLocation.lineNumber===site.functionLine&&top.functionLocation.columnNumber===site.functionColumn);
 if(role==="setterEntry"||role==="setterReturned"){need(p.callFrames.some(f=>f.functionName==="deleteString"&&f.functionLocation.scriptId===script&&f.functionLocation.lineNumber===BEGIN.functionLine&&f.functionLocation.columnNumber===BEGIN.functionColumn));}
 let returned:string|null=null;
 if(role==="stringReturned"){const v=top.returnValue;need(v?.type==="object"&&v.subtype==="promise"&&v.className==="Promise"&&v.description==="Promise"&&v.objectId!==undefined&&v.value===undefined);returned=v.objectId;}
 if(role==="setterReturned"){const v=top.returnValue;need(v?.type==="undefined"&&v.objectId===undefined&&v.value===undefined);}
 return Object.freeze({frame:top.callFrameId,returned});
}
export function currentFootprintInverseNativeDeleteSerializationPromise(input:unknown,body:string):void{
 const internal=z.strictObject({name:z.string().max(128),value:remote});const p=z.strictObject({result:z.tuple([]),internalProperties:z.array(internal).length(3)}).parse(capture(input));const f=new Map(p.internalProperties.map(v=>[v.name,v.value]));const proto=f.get("[[Prototype]]");const state=f.get("[[PromiseState]]");const result=f.get("[[PromiseResult]]");
 need(f.size===3&&proto?.type==="object"&&proto.className==="Promise"&&proto.objectId!==undefined&&proto.value===undefined&&state?.type==="string"&&state.objectId===undefined&&state.value==="fulfilled"&&result?.type==="string"&&result.objectId===undefined&&result.value===body);
}
/** Inspect native scopes before invoking any function, including self's getter.
 * Constructor statics remain data; only these seven exact functions are used. */
export function currentFootprintInverseNativeDeleteSerializationNative(input:unknown,role:"push"|"join"|"stringify"|"string"|"promise"|"then"|"self"):void{
 if(role==="promise"){native(input,"constructor");return;}if(role==="then"){native(input,"then");return;}
 const property=z.looseObject({name:z.string().max(256),value:remote.optional(),get:remote.optional(),set:remote.optional(),writable:z.boolean().optional(),configurable:z.boolean(),enumerable:z.boolean(),isOwn:z.literal(true)});
 const internal=z.strictObject({name:z.string().max(128),value:remote});const p=z.strictObject({result:z.array(property).min(2).max(24),internalProperties:z.array(internal).length(2)}).parse(capture(input));const f=new Map(p.result.map(v=>[v.name,v]));need(f.size===p.result.length&&(role==="string"||f.size===2));
 const names={push:["push",1],join:["join",1],stringify:["stringify",3],string:["String",1],self:["get self",0]} as const;const[name,arity]=names[role];
 for(const [k,v]of[["name",name],["length",arity]]as const){const d=f.get(k);need(d!==undefined&&!d.enumerable&&d.configurable&&d.writable===false&&d.get===undefined&&d.set===undefined&&d.value?.type===(k==="name"?"string":"number")&&d.value.objectId===undefined&&d.value.value===v);}
 const entries=new Map(p.internalProperties.map(v=>[v.name,v.value])),parent=entries.get("[[Prototype]]"),scopes=entries.get("[[Scopes]]");
 need(entries.size===2&&parent?.type==="function"&&parent.className==="Function"&&parent.objectId!==undefined&&parent.value===undefined&&scopes?.type==="object"&&scopes.subtype==="internal#scopeList"&&scopes.className==="Array"&&scopes.description==="Scopes[0]"&&scopes.objectId!==undefined&&scopes.value===undefined);
}

/** The already retained original environment tuple supplies only own-data
 * encoding. Its source-qualified guard is rechecked by every later program. */
export function currentFootprintInverseNativeDeleteSerializationEncoding(fields:ReadonlyMap<string,z.infer<typeof remote>>):CurrentFootprintDeleteWorkerEncoding{
 const present=fields.get("8"),undefinedValue=fields.get("9"),version=fields.get("10");
 need(present?.type==="boolean"&&typeof present.value==="boolean"&&present.objectId===undefined&&undefinedValue?.type==="boolean"&&typeof undefinedValue.value==="boolean"&&undefinedValue.objectId===undefined&&version!==undefined&&version.objectId===undefined);
 need(version.type==="string"&&typeof version.value==="string"&&version.subtype===undefined||version.type==="object"&&version.subtype==="null"&&version.value===null);
 return captureCurrentFootprintDeleteWorkerEncoding({workerEditorVersionPresent:present.value,workerEditorVersionUndefined:undefinedValue.value,workerEditorVersion:version.value});
}
