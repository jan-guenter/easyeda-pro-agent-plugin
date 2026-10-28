/** Original wrapper and native Cache objects, without calling a cache method.
 * cacheName is the wrapper's declared namespace. The hidden browser namespace
 * still requires the original CacheStorage.open result to be captured. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_NATIVE_PROFILES = freezeDeep([
  { name: "Cache", arity: 0 }, { name: "put", arity: 2 },
  { name: "match", arity: 1 }, { name: "delete", arity: 1 },
] as const);

/** Included only in the fixed dependency capture, whose first sixty entries
 * source-qualify the actual lexical constructors and methods. */
export const CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_BINDING = String.raw`
const cacheClass=fun(bindings,"bb"),cachePrototype=own(cacheClass,"prototype"),cacheObjects=[];
if(own(cachePrototype,"constructor")!==cacheClass||proto(cacheClass)!==Function.prototype||proto(cachePrototype)!==Object.prototype)bad();
const nativeCacheClass=fun(globalThis,"Cache"),nativeCachePrototype=own(nativeCacheClass,"prototype");
if(own(nativeCachePrototype,"constructor")!==nativeCacheClass||proto(nativeCachePrototype)!==Object.prototype)bad();
const nativeCacheMethods=[nativeCacheClass];
for(const key of ["put","match","delete"]){const d=descriptor(nativeCachePrototype,key);if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||d.writable!==true||d.configurable!==true||d.enumerable!==true)bad();nativeCacheMethods.push(d.value);}
const cacheProjectUuid=own(project,"uuid");if(typeof cacheProjectUuid!=="string"||!/^[a-f\d]{64}$/.test(cacheProjectUuid))bad();
for(const [key,namespace]of [["cache","project_"+cacheProjectUuid+"_v6"],["localCache","localProject_"+cacheProjectUuid+"_v1"]]){
 const wrapper=own(project,key);if(proto(wrapper)!==cachePrototype||Reflect.ownKeys(wrapper).length!==2||own(wrapper,"cacheName")!==namespace)bad();
 for(const name of ["open","put","match","flowStrMatch","keys","delete"]){absent(wrapper,name);if(own(cachePrototype,name)!==method(cacheClass,name))bad();}
 const native=own(wrapper,"cache");if(proto(native)!==nativeCachePrototype||Reflect.ownKeys(native).length!==0)bad();cacheObjects.push(native);
}
if(own(project,"cache")===own(project,"localCache")||cacheObjects[0]===cacheObjects[1])bad();
selected.push(...cacheObjects,...nativeCacheMethods);`;

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const text = z.string().max(4096);
const value = z.object({ type: z.enum(["function", "object", "string", "number"]), subtype: text.optional(),
  className: text.optional(), description: text.optional(), objectId: token.optional(), value: z.union([text, z.number()]).optional() }).strict();
const property = z.object({ name: text, value, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value }).strict();
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("FOOTPRINT_COPY_BACKEND_CACHE_NATIVE"); } }

/** Native descriptions alone are insufficient. Bound/proxy/located functions,
 * nonempty scopes and extra own fields all refuse before any cache operation. */
export function decodeCurrentFootprintCopyBackendCacheNativeProperties(input: unknown, index: number): void {
  const expected = Number.isInteger(index) && !Object.is(index, -0) ? CURRENT_FOOTPRINT_COPY_BACKEND_CACHE_NATIVE_PROFILES[index] : undefined;
  need(expected !== undefined);
  const reply = z.object({ result: z.array(property).min(2).max(3), internalProperties: z.array(internal).length(2) }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item]));
  need(fields.size === (index === 0 ? 3 : 2) && fields.size === reply.result.length);
  for (const [name, expectedValue] of [["name", expected.name], ["length", expected.arity]] as const) {
    const item = fields.get(name);
    need(item !== undefined && !item.writable && !item.enumerable && item.configurable &&
      item.value.type === (name === "name" ? "string" : "number") && item.value.value === expectedValue && !Object.is(item.value.value, -0) &&
      item.value.objectId === undefined && item.value.subtype === undefined && item.value.className === undefined &&
      (item.value.description === undefined || item.value.description === String(expectedValue)));
  }
  if (index === 0) {
    const prototype = fields.get("prototype");
    need(prototype !== undefined && !prototype.writable && !prototype.enumerable && !prototype.configurable &&
      prototype.value.type === "object" && prototype.value.className === "Cache" && prototype.value.description === "Cache" &&
      prototype.value.objectId !== undefined && prototype.value.subtype === undefined && prototype.value.value === undefined);
  }
  const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
  const parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
  need(internals.size === 2 && parent?.type === "function" && parent.className === "Function" &&
    parent.description === "function () { [native code] }" && parent.objectId !== undefined && parent.value === undefined && parent.subtype === undefined &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" &&
    scopes.description === "Scopes[0]" && scopes.objectId !== undefined && scopes.value === undefined);
}
