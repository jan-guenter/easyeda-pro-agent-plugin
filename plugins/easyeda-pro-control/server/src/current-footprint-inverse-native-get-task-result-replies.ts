/** Strict original UI stops for the internal backend return. No formatter,
 * public delete frame, inferred caller or copied event is admitted here. */
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { currentFootprintInverseNativeGetTaskForwardPause as incoming } from "./current-footprint-inverse-native-get-task-forward-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_POINTS as POINTS } from "./current-footprint-inverse-native-get-task-result-programs.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const remote = z.strictObject({ type: z.enum(["object", "function", "undefined", "number", "string", "boolean"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional(), unserializableValue: z.string().optional() });
const frame = z.strictObject({ callFrameId: handle, functionName: z.string(), functionLocation: location, location, url: z.string(), scopeChain: z.array(z.unknown()).max(16), this: remote, returnValue: remote.optional(), canBeRestarted: z.boolean().optional() });
const packet = z.strictObject({ method: z.literal("Debugger.paused"), sessionId: handle, params: z.strictObject({ callFrames: z.array(frame).min(1).max(64), reason: z.enum(["other", "debugCommand"]), hitBreakpoints: z.tuple([handle]), asyncStackTrace: z.unknown().optional(), asyncStackTraceId: z.unknown().optional() }) });
export interface CurrentFootprintInverseNativeGetTaskResultHeld { readonly role: keyof typeof POINTS | "onMessage"; readonly frame: string; readonly caller: string | null; readonly push: string | null; readonly kind: "native" | "local" | null }
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_TASK_RESULT_PAUSE"); } }
/** Require all original source PCs before a later live tuple can be read.
 * Callback normal return has its own point and own undefined returnValue. */
export function currentFootprintInverseNativeGetTaskResultPause(input: unknown, sessionId: string, scripts: Readonly<{ ui: string; manager: string }>, points: ReadonlyMap<string, keyof typeof POINTS>, onMessagePoint: string): Readonly<CurrentFootprintInverseNativeGetTaskResultHeld> {
  const raw = packet.parse(capture(input)); need(raw.sessionId === sessionId && new Set(raw.params.callFrames.map(row => row.callFrameId)).size === raw.params.callFrames.length); const id = raw.params.hitBreakpoints[0];
  if (id === onMessagePoint) { const held = incoming(input, sessionId, scripts, new Map([[id, "onMessage"]])); return Object.freeze({ role: "onMessage", frame: held.frame, caller: held.caller, push: null, kind: held.onMessageKind }); }
  const role = points.get(id); need(role !== undefined); const point = POINTS[role];
  const same = (index: number, name: string, fn: number, pc: number): void => { const row = raw.params.callFrames[index]; need(row !== undefined && row.functionName === name && row.functionLocation.scriptId === scripts.ui && row.functionLocation.lineNumber === 1033 && row.functionLocation.columnNumber === fn && row.location.scriptId === scripts.ui && row.location.lineNumber === 1033 && row.location.columnNumber === pc); };
  let name="";if(role==="reply"){name="rpcReply";}else if(role==="execute"){name="execute";}same(0,name,point.functionColumn,point.columnNumber);
  const top = raw.params.callFrames[0]; need(top !== undefined); if (role === "returned") { need(top.returnValue?.type === "undefined" && Reflect.ownKeys(top.returnValue).length === 1); } else { need(top.returnValue === undefined); }
  let push: string | null = null;
  if (role === "reply") { need(raw.params.callFrames.length === 2); same(1, "", 29_931, 29_940); }
  else { const shift = role === "execute" ? 0 : 1; need(raw.params.callFrames.length === 4 + shift); if (shift === 1) { same(1, "execute", 28_690, 28_722); } same(1 + shift, "push", 29_277, 29_371); same(2 + shift, "rpcReply", 30_350, 30_381); same(3 + shift, "", 29_931, 29_940); const caller = raw.params.callFrames[1 + shift]; need(caller !== undefined); push = caller.callFrameId; }
  return Object.freeze({ role, frame: top.callFrameId, caller: raw.params.callFrames[1]?.callFrameId ?? null, push, kind: null });
}
