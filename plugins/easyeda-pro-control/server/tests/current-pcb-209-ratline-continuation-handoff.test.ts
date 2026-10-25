import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcb209RatlineContinuationHandoff, beforeCurrentPcb209RatlineCaptureResume,
  bindCurrentPcb209RatlineContinuationHandoff, currentPcb209RatlineRetirementConsumer } from "../src/current-pcb-209-ratline-continuation-handoff.ts";
import { CurrentPcb209RatlinePcbCapture } from "../src/current-pcb-209-ratline-capture-runner.ts";
import type { CurrentPcb209RatlineCaptureTransport } from "../src/current-pcb-209-ratline-capture-runner.ts";

void test("retirement event and capture hook reject substituted prototype getters without invoking them", async () => {
  const flow = new CurrentPcb209RatlineContinuationHandoff(() => Promise.resolve(), (): never => { throw new Error("No original retirement"); });
  const prototype = CurrentPcb209RatlineContinuationHandoff.prototype, transport = {};
  bindCurrentPcb209RatlineContinuationHandoff(transport, flow, "pcb");
  const consume = currentPcb209RatlineRetirementConsumer(flow);
  const before = Object.getOwnPropertyDescriptor(prototype, "beforeResume"), event = Object.getOwnPropertyDescriptor(prototype, "consumeRetirementEvent");
  assert.ok(before !== undefined && event !== undefined); let getterCalls = 0;
  try {
    Object.defineProperty(prototype, "beforeResume", { configurable: true, get: (): unknown => { getterCalls += 1; return before.value as unknown; } });
    await assert.rejects(beforeCurrentPcb209RatlineCaptureResume(transport, "received", {}, {}), /OWNER_METHOD/u);
    Object.defineProperty(prototype, "beforeResume", before);
    Object.defineProperty(prototype, "consumeRetirementEvent", { configurable: true, get: (): unknown => { getterCalls += 1; return event.value as unknown; } });
    assert.throws(() => consume({ method: "Target.detachedFromTarget", params: { sessionId: "worker" }, sessionId: "parent" }), /OWNER_METHOD/u);
    assert.equal(getterCalls, 0);
  } finally { Object.defineProperty(prototype, "beforeResume", before); Object.defineProperty(prototype, "consumeRetirementEvent", event); flow.abort(); }
});

void test("unsolicited resumed observation fails capture without invoking the bound retirement hook or dispatching a second resume", async () => {
  const prototype = CurrentPcb209RatlineContinuationHandoff.prototype;
  const original = Object.getOwnPropertyDescriptor(prototype, "observeResume");
  assert.ok(original !== undefined); let getterCalls = 0, requests = 0, terminated = false, unsubscribed = false;
  const flow = new CurrentPcb209RatlineContinuationHandoff(() => Promise.resolve(), (): never => { throw new Error("Unsolicited retirement"); });
  const transport: CurrentPcb209RatlineCaptureTransport = { scriptId: "synthetic-script",
    assertOriginalPinnedRealm: (): Promise<void> => Promise.resolve(),
    assertOriginalTermination: (): Promise<void> => { assert.ok(terminated); return Promise.resolve(); },
    request: (): Promise<unknown> => { requests += 1; return Promise.reject(new Error("No command after unsolicited resume")); },
    subscribe: events => {
      events.paused({});
      Object.defineProperty(prototype, "observeResume", { configurable: true, get: (): unknown => { getterCalls += 1; return original.value as unknown; } });
      events.resumed(); return (): void => { unsubscribed = true; };
    },
  };
  bindCurrentPcb209RatlineContinuationHandoff(transport, flow, "pcb"); const capture = new CurrentPcb209RatlinePcbCapture(transport);
  try {
    await assert.rejects(capture.capture()); assert.equal(getterCalls, 0); assert.equal(requests, 0);
    assert.deepEqual(capture.status()["firstFailure"], { reason: "PCB209_RATLINE_CAPTURE_UNEXPECTED_RESUME", stage: "capture-arming", step: "owner-reproof", lastCommand: null, lastEvent: "resumed" });
  } finally { Object.defineProperty(prototype, "observeResume", original); flow.abort(); terminated = true; await capture.releaseAfterTermination(); }
  assert.ok(unsubscribed);
});
