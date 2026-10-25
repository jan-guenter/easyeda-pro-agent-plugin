/** Actual coordinator/opening/context/channel callbacks with a synthetic native
 * peer. Only the preceding worker construction/source proof is substituted;
 * these checks establish neither connected startup nor the29+7source chain. */
/* oxlint-disable import/max-dependencies -- This boundary test joins the actual original-opening, context, channel and coordinator owners. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CurrentPcbDiagnosticContext } from "../src/current-pcb-diagnostic-context.ts";
import type { CurrentPcbWorkerStartupOpeningBinding } from "../src/current-pcb-diagnostic-owner.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "../src/current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerStartupDependency } from "../src/current-pcb-worker-startup-contract.ts";
import { CurrentPcb209RatlineStartupChannel } from "../src/current-pcb-209-ratline-startup-channel.ts";
import type { CurrentPcb209RatlineStartupNativeDependency } from "../src/current-pcb-209-ratline-startup-channel.ts";
import { CurrentPcb209RatlineBudget } from "../src/current-pcb-209-ratline-budget.ts";
import type { CurrentPcb209WorkerStartupOpening, CurrentPcb209WorkerStartupOpeningResult } from "../src/current-pcb-209-worker-startup-opening.ts";
import type { CurrentPcb209RatlineNativeSession } from "../src/current-pcb-209-ratline-native-session.ts";

const rawWindowsPath = String.raw`C:\Disposable\NativeSession.eprj2`; const base = "https://client/editor?cll=warn";
const projectUuid = createHash("sha256").update(rawWindowsPath).digest("hex"); const projectUrl = `${base}#id=${projectUuid}`;
const target = Object.freeze({ rawWindowsPath, projectUuid, branchUuid: "b".repeat(32), documentUuid: "d".repeat(16), expectedSourceSha256: "c".repeat(64) });
const uiSource = "const syntheticUi = true;"; const sessionId = "parent-session";
const page = { targetId: "parent", type: "page", title: "EasyEDA - V3.2.209", url: `${base}#`, attached: false };
const root = { id: "root", loaderId: "root-loader", url: base, securityOrigin: "https://client", urlFragment: "#" };
const sourceQualification = Object.freeze({ syntheticSourceQualification: true });
const construction = Object.freeze({ syntheticConstruction: true });
const workerIdentity = Object.freeze({ projectUuid, branchUuid: target.branchUuid, windowTabId: "window" });
function originalContext(): CurrentPcbDiagnosticContext {
  const context = new CurrentPcbDiagnosticContext("parent"); context.selectTarget({ targetInfos: [page] }); context.bindSession(sessionId);
  context.observeFrames({ frameTree: { frame: root } }); context.selectFrame("root", { family: "ui", relativePath: "pro-ui/fixture/js/ui.js",
    scriptBytes: Buffer.byteLength(uiSource), scriptSha256: createHash("sha256").update(uiSource).digest("hex") });
  context.observeEvent({ sessionId, method: "Runtime.executionContextCreated", params: { context: { id: 1, uniqueId: "ui-context", origin: "https://client",
    name: "", auxData: { frameId: "root", isDefault: true, type: "default" } } } });
  context.observeEvent({ sessionId, method: "Debugger.scriptParsed", params: { scriptId: "ui-script", executionContextId: 1,
    url: "https://client/pro-ui/fixture/js/ui.js", hasSourceURL: false } });
  context.finish({ scriptSource: uiSource }, { targetInfos: [{ ...page, attached: true }] }, { frameTree: { frame: root } }); return context;
}
async function loadModule(file: string, replace: (name: string) => unknown): Promise<Record<string, unknown>> {
  const path = new URL(`../src/${file}`, import.meta.url); const actualRequire = createRequire(path);
  const transformed = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const execute: unknown = runInThisContext(`(function(require,module,exports){${transformed.code}\n})`); assert.ok(typeof execute === "function");
  Reflect.apply(execute, undefined, [(name: string): unknown => replace(name) ?? actualRequire(name) as unknown, loaded, loaded.exports]); return loaded.exports;
}
/** This substitute owns no source authority. The actual opening still retains
 * and rejects copied results/dependencies using its unchanged private fields. */
class SyntheticConstructionTransport {
  readonly #dependency: CurrentPcbWorkerStartupDependency;
  #armed: Promise<unknown> | null = null;
  #unsubscribe: (() => void) | null = null;
  public constructor(dependency: CurrentPcbWorkerStartupDependency) { this.#dependency = dependency; }
  public bindExpectedProject(value: unknown): void { assert.equal(this.#armed, null); assert.deepEqual(value, workerIdentity); }
  public bindExistingWorkers(value: unknown): void { assert.equal(this.#armed, null); assert.ok(value !== null); }
  public capture(): Promise<typeof construction> {
    this.#unsubscribe = this.#dependency.subscribe((): void => {
      // Synthetic worker never emits source events.
    });
    this.#armed = this.#dependency.request({ method: "Target.setAutoAttach", sessionId, params: CURRENT_PCB_WORKER_STARTUP_ATTACH });
    return Promise.resolve(construction);
  }
  public async whenArmed(): Promise<void> { assert.ok(this.#armed !== null); await this.#armed; }
  public requireOriginal(value: unknown): Promise<Readonly<{ proveProjectIdentity: () => Promise<typeof workerIdentity>;
    requireProjectIdentity: (packet: unknown, identity: unknown) => Promise<void> }>> {
    assert.ok(this.#armed !== null); assert.equal(value, construction); return Promise.resolve(Object.freeze({ proveProjectIdentity: (): Promise<typeof workerIdentity> => Promise.resolve(workerIdentity),
      requireProjectIdentity: (packet: unknown, identity: unknown): Promise<void> => {
        assert.equal(packet, construction); assert.equal(identity, workerIdentity); return Promise.resolve();
      } }));
  }
  public async abort(): Promise<void> { await this.#armed; }
  public async releaseAfterTermination(): Promise<void> { await this.#dependency.assertOriginalTermination(); this.#unsubscribe?.(); }
}
function projectReply(phase: string): unknown {
  const opened = phase === "open-project";
  return { result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.pcb-diagnostic-opening.v1", phase,
    projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid, ok: true,
    status: opened ? "opened-prefix-observed" : "ready", failure: null, cleanupFailure: null,
    dispatchAttempted: opened, publicResult: opened ? true : null, prefixObserved: opened, nativeWorkMayRemain: opened,
    observation: { projectPresent: opened, branchUuid: opened ? target.branchUuid : null, windowTabId: "window", containerCount: 1,
      tabIds: [], activeTabId: "tab_page1", initialTitle: "EasyEDA - V3.2.209", expectedOpenedTitle: "EasyEDA - V3.2.209", documentTitle: "EasyEDA - V3.2.209" } }) } };
}
function pcbReply(): unknown {
  return { result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.pcb-diagnostic-pcb-opening.v1", phase: "preflight",
    projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid, tabId: `${target.documentUuid}@${projectUuid}`,
    ok: true, status: "ready", failure: null, dispatchAttempted: false, publicResult: null, nativeWorkMayRemain: false,
    frameObserved: false, windowTabId: "window" }) } };
}
async function fixture(t: TestContext, fixtureOptions: Readonly<{ syntheticCheckpoint?: boolean }> = {}): Promise<Readonly<{
  create: (options?: Readonly<{ copyResult?: boolean; copyDependency?: boolean }>) => CurrentPcb209RatlineNativeSession;
  channel: CurrentPcb209RatlineStartupChannel; nativeRequests: Record<string, unknown>[];
  state: { terminated: boolean; checkpointCalls: number }; terminate: () => Promise<void>;
}>> {
  const context = originalContext(); const budget = new CurrentPcb209RatlineBudget(); budget.consumeDiscoveryRequest(1); budget.closeDiscovery(2);
  const parent = Object.freeze({ targetId: "parent", sessionId, nextRequestId: 2 });
  const state = { terminated: false, checkpointCalls: 0 }; const nativeRequests: Record<string, unknown>[] = [];
  let opened = false; let queued = Buffer.alloc(0); let channel: CurrentPcb209RatlineStartupChannel | null = null;
  const frame = (value: unknown): void => { queued = Buffer.concat([queued, Buffer.from(`${JSON.stringify(value)}\0`)]); };
  const native = Object.freeze<CurrentPcb209RatlineStartupNativeDependency>({
    requireOriginalParent: (): Promise<typeof parent> => { assert.equal(state.terminated, false); return Promise.resolve(parent); },
    assertOriginalTermination: (): Promise<void> => { assert.equal(state.terminated, true); return Promise.resolve(); },
    observeOriginalParentEvent: (event): void => { context.observeEvent(event); },
    exchange: request => {
      if (request["action"] === "poll") {
        budget.consumePoll(); const bytes = queued; queued = Buffer.alloc(0); budget.consumePipeBytes(bytes.length);
        return Promise.resolve({ bytes: bytes.toString("base64") });
      }
      budget.consumeHelperControl(); nativeRequests.push({ ...request });
      if (request["action"] === "worker-startup-ratline-abort") { return Promise.resolve({ aborted: true }); }
      const id = request["requestId"]; assert.ok(typeof id === "number" && channel !== null); budget.consumeRequest(id, channel.classifyPending(id));
      let result: unknown = {};
      if (request["method"] === "Debugger.enable") { result = { debuggerId: "retained-debugger", unexpected: true }; }
      if (request["method"] === "Target.getTargets") { result = { targetInfos: [{ ...page, attached: true, url: opened ? projectUrl : page.url }] }; }
      else if (request["method"] === "Page.getFrameTree") { result = { frameTree: { frame: { ...root, urlFragment: opened ? `#id=${projectUuid}` : "#" } } }; }
      else if (request["method"] === "Runtime.callFunctionOn") {
        if (request["parentPhase"] === "pcb-preflight") { result = pcbReply(); }
        else {
          const phase = request["parentPhase"]; assert.ok(phase === "preflight" || phase === "open-project");
          if (phase === "open-project") { opened = true; frame({ sessionId, method: "Page.navigatedWithinDocument",
            params: { frameId: "root", url: projectUrl, navigationType: "fragment" } }); }
          result = projectReply(phase);
        }
      }
      frame({ id, sessionId: request["sessionId"], result }); return Promise.resolve({ written: true });
    },
  });
  channel = new CurrentPcb209RatlineStartupChannel(native, budget); const originalChannel = channel; const dependency = await channel.start();
  t.after(async (): Promise<void> => {
    if (!originalChannel.status().released) { state.terminated = true; await originalChannel.releaseAfterTermination(); }
  });
  const binding = Object.freeze<CurrentPcbWorkerStartupOpeningBinding>({ context: () => context.openingContext(),
    reprove: (): Promise<void> => { context.assertCurrent(); return Promise.resolve(); },
    begin: input => context.beginOpeningTransition(input.projectUuid), finish: (targets, frames): void => { context.finishOpeningTransition(targets, frames); },
    observeParent: (targets, frames): void => { context.observeTarget(targets); context.observeFrames(frames); },
    ancillaryFrame: (): null => null, observeAncillary: (): never => assert.fail("No ancillary frame"), ancillaryObservation: (): null => null });
  const openingModule = await loadModule("current-pcb-209-worker-startup-opening.ts", name => {
    if (name === "./current-pcb-worker-startup-transport.ts") { return { CurrentPcb209WorkerStartupTransport: SyntheticConstructionTransport }; }
    if (name === "./current-pcb-209-actor-clock-source.ts") {
      return { requireCurrentPcb209ActorClockSourceQualification: (value: unknown): void => { assert.equal(value, sourceQualification); } };
    }
    return null;
  });
  const Opening = openingModule["CurrentPcb209WorkerStartupOpening"]; assert.ok(typeof Opening === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual opening source, with only explicitly labeled construction/source dependencies substituted above.
  const opening = Reflect.construct(Opening, [{ dependency, opening: binding, actorClockSourceQualification: sourceQualification }]) as CurrentPcb209WorkerStartupOpening;
  const result = await opening.open(target, (): Promise<void> => Promise.resolve());
  const inventory = Object.freeze({ syntheticCompletedInventory: true });
  const completion = Object.freeze({ observedChildClose: true, exitCode: 0, exitSignal: null });
  const sessionModule = await loadModule("current-pcb-209-ratline-native-session.ts", name => {
    if (name === "./current-pcb-209-worker-startup-opening.ts") { return openingModule; }
    // Only this explicitly selected fixture substitutes SQL completion. The
    // Actual native session, channel, context router and source owner execute.
    if (fixtureOptions.syntheticCheckpoint === true && name === "./sqlite-inventory.ts") {
      return { readerCompletion: (value: unknown): typeof completion => { assert.equal(value, inventory); return completion; } };
    }
    return null;
  });
  const Session = sessionModule["CurrentPcb209RatlineNativeSession"]; assert.ok(typeof Session === "function");
  const sessions: CurrentPcb209RatlineNativeSession[] = [];
  const terminate = async (): Promise<void> => {
    state.terminated = true;
    for (const session of sessions) { if (session.status().phase !== "released") { await session.abort(); await session.releaseAfterTermination(); } }
    await opening.releaseAfterTermination(); await originalChannel.releaseAfterTermination();
  };
  const checkpoint = (): typeof inventory => { state.checkpointCalls += 1;
    if (fixtureOptions.syntheticCheckpoint === true) { return inventory; } throw new Error("SYNTHETIC_CHECKPOINT_CHANGED"); };
  return { channel: originalChannel, nativeRequests, state, terminate,
    create: (options = {}): CurrentPcb209RatlineNativeSession => {
      const selectedResult: CurrentPcb209WorkerStartupOpeningResult = options.copyResult === true ? Object.freeze({ ...result }) : result;
      const selectedDependency = options.copyDependency === true ? Object.freeze({ ...dependency }) : dependency;
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Unchanged actual session constructor uses the actual opening class loaded in the same fixture.
      const session = Reflect.construct(Session, [opening, selectedResult, selectedDependency, originalChannel, context, target, checkpoint]) as CurrentPcb209RatlineNativeSession;
      sessions.push(session); return session;
    } };
}

void test("native session abort from ready consumes native abort once and retains original termination before release", async t => {
  const f = await fixture(t); const session = f.create(); const before = f.nativeRequests.length;
  assert.equal(session.status().phase, "ready"); const first = session.abort(); assert.equal(session.abort(), first); await first;
  assert.deepEqual(f.nativeRequests.slice(before).map(request => request["action"]), ["worker-startup-ratline-abort"]);
  assert.equal(f.state.checkpointCalls, 0); assert.equal(session.status().transitionStarted, false);
  await assert.rejects(session.captureFirstChildHeld(), /CONSUMED/u); await assert.rejects(session.releaseAfterTermination());
  assert.equal(session.status().phase, "cleanup"); await f.terminate(); assert.equal(session.status().phase, "released");
});
void test("native session rejects copied original opening result and dependency before any PCB request", async t => {
  for (const options of [{ copyResult: true }, { copyDependency: true }]) {
    const f = await fixture(t); const session = f.create(options); const before = f.nativeRequests.length;
    await assert.rejects(session.captureFirstChildHeld(), options.copyResult === true ? /ORIGINAL_RESULT/u : /ORIGINAL_PCB_DEPENDENCY/u);
    assert.deepEqual(f.nativeRequests.slice(before).map(request => request["action"]), ["worker-startup-ratline-abort"]);
    assert.equal(session.status().transitionStarted, false); assert.equal(session.status().packetRetained, false);
    assert.equal(f.state.checkpointCalls, 0); await f.terminate();
  }
});
void test("native session original opening reaches fixed PCB preflight then changed checkpoint refuses all navigation and source arming", async t => {
  const f = await fixture(t); const session = f.create(); const before = f.nativeRequests.length;
  await assert.rejects(session.captureFirstChildHeld(), /SYNTHETIC_CHECKPOINT_CHANGED/u);
  const requests = f.nativeRequests.slice(before);
  assert.deepEqual(requests.map(request => request["method"] ?? request["action"]),
    ["Target.getTargets", "Page.getFrameTree", "Runtime.callFunctionOn", "worker-startup-ratline-abort"]);
  assert.equal(requests[2]?.["parentPhase"], "pcb-preflight"); assert.equal(f.state.checkpointCalls, 1);
  assert.equal(session.status().transitionStarted, false); assert.equal(session.status().packetRetained, false);
  assert.equal(session.retainedOpeningObservation(), null);
  const failure = session.status().firstFailure;
  assert.deepEqual(failure, { reason: "UNCLASSIFIED", phase: "preparation", step: "checkpoint-reverification" });
  assert.equal(session.status().pcbContext, null); assert.equal(session.status().childSource, null); assert.equal(session.status().composite, null);
  await f.terminate(); assert.equal(session.status().firstFailure, failure);
});

void test("actual native session inspection retains nested PCB source failure before cleanup and after original release", async t => {
  const f = await fixture(t, { syntheticCheckpoint: true }); const session = f.create();
  // The synthetic peer returns the debugger ID plus an unexpected field.
  // Actual strict source parsing must refuse it before instrumentation/navigation.
  await assert.rejects(session.captureFirstChildHeld());
  const state = session.status(); assert.equal(state.firstFailure?.reason, "SCHEMA"); assert.equal(state.firstFailure.step, "pcb-source-arming");
  assert.equal(state.transitionStarted, false); assert.ok(state.pcbContext !== null);
  const sourceState = state.pcbContext["sourceOwner"]; assert.ok(sourceState !== null && typeof sourceState === "object");
  const sourceFailure: unknown = Reflect.get(sourceState, "firstFailure"); assert.ok(sourceFailure !== null && typeof sourceFailure === "object");
  assert.equal(Reflect.get(sourceFailure, "reason"), "SCHEMA"); assert.equal(Reflect.get(sourceFailure, "lastCommand"), "Debugger.enable");
  assert.equal(f.nativeRequests.some(request => request["method"] === "Debugger.setInstrumentationBreakpoint"), false);
  assert.equal(f.nativeRequests.some(request => request["parentPhase"] === "pcb-open-document"), false);
  await f.terminate(); assert.equal(session.status().firstFailure, state.firstFailure);
  assert.equal(session.status().pcbContext?.["firstFailure"], state.pcbContext["firstFailure"]);
});
