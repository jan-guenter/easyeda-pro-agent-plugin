/** Only the exact originally issued PCB navigation function may consume this
 * parent instrumentation pause. This qualifies no arbitrary UI program. */
import { z } from "zod";
import { CURRENT_PCB_209_RATLINE_OPENING_FUNCTION } from "./current-pcb-209-ratline-opening-program.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

export type CurrentPcb209RatlineNavigationCommand =
  Readonly<{ method: "Debugger.getScriptSource"; sessionId: string; navigationPhase: "source"; params: Readonly<{ scriptId: string }> }> |
  Readonly<{ method: "Debugger.resume"; sessionId: string; navigationPhase: "resume"; params: Readonly<Record<string, never>> }>;
export const CURRENT_PCB_209_RATLINE_NAVIGATION_SOURCE = `(${CURRENT_PCB_209_RATLINE_OPENING_FUNCTION})`;
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.object({ scriptId: token, lineNumber: z.literal(0), columnNumber: z.literal(0) }).strict();
const navigationFrame = z.looseObject({ functionName: z.literal(""), url: z.literal(""), location, functionLocation: location });
const pause = z.looseObject({ reason: z.literal("instrumentation"), data: z.object({ scriptId: token, url: z.literal("") }).strict(),
  hitBreakpoints: z.tuple([]), callFrames: z.tuple([navigationFrame]) });
const parsed = z.looseObject({ scriptId: token, executionContextId: z.number().int().positive(), url: z.literal(""),
  hasSourceURL: z.literal(false), isLiveEdit: z.literal(false), startLine: z.literal(0), startColumn: z.literal(0),
  length: z.literal(CURRENT_PCB_209_RATLINE_NAVIGATION_SOURCE.length) });
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB209_RATLINE_NAVIGATION_PAUSE"); } }
export function qualifyCurrentPcb209RatlineNavigationPause(event: DiagnosticEvent, script: DiagnosticEvent,
  sessionId: string, contextId: number): string {
  need(event.method === "Debugger.paused" && script.method === "Debugger.scriptParsed" && event.sessionId === sessionId && script.sessionId === sessionId);
  const sourceResult = parsed.safeParse(script.params), stoppedResult = pause.safeParse(event.params);
  need(stoppedResult.success && sourceResult.success);
  const source = sourceResult.data, stopped = stoppedResult.data; const frame = stopped.callFrames[0];
  need(source.executionContextId === contextId && source.scriptId === stopped.data.scriptId &&
    frame.location.scriptId === source.scriptId && frame.functionLocation.scriptId === source.scriptId);
  return source.scriptId;
}
export function qualifyCurrentPcb209RatlineNavigationSource(raw: unknown): void {
  const value = captureCurrentPcbStringClockReply(raw).value;
  if (!z.object({ scriptSource: z.literal(CURRENT_PCB_209_RATLINE_NAVIGATION_SOURCE) }).strict().safeParse(value).success) {
    throw new Error("PCB209_RATLINE_NAVIGATION_SOURCE");
  }
}
