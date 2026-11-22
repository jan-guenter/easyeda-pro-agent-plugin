/** Fixed same-realm reflection collection. Syntax and pure descriptor
 * decoders are shared data; original full-owner custody must be supplied and
 * retained by Core around every request/helper await. No receipt here issues
 * an owner, callback, timer, mutation or replay grant. */
import {CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_FIELDS as FIELDS} from "./current-schematic-relevance-action-raw-programs.ts";
import {currentSchematicRelevanceRawArray,currentSchematicRelevanceRawHandle,currentSchematicRelevanceRawNativeConstructor,currentSchematicRelevanceRawProperties} from "./current-schematic-relevance-action-raw-replies.ts";
import {decodeCurrentNativeFunctionMetadata} from "./current-native-function-metadata.ts";
import {z} from "zod";
import {currentFootprintCopyClockRpcV2ArrayObject,decodeCurrentFootprintCopyClockRpcV2Array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture} from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {currentNativeOwnDataCallable,qualifyCurrentNativeOwnDataFunction} from "./current-native-own-data-intrinsics.ts";
import {currentFootprintInverseOwnDataParent,currentFootprintInverseOwnDataProperty} from "./current-footprint-inverse-own-data-replies.ts";
import {CURRENT_SCHEMATIC_WIRE_GLOBALS_FLAGS as FLAGS,CURRENT_SCHEMATIC_WIRE_GLOBALS_ORDER as ORDER,CURRENT_SCHEMATIC_WIRE_GLOBALS_PROGRAMS as PROGRAMS,currentSchematicWireGlobalsProgram,validateCurrentSchematicWireGlobalsCommand} from "./current-schematic-wire-globals-protocol.ts";
import type {CurrentSchematicWireGlobalsCommand as Command} from "./current-schematic-wire-globals-protocol.ts";

export interface CurrentSchematicWireGlobalsBindings{
 readonly uniqueContextId:string;
 readonly assertCurrent:()=>void;readonly request:(command:Command)=>Promise<unknown>;
 readonly qualifyHelper:(command:Command,program:string)=>Promise<void>;
}
export interface CurrentSchematicWireGlobalsCapture{
 readonly tuple:string;readonly reflection:string;readonly root:string;readonly roots:string;readonly packets:readonly unknown[];
}
const yes=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
const propertiesParams=(objectId:string):Readonly<{objectId:string;ownProperties:true;accessorPropertiesOnly:false;generatePreview:false}>=>Object.freeze({objectId,ownProperties:true as const,accessorPropertiesOnly:false as const,generatePreview:false as const});
 const id=(value:string|null|undefined):string=>{if(value===null||value===undefined){throw new Error("SCHEMATIC_WIRE_GLOBALS_REFERENCE");}return value;};
export async function captureCurrentSchematicWireGlobals(binding:CurrentSchematicWireGlobalsBindings):Promise<CurrentSchematicWireGlobalsCapture>{
 const current=binding.assertCurrent;current();let step=0;let helpers=0;const packets:unknown[]=[];

 const send=async(input:Command):Promise<unknown>=>{
  current();const command=validateCurrentSchematicWireGlobalsCommand(input);if(command.phase!==ORDER[step]){throw new Error("SCHEMATIC_WIRE_GLOBALS_ORDER");}step+=1;
  const raw=await binding.request(command);current();packets.push(raw);const program=currentSchematicWireGlobalsProgram(command);
  if(program!==null){helpers+=1;await binding.qualifyHelper(command,program);current();}return raw;
 };
 const properties=(role:string,objectId:string):Promise<unknown>=>send(validateCurrentSchematicWireGlobalsCommand({phase:`wire-globals-properties-${role}`,method:"Runtime.getProperties",params:propertiesParams(objectId)}));
 const call=(role:"identities"|"bind"|"reprove"|"globals"|"native"|"continuity",objectId:string,args:readonly string[]):Promise<unknown>=>send(validateCurrentSchematicWireGlobalsCommand({phase:`wire-globals-${role}`,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId,functionDeclaration:PROGRAMS[role],arguments:args.map(value=>({objectId:value})),returnByValue:role!=="bind"&&role!=="globals"&&role!=="native"}}));
    const literal=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await send({phase:"wire-globals-literal",method:"Runtime.callFunctionOn",params:{...FLAGS,uniqueContextId:binding.uniqueContextId,functionDeclaration:PROGRAMS.literal,arguments:[],returnByValue:false}}),4);
    const literalRaw=await properties("literal",literal);const values=decodeCurrentFootprintCopyClockRpcV2Array(literalRaw,4);const root=currentFootprintCopyClockRpcV2ArrayObject(values,0);const objectLiteral=currentFootprintCopyClockRpcV2ArrayObject(values,1);const functionLiteral=currentFootprintCopyClockRpcV2ArrayObject(values,3);if(values.get("0")?.type!=="object"||values.get("0")?.subtype!==undefined||values.get("1")?.type!=="object"||values.get("1")?.className!=="Object"||values.get("1")?.subtype!==undefined||values.get("2")?.subtype!=="array"||values.get("3")?.type!=="function"){throw new Error("SCHEMATIC_WIRE_GLOBALS_LITERAL");}
    const objectProto=currentFootprintInverseOwnDataParent(await properties("object-literal",objectLiteral),"object",true);const arrayProto=currentFootprintInverseOwnDataParent(literalRaw,"array");const functionProto=currentFootprintInverseOwnDataParent(await properties("function-literal",functionLiteral),"function");
    const objectMembers=await properties("object-prototype",objectProto);const arrayMembers=await properties("array-prototype",arrayProto);const functionMembers=await properties("function-prototype",functionProto);const objectConstructor=currentFootprintInverseOwnDataProperty(objectMembers,"constructor","constructor");const arrayConstructor=currentFootprintInverseOwnDataProperty(arrayMembers,"constructor","constructor");if(objectConstructor.description!=="function Object() { [native code] }"||arrayConstructor.description!=="function Array() { [native code] }"||objectConstructor.objectId===undefined||arrayConstructor.objectId===undefined){throw new Error("SCHEMATIC_WIRE_GLOBALS_CONSTRUCTORS");}
    const objectMethods=await properties("object-constructor",objectConstructor.objectId);const arrayMethods=await properties("array-constructor",arrayConstructor.objectId);const memberNames=["getOwnPropertyDescriptor","getPrototypeOf","hasOwn","getOwnPropertyNames","getOwnPropertySymbols"];const objectFunctions=memberNames.map(name=>currentFootprintInverseOwnDataProperty(objectMethods,name,"method"));const methods=[...objectFunctions,currentFootprintInverseOwnDataProperty(arrayMethods,"isArray","method"),currentFootprintInverseOwnDataProperty(functionMembers,"apply","method")];const references:string[]=[];
    for(const[index,method]of methods.entries()){const objectId=currentNativeOwnDataCallable({result:method},index);references.push(objectId);const command=validateCurrentSchematicWireGlobalsCommand({phase:`wire-globals-native-${String(index)}`,method:"Runtime.getProperties",params:propertiesParams(objectId)});const metadata=await send(command);qualifyCurrentNativeOwnDataFunction(metadata,index);}
    const actualObjectProto=currentFootprintInverseOwnDataProperty(objectMethods,"prototype","prototype");const actualArrayProto=currentFootprintInverseOwnDataProperty(arrayMethods,"prototype","prototype");if(actualObjectProto.objectId===undefined||actualArrayProto.objectId===undefined){throw new Error("SCHEMATIC_WIRE_GLOBALS_PROTOTYPES");}
    yes.parse(await call("identities",root,[objectProto,arrayProto,functionProto,actualObjectProto.objectId,actualArrayProto.objectId,currentFootprintInverseOwnDataParent(objectMethods,"function"),currentFootprintInverseOwnDataParent(arrayMethods,"function")]));
    const tuple=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await call("bind",root,[...references,objectProto,arrayProto,functionProto,root]),11);yes.parse(await call("reprove",tuple,[]));const roots=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await call("globals",tuple,[]),5);
 const rootValues=currentSchematicRelevanceRawArray(await properties("roots",roots),5,false,true);
 const functions:(string|null)[]=Array.from({length:FIELDS.length},()=>null),prototypes:(string|null)[]=[null,null,null,null];
 const collect=(raw:unknown,rootIndex:number):void=>{const fields=currentSchematicRelevanceRawProperties(raw);for(const[index,row]of FIELDS.entries()){if(row[0]===rootIndex){const field=fields.get(row[1]);if(field===undefined||field.enumerable||!field.configurable||(row[2]==="value"?(field.writable!==true||field.get!==undefined||field.set!==undefined):(field.value!==undefined||field.writable!==undefined||field.set?.type!=="undefined"))){throw new Error("SCHEMATIC_WIRE_GLOBALS_DESCRIPTOR");}functions[index]=currentSchematicRelevanceRawHandle(row[2]==="value"?field.value:field.get,"function");}}};
 const constructors=["Object",null,"Array","Map","Set"]as const;
 for(let i=0;i<5;i+=1){const raw=await properties(`root-${String(i)}`,id(rootValues[i]));const name=constructors[i];if(name!==null&&name!==undefined){prototypes[i===0?0:i-1]=currentSchematicRelevanceRawNativeConstructor(raw,name);}if(i<=2){collect(raw,i);}}
 for(let i=0;i<2;i+=1){collect(await properties(`prototype-${String(i)}`,id(prototypes[i+2])),i+3);}
 for(const[index,row]of FIELDS.entries()){decodeCurrentNativeFunctionMetadata(await properties(`function-${String(index)}`,id(functions[index])),{name:row[2]==="get"?`get ${row[1]}`:row[1],arity:row[3],constructor:false});}
 const native=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await call("native",roots,[...prototypes.map(value=>id(value)),...functions.map(value=>id(value))]),19);
 currentSchematicRelevanceRawArray(await properties("native",native),19,false,true);yes.parse(await call("continuity",tuple,[roots,native]));current();
 if(step!==46||helpers!==7||packets.length!==46){throw new Error("SCHEMATIC_WIRE_GLOBALS_INCOMPLETE");}
 return Object.freeze({tuple:native,reflection:tuple,root,roots,packets:Object.freeze([...packets])});
}
