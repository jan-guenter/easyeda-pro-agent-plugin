/* oxlint-disable import/max-dependencies -- Original paused stack, fixed encoder/RPC/native Event comparison data remain independent inputs. */
/** Read only this native DEL's actual before-qe event, fresh encoder instance,
 * original RPC packet and trusted native envelope. The clock remains uncalled. */
import type {z} from "zod";
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_DELETE_ENTRY_FLAGS as ENTRY_FLAGS,currentFootprintInverseDeleteEntryPause as entryFrame,currentFootprintInverseDeleteEntryObject as entryObject,currentFootprintInverseDeleteEntryReproved as entryTrue,currentFootprintInverseDeleteEntryInstance as instance} from "./current-footprint-inverse-delete-entry-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_DELETE_ENTRY_PROGRAMS as ENTRY,CURRENT_FOOTPRINT_INVERSE_DELETE_ENTRY_EXPRESSION as ENTRY_EXPRESSION} from "./current-footprint-inverse-delete-entry-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_DELETE_JOB_FLAGS as JOB_FLAGS} from "./current-footprint-inverse-delete-job-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_DELETE_JOB_PROGRAMS as JOB,CURRENT_FOOTPRINT_INVERSE_DELETE_JOB_EXPRESSION as JOB_EXPRESSION} from "./current-footprint-inverse-delete-job-programs.ts";
import {currentFootprintInverseDeleteJobFrame as jobFrame} from "./current-footprint-inverse-delete-job-replies.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELIVERY_FLAGS as EVENT_FLAGS} from "./current-footprint-inverse-native-delivery-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELIVERY_PROGRAMS as EVENT,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELIVERY_EXPRESSION as EVENT_EXPRESSION} from "./current-footprint-inverse-native-delivery-programs.ts";
import {currentFootprintInverseDeleteNativeDeliveryFrame as nativeFrame} from "./current-footprint-inverse-delete-native-event-replies.ts";
import {qualifyCurrentFootprintInverseNativeDeliveryEvent as qualifyEvent} from "./current-footprint-inverse-native-delivery-replies.ts";
import type {currentFootprintInverseNativeDeliveryExpectedSchema} from "./current-footprint-inverse-native-delivery-replies.ts";
import {currentNativeMessageEventCallable as callable,qualifyCurrentNativeMessageEventFunction as metadata} from "./current-native-message-event-metadata.ts";
import {decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as result} from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {currentFootprintInverseDeleteRpcTrue as truth} from "./current-footprint-inverse-delete-rpc-protocol.ts";
import {currentFootprintInverseNativeDeleteExecutionAcceptProgram as program,validateCurrentFootprintInverseNativeDeleteExecutionAcceptCommand as validate} from "./current-footprint-inverse-native-delete-execution-accept-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionAcceptCommand as Command} from "./current-footprint-inverse-native-delete-execution-accept-protocol.ts";

interface Bindings{
 readonly event:DiagnosticEvent;readonly point:string;readonly sessionId:string;readonly scriptId:string;
 readonly original:string;readonly encoder:string;readonly clock:string;
 readonly rpc:Readonly<{prelude:string;link:string;bound:string}>;
 readonly channel:Readonly<{bound:string;events:string}>;readonly intrinsics:string;
 readonly expected:Readonly<z.infer<typeof currentFootprintInverseNativeDeliveryExpectedSchema>>;
 readonly current:()=>void;readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;
 readonly request:(command:Command)=>Promise<unknown>;readonly qualifyHelper:(command:Command)=>Promise<void>;
}
export interface CurrentFootprintInverseNativeDeleteExecutionAcceptedData{
 readonly entryProof:string;readonly instance:string;readonly jobProof:string;readonly deliveryProof:string;
 /** Actual arrays already read from this same original paused stack. Later
  * caller custody must retain these references instead of reconstructing them. */
 readonly serviceTuple:string;readonly eventTuple:string;
 readonly normal:24;readonly helpers:10;readonly workerClockAuthorized:false;readonly runtimeJobIssued:false;
}
function need(v:boolean):asserts v{if(!v){throw new Error("INVERSE_NATIVE_DELETE_ACCEPT_SEQUENCE");}}
/** Join all live operands before any qe/clock continuation. Caller-supplied
 * expected envelope data alone cannot supply original event or Job custody. */
export async function collectCurrentFootprintInverseNativeDeleteExecutionAccept(b:Bindings):Promise<Readonly<CurrentFootprintInverseNativeDeleteExecutionAcceptedData>>{
 const current=():void=>{b.current();b.assertOriginalEvent(b.event);};current();let helpers=0,normal=0;
 const frame=entryFrame(b.event,b.sessionId,b.scriptId,b.point);const service=jobFrame(b.event,b.sessionId,b.scriptId,b.point);const listener=nativeFrame(b.event,b.sessionId,b.scriptId,b.point);
 const send=async(input:Command):Promise<unknown>=>{current();const command=validate(input);need((normal+=1)<=24);const raw=await b.request(command);current();if(program(command)!==null){need((helpers+=1)<=10);await b.qualifyHelper(command);current();}return raw;};
 const flags=ENTRY_FLAGS;
 const entry=entryObject(await send({stage:"entry",command:{phase:"inverse-delete-entry-frame",method:"Debugger.evaluateOnCallFrame",params:{callFrameId:frame,expression:ENTRY_EXPRESSION,objectGroup:flags.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}}}),5);
 const entryProof=entryObject(await send({stage:"entry",command:{phase:"inverse-delete-entry-capture",method:"Runtime.callFunctionOn",params:{...flags,objectId:entry,functionDeclaration:ENTRY.capture,arguments:[{objectId:b.original},{objectId:b.encoder},{objectId:b.clock}],returnByValue:false}}}),3);
 const actualInstance=instance(await send({stage:"entry",command:{phase:"inverse-delete-entry-tuple",method:"Runtime.getProperties",params:{objectId:entryProof,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}}));
 entryTrue(await send({stage:"entry",command:{phase:"inverse-delete-entry-reprove",method:"Runtime.callFunctionOn",params:{...flags,objectId:entryProof,functionDeclaration:ENTRY.reprove,arguments:[],returnByValue:true}}}));
 const serviceTuple=result(await send({stage:"job",command:{phase:"inverse-delete-job-frame",method:"Debugger.evaluateOnCallFrame",params:{callFrameId:service,expression:JOB_EXPRESSION,objectGroup:JOB_FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}}}),7);
 const jobProof=result(await send({stage:"job",command:{phase:"inverse-delete-job-capture",method:"Runtime.callFunctionOn",params:{...JOB_FLAGS,objectId:serviceTuple,functionDeclaration:JOB.capture,arguments:[{objectId:b.rpc.prelude},{objectId:b.rpc.link},{objectId:b.rpc.bound},{objectId:actualInstance},{value:{replyTopic:b.expected.nativeEnvelope.message.replyTopic}}],returnByValue:false}}}),3);
 const jobValues=array(await send({stage:"job",command:{phase:"inverse-delete-job-properties",method:"Runtime.getProperties",params:{objectId:jobProof,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}}),3);need(jobValues.get("0")?.subtype==="array"&&jobValues.get("1")?.subtype==="array"&&jobValues.get("2")?.type==="function");
 truth(await send({stage:"job",command:{phase:"inverse-delete-job-reprove",method:"Runtime.callFunctionOn",params:{...JOB_FLAGS,objectId:jobProof,functionDeclaration:JOB.reprove,arguments:[],returnByValue:true}}}));
 const properties=(role:string,objectId:string):Promise<unknown>=>send(validate({stage:"delivery",command:{phase:`inverse-native-delivery-properties-${role}`,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}}));
 const eventTuple=result(await send({stage:"delivery",command:{phase:"inverse-native-delivery-frame",method:"Debugger.evaluateOnCallFrame",params:{callFrameId:listener,expression:EVENT_EXPRESSION,objectGroup:EVENT_FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}}}),2);
 const eventValues=array(await properties("frame",eventTuple),2),native=eventValues.get("1");need(native?.type==="object"&&native.className==="MessageEvent"&&native.description==="MessageEvent"&&native.subtype===undefined&&native.objectId!==undefined);qualifyEvent(await properties("event",native.objectId));
 const members=result(await send({stage:"delivery",command:{phase:"inverse-native-delivery-members",method:"Runtime.callFunctionOn",params:{...EVENT_FLAGS,objectId:b.channel.events,functionDeclaration:EVENT.members,arguments:[{objectId:native.objectId}],returnByValue:false}}}),12);
 const memberValues=array(await properties("members",members),12);for(const[index,role]of ["target","type","trusted","data","origin","source","current-target","event-phase"].entries()){const getter=memberValues.get(String(index+3));need(getter!==undefined);metadata(await properties(role,callable({result:getter},index+1)),index+1);}
 const deliveryProof=result(await send({stage:"delivery",command:{phase:"inverse-native-delivery-capture",method:"Runtime.callFunctionOn",params:{...EVENT_FLAGS,objectId:eventTuple,functionDeclaration:EVENT.capture,arguments:[{objectId:b.intrinsics},{objectId:b.channel.bound},{objectId:jobProof},{objectId:members},{value:b.expected}],returnByValue:false}}}),8);
 const values=array(await properties("proof",deliveryProof),8);need(values.get("7")?.type==="function");
 truth(await send({stage:"delivery",command:{phase:"inverse-native-delivery-reprove",method:"Runtime.callFunctionOn",params:{...EVENT_FLAGS,objectId:deliveryProof,functionDeclaration:EVENT.reprove,arguments:[],returnByValue:true}}}));current();need(normal===24&&helpers===10);
 return Object.freeze({entryProof,instance:actualInstance,jobProof,deliveryProof,serviceTuple,eventTuple,normal:24,helpers:10,workerClockAuthorized:false,runtimeJobIssued:false});
}
