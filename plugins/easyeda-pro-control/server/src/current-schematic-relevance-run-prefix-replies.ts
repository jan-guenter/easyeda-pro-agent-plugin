/** Bounded Inspector data for the original run-prefix collector. No decoded
 * handle or structural packet supplies an owner or permission to continue. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "undefined", "string", "number", "boolean", "symbol", "bigint"]), subtype: z.string().max(128).optional(), className: z.string().max(256).optional(), description: z.string().max(32_768).optional(), objectId: handle.optional(), value: z.unknown().optional(), unserializableValue: z.string().max(128).optional() });
const field = z.strictObject({ name: z.string().max(256), value: remote.optional(), get: remote.optional(), set: remote.optional(), writable: z.boolean().optional(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true), symbol: remote.optional() });
const internal = z.strictObject({ name: z.string().max(128), value: remote });
const packet = z.strictObject({ result: z.array(field).max(513), internalProperties: z.array(internal).max(8).optional() });
const remoteReply = z.strictObject({ result: remote });
const trueReply = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
export type CurrentSchematicRelevancePrefixRemote = z.infer<typeof remote>;
export type CurrentSchematicRelevancePrefixProperties = z.infer<typeof packet>;
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_RUN_PREFIX_REPLY"); } }
export function currentSchematicRelevancePrefixHandle(value: CurrentSchematicRelevancePrefixRemote | undefined): string {
  need(value !== undefined && (value.type === "object" || value.type === "function" || value.type === "symbol") && value.objectId !== undefined && value.subtype !== "proxy" && value.subtype !== "null" && value.value === undefined); return value.objectId;
}
export function currentSchematicRelevancePrefixCapture(input: unknown): string {
  const value = remoteReply.parse(captureCurrentPcbStringClockReply(input).value).result;
  need(value.type === "object" && value.subtype === "array" && value.className === "Array" && /^Array\((?:0|[1-9]\d{0,2})\)$/u.test(value.description ?? "")); return currentSchematicRelevancePrefixHandle(value);
}
/** Inspect an original value before any program follows its descriptors or
 * prototype. Proxy internals and duplicate properties fail before that read. */
export function currentSchematicRelevancePrefixProperties(input: unknown): CurrentSchematicRelevancePrefixProperties {
  const value = packet.parse(captureCurrentPcbStringClockReply(input).value);
  const names = new Set(value.result.map(item => item.name)); need(names.size === value.result.length);
  const internals = value.internalProperties ?? []; need(new Set(internals.map(item => item.name)).size === internals.length);
  need(internals.every(item => !["[[Target]]", "[[Handler]]", "[[IsRevoked]]", "[[TargetFunction]]", "[[BoundThis]]", "[[BoundArgs]]"].includes(item.name)));
  return value;
}
export function currentSchematicRelevancePrefixTuple(input: unknown, length?: number): readonly CurrentSchematicRelevancePrefixRemote[] {
  const value = currentSchematicRelevancePrefixProperties(input); const fields = new Map(value.result.map(item => [item.name, item]));
  const size = fields.get("length"); need(size?.value?.type === "number" && typeof size.value.value === "number" && Number.isSafeInteger(size.value.value) && size.value.value >= 0 && size.value.value <= 384 && !Object.is(size.value.value, -0) && size.writable === true && !size.enumerable && !size.configurable);
  const count = size.value.value; need((length === undefined || count === length) && fields.size === count + 1);
  const parent = value.internalProperties; need(parent?.length === 1 && parent[0]?.name === "[[Prototype]]" && parent[0].value.type === "object" && parent[0].value.subtype === "array" && parent[0].value.className === "Array" && parent[0].value.objectId !== undefined);
  const result: CurrentSchematicRelevancePrefixRemote[] = [];
  for (let index = 0; index < count; index += 1) { const item = fields.get(String(index)); need(item?.value !== undefined && item.get === undefined && item.set === undefined && item.writable === true && item.enumerable && item.configurable && item.value.subtype !== "proxy"); result.push(item.value); }
  return Object.freeze(result);
}
export function currentSchematicRelevancePrefixTrue(input: unknown): void { trueReply.parse(captureCurrentPcbStringClockReply(input).value); }
export function currentSchematicRelevancePrefixClosure(input: unknown): string {
  const value = currentSchematicRelevancePrefixProperties(input); const first = value.result.find(item => item.name === "0");
  need(first?.value?.type === "object" && first.value.subtype === "internal#scope" && /^Closure(?: \(|$)/u.test(first.value.description ?? "")); return currentSchematicRelevancePrefixHandle(first.value);
}
export const CURRENT_SCHEMATIC_RELEVANCE_PREFIX_NATIVE_FUNCTIONS = Object.freeze([
  ["get", 2], ["defineProperty", 3], ["deleteProperty", 2], ["push", 1], ["indexOf", 1], ["forEach", 1], ["add", 1], ["delete", 1], ["clear", 0], ["values", 0],
  ["get", 1], ["set", 2], ["split", 2], ["slice", 2], ["Error", 1], ["toString", 0], ["Promise", 1], ["then", 2], ["isFinite", 1], ["clear", 0],
  ["entries", 0], ["keys", 0], ["values", 0], ["values", 0], ["has", 1], ["delete", 1], ["deref", 0], ["toString", 0], ["call", 1], ["map", 1], ["trim", 0], ["slice", 2], ["get [Symbol.species]", 0], ["get [Symbol.species]", 0],
] as const);
/** The two constructors have standard static fields. This scoped profile
 * retains them without changing the older general native-method decoder. */
export function currentSchematicRelevancePrefixNativeFunction(input: unknown, expected: readonly [string, number]): void {
  const value = currentSchematicRelevancePrefixProperties(input); const fields = new Map(value.result.map(item => [item.name, item]));
  const [name, arity] = expected;
  for (const [key, expectedValue] of [["name", name], ["length", arity]] as const) { const item = fields.get(key); need(item !== undefined && item.value?.value === expectedValue && item.value.type === (key === "name" ? "string" : "number") && item.value.objectId === undefined && item.writable === false && !item.enumerable && item.configurable); }
  let extra: readonly string[] = [];
  if (name === "Error") { extra = ["prototype", "stackTraceLimit", "captureStackTrace", "isError"]; }
  else if (name === "Promise") { extra = ["prototype", "all", "allSettled", "any", "race", "resolve", "reject", "withResolvers", "try", "Symbol(Symbol.species)"]; }
  need([...fields.keys()].every(key => key === "name" || key === "length" || extra.includes(key)));
  if (extra.length === 0) { need(fields.size === 2); }
  else { const prototype = fields.get("prototype"); need(prototype?.value?.type === "object" && prototype.value.objectId !== undefined && prototype.value.subtype !== "proxy" && prototype.writable === false && !prototype.enumerable && !prototype.configurable); }
  if (name === "Error") { const limit = fields.get("stackTraceLimit"); need(limit?.value?.type === "number" && typeof limit.value.value === "number" && Number.isInteger(limit.value.value) && limit.value.value >= 1 && limit.value.value <= 100 && limit.writable === true && limit.enumerable && limit.configurable); }
  const internals = new Map((value.internalProperties ?? []).map(item => [item.name, item.value]));
  const parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]"); need(internals.size === 2 && parent?.type === "function" && parent.description === "function () { [native code] }" && parent.objectId !== undefined && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.description === "Scopes[0]" && scopes.objectId !== undefined);
}
