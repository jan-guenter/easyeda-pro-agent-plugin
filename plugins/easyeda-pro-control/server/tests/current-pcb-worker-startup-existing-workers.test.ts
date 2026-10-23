import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate } from "node:timers/promises";
import { CurrentPcbWorkerStartupChannel } from "../src/current-pcb-worker-startup-channel.ts";
import { CurrentPcbWorkerStartupTransport } from "../src/current-pcb-worker-startup-transport.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupEvent } from "../src/current-pcb-worker-startup-contract.ts";
import { CURRENT_PCB_DIAGNOSTIC_WORKER_SCRIPT } from "../src/current-pcb-diagnostic-worker-context.ts";
import { workerStartupInspector } from "./helpers/current-pcb-worker-startup-inspector.ts";

const expected = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "window" });
const projectTitle = `project_${expected.projectUuid}_${expected.windowTabId}`;
const projectUrl = `file:///${CURRENT_PCB_DIAGNOSTIC_WORKER_SCRIPT.relativePath}`;
const parent = Object.freeze({ targetId: "parent-target", type: "page", attached: true, title: "Start Page", url: "file:///client.html" });
const background = Object.freeze({ targetId: "background-target", type: "worker", attached: false, title: "", url: "" });
function inventory(count = 3): Readonly<{ targetInfos: readonly Readonly<Record<string, unknown>>[] }> {
  return { targetInfos: [parent, ...Array.from({ length: count }, (_, index) => ({ ...background, targetId: `background-${index}` }))] };
}
function attachment(index: number, patch: Readonly<Record<string, unknown>> = {}, waitingForDebugger = false): CurrentPcbWorkerStartupEvent {
  return { method: "Target.attachedToTarget", sessionId: "parent-session", params: {
    sessionId: `background-session-${index}`, waitingForDebugger, targetInfo: { ...background, attached: true, targetId: `background-${index}`, ...patch },
  } };
}
function synthetic(): Readonly<{
  owner: CurrentPcbWorkerStartupTransport; commands: CurrentPcbWorkerStartupCommand[];
  state: { attachEvents: readonly CurrentPcbWorkerStartupEvent[]; listener: ((event: CurrentPcbWorkerStartupEvent) => void) | null };
}> {
  const commands: CurrentPcbWorkerStartupCommand[] = [];
  const state: { attachEvents: readonly CurrentPcbWorkerStartupEvent[]; listener: ((event: CurrentPcbWorkerStartupEvent) => void) | null } = {
    attachEvents: [], listener: null,
  };
  const dependency: CurrentPcbWorkerStartupDependency = Object.freeze({ parentTargetId: "parent-target", parentSessionId: "parent-session",
    assertOriginalOwner: (): Promise<void> => Promise.resolve(), assertOriginalTermination: (): Promise<void> => Promise.resolve(),
    subscribe: (listener: (event: CurrentPcbWorkerStartupEvent) => void): (() => void) => {
      state.listener = listener; return (): void => { state.listener = null; };
    },
    request: (command: CurrentPcbWorkerStartupCommand): Promise<unknown> => {
      commands.push(command);
      if (command.method === "Target.setAutoAttach") { for (const event of state.attachEvents) { state.listener?.(event); } }
      else { assert.equal(command.method, "Runtime.runIfWaitingForDebugger"); }
      return Promise.resolve({});
    },
  });
  const owner = new CurrentPcbWorkerStartupTransport(dependency); owner.bindExpectedProject(expected);
  return { owner, commands, state };
}

void test("three browser placeholders gain renderer metadata without disturbing actual V8 project construction capture", { timeout: 30_000 }, async context => {
  const fixture = await workerStartupInspector(context), sent: CurrentPcbWorkerStartupCommand[] = [];
  let listener: ((event: CurrentPcbWorkerStartupEvent) => void) | null = null;
  const dependency: CurrentPcbWorkerStartupDependency = { ...fixture.dependency,
    subscribe: value => {
      listener = value;
      return fixture.dependency.subscribe(event => {
        if (event.method === "Target.attachedToTarget") {
          value({ ...event, params: { ...event.params, targetInfo: { targetId: "worker-target", type: "worker", attached: true,
            title: projectTitle, url: `file:///${fixture.profile.relativePath}` } } });
        } else if (event.method === "Runtime.executionContextCreated") {
          const item: unknown = event.params["context"]; assert.ok(item !== null && typeof item === "object");
          value({ ...event, params: { context: { ...item, name: projectTitle } } });
        } else { value(event); }
      });
    },
    request: command => {
      sent.push(command);
      if (command.method === "Target.setAutoAttach") {
        for (let index = 0; index < 3; index += 1) {
          listener?.(attachment(index, { title: `background-${index}`, url: `file:///workers/background-${index}.js` }));
        }
      }
      return fixture.dependency.request(command);
    },
  };
  const owner = new CurrentPcbWorkerStartupTransport(dependency, fixture.profile);
  owner.bindExpectedProject(expected); owner.bindExistingWorkers(inventory());
  const capture = owner.capture(); await owner.whenArmed(); const packet = await capture;
  await fixture.completion; assert.equal(packet.executionAuthorized, false); assert.equal(await fixture.completed(), true);
  assert.equal(owner.status().attachedWorkers, 4); assert.equal(owner.status().existingWorkersObserved, 3);
  assert.equal(owner.status().existingWorkersAttached, 3); assert.equal(owner.status().firstEventFailure, null);
  assert.ok(sent.every(command => command.sessionId === "parent-session" || command.sessionId === "worker-session"));
  await owner.cleanup(); assert.equal(sent.filter(command => command.method === "Runtime.runIfWaitingForDebugger").length, 1);
  await fixture.stopped(); await owner.releaseAfterTermination();
});

void test("native channel preserves placeholder identity while transport selects only the newly paused project", async () => {
  const frames: Buffer[] = [], sent: Readonly<Record<string, string | number>>[] = [];
  const frame = (value: unknown): void => { frames.push(Buffer.from(`${JSON.stringify(value)}\0`)); };
  const originalParent = Object.freeze({ targetId: "parent-target", sessionId: "parent-session", nextRequestId: 1 });
  let terminated = false;
  const channel = new CurrentPcbWorkerStartupChannel({
    requireOriginalParent: (): Promise<typeof originalParent> => Promise.resolve(originalParent),
    assertOriginalTermination: (): Promise<void> => { assert.equal(terminated, true); return Promise.resolve(); },
    observeOriginalParentEvent: (): void => { assert.fail("No parent event expected in this synthetic case"); },
    exchange: (request): Promise<unknown> => {
      if (request.action === "poll") { return Promise.resolve({ bytes: (frames.shift() ?? Buffer.alloc(0)).toString("base64") }); }
      assert.ok("requestId" in request); sent.push(request);
      if (request["method"] === "Target.setAutoAttach") {
        for (let index = 0; index < 3; index += 1) {
          frame(attachment(index, { title: `background-${index}`, url: `file:///workers/background-${index}.js` }));
        }
        frame({ method: "Target.attachedToTarget", sessionId: "parent-session", params: { sessionId: "project-session",
          waitingForDebugger: true, targetInfo: { targetId: "project-target", type: "worker", attached: true, title: projectTitle, url: projectUrl } } });
      }
      // This case stops after proving the selected Runtime.enable destination.
      // The separate real-V8 case above exercises complete construction capture.
      if (request["method"] === "Runtime.enable") { frame({ id: request["requestId"], sessionId: request["sessionId"], error: { code: -32_000, message: "synthetic stop" } }); }
      else { frame({ id: request["requestId"], sessionId: request["sessionId"], result: {} }); }
      return Promise.resolve({ written: true });
    },
  });
  const owner = new CurrentPcbWorkerStartupTransport(await channel.start());
  owner.bindExpectedProject(expected); owner.bindExistingWorkers(inventory());
  try {
    await assert.rejects(owner.capture()); assert.equal(owner.status().firstEventFailure, null);
    assert.equal(owner.status().existingWorkersAttached, 3); assert.equal(channel.status().attachedWorkers, 4);
    assert.deepEqual(sent.map(command => [command["method"], command["sessionId"]]), [
      ["Target.setAutoAttach", "parent-session"], ["Runtime.enable", "project-session"], ["Runtime.runIfWaitingForDebugger", "project-session"],
    ]);
  } finally { terminated = true; await owner.releaseAfterTermination(); await channel.releaseAfterTermination(); }
});

void test("fifteen existing workers consume no waiting cleanup commands and inventory cannot be rebound", async () => {
  const value = synthetic(); value.owner.bindExistingWorkers(inventory(15));
  assert.throws(() => { value.owner.bindExistingWorkers(inventory()); }, /CONSUMED/u);
  value.state.attachEvents = Array.from({ length: 15 }, (_, index) => attachment(index));
  const rejected = assert.rejects(value.owner.capture(), /ABORTED/u); await value.owner.whenArmed();
  assert.equal(value.owner.status().existingWorkersAttached, 15); await value.owner.abort(); await rejected;
  assert.equal(value.commands.length, 1); await value.owner.releaseAfterTermination();
});

void test("initialized background metadata stays exact and never grants a debugger command", async () => {
  const metadata = { title: "background", url: "file:///workers/background.js" }, value = synthetic();
  value.owner.bindExistingWorkers({ targetInfos: [parent, { ...background, targetId: "background-0", ...metadata }] });
  value.state.attachEvents = [attachment(0, metadata)];
  const rejected = assert.rejects(value.owner.capture(), /ABORTED/u); await value.owner.whenArmed();
  assert.equal(value.owner.status().existingWorkersAttached, 1); await value.owner.abort(); await rejected;
  assert.equal(value.commands.length, 1); await value.owner.releaseAfterTermination();
});

void test("populated browser metadata cannot change, disappear or be independently filled", async () => {
  const cases = [
    { original: { title: "background", url: "file:///workers/background.js" }, changed: { title: "changed", url: "file:///workers/background.js" } },
    { original: { title: "background", url: "file:///workers/background.js" }, changed: { title: "background", url: "file:///changed.js" } },
    { original: { title: "background", url: "file:///workers/background.js" }, changed: { title: "", url: "" } },
    { original: { title: "background", url: "" }, changed: { title: "background", url: "file:///workers/background.js" } },
    { original: { title: "", url: "file:///workers/background.js" }, changed: { title: "background", url: "file:///workers/background.js" } },
  ];
  for (const item of cases) {
    const value = synthetic();
    value.owner.bindExistingWorkers({ targetInfos: [parent, { ...background, targetId: "background-0", ...item.original }] });
    value.state.attachEvents = [attachment(0, item.changed)]; await assert.rejects(value.owner.capture());
    assert.deepEqual(value.owner.status().firstEventFailure, { method: "Target.attachedToTarget", reason: "EXISTING_WORKER_CHANGED" });
    assert.equal(value.owner.status().existingWorkersAttached, 0); assert.equal(value.commands.length, 1);
    await value.owner.releaseAfterTermination();
  }
});

void test("selected, paused, unknown, duplicated and cross-session attachments refuse before qualification", async () => {
  const cases = [
    { events: [attachment(0, { title: projectTitle })], reason: "EXISTING_WORKER_SELECTED", resumes: 0 },
    { events: [attachment(0, { url: projectUrl })], reason: "EXISTING_WORKER_SELECTED", resumes: 0 },
    { events: [attachment(0, { title: projectTitle, url: projectUrl })], reason: "EXISTING_WORKER_SELECTED", resumes: 0 },
    { events: [attachment(0, {}, true)], reason: "EXISTING_WORKER_PAUSED", resumes: 1 },
    { events: [attachment(3)], reason: "WORKER_NOT_WAITING", resumes: 0 },
    { events: [attachment(3, {}, true)], reason: "WORKER_URL", resumes: 1 },
    { events: [attachment(0), attachment(0)], reason: "ATTACHMENT", resumes: 0 },
    { events: [attachment(0), { ...attachment(0), params: { ...attachment(0).params, sessionId: "replacement-session" } }], reason: "ATTACHMENT", resumes: 0 },
    { events: [{ ...attachment(0), sessionId: "foreign-parent" }], reason: "EVENT_SESSION", resumes: 0 },
  ] as const;
  for (const item of cases) {
    const value = synthetic(); value.owner.bindExistingWorkers(inventory()); value.state.attachEvents = item.events;
    await assert.rejects(value.owner.capture());
    assert.deepEqual(value.owner.status().firstEventFailure, { method: "Target.attachedToTarget", reason: item.reason });
    assert.equal(value.commands.filter(command => command.method === "Runtime.runIfWaitingForDebugger").length, item.resumes);
    assert.ok(value.commands.every(command => command.method === "Target.setAutoAttach" || command.method === "Runtime.runIfWaitingForDebugger"));
    await value.owner.releaseAfterTermination();
  }
});

void test("background context, detach and replacement events stay refused with bounded sticky diagnostics", async () => {
  for (const method of ["Runtime.executionContextCreated", "Target.detachedFromTarget", "Target.targetInfoChanged", "private-payload-method"]) {
    const value = synthetic(); value.owner.bindExistingWorkers(inventory()); value.state.attachEvents = [attachment(0)];
    const rejected = assert.rejects(value.owner.capture()); await value.owner.whenArmed();
    const event = { method, sessionId: "background-session-0", params: { privatePayload: "do-not-retain" } };
    value.state.listener?.(event); value.state.listener?.({ ...event, method: "Debugger.paused" }); await rejected;
    const diagnostic = value.owner.status().firstEventFailure;
    assert.deepEqual(diagnostic, { method: method === "private-payload-method" ? "other" : method, reason: "EVENT_SESSION" });
    assert.equal(JSON.stringify(diagnostic).includes("private"), false); assert.equal(JSON.stringify(diagnostic).includes("do-not-retain"), false);
    assert.equal(value.commands.length, 1); await value.owner.releaseAfterTermination();
  }
});

void test("malformed or unsafe existing inventory is consumed before any native dispatch", async () => {
  const invalid = [
    { targetInfos: [parent, { ...background, attached: true }] },
    { targetInfos: [parent, { ...background, title: projectTitle }] },
    { targetInfos: [parent, { ...background, url: projectUrl }] },
    { targetInfos: [parent, background, background] },
    { targetInfos: [parent, { ...background, targetId: parent.targetId }] },
    { targetInfos: [background] }, { targetInfos: [{ ...parent, attached: false }] },
    { targetInfos: [parent, { ...background, title: 1 }] },
    { targetInfos: [parent, { ...background, url: "\uD800" }] }, inventory(16),
  ];
  for (const input of invalid) {
    const value = synthetic(); assert.throws(() => { value.owner.bindExistingWorkers(input); });
    assert.throws(() => { value.owner.bindExistingWorkers(inventory()); }, /CONSUMED/u);
    await assert.rejects(value.owner.capture()); assert.equal(value.commands.length, 0); await value.owner.releaseAfterTermination();
  }
  const value = synthetic(); let getterCalls = 0;
  assert.throws(() => { value.owner.bindExistingWorkers(Object.defineProperty({}, "targetInfos", { enumerable: true,
    get: (): unknown[] => { getterCalls += 1; return []; } })); });
  assert.equal(getterCalls, 0); await assert.rejects(value.owner.capture()); assert.equal(value.commands.length, 0);
  await value.owner.releaseAfterTermination();
});

void test("late paused existing worker receives only its original waiting cleanup after abort", async () => {
  const value = synthetic(); value.owner.bindExistingWorkers(inventory());
  const rejected = assert.rejects(value.owner.capture()); await value.owner.whenArmed(); await value.owner.abort(); await rejected;
  value.state.listener?.(attachment(0, {}, true)); await setImmediate(); await value.owner.cleanup();
  value.state.listener?.(attachment(0, {}, true)); await value.owner.cleanup();
  assert.equal(value.commands.filter(command => command.method === "Runtime.runIfWaitingForDebugger").length, 1);
  assert.deepEqual(value.owner.status().firstEventFailure, { method: "Target.attachedToTarget", reason: "EXISTING_WORKER_PAUSED" });
  await value.owner.releaseAfterTermination();
});
