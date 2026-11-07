/** Bounded inert inspector metadata helpers. These values issue no owner,
 * original function identity, mutation or source eligibility on their own. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.looseObject({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(), description: z.string().optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string(), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string(), value: remote });
const properties = z.strictObject({ result: z.array(property).max(64), internalProperties: z.array(internal).max(4).optional() });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_DISPLAY_ACCESSOR_REPLY"); } }
export function captureCurrentSchematicDisplayAccessorSource(raw: unknown): Readonly<{ scriptSource: string }> {
  need(raw !== null && typeof raw === "object" && !types.isProxy(raw) && !Array.isArray(raw) && Reflect.ownKeys(raw).length === 1 && (Object.getPrototypeOf(raw) === Object.prototype || Object.getPrototypeOf(raw) === null));
  const source = Object.getOwnPropertyDescriptor(raw, "scriptSource"); need(source !== undefined && Object.hasOwn(source, "value") && typeof source.value === "string" && source.value.isWellFormed() && Buffer.byteLength(source.value) <= 6_472_538);
  return Object.freeze({ scriptSource: source.value });
}
export function currentSchematicDisplayAccessorFunctionScriptId(raw: unknown): string {
  const reply = properties.parse(captureCurrentPcbStringClockReply(raw).value); const location = reply.internalProperties?.find(value => value.name === "[[FunctionLocation]]");
  const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).parse(location?.value.value);
  need(location?.value.type === "object" && location.value.subtype === "internal#location" && location.value.objectId === undefined); return point.scriptId;
}
export function currentSchematicDisplayAccessorArray(raw: unknown, length: 4 | 26): string {
  const value = z.strictObject({ result: remote }).parse(captureCurrentPcbStringClockReply(raw).value).result;
  need(value.type === "object" && value.subtype === "array" && value.className === "Array" && value.description === `Array(${String(length)})` && value.objectId !== undefined && value.value === undefined); return value.objectId;
}
export function currentSchematicDisplayAccessorFourFunctions(raw: unknown): readonly Readonly<{ objectId: string; description: string }>[] {
  const reply = properties.parse(captureCurrentPcbStringClockReply(raw).value); const values = new Map(reply.result.map(value => [value.name, value]));
  need(values.size === 5 && reply.result.length === 5 && reply.internalProperties?.length === 1 && reply.internalProperties[0]?.name === "[[Prototype]]");
  const length = values.get("length"); need(length?.value.type === "number" && length.value.value === 4 && length.writable && !length.enumerable && !length.configurable);
  return Object.freeze(Array.from({ length: 4 }, (_, index) => { const field = values.get(String(index)); need(field !== undefined && field.writable && field.enumerable && field.configurable && field.value.type === "function" && field.value.className === "Function" && field.value.objectId !== undefined && field.value.description !== undefined && field.value.value === undefined);
    return Object.freeze({ objectId: field.value.objectId, description: field.value.description }); }));
}
export function currentSchematicDisplayAccessorScopeFunction(raw: unknown, name: "t"): Readonly<{ objectId: string; description: string }> | null {
  const reply = properties.parse(captureCurrentPcbStringClockReply(raw).value); need(reply.internalProperties === undefined && new Set(reply.result.map(value => value.name)).size === reply.result.length);
  const field = reply.result.find(value => value.name === name); if (field === undefined) { return null; }
  need(field.value.type === "function" && field.value.className === "Function" && field.value.objectId !== undefined && field.value.description !== undefined && field.value.value === undefined);
  return Object.freeze({ objectId: field.value.objectId, description: field.value.description });
}
