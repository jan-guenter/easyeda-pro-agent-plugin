/** Exact original tw entry and its one fixed generated caller. Matching data
 * supplies no original event provenance or body/worker execution authority. */
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_LOOKUP_PROGRAMS as P } from "./current-footprint-inverse-native-get-lookup-programs.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const remote = z.strictObject({ type: z.enum(["object", "function", "undefined", "string", "number", "boolean"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional(), unserializableValue: z.string().optional() });
const frame = z.strictObject({ callFrameId: handle, functionName: z.string(), functionLocation: location, location, url: z.string(), scopeChain: z.array(z.unknown()).max(16), this: remote, returnValue: remote.optional(), canBeRestarted: z.boolean().optional() });
const packet = z.strictObject({ method: z.literal("Debugger.paused"), sessionId: handle, params: z.strictObject({ callFrames: z.tuple([frame, frame]), reason: z.enum(["other", "debugCommand"]), hitBreakpoints: z.tuple([handle]), asyncStackTrace: z.unknown().optional(), asyncStackTraceId: z.unknown().optional() }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_LOOKUP_PAUSE"); } }
/** Derive generated coordinates from the same complete correlated program. */
function point(needle: string, offset: number): Readonly<{ lineNumber: number; columnNumber: number }> { const source = `(${P.invokeOnce})`; need(source.split(needle).length === 2); const at = source.indexOf(needle) + offset, before = source.slice(0, at); return Object.freeze({ lineNumber: before.split("\n").length - 1, columnNumber: at - before.lastIndexOf("\n") - 1 }); }
const caller = Object.freeze({ fn: point("function(prepared)", "function".length), pc: point('return fn("footprint",', "return ".length) });
/** Require the original pinned first statement and exact original generated
 * caller. Copied packets still need their owner's separate actual-event join. */
export function currentFootprintInverseNativeGetLookupPause(input: unknown, sessionId: string, uiScriptId: string, invokeScriptId: string, breakpointId: string): string {
  const raw = packet.parse(capture(input)); need(raw.sessionId === sessionId && uiScriptId !== invokeScriptId && raw.params.hitBreakpoints[0] === breakpointId);
  const rows = [{ name: "tw", script: uiScriptId, fn: { lineNumber: 1326, columnNumber: 1619 }, pc: { lineNumber: 1326, columnNumber: 1627 } }, { name: "", script: invokeScriptId, ...caller }];
  const ids = new Set<string>(); for (const [index, expected] of rows.entries()) { const actual = raw.params.callFrames[index]; need(actual !== undefined && !ids.has(actual.callFrameId) && actual.returnValue === undefined && actual.functionName === expected.name && actual.functionLocation.scriptId === expected.script && actual.location.scriptId === expected.script && actual.functionLocation.lineNumber === expected.fn.lineNumber && actual.functionLocation.columnNumber === expected.fn.columnNumber && actual.location.lineNumber === expected.pc.lineNumber && actual.location.columnNumber === expected.pc.columnNumber); ids.add(actual.callFrameId); }
  return raw.params.callFrames[0].callFrameId;
}
