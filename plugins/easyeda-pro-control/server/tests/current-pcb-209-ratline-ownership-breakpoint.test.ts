import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { CurrentPcb209OwnershipBreakpoint } from "../src/current-pcb-209-ratline-ownership-breakpoint.ts";
import { ratlineCaptureInspector } from "./helpers/current-pcb-209-ratline-capture-inspector.ts";

for (const [stage, sourceText] of [["initial-window", "void 0"], ["pcb-admission", "globalThis.PRO_EDITOR_VERSION = '3.2.209';"],
  ["pcb-release", "(()=>{var uet=Object.create;void uet;})();"]] as const) {
  void test(`real inert V8 transfers ${stage} to the same first statement`, { timeout: 15_000 }, async context => {
    let parsed: unknown;
    let ownership: CurrentPcb209OwnershipBreakpoint | null = null;
    const fixture = await ratlineCaptureInspector(context, "pcb", 0, false, false, { expectedPauses: 2,
      onScriptParsed: value => { if (z.looseObject({ length: z.literal(sourceText.length), url: z.literal("") }).safeParse(value).success) { parsed = value; } } });
    const first = Promise.withResolvers<unknown>();
    const unsubscribe = fixture.transport.subscribe({ paused: value => {
      if (ownership?.observe({ method: "Debugger.paused", sessionId: "synthetic-parent", params: z.record(z.string(), z.unknown()).parse(value) }) !== true) { first.resolve(value); }
    }, resumed: (): void => { ownership?.observe({ method: "Debugger.resumed", sessionId: "synthetic-parent", params: {} }); }, lost: (): void => {
      // Fixture deadlines and child cleanup own any failed transport.
    } });
    const instrumentation = z.object({ breakpointId: z.string() }).strict().parse(
      await fixture.request("Debugger.setInstrumentationBreakpoint", { instrumentation: "beforeScriptExecution" }));
    const running = fixture.request("Runtime.evaluate", { expression: sourceText, returnByValue: true });
    const completedEarly = (async (): Promise<never> => { await running; throw new Error("Hook completed before the owned ordinary pause."); })();
    const firstPause = await Promise.race([first.promise, completedEarly]);
    const compiled = z.looseObject({ scriptId: z.string() }).parse(parsed);
    assert.deepEqual(await fixture.request("Debugger.getScriptSource", { scriptId: compiled.scriptId }), { scriptSource: sourceText });
    ownership = new CurrentPcb209OwnershipBreakpoint(stage, "synthetic-parent", firstPause, { lineNumber: 0, columnNumber: 0 });
    await Promise.race([ownership.enter(command => fixture.request(command.method, command.params), async (): Promise<void> => {
      await Promise.resolve(); assert.equal(fixture.counts().subscribers, 1);
    }), completedEarly]);
    assert.equal(ownership.status()["entered"], true); assert.equal(ownership.status()["ordinaryPauseSeen"], true);
    context.diagnostic(JSON.stringify({ stage, entry: { lineNumber: 0, columnNumber: 0 }, ordinaryReason: "other", node: process.version, v8: process.versions.v8 }));
    await ownership.remove(command => fixture.request(command.method, command.params));
    assert.equal(ownership.status()["removed"], true);
    await fixture.request("Debugger.removeBreakpoint", { breakpointId: instrumentation.breakpointId });
    await fixture.request("Debugger.resume", {}); await running; unsubscribe();
    assert.equal(fixture.counts().pauses, 2); assert.equal(fixture.counts().resumes, 2);
  });
}

const entry = { scriptId: "source", lineNumber: 0, columnNumber: 0 };
const frame = { functionName: "", functionLocation: { ...entry }, location: { ...entry }, url: "" };
const initial = { reason: "instrumentation", data: { scriptId: "source" }, hitBreakpoints: [], callFrames: [frame] };
void test("relocated first-statement breakpoint refuses resume and still removes its original allocation once", async () => {
  const ownership = new CurrentPcb209OwnershipBreakpoint("pcb-release", "parent", initial, { lineNumber: 0, columnNumber: 0 });
  const calls: string[] = [];
  await assert.rejects(ownership.enter(async command => {
    await Promise.resolve(); calls.push(command.method);
    return { breakpointId: "owned", actualLocation: { ...entry, columnNumber: 6 } };
  }, async (): Promise<void> => { await Promise.resolve(); }), /ACTUAL_ENTRY/u);
  assert.deepEqual(calls, ["Debugger.setBreakpoint"]);
  const remove = async (): Promise<unknown> => { await Promise.resolve(); calls.push("remove"); return {}; };
  await ownership.remove(remove); await ownership.remove(remove);
  assert.deepEqual(calls, ["Debugger.setBreakpoint", "remove"]);
});
void test("ordinary pause cannot replace the original stack or enter without the owned breakpoint", async () => {
  for (const invalid of [{ reason: "instrumentation" }, { hitBreakpoints: ["foreign"] },
    { callFrames: [{ ...frame, location: { ...entry, columnNumber: 1 } }] }]) {
    const ownership = new CurrentPcb209OwnershipBreakpoint("initial-window", "parent", initial, { lineNumber: 0, columnNumber: 0 });
    await assert.rejects(ownership.enter(async command => {
      await Promise.resolve();
      if (command.method === "Debugger.setBreakpoint") { return { breakpointId: "owned", actualLocation: entry }; }
      ownership.observe({ method: "Debugger.resumed", sessionId: "parent", params: {} });
      ownership.observe({ method: "Debugger.paused", sessionId: "parent", params: { reason: "other", hitBreakpoints: ["owned"], callFrames: [frame], ...invalid } });
      return {};
    }, async (): Promise<void> => { await Promise.resolve(); }));
    assert.equal(ownership.status()["entered"], false);
    await ownership.remove(async (): Promise<unknown> => { await Promise.resolve(); return {}; });
  }
});

void test("lost resume acknowledgment never accepts the observed ordinary stop or retries the resume", async () => {
  const ownership = new CurrentPcb209OwnershipBreakpoint("initial-window", "parent", initial, { lineNumber: 0, columnNumber: 0 });
  const methods: string[] = [];
  await assert.rejects(ownership.enter(async command => {
    await Promise.resolve(); methods.push(command.method);
    if (command.method === "Debugger.setBreakpoint") { return { breakpointId: "owned", actualLocation: entry }; }
    ownership.observe({ method: "Debugger.resumed", sessionId: "parent", params: {} });
    ownership.observe({ method: "Debugger.paused", sessionId: "parent", params: { reason: "other", hitBreakpoints: ["owned"], callFrames: [frame] } });
    throw new Error("Lost original resume acknowledgment");
  }, async (): Promise<void> => { await Promise.resolve(); }), /Lost original resume/u);
  assert.equal(ownership.status()["ordinaryPauseSeen"], true); assert.equal(ownership.status()["entered"], false);
  await ownership.remove(async command => { await Promise.resolve(); methods.push(command.method); return {}; });
  assert.deepEqual(methods, ["Debugger.setBreakpoint", "Debugger.resume", "Debugger.removeBreakpoint"]);
});

void test("late allocation remains owned after the wait expires and can only be removed", { timeout: 10_000 }, async () => {
  const ownership = new CurrentPcb209OwnershipBreakpoint("initial-window", "parent", initial, { lineNumber: 0, columnNumber: 0 });
  const allocation = Promise.withResolvers<unknown>(); const methods: string[] = [];
  await assert.rejects(ownership.enter(command => { methods.push(command.method); return allocation.promise; },
    async (): Promise<void> => { await Promise.resolve(); }), /DEADLINE/u);
  assert.equal(ownership.status()["allocationUncertain"], true);
  allocation.resolve({ breakpointId: "late-owned", actualLocation: entry });
  await ownership.remove(async command => {
    await Promise.resolve(); methods.push(command.method);
    assert.equal(command.method, "Debugger.removeBreakpoint");
    assert.deepEqual(command.params, { breakpointId: "late-owned" }); return {};
  });
  assert.deepEqual(methods, ["Debugger.setBreakpoint", "Debugger.removeBreakpoint"]);
  assert.equal(ownership.status()["removed"], true); assert.equal(ownership.status()["entered"], false);
});

void test("duplicate and foreign transition events poison the original handshake", async () => {
  for (const fault of ["foreign-resume", "duplicate-resume", "foreign-pause", "duplicate-pause"] as const) {
    const ownership = new CurrentPcb209OwnershipBreakpoint("initial-window", "parent", initial, { lineNumber: 0, columnNumber: 0 });
    await assert.rejects(ownership.enter(async command => {
      await Promise.resolve();
      if (command.method === "Debugger.setBreakpoint") { return { breakpointId: "owned", actualLocation: entry }; }
      ownership.observe({ method: "Debugger.resumed", sessionId: fault === "foreign-resume" ? "other" : "parent", params: {} });
      if (fault === "duplicate-resume") { ownership.observe({ method: "Debugger.resumed", sessionId: "parent", params: {} }); }
      const pause = { method: "Debugger.paused", sessionId: fault === "foreign-pause" ? "other" : "parent",
        params: { reason: "other", hitBreakpoints: ["owned"], callFrames: [frame] } };
      ownership.observe(pause); if (fault === "duplicate-pause") { ownership.observe(pause); } return {};
    }, async (): Promise<void> => { await Promise.resolve(); }), /EVENT_SESSION|DUPLICATE_RESUME|ORDINARY_SEQUENCE/u);
    assert.equal(ownership.status()["entered"], false);
    await ownership.remove(async (): Promise<unknown> => { await Promise.resolve(); return {}; });
  }
});
