/** Separate fixed accessor metadata observation. The original caches getter is
 * retained without invoking it; no native roster or replay proof is inferred. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_GROUP = "easyeda-saved-cache-accessor-probe-v1";
export const CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_LIMITS = Object.freeze({ normal: 6, cleanup: 1, replyBytes: 32_768, resultBytes: 229_376 });
const helpers = String.raw`"use strict";const bad=()=>{throw Error("SAVED_CACHE_ACCESSOR_PROBE");},seen=[];
const descriptor=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);seen.push([o,k,d]);return d;};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const verify=()=>{for(const[o,k,d]of seen){const n=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?n!==undefined:!n||Reflect.ownKeys(d).length!==Reflect.ownKeys(n).length||Reflect.ownKeys(d).some(k=>!Object.is(d[k],n[k])))bad();}};
const flags=d=>{if(!d||!Object.hasOwn(d,"value"))bad();return{writable:d.writable,enumerable:d.enumerable,configurable:d.configurable};};
const select=()=>{const root=globalThis,host=own(root,"gVars"),project=own(host,"currentProject"),tabs=own(own(root,"UI"),"tabBar");
if(own(root,"PRO_EDITOR_VERSION")!=="3.2.209"||own(tabs,"currentTabId")!=="tab_page1")bad();
for(const key of ["projectId","branchUuid"]){const d=descriptor(project,key);if(d===undefined){if(key in project)bad();}else if(!Object.hasOwn(d,"value")||(key==="projectId"?d.value!==undefined:d.value!==undefined&&d.value!==""))bad();}
const cd=descriptor(root,"CacheStorage"),constructor=own(root,"CacheStorage");if(typeof constructor!=="function")bad();
const pd=descriptor(constructor,"prototype"),prototype=own(constructor,"prototype");if(prototype===null||typeof prototype!=="object")bad();
const bd=descriptor(prototype,"constructor"),md=descriptor(prototype,"match"),match=own(prototype,"match");if(own(prototype,"constructor")!==constructor||typeof match!=="function")bad();
const ad=descriptor(root,"caches");if(!ad||Object.hasOwn(ad,"value")||typeof ad.get!=="function"||ad.set!==undefined)bad();
return{values:[constructor,prototype,match,ad.get],baseline:JSON.stringify({globalConstructor:flags(cd),constructorPrototype:flags(pd),prototypeConstructor:flags(bd),match:flags(md),globalAccessor:{enumerable:ad.enumerable,configurable:ad.configurable,hasGetter:true,hasSetter:false}})};};`;
export const CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_CALLS = freezeDeep({
  // The tuple is fresh, unescaped private storage. Literal construction avoids
  // A debug-evaluate rejection of Object.defineProperty even on a fresh array.
  // Its writable baseline slot is observation data, never execution authority.
  capture: `function(){${helpers}const selected=select();verify();return[selected.values[0],selected.values[1],selected.values[2],selected.values[3],selected.baseline];}`,
  recheck: `function(){${helpers}if(!Array.isArray(this)||Object.getPrototypeOf(this)!==Array.prototype||Reflect.ownKeys(this).length!==6)bad();const length=descriptor(this,"length");if(!length||!Object.hasOwn(length,"value")||length.value!==5||length.writable!==true||length.enumerable!==false||length.configurable!==false)bad();const selected=select();for(let i=0;i<5;i++){const d=descriptor(this,String(i));if(!d||!Object.hasOwn(d,"value")||d.writable!==true||d.enumerable!==true||d.configurable!==true||d.value!==(i<4?selected.values[i]:selected.baseline))bad();}verify();return selected.baseline;}`,
});
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}(?![\s\S])/u);
const remote = z.object({ type: z.enum(["object", "function", "number", "string"]), subtype: z.string().max(128).optional(),
  className: z.string().max(128).optional(), description: z.string().max(4096).optional(), objectId: token.optional(), value: z.union([z.string().max(4096), z.number()]).optional() }).strict();
const property = z.object({ name: z.string().max(128), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) }).strict();
const flags = z.object({ writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean() }).strict();
export const currentFootprintSavedCacheAccessorDescriptorSchema = z.object({ globalConstructor: flags, constructorPrototype: flags,
  prototypeConstructor: flags, match: flags, globalAccessor: z.object({ enumerable: z.boolean(), configurable: z.boolean(),
    hasGetter: z.literal(true), hasSetter: z.literal(false) }).strict() }).strict();
function need(value: boolean): asserts value { if (!value) { throw new Error("SAVED_CACHE_ACCESSOR_PROBE_METADATA"); } }
export function decodeCurrentFootprintSavedCacheAccessorProbeArray(input: unknown): Readonly<{ constructor: string; prototype: string; match: string; getter: string; baseline: string }> {
  const internal = z.object({ name: z.literal("[[Prototype]]"), value: remote }).strict();
  const reply = z.object({ result: z.array(property).length(6), internalProperties: z.array(internal).length(1) }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(value => [value.name, value])); need(fields.size === 6);
  const baseline = fields.get("4"), length = fields.get("length"), parent = reply.internalProperties[0]?.value;
  need(length?.value.type === "number" && length.value.value === 5 && length.writable && !length.enumerable && !length.configurable);
  need(baseline?.value.type === "string" && typeof baseline.value.value === "string" && baseline.writable && baseline.enumerable && baseline.configurable);
  const parsed = currentFootprintSavedCacheAccessorDescriptorSchema.parse(JSON.parse(baseline.value.value) as unknown);
  need(JSON.stringify(parsed) === baseline.value.value);
  need(parent?.type === "object" && parent.subtype === "array" && parent.className === "Array" && parent.description === "Array(0)" && parent.objectId !== undefined);
  const ids = [0, 1, 2, 3].map(index => {
    const field = fields.get(String(index)), value = field?.value;
    need(field !== undefined && field.writable && field.enumerable && field.configurable && value?.type === (index === 1 ? "object" : "function") &&
      value.objectId !== undefined && value.value === undefined && value.subtype === undefined); return value.objectId;
  });
  const [constructor, prototype, match, getter] = ids; need(constructor !== undefined && prototype !== undefined && match !== undefined && getter !== undefined && new Set(ids).size === 4);
  return Object.freeze({ constructor, prototype, match, getter, baseline: baseline.value.value });
}
