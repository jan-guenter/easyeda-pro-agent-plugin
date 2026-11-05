/** Original factory/capability/publication custody with synthetic source and
 * inspector collectors. This cut intentionally offers no native main writer. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate as nextTurn } from "node:timers/promises";
import { loadOperation, updateOperation } from "../src/artifacts.ts";
import { syntheticRequestPlan } from "./helpers/footprint-main-request-collector-fixture.ts";
import { forwardMainAuthorityFixture } from "./helpers/forward-main-authority-fixture.ts";

void test("v2 main capability requires the original factory, completed construction and settled managed source", async context => {
  const f = await forwardMainAuthorityFixture(context, "original");
  const before = f.owner.status().forwardResources?.generation; assert.ok(before !== undefined);
  assert.equal(before.mainRequests, f.main.retained().requests);
  const capability = await f.capabilityApi.issueCurrentFootprintForwardExecutionMainCapability(f.provider);
  assert.equal(capability.executionAuthorized, false); assert.equal(Object.isFrozen(capability), true);
  assert.equal(f.capabilityApi.requireCurrentFootprintForwardExecutionMainNativeOwner(capability, f.main, "normal"), f.owner);
  await f.capabilityApi.reproveCurrentFootprintForwardExecutionMainPublication(capability, f.main);
  await assert.rejects(f.capabilityApi.issueCurrentFootprintForwardExecutionMainCapability(f.provider), /CAPABILITY_CONSUMED/u);
  for (const copied of [{ ...capability }, structuredClone(capability), Object.create(capability)] as unknown[]) {
    assert.equal(f.capabilityApi.isCurrentFootprintForwardExecutionMainCapability(copied), false);
    assert.throws(() => Reflect.apply(f.capabilityApi.requireCurrentFootprintForwardExecutionMainNativeOwner, undefined, [copied, f.main, "normal"]), /CAPABILITY/u);
  }
  let trapped = false;
  const proxy = new Proxy(capability, { get: (): never => { trapped = true; throw new Error("Do not read caller capability properties"); } });
  assert.throws(() => f.capabilityApi.requireCurrentFootprintForwardExecutionMainNativeOwner(proxy, f.main, "normal"), /CAPABILITY/u);
  assert.equal(trapped, false); assert.equal(f.owner.status().forwardResources?.generation.mainRequests, before.mainRequests);
});
void test("unpublished v2 source and copied providers cannot issue main authority", async context => {
  const f = await forwardMainAuthorityFixture(context, "unpublished", false); const writes = f.factory.state.writes;
  await assert.rejects(f.capabilityApi.issueCurrentFootprintForwardExecutionMainCapability(f.provider), /SOURCE_NOT_PUBLISHED/u);
  const copied: unknown = Reflect.apply(f.capabilityApi.issueCurrentFootprintForwardExecutionMainCapability, undefined, [{ ...f.provider }]);
  assert.ok(copied instanceof Promise); await assert.rejects(copied);
  assert.equal(f.factory.state.writes, writes); assert.equal(f.main.retained().requestOriginIssued, false);
});
void test("v2 authority is bound to one genuine main runner and legacy origin getters remain strict", async context => {
  const f = await forwardMainAuthorityFixture(context, "separate-origins");
  const capability = await f.capabilityApi.issueCurrentFootprintForwardExecutionMainCapability(f.provider);
  const origin = await f.main.issueForwardExecutionRequestOrigin(capability, f.construction);
  assert.equal(origin.profile, "private.current-footprint-forward-main-request-origin.v2");
  const binding = f.mainApi.requireCurrentFootprintForwardMainRequestOrigin(origin); assert.equal(binding.scriptId, "app");
  assert.throws(() => Reflect.apply(f.mainApi.requireCurrentFootprintCopyMainRequestOrigin, undefined, [origin]), /REQUEST_ORIGINAL_LEASE_REQUIRED/u);
  assert.throws(() => Reflect.construct(f.requestApi.CurrentFootprintCopyMainRequestRunner, [origin, syntheticRequestPlan]), /REQUEST_ORIGINAL_LEASE_REQUIRED/u);
  assert.throws(() => Reflect.apply(f.capabilityApi.requireCurrentFootprintForwardExecutionMainNativeOwner, undefined, [capability, {}, "normal"]), /CAPABILITY/u);
  const collector = f.requestApi.createCurrentFootprintForwardMainRequestRunner(origin, syntheticRequestPlan);
  assert.throws(() => f.requestApi.createCurrentFootprintForwardMainRequestRunner(origin, syntheticRequestPlan), /FORWARD_ENGINE_CONSUMED/u);
  await collector.armForCompletion();
  assert.equal(collector.diagnostics().phase, "armed"); assert.equal(collector.diagnostics().uncertainAllocation, false);
  assert.equal(f.factory.state.actions.filter(action => action === "main-request-send").length, 4);
  assert.equal(f.owner.status().forwardResources?.generation.mainRequests, f.main.retained().requests);
  await collector.cleanup();
  const afterRefusal = f.factory.state.writes;
  await assert.rejects(binding.request({ phase: "request-resume", method: "Debugger.resume", params: {} }, true));
  assert.equal(f.factory.state.writes, afterRefusal);
});
void test("managed source drift revokes main publication reproof before any original main origin can issue", async context => {
  const f = await forwardMainAuthorityFixture(context, "publication-drift");
  const capability = await f.capabilityApi.issueCurrentFootprintForwardExecutionMainCapability(f.provider);
  const writes = f.factory.state.writes;
  const record = f.journal.retained().records[0]; assert.ok(record !== undefined);
  const operation = await loadOperation(record.operationId);
  await updateOperation({ ...operation, plan: { ...operation.plan, syntheticDrift: true } });
  await assert.rejects(f.capabilityApi.reproveCurrentFootprintForwardExecutionMainPublication(capability, f.main));
  assert.equal(f.factory.state.writes, writes); assert.equal(f.main.retained().requestOriginIssued, false);
});
void test("capability publication rechecks incomplete UTF8 after the second original publication await", async context => {
  const f = await forwardMainAuthorityFixture(context, "postawait-cursor"); f.gate.holdAt = 2;
  const pending = assert.rejects(f.capabilityApi.issueCurrentFootprintForwardExecutionMainCapability(f.provider), /ORIGINAL_CONSTRUCTION_CURSOR/u);
  await f.gate.entered.promise;
  try { f.injectPartialFrame(); await f.main.reprove(f.construction); }
  finally { f.gate.release.resolve(null); }
  await pending; assert.equal(f.main.retained().requestOriginIssued, false);
});
void test("the original native poll retains its allocated ID before cumulative-accounting refusal", async context => {
  const f = await forwardMainAuthorityFixture(context, "poll-accounting", true, "bad-accounting");
  const capability = await f.capabilityApi.issueCurrentFootprintForwardExecutionMainCapability(f.provider);
  const origin = await f.main.issueForwardExecutionRequestOrigin(capability, f.construction);
  const collector = f.requestApi.createCurrentFootprintForwardMainRequestRunner(origin, syntheticRequestPlan);
  await assert.rejects(collector.armForCompletion(), /MAIN_ACCOUNTING/u);
  const retained = collector.diagnostics();
  assert.equal(retained.phase, "failed"); assert.equal(retained.replies, 1); assert.equal(retained.uncertainAllocation, false);
  assert.equal(f.factory.state.actions.filter(action => action === "main-request-send").length, 1);
  assert.equal(retained.groupReleased, false);
  const writes = f.factory.state.writes;
  await assert.rejects(collector.armForCompletion(), /ARM_CONSUMED/u);
  await assert.rejects(f.capabilityApi.reproveCurrentFootprintForwardExecutionMainPublication(capability, f.main));
  assert.equal(f.factory.state.writes, writes);
});
void test("an original allocation poll reply after helper deadline retains cleanup custody without a replacement poll", async context => {
  const f = await forwardMainAuthorityFixture(context, "poll-late", true, "held-allocation");
  const capability = await f.capabilityApi.issueCurrentFootprintForwardExecutionMainCapability(f.provider);
  const origin = await f.main.issueForwardExecutionRequestOrigin(capability, f.construction);
  const binding = f.mainApi.requireCurrentFootprintForwardMainRequestOrigin(origin);
  const collector = f.requestApi.createCurrentFootprintForwardMainRequestRunner(origin, syntheticRequestPlan);
  const stopped = assert.rejects(collector.armForCompletion(), /HELPER_DEADLINE/u);
  await f.waitForAllocationPoll(); await stopped;
  const first = collector.diagnostics().firstFailure;
  assert.equal(collector.diagnostics().uncertainAllocation, true);
  const polls = f.factory.state.actions.filter(action => action === "main-poll").length;
  await assert.rejects(binding.settleAllocation());
  assert.equal(f.factory.state.actions.filter(action => action === "main-poll").length, polls);
  f.releaseHeldAllocationPoll();
  const deadline = AbortSignal.timeout(5000);
  while (collector.diagnostics().replies === 0 && !deadline.aborted) { await nextTurn(); }
  assert.equal(collector.diagnostics().replies, 1); assert.equal(collector.diagnostics().uncertainAllocation, false);
  assert.deepEqual(collector.diagnostics().firstFailure, first);
  assert.equal(collector.diagnostics().phase, "failed"); assert.equal(collector.diagnostics().groupReleased, false);
  const writes = f.factory.state.writes;
  await assert.rejects(collector.armForCompletion(), /ARM_CONSUMED/u);
  assert.equal(f.factory.state.writes, writes);
});
