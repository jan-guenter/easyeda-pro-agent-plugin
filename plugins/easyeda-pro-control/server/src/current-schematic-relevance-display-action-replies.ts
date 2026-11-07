/** The pinned non-strict module defines Cr as a regular rest-parameter
 * function. Its actual own caller/arguments data fields are part of this
 * seven-record profile. The old six-record metadata parser is unchanged. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as SOURCE } from "./generated-schematic-display-action-source.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number"]), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional(), description: z.string().max(8192).optional() });
const property = z.strictObject({ name: z.enum(["name", "length", "prototype", "arguments", "caller"]), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string().max(128), value: remote });
const reply = z.strictObject({ result: z.array(property).length(5), internalProperties: z.array(internal).length(3) });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_ACTION_ORIGINAL_NOOP"); } }
export function decodeCurrentSchematicRelevanceDisplayActionNoop(input: unknown, variant: 0 | 1, scriptId: string): void {
  handle.parse(scriptId); const source = SOURCE[variant].methods.noop, value = reply.parse(captureCurrentPcbStringClockReply(input).value);
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
}
