/** Source and native channel metadata under the same original UI I11.
 * No application method, native post, resume or runtime token is issued. */
/* oxlint-disable import/max-dependencies -- This joins separate source/BC/intrinsic metadata without merging their original owner registries. */
import { CURRENT_FOOTPRINT_INVERSE_GET_CHANNEL_SOURCE_METHOD_ROLES as METHOD_ROLES } from "./current-footprint-inverse-get-channel-programs.ts";
import type { CURRENT_FOOTPRINT_INVERSE_GET_CHANNEL_PROGRAMS } from "./current-footprint-inverse-get-channel-programs.ts";
import { currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type { CurrentFootprintInverseLookupRemote as Remote } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInverseInnerGetDescription as description } from "./current-footprint-inverse-inner-get-source.ts";
import type { CurrentFootprintInverseInnerGetRole as Role } from "./current-footprint-inverse-inner-get-source.ts";
import { decodeCurrentFootprintInverseInnerGetFunction as metadata } from "./current-footprint-inverse-inner-get-replies.ts";
import { requireCurrentFootprintInverseInitializedGetDescription as outerDescription } from "./current-footprint-inverse-initialized-get-source.ts";
import { decodeCurrentFootprintInverseInitializedGetFunction as outerMetadata } from "./current-footprint-inverse-initialized-get-replies.ts";
import { currentFootprintInverseGetRpcEntryScope as scope } from "./current-footprint-inverse-get-rpc-entry-replies.ts";
import { currentFootprintInverseNativeChannelEventTarget,qualifyCurrentFootprintInverseNativeChannelEventTarget } from "./current-footprint-inverse-native-channel-metadata.ts";
import { currentFootprintInverseClockNativeCallable as nativeCallable,qualifyCurrentFootprintInverseClockNativeFunction as nativeMetadata } from "./current-footprint-inverse-clock-native-metadata.ts";
import type { CurrentFootprintInverseGetManagerGraph } from "./current-footprint-inverse-get-manager-collector.ts";
import type { CurrentFootprintInverseGetForwardingGraph } from "./current-footprint-inverse-get-forwarding-collector.ts";

interface Tuple {readonly id:string;readonly values:readonly Remote[];readonly packets:readonly unknown[]}
interface Bindings{
 readonly profile:"ui"|"manager";readonly scriptId:string;readonly manager:CurrentFootprintInverseGetManagerGraph;readonly forwarding:Pick<CurrentFootprintInverseGetForwardingGraph,"callbackScope"|"handlerScope"|"bodyScope"|"handler"|"body"|"managerModule">;
 readonly current:()=>void;readonly properties:(objectId:string)=>Promise<unknown>;
 readonly call:(role:keyof typeof CURRENT_FOOTPRINT_INVERSE_GET_CHANNEL_PROGRAMS,refs:readonly string[],target?:boolean)=>Promise<unknown>;
}
export interface CurrentFootprintInverseGetChannelGraph{
 readonly lineage:string;readonly rpcScope:string;readonly roots:string;readonly parent:string;readonly base:string;readonly classes:string;readonly module:string;readonly methods:string;
 readonly taskPrototype:string;readonly taskMethods:string;readonly nativePrototype:string;readonly eventTargetPrototype:string;readonly nativeMembers:string;readonly channel:string;
 readonly rpc:string;readonly bus:string;readonly broadcastChannel:string;readonly callback:string;readonly uuid:string;readonly rpcTicket:number;readonly pushCnt:number;
}
/** Reject a failed inverse get channel graph predicate with its fixed refusal code. */
function need(condition:boolean):asserts condition{if(!condition){throw new Error("INVERSE_GET_CHANNEL_GRAPH");}}
/** Qualify the original channel's modules, handles and native dependencies through bounded fixed reads. */
export async function collectCurrentFootprintInverseGetChannel(b:Bindings):Promise<Readonly<CurrentFootprintInverseGetChannelGraph>>{
 const props=async(id:string):Promise<unknown>=>{b.current();const raw=await b.properties(id);b.current();return raw;};
 const tuple=async(role:keyof typeof CURRENT_FOOTPRINT_INVERSE_GET_CHANNEL_PROGRAMS,refs:readonly string[],size:number,target=false):Promise<Tuple>=>{b.current();const id=result(await b.call(role,refs,target),size);b.current();const values=array(await props(id),size);const packets:unknown[]=[];for(const value of values){if(value.type==="function"||value.type==="object"&&value.subtype!=="null"){const raw=await props(object(value));properties(raw);packets.push(raw);}else{packets.push(null);}}return{id,values,packets};};
 const source=(t:Tuple,index:number,role:Role):Readonly<{scriptId:string;scopes:string}>=>{const fn=t.values[index];need(fn?.type==="function"&&typeof fn.description==="string");description(fn.description,role);return metadata(t.packets[index],role,b.scriptId);};
 const g=b.forwarding;const m=b.manager;const lineage=await tuple(b.profile==="ui"?"lineageUi":"lineageManager",[g.callbackScope,g.handlerScope,g.bodyScope,g.handler,g.body,g.managerModule],1);
 const roots=await tuple("roots",[m.project,m.selected,m.registry,m.map,m.methods,m.native,m.nativePrototype],12,true);const uuid=roots.values[6];const ticket=roots.values[7];const push=roots.values[8];const ctor=roots.values[10];need(uuid?.type==="string"&&typeof uuid.value==="string"&&/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/u.test(uuid.value)&&ticket?.type==="number"&&typeof ticket.value==="number"&&push?.type==="number"&&typeof push.value==="number"&&ctor?.type==="function");nativeCallable({result:ctor},0);nativeMetadata(roots.packets[10],0);
 const parent=await tuple("parent",[roots.id],2);const base=await tuple("parent",[parent.id],2);const classes=await tuple("classes",[roots.id,parent.id,base.id],4);source(classes,0,"innerBroadcastClass");source(classes,1,"innerBroadcastBaseClass");source(classes,2,"innerRpcBaseClass");
 const methods=await tuple("methods",[roots.id,parent.id,base.id,classes.id],22);let rpcScopes:string|null=null;for(const[index,role]of METHOD_ROLES.entries()){const packet=source(methods,index,role);if(role==="innerRpcBaseRpcCall"){rpcScopes=packet.scopes;}}need(rpcScopes!==null);const wrapper=scope(await props(rpcScopes));const module=await tuple("module",[wrapper,classes.id],7);for(const[index,role]of(["innerRemove","innerEnsureArray","innerEnsure","innerBroadcastTaskClass"]as const).entries()){source(module,index,role);}const clone=module.values[4];need(clone?.type==="function"&&typeof clone.description==="string");outerDescription(clone.description,"managerClone");outerMetadata(module.packets[4],"managerClone",b.scriptId);
 const taskPrototype=await tuple("taskPrototype",[module.id],2);const taskMethods=await tuple("taskMethods",[module.id,taskPrototype.id],4);for(const[index,role]of(["innerBroadcastTaskCancel","innerBroadcastTaskRunning","innerBroadcastTaskExecute"]as const).entries()){source(taskMethods,index,role);}
 const eventTarget=currentFootprintInverseNativeChannelEventTarget(roots.packets[10]);qualifyCurrentFootprintInverseNativeChannelEventTarget(await props(eventTarget));const nativePrototype=await tuple("nativePrototype",[roots.id,eventTarget],3);const eventTargetPrototype=await tuple("eventTargetPrototype",[nativePrototype.id],2);const nativeMembers=await tuple("nativeMembers",[roots.id,nativePrototype.id,eventTargetPrototype.id],4);for(const[index,slot]of[1,2,3].entries()){nativeCallable({result:nativeMembers.values[index]},slot);nativeMetadata(nativeMembers.packets[index],slot);}
 const channel=await tuple("channel",[roots.id,nativeMembers.id],3,true);source(channel,1,"innerBroadcastClassCallback1");const rpc=methods.values[20];const bus=roots.values[0];const broadcastChannel=roots.values[2];const callback=channel.values[1];need(rpc!==undefined&&bus!==undefined&&broadcastChannel!==undefined&&callback!==undefined);b.current();return Object.freeze({lineage:lineage.id,rpcScope:wrapper,roots:roots.id,parent:parent.id,base:base.id,classes:classes.id,module:module.id,methods:methods.id,taskPrototype:taskPrototype.id,taskMethods:taskMethods.id,nativePrototype:nativePrototype.id,eventTargetPrototype:eventTargetPrototype.id,nativeMembers:nativeMembers.id,channel:channel.id,rpc:object(rpc),bus:object(bus),broadcastChannel:object(broadcastChannel),callback:object(callback),uuid:uuid.value,rpcTicket:ticket.value,pushCnt:push.value});
}
