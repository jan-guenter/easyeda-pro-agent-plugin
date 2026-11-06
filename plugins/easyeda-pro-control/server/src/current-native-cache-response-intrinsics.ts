/** Origin-free readonly native candidates. Each actual original owner must
 * qualify its own constructor/member metadata before use and retain its own
 * tuple/context. These programs invoke no cache/Response method or getter. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
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

const text = z.string().max(8192), token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "number", "string"]), subtype: text.optional(), className: text.optional(), description: text.optional(), objectId: token.optional(), value: z.union([text, z.number()]).optional() });
const property = z.strictObject({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: text, value: remote });
function need(value: boolean): asserts value { if (!value) { throw new Error("NATIVE_CACHE_RESPONSE_INTRINSIC_METADATA"); } }
/** Strict data validation is not native provenance. Supply only the original
 * correlated getProperties reply for this exact captured function slot. */
export function decodeCurrentNativeCacheResponseIntrinsic(input: unknown, index: number): void {
  const expected = CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES.find(value => value.index === index); need(expected !== undefined);
  const reply = z.strictObject({ result: z.array(property).min(2).max(6), internalProperties: z.array(internal).length(2) }).parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === reply.result.length);
  const allowed = new Set(["name", "length", ...(expected.constructor ? ["prototype"] : []), ...(expected.name === "Response" ? ["error", "redirect", "json"] : [])]);
  for (const name of fields.keys()) { need(allowed.has(name)); }
  for (const [name, value] of [["name", expected.name], ["length", expected.arity]] as const) {
    const item = fields.get(name); need(item !== undefined && !item.writable && !item.enumerable && item.configurable && item.value.value === value && item.value.objectId === undefined && item.value.subtype === undefined && item.value.type === (name === "name" ? "string" : "number"));
  }
  if (expected.constructor) { const item = fields.get("prototype"); need(item !== undefined && !item.writable && !item.enumerable && !item.configurable && item.value.type === "object" && item.value.className === expected.name && item.value.description === expected.name && item.value.objectId !== undefined && item.value.value === undefined); }
  else { need(fields.size === 2); }
  for (const name of ["error", "redirect", "json"]) { const item = fields.get(name); if (item !== undefined) { need(item.writable && item.enumerable && item.configurable && item.value.type === "function" && item.value.className === "Function" && item.value.description === `function ${name}() { [native code] }` && item.value.objectId !== undefined && item.value.value === undefined); } }
  const parts = new Map(reply.internalProperties.map(item => [item.name, item.value]));
  const parent = parts.get("[[Prototype]]"), scopes = parts.get("[[Scopes]]");
  need(parts.size === 2 && parent?.type === "function" && parent.className === "Function" && parent.description === "function () { [native code] }" && parent.objectId !== undefined && scopes?.type === "object" && scopes.className === "Array" && scopes.subtype === "internal#scopeList" && scopes.description === "Scopes[0]" && scopes.objectId !== undefined);
}
