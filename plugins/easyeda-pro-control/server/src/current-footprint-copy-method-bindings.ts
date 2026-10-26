/** Original current209 footprint method objects and exact source metadata.
 * These synchronous reads never invoke GET_STR or qualify its cache producers. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_METHOD_PROFILES = freezeDeep([
  { name: "getStr", parameterCount: 1, async: true, lineNumber: 109, columnNumber: 42_945,
    utf16Start: 1_890_246, utf16End: 1_890_717, sourceBytes: 471,
    sourceSha256: "8f2466efb348dbaae6eee3631eec72f26a1547d9812a0c00126414e805fc6013" },
  { name: "get maxTicket", parameterCount: 0, async: false, lineNumber: 109, columnNumber: 9133,
    utf16Start: 1_856_433, utf16End: 1_856_510, sourceBytes: 77,
    sourceSha256: "b2d7068621557b1b72c1a4332fcde13ccff1858349cc199d6894935f5c7fb106" },
  { name: "getMaxTicket", parameterCount: 0, async: false, lineNumber: 4, columnNumber: 3316,
    utf16Start: 242_716, utf16End: 242_753, sourceBytes: 37,
    sourceSha256: "60c8a23917d7db26fd8f02dd4ebd730ac547a2f52221b0a42fb472a5d830a93c" },
  { name: "getCanvasByConsistency", parameterCount: 4, async: false, lineNumber: 110, columnNumber: 132_033,
    utf16Start: 2_146_221, utf16End: 2_146_420, sourceBytes: 199,
    sourceSha256: "f4f434afc27e1e7a274c63627adc50e58868a9b395df629f5334d91213cf03f9" },
  { name: "compress", parameterCount: 0, async: false, lineNumber: 110, columnNumber: 117_530,
    utf16Start: 2_131_732, utf16End: 2_131_913, sourceBytes: 181,
    sourceSha256: "30371572974d9f7abfb4a94a2fa557915c8b5d0e713a1cab6539e2b7b740861b" },
] as const);

const helpers = `"use strict";
const bad=()=>{throw new Error("FOOTPRINT_COPY_METHOD_BINDING");};
const descriptors=[],prototypes=[];
const object=o=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();return o;};
const descriptor=(o,k)=>{object(o);const d=Object.getOwnPropertyDescriptor(o,k);descriptors.push([o,k,d]);return d;};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const absent=(o,k)=>{if(descriptor(o,k)!==undefined)bad();};
const proto=o=>{object(o);const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};
const array=(o,count)=>{if(!Array.isArray(o)||proto(o)!==Array.prototype||own(o,"length")!==count||Reflect.ownKeys(o).length!==count+1)bad();for(let i=0;i<count;i++)if(typeof own(o,String(i))!=="function")bad();return o;};
const chain=(o,names,original,offset)=>{const result=[];let p=proto(o);for(let i=0;i<names.length;i++){const c=own(p,"constructor");if(typeof c!=="function"||own(c,"name")!==names[i]||own(c,"prototype")!==p||original!==null&&own(original,String(offset+i))!==c)bad();result.push(p);p=proto(p);}if(p!==Object.prototype)bad();return result;};
const method=(o,parents,k,index)=>{absent(o,k);for(let i=0;i<index;i++)absent(parents[i],k);const d=descriptor(parents[index],k);if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||d.writable!==true||d.enumerable!==false||d.configurable!==true)bad();return d.value;};
const verify=()=>{for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad();for(const [o,k,d]of descriptors){const n=Object.getOwnPropertyDescriptor(o,k);if(d===undefined?n!==undefined:!n||d.enumerable!==n.enumerable||d.configurable!==n.configurable||d.writable!==n.writable||d.get!==n.get||d.set!==n.set||!Object.is(d.value,n.value)||Object.hasOwn(d,"value")!==Object.hasOwn(n,"value"))bad();}};
if(own(globalThis,"PROJECT")!==this||own(this,"workerBus")!==bus||own(this,"footprint")!==manager||own(this,"consistencyManager")!==consistency||own(manager,"projectManager")!==this)bad();
array(constructors,6);
const footprintChain=chain(manager,["Tg","ar","Pi"],constructors,0),consistencyChain=chain(consistency,["ja","Vc","zy"],constructors,3),projectChain=chain(this,["Lg","Gd"],null,0);
const getStr=method(manager,footprintChain,"getStr",0),getMaxTicket=method(consistency,consistencyChain,"getMaxTicket",1),getCanvas=method(this,projectChain,"getCanvasByConsistency",0),compress=method(this,projectChain,"compress",0);
absent(manager,"maxTicket");absent(footprintChain[0],"maxTicket");absent(footprintChain[1],"maxTicket");
const ticket=descriptor(footprintChain[2],"maxTicket");if(!ticket||typeof ticket.get!=="function"||ticket.set!==undefined||Object.hasOwn(ticket,"value")||ticket.enumerable!==false||ticket.configurable!==true)bad();
const selected=[getStr,ticket.get,getMaxTicket,getCanvas,compress];`;

/** Checked against an isolated Chromium156 localhost inspector and Node24's
 * Uint8Array. Neither probe admits these shapes in the pinned Chromium146. */
export const CURRENT_FOOTPRINT_COPY_NATIVE_METHOD_PROFILES = freezeDeep([
  { name: "match", parameterCount: 1 }, { name: "get body", parameterCount: 0 },
  { name: "getReader", parameterCount: 0 }, { name: "read", parameterCount: 0 },
  { name: "cancel", parameterCount: 0 }, { name: "releaseLock", parameterCount: 0 },
  { name: "TextDecoder", parameterCount: 0 }, { name: "decode", parameterCount: 0 },
  { name: "Uint8Array", parameterCount: 3 },
] as const);

const nativeHelpers = `
const nativeClass=name=>{const c=own(globalThis,name);if(typeof c!=="function"||own(c,"name")!==name)bad();const p=own(c,"prototype");if(own(p,"constructor")!==c)bad();return[c,p];};
const cache=nativeClass("Cache"),response=nativeClass("Response"),stream=nativeClass("ReadableStream"),reader=nativeClass("ReadableStreamDefaultReader"),decoder=nativeClass("TextDecoder"),bytes=nativeClass("Uint8Array");
const nativeMethod=(p,k)=>{const d=descriptor(p,k);if(!d||!Object.hasOwn(d,"value")||typeof d.value!=="function"||d.writable!==true||d.enumerable!==true||d.configurable!==true)bad();return d.value;};
const body=descriptor(response[1],"body");if(!body||typeof body.get!=="function"||body.set!==undefined||Object.hasOwn(body,"value")||body.enumerable!==true||body.configurable!==true)bad();
selected.push(nativeMethod(cache[1],"match"),body.get,nativeMethod(stream[1],"getReader"),nativeMethod(reader[1],"read"),nativeMethod(reader[1],"cancel"),nativeMethod(reader[1],"releaseLock"),decoder[0],nativeMethod(decoder[1],"decode"),bytes[0]);`;

export const CURRENT_FOOTPRINT_COPY_METHOD_CALLS = freezeDeep({
  capture: { program: `function(bus,manager,consistency,constructors){${helpers}\nverify();return selected;}`, arguments: 4, returnByValue: false },
  recheck: { program: `function(bus,manager,consistency,constructors,methods){${helpers}\narray(methods,5);for(let i=0;i<5;i++)if(own(methods,String(i))!==selected[i])bad();verify();return true;}`, arguments: 5, returnByValue: true },
  "cache-capture": { program: `function(bus,manager,consistency,constructors){${helpers}${nativeHelpers}\nverify();return selected;}`, arguments: 4, returnByValue: false },
  "cache-recheck": { program: `function(bus,manager,consistency,constructors,methods){${helpers}${nativeHelpers}\narray(methods,14);for(let i=0;i<14;i++)if(own(methods,String(i))!==selected[i])bad();verify();return true;}`, arguments: 5, returnByValue: true },
});
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(4096).refine(value => value.isWellFormed() && !value.includes("\0"));
const position = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]), subtype: text.optional(),
  className: text.optional(), description: text.optional(), objectId: token.optional(), value: z.union([z.null(), text, z.number(), position]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
function fail(): never { throw new Error("FOOTPRINT_COPY_METHOD_METADATA"); }
function profile(index: number): (typeof CURRENT_FOOTPRINT_COPY_METHOD_PROFILES)[number] {
  if (!Number.isInteger(index) || Object.is(index, -0)) { return fail(); }
  return CURRENT_FOOTPRINT_COPY_METHOD_PROFILES[index] ?? fail();
}

/** Decode only the original capture's getProperties reply. These remote IDs
 * become capabilities only inside its retained owner, never from caller JSON. */
export function decodeCurrentFootprintCopyMethodArray(input: unknown): readonly string[] {
  try {
    const reply = z.object({ result: z.array(property).length(6), internalProperties: z.array(internal).length(1) }).strict()
      .parse(captureCurrentPcbStringClockReply(input).value);
    const values = new Map(reply.result.map(item => [item.name, item]));
    if (values.size !== 6) { return fail(); }
    const length = values.get("length");
    if (length?.value.type !== "number" || length.value.value !== 5 || length.value.objectId !== undefined ||
        length.value.subtype !== undefined || length.value.className !== undefined || !length.writable || length.configurable || length.enumerable ||
        length.value.description !== undefined && length.value.description !== "5") { return fail(); }
    const ids = CURRENT_FOOTPRINT_COPY_METHOD_PROFILES.map((expected, index) => {
      const item = values.get(String(index)), value = item?.value;
      if (item === undefined || !item.writable || !item.configurable || !item.enumerable || value?.type !== "function" ||
          value.className !== (expected.async ? "AsyncFunction" : "Function") || value.objectId === undefined ||
          value.value !== undefined || value.subtype !== undefined || value.description === undefined ||
          Buffer.byteLength(value.description) !== expected.sourceBytes || createHash("sha256").update(value.description).digest("hex") !== expected.sourceSha256) { return fail(); }
      return value.objectId;
    });
    const parent = reply.internalProperties[0];
    if (new Set(ids).size !== 5 || parent?.name !== "[[Prototype]]" || parent.value.type !== "object" ||
        parent.value.subtype !== "array" || parent.value.className !== "Array" || parent.value.objectId === undefined ||
        parent.value.value !== undefined || parent.value.description !== "Array(0)") { return fail(); }
    return Object.freeze(ids);
  } catch { return fail(); }
}

/** Complete source must already be admitted. Metadata verifies a location in
 * that script; it does not prove closure values or the transitive cache path. */
export function decodeCurrentFootprintCopyMethodProperties(input: unknown, scriptId: string, index: number):
Readonly<{ scopesId: string; sourceLocationVerified: true; producerBindingVerified: false; executionAuthorized: false }> {
  try {
    token.parse(scriptId); const expected = profile(index);
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
    const location = internals.get("[[FunctionLocation]]"), parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
    const point = location?.value;
    if (internals.size !== 3 || location?.type !== "object" || location.subtype !== "internal#location" ||
        location.objectId !== undefined || point === null || typeof point !== "object" || point.scriptId !== scriptId ||
        point.lineNumber !== expected.lineNumber || point.columnNumber !== expected.columnNumber ||
        parent?.type !== (expected.async ? "object" : "function") || parent.className !== (expected.async ? "AsyncFunction" : "Function") ||
        parent.objectId === undefined || parent.value !== undefined ||
        scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" || scopes.objectId === undefined ||
        scopes.value !== undefined || !/^Scopes\[[1-8]\]$/u.test(scopes.description ?? "")) { return fail(); }
    return Object.freeze({ scopesId: scopes.objectId, sourceLocationVerified: true, producerBindingVerified: false, executionAuthorized: false });
  } catch { return fail(); }
}

/** Exact native descriptions reject JavaScript lookalikes; metadata below
 * additionally rejects bound functions, proxies and located script bodies. */
export function decodeCurrentFootprintCopyCacheMethodArray(input: unknown): readonly string[] {
  try {
    const reply = z.object({ result: z.array(property).length(15), internalProperties: z.array(internal).length(1) }).strict()
      .parse(captureCurrentPcbStringClockReply(input).value);
    const values = new Map(reply.result.map(item => [item.name, item]));
    if (values.size !== 15) { return fail(); }
    const length = values.get("length");
    if (length?.value.type !== "number" || length.value.value !== 14 || length.value.objectId !== undefined ||
        length.value.subtype !== undefined || length.value.className !== undefined || !length.writable || length.configurable || length.enumerable ||
        length.value.description !== undefined && length.value.description !== "14") { return fail(); }
    const first = Array.from({ length: 5 }, (_, index) => values.get(String(index)) ?? fail());
    const ids = [...decodeCurrentFootprintCopyMethodArray({ result: [...first, { ...length,
      value: { type: "number", value: 5, description: "5" } }], internalProperties: reply.internalProperties })];
    for (const [index, expected] of CURRENT_FOOTPRINT_COPY_NATIVE_METHOD_PROFILES.entries()) {
      const item = values.get(String(index + 5)), value = item?.value;
      if (item === undefined || !item.writable || !item.configurable || !item.enumerable || value?.type !== "function" ||
          value.className !== "Function" || value.objectId === undefined || value.value !== undefined || value.subtype !== undefined ||
          value.description !== `function ${expected.name}() { [native code] }`) { return fail(); }
      ids.push(value.objectId);
    }
    if (new Set(ids).size !== 14) { return fail(); }
    return Object.freeze(ids);
  } catch { return fail(); }
}

/** Index0..8 corresponds to native bundle slots5..13. Native Scopes[0] is
 * allowed; nonempty scopes, FunctionLocation and all unknown internals refuse.
 * This proves metadata only, while the owner retains the actual object IDs. */
export function decodeCurrentFootprintCopyNativeMethodProperties(input: unknown, index: number): Readonly<{
  nativeMetadataVerified: true; executionAuthorized: false;
}> {
  try {
    const expected = Number.isInteger(index) && !Object.is(index, -0) ? CURRENT_FOOTPRINT_COPY_NATIVE_METHOD_PROFILES[index] : undefined;
    if (expected === undefined) { return fail(); }
    const constructor = index === 6 || index === 8;
    const keys = ["length", "name"];
    if (constructor) { keys.push("prototype"); }
    if (index === 8) { keys.push("BYTES_PER_ELEMENT"); }
    const reply = z.object({ result: z.array(property).min(2).max(6), internalProperties: z.array(internal).length(2) }).strict()
      .parse(captureCurrentPcbStringClockReply(input).value);
    // The observed Chromium constructor adds this exact pair. These functions
    // Are never invoked; no arbitrary static properties or partial pair pass.
    const encodingStatics = index === 8 && reply.result.length === 6;
    if (encodingStatics) { keys.push("fromBase64", "fromHex"); }
    const values = new Map(reply.result.map(item => [item.name, item]));
    if (values.size !== keys.length || reply.result.length !== keys.length || keys.some(key => !values.has(key))) { return fail(); }
    for (const name of ["name", "length"] as const) {
      const item = values.get(name), value = name === "name" ? expected.name : expected.parameterCount;
      if (item === undefined || item.writable || !item.configurable || item.enumerable ||
          item.value.type !== (name === "name" ? "string" : "number") || item.value.value !== value || Object.is(item.value.value, -0) ||
          item.value.objectId !== undefined || item.value.className !== undefined || item.value.subtype !== undefined ||
          item.value.description !== undefined && item.value.description !== String(value)) { return fail(); }
    }
    if (constructor) {
      const name = index === 8 ? "TypedArray" : "TextDecoder", prototype = values.get("prototype");
      if (prototype === undefined || prototype.writable || prototype.enumerable || prototype.configurable ||
          prototype.value.type !== "object" || prototype.value.className !== name || prototype.value.description !== name ||
          prototype.value.objectId === undefined || prototype.value.value !== undefined || prototype.value.subtype !== undefined) { return fail(); }
    }
    if (index === 8) {
      const size = values.get("BYTES_PER_ELEMENT");
      if (size === undefined || size.writable || size.enumerable || size.configurable || size.value.type !== "number" || size.value.value !== 1 ||
          size.value.objectId !== undefined || size.value.subtype !== undefined || size.value.className !== undefined ||
          size.value.description !== undefined && size.value.description !== "1") { return fail(); }
    }
    const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    const parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
    if (internals.size !== 2 || parent?.type !== "function" || parent.className !== "Function" || parent.objectId === undefined ||
        parent.value !== undefined || parent.subtype !== undefined ||
        parent.description !== (index === 8 ? "function TypedArray() { [native code] }" : "function () { [native code] }") ||
        scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" || scopes.objectId === undefined ||
        scopes.value !== undefined || scopes.description !== "Scopes[0]") { return fail(); }
    if (encodingStatics) {
      const ids = new Set([values.get("prototype")?.value.objectId, parent.objectId, scopes.objectId]);
      for (const name of ["fromBase64", "fromHex"] as const) {
        const item = values.get(name), value = item?.value;
        if (item === undefined || !item.writable || !item.configurable || item.enumerable || value?.type !== "function" ||
            value.className !== "Function" || value.objectId === undefined || value.value !== undefined || value.subtype !== undefined ||
            value.description !== `function ${name}() { [native code] }` || ids.has(value.objectId)) { return fail(); }
        ids.add(value.objectId);
      }
    }
    return Object.freeze({ nativeMetadataVerified: true, executionAuthorized: false });
  } catch { return fail(); }
}
