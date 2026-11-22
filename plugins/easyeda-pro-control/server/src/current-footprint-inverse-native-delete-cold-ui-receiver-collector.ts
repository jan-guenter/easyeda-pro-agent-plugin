/* oxlint-disable import/max-dependencies -- Original source, metadata, pure lookup/channel algorithms and the distinct sender packet remain independently joined. */
/** Actual registered negative-task receiver preparation. No public-row token,
 * positive GET origin, K invocation or application method is adopted here. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER_REQUESTS} from "./current-footprint-inverse-native-delete-cold-ui-request-budgets.ts";
import {types} from "node:util";
import {z} from "zod";
import {captureCurrentFootprintInversePreferenceReply as capture} from "./current-footprint-inverse-public-preferences-replies.ts";
import {currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type {CurrentFootprintInverseLookupRemote as Remote} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import {currentFootprintInverseGetForwardingClosure as closure} from "./current-footprint-inverse-get-forwarding-collector.ts";
import {currentFootprintInverseGetRpcEntryScope as scriptScope} from "./current-footprint-inverse-get-rpc-entry-replies.ts";
import {decodeCurrentFootprintInverseInitializedGetFunction as metadata} from "./current-footprint-inverse-initialized-get-replies.ts";
import {requireCurrentFootprintInverseInitializedGetDescription as description} from "./current-footprint-inverse-initialized-get-source.ts";
import type {CurrentFootprintInverseInitializedGetRole as SourceRole} from "./current-footprint-inverse-initialized-get-source.ts";
import {collectCurrentFootprintInverseGetManager as managerData} from "./current-footprint-inverse-get-manager-collector.ts";
import {collectCurrentFootprintInverseGetChannel as channelData} from "./current-footprint-inverse-get-channel-collector.ts";
import {requireOriginalCurrentFootprintInverseNativeDeleteColdUiSender as requireSender} from "./current-footprint-inverse-native-delete-cold-ui-sender-collector.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiSender as Sender} from "./current-footprint-inverse-native-delete-cold-ui-sender-collector.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiPrimitives as Primitives} from "./current-footprint-inverse-native-delete-cold-ui-primitive-collector.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_FLAGS as FLAGS,currentFootprintInverseNativeDeleteColdUiCallSpec as spec,validateCurrentFootprintInverseNativeDeleteColdUiCommand as validate} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiCommand as Command} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";
import {isCurrentFootprintInverseNativeDeleteColdUiReceiverRole as isRole} from "./current-footprint-inverse-native-delete-cold-ui-receiver-programs.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiReceiverRole as Role} from "./current-footprint-inverse-native-delete-cold-ui-receiver-programs.ts";

interface Bindings{
 readonly uiScriptId:string;readonly managerScriptId:string;readonly sender:Sender;readonly primitives:Primitives;readonly current:()=>void;
 readonly target:Readonly<{projectUuid:string;branchUuid:string;documentUuid:string}>;
 readonly request:(command:Command)=>Promise<unknown>;readonly qualifyHelper:(command:Command)=>Promise<string>;
}
interface Tuple{readonly id:string;readonly values:readonly Remote[];readonly packets:readonly unknown[]}
export interface CurrentFootprintInverseNativeDeleteColdUiReceiver{
 readonly profile:"private.current-footprint-inverse-native-delete-cold-ui-receiver.v1";
 readonly invoke:string;readonly originalInvokeLocation:Readonly<{scriptId:string;lineNumber:number;columnNumber:number}>;
 readonly footprint:string;readonly bus:string;readonly push:string;readonly channelName:string;readonly managerSenderUuid:string;
 readonly applicationMethodInvoked:false;readonly bodyAuthorized:false;readonly executionAuthorized:false;
}
const originals=new WeakMap<CurrentFootprintInverseNativeDeleteColdUiReceiver,Bindings>();
export {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER_REQUESTS} from "./current-footprint-inverse-native-delete-cold-ui-request-budgets.ts";
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER");}}
export async function collectCurrentFootprintInverseNativeDeleteColdUiReceiver(bindings:Bindings):Promise<CurrentFootprintInverseNativeDeleteColdUiReceiver>{
 const b=Object.freeze({...bindings,target:Object.freeze({...bindings.target})});requireSender(b.sender);let normal=0;let helpers=0;
 const guardSource:{scriptId:string|null}={scriptId:null};
 const send=async(input:Command):Promise<unknown>=>{
  b.current();requireSender(b.sender);const command=validate(input);need(command.method==="Runtime.getProperties"||command.method==="Runtime.callFunctionOn"&&isRole(command.role));
  need(normal<CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER_REQUESTS.normal);normal+=1;b.current();const raw=await b.request(command);b.current();
  if(command.method==="Runtime.callFunctionOn"){need(helpers<CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_RECEIVER_REQUESTS.helpers);helpers+=1;b.current();const scriptId=await b.qualifyHelper(command);b.current();if(command.role==="receiverGuard"){need(guardSource.scriptId===null);guardSource.scriptId=scriptId;}}return raw;
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
 const qualify=(tupleValue:Tuple,index:number,role:SourceRole,scriptId:string):Readonly<{scriptId:string;scopes:string}>=>{
  const value=tupleValue.values[index];need(value?.type==="function"&&value.description!==undefined);description(value.description,role);return metadata(tupleValue.packets[index],role,scriptId);
 };
 const members=await tuple("receiverMembers",[b.sender.prepared],3);const callback=qualify(members,1,"uiBusRpcServiceCallback1",b.uiScriptId);const callbackScope=closure(await props(callback.scopes),"rpcService");
 const handler=await tuple("receiverHandler",[callbackScope,members.id],2);const wrapper=qualify(handler,0,"managerRegisterServiceCallback1",b.managerScriptId);const handlerScope=closure(await props(wrapper.scopes),"V");
 const body=await tuple("receiverBody",[handlerScope,handler.id],2);const bodyMetadata=qualify(body,0,"managerRegisterGetCallback1",b.managerScriptId);const bodyScope=scriptScope(await props(bodyMetadata.scopes));
 const module=await tuple("receiverModule",[bodyScope,body.id],4);qualify(module,0,"managerApplyArguments",b.managerScriptId);const lookup=qualify(module,1,"managerProjectLookup",b.managerScriptId);const lookupScope=scriptScope(await props(lookup.scopes));const lookupProof=await tuple("receiverLookup",[lookupScope,module.id],1);
 const appliers=await tuple("receiverAppliers",[handler.id,body.id,module.id,b.primitives.asyncPrototype],1);
 const managerRoles={registry:"managerRegistry",registrySelf:"managerRegistrySelf",registryMap:"managerMap",nativeMap:"managerNativeMap",nativePrototype:"managerNativePrototype",methods:"managerMethods",selected:"managerSelected",project:"managerProject",footprint:"managerFootprint",getData:"managerGetData"}as const;
 const manager=await managerData({receipt:b.primitives.reflection,managerModule:module.id,asyncPrototype:b.primitives.asyncPrototype,managerScriptId:b.managerScriptId,target:b.target,current:b.current,request:command=>{
  if(command.method==="Runtime.getProperties"){return props(command.params.objectId);}need(command.method==="Runtime.callFunctionOn");const role=managerRoles[command.role];return send(validate({...command,phase:"inverse-native-delete-cold-ui",role,params:{...command.params,objectGroup:FLAGS.objectGroup}}));
 }});
 const channelRoles={lineageUi:"channelLineage",roots:"channelRoots",parent:"channelParent",classes:"channelClasses",module:"channelModule",methods:"channelMethods",taskPrototype:"channelTaskPrototype",taskMethods:"channelTaskMethods",nativePrototype:"channelNativePrototype",eventTargetPrototype:"channelEventTargetPrototype",nativeMembers:"channelNativeMembers",channel:"channel"}as const;
 const channel=await channelData({profile:"ui",scriptId:b.managerScriptId,manager,forwarding:{callbackScope,handlerScope,bodyScope,handler:handler.id,body:body.id,managerModule:module.id},current:b.current,properties:props,call:(role,refs):Promise<unknown>=>{need(role!=="lineageManager");return call(channelRoles[role],refs);}});
 const channelProof=await tuple("receiverChannelProof",[channel.lineage,channel.roots,channel.classes,channel.module,channel.methods,channel.taskMethods,channel.nativeMembers,channel.channel],1);
 const guarded=await tuple("receiverGuard",[b.sender.prepared,module.id,lookupProof.id,manager.getData,manager.project,channel.methods,channelProof.id,appliers.id],5);
 const invoke=guarded.values[0];const footprint=guarded.values[2];const bus=guarded.values[3];const push=guarded.values[4];need(invoke?.type==="function"&&invoke.subtype===undefined&&footprint!==undefined&&bus!==undefined&&push!==undefined);
 const generatedValue=z.looseObject({type:z.string(),subtype:z.string().optional(),value:z.unknown().optional()});const generatedInternal=z.looseObject({name:z.string(),value:generatedValue});const generatedPacket=z.looseObject({internalProperties:z.array(generatedInternal).max(3)});
 const functionPacket=generatedPacket.parse(capture(guarded.packets[0]));const locations=functionPacket.internalProperties.filter(value=>value.name==="[[FunctionLocation]]");const original=locations[0];const scriptId=guardSource.scriptId;
 need(locations.length===1&&original?.value.type==="object"&&original.value.subtype==="internal#location"&&scriptId!==null);
 const originalInvokeLocation=z.strictObject({scriptId:z.literal(scriptId),lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()}).parse(original.value.value);
 const channelValues=array(await props(channel.channel),3);const name=channelValues[0];need(name?.type==="string"&&typeof name.value==="string");
 b.current();need(normal===176&&helpers===31);
 const packet:CurrentFootprintInverseNativeDeleteColdUiReceiver=Object.freeze({profile:"private.current-footprint-inverse-native-delete-cold-ui-receiver.v1",invoke:object(invoke),originalInvokeLocation:Object.freeze(originalInvokeLocation),footprint:object(footprint),bus:object(bus),push:object(push),channelName:name.value,managerSenderUuid:channel.uuid,applicationMethodInvoked:false,bodyAuthorized:false,executionAuthorized:false});
 originals.set(packet,b);return packet;
}
export function requireOriginalCurrentFootprintInverseNativeDeleteColdUiReceiver(packet:CurrentFootprintInverseNativeDeleteColdUiReceiver,sender:Sender):void{
 need(packet!==null&&typeof packet==="object"&&!types.isProxy(packet));const binding=originals.get(packet);need(binding!==undefined&&binding.sender===sender);binding.current();requireSender(sender);
}
