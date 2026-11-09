/** One fresh native-task continuation, held at the actual IGIVE normal return.
 * Only the subsequent original accepted worker event can issue its private Job. */
/* oxlint-disable import/max-dependencies -- Original source, UI I11, BC/Event metadata and exact retained scopes remain independent inputs. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_FORWARD_CALLS as CALLS,CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_FORWARD_FLAGS as FLAGS,validateCurrentFootprintInverseNativeGetTaskForwardCommand as validate } from "./current-footprint-inverse-native-get-task-forward-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskForwardCommand as Command } from "./current-footprint-inverse-native-get-task-forward-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_SEND_POINTS as POINTS } from "./current-footprint-inverse-get-send-source.ts";
import type { CurrentFootprintInverseGetSendHeld as Held } from "./current-footprint-inverse-get-send-replies.ts";
import { currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type { CurrentFootprintInverseLookupRemote as Remote } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { currentFootprintInverseLookupIdentity } from "./current-footprint-inverse-lookup-identity.ts";
import type { CurrentFootprintInverseGetChannelGraph as Channel } from "./current-footprint-inverse-get-channel-collector.ts";
import { collectCurrentFootprintInverseGetSenderOrigin } from "./current-footprint-inverse-get-sender-origin.ts";
import { currentNativeMessageEventCallable,qualifyCurrentNativeEventConstructor,qualifyCurrentNativeMessageEventFunction } from "./current-native-message-event-metadata.ts";
import { currentFootprintInverseClockNativeCallable,qualifyCurrentFootprintInverseClockNativeFunction } from "./current-footprint-inverse-clock-native-metadata.ts";
import { qualifyCurrentNativeSerializedOriginPrototype } from "./current-native-serialized-origin.ts";
import type { CurrentFootprintInverseNativeGetTaskChannelOriginal as Original } from "./current-footprint-inverse-native-get-task-channel-controller.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_FORWARD_EXPRESSIONS as EXPRESSIONS } from "./current-footprint-inverse-native-get-task-forward-programs.ts";

interface Tuple{readonly id:string;readonly values:readonly Remote[];readonly packets:readonly unknown[]}
type CallRole=keyof typeof CALLS;
export interface CurrentFootprintInverseNativeGetTaskForwardBindings{
 readonly receipt:string;readonly root:string;readonly native:string;readonly nativeMembers:string;readonly original:Original;
 readonly scripts:Readonly<{ui:string;manager:string}>;readonly target:Readonly<{projectUuid:string;branchUuid:string;documentUuid:string}>;readonly workerUuid:string;
 readonly originalPromise:()=>Promise<string>;
 readonly current:()=>void;readonly request:(command:Command)=>Promise<unknown>;
 readonly armed:(role:keyof typeof POINTS,point:string)=>Promise<void>;
 readonly wait:()=>Promise<Held>;
 readonly resumed:()=>Promise<void>;
 readonly control:(role:"functions"|"armed"|"prepared"|"resumed"|"invocation-joined"|"post-returned"|"complete",data?:Readonly<Record<string,string>>)=>Promise<void>;
}
export interface CurrentFootprintInverseNativeGetTaskForwardReceipt{
 readonly channel:Channel;readonly prepared:string;readonly route:string;readonly innerFrame:string;readonly innerPromise:string;readonly outerPromise:string;readonly outerLocalPromise:string;
 readonly originalMessage:string;readonly originalPost:string;readonly nativeOrigin:string;readonly replyTopic:string;readonly uuid:string;readonly pushId:number;
 readonly onMessagePoint:string;readonly postReturnedPoint:string;readonly heldReturn:Held;readonly originalInvocationJoined:true;readonly nativePostReturned:true;readonly uiPacketCompleted:false;readonly getCompleted:false;
}
function need(condition:boolean):asserts condition{if(!condition){throw new Error("INVERSE_NATIVE_GET_TASK_FORWARD_SEQUENCE");}}
const empty=z.strictObject({});
const remote=z.strictObject({type:z.enum(["object","function","string","number","undefined"]),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:z.string().optional(),value:z.unknown().optional()});
const property=z.strictObject({name:z.string(),value:remote,writable:z.boolean(),enumerable:z.boolean(),configurable:z.boolean(),isOwn:z.literal(true)});
const promiseInternal=z.strictObject({name:z.enum(["[[Prototype]]","[[PromiseState]]","[[PromiseResult]]"]),value:remote});
const promisePacket=z.strictObject({result:z.array(property).length(0),internalProperties:z.array(promiseInternal).length(3)});
/** Preserve original live operands, serialized origin, queue message, both
 * genuine return Promises and native Event headers through one IGIVE return.
 * Keep that UI return paused; its queued local IGIVE callback is not resumed. */
export async function observeCurrentFootprintInverseNativeGetTaskForward(b:CurrentFootprintInverseNativeGetTaskForwardBindings):Promise<Readonly<CurrentFootprintInverseNativeGetTaskForwardReceipt>>{
 const identity=currentFootprintInverseLookupIdentity(b.target);
 /** Read one complete own-property packet under the same original invocation custody. */
 const props=async(id:string):Promise<unknown>=>{b.current();const raw=await b.request({phase:"inverse-native-get-task-forward-properties",method:"Runtime.getProperties",params:{objectId:id,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});b.current();return raw;};
 /** Submit only a closed role with retained references and its exact literal true flags. */
 const call=async(role:CallRole,refs:readonly string[],value?:string|typeof identity,receiver=b.receipt):Promise<unknown>=>{const row=CALLS[role];const args:unknown[]=refs.map(objectId=>({objectId}));if(row.value!==0){args.push({value});}b.current();const raw=await b.request(validate({phase:"inverse-native-get-task-forward-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:row.program,arguments:args,returnByValue:row.byValue}}));b.current();return raw;};
 /** Qualify the dense tuple and each new opaque member before any later traversal. */
 const tupleId=async(id:string,size:number):Promise<Tuple>=>{const values=array(await props(id),size);const packets:unknown[]=[];for(const value of values){if(value.type==="function"||value.type==="object"&&value.subtype!=="null"){const raw=await props(object(value));if(value.subtype==="promise"){promisePacket.parse(capture(raw));}else{properties(raw);}packets.push(raw);}else{packets.push(null);}}return{id,values,packets};};
 /** Join a fixed helper result to its complete metadata before exposing its members. */
 const tuple=async(role:CallRole,refs:readonly string[],size:number,value?:string|typeof identity,receiver=b.receipt):Promise<Tuple>=>{const raw=await call(role,refs,value,receiver);return tupleId(result(raw,size),size); };
 /** Project only the selected original live frame and qualify its new tuple metadata. */
 const frame=async(role:keyof typeof EXPRESSIONS,frameId:string,size:number):Promise<Tuple>=>{b.current();const id=result(await b.request({phase:"inverse-native-get-task-forward-frame",role,method:"Debugger.evaluateOnCallFrame",params:{callFrameId:frameId,expression:EXPRESSIONS[role],objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}}),size);b.current();return tupleId(id,size);};
 const channel=b.original.channel;
 const prepared={id:b.original.prepared,values:array(await props(b.original.prepared),5)};const reply=prepared.values[0];need(reply?.type==="string"&&typeof reply.value==="string");
 const origin=await collectCurrentFootprintInverseGetSenderOrigin({current:b.current,properties:props,call:(role,refs,original)=>call(`origin-${role}`,refs,original)});
 const eventCtors=await tuple("event-constructors",[b.receipt],5,undefined,b.root);const event=eventCtors.values[2];const message=eventCtors.values[3];need(event!==undefined&&message!==undefined);currentNativeMessageEventCallable({result:event},"Event");qualifyCurrentNativeEventConstructor(eventCtors.packets[2]);currentNativeMessageEventCallable({result:message},0);qualifyCurrentNativeMessageEventFunction(eventCtors.packets[3],0);
 for(const index of[2,3]){const fields=properties(eventCtors.packets[index]);const p=fields.find(field=>field.name==="prototype")?.value;need(p!==undefined);qualifyCurrentNativeSerializedOriginPrototype(await props(object(p)),p);}
 const points=new Map<keyof typeof POINTS,string>();
 /** Arm only an already source-qualified original post or listener function. */
 const functionPoint=async(role:"post"|"onMessage",objectId:string):Promise<string>=>{const raw=z.strictObject({breakpointId:z.string().min(1)}).parse(capture(await b.request({phase:"inverse-native-get-task-forward-function",role,method:"Debugger.setBreakpointOnFunctionCall",params:{objectId,condition:""}})));points.set(role,raw.breakpointId);await b.armed(role,raw.breakpointId);return raw.breakpointId;};
 /** Require the exact original source location; shifted breakpoints are refused. */
 const locationPoint=async(role:"innerReturned"|"postReturned"|"uiTimer"|"uiOuterReturned"):Promise<string>=>{const p=POINTS[role];const requested={scriptId:b.scripts[p.file],lineNumber:p.lineNumber,columnNumber:p.columnNumber};const raw=z.strictObject({breakpointId:z.string().min(1),actualLocation:z.strictObject({scriptId:z.string(),lineNumber:z.number(),columnNumber:z.number()})}).parse(capture(await b.request({phase:"inverse-native-get-task-forward-point",role,method:"Debugger.setBreakpoint",params:{location:requested,condition:""}})));need(raw.actualLocation.scriptId===requested.scriptId&&raw.actualLocation.lineNumber===requested.lineNumber&&raw.actualLocation.columnNumber===requested.columnNumber);points.set(role,raw.breakpointId);await b.armed(role,raw.breakpointId);return raw.breakpointId;};
 const methodIds=array(await props(channel.methods),22);const post=methodIds[6];const onMessage=methodIds[0];need(post!==undefined&&onMessage!==undefined);
 await b.control("functions",{post:object(post),onMessage:object(onMessage),uiScript:b.scripts.ui,managerScript:b.scripts.manager});
 await functionPoint("post",object(post));const onMessagePoint=await functionPoint("onMessage",object(onMessage));await locationPoint("innerReturned");await locationPoint("postReturned");await locationPoint("uiTimer");await locationPoint("uiOuterReturned");
 /** Remove only the selected original breakpoint through the finite native lane. */
 const remove=async(point:string):Promise<void>=>{empty.parse(capture(await b.request({phase:"inverse-native-get-task-forward-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:point}})));};
 /** Spend one retained point after its original boundary has been qualified. */
 const retire=async(role:keyof typeof POINTS):Promise<void>=>{const point=points.get(role);need(point!==undefined);await remove(point);points.delete(role);};
 /** Join the real resumed event after the literal resume acknowledgement. */
 const resume=async():Promise<void>=>{b.current();empty.parse(capture(await b.request({phase:"inverse-native-get-task-forward-resume",method:"Debugger.resume",params:{}})));await b.resumed();b.current();};
 /** Require the next actual original pause to have the expected source role. */
 const waitNext=async(role:keyof typeof POINTS):Promise<Held>=>{const held=await b.wait();need(held.role===role);return held;};
 /** Retain and qualify the original pending return Promise without awaiting or replacing it. */
 const keepPromise=async(held:Held):Promise<string>=>{need(held.returnPromise!==null);const raw=promisePacket.parse(capture(await props(held.returnPromise)));const fields=new Map(raw.internalProperties.map(item=>[item.name,item.value]));need(fields.size===3&&fields.get("[[PromiseState]]")?.value==="pending"&&fields.get("[[PromiseResult]]")?.type==="undefined");truth(await call("send-promise",[held.returnPromise,b.nativeMembers]));const retained=z.strictObject({result:remote}).parse(capture(await call("send-retain",[],undefined,held.returnPromise))).result;need(retained.type==="object"&&retained.subtype==="promise");const id=object(retained);promisePacket.parse(capture(await props(id)));return id;};
 /** Reproject already-qualified live operands without traversing any new opaque member. */
 const liveFrame=async(role:"inner"|"caller",frameId:string,size:number):Promise<string>=>{b.current();const id=result(await b.request({phase:"inverse-native-get-task-forward-frame",role,method:"Debugger.evaluateOnCallFrame",params:{callFrameId:frameId,expression:EXPRESSIONS[role],objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}}),size);b.current();array(await props(id),size);return id;};
 const freshInner=await liveFrame("inner",b.original.frame,17); const freshCaller=await liveFrame("caller",b.original.caller,5);const innerId=result(await call("before",[freshInner,b.original.lexicals,freshCaller,b.original.callerLexicals,prepared.id]),7);array(await props(innerId),7);const inner={id:innerId};
 await b.control("prepared");await remove(b.original.point);await origin.reprove();empty.parse(capture(await b.request({phase:"inverse-native-get-task-forward-exceptions",method:"Debugger.setPauseOnExceptions",params:{state:"all"}})));await resume();
 let finalHeld:Held|null=null;let invocationJoined=false;
 let originalMessage:string|null=null;let originalPost:string|null=null;const localPosts:Tuple[]=[];let seenWhoHas=false;let localCount=0;
 /** Join the original queue/message identities before each permitted IHAVE or IGIVE post and its actual normal return. */
 const postOne=async(held:Held,expected:"IHAVE"|"IGIVE"):Promise<void>=>{need(held.role==="post");if(expected==="IHAVE"){if(localPosts.length===0){need(!seenWhoHas&&localCount===0);}else{need(localPosts.length===1&&seenWhoHas&&localCount===1);}}else{need(seenWhoHas&&localPosts.length===2&&localCount===2&&invocationJoined);}const entry=await frame("post",held.frame,2);const captured=await tuple("send-postRoots",[entry.id,channel.roots,prepared.id],4);const fields=properties(captured.packets[0]);const kind=fields.find(field=>field.name==="type")?.value;need(kind?.type==="string"&&kind.value===expected);const items=await tuple("send-queueItem",[captured.id],3);const wrapper=await tuple("send-queuedMessage",[captured.id,items.id,prepared.id],2);if(expected==="IHAVE"){const stable=await tuple("send-message",[wrapper.id,inner.id,prepared.id],4);if(originalMessage===null){originalMessage=stable.id;}else{const old=array(await props(originalMessage),4);need(old[2]?.value===stable.values[2]?.value);}localPosts.push(entry);}else{need(originalMessage!==null);truth(await call("send-sameMessage",[wrapper.id,originalMessage,captured.id],b.workerUuid));originalPost=entry.id;await retire("post");}
   await resume();const returned=await waitNext("postReturned");const returnedFrame=await frame("post",returned.frame,2);truth(await call("send-samePost",[returnedFrame.id,captured.id,prepared.id,channel.roots]));if(expected==="IGIVE"){need(invocationJoined);await origin.reprove();await b.control("post-returned");finalHeld=returned;}else{await resume();}
 };
 await postOne(await waitNext("post"),"IHAVE");const innerReturn=await waitNext("innerReturned");const innerPromise=await keepPromise(innerReturn);await retire("innerReturned");await resume();
 const timerRole="uiTimer";const timerHeld=await waitNext(timerRole);const timer=await frame(timerRole,timerHeld.frame,5);for(const index of[0,1]){const fn=timer.values[index];need(fn!==undefined);currentFootprintInverseClockNativeCallable({result:fn},10);qualifyCurrentFootprintInverseClockNativeFunction(timer.packets[index],10);}truth(await call("send-timer",[timer.id,b.native,prepared.id]));need(timerHeld.caller!==null);const localPromise=await frame("uiOuterLocal",timerHeld.caller,1);const outerLocal=localPromise.values[0];need(outerLocal!==undefined);const outerLocalPromise=object(outerLocal);truth(await call("send-promise",[outerLocalPromise,b.nativeMembers]));await retire(timerRole);await resume();
 const outerRole="uiOuterReturned";const outerReturn=await waitNext(outerRole);const outerPromise=await keepPromise(outerReturn);await retire(outerRole);await resume();
 const originalPromise=await b.originalPromise();b.current();truth(await call("send-promise",[originalPromise,b.nativeMembers]));truth(await call("samePromise",[originalPromise,outerPromise,outerLocalPromise,b.nativeMembers]));await b.control("invocation-joined");b.current();invocationJoined=true;
 for(let count=0;count<5;count+=1){const incomingHeld=await waitNext("onMessage");const incoming=await frame("incoming",incomingHeld.frame,2);if(incomingHeld.onMessageKind==="local"){need(localCount<localPosts.length);const posted=localPosts[localCount];need(posted!==undefined);truth(await call("send-local",[incoming.id,posted.id,channel.roots,prepared.id]));localCount+=1;await resume();}else{
   need(incomingHeld.onMessageKind==="native"&&incomingHeld.caller!==null);const listener=await frame("nativeListener",incomingHeld.caller,2);const eventValue=listener.values[1];need(eventValue!==undefined);const members=await tuple("event-members",[object(eventValue)],12,undefined,eventCtors.id);for(let index=0;index<8;index+=1){const fn=members.values[index+3];need(fn!==undefined);currentNativeMessageEventCallable({result:fn},index+1);qualifyCurrentNativeMessageEventFunction(members.packets[index+3],index+1);}const opaque=await tuple("event-opaque",[channel.broadcastChannel],5,undefined,members.id);need(opaque.values[3]?.type==="string"&&opaque.values[3].value===origin.origin);truth(await call("send-incoming",[incoming.id,opaque.id,channel.roots,prepared.id]));const envelope=properties(opaque.packets[2]);const type=envelope.find(field=>field.name==="type")?.value;const uuid=envelope.find(field=>field.name==="uuid")?.value;need(uuid?.value===b.workerUuid&&type?.type==="string");if(type.value==="WHOHAS"){need(!seenWhoHas&&localPosts.length===1&&localCount===1);seenWhoHas=true;await resume();await postOne(await waitNext("post"),"IHAVE");}else{need(type.value==="INEED"&&seenWhoHas&&localPosts.length===2&&localCount===2);await resume();await postOne(await waitNext("post"),"IGIVE");need(originalMessage!==null&&originalPost!==null&&finalHeld!==null&&invocationJoined);await b.control("complete",{parentUuid:channel.uuid,workerUuid:b.workerUuid,replyTopic:reply.value,nativeOrigin:origin.origin,pushId:String(channel.pushCnt),footprintUuid:identity.documentUuid});return Object.freeze({channel,prepared:prepared.id,route:b.original.route,innerFrame:inner.id,innerPromise,outerPromise,outerLocalPromise,originalMessage,originalPost,nativeOrigin:origin.origin,replyTopic:reply.value,uuid:channel.uuid,pushId:channel.pushCnt,onMessagePoint,postReturnedPoint:points.get("postReturned")??"",heldReturn:finalHeld,originalInvocationJoined:true,nativePostReturned:true,uiPacketCompleted:false,getCompleted:false});}}
 }
 throw new Error("INVERSE_NATIVE_GET_TASK_FORWARD_EVENT_BOUND");
}
