/* oxlint-disable import/max-dependencies -- The ten original source/decoder contracts remain independent; the shared pure budget adds one required value import while breaking profile-to-collector coupling. */
/** Original packet choreography for the negative UI clone/timer primitives.
 * The caller must be the genuine cold owner; this module issues no realm,
 * invocation, ready flag, callback registrar or process authority. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PRIMITIVE_REQUESTS} from "./current-footprint-inverse-native-delete-cold-ui-request-budgets.ts";
import {z} from "zod";
import {decodeCurrentFootprintCopyClockRpcV2Array as bootArray,currentFootprintCopyClockRpcV2ArrayObject as bootObject,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as bootResult} from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {currentFootprintInverseOwnDataParent as parent,currentFootprintInverseOwnDataProperty as property} from "./current-footprint-inverse-own-data-replies.ts";
import {currentNativeOwnDataCallable as callable,qualifyCurrentNativeOwnDataFunction as metadata} from "./current-native-own-data-intrinsics.ts";
import {decodeCurrentNativeFunctionMetadata} from "./current-native-function-metadata.ts";
import {collectCurrentFootprintInverseGetIntrinsics} from "./current-footprint-inverse-get-intrinsics-collector.ts";
import {currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import {requireCurrentFootprintInversePublicServiceTrue as truth} from "./current-footprint-inverse-public-service-replies.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_FLAGS as FLAGS,currentFootprintInverseNativeDeleteColdUiProgram as program,validateCurrentFootprintInverseNativeDeleteColdUiCommand as validate} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiCommand as Command} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PRIMITIVE_PROGRAMS as P} from "./current-footprint-inverse-native-delete-cold-ui-primitive-programs.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiPrimitiveRole as Role} from "./current-footprint-inverse-native-delete-cold-ui-primitive-programs.ts";

interface Bindings{
 readonly uniqueContextId:string;readonly current:()=>void;
 readonly request:(command:Command)=>Promise<unknown>;
 readonly qualifyHelper:(command:Command)=>Promise<void>;
}
export interface CurrentFootprintInverseNativeDeleteColdUiPrimitives{
 readonly reflection:string;readonly root:string;readonly roots:string;readonly members:string;
 readonly reflectApply:string;readonly reprove:string;readonly originalSetTimeout:string;readonly asyncPrototype:string;
 readonly nativeRequests:number;readonly helperRequests:number;
}
/** Maxima follow the fixed five-depth/fifteen-constructor algorithm, including
 * all saved constructor reproofs. Null optional roots reduce actual reads.
 * The bootstrap omits the worker-only PROJECT join:19 reads+4 sources.
 * Reflect selects two tuples before its native arity3 metadata; the final
 * primitive closure is inspected before any application preparation uses it. */
export {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PRIMITIVE_REQUESTS} from "./current-footprint-inverse-native-delete-cold-ui-request-budgets.ts";
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_PRIMITIVES");}}
const reference=(objectId:string):Readonly<{objectId:string}>=>({objectId});
const generic=z.strictObject({result:z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:z.literal("function apply() { [native code] }"),objectId:z.string()})});
export async function collectCurrentFootprintInverseNativeDeleteColdUiPrimitives(b:Bindings):Promise<CurrentFootprintInverseNativeDeleteColdUiPrimitives>{
 let count=0,helpers=0;
 const send=async(input:Command):Promise<unknown>=>{
  b.current();const command=validate(input);need(command.method==="Runtime.getProperties"||command.method==="Runtime.callFunctionOn"&&Object.hasOwn(P,command.role));
  need(count<CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PRIMITIVE_REQUESTS.normal);count+=1;b.current();const raw=await b.request(command);b.current();
  if(program(command)!==null){need(helpers<CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PRIMITIVE_REQUESTS.helpers);helpers+=1;b.current();await b.qualifyHelper(command);b.current();}return raw;
 };
 const props=(id:string):Promise<unknown>=>send({phase:"inverse-native-delete-cold-ui",role:"properties",method:"Runtime.getProperties",params:{objectId:id,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});
 const call=(role:Role,id:string,refs:readonly string[]):Promise<unknown>=>send(validate({phase:"inverse-native-delete-cold-ui",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:id,functionDeclaration:P[role],arguments:refs.map(value=>reference(value)),returnByValue:["ownIdentities","ownReprove","nativeDefaultInstance","nativeHooks"].includes(role)}}));
 const literal=bootResult(await send(validate({phase:"inverse-native-delete-cold-ui",role:"ownLiteral",method:"Runtime.callFunctionOn",params:{...FLAGS,uniqueContextId:b.uniqueContextId,functionDeclaration:P.ownLiteral,arguments:[],returnByValue:false}})),4);
 const literalRaw=await props(literal);const values=bootArray(literalRaw,4);const root=bootObject(values,0);const objectLiteral=bootObject(values,1);const functionLiteral=bootObject(values,3);
 need(values.get("0")?.type==="object"&&values.get("0")?.subtype===undefined&&values.get("1")?.className==="Object"&&values.get("1")?.subtype===undefined&&values.get("2")?.subtype==="array"&&values.get("3")?.type==="function");
 const objectProto=parent(await props(objectLiteral),"object",true);const arrayProto=parent(literalRaw,"array");const functionProto=parent(await props(functionLiteral),"function");
 const objectMembers=await props(objectProto);const arrayMembers=await props(arrayProto);const functionMembers=await props(functionProto);
 const objectCtor=property(objectMembers,"constructor","constructor");const arrayCtor=property(arrayMembers,"constructor","constructor");
 need(objectCtor.description==="function Object() { [native code] }"&&arrayCtor.description==="function Array() { [native code] }"&&objectCtor.objectId!==undefined&&arrayCtor.objectId!==undefined);
 const objectMethods=await props(objectCtor.objectId);const arrayMethods=await props(arrayCtor.objectId);
 const methods=["getOwnPropertyDescriptor","getPrototypeOf","hasOwn","getOwnPropertyNames","getOwnPropertySymbols"].map(name=>property(objectMethods,name,"method"));
 methods.push(property(arrayMethods,"isArray","method"),property(functionMembers,"apply","method"));const refs:string[]=[];
 for(const[index,method]of methods.entries()){const id=callable({result:method},index);refs.push(id);metadata(await props(id),index);}
 const op=property(objectMethods,"prototype","prototype");const ap=property(arrayMethods,"prototype","prototype");need(op.objectId!==undefined&&ap.objectId!==undefined);
 truth(await call("ownIdentities",root,[objectProto,arrayProto,functionProto,op.objectId,ap.objectId,parent(objectMethods,"function"),parent(arrayMethods,"function")]));
 const reflection=bootResult(await call("ownBind",root,[...refs,objectProto,arrayProto,functionProto,root]),11);truth(await call("ownReprove",reflection,[]));
 need(count===19&&helpers===4);
 const roleMap={roots:"nativeRoots",parents:"nativeParents",nextParents:"nativeNextParents",prototypes:"nativePrototypes",merge:"nativeMerge",members:"nativeMembers",defaultInstance:"nativeDefaultInstance",hooks:"nativeHooks",iterator:"nativeIterator",iteratorNext:"nativeIteratorNext",asyncPrototype:"nativeAsyncPrototype"}as const;
 const graph=await collectCurrentFootprintInverseGetIntrinsics({current:b.current,properties:props,call:(role,references):Promise<unknown>=>call(roleMap[role],reflection,references)});
 const tuple=async(role:Role,references:readonly string[],size:number):Promise<Readonly<{id:string;values:ReturnType<typeof array>}>>=>{
  const id=result(await call(role,reflection,references),size);const members=array(await props(id),size);
  for(const value of members){properties(await props(object(value)));}return{id,values:members};
 };
 const namespace=await tuple("reflect",[],1);const apply=await tuple("reflectApply",[namespace.id],1);const selected=apply.values[0];need(selected!==undefined);
 const raw=generic.parse({result:selected});decodeCurrentNativeFunctionMetadata(await props(raw.result.objectId),{name:"apply",arity:3,constructor:false});
 const original=result(await call("primitive",reflection,[graph.roots,graph.members,graph.qualified,graph.iterator,graph.iteratorProof,namespace.id,apply.id]),2);
 const originalValues=array(await props(original),2);need(originalValues.length===2);
 for(const value of originalValues){properties(await props(object(value)));}
 const reprove=originalValues[1];need(reprove?.type==="function"&&reprove.subtype===undefined);
 const rootValues=array(await props(graph.roots),20);const timer=rootValues[16];need(timer!==undefined);
 b.current();return Object.freeze({reflection,root,roots:graph.roots,members:graph.members,reflectApply:raw.result.objectId,reprove:object(reprove),originalSetTimeout:object(timer),asyncPrototype:graph.asyncPrototype,nativeRequests:count,helperRequests:helpers});
}
