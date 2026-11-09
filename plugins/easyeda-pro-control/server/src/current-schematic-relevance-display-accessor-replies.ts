/** The exact regular decorator wrapper is created by sloppy nk. Its two
 * immutable null fields belong to this own7 role only; old6 remains exact. */
import { z } from "zod";
import { decodeGeneratedSchematicDisplayAccessorFunction } from "./generated-schematic-display-accessor-replies.ts";
import type { GeneratedSchematicDisplayAccessorRole } from "./generated-schematic-display-accessor-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE as SOURCE } from "./generated-schematic-display-accessor-source.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number"]), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional(), description: z.string().max(8192).optional() });
const property = z.strictObject({ name: z.enum(["name", "length", "prototype", "arguments", "caller"]), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string().max(128), value: remote });
const reply = z.strictObject({ result: z.array(property).length(5), internalProperties: z.array(internal).length(3) });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_ACCESSOR_ORIGINAL_DECORATOR"); } }
export function decodeCurrentSchematicRelevanceDisplayAccessorFunction(input: unknown, variant: 0 | 1, role: GeneratedSchematicDisplayAccessorRole, scriptId: string): Readonly<{ scopes: string; prototype: string | null }> {
  if (role !== "decoratedSetter") { return decodeGeneratedSchematicDisplayAccessorFunction(input, variant, role, scriptId); }
  handle.parse(scriptId); const source = SOURCE[variant].methods.decoratedSetter, value = reply.parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(value.result.map(field => [field.name, field])); need(fields.size === 5);
  for (const [key, expected] of [["name", source.name], ["length", source.arity]] as const) { const field = fields.get(key);
    need(field !== undefined && field.value.type === (key === "name" ? "string" : "number") && field.value.value === expected && field.value.objectId === undefined && field.value.subtype === undefined && !field.writable && !field.enumerable && field.configurable);
  }
  for (const key of ["arguments", "caller"] as const) { const field = fields.get(key);
    need(field !== undefined && field.value.type === "object" && field.value.subtype === "null" && field.value.value === null && field.value.objectId === undefined && !field.writable && !field.enumerable && !field.configurable);
  }
  const prototype = fields.get("prototype"); need(prototype !== undefined && prototype.value.type === "object" && prototype.value.objectId !== undefined && prototype.value.subtype !== "proxy" && prototype.value.value === undefined && prototype.writable && !prototype.enumerable && !prototype.configurable);
  const internals = new Map(value.internalProperties.map(field => [field.name, field.value])); need(internals.size === 3);
  const location = internals.get("[[FunctionLocation]]"), parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
  need(location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined && parent?.type === "function" && parent.objectId !== undefined && parent.subtype === undefined && parent.description === "function () { [native code] }" && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[(?:[1-9]|1[0-6])\]$/u.test(scopes.description ?? ""));
  z.strictObject({ scriptId: z.literal(scriptId), lineNumber: z.literal(source.lineNumber), columnNumber: z.literal(source.columnNumber) }).parse(location.value);
  return Object.freeze({ prototype: prototype.value.objectId, scopes: scopes.objectId });
}
