/** Dormant exact callback metadata. No callback is called and no writer is
 * admitted. The four arrows have hidden lexical `this`: neither their matching
 * source nor membership in a PROJECT wrapper proves the receiver they capture.
 * Only fresh buffer/drain scopes expose an inspectable original `a` reference. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_PRODUCER_CALLBACK_LOCATIONS = freezeDeep({
  uploadStructure: { lineNumber: 110, columnNumber: 89_838, utf16Offset: 2_104_024,
    parameterCount: 3, name: "", async: false, prototype: false, sourceBytes: 193,
    sourceSha256: "f78a4c3123cfbf7d2be2c7404abcb1519fecbea1fd9f6fed49107cbac4f77f70" },
  structure: { lineNumber: 110, columnNumber: 90_054, utf16Offset: 2_104_240,
    parameterCount: 0, name: "", async: true, prototype: false, sourceBytes: 817,
    sourceSha256: "4e8dbb31948cc256f30a05c8f23764299c451f63981f176475d722442705f9c7" },
  cooperation: { lineNumber: 110, columnNumber: 89_543, utf16Offset: 2_103_729,
    parameterCount: 1, name: "", async: false, prototype: false, sourceBytes: 172,
    sourceSha256: "6ffe03fb8601b1e840dd90d84ff8499562ab81a0785215842a3f2b7d5afffa55" },
  upload: { lineNumber: 109, columnNumber: 165_146, utf16Offset: 2_012_435,
    parameterCount: 0, name: "", async: true, prototype: false, sourceBytes: 60,
    sourceSha256: "a724d28e81619f3d15dd170537a0defcad27d3c88b463045de3234eced63eaef" },
  buffer: { lineNumber: 110, columnNumber: 15_658, utf16Offset: 2_029_834,
    parameterCount: 1, name: "o", async: false, prototype: true, sourceBytes: 102,
    sourceSha256: "56f95d481a87fce2f09ed4186704a00b4c0e5589c3dd632b97a84435547f2133" },
  drain: { lineNumber: 110, columnNumber: 15_766, utf16Offset: 2_029_936,
    parameterCount: 0, name: "c", async: true, prototype: false, sourceBytes: 120,
    sourceSha256: "c823aa9affa52525a590c69b1282f9a5a8e022ea474a32c5d971c4473a594735" },
});
export type CurrentPcbStringProducerCallbackKind = keyof typeof CURRENT_PCB_STRING_PRODUCER_CALLBACK_LOCATIONS;
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(4096).refine(value => value.isWellFormed() && !value.includes("\0"));
const position = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(),
  columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]),
  subtype: text.optional(), className: text.optional(), description: text.optional(), objectId: token.optional(),
  value: z.union([z.null(), text, z.number(), position]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(),
  enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
function refuse(): never { throw new Error("PCB_STRING_PRODUCER_CALLBACK_SCOPE"); }

/** Bound hostile input before schema traversal. Transport must independently
 * reject duplicate JSON keys; no accessor or Proxy is consulted by this copy. */
function data(input: unknown): unknown { return copyData(input, 0, { nodes: 0, bytes: 0 }); }
function copyData(input: unknown, depth: number, budget: { nodes: number; bytes: number }): unknown {
  budget.nodes += 1;
  if (depth > 9 || budget.nodes > 512) { return refuse(); }
  if (input === null || typeof input === "boolean" || typeof input === "number") { return input; }
  if (typeof input === "string") {
    budget.bytes += Buffer.byteLength(input);
    if (input.length > 4096 || !input.isWellFormed() || budget.bytes > 65_536) { return refuse(); } return input;
  }
  if (typeof input !== "object" || types.isProxy(input)) { return refuse(); }
  const array = Array.isArray(input), keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) { return refuse(); }
  if (keys.length > 32 || keys.some(key => typeof key !== "string")) { return refuse(); }
  const items: unknown[] = [], object: Record<string, unknown> = {};
  for (const key of keys) {
    if (typeof key !== "string") { return refuse(); }
    budget.bytes += Buffer.byteLength(key);
    if (budget.bytes > 65_536) { return refuse(); }
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
    if (!array || key !== "length") {
      const value = copyData(descriptor.value as unknown, depth + 1, budget);
      if (array) { if (key !== String(items.length)) { return refuse(); } items.push(value); }
      else { Object.defineProperty(object, key, { value, enumerable: true }); }
    }
  }
  if (array && items.length !== input.length) { return refuse(); }
  return array ? items : object;
}

export function decodeCurrentPcbStringProducerCallbackFunction(input: unknown, kind: CurrentPcbStringProducerCallbackKind): string {
  try {
    const expected = CURRENT_PCB_STRING_PRODUCER_CALLBACK_LOCATIONS[kind];
    const reply = z.object({ result: z.object({ type: z.literal("function"),
      className: z.literal(expected.async ? "AsyncFunction" : "Function"), description: text, objectId: token }).strict() }).strict().parse(data(input));
    if (Buffer.byteLength(reply.result.description) !== expected.sourceBytes ||
        createHash("sha256").update(reply.result.description).digest("hex") !== expected.sourceSha256) { return refuse(); }
    return reply.result.objectId;
  } catch { return refuse(); }
}

/** Fresh getProperties(originalCallback), ownProperties:true. All six are
 * defined within strict class bodies: even regular `o` has no caller/arguments.
 * Matching these supplied metadata does not identify the callback's receiver. */
export function decodeCurrentPcbStringProducerCallbackScopeList(input: unknown, scriptId: string,
  kind: CurrentPcbStringProducerCallbackKind): Readonly<{ scopesId: string; lexicalReceiverVerified: false }> {
  try {
    token.parse(scriptId);
    const expected = CURRENT_PCB_STRING_PRODUCER_CALLBACK_LOCATIONS[kind];
    const reply = z.object({ result: z.array(property).length(expected.prototype ? 3 : 2),
      internalProperties: z.array(z.object({ name: text, value: remote }).strict()).length(3) }).strict().parse(data(input));
    const values = new Map(reply.result.map(item => [item.name, item]));
    if (values.size !== reply.result.length) { return refuse(); }
    for (const name of ["length", "name"] as const) {
      const item = values.get(name);
      if (item === undefined || item.writable || !item.configurable || item.enumerable ||
          item.value.type !== (name === "length" ? "number" : "string") ||
          item.value.value !== (name === "length" ? expected.parameterCount : expected.name) ||
          Object.is(item.value.value, -0) || item.value.objectId !== undefined) { return refuse(); }
    }
    if (expected.prototype) {
      const item = values.get("prototype");
      if (item?.value.type !== "object" || item.value.className !== "Object" || item.value.objectId === undefined ||
          !item.writable || item.configurable || item.enumerable) { return refuse(); }
    }
    const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    const location = internals.get("[[FunctionLocation]]"), prototype = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
    const point = location?.value;
    if (internals.size !== 3 || prototype?.type !== (expected.async ? "object" : "function") ||
        prototype.className !== (expected.async ? "AsyncFunction" : "Function") || prototype.objectId === undefined ||
        location?.type !== "object" || location.subtype !== "internal#location" || location.objectId !== undefined ||
        point === null || typeof point !== "object" || point.scriptId !== scriptId ||
        point.lineNumber !== expected.lineNumber || point.columnNumber !== expected.columnNumber ||
        scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" ||
        scopes.objectId === undefined || scopes.value !== undefined || !/^Scopes\[[2-8]\]$/u.test(scopes.description ?? "")) { return refuse(); }
    return Object.freeze({ scopesId: scopes.objectId, lexicalReceiverVerified: false });
  } catch { return refuse(); }
}

/** A buffered callback's leading lexical environment only. Arrow scopes do not
 * expose their lexical `this` in the qualified synthetic inspector; refuse
 * rather than selecting an unrelated closure or claiming wrapper membership
 * proves receiver identity. No global/module scope enumeration is returned. */
export function decodeCurrentPcbStringProducerCallbackScope(input: unknown, kind: CurrentPcbStringProducerCallbackKind): string {
  if (kind !== "buffer" && kind !== "drain") { throw new Error("PCB_STRING_PRODUCER_CALLBACK_LEXICAL_THIS_UNAVAILABLE"); }
  try {
    const reply = z.object({ result: z.array(property).min(2).max(8) }).strict().parse(data(input));
    const seen = new Set<string>();
    for (const [index, item] of reply.result.entries()) {
      if (item.name !== String(index) || !item.writable || !item.configurable || !item.enumerable ||
          item.value.type !== "object" || item.value.subtype !== "internal#scope" || item.value.className !== "Object" ||
          item.value.objectId === undefined || item.value.value !== undefined || seen.has(item.value.objectId)) { return refuse(); }
      seen.add(item.value.objectId);
    }
    const first = reply.result[0]?.value;
    if (first?.description !== "Closure (bufferedStream)" || first.objectId === undefined ||
        reply.result.at(-1)?.value.description !== "Global") { return refuse(); }
    return first.objectId;
  } catch { return refuse(); }
}
