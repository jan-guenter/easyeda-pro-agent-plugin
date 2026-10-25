/** The pinned UI's Jd PCB opener calls by once with an undefined callback.
 * Its default new Function creates this empty function before iframe creation.
 * These pure checks cannot establish temporal eligibility or original ownership;
 * the retained router and native channel must prove those before dispatch. */
import { z } from "zod";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";

export type CurrentPcb209RatlineLoaderCommand =
  Readonly<{ method: "Debugger.getScriptSource"; sessionId: string; loaderPhase: "source"; params: Readonly<{ scriptId: string }> }> |
  Readonly<{ method: "Debugger.resume"; sessionId: string; loaderPhase: "resume"; params: Readonly<Record<string, never>> }>;
export const CURRENT_PCB_209_RATLINE_LOADER_SOURCE = "(function anonymous(\n) {\n\n})";
export const CURRENT_PCB_209_RATLINE_LOADER_SOURCE_SHA256 = "f82b08b4e803c98515d1c06eb4d345d367f1f4d7822f9dab4b7d4cabafa38d03";
const uiUrl = `https://modules.lceda.cn/${CURRENT_PCB_209_OPENING_SCRIPTS.ui.relativePath}`;
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = (line: number, column: number): z.ZodObject<{
  scriptId: typeof token; lineNumber: z.ZodLiteral<number>; columnNumber: z.ZodLiteral<number>;
}> => z.object({ scriptId: token, lineNumber: z.literal(line), columnNumber: z.literal(column) }).strict();
type Location = z.infer<ReturnType<typeof location>>;
type Frame = Readonly<{ functionName: string; url: ""; functionLocation: Location; location: Location }>;
const frame = (name: string, line: number, start: number, stopped: number): z.ZodType<Frame> => z.looseObject({
  functionName: z.literal(name), url: z.literal(""), functionLocation: location(line, start), location: location(line, stopped),
});
const pause = z.looseObject({ reason: z.literal("instrumentation"),
  data: z.object({ scriptId: token, url: z.literal("") }).strict(), hitBreakpoints: z.tuple([]),
  callFrames: z.tuple([frame("", 0, 0, 0), frame("by", 1923, 75_126, 75_140), frame("", 1931, 3752, 4009)]) });
const creatorStackFrame = z.looseObject({ functionName: z.literal("by"), scriptId: token,
  url: z.literal(uiUrl), lineNumber: z.literal(1923), columnNumber: z.literal(75_140) });
const parsed = z.looseObject({ scriptId: token, executionContextId: z.number().int().positive(), url: z.literal(""),
  hasSourceURL: z.literal(false), isLiveEdit: z.literal(false), isModule: z.literal(false),
  startLine: z.literal(0), startColumn: z.literal(0), endLine: z.literal(3), endColumn: z.literal(2),
  length: z.literal(CURRENT_PCB_209_RATLINE_LOADER_SOURCE.length), hash: z.literal(CURRENT_PCB_209_RATLINE_LOADER_SOURCE_SHA256),
  scriptLanguage: z.literal("JavaScript"), sourceMapURL: z.literal(""),
  stackTrace: z.looseObject({ callFrames: z.tuple([creatorStackFrame]) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB209_RATLINE_LOADER_PAUSE"); } }

export function qualifyCurrentPcb209RatlineLoaderPause(event: DiagnosticEvent, script: DiagnosticEvent,
  sessionId: string, contextId: number, uiScriptId: string): string {
  need(event.method === "Debugger.paused" && script.method === "Debugger.scriptParsed" && event.sessionId === sessionId && script.sessionId === sessionId);
  const sourceResult = parsed.safeParse(script.params), stoppedResult = pause.safeParse(event.params);
  need(sourceResult.success && stoppedResult.success);
  const source = sourceResult.data, stopped = stoppedResult.data, [generated, creator, caller] = stopped.callFrames;
  need(source.executionContextId === contextId && source.scriptId !== uiScriptId && source.scriptId === stopped.data.scriptId &&
    generated.location.scriptId === source.scriptId && generated.functionLocation.scriptId === source.scriptId &&
    creator.location.scriptId === uiScriptId && creator.functionLocation.scriptId === uiScriptId &&
    caller.location.scriptId === uiScriptId && caller.functionLocation.scriptId === uiScriptId &&
    source.stackTrace.callFrames[0].scriptId === uiScriptId);
  return source.scriptId;
}

export function qualifyCurrentPcb209RatlineLoaderSource(raw: unknown): void {
  const value = captureCurrentPcbStringClockReply(raw).value;
  if (!z.object({ scriptSource: z.literal(CURRENT_PCB_209_RATLINE_LOADER_SOURCE) }).strict().safeParse(value).success) {
    throw new Error("PCB209_RATLINE_LOADER_SOURCE");
  }
}
