/** Handler metadata is descriptive. The actual event entry must separately
 * prove its lexical receiver, trusted native event and original delivery. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_SOURCE as SOURCE } from "./current-schematic-relevance-modify-echo-source.ts";

export { qualifyCurrentSchematicRelevanceModifyEchoSource } from "./current-schematic-relevance-modify-echo-source.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().max(8192).optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string().max(128), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string().max(128), value: remote });
const packet = z.strictObject({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) });
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_ECHO_HANDLER_METADATA"); } }

export function requireCurrentSchematicRelevanceModifyEchoDescription(value: string, variant: 0 | 1): void {
  const row = SOURCE[variant]; need(value.isWellFormed() && Buffer.byteLength(value) === row.bytes && createHash("sha256").update(value).digest("hex") === row.sha256);
}

/** Constructor assignment does not infer a semantic Function.name. Keep the
 * real empty name and the source-preserving V8 location, including script. */
export function decodeCurrentSchematicRelevanceModifyEchoFunction(input: unknown, variant: 0 | 1, scriptId: string): Readonly<{ scopes: string; functionPrototype: string; callbackReceiverVerified: false; trustedEventQualified: false; deliveryVerified: false; continuationAuthorized: false }> {
  handle.parse(scriptId); const reply = packet.parse(captureCurrentPcbStringClockReply(input).value), row = SOURCE[variant];
  const fields = new Map(reply.result.map(value => [value.name, value])); need(fields.size === 2 && fields.has("name") && fields.has("length"));
  for (const [name, expected] of [["name", row.name], ["length", row.arity]] as const) {
    const value = fields.get(name); need(value !== undefined && !value.writable && !value.enumerable && value.configurable && value.value.type === (name === "name" ? "string" : "number") && value.value.value === expected && value.value.objectId === undefined && value.value.subtype === undefined && value.value.className === undefined);
  }
  const parts = new Map(reply.internalProperties.map(value => [value.name, value.value])); need(parts.size === 3);
  const at = parts.get("[[FunctionLocation]]"), parent = parts.get("[[Prototype]]"), scopes = parts.get("[[Scopes]]"); const actual = point.parse(at?.value);
  need(at?.type === "object" && at.subtype === "internal#location" && at.objectId === undefined && actual.scriptId === scriptId && actual.lineNumber === row.lineNumber && actual.columnNumber === row.columnNumber);
  need(parent?.type === "function" && parent.className === "Function" && parent.description === "function () { [native code] }" && parent.subtype === undefined && parent.objectId !== undefined && parent.value === undefined);
  need(scopes?.type === "object" && scopes.className === "Array" && scopes.subtype === "internal#scopeList" && scopes.objectId !== undefined && scopes.value === undefined && /^Scopes\[(?:[1-9]|1[0-6])\]$/u.test(scopes.description ?? ""));
  return Object.freeze({ scopes: scopes.objectId, functionPrototype: parent.objectId, callbackReceiverVerified: false, trustedEventQualified: false, deliveryVerified: false, continuationAuthorized: false });
}
