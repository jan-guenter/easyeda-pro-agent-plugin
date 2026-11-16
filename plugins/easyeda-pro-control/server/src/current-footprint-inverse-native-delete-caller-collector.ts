/* oxlint-disable import/max-dependencies -- Source, native metadata and same original UI/worker packets remain independently qualified. */
/** Prearm preparation over this DEL's retained original packets. No source
 * string, tuple or metadata packet can register a caller origin. */
import{z}from"zod";
import type{CurrentFootprintInverseNativeDeleteExecutionAcceptedData as Accepted}from"./current-footprint-inverse-native-delete-execution-accept-collector.ts";
import type{CurrentFootprintInverseNativeDeleteSenderPrepared as Sender}from"./current-footprint-inverse-native-delete-sender-collector.ts";
import type{CurrentFootprintInverseNativeDeleteExecutionDependencyGraph as Graph}from"./current-footprint-inverse-native-delete-execution-dependencies-collector.ts";
import type{CurrentFootprintInverseNativeDeleteExecutionForwardReceipt as Forward}from"./current-footprint-inverse-native-delete-execution-forward-observer.ts";
import{currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result}from"./current-footprint-inverse-lookup-preentry-replies.ts";
import type{CurrentFootprintInverseLookupRemote as Remote}from"./current-footprint-inverse-lookup-preentry-replies.ts";
import{currentFootprintInverseClockNativeCallable as callable,qualifyCurrentFootprintInverseClockNativeFunction as native,qualifyCurrentFootprintInverseClockPromiseConstructor as promiseMetadata}from"./current-footprint-inverse-clock-native-metadata.ts";
import{decodeCurrentNativeFunctionMetadata}from"./current-native-function-metadata.ts";
import{requireCurrentFootprintInverseInitializedGetDescription as outerDescription}from"./current-footprint-inverse-initialized-get-source.ts";
import{decodeCurrentFootprintInverseInitializedGetFunction as outerMetadata}from"./current-footprint-inverse-initialized-get-replies.ts";
import{requireCurrentFootprintInverseInnerGetDescription as innerDescription}from"./current-footprint-inverse-inner-get-source.ts";
import{decodeCurrentFootprintInverseInnerGetFunction as innerMetadata}from"./current-footprint-inverse-inner-get-replies.ts";
import{currentFootprintInverseGetResultScope as scope}from"./current-footprint-inverse-get-result-replies.ts";
import{currentNativeMessageEventCallable,qualifyCurrentNativeEventConstructor,qualifyCurrentNativeMessageEventFunction}from"./current-native-message-event-metadata.ts";
import{qualifyCurrentNativeSerializedOriginPrototype}from"./current-native-serialized-origin.ts";
import{qualifyCurrentFootprintInverseNativeDeleteCallerSources as qualifySources}from"./current-footprint-inverse-native-delete-caller-source.ts";
import{currentFootprintInverseNativeDeleteCallerCall as callCommand,validateCurrentFootprintInverseNativeDeleteCallerCommand as validate}from"./current-footprint-inverse-native-delete-caller-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteCallerCommand as Command}from"./current-footprint-inverse-native-delete-caller-protocol.ts";

interface Tuple{readonly id:string;readonly values:readonly Remote[]}
type Realm="worker"|"ui";
export interface CurrentFootprintInverseNativeDeleteCallerPreparationBindings{
 readonly sources:Readonly<{worker:string;ui:string;manager:string}>;readonly scripts:Readonly<{ui:string;manager:string}>;
 readonly reflection:Readonly<Record<Realm,string>>;readonly root:string;readonly native:Readonly<{roots:string;members:string;qualified:string}>;
 readonly accepted:Accepted;readonly sender:Sender;readonly graph:Graph;readonly forwarded:Forward;
 readonly current:()=>void;readonly request:(command:Command)=>Promise<unknown>;
}
export interface CurrentFootprintInverseNativeDeleteCallerPrepared{
 readonly workerState:string;readonly workerNative:string;readonly workerPromisePrototype:string;
 readonly views:Tuple;readonly roots:Tuple;readonly tasks:Tuple;readonly callbacks:Tuple;readonly callback:Tuple;readonly resolvers:Tuple;
 readonly eventConstructors:string;readonly outerFunction:string;readonly innerFunction:string;readonly rpcFunction:string;
 readonly normal:number;readonly originalPrearmOnly:true;readonly callerJoined:false;
}
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_NATIVE_DELETE_CALLER_PREPARATION");}}
function at(t:Tuple,index:number):Remote{const value=t.values[index];need(value!==undefined);return value;}
function ref(t:Tuple,index:number):string{return object(at(t,index));}
function symbol(t:Tuple,index:number,description:string):string{const value=at(t,index);need(value.type==="symbol"&&value.description===description&&value.objectId!==undefined&&value.value===undefined);return value.objectId;}
export async function collectCurrentFootprintInverseNativeDeleteCaller(b:CurrentFootprintInverseNativeDeleteCallerPreparationBindings):Promise<Readonly<CurrentFootprintInverseNativeDeleteCallerPrepared>>{
 qualifySources(b.sources);b.current();let normal=0;
 const slots=new Map<string,number>();
 const send=async(c:Command):Promise<unknown>=>{b.current();normal+=1;const raw=await b.request(c);b.current();return raw;};
 const props=(realm:Realm,id:string,role:"tuple"|"native"|"scope"|"promise"|"result"|"object"="object"):Promise<unknown>=>{const key=`${realm}-${role}`;const slot=slots.get(key)??0;need(slot<=63);slots.set(key,slot+1);return send(validate({phase:"inverse-native-delete-caller-properties",realm,role,slot,pass:0,method:"Runtime.getProperties",params:{objectId:id,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}));};
 const call=(realm:Realm,kind:Realm,role:string,id:string,refs:readonly string[]):Promise<unknown>=>send(callCommand(realm,kind,role,id,refs.map(objectId=>({objectId}))));
 const tuple=async(realm:Realm,kind:Realm,role:string,id:string,refs:readonly string[],count:number):Promise<Tuple>=>{const value=result(await call(realm,kind,role,id,refs),count);return Object.freeze({id:value,values:array(await props(realm,value,"tuple"),count)});};
 const worker="worker";const promiseReply=z.strictObject({result:z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:z.literal("function Promise() { [native code] }"),objectId:z.string()})}).parse(await call(worker,worker,"promise",b.reflection.worker,[]));const ctor=promiseReply.result.objectId;
 promiseMetadata(await props(worker,ctor,"native"));
 const members=await tuple(worker,worker,"promiseMembers",b.reflection.worker,[ctor],7);const prototype=ref(members,0);properties(await props(worker,prototype));
 for(const[index,slot]of[[1,6],[2,7],[4,9]]as const){const fn=at(members,index);callable({result:fn},slot);native(await props(worker,object(fn),"native"),slot);}
 const instance=at(members,6);need(instance.type==="function"&&instance.description==="function [Symbol.hasInstance]() { [native code] }");decodeCurrentNativeFunctionMetadata(await props(worker,object(instance),"native"),{name:"[Symbol.hasInstance]",arity:1,constructor:false});
 const workerNative=await tuple(worker,worker,"bindNative",b.reflection.worker,[ctor,prototype,ref(members,1),ref(members,2),symbol(members,3,"Symbol(Symbol.species)"),ref(members,4),symbol(members,5,"Symbol(Symbol.hasInstance)"),object(instance)],8);
 const state=await tuple(worker,worker,"prepare",b.reflection.worker,[b.accepted.serviceTuple,b.accepted.eventTuple,b.accepted.jobProof,b.accepted.entryProof,workerNative.id],14);
 const s=b.sender;const forward=b.forwarded;
 const views=await tuple("ui","ui","views",b.reflection.ui,[s.roots,s.context,s.bus,s.methods,s.task,s.members,s.taskMethods,s.prepared,b.graph.module,b.native.roots],5);
 const viewCounts=[6,14,13,2,3]as const;for(const[index,count]of viewCounts.entries()){array(await props("ui",ref(views,index),"tuple"),count);}
 const queued=await tuple("ui","ui","queued",b.reflection.ui,[forward.channel.roots],1);array(await props("ui",ref(queued,0),"tuple"),0);
 const roots=await tuple("ui","ui","roots",b.reflection.ui,[views.id,s.prepared,forward.channel.roots,forward.prepared,b.native.roots,b.native.members,queued.id,forward.channel.methods,b.native.qualified],12);
 for(const index of[5,8]){array(await props("ui",ref(roots,index),"tuple"),1);}
 const tasks=await tuple("ui","ui","tasks",b.reflection.ui,[roots.id],3);for(let index=0;index<3;index += 1){properties(await props("ui",ref(tasks,index)));}
 const callbacks=await tuple("ui","ui","callbacks",b.reflection.ui,[roots.id,tasks.id,ref(views,3),ref(views,4),forward.channel.taskPrototype,ref(views,2),forward.channel.taskMethods,ref(views,1)],5);
 const outer=at(callbacks,1);const inner=at(callbacks,2);need(outer.type==="function"&&typeof outer.description==="string"&&inner.type==="function"&&typeof inner.description==="string");
 outerDescription(outer.description,"uiBusRpcCallCallback2");outerMetadata(await props("ui",object(outer),"native"),"uiBusRpcCallCallback2",b.scripts.ui);
 innerDescription(inner.description,"innerRpcBaseSubscribeOnceCallback1");const info=innerMetadata(await props("ui",object(inner),"native"),"innerRpcBaseSubscribeOnceCallback1",b.scripts.manager);
 const callbackScope=scope(await props("ui",info.scopes,"scope"),"subscribeOnce");const callback=await tuple("ui","ui","innerCallback",b.reflection.ui,[callbackScope,tasks.id,callbacks.id],2);
 const rpc=at(callback,0);need(rpc.type==="function"&&typeof rpc.description==="string");innerDescription(rpc.description,"innerRpcBaseRpcCallCallback2");const rpcInfo=innerMetadata(await props("ui",object(rpc),"native"),"innerRpcBaseRpcCallCallback2",b.scripts.manager);
 const resolverScope=scope(await props("ui",rpcInfo.scopes,"scope"),"anonymous");const resolvers=await tuple("ui","ui","innerResolvers",b.reflection.ui,[resolverScope,callback.id],3);
 for(const index of[0,1]){const fn=at(resolvers,index);callable({result:fn},10);native(await props("ui",object(fn),"native"),10);}
 const constructors=await tuple("ui","ui","eventConstructors",b.root,[b.reflection.ui],5);for(const index of[2,3]){const fn=at(constructors,index);currentNativeMessageEventCallable({result:fn},index===2?"Event":0);const packet=await props("ui",object(fn),"native");if(index===2){qualifyCurrentNativeEventConstructor(packet);}else{qualifyCurrentNativeMessageEventFunction(packet,0);}const parent=properties(packet).find(row=>row.name==="prototype")?.value;need(parent!==undefined);qualifyCurrentNativeSerializedOriginPrototype(await props("ui",object(parent)),parent);}
 b.current();need(normal===51);
 return Object.freeze({workerState:state.id,workerNative:workerNative.id,workerPromisePrototype:prototype,views,roots,tasks,callbacks,callback,resolvers,eventConstructors:constructors.id,outerFunction:object(outer),innerFunction:object(inner),rpcFunction:object(rpc),normal,originalPrearmOnly:true,callerJoined:false});
}
