/** Source-specific native metadata only. Original request/context custody and
 * permission to call/resume remain separate private owner obligations. */
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIALIZED_GET_SOURCE as SOURCE } from "./current-footprint-inverse-initialized-get-source.ts";
import type { CurrentFootprintInverseInitializedGetRole } from "./current-footprint-inverse-initialized-get-source.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string(), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string(), value: remote });
const fieldsSchema = z.strictObject({ result: z.array(property).min(2).max(5), internalProperties: z.array(internal).length(3) });
const pointSchema = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_INITIALIZED_GET_METADATA"); } }
export function decodeCurrentFootprintInverseInitializedGetFunction(input: unknown, role: CurrentFootprintInverseInitializedGetRole, expectedScriptId?: string): Readonly<{ scriptId: string; scopes: string }> {
  const expected = SOURCE[role], packet = fieldsSchema.parse(capture(input));
  const fields = new Map(packet.result.map(row => [row.name, row])); const regular = (expected.kind === "regular" || expected.kind === "class") && !expected.async;
  const names = ["name", "length", ...(regular ? ["prototype"] : []), ...(!expected.strict && regular ? ["arguments", "caller"] : [])];
  need(fields.size === packet.result.length && fields.size === names.length && packet.result.every((row, index) => row.name === expected.ownNames[index]) && names.every(name => fields.has(name)));
  for (const [name, value] of [["name", expected.name], ["length", expected.arity]] as const) {
    const field = fields.get(name); need(field !== undefined && !field.writable && !field.enumerable && field.configurable && field.value.type === (name === "name" ? "string" : "number") && field.value.value === value && field.value.objectId === undefined && field.value.subtype === undefined);
  }
  if (regular) { const field = fields.get("prototype"); need(field !== undefined && field.writable === (expected.kind !== "class") && !field.enumerable && !field.configurable && field.value.type === "object" && field.value.objectId !== undefined && field.value.subtype !== "proxy"); }
  for (const name of ["arguments", "caller"]) { const field = fields.get(name); if (field !== undefined) { need(!field.writable && !field.enumerable && !field.configurable && field.value.type === "object" && field.value.subtype === "null" && field.value.value === null && field.value.objectId === undefined); } }
  const internals = new Map(packet.internalProperties.map(row => [row.name, row.value])); need(internals.size === 3);
  const location = internals.get("[[FunctionLocation]]"), parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]"); const point = pointSchema.parse(location?.value);
  need(location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined && (expectedScriptId === undefined || point.scriptId === expectedScriptId) && point.lineNumber === expected.lineNumber && point.columnNumber === expected.columnNumber);
  need(parent?.type === (expected.async ? "object" : "function") && parent.className === (expected.async ? "AsyncFunction" : "Function") && parent.objectId !== undefined && (expected.kind === "class" || parent.description === (expected.async ? "AsyncFunction" : "function () { [native code] }")));
  need(scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? ""));
  return Object.freeze({ scriptId: point.scriptId, scopes: scopes.objectId });
}
