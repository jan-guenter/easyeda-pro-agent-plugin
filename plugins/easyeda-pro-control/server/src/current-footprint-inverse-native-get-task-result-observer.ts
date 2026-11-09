/* oxlint-disable import/max-dependencies -- Original source/metadata/Event/row proofs remain separate and never issue a public SDK token. */
/** One original internal GET UI return. Clone and resolver operands are proved
 * at their genuine entries before execution; formatted public UI parity is omitted. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_CALLS as CALLS,CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_FLAGS as FLAGS,validateCurrentFootprintInverseNativeGetTaskResultCommand as validate } from "./current-footprint-inverse-native-get-task-result-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskResultCommand as Command } from "./current-footprint-inverse-native-get-task-result-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_EXPRESSIONS as EXPRESSIONS,CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_POINTS as POINTS } from "./current-footprint-inverse-native-get-task-result-programs.ts";
import type { CurrentFootprintInverseNativeGetTaskResultHeld as Held } from "./current-footprint-inverse-native-get-task-result-replies.ts";
import { currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type { CurrentFootprintInverseLookupRemote as Remote } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { requireCurrentFootprintInverseInitializedGetDescription as outerDescription } from "./current-footprint-inverse-initialized-get-source.ts";
import { decodeCurrentFootprintInverseInitializedGetFunction as outerMetadata } from "./current-footprint-inverse-initialized-get-replies.ts";
import { requireCurrentFootprintInverseInnerGetDescription as innerDescription } from "./current-footprint-inverse-inner-get-source.ts";
import { decodeCurrentFootprintInverseInnerGetFunction as innerMetadata } from "./current-footprint-inverse-inner-get-replies.ts";
import { qualifyCurrentFootprintInverseLookupNativeMethod as nativeMethod } from "./current-footprint-inverse-lookup-native-metadata.ts";
import { currentFootprintInverseGetResultScope as scope } from "./current-footprint-inverse-get-result-replies.ts";
import { compareCurrentFootprintInverseRuntimeRowProperties as compareRow } from "./current-footprint-inverse-public-row-runtime.ts";
import { currentNativeMessageEventCallable,qualifyCurrentNativeEventConstructor,qualifyCurrentNativeMessageEventFunction } from "./current-native-message-event-metadata.ts";
import type { CurrentFootprintInverseNativeGetTaskForwardReceipt as Forward } from "./current-footprint-inverse-native-get-task-forward-observer.ts";
import type { CurrentFootprintInverseNativeGetTaskSenderPrepared as Sender } from "./current-footprint-inverse-native-get-task-sender-collector.ts";
import { currentFootprintInverseLookupIdentity } from "./current-footprint-inverse-lookup-identity.ts";
import type { CurrentFootprintInversePublicRowData,CurrentFootprintInversePublicRowValue as Value } from "./current-footprint-inverse-public-row-data.ts";


interface Tuple { readonly id: string; readonly values: readonly Remote[]; readonly packets: readonly unknown[] }
type CallRole = keyof typeof CALLS;
export interface CurrentFootprintInverseNativeGetTaskResultBindings {
 readonly receipt:string; readonly root:string; readonly native:string; readonly nativeMembers:string; readonly nativeQualified:string;
 readonly scripts:Readonly<{ui:string;manager:string}>; readonly target:Readonly<{projectUuid:string;branchUuid:string;documentUuid:string}>;
 readonly workerUuid:string; readonly sender:Sender; readonly module:string; readonly forwarded:Forward; readonly rowData:CurrentFootprintInversePublicRowData;
 readonly current:()=>void; readonly request:(command:Command)=>Promise<unknown>;
 readonly armed:(role:keyof typeof POINTS,point:string)=>Promise<void>; readonly wait:()=>Promise<Held>; readonly resumed:()=>Promise<void>; readonly poll:()=>Promise<void>;
 readonly control:(role:"functions"|"prepared"|"complete",data?:Readonly<Record<string,string>>)=>Promise<void>;
}
export interface CurrentFootprintInverseNativeGetTaskResultReceipt {
 readonly schema:"private.inverse-native-get-task-ui-observations.v1"; readonly suppliedObservationsOnly:true; readonly innerLiveReplyJoined:false; readonly runtimeResultIssued:false; readonly workerCompletionIssued:false;
 readonly views:string; readonly roots:string; readonly tasks:string; readonly callbacks:string; readonly raw:string; readonly outerRow:string; readonly workerGraph:string; readonly cloneGraph:string;
 readonly workerRowCompared:true; readonly uiReplySettled:true; readonly originalCallbackReturned:true; readonly nativeTaskInternalBackend:true;
 readonly publicUiRowParity:false; readonly publicUiToastParity:false; readonly referenceAuthorized:false; readonly deletionAuthorized:false;
}
function need(value:boolean):asserts value { if(!value){throw new Error("INVERSE_NATIVE_GET_TASK_RESULT_SEQUENCE");} }
const empty=z.strictObject({});
const remote=z.strictObject({type:z.enum(["object","function","string","number","undefined"]),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:z.string().optional(),value:z.unknown().optional()});
const promiseInternal=z.strictObject({name:z.enum(["[[Prototype]]","[[PromiseState]]","[[PromiseResult]]"]),value:remote});
const promisePacket=z.strictObject({result:z.array(z.unknown()).length(0),internalProperties:z.array(promiseInternal).length(3)});
/** Rejoin the original pending reply tasks, trusted native delivery, raw row,
 * live clone and one-shot resolver. Keep each newly opaque value behind its
 * complete non-Proxy metadata before a later helper traverses it. */
export async function observeCurrentFootprintInverseNativeGetTaskResult(b:CurrentFootprintInverseNativeGetTaskResultBindings):Promise<Readonly<CurrentFootprintInverseNativeGetTaskResultReceipt>> {
 const identity=currentFootprintInverseLookupIdentity(b.target);
 /** Read one complete own-property packet under current original custody. */
 const props=async(id:string):Promise<unknown>=>{b.current();const raw=await b.request({phase:"inverse-native-get-task-result-properties",method:"Runtime.getProperties",params:{objectId:id,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});b.current();return raw;};
 /** Submit one closed role with original references and literal true flags. */
 const call=async(role:CallRole,refs:readonly string[],value?:string|typeof identity,receiver=b.receipt):Promise<unknown>=>{const row=CALLS[role];const args:unknown[]=refs.map(objectId=>({objectId}));if(value!==undefined){args.push({value});}b.current();const command=validate({phase:"inverse-native-get-task-result-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:row.program,arguments:args,returnByValue:row.byValue}});const raw=await b.request(command);b.current();return raw;};
 /** Qualify dense shape and every newly exposed opaque member before traversal. */
 const idTuple=async(id:string,size:number,opaque=true):Promise<Tuple>=>{const values=array(await props(id),size);const packets:unknown[]=[];for(const value of values){if(opaque&&(value.type==="function"||value.type==="object"&&value.subtype!=="null")){const raw=await props(object(value));if(value.subtype==="promise"){promisePacket.parse(capture(raw));}else{properties(raw);}packets.push(raw);}else{packets.push(null);}}return{id,values,packets};};
 /** Join the actual helper result to its complete correlated tuple metadata. */
 const tuple=async(role:CallRole,refs:readonly string[],size:number,value?:string|typeof identity,receiver=b.receipt,opaque=true):Promise<Tuple>=>idTuple(result(await call(role,refs,value,receiver),size),size,opaque);
 /** Read only the exact original held-frame projection and qualify its metadata. */
 const frame=async(role:keyof typeof EXPRESSIONS,id:string,size:number):Promise<Tuple>=>{const raw=await b.request({phase:"inverse-native-get-task-result-frame",role,method:"Debugger.evaluateOnCallFrame",params:{callFrameId:id,expression:EXPRESSIONS[role],objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}});b.current();return idTuple(result(raw,size),size);};
 const views=await tuple("views",[b.sender.roots,b.sender.context,b.sender.bus,b.sender.methods,b.sender.task,b.sender.members,b.sender.taskMethods,b.sender.prepared,b.module,b.native],5);
 /** Select one already metadata-qualified comparison view from the fresh tuple. */
 const view=(index:number):string=>{const value=views.values[index];need(value!==undefined);return object(value);};
 const outer=await idTuple(view(0),6);const module=await idTuple(view(1),14);const methods=await idTuple(view(2),13);const task=await idTuple(view(3),2);const members=await idTuple(view(4),3);
 /** Project only the three owner-derived IDs and reprove original project context. */
 const target=async():Promise<void>=>{truth(await call("target",[b.sender.roots,b.sender.context,b.sender.prepared],identity));}; await target();
 const replyState=await tuple("replyState",[b.sender.prepared],2);
 const queued=await tuple("queued",[b.forwarded.channel.roots],1);
 const roots=await tuple("roots",[outer.id,module.id,methods.id,replyState.id,b.forwarded.channel.roots,b.forwarded.prepared,b.native,b.nativeMembers,queued.id],12);
 const tasks=await tuple("tasks",[roots.id],3);const callbacks=await tuple("callbacks",[roots.id,tasks.id,task.id,members.id,b.forwarded.channel.taskPrototype,methods.id,b.forwarded.channel.taskMethods,module.id],5);
 const outerScript=b.scripts.ui;
 const cb=callbacks.values[1];const inner=callbacks.values[2];need(cb?.type==="function"&&typeof cb.description==="string"&&inner?.type==="function"&&typeof inner.description==="string");
 outerDescription(cb.description,"uiBusRpcCallCallback2");outerMetadata(callbacks.packets[1],"uiBusRpcCallCallback2",outerScript);
 innerDescription(inner.description,"innerRpcBaseSubscribeOnceCallback1");const innerInfo=innerMetadata(callbacks.packets[2],"innerRpcBaseSubscribeOnceCallback1",b.scripts.manager);
 const innerScope=scope(await props(innerInfo.scopes),"subscribeOnce");const callback=await tuple("innerCallback",[innerScope,tasks.id,callbacks.id],2);
 const innerFn=callback.values[0];need(innerFn?.type==="function"&&typeof innerFn.description==="string");innerDescription(innerFn.description,"innerRpcBaseRpcCallCallback2");const innerFnInfo=innerMetadata(callback.packets[0],"innerRpcBaseRpcCallCallback2",b.scripts.manager);
 const resolverScope=scope(await props(innerFnInfo.scopes),"anonymous");const resolvers=await tuple("innerResolvers",[resolverScope,callback.id],3);
 for(const index of[0,1]){const fn=resolvers.values[index];need(fn!==undefined);nativeMethod(resolvers.packets[index],fn,"resolver");}
 const prototypes=await tuple("prototypes",[b.native],4);const objectProto=prototypes.values[0];const arrayProto=prototypes.values[1];const objectCtor=prototypes.values[2];const arrayCtor=prototypes.values[3];need(objectProto!==undefined&&arrayProto!==undefined&&objectCtor!==undefined&&arrayCtor!==undefined);
 /** Compare every bounded graph node and retain descriptor receipts for final reproof. */
 const rowGraph=async(id:string,expected:Value):Promise<string>=>{const seed=await tuple("empty",[],3,undefined,b.receipt,false);let head=seed.id;let count=0;const visit=async(row:string,wanted:Value):Promise<void>=>{need(wanted.kind==="object"||wanted.kind==="array");count+=1;need(count<=63);const children=compareRow(await props(row),wanted);const snapshot=await tuple("rowCapture",[row,object(wanted.kind==="array"?arrayProto:objectProto),object(wanted.kind==="array"?arrayCtor:objectCtor)],4,wanted.kind==="array"?"Array":"Object",b.receipt,false);truth(await call("rowReprove",[snapshot.id,row]));const appended=await tuple("append",[head,snapshot.id],3,undefined,b.receipt,false);head=appended.id;for(const child of children){await visit(child.objectId,child.expected);}};await visit(id,expected);truth(await call("reprove",[head]));return head;};
 const eventCtors=await tuple("event-constructors",[b.receipt],5,undefined,b.root);for(const index of[2,3]){const fn=eventCtors.values[index];need(fn!==undefined);currentNativeMessageEventCallable({result:fn},index===2?"Event":0);if(index===2){qualifyCurrentNativeEventConstructor(eventCtors.packets[index]);}else{qualifyCurrentNativeMessageEventFunction(eventCtors.packets[index],0);}}
 const reproveNative=async():Promise<void>=>{truth(await call("nativeInstance",[b.native,b.nativeMembers,b.nativeQualified]));truth(await call("nativeHooks",[b.native,b.nativeMembers]));};
 const points=new Map<keyof typeof POINTS,string>();
 /** Arm only a source-qualified original function or its exact normal return. */
 const arm=async(role:keyof typeof POINTS,id?:string):Promise<void>=>{const point=POINTS[role];const raw=await b.request(id===undefined?{phase:"inverse-native-get-task-result-point",role:"returned",method:"Debugger.setBreakpoint",params:{location:{scriptId:b.scripts.ui,lineNumber:point.lineNumber,columnNumber:point.columnNumber},condition:""}}:validate({phase:"inverse-native-get-task-result-function",role,method:"Debugger.setBreakpointOnFunctionCall",params:{objectId:id,condition:""}}));const reply=z.strictObject({breakpointId:z.string().min(1),actualLocation:z.strictObject({scriptId:z.string(),lineNumber:z.number(),columnNumber:z.number()}).optional()}).parse(capture(raw));if(id===undefined){need(reply.actualLocation?.scriptId===b.scripts.ui&&reply.actualLocation.lineNumber===point.lineNumber&&reply.actualLocation.columnNumber===point.columnNumber);}points.set(role,reply.breakpointId);await b.armed(role,reply.breakpointId);};
 const rpc=methods.values[8];const executeMethod=methods.values[11];need(rpc!==undefined&&executeMethod!==undefined);await b.control("functions",{reply:object(rpc),execute:object(executeMethod),callback:object(cb),uiScript:b.scripts.ui});
 await arm("reply",object(rpc));await arm("execute",object(executeMethod));await arm("callback",object(cb));await arm("returned");await reproveNative();await target();await b.control("prepared");
 /** Retire only a retained owned point through this distinct native lane. */
 const remove=async(point:string):Promise<void>=>{empty.parse(capture(await b.request({phase:"inverse-native-get-task-result-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:point}})));};
 /** Remove only a previously retained owned point after its boundary was proved. */
 const retire=async(role:keyof typeof POINTS):Promise<void>=>{const point=points.get(role);need(point!==undefined);await remove(point);points.delete(role);};
 /** Reprove native identity immediately before each genuine original resume. */
 const resume=async():Promise<void>=>{b.current();await reproveNative();await target();empty.parse(capture(await b.request({phase:"inverse-native-get-task-result-resume",method:"Debugger.resume",params:{}})));await b.resumed();b.current();};
 /** Read native Event slots only after their actual getter metadata is qualified. */
 const nativeRead=async(held:Held):Promise<Readonly<{kind:string;envelope:string}>>=>{need(held.role==="onMessage"&&held.kind==="native"&&held.caller!==null);const incoming=await frame("incoming",held.frame,2);const listener=await frame("nativeListener",held.caller,2);const event=listener.values[1];need(event!==undefined);const fields=await tuple("event-members",[object(event)],12,undefined,eventCtors.id);for(let index=0;index<8;index+=1){const fn=fields.values[index+3];need(fn!==undefined);currentNativeMessageEventCallable({result:fn},index+1);qualifyCurrentNativeMessageEventFunction(fields.packets[index+3],index+1);}const read=await tuple("event-opaque",[b.forwarded.channel.broadcastChannel],5,undefined,fields.id);need(read.values[3]?.value===b.forwarded.nativeOrigin);const captured=await tuple("incoming",[incoming.id,read.id,roots.id],2,b.workerUuid);const envelope=captured.values[0];const kind=captured.values[1];need(envelope!==undefined&&kind?.type==="string"&&typeof kind.value==="string");return{kind:kind.value,envelope:object(envelope)};};
 await remove(b.forwarded.postReturnedPoint);await resume();
 const local=await b.wait();need(local.role==="onMessage"&&local.kind==="local");const localFrame=await frame("incoming",local.frame,2);truth(await call("local",[localFrame.id,b.forwarded.originalPost,roots.id],b.workerUuid));await resume();
 const whohas=await nativeRead(await b.wait());need(whohas.kind==="WHOHAS");await resume();
 const published=await nativeRead(await b.wait());need(published.kind==="PUBLISH");const response=await tuple("response",[published.envelope,roots.id],2);const wrapped=await tuple("wrapper",[response.id],2);const raw=await tuple("raw",[wrapped.id],2);const rawRow=raw.values[0];need(rawRow!==undefined);const workerGraph=await rowGraph(object(rawRow),b.rowData.workerRow);await remove(b.forwarded.onMessagePoint);await resume();
 /** Inspect the actual original Promise without awaiting or replacing it. */
 const fulfilled=async(id:string):Promise<Remote>=>{truth(await call("promise",[id,b.nativeMembers]));const packet=promisePacket.parse(capture(await props(id)));const slots=new Map(packet.internalProperties.map(row=>[row.name,row.value]));need(slots.size===3&&slots.get("[[PromiseState]]")?.value==="fulfilled");const returned=slots.get("[[PromiseResult]]");need(returned!==undefined);if(returned.type==="object"){properties(await props(object(returned)));}return returned;};
 const replyHeld=await b.wait();need(replyHeld.role==="reply");const reply=await frame("reply",replyHeld.frame,13);truth(await call("replyLive",[reply.id,roots.id,raw.id,module.id]));const innerReturned=await fulfilled(b.forwarded.innerPromise);const expected=wrapped.values[0];need(expected!==undefined);truth(await call("same",[object(innerReturned),object(expected)]));await retire("reply");await resume();
 const executeHeld=await b.wait();need(executeHeld.role==="execute"&&executeHeld.push!==null);const execute=await frame("execute",executeHeld.frame,6);const push=await frame("push",executeHeld.push,5);truth(await call("executeLive",[execute.id,push.id,roots.id,tasks.id,module.id,raw.id]));truth(await call("reprove",[workerGraph]));await retire("execute");await resume();
 const callbackHeld=await b.wait();need(callbackHeld.role==="callback"&&callbackHeld.caller!==null&&callbackHeld.push!==null);const callbackFrame=await frame("callback",callbackHeld.frame,5);const caller=await frame("execute",callbackHeld.caller,6);const callbackPush=await frame("push",callbackHeld.push,5);const resolver=await tuple("callbackLive",[callbackFrame.id,caller.id,callbackPush.id,roots.id,tasks.id,module.id,raw.id],1);const resolve=resolver.values[0];need(resolve!==undefined);nativeMethod(resolver.packets[0],resolve,"resolver");const cloned=callbackFrame.values[0];need(cloned!==undefined);const cloneGraph=await rowGraph(object(cloned),b.rowData.workerRow);await retire("callback");await resume();
 const returnedHeld=await b.wait();need(returnedHeld.role==="returned"&&returnedHeld.caller!==null&&returnedHeld.push!==null);const finalCallback=await frame("callback",returnedHeld.frame,5);const finalExecute=await frame("execute",returnedHeld.caller,6);const finalPush=await frame("push",returnedHeld.push,5);const finalResolver=await tuple("callbackLive",[finalCallback.id,finalExecute.id,finalPush.id,roots.id,tasks.id,module.id,raw.id],1);const sameResolver=finalResolver.values[0];const sameRow=finalCallback.values[0];need(sameResolver!==undefined&&sameRow!==undefined);truth(await call("same",[object(sameResolver),object(resolve)]));truth(await call("same",[object(sameRow),object(cloned)]));await retire("returned");await resume();
 // Final resume lets the original Promise.race microtasks settle. No fabricated
 // UI caller, formatter, timeout replacement or extra resume is introduced.
 await b.poll();b.current();for(const promise of[b.forwarded.outerLocalPromise,b.forwarded.outerPromise]){const returned=await fulfilled(promise);truth(await call("outerResult",[object(returned),object(cloned)]));}
 for(const graph of[workerGraph,cloneGraph]){truth(await call("reprove",[graph]));}truth(await call("final",[roots.id,tasks.id,callbacks.id]));await target();await reproveNative();await b.control("complete");b.current();
 return Object.freeze({schema:"private.inverse-native-get-task-ui-observations.v1",suppliedObservationsOnly:true,innerLiveReplyJoined:false,runtimeResultIssued:false,workerCompletionIssued:false,views:views.id,roots:roots.id,tasks:tasks.id,callbacks:callbacks.id,raw:raw.id,outerRow:object(cloned),workerGraph,cloneGraph,workerRowCompared:true,uiReplySettled:true,originalCallbackReturned:true,nativeTaskInternalBackend:true,publicUiRowParity:false,publicUiToastParity:false,referenceAuthorized:false,deletionAuthorized:false});
}
