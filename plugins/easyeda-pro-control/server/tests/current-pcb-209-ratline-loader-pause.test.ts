import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { z } from "zod";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "../src/current-pcb-209-opening-profile.ts";
import { CURRENT_PCB_209_RATLINE_LOADER_SOURCE, CURRENT_PCB_209_RATLINE_LOADER_SOURCE_SHA256,
  qualifyCurrentPcb209RatlineLoaderPause, qualifyCurrentPcb209RatlineLoaderSource } from "../src/current-pcb-209-ratline-loader-pause.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";
import { ratlineCaptureInspector } from "./helpers/current-pcb-209-ratline-capture-inspector.ts";

const sessionId = "original-session";
const contextId = 1;
const uiScriptId = "12";
const generatedScriptId = "57";
const uiUrl = `https://modules.lceda.cn/${CURRENT_PCB_209_OPENING_SCRIPTS.ui.relativePath}`;
const location = (scriptId: string, lineNumber: number, columnNumber: number): object => ({ scriptId, lineNumber, columnNumber });
const frame = (functionName: string, scriptId: string, line: number, start: number, stopped: number): object => ({ functionName, url: "",
  functionLocation: location(scriptId, line, start), location: location(scriptId, line, stopped) });
function observations(): { event: DiagnosticEvent; script: DiagnosticEvent } {
  return {
    event: { method: "Debugger.paused", sessionId, params: { reason: "instrumentation", hitBreakpoints: [], data: { scriptId: generatedScriptId, url: "" },
      callFrames: [frame("", generatedScriptId, 0, 0, 0), frame("by", uiScriptId, 1923, 75_126, 75_140), frame("", uiScriptId, 1931, 3752, 4009)] } },
    script: { method: "Debugger.scriptParsed", sessionId, params: { scriptId: generatedScriptId, executionContextId: contextId, url: "",
      hasSourceURL: false, isLiveEdit: false, isModule: false, startLine: 0, startColumn: 0, endLine: 3, endColumn: 2,
      length: 28, hash: CURRENT_PCB_209_RATLINE_LOADER_SOURCE_SHA256, scriptLanguage: "JavaScript", sourceMapURL: "",
      stackTrace: { callFrames: [{ functionName: "by", scriptId: uiScriptId, url: uiUrl, lineNumber: 1923, columnNumber: 75_140 }] } } },
  };
}
void test("loader pause requires complete source and original UI session, context and producer", () => {
  const { event, script } = observations();
  assert.equal(qualifyCurrentPcb209RatlineLoaderPause(event, script, sessionId, contextId, uiScriptId), generatedScriptId);
  assert.equal(Buffer.byteLength(CURRENT_PCB_209_RATLINE_LOADER_SOURCE), 28);
  assert.equal(createHash("sha256").update(CURRENT_PCB_209_RATLINE_LOADER_SOURCE).digest("hex"), CURRENT_PCB_209_RATLINE_LOADER_SOURCE_SHA256);
  qualifyCurrentPcb209RatlineLoaderSource({ scriptSource: CURRENT_PCB_209_RATLINE_LOADER_SOURCE });
  for (const raw of [{ scriptSource: `${CURRENT_PCB_209_RATLINE_LOADER_SOURCE};void 0` }, { scriptSource: CURRENT_PCB_209_RATLINE_LOADER_SOURCE, extra: true },
    { scriptSource: CURRENT_PCB_209_RATLINE_LOADER_SOURCE.slice(1, -1) }]) {
    assert.throws(() => { qualifyCurrentPcb209RatlineLoaderSource(raw); }, /PCB209_RATLINE_LOADER_SOURCE/u);
  }
  for (const [session, context, source] of [["foreign", contextId, uiScriptId], [sessionId, 2, uiScriptId], [sessionId, contextId, "foreign"]] as const) {
    assert.throws(() => qualifyCurrentPcb209RatlineLoaderPause(event, script, session, context, source), /PCB209_RATLINE_LOADER_PAUSE/u);
  }
});
void test("identical empty functions from another caller or malformed source metadata refuse", () => {
  const { event, script } = observations();
  const frames = z.array(z.record(z.string(), z.unknown())).parse(event.params["callFrames"]);
  const creator = frames[1]; const caller = frames[2]; assert.ok(creator); assert.ok(caller);
  const malformedEvents = [
    { ...event, method: "Debugger.resumed" }, { ...event, sessionId: "foreign" },
    { ...event, params: { ...event.params, reason: "other" } },
    { ...event, params: { ...event.params, data: { scriptId: "58", url: "" } } },
    { ...event, params: { ...event.params, callFrames: [...frames, caller] } },
    { ...event, params: { ...event.params, callFrames: [frames[0], { ...creator, functionName: "other" }, caller] } },
    { ...event, params: { ...event.params, callFrames: [frames[0], creator, { ...caller, location: { scriptId: uiScriptId, lineNumber: 1931, columnNumber: 4769 } }] } },
    { ...event, params: { ...event.params, callFrames: [frames[0], { ...creator, functionLocation: { scriptId: uiScriptId, lineNumber: 1923, columnNumber: 75_125 } }, caller] } },
  ];
  for (const candidate of malformedEvents) {
    assert.throws(() => qualifyCurrentPcb209RatlineLoaderPause(candidate, script, sessionId, contextId, uiScriptId), /PCB209_RATLINE_LOADER_PAUSE/u);
  }
  for (const delta of [{ hash: "0".repeat(64) }, { length: 27 }, { isModule: true }, { isLiveEdit: true }, { hasSourceURL: true },
    { endLine: 2 }, { sourceMapURL: "foreign" }, { stackTrace: { callFrames: [{ functionName: "by", scriptId: "foreign", url: uiUrl, lineNumber: 1923, columnNumber: 75_140 }] } }]) {
    assert.throws(() => qualifyCurrentPcb209RatlineLoaderPause(event, { ...script, params: { ...script.params, ...delta } }, sessionId, contextId, uiScriptId), /PCB209_RATLINE_LOADER_PAUSE/u);
  }
});

void test("actual inert V8 default callback matches the retained constructor pause grammar", async (context) => {
  let parsed: unknown;
  const fixture = await ratlineCaptureInspector(context, "pcb", 0, false, false, { expectedPauses: 2,
    onScriptParsed: (value): void => {
      if (z.looseObject({ url: z.literal(""), length: z.literal(28) }).safeParse(value).success) { parsed = value; }
    } });
  // Only the empty default initializer and inert caller are recreated. Padding
  // Preserves the reviewed columns; this is not an admitted EasyEDA UI source.
  const prefix = "globalThis.runLoader=()=>Promise.resolve({message:null}).then(";
  const caller = "({message:s})=>{";
  const expression = `${"\n".repeat(1923)}${" ".repeat(75_109)}async function by(t,e=void 0,i=new Function,o){return i;}${"\n".repeat(8)}` +
    `${" ".repeat(3752 - prefix.length)}${prefix}${caller}${" ".repeat(4009 - 3752 - caller.length)}by(s,void 0,void 0,void 0)});`;
  const compiled = z.object({ scriptId: z.string() }).strict().parse(await fixture.request("Runtime.compileScript", { expression, sourceURL: uiUrl, persistScript: true }));
  await fixture.request("Runtime.runScript", { scriptId: compiled.scriptId, returnByValue: true });
  const remote = z.object({ result: z.looseObject({ objectId: z.string() }) }).strict().parse(
    await fixture.request("Runtime.evaluate", { expression: "globalThis", returnByValue: false }));
  const initial = Promise.withResolvers<unknown>(); const generated = Promise.withResolvers<unknown>(); let pauses = 0;
  const unsubscribe = fixture.transport.subscribe({ paused: (value): void => { pauses += 1; (pauses === 1 ? initial : generated).resolve(value); },
    resumed: (): void => {
      // Original fixture records each resume.
    }, lost: (): void => {
      // Request deadlines preserve failure.
    } });
  const breakpoint = z.object({ breakpointId: z.string() }).strict().parse(
    await fixture.request("Debugger.setInstrumentationBreakpoint", { instrumentation: "beforeScriptExecution" }));
  const call = fixture.request("Runtime.callFunctionOn", { objectId: remote.result.objectId,
    functionDeclaration: "function(){return globalThis.runLoader();}", returnByValue: true, awaitPromise: true, silent: true });
  const finishedEarly = (async (): Promise<never> => { await call; throw new Error("Loader completed before its expected pause."); })();
  await Promise.race([initial.promise, finishedEarly]); await fixture.request("Debugger.resume", {});
  const pause = z.record(z.string(), z.unknown()).parse(await Promise.race([generated.promise, finishedEarly]));
  const source = z.looseObject({ executionContextId: z.number().int().positive() }).parse(parsed);
  const generatedId = qualifyCurrentPcb209RatlineLoaderPause({ method: "Debugger.paused", sessionId, params: pause },
    { method: "Debugger.scriptParsed", sessionId, params: source }, sessionId, source.executionContextId, compiled.scriptId);
  qualifyCurrentPcb209RatlineLoaderSource(await fixture.request("Debugger.getScriptSource", { scriptId: generatedId }));
  await fixture.request("Debugger.removeBreakpoint", { breakpointId: breakpoint.breakpointId });
  await fixture.request("Debugger.resume", {}); await call; unsubscribe();
  assert.equal(fixture.counts().pauses, 2); assert.equal(fixture.counts().resumes, 2);
});
