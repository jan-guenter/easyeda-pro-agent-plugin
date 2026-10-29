/** Descriptor/source checks for the preload-created registry. Native owners
 * retain the actual receiver and must bind the returned script before use. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_COPY_UI_REGISTRY_CAPTURE_ORDER as ORDER, CURRENT_FOOTPRINT_COPY_UI_REGISTRY_SOURCE as SOURCE,
  assertCurrentFootprintCopyUiRegistryFunction } from "./current-footprint-copy-ui-registry-source.ts";
import type { CurrentFootprintCopyUiRegistryFunction } from "./current-footprint-copy-ui-registry-source.ts";

const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = z.string().max(4096).refine(value => value.isWellFormed() && !value.includes("\0"));
const point = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const remote = z.object({ type: z.enum(["object", "function", "string", "number"]), subtype: text.optional(), className: text.optional(),
  description: text.optional(), objectId: token.optional(), value: z.union([z.null(), text, z.number(), point]).optional() }).strict();
const property = z.object({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const accessor = z.object({ name: text, get: remote, set: z.object({ type: z.literal("undefined") }).strict(),
  configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: text, value: remote }).strict();
type Remote = z.infer<typeof remote>;
type Property = z.infer<typeof property>;
function fail(): never { throw new Error("FOOTPRINT_COPY_UI_REGISTRY_METADATA"); }
function functionValue(value: Remote, role: CurrentFootprintCopyUiRegistryFunction): string {
  if (value.type !== "function" || value.className !== "Function" || value.objectId === undefined ||
      value.value !== undefined || value.subtype !== undefined) { return fail(); }
  assertCurrentFootprintCopyUiRegistryFunction(role, value.description); return value.objectId;
}
function ownData(item: z.infer<typeof property> | z.infer<typeof accessor> | undefined): Property {
  if (item === undefined || !("value" in item)) { return fail(); } return item;
}
function fieldCount(role: CurrentFootprintCopyUiRegistryFunction): number {
  if (role === "registryConstructor") { return 6; }
  if (role === "contextProducer") { return 5; } return 2;
}

/** No script identity is inferred from source text. A supplied expected ID must
 * match, otherwise the native owner must qualify this returned original ID. */
export function decodeCurrentFootprintCopyUiRegistryFunction(input: unknown, role: CurrentFootprintCopyUiRegistryFunction,
  expectedScriptId?: string): Readonly<{ scriptId: string; scopesId: string }> {
  try {
    if (expectedScriptId !== undefined) { token.parse(expectedScriptId); }
    if (!Object.hasOwn(SOURCE.functions, role)) { return fail(); }
    const count = fieldCount(role), expected = SOURCE.functions[role];
    const reply = z.object({ result: z.array(z.union([property, accessor])).length(count),
      internalProperties: z.array(internal).length(3) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
    const fields = new Map(reply.result.map(item => [item.name, item])); if (fields.size !== count) { return fail(); }
    for (const name of ["name", "length"] as const) {
      const item = ownData(fields.get(name)), value = name === "name" ? expected.name : expected.arity;
      if (item.writable || item.enumerable || !item.configurable || item.value.value !== value || Object.is(item.value.value, -0) ||
          item.value.type !== (name === "name" ? "string" : "number") || item.value.objectId !== undefined ||
          item.value.subtype !== undefined || item.value.className !== undefined) { return fail(); }
    }
    if (role === "registryConstructor" || role === "contextProducer") {
      const item = ownData(fields.get("prototype"));
      if (item.writable !== (role === "contextProducer") || item.enumerable || item.configurable || item.value.type !== "object" ||
          item.value.className !== "Object" || item.value.description !== "Object" || item.value.subtype !== undefined ||
          item.value.objectId === undefined || item.value.value !== undefined) { return fail(); }
    }
    // The classic preload and its ws declaration have no strict directive.
    // Require its exact ordinary-function roster rather than accepting both.
    if (role === "contextProducer") {
      for (const name of ["arguments", "caller"] as const) {
        const item = ownData(fields.get(name));
        if (item.writable || item.enumerable || item.configurable || item.value.type !== "object" || item.value.subtype !== "null" ||
            item.value.value !== null || item.value.objectId !== undefined || item.value.className !== undefined || item.value.description !== undefined) { return fail(); }
      }
    }
    if (role === "registryConstructor") {
      const context = fields.get("context"), instance = ownData(fields.get("getInstance")), prefix = ownData(fields.get("LIB_ID_PREFFIX"));
      if (!prefix.writable || !prefix.enumerable || !prefix.configurable || prefix.value.type !== "string" || prefix.value.value !== "extend_lib_" ||
          prefix.value.objectId !== undefined || prefix.value.subtype !== undefined || prefix.value.className !== undefined ||
          !instance.writable || instance.enumerable || !instance.configurable || context === undefined || !("get" in context) ||
          context.enumerable || !context.configurable) { return fail(); }
      const contextId = functionValue(context.get, "registryContext"), instanceId = functionValue(instance.value, "registryInstance");
      if (instanceId === contextId) { return fail(); }
    }
    const entries = new Map(reply.internalProperties.map(item => [item.name, item.value]));
    const location = entries.get("[[FunctionLocation]]"), parent = entries.get("[[Prototype]]"), position = location?.value, scopes = entries.get("[[Scopes]]");
    if (entries.size !== 3 || location?.type !== "object" || location.subtype !== "internal#location" || location.objectId !== undefined ||
        position === null || typeof position !== "object" || (expectedScriptId !== undefined && position.scriptId !== expectedScriptId) ||
        position.lineNumber !== expected.lineNumber || position.columnNumber !== expected.columnNumber ||
        parent?.type !== "function" || parent.className !== "Function" || parent.objectId === undefined || parent.value !== undefined || parent.subtype !== undefined ||
        scopes?.type !== "object" || scopes.subtype !== "internal#scopeList" || scopes.className !== "Array" || scopes.objectId === undefined ||
        scopes.value !== undefined || !/^Scopes\[[1-8]\]$/u.test(scopes.description ?? "")) { return fail(); }
    return Object.freeze({ scriptId: position.scriptId, scopesId: scopes.objectId });
  } catch { return fail(); }
}

/** Named class sl has its own lexical Block before the shared preload Closure.
 * The owner must prove that Block's original sl binding equals its constructor
 * before following ws in the distinct original Closure wrapper. */
export function decodeCurrentFootprintCopyUiRegistryClassScope(input: unknown): Readonly<{ blockScopeId: string; closureScopeId: string }> {
  try {
    const reply = z.object({ result: z.array(property).length(3) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
    const ids: string[] = [], labels = ["Block", "Closure", "Global"] as const;
    for (const [index, item] of reply.result.entries()) {
      const value = item.value;
      if (item.name !== String(index) || !item.writable || !item.enumerable || !item.configurable || value.type !== "object" ||
          value.subtype !== "internal#scope" || value.className !== "Object" || value.description !== labels[index] ||
          value.objectId === undefined || value.value !== undefined || ids.includes(value.objectId)) { return fail(); }
      ids.push(value.objectId);
    }
    const [blockScopeId, closureScopeId] = ids; if (blockScopeId === undefined || closureScopeId === undefined) { return fail(); }
    return Object.freeze({ blockScopeId, closureScopeId });
  } catch { return fail(); }
}

/** Fixed native eight-element capture. Only its four qualified function handles
 * escape; the owner retains and synchronously rechecks all original objects. */
export function decodeCurrentFootprintCopyUiRegistryArray(input: unknown): readonly string[] {
  try {
    const reply = z.object({ result: z.array(property).length(9), internalProperties: z.array(internal).length(1) }).strict()
      .parse(captureCurrentPcbStringClockReply(input).value);
    const fields = new Map(reply.result.map(item => [item.name, item])); if (fields.size !== 9) { return fail(); }
    const length = fields.get("length"), parent = reply.internalProperties[0];
    if (length?.value.type !== "number" || length.value.value !== 8 || length.value.objectId !== undefined ||
        !length.writable || length.enumerable || length.configurable || parent?.name !== "[[Prototype]]" ||
        parent.value.type !== "object" || parent.value.subtype !== "array" || parent.value.className !== "Array" ||
        parent.value.description !== "Array(0)" || parent.value.objectId === undefined || parent.value.value !== undefined) { return fail(); }
    const handles = new Set<string>(), ids: string[] = [];
    const objectClasses = ["Object", "sl", "Map", "Array"] as const, objectSubtypes = [undefined, undefined, "map", "array"] as const;
    for (let index = 0; index < 8; index += 1) {
      const item = fields.get(String(index)), role = ORDER[index], value = item?.value;
      if (item === undefined || !item.writable || !item.enumerable || !item.configurable || value?.objectId === undefined ||
          value.value !== undefined || handles.has(value.objectId)) { return fail(); }
      handles.add(value.objectId);
      if (role !== undefined) { ids.push(functionValue(value, role)); }
      else if (value.type !== "object" || value.className !== objectClasses[index - 4] || value.subtype !== objectSubtypes[index - 4] ||
          (index === 7 && value.description !== "Array(7)")) { return fail(); }
    }
    return Object.freeze(ids);
  } catch { return fail(); }
}
