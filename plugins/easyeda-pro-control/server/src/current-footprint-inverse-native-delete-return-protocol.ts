/** Distinct fixed original-return vocabulary. There is no program, owner,
 * resume authority or original Promise in a matching JSON packet. */
/* oxlint-disable unicorn/max-nested-calls -- Exact fixed role/argument tuples are the closed wire boundary. */
import{z}from"zod";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{freezeDeep}from"./sqlite-inventory-core.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_RETURN_SOURCE as SOURCE}from"./current-footprint-inverse-native-delete-return-source.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_RETURN_PROGRAMS as PROGRAMS}from"./current-footprint-inverse-native-delete-return-programs.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_RETURN_FLAGS=Object.freeze({objectGroup:"easyeda-footprint-inverse-native-delete-return209-v1",silent:true,generatePreview:false,throwOnSideEffect:true}as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_RETURN_REQUESTS=Object.freeze({normal:9,helpers:4,cleanup:1,total:14,minimum:13,events:7,resumes:1,promisePasses:2,controls:19,originalCloudJoined:false,wholeInverseReserved:false});
const flags={objectGroup:z.literal(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_RETURN_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle}),target=z.strictObject({value:z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u)});
const call={...flags,objectId:handle,awaitPromise:z.literal(false),userGesture:z.literal(false)};
const props=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal("inverse-native-delete-return-arm"),method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location:z.strictObject({scriptId:handle,lineNumber:z.literal(SOURCE.returned.lineNumber),columnNumber:z.literal(SOURCE.returned.columnNumber)}),condition:z.literal("")})}),
 z.strictObject({phase:z.literal("inverse-native-delete-return-frame"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(SOURCE.frame),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-return-proof"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...call,functionDeclaration:z.literal(PROGRAMS.frame),arguments:z.tuple([ref,ref,target]),returnByValue:z.literal(true)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-return-retain"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...call,functionDeclaration:z.literal(PROGRAMS.retain),arguments:z.tuple([]),returnByValue:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-return-properties"),role:z.enum(["promise","result"]),pass:z.number().int().min(1).max(2),method:z.literal("Runtime.getProperties"),params:props}),
 z.strictObject({phase:z.literal("inverse-native-delete-return-result"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...call,functionDeclaration:z.literal(PROGRAMS.result),arguments:z.tuple([ref]),returnByValue:z.literal(true)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-return-remove"),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})}),
 z.strictObject({phase:z.literal("inverse-native-delete-return-resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})}),
 z.strictObject({phase:z.literal("inverse-native-delete-return-helper"),role:z.enum(["frame","proof","retain","result"]),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
]);
export type CurrentFootprintInverseNativeDeleteReturnCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentFootprintInverseNativeDeleteReturnCommand(input:unknown):CurrentFootprintInverseNativeDeleteReturnCommand{
 const c=schema.parse(capture(input).value);if(c.phase==="inverse-native-delete-return-properties"&&c.role==="result"&&c.pass!==1){throw new Error("INVERSE_NATIVE_DELETE_RETURN_PASS");}return freezeDeep(c);
}
export function currentFootprintInverseNativeDeleteReturnProgram(c:CurrentFootprintInverseNativeDeleteReturnCommand):string|null{
 if(c.phase==="inverse-native-delete-return-frame"){return c.params.expression;}if(c.method==="Runtime.callFunctionOn"){return `(${c.params.functionDeclaration})`;}return null;
}
export function currentFootprintInverseNativeDeleteReturnKey(c:CurrentFootprintInverseNativeDeleteReturnCommand):string{return c.phase.replace("inverse-native-delete-return-","")+("role"in c?"-"+c.role:"")+("pass"in c?"-"+String(c.pass):"");}
export function currentFootprintInverseNativeDeleteReturnCases():readonly CurrentFootprintInverseNativeDeleteReturnCommand[]{
 const f=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_RETURN_FLAGS;const common={...f,objectId:"original_ref",awaitPromise:false,userGesture:false};const rows:unknown[]=[
 {phase:"inverse-native-delete-return-arm",method:"Debugger.setBreakpoint",params:{location:{scriptId:"original_script",...SOURCE.returned},condition:""}},
 {phase:"inverse-native-delete-return-frame",method:"Debugger.evaluateOnCallFrame",params:{...f,callFrameId:"original_frame",expression:SOURCE.frame,returnByValue:false,includeCommandLineAPI:false}},
 {phase:"inverse-native-delete-return-proof",method:"Runtime.callFunctionOn",params:{...common,functionDeclaration:PROGRAMS.frame,arguments:[{objectId:"original_frame"},{objectId:"original_bundle"},{value:"b".repeat(16)}],returnByValue:true}},
 {phase:"inverse-native-delete-return-retain",method:"Runtime.callFunctionOn",params:{...common,functionDeclaration:PROGRAMS.retain,arguments:[],returnByValue:false}},
 {phase:"inverse-native-delete-return-result",method:"Runtime.callFunctionOn",params:{...common,functionDeclaration:PROGRAMS.result,arguments:[{objectId:"original_result"}],returnByValue:true}},
 {phase:"inverse-native-delete-return-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:"original_point"}},
 {phase:"inverse-native-delete-return-resume",method:"Debugger.resume",params:{}},
 ];
 for(const role of["frame","proof","retain","result"]){rows.push({phase:"inverse-native-delete-return-helper",role,method:"Debugger.getScriptSource",params:{scriptId:"original_helper"}});}
 for(const[role,passes]of[["promise",2],["result",1]]as const){for(let pass=1;pass<=passes;pass+=1){rows.push({phase:"inverse-native-delete-return-properties",role,pass,method:"Runtime.getProperties",params:{objectId:"original_ref",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}}
 return freezeDeep(rows.map(row=>validateCurrentFootprintInverseNativeDeleteReturnCommand(row)));
}

export function currentFootprintInverseNativeDeleteReturnTemplate(input:CurrentFootprintInverseNativeDeleteReturnCommand):Readonly<{key:string;method:string;names:readonly string[];template:string;values:Readonly<Record<string,string>>}>{
 const c=validateCurrentFootprintInverseNativeDeleteReturnCommand(input);const values:Record<string,string>={};const params:Record<string,unknown>={...c.params};
 const field=(key:string,value:string):string=>{values[key]=value;return `__inverse_native_delete_return_${key}__`;};
 if(c.method==="Runtime.callFunctionOn"){params["objectId"]=field("objectId",c.params.objectId);params["arguments"]=c.params.arguments.map((arg,index)=>"objectId"in arg?{objectId:field(`argument${String(index)}`,arg.objectId)}:{value:field("target",arg.value)});}
 else if(c.method==="Runtime.getProperties"){params["objectId"]=field("objectId",c.params.objectId);}
 else if(c.method==="Debugger.evaluateOnCallFrame"){params["callFrameId"]=field("callFrameId",c.params.callFrameId);}
 else if(c.method==="Debugger.setBreakpoint"){params["location"]={...c.params.location,scriptId:field("scriptId",c.params.location.scriptId)};}
 else if(c.method==="Debugger.removeBreakpoint"){params["breakpointId"]=field("breakpointId",c.params.breakpointId);}
 else if(c.method==="Debugger.getScriptSource"){params["scriptId"]=field("scriptId",c.params.scriptId);}
 return freezeDeep({key:currentFootprintInverseNativeDeleteReturnKey(c),method:c.method,names:Object.keys(values),template:JSON.stringify({method:c.method,params}),values});
}
export function currentFootprintInverseNativeDeleteReturnWire(input:CurrentFootprintInverseNativeDeleteReturnCommand,id:number,sessionId:string):Readonly<CurrentFootprintInverseNativeDeleteReturnCommand&{id:number;sessionId:string;inverseNativeDeleteReturn:true}>{
 if(!Number.isSafeInteger(id)||id<1||id>2_147_483_647){throw new Error("INVERSE_NATIVE_DELETE_RETURN_ID");}handle.parse(sessionId);return freezeDeep({...validateCurrentFootprintInverseNativeDeleteReturnCommand(input),id,sessionId,inverseNativeDeleteReturn:true});
}
export function currentFootprintInverseNativeDeleteReturnNativeFrame(bytes:Buffer,input:CurrentFootprintInverseNativeDeleteReturnCommand,sessionId:string):Readonly<Record<string,string|number>>{
 if(bytes.length>65_536||bytes.at(-1)!==0){throw new Error("INVERSE_NATIVE_DELETE_RETURN_FRAME");}const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes.subarray(0,-1)));const id=z.looseObject({id:z.number().int().positive().max(2_147_483_647)}).parse(capture(raw).value).id;const c=validateCurrentFootprintInverseNativeDeleteReturnCommand(input);
 if(bytes.toString("utf8")!==`${JSON.stringify(currentFootprintInverseNativeDeleteReturnWire(c,id,sessionId))}\0`){throw new Error("INVERSE_NATIVE_DELETE_RETURN_FRAME");}
 return freezeDeep({action:"footprint-inverse-native-delete-return",requestId:id,phase:currentFootprintInverseNativeDeleteReturnTemplate(c).key,method:c.method,...currentFootprintInverseNativeDeleteReturnTemplate(c).values});
}
