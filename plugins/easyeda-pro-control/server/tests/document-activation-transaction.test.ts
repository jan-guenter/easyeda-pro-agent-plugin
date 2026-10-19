import { configureTestControlRoot } from "./test-control-root.ts";
/* oxlint-disable import/max-dependencies -- Transaction regressions use the real executor, journal storage and compatibility contract with explicit native doubles. */
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { after, afterEach, before, mock, test } from "node:test";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";
import { assertRejectsAtBoundary } from "./helpers/rejection-boundary.ts";
import { isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint } from "../src/core.ts";
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
  root = await createTestTemporaryDirectory("easyeda-activation-transaction-");
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
const TARGET: ExpectedContext = { project: CONTEXT.project, document: { uuid: "symbol", documentType: 2, tabId: "symbol@project", parentLibraryUuid: "owner" } };
const OPERATION = { id: "activate-symbol", action: "document.activate", tabId: "symbol@project" };
function history(): NativeHistorySnapshot {
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: HASH, historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, semanticSha256: HASH,
    documents: ["board", "symbol"].map((uuid) => ({ uuid, docType: uuid === "board" ? "PCB" : "SYMBOL", metadata: { uuid }, semanticSha256: HASH,
      records: [{ id: "META", type: "META", ticket: 1, client: null, body: { title: uuid } }] })) };
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

function fixture(options: { readonly publicationFailure?: "native-return" | "verified"; readonly peerMutation?: boolean; readonly databaseMutation?: boolean; readonly noEffect?: boolean; readonly wrongOwner?: boolean; readonly driftAtFinalCheckpoint?: "execute" | "recovery" } = {}): {
  executor: LibraryExecutor; request: LibraryExecuteInput; operationId: () => string; counts: () => { dispatches: number; activations: number }; setContext: (context: ExpectedContext) => void;
} {
  const beforeHistory = history(), identity = fingerprint();
  let activations = 0, active = structuredClone(CONTEXT), afterHistory = history(), dispatches = 0, operationId = "";
  const checkpoint = (label: string): CheckpointReceipt => ({ schema: "easyeda-pro-control.checkpoint.v2", createdAt: "2026-10-10T00:00:00Z", source: CONTEXT.project.path,
    checkpoint: `/fixture/${label}.sqlite`, receiptPath: `/fixture/${label}.json`, checkpointSha256: HASH,
    checkpointDumpSha256: options.databaseMutation === true && activations > 0 ? "b".repeat(64) : HASH,
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
  mock.method(engine, "exactRead", (): Promise<unknown> => Promise.resolve({ source: `complete unchanged ${String(active.document.uuid)} source` }));
  const manifest = loadReviewedCompatibilityManifest();
  engine.upstream.installedEasyedaBundles = (): Promise<InstalledEasyedaBundles> => Promise.resolve({ available: true, assetsRoot: "/fixture/assets",
    pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/fixture/pcb.js" },
    publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/fixture/api.js", adapterPath: "/fixture/adapter.js", declarationsPath: "/fixture/api.d.ts" } });
  mock.method(engine, "checkpoint", (input: { receiptPath?: string; label?: string }): Promise<unknown> => {
    const label = input.label ?? input.receiptPath?.slice("/fixture/".length, -".json".length) ?? "missing";
    if (input.receiptPath !== undefined && ((options.driftAtFinalCheckpoint === "execute" && label === "library-activation-after") ||
        (options.driftAtFinalCheckpoint === "recovery" && label === "activation-reconciled"))) {
      active = { ...TARGET, document: { ...TARGET.document, uuid: "third", tabId: "third@project" } };
    }
    return Promise.resolve(input.receiptPath === undefined ? checkpoint(label) : { ...checkpoint(label), ok: true, sourceChanged: false, sourceEqualsCheckpoint: true, sourceMatchesReceipt: true, checkpointMatchesReceipt: true });
  });
  mock.method(engine, "dispatchWithOrphanTracking", async (journal: LibraryJournal, phase: string, name: string, args: Value): Promise<unknown> => {
    dispatches += 1; operationId = journal.operationId; assert.equal(phase, "execute"); assert.equal(name, "easyeda_execute");
    const retained = await artifacts.loadOperation(operationId); assert.equal(retained["state"], "execute-dispatching");
    assert.deepEqual(retained["activationPlan"], journal.activationPlan); assert.ok(journal.artifacts.some((entry) => entry.path.endsWith("activation-prepared.json")));
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(active.project) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(active.document) },
      dmt_EditorControl: { getSplitScreenTree: (): Promise<unknown> => Promise.resolve({ tabs: [
        { tabId: "board@project", documentType: 3, parentProjectUuid: "project" },
        { tabId: "symbol@project", documentType: 2, parentLibraryUuid: options.wrongOwner === true ? "foreign" : "owner" },
      ] }), activateDocument: (tabId: string): Promise<boolean> => {
        activations += 1; assert.equal(tabId, "symbol@project"); if (options.noEffect !== true) { active = structuredClone(TARGET); }
        if (options.peerMutation === true) { afterHistory = history(); const peer = afterHistory.documents[0]; assert.ok(peer); peer.metadata["changed"] = true; }
        return Promise.resolve(false);
      } } };
    const code = args["code"]; assert.equal(typeof code, "string");
    const frames = new Map([CONTEXT, TARGET].map((context) => [`frame_${String(context.document.tabId)}`, { isConnected: true,
      tagName: context.document.documentType <= 2 ? "DIV" : "IFRAME", getAttribute: (key: string): string | null => {
        if (key === "c_dbid") { return context.document.tabId ?? null; } return key === "c_doctype" ? String(context.document.documentType) : null;
      } }]));
    // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Execute only the production compiler's fixed program against isolated native doubles.
    const execute = new Function("eda", "globalThis", `return (async()=>{${String(code)}})();`);
    // oxlint-disable-next-line typescript/no-unsafe-call -- Confine the fixed generated function's result to unknown.
    const pending: unknown = execute(eda, { gVars: { currentProject: { projectId: "project" }, messageBus: { rpcCall: (_topic: string, tabId: string): Promise<unknown> => Promise.resolve({ message: tabId }) } }, window: { top: {
      document: { getElementById: (id: string): unknown => frames.get(id) },
      setTimeout: (callback: () => void, milliseconds: number): ReturnType<typeof setTimeout> => setTimeout(callback, milliseconds === 50 ? 1 : 100), clearTimeout,
    } } });
    const result: unknown = await pending;
    if (options.publicationFailure !== undefined) { await artifacts.writePhaseArtifact(operationId, options.publicationFailure === "native-return" ? 3 : 4, options.publicationFailure, { faultInjection: "exclusive-publication-collision" }); }
    return { content: [{ type: "text", text: JSON.stringify({ success: true, result }) }] };
  });
  const executor = new library.LibraryExecutor(engine, {
    readNativeHistoryCheckpoint: (input): Promise<NativeHistorySnapshot> => Promise.resolve(input.checkpointPath === "/fixture/library-before.sqlite" ? beforeHistory : afterHistory),
    verifyLibraryNativeProfile: (): Promise<typeof LIBRARY_NATIVE_IMPLEMENTATION> => Promise.resolve(LIBRARY_NATIVE_IMPLEMENTATION),
    verifySchematicNativeProfile: (): Promise<typeof SCHEMATIC_NATIVE_IMPLEMENTATION> => Promise.resolve(SCHEMATIC_NATIVE_IMPLEMENTATION),
  });
  return { executor, request: { operation: OPERATION, expectedContext: CONTEXT, expectedFingerprint: identity, confirmWrite: true },
    operationId: (): string => operationId, counts: (): { dispatches: number; activations: number } => ({ dispatches, activations }), setContext: (context): void => { active = structuredClone(context); } };
}

async function rejectAfterDispatch(run: ReturnType<typeof fixture>): Promise<void> {
  await assertRejectsAtBoundary(run.executor.execute(run.request), () => {
    assert.equal(run.counts().dispatches, 1);
    assert.notEqual(run.operationId(), "");
  });
}

void test("activation executor retains preparation before one call and proves unchanged complete project without Save", async () => {
  const run = fixture(); const result = await run.executor.execute(run.request);
  assert.equal(result["state"], "completed"); assert.equal(result["saved"], false); assert.equal(result["reopened"], false);
  assert.ok(isRecord(result["result"])); assert.equal(result["result"]["acknowledgment"], false);
  assert.deepEqual(run.counts(), { dispatches: 1, activations: 1 });
});
void test("activation requires explicit context-change authority before creating a journal or dispatch", async () => {
  const run = fixture(); const { confirmWrite: _confirmation, ...request } = run.request;
  await assert.rejects(run.executor.execute(request), /explicit confirmation/u); assert.deepEqual(run.counts(), { dispatches: 0, activations: 0 });
});
void test("already-active target refusal avoids the native early-resolution callback bug and creates no dispatch", async () => {
  const run = fixture();
  await assert.rejects(run.executor.execute({ ...run.request, operation: { ...OPERATION, tabId: CONTEXT.document.tabId } }), /already active/u);
  assert.deepEqual(run.counts(), { dispatches: 0, activations: 0 }); assert.equal(run.operationId(), "");
});
void test("activation recovery observes the retained target after publication failure and never repeats activation", async () => {
  const run = fixture({ publicationFailure: "verified" }); await rejectAfterDispatch(run);
  const result = await run.executor.reconcile(run.operationId()); assert.equal(result["state"], "reconciled-no-mutation");
  assert.ok(isRecord(result["result"])); assert.equal(result["result"]["targetActive"], true); assert.equal(result["result"]["acknowledgmentInferred"], false);
  assert.equal(result["saved"], false); assert.deepEqual(run.counts(), { dispatches: 1, activations: 1 });
});
void test("activation recovery can prove an unchanged original tab without an acknowledgment or another navigation", async () => {
  const run = fixture({ noEffect: true }); await assert.rejects(run.executor.execute(run.request), /target-readiness/u);
  await assert.rejects(run.executor.openTarget(run.operationId()), /never opens or reactivates/u);
  const result = await run.executor.reconcileNoMutation(run.operationId()); assert.equal(result["state"], "reconciled-no-mutation");
  assert.ok(isRecord(result["result"])); assert.equal(result["result"]["targetActive"], false); assert.deepEqual(run.counts(), { dispatches: 1, activations: 1 });
});
void test("activation recovery does not infer acknowledgment from an observed target after native-return publication failure", async () => {
  const run = fixture({ publicationFailure: "native-return" }); await rejectAfterDispatch(run);
  const result = await run.executor.reconcile(run.operationId()); assert.ok(isRecord(result["result"]));
  assert.equal(result["result"]["targetActive"], true); assert.equal(result["result"]["acknowledgmentInferred"], false);
  assert.deepEqual(run.counts(), { dispatches: 1, activations: 1 });
});
void test("activation refuses foreign tab ownership before activation and keeps unrelated durable mutations unresolved", async () => {
  const run = fixture({ wrongOwner: true }); await assert.rejects(run.executor.execute(run.request), /before-tabs/u);
  assert.deepEqual(run.counts(), { dispatches: 1, activations: 0 });
});
void test("activation and its recovery reject collateral project changes without dispatching again", async () => {
  const run = fixture({ peerMutation: true }); await assert.rejects(run.executor.execute(run.request), /complete durable project/u);
  await assert.rejects(run.executor.reconcile(run.operationId()), /complete durable project/u);
  assert.deepEqual(run.counts(), { dispatches: 1, activations: 1 });
});
void test("activation and its recovery reject logical database changes outside project document records", async () => {
  const run = fixture({ databaseMutation: true }); await assert.rejects(run.executor.execute(run.request), /logical database/u);
  await assert.rejects(run.executor.reconcile(run.operationId()), /logical database/u);
  assert.deepEqual(run.counts(), { dispatches: 1, activations: 1 });
});
void test("activation recovery refuses a third active document and substituted prepared plans", async () => {
  const run = fixture({ publicationFailure: "verified" }); await rejectAfterDispatch(run);
  run.setContext({ ...TARGET, document: { ...TARGET.document, uuid: "third" } }); await assert.rejects(run.executor.reconcile(run.operationId()));
  run.setContext(TARGET);
  const journal = await artifacts.loadOperation(run.operationId()); assert.ok(isRecord(journal["activationPlan"]));
  journal["activationPlan"]["branchUuid"] = "foreign"; await artifacts.updateOperation(journal);
  await assert.rejects(run.executor.reconcile(run.operationId()), /original operation and checkpoint/u);
  assert.deepEqual(run.counts(), { dispatches: 1, activations: 1 });
});
void test("activation cannot complete when its final checkpoint observation switches the active document", async () => {
  const run = fixture({ driftAtFinalCheckpoint: "execute" }); await rejectAfterDispatch(run);
  const journal = await artifacts.loadOperation(run.operationId()); assert.equal(journal["state"], "library-needs-review"); assert.equal(journal["hardStop"], true);
  assert.deepEqual(run.counts(), { dispatches: 1, activations: 1 });
});
void test("activation recovery cannot complete when final checkpoint verification switches the active document", async () => {
  const run = fixture({ publicationFailure: "verified", driftAtFinalCheckpoint: "recovery" }); await rejectAfterDispatch(run);
  await assert.rejects(run.executor.reconcile(run.operationId()));
  const journal = await artifacts.loadOperation(run.operationId()); assert.equal(journal["state"], "library-reconciliation-needs-review"); assert.equal(journal["hardStop"], true);
  assert.deepEqual(run.counts(), { dispatches: 1, activations: 1 });
});
