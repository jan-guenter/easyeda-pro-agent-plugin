/** Bounded decoding of the two fixed original PCB function/scope hops.
 * These decoders check shape/source location, not ownership of a CDP session.
 * Only the retained diagnostic owner may supply the admitted original scriptId
 * and consume these private handles. Never expose them as caller selectors.
 */
import { types } from "node:util";
import { z } from "zod";

export type CurrentPcbDiagnosticModelFunction = "rpc-wrapper" | "save-handler";
export const CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS = Object.freeze({
  "rpc-wrapper": Object.freeze({ lineNumber: 30, columnNumber: 14_676, utf16Offset: 16_078, parameterCount: 3 }),
  "save-handler": Object.freeze({ lineNumber: 91_968, columnNumber: 9858, utf16Offset: 10_798_714, parameterCount: 1 }),
});
const handleSchema = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const stringSchema = z.string().max(16_384).refine(value => value.isWellFormed() && !value.includes("\0"));
const positionSchema = z.object({
  scriptId: handleSchema, lineNumber: z.number().int().min(0), columnNumber: z.number().int().min(0),
}).strict();
const valueSchema = z.union([z.string().max(16_384), z.number(), positionSchema]);
const remoteSchema = z.object({
  type: z.enum(["object", "function", "string", "number"]),
  subtype: stringSchema.optional(), className: stringSchema.optional(), description: stringSchema.optional(),
  objectId: handleSchema.optional(),
  value: valueSchema.optional(),
}).strict();
const propertySchema = z.object({ name: stringSchema, value: remoteSchema, writable: z.boolean(),
  configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const functionSchema = z.object({
  result: z.array(propertySchema).length(2),
  internalProperties: z.array(z.object({ name: stringSchema, value: remoteSchema }).strict()).length(3),
}).strict();
const scopesSchema = z.object({ result: z.array(propertySchema).min(2).max(8) }).strict();
function refuse(): never { throw new Error("PCB_DIAGNOSTIC_MODEL_SCOPE"); }

/** Descriptor-copy before schema access: supplied accessors/proxies are not
 * invoked. Transport JSON still needs its independent duplicate-key decoder.
 */
function data(input: unknown, depth = 0): unknown {
  if (depth > 8) { return refuse(); }
  if (input === null || typeof input === "boolean" || typeof input === "number") { return input; }
  if (typeof input === "string") { if (input.length > 16_384) { return refuse(); } return input; }
  if (typeof input !== "object" || types.isProxy(input)) { return refuse(); }
  const array = Array.isArray(input);
  const prototype: unknown = Object.getPrototypeOf(input);
  if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) { return refuse(); }
  const keys = Reflect.ownKeys(input);
  if (keys.length > 32 || keys.some(key => typeof key !== "string")) { return refuse(); }
  const copy: Record<string, unknown> = {}, items: unknown[] = [];
  for (const key of keys) {
    if (typeof key !== "string") { return refuse(); }
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { return refuse(); }
    if (!array || key !== "length") {
      const value = data(descriptor.value as unknown, depth + 1);
      if (array) {
        if (key !== String(items.length)) { return refuse(); }
        items.push(value);
      } else { Object.defineProperty(copy, key, { value, enumerable: true }); }
    }
  }
  if (array && items.length !== input.length) { return refuse(); }
  return array ? items : copy;
}

/** Decode the remote function returned by the fixed callback/handler selector.
 * Function source stays private, and is not returned to the caller.
 */
export function decodeCurrentPcbDiagnosticModelFunction(input: unknown, kind: CurrentPcbDiagnosticModelFunction): string {
  try {
    const reply = z.object({ result: z.object({ type: z.literal("function"),
      className: z.literal(kind === "rpc-wrapper" ? "Function" : "AsyncFunction"),
      description: stringSchema, objectId: handleSchema }).strict() }).strict().parse(data(input));
    return reply.result.objectId;
  } catch { return refuse(); }
}

/** GetProperties(original function), ownProperties:true, accessorPropertiesOnly:
 * false, generatePreview:false. Matching locations require source admission;
 * they do not establish it themselves. The original caller must also keep its
 * frame/context/navigation/termination guards current through both hops.
 */
export function decodeCurrentPcbDiagnosticModelScopeList(input: unknown, scriptId: string,
  kind: CurrentPcbDiagnosticModelFunction): string {
  try {
    if (!handleSchema.safeParse(scriptId).success) { return refuse(); }
    const location = CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS[kind], reply = functionSchema.parse(data(input));
    const length = reply.result.find(item => item.name === "length"), name = reply.result.find(item => item.name === "name");
    if (length?.value.type !== "number" || length.value.value !== location.parameterCount ||
        name?.value.type !== "string" || name.value.value !== "") { return refuse(); }
    const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    if (internals.size !== 3 || !internals.has("[[Prototype]]")) { return refuse(); }
    const located = internals.get("[[FunctionLocation]]"), scopes = internals.get("[[Scopes]]");
    const point = located?.value;
    if (located?.type !== "object" || located.subtype !== "internal#location" || located.objectId !== undefined ||
        point === null || typeof point !== "object" || point.scriptId !== scriptId ||
        point.lineNumber !== location.lineNumber || point.columnNumber !== location.columnNumber ||
        scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" ||
        scopes.value !== undefined || scopes.objectId === undefined || !/^Scopes\[[2-8]\]$/u.test(scopes.description ?? "")) { return refuse(); }
    return scopes.objectId;
  } catch { return refuse(); }
}

/** Scope zero only, never a name/index supplied by a tool caller. Later scopes
 * are metadata-checked but their variable properties are never enumerated.
 */
export function decodeCurrentPcbDiagnosticModelScope(input: unknown, kind: CurrentPcbDiagnosticModelFunction): string {
  try {
    const reply = scopesSchema.parse(data(input));
    for (let index = 0; index < reply.result.length; index += 1) {
      const item = reply.result[index];
      if (item?.name !== String(index) || item.value.type !== "object" || item.value.subtype !== "internal#scope" ||
          item.value.className !== "Object" || item.value.objectId === undefined || item.value.value !== undefined ||
          !item.writable || !item.configurable || !item.enumerable) { return refuse(); }
    }
    const first = reply.result[0]?.value, last = reply.result.at(-1)?.value;
    if (first?.description !== (kind === "rpc-wrapper" ? "Closure (rpcService)" : "Closure") ||
        first.objectId === undefined || last?.description !== "Global" ||
        new Set(reply.result.map(item => item.value.objectId)).size !== reply.result.length) { return refuse(); }
    return first.objectId;
  } catch { return refuse(); }
}
