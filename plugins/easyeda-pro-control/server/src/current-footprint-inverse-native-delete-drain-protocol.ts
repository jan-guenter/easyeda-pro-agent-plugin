/* oxlint-disable unicorn/max-nested-calls,import/max-dependencies -- Exact private argument tuples, pinned producer/caller sites and distinct fixed helper families form the finite transport grammar. */
/** Finite native drain syntax. A validated command supplies no original event,
 * prepared recipe, source token, write grant or lifecycle completion. */
import{z}from"zod";
import{freezeDeep}from"./sqlite-inventory-core.ts";
import{captureCurrentFootprintInverseDeleteBindingReply as capture}from"./current-footprint-inverse-delete-binding-capture.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_PROGRAMS as DRAIN,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_RECIPE as RECIPE}from"./current-footprint-inverse-native-delete-drain-programs.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_CACHE_PROGRAMS as CACHE}from"./current-footprint-inverse-native-delete-drain-cache-programs.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_SYNC_PROGRAMS as SYNC}from"./current-footprint-inverse-native-delete-drain-sync-programs.ts";
import{CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES}from"./current-project-save-producer-source.ts";
import{CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE as RETAIN}from"./current-project-save-producer-cache-replies.ts";
import{CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLER as SYNC_CALLER,CURRENT_PCB_VIA_POST_HISTORY_SYNC_MODULE as SYNC_MODULE}from"./current-pcb-via-post-history-sync-source.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_RECEIVERS as RECEIVERS}from"./current-footprint-inverse-native-delete-drain-source-programs.ts";
import{CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS as CACHE_CALLERS}from"./current-project-save-producer-cache-source.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_DELETE_PROGRAMS as DELETE}from"./current-footprint-inverse-native-delete-drain-delete-programs.ts";
import{CURRENT_PCB_VIA_SAVE_TAIL_DELETE_CALLER as DELETE_CALLER,CURRENT_PCB_VIA_SAVE_TAIL_DELETE_SITES as DELETE_SITES}from"./current-pcb-via-save-tail-observation-source.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_FLAGS=Object.freeze({objectGroup:"easyeda-inverse-native-delete-drain-v1",silent:true,generatePreview:false,throwOnSideEffect:true,awaitPromise:false,userGesture:false}as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_SOURCE_ROLES=Object.freeze(["historyReply","detachedEntry","syncEntry","syncDeferred","historyQueued","historyFinally","cloudReturned","cloudFinally","batchReturned","bufferDone","detachedReturned"]as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_SYNC_ROLES=Object.freeze(["syncEntry","syncFull","syncLast","syncHistory","syncMerged","syncFinalizing","syncReturned"]as const);
const sourceRoles=[...CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_SOURCE_ROLES,"syncFull","syncLast","syncHistory","syncMerged","syncFinalizing","syncReturned","headEntry","headPromise","headSuccess"]as const;
export type CurrentFootprintInverseNativeDeleteDrainSourceRole=typeof sourceRoles[number];
const kinds=["recipe","drain","cache","sync","retain","receiver","delete"]as const;
export type CurrentFootprintInverseNativeDeleteDrainKind=typeof kinds[number];
interface Spec{readonly program:string;readonly count:number;readonly values:readonly number[];readonly zero?:number;readonly referenceResult?:true}
const spec=(program:string,count:number,values:readonly number[]=[],referenceResult?:true):Spec=>Object.freeze({program,count,values,...(referenceResult===undefined?{}:{referenceResult})});
const specs:Readonly<Record<CurrentFootprintInverseNativeDeleteDrainKind,Readonly<Record<string,Spec>>>>=freezeDeep({
 recipe:{natives:spec(RECIPE.natives,2,[],true),iterator:spec(RECIPE.iterator,7,[],true),finish:spec(RECIPE.finish,4,[],true)},
 drain:{capture:spec(DRAIN.capture,9,[5],true),detachedEntry:spec(DRAIN.detachedEntry,5),syncEntry:spec(DRAIN.syncEntry,5),syncDeferred:spec(DRAIN.syncDeferred,6),historyQueued:spec(DRAIN.historyQueued,5),historyFinally:spec(DRAIN.historyFinally,6),cloudReturned:spec(DRAIN.cloudReturned,6),cloudFinally:spec(DRAIN.cloudFinally,6),batchReturned:spec(DRAIN.batchReturned,5),bufferDone:spec(DRAIN.bufferDone,5),detachedReturned:spec(DRAIN.detachedReturned,6),cloudResult:spec(DRAIN.cloudResult,6),final:spec(DRAIN.final,5)},
 cache:{localSave:spec(CACHE.localSave,7,[2,3]),flow:{...spec(CACHE.flow,10,[2,3,4,5,6]),zero:6},head:spec(CACHE.head,7,[2,3]),headPromise:spec(CACHE.headPromise,6),headSuccess:spec(CACHE.headSuccess,7),captureLocalSave:spec(CACHE.captureLocalSave,7,[],true),captureFlow:spec(CACHE.captureFlow,7,[],true),captureHead:spec(CACHE.captureHead,7,[],true)},
 sync:{capture:spec(SYNC.capture,10,[5],true),full:spec(SYNC.full,5),branch:spec(SYNC.branch,7,[3]),history:spec(SYNC.history,7,[3]),merged:spec(SYNC.merged,7),finalizing:spec(SYNC.finalizing,7,[3],true),returned:spec(SYNC.returned,7)},
 retain:{promise:spec(RETAIN,0,[],true)},
 receiver:Object.fromEntries(Object.entries(RECEIVERS).map(([name,program])=>[name,spec(program,5,[],true)])),
 delete:{call:spec(DELETE.call,7,[],true),returned:spec(DELETE.returned,7,[],true)},
});
const FLAGS=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_FLAGS;
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle}),role=z.string().regex(/^[A-Za-z\d_-]{1,96}$/u);
const text=z.string().min(1).max(16_384).refine(value=>value.isWellFormed()&&Buffer.byteLength(value)<=16_384);
const argument=z.union([ref,z.strictObject({value:text}),z.strictObject({value:z.literal(0)})]);
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false)};
const props=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
const propertyRoles=["natives","json","prepared","native-add","native-values","native-parse","native-stringify","native-next","callee-syncCloud","replyFrame","capture","queued","cloudFrame","full","settled","frame","cache","cachePromise","delete-call","delete-returned"]as const;
const schema=z.union([
 z.strictObject({phase:z.literal("inverse-native-delete-drain-condition"),role:z.literal("sync"),slot:z.number().int().min(0).max(1),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
 z.strictObject({phase:z.literal("inverse-native-delete-drain-call"),kind:z.enum(kinds),role,slot:z.number().int().min(0).max(9),pass:z.number().int().min(0).max(2),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.string().min(1).max(32_768),arguments:z.array(argument).max(10),returnByValue:z.boolean()})}),
 z.strictObject({phase:z.literal("inverse-native-delete-drain-properties"),role:z.enum(propertyRoles),slot:z.number().int().min(0).max(10),pass:z.number().int().min(0).max(2),method:z.literal("Runtime.getProperties"),params:props}),
 z.strictObject({phase:z.literal("inverse-native-delete-drain-frame"),role:z.enum(sourceRoles),slot:z.number().int().min(0).max(2),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),callFrameId:handle,expression:z.string().min(1).max(1024),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-drain-sync-frame"),role:z.enum(["module","caller"]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),callFrameId:handle,expression:z.enum([SYNC_MODULE,SYNC_CALLER.expression]),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-drain-cache-caller"),role:z.enum(["localSave","flow","syncHead"]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),callFrameId:handle,expression:z.string().min(1).max(1024),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-drain-delete-arm"),role:z.enum(["cacheDeleteCall","cacheDeleteReturned","cacheDeleteFailed"]),method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location:z.strictObject({scriptId:handle,lineNumber:z.literal(106),columnNumber:z.number().int()}),condition:z.literal("")})}),
 z.strictObject({phase:z.literal("inverse-native-delete-drain-delete-frame"),role:z.enum(["cacheDeleteCall","cacheDeleteReturned"]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),callFrameId:handle,expression:z.literal("[this,t,s,r]"),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-drain-delete-caller"),role:z.literal("detached"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),callFrameId:handle,expression:z.literal(DELETE_CALLER.expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("inverse-native-delete-drain-delete-resume"),role:z.enum(["cacheDeleteCall","cacheDeleteReturned"]),method:z.literal("Debugger.resume"),params:z.strictObject({})}),
 z.strictObject({phase:z.literal("inverse-native-delete-drain-resume"),role:z.enum(sourceRoles),slot:z.number().int().min(0).max(2),method:z.literal("Debugger.resume"),params:z.strictObject({})}),
 z.strictObject({phase:z.literal("inverse-native-delete-drain-helper"),role:z.string().regex(/^(?:call-(?:recipe|drain|cache|sync|retain|receiver|delete)-[A-Za-z\d_-]+-[0-9]-[0-2]|frame-[A-Za-z\d_-]+-[0-2]|sync-frame-(?:module|caller)|cache-caller-(?:localSave|flow|syncHead)|delete-frame-(?:cacheDeleteCall|cacheDeleteReturned)|delete-caller-detached)$/u).max(160),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
]);
export type CurrentFootprintInverseNativeDeleteDrainCommand=z.infer<typeof schema>;
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_NATIVE_DELETE_DRAIN_FIXED_COMMAND");}}
export function validateCurrentFootprintInverseNativeDeleteDrainCommand(input:unknown):CurrentFootprintInverseNativeDeleteDrainCommand{
 const c=schema.parse(capture(input));
 if(c.phase==="inverse-native-delete-drain-call"){
  const selected=specs[c.kind][c.role];need(selected!==undefined&&c.params.functionDeclaration===selected.program&&c.params.arguments.length===selected.count&&c.params.returnByValue===(selected.referenceResult!==true));
  for(let i=0;i<c.params.arguments.length;i+=1){const a=c.params.arguments[i];need(a!==undefined&&("value"in a)===selected.values.includes(i));if("value"in a){need(i===selected.zero?a.value===0:typeof a.value==="string");}}
  need(c.pass===0||c.kind==="drain"&&(c.role==="cloudResult"||c.role==="final"));
  need(callSlots(c.kind,c.role).includes(c.slot));
 }else if(c.phase==="inverse-native-delete-drain-properties"){need(c.role==="settled"?c.pass>=1:c.slot===0&&c.pass===0);}
 else if(c.phase==="inverse-native-delete-drain-frame"){need(c.params.expression===SITES[c.role].expression&&(["headEntry","headPromise","headSuccess"].includes(c.role)||c.slot===0));}
 else if(c.phase==="inverse-native-delete-drain-sync-frame"){need(c.params.expression===(c.role==="module"?SYNC_MODULE:SYNC_CALLER.expression));}
 else if(c.phase==="inverse-native-delete-drain-cache-caller"){need(c.params.expression===CACHE_CALLERS[c.role].expression);}
 else if(c.phase==="inverse-native-delete-drain-delete-arm"){need(c.params.location.columnNumber===DELETE_SITES[c.role].columnNumber);}
 else if(c.phase==="inverse-native-delete-drain-delete-frame"||c.phase==="inverse-native-delete-drain-delete-caller"||c.phase==="inverse-native-delete-drain-delete-resume"){
  // Every field is literal in the corresponding fixed arm/capture/resume.
 }
 else if(c.phase==="inverse-native-delete-drain-resume"){need(["headEntry","headPromise","headSuccess"].includes(c.role)||c.slot===0);}
 else if(c.phase!=="inverse-native-delete-drain-condition"){need(fixedHelperKeys().has(c.role));}
 return freezeDeep(c);
}
function callSlots(kind:CurrentFootprintInverseNativeDeleteDrainKind,name:string):readonly number[]{if(kind==="cache"){if(name==="headPromise"||name==="headSuccess"){return[0,1,2];}if(name==="flow"){return[1];}if(name==="head"){return[2];}}if(kind==="retain"){return[0,4,5,8,9];}if(kind==="drain"&&name==="cloudResult"){return[0,1];}return[0];}
function fixedHelperKeys():ReadonlySet<string>{const keys=new Set<string>(["sync-frame-module","sync-frame-caller","cache-caller-localSave","cache-caller-flow","cache-caller-syncHead","delete-frame-cacheDeleteCall","delete-frame-cacheDeleteReturned","delete-caller-detached"]);for(const kind of kinds){for(const name of Object.keys(specs[kind])){for(const slot of callSlots(kind,name)){const passes=kind==="drain"&&(name==="cloudResult"||name==="final")?[0,1,2]:[0];for(const pass of passes){keys.add(`call-${kind}-${name}-${String(slot)}-${String(pass)}`);}}}}for(const name of sourceRoles){const slots=["headEntry","headPromise","headSuccess"].includes(name)?[0,1,2]:[0];for(const slot of slots){keys.add(`frame-${name}-${String(slot)}`);}}return keys;}
export function currentFootprintInverseNativeDeleteDrainKey(input:CurrentFootprintInverseNativeDeleteDrainCommand):string{const c=validateCurrentFootprintInverseNativeDeleteDrainCommand(input);return `${c.phase.replace("inverse-native-delete-drain-","")+("kind"in c?`-${c.kind}`:"")}-${c.role}${"slot"in c?`-${String(c.slot)}`:""}${"pass"in c?`-${String(c.pass)}`:""}`;}
export function currentFootprintInverseNativeDeleteDrainProgram(input:CurrentFootprintInverseNativeDeleteDrainCommand):string|null{const c=validateCurrentFootprintInverseNativeDeleteDrainCommand(input);if(c.method==="Runtime.callFunctionOn"){return`(${c.params.functionDeclaration})`;}if(c.method==="Debugger.evaluateOnCallFrame"){return c.params.expression;}return null;}
export function currentFootprintInverseNativeDeleteDrainCall(kind:CurrentFootprintInverseNativeDeleteDrainKind,name:string,objectId:string,args:readonly z.infer<typeof argument>[],slot=0,pass=0):CurrentFootprintInverseNativeDeleteDrainCommand{const selected=specs[kind][name];need(selected!==undefined);return validateCurrentFootprintInverseNativeDeleteDrainCommand({phase:"inverse-native-delete-drain-call",kind,role:name,slot,pass,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId,functionDeclaration:selected.program,arguments:[...args],returnByValue:selected.referenceResult!==true}});}
export function currentFootprintInverseNativeDeleteDrainCallCases():readonly CurrentFootprintInverseNativeDeleteDrainCommand[]{
 const out:CurrentFootprintInverseNativeDeleteDrainCommand[]=[];for(const kind of kinds){for(const[name,s]of Object.entries(specs[kind])){
  const args=Array.from({length:s.count},(_,index):z.infer<typeof argument>=>{if(s.values.includes(index)){return{value:index===s.zero?0:"original_private_value"};}return{objectId:"original_reference"};});
  const passes=kind==="drain"&&(name==="cloudResult"||name==="final")?[0,1,2]:[0];for(const slot of callSlots(kind,name)){for(const pass of passes){out.push(currentFootprintInverseNativeDeleteDrainCall(kind,name,"original_object",args,slot,pass));}}
 }}return freezeDeep(out);
}
export function currentFootprintInverseNativeDeleteDrainCases():readonly CurrentFootprintInverseNativeDeleteDrainCommand[]{
 const out:unknown[]=[...currentFootprintInverseNativeDeleteDrainCallCases()];const properties={objectId:"original_object",ownProperties:true,accessorPropertiesOnly:false,generatePreview:false};
 for(const slot of[0,1]){out.push({phase:"inverse-native-delete-drain-condition",role:"sync",slot,method:"Debugger.getScriptSource",params:{scriptId:"original_condition"}});}
 for(const name of propertyRoles){if(name==="settled"){for(let slot=0;slot<=10;slot+=1){for(const pass of[1,2]){out.push({phase:"inverse-native-delete-drain-properties",role:name,slot,pass,method:"Runtime.getProperties",params:properties});}}}else{out.push({phase:"inverse-native-delete-drain-properties",role:name,slot:0,pass:0,method:"Runtime.getProperties",params:properties});}}
 const frameFlags={objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,callFrameId:"original_frame",returnByValue:false,includeCommandLineAPI:false};
 for(const name of sourceRoles){const slots=["headEntry","headPromise","headSuccess"].includes(name)?[0,1,2]:[0];for(const slot of slots){out.push({phase:"inverse-native-delete-drain-frame",role:name,slot,method:"Debugger.evaluateOnCallFrame",params:{...frameFlags,expression:SITES[name].expression}},{phase:"inverse-native-delete-drain-resume",role:name,slot,method:"Debugger.resume",params:{}});}}
 for(const name of["module","caller"]){out.push({phase:"inverse-native-delete-drain-sync-frame",role:name,method:"Debugger.evaluateOnCallFrame",params:{...frameFlags,expression:name==="module"?SYNC_MODULE:SYNC_CALLER.expression}});}
 for(const name of["localSave","flow","syncHead"]as const){out.push({phase:"inverse-native-delete-drain-cache-caller",role:name,method:"Debugger.evaluateOnCallFrame",params:{...frameFlags,expression:CACHE_CALLERS[name].expression}});}
 for(const name of["cacheDeleteCall","cacheDeleteReturned","cacheDeleteFailed"]as const){const site=DELETE_SITES[name];out.push({phase:"inverse-native-delete-drain-delete-arm",role:name,method:"Debugger.setBreakpoint",params:{location:{scriptId:"original_script",lineNumber:site.lineNumber,columnNumber:site.columnNumber},condition:""}});if(name!=="cacheDeleteFailed"){out.push({phase:"inverse-native-delete-drain-delete-frame",role:name,method:"Debugger.evaluateOnCallFrame",params:{...frameFlags,expression:site.expression}},{phase:"inverse-native-delete-drain-delete-resume",role:name,method:"Debugger.resume",params:{}});}}
 out.push({phase:"inverse-native-delete-drain-delete-caller",role:"detached",method:"Debugger.evaluateOnCallFrame",params:{...frameFlags,expression:DELETE_CALLER.expression}});
 const ordinary=out.map(value=>validateCurrentFootprintInverseNativeDeleteDrainCommand(value));const helpers=ordinary.filter(c=>currentFootprintInverseNativeDeleteDrainProgram(c)!==null).map(c=>validateCurrentFootprintInverseNativeDeleteDrainCommand({phase:"inverse-native-delete-drain-helper",role:currentFootprintInverseNativeDeleteDrainKey(c),method:"Debugger.getScriptSource",params:{scriptId:"original_helper"}}));
 return freezeDeep([...ordinary,...helpers]);
}
export function currentFootprintInverseNativeDeleteDrainTemplate(input:CurrentFootprintInverseNativeDeleteDrainCommand):Readonly<{key:string;method:string;names:readonly string[];template:string;values:Readonly<Record<string,string>>}>{
 const c=validateCurrentFootprintInverseNativeDeleteDrainCommand(input),params:Record<string,unknown>={...c.params},values:Record<string,string>={};
 const field=(name:string,value:string):string=>{values[name]=value;return`__inverse_native_delete_drain_${name}__`;};
 if(c.method==="Runtime.callFunctionOn"){params["objectId"]=field("objectId",c.params.objectId);params["arguments"]=c.params.arguments.map((arg,index)=>{if("objectId"in arg){return{objectId:field(`argument${String(index)}`,arg.objectId)};}if(typeof arg.value==="string"){return{value:field(`valueArgument${String(index)}`,arg.value)};}return{value:arg.value};});}
 else if(c.method==="Runtime.getProperties"){params["objectId"]=field("objectId",c.params.objectId);}
 else if(c.method==="Debugger.evaluateOnCallFrame"){params["callFrameId"]=field("callFrameId",c.params.callFrameId);}
 else if(c.method==="Debugger.getScriptSource"){params["scriptId"]=field("scriptId",c.params.scriptId);}
 else if(c.method==="Debugger.setBreakpoint"){params["location"]={...c.params.location,scriptId:field("scriptId",c.params.location.scriptId)};}
 return freezeDeep({key:currentFootprintInverseNativeDeleteDrainKey(c),method:c.method,names:Object.keys(values),template:JSON.stringify({method:c.method,params}),values});
}
export function currentFootprintInverseNativeDeleteDrainWire(input:CurrentFootprintInverseNativeDeleteDrainCommand,id:number,sessionId:string):Readonly<CurrentFootprintInverseNativeDeleteDrainCommand&{id:number;sessionId:string;inverseNativeDeleteDrain:true}>{
 if(!Number.isSafeInteger(id)||id<1||id>2_147_483_647){throw new Error("INVERSE_NATIVE_DELETE_DRAIN_ID");}handle.parse(sessionId);return freezeDeep({...validateCurrentFootprintInverseNativeDeleteDrainCommand(input),id,sessionId,inverseNativeDeleteDrain:true});
}
export function currentFootprintInverseNativeDeleteDrainNativeFrame(bytes:Buffer,input:CurrentFootprintInverseNativeDeleteDrainCommand,sessionId:string):Readonly<Record<string,string|number>>{
 if(bytes.length>65_536||bytes.at(-1)!==0){throw new Error("INVERSE_NATIVE_DELETE_DRAIN_FRAME");}const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes.subarray(0,-1)));const id=z.looseObject({id:z.number().int().positive().max(2_147_483_647)}).parse(raw).id;
 const c=validateCurrentFootprintInverseNativeDeleteDrainCommand(input);if(bytes.toString("utf8")!==`${JSON.stringify(currentFootprintInverseNativeDeleteDrainWire(c,id,sessionId))}\0`){throw new Error("INVERSE_NATIVE_DELETE_DRAIN_FRAME");}
 return freezeDeep({action:"footprint-inverse-native-delete-drain",requestId:id,phase:currentFootprintInverseNativeDeleteDrainKey(c),method:c.method,...currentFootprintInverseNativeDeleteDrainTemplate(c).values});
}
