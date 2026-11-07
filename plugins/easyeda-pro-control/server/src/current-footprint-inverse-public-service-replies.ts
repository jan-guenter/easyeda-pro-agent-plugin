/** Source-specific native metadata only. Original request/context custody and
 * permission to call/resume remain separate private owner obligations. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_SERVICE_SOURCE as SOURCE } from "./current-footprint-inverse-public-service-source.ts";
import type { CurrentFootprintInversePublicServiceRole } from "./current-footprint-inverse-public-service-source.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string(), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string(), value: remote });
const fieldsSchema = z.strictObject({ result: z.array(property).min(2).max(5), internalProperties: z.array(internal).length(3) });
const pointSchema = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const scopeListSchema = z.strictObject({ result: z.array(property).min(2).max(4) });
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_PUBLIC_SERVICE_METADATA"); } }
export function requireCurrentFootprintInversePublicServiceDescription(value: string, role: CurrentFootprintInversePublicServiceRole): void {
  const expected = SOURCE[role]; need(Buffer.byteLength(value) === expected.bytes && createHash("sha256").update(value).digest("hex") === expected.sha256);
}
export function decodeCurrentFootprintInversePublicServiceFunction(input: unknown, role: CurrentFootprintInversePublicServiceRole, expectedScriptId?: string): Readonly<{ scriptId: string; scopes: string }> {
  const expected = SOURCE[role], packet = fieldsSchema.parse(capture(input));
  const fields = new Map(packet.result.map(row => [row.name, row])); const regular = expected.kind === "regular" && !expected.async;
  const names = ["name", "length", ...(regular ? ["prototype"] : []), ...(!expected.strict && regular ? ["arguments", "caller"] : [])];
  need(fields.size === packet.result.length && fields.size === names.length && names.every(name => fields.has(name)));
  for (const [name, value] of [["name", expected.name], ["length", expected.arity]] as const) {
    const field = fields.get(name); need(field !== undefined && !field.writable && !field.enumerable && field.configurable && field.value.type === (name === "name" ? "string" : "number") && field.value.value === value && field.value.objectId === undefined && field.value.subtype === undefined);
  }
  if (regular) { const field = fields.get("prototype"); need(field !== undefined && field.writable && !field.enumerable && !field.configurable && field.value.type === "object" && field.value.objectId !== undefined && field.value.subtype !== "proxy"); }
  for (const name of ["arguments", "caller"]) { const field = fields.get(name); if (field !== undefined) { need(!field.writable && !field.enumerable && !field.configurable && field.value.type === "object" && field.value.subtype === "null" && field.value.value === null && field.value.objectId === undefined); } }
  const internals = new Map(packet.internalProperties.map(row => [row.name, row.value])); need(internals.size === 3);
  const location = internals.get("[[FunctionLocation]]"), parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]"); const point = pointSchema.parse(location?.value);
  need(location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined && (expectedScriptId === undefined || point.scriptId === expectedScriptId) && point.lineNumber === expected.lineNumber && point.columnNumber === expected.columnNumber);
  need(parent?.type === (expected.async ? "object" : "function") && parent.className === (expected.async ? "AsyncFunction" : "Function") && parent.objectId !== undefined && parent.description === (expected.async ? "AsyncFunction" : "function () { [native code] }"));
  need(scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? ""));
  return Object.freeze({ scriptId: point.scriptId, scopes: scopes.objectId });
}
/** Read no Script/Global bindings. Only the original leading rpcService
 * closure can supply t/e/i; lexical this requires an actual callback entry. */
export function decodeCurrentFootprintInversePublicServiceScope(input: unknown): string {
  const packet = scopeListSchema.parse(capture(input));
  for (const [index, row] of packet.result.entries()) {
    need(row.name === String(index) && row.writable && row.enumerable && row.configurable && row.value.type === "object" && row.value.subtype === "internal#scope" && row.value.className === "Object" && row.value.objectId !== undefined);
    const label = row.value.description;
    if (index === 0) { need(label === "Closure (rpcService)"); }
    else if (index === packet.result.length - 1) { need(label === "Global"); }
    else { need(label === "Closure" || label === "Script" && index === packet.result.length - 2); }
  }
  const first = packet.result[0]; need(first?.value.objectId !== undefined); return first.value.objectId;
}
const arrayRemote = remote.extend({ type: z.enum(["object", "function", "number", "string", "boolean", "undefined"]) });
const arrayProperty = property.extend({ value: arrayRemote });
const arrayInternal = internal.extend({ value: arrayRemote });
const arrayPacket = z.strictObject({ result: z.array(arrayProperty).max(21), internalProperties: z.tuple([arrayInternal]) });
export function decodeCurrentFootprintInversePublicServiceArray(input: unknown, count: 1 | 3 | 4 | 17): readonly z.infer<typeof arrayRemote>[] {
  const packet = arrayPacket.parse(capture(input)); need(packet.result.length === count + 1);
  const fields = new Map(packet.result.map(row => [row.name, row])); need(fields.size === count + 1);
  const length = fields.get("length"), parent = packet.internalProperties[0];
  need(length?.value.type === "number" && length.value.value === count && length.writable && !length.enumerable && !length.configurable && parent.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" && parent.value.className === "Array" && parent.value.objectId !== undefined);
  const result: z.infer<typeof arrayRemote>[] = [];
  for (let i = 0; i < count; i += 1) { const row = fields.get(String(i)); need(row !== undefined && row.writable && row.enumerable && row.configurable && row.value.subtype !== "proxy"); result.push(row.value); }
  return Object.freeze(result);
}
const captureRemote = z.strictObject({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), description: z.string(), objectId: handle });
const capturePacket = z.strictObject({ result: captureRemote });
export function currentFootprintInversePublicServiceArrayHandle(input: unknown, count: 1 | 3 | 4 | 17 | "qualified"): string {
  const result = capturePacket.parse(capture(input)).result;
  need(count === "qualified" ? /^Array\((?:[1-9]|1\d|20)\)$/u.test(result.description) : result.description === `Array(${String(count)})`);
  return result.objectId;
}
export function currentFootprintInversePublicServiceObject(value: z.infer<typeof arrayRemote>): string {
  need((value.type === "object" || value.type === "function") && value.subtype !== "proxy" && value.objectId !== undefined && value.value === undefined); return value.objectId;
}
export function requireCurrentFootprintInversePublicServiceTrue(input: unknown): void {
  const packet = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }); packet.parse(capture(input));
}
