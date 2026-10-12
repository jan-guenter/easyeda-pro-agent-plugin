import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { isRecord, sha256Json } from "../src/core.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { buildLibraryExecutionExpression, libraryExecutionKind } from "../src/library-runtime.ts";
import { libraryMutationReceipt, verifyRecoveredLibraryMutation } from "../src/library-recovery-state.ts";
import { LibraryExecutor } from "../src/library-execution.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { ExpectedContext } from "../src/engine.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { buildProjectSymbolMetadataExpression, prepareProjectSymbolMetadata, projectSymbolMetadataInverse, verifyProjectSymbolMetadataEffect } from "../src/project-symbol-metadata.ts";
import type { ProjectSymbolMetadataPlan } from "../src/project-symbol-metadata.ts";

const OPERATION = { id: "modify-symbol", action: "library.symbol.modify", libraryUuid: "project", target: { uuid: "symbol" }, patch: { description: "changed" } };
const CONTEXT = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "board@project" } };

void test("symbol preparation rejects individually valid Unicode peer titles beyond the recovery artifact byte limit", () => {
  const peers = Array.from({ length: 4096 }, (_, index) => document(`peer-${String(index)}`, "界".repeat(512)));
  assert.throws(() => prepareProjectSymbolMetadata(OPERATION, history([document(), ...peers])), /recovery artifact byte limit/u);
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  assert.throws(() => buildProjectSymbolMetadataExpression({ ...plan, peerTitles: peers.map((peer) => {
    const title = peer.records[0]?.body["title"];
    assert.equal(typeof title, "string");
    return String(title);
  }) }, CONTEXT), /recovery artifact byte limit/u);
});

function document(uuid = "symbol", title = "MixedCase"): NativeDocumentSnapshot {
  const records = [
    { id: "META", type: "META", body: { title, description: "old", docType: 2, source: "", tags: ["Primary", "Secondary"] }, ticket: 1, client: null },
    { id: "part", type: "PART", body: { title: "A" }, ticket: 2, client: null },
    { id: "pin", type: "PIN", body: { partId: "part", number: "1", x: 20, locked: true }, ticket: 3, client: null },
  ];
  return { uuid, docType: "SYMBOL", metadata: { uuid, docType: "SYMBOL", editVersion: "3.2.149.88089769", client: "a".repeat(16), updateTime: 1, version: "1", user: { uuid: "previous-actor" } }, records, semanticSha256: sha256Json(records) };
}
function history(documents: readonly NativeDocumentSnapshot[] = [document()]): NativeHistorySnapshot {
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: "0".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, semanticSha256: sha256Json(documents), documents };
}
function desired(before: NativeHistorySnapshot, title = "MixedCase"): NativeHistorySnapshot {
  const header = { uuid: "symbol", docType: "SYMBOL", client: "b".repeat(16), updateTime: 2, version: "2", editVersion: "3.2.149.88089769" };
  const documents = before.documents.map((entry) => entry.uuid === "symbol" ? { ...entry,
    metadata: header,
    records: entry.records.map((record) => record.type === "META" ? { ...record, body: { ...record.body, title, description: "changed" } } : record) } : entry);
  return history(documents);
}
function execute(plan: ProjectSymbolMetadataPlan, eda: unknown, nativeGlobal: unknown, context: ExpectedContext = CONTEXT,
  nativeReplies: Readonly<Record<string, unknown>> = {}): Promise<unknown> {
  assert.ok(isRecord(eda));
  assert.ok(isRecord(nativeGlobal));
  const host = nativeGlobal["gVars"]; assert.ok(isRecord(host));
  const project = host["currentProject"]; assert.ok(isRecord(project));
  if (!Object.hasOwn(host, "isHistoryMode")) { host["isHistoryMode"] = false; }
  if (!Object.hasOwn(project, "branchUuid")) { project["branchUuid"] = "branch"; }
  if (!Object.hasOwn(project, "isV2Format")) { project["isV2Format"] = false; }
  const bus = host["messageBus"]; assert.ok(isRecord(bus));
  const read = bus["rpcCall"]; assert.ok(typeof read === "function");
  const nativeWriter = eda["nativeWriter"]; assert.ok(isRecord(nativeWriter));
  const modify = nativeWriter["modify"]; assert.ok(typeof modify === "function");
  const nativeRead = async (): Promise<Record<string, unknown>> => {
    const result: unknown = await Reflect.apply(read, bus, []);
    assert.ok(isRecord(result)); assert.ok(isRecord(result["message"]));
    return { source: "", custom_tags: JSON.stringify(plan.beforeTags), ...result["message"] };
  };
  bus["rpcCall"] = async (topic: string, args: unknown[]): Promise<unknown> => {
    if (Object.hasOwn(nativeReplies, topic)) { return { message: nativeReplies[topic] }; }
    if (topic === "canAddLib") { assert.deepEqual(args, [plan.projectUuid]); return { message: { hasPermission: true } }; }
    if (topic === "/PrjDB/project/getData") { assert.deepEqual(args, [plan.projectUuid]); return { message: { uuid: plan.projectUuid, owner: { uuid: plan.ownerUuid }, currentBranch: plan.branchUuid, isV2Format: false } }; }
    if (topic === "/PrjDB/symbol/getData") { assert.deepEqual(args, [plan.targetUuid, plan.projectUuid]); return { message: await nativeRead() }; }
    assert.equal(topic, "/PrjDB/symbol/updateData");
    assert.deepEqual(args, [{ uuid: plan.targetUuid, title: plan.desiredTitle, description: plan.desiredDescription }, plan.projectUuid]);
    const acknowledgment: unknown = await Reflect.apply(modify, nativeWriter, [plan.targetUuid, plan.projectUuid, plan.desiredTitle, plan.desiredDescription]);
    return { message: acknowledgment === true ? await nativeRead() : acknowledgment };
  };
  const globals = Object.assign(nativeGlobal, { PRO_EDITOR_VERSION: "3.2.149.88089769", UI: { tabBar: { getFilterTabs: (): unknown[] => [{ tabId: context.document.tabId,
    data: { doctype: context.document.documentType, pid: "project", ...([2, 4].includes(context.document.documentType) ? { owner: "owner" } : {}) } }],
    getActiveTab: (): unknown => context.document.tabId, hasTabUnSaved: (): false => false, isTabUnSaved: (): false => false }, concurrentDesign: {
    isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb: (): { disable: false } => ({ disable: false }),
  } }, ...nativeGlobal });
  // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Execute only the fixed candidate compiler against isolated test doubles.
  const run = new Function("eda", "globalThis", `return ${buildProjectSymbolMetadataExpression(plan, context)};`);
  // oxlint-disable-next-line typescript/no-unsafe-call -- The compiler-owned function result is immediately confined to unknown.
  const result: unknown = run({ dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(context.document) },
    dmt_EditorControl: { getSplitScreenTree: (): Promise<unknown> => Promise.resolve({ tabs: [{ ...context.document, parentProjectUuid: "project" }] }) },
    lib_Symbol: { modify(): never { throw new Error("Public modifier must never be invoked"); } }, ...eda }, globals);
  return Promise.resolve(result).finally(() => { bus["rpcCall"] = read; });
}

function candidateFixture(plan: ProjectSymbolMetadataPlan): {
  native: Record<string, unknown>;
  eda: Record<string, unknown>;
  metadata: Record<string, unknown>;
  raw: Record<string, unknown>[];
  state: { calls: number; publicCalls: number; documentReads: number; dirty: unknown; acknowledgment: unknown; onDocumentRead: () => void };
} {
  const metadata: Record<string, unknown> = { uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, docType: 2,
    display_title: plan.beforeTitle, description: plan.beforeDescription, source: plan.beforeSource, custom_tags: JSON.stringify(plan.beforeTags) };
  const raw: Record<string, unknown>[] = [{ tabId: "board@project", data: { doctype: 3, pid: "project" } }];
  const state = { calls: 0, publicCalls: 0, documentReads: 0, dirty: false as unknown, acknowledgment: true as unknown, onDocumentRead(): void {
    // Optional test hook.
  } };
  const native = { PRO_EDITOR_VERSION: "3.2.149.88089769", UI: { tabBar: { getFilterTabs: (): unknown => raw,
    getActiveTab: (): string => "board@project", hasTabUnSaved: (): unknown => state.dirty, isTabUnSaved: (): unknown => state.dirty },
  concurrentDesign: { isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb: (): { disable: false } => ({ disable: false }) } },
  gVars: { currentProject: { projectId: "project", branchUuid: "branch", isV2Format: false }, isHistoryMode: false,
    messageBus: { rpcCall: (): Promise<unknown> => Promise.resolve({ message: structuredClone(metadata) }) } } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(CONTEXT.project) },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => { state.documentReads += 1; state.onDocumentRead(); return Promise.resolve(CONTEXT.document); } },
    lib_Symbol: { modify(): never { state.publicCalls += 1; throw new Error("Public routing is forbidden"); } },
    nativeWriter: { modify(): Promise<unknown> {
      state.calls += 1; metadata["display_title"] = plan.desiredTitle; metadata["description"] = plan.desiredDescription;
      return Promise.resolve(state.acknowledgment);
    } } };
  return { native, eda, metadata, raw, state };
}

void test("symbol native raw tabs admit only one exact clean hidden project placeholder", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  const placeholder = { tabId: "0", data: { doctype: 0 }, isAbleDelete: false, isDisplayNone: true, draggable: false, group: "start_blank" };
  const valid = candidateFixture(plan);
  valid.raw.unshift(placeholder, { tabId: "tab_page1", data: { doctype: -1 }, isAbleDelete: false });
  await execute(plan, valid.eda, valid.native); assert.equal(valid.state.calls, 1);
  for (const patch of [{ data: { doctype: 0, pid: "foreign" } }, { isDisplayNone: false }, { draggable: true }, { group: "other" }, { isUnSaved: true }]) {
    const fixture = candidateFixture(plan); fixture.raw.push({ ...placeholder, ...patch });
    await assert.rejects(execute(plan, fixture.eda, fixture.native), /:PROJECT_PLACEHOLDER$/u);
    assert.equal(fixture.state.calls, 0);
  }
  const duplicate = candidateFixture(plan); duplicate.raw.push(placeholder, structuredClone(placeholder));
  await assert.rejects(execute(plan, duplicate.eda, duplicate.native), /:TAB_SCOPE$/u); assert.equal(duplicate.state.calls, 0);
  for (const dirty of [true, undefined, null]) {
    const fixture = candidateFixture(plan); fixture.raw.push(placeholder);
    const ui = fixture.native["UI"]; assert.ok(isRecord(ui)); const tabs = ui["tabBar"]; assert.ok(isRecord(tabs));
    tabs["isTabUnSaved"] = (tabId: string): unknown => tabId === "0" ? dirty : false;
    await assert.rejects(execute(plan, fixture.eda, fixture.native), /:PROJECT_PLACEHOLDER$/u); assert.equal(fixture.state.calls, 0);
  }
});

void test("symbol host diagnostics preserve exact failing subguard without native exception text", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  const fixture = candidateFixture(plan);
  const ui = fixture.native["UI"]; assert.ok(isRecord(ui));
  const permission = ui["concurrentDesign"]; assert.ok(isRecord(permission));
  permission["isConcurrentStrictMode"] = true;
  await assert.rejects(execute(plan, fixture.eda, fixture.native), { message: "Symbol metadata operation refused at host:CONCURRENT_MODE" });
  assert.equal(fixture.state.calls, 0);
});

void test("symbol preparation rejects serializer loss before dispatch and binds tags, source and concrete editor version", () => {
  for (const field of ["unknown-meta", "unknown-header", "missing-tags", "missing-source", "wrong-header-id", "bad-version"]) {
    const before = history(), target = before.documents[0]; assert.ok(target);
    const meta = target.records[0]; assert.ok(meta);
    if (field === "unknown-meta") { meta.body["future"] = "must-preserve"; }
    if (field === "unknown-header") { target.metadata["future"] = "must-preserve"; }
    if (field === "missing-tags") { delete meta.body["tags"]; }
    if (field === "missing-source") { delete meta.body["source"]; }
    if (field === "wrong-header-id") { target.metadata["uuid"] = "other"; }
    if (field === "bad-version") { target.metadata["editVersion"] = null; }
    assert.throws(() => prepareProjectSymbolMetadata(OPERATION, before), field);
  }
  const before = history(), plan = prepareProjectSymbolMetadata(OPERATION, before);
  assert.deepEqual(plan.beforeTags, ["Primary", "Secondary"]); assert.equal(plan.beforeSource, "");
  assert.equal(plan.headerEditVersion, "3.2.149.88089769");
  for (const replacement of [{ beforeTags: [] }, { beforeSource: "substituted" }, { headerEditVersion: "3.3" }, { peerTitles: ["substituted"] }]) {
    assert.throws(() => verifyProjectSymbolMetadataEffect({ ...plan, ...replacement }, before, desired(before)), /checkpoint preparation/u);
  }
});

void test("symbol native serialization preserves bounded empty, single and multiple tags without public classification reprojection", async () => {
  for (const tags of [[], ["one"], ["one", "two"], ["one", "two", "three", ""]]) {
    const before = history(), meta = before.documents[0]?.records[0]; assert.ok(meta); meta.body["tags"] = tags;
    const plan = prepareProjectSymbolMetadata(OPERATION, before), run = candidateFixture(plan);
    assert.equal(verifyProjectSymbolMetadataEffect(plan, before, desired(before))["effectVerified"], true);
    await execute(plan, run.eda, run.native);
    assert.equal(run.state.calls, 1); assert.equal(run.state.publicCalls, 0);
  }
});

void test("symbol header proof permits deterministic actor omission only, never actor replacement or header drift", () => {
  const before = history();
  const after = desired(before), plan = prepareProjectSymbolMetadata(OPERATION, before);
  const proof = verifyProjectSymbolMetadataEffect(plan, before, after);
  assert.equal(proof["headerUserRemoved"], true); assert.equal(proof["editorTitleRefreshVerified"], false);
  assert.equal(proof["currentGenerationLiveValidated"], false); assert.equal(proof["saveInvoked"], false);
  assert.equal(proof["adapterKind"], "native-task-equivalent");
  assert.equal(proof["inverseScope"], "requested-title-and-description-only;generated-header-and-removed-user-not-restored");
  for (const patch of [{ user: { uuid: "previous-actor" } }, { user: { uuid: "other" } }, { user: null }, { editVersion: "3.3" }, { future: true }, { updateTime: 0, version: "0" }, { version: "wrong" }]) {
    const changed = structuredClone(after), target = changed.documents[0]; assert.ok(target); Object.assign(target.metadata, patch);
    assert.throws(() => verifyProjectSymbolMetadataEffect(plan, before, changed), /header/u);
  }
});

void test("symbol native before-read and direct acknowledgments bind owner, source, tags and expected result fields", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  for (const patch of [{ source: "changed" }, { custom_tags: "[]" }, { owner: { uuid: "other" } }, { project_uuid: "other" }, { docType: 18 }]) {
    const run = candidateFixture(plan); Object.assign(run.metadata, patch);
    await assert.rejects(execute(plan, run.eda, run.native), /before-read/u); assert.equal(run.state.calls, 0);
  }
  for (const patch of [{ uuid: "other" }, { display_title: "wrong" }, { description: "old" }, { source: "changed" }, { custom_tags: "[]" }, { owner: { uuid: "other" } }]) {
    const run = candidateFixture(plan); run.state.acknowledgment = { ...run.metadata, description: "changed", ...patch };
    await assert.rejects(execute(plan, run.eda, run.native), /modify/u); assert.equal(run.state.calls, 1); assert.equal(run.state.publicCalls, 0);
  }
  const run = candidateFixture(plan); run.state.acknowledgment = { success: true, result: { ...run.metadata, description: "changed" } };
  await assert.rejects(execute(plan, run.eda, run.native), /modify/u); assert.equal(run.state.calls, 1);
});

void test("symbol native project and canAddLib permission checks fail closed", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  for (const permission of [false, null, {}, { hasPermission: false }, { hasPermission: "true" }]) {
    const run = candidateFixture(plan);
    await assert.rejects(execute(plan, run.eda, run.native, CONTEXT, { canAddLib: permission }), /permission/u); assert.equal(run.state.calls, 0);
  }
  for (const patch of [{ owner: { uuid: "other" } }, { currentBranch: "other" }, { isV2Format: true }, { archive: true }, { store: true }, { cbb_project: true }, { uuid: "other" }]) {
    const run = candidateFixture(plan);
    await assert.rejects(execute(plan, run.eda, run.native, CONTEXT, { "/PrjDB/project/getData": { uuid: "project", owner: { uuid: "owner" }, currentBranch: "branch", isV2Format: false, ...patch } }), /permission/u);
    assert.equal(run.state.calls, 0);
  }
});

void test("symbol final synchronous proof rejects editor, history, permission and raw-tab drift after the last context await", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  for (const fault of ["version", "branch", "history", "v2", "permission", "strict", "target-open", "dirty", "dirty-undefined", "dirty-null", "foreign", "bad-data", "control-tab"]) {
    const run = candidateFixture(plan);
    const host = run.native["gVars"], ui = run.native["UI"];
    assert.ok(isRecord(ui)); assert.ok(isRecord(host));
    const permission = ui["concurrentDesign"], project = host["currentProject"]; assert.ok(isRecord(permission)); assert.ok(isRecord(project));
    run.state.onDocumentRead = (): void => {
      if (run.state.documentReads !== 5) { return; }
      if (fault === "version") { run.native["PRO_EDITOR_VERSION"] = "3.3"; }
      if (fault === "branch") { project["branchUuid"] = "other"; }
      if (fault === "history") { host["isHistoryMode"] = true; }
      if (fault === "v2") { project["isV2Format"] = true; }
      if (fault === "permission") { permission["getIframeDisableStatusPanelPcb"] = (): { disable: true } => ({ disable: true }); }
      if (fault === "strict") { permission["isConcurrentStrictMode"] = true; }
      if (fault === "target-open") { run.raw.push({ tabId: "symbol@project", data: { doctype: 2, pid: "project", owner: "owner" } }); }
      if (fault === "dirty") { run.state.dirty = true; }
      const tab = run.raw[0]; assert.ok(tab);
      if (fault === "dirty-undefined") { tab["isUnSaved"] = undefined; }
      if (fault === "dirty-null") { tab["isUnSaved"] = null; }
      if (fault === "foreign") { run.raw.push({ tabId: "foreign@other", data: { doctype: 3, pid: "other" } }); }
      if (fault === "bad-data") { tab["data"] = Object.assign([], { doctype: 3, pid: "project" }); }
      if (fault === "control-tab") { run.raw.push({ tabId: "bad\n@project", data: { doctype: 3, pid: "project" } }); }
    };
    await assert.rejects(execute(plan, run.eda, run.native), /target-closed/u, fault);
    assert.equal(run.state.calls, 0); assert.equal(run.state.publicCalls, 0);
  }
});

void test("symbol runtime collision guard uses the worker locale comparator with retained peer titles", async () => {
  const plan = prepareProjectSymbolMetadata({ ...OPERATION, patch: { name: "I" } }, history([document(), document("peer", "ı")]));
  // oxlint-disable-next-line typescript/unbound-method -- Reflect.apply below supplies the original string receiver explicitly.
  const original = String.prototype.toLocaleLowerCase;
  const locale = mock.method(String.prototype, "toLocaleLowerCase", function localeLowerCase(this: string): string { return Reflect.apply(original, this, ["tr"]); });
  try {
    const run = candidateFixture(plan);
    await assert.rejects(execute(plan, run.eda, run.native), /host/u); assert.equal(run.state.calls, 0);
  } finally { locale.mock.restore(); }
});

void test("symbol dispatch rechecks writable state after the final asynchronous context helper resolves", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  for (const fault of ["target-open", "dirty", "project-switch"]) {
    const run = candidateFixture(plan);
    const host = run.native["gVars"]; assert.ok(isRecord(host));
    const project = host["currentProject"]; assert.ok(isRecord(project));
    run.state.onDocumentRead = (): void => {
      if (run.state.documentReads !== 5) { return; }
      // The first continuation resumes inside assertContext; the second runs
      // After its synchronous proof but before the outer dispatch continuation.
      queueMicrotask(() => { queueMicrotask(() => {
        if (fault === "target-open") { run.raw.push({ tabId: "symbol@project", data: { doctype: 2, pid: "project", owner: "owner" } }); }
        if (fault === "dirty") { run.state.dirty = true; }
        if (fault === "project-switch") { project["projectId"] = "other"; }
      }); });
    };
    await assert.rejects(execute(plan, run.eda, run.native), /target-closed/u, fault);
    assert.equal(run.state.documentReads, 5); assert.equal(run.state.calls, 0); assert.equal(run.state.publicCalls, 0);
  }
});

void test("symbol native raw tabs admit proven clean library footprint pid absence but reject null or foreign ownership", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  for (const pid of [undefined, null, "other"]) {
    const run = candidateFixture(plan); run.raw.push({ tabId: "footprint@project", data: { doctype: 4, pid, owner: "owner" } });
    if (pid === undefined) { await execute(plan, run.eda, run.native); assert.equal(run.state.calls, 1); }
    else { await assert.rejects(execute(plan, run.eda, run.native), /host/u); assert.equal(run.state.calls, 0); }
  }
});

void test("symbol metadata execution refuses unproven families and requires a checkpoint-bound native plan", () => {
  const before = history();
  const plan = prepareProjectSymbolMetadata(OPERATION, before);
  assert.equal(plan.desiredTitle, "MixedCase");
  assert.equal(libraryExecutionKind(OPERATION), "project-symbol-metadata");
  assert.throws(() => buildLibraryExecutionExpression(OPERATION), /checkpoint-bound native plan/u);
  for (const operation of [
    { ...OPERATION, libraryUuid: "cloud" },
    { ...OPERATION, target: { resultOf: "create" } },
    { ...OPERATION, patch: { classification: [] } },
    { ...OPERATION, patch: { description: null } },
    { ...OPERATION, patch: { name: " \t\n" } },
    { ...OPERATION, code: "raw code" },
  ]) { assert.throws(() => prepareProjectSymbolMetadata(operation, before)); }
  const nonordinary = structuredClone(before);
  const meta = nonordinary.documents[0]?.records[0]; assert.ok(meta); meta.body["docType"] = 18;
  assert.throws(() => prepareProjectSymbolMetadata(OPERATION, nonordinary), /META.docType/u);
  assert.throws(() => prepareProjectSymbolMetadata(OPERATION, history([document(), document("peer", "mixedcase")])), /already exists/u);
  assert.throws(() => prepareProjectSymbolMetadata(OPERATION, history([document(), document()])), /one active SYMBOL/u);
});

void test("symbol compiler requires an exact bounded inactive-target editor context", () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  for (const context of [
    { ...CONTEXT, project: { ...CONTEXT.project, uuid: "other" } },
    { ...CONTEXT, project: { ...CONTEXT.project, projectUuid: "other" } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentUuid: "other" } },
    { ...CONTEXT, document: { ...CONTEXT.document, uuid: "symbol", tabId: "symbol@project" } },
    { ...CONTEXT, document: { ...CONTEXT.document, tabId: "" } },
    { ...CONTEXT, document: { ...CONTEXT.document, tabId: "x".repeat(513) } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentType: 18 } },
    { ...CONTEXT, document: { ...CONTEXT.document, parentProjectUuid: "other" } },
    { ...CONTEXT, document: { ...CONTEXT.document, parentLibraryUuid: "owner" } },
  ]) { assert.throws(() => buildProjectSymbolMetadataExpression(plan, context)); }
});

void test("symbol modifier refuses same-project document drift after awaited metadata or tab reads", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  for (const switchAt of ["metadata", "tree"]) {
    let calls = 0, selected = CONTEXT.document;
    const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => {
      if (switchAt === "metadata") { selected = { ...CONTEXT.document, uuid: "other", tabId: "other@project" }; }
      return Promise.resolve({ message: { uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, docType: 2, display_title: "MixedCase", description: "old" } });
    } } };
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(CONTEXT.project) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(selected) },
      dmt_EditorControl: { getSplitScreenTree: (): Promise<unknown> => {
        if (switchAt === "tree") { selected = { ...CONTEXT.document, uuid: "other", tabId: "other@project" }; }
        return Promise.resolve({ tabs: [{ ...CONTEXT.document, parentProjectUuid: "project" }] });
      } }, nativeWriter: { modify(): Promise<boolean> { calls += 1; return Promise.resolve(true); } } };
    await assert.rejects(execute(plan, eda, { gVars: host }), /before-read|target-closed/u);
    assert.equal(calls, 0);
  }
});

void test("symbol modifier makes its last awaited pre-write read the exact active document proof", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  for (const drift of [{ uuid: "other" }, { documentUuid: "other" }, { documentType: 1 }, { tabId: "other@project" },
    { parentProjectUuid: "other" }, { parentLibraryUuid: "other" }]) {
    let calls = 0, documentReads = 0;
    const events: string[] = [];
    const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => Promise.resolve({ message: {
      uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, docType: 2, display_title: "MixedCase", description: "old",
    } }) } };
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => { events.push("project"); return Promise.resolve(CONTEXT.project); } },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => {
        documentReads += 1; events.push("document");
        return Promise.resolve(documentReads === 5 ? { ...CONTEXT.document, ...drift } : CONTEXT.document);
      } }, nativeWriter: { modify(): Promise<boolean> { calls += 1; return Promise.resolve(true); } } };
    await assert.rejects(execute(plan, eda, { gVars: host }), /target-closed/u);
    assert.equal(calls, 0); assert.equal(events.at(-1), "document");
  }
});

void test("symbol modifier retains required active ownership and rechecks host identity after the last await", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  const context = { ...CONTEXT, document: { ...CONTEXT.document, documentType: 2, parentProjectUuid: "project", parentLibraryUuid: "owner" } };
  for (const fault of ["missing-project", "missing-library", "project-alias", "host-project"]) {
    let calls = 0, documentReads = 0, projectReads = 0;
    const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => Promise.resolve({ message: {
      uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, docType: 2, display_title: "MixedCase", description: "old",
    } }) } };
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => {
      projectReads += 1;
      return Promise.resolve(projectReads === 5 && fault === "project-alias" ? { ...CONTEXT.project, projectUuid: "other" } : CONTEXT.project);
    } }, dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => {
      documentReads += 1;
      if (documentReads !== 5) { return Promise.resolve(context.document); }
      if (fault === "host-project") { host.currentProject.projectId = "other"; }
      return Promise.resolve({ ...context.document, ...(fault === "missing-project" ? { parentProjectUuid: undefined } : {}),
        ...(fault === "missing-library" ? { parentLibraryUuid: undefined } : {}) });
    } }, nativeWriter: { modify(): Promise<boolean> { calls += 1; return Promise.resolve(true); } } };
    await assert.rejects(execute(plan, eda, { gVars: host }, context), /target-closed/u);
    assert.equal(calls, 0);
  }
});

void test("symbol metadata proof admits only the exact requested fields and all peer records", () => {
  const before = history([document(), document("peer", "Other")]);
  const plan = prepareProjectSymbolMetadata(OPERATION, before);
  const after = desired(before);
  const proof = verifyProjectSymbolMetadataEffect(plan, before, after);
  assert.equal(proof["effectVerified"], true); assert.equal(proof["persistenceEvidence"], "supplied-history-comparison");
  assert.equal(Object.hasOwn(proof, "saved"), false); assert.equal(proof["reopened"], false);
  assert.throws(() => verifyProjectSymbolMetadataEffect(plan, before, desired(before, "mixedcase")), /unrequested/u);
  assert.throws(() => verifyProjectSymbolMetadataEffect(plan, { ...before, branchUuid: "other" }, after), /branch/u);
  assert.throws(() => verifyProjectSymbolMetadataEffect(plan, before, { ...after, projectOwnerUuid: "other" }), /owner/u);
  for (const [index, recordIndex, field, value] of [[0, 2, "x", 21], [0, 0, "source", "changed"], [1, 0, "description", "collateral"]] as const) {
    const altered = structuredClone(after);
    const record = altered.documents[index]?.records[recordIndex]; assert.ok(record); record.body[field] = value;
    assert.throws(() => verifyProjectSymbolMetadataEffect(plan, before, altered), /geometry|unrelated/u);
  }
  const headerDrift = structuredClone(after);
  const target = headerDrift.documents[0]; assert.ok(target); target.metadata["user"] = { uuid: "other" };
  assert.throws(() => verifyProjectSymbolMetadataEffect(plan, before, headerDrift), /header/u);
});

void test("symbol candidate supplies exact display title to one fixed project-qualified metadata writer", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  let calls = 0, description = "old";
  const native = (): unknown => ({ uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, docType: 2, title: "mixedcase", display_title: "MixedCase", description });
  const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => Promise.resolve({ message: native() }) } };
  const api = { marker: true, modify(uuid: string, library: string, title: string, value: string): Promise<boolean> {
    assert.equal(this.marker, true); assert.equal(uuid, "symbol"); assert.equal(library, "project"); assert.equal(title, "MixedCase");
    calls += 1; description = value; return Promise.resolve(true);
  } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: "project" }) }, nativeWriter: api };
  assert.deepEqual(decodeExactReadEnvelope(await execute(plan, eda, { gVars: host })), { kind: "project-symbol-metadata", targetId: "symbol", createdId: null });
  assert.equal(calls, 1);
});

void test("symbol candidate refuses owner drift before mutation and never retries an ambiguous native result", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  let calls = 0, owner = "other";
  const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => Promise.resolve({ message: { uuid: "symbol", project_uuid: "project", owner: { uuid: owner }, docType: 2, display_title: "MixedCase", description: "old" } }) } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: "project" }) }, nativeWriter: {
    modify(): never { calls += 1; throw new Error("Private design secret"); },
  } };
  await assert.rejects(execute(plan, eda, { gVars: host }), /refused at before-read/u); assert.equal(calls, 0);
  owner = "owner";
  await assert.rejects(execute(plan, eda, { gVars: host }), { message: "Symbol metadata operation refused at modify:EXCEPTION" }); assert.equal(calls, 1);
});

void test("symbol inverse requires the complete proved forward effect and prepares a new exact patch", () => {
  const before = history([document(), document("peer", "Other")]);
  const operation = { ...OPERATION, patch: { name: "RenamedSymbol", description: "changed" } };
  const plan = prepareProjectSymbolMetadata(operation, before);
  const after = desired(before, "RenamedSymbol");
  const inverse = projectSymbolMetadataInverse(plan, before, after, "inverse-symbol");
  assert.deepEqual(inverse, { id: "inverse-symbol", action: "library.symbol.modify", libraryUuid: "project", target: { uuid: "symbol" }, patch: { name: "MixedCase", description: "old" } });
  const inversePlan = prepareProjectSymbolMetadata(inverse, after);
  assert.notEqual(inversePlan.beforeProjectSha256, plan.beforeProjectSha256);
  const restored = structuredClone(before);
  const target = restored.documents[0]; assert.ok(target);
  target.metadata["updateTime"] = 3; target.metadata["version"] = "3"; delete target.metadata["user"];
  assert.equal(verifyProjectSymbolMetadataEffect(inversePlan, after, restored)["effectVerified"], true);
  assert.throws(() => projectSymbolMetadataInverse(plan, before, desired(before, "Other"), "inverse-symbol"), /unrequested/u);
});

void test("symbol mutation recovery binds the immutable prepared plan and exact returned target", () => {
  const before = history();
  const after = desired(before), preparedSymbol = prepareProjectSymbolMetadata(OPERATION, before);
  const nativeReturn = { kind: "project-symbol-metadata", targetId: "symbol", createdId: null };
  const retainedReceipt = libraryMutationReceipt(OPERATION, nativeReturn);
  const verified = verifyRecoveredLibraryMutation({ operation: OPERATION, before, after, nativeReturn, retainedReceipt, preparedSymbol });
  assert.equal(verified.proof["effectVerified"], true);
  assert.equal(verified.proof["reopened"], false);
  for (const changed of [{ ...nativeReturn, targetId: "other" }, { ...nativeReturn, createdId: "a".repeat(16) }, { ...nativeReturn, targetId: null }]) {
    assert.throws(() => libraryMutationReceipt(OPERATION, changed), /identity/u);
  }
  assert.throws(() => verifyRecoveredLibraryMutation({ operation: OPERATION, before, after, nativeReturn, preparedSymbol: { ...preparedSymbol, beforeTitle: "changed" } }), /immutable operation/u);
  assert.throws(() => verifyRecoveredLibraryMutation({ operation: OPERATION, before, after, nativeReturn }), /immutable operation/u);
  assert.throws(() => verifyRecoveredLibraryMutation({ operation: OPERATION, before, after, nativeReturn, preparedSymbol, retainedReceipt: { ...retainedReceipt, nativeReturnSha256: "0".repeat(64) } }), /rebound/u);
});

void test("symbol lifecycle refusal precedes active-target and write-confirmation admission without upstream access", async () => {
  let calls = 0;
  const engine = new EasyedaControlEngine({ callTool: (): Promise<never> => { calls += 1; return Promise.reject(new Error("Unexpected upstream call")); } });
  const executor = new LibraryExecutor(engine);
  const request = { operation: OPERATION, expectedContext: { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "symbol", documentType: 2, tabId: "symbol@project" } }, expectedFingerprint: {}, confirmWrite: true as const };
  await assert.rejects(executor.execute(request), /operation-owned completion.*project_structures/u);
  const { confirmWrite: _confirmWrite, ...unconfirmed } = request;
  await assert.rejects(executor.execute(unconfirmed), /operation-owned completion.*project_structures/u);
  assert.equal(calls, 0);
});

void test("symbol candidate reproves context after the awaited metadata read before modifying", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  let calls = 0;
  const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => {
    host.currentProject.projectId = "other";
    return Promise.resolve({ message: { uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, docType: 2, display_title: "MixedCase", description: "old" } });
  } } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: host.currentProject.projectId }) }, nativeWriter: {
    modify(): Promise<boolean> { calls += 1; return Promise.resolve(true); },
  } };
  await assert.rejects(execute(plan, eda, { gVars: host }), /refused at before-read/u);
  assert.equal(calls, 0);
});

void test("symbol candidate treats false acknowledgment and post-modify context drift as single consumed calls", async () => {
  const plan = prepareProjectSymbolMetadata(OPERATION, history());
  for (const acknowledgment of [false, true]) {
    let calls = 0, description = "old";
    const host = { currentProject: { projectId: "project" }, messageBus: { rpcCall: (): Promise<unknown> => Promise.resolve({ message: {
      uuid: "symbol", project_uuid: "project", owner: { uuid: "owner" }, docType: 2, display_title: "MixedCase", description,
    } }) } };
    const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: host.currentProject.projectId }) }, nativeWriter: {
      modify(): Promise<boolean> { calls += 1; description = "changed"; host.currentProject.projectId = "other"; return Promise.resolve(acknowledgment); },
    } };
    await assert.rejects(execute(plan, eda, { gVars: host }), acknowledgment ? /refused at after-read/u : /refused at modify/u);
    assert.equal(calls, 1);
  }
});
