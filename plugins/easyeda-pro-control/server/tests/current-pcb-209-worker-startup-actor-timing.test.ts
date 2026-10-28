/** Synthetic original transport and native Date replies. No EasyEDA process. */
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { CurrentPcb209StartupActorCollection, currentPcb209StartupActorCollectionPacketSchema } from "../src/current-pcb-209-worker-startup-actor-runner.ts";
import { CURRENT_PCB_209_STARTUP_ACTOR_TIMING as TIMING } from "../src/current-pcb-209-worker-startup-actor-timing.ts";
import { CurrentPcbWorkerStartupActorRunner, currentPcbWorkerStartupActorPacketSchema } from "../src/current-pcb-worker-startup-actor-runner.ts";
import { currentPcb209WorkerStartupActorPacketSchema, requireCurrentPcb209OriginalStartupActorObservation } from "../src/current-pcb-209-worker-startup-actor.ts";
import type { CurrentPcbWorkerStartupActorTransport } from "../src/current-pcb-worker-startup-actor-runner.ts";

const identity = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "synthetic" });
function fixture(options: Readonly<{ times?: readonly number[]; zoneAtEnd?: boolean; phaseAtEnd?: boolean; afterRead?: () => void }> = {}):
Readonly<{ transport: CurrentPcbWorkerStartupActorTransport; reads: () => number }> {
  let count = 0;
  const user = { uuid: "f".repeat(32), nickname: "nick", username: "user", avatar: "" };
  const actor = { uuid: user.uuid, username: user.username, nickname: user.nickname };
  const read = (phase: "ui" | "worker"): Promise<unknown> => {
    const milliseconds = 1_700_000_000_000 + (options.times?.[count] ?? 0);
    const stamp = { milliseconds, iso: new Date(milliseconds).toISOString(), timezoneOffsetMinutes: options.zoneAtEnd === true && count === 3 ? 60 : 0 };
    const selected = options.phaseAtEnd === true && count === 3 ? "worker" : phase;
    count += 1; options.afterRead?.();
    return Promise.resolve({ result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.pcb-worker-startup-actor.v1",
      phase: selected, identity, workerUser: user, workerUserText: JSON.stringify(user), clock: { before: stamp, after: stamp },
      ...(selected === "ui" ? { cachedActor: actor, startupActor: actor } : { originalProjectReceiverMatched: true, originalWorkerBusMatched: true }),
    }) } });
  };
  return { transport: Object.freeze({ observeUi: (): Promise<unknown> => read("ui"), observeWorker: (): Promise<unknown> => read("worker"),
    assertCurrent: (): Promise<void> => Promise.resolve() }), reads: (): number => count };
}
void test("209 fixed35-request availability accepts a new30s collection while legacy10s packet still refuses", async () => {
  assert.equal(TIMING.collectionMs, 70_000); assert.equal(TIMING.nativeRequests, 35); assert.equal(TIMING.requestMs, 2000);
  const times = [0, 10_000, 20_572, 29_766];
  const old = new CurrentPcbWorkerStartupActorRunner(fixture({ times }).transport, identity);
  await assert.rejects(old.observe(), /paired local clock bracket/u); assert.equal(old.retainedSamples().length, 4);
  const current = new CurrentPcb209StartupActorCollection(fixture({ times }).transport, identity), packet = await current.observe();
  assert.equal(currentPcb209StartupActorCollectionPacketSchema.safeParse(packet).success, true);
  assert.equal(currentPcbWorkerStartupActorPacketSchema.safeParse(packet).success, false);
  await requireCurrentPcb209OriginalStartupActorObservation(Object.freeze({ runner: current, packet }));
  await assert.rejects(current.requireOriginal(structuredClone(packet)), /original completed packet/u);
  await assert.rejects(current.observe(), /attempt consumed/u);
  const { timingProfile: _timing, collectionElapsedMs: _elapsed, packetSha256: _sha, ...oldBody } = packet;
  const reprofiled = { ...oldBody, profile: "private.current-pcb-worker-startup-actor-packet.v1" };
  assert.equal(currentPcbWorkerStartupActorPacketSchema.safeParse({ ...reprofiled, packetSha256: sha256Json(reprofiled) }).success, false);
});
void test("209 pairing still rejects backwards clocks, zones, sequence and periods above its fixed bound", async () => {
  for (const options of [{ times: [0, 20, 19, 30] }, { times: [0, 1, 2, 70_001] }, { zoneAtEnd: true }, { phaseAtEnd: true }]) {
    const runner = new CurrentPcb209StartupActorCollection(fixture(options).transport, identity);
    await assert.rejects(runner.observe()); assert.equal(runner.status().phase, "failed");
    await assert.rejects(runner.observe(), /attempt consumed/u);
  }
});
void test("209 monotonic deadline consumes the attempt and retains the arrived sample before owner refusal", async context => {
  let now = 100;
  context.mock.method(performance, "now", (): number => now);
  const f = fixture({ afterRead: (): void => { now += TIMING.collectionMs + 1; } });
  const runner = new CurrentPcb209StartupActorCollection(f.transport, identity);
  await assert.rejects(runner.observe(), /monotonic deadline/u);
  assert.equal(f.reads(), 1); assert.equal(runner.retainedSamples().length, 1); assert.equal(runner.status().phase, "failed");
  await assert.rejects(runner.observe(), /attempt consumed/u);
});
void test("209 journal keeps old valid packet decoding distinct from new timing evidence", async () => {
  const old = await new CurrentPcbWorkerStartupActorRunner(fixture().transport, identity).observe();
  const current = await new CurrentPcb209StartupActorCollection(fixture().transport, identity).observe();
  for (const originalActorPacket of [old, current]) {
    const body = { profile: "private.current-pcb209-worker-startup-actor.v1", sourceClosureSha256: "c".repeat(64), originalActorPacket,
      originalConstructorOwnerVerified: false, nativeSourceContextsOwned: false, nativeIntrinsicsVerified: false, clockProvenanceVerified: false,
      futureSaveClockVerified: false, compatibilityAdmitted: false, executionAuthorized: false, saveAuthorized: false };
    assert.equal(currentPcb209WorkerStartupActorPacketSchema.safeParse({ ...body, packetSha256: sha256Json(body) }).success, true);
  }
  const { packetSha256: _hash, ...body } = current;
  const late = { ...body, collectionElapsedMs: TIMING.collectionMs + 1 };
  assert.equal(currentPcb209StartupActorCollectionPacketSchema.safeParse({ ...late, packetSha256: sha256Json(late) }).success, false);
});
