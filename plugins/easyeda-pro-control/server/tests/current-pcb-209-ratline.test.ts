import assert from "node:assert/strict";
import test from "node:test";
import { inspectCurrentPcb209RatlineTrace } from "../src/current-pcb-209-ratline-model.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE, inspectCurrentPcb209RatlineSource } from "../src/current-pcb-209-ratline-source.ts";

const documentUuid = "b".repeat(16), projectUuid = "a".repeat(64);
function fixture(): { target: { projectUuid: string; documentUuid: string; pcbTargetId: string; pcbSessionId: string };
  milestones: Record<string, unknown>[] } {
  const result = '{"ratlineRes":[],"workerName":0}';
  return { target: { projectUuid, documentUuid, pcbTargetId: "pcb-target", pcbSessionId: "pcb-session" }, milestones: [
    { kind: "initializer", isPreview: false, docType: 3, unRebuildRatline: false, userWorker: true, unActive: false },
    { kind: "startup-created", worker: { targetId: "startup-target", sessionId: "startup-session", parentTargetId: "pcb-target",
      parentSessionId: "pcb-session", nativeWorkerId: 0, parentBridge: "pcb-startup-bridge" } },
    { kind: "startup-entered", projectUuid, documentUuid, targetId: "startup-target", sessionId: "startup-session",
      nativeWorkerId: 0, selfBridge: "startup-self-bridge" },
    { kind: "subordinate-created", worker: { targetId: "sub-target", sessionId: "sub-session", parentTargetId: "startup-target",
      parentSessionId: "startup-session", nativeWorkerId: 0, parentBridge: "startup-sub-bridge" } },
    { kind: "subordinate-settled", targetId: "sub-target", sessionId: "sub-session", nativeWorkerId: 0,
      initialized: true, workItemCount: 0, registryEntryRemoved: true },
    { kind: "result-published", targetId: "startup-target", sessionId: "startup-session", selfBridge: "startup-self-bridge", result },
    { kind: "result-received", parentBridge: "pcb-startup-bridge", result },
    { kind: "handler-returned", result, startupFlags: { useWebgl: false, multiThreadingOnOpen: true, needFlushService: false,
      modelIsBuilt: true, controllerIsBuilt: true, engineHighlightReady: true }, startupRegistryEntryRemoved: true,
      compilerAllowPull: true, copperOpenPcb: true, dynamicCopperWorkers: 0, dynamicCopperTimers: 0 },
  ] };
}

void test("generation209 source research has exact new assets and no compatibility authority", () => {
  assert.equal(CURRENT_PCB_209_RATLINE_SOURCE_PROFILE.application, "3.2.209.8a704eab");
  for (const kind of ["pcb", "worker"] as const) {
    const observed = inspectCurrentPcb209RatlineSource(kind, "");
    assert.equal(observed.completeSourceMatches, false);
    assert.equal(observed.sourceProfileMatches, false);
    assert.equal(observed.compatibilityAdmitted, false);
    assert.equal(observed.executionAuthorized, false);
    assert.equal(observed.spans.every(span => !span.matches), true);
    assert.ok(Object.isFrozen(observed.spans));
  }
  assert.throws(() => inspectCurrentPcb209RatlineSource("pcb", "\uD800"), /SOURCE_INPUT/u);
  assert.throws(() => inspectCurrentPcb209RatlineSource("pcb", {}), /SOURCE_INPUT/u);
  assert.throws(() => inspectCurrentPcb209RatlineSource("pcb", "x".repeat(12 * 1024 * 1024 + 1)), /SOURCE_INPUT/u);
});

void test("supplied complete209 empty-ratline trace is compatible but grants no completion or write proof", () => {
  const observed = inspectCurrentPcb209RatlineTrace(fixture());
  assert.equal(observed.terminalCompatible, true);
  assert.equal(observed.nextMilestone, null);
  assert.equal(observed.receivedMilestones, 8);
  assert.equal(observed.suppliedDataOnly, true);
  assert.equal(observed.originalNativeOwnershipVerified, false);
  assert.equal(observed.startupCallbackCompletionVerified, false);
  assert.equal(observed.completeLiveBaselineVerified, false);
  assert.equal(observed.saveAuthorized, false);
  assert.equal(observed.executionAuthorized, false);
  assert.ok(Object.isFrozen(observed));
});

void test("every proper semantic prefix remains incomplete and identifies the next milestone", () => {
  const source = fixture();
  for (let count = 0; count < source.milestones.length; count += 1) {
    const observed = inspectCurrentPcb209RatlineTrace({ target: source.target, milestones: source.milestones.slice(0, count) });
    assert.equal(observed.terminalCompatible, false);
    assert.equal(observed.nextMilestone, source.milestones[count]?.["kind"]);
  }
});

void test("duplicate, skipped and extra result events cannot create terminal compatibility", () => {
  const duplicate = fixture(); duplicate.milestones[6] = { ...duplicate.milestones[5] };
  assert.throws(() => inspectCurrentPcb209RatlineTrace(duplicate), /TRACE_ORDER/u);
  const skipped = fixture(); skipped.milestones.splice(4, 1);
  assert.throws(() => inspectCurrentPcb209RatlineTrace(skipped), /TRACE_ORDER/u);
  const extra = fixture(); extra.milestones.push({ ...extra.milestones[5] });
  assert.throws(() => inspectCurrentPcb209RatlineTrace(extra));
});

void test("source branch and original selected-world claims must agree", () => {
  const inactive = fixture(); inactive.milestones[0] = { ...inactive.milestones[0], unActive: true };
  assert.throws(() => inspectCurrentPcb209RatlineTrace(inactive));
  const wrongProject = fixture(); wrongProject.milestones[2] = { ...wrongProject.milestones[2], projectUuid: "c".repeat(64) };
  assert.throws(() => inspectCurrentPcb209RatlineTrace(wrongProject), /TRACE_WORLD/u);
  const wrongWorker = fixture(); wrongWorker.milestones[2] = { ...wrongWorker.milestones[2], nativeWorkerId: 1 };
  assert.throws(() => inspectCurrentPcb209RatlineTrace(wrongWorker), /TRACE_WORLD/u);
});

void test("finite worker roles refuse wrong parents, reused sessions and substituted result receivers", () => {
  for (const worker of [
    { targetId: "sub-target", sessionId: "sub-session", parentTargetId: "foreign", parentSessionId: "startup-session" },
    { targetId: "startup-target", sessionId: "sub-session", parentTargetId: "startup-target", parentSessionId: "startup-session" },
    { targetId: "sub-target", sessionId: "pcb-session", parentTargetId: "startup-target", parentSessionId: "startup-session" },
  ]) {
    const value = fixture(); value.milestones[3] = { kind: "subordinate-created", worker: { ...worker, nativeWorkerId: 0, parentBridge: "sub-bridge" } };
    assert.throws(() => inspectCurrentPcb209RatlineTrace(value), /TRACE_SUBORDINATE_PARENT/u);
  }
  const substituted = fixture(); substituted.milestones[6] = { ...substituted.milestones[6], parentBridge: "foreign-bridge" };
  assert.throws(() => inspectCurrentPcb209RatlineTrace(substituted), /TRACE_RECEIVER/u);
});

void test("exact empty result rejects nonempty, duplicate-key and changed-ID payloads", () => {
  for (const result of ['{"ratlineRes":[{}],"workerName":0}', '{"ratlineRes":[],"workerName":1}',
    '{"ratlineRes":[],"workerName":7,"workerName":0}', '{"workerName":0,"ratlineRes":[]}']) {
    const value = fixture(); value.milestones[5] = { ...value.milestones[5], result };
    assert.throws(() => inspectCurrentPcb209RatlineTrace(value), /TRACE_PUBLICATION/u);
  }
  const changed = fixture(); changed.milestones[6] = { ...changed.milestones[6], result: '{"ratlineRes":[],"workerName":1}' };
  assert.throws(() => inspectCurrentPcb209RatlineTrace(changed), /TRACE_RECEIVER/u);
});

void test("209 terminal state requires six current flags and refuses old rebuilding flag or pending effects", () => {
  const flags = { useWebgl: false, multiThreadingOnOpen: true, needFlushService: false,
    modelIsBuilt: true, controllerIsBuilt: true, engineHighlightReady: true };
  for (const startupFlags of [{ ...flags, rebuildingRatlineInWorker: false }, { ...flags, needFlushService: true },
    { ...flags, modelIsBuilt: false }, { ...flags, controllerIsBuilt: false }, { ...flags, multiThreadingOnOpen: false }]) {
    const value = fixture(); value.milestones[7] = { ...value.milestones[7], startupFlags };
    assert.throws(() => inspectCurrentPcb209RatlineTrace(value));
  }
  for (const patch of [{ dynamicCopperWorkers: 1 }, { dynamicCopperTimers: 1 }, { copperOpenPcb: false }, { compilerAllowPull: false }]) {
    const value = fixture(); value.milestones[7] = { ...value.milestones[7], ...patch };
    assert.throws(() => inspectCurrentPcb209RatlineTrace(value));
  }
});

void test("malformed and accessor-backed inputs refuse without evaluating accessors", () => {
  let reads = 0;
  assert.throws(() => inspectCurrentPcb209RatlineTrace({ get target(): unknown { reads += 1; return fixture().target; }, milestones: [] }));
  assert.equal(reads, 0);
  const value = fixture(); value.milestones[0] = { ...value.milestones[0], executionAuthorized: true };
  assert.throws(() => inspectCurrentPcb209RatlineTrace(value));
});
