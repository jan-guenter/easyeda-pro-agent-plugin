/** Origin-free readonly native candidates. Each actual original owner must
 * qualify its own constructor/member metadata before use and retain its own
 * tuple/context. These programs invoke no cache/Response method or getter. */
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const methodTable = [
  [4, "put", 2], [4, "match", 1], [4, "delete", 1], [4, "keys", 0],
  [5, "open", 1], [5, "keys", 0], [5, "has", 1], [5, "delete", 1],
  [6, "clone", 0], [6, "arrayBuffer", 0],
] as const;
const getterTable = ["url", "redirected", "type", "status", "statusText", "ok", "headers", "body", "bodyUsed"] as const;
export const CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES = freezeDeep([
  { index: 1, name: "Cache", arity: 0, constructor: true }, { index: 2, name: "CacheStorage", arity: 0, constructor: true },
  { index: 3, name: "Response", arity: 0, constructor: true },
  ...methodTable.map(([, name, arity], index) => ({ index: 8 + index, name, arity, constructor: false })),
  ...getterTable.map((name, index) => ({ index: 18 + index, name: `get ${name}`, arity: 0, constructor: false })),
  { index: 27, name: "get caches", arity: 0, constructor: false },
]);
export const CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_ARRAY_LENGTH = 28;
const helpers = String.raw`"use strict";const bad=()=>{throw new Error("NATIVE_CACHE_RESPONSE_INTRINSICS");};
const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();};
const constructors=()=>{const values=[globalThis,own(globalThis,"Cache"),own(globalThis,"CacheStorage"),own(globalThis,"Response")];for(let i=1;i<4;i++)if(typeof values[i]!=="function")bad();return values;};
const same=(original,values,n)=>{for(let i=0;i<n;i++)if(own(original,String(i))!==values[i])bad();};
const members=original=>{const values=constructors();same(original,values,4);for(let i=1;i<4;i++){const p=own(values[i],"prototype");if(own(p,"constructor")!==values[i]||Object.getPrototypeOf(p)!==Object.prototype)bad();values.push(p);}
let owner=globalThis,getter=null;for(let i=0;i<6&&owner!==null;i++){const d=Object.getOwnPropertyDescriptor(owner,"caches");if(d!==undefined){if(Object.hasOwn(d,"value")||typeof d.get!=="function"||d.set!==undefined||d.enumerable!==true||d.configurable!==true)bad();getter=d.get;break;}owner=Object.getPrototypeOf(owner);}if(getter===null)bad();values.push(owner);
for(const[index,key]of ${JSON.stringify(methodTable)}){const d=Object.getOwnPropertyDescriptor(values[index],key);if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||d.writable!==true||d.enumerable!==true||d.configurable!==true)bad();values.push(d.value);}
for(const key of ${JSON.stringify(getterTable)}){const d=Object.getOwnPropertyDescriptor(values[6],key);if(!d||Object.hasOwn(d,"value")||typeof d.get!=="function"||d.set!==undefined||d.enumerable!==true||d.configurable!==true)bad();values.push(d.get);}values.push(getter);return values;};`;
export const CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS = freezeDeep({
  constructors: { program: `function(){${helpers}return constructors();}`, arguments: 0, returnByValue: false, throwOnSideEffect: true },
  /** The first three actual native constructors must be qualified before
   * inspecting their original prototypes; no constructor is called here. */
  members: { program: `function(){${helpers}array(this,4);return members(this);}`, arguments: 0, returnByValue: false, throwOnSideEffect: true },
  reprove: { program: `function(){${helpers}array(this,28);same(this,members(this),28);return true;}`, arguments: 0, returnByValue: true, throwOnSideEffect: true },
});

/** Strict data validation is not native provenance. Supply only the original
 * correlated getProperties reply for this exact captured function slot. */
export function decodeCurrentNativeCacheResponseIntrinsic(input: unknown, index: number): void {
  const expected = CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES.find(value => value.index === index);
  if (expected === undefined) { throw new Error("NATIVE_CACHE_RESPONSE_INTRINSIC_METADATA"); }
  decodeCurrentNativeFunctionMetadata(input, { ...expected, staticMethods: expected.name === "Response" ? ["error", "redirect", "json"] : [] });
}
