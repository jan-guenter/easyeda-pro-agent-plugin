/* oxlint-disable import/max-dependencies -- This collector joins independent fixed UI/manager metadata and both complete SCH source profiles without runtime authority. */
/** Four actual namespace registrations, no application invocation. A matching
 * source string or manufactured Graph does not issue a runtime capability. */
import type{CURRENT_FOOTPRINT_INVERSE_REFERENCE_DISPATCH_PROGRAMS as P}from"./current-footprint-inverse-reference-dispatch-programs.ts";
import{currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupResult as result}from"./current-footprint-inverse-lookup-preentry-replies.ts";
import type{CurrentFootprintInverseLookupRemote as Remote}from"./current-footprint-inverse-lookup-preentry-replies.ts";
import{currentFootprintInverseReferenceFunctionScript as functionScript,currentFootprintInverseReferenceDispatchProperties as properties,currentFootprintInverseReferenceSchematicScope as schematicScope}from"./current-footprint-inverse-reference-dispatch-replies.ts";
import{currentFootprintInverseGetForwardingClosure as closure}from"./current-footprint-inverse-get-forwarding-collector.ts";
import{currentFootprintInverseGetRpcEntryScope as moduleScope}from"./current-footprint-inverse-get-rpc-entry-replies.ts";
import{requireCurrentFootprintInverseInitializedGetDescription as description}from"./current-footprint-inverse-initialized-get-source.ts";
import{decodeCurrentFootprintInverseInitializedGetFunction as metadata}from"./current-footprint-inverse-initialized-get-replies.ts";
import{requireCurrentFootprintInverseReferenceQueryDescription as managerDescription,qualifyCurrentFootprintInverseReferenceQueryFunction as managerMetadata}from"./current-footprint-inverse-reference-query-source.ts";
import{CURRENT_FOOTPRINT_INVERSE_SCHEMATIC_REFERENCE_SOURCE as SCHEMATIC_SOURCE,requireCurrentFootprintInverseSchematicReferenceDescription as schematicDescription,qualifyCurrentFootprintInverseSchematicReferenceFunction as schematicMetadata,qualifyCurrentFootprintInverseSchematicReferenceSource as schematicSource}from"./current-footprint-inverse-schematic-reference-source.ts";
import{sha256Text}from"./core.ts";
import{requireCurrentFootprintInversePublicServiceTrue as truth}from"./current-footprint-inverse-public-service-replies.ts";

interface Tuple{readonly id:string;readonly values:readonly Remote[];readonly packets:readonly unknown[]}
type Role=keyof typeof P;
export interface CurrentFootprintInverseReferenceDispatchBindings{
 readonly selected:string;readonly module:string;readonly asyncPrototype:string;readonly nativeRoots:string;
 readonly managerChannel:string;readonly managerRegistry:string;readonly profile:"ui"|"manager";readonly uiScriptId:string;readonly managerScriptId:string;
 readonly current:()=>void;readonly properties:(objectId:string)=>Promise<unknown>;readonly call:(role:Role,references:readonly string[],target?:true)=>Promise<unknown>;readonly script:(scriptId:string)=>Promise<string>;
}
export interface CurrentFootprintInverseReferenceNamespace{readonly view:string;readonly callback:string;readonly callbackScope:string;readonly handler:string;readonly handlerScope:string|null;readonly body:string|null;readonly bodyScope:string|null;readonly module:string|null;}
export interface CurrentFootprintInverseReferenceDispatchGraph{readonly roots:string;readonly queues:string;readonly tasks:string;readonly members:string;readonly namespaces:readonly CurrentFootprintInverseReferenceNamespace[];readonly schematic:Readonly<{variant:0|1;scriptId:string;roots:string;prototype:string;method:string;store:string;dictionary:string;empty:string}>;}
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_REFERENCE_DISPATCH_GRAPH");}}
export async function collectCurrentFootprintInverseReferenceDispatch(b:CurrentFootprintInverseReferenceDispatchBindings):Promise<Readonly<CurrentFootprintInverseReferenceDispatchGraph>>{
 const props=async(id:string):Promise<unknown>=>{b.current();const raw=await b.properties(id);b.current();return raw;};
 const call=async(role:Role,refs:readonly string[],target?:true):Promise<unknown>=>{b.current();const raw=await b.call(role,refs,target);b.current();return raw;};
 const tuple=async(role:Role,refs:readonly string[],size:number,target?:true):Promise<Tuple>=>{const id=result(await call(role,refs,target),size);const values=array(await props(id),size);const packets:unknown[]=[];for(const value of values){if(value.type==="function"||value.type==="object"&&value.subtype!=="null"){const raw=await props(object(value));properties(raw);packets.push(raw);}else{packets.push(null);}}return{id,values,packets};};
 const roots=await tuple("roots",[b.selected,b.module],6);const queues=await tuple("queues",[roots.id],5);const tasks=await tuple("tasks",[queues.id],5);const members=await tuple("members",[tasks.id,b.module],5);
 const views=["viewPcb","viewSchematic","viewDerived","viewDevice"]as const;const handlers=b.profile==="ui"?["callbackPcbUi","callbackSchematicUi","callbackDerivedUi","callbackDeviceUi"]as const:["callbackPcbManager","callbackSchematicManager","callbackDerivedManager","callbackDeviceManager"]as const;
 const expectedScript=b.profile==="ui"?b.uiScriptId:b.managerScriptId;const callbackRole=b.profile==="ui"?"uiBusRpcServiceCallback1":"managerBusRpcServiceCallback1";const namespaces:CurrentFootprintInverseReferenceNamespace[]=[];
 let schematic:CurrentFootprintInverseReferenceDispatchGraph["schematic"]|null=null;
 const managerRoles=["managerPcbCallback",null,"managerFootprintCallback","managerDeviceCallback"]as const;
 for(const[index,viewRole]of views.entries()){
  const view=await tuple(viewRole,[tasks.id,members.id,b.module],3);const callback=view.values[1];need(callback?.type==="function"&&typeof callback.description==="string");
  description(callback.description,callbackRole);const callbackInfo=metadata(view.packets[1],callbackRole,expectedScript);const callbackScope=closure(await props(callbackInfo.scopes),"rpcService");
  const handlerRole=handlers[index];need(handlerRole!==undefined);const handler=await tuple(handlerRole,[callbackScope,view.id],2);const handlerFunction=handler.values[0];need(handlerFunction?.type==="function"&&typeof handlerFunction.description==="string");
  if(index===1){
   const handlerHash=sha256Text(handlerFunction.description);need(handlerHash===SCHEMATIC_SOURCE[0].methods.handler.sha256||handlerHash===SCHEMATIC_SOURCE[1].methods.handler.sha256);
   const scriptId=functionScript(handler.packets[0]);b.current();const full=await b.script(scriptId);b.current();const hash=sha256Text(full);let variant:0|1;
   if(hash===SCHEMATIC_SOURCE[0].sha256){variant=0;}else{need(hash===SCHEMATIC_SOURCE[1].sha256);variant=1;}schematicSource(full,variant);schematicDescription(handlerFunction.description,variant,"handler");
   const handlerScopes=schematicMetadata(handler.packets[0],variant,"handler",scriptId);const scope=schematicScope(await props(handlerScopes),"handler");
   const selected=await tuple("schematicRoots",[scope,handler.id,b.selected,b.asyncPrototype],3);const prototype=await tuple("schematicPrototype",[selected.id,b.selected],2,true);const method=await tuple("schematicMethod",[prototype.id],2);const fn=method.values[0];need(fn?.type==="function"&&typeof fn.description==="string");
   schematicDescription(fn.description,variant,"method");const methodScopes=schematicMetadata(method.packets[0],variant,"method",scriptId);const storeScope=schematicScope(await props(methodScopes),"method");const store=await tuple(variant===0?"schematicStoreMain":"schematicStoreChild",[storeScope,method.id],4);
   for(const[at,role]of[[1,"iterator"],[2,"factory"]]as const){const f=store.values[at];need(f?.type==="function"&&typeof f.description==="string");schematicDescription(f.description,variant,role);schematicMetadata(store.packets[at],variant,role,scriptId);}
   const dictionary=await tuple("schematicDictionary",[store.id],2);const empty=await tuple("schematicEmpty",[dictionary.id,store.id,prototype.id,method.id,b.nativeRoots],1);schematic=Object.freeze({variant,scriptId,roots:selected.id,prototype:prototype.id,method:method.id,store:store.id,dictionary:dictionary.id,empty:empty.id});
   namespaces.push(Object.freeze({view:view.id,callback:object(callback),callbackScope,handler:handler.id,handlerScope:scope,body:null,bodyScope:storeScope,module:null}));
  }else{
   description(handlerFunction.description,"managerRegisterServiceCallback1");const handlerInfo=metadata(handler.packets[0],"managerRegisterServiceCallback1",b.managerScriptId);const handlerScope=closure(await props(handlerInfo.scopes),"V");
   const body=await tuple("handlerBody",[handlerScope,handler.id],2);const fn=body.values[0];need(fn?.type==="function"&&typeof fn.description==="string");const role=managerRoles[index];need(role!==undefined&&role!==null);managerDescription(fn.description,role);
   const bodyScopes=managerMetadata(body.packets[0],role,b.managerScriptId);const bodyScope=moduleScope(await props(bodyScopes));const module=await tuple("managerModule",[bodyScope,body.id],4);
   for(const[at,expected]of[[0,"managerApplyArguments"],[1,"managerProjectLookup"]]as const){const f=module.values[at];need(f?.type==="function"&&typeof f.description==="string");description(f.description,expected);metadata(module.packets[at],expected,b.managerScriptId);}
   truth(await call("managerOriginal",[module.id,b.managerChannel,b.managerRegistry]));namespaces.push(Object.freeze({view:view.id,callback:object(callback),callbackScope,handler:handler.id,handlerScope,body:body.id,bodyScope,module:module.id}));
  }
 }

 need(schematic!==null&&namespaces.length===4);truth(await call("same",[roots.id,queues.id,tasks.id,members.id,schematic.empty]));b.current();return Object.freeze({roots:roots.id,queues:queues.id,tasks:tasks.id,members:members.id,namespaces:Object.freeze(namespaces),schematic});
}
