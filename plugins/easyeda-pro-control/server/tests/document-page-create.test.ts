import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import type { ExpectedContext } from "../src/engine.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { buildDocumentPageCreateExpression, prepareDocumentPageCreate, verifyDocumentPageCreateEffect } from "../src/document-page-create.ts";

type Value = Record<string, unknown>;
const CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" },
  document: { uuid: "active", documentType: 3, tabId: "active@project", parentProjectUuid: "project" } };
const OPERATION = { id: "create-page", action: "document.page.create", schematic: { uuid: "parent" } };
const CREATED = "c".repeat(16);
function document(uuid: string, docType: string, body: Value): NativeDocumentSnapshot {
  return { uuid, docType, metadata: { uuid, docType, client: "a".repeat(16), updateTime: 1, version: "1", editVersion: "3.2" },
    records: [{ id: "META", type: "META", ticket: 1, client: null, body }], semanticSha256: "" };
}
function rehash(documents: readonly NativeDocumentSnapshot[]): NativeHistorySnapshot {
  const updated = documents.map((entry) => ({ ...entry, semanticSha256: sha256Json({ uuid: entry.uuid, docType: entry.docType,
    metadata: entry.metadata, records: entry.records.map(({ id, type, body }) => ({ id, type, body })) }) }));
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: "a".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents: updated,
    semanticSha256: sha256Json(updated.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
function history(): NativeHistorySnapshot {
  return rehash([document("parent", "SCH", { title: "Container", source: "", board: "", zIndex: null }),
    document("active", "PCB", { title: "PCB", source: "" }),
    document("page", "SCH_PAGE", { title: "P1", schematic: "parent", source: "", zIndex: 1 })]);
}
function mutate(before: NativeHistorySnapshot, uuid: string, update: (entry: NativeDocumentSnapshot) => void): NativeHistorySnapshot {
  const documents = structuredClone(before.documents), target = documents.find((entry) => entry.uuid === uuid);
  assert.ok(target); update(target); return rehash(documents);
}
function desired(before: NativeHistorySnapshot): NativeHistorySnapshot {
  const plan = prepareDocumentPageCreate(OPERATION, before, CONTEXT);
  return rehash([...before.documents, document(CREATED, "SCH_PAGE", { title: plan.desiredTitle, schematic: "parent", source: "", zIndex: plan.desiredZIndex })]);
}
interface FixtureOptions {
  readonly fault?: string;
  readonly faultAt?: string;
  readonly queuedFinalFault?: boolean;
  readonly deferredWriterSwitch?: boolean;
  readonly placeholder?: Value;
  readonly duplicatePlaceholder?: boolean;
  readonly placeholderDirty?: boolean;
}
function fixture(options: FixtureOptions = {}): { run: () => Promise<unknown>; writes: () => number; calls: string[] } {
  const calls: string[] = [], plan = prepareDocumentPageCreate(OPERATION, history(), CONTEXT);
  const pages: Value[] = [{ uuid: "page", project_uuid: "project", schematic_uuid: "parent", docType: 1, display_title: "P1", source: "", zIndex: 1 }];
  const tabs: Value[] = [{ tabId: "active@project", data: { doctype: 3, pid: "project" }, isUnSaved: false }];
  if (options.placeholder !== undefined) { tabs.push(options.placeholder); }
  if (options.duplicatePlaceholder === true && options.placeholder !== undefined) { tabs.push(options.placeholder); }
  let active = structuredClone(CONTEXT.document), dirty = false, documentCalls = 0, writes = 0;
  const permission = { isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb: (): { disable: boolean } => ({ disable: options.fault === "readonly" }) };
  const host = { isHistoryMode: false, currentProject: { projectId: "project", branchUuid: "branch", isV2Format: false }, messageBus: { rpcCall: (topic: string, args: unknown): Promise<unknown> => {
    calls.push(topic); fault(topic);
    if (topic === "ui/hasDocCreatePermission") {
      assert.deepEqual(args, { projectId: "project", showMsg: false });
      return Promise.resolve({ message: options.fault !== "permission" });
    }
    if (topic === "/PrjDB/project/getData") { return Promise.resolve({ message: { uuid: "project", owner: { uuid: options.fault === "owner" ? "foreign" : "owner" },
      currentBranch: options.fault === "native-branch" ? "foreign" : "branch", isV2Format: false, archive: options.fault === "archive" } }); }
    if (topic === "/PrjDB/schematic/getData") { return Promise.resolve({ message: { uuid: "parent", project_uuid: "project", display_name: options.fault === "parent-title" ? "Changed" : "Container", source: options.fault === "parent-source" ? "inherited" : "" } }); }
    if (topic === "/PrjDB/sheet/getAllKVDatas") {
      assert.deepEqual(args, ["parent", "project"]);
      if (options.fault === "failed-siblings") { return Promise.reject(new Error("private worker failure")); }
      const entries = pages.map((page, index): readonly [string, Value] => {
        const uuid = page["uuid"]; assert.ok(typeof uuid === "string");
        return [index > 0 && options.fault === "duplicate-sibling" ? `duplicate${String(index)}` : uuid, structuredClone(page)];
      });
      return Promise.resolve({ message: options.fault === "missing-siblings" ? {} : Object.fromEntries<Value>(entries) });
    }
    assert.equal(topic, "/PrjDB/sheet/addData");
    assert.deepEqual(args, [{ schematic_uuid: "parent", title: "P2", zIndex: 2 }, "project"]);
    writes += 1;
    const created: Value = { uuid: options.fault === "existing-id" ? "page" : CREATED, project_uuid: "project", schematic_uuid: "parent", docType: 1, display_title: "P2", source: "", zIndex: 2 };
    pages.push(created);
    if (options.deferredWriterSwitch === true) {
      return Promise.resolve().then(() => { host.currentProject.projectId = "foreign"; return { message: created }; });
    }
    if (options.fault === "lost-ack") { return Promise.reject(new Error("private native error")); }
    if (options.fault === "extra-effect") { pages.push({ ...created, uuid: "f".repeat(16) }); }
    return Promise.resolve({ message: options.fault === "bad-ack" ? null : created });
  } } };
  function fault(point: string): void {
    if (options.faultAt !== point) { return; }
    if (options.fault === "dirty") { dirty = true; }
    if (options.fault === "host") { host.currentProject.projectId = "foreign"; }
    if (options.fault === "branch") { host.currentProject.branchUuid = "foreign"; }
    if (options.fault === "history") { host.isHistoryMode = true; }
    if (options.fault === "v2") { host.currentProject.isV2Format = true; }
    if (options.fault === "concurrent") { permission.isConcurrentStrictMode = true; }
    if (options.fault === "context") { active = { ...active, uuid: "foreign" }; }
    if (options.fault === "extra-tab") { tabs.push({ tabId: "other@project", data: { doctype: 3, pid: "project" }, isUnSaved: false }); }
    if (options.fault === "ambiguous-dirty") { const tab = tabs[0]; assert.ok(tab); tab["isUnSaved"] = undefined; }
    if (options.fault === "duplicate-sibling") { const page = pages[0]; assert.ok(page); pages.push({ ...page }); }
    if (options.fault === "sibling-title") { const page = pages[0]; assert.ok(page); page["display_title"] = "Changed"; }
  }
  const native = { PRO_EDITOR_VERSION: "3.2", gVars: host, UI: { concurrentDesign: permission, tabBar: { getFilterTabs: (): Value[] => tabs,
    getActiveTab: (): string => "active@project", hasTabUnSaved: (): boolean => dirty, isTabUnSaved: (tabId: string): boolean => dirty || (tabId === "0" && options.placeholderDirty === true) } } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => { calls.push("project"); fault("project"); return Promise.resolve(CONTEXT.project); } },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => {
      calls.push("document"); fault("document"); documentCalls += 1;
      if (options.queuedFinalFault === true && documentCalls === 9) { queueMicrotask(() => { queueMicrotask(() => { dirty = true; }); }); }
      return Promise.resolve(active);
    } }, dmt_Schematic: { createSchematicPage: (): never => { throw new Error("Public create initializes templates and opens editors; it must not run."); } } };
  return { writes: (): number => writes, calls, run: (): Promise<unknown> => {
    // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Only the fixed reviewed compiler executes against synthetic native doubles.
    const execute = new Function("eda", "globalThis", `return ${buildDocumentPageCreateExpression(plan, CONTEXT)};`);
    // oxlint-disable-next-line typescript/no-unsafe-call -- Preserve unknown until the exact result envelope is parsed.
    const result: unknown = execute(eda, native); return Promise.resolve(result);
  } };
}

void test("page creation keeps parent-only schema and reproduces pinned UI naming/order defaults", () => {
  const before = history(), plan = prepareDocumentPageCreate(OPERATION, before, CONTEXT);
  assert.equal(plan.desiredTitle, "P2"); assert.equal(plan.desiredZIndex, 2);
  const renamed = mutate(before, "page", (entry) => { const meta = entry.records[0]; assert.ok(meta); meta.body["title"] = "p_ 003"; meta.body["zIndex"] = 2.5; });
  const next = prepareDocumentPageCreate(OPERATION, renamed, CONTEXT);
  assert.equal(next.desiredTitle, "P4"); assert.equal(next.desiredZIndex, 3.5);
  const empty = rehash(before.documents.filter((entry) => entry.docType !== "SCH_PAGE"));
  assert.equal(prepareDocumentPageCreate(OPERATION, empty, CONTEXT).desiredTitle, "P1");
  assert.equal(prepareDocumentPageCreate(OPERATION, empty, CONTEXT).desiredZIndex, 2);
  for (const operation of [{ ...OPERATION, name: "Caller title" }, { ...OPERATION, source: "caller" },
    { ...OPERATION, schematic: { resultOf: "other" } }, { ...OPERATION, action: "document.pcb.create" }]) { assert.throws(() => prepareDocumentPageCreate(operation, before, CONTEXT)); }
});
void test("preparation requires exact complete checkpoint and ordinary parent, active editor and page metadata", () => {
  const before = history();
  for (const patch of [{ source: "inherited" }, { blockSymbolUuid: "cbb" }, { title: "" }]) {
    assert.throws(() => prepareDocumentPageCreate(OPERATION, mutate(before, "parent", (entry) => { Object.assign(entry.records[0]?.body ?? {}, patch); }), CONTEXT));
  }
  for (const patch of [{ future: true }, { source: "inherited" }, { zIndex: Number.MAX_VALUE }, { title: "P9007199254740991" }]) {
    assert.throws(() => prepareDocumentPageCreate(OPERATION, mutate(before, "page", (entry) => { Object.assign(entry.records[0]?.body ?? {}, patch); }), CONTEXT));
  }
  assert.throws(() => prepareDocumentPageCreate(OPERATION, { ...before, semanticSha256: "b".repeat(64) }, CONTEXT));
  const parent = before.documents[0]; assert.ok(parent);
  assert.throws(() => prepareDocumentPageCreate(OPERATION, rehash([...before.documents, parent]), CONTEXT));
  for (const extra of [document("instance", "INSTANCE", {}), document("cbb", "SYMBOL", { docType: 17 })]) {
    assert.throws(() => prepareDocumentPageCreate(OPERATION, rehash([...before.documents, extra]), CONTEXT));
  }
  for (const context of [{ ...CONTEXT, project: { ...CONTEXT.project, projectUuid: "foreign" } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentUuid: "foreign" } },
    { ...CONTEXT, document: { ...CONTEXT.document, parentProjectUuid: "foreign" } },
    { ...CONTEXT, document: { ...CONTEXT.document, tabId: "different@project" } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentType: 4 } }]) { assert.throws(() => prepareDocumentPageCreate(OPERATION, before, context)); }
  const schematicContext: ExpectedContext = { ...CONTEXT, document: { ...CONTEXT.document, uuid: "page", tabId: "page@project", documentType: 1 } };
  assert.doesNotThrow(() => prepareDocumentPageCreate(OPERATION, before, schematicContext));
  assert.throws(() => prepareDocumentPageCreate(OPERATION, before, { ...schematicContext, schematic: { uuid: "foreign" } }));
});
void test("fixed native creation writes exactly once and returns its original identity without opening or saving", async () => {
  const run = fixture();
  assert.deepEqual(decodeExactReadEnvelope(await run.run()), { kind: "project-page-create", targetId: CREATED, createdId: CREATED });
  assert.equal(run.writes(), 1);
  assert.equal(run.calls[run.calls.indexOf("/PrjDB/sheet/addData") - 1], "document");
  assert.ok(run.calls.every((call) => !/open|save|template|drawing/iu.test(call)));
});
void test("page creation admits only the exact singleton clean hidden project placeholder", async () => {
  const placeholder = { tabId: "0", data: { doctype: 0 }, isAbleDelete: false, isDisplayNone: true, draggable: false, group: "start_blank" };
  const run = fixture({ placeholder }); await run.run(); assert.equal(run.writes(), 1);
  for (const patch of [{ isDisplayNone: false }, { isAbleDelete: true }, { draggable: true }, { group: "other" },
    { data: { doctype: 1 } }, { data: { doctype: 0, pid: "project" } }, { data: { doctype: 0, owner: "owner" } },
    { parentProjectUuid: "project" }, { parentLibraryUuid: "owner" }, { documentType: 1 }, { isUnSaved: undefined }]) {
    const invalid = fixture({ placeholder: { ...placeholder, ...patch } }); await assert.rejects(invalid.run()); assert.equal(invalid.writes(), 0);
  }
  for (const options of [{ duplicatePlaceholder: true }, { placeholderDirty: true }]) {
    const invalid = fixture({ placeholder, ...options }); await assert.rejects(invalid.run()); assert.equal(invalid.writes(), 0);
  }
});
for (const fault of ["readonly", "permission", "owner", "native-branch", "archive", "parent-title", "parent-source", "missing-siblings", "failed-siblings"]) {
  void test(`page create refuses ${fault} before writing`, async () => { const run = fixture({ fault }); await assert.rejects(run.run()); assert.equal(run.writes(), 0); });
}
for (const fault of ["dirty", "host", "branch", "history", "v2", "concurrent", "context", "extra-tab", "ambiguous-dirty", "duplicate-sibling", "sibling-title"]) {
  for (const faultAt of ["project", "document", "/PrjDB/schematic/getData", "/PrjDB/project/getData", "/PrjDB/sheet/getAllKVDatas", "ui/hasDocCreatePermission"]) {
    void test(`page create stops ${fault} after ${faultAt} without dispatch`, async () => {
      const run = fixture({ fault, faultAt }); await assert.rejects(run.run()); assert.equal(run.writes(), 0);
    });
  }
}
void test("page create rechecks synchronous dirty state after its final context await", async () => {
  const run = fixture({ queuedFinalFault: true }); await assert.rejects(run.run()); assert.equal(run.writes(), 0);
});
for (const fault of ["lost-ack", "bad-ack", "existing-id", "extra-effect"]) {
  void test(`page creation ${fault} never repeats the original write or leaks native errors`, async () => {
    const run = fixture({ fault }); await assert.rejects(run.run(), /^Error: Closed empty page creation refused at (?:create|after-read)$/u); assert.equal(run.writes(), 1);
  });
}
void test("a project switch during worker completion cannot redirect the fixed project argument", async () => {
  const run = fixture({ deferredWriterSwitch: true }); await assert.rejects(run.run(), /after-read/u); assert.equal(run.writes(), 1);
});
void test("full effect proof accepts one empty page only with its retained native identity", () => {
  const before = history();
  const after = desired(before), plan = prepareDocumentPageCreate(OPERATION, before, CONTEXT);
  const proof = verifyDocumentPageCreateEffect(plan, before, after, CREATED);
  assert.equal(proof["createdId"], CREATED); assert.equal(proof["emptyPage"], true); assert.equal(proof["editorOpened"], false);
  assert.equal(proof["automaticInverseAvailable"], false); assert.equal(proof["identityEvidence"], "retained-native-return");
  assert.throws(() => verifyDocumentPageCreateEffect(plan, before, after, ""));
  assert.throws(() => verifyDocumentPageCreateEffect(plan, before, after, "f".repeat(16)));
});
void test("effect proof rejects all collateral records, wrong identities and altered immutable plans", () => {
  const before = history();
  const after = desired(before), plan = prepareDocumentPageCreate(OPERATION, before, CONTEXT);
  for (const patch of [{ title: "Changed" }, { schematic: "other" }, { source: "inherited" }, { zIndex: 9 }, { unknown: "kept" }]) {
    const changed = mutate(after, CREATED, (entry) => { Object.assign(entry.records[0]?.body ?? {}, patch); });
    assert.throws(() => verifyDocumentPageCreateEffect(plan, before, changed, CREATED));
  }
  for (const patch of [{ user: { uuid: "invented" } }, { future: "unknown" }, { version: "wrong" }, { editVersion: "older" }, { updateTime: -1 }]) {
    assert.throws(() => verifyDocumentPageCreateEffect(plan, before, mutate(after, CREATED, (entry) => { Object.assign(entry.metadata, patch); }), CREATED));
  }
  const parentChanged = mutate(after, "parent", (entry) => { entry.metadata["version"] = "2"; });
  assert.throws(() => verifyDocumentPageCreateEffect(plan, before, parentChanged, CREATED));
  const extra = document("f".repeat(16), "SCH_PAGE", { title: "Extra", source: "", schematic: "parent", zIndex: 3 });
  assert.throws(() => verifyDocumentPageCreateEffect(plan, before, rehash([...after.documents, extra]), CREATED));
  assert.throws(() => verifyDocumentPageCreateEffect(plan, before, rehash(after.documents.filter((entry) => entry.uuid !== "active")), CREATED));
  assert.throws(() => verifyDocumentPageCreateEffect({ ...plan, desiredTitle: "Forged" }, before, after, CREATED));
  assert.throws(() => verifyDocumentPageCreateEffect(plan, before, { ...after, projectOwnerUuid: "foreign" }, CREATED));
  const newPage = after.documents.find((entry) => entry.uuid === CREATED); assert.ok(newPage);
  const geometry = { ...newPage, records: [...newPage.records, { id: "line", type: "LINE", ticket: 2, client: null, body: { x: 0 } }] };
  assert.throws(() => verifyDocumentPageCreateEffect(plan, before, rehash([...before.documents, geometry]), CREATED));
});
