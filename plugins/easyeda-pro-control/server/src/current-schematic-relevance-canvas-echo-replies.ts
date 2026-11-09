/** Descriptive receiver metadata only. Neither a source match nor these
 * handles proves the same original page publisher, CM or delivered event. */
import { createHash } from "node:crypto";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_SOURCE as SOURCE } from "./current-schematic-relevance-canvas-echo-source.ts";
import type { CurrentSchematicRelevanceCanvasEchoRole as Role } from "./current-schematic-relevance-canvas-echo-source.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "number", "string"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().max(4096).optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string().max(128), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string().max(128), value: remote });
const packet = z.strictObject({ result: z.array(property).length(2), internalProperties: z.array(internal).length(3) });
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });

/** Refuse unknown metadata before returning any descriptive handles. */
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_CANVAS_ECHO_CALLEE"); } }

/** Match the exact original method/arrow body independently of its actual
 * script/location and independently of the original page receiver binding. */
export function requireCurrentSchematicRelevanceCanvasEchoDescription(value: string, variant: 0 | 1, role: Role): void {
  const row = SOURCE[variant].roles[role];
  need(value.isWellFormed() && Buffer.byteLength(value) === row.bytes && createHash("sha256").update(value).digest("hex") === row.sha256);
}

/** Qualify the two-own-field method/arrow shape, including the async parent
 * of task.execute/initProject. No method, callback or getter is invoked. */
export function decodeCurrentSchematicRelevanceCanvasEchoFunction(input: unknown, variant: 0 | 1, role: Role, scriptId: string): Readonly<{ scopes: string; functionPrototype: string; originalPublisherVerified: false; originalConsistencyVerified: false; callbackReceiverVerified: false; echoSuppressionVerified: false; continuationAuthorized: false }> {
  handle.parse(scriptId);
  const profile = SOURCE[variant].roles[role], reply = packet.parse(captureCurrentPcbStringClockReply(input).value);
  const fields = new Map(reply.result.map(item => [item.name, item]));
  need(fields.size === 2 && fields.has("name") && fields.has("length"));
  for (const [name, value] of [["name", profile.name], ["length", profile.arity]] as const) {
    const field = fields.get(name);
    need(field !== undefined && field.value.type === (name === "name" ? "string" : "number") && field.value.value === value && field.value.subtype === undefined && field.value.objectId === undefined && !field.writable && !field.enumerable && field.configurable);
  }
  const internals = new Map(reply.internalProperties.map(item => [item.name, item.value])); need(internals.size === 3);
  const location = internals.get("[[FunctionLocation]]"), parent = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
  const actual = point.parse(location?.value);
  need(location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined && actual.scriptId === scriptId && actual.lineNumber === profile.lineNumber && actual.columnNumber === profile.columnNumber);
  need(parent?.objectId !== undefined && parent.subtype === undefined && parent.value === undefined);
  if (profile.async) { need(parent.type === "object" && parent.className === "AsyncFunction" && parent.description === "AsyncFunction"); }
  else { need(parent.type === "function" && parent.className === "Function" && parent.description === "function () { [native code] }"); }
  need(scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[(?:[1-9]|1[0-6])\]$/u.test(scopes.description ?? ""));
  return Object.freeze({ scopes: scopes.objectId, functionPrototype: parent.objectId, originalPublisherVerified: false, originalConsistencyVerified: false, callbackReceiverVerified: false, echoSuppressionVerified: false, continuationAuthorized: false });
}
