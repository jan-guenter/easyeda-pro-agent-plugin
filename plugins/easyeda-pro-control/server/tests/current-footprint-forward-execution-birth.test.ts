/** Actual distinct factory/private registry/counters with synthetic installation
 * verification and one inert Linux child. No Windows birth or writer is proved. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE } from "../src/current-footprint-forward-execution-contract.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_BIRTH_PROFILE as LIMITS } from "../src/current-footprint-forward-execution-profile.ts";
import { combinedReadyFactoryFixture } from "./helpers/current-footprint-combined-ready-fixture.ts";

void test("writer-v2 birth has its own original factory and cannot promote a read-only owner or data clone", async context => {
  const f = await combinedReadyFactoryFixture("ready", "forward-execution");
  const owner = await f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options);
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  f.api.assertOriginalCurrentFootprintForwardExecutionNativeOwner(owner);
  assert.equal(owner.status().profile, CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE);
  assert.equal(owner.status().forwardResources?.counters.boundGenerations, 1);
  assert.equal(owner.status().forwardResources?.counters.rendererRequests, 0); assert.equal(f.state.writes, 0);
  const outcome = f.api.currentFootprintForwardExecutionBirthAllocationOutcome(f.options);
  assert.equal(outcome.state, "retained"); assert.equal(outcome.owner, owner);
  assert.deepEqual(f.api.currentFootprintForwardExecutionBirthAllocationOutcome(Object.freeze({ ...f.options })), { state: "not-attempted", owner: null });
  assert.throws(() => { Reflect.apply(f.api.assertOriginalCurrentFootprintCopyForwardNativeOwner, undefined, [owner]); }, /ORIGINAL/u);
  const prototype: unknown = Object.getPrototypeOf(owner); assert.ok(prototype !== null && typeof prototype === "object");
  const copied: unknown = Object.create(prototype);
  assert.throws(() => Reflect.apply(f.api.assertOriginalCurrentFootprintForwardExecutionNativeOwner, undefined, [copied]), /ORIGINAL_BIRTH/u);
  await assert.rejects(f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options), /BIRTH_CONSUMED/u);
  assert.equal(f.state.writes, 0); await owner.releaseUnlaunched(); assert.equal(f.child().exitCode, 0);
  const old = await combinedReadyFactoryFixture("ready", "forward");
  const observation = await old.api.startCurrentFootprintCopyForwardNativeOwner(old.options);
  try {
    assert.throws(() => { Reflect.apply(old.api.assertOriginalCurrentFootprintForwardExecutionNativeOwner, undefined, [observation]); }, /ORIGINAL_BIRTH/u);
  } finally { await observation.releaseUnlaunched(); }
});

void test("failed writer-v2 readiness retains exactly the consumed original allocation and failure cause", async () => {
  const f = await combinedReadyFactoryFixture("wrong-challenge", "forward-execution");
  let failure: unknown;
  try { await f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options); } catch (error) { failure = error; }
  assert.ok(failure instanceof Error); assert.equal(f.state.writes, 0);
  const outcome = f.api.currentFootprintForwardExecutionBirthAllocationOutcome(f.options);
  assert.equal(outcome.state, "retained"); assert.ok(outcome.owner !== null); assert.equal(outcome.owner.status().helperClosed, true);
  assert.equal(f.api.currentFootprintForwardExecutionBirthFailureDiagnostics(failure, f.options)?.readinessObserved, false);
  assert.equal(f.api.currentFootprintForwardExecutionBirthFailureDiagnostics(structuredClone(failure), f.options), null);
  assert.equal(f.api.currentFootprintForwardExecutionBirthFailureDiagnostics(failure, Object.freeze({ ...f.options })), null);
  assert.equal(f.api.currentFootprintCopyForwardFactoryFailureDiagnostics(failure, f.options), null);
  assert.ok(Object.hasOwn(failure, "cause")); await assert.rejects(f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options), /BIRTH_CONSUMED/u);
});

void test("writer-v2 birth refuses accessor options before effects and retains pre-spawn failure without retry", async () => {
  const refusal = new Error("synthetic installation preflight refusal");
  const f = await combinedReadyFactoryFixture("ready", "forward-execution", false, { modules: {
    "./current-pcb-diagnostic-installation.ts": { verifyCurrentPcb209DiagnosticInstallation: (): Promise<never> => Promise.reject(refusal) },
  } });
  let getterCalls = 0;
  const hostile = Object.freeze(Object.defineProperty({ ...f.options }, "pluginRoot", { enumerable: true, get: (): string => { getterCalls += 1; return f.options.pluginRoot; } }));
  await assert.rejects(f.api.startCurrentFootprintForwardExecutionNativeOwner(hostile), /BIRTH_OPTIONS/u);
  assert.equal(getterCalls, 0); assert.equal(f.state.readySent, false); assert.equal(f.state.writes, 0);
  await assert.rejects(f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options), (error: unknown) => error === refusal);
  assert.deepEqual(f.api.currentFootprintForwardExecutionBirthAllocationOutcome(f.options), { state: "no-resource", owner: null });
  await assert.rejects(f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options), /BIRTH_CONSUMED/u);
});

void test("a writer-v2 spawn refusal remains unresolved once its original allocation boundary was entered", async () => {
  const refusal = new Error("synthetic spawn allocation unknown"); let attempted = 0;
  const f = await combinedReadyFactoryFixture("ready", "forward-execution", false, { modules: {
    "node:child_process": { spawn: (): never => { attempted += 1; throw refusal; } },
  } });
  await assert.rejects(f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options), (error: unknown) => error === refusal);
  assert.equal(attempted, 1); assert.deepEqual(f.api.currentFootprintForwardExecutionBirthAllocationOutcome(f.options), { state: "unresolved", owner: null });
  await assert.rejects(f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options), /BIRTH_CONSUMED/u);
  assert.equal(attempted, 1); assert.equal(f.state.readySent, false); assert.equal(f.state.writes, 0);
});

void test("writer-v2 retains its actual child before constructor failure and observes once-only zero-input closure", async () => {
  const refusal = new Error("synthetic constructor source refusal");
  const f = await combinedReadyFactoryFixture("ready", "forward-execution", false, { modules: {
    "./current-pcb-209-actor-clock-source.ts": { requireCurrentPcb209ActorClockSourceQualification: (): never => {
      f.child().stdin.emit("error", new Error("synthetic pre-owner pipe failure")); throw refusal;
    } },
  } });
  await assert.rejects(f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options), (failure: unknown) => failure === refusal);
  assert.deepEqual(f.api.currentFootprintForwardExecutionBirthAllocationOutcome(f.options), { state: "closed-before-owner", owner: null,
    helperClosed: true, eofAttempted: true, helperExitCode: 0, helperExitSignal: null });
  assert.equal(f.child().stdin.writableEnded, true); assert.equal(f.state.writes, 0); assert.equal(f.child().exitCode, 0);
  assert.equal(f.api.currentFootprintForwardExecutionBirthFailureDiagnostics(refusal, f.options), null);
  assert.deepEqual(f.api.currentFootprintForwardExecutionBirthAllocationOutcome(Object.freeze({ ...f.options })), { state: "not-attempted", owner: null });
  await assert.rejects(f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options), /BIRTH_CONSUMED/u);
  assert.equal(f.state.writes, 0);
});

void test("writer-v2 ownerless EOF deadline retains original child and observes its later actual close without retry", async context => {
  const refusal = new Error("synthetic constructor source refusal");
  const ready = await import("../src/current-footprint-combined-ready.ts");
  const f = await combinedReadyFactoryFixture("ready", "forward-execution", false, { modules: {
    "./current-pcb-209-actor-clock-source.ts": { requireCurrentPcb209ActorClockSourceQualification: (): never => { throw refusal; } },
    "./current-footprint-combined-ready.ts": { ...ready, CURRENT_FOOTPRINT_COMBINED_READY: { ...ready.CURRENT_FOOTPRINT_COMBINED_READY, eofCleanupMilliseconds: 1 } },
  }, childProgram: "process.stdin.resume();process.stdin.on('end',()=>{setTimeout(()=>process.exit(0),20);});" });
  await assert.rejects(f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options), (failure: unknown) => failure === refusal);
  context.after(async () => { if (f.child().exitCode === null) { await once(f.child(), "close"); } });
  const outcome = f.api.currentFootprintForwardExecutionBirthAllocationOutcome(f.options);
  assert.equal(outcome.state, "retained-before-owner"); assert.equal(outcome.owner, null);
  assert.ok("helperClosed" in outcome); assert.equal(outcome.helperClosed, false); assert.equal(outcome.eofAttempted, true);
  assert.equal(f.child().stdin.writableEnded, true); assert.equal(f.state.writes, 0);
  await assert.rejects(f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options), /BIRTH_CONSUMED/u);
  await once(f.child(), "close");
  assert.deepEqual(f.api.currentFootprintForwardExecutionBirthAllocationOutcome(f.options), { state: "closed-before-owner", owner: null,
    helperClosed: true, eofAttempted: true, helperExitCode: 0, helperExitSignal: null });
  assert.equal(f.state.writes, 0);
});

void test("actual writer-v2 owner charges every shared physical ID and preserves normal/cleanup classes without a seeded watermark", { timeout: 30_000 }, async context => {
  const f = await combinedReadyFactoryFixture("resource-traffic", "forward-execution");
  const owner = await f.api.startCurrentFootprintForwardExecutionNativeOwner(f.options);
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  const request = owner.syntheticForwardRequestForTest.bind(owner);
  let id = 1;
  // These are actual original owner sends and private ledger increments, not
  // A synthetic counter setter. Encoder/native replies remain inert fixtures.
  for (; id <= 884; id += 1) { await request({ action: "worker-startup-send", requestId: id, method: "Runtime.enable", sessionId: "ui" }); }
  for (; id <= 924; id += 1) { await request({ action: "worker-startup-send", requestId: id, method: "Runtime.releaseObjectGroup", sessionId: "ui" }); }
  const before = owner.status().forwardResources?.generation; assert.ok(before !== undefined);
  assert.equal(before.rendererRequests, 924); assert.equal(before.rendererNormalRequests, 884); assert.equal(before.rendererCleanupRequests, 40);
  const writes = f.state.writes;
  await assert.rejects(request({ action: "footprint-copy-allocated-create-clock-begin", firstRequestId: 925 }), /QUALIFICATION_REQUIRED/u);
  assert.equal(f.state.writes, writes); assert.equal(owner.status().forwardResources?.generation.rendererRequests, 924);
  // Complete only ordinary fixed traffic at this source-only birth boundary.
  const remainingNormal = LIMITS.renderer.normalClassLimit - before.rendererNormalRequests;
  const normalEnd = id + remainingNormal - 1;
  for (; id <= normalEnd; id += 1) { await request({ action: "worker-startup-send", requestId: id, method: "Runtime.enable", sessionId: "ui" }); }
  for (; id <= LIMITS.renderer.requestLimit; id += 1) { await request({ action: "worker-startup-send", requestId: id, method: "Runtime.releaseObjectGroup", sessionId: "ui" }); }
  const final = owner.status().forwardResources?.generation; assert.ok(final !== undefined);
  assert.equal(final.rendererNormalRequests, LIMITS.renderer.normalClassLimit); assert.equal(final.rendererCleanupRequests, LIMITS.renderer.cleanupClassLimit); assert.equal(final.rendererRequests, LIMITS.renderer.requestLimit);
  const consumed = f.state.writes;
  await assert.rejects(request({ action: "worker-startup-send", requestId: id, method: "Runtime.enable", sessionId: "ui" }));
  assert.equal(f.state.writes, consumed); assert.equal(owner.status().forwardResources?.cleanupOnly, true);
  assert.equal(owner.status().forwardResources?.nativeWriterMounted, false); await owner.releaseUnlaunched(); assert.equal(f.child().exitCode, 0);
});
