/** Actual maintained cache program in synthetic VM graphs, original full-SQL
 * comparisons and host callbacks. No connected ownership or reopen proof. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CurrentFootprintCopyV2SavedReadRunner, currentFootprintCopyV2SavedReadPacketSchema } from "../src/current-footprint-copy-v2-saved-read-runner.ts";
import { currentFootprintCopyV2SavedTarget } from "../src/current-footprint-copy-v2-saved-source.ts";
import type { CurrentFootprintCopySourceReadTransport } from "../src/current-footprint-copy-source-read-runner.ts";
import { prepareCurrentFootprintSourcePlan } from "../src/current-footprint-source-plan.ts";
import { CLIENT, IDENTITY, PROJECT, REQUEST, STATE, TARGET, nativeSavedCache, nativeSavedReply, savedFixture, stateReply } from "./helpers/current-footprint-copy-v2-saved-fixture.ts";

function owned(input: Awaited<ReturnType<typeof savedFixture>>, firstCacheActor = true, secondCacheActor = firstCacheActor): Readonly<{
  runner: CurrentFootprintCopyV2SavedReadRunner; transport: CurrentFootprintCopySourceReadTransport; calls: string[];
  first: ReturnType<typeof nativeSavedCache>; second: ReturnType<typeof nativeSavedCache>; current: { value: boolean; loseAfterRead: boolean };
}> {
  const calls: string[] = [], current = { value: true, loseAfterRead: false };
  const first = nativeSavedCache(input, firstCacheActor), second = nativeSavedCache(input, secondCacheActor); let reads = 0;
  const transport: CurrentFootprintCopySourceReadTransport = {
    assertOriginalState: async state => { await Promise.resolve(); assert.equal(state, STATE, "original state"); assert.ok(current.value, "owner lost"); },
    observeState: async (): Promise<unknown> => { calls.push("state"); await Promise.resolve(); return stateReply(); },
    readSource: async request => {
      calls.push("source"); assert.deepEqual(request, REQUEST); reads += 1;
      const result = await nativeSavedReply(reads === 1 ? first : second);
      if (current.loseAfterRead) { current.value = false; }
      return result;
    },
  };
  return { runner: new CurrentFootprintCopyV2SavedReadRunner(transport, STATE, input.projection), transport, calls, first, second, current };
}

void test("saved-copy runner reads both actor projections and equal clocks through the fixed cache program", async () => {
  for (const equal of [false, true]) {
    const input = await savedFixture(equal);
    assert.deepEqual(currentFootprintCopyV2SavedTarget(input.projection), { projectUuid: PROJECT, branchUuid: IDENTITY.branchUuid, footprintUuid: TARGET });
    // Copied omitted-user headers and equal timestamps deliberately remain
    // Outside the generic source-plan profile; no generic guard is relaxed.
    await assert.rejects(prepareCurrentFootprintSourcePlan(input.after, { projectUuid: PROJECT, branchUuid: IDENTITY.branchUuid, footprintUuid: TARGET }));
    for (const cache of [false, true]) {
      const selected = owned(input, cache);
      const packet = await selected.runner.observe();
      assert.equal(packet.matchedProjection, cache ? "current-footprint-chunk-cache" : "complete-raw-history");
      assert.equal(packet.request.client, CLIENT); assert.equal(packet.canvasRecords, 4); assert.equal(packet.tombstones, 1);
      assert.deepEqual(selected.calls, ["state", "source", "state", "state", "source", "state"]);
      assert.equal(runInContext("vendorCalls", selected.first) as unknown, 0);
      assert.equal(runInContext("matches.length", selected.first) as unknown, 1);
      assert.deepEqual(currentFootprintCopyV2SavedReadPacketSchema.parse(packet), packet);
      assert.equal(await selected.runner.requireOriginal(packet), packet);
      await assert.rejects(selected.runner.requireOriginal(structuredClone(packet)), /original completed/u);
      await assert.rejects(selected.runner.observe(), /consumed/u);
      for (const field of ["cacheBranchObserved", "producerBindingVerified", "executionAuthorized", "completionProved",
        "generationClosureVerified", "persistentUploadReplayExcluded", "reopened", "persistenceVerified"]) {
        assert.equal(currentFootprintCopyV2SavedReadPacketSchema.safeParse({ ...packet, [field]: true }).success, false);
      }
    }
  }
});

void test("saved-copy cache program refuses partial and extra actor shapes and runner rejects foreign actors", async () => {
  const input = await savedFixture(true);
  for (const actor of [{ uuid: TARGET, username: "partial" }, { uuid: TARGET, nickname: "", username: "" },
    { uuid: `${TARGET}\n` }, { uuid: "4".repeat(32) }, { uuid: "4".repeat(32), username: "", nickname: "", avatar: "extra" }]) {
    const vm = nativeSavedCache(input, true);
    runInContext(`manager.data[selected.footprintUuid].modifier=${JSON.stringify(actor)}`, vm);
    await assert.rejects(nativeSavedReply(vm), /REFUSED/u);
    assert.equal(runInContext("matches.length", vm) as unknown, 0);
  }
  for (const actor of [{ uuid: "d".repeat(16) }, { uuid: "d".repeat(32), username: "synthetic-user", nickname: "Synthetic" }]) {
    const selected = owned(input, true);
    runInContext(`manager.data[selected.footprintUuid].modifier=${JSON.stringify(actor)};consistency.docHead[selected.footprintUuid].user=${JSON.stringify(actor)}`, selected.first);
    await assert.rejects(selected.runner.observe(), /REFUSED|differs/u);
    assert.equal(selected.runner.status().phase, "failed");
    await assert.rejects(selected.runner.observe(), /consumed/u);
  }
});

void test("saved-copy runner rejects changing valid projections and preserves stale source replies", async () => {
  const input = await savedFixture();
  const changed = owned(input, false, true);
  await assert.rejects(changed.runner.observe(), /paired saved samples differ/u);
  assert.equal(changed.runner.retainedReplies().length, 6);
  const stale = owned(input); stale.current.loseAfterRead = true;
  await assert.rejects(stale.runner.observe(), /owner lost/u);
  assert.equal(stale.runner.retainedReplies().length, 2); assert.deepEqual(stale.calls, ["state", "source"]);
  stale.current.value = true; await assert.rejects(stale.runner.observe(), /consumed/u);
  const completed = owned(input), packet = await completed.runner.observe(); completed.current.value = false;
  await assert.rejects(completed.runner.requireOriginal(packet), /owner lost/u);
  assert.equal(completed.runner.status().phase, "failed"); completed.current.value = true;
  await assert.rejects(completed.runner.requireOriginal(packet), /original completed/u);
  assert.equal(completed.calls.length, 6);
});

void test("saved-copy runner refuses copied projection/state, changed transport and malformed retained content", async () => {
  const input = await savedFixture(), selected = owned(input);
  assert.throws(() => new CurrentFootprintCopyV2SavedReadRunner(selected.transport, STATE, structuredClone(input.projection)), /original/u);
  assert.throws(() => new CurrentFootprintCopyV2SavedReadRunner(selected.transport, { ...STATE, maximumTicket: 101 }, input.projection), /state and/u);
  const copiedState = new CurrentFootprintCopyV2SavedReadRunner(selected.transport, structuredClone(STATE), input.projection);
  await assert.rejects(copiedState.observe(), /original state/u); assert.deepEqual(selected.calls, []);
  const malformed = owned(input);
  Object.defineProperty(malformed.transport, "readSource", { value: (): Promise<unknown> => Promise.resolve({ result: { type: "string", value: "not-json" } }) });
  const malformedRunner = new CurrentFootprintCopyV2SavedReadRunner(malformed.transport, STATE, input.projection);
  await assert.rejects(malformedRunner.observe(), /JSON|Unexpected/u); assert.equal(malformedRunner.retainedReplies().length, 2);
  await assert.rejects(malformed.runner.observe(), /transport changed/u); assert.deepEqual(malformed.calls, ["state"]);
  let traps = 0;
  const proxy = new Proxy(selected.transport, { getPrototypeOf(): object { traps += 1; return Object.prototype; }, ownKeys(): string[] { traps += 1; return []; } });
  assert.throws(() => new CurrentFootprintCopyV2SavedReadRunner(proxy, STATE, input.projection), /plain original transport/u); assert.equal(traps, 0);
});
