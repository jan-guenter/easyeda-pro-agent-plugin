/** Separate inverse cold-ingress codebook. Shared source/program facts carry
 * no saved-reader identity, cache grant, two-chunk grammar or resume authority. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentPcbViaSavedLoadObservationCases, validateCurrentPcbViaSavedLoadObservationCommand } from "./current-pcb-via-saved-load-observation-protocol.ts";
import type { CurrentPcbViaSavedLoadObservationCommand } from "./current-pcb-via-saved-load-observation-protocol.ts";
import { CURRENT_PCB_VIA_SAVED_LOAD_FLOW_METHODS as FLOW_METHODS, CURRENT_PCB_VIA_SAVED_LOAD_ROLES as ROLES, CURRENT_PCB_VIA_SAVED_LOAD_SITES as SITES } from "./current-pcb-via-saved-load-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export { CURRENT_PCB_VIA_SAVED_LOAD_SITES as CURRENT_FOOTPRINT_INVERSE_COLD_LOAD_SITES } from "./current-pcb-via-saved-load-source.ts";
export type { CurrentPcbViaSavedLoadRole as CurrentFootprintInverseColdLoadRole } from "./current-pcb-via-saved-load-source.ts";

const mapping=Object.freeze({"saved-observe-intrinsic":"inverse-cold-intrinsic","saved-observe-array":"inverse-cold-array","saved-observe-native":"inverse-cold-native","saved-observe-flow-method":"inverse-cold-flow-method","saved-observe-flow-functions":"inverse-cold-flow-functions","saved-observe-arm":"inverse-cold-arm","saved-observe-frame":"inverse-cold-frame","saved-observe-value":"inverse-cold-value","saved-observe-helper":"inverse-cold-helper"}as const);
type Allowed=Exclude<CurrentPcbViaSavedLoadObservationCommand,Readonly<{phase:"saved-observe-resume"|"saved-observe-start-project"}>>;
export type CurrentFootprintInverseColdLoadCommand=Allowed extends infer C?C extends Readonly<{phase:infer P}>?P extends keyof typeof mapping?Omit<C,"phase">&Readonly<{phase:typeof mapping[P]}>:never:never:never;
const envelope=z.looseObject({phase:z.string()});
export function currentFootprintInverseColdLoadSourceTemplate(input:unknown):Allowed{
  const raw=captureCurrentPcbStringClockReply(input).value;const base=envelope.parse(raw);const entry=Object.entries(mapping).find(([,value])=>value===base.phase);if(entry===undefined){throw new Error("FOOTPRINT_INVERSE_COLD_PHASE");}
  const parsed=validateCurrentPcbViaSavedLoadObservationCommand({...base,phase:entry[0]});
  if(parsed.phase==="saved-observe-resume"||parsed.phase==="saved-observe-start-project"||parsed.phase==="saved-observe-intrinsic"&&!parsed.role.startsWith("bytes")||parsed.phase==="saved-observe-native"&&parsed.role!=="bytes"||parsed.phase==="saved-observe-array"&&parsed.role.startsWith("cache")){throw new Error("FOOTPRINT_INVERSE_COLD_SOURCE_ONLY");}
  return parsed;
}
export function validateCurrentFootprintInverseColdLoadCommand(input:unknown):CurrentFootprintInverseColdLoadCommand{
  const command=currentFootprintInverseColdLoadSourceTemplate(input),value={...command,phase:mapping[command.phase]};
  const qualified=(candidate:unknown):candidate is CurrentFootprintInverseColdLoadCommand=>{currentFootprintInverseColdLoadSourceTemplate(candidate);return true;};
  if(!qualified(value)){throw new Error("FOOTPRINT_INVERSE_COLD_INTERNAL_MAPPING");}return freezeDeep(value);
}
export function currentFootprintInverseColdLoadCases():readonly CurrentFootprintInverseColdLoadCommand[]{
  const result:CurrentFootprintInverseColdLoadCommand[]=[];for(const command of currentPcbViaSavedLoadObservationCases()){
    if(command.phase!=="saved-observe-resume"&&command.phase!=="saved-observe-start-project"){
      const supported=!(command.phase==="saved-observe-intrinsic"&&!command.role.startsWith("bytes")||command.phase==="saved-observe-native"&&command.role!=="bytes"||command.phase==="saved-observe-array"&&command.role.startsWith("cache"));
      if(supported){result.push(validateCurrentFootprintInverseColdLoadCommand({...command,phase:mapping[command.phase]}));}
    }
  }return freezeDeep(result);
}

export function currentFootprintInverseColdLoadSlot(input:CurrentFootprintInverseColdLoadCommand):string{const command=validateCurrentFootprintInverseColdLoadCommand(input);return `${command.phase}${"role"in command?`-${command.role}`:""}${"index"in command?`-${String(command.index)}`:""}`;}
export function currentFootprintInverseColdLoadArmOrder():readonly string[]{return Object.freeze(["inverse-cold-intrinsic-bytesConstructors","inverse-cold-array-bytesConstructors","inverse-cold-native-bytes-1","inverse-cold-native-bytes-3","inverse-cold-intrinsic-bytesMembers","inverse-cold-array-bytesMembers","inverse-cold-native-bytes-5","inverse-cold-native-bytes-6","inverse-cold-intrinsic-bytesReprove",...ROLES.map(role=>`inverse-cold-arm-${role}`)]);}

/**9 byte-native commands,13 arms and3 helper reads. Observation capacities
 * derive from5 fixed pauses plus4 per actual selected chunk (maximum8),6
 * additional flow-closure proofs per chunk and exact helper source reads. */
export function currentFootprintInverseColdLoadBudget(chunks:number):Readonly<{chunks:number;arm:number;pauses:number;helperSources:number;normal:number;continuation:number;total:number}>{
  if(!Number.isSafeInteger(chunks)||chunks<1||chunks>8){throw new Error("FOOTPRINT_INVERSE_COLD_CHUNK_BOUND");}const pauses=5+4*chunks;const helperSources=3+2*pauses+chunks;const arm=9+ROLES.length+3;
  const normal=9+ROLES.length+2*pauses+1+5*chunks+helperSources;return Object.freeze({chunks,arm,pauses,helperSources,normal,continuation:0,total:normal});
}
export const CURRENT_FOOTPRINT_INVERSE_COLD_LOAD_REQUESTS=currentFootprintInverseColdLoadBudget(8);
export function currentFootprintInverseColdLoadWire(input:CurrentFootprintInverseColdLoadCommand,id:number,sessionId:string):CurrentFootprintInverseColdLoadCommand&Readonly<{id:number;sessionId:string;inverseColdLoad:true}>{
  if(!Number.isSafeInteger(id)||id<1||!/^[A-Za-z\d_.:-]{1,256}$/u.test(sessionId)){throw new Error("FOOTPRINT_INVERSE_COLD_ENVELOPE");}const command=validateCurrentFootprintInverseColdLoadCommand(input);
  // The immutable source encoder's value template stores the fixed by-value
  // Option before arguments. Preserve that exact field order on this wire.
  if(command.phase==="inverse-cold-value"){const{arguments:args,returnByValue,...rest}=command.params;return freezeDeep({...command,params:{...rest,returnByValue,arguments:args},id,sessionId,inverseColdLoad:true});}
  return freezeDeep({...command,id,sessionId,inverseColdLoad:true});
}
export function currentFootprintInverseColdLoadNativeFrame(chunk:Buffer,input:CurrentFootprintInverseColdLoadCommand,sessionId:string):Readonly<Record<string,string|number>>{
  if(chunk.length>65_536||chunk.at(-1)!==0){throw new Error("FOOTPRINT_INVERSE_COLD_FRAME");}const command=validateCurrentFootprintInverseColdLoadCommand(input),raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(chunk.subarray(0,-1))),value=z.looseObject({id:z.number().int().positive()}).parse(captureCurrentPcbStringClockReply(raw).value);
  const expected=currentFootprintInverseColdLoadWire(command,value.id,sessionId);if(canonicalJson(expected)!==canonicalJson(value)||chunk.toString("utf8")!==`${JSON.stringify(expected)}\0`){throw new Error("FOOTPRINT_INVERSE_COLD_FRAME");}
  const base={action:"footprint-inverse-cold",requestId:value.id,phase:currentFootprintInverseColdLoadSlot(command),method:command.method};
  if(command.method==="Debugger.setBreakpoint"){return freezeDeep({...base,scriptId:command.params.location.scriptId});}if(command.method==="Debugger.getScriptSource"){return freezeDeep({...base,scriptId:command.params.scriptId});}
  if(command.method==="Debugger.evaluateOnCallFrame"){return freezeDeep({...base,callFrameId:command.params.callFrameId});}
  if(command.method==="Runtime.getProperties"){return freezeDeep({...base,objectId:command.params.objectId});}
  const fields:Record<string,string>="uniqueContextId"in command.params?{uniqueContextId:command.params.uniqueContextId}:{objectId:command.params.objectId};for(const[index,arg]of command.params.arguments.entries()){fields[`argument${String(index)}`]=arg.objectId;}return freezeDeep({...base,...fields});
}

/** Pure supplied event classification only. The retained original controller
 * separately owns the event and exact armed-point map; copies grant nothing. */
export function classifyCurrentFootprintInverseColdPause(input:unknown,sessionId:string,scriptId:string,points:readonly Readonly<{role:keyof typeof SITES;id:string}>[]):keyof typeof SITES{
 const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);const at=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
 const frame=z.looseObject({callFrameId:handle,functionName:z.string(),location:at,functionLocation:at});
 const schema=z.strictObject({method:z.literal("Debugger.paused"),sessionId:handle,params:z.looseObject({hitBreakpoints:z.tuple([handle]),callFrames:z.array(frame).min(1).max(32)})});
 const event=schema.parse(captureCurrentPcbStringClockReply(input).value);handle.parse(scriptId);handle.parse(sessionId);
 if(event.sessionId!==sessionId||points.length!==ROLES.length||new Set(points.map(point=>point.role)).size!==ROLES.length||new Set(points.map(point=>point.id)).size!==ROLES.length||!ROLES.every(role=>points.some(point=>point.role===role))){throw new Error("FOOTPRINT_INVERSE_COLD_EVENT_ROSTER");}
 for(const point of points){handle.parse(point.id);}const selected=points.find(point=>point.id===event.params.hitBreakpoints[0]);const top=event.params.callFrames[0];if(selected===undefined||top===undefined){throw new Error("FOOTPRINT_INVERSE_COLD_EVENT_POINT");}const site=SITES[selected.role];
 if(top.location.scriptId!==scriptId||top.location.lineNumber!==site.lineNumber||top.location.columnNumber!==site.columnNumber||top.functionLocation.scriptId!==scriptId||top.functionLocation.lineNumber!==site.functionLine||top.functionLocation.columnNumber!==site.functionColumn||top.functionName!==site.functionName){throw new Error("FOOTPRINT_INVERSE_COLD_EVENT_SOURCE");}return selected.role;
}

export { CURRENT_FOOTPRINT_INVERSE_COLD_STEP_REQUESTS, currentFootprintInverseColdStepBudget } from "./current-footprint-inverse-cold-step-protocol.ts";
export type { CurrentFootprintInverseColdStepCommand } from "./current-footprint-inverse-cold-step-protocol.ts";

/** Fixed inert function metadata only; the genuine inverse owner must retain
 * and request these exact original flow references before any input release. */
export function qualifyCurrentFootprintInverseColdFlowMethod(input:unknown,role:keyof typeof FLOW_METHODS,scriptId:string):void{
 const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);const remote=z.looseObject({type:z.string(),value:z.unknown().optional(),objectId:handle.optional(),subtype:z.string().optional()});
 const property=z.looseObject({name:z.string(),value:remote,writable:z.literal(false),configurable:z.literal(true),enumerable:z.literal(false),isOwn:z.literal(true)});
 const internal=z.strictObject({name:z.string(),value:remote});const data=z.strictObject({result:z.array(property).length(2),internalProperties:z.array(internal).length(3)}).parse(captureCurrentPcbStringClockReply(input).value);
 const expected=FLOW_METHODS[role];const fields=new Map(data.result.map(item=>[item.name,item.value]));const parts=new Map(data.internalProperties.map(item=>[item.name,item.value]));
 if(fields.size!==2||fields.get("name")?.type!=="string"||fields.get("name")?.value!==expected.name||fields.get("length")?.type!=="number"||fields.get("length")?.value!==expected.arity||parts.size!==3){throw new Error("FOOTPRINT_INVERSE_COLD_FLOW_METHOD");}
 const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()}).parse(parts.get("[[FunctionLocation]]")?.value);
 if(location.scriptId!==scriptId||location.lineNumber!==expected.lineNumber||location.columnNumber!==expected.columnNumber||parts.get("[[FunctionLocation]]")?.subtype!=="internal#location"||parts.get("[[Scopes]]")?.subtype!=="internal#scopeList"||parts.get("[[Prototype]]")?.type!=="function"){throw new Error("FOOTPRINT_INVERSE_COLD_FLOW_SOURCE");}
}

export { CURRENT_FOOTPRINT_INVERSE_STARTUP_CALLBACK_ROLES, currentFootprintInverseStartupCallbackBudget } from "./current-footprint-inverse-startup-callback-protocol.ts";
export type { CurrentFootprintInverseStartupCallbackCommand, CurrentFootprintInverseStartupCallbackRole } from "./current-footprint-inverse-startup-callback-protocol.ts";
