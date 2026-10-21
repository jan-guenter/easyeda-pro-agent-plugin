/** Dormant worker gate/publisher metadata. These are exact method references,
 * not a callback receiver, native channel, transport or dispatch authority. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_WORKER_GATE_PROFILES = freezeDeep({
  readOnly: { name: "isReadOnly", parameterCount: 0, lineNumber: 109, columnNumber: 165_936,
    utf16Offset: 2_013_215, sourceBytes: 77, sourceSha256: "1ac8269d07d8f1283d909cb61e6cb2a5e8b078079e5350625d6ef1101f2c2540" },
  format: { name: "get isV2Format", parameterCount: 0, lineNumber: 109, columnNumber: 165_360,
    utf16Offset: 2_012_635, sourceBytes: 41, sourceSha256: "47f72926bacfd355a5f38e6e57177b982fb3efabf55e6e4a11d04bcd93499ed1" },
  canPublish: { name: "canWsPublish", parameterCount: 0, lineNumber: 110, columnNumber: 94_346,
    utf16Offset: 2_108_520, sourceBytes: 78, sourceSha256: "787898cdd71f5e2031ed21899efa65f187185fbb80edb8118b8ecd1931b1aab3" },
  publish: { name: "publish", parameterCount: 2, lineNumber: 0, columnNumber: 9849,
    utf16Offset: 9842, sourceBytes: 84, sourceSha256: "5f187de3262123ee1cdd5e9fd4cc789057e61148ce3ae18f5d44c475e17cd74b" },
  broadcast: { name: "broadcastPublish", parameterCount: 2, lineNumber: 0, columnNumber: 12_246,
    utf16Offset: 12_230, sourceBytes: 83, sourceSha256: "30cd880109ad82ba614691e6fc0de9b7a9469053af28ebafe94fa38af1d006a4" },
  post: { name: "post", parameterCount: 1, lineNumber: 0, columnNumber: 12_642,
    utf16Offset: 12_638, sourceBytes: 79, sourceSha256: "9dc43a09fc1339c50618ee681fa45a2967e94215e2a85361e1a9cb41a8d4f3c2" },
  message: { name: "onMessage", parameterCount: 1, lineNumber: 0, columnNumber: 11_822,
    utf16Offset: 11_813, sourceBytes: 417, sourceSha256: "924c657491184748fa1ac302ebaaaeeac47ef56b9df88c5d8404bcd0a6f92308" },
  received: { name: "onReceivedPublish", parameterCount: 3, lineNumber: 0, columnNumber: 10_435,
    utf16Offset: 10_418, sourceBytes: 269, sourceSha256: "7141a9d5fdbb7547e751300617fa425c8a35bfd2860bac659d97bb9cb836b0aa" },
});
export const CURRENT_PCB_STRING_WORKER_GATE_ORDER = Object.freeze([
  "readOnly", "format", "canPublish", "publish", "broadcast", "post", "message", "received",
] as const);
export type CurrentPcbStringWorkerGateKind = keyof typeof CURRENT_PCB_STRING_WORKER_GATE_PROFILES;
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(4096).refine(value => value.isWellFormed() && !value.includes("\0"));
const position = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]),
  subtype: text.optional(), className: text.optional(), description: text.optional(), objectId: token.optional(),
  value: z.union([text, z.number(), position]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(),
  enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
function refuse(): never { throw new Error("PCB_STRING_WORKER_GATE_SCOPE"); }

/** Transport independently rejects duplicate JSON keys. Bound hostile values
 * before schema traversal without consulting accessor or Proxy traps. */
function data(input: unknown): unknown { return copyData(input, 0, { nodes: 0, bytes: 0 }); }
function copyData(input: unknown, depth: number, budget: { nodes: number; bytes: number }): unknown {
  budget.nodes += 1;
  if (depth > 9 || budget.nodes > 1024) { return refuse(); }
  if (typeof input === "boolean" || typeof input === "number") { return input; }
  if (typeof input === "string") {
    budget.bytes += Buffer.byteLength(input);
    if (input.length > 4096 || !input.isWellFormed() || budget.bytes > 65_536) { return refuse(); } return input;
  }
  if (input === null || typeof input !== "object" || types.isProxy(input)) { return refuse(); }
  const array = Array.isArray(input), keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) { return refuse(); }
  if (keys.length > 32 || keys.some(key => typeof key !== "string")) { return refuse(); }
  const items: unknown[] = [], object: Record<string, unknown> = {};
  for (const key of keys) {
    if (typeof key !== "string") { return refuse(); }
    budget.bytes += Buffer.byteLength(key); if (budget.bytes > 65_536) { return refuse(); }
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
    if (!array || key !== "length") {
      const value = copyData(descriptor.value as unknown, depth + 1, budget);
      if (array) { if (key !== String(items.length)) { return refuse(); } items.push(value); }
      else { Object.defineProperty(object, key, { value, enumerable: true }); }
    }
  }
  if (array && items.length !== input.length) { return refuse(); } return array ? items : object;
}
function method(value: z.infer<typeof remote>, kind: CurrentPcbStringWorkerGateKind): string {
  const expected = CURRENT_PCB_STRING_WORKER_GATE_PROFILES[kind], source = value.description;
  if (value.type !== "function" || value.className !== "Function" || value.subtype !== undefined || value.value !== undefined ||
      value.objectId === undefined || source === undefined || Buffer.byteLength(source) !== expected.sourceBytes ||
      createHash("sha256").update(source).digest("hex") !== expected.sourceSha256) { return refuse(); }
  return value.objectId;
}

export function decodeCurrentPcbStringWorkerGateBundle(input: unknown): string {
  try {
    return z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"),
      className: z.literal("Array"), description: z.literal("Array(8)"), objectId: token }).strict() }).strict().parse(data(input)).result.objectId;
  } catch { return refuse(); }
}
/** Exact eight-element selector result, including each method's source bytes. */
export function decodeCurrentPcbStringWorkerGateTuple(input: unknown): readonly string[] {
  try {
    const reply = z.object({ result: z.array(property).length(9), internalProperties: z.array(internal).length(1) }).strict().parse(data(input));
    const values = new Map(reply.result.map(item => [item.name, item]));
    if (values.size !== 9) { return refuse(); }
    const length = values.get("length"), prototype = reply.internalProperties[0];
    if (length === undefined || !length.writable || length.configurable || length.enumerable || length.value.type !== "number" ||
        length.value.value !== 8 || length.value.objectId !== undefined || prototype?.name !== "[[Prototype]]" ||
        prototype.value.type !== "object" || prototype.value.subtype !== "array" || prototype.value.className !== "Array" ||
        prototype.value.objectId === undefined || prototype.value.value !== undefined) { return refuse(); }
    const handles = CURRENT_PCB_STRING_WORKER_GATE_ORDER.map((kind, index) => {
      const item = values.get(String(index));
      if (item === undefined || !item.writable || !item.configurable || !item.enumerable) { return refuse(); }
      return method(item.value, kind);
    });
    if (new Set(handles).size !== handles.length) { return refuse(); } return Object.freeze(handles);
  } catch { return refuse(); }
}

/** Fresh own-properties of an original selector method. The returned scope list
 * is useful only for canWsPublish. No method or getter is called. */
export function decodeCurrentPcbStringWorkerGateProperties(input: unknown, scriptId: string,
  kind: CurrentPcbStringWorkerGateKind): Readonly<{ scopesId: string; methodReceiverVerified: false }> {
  try {
    token.parse(scriptId);
    const expected = CURRENT_PCB_STRING_WORKER_GATE_PROFILES[kind];
    const reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) }).strict().parse(data(input));
    const values = new Map(reply.result.map(item => [item.name, item]));
    if (values.size !== 2) { return refuse(); }
    for (const name of ["length", "name"] as const) {
      const item = values.get(name);
      if (item === undefined || item.writable || !item.configurable || item.enumerable ||
          item.value.type !== (name === "length" ? "number" : "string") ||
          item.value.value !== (name === "length" ? expected.parameterCount : expected.name) ||
          Object.is(item.value.value, -0) || item.value.objectId !== undefined) { return refuse(); }
    }
    const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    const location = internals.get("[[FunctionLocation]]"), prototype = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
    const point = location?.value;
    if (internals.size !== 3 || prototype?.type !== "function" || prototype.className !== "Function" || prototype.objectId === undefined ||
        location?.type !== "object" || location.subtype !== "internal#location" || location.objectId !== undefined ||
        point === undefined || typeof point !== "object" || point.scriptId !== scriptId ||
        point.lineNumber !== expected.lineNumber || point.columnNumber !== expected.columnNumber ||
        scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" ||
        scopes.objectId === undefined || scopes.value !== undefined || !/^Scopes\[[1-8]\]$/u.test(scopes.description ?? "")) { return refuse(); }
    return Object.freeze({ scopesId: scopes.objectId, methodReceiverVerified: false });
  } catch { return refuse(); }
}

/** Only the leading unnamed IIFE closure of the admitted canWsPublish method.
 * No caller-selected variable/scope or hidden arrow receiver is exposed. */
export function decodeCurrentPcbStringWorkerGateScope(input: unknown): string {
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
    if (first?.description !== "Closure" || first.objectId === undefined || reply.result.at(-1)?.value.description !== "Global") { return refuse(); }
    return first.objectId;
  } catch { return refuse(); }
}
