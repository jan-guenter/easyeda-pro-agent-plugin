/** Descriptor-only runtime row comparison. Expected rows come from a genuine
 * saved-flow plan in the eventual owner; this pure leaf issues no grant. */
import { z } from "zod";
import type { CurrentFootprintInversePublicRowValue } from "./current-footprint-inverse-public-row-data.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { currentFootprintInverseOwnDataParent, currentFootprintInverseOwnDataProperty } from "./current-footprint-inverse-own-data-replies.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "string", "number", "boolean", "undefined"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().max(65_536).optional(), value: z.unknown().optional(), objectId: handle.optional() });
const property = z.strictObject({ name: z.string().max(128), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.literal("[[Prototype]]"), value: remote });
const packet = z.strictObject({ result: z.array(property).max(129), internalProperties: z.tuple([internal]) });
const nativeRemote = remote.extend({ type: z.enum(["object", "function", "string", "number", "boolean", "undefined", "symbol"]) });
const nativeProperty = z.looseObject({ name: z.string(), value: nativeRemote.optional(), writable: z.boolean().optional(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) });
const nativeInternal = z.strictObject({ name: z.string(), value: nativeRemote });
const nativePacket = z.strictObject({ result: z.array(nativeProperty).max(64), internalProperties: z.array(nativeInternal).length(2) });
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_RUNTIME_ROW"); } }
export interface CurrentFootprintInverseRuntimeRowChild { readonly objectId: string; readonly expected: CurrentFootprintInversePublicRowValue }
function comparePrimitive(value: z.infer<typeof remote>, expected: CurrentFootprintInversePublicRowValue): CurrentFootprintInverseRuntimeRowChild | null {
  if (expected.kind === "array" || expected.kind === "object") { need(value.type === "object" && value.value === undefined && value.objectId !== undefined && value.className === (expected.kind === "array" ? "Array" : "Object") && value.subtype === (expected.kind === "array" ? "array" : undefined)); return Object.freeze({ objectId: value.objectId, expected }); }
  need(value.objectId === undefined && value.className === undefined);
  if (expected.kind === "null") { need(value.type === "object" && value.subtype === "null" && value.value === null); }
  else { need(value.type === expected.kind && value.subtype === undefined); if (expected.kind === "undefined") { need(value.value === undefined); } else { need("value" in expected && value.value === expected.value); } }
  return null;
}
/** The original host uses only these correlated opaque child IDs for its next
 * bounded getProperties requests. No nested property getter is invoked. */
export function compareCurrentFootprintInverseRuntimeRowProperties(input: unknown, expected: CurrentFootprintInversePublicRowValue): readonly CurrentFootprintInverseRuntimeRowChild[] {
  need(expected.kind === "object" || expected.kind === "array"); const raw = packet.parse(capture(input)); const parent = raw.internalProperties[0].value;
  need(parent.type === "object" && parent.className === (expected.kind === "array" ? "Array" : "Object") && parent.subtype === (expected.kind === "array" ? "array" : undefined) && parent.objectId !== undefined && parent.value === undefined);
  const entries: readonly (readonly [string, CurrentFootprintInversePublicRowValue])[] = expected.kind === "object" ? expected.entries : expected.values.map((value, index) => [String(index), value] as const);
  need(entries.length <= (expected.kind === "object" ? 64 : 128) && raw.result.length === entries.length + (expected.kind === "array" ? 1 : 0)); const children: CurrentFootprintInverseRuntimeRowChild[] = [];
  for (const [index, [key, value]] of entries.entries()) { const actual = raw.result[index]; need(actual !== undefined && actual.name === key && actual.writable && actual.enumerable && actual.configurable); const child = comparePrimitive(actual.value, value); if (child !== null) { children.push(child); } }
  if (expected.kind === "array") { const length = raw.result.at(-1); need(length?.name === "length" && length.writable && !length.enumerable && !length.configurable && length.value.type === "number" && length.value.value === entries.length && length.value.objectId === undefined); }
  return freezeDeep(children);
}
/** Correlated constructor packets remain the host's responsibility. This
 * decoder qualifies native constructor metadata only; the final fixed program
 * proves prototype identity with JavaScript === across handle aliases. */
export function qualifyCurrentFootprintInverseRuntimeRowPrototype(prototypeReply: unknown, constructorReply: unknown, kind: "Object" | "Array"): Readonly<{ constructor: string; prototype: string; functionPrototype: string }> {
  const constructor = currentFootprintInverseOwnDataProperty(prototypeReply, "constructor", "constructor"); need(constructor.description === `function ${kind}() { [native code] }` && constructor.objectId !== undefined);
  const prototype = currentFootprintInverseOwnDataProperty(constructorReply, "prototype", "prototype"); need(prototype.objectId !== undefined && prototype.className === kind && prototype.subtype === (kind === "Array" ? "array" : undefined));
  const raw = nativePacket.parse(capture(constructorReply));
  const fields = new Map(raw.result.map(field => [field.name, field])); need(fields.size === raw.result.length);
  for (const [name, expected] of [["name", kind], ["length", 1]] as const) { const field = fields.get(name); need(field !== undefined && field.writable === false && !field.enumerable && field.configurable && field.value?.type === (name === "name" ? "string" : "number") && field.value.value === expected && field.value.objectId === undefined); }
  const slots = new Map(raw.internalProperties.map(field => [field.name, field.value])); const scopes = slots.get("[[Scopes]]"); need(slots.size === 2 && slots.has("[[Prototype]]") && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.description === "Scopes[0]" && scopes.objectId !== undefined && scopes.value === undefined);
  return Object.freeze({ constructor: constructor.objectId, prototype: prototype.objectId, functionPrototype: currentFootprintInverseOwnDataParent(constructorReply, "function") });
}
/** Every object encountered here must already occur in the original host's
 * metadata-qualified flat tuple. Native Object/Array constructors and their
 * exact immutable prototype pointers require separate native metadata before
 * this call; a foreign realm is never substituted with the helper realm.
 * Unknown/Proxy objects are never traversed. */
export const CURRENT_FOOTPRINT_INVERSE_RUNTIME_ROW_PROJECTION = String.raw`function(qualified,objectPrototypes,arrayPrototypes){"use strict";const bad=()=>{throw "FOOTPRINT_INVERSE_RUNTIME_ROW";},own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d;};if(!Array.isArray(qualified)||Object.getPrototypeOf(qualified)!==Array.prototype)bad();const size=own(qualified,"length").value;if(!Number.isSafeInteger(size)||size<1||size>128||Reflect.ownKeys(qualified).length!==size+1)bad();for(let j=0;j<size;j++)own(qualified,j);const known=o=>{for(let j=0;j<size;j++)if(own(qualified,j).value===o)return;bad();};const nativePrototypes=(values,name)=>{if(!Array.isArray(values)||Object.getPrototypeOf(values)!==Array.prototype)bad();const n=own(values,"length").value;if(!Number.isSafeInteger(n)||n<0||n>8||Reflect.ownKeys(values).length!==n+1)bad();const selected=[];for(let j=0;j<n;j++){const prototype=own(values,j).value;known(prototype);const constructor=own(prototype,"constructor").value;known(constructor);if(typeof constructor!=="function"||own(constructor,"name").value!==name||own(constructor,"length").value!==1)bad();const d=own(constructor,"prototype");if(d.value!==prototype||d.writable||d.enumerable||d.configurable)bad();selected.push(prototype);}return selected;};const objects=nativePrototypes(objectPrototypes,"Object"),arrays=nativePrototypes(arrayPrototypes,"Array");if(objects.length<1)bad();for(const prototype of objects)if(Object.getPrototypeOf(prototype)!==null)bad();for(const prototype of arrays)if(!objects.some(value=>Object.getPrototypeOf(prototype)===value))bad();const counts=[0],seen=[];const encode=(value,depth)=>{if(++counts[0]>512||depth>8)bad();if(value===undefined)return{kind:"undefined"};if(value===null)return{kind:"null"};if(typeof value==="string"){if(value.length>16384)bad();return{kind:"string",value};}if(typeof value==="number"){if(!Number.isFinite(value)||Object.is(value,-0))bad();return{kind:"number",value};}if(typeof value==="boolean")return{kind:"boolean",value};if(typeof value!=="object")bad();known(value);if(seen.some(other=>other===value))bad();seen.push(value);const keys=Reflect.ownKeys(value);if(keys.some(k=>typeof k!=="string"))bad();if(Array.isArray(value)){if(!arrays.some(prototype=>Object.getPrototypeOf(value)===prototype))bad();const length=own(value,"length");if(!Number.isSafeInteger(length.value)||length.value<0||length.value>128||keys.length!==length.value+1||!length.writable||length.enumerable||length.configurable)bad();return{kind:"array",values:Array.from({length:length.value},(_,j)=>{const d=own(value,j);if(!d.writable||!d.enumerable||!d.configurable)bad();return encode(d.value,depth+1);})};}if(!objects.some(prototype=>Object.getPrototypeOf(value)===prototype)||keys.length>64)bad();return{kind:"object",entries:keys.map(key=>{const d=own(value,key);if(key.length>128||!d.writable||!d.enumerable||!d.configurable)bad();return[key,encode(d.value,depth+1)];})};};const result=encode(this,0);for(const prototype of[Object.prototype,Array.prototype,...objects,...arrays])if(Object.getOwnPropertyDescriptor(prototype,"toJSON")!==undefined)bad();return JSON.stringify(result);}`;
