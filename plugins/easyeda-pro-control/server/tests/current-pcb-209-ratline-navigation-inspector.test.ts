import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { CURRENT_PCB_209_RATLINE_OPENING_FUNCTION } from "../src/current-pcb-209-ratline-opening-program.ts";
import {
  CURRENT_PCB_209_RATLINE_NAVIGATION_SOURCE,
  qualifyCurrentPcb209RatlineNavigationPause,
  qualifyCurrentPcb209RatlineNavigationSource,
} from "../src/current-pcb-209-ratline-navigation-pause.ts";
import { ratlineCaptureInspector } from "./helpers/current-pcb-209-ratline-capture-inspector.ts";

void test("actual V8 navigation instrumentation matches the fixed pause and complete-source qualifiers", async (context) => {
  let parsed: unknown;
  const fixture = await ratlineCaptureInspector(context, "pcb", 0, false, false, {
    expectedPauses: 1,
    onScriptParsed: (value): void => {
      const candidate = z.looseObject({ url: z.literal(""), length: z.literal(CURRENT_PCB_209_RATLINE_NAVIGATION_SOURCE.length) }).safeParse(value);
      if (candidate.success) { parsed = value; }
    },
  });
  const remote = z.object({ result: z.looseObject({ objectId: z.string() }) }).strict().parse(
    await fixture.request("Runtime.evaluate", { expression: "globalThis", returnByValue: false }));
  const stopped = Promise.withResolvers<unknown>();
  const unsubscribe = fixture.transport.subscribe({ paused: (value): void => { stopped.resolve(value); },
    resumed: (): void => {
      // The fixture records the original resume.
    }, lost: (): void => {
      // Request deadlines retain failures.
    } });
  const breakpoint = z.object({ breakpointId: z.string() }).strict().parse(
    await fixture.request("Debugger.setInstrumentationBreakpoint", { instrumentation: "beforeScriptExecution" }));
  // Only an inert Node global is targeted. The exact app function fails its own
  // Environment checks after the observed resume; it cannot open a project.
  const call = fixture.request("Runtime.callFunctionOn", { objectId: remote.result.objectId,
    functionDeclaration: CURRENT_PCB_209_RATLINE_OPENING_FUNCTION,
    arguments: [{ value: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16) } }, { value: "open-document" }],
    returnByValue: true, awaitPromise: true, silent: true, generatePreview: false, userGesture: false, throwOnSideEffect: false });
  const pause = z.record(z.string(), z.unknown()).parse(await Promise.race([stopped.promise,
    call.then((): never => { throw new Error("Navigation completed without the expected instrumentation pause."); })]));
  const sourceEvent = z.looseObject({ executionContextId: z.number().int().positive() }).parse(parsed);
  const sessionId = "owned-inert-session";
  const scriptId = qualifyCurrentPcb209RatlineNavigationPause(
    { method: "Debugger.paused", sessionId, params: pause },
    { method: "Debugger.scriptParsed", sessionId, params: sourceEvent }, sessionId, sourceEvent.executionContextId);
  qualifyCurrentPcb209RatlineNavigationSource(await fixture.request("Debugger.getScriptSource", { scriptId }));
  await fixture.request("Debugger.removeBreakpoint", { breakpointId: breakpoint.breakpointId });
  await fixture.request("Debugger.resume", {});
  await call;
  assert.equal(fixture.counts().pauses, 1);
  assert.equal(fixture.counts().resumes, 1);
  unsubscribe();
});
