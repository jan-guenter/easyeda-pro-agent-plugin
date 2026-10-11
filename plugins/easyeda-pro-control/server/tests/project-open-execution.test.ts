import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { assertUpstreamReplySettled, isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import { ProjectOpenExecutor } from "../src/project-open-execution.ts";
import type { ProjectOpenDependencies, ProjectOpenEngine, ProjectOpenInput } from "../src/project-open-execution.ts";
import { buildRecoveryNavigationCode } from "../src/recovery-navigation.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { materializeNativeHistory } from "../src/native-history.ts";
import { nativeLibraryHeaderEvidence } from "../src/native-library-header-evidence.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";

type Value = Record<string, unknown>;
const HASH = "a".repeat(64);
const TARGET = { projectUuid: "b".repeat(64), projectPath: "/fixture/project.eprj2", documentUuid: "board", documentType: 3 as const };
const CONTEXT = { project: { uuid: TARGET.projectUuid, path: TARGET.projectPath }, document: { uuid: TARGET.documentUuid, documentType: 3, tabId: "board@fixture" } };
const RECEIPT = { schema: "easyeda-pro-control.checkpoint.v2" as const, source: TARGET.projectPath, checkpoint: "/fixture/checkpoint.sqlite", receiptPath: "/fixture/receipt.json", createdAt: "2026-01-01T00:00:00Z",
  sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" }, checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" },
  sourceSha256: HASH, checkpointSha256: HASH, sourceDumpSha256: HASH, checkpointDumpSha256: HASH, receiptSha256: HASH };
const VERIFIED = { ok: true, sourceMatchesReceipt: true, checkpointMatchesReceipt: true, sourceEqualsCheckpoint: true, sourceChanged: false, source: RECEIPT.source,
  checkpoint: RECEIPT.checkpoint, receiptPath: RECEIPT.receiptPath, sourceDumpSha256: HASH, checkpointDumpSha256: HASH, checkpointSha256: HASH, sourceSha256: HASH };
const HISTORY: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: TARGET.projectUuid, branchUuid: "c".repeat(32), headHistoryUuid: "d".repeat(32),
  checkpointSha256: HASH, historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, semanticSha256: HASH,
  documents: [{ uuid: TARGET.documentUuid, docType: "PCB", metadata: {}, records: [], semanticSha256: HASH }] };
function fingerprint(): Value {
  const manifest = loadReviewedCompatibilityManifest(); const facade = manifest.facadeImplementation["source-tree"]; const runtime = manifest.connectedRuntime;
  return { facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => ({ path: `/opt/control/${file.relativePath}`, relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: runtime.healthVersion, node_version: runtime.nodeVersion, bridge_connected: true, easyeda_version: runtime.easyedaVersion, extension_version: runtime.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: runtime.bridgeVersion, ...(runtime.bridgeEasyedaVersion === null ? {} : { easyeda_version: runtime.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: runtime.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: runtime.dispatcher.source, dispatcher_build_id: runtime.dispatcher.buildId, total: runtime.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: "/opt/assets", pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/adapter.js", declarationsPath: "/opt/assets/api.d.ts" } } };
}
interface FixtureState { recordDrift: boolean; uncertain: boolean; incomplete: boolean; dispatchFailure?: unknown; failArtifact?: string; generatedEnvironment?: Value;
  histories?: readonly NativeHistorySnapshot[]; omitPreparedHeaderEvidence?: boolean; sqliteDrift?: boolean; }
function fixture(): { executor: ProjectOpenExecutor; input: ProjectOpenInput; calls: string[]; journals: Map<string, Value>; artifacts: Map<string, Value>; state: FixtureState } {
  const calls: string[] = []; const journals = new Map<string, Value>(); const artifacts = new Map<string, Value>();
  const state: FixtureState = { recordDrift: false, uncertain: false, incomplete: false }; const identity = fingerprint(); let historyReads = 0;
  const save = (journal: Value): Promise<string> => { const id = journal["operationId"]; assert.equal(typeof id, "string"); if (typeof id !== "string") { throw new TypeError("Missing fixture journal ID"); } journals.set(id, structuredClone(journal)); return Promise.resolve(`/fixture/${id}.json`); };
  const services: ProjectOpenDependencies = {
    checkpointPolicy: (source): ReturnType<NonNullable<ProjectOpenDependencies["checkpointPolicy"]>> => Promise.resolve({ expectedSource: source, artifactRoots: ["/fixture"] }),
    createCheckpoint: (): ReturnType<NonNullable<ProjectOpenDependencies["createCheckpoint"]>> => { calls.push("checkpoint"); return Promise.resolve(structuredClone(RECEIPT)); },
    verifyCheckpoint: (): ReturnType<NonNullable<ProjectOpenDependencies["verifyCheckpoint"]>> => Promise.resolve(structuredClone(state.sqliteDrift === true ? { ...VERIFIED, sourceChanged: true } : VERIFIED)),
    readNativeHistoryCheckpoint: (input): ReturnType<NonNullable<ProjectOpenDependencies["readNativeHistoryCheckpoint"]>> => {
      assert.equal(input.libraryAtomHeaders, "preserve");
      historyReads += 1;
      const selected = state.histories?.[Math.min(historyReads - 1, state.histories.length - 1)];
      if (selected !== undefined) { return Promise.resolve(selected); }
      return Promise.resolve(state.recordDrift && historyReads > 1 ? { ...HISTORY, documents: HISTORY.documents.map((document) => ({ ...document, metadata: { changed: true } })) } : structuredClone(HISTORY));
    },
    prepareRecoveryNavigation: async (input): ReturnType<NonNullable<ProjectOpenDependencies["prepareRecoveryNavigation"]>> => {
      assert.equal(input.navigation?.requireExclusiveTabs, true);
      assert.equal(input.navigation?.requireEditorReadiness, input.navigation?.navigate);
      assert.equal(input.libraryAtomHeaders, "preserve");
      return { target: TARGET, checkpointSha256: HASH, code: buildRecoveryNavigationCode(TARGET, input.navigation),
        ...(state.omitPreparedHeaderEvidence === true ? {} : { libraryHeaderEvidence: await nativeLibraryHeaderEvidence(state.histories?.[0] ?? HISTORY,
          { checkpointSha256: HASH, projectUuid: TARGET.projectUuid }) }) };
    },
    verifyLibraryNativeProfile: (): ReturnType<NonNullable<ProjectOpenDependencies["verifyLibraryNativeProfile"]>> => Promise.resolve({ profile: "easyeda-pro-control.library-native.v1", version: "3.2.149.43637efe", relativePath: "pro-ui/3.2.149.43637efe/js/ui.js", sha256: "12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a" }),
    createOperation: save, updateOperation: save,
    listOperations: (): ReturnType<NonNullable<ProjectOpenDependencies["listOperations"]>> => Promise.resolve(state.incomplete ? [{ operationId: "another", state: "applied-unsaved" }] : [...journals.values()]),
    loadOperation: (id): ReturnType<NonNullable<ProjectOpenDependencies["loadOperation"]>> => {
      const value = journals.get(id); assert.ok(value !== undefined && isRecord(value["plan"]) && typeof value["planHash"] === "string");
      return Promise.resolve({ ...structuredClone(value), operationId: id, plan: value["plan"], planHash: value["planHash"] });
    },
    writePhaseArtifact: (id, sequence, phase, value): ReturnType<NonNullable<ProjectOpenDependencies["writePhaseArtifact"]>> => {
      if (phase === state.failArtifact) { return Promise.reject(new Error("PRIVATE_ARTIFACT_FAILURE")); }
      const path = `/fixture/${id}/${sequence}-${phase}.json`; assert.equal(artifacts.has(path), false); assert.ok(isRecord(value));
      artifacts.set(path, structuredClone(value));
      return Promise.resolve({ path, bytes: JSON.stringify(value).length, sha256: sha256Json(value) });
    },
  };
  const engine: ProjectOpenEngine = {
    executionAuthorityValidator: {}, status: (): Promise<{ stableFingerprint: Value }> => Promise.resolve({ stableFingerprint: identity }),
    upstream: { installedEasyedaBundles: (): Promise<{ assetsRoot: string }> => Promise.resolve({ assetsRoot: "/opt/assets" }) },
    assertContext: (): Promise<typeof CONTEXT> => Promise.resolve(structuredClone(CONTEXT)),
    assertRecoveryOperationIsolated: (): Promise<true> => Promise.resolve(true), ensureRuntimeRestartChallenge: (): Promise<string> => Promise.resolve("fixture-challenge"),
    recoverDispatchAuthority: (): Promise<never> => Promise.reject(new Error("Unused fixture recovery")),
    dispatchWithOrphanTracking: async (journal, phase, _name, args): Promise<unknown> => {
      calls.push(phase); assert.equal(journals.get(journal.operationId)?.["state"], `${phase}-dispatching`);
      if (Object.hasOwn(state, "dispatchFailure")) { throw state.dispatchFailure; }
      if (state.uncertain) { journal.orphanedCallPossible = true; await save(journal); throw new Error("uncertain open"); }
      if (state.generatedEnvironment !== undefined) {
        let reply: unknown;
        try {
          assert.equal(typeof args["code"], "string");
          const pending: unknown = runInNewContext(`(async()=>{${String(args["code"])}})()`, state.generatedEnvironment);
          reply = { structuredContent: { ok: true, result: await pending } };
        } catch (error) {
          // The loader's EASYEDA_API_ERROR code survives the bridge manager,
          // But upstream easyeda_execute drops it and retains only its message.
          assert.ok(error !== null && typeof error === "object");
          const message: unknown = Object.getOwnPropertyDescriptor(error, "message")?.value;
          assert.equal(typeof message, "string");
          const bridgeReply = { ok: false, error: { code: "EASYEDA_API_ERROR", message } };
          reply = { structuredContent: { ok: false, error: bridgeReply.error.message } };
        }
        try { assertUpstreamReplySettled(reply); } catch (error) { journal.orphanedCallPossible = true; await save(journal); throw error; }
        return reply;
      }
      if (phase === "editor-tabs") {
        const absent = { kind: "undefined" };
        const context = { projectUuid: { kind: "string", value: TARGET.projectUuid }, projectUuidAlias: absent, documentUuid: absent, documentUuidAlias: absent, documentType: absent, tabId: absent, parentProjectUuid: absent, parentLibraryUuid: absent };
        return { structuredContent: encodeExactReadEnvelope({ schema: "easyeda-pro-control.editor-tabs.v1", contextBefore: context, contextAfter: context,
          nodes: [{ index: 0, parentIndex: null, depth: 0, object: { kind: "object" }, id: { kind: "string", value: "root" }, children: absent, childCount: null, tabs: { kind: "array" }, tabCount: 0, items: [] }] }) };
      }
      const payload = phase === "project-open" ? { ok: true, schema: "easyeda-pro-control.recovery-navigation.v1", openedProject: true, openedDocument: true, project: CONTEXT.project, document: CONTEXT.document } :
        { ok: true, schema: "easyeda-pro-control.recovery-navigation.v1", inspectedOnly: true, targetOpen: false, project: null, document: null };
      return { structuredContent: payload };
    },
  };
  return { executor: new ProjectOpenExecutor(engine, services), input: { action: "open-existing", ...TARGET, expectedFingerprint: identity, confirmOpen: true }, calls, journals, artifacts, state };
}
void test("existing-project opening journals first and proves the full saved baseline unchanged without save", async () => {
  const run = fixture(); const result = await run.executor.openExisting(run.input);
  assert.equal(result["state"], "completed"); assert.equal(result["saved"], false);
  assert.deepEqual(run.calls, ["checkpoint", "project-open", "checkpoint"]);
});

const line = (header: Value, body: unknown): string => `${JSON.stringify(header)}||${body === null ? "" : JSON.stringify(body)}|\n`;
function importedLibraryHistory(firstTicket = 1): NativeHistorySnapshot {
  const source = line({ type: "DOCHEAD", ticket: 1 }, { uuid: TARGET.documentUuid, docType: "PCB", client: "fixture" })
    + line({ type: "DOCHEAD", ticket: 1 }, { uuid: "library", docType: "SYMBOL", client: "fixture" })
    + line({ type: "PIN", id: "pin", ticket: 9, firstTicket }, { x: 0 })
    + line({ type: "LINE", id: "deleted", ticket: 9, firstTicket: 0 }, null);
  const documents = materializeNativeHistory([source], HASH, { libraryAtomHeaders: "preserve" });
  return { ...HISTORY, documents, plaintextBytes: Buffer.byteLength(source),
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}

void test("project opening retains imported header commitments and rereads the original checkpoint without Save", async () => {
  const run = fixture(); const history = importedLibraryHistory(); run.state.histories = [history];
  const result = await run.executor.openExisting(run.input);
  assert.equal(result["state"], "completed"); assert.equal(result["saved"], false);
  const before = [...run.artifacts.entries()].find(([path]) => path.endsWith("-before.json"))?.[1];
  assert.ok(isRecord(before?.["libraryHeaderEvidence"]));
  const evidence = before["libraryHeaderEvidence"];
  assert.equal(evidence["checkpointSha256"], HASH);
  const expected = await nativeLibraryHeaderEvidence(history, { checkpointSha256: HASH, projectUuid: TARGET.projectUuid });
  assert.deepEqual(evidence["documents"], expected.documents);
  assert.equal(JSON.stringify(evidence).includes('"occurrences":'), false);
  const completed = result["result"]; assert.ok(isRecord(completed));
  const proof = completed["proof"]; assert.ok(isRecord(proof));
  assert.equal(proof["allSqliteTablesUnchanged"], true);
  assert.deepEqual(proof["libraryHeaderEvidence"], { before: evidence, after: evidence, unchanged: true });
  assert.deepEqual(run.calls, ["checkpoint", "project-open", "checkpoint"]);
});

void test("header-only drift cannot pass project-open's unchanged semantic body proof", async () => {
  const run = fixture(); const after = importedLibraryHistory(2), before = importedLibraryHistory();
  assert.equal(before.semanticSha256, after.semanticSha256);
  run.state.histories = [before, before, after];
  await assert.rejects(run.executor.openExisting(run.input), /materialized document records/u);
  assert.equal(run.calls.filter((phase) => phase === "project-open").length, 1);
  assert.equal([...run.journals.values()][0]?.["state"], "project-open-needs-review");
  assert.equal([...run.journals.values()][0]?.["saved"], false);
});

void test("missing navigation provenance and bad original proof refuse before dispatch", async () => {
  const missing = fixture(); missing.state.omitPreparedHeaderEvidence = true;
  await assert.rejects(missing.executor.openExisting(missing.input), /lacks checkpoint-bound library header evidence/u);
  assert.deepEqual(missing.calls, ["checkpoint"]);
  const corrupt = fixture(); const history = structuredClone(importedLibraryHistory());
  const document = history.documents.find((entry) => entry.atomHeaderHistory !== undefined); assert.ok(document?.atomHeaderHistory);
  Reflect.set(document.atomHeaderHistory, "sha256", "0".repeat(64)); corrupt.state.histories = [history];
  await assert.rejects(corrupt.executor.openExisting(corrupt.input), /provenance/u);
  assert.deepEqual(corrupt.calls, ["checkpoint"]);
});

void test("valid imported proof cannot replace complete SQLite invariance", async () => {
  const run = fixture(); run.state.histories = [importedLibraryHistory()]; run.state.sqliteDrift = true;
  await assert.rejects(run.executor.openExisting(run.input));
  assert.deepEqual(run.calls, ["checkpoint"]);
  assert.equal([...run.journals.values()][0]?.["saved"], false);
});
void test("opening refuses another incomplete operation before checkpoint or native navigation", async () => {
  const run = fixture(); run.state.incomplete = true;
  await assert.rejects(run.executor.openExisting(run.input), /incomplete transaction/u);
  assert.deepEqual(run.calls, []);
});
void test("pending open diagnostic journals a fixed read without reopening or completing recovery", async () => {
  const run = fixture(); run.state.recordDrift = true;
  await assert.rejects(run.executor.openExisting(run.input), /materialized document records/u);
  const id = [...run.journals.keys()][0]; assert.ok(typeof id === "string");
  run.state.recordDrift = false;
  const result = await run.executor.inspectEditorTabs(id);
  assert.equal(result["action"], "inspect-editor-tabs");
  assert.equal(result["state"], "project-open-needs-review");
  assert.equal(result["allSqliteTablesUnchanged"], true);
  assert.equal(run.calls.filter((phase) => phase === "project-open").length, 1);
  assert.equal(run.calls.filter((phase) => phase === "editor-tabs").length, 1);
  const journal = run.journals.get(id); assert.equal(journal?.["hardStop"], true);
  assert.equal(journal?.["saved"], false);
});
void test("changed records and uncertain opens never complete or cause an automatic reopen", async () => {
  const changed = fixture(); changed.state.recordDrift = true;
  await assert.rejects(changed.executor.openExisting(changed.input), /materialized document records/u);
  const id = [...changed.journals.keys()][0]; assert.ok(typeof id === "string");
  changed.state.recordDrift = false;
  const reconciled = await changed.executor.reconcileNoMutation(id);
  assert.equal(reconciled["state"], "reconciled-no-mutation");
  assert.equal(changed.calls.filter((phase) => phase === "project-open").length, 1);
  assert.equal(changed.calls.filter((phase) => phase === "project-open-reconcile").length, 1);
  const uncertain = fixture(); uncertain.state.uncertain = true;
  await assert.rejects(uncertain.executor.openExisting(uncertain.input), /uncertain open/u);
  const uncertainId = [...uncertain.journals.keys()][0]; assert.ok(typeof uncertainId === "string");
  await assert.rejects(uncertain.executor.reconcileNoMutation(uncertainId), /Recover retained authority/u);
  assert.equal(uncertain.calls.filter((phase) => phase === "project-open").length, 1);
});

function failureArtifacts(run: ReturnType<typeof fixture>): Value[] {
  return [...run.artifacts.values()].filter((value) => value["schema"] === "easyeda-pro-control.project-open-failure.v1");
}
void test("fixed readiness failure evidence survives later inspection and reconciliation without replaying navigation", async () => {
  for (const stage of ["api", "project", "document", "owner", "pcb", "page", "container"]) {
    const run = fixture();
    const category = `native-preflight:RECOVERY_EDITOR_READINESS_${stage.toUpperCase()}`;
    run.state.dispatchFailure = new Error(`The upstream EasyEDA tool reported failure [${category}].`);
    await assert.rejects(run.executor.openExisting(run.input));
    const id = [...run.journals.keys()][0]; assert.ok(typeof id === "string");
    const original = { schema: "easyeda-pro-control.project-open-failure.v1", action: "open-existing", phase: "project-open-dispatching", category, orphanedCallPossible: false };
    assert.deepEqual(failureArtifacts(run), [original]);
    delete run.state.dispatchFailure;
    await run.executor.inspectEditorTabs(id);
    await run.executor.reconcileNoMutation(id);
    assert.deepEqual(failureArtifacts(run), [original]);
    assert.equal(run.journals.get(id)?.["state"], "reconciled-no-mutation");
    assert.equal(run.calls.filter((phase) => phase === "project-open").length, 1);
  }
});
void test("unknown errors, private suffixes and accessors never enter project-open failure evidence", async () => {
  let getterReads = 0;
  const accessor = new Error("Replaced by an accessor before dispatch.");
  Object.defineProperty(accessor, "message", { get: (): string => { getterReads += 1; return "PRIVATE_ACCESSOR"; } });
  const sensitive = new Error("PRIVATE_SOURCE /private/project.eprj2");
  Object.assign(sensitive, { upstreamResult: { secret: "PRIVATE_KEY" }, cause: new Error("PRIVATE_CAUSE") });
  for (const error of [sensitive, new Error("Recovery navigation refused: editor-readiness-page PRIVATE_SUFFIX"),
    new Error("The upstream EasyEDA tool reported failure [native-preflight:RECOVERY_EDITOR_READINESS_PAGE].\nPRIVATE_STACK"),
    new Error("PRIVATE_OVERSIZED".repeat(1000)), accessor, { private: "PRIVATE_OBJECT" }, "PRIVATE_STRING"]) {
    const run = fixture(); run.state.dispatchFailure = error;
    await assert.rejects(run.executor.openExisting(run.input), () => true);
    const failures = failureArtifacts(run);
    assert.equal(failures.length, 1); assert.equal(failures[0]?.["category"], "unclassified-operation-failure");
    assert.equal(JSON.stringify(failures).includes("PRIVATE"), false);
    assert.equal(JSON.stringify([...run.journals.values()]).includes("PRIVATE"), false);
    assert.equal(run.calls.filter((phase) => phase === "project-open").length, 1);
  }
  assert.equal(getterReads, 0);
});
void test("failure evidence preserves uncertain authority and distinct recovery phases", async () => {
  const run = fixture(); run.state.uncertain = true;
  await assert.rejects(run.executor.openExisting(run.input));
  const id = [...run.journals.keys()][0]; assert.ok(typeof id === "string");
  assert.equal(failureArtifacts(run)[0]?.["orphanedCallPossible"], true);
  assert.equal(run.journals.get(id)?.["state"], "project-open-outcome-unknown");
  await assert.rejects(run.executor.reconcileNoMutation(id), /Recover retained authority/u);
  assert.deepEqual(run.calls, ["checkpoint", "project-open"]);
  const settled = fixture(); settled.state.dispatchFailure = new Error("The upstream EasyEDA tool reported failure [unclassified-upstream-failure].");
  await assert.rejects(settled.executor.openExisting(settled.input));
  const settledId = [...settled.journals.keys()][0]; assert.ok(typeof settledId === "string");
  await assert.rejects(settled.executor.inspectEditorTabs(settledId));
  await assert.rejects(settled.executor.reconcileNoMutation(settledId));
  assert.deepEqual(failureArtifacts(settled).map(({ action, phase, category }) => ({ action, phase, category })), [
    { action: "open-existing", phase: "project-open-dispatching", category: "unclassified-upstream-failure" },
    { action: "inspect-editor-tabs", phase: "editor-tabs-dispatching", category: "unclassified-upstream-failure" },
    { action: "reconcile-open", phase: "project-open-reconcile-dispatching", category: "unclassified-upstream-failure" },
  ]);
});
void test("failure artifact publication failure cannot clear the durably retained stop or cause navigation retry", async () => {
  const run = fixture(); run.state.dispatchFailure = new Error("PRIVATE_SOURCE"); run.state.failArtifact = "failure";
  await assert.rejects(run.executor.openExisting(run.input), { message: "Project-open failure evidence could not be retained; the operation remains stopped." });
  const journal = [...run.journals.values()][0]; assert.ok(journal);
  assert.equal(journal["state"], "project-open-needs-review"); assert.equal(journal["hardStop"], true);
  assert.equal(journal["saved"], false); assert.equal(journal["orphanedCallPossible"], false);
  assert.equal(failureArtifacts(run).length, 0); assert.deepEqual(run.calls, ["checkpoint", "project-open"]);
});

function failingNativeEnvironment(stage: string, error: unknown): { environment: Value; calls: string[] } {
  const calls: string[] = [];
  let document: Value | undefined, project: Value | undefined;
  const failAt = (boundary: string): void => { if (stage === boundary) { throw error; } };
  const active = { ...CONTEXT.document, parentProjectUuid: TARGET.projectUuid };
  return { calls, environment: { TextDecoder, Uint8Array, window: { top: { setTimeout, clearTimeout } }, eda: {
    dmt_Project: {
      getCurrentProjectInfo: (): Promise<unknown> => { failAt("project-info"); return Promise.resolve(project); },
      openProject: (): Promise<boolean> => { calls.push("open-project"); project = CONTEXT.project; failAt("open-project"); return Promise.resolve(true); },
    },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(document) },
    dmt_EditorControl: {
      getSplitScreenTree: (): Promise<unknown> => Promise.resolve({ id: "root", tabs: document === undefined ? [] : [{ tabId: CONTEXT.document.tabId, documentType: 3, parentProjectUuid: TARGET.projectUuid }] }),
      openDocument: (): Promise<string> => { calls.push("open-document"); document = active; failAt("open-document"); return Promise.resolve(CONTEXT.document.tabId); },
      activateDocument: (): Promise<boolean> => { calls.push("activate"); failAt("activate-document"); return Promise.resolve(true); },
    },
    dmt_Pcb: { getCurrentPcbInfo: (): Promise<unknown> => { failAt("pcb-info"); return Promise.resolve(active); } },
    sys_ClientUrl: { request: (url: string): Promise<unknown> => Promise.resolve({ ok: true, url,
      body: Response.json({ success: true, result: { [TARGET.projectUuid]: { path: TARGET.projectPath } } }).body }) },
  } } };
}
void test("generated native exceptions survive upstream code loss as fixed retained stages without navigation retry", async () => {
  for (const stage of ["project-info", "open-project", "open-document", "activate-document", "pcb-info"]) {
    const run = fixture(); const native = failingNativeEnvironment(stage, new TypeError("PRIVATE_NATIVE_REPLY /private/project.eprj2"));
    run.state.generatedEnvironment = native.environment;
    const category = `native-preflight:RECOVERY_NATIVE_${stage.toUpperCase().replaceAll("-", "_")}`;
    await assert.rejects(run.executor.openExisting(run.input), { message: `The upstream EasyEDA tool reported failure [${category}].` });
    assert.deepEqual(failureArtifacts(run), [{ schema: "easyeda-pro-control.project-open-failure.v1", action: "open-existing",
      phase: "project-open-dispatching", category, orphanedCallPossible: false }]);
    assert.equal(JSON.stringify([...run.artifacts.values()]).includes("PRIVATE"), false);
    assert.equal(JSON.stringify([...run.journals.values()]).includes("PRIVATE"), false);
    const expectedCounts: Record<string, number> = { "project-info": 0, "open-project": 1, "open-document": 2, "activate-document": 3, "pcb-info": 3 };
    const expected = ["open-project", "open-document", "activate"].slice(0, expectedCounts[stage]);
    assert.deepEqual(native.calls, expected); assert.deepEqual(run.calls, ["checkpoint", "project-open"]);
  }
});
void test("generated timeout errors retain unsettled authority after upstream code loss", async () => {
  for (const message of ["NATIVE_LIFECYCLE_OPEN_TIMEOUT", "NATIVE_LIFECYCLE_CLOSE_TIMEOUT"]) {
    const run = fixture(); const native = failingNativeEnvironment("open-document", new Error(message));
    run.state.generatedEnvironment = native.environment;
    await assert.rejects(run.executor.openExisting(run.input), /native-lifecycle-timeout;execution-unsettled/u);
    assert.equal(failureArtifacts(run)[0]?.["category"], "native-lifecycle-timeout");
    assert.equal(failureArtifacts(run)[0]?.["orphanedCallPossible"], true);
    const journal = [...run.journals.values()][0];
    assert.equal(journal?.["state"], "project-open-outcome-unknown"); assert.equal(journal?.["hardStop"], true);
    assert.deepEqual(native.calls, ["open-project", "open-document"]); assert.deepEqual(run.calls, ["checkpoint", "project-open"]);
  }
});
