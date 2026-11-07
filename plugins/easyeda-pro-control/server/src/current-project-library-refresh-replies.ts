/** Strict data-only class/frame joins. Only the private original owner and
 * observer can turn these actual correlated replies into a completion. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_FUNCTION_PROFILES as PROFILES, CURRENT_PROJECT_LIBRARY_REFRESH_SITES as SITES, qualifyCurrentProjectLibraryRefreshSource } from "./current-project-library-refresh-source.ts";

export { decodeCurrentProjectSyncQuiesceArray as decodeCurrentProjectLibraryRefreshTuple } from "./current-project-sync-quiesce-replies.ts";
export { currentFootprintCopyClockRpcV2ArrayObject as currentProjectLibraryRefreshArrayObject,decodeCurrentFootprintCopyClockRpcV2Array as decodeCurrentProjectLibraryRefreshFrame } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),text=z.string().max(8192);
const remote=z.strictObject({type:z.enum(["function","object","string","number"]),subtype:text.optional(),className:text.optional(),description:text.optional(),objectId:handle.optional(),value:z.unknown().optional()});
const property=z.strictObject({name:text,value:remote,writable:z.boolean(),configurable:z.boolean(),enumerable:z.boolean(),isOwn:z.literal(true)});
const internal=z.strictObject({name:text,value:remote});
const point=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
function need(value:boolean):asserts value{if(!value){throw new Error("PROJECT_LIBRARY_REFRESH_ORIGINAL_REPLY");}}
export function decodeCurrentProjectLibraryRefreshFunction(input:unknown,slot:number,scriptId:string,source:string):void {
 const profile=PROFILES.find(row=>row.slot===slot);need(profile!==undefined&&Number.isSafeInteger(slot));handle.parse(scriptId);
 if(profile.native){decodeCurrentNativeFunctionMetadata(input,{name:profile.name,arity:profile.arity,constructor:false});return;}
 qualifyCurrentProjectLibraryRefreshSource(source);
 const reply=z.strictObject({result:z.array(property).length(3),internalProperties:z.array(internal).length(3)}).parse(captureCurrentPcbStringClockReply(input).value);
 const fields=new Map(reply.result.map(row=>[row.name,row]));need(fields.size===3);
 for(const[name,value]of [["name",profile.name],["length",profile.arity]]as const){const row=fields.get(name);need(row!==undefined&&!row.writable&&!row.enumerable&&row.configurable&&row.value.type===(name==="name"?"string":"number")&&row.value.value===value&&row.value.objectId===undefined&&row.value.subtype===undefined);}
 let parentName="Object";if(profile.name==="fu"){parentName="Hm";}else if(!["Hm","Kr","mr"].includes(profile.name)){parentName="Kr";}
 const prototype=fields.get("prototype");need(prototype!==undefined&&!prototype.writable&&!prototype.enumerable&&!prototype.configurable&&prototype.value.type==="object"&&prototype.value.className===parentName&&prototype.value.description===parentName&&prototype.value.objectId!==undefined&&prototype.value.subtype===undefined&&prototype.value.value===undefined);
 const values=new Map(reply.internalProperties.map(row=>[row.name,row.value]));need(values.size===3);
 const at=values.get("[[FunctionLocation]]"),parent=values.get("[[Prototype]]"),scopes=values.get("[[Scopes]]");const location=point.parse(at?.value);
 need(at?.type==="object"&&at.subtype==="internal#location"&&location.scriptId===scriptId&&location.lineNumber===profile.lineNumber&&location.columnNumber===profile.columnNumber);
 let parentText="function () { [native code] }";if(parentName!=="Object"){const row=PROFILES.find(value=>value.name===parentName);need(row!==undefined&&!row.native);parentText=source.slice(row.start,row.end);}
 need(parent?.type==="function"&&parent.className==="Function"&&parent.description===parentText&&parent.objectId!==undefined&&parent.subtype===undefined&&scopes?.type==="object"&&scopes.subtype==="internal#scopeList"&&scopes.className==="Array"&&scopes.objectId!==undefined&&/^Scopes\[[1-4]\]$/u.test(scopes.description??""));
}
const frame=z.looseObject({callFrameId:handle,functionName:z.string(),location:point,functionLocation:point});
const pause=z.strictObject({method:z.literal("Debugger.paused"),sessionId:handle,params:z.looseObject({reason:z.literal("other"),hitBreakpoints:z.tuple([handle]),callFrames:z.array(frame).min(1).max(64)})});
export function currentProjectLibraryRefreshPause(input:unknown,sessionId:string,scriptId:string,points:ReadonlyMap<keyof typeof SITES,string>):Readonly<{role:keyof typeof SITES;callFrameId:string}> {
 const value=pause.parse(captureCurrentPcbStringClockReply(input).value);need(value.sessionId===sessionId);const selected=[...points].find(([,id])=>id===value.params.hitBreakpoints[0])?.[0];need(selected!==undefined);
 const site=SITES[selected],top=value.params.callFrames[0];need(top!==undefined);
 for(const[actual,expected]of [[top.location,site],[top.functionLocation,{lineNumber:site.functionLineNumber,columnNumber:site.functionColumnNumber}]]as const){need(actual.scriptId===scriptId&&actual.lineNumber===expected.lineNumber&&actual.columnNumber===expected.columnNumber);}
 if(selected==="firstLoop"||selected==="loopReturned"){const caller=value.params.callFrames[1];need(caller!==undefined&&caller.functionName==="mount"&&caller.location.scriptId===scriptId&&caller.location.lineNumber===106&&caller.location.columnNumber===24_071&&caller.functionLocation.scriptId===scriptId&&caller.functionLocation.lineNumber===106&&caller.functionLocation.columnNumber===23_888);}
 return Object.freeze({role:selected,callFrameId:top.callFrameId});
}
