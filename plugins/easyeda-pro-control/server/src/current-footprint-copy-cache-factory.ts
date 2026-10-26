/** Retain the cache factory installed at the original Gd constructor-end event.
 * The owner must qualify that event before capture and retain its receiver.
 * These reads do not invoke the factory or authorize cold-cache execution. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_PROFILES = freezeDeep([
  { name: "setCacheData", parameterCount: 1, lineNumber: 9, columnNumber: 9052,
    utf16Start: 276_399, utf16End: 276_431, sourceBytes: 32,
    sourceSha256: "0250461532b8206f3f1f5f7e8fa7ee99510c6c24ee4f53d2bee7ba362dd45006" },
  { name: "", parameterCount: 0, lineNumber: 109, columnNumber: 165_321,
    utf16Start: 2_012_634, utf16End: 2_012_657, sourceBytes: 23,
    sourceSha256: "eab725d34d5930d3980d0fb86c5ad5a5d0f8beebb5f011a597cf152223f8b41e" },
] as const);

const helpers = `"use strict";
const bad=()=>{throw new Error("FOOTPRINT_COPY_CACHE_FACTORY");};
const descriptors=[],prototypes=[];
const object=o=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();return o;};
const descriptor=(o,k)=>{object(o);const d=Object.getOwnPropertyDescriptor(o,k);descriptors.push([o,k,d]);return d;};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const absent=(o,k)=>{if(descriptor(o,k)!==undefined)bad();};
const proto=o=>{object(o);const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};
const chain=(o,names)=>{const result=[];let p=proto(o);for(const name of names){const c=own(p,"constructor");if(typeof c!=="function"||own(c,"name")!==name||own(c,"prototype")!==p)bad();result.push(p);p=proto(p);}if(p!==Object.prototype)bad();return result;};
const verify=()=>{for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad();for(const [o,k,d]of descriptors){const n=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?n!==undefined:!n||d.enumerable!==n.enumerable||d.configurable!==n.configurable||d.writable!==n.writable||d.get!==n.get||d.set!==n.set||!Object.is(d.value,n.value)||Object.hasOwn(d,"value")!==Object.hasOwn(n,"value"))bad();}};
chain(this,["Lg","Gd"]);
const consistency=own(this,"consistencyManager"),parents=chain(consistency,["ja","Vc","zy"]);
absent(consistency,"setCacheData");const setter=descriptor(parents[0],"setCacheData");
if(!setter||!Object.hasOwn(setter,"value")||typeof setter.value!=="function"||setter.writable!==true||setter.enumerable!==false||setter.configurable!==true)bad();
const factory=descriptor(consistency,"getCache");
if(!factory||!Object.hasOwn(factory,"value")||typeof factory.value!=="function"||factory.writable!==true||factory.enumerable!==true||factory.configurable!==true)bad();
const selected=[consistency,setter.value,factory.value];`;

export const CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_CALLS = freezeDeep({
  capture: { program: `function(){${helpers}\nverify();return selected;}`, arguments: 0, returnByValue: false },
  recheck: { program: `function(bus,bundle){${helpers}
if(own(globalThis,"PROJECT")!==this||own(this,"workerBus")!==bus||!Array.isArray(bundle)||proto(bundle)!==Array.prototype||own(bundle,"length")!==3||Reflect.ownKeys(bundle).length!==4)bad();
for(let i=0;i<3;i++)if(own(bundle,String(i))!==selected[i])bad();verify();return true;}`, arguments: 2, returnByValue: true },
});

const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(4096).refine(value => value.isWellFormed() && !value.includes("\0"));
const position = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]), subtype: text.optional(),
  className: text.optional(), description: text.optional(), objectId: token.optional(), value: z.union([z.null(), text, z.number(), position]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
function fail(): never { throw new Error("FOOTPRINT_COPY_CACHE_FACTORY_METADATA"); }

/** IDs remain private to the original event owner. Source hashes alone do not
 * establish the arrow's captured receiver or any cache backend behavior. */
export function decodeCurrentFootprintCopyCacheFactoryArray(input: unknown): Readonly<{
  consistencyId: string; setterId: string; factoryId: string;
}> {
  try {
    const reply = z.object({ result: z.array(property).length(4), internalProperties: z.array(internal).length(1) }).strict()
      .parse(captureCurrentPcbStringClockReply(input).value);
    const values = new Map(reply.result.map(item => [item.name, item]));
    if (values.size !== 4) { return fail(); }
    const consistency = values.get("0"), length = values.get("length"), parent = reply.internalProperties[0];
    if (length?.value.type !== "number" || length.value.value !== 3 || length.value.objectId !== undefined ||
        length.value.subtype !== undefined || length.value.className !== undefined || !length.writable || length.configurable || length.enumerable ||
        length.value.description !== undefined && length.value.description !== "3" ||
        consistency === undefined || !consistency.writable || !consistency.configurable || !consistency.enumerable ||
        consistency.value.type !== "object" || consistency.value.className !== "ja" || consistency.value.description !== "ja" ||
        consistency.value.objectId === undefined || consistency.value.subtype !== undefined || consistency.value.value !== undefined ||
        parent?.name !== "[[Prototype]]" || parent.value.type !== "object" || parent.value.subtype !== "array" ||
        parent.value.className !== "Array" || parent.value.objectId === undefined || parent.value.value !== undefined || parent.value.description !== "Array(0)") { return fail(); }
    const ids = CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_PROFILES.map((expected, index) => {
      const item = values.get(String(index + 1)), value = item?.value;
      if (item === undefined || !item.writable || !item.configurable || !item.enumerable || value?.type !== "function" ||
          value.className !== "Function" || value.objectId === undefined || value.value !== undefined || value.subtype !== undefined || value.description === undefined ||
          Buffer.byteLength(value.description) !== expected.sourceBytes || createHash("sha256").update(value.description).digest("hex") !== expected.sourceSha256) { return fail(); }
      return value.objectId;
    });
    const [setterId, factoryId] = ids;
    if (setterId === undefined || factoryId === undefined || new Set([consistency.value.objectId, setterId, factoryId]).size !== 3) { return fail(); }
    return Object.freeze({ consistencyId: consistency.value.objectId, setterId, factoryId });
  } catch { return fail(); }
}

export function decodeCurrentFootprintCopyCacheFactoryProperties(input: unknown, scriptId: string, index: number): Readonly<{
  scopesId: string; sourceLocationVerified: true; producerBindingVerified: false; executionAuthorized: false;
}> {
  try {
    token.parse(scriptId);
    const expected = Number.isInteger(index) && !Object.is(index, -0) ? CURRENT_FOOTPRINT_COPY_CACHE_FACTORY_PROFILES[index] : undefined;
    if (expected === undefined) { return fail(); }
    const reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) }).strict()
      .parse(captureCurrentPcbStringClockReply(input).value);
    const values = new Map(reply.result.map(item => [item.name, item]));
    if (values.size !== 2) { return fail(); }
    for (const name of ["name", "length"] as const) {
      const item = values.get(name), value = name === "name" ? expected.name : expected.parameterCount;
      if (item === undefined || item.writable || !item.configurable || item.enumerable ||
          item.value.type !== (name === "name" ? "string" : "number") || item.value.value !== value || Object.is(item.value.value, -0) ||
          item.value.objectId !== undefined || item.value.className !== undefined || item.value.subtype !== undefined ||
          item.value.description !== undefined && item.value.description !== String(value)) { return fail(); }
    }
    const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    const location = internals.get("[[FunctionLocation]]"), parent = internals.get("[[Prototype]]"), point = location?.value, scopes = internals.get("[[Scopes]]");
    if (internals.size !== 3 || location?.type !== "object" || location.subtype !== "internal#location" || location.objectId !== undefined ||
        point === null || typeof point !== "object" || point.scriptId !== scriptId || point.lineNumber !== expected.lineNumber || point.columnNumber !== expected.columnNumber ||
        parent?.type !== "function" || parent.className !== "Function" || parent.objectId === undefined || parent.value !== undefined ||
        scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" || scopes.objectId === undefined ||
        scopes.value !== undefined || !/^Scopes\[[1-8]\]$/u.test(scopes.description ?? "")) { return fail(); }
    return Object.freeze({ scopesId: scopes.objectId, sourceLocationVerified: true, producerBindingVerified: false, executionAuthorized: false });
  } catch { return fail(); }
}
