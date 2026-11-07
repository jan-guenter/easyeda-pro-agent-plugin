import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
function need(value: boolean): asserts value { if (!value) { throw new Error("PERIODIC_SYNC_ORIGINAL_FRAME"); } }
/** Source-only frame projection. Ownership and the exact delivered event are
 * supplied separately by the original worker/controller registry. */
export function currentGeneratedPeriodicSyncFrames(input: unknown, role: string, scriptId: string): Readonly<{ callFrameId: string; callerFrameId: string | null; returnPromiseId: string | null }> {
  const frame = z.looseObject({ callFrameId: handle, functionName: z.string(), location, functionLocation: location, returnValue: z.unknown().optional() });
  const parsed = z.looseObject({ method: z.literal("Debugger.paused"), sessionId: handle, params: z.looseObject({ callFrames: z.array(frame).min(1).max(64) }) }).parse(captureCurrentPcbStringClockReply(input).value);
  const top = parsed.params.callFrames[0]; need(top !== undefined && top.functionName === "syncCloud" && top.location.scriptId === scriptId && top.functionLocation.scriptId === scriptId && top.functionLocation.lineNumber === 110 && top.functionLocation.columnNumber === 17_658);
  let callerFrameId: string | null = null, returnPromiseId: string | null = null;
  if (role === "syncEntry") {
    const caller = parsed.params.callFrames[1]; need(caller !== undefined && caller.functionName === "" && caller.location.scriptId === scriptId && caller.location.lineNumber === 110 && caller.location.columnNumber === 112_915 && caller.functionLocation.scriptId === scriptId && caller.functionLocation.lineNumber === 110 && caller.functionLocation.columnNumber === 112_879); callerFrameId = caller.callFrameId;
  }
  if (role === "syncReturned") {
    const value = z.strictObject({ type: z.literal("object"), subtype: z.literal("promise"), className: z.literal("Promise"), description: z.literal("Promise"), objectId: handle }).parse(top.returnValue); returnPromiseId = value.objectId;
  }
  return Object.freeze({ callFrameId: top.callFrameId, callerFrameId, returnPromiseId });
}
