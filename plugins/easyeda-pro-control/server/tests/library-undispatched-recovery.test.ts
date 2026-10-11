import { configureTestControlRoot } from "./test-control-root.ts";
/* oxlint-disable import/max-dependencies -- Exercise sealed journal storage, immutable native plans and recovery together with synthetic read-only runtime evidence. */
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { after, afterEach, before as beforeAll, test } from "node:test";
import type { createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, isRecord, loadReviewedCompatibilityManifest, newOperationId, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import type { LibraryJournal } from "../src/library-execution.ts";
import type { LibraryRecoveryCoordinator, LibraryRecoveryEngine } from "../src/library-recovery.ts";
import type { ContextProbePayload, ExpectedContext } from "../src/engine.ts";
import type { CheckpointReceipt, CheckpointVerification } from "../src/checkpoint.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import type { LibraryOperation } from "../src/library-operations.ts";
import { LIBRARY_EXECUTION_PROFILE } from "../src/library-runtime.ts";
import { LIBRARY_NATIVE_IMPLEMENTATION } from "../src/library-native-profile.ts";
import { SCHEMATIC_NATIVE_IMPLEMENTATION } from "../src/native-profiles.ts";
import { prepareDocumentActivation } from "../src/document-activation.ts";
import { prepareDocumentClose } from "../src/document-close.ts";
import { prepareDocumentPageCreate } from "../src/document-page-create.ts";
import { prepareProjectSymbolCreate } from "../src/project-symbol-create.ts";
import { prepareDocumentContainerRename } from "../src/document-container-rename.ts";
import { assertUndispatchedLibraryPreparation, hasMissingLibraryPreparation } from "../src/library-undispatched-recovery.ts";

type Value = Record<string, unknown>;
type Action = "document.activate" | "document.close" | "document.page.create" | "library.symbol.create" | "document.pcb.rename" | "document.schematic.rename";
type Prefix = "before-failed" | "before-retained" | "preparation-failed";
type Fault = "none" | "source" | "history" | "clock" | "database" | "context" | "final-context" | "final-source" | "baseline" | "final-checkpoint" | "runtime" | "journal" | "update" | "load-context" | "isolation-context";
let originalRoot: string | undefined, root = "";
let artifacts: { createOperation: typeof createOperation; loadOperation: typeof loadOperation; operationPath: typeof operationPath; updateOperation: typeof updateOperation; writePhaseArtifact: typeof writePhaseArtifact };
let recovery: { LibraryRecoveryCoordinator: typeof LibraryRecoveryCoordinator };
beforeAll(async () => {
  root = await mkdtemp("/tmp/easyeda-undispatched-recovery-"); originalRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  configureTestControlRoot(root);
  [artifacts, recovery] = await Promise.all([import("../src/artifacts.ts"), import("../src/library-recovery.ts")]);
});
afterEach(async () => { await rm(join(root, "operations"), { recursive: true, force: true }); });
after(async () => {
  if (originalRoot === undefined) { configureTestControlRoot(); } else { configureTestControlRoot(originalRoot); }
  await rm(root, { recursive: true, force: true });
});
const HASH = "a".repeat(64), SOURCE = { source: "complete original board source" };
const CONTEXT = { project: { uuid: "project", path: "/fixture/project.eprj2" },
  document: { uuid: "board", documentType: 3, tabId: "board@project", parentProjectUuid: "project" } } satisfies ExpectedContext;
function history(changed = false, clock = false): NativeHistorySnapshot {
  const documents = ["board", "footprint", "parent", "page", "pcb"].map((uuid) => {
    const docType = { board: "PCB", footprint: "FOOTPRINT", parent: "SCH", page: "SCH_PAGE", pcb: "PCB" }[uuid] ?? "missing";
    const metadata = { uuid, docType };
    const body: Value = { title: uuid === "page" ? "P1" : uuid, source: "", ...(uuid === "page" ? { schematic: "parent", zIndex: 1 } : {}),
      ...(docType === "SCH" || docType === "PCB" ? { board: "", zIndex: null } : {}), ...(docType === "PCB" ? { parent: "" } : {}) };
    if (changed && uuid === "board") { body["title"] = "different"; }
    const records = [{ id: "META", type: "META", body, ticket: clock && uuid === "board" ? 2 : 1, client: null }];
    return { uuid, docType, metadata, records, semanticSha256: sha256Json({ uuid, docType, metadata, records: records.map(({ id, type, body: content }) => ({ id, type, body: content })) }) };
  });
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: HASH, historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
function fingerprint(): Value {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], runtime = manifest.connectedRuntime;
  return { facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => ({ path: `/fixture/control/${file.relativePath}`, relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: runtime.healthVersion, node_version: runtime.nodeVersion, bridge_connected: true, easyeda_version: runtime.easyedaVersion,
      extension_version: runtime.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: runtime.bridgeVersion, ...(runtime.bridgeEasyedaVersion === null ? {} : { easyeda_version: runtime.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: runtime.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: runtime.dispatcher.source, dispatcher_build_id: runtime.dispatcher.buildId, total: runtime.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: "/fixture/assets", pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/fixture/pcb.js" },
      publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/fixture/api.js", adapterPath: "/fixture/adapter.js", declarationsPath: "/fixture/api.d.ts" } } };
}
function checkpoint(label: string, changed = false): CheckpointReceipt {
  return { schema: "easyeda-pro-control.checkpoint.v2", createdAt: "2026-10-10T00:00:00Z", source: CONTEXT.project.path,
    checkpoint: `/fixture/${label}.sqlite`, receiptPath: `/fixture/${label}.json`, checkpointSha256: HASH, checkpointDumpSha256: changed ? "b".repeat(64) : HASH,
    sourceSha256: HASH, sourceDumpSha256: HASH, receiptSha256: HASH, sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" },
    checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" } };
}
function operation(action: Action): LibraryOperation {
  if (action === "document.pcb.rename" || action === "document.schematic.rename") { return { id: "rename", action, target: { uuid: action === "document.pcb.rename" ? "pcb" : "parent" }, name: "Renamed" }; }
  if (action === "library.symbol.create") { return { id: "create-symbol", action, libraryUuid: "project", name: "Empty symbol", symbolType: 2 }; }
  return action === "document.page.create" ? { id: "create-page", action, schematic: { uuid: "parent" } } : { id: "lifecycle", action, tabId: "footprint@project" };
}
async function fixture(action: Action = "document.page.create", prefix: Prefix = "preparation-failed", source = SOURCE): Promise<{
  journal: LibraryJournal; coordinator: LibraryRecoveryCoordinator; fault: { value: Fault }; counts: { dispatch: number; barrier: number; record: number };
}> {
  const counts = { dispatch: 0, barrier: 0, record: 0 }, fault: { value: Fault } = { value: "none" }, identity = fingerprint();
  const operationId = newOperationId(), plan: LibraryJournal["plan"] = { profile: LIBRARY_EXECUTION_PROFILE, operation: operation(action), expectedFingerprint: identity, expectedContext: CONTEXT };
  const journal: LibraryJournal = { schema: OPERATION_SCHEMA, operationId, journalPath: artifacts.operationPath(operationId), planHash: buildPlanHash(plan), plan,
    state: "planned", mutationState: "before", saved: false, reopened: false, orphanedCallPossible: false, hardStop: false, mutationMayHaveOccurred: false,
    nextSafeAction: "Dispatch the reviewed typed operation once.", context: CONTEXT, preCheckpoint: checkpoint("library-before"), beforeSourceSha256: sha256Json(source.source),
    sequence: 0, createdAt: "2026-10-10T00:00:00Z", updatedAt: "2026-10-10T00:00:00Z", artifacts: [] };
  await artifacts.createOperation(journal);
  const { libraryProjectRecordsHash } = await import("../src/library-persistence-proof.ts");
  const before = { source, baselineUploads: { scheduledWritesSettled: true }, projectRecordsSha256: libraryProjectRecordsHash(history()) };
  if (prefix === "before-failed") {
    await artifacts.writePhaseArtifact(operationId, 1, "before", { publicationCollision: true });
    await assert.rejects(artifacts.writePhaseArtifact(operationId, 1, "before", before));
  } else {
    journal.sequence = 1; journal.artifacts.push(await artifacts.writePhaseArtifact(operationId, 1, "before", before)); await artifacts.updateOperation(journal);
    if (prefix === "preparation-failed") {
      let phase: string;
      if (action === "document.activate") { journal.activationPlan = prepareDocumentActivation(plan.operation, history(), CONTEXT); phase = "activation-prepared"; }
      else if (action === "document.close") { journal.closePlan = prepareDocumentClose(plan.operation, history(), CONTEXT); phase = "close-prepared"; }
      else if (action === "library.symbol.create") { journal.symbolCreatePlan = prepareProjectSymbolCreate(plan.operation, history(), CONTEXT); phase = "symbol-create-prepared"; }
      else if (action === "document.pcb.rename" || action === "document.schematic.rename") { journal.documentRenamePlan = prepareDocumentContainerRename(plan.operation, history(), CONTEXT); phase = "document-rename-prepared"; }
      else { journal.pageCreatePlan = prepareDocumentPageCreate(plan.operation, history(), CONTEXT); phase = "page-create-prepared"; }
      journal.sequence += 1;
      await artifacts.writePhaseArtifact(operationId, journal.sequence, phase, { publicationCollision: true });
      await assert.rejects(artifacts.writePhaseArtifact(operationId, journal.sequence, phase, { expectedPreparation: true }));
      journal.state = "library-needs-review"; journal.hardStop = true; await artifacts.updateOperation(journal);
    }
  }
  let finalCheckpointRead = false, lateContextDrift = false, sourceReads = 0;
  const engine: LibraryRecoveryEngine = {
    status: (): Promise<{ stableFingerprint: Value }> => fault.value === "runtime" ? Promise.reject(new Error("runtime drift")) : Promise.resolve({ stableFingerprint: identity }),
    upstream: { installedEasyedaBundles: (): Promise<{ assetsRoot: string }> => Promise.resolve({ assetsRoot: "/fixture/assets" }) },
    context: (): Promise<ExpectedContext> => Promise.resolve(structuredClone(CONTEXT)),
    assertContext: (expected): Promise<ContextProbePayload> => {
      assert.deepEqual(expected, CONTEXT);
      return fault.value === "context" || fault.value === "final-context" && finalCheckpointRead || fault.value !== "none" && lateContextDrift ? Promise.reject(new Error("context drift")) : Promise.resolve(structuredClone(CONTEXT));
    },
    assertRecoveryOperationIsolated: (): Promise<true> => { if (fault.value === "isolation-context" && finalCheckpointRead) { lateContextDrift = true; } return Promise.resolve(true); },
    awaitProjectUploads: (): Promise<never> => { counts.barrier += 1; return Promise.reject(new Error("Recovery upload barrier must not run")); },
    dispatchWithOrphanTracking: (): Promise<never> => { counts.dispatch += 1; return Promise.reject(new Error("No lifecycle or observation dispatch permitted")); },
    ensureRuntimeRestartChallenge: (): Promise<never> => Promise.reject(new Error("No restart challenge permitted")),
    recoverDispatchAuthority: (): Promise<never> => Promise.reject(new Error("No dispatch authority recovery permitted")),
    exactRead: (): Promise<Value> => { sourceReads += 1; return Promise.resolve(fault.value === "source" || fault.value === "final-source" && sourceReads % 2 === 0 ? { source: "changed" } : source); },
    checkpoint: async (input): Promise<CheckpointReceipt | CheckpointVerification> => {
      const label = typeof input.label === "string" ? input.label : String(input.receiptPath).slice("/fixture/".length, -".json".length);
      const result = checkpoint(label, fault.value === "database" && label !== "library-before");
      if (input.receiptPath === undefined) { return result; }
      finalCheckpointRead = label === "library-undispatched";
      if (fault.value === "journal" && finalCheckpointRead) { const changed = await artifacts.loadOperation(operationId); changed["nextSafeAction"] = "intervening writer"; await artifacts.updateOperation(changed); }
      return { ...result, ok: !(fault.value === "baseline" && !finalCheckpointRead || fault.value === "final-checkpoint" && finalCheckpointRead), sourceChanged: false,
        sourceEqualsCheckpoint: true, sourceMatchesReceipt: true, checkpointMatchesReceipt: true };
    },
  };
  const coordinator = new recovery.LibraryRecoveryCoordinator(engine, {
    load: async (id): Promise<LibraryJournal> => {
      const loaded = await artifacts.loadOperation(id); assert.equal(loaded.operationId, operationId);
      if (fault.value === "load-context" && finalCheckpointRead) { lateContextDrift = true; }
      assert.ok(isRecord(loaded.plan)); assert.equal(loaded.plan["profile"], LIBRARY_EXECUTION_PROFILE);
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This fixture created the LibraryJournal above; reload the complete real sealed bytes without filling missing fields from the in-memory original.
      return loaded as LibraryJournal;
    },
    record: (): Promise<never> => { counts.record += 1; return Promise.reject(new Error("Invalidation must not publish another phase artifact")); },
    updateOperation: (updated): Promise<Awaited<ReturnType<typeof artifacts.updateOperation>>> => fault.value === "update" ? Promise.reject(new Error("terminal journal publication failed")) : artifacts.updateOperation(updated),
    readNativeHistoryCheckpoint: (input): Promise<NativeHistorySnapshot> => Promise.resolve(history(fault.value === "history" && input.checkpointPath !== "/fixture/library-before.sqlite", fault.value === "clock" && input.checkpointPath !== "/fixture/library-before.sqlite")),
    verifyLibraryNativeProfile: (): Promise<typeof LIBRARY_NATIVE_IMPLEMENTATION> => Promise.resolve(LIBRARY_NATIVE_IMPLEMENTATION),
    verifyDeviceAssociationNativeProfile: (): Promise<void> => Promise.resolve(),
    verifyDocumentContainerRenameNativeProfile: (): Promise<void> => Promise.resolve(),
    verifySchematicNativeProfile: (): Promise<typeof SCHEMATIC_NATIVE_IMPLEMENTATION> => Promise.resolve(SCHEMATIC_NATIVE_IMPLEMENTATION),
  });
  return { journal, coordinator, fault, counts };
}

for (const action of ["document.activate", "document.close", "document.page.create", "library.symbol.create", "document.pcb.rename", "document.schematic.rename"] as const) {
  for (const prefix of ["before-failed", "before-retained", "preparation-failed"] as const) {
    // oxlint-disable-next-line eslint/no-loop-func -- Hooks initialize module handles before each independent immutable case executes.
    void test(`${action} ${prefix} invalidates the sealed attempt without a dispatch or another publication phase`, async () => {
      const run = await fixture(action, prefix);
      const result = await run.coordinator.reconcile(run.journal.operationId);
      assert.equal(result["state"], "plan-invalidated"); assert.equal(result["saved"], false); assert.equal(result["reopened"], false);
      assert.equal(result["mutationMayHaveOccurred"], false); assert.equal(result["orphanedCallPossible"], false);
      assert.ok(isRecord(result["result"])); assert.equal(result["result"]["actionDispatched"], false); assert.equal(result["result"]["automaticRetry"], false);
      const retained = await artifacts.loadOperation(run.journal.operationId); assert.equal(retained["state"], "plan-invalidated");
      assert.deepEqual(retained.artifacts, run.journal.artifacts); assert.equal(retained["sequence"], run.journal.sequence);
      assert.deepEqual(run.counts, { dispatch: 0, barrier: 0, record: 0 });
      assert.deepEqual(await run.coordinator.reconcile(run.journal.operationId), result);
    });
  }
}
void test("undispatched document rename refuses peer-envelope drift despite unchanged semantic and logical-dump doubles", async () => {
  for (const action of ["document.pcb.rename", "document.schematic.rename"] as const) {
    const run = await fixture(action); run.fault.value = "clock";
    await assert.rejects(run.coordinator.reconcile(run.journal.operationId), /Unpublished preparation differs from the immutable operation and checkpoint/u);
    const retained = await artifacts.loadOperation(run.journal.operationId);
    assert.equal(retained["state"], "library-needs-review");
    assert.deepEqual(run.counts, { dispatch: 0, barrier: 0, record: 0 });
    await rm(join(root, "operations"), { recursive: true, force: true });
  }
});
for (const fault of ["source", "history", "database", "context", "final-context", "final-source", "baseline", "final-checkpoint", "runtime", "update", "load-context", "isolation-context"] as const) {
  // oxlint-disable-next-line eslint/no-loop-func -- Shared module handles are initialized by before; every case owns an independent sealed journal.
  void test(`invalidation ${fault} failure leaves the initial journal unchanged and permits a safe read-only recheck`, async () => {
    const run = await fixture(); run.fault.value = fault;
    const before = await artifacts.loadOperation(run.journal.operationId);
    await assert.rejects(run.coordinator.reconcile(run.journal.operationId));
    assert.deepEqual(await artifacts.loadOperation(run.journal.operationId), before);
    run.fault.value = "none"; const result = await run.coordinator.reconcile(run.journal.operationId); assert.equal(result["state"], "plan-invalidated");
    assert.deepEqual(run.counts, { dispatch: 0, barrier: 0, record: 0 });
  });
}
void test("invalidation refuses an intervening sealed journal update", async () => {
  const run = await fixture(); run.fault.value = "journal";
  await assert.rejects(run.coordinator.reconcile(run.journal.operationId), /journal changed/u);
  const retained = await artifacts.loadOperation(run.journal.operationId); assert.equal(retained["state"], "library-needs-review");
  assert.equal(retained["nextSafeAction"], "intervening writer"); assert.deepEqual(run.counts, { dispatch: 0, barrier: 0, record: 0 });
});

const forbiddenKeys = ["orphanedCallPhase", "orphanedCallMarkedAt", "orphanedCallReturnedAt", "runtimeRestartChallengeAttempt", "runtimeRestartChallenge",
  "runtimeRestartChallengeIssuedAt", "runtimeRestartChallengeConsumedAt", "runtimeRestartBoundary", "runtimeIdentityBeforeOrphan", "bridgeSessionBeforeOrphan",
  "bridgeDispatchBeforeOrphan", "executionAuthorityBeforeOrphan", "unsavedStateDiscardedByRestart", "baselineDiscardAuthorized", "runtimeStatus", "facadeImplementation",
  "candidateFinalCheckpoint", "finalCheckpoint", "baselineReopened", "baselineHash", "baselineInvariants", "unknownPhase", "lastError", "runtimeGuardFailure",
  "recoveryActivationResumeState", "recoveryActivationPriorUnknownPhase", "recoveryAttemptCount", "recoverySourceSha256", "mutationReceipt", "result", "runtimeFingerprint",
  "saveIntent", "devicePlan", "symbolPlan", "symbolCreatePlan", "pageRenamePlan", "activationPlan", "closePlan", "futureDispatchField"];
void test("all own dispatch/restart/receipt/unknown fields refuse even undefined, null or false", async () => {
  const run = await fixture(); assertUndispatchedLibraryPreparation(run.journal);
  for (const key of forbiddenKeys) {
    for (const value of [undefined, null, false]) { assert.throws(() => { assertUndispatchedLibraryPreparation({ ...run.journal, [key]: value }); }, /exact undispatched/u); }
  }
});
void test("risk flags, state/sequence/phase deviations and context rebinding never qualify", async () => {
  const run = await fixture();
  const cases: Value[] = [{ mutationMayHaveOccurred: true }, { orphanedCallPossible: true }, { saved: true }, { reopened: true }, { mutationState: "after" },
    { state: "execute-dispatching" }, { state: "library-reconciliation-needs-review" }, { hardStop: false }, { sequence: 3 }, { artifacts: [] },
    { artifacts: [...run.journal.artifacts, ...run.journal.artifacts] }, { context: { ...CONTEXT, document: { ...CONTEXT.document, tabId: "other" } } }];
  for (const changes of cases) { assert.throws(() => { assertUndispatchedLibraryPreparation({ ...run.journal, ...changes }); }); }
});
void test("an unprepared journal with an original dispatch marker refuses before any runtime barrier and remains intact", async () => {
  const run = await fixture(); run.journal.orphanedCallPhase = "execute"; await artifacts.updateOperation(run.journal);
  const before = await artifacts.loadOperation(run.journal.operationId);
  await assert.rejects(run.coordinator.reconcile(run.journal.operationId), /exact undispatched/u);
  assert.deepEqual(await artifacts.loadOperation(run.journal.operationId), before); assert.deepEqual(run.counts, { dispatch: 0, barrier: 0, record: 0 });
});
void test("an unpublished plan cannot be substituted despite an unchanged current project", async () => {
  const run = await fixture(); assert.ok(run.journal.pageCreatePlan); run.journal.pageCreatePlan.desiredTitle = "Forged";
  await artifacts.updateOperation(run.journal); await assert.rejects(run.coordinator.reconcile(run.journal.operationId), /immutable operation/u);
  assert.deepEqual(run.counts, { dispatch: 0, barrier: 0, record: 0 });
});
void test("a retained prepared artifact keeps its existing recovery route and cannot qualify as undispatched", async () => {
  const run = await fixture("document.close", "before-retained");
  run.journal.closePlan = prepareDocumentClose(run.journal.plan.operation, history(), CONTEXT);
  run.journal.artifacts.push(await artifacts.writePhaseArtifact(run.journal.operationId, 2, "close-prepared", run.journal.closePlan)); run.journal.sequence = 2;
  assert.equal(hasMissingLibraryPreparation(run.journal), false); assert.throws(() => { assertUndispatchedLibraryPreparation(run.journal); });
});
void test("unprepared lifecycle attempts refuse rebind, navigation and authority recovery without changing the retryable prefix", async () => {
  const run = await fixture();
  const before = await artifacts.loadOperation(run.journal.operationId);
  await assert.rejects(run.coordinator.rebindRuntime(run.journal.operationId, fingerprint()), /original compatible runtime/u);
  await assert.rejects(run.coordinator.openTarget(run.journal.operationId), /original compatible runtime/u);
  await assert.rejects(run.coordinator.recoverAuthority(run.journal.operationId), /original compatible runtime/u);
  assert.deepEqual(await artifacts.loadOperation(run.journal.operationId), before);
  assert.deepEqual(run.counts, { dispatch: 0, barrier: 0, record: 0 });
  const result = await run.coordinator.reconcile(run.journal.operationId); assert.equal(result["state"], "plan-invalidated");
});
void test("legal before source above 2 MiB invalidates while generic prepared-artifact limits stay fixed", async () => {
  const source = { source: "a".repeat(2 * 1024 * 1024 + 1) };
  const run = await fixture("document.page.create", "preparation-failed", source);
  const descriptor = run.journal.artifacts[0]; assert.ok(descriptor); assert.ok(descriptor.bytes > 2 * 1024 * 1024);
  const { readLibraryBeforeRecoveryArtifact, readLibraryRecoveryArtifact } = await import("../src/library-recovery-state.ts");
  await assert.rejects(readLibraryRecoveryArtifact(descriptor), /reviewed bound/u);
  await assert.rejects(readLibraryBeforeRecoveryArtifact({ ...descriptor, path: descriptor.path.replace("01-before.json", "02-page-create-prepared.json") }), /initial before artifact/u);
  await assert.rejects(readLibraryBeforeRecoveryArtifact({ ...descriptor, bytes: 4 * 1024 * 1024 + 1025 }), /reviewed bound/u);
  const result = await run.coordinator.reconcile(run.journal.operationId); assert.equal(result["state"], "plan-invalidated");
  assert.deepEqual(run.counts, { dispatch: 0, barrier: 0, record: 0 });
});
