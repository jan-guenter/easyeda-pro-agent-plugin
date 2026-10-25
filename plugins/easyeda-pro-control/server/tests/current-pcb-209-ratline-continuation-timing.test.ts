import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE as native } from "../src/current-pcb-209-ratline-continuation-budget.ts";
import { bindCurrentPcb209RatlineContinuationTiming as bind, inheritCurrentPcb209RatlineContinuationTiming as inherit,
  currentPcb209RatlineContinuationTiming as read, CURRENT_PCB_209_RATLINE_CONTINUATION_TIMING as timing } from "../src/current-pcb-209-ratline-continuation-timing.ts";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE as held } from "../src/current-pcb-209-ratline-budget.ts";
import { bindCurrentPcb209RatlinePcbTransport, currentPcb209RatlineTransportRequestMilliseconds as deadline } from "../src/current-pcb-209-ratline-transport-windows.ts";

void test("fresh timing follows original objects only and cannot be replaced by copied data", () => {
  const inherited = Object.freeze({ role: "worker" }), original = Object.freeze({ role: "worker" });
  bind(original, "worker"); inherit(original, inherited);
  assert.equal(read(original), timing.worker); assert.equal(read(inherited), timing.worker);
  assert.equal(read({ ...original }), null); assert.equal(read(structuredClone(original)), null);
  assert.ok(Object.isFrozen(timing) && Object.isFrozen(timing.worker));
  assert.throws(() => { bind(original, "pcb"); }, /TIMING_BINDING/u);
  assert.throws(() => { inherit(original, inherited); }, /TIMING_BINDING/u);
  let traps = 0;
  const hostile = new Proxy({}, { get(): never { traps += 1; throw new Error("Proxy must not execute"); } });
  assert.throws(() => { bind(hostile, "pcb"); }, /TIMING_BINDING/u); assert.equal(traps, 0);
  for (const badRole of ["held", "child", 2500, { ownerMilliseconds: 1_000_000 }]) {
    assert.throws(() => { Reflect.apply(bind, undefined, [{}, badRole]); }, /TIMING_BINDING/u);
  }
  const unmarked = {}; inherit({}, unmarked); assert.equal(read(unmarked), null);
});

void test("fresh descendant proofs change orchestration waits while held, cleanup and native limits stay fixed", () => {
  const oldPcb = {}, standalone = {}, subordinate = {}, worker = {};
  bindCurrentPcb209RatlinePcbTransport(oldPcb); bind(worker, "worker"); bind(subordinate, "subordinate");
  assert.equal(deadline(standalone, "Runtime.callFunctionOn"), 2500);
  assert.equal(deadline(oldPcb, "Runtime.callFunctionOn"), held.elapsed.pcbBootstrapSendMilliseconds);
  assert.equal(deadline(worker, "Runtime.callFunctionOn"), 27_500);
  assert.equal(deadline(worker, "Debugger.setBreakpoint"), 15_000);
  assert.equal(deadline(worker, "Runtime.runIfWaitingForDebugger"), 35_000);
  assert.equal(deadline(subordinate, "Runtime.callFunctionOn"), 67_500);
  for (const transport of [standalone, oldPcb, worker, subordinate]) {
    assert.equal(deadline(transport, "Debugger.resume"), 2500);
    assert.equal(deadline(transport, "Debugger.removeBreakpoint"), 2500);
  }
  // S0 is one bounded native parent proof; each child repeats its parent's
  // Creation proof twice and three original session/router proofs.
  assert.deepEqual([timing.pcb.ownerMilliseconds, timing.worker.ownerMilliseconds, timing.subordinate.ownerMilliseconds], [2500, 12_500, 32_500]);
  // Four setup commands, one retained instrumentation allocation and the
  // Initial/final owner proofs must all fit before the one child start.
  assert.equal(timing.pcb.childArmMilliseconds, 152_500);
  assert.equal(timing.worker.childArmMilliseconds, 382_500);
  // The largest worker pause includes repeated-object equality checks.
  assert.equal(timing.worker.capturePauseMilliseconds, 510_000);
  assert.equal(timing.worker.comparisonMilliseconds, 130_000);
  assert.equal(native.elapsed.ordinaryRequestMilliseconds, 2500);
  assert.equal(native.elapsed.normalMilliseconds, 3_600_000);
  assert.equal(timing.pcb.captureWaitMilliseconds, native.elapsed.normalMilliseconds);
  assert.equal(timing.worker.captureWaitMilliseconds, native.elapsed.normalMilliseconds);
  assert.equal(native.normalRequestLimit, 438); assert.equal(native.cleanupRequests, 56);
});
