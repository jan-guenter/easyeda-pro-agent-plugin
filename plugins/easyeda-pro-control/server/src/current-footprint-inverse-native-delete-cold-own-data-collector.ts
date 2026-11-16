/** Fixed same-realm reflection collection. Syntax and pure descriptor
 * decoders are shared data; original cold-owner custody must be supplied and
 * retained by the new cold Core factory around every request/helper await. No receipt here issues
 * an owner, callback, timer, mutation or replay grant. */
import {z} from "zod";
import {currentFootprintCopyClockRpcV2ArrayObject,decodeCurrentFootprintCopyClockRpcV2Array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture} from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {currentNativeOwnDataCallable,qualifyCurrentNativeOwnDataFunction} from "./current-native-own-data-intrinsics.ts";
import {currentFootprintInverseOwnDataParent,currentFootprintInverseOwnDataProperty} from "./current-footprint-inverse-own-data-replies.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_OWN_DATA_FLAGS as FLAGS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_OWN_DATA_PROGRAMS as PROGRAMS,currentFootprintInverseNativeDeleteColdOwnDataCases,currentFootprintInverseNativeDeleteColdOwnDataProgram,validateCurrentFootprintInverseNativeDeleteColdOwnDataCommand} from "./current-footprint-inverse-native-delete-cold-own-data-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteColdOwnDataCommand as Command} from "./current-footprint-inverse-native-delete-cold-own-data-protocol.ts";

export interface CurrentFootprintInverseNativeDeleteColdOwnDataBindings{
 readonly uniqueContextId:string;readonly originalProject:string;
 readonly assertCurrent:()=>void;readonly request:(command:Command)=>Promise<unknown>;
 readonly qualifyHelper:(command:Command,program:string)=>Promise<void>;
}
export interface CurrentFootprintInverseNativeDeleteColdOwnDataCapture{
 readonly tuple:string;readonly root:string;readonly packets:readonly unknown[];
}
const yes=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
const propertiesParams=(objectId:string):Readonly<{objectId:string;ownProperties:true;accessorPropertiesOnly:false;generatePreview:false}>=>Object.freeze({objectId,ownProperties:true as const,accessorPropertiesOnly:false as const,generatePreview:false as const});
export async function captureCurrentFootprintInverseNativeDeleteColdOwnData(binding:CurrentFootprintInverseNativeDeleteColdOwnDataBindings):Promise<CurrentFootprintInverseNativeDeleteColdOwnDataCapture>{
 const current=binding.assertCurrent;current();let step=0;let helpers=0;const packets:unknown[]=[];
 const order=currentFootprintInverseNativeDeleteColdOwnDataCases().slice(0,20).map(command=>command.phase);
 const send=async(input:Command):Promise<unknown>=>{
  current();const command=validateCurrentFootprintInverseNativeDeleteColdOwnDataCommand(input);if(command.phase!==order[step]){throw new Error("INVERSE_NATIVE_DELETE_COLD_OWN_DATA_ORDER");}step+=1;
  const raw=await binding.request(command);current();packets.push(raw);const program=currentFootprintInverseNativeDeleteColdOwnDataProgram(command);
  if(program!==null){helpers+=1;await binding.qualifyHelper(command,program);current();}return raw;
 };
 const properties=(role:string,objectId:string):Promise<unknown>=>send(validateCurrentFootprintInverseNativeDeleteColdOwnDataCommand({phase:`inverse-native-delete-cold-own-data-properties-${role}`,method:"Runtime.getProperties",params:propertiesParams(objectId)}));
 const call=(role:"identities"|"bind"|"reprove"|"rootJoin",objectId:string,args:readonly string[]):Promise<unknown>=>send(validateCurrentFootprintInverseNativeDeleteColdOwnDataCommand({phase:`inverse-native-delete-cold-own-data-${role}`,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId,functionDeclaration:PROGRAMS[role],arguments:args.map(value=>({objectId:value})),returnByValue:role!=="bind"}}));
    const literal=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await send({phase:"inverse-native-delete-cold-own-data-literal",method:"Runtime.callFunctionOn",params:{...FLAGS,uniqueContextId:binding.uniqueContextId,functionDeclaration:PROGRAMS.literal,arguments:[],returnByValue:false}}),4);
    const literalRaw=await properties("literal",literal);const values=decodeCurrentFootprintCopyClockRpcV2Array(literalRaw,4);const root=currentFootprintCopyClockRpcV2ArrayObject(values,0);const objectLiteral=currentFootprintCopyClockRpcV2ArrayObject(values,1);const functionLiteral=currentFootprintCopyClockRpcV2ArrayObject(values,3);if(values.get("0")?.type!=="object"||values.get("0")?.subtype!==undefined||values.get("1")?.type!=="object"||values.get("1")?.className!=="Object"||values.get("1")?.subtype!==undefined||values.get("2")?.subtype!=="array"||values.get("3")?.type!=="function"){throw new Error("INVERSE_NATIVE_DELETE_COLD_OWN_DATA_LITERAL");}
    const objectProto=currentFootprintInverseOwnDataParent(await properties("object-literal",objectLiteral),"object",true);const arrayProto=currentFootprintInverseOwnDataParent(literalRaw,"array");const functionProto=currentFootprintInverseOwnDataParent(await properties("function-literal",functionLiteral),"function");
    const objectMembers=await properties("object-prototype",objectProto);const arrayMembers=await properties("array-prototype",arrayProto);const functionMembers=await properties("function-prototype",functionProto);const objectConstructor=currentFootprintInverseOwnDataProperty(objectMembers,"constructor","constructor");const arrayConstructor=currentFootprintInverseOwnDataProperty(arrayMembers,"constructor","constructor");if(objectConstructor.description!=="function Object() { [native code] }"||arrayConstructor.description!=="function Array() { [native code] }"||objectConstructor.objectId===undefined||arrayConstructor.objectId===undefined){throw new Error("INVERSE_NATIVE_DELETE_COLD_OWN_DATA_CONSTRUCTORS");}
    const objectMethods=await properties("object-constructor",objectConstructor.objectId);const arrayMethods=await properties("array-constructor",arrayConstructor.objectId);const memberNames=["getOwnPropertyDescriptor","getPrototypeOf","hasOwn","getOwnPropertyNames","getOwnPropertySymbols"];const objectFunctions=memberNames.map(name=>currentFootprintInverseOwnDataProperty(objectMethods,name,"method"));const methods=[...objectFunctions,currentFootprintInverseOwnDataProperty(arrayMethods,"isArray","method"),currentFootprintInverseOwnDataProperty(functionMembers,"apply","method")];const references:string[]=[];
    for(const[index,method]of methods.entries()){const objectId=currentNativeOwnDataCallable({result:method},index);references.push(objectId);const command=validateCurrentFootprintInverseNativeDeleteColdOwnDataCommand({phase:`inverse-native-delete-cold-own-data-native-${String(index)}`,method:"Runtime.getProperties",params:propertiesParams(objectId)});const metadata=await send(command);qualifyCurrentNativeOwnDataFunction(metadata,index);}
    const actualObjectProto=currentFootprintInverseOwnDataProperty(objectMethods,"prototype","prototype");const actualArrayProto=currentFootprintInverseOwnDataProperty(arrayMethods,"prototype","prototype");if(actualObjectProto.objectId===undefined||actualArrayProto.objectId===undefined){throw new Error("INVERSE_NATIVE_DELETE_COLD_OWN_DATA_PROTOTYPES");}
    yes.parse(await call("identities",root,[objectProto,arrayProto,functionProto,actualObjectProto.objectId,actualArrayProto.objectId,currentFootprintInverseOwnDataParent(objectMethods,"function"),currentFootprintInverseOwnDataParent(arrayMethods,"function")]));
    const tuple=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await call("bind",root,[...references,objectProto,arrayProto,functionProto,root]),11);yes.parse(await call("reprove",tuple,[]));yes.parse(await call("rootJoin",tuple,[binding.originalProject]));current();if(step!==20||helpers!==5||packets.length!==20){throw new Error("INVERSE_NATIVE_DELETE_COLD_OWN_DATA_INCOMPLETE");}
 return Object.freeze({tuple,root,packets:Object.freeze([...packets])});
}
