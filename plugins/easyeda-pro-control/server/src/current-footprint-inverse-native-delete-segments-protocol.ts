/** Fixed readonly segment programs. Equal JSON never supplies an original
 * startup capture, held DEL frame, invocation or execution authority. */
import {z}from"zod";
import {freezeDeep}from"./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_FRAME as FRAME,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_PROGRAMS as PROGRAMS}from"./current-footprint-inverse-native-delete-segments-programs.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_REQUESTS=Object.freeze({normal:22,helpers:4,cdpRequests:26,events:4,controls:28,resumes:0});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_FLAGS=Object.freeze({objectGroup:"easyeda-footprint-inverse-native-delete-segments209-v1",silent:true,generatePreview:false,throwOnSideEffect:true}as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle}),rows=z.strictObject({value:z.number().int().min(1).max(7)});
const props=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
const flags={objectGroup:z.literal(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const call={...flags,objectId:handle,awaitPromise:z.literal(false),userGesture:z.literal(false)};
/* oxlint-disable unicorn/max-nested-calls -- Closed fixed tuples remain role-checked by the finite order. */
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal("inverse-native-delete-segments-native"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...call,functionDeclaration:z.literal(PROGRAMS.native),arguments:z.tuple([]),returnByValue:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-segments-module"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(FRAME),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-segments-capture"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...call,functionDeclaration:z.literal(PROGRAMS.capture),arguments:z.tuple([ref,ref,ref,ref,rows]),returnByValue:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-segments-reprove"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...call,functionDeclaration:z.literal(PROGRAMS.reprove),arguments:z.tuple([ref,rows]),returnByValue:z.literal(true)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-segments-properties"),role:z.enum(["capture","functions","natives",...Array.from({length:13},(_,i)=>`method-${String(i)}`),"native-Map","native-size"]),method:z.literal("Runtime.getProperties"),params:props}),
 z.strictObject({phase:z.literal("inverse-native-delete-segments-helper"),role:z.enum(["module","native","capture","reprove"]),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
]);
/* oxlint-enable unicorn/max-nested-calls */
export type CurrentFootprintInverseNativeDeleteSegmentsCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentFootprintInverseNativeDeleteSegmentsCommand(input:unknown):CurrentFootprintInverseNativeDeleteSegmentsCommand{return freezeDeep(schema.parse(capture(input).value));}
export function currentFootprintInverseNativeDeleteSegmentsProgram(input:CurrentFootprintInverseNativeDeleteSegmentsCommand):string|null{
 const c=validateCurrentFootprintInverseNativeDeleteSegmentsCommand(input);if(c.phase==="inverse-native-delete-segments-module"){return c.params.expression;}if(c.method==="Runtime.callFunctionOn"){return `(${c.params.functionDeclaration})`;}return null;
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_ORDER=Object.freeze([
 "module","helper-module","native","helper-native","properties-native-Map","capture","helper-capture","properties-capture","properties-functions",
 ...Array.from({length:13},(_,i)=>`properties-method-${String(i)}`),
 "properties-natives","properties-native-size","reprove","helper-reprove",
]);
export function currentFootprintInverseNativeDeleteSegmentsKey(c:CurrentFootprintInverseNativeDeleteSegmentsCommand):string{return c.phase.replace("inverse-native-delete-segments-","")+("role"in c?"-"+c.role:"");}
export function currentFootprintInverseNativeDeleteSegmentsCases():readonly CurrentFootprintInverseNativeDeleteSegmentsCommand[]{
 const f=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_FLAGS;const commands:unknown[]=[
 {phase:"inverse-native-delete-segments-native",method:"Runtime.callFunctionOn",params:{...f,awaitPromise:false,userGesture:false,objectId:"intrinsics7",functionDeclaration:PROGRAMS.native,arguments:[],returnByValue:false}},
 {phase:"inverse-native-delete-segments-module",method:"Debugger.evaluateOnCallFrame",params:{...f,callFrameId:"frame7",expression:FRAME,returnByValue:false,includeCommandLineAPI:false}},
 {phase:"inverse-native-delete-segments-capture",method:"Runtime.callFunctionOn",params:{...f,awaitPromise:false,userGesture:false,objectId:"intrinsics7",functionDeclaration:PROGRAMS.capture,arguments:[{objectId:"initial7"},{objectId:"module7"},{objectId:"publication7"},{objectId:"native7"},{value:2}],returnByValue:false}},
 {phase:"inverse-native-delete-segments-reprove",method:"Runtime.callFunctionOn",params:{...f,awaitPromise:false,userGesture:false,objectId:"intrinsics7",functionDeclaration:PROGRAMS.reprove,arguments:[{objectId:"capture7"},{value:2}],returnByValue:true}},
 ];
 for(const role of["capture","functions","natives",...Array.from({length:13},(_,i)=>`method-${String(i)}`),"native-Map","native-size"]){commands.push({phase:"inverse-native-delete-segments-properties",role,method:"Runtime.getProperties",params:{objectId:"object7",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
 for(const role of["module","native","capture","reprove"]){commands.push({phase:"inverse-native-delete-segments-helper",role,method:"Debugger.getScriptSource",params:{scriptId:"script7"}});}
 return freezeDeep(commands.map(c=>validateCurrentFootprintInverseNativeDeleteSegmentsCommand(c)));
}
export function currentFootprintInverseNativeDeleteSegmentsTemplate(input:CurrentFootprintInverseNativeDeleteSegmentsCommand):Readonly<{key:string;method:string;names:readonly string[];template:string;values:Readonly<Record<string,string|number>>}>{
 const c=validateCurrentFootprintInverseNativeDeleteSegmentsCommand(input);const params:Record<string,unknown>={...c.params},values:Record<string,string|number>={};
 const field=(name:string,value:string|number):string=>{values[name]=value;return `__inverse_native_delete_segments_${name}__`;};
 if(c.method==="Runtime.callFunctionOn"){params["objectId"]=field("objectId",c.params.objectId);params["arguments"]=c.params.arguments.map((r,i)=>"objectId"in r?{objectId:field(`argument${String(i)}`,r.objectId)}:{value:field("rows",r.value)});}
 else if(c.method==="Runtime.getProperties"){params["objectId"]=field("objectId",c.params.objectId);}
 else if(c.method==="Debugger.evaluateOnCallFrame"){params["callFrameId"]=field("callFrameId",c.params.callFrameId);}else{params["scriptId"]=field("scriptId",c.params.scriptId);}
 return freezeDeep({key:currentFootprintInverseNativeDeleteSegmentsKey(c),method:c.method,names:Object.keys(values),template:JSON.stringify({method:c.method,params}),values});
}
export function currentFootprintInverseNativeDeleteSegmentsWire(input:CurrentFootprintInverseNativeDeleteSegmentsCommand,id:number,sessionId:string):Readonly<CurrentFootprintInverseNativeDeleteSegmentsCommand&{id:number;sessionId:string;inverseNativeDeleteSegments:true}>{
 if(!Number.isSafeInteger(id)||id<1||id>2_147_483_647){throw new Error("INVERSE_NATIVE_DELETE_SEGMENTS_ID");}handle.parse(sessionId);return freezeDeep({...validateCurrentFootprintInverseNativeDeleteSegmentsCommand(input),id,sessionId,inverseNativeDeleteSegments:true});
}
export function currentFootprintInverseNativeDeleteSegmentsNativeFrame(bytes:Buffer,input:CurrentFootprintInverseNativeDeleteSegmentsCommand,sessionId:string):Readonly<Record<string,string|number>>{
 if(bytes.length>65_536||bytes.at(-1)!==0){throw new Error("INVERSE_NATIVE_DELETE_SEGMENTS_FRAME");}const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes.subarray(0,-1)));const id=z.looseObject({id:z.number().int().positive().max(2_147_483_647)}).parse(capture(raw).value).id;const c=validateCurrentFootprintInverseNativeDeleteSegmentsCommand(input);
 if(bytes.toString("utf8")!==`${JSON.stringify(currentFootprintInverseNativeDeleteSegmentsWire(c,id,sessionId))}\0`){throw new Error("INVERSE_NATIVE_DELETE_SEGMENTS_FRAME");}
 return freezeDeep({action:"footprint-inverse-native-delete-segments",requestId:id,phase:c.phase,method:c.method,...("role"in c?{role:c.role}:{}),...currentFootprintInverseNativeDeleteSegmentsTemplate(c).values});
}
