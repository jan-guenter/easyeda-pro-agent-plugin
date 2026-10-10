import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import type { ExpectedContext } from "../src/engine.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { buildProjectSymbolCreateExpression, prepareProjectSymbolCreate, verifyProjectSymbolCreateEffect } from "../src/project-symbol-create.ts";
import { libraryMutationReceipt, verifyRecoveredLibraryMutation } from "../src/library-recovery-state.ts";
import { buildLibraryExecutionExpression, libraryExecutionKind } from "../src/library-runtime.ts";

type Value = Record<string, unknown>;
const CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" },
  document: { uuid: "active", documentType: 3, tabId: "active@project", parentProjectUuid: "project" } };
const OPERATION = { id: "create-symbol", action: "library.symbol.create", libraryUuid: "project", name: "Empty symbol", symbolType: 2, description: "Fixture" };
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
  return rehash([document("active", "PCB", { title: "PCB", source: "" }),
    document("symbol", "SYMBOL", { title: "Existing", description: "Original", docType: 2, source: "", tags: [] })]);
}
function mutate(before: NativeHistorySnapshot, uuid: string, update: (entry: NativeDocumentSnapshot) => void): NativeHistorySnapshot {
  const documents = structuredClone(before.documents), target = documents.find((entry) => entry.uuid === uuid);
  assert.ok(target); update(target); return rehash(documents);
}
function desired(before: NativeHistorySnapshot): NativeHistorySnapshot {
  return rehash([...before.documents, document(CREATED, "SYMBOL", { title: OPERATION.name, description: OPERATION.description, docType: 2, tags: [], source: "" })]);
}
function nativeSymbol(uuid: string): Value {
  return { uuid, project_uuid: "project", path: "project", owner: { uuid: "owner" }, docType: 2, display_title: uuid === "symbol" ? "Existing" : OPERATION.name,
    description: uuid === "symbol" ? "Original" : OPERATION.description, custom_tags: "[]", source: "" };
}
interface FixtureOptions { readonly fault?: string; readonly faultAt?: string; readonly placeholder?: Value; readonly duplicatePlaceholder?: boolean; readonly placeholderDirty?: boolean }
function fixture(options: FixtureOptions = {}): { run: () => Promise<unknown>; writes: () => number; calls: string[] } {
  const calls: string[] = [], plan = prepareProjectSymbolCreate(OPERATION, history(), CONTEXT), symbols: Value[] = [nativeSymbol("symbol")];
  const tabs: Value[] = [{ tabId: "active@project", data: { doctype: 3, pid: "project" }, isUnSaved: false }];
  if (options.placeholder !== undefined) { tabs.push(options.placeholder); }
  if (options.duplicatePlaceholder === true && options.placeholder !== undefined) { tabs.push(options.placeholder); }
  let active = structuredClone(CONTEXT.document), dirty = false, extensionCollision = options.fault === "extension-collision", writes = 0;
  const manager = { hasLib: (): boolean => extensionCollision };
  const permission = { isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb: (): { disable: boolean } => ({ disable: options.fault === "readonly" }) };
  const host = { extendLibStore: { manager }, isHistoryMode: false, currentProject: { projectId: "project", branchUuid: "branch", isV2Format: false }, messageBus: { rpcCall: (topic: string, args: unknown): Promise<unknown> => {
    calls.push(topic); fault(topic);
    if (topic === "canAddLib") { assert.deepEqual(args, ["project"]); return Promise.resolve({ message: { hasPermission: options.fault !== "permission" } }); }
    if (topic === "/PrjDB/project/getData") { return Promise.resolve({ message: { uuid: "project", owner: { uuid: options.fault === "owner" ? "foreign" : "owner" },
      currentBranch: options.fault === "native-branch" ? "foreign" : "branch", isV2Format: false, archive: options.fault === "archive" } }); }
    if (topic === "/PrjDB/symbol/getStr") { assert.deepEqual(args, ["", "project"]); return Promise.resolve({ message: options.fault === "nonempty-source" ? "unexpected" : undefined }); }
    if (topic === "/PrjDB/symbol/getAllKVDatas") {
      assert.deepEqual(args, ["project"]);
      if (options.fault === "failed-symbols") { return Promise.reject(new Error("private worker failure")); }
      const entries = symbols.map((symbol, index): readonly [string, Value] => {
        const uuid = symbol["uuid"]; assert.ok(typeof uuid === "string");
        return [index > 0 && options.fault === "duplicate-symbol" ? `duplicate${String(index)}` : uuid, structuredClone(symbol)];
      });
      return Promise.resolve({ message: options.fault === "missing-symbols" ? {} : Object.fromEntries<Value>(entries) });
    }
    assert.equal(topic, "/PrjDB/symbol/createData");
    assert.deepEqual(args, [{ uuid: "", isProject: true, path: "project", docType: 2, title: OPERATION.name, display_title: OPERATION.name,
      description: OPERATION.description, custom_tags: "[]", source: "" }, "project"]);
    writes += 1;
    const created = nativeSymbol(options.fault === "existing-id" ? "symbol" : CREATED); symbols.push(created);
    if (options.fault === "lost-ack") { return Promise.reject(new Error("private native error")); }
    if (options.fault === "extra-effect") { symbols.push(nativeSymbol("f".repeat(16))); }
    if (options.fault === "post-dispatch-host") { host.currentProject.projectId = "foreign"; }
    if (options.fault === "bad-ack") { return Promise.resolve({ message: null }); }
    return Promise.resolve({ message: { success: options.fault !== "false-success", result: created } });
  } } };
  const native = { extendLibManager: manager, PRO_EDITOR_VERSION: "3.2", gVars: host, UI: { concurrentDesign: permission,
    tabBar: { getFilterTabs: (): Value[] => tabs, getActiveTab: (): string => "active@project", hasTabUnSaved: (): boolean => dirty,
      isTabUnSaved: (tabId: string): boolean => dirty || (tabId === "0" && options.placeholderDirty === true) } } };
  function fault(point: string): void {
    if (options.faultAt !== point) { return; }
    if (options.fault === "dirty") { dirty = true; }
    if (options.fault === "host") { host.currentProject.projectId = "foreign"; }
    if (options.fault === "branch") { host.currentProject.branchUuid = "foreign"; }
    if (options.fault === "history") { host.isHistoryMode = true; }
    if (options.fault === "v2") { host.currentProject.isV2Format = true; }
    if (options.fault === "concurrent") { permission.isConcurrentStrictMode = true; }
    if (options.fault === "context") { active = { ...active, uuid: "foreign" }; }
    if (options.fault === "extension-late") { extensionCollision = true; }
    if (options.fault === "extra-tab") { tabs.push({ tabId: "other@project", data: { doctype: 3, pid: "project" }, isUnSaved: false }); }
    if (options.fault === "ambiguous-dirty") { const tab = tabs[0]; assert.ok(tab); tab["isUnSaved"] = undefined; }
    if (options.fault === "duplicate-symbol") { const symbol = symbols[0]; assert.ok(symbol); symbols.push({ ...symbol }); }
    if (options.fault === "symbol-title") { const symbol = symbols[0]; assert.ok(symbol); symbol["display_title"] = "Changed"; }
    if (options.fault === "bus-replaced") { Object.assign(host, { messageBus: {} }); }
    if (options.fault === "tabs-replaced") { Object.assign(native.UI, { tabBar: {} }); }
    if (options.fault === "permission-replaced") { Object.assign(native.UI, { concurrentDesign: {} }); }
    if (options.fault === "outer-host-ambiguous") { Object.assign(native, { top: { gVars: {} } }); }
    if (options.fault === "outer-ui-ambiguous") { Object.assign(native, { top: { UI: {} } }); }
    if (options.fault === "editor-top-replaced") { Object.assign(native, { EDITOR_TOP: {} }); }
    if (options.fault === "extension-manager-replaced") { Object.assign(native, { extendLibManager: {} }); }
  }
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => { calls.push("project"); fault("project"); return Promise.resolve(CONTEXT.project); } },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => { calls.push("document"); fault("document"); return Promise.resolve(active); } },
    lib_Symbol: { create: (): never => { throw new Error("Public source routing must not run."); } } };
  return { writes: (): number => writes, calls, run: (): Promise<unknown> => {
    // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Execute only the fixed reviewed compiler against synthetic native doubles.
    const execute = new Function("eda", "globalThis", `return ${buildProjectSymbolCreateExpression(plan, CONTEXT)};`);
    // oxlint-disable-next-line typescript/no-unsafe-call -- Preserve unknown until the exact result envelope is parsed.
    const result: unknown = execute(eda, native); return Promise.resolve(result);
  } };
}

void test("symbol creation uses the typed ordinary closed-empty subset and refuses generic public dispatch", () => {
  const before = history(), plan = prepareProjectSymbolCreate(OPERATION, before, CONTEXT);
  assert.equal(plan.name, OPERATION.name); assert.equal(plan.description, OPERATION.description);
  assert.equal(libraryExecutionKind(OPERATION), "project-symbol-create");
  assert.throws(() => buildLibraryExecutionExpression(OPERATION), /checkpoint-bound/u);
  const { description: _description, ...withoutDescription } = OPERATION;
  assert.equal(prepareProjectSymbolCreate(withoutDescription, before, CONTEXT).description, "");
  for (const operation of [{ ...OPERATION, name: " Existing " }, { ...OPERATION, name: "existing" }, { ...OPERATION, name: "" },
    { ...OPERATION, name: "bad\nname" }, { ...OPERATION, libraryUuid: "foreign" }, { ...OPERATION, symbolType: 17 },
    { ...OPERATION, symbolType: 18 }, { ...OPERATION, classification: ["class"] }, { ...OPERATION, source: "caller" },
    { ...OPERATION, uuid: "caller" }, { ...OPERATION, action: "document.pcb.create" }]) { assert.throws(() => prepareProjectSymbolCreate(operation, before, CONTEXT)); }
});
void test("symbol preparation binds complete history, ordinary PCB and exact owner context", () => {
  const before = history();
  assert.throws(() => prepareProjectSymbolCreate(OPERATION, { ...before, semanticSha256: "b".repeat(64) }, CONTEXT));
  assert.throws(() => prepareProjectSymbolCreate(OPERATION, { ...before, projectOwnerUuid: "" }, CONTEXT));
  for (const extra of [document("", "SYMBOL", {}), document("instance", "INSTANCE", {}), document("cbb", "SYMBOL", { docType: 17 })]) {
    assert.throws(() => prepareProjectSymbolCreate(OPERATION, rehash([...before.documents, extra]), CONTEXT));
  }
  const active = before.documents[0]; assert.ok(active);
  assert.throws(() => prepareProjectSymbolCreate(OPERATION, rehash([...before.documents, active]), CONTEXT));
  assert.throws(() => prepareProjectSymbolCreate(OPERATION, mutate(before, "active", (entry) => { Object.assign(entry.records[0]?.body ?? {}, { source: "inherited" }); }), CONTEXT));
  for (const context of [{ ...CONTEXT, project: { ...CONTEXT.project, projectUuid: "foreign" } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentUuid: "foreign" } }, { ...CONTEXT, document: { ...CONTEXT.document, parentProjectUuid: "foreign" } },
    { ...CONTEXT, document: { ...CONTEXT.document, tabId: "different@project" } }, { ...CONTEXT, document: { ...CONTEXT.document, documentType: 4 } }]) {
    assert.throws(() => prepareProjectSymbolCreate(OPERATION, before, context));
  }
});
void test("native symbol creation explicitly uses empty local source and one nested-success worker call", async () => {
  const run = fixture(); assert.deepEqual(decodeExactReadEnvelope(await run.run()), { kind: "project-symbol-create", targetId: CREATED, createdId: CREATED });
  assert.equal(run.writes(), 1); assert.equal(run.calls[run.calls.indexOf("/PrjDB/symbol/createData") - 1], "document");
  assert.ok(run.calls.every((call) => !/open|save|template|drawing|libWorker/iu.test(call)));
});
void test("symbol creation accepts only one clean canonical hidden placeholder", async () => {
  const placeholder = { tabId: "0", data: { doctype: 0 }, isAbleDelete: false, isDisplayNone: true, draggable: false, group: "start_blank" };
  const run = fixture({ placeholder }); await run.run(); assert.equal(run.writes(), 1);
  for (const patch of [{ isDisplayNone: false }, { isAbleDelete: true }, { draggable: true }, { group: "other" },
    { data: { doctype: 0, pid: "project" } }, { parentProjectUuid: "project" }, { isUnSaved: undefined }]) {
    const invalid = fixture({ placeholder: { ...placeholder, ...patch } }); await assert.rejects(invalid.run()); assert.equal(invalid.writes(), 0);
  }
  for (const options of [{ duplicatePlaceholder: true }, { placeholderDirty: true }]) {
    const invalid = fixture({ placeholder, ...options }); await assert.rejects(invalid.run()); assert.equal(invalid.writes(), 0);
  }
});
for (const fault of ["readonly", "permission", "owner", "native-branch", "archive", "nonempty-source", "extension-collision", "missing-symbols", "failed-symbols"]) {
  void test(`symbol create refuses ${fault} before writing`, async () => { const run = fixture({ fault }); await assert.rejects(run.run()); assert.equal(run.writes(), 0); });
}
for (const fault of ["dirty", "host", "branch", "history", "v2", "concurrent", "context", "extension-late", "extra-tab", "ambiguous-dirty", "duplicate-symbol", "symbol-title",
  "bus-replaced", "tabs-replaced", "permission-replaced", "outer-host-ambiguous", "outer-ui-ambiguous", "editor-top-replaced", "extension-manager-replaced"]) {
  for (const faultAt of ["project", "document", "/PrjDB/project/getData", "/PrjDB/symbol/getAllKVDatas", "/PrjDB/symbol/getStr", "canAddLib"]) {
    void test(`symbol create stops ${fault} after ${faultAt} before dispatch`, async () => {
      const run = fixture({ fault, faultAt }); await assert.rejects(run.run()); assert.equal(run.writes(), 0);
    });
  }
}
for (const fault of ["lost-ack", "bad-ack", "false-success", "existing-id"]) {
  void test(`symbol creation ${fault} never repeats or leaks native error text`, async () => {
    const run = fixture({ fault }); await assert.rejects(run.run(), /^Error: Closed empty symbol creation refused at create$/u); assert.equal(run.writes(), 1);
  });
}
for (const fault of ["extra-effect", "post-dispatch-host"]) {
  void test(`symbol creation retains original ID before facade post-write ${fault} proof`, async () => {
    const run = fixture({ fault }); assert.deepEqual(decodeExactReadEnvelope(await run.run()), { kind: "project-symbol-create", targetId: CREATED, createdId: CREATED });
    assert.equal(run.writes(), 1); assert.equal(run.calls.at(-1), "/PrjDB/symbol/createData");
  });
}
void test("symbol addition requires original identity, exact META and unchanged complete peers", () => {
  const before = history();
  const after = desired(before), plan = prepareProjectSymbolCreate(OPERATION, before, CONTEXT);
  assert.equal(verifyProjectSymbolCreateEffect(plan, before, after, CREATED)["emptySymbol"], true);
  for (const id of [undefined, "", "f".repeat(16)]) { assert.throws(() => verifyProjectSymbolCreateEffect(plan, before, after, id)); }
  for (const patch of [{ title: "Changed" }, { source: "inherited" }, { docType: 18 }, { tags: ["class"] }, { unknown: "extra" }]) {
    assert.throws(() => verifyProjectSymbolCreateEffect(plan, before, mutate(after, CREATED, (entry) => { Object.assign(entry.records[0]?.body ?? {}, patch); }), CREATED));
  }
  for (const patch of [{ user: { uuid: "invented" } }, { future: "unknown" }, { version: "wrong" }, { editVersion: "older" }, { updateTime: -1 }]) {
    assert.throws(() => verifyProjectSymbolCreateEffect(plan, before, mutate(after, CREATED, (entry) => { Object.assign(entry.metadata, patch); }), CREATED));
  }
  const initialized = rehash(after.documents.map((entry) => entry.uuid === CREATED ? { ...entry, records: [...entry.records,
    { id: "part", type: "PART", ticket: 2, client: null, body: { name: "A" } }] } : entry));
  assert.throws(() => verifyProjectSymbolCreateEffect(plan, before, initialized, CREATED));
  assert.throws(() => verifyProjectSymbolCreateEffect(plan, before, mutate(after, "active", (entry) => { entry.metadata["version"] = "2"; }), CREATED));
  const extra = document("f".repeat(16), "SYMBOL", { title: "Extra", docType: 2, source: "", tags: [], description: "" });
  assert.throws(() => verifyProjectSymbolCreateEffect(plan, before, rehash([...after.documents, extra]), CREATED));
  assert.throws(() => verifyProjectSymbolCreateEffect(plan, before, rehash(after.documents.filter((entry) => entry.uuid !== "active")), CREATED));
  assert.throws(() => verifyProjectSymbolCreateEffect({ ...plan, name: "Forged" }, before, after, CREATED));
  assert.throws(() => verifyProjectSymbolCreateEffect(plan, before, { ...after, projectOwnerUuid: "foreign" }, CREATED));
});
void test("changed-result recovery requires exact original prepared plan and native-return identity", () => {
  const before = history();
  const after = desired(before), preparedSymbolCreate = prepareProjectSymbolCreate(OPERATION, before, CONTEXT);
  const nativeReturn = { kind: "project-symbol-create", targetId: CREATED, createdId: CREATED };
  const retainedReceipt = libraryMutationReceipt(OPERATION, nativeReturn);
  const input = { operation: OPERATION, before, after, nativeReturn, retainedReceipt, preparedSymbolCreate, expectedContext: CONTEXT };
  assert.equal(verifyRecoveredLibraryMutation(input).proof["createdId"], CREATED);
  for (const patch of [{ preparedSymbolCreate: undefined }, { preparedSymbolCreate: { ...preparedSymbolCreate, name: "Changed" } },
    { nativeReturn: { ...nativeReturn, createdId: "f".repeat(16) } }, { nativeReturn: { ...nativeReturn, targetId: "f".repeat(16) } },
    { nativeReturn: { kind: nativeReturn.kind } }]) { assert.throws(() => verifyRecoveredLibraryMutation({ ...input, ...patch })); }
});
void test("symbol final header binds its own distinct server-time version without inferring upload chronology", () => {
  const before = history(), plan = prepareProjectSymbolCreate(OPERATION, before, CONTEXT);
  const after = mutate(desired(before), CREATED, (entry) => { Object.assign(entry.metadata, { updateTime: 2, version: "2" }); });
  assert.equal(verifyProjectSymbolCreateEffect(plan, before, after, CREATED)["effectVerified"], true);
  const initialVersion = mutate(after, CREATED, (entry) => { entry.metadata["version"] = "1"; });
  assert.throws(() => verifyProjectSymbolCreateEffect(plan, before, initialVersion, CREATED), /header/u);
});
