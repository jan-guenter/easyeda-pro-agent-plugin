/** Fixed original tombstone serialization grammar. JSON grants no custody. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-native-delete-serialization-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_BEGIN as BEGIN, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_ORDER as ROLES, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_SITES as SITES } from "./current-footprint-inverse-native-delete-serialization-profile.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_GROUP = "easyeda-footprint-inverse-native-delete-serialization-worker-v1";
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_PREFIX = "inverse-native-delete-serialization-";
const group = CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_GROUP, prefix = CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_PREFIX;
const calls = ["environment","begin",...ROLES,"retainReturn"] as const;
const frames = ["begin",...ROLES] as const;
const properties = ["environment","push","join","stringify","string","promise","then","self","begin",...ROLES,"retained","returned-constructor","fulfilled-before","fulfilled-after"] as const;
const resumes = ["begin",...ROLES.slice(0,-1)] as const;
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), reference = z.strictObject({objectId:handle});
const integer = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER-2).refine(n=>!Object.is(n,-0));
export const currentFootprintInverseNativeDeleteSerializationExpectedSchema = z.strictObject({
 projectUuid:z.string().regex(/^[a-f\d]{64}$/u),branchUuid:z.string().regex(/^[a-f\d]{32}$/u),
 targetUuid:z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),client:z.string().regex(/^[a-f\d]{16}$/u),
 maximumTicket:integer,documentClock:integer.positive().max(8_640_000_000_000_000),
});
const texts=z.tuple([z.string().min(1).max(1024),z.string().min(1).max(256),z.string().min(1).max(1280)]);
/* oxlint-disable unicorn/max-nested-calls -- Exact positional arguments form the closed native codebook. */
const argumentsFor={
 environment:z.tuple([]),begin:z.tuple([reference,z.strictObject({value:currentFootprintInverseNativeDeleteSerializationExpectedSchema}),z.strictObject({value:texts}),reference]),
 headReady:z.tuple([reference]),setterEntry:z.tuple([reference]),setterReturned:z.tuple([reference,reference]),retainReturn:z.tuple([]),
 stringReturned:z.tuple([reference,reference]),callerReady:z.tuple([reference,reference,reference]),uploadEntry:z.tuple([reference,reference]),
} as const;
const flags={silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false),objectGroup:z.literal(group)};
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal(`${prefix}call`),role:z.enum(calls),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.string().max(20_000),arguments:z.array(z.unknown()).max(4),returnByValue:z.literal(false)})}),
 z.strictObject({phase:z.literal(`${prefix}frame`),role:z.enum(frames),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({callFrameId:handle,expression:z.string().max(128),objectGroup:z.literal(group),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal(`${prefix}arm`),role:z.enum(["headReady","setterEntry","setterReturned","stringReturned","callerReady"]),method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location:z.strictObject({scriptId:handle,lineNumber:integer,columnNumber:integer}),condition:z.literal("")})}),
 z.strictObject({phase:z.literal(`${prefix}original-point`),role:z.enum(["before","held"]),method:z.literal("Debugger.getPossibleBreakpoints"),params:z.strictObject({start:z.strictObject({scriptId:handle,lineNumber:z.literal(SITES.uploadEntry.lineNumber),columnNumber:z.literal(SITES.uploadEntry.columnNumber)}),end:z.strictObject({scriptId:handle,lineNumber:z.literal(SITES.uploadEntry.lineNumber),columnNumber:z.literal(SITES.uploadEntry.columnNumber+1)}),restrictToFunction:z.literal(true)})}),
 z.strictObject({phase:z.literal(`${prefix}properties`),role:z.enum(properties),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase:z.literal(`${prefix}helper`),role:z.string().regex(/^(?:call|frame)\/[A-Za-z]+$/u),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
 z.strictObject({phase:z.literal(`${prefix}resume`),role:z.enum(resumes),method:z.literal("Debugger.resume"),params:z.strictObject({})}),
 z.strictObject({phase:z.literal(`${prefix}remove`),role:z.enum(["headReady","setterEntry","setterReturned","stringReturned","callerReady"]),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})}),
]);
/* oxlint-enable unicorn/max-nested-calls */
export type CurrentFootprintInverseNativeDeleteSerializationCommand=z.infer<typeof schema>;
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_SERIALIZATION_PROTOCOL");}}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_FLAGS=Object.freeze({silent:true,generatePreview:false,throwOnSideEffect:true,awaitPromise:false,userGesture:false,objectGroup:group} as const);
export function currentFootprintInverseNativeDeleteSerializationExpression(role:typeof frames[number]):string{return role==="begin"?BEGIN.expression:SITES[role].expression;}
export function validateCurrentFootprintInverseNativeDeleteSerializationCommand(input:unknown):CurrentFootprintInverseNativeDeleteSerializationCommand{
 const command=schema.parse(capture(input));
 if(command.phase===`${prefix}call`){need(command.params.functionDeclaration===PROGRAMS[command.role]);argumentsFor[command.role].parse(command.params.arguments);}
 else if(command.method==="Debugger.getPossibleBreakpoints"){need(command.params.start.scriptId===command.params.end.scriptId);}
 else if(command.phase===`${prefix}frame`){need(command.params.expression===currentFootprintInverseNativeDeleteSerializationExpression(command.role));}
 else if(command.phase===`${prefix}arm`){const site=SITES[command.role];need(command.params.location.lineNumber===site.lineNumber&&command.params.location.columnNumber===site.columnNumber);}
 else if(command.phase===`${prefix}helper`){const [kind,role]=command.role.split("/");need(kind==="call"?calls.some(r=>r===role):kind==="frame"&&frames.some(r=>r===role));}
 return freezeDeep(command);
}
export function currentFootprintInverseNativeDeleteSerializationProgram(input:CurrentFootprintInverseNativeDeleteSerializationCommand):string|null{const c=validateCurrentFootprintInverseNativeDeleteSerializationCommand(input);if(c.method==="Runtime.callFunctionOn"){return c.params.functionDeclaration;}return c.method==="Debugger.evaluateOnCallFrame"?c.params.expression:null;}
export function currentFootprintInverseNativeDeleteSerializationKey(input:CurrentFootprintInverseNativeDeleteSerializationCommand):string{const c=validateCurrentFootprintInverseNativeDeleteSerializationCommand(input);return `${c.phase.slice(prefix.length)}/${c.role}`;}
export function currentFootprintInverseNativeDeleteSerializationHelperCommand(input:CurrentFootprintInverseNativeDeleteSerializationCommand,scriptId:string):CurrentFootprintInverseNativeDeleteSerializationCommand{const c=validateCurrentFootprintInverseNativeDeleteSerializationCommand(input);need(currentFootprintInverseNativeDeleteSerializationProgram(c)!==null);return validateCurrentFootprintInverseNativeDeleteSerializationCommand({phase:`${prefix}helper`,role:currentFootprintInverseNativeDeleteSerializationKey(c),method:"Debugger.getScriptSource",params:{scriptId}});}
export function qualifyCurrentFootprintInverseNativeDeleteSerializationHelper(source:unknown,input:CurrentFootprintInverseNativeDeleteSerializationCommand):void{const p=currentFootprintInverseNativeDeleteSerializationProgram(input);need(p!==null&&source===(p.startsWith("[")?p:`(${p})`));}
const normal=[
 "call/environment","properties/environment",...["push","join","stringify","string","promise","then","self"].map(r=>`properties/${r}`),
 "frame/begin","call/begin","properties/begin",...ROLES.map(r=>r==="uploadEntry"?"original-point/before":`arm/${r}`),"resume/begin",
 ...ROLES.flatMap(role=>[
 `frame/${role}`,
 ...(role==="stringReturned"?["call/retainReturn","properties/retained","properties/returned-constructor"]:[]),
 `call/${role}`,`properties/${role}`,
 ...(role==="stringReturned"?["properties/fulfilled-before"]:[]),...(role==="callerReady"?["properties/fulfilled-after"]:[]),
 ...(role==="uploadEntry"?[]:[`resume/${role}`])]),
 ...ROLES.map(r=>r==="uploadEntry"?"original-point/held":`remove/${r}`),
];
need(normal.length===53);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_ORDER=Object.freeze(normal.flatMap(k=>k.startsWith("call/")||k.startsWith("frame/")?[k,`helper/${k}`]:[k]));
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_REQUESTS=Object.freeze({normal:53,helpers:16,cdpRequests:69,resumes:6,events:34,controls:84,uploadResumed:false,publicationComplete:false,saveAuthorized:false} as const);
export function currentFootprintInverseNativeDeleteSerializationWire(input:CurrentFootprintInverseNativeDeleteSerializationCommand,id:number,sessionId:string):CurrentFootprintInverseNativeDeleteSerializationCommand&Readonly<{id:number;sessionId:string;inverseNativeDeleteSerialization:true}>{need(Number.isSafeInteger(id)&&id>0);handle.parse(sessionId);return freezeDeep({...validateCurrentFootprintInverseNativeDeleteSerializationCommand(input),id,sessionId,inverseNativeDeleteSerialization:true});}
type Scalar=string|number;
function scalarFields(c:CurrentFootprintInverseNativeDeleteSerializationCommand):Readonly<Record<string,Scalar>>{
 const f:Record<string,Scalar>={};
 if(c.method==="Runtime.callFunctionOn"){f["objectId"]=c.params.objectId;let index=0;for(const arg of c.params.arguments){const ref=reference.safeParse(arg);if(ref.success){f[`arg${String(index)}`]=ref.data.objectId;index += 1;}else{
 const a=z.strictObject({value:z.unknown()}).parse(arg).value;const e=currentFootprintInverseNativeDeleteSerializationExpectedSchema.safeParse(a);if(e.success){Object.assign(f,e.data);}else{const t=texts.parse(a);Object.assign(f,{head:t[0],deletion:t[1],body:t[2]});}}}}
 else if(c.method==="Runtime.getProperties"){f["objectId"]=c.params.objectId;}else if(c.method==="Debugger.evaluateOnCallFrame"){f["callFrameId"]=c.params.callFrameId;}
 else if(c.method==="Debugger.getPossibleBreakpoints"){f["scriptId"]=c.params.start.scriptId;}else if(c.method==="Debugger.getScriptSource"){f["scriptId"]=c.params.scriptId;}else if(c.method==="Debugger.removeBreakpoint"){f["breakpointId"]=c.params.breakpointId;}else if(c.method==="Debugger.setBreakpoint"){f["scriptId"]=c.params.location.scriptId;}
 return Object.freeze(f);
}
const marker=(n:string):string=>`__inverse_native_delete_serialization_${n}__`;
export function currentFootprintInverseNativeDeleteSerializationTemplate(input:CurrentFootprintInverseNativeDeleteSerializationCommand):Readonly<{key:string;method:string;names:readonly string[];template:string}>{
 const c=validateCurrentFootprintInverseNativeDeleteSerializationCommand(input),f=scalarFields(c),params:Record<string,unknown>={...c.params};
 for(const k of["objectId","callFrameId","scriptId","breakpointId"]){if(Object.hasOwn(params,k)){params[k]=marker(k);}}
 if(c.method==="Debugger.getPossibleBreakpoints"){params["start"]={...c.params.start,scriptId:marker("scriptId")};params["end"]={...c.params.end,scriptId:marker("scriptId")};}
 if(c.method==="Debugger.setBreakpoint"){params["location"]={...c.params.location,scriptId:marker("scriptId")};}
 if(c.method==="Runtime.callFunctionOn"){params["functionDeclaration"]=marker(`program_${c.role}`);let index=0;params["arguments"]=c.params.arguments.map(arg=>{if(reference.safeParse(arg).success){const r={objectId:marker(`arg${String(index)}`)};index += 1;return r;}const a=z.strictObject({value:z.unknown()}).parse(arg).value;
 return currentFootprintInverseNativeDeleteSerializationExpectedSchema.safeParse(a).success?{value:Object.fromEntries(["projectUuid","branchUuid","targetUuid","client","maximumTicket","documentClock"].map(k=>[k,marker(k)]))}:{value:["head","deletion","body"].map(name=>marker(name))};});}
 return Object.freeze({key:currentFootprintInverseNativeDeleteSerializationKey(c).replace("/",":"),method:c.method,names:Object.freeze(Object.keys(f)),template:JSON.stringify({method:c.method,params})});
}
const sample={projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),targetUuid:"c".repeat(16),client:"d".repeat(16),maximumTicket:7,documentClock:9};
function caseReference():Readonly<{objectId:string}>{return {objectId:"original_ref"};}
function exampleArgs(role:typeof calls[number]):unknown[]{
 if(role==="environment"||role==="retainReturn"){return[];}
 if(role==="begin"){return[caseReference(),{value:sample},{value:["head","delete","head|\ndelete"]},caseReference()];}
 if(role==="headReady"||role==="setterEntry"){return[caseReference()];}return role==="callerReady"?[caseReference(),caseReference(),caseReference()]:[caseReference(),caseReference()];
}
export function currentFootprintInverseNativeDeleteSerializationCases():readonly CurrentFootprintInverseNativeDeleteSerializationCommand[]{
 const out:unknown[]=[
 ...calls.map(role=>({phase:`${prefix}call`,role,method:"Runtime.callFunctionOn",params:{...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_FLAGS,objectId:"original_ref",functionDeclaration:PROGRAMS[role],arguments:exampleArgs(role),returnByValue:false}})),
 ...frames.map(role=>({phase:`${prefix}frame`,role,method:"Debugger.evaluateOnCallFrame",params:{callFrameId:"original_ref",expression:currentFootprintInverseNativeDeleteSerializationExpression(role),objectGroup:group,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}})),
 ...ROLES.map(role=>({phase:`${prefix}arm`,role,method:"Debugger.setBreakpoint",params:{location:{scriptId:"original_ref",lineNumber:SITES[role].lineNumber,columnNumber:SITES[role].columnNumber},condition:""}})),
 ...properties.map(role=>({phase:`${prefix}properties`,role,method:"Runtime.getProperties",params:{objectId:"original_ref",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}})),
 ...resumes.map(role=>({phase:`${prefix}resume`,role,method:"Debugger.resume",params:{}})),...ROLES.map(role=>({phase:`${prefix}remove`,role,method:"Debugger.removeBreakpoint",params:{breakpointId:"original_ref"}})),
 ];
 for(const role of["before","held"]){out.push({phase:`${prefix}original-point`,role,method:"Debugger.getPossibleBreakpoints",params:{start:{scriptId:"original_ref",lineNumber:SITES.uploadEntry.lineNumber,columnNumber:SITES.uploadEntry.columnNumber},end:{scriptId:"original_ref",lineNumber:SITES.uploadEntry.lineNumber,columnNumber:SITES.uploadEntry.columnNumber+1},restrictToFunction:true}});}
 const active=out.filter(c=>{const v=z.looseObject({phase:z.string(),role:z.string()}).parse(c);return v.role!=="uploadEntry"||!["inverse-native-delete-serialization-arm","inverse-native-delete-serialization-remove"].includes(v.phase);});
 const checked=active.map(c=>validateCurrentFootprintInverseNativeDeleteSerializationCommand(c));return freezeDeep([...checked,...checked.filter(c=>currentFootprintInverseNativeDeleteSerializationProgram(c)!==null).map(c=>currentFootprintInverseNativeDeleteSerializationHelperCommand(c,"original_ref"))]);
}
export function currentFootprintInverseNativeDeleteSerializationNativeFrame(bytes:Buffer,input:CurrentFootprintInverseNativeDeleteSerializationCommand,sessionId:string):Readonly<Record<string,Scalar>>{
 need(bytes.length<=65_536&&bytes.at(-1)===0);const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes.subarray(0,-1)));const id=z.looseObject({id:z.number().int().positive()}).parse(capture(raw)).id;const command=validateCurrentFootprintInverseNativeDeleteSerializationCommand(input);
 need(bytes.toString("utf8")===`${JSON.stringify(currentFootprintInverseNativeDeleteSerializationWire(command,id,sessionId))}\0`);return Object.freeze({action:"footprint-inverse-native-delete-serialization",requestId:id,phase:command.phase,method:command.method,role:command.role,...scalarFields(command)});
}
