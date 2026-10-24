import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES, CURRENT_PCB_209_WORKER_STARTUP_SPANS } from "../src/current-pcb-209-worker-startup-profile.ts";
import { inspectCurrentPcb209WorkerStartupSource } from "../src/current-pcb-209-worker-startup-source.ts";
import { CurrentPcb209WorkerConstructionRunner, CurrentPcbWorkerConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import type { CurrentPcb209WorkerConstructionPacket } from "../src/current-pcb-worker-construction-runner.ts";
import { decodeCurrentPcbWorkerStartupActor } from "../src/current-pcb-worker-startup-actor.ts";
import { worker209ConstructionFixtureSource } from "./helpers/current-pcb-209-worker-construction-fixture.ts";
import { construction209Inspector, constructionInspector } from "./helpers/current-pcb-worker-construction-inspector.ts";

async function observeFailure(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The awaited original promise reports the failure.
  }
}
const PROJECT_SETUP = `PROJECT.uuid="a".repeat(64);PROJECT._branchUuid="b".repeat(32);globalThis._TAB_ID_="window_1";
PROJECT.workerBus.uuid="12345678-1234-4234-8234-123456789abc";PROJECT.isReady=true;
PROJECT.user={uuid:"f".repeat(32),nickname:"nick",username:"user",avatar:"avatar"};`;

void test("generation209 inert spans retain exact source bytes and real breakpoint coordinates without fullsource admission", () => {
  const source = worker209ConstructionFixtureSource(true);
  for (const [name, span] of Object.entries(CURRENT_PCB_209_WORKER_STARTUP_SPANS)) {
    const body = source.slice(span.start, span.end);
    assert.equal(Buffer.byteLength(body), span.bytes, name);
    assert.equal(createHash("sha256").update(body).digest("hex"), span.sha256, name);
  }
  for (const [name, site] of Object.entries(CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES)) {
    const before = source.slice(0, site.offset).split("\n");
    assert.equal(before.length - 1, site.lineNumber, name); assert.equal(before.at(-1)?.length, site.columnNumber, name);
  }
  const report = inspectCurrentPcb209WorkerStartupSource(source);
  assert.ok(report.spans.every(span => span.matches)); assert.ok(report.locations.every(location => location.matches));
  assert.equal(report.completeSourceMatches, false); assert.equal(report.sourceProfileMatches, false);
  assert.equal(report.originalWorkerOwnershipVerified, false); assert.equal(report.executionAuthorized, false);
  assert.throws(() => inspectCurrentPcb209WorkerStartupSource({}), /SOURCE_INPUT/u);
});

void test("generation209 actual constructor events retain assignments, identity, channel gates and two worker actor samples", { timeout: 30_000 }, async context => {
  const peer = await construction209Inspector(context, 0, true), runner = new CurrentPcb209WorkerConstructionRunner(peer.transport);
  const capture = runner.capture(); void observeFailure(capture); await runner.whenArmed();
  const running = peer.run(); void observeFailure(running); const packet = await capture; await running;
  assert.equal(packet.profile, "private.current-pcb209-worker-construction.v1");
  assert.deepEqual(peer.counts(), { pauses: 9, resumes: 9 });
  assert.equal(Object.keys(await runner.requireOriginal(packet)).length, 9);
  await assert.rejects(runner.requireOriginal(structuredClone(packet)), /ORIGINAL_PACKET/u);
  await peer.syntheticEvaluate(PROJECT_SETUP);
  const identity = await runner.proveProjectIdentity(packet);
  const assignments = await runner.proveCurrentAssignments(packet);
  await runner.requireProjectIdentity(packet, identity); await runner.requireCurrentAssignments(packet, assignments);
  const before = peer.commands.length, channel = await runner.observeCurrentChannel(packet, assignments);
  assert.equal(peer.commands.length - before, 20); assert.equal(channel.currentPublisherMethodRelationsQualified, true);
  assert.equal(channel.nativeChannelIntrinsicAndPeerOwnershipVerified, false); assert.equal(channel.executionAuthorized, false);
  await runner.requireCurrentChannel(packet, assignments, channel);
  for (let count = 0; count < 2; count += 1) {
    assert.equal(decodeCurrentPcbWorkerStartupActor(await runner.observeActorClock(packet, assignments)).phase, "worker");
  }
  await assert.rejects(runner.observeActorClock(packet, assignments), /ACTOR_SAMPLES_CONSUMED/u);
  await assert.rejects(runner.observeCurrentChannel(packet, assignments), /CHANNEL_CONSUMED/u);
  await peer.syntheticEvaluate("PROJECT.workerBus.bc.onmessage=()=>{};");
  await assert.rejects(runner.requireCurrentChannel(packet, assignments, channel));
  assert.equal(runner.status().failed, true); await runner.release();
});

void test("generation209 owner loss during an actual original pause still cleans up and resumes once", { timeout: 30_000 }, async context => {
  const peer = await construction209Inspector(context, 5), runner = new CurrentPcb209WorkerConstructionRunner(peer.transport);
  const capture = runner.capture(), refused = assert.rejects(capture); await runner.whenArmed(); const running = peer.run();
  await refused; await running;
  assert.deepEqual(peer.counts(), { pauses: 5, resumes: 5 }); assert.equal(runner.status().paused, false);
  assert.equal(runner.status().unresolvedBreakpoints, false); await runner.release();
});

void test("fixed generation constructors refuse the other generation's actual script coordinates", { timeout: 30_000 }, async context => {
  const legacy = await constructionInspector(context);
  const current = await construction209Inspector(context);
  const wrong209 = new CurrentPcb209WorkerConstructionRunner(legacy.transport), wrongLegacy = new CurrentPcbWorkerConstructionRunner(current.transport);
  for (const runner of [wrong209, wrongLegacy]) {
    await assert.rejects(runner.capture(), /BREAKPOINT_RELOCATED/u);
    assert.equal(runner.status().unresolvedBreakpoints, false); await runner.release();
  }
  assert.deepEqual(legacy.counts(), { pauses: 0, resumes: 0 }); assert.deepEqual(current.counts(), { pauses: 0, resumes: 0 });
});

void test("matching supplied209 packet fields cannot adopt an original legacy constructor owner", { timeout: 30_000 }, async context => {
  const peer = await constructionInspector(context);
  const legacy = new CurrentPcbWorkerConstructionRunner(peer.transport);
  const capture = legacy.capture(); void observeFailure(capture); await legacy.whenArmed(); const running = peer.run();
  const oldPacket = await capture; await running;
  const current = new CurrentPcb209WorkerConstructionRunner(peer.transport);
  const supplied: CurrentPcb209WorkerConstructionPacket = { ...oldPacket, profile: "private.current-pcb209-worker-construction.v1" };
  const before = peer.commands.length;
  await assert.rejects(current.requireOriginal(supplied), /ORIGINAL_PACKET/u);
  assert.equal(peer.commands.length, before); await legacy.release();
});
