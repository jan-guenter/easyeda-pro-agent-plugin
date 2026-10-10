import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import type { ExpectedContext } from "../src/engine.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { buildDocumentPageRenameExpression, documentPageRenameInverse, prepareDocumentPageRename, verifyDocumentPageRenameEffect } from "../src/document-page-rename.ts";
import { buildLibraryExecutionExpression, libraryExecutionKind } from "../src/library-runtime.ts";
import { libraryMutationReceipt, verifyRecoveredLibraryMutation } from "../src/library-recovery-state.ts";

type Value = Record<string, unknown>;
const CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "active", documentType: 1,
  tabId: "active@project", parentProjectUuid: "project" }, schematic: { uuid: "parent" } };
const OPERATION = { id: "rename-page", action: "document.page.rename", target: { uuid: "page" }, name: "Renamed page" };
const RETURNED = { kind: "project-page-rename", targetId: "page", createdId: null };
function document(uuid: string, docType: string, body: Value): NativeDocumentSnapshot {
  const value = { uuid, docType, metadata: { uuid, docType, client: "a".repeat(16), updateTime: 1, version: "1", editVersion: "3.2", user: { uuid: "original-author" } },
    records: [{ id: "META", type: "META", ticket: 1, client: null, body }] };
  return { ...value, semanticSha256: "" };
}
function rehash(documents: readonly NativeDocumentSnapshot[]): NativeHistorySnapshot {
  const updated = documents.map((entry) => ({ ...entry, semanticSha256: sha256Json({ uuid: entry.uuid, docType: entry.docType,
    metadata: entry.metadata, records: entry.records.map(({ id, type, body }) => ({ id, type, body })) }) }));
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: "a".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents: updated,
    semanticSha256: sha256Json(updated.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
function history(): NativeHistorySnapshot {
  return rehash([document("parent", "SCH", { title: "Container", source: "", board: "" }),
    document("active", "SCH_PAGE", { title: "Active", source: "", schematic: "parent", zIndex: 1 }),
    document("page", "SCH_PAGE", { title: "Before", source: "", schematic: "parent", zIndex: 2 })]);
}
function mutate(before: NativeHistorySnapshot, uuid: string, update: (value: NativeDocumentSnapshot) => void): NativeHistorySnapshot {
  const documents = structuredClone(before.documents), target = documents.find((entry) => entry.uuid === uuid); assert.ok(target);
  update(target); return rehash(documents);
}
function desired(before: NativeHistorySnapshot): NativeHistorySnapshot {
  return mutate(before, "page", (entry) => { const meta = entry.records[0]; assert.ok(meta); meta.body["title"] = OPERATION.name;
    entry.metadata["updateTime"] = 2; entry.metadata["version"] = "2"; delete entry.metadata["user"]; });
}
function compileFixture(options: { readonly fault?: string; readonly faultAt?: string; readonly acknowledgment?: boolean; readonly pristineTab?: boolean;
  readonly deferredWriterSwitch?: boolean; readonly baselineVersion?: "missing" | "old"; readonly queuedFinalFault?: "target-open" | "dirty" | "host";
  readonly placeholder?: Value; readonly placeholderDirty?: unknown; readonly duplicatePlaceholder?: boolean; readonly startPage?: boolean } = {}): {
  readonly run: () => Promise<unknown>; readonly calls: string[]; readonly writes: () => number; readonly projectTitles: Map<string, string>;
} {
  const before = options.baselineVersion === undefined ? history() : mutate(history(), "page", (entry) => {
    if (options.baselineVersion === "missing") { delete entry.metadata["editVersion"]; } else { entry.metadata["editVersion"] = "2.2"; }
  });
  const calls: string[] = [], plan = prepareDocumentPageRename(OPERATION, before, CONTEXT);
  const projectTitles = new Map([["project", plan.beforeTitle], ["foreign", "Untouched foreign page"]]);
  let current = structuredClone(CONTEXT.document), dirty = false, nativeName = plan.beforeTitle, writes = 0;
  const raw: Value[] = [{ tabId: "active@project", data: { doctype: 1, pid: "project" }, isUnSaved: false }];
  if (options.placeholder !== undefined) { raw.push(options.placeholder); }
  if (options.duplicatePlaceholder === true && options.placeholder !== undefined) { raw.push(structuredClone(options.placeholder)); }
  if (options.startPage === true) { raw.push({ tabId: "tab_page1", data: { doctype: -1 }, isAbleDelete: false }); }
  if (options.pristineTab === true) { const active = raw[0]; assert.ok(active); delete active["isUnSaved"]; }
  const permission = { isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb: (): { disable: boolean } => ({ disable: options.fault === "read-only" }) };
  const host = { isHistoryMode: false, currentProject: { projectId: "project", branchUuid: "branch", isV2Format: false }, messageBus: { rpcCall: (topic: string, args: unknown): Promise<unknown> => {
    calls.push(topic); fault(topic);
    if (topic === "/PrjDB/sheet/updateData") {
      calls.push("rename"); writes += 1; assert.deepEqual(args, [{ uuid: "page", title: plan.desiredTitle }, "project"]);
      if (options.deferredWriterSwitch === true) {
        // Model the reviewed manager binding before its worker awaits: project
        // Selection cannot be redirected by the mutable UI's current project.
        assert.ok(Array.isArray(args)); const selectedProject: unknown = args[1]; assert.ok(typeof selectedProject === "string");
        return Promise.resolve().then(() => {
          host.currentProject.projectId = "foreign"; projectTitles.set(selectedProject, plan.desiredTitle); nativeName = plan.desiredTitle;
          return { message: { success: true, result: { uuid: "page", project_uuid: selectedProject, schematic_uuid: "parent", display_title: nativeName } } };
        });
      }
      nativeName = plan.desiredTitle; fault("rename");
      return Promise.resolve({ message: { success: options.acknowledgment ?? true, result: { uuid: "page", project_uuid: "project", schematic_uuid: "parent", display_title: nativeName } } });
    }
    if (topic === "/PrjDB/sheet/getData") { return Promise.resolve({ message: { uuid: "page", project_uuid: "project", schematic_uuid: options.fault === "parent" ? "other" : "parent", docType: 1,
      display_title: options.fault === "title" ? "wrong" : nativeName, source: "", zIndex: options.fault === "zindex" ? 10 : 2 } }); }
    if (topic === "/PrjDB/schematic/getData") { return Promise.resolve({ message: { uuid: "parent", project_uuid: "project", display_name: "Container", source: "" } }); }
    assert.equal(topic, "/PrjDB/project/getData");
    return Promise.resolve({ message: { uuid: "project", owner: { uuid: options.fault === "owner" ? "other" : "owner" },
      currentBranch: options.fault === "native-branch" ? "other" : "branch", isV2Format: false } });
  } } };
  function fault(point: string): void {
    if (options.faultAt !== point) { return; }
    if (options.fault === "context") { current = { ...current, uuid: "foreign", tabId: "foreign@project" }; }
    if (options.fault === "host") { host.currentProject.projectId = "foreign"; }
    if (options.fault === "branch") { host.currentProject.branchUuid = "foreign"; }
    if (options.fault === "history") { host.isHistoryMode = true; }
    if (options.fault === "legacy") { host.currentProject.isV2Format = true; }
    if (options.fault === "concurrent") { permission.isConcurrentStrictMode = true; }
    if (options.fault === "dirty") { dirty = true; }
    if (options.fault === "unknown-dirty") { const active = raw[0]; assert.ok(active); active["isUnSaved"] = undefined; }
    if (options.fault === "inherited-dirty") { const active = raw[0]; assert.ok(active); delete active["isUnSaved"]; Object.setPrototypeOf(active, { isUnSaved: true }); }
    if (options.fault === "extra-tab") { raw.push({ tabId: "foreign@project", data: { doctype: 3, pid: "project" }, isUnSaved: false }); }
  }
  const eda = {
    dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => { calls.push("project"); return Promise.resolve(CONTEXT.project); } },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => {
      calls.push("document"); fault("document");
      if (options.queuedFinalFault !== undefined && calls.filter((call) => call === "document").length === 5) {
        // Interleave after context's internal clean proof but before the outer
        // Continuation that owns dispatch, not during the awaited native read.
        queueMicrotask(() => { queueMicrotask(() => {
          if (options.queuedFinalFault === "target-open") { raw.push({ tabId: "page@project", data: { doctype: 1, pid: "project" }, isUnSaved: false }); }
          if (options.queuedFinalFault === "dirty") { dirty = true; }
          if (options.queuedFinalFault === "host") { host.currentProject.projectId = "foreign"; }
        }); });
      }
      return Promise.resolve(current);
    } },
    dmt_EditorControl: { getSplitScreenTree: (): Promise<unknown> => { calls.push("tree"); fault("tree");
      const tabs = [{ tabId: "active@project", documentType: 1, parentProjectUuid: "project" }];
      if (options.fault === "target-open") { tabs.push({ tabId: "page@project", documentType: 1, parentProjectUuid: "project" }); }
      if (options.fault === "foreign-tree") { tabs.push({ tabId: "foreign@other", documentType: 1, parentProjectUuid: "other" }); }
      return Promise.resolve({ tabs }); } },
    dmt_Schematic: { modifySchematicPageName: (): never => { throw new Error("The mutable row-index public setter must never be invoked."); } },
  };
  const native = { PRO_EDITOR_VERSION: options.fault === "editor-version" ? "3.3" : "3.2", gVars: host, UI: { concurrentDesign: permission, tabBar: { getFilterTabs: (): Value[] => raw, getActiveTab: (): string => "active@project",
    hasTabUnSaved: (): boolean => dirty, isTabUnSaved: (tabId: string): unknown => tabId === "0" && Object.hasOwn(options, "placeholderDirty") ? options.placeholderDirty : dirty } } };
  return { calls, projectTitles, writes: (): number => writes, run: (): Promise<unknown> => {
    // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Only the fixed compiler program executes against isolated native doubles.
    const execute = new Function("eda", "globalThis", `return ${buildDocumentPageRenameExpression(plan, CONTEXT)};`);
    // oxlint-disable-next-line typescript/no-unsafe-call -- Keep the generated result unknown until its exact envelope is parsed.
    const result: unknown = execute(eda, native); return Promise.resolve(result);
  } };
}

void test("page rename admits the pinned hidden project tab while preserving one clean sibling", async () => {
  const placeholder = { tabId: "0", data: { doctype: 0 }, isAbleDelete: false, isDisplayNone: true, draggable: false, group: "start_blank" };
  const valid = compileFixture({ placeholder, startPage: true });
  await valid.run(); assert.equal(valid.writes(), 1);
  for (const patch of [{ data: { doctype: 0, owner: "foreign" } }, { isDisplayNone: false }, { draggable: true }, { group: "other" }, { isUnSaved: true }]) {
    const fixture = compileFixture({ placeholder: { ...placeholder, ...patch } });
    await assert.rejects(fixture.run(), { message: "Closed page rename refused at host:PROJECT_PLACEHOLDER" });
    assert.equal(fixture.writes(), 0);
  }
  const duplicate = compileFixture({ placeholder, duplicatePlaceholder: true });
  await assert.rejects(duplicate.run(), /:PROJECT_PLACEHOLDER$/u); assert.equal(duplicate.writes(), 0);
  for (const placeholderDirty of [true, null, undefined]) {
    const fixture = compileFixture({ placeholder, placeholderDirty });
    await assert.rejects(fixture.run(), /:PROJECT_PLACEHOLDER$/u); assert.equal(fixture.writes(), 0);
  }
});

void test("closed page rename is registered only through its checkpoint-bound plan", () => {
  assert.equal(libraryExecutionKind(OPERATION), "project-page-rename");
  assert.throws(() => buildLibraryExecutionExpression(OPERATION), /checkpoint-bound/u);
  for (const operation of [{ ...OPERATION, target: { resultOf: "create" } }, { ...OPERATION, name: "  " }, { ...OPERATION, code: "caller" },
    { ...OPERATION, name: "Before" }, { ...OPERATION, name: "Control\ncharacter" }, { ...OPERATION, action: "document.pcb.rename" }, { ...OPERATION, action: "document.schematic.rename" }]) {
    assert.throws(() => prepareDocumentPageRename(operation, history(), CONTEXT));
  }
});
void test("page preparation rejects absent or unknown metadata, incomplete histories and duplicate normalized names", () => {
  const before = history();
  for (const field of ["source", "schematic", "title", "zIndex"]) {
    assert.throws(() => prepareDocumentPageRename(OPERATION, mutate(before, "page", (entry) => { const meta = entry.records[0]; assert.ok(meta); Reflect.deleteProperty(meta.body, field); }), CONTEXT));
  }
  for (const body of [{ future: "not dropped" }, { source: "imported" }, { schematic: "missing" }, { title: "" }]) {
    assert.throws(() => prepareDocumentPageRename(OPERATION, mutate(before, "page", (entry) => { Object.assign(entry.records[0]?.body ?? {}, body); }), CONTEXT));
  }
  const duplicate = mutate(before, "active", (entry) => { const meta = entry.records[0]; assert.ok(meta); meta.body["title"] = "RENAMED PAGE"; });
  assert.throws(() => prepareDocumentPageRename(OPERATION, duplicate, CONTEXT), /normalized title/u);
  assert.throws(() => prepareDocumentPageRename(OPERATION, { ...before, semanticSha256: "b".repeat(64) }, CONTEXT), /checkpoint integrity/u);
  const first = before.documents[0]; assert.ok(first);
  assert.throws(() => prepareDocumentPageRename(OPERATION, rehash([...before.documents, first]), CONTEXT), /document integrity/u);
  assert.throws(() => prepareDocumentPageRename(OPERATION, rehash([...before.documents, document("instance", "INSTANCE", {})]), CONTEXT), /hierarchical/u);
  assert.throws(() => prepareDocumentPageRename(OPERATION, rehash([...before.documents, document("cbb", "SYMBOL", { title: "Block", docType: 17 })]), CONTEXT), /CBB/u);
  assert.throws(() => prepareDocumentPageRename(OPERATION, mutate(before, "page", (entry) => { entry.metadata["unknown"] = true; }), CONTEXT), /DOCHEAD/u);
  for (const docType of [2, 18, 19, 20, 21, 22, 25, 31]) {
    assert.doesNotThrow(() => prepareDocumentPageRename(OPERATION, rehash([...before.documents, document("shape", "SYMBOL", { title: "Shape", docType })]), CONTEXT));
  }
});
void test("page preparation binds an exact different active sibling and rejects owner or alias drift", () => {
  const before = history(), plan = prepareDocumentPageRename(OPERATION, before, CONTEXT);
  for (const context of [{ ...CONTEXT, document: { ...CONTEXT.document, uuid: "missing" } },
    { ...CONTEXT, document: { ...CONTEXT.document, uuid: "page", tabId: "page@project" } },
    { ...CONTEXT, document: { ...CONTEXT.document, parentProjectUuid: "other" } },
    { ...CONTEXT, schematic: { uuid: "other" } }]) { assert.throws(() => prepareDocumentPageRename(OPERATION, before, context)); }
  for (const context of [{ ...CONTEXT, project: { ...CONTEXT.project, projectUuid: "other" } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentUuid: "other" } },
    { ...CONTEXT, document: { ...CONTEXT.document, parentLibraryUuid: "owner" } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentType: 3 } }]) { assert.throws(() => buildDocumentPageRenameExpression(plan, context)); }
});
void test("page setter runs once after the final awaited context and synchronous clean proof, without Save", async () => {
  const fixture = compileFixture(); assert.deepEqual(decodeExactReadEnvelope(await fixture.run()), RETURNED); assert.equal(fixture.writes(), 1);
  assert.equal(fixture.calls[fixture.calls.indexOf("/PrjDB/sheet/updateData") - 1], "document");
  const plan = prepareDocumentPageRename(OPERATION, history(), CONTEXT);
  const code = buildDocumentPageRenameExpression(plan, CONTEXT);
  assert.equal(/\.(?:save|Save|setSourceCode|openDocument)\(|annotat/u.test(code), false);
});
void test("page dispatch checks clean state directly after its asynchronous context helper resolves", async () => {
  for (const queuedFinalFault of ["target-open", "dirty", "host"] as const) {
    const fixture = compileFixture({ queuedFinalFault });
    await assert.rejects(fixture.run(), /closed-target/u); assert.equal(fixture.writes(), 0);
    assert.equal(fixture.calls.filter((call) => call === "document").length, 5);
  }
});
void test("pristine pinned native tabs may omit their own dirty flag only when both dirty queries return false", async () => {
  const fixture = compileFixture({ pristineTab: true }); assert.deepEqual(decodeExactReadEnvelope(await fixture.run()), RETURNED);
  assert.equal(fixture.writes(), 1);
});
void test("legacy or missing DOCHEAD editor versions refuse before native serialization changes them", async () => {
  for (const baselineVersion of ["missing", "old"] as const) {
    const fixture = compileFixture({ baselineVersion }); await assert.rejects(fixture.run(), /refused/u); assert.equal(fixture.writes(), 0);
  }
});
void test("runtime locale normalization cannot admit a collision missed by server normalization", async (context) => {
  // Isolate the runtime's locale-sensitive comparator from the server's plain
  // Lowercase admission; a native locale collision must still refuse.
  context.mock.method(String.prototype, "toLocaleLowerCase", function localeLower(this: string): string { return this === "Active" ? "renamed page" : this.toLowerCase(); });
  const fixture = compileFixture(); await assert.rejects(fixture.run(), /refused/u); assert.equal(fixture.writes(), 0);
});
void test("the delegated worker remains bound to the exact project across its await and never retries on subsequent UI drift", async () => {
  const fixture = compileFixture({ deferredWriterSwitch: true }); await assert.rejects(fixture.run(), /refused/u);
  assert.equal(fixture.projectTitles.get("project"), OPERATION.name); assert.equal(fixture.projectTitles.get("foreign"), "Untouched foreign page");
  assert.equal(fixture.writes(), 1);
});
for (const point of ["/PrjDB/sheet/getData", "/PrjDB/schematic/getData", "/PrjDB/project/getData", "tree", "document"]) {
  for (const fault of ["context", "host", "branch", "history", "legacy", "concurrent", "dirty", "unknown-dirty", "inherited-dirty", "extra-tab"]) {
    void test(`page rename refuses ${fault} after ${point} without writer dispatch`, async () => {
      const fixture = compileFixture({ fault, faultAt: point }); await assert.rejects(fixture.run(), /refused/u); assert.equal(fixture.writes(), 0);
    });
  }
}
for (const fault of ["parent", "owner", "title", "zindex", "target-open", "foreign-tree", "editor-version", "read-only", "native-branch"]) {
  void test(`page rename refuses ${fault} before its setter`, async () => {
    const fixture = compileFixture({ fault }); await assert.rejects(fixture.run(), /refused/u); assert.equal(fixture.writes(), 0);
  });
}
void test("ambiguous page acknowledgments and post-write context drift never repeat the setter", async () => {
  for (const options of [{ acknowledgment: false }, { fault: "context", faultAt: "rename" }, { fault: "dirty", faultAt: "rename" }]) {
    const fixture = compileFixture(options); await assert.rejects(fixture.run(), /refused/u); assert.equal(fixture.writes(), 1);
  }
});
void test("complete page effect permits only requested title and reviewed header, preserving parent and every peer", () => {
  const before = history();
  const after = desired(before), plan = prepareDocumentPageRename(OPERATION, before, CONTEXT);
  const proof = verifyDocumentPageRenameEffect(plan, before, after); assert.equal(proof["effectVerified"], true); assert.equal(proof["reopened"], false);
  assert.equal(proof["currentGenerationLiveValidated"], false); assert.equal(proof["saveInvoked"], false);
  for (const changed of [mutate(after, "active", (entry) => { entry.metadata["extra"] = 1; }),
    mutate(after, "parent", (entry) => { entry.metadata["extra"] = 1; }),
    mutate(after, "page", (entry) => { const meta = entry.records[0]; assert.ok(meta); meta.body["zIndex"] = 4; }),
    mutate(after, "page", (entry) => { entry.metadata["user"] = "foreign"; }),
    mutate(after, "page", (entry) => { entry.metadata["version"] = "999"; }),
    { ...after, branchUuid: "other" }, { ...after, projectOwnerUuid: "other" }]) { assert.throws(() => verifyDocumentPageRenameEffect(plan, before, changed)); }
  assert.throws(() => verifyDocumentPageRenameEffect({ ...plan, parentUuid: "other" }, before, after));
});
void test("page recovery rederives the original plan and exact returned identity without invoking a setter or Save", () => {
  const before = history();
  const after = desired(before), preparedPageRename = prepareDocumentPageRename(OPERATION, before, CONTEXT);
  const receipt = libraryMutationReceipt(OPERATION, RETURNED);
  const input = { operation: OPERATION, before, after, nativeReturn: RETURNED, retainedReceipt: receipt,
    preparedPageRename, expectedContext: CONTEXT };
  assert.equal(verifyRecoveredLibraryMutation(input).proof["effectVerified"], true);
  for (const patch of [{ nativeReturn: { ...RETURNED, targetId: "other" } }, { preparedPageRename: { ...preparedPageRename, beforeTitle: "other" } },
    { retainedReceipt: { ...receipt, nativeReturnSha256: "0".repeat(64) } }, { expectedContext: { ...CONTEXT, document: { ...CONTEXT.document, uuid: "other" } } }]) {
    assert.throws(() => verifyRecoveredLibraryMutation({ ...input, ...patch }));
  }
  const { expectedContext: _context, ...missingContext } = input; assert.throws(() => verifyRecoveredLibraryMutation(missingContext), /Original page rename context/u);
  const inverse = documentPageRenameInverse(preparedPageRename, before, after, "inverse"); assert.equal(inverse.name, "Before");
  assert.throws(() => documentPageRenameInverse(preparedPageRename, before, before, "inverse"));
});
