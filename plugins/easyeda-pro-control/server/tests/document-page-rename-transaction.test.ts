import { configureTestControlRoot } from "./test-control-root.ts";
/* oxlint-disable import/max-dependencies -- Integrated regressions compose the real sealed journal, executor and recovery with explicit native doubles. */
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { after, afterEach, before, mock, test } from "node:test";
import { isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import type { LibraryExecuteInput, LibraryExecutor, LibraryJournal } from "../src/library-execution.ts";
import type { loadOperation, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import type { AuthenticatedBridgeDispatchBinding, EasyedaControlEngine, ExecutionAuthorityEvidence, ExpectedContext, InstalledEasyedaBundles } from "../src/engine.ts";
import type { CheckpointReceipt } from "../src/checkpoint.ts";
import { LIBRARY_NATIVE_IMPLEMENTATION } from "../src/library-native-profile.ts";
import { SCHEMATIC_NATIVE_IMPLEMENTATION } from "../src/native-profiles.ts";

type Value = Record<string, unknown>;
let originalRoot: string | undefined, root = "";
let library: { LibraryExecutor: typeof LibraryExecutor };
let artifacts: { loadOperation: typeof loadOperation; updateOperation: typeof updateOperation; writePhaseArtifact: typeof writePhaseArtifact };
let engines: { EasyedaControlEngine: typeof EasyedaControlEngine };
before(async () => {
  root = await mkdtemp("/tmp/easyeda-page-rename-transaction-");
  originalRoot = process.env["EASYEDA_CONTROL_DATA_DIR"]; configureTestControlRoot(root);
  [library, artifacts, engines] = await Promise.all([import("../src/library-execution.ts"), import("../src/artifacts.ts"), import("../src/engine.ts")]);
});
afterEach(async () => { mock.restoreAll(); await rm(join(root, "operations"), { recursive: true, force: true }); });
after(async () => {
  if (originalRoot === undefined) { configureTestControlRoot(); } else { configureTestControlRoot(originalRoot); }
  await rm(root, { recursive: true, force: true });
});
const HASH = "a".repeat(64);
const CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "active", documentType: 1,
  tabId: "active@project", parentProjectUuid: "project" }, schematic: { uuid: "parent" } };
const OPERATION = { id: "rename-page", action: "document.page.rename", target: { uuid: "page" }, name: "Renamed" };
function history(renamed = false, peerChanged = false): NativeHistorySnapshot {
  const documents = ["parent", "active", "page"].map((uuid) => {
    const docType = uuid === "parent" ? "SCH" : "SCH_PAGE", time = uuid === "page" && renamed ? 2 : 1;
    const metadata = { uuid, docType, client: "a".repeat(16), updateTime: time, version: String(time), editVersion: "3.2",
      ...(uuid === "page" && renamed ? {} : { user: { uuid: "original-author" } }) };
    const body: Value = uuid === "parent" ? { title: "Container", source: "", board: "" } : { title: uuid === "page" && renamed ? "Renamed" : uuid,
      schematic: "parent", source: "", zIndex: peerChanged && uuid === "active" ? 2 : 1 };
    const records = [{ id: "META", type: "META", body, ticket: time, client: null }];
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
function fixture(options: { readonly publicationFailure?: "native-return" | "verified"; readonly peerMutation?: boolean;
  readonly checkpointFault?: "admission" | "final"; readonly contextFault?: "execute-final" | "recovery-final";
  readonly activeSourceFault?: boolean; readonly profileFault?: boolean; readonly readbackFailureOnce?: boolean;
  readonly cleanupFailure?: boolean; readonly invalidAcknowledgment?: boolean } = {}): {
  readonly executor: LibraryExecutor; readonly request: LibraryExecuteInput; readonly operationId: () => string;
  readonly counts: () => { dispatches: number; writes: number }; readonly resetPeer: () => void;
} {
  const identity = fingerprint();
  let contextValid = true, dispatches = 0, operationId = "", peer = options.peerMutation === true, verifications = 0, writes = 0;
  let readbackFailureRemaining = options.readbackFailureOnce === true;
  const checkpoint = (label: string): CheckpointReceipt => ({ schema: "easyeda-pro-control.checkpoint.v2", createdAt: "2026-10-10T00:00:00Z", source: CONTEXT.project.path,
    checkpoint: `/fixture/${label}.sqlite`, receiptPath: `/fixture/${label}.json`, checkpointSha256: HASH,
    checkpointDumpSha256: label === "library-before" ? HASH : "b".repeat(64), sourceSha256: HASH, sourceDumpSha256: HASH, receiptSha256: HASH,
    sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" }, checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" } });
  const session = { gatewayInstanceId: "G".repeat(43), sessionId: "S".repeat(43), authenticationReceiptSha256: HASH, authenticatedAtEpochMs: 100, sequence: 1 };
  const engine = new engines.EasyedaControlEngine({
    callTool: (): Promise<never> => Promise.reject(new Error("Unexpected upstream call")),
    bridgeSessionLifecycle: (): unknown => ({ schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: session.gatewayInstanceId, activeSession: session }),
    beginAuthenticatedBridgeDispatch: (gatewayInstanceId, sessionId): AuthenticatedBridgeDispatchBinding => ({ schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId, sessionId,
      sessionSequence: 1, begunAtEpochMs: 101, leaseId: "L".repeat(43), bindingReceipt: "B".repeat(43) }),
    endAuthenticatedBridgeDispatch: (): void => { if (options.cleanupFailure === true) { throw new Error("Fixture settled-dispatch cleanup failure"); } },
    abortAuthenticatedBridgeDispatch: (): { released: boolean; retainedUntilSessionClose: boolean } => ({ released: false, retainedUntilSessionClose: true }),
  }, {
    executionAuthorityValidator: {
      capture: (input): Promise<ExecutionAuthorityEvidence> => {
        const processes = [{ pid: 123, role: "fixture", startIdentity: "synthetic-process-birth" }];
        const body = { schema: "easyeda-pro-control.execution-authority.v1" as const, bindingSha256: input.bindingSha256,
          capturedAt: new Date(100).toISOString(), policyId: "synthetic-retained-job", policySha256: HASH, processes, processTreeSha256: sha256Json(processes) };
        return Promise.resolve({ ...body, authoritySha256: sha256Json(body) });
      },
      releaseCapture: (): Promise<void> => Promise.resolve(),
      proveTerminated: (): Promise<never> => Promise.reject(new Error("Unused termination")),
    },
  });
  mock.method(engine, "runtimeIdentity", () => Promise.resolve({ kind: "runtime-identity", generation: "synthetic-generation-001", timeOrigin: 100, processId: null }));
  mock.method(engine, "status", (): Promise<unknown> => Promise.resolve({ stableFingerprint: identity }));
  mock.method(engine, "context", (): Promise<unknown> => Promise.resolve(structuredClone(CONTEXT)));
  mock.method(engine, "assertContext", (expected: ExpectedContext): Promise<unknown> => {
    assert.deepEqual(expected, CONTEXT); return contextValid ? Promise.resolve(structuredClone(CONTEXT)) : Promise.reject(new Error("Fixture final context drift"));
  });
  mock.method(engine, "assertRecoveryOperationIsolated", (): Promise<true> => Promise.resolve(true));
  mock.method(engine, "awaitProjectUploads", (): Promise<unknown> => Promise.resolve({ scheduledWritesSettled: true, savedEditorChanges: false }));
  mock.method(engine, "exactRead", (): Promise<unknown> => Promise.resolve({ source: writes > 0 && options.activeSourceFault === true ? "changed" : "unchanged complete source" }));
  const manifest = loadReviewedCompatibilityManifest();
  engine.upstream.installedEasyedaBundles = (): Promise<InstalledEasyedaBundles> => Promise.resolve({ available: true, assetsRoot: "/fixture/assets",
    pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/fixture/pcb.js" },
    publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/fixture/api.js", adapterPath: "/fixture/adapter.js", declarationsPath: "/fixture/api.d.ts" } });
  mock.method(engine, "checkpoint", (input: { receiptPath?: string; label?: string }): Promise<unknown> => {
    const label = input.label ?? input.receiptPath?.slice("/fixture/".length, -".json".length) ?? "missing";
    if (input.receiptPath === undefined) { return Promise.resolve(checkpoint(label)); }
    verifications += 1;
    if (options.contextFault === "execute-final" && label === "library-after" || options.contextFault === "recovery-final" && label === "library-reconciled") { contextValid = false; }
    const substitute = options.checkpointFault === "admission" && verifications === 2 || options.checkpointFault === "final" && label === "library-after";
    return Promise.resolve({ ...checkpoint(label), ...(substitute ? { checkpoint: "/fixture/substitute.sqlite" } : {}), ok: true,
      sourceChanged: false, sourceEqualsCheckpoint: true, sourceMatchesReceipt: true, checkpointMatchesReceipt: true });
  });
  const executeNative = async (journal: LibraryJournal, name: string, args: Value): Promise<unknown> => {
    dispatches += 1; operationId = journal.operationId; assert.equal(name, "easyeda_execute");
    const retained = await artifacts.loadOperation(operationId); assert.equal(retained["state"], "execute-dispatching");
    assert.deepEqual(retained["pageRenamePlan"], journal.pageRenamePlan); assert.ok(journal.artifacts.some((entry) => entry.path.endsWith("page-rename-prepared.json")));
    if (dispatches > 1) {
      assert.ok(retained.artifacts);
      assert.equal(retained.artifacts.filter((entry) => entry.path.endsWith("native-return.json")).length, 1);
      assert.ok(isRecord(retained["mutationReceipt"])); assert.equal(retained["mutationReceipt"]["targetId"], "page");
    }
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(CONTEXT.project) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(CONTEXT.document) },
      dmt_Schematic: { getCurrentSchematicInfo: (): Promise<unknown> => Promise.resolve(CONTEXT.schematic),
        modifySchematicPageName: (): never => { throw new Error("Unsafe public setter must not run."); } },
      dmt_EditorControl: { getSplitScreenTree: (): Promise<unknown> => Promise.resolve({ tabs: [CONTEXT.document] }) } };
    const code = args["code"]; assert.equal(typeof code, "string");
    const native = { PRO_EDITOR_VERSION: "3.2", gVars: { isHistoryMode: false, currentProject: { projectId: "project", branchUuid: "branch", isV2Format: false }, messageBus: { rpcCall: (topic: string, parameters: unknown): Promise<unknown> => {
      const page = { uuid: "page", project_uuid: "project", schematic_uuid: "parent", display_title: writes > 0 ? "Renamed" : "page", source: "", docType: 1, zIndex: 1 };
      if (topic === "/PrjDB/sheet/getData") {
        if (writes > 0 && readbackFailureRemaining) { readbackFailureRemaining = false; return Promise.resolve({ message: { ...page, display_title: "wrong" } }); }
        return Promise.resolve({ message: page });
      }
      if (topic === "/PrjDB/schematic/getData") { return Promise.resolve({ message: { uuid: "parent", project_uuid: "project", display_name: "Container", source: "" } }); }
      if (topic === "/PrjDB/project/getData") { return Promise.resolve({ message: { uuid: "project", owner: { uuid: "owner" }, currentBranch: "branch", isV2Format: false } }); }
      assert.equal(topic, "/PrjDB/sheet/updateData"); assert.deepEqual(parameters, [{ uuid: "page", title: "Renamed" }, "project"]);
      writes += 1; return Promise.resolve({ message: { success: options.invalidAcknowledgment !== true, result: { ...page, display_title: "Renamed" } } });
    } } }, UI: { concurrentDesign: { isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb: (): { disable: false } => ({ disable: false }) },
      tabBar: { getFilterTabs: (): unknown[] => [{ tabId: "active@project", data: { doctype: 1, pid: "project" }, isUnSaved: false }],
      getActiveTab: (): string => "active@project", hasTabUnSaved: (): boolean => false, isTabUnSaved: (): boolean => false } } };
    // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Execute the real fixed program against isolated native doubles only.
    const execute = new Function("eda", "globalThis", `return (async()=>{${String(code)}})();`);
    let reply: Value;
    try {
      // oxlint-disable-next-line typescript/no-unsafe-call -- Preserve unknown until executor parsing.
      const pending: unknown = execute(eda, native); const result: unknown = await pending;
      reply = { success: true, result };
    } catch (error) {
      assert.ok(error instanceof Error);
      reply = { success: false, result: { error: { code: "EASYEDA_API_ERROR", message: error.message } } };
    }
    if (dispatches === 1 && options.publicationFailure !== undefined) { await artifacts.writePhaseArtifact(operationId, options.publicationFailure === "native-return" ? 3 : 5,
      options.publicationFailure, { faultInjection: "exclusive-publication-collision" }); }
    return { content: [{ type: "text", text: JSON.stringify(reply) }] };
  };
  // Exercise real lease, orphan and settled-result retention ordering. Only the
  // Native transport and process-authority evidence are synthetic.
  let dispatchJournal: LibraryJournal | undefined;
  const dispatch = engine.dispatchWithOrphanTracking.bind(engine);
  mock.method(engine, "dispatchWithOrphanTracking", (journal: LibraryJournal, ...args: Parameters<typeof dispatch> extends [unknown, ...infer Rest] ? Rest : never): Promise<unknown> => {
    dispatchJournal = journal; return dispatch(journal, ...args);
  });
  engine.upstream.callTool = (name, args): Promise<unknown> => { assert.ok(dispatchJournal); assert.ok(args); return executeNative(dispatchJournal, name, args); };
  const executor = new library.LibraryExecutor(engine, {
    readNativeHistoryCheckpoint: (input): Promise<NativeHistorySnapshot> => Promise.resolve(history(input.checkpointPath !== "/fixture/library-before.sqlite" && writes > 0,
      input.checkpointPath !== "/fixture/library-before.sqlite" && writes > 0 && peer)),
    verifyLibraryNativeProfile: (): Promise<typeof LIBRARY_NATIVE_IMPLEMENTATION> => Promise.resolve(LIBRARY_NATIVE_IMPLEMENTATION),
    verifyDeviceAssociationNativeProfile: (): Promise<void> => Promise.resolve(),
    verifySchematicNativeProfile: (): Promise<typeof SCHEMATIC_NATIVE_IMPLEMENTATION> => options.profileFault === true ? Promise.reject(new Error("Fixture schematic profile drift")) : Promise.resolve(SCHEMATIC_NATIVE_IMPLEMENTATION),
  });
  return { executor, request: { operation: OPERATION, expectedContext: CONTEXT, expectedFingerprint: identity, confirmWrite: true },
    operationId: (): string => operationId, counts: (): { dispatches: number; writes: number } => ({ dispatches, writes }), resetPeer: (): void => { peer = false; } };
}

void test("page executor seals its exact plan before one native metadata dispatch and verifies complete durable records", async () => {
  const run = fixture();
  const result = await run.executor.execute(run.request);
  assert.equal(result["state"], "completed"); assert.equal(result["saved"], true); assert.equal(result["reopened"], false);
  assert.ok(isRecord(result["result"])); assert.equal(result["result"]["currentGenerationLiveValidated"], false);
  assert.deepEqual(run.counts(), { dispatches: 2, writes: 1 });
});
void test("page executor requires explicit mutation authority and final native pins before dispatch", async () => {
  const run = fixture({ profileFault: true }); const { confirmWrite: _confirmation, ...request } = run.request;
  await assert.rejects(run.executor.execute(request), /explicit confirmation/u);
  await assert.rejects(run.executor.execute(run.request), /profile drift/u);
  assert.deepEqual(run.counts(), { dispatches: 0, writes: 0 });
});
void test("page executor rechecks checkpoint identity after final native admission, before writer dispatch", async () => {
  const run = fixture({ checkpointFault: "admission" }); await assert.rejects(run.executor.execute(run.request), /final library admission/u);
  assert.deepEqual(run.counts(), { dispatches: 0, writes: 0 });
});
void test("page executor and reconciliation reject changed active source without repeating metadata or Save", async () => {
  const run = fixture({ activeSourceFault: true }); await assert.rejects(run.executor.execute(run.request), /active design source/u);
  await assert.rejects(run.executor.reconcile(run.operationId()), /Active source differs/u);
  assert.deepEqual(run.counts(), { dispatches: 2, writes: 1 });
});
void test("page recovery completes from original native-return and original prepared artifact without redispatch", async () => {
  const run = fixture({ publicationFailure: "verified" }); await assert.rejects(run.executor.execute(run.request));
  const result = await run.executor.reconcile(run.operationId()); assert.equal(result["state"], "completed");
  assert.ok(isRecord(result["result"])); assert.equal(result["result"]["actionRepeated"], false); assert.equal(result["result"]["saveInvoked"], false);
  assert.deepEqual(run.counts(), { dispatches: 2, writes: 1 });
});
void test("page recovery refuses missing native-return evidence and does not infer the successful call from current title", async () => {
  const run = fixture({ publicationFailure: "native-return" }); await assert.rejects(run.executor.execute(run.request));
  await assert.rejects(run.executor.reconcile(run.operationId())); assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
void test("page recovery refuses prepared-plan substitution and uses the immutable operation and checkpoint", async () => {
  const run = fixture({ publicationFailure: "verified" }); await assert.rejects(run.executor.execute(run.request));
  const journal = await artifacts.loadOperation(run.operationId()); assert.ok(isRecord(journal["pageRenamePlan"]));
  journal["pageRenamePlan"]["beforeTitle"] = "changed"; await artifacts.updateOperation(journal);
  await assert.rejects(run.executor.reconcile(run.operationId()), /original prepared page rename artifact/u);
  assert.deepEqual(run.counts(), { dispatches: 2, writes: 1 });
});
void test("page effect mismatch blocks Save and recovery until exact peer invariance is proved", async () => {
  const run = fixture({ peerMutation: true }); await assert.rejects(run.executor.execute(run.request), /peer records/u);
  await assert.rejects(run.executor.reconcile(run.operationId()), /peer records/u);
  run.resetPeer(); const result = await run.executor.reconcile(run.operationId()); assert.equal(result["state"], "completed");
  assert.deepEqual(run.counts(), { dispatches: 2, writes: 1 });
});
void test("page completion refuses a substituted final checkpoint instead of accepting flags alone", async () => {
  const run = fixture({ checkpointFault: "final" }); await assert.rejects(run.executor.execute(run.request), /before completion/u);
  assert.deepEqual(run.counts(), { dispatches: 2, writes: 1 });
});
void test("page executor rechecks live context after the last awaited checkpoint proof", async () => {
  const run = fixture({ contextFault: "execute-final" }); await assert.rejects(run.executor.execute(run.request), /final context drift/u);
  assert.deepEqual(run.counts(), { dispatches: 2, writes: 1 });
});
void test("page recovery rechecks live context after the last awaited checkpoint without redispatch", async () => {
  const run = fixture({ publicationFailure: "verified", contextFault: "recovery-final" }); await assert.rejects(run.executor.execute(run.request));
  await assert.rejects(run.executor.reconcile(run.operationId()), /final context drift/u);
  assert.deepEqual(run.counts(), { dispatches: 2, writes: 1 });
});

void test("page rename retains its original acknowledgment before a failing post-write read and reconciles without replay", async () => {
  const run = fixture({ readbackFailureOnce: true }); await assert.rejects(run.executor.execute(run.request), /native-page-rename:after-read:PAGE_METADATA/u);
  const journal = await artifacts.loadOperation(run.operationId()); assert.ok(journal.artifacts);
  assert.equal(journal["orphanedCallPossible"], false);
  assert.equal(journal.artifacts.filter((entry) => entry.path.endsWith("native-return.json")).length, 1);
  const result = await run.executor.reconcile(run.operationId()); assert.equal(result["state"], "completed");
  assert.ok(isRecord(result["result"])); assert.equal(result["result"]["actionRepeated"], false);
  assert.equal(result["result"]["saveInvoked"], false); assert.deepEqual(run.counts(), { dispatches: 2, writes: 1 });
});
void test("page rename acknowledgment survives settled dispatch cleanup failure and preserves quarantine", async () => {
  const run = fixture({ cleanupFailure: true }); await assert.rejects(run.executor.execute(run.request), /settled-dispatch cleanup failure/u);
  const journal = await artifacts.loadOperation(run.operationId()); assert.ok(journal.artifacts);
  assert.equal(journal["orphanedCallPossible"], true); assert.equal(journal["hardStop"], true);
  assert.ok(isRecord(journal["mutationReceipt"])); assert.equal(journal["mutationReceipt"]["targetId"], "page");
  assert.equal(journal.artifacts.filter((entry) => entry.path.endsWith("native-return.json")).length, 1);
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
void test("an invalid settled rename acknowledgment cannot be inferred from a matching durable title", async () => {
  const run = fixture({ invalidAcknowledgment: true }); await assert.rejects(run.executor.execute(run.request), /native-page-rename:rename:ACK_INVALID/u);
  const journal = await artifacts.loadOperation(run.operationId()); assert.ok(journal.artifacts);
  assert.equal(journal["orphanedCallPossible"], false); assert.equal(journal["mutationReceipt"], undefined);
  assert.equal(journal.artifacts.some((entry) => entry.path.endsWith("native-return.json")), false);
  await assert.rejects(run.executor.reconcile(run.operationId()), /exactly one retained native-return/u);
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
