/** Fixed source locations and lexical scopes for the original209 point callback.
 * Metadata validation supplies no transport, native owner or execution grant.
 * The public point handler is inspected, never invoked or serialized to a caller.
 */
import { types } from "node:util";
import { z } from "zod";

export type CurrentPcbSpatialFunctionKind = "rpc-wrapper" | "point-handler";
export const CURRENT_PCB_SPATIAL_FUNCTION_LOCATIONS = Object.freeze({
  "rpc-wrapper": Object.freeze({ lineNumber: 30, columnNumber: 14_676, parameterCount: 3 }),
  "point-handler": Object.freeze({ lineNumber: 91_819, columnNumber: 158_756, parameterCount: 1 }),
});
const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(16_384).refine(value => value.isWellFormed() && !value.includes("\0"));
const extent = z.number().int().nonnegative().refine(value => !Object.is(value, -0));
const position = z.strictObject({ scriptId: handle, lineNumber: extent, columnNumber: extent });
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number"]),
  subtype: text.optional(), className: text.optional(), description: text.optional(), objectId: handle.optional(),
  value: z.union([text, z.number(), position]).optional() });
const property = z.strictObject({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(),
  enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: text, value: remote });
function refuse(): never { throw new Error("PCB_SPATIAL_FUNCTION_SCOPE"); }

/** Copy bounded own data before schema inspection, without invoking accessors
 * or proxy traps. The native transport still owns raw JSON duplicate detection.
 */
function data(input: unknown): unknown { return copyData(input, 0, { nodes: 0, bytes: 0 }); }
/** Rebuild only dense arrays and plain data under the shared reply budget.
 * Accessor descriptors and proxy objects refuse before lexical-scope parsing. */
function copyData(input: unknown, depth: number, budget: { nodes: number; bytes: number }): unknown {
  budget.nodes += 1;
  if (depth > 10 || budget.nodes > 2048) { return refuse(); }
  if (input === null || typeof input === "boolean" || typeof input === "number") { return input; }
  if (typeof input === "string") {
    budget.bytes += Buffer.byteLength(input);
    if (!input.isWellFormed() || input.length > 16_384 || budget.bytes > 262_144) { return refuse(); }
    return input;
  }
  if (typeof input !== "object" || types.isProxy(input)) { return refuse(); }
  const array = Array.isArray(input), keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  if ((array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) ||
      keys.length > 32 || keys.some(key => typeof key !== "string")) { return refuse(); }
  const copy: Record<string, unknown> = {}, items: unknown[] = [];
  for (const key of keys) {
    if (typeof key !== "string") { return refuse(); }
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
    if (!array || key !== "length") {
      const value = copyData(descriptor.value as unknown, depth + 1, budget);
      if (array) { if (key !== String(items.length)) { return refuse(); } items.push(value); }
      else { Object.defineProperty(copy, key, { value, enumerable: true }); }
    }
  }
  if (array && items.length !== input.length) { return refuse(); }
  return array ? items : copy;
}

/** Accept only an original function remote object of the fixed expected kind.
 * Its source location must be checked independently before following its scope.
 */
export function decodeCurrentPcbSpatialFunction(input: unknown, kind: CurrentPcbSpatialFunctionKind): string {
  try {
    return z.strictObject({ result: z.strictObject({ type: z.literal("function"),
      className: z.literal(kind === "rpc-wrapper" ? "Function" : "AsyncFunction"),
      description: text, objectId: handle }) }).parse(data(input)).result.objectId;
  } catch { return refuse(); }
}

/** Check exact arrow-function own descriptors and original script/location.
 * A matching location cannot substitute for complete script/source admission.
 */
export function decodeCurrentPcbSpatialFunctionScopeList(input: unknown, scriptId: string,
  kind: CurrentPcbSpatialFunctionKind): string {
  try {
    handle.parse(scriptId);
    const expected = CURRENT_PCB_SPATIAL_FUNCTION_LOCATIONS[kind];
    const reply = z.strictObject({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) }).parse(data(input));
    const own = new Map(reply.result.map(item => [item.name, item]));
    const length = own.get("length"), name = own.get("name");
    if (own.size !== 2 || length?.value.type !== "number" || length.value.value !== expected.parameterCount ||
        Object.is(length.value.value, -0) || length.value.objectId !== undefined || length.value.subtype !== undefined ||
        length.value.className !== undefined || length.writable || !length.configurable || length.enumerable ||
        name?.value.type !== "string" || name.value.value !== "" || name.value.objectId !== undefined ||
        name.value.subtype !== undefined || name.value.className !== undefined || name.writable ||
        !name.configurable || name.enumerable) { return refuse(); }
    const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    const located = internals.get("[[FunctionLocation]]"), prototype = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
    const point = located?.value;
    if (internals.size !== 3 || located?.type !== "object" || located.subtype !== "internal#location" ||
        located.objectId !== undefined || point === null || typeof point !== "object" ||
        point.scriptId !== scriptId || point.lineNumber !== expected.lineNumber || point.columnNumber !== expected.columnNumber ||
        prototype?.type !== (kind === "rpc-wrapper" ? "function" : "object") ||
        prototype.className !== (kind === "rpc-wrapper" ? "Function" : "AsyncFunction") ||
        prototype.objectId === undefined || prototype.value !== undefined ||
        scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" ||
        scopes.value !== undefined || scopes.objectId === undefined || !/^Scopes\[[2-4]\]$/u.test(scopes.description ?? "")) { return refuse(); }
    return scopes.objectId;
  } catch { return refuse(); }
}

/** Follow only fixed lexical labels, never a caller-selected scope or Global.
 * The point handler may retain its enclosing registration closure before the
 * anonymous module closure. A trailing Script scope is metadata only, just like
 * Global: neither is selected or read for bindings. Exact closure shapes still
 * select the same original source bindings.
 */
export function decodeCurrentPcbSpatialFunctionScope(input: unknown, kind: CurrentPcbSpatialFunctionKind): string {
  try {
    const { result } = z.strictObject({ result: z.array(property).min(2).max(4) }).parse(data(input));
    for (const [index, item] of result.entries()) {
      if (item.name !== String(index) || item.value.type !== "object" || item.value.subtype !== "internal#scope" ||
          item.value.className !== "Object" || item.value.objectId === undefined || item.value.value !== undefined ||
          !item.writable || !item.configurable || !item.enumerable) { return refuse(); }
    }
    if (new Set(result.map(item => item.value.objectId)).size !== result.length || result.at(-1)?.value.description !== "Global") { return refuse(); }
    const labels = result.slice(0, result.at(-2)?.value.description === "Script" ? -2 : -1).map(item => item.value.description);
    if (labels.length === 0 || labels.length > 2) { return refuse(); }
    let selected = 0;
    if (kind === "rpc-wrapper") {
      if (labels[0] !== "Closure (rpcService)" || labels.length === 2 && labels[1] !== "Closure") { return refuse(); }
    } else if (labels.length === 2) {
      if (labels[0] !== "Closure (rZe)" || labels[1] !== "Closure") { return refuse(); }
      selected = 1;
    } else if (labels[0] !== "Closure") { return refuse(); }
    const objectId = result[selected]?.value.objectId;
    if (objectId === undefined) { return refuse(); }
    return objectId;
  } catch { return refuse(); }
}
