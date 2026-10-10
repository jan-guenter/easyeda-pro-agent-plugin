/* oxlint-disable import/max-dependencies -- Exercise coordinator, immutable receipts and existing durable proofs together without a live process or filesystem fixture. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { z } from "zod";
import { LibraryRecoveryCoordinator } from "../src/library-recovery.ts";
import type { LibraryRecoveryEngine, LibraryRecoveryServices } from "../src/library-recovery.ts";
import type { LibraryJournal } from "../src/library-execution.ts";
import { listLibraryExecutionCapabilities } from "../src/library-execution.ts";
import { libraryMutationReceipt, readLibraryRecoveryArtifact, uniqueLibraryRecoveryArtifact, verifyRecoveredLibraryMutation } from "../src/library-recovery-state.ts";
import { prepareDeviceCreate } from "../src/device-create.ts";
import { prepareProjectSymbolMetadata } from "../src/project-symbol-metadata.ts";
import { LIBRARY_NATIVE_IMPLEMENTATION } from "../src/library-native-profile.ts";
import { LIBRARY_EXECUTION_PROFILE } from "../src/library-runtime.ts";
import { libraryOperationSchema } from "../src/library-operations.ts";
import { libraryToolOperationSchema } from "../src/tool-operation-envelope.ts";
import { OPERATION_SCHEMA, buildPlanHash, isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json, sha256Text } from "../src/core.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import type { ArtifactDescriptor } from "../src/artifacts.ts";

type Value = Record<string, unknown>;
const CREATED = "d".repeat(16), HASH = "a".repeat(64);
const CONTEXT = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "tab" } };
const RECEIPT = { schema: "easyeda-pro-control.checkpoint.v2" as const, createdAt: "2026-01-01T00:00:00Z", source: CONTEXT.project.path,
  checkpoint: "/fixture/before.sqlite", receiptPath: "/fixture/before.json", checkpointSha256: HASH, checkpointDumpSha256: HASH,
  sourceSha256: HASH, sourceDumpSha256: HASH, receiptSha256: HASH, sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" },
  checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" } };
const OPERATION = libraryOperationSchema.parse({ id: "create", action: "library.device.create", libraryUuid: "project", name: "Device", association: { symbol: { uuid: "symbol", libraryUuid: "project" } } });
const RETURNED = { kind: "project-device-create", createdId: CREATED };
function document(uuid: string, docType: string, body: Value): NativeDocumentSnapshot {
  const value = { uuid, docType, metadata: { uuid, docType, editVersion: "3.2.149.88089769", client: "a".repeat(16), updateTime: 1, version: "1" },
    records: [{ id: "META", type: "META", ticket: 1, client: null, body }] };
  return { ...value, semanticSha256: sha256Json(value) };
}
const BEFORE: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner",
  branchUuid: "branch", headHistoryUuid: "head", checkpointSha256: HASH, historyRowCount: 1, chunkCount: 1, plaintextBytes: 1,
  semanticSha256: HASH, documents: [document("board", "PCB", {}), document("symbol", "SYMBOL", { title: "Symbol" })] };
const PREPARED = prepareDeviceCreate(OPERATION, BEFORE);
const AFTER = { ...BEFORE, documents: [...BEFORE.documents, document(CREATED, "DEVICE", PREPARED.expectedMeta)] };
function fingerprint(): Value {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], runtime = manifest.connectedRuntime;
  return { facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => ({ path: `/opt/control/${file.relativePath}`, relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: runtime.healthVersion, node_version: runtime.nodeVersion, bridge_connected: true, easyeda_version: runtime.easyedaVersion,
      extension_version: runtime.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: runtime.bridgeVersion, ...(runtime.bridgeEasyedaVersion === null ? {} : { easyeda_version: runtime.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: runtime.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: runtime.dispatcher.source, dispatcher_build_id: runtime.dispatcher.buildId, total: runtime.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: "/opt/assets", pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/adapter.js", declarationsPath: "/opt/assets/api.d.ts" } } };
}
function artifact(path: string, value: unknown): { descriptor: ArtifactDescriptor; bytes: Buffer } {
  const text = JSON.stringify(value);
  return { descriptor: { path, bytes: Buffer.byteLength(text), sha256: sha256Text(text) }, bytes: Buffer.from(text) };
}
function fixture(symbolMetadata = false): { coordinator: LibraryRecoveryCoordinator; journal: LibraryJournal; calls: string[]; identity: Value;
  state: { source: string; after: NativeHistorySnapshot; returned: unknown } } {
  const calls: string[] = [], identity = fingerprint();
  const operation = symbolMetadata ? libraryOperationSchema.parse({ id: "modify-symbol", action: "library.symbol.modify", libraryUuid: "project", target: { uuid: "symbol" }, patch: { description: "changed" } }) : OPERATION;
  const before = symbolMetadata ? { ...BEFORE, documents: [document("board", "PCB", {}), document("symbol", "SYMBOL", { title: "MixedCase", description: "before", docType: 2 })] } : BEFORE;
  const symbolPlan = symbolMetadata ? prepareProjectSymbolMetadata(operation, before) : undefined;
  const after = symbolMetadata ? { ...before, documents: [document("board", "PCB", {}), document("symbol", "SYMBOL", { title: "MixedCase", description: "changed", docType: 2 })] } : AFTER;
  const returned = symbolMetadata ? { kind: "project-symbol-metadata", createdId: null, targetId: "symbol" } : RETURNED;
  const plan: LibraryJournal["plan"] = { profile: LIBRARY_EXECUTION_PROFILE, operation, expectedFingerprint: structuredClone(identity), expectedContext: structuredClone(CONTEXT) };
  const native = artifact("/fixture/2-native-return.json", returned), prepared = artifact(symbolMetadata ? "/fixture/1-symbol-prepared.json" : "/fixture/1-device-prepared.json", symbolPlan ?? PREPARED);
  const state = { source: "unchanged complete source", after: structuredClone(after), returned: structuredClone(returned) as unknown };
  const journal: LibraryJournal = { schema: OPERATION_SCHEMA, operationId: "fixture-operation", journalPath: "/fixture/operation.json", planHash: buildPlanHash(plan), plan,
    state: "library-needs-review", mutationState: "unknown", saved: false, reopened: false, orphanedCallPossible: false, hardStop: true, mutationMayHaveOccurred: true,
    nextSafeAction: "Reconcile", context: structuredClone(CONTEXT), preCheckpoint: RECEIPT, beforeSourceSha256: sha256Json(state.source), sequence: 2,
    updatedAt: "2026-01-01", artifacts: [prepared.descriptor, native.descriptor], ...(symbolPlan === undefined ? { devicePlan: PREPARED } : { symbolPlan }), mutationReceipt: libraryMutationReceipt(operation, returned) };
  const afterReceipt = { ...RECEIPT, checkpoint: "/fixture/after.sqlite", receiptPath: "/fixture/after.json", checkpointDumpSha256: "b".repeat(64) };
  const engine: LibraryRecoveryEngine = {
    status: (): Promise<{ stableFingerprint: Value }> => Promise.resolve({ stableFingerprint: identity }),
    context: (): Promise<typeof CONTEXT> => Promise.resolve(structuredClone(CONTEXT)),
    upstream: { installedEasyedaBundles: (): Promise<{ assetsRoot: string }> => Promise.resolve({ assetsRoot: "/opt/assets" }) },
    assertContext: (): Promise<typeof CONTEXT> => Promise.resolve(structuredClone(CONTEXT)),
    assertRecoveryOperationIsolated: (): Promise<true> => Promise.resolve(true),
    awaitProjectUploads: (): Promise<Value> => { calls.push("upload-barrier"); return Promise.resolve({ profile: "easyeda-pro-control.project-upload-barrier.v1", projectUuid: CONTEXT.project.uuid, scheduledWritesSettled: true, savedEditorChanges: false }); },
    checkpoint: (request): ReturnType<LibraryRecoveryEngine["checkpoint"]> => {
      calls.push("checkpoint"); return Promise.resolve(request.receiptPath === undefined ? afterReceipt : { ...afterReceipt, ok: true, checkpointMatchesReceipt: true,
        sourceChanged: false, sourceEqualsCheckpoint: true, sourceMatchesReceipt: true });
    },
    exactRead: (): Promise<Value> => { calls.push("read"); return Promise.resolve({ source: state.source }); },
    dispatchWithOrphanTracking: (): Promise<never> => { calls.push("DISPATCH"); return Promise.reject(new Error("Unexpected dispatch")); },
    ensureRuntimeRestartChallenge: (): Promise<never> => Promise.reject(new Error("Unused challenge")),
    recoverDispatchAuthority: (): Promise<never> => Promise.reject(new Error("Unused recovery")),
  };
  const services: LibraryRecoveryServices = { load: (): Promise<LibraryJournal> => Promise.resolve(journal), record: (_journal, phase): Promise<void> => { calls.push(phase); return Promise.resolve(); },
    verifyLibraryNativeProfile: (): Promise<typeof LIBRARY_NATIVE_IMPLEMENTATION> => Promise.resolve(LIBRARY_NATIVE_IMPLEMENTATION),
    verifyDeviceAssociationNativeProfile: (): Promise<void> => Promise.resolve(),
    readNativeHistoryCheckpoint: (request): Promise<NativeHistorySnapshot> => Promise.resolve(request.checkpointPath === RECEIPT.checkpoint ? before : state.after),
    readArtifact: (path, offset, length): ReturnType<NonNullable<LibraryRecoveryServices["readArtifact"]>> => {
      const at = Number(offset), count = Number(length);
      assert.equal(Number.isSafeInteger(at) && Number.isSafeInteger(count), true);
      const bytes = path === prepared.descriptor.path ? prepared.bytes : Buffer.from(JSON.stringify(state.returned));
      const page = bytes.subarray(at, at + count);
      return Promise.resolve({ path, size: bytes.length, offset: at, bytesRead: page.length, eof: at + page.length >= bytes.length, text: page.toString("utf8") });
    },
  };
  return { coordinator: new LibraryRecoveryCoordinator(engine, services), journal, calls, identity, state };
}

void test("changed library recovery proves the original created ID and all documents without repeating calls or saves", async () => {
  const run = fixture();
  const result = await run.coordinator.reconcile(run.journal.operationId);
  assert.equal(result["state"], "completed"); assert.equal(result["saved"], true); assert.equal(result["reopened"], false);
  assert.ok(isRecord(result["result"])); assert.equal(result["result"]["createdId"], CREATED);
  assert.equal(result["result"]["actionRepeated"], false); assert.equal(result["result"]["saveInvoked"], false);
  assert.equal(run.calls.includes("DISPATCH"), false); assert.equal(run.journal.hardStop, false);
  assert.equal(run.calls[0], "upload-barrier");
  assert.ok(run.calls.indexOf("upload-barrier") < run.calls.indexOf("checkpoint"));
});

void test("symbol recovery completes only the original retained exact effect without another native call", async () => {
  const run = fixture(true);
  const result = await run.coordinator.reconcile(run.journal.operationId);
  assert.equal(result["state"], "completed"); assert.equal(result["saved"], true); assert.equal(result["reopened"], false);
  assert.ok(isRecord(result["result"]));
  assert.equal(result["result"]["kind"], "project-symbol-metadata");
  assert.equal(result["result"]["actionRepeated"], false); assert.equal(result["result"]["saveInvoked"], false);
  assert.equal(run.calls.includes("DISPATCH"), false);
});

void test("symbol recovery retains uncertainty when return evidence is absent or original preparation differs", async () => {
  const missing = fixture(true);
  missing.journal.artifacts = missing.journal.artifacts.filter((entry) => !entry.path.endsWith("native-return.json"));
  await assert.rejects(missing.coordinator.reconcile(missing.journal.operationId), /exactly one retained native-return/u);
  const drift = fixture(true);
  assert.ok(drift.journal.symbolPlan); drift.journal.symbolPlan.desiredTitle = "Substituted";
  await assert.rejects(drift.coordinator.reconcile(drift.journal.operationId), /original prepared symbol artifact disagree/u);
  const collateral = fixture(true);
  const peer = collateral.state.after.documents[0]; assert.ok(peer); peer.metadata["updateTime"] = 2;
  await assert.rejects(collateral.coordinator.reconcile(collateral.journal.operationId), /unrelated/u);
  for (const run of [missing, drift, collateral]) {
    assert.equal(run.calls.includes("DISPATCH"), false); assert.equal(run.journal.hardStop, true); assert.equal(run.journal.saved, false);
  }
});
void test("reconciliation refuses substituted IDs, unrelated durable changes, source drift and unproved orphan calls", async () => {
  const drift = fixture(); const unrelated = drift.state.after.documents[0]; assert.ok(unrelated); unrelated.metadata["updateTime"] = 2;
  await assert.rejects(drift.coordinator.reconcile(drift.journal.operationId), /unrelated/u); assert.equal(drift.journal.hardStop, true);
  const changedId = fixture(); changedId.state.returned = { ...RETURNED, createdId: "e".repeat(16) };
  await assert.rejects(changedId.coordinator.reconcile(changedId.journal.operationId), /hash mismatch/u);
  const source = fixture(); source.state.source = "other";
  await assert.rejects(source.coordinator.reconcile(source.journal.operationId), /source differs/u);
  const orphan = fixture(); orphan.journal.orphanedCallPossible = true;
  await assert.rejects(orphan.coordinator.reconcile(orphan.journal.operationId), /termination/u); assert.deepEqual(orphan.calls, []);
  const strict = fixture(); await assert.rejects(strict.coordinator.reconcile(strict.journal.operationId, true), /Durable library changed/u);
  for (const run of [drift, changedId, source, strict]) { assert.equal(run.calls.includes("DISPATCH"), false); }
});
void test("facade-only rebind retains immutable plan and requires reconciliation, while external runtime drift fails", async () => {
  const run = fixture();
  const hash = run.journal.planHash, original = structuredClone(run.journal.plan);
  await run.coordinator.rebindRuntime(run.journal.operationId, run.identity);
  assert.deepEqual(run.journal.plan, original); assert.equal(run.journal.planHash, hash); assert.equal(run.journal.hardStop, true);
  assert.equal(run.journal.state, "library-runtime-rebound-needs-reconciliation");
  const changed = { ...run.identity, upstreamServer: { version: "other" } };
  await assert.rejects(run.coordinator.rebindRuntime(run.journal.operationId, changed));
  assert.equal(run.calls.includes("DISPATCH"), false);
});
void test("receipt and managed artifact checks reject guessed identity and tampered original preparation", async () => {
  assert.throws(() => libraryMutationReceipt(OPERATION, { kind: RETURNED.kind }), /identity/u);
  assert.throws(() => verifyRecoveredLibraryMutation({ operation: OPERATION, before: BEFORE, after: AFTER, nativeReturn: RETURNED,
    preparedDevice: { ...PREPARED, name: "tampered" } }), /immutable operation/u);
  const value = { text: `${"x".repeat(262_133)}😀 test` };
  const retained = artifact("/fixture/9-native-return.json", value);
  const decoded = await readLibraryRecoveryArtifact(retained.descriptor, (path, offset = 0, length = 65_536) => {
    const bytes = retained.bytes.subarray(offset, offset + length);
    return Promise.resolve({ path, size: retained.bytes.length, offset, bytesRead: bytes.length, eof: offset + bytes.length >= retained.bytes.length, text: bytes.toString("utf8") });
  });
  assert.deepEqual(decoded, value);
  assert.throws(() => uniqueLibraryRecoveryArtifact([retained.descriptor, retained.descriptor], "native-return"), /exactly one/u);
  const capabilities = listLibraryExecutionCapabilities();
  assert.equal(capabilities.every((entry) => entry["connectedValidation"] === "see-capability-matrix;catalog-not-live-proof"), true);
  assert.equal(capabilities.find((entry) => entry["action"] === "library.device.model-transform")?.["status"], "implemented-project-device-transform-checkpoint-proof");
  const symbol = capabilities.find((entry) => entry["action"] === "library.symbol.modify");
  assert.equal(symbol?.["status"], "implemented-project-symbol-metadata-checkpoint-proof");
  assert.equal(symbol["currentGenerationLiveValidated"], false);
});

void test("public library request schema exposes confirmed recovery without starting a facade", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const declaration = /const libraryRequestSchema = ([\s\S]+?);\n\nconst checkRequestSchema/u.exec(source)?.[1];
  assert.ok(declaration !== undefined && declaration.length > 0);
  // Evaluate only this fixed repository schema, with inert identity fields; no index startup or bridge owner.
  const schema: unknown = runInNewContext(declaration, { z, libraryToolOperationSchema, contextSchema: z.object({}).strict(), privateFingerprintSchema: z.object({}).strict() });
  assert.ok(schema instanceof z.ZodType);
  assert.doesNotThrow(() => z.toJSONSchema(schema));
  for (const request of [{ action: "reconcile", operationId: "retained" }, { action: "open-target", operationId: "retained", confirmOpen: true },
    { action: "rebind-runtime", operationId: "retained", expectedFingerprint: {}, confirmRuntimeUpgrade: true }]) {
    assert.equal(schema.safeParse(request).success, true);
  }
  for (const request of [{ action: "open-target", operationId: "retained" }, { action: "rebind-runtime", operationId: "retained", expectedFingerprint: {} },
    { action: "reconcile", operationId: "retained", retryMutation: true }]) {
    assert.equal(schema.safeParse(request).success, false);
  }
});
