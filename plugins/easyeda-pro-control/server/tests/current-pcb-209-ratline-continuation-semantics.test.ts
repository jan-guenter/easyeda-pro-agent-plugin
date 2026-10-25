import assert from "node:assert/strict";
import { test } from "node:test";
import type { z } from "zod";
import { sha256Text } from "../src/core.ts";
import { currentPcb209RatlineContinuationCapturesAgree as agree,
  currentPcb209RatlineContinuationMatchesTarget as matchesTarget } from "../src/current-pcb-209-ratline-continuation-semantics.ts";
import { currentPcb209RatlineContinuationNativePacketSchema as packetSchema } from "../src/current-pcb-209-ratline-continuation-packet-schema.ts";
import { captureCurrentPcb209RatlineOriginEvidence, inspectCurrentPcb209RatlineOriginEvidence } from "../src/current-pcb-209-ratline-origin-observation.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE as sources } from "../src/current-pcb-209-ratline-source.ts";

const rawWindowsPath = String.raw`C:\Disposable\SemanticJoin.eprj2`;
const target = { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "d".repeat(16),
  branchUuid: "b".repeat(32), expectedSourceSha256: "c".repeat(64) };
const originalWindow = "original-window";
const world = { projectUuid: target.projectUuid, documentUuid: target.documentUuid,
  tabId: `${target.documentUuid}@${target.projectUuid}`, windowTabId: originalWindow };
const payload = JSON.stringify({ ratlineRes: [], workerName: 17 });
const pcb = { nativeWorkerId: 17, resultPayload: payload, world: null };
// A subordinate belongs to the worker's registry, so this ID deliberately differs.
const worker = { nativeWorkerId: 41, resultPayload: payload, world };

void test("semantic joins match canonical publication and the original target without equating registry-local IDs", () => {
  assert.equal(agree(pcb, worker), true);
  assert.equal(matchesTarget(pcb, worker, target, originalWindow), true);
  assert.equal(agree(pcb, { ...worker, nativeWorkerId: Number.MAX_SAFE_INTEGER }), true);
  assert.equal(matchesTarget(pcb, { ...worker, nativeWorkerId: 0 }, target, originalWindow), true);
  assert.equal(agree({ ...pcb, nativeWorkerId: 41 }, worker), false);
  const different = JSON.stringify({ ratlineRes: [], workerName: 18 });
  assert.equal(agree(pcb, { ...worker, resultPayload: different }), false);
  assert.equal(agree({ ...pcb, resultPayload: different }, { ...worker, resultPayload: different }), false);
});

void test("semantic joins reject malformed, noncanonical and nonempty payloads and invalid local IDs", () => {
  for (const resultPayload of ["", "null", "[]", "{", '{"workerName":17,"ratlineRes":[]}',
    '{"ratlineRes":[], "workerName":17}', '{"ratlineRes":[],"workerName":17,"workerName":17}',
    '{"ratlineRes":[1],"workerName":17}', '{"ratlineRes":[],"workerName":"17"}',
    '{"ratlineRes":[],"workerName":-0}', '{"ratlineRes":[],"workerName":9007199254740992}',
    '{"ratlineRes":[],"workerName":17,"extra":true}', " ".repeat(257)]) {
    assert.equal(agree({ ...pcb, resultPayload }, { ...worker, resultPayload }), false, resultPayload);
  }
  for (const nativeWorkerId of [-1, -0, 1.5, Infinity, Number.NaN, Number.MAX_SAFE_INTEGER + 1, "17", null]) {
    assert.equal(agree({ ...pcb, nativeWorkerId }, worker), false);
    assert.equal(agree(pcb, { ...worker, nativeWorkerId }), false);
  }
  assert.equal(agree({ ...pcb, world }, worker), false);
  assert.equal(agree(pcb, { ...worker, world: null }), false);
});

void test("target joins reject foreign document, project, tab or window without treating durable consistency as authority", () => {
  for (const changed of [
    { ...world, documentUuid: "e".repeat(16), tabId: `${"e".repeat(16)}@${world.projectUuid}` },
    { ...world, projectUuid: "e".repeat(64), tabId: `${world.documentUuid}@${"e".repeat(64)}` },
    { ...world, windowTabId: "another-window" },
  ]) {
    assert.equal(agree(pcb, { ...worker, world: changed }), true);
    assert.equal(matchesTarget(pcb, { ...worker, world: changed }, target, originalWindow), false);
  }
  for (const tabId of ["tab", world.projectUuid, `${world.projectUuid}@${world.documentUuid}`, `${world.tabId}@extra`]) {
    assert.equal(agree(pcb, { ...worker, world: { ...world, tabId } }), false);
  }
  assert.equal(matchesTarget(pcb, worker, target, "another-window"), false);
  assert.equal(matchesTarget(pcb, worker, target, ""), false);
  assert.equal(matchesTarget(pcb, worker, { ...target, projectUuid: "e".repeat(64) }, originalWindow), false);
  assert.equal(matchesTarget(pcb, worker, { ...target, documentUuid: "e".repeat(16) }, originalWindow), false);
});

void test("semantic checks reject accessors, proxies and malformed captures without invoking supplied hooks", () => {
  let hooks = 0;
  const accessor = Object.defineProperty({ ...worker }, "world", { enumerable: true, get: (): typeof world => { hooks += 1; return world; } });
  const proxy = new Proxy(worker, { get: (): never => { hooks += 1; throw new Error("must not run"); } });
  const selected = Object.defineProperty({ ...target }, "projectUuid", { enumerable: true, get: (): string => { hooks += 1; return target.projectUuid; } });
  for (const malformed of [accessor, proxy, null, [], { ...worker, extra: undefined }]) {
    assert.equal(agree(pcb, malformed), false);
    assert.equal(matchesTarget(pcb, malformed, target, originalWindow), false);
  }
  assert.equal(matchesTarget(pcb, worker, selected, originalWindow), false);
  assert.equal(hooks, 0);
});

function fixture(): z.infer<typeof packetSchema> {
  const denied = { nativeWorkerTargetIdentityVerified: false, callbackReturnCompletionVerified: false,
    completeLiveBaselineVerified: false, executionAuthorized: false };
  const sourceFlags = { completeImportedSourceQualified: true, importedSourceHeldBeforeExecution: true,
    nativeWorkerTargetIdentityVerified: false, continuousInstallationLeaseVerified: false, executionAuthorized: false };
  const pcbSource = { profile: "private.pcb209-ratline-pcb-bootstrap.v1", sessionId: "pcb-session", parentTargetId: "pcb-target",
    frameId: "pcb-frame", contextId: 1, uniqueContextId: "pcb-context", origin: "https://client", frameUrl: "https://client/editor?entry=pcb",
    scriptId: "pcb-script", ...sourceFlags, nativeFrameAncestryVerified: false };
  const workerSource = { profile: "private.pcb209-ratline-bootstrap.v1", childTargetId: "worker-target", childSessionId: "worker-session",
    scriptId: "worker-script", uniqueContextId: "worker-context", ...sourceFlags };
  const subordinateSource = { ...workerSource, childTargetId: "subordinate-target", childSessionId: "subordinate-session",
    scriptId: "subordinate-script", uniqueContextId: "subordinate-context" };
  const nativeOriginEvidence = captureCurrentPcb209RatlineOriginEvidence({ metadata: { parentDebuggerId: "pcb-debugger", childDebuggerId: "worker-debugger",
    childUniqueContextId: workerSource.uniqueContextId, childScriptId: workerSource.scriptId, childUrl: "https://client/editor?entry=pcb-ratline-worker.js",
    parentSessionId: pcbSource.sessionId, parentScriptId: pcbSource.scriptId }, firstPause: {}, constructorBefore: {}, constructorAfter: {}, stackReply: null });
  const composite = (role: "pcb" | "worker"): Record<string, unknown> => {
    const child = role === "pcb" ? workerSource : subordinateSource;
    return { profile: "private.current-pcb209-ratline-composite.v1", role,
      construction: { profile: "private.current-pcb209-ratline-creation-boundary.v1", role, sourceSha256: sources[role].sha256,
        constructorBoundaryObserved: true, soleWaitingChildObserved: true, requestedUrlSha256: "a".repeat(64),
        childTargetId: child.childTargetId, childSessionId: child.childSessionId, parentHeldAfterConstruction: true,
        nativeWorkerTargetIdentityVerified: false, childSourceQualified: false, executionAuthorized: false },
      capture: { ...(role === "pcb" ? pcb : worker), profile: `private.current-pcb209-ratline-${role}-capture.v1`, sourceSha256: sources[role].sha256,
        pauses: role === "pcb" ? 5 : 9, originalFactoryAndBridgeEventsRetained: true, originalTerminalReturnPauseRetained: true,
        ...denied, subscribedCanvasPeerOwnershipVerified: false, copperCompletionVerified: false },
      originalConstructionAndBridgeWorkerMatch: true, originalConstructionAndRegistryMatch: true, childStartConsumedOnce: true,
      nativePreexecutionSourceOwnershipVerified: false, childSourceQualified: false, ...denied,
      subscribedCanvasPeerOwnershipVerified: false, copperCompletionVerified: false };
  };
  const retirement = { sourceSha256: sources.worker.sha256, parentPauseSha256: "a".repeat(64), sourceSealedBeforeParentResume: true,
    originalParentResumeObserved: true, originalDetachObserved: true, contextDestroyedObserved: false,
    nativeWorkerTargetIdentityVerified: false, executionAuthorized: false };
  return packetSchema.parse({ profile: "private.pcb209-ratline-native-continuation.v1", targetSha256: "a".repeat(64),
    originalProjectConstructionSha256: "b".repeat(64), pcbNavigationAcknowledged: true, ...denied, completeStartupVerified: false, saveAuthorized: false,
    continuation: { profile: "private.pcb209-ratline-fresh-continuation.v1", pcbSource, workerSource, subordinateSource,
      pcb: composite("pcb"), worker: composite("worker"),
      subordinate: { profile: "private.pcb209-ratline-subordinate-continuation.v1", source: subordinateSource,
        sourceResumeAcknowledged: true, sourceResumeObserved: true, ...denied },
      retirements: {
        worker: { ...retirement, role: "worker", boundary: "pcb-received", parentSessionId: pcbSource.sessionId,
          childSessionId: workerSource.childSessionId, childTargetId: workerSource.childTargetId },
        subordinate: { ...retirement, role: "subordinate", boundary: "worker-initialized", parentSessionId: workerSource.childSessionId,
          childSessionId: subordinateSource.childSessionId, childTargetId: subordinateSource.childTargetId },
      }, nativeOrigin: inspectCurrentPcb209RatlineOriginEvidence(nativeOriginEvidence), nativeOriginEvidence,
      allThreeOriginalSourcesQualified: true, ...denied, subscribedCanvasPeerOwnershipVerified: false, copperCompletionVerified: false,
      completeStartupVerified: false, saveAuthorized: false } });
}

void test("durable packets reject cross-capture mismatches while keeping target authority separate", () => {
  const original = fixture(); const continuation = original.continuation;
  assert.equal(original.nativeWorkerTargetIdentityVerified, false);
  assert.equal(original.executionAuthorized, false);
  assert.notEqual(continuation.pcb.capture.nativeWorkerId, continuation.worker.capture.nativeWorkerId);
  for (const [role, change] of [
    ["pcb", { nativeWorkerId: 41 }], ["worker", { resultPayload: JSON.stringify({ ratlineRes: [], workerName: 41 }) }],
    ["worker", { world: { ...world, tabId: "foreign-tab" } }],
  ] as const) {
    assert.equal(packetSchema.safeParse({ ...original, continuation: { ...continuation,
      [role]: { ...continuation[role], capture: { ...continuation[role].capture, ...change } } } }).success, false);
  }
  // An opaque target digest is not a source of the original target or window.
  const foreign = { ...worker, world: { ...world, windowTabId: "foreign-window" } };
  assert.equal(packetSchema.safeParse({ ...original, continuation: { ...continuation,
    worker: { ...continuation.worker, capture: { ...continuation.worker.capture, ...foreign } } } }).success, true);
  assert.equal(matchesTarget(pcb, foreign, target, originalWindow), false);
});

void test("durable retirement evidence remains bound to each exact source, parent, role and pause boundary", () => {
  const original = fixture(); const continuation = original.continuation;
  for (const role of ["worker", "subordinate"] as const) {
    for (const change of [{ parentSessionId: "foreign" }, { childSessionId: "foreign" }, { childTargetId: "foreign" },
      { sourceSha256: "f".repeat(64) }, { role: role === "worker" ? "subordinate" : "worker" },
      { boundary: role === "worker" ? "worker-initialized" : "pcb-received" },
      { originalParentResumeObserved: false }, { originalDetachObserved: false }, { nativeWorkerTargetIdentityVerified: true }]) {
      assert.equal(packetSchema.safeParse({ ...original, continuation: { ...continuation,
        retirements: { ...continuation.retirements, [role]: { ...continuation.retirements[role], ...change } } } }).success, false);
    }
  }
});
