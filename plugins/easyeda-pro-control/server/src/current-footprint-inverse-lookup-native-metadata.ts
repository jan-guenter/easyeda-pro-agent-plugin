/** Passive original-packet validation only. Native function bodies are not
 * invoked or inferred from a caller-supplied name. No receipt issuer exists. */
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_CONSTRUCTORS = freezeDeep({
  Object: { arity: 1, parent: "" }, Map: { arity: 0, parent: "" }, Array: { arity: 1, parent: "" }, Function: { arity: 1, parent: "" }, Symbol: { arity: 0, parent: "" }, Promise: { arity: 1, parent: "" }, Date: { arity: 7, parent: "" },
  ArrayBuffer: { arity: 1, parent: "" }, SharedArrayBuffer: { arity: 1, parent: "" }, Blob: { arity: 0, parent: "" }, FormData: { arity: 0, parent: "" }, Uint8ClampedArray: { arity: 3, parent: "TypedArray" }, HTMLImageElement: { arity: 0, parent: "HTMLElement" },
  String: { arity: 1, parent: "" }, Number: { arity: 1, parent: "" }, WeakRef: { arity: 1, parent: "" }, TypedArray: { arity: 0, parent: "" }, HTMLElement: { arity: 0, parent: "Element" }, Element: { arity: 0, parent: "Node" }, Node: { arity: 0, parent: "EventTarget" }, EventTarget: { arity: 0, parent: "" },
} as const);
export type CurrentFootprintInverseLookupNativeConstructorRole = keyof typeof CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_CONSTRUCTORS;
export const CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_METHODS = freezeDeep({
  get: { name: "get", arity: 1 }, hasInstance: { name: "[Symbol.hasInstance]", arity: 1 }, map: { name: "map", arity: 1 }, hasOwnProperty: { name: "hasOwnProperty", arity: 1 }, call: { name: "call", arity: 1 }, species: { name: "get [Symbol.species]", arity: 0 },
  race: { name: "race", arity: 1 }, resolve: { name: "resolve", arity: 1 }, promiseThen: { name: "then", arity: 2 }, promiseCatch: { name: "catch", arity: 1 }, push: { name: "push", arity: 1 }, shift: { name: "shift", arity: 0 }, splice: { name: "splice", arity: 2 }, values: { name: "values", arity: 0 }, next: { name: "next", arity: 0 }, deref: { name: "deref", arity: 0 }, stringify: { name: "stringify", arity: 3 }, error: { name: "error", arity: 0 }, debug: { name: "debug", arity: 0 }, setTimeout: { name: "setTimeout", arity: 1 }, clearTimeout: { name: "clearTimeout", arity: 0 }, resolver: { name: "", arity: 1 },
} as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number", "symbol", "undefined", "boolean"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional(), unserializableValue: z.string().optional() });
const property = z.strictObject({ name: z.string(), value: remote.optional(), get: remote.optional(), set: remote.optional(), symbol: remote.optional(), writable: z.boolean().optional(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string(), value: remote });
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_LOOKUP_NATIVE_METADATA"); } }
export function currentFootprintInverseLookupNativeResult(input: unknown): z.infer<typeof remote> { return z.strictObject({ result: remote }).parse(capture(input)).result; }
export function currentFootprintInverseLookupNativeParent(input: unknown): z.infer<typeof remote> { const raw = z.strictObject({ result: z.array(property).max(512), internalProperties: z.array(internal).max(3) }).parse(capture(input)); const parents = raw.internalProperties.filter(row => row.name === "[[Prototype]]"); need(parents.length === 1); const parent = parents[0]; need(parent !== undefined && parent.value.subtype !== "proxy"); return parent.value; }
/** Checking the actual remote description also rejects renamed builtins:
 * Node/V8 retains their original native name independently of own name/length. */
export function currentFootprintInverseLookupNativeCallable(input: unknown, name: string): string { const raw = remote.parse(capture(input)); need(raw.type === "function" && raw.subtype === undefined && raw.className === "Function" && raw.objectId !== undefined && raw.description === `function ${name}() { [native code] }`); return raw.objectId; }
export function qualifyCurrentFootprintInverseLookupNativeConstructor(input: unknown, actualRemote: unknown, role: CurrentFootprintInverseLookupNativeConstructorRole): Readonly<{ prototype: string; parent: string; scopes: string }> {
  const expected = CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_CONSTRUCTORS[role]; currentFootprintInverseLookupNativeCallable(actualRemote, role);
  const raw = z.strictObject({ result: z.array(property).min(3).max(64), internalProperties: z.array(internal).length(2) }).parse(capture(input)); const fields = new Map(raw.result.map(row => [row.name, row])); need(fields.size === raw.result.length);
  for (const [name, value] of [["name", role], ["length", expected.arity]] as const) { const row = fields.get(name); need(row !== undefined && row.value !== undefined && row.writable === false && !row.enumerable && row.configurable && row.value.type === (name === "name" ? "string" : "number") && row.value.value === value && row.value.objectId === undefined && row.value.subtype === undefined); }
  const prototype = fields.get("prototype"); need(prototype?.value !== undefined && prototype.writable === false && !prototype.enumerable && !prototype.configurable && prototype.value.objectId !== undefined && prototype.value.subtype !== "proxy" && prototype.value.subtype !== "null" && prototype.value.type === (role === "Function" ? "function" : "object"));
  const slots = new Map(raw.internalProperties.map(row => [row.name, row.value])); const parent = slots.get("[[Prototype]]"), scopes = slots.get("[[Scopes]]");
  need(slots.size === 2 && parent?.type === "function" && parent.className === "Function" && parent.subtype === undefined && parent.objectId !== undefined && parent.description === `function ${expected.parent}() { [native code] }`);
  need(scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.description === "Scopes[0]" && scopes.objectId !== undefined);
  if (role === "Symbol") { for (const name of ["hasInstance", "species", "iterator"]) { const row = fields.get(name); need(row?.value?.type === "symbol" && row.value.description === `Symbol(Symbol.${name})` && row.value.objectId !== undefined && row.writable === false && !row.enumerable && !row.configurable); } }
  return Object.freeze({ prototype: prototype.value.objectId, parent: parent.objectId, scopes: scopes.objectId });
}
export function qualifyCurrentFootprintInverseLookupNativeMethod(input: unknown, actualRemote: unknown, role: keyof typeof CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_METHODS): void { const row = CURRENT_FOOTPRINT_INVERSE_LOOKUP_NATIVE_METHODS[role]; currentFootprintInverseLookupNativeCallable(actualRemote, row.name); decodeCurrentNativeFunctionMetadata(input, { ...row, constructor: false }); }
