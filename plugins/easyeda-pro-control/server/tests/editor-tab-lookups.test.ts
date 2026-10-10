/* oxlint-disable import/max-dependencies -- Exercise the real catalog, engine dispatch, checkpoint and generated reader together. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { isRecord, sha256Json } from "../src/core.ts";
import type { CheckpointReceipt, CheckpointVerification } from "../src/checkpoint.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { ContextProbePayload, InstalledEasyedaBundles } from "../src/engine.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { buildEditorTabLookupCode, editorTabLookupRequestSchema, prepareEditorTabLookupScope, readEditorTabLookup, validateEditorTabLookupResult } from "../src/editor-tab-lookups.ts";
import { buildPublicSdkReadCode, publicSdkReadDescriptors, publicSdkReadRequestSchema, validatePublicSdkReadPayload } from "../src/public-sdk-read.ts";
import { queryPublicSdkReads, validatePublicSdkArguments } from "../src/public-sdk-catalog.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { SCHEMATIC_NATIVE_IMPLEMENTATION } from "../src/native-profiles.ts";

const TAB = { method: "eda.dmt_EditorControl.getSplitScreenIdByTabId", arguments: { tabId: "symbol@project" } };
const SPLIT = { method: "eda.dmt_EditorControl.getTabsBySplitScreenId", arguments: { splitScreenId: "right" } };
const context: ContextProbePayload = { project: { uuid: "project", path: "/tmp/disposable-editor.eprj2" },
  document: { uuid: "board", documentType: 3, tabId: "board@project", parentProjectUuid: "project" } };
const hash = "a".repeat(64), identity = { birthtimeNs: "1", ctimeNs: "1", dev: "1", ino: "1" };
const receipt: CheckpointReceipt = { schema: "easyeda-pro-control.checkpoint.v2", createdAt: "fixture", source: context.project.path,
  checkpoint: "/tmp/disposable-editor-checkpoint.eprj2", checkpointSha256: hash, sourceSha256: hash,
  sourceDumpSha256: hash, checkpointDumpSha256: hash, receiptSha256: hash, receiptPath: "/tmp/disposable-editor.receipt.json",
  sourceIdentity: identity, checkpointIdentity: identity };
const verified: CheckpointVerification = { ...receipt, ok: true, sourceChanged: false, sourceEqualsCheckpoint: true, sourceMatchesReceipt: true, checkpointMatchesReceipt: true };
const bundles: InstalledEasyedaBundles = { available: true, assetsRoot: "/fixture",
  pcbEditor: { version: "fixture", implementationPath: "/fixture/pcb", implementationSha256: hash },
  publicApi: { version: "fixture", implementationPath: "/fixture/api", implementationSha256: hash,
    adapterPath: "/fixture/adapter", adapterSha256: hash, declarationsPath: "/fixture/declarations", declarationsSha256: hash } };
function history(): NativeHistorySnapshot {
  const documents = ["board", "symbol", "footprint", "flag"].map((uuid) => {
    let docType = "SYMBOL";
    if (uuid === "board") { docType = "PCB"; }
    if (uuid === "footprint") { docType = "FOOTPRINT"; }
    return { uuid, docType, metadata: { uuid }, semanticSha256: hash,
      records: [{ id: "META", type: "META", ticket: 1, client: null, body: { title: uuid, docType: uuid === "flag" ? 18 : 2 } }] };
  });
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch",
    headHistoryUuid: "head", checkpointSha256: hash, historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents, semanticSha256: sha256Json(documents) };
}
function rawTree(): Record<string, unknown> {
  return { id: "root", direction: "horizontal", children: [
    { id: "left", tabs: [{ tabId: "tab_page1", data: { doctype: -1 }, isAbleDelete: false },
      { tabId: "board@project", data: { doctype: 3, pid: "project" } }] },
    { id: "right", tabs: [{ tabId: "symbol@project", data: { doctype: 2, owner: "owner" }, title: "private symbol title" },
      { tabId: "footprint@project", data: { doctype: 4, owner: "owner" } }] },
  ] };
}
function leaf(tree: unknown, id: string): Record<string, unknown> {
  assert.ok(isRecord(tree)); const children = tree["children"]; assert.ok(Array.isArray(children));
  const node: unknown = children.find((value: unknown) => isRecord(value) && value["id"] === id); assert.ok(isRecord(node)); return node;
}
function rawTabs(tree: unknown, id: string): unknown[] { const tabs = leaf(tree, id)["tabs"]; assert.ok(Array.isArray(tabs)); return tabs; }
async function execute(code: string, eda: unknown, native: unknown): Promise<unknown> {
  // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Compile only the maintained fixed program against isolated test API doubles.
  const run = new Function("eda", "globalThis", `return(async()=>{${code}})();`);
  const result: unknown = Reflect.apply(run, undefined, [eda, native]); return await result;
}
interface Options {
  tree?: unknown; afterTree?: unknown; direct?: unknown; request?: unknown; faultContextAt?: number;
  runtimeThrow?: boolean; getter?: boolean; varyingTree?: boolean; history?: NativeHistorySnapshot;
  quarantineAt?: number; profileFailAt?: number; contextFailAt?: number; checkpointFailAt?: number;
  checkpointPatch?: Record<string, unknown>; checkpointPatchAt?: number; malformedReply?: unknown; unsettled?: boolean;
  branchFaultAt?: number; historyMode?: boolean; hostReplacementAt?: number;
}
function fixture(options: Options = {}): {
  run: () => Promise<Record<string, unknown>>; code: string; eda: Record<string, unknown>; events: string[];
  directCalls: () => number; getterCalls: () => number; first: () => Promise<unknown>;
} {
  let contexts = 0, directCalls = 0, gates = 0, getterCalls = 0, hostContexts = 0, profiles = 0, snapshots = 0, verifications = 0;
  const events: string[] = [], tree = Object.hasOwn(options, "tree") ? options.tree : rawTree();
  const request = options.request ?? TAB, scope = prepareEditorTabLookupScope(options.history ?? history(), context);
  const code = buildEditorTabLookupCode(request, scope);
  const native = { gVars: { currentProject: { projectId: "project", branchUuid: "branch" }, isHistoryMode: options.historyMode ?? false } };
  if (options.getter === true) {
    const tab = rawTabs(tree, "right")[0]; assert.ok(isRecord(tab));
    Object.defineProperty(tab, "title", { get(): never { getterCalls += 1; throw new Error("private title getter"); } });
  }
  const editor = {
    getSplitScreenTree: (): Promise<unknown> => {
      snapshots += 1;
      if (options.varyingTree === true && snapshots > 2) { const changed = rawTree(); leaf(changed, "right")["direction"] = "vertical"; return Promise.resolve(changed); }
      return Promise.resolve(directCalls > 0 && Object.hasOwn(options, "afterTree") ? options.afterTree : tree);
    },
    getSplitScreenIdByTabId(this: unknown, tabId: string): Promise<unknown> {
      assert.equal(this, editor); assert.equal(tabId, "symbol@project"); directCalls += 1; events.push("lookup");
      if (options.runtimeThrow === true) { return Promise.reject(new Error("private upstream error")); }
      return Promise.resolve(Object.hasOwn(options, "direct") ? options.direct : "right");
    },
    getTabsBySplitScreenId(this: unknown, splitId: string): Promise<unknown> {
      assert.equal(this, editor); assert.equal(splitId, "right"); directCalls += 1; events.push("lookup");
      return Promise.resolve(Object.hasOwn(options, "direct") ? options.direct : rawTabs(tree, "right"));
    },
  };
  const eda = { dmt_EditorControl: editor, dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(context.project) },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => { contexts += 1;
      if (contexts === options.branchFaultAt) { native.gVars.currentProject.branchUuid = "foreign"; }
      if (contexts === options.hostReplacementAt) { native.gVars = structuredClone(native.gVars); }
      return Promise.resolve(contexts === options.faultContextAt ? { ...context.document, uuid: "foreign" } : context.document); } } };
  const engine = new EasyedaControlEngine({ installedEasyedaBundles: (): Promise<InstalledEasyedaBundles> => Promise.resolve(bundles),
    callTool: async (name, args): Promise<unknown> => {
      assert.equal(name, "easyeda_execute"); assert.equal(args?.["confirmWrite"], true); assert.equal(typeof args?.["code"], "string"); events.push("dispatch");
      if (options.unsettled === true) { return { structuredContent: { ok: false, error: "execution-unsettled" } }; }
      if (Object.hasOwn(options, "malformedReply")) { return { structuredContent: { ok: true, result: options.malformedReply } }; }
      return { structuredContent: { ok: true, result: await execute(String(args?.["code"]), eda, native) } };
    } });
  engine.assertBridgeDispatchAllowed = (): Promise<true> => { gates += 1; events.push("gate");
    return gates === options.quarantineAt ? Promise.reject(new Error("fixture quarantine")) : Promise.resolve(true); };
  engine.assertContext = (): Promise<ContextProbePayload> => { hostContexts += 1; events.push("context");
    return hostContexts === options.contextFailAt ? Promise.reject(new Error("fixture context")) : Promise.resolve(structuredClone(context)); };
  engine.checkpoint = (args): Promise<CheckpointReceipt | CheckpointVerification> => {
    if (args.receiptPath === undefined) { events.push("checkpoint-create"); return Promise.resolve(structuredClone(receipt)); }
    verifications += 1; events.push("checkpoint-verify"); return Promise.resolve({ ...verified,
      ok: verifications !== options.checkpointFailAt, sourceChanged: verifications === options.checkpointFailAt,
      ...(verifications === (options.checkpointPatchAt ?? 1) ? options.checkpointPatch : {}) });
  };
  return { eda, code, events, directCalls: (): number => directCalls, getterCalls: (): number => getterCalls,
    first: (): Promise<unknown> => execute(code, eda, native),
    run: (): Promise<Record<string, unknown>> => readEditorTabLookup(engine, request, context, {
      readNativeHistoryCheckpoint: (): Promise<NativeHistorySnapshot> => Promise.resolve(options.history ?? history()),
      verifyDeviceAssociationNativeProfile: (): Promise<void> => Promise.resolve(),
      verifySchematicNativeProfile: (): Promise<typeof SCHEMATIC_NATIVE_IMPLEMENTATION> => { profiles += 1;
        return profiles === options.profileFailAt ? Promise.reject(new Error("fixture profile")) : Promise.resolve(SCHEMATIC_NATIVE_IMPLEMENTATION); },
    }),
  };
}

void test("owned lookups call the exact public receiver twice and return only checkpoint-owned identities", async () => {
  for (const request of [TAB, SPLIT]) {
    const current = fixture({ request, getter: true }); const result = await current.run();
    assert.equal(result["method"], request.method); assert.equal(result["currentGenerationLiveValidated"], false);
    assert.equal(current.directCalls(), 2); assert.equal(current.getterCalls(), 0);
    assert.equal(current.events.filter((event) => event === "checkpoint-verify").length, 6);
    assert.equal(JSON.stringify(result).includes("private"), false);
    assert.equal(/\.(?:openDocument|activateDocument|closeDocument|save|setItem)\(/u.test(current.code), false);
  }
});

void test("owned lookup catalog is narrow, discoverable and cannot use generic compiler or caller scope", () => {
  for (const request of [TAB, SPLIT]) {
    assert.deepEqual(publicSdkReadRequestSchema.parse(request), request);
    assert.equal(validatePublicSdkArguments({ request })["valid"], true);
    assert.equal(queryPublicSdkReads({ method: request.method })["matched"], 1);
    const descriptor = publicSdkReadDescriptors().find((entry) => entry.path === request.method); assert.ok(descriptor);
    assert.equal(descriptor.implementation.source, "server/src/editor-tab-lookups.ts"); assert.equal(descriptor.parameterSupport, "narrowed");
    assert.throws(() => buildPublicSdkReadCode(request), /checkpoint-bound/u);
    assert.throws(() => validatePublicSdkReadPayload({}, request), /checkpoint-bound/u);
    for (const patch of [{ scope: {} }, { code: "caller()" }, { receiptPath: "/tmp/foreign" }, { arguments: { ...request.arguments, projectUuid: "foreign" } }]) {
      assert.equal(publicSdkReadRequestSchema.safeParse({ ...request, ...patch }).success, false);
    }
  }
  for (const request of [{ ...TAB, arguments: { tabId: "" } }, { ...TAB, arguments: { tabId: "x\0" } },
    { ...SPLIT, arguments: { splitScreenId: "x".repeat(513) } }, { ...SPLIT, arguments: { splitScreenId: 1 } }]) {
    assert.equal(editorTabLookupRequestSchema.safeParse(request).success, false);
  }
});

void test("membership refuses conflicting context, unknown symbol families and duplicate saved identities", () => {
  const scope = prepareEditorTabLookupScope(history(), context); assert.equal(scope.members.some((entry) => entry.uuid === "flag"), false);
  for (const document of [{ ...context.document, parentProjectUuid: "foreign" }, { ...context.document, parentLibraryUuid: "owner" },
    { ...context.document, documentUuid: "foreign" }, { uuid: "flag", documentType: 2, tabId: "flag@project", parentLibraryUuid: "owner" }]) {
    assert.throws(() => prepareEditorTabLookupScope(history(), { ...context, document }));
  }
  const duplicate = history(); const first = duplicate.documents[0]; assert.ok(first);
  assert.throws(() => prepareEditorTabLookupScope({ ...duplicate, documents: [...duplicate.documents, first] }, context));
});

void test("raw tree validation accepts cross-realm own data while refusing structural getters before lookup", async () => {
  const tree: unknown = runInNewContext(`(${JSON.stringify(rawTree())})`);
  const crossRealm = fixture({ tree }); await crossRealm.run(); assert.equal(crossRealm.directCalls(), 2);
  let getters = 0;
  const malformed = rawTree(); Object.defineProperty(malformed, "children", { get(): never { getters += 1; throw new Error("private"); } });
  const refused = fixture({ tree: malformed }); await assert.rejects(refused.run(), /before-tree/u);
  assert.equal(getters, 0); assert.equal(refused.directCalls(), 0);
});

void test("tree validation refuses malformed, sparse, duplicate, cyclic, foreign and unowned inventories", async () => {
  const sparse: unknown[] = []; sparse.length = 2;
  const invalid: unknown[] = [null, [], {}, { id: "root", tabs: [] }, { id: "root", tabs: sparse },
    { id: "root", direction: "horizontal", children: [] }, { id: "root", direction: "horizontal", children: Array.from({ length: 129 }, () => ({})) }];
  const cyclic: Record<string, unknown> = { id: "root", direction: "horizontal" }; cyclic["children"] = [cyclic]; invalid.push(cyclic);
  for (const fault of ["node-duplicate", "tab-duplicate", "uuid-alias", "foreign", "unknown", "symbol-type", "owner", "pid-null", "active-missing", "tabs-and-children", "get-index", "deep"]) {
    const tree = rawTree(); const right = leaf(tree, "right"), tabs = rawTabs(tree, "right");
    const tab = tabs[0]; assert.ok(isRecord(tab));
    if (fault === "node-duplicate") { right["id"] = "left"; }
    if (fault === "tab-duplicate") { tabs.push(tabs[0]); }
    if (fault === "uuid-alias") { rawTabs(tree, "left").push({ tabId: "board", data: { doctype: 3, pid: "project" } }); }
    if (fault === "foreign") { tab["parentProjectUuid"] = "foreign"; }
    if (fault === "unknown") { tab["tabId"] = "missing@project"; }
    if (fault === "symbol-type") { tab["tabId"] = "flag@project"; tab["data"] = { doctype: 2, owner: "owner" }; }
    if (fault === "owner") { tab["data"] = { doctype: 2, owner: "foreign" }; }
    if (fault === "pid-null") { tab["data"] = { doctype: 2, owner: "owner", pid: null }; }
    if (fault === "active-missing") { rawTabs(tree, "left").pop(); }
    if (fault === "tabs-and-children") { right["children"] = [{}]; }
    if (fault === "get-index") { Object.defineProperty(tabs, "0", { get(): never { throw new Error("Must not run."); } }); }
    if (fault === "deep") { let branch: unknown = tree; for (let index = 0; index < 17; index += 1) { branch = { id: `depth-${String(index)}`, direction: "horizontal", children: [branch] }; } invalid.push(branch); }
    else { invalid.push(tree); }
  }
  for (const tree of invalid) { const current = fixture({ tree }); await assert.rejects(current.run()); assert.equal(current.directCalls(), 0); }
});

void test("missing tabs, missing containers and parent containers never invoke the direct lookup", async () => {
  for (const request of [{ ...TAB, arguments: { tabId: "tab_page1" } }, { ...TAB, arguments: { tabId: "symbol@foreign" } },
    { ...SPLIT, arguments: { splitScreenId: "missing" } }, { ...SPLIT, arguments: { splitScreenId: "root" } }]) {
    const current = fixture({ request }); await assert.rejects(current.run(), /before-tree/u); assert.equal(current.directCalls(), 0);
  }
});

void test("direct lookup result must match the complete tree, including ordering, ownership and every tab", async () => {
  for (const direct of [undefined, "", "left", 1, {}, "right\0"]) {
    const current = fixture({ direct }); await assert.rejects(current.run(), /lookup/u); assert.equal(current.directCalls(), 1);
  }
  const tabs = rawTabs(rawTree(), "right"), wrongOwner = [{ tabId: "symbol@project", data: { doctype: 2, owner: "foreign" } }, tabs[1]];
  for (const direct of [undefined, [], tabs.slice(0, 1), tabs.toReversed(), [...tabs, tabs[0]], wrongOwner]) {
    const current = fixture({ request: SPLIT, direct }); await assert.rejects(current.run(), /lookup/u); assert.equal(current.directCalls(), 1);
  }
});

void test("context and tree drift stop after the original lookup without retry or optimistic error coercion", async () => {
  const changed = rawTree(); leaf(changed, "right")["direction"] = "vertical";
  for (const options of [{ afterTree: changed }, { faultContextAt: 3 }, { runtimeThrow: true }, { checkpointFailAt: 3 },
    { malformedReply: {} }, { unsettled: true }]) {
    const current = fixture(options); await assert.rejects(current.run());
    assert.equal(current.events.filter((event) => event === "dispatch").length, 1); assert.ok(current.directCalls() <= 1);
  }
  const before = fixture({ faultContextAt: 2 }); await assert.rejects(before.run()); assert.equal(before.directCalls(), 0);
});

void test("complete observations must agree and final profiles, context and saved DB must still be exact", async () => {
  for (const options of [{ varyingTree: true }, { profileFailAt: 2 }, { checkpointFailAt: 6 }, { contextFailAt: 6 },
    { checkpointPatch: { checkpointSha256: "b".repeat(64) }, checkpointPatchAt: 6 }]) {
    const current = fixture(options); await assert.rejects(current.run()); assert.equal(current.directCalls(), 2);
  }
});

void test("same-project native branch drift and history mode refuse without claiming checkpoint ownership", async () => {
  for (const options of [{ historyMode: true }, { branchFaultAt: 3 }]) {
    const current = fixture(options); await assert.rejects(current.run()); assert.equal(current.directCalls(), 0);
  }
  const after = fixture({ branchFaultAt: 4 }); await assert.rejects(after.run()); assert.equal(after.directCalls(), 1);
});

void test("replacement of the exported native host refuses even identical fields without retry", async () => {
  for (const hostReplacementAt of [3, 4]) {
    const current = fixture({ hostReplacementAt }); await assert.rejects(current.run());
    assert.equal(current.directCalls(), hostReplacementAt === 3 ? 0 : 1);
    assert.equal(current.events.filter((event) => event === "dispatch").length, 1);
  }
});

void test("initial quarantine, runtime drift and incomplete checkpoint verification refuse before any lookup", async () => {
  for (const options of [{ quarantineAt: 1 }, { profileFailAt: 1 }, { checkpointFailAt: 1 }, { contextFailAt: 1 },
    ...[{ sourceMatchesReceipt: false }, { checkpointMatchesReceipt: false }, { sourceEqualsCheckpoint: false }, { source: "/tmp/foreign.eprj2" },
      { receiptPath: "/tmp/foreign.receipt.json" }, { checkpointDumpSha256: "b".repeat(64) }].map((checkpointPatch) => ({ checkpointPatch }))]) {
    const current = fixture(options); await assert.rejects(current.run()); assert.equal(current.events.includes("dispatch"), false);
  }
});

void test("independent result verification rejects substituted scopes, ownership, hierarchy and absent peers", async () => {
  const current = fixture(), scope = prepareEditorTabLookupScope(history(), context);
  const result = validateEditorTabLookupResult(decodeExactReadEnvelope(await current.first()), TAB, scope);
  for (const fault of ["scope", "method", "value", "owner", "active", "duplicate-node", "parent", "empty-branch", "foreign-tab"]) {
    const changed = structuredClone(result);
    if (fault === "scope") { changed.scopeSha256 = "b".repeat(64); }
    if (fault === "method") { changed.method = "eda.dmt_EditorControl.getTabsBySplitScreenId"; }
    if (fault === "value") { changed.value = "left"; }
    const first = changed.tree[0], second = changed.tree[1], third = changed.tree[2]; assert.ok(first); assert.ok(second); assert.ok(third);
    const tab = third.tabs?.[0]; assert.ok(tab);
    if (fault === "owner") { tab.parentLibraryUuid = "foreign"; }
    if (fault === "active") { second.tabs = second.tabs?.filter((entry) => entry.uuid !== "board") ?? null; }
    if (fault === "duplicate-node") { third.id = second.id; }
    if (fault === "parent") { third.parentId = second.id; }
    if (fault === "empty-branch") { third.tabs = null; third.direction = "horizontal"; }
    if (fault === "foreign-tab") { tab.uuid = "foreign"; tab.tabId = "foreign@project"; }
    assert.throws(() => validateEditorTabLookupResult(changed, TAB, scope));
  }
});

void test("engine routes only the two exact methods to the checkpoint-bound reader before generic compilation", async () => {
  const source = await readFile(new URL("../src/engine.ts", import.meta.url), "utf8");
  const method = source.slice(source.indexOf("public async publicSdkRead("), source.indexOf("public async schematicNativeRead("));
  assert.ok(method.includes("if (isEditorTabLookupMethod(parsed.method)) { return readEditorTabLookup(this, parsed, boundContext); }"));
  assert.ok(method.indexOf("readEditorTabLookup(") < method.indexOf("buildPublicSdkReadCode("));
});
