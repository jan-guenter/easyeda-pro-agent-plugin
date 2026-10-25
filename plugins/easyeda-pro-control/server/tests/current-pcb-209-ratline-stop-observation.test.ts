import assert from "node:assert/strict";
import { test } from "node:test";
import { captureCurrentPcb209RatlineStop, captureCurrentPcb209RatlineStopRecord,
  currentPcb209RatlineIsStop, summarizeCurrentPcb209RatlineStop } from "../src/current-pcb-209-ratline-stop-observation.ts";

const metadata = { transitionStarted: true, selectedContextObserved: false, originalUiUniqueContextId: "original-ui",
  selectedContextId: null, observedTopScriptContextId: 7 } as const;
void test("rejected stop keeps complete bounded immutable data and digest summary excludes raw records", () => {
  const event = { method: "Debugger.paused", params: { callFrames: [{ location: { scriptId: "script" } }] }, sessionId: "parent" };
  const script = captureCurrentPcb209RatlineStopRecord({ method: "Debugger.scriptParsed", params: { scriptId: "script", url: "private-url" } }, 16_384);
  const evidence = captureCurrentPcb209RatlineStop(event, script, null, metadata);
  assert.equal(evidence.event.status, "captured"); assert.deepEqual(evidence.event.value, event); assert.ok(Object.isFrozen(evidence.event.value));
  assert.equal(evidence.context.status, "unavailable"); assert.equal(evidence.executionAuthorized, false);
  event.sessionId = "changed"; assert.notDeepEqual(evidence.event.value, event);
  const summary = summarizeCurrentPcb209RatlineStop(evidence); assert.match(summary.evidenceSha256, /^[a-f\d]{64}$/u);
  assert.equal(JSON.stringify(summary).includes("private-url"), false); assert.equal(JSON.stringify(summary).includes("original-ui"), false);
});
void test("rejected-stop capture refuses hooks, cycles and explicit oversize without evaluating supplied code", () => {
  let hooks = 0; const hook = (): never => { hooks += 1; throw new Error("Unexpected hook"); };
  const getter = { method: "Debugger.paused" }; Object.defineProperty(getter, "params", { enumerable: true, get: hook });
  const cycle: Record<string, unknown> = {}; cycle["self"] = cycle;
  for (const value of [getter, new Proxy({}, { ownKeys: hook }), cycle, { toJSON: hook }]) {
    assert.equal(captureCurrentPcb209RatlineStopRecord(value, 32_768).status, "malformed");
  }
  assert.equal(currentPcb209RatlineIsStop(getter), true); assert.equal(currentPcb209RatlineIsStop(new Proxy(getter, { getOwnPropertyDescriptor: hook })), false);
  assert.equal(captureCurrentPcb209RatlineStopRecord({ value: "x".repeat(32_768) }, 32_768).status, "oversized");
  assert.equal(captureCurrentPcb209RatlineStopRecord({ value: "é".repeat(20_000) }, 32_768).status, "oversized");
  assert.equal(hooks, 0);
});
