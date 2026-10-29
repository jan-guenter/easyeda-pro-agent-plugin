/** Actual private issuer/collector with explicit synthetic source and native
 * capacity dependencies. This does not admit the current54-command purpose. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { unarmedMainCompletionOriginFixture } from "./helpers/footprint-main-completion-origin-fixture.ts";

async function fixture(): Promise<Awaited<ReturnType<typeof unarmedMainCompletionOriginFixture>> & Readonly<{
  held: Awaited<ReturnType<Awaited<ReturnType<typeof unarmedMainCompletionOriginFixture>>["collector"]["collectToHeldFinalPb"]>>;
}>> {
  const f = await unarmedMainCompletionOriginFixture();
  await f.collector.armForCompletion(); f.collector.consumeBeforeInvocation(); f.requestState.invoked = true;
  const held = await f.collector.collectToHeldFinalPb(); return { ...f, held };
}
void test("genuine private issuer atomically consumes original held collector and revokes old retained aliases", async () => {
  const f = await fixture();
  const old = f.module.requireRequest(f.oldOrigin), oldHeld = f.collector.heldFinalPbBindings(f.held);
  const origin = await f.backend.issueCompletionOrigin(f.capability, f.held);
  const bound = f.module.requireCompletion(origin);
  assert.equal(bound.transferredHeld, oldHeld); assert.equal(f.native.beginCount, 1); assert.equal(origin.executionAuthorized, false);
  assert.throws(() => f.module.requireCompletion(structuredClone(origin))); assert.throws(() => f.module.requireRequest(f.oldOrigin));
  assert.throws(() => f.collector.heldFinalPbBindings(f.held)); await assert.rejects(oldHeld.assertOriginal());
  await assert.rejects(old.assertOriginal()); assert.throws(() => old.retire());
  await assert.rejects(f.collector.cleanup(), /COMPLETION_OWNS_GENERATION/u);
  await assert.rejects(f.backend.issueCompletionOrigin(f.capability, f.held));
  await bound.assertOriginal(); await bound.assertOriginalHeld();
  bound.fail(); await assert.rejects(bound.assertOriginal(), /COMPLETION_FAILED/u); await assert.rejects(bound.retire());
  f.native.exited = true; await bound.assertOriginalGenerationExited(); await bound.retire();
  assert.equal(f.native.retireCount, 1); assert.throws(() => f.module.requireCompletion(origin));
});
void test("insufficient current native headroom leaves old held lease untransferred and sends no begin", async () => {
  const f = await fixture(); f.native.capacity = false;
  await assert.rejects(f.backend.issueCompletionOrigin(f.capability, f.held), /capacity refuses/u);
  assert.equal(f.native.beginCount, 0); assert.equal(f.collector.heldFinalPbBindings(f.held).finalPbFrameId, "frame-3");
  assert.equal(f.collector.diagnostics().phase, "held-final-pb");
});
void test("lost native begin acknowledgment consumes handoff without resuming or replaying", async () => {
  const f = await fixture(); f.native.lostBegin = true;
  await assert.rejects(f.backend.issueCompletionOrigin(f.capability, f.held), /lost original begin/u);
  await assert.rejects(f.backend.issueCompletionOrigin(f.capability, f.held));
  assert.equal(f.native.beginCount, 1); assert.equal(f.collector.diagnostics().phase, "held-final-pb");
  f.native.exited = true; await f.collector.observeOriginalGenerationEnded(); assert.equal(f.native.retireCount, 1);
});
void test("lost native retirement acknowledgment is consumed and only original exit permits local settlement", async () => {
  const f = await fixture(), origin = await f.backend.issueCompletionOrigin(f.capability, f.held);
  const bound = f.module.requireCompletion(origin);
  f.native.exited = true; f.native.lostRetire = true;
  await bound.assertOriginalGenerationExited(); await assert.rejects(bound.retire(), /lost original retirement/u);
  await bound.retire(); assert.equal(f.native.retireCount, 1); assert.throws(() => f.module.requireCompletion(origin));
});
void test("one original allocator and event cursor serve actual request/held/completion classes through exact127-command tail", async () => {
  const f = await fixture(), origin = await f.backend.issueCompletionOrigin(f.capability, f.held);
  const runner = new f.Completion(origin); await runner.arm(); const packet = await runner.collect();
  assert.equal(packet.nativeSqlCompletionVerified, false); assert.equal(packet.savedResultVerified, false);
  assert.equal(runner.diagnostics().normalRequests, 45); assert.equal(runner.diagnostics().cleanupRequests, 29);
  await runner.cleanup(); assert.equal(f.native.retireCount, 1); assert.equal(f.native.sends, 105);
  assert.throws(() => f.module.requireRequest(f.oldOrigin)); assert.throws(() => f.module.requireCompletion(origin));
  await f.backend.release(); assert.equal(f.native.tailReleases, 1); assert.equal(f.backend.retained().requests, 127);
  assert.equal(f.backend.retained().pendingReplies, 0); await assert.rejects(f.backend.release());
});
void test("actual completion sequencer settles lost original-exit retirement once without replaying native retirement", async () => {
  const f = await fixture(), origin = await f.backend.issueCompletionOrigin(f.capability, f.held), runner = new f.Completion(origin);
  f.native.exited = true; f.native.lostRetire = true;
  await assert.rejects(runner.observeOriginalGenerationEnded(), /lost original retirement/u);
  const failure = runner.diagnostics().firstFailure; assert.equal(runner.diagnostics().originalGenerationEnded, true);
  await runner.observeOriginalGenerationEnded(); assert.equal(runner.diagnostics().retired, true); assert.equal(f.native.retireCount, 1);
  assert.deepEqual(runner.diagnostics().firstFailure, failure); await assert.rejects(runner.observeOriginalGenerationEnded());
});
void test("actual held collector settles failed-begin lost retirement after original exit without native replay", async () => {
  const f = await fixture(); f.native.lostBegin = true;
  await assert.rejects(f.backend.issueCompletionOrigin(f.capability, f.held), /lost original begin/u);
  f.native.exited = true; f.native.lostRetire = true;
  await assert.rejects(f.collector.observeOriginalGenerationEnded(), /lost original retirement/u);
  const failure = f.collector.diagnostics().firstFailure;
  await f.collector.observeOriginalGenerationEnded(); assert.equal(f.collector.diagnostics().retired, true); assert.equal(f.native.retireCount, 1);
  assert.deepEqual(f.collector.diagnostics().firstFailure, failure); await assert.rejects(f.collector.observeOriginalGenerationEnded());
});
