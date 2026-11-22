/* oxlint-disable import/max-dependencies -- Whole worker source, script metadata, native BC metadata, source-owned queues and original construction bindings stay independently checked. */
/** Fresh same-worker native channel and registered service recipe. Only the
 * actual construction owner may supply its original receiver handles. This
 * data collector neither publishes nor grants a UI or worker continuation. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_REQUESTS} from "./current-footprint-inverse-native-delete-cold-ui-request-budgets.ts";
import {types} from "node:util";
import {CURRENT_FOOTPRINT_INVERSE_GET_CHANNEL_SOURCE_METHOD_ROLES as METHODS} from "./current-footprint-inverse-get-channel-programs.ts";
import {currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type {CurrentFootprintInverseLookupRemote as Remote} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import {decodeCurrentFootprintInverseFunctionMetadata as metadata} from "./current-footprint-inverse-initialized-get-replies.ts";
import {currentFootprintInverseGetRpcEntryScope as scriptScope} from "./current-footprint-inverse-get-rpc-entry-replies.ts";
import {currentFootprintInverseGetForwardingClosure as closure} from "./current-footprint-inverse-get-forwarding-collector.ts";
import {currentFootprintInverseNativeChannelEventTarget as eventTarget,qualifyCurrentFootprintInverseNativeChannelEventTarget as qualifyEventTarget} from "./current-footprint-inverse-native-channel-metadata.ts";
import {currentFootprintInverseClockNativeCallable as nativeCallable,qualifyCurrentFootprintInverseClockNativeFunction as nativeMetadata} from "./current-footprint-inverse-clock-native-metadata.ts";
import {currentFootprintInverseGetCallable as handlerCallable,qualifyCurrentFootprintInverseGetFunction as handlerMetadata} from "./current-footprint-inverse-get-source.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_FLAGS as FLAGS,currentFootprintInverseNativeDeleteColdUiCallSpec as spec,validateCurrentFootprintInverseNativeDeleteColdUiCommand as validate} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiCommand as Command} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_SOURCE as SOURCE,requireCurrentFootprintInverseNativeDeleteColdUiWorkerDescription as description,qualifyCurrentFootprintInverseNativeDeleteColdUiWorkerSource as qualify} from "./current-footprint-inverse-native-delete-cold-ui-worker-source.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiWorkerRole as SourceRole} from "./current-footprint-inverse-native-delete-cold-ui-worker-source.ts";
import {isCurrentFootprintInverseNativeDeleteColdUiWorkerCallRole as isRole} from "./current-footprint-inverse-native-delete-cold-ui-worker-programs.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiWorkerCallRole as Role} from "./current-footprint-inverse-native-delete-cold-ui-worker-programs.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiPrimitives as Primitives} from "./current-footprint-inverse-native-delete-cold-ui-primitive-collector.ts";

interface Bindings{
 readonly originalProject:string;readonly originalProof:string;
 readonly source:string;readonly scriptId:string;readonly expectedChannelName:string;readonly primitives:Primitives;
 readonly target:Readonly<{projectUuid:string;branchUuid:string;documentUuid:string}>;
 readonly current:()=>void;readonly request:(command:Command)=>Promise<unknown>;readonly qualifyHelper:(command:Command)=>Promise<void>;
}
interface Tuple{readonly id:string;readonly values:readonly Remote[];readonly packets:readonly unknown[]}
export interface CurrentFootprintInverseNativeDeleteColdUiWorker{
 readonly profile:"private.current-footprint-inverse-native-delete-cold-ui-worker.v1";
 readonly project:string;readonly bus:string;readonly channel:string;readonly onmessage:string;readonly service:string;readonly handler:string;readonly getNeedData:string;
 readonly channelName:string;readonly senderUuid:string;readonly applicationMethodInvoked:false;readonly bodyAuthorized:false;readonly executionAuthorized:false;
}
const originals=new WeakMap<CurrentFootprintInverseNativeDeleteColdUiWorker,Bindings>();
/** Fixed channel90+service14+same1+name1+method3, with13+4+1+1 helper
 * sources. The service pull's true unsafe flag is derived from new wu(t,!0),
 * not borrowed from the distinct classic UI Task's false unsafe setting. */
export {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_REQUESTS} from "./current-footprint-inverse-native-delete-cold-ui-request-budgets.ts";
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_WORKER");}}
export async function collectCurrentFootprintInverseNativeDeleteColdUiWorker(bindings:Bindings):Promise<CurrentFootprintInverseNativeDeleteColdUiWorker>{
 qualify(bindings.source);const b=Object.freeze({...bindings,target:Object.freeze({...bindings.target})});let normal=0;let helpers=0;
 const send=async(input:Command):Promise<unknown>=>{
  b.current();const command=validate(input);need(command.method==="Runtime.getProperties"||command.method==="Runtime.callFunctionOn"&&(isRole(command.role)||command.role==="same"));
  need(normal<CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_REQUESTS.normal);normal+=1;b.current();const raw=await b.request(command);b.current();
  if(command.method==="Runtime.callFunctionOn"){need(helpers<CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_WORKER_REQUESTS.helpers);helpers+=1;b.current();await b.qualifyHelper(command);b.current();}return raw;
 };
 const props=(objectId:string):Promise<unknown>=>send({phase:"inverse-native-delete-cold-ui",role:"properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});
 const call=(role:Role,refs:readonly string[]):Promise<unknown>=>{
  const row=spec(role);const args:unknown[]=refs.map(objectId=>({objectId}));if(row.target){args.push({value:b.target});}
  return send(validate({phase:"inverse-native-delete-cold-ui",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:b.primitives.reflection,functionDeclaration:row.program,arguments:args,returnByValue:row.byValue}}));
 };
 const tuple=async(role:Role,refs:readonly string[],size:number):Promise<Tuple>=>{
  const id=result(await call(role,refs),size);const values=array(await props(id),size);const packets:unknown[]=[];
  for(const value of values){if(value.type==="function"||value.type==="object"&&value.subtype!=="null"){const raw=await props(object(value));properties(raw);packets.push(raw);}else{packets.push(null);}}
  return Object.freeze({id,values,packets:Object.freeze(packets)});
 };
 const source=(value:Tuple,index:number,role:SourceRole):Readonly<{scriptId:string;scopes:string}>=>{
  const fn=value.values[index];need(fn?.type==="function"&&fn.description!==undefined);description(fn.description,role);return metadata(value.packets[index],SOURCE[role],b.scriptId);
 };
 const binding=await tuple("workerBinding",[b.originalProject],2);const busValue=binding.values[0];const channelValue=binding.values[1];need(busValue!==undefined&&channelValue!==undefined);const originalBus=object(busValue);const originalChannel=object(channelValue);
 await tuple("workerLineage",[b.originalProject,originalBus],1);
 const roots=await tuple("workerRoots",[b.originalProject,originalBus,originalChannel],12);
 const uuid=roots.values[6];const ctor=roots.values[10];need(uuid?.type==="string"&&typeof uuid.value==="string"&&/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$(?![\s\S])/u.test(uuid.value)&&ctor!==undefined);nativeCallable({result:ctor},0);nativeMetadata(roots.packets[10],0);
 const parent=await tuple("workerParent",[roots.id],2);const base=await tuple("workerParent",[parent.id],2);const classes=await tuple("workerClasses",[roots.id,parent.id,base.id],4);
 source(classes,0,"innerBroadcastClass");source(classes,1,"innerBroadcastBaseClass");source(classes,2,"innerRpcBaseClass");
 const methods=await tuple("workerMethods",[roots.id,parent.id,base.id,classes.id],22);let scopes:string|null=null;
 for(const[index,role]of METHODS.entries()){const actual=source(methods,index,role);if(role==="innerRpcBaseRpcCall"){scopes=actual.scopes;}}
 need(scopes!==null);const wrapper=scriptScope(await props(scopes));const module=await tuple("workerModule",[wrapper,classes.id],7);
 for(const[index,role]of (["innerRemove","innerEnsureArray","innerEnsure","innerBroadcastTaskClass","workerClone"]as const).entries()){source(module,index,role);}
 const taskPrototype=await tuple("workerTaskPrototype",[module.id],2);const taskMethods=await tuple("workerTaskMethods",[module.id,taskPrototype.id],4);
 for(const[index,role]of (["innerBroadcastTaskCancel","innerBroadcastTaskRunning","innerBroadcastTaskExecute"]as const).entries()){source(taskMethods,index,role);}
 const target=eventTarget(roots.packets[10]);qualifyEventTarget(await props(target));
 const native=await tuple("workerNativePrototype",[roots.id,target],3);const event=await tuple("workerEventTargetPrototype",[native.id],2);const members=await tuple("workerNativeMembers",[roots.id,native.id,event.id],4);
 for(const[index,slot]of [1,2,3].entries()){nativeCallable({result:members.values[index]},slot);nativeMetadata(members.packets[index],slot);}
 const channel=await tuple("workerChannel",[roots.id,members.id],3);source(channel,1,"innerBroadcastClassCallback1");
 const callback=channel.values[1];need(callback!==undefined);const originalOnMessage=object(callback);
 const queue=await tuple("workerServiceQueue",[roots.id],1);const task=await tuple("workerServiceTask",[queue.id],1);const service=await tuple("workerServiceMembers",[task.id,taskPrototype.id],2);const dispatch=source(service,1,"innerRpcBaseRpcServiceCallback1");
 const dispatchScope=closure(await props(dispatch.scopes),"rpcService");const handler=await tuple("workerServiceHandler",[dispatchScope,service.id],1);const handlerFunction=handler.values[0];need(handlerFunction!==undefined);
 const handlerId=handlerCallable({result:handlerFunction},"handler");handlerMetadata(handler.packets[0],"handler",b.scriptId,b.source);
 const get=await tuple("workerNeedMethod",[b.originalProof],1);const getFunction=get.values[0];need(getFunction!==undefined);const getNeedData=handlerCallable({result:getFunction},"getNeedData");handlerMetadata(get.packets[0],"getNeedData",b.scriptId,b.source);
 const values=array(await props(channel.id),3);const name=values[0];need(name?.type==="string"&&name.value===b.expectedChannelName&&typeof name.value==="string");
 const actualService=service.values[1];need(actualService!==undefined);b.current();need(normal===112&&helpers===19);
 const packet:CurrentFootprintInverseNativeDeleteColdUiWorker=Object.freeze({profile:"private.current-footprint-inverse-native-delete-cold-ui-worker.v1",project:b.originalProject,bus:originalBus,channel:originalChannel,onmessage:originalOnMessage,service:object(actualService),handler:handlerId,getNeedData,channelName:name.value,senderUuid:uuid.value,applicationMethodInvoked:false,bodyAuthorized:false,executionAuthorized:false});originals.set(packet,b);return packet;
}
export function requireOriginalCurrentFootprintInverseNativeDeleteColdUiWorker(packet:CurrentFootprintInverseNativeDeleteColdUiWorker):void{
 need(packet!==null&&typeof packet==="object"&&!types.isProxy(packet));const original=originals.get(packet);need(original!==undefined);original.current();
}
