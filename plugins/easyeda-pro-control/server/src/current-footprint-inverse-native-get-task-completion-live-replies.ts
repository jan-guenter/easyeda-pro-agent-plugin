/** Three exact original native GET prefix entries. Their actual host event,
 * source/owner and same accepted Job must be required before this data parser. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { currentFootprintInverseGetEntryFrames as original } from "./current-footprint-inverse-get-entry-replies.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const location = z.strictObject({ scriptId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.looseObject({ type: z.string() });
const scope = z.looseObject({ type: z.string(), object: remote });
const frame = z.strictObject({ callFrameId: handle, functionName: z.string().max(128), functionLocation: location, location, url: z.string().max(8192), scopeChain: z.array(scope).max(16), this: remote, canBeRestarted: z.boolean().optional() });
const packet = z.strictObject({ method: z.literal("Debugger.paused"), sessionId: handle, params: z.strictObject({ callFrames: z.array(frame).min(8).max(10), reason: z.enum(["other", "debugCommand"]), hitBreakpoints: z.tuple([handle]), asyncStackTrace: z.unknown().optional(), asyncStackTraceId: z.unknown().optional() }) });
/** These PCs are actual Node24 Inspector entries over unchanged pinned worker
 * method spans, including the suspended original get/getData caller PCs. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_COMPLETION_LIVE_STACKS = freezeDeep({
  data: [{ name: "getData", line: 109, fn: 34_359, pc: 34_363 }],
  row: [{ name: "get", line: 109, fn: 33_452, pc: 33_475 }, { name: "getData", line: 109, fn: 34_359, pc: 34_411 }],
  title: [{ name: "Ne", line: 108, fn: 143_596, pc: 143_600 }, { name: "get", line: 109, fn: 33_452, pc: 33_575 }, { name: "getData", line: 109, fn: 34_359, pc: 34_411 }],
} as const);
export type CurrentFootprintInverseNativeGetTaskCompletionLiveRole = keyof typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_COMPLETION_LIVE_STACKS;
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_TASK_COMPLETION_LIVE_STACK"); } }
/** Require the complete new prefix plus the unchanged exact seven original
 * accepted-GET callers. Unknown tails, names, points and caller PCs refuse. */
export function currentFootprintInverseNativeGetTaskCompletionLiveFrame(input: unknown, role: CurrentFootprintInverseNativeGetTaskCompletionLiveRole, sessionId: string, scriptId: string, point: string): Readonly<{ frame: string; caller: string | null }> {
  const raw = capture(input); const event = packet.parse(raw); const head = CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_COMPLETION_LIVE_STACKS[role]; need(event.sessionId === sessionId && event.params.hitBreakpoints[0] === point && event.params.callFrames.length === head.length + 7); const ids = new Set<string>();
  for (const [index, actual] of event.params.callFrames.entries()) { need(!ids.has(actual.callFrameId)); ids.add(actual.callFrameId); if (index < head.length) { const expected = head[index]; need(expected !== undefined && actual.functionName === expected.name && actual.functionLocation.scriptId === scriptId && actual.functionLocation.lineNumber === expected.line && actual.functionLocation.columnNumber === expected.fn && actual.location.scriptId === scriptId && actual.location.lineNumber === expected.line && actual.location.columnNumber === expected.pc); } }
  original({ ...event, params: { ...event.params, callFrames: event.params.callFrames.slice(head.length) } }, sessionId, scriptId, point); const top = event.params.callFrames[0]; need(top !== undefined); const caller = event.params.callFrames[1]; return Object.freeze({ frame: top.callFrameId, caller: role === "title" ? caller?.callFrameId ?? null : null });
}
