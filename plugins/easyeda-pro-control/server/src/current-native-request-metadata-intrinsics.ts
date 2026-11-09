/** Native Request/Headers/AbortSignal descriptor candidates for complete cache
 * metadata. Source owners qualify every actual function before any getter or
 * method use. No supplied catalogue can grant native provenance. */
import { z } from "zod";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_NATIVE_REQUEST_METADATA_REQUIRED_GETTERS = ["url", "method", "headers", "destination", "referrer", "referrerPolicy", "mode", "credentials", "cache", "redirect", "integrity", "keepalive", "signal", "body", "bodyUsed"] as const;
export const CURRENT_NATIVE_REQUEST_METADATA_OPTIONAL_GETTERS = ["duplex", "isHistoryNavigation", "isReloadNavigation", "targetAddressSpace", "priority"] as const;
export const CURRENT_NATIVE_REQUEST_METADATA_MAX_FUNCTIONS = 3 + CURRENT_NATIVE_REQUEST_METADATA_REQUIRED_GETTERS.length + CURRENT_NATIVE_REQUEST_METADATA_OPTIONAL_GETTERS.length + 2 + 2;
const helpers = String.raw`"use strict";const bad=()=>{throw new Error("NATIVE_REQUEST_METADATA_INTRINSICS");};
const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();};
const constructors=()=>{const values=[globalThis,own(globalThis,"Request"),own(globalThis,"Headers"),own(globalThis,"AbortSignal")];for(let i=1;i<4;i++)if(typeof values[i]!=="function")bad();return values;};
const required=${JSON.stringify(CURRENT_NATIVE_REQUEST_METADATA_REQUIRED_GETTERS)},optional=${JSON.stringify(CURRENT_NATIVE_REQUEST_METADATA_OPTIONAL_GETTERS)};
const getter=(p,k)=>{const d=Object.getOwnPropertyDescriptor(p,k);if(!d||Object.hasOwn(d,"value")||typeof d.get!=="function"||d.set!==undefined||d.enumerable!==true||d.configurable!==true)bad();return d.get;};
const members=original=>{const values=constructors();for(let i=0;i<4;i++)if(own(original,String(i))!==values[i])bad();for(let i=1;i<4;i++){const p=own(values[i],"prototype");if(own(p,"constructor")!==values[i])bad();if(i<3&&Object.getPrototypeOf(p)!==Object.prototype)bad();values.push(p);}
for(const key of Reflect.ownKeys(values[4])){const d=Object.getOwnPropertyDescriptor(values[4],key);if(d&&!Object.hasOwn(d,"value")&&(typeof key!=="string"||(!required.includes(key)&&!optional.includes(key))))bad();}
const keys=[];for(const key of required){getter(values[4],key);keys.push(key);}for(const key of optional)if(Object.getOwnPropertyDescriptor(values[4],key)!==undefined){getter(values[4],key);keys.push(key);}values.push(keys);
for(const key of keys)values.push(getter(values[4],key));values.push(getter(values[6],"aborted"),getter(values[6],"reason"));for(const key of ["forEach","getSetCookie"]){const d=Object.getOwnPropertyDescriptor(values[5],key);if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||!d.writable||!d.enumerable||!d.configurable)bad();values.push(d.value);}return values;};
const reprove=original=>{const values=members(original),keys=own(original,"7");array(original,values.length);array(keys,values[7].length);for(let i=0;i<values.length;i++){if(i===7){for(let n=0;n<keys.length;n++)if(own(keys,String(n))!==values[7][n])bad();}else if(own(original,String(i))!==values[i])bad();}return values[7];};`;
export const CURRENT_NATIVE_REQUEST_METADATA_INTRINSIC_CALLS = freezeDeep({
  constructors: { program: `function(){${helpers}return constructors();}`, arguments: 0, returnByValue: false, throwOnSideEffect: true },
  members: { program: `function(){${helpers}array(this,4);return members(this);}`, arguments: 0, returnByValue: false, throwOnSideEffect: true },
  catalogue: { program: `function(){${helpers}const keys=reprove(this),result=[{index:1,name:"Request",arity:1,constructor:true},{index:2,name:"Headers",arity:0,constructor:true},{index:3,name:"AbortSignal",arity:0,constructor:true}];for(let i=0;i<keys.length;i++)result.push({index:8+i,name:"get "+keys[i],arity:0,constructor:false});result.push({index:8+keys.length,name:"get aborted",arity:0,constructor:false},{index:9+keys.length,name:"get reason",arity:0,constructor:false},{index:10+keys.length,name:"forEach",arity:1,constructor:false},{index:11+keys.length,name:"getSetCookie",arity:0,constructor:false});return result;}`, arguments: 0, returnByValue: true, throwOnSideEffect: true },
  reprove: { program: `function(){${helpers}reprove(this);return true;}`, arguments: 0, returnByValue: true, throwOnSideEffect: true },
});
const profileSchema = z.strictObject({ index: z.number().int().min(1).max(31), name: z.string().max(64), arity: z.number().int().min(0).max(1), constructor: z.boolean() });
export type CurrentNativeRequestMetadataCatalogue = readonly Readonly<z.infer<typeof profileSchema>>[];
export function decodeCurrentNativeRequestMetadataCatalogue(input: unknown): CurrentNativeRequestMetadataCatalogue {
  const profiles = z.array(profileSchema).min(22).max(CURRENT_NATIVE_REQUEST_METADATA_MAX_FUNCTIONS).parse(captureCurrentPcbStringClockReply(input).value);
  const prefix = [{ index: 1, name: "Request", arity: 1, constructor: true }, { index: 2, name: "Headers", arity: 0, constructor: true }, { index: 3, name: "AbortSignal", arity: 0, constructor: true }];
  const count = profiles.length - 7, getters = profiles.slice(3, -4), names = getters.map(value => value.name.slice(4));
  if (names.length !== count || names.length < CURRENT_NATIVE_REQUEST_METADATA_REQUIRED_GETTERS.length ||
      CURRENT_NATIVE_REQUEST_METADATA_REQUIRED_GETTERS.some((name, index) => names[index] !== name)) { throw new Error("NATIVE_REQUEST_METADATA_CATALOGUE"); }
  let optional = -1;
  for (const name of names.slice(CURRENT_NATIVE_REQUEST_METADATA_REQUIRED_GETTERS.length)) {
    const index = (CURRENT_NATIVE_REQUEST_METADATA_OPTIONAL_GETTERS as readonly string[]).indexOf(name);
    if (index <= optional) { throw new Error("NATIVE_REQUEST_METADATA_CATALOGUE"); } optional = index;
  }
  const expected = [...prefix, ...names.map((name, index) => ({ index: 8 + index, name: `get ${name}`, arity: 0, constructor: false })),
    { index: 8 + count, name: "get aborted", arity: 0, constructor: false }, { index: 9 + count, name: "get reason", arity: 0, constructor: false },
    { index: 10 + count, name: "forEach", arity: 1, constructor: false }, { index: 11 + count, name: "getSetCookie", arity: 0, constructor: false }];
  for (const [index, value] of profiles.entries()) { const e = expected[index]; if (e === undefined || value.index !== e.index || value.name !== e.name || value.arity !== e.arity || value.constructor !== e.constructor) { throw new Error("NATIVE_REQUEST_METADATA_CATALOGUE"); } }
  return freezeDeep(profiles);
}
export function decodeCurrentNativeRequestMetadataIntrinsic(input: unknown, catalogue: CurrentNativeRequestMetadataCatalogue, index: number): void {
  const expected = catalogue.find(value => value.index === index); if (expected === undefined) { throw new Error("NATIVE_REQUEST_METADATA_SLOT"); }
  decodeCurrentNativeFunctionMetadata(input, { ...expected, staticMethods: expected.name === "AbortSignal" ? ["abort", "timeout", "any"] : [],
    ...(expected.name === "AbortSignal" ? { parentDescription: "function EventTarget() { [native code] }" } : {}) });
}
