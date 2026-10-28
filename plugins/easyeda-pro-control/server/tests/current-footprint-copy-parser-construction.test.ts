import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COPY_CONSTRUCTION_SITES, CURRENT_FOOTPRINT_COPY_CONSTRUCTION_TIMING } from "../src/current-footprint-copy-parser-construction.ts";
import { CurrentFootprintCopyConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import { footprintCopyConstructionFixtureSource } from "./helpers/current-pcb-209-worker-construction-fixture.ts";
import { footprintCopyConstructionInspector } from "./helpers/current-pcb-worker-construction-inspector.ts";

async function retain(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original promise remains the asserted operation.
  }
}
const SETUP = 'PROJECT.uuid="a".repeat(64);PROJECT._branchUuid="b".repeat(32);globalThis._TAB_ID_="window_1";class bb{};PROJECT.cache=new bb;PROJECT.localCache=new bb;';

void test("separate copy fixture retains the exact registration source and executable offsets", () => {
  const source = footprintCopyConstructionFixtureSource();
  for (const key of ["parserHead", "parserChange"] as const) {
    const site = CURRENT_FOOTPRINT_COPY_CONSTRUCTION_SITES[key];
    const body = source.slice(site.start, site.end);
    assert.equal(Buffer.byteLength(body), site.bytes);
    assert.equal(createHash("sha256").update(body).digest("hex"), site.sha256);
    const lines = source.slice(0, site.offset).split("\n");
    assert.equal(lines.length - 1, site.lineNumber); assert.equal(lines.at(-1)?.length, site.columnNumber);
  }
});
void test("original parser registration and upload construction compose through actual V8 identities", { timeout: 30_000 }, async context => {
  const peer = await footprintCopyConstructionInspector(context), runner = new CurrentFootprintCopyConstructionRunner(peer.transport);
  const start = peer.commands.length;
  const capture = runner.capture(); void retain(capture); await runner.whenArmed(); const running = peer.run(); void retain(running);
  const packet = await capture; await running;
  assert.equal(packet.pauses, 11); assert.deepEqual(peer.counts(), { pauses: 11, resumes: 11 });
  assert.equal(peer.commands.slice(start).filter(method => method !== "Runtime.runScript").length, CURRENT_FOOTPRINT_COPY_CONSTRUCTION_TIMING.captureRequests);
  await peer.syntheticEvaluate(SETUP); await runner.proveProjectIdentity(packet);
  const assignments = await runner.proveCurrentAssignments(packet), state = await runner.observeFootprintState(packet, assignments);
  const observing = peer.commands.length;
  const callbacks = await runner.observeFootprintRegisteredAsync(packet, assignments, state);
  assert.equal(peer.commands.length - observing, 19);
  assert.equal(callbacks.parserArrowReceiversVerified, true); assert.equal(callbacks.uploadArrowReceiverVerified, true);
  assert.equal(callbacks.originalParserRegistrationArgumentsMatched, true); assert.equal(callbacks.callbacksCompleted, false);
  await assert.rejects(runner.requireFootprintRegisteredAsync(packet, assignments, state, { ...callbacks }), /ORIGINAL_REGISTERED_ASYNC/u);
  const checking = peer.commands.length; await runner.requireFootprintRegisteredAsync(packet, assignments, state, callbacks);
  assert.equal(peer.commands.length - checking, 6);
  assert.throws(() => { runner.stopConstructionPauseSubscription({ ...packet }); }, /CONSTRUCTION_HANDOFF/u);
  runner.stopConstructionPauseSubscription(packet);
  assert.equal(runner.retainedParserRegistration()["subscriptionStopped"], true);
  await runner.requireCurrentAssignments(packet, assignments);
  assert.throws(() => { runner.stopConstructionPauseSubscription(packet); }, /CONSTRUCTION_HANDOFF/u);
  await runner.release();
});
void test("same-source parser callback from another genuine Lg instance cannot replace the original registration", { timeout: 30_000 }, async context => {
  const peer = await footprintCopyConstructionInspector(context), runner = new CurrentFootprintCopyConstructionRunner(peer.transport);
  const capture = runner.capture(); void retain(capture); await runner.whenArmed(); const running = peer.run(); void retain(running);
  const packet = await capture; await running; await peer.syntheticEvaluate(SETUP);
  await runner.proveProjectIdentity(packet); const assignments = await runner.proveCurrentAssignments(packet);
  const state = await runner.observeFootprintState(packet, assignments);
  await peer.syntheticEvaluate('PROJECT.consistencyManager.headCbArr[0]=new (Object.getPrototypeOf(PROJECT).constructor)({},PROJECT.workerBus).consistencyManager.headCbArr[0];void 0;');
  await assert.rejects(runner.observeFootprintRegisteredAsync(packet, assignments, state));
  assert.equal(runner.status().failed, true); await runner.release();
});
