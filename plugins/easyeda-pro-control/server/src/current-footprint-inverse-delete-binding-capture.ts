/** Purpose-local immutable capture for one actual callee. Lg's pinned class
 * description is43,658 bytes; the older clock packet limits stay unchanged. */
import { types } from "node:util";

function bad():never{throw new Error("FOOTPRINT_INVERSE_DELETE_BINDING_REPLY");}
export function captureCurrentFootprintInverseDeleteBindingReply(input:unknown):unknown{
 let nodes=0;const seen=new Set<object>();
 const copy=(value:unknown,depth:number):unknown=>{
  nodes+=1;if(nodes>1024||depth>12){return bad();}if(value===null||typeof value==="boolean"){return value;}
  if(typeof value==="string"){if(value.length>65_536||!value.isWellFormed()){return bad();}return value;}
  if(typeof value==="number"){if(!Number.isFinite(value)||Object.is(value,-0)){return bad();}return value;}
  if(typeof value!=="object"||types.isProxy(value)||seen.has(value)){return bad();}seen.add(value);
  const own=(key:string):unknown=>{const descriptor=Object.getOwnPropertyDescriptor(value,key);if(descriptor===undefined||!Object.hasOwn(descriptor,"value")||descriptor.enumerable!==true){return bad();}return descriptor.value as unknown;};
  if(Array.isArray(value)){const length=Object.getOwnPropertyDescriptor(value,"length");if(Object.getPrototypeOf(value)!==Array.prototype||length===undefined||!Object.hasOwn(length,"value")||typeof length.value!=="number"||!Number.isSafeInteger(length.value)||length.value<0||length.value>64||Reflect.ownKeys(value).length!==length.value+1){return bad();}return Object.freeze(Array.from({length:length.value},(_,index)=>copy(own(String(index)),depth+1)));}
  const keys=Reflect.ownKeys(value);const prototype:unknown=Object.getPrototypeOf(value);if(prototype!==Object.prototype&&prototype!==null||keys.length>32){return bad();}
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Fresh output receives only validated own data fields.
  const result=Object.create(null)as Record<string,unknown>;for(const key of keys){if(typeof key!=="string"||key.length>128||!key.isWellFormed()){return bad();}Object.defineProperty(result,key,{value:copy(own(key),depth+1),enumerable:true});}return Object.freeze(result);
 };
 const value=copy(input,0);if(Object.getOwnPropertyDescriptor(Object.prototype,"toJSON")!==undefined||Object.getOwnPropertyDescriptor(Array.prototype,"toJSON")!==undefined||Buffer.byteLength(JSON.stringify(value))>65_280){return bad();}return value;
}
