import { configureTestControlRoot } from "./test-control-root.ts";
/* oxlint-disable import/max-dependencies -- Sealed transaction tests compose real journal storage, execution and recovery with isolated native doubles. */
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { after, afterEach, before, mock, test } from "node:test";
import { isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import type { LibraryExecuteInput, LibraryExecutor, LibraryJournal } from "../src/library-execution.ts";
import type { listOperationStates, loadOperation, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import type { AuthenticatedBridgeDispatchBinding, EasyedaControlEngine, ExecutionAuthorityEvidence, ExpectedContext, InstalledEasyedaBundles } from "../src/engine.ts";
import type { CheckpointReceipt } from "../src/checkpoint.ts";
import { LIBRARY_NATIVE_IMPLEMENTATION } from "../src/library-native-profile.ts";
import { SCHEMATIC_NATIVE_IMPLEMENTATION } from "../src/native-profiles.ts";

type Value = Record<string, unknown>;
let originalRoot: string | undefined, root = "";
let library: { LibraryExecutor: typeof LibraryExecutor };
let artifacts: { listOperationStates: typeof listOperationStates; loadOperation: typeof loadOperation; updateOperation: typeof updateOperation; writePhaseArtifact: typeof writePhaseArtifact };
let engines: { EasyedaControlEngine: typeof EasyedaControlEngine };
before(async () => {
  root = await mkdtemp("/tmp/easyeda-symbol-create-transaction-");
  originalRoot = process.env["EASYEDA_CONTROL_DATA_DIR"]; configureTestControlRoot(root);
  [library, artifacts, engines] = await Promise.all([import("../src/library-execution.ts"), import("../src/artifacts.ts"), import("../src/engine.ts")]);
});
afterEach(async () => { mock.restoreAll(); await rm(join(root, "operations"), { recursive: true, force: true }); });
after(async () => {
  if (originalRoot === undefined) { configureTestControlRoot(); } else { configureTestControlRoot(originalRoot); }
  await rm(root, { recursive: true, force: true });
});
const CREATED = "c".repeat(16), HASH = "a".repeat(64);
const CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" },
  document: { uuid: "active", documentType: 3, tabId: "active@project", parentProjectUuid: "project" } };
const OPERATION = { id: "create-empty-symbol", action: "library.symbol.create", libraryUuid: "project", name: "Empty symbol", symbolType: 2, description: "Fixture" };
function history(created = false, peerChanged = false, extra = false, unsupported = false): NativeHistorySnapshot {
  const ids = ["active", "symbol", ...(created ? [CREATED] : []), ...(extra ? ["f".repeat(16)] : []), ...(unsupported ? ["instance"] : [])];
  const documents = ids.map((uuid) => {
    const docType = { active: "PCB", instance: "INSTANCE" }[uuid] ?? "SYMBOL";
    const metadata = { uuid, docType, client: "a".repeat(16), updateTime: 1, version: "1", editVersion: "3.2" };
    const body: Value = uuid === "active" ? { title: peerChanged ? "Changed" : "PCB", source: "" }
      : { title: uuid === "symbol" ? "Existing" : OPERATION.name, description: uuid === "symbol" ? "Original" : OPERATION.description, docType: 2, source: "", tags: [] };
    const records = [{ id: "META", type: "META", body, ticket: 1, client: null }];
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
interface Options { publicationFailure?: "native-return" | "verified"; peerMutation?: boolean; extraAddition?: boolean;
  checkpointFault?: "admission" | "final"; contextFault?: "execute-final" | "recovery-final";
  activeSourceFault?: boolean; profileFault?: boolean; missingAcknowledgment?: boolean; noEffect?: boolean; unsupportedHistory?: boolean;
  verificationFailureOnce?: boolean; preflightRefusal?: boolean; malformedReturn?: boolean; cleanupFailure?: boolean }
function symbol(uuid: string): Value {
  return { uuid, project_uuid: "project", path: "project", owner: { uuid: "owner" }, docType: 2,
    display_title: uuid === "symbol" ? "Existing" : OPERATION.name, description: uuid === "symbol" ? "Original" : OPERATION.description, source: "", custom_tags: "[]" };
}
function fixture(options: Options = {}): { executor: LibraryExecutor; request: LibraryExecuteInput; operationId: () => string;
  counts: () => { dispatches: number; writes: number }; resetPeer: () => void; resetHistory: () => void } {
  const identity = fingerprint(), manifest = loadReviewedCompatibilityManifest();
  let remainingVerificationFailure = options.verificationFailureOnce === true;
  let contextValid = true, dispatches = 0, operationId = "", peer = options.peerMutation === true, unsupported = options.unsupportedHistory === true, verifications = 0, writes = 0;
  const checkpoint = (label: string): CheckpointReceipt => ({ schema: "easyeda-pro-control.checkpoint.v2", createdAt: "2026-10-10T00:00:00Z", source: CONTEXT.project.path,
    checkpoint: `/fixture/${label}.sqlite`, receiptPath: `/fixture/${label}.json`, checkpointSha256: HASH,
    checkpointDumpSha256: label === "library-before" || writes === 0 ? HASH : "b".repeat(64), sourceSha256: HASH, sourceDumpSha256: HASH, receiptSha256: HASH,
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
  mock.method(engine, "status", async (): Promise<unknown> => {
    if (writes > 0 && remainingVerificationFailure) {
      remainingVerificationFailure = false;
      const retained = await artifacts.loadOperation(operationId);
      assert.ok(retained.artifacts);
      assert.ok(retained.artifacts.some((entry) => entry.path.endsWith("native-return.json")));
      throw new Error("Fixture one-shot post-publication verification failure");
    }
    return { stableFingerprint: identity };
  });
  mock.method(engine, "context", (): Promise<unknown> => Promise.resolve(structuredClone(CONTEXT)));
  mock.method(engine, "assertContext", (expected: ExpectedContext): Promise<unknown> => {
    assert.deepEqual(expected, CONTEXT); return contextValid ? Promise.resolve(structuredClone(CONTEXT)) : Promise.reject(new Error("Fixture final context drift"));
  });
  mock.method(engine, "assertRecoveryOperationIsolated", (): Promise<true> => Promise.resolve(true));
  mock.method(engine, "awaitProjectUploads", (): Promise<unknown> => Promise.resolve({ scheduledWritesSettled: true, savedEditorChanges: false }));
  mock.method(engine, "exactRead", (): Promise<unknown> => Promise.resolve({ source: writes > 0 && options.activeSourceFault === true ? "changed" : "unchanged complete source" }));
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
    assert.deepEqual(retained["symbolCreatePlan"], journal.symbolCreatePlan); assert.ok(journal.artifacts.some((entry) => entry.path.endsWith("symbol-create-prepared.json")));
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(CONTEXT.project) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(CONTEXT.document) },
      lib_Symbol: { create: (): never => { throw new Error("Public source routing must not run."); } } };
    const code = args["code"]; assert.equal(typeof code, "string");
    const manager = { hasLib: (): boolean => false };
    const native = { extendLibManager: manager, PRO_EDITOR_VERSION: "3.2", gVars: { extendLibStore: { manager }, isHistoryMode: false, currentProject: { projectId: "project", branchUuid: "branch", isV2Format: false },
      messageBus: { rpcCall: (topic: string, parameters: unknown): Promise<unknown> => {
        if (topic === "canAddLib") { return Promise.resolve({ message: { hasPermission: options.preflightRefusal !== true } }); }
        if (topic === "/PrjDB/symbol/getStr") { assert.deepEqual(parameters, ["", "project"]); return Promise.resolve({ message: undefined }); }
        if (topic === "/PrjDB/project/getData") { return Promise.resolve({ message: { uuid: "project", owner: { uuid: "owner" }, currentBranch: "branch", isV2Format: false } }); }
        if (topic === "/PrjDB/symbol/getAllKVDatas") { return Promise.resolve({ message: { symbol: symbol("symbol"), ...(writes > 0 ? { [CREATED]: symbol(CREATED) } : {}) } }); }
        assert.equal(topic, "/PrjDB/symbol/createData"); assert.deepEqual(parameters, [{ uuid: "", isProject: true, path: "project", docType: 2,
          title: OPERATION.name, display_title: OPERATION.name, description: OPERATION.description, custom_tags: "[]", source: "" }, "project"]);
        if (options.noEffect === true) { return Promise.resolve({ message: null }); }
        writes += 1; return Promise.resolve({ message: options.missingAcknowledgment === true ? null : { success: true, result: symbol(CREATED) } });
      } } }, UI: { concurrentDesign: { isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb: (): { disable: false } => ({ disable: false }) },
      tabBar: { getFilterTabs: (): unknown[] => [{ tabId: "0", data: { doctype: 0 }, isAbleDelete: false, isDisplayNone: true, draggable: false, group: "start_blank" },
        { tabId: "active@project", data: { doctype: 3, pid: "project" }, isUnSaved: false }],
      getActiveTab: (): string => "active@project", hasTabUnSaved: (): boolean => false, isTabUnSaved: (): boolean => false } } };
    // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Execute only the fixed reviewed program against synthetic native doubles.
    const execute = new Function("eda", "globalThis", `return (async()=>{${String(code)}})();`);
    let reply: Value;
    try {
      // oxlint-disable-next-line typescript/no-unsafe-call -- Preserve unknown until executor parsing.
      const pending: unknown = execute(eda, native); const result: unknown = await pending;
      reply = { success: true, result: options.malformedReturn === true ? { schema: "malformed-native-envelope" } : result };
    } catch (error) {
      assert.ok(error instanceof Error);
      reply = { success: false, result: { error: { code: "EASYEDA_API_ERROR", message: error.message } } };
    }
    if (options.publicationFailure !== undefined) { await artifacts.writePhaseArtifact(operationId, options.publicationFailure === "native-return" ? 3 : 4,
      options.publicationFailure, { faultInjection: "exclusive-publication-collision" }); }
    return { content: [{ type: "text", text: JSON.stringify(reply) }] };
  };
  // Keep the real dispatch/authority/publication ordering. Only its native
  // Transport and process evidence are synthetic; no bridge or CAD is started.
  let dispatchJournal: LibraryJournal | undefined;
  const dispatch = engine.dispatchWithOrphanTracking.bind(engine);
  mock.method(engine, "dispatchWithOrphanTracking", (journal: LibraryJournal, ...args: Parameters<typeof dispatch> extends [unknown, ...infer Rest] ? Rest : never): Promise<unknown> => {
    dispatchJournal = journal; return dispatch(journal, ...args);
  });
  engine.upstream.callTool = (name, args): Promise<unknown> => { assert.ok(dispatchJournal); assert.ok(args); return executeNative(dispatchJournal, name, args); };
  const executor = new library.LibraryExecutor(engine, {
    readNativeHistoryCheckpoint: (input): Promise<NativeHistorySnapshot> => {
      const changed = input.checkpointPath !== "/fixture/library-before.sqlite" && writes > 0;
      return Promise.resolve(history(changed, changed && peer, changed && options.extraAddition === true, unsupported));
    },
    verifyLibraryNativeProfile: (): Promise<typeof LIBRARY_NATIVE_IMPLEMENTATION> => Promise.resolve(LIBRARY_NATIVE_IMPLEMENTATION),
    verifyDeviceAssociationNativeProfile: (): Promise<void> => options.profileFault === true ? Promise.reject(new Error("Fixture worker profile drift")) : Promise.resolve(),
    verifySchematicNativeProfile: (): Promise<typeof SCHEMATIC_NATIVE_IMPLEMENTATION> => Promise.resolve(SCHEMATIC_NATIVE_IMPLEMENTATION),
  });
  return { executor, request: { operation: OPERATION, expectedContext: CONTEXT, expectedFingerprint: identity, confirmWrite: true },
    operationId: (): string => operationId, counts: (): { dispatches: number; writes: number } => ({ dispatches, writes }), resetPeer: (): void => { peer = false; },
    resetHistory: (): void => { unsupported = false; } };
}

void test("symbol creation seals local-origin plan before exactly one native worker create and complete project proof", async () => {
  const run = fixture(); const result = await run.executor.execute(run.request);
  assert.equal(result["state"], "completed"); assert.equal(result["saved"], true); assert.equal(result["reopened"], false);
  assert.ok(isRecord(result["result"])); assert.equal(result["result"]["createdId"], CREATED);
  assert.ok(isRecord(result["result"]["proof"])); assert.equal(result["result"]["proof"]["emptySymbol"], true);
  const retained = await artifacts.loadOperation(run.operationId()); assert.ok(retained.artifacts);
  assert.equal(retained.artifacts.filter((entry) => entry.path.endsWith("native-return.json")).length, 1);
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
void test("symbol creation requires explicit authority and an exact collection before dispatch", async () => {
  const run = fixture(), { confirmWrite: _authority, ...request } = run.request;
  await assert.rejects(run.executor.execute(request), /explicit confirmation/u);
  await assert.rejects(run.executor.execute({ ...run.request, operation: { ...OPERATION, libraryUuid: "foreign" } }), /current-project collection/u);
  assert.deepEqual(run.counts(), { dispatches: 0, writes: 0 });
  assert.deepEqual(await artifacts.listOperationStates(), []);
  const result = await run.executor.execute(run.request); assert.equal(result["state"], "completed");
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
void test("unsupported creation history refuses before journaling and does not block a subsequent valid operation", async () => {
  const run = fixture({ unsupportedHistory: true }); await assert.rejects(run.executor.execute(run.request), /hierarchical instances/u);
  assert.deepEqual(run.counts(), { dispatches: 0, writes: 0 }); assert.deepEqual(await artifacts.listOperationStates(), []);
  run.resetHistory(); const result = await run.executor.execute(run.request); assert.equal(result["state"], "completed");
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
void test("symbol creation verifies its final worker implementation before dispatch", async () => {
  const run = fixture({ profileFault: true }); await assert.rejects(run.executor.execute(run.request), /worker profile drift/u);
  assert.deepEqual(run.counts(), { dispatches: 0, writes: 0 });
});
void test("symbol creation refuses final baseline drift before native add", async () => {
  const run = fixture({ checkpointFault: "admission" }); await assert.rejects(run.executor.execute(run.request), /final library admission/u);
  assert.deepEqual(run.counts(), { dispatches: 0, writes: 0 });
});
void test("symbol creation reconciles the original retained returned identity without recreating", async () => {
  const run = fixture({ publicationFailure: "verified" }); await assert.rejects(run.executor.execute(run.request));
  await assert.rejects(run.executor.reconcileNoMutation(run.operationId()), /Durable library changed/u);
  const result = await run.executor.reconcile(run.operationId()); assert.equal(result["state"], "completed");
  assert.ok(isRecord(result["result"])); assert.equal(result["result"]["createdId"], CREATED); assert.equal(result["result"]["actionRepeated"], false);
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
void test("symbol creation publishes original ID before library post-return verification and reconciles its failure without recreating", async () => {
  const run = fixture({ verificationFailureOnce: true });
  await assert.rejects(run.executor.execute(run.request), /post-publication/u);
  const result = await run.executor.reconcile(run.operationId()); assert.equal(result["state"], "completed");
  assert.ok(isRecord(result["result"])); assert.equal(result["result"]["createdId"], CREATED); assert.equal(result["result"]["actionRepeated"], false);
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
for (const options of [{ publicationFailure: "native-return" } as const, { missingAcknowledgment: true }]) {
  // oxlint-disable-next-line eslint/no-loop-func -- The before hook initializes shared module handles once for all independent const cases.
  void test(`one observed symbol addition without original returned identity remains unresolved ${JSON.stringify(options)}`, async () => {
    const run = fixture(options); await assert.rejects(run.executor.execute(run.request)); await assert.rejects(run.executor.reconcile(run.operationId()));
    const journal = await artifacts.loadOperation(run.operationId()); assert.equal(journal["hardStop"], true);
    assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
  });
}
void test("a refused create with unchanged complete baseline can reconcile no mutation without retry", async () => {
  const run = fixture({ noEffect: true }); await assert.rejects(run.executor.execute(run.request));
  const result = await run.executor.reconcileNoMutation(run.operationId()); assert.equal(result["state"], "reconciled-no-mutation");
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 0 });
});
void test("settled preflight refusal clears real engine authority without a fake native identity and reconciles only the baseline", async () => {
  const run = fixture({ preflightRefusal: true });
  await assert.rejects(run.executor.execute(run.request), /native-symbol-create:permission/u);
  const retained = await artifacts.loadOperation(run.operationId()); assert.ok(retained.artifacts);
  assert.equal(retained["orphanedCallPossible"], false); assert.equal(retained["hardStop"], true);
  assert.equal(retained["mutationReceipt"], undefined);
  assert.equal(retained.artifacts.some((entry) => entry.path.endsWith("native-return.json")), false);
  const result = await run.executor.reconcileNoMutation(run.operationId());
  assert.equal(result["state"], "reconciled-no-mutation"); assert.deepEqual(run.counts(), { dispatches: 1, writes: 0 });
});
for (const options of [{ missingAcknowledgment: true }, { malformedReturn: true }]) {
  // oxlint-disable-next-line eslint/no-loop-func -- Shared artifact module is initialized once by before; each const case owns its runtime fixture.
  void test(`settled invalid acknowledgment clears execution quarantine but cannot attribute changed state ${JSON.stringify(options)}`, async () => {
    const run = fixture(options); await assert.rejects(run.executor.execute(run.request));
    const retained = await artifacts.loadOperation(run.operationId()); assert.ok(retained.artifacts);
    assert.equal(retained["orphanedCallPossible"], false); assert.equal(retained["hardStop"], true);
    assert.equal(retained["mutationReceipt"], undefined);
    assert.equal(retained.artifacts.some((entry) => entry.path.endsWith("native-return.json")), false);
    await assert.rejects(run.executor.reconcileNoMutation(run.operationId()), /Durable library changed/u);
    await assert.rejects(run.executor.reconcile(run.operationId()), /exactly one retained native-return/u);
    assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
  });
}
void test("real engine publication failure still quarantines a creation with a valid original identity", async () => {
  const run = fixture({ publicationFailure: "native-return" }); await assert.rejects(run.executor.execute(run.request));
  const retained = await artifacts.loadOperation(run.operationId()); assert.ok(retained.artifacts);
  assert.equal(retained["orphanedCallPossible"], true); assert.equal(retained["hardStop"], true);
  assert.equal(retained.artifacts.some((entry) => entry.path.endsWith("native-return.json")), false);
  await assert.rejects(run.executor.reconcile(run.operationId()), /termination/u);
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
void test("settled result validation does not replace a failed authority cleanup error", async () => {
  const run = fixture({ preflightRefusal: true, cleanupFailure: true });
  await assert.rejects(run.executor.execute(run.request), /settled-dispatch cleanup failure/u);
  const retained = await artifacts.loadOperation(run.operationId());
  assert.equal(retained["orphanedCallPossible"], true); assert.equal(retained["mutationReceipt"], undefined);
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 0 });
});
for (const options of [{ peerMutation: true }, { extraAddition: true }, { activeSourceFault: true }]) {
  void test(`symbol creation rejects collateral effects and recovery never replays ${JSON.stringify(options)}`, async () => {
    const run = fixture(options); await assert.rejects(run.executor.execute(run.request)); await assert.rejects(run.executor.reconcile(run.operationId()));
    assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
  });
}
void test("symbol creation recovery rejects a substituted journal plan", async () => {
  const run = fixture({ publicationFailure: "verified" }); await assert.rejects(run.executor.execute(run.request));
  const journal = await artifacts.loadOperation(run.operationId()); assert.ok(isRecord(journal["symbolCreatePlan"]));
  journal["symbolCreatePlan"]["name"] = "Forged"; await artifacts.updateOperation(journal);
  await assert.rejects(run.executor.reconcile(run.operationId()), /original operation and checkpoint/u);
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
for (const contextFault of ["execute-final", "recovery-final"] as const) {
  // oxlint-disable-next-line eslint/no-loop-func -- Shared module handles are initialized by before, independently of each const case.
  void test(`symbol creation ${contextFault} refuses last-checkpoint context drift`, async () => {
    const run = fixture({ contextFault, ...(contextFault === "recovery-final" ? { publicationFailure: "verified" } : {}) });
    await assert.rejects(run.executor.execute(run.request));
    if (contextFault === "recovery-final") { await assert.rejects(run.executor.reconcile(run.operationId())); }
    const journal = await artifacts.loadOperation(run.operationId()); assert.equal(journal["hardStop"], true);
    assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
  });
}
void test("symbol creation refuses final checkpoint substitution", async () => {
  const run = fixture({ checkpointFault: "final" }); await assert.rejects(run.executor.execute(run.request), /before completion/u);
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
