import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { after, afterEach, before, mock, test } from "node:test";
import { isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Text } from "../src/core.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import type { LibraryExecuteInput, LibraryExecutor, LibraryJournal } from "../src/library-execution.ts";
import type { loadOperation, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import type { EasyedaControlEngine, InstalledEasyedaBundles } from "../src/engine.ts";
import type { CheckpointReceipt } from "../src/checkpoint.ts";

type Value = Record<string, unknown>;
let originalRoot: string | undefined, root = "";
let library: { LibraryExecutor: typeof LibraryExecutor };
let artifacts: { loadOperation: typeof loadOperation; updateOperation: typeof updateOperation; writePhaseArtifact: typeof writePhaseArtifact };
let engines: { EasyedaControlEngine: typeof EasyedaControlEngine };

before(async () => {
  root = await mkdtemp("/tmp/easyeda-symbol-transaction-");
  originalRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  process.env["EASYEDA_CONTROL_DATA_DIR"] = root;
  [library, artifacts, engines] = await Promise.all([import("../src/library-execution.ts"), import("../src/artifacts.ts"), import("../src/engine.ts")]);
});
afterEach(async () => { mock.restoreAll(); await rm(join(root, "operations"), { recursive: true, force: true }); });
after(async () => {
  if (originalRoot === undefined) { delete process.env["EASYEDA_CONTROL_DATA_DIR"]; }
  else { process.env["EASYEDA_CONTROL_DATA_DIR"] = originalRoot; }
  await rm(root, { recursive: true, force: true });
});

const CONTEXT = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "board@project" } };
const OPERATION = { id: "modify-symbol", action: "library.symbol.modify", libraryUuid: "project", target: { uuid: "symbol" }, patch: { description: "changed" } };
const HASH = "a".repeat(64);
function document(uuid: string, docType: string, body: Value): NativeDocumentSnapshot {
  return { uuid, docType, metadata: { uuid, docType, editVersion: "3.2.149.88089769", client: "a".repeat(16), updateTime: 1, version: "1" },
    records: [{ id: "META", type: "META", ticket: 1, client: null, body }, { id: "pin", type: "PIN", ticket: 2, client: null, body: { number: "1", x: 20 } }], semanticSha256: HASH };
}
function history(): NativeHistorySnapshot {
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: HASH, historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, semanticSha256: HASH,
    documents: [document("board", "PCB", { title: "Board" }), document("symbol", "SYMBOL", { title: "MixedCase", description: "before", docType: 2 })] };
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

interface TransactionFixture {
  readonly executor: LibraryExecutor;
  readonly request: LibraryExecuteInput;
  readonly counts: () => { dispatches: number; modifierCalls: number };
  readonly operationId: () => string;
}
function fixture(options: { readonly nativeOwner?: string; readonly peerMutation?: boolean; readonly publicationFailure?: "native-return" | "verified"; readonly openTarget?: boolean; readonly tree?: unknown; readonly admissionDrift?: "status-source" | "profile-durable" | "profile-invalid-receipt" } = {}): TransactionFixture {
  let afterHistory = history(), dispatches = 0, durableDrift = false, invalidReceipt = false, modifierCalls = 0, operationId = "", statusCalls = 0;
  const beforeHistory = history(), identity = fingerprint(), nativeMetadata = { uuid: "symbol", project_uuid: "project", owner: { uuid: options.nativeOwner ?? "owner" }, docType: 2, display_title: "MixedCase", description: "before" };
  const checkpoint = (label: string): CheckpointReceipt => ({ schema: "easyeda-pro-control.checkpoint.v2", createdAt: "2026-10-10T00:00:00Z", source: CONTEXT.project.path,
    checkpoint: `/fixture/${label}.sqlite`, receiptPath: `/fixture/${label}.json`, checkpointSha256: label === "library-before" ? HASH : "b".repeat(64),
    checkpointDumpSha256: label === "library-before" ? HASH : "b".repeat(64), sourceSha256: HASH, sourceDumpSha256: HASH, receiptSha256: HASH,
    sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" }, checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" } });
  const engine = new engines.EasyedaControlEngine({ callTool: (): Promise<never> => Promise.reject(new Error("Unmocked upstream call")) }, {
    executionAuthorityValidator: { capture: (): Promise<never> => Promise.reject(new Error("Unused capture")), proveTerminated: (): Promise<never> => Promise.reject(new Error("Unused termination")) },
  });
  mock.method(engine, "status", (): Promise<unknown> => { statusCalls += 1; return Promise.resolve({ stableFingerprint: identity }); });
  mock.method(engine, "assertContext", (): Promise<unknown> => Promise.resolve(structuredClone(CONTEXT)));
  mock.method(engine, "assertRecoveryOperationIsolated", (): Promise<true> => Promise.resolve(true));
  mock.method(engine, "awaitProjectUploads", (): Promise<unknown> => Promise.resolve({ scheduledWritesSettled: true, savedEditorChanges: false }));
  mock.method(engine, "exactRead", (): Promise<unknown> => Promise.resolve({ source: options.admissionDrift === "status-source" && statusCalls >= 2 ? "changed during final status" : "complete unchanged active source" }));
  const manifest = loadReviewedCompatibilityManifest();
  engine.upstream.installedEasyedaBundles = (): Promise<InstalledEasyedaBundles> => Promise.resolve({ available: true, assetsRoot: "/fixture/assets",
    pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/fixture/pcb.js" },
    publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/fixture/api.js", adapterPath: "/fixture/adapter.js", declarationsPath: "/fixture/api.d.ts" } });
  mock.method(engine, "checkpoint", (input: { receiptPath?: string; label?: string }): Promise<unknown> => {
    const label = input.label ?? input.receiptPath?.slice("/fixture/".length, -".json".length) ?? "missing";
    return Promise.resolve(input.receiptPath === undefined ? checkpoint(label) : { ...checkpoint(label), ok: !durableDrift && !invalidReceipt, sourceChanged: durableDrift, sourceMatchesReceipt: !durableDrift, sourceEqualsCheckpoint: !durableDrift, checkpointMatchesReceipt: !invalidReceipt });
  });
  mock.method(engine, "dispatchWithOrphanTracking", async (journal: LibraryJournal, phase: string, name: string, args: Value): Promise<unknown> => {
    dispatches += 1; operationId = journal.operationId;
    assert.equal(phase, "execute"); assert.equal(name, "easyeda_execute"); assert.equal(args["confirmWrite"], true);
    const retained = await artifacts.loadOperation(operationId);
    assert.equal(retained["state"], "execute-dispatching"); assert.equal(retained["mutationMayHaveOccurred"], true);
    assert.deepEqual(retained["symbolPlan"], journal.symbolPlan);
    assert.ok(journal.artifacts.some((entry) => entry.path.endsWith("symbol-prepared.json")));
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(CONTEXT.project) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(CONTEXT.document) },
      dmt_EditorControl: { getSplitScreenTree: (): Promise<unknown> => Promise.resolve(options.tree ?? { tabs: options.openTarget === true ? [{ tabId: "symbol@project", documentType: 2, parentLibraryUuid: "owner" }] : [{ tabId: "board@project", documentType: 3, parentProjectUuid: "project" }] }) },
      lib_Symbol: { modify(uuid: string, project: string, title: string, classification: unknown, description: string): Promise<boolean> {
        modifierCalls += 1; assert.equal(uuid, "symbol"); assert.equal(project, "project"); assert.deepEqual(classification, {});
        nativeMetadata.display_title = title; nativeMetadata.description = description;
        afterHistory = structuredClone(beforeHistory);
        const symbol = afterHistory.documents[1]?.records[0]; assert.ok(symbol); symbol.body["title"] = title; symbol.body["description"] = description;
        if (options.peerMutation === true) { const peer = afterHistory.documents[0]; assert.ok(peer); peer.metadata["updateTime"] = 2; }
        return Promise.resolve(true);
      } },
    };
    const native = { gVars: { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => Promise.resolve({ message: nativeMetadata }) } } };
    const code = args["code"]; assert.equal(typeof code, "string");
    // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Only execute the production compiler's generated program against isolated doubles.
    const execute = new Function("eda", "globalThis", `return (async()=>{${String(code)}})();`);
    // oxlint-disable-next-line typescript/no-unsafe-call -- Immediately confine the fixed generated function's result to unknown.
    const pending: unknown = execute(eda, native);
    const result: unknown = await pending;
    if (options.publicationFailure !== undefined) { await artifacts.writePhaseArtifact(operationId, options.publicationFailure === "native-return" ? 3 : 4, options.publicationFailure, { faultInjection: "exclusive-publication-collision" }); }
    return { content: [{ type: "text", text: JSON.stringify({ success: true, result }) }] };
  });
  const executor = new library.LibraryExecutor(engine, {
    readNativeHistoryCheckpoint: (input): Promise<NativeHistorySnapshot> => Promise.resolve(input.checkpointPath === "/fixture/library-before.sqlite" ? beforeHistory : afterHistory),
    verifyDeviceAssociationNativeProfile: (): Promise<void> => {
      if (options.admissionDrift === "profile-durable") { durableDrift = true; }
      if (options.admissionDrift === "profile-invalid-receipt") { invalidReceipt = true; }
      return Promise.resolve();
    },
    verifyLibraryNativeProfile: (): Promise<never> => Promise.reject(new Error("Symbol write must verify the delegated manager/worker profile")),
  });
  return { executor, request: { operation: OPERATION, expectedContext: CONTEXT, expectedFingerprint: identity, confirmWrite: true as const },
    counts: (): { dispatches: number; modifierCalls: number } => ({ dispatches, modifierCalls }), operationId: (): string => operationId };
}

void test("symbol executor journals before its single modifier and proves the complete durable result", async () => {
  const run = fixture();
  const result = await run.executor.execute(run.request);
  assert.equal(result["state"], "completed"); assert.equal(result["saved"], true); assert.equal(result["reopened"], false);
  assert.deepEqual(run.counts(), { dispatches: 1, modifierCalls: 1 });
  const journal = await artifacts.loadOperation(run.operationId());
  assert.ok(Array.isArray(journal.artifacts));
  assert.ok(journal.artifacts.some((entry) => entry.path.endsWith("symbol-prepared.json")));
  assert.ok(journal.artifacts.some((entry) => entry.path.endsWith("native-return.json")));
  assert.equal(isRecord(journal["mutationReceipt"]) && journal["mutationReceipt"]["targetId"], "symbol");
});

void test("symbol result publication failure reconciles the retained receipt without repeating a write", async () => {
  const run = fixture({ publicationFailure: "verified" });
  await assert.rejects(run.executor.execute(run.request));
  const failed = await artifacts.loadOperation(run.operationId()); assert.equal(failed["state"], "library-needs-review");
  const result = await run.executor.reconcile(run.operationId());
  assert.equal(result["state"], "completed"); assert.equal(result["reopened"], false);
  assert.deepEqual(run.counts(), { dispatches: 1, modifierCalls: 1 });
});

void test("symbol recovery cannot substitute a result or receipt for a missing retained native return", async () => {
  const run = fixture({ publicationFailure: "native-return" });
  await assert.rejects(run.executor.execute(run.request));
  const failed = await artifacts.loadOperation(run.operationId());
  failed["result"] = { kind: "project-symbol-metadata", createdId: null, targetId: "symbol" };
  await artifacts.updateOperation(failed);
  await assert.rejects(run.executor.reconcile(run.operationId()), /exactly one retained native-return/u);
  assert.deepEqual(run.counts(), { dispatches: 1, modifierCalls: 1 });
});

void test("symbol recovery rejects a rehashed rewritten preparation even when its journal copy agrees", async () => {
  const run = fixture({ publicationFailure: "verified" });
  await assert.rejects(run.executor.execute(run.request));
  const failed = await artifacts.loadOperation(run.operationId());
  const descriptor = failed.artifacts?.find((entry) => entry.path.endsWith("symbol-prepared.json"));
  assert.ok(descriptor);
  const value: unknown = JSON.parse(await readFile(descriptor.path, "utf8")); assert.ok(isRecord(value));
  value["desiredTitle"] = "Substituted";
  const text = JSON.stringify(value);
  await writeFile(descriptor.path, text);
  descriptor.bytes = Buffer.byteLength(text); descriptor.sha256 = sha256Text(text); failed["symbolPlan"] = value;
  await assert.rejects(artifacts.updateOperation(failed), /phase artifact failed hash verification/u);
  await assert.rejects(run.executor.reconcile(run.operationId()), /phase artifact failed hash verification/u);
  assert.deepEqual(run.counts(), { dispatches: 1, modifierCalls: 1 });
});

void test("symbol executor rejects native owner drift before modifying", async () => {
  const run = fixture({ nativeOwner: "other" });
  await assert.rejects(run.executor.execute(run.request), /before-read/u);
  assert.deepEqual(run.counts(), { dispatches: 1, modifierCalls: 0 });
});
void test("symbol executor keeps peer mutation unresolved and never redispatches it", async () => {
  const run = fixture({ peerMutation: true });
  await assert.rejects(run.executor.execute(run.request), /unrelated project records/u);
  await assert.rejects(run.executor.reconcile(run.operationId()), /unrelated project records/u);
  const failed = await artifacts.loadOperation(run.operationId()); assert.equal(failed["saved"], false); assert.equal(failed["hardStop"], true);
  assert.deepEqual(run.counts(), { dispatches: 1, modifierCalls: 1 });
});
void test("symbol executor rejects an inactive open target before modifying", async () => {
  const run = fixture({ openTarget: true });
  await assert.rejects(run.executor.execute(run.request), /target-closed/u);
  assert.deepEqual(run.counts(), { dispatches: 1, modifierCalls: 0 });
});
void test("symbol executor rejects a malformed tree before accepting target absence", async () => {
  const run = fixture({ tree: { children: [{ tabs: [] }, { tabs: [null] }] } });
  await assert.rejects(run.executor.execute(run.request), /target-closed/u);
  assert.deepEqual(run.counts(), { dispatches: 1, modifierCalls: 0 });
});
for (const [name, tree] of [
  ["empty", { tabs: [] }],
  ["StartPage-only", { tabs: [{ tabId: "tab_page1", documentType: -1, isAbleDelete: false }] }],
  ["active-tab-missing", { tabs: [{ tabId: "other@project", documentType: 3, parentProjectUuid: "project" }] }],
  ["active-type-mismatched", { tabs: [{ tabId: "board@project", documentType: 1, parentProjectUuid: "project" }] }],
  ["empty-sibling-leaf", { children: [{ tabs: [] }, { tabs: [{ tabId: "board@project", documentType: 3, parentProjectUuid: "project" }] }] }],
] as const) {
  void test(`symbol executor refuses ${name} tab inventory without invoking the modifier`, async () => {
    const run = fixture({ tree });
    await assert.rejects(run.executor.execute(run.request), /target-closed/u);
    assert.deepEqual(run.counts(), { dispatches: 1, modifierCalls: 0 });
  });
}
void test("symbol executor reproves source and durable baseline after expensive final admission before any dispatch", async () => {
  for (const admissionDrift of ["status-source", "profile-durable", "profile-invalid-receipt"] as const) {
    const run = fixture({ admissionDrift });
    await assert.rejects(run.executor.execute(run.request), /changed during final library admission/u);
    assert.deepEqual(run.counts(), { dispatches: 0, modifierCalls: 0 });
    // Each refusal deliberately retains its own unresolved journal. Remove only
    // This test's disposable managed directory before constructing its next case.
    await rm(join(root, "operations"), { recursive: true, force: true });
  }
});
