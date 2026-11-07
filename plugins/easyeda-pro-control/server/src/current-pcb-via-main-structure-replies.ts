/** Inert inspector metadata only. The actual cursor separately retains each
 * request/frame/object receipt; copies cannot acquire continuation authority. */
import { z } from "zod";
import { createHash } from "node:crypto";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_FINAL_FUNCTION as FINAL } from "./current-pcb-via-main-structure-source.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(), description: z.string().max(8192).optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string(), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string(), value: remote });
const arrayReply = z.strictObject({ result: z.array(property).length(5), internalProperties: z.array(internal).length(1) });
const metadataReply = z.strictObject({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) });
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_STRUCTURE_FINAL_METADATA"); } }
export function decodeCurrentPcbViaMainStructureFinalFunction(input: unknown): string {
  const reply = arrayReply.parse(captureCurrentPcbStringClockReply(input).value); const entries = new Map(reply.result.map(item => [item.name, item]));
  const size = entries.get("length"); const parent = reply.internalProperties[0];
  need(entries.size === 5 && size?.value.type === "number" && size.value.value === 4 && size.writable && !size.enumerable && !size.configurable && parent?.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" && parent.value.objectId !== undefined);
  for (let index = 0; index < 4; index += 1) { const field = entries.get(String(index)); need(field !== undefined && field.writable && field.enumerable && field.configurable); }
  const value = entries.get("3")?.value;
  need(value?.type === "function" && value.className === "Function" && value.objectId !== undefined && typeof value.description === "string" && Buffer.byteLength(value.description) === FINAL.bytes && createHash("sha256").update(value.description).digest("hex") === FINAL.sha256); return value.objectId;
}
export function decodeCurrentPcbViaMainStructureFinalMetadata(input: unknown, scriptId: string): void {
  const reply = metadataReply.parse(captureCurrentPcbStringClockReply(input).value); const entries = new Map(reply.result.map(item => [item.name, item])); const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
  const name = entries.get("name"); const length = entries.get("length"); const loc = internals.get("[[FunctionLocation]]"); const parent = internals.get("[[Prototype]]"); const scopes = internals.get("[[Scopes]]");
  const actual = location.parse(loc?.value);
  need(entries.size === 2 && internals.size === 3 && name?.value.type === "string" && name.value.value === FINAL.name && length?.value.type === "number" && length.value.value === FINAL.length &&
    !name.writable && !name.enumerable && name.configurable && !length.writable && !length.enumerable && length.configurable &&
    loc?.type === "object" && loc.subtype === "internal#location" && actual.scriptId === scriptId && actual.lineNumber === FINAL.functionLine && actual.columnNumber === FINAL.functionColumn &&
    parent?.type === "function" && parent.className === "Function" && parent.objectId !== undefined && scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? ""));
}
