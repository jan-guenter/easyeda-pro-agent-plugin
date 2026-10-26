import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { CurrentPcb209EmptyStartupBudgetAnchor, CurrentPcb209EmptyStartupChannel } from "../src/current-pcb-209-empty-startup-channel.ts";
import type { CurrentPcbWorkerStartupNativeDependency } from "../src/current-pcb-worker-startup-channel.ts";
import { CURRENT_PCB_209_EMPTY_NATIVE_CASES } from "../src/current-pcb-209-empty-native-cases.ts";
import { CURRENT_PCB_209_EMPTY_NATIVE_PROFILE as PROFILE } from "../src/current-pcb-209-empty-native-profile.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "../src/current-pcb-worker-startup-contract.ts";
import { currentPcb209WorkerStartupNativeParentCases } from "../src/current-pcb-worker-startup-native.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION } from "../src/current-pcb-diagnostic-pcb-opening.ts";

type Send = Readonly<Record<string, string | number>>;
async function fixture(context: TestContext, options: Readonly<{ nextRequestId?: number; receivedBytes?: number; pollCount?: number }> = {}): Promise<Readonly<{
  channel: CurrentPcb209EmptyStartupChannel; dependency: Awaited<ReturnType<CurrentPcb209EmptyStartupChannel["start"]>>;
  requests: Send[]; state: { ready: boolean; current: boolean; terminated: boolean; pcbContext: string; pcbChecks: number;
    onSend: ((request: Send) => Promise<unknown>) | null }; frame: (value: unknown) => void;
}>> {
  const anchor = new CurrentPcb209EmptyStartupBudgetAnchor(); await delay(2);
  const chunks: Buffer[] = [], requests: Send[] = [];
  const state = { ready: false, current: true, terminated: false, pcbContext: "original-pcb-context", pcbChecks: 0, onSend: null as ((request: Send) => Promise<unknown>) | null };
  const parent = Object.freeze({ targetId: "parent", sessionId: "parent-session", nextRequestId: options.nextRequestId ?? 17 });
  const frame = (value: unknown): void => { chunks.push(Buffer.from(`${JSON.stringify(value)}\0`)); };
  const native: CurrentPcbWorkerStartupNativeDependency = {
    requireOriginalParent: (): Promise<typeof parent> => { assert.ok(state.current); return Promise.resolve(parent); },
    assertOriginalTermination: (): Promise<void> => { assert.ok(state.terminated); return Promise.resolve(); },
    observeOriginalParentEvent: (): void => { assert.fail("No parent events expected in this synthetic channel fixture"); },
    exchange: request => {
      if (request.action === "poll") {
        const first = chunks[0]; if (first === undefined) { return Promise.resolve({ bytes: "" }); }
        const bytes = first.subarray(0, PROFILE.frames.chunk);
        if (bytes.length === first.length) { chunks.shift(); } else { chunks[0] = first.subarray(bytes.length); }
        return Promise.resolve({ bytes: bytes.toString("base64") });
      }
      assert.ok("requestId" in request); requests.push(request);
      if (state.onSend !== null) { return state.onSend(request); }
      if (request["method"] === "Target.setAutoAttach") {
        frame({ method: "Target.attachedToTarget", sessionId: "parent-session", params: { sessionId: "worker-session", waitingForDebugger: true,
          targetInfo: { targetId: "worker", type: "worker", attached: true, title: "synthetic", url: "file:///synthetic/project-worker.js" } } });
      }
      if (request["parentPhase"] === "pcb-observe") { state.ready = true; }
      frame({ id: request["requestId"], sessionId: request["sessionId"], result: {} }); return Promise.resolve({ written: true });
    },
  };
  const channel = new CurrentPcb209EmptyStartupChannel(native, { receivedBytes: options.receivedBytes ?? 0, eventCount: 0, eventBytes: 0, pollCount: options.pollCount ?? 3 }, anchor,
    (): Promise<Readonly<{ sessionId: string; uniqueContextId: string }>> => {
      assert.ok(state.current && state.ready); state.pcbChecks += 1;
      return Promise.resolve(Object.freeze({ sessionId: "parent-session", uniqueContextId: state.pcbContext }));
    });
  const dependency = await channel.start(); assert.ok(channel.status().elapsedMilliseconds >= 1);
  dependency.subscribe(event => { assert.equal(event.method, "Target.attachedToTarget"); });
  context.after(async (): Promise<void> => { state.terminated = true; if (!channel.status().released) { await channel.releaseAfterTermination(); } });
  return { channel, dependency, requests, state, frame };
}
function baseline(family: "common" | "root", phase: string): typeof CURRENT_PCB_209_EMPTY_NATIVE_CASES[number] {
  const value = CURRENT_PCB_209_EMPTY_NATIVE_CASES.find(command => "commonPhase" in command ? family === "common" && command.commonPhase === phase : family === "root" && command.rootPhase === phase);
  assert.ok(value !== undefined);
  if (value.method === "Runtime.evaluate") {
    if ("commonPhase" in value) { return { ...value, sessionId: "parent-session", params: { ...value.params, uniqueContextId: "original-pcb-context" } }; }
    return { ...value, sessionId: "parent-session", params: { ...value.params, uniqueContextId: "original-pcb-context" } };
  }
  return { ...value, sessionId: "parent-session" };
}
async function open(value: Awaited<ReturnType<typeof fixture>>): Promise<void> {
  const samples = currentPcb209WorkerStartupNativeParentCases();
  for (const [pcb, phase] of [[false, "preflight"], [false, "open-project"], [true, "preflight"], [true, "open-document"], [true, "observe"]] as const) {
    if (phase === "open-project") { await value.dependency.request({ method: "Target.setAutoAttach", params: CURRENT_PCB_WORKER_STARTUP_ATTACH, sessionId: "parent-session" }); }
    if (phase === "observe") { await value.dependency.request({ method: "Debugger.getScriptSource", pcbPhase: "source", sessionId: "parent-session", params: { scriptId: "pcb-script" } }); }
    const selected = samples.find(command => command.method === "Runtime.callFunctionOn" && command.params.arguments.length === 2 && command.params.arguments[1].value === phase &&
      (command.params.functionDeclaration === CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION) === pcb);
    assert.equal(selected?.method, "Runtime.callFunctionOn"); assert.ok(selected?.method === "Runtime.callFunctionOn"); await value.dependency.request({ ...selected, sessionId: "parent-session" });
  }
}
void test("empty209 channel retains launch age, usage and IDs while binding both groups to the original completed PCB context", async context => {
  const value = await fixture(context, { nextRequestId: 250, receivedBytes: 4096, pollCount: 11 });
  assert.equal(value.channel.status().receivedBytes, 4096); assert.equal(value.channel.status().pollCount, 11);
  await assert.rejects(value.dependency.request(baseline("root", "wrapper")), /PCB_GROUP_START/u); assert.equal(value.requests.length, 0);
  await open(value);
  const wrapper = baseline("root", "wrapper"); assert.equal(wrapper.method, "Runtime.evaluate");
  await assert.rejects(value.dependency.request({ ...wrapper, sessionId: "worker-session" }), /PCB_PARENT_SESSION/u);
  await value.dependency.request(wrapper); assert.equal(value.state.pcbChecks, 2);
  await assert.rejects(value.dependency.request(wrapper), /PCB_GROUP_START/u);
  await value.dependency.request(baseline("common", "wrapper")); await value.dependency.request(baseline("common", "release"));
  await assert.rejects(value.dependency.request(baseline("common", "metadata")), /PCB_GROUP_LIFETIME/u);
  await value.dependency.request(baseline("root", "release")); await assert.rejects(value.dependency.request(baseline("root", "release")), /PCB_GROUP_LIFETIME/u);
  assert.deepEqual(value.requests.map(request => request["requestId"]), Array.from({ length: 11 }, (_, index) => 250 + index));
  assert.equal(value.channel.status().failed, false); assert.ok(value.channel.status().pollCount > 11);
});
void test("empty209 reply delivery reproves the original PCB context and retains one group cleanup after drift", async context => {
  const value = await fixture(context); await open(value); await value.dependency.request(baseline("root", "wrapper"));
  value.state.onSend = (request): Promise<unknown> => {
    value.frame({ id: request["requestId"], sessionId: request["sessionId"], result: {} });
    if (request["rootPhase"] !== "release") { value.state.pcbContext = "foreign-context"; }
    return Promise.resolve({ written: true });
  };
  await assert.rejects(value.dependency.request(baseline("root", "before")), /PCB_CONTEXT/u);
  assert.equal(value.channel.status().failed, true); await value.dependency.request(baseline("root", "release"));
  await assert.rejects(value.dependency.request(baseline("root", "release")), /PCB_GROUP_LIFETIME/u);
  assert.equal(value.requests.filter(request => request["rootPhase"] === "release").length, 1);
});
void test("empty209 normal ID exhaustion preserves fixed cleanup reserve and never resets the inherited ID", async context => {
  const value = await fixture(context, { nextRequestId: PROFILE.normalRequestLimit - 7 }); await open(value);
  await value.dependency.request(baseline("root", "wrapper"));
  await assert.rejects(value.dependency.request(baseline("root", "before")), /NORMAL_REQUEST_BUDGET|WRITE/u);
  const next = value.channel.status().nextRequestId;
  await value.dependency.request(baseline("root", "release")); assert.equal(value.requests.at(-1)?.["requestId"], next);
  assert.equal(value.channel.status().nextRequestId, next + 1);
});
void test("empty209 cannot borrow a pending large source reply allowance for a small root reply", async context => {
  const value = await fixture(context); await open(value); await value.dependency.request(baseline("root", "wrapper"));
  value.state.onSend = (request): Promise<unknown> => {
    if (request["rootPhase"] === "before") { value.frame({ id: request["requestId"], sessionId: request["sessionId"], result: { text: "x".repeat(PROFILE.replyClasses.rootSamples.frameBytes) } }); }
    return Promise.resolve({ written: true });
  };
  const source = value.dependency.request({ method: "Debugger.getScriptSource", params: { scriptId: "worker-script" }, sessionId: "worker-session" });
  const refusedSource = assert.rejects(source); const refusedRoot = assert.rejects(value.dependency.request(baseline("root", "before")));
  await Promise.all([refusedSource, refusedRoot]); assert.equal(value.channel.status().fatal, true);
});
