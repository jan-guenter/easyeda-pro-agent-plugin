/** Closed negative-task syntax. Static packets grant no original cold birth,
 * UI call, held event, resume, SDK parity or reopened absence authority. */
import {z} from "zod";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_PROGRAMS as TOMBSTONE} from "./current-footprint-inverse-native-delete-cold-get-programs.ts";
import {currentFootprintInverseNativeDeleteColdGetTargetSchema as tombstoneTarget} from "./current-footprint-inverse-native-delete-cold-get-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_PROGRAMS as WORKER,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_CALL_ROLES as WORKER_ROLES,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_CALL_SPECS as WORKER_SPECS,isCurrentFootprintInverseNativeDeleteColdUiWorkerCallRole as isWorker} from "./current-footprint-inverse-native-delete-cold-ui-worker-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER_PROGRAMS as RECEIVER,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER_ROLES as RECEIVER_ROLES,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER_SPECS as RECEIVER_SPECS,isCurrentFootprintInverseNativeDeleteColdUiReceiverRole as isReceiver} from "./current-footprint-inverse-native-delete-cold-ui-receiver-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PRIMITIVE_PROGRAMS as PRIMITIVE,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PRIMITIVE_SPECS as PRIMITIVE_SPECS} from "./current-footprint-inverse-native-delete-cold-ui-primitive-programs.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiPrimitiveRole} from "./current-footprint-inverse-native-delete-cold-ui-primitive-programs.ts";
import {captureCurrentFootprintInversePreferenceReply as capture} from "./current-footprint-inverse-public-preferences-replies.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_FRAMES as FRAMES,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PROGRAMS as P} from "./current-footprint-inverse-native-delete-cold-ui-programs.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_ACTION="footprint-inverse-native-delete-cold-ui";
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_GROUP="easyeda-native-delete-cold-ui-v1";
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_FLAGS=Object.freeze({objectGroup:CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_GROUP,silent:true,generatePreview:false,throwOnSideEffect:true,awaitPromise:false,userGesture:false}as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$(?![\s\S])/u);
const ref=z.strictObject({objectId:handle});
const target=z.strictObject({projectUuid:z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u),branchUuid:z.string().regex(/^[a-f\d]{32}$(?![\s\S])/u),documentUuid:z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$(?![\s\S])/u)});
const flags={objectGroup:z.literal(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_GROUP),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.boolean(),awaitPromise:z.literal(false),userGesture:z.literal(false)};
const primitiveRoles=["ownLiteral","ownIdentities","ownBind","ownReprove","nativeRoots","nativeParents","nativeNextParents","nativePrototypes","nativeMerge","nativeMembers","nativeDefaultInstance","nativeHooks","nativeIterator","nativeIteratorNext","nativeAsyncPrototype","reflect","reflectApply","primitive"]as const satisfies readonly CurrentFootprintInverseNativeDeleteColdUiPrimitiveRole[];
const tombstoneRoles=["tombstoneProject","tombstoneFootprint","tombstoneMethods","tombstoneSnapshot","tombstoneReprove"]as const;
const callRoles=[...tombstoneRoles,...primitiveRoles,...RECEIVER_ROLES,...WORKER_ROLES,"roots","context","bus","methods","queue","task","members","taskMethods","resolverQueue","resolverTask","resolverMembers","prepare","entry","workerEntry","workerHandler","before","invoke","after","retain","same"]as const;
const frameRoles=["workerHandler","workerEntry","uiEntry","uiReturned","uiInnerCaller","uiTimer","innerPush","workerReturned","workerDispatch","managerReturned","fulfilledReply","fulfilledCaller","resolver","resolverTask"]as const;
const locationRoles=["workerReturned","managerReturned","uiReturned","uiTimer"]as const;
const point={scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()};
const phase=z.literal("inverse-native-delete-cold-ui");
/* oxlint-disable unicorn/max-nested-calls -- Only this closed union retains full literal CDP parameter shapes together; no caller expression or flag is accepted. */
const schema=z.discriminatedUnion("method",[
 z.strictObject({phase,role:z.enum(callRoles),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle.optional(),uniqueContextId:handle.optional(),functionDeclaration:z.string().max(16_384),arguments:z.array(z.union([ref,z.strictObject({value:z.number().int().min(0).max(10)}),z.strictObject({value:target}),z.strictObject({value:tombstoneTarget})])).max(11),returnByValue:z.boolean()})}),
 z.strictObject({phase,role:z.enum(frameRoles),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({callFrameId:handle,expression:z.string().max(512),objectGroup:z.literal(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_GROUP),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase,role:z.literal("await"),method:z.literal("Runtime.awaitPromise"),params:z.strictObject({promiseObjectId:handle,objectGroup:z.literal(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_GROUP),returnByValue:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase,role:z.literal("properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase,role:z.enum(["source","managerSource"]),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
 z.strictObject({phase,role:z.enum(["workerHandler","workerEntry","uiEntry","innerPush","fulfilledReply","resolver"]),method:z.literal("Debugger.setBreakpointOnFunctionCall"),params:z.strictObject({objectId:handle,condition:z.literal("")})}),
 z.strictObject({phase,role:z.enum(locationRoles),method:z.literal("Debugger.getPossibleBreakpoints"),params:z.strictObject({start:z.strictObject(point),end:z.strictObject(point),restrictToFunction:z.literal(true)})}),
 z.strictObject({phase,role:z.enum(locationRoles),method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location:z.strictObject(point),condition:z.literal("")})}),
 z.strictObject({phase,role:z.literal("remove"),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})}),
 z.strictObject({phase,role:z.literal("resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})}),
]);
/* oxlint-enable unicorn/max-nested-calls */
export type CurrentFootprintInverseNativeDeleteColdUiCommand=Readonly<z.infer<typeof schema>>;
export type CurrentFootprintInverseNativeDeleteColdUiCallRole=typeof callRoles[number];
export type CurrentFootprintInverseNativeDeleteColdUiFrameRole=typeof frameRoles[number];
const selectRoles:readonly CurrentFootprintInverseNativeDeleteColdUiCallRole[]=["roots","context","bus","methods","queue","task","members","taskMethods","resolverQueue","resolverTask","resolverMembers"];
const selectReferences=[0,1,2,2,1,1,1,1,1,1,2]as const;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_POINTS=freezeDeep({
 workerReturned:{start:{lineNumber:109,columnNumber:34_359},end:{lineNumber:109,columnNumber:34_503},stop:{lineNumber:109,columnNumber:34_502}},
 managerReturned:{start:{lineNumber:104,columnNumber:71_588},end:{lineNumber:104,columnNumber:71_758},stop:{lineNumber:104,columnNumber:71_757}},
 uiTimer:{start:{lineNumber:1033,columnNumber:30_312},end:{lineNumber:1033,columnNumber:30_336},stop:{lineNumber:1033,columnNumber:30_320}},
 uiReturned:{start:{lineNumber:1033,columnNumber:30_111},end:{lineNumber:1033,columnNumber:30_342},stop:{lineNumber:1033,columnNumber:30_341}},
}as const);
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_COMMAND");}}
function isPrimitive(role:CurrentFootprintInverseNativeDeleteColdUiCallRole):role is CurrentFootprintInverseNativeDeleteColdUiPrimitiveRole{return primitiveRoles.some(value=>value===role);}
export function currentFootprintInverseNativeDeleteColdUiCallSpec(role:CurrentFootprintInverseNativeDeleteColdUiCallRole):Readonly<{program:string;references:number;stage:number|null;target:boolean;byValue:boolean;sideEffects:boolean}>{
 if(role==="tombstoneProject"){return Object.freeze({program:TOMBSTONE.project,references:1,stage:null,target:false,byValue:false,sideEffects:false});}
 if(role==="tombstoneFootprint"){return Object.freeze({program:TOMBSTONE.footprint,references:1,stage:null,target:false,byValue:false,sideEffects:false});}
 if(role==="tombstoneMethods"){return Object.freeze({program:TOMBSTONE.methods,references:4,stage:null,target:true,byValue:false,sideEffects:false});}
 if(role==="tombstoneSnapshot"){return Object.freeze({program:TOMBSTONE.snapshot,references:5,stage:null,target:true,byValue:false,sideEffects:false});}
 if(role==="tombstoneReprove"){return Object.freeze({program:TOMBSTONE.reprove,references:1,stage:null,target:false,byValue:true,sideEffects:false});}
 if(isWorker(role)){const spec=WORKER_SPECS[role];return Object.freeze({...spec,program:WORKER[role],stage:null,sideEffects:false});}
 if(isReceiver(role)){const spec=RECEIVER_SPECS[role];return Object.freeze({...spec,program:RECEIVER[role],stage:null,sideEffects:false});}
 if(isPrimitive(role)){const key=role;const spec=PRIMITIVE_SPECS[key];return Object.freeze({program:PRIMITIVE[key],references:spec.references,stage:null,target:false,byValue:spec.byValue,sideEffects:false});}
 const stage=selectRoles.indexOf(role);
 if(stage!==-1){const references=selectReferences[stage];need(references!==undefined);return Object.freeze({program:P.select,references,stage,target:false,byValue:false,sideEffects:false});}
 if(role==="workerHandler"){return Object.freeze({program:P.workerHandler,references:4,stage:null,target:false,byValue:true,sideEffects:false});}
 if(role==="workerEntry"){return Object.freeze({program:P.workerEntry,references:2,stage:null,target:false,byValue:true,sideEffects:false});}
 if(role==="entry"){return Object.freeze({program:P.entry,references:4,stage:null,target:false,byValue:true,sideEffects:false});}
 if(role==="prepare"){return Object.freeze({program:P.prepare,references:10,stage:null,target:true,byValue:false,sideEffects:false});}
 let program:string=P.run;if(role==="retain"){program=P.retain;}else if(role==="same"){program=P.same;}return Object.freeze({program,references:role==="same"?1:0,stage:null,target:false,byValue:role==="before"||role==="after"||role==="same",sideEffects:role==="invoke"});
}
export function validateCurrentFootprintInverseNativeDeleteColdUiCommand(input:unknown):CurrentFootprintInverseNativeDeleteColdUiCommand{
 const command=schema.parse(capture(input));
 if(command.method==="Runtime.callFunctionOn"){
  need(command.role==="ownLiteral"?command.params.uniqueContextId!==undefined&&command.params.objectId===undefined:command.params.objectId!==undefined&&command.params.uniqueContextId===undefined);
  const args=command.params.arguments;const spec=currentFootprintInverseNativeDeleteColdUiCallSpec(command.role);
  need(command.params.functionDeclaration===spec.program&&command.params.returnByValue===spec.byValue&&command.params.throwOnSideEffect===!spec.sideEffects&&args.length===spec.references+Number(spec.stage!==null)+Number(spec.target));
  let offset=0;if(spec.stage!==null){const first=args[0];need(first!==undefined&&"value"in first&&first.value===spec.stage);offset=1;}
  for(let i=offset;i<offset+spec.references;i+=1){const argument=args[i];need(argument!==undefined&&"objectId"in argument);}
  if(spec.target){const last=args.at(-1);need(last!==undefined&&"value"in last&&typeof last.value==="object");if(command.role==="tombstoneMethods"||command.role==="tombstoneSnapshot"){tombstoneTarget.parse(last.value);}else{target.parse(last.value);}}
 }else if(command.method==="Debugger.evaluateOnCallFrame"){need(command.params.expression===FRAMES[command.role]);}
 else if(command.method==="Debugger.getPossibleBreakpoints"||command.method==="Debugger.setBreakpoint"){
  const fixed=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_POINTS[command.role];need(fixed!==null);
  if(command.method==="Debugger.getPossibleBreakpoints"){need(command.params.start.scriptId===command.params.end.scriptId&&command.params.start.lineNumber===fixed.start.lineNumber&&command.params.start.columnNumber===fixed.start.columnNumber&&command.params.end.lineNumber===fixed.end.lineNumber&&command.params.end.columnNumber===fixed.end.columnNumber);}
  else{need(command.params.location.lineNumber===fixed.stop.lineNumber&&command.params.location.columnNumber===fixed.stop.columnNumber);}
 }
 return freezeDeep(command);
}
export function currentFootprintInverseNativeDeleteColdUiProgram(input:CurrentFootprintInverseNativeDeleteColdUiCommand):string|null{
 const command=validateCurrentFootprintInverseNativeDeleteColdUiCommand(input);
 if(command.method==="Runtime.callFunctionOn"){return command.params.functionDeclaration;}if(command.method==="Debugger.evaluateOnCallFrame"){return command.params.expression;}return null;
}
export function qualifyCurrentFootprintInverseNativeDeleteColdUiHelper(input:unknown,command:CurrentFootprintInverseNativeDeleteColdUiCommand):void{
 const program=currentFootprintInverseNativeDeleteColdUiProgram(command);const raw=z.strictObject({scriptSource:z.string().max(16_386)}).parse(capture(input));
 need(program!==null&&raw.scriptSource===(command.method==="Runtime.callFunctionOn"?`(${program})`:program));
}
export function currentFootprintInverseNativeDeleteColdUiCases():readonly CurrentFootprintInverseNativeDeleteColdUiCommand[]{
 const refValue={objectId:"original_ref"};const sample={projectUuid:"1".repeat(64),branchUuid:"3".repeat(32),documentUuid:"2".repeat(16)};
 const cases:unknown[]=callRoles.map(role=>{const args:unknown[]=[];const spec=currentFootprintInverseNativeDeleteColdUiCallSpec(role);if(spec.stage!==null){args.push({value:spec.stage});}for(let i=0;i<spec.references;i+=1){args.push({...refValue});}if(spec.target){args.push({value:role==="tombstoneMethods"||role==="tombstoneSnapshot"?{projectUuid:sample.projectUuid,branchUuid:sample.branchUuid,targetUuid:sample.documentUuid,maximumTicket:79}:sample});}return{phase:"inverse-native-delete-cold-ui",role,method:"Runtime.callFunctionOn",params:{...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_FLAGS,throwOnSideEffect:!spec.sideEffects,...(role==="ownLiteral"?{uniqueContextId:"original_context"}:{objectId:"original_ref"}),functionDeclaration:spec.program,arguments:args,returnByValue:spec.byValue}};});
 for(const role of frameRoles){cases.push({phase:"inverse-native-delete-cold-ui",role,method:"Debugger.evaluateOnCallFrame",params:{callFrameId:"original_frame",expression:FRAMES[role],objectGroup:CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_GROUP,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}});}
 cases.push({phase:"inverse-native-delete-cold-ui",role:"await",method:"Runtime.awaitPromise",params:{promiseObjectId:"original_ref",objectGroup:CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_GROUP,returnByValue:false,generatePreview:false}},{phase:"inverse-native-delete-cold-ui",role:"properties",method:"Runtime.getProperties",params:{objectId:"original_ref",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}},{phase:"inverse-native-delete-cold-ui",role:"source",method:"Debugger.getScriptSource",params:{scriptId:"original_script"}}, {phase:"inverse-native-delete-cold-ui",role:"managerSource",method:"Debugger.getScriptSource",params:{scriptId:"original_script"}});
 for(const role of ["workerHandler","workerEntry","uiEntry","innerPush","fulfilledReply","resolver"]as const){cases.push({phase:"inverse-native-delete-cold-ui",role,method:"Debugger.setBreakpointOnFunctionCall",params:{objectId:"original_ref",condition:""}});}
 for(const role of ["workerReturned","managerReturned","uiReturned","uiTimer"]as const){const fixed=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_POINTS[role];cases.push({phase:"inverse-native-delete-cold-ui",role,method:"Debugger.getPossibleBreakpoints",params:{start:{scriptId:"original_script",...fixed.start},end:{scriptId:"original_script",...fixed.end},restrictToFunction:true}},{phase:"inverse-native-delete-cold-ui",role,method:"Debugger.setBreakpoint",params:{location:{scriptId:"original_script",...fixed.stop},condition:""}});}
 cases.push({phase:"inverse-native-delete-cold-ui",role:"remove",method:"Debugger.removeBreakpoint",params:{breakpointId:"original_point"}},{phase:"inverse-native-delete-cold-ui",role:"resume",method:"Debugger.resume",params:{}});
 return freezeDeep(cases.map(command=>validateCurrentFootprintInverseNativeDeleteColdUiCommand(command)));
}
export function currentFootprintInverseNativeDeleteColdUiTemplate(input:CurrentFootprintInverseNativeDeleteColdUiCommand):Readonly<{key:string;method:string;names:readonly string[];template:string;values:Readonly<Record<string,string>>}>{
 const command=validateCurrentFootprintInverseNativeDeleteColdUiCommand(input);const params:Record<string,unknown>={...command.params};const values:Record<string,string>={};
 const field=(name:string,value:string):string=>{need(!Object.hasOwn(values,name));values[name]=value;return `__cold_ui_${name}__`;};
 if(command.method==="Runtime.callFunctionOn"){
  if(command.role==="ownLiteral"){const id=command.params.uniqueContextId;need(id!==undefined);params["uniqueContextId"]=field("uniqueContextId",id);}else{const id=command.params.objectId;need(id!==undefined);params["objectId"]=field("objectId",id);}params["functionDeclaration"]=`__cold_ui_program_${command.role}__`;
  params["arguments"]=command.params.arguments.map((arg,index)=>{if("objectId"in arg){return{objectId:field(`reference${String(index)}`,arg.objectId)};}if(typeof arg.value==="object"){if("maximumTicket"in arg.value){return{value:{projectUuid:field("projectUuid",arg.value.projectUuid),branchUuid:field("branchUuid",arg.value.branchUuid),targetUuid:field("documentUuid",arg.value.targetUuid),maximumTicket:field("maximumTicket",String(arg.value.maximumTicket))}};}return{value:{projectUuid:field("projectUuid",arg.value.projectUuid),branchUuid:field("branchUuid",arg.value.branchUuid),documentUuid:field("documentUuid",arg.value.documentUuid)}};}return arg;});
 }else if(command.method==="Runtime.awaitPromise"){params["promiseObjectId"]=field("promiseObjectId",command.params.promiseObjectId);}
 else if(command.method==="Runtime.getProperties"||command.method==="Debugger.setBreakpointOnFunctionCall"){params["objectId"]=field("objectId",command.params.objectId);}
 else if(command.method==="Debugger.evaluateOnCallFrame"){params["callFrameId"]=field("callFrameId",command.params.callFrameId);}
 else if(command.method==="Debugger.getScriptSource"){params["scriptId"]=field("scriptId",command.params.scriptId);}
 else if(command.method==="Debugger.removeBreakpoint"){params["breakpointId"]=field("breakpointId",command.params.breakpointId);}
 else if(command.method==="Debugger.setBreakpoint"){params["location"]={...command.params.location,scriptId:field("scriptId",command.params.location.scriptId)};}
 else if(command.method==="Debugger.getPossibleBreakpoints"){const scriptId=field("scriptId",command.params.start.scriptId);params["start"]={...command.params.start,scriptId};params["end"]={...command.params.end,scriptId};}
 return freezeDeep({key:`${command.role}:${command.method}`,method:command.method,names:Object.keys(values),template:JSON.stringify({method:command.method,params}),values});
}

/** Scalar selectors only. The owner must match the exact original pending
 * command at the stdin cutoff; these values carry no birth or call grant. */
export function currentFootprintInverseNativeDeleteColdUiFixedWire(input:unknown,id:number,sessionId:string):Readonly<{command:CurrentFootprintInverseNativeDeleteColdUiCommand;request:Readonly<Record<string,string|number>>;frame:string}>{
 need(Number.isSafeInteger(id)&&id>0&&id<=2_147_483_647);handle.parse(sessionId);
 const command=validateCurrentFootprintInverseNativeDeleteColdUiCommand(input);const row=currentFootprintInverseNativeDeleteColdUiTemplate(command);
 return freezeDeep({command,request:{action:CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_ACTION,requestId:id,phase:command.phase,role:command.role,method:command.method,...row.values},frame:`${JSON.stringify({id,method:command.method,params:command.params,sessionId})}\0`});
}
