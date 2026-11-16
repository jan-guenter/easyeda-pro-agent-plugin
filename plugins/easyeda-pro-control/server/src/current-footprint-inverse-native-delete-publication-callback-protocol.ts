/** Same immutable callback source, distinct native ready-state grammar.
 * Historical startup groups, ledgers and isReady=false proofs stay unchanged. */
import {z} from "zod";
import {CURRENT_PROJECT_SAVE_STRUCTURE_CALLS as STARTUP} from "./current-project-save-structure-programs.ts";
import {CURRENT_PROJECT_SAVE_STRUCTURE_CALL_FLAGS as FLAGS,CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SITES} from "./current-project-save-structure-protocol.ts";
import {currentFootprintInverseStartupCallbackCases as callbackCases,validateCurrentFootprintInverseStartupCallbackCommand as validateCallback} from "./current-footprint-inverse-startup-callback-protocol.ts";
import {validateCurrentFootprintInverseStartupQueueCommand as queue,currentFootprintInverseStartupQueueCases as queueCases} from "./current-footprint-inverse-startup-queue-protocol.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const group="easyeda-inverse-native-delete-publication-callback-v1";
function once(source:string,before:string,after:string):string{if(source.split(before).length!==2){throw new Error("INVERSE_NATIVE_DELETE_CALLBACK_PREIMAGE");}return source.replace(before,after);}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_CALLBACK_CALLS=Object.freeze({
 startupEntry:once(STARTUP.startupEntry,'own(project,"isReady")!==false','own(project,"isReady")!==true'),
 startupReturn:once(STARTUP.startupReturn,'own(project,"isReady")!==false','own(project,"isReady")!==true'),
 startupFinalizer:once(STARTUP.startupFinalizer,'own(globalThis,"PROJECT")!==project','own(globalThis,"PROJECT")!==project||own(project,"isReady")!==true'),
});
const CALLS=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_CALLBACK_CALLS;
const envelope=z.strictObject({phase:z.literal("inverse-native-delete-publication-callback"),lane:z.enum(["setup","callback","queue"]),command:z.unknown()});
const pointRoles=["startupEntry","startupReturn","initialFinally","queuedFinally"]as const;
const handle=z.string().regex(/^[A-Za-z0-9_.:-]{1,256}$/u);
/* oxlint-disable unicorn/max-nested-calls -- Each fixed original ready callback point pins its exact coordinates and empty condition. */
const ownPoint=z.union([
 ...pointRoles.map(role=>z.strictObject({phase:z.literal("inverse-native-delete-publication-callback-arm"),role:z.literal(role),method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location:z.strictObject({scriptId:handle,lineNumber:z.literal(SITES[role].lineNumber),columnNumber:z.literal(SITES[role].columnNumber)}),condition:z.literal("")})})),
 z.strictObject({phase:z.literal("inverse-native-delete-publication-callback-retire"),role:z.enum(pointRoles),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})}),
]);
/* oxlint-enable unicorn/max-nested-calls */
const helper=z.strictObject({phase:z.literal("inverse-native-delete-publication-callback-helper"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:z.string().regex(/^[A-Za-z0-9_.:-]{1,256}$/u)})});
type Fixed=ReturnType<typeof validateCallback>|ReturnType<typeof queue>|z.infer<typeof helper>|z.infer<typeof ownPoint>;
export type CurrentFootprintInverseNativeDeletePublicationCallbackCommand=Readonly<{phase:"inverse-native-delete-publication-callback";lane:"setup"|"callback"|"queue";command:Fixed}>;
function roleFor(phase:unknown):keyof typeof CALLS|null{
 if(phase==="project-save-structure-startupEntry"){return "startupEntry";}if(phase==="project-save-structure-startupReturn"){return "startupReturn";}return phase==="project-save-structure-startupFinalizer"?"startupFinalizer":null;
}
export function validateCurrentFootprintInverseNativeDeletePublicationCallbackCommand(input:unknown):CurrentFootprintInverseNativeDeletePublicationCallbackCommand{
 const value=envelope.parse(captureCurrentPcbStringClockReply(input).value);const ownHelper=helper.safeParse(value.command);if(ownHelper.success&&value.lane!=="setup"){return freezeDeep({...value,command:ownHelper.data});}if(value.lane==="setup"){return freezeDeep({...value,command:ownPoint.parse(value.command)});}const command=z.record(z.string(),z.unknown()).parse(value.command);const role=roleFor(command["phase"]);const params=z.record(z.string(),z.unknown()).parse(command["params"]);let normalized:unknown=command;
 if(role!==null){if(params["functionDeclaration"]!==CALLS[role]){throw new Error("INVERSE_NATIVE_DELETE_CALLBACK_READY_SOURCE");}normalized={...command,params:{...params,functionDeclaration:STARTUP[role]}};}
 const record=z.record(z.string(),z.unknown()).parse(normalized);const fields=z.record(z.string(),z.unknown()).parse(record["params"]);
 if(Object.hasOwn(fields,"objectGroup")){if(fields["objectGroup"]!==group){throw new Error("INVERSE_NATIVE_DELETE_CALLBACK_GROUP");}normalized={...record,params:{...fields,objectGroup:FLAGS.objectGroup}};}
 const fixed=value.lane==="callback"?validateCallback(normalized):queue(normalized);
 if(fixed.method==="Debugger.setBreakpoint"||fixed.method==="Debugger.removeBreakpoint"||fixed.method==="Debugger.getScriptSource"){throw new Error("INVERSE_NATIVE_DELETE_CALLBACK_READ_OR_ORIGINAL_RESUME");}
 let returned:unknown=fixed;if("objectGroup"in fixed.params){returned={...fixed,params:{...fixed.params,objectGroup:group}};}
 if(role!==null){const c=z.record(z.string(),z.unknown()).parse(returned),p=z.record(z.string(),z.unknown()).parse(c["params"]);returned={...c,params:{...p,functionDeclaration:CALLS[role]}};}
 // Only the independently validated own group and fixed program literals differ.
 // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The old pure syntax validators fix every other field and role above.
 return freezeDeep({...value,command:returned as Fixed});
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_CALLBACK_FLAGS=Object.freeze({...FLAGS,objectGroup:group});
export function currentFootprintInverseNativeDeletePublicationCallbackCases():readonly CurrentFootprintInverseNativeDeletePublicationCallbackCommand[]{
 const out:CurrentFootprintInverseNativeDeletePublicationCallbackCommand[]=[];
 for(const lane of["callback","queue"]as const){for(const c of lane==="callback"?callbackCases():queueCases()){if(c.method!=="Debugger.setBreakpoint"&&c.method!=="Debugger.removeBreakpoint"&&c.method!=="Debugger.getScriptSource"){const role=roleFor(c.phase);const params={...c.params,...("objectGroup"in c.params?{objectGroup:group}:{}),...(role===null?{}:{functionDeclaration:CALLS[role]})};out.push(validateCurrentFootprintInverseNativeDeletePublicationCallbackCommand({phase:"inverse-native-delete-publication-callback",lane,command:{...c,params}}));}}}
 for(const role of pointRoles){const site=SITES[role];out.push(validateCurrentFootprintInverseNativeDeletePublicationCallbackCommand({phase:"inverse-native-delete-publication-callback",lane:"setup",command:{phase:"inverse-native-delete-publication-callback-arm",role,method:"Debugger.setBreakpoint",params:{location:{scriptId:"original_ref",lineNumber:site.lineNumber,columnNumber:site.columnNumber},condition:""}}}),validateCurrentFootprintInverseNativeDeletePublicationCallbackCommand({phase:"inverse-native-delete-publication-callback",lane:"setup",command:{phase:"inverse-native-delete-publication-callback-retire",role,method:"Debugger.removeBreakpoint",params:{breakpointId:"original_ref"}}}));}
 for(const lane of["callback","queue"]as const){out.push(validateCurrentFootprintInverseNativeDeletePublicationCallbackCommand({phase:"inverse-native-delete-publication-callback",lane,command:{phase:"inverse-native-delete-publication-callback-helper",method:"Debugger.getScriptSource",params:{scriptId:"original_ref"}}}));}
 return freezeDeep(out);
}


export function currentFootprintInverseNativeDeletePublicationCallbackTemplate(input:CurrentFootprintInverseNativeDeletePublicationCallbackCommand):Readonly<{key:string;method:string;names:readonly string[];values:Readonly<Record<string,string>>;template:string}>{
 const outer=validateCurrentFootprintInverseNativeDeletePublicationCallbackCommand(input);const c=outer.command;const values:Record<string,string>={};const params:Record<string,unknown>={...c.params};
 const field=(name:string,value:string):string=>{values[name]=value;return `__inverse_native_delete_callback_${name}__`;};
 if(c.method==="Runtime.callFunctionOn"){params["objectId"]=field("objectId",c.params.objectId);params["arguments"]=c.params.arguments.map((a,i)=>({objectId:field(`arg${String(i)}`,a.objectId)}));}
 else if(c.method==="Runtime.getProperties"){params["objectId"]=field("objectId",c.params.objectId);}
 else if(c.method==="Debugger.evaluateOnCallFrame"){params["callFrameId"]=field("callFrameId",c.params.callFrameId);}else if(c.method==="Debugger.getScriptSource"){params["scriptId"]=field("scriptId",c.params.scriptId);}else if(c.method==="Debugger.setBreakpoint"){params["location"]={...c.params.location,scriptId:field("scriptId",c.params.location.scriptId)};}else if(c.method==="Debugger.removeBreakpoint"){params["breakpointId"]=field("breakpointId",c.params.breakpointId);}
 const role="role"in c?c.role:null;
 return freezeDeep({key:`${outer.lane}:${c.phase}${role===null?"":`:${role}`}`,method:c.method,names:Object.keys(values),values,template:JSON.stringify({method:c.method,params})});
}
export function currentFootprintInverseNativeDeletePublicationCallbackWire(input:CurrentFootprintInverseNativeDeletePublicationCallbackCommand,id:number,sessionId:string):Readonly<{phase:"inverse-native-delete-publication-callback";lane:"setup"|"callback"|"queue";command:Fixed;id:number;sessionId:string;inverseNativeDeletePublicationCallback:true}>{
 if(!Number.isSafeInteger(id)||id<1||!/^[A-Za-z0-9_.:-]{1,256}$/u.test(sessionId)){throw new Error("INVERSE_NATIVE_DELETE_CALLBACK_ENVELOPE");}return freezeDeep({...validateCurrentFootprintInverseNativeDeletePublicationCallbackCommand(input),id,sessionId,inverseNativeDeletePublicationCallback:true});
}
export function currentFootprintInverseNativeDeletePublicationCallbackNativeFrame(bytes:Buffer,input:CurrentFootprintInverseNativeDeletePublicationCallbackCommand,sessionId:string):Readonly<Record<string,string|number>>{
 if(bytes.length>65_536||bytes.at(-1)!==0){throw new Error("INVERSE_NATIVE_DELETE_CALLBACK_FRAME");}const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes.subarray(0,-1)));const id=z.looseObject({id:z.number().int().positive()}).parse(captureCurrentPcbStringClockReply(raw).value).id;const c=validateCurrentFootprintInverseNativeDeletePublicationCallbackCommand(input);
 if(bytes.toString("utf8")!==`${JSON.stringify(currentFootprintInverseNativeDeletePublicationCallbackWire(c,id,sessionId))}\0`){throw new Error("INVERSE_NATIVE_DELETE_CALLBACK_FRAME");}const row=currentFootprintInverseNativeDeletePublicationCallbackTemplate(c);
 return freezeDeep({action:"footprint-inverse-native-delete-publication-callback",requestId:id,phase:c.lane,kind:c.command.phase,method:c.command.method,...("role"in c.command?{role:c.command.role}:{}),...row.values});
}
