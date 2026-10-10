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
import type { EasyedaControlEngine, ExpectedContext, InstalledEasyedaBundles } from "../src/engine.ts";
import type { CheckpointReceipt } from "../src/checkpoint.ts";
import { LIBRARY_NATIVE_IMPLEMENTATION } from "../src/library-native-profile.ts";
import { SCHEMATIC_NATIVE_IMPLEMENTATION } from "../src/native-profiles.ts";

type Value = Record<string, unknown>;
let originalRoot: string | undefined, root = "";
let library: { LibraryExecutor: typeof LibraryExecutor };
let artifacts: { listOperationStates: typeof listOperationStates; loadOperation: typeof loadOperation; updateOperation: typeof updateOperation; writePhaseArtifact: typeof writePhaseArtifact };
let engines: { EasyedaControlEngine: typeof EasyedaControlEngine };
before(async () => {
  root = await mkdtemp("/tmp/easyeda-page-create-transaction-");
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
const OPERATION = { id: "create-empty-page", action: "document.page.create", schematic: { uuid: "parent" } };
function history(created = false, peerChanged = false, extra = false, unsupported = false): NativeHistorySnapshot {
  const ids = ["parent", "active", "page", ...(created ? [CREATED] : []), ...(extra ? ["f".repeat(16)] : []), ...(unsupported ? ["instance"] : [])];
  const documents = ids.map((uuid) => {
    const docType = { parent: "SCH", active: "PCB", instance: "INSTANCE" }[uuid] ?? "SCH_PAGE";
    const metadata = { uuid, docType, client: "a".repeat(16), updateTime: 1, version: "1", editVersion: "3.2" };
    let body: Value;
    if (uuid === "parent") { body = { title: "Container", source: "", board: "" }; }
    else if (uuid === "active") { body = { title: peerChanged ? "Changed" : "PCB", source: "" }; }
    else { body = { title: uuid === "page" ? "P1" : "P2", schematic: "parent", source: "", zIndex: uuid === "page" ? 1 : 2 }; }
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
  activeSourceFault?: boolean; profileFault?: boolean; missingAcknowledgment?: boolean; noEffect?: boolean; unsupportedHistory?: boolean; verificationFailureOnce?: boolean }
function page(uuid: string): Value {
  return { uuid, project_uuid: "project", schematic_uuid: "parent", docType: 1,
    display_title: uuid === "page" ? "P1" : "P2", source: "", zIndex: uuid === "page" ? 1 : 2 };
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
  const engine = new engines.EasyedaControlEngine({ callTool: (): Promise<never> => Promise.reject(new Error("Unexpected upstream call")) }, {
    executionAuthorityValidator: { capture: (): Promise<never> => Promise.reject(new Error("Unused capture")), proveTerminated: (): Promise<never> => Promise.reject(new Error("Unused termination")) },
  });
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
  mock.method(engine, "dispatchWithOrphanTracking", async (journal: LibraryJournal, phase: string, name: string, args: Value,
    _timeoutMs?: number, _beforeDispatch?: () => Promise<void>, retainSettledResult?: (result: unknown) => Promise<void>): Promise<unknown> => {
    dispatches += 1; operationId = journal.operationId; assert.equal(phase, "execute"); assert.equal(name, "easyeda_execute");
    const retained = await artifacts.loadOperation(operationId); assert.equal(retained["state"], "execute-dispatching");
    assert.deepEqual(retained["pageCreatePlan"], journal.pageCreatePlan); assert.ok(journal.artifacts.some((entry) => entry.path.endsWith("page-create-prepared.json")));
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(CONTEXT.project) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(CONTEXT.document) },
      dmt_Schematic: { createSchematicPage: (): never => { throw new Error("Template/init/open public workflow must not run."); } } };
    const code = args["code"]; assert.equal(typeof code, "string");
    const native = { PRO_EDITOR_VERSION: "3.2", gVars: { isHistoryMode: false, currentProject: { projectId: "project", branchUuid: "branch", isV2Format: false },
      messageBus: { rpcCall: (topic: string, parameters: unknown): Promise<unknown> => {
        if (topic === "ui/hasDocCreatePermission") { return Promise.resolve({ message: true }); }
        if (topic === "/PrjDB/schematic/getData") { return Promise.resolve({ message: { uuid: "parent", project_uuid: "project", display_name: "Container", source: "" } }); }
        if (topic === "/PrjDB/project/getData") { return Promise.resolve({ message: { uuid: "project", owner: { uuid: "owner" }, currentBranch: "branch", isV2Format: false } }); }
        if (topic === "/PrjDB/sheet/getAllKVDatas") { return Promise.resolve({ message: { page: page("page"), ...(writes > 0 ? { [CREATED]: page(CREATED) } : {}) } }); }
        assert.equal(topic, "/PrjDB/sheet/addData"); assert.deepEqual(parameters, [{ schematic_uuid: "parent", title: "P2", zIndex: 2 }, "project"]);
        if (options.noEffect === true) { return Promise.resolve({ message: null }); }
        writes += 1; return Promise.resolve({ message: options.missingAcknowledgment === true ? null : page(CREATED) });
      } } }, UI: { concurrentDesign: { isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb: (): { disable: false } => ({ disable: false }) },
      tabBar: { getFilterTabs: (): unknown[] => [{ tabId: "0", data: { doctype: 0 }, isAbleDelete: false, isDisplayNone: true, draggable: false, group: "start_blank" },
        { tabId: "active@project", data: { doctype: 3, pid: "project" }, isUnSaved: false }],
      getActiveTab: (): string => "active@project", hasTabUnSaved: (): boolean => false, isTabUnSaved: (): boolean => false } } };
    // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Execute only the fixed reviewed program against synthetic native doubles.
    const execute = new Function("eda", "globalThis", `return (async()=>{${String(code)}})();`);
    // oxlint-disable-next-line typescript/no-unsafe-call -- Preserve unknown until executor parsing.
    const pending: unknown = execute(eda, native); const result: unknown = await pending;
    if (options.publicationFailure !== undefined) { await artifacts.writePhaseArtifact(operationId, options.publicationFailure === "native-return" ? 3 : 4,
      options.publicationFailure, { faultInjection: "exclusive-publication-collision" }); }
    const raw = { content: [{ type: "text", text: JSON.stringify({ success: true, result }) }] };
    assert.ok(retainSettledResult); await retainSettledResult(raw);
    return raw;
  });
  const executor = new library.LibraryExecutor(engine, {
    readNativeHistoryCheckpoint: (input): Promise<NativeHistorySnapshot> => {
      const changed = input.checkpointPath !== "/fixture/library-before.sqlite" && writes > 0;
      return Promise.resolve(history(changed, changed && peer, changed && options.extraAddition === true, unsupported));
    },
    verifyLibraryNativeProfile: (): Promise<typeof LIBRARY_NATIVE_IMPLEMENTATION> => Promise.resolve(LIBRARY_NATIVE_IMPLEMENTATION),
    verifyDeviceAssociationNativeProfile: (): Promise<void> => Promise.resolve(),
    verifySchematicNativeProfile: (): Promise<typeof SCHEMATIC_NATIVE_IMPLEMENTATION> => options.profileFault === true ? Promise.reject(new Error("Fixture schematic profile drift")) : Promise.resolve(SCHEMATIC_NATIVE_IMPLEMENTATION),
  });
  return { executor, request: { operation: OPERATION, expectedContext: CONTEXT, expectedFingerprint: identity, confirmWrite: true },
    operationId: (): string => operationId, counts: (): { dispatches: number; writes: number } => ({ dispatches, writes }), resetPeer: (): void => { peer = false; },
    resetHistory: (): void => { unsupported = false; } };
}

void test("page creation seals parent/default plan before exactly one native worker add and complete project proof", async () => {
  const run = fixture(); const result = await run.executor.execute(run.request);
  assert.equal(result["state"], "completed"); assert.equal(result["saved"], true); assert.equal(result["reopened"], false);
  assert.ok(isRecord(result["result"])); assert.equal(result["result"]["createdId"], CREATED);
  assert.ok(isRecord(result["result"]["proof"])); assert.equal(result["result"]["proof"]["emptyPage"], true);
  const retained = await artifacts.loadOperation(run.operationId()); assert.ok(retained.artifacts);
  assert.equal(retained.artifacts.filter((entry) => entry.path.endsWith("native-return.json")).length, 1);
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
void test("page creation requires explicit authority and an exact parent before dispatch", async () => {
  const run = fixture(), { confirmWrite: _authority, ...request } = run.request;
  await assert.rejects(run.executor.execute(request), /explicit confirmation/u);
  await assert.rejects(run.executor.execute({ ...run.request, operation: { ...OPERATION, schematic: { uuid: "foreign" } } }), /parent or active/u);
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
void test("page creation verifies its final schematic native implementation before dispatch", async () => {
  const run = fixture({ profileFault: true }); await assert.rejects(run.executor.execute(run.request), /schematic profile drift/u);
  assert.deepEqual(run.counts(), { dispatches: 0, writes: 0 });
});
void test("page creation refuses final baseline drift before native add", async () => {
  const run = fixture({ checkpointFault: "admission" }); await assert.rejects(run.executor.execute(run.request), /final library admission/u);
  assert.deepEqual(run.counts(), { dispatches: 0, writes: 0 });
});
void test("page creation reconciles the original retained returned identity without recreating", async () => {
  const run = fixture({ publicationFailure: "verified" }); await assert.rejects(run.executor.execute(run.request));
  await assert.rejects(run.executor.reconcileNoMutation(run.operationId()), /Durable library changed/u);
  const result = await run.executor.reconcile(run.operationId()); assert.equal(result["state"], "completed");
  assert.ok(isRecord(result["result"])); assert.equal(result["result"]["createdId"], CREATED); assert.equal(result["result"]["actionRepeated"], false);
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
void test("page creation publishes original ID before library post-return verification and reconciles its failure without recreating", async () => {
  const run = fixture({ verificationFailureOnce: true });
  await assert.rejects(run.executor.execute(run.request), /post-publication/u);
  const result = await run.executor.reconcile(run.operationId()); assert.equal(result["state"], "completed");
  assert.ok(isRecord(result["result"])); assert.equal(result["result"]["createdId"], CREATED); assert.equal(result["result"]["actionRepeated"], false);
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
for (const options of [{ publicationFailure: "native-return" } as const, { missingAcknowledgment: true }]) {
  // oxlint-disable-next-line eslint/no-loop-func -- The before hook initializes shared module handles once for all independent const cases.
  void test(`one observed page addition without original returned identity remains unresolved ${JSON.stringify(options)}`, async () => {
    const run = fixture(options); await assert.rejects(run.executor.execute(run.request)); await assert.rejects(run.executor.reconcile(run.operationId()));
    const journal = await artifacts.loadOperation(run.operationId()); assert.equal(journal["hardStop"], true);
    assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
  });
}
void test("a refused add with unchanged complete baseline can reconcile no mutation without retry", async () => {
  const run = fixture({ noEffect: true }); await assert.rejects(run.executor.execute(run.request));
  const result = await run.executor.reconcileNoMutation(run.operationId()); assert.equal(result["state"], "reconciled-no-mutation");
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 0 });
});
for (const options of [{ peerMutation: true }, { extraAddition: true }, { activeSourceFault: true }]) {
  void test(`page creation rejects collateral effects and recovery never replays ${JSON.stringify(options)}`, async () => {
    const run = fixture(options); await assert.rejects(run.executor.execute(run.request)); await assert.rejects(run.executor.reconcile(run.operationId()));
    assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
  });
}
void test("page creation recovery rejects a substituted journal plan", async () => {
  const run = fixture({ publicationFailure: "verified" }); await assert.rejects(run.executor.execute(run.request));
  const journal = await artifacts.loadOperation(run.operationId()); assert.ok(isRecord(journal["pageCreatePlan"]));
  journal["pageCreatePlan"]["desiredTitle"] = "Forged"; await artifacts.updateOperation(journal);
  await assert.rejects(run.executor.reconcile(run.operationId()), /original operation and checkpoint/u);
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
for (const contextFault of ["execute-final", "recovery-final"] as const) {
  // oxlint-disable-next-line eslint/no-loop-func -- Shared module handles are initialized by before, independently of each const case.
  void test(`page creation ${contextFault} refuses last-checkpoint context drift`, async () => {
    const run = fixture({ contextFault, ...(contextFault === "recovery-final" ? { publicationFailure: "verified" } : {}) });
    await assert.rejects(run.executor.execute(run.request));
    if (contextFault === "recovery-final") { await assert.rejects(run.executor.reconcile(run.operationId())); }
    const journal = await artifacts.loadOperation(run.operationId()); assert.equal(journal["hardStop"], true);
    assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
  });
}
void test("page creation refuses final checkpoint substitution", async () => {
  const run = fixture({ checkpointFault: "final" }); await assert.rejects(run.executor.execute(run.request), /before completion/u);
  assert.deepEqual(run.counts(), { dispatches: 1, writes: 1 });
});
