import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { CurrentPcb209RatlineStartupChannel } from "../src/current-pcb-209-ratline-startup-channel.ts";
import type { CurrentPcb209RatlineStartupDependency, CurrentPcb209RatlineStartupNativeDependency } from "../src/current-pcb-209-ratline-startup-channel.ts";
import { CurrentPcb209RatlineBudget, CURRENT_PCB_209_RATLINE_NATIVE_PROFILE as PROFILE } from "../src/current-pcb-209-ratline-budget.ts";
import type { CurrentPcbWorkerStartupParentCommand } from "../src/current-pcb-worker-startup-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "../src/current-pcb-worker-startup-contract.ts";
import { currentPcbWorkerStartupNativeParentCases } from "../src/current-pcb-worker-startup-native.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION } from "../src/current-pcb-diagnostic-pcb-opening.ts";
import { CURRENT_PCB_209_RATLINE_NATIVE_CASES } from "../src/current-pcb-209-ratline-native-cases.ts";
import type { CurrentPcb209RatlineOriginCommand } from "../src/current-pcb-209-ratline-origin.ts";

type Send = Readonly<Record<string, unknown>>;
function ordinaryReply(request: Send): Readonly<Record<string, unknown>> {
  return request["method"] === "Debugger.enable" ? { debuggerId: `debugger-${String(request["role"])}` } : {};
}
async function fixture(context: TestContext): Promise<Readonly<{
  channel: CurrentPcb209RatlineStartupChannel; dependency: Awaited<ReturnType<CurrentPcb209RatlineStartupChannel["start"]>>;
  budget: CurrentPcb209RatlineBudget; aborted: Promise<null>; requests: Send[]; frame: (value: unknown) => void;
  state: { terminated: boolean; parentEvents: number; startupEvents: number; ratlineEvents: number; lost: number;
    onSend: ((request: Send) => Promise<unknown>) | null };
}>> {
  const budget = new CurrentPcb209RatlineBudget(); for (let id = 1; id <= 3; id += 1) { budget.consumeDiscoveryRequest(id); } budget.closeDiscovery(4);
  const parent = Object.freeze({ targetId: "parent", sessionId: "parent-session", nextRequestId: 4 });
  const aborted = Promise.withResolvers<null>(), requests: Send[] = []; let queued = Buffer.alloc(0);
  const frame = (value: unknown): void => { queued = Buffer.concat([queued, Buffer.from(`${JSON.stringify(value)}\0`)]); };
  const state = { terminated: false, parentEvents: 0, startupEvents: 0, ratlineEvents: 0, lost: 0, onSend: null as ((request: Send) => Promise<unknown>) | null };
  const retained: { channel: CurrentPcb209RatlineStartupChannel | null } = { channel: null };
  const native: CurrentPcb209RatlineStartupNativeDependency = {
    requireOriginalParent: (): Promise<typeof parent> => { assert.equal(state.terminated, false); return Promise.resolve(parent); },
    assertOriginalTermination: (): Promise<void> => { assert.equal(state.terminated, true); return Promise.resolve(); },
    observeOriginalParentEvent: (): void => { state.parentEvents += 1; },
    exchange: request => {
      if (request["action"] === "poll") {
        budget.consumePoll(); const bytes = queued.subarray(0, PROFILE.frames.chunk); queued = queued.subarray(bytes.length); budget.consumePipeBytes(bytes.length);
        return Promise.resolve({ bytes: bytes.toString("base64") });
      }
      budget.consumeHelperControl(request["action"] === "worker-startup-ratline-abort" || budget.snapshot().phase === "cleanup");
      requests.push(request);
      if (request["action"] === "worker-startup-ratline-abort") { aborted.resolve(null); return Promise.resolve({ aborted: true }); }
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
  const channel = new CurrentPcb209RatlineStartupChannel(native, budget); retained.channel = channel; const dependency = await channel.start();
  dependency.subscribe((): void => { state.startupEvents += 1; });
  context.after(async (): Promise<void> => { state.terminated = true; if (!channel.status().released) { await channel.releaseAfterTermination(); } });
  return { channel, dependency, budget, aborted: aborted.promise, requests, frame, state };
}
type Fixture = Awaited<ReturnType<typeof fixture>>;
function opening(pcbOpening: boolean, phase: "preflight" | "open-project" | "open-document"): CurrentPcbWorkerStartupParentCommand {
  const command = currentPcbWorkerStartupNativeParentCases().find(value => value.method === "Runtime.callFunctionOn" && value.params.arguments.length === 2 &&
    value.params.arguments[1].value === phase && (value.params.functionDeclaration === CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION) === pcbOpening);
  assert.ok(command?.method === "Runtime.callFunctionOn"); return { ...command, sessionId: "parent-session" };
}
async function prepare(f: Fixture): Promise<CurrentPcb209RatlineStartupDependency> {
  await f.dependency.request(opening(false, "preflight"));
  await f.dependency.request({ method: "Target.setAutoAttach", sessionId: "parent-session", params: CURRENT_PCB_WORKER_STARTUP_ATTACH });
  await f.dependency.request(opening(false, "open-project")); f.channel.beginPcbPreparation();
  await f.dependency.request(opening(true, "preflight")); const dependency = await f.channel.claimRatlineRouting();
  dependency.subscribe({ event: (): void => { f.state.ratlineEvents += 1; }, lost: (): void => { f.state.lost += 1; } }); return dependency;
}
async function arm(dependency: CurrentPcb209RatlineStartupDependency, role: "pcb" | "worker"): Promise<void> {
  const sessionId = role === "pcb" ? "parent-session" : "ratline-session";
  await dependency.request(role, { method: "Target.setAutoAttach", sessionId, params: CURRENT_PCB_WORKER_STARTUP_ATTACH });
  await dependency.request(role, { method: "Runtime.enable", sessionId, params: {} });
  await dependency.request(role, { method: "Debugger.enable", sessionId, params: { maxScriptsCacheSize: 33_554_432 } });
  await dependency.request(role, { method: "Debugger.setAsyncCallStackDepth", sessionId, params: { maxDepth: 1 } });
  await dependency.request(role, { method: "Debugger.setInstrumentationBreakpoint", sessionId, params: { instrumentation: "beforeScriptExecution" } });
}
function event(f: Fixture, sessionId: string, method: string, params: Record<string, unknown>): void { f.frame({ method, sessionId, params }); }
async function pcb(f: Fixture, dependency: CurrentPcb209RatlineStartupDependency): Promise<void> {
  await arm(dependency, "pcb"); await dependency.requestParent(opening(true, "open-document"));
  f.state.onSend = (request): Promise<unknown> => {
    f.frame({ id: request["requestId"], sessionId: request["sessionId"], result: ordinaryReply(request) });
    if (request["method"] === "Debugger.resume") { event(f, "parent-session", "Debugger.resumed", {}); }
    return Promise.resolve({ written: true });
  };
  for (let index = 0; index < 29; index += 1) {
    event(f, "parent-session", "Debugger.paused", { reason: "instrumentation", hitBreakpoints: [] });
    await dependency.request("pcb", { method: "Debugger.getScriptSource", sessionId: "parent-session", params: { scriptId: `pcb-${String(index)}` } });
    await dependency.request("pcb", { method: "Debugger.resume", sessionId: "parent-session", params: {} });
  }
  f.state.onSend = null;
  event(f, "parent-session", "Target.attachedToTarget", { sessionId: "ratline-session", waitingForDebugger: true,
    targetInfo: { targetId: "ratline-worker", type: "worker", attached: true, title: "pcb-ratline-worker", url: "https://client/editor?entry=pcb-ratline-worker.js" } });
  await dependency.requestParent({ method: "Page.getFrameTree", sessionId: "parent-session", params: {} });
}
const originalStack = { id: "original-external-stack", debuggerId: "debugger-pcb" } as const;
function stackCommand(stackTraceId: Readonly<{ id: string; debuggerId: string }> = originalStack): CurrentPcb209RatlineOriginCommand {
  return { method: "Debugger.getStackTrace", sessionId: "parent-session", params: { stackTraceId } } as const;
}
async function firstChild(f: Fixture, dependency: CurrentPcb209RatlineStartupDependency, external: unknown): Promise<void> {
  await pcb(f, dependency); await arm(dependency, "worker");
  await dependency.request("pcb", { method: "Runtime.runIfWaitingForDebugger", sessionId: "ratline-session", params: {} });
  event(f, "ratline-session", "Debugger.paused", { reason: "instrumentation", hitBreakpoints: [], ...(external === undefined ? {} : { asyncStackTraceId: external }) });
  // Drain the actual first pause before issuing its source read, as the real
  // Bootstrap observer does; this is not a caller assertion of pause state.
  await dependency.requestParent({ method: "Page.getFrameTree", sessionId: "parent-session", params: {} });
  await dependency.request("worker", { method: "Debugger.getScriptSource", sessionId: "ratline-session", params: { scriptId: "child-original-bootstrap" } });
}
void test("origin lookup requires the first original child pause and exact retained PCB debugger then consumes once", async context => {
  const f = await fixture(context); const dependency = await prepare(f); await firstChild(f, dependency, originalStack);
  const before = f.requests.length;
  for (const command of [stackCommand({ ...originalStack, id: "foreign" }), stackCommand({ ...originalStack, debuggerId: "foreign" }),
    { ...stackCommand(), sessionId: "ratline-session" }]) {
    await assert.rejects(dependency.request("pcb", command), /ORIGIN_STACK|RATLINE_SESSION/u);
  }
  await assert.rejects(dependency.request("worker", { ...stackCommand(), sessionId: "ratline-session" }), /NATIVE_WIRE/u);
  assert.equal(f.requests.length, before);
  await dependency.request("pcb", stackCommand());
  const sent = f.requests.at(-1);
  assert.equal(sent?.["phase"], "origin-stack"); assert.equal(sent?.["stackTraceId"], originalStack.id);
  assert.equal(sent?.["debuggerId"], originalStack.debuggerId); assert.equal(f.budget.remainingRequests("origin-stack"), 0);
  await assert.rejects(dependency.request("pcb", stackCommand()), /ORIGIN_STACK/u);
  assert.equal(f.requests.length, before + 1);
});
void test("missing or foreign first-pause origin cannot authorize a lookup or spend its request", async context => {
  for (const external of [undefined, { id: originalStack.id }, { ...originalStack, debuggerId: "foreign" }, { ...originalStack, id: "bad\n" }]) {
    const f = await fixture(context); const dependency = await prepare(f); await firstChild(f, dependency, external);
    const before = f.requests.length;
    await assert.rejects(dependency.request("pcb", stackCommand()), /ORIGIN_STACK/u);
    assert.equal(f.requests.length, before); assert.equal(f.budget.remainingRequests("origin-stack"), 1);
    assert.equal(f.channel.status().failed, false);
    f.state.terminated = true; await f.channel.releaseAfterTermination();
  }
});
void test("uncertain origin write never replays and its late reply stays accounted during cleanup", async context => {
  const f = await fixture(context); const dependency = await prepare(f); await firstChild(f, dependency, originalStack);
  let issued: Send | null = null;
  f.state.onSend = (request): Promise<unknown> => { issued = request; return Promise.reject(new Error("Lost native origin acknowledgment")); };
  await assert.rejects(dependency.request("pcb", stackCommand()), /WRITE/u);
  assert.equal(f.channel.status().pendingReplies, 1); assert.equal(f.budget.remainingRequests("origin-stack"), 0);
  await f.channel.beginCleanup(); const before = f.requests.length;
  await assert.rejects(dependency.request("pcb", stackCommand()), /CLEANUP_COMMAND/u);
  assert.equal(f.requests.length, before); assert.ok(issued !== null);
  f.frame({ id: issued["requestId"], sessionId: "parent-session", result: { stackTrace: { description: "late" } } });
  f.state.onSend = null;
  await dependency.request("worker", { method: "Debugger.removeBreakpoint", sessionId: "ratline-session", params: { breakpointId: "instrument-worker" } });
  assert.equal(f.channel.status().pendingReplies, 0); assert.equal(f.budget.snapshot().pendingReplies, 0);
});
void test("ratline channel retains launch IDs and ledger while transferring all parent events once and retaining project-worker routing", async context => {
  const f = await fixture(context); const dependency = await prepare(f);
  event(f, "parent-session", "Runtime.consoleAPICalled", { executionContextId: 1 });
  event(f, "project-session", "Runtime.consoleAPICalled", { executionContextId: 2 });
  await arm(dependency, "pcb");
  assert.equal(f.state.parentEvents, 0); assert.equal(f.state.startupEvents, 2); assert.equal(f.state.ratlineEvents, 1);
  assert.equal(f.budget.snapshot().prefixRequests, 6); assert.equal(f.budget.snapshot().requests, 12);
  assert.deepEqual(f.requests.filter(value => typeof value["requestId"] === "number").map(value => value["requestId"]), [4, 5, 6, 7, 8, 9, 10, 11, 12]);
  await assert.rejects(f.channel.claimRatlineRouting(), /ROUTING_STATE/u);
  assert.throws(() => f.channel.classifyPending(11), /PENDING_CLASS/u);
});
void test("ratline channel reaches seven original child source replies but refuses its seventh resume and every worker realm command", async context => {
  const f = await fixture(context); const dependency = await prepare(f); await pcb(f, dependency); await arm(dependency, "worker");
  await dependency.request("pcb", { method: "Runtime.runIfWaitingForDebugger", sessionId: "ratline-session", params: {} });
  f.state.onSend = (request): Promise<unknown> => {
    f.frame({ id: request["requestId"], sessionId: request["sessionId"], result: ordinaryReply(request) });
    if (request["method"] === "Debugger.resume") { event(f, "ratline-session", "Debugger.resumed", {}); }
    return Promise.resolve({ written: true });
  };
  for (let index = 0; index < 7; index += 1) {
    event(f, "ratline-session", "Debugger.paused", { reason: "instrumentation", hitBreakpoints: [] });
    await dependency.request("worker", { method: "Debugger.getScriptSource", sessionId: "ratline-session", params: { scriptId: `child-${String(index)}` } });
    if (index < 6) { await dependency.request("worker", { method: "Debugger.resume", sessionId: "ratline-session", params: {} }); }
  }
  const before = f.requests.length;
  await assert.rejects(dependency.request("worker", { method: "Debugger.resume", sessionId: "ratline-session", params: {} }), /RESUME_SEQUENCE/u);
  await assert.rejects(dependency.request("worker", { method: "Target.getTargets", params: {} }), /HELD_CHILD_BOUNDARY/u);
  await assert.rejects(dependency.request("pcb", { method: "Runtime.runIfWaitingForDebugger", sessionId: "ratline-session", params: {} }), /CHILD_START/u);
  assert.equal(f.requests.length, before); assert.equal(f.channel.status().failed, false);
});
void test("ambiguous native allocation acknowledgment retains the original late handle for one cleanup after native abort", async context => {
  const f = await fixture(context); const dependency = await prepare(f);
  const allocated = Promise.withResolvers<Send>(), delayed = Promise.withResolvers<unknown>();
  f.state.onSend = (request): Promise<unknown> => {
    if (request["method"] === "Debugger.setInstrumentationBreakpoint") { allocated.resolve(request); return delayed.promise; }
    f.frame({ id: request["requestId"], sessionId: request["sessionId"], result: ordinaryReply(request) }); return Promise.resolve({ written: true });
  };
  const armed = arm(dependency, "pcb");
  const retained = await allocated.promise;
  delayed.reject(new Error("Lost native write acknowledgment")); await f.channel.beginCleanup();
  f.frame({ id: retained["requestId"], sessionId: "parent-session", result: { breakpointId: "late-original" } });
  await armed; await dependency.request("pcb", { method: "Debugger.removeBreakpoint", sessionId: "parent-session", params: { breakpointId: "late-original" } });
  assert.equal(f.requests.filter(request => request["action"] === "worker-startup-ratline-abort").length, 1);
  await assert.rejects(dependency.request("pcb", { method: "Debugger.removeBreakpoint", sessionId: "parent-session", params: { breakpointId: "late-original" } }), /ORIGINAL_ALLOCATION/u);
  assert.equal(f.budget.snapshot().phase, "cleanup");
});
void test("bootstrap acknowledgement enforces its original one-KiB reply class", async context => {
  const f = await fixture(context); const dependency = await prepare(f);
  f.state.onSend = (request): Promise<unknown> => {
    f.frame({ id: request["requestId"], sessionId: request["sessionId"], result: { privateText: "x".repeat(1024) } }); return Promise.resolve({ written: true });
  };
  await assert.rejects(arm(dependency, "pcb")); assert.equal(f.channel.status().fatal, true);
});
void test("wrong native child session and later PCB continuation phases refuse without a write", async context => {
  const f = await fixture(context); const dependency = await prepare(f); await pcb(f, dependency);
  await assert.rejects(dependency.request("worker", { method: "Runtime.enable", sessionId: "project-session", params: {} }), /RATLINE_SESSION/u);
  const selected = CURRENT_PCB_209_RATLINE_NATIVE_CASES.find(value => value.role === "pcb" && value.phase === "relation-same"); assert.ok(selected !== undefined);
  assert.ok("sessionId" in selected.command); const before = f.requests.length;
  await assert.rejects(dependency.request("pcb", { ...selected.command, sessionId: "parent-session" }), /HELD_CHILD_BOUNDARY/u);
  assert.equal(f.requests.length, before);
});

void test("exhausted ancestry class preserves the next original ID and the reserved native cleanup", async context => {
  const f = await fixture(context); const dependency = await prepare(f); await arm(dependency, "pcb"); await dependency.requestParent(opening(true, "open-document"));
  for (let index = 0; index < 12; index += 1) { await dependency.requestParent({ method: "Page.getFrameTree", sessionId: "parent-session", params: {} }); }
  const next = f.channel.status().nextRequestId;
  await assert.rejects(dependency.requestParent({ method: "Page.getFrameTree", sessionId: "parent-session", params: {} }), /REQUEST_CLASS_BUDGET/u);
  assert.equal(f.channel.status().nextRequestId, next); await f.channel.beginCleanup();
  await dependency.request("pcb", { method: "Debugger.removeBreakpoint", sessionId: "parent-session", params: { breakpointId: "instrument-pcb" } });
  assert.equal(f.requests.at(-1)?.["requestId"], next);
});
void test("original process termination settles retained allocation before channel release or composite completion", async context => {
  const f = await fixture(context); const dependency = await prepare(f); const allocated = Promise.withResolvers<null>();
  f.state.onSend = (request): Promise<unknown> => {
    if (request["method"] === "Debugger.setInstrumentationBreakpoint") { allocated.resolve(null); }
    else { f.frame({ id: request["requestId"], sessionId: request["sessionId"], result: ordinaryReply(request) }); }
    return Promise.resolve({ written: true });
  };
  const pending = arm(dependency, "pcb"), refusal = assert.rejects(pending, /TERMINATED/u);
  await allocated.promise;
  assert.equal(f.channel.status().pendingReplies, 1); f.state.terminated = true; await dependency.assertOriginalTermination();
  await refusal; assert.equal(f.channel.status().pendingReplies, 0); assert.equal(f.channel.status().released, false);
});

void test("normal poll exhaustion preserves the original prelude cleanup reserve without accepting malformed pipe data", { timeout: 3000 }, async context => {
  const f = await fixture(context);
  await f.dependency.request({ method: "Target.setAutoAttach", sessionId: "parent-session", params: CURRENT_PCB_WORKER_STARTUP_ATTACH });
  while (f.budget.snapshot().polls < PROFILE.polling.normalLimit) { f.budget.consumePoll(); }
  await f.aborted;
  assert.equal(f.channel.status().failed, true); assert.equal(f.channel.status().fatal, false);
  await f.channel.beginCleanup();
  await f.dependency.request({ method: "Debugger.removeBreakpoint", sessionId: "project-session", params: { breakpointId: "original-prelude" } });
  assert.equal(f.budget.snapshot().phase, "cleanup");
  assert.equal(f.requests.filter(request => request["action"] === "worker-startup-ratline-abort").length, 1);
});

void test("normal helper-control exhaustion consumes no unwritten CDP ID and cleanup uses that next original ID", async context => {
  const f = await fixture(context);
  await f.dependency.request({ method: "Target.setAutoAttach", sessionId: "parent-session", params: CURRENT_PCB_WORKER_STARTUP_ATTACH });
  while (f.budget.snapshot().helperControls < PROFILE.helperNormalControlMessages) { f.budget.consumeHelperControl(); }
  const next = f.channel.status().nextRequestId;
  await assert.rejects(f.dependency.request({ method: "Runtime.enable", sessionId: "project-session", params: {} }), /HELPER_CONTROL_BOUND/u);
  assert.equal(f.channel.status().nextRequestId, next); await f.channel.beginCleanup();
  await f.dependency.request({ method: "Debugger.removeBreakpoint", sessionId: "project-session", params: { breakpointId: "original-prelude" } });
  assert.equal(f.requests.at(-1)?.["requestId"], next); assert.equal(f.channel.status().fatal, false);
});

void test("failed project prelude consumes native abort before its original cleanup command", async context => {
  const f = await fixture(context);
  await f.dependency.request({ method: "Target.setAutoAttach", sessionId: "parent-session", params: CURRENT_PCB_WORKER_STARTUP_ATTACH });
  f.state.onSend = (request): Promise<unknown> => {
    f.frame({ id: request["requestId"], sessionId: request["sessionId"], error: { code: -32_000, message: "synthetic prelude refusal" } });
    return Promise.resolve({ written: true });
  };
  await assert.rejects(f.dependency.request({ method: "Runtime.enable", sessionId: "project-session", params: {} }), /REMOTE/u);
  f.state.onSend = null;
  await f.dependency.request({ method: "Debugger.removeBreakpoint", sessionId: "project-session", params: { breakpointId: "original-prelude" } });
  assert.equal(f.requests.at(-2)?.["action"], "worker-startup-ratline-abort");
  assert.equal(f.requests.at(-1)?.["method"], "Debugger.removeBreakpoint");
  const sent = f.requests.length;
  await assert.rejects(f.dependency.request({ method: "Runtime.runIfWaitingForDebugger", sessionId: "project-session", params: {} }), /REMOTE/u);
  assert.equal(f.requests.length, sent);
});

void test("queued normal work cannot wait on its own later native abort", { timeout: 3000 }, async context => {
  const f = await fixture(context);
  await f.dependency.request({ method: "Target.setAutoAttach", sessionId: "parent-session", params: CURRENT_PCB_WORKER_STARTUP_ATTACH });
  const acknowledgment = Promise.withResolvers<unknown>(), issued = Promise.withResolvers<null>();
  f.state.onSend = (request): Promise<unknown> => {
    f.frame({ id: request["requestId"], sessionId: request["sessionId"], result: ordinaryReply(request) }); issued.resolve(null); return acknowledgment.promise;
  };
  const first = assert.rejects(f.dependency.request({ method: "Runtime.enable", sessionId: "project-session", params: {} }), /CLEANUP/u);
  await issued.promise;
  const next = f.channel.status().nextRequestId;
  const queued = assert.rejects(f.dependency.request({ method: "Debugger.enable", sessionId: "project-session", params: { maxScriptsCacheSize: 33_554_432 } }), /CLEANUP_INTERRUPTED/u);
  const cleanup = f.channel.beginCleanup(); acknowledgment.resolve({ written: true });
  await Promise.all([first, queued, cleanup]);
  assert.equal(f.channel.status().nextRequestId, next);
  assert.equal(f.requests.filter(request => request["action"] === "worker-startup-ratline-abort").length, 1);
});
