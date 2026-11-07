/** Inert inspector decoders. Actual functions/scopes must arrive through the
 * distinct original native owner; matching data cannot issue writer authority. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CALLEES as CALLEES, GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_FIELDS as FIELDS,
  GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE as SOURCES } from "./generated-schematic-display-accessor-source.ts";
import type { GeneratedSchematicDisplayAccessorField, GeneratedSchematicDisplayAccessorRole } from "./generated-schematic-display-accessor-source.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number", "boolean", "undefined"]), subtype: z.string().max(128).optional(),
  className: z.string().max(128).optional(), description: z.string().max(65_536).optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string().max(128), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string().max(128), value: remote });
const properties = z.strictObject({ result: z.array(property).max(64), internalProperties: z.array(internal).max(4).optional() });
const calleeRecord = z.record(z.enum(CALLEES), z.strictObject({ objectId: handle, description: z.string().max(65_536) }));
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`SCH209_DISPLAY_ACCESSOR_REPLY_${reason}`); } }
function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }

export function qualifyGeneratedSchematicDisplayAccessorSource(raw: unknown): 0 | 1 {
  need(raw !== null && typeof raw === "object" && !types.isProxy(raw) && !Array.isArray(raw) && Reflect.ownKeys(raw).length === 1 &&
    (Object.getPrototypeOf(raw) === Object.prototype || Object.getPrototypeOf(raw) === null), "PLAIN_COMPLETE_SOURCE");
  const descriptor = Object.getOwnPropertyDescriptor(raw, "scriptSource"); need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "SOURCE_DATA");
  const text: unknown = descriptor.value; need(typeof text === "string" && text.isWellFormed() && Buffer.byteLength(text) <= 6_472_538, "SOURCE_BOUND");
  const source = SOURCES.find(value => value.bytes === Buffer.byteLength(text) && value.sha256 === digest(text)); need(source !== undefined, "COMPLETE_SOURCE_IDENTITY");
  for (const role of [...CALLEES, "decoratedSetter", "decoratorSetter", "decoratorAccessor", "monitorAst"] as const) {
    const method = source.methods[role]; const body = text.slice(method.start, method.end); need(Buffer.byteLength(body) === method.bytes && digest(body) === method.sha256, "SOURCE_METHOD_SPAN");
  }
  return source === SOURCES[0] ? 0 : 1;
}
/** Complete retained Array26, never caller-selected remote handles. Source and
 * metadata are qualified separately before any returned handle may dispatch. */
export function decodeGeneratedSchematicDisplayAccessorCallees(raw: unknown): Readonly<Record<typeof CALLEES[number], Readonly<{ objectId: string; description: string }>>> {
  const reply = properties.parse(captureCurrentPcbStringClockReply(raw).value); const fields = new Map(reply.result.map(value => [value.name, value]));
  need(fields.size === CALLEES.length + 1 && reply.result.length === fields.size && reply.internalProperties?.length === 1 && reply.internalProperties[0]?.name === "[[Prototype]]", "CALLEE_ARRAY");
  const length = fields.get("length"); need(length?.value.type === "number" && length.value.value === CALLEES.length && length.writable && !length.enumerable && !length.configurable, "CALLEE_ARRAY_LENGTH");
  const entries = CALLEES.map((role, index) => { const field = fields.get(String(index)), value = field?.value;
    need(field !== undefined && field.writable && field.enumerable && field.configurable && value?.type === "function" && value.className === "Function" && value.objectId !== undefined &&
      value.value === undefined && typeof value.description === "string", "ORIGINAL_CALLEE"); return [role, Object.freeze({ objectId: value.objectId, description: value.description })] as const; });
  need(new Set(entries.map(([, value]) => value.objectId)).size === entries.length, "DISTINCT_CALLEES");
  return Object.freeze(calleeRecord.parse(Object.fromEntries(entries)));
}
export function generatedSchematicDisplayPublicAccessorRole(role: typeof CALLEES[number]): GeneratedSchematicDisplayAccessorRole {
  return role.endsWith(".set") && !["x.set", "y.set"].includes(role) ? "decoratedSetter" : role;
}
export function requireGeneratedSchematicDisplayAccessorDescription(value: unknown, source: 0 | 1, role: GeneratedSchematicDisplayAccessorRole): void {
  const expected = SOURCES[source].methods[role]; need(typeof value === "string" && value.isWellFormed() && Buffer.byteLength(value) === expected.bytes && digest(value) === expected.sha256, "FUNCTION_DESCRIPTION");
}
/** Full original FunctionLocation, name/arity and own descriptor semantics.
 * Current209's V8 has three regular own fields; caller/arguments remain on
 * Function.prototype. Raw class accessors are method functions instead. */
export function decodeGeneratedSchematicDisplayAccessorFunction(raw: unknown, source: 0 | 1, role: GeneratedSchematicDisplayAccessorRole, scriptId: string): Readonly<{ scopes: string; prototype: string | null }> {
  handle.parse(scriptId); const reply = properties.parse(captureCurrentPcbStringClockReply(raw).value); const expected = SOURCES[source].methods[role];
  const fields = new Map(reply.result.map(value => [value.name, value])); let names = ["length", "name"];
  if (expected.kind === "regular") { names = ["length", "name", "prototype"]; }
  if (expected.kind === "class") { names = ["length", "name", "prototype"]; }
  need(fields.size === names.length && reply.result.length === fields.size && names.every(name => fields.has(name)), "FUNCTION_OWN_FIELDS");
  for (const [name, value] of [["name", expected.name], ["length", expected.arity]] as const) {
    const field = fields.get(name); need(field !== undefined && !field.writable && field.configurable && !field.enumerable && field.value.objectId === undefined && field.value.value === value &&
      field.value.type === (name === "name" ? "string" : "number"), "FUNCTION_NAME_ARITY");
  }
  const prototype = fields.get("prototype"); if (prototype !== undefined) { need(prototype.writable === (expected.kind === "regular") && !prototype.configurable && !prototype.enumerable &&
    prototype.value.type === "object" && prototype.value.objectId !== undefined && prototype.value.value === undefined, "FUNCTION_PROTOTYPE"); }
  const internals = new Map(reply.internalProperties?.map(value => [value.name, value.value]));
  need(internals.size === 3 && reply.internalProperties?.length === 3 && internals.has("[[Prototype]]"), "FUNCTION_INTERNALS");
  const location = internals.get("[[FunctionLocation]]"); const at = point.parse(location?.value), parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
  need(location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined && at.scriptId === scriptId && at.lineNumber === expected.lineNumber && at.columnNumber === expected.columnNumber &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? "") &&
    parent?.type === "function" && parent.objectId !== undefined, "ORIGINAL_FUNCTION_LOCATION_SCOPES");
  return Object.freeze({ scopes: scopes.objectId, prototype: prototype?.value.objectId ?? null });
}
/** Enumerate only the original function's bounded lexical scopes. Never
 * inspect Script/Global variables or accept a caller-supplied scope index. */
export function decodeGeneratedSchematicDisplayAccessorScopes(raw: unknown): readonly string[] {
  const reply = properties.parse(captureCurrentPcbStringClockReply(raw).value); need(reply.result.length > 0 && reply.result.length <= 8 && reply.internalProperties === undefined, "SCOPE_LIST_BOUND");
  const handles = new Set<string>(), selected: string[] = [];
  for (const [index, field] of reply.result.entries()) { const value = field.value;
    need(field.name === String(index) && field.writable && field.enumerable && field.configurable && value.type === "object" && value.subtype === "internal#scope" && value.className === "Object" &&
      value.objectId !== undefined && value.value === undefined && !handles.has(value.objectId), "LEXICAL_SCOPE"); handles.add(value.objectId);
    if (value.description === "Block" || value.description === "Closure" || /^Closure \([A-Za-z_$][\w$]*\)$/u.test(value.description ?? "")) { selected.push(value.objectId); }
    else { need(value.description === "Script" || value.description === "Global", "UNSUPPORTED_SCOPE_KIND"); }
  }
  need(reply.result.at(-1)?.value.description === "Global" && selected.length > 0, "ORIGINAL_LEXICAL_CHAIN"); return Object.freeze(selected);
}
export type GeneratedSchematicDisplayScopeValue = Readonly<{ kind: "object"; objectId: string }> | Readonly<{ kind: "field"; field: GeneratedSchematicDisplayAccessorField }> | Readonly<{ kind: "undefined" }>;
/** Native correlates exactly one a/i/t from each actual wrapper and undefined
 * e from its actual c8e setter. This only decodes data, never fabricates a scope. */
export function decodeGeneratedSchematicDisplayAccessorScopeValue(raw: unknown, name: "a" | "i" | "t" | "e" | "this", source?: 0 | 1): GeneratedSchematicDisplayScopeValue | null {
  const reply = properties.parse(captureCurrentPcbStringClockReply(raw).value); const fields = new Map(reply.result.map(value => [value.name, value]));
  need(fields.size === reply.result.length && reply.internalProperties === undefined, "LEXICAL_VARIABLES"); const field = fields.get(name); if (field === undefined) { return null; }
  const value = field.value;
  if (name === "e") { need(value.type === "undefined" && value.objectId === undefined && value.value === undefined, "VALIDATOR_MUST_BE_UNDEFINED"); return Object.freeze({ kind: "undefined" }); }
  if (name === "t") { need(value.type === "string" && typeof value.value === "string" && FIELDS.slice(2).some(key => key === value.value) && value.objectId === undefined, "CAPTURED_FIELD");
    return Object.freeze({ kind: "field", field: z.enum(FIELDS).parse(value.value) }); }
  let className: string | null = "Object"; if (name === "this") { className = source === undefined ? null : SOURCES[source].methods.monitorConstructor.name; }
  need(className !== null && value.type === "object" && value.className === className && value.subtype === undefined && value.objectId !== undefined && value.value === undefined, "CAPTURED_OWNER_OBJECT");
  return Object.freeze({ kind: "object", objectId: value.objectId });
}
