import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES } from "../src/current-pcb-209-worker-startup-profile.ts";
import { CurrentPcb209WorkerConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_SITES } from "../src/current-pcb-worker-construction-contract.ts";
import { CurrentPcb209WorkerStartupChannel } from "../src/current-pcb-worker-startup-channel.ts";
import type { CurrentPcbWorkerStartupNativeDependency } from "../src/current-pcb-worker-startup-channel.ts";
import { CurrentPcb209WorkerStartupChannelObservationRunner } from "../src/current-pcb-worker-startup-channel-observation-runner.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "../src/current-pcb-worker-startup-contract.ts";
import { currentPcbWorkerStartupNativeCases, currentPcbWorkerStartupNativeParentCases } from "../src/current-pcb-worker-startup-native.ts";
import { CurrentPcb209WorkerStartupTransport } from "../src/current-pcb-worker-startup-transport.ts";
// oxlint-disable-next-line import/max-dependencies -- This integration test checks fixed-profile ownership across the wire, channel, transport and construction boundaries together.
import { currentPcb209WorkerStartupWire, currentPcbWorkerStartupWire } from "../src/current-pcb-worker-startup-wire.ts";
import { PCB209_STARTUP_FIXTURE_IDENTITY, worker209BootstrapInspector } from "./helpers/current-pcb-worker-startup-inspector.ts";

const serial = { method: "Debugger.setBreakpoint", sessionId: "worker-session", params: { location: {
  scriptId: "script", lineNumber: CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES.serial.lineNumber,
  columnNumber: CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES.serial.columnNumber,
} } } as const;
const oldSerial = { ...serial, params: { location: { ...serial.params.location,
  columnNumber: CURRENT_PCB_WORKER_CONSTRUCTION_SITES.serial.columnNumber } } };

void test("generation209 wire changes only its fixed serial coordinates and carries no caller code or profile", () => {
  const samples = [...currentPcbWorkerStartupNativeCases(), ...currentPcbWorkerStartupNativeParentCases()];
  for (const sample of samples) {
    if (sample.method === "Debugger.setBreakpoint" && sample.params.location.lineNumber === oldSerial.params.location.lineNumber) {
      assert.throws(() => currentPcb209WorkerStartupWire(sample, 1), /STARTUP_WIRE/u);
    } else { assert.deepEqual(currentPcb209WorkerStartupWire(sample, 256), currentPcbWorkerStartupWire(sample, 256)); }
  }
  const wire = currentPcb209WorkerStartupWire(serial, 1);
  assert.equal(wire.request["site"], "serial"); assert.equal(wire.request["action"], "worker-startup-send");
  assert.equal(Object.hasOwn(wire.request, "columnNumber"), false); assert.equal(Object.hasOwn(wire.request, "profile"), false);
  assert.throws(() => currentPcbWorkerStartupWire(serial, 1), /STARTUP_WIRE/u);
  assert.throws(() => currentPcb209WorkerStartupWire({ ...serial, generation: "legacy" }, 1));
  assert.throws(() => currentPcb209WorkerStartupWire(serial, 257), /STARTUP_WIRE/u);
});

void test("generation209 channel retains the original native counter and fixed wire through its cleanup budget", async () => {
  const parent = Object.freeze({ targetId: "parent", sessionId: "parent-session", nextRequestId: 254 });
  const frames: Buffer[] = [], writes: Readonly<Record<string, string | number>>[] = [];
  let terminated = false;
  const native: CurrentPcbWorkerStartupNativeDependency = {
    requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => { assert.ok(terminated); return Promise.resolve(); },
    observeOriginalParentEvent: (): void => {
      // This fixture emits only its attached worker.
    },
    exchange: request => {
      if (request.action === "poll") { return Promise.resolve({ bytes: (frames.shift() ?? Buffer.alloc(0)).toString("base64") }); }
      assert.ok("requestId" in request); writes.push(request);
      if (request["startupPhase"] === "attach") {
        frames.push(Buffer.from(`${JSON.stringify({ method: "Target.attachedToTarget", sessionId: "parent-session", params: {
          sessionId: "worker-session", waitingForDebugger: true, targetInfo: { targetId: "worker", type: "worker", attached: true, title: "fixture", url: "file:///fixture" },
        } })}\0`));
      }
      frames.push(Buffer.from(`${JSON.stringify({ id: request["requestId"], sessionId: request["sessionId"], result: {} })}\0`));
      return Promise.resolve({ written: true });
    },
  };
  const channel = new CurrentPcb209WorkerStartupChannel(native);
  try {
    const dependency = await channel.start();
    dependency.subscribe(event => { assert.equal(event.method, "Target.attachedToTarget"); });
    await dependency.request({ method: "Target.setAutoAttach", sessionId: "parent-session", params: CURRENT_PCB_WORKER_STARTUP_ATTACH });
    await assert.rejects(dependency.request(oldSerial), /STARTUP_WIRE/u);
    await dependency.request(serial);
    await dependency.request({ method: "Debugger.removeBreakpoint", sessionId: "worker-session", params: { breakpointId: "retained" } });
    await assert.rejects(dependency.request(serial), /REQUEST_BUDGET/u);
    assert.deepEqual(writes.map(write => write["requestId"]), [254, 255, 256]);
    assert.equal(writes[1]?.["site"], "serial"); assert.equal(channel.status().pendingReplies, 0);
  } finally { terminated = true; await channel.releaseAfterTermination(); }
});

void test("fixed209 startup qualifies its real V8 bootstrap then refuses inert imported preload without replaying either pause", { timeout: 30_000 }, async context => {
  const fixture = await worker209BootstrapInspector(context), owner = new CurrentPcb209WorkerStartupTransport(fixture.dependency);
  owner.bindExpectedProject(PCB209_STARTUP_FIXTURE_IDENTITY);
  owner.bindExistingWorkers({ targetInfos: [{ targetId: "parent-target", type: "page", attached: true, title: "fixture", url: "https://client/" }] });
  await assert.rejects(owner.capture(), /SOURCE/u); await fixture.completion;
  assert.equal(owner.status().sourceQualified, false);
  assert.deepEqual(owner.status().bootstrapStages.slice(0, 2).map(stage => ({ role: stage.role, qualified: stage.sourceQualified,
    resumed: stage.resumeSeen })), [{ role: "bootstrap", qualified: true, resumed: true }, { role: "preload", qualified: false, resumed: true }]);
  assert.equal(fixture.commands.filter(method => method === "Debugger.getScriptSource").length, 2);
  assert.equal(fixture.commands.filter(method => method === "Debugger.setBreakpoint").length, 0);
  assert.equal(fixture.commands.filter(method => method === "Debugger.resume").length, 2);
  await owner.cleanup(); assert.equal(fixture.commands.filter(method => method === "Debugger.resume").length, 2);
  await assert.rejects(owner.releaseAfterTermination()); await fixture.stopped(); await owner.releaseAfterTermination();
});

void test("fixed209 wrappers reject reflected private-core profile and decoder injection", () => {
  for (const Wrapper of [CurrentPcb209WorkerConstructionRunner, CurrentPcb209WorkerStartupChannelObservationRunner,
    CurrentPcb209WorkerStartupTransport, CurrentPcb209WorkerStartupChannel]) {
    const core: unknown = Object.getPrototypeOf(Wrapper); assert.ok(typeof core === "function");
    assert.throws(() => Reflect.construct(core, [Symbol("foreign"), {}, {}, (): null => null]), /INTERNAL_PROFILE|internal fixed profile/u);
  }
});
