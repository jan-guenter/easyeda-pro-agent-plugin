import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcbWorkerConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import { constructionInspector } from "./helpers/current-pcb-worker-construction-inspector.ts";

async function retainRejection(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original awaited operation retains this failure.
  }
}
const PROJECT_SETUP = `PROJECT.uuid="a".repeat(64);PROJECT._branchUuid="b".repeat(32);globalThis._TAB_ID_="window_1";
PROJECT.workerBus.uuid="12345678-1234-4234-8234-123456789abc";PROJECT.isReady=true;`;

void test("actual constructor capture privately binds channel, callbacks and publisher methods in one worker", { timeout: 30_000 }, async context => {
  const peer = await constructionInspector(context, 0, true), runner = new CurrentPcbWorkerConstructionRunner(peer.transport);
  const capture = runner.capture(); void retainRejection(capture); await runner.whenArmed(); const running = peer.run(); void retainRejection(running);
  const packet = await capture; await running; await peer.syntheticEvaluate(PROJECT_SETUP);
  await runner.proveProjectIdentity(packet); const assignments = await runner.proveCurrentAssignments(packet);
  const before = peer.commands.length, channel = await runner.observeCurrentChannel(packet, assignments);
  assert.equal(peer.commands.length - before, 20); assert.equal(channel.originalConstructorChannelRelationsObserved, true);
  assert.equal(channel.currentPublisherMethodRelationsQualified, true); assert.equal(channel.nativeChannelIntrinsicAndPeerOwnershipVerified, false);
  const beforeReproof = peer.commands.length;
  await runner.requireCurrentChannel(packet, assignments, channel); assert.equal(peer.commands.length - beforeReproof, 2);
  await assert.rejects(runner.requireCurrentChannel(packet, assignments, structuredClone(channel)), /ORIGINAL_CHANNEL_PACKET/u);
  await assert.rejects(runner.observeCurrentChannel(packet, assignments), /CHANNEL_CONSUMED/u);
  assert.ok(runner.retainedChannelObservation() !== null);
  await peer.syntheticEvaluate("PROJECT.workerBus.bc.onmessage=()=>{};");
  await assert.rejects(runner.requireCurrentChannel(packet, assignments, channel)); assert.equal(runner.status().failed, true);
  await runner.release();
});

void test("original channel substitution fails before publisher reads and consumes the complete stage", { timeout: 30_000 }, async context => {
  const peer = await constructionInspector(context, 0, true), runner = new CurrentPcbWorkerConstructionRunner(peer.transport);
  const capture = runner.capture(); void retainRejection(capture); await runner.whenArmed(); const running = peer.run(); void retainRejection(running);
  const packet = await capture; await running; await peer.syntheticEvaluate(PROJECT_SETUP);
  await runner.proveProjectIdentity(packet); const assignments = await runner.proveCurrentAssignments(packet);
  await peer.syntheticEvaluate("PROJECT.workerBus.bc={...PROJECT.workerBus.bc};"); const before = peer.commands.length;
  await assert.rejects(runner.observeCurrentChannel(packet, assignments)); assert.equal(peer.commands.length - before, 2);
  const retained = runner.retainedChannelObservation(); assert.ok(retained !== null);
  assert.deepEqual(retained["gateReplies"], []); await assert.rejects(runner.observeCurrentChannel(packet, assignments), /CHANNEL_CONSUMED/u);
  await runner.release();
});
