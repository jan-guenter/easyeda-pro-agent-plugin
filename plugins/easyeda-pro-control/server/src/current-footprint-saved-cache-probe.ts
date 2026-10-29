/** Fixed metadata discovery only. No caches getter, CacheStorage method,
 * constructor, vendor getter or project navigation is invoked. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_SAVED_CACHE_PROBE_GROUP = "easyeda-saved-cache-native-probe-v1";
export const CURRENT_FOOTPRINT_SAVED_CACHE_PROBE_LIMITS = Object.freeze({ normal: 5, cleanup: 1, replyBytes: 32_768, resultBytes: 196_608 });
const helpers = String.raw`"use strict";const bad=()=>{throw Error("SAVED_CACHE_NATIVE_PROBE");},seen=[];
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
return{values:[constructor,prototype,match],baseline:JSON.stringify({globalConstructor:flags(cd),constructorPrototype:flags(pd),prototypeConstructor:flags(bd),match:flags(md)})};};`;
export const CURRENT_FOOTPRINT_SAVED_CACHE_PROBE_CALLS = freezeDeep({
  capture: `function(){${helpers}const selected=select(),result=selected.values;Object.defineProperty(result,"descriptorBaseline",{value:selected.baseline});verify();return result;}`,
  recheck: `function(){${helpers}if(!Array.isArray(this)||Object.getPrototypeOf(this)!==Array.prototype||Reflect.ownKeys(this).length!==5||own(this,"length")!==3)bad();const selected=select();for(let i=0;i<3;i++)if(own(this,String(i))!==selected.values[i])bad();if(own(this,"descriptorBaseline")!==selected.baseline)bad();verify();return selected.baseline;}`,
});
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}(?![\s\S])/u);
const remote = z.object({ type: z.enum(["object", "function", "number", "string"]), subtype: z.string().max(128).optional(),
  className: z.string().max(128).optional(), description: z.string().max(4096).optional(), objectId: token.optional(), value: z.union([z.string().max(4096), z.number()]).optional() }).strict();
const property = z.object({ name: z.string().max(128), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) }).strict();
const flags = z.object({ writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean() }).strict();
export const currentFootprintSavedCacheDescriptorSchema = z.object({ globalConstructor: flags, constructorPrototype: flags,
  prototypeConstructor: flags, match: flags }).strict();
function need(value: boolean): asserts value { if (!value) { throw new Error("SAVED_CACHE_NATIVE_PROBE_METADATA"); } }
export function decodeCurrentFootprintSavedCacheProbeArray(input: unknown): Readonly<{ constructor: string; prototype: string; match: string; baseline: string }> {
  const internal = z.object({ name: z.literal("[[Prototype]]"), value: remote }).strict();
  const reply = z.object({ result: z.array(property).length(5), internalProperties: z.array(internal).length(1) }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(value => [value.name, value])); need(fields.size === 5);
  const baseline = fields.get("descriptorBaseline"), length = fields.get("length"), parent = reply.internalProperties[0]?.value;
  need(length?.value.type === "number" && length.value.value === 3 && length.writable && !length.enumerable && !length.configurable);
  need(baseline?.value.type === "string" && typeof baseline.value.value === "string" && !baseline.writable && !baseline.enumerable && !baseline.configurable);
  const parsed = currentFootprintSavedCacheDescriptorSchema.parse(JSON.parse(baseline.value.value) as unknown);
  need(JSON.stringify(parsed) === baseline.value.value);
  need(parent?.type === "object" && parent.subtype === "array" && parent.className === "Array" && parent.description === "Array(0)" && parent.objectId !== undefined);
  const ids = [0, 1, 2].map(index => {
    const field = fields.get(String(index)), value = field?.value;
    need(field !== undefined && field.writable && field.enumerable && field.configurable && value?.type === (index === 1 ? "object" : "function") &&
      value.objectId !== undefined && value.value === undefined && value.subtype === undefined); return value.objectId;
  });
  const [constructor, prototype, match] = ids; need(constructor !== undefined && prototype !== undefined && match !== undefined && new Set(ids).size === 3);
  return Object.freeze({ constructor, prototype, match, baseline: baseline.value.value });
}
