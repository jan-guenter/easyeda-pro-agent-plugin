/* oxlint-disable import/max-dependencies -- The channel integration binds the original opening program, fixed loader/window bytes, native grammar and cumulative budget. */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { CurrentPcb209RatlineContinuationChannel } from "../src/current-pcb-209-ratline-continuation-channel.ts";
import type { CurrentPcb209RatlineContinuationChannelDependency, CurrentPcb209RatlineContinuationChannelNativeDependency } from "../src/current-pcb-209-ratline-continuation-channel.ts";
import { CurrentPcb209RatlineContinuationBudget, CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE as PROFILE } from "../src/current-pcb-209-ratline-continuation-budget.ts";
import type { CurrentPcbWorkerStartupParentCommand, CurrentPcbWorkerStartupWorkerCommand } from "../src/current-pcb-worker-startup-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "../src/current-pcb-worker-startup-contract.ts";
import { currentPcb209WorkerStartupNativeCases, currentPcbWorkerStartupNativeParentCases } from "../src/current-pcb-worker-startup-native.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY, CURRENT_PCB_WORKER_CONSTRUCTION_SAME } from "../src/current-pcb-worker-construction-contract.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION } from "../src/current-pcb-diagnostic-pcb-opening.ts";
import { CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_CASES } from "../src/current-pcb-209-ratline-continuation-native-cases.ts";

import { CURRENT_PCB_209_RATLINE_LOADER_SOURCE } from "../src/current-pcb-209-ratline-loader-pause.ts";

import { CURRENT_PCB_209_RATLINE_WINDOW_SOURCE, CURRENT_PCB_209_RATLINE_WINDOW_SOURCE_SHA256 } from "../src/current-pcb-209-ratline-window-pause.ts";

type Send = Readonly<Record<string, unknown>>;
function ordinaryReply(request: Send): Readonly<Record<string, unknown>> {
  return request["method"] === "Debugger.enable" ? { debuggerId: `debugger-${String(request["role"])}` } : {};
}
async function fixture(context: TestContext): Promise<Readonly<{
  channel: CurrentPcb209RatlineContinuationChannel; dependency: Awaited<ReturnType<CurrentPcb209RatlineContinuationChannel["start"]>>;
  budget: CurrentPcb209RatlineContinuationBudget; aborted: Promise<null>; requests: Send[]; frame: (value: unknown) => void;
  state: { terminated: boolean; parentEvents: number; startupEvents: number; ratlineEvents: number; lost: number;
    onSend: ((request: Send) => Promise<unknown>) | null };
}>> {
  const budget = new CurrentPcb209RatlineContinuationBudget(); for (let id = 1; id <= 3; id += 1) { budget.consumeDiscoveryRequest(id); } budget.closeDiscovery(4);
  const parent = Object.freeze({ targetId: "parent", sessionId: "parent-session", nextRequestId: 4 });
  const aborted = Promise.withResolvers<null>(), requests: Send[] = []; let queued = Buffer.alloc(0);
  const frame = (value: unknown): void => { queued = Buffer.concat([queued, Buffer.from(`${JSON.stringify(value)}\0`)]); };
  const state = { terminated: false, parentEvents: 0, startupEvents: 0, ratlineEvents: 0, lost: 0, onSend: null as ((request: Send) => Promise<unknown>) | null };
  const retained: { channel: CurrentPcb209RatlineContinuationChannel | null } = { channel: null };
  const native: CurrentPcb209RatlineContinuationChannelNativeDependency = {
    requireOriginalParent: (): Promise<typeof parent> => { assert.equal(state.terminated, false); return Promise.resolve(parent); },
    assertOriginalTermination: (): Promise<void> => { assert.equal(state.terminated, true); return Promise.resolve(); },
    observeOriginalParentEvent: (): void => { state.parentEvents += 1; },
    exchange: request => {
      if (request["action"] === "poll") {
        budget.consumePoll(); const bytes = queued.subarray(0, PROFILE.frames.chunk); queued = queued.subarray(bytes.length); budget.consumePipeBytes(bytes.length);
        return Promise.resolve({ bytes: bytes.toString("base64") });
      }
      budget.consumeHelperControl(request["action"] === "worker-startup-ratline-continuation-abort" || budget.snapshot().phase === "cleanup");
      requests.push(request);
      if (request["action"] === "worker-startup-ratline-continuation-abort") { aborted.resolve(null); return Promise.resolve({ aborted: true }); }
      const id = request["requestId"]; assert.equal(typeof id, "number"); assert.ok(typeof id === "number");
      assert.ok(retained.channel !== null); budget.consumeRequest(id, retained.channel.classifyPending(id));
      if (state.onSend !== null) { return state.onSend(request); }
      if (request["method"] === "Target.setAutoAttach" && request["action"] === "worker-startup-send") {
        frame({ method: "Target.attachedToTarget", sessionId: "parent-session", params: { sessionId: "project-session", waitingForDebugger: true,
          targetInfo: { targetId: "project-worker", type: "worker", attached: true, title: "project", url: "file:///project-worker.js" } } });
      }
      const result = request["method"] === "Debugger.setInstrumentationBreakpoint" ? { breakpointId: `instrument-${String(request["role"])}` } : ordinaryReply(request);
      frame({ id, sessionId: request["sessionId"], result }); return Promise.resolve({ written: true });
    },
  };
  const channel = new CurrentPcb209RatlineContinuationChannel(native, budget); retained.channel = channel; const dependency = await channel.start();
  dependency.subscribe((): void => { state.startupEvents += 1; });
  context.after(async (): Promise<void> => { state.terminated = true; if (!channel.status().released) { await channel.releaseAfterTermination(); } });
  return { channel, dependency, budget, aborted: aborted.promise, requests, frame, state };
}
const sessions = { pcb: "parent-session", worker: "ratline-session", subordinate: "subordinate-session" } as const;
type Fixture = Awaited<ReturnType<typeof fixture>>;
function opening(pcbOpening: boolean, phase: "preflight" | "open-project" | "open-document"): CurrentPcbWorkerStartupParentCommand {
  const command = currentPcbWorkerStartupNativeParentCases().find(value => value.method === "Runtime.callFunctionOn" && value.params.arguments.length === 2 &&
    value.params.arguments[1].value === phase && (value.params.functionDeclaration === CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION) === pcbOpening);
  assert.ok(command?.method === "Runtime.callFunctionOn"); return { ...command, sessionId: "parent-session" };
}
function projectIdentity(): Extract<CurrentPcbWorkerStartupWorkerCommand, { method: "Runtime.callFunctionOn" }> {
  const command = currentPcb209WorkerStartupNativeCases().find(value => value.method === "Runtime.callFunctionOn" &&
    value.params.functionDeclaration === CURRENT_PCB_WORKER_CONSTRUCTION_IDENTITY);
  assert.ok(command?.method === "Runtime.callFunctionOn"); return { ...command, sessionId: "project-session" };
}
async function prepare(f: Fixture): Promise<CurrentPcb209RatlineContinuationChannelDependency> {
  await f.dependency.request(opening(false, "preflight"));
  await f.dependency.request({ method: "Target.setAutoAttach", sessionId: "parent-session", params: CURRENT_PCB_WORKER_STARTUP_ATTACH });
  await f.dependency.request(opening(false, "open-project")); f.channel.beginPcbPreparation();
  await f.dependency.request(projectIdentity());
  await f.dependency.request(opening(true, "preflight")); const dependency = await f.channel.claimRatlineRouting();
  dependency.subscribe({ event: (): void => { f.state.ratlineEvents += 1; }, lost: (): void => { f.state.lost += 1; } }); return dependency;
}
async function arm(dependency: CurrentPcb209RatlineContinuationChannelDependency, role: "pcb" | "worker" | "subordinate"): Promise<void> {
  const sessionId = sessions[role];
  await dependency.request(role, { method: "Target.setAutoAttach", sessionId, params: CURRENT_PCB_WORKER_STARTUP_ATTACH });
  await dependency.request(role, { method: "Runtime.enable", sessionId, params: {} });
  await dependency.request(role, { method: "Debugger.enable", sessionId, params: { maxScriptsCacheSize: 33_554_432 } });
  await dependency.request(role, { method: "Debugger.setAsyncCallStackDepth", sessionId, params: { maxDepth: 1 } });
  await dependency.request(role, { method: "Debugger.setInstrumentationBreakpoint", sessionId, params: { instrumentation: "beforeScriptExecution" } });
}
function event(f: Fixture, sessionId: string, method: string, params: Record<string, unknown>): void { f.frame({ method, sessionId, params }); }

function respond(f: Fixture, request: Send): Promise<unknown> {
  let result: unknown = ordinaryReply(request);
  if (request["method"] === "Debugger.setInstrumentationBreakpoint") { result = { breakpointId: "same-native-instrumentation-id" }; }
  f.frame({ id: request["requestId"], sessionId: request["sessionId"], result });
  if (request["method"] === "Debugger.resume") { event(f, String(request["sessionId"]), "Debugger.resumed", {}); }
  return Promise.resolve({ written: true });
}
async function bootstrap(f: Fixture, dependency: CurrentPcb209RatlineContinuationChannelDependency, role: keyof typeof sessions): Promise<void> {
  const count = role === "pcb" ? 29 : 7, sessionId = sessions[role];
  for (let ordinal = 0; ordinal < count; ordinal += 1) {
    event(f, sessionId, "Debugger.paused", { reason: "instrumentation", hitBreakpoints: [] });
    await dependency.request(role, { method: "Debugger.getScriptSource", sessionId, params: { scriptId: `${role}-source-${String(ordinal)}` } });
    await dependency.request(role, { method: "Debugger.resume", sessionId, params: {} });
  }
}
async function attach(f: Fixture, dependency: CurrentPcb209RatlineContinuationChannelDependency, role: "pcb" | "worker"): Promise<void> {
  const childRole = role === "pcb" ? "worker" : "subordinate";
  event(f, sessions[role], "Target.attachedToTarget", { sessionId: sessions[childRole], waitingForDebugger: true,
    targetInfo: { targetId: `${childRole}-target`, type: "worker", attached: true, title: "pcb-ratline-worker", url: "https://client/editor?entry=pcb-ratline-worker.js" } });
  await dependency.requestParent({ method: "Page.getFrameTree", sessionId: "parent-session", params: {} });
  await arm(dependency, childRole);
  await dependency.request(role, { method: "Runtime.runIfWaitingForDebugger", sessionId: sessions[childRole], params: {} });
}
for (const finalReply of ["acknowledged", "lost"] as const) {
void test(`fresh channel retains original sources and permits only one terminal project identity: ${finalReply}`, async context => {
  const f = await fixture(context); const dependency = await prepare(f); const original = await dependency.requireOriginalParent();
  assert.equal(await dependency.requireOriginalParent(), original);
  f.state.onSend = (request): Promise<unknown> => respond(f, request);
  assert.throws(() => { f.channel.beginOriginalProjectIdentityReproof(); }, /PROJECT_IDENTITY_BOUNDARY/u);
  await arm(dependency, "pcb"); await dependency.requestParent(opening(true, "open-document"));
  await bootstrap(f, dependency, "pcb"); await attach(f, dependency, "pcb");
  await bootstrap(f, dependency, "worker"); await attach(f, dependency, "worker"); await bootstrap(f, dependency, "subordinate");
  assert.throws(() => { f.channel.beginOriginalProjectIdentityReproof(); }, /PROJECT_IDENTITY_BOUNDARY/u);
  for (const role of ["pcb", "worker", "subordinate"] as const) {
    await dependency.request(role, { method: "Debugger.removeBreakpoint", sessionId: sessions[role], params: { breakpointId: "same-native-instrumentation-id" } });
    await assert.rejects(dependency.request(role, { method: "Debugger.removeBreakpoint", sessionId: sessions[role], params: { breakpointId: "same-native-instrumentation-id" } }), /ORIGINAL_ALLOCATION/u);
  }
  for (const kind of ["pcb-source", "child-source", "subordinate-source"] as const) { assert.equal(f.budget.remainingRequests(kind), 0); }
  const before = f.requests.length;
  await assert.rejects(dependency.request("subordinate", { method: "Debugger.getScriptSource", sessionId: sessions.subordinate, params: { scriptId: "extra" } }), /SOURCE_SEQUENCE/u);
  await assert.rejects(dependency.request("subordinate", { method: "Debugger.resume", sessionId: sessions.subordinate, params: {} }), /RESUME_SEQUENCE/u);
  await assert.rejects(dependency.request("subordinate", { method: "Runtime.runIfWaitingForDebugger", sessionId: "fourth", params: {} }));
  const capture = CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_CASES.find(value => value.role === "worker" && value.phase === "object-this"); assert.ok(capture);
  await assert.rejects(dependency.request("subordinate", capture.command)); assert.equal(f.requests.length, before);
  assert.ok(f.requests.filter(request => request["role"] !== undefined).every(request => request["action"] === "worker-startup-ratline-continuation"));
  f.channel.beginOriginalProjectIdentityReproof(); const beforeIdentity = f.requests.length, identity = projectIdentity();
  await assert.rejects(f.dependency.request({ ...identity, sessionId: sessions.worker }), /WORKER_SESSION/u);
  for (const changed of [{ ...identity, params: { ...identity.params, objectId: "foreign-receiver" } },
    { ...identity, params: { ...identity.params, arguments: [{ objectId: "foreign-bus" }] } },
    { ...identity, params: { ...identity.params, functionDeclaration: CURRENT_PCB_WORKER_CONSTRUCTION_SAME } }]) {
    await assert.rejects(f.dependency.request(changed), /PROJECT_IDENTITY_TUPLE/u);
  }
  assert.equal(f.requests.length, beforeIdentity);
  if (finalReply === "lost") { f.state.onSend = (): Promise<unknown> => Promise.reject(new Error("synthetic terminal identity lost write acknowledgment")); }
  const final = f.dependency.request(identity);
  if (finalReply === "lost") { await assert.rejects(final); f.state.onSend = (request): Promise<unknown> => respond(f, request); }
  else { await final; }
  assert.equal(f.requests.length, beforeIdentity + 1);
  assert.equal(f.requests.at(-1)?.["startupPhase"], "identity");
  await assert.rejects(f.dependency.request(identity));
  assert.throws(() => { f.channel.beginOriginalProjectIdentityReproof(); }, /PROJECT_IDENTITY_CONSUMED/u);
  assert.equal(f.requests.length, beforeIdentity + 1);
  if (finalReply === "lost") {
    await f.dependency.request({ method: "Runtime.releaseObjectGroup", sessionId: identity.sessionId, params: { objectGroup: identity.params.objectGroup } });
    const abortIndex = f.requests.findIndex(request => request["action"] === "worker-startup-ratline-continuation-abort");
    assert.ok(abortIndex >= beforeIdentity + 1 && f.requests[abortIndex + 1]?.["startupPhase"] === "release");
  }
  await f.channel.beginCleanup(); assert.equal(f.requests.filter(request => request["action"] === "worker-startup-ratline-continuation-abort").length, 1);
});
}
void test("fresh channel rejects cross-session source and cleanup handles before native dispatch", async context => {
  const f = await fixture(context); const dependency = await prepare(f); f.state.onSend = (request): Promise<unknown> => respond(f, request);
  await arm(dependency, "pcb"); await dependency.requestParent(opening(true, "open-document")); await bootstrap(f, dependency, "pcb");
  await attach(f, dependency, "pcb"); const before = f.requests.length;
  await assert.rejects(dependency.request("worker", { method: "Debugger.getScriptSource", sessionId: sessions.pcb, params: { scriptId: "foreign" } }), /RATLINE_SESSION/u);
  await assert.rejects(dependency.request("worker", { method: "Debugger.removeBreakpoint", sessionId: sessions.pcb, params: { breakpointId: "same-native-instrumentation-id" } }), /RATLINE_SESSION/u);
  assert.equal(f.requests.length, before);
});

const windowSource = (stage: "initial" | "document"): Readonly<{ method: "Debugger.getScriptSource"; sessionId: string; windowPhase: "initial-source" | "document-source"; params: Readonly<{ scriptId: string }> }> =>
  ({ method: "Debugger.getScriptSource", sessionId: "parent-session", windowPhase: `${stage}-source`, params: { scriptId: `window-${stage}` } });
const windowResume = (stage: "initial" | "document"): Readonly<{ method: "Debugger.resume"; sessionId: string; windowPhase: "initial-resume" | "document-resume"; params: Readonly<Record<string, never>> }> =>
  ({ method: "Debugger.resume", sessionId: "parent-session", windowPhase: `${stage}-resume`, params: {} });
async function beginWindowNavigation(f: Fixture, dependency: CurrentPcb209RatlineContinuationChannelDependency): Promise<Readonly<{
  openingRequest: Send; openingWork: Promise<unknown>; initialResumeIssued: Promise<Send>; documentResumeIssued: Promise<Send>;
}>> {
  const documentResumeIssued = Promise.withResolvers<Send>(), initialResumeIssued = Promise.withResolvers<Send>(), openingIssued = Promise.withResolvers<Send>();
  const pause = (scriptId: string, frames: number): void => {
    if (scriptId.startsWith("window-")) {
      event(f, "parent-session", "Debugger.scriptParsed", { scriptId, executionContextId: scriptId === "window-initial" ? 2 : 3,
        url: "", hasSourceURL: false, isLiveEdit: false, isModule: false, startLine: 0, startColumn: 0, endLine: 0, endColumn: 6,
        length: 6, hash: CURRENT_PCB_209_RATLINE_WINDOW_SOURCE_SHA256, scriptLanguage: "JavaScript", sourceMapURL: "" });
    }
    event(f, "parent-session", "Debugger.paused", { reason: "instrumentation", data: { scriptId }, hitBreakpoints: [],
      callFrames: Array.from({ length: frames }, (_, index) => ({ location: { scriptId: index === 0 ? scriptId : "ui" } })) });
  };
  f.state.onSend = (request): Promise<unknown> => {
    const phase = request["phase"];
    if (request["parentPhase"] === "pcb-open-document") { openingIssued.resolve(request); return Promise.resolve({ written: true }); }
    if (phase === "window-initial-resume") { initialResumeIssued.resolve(request); }
    else if (phase === "window-document-resume") { documentResumeIssued.resolve(request); }
    else {
      let result: unknown = {};
      if (phase === "navigation-source") { result = { scriptSource: `(${CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION})` }; }
      else if (phase === "loader-source") { result = { scriptSource: CURRENT_PCB_209_RATLINE_LOADER_SOURCE }; }
      else if (phase === "window-initial-source" || phase === "window-document-source") { result = { scriptSource: CURRENT_PCB_209_RATLINE_WINDOW_SOURCE }; }
      f.frame({ id: request["requestId"], sessionId: request["sessionId"], result });
    }
    if (request["method"] === "Debugger.resume") { event(f, "parent-session", "Debugger.resumed", {}); }
    if (phase === "navigation-resume") { pause("loader", 3); }
    else if (phase === "loader-resume") { pause("window-initial", 6); }
    else if (phase === "window-initial-resume") { pause("window-document", 1); }
    else if (phase === "window-document-resume") { pause("pcb-bootstrap", 1); }
    return Promise.resolve({ written: true });
  };
  const openingWork = dependency.requestParent(opening(true, "open-document")); const openingRequest = await openingIssued.promise;
  pause("nav-script", 1);
  await dependency.requestParent({ method: "Page.getFrameTree", sessionId: "parent-session", params: {} });
  await dependency.request("pcb", { method: "Debugger.getScriptSource", sessionId: "parent-session", navigationPhase: "source", params: { scriptId: "nav-script" } });
  await dependency.request("pcb", { method: "Debugger.resume", sessionId: "parent-session", navigationPhase: "resume", params: {} });
  await dependency.request("pcb", { method: "Debugger.getScriptSource", sessionId: "parent-session", loaderPhase: "source", params: { scriptId: "loader" } });
  await dependency.request("pcb", { method: "Debugger.resume", sessionId: "parent-session", loaderPhase: "resume", params: {} });
  return { openingRequest, openingWork, initialResumeIssued: initialResumeIssued.promise, documentResumeIssued: documentResumeIssued.promise };
}
void test("window stages retain separate sources, require prior resume acknowledgment and refuse replay or ordinary aliases", async context => {
  const f = await fixture(context); const dependency = await prepare(f); await arm(dependency, "pcb");
  const held = await beginWindowNavigation(f, dependency); const plain = { method: "Debugger.resume", sessionId: "parent-session", params: {} } as const;
  const before = f.requests.length;
  await assert.rejects(dependency.request("pcb", windowSource("document")), /WINDOW_SEQUENCE/u);
  await assert.rejects(dependency.request("pcb", { method: "Debugger.getScriptSource", sessionId: "parent-session", params: { scriptId: "window-initial" } }), /WINDOW|SOURCE_SEQUENCE/u);
  await assert.rejects(dependency.request("pcb", { ...windowSource("initial"), params: { scriptId: "foreign" } }), /WINDOW_SEQUENCE/u);
  await assert.rejects(dependency.request("pcb", windowResume("initial")), /WINDOW_SEQUENCE/u);
  await assert.rejects(dependency.request("pcb", plain), /RESUME_SEQUENCE/u); assert.equal(f.requests.length, before);
  await dependency.request("pcb", windowSource("initial"));
  await assert.rejects(dependency.request("pcb", windowSource("initial")), /WINDOW_SEQUENCE/u);
  await assert.rejects(dependency.request("pcb", plain), /RESUME_SEQUENCE/u);
  const resumed = dependency.request("pcb", windowResume("initial")); const original = await held.initialResumeIssued;
  await dependency.requestParent({ method: "Page.getFrameTree", sessionId: "parent-session", params: {} });
  const awaitingAck = f.requests.length;
  await assert.rejects(dependency.request("pcb", windowSource("document")), /WINDOW_SEQUENCE/u);
  assert.equal(f.requests.length, awaitingAck);
  f.frame({ id: original["requestId"], sessionId: "parent-session", result: {} }); await resumed;
  await assert.rejects(dependency.request("pcb", windowResume("initial")), /WINDOW_SEQUENCE/u);
  const beforeDocument = f.requests.length;
  await assert.rejects(dependency.request("pcb", { method: "Debugger.getScriptSource", sessionId: "parent-session", params: { scriptId: "window-document" } }), /WINDOW|SOURCE_SEQUENCE/u);
  assert.equal(f.requests.length, beforeDocument);
  await dependency.request("pcb", windowSource("document"));
  await assert.rejects(dependency.request("pcb", windowSource("document")), /WINDOW_SEQUENCE/u);
  await assert.rejects(dependency.request("pcb", plain), /RESUME_SEQUENCE/u);
  const documentResume = dependency.request("pcb", windowResume("document")); const documentRequest = await held.documentResumeIssued;
  await dependency.requestParent({ method: "Page.getFrameTree", sessionId: "parent-session", params: {} });
  const awaitingDocumentAck = f.requests.length;
  await assert.rejects(dependency.request("pcb", { method: "Debugger.getScriptSource", sessionId: "parent-session", params: { scriptId: "pcb-bootstrap" } }), /WINDOW_SEQUENCE/u);
  assert.equal(f.requests.length, awaitingDocumentAck); assert.equal(f.budget.remainingRequests("pcb-source"), 29);
  f.frame({ id: documentRequest["requestId"], sessionId: "parent-session", result: {} }); await documentResume;
  await assert.rejects(dependency.request("pcb", windowResume("document")), /WINDOW_SEQUENCE/u);
  assert.equal(f.budget.remainingRequests("initial-window"), 0); assert.equal(f.budget.remainingRequests("document-window"), 0);
  assert.equal(f.budget.remainingRequests("pcb-source"), 29);
  await dependency.request("pcb", { method: "Debugger.getScriptSource", sessionId: "parent-session", params: { scriptId: "pcb-bootstrap" } });
  assert.equal(f.budget.remainingRequests("pcb-source"), 28);
  f.frame({ id: held.openingRequest["requestId"], sessionId: "parent-session", result: {} }); await held.openingWork;
});
void test("changed window bytes consume only their own read and cannot dispatch any resume", async context => {
  for (const stage of ["initial", "document"] as const) {
    const f = await fixture(context); const dependency = await prepare(f); await arm(dependency, "pcb");
    const held = await beginWindowNavigation(f, dependency);
    if (stage === "document") {
      await dependency.request("pcb", windowSource("initial"));
      const resumed = dependency.request("pcb", windowResume("initial")); const original = await held.initialResumeIssued;
      f.frame({ id: original["requestId"], sessionId: "parent-session", result: {} }); await resumed;
    }
    const openingRejected = assert.rejects(held.openingWork);
    f.state.onSend = (request): Promise<unknown> => {
      f.frame({ id: request["requestId"], sessionId: request["sessionId"], result: { scriptSource: `${CURRENT_PCB_209_RATLINE_WINDOW_SOURCE}\n` } });
      return Promise.resolve({ written: true });
    };
    await assert.rejects(dependency.request("pcb", windowSource(stage))); const consumed = f.requests.length;
    await assert.rejects(dependency.request("pcb", windowSource(stage))); await assert.rejects(dependency.request("pcb", windowResume(stage)));
    await assert.rejects(dependency.request("pcb", { method: "Debugger.resume", sessionId: "parent-session", params: {} }));
    assert.equal(f.requests.length, consumed); assert.equal(f.budget.remainingRequests(stage === "initial" ? "initial-window" : "document-window"), 1);
    assert.equal(f.budget.remainingRequests("pcb-source"), 29); await openingRejected;
  }
});
