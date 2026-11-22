/* oxlint-disable unicorn/max-nested-calls -- Exact fixed Zod argument tuples belong to the finite private wire grammar. */
import { z } from "zod";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_FLAGS as LOCAL_FLAGS}from "./current-footprint-inverse-native-delete-local-protocol.ts";
import{CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES}from"./current-project-save-producer-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_PROGRAMS as PROGRAMS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_RECEIVERS as RECEIVERS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_RECIPE as RECIPE}from"./current-footprint-inverse-native-delete-upload-programs.ts";
/** Native DEL own finite buffered request grammar. Immutable Via programs are
 * data algorithms only; no Via origin, owner, map or request is adopted. */

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_FLAGS=Object.freeze({...LOCAL_FLAGS,objectGroup:"easyeda-inverse-native-delete-upload-v1"});
const FLAGS=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_FLAGS;

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_ROLES=Object.freeze(["bufferDrain","cloudIngress","historyCloud"]as const);
export type CurrentFootprintInverseNativeDeleteUploadRole=typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_ROLES[number];
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_REQUESTS=Object.freeze({capture:1,properties:1,metadata:2,proofs:2,resumes:3,cursor:9,observer:6,recipeNormal:9,recipeHelpers:3,normal:24,helpers:12,cdpRequests:36,events:18,controls:45});
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false)};
const props=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
const proof=["cloudIngress","historyCloud"].map(role=>{if(role!=="cloudIngress"&&role!=="historyCloud"){throw new Error("VIA_UPLOAD_ROLE");}return z.strictObject({phase:z.literal("inverse-native-delete-upload-proof"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(PROGRAMS[role]),arguments:z.tuple([ref,ref,ref,ref]),returnByValue:z.literal(true)})});});
const observed=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_ROLES.flatMap(role=>[
 z.strictObject({phase:z.literal("inverse-native-delete-upload-frame"),role:z.literal(role),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),callFrameId:handle,expression:z.literal(SITES[role].expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-upload-receiver"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(RECEIVERS[role]),arguments:z.tuple([ref,ref,ref,ref]),returnByValue:z.literal(false)})}),
]);
const helper=z.strictObject({phase:z.literal("inverse-native-delete-upload-helper"),role:z.enum(["frame-bufferDrain","frame-cloudIngress","frame-historyCloud","receiver-bufferDrain","receiver-cloudIngress","receiver-historyCloud","capture","proof-cloudIngress","proof-historyCloud","recipe-set","recipe-capture","recipe-reprove"]),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})});
const recipe=[
 z.strictObject({phase:z.literal("inverse-native-delete-upload-recipe"),role:z.literal("set"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(RECIPE.set),arguments:z.tuple([]),returnByValue:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-upload-recipe"),role:z.literal("capture"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(RECIPE.capture),arguments:z.tuple([ref,ref,ref]),returnByValue:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-upload-recipe"),role:z.literal("reprove"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(RECIPE.reprove),arguments:z.tuple([ref]),returnByValue:z.literal(true)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-upload-recipe-properties"),role:z.enum(["set","recipe","native-toString","native-get","native-has","native-size"]),method:z.literal("Runtime.getProperties"),params:props}),
];
const schema=z.union([...recipe,...observed,helper,z.strictObject({phase:z.literal("inverse-native-delete-upload-capture"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(PROGRAMS.capture),arguments:z.tuple([ref,ref,ref,ref,ref,ref]),returnByValue:z.literal(false)})}),z.strictObject({phase:z.literal("inverse-native-delete-upload-properties"),method:z.literal("Runtime.getProperties"),params:props}),z.strictObject({phase:z.literal("inverse-native-delete-upload-callee"),index:z.enum(["batch","cloud"]),method:z.literal("Runtime.getProperties"),params:props}),...proof,z.strictObject({phase:z.literal("inverse-native-delete-upload-resume"),role:z.enum(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_ROLES),method:z.literal("Debugger.resume"),params:z.strictObject({})})]);
export type CurrentFootprintInverseNativeDeleteUploadCommand=z.infer<typeof schema>;
export function validateCurrentFootprintInverseNativeDeleteUploadCommand(input:unknown):CurrentFootprintInverseNativeDeleteUploadCommand{return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value));}
export function currentFootprintInverseNativeDeleteUploadCases():readonly CurrentFootprintInverseNativeDeleteUploadCommand[]{const p={objectId:"original",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false};const cases:unknown[]=[{phase:"inverse-native-delete-upload-capture",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:"original",functionDeclaration:PROGRAMS.capture,arguments:[{objectId:"original"},{objectId:"scheduled"},{objectId:"body"},{objectId:"cache"},{objectId:"reflection"},{objectId:"recipe"}],returnByValue:false}},{phase:"inverse-native-delete-upload-properties",method:"Runtime.getProperties",params:p}];for(const index of ["batch","cloud"]){cases.push({phase:"inverse-native-delete-upload-callee",index,method:"Runtime.getProperties",params:p});}cases.push({phase:"inverse-native-delete-upload-resume",role:"bufferDrain",method:"Debugger.resume",params:{}});for(const role of ["cloudIngress","historyCloud"] as const){cases.push({phase:"inverse-native-delete-upload-proof",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:"original",functionDeclaration:PROGRAMS[role],arguments:[{objectId:"original"},{objectId:"original_capture"},{objectId:"reflection"},{objectId:"recipe"}],returnByValue:true}},{phase:"inverse-native-delete-upload-resume",role,method:"Debugger.resume",params:{}});}for(const role of CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_ROLES){
 cases.push({phase:"inverse-native-delete-upload-frame",role,method:"Debugger.evaluateOnCallFrame",params:{objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,callFrameId:"original_frame",expression:SITES[role].expression,returnByValue:false,includeCommandLineAPI:false}},{phase:"inverse-native-delete-upload-receiver",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:"original_frame",functionDeclaration:RECEIVERS[role],arguments:[{objectId:"original_project"},{objectId:"original_wrapper"},{objectId:"original_callback"},{objectId:"reflection"}],returnByValue:false}});
}
for(const role of["set","capture","reprove"]as const){let refs:readonly string[]=[];if(role==="capture"){refs=["segments","publication","set"];}else if(role==="reprove"){refs=["recipe"];}cases.push({phase:"inverse-native-delete-upload-recipe",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:"reflection",functionDeclaration:RECIPE[role],arguments:refs.map(objectId=>({objectId})),returnByValue:role==="reprove"}});}
for(const role of["set","recipe","native-toString","native-get","native-has","native-size"]){cases.push({phase:"inverse-native-delete-upload-recipe-properties",role,method:"Runtime.getProperties",params:p});}
const fixed=cases.map(value=>validateCurrentFootprintInverseNativeDeleteUploadCommand(value));
return freezeDeep([...fixed,...fixed.filter(c=>currentFootprintInverseNativeDeleteUploadProgram(c)!==null).map(c=>validateCurrentFootprintInverseNativeDeleteUploadCommand({phase:"inverse-native-delete-upload-helper",role:currentFootprintInverseNativeDeleteUploadKey(c),method:"Debugger.getScriptSource",params:{scriptId:"original_script"}}))]);}

export function currentFootprintInverseNativeDeleteUploadKey(input:CurrentFootprintInverseNativeDeleteUploadCommand):string{
 const c=validateCurrentFootprintInverseNativeDeleteUploadCommand(input);return c.phase.replace("inverse-native-delete-upload-","")+("role"in c?"-"+c.role:"")+("index"in c?"-"+c.index:"");
}
export function currentFootprintInverseNativeDeleteUploadProgram(input:CurrentFootprintInverseNativeDeleteUploadCommand):string|null{
 const c=validateCurrentFootprintInverseNativeDeleteUploadCommand(input);if(c.method==="Debugger.evaluateOnCallFrame"){return c.params.expression;}if(c.method==="Runtime.callFunctionOn"){return `(${c.params.functionDeclaration})`;}return null;
}
export function currentFootprintInverseNativeDeleteUploadTemplate(input:CurrentFootprintInverseNativeDeleteUploadCommand):Readonly<{key:string;method:string;names:readonly string[];template:string;values:Readonly<Record<string,string>>}>{
 const c=validateCurrentFootprintInverseNativeDeleteUploadCommand(input),params:Record<string,unknown>={...c.params},values:Record<string,string>={};
 const field=(name:string,value:string):string=>{values[name]=value;return `__inverse_native_delete_upload_${name}__`;};
 if(c.method==="Runtime.callFunctionOn"){params["objectId"]=field("objectId",c.params.objectId);params["arguments"]=c.params.arguments.map((r,i)=>({objectId:field(`argument${String(i)}`,r.objectId)}));}
 else if(c.method==="Runtime.getProperties"){params["objectId"]=field("objectId",c.params.objectId);}
 else if(c.method==="Debugger.evaluateOnCallFrame"){params["callFrameId"]=field("callFrameId",c.params.callFrameId);}
 else if(c.method==="Debugger.getScriptSource"){params["scriptId"]=field("scriptId",c.params.scriptId);}
 return freezeDeep({key:currentFootprintInverseNativeDeleteUploadKey(c),method:c.method,names:Object.keys(values),template:JSON.stringify({method:c.method,params}),values});
}
export function currentFootprintInverseNativeDeleteUploadWire(input:CurrentFootprintInverseNativeDeleteUploadCommand,id:number,sessionId:string):Readonly<CurrentFootprintInverseNativeDeleteUploadCommand&{id:number;sessionId:string;inverseNativeDeleteUpload:true}>{
 if(!Number.isSafeInteger(id)||id<1||id>2_147_483_647){throw new Error("INVERSE_NATIVE_DELETE_UPLOAD_ID");}handle.parse(sessionId);return freezeDeep({...validateCurrentFootprintInverseNativeDeleteUploadCommand(input),id,sessionId,inverseNativeDeleteUpload:true});
}
export function currentFootprintInverseNativeDeleteUploadNativeFrame(bytes:Buffer,input:CurrentFootprintInverseNativeDeleteUploadCommand,sessionId:string):Readonly<Record<string,string|number>>{
 if(bytes.length>65_536||bytes.at(-1)!==0){throw new Error("INVERSE_NATIVE_DELETE_UPLOAD_FRAME");}const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes.subarray(0,-1)));
 const id=z.looseObject({id:z.number().int().positive().max(2_147_483_647)}).parse(captureCurrentPcbStringClockReply(raw).value).id;const c=validateCurrentFootprintInverseNativeDeleteUploadCommand(input);
 if(bytes.toString("utf8")!==`${JSON.stringify(currentFootprintInverseNativeDeleteUploadWire(c,id,sessionId))}\0`){throw new Error("INVERSE_NATIVE_DELETE_UPLOAD_FRAME");}
 return freezeDeep({action:"footprint-inverse-native-delete-upload",requestId:id,phase:currentFootprintInverseNativeDeleteUploadKey(c),method:c.method,...currentFootprintInverseNativeDeleteUploadTemplate(c).values});
}
