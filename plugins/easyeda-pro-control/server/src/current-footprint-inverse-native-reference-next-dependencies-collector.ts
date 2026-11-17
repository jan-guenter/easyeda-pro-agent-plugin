/** Descriptor-only fresh native preflight. All four actual registered handlers
 * are qualified; old channel/registry tuples supply comparison values only.
 * No RPC body, callback resume, schematic result, worker Job or DEL is issued. */
/* oxlint-disable import/max-dependencies -- The fresh native caller, full namespace collector and independently qualified source/remote data remain separate proof inputs. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_DEPENDENCIES_CALLS as CALLS,CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_DEPENDENCIES_FLAGS as FLAGS,CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_DEPENDENCIES_REQUESTS as R,validateCurrentFootprintInverseNativeReferenceNextDependenciesCommand as validate} from "./current-footprint-inverse-native-reference-next-dependencies-protocol.ts";
import type {CurrentFootprintInverseNativeReferenceNextDependenciesCommand as Command} from "./current-footprint-inverse-native-reference-next-dependencies-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_DEPENDENCIES_PROGRAMS as ALL} from "./current-footprint-inverse-native-reference-next-dependencies-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_SENDER_ENTRY as ENTRY} from "./current-footprint-inverse-native-get-task-sender-programs.ts";
import type {CurrentFootprintInverseNativeReferenceNextKind as Kind} from "./current-footprint-inverse-native-reference-next-sender-protocol.ts";
import type {CurrentFootprintInverseNativeReferenceNextSenderPrepared as Sender} from "./current-footprint-inverse-native-reference-next-sender-collector.ts";
import {collectCurrentFootprintInverseReferenceDispatch} from "./current-footprint-inverse-reference-dispatch-collector.ts";
import type {CurrentFootprintInverseReferenceDispatchGraph as Dispatch} from "./current-footprint-inverse-reference-dispatch-collector.ts";
import {currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type {CurrentFootprintInverseLookupRemote as Remote} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import {requireCurrentFootprintInverseInitializedGetDescription as description} from "./current-footprint-inverse-initialized-get-source.ts";
import type {CurrentFootprintInverseInitializedGetRole as Role} from "./current-footprint-inverse-initialized-get-source.ts";
import {decodeCurrentFootprintInverseInitializedGetFunction as metadata} from "./current-footprint-inverse-initialized-get-replies.ts";
import {captureCurrentSchematicDisplayAccessorSource as captureSource} from "./current-schematic-display-accessor-replies.ts";
import {requireCurrentFootprintInversePublicServiceTrue as truth} from "./current-footprint-inverse-public-service-replies.ts";

interface Tuple{readonly id:string;readonly values:readonly Remote[];readonly packets:readonly unknown[]}
type ProgramRole=keyof typeof CALLS;
export interface CurrentFootprintInverseNativeReferenceNextDependenciesBindings{
 readonly kind:Kind;readonly receipt:string;readonly originalFrame:string;readonly rpcFrame:string;readonly sender:Sender;
 readonly nativeRoots:string;readonly asyncPrototype:string;readonly managerChannel:string;readonly managerRegistry:string;
 readonly uiScriptId:string;readonly managerScriptId:string;readonly target:Readonly<{projectUuid:string;branchUuid:string;documentUuid:string}>;
 readonly current:()=>void;readonly request:(command:Command)=>Promise<unknown>;
 readonly sourceBound:(scriptId:string)=>Promise<void>;
}
export interface CurrentFootprintInverseNativeReferenceNextDependencyGraph{
 readonly kind:Kind;readonly module:string;readonly selected:string;readonly dispatch:Dispatch;
 readonly handler:string;readonly callbackId:string;readonly calls:number;readonly properties:number;readonly frames:number;readonly sources:number;
 readonly worker:Readonly<{handlerId:string;bodyId:string}>|null;
 readonly callbackLiveEntryProved:false;readonly bodyAuthorized:false;readonly runtimeJobIssued:false;
}
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_NATIVE_NEXT_DEPENDENCIES");}}
/** Full schematic sources bypass the ordinary metadata scalar copier. The
 * maintained descriptor reader retains the tighter 6,472,538-byte pinned
 * bundle envelope, rejects proxies/accessors and checks well-formed UTF-8. */
export async function readCurrentFootprintInverseNativeReferenceNextSource(b:Pick<CurrentFootprintInverseNativeReferenceNextDependenciesBindings,"kind"|"current"|"sourceBound"|"request">,scriptId:string):Promise<string>{
 b.current();await b.sourceBound(scriptId);b.current();
 const raw=await b.request(validate({queryKind:b.kind,phase:"inverse-native-reference-next-dependencies-source",method:"Debugger.getScriptSource",params:{scriptId}}));b.current();
 return captureSource(raw).scriptSource;
}
/** Every opaque subject receives fresh non-Proxy metadata before traversal.
 * Full SCH source is independently qualified by the shared pure collector;
 * every async helper is enclosed in this original held-native current proof. */
export async function collectCurrentFootprintInverseNativeReferenceNextDependencies(b:CurrentFootprintInverseNativeReferenceNextDependenciesBindings):Promise<Readonly<CurrentFootprintInverseNativeReferenceNextDependencyGraph>>{
 const P=ALL[b.kind];const propertyMaximum=R.properties+(b.kind==="schematic"?0:2);let calls=0;let propertyCount=0;let frames=0;let sources=0;
 const send=async(input:Command):Promise<unknown>=>{b.current();const command=validate(input);need(command.queryKind===b.kind);const raw=await b.request(command);b.current();return raw;};
 const props=(objectId:string):Promise<unknown>=>{need((propertyCount+=1)<=propertyMaximum);return send({queryKind:b.kind,phase:"inverse-native-reference-next-dependencies-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});};
 const call=(role:ProgramRole,refs:readonly string[],target?:true):Promise<unknown>=>{need((calls+=1)<=R.calls);const row=CALLS[role];need((target===true)===row.value);const args:unknown[]=refs.map(objectId=>({objectId}));if(target===true){args.push({value:b.target});}return send(validate({queryKind:b.kind,phase:"inverse-native-reference-next-dependencies-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:b.receipt,functionDeclaration:P[role],arguments:args,returnByValue:row.byValue}}));};
 const tuple=async(role:"module"|"selected",refs:readonly string[],size:number):Promise<Tuple>=>{const id=result(await call(role,refs),size);const values=array(await props(id),size);const packets:unknown[]=[];for(const value of values){if(value.type==="function"||value.type==="object"&&value.subtype!=="null"){const raw=await props(object(value));properties(raw);packets.push(raw);}else{packets.push(null);}}return{id,values,packets};};
 const qualify=(captured:Tuple,index:number,role:Role):void=>{const value=captured.values[index];need(value?.type==="function"&&typeof value.description==="string");description(value.description,role);metadata(captured.packets[index],role,b.uiScriptId);};
 const module=await tuple("module",[b.originalFrame,b.sender.prepared,b.sender.bus,b.sender.taskMethods,b.nativeRoots],14);
 for(const[index,role]of(["uiBusClass","uiTaskClass","uiClone","uiEnsureArray","uiEnsure","uiRemove","uiWeakRef","uiDeref"] as const).entries()){qualify(module,index,role);}
 const selected=await tuple("selected",[b.sender.roots,b.sender.context,b.sender.bus,b.sender.methods,module.id],4);qualify(selected,2,"uiBusClass");
 properties(await props(b.managerChannel));properties(await props(b.managerRegistry));
 const dispatch=await collectCurrentFootprintInverseReferenceDispatch({selected:selected.id,module:module.id,asyncPrototype:b.asyncPrototype,nativeRoots:b.nativeRoots,managerChannel:b.managerChannel,managerRegistry:b.managerRegistry,profile:"ui",uiScriptId:b.uiScriptId,managerScriptId:b.managerScriptId,current:b.current,properties:props,call,script:(scriptId):Promise<string>=>{
  need((sources+=1)===1);return readCurrentFootprintInverseNativeReferenceNextSource({kind:b.kind,current:b.current,sourceBound:b.sourceBound,request:send},scriptId);
 }});
 need((frames+=1)===1);const fresh=result(await send({queryKind:b.kind,phase:"inverse-native-reference-next-dependencies-frame",method:"Debugger.evaluateOnCallFrame",params:{callFrameId:b.rpcFrame,expression:ENTRY,objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}}),20);array(await props(fresh),20);
 truth(await call("join",[fresh,module.id,b.sender.prepared,b.sender.bus,b.sender.taskMethods,b.nativeRoots,b.originalFrame]));
 const index=({schematic:1,"footprint-derived":2,"device-all":3} as const)[b.kind];const namespace=dispatch.namespaces[index];need(namespace!==undefined);let worker:CurrentFootprintInverseNativeReferenceNextDependencyGraph["worker"]=null;if(b.kind!=="schematic"){need(namespace.body!==null);const handlerValues=array(await props(namespace.handler),2);const bodyValues=array(await props(namespace.body),2);const handler=handlerValues[0];const body=bodyValues[0];need(handler!==undefined&&body!==undefined&&handler.type==="function"&&body.type==="function");worker=Object.freeze({handlerId:object(handler),bodyId:object(body)});}need(calls===R.calls&&propertyCount===propertyMaximum&&frames===R.frames&&sources===R.source);b.current();
 return Object.freeze({kind:b.kind,module:module.id,selected:selected.id,dispatch,handler:namespace.handler,callbackId:namespace.callback,calls,properties:propertyCount,frames,sources,worker,callbackLiveEntryProved:false,bodyAuthorized:false,runtimeJobIssued:false});
}
