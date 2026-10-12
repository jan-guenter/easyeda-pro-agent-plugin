/* oxlint-disable import/max-dependencies -- This integration test composes the actual recorder, engine and retained-process fixture with existing navigation contracts. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { ClosedSymbolNavigationStage } from "../src/closed-symbol-navigation.ts";
import { FAMILY, STEPS, appendClosedSymbolEvent, createClosedSymbolJournal, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import type { ClosedJournal, Generation, LaunchGeneration } from "../src/closed-symbol-journal.ts";
import { listOperationStates, loadOperation, updateOperation } from "../src/artifacts.ts";
import { loadReviewedCompatibilityManifest, newOperationId, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { AuthenticatedBridgeDispatchBinding, UpstreamClient } from "../src/engine.ts";
import type { CheckpointReceipt } from "../src/checkpoint.ts";
import { LIBRARY_NATIVE_IMPLEMENTATION } from "../src/library-native-profile.ts";
import { buildRecoveryNavigationCode } from "../src/recovery-navigation.ts";
import { closedSessionFixture } from "./helpers/windows-closed-session-fixture.ts";

type Value = Record<string, unknown>;
const activeUuid = "c".repeat(32), hash = "a".repeat(64), projectUuid = "b".repeat(64), targetUuid = "d".repeat(32);
const projectPath = "/synthetic/closed-navigation.eprj2";
const target = { projectUuid, projectPath, documentUuid: activeUuid, documentType: 3 as const };
const active = { project: { uuid: projectUuid, path: projectPath }, document: { uuid: activeUuid, documentType: 3, tabId: `${activeUuid}@${projectUuid}` } };
const code = buildRecoveryNavigationCode(target, { navigate: true, requireExclusiveTabs: true, requireEditorReadiness: true });
const checkpoint: CheckpointReceipt = { schema: "easyeda-pro-control.checkpoint.v2", source: projectPath, checkpoint: "/synthetic/checkpoint.sqlite", receiptPath: "/synthetic/checkpoint.receipt.json",
  createdAt: "2026-01-01T00:00:00.000Z", sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" }, checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" },
  sourceSha256: hash, checkpointSha256: hash, sourceDumpSha256: hash, checkpointDumpSha256: hash, receiptSha256: hash };
function launchGeneration(value: LaunchGeneration): LaunchGeneration {
  return { ordinal: value.ordinal, helperInstance: value.helperInstance, jobId: value.jobId, rootPid: value.rootPid, rootStartIdentity: value.rootStartIdentity };
}
function fingerprint(): Value {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], runtime = manifest.connectedRuntime;
  return { facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => {
    const projected = { path: `/synthetic/${file.relativePath}` }; return Object.assign(projected, file);
  }) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: runtime.healthVersion, node_version: runtime.nodeVersion, bridge_connected: true, easyeda_version: runtime.easyedaVersion, extension_version: runtime.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: runtime.bridgeVersion, ...(runtime.bridgeEasyedaVersion === null ? {} : { easyeda_version: runtime.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: runtime.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: runtime.dispatcher.source, dispatcher_build_id: runtime.dispatcher.buildId, total: runtime.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: "/synthetic/assets", pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/synthetic/pcb.js" },
      publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/synthetic/api.js", adapterPath: "/synthetic/adapter.js", declarationsPath: "/synthetic/api.d.ts" } } };
}
type StageEngine = ConstructorParameters<typeof ClosedSymbolNavigationStage>[0];
type StageIo = NonNullable<ConstructorParameters<typeof ClosedSymbolNavigationStage>[2]>;
interface FixtureState { nativeCalls: number; contextCalls: number; checkpointCalls: number; checkpointFailAt: number; runtimeDrift: boolean;
  transportFailure: boolean; readinessFailure: boolean; invalidAck: boolean; contextMismatch: boolean; preparedMismatch: boolean;
  sessionDrift: boolean; leaseDrift: boolean; ackOverride: Value | undefined; onBoundary: ((boundary: string) => void) | undefined }
async function fixture(phase: "edit-open" | "verify-open" = "edit-open"): Promise<{ journal: ClosedJournal; stage: ClosedSymbolNavigationStage; state: FixtureState; generation: Generation;
  owner: ReturnType<typeof closedSessionFixture>; engine: StageEngine; dispose: () => Promise<void> }> {
  const owner = closedSessionFixture();
  const launch = await owner.supervisor.launch({ confirmLaunch: true });
  const state: FixtureState = { nativeCalls: 0, contextCalls: 0, checkpointCalls: 0, checkpointFailAt: 0, runtimeDrift: false, transportFailure: false, readinessFailure: false, invalidAck: false, contextMismatch: false, preparedMismatch: false,
    sessionDrift: false, leaseDrift: false, ackOverride: undefined, onBoundary: undefined };
  const identity = fingerprint(), runtime = { kind: "runtime-identity", generation: "synthetic-closed-nav-generation-1", timeOrigin: 1000, processId: 101 };
  const pinned = loadReviewedCompatibilityManifest().installedBundles;
  const session = { gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43), sequence: 1, authenticationReceiptSha256: "2".repeat(64), authenticatedAtEpochMs: 1000 };
  const upstream: UpstreamClient = {
    findTool() { return Promise.resolve({ name: "easyeda_execute" }); },
    bridgeSessionLifecycle() { return { schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: "g".repeat(43),
      activeSession: { sessionId: (state.sessionDrift ? "x" : "s").repeat(43), sequence: 1, authenticationReceiptSha256: "2".repeat(64), authenticatedAtEpochMs: 1000 } }; },
    currentAuthenticatedBridgeDispatchBinding(): AuthenticatedBridgeDispatchBinding { return { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43),
      sessionSequence: 1, begunAtEpochMs: 1001, leaseId: (state.leaseDrift ? "x" : "l").repeat(43), bindingReceipt: "b".repeat(43) }; },
    installedEasyedaBundles: () => Promise.resolve({ available: true, assetsRoot: "/synthetic/assets", pcbEditor: { ...pinned.pcbEditor, implementationPath: "/synthetic/pcb.js" },
      publicApi: { ...pinned.publicApi, implementationPath: "/synthetic/api.js", adapterPath: "/synthetic/adapter.js", declarationsPath: "/synthetic/api.d.ts" } }),
    callTool(name, args, _timeout, lease) {
      assert.equal(name, "easyeda_execute"); assert.ok(lease !== undefined);
      if (args?.["code"] !== code) { return Promise.resolve({ content: [{ type: "text", text: JSON.stringify(state.runtimeDrift ? { ...runtime, generation: "drift" } : runtime) }] }); }
      state.nativeCalls += 1;
      state.onBoundary?.("native-return");
      if (state.transportFailure) { return Promise.reject(new Error("Synthetic uncertain navigation")); }
      return Promise.resolve({ content: [{ type: "text", text: JSON.stringify(state.ackOverride ?? { schema: "easyeda-pro-control.recovery-navigation.v1", ok: !state.invalidAck,
        openedProject: true, openedDocument: true, project: active.project, document: { ...active.document, tabId: state.contextMismatch ? "wrong" : active.document.tabId } }) }] });
    },
  };
  const real = new EasyedaControlEngine(upstream, { executionAuthorityValidator: owner.supervisor }); await real.controlFingerprintPromise;
  const generation: Generation = { ordinal: phase === "edit-open" ? 1 : 2, helperInstance: launch.helperInstance, jobId: launch.jobId, rootPid: launch.root.pid,
    rootStartIdentity: launch.root.startIdentity, runtimeSha256: sha256Json(runtime), sessionSha256: sha256Json(session), captureSha256: hash };
  const journal = await createClosedSymbolJournal(newOperationId(), { profile: FAMILY, projectUuid, projectPath, branchUuid: "e".repeat(32), ownerUuid: "f".repeat(32), targetUuid, activeUuid,
    operation: { id: "closed-symbol-nav-fixture", action: "library.symbol.modify", libraryUuid: projectUuid, target: { uuid: targetUuid }, patch: { name: "Synthetic new title" } },
    marker: { namespaceNonce: "1".repeat(64), keyNonce: "2".repeat(64), bodyNonce: "3".repeat(64) }, nativePinsSha256: hash, facadeSha256: hash, expectedFingerprintSha256: sha256Json(identity) });
  const baseline: Generation = { ...generation, ordinal: 0, jobId: "9".repeat(32), rootPid: 99, rootStartIdentity: `win32:639247486000000009:job:${"9".repeat(32)}` };
  const priorEdit: Generation = { ...generation, ordinal: 1, jobId: "8".repeat(32), rootPid: 88, rootStartIdentity: `win32:639247486000000008:job:${"8".repeat(32)}` };
  while (journal.sequence < STEPS.indexOf(phase) * 2) {
    const step = STEPS[Math.floor(journal.sequence / 2)]; assert.ok(step !== undefined);
    const kind = journal.sequence % 2 === 0 ? "intent" : "result";
    let selectedGeneration: Generation | LaunchGeneration | null = step.startsWith("baseline-") ? baseline : generation;
    if (phase === "verify-open" && step.startsWith("edit-")) { selectedGeneration = priorEdit; }
    let data: Value = { syntheticFixtureOnly: true };
    if (step.endsWith("-launch") && kind === "result") {
      const launchReceipt = { jobId: selectedGeneration.jobId, helperInstance: selectedGeneration.helperInstance,
        root: { pid: selectedGeneration.rootPid, role: "easyeda-main", startIdentity: selectedGeneration.rootStartIdentity } };
      data = { launchReceipt, launchReceiptSha256: sha256Json(launchReceipt) };
      selectedGeneration = launchGeneration(selectedGeneration);
    }
    if (step.endsWith("-admission") && kind === "intent") { selectedGeneration = launchGeneration(selectedGeneration); }
    if (step.endsWith("-launch") && kind === "intent") { selectedGeneration = null; }
    await appendClosedSymbolEvent(journal, { step, kind, generation: selectedGeneration,
      requestSha256: sha256Json(step), data });
  }
  const engine = {
    upstream, executionAuthorityValidator: owner.supervisor,
    runtimeIdentity: real.runtimeIdentity.bind(real),
    assertBridgeDispatchAllowed: real.assertBridgeDispatchAllowed.bind(real), assertRecoveryOperationIsolated: real.assertRecoveryOperationIsolated.bind(real), dispatchWithOrphanTracking: real.dispatchWithOrphanTracking.bind(real),
    status: (): Promise<{ stableFingerprint: Value }> => Promise.resolve({ stableFingerprint: identity }),
    assertContext(): Promise<typeof active> { state.contextCalls += 1; state.onBoundary?.(`context-${state.contextCalls}`); return state.readinessFailure ? Promise.reject(new Error("Synthetic readiness refusal")) : Promise.resolve(structuredClone(active)); },
  };
  const stage = new ClosedSymbolNavigationStage(engine, identity, {
    verifyLibraryNativeProfile: (): ReturnType<NonNullable<StageIo["verifyLibraryNativeProfile"]>> => Promise.resolve(LIBRARY_NATIVE_IMPLEMENTATION),
    verifyCheckpoint: (): ReturnType<NonNullable<StageIo["verifyCheckpoint"]>> => {
      state.checkpointCalls += 1; state.onBoundary?.(`checkpoint-${state.checkpointCalls}`); const unchanged = state.checkpointCalls !== state.checkpointFailAt;
      return Promise.resolve({ ok: unchanged, sourceMatchesReceipt: unchanged, checkpointMatchesReceipt: true, sourceEqualsCheckpoint: unchanged, sourceChanged: !unchanged,
        source: checkpoint.source, checkpoint: checkpoint.checkpoint, receiptPath: checkpoint.receiptPath, checkpointSha256: hash, sourceSha256: hash, sourceDumpSha256: hash, checkpointDumpSha256: hash });
    },
    prepareRecoveryNavigation: (): ReturnType<NonNullable<StageIo["prepareRecoveryNavigation"]>> => { state.onBoundary?.("prepare"); return Promise.resolve({ target: state.preparedMismatch ? { ...target, documentUuid: "wrong" } : target, code, checkpointSha256: hash,
      libraryHeaderEvidence: { profile: "easyeda.native-history.library-header-evidence.v1", projectUuid, checkpointSha256: hash, documents: [], contentSha256: hash, sha256: hash } }); },
  });
  const originalOperationId = journal.operationId;
  return { journal, stage, state, generation, owner, engine,
    async dispose(): Promise<void> {
      // Test-root cleanup only. No live journal exists. Avoid leaking synthetic
      // Quarantine into later tests sharing this process's isolated root.
      const current = await loadOperation(originalOperationId); current["state"] = "completed"; current["orphanedCallPossible"] = false; await updateOperation(current);
    } };
}

void test("same real journal retains native return before actual engine cleanup and creates no child journal", async () => {
  const value = await fixture();
  try {
    const beforeStates = await listOperationStates();
    const beforeIds = beforeStates.map((entry) => entry["operationId"]);
    const result = await value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint);
    const afterStates = await listOperationStates();
    assert.deepEqual(afterStates.map((entry) => entry["operationId"]), beforeIds);
    assert.equal(result["completionProved"], false); assert.equal(result["saved"], false); assert.equal(value.state.nativeCalls, 1);
    const retained = await loadClosedSymbolJournal(value.journal.operationId);
    assert.equal(retained.events.at(-1)?.step, "edit-open"); assert.equal(retained.events.at(-1)?.kind, "result");
    assert.equal(retained.journal.orphanedCallPossible, false); assert.equal(Object.hasOwn(retained.journal, "context"), false);
    assert.equal(value.owner.requests.filter((request) => request["action"] === "release-capture").length, 1);
    await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint), /consumed/u); assert.equal(value.state.nativeCalls, 1);
  } finally { await value.dispose(); }
});
void test("verification open binds ordinal two and its complete retained predecessor", async () => {
  const value = await fixture("verify-open");
  try {
    const result = await value.stage.openCompanion(value.journal, "verify-open", value.generation, checkpoint);
    assert.equal(result["phase"], "verify-open"); assert.equal(result["completionProved"], false); assert.equal(value.state.nativeCalls, 1);
    const retained = await loadClosedSymbolJournal(value.journal.operationId);
    assert.equal(retained.events.at(-1)?.step, "verify-open"); assert.equal(retained.events.at(-1)?.generation?.ordinal, 2);
    await assert.rejects(value.stage.openCompanion(value.journal, "verify-open", value.generation, checkpoint), /consumed/u);
  } finally { await value.dispose(); }
});
for (const setting of ["readinessFailure", "contextMismatch", "invalidAck"] as const) {
  void test(`settled ${setting} retains the original return and cannot repeat Open`, async () => {
    const value = await fixture(); value.state[setting] = true;
    try {
      await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint));
      const retained = await loadClosedSymbolJournal(value.journal.operationId); assert.equal(retained.events.at(-1)?.kind, "result"); assert.equal(retained.journal.orphanedCallPossible, false);
      await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint), /consumed/u); assert.equal(value.state.nativeCalls, 1);
    } finally { await value.dispose(); }
  });
}
void test("uncertain transport leaves intent and actual orphan quarantine without a retry", async () => {
  const value = await fixture(); value.state.transportFailure = true;
  try {
    await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint), /uncertain/u);
    const retained = await loadClosedSymbolJournal(value.journal.operationId); assert.equal(retained.events.at(-1)?.kind, "intent"); assert.equal(retained.journal.orphanedCallPossible, true);
    assert.equal(value.owner.requests.filter((request) => request["action"] === "release-capture").length, 0);
    await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint), /consumed/u); assert.equal(value.state.nativeCalls, 1);
  } finally { await value.dispose(); }
});
for (const at of [1, 2, 3]) {
  void test(`checkpoint refusal ${at} prevents every native Open`, async () => {
    const value = await fixture(); value.state.checkpointFailAt = at;
    try { await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint), /checkpoint/u); assert.equal(value.state.nativeCalls, 0); }
    finally { await value.dispose(); }
  });
}
for (const setting of ["runtimeDrift", "preparedMismatch"] as const) {
  void test(`predispatch ${setting} refuses without native Open`, async () => {
    const value = await fixture(); value.state[setting] = true;
    try { await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint)); assert.equal(value.state.nativeCalls, 0); }
    finally { await value.dispose(); }
  });
}

const validAck = { schema: "easyeda-pro-control.recovery-navigation.v1", ok: true, openedProject: true, openedDocument: true,
  project: active.project, document: active.document };
const badAcks: readonly [string, Value][] = [
  ["foreign project UUID", { ...validAck, project: { ...active.project, uuid: "e".repeat(64) } }],
  ["foreign project path", { ...validAck, project: { ...active.project, path: "/synthetic/other.eprj2" } }],
  ["foreign document UUID", { ...validAck, document: { ...active.document, uuid: "e".repeat(32) } }],
  ["wrong document type", { ...validAck, document: { ...active.document, documentType: 2 } }],
  ["missing project", { ...validAck, project: undefined }],
  ["missing document identity", { ...validAck, document: { tabId: active.document.tabId } }],
  ["missing openedProject", { ...validAck, openedProject: undefined }],
  ["coerced openedDocument", { ...validAck, openedDocument: "true" }],
  ["extra root field", { ...validAck, extra: true }],
  ["extra project field", { ...validAck, project: { ...active.project, extra: true } }],
  ["extra document field", { ...validAck, document: { ...active.document, extra: true } }],
  ["empty tab", { ...validAck, document: { ...active.document, tabId: "" } }],
  ["oversized tab", { ...validAck, document: { ...active.document, tabId: "x".repeat(257) } }],
];
for (const [label, ack] of badAcks) {
  void test(`actual producer envelope refuses ${label} after retaining the settled return`, async () => {
    const value = await fixture(); value.state.ackOverride = ack;
    try {
      await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint), /acknowledgment/u);
      const retained = await loadClosedSymbolJournal(value.journal.operationId);
      assert.equal(retained.events.at(-1)?.kind, "result"); assert.equal(value.state.nativeCalls, 1); assert.equal(value.state.contextCalls, 0);
      await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint), /consumed/u);
    } finally { await value.dispose(); }
  });
}
for (const boundary of ["native-return", "context-1", "context-2"]) {
  for (const setting of ["runtimeDrift", "sessionDrift", "leaseDrift"] as const) {
    void test(`${setting} at ${boundary} cannot authorize the observed context`, async () => {
      const value = await fixture(); value.state.onBoundary = (current): void => { if (current === boundary) { value.state[setting] = true; } };
      try {
        await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint));
        const retained = await loadClosedSymbolJournal(value.journal.operationId);
        assert.equal(retained.events.at(-1)?.kind, "result"); assert.equal(value.state.nativeCalls, 1);
        await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint), /consumed/u);
      } finally { await value.dispose(); }
    });
  }
}
for (const boundary of ["prepare", "checkpoint-2", "capture", "checkpoint-3", "native-return", "context-1"]) {
  for (const field of ["activeUuid", "operationId"] as const) {
    void test(`${field} mutation at ${boundary} is rejected before the next unsafe step`, async () => {
      const value = await fixture();
      const mutate = (current: string): void => {
        if (current !== boundary) { return; }
        if (field === "activeUuid") { Reflect.set(value.journal.plan, "activeUuid", "e".repeat(32)); }
        else { value.journal.operationId = newOperationId(); }
      };
      value.state.onBoundary = mutate; value.owner.behavior.afterRequest = mutate;
      try {
        await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint), /changed/u);
        assert.equal(value.state.nativeCalls, boundary === "native-return" || boundary === "context-1" ? 1 : 0);
      } finally { await value.dispose(); }
    });
  }
}
for (const field of ["sourceSha256", "sourceDumpSha256"] as const) {
  void test(`supplied checkpoint ${field} must match the actual verified receipt`, async () => {
    const value = await fixture();
    try {
      await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, { ...checkpoint, [field]: "f".repeat(64) }), /checkpoint/u);
      assert.equal(value.state.nativeCalls, 0);
    } finally { await value.dispose(); }
  });
}
void test("cleanup failure retains the settled return and never grants another Open", async () => {
  const value = await fixture(); value.owner.behavior.errorAction = "release-capture";
  try {
    await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint));
    const retained = await loadClosedSymbolJournal(value.journal.operationId);
    assert.equal(retained.events.at(-1)?.kind, "result"); assert.equal(retained.journal.orphanedCallPossible, false);
    await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint), /consumed/u);
    assert.equal(value.state.nativeCalls, 1);
  } finally { await value.dispose(); }
});
for (const boundary of ["capture", "native-return"]) {
  void test(`existing peer substitution at ${boundary} cannot redirect any journal write`, async () => {
    const value = await fixture();
    const peer = await fixture();
    const operationId = value.journal.operationId;
    const before = await readFile(peer.journal.journalPath);
    const mutate = (current: string): void => { if (current === boundary) { value.journal.operationId = peer.journal.operationId; } };
    value.state.onBoundary = mutate; value.owner.behavior.afterRequest = mutate;
    // Both are synthetic unfinished records. Isolation admits only one while
    // The second remains a byte-invariance target for the redirection test.
    await peer.dispose();
    const peerBefore = await readFile(peer.journal.journalPath); assert.notDeepEqual(peerBefore, before);
    try {
      await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint), /caller journal changed/u);
      assert.deepEqual(await readFile(peer.journal.journalPath), peerBefore);
      const original = await loadClosedSymbolJournal(operationId);
      assert.equal(original.events.at(-1)?.kind, boundary === "capture" ? "intent" : "result");
      assert.equal(original.journal.operationId, operationId);
      assert.equal(original.journal.orphanedCallPossible, false);
      assert.equal(value.state.nativeCalls, boundary === "capture" ? 0 : 1);
    } finally { await value.dispose(); }
  });
  void test(`caller saved flag at ${boundary} is never copied into the durable journal`, async () => {
    const value = await fixture();
    const mutate = (current: string): void => { if (current === boundary) { value.journal.saved = true; } };
    value.state.onBoundary = mutate; value.owner.behavior.afterRequest = mutate;
    try {
      await assert.rejects(value.stage.openCompanion(value.journal, "edit-open", value.generation, checkpoint), /caller journal changed/u);
      const retained = await loadClosedSymbolJournal(value.journal.operationId);
      assert.equal(retained.journal.saved, false);
      assert.equal(retained.events.at(-1)?.kind, boundary === "capture" ? "intent" : "result");
      assert.equal(value.state.nativeCalls, boundary === "capture" ? 0 : 1);
    } finally { await value.dispose(); }
  });
}
