/** Exact original upload-finally caller, seven delivered source sites and
 * actual async return handle. No event alone issues a continuation. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES } from "./current-project-save-producer-source.ts";
import { CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLER as CALLER } from "./current-pcb-via-post-history-sync-source.ts";
import type { CurrentPcbViaPostHistorySyncRole } from "./current-pcb-via-post-history-sync-cursor.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, functionName: z.string(), location: point, functionLocation: point, returnValue: z.unknown().optional() });
const event = z.looseObject({ method: z.literal("Debugger.paused"), sessionId: handle, params: z.looseObject({ callFrames: z.array(frame).min(1).max(64) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_POST_SYNC_SOURCE_FRAME"); } }
export function currentPcbViaPostHistorySyncFrames(input: unknown, role: CurrentPcbViaPostHistorySyncRole, scriptId: string): Readonly<{ callFrameId: string; callerFrameId: string | null; returnPromiseId: string | null }> {
  const parsed = event.parse(captureCurrentPcbStringClockReply(input).value); const top = parsed.params.callFrames[0]; const site = SITES[role];
  need(top !== undefined && top.functionName === "syncCloud" && top.location.scriptId === scriptId && top.location.lineNumber === site.lineNumber && top.location.columnNumber === site.columnNumber && top.functionLocation.scriptId === scriptId && top.functionLocation.lineNumber === site.functionLineNumber && top.functionLocation.columnNumber === site.functionColumnNumber);
  let callerFrameId: string | null = null, returnPromiseId: string | null = null;
  if (role === "syncEntry") { const caller = parsed.params.callFrames[1]; need(caller !== undefined && caller.functionName === "uploadCloud" && caller.location.scriptId === scriptId && caller.location.lineNumber === CALLER.lineNumber && caller.location.columnNumber === CALLER.columnNumber && caller.functionLocation.scriptId === scriptId && caller.functionLocation.lineNumber === CALLER.functionLineNumber && caller.functionLocation.columnNumber === CALLER.functionColumnNumber); callerFrameId = caller.callFrameId; }
  if (role === "syncReturned") { const remote = z.strictObject({ type: z.literal("object"), subtype: z.literal("promise"), className: z.literal("Promise"), description: z.literal("Promise"), objectId: handle }).parse(top.returnValue); returnPromiseId = remote.objectId; }
  return Object.freeze({ callFrameId: top.callFrameId, callerFrameId, returnPromiseId });
}
