/** Actual context/opening classes with synthetic inert UI source. These tests
 * prove refusal before dispatch, not a successful live combined PCB opening. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CurrentPcbDiagnosticContext } from "../src/current-pcb-diagnostic-context.ts";
import { CurrentPcbWorkerStartupOpening } from "../src/current-pcb-worker-startup-opening.ts";
import type { CurrentPcbWorkerStartupDependency } from "../src/current-pcb-worker-startup-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_PCB_COMMAND_LIMIT, CURRENT_PCB_WORKER_STARTUP_PCB_TOTAL_REQUEST_LIMIT,
  CurrentPcbWorkerStartupPcbSession, retainCurrentPcbWorkerStartupPcbOpeningReply } from "../src/current-pcb-worker-startup-pcb-session.ts";
import { CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT } from "../src/current-pcb-worker-startup-wire.ts";
import type { CurrentPcbDiagnosticPcbOpeningResult } from "../src/current-pcb-diagnostic-pcb-opening.ts";

const rawWindowsPath = String.raw`C:\Synthetic\pcb-session.eprj2`;
const target = Object.freeze({ rawWindowsPath, projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex"),
  branchUuid: "b".repeat(32), documentUuid: "d".repeat(16), expectedSourceSha256: "e".repeat(64) });
function contextFixture(): CurrentPcbDiagnosticContext {
  const source = "const syntheticStartupPcbContext = true;", url = "https://client/editor?cll=warn";
  const profile = { family: "ui", relativePath: "synthetic/ui.js", scriptBytes: Buffer.byteLength(source),
    scriptSha256: createHash("sha256").update(source).digest("hex") } as const;
  const page = { targetId: "parent-target", type: "page", title: "Synthetic", url: `${url}#`, attached: false };
  const frame = { id: "parent-frame", loaderId: "parent-loader", url, urlFragment: "#", securityOrigin: "https://client", mimeType: "text/html" };
  const context = new CurrentPcbDiagnosticContext("parent-target");
  context.selectTarget({ targetInfos: [page] }); context.bindSession("parent-session");
  context.observeFrames({ frameTree: { frame } }); context.selectFrame("parent-frame", profile);
  context.observeEvent({ method: "Runtime.executionContextCreated", sessionId: "parent-session", params: { context: {
    id: 7, uniqueId: "parent-context", origin: "https://client", name: "", auxData: { frameId: "parent-frame", isDefault: true, type: "default" },
  } } });
  context.observeEvent({ method: "Debugger.scriptParsed", sessionId: "parent-session", params: {
    scriptId: "parent-script", url: `https://client/${profile.relativePath}`, executionContextId: 7, hasSourceURL: false, scriptLanguage: "JavaScript",
  } });
  context.finish({ scriptSource: source }, { targetInfos: [{ ...page, attached: true }] }, { frameTree: { frame } });
  context.beginOpeningTransition(target.projectUuid);
  const opened = `${url}#id=${target.projectUuid}`;
  context.observeEvent({ method: "Page.navigatedWithinDocument", sessionId: "parent-session", params: {
    frameId: "parent-frame", url: opened, navigationType: "fragment",
  } });
  context.finishOpeningTransition({ targetInfos: [{ ...page, url: opened, attached: true }] },
    { frameTree: { frame: { ...frame, urlFragment: `#id=${target.projectUuid}` } } });
  return context;
}
function fixture(): Readonly<{ context: CurrentPcbDiagnosticContext; opening: CurrentPcbWorkerStartupOpening;
  dependency: CurrentPcbWorkerStartupDependency; state: { native: number; checkpoints: number; override: number } }> {
  const context = contextFixture(), state = { native: 0, checkpoints: 0, override: 0 };
  const dependency: CurrentPcbWorkerStartupDependency = Object.freeze({ parentTargetId: "parent-target", parentSessionId: "parent-session",
    assertOriginalOwner: (): Promise<void> => Promise.resolve(), assertOriginalTermination: (): Promise<void> => Promise.resolve(),
    subscribe: (): (() => void) => (): void => undefined,
    request: (): Promise<unknown> => { state.native += 1; return Promise.reject(new Error("No dispatch expected")); },
  });
  const opening = new CurrentPcbWorkerStartupOpening({ dependency, opening: Object.freeze({
    context: () => context.openingContext(), reprove: (): Promise<void> => Promise.resolve(),
    begin: () => context.openingContext(), finish: (): void => undefined,
    observeParent: (): void => undefined, ancillaryFrame: (): null => null,
    observeAncillary: (): void => undefined, ancillaryObservation: (): null => null,
  }) });
  return { context, opening, dependency, state };
}
function construct(value: ReturnType<typeof fixture>, opening: unknown = value.opening, context: unknown = value.context): CurrentPcbWorkerStartupPcbSession {
  const session: unknown = Reflect.construct(CurrentPcbWorkerStartupPcbSession, [opening, {}, value.dependency, context, target,
    (): Promise<void> => { value.state.checkpoints += 1; return Promise.resolve(); }]);
  assert.ok(session instanceof CurrentPcbWorkerStartupPcbSession); return session;
}
void test("PCB continuation requires an actual completed construction, not matching target JSON or an instance override", async () => {
  const value = fixture();
  Object.defineProperty(value.opening, "requireOriginalPcbDependency", { value: (): Promise<void> => {
    value.state.override += 1; return Promise.resolve();
  } });
  const session = construct(value);
  await assert.rejects(session.openAndQualify(), /PCB_/u);
  assert.deepEqual(value.state, { native: 0, checkpoints: 0, override: 0 });
  assert.equal(session.status().phase, "failed"); assert.equal(session.status().transitionStarted, false);
  await assert.rejects(session.openAndQualify(), /consumed/u);
  const read: unknown = Reflect.get(session, "requireOriginal"); assert.ok(typeof read === "function");
  await assert.rejects(async () => { await Reflect.apply(read, session, [{}]); }, /original completed/u);
});
void test("PCB continuation rejects class lookalikes, proxies and replaced context methods without caller hooks", () => {
  const value = fixture(); let hooks = 0;
  assert.throws(() => construct(value, {}), /original classes/u);
  assert.throws(() => construct(value, new Proxy(value.opening, { getPrototypeOf: (): never => { hooks += 1; throw new Error("Proxy trap"); } })), /original classes/u);
  assert.throws(() => construct(value, value.opening, Object.create(CurrentPcbDiagnosticContext.prototype)));
  Object.defineProperty(value.context, "openingContext", { get: (): never => { hooks += 1; throw new Error("Context getter"); } });
  assert.throws(() => construct(value), /original context method/u); assert.equal(hooks, 0);
  assert.equal(value.state.native, 0);
});
void test("PCB continuation budget is bounded inside the existing startup contract", () => {
  assert.equal(CURRENT_PCB_WORKER_STARTUP_PCB_COMMAND_LIMIT, 20);
  assert.equal(CURRENT_PCB_WORKER_STARTUP_PCB_TOTAL_REQUEST_LIMIT, 64);
  assert.equal(CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT, 256);
  assert.ok(174 + 1 + CURRENT_PCB_WORKER_STARTUP_PCB_TOTAL_REQUEST_LIMIT < CURRENT_PCB_WORKER_STARTUP_REQUEST_LIMIT);
});

void test("late PCB opening reply is retained without reviving the deadline or invoking another dispatch", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const original = Promise.withResolvers<unknown>(), retained: CurrentPcbDiagnosticPcbOpeningResult[] = [];
  const pending = retainCurrentPcbWorkerStartupPcbOpeningReply(original.promise, target, "open-document", reply => { retained.push(reply); });
  const rejected = assert.rejects(pending, /deadline/u);
  context.mock.timers.tick(70_000); await rejected;
  assert.equal(retained.length, 0);
  const tabId = `${target.documentUuid}@${target.projectUuid}`;
  original.resolve({ result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.pcb-diagnostic-pcb-opening.v1",
    phase: "open-document", projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid,
    tabId, ok: true, status: "opened", failure: null, dispatchAttempted: true, publicResult: tabId,
    nativeWorkMayRemain: true, frameObserved: false, windowTabId: "original-window" }) } });
  await original.promise; await Promise.resolve();
  assert.equal(retained.length, 1); assert.equal(retained[0]?.dispatchAttempted, true);
  assert.equal(retained[0]?.executionAuthorized, false); assert.ok(Object.isFrozen(retained[0]));
  await assert.rejects(pending, /deadline/u);
});

void test("malformed late PCB replies do not publish outcome evidence or escape the original deadline", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const original = Promise.withResolvers<unknown>(); let retained = 0;
  const pending = retainCurrentPcbWorkerStartupPcbOpeningReply(original.promise, target, "open-document", () => { retained += 1; });
  const rejected = assert.rejects(pending, /deadline/u);
  context.mock.timers.tick(70_000); await rejected;
  original.resolve({ result: { type: "string", value: "{}" } });
  await original.promise; await Promise.resolve();
  assert.equal(retained, 0); await assert.rejects(pending, /deadline/u);
});
