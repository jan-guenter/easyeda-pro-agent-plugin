/** Actual owner/factory/ledger paths with synthetic SQL and inert Node helper
 * seams. These cases prove no Windows ownership, copy, replay or saved result. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { combinedReadyFactoryFixture } from "./helpers/current-footprint-combined-ready-fixture.ts";

void test("closed forward observation binds fresh saved traffic to the original ledger without writer authority", { timeout: 30_000 }, async context => {
  const f = await combinedReadyFactoryFixture("resource-traffic", "forward", true);
  const writer = await f.api.startCurrentFootprintCopyForwardNativeOwner(f.options);
  context.after(async () => { if (f.child().exitCode === null) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  const after = Object.freeze({ syntheticClosedSqlOnly: true });
  f.seedSyntheticClosedSnapshot(writer, after);
  await assert.rejects(f.api.startCurrentFootprintCopyForwardSavedObservationOwner(writer, after), /RELEASE_REQUIRED/u);
  assert.equal(f.api.currentFootprintCopyForwardSavedObservationAllocationOutcome(writer).status, "not-attempted");
  for (let index = 0; index < 250; index += 1) { await writer.syntheticForwardRequestForTest({ action: "worker-startup-reprove" }); }
  await writer.releaseUnlaunched();
  await assert.rejects(f.api.startCurrentFootprintCopyForwardSavedObservationOwner(writer, { ...after }));
  assert.equal(f.api.currentFootprintCopyForwardSavedObservationAllocationOutcome(writer).status, "not-attempted");
  const saved = await f.api.startCurrentFootprintCopyForwardSavedObservationOwner(writer, after);
  f.api.assertOriginalCurrentFootprintCopyForwardSavedNativeOwner(saved);
  assert.equal(saved.status().profile, "worker-startup-footprint-saved209");
  assert.equal(saved.status().forwardResources?.counters.boundGenerations, 2);
  assert.equal(saved.originalFootprintSourceBinding().before, after);
  const before = f.state.writes;
  const opening: unknown = Reflect.apply(saved.openFootprintCopySavedProject.bind(saved), saved, [{}, {}]);
  assert.ok(opening instanceof Promise);
  await assert.rejects(opening, /FORWARD_SAVED_OBSERVATION_OPEN_UNAVAILABLE/u);
  assert.equal(f.state.writes, before);
  // Writer controls must not consume the separate saved helper's normal reserve.
  for (let index = 0; index < 25; index += 1) { await saved.syntheticForwardRequestForTest({ action: "worker-startup-reprove" }); }
  await saved.syntheticForwardRequestForTest({ action: "send", requestId: 1, method: "Browser.getVersion" });
  await saved.syntheticForwardRequestForTest({ action: "poll" });
  const resources = saved.status().forwardResources; assert.ok(resources !== undefined);
  assert.equal(resources.counters.rendererRequests, 1); assert.equal(resources.counters.rendererPolls, 1);
  assert.equal(resources.counters.controls, 276); assert.ok(resources.counters.rendererBytes > 0);
  assert.equal(resources.nativeWriterMounted, false); assert.equal(resources.counters.executionAuthorized, false);
  const outcome = f.api.currentFootprintCopyForwardSavedObservationAllocationOutcome(writer);
  assert.equal(outcome.status, "retained"); assert.equal(outcome.owner, saved);
  await assert.rejects(f.api.startCurrentFootprintCopyForwardSavedObservationOwner(writer, after), /ALLOCATION_CONSUMED/u);
  await saved.releaseUnlaunched();
  assert.equal(saved.observeFootprintCopyRelease(), "released");
  assert.equal(saved.status().forwardResources?.counters.controls, 277);
  assert.equal(writer.status().forwardResources?.counters.boundGenerations, 2);
});

void test("saved observation handoff and original owner cannot be forged from JSON or prototypes", async context => {
  const f = await combinedReadyFactoryFixture("ready", "forward", true);
  const writer = await f.api.startCurrentFootprintCopyForwardNativeOwner(f.options);
  context.after(async () => { if (f.child().exitCode === null) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
  assert.throws(() => { Reflect.construct(f.api.CurrentFootprintCopyForwardSavedNativeOwner, [f.child(), (): Promise<void> => Promise.resolve(), {}, Object.freeze({})]); }, /FORWARD_SAVED_HANDOFF/u);
  const prototype: unknown = Object.getPrototypeOf(writer); assert.ok(prototype !== null && typeof prototype === "object");
  const copied: unknown = Object.create(prototype);
  const refused: unknown = Reflect.apply(f.api.startCurrentFootprintCopyForwardSavedObservationOwner, undefined, [copied, {}]);
  assert.ok(refused instanceof Promise); await assert.rejects(refused, /ORIGINAL/u);
  assert.equal(f.state.writes, 0);
  await writer.releaseUnlaunched();
});

for (const mode of ["saved-admission-failure", "saved-spawn-refusal"] as const) {
  void test(`saved observation allocation retains the original ${mode} outcome without retry`, async context => {
    const f = await combinedReadyFactoryFixture(mode, "forward", true);
    const writer = await f.api.startCurrentFootprintCopyForwardNativeOwner(f.options);
    context.after(async () => { if (f.child().exitCode === null) { const closed = once(f.child(), "close"); f.child().stdin.end(); await closed; } });
    await writer.releaseUnlaunched();
    const after = Object.freeze({ syntheticClosedSqlOnly: true }); f.seedSyntheticClosedSnapshot(writer, after);
    await assert.rejects(f.api.startCurrentFootprintCopyForwardSavedObservationOwner(writer, after), /Synthetic saved/u);
    const result = f.api.currentFootprintCopyForwardSavedObservationAllocationOutcome(writer);
    assert.equal(result.status, mode === "saved-admission-failure" ? "no-resource" : "unresolved");
    assert.equal(result.owner, null); const writes = f.state.writes;
    await assert.rejects(f.api.startCurrentFootprintCopyForwardSavedObservationOwner(writer, after), /ALLOCATION_CONSUMED/u);
    assert.equal(f.state.writes, writes);
  });
}
