/** Synthetic fixed scheduler ordering; production origin issuance is separately
 * checked by the actual original main runner. No app or design is connected. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCopyMainRequestRunner } from "../src/current-footprint-copy-main-request-runner.ts";
import { requireCurrentFootprintCopyMainRequestOrigin } from "../src/current-footprint-copy-main-request-origin.ts";
import { requestCollectorFixture, syntheticRequestPlan, syntheticRequestSource } from "./helpers/footprint-main-request-collector-fixture.ts";

async function collectorConstructor(f: ReturnType<typeof requestCollectorFixture>): Promise<typeof CurrentFootprintCopyMainRequestRunner> {
  const path = new URL("../src/current-footprint-copy-main-request-runner.ts", import.meta.url);
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, originalRequire = createRequire(path);
  const output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => {
    if (specifier === "./current-footprint-copy-main-request-origin.ts") { return { requireCurrentFootprintCopyMainRequestOrigin: f.require }; }
    if (specifier === "./current-footprint-copy-main-request-source.ts") { return { requireCurrentFootprintCopyMainRequestSource: (token: unknown): void => { assert.equal(token, syntheticRequestSource); } }; }
    return originalRequire(specifier) as unknown;
  }, loaded, loaded.exports]);
  const selected = loaded.exports["CurrentFootprintCopyMainRequestRunner"]; assert.equal(typeof selected, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Load the actual collector with explicit synthetic issuer/source dependencies, never a production owner or live channel.
  const Constructor = selected as typeof CurrentFootprintCopyMainRequestRunner;
  return Constructor;
}
async function fixture(): Promise<ReturnType<typeof requestCollectorFixture> & Readonly<{ runner: CurrentFootprintCopyMainRequestRunner }>> {
  const f = requestCollectorFixture(); const Constructor = await collectorConstructor(f);
  return { ...f, runner: new Constructor(f.token, syntheticRequestPlan) };
}
void test("sequenced collector joins actual selected PromiseResult, never invokes a writer, and retains group until cleanup", async () => {
  const f = await fixture(); assert.throws(() => requireCurrentFootprintCopyMainRequestOrigin(f.token));
  await f.runner.arm(); assert.equal(f.commands.length, 4); await assert.rejects(f.runner.arm());
  f.runner.consumeBeforeInvocation(); assert.throws(() => { f.runner.consumeBeforeInvocation(); }); f.state.invoked = true;
  const packet = await f.runner.collect(); assert.equal(packet.actualBackendActor.updateTime, 1_700_000_000_123);
  assert.equal(f.runner.diagnostics().normalRequests, 23); assert.equal(f.runner.diagnostics().cleanupRequests, 8);
  assert.equal(f.state.observedSqlArgument, "actual-sql-result"); assert.equal(packet.executionAuthorized, false); assert.equal(packet.nativePublicationCompletionVerified, false);
  assert.equal(packet.actualDocumentClockRpcJoinsObserved, false); assert.equal(packet.nativeSqlCompletionVerified, false); assert.equal(packet.temporaryObjectGroupReleased, false);
  assert.equal(f.commands.filter(command => command.phase === "request-resume").length, 4); assert.equal(f.commands.some(command => command.phase === "request-release"), false);
  await f.runner.requireOriginal(packet); await assert.rejects(f.runner.requireOriginal(structuredClone(packet)));
  await f.runner.cleanup(); assert.equal(f.runner.diagnostics().cleanupRequests, 9); assert.equal(f.runner.diagnostics().retired, true);
  await assert.rejects(f.runner.cleanup()); await assert.rejects(f.runner.requireOriginal(packet)); assert.equal(f.state.mutationCalls, 0);
});
void test("foreign original-driver caller fails before context or downstream SQL and never resumes the refused pause", async () => {
  const f = await fixture(); f.state.wrongCaller = true; await f.runner.arm(); f.runner.consumeBeforeInvocation(); f.state.invoked = true;
  await assert.rejects(f.runner.collect()); assert.equal(f.commands.length, 4); assert.equal(f.runner.diagnostics().unknownPause, true);
  await assert.rejects(f.runner.cleanup(), /GENERATION_CLOSURE_REQUIRED/u); assert.equal(f.commands.some(command => command.phase === "request-resume"), false);
  await assert.rejects(f.runner.observeOriginalGenerationEnded(), /still live/u); f.state.exited = true; await f.runner.observeOriginalGenerationEnded();
  assert.equal(f.runner.diagnostics().originalGenerationEnded, true); assert.equal(f.runner.diagnostics().retired, true);
});
void test("unfulfilled original SQL Promise refuses before SQL relation or the final native continuation", async () => {
  const f = await fixture(); f.state.promisePending = true; await f.runner.arm(); f.runner.consumeBeforeInvocation(); f.state.invoked = true;
  await assert.rejects(f.runner.collect()); assert.equal(f.commands.filter(command => command.phase === "request-resume").length, 3);
  assert.equal(f.commands.some(command => command.phase === "request-sql"), false); assert.equal(f.commands.some(command => command.phase === "request-value"), false);
  const failure = f.runner.diagnostics().firstFailure;
  await assert.rejects(f.runner.cleanup()); assert.deepEqual(f.runner.diagnostics().firstFailure, failure);
  assert.equal(f.commands.filter(command => command.phase === "request-resume").length, 3);
  f.state.exited = true; await f.runner.observeOriginalGenerationEnded(); assert.equal(f.state.mutationCalls, 0);
});
void test("lost original resume acknowledgment consumes once and preserves the already delivered next pause for generation closure", async () => {
  const f = await fixture(); f.state.lostResume = true; await f.runner.arm(); f.runner.consumeBeforeInvocation(); f.state.invoked = true;
  await assert.rejects(f.runner.collect(), /lost original resume/u); const failure = f.runner.diagnostics().firstFailure;
  await assert.rejects(f.runner.collect()); await assert.rejects(f.runner.cleanup()); assert.deepEqual(f.runner.diagnostics().firstFailure, failure);
  assert.equal(f.commands.filter(command => command.phase === "request-resume").length, 1);
  assert.equal(f.commands.some(command => command.phase === "request-release"), false);
  f.state.exited = true; await f.runner.observeOriginalGenerationEnded(); assert.equal(f.runner.diagnostics().retired, true);
});
void test("lost original allocation acknowledgment cannot grant a second arm or cleanup release", async () => {
  const f = await fixture(); f.state.failPhase = "request-driver-arm";
  await assert.rejects(f.runner.arm(), /lost native/u); assert.equal(f.runner.diagnostics().uncertainAllocation, true);
  await assert.rejects(f.runner.arm()); await assert.rejects(f.runner.cleanup(), /GENERATION_CLOSURE_REQUIRED/u);
  assert.equal(f.commands.length, 1); f.state.exited = true; await f.runner.observeOriginalGenerationEnded();
});
void test("uninvoked collector can retire after exact original breakpoint removal without native continuation", async () => {
  const f = await fixture(); await f.runner.arm(); await assert.rejects(f.runner.collect());
  await f.runner.cleanup(); assert.equal(f.commands.filter(command => command.phase === "request-remove").length, 4);
  assert.equal(f.commands.filter(command => command.phase === "request-resume").length, 0); assert.equal(f.runner.diagnostics().retired, true);
});

void test("request plan scalar, UTF-8 and escaped original helper envelope are bounded before any command", async () => {
  const f = requestCollectorFixture(); const Constructor = await collectorConstructor(f);
  for (const dataStr of ["x".repeat(16_385), "😀".repeat(4097), "\u0001".repeat(6000)]) {
    assert.throws(() => new Constructor(f.token, { ...syntheticRequestPlan, dataStr })); assert.equal(f.commands.length, 0);
  }
});
void test("completion schedule retains the actual final PB pause and original group without a fourth resume", async () => {
  const f = await fixture(); await f.runner.armForCompletion(); await assert.rejects(f.runner.arm());
  f.runner.consumeBeforeInvocation(); f.state.invoked = true;
  await assert.rejects(f.runner.collect(), /COMPLETION_SCHEDULE_REQUIRED/u);
  const packet = await f.runner.collectToHeldFinalPb();
  assert.equal(packet.originalFinalPbStillHeld, true); assert.equal(packet.nativeSqlCompletionVerified, false); assert.equal(packet.executionAuthorized, false);
  assert.equal(f.runner.diagnostics().phase, "held-final-pb"); assert.equal(f.runner.diagnostics().normalRequests, 23);
  assert.equal(f.runner.diagnostics().cleanupRequests, 7);
  assert.equal(f.commands.filter(command => command.phase === "request-resume").length, 3);
  assert.equal(f.commands.filter(command => command.phase === "request-remove").length, 4);
  const original = f.runner.heldFinalPbBindings(packet);
  assert.equal(original.finalPbFrameId, "frame-3"); assert.equal(original.sqlObjectId, "sql"); assert.equal(original.actorObjectId, "actor");
  assert.equal(f.runner.heldFinalPbBindings(packet), original); await original.assertOriginal();
  assert.throws(() => f.runner.heldFinalPbBindings(structuredClone(packet)), /ORIGINAL_HELD_PACKET/u);
  await assert.rejects(f.runner.collectToHeldFinalPb());
  await assert.rejects(f.runner.cleanup(), /GENERATION_CLOSURE_REQUIRED/u);
  assert.equal(f.commands.some(command => command.phase === "request-release"), false);
  assert.equal(f.commands.filter(command => command.phase === "request-resume").length, 3);
  assert.throws(() => f.runner.heldFinalPbBindings(packet));
  f.state.exited = true; await f.runner.observeOriginalGenerationEnded(); assert.equal(f.runner.diagnostics().retired, true);
});
void test("held completion cannot be selected after ordinary arming or consumed invocation", async () => {
  const f = await fixture(); await f.runner.arm(); await assert.rejects(f.runner.collectToHeldFinalPb(), /COMPLETION_NOT_PREPARED/u);
  await assert.rejects(f.runner.armForCompletion(), /ARM_CONSUMED/u);
  f.runner.consumeBeforeInvocation(); f.state.invoked = true;
  const packet = await f.runner.collect(); assert.equal(packet.allFourPausesResumed, true); await f.runner.cleanup();
});
void test("atomic completion transfer consumes exact held owner before any resume and revokes every retained old alias", async () => {
  const f = await fixture(); await f.runner.armForCompletion(); f.runner.consumeBeforeInvocation(); f.state.invoked = true;
  const packet = await f.runner.collectToHeldFinalPb();
  const count = f.commands.length, old = f.runner.heldFinalPbBindings(packet);
  assert.throws(() => f.runner.transferHeldFinalPb(structuredClone(packet), f.token), /ORIGINAL_HELD_PACKET/u);
  assert.throws(() => f.runner.transferHeldFinalPb(packet, Object.freeze({ ...f.token })), /ORIGINAL_TRANSFER_ORIGIN/u);
  assert.equal(f.runner.transferHeldFinalPb(packet, f.token), old);
  assert.equal(f.runner.diagnostics().phase, "completion-transferred");
  assert.throws(() => f.runner.heldFinalPbBindings(packet)); await assert.rejects(old.assertOriginal());
  assert.throws(() => f.runner.transferHeldFinalPb(packet, f.token));
  await assert.rejects(f.runner.cleanup(), /COMPLETION_OWNS_GENERATION/u);
  f.state.exited = true; await assert.rejects(f.runner.observeOriginalGenerationEnded(), /COMPLETION_OWNS_GENERATION/u);
  assert.equal(f.commands.length, count); assert.equal(f.state.retired, false); assert.equal(f.state.groupReleased, false);
});
