/** Inert original-function metadata decoding. A native owner must independently
 * retain the actual action pause, receiver and returned function references. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { qualifyGeneratedSchematicDisplayAccessorSource } from "./generated-schematic-display-accessor-replies.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_ACTIVE_CALLEES as ACTIVE, GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_CALLEES as PREFLIGHT,
  GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as SOURCES, GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE_ROLES as SOURCE_ROLES } from "./generated-schematic-display-action-source.ts";
import type { GeneratedSchematicDisplayActionRole } from "./generated-schematic-display-action-source.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number", "boolean", "undefined"]), subtype: z.string().max(128).optional(),
  className: z.string().max(128).optional(), description: z.string().max(65_536).optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string().max(128), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internalProperty = z.strictObject({ name: z.string().max(128), value: remote });
const properties = z.strictObject({ result: z.array(property).max(64), internalProperties: z.array(internalProperty).max(4).optional() });
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const remoteFunction = z.strictObject({ objectId: handle, description: z.string().max(65_536) });
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`SCH209_DISPLAY_ACTION_REPLY_${reason}`); } }
function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
export function qualifyGeneratedSchematicDisplayActionSource(raw: unknown): 0 | 1 {
  const index = qualifyGeneratedSchematicDisplayAccessorSource(raw);
  const text: unknown = Object.getOwnPropertyDescriptor(raw, "scriptSource")?.value; need(typeof text === "string", "COMPLETE_SOURCE");
  for (const role of SOURCE_ROLES) { const method = SOURCES[index].methods[role]; const body = text.slice(method.start, method.end);
    need(Buffer.byteLength(body) === method.bytes && digest(body) === method.sha256, "SOURCE_METHOD_SPAN"); }
  return index;
}
function callees<const T extends readonly GeneratedSchematicDisplayActionRole[]>(raw: unknown, roles: T, source?: 0 | 1): Readonly<Record<T[number], Readonly<z.infer<typeof remoteFunction>>>> {
  const packet = properties.parse(captureCurrentPcbStringClockReply(raw).value); const fields = new Map(packet.result.map(field => [field.name, field]));
  const owners = source === undefined ? [] : [SOURCES[source].methods.historyConstructor.name, "Object", SOURCES[source].methods.groupConstructor.name, "Object", "Map"];
  const size = roles.length + owners.length;
  need(fields.size === size + 1 && packet.result.length === fields.size && packet.internalProperties?.length === 1 && packet.internalProperties[0]?.name === "[[Prototype]]" &&
    packet.internalProperties[0].value.type === "object" && packet.internalProperties[0].value.objectId !== undefined, "ORIGINAL_CALLEE_ARRAY");
  const length = fields.get("length"); need(length?.value.type === "number" && length.value.value === size && length.value.objectId === undefined && length.writable && !length.enumerable && !length.configurable, "ARRAY_LENGTH");
  const entries = roles.map((role, index) => { const field = fields.get(String(index)), value = field?.value;
    need(field !== undefined && field.writable && field.enumerable && field.configurable && value?.type === "function" && value.className === "Function" && value.objectId !== undefined &&
      value.value === undefined && typeof value.description === "string", "ORIGINAL_FUNCTION"); return [role, { objectId: value.objectId, description: value.description }] as const; });
  for (const [index, className] of owners.entries()) { const field = fields.get(String(roles.length + index)), value = field?.value;
    need(field !== undefined && field.writable && field.enumerable && field.configurable && value?.type === "object" && value.className === className && value.objectId !== undefined && value.value === undefined &&
      value.subtype === (className === "Map" ? "map" : undefined), "ORIGINAL_ACTIVE_OWNER"); }
  need(new Set(packet.result.flatMap(field => field.value.objectId === undefined ? [] : [field.value.objectId])).size === size, "DISTINCT_ACTIVE_REFERENCES");
  need(new Set(entries.map(([, value]) => value.objectId)).size === entries.length, "DISTINCT_FUNCTIONS");
  return freezeDeep(z.record(z.enum(roles), remoteFunction).parse(Object.fromEntries(entries)));
}
export function decodeGeneratedSchematicDisplayActionPreflightCallees(raw: unknown): ReturnType<typeof callees<typeof PREFLIGHT>> { return callees(raw, PREFLIGHT); }
export function decodeGeneratedSchematicDisplayActionActiveCallees(raw: unknown, source: 0 | 1): ReturnType<typeof callees<typeof ACTIVE>> { return callees(raw, ACTIVE, source); }
export function decodeGeneratedSchematicDisplayActionActiveOwners(raw: unknown, source: 0 | 1): Readonly<Record<"history" | "resolver" | "stack" | "action" | "modelCommands", string>> {
  callees(raw, ACTIVE, source); const packet = properties.parse(captureCurrentPcbStringClockReply(raw).value);
  const values = new Map(packet.result.map(field => [field.name, field.value.objectId]));
  const names = ["history", "resolver", "stack", "action", "modelCommands"] as const;
  const entries = names.map((name, index) => { const objectId = values.get(String(ACTIVE.length + index)); need(objectId !== undefined, "ACTIVE_OWNER_REFERENCE"); return [name, objectId]; });
  return Object.freeze(z.record(z.enum(names), handle).parse(Object.fromEntries(entries)));
}
export function requireGeneratedSchematicDisplayActionDescription(value: unknown, source: 0 | 1, role: GeneratedSchematicDisplayActionRole): void {
  const method = SOURCES[source].methods[role]; need(typeof value === "string" && value.isWellFormed() && Buffer.byteLength(value) === method.bytes && digest(value) === method.sha256, "FUNCTION_DESCRIPTION");
}
export function decodeGeneratedSchematicDisplayActionFunction(raw: unknown, source: 0 | 1, role: GeneratedSchematicDisplayActionRole, scriptId: string): Readonly<{ scopes: string; prototype: string | null }> {
  handle.parse(scriptId); const method = SOURCES[source].methods[role]; need(method.kind !== "implicit-class", "IMPLICIT_CONSTRUCTOR_SOURCE_ONLY");
  const packet = properties.parse(captureCurrentPcbStringClockReply(raw).value); const fields = new Map(packet.result.map(field => [field.name, field]));
  const ownPrototype = method.kind === "regular" || method.kind === "class"; const names = ownPrototype ? ["length", "name", "prototype"] : ["length", "name"];
  need(fields.size === names.length && packet.result.length === fields.size && names.every(name => fields.has(name)), "FUNCTION_OWN_FIELDS");
  for (const [name, value] of [["name", method.name], ["length", method.arity]] as const) { const field = fields.get(name);
    need(field !== undefined && !field.writable && field.configurable && !field.enumerable && field.value.objectId === undefined && field.value.value === value && field.value.type === (name === "name" ? "string" : "number"), "NAME_ARITY"); }
  const prototype = fields.get("prototype"); if (prototype !== undefined) { need(prototype.writable === (method.kind === "regular") && !prototype.configurable && !prototype.enumerable &&
    prototype.value.type === "object" && prototype.value.objectId !== undefined && prototype.value.value === undefined, "FUNCTION_PROTOTYPE"); }
  const internal = new Map(packet.internalProperties?.map(field => [field.name, field.value]));
  need(internal.size === 3 && packet.internalProperties?.length === 3, "FUNCTION_INTERNALS");
  const location = internal.get("[[FunctionLocation]]"); const at = point.parse(location?.value), parent = internal.get("[[Prototype]]"), scopes = internal.get("[[Scopes]]");
  need(location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined && at.scriptId === scriptId && at.lineNumber === method.lineNumber && at.columnNumber === method.columnNumber &&
    parent?.type === "function" && parent.objectId !== undefined && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" &&
    scopes.objectId !== undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? ""), "ORIGINAL_LOCATION_SCOPES");
  return Object.freeze({ scopes: scopes.objectId, prototype: prototype?.value.objectId ?? null });
}
export { decodeGeneratedSchematicDisplayAccessorScopes as decodeGeneratedSchematicDisplayActionScopes } from "./generated-schematic-display-accessor-replies.ts";
/** Follow only a selected lexical scope of an actual active arrow. Script and
 * Global scopes remain excluded by the scope-list decoder. */
export function decodeGeneratedSchematicDisplayActionRecorderScope(raw: unknown, source: 0 | 1): string | null {
  const packet = properties.parse(captureCurrentPcbStringClockReply(raw).value); const fields = new Map(packet.result.map(field => [field.name, field]));
  need(fields.size === packet.result.length && packet.internalProperties === undefined, "LEXICAL_VARIABLES"); const field = fields.get("this"); if (field === undefined) { return null; }
  const value = field.value; need(value.type === "object" && value.className === SOURCES[source].methods.historyConstructor.name && value.subtype === undefined && value.objectId !== undefined && value.value === undefined, "ORIGINAL_RECORDER_THIS");
  return value.objectId;
}
