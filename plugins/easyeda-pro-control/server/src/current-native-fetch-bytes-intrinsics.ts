/** Origin-free native Fetch/DataView candidates. Capture/reproof invokes no
 * application, fetch or Response method. Actual metadata must be qualified by
 * the enclosing original worker before the bounded byte reader is callable. */
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_NATIVE_FETCH_BYTES_PROFILES = freezeDeep([
  { index: 1, name: "DataView", arity: 1, constructor: true }, { index: 3, name: "fetch", arity: 1, constructor: false },
  { index: 5, name: "getUint8", arity: 1, constructor: false }, { index: 6, name: "get byteLength", arity: 0, constructor: false },
]);
export const CURRENT_NATIVE_FETCH_BYTES_ARRAY_LENGTH = 7;
export const CURRENT_NATIVE_FETCH_BYTES_GUARDS = String.raw`"use strict";const bad=()=>{throw new Error("NATIVE_FETCH_BYTES_INTRINSICS");};
const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();};
const constructors=()=>{let owner=globalThis,fn=null;for(let i=0;i<6&&owner!==null;i++){const d=Object.getOwnPropertyDescriptor(owner,"fetch");if(d!==undefined){if(!Object.hasOwn(d,"value")||typeof d.value!=="function"||d.writable!==true||d.enumerable!==true||d.configurable!==true)bad();fn=d.value;break;}owner=Object.getPrototypeOf(owner);}const values=[globalThis,own(globalThis,"DataView"),owner,fn];if(typeof values[1]!=="function"||fn===null)bad();return values;};
const same=(original,values,n)=>{for(let i=0;i<n;i++)if(own(original,String(i))!==values[i])bad();};
const members=original=>{const values=constructors();same(original,values,4);const p=own(values[1],"prototype");if(own(p,"constructor")!==values[1]||Object.getPrototypeOf(p)!==Object.prototype)bad();values.push(p);
const m=Object.getOwnPropertyDescriptor(p,"getUint8"),g=Object.getOwnPropertyDescriptor(p,"byteLength");if(!m||!Object.hasOwn(m,"value")||typeof m.value!=="function"||m.writable!==true||m.enumerable!==false||m.configurable!==true||!g||Object.hasOwn(g,"value")||typeof g.get!=="function"||g.set!==undefined||g.enumerable!==false||g.configurable!==true)bad();values.push(m.value,g.get);return values;};
const reprove=original=>{array(original,7);same(original,members(original),7);};`;
export const CURRENT_NATIVE_FETCH_BYTES_CALLS = freezeDeep({
  constructors: { program: `function(){${CURRENT_NATIVE_FETCH_BYTES_GUARDS}return constructors();}`, returnByValue: false, throwOnSideEffect: true },
  members: { program: `function(){${CURRENT_NATIVE_FETCH_BYTES_GUARDS}array(this,4);return members(this);}`, returnByValue: false, throwOnSideEffect: true },
  reprove: { program: `function(){${CURRENT_NATIVE_FETCH_BYTES_GUARDS}reprove(this);return true;}`, returnByValue: true, throwOnSideEffect: true },
});
export function decodeCurrentNativeFetchBytesIntrinsic(input: unknown, index: number): void {
  const profile = CURRENT_NATIVE_FETCH_BYTES_PROFILES.find(value => value.index === index);
  if (profile === undefined) { throw new Error("NATIVE_FETCH_BYTES_METADATA"); } decodeCurrentNativeFunctionMetadata(input, profile);
}
