/* oxlint-disable import/max-dependencies -- Original fixed programs, initialized UI metadata, native resolver/Promise identities and held schematic observations remain separate proof inputs. */
/** Complete original schematic UI return. No public/yw frame, fabricated next
 * RPC or worker completion is introduced for this worker-free query. */
import {z} from "zod";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_SCHEMATIC_CALLS as CALLS,CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_SCHEMATIC_FLAGS as FLAGS,validateCurrentFootprintInverseNativeReferenceSchematicCommand as validate} from "./current-footprint-inverse-native-reference-schematic-protocol.ts";
import type {CurrentFootprintInverseNativeReferenceSchematicCommand as Command} from "./current-footprint-inverse-native-reference-schematic-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_SCHEMATIC_EXPRESSIONS as EXPRESSIONS,CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_SCHEMATIC_POINTS as POINTS} from "./current-footprint-inverse-native-reference-schematic-programs.ts";
import type {CurrentFootprintInverseNativeReferenceSchematicHeld as Held} from "./current-footprint-inverse-native-reference-schematic-replies.ts";
import type {CurrentFootprintInverseNativeReferenceSchematicBodyReceipt as Body,CurrentFootprintInverseNativeReferenceSchematicCallback as Callback} from "./current-footprint-inverse-native-reference-schematic-body-observer.ts";
import type {CurrentFootprintInverseNativeReferenceNextSenderPrepared as Sender} from "./current-footprint-inverse-native-reference-next-sender-collector.ts";
import {currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type {CurrentFootprintInverseLookupRemote as Remote} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import {requireCurrentFootprintInversePublicServiceTrue as truth} from "./current-footprint-inverse-public-service-replies.ts";
import {captureCurrentFootprintInversePreferenceReply as capture} from "./current-footprint-inverse-public-preferences-replies.ts";
import {requireCurrentFootprintInverseInitializedGetDescription as description} from "./current-footprint-inverse-initialized-get-source.ts";
import {decodeCurrentFootprintInverseInitializedGetFunction as metadata} from "./current-footprint-inverse-initialized-get-replies.ts";
import {qualifyCurrentFootprintInverseLookupNativeMethod as nativeMethod} from "./current-footprint-inverse-lookup-native-metadata.ts";

interface Tuple{readonly id:string;readonly values:readonly Remote[];readonly packets:readonly unknown[]}
export interface CurrentFootprintInverseNativeReferenceSchematicResultBindings{
 readonly receipt:string;readonly native:string;readonly nativeMembers:string;readonly nativeQualified:string;
 readonly target:Readonly<{projectUuid:string;branchUuid:string;documentUuid:string}>;readonly scripts:Readonly<{ui:string;manager:string;schematic:string}>;
 readonly sender:Sender;readonly module:string;readonly callback:Callback;readonly body:Body;
 readonly current:()=>void;readonly request:(command:Command)=>Promise<unknown>;readonly armed:(role:keyof typeof POINTS,point:string)=>Promise<void>;readonly wait:()=>Promise<Held>;readonly resumed:()=>Promise<void>;readonly poll:()=>Promise<void>;
 readonly originalInvocationPromise:()=>Promise<string>;
 readonly control:(phase:"result-functions"|"result-prepared"|"complete",fields?:Readonly<Record<string,string>>)=>Promise<void>;
}
export interface CurrentFootprintInverseNativeReferenceSchematicReceipt{
 readonly schema:"private.inverse-native-reference-schematic-observations.v1";readonly rawEmpty:string;readonly clonedEmpty:string;
 readonly roots:string;readonly tasks:string;readonly callbacks:string;readonly invocationPromise:string;
 readonly originalSchematicEmptyReturnJoined:true;readonly originalHandlerPromiseJoined:true;readonly originalCloneAndResolverJoined:true;readonly originalCallbackReturned:true;readonly originalInvocationJoined:true;
 readonly nativeTaskInternalBackend:true;readonly publicUiRowParity:false;readonly deletionAuthorized:false;readonly saveAuthorized:false;
}
const empty=z.strictObject({});
const remote=z.looseObject({type:z.enum(["object","function","string","number","boolean","undefined"]),subtype:z.string().optional(),objectId:z.string().optional(),value:z.unknown().optional()});
const emptyProperties=z.array(z.unknown()).length(0);
const promiseInternal=z.strictObject({name:z.enum(["[[Prototype]]","[[PromiseState]]","[[PromiseResult]]"]),value:remote});
const promisePacket=z.strictObject({result:emptyProperties,internalProperties:z.array(promiseInternal).length(3)});
function need(v:boolean):asserts v{if(!v){throw new Error("INVERSE_NATIVE_SCHEMATIC_RESULT");}}
export async function observeCurrentFootprintInverseNativeReferenceSchematicResult(b:CurrentFootprintInverseNativeReferenceSchematicResultBindings):Promise<Readonly<CurrentFootprintInverseNativeReferenceSchematicReceipt>>{
 const props=async(id:string):Promise<unknown>=>{b.current();const raw=await b.request({phase:"inverse-native-reference-schematic-properties",method:"Runtime.getProperties",params:{objectId:id,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});b.current();return raw;};
 const call=async(role:keyof typeof CALLS,refs:readonly string[]):Promise<unknown>=>{const row=CALLS[role];const args:unknown[]=refs.map(objectId=>({objectId}));if(row.value===1){args.push({value:b.target});}b.current();const raw=await b.request(validate({phase:"inverse-native-reference-schematic-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:b.receipt,functionDeclaration:row.program,arguments:args,returnByValue:row.byValue}}));b.current();return raw;};
 const idTuple=async(id:string,size:number):Promise<Tuple>=>{const values=array(await props(id),size);const packets:unknown[]=[];for(const value of values){if(value.type==="function"||value.type==="object"&&value.subtype!=="null"){const raw=await props(object(value));if(value.subtype==="promise"){promisePacket.parse(capture(raw));}else{properties(raw);}packets.push(raw);}else{packets.push(null);}}return Object.freeze({id,values,packets:Object.freeze(packets)});};
 const tuple=async(role:keyof typeof CALLS,refs:readonly string[],size:number):Promise<Tuple>=>idTuple(result(await call(role,refs),size),size);
 const frame=async(role:keyof typeof EXPRESSIONS,id:string,size:number):Promise<Tuple>=>idTuple(result(await b.request({phase:"inverse-native-reference-schematic-frame",role,method:"Debugger.evaluateOnCallFrame",params:{callFrameId:id,expression:EXPRESSIONS[role],objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}}),size),size);
 const target=async():Promise<void>=>{const raw=await call("target",[b.sender.roots,b.sender.context,b.sender.prepared]);truth(raw);};
 const native=async():Promise<void>=>{truth(await call("nativeInstance",[b.native,b.nativeMembers,b.nativeQualified]));truth(await call("nativeHooks",[b.native,b.nativeMembers]));};
 const views=await tuple("views",[b.sender.roots,b.sender.context,b.sender.bus,b.sender.methods,b.sender.task,b.sender.members,b.sender.taskMethods,b.sender.prepared,b.module,b.native],5);
 const view=(index:number,size:number):Promise<Tuple>=>{const value=views.values[index];need(value!==undefined);return idTuple(object(value),size);};
 const outer=await view(0,6);const module=await view(1,14);const methods=await view(2,13);const task=await view(3,2);const members=await view(4,3);await target();
 const replyState=await tuple("replyState",[b.sender.prepared],2);
 const roots=await tuple("roots",[outer.id,module.id,methods.id,replyState.id,b.callback.prepared,b.native,b.nativeMembers,b.body.emptyStoreGuard],8);
 const tasks=await tuple("tasks",[roots.id],2);const callbacks=await tuple("callbacks",[roots.id,tasks.id,task.id,members.id,module.id,methods.id],3);
 const callback=callbacks.values[1];need(callback?.type==="function"&&typeof callback.description==="string");description(callback.description,"uiBusRpcCallCallback2");metadata(callbacks.packets[1],"uiBusRpcCallCallback2",b.scripts.ui);
 const reply=methods.values[8];const execute=methods.values[11];need(reply!==undefined&&execute!==undefined);
 await b.control("result-functions",{reply:object(reply),execute:object(execute),callback:object(callback),uiScript:b.scripts.ui});
 const points=new Map<keyof typeof POINTS,string>();
 const arm=async(role:"reply"|"execute"|"callback"|"callbackReturned",objectId?:string):Promise<void>=>{const p=POINTS[role];const raw=await b.request(objectId===undefined?{phase:"inverse-native-reference-schematic-point",role:"callbackReturned",method:"Debugger.setBreakpoint",params:{location:{scriptId:b.scripts.ui,lineNumber:p.line,columnNumber:p.pc},condition:""}}:{phase:"inverse-native-reference-schematic-function",role:role==="callbackReturned"?"callback":role,method:"Debugger.setBreakpointOnFunctionCall",params:{objectId,condition:""}});b.current();const parsed=z.strictObject({breakpointId:z.string().min(1),actualLocation:z.strictObject({scriptId:z.string(),lineNumber:z.number(),columnNumber:z.number()}).optional()}).parse(capture(raw));if(objectId===undefined){need(parsed.actualLocation?.scriptId===b.scripts.ui&&parsed.actualLocation.lineNumber===p.line&&parsed.actualLocation.columnNumber===p.pc);}points.set(role,parsed.breakpointId);await b.armed(role,parsed.breakpointId);b.current();};
 await arm("reply",object(reply));await arm("execute",object(execute));await arm("callback",object(callback));await arm("callbackReturned");
 const raw=await tuple("empty",[b.body.returnedRow,b.native],2);array(await props(b.body.returnedRow),0);await target();await native();await b.control("result-prepared");
 const remove=async(point:string):Promise<void>=>{b.current();empty.parse(capture(await b.request({phase:"inverse-native-reference-schematic-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:point}})));b.current();};
 const retire=async(role:keyof typeof POINTS):Promise<void>=>{const point=points.get(role);need(point!==undefined);await remove(point);points.delete(role);};
 const resume=async():Promise<void>=>{b.current();await target();await native();empty.parse(capture(await b.request({phase:"inverse-native-reference-schematic-resume",method:"Debugger.resume",params:{}})));b.current();await b.resumed();b.current();};
 const fulfilled=async(id:string):Promise<Remote>=>{truth(await call("promise",[id,b.nativeMembers]));const packet=promisePacket.parse(capture(await props(id)));const slots=new Map(packet.internalProperties.map(row=>[row.name,row.value]));need(slots.size===3&&slots.get("[[PromiseState]]")?.value==="fulfilled");const value=slots.get("[[PromiseResult]]");need(value!==undefined);if(value.type==="object"){properties(await props(object(value)));}return value;};
 const handlerValue=await fulfilled(b.body.handlerPromise);truth(await call("same",[object(handlerValue),b.body.returnedRow]));
 await remove(b.body.startPoint);await resume();
 const replyHeld=await b.wait();need(replyHeld.role==="reply");const replyFrame=await frame("reply",replyHeld.frame,13);truth(await call("replyLive",[replyFrame.id,roots.id,raw.id,module.id]));await retire("reply");await resume();
 const executeHeld=await b.wait();need(executeHeld.role==="execute"&&executeHeld.push!==null);const executeFrame=await frame("execute",executeHeld.frame,6),executePush=await frame("push",executeHeld.push,5);truth(await call("executeLive",[executeFrame.id,executePush.id,roots.id,tasks.id,module.id,raw.id]));truth(await call("emptyReprove",[raw.id]));await retire("execute");await resume();
 const callbackHeld=await b.wait();need(callbackHeld.role==="callback"&&callbackHeld.caller!==null&&callbackHeld.push!==null);const callbackFrame=await frame("callback",callbackHeld.frame,5),caller=await frame("execute",callbackHeld.caller,6),push=await frame("push",callbackHeld.push,5);const resolver=await tuple("callbackLive",[callbackFrame.id,caller.id,push.id,roots.id,tasks.id,module.id,raw.id],1);const fn=resolver.values[0];const clone=callbackFrame.values[0];need(fn!==undefined&&clone!==undefined);nativeMethod(resolver.packets[0],fn,"resolver");const cloned=await tuple("empty",[object(clone),b.native],2);array(await props(object(clone)),0);await retire("callback");await resume();
 const returned=await b.wait();need(returned.role==="callbackReturned"&&returned.caller!==null&&returned.push!==null);const finalFrame=await frame("callback",returned.frame,5);const finalExecute=await frame("execute",returned.caller,6);const finalPush=await frame("push",returned.push,5);const finalResolver=await tuple("callbackLive",[finalFrame.id,finalExecute.id,finalPush.id,roots.id,tasks.id,module.id,raw.id],1);const sameResolver=finalResolver.values[0],sameRow=finalFrame.values[0];need(sameResolver!==undefined&&sameRow!==undefined);truth(await call("same",[object(sameResolver),object(fn)]));truth(await call("same",[object(sameRow),object(clone)]));await retire("callbackReturned");await resume();await b.poll();b.current();
 const invocation=await b.originalInvocationPromise();b.current();truth(await call("same",[invocation,b.body.outerPromise]));
 for(const id of[b.body.outerLocalPromise,b.body.outerPromise,invocation]){const value=await fulfilled(id);truth(await call("outerResult",[object(value),object(clone)]));}
 for(const proof of[raw.id,cloned.id]){truth(await call("emptyReprove",[proof]));}truth(await call("final",[roots.id,tasks.id,callbacks.id,b.callback.prepared,b.body.emptyStoreGuard]));await target();await native();await b.control("complete");b.current();
 return Object.freeze({schema:"private.inverse-native-reference-schematic-observations.v1",rawEmpty:raw.id,clonedEmpty:cloned.id,roots:roots.id,tasks:tasks.id,callbacks:callbacks.id,invocationPromise:invocation,originalSchematicEmptyReturnJoined:true,originalHandlerPromiseJoined:true,originalCloneAndResolverJoined:true,originalCallbackReturned:true,originalInvocationJoined:true,nativeTaskInternalBackend:true,publicUiRowParity:false,deletionAuthorized:false,saveAuthorized:false});
}
