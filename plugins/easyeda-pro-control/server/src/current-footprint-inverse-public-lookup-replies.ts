/** Function metadata only. No supplied packet can recreate original lookup,
 * registry, row, request, clock or native deletion custody. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_LOOKUP_SOURCE as SOURCE } from "./current-footprint-inverse-public-lookup-source.ts";
import type { CurrentFootprintInversePublicLookupRole } from "./current-footprint-inverse-public-lookup-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().max(8192).optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string().max(128), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string().max(128), value: remote });
const properties = z.strictObject({ result: z.array(property).min(2).max(5), internalProperties: z.array(internal).length(3) });
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_PUBLIC_LOOKUP_FUNCTION"); } }
export function requireCurrentFootprintInversePublicLookupDescription(text: string, role: CurrentFootprintInversePublicLookupRole): void {
  const row = SOURCE[role]; need(text.isWellFormed() && Buffer.byteLength(text) === row.bytes && createHash("sha256").update(text).digest("hex") === row.sha256);
}
export function decodeCurrentFootprintInversePublicLookupFunction(input: unknown, role: CurrentFootprintInversePublicLookupRole, uiScriptId: string): Readonly<{ scopes: string; scriptId: string }> {
  handle.parse(uiScriptId); const row = SOURCE[role]; const packet = properties.parse(captureCurrentPcbStringClockReply(input).value);
  const regular = row.kind === "regular" && !row.async, sloppy = regular && !row.strict;
  const names = ["name", "length", ...(regular ? ["prototype"] : []), ...(sloppy ? ["arguments", "caller"] : [])];
  const fields = new Map(packet.result.map(value => [value.name, value])); need(fields.size === packet.result.length && fields.size === names.length && names.every(name => fields.has(name)));
  for (const [name, expected] of [["name", row.name], ["length", row.arity]] as const) {
    const field = fields.get(name); need(field !== undefined && !field.writable && field.configurable && !field.enumerable && field.value.type === (name === "name" ? "string" : "number") && field.value.value === expected && field.value.objectId === undefined && field.value.subtype === undefined);
  }
  const prototype = fields.get("prototype"); if (regular) { need(prototype !== undefined && prototype.writable && !prototype.enumerable && !prototype.configurable && prototype.value.type === "object" && prototype.value.subtype === undefined && prototype.value.objectId !== undefined && prototype.value.value === undefined); }
  for (const name of ["arguments", "caller"]) { const field = fields.get(name); if (field !== undefined) { need(!field.writable && !field.enumerable && !field.configurable && field.value.type === "object" && field.value.subtype === "null" && field.value.value === null && field.value.objectId === undefined); } }
  const parts = new Map(packet.internalProperties.map(value => [value.name, value.value])); need(parts.size === 3);
  const at = parts.get("[[FunctionLocation]]"), parent = parts.get("[[Prototype]]"), scopes = parts.get("[[Scopes]]"); const point = location.parse(at?.value);
  need(at?.type === "object" && at.subtype === "internal#location" && at.objectId === undefined && point.scriptId === uiScriptId && point.lineNumber === row.lineNumber && point.columnNumber === row.columnNumber);
  need(parent?.type === (row.async ? "object" : "function") && parent.className === (row.async ? "AsyncFunction" : "Function") && parent.objectId !== undefined && parent.subtype === undefined && parent.description === (row.async ? "AsyncFunction" : "function () { [native code] }"));
  need(scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[(?:[1-9]|1[0-6])\]$/u.test(scopes.description ?? ""));
  return Object.freeze({ scopes: scopes.objectId, scriptId: point.scriptId });
}
