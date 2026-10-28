/* oxlint-disable import/max-dependencies -- This focused original-channel regression checks the saved-only wire, cache program, ownership markers and cleanup reserve together. */
/** Synthetic native pipe and CDP events. This proves route separation and
 * request accounting, not a connected saved footprint or cache absence. */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { CurrentFootprintCopySavedChannel, isOriginalFootprintExecutionDependency, isOriginalFootprintPreparationDependency,
  isOriginalFootprintSavedDependency, requestCurrentFootprintCopyCacheConstruction, requestCurrentFootprintCopyTransactionClock } from "../src/current-pcb-worker-startup-channel.ts";
import { CurrentFootprintCopySavedWorkerStartupTransport, CurrentFootprintCopyWorkerStartupTransport,
  CurrentPcb209WorkerStartupTransport } from "../src/current-pcb-worker-startup-transport.ts";
import { CURRENT_FOOTPRINT_COPY_SAVED_PROFILE as PROFILE } from "../src/current-footprint-copy-saved-profile.ts";
import { currentFootprintCopySavedQueueCommand } from "../src/current-footprint-copy-saved-queue.ts";
import { currentFootprintCopyExecutionStartupWire, currentFootprintCopySavedStartupWire } from "../src/current-pcb-worker-startup-wire.ts";
import { currentFootprintCopySavedSourceCommand } from "../src/current-footprint-copy-saved-source-command.ts";
import { currentFootprintCopySourceCommand } from "../src/current-footprint-copy-source-command.ts";
import { currentFootprintCopyExecutionWorkerNativeCases } from "../src/current-footprint-copy-execution-worker-native.ts";
import { currentFootprintCopyTransactionClockNativeCases } from "../src/current-footprint-copy-transaction-clock-native.ts";
import { currentPcb209WorkerStartupNativeParentCases } from "../src/current-pcb-worker-startup-native.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "../src/current-pcb-worker-startup-contract.ts";

type Request = Readonly<Record<string, string | number>>;
async function fixture(context: TestContext, nextRequestId = 17): Promise<Readonly<{
  channel: CurrentFootprintCopySavedChannel; dependency: Awaited<ReturnType<CurrentFootprintCopySavedChannel["start"]>>;
  requests: Request[]; queue: ReturnType<typeof currentFootprintCopySavedQueueCommand>; open: () => Promise<void>;
}>> {
  const chunks: Buffer[] = [], requests: Request[] = [];
  const parent = Object.freeze({ targetId: "parent-target", sessionId: "parent-session", nextRequestId });
  let exited = false;
  const emit = (value: unknown): void => { chunks.push(Buffer.from(`${JSON.stringify(value)}\0`)); };
  const channel = new CurrentFootprintCopySavedChannel({
    requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => { assert.ok(exited); return Promise.resolve(); },
    observeOriginalParentEvent: (): void => undefined,
    exchange: (request: Request): Promise<unknown> => {
      if (request["action"] === "poll") { return Promise.resolve({ bytes: (chunks.shift() ?? Buffer.alloc(0)).toString("base64") }); }
      requests.push(request);
      if (request["method"] === "Target.setAutoAttach") {
        emit({ method: "Target.attachedToTarget", sessionId: "parent-session", params: { sessionId: "worker-session", waitingForDebugger: true,
          targetInfo: { targetId: "worker-target", type: "worker", attached: true, title: "synthetic", url: "file:///synthetic/project-worker.js" } } });
      }
      const workerSession = request["action"] === "footprint-saved-worker" ? "worker-session" : request["sessionId"];
      const sessionId = request["action"] === "footprint-saved-upload-queue" ? "parent-session" : workerSession;
      emit({ id: request["requestId"], sessionId, result: {} }); return Promise.resolve({ written: true });
    },
  });
  const dependency = await channel.start(); dependency.subscribe((): void => undefined);
  context.after(async () => { exited = true; await channel.releaseAfterTermination(); });
  const preflight = currentPcb209WorkerStartupNativeParentCases().find(command => command.method === "Runtime.callFunctionOn" &&
    command.params.arguments.length === 2 && command.params.arguments[1].value === "preflight");
  assert.ok(preflight?.method === "Runtime.callFunctionOn" && preflight.params.arguments.length === 2);
  const target = preflight.params.arguments[0].value;
  const openingCommand = currentPcb209WorkerStartupNativeParentCases().find(command => command.method === "Runtime.callFunctionOn" &&
    command.params.arguments.length === 2 && command.params.arguments[1].value === "open-project");
  assert.ok(openingCommand?.method === "Runtime.callFunctionOn");
  const queue = currentFootprintCopySavedQueueCommand({ sessionId: "parent-session", uniqueContextId: preflight.params.uniqueContextId,
    projectUuid: target.projectUuid, branchUuid: target.branchUuid });
  const open = async (): Promise<void> => {
    await channel.requestFootprintSavedUploadQueue(queue);
    await dependency.request({ ...preflight, sessionId: "parent-session" });
    await dependency.request({ method: "Target.setAutoAttach", params: CURRENT_PCB_WORKER_STARTUP_ATTACH, sessionId: "parent-session" });
    await channel.requestFootprintSavedUploadQueue(queue);
    await dependency.request({ ...openingCommand, sessionId: "parent-session" });
  };
  return { channel, dependency, requests, queue, open };
}

void test("saved generation retains a distinct original channel and excludes execution marks and repeated queue probes", async context => {
  const value = await fixture(context);
  assert.equal(isOriginalFootprintSavedDependency(value.dependency), true);
  assert.equal(isOriginalFootprintSavedDependency(Object.freeze({ ...value.dependency })), false);
  assert.equal(isOriginalFootprintExecutionDependency(value.dependency), false);
  assert.equal(isOriginalFootprintPreparationDependency(value.dependency), false);
  assert.throws(() => new CurrentFootprintCopyWorkerStartupTransport(value.dependency), /PURPOSE/u);
  assert.throws(() => new CurrentPcb209WorkerStartupTransport(value.dependency), /PURPOSE/u);
  assert.throws(() => new CurrentFootprintCopySavedWorkerStartupTransport(Object.freeze({ ...value.dependency })), /PURPOSE/u);
  assert.doesNotThrow(() => new CurrentFootprintCopySavedWorkerStartupTransport(value.dependency));
  const clock = currentFootprintCopyTransactionClockNativeCases()[0]; assert.ok(clock);
  await assert.rejects(requestCurrentFootprintCopyTransactionClock(value.dependency, { ...clock, sessionId: "worker-session" }), /PURPOSE/u);
  await assert.rejects(requestCurrentFootprintCopyCacheConstruction(value.dependency, { method: "Debugger.resume", params: {} }), /PURPOSE/u);
  await value.open(); const before = value.requests.length;
  await assert.rejects(value.channel.requestFootprintSavedUploadQueue(value.queue), /SAVED_QUEUE_OWNER/u);
  assert.equal(value.requests.length, before); assert.equal(value.requests.filter(request => request["action"] === "footprint-saved-upload-queue").length, 2);
  const parser = currentFootprintCopyExecutionWorkerNativeCases().find(command => command.method === "Debugger.setBreakpoint"); assert.ok(parser);
  await value.dependency.request({ ...parser, sessionId: "worker-session" });
  assert.equal(value.requests.at(-1)?.["action"], "footprint-saved-worker");
});
void test("saved normal allocations cannot spend the independently reserved cleanup slots", async context => {
  assert.equal(PROFILE.normalRequestLimit, 319); assert.equal(PROFILE.requestLimit, 353); assert.equal(PROFILE.stateSampleLimit, 8);
  const value = await fixture(context, PROFILE.normalRequestLimit - 4); await value.open();
  const before = value.requests.length;
  await assert.rejects(value.dependency.request({ method: "Target.getTargets", params: {} }), /REQUEST_BUDGET/u);
  assert.equal(value.requests.length, before); assert.equal(value.channel.status().nextRequestId, PROFILE.normalRequestLimit + 1);
  await value.dependency.request({ method: "Runtime.releaseObjectGroup", sessionId: "worker-session",
    params: { objectGroup: "easyeda-pro-control-worker-construction-v1" } });
  assert.equal(value.requests.at(-1)?.["requestId"], PROFILE.normalRequestLimit + 1);
});
void test("saved wire accepts only the V2 cache reader and constructor parser cases", () => {
  const bindings = { manager: "manager", project: "project", bus: "bus", consistency: "consistency", constructors: "constructors", methods: "methods" };
  const selected = { identity: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "window" },
    footprintUuid: "c".repeat(16), client: "d".repeat(16), maximumTicket: 10 };
  const source = { ...currentFootprintCopySavedSourceCommand(bindings, selected), sessionId: "worker-session" };
  assert.equal(currentFootprintCopySavedStartupWire(source, 1).request["startupPhase"], "footprint-saved-source-read");
  assert.throws(() => currentFootprintCopyExecutionStartupWire(source, 1));
  assert.throws(() => currentFootprintCopySavedStartupWire({ ...currentFootprintCopySourceCommand(bindings, selected), sessionId: "worker-session" }, 1));
  for (const command of currentFootprintCopyExecutionWorkerNativeCases()) {
    if (command.method === "Debugger.setBreakpoint" || command.method === "Runtime.callFunctionOn" && command.params.functionDeclaration.includes("FOOTPRINT_PARSER_CONSTRUCTION")) {
      assert.equal(currentFootprintCopySavedStartupWire(command, 1).request["action"], "footprint-saved-worker");
    } else { assert.throws(() => currentFootprintCopySavedStartupWire(command, 1)); }
  }
  assert.throws(() => currentFootprintCopySavedStartupWire(source, PROFILE.requestLimit + 1));
});
