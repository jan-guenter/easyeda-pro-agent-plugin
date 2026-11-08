/** Uninvoked local MessageBus metadata. Receiver, original UI context and continuation
 * must still be established by the original operation's private controller. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_SOURCE as SOURCE } from "./current-schematic-relevance-status-bus-source.ts";
import type { CurrentSchematicRelevanceStatusBusVariant } from "./current-schematic-relevance-status-bus-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["function", "object", "number", "string"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().max(8192).optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string().max(128), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string().max(128), value: remote });
const properties = z.strictObject({ result: z.array(property).min(2).max(3), internalProperties: z.array(internal).length(3) });
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_STATUS_BUS_FUNCTION"); } }
export function requireCurrentSchematicRelevanceStatusBusDescription(value: string, variant: CurrentSchematicRelevanceStatusBusVariant,role:"publish"|"taskRunning"|"taskExecute"|"clone"="publish"): void {
  const profile = SOURCE[variant][role];
  need(value.isWellFormed() && Buffer.byteLength(value) === profile.bytes && createHash("sha256").update(value).digest("hex") === profile.sha256);
}
export function decodeCurrentSchematicRelevanceStatusBusFunction(input: unknown, variant: CurrentSchematicRelevanceStatusBusVariant,
  scriptId: string,role:"publish"|"taskRunning"|"taskExecute"|"clone"="publish"): Readonly<{ scopes: string; functionPrototype: string; originalBusVerified: false; callbackReceiverVerified: false; continuationAuthorized: false }> {
  handle.parse(scriptId); const profile = SOURCE[variant][role]; const reply = properties.parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item]));
  need(fields.size===reply.result.length&&fields.size === (role==="clone"?3:2) && fields.has("name") && fields.has("length"));const ownPrototype=fields.get("prototype");if(role==="clone"){need(ownPrototype!==undefined&&ownPrototype.value.type==="object"&&ownPrototype.value.objectId!==undefined&&ownPrototype.value.subtype!=="proxy"&&ownPrototype.writable&&!ownPrototype.enumerable&&!ownPrototype.configurable);}else{need(ownPrototype===undefined);}
  for (const [name, value] of [["name", profile.name], ["length", profile.arity]] as const) {
    const field = fields.get(name);
    need(field !== undefined && field.value.type === (name === "name" ? "string" : "number") && field.value.value === value && field.value.objectId === undefined && field.value.subtype === undefined && !field.writable && !field.enumerable && field.configurable);
  }
  const internals = new Map(reply.internalProperties.map(item => [item.name, item.value])); need(internals.size === 3);
  const location = internals.get("[[FunctionLocation]]"), parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
  const actual = point.parse(location?.value);
  need(location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined && actual.scriptId === scriptId && actual.lineNumber === profile.lineNumber && actual.columnNumber === profile.columnNumber);
  need(parent?.type === "function" && parent.subtype === undefined && parent.objectId !== undefined);
  need(scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[(?:[1-9]|1[0-6])\]$/u.test(scopes.description ?? ""));
  return Object.freeze({ scopes: scopes.objectId, functionPrototype: parent.objectId, originalBusVerified: false, callbackReceiverVerified: false, continuationAuthorized: false });
}

/** Extract only the script selector from already correlated strict method metadata; its context and full bytes still require qualification. */
export function currentSchematicRelevanceStatusBusScript(input:unknown):string{const reply=properties.parse(captureCurrentPcbStringClockReply(input).value);const location=reply.internalProperties.find(row=>row.name==="[[FunctionLocation]]");need(location?.value.type==="object"&&location.value.subtype==="internal#location");return point.parse(location.value.value).scriptId;}
