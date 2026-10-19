import { configureTestControlRoot } from "./test-control-root.ts";
/* oxlint-disable import/max-dependencies -- Sealed transaction tests compose real journal storage, executor and fingerprint boundaries with isolated native doubles. */
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { after, afterEach, before, mock, test } from "node:test";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";
import { assertRejectsAtBoundary } from "./helpers/rejection-boundary.ts";
import { runInNewContext } from "node:vm";
import { assertUpstreamReplySettled, isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import type { LibraryExecuteInput, LibraryExecutor, LibraryJournal } from "../src/library-execution.ts";
import type { loadOperation, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import type { EasyedaControlEngine, ExpectedContext, InstalledEasyedaBundles } from "../src/engine.ts";
import type { CheckpointReceipt } from "../src/checkpoint.ts";
import { LIBRARY_NATIVE_IMPLEMENTATION } from "../src/library-native-profile.ts";
import { SCHEMATIC_NATIVE_IMPLEMENTATION } from "../src/native-profiles.ts";

type Value = Record<string, unknown>;
let originalRoot: string | undefined, root = "";
let library: { LibraryExecutor: typeof LibraryExecutor };
let artifacts: { loadOperation: typeof loadOperation; updateOperation: typeof updateOperation; writePhaseArtifact: typeof writePhaseArtifact };
let engines: { EasyedaControlEngine: typeof EasyedaControlEngine };
before(async () => {
  root = await createTestTemporaryDirectory("easyeda-close-transaction-");
  originalRoot = process.env["EASYEDA_CONTROL_DATA_DIR"]; configureTestControlRoot(root);
  [library, artifacts, engines] = await Promise.all([import("../src/library-execution.ts"), import("../src/artifacts.ts"), import("../src/engine.ts")]);
});
afterEach(async () => { mock.restoreAll(); await rm(join(root, "operations"), { recursive: true, force: true }); });
after(async () => {
  if (originalRoot === undefined) { configureTestControlRoot(); } else { configureTestControlRoot(originalRoot); }
  await rm(root, { recursive: true, force: true });
});
const HASH = "a".repeat(64);
const CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "board@project", parentProjectUuid: "project" } };
const OPERATION = { id: "close-footprint", action: "document.close", tabId: "footprint@project" };
function history(changed = false): NativeHistorySnapshot {
  const documents = ["board", "footprint"].map((uuid) => {
    const docType = uuid === "board" ? "PCB" : "FOOTPRINT", metadata = { uuid, docType };
    const records = [{ id: "META", type: "META", ticket: 1, client: null, body: { title: uuid === "board" && changed ? "changed" : uuid } }];
    return { uuid, docType, metadata, records, semanticSha256: sha256Json({ uuid, docType, metadata, records: records.map(({ id, type, body }) => ({ id, type, body })) }) };
  });
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: HASH, historyRowCount: 1, chunkCount: 1, plaintextBytes: 1,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))), documents };
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

interface Options { publicationFailure?: "native-return" | "verified"; noEffect?: boolean; peerMutation?: boolean; databaseMutation?: boolean;
  driftAtFinalCheckpoint?: "execute" | "recovery"; activeSourceMutation?: boolean; finalBaselineDrift?: boolean; dirty?: boolean }
function frame(uuid: string, documentType: number): { isConnected: boolean; tagName: string; getAttribute: (key: string) => string | null } {
  return { isConnected: true, tagName: "IFRAME", getAttribute: (key): string | null => {
    if (key === "c_dbid") { return `${uuid}@project`; } return key === "c_doctype" ? String(documentType) : null;
  } };
}
function fixture(options: Options = {}): { executor: LibraryExecutor; request: LibraryExecuteInput; operationId: () => string; counts: () => { dispatches: number; closes: number; observations: number }; setContext: (context: ExpectedContext) => void } {
  const identity = fingerprint(), manifest = loadReviewedCompatibilityManifest();
  let active = structuredClone(CONTEXT), closes = 0, dispatches = 0, observations = 0, operationId = "", present = true;
  const checkpoint = (label: string): CheckpointReceipt => ({ schema: "easyeda-pro-control.checkpoint.v2", createdAt: "2026-10-10T00:00:00Z", source: CONTEXT.project.path,
    checkpoint: `/fixture/${label}.sqlite`, receiptPath: `/fixture/${label}.json`, checkpointSha256: HASH,
    checkpointDumpSha256: options.databaseMutation === true && closes > 0 ? "b".repeat(64) : HASH,
    sourceSha256: HASH, sourceDumpSha256: HASH, receiptSha256: HASH,
    sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" }, checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" } });
  const engine = new engines.EasyedaControlEngine({ callTool: (): Promise<never> => Promise.reject(new Error("Unmocked upstream call")) }, {
    executionAuthorityValidator: { capture: (): Promise<never> => Promise.reject(new Error("Unused capture")), proveTerminated: (): Promise<never> => Promise.reject(new Error("Unused termination")) },
  });
  mock.method(engine, "status", (): Promise<unknown> => Promise.resolve({ stableFingerprint: identity }));
  mock.method(engine, "context", (): Promise<unknown> => Promise.resolve(structuredClone(active)));
  mock.method(engine, "assertContext", (expected: ExpectedContext): Promise<unknown> => {
    assert.deepEqual(expected.project, active.project); assert.deepEqual(expected.document, active.document); return Promise.resolve(structuredClone(active));
  });
  mock.method(engine, "assertRecoveryOperationIsolated", (): Promise<true> => Promise.resolve(true));
  mock.method(engine, "awaitProjectUploads", (): Promise<unknown> => Promise.resolve({ scheduledWritesSettled: true, savedEditorChanges: false }));
  mock.method(engine, "exactRead", (): Promise<unknown> => Promise.resolve({ source: options.activeSourceMutation === true && closes > 0 ? "changed" : "complete unchanged board source" }));
  engine.upstream.installedEasyedaBundles = (): Promise<InstalledEasyedaBundles> => Promise.resolve({ available: true, assetsRoot: "/fixture/assets",
    pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/fixture/pcb.js" },
    publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/fixture/api.js", adapterPath: "/fixture/adapter.js", declarationsPath: "/fixture/api.d.ts" } });
  let checks = 0;
  mock.method(engine, "checkpoint", (input: { receiptPath?: string; label?: string }): Promise<unknown> => {
    const label = input.label ?? input.receiptPath?.slice("/fixture/".length, -".json".length) ?? "missing";
    if (input.receiptPath !== undefined) { checks += 1; }
    if (input.receiptPath !== undefined && ((options.driftAtFinalCheckpoint === "execute" && label === "library-close-after") ||
        (options.driftAtFinalCheckpoint === "recovery" && label === "close-reconciled"))) { active = { ...CONTEXT, document: { ...CONTEXT.document, uuid: "third", tabId: "third@project" } }; }
    return Promise.resolve(input.receiptPath === undefined ? checkpoint(label) : { ...checkpoint(label), ok: !(options.finalBaselineDrift === true && checks === 2), sourceChanged: false, sourceEqualsCheckpoint: true, sourceMatchesReceipt: true, checkpointMatchesReceipt: true });
  });
  const boardFrame = frame("board", 3), targetFrame = frame("footprint", 4);
  const boardTab = { tabId: "board@project", data: { doctype: 3, pid: "project" } }, footprintTab = { tabId: "footprint@project", data: { doctype: 4, owner: "owner" } };
  const getTabs = (): unknown[] => [boardTab, ...(present ? [footprintTab] : [])];
  const listeners = new Map<string, (value: unknown) => void>();
  const environment = { TextEncoder, eda: {
    dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(active.project) },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(active.document) },
    dmt_EditorControl: { closeDocument: (tabId: string): Promise<boolean> => {
      assert.equal(tabId, OPERATION.tabId); closes += 1;
      if (options.noEffect === true) { return Promise.resolve(false); }
      present = false; targetFrame.isConnected = false; listeners.get("sch/SubTabbarMapRemove")?.("footprint"); return Promise.resolve(true);
    } },
  }, gVars: { currentProject: { projectId: "project", branchUuid: "branch", isV2Format: false }, isHistoryMode: false,
    messageBus: { rpcCall: (topic: string): Promise<unknown> => { assert.equal(topic, "isOpenTab"); return Promise.resolve({ message: present }); },
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Mirrors native subscription delivery and verifies cancellation.
      subscribe: (topic: string, callback: (value: unknown) => void): { cancel: () => void } => { listeners.set(topic, callback); return { cancel: (): void => { listeners.delete(topic); } }; },
    } }, UI: { tabBar: { getFilterTabs: getTabs, getContainerInfo: (): unknown => ({ activeTabId: active.document.tabId, tabs: getTabs() }),
    getActiveTab: (): string => active.document.tabId ?? "", hasTabUnSaved: (): boolean => options.dirty === true, isTabUnSaved: (): boolean => options.dirty === true,
    getTabContainer: (): string => "main", containerIds: ["main"], containerTree: { id: "main" },
  } }, window: { top: { document: { getElementById: (id: string): unknown => { if (id === "frame_board@project") { return boardFrame; } return present ? targetFrame : null; } },
    // Keep normal synthetic cleanup tolerant of parallel full-suite scheduling;
    // Production retains its 15-second native deadline.
    setTimeout: (callback: () => void, milliseconds: number): ReturnType<typeof setTimeout> => setTimeout(callback, milliseconds === 50 ? 1 : 5000), clearTimeout,
  } } };
  mock.method(engine, "dispatchWithOrphanTracking", async (journal: LibraryJournal, phase: string, name: string, args: Value): Promise<unknown> => {
    dispatches += 1; operationId = journal.operationId; assert.equal(name, "easyeda_execute");
    const retained = await artifacts.loadOperation(operationId);
    assert.deepEqual(retained["closePlan"], journal.closePlan); assert.ok(journal.artifacts.some((entry) => entry.path.endsWith("close-prepared.json")));
    if (phase === "execute") { assert.equal(retained["state"], "execute-dispatching"); }
    else { assert.equal(phase, "close-reconciliation-observe"); observations += 1; }
    const code = args["code"]; assert.equal(typeof code, "string");
    journal.orphanedCallPossible = true; await artifacts.updateOperation(journal);
    let result: unknown;
    try {
      const pending: unknown = runInNewContext(`(async()=>{${String(code)}})()`, environment); result = await pending;
    } catch (error) {
      assert.ok(isRecord(error)); assert.equal(typeof error["message"], "string");
      const reply = { structuredContent: { ok: false, error: error["message"] } };
      assertUpstreamReplySettled(reply);
      journal.orphanedCallPossible = false; await artifacts.updateOperation(journal); return reply;
    }
    journal.orphanedCallPossible = false; await artifacts.updateOperation(journal);
    if (phase === "execute" && options.publicationFailure !== undefined) { await artifacts.writePhaseArtifact(operationId, options.publicationFailure === "native-return" ? 3 : 4, options.publicationFailure, { faultInjection: "exclusive-publication-collision" }); }
    assert.equal(listeners.size, 0);
    return { content: [{ type: "text", text: JSON.stringify({ success: true, result }) }] };
  });
  const executor = new library.LibraryExecutor(engine, {
    readNativeHistoryCheckpoint: (input): Promise<NativeHistorySnapshot> => Promise.resolve(history(options.peerMutation === true && input.checkpointPath !== "/fixture/library-before.sqlite" && closes > 0)),
    verifyLibraryNativeProfile: (): Promise<typeof LIBRARY_NATIVE_IMPLEMENTATION> => Promise.resolve(LIBRARY_NATIVE_IMPLEMENTATION),
    verifySchematicNativeProfile: (): Promise<typeof SCHEMATIC_NATIVE_IMPLEMENTATION> => Promise.resolve(SCHEMATIC_NATIVE_IMPLEMENTATION),
  });
  return { executor, request: { operation: OPERATION, expectedContext: CONTEXT, expectedFingerprint: identity, confirmWrite: true },
    operationId: (): string => operationId, counts: (): { dispatches: number; closes: number; observations: number } => ({ dispatches, closes, observations }),
    setContext: (context): void => { active = structuredClone(context); } };
}

async function rejectAfterDispatch(run: ReturnType<typeof fixture>): Promise<void> {
  await assertRejectsAtBoundary(run.executor.execute(run.request), () => {
    assert.equal(run.counts().dispatches, 1);
    assert.notEqual(run.operationId(), "");
  });
}

void test("close executor seals preparation before one native close and verifies full database, peers and active source without Save", async () => {
  const run = fixture(); const result = await run.executor.execute(run.request);
  assert.equal(result["state"], "completed"); assert.equal(result["saved"], false); assert.equal(result["reopened"], false);
  assert.deepEqual(run.counts(), { dispatches: 1, closes: 1, observations: 0 });
});
void test("close authority, unsupported target and final baseline drift fail before native close", async () => {
  const run = fixture({ finalBaselineDrift: true }); const { confirmWrite: _authority, ...request } = run.request;
  await assert.rejects(run.executor.execute(request), /explicit confirmation/u);
  await assert.rejects(run.executor.execute({ ...run.request, operation: { ...OPERATION, tabId: CONTEXT.document.tabId } }), /inactive/u);
  await assert.rejects(run.executor.execute(run.request), /final library admission/u);
  assert.deepEqual(run.counts(), { dispatches: 0, closes: 0, observations: 0 });
});
for (const publicationFailure of ["native-return", "verified"] as const) {
  void test(`close publication failure at ${publicationFailure} reconciles absence without another close, open or Save`, async () => {
    const run = fixture({ publicationFailure }); await rejectAfterDispatch(run);
    await assert.rejects(run.executor.openTarget(run.operationId()), /never opens, closes or reactivates/u);
    const result = await run.executor.reconcileNoMutation(run.operationId()); assert.equal(result["state"], "reconciled-no-mutation");
    assert.ok(isRecord(result["result"])); assert.equal(result["result"]["targetOpenNow"], false); assert.equal(result["result"]["acknowledgmentInferred"], false);
    assert.deepEqual(run.counts(), { dispatches: 2, closes: 1, observations: 1 });
  });
}
void test("false close acknowledgment retains quarantine and refuses still-open reconciliation until execution termination is proved", async () => {
  const run = fixture({ noEffect: true }); await rejectAfterDispatch(run);
  await assert.rejects(run.executor.reconcileNoMutation(run.operationId()), /Prove retained execution termination/u);
  const journal = await artifacts.loadOperation(run.operationId()); assert.equal(journal["orphanedCallPossible"], true);
  assert.deepEqual(run.counts(), { dispatches: 1, closes: 1, observations: 0 });
});
for (const options of [{ peerMutation: true }, { databaseMutation: true }, { activeSourceMutation: true }]) {
  // oxlint-disable-next-line eslint/no-loop-func -- Each const case runs after the shared before hook has initialized the same immutable module handles.
  void test(`close collateral mutation remains unresolved in execute and recovery ${JSON.stringify(options)}`, async () => {
    const run = fixture(options); await rejectAfterDispatch(run); await assert.rejects(run.executor.reconcileNoMutation(run.operationId()));
    assert.equal(run.counts().closes, 1);
    const journal = await artifacts.loadOperation(run.operationId()); assert.equal(journal["hardStop"], true);
  });
}
void test("close recovery refuses changed retained plans and third active contexts without observing or repeating close", async () => {
  const run = fixture({ publicationFailure: "verified" }); await rejectAfterDispatch(run);
  run.setContext({ ...CONTEXT, document: { ...CONTEXT.document, uuid: "third" } }); await assert.rejects(run.executor.reconcile(run.operationId()));
  run.setContext(CONTEXT);
  const journal = await artifacts.loadOperation(run.operationId()); assert.ok(isRecord(journal["closePlan"]));
  journal["closePlan"]["branchUuid"] = "foreign"; await artifacts.updateOperation(journal);
  await assert.rejects(run.executor.reconcile(run.operationId()), /original operation and checkpoint/u);
  assert.deepEqual(run.counts(), { dispatches: 1, closes: 1, observations: 0 });
});
for (const driftAtFinalCheckpoint of ["execute", "recovery"] as const) {
  // oxlint-disable-next-line eslint/no-loop-func -- The before hook initializes shared module handles once, independently of each const test case.
  void test(`close ${driftAtFinalCheckpoint} refuses a last-checkpoint active-context switch`, async () => {
    const run = fixture({ driftAtFinalCheckpoint, ...(driftAtFinalCheckpoint === "recovery" ? { publicationFailure: "verified" } : {}) });
    await rejectAfterDispatch(run);
    if (driftAtFinalCheckpoint === "recovery") { await assert.rejects(run.executor.reconcileNoMutation(run.operationId())); }
    const journal = await artifacts.loadOperation(run.operationId()); assert.equal(journal["hardStop"], true); assert.equal(run.counts().closes, 1);
  });
}
