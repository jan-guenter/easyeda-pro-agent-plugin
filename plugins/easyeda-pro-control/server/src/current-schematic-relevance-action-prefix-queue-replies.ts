/** Source-specific function metadata only. Original private request/pause
 * custody and permission to continue are separate and cannot come from JSON. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_PREFIX_QUEUE_SOURCE as SOURCE } from "./current-schematic-relevance-action-prefix-queue-source.ts";
import type { CurrentSchematicRelevancePrefixQueueRole } from "./current-schematic-relevance-action-prefix-queue-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["function", "object", "number", "string"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().max(8192).optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string().max(128), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string().max(128), value: remote });
const properties = z.strictObject({ result: z.array(property).max(5), internalProperties: z.array(internal).length(3) });
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_PREFIX_QUEUE_FUNCTION"); } }
export function requireCurrentSchematicRelevancePrefixQueueDescription(value: string, variant: 0 | 1, role: CurrentSchematicRelevancePrefixQueueRole): void {
  const profile = SOURCE[variant].roles[role]; need(value.isWellFormed() && Buffer.byteLength(value) === profile.bytes && createHash("sha256").update(value).digest("hex") === profile.sha256);
}
export function decodeCurrentSchematicRelevancePrefixQueueFunction(input: unknown, variant: 0 | 1, role: CurrentSchematicRelevancePrefixQueueRole,
  scriptId: string): Readonly<{ prototype: string | null; scopes: string }> {
  handle.parse(scriptId); const profile = SOURCE[variant].roles[role]; const reply = properties.parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); const hasPrototype = profile.kind === "class" || profile.kind === "regular" || profile.generator;
  const names = ["name", "length", ...(hasPrototype ? ["prototype"] : []), ...(!profile.strict && profile.kind === "regular" ? ["arguments", "caller"] : [])];
  need(fields.size === names.length && reply.result.length === fields.size && names.every(name => fields.has(name)));
  for (const [name, value] of [["name", profile.name], ["length", profile.arity]] as const) { const field = fields.get(name);
    need(field !== undefined && field.value.type === (name === "name" ? "string" : "number") && field.value.value === value && field.value.objectId === undefined && !field.writable && !field.enumerable && field.configurable);
  }
  const ownPrototype = fields.get("prototype"); if (ownPrototype !== undefined) { need(ownPrototype.value.type === "object" && ownPrototype.value.objectId !== undefined && ownPrototype.value.subtype !== "proxy" && ownPrototype.writable === (profile.kind !== "class") && !ownPrototype.enumerable && !ownPrototype.configurable); }
  for (const name of ["arguments", "caller"]) { const field = fields.get(name); if (field !== undefined) { need(field.value.type === "object" && field.value.subtype === "null" && field.value.value === null && field.value.objectId === undefined && !field.writable && !field.enumerable && !field.configurable); } }
  const internals = new Map(reply.internalProperties.map(item => [item.name, item.value])); need(internals.size === 3);
  const location = internals.get("[[FunctionLocation]]"), parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
  const actual = point.parse(location?.value); need(location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined && actual.scriptId === scriptId && actual.lineNumber === profile.lineNumber && actual.columnNumber === profile.columnNumber);
  need(parent?.objectId !== undefined && (profile.generator ? parent.type === "object" && parent.className === "GeneratorFunction" : parent.type === "function") && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[(?:[1-9]|1[0-6])\]$/u.test(scopes.description ?? ""));
  return Object.freeze({ prototype: ownPrototype?.value.objectId ?? null, scopes: scopes.objectId });
}

const scopeValue = z.looseObject({ type: z.string(), objectId: handle.optional(), subtype: z.string().optional() });
const scopeProperty = z.strictObject({ name: z.string().max(128), value: scopeValue, isOwn: z.literal(true), writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean() });
const scopePacket = z.strictObject({ result: z.array(scopeProperty).max(128), internalProperties: z.array(z.unknown()).max(4).optional() });
/** Select only an actually exposed original lexical binding. Lexical this is
 * absent from these V8 scope packets and cannot be inferred from source text. */
export function decodeCurrentSchematicRelevancePrefixQueueScope(input: unknown, name: "t" | "e" | "i"): string {
  const packet = scopePacket.parse(captureCurrentPcbStringClockReply(input).value);
  const fields = packet.result.filter(field => field.name === name); need(fields.length === 1);
  const value = fields[0]?.value; need(value !== undefined && (value.type === "object" || value.type === "function") && value.subtype !== "proxy" && value.objectId !== undefined);
  return value.objectId;
}
const weakValue = z.strictObject({ type: z.literal("object"), objectId: handle, subtype: z.never().optional(), className: z.string().optional(), description: z.string().optional() });
const weakInternal = z.strictObject({ name: z.enum(["[[Prototype]]", "[[WeakRefTarget]]"]), value: weakValue });
const weakPacket = z.strictObject({ result: z.tuple([]), internalProperties: z.array(weakInternal).length(2) });
/** Actual V8 WeakRef target metadata without invoking deref. The next fixed
 * identity proof must still compare this target with the original shape. */
export function decodeCurrentSchematicRelevancePrefixQueueWeakRef(input: unknown): Readonly<{ prototype: string; target: string }> {
  const packet = weakPacket.parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(packet.internalProperties.map(field => [field.name, field.value])); need(fields.size === 2);
  const parent = fields.get("[[Prototype]]"), target = fields.get("[[WeakRefTarget]]");
  need(parent?.objectId !== undefined && target?.objectId !== undefined && parent.className === "WeakRef");
  return Object.freeze({ prototype: parent.objectId, target: target.objectId });
}
