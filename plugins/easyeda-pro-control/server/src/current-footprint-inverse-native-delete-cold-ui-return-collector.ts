/** Actual held negative return facts only. This collector sends no invoke,
 * resume, navigation or mutation and issues no cold owner/result. Its original
 * owner must provide the independent sender, native primitives and live
 * event/write custody; equal-shaped callbacks or packets grant no authority. */
import {types} from "node:util";
import {decodeCurrentNativeFunctionMetadata} from "./current-native-function-metadata.ts";
import {z} from "zod";
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import {captureCurrentFootprintInversePreferenceReply as capture} from "./current-footprint-inverse-public-preferences-replies.ts";
import {currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type {CurrentFootprintInverseLookupRemote as Remote} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_FRAMES as FRAMES,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PROGRAMS as PROGRAMS} from "./current-footprint-inverse-native-delete-cold-ui-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_FLAGS as FLAGS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_POINTS as POINTS,validateCurrentFootprintInverseNativeDeleteColdUiCommand as validate} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiCommand as Command,CurrentFootprintInverseNativeDeleteColdUiFrameRole as FrameRole} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_SOURCE as SOURCE,qualifyCurrentFootprintInverseNativeDeleteColdUiSource as qualify} from "./current-footprint-inverse-native-delete-cold-ui-source.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiSourceRole as SourceRole} from "./current-footprint-inverse-native-delete-cold-ui-source.ts";
import {requireCurrentFootprintInverseNativeDeleteColdUiFulfilledCaller as fulfilledCaller,requireCurrentFootprintInverseNativeDeleteColdUiFulfilledPromise as fulfilledPromise,requireCurrentFootprintInverseNativeDeleteColdUiMissing as missing,requireCurrentFootprintInverseNativeDeleteColdUiOuterValue as outerValue} from "./current-footprint-inverse-native-delete-cold-ui-replies.ts";

const roles=["innerPush","workerReturned","managerReturned","uiTimer","uiReturned","fulfilledReply","resolver"]as const;
type Role=typeof roles[number];
interface Realm{readonly sessionId:string;readonly scriptId:string;readonly source:string}
interface Bindings{
 readonly ui:Realm;readonly manager:Realm;readonly worker:Realm;
 readonly target:Readonly<{documentUuid:string;projectUuid:string}>;
 readonly originalUiBus:string;readonly originalUiSetTimeout:string;readonly originalResolverTask:()=>string;
 readonly originalWorkerFootprint:string;readonly originalManagerFootprint:string;readonly originalManagerWorkerBus:string;
 readonly originalReplyTopic:string;
 readonly originalInvocation:Readonly<{request:Promise<unknown>;written:Promise<void>;assertOriginalWritten:()=>void}>;
 readonly current:()=>void;readonly assertOriginalExit:()=>void;
 readonly assertOriginalHeld:(role:Role,event:DiagnosticEvent)=>void;
 readonly assertOriginalContinuationsSettled:()=>void;
 readonly request:(command:Command,sessionId:string)=>Promise<unknown>;
 readonly qualifyHelper:(command:Command,sessionId:string)=>Promise<void>;
}
export interface CurrentFootprintInverseNativeDeleteColdUiReturnData{
 readonly profile:"private.current-footprint-inverse-native-delete-cold-ui-return-data.v1";
 readonly originalInnerReplyTopicMatched:true;readonly actualWorkerGetDataReturnedMissing:true;
 readonly actualReadyManagerGetDataReturnedMissing:true;
 readonly originalFulfilledServiceCallbackMatched:true;readonly originalResolverCallbackMatched:true;
 readonly originalOuterPromiseRaceFulfilledUndefined:true;readonly defaultTimeoutRequiresOriginalJobExit:true;
 readonly nativeUiTaskAbsenceVerified:false;readonly publicSdkParity:false;readonly coldAbsenceVerified:false;
 readonly wholeInverseVerified:false;readonly executionAuthorized:false;
}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$(?![\s\S])/u);
const remote=z.strictObject({type:z.enum(["undefined","object","function","string","number","boolean","symbol","bigint"]),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional(),unserializableValue:z.string().optional()});
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.strictObject({callFrameId:handle,functionName:z.string().max(128),functionLocation:location,location,url:z.string().max(4096),scopeChain:z.array(z.unknown()).max(16),this:remote,returnValue:remote.optional(),canBeRestarted:z.boolean().optional()});
const paused=z.strictObject({method:z.literal("Debugger.paused"),sessionId:handle,params:z.strictObject({callFrames:z.array(frame).min(2).max(64),reason:z.enum(["other","debugCommand"]),hitBreakpoints:z.tuple([handle]),asyncStackTrace:z.unknown().optional(),asyncStackTraceId:z.unknown().optional()})});
type Frame=z.infer<typeof frame>;
/** Finite readonly capture census from the six fixed branches below. Helpers
 * are original script-source joins, not independent application calls. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RETURN_REQUESTS=Object.freeze({
 innerPush:Object.freeze({normal:5,helpers:2}),workerReturned:Object.freeze({normal:10,helpers:4}),managerReturned:Object.freeze({normal:4,helpers:3}),
 uiTimer:Object.freeze({normal:10,helpers:5}),uiReturned:Object.freeze({normal:6,helpers:4}),fulfilledReply:Object.freeze({normal:6,helpers:4}),resolver:Object.freeze({normal:6,helpers:4}),
 complete:Object.freeze({normal:7,helpers:2}),normal:54,helpers:28,cdpRequests:82,paused:7,resumes:0,invocations:0,
});
const originals=new WeakSet<object>();
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_RETURN_CUSTODY");}}
function nil(value:Remote|undefined):void{need(value?.type==="undefined"&&value.objectId===undefined&&value.subtype===undefined&&!Object.hasOwn(value,"value"));}
function text(value:Remote|undefined,expected:string):void{need(value?.type==="string"&&value.value===expected&&value.objectId===undefined&&value.subtype===undefined);}
function nullValue(value:Remote|undefined):void{need(value?.type==="object"&&value.subtype==="null"&&value.value===null&&value.objectId===undefined);}

export class CurrentFootprintInverseNativeDeleteColdUiReturnCollector{
 readonly #b:Bindings;
 readonly #stages=new Map<Role,Readonly<{event:DiagnosticEvent;pending:Promise<void>}>>();
 readonly #requests:Promise<unknown>[]=[];readonly #helpers:Promise<unknown>[]=[];readonly #settlements:Promise<unknown>[]=[];
 #active:Readonly<{role:Role;event:DiagnosticEvent}>|null=null;
 #failed=false;#cause:unknown;#ended=false;#innerReply:string|null=null;#outerPromise:string|null=null;#innerPromise:string|null=null;#managerPromise:string|null=null;
 #normal=0;#helperCount=0;#endPending:Promise<void>|null=null;
 #pending:Promise<CurrentFootprintInverseNativeDeleteColdUiReturnData>|null=null;#data:CurrentFootprintInverseNativeDeleteColdUiReturnData|null=null;
 public constructor(bindings:Bindings){
  for(const [file,realm]of [["ui",bindings.ui],["manager",bindings.manager],["worker",bindings.worker]]as const){qualify(realm.source,file);handle.parse(realm.sessionId);handle.parse(realm.scriptId);}
  need(types.isPromise(bindings.originalInvocation.request)&&types.isPromise(bindings.originalInvocation.written));
  this.#b=Object.freeze({...bindings,ui:Object.freeze({...bindings.ui}),manager:Object.freeze({...bindings.manager}),worker:Object.freeze({...bindings.worker}),target:Object.freeze({...bindings.target}),originalInvocation:Object.freeze({...bindings.originalInvocation})});
  void this.#keep(bindings.originalInvocation.request);void this.#keep(bindings.originalInvocation.written);this.#observeOriginal(bindings.originalInvocation.request);this.#observeOriginal(bindings.originalInvocation.written);originals.add(this);Object.freeze(this);
 }
 #observeOriginal(pending:Promise<unknown>):void{const observed=(async():Promise<void>=>{try{await pending;}catch(error){this.#fail(error);}})();this.#settlements.push(observed);}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#cause=cause;}}
 #current():void{if(this.#failed){throw this.#cause;}try{need(!this.#ended);this.#b.current();this.#b.originalInvocation.assertOriginalWritten();const active=this.#active;if(active!==null){this.#b.assertOriginalHeld(active.role,active.event);}}catch(error){this.#fail(error);throw error;}}
 #keep<T>(pending:Promise<T>):Promise<T>{need(types.isPromise(pending));const settlement=(async():Promise<void>=>{try{await pending;}catch{
 // The exact original rejection remains on the retained Promise.
}})();this.#settlements.push(settlement);return pending;}
 async #send(command:Command,sessionId:string):Promise<unknown>{
  this.#current();const fixed=validate(command);need(fixed.method==="Runtime.callFunctionOn"&&["retain","same"].includes(fixed.role)||fixed.method==="Runtime.awaitPromise"||fixed.method==="Runtime.getProperties"||fixed.method==="Debugger.evaluateOnCallFrame");
  need(this.#normal<CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RETURN_REQUESTS.normal);this.#normal+=1;this.#current();const pending=this.#keep(this.#b.request(fixed,sessionId));this.#requests.push(pending);const raw=await pending;this.#current();
  if(fixed.method==="Runtime.callFunctionOn"||fixed.method==="Debugger.evaluateOnCallFrame"){need(this.#helperCount<CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RETURN_REQUESTS.helpers);this.#helperCount+=1;this.#current();const helper=this.#keep(this.#b.qualifyHelper(fixed,sessionId));this.#helpers.push(helper);await helper;this.#current();}
  return raw;
 }
 #props(id:string,sessionId:string):Promise<unknown>{return this.#send({phase:"inverse-native-delete-cold-ui",role:"properties",method:"Runtime.getProperties",params:{objectId:id,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}},sessionId);}
 #same(actual:string,expected:string,sessionId:string,equal=true):Promise<void>{
  return(async():Promise<void>=>{const raw=await this.#send(validate({phase:"inverse-native-delete-cold-ui",role:"same",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:actual,functionDeclaration:PROGRAMS.same,arguments:[{objectId:expected}],returnByValue:true}}),sessionId);
   const parsed=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.boolean()})}).parse(capture(raw));need(parsed.result.value===equal);})();
 }
 async #tuple(role:FrameRole,held:Frame,sessionId:string,size:number):Promise<readonly Remote[]>{
  const id=result(await this.#send(validate({phase:"inverse-native-delete-cold-ui",role,method:"Debugger.evaluateOnCallFrame",params:{callFrameId:held.callFrameId,expression:FRAMES[role],objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}}),sessionId),size);
  return array(await this.#props(id,sessionId),size);
 }
 #id(values:readonly Remote[],index:number):string{this.#current();const value=values[index];need(value!==undefined);return object(value);}
 async #retained(value:Remote|undefined,sessionId:string,promise=false):Promise<string>{
  need(value?.type==="object"&&value.subtype===(promise?"promise":undefined)&&value.className===(promise?"Promise":"Object")&&value.objectId!==undefined);
  const command=validate({phase:"inverse-native-delete-cold-ui",role:"retain",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:value.objectId,functionDeclaration:PROGRAMS.retain,arguments:[],returnByValue:false}});const packet=await this.#send(command,sessionId);const raw=z.strictObject({result:remote}).parse(capture(packet));
  need(raw.result.type==="object"&&raw.result.subtype===(promise?"promise":undefined)&&raw.result.className===value.className);return object(raw.result);
 }
 #row(frameValue:Frame,role:SourceRole):void{
  const row=SOURCE[role];const scriptId=this.#b[row.file].scriptId;
  need(frameValue.functionLocation.scriptId===scriptId&&frameValue.location.scriptId===scriptId&&frameValue.functionLocation.lineNumber===row.lineNumber&&frameValue.functionLocation.columnNumber===row.columnNumber);
 }
 #parse(role:Role,event:DiagnosticEvent):readonly Frame[]{
  this.#current();this.#b.assertOriginalHeld(role,event);const raw=paused.parse(capture(event));let realm=this.#b.ui;if(role==="workerReturned"){realm=this.#b.worker;}else if(role==="innerPush"||role==="managerReturned"){realm=this.#b.manager;}need(raw.sessionId===realm.sessionId);
  const top=raw.params.callFrames[0];need(top!==undefined);const sourceRoles:Readonly<Record<Role,SourceRole>>={uiReturned:"uiRpc",fulfilledReply:"uiReply",resolver:"uiResolver",workerReturned:"workerGetData",managerReturned:"managerGetData",innerPush:"innerPush",uiTimer:"uiTimer"};const sourceRole=sourceRoles[role];this.#row(top,sourceRole);
  if(role==="workerReturned"||role==="managerReturned"||role==="uiReturned"){const point=POINTS[role].stop;need(top.location.lineNumber===point.lineNumber&&top.location.columnNumber===point.columnNumber&&top.returnValue!==undefined);}
  return raw.params.callFrames;
 }
 async #own(id:string,sessionId:string,names:readonly string[]):Promise<ReadonlyMap<string,Remote>>{
  const rows=properties(await this.#props(id,sessionId));need(rows.length===names.length&&rows.every(row=>row.value!==undefined&&row.writable===true&&row.enumerable&&row.configurable&&names.includes(row.name)));
  return new Map(rows.map(row=>{need(row.value!==undefined);return[row.name,row.value];}));
 }
 async #body(id:string,sessionId:string):Promise<void>{const value=await this.#own(id,sessionId,["uuid","need"]);text(value.get("uuid"),this.#b.target.documentUuid);nil(value.get("need"));}
 async #capture(role:Role,event:DiagnosticEvent):Promise<void>{
  const frames=this.#parse(role,event);const top=frames[0];need(top!==undefined);const b=this.#b;
  if(role==="innerPush"){
   need(this.#innerReply===null);const caller=frames[1];need(caller!==undefined);this.#row(caller,"innerCaller");
   const values=await this.#tuple("innerPush",top,b.manager.sessionId,3);await this.#same(this.#id(values,0),b.originalManagerWorkerBus,b.manager.sessionId);text(values[1],"/mgr/projectWorker/footprint/get");
   const envelope=await this.#own(this.#id(values,2),b.manager.sessionId,["message","replyTopic"]);const body=envelope.get("message");need(body!==undefined);await this.#body(object(body),b.manager.sessionId);
   const reply=envelope.get("replyTopic");need(reply?.type==="string"&&typeof reply.value==="string"&&/^_MSG_BUS_RPC_-\/mgr\/projectWorker\/footprint\/get-[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}-(?:0|[1-9]\d{0,15})$(?![\s\S])/u.test(reply.value));this.#innerReply=reply.value;return;
  }
  if(role==="workerReturned"){
   need(this.#innerReply!==null);for(const[index,key]of [[1,"workerNeedData"],[2,"workerHandler"],[3,"workerDispatch"]]as const){const caller=frames[index];need(caller!==undefined);this.#row(caller,key);}
   const values=await this.#tuple(role,top,b.worker.sessionId,3);await this.#same(this.#id(values,0),b.originalWorkerFootprint,b.worker.sessionId);text(values[1],b.target.documentUuid);nullValue(values[2]);const retained=await this.#retained(top.returnValue,b.worker.sessionId);missing(await this.#props(retained,b.worker.sessionId));
   const dispatch=frames[3];need(dispatch!==undefined);const received=await this.#tuple("workerDispatch",dispatch,b.worker.sessionId,6);text(received[1],"/mgr/projectWorker/footprint/get");text(received[5],this.#innerReply);
   const envelope=await this.#own(this.#id(received,3),b.worker.sessionId,["message","replyTopic"]);text(envelope.get("replyTopic"),this.#innerReply);const body=envelope.get("message");need(body!==undefined);await this.#body(object(body),b.worker.sessionId);await this.#body(this.#id(received,4),b.worker.sessionId);return;
  }
  if(role==="managerReturned"){
   need(this.#stages.has("workerReturned"));const values=await this.#tuple(role,top,b.manager.sessionId,3);await this.#same(this.#id(values,0),b.originalManagerFootprint,b.manager.sessionId);text(values[1],b.target.documentUuid);nil(values[2]);this.#managerPromise=await this.#retained(top.returnValue,b.manager.sessionId,true);return;
  }
  if(role==="uiTimer"){
   need(this.#innerPromise===null);const caller=frames[1];need(caller!==undefined);this.#row(caller,"uiRpc");const point=POINTS.uiTimer.stop;need(top.location.lineNumber===point.lineNumber&&top.location.columnNumber===point.columnNumber);
   const values=await this.#tuple("uiInnerCaller",caller,b.ui.sessionId,5);await this.#same(this.#id(values,0),b.originalUiBus,b.ui.sessionId);text(values[1],"/PrjDB/footprint/getData");need(values[3]?.type==="number"&&values[3].value===300_000);
   const args=array(await this.#props(this.#id(values,2),b.ui.sessionId),2);text(args[0],b.target.documentUuid);text(args[1],b.target.projectUuid);this.#innerPromise=await this.#retained(values[4],b.ui.sessionId,true);
   const timer=await this.#tuple("uiTimer",top,b.ui.sessionId,4);need(timer[2]?.type==="number"&&timer[2].value===300_000);
   for(const index of [0,1]){const callback=timer[index];need(callback?.type==="function"&&callback.subtype===undefined&&callback.className==="Function"&&callback.description==="function () { [native code] }");decodeCurrentNativeFunctionMetadata(await this.#props(object(callback),b.ui.sessionId),{name:"",arity:1,constructor:false});}
   await this.#same(this.#id(timer,3),b.originalUiSetTimeout,b.ui.sessionId);return;
  }
  if(role==="uiReturned"){
   need(this.#outerPromise===null&&this.#innerPromise!==null);const values=await this.#tuple(role,top,b.ui.sessionId,4);await this.#same(this.#id(values,0),b.originalUiBus,b.ui.sessionId);text(values[1],"/PrjDB/footprint/getData");need(values[3]?.type==="number"&&values[3].value===300_000);
   const args=array(await this.#props(this.#id(values,2),b.ui.sessionId),2);text(args[0],b.target.documentUuid);text(args[1],b.target.projectUuid);
   this.#outerPromise=await this.#retained(top.returnValue,b.ui.sessionId,true);await this.#same(this.#outerPromise,this.#innerPromise,b.ui.sessionId,false);return;
  }
  if(role==="fulfilledReply"){
   need(this.#outerPromise!==null&&this.#stages.has("managerReturned"));const caller=frames[1];need(caller!==undefined);fulfilledCaller(caller,b.ui.scriptId);
   const values=await this.#tuple(role,top,b.ui.sessionId,5);await this.#same(this.#id(values,0),b.originalUiBus,b.ui.sessionId);nil(values[1]);text(values[2],b.originalReplyTopic);nil(values[3]);nil(values[4]);
   const fulfilled=await this.#tuple("fulfilledCaller",caller,b.ui.sessionId,5);await this.#same(this.#id(fulfilled,0),b.originalUiBus,b.ui.sessionId);nil(fulfilled[1]);text(fulfilled[2],b.originalReplyTopic);nil(fulfilled[3]);nil(fulfilled[4]);return;
  }
  need(this.#stages.has("fulfilledReply"));const task=frames[1];const push=frames[2];const reply=frames[3];need(task!==undefined&&push!==undefined&&reply!==undefined);this.#row(task,"uiTask");this.#row(push,"uiPush");this.#row(reply,"uiReply");
  const values=await this.#tuple(role,top,b.ui.sessionId,4);await this.#same(this.#id(values,0),b.originalUiBus,b.ui.sessionId);nil(values[1]);nil(values[2]);nil(values[3]);
  const taskValues=await this.#tuple("resolverTask",task,b.ui.sessionId,5);await this.#same(this.#id(taskValues,0),b.originalResolverTask(),b.ui.sessionId);nil(taskValues[1]);nil(taskValues[2]);nil(taskValues[3]);need(taskValues[4]?.type==="boolean"&&taskValues[4].value===false);
 }
 /** A matching repeat joins its same original capture; another event cannot
  * replace an already consumed hold. No stage resumes its application frame. */
 public captureOriginalHeld(role:Role,event:DiagnosticEvent):Promise<void>{
  const prior=this.#stages.get(role);if(prior!==undefined){need(prior.event===event);return prior.pending;}
  this.#current();need(this.#active===null&&roles.includes(role));const gate=Promise.withResolvers<null>();
  const pending=(async():Promise<void>=>{await gate.promise;try{this.#current();const normal=this.#normal;const helpers=this.#helperCount;await this.#capture(role,event);this.#current();const expected=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RETURN_REQUESTS[role];need(this.#normal-normal===expected.normal&&this.#helperCount-helpers===expected.helpers);}catch(error){this.#fail(error);throw error;}finally{this.#active=null;}})();
  this.#active=Object.freeze({role,event});this.#stages.set(role,Object.freeze({event,pending}));void this.#keep(pending);gate.resolve(null);return pending;
 }
 public completeOriginal():Promise<CurrentFootprintInverseNativeDeleteColdUiReturnData>{
  if(this.#pending!==null){return this.#pending;}this.#current();
  const gate=Promise.withResolvers<null>();const pending=(async():Promise<CurrentFootprintInverseNativeDeleteColdUiReturnData>=>{await gate.promise;try{
   this.#current();need(this.#active===null&&this.#stages.size===roles.length&&this.#outerPromise!==null);this.#b.assertOriginalContinuationsSettled();const invocation=this.#b.originalInvocation;await invocation.written;this.#current();const actual=z.strictObject({result:remote}).parse(capture(await invocation.request));this.#current();need(actual.result.type==="object"&&actual.result.className==="Promise"&&actual.result.subtype==="promise");
   const outer=this.#outerPromise;need(outer!==null);const settled=await this.#send({phase:"inverse-native-delete-cold-ui",role:"await",method:"Runtime.awaitPromise",params:{promiseObjectId:outer,objectGroup:FLAGS.objectGroup,returnByValue:false,generatePreview:false}},this.#b.ui.sessionId);const value=z.strictObject({result:remote}).parse(capture(settled));need(value.result.type==="object"&&value.result.subtype===undefined&&value.result.className==="Object");
   await this.#same(outer,object(actual.result),this.#b.ui.sessionId);const fulfilled=fulfilledPromise(await this.#props(outer,this.#b.ui.sessionId));await this.#same(fulfilled.result,object(value.result),this.#b.ui.sessionId);outerValue(await this.#props(fulfilled.result,this.#b.ui.sessionId));
   const managerPromise=this.#managerPromise;need(managerPromise!==null);const managerResult=fulfilledPromise(await this.#props(managerPromise,this.#b.manager.sessionId));missing(await this.#props(managerResult.result,this.#b.manager.sessionId));
   this.#b.assertOriginalContinuationsSettled();this.#current();need(this.#normal===CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RETURN_REQUESTS.normal&&this.#helperCount===CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RETURN_REQUESTS.helpers);const data:CurrentFootprintInverseNativeDeleteColdUiReturnData=Object.freeze({profile:"private.current-footprint-inverse-native-delete-cold-ui-return-data.v1",originalInnerReplyTopicMatched:true,actualWorkerGetDataReturnedMissing:true,actualReadyManagerGetDataReturnedMissing:true,originalFulfilledServiceCallbackMatched:true,originalResolverCallbackMatched:true,originalOuterPromiseRaceFulfilledUndefined:true,defaultTimeoutRequiresOriginalJobExit:true,nativeUiTaskAbsenceVerified:false,publicSdkParity:false,coldAbsenceVerified:false,wholeInverseVerified:false,executionAuthorized:false});this.#data=data;return data;
  }catch(error){this.#fail(error);throw error;}})();this.#pending=pending;void this.#keep(pending);gate.resolve(null);return pending;
 }
 public requireOriginal(data:CurrentFootprintInverseNativeDeleteColdUiReturnData):void{this.#current();need(this.#data===data&&this.#pending!==null);}
 public requireOriginalAfterOriginalExit(data:CurrentFootprintInverseNativeDeleteColdUiReturnData):void{this.#b.assertOriginalExit();need(!this.#failed&&this.#data===data&&this.#pending!==null);}
 public settleAfterOriginalExit():Promise<void>{
  this.#b.assertOriginalExit();if(this.#endPending!==null){return this.#endPending;}this.#ended=true;
  const gate=Promise.withResolvers<null>();const pending=(async():Promise<void>=>{await gate.promise;await Promise.allSettled([this.#pending,...[...this.#stages.values()].map(value=>value.pending),...this.#requests,...this.#helpers,...this.#settlements,this.#b.originalInvocation.request,this.#b.originalInvocation.written]);this.#b.assertOriginalExit();})();
  this.#endPending=pending;gate.resolve(null);return pending;
 }
}
Object.freeze(CurrentFootprintInverseNativeDeleteColdUiReturnCollector.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteColdUiReturnCollector);
export function assertOriginalCurrentFootprintInverseNativeDeleteColdUiReturnCollector(value:CurrentFootprintInverseNativeDeleteColdUiReturnCollector):void{need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&originals.has(value)&&Object.getPrototypeOf(value)===CurrentFootprintInverseNativeDeleteColdUiReturnCollector.prototype&&Reflect.ownKeys(value).length===0);}
