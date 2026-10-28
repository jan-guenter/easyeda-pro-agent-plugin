/** Original subscriber and buffered-upload observations. These programs read
 * descriptors only; they never call a parser, callback, timer or upload API. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_ASYNC_PROFILES as PROFILES } from "./current-footprint-copy-async-profiles.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const helpers = String.raw`"use strict";
const bad=()=>{throw new Error("FOOTPRINT_COPY_ASYNC_BINDING");},seen=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const array=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();};
const fun=f=>{if(typeof f!=="function")bad();return f;};
const verify=()=>{for(const[o,k,d]of seen){const v=Object.getOwnPropertyDescriptor(o,k);if(!v||!Object.hasOwn(v,"value")||!Object.is(v.value,d.value)||v.writable!==d.writable||v.enumerable!==d.enumerable||v.configurable!==d.configurable)bad();}};
const identity=()=>{if(own(globalThis,"PROJECT")!==project||own(project,"workerBus")!==bus||own(project,"footprint")!==manager||own(project,"consistencyManager")!==consistency||own(manager,"projectManager")!==project)bad();};
const roster=()=>{identity();const heads=own(consistency,"headCbArr"),changes=own(consistency,"cbArr");array(heads,1);array(changes,1);const out=[fun(own(heads,"0")),fun(own(changes,"0")),fun(own(project,"bufferedUploadCloud")),fun(own(consistency,"getCache")),heads,changes,...["task1","task2","task3","cachePromise","bufferUploadData","bufferUploadCache","localCache","cache"].map(k=>own(project,k))];if(new Set(out.slice(4)).size!==10)bad();return out;};
const same=(o,v)=>{array(o,v.length);for(let i=0;i<v.length;i++)if(own(o,String(i))!==v[i])bad();};`;
const closure = String.raw`
identity();const bindings=own(this,"object");if(own(bindings,"a")!==project||own(bindings,"s")!==500)bad();
const callbacks=[fun(own(bindings,"t")),fun(own(bindings,"c")),fun(own(bindings,"o"))];`;
const snapshot = String.raw`
same(original,roster());same(upload,callbacks);
const size=(o,p)=>{if(o===null||Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,"size");if(!d||typeof d.get!=="function"||Object.hasOwn(d,"value"))bad();const n=d.get.call(o);if(!Number.isSafeInteger(n)||n<0||Object.is(n,-0)||n>1000000)bad();return n;};
const flag=k=>{const v=own(project,k);if(typeof v!=="boolean")bad();return v;};
const timer=v=>{if(v===null)return false;if(!Number.isSafeInteger(v)||v<=0)bad();return true;};
const r=own(bindings,"r"),i=own(bindings,"i"),n=own(bindings,"n");
if(i!==null&&(typeof i!=="object"||Object.getPrototypeOf(i)!==Promise.prototype)||n!==null&&typeof n!=="function"||(i===null)!==(n===null))bad();
if(i!==null&&!Set.prototype.has.call(own(project,"task1"),i))bad();
const result={timerPending:timer(r),bufferedPromiseRetained:i!==null,
task1:size(own(project,"task1"),Set.prototype),task2:size(own(project,"task2"),Set.prototype),task3:size(own(project,"task3"),Set.prototype),
cachePromises:size(own(project,"cachePromise"),Set.prototype),bufferedUploads:size(own(project,"bufferUploadData"),Map.prototype),bufferedUploadCaches:size(own(project,"bufferUploadCache"),Map.prototype),
uploading:flag("isUploadingCloud"),batchUploading:flag("isBatchUpload"),pendingSync:flag("pendingSyncCloud")};
verify();return result;`;

/** The enclosing original worker owner supplies these handles. No caller code
 * or native method name is a parameter in any selector. */
export const CURRENT_FOOTPRINT_COPY_ASYNC_CALLS = freezeDeep({
  capture: { program: `function(bus,manager,consistency){${helpers}\nconst project=this;\nconst out=roster();verify();return out;}`, arguments: 3, returnByValue: false },
  captureRegistered: { program: `function(bus,manager,consistency,registered,head,change){${helpers}\nconst project=this;\nconst out=roster();array(registered,2);if(own(registered,"0")!==out[4]||own(registered,"1")!==out[5]||head!==out[0]||change!==out[1])bad();verify();return out;}`, arguments: 6, returnByValue: false },
  recheck: { program: `function(bus,manager,consistency,original){${helpers}\nconst project=this;\nsame(original,roster());verify();return true;}`, arguments: 4, returnByValue: true },
  captureUpload: { program: `function(project,bus,manager,consistency){${helpers}\n${closure}\nverify();return callbacks;}`, arguments: 4, returnByValue: false },
  captureConstructedUpload: { program: `function(project,bus,manager,consistency,originalUpload){${helpers}\n${closure}\nif(callbacks[0]!==fun(originalUpload))bad();verify();return callbacks;}`, arguments: 5, returnByValue: false },
  sample: { program: `function(project,bus,manager,consistency,original,upload){${helpers}\n${closure}\n${snapshot}}`, arguments: 6, returnByValue: true },
});

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const text = z.string().max(8192).refine(value => value.isWellFormed());
const point = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]), subtype: text.optional(), className: text.optional(),
  description: text.optional(), objectId: token.optional(), value: z.union([z.null(), text, z.number(), point]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("FOOTPRINT_COPY_ASYNC_METADATA"); } }

export function decodeCurrentFootprintCopyAsyncArray(input: unknown, upload: boolean): readonly string[] {
  const count = upload ? 3 : 14, functionCount = upload ? 3 : 4, start = upload ? 4 : 0;
  const result = z.object({ result: z.array(property).length(count + 1), internalProperties: z.array(internal).length(1) }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(result.result.map(item => [item.name, item])); need(fields.size === count + 1);
  const length = fields.get("length"); need(length?.value.type === "number" && length.value.value === count &&
    length.writable && !length.enumerable && !length.configurable && length.value.objectId === undefined);
  const ids: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const item = fields.get(String(index)), value = item?.value;
    need(item !== undefined && item.writable && item.enumerable && item.configurable && value?.objectId !== undefined && value.value === undefined);
    if (index < functionCount) {
      const expected = PROFILES[start + index]; need(expected !== undefined);
      need(value.type === "function" && value.className === (expected.async ? "AsyncFunction" : "Function") && value.subtype === undefined &&
        value.description !== undefined && Buffer.byteLength(value.description) === expected.bytes &&
        createHash("sha256").update(value.description).digest("hex") === expected.sha256); ids.push(value.objectId);
    } else {
      let className = "Cache", subtype: string | undefined;
      if (index < 6) { className = "Array"; subtype = "array"; }
      else if (index < 10) { className = "Set"; subtype = "set"; }
      else if (index < 12) { className = "Map"; subtype = "map"; }
      need(value.type === "object" && value.className === className && value.subtype === subtype);
    }
  }
  const parent = result.internalProperties[0];
  need(new Set(ids).size === ids.length && parent?.name === "[[Prototype]]" && parent.value.type === "object" &&
    parent.value.subtype === "array" && parent.value.className === "Array" && parent.value.description === "Array(0)" && parent.value.objectId !== undefined);
  return Object.freeze(ids);
}

export function decodeCurrentFootprintCopyAsyncFunction(input: unknown, scriptId: string, index: number): string {
  token.parse(scriptId); const expected = Number.isInteger(index) && !Object.is(index, -0) ? PROFILES[index] : undefined; need(expected !== undefined);
  const hasPrototype = expected.kind === "function" && !expected.async;
  const reply = z.object({ result: z.array(property).length(hasPrototype ? 3 : 2), internalProperties: z.array(internal).length(3) }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === reply.result.length);
  for (const [name, value] of [["name", expected.name], ["length", expected.arity]] as const) {
    const item = fields.get(name); need(item !== undefined && !item.writable && !item.enumerable && item.configurable &&
      item.value.type === (name === "name" ? "string" : "number") && item.value.value === value && !Object.is(item.value.value, -0) && item.value.objectId === undefined);
  }
  if (hasPrototype) { const item = fields.get("prototype"); need(item !== undefined && item.writable && !item.configurable && !item.enumerable &&
    item.value.type === "object" && item.value.objectId !== undefined && item.value.value === undefined); }
  const values = new Map(reply.internalProperties.map(item => [item.name, item.value]));
  const location = values.get("[[FunctionLocation]]"), position = location?.value, prototype = values.get("[[Prototype]]"), scopes = values.get("[[Scopes]]");
  need(values.size === 3 && location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined &&
    position !== null && typeof position === "object" && position.scriptId === scriptId && position.lineNumber === expected.lineNumber && position.columnNumber === expected.columnNumber &&
    prototype?.type === (expected.async ? "object" : "function") && prototype.objectId !== undefined && scopes?.type === "object" &&
    scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? ""));
  return scopes.objectId;
}

/** The returned upload closure captures `a`, not an observable arrow `this`.
 * Do not search another scope when this exact native closure is absent. */
export function decodeCurrentFootprintCopyAsyncScope(input: unknown): string {
  const reply = z.object({ result: z.array(property).min(2).max(8) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const ids = new Set<string>();
  for (const [index, item] of reply.result.entries()) {
    const value = item.value; need(item.name === String(index) && item.writable && item.enumerable && item.configurable &&
      value.type === "object" && value.subtype === "internal#scope" && value.className === "Object" && value.objectId !== undefined && value.value === undefined && !ids.has(value.objectId));
    ids.add(value.objectId);
  }
  need(reply.result[0]?.value.description === "Closure (bufferedStream)" && reply.result.at(-1)?.value.description === "Global");
  const id = reply.result[0]?.value.objectId; need(id !== undefined); return id;
}
