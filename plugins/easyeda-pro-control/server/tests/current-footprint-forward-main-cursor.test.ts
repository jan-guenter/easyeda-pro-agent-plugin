/** Actual main construction/request/completion private issuers and cursor.
 * External source/native capacity are synthetic; no writer-born native owner,
 * Windows process, structure lease or execution authority is issued here. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate as waitImmediate } from "node:timers/promises";
import { currentFootprintCopyExecutionGenerationSchema } from "../src/current-footprint-copy-execution.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE, currentFootprintForwardExecutionGenerationSchema } from "../src/current-footprint-forward-execution-contract.ts";
import { mainBackendModule, mainBackendTransportFixture } from "./helpers/footprint-main-backend-runner-fixture.ts";
import { unarmedMainCompletionOriginFixture } from "./helpers/footprint-main-completion-origin-fixture.ts";

/** Advance the actual retained collector and completion to its cleanup edge.
 * The fixture supplies only source/native transport replies, never a cursor. */
async function collected(retirementGate?: Promise<void>): Promise<Readonly<{
  fixture: Awaited<ReturnType<typeof unarmedMainCompletionOriginFixture>>;
  cursor: ReturnType<Awaited<ReturnType<typeof unarmedMainCompletionOriginFixture>>["backend"]["issueForwardMainCursor"]>;
  completion: InstanceType<Awaited<ReturnType<typeof unarmedMainCompletionOriginFixture>>["Completion"]>;
}>> {
  const fixture = await unarmedMainCompletionOriginFixture(retirementGate);
  const cursor = fixture.backend.issueForwardMainCursor();
  assert.equal(fixture.module.requireCursor(cursor, fixture.backend).phase, "request");
  assert.throws(() => fixture.module.requireUploadSettlement(cursor, fixture.backend), /UPLOAD_UNSETTLED/u);
  await fixture.collector.armForCompletion(); fixture.collector.consumeBeforeInvocation(); fixture.requestState.invoked = true;
  const held = await fixture.collector.collectToHeldFinalPb(), origin = await fixture.backend.issueCompletionOrigin(fixture.capability, held);
  assert.equal(fixture.module.requireCursor(cursor, fixture.backend).phase, "completion");
  const completion = new fixture.Completion(origin); await completion.arm(); await completion.collect();
  assert.throws(() => fixture.module.requireUploadSettlement(cursor, fixture.backend), /UPLOAD_UNSETTLED/u);
  return { fixture, cursor, completion };
}

void test("writer v2 generation data stays distinct from both released read-only forward and legacy execution purposes", () => {
  const input = { profile: "private.current-footprint-forward-execution-generation.v2", purpose: CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE,
    operationId: "footprint-forward-execution-source-only", bindingSha256: "a".repeat(64) };
  assert.deepEqual(currentFootprintForwardExecutionGenerationSchema.parse(input), input);
  assert.equal(currentFootprintCopyExecutionGenerationSchema.safeParse(input).success, false);
  for (const purpose of ["worker-startup-footprint-forward209", "worker-startup-footprint-copy209", "worker-startup-footprint-combined209"]) {
    assert.equal(currentFootprintForwardExecutionGenerationSchema.safeParse({ ...input, purpose }).success, false);
  }
  assert.equal(currentFootprintForwardExecutionGenerationSchema.safeParse({ ...input, executionReady: true }).success, false);
  assert.equal(currentFootprintForwardExecutionGenerationSchema.safeParse({ ...input,
    operationId: `footprint-forward-execution-${"a".repeat(96)}` }).success, false);
});

void test("original cursor captures one construction with no dispatch and rejects copied tokens and foreign issuers", async () => {
  const module = await mainBackendModule();
  const fixture = mainBackendTransportFixture(), runner = new module.Constructor(fixture.transport);
  assert.throws(() => runner.issueForwardMainCursor(), /CONSTRUCTION_REQUIRED/u);
  const construction = await runner.observe(), dispatched = fixture.commands.length;
  const cursor = runner.issueForwardMainCursor();
  assert.equal(runner.issueForwardMainCursor(), cursor); assert.equal(fixture.commands.length, dispatched);
  const snapshot = module.requireCursor(cursor, runner);
  assert.equal(snapshot.construction, construction); assert.equal(snapshot.issuer, runner); assert.equal(snapshot.phase, "construction");
  assert.equal(snapshot.executionAuthorized, false); assert.equal(snapshot.sequentialStructureAdmissionAvailable, false);
  assert.equal(Object.isFrozen(snapshot), true);
  for (const copied of [{ ...cursor }, structuredClone(cursor), Object.create(cursor)] as unknown[]) {
    assert.throws(() => Reflect.apply(module.requireCursor, undefined, [copied, runner]), /CURSOR_ORIGINAL/u);
  }
  assert.throws(() => module.requireCursor(cursor, new module.Constructor(mainBackendTransportFixture().transport)), /CURSOR_ORIGINAL/u);
  assert.throws(() => module.requireUploadSettlement(cursor, runner), /UPLOAD_UNSETTLED/u);
  await runner.release(); assert.equal(module.requireCursor(cursor, runner).phase, "released");
});

void test("one original pending retirement blocks sequential settlement until its exact acknowledgment without enabling structure", async () => {
  const gate = Promise.withResolvers<undefined>();
  const f = await collected(gate.promise);
  const cleanup = f.completion.cleanup(), deadline = performance.now() + 2000;
  while (f.fixture.native.retireCount === 0) { assert.ok(performance.now() < deadline, "Original retirement was not reached"); await waitImmediate(); }
  const pending = f.fixture.module.requireCursor(f.cursor, f.fixture.backend);
  assert.equal(pending.busy, true); assert.equal(pending.uploadRetirementAcknowledged, false);
  assert.throws(() => f.fixture.module.requireUploadSettlement(f.cursor, f.fixture.backend), /UPLOAD_UNSETTLED/u);
  // oxlint-disable-next-line unicorn/no-useless-undefined -- This strictly typed undefined gate requires its explicit fulfillment argument and carries no evidence value.
  gate.resolve(undefined); await cleanup;
  const settled = f.fixture.module.requireUploadSettlement(f.cursor, f.fixture.backend);
  assert.equal(settled.phase, "upload-settled"); assert.equal(settled.uploadRetirementAcknowledged, true);
  assert.equal(settled.pendingReplies, 0); assert.equal(settled.pendingEvents, 0); assert.equal(settled.paused, false);
  assert.equal(settled.sequentialStructureAdmissionAvailable, false); assert.equal(settled.executionAuthorized, false);
  const sends = f.fixture.native.sends;
  await assert.rejects(f.fixture.backend.issueStructureLease(f.fixture.capability, settled.construction), /STRUCTURE_ORIGINAL/u);
  assert.equal(f.fixture.native.sends, sends); assert.equal(f.fixture.native.retireCount, 1);
  await f.fixture.backend.release(); assert.throws(() => f.fixture.module.requireUploadSettlement(f.cursor, f.fixture.backend), /UPLOAD_UNSETTLED/u);
});

void test("lost upload retirement and later original exit retain failure rather than minting a successful sequential cursor", async () => {
  const f = await collected(); f.fixture.native.lostRetire = true;
  await assert.rejects(f.completion.cleanup(), /lost original retirement/u);
  const failed = f.fixture.module.requireCursor(f.cursor, f.fixture.backend);
  assert.equal(failed.phase, "failed"); assert.equal(failed.uploadRetirementAcknowledged, false);
  f.fixture.native.exited = true; await f.completion.observeOriginalGenerationEnded();
  assert.equal(f.fixture.native.retireCount, 1); assert.equal(f.fixture.module.requireCursor(f.cursor, f.fixture.backend).phase, "failed");
  assert.throws(() => f.fixture.module.requireUploadSettlement(f.cursor, f.fixture.backend), /UPLOAD_UNSETTLED/u);
});

void test("an original cleanup reply with a buffered UTF-8 prefix cannot claim sequential framing quiescence", async () => {
  const f = await collected(); f.fixture.native.incompleteUtf8Release = true;
  await assert.rejects(f.completion.cleanup(), /COMPLETION_ORIGINAL_CLEANUP_INCOMPLETE/u);
  const snapshot = f.fixture.module.requireCursor(f.cursor, f.fixture.backend);
  assert.equal(snapshot.uploadRetirementAcknowledged, false); assert.equal(snapshot.pendingReplies, 0);
  assert.equal(snapshot.pendingEvents, 0); assert.equal(snapshot.paused, false); assert.equal(snapshot.busy, false);
  assert.equal(snapshot.incompleteFrame, true); assert.equal(snapshot.phase, "failed");
  assert.throws(() => f.fixture.module.requireUploadSettlement(f.cursor, f.fixture.backend), /UPLOAD_UNSETTLED/u);
  assert.equal(f.fixture.native.retireCount, 0); assert.equal(f.completion.diagnostics().retired, false);
  f.fixture.native.exited = true; await f.completion.observeOriginalGenerationEnded();
  assert.equal(f.fixture.native.retireCount, 1); assert.equal(f.completion.diagnostics().retired, true);
  assert.throws(() => f.fixture.module.requireUploadSettlement(f.cursor, f.fixture.backend), /UPLOAD_UNSETTLED/u);
});
