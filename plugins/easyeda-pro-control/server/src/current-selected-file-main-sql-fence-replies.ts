/** Actual V8 metadata for the native constructors/proxy classifier captured at
 * the fixed after-import pause. Descriptive replies issue no native lease. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const remote = z.object({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(),
  description: z.string().max(8192).optional(), value: z.unknown().optional() }).strict();
const property = z.object({ name: z.string(), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: z.string(), value: remote }).strict();
function need(value: boolean): asserts value { if (!value) { throw new Error("SELECTED_FILE_MAIN_SQL_FENCE_NATIVE_METADATA"); } }
export function decodeCurrentSelectedFileMainSqlFenceNativeArray(input: unknown): readonly string[] {
  const reply = z.object({ result: z.array(property).length(4), internalProperties: z.array(internal).length(1) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])), length = fields.get("length");
  need(fields.size === 4 && length?.value.type === "number" && length.value.value === 3 && length.value.objectId === undefined && length.writable && !length.enumerable && !length.configurable);
  const parent = reply.internalProperties[0]; need(parent?.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" && parent.value.className === "Array" && parent.value.objectId !== undefined);
  return Object.freeze(["Database", "Statement", ""].map((name, index) => {
    const field = fields.get(String(index)); need(field !== undefined && field.writable && field.enumerable && field.configurable && field.value.type === "function" &&
      field.value.className === "Function" && field.value.subtype === undefined && field.value.objectId !== undefined && field.value.value === undefined &&
      field.value.description === `function ${name}() { [native code] }`); return field.value.objectId;
  }));
}
export function decodeCurrentSelectedFileMainSqlFenceNative(input: unknown, role: "Database" | "Statement" | "proxy"): void {
  const count = role === "proxy" ? 2 : 3;
  const name = role === "proxy" ? "" : role;
  const reply = z.object({ result: z.array(property).length(count), internalProperties: z.array(internal).length(2) }).strict().parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === count);
  for (const key of ["name", "length"] as const) {
    const field = fields.get(key); need(field !== undefined && !field.writable && !field.enumerable && field.configurable &&
      field.value.type === (key === "name" ? "string" : "number") && field.value.value === (key === "name" ? name : 0) && field.value.objectId === undefined && !Object.is(field.value.value, -0));
  }
  if (role !== "proxy") {
    const prototype = fields.get("prototype"); need(prototype !== undefined && !prototype.enumerable && !prototype.configurable && prototype.value.type === "object" &&
      prototype.value.subtype === undefined && prototype.value.objectId !== undefined && prototype.value.value === undefined);
  }
  const entries = new Map(reply.internalProperties.map(item => [item.name, item.value])), parent = entries.get("[[Prototype]]"), scopes = entries.get("[[Scopes]]");
  need(entries.size === 2 && parent?.type === "function" && parent.className === "Function" && parent.objectId !== undefined && parent.value === undefined &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.description === "Scopes[0]" && scopes.objectId !== undefined && scopes.value === undefined);
}
