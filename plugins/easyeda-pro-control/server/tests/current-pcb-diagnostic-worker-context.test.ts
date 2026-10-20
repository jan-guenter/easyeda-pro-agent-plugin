import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CurrentPcbDiagnosticWorkerContext } from "../src/current-pcb-diagnostic-worker-context.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";

const SOURCE = "const syntheticWorker = true;";
const PROFILE = { relativePath: "pro-mgr/test/js/project-worker.js", scriptBytes: Buffer.byteLength(SOURCE),
  scriptSha256: createHash("sha256").update(SOURCE).digest("hex") };
const PARENT = { targetId: "page-1", type: "page", title: "private page", url: "https://synthetic/editor", attached: true };
const WORKER = { targetId: "worker-1", type: "worker", title: `project_${"a".repeat(64)}_tab_1`,
  url: "https://synthetic/editor?entry=mgr-project-worker.js&cll=warn", attached: true };
const CONTEXT = { id: 7, uniqueId: "worker-context-1", name: WORKER.title, origin: WORKER.url };
const SCRIPT = { scriptId: "script-1", executionContextId: 7, url: `https://synthetic/${PROFILE.relativePath}`,
  hasSourceURL: false, isLiveEdit: false, scriptLanguage: "JavaScript" };
function attachment(changes: Record<string, unknown> = {}): DiagnosticEvent {
  return { method: "Target.attachedToTarget", sessionId: "page-session",
    params: { sessionId: "worker-session", targetInfo: WORKER, waitingForDebugger: false, ...changes } };
}
function event(method: string, params: Record<string, unknown>): DiagnosticEvent { return { method, params, sessionId: "worker-session" }; }
function targets(): Record<string, unknown> { return { targetInfos: [PARENT, WORKER] }; }
function fixture(): CurrentPcbDiagnosticWorkerContext {
  const context = new CurrentPcbDiagnosticWorkerContext("page-1", "page-session", PROFILE);
  context.observeEvent(attachment()); context.finishInventory(targets()); context.selectWorker("worker-1");
  context.observeEvent(event("Runtime.executionContextCreated", { context: CONTEXT }));
  context.observeEvent(event("Debugger.scriptParsed", SCRIPT)); return context;
}
function source(context: CurrentPcbDiagnosticWorkerContext): Readonly<Record<string, unknown>> {
  return context.finishSource({ scriptSource: SOURCE }, targets());
}
void test("worker inventory requires original parent-scoped child events and omits private names and URLs", () => {
  const context = new CurrentPcbDiagnosticWorkerContext("page-1", "page-session", PROFILE);
  context.observeEvent(attachment()); const result = context.finishInventory(targets());
  assert.deepEqual(result["workers"], [{ targetId: "worker-1", sessionId: "worker-session", type: "worker" }]);
  assert.equal(result["parentAttachmentObserved"], true); assert.equal(result["completeWorkerInventoryVerified"], false);
  assert.equal(JSON.stringify(result).includes("private page"), false); assert.equal(JSON.stringify(result).includes("https:"), false);
  assert.equal(context.selectWorker("worker-1").sessionId, "worker-session");
});
void test("worker source binds single actual worker context without page auxData and admits exact source before evaluation", () => {
  const context = fixture(), result = source(context);
  assert.equal(result["sourceVerified"], true); assert.equal(result["uniqueContextId"], CONTEXT.uniqueId);
  assert.equal(result["projectWorkerAssociationVerified"], false); assert.equal(result["compilerOwnerVerified"], false);
  assert.equal(context.evaluationContext(), CONTEXT.uniqueId);
  assert.equal(JSON.stringify(result).includes(WORKER.title), false); assert.equal(JSON.stringify(result).includes(WORKER.url), false);
  const unadmitted = fixture(); assert.throws(() => unadmitted.evaluationContext(), /IDENTITY/u);
  assert.throws(() => source(unadmitted), /IDENTITY/u);
});
void test("worker selectors cannot adopt browser-inventory-only or foreign-parent targets", () => {
  const unseen = new CurrentPcbDiagnosticWorkerContext("page-1", "page-session", PROFILE);
  unseen.finishInventory(targets()); assert.throws(() => unseen.selectWorker("worker-1"), /IDENTITY/u);
  for (const value of [
    { ...attachment(), sessionId: "foreign-parent" }, { method: attachment().method, params: attachment().params },
    attachment({ waitingForDebugger: true }), attachment({ sessionId: "page-session" }),
    attachment({ targetInfo: { ...WORKER, type: "shared_worker" } }), attachment({ targetInfo: { ...WORKER, attached: false } }),
  ]) {
    const context = new CurrentPcbDiagnosticWorkerContext("page-1", "page-session", PROFILE);
    assert.throws(() => { context.observeEvent(value); }, /INVALIDATED/u);
  }
});
void test("worker inventory rejects duplicates, excessive children and late attachments without expanding the sample", () => {
  const duplicate = new CurrentPcbDiagnosticWorkerContext("page-1", "page-session", PROFILE);
  duplicate.observeEvent(attachment()); assert.throws(() => { duplicate.observeEvent(attachment()); }, /INVALIDATED/u);
  const bounded = new CurrentPcbDiagnosticWorkerContext("page-1", "page-session", PROFILE);
  for (let index = 0; index < 16; index += 1) {
    bounded.observeEvent(attachment({ sessionId: `worker-${String(index)}`, targetInfo: { ...WORKER, targetId: `target-${String(index)}` } }));
  }
  assert.throws(() => { bounded.observeEvent(attachment()); }, /INVALIDATED/u);
  const late = fixture(); source(late);
  assert.throws(() => { late.observeEvent(attachment({ sessionId: "worker-2", targetInfo: { ...WORKER, targetId: "worker-2" } })); }, /INVALIDATED/u);
  assert.throws(() => late.evaluationContext(), /IDENTITY/u);
});
void test("wrong worker name origin duplicate context or invented page auxData refuse", () => {
  for (const contextValue of [{ ...CONTEXT, name: "foreign" }, { ...CONTEXT, origin: "https://other/" },
    { ...CONTEXT, auxData: { frameId: "page-1", isDefault: true } }, { ...CONTEXT, uniqueId: "" }]) {
    const context = new CurrentPcbDiagnosticWorkerContext("page-1", "page-session", PROFILE);
    context.observeEvent(attachment()); context.finishInventory(targets()); context.selectWorker("worker-1");
    assert.throws(() => { context.observeEvent(event("Runtime.executionContextCreated", { context: contextValue })); }, /INVALIDATED/u);
  }
  const duplicate = fixture();
  assert.throws(() => { duplicate.observeEvent(event("Runtime.executionContextCreated", { context: CONTEXT })); }, /INVALIDATED/u);
});
void test("worker script URL aliases spoofed source and changed parent or child identities refuse", () => {
  for (const changed of [
    { targetInfos: [{ ...PARENT, url: "https://changed/" }, WORKER] },
    { targetInfos: [PARENT, { ...WORKER, title: "changed" }] },
    { targetInfos: [PARENT, { ...WORKER, attached: false }] }, { targetInfos: [PARENT] },
  ]) { const context = fixture(); assert.throws(() => context.finishSource({ scriptSource: SOURCE }, changed), /IDENTITY/u); }
  const changedSource = fixture(); assert.throws(() => changedSource.finishSource({ scriptSource: `${SOURCE}\n` }, targets()), /IDENTITY/u);
  for (const script of [{ ...SCRIPT, url: `${SCRIPT.url}?` }, { ...SCRIPT, hasSourceURL: true },
    { ...SCRIPT, isLiveEdit: true }, { ...SCRIPT, executionContextId: 8 }]) {
    const context = new CurrentPcbDiagnosticWorkerContext("page-1", "page-session", PROFILE);
    context.observeEvent(attachment()); context.finishInventory(targets()); context.selectWorker("worker-1");
    context.observeEvent(event("Runtime.executionContextCreated", { context: CONTEXT }));
    context.observeEvent(event("Debugger.scriptParsed", script)); assert.throws(() => context.script(), /IDENTITY/u);
  }
});
void test("anonymous evaluation scripts cannot replace admitted source and private event payloads are not exposed", () => {
  const context = fixture(); source(context);
  context.observeEvent(event("Debugger.scriptParsed", { ...SCRIPT, scriptId: "evaluation-1", url: "" }));
  context.observeEvent(event("Runtime.consoleAPICalled", { args: [{ value: "private console" }] }));
  assert.equal(context.evaluationContext(), CONTEXT.uniqueId); assert.equal(context.script().scriptId, SCRIPT.scriptId);
  assert.throws(() => { context.observeEvent(event("Debugger.scriptParsed", { ...SCRIPT, scriptId: "replacement" })); }, /INVALIDATED/u);
});
void test("worker or parent identity loss invalidates all future observations without a recovery token", () => {
  for (const method of ["Target.detachedFromTarget", "Page.frameNavigated", "Runtime.executionContextDestroyed",
    "Runtime.executionContextsCleared", "Debugger.paused", "Debugger.resumed", "Future.event"]) {
    const context = fixture(); source(context);
    assert.throws(() => { context.observeEvent(event(method, {})); }, /INVALIDATED/u);
    assert.throws(() => context.evaluationContext(), /IDENTITY/u);
  }
  const parent = fixture(); source(parent);
  assert.throws(() => { parent.observeEvent({ method: "Target.detachedFromTarget", params: { sessionId: "worker-session" }, sessionId: "page-session" }); }, /INVALIDATED/u);
});
