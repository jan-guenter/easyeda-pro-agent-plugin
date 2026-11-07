/** Bounded correlated Inspector data. Parsing alone proves no owner, action,
 * source model correspondence or permission to continue an invocation. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RAW_SNAPSHOT_PROGRAM as SNAPSHOT } from "./current-schematic-relevance-action-raw-programs.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remoteSchema = z.strictObject({ type: z.enum(["object", "function", "undefined", "string", "number", "boolean", "symbol", "bigint"]), subtype: z.string().max(128).optional(), className: z.string().max(256).optional(), description: z.string().max(16_384).optional(), objectId: handle.optional(), value: z.unknown().optional(), unserializableValue: z.string().max(128).optional() });
const propertySchema = z.strictObject({ name: z.string().max(256), value: remoteSchema.optional(), get: remoteSchema.optional(), set: remoteSchema.optional(), writable: z.boolean().optional(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true), symbol: remoteSchema.optional() });
const internalSchema = z.strictObject({ name: z.string().max(256), value: remoteSchema });
const replySchema = z.strictObject({ result: z.array(propertySchema).max(256), internalProperties: z.array(internalSchema).max(3) });
export type CurrentSchematicRelevanceRawRemote = z.infer<typeof remoteSchema>;
export type CurrentSchematicRelevanceRawProperty = z.infer<typeof propertySchema>;
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_RAW_METADATA"); } }
export function currentSchematicRelevanceRawProperties(input: unknown): ReadonlyMap<string, CurrentSchematicRelevanceRawProperty> {
  const parsed = replySchema.parse(captureCurrentPcbStringClockReply(input).value); const fields = new Map(parsed.result.map(row => [row.name, row])); need(fields.size === parsed.result.length); return fields;
}
export function currentSchematicRelevanceRawHandle(value: CurrentSchematicRelevanceRawRemote | undefined, type: "object" | "function"): string {
  need(value?.type === type && value.objectId !== undefined && value.subtype !== "proxy" && value.subtype !== "null" && value.value === undefined); return value.objectId;
}
export function currentSchematicRelevanceRawArray(input: unknown, length: number, allowNull = false, functions = false): readonly (string | null)[] {
  const fields = decodeCurrentFootprintCopyClockRpcV2Array(input, length), values: (string | null)[] = [];
  for (let i = 0; i < length; i += 1) { const value = fields.get(String(i));
    if (allowNull && value?.type === "object" && value.subtype === "null" && value.value === null && value.objectId === undefined) { values.push(null); }
    else { const type = value?.type; need(type === "object" || functions && type === "function"); values.push(currentSchematicRelevanceRawHandle(value, type)); }
  } return Object.freeze(values);
}
export function currentSchematicRelevanceRawArrayLength(input: unknown, minimum: number, maximum: number): number {
  const rows = currentSchematicRelevanceRawProperties(input); const field = rows.get("length"); const value = field?.value; need(field?.writable === true && !field.enumerable && !field.configurable && value?.type === "number" && typeof value.value === "number" && Number.isSafeInteger(value.value) && value.value >= minimum && value.value <= maximum); return value.value;
}
export function currentSchematicRelevanceRawNativeConstructor(input: unknown, name: "Object" | "Array" | "Map" | "Set"): string {
  const parsed = replySchema.parse(captureCurrentPcbStringClockReply(input).value); const fields = currentSchematicRelevanceRawProperties(input); const internals = new Map(parsed.internalProperties.map(row => [row.name, row.value]));
  need(internals.size === 2 && internals.has("[[Prototype]]") && internals.has("[[Scopes]]")); const parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
  need(parent?.type === "function" && parent.description === "function () { [native code] }" && parent.objectId !== undefined && parent.subtype === undefined && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.description === "Scopes[0]" && scopes.objectId !== undefined);
  const nameField = fields.get("name"); const lengthField = fields.get("length"); const prototype = fields.get("prototype");
  need(nameField?.value?.type === "string" && nameField.value.value === name && nameField.writable === false && !nameField.enumerable && nameField.configurable && lengthField?.value?.type === "number" && lengthField.value.value === (name === "Map" || name === "Set" ? 0 : 1) && lengthField.writable === false && !lengthField.enumerable && lengthField.configurable && prototype?.value !== undefined && prototype.writable === false && !prototype.enumerable && !prototype.configurable);
  return currentSchematicRelevanceRawHandle(prototype.value, "object");
}
const guardStart = SNAPSHOT.indexOf("function(){for(let i=0;i<entries.length;i++)"), guardStop = SNAPSHOT.lastIndexOf("return true;};") + "return true;}".length;
if (guardStart === -1 || guardStop <= guardStart) { throw new Error("SCHEMATIC_RELEVANCE_RAW_GUARD_ANCHOR"); }
export const CURRENT_SCHEMATIC_RELEVANCE_RAW_GUARD_SOURCE = SNAPSHOT.slice(guardStart, guardStop);
export const CURRENT_SCHEMATIC_RELEVANCE_RAW_GUARD_SCRIPT = `(${SNAPSHOT})`;
const start = CURRENT_SCHEMATIC_RELEVANCE_RAW_GUARD_SCRIPT.indexOf(CURRENT_SCHEMATIC_RELEVANCE_RAW_GUARD_SOURCE); const before = CURRENT_SCHEMATIC_RELEVANCE_RAW_GUARD_SCRIPT.slice(0, start);
export function currentSchematicRelevanceRawGuard(input: unknown): string {
  const parsed = replySchema.parse(captureCurrentPcbStringClockReply(input).value); const fields = currentSchematicRelevanceRawProperties(input); const internals = new Map(parsed.internalProperties.map(row => [row.name, row.value]));
  need(fields.size === 3 && fields.has("name") && fields.has("length") && fields.has("prototype") && internals.size === 3);
  const name = fields.get("name"); const length = fields.get("length"); const prototype = fields.get("prototype"); const location = internals.get("[[FunctionLocation]]");
  need(name?.value?.value === "guard" && name.value.type === "string" && name.writable === false && !name.enumerable && name.configurable && length?.value?.value === 0 && length.value.type === "number" && length.writable === false && !length.enumerable && length.configurable && prototype?.value?.type === "object" && prototype.value.objectId !== undefined && prototype.value.subtype !== "proxy" && prototype.writable === true && !prototype.configurable && !prototype.enumerable && location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined);
  const point = z.strictObject({ scriptId: handle, lineNumber: z.literal(before.split("\n").length - 1), columnNumber: z.literal(before.length - before.lastIndexOf("\n") - 1 + "function".length) }).parse(location.value);
  const parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]"); need(parent?.type === "function" && parent.description === "function () { [native code] }" && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && /^Scopes\[(?:[1-9]|1[0-6])\]$/u.test(scopes.description ?? "")); return point.scriptId;
}
