/** Immutable capture of decoded CDP property-packet data, never application
 * objects behind objectId handles. Text/hash describe a canonical structured
 * snapshot, not the original transport bytes or native observation authority. */
import {createHash} from "node:crypto";
import {types} from "node:util";
import {CURRENT_PCB_DIAGNOSTIC_TRANSPORT_LIMITS as TRANSPORT} from "./current-pcb-diagnostic-transport-limits.ts";

// A <=1MiB JSON frame has <=floor((bytes+1)/2) value nodes. Its decoder
// Permits 64 containers. Canonical finite numbers need <=24 bytes: input
// Lexemes of 1/2/3 bytes expand by <=1/1/(10/3), and longer ones by <=6.
// Other JSON tokens do not grow. Thus 6MiB bounds canonical snapshot text;
// This local allocation ceiling changes no native frame/request/byte budget.
export const CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_LARGE_REPLY_LIMITS=Object.freeze({
 maximumTransportFrameBytes:1_048_576,maximumResultRows:4096,maximumValueNodes:524_288,
 maximumContainerDepth:64,maximumStringUnits:1_048_576,maximumSnapshotBytes:6_291_456,
}as const);
const LIMIT=CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_LARGE_REPLY_LIMITS;
if(TRANSPORT.maximumFrameBytes!==LIMIT.maximumTransportFrameBytes){throw new Error("WIRE_CLASSIC_LARGE_REPLY_TRANSPORT_PROFILE");}
function fail():never{throw new Error("WIRE_CLASSIC_LARGE_REPLY_CAPTURE");}
/** Proxy detection precedes reflection. Descriptor access rejects packet
 * accessors before their values are used; it never calls a remote getter. */
function own(value:object,key:string):unknown{
 const descriptor=Object.getOwnPropertyDescriptor(value,key);
 if(descriptor===undefined||!Object.hasOwn(descriptor,"value")||descriptor.enumerable!==true){return fail();}
 return descriptor.value as unknown;
}
export function captureCurrentSchematicWireClassicRpcLargeReply(input:unknown):Readonly<{value:unknown;text:string;sha256:string}>{
 if(input===null||typeof input!=="object"||types.isProxy(input)||Array.isArray(input)){return fail();}
 const prototype:unknown=Object.getPrototypeOf(input);if(prototype!==Object.prototype&&prototype!==null){return fail();}
 const rows=own(input,"result");if(rows===null||typeof rows!=="object"||types.isProxy(rows)||!Array.isArray(rows)){return fail();}
 const rowLength=Object.getOwnPropertyDescriptor(rows,"length");
 if(rowLength===undefined||!Object.hasOwn(rowLength,"value")||typeof rowLength.value!=="number"||rowLength.value>LIMIT.maximumResultRows){return fail();}
 let bytes=0;let nodes=0;const seen=new Set<object>();const chunks:string[]=[];
 const append=(text:string):void=>{const next=Buffer.byteLength(text);if(next>LIMIT.maximumSnapshotBytes-bytes){fail();}bytes+=next;chunks.push(text);};
 const quoted=(text:string):string=>{if(text.length>LIMIT.maximumStringUnits){return fail();}const result:unknown=JSON.stringify(text);if(typeof result!=="string"){return fail();}return result;};
 const copy=(value:unknown,depth:number):unknown=>{
  nodes+=1;if(nodes>LIMIT.maximumValueNodes){return fail();}
  if(value===null){append("null");return null;}
  if(typeof value==="boolean"){append(value?"true":"false");return value;}
  if(typeof value==="string"){append(quoted(value));return value;}
  if(typeof value==="number"){if(!Number.isFinite(value)){return fail();}append(Object.is(value,-0)?"-0":String(value));return value;}
  if(typeof value!=="object"||types.isProxy(value)||seen.has(value)||depth>=LIMIT.maximumContainerDepth){return fail();}seen.add(value);
  const parent:unknown=Object.getPrototypeOf(value);
  if(Array.isArray(value)){
   if(parent!==Array.prototype){return fail();}const length=Object.getOwnPropertyDescriptor(value,"length");
   if(length===undefined||!Object.hasOwn(length,"value")||typeof length.value!=="number"||!Number.isSafeInteger(length.value)||length.value<0||length.value>LIMIT.maximumValueNodes-nodes){return fail();}
   const count:number=length.value;const keys=Reflect.ownKeys(value);if(keys.length!==count+1){return fail();}
   const result:unknown[]=[];append("[");
   for(let index=0;index<count;index+=1){if(index!==0){append(",");}const key=String(index);Object.defineProperty(result,key,{value:copy(own(value,key),depth+1),enumerable:true});}
   append("]");return Object.freeze(result);
  }
  if(parent!==Object.prototype&&parent!==null){return fail();}const keys=Reflect.ownKeys(value);if(keys.length>LIMIT.maximumValueNodes-nodes){return fail();}
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This fresh empty null-prototype object receives only checked own data fields.
  const result:Record<string,unknown>=Object.create(null) as Record<string,unknown>;append("{");let index=0;
  for(const key of keys){if(typeof key!=="string"){return fail();}if(index!==0){append(",");}append(quoted(key));append(":");Object.defineProperty(result,key,{value:copy(own(value,key),depth+1),enumerable:true});index+=1;}
  append("}");return Object.freeze(result);
 };
 const value=copy(input,0);const text=chunks.join("");return Object.freeze({value,text,sha256:createHash("sha256").update(text).digest("hex")});
}
