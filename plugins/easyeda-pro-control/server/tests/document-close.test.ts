import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { assertUpstreamReplySettled, sha256Json } from "../src/core.ts";
import { assertDocumentCloseContext, buildDocumentCloseExpression, buildDocumentCloseReconciliationExpression, documentCloseFailureCategory,
  prepareDocumentClose, validateDocumentCloseReconciliation, validateDocumentCloseResult, verifyDocumentCloseProject, verifyRetainedDocumentClose } from "../src/document-close.ts";
import type { DocumentClosePlan } from "../src/document-close.ts";
import type { ExpectedContext } from "../src/engine.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { compileLibraryOperation } from "../src/library-operations.ts";

const CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" },
  document: { uuid: "active", documentType: 3, tabId: "active@project", parentProjectUuid: "project" } };
const OPERATION = { id: "close-clean-inactive", action: "document.close", tabId: "target@project" };
function history(targetType = "FOOTPRINT", activeType = "PCB"): NativeHistorySnapshot {
  const documents: NativeDocumentSnapshot[] = ["active", "target", "peer"].map((uuid) => {
    const docType = uuid === "target" ? targetType : activeType;
    const document = { uuid, docType, metadata: { uuid, docType },
      records: [{ id: "META", type: "META", ticket: 1, client: null, body: { title: uuid, docType: docType === "SYMBOL" ? 2 : 3 } }] };
    return Object.assign(document, { semanticSha256: sha256Json({ ...document, records: document.records.map(({ id, type, body }) => ({ id, type, body })) }) });
  });
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: "a".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
const PLAN = prepareDocumentClose(OPERATION, history(), CONTEXT);
interface Frame { tagName: string; isConnected: boolean; getAttribute: (key: string) => string | null }
interface Tab { tabId: string; isAbleDelete?: boolean; isUnSaved?: unknown; documentType?: unknown; parentProjectUuid?: unknown; parentLibraryUuid?: unknown; data: Record<string, unknown>; isDisplayNone?: unknown; draggable?: unknown; group?: unknown }
interface Options {
  targetType?: 2 | 3 | 4; activeType?: 3 | 4; dirty?: boolean; dirtyResult?: unknown; dirtyField?: unknown; omitDirtyField?: boolean;
  otherTab?: Tab; duplicateTab?: boolean; malformedStart?: boolean; withoutStart?: boolean; split?: boolean; wrongTree?: boolean;
  foreignOwner?: boolean; foreignProject?: boolean; beforeContext?: unknown; afterContext?: unknown; wrongBranch?: boolean;
  missingFrame?: boolean; replacedActiveFrame?: boolean; remainingTargetFrame?: boolean; frameIdentity?: boolean; targetAlreadyClosed?: boolean;
  acknowledgment?: unknown; duplicateEvent?: boolean; noEvent?: boolean; timeout?: boolean; throwAfterDispatch?: boolean; delayed?: boolean;
  dirtyAfterAwait?: boolean; dirtyAfterDispatch?: boolean; preDispatchEvent?: boolean; wrongTerminalEvent?: boolean;
  sharedModel?: boolean; symbolType?: number; symbolSchematic?: boolean; symbolCanvasRetained?: boolean; symbolManagerRetained?: boolean;
  nativeThrow?: string; recoveryDrift?: boolean; malformedUnsavedStatus?: boolean;
  placeholder?: Tab; duplicatePlaceholder?: boolean; placeholderDirty?: unknown; cancelThrows?: boolean; neverResolveClose?: boolean;
}
function fixture(options: Options = {}): { run: (reconcile?: boolean) => Promise<unknown>; calls: string[]; plan: DocumentClosePlan; timers: Set<ReturnType<typeof setTimeout>>; listeners: Map<string, (value: unknown) => void> } {
  const activeType = options.activeType ?? 3, targetType = options.targetType ?? 4;
  const context: ExpectedContext = { ...CONTEXT, document: { uuid: "active", documentType: activeType, tabId: "active@project",
    ...(activeType === 4 ? { parentLibraryUuid: "owner" } : { parentProjectUuid: "project" }) } };
  const plan = prepareDocumentClose(OPERATION, history({ 2: "SYMBOL", 3: "PCB", 4: "FOOTPRINT" }[targetType], activeType === 4 ? "FOOTPRINT" : "PCB"), context);
  const calls: string[] = [], listeners = new Map<string, (value: unknown) => void>(), timers = new Set<ReturnType<typeof setTimeout>>();
  // Full-suite scheduling must not turn successful synthetic cleanup into a
  // Deadline failure. Only deliberate stalled-effect cases use a short deadline.
  const deadlineMs = options.noEvent === true || options.wrongTerminalEvent === true || options.timeout === true || options.neverResolveClose === true ? 100 : 5000;
  let dirty = options.dirty ?? false, dispatches = 0, documentReads = 0, present = options.targetAlreadyClosed !== true;
  const makeFrame = (scope: typeof PLAN.target): Frame => ({ tagName: scope.documentType === 2 ? "DIV" : "IFRAME", isConnected: true,
    getAttribute: (key): string | null => {
      if (key === "c_dbid") { return options.frameIdentity === true ? "wrong" : scope.tabId; }
      return key === "c_doctype" ? String(scope.documentType) : null;
    } });
  const activeFrame = makeFrame(plan.active), targetFrame = makeFrame(plan.target);
  let currentActiveFrame = activeFrame, currentTargetFrame: Frame | null = present && options.missingFrame !== true ? targetFrame : null;
  const targetDoc = { uuid: "target", tabId: "target@project", docType: options.symbolType ?? 2, path: "project", project_uuid: "project", projectMgr: { uuid: "project" },
    ...(options.symbolSchematic === true ? { schematicUuid: "schematic" } : {}), isSymbolDoc: (): boolean => true, canvas: present ? {} : null };
  let currentDoc: typeof targetDoc | null = present ? targetDoc : null;
  const tab = (scope: typeof PLAN.target): Tab => ({ tabId: scope.tabId,
    ...(options.omitDirtyField === true ? {} : { isUnSaved: options.dirtyField ?? false }),
    data: { doctype: scope.documentType, ...(scope.documentType === 3 ? { pid: "project" } : { owner: options.foreignOwner === true ? "foreign" : "owner" }) } });
  const activeTab = tab(plan.active), targetTab = tab(plan.target);
  const start: Tab = { tabId: "tab_page1", isAbleDelete: options.malformedStart === true, data: { doctype: -1 } };
  const getTabs = (): Tab[] => [activeTab, ...(present ? [targetTab] : []), ...(options.withoutStart === true ? [] : [start]),
    ...(options.duplicateTab === true ? [activeTab] : []), ...(options.otherTab === undefined ? [] : [options.otherTab]),
    ...(options.placeholder === undefined ? [] : [options.placeholder]), ...(options.duplicatePlaceholder === true && options.placeholder !== undefined ? [options.placeholder] : [])];
  const rawTabs = { getFilterTabs: getTabs, getActiveTab: (): string => context.document.tabId ?? "", hasTabUnSaved: (): unknown => options.dirtyResult ?? dirty,
    isTabUnSaved: (tabId: string): unknown => {
      if (tabId === "0" && Object.hasOwn(options, "placeholderDirty")) { return options.placeholderDirty; }
      return options.malformedUnsavedStatus === true ? "false" : dirty;
    },
    getTabContainer: (): string => "main", containerIds: options.split === true ? ["main", "other"] : ["main"],
    containerTree: options.wrongTree === true ? { id: "main", children: [] } : { id: "main" } };
  const complete = (): void => {
    if (options.timeout === true) { return; }
    present = false; targetFrame.isConnected = false;
    currentTargetFrame = options.remainingTargetFrame === true ? targetFrame : null;
    if (options.symbolCanvasRetained !== true) { targetDoc.canvas = null; }
    if (options.symbolManagerRetained !== true) { currentDoc = null; }
    if (options.replacedActiveFrame === true) { currentActiveFrame = makeFrame(plan.active); }
    if (options.dirtyAfterDispatch === true) { dirty = true; }
    calls.push("terminal-cleanup");
    if (options.noEvent !== true) { listeners.get("sch/SubTabbarMapRemove")?.(options.wrongTerminalEvent === true ? "unrelated" : "target"); }
    if (options.duplicateEvent === true) { listeners.get("sch/SubTabbarMapRemove")?.("target"); }
  };
  const native = { TextEncoder, gVars: { currentProject: { projectId: options.foreignProject === true ? "foreign" : "project", branchUuid: options.wrongBranch === true ? "wrong" : "branch", isV2Format: false }, isHistoryMode: false,
    messageBus: {
      rpcCall: (topic: string, arg: unknown): Promise<unknown> => {
        if (topic === "getModelTabId") { assert.equal(arg, plan.target.tabId); return Promise.resolve({ message: options.sharedModel === true ? "other@project" : plan.target.tabId }); }
        assert.equal(topic, "isOpenTab"); assert.equal(JSON.stringify(arg), JSON.stringify([plan.target.tabId])); return Promise.resolve({ message: present });
      },
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Reproduces the pinned native subscription contract without changing production callbacks.
      subscribe: (topic: string, callback: (value: unknown) => void): { cancel: () => void } => {
        assert.equal(topic, "sch/SubTabbarMapRemove"); listeners.set(topic, callback);
        if (options.preDispatchEvent === true) {
          // oxlint-disable-next-line promise/prefer-await-to-callbacks, node/callback-return -- A subscription may synchronously notify and must still return its cancellation handle.
          callback("target");
        }
        return { cancel: (): void => { listeners.delete(topic); calls.push("cancel"); if (options.cancelThrows === true) { throw new Error("private cancellation failure"); } } };
      },
    } }, UI: { tabBar: rawTabs }, SCH: { docMemoryManager: { get: (uuid: string): unknown => { assert.equal(uuid, "target"); return currentDoc; } } }, window: { top: {
      document: { getElementById: (id: string): unknown => id === `frame_${plan.active.tabId}` ? currentActiveFrame : currentTargetFrame },
      setTimeout: (callback: () => void, milliseconds: number): ReturnType<typeof setTimeout> => {
        // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Executes compiler-owned browser timers in a bounded synthetic environment.
        const timer = setTimeout(() => { timers.delete(timer); callback(); }, milliseconds === 50 ? 1 : deadlineMs); timers.add(timer); return timer;
      }, clearTimeout: (timer: ReturnType<typeof setTimeout>): void => { timers.delete(timer); clearTimeout(timer); },
    } }, eda: {
      dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(context.project) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => {
        documentReads += 1;
        if (options.nativeThrow !== undefined) { throw new Error(options.nativeThrow); }
        const value = dispatches > 0 ? options.afterContext ?? context.document : options.beforeContext ?? context.document;
        if (options.dirtyAfterAwait === true && documentReads === 5) {
          // oxlint-disable-next-line promise/prefer-await-to-then -- Queue dirty state before the compiler's continuation to expose a final-await race.
          const completed = Promise.resolve(value); void completed.then(() => { dirty = true; return value; }); return completed;
        }
        if (options.recoveryDrift === true && documentReads === 3) { present = !present; }
        return Promise.resolve(value);
      } },
      dmt_EditorControl: { closeDocument: (tabId: string): Promise<unknown> => {
        assert.equal(tabId, plan.target.tabId); dispatches += 1; calls.push("close");
        if (options.delayed === true) { setImmediate(complete); } else { complete(); }
        if (options.throwAfterDispatch === true) { throw new Error("private transport details"); }
        if (options.neverResolveClose === true) { return Promise.withResolvers<unknown>().promise; }
        return Promise.resolve(Object.hasOwn(options, "acknowledgment") ? options.acknowledgment : true);
      } },
    } };
  return { calls, plan, listeners, timers, run: async (reconcile = false): Promise<unknown> => {
    const program = reconcile ? buildDocumentCloseReconciliationExpression(plan) : buildDocumentCloseExpression(plan);
    const result: unknown = runInNewContext(program, native); return await result;
  } };
}

void test("clean close derives exact membership and rejects unsupported targets, aliases, self-close and context owners", () => {
  assert.equal(PLAN.target.documentType, 4);
  for (const operation of [{ ...OPERATION, action: "document.activate" }, { ...OPERATION, tabId: "target" }, { ...OPERATION, tabId: "target@foreign" }, { ...OPERATION, tabId: "active@project" }, { ...OPERATION, tabId: "absent@project" }]) {
    assert.throws(() => prepareDocumentClose(operation, history(), CONTEXT));
  }
  for (const type of ["SCH_PAGE", "PANEL", "INSTANCE"]) { assert.throws(() => prepareDocumentClose(OPERATION, history(type), CONTEXT)); }
  for (const context of [{ ...CONTEXT, project: { ...CONTEXT.project, projectUuid: "foreign" } },
    { ...CONTEXT, document: { ...CONTEXT.document, documentUuid: "other" } },
    { ...CONTEXT, document: { ...CONTEXT.document, parentLibraryUuid: "owner" } }]) { assert.throws(() => prepareDocumentClose(OPERATION, history(), context)); }
});
void test("close catalog makes no Save/reopen or exact inverse promise for destroyed editor caches", () => {
  const compiled = compileLibraryOperation(OPERATION);
  assert.deepEqual(compiled.inverse, { kind: "none", api: null });
  assert.equal(compiled.requiredProofs.includes("save-close-reopen-persistence"), false);
  assert.equal(compiled.requiredProofs.includes("unchanged-complete-logical-database"), true);
});
void test("clean close binds complete checkpoint integrity and immutable operation-derived recovery plan", () => {
  assert.deepEqual(verifyRetainedDocumentClose(OPERATION, history(), CONTEXT, PLAN, PLAN), PLAN);
  verifyDocumentCloseProject(PLAN, history(), history());
  const original = history();
  const invalid = { ...original, documents: original.documents.map((entry) => Object.assign(structuredClone(entry), { semanticSha256: "b".repeat(64) })) };
  assert.throws(() => prepareDocumentClose(OPERATION, invalid, CONTEXT), /integrity/u);
  const peer = history(); const record = peer.documents[2]?.records[0]; assert.ok(record); record.body["title"] = "changed";
  assert.throws(() => { verifyDocumentCloseProject(PLAN, history(), peer); }, /integrity/u);
  assert.throws(() => { verifyDocumentCloseProject(PLAN, history(), { ...history(), branchUuid: "foreign" }); }, /durable project/u);
  assert.throws(() => verifyRetainedDocumentClose(OPERATION, history(), CONTEXT, { ...PLAN, target: { ...PLAN.target, uuid: "other" } }, PLAN), /original operation/u);
  assert.throws(() => { assertDocumentCloseContext(PLAN, { ...CONTEXT, project: { ...CONTEXT.project, path: "/other" } }); }, /active context/u);
});
void test("all three target families close once after dirty checks and wait for terminal cleanup while the active editor stays fixed", async () => {
  for (const targetType of [2, 3, 4] as const) {
    for (const activeType of [3, 4] as const) {
      const run = fixture({ targetType, activeType, delayed: true });
      const result = validateDocumentCloseResult(decodeExactReadEnvelope(await run.run()), run.plan);
      assert.equal(result.targetOpenNow, false); assert.equal(result.saveInvoked, false);
      assert.deepEqual(run.calls, ["close", "terminal-cleanup", "cancel"]); assert.equal(run.listeners.size, 0); assert.equal(run.timers.size, 0);
      assert.throws(() => validateDocumentCloseResult({ ...result, tabId: "foreign" }, run.plan));
      assert.throws(() => validateDocumentCloseResult({ ...result, closeCalls: 2 }, run.plan));
    }
  }
});
void test("missing raw dirty property is admitted only with exact independent clean predicates", async () => {
  const run = fixture({ omitDirtyField: true, withoutStart: true }); await run.run(); assert.equal(run.calls.filter((call) => call === "close").length, 1);
  for (const options of [{ dirty: true }, { dirtyResult: "false" }, { dirtyField: "false" }, { omitDirtyField: true, malformedUnsavedStatus: true }]) {
    const refused = fixture(options); await assert.rejects(refused.run(), /before-state/u); assert.deepEqual(refused.calls, []);
  }
});
void test("foreign tabs, owners, split screens, aliases, malformed Start Page, absent frames and previously closed targets refuse before close", async () => {
  for (const options of [{ otherTab: { tabId: "other@foreign", data: { doctype: 3, pid: "foreign" } } },
    { duplicateTab: true }, { split: true }, { wrongTree: true }, { foreignOwner: true }, { foreignProject: true }, { wrongBranch: true },
    { malformedStart: true }, { missingFrame: true }, { frameIdentity: true }, { targetAlreadyClosed: true },
    { beforeContext: { ...CONTEXT.document, uuid: "other" } }]) {
    const run = fixture(options); await assert.rejects(run.run(), /before-state/u); assert.deepEqual(run.calls, []); assert.equal(run.timers.size, 0);
  }
});
void test("a dirty mutation queued at the final context await is caught synchronously before dispatch", async () => {
  const run = fixture({ dirtyAfterAwait: true }); await assert.rejects(run.run(), /dispatch-state/u); assert.deepEqual(run.calls, ["cancel"]);
});
void test("symbol close refuses shared models, derived types, schematic ownership and missing cleanup evidence", async () => {
  for (const options of [{ sharedModel: true }, { symbolType: 17 }, { symbolSchematic: true }]) {
    const run = fixture({ ...options, targetType: 2 }); await assert.rejects(run.run(), /before-state/u); assert.deepEqual(run.calls, []);
  }
  for (const options of [{ symbolCanvasRetained: true }, { symbolManagerRetained: true }]) {
    const run = fixture({ ...options, targetType: 2 }); await assert.rejects(run.run(), /NATIVE_LIFECYCLE_CLOSE_UNSETTLED/u);
    assert.equal(run.calls.filter((call) => call === "close").length, 1); assert.equal(run.listeners.size, 0);
  }
});
void test("false, missing and thrown close acknowledgments never produce a success or a second close", async () => {
  for (const options of [{ acknowledgment: false }, { acknowledgment: "true" }, { acknowledgment: 1 }, { acknowledgment: null }, { acknowledgment: undefined }, { throwAfterDispatch: true }, { cancelThrows: true }, { neverResolveClose: true }]) {
    const run = fixture(options); await assert.rejects(run.run(), /NATIVE_LIFECYCLE_CLOSE_UNSETTLED/u);
    assert.equal(run.calls.filter((call) => call === "close").length, 1); assert.equal(run.listeners.size, 0); assert.equal(run.timers.size, 0);
  }
});
void test("no notification, wrong notification and stalled cleanup time out with one consumed close and cleared subscription", async () => {
  for (const options of [{ noEvent: true }, { wrongTerminalEvent: true }, { timeout: true }]) {
    const run = fixture(options); await assert.rejects(run.run(), /NATIVE_LIFECYCLE_CLOSE_UNSETTLED/u);
    assert.equal(run.calls.filter((call) => call === "close").length, 1); assert.equal(run.listeners.size, 0); assert.equal(run.timers.size, 0);
  }
});
void test("early unrelated notifications do not complete the close and duplicate target terminal notifications refuse", async () => {
  const early = fixture({ preDispatchEvent: true, delayed: true }); await early.run(); assert.equal(early.calls.filter((call) => call === "close").length, 1);
  const duplicate = fixture({ duplicateEvent: true }); await assert.rejects(duplicate.run(), /NATIVE_LIFECYCLE_CLOSE_UNSETTLED/u);
  assert.equal(duplicate.calls.filter((call) => call === "close").length, 1); assert.equal(duplicate.listeners.size, 0);
});
void test("post-dispatch dirty state, active context drift, retained or replaced frames cannot become accepted closes", async () => {
  for (const options of [{ dirtyAfterDispatch: true }, { remainingTargetFrame: true }, { replacedActiveFrame: true }, { afterContext: { ...CONTEXT.document, uuid: "target" } }]) {
    const run = fixture(options); await assert.rejects(run.run(), /NATIVE_LIFECYCLE_CLOSE_UNSETTLED/u);
    assert.equal(run.calls.filter((call) => call === "close").length, 1); assert.equal(run.listeners.size, 0); assert.equal(run.timers.size, 0);
  }
});
void test("all post-dispatch compiler failures retain unsettled execution in normalized MCP failure envelopes", async () => {
  const run = fixture({ acknowledgment: false });
  let failure: unknown;
  try { await run.run(); } catch (error) { failure = error; }
  const message = String(failure).replace(/^Error: /u, "");
  assert.equal(message, "NATIVE_LIFECYCLE_CLOSE_UNSETTLED");
  for (const response of [{ structuredContent: { ok: false, error: message } },
    { content: [{ type: "text", text: JSON.stringify({ success: false, result: { error: { code: "EASYEDA_API_ERROR", message } } }) }] }]) {
    assert.throws(() => { assertUpstreamReplySettled(response); }, /native-lifecycle-unsettled;execution-unsettled/u);
  }
});
void test("strict hidden project placeholder is admitted once without allowing foreign or malformed hidden tabs", async () => {
  const placeholder: Tab = { tabId: "0", data: { doctype: 0 }, isAbleDelete: false, isDisplayNone: true, draggable: false, group: "start_blank" };
  const run = fixture({ placeholder }); await run.run(); assert.equal(run.calls.filter((call) => call === "close").length, 1);
  for (const patch of [{ isDisplayNone: false }, { group: "foreign" }, { isUnSaved: true }, { data: { doctype: 0, owner: "foreign" } }, { parentProjectUuid: "foreign" }]) {
    const refused = fixture({ placeholder: { ...placeholder, ...patch } }); await assert.rejects(refused.run(), /before-state/u); assert.deepEqual(refused.calls, []);
  }
  const duplicate = fixture({ placeholder, duplicatePlaceholder: true }); await assert.rejects(duplicate.run(), /before-state/u); assert.deepEqual(duplicate.calls, []);
  for (const placeholderDirty of [true, null, undefined, "false"]) {
    const refused = fixture({ placeholder, placeholderDirty }); await assert.rejects(refused.run(), /before-state/u); assert.deepEqual(refused.calls, []);
  }
});
void test("read-only reconciliation classifies the original still-open tab or stable absence and never invokes any lifecycle method", async () => {
  for (const targetType of [2, 3, 4] as const) {
    for (const targetAlreadyClosed of [false, true]) {
      const run = fixture({ targetType, targetAlreadyClosed });
      const result = validateDocumentCloseReconciliation(decodeExactReadEnvelope(await run.run(true)), run.plan);
      assert.equal(result.targetOpenNow, !targetAlreadyClosed); assert.deepEqual(run.calls, []); assert.equal(run.timers.size, 0);
      assert.throws(() => validateDocumentCloseReconciliation({ ...result, closeInvoked: true }, run.plan));
    }
  }
});
void test("reconciliation refuses changing observations and every error remains a fixed-stage category without private native text", async () => {
  const drifting = fixture({ recoveryDrift: true }); await assert.rejects(drifting.run(true), /reconciliation/u); assert.deepEqual(drifting.calls, []);
  const secret = fixture({ nativeThrow: "PRIVATE path token project source" });
  await assert.rejects(secret.run(), { message: "Clean document close refused at before-state" });
  assert.equal(documentCloseFailureCategory("Clean document close refused at before-state"), "native-document-close:before-state");
  for (const message of ["Clean document close refused at bogus", "Clean document close refused at close\n", "prefix Clean document close refused at close", "Clean document close refused at close PRIVATE", null]) {
    assert.equal(documentCloseFailureCategory(message), null);
  }
});
