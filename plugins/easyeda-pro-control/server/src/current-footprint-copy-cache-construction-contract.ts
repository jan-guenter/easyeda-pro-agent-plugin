/** Four original bb.open events bind the declared namespaces to actual native
 * CacheStorage.open results. This observes existing startup calls only. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_PROFILES as WRAPPERS } from "./current-footprint-copy-backend-cache-profiles.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_GROUP = "easyeda-footprint-cache-construction-v1";
export const CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_SITES = freezeDeep([
  { role: "before", lineNumber: 106, columnNumber: 55_741 },
  { role: "after", lineNumber: 106, columnNumber: 55_902 },
] as const);
export const CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_REQUESTS = Object.freeze({ arm: 2, capture: 22, resumes: 4, remove: 2, join: 1, release: 1, reproof: 1, total: 32 });
export const CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_NATIVE_PROFILES = freezeDeep([
  { name: "Cache", arity: 0, constructor: true }, { name: "CacheStorage", arity: 0, constructor: true },
  { name: "open", arity: 1, constructor: false }, { name: "get caches", arity: 0, constructor: false },
] as const);
const helpers = String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_CACHE_CONSTRUCTION");},seen=[],parents=[];
const descriptor=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);seen.push([o,k,d]);return d;};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const absent=(o,k)=>{if(descriptor(o,k)!==undefined)bad();};
const proto=o=>{const p=Object.getPrototypeOf(o);parents.push([o,p]);return p;};
const array=(o,n)=>{if(!Array.isArray(o)||proto(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();};
const verify=()=>{for(const[o,p]of parents)if(Object.getPrototypeOf(o)!==p)bad();for(const[o,k,d]of seen){const n=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?n!==undefined:!n||Object.hasOwn(n,"value")!==Object.hasOwn(d,"value")||!Object.is(n.value,d.value)||n.get!==d.get||n.set!==d.set||n.writable!==d.writable||n.configurable!==d.configurable||n.enumerable!==d.enumerable)bad();}};
const method=(p,k)=>{const d=descriptor(p,k);if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||d.writable!==true||d.enumerable!==true||d.configurable!==true)bad();return d.value;};
const objects=(wrapper,path,ordinal)=>{
 if(typeof path!=="string"||!/^[a-f\d]{64}$/.test(path)||(ordinal!==0&&ordinal!==1))bad();
 const p=proto(wrapper),c=own(p,"constructor"),open=own(p,"open");if(typeof c!=="function"||own(c,"name")!=="bb"||own(c,"prototype")!==p||proto(p)!==Object.prototype||typeof open!=="function")bad();absent(wrapper,"open");
 if(own(wrapper,"cacheName")!==(ordinal===0?"project_"+path+"_v6":"localProject_"+path+"_v1"))bad();
 const cache=own(globalThis,"Cache"),storage=own(globalThis,"CacheStorage");if(typeof cache!=="function"||typeof storage!=="function")bad();
 const cp=own(cache,"prototype"),sp=own(storage,"prototype");if(own(cp,"constructor")!==cache||own(sp,"constructor")!==storage||proto(cp)!==Object.prototype||proto(sp)!==Object.prototype)bad();
 let node=globalThis,getter=null;for(let i=0;i<6&&node!==null;i++){const d=descriptor(node,"caches");if(d!==undefined){if(Object.hasOwn(d,"value")||typeof d.get!=="function"||d.set!==undefined||d.enumerable!==true||d.configurable!==true)bad();getter=d.get;break;}node=proto(node);}if(getter===null)bad();
 return[wrapper,c,open,cache,storage,method(sp,"open"),getter,globalThis];
};
const same=(left,right,start,n)=>{for(let i=start;i<n;i++)if(own(left,String(i))!==right[i])bad();};
const bound=(original,path,ordinal)=>{array(original,9);const values=objects(own(original,"0"),path,ordinal);same(original,values,0,8);const storage=own(original,"8");if(proto(storage)!==own(values[4],"prototype")||Reflect.ownKeys(storage).length!==0||Reflect.apply(values[6],globalThis,[])!==storage)bad();verify();return values;};`;
export const CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_CALLS = freezeDeep({
  before: { program: `function(path,ordinal,first){${helpers}
const values=objects(this,path,ordinal);absent(this,"cache");if(Reflect.ownKeys(this).length!==1)bad();
if(ordinal===0){if(first!==null)bad();}else{array(first,10);if(own(first,"0")===this)bad();same(first,values,1,8);}verify();return values;}`, arguments: 3, returnByValue: false },
  bind: { program: `function(path,ordinal){${helpers}
array(this,8);const values=objects(own(this,"0"),path,ordinal);same(this,values,0,8);absent(values[0],"cache");if(Reflect.ownKeys(values[0]).length!==1)bad();verify();
const storage=Reflect.apply(values[6],globalThis,[]);if(proto(storage)!==own(values[4],"prototype")||Reflect.ownKeys(storage).length!==0)bad();verify();return[...values,storage];}`, arguments: 2, returnByValue: false },
  after: { program: `function(original,path,ordinal){${helpers}
const values=bound(original,path,ordinal);if(own(original,"0")!==this||Reflect.ownKeys(this).length!==2)bad();const cache=own(this,"cache");if(proto(cache)!==own(values[3],"prototype")||Reflect.ownKeys(cache).length!==0)bad();verify();return[...values,own(original,"8"),cache];}`, arguments: 3, returnByValue: false },
  join: { program: `function(first,second,path){${helpers}
if(own(globalThis,"PROJECT")!==this||own(this,"uuid")!==path)bad();array(first,10);array(second,10);
for(const [original,key,ordinal]of [[first,"cache",0],[second,"localCache",1]]){const wrapper=own(this,key),values=objects(wrapper,path,ordinal);same(original,values,0,8);if(own(wrapper,"cache")!==own(original,"9")||Reflect.apply(values[6],globalThis,[])!==own(original,"8"))bad();}
if(own(first,"0")===own(second,"0")||own(first,"9")===own(second,"9")||own(first,"8")!==own(second,"8"))bad();same(first,[...second],1,8);verify();return true;}`, arguments: 3, returnByValue: true },
});

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const text = z.string().max(8192);
const remote = z.object({ type: z.enum(["object", "function", "number", "string"]), subtype: text.optional(), className: text.optional(),
  description: text.optional(), objectId: token.optional(), value: z.union([text, z.number()]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("FOOTPRINT_CACHE_CONSTRUCTION_PROTOCOL"); } }
export function footprintCacheConstructionHandle(input: unknown): string { return token.parse(input); }
export function decodeFootprintCacheConstructionArray(input: unknown, length: 8 | 9 | 10): readonly string[] {
  const reply = z.object({ result: z.array(property).length(length + 1), internalProperties: z.array(internal).length(1) }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === length + 1);
  const count = fields.get("length"); need(count?.value.type === "number" && count.value.value === length && count.writable && !count.enumerable && !count.configurable);
  const ids: string[] = [];
  for (let index = 0; index < length; index += 1) {
    const item = fields.get(String(index)), value = item?.value;
    need(item !== undefined && item.writable && item.configurable && item.enumerable && value?.objectId !== undefined && value.value === undefined && value.subtype === undefined);
    if (index >= 1 && index <= 6) {
      const expected = index < 3 ? WRAPPERS[index - 1] : undefined;
      need(value.type === "function" && value.className === (index === 2 ? "AsyncFunction" : "Function") && value.description !== undefined);
      if (expected === undefined) { const native = CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_NATIVE_PROFILES[index - 3]; need(native !== undefined && value.description === `function ${native.name}() { [native code] }`); }
      else { need(Buffer.byteLength(value.description) === expected.bytes && createHash("sha256").update(value.description).digest("hex") === expected.sha256); }
    } else { need(value.type === "object" && value.className === ({ 0: "bb", 7: "DedicatedWorkerGlobalScope", 8: "CacheStorage", 9: "Cache" }[index])); }
    ids.push(value.objectId);
  }
  const parent = reply.internalProperties[0]; need(parent?.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" &&
    parent.value.className === "Array" && parent.value.description === "Array(0)" && parent.value.objectId !== undefined && new Set(ids).size === length);
  return Object.freeze(ids);
}
export function decodeFootprintCacheConstructionNative(input: unknown, index: number): void {
  const expected = CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_NATIVE_PROFILES[index]; need(expected !== undefined && Number.isInteger(index) && !Object.is(index, -0));
  const reply = z.object({ result: z.array(property).length(expected.constructor ? 3 : 2), internalProperties: z.array(internal).length(2) }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === reply.result.length);
  for (const [name, value] of [["name", expected.name], ["length", expected.arity]] as const) {
    const item = fields.get(name); need(item !== undefined && !item.writable && item.configurable && !item.enumerable && item.value.value === value &&
      item.value.type === (name === "name" ? "string" : "number") && !Object.is(item.value.value, -0) && item.value.objectId === undefined);
  }
  if (expected.constructor) { const item = fields.get("prototype"); need(item !== undefined && !item.writable && !item.enumerable && !item.configurable &&
    item.value.type === "object" && item.value.className === expected.name && item.value.description === expected.name && item.value.objectId !== undefined && item.value.value === undefined); }
  const internals = new Map(reply.internalProperties.map(item => [item.name, item.value])), parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
  need(internals.size === 2 && parent?.type === "function" && parent.className === "Function" && parent.description === "function () { [native code] }" &&
    parent.objectId !== undefined && scopes?.type === "object" && scopes.className === "Array" && scopes.subtype === "internal#scopeList" &&
    scopes.description === "Scopes[0]" && scopes.objectId !== undefined);
}

export type CurrentFootprintCacheConstructionCommand =
  | Readonly<{ method: "Debugger.setBreakpoint"; params: Readonly<{ location: Readonly<{ scriptId: string; lineNumber: 106; columnNumber: 55_741 | 55_902 }> }> }>
  | Readonly<{ method: "Debugger.removeBreakpoint"; params: Readonly<{ breakpointId: string }> }>
  | Readonly<{ method: "Debugger.resume"; params: Readonly<Record<string, never>> }>
  | Readonly<{ method: "Debugger.evaluateOnCallFrame"; params: Readonly<{ callFrameId: string; expression: "this"; objectGroup: typeof CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_GROUP;
    returnByValue: false; silent: true; generatePreview: false; throwOnSideEffect: true; includeCommandLineAPI: false }> }>
  | Readonly<{ method: "Runtime.getProperties"; params: Readonly<{ objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false }> }>
  | Readonly<{ method: "Runtime.callFunctionOn"; params: Readonly<{ objectId: string; functionDeclaration: string;
    arguments: readonly Readonly<{ objectId: string } | { value: string | number | null }>[]; objectGroup: typeof CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_GROUP;
    returnByValue: boolean; silent: true; generatePreview: false; throwOnSideEffect: true; awaitPromise: false; userGesture: false }> }>
  | Readonly<{ method: "Runtime.releaseObjectGroup"; params: Readonly<{ objectGroup: typeof CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_GROUP }> }>;
