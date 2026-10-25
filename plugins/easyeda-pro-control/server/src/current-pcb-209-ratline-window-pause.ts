/** Electron41 DidClearWindowObject runs exactly `void 0` when establishing a
 * window context. Initial iframe access has the pinned UI creator stack; a
 * committed document has no JavaScript caller. These byte/shape checks grant
 * no frame, temporal or command authority: the original router owns those.
 * https://github.com/electron/electron/blob/v41.2.1/shell/renderer/renderer_client_base.cc */
import { z } from "zod";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";

export type CurrentPcb209RatlineWindowStage = "initial" | "document";
export type CurrentPcb209RatlineWindowCommand =
  Readonly<{ method: "Debugger.getScriptSource"; sessionId: string; windowPhase: "initial-source" | "document-source"; params: Readonly<{ scriptId: string }> }> |
  Readonly<{ method: "Debugger.resume"; sessionId: string; windowPhase: "initial-resume" | "document-resume"; params: Readonly<Record<string, never>> }>;
export const CURRENT_PCB_209_RATLINE_WINDOW_SOURCE = "void 0";
export const CURRENT_PCB_209_RATLINE_WINDOW_SOURCE_SHA256 = "cb28eafc61a54ef9b4621764371ef6b8fc5cc1a217a966416197ed9a903aa585";
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const frame = z.looseObject({ functionName: z.string(), url: z.literal(""), functionLocation: location, location });
const parsed = z.looseObject({ scriptId: token, executionContextId: z.number().int().positive(), url: z.literal(""),
  hasSourceURL: z.literal(false), isLiveEdit: z.literal(false), isModule: z.literal(false),
  startLine: z.literal(0), startColumn: z.literal(0), endLine: z.literal(0), endColumn: z.literal(6), length: z.literal(6),
  hash: z.literal(CURRENT_PCB_209_RATLINE_WINDOW_SOURCE_SHA256), scriptLanguage: z.literal("JavaScript"), sourceMapURL: z.literal(""),
  stackTrace: z.unknown().optional() });
const stopped = z.looseObject({ reason: z.literal("instrumentation"), data: z.object({ scriptId: token, url: z.literal("") }).strict(),
  hitBreakpoints: z.tuple([]), callFrames: z.array(frame).min(1).max(6) });
const creatorFrame = z.looseObject({ functionName: z.literal(""), scriptId: token,
  url: z.literal(`https://modules.lceda.cn/${CURRENT_PCB_209_OPENING_SCRIPTS.ui.relativePath}`), lineNumber: z.literal(1931), columnNumber: z.literal(1320) });
const creator = z.object({ callFrames: z.tuple([creatorFrame]), parentId: z.object({ id: token }).strict().optional() }).strict();
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB209_RATLINE_WINDOW_PAUSE"); } }
export function isCurrentPcb209RatlineWindowScript(event: DiagnosticEvent): boolean {
  return event.method === "Debugger.scriptParsed" && parsed.safeParse(event.params).success;
}
export function qualifyCurrentPcb209RatlineWindowPause(event: DiagnosticEvent, script: DiagnosticEvent,
  sessionId: string, contextId: number, uiScriptId: string, stage: CurrentPcb209RatlineWindowStage): string {
  need(event.method === "Debugger.paused" && script.method === "Debugger.scriptParsed" && event.sessionId === sessionId && script.sessionId === sessionId);
  const sourceResult = parsed.safeParse(script.params), stopResult = stopped.safeParse(event.params);
  need(sourceResult.success && stopResult.success);
  const source = sourceResult.data, stop = stopResult.data;
  need(source.executionContextId === contextId && source.scriptId !== uiScriptId && source.scriptId === stop.data.scriptId);
  // Each tuple is name, function line/column, and stopped line/column. Exact
  // Parent UI locations bind the initial access; no arbitrary eval is admitted.
  const expected = stage === "initial" ? [["", 0, 0, 0, 0], ["", 1931, 1315, 1931, 1320], ["n", 1923, 80_850, 1931, 91],
    ["create", 1923, 80_633, 1931, 1313], ["create", 1923, 80_386, 1923, 80_406], ["by", 1923, 75_126, 1923, 76_601]] as const : [["", 0, 0, 0, 0]] as const;
  need(stop.callFrames.length === expected.length);
  for (const [index, value] of stop.callFrames.entries()) {
    const point = expected[index]; need(point !== undefined);
    const scriptId = index === 0 ? source.scriptId : uiScriptId;
    need(value.functionName === point[0] && value.functionLocation.scriptId === scriptId && value.location.scriptId === scriptId &&
      value.functionLocation.lineNumber === point[1] && value.functionLocation.columnNumber === point[2] &&
      value.location.lineNumber === point[3] && value.location.columnNumber === point[4]);
  }
  if (stage === "initial") { const stack = creator.safeParse(source.stackTrace); need(stack.success && stack.data.callFrames[0].scriptId === uiScriptId); }
  else { need(source.stackTrace === undefined); }
  return source.scriptId;
}
export function qualifyCurrentPcb209RatlineWindowSource(raw: unknown): void {
  need(z.object({ scriptSource: z.literal(CURRENT_PCB_209_RATLINE_WINDOW_SOURCE) }).strict().safeParse(captureCurrentPcbStringClockReply(raw).value).success);
}
/** The initial child has not yet received pcb-canvas. Require its actual DOM
 * owner and exact selected document binding before resuming the context hook. */
export function qualifyCurrentPcb209RatlineWindowOwner(owner: unknown, described: unknown, frameId: string, target: CurrentDisposableOpenSealedTarget): void {
  const id = z.number().int().positive().max(2_147_483_647);
  const reply = z.object({ backendNodeId: id, nodeId: id.optional() }).strict().parse(captureCurrentPcbStringClockReply(owner).value);
  const attributeList = z.array(z.string().max(8192)).max(256);
  const node = z.object({ node: z.looseObject({ backendNodeId: id, frameId: token, nodeType: z.literal(1), nodeName: z.literal("IFRAME"),
    localName: z.literal("iframe"), attributes: attributeList }) }).strict().parse(captureCurrentPcbStringClockReply(described).value).node;
  need(node.backendNodeId === reply.backendNodeId && node.frameId === frameId && node.attributes.length % 2 === 0);
  const attributes = new Map<string, string>();
  for (let index = 0; index < node.attributes.length; index += 2) {
    const key = node.attributes[index], value = node.attributes[index + 1]; need(key !== undefined && value !== undefined && key === key.toLowerCase() && !attributes.has(key));
    attributes.set(key, value);
  }
  const tabId = `${target.documentUuid}@${target.projectUuid}`;
  need(attributes.get("id") === `frame_${tabId}` && attributes.get("c_dbid") === tabId && attributes.get("c_doctype") === "3" &&
    attributes.get("src") === "editor?entry=pcb" && attributes.get("class")?.split(/\s+/u).includes("editframe") === true &&
    !["blankiframe", "fromfile", "jsoncacheready", "pcb-canvas", "srcdoc"].some(key => attributes.has(key)));
}
