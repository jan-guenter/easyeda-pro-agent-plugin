import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { buildRecoveryNavigationCode, deriveRecoveryNavigationTarget } from "../src/recovery-navigation.ts";
import type { RecoveryNavigationOptions, RecoveryNavigationTarget } from "../src/recovery-navigation.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";

type RecordValue = Record<string, unknown>;
const TARGET: RecoveryNavigationTarget = { projectUuid: "ab".repeat(32), projectPath: "/mnt/c/Fixture/project.eprj2", documentUuid: "0123456789abcdef", documentType: 1 };
const PROJECT = { uuid: TARGET.projectUuid };
const DOCUMENT = { uuid: TARGET.documentUuid, documentType: TARGET.documentType, tabId: "reopened-tab" };
interface MockReader { read: () => Promise<{ done: boolean; value?: Uint8Array }>; releaseLock: () => void; cancel: () => Promise<void> }
interface MockResponse { ok: boolean; url: string; body: { getReader: () => MockReader } }

void test("library recovery opens only a checkpoint-owned asset and rejects metadata owner drift before editor opening", async () => {
  const target = { ...TARGET, documentType: 4 as const, libraryOwnerUuid: "owner", libraryName: "Footprint" };
  const checkpoint: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: target.projectUuid, projectOwnerUuid: "owner",
    branchUuid: "branch", headHistoryUuid: "head", checkpointSha256: "a".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, semanticSha256: "b".repeat(64),
    documents: [{ uuid: target.documentUuid, docType: "FOOTPRINT", metadata: {}, semanticSha256: "c".repeat(64),
      records: [{ id: "META", type: "META", ticket: 1, client: null, body: { title: target.libraryName } }] }] };
  const context = { project: { uuid: target.projectUuid, path: target.projectPath }, document: { uuid: target.documentUuid, documentType: 4, parentLibraryUuid: "owner" } };
  assert.deepEqual(deriveRecoveryNavigationTarget(context, checkpoint), target);
  assert.throws(() => deriveRecoveryNavigationTarget({ ...context, document: { ...context.document, parentLibraryUuid: "other" } }, checkpoint), /checkpoint document/u);
  for (const metadataOwner of ["owner", "other"]) {
    let document: RecordValue | undefined, project: RecordValue | undefined;
    const calls: unknown[] = [];
    const tabId = `${target.documentUuid}@${target.projectUuid}`;
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(project),
      openProject: (uuid: string): Promise<boolean> => { assert.equal(uuid, target.projectUuid); project = { uuid }; calls.push("project"); return Promise.resolve(true); } },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(document) },
    lib_Footprint: { get: (uuid: string, collection: string): Promise<unknown> => { assert.equal(uuid, target.documentUuid); assert.equal(collection, target.projectUuid);
      return Promise.resolve({ uuid, libraryUuid: metadataOwner, name: "Footprint" }); } },
    dmt_EditorControl: { openDocument: (): Promise<never> => Promise.reject(new Error("Wrong editor open")),
      openLibraryDocument: (...args: unknown[]): Promise<string> => { calls.push(args); document = { uuid: target.documentUuid, documentType: 4, tabId, parentLibraryUuid: metadataOwner }; return Promise.resolve(tabId); },
      activateDocument: (id: string): Promise<boolean> => { assert.equal(id, tabId); calls.push("activate"); return Promise.resolve(true); } },
    sys_ClientUrl: { request: (url: string): Promise<MockResponse> => {
      let sent = false;
      const bytes = new TextEncoder().encode(JSON.stringify({ success: true, result: { [target.projectUuid]: { path: String.raw`C:\Fixture\project.eprj2` } } }));
      return Promise.resolve({ ok: true, url, body: { getReader: (): MockReader => ({ read: (): Promise<{ done: boolean; value?: Uint8Array }> => {
        if (sent) { return Promise.resolve({ done: true }); } sent = true; return Promise.resolve({ done: false, value: bytes });
      }, cancel: (): Promise<void> => Promise.resolve(), releaseLock: (): void => {
        // No resources in this in-memory stream.
      } }) } });
    } } };
    const run = (): Promise<unknown> => {
      const result: unknown = runInNewContext(`(async () => {${buildRecoveryNavigationCode(target)}})()`, { eda, TextDecoder, Uint8Array });
      return Promise.resolve(result);
    };
    if (metadataOwner === "owner") { await run(); assert.deepEqual(calls, ["project", [target.projectUuid, "4", target.documentUuid], "activate"]); }
    else { await assert.rejects(run(), /library-identity-drift/u); assert.deepEqual(calls, ["project"]); }
  }
});

void test("symbol recovery proves native display title and avoids the hanging library-document route", async () => {
  const target = { ...TARGET, documentType: 2 as const, libraryOwnerUuid: "owner", libraryName: "Mixed Case Symbol" };
  let document: RecordValue | undefined;
  let displayTitle = target.libraryName;
  const calls: string[] = [];
  const host = { currentProject: { projectId: target.projectUuid }, messageBus: { rpcCall: (topic: string, args: unknown[]): Promise<unknown> => {
    assert.equal(topic, "/PrjDB/symbol/getData"); assert.deepEqual(structuredClone(args), [target.documentUuid, target.projectUuid]);
    return Promise.resolve({ message: { uuid: target.documentUuid, project_uuid: target.projectUuid, owner: { uuid: "owner" }, title: "mixed case symbol", display_title: displayTitle } });
  } } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: target.projectUuid }), openProject: (): never => assert.fail("Already in project") },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(document) },
    lib_Symbol: { get: (): never => assert.fail("Do not compare lowercased SDK title"), openInEditor: (uuid: string, project: string): Promise<string> => {
      assert.equal(uuid, target.documentUuid); assert.equal(project, target.projectUuid); calls.push("open-symbol");
      document = { uuid, documentType: 2, parentLibraryUuid: "owner", tabId: `${uuid}@${project}` }; return Promise.resolve(String(document["tabId"]));
    } },
    dmt_EditorControl: { openDocument: (): never => assert.fail("Wrong open route"), openLibraryDocument: (): never => assert.fail("Hanging route"), activateDocument: (): Promise<boolean> => Promise.resolve(false) },
    sys_ClientUrl: { request: (url: string): Promise<unknown> => Promise.resolve({ ok: true, url, body: Response.json({ success: true, result: { [target.projectUuid]: { path: String.raw`C:\Fixture\project.eprj2` } } }).body }) } };
  const run = async (): Promise<unknown> => {
    const result: unknown = runInNewContext(`(async()=>{${buildRecoveryNavigationCode(target)}})()`, { eda, gVars: host, TextDecoder, Uint8Array });
    return await result;
  };
  await run(); assert.deepEqual(calls, ["open-symbol"]);
  displayTitle = "Unexpected rename";
  await assert.rejects(run(), /library-identity-drift/u);
});

function fixture(options: { project?: RecordValue; document?: RecordValue; registryPath?: string; openProjectResult?: boolean;
  openDocumentResult?: string | null; activateResult?: boolean | null; wrongReadback?: boolean; delayedReadback?: boolean; projectRace?: boolean; registryBytes?: Uint8Array; tree?: unknown; navigation?: RecoveryNavigationOptions } = {}): {
    calls: string[]; execute: () => Promise<unknown>;
  } {
  const calls: string[] = [];
  let currentDocument = options.document, currentProject = options.project;
  const eda = {
    dmt_Project: {
      getCurrentProjectInfo: (): Promise<RecordValue | undefined> => Promise.resolve(currentProject),
      openProject: (uuid: string): Promise<boolean> => { calls.push(`project:${uuid}`); currentProject = PROJECT; return Promise.resolve(options.openProjectResult ?? true); },
    },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<RecordValue | undefined> => Promise.resolve(currentDocument) },
    dmt_EditorControl: {
      getSplitScreenTree: (): Promise<unknown> => Promise.resolve(options.tree ?? { id: "root", tabs: [{ tabId: "tab_page1", data: { doctype: -1 }, isAbleDelete: false }] }),
      openDocument: (uuid: string): Promise<string | undefined> => { calls.push(`document:${uuid}`); currentDocument = DOCUMENT;
        return Promise.resolve(options.openDocumentResult === null ? undefined : (options.openDocumentResult ?? DOCUMENT.tabId)); },
      activateDocument: (tabId: string): Promise<boolean | null> => { calls.push(`activate:${tabId}`);
        if (options.wrongReadback === true) { currentDocument = { ...DOCUMENT, uuid: "other-document" }; }
        if (options.delayedReadback === true) { currentDocument = undefined; setImmediate(() => { currentDocument = DOCUMENT; }); }
        return Promise.resolve(options.activateResult === undefined ? true : options.activateResult); },
    },
    sys_ClientUrl: { request: (url: string, method: string): Promise<MockResponse> => {
      assert.equal(url, "https://client/api/client/projectPaths"); assert.equal(method, "GET");
      if (options.projectRace === true) { currentProject = { uuid: "other-project" }; }
      let done = false;
      const value = options.registryBytes ?? new TextEncoder().encode(JSON.stringify({ success: true, result: {
        [TARGET.projectUuid]: { path: options.registryPath ?? String.raw`C:\Fixture\project.eprj2` },
      } }));
      return Promise.resolve({ ok: true, url, body: { getReader: (): MockReader => ({ read: (): Promise<{ done: boolean; value?: Uint8Array }> => {
        const result = done ? { done: true } : { done: false, value }; done = true; return Promise.resolve(result);
      }, releaseLock: (): void => { calls.push("registry-release"); }, cancel: (): Promise<void> => { calls.push("registry-cancel"); return Promise.resolve(); } }) } });
    } },
  };
  return { calls, execute: async () => {
    const result: unknown = runInNewContext(`(async () => {${buildRecoveryNavigationCode(TARGET, options.navigation)}})()`, { eda, TextDecoder, Uint8Array, window: { top: { setTimeout, clearTimeout } } });
    return await result;
  } };
}

void test("empty Start Page opens only the checkpoint-proven project/document and reads back the new tab", async () => {
  const run = fixture();
  const result = await run.execute();
  assert.deepEqual(structuredClone(result), { ok: true, schema: "easyeda-pro-control.recovery-navigation.v1",
    openedProject: true, openedDocument: true, project: { uuid: TARGET.projectUuid, path: TARGET.projectPath }, document: DOCUMENT });
  assert.deepEqual(run.calls.filter((call) => !call.startsWith("registry-")), [
    `project:${TARGET.projectUuid}`, `document:${TARGET.documentUuid}`, "activate:reopened-tab",
  ]);
});

void test("exclusive Start Page navigation rejects hidden foreign editors and malformed tab trees before opening", async () => {
  const navigation = { requireExclusiveTabs: true };
  await fixture({ navigation }).execute();
  for (const tree of [{ id: "root", tabs: [{ tabId: "hidden@library", data: { doctype: 4, owner: "other-library" } }] },
    { id: "root", tabs: [{ tabId: "different-board", data: { doctype: 3, pid: TARGET.projectUuid } }] },
    { id: "root", tabs: [{ tabId: "tab_page1", documentType: -1, data: { doctype: 3 }, isAbleDelete: false }] }, { id: "root" }]) {
    const run = fixture({ navigation, tree });
    await assert.rejects(run.execute(), /unrelated-editor-tab|tab-type-alias|tab-tree-leaf/u);
    assert.deepEqual(run.calls, []);
  }
});

void test("exclusive inspect-only reconciliation never repeats project or document opening", async () => {
  const navigation = { requireExclusiveTabs: true, navigate: false };
  const empty = fixture({ navigation });
  const result = await empty.execute();
  assert.deepEqual(structuredClone(result), { ok: true, schema: "easyeda-pro-control.recovery-navigation.v1", inspectedOnly: true, targetOpen: false, project: null, document: null });
  assert.equal(empty.calls.every((call) => call === "registry-release"), true);
  const active = fixture({ navigation, project: PROJECT, document: DOCUMENT,
    tree: { id: "root", tabs: [{ tabId: `${TARGET.documentUuid}@1`, data: { doctype: TARGET.documentType, pid: TARGET.projectUuid } }] } });
  await active.execute();
  assert.equal(active.calls.every((call) => call === "registry-release"), true);
});

void test("native project tabs accept only their independently retained checkpoint owner", async () => {
  const owner = "cd".repeat(16);
  const start = { tabId: "tab_page1", data: { doctype: -1 }, isAbleDelete: false };
  const target = { tabId: `${TARGET.documentUuid}@${TARGET.projectUuid}`, isAbleDelete: true,
    data: { doctype: TARGET.documentType, pid: TARGET.projectUuid } };
  const navigation = { requireExclusiveTabs: true, navigate: false, checkpointProjectOwnerUuid: owner };
  for (const data of [target.data, { ...target.data, owner }]) {
    const run = fixture({ navigation, project: PROJECT, document: DOCUMENT,
      tree: { id: "editor-window-main", tabs: [start, { ...target, data }] } });
    await run.execute();
    assert.equal(run.calls.every((call) => call === "registry-release"), true);
  }
  for (const tree of [
    { id: "editor-window-main", tabs: [start, { ...target, data: { ...target.data, owner: "ef".repeat(16) } }] },
    { id: "editor-window-main", tabs: [{ ...start, data: { ...start.data, owner } }, target] },
    { id: "editor-window-main", tabs: [start, { ...target, parentProjectUuid: "foreign", data: { ...target.data, owner } }] },
  ]) {
    const run = fixture({ navigation, project: PROJECT, document: DOCUMENT, tree });
    await assert.rejects(run.execute(), /unrelated-editor-tab/u);
    assert.deepEqual(run.calls, []);
  }
  const unproved = fixture({ navigation: { requireExclusiveTabs: true, navigate: false }, project: PROJECT, document: DOCUMENT,
    tree: { id: "editor-window-main", tabs: [start, { ...target, data: { ...target.data, owner } }] } });
  await assert.rejects(unproved.execute(), /unrelated-editor-tab/u);
  assert.deepEqual(unproved.calls, []);
});

void test("same project without a document needs no project open; already-active exact target is a read-only no-op", async () => {
  const sameProject = fixture({ project: PROJECT });
  await sameProject.execute();
  assert.equal(sameProject.calls.some((call) => call.startsWith("project:")), false);
  const active = fixture({ project: PROJECT, document: DOCUMENT });
  await active.execute();
  assert.equal(active.calls.every((call) => call === "registry-release"), true);
});

void test("the exact observed Start Page sentinel is empty, but UUID zero cannot hide an actual document", async () => {
  const sentinel = { uuid: "0", documentType: 0, tabId: "0" };
  await fixture({ document: sentinel }).execute();
  for (const document of [{ ...sentinel, documentType: 1 }, { ...sentinel, tabId: "real-tab" }, { ...sentinel, documentUuid: "real-document" }]) {
    const run = fixture({ document });
    await assert.rejects(run.execute(), /other-document-active|identity-alias/u);
    assert.deepEqual(run.calls, []);
  }
});

void test("the pinned fixed tab_page1 Start Page has no owners and never permits replacement of another project", async () => {
  const startPage = { uuid: "tab_page1", documentType: -1, tabId: "tab_page1" };
  await fixture({ document: startPage }).execute();
  for (const document of [{ ...startPage, uuid: "tab_page2", tabId: "tab_page2" }, { ...startPage, documentType: 1 },
    { ...startPage, tabId: "other-tab" }, { ...startPage, parentProjectUuid: TARGET.projectUuid }, { ...startPage, parentLibraryUuid: "library" }]) {
    const run = fixture({ document });
    await assert.rejects(run.execute(), /other-document-active/u);
    assert.deepEqual(run.calls, []);
  }
  await fixture({ project: PROJECT, document: startPage }).execute();
  await assert.rejects(fixture({ project: { uuid: "other-project" }, document: startPage }).execute(), /other-project-active/u);
});

void test("unrelated active project, document, type and orphan document are refused before navigation", async () => {
  for (const options of [{ project: { uuid: "other-project" } }, { project: PROJECT, document: { ...DOCUMENT, uuid: "another-document" } },
    { project: PROJECT, document: { ...DOCUMENT, documentType: 3 } }, { document: DOCUMENT }]) {
    const run = fixture(options);
    await assert.rejects(run.execute(), /other-project-active|other-document-active|document-without-project/u);
    assert.deepEqual(run.calls, []);
  }
});

void test("checkpoint path mismatch, malformed registry and bounded response fail before any navigation", async () => {
  for (const options of [{ registryPath: "C:\\Other\\project.eprj2" }, { registryPath: "C:\\Fixture\\..\\project.eprj2" },
    { registryBytes: new TextEncoder().encode("not-json") }, { registryBytes: new Uint8Array(2_097_153) }]) {
    const run = fixture(options);
    await assert.rejects(run.execute(), /registry-target-mismatch|registry-path|registry-json|registry-bound/u);
    assert.equal(run.calls.every((call) => call.startsWith("registry-")), true);
    assert.ok(run.calls.includes("registry-release"));
  }
});

void test("context is rechecked after the registry await and before dispatch", async () => {
  const run = fixture({ projectRace: true });
  await assert.rejects(run.execute(), /other-project-active/u);
  assert.equal(run.calls.every((call) => call === "registry-release"), true);
});

void test("false/undefined API results and wrong activation readback cannot become successful recovery", async () => {
  for (const options of [{ openProjectResult: false }, { openDocumentResult: null }, { activateResult: null }, { wrongReadback: true }, { activateResult: false, wrongReadback: true }]) {
    await assert.rejects(fixture(options).execute(), /open-project-result|open-document-result|activate-result|other-document-active/u);
  }
});

void test("false activation acknowledgment is accepted only with independently exact target readback", async () => {
  const value = fixture({ activateResult: false });
  await value.execute();
  assert.equal(value.calls.filter((call) => call.startsWith("activate:")).length, 1);
});

void test("an absent post-activation document settles to the exact target without repeating navigation", async () => {
  const value = fixture({ delayedReadback: true });
  const result = await value.execute();
  assert.deepEqual(structuredClone(result), { ok: true, schema: "easyeda-pro-control.recovery-navigation.v1",
    openedProject: true, openedDocument: true, project: { uuid: TARGET.projectUuid, path: TARGET.projectPath }, document: DOCUMENT });
  assert.deepEqual(value.calls.filter((call) => !call.startsWith("registry-")), [
    `project:${TARGET.projectUuid}`, `document:${TARGET.documentUuid}`, "activate:reopened-tab",
  ]);
});

type ReadinessMode = "delayed" | "owner-drift" | "auxiliary-drift" | "container-drift" | "page-drift" | "tab-drift" | "identity-alias" | "late-owner-drift" | "timeout" | "getter-hangs" | "getter-throws";
async function readinessFixture(documentType: 1 | 3, mode: ReadinessMode): Promise<{ result?: unknown; error?: unknown; calls: string[]; polls: number }> {
  const calls: string[] = [], target = { ...TARGET, documentType };
  const tabId = `${target.documentUuid}@${target.projectUuid}`;
  let auxiliaryReady = !["delayed", "timeout"].includes(mode), document: RecordValue | undefined, polls = 0, timerId = 0;
  let timeout: (() => void) | undefined;
  const timers = new Map<number, () => void>();
  const info = (): Promise<unknown> => {
    if (mode === "getter-hangs") {
      // oxlint-disable-next-line promise/avoid-new -- A never-settling native getter proves that the independent observer deadline remains effective.
      return new Promise(() => { setImmediate(() => { timeout?.(); }); });
    }
    if (mode === "getter-throws") { return Promise.reject(new Error("fixture-readiness-getter")); }
    if (mode === "auxiliary-drift") { return Promise.resolve({ uuid: "foreign-editor" }); }
    if (mode === "late-owner-drift" && document !== undefined) { document["parentProjectUuid"] = "foreign-project"; }
    if (!auxiliaryReady) { return Promise.resolve(null); }
    let uuid = documentType === 1 ? "schematic" : target.documentUuid;
    if (mode === "container-drift") { uuid = "foreign-container"; }
    return Promise.resolve({ uuid,
      tabId: mode === "tab-drift" && documentType === 3 ? "foreign-tab" : tabId,
      ...(mode === "identity-alias" ? { documentUuid: "foreign-alias" } : {}) });
  };
  const environment = { TextDecoder, Uint8Array, window: { top: {
    setTimeout: (callback: () => void, delay: number): number => {
      timerId += 1; const id = timerId; timers.set(id, callback);
      if (delay === 15_000) { timeout = callback; }
      else {
        assert.equal(delay, 50);
        setImmediate(() => {
          if (!timers.has(id)) { return; }
          timers.delete(id); polls += 1;
          if (mode === "timeout" && polls === 4) { timeout?.(); }
          if (mode === "delayed") {
            if (polls === 1 && document !== undefined) { document["parentProjectUuid"] = target.projectUuid; }
            if (polls === 2) { auxiliaryReady = true; }
          }
          // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Runs the generated observer's timer callback.
          callback();
        });
      }
      return id;
    },
    clearTimeout: (id: number): void => { if (timers.get(id) === timeout) { timeout = undefined; } timers.delete(id); },
  } }, eda: {
    dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(PROJECT), openProject: (): never => assert.fail("Project is already open") },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(document) },
    dmt_EditorControl: {
      openDocument: (): Promise<string> => {
        calls.push("open"); document = { uuid: target.documentUuid, documentType, tabId,
          ...(["delayed", "timeout"].includes(mode) ? {} : { parentProjectUuid: mode === "owner-drift" ? "foreign-project" : target.projectUuid }) };
        return Promise.resolve(tabId);
      },
      activateDocument: (): Promise<boolean> => { calls.push("activate"); return Promise.resolve(true); },
    },
    dmt_Pcb: { getCurrentPcbInfo: info },
    dmt_Schematic: { getCurrentSchematicInfo: info, getCurrentSchematicPageInfo: (): Promise<unknown> => Promise.resolve(auxiliaryReady ?
      { uuid: mode === "page-drift" ? "foreign-page" : target.documentUuid, tabId: mode === "tab-drift" ? "foreign-tab" : tabId, parentSchematicUuid: "schematic" } : undefined) },
    sys_ClientUrl: { request: (url: string): Promise<unknown> => Promise.resolve({ ok: true, url,
      body: Response.json({ success: true, result: { [target.projectUuid]: { path: String.raw`C:\Fixture\project.eprj2` } } }).body }) },
  } };
  try {
    const pending: unknown = runInNewContext(`(async()=>{${buildRecoveryNavigationCode(target, { requireEditorReadiness: true })}})()`, environment);
    return { result: await pending, calls, polls };
  } catch (error) { return { error, calls, polls }; }
  finally { assert.equal(timers.size, 0); assert.equal(timeout, undefined); }
}

void test("project opening observes delayed parent ownership and auxiliary readiness without repeating Open or Activate", async () => {
  for (const type of [1, 3] as const) {
    const run = await readinessFixture(type, "delayed");
    assert.equal(run.error, undefined); assert.notEqual(run.result, undefined);
    assert.deepEqual(run.calls, ["open", "activate"]);
    assert.equal(run.polls, 3);
  }
});

void test("readiness ownership drift, foreign PCB identity and getter failure cannot turn into a successful project open", async () => {
  for (const type of [1, 3] as const) {
    const owner = await readinessFixture(type, "owner-drift");
    assert.match(String(owner.error), /editor-readiness-owner/u); assert.equal(owner.polls, 0);
    assert.deepEqual(owner.calls, ["open", "activate"]);
    const thrown = await readinessFixture(type, "getter-throws");
    assert.match(String(thrown.error), /fixture-readiness-getter/u); assert.equal(thrown.polls, 0);
  }
  const pcb = await readinessFixture(3, "auxiliary-drift");
  assert.match(String(pcb.error), /editor-readiness-pcb/u); assert.equal(pcb.polls, 0);
});

void test("schematic container/page conflicts, aliased identities and drift across an awaited getter refuse without retries", async () => {
  for (const [mode, category] of [["container-drift", "container"], ["page-drift", "page"], ["tab-drift", "page"],
    ["identity-alias", "identity-alias"], ["late-owner-drift", "owner"]] as const) {
    const run = await readinessFixture(1, mode);
    assert.ok(String(run.error).includes(category), String(run.error));
    assert.equal(run.polls, 0); assert.deepEqual(run.calls, ["open", "activate"]);
  }
  for (const mode of ["tab-drift", "identity-alias", "late-owner-drift"] as const) {
    const run = await readinessFixture(3, mode);
    assert.notEqual(run.error, undefined); assert.equal(run.polls, 0); assert.deepEqual(run.calls, ["open", "activate"]);
  }
});

void test("absent and hanging readiness both time out once, clean up observers and leave navigation consumed", async () => {
  for (const type of [1, 3] as const) {
    for (const mode of ["timeout", "getter-hangs"] as const) {
      const run = await readinessFixture(type, mode);
      assert.match(String(run.error), /NATIVE_LIFECYCLE_OPEN_TIMEOUT/u);
      assert.deepEqual(run.calls, ["open", "activate"]);
    }
  }
});

void test("sealed context is bound to exact checkpoint project membership/type and canonical source path", () => {
  const checkpoint: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: TARGET.projectUuid,
    branchUuid: "ab".repeat(16), headHistoryUuid: "cd".repeat(16), checkpointSha256: "ef".repeat(32), historyRowCount: 1, chunkCount: 1,
    plaintextBytes: 100, semanticSha256: "12".repeat(32), documents: [{ uuid: TARGET.documentUuid, docType: "SCH_PAGE", metadata: {}, records: [], semanticSha256: "34".repeat(32) }] };
  const context = { project: { ...PROJECT, path: "C:\\Fixture\\project.eprj2" }, document: DOCUMENT };
  assert.deepEqual(deriveRecoveryNavigationTarget(context, checkpoint), TARGET);
  for (const changed of [{ ...checkpoint, projectUuid: "00".repeat(32) }, { ...checkpoint, documents: [] },
    { ...checkpoint, documents: checkpoint.documents.map((document) => ({ ...document, docType: "PCB" })) },
    { ...checkpoint, documents: [...checkpoint.documents, ...checkpoint.documents] }]) {
    assert.throws(() => deriveRecoveryNavigationTarget(context, changed), /existing checkpoint document/u);
  }
  assert.throws(() => deriveRecoveryNavigationTarget({ ...context, document: { ...DOCUMENT, documentUuid: "other" } }, checkpoint), /aliases disagree/u);
  assert.throws(() => buildRecoveryNavigationCode({ ...TARGET, projectPath: "C:\\Fixture\\project.eprj2" }), /canonical/u);
  assert.throws(() => deriveRecoveryNavigationTarget({ ...context, document: { ...DOCUMENT, documentType: 2 } }, checkpoint));
});
