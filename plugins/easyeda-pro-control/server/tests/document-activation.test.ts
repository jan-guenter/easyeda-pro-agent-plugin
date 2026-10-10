import assert from "node:assert/strict";
import { test } from "node:test";
import { buildDocumentActivationExpression, classifyDocumentActivationContext, documentActivationContext, prepareDocumentActivation, validateDocumentActivationResult, verifyDocumentActivationProject, verifyRetainedDocumentActivation } from "../src/document-activation.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { buildLibraryExecutionExpression, libraryExecutionKind } from "../src/library-runtime.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import type { ExpectedContext } from "../src/engine.ts";

const HASH = "a".repeat(64);
const CONTEXT: ExpectedContext = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "board@project", parentProjectUuid: "project" } };
const OPERATION = { id: "activate-symbol", action: "document.activate", tabId: "symbol@project" };
function history(targetType = "SYMBOL"): NativeHistorySnapshot {
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", projectOwnerUuid: "owner", branchUuid: "branch", headHistoryUuid: "head",
    checkpointSha256: HASH, historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, semanticSha256: HASH,
    documents: ["board", "symbol"].map((uuid) => ({ uuid, docType: uuid === "board" ? "PCB" : targetType, metadata: { uuid }, semanticSha256: HASH,
      records: [{ id: "META", type: "META", ticket: 1, client: null, body: { title: uuid } }] })) };
}
const PLAN = prepareDocumentActivation(OPERATION, history(), CONTEXT);

function fixture(options: { acknowledgment?: unknown; tree?: unknown; afterTree?: unknown; afterContext?: unknown; missingSamples?: number; originalSamples?: number; beforeProject?: unknown; afterProject?: unknown; missingFrame?: boolean; sharedModel?: boolean; replacedFrame?: boolean; targetDocumentType?: 1 | 2 | 3 | 4; preferences?: string | null; frameFault?: "disconnected" | "identity" | "type" } = {}): {
  run: () => Promise<unknown>; calls: () => number; timers: Set<ReturnType<typeof setTimeout>>;
} {
  let calls = 0, missing = options.missingSamples ?? 0, original = options.originalSamples ?? 0;
  const baseline = history({ 1: "SCH_PAGE", 2: "SYMBOL", 3: "PCB", 4: "FOOTPRINT" }[options.targetDocumentType ?? 2]);
  const plan = prepareDocumentActivation(OPERATION, baseline, CONTEXT);
  const tree = { children: [{ tabs: [{ tabId: "board@project", documentType: 3, parentProjectUuid: "project" }] },
    { tabs: [{ tabId: "symbol@project", documentType: plan.target.documentType, ...([1, 3].includes(plan.target.documentType) ? { parentProjectUuid: "project" } : { parentLibraryUuid: "owner" }) }] }] };
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const frame = (scope: typeof plan.target): unknown => ({ tagName: scope.documentType <= 2 ? "DIV" : "IFRAME", isConnected: options.frameFault !== "disconnected",
    getAttribute: (name: string): string | null => {
      if (name === "c_dbid") { return options.frameFault === "identity" ? "foreign@project" : scope.tabId; }
      if (name === "c_doctype") { return options.frameFault === "type" ? "99" : String(scope.documentType); }
      return null;
    } });
  const frames = new Map([[`frame_${plan.before.tabId}`, frame(plan.before)], [`frame_${plan.target.tabId}`, frame(plan.target)]]);
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(calls === 0 ? options.beforeProject ?? CONTEXT.project : options.afterProject ?? CONTEXT.project) },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => {
      if (calls === 0) { return Promise.resolve(CONTEXT.document); }
      if (missing > 0) { missing -= 1; return Promise.resolve(); }
      if (original > 0) { original -= 1; return Promise.resolve(CONTEXT.document); }
      return Promise.resolve(options.afterContext ?? documentActivationContext(plan).document);
    } },
    dmt_EditorControl: { getSplitScreenTree: (): Promise<unknown> => Promise.resolve(calls === 0 ? options.tree ?? tree : options.afterTree ?? options.tree ?? tree),
      activateDocument: (tabId: string): Promise<unknown> => {
        calls += 1; assert.equal(tabId, OPERATION.tabId);
        if (options.replacedFrame === true) { frames.set(`frame_${plan.target.tabId}`, frame(plan.target)); }
        return Promise.resolve(options.acknowledgment ?? false);
      } } };
  const native = { gVars: { currentProject: { projectId: "project" }, messageBus: { rpcCall: (topic: string, tabId: string): Promise<unknown> => {
    assert.equal(topic, "getModelTabId"); return Promise.resolve({ message: options.sharedModel === true ? "shared@project" : tabId });
  } } }, window: { top: {
    document: { getElementById: (id: string): unknown => options.missingFrame === true && id === `frame_${plan.target.tabId}` ? null : frames.get(id) },
    localStorage: { getItem: (key: string): string | null => { assert.equal(key, "preferences"); return options.preferences === undefined ? '{"pcbCommandTab":true}' : options.preferences; } },
    setTimeout: (callback: () => void, milliseconds: number): ReturnType<typeof setTimeout> => {
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Reproduce the native timer callback contract and verify timer cleanup.
      const timer = setTimeout(() => { timers.delete(timer); callback(); }, milliseconds === 50 ? 1 : 100); timers.add(timer); return timer;
    },
    clearTimeout: (timer: ReturnType<typeof setTimeout>): void => { timers.delete(timer); clearTimeout(timer); },
  } } };
  // oxlint-disable-next-line typescript/no-implied-eval, no-new-func -- Execute only the fixed production compiler against isolated API doubles.
  const execute = new Function("eda", "globalThis", `return ${buildDocumentActivationExpression(plan)};`);
  return { run: async (): Promise<unknown> => {
    // oxlint-disable-next-line typescript/no-unsafe-call -- Confine the generated fixed function's result to unknown.
    const result: unknown = execute(eda, native); return await result;
  }, calls: (): number => calls, timers };
}

void test("activation derives exact checkpoint membership and never uses the generic preserve-context adapter", () => {
  assert.equal(libraryExecutionKind(OPERATION), "document-activate");
  assert.throws(() => buildLibraryExecutionExpression(OPERATION), /checkpoint-bound ownership plan/u);
  assert.equal(PLAN.target.uuid, "symbol");
  assert.deepEqual(documentActivationContext(PLAN).document, { uuid: "symbol", documentType: 2, tabId: "symbol@project", parentLibraryUuid: "owner" });
  assert.throws(() => prepareDocumentActivation({ ...OPERATION, tabId: "symbol@foreign" }, history(), CONTEXT), /current-project document/u);
  assert.throws(() => prepareDocumentActivation({ ...OPERATION, tabId: "missing@project" }, history(), CONTEXT), /exact checkpoint/u);
  assert.throws(() => prepareDocumentActivation(OPERATION, { ...history(), projectUuid: "foreign" }, CONTEXT), /exact checkpoint/u);
  assert.throws(() => prepareDocumentActivation(OPERATION, history(), { ...CONTEXT, project: { ...CONTEXT.project, projectUuid: "foreign" } }), /exact checkpoint/u);
  assert.throws(() => prepareDocumentActivation({ ...OPERATION, tabId: CONTEXT.document.tabId }, history(), CONTEXT), /already active/u);
});
void test("activation recovery classifies one exact context without swallowing foreign or transport observations", () => {
  assert.equal(classifyDocumentActivationContext(PLAN, CONTEXT), false);
  const target = documentActivationContext(PLAN);
  assert.equal(classifyDocumentActivationContext(PLAN, target), true);
  for (const observed of [{ ...target, document: { ...target.document, uuid: "third" } },
    { ...target, document: { ...target.document, documentUuid: "third" } },
    { ...target, document: { ...target.document, parentLibraryUuid: "foreign" } },
    { ...target, project: { ...target.project, projectUuid: "foreign" } }]) {
    assert.throws(() => classifyDocumentActivationContext(PLAN, observed), /Activation recovery observed/u);
  }
});
void test("activation accepts false only after the exact target and unchanged complete tree are independently observed twice", async () => {
  const run = fixture();
  const result = validateDocumentActivationResult(decodeExactReadEnvelope(await run.run()), PLAN);
  assert.equal(result["acknowledgment"], false); assert.equal(result["coherentObservations"], 2);
  assert.equal(run.calls(), 1); assert.equal(run.timers.size, 0);
  assert.throws(() => validateDocumentActivationResult({ ...result, tabId: "foreign" }, PLAN), /retained exact plan/u);
});
void test("activation waits for missing context without repeating navigation", async () => {
  const run = fixture({ missingSamples: 2, acknowledgment: true });
  const payload = decodeExactReadEnvelope(await run.run());
  assert.equal(validateDocumentActivationResult(payload, PLAN)["acknowledgment"], true);
  assert.equal(run.calls(), 1); assert.equal(run.timers.size, 0);
});
void test("activation lets only its exact known original context settle into the target without another call", async () => {
  const run = fixture({ originalSamples: 2 });
  const payload = decodeExactReadEnvelope(await run.run());
  assert.equal(validateDocumentActivationResult(payload, PLAN)["coherentObservations"], 2);
  assert.equal(run.calls(), 1); assert.equal(run.timers.size, 0);
});
void test("activation refuses foreign or malformed complete tab trees before the one call", async () => {
  const cycles: { children: unknown[] } = { children: [] }; cycles.children.push(cycles);
  for (const tree of [{ tabs: [null] }, { tabs: [{ tabId: "other@foreign", documentType: 3, parentProjectUuid: "foreign" }] },
    { tabs: [{ tabId: "board@project", documentType: 3, parentProjectUuid: "project" }] }, cycles,
    { children: [{ tabs: [] }, { tabs: [{ tabId: "board@project", documentType: 3, parentProjectUuid: "project" }, { tabId: "symbol@project", documentType: 2, parentLibraryUuid: "owner" }] }] },
    { tabs: [{ tabId: "symbol@project", documentType: 2, parentLibraryUuid: "foreign" }] },
    { tabs: [{ tabId: "symbol@project", documentType: 2, parentLibraryUuid: "owner", data: { owner: "foreign" } }] }]) {
    const run = fixture({ tree }); await assert.rejects(run.run(), /before-tabs/u); assert.equal(run.calls(), 0);
  }
});
void test("activation refuses changed tab membership, conflicting context and project identity after dispatch without retry", async () => {
  for (const options of [{ afterTree: { tabs: [] } }, { afterContext: { ...documentActivationContext(PLAN).document, uuid: "other" } },
    { afterContext: { ...documentActivationContext(PLAN).document, documentUuid: "other" } },
    { afterContext: { ...documentActivationContext(PLAN).document, parentLibraryUuid: "foreign" } },
    { afterContext: CONTEXT.document }, { afterProject: { uuid: "foreign" } }, { acknowledgment: "true" }]) {
    const run = fixture(options); await assert.rejects(run.run(), /Document activation refused/u); assert.equal(run.calls(), 1); assert.equal(run.timers.size, 0);
  }
});
void test("activation readiness has a fixed deadline and clears its observation timers", async () => {
  const run = fixture({ missingSamples: 1000 });
  await assert.rejects(run.run(), /target-readiness/u); assert.equal(run.calls(), 1); assert.equal(run.timers.size, 0);
});
void test("activation refuses lazy or shared frames before the method and a replaced frame after it", async () => {
  for (const options of [{ missingFrame: true }, { sharedModel: true }]) {
    const run = fixture(options); await assert.rejects(run.run(), /loaded-frames/u); assert.equal(run.calls(), 0);
  }
  const replaced = fixture({ replacedFrame: true }); await assert.rejects(replaced.run(), /target-readiness/u);
  assert.equal(replaced.calls(), 1); assert.equal(replaced.timers.size, 0);
});
void test("activation binds connected frame identity and type for all four supported editor families", async () => {
  for (const targetDocumentType of [1, 2, 3, 4] as const) {
    for (const frameFault of ["identity", "type", "disconnected"] as const) {
      const run = fixture({ targetDocumentType, frameFault }); await assert.rejects(run.run(), /loaded-frames/u); assert.equal(run.calls(), 0);
    }
    const run = fixture({ targetDocumentType }); await run.run(); assert.equal(run.calls(), 1);
  }
});
void test("PCB and footprint activation refuse the delegated account-preference write branch without changing the preference", async () => {
  for (const targetDocumentType of [3, 4] as const) {
    for (const preferences of [null, "{}", '{"pcbCommandTab":false}', '{"pcbCommandTab":"true"}', "invalid"]) {
      const run = fixture({ targetDocumentType, preferences }); await assert.rejects(run.run(), /preferences/u); assert.equal(run.calls(), 0);
    }
    const run = fixture({ targetDocumentType }); const payload = decodeExactReadEnvelope(await run.run());
    assert.equal(typeof payload, "object"); assert.equal(run.calls(), 1); assert.equal(run.timers.size, 0);
  }
});
void test("activation proves the complete project and the original retained plan, including peers and branch ownership", () => {
  verifyDocumentActivationProject(PLAN, history(), history());
  assert.deepEqual(verifyRetainedDocumentActivation(OPERATION, history(), CONTEXT, PLAN, PLAN), PLAN);
  const peer = history(); const record = peer.documents[0]?.records[0]; assert.ok(record); record.body["title"] = "changed";
  for (const after of [peer, { ...history(), branchUuid: "other" }, { ...history(), projectOwnerUuid: "other" }]) {
    assert.throws(() => { verifyDocumentActivationProject(PLAN, history(), after); }, /complete durable project/u);
  }
  assert.throws(() => verifyRetainedDocumentActivation(OPERATION, history(), CONTEXT, { ...PLAN, projectRecordsSha256: "b".repeat(64) }, PLAN), /original operation/u);
});
