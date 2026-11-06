/** Actual v2 factory/main/capability/origin and paired constructor. External
 * source collectors and helper are synthetic; no native writer is admitted. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { reserveCurrentFootprintCopyMainRequestPlan } from "../src/current-footprint-copy-main-request-plan.ts";
import { requireOriginalCurrentFootprintForwardPairedClock } from "../src/current-pcb-diagnostic-owner.ts";
import { forwardMainAuthorityFixture } from "./helpers/forward-main-authority-fixture.ts";
import { syntheticRequestPlan } from "./helpers/footprint-main-request-collector-fixture.ts";
import { savedFixture } from "./helpers/current-footprint-copy-v2-saved-fixture.ts";

void test("genuine v2 paired constructor requires an issued late reservation and arms its original main once", async context => {
  const data = await savedFixture(), f = await forwardMainAuthorityFixture(context, "paired-original", true, "ordinary", data.copy);
  const capability = await f.capabilityApi.issueCurrentFootprintForwardExecutionMainCapability(f.provider);
  const origin = await f.main.issueForwardExecutionRequestOrigin(capability, f.construction);
  const before = f.factory.state.writes;
  assert.throws(() => Reflect.construct(f.Scheduler, [f.main, capability, origin, syntheticRequestPlan]), /ORIGINAL_LATE_RESERVATION/u);
  assert.equal(f.factory.state.writes, before);
  const reservation = reserveCurrentFootprintCopyMainRequestPlan(data.copy, {
    projectUuid: data.copy.source.projectUuid, branchUuid: data.copy.source.branchUuid, projectKey: data.copy.source.projectUuid, path: "synthetic-original-closed-source",
  }, { minimum: 1_700_000_000_000, maximum: 1_700_000_000_010 });
  const foreign = await savedFixture(), foreignReservation = reserveCurrentFootprintCopyMainRequestPlan(foreign.copy, {
    projectUuid: foreign.copy.source.projectUuid, branchUuid: foreign.copy.source.branchUuid, projectKey: foreign.copy.source.projectUuid, path: "synthetic-other-source",
  }, { minimum: 1_700_000_000_000, maximum: 1_700_000_000_010 });
  assert.throws(() => new f.Scheduler(f.main, capability, origin, foreignReservation), /ORIGINAL_PAIRED_COPY/u);
  assert.throws(() => Reflect.construct(f.Scheduler, [f.main, { ...capability }, origin, reservation]), /CAPABILITY/u);
  assert.throws(() => Reflect.construct(f.Scheduler, [f.main, capability, { ...origin }, reservation]), /FORWARD_REQUEST_ORIGINAL_OWNER/u);
  const scheduler = new f.Scheduler(f.main, capability, origin, reservation);
  await scheduler.armMain(); assert.equal(scheduler.diagnostics()["phase"], "main-armed");
  assert.equal(f.factory.state.actions.filter(action => action === "main-request-send").length, 4);
  await assert.rejects(scheduler.armMain(), /PHASE/u);
  const writes = f.factory.state.writes;
  const foreignClock = { profile: "private.current-footprint-clock-rpc-origin.v1" };
  // oxlint-disable-next-line typescript/unbound-method -- Supply deliberately invalid data to this exact retained receiver; no caller function is admitted by production.
  assert.throws(() => Reflect.apply(scheduler.bindClocks, scheduler, [foreignClock, {}, "a".repeat(16)]), /FORWARD_PAIRED_ORIGINAL_OWNER/u);
  assert.equal(f.factory.state.writes, writes); assert.equal(scheduler.diagnostics()["createDispatchAttempted"], false);
  await assert.rejects(scheduler.dispatchCreate(), /PHASE/u);
});
void test("production cross-owner join rejects copied forward owners and foreign clock JSON before methods or getters", () => {
  let called = false;
  const owner = new Proxy({}, { get: (): never => { called = true; throw new Error("foreign getter"); } });
  assert.throws(() => Reflect.apply(requireOriginalCurrentFootprintForwardPairedClock, undefined, [owner, {}, {}]), /FORWARD_EXECUTION_ORIGINAL_BIRTH/u);
  assert.equal(called, false);
});
