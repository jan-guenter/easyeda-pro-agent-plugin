/** Actual original UI callback frame and descriptor packets. No object-id
 * equality is used to substitute for the fixed program's JS identity joins. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_CALL_SITES as S } from "./current-footprint-inverse-public-call-programs.ts";

const h = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: h.optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string(), value: remote, writable: z.boolean(), enumerable: z.boolean(), configurable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string(), value: remote });
const point = z.strictObject({ scriptId: h, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const scopeRemote = z.looseObject({ type: z.string() });
const scope = z.looseObject({ type: z.string(), object: scopeRemote });
const frame = z.strictObject({ callFrameId: h, functionName: z.string().max(128), functionLocation: point, location: point, url: z.string().max(8192), scopeChain: z.array(scope).max(16), this: z.looseObject({ type: z.string() }), returnValue: z.looseObject({ type: z.string() }).optional(), canBeRestarted: z.boolean().optional() });
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_PUBLIC_CALL_REPLY"); } }
export function currentFootprintInversePublicCallPoint(input: unknown, scriptId: string, role: "entry" | "returned"): string {
  const raw = z.strictObject({ breakpointId: h, actualLocation: point }).parse(capture(input)); need(raw.actualLocation.scriptId === scriptId && raw.actualLocation.lineNumber === S[role].lineNumber && raw.actualLocation.columnNumber === S[role].columnNumber); return raw.breakpointId;
}
export function currentFootprintInversePublicCallPause(input: unknown, sessionId: string, apiScript: string, helperScript: string, breakpointId: string): Readonly<{ entryFrame: string; dispatchFrame: string }> {
  const raw = z.strictObject({ method: z.literal("Debugger.paused"), sessionId: h, params: z.strictObject({ callFrames: z.array(frame).min(7).max(64), reason: z.enum(["other", "debugCommand"]), hitBreakpoints: z.tuple([h]), asyncStackTrace: z.unknown().optional(), asyncStackTraceId: z.unknown().optional() }) }).parse(capture(input));
  need(raw.sessionId === sessionId && raw.params.hitBreakpoints[0] === breakpointId); const top = raw.params.callFrames[0];
  need(top !== undefined && top.functionName === "i" && top.location.scriptId === apiScript && top.location.lineNumber === S.entry.lineNumber && top.location.columnNumber === S.entry.columnNumber && top.functionLocation.scriptId === apiScript && top.functionLocation.lineNumber === S.function.lineNumber && top.functionLocation.columnNumber === S.function.columnNumber);
  for (const [index, expected] of S.callers.entries()) { const actual = raw.params.callFrames[index + 1]; need(actual !== undefined && actual.functionName === expected.name && actual.location.scriptId === apiScript && actual.functionLocation.scriptId === apiScript && actual.location.lineNumber === expected.lineNumber && actual.location.columnNumber === expected.columnNumber && actual.functionLocation.lineNumber === expected.lineNumber && actual.functionLocation.columnNumber === expected.functionColumn); }
  const dispatch = raw.params.callFrames[6]; need(dispatch !== undefined && dispatch.functionName === "" && dispatch.location.scriptId === helperScript && dispatch.functionLocation.scriptId === helperScript && dispatch.functionLocation.lineNumber === S.dispatch.functionLine && dispatch.functionLocation.columnNumber === S.dispatch.functionColumn && dispatch.location.lineNumber === S.dispatch.lineNumber && dispatch.location.columnNumber === S.dispatch.columnNumber);
  return Object.freeze({ entryFrame: top.callFrameId, dispatchFrame: dispatch.callFrameId });
}
const arrayRemote = z.strictObject({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), description: z.string(), objectId: h });
const arrayHandle = z.strictObject({ result: arrayRemote });
export function currentFootprintInversePublicCallArray(input: unknown, count: 2 | 4 | 5): string {
  const raw = arrayHandle.parse(capture(input)); need(raw.result.description === `Array(${String(count)})`); return raw.result.objectId;
}
export function decodeCurrentFootprintInversePublicCallArray(input: unknown, count: 2 | 4 | 5): readonly z.infer<typeof remote>[] {
  const raw = z.strictObject({ result: z.array(property).max(6), internalProperties: z.tuple([internal]) }).parse(capture(input)); const fields = new Map(raw.result.map(row => [row.name, row])); need(fields.size === count + 1 && raw.result.length === count + 1);
  const length = fields.get("length"), parent = raw.internalProperties[0]; need(length?.value.type === "number" && length.value.value === count && length.writable && !length.enumerable && !length.configurable && parent.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.subtype === "array" && parent.value.className === "Array" && parent.value.objectId !== undefined);
  return Object.freeze(Array.from({ length: count }, (_, index) => { const row = fields.get(String(index)); need(row !== undefined && row.writable && row.enumerable && row.configurable && row.value.subtype !== "proxy"); return row.value; }));
}
export function currentFootprintInversePublicCallObject(value: z.infer<typeof remote>): string { need((value.type === "object" || value.type === "function") && value.subtype !== "proxy" && value.objectId !== undefined && value.value === undefined); return value.objectId; }
/** A newly returned packet is never reflected on by a helper before this
 * original properties response proves data-only ordinary Object metadata. */
export function currentFootprintInversePublicCallData(input: unknown, role: "packet" | "message", footprintUuid: string): Readonly<{ message?: string; replyTopic?: string }> {
  const raw = z.strictObject({ result: z.tuple([property, property]), internalProperties: z.tuple([internal]) }).parse(capture(input)); const fields = new Map(raw.result.map(row => [row.name, row])); need(fields.size === 2 && raw.result.every(row => row.writable && row.enumerable && row.configurable));
  const parent = raw.internalProperties[0]; need(parent.name === "[[Prototype]]" && parent.value.type === "object" && parent.value.className === "Object" && parent.value.description === "Object" && parent.value.subtype === undefined && parent.value.objectId !== undefined);
  if (role === "packet") { const message = fields.get("message"), reply = fields.get("replyTopic"); need(message !== undefined && message.value.type === "object" && message.value.className === "Object" && message.value.subtype === undefined && reply?.value.type === "string" && typeof reply.value.value === "string" && reply.value.value.length <= 512 && reply.value.objectId === undefined); return Object.freeze({ message: currentFootprintInversePublicCallObject(message.value), replyTopic: reply.value.value }); }
  for (const [name, value] of [["footprintUuid", footprintUuid], ["libraryUuid", "Project"]] as const) { const actual = fields.get(name); need(actual?.value.type === "string" && actual.value.value === value && actual.value.objectId === undefined); }
  return Object.freeze({});
}
