/** Native metadata data validation only. The enclosing owner must supply its
 * exact correlated inspector reply and fixed source-derived profile. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

export interface CurrentNativeFunctionProfile { readonly name: string; readonly arity: number; readonly constructor: boolean; readonly staticMethods?: readonly string[]; readonly parentDescription?: string }
const text = z.string().max(8192), token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "number", "string"]), subtype: text.optional(), className: text.optional(), description: text.optional(), objectId: token.optional(), value: z.union([text, z.number()]).optional() });
const property = z.strictObject({ name: text, value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: text, value: remote });
function need(value: boolean): asserts value { if (!value) { throw new Error("CURRENT_NATIVE_FUNCTION_METADATA"); } }
export function decodeCurrentNativeFunctionMetadata(input: unknown, expected: CurrentNativeFunctionProfile): void {
  const staticMethods = expected.staticMethods ?? [];
  const reply = z.strictObject({ result: z.array(property).min(2).max(3 + staticMethods.length), internalProperties: z.array(internal).length(2) }).parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item])); need(fields.size === reply.result.length);
  const allowed = new Set(["name", "length", ...(expected.constructor ? ["prototype"] : []), ...staticMethods]);
  for (const name of fields.keys()) { need(allowed.has(name)); }
  for (const [name, value] of [["name", expected.name], ["length", expected.arity]] as const) {
    const item = fields.get(name); need(item !== undefined && !item.writable && !item.enumerable && item.configurable && item.value.value === value && item.value.objectId === undefined && item.value.subtype === undefined && item.value.type === (name === "name" ? "string" : "number"));
  }
  if (expected.constructor) { const item = fields.get("prototype"); need(item !== undefined && !item.writable && !item.enumerable && !item.configurable && item.value.type === "object" && item.value.className === expected.name && item.value.description === expected.name && item.value.objectId !== undefined && item.value.value === undefined && item.value.subtype === undefined); }
  else { need(fields.size === 2); }
  for (const name of staticMethods) { const item = fields.get(name); if (item !== undefined) { need(item.writable && item.enumerable && item.configurable && item.value.type === "function" && item.value.className === "Function" && item.value.description === `function ${name}() { [native code] }` && item.value.objectId !== undefined && item.value.value === undefined && item.value.subtype === undefined); } }
  const parts = new Map(reply.internalProperties.map(item => [item.name, item.value]));
  const parent = parts.get("[[Prototype]]"), scopes = parts.get("[[Scopes]]");
  need(parts.size === 2 && parent?.type === "function" && parent.className === "Function" && parent.description === (expected.parentDescription ?? "function () { [native code] }") && parent.objectId !== undefined && scopes?.type === "object" && scopes.className === "Array" && scopes.subtype === "internal#scopeList" && scopes.description === "Scopes[0]" && scopes.objectId !== undefined);
}
