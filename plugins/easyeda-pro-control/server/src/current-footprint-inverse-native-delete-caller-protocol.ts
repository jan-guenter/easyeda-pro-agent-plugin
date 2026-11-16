/* oxlint-disable unicorn/max-nested-calls -- Positional fixed arguments and literal source sites are the private codebook boundary. */
/** Closed caller syntax. Matching JSON supplies no original service, event,
 * Promise, clock frontier, resume, publication or persistence permission. */
import{z}from"zod";
import{freezeDeep}from"./sqlite-inventory-core.ts";
import{captureCurrentFootprintInverseDeleteBindingReply as capture}from"./current-footprint-inverse-delete-binding-capture.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_WORKER_PROGRAMS as WORKER}from"./current-footprint-inverse-native-delete-caller-worker-programs.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_UI_PROGRAMS as UI}from"./current-footprint-inverse-native-delete-caller-ui-programs.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_UI_SITES as U,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_WORKER_SITES as W}from"./current-footprint-inverse-native-delete-caller-source.ts";
import{CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_TOPIC as TOPIC}from"./current-footprint-inverse-delete-rpc-source.ts";

interface Spec{readonly program:string;readonly count:number;readonly result:"reference"|"boolean";readonly trueAt?:number;readonly textAt?:readonly number[]}
const spec=(program:string,count:number,result:"reference"|"boolean"="reference",trueAt?:number):Spec=>Object.freeze({program,count,result,...(trueAt===undefined?{}:{trueAt})});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_CALLS=freezeDeep({
 worker:{promise:spec(WORKER.promise,0),promiseMembers:spec(WORKER.promiseMembers,1),bindNative:spec(WORKER.bindNative,8),prepare:spec(WORKER.prepare,5),returned:spec(WORKER.returned,1),serviceReturn:spec(WORKER.serviceReturn,1),success:spec(WORKER.success,4),successReturn:spec(WORKER.successReturn,2,"boolean"),final:spec(WORKER.final,4,"boolean")},
 ui:{eventConstructors:spec(UI.eventConstructors,1),eventMembers:spec(UI.eventMembers,1),eventOpaque:spec(UI.eventOpaque,1),promise:spec(UI.promise,2,"boolean"),innerEnvelope:{...spec(UI.innerEnvelope,5,"boolean"),textAt:[3,4]},views:spec(UI.views,10),queued:spec(UI.queued,1),roots:spec(UI.roots,9),tasks:spec(UI.tasks,1),callbacks:spec(UI.callbacks,8),innerCallback:spec(UI.innerCallback,3),innerResolvers:spec(UI.innerResolvers,2),innerSubscribe:spec(UI.innerSubscribe,6),innerRpc:spec(UI.innerRpc,5),managerReturned:spec(UI.managerReturned,4,"boolean"),handlerReturned:spec(UI.handlerReturned,3),callback:spec(UI.callback,6),callbackReturned:spec(UI.callbackReturned,2,"boolean"),final:spec(UI.final,3,"boolean"),retain:spec(UI.retain,0),same:spec(UI.same,2,"boolean"),outerResult:spec(UI.outerResult,2,"boolean",1)},
});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_FLAGS=Object.freeze({objectGroup:"easyeda-inverse-native-delete-caller-v1",silent:true,generatePreview:false,throwOnSideEffect:true,awaitPromise:false,userGesture:false}as const);
const F=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_FLAGS;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_ROLES=Object.freeze(["returned","serviceReturn","success","successReturn","failure","outerFailure","innerSubscribe","innerRpc","managerReturned","handlerReturned","outerCallback","outerReturned"]as const);
type Role=typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_ROLES[number];
const workerRoles=["returned","serviceReturn","success","successReturn","failure","outerFailure"]as const;
const callRoles=Object.freeze([...Object.keys(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_CALLS.worker),...Object.keys(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_CALLS.ui)]);
const handleSchema=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const refSchema=z.strictObject({objectId:handleSchema});
const roleSchema=z.enum(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_ROLES);
const realmSchema=z.enum(["worker","ui"]);
const keySchema=z.string().regex(/^[A-Za-z\d_-]{1,96}$/u);
const integerSchema=z.number().int().nonnegative().max(2_147_483_647).refine(v=>!Object.is(v,-0));
const locationSchema=z.strictObject({scriptId:handleSchema,lineNumber:integerSchema,columnNumber:integerSchema});
const textSchema=z.string().min(1).max(2048).refine(v=>v.isWellFormed()&&Buffer.byteLength(v)<=2048);
const argument=z.union([refSchema,z.strictObject({value:z.literal(true)}),z.strictObject({value:textSchema})]);
const flagsSchema={objectGroup:z.literal(F.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const schema=z.union([
 z.strictObject({phase:z.literal("inverse-native-delete-caller-call"),realm:realmSchema,kind:realmSchema,role:keySchema,slot:z.number().int().min(0).max(8),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flagsSchema,awaitPromise:z.literal(false),userGesture:z.literal(false),objectId:handleSchema,functionDeclaration:z.string().min(1).max(32_768),arguments:z.array(argument).max(10),returnByValue:z.boolean()})}),
 z.strictObject({phase:z.literal("inverse-native-delete-caller-properties"),realm:realmSchema,role:z.enum(["tuple","native","scope","promise","result","object"]),slot:z.number().int().min(0).max(63),pass:z.literal(0),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handleSchema,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-caller-frame"),realm:realmSchema,role:z.enum([...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_ROLES,"innerCaller","outerCaller","nativeListener"]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flagsSchema,callFrameId:handleSchema,expression:z.string().min(1).max(128),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-caller-arm"),realm:realmSchema,role:roleSchema,method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location:locationSchema,condition:z.string().max(512)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-caller-function"),realm:z.literal("ui"),role:z.enum(["innerSubscribe","innerRpc","outerCallback"]),method:z.literal("Debugger.setBreakpointOnFunctionCall"),params:z.strictObject({objectId:handleSchema,condition:z.literal("")})}),
 z.strictObject({phase:z.literal("inverse-native-delete-caller-remove"),realm:realmSchema,role:roleSchema,method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handleSchema})}),
 z.strictObject({phase:z.literal("inverse-native-delete-caller-resume"),realm:realmSchema,role:roleSchema,method:z.literal("Debugger.resume"),params:z.strictObject({})}),
 z.strictObject({phase:z.literal("inverse-native-delete-caller-helper"),realm:realmSchema,role:z.string().regex(/^(?:call-(?:worker|ui)-[A-Za-z]+-[0-8]|frame-[A-Za-z]+)$/u),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handleSchema})}),
 z.strictObject({phase:z.literal("inverse-native-delete-caller-condition"),realm:realmSchema,slot:z.number().int().min(0).max(15),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handleSchema})}),
]);
export type CurrentFootprintInverseNativeDeleteCallerCommand=z.infer<typeof schema>;
export type CurrentFootprintInverseNativeDeleteCallerRole=Role;
function need(v:boolean):asserts v{if(!v){throw new Error("INVERSE_NATIVE_DELETE_CALLER_FIXED_COMMAND");}}
function isWorkerRole(role:Role):role is keyof typeof W{return workerRoles.some(workerRole=>workerRole===role);}
export function currentFootprintInverseNativeDeleteCallerRealm(role:Role):"worker"|"ui"{return isWorkerRole(role)?"worker":"ui";}
export function currentFootprintInverseNativeDeleteCallerSite(role:Role):Readonly<{lineNumber:number;columnNumber:number;functionName:string;functionLine:number;functionColumn:number;expression:string}>{return isWorkerRole(role)?W[role]:U[role];}
export function currentFootprintInverseNativeDeleteCallerCondition(role:Role,value?:string):string{
 if(role==="serviceReturn"||role==="outerFailure"){need(value===undefined);return`e===${JSON.stringify(TOPIC)}`;}
 if(["returned","success","successReturn","failure"].includes(role)){need(typeof value==="string"&&/^_MSG_BUS_RPC_-\/mgr\/projectWorker\/footprint\/delete-[a-f\d-]{36}-(?:0|[1-9]\d{0,15})$/u.test(value));return`n===${JSON.stringify(value)}`;}
 if(role==="managerReturned"||role==="handlerReturned"){need(typeof value==="string"&&/^(?:[a-f\d]{16}|[a-f\d]{32})$/u.test(value));return`t===${JSON.stringify(value)}`;}
 need(value===undefined);return"";
}
export function currentFootprintInverseNativeDeleteCallerExpression(role:Role|"innerCaller"|"outerCaller"|"nativeListener"):string{if(role==="nativeListener"){return"[this,s]";}if(role==="innerCaller"){return"[this,e]";}if(role==="outerCaller"){return"[this,t,e,i,o,e9e]";}return currentFootprintInverseNativeDeleteCallerSite(role).expression;}
function selectCallSpec(kind:"worker"|"ui",role:string):Spec{const row:Spec|undefined=(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_CALLS[kind]as Readonly<Record<string,Spec>>)[role];need(row!==undefined);return row;}
function callSlots(kind:"worker"|"ui",name:string):readonly number[]{if(kind==="ui"){if(name==="same"){return[0,1,2];}if(name==="retain"||name==="outerResult"){return[0,1];}}return[0];}
export function validateCurrentFootprintInverseNativeDeleteCallerCommand(input:unknown):CurrentFootprintInverseNativeDeleteCallerCommand{
 const c=schema.parse(capture(input));
 if(c.phase==="inverse-native-delete-caller-call"){
  const row=selectCallSpec(c.kind,c.role);need(callRoles.includes(c.role)&&c.params.functionDeclaration===row.program&&c.params.arguments.length===row.count&&c.params.returnByValue===(row.result==="boolean"));
  need(c.kind===c.realm);for(let j=0;j<row.count;j+=1){const a=c.params.arguments[j];need(a!==undefined);if(row.trueAt===j){need("value"in a&&a.value===true);}else if(row.textAt?.includes(j)===true){need("value"in a&&typeof a.value==="string");}else{need("objectId"in a);}}need(callSlots(c.kind,c.role).includes(c.slot));
 }else if(c.phase==="inverse-native-delete-caller-frame"){need(c.params.expression===currentFootprintInverseNativeDeleteCallerExpression(c.role)&&c.realm===(c.role==="innerCaller"||c.role==="outerCaller"||c.role==="nativeListener"?"ui":currentFootprintInverseNativeDeleteCallerRealm(c.role)));}
 else if(c.phase==="inverse-native-delete-caller-arm"){
  need(c.realm===currentFootprintInverseNativeDeleteCallerRealm(c.role));const site=currentFootprintInverseNativeDeleteCallerSite(c.role);need(c.params.location.lineNumber===site.lineNumber&&c.params.location.columnNumber===site.columnNumber);
  const parsed=/^[nt]===(.*)$/u.exec(c.params.condition);const value=parsed===null?undefined:z.string().parse(JSON.parse(parsed[1]??""));need(c.params.condition===currentFootprintInverseNativeDeleteCallerCondition(c.role,value));need(!["innerSubscribe","innerRpc","outerCallback"].includes(c.role));
 }else if(c.phase==="inverse-native-delete-caller-helper"){const parts=c.role.split("-");need(parts[0]==="frame"?CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_ROLES.some(r=>r===parts[1])||parts[1]==="innerCaller"||parts[1]==="outerCaller"||parts[1]==="nativeListener":parts[0]==="call"&&(parts[1]==="worker"||parts[1]==="ui")&&Object.hasOwn(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_CALLS[parts[1]],parts[2]??""));}
 else if("role"in c&&c.phase!=="inverse-native-delete-caller-properties"){need(c.realm===currentFootprintInverseNativeDeleteCallerRealm(c.role));}
 return freezeDeep(c);
}
export function currentFootprintInverseNativeDeleteCallerProgram(input:CurrentFootprintInverseNativeDeleteCallerCommand):string|null{const c=validateCurrentFootprintInverseNativeDeleteCallerCommand(input);if(c.method==="Runtime.callFunctionOn"){return`(${c.params.functionDeclaration})`;}return c.method==="Debugger.evaluateOnCallFrame"?c.params.expression:null;}
export function currentFootprintInverseNativeDeleteCallerKey(input:CurrentFootprintInverseNativeDeleteCallerCommand):string{const c=validateCurrentFootprintInverseNativeDeleteCallerCommand(input);let result=`${c.realm}-${c.phase.replace("inverse-native-delete-caller-","")}`;if("kind"in c){result+=`-${c.kind}`;}if("role"in c){result+=`-${c.role}`;}if("slot"in c){result+=`-${String(c.slot)}`;}if("pass"in c){result+=`-${String(c.pass)}`;}return result;}
export function currentFootprintInverseNativeDeleteCallerCall(realm:"worker"|"ui",kind:"worker"|"ui",role:string,objectId:string,args:readonly z.infer<typeof argument>[],slot=0):CurrentFootprintInverseNativeDeleteCallerCommand{const row=selectCallSpec(kind,role);return validateCurrentFootprintInverseNativeDeleteCallerCommand({phase:"inverse-native-delete-caller-call",realm,kind,role,slot,method:"Runtime.callFunctionOn",params:{...F,objectId,functionDeclaration:row.program,arguments:[...args],returnByValue:row.result==="boolean"}});}
function sampleArgument(row:Spec,index:number):z.infer<typeof argument>{if(index===row.trueAt){return{value:true};}if(row.textAt?.includes(index)===true){return{value:"original_source_value"};}return{objectId:"original_ref"};}
export function currentFootprintInverseNativeDeleteCallerCases():readonly CurrentFootprintInverseNativeDeleteCallerCommand[]{
 const out:unknown[]=[];for(const kind of["worker","ui"]as const){for(const[name,row]of Object.entries(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_CALLS[kind])){for(const realm of[kind]){
  const slots=callSlots(kind,name);for(const slot of slots){out.push(currentFootprintInverseNativeDeleteCallerCall(realm,kind,name,"original_object",Array.from({length:row.count},(_,j)=>sampleArgument(row,j)),slot));}
 }}}
 for(const realm of["worker","ui"]as const){for(const name of["tuple","native","scope","promise","result","object"]){for(let slot=0;slot<=63;slot+=1){out.push({phase:"inverse-native-delete-caller-properties",realm,role:name,slot,pass:0,method:"Runtime.getProperties",params:{objectId:"original_ref",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}}for(let slot=0;slot<16;slot+=1){out.push({phase:"inverse-native-delete-caller-condition",realm,slot,method:"Debugger.getScriptSource",params:{scriptId:"original_condition"}});}}
 for(const role of CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_ROLES){const realm=currentFootprintInverseNativeDeleteCallerRealm(role),site=currentFootprintInverseNativeDeleteCallerSite(role);let value:string|undefined;if(["returned","success","successReturn","failure"].includes(role)){value="_MSG_BUS_RPC_-/mgr/projectWorker/footprint/delete-11111111-2222-3333-4444-555555555555-7";}else if(role==="managerReturned"||role==="handlerReturned"){value="b".repeat(16);}
  if(role==="innerSubscribe"||role==="innerRpc"||role==="outerCallback"){out.push({phase:"inverse-native-delete-caller-function",realm,role,method:"Debugger.setBreakpointOnFunctionCall",params:{objectId:"original_function",condition:""}});}else{out.push({phase:"inverse-native-delete-caller-arm",realm,role,method:"Debugger.setBreakpoint",params:{location:{scriptId:"original_script",lineNumber:site.lineNumber,columnNumber:site.columnNumber},condition:currentFootprintInverseNativeDeleteCallerCondition(role,value)}});}
  out.push({phase:"inverse-native-delete-caller-frame",realm,role,method:"Debugger.evaluateOnCallFrame",params:{objectGroup:F.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,callFrameId:"original_frame",expression:site.expression,returnByValue:false,includeCommandLineAPI:false}},{phase:"inverse-native-delete-caller-remove",realm,role,method:"Debugger.removeBreakpoint",params:{breakpointId:"original_point"}},{phase:"inverse-native-delete-caller-resume",realm,role,method:"Debugger.resume",params:{}});
 }
 for(const role of["innerCaller","outerCaller","nativeListener"]as const){out.push({phase:"inverse-native-delete-caller-frame",realm:"ui",role,method:"Debugger.evaluateOnCallFrame",params:{objectGroup:F.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,callFrameId:"original_frame",expression:currentFootprintInverseNativeDeleteCallerExpression(role),returnByValue:false,includeCommandLineAPI:false}});}
 const normal=out.map(v=>validateCurrentFootprintInverseNativeDeleteCallerCommand(v));const helpers=normal.filter(c=>currentFootprintInverseNativeDeleteCallerProgram(c)!==null).map(c=>{need("role"in c);return validateCurrentFootprintInverseNativeDeleteCallerCommand({phase:"inverse-native-delete-caller-helper",realm:c.realm,role:c.method==="Runtime.callFunctionOn"&&"kind"in c?`call-${c.kind}-${c.role}-${String(c.slot)}`:`frame-${c.role}`,method:"Debugger.getScriptSource",params:{scriptId:"original_helper"}});});
 return freezeDeep([...normal,...helpers]);
}


/** Templates retain fixed executable bytes and replace original primitive
 * operands only. Conditions carry one literal topic/target value, never code. */
export function currentFootprintInverseNativeDeleteCallerTemplate(input:CurrentFootprintInverseNativeDeleteCallerCommand):Readonly<{key:string;method:string;names:readonly string[];template:string;values:Readonly<Record<string,string>>}>{
 const c=validateCurrentFootprintInverseNativeDeleteCallerCommand(input),params:Record<string,unknown>={...c.params},values:Record<string,string>={};
 const field=(name:string,value:string):string=>{values[name]=value;return`__inverse_native_delete_caller_${name}__`;};
 if(c.method==="Runtime.callFunctionOn"){params["objectId"]=field("objectId",c.params.objectId);params["arguments"]=c.params.arguments.map((a,j)=>{if("objectId"in a){return{objectId:field(`argument${String(j)}`,a.objectId)};}if(typeof a.value==="string"){return{value:field(`valueArgument${String(j)}`,a.value)};}return{value:a.value};});}
 else if(c.method==="Runtime.getProperties"||c.method==="Debugger.setBreakpointOnFunctionCall"){params["objectId"]=field("objectId",c.params.objectId);}
 else if(c.method==="Debugger.evaluateOnCallFrame"){params["callFrameId"]=field("callFrameId",c.params.callFrameId);}
 else if(c.method==="Debugger.getScriptSource"){params["scriptId"]=field("scriptId",c.params.scriptId);}
 else if(c.method==="Debugger.removeBreakpoint"){params["breakpointId"]=field("breakpointId",c.params.breakpointId);}
 else if(c.method==="Debugger.setBreakpoint"){
  params["location"]={...c.params.location,scriptId:field("scriptId",c.params.location.scriptId)};
  const selected=/^([nt])===(.*)$/u.exec(c.params.condition);if(selected!==null){const value=z.string().parse(JSON.parse(selected[2]??""));params["condition"]=field(selected[1]==="n"?"conditionReply":"conditionTarget",value);}
 }
 return freezeDeep({key:currentFootprintInverseNativeDeleteCallerKey(c),method:c.method,names:Object.keys(values),template:JSON.stringify({method:c.method,params}),values});
}
export function currentFootprintInverseNativeDeleteCallerWire(input:CurrentFootprintInverseNativeDeleteCallerCommand,id:number,sessionId:string):Readonly<CurrentFootprintInverseNativeDeleteCallerCommand&{id:number;sessionId:string;inverseNativeDeleteCaller:true}>{
 need(Number.isSafeInteger(id)&&id>0&&id<=2_147_483_647);handleSchema.parse(sessionId);return freezeDeep({...validateCurrentFootprintInverseNativeDeleteCallerCommand(input),id,sessionId,inverseNativeDeleteCaller:true});
}
export function currentFootprintInverseNativeDeleteCallerNativeFrame(bytes:Buffer,input:CurrentFootprintInverseNativeDeleteCallerCommand,sessionId:string):Readonly<Record<string,string|number>>{
 need(bytes.length<=65_536&&bytes.at(-1)===0);const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes.subarray(0,-1)));const id=z.looseObject({id:z.number().int().positive().max(2_147_483_647)}).parse(capture(raw)).id;const c=validateCurrentFootprintInverseNativeDeleteCallerCommand(input);
 need(bytes.toString("utf8")===JSON.stringify(currentFootprintInverseNativeDeleteCallerWire(c,id,sessionId))+String.fromCodePoint(0));return freezeDeep({action:"footprint-inverse-native-delete-caller",requestId:id,phase:currentFootprintInverseNativeDeleteCallerKey(c),method:c.method,...currentFootprintInverseNativeDeleteCallerTemplate(c).values});
}
