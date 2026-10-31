/** Separate, exact Node bootstrap context for the native head-age observer.
 * Getter/setter handles come from the original main process. Source reports
 * alone cannot supply them, and the setter is never called. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS } from "./current-footprint-copy-main-backend-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_SOURCE = freezeDeep({
  url: "node:internal/bootstrap/node", node: "24.14.1", bytes: 15_939,
  sha256: "77ff3761130991b04a8769c3df1e1f6fb1cf062e9a37d9916d39e854a1bcf791",
  getter: { name: "get", arity: 0, lineNumber: 431, columnNumber: 7,
    text: "get() {\n      return _process;\n    }" },
  setter: { name: "set", arity: 1, lineNumber: 434, columnNumber: 7,
    text: "set(value) {\n      _process = value;\n    }" },
});
export const CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_PREPARATION_STEPS = Object.freeze([
  "context-capture", "context-array-properties", "getter-properties", "setter-properties", "source", "getter-scopes", "setter-scopes", "context-bind",
] as const);
export const CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_PREPARATION_REQUESTS = CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_PREPARATION_STEPS.length;
const sourceTokens = new WeakSet<object>();
export interface CurrentFootprintHeadAgeBootstrapCapability {
  readonly profile: "private.current-footprint-head-age-bootstrap-capability.v1";
  readonly executionAuthorized: false;
}
export interface CurrentFootprintHeadAgeContextSource {
  readonly profile: "private.current-footprint-head-age-context-source.v1";
  readonly runtimeProcessVerified: false;
  readonly executionAuthorized: false;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_HEAD_AGE_CONTEXT"); } }
export function qualifyCurrentFootprintHeadAgeContextSource(input: unknown): CurrentFootprintHeadAgeContextSource {
  const pin = CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_SOURCE;
  need(typeof input === "string" && input.length === pin.bytes && input.isWellFormed() && Buffer.byteLength(input) === pin.bytes &&
    createHash("sha256").update(input).digest("hex") === pin.sha256);
  const token = Object.freeze({ profile: "private.current-footprint-head-age-context-source.v1" as const,
    runtimeProcessVerified: false as const, executionAuthorized: false as const }); sourceTokens.add(token); return token;
}
export function requireCurrentFootprintHeadAgeContextSource(input: CurrentFootprintHeadAgeContextSource): void { need(sourceTokens.has(input)); }
const helpers = String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_HEAD_AGE_CONTEXT");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const arr=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const original=${CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS.require.program};
const main=o=>{arr(o,13);if(Reflect.apply(original,own(o,"0"),[o])!==true)bad();};
const descriptor=(root,getter,setter)=>{const d=Object.getOwnPropertyDescriptor(root,"process");if(!d||Reflect.ownKeys(d).length!==4||!Object.hasOwn(d,"get")||!Object.hasOwn(d,"set")||!Object.hasOwn(d,"enumerable")||!Object.hasOwn(d,"configurable")||d.get!==getter||d.set!==setter||d.enumerable!==false||d.configurable!==true)bad();};
const accessors=a=>{arr(a,4);if(own(a,"1")!==globalThis)bad();const get=own(a,"2"),set=own(a,"3");
if(typeof get!=="function"||own(get,"name")!=="get"||own(get,"length")!==0||Function.prototype.toString.call(get)!==${JSON.stringify(CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_SOURCE.getter.text)}||typeof set!=="function"||own(set,"name")!=="set"||own(set,"length")!==1||Function.prototype.toString.call(set)!==${JSON.stringify(CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_SOURCE.setter.text)})bad();descriptor(globalThis,get,set);};
const context=a=>{arr(a,5);const captured=own(a,"0");accessors(captured);const root=own(captured,"1"),getter=own(captured,"2"),setter=own(captured,"3"),process=own(a,"1"),env=own(a,"2"),pid=own(a,"3"),versions=own(a,"4");
if(!Number.isSafeInteger(pid)||pid<=0||own(process,"pid")!==pid||own(process,"versions")!==versions||own(versions,"node")!=="24.14.1"||own(process,"env")!==env||Reflect.apply(getter,root,[])!==process||Reflect.ownKeys(env).some(key=>typeof key!=="string"||key.toUpperCase()==="TZ"))bad();descriptor(root,getter,setter);};`;
export const CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_CAPTURE_PROGRAM = `function(retained){${helpers}
main(retained);const d=Object.getOwnPropertyDescriptor(globalThis,"process");if(!d||!Object.hasOwn(d,"get")||!Object.hasOwn(d,"set"))bad();const result=[retained,globalThis,d.get,d.set];accessors(result);return result;}`;
export const CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_BIND_PROGRAM = `function(outer,setInner,setOuter,captured,nativeRootPid){${helpers}
const unwrap=(o,label)=>{if(Reflect.ownKeys(o).length!==2||own(o,"description")!==label)bad();const value=own(o,"object");if(value===null||typeof value!=="object")bad();return value;};
accessors(captured);main(own(captured,"0"));const inner=unwrap(this,"Closure (setupProcessObject)"),originalOuter=unwrap(outer,"Closure"),setterInner=unwrap(setInner,"Closure (setupProcessObject)"),setterOuter=unwrap(setOuter,"Closure");
if(Reflect.ownKeys(inner).length!==1||Reflect.ownKeys(setterInner).length!==1)bad();
const process=own(originalOuter,"process"),root=own(originalOuter,"globalThis");if(root!==globalThis||own(setterOuter,"globalThis")!==root||own(setterOuter,"process")!==process||own(inner,"_process")!==process||own(setterInner,"_process")!==process)bad();
const result=[captured,process,own(process,"env"),nativeRootPid,own(process,"versions")];context(result);return result;}`;
const requireHelpers = helpers.replace(`const original=${CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS.require.program};\nconst main=o=>{arr(o,13);if(Reflect.apply(original,own(o,"0"),[o])!==true)bad();};\n`, "");
if (requireHelpers === helpers) { throw new Error("FOOTPRINT_HEAD_AGE_CONTEXT_FIXED_REQUIRE"); }
export const CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_REQUIRE_PROGRAM = `function(retained){${requireHelpers}\ncontext(retained);return true;}`;

/** Specialize only the head-age observer's fixed generated program. The
 * shared scratch and renderer context guards remain byte-for-byte unchanged. */
export function specializeCurrentFootprintHeadAgeControls(input: string): string {
  const aged = `const process=own(root,'process'),env=own(process,'env');\nconst context=()=>{if(own(root,'process')!==process||own(process,'env')!==env||Reflect.ownKeys(env).some(key=>typeof key!=='string'||key.toUpperCase()==='TZ'))bad();};`;
  const base = `const process=own(root,'process'),env=own(process,'env');\nconst context=()=>{\n if(own(root,'process')!==process||own(process,'env')!==env)bad();\n if(Reflect.ownKeys(env).some(key=>typeof key!=='string'||key.toUpperCase()==='TZ'))bad();\n};`;
  need(input.split(aged).length === 2 && input.split(base).length === 3);
  const replacement = "const context=()=>{if(Reflect.apply(requireHeadContext,undefined,[headAgeContext])!==true)bad();};";
  return input.replace(aged, replacement).replaceAll(base, replacement);
}
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const point = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(),
  description: z.string().max(8192).optional(), value: z.unknown().optional() }).strict();
const property = z.object({ name: z.string(), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: z.string(), value: remote }).strict();
export function decodeCurrentFootprintHeadAgeContextArray(input: unknown): Readonly<{ getter: string; setter: string }> {
  const reply = z.object({ result: z.array(property).length(5), internalProperties: z.array(internal).length(1) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(field => [field.name, field])); need(fields.size === 5);
  const length = fields.get("length"), prototype = reply.internalProperties[0];
  need(length?.value.type === "number" && length.value.value === 4 && length.writable && !length.enumerable && !length.configurable &&
    prototype?.name === "[[Prototype]]" && prototype.value.type === "object" && prototype.value.subtype === "array" && prototype.value.className === "Array" && prototype.value.objectId !== undefined);
  const ids: string[] = [];
  for (let index = 0; index < 4; index += 1) {
    const field = fields.get(String(index)); need(field !== undefined && field.writable && field.enumerable && field.configurable &&
      field.value.objectId !== undefined && field.value.value === undefined && field.value.subtype !== "proxy");
    if (index >= 2) { const role = index === 2 ? "getter" : "setter"; need(field.value.type === "function" && field.value.className === "Function" && field.value.description === CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_SOURCE[role].text); }
    ids.push(field.value.objectId);
  }
  const getter = ids[2], setter = ids[3]; need(getter !== undefined && setter !== undefined && getter !== setter); return Object.freeze({ getter, setter });
}
export function decodeCurrentFootprintHeadAgeContextAccessor(input: unknown, role: "getter" | "setter"): Readonly<{ scriptId: string; scopesId: string }> {
  const reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const expected = CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_SOURCE[role], fields = new Map(reply.result.map(field => [field.name, field])); need(fields.size === 2);
  for (const key of ["name", "length"] as const) { const field = fields.get(key); need(field !== undefined && !field.writable && !field.enumerable && field.configurable &&
    field.value.type === (key === "name" ? "string" : "number") && field.value.value === (key === "name" ? expected.name : expected.arity) && field.value.objectId === undefined); }
  const entries = new Map(reply.internalProperties.map(field => [field.name, field.value])), location = entries.get("[[FunctionLocation]]"), prototype = entries.get("[[Prototype]]"), scopes = entries.get("[[Scopes]]");
  const actual = point.parse(location?.value); need(entries.size === 3 && location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined &&
    actual.lineNumber === expected.lineNumber && actual.columnNumber === expected.columnNumber && prototype?.type === "function" && prototype.className === "Function" && prototype.objectId !== undefined &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.description === "Scopes[3]" && scopes.objectId !== undefined && scopes.value === undefined);
  return Object.freeze({ scriptId: actual.scriptId, scopesId: scopes.objectId });
}
export function decodeCurrentFootprintHeadAgeContextScopes(input: unknown): readonly [string, string] {
  const reply = z.object({ result: z.array(property).length(3) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const ids: string[] = [], labels = ["Closure (setupProcessObject)", "Closure", "Global"];
  for (const [index, field] of reply.result.entries()) {
    need(field.name === String(index) && field.writable && field.enumerable && field.configurable && field.value.type === "object" &&
      field.value.subtype === "internal#scope" && field.value.className === "Object" && field.value.description === labels[index] && field.value.objectId !== undefined && field.value.value === undefined); ids.push(field.value.objectId);
  }
  const inner = ids[0], outer = ids[1]; need(inner !== undefined && outer !== undefined && inner !== outer); return Object.freeze([inner, outer]);
}
