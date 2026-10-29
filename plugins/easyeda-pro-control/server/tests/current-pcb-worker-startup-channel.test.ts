/* oxlint-disable import/max-dependencies -- The original channel fixture now also joins the separately branded native-refusal issuer; keeping this cross-boundary regression here exercises actual consumed transport ownership. */
import assert from "node:assert/strict";
import { issueCurrentPcbDiagnosticNativeRefusal } from "../src/current-pcb-diagnostic-native-refusal.ts";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { CurrentPcb209WorkerStartupChannel, CurrentPcbWorkerStartupChannel } from "../src/current-pcb-worker-startup-channel.ts";
import type { CurrentPcbWorkerStartupNativeDependency, CurrentPcbWorkerStartupParent } from "../src/current-pcb-worker-startup-channel.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "../src/current-pcb-worker-startup-contract.ts";
import type { CurrentPcbWorkerStartupEvent } from "../src/current-pcb-worker-startup-contract.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_SITES } from "../src/current-pcb-worker-construction-contract.ts";
import { currentPcbWorkerStartupNativeParentCases } from "../src/current-pcb-worker-startup-native.ts";
import { currentPcbWorkerStartupUiActorCommand } from "../src/current-pcb-worker-startup-actor.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION } from "../src/current-pcb-diagnostic-pcb-opening.ts";
import { currentFootprintCopySourceNativeSample } from "../src/current-footprint-copy-source-native.ts";

type NativeSend = Readonly<Record<string, string | number>>;
async function fixture(context: TestContext, current209 = false): Promise<Readonly<{
  channel: CurrentPcbWorkerStartupChannel | CurrentPcb209WorkerStartupChannel;
  dependency: Awaited<ReturnType<CurrentPcbWorkerStartupChannel["start"]>>;
  native: CurrentPcbWorkerStartupNativeDependency;
  requests: NativeSend[];
  events: CurrentPcbWorkerStartupEvent[];
  parentEvents: CurrentPcbWorkerStartupEvent[];
  state: { terminated: boolean; currentParent: CurrentPcbWorkerStartupParent; rejectParentEvent: boolean; asyncParentEvent: boolean;
    onSend: ((request: NativeSend) => Promise<unknown>) | null };
  frame: (value: unknown) => void;
  raw: (bytes: Buffer) => void;
}>> {
  const events: CurrentPcbWorkerStartupEvent[] = [], parentEvents: CurrentPcbWorkerStartupEvent[] = [], requests: NativeSend[] = [];
  const chunks: Buffer[] = [], parent = Object.freeze({ targetId: "parent-target", sessionId: "parent-session", nextRequestId: 17 });
  const state: { terminated: boolean; currentParent: CurrentPcbWorkerStartupParent; rejectParentEvent: boolean; asyncParentEvent: boolean;
    onSend: ((request: NativeSend) => Promise<unknown>) | null } = {
      terminated: false, currentParent: parent, rejectParentEvent: false, asyncParentEvent: false, onSend: null,
    };
  const frame = (value: unknown): void => { chunks.push(Buffer.from(`${JSON.stringify(value)}\0`)); };
  const native: CurrentPcbWorkerStartupNativeDependency = {
    requireOriginalParent: (): Promise<CurrentPcbWorkerStartupParent> => Promise.resolve(state.currentParent),
    assertOriginalTermination: (): Promise<void> => { assert.equal(state.terminated, true); return Promise.resolve(); },
    observeOriginalParentEvent: event => {
      parentEvents.push(event); assert.equal(state.rejectParentEvent, false);
      return state.asyncParentEvent ? Promise.reject(new Error("Synthetic forbidden asynchronous parent observer")) : undefined;
    },
    exchange: request => {
      if (request.action === "poll") {
        const first = chunks[0];
        if (first === undefined) { return Promise.resolve({ bytes: "" }); }
        const selected = first.subarray(0, 65_536);
        if (selected.length === first.length) { chunks.shift(); } else { chunks[0] = first.subarray(selected.length); }
        return Promise.resolve({ bytes: selected.toString("base64") });
      }
      assert.ok("requestId" in request);
      requests.push(request);
      if (state.onSend !== null) { return state.onSend(request); }
      if (request["method"] === "Target.setAutoAttach") {
        frame({ method: "Target.attachedToTarget", sessionId: "parent-session", params: { sessionId: "worker-session", waitingForDebugger: true,
          targetInfo: { targetId: "worker-target", type: "worker", attached: true, title: "synthetic", url: "file:///synthetic/project-worker.js" } } });
      }
      frame({ id: request["requestId"], sessionId: request["sessionId"], result: {} }); return Promise.resolve({ written: true });
    },
  };
  const channel = current209 ? new CurrentPcb209WorkerStartupChannel(native) : new CurrentPcbWorkerStartupChannel(native), dependency = await channel.start();
  dependency.subscribe(event => { events.push(event); });
  context.after(async () => {
    state.terminated = true;
    if (!channel.status().released) { await channel.releaseAfterTermination(); }
  });
  return { channel, dependency, native, requests, events, parentEvents, state, frame, raw: bytes => { chunks.push(bytes); } };
}
async function attach(value: Awaited<ReturnType<typeof fixture>>): Promise<void> {
  await value.dependency.request({ method: "Target.setAutoAttach", params: CURRENT_PCB_WORKER_STARTUP_ATTACH, sessionId: "parent-session" });
}
void test("only the fixed209 footprint source reply receives its dedicated frame bound", async context => {
  const value = await fixture(context, true); await attach(value);
  const content = "x".repeat(1024 * 1024 + 1), result = { result: { type: "string", value: content } };
  value.state.onSend = (request): Promise<unknown> => {
    value.frame({ id: request["requestId"], sessionId: request["sessionId"], result }); return Promise.resolve({ written: true });
  };
  assert.deepEqual(await value.dependency.request({ ...currentFootprintCopySourceNativeSample(), sessionId: "worker-session" }), result);
  await assert.rejects(value.dependency.request({ method: "Runtime.getProperties", sessionId: "worker-session",
    params: { objectId: "ordinary", ownProperties: true, generatePreview: false } }), /FRAME_BUDGET|REPLY|POLL/u);
});
void test("an oversized event cannot borrow the pending footprint source reply allowance", async context => {
  const value = await fixture(context, true); await attach(value);
  value.state.onSend = (): Promise<unknown> => {
    value.frame({ method: "Runtime.consoleAPICalled", sessionId: "worker-session", params: { text: "x".repeat(1024 * 1024 + 1) } });
    return Promise.resolve({ written: true });
  };
  await assert.rejects(value.dependency.request({ ...currentFootprintCopySourceNativeSample(), sessionId: "worker-session" }), /EVENT_BUDGET|POLL/u);
});
void test("parent opening shares IDs, requires acknowledged attachment and cannot replay or change target", async context => {
  const value = await fixture(context);
  const samples = currentPcbWorkerStartupNativeParentCases();
  const preflight = samples.find(sample => sample.method === "Runtime.callFunctionOn" && sample.params.arguments.length === 2 && sample.params.arguments[1].value === "preflight");
  const opening = samples.find(sample => sample.method === "Runtime.callFunctionOn" && sample.params.arguments.length === 2 && sample.params.arguments[1].value === "open-project");
  assert.ok(preflight?.method === "Runtime.callFunctionOn" && opening?.method === "Runtime.callFunctionOn");
  const openParams = opening.params, preParams = preflight.params;
  assert.ok(openParams.awaitPromise && preParams.awaitPromise);
  const open = { ...opening, params: openParams, sessionId: "parent-session" }, pre = { ...preflight, params: preParams, sessionId: "parent-session" };
  await assert.rejects(value.dependency.request(open), /OPENING_SEQUENCE/u);
  await value.dependency.request({ method: "Target.getTargets", params: {} });
  await value.dependency.request(pre);
  await assert.rejects(value.dependency.request(pre), /OPENING_SEQUENCE/u);
  await assert.rejects(value.dependency.request(open), /OPENING_SEQUENCE/u);
  await attach(value);
  await assert.rejects(value.dependency.request({ ...open, params: { ...open.params, uniqueContextId: "other" } }), /OPENING_SEQUENCE/u);
  await assert.rejects(value.dependency.request({ ...open, sessionId: "worker-session" }), /PARENT_SESSION/u);
  await value.dependency.request(open);
  await assert.rejects(value.dependency.request(open), /OPENING_SEQUENCE/u);
  assert.deepEqual(value.requests.map(request => request["requestId"]), [17, 18, 19, 20]);
});
async function openForActor(value: Awaited<ReturnType<typeof fixture>>): Promise<void> {
  for (const phase of ["preflight", "open-project"] as const) {
    const sample = currentPcbWorkerStartupNativeParentCases().find(command => command.method === "Runtime.callFunctionOn" &&
      command.params.arguments.length === 2 && command.params.arguments[1].value === phase);
    assert.ok(sample?.method === "Runtime.callFunctionOn" && sample.params.arguments.length === 2);
    if (phase === "open-project") { await attach(value); }
    await value.dependency.request({ ...sample, sessionId: "parent-session" });
  }
}
void test("same startup channel admits one sealed PCB continuation and no source or observation before its stage", async context => {
  const samples = currentPcbWorkerStartupNativeParentCases(), value = await fixture(context);
  const select = (phase: "preflight" | "open-document" | "observe"): Extract<typeof samples[number], { method: "Runtime.callFunctionOn" }> => {
    const selected = samples.find(command => command.method === "Runtime.callFunctionOn" &&
      command.params.functionDeclaration === CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION &&
      command.params.arguments.length === 2 && command.params.arguments[1].value === phase);
    assert.ok(selected?.method === "Runtime.callFunctionOn"); return { ...selected, sessionId: "parent-session" };
  };
  const observation = select("observe"), opening = select("open-document"), preflight = select("preflight");
  const source = { method: "Debugger.getScriptSource", pcbPhase: "source", sessionId: "parent-session", params: { scriptId: "pcb-script" } } as const;
  await assert.rejects(value.dependency.request(preflight), /PCB_OPENING_SEQUENCE/u);
  await assert.rejects(value.dependency.request(source), /PCB_SOURCE_SEQUENCE/u);
  await openForActor(value);
  await assert.rejects(value.dependency.request(opening), /PCB_OPENING_SEQUENCE/u);
  await assert.rejects(value.dependency.request(observation), /PCB_OPENING_SEQUENCE/u);
  await value.dependency.request(preflight);
  await assert.rejects(value.dependency.request(preflight), /PCB_OPENING_SEQUENCE/u);
  await assert.rejects(value.dependency.request({ ...opening, sessionId: "worker-session" }), /PARENT_SESSION/u);
  await value.dependency.request(opening);
  await assert.rejects(value.dependency.request(opening), /PCB_OPENING_SEQUENCE/u);
  await assert.rejects(value.dependency.request(observation), /PCB_OPENING_SEQUENCE/u);
  await value.dependency.request(source);
  await assert.rejects(value.dependency.request(source), /PCB_SOURCE_SEQUENCE/u);
  await value.dependency.request(observation);
  await assert.rejects(value.dependency.request(observation), /PCB_OPENING_SEQUENCE/u);
  assert.deepEqual(value.requests.filter(request => String(request["parentPhase"]).startsWith("pcb-")).map(request => request["parentPhase"]),
    ["pcb-preflight", "pcb-open-document", "pcb-source", "pcb-observe"]);
  assert.equal(value.channel.status().failed, false);
});
void test("startup UI actor reads require original opened context and consume exactly two native calls", async context => {
  const command = currentPcbWorkerStartupUiActorCommand("parent-session", "original-context"), value = await fixture(context);
  await assert.rejects(value.dependency.request(command), /ACTOR_SEQUENCE/u); assert.equal(value.requests.length, 0);
  await openForActor(value);
  await assert.rejects(value.dependency.request(currentPcbWorkerStartupUiActorCommand("parent-session", "foreign-context")), /ACTOR_SEQUENCE/u);
  await assert.rejects(value.dependency.request(currentPcbWorkerStartupUiActorCommand("worker-session", "original-context")), /PARENT_SESSION/u);
  await value.dependency.request(command); await value.dependency.request(command);
  await assert.rejects(value.dependency.request(command), /ACTOR_SEQUENCE/u);
  assert.deepEqual(value.requests.filter(request => request["parentPhase"] === "actor-clock").map(request => request["requestId"]), [20, 21]);
  assert.equal(value.channel.status().failed, false);
});
void test("lost startup actor write acknowledgement consumes its native attempt and blocks replay", async context => {
  const value = await fixture(context); await openForActor(value);
  value.state.onSend = (): Promise<unknown> => Promise.reject(new Error("Synthetic lost actor write acknowledgement"));
  const command = currentPcbWorkerStartupUiActorCommand("parent-session", "original-context");
  await assert.rejects(value.dependency.request(command), /WRITE/u);
  await assert.rejects(value.dependency.request(command));
  assert.equal(value.requests.filter(request => request["parentPhase"] === "actor-clock").length, 1);
  assert.equal(value.channel.status().failed, true);
});
void test("pre-capture parent replies and events are serviced before worker subscriber exists", async () => {
  const parent = Object.freeze({ targetId: "p", sessionId: "s", nextRequestId: 1 });
  const frames: Buffer[] = []; let parentEvents = 0, terminated = false;
  const channel = new CurrentPcbWorkerStartupChannel({
    requireOriginalParent: (): Promise<CurrentPcbWorkerStartupParent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => { assert.equal(terminated, true); return Promise.resolve(); },
    observeOriginalParentEvent: (): void => { parentEvents += 1; },
    exchange: (request): Promise<unknown> => {
      if (request.action === "poll") { return Promise.resolve({ bytes: (frames.shift() ?? Buffer.alloc(0)).toString("base64") }); }
      assert.ok("requestId" in request);
      frames.push(Buffer.from(`${JSON.stringify({ method: "Page.lifecycleEvent", sessionId: "s", params: {} })}\0${JSON.stringify({ id: request["requestId"], result: { targetInfos: [] } })}\0`));
      return Promise.resolve({ written: true });
    },
  });
  try {
    const dependency = await channel.start();
    assert.deepEqual(await dependency.request({ method: "Target.getTargets", params: {} }), { targetInfos: [] });
    assert.equal(parentEvents, 1); assert.equal(channel.status().pendingReplies, 0);
  } finally { terminated = true; await channel.releaseAfterTermination(); }
});
async function until(predicate: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) { if (predicate()) { return; } await delay(5); }
  assert.fail("Synthetic channel condition did not settle within its test deadline");
}
const breakpoint = { method: "Debugger.setBreakpoint", sessionId: "worker-session", params: {
  location: { scriptId: "script", lineNumber: CURRENT_PCB_WORKER_CONSTRUCTION_SITES.channel.lineNumber,
    columnNumber: CURRENT_PCB_WORKER_CONSTRUCTION_SITES.channel.columnNumber },
} } as const;

void test("channel retains original parent and shared counter with independent native/CDP acknowledgments", async context => {
  const value = await fixture(context); await attach(value);
  await value.dependency.request({ method: "Runtime.enable", params: {}, sessionId: "worker-session" });
  assert.deepEqual(value.requests.map(request => request["requestId"]), [17, 18]);
  assert.equal(value.events[0]?.method, "Target.attachedToTarget");
  assert.equal(value.channel.status().attachedWorkers, 1); assert.equal(value.channel.status().pendingReplies, 0);
  await assert.rejects(value.channel.releaseAfterTermination());
  value.state.currentParent = Object.freeze({ ...value.state.currentParent });
  await assert.rejects(value.dependency.assertOriginalOwner(), /ORIGINAL_PARENT/u);
});

void test("channel normalizes all requests and refuses foreign sessions before native send", async context => {
  const value = await fixture(context); await attach(value);
  await assert.rejects(value.dependency.request({ method: "Runtime.enable", params: {}, sessionId: "foreign" }), /WORKER_SESSION/u);
  const unsafe = { method: "Runtime.evaluate", params: { expression: "arbitrary()" }, sessionId: "worker-session" };
  await assert.rejects(async () => { const result: unknown = Reflect.apply(value.dependency.request, undefined, [unsafe]); await result; });
  assert.equal(value.requests.length, 1);
});

void test("bounded native polling delivers worker events while no CDP request is pending", async context => {
  const value = await fixture(context); await attach(value);
  value.frame({ method: "Debugger.resumed", params: {}, sessionId: "worker-session" });
  await until(() => value.events.length === 2); assert.equal(value.events[1]?.method, "Debugger.resumed");
  assert.equal(value.channel.status().pendingReplies, 0);
});

void test("original parent events reach the pinned context observer and refusal blocks ordinary commands", async context => {
  const value = await fixture(context); await attach(value);
  value.state.rejectParentEvent = true;
  value.frame({ method: "Runtime.executionContextsCleared", params: {}, sessionId: "parent-session" });
  await until(() => value.channel.status().failed);
  assert.equal(value.parentEvents.length, 1); assert.equal(value.events.length, 1);
  await assert.rejects(value.dependency.request({ method: "Runtime.enable", params: {}, sessionId: "worker-session" }));
  await value.dependency.request({ method: "Runtime.runIfWaitingForDebugger", params: {}, sessionId: "worker-session" });
  assert.equal(value.requests.at(-1)?.["method"], "Runtime.runIfWaitingForDebugger");
});

void test("a rejecting asynchronous parent observer poisons channel without unhandled rejection", async context => {
  const value = await fixture(context); await attach(value); value.state.asyncParentEvent = true;
  value.frame({ method: "Runtime.executionContextsCleared", params: {}, sessionId: "parent-session" });
  await until(() => value.channel.status().failed); await delay(5);
  assert.equal(value.channel.status().fatal, false); await assert.rejects(value.dependency.assertOriginalOwner());
});

void test("a late breakpoint reply is retained without a channel allocation timeout", async context => {
  const value = await fixture(context); await attach(value);
  value.state.onSend = (): Promise<unknown> => Promise.resolve({ written: true });
  const pending = value.dependency.request(breakpoint); await until(() => value.requests.length === 2);
  await delay(2100); assert.equal(value.channel.status().pendingReplies, 1);
  value.frame({ id: 18, sessionId: "worker-session", result: { breakpointId: "late-point", actualLocation: breakpoint.params.location } });
  assert.deepEqual(await pending, { breakpointId: "late-point", actualLocation: breakpoint.params.location });
  assert.equal(value.channel.status().pendingReplies, 0);
});

void test("allocation result still reaches cleanup after native write acknowledgment is lost", async context => {
  const value = await fixture(context); await attach(value);
  value.state.onSend = (): Promise<unknown> => Promise.reject(new Error("Synthetic lost WriteFile acknowledgment"));
  const pending = value.dependency.request(breakpoint); await until(() => value.channel.status().failed);
  value.frame({ id: 18, sessionId: "worker-session", result: { breakpointId: "original-point", actualLocation: breakpoint.params.location } });
  assert.deepEqual(await pending, { breakpointId: "original-point", actualLocation: breakpoint.params.location });
  await assert.rejects(value.dependency.assertOriginalOwner());
});

void test("wrong-session and duplicate replies poison the original channel", async context => {
  const value = await fixture(context); await attach(value);
  value.state.onSend = (): Promise<unknown> => Promise.resolve({ written: true });
  const pending = value.dependency.request({ method: "Runtime.enable", params: {}, sessionId: "worker-session" });
  const rejected = assert.rejects(pending); await until(() => value.requests.length === 2);
  value.frame({ id: 18, sessionId: "foreign", result: {} }); await rejected;
  assert.equal(value.channel.status().fatal, true);
});

void test("complete source replies cross bounded64KiB native chunks without generic text truncation", async context => {
  const value = await fixture(context); await attach(value); const source = "x".repeat(2_181_284);
  value.state.onSend = (request: NativeSend): Promise<unknown> => {
    value.frame({ id: request["requestId"], sessionId: "worker-session", result: { scriptSource: source } }); return Promise.resolve({ written: true });
  };
  const result = await value.dependency.request({ method: "Debugger.getScriptSource", params: { scriptId: "script" }, sessionId: "worker-session" });
  assert.deepEqual(result, { scriptSource: source }); assert.equal(value.channel.status().failed, false);
});

void test("duplicate JSON keys and unknown worker events fail closed", async context => {
  const value = await fixture(context); await attach(value);
  value.raw(Buffer.from('{"method":"Debugger.resumed","params":{},"sessionId":"worker-session","sessionId":"foreign"}\0'));
  await until(() => value.channel.status().failed); assert.equal(value.channel.status().fatal, true);
});

void test("native identity and termination callbacks wait for the original held poll", async () => {
  const held = Promise.withResolvers<unknown>(), parent = Object.freeze({ targetId: "p", sessionId: "s", nextRequestId: 1 });
  let insidePoll = false, parentChecks = 0, terminationChecks = 0;
  const native: CurrentPcbWorkerStartupNativeDependency = {
    requireOriginalParent: (): Promise<CurrentPcbWorkerStartupParent> => {
      assert.equal(insidePoll, false); parentChecks += 1; return Promise.resolve(parent);
    },
    assertOriginalTermination: (): Promise<void> => { assert.equal(insidePoll, false); terminationChecks += 1; return Promise.resolve(); },
    observeOriginalParentEvent: (): void => { assert.fail("No parent event expected"); },
    exchange: async request => {
      assert.equal(request.action, "poll"); assert.equal(insidePoll, false); insidePoll = true;
      try { return await held.promise; } finally { insidePoll = false; }
    },
  };
  const channel = new CurrentPcbWorkerStartupChannel(native), dependency = await channel.start();
  dependency.subscribe(() => { assert.fail("No worker event expected"); });
  await until(() => insidePoll);
  const current = assert.rejects(dependency.assertOriginalOwner()), release = channel.releaseAfterTermination();
  await delay(10); assert.equal(parentChecks, 1); assert.equal(terminationChecks, 0);
  held.resolve({ bytes: "" }); await current; await release;
  assert.equal(parentChecks, 1); assert.equal(terminationChecks, 1); assert.equal(channel.status().released, true);
});

void test("release cannot overlap the original start parent read or return a closing dependency", async () => {
  const held = Promise.withResolvers<CurrentPcbWorkerStartupParent>(); let parentPending = false, terminationChecks = 0;
  const channel = new CurrentPcbWorkerStartupChannel({
    requireOriginalParent: async (): Promise<CurrentPcbWorkerStartupParent> => {
      parentPending = true; try { return await held.promise; } finally { parentPending = false; }
    },
    assertOriginalTermination: (): Promise<void> => { assert.equal(parentPending, false); terminationChecks += 1; return Promise.resolve(); },
    observeOriginalParentEvent: (): void => { assert.fail("No parent event expected"); },
    exchange: (): Promise<unknown> => { assert.fail("No native exchange expected"); },
  });
  const starting = assert.rejects(channel.start(), /START_CLOSING/u); await until(() => parentPending);
  const closing = channel.releaseAfterTermination(); await delay(5); assert.equal(terminationChecks, 0);
  held.resolve(Object.freeze({ targetId: "p", sessionId: "s", nextRequestId: 1 }));
  await starting; await closing; assert.equal(terminationChecks, 1); assert.equal(channel.status().released, true);
});

void test("startup channel retains original native refusal diagnostics without trusting arbitrary error messages", async context => {
  for (const nativeRefusal of [true, false]) {
    const value = await fixture(context);
    value.state.onSend = (): Promise<unknown> => Promise.reject(nativeRefusal ?
      issueCurrentPcbDiagnosticNativeRefusal("pcb-diagnostic-footprint-copy-worker-field") : new Error("private arbitrary/native-looking error"));
    await assert.rejects(value.dependency.request({ method: "Target.getTargets", params: {} }), /WRITE/u);
    assert.deepEqual(value.channel.status().exchangeFailure, { requestId: 17, method: "Target.getTargets",
      nativeCode: nativeRefusal ? "pcb-diagnostic-footprint-copy-worker-field" : null,
      kind: nativeRefusal ? "native-refusal" : "unrecognized-exchange-failure" });
    assert.equal(JSON.stringify(value.channel.status()).includes("private arbitrary"), false);
    assert.equal(value.requests.length, 1); await assert.rejects(value.dependency.request({ method: "Target.getTargets", params: {} }));
    assert.equal(value.requests.length, 1);
  }
});
