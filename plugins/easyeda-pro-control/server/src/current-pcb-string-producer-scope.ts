/** Dormant source/location-qualified closure decoders. No transport or live
 * selection is registered. The owner must admit the complete original script,
 * retain every returned handle and invalidate it on context/navigation loss.
 * Scope wrappers are value snapshots: obtain fresh [[Scopes]]/scope handles
 * for every sample, never reuse one across a create, Save or awaited phase.
 * Matching supplied descriptors never establishes that ownership. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_PRODUCER_LOCATIONS = freezeDeep({
  move: { lineNumber: 4627, columnNumber: 282_537, utf16Offset: 7_885_891, parameterCount: 2,
    scopeDescriptions: ["Closure"], regular: true, sourceBytes: 976,
    sourceSha256: "71fedafd0e459bab491910483a54081f23384d92d9d62083ae42115b3eac5024" },
  serial: { lineNumber: 108, columnNumber: 145_578, utf16Offset: 1_847_074, parameterCount: 0,
    scopeDescriptions: ["Closure (Nd)"], regular: false, sourceBytes: 149,
    sourceSha256: "212bd4de32ee78a2924190e6d36bdf3f0592a92663faaf50151a341837488c7d" },
  debounce: { lineNumber: 109, columnNumber: 163_895, utf16Offset: 2_011_184, parameterCount: 0,
    scopeDescriptions: ["Block (QA)", "Closure (QA)"], regular: true, sourceBytes: 177,
    sourceSha256: "7f497fd065f32fc737f50b0d1fc7c851538b37e04ec81c665b67c3fd0179f90d" },
  cooperation: { lineNumber: 109, columnNumber: 8793, utf16Offset: 1_856_082, parameterCount: 1,
    scopeDescriptions: ["Closure (ZA)"], regular: false, sourceBytes: 112,
    sourceSha256: "8f0467161af080b133406e4cf0822ff6183c5bcb574fedbc924092f4f9f5476d" },
  upload: { lineNumber: 110, columnNumber: 15_521, utf16Offset: 2_029_707, parameterCount: 1,
    scopeDescriptions: ["Closure (bufferedStream)"], regular: false, sourceBytes: 126,
    sourceSha256: "7b350c3d20de0324f1c34fd12954845adc8a919726dad878f165436155d2ae90" },
});
export type CurrentPcbStringProducerKind = keyof typeof CURRENT_PCB_STRING_PRODUCER_LOCATIONS;
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(4096).refine(value => value.isWellFormed() && !value.includes("\0"));
const position = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(),
  columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "string", "number", "undefined"]),
  subtype: text.optional(), className: text.optional(), description: text.optional(), objectId: token.optional(),
  value: z.union([z.null(), text, z.number(), position]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(),
  enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
function refuse(): never { throw new Error("PCB_STRING_PRODUCER_SCOPE"); }

/** Inspector replies must already have passed the transport's duplicate-key
 * parser. These copies additionally reject hostile supplied objects without
 * triggering accessors or proxy traps. */
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

/** Only a result of the fixed selector can supply this private handle. The
 * exact returned function bytes are checked in addition to full-file admission. */
export function decodeCurrentPcbStringProducerFunction(input: unknown, kind: CurrentPcbStringProducerKind): string {
  try {
    const reply = z.object({ result: z.object({ type: z.literal("function"), className: z.literal("Function"),
      description: text, objectId: token }).strict() }).strict().parse(data(input));
    const expected = CURRENT_PCB_STRING_PRODUCER_LOCATIONS[kind], source = reply.result.description;
    if (Buffer.byteLength(source) !== expected.sourceBytes ||
        createHash("sha256").update(source).digest("hex") !== expected.sourceSha256) { return refuse(); }
    return reply.result.objectId;
  } catch { return refuse(); }
}

/** GetProperties(originalFunction), ownProperties:true. Regular non-strict
 * functions carry their native arguments/caller/prototype descriptors; arrow
 * functions do not. No arbitrary additional function properties are admitted. */
export function decodeCurrentPcbStringProducerScopeList(input: unknown, scriptId: string,
  kind: CurrentPcbStringProducerKind): string {
  try {
    token.parse(scriptId);
    const expected = CURRENT_PCB_STRING_PRODUCER_LOCATIONS[kind];
    const reply = z.object({ result: z.array(property).length(expected.regular ? 5 : 2),
      internalProperties: z.array(z.object({ name: text, value: remote }).strict()).length(3) }).strict().parse(data(input));
    const values = new Map(reply.result.map(item => [item.name, item]));
    if (values.size !== reply.result.length) { return refuse(); }
    for (const name of ["length", "name"] as const) {
      const item = values.get(name);
      if (item === undefined || item.writable || !item.configurable || item.enumerable ||
          item.value.type !== (name === "length" ? "number" : "string") ||
          item.value.value !== (name === "length" ? expected.parameterCount : "") || Object.is(item.value.value, -0) ||
          item.value.objectId !== undefined) { return refuse(); }
    }
    if (expected.regular) {
      for (const name of ["arguments", "caller"]) {
        const item = values.get(name);
        if (item?.value.type !== "object" || item.value.subtype !== "null" || item.value.value !== null ||
            item.value.objectId !== undefined || item.writable || item.configurable || item.enumerable) { return refuse(); }
      }
      const prototype = values.get("prototype");
      if (prototype?.value.type !== "object" || prototype.value.className !== "Object" ||
          prototype.value.objectId === undefined || !prototype.writable || prototype.configurable || prototype.enumerable) { return refuse(); }
    }
    const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    const location = internals.get("[[FunctionLocation]]"), prototype = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
    const point = location?.value;
    if (internals.size !== 3 || prototype?.type !== "function" || prototype.objectId === undefined ||
        location?.type !== "object" || location.subtype !== "internal#location" || location.objectId !== undefined ||
        point === null || typeof point !== "object" || point.scriptId !== scriptId ||
        point.lineNumber !== expected.lineNumber || point.columnNumber !== expected.columnNumber ||
        scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" ||
        scopes.objectId === undefined || scopes.value !== undefined || !/^Scopes\[[2-8]\]$/u.test(scopes.description ?? "")) { return refuse(); }
    return scopes.objectId;
  } catch { return refuse(); }
}

/** Only the fixed leading lexical scopes are returned. QA has a separate
 * default-parameter Closure after its Block. No later/global variable scope is
 * enumerated and no caller-supplied scope index or variable name is accepted. */
export function decodeCurrentPcbStringProducerScopes(input: unknown, kind: CurrentPcbStringProducerKind): readonly string[] {
  try {
    const reply = z.object({ result: z.array(property).min(2).max(8) }).strict().parse(data(input));
    const expected = CURRENT_PCB_STRING_PRODUCER_LOCATIONS[kind].scopeDescriptions;
    const seen = new Set<string>();
    for (const [index, item] of reply.result.entries()) {
      if (item.name !== String(index) || !item.writable || !item.configurable || !item.enumerable ||
          item.value.type !== "object" || item.value.subtype !== "internal#scope" || item.value.className !== "Object" ||
          item.value.objectId === undefined || item.value.value !== undefined || seen.has(item.value.objectId)) { return refuse(); }
      seen.add(item.value.objectId);
      if (index < expected.length && item.value.description !== expected[index]) { return refuse(); }
    }
    if (reply.result.length <= expected.length || reply.result.at(-1)?.value.description !== "Global") { return refuse(); }
    return Object.freeze(reply.result.slice(0, expected.length).map(item => item.value.objectId ?? refuse()));
  } catch { return refuse(); }
}
