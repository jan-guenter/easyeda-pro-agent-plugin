import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate } from "node:timers/promises";
import { CurrentPcbWorkerStartupTransport } from "../src/current-pcb-worker-startup-transport.ts";
import type { CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupEvent } from "../src/current-pcb-worker-startup-contract.ts";
import { CURRENT_PCB_DIAGNOSTIC_WORKER_SCRIPT } from "../src/current-pcb-diagnostic-worker-context.ts";
import { workerStartupInspector } from "./helpers/current-pcb-worker-startup-inspector.ts";

void test("startup instruments actual V8 before execution then captures all nine constructor pauses", { timeout: 30_000 }, async context => {
  const fixture = await workerStartupInspector(context), owner = new CurrentPcbWorkerStartupTransport(fixture.dependency, fixture.profile);
  const capture = owner.capture(); await owner.whenArmed();
  const packet = await capture; await fixture.completion;
  assert.equal(packet.executionAuthorized, false); assert.equal(await fixture.completed(), true);
  assert.equal(fixture.commands.filter(method => method === "Runtime.runIfWaitingForDebugger").length, 1);
  assert.equal(fixture.commands.filter(method => method === "Debugger.resume").length, 10);
  assert.equal(fixture.commands.filter(method => method === "Debugger.setBreakpoint").length, 8);
  assert.ok(fixture.commands.indexOf("Debugger.getScriptSource") < fixture.commands.indexOf("Debugger.setBreakpoint"));
  assert.ok(fixture.commands.indexOf("Debugger.setBreakpoint") < fixture.commands.indexOf("Debugger.resume"));
  const runner = await owner.requireOriginal(packet);
  const assignments = await runner.proveCurrentAssignments(packet);
  await runner.requireCurrentAssignments(packet, assignments);
  assert.equal(assignments.executionAuthorized, false); await runner.release();
  await assert.rejects(owner.releaseAfterTermination()); await fixture.stopped(); await owner.releaseAfterTermination();
  assert.equal(owner.status().released, true); await assert.rejects(owner.capture(), /CONSUMED/u);
});

void test("startup armed barrier requires original auto-attach acknowledgement and abort preserves cleanup ownership", async () => {
  const acknowledged = Promise.withResolvers<unknown>();
  let entered = false, removed = false, terminated = false;
  const dependency: CurrentPcbWorkerStartupDependency = Object.freeze({ parentTargetId: "parent", parentSessionId: "session",
    assertOriginalOwner: (): Promise<void> => Promise.resolve(),
    assertOriginalTermination: (): Promise<void> => { assert.equal(terminated, true); return Promise.resolve(); },
    request: (command: Parameters<CurrentPcbWorkerStartupDependency["request"]>[0]): Promise<unknown> => {
      assert.equal(command.method, "Target.setAutoAttach"); entered = true; return acknowledged.promise;
    },
    subscribe: (): (() => void) => (): void => { removed = true; },
  });
  const owner = new CurrentPcbWorkerStartupTransport(dependency);
  const capture = owner.capture(), rejected = assert.rejects(capture, /ABORTED/u);
  let armed = false; const barrier = (async (): Promise<void> => { await owner.whenArmed(); armed = true; })();
  await setImmediate(); assert.equal(entered, true); assert.equal(armed, false);
  acknowledged.resolve({}); await barrier; assert.equal(armed, true);
  await owner.abort(); await rejected; assert.equal(removed, false);
  await assert.rejects(owner.whenArmed(), /ABORTED/u);
  await assert.rejects(owner.releaseAfterTermination()); assert.equal(removed, false);
  terminated = true; await owner.releaseAfterTermination(); assert.equal(removed, true);
});

void test("sealed expected project title rejects a different waiting worker before debugger qualification", async () => {
  const commands: string[] = [];
  let listener: ((event: CurrentPcbWorkerStartupEvent) => void) | null = null;
  const dependency: CurrentPcbWorkerStartupDependency = Object.freeze({ parentTargetId: "parent", parentSessionId: "parent-session",
    assertOriginalOwner: (): Promise<void> => Promise.resolve(), assertOriginalTermination: (): Promise<void> => Promise.resolve(),
    subscribe: (value: (event: CurrentPcbWorkerStartupEvent) => void): (() => void) => {
      listener = value; return (): void => { listener = null; };
    },
    request: (command: Parameters<CurrentPcbWorkerStartupDependency["request"]>[0]): Promise<unknown> => {
      commands.push(command.method);
      if (command.method === "Target.setAutoAttach") {
        listener?.({ method: "Target.attachedToTarget", sessionId: "parent-session", params: { sessionId: "worker-session",
          waitingForDebugger: true, targetInfo: { targetId: "worker-target", type: "worker", attached: true,
            title: `project_${"d".repeat(64)}_window`, url: `https://client/${CURRENT_PCB_DIAGNOSTIC_WORKER_SCRIPT.relativePath}` } } });
      }
      return Promise.resolve({});
    },
  });
  const owner = new CurrentPcbWorkerStartupTransport(dependency);
  const expected = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "window" };
  owner.bindExpectedProject(expected);
  assert.throws(() => { owner.bindExpectedProject(expected); }, /CONSUMED/u);
  await assert.rejects(owner.capture());
  assert.equal(commands.filter(method => method === "Runtime.runIfWaitingForDebugger").length, 1);
  assert.equal(commands.includes("Runtime.enable"), false); assert.equal(commands.includes("Debugger.enable"), false);
  await owner.releaseAfterTermination();
});

void test("full-source refusal resumes the original instrumentation pause without arming construction", { timeout: 30_000 }, async context => {
  const fixture = await workerStartupInspector(context), owner = new CurrentPcbWorkerStartupTransport(fixture.dependency);
  await assert.rejects(owner.capture());
  assert.equal(owner.status().sourceQualified, false);
  assert.equal(fixture.commands.filter(method => method === "Debugger.setBreakpoint").length, 0);
  assert.equal(fixture.commands.filter(method => method === "Runtime.runIfWaitingForDebugger").length, 1);
  await fixture.stopped(); await owner.releaseAfterTermination();
});

void test("source digest drift consumes initial resume and removes instrumentation once", { timeout: 30_000 }, async context => {
  const fixture = await workerStartupInspector(context);
  const owner = new CurrentPcbWorkerStartupTransport(fixture.dependency, { ...fixture.profile, scriptSha256: "0".repeat(64) });
  await assert.rejects(owner.capture(), /SOURCE/u); await fixture.completion;
  assert.equal(await fixture.completed(), true);
  assert.equal(fixture.commands.filter(method => method === "Debugger.resume").length, 1);
  assert.equal(fixture.commands.filter(method => method === "Debugger.removeBreakpoint").length, 1);
  assert.equal(owner.status().initialResumeSeen, true); await owner.cleanup();
  assert.equal(fixture.commands.filter(method => method === "Debugger.resume").length, 1);
  await fixture.stopped(); await owner.releaseAfterTermination();
});

void test("lost initial resume reply is never replayed and original listener remains until termination", { timeout: 30_000 }, async context => {
  const fixture = await workerStartupInspector(context); let attempted = false;
  const dependency: CurrentPcbWorkerStartupDependency = { ...fixture.dependency, request: async command => {
    const reply = await fixture.dependency.request(command);
    if (command.method === "Debugger.resume" && !attempted) { attempted = true; throw new Error("Synthetic missing resume reply"); }
    return reply;
  } };
  const owner = new CurrentPcbWorkerStartupTransport(dependency, { ...fixture.profile, scriptSha256: "0".repeat(64) });
  await assert.rejects(owner.capture()); await fixture.completion;
  assert.equal(fixture.commands.filter(method => method === "Debugger.resume").length, 1);
  assert.equal(owner.status().released, false); await fixture.stopped(); await owner.releaseAfterTermination();
});

void test("owner drift after instrumentation allocation retains and removes its original breakpoint", { timeout: 30_000 }, async context => {
  const fixture = await workerStartupInspector(context); let current = true;
  const dependency: CurrentPcbWorkerStartupDependency = { ...fixture.dependency,
    assertOriginalOwner: async (): Promise<void> => { await fixture.dependency.assertOriginalOwner(); assert.equal(current, true); },
    request: async command => {
      const reply = await fixture.dependency.request(command);
      if (command.method === "Debugger.setInstrumentationBreakpoint") { current = false; }
      return reply;
    },
  };
  const owner = new CurrentPcbWorkerStartupTransport(dependency, fixture.profile);
  await assert.rejects(owner.capture()); await fixture.completion;
  assert.equal(fixture.commands.filter(method => method === "Debugger.removeBreakpoint").length, 1);
  assert.equal(fixture.commands.filter(method => method === "Runtime.runIfWaitingForDebugger").length, 1);
  assert.equal(fixture.commands.filter(method => method === "Debugger.setBreakpoint").length, 0);
  assert.equal(owner.status().unresolvedInstrumentation, false);
  await fixture.stopped(); await owner.releaseAfterTermination();
});

void test("dependency substitution cannot redirect source-refusal cleanup", { timeout: 30_000 }, async context => {
  const fixture = await workerStartupInspector(context); let redirected = 0;
  const dependency: CurrentPcbWorkerStartupDependency = { ...fixture.dependency, request: async command => {
    const reply = await fixture.dependency.request(command);
    if (command.method === "Debugger.getScriptSource") {
      Object.defineProperty(dependency, "request", { value: (): Promise<unknown> => { redirected += 1; return Promise.resolve({}); } });
    }
    return reply;
  } };
  const owner = new CurrentPcbWorkerStartupTransport(dependency, fixture.profile);
  await assert.rejects(owner.capture()); await fixture.completion;
  assert.equal(redirected, 0); assert.equal(fixture.commands.filter(method => method === "Debugger.resume").length, 1);
  await fixture.stopped();
  // A changed dependency cannot claim even termination-based release. The
  // Original native owner retains the listener; the test closes its own child.
  await assert.rejects(owner.releaseAfterTermination(), /DEPENDENCY_CHANGED/u);
});

void test("late instrumentation reply retains the worker wait until original breakpoint removal", { timeout: 30_000 }, async context => {
  const delayed = Promise.withResolvers<unknown>(), fixture = await workerStartupInspector(context); let retained: unknown;
  const dependency: CurrentPcbWorkerStartupDependency = { ...fixture.dependency, request: async command => {
    const reply = await fixture.dependency.request(command);
    if (command.method === "Debugger.setInstrumentationBreakpoint") { retained = reply; return delayed.promise; }
    return reply;
  } };
  const owner = new CurrentPcbWorkerStartupTransport(dependency, fixture.profile);
  await assert.rejects(owner.capture());
  assert.equal(owner.status().unresolvedInstrumentation, true);
  assert.equal(fixture.commands.filter(method => method === "Runtime.runIfWaitingForDebugger").length, 0);
  delayed.resolve(retained); await fixture.completion;
  assert.equal(fixture.commands.filter(method => method === "Debugger.removeBreakpoint").length, 1);
  assert.equal(fixture.commands.filter(method => method === "Runtime.runIfWaitingForDebugger").length, 1);
  assert.ok(fixture.commands.indexOf("Debugger.removeBreakpoint") < fixture.commands.indexOf("Runtime.runIfWaitingForDebugger"));
  assert.equal(owner.status().unresolvedInstrumentation, false);
  await fixture.stopped(); await owner.releaseAfterTermination();
});

void test("source reply accessors refuse without executing host getters", { timeout: 30_000 }, async context => {
  const fixture = await workerStartupInspector(context); let getterCalls = 0;
  const dependency: CurrentPcbWorkerStartupDependency = { ...fixture.dependency, request: async command => {
    const reply = await fixture.dependency.request(command);
    if (command.method === "Debugger.getScriptSource") {
      return Object.defineProperty({}, "scriptSource", { enumerable: true, get: (): string => { getterCalls += 1; return "unsafe"; } });
    }
    return reply;
  } };
  const owner = new CurrentPcbWorkerStartupTransport(dependency, fixture.profile);
  await assert.rejects(owner.capture(), /SOURCE/u); await fixture.completion;
  assert.equal(getterCalls, 0); assert.equal(fixture.commands.filter(method => method === "Debugger.setBreakpoint").length, 0);
  await fixture.stopped(); await owner.releaseAfterTermination();
});

void test("late first attachment after lost autoattach reply releases only its original wait", async () => {
  const commands: string[] = [], listener: { event?: (event: CurrentPcbWorkerStartupEvent) => void } = {};
  const dependency: CurrentPcbWorkerStartupDependency = {
    parentTargetId: "parent-target", parentSessionId: "parent-session",
    assertOriginalOwner: (): Promise<void> => Promise.resolve(), assertOriginalTermination: (): Promise<void> => Promise.resolve(),
    subscribe: event => { listener.event = event; return (): void => { delete listener.event; }; },
    request: command => {
      commands.push(command.method);
      if (command.method === "Target.setAutoAttach") { return Promise.reject(new Error("Synthetic lost attach acknowledgment")); }
      assert.equal(command.method, "Runtime.runIfWaitingForDebugger"); assert.equal(command.sessionId, "worker-session");
      return Promise.resolve({});
    },
  };
  const owner = new CurrentPcbWorkerStartupTransport(dependency);
  await assert.rejects(owner.capture()); assert.equal(owner.status().attachedWorkers, 0);
  assert.ok(listener.event);
  listener.event({ method: "Target.attachedToTarget", sessionId: "parent-session", params: {
    sessionId: "worker-session", waitingForDebugger: true, targetInfo: { type: "worker", attached: true,
      targetId: "worker-target", title: "synthetic", url: "file:///pro-mgr/3.2.184.355087e9/js/project-worker.js" },
  } });
  await owner.cleanup();
  assert.equal(commands.filter(method => method === "Runtime.runIfWaitingForDebugger").length, 1);
  assert.equal(owner.status().attachedWorkers, 1); await owner.releaseAfterTermination();
});

void test("late construction allocation retains its ID and holds initial pause until removal", { timeout: 30_000 }, async context => {
  const delayed = Promise.withResolvers<unknown>(), fixture = await workerStartupInspector(context), removed = Promise.withResolvers<null>();
  let allocatedId = "", retained: unknown;
  const dependency: CurrentPcbWorkerStartupDependency = { ...fixture.dependency, request: async command => {
    const reply = await fixture.dependency.request(command);
    if (command.method === "Debugger.setBreakpoint") {
      assert.ok(reply !== null && typeof reply === "object");
      const id: unknown = Object.getOwnPropertyDescriptor(reply, "breakpointId")?.value;
      assert.equal(typeof id, "string"); assert.ok(typeof id === "string");
      allocatedId = id; retained = reply; return delayed.promise;
    }
    if (command.method === "Debugger.removeBreakpoint" && command.params.breakpointId === allocatedId) { removed.resolve(null); }
    return reply;
  } };
  const owner = new CurrentPcbWorkerStartupTransport(dependency, fixture.profile);
  await assert.rejects(owner.capture());
  assert.equal(owner.status().initialPauseSeen, true); assert.equal(owner.status().initialResumeAttempted, false);
  assert.equal(fixture.commands.filter(method => method === "Debugger.resume").length, 0);
  delayed.resolve(retained); await removed.promise; await setImmediate(); await owner.cleanup(); await fixture.completion;
  assert.equal(owner.status().initialResumeSeen, true);
  assert.equal(fixture.commands.filter(method => method === "Debugger.removeBreakpoint").length, 2);
  assert.equal(fixture.commands.filter(method => method === "Debugger.resume").length, 1);
  await owner.cleanup(); assert.equal(fixture.commands.filter(method => method === "Debugger.resume").length, 1);
  await fixture.stopped(); await owner.releaseAfterTermination();
});
