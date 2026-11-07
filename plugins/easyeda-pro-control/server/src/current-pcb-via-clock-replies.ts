/** Inspector data decoders only. Source positions do not issue clock custody. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_CLOCK_UI_CALLER as CALLER, CURRENT_PCB_VIA_CLOCK_SITES as SITES } from "./current-pcb-via-clock-protocol.ts";
import type { CurrentPcbViaClockSite } from "./current-pcb-via-clock-protocol.ts";
import { CURRENT_PCB_VIA_SAVE_SOURCE as SAVE } from "./current-pcb-via-save-source.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, functionName: z.string().max(256), location: point, functionLocation: point });
const paused = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(frame).min(1).max(32),
  asyncStackTrace: z.unknown().optional() });
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_CLOCK_REPLY"); } }
export function decodeCurrentPcbViaClockBreakpoint(input: unknown, role: CurrentPcbViaClockSite, scriptId: string): string {
  const reply = z.strictObject({ breakpointId: handle, actualLocation: point }).parse(captureCurrentPcbStringClockReply(input).value), site = SITES[role];
  need(reply.actualLocation.scriptId === scriptId && reply.actualLocation.lineNumber === site.lineNumber && reply.actualLocation.columnNumber === site.columnNumber);
  return reply.breakpointId;
}
export function decodeCurrentPcbViaClockPause(input: unknown, role: CurrentPcbViaClockSite, scriptId: string, breakpointId: string): Readonly<{ frameId: string; callerId: string | null }> {
  const reply = paused.parse(captureCurrentPcbStringClockReply(input).value); const top = reply.callFrames[0]; const site = SITES[role];
  need(reply.hitBreakpoints[0] === breakpointId && top !== undefined && top.functionName === site.functionName && top.location.scriptId === scriptId &&
    top.location.lineNumber === site.lineNumber && top.location.columnNumber === site.columnNumber && top.functionLocation.scriptId === scriptId &&
    top.functionLocation.lineNumber === site.functionLine && top.functionLocation.columnNumber === site.functionColumn);
  if (role === "push") {
    // RpcCall -> push is synchronous before its first await. No async stack or
    // Copied source description can replace this original saveCanvas caller.
    need(reply.callFrames.some(item => item.functionName === "saveCanvas" && item.functionLocation.scriptId === scriptId &&
      item.functionLocation.lineNumber === SAVE.saveCanvas.functionLine && item.functionLocation.columnNumber === SAVE.saveCanvas.functionColumn));
  }
  if (role !== "result") { return Object.freeze({ frameId: top.callFrameId, callerId: null }); }
  const caller = reply.callFrames.find(item => item.functionName === CALLER.functionName && item.functionLocation.scriptId === scriptId &&
    item.functionLocation.lineNumber === CALLER.functionLine && item.functionLocation.columnNumber === CALLER.functionColumn);
  need(caller !== undefined && caller.location.scriptId === scriptId && caller.location.lineNumber === CALLER.lineNumber && caller.location.columnNumber === CALLER.columnNumber);
  return Object.freeze({ frameId: top.callFrameId, callerId: caller.callFrameId });
}
export function currentPcbViaClockPauseId(input: unknown): string {
  return paused.parse(captureCurrentPcbStringClockReply(input).value).hitBreakpoints[0];
}
export function decodeCurrentPcbViaClockOffset(input: unknown): number {
  const result = z.strictObject({ result: z.strictObject({ type: z.literal("number"), value: z.number().int().refine(value => !Object.is(value, -0)) }) });
  return result.parse(captureCurrentPcbStringClockReply(input).value).result.value;
}
