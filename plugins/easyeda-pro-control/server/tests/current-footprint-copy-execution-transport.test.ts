/* oxlint-disable import/max-dependencies -- This focused integration fixture joins fixed purpose/native grammars, original channel, parent contexts and constructor-to-clock ownership. */
/** Synthetic original-channel integration only. No native process, copy create,
 * successful SQL lifecycle or backend clock is exercised. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import type { TestContext } from "node:test";
import { CurrentFootprintCopyExecutionChannel, CurrentFootprintCopyPreparationChannel, isOriginalFootprintExecutionDependency,
  requestCurrentFootprintCopyCacheConstruction, requestCurrentFootprintCopyParent, requestCurrentFootprintCopyTransactionClock, subscribeCurrentFootprintCopyParentEvents } from "../src/current-pcb-worker-startup-channel.ts";
import { currentFootprintCacheConstructionNativeCases } from "../src/current-footprint-copy-cache-construction-native.ts";
import { bindFootprintPreparationConstructionTransport, originalFootprintExecutionConstructionProjectUuid,
  requestFootprintExecutionConstructionCache } from "../src/current-footprint-copy-construction-purpose.ts";
import { validateCurrentFootprintParentWorkerCommand } from "../src/current-footprint-copy-parent-worker-wire.ts";
import { bindCurrentFootprintCopyParentRoute } from "../src/current-footprint-copy-parent-route.ts";
import { currentFootprintCopyParentNativeCases } from "../src/current-footprint-copy-parent-native.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "../src/current-pcb-worker-startup-contract.ts";
import { currentPcb209WorkerStartupNativeParentCases } from "../src/current-pcb-worker-startup-native.ts";
import { currentFootprintCopyTransactionClockNativeCases } from "../src/current-footprint-copy-transaction-clock-native.ts";
import { currentFootprintCopyExecutionWorkerNativeCases } from "../src/current-footprint-copy-execution-worker-native.ts";
import { CurrentFootprintCopyWorkerStartupTransport, CurrentPcb209WorkerStartupTransport } from "../src/current-pcb-worker-startup-transport.ts";
import { bindCurrentFootprintCopyClockRoute, createCurrentFootprintCopyTransactionClockEvents } from "../src/current-footprint-copy-clock-route.ts";
import type { CurrentFootprintCopyClockRoute } from "../src/current-footprint-copy-clock-route.ts";
import type { CurrentPcbWorkerConstructionTransport } from "../src/current-pcb-worker-construction-contract.ts";

type NativeRequest = Readonly<Record<string, string | number>>;
async function fixture(context: TestContext, execution: boolean): Promise<Readonly<{
  channel: CurrentFootprintCopyExecutionChannel | CurrentFootprintCopyPreparationChannel;
  dependency: Awaited<ReturnType<CurrentFootprintCopyExecutionChannel["start"]>>;
  requests: NativeRequest[];
  state: { rejectWrite: boolean; exited: boolean };
  emit: (value: unknown) => void;
}>> {
  const chunks: Buffer[] = [], requests: NativeRequest[] = [], state = { rejectWrite: false, exited: false };
  const parent = Object.freeze({ targetId: "parent-target", sessionId: "parent-session", nextRequestId: 17 });
  const frame = (value: unknown): void => { chunks.push(Buffer.from(`${JSON.stringify(value)}\0`)); };
  const native = {
    requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => { assert.equal(state.exited, true); return Promise.resolve(); },
    observeOriginalParentEvent: (): void => undefined,
    exchange: (request: NativeRequest): Promise<unknown> => {
      if (request["action"] === "poll") { return Promise.resolve({ bytes: (chunks.shift() ?? Buffer.alloc(0)).toString("base64") }); }
      requests.push(request);
      if (state.rejectWrite) { return Promise.reject(new Error("synthetic lost native write acknowledgment")); }
      if (request["method"] === "Target.setAutoAttach") {
        frame({ method: "Target.attachedToTarget", sessionId: "parent-session", params: { sessionId: "worker-session", waitingForDebugger: true,
          targetInfo: { targetId: "worker-target", type: "worker", attached: true, title: "synthetic", url: "file:///synthetic/project-worker.js" } } });
      }
      let sessionId = request["sessionId"];
      if (request["action"] === "footprint-copy-clock" || request["action"] === "footprint-copy-worker" || request["action"] === "footprint-cache-construction") { sessionId = "worker-session"; }
      else if (request["action"] === "footprint-copy-parent") { sessionId = request["realm"] === "parent" ? "parent-session" : "worker-session"; }
      frame({ id: request["requestId"], sessionId, result: {} }); return Promise.resolve({ written: true });
    },
  };
  const channel = execution ? new CurrentFootprintCopyExecutionChannel(native) : new CurrentFootprintCopyPreparationChannel(native);
  const dependency = await channel.start(); dependency.subscribe((): void => undefined);
  context.after(async () => { state.exited = true; await channel.releaseAfterTermination(); });
  return { channel, dependency, requests, state, emit: frame };
}
async function open(value: Awaited<ReturnType<typeof fixture>>): Promise<void> {
  for (const phase of ["preflight", "open-project"] as const) {
    const sample = currentPcb209WorkerStartupNativeParentCases().find(command => command.method === "Runtime.callFunctionOn" &&
      command.params.arguments.length === 2 && command.params.arguments[1].value === phase);
    assert.ok(sample?.method === "Runtime.callFunctionOn");
    if (phase === "open-project") {
      await value.dependency.request({ method: "Target.setAutoAttach", params: CURRENT_PCB_WORKER_STARTUP_ATTACH, sessionId: "parent-session" });
    }
    await value.dependency.request({ ...sample, sessionId: "parent-session" });
  }
}
void test("execution routes original parser and clock commands through the same native request counter", async context => {
  const clock = currentFootprintCopyTransactionClockNativeCases()[0], value = await fixture(context, true); assert.ok(clock);
  assert.equal(isOriginalFootprintExecutionDependency(value.dependency), true);
  assert.equal(isOriginalFootprintExecutionDependency(Object.freeze({ ...value.dependency })), false);
  assert.throws(() => new CurrentPcb209WorkerStartupTransport(value.dependency), /PURPOSE/u);
  assert.doesNotThrow(() => new CurrentFootprintCopyWorkerStartupTransport(value.dependency));
  await assert.rejects(requestCurrentFootprintCopyTransactionClock(value.dependency, { ...clock, sessionId: "worker-session" }), /FOOTPRINT_CLOCK_OWNER/u);
  await open(value);
  await value.dependency.request({ method: "Runtime.enable", sessionId: "worker-session", params: {} });
  const parser = currentFootprintCopyExecutionWorkerNativeCases().find(command => command.method === "Debugger.setBreakpoint"); assert.ok(parser);
  await value.dependency.request({ ...parser, sessionId: "worker-session" });
  await requestCurrentFootprintCopyTransactionClock(value.dependency, { ...clock, sessionId: "worker-session" });
  assert.deepEqual(value.requests.map(request => request["requestId"]), [17, 18, 19, 20, 21, 22]);
  const [worker, clockRequest] = value.requests.slice(-2); assert.ok(worker && clockRequest);
  assert.equal(worker["action"], "footprint-copy-worker"); assert.equal(clockRequest["action"], "footprint-copy-clock");
  assert.equal(Object.hasOwn(worker, "sessionId"), false); assert.equal(Object.hasOwn(clockRequest, "sessionId"), false);
  await assert.rejects(requestCurrentFootprintCopyTransactionClock(value.dependency, { ...clock, sessionId: "foreign" }), /FOOTPRINT_CLOCK_OWNER/u);
  assert.equal(value.requests.length, 6);
});

void test("cache construction commands retain writer dependency, original project and the shared counter", async context => {
  const preparation = await fixture(context, false), value = await fixture(context, true);
  const sample = currentFootprintCacheConstructionNativeCases().find(command => command.method === "Runtime.getProperties"); assert.ok(sample);
  const { phase: _phase, sessionId: _session, ...command } = sample;
  await assert.rejects(requestCurrentFootprintCopyCacheConstruction(preparation.dependency, command), /PURPOSE/u);
  await assert.rejects(requestCurrentFootprintCopyCacheConstruction(Object.freeze({ ...value.dependency }), command), /PURPOSE/u);
  const construction: CurrentPcbWorkerConstructionTransport = Object.freeze({ scriptId: "script", assertOriginalPinnedWorker: (): Promise<void> => Promise.resolve(),
    request: (): Promise<unknown> => Promise.reject(new Error("generic construction transport must not dispatch cache commands")), subscribe: (): (() => void) => (): void => undefined });
  assert.throws(() => { bindFootprintPreparationConstructionTransport(value.dependency, construction); }, /CACHE_PROJECT/u);
  await open(value); await value.dependency.request({ method: "Runtime.enable", sessionId: "worker-session", params: {} });
  bindFootprintPreparationConstructionTransport(value.dependency, construction);
  assert.match(originalFootprintExecutionConstructionProjectUuid(construction), /^[a-f\d]{64}$/u);
  assert.throws(() => originalFootprintExecutionConstructionProjectUuid(Object.freeze({ ...construction })), /CONSTRUCTION_PROJECT/u);
  assert.throws(() => { bindFootprintPreparationConstructionTransport(value.dependency, construction); }, /ISSUED/u);
  const before = value.requests.length;
  for (let count = 0; count < 33; count += 1) { await requestFootprintExecutionConstructionCache(construction, command); }
  await assert.rejects(requestFootprintExecutionConstructionCache(construction, command), /CACHE_OWNER/u);
  assert.equal(value.requests.length - before, 33);
  assert.equal(value.requests.at(-1)?.["action"], "footprint-cache-construction");
  assert.equal(Object.hasOwn(value.requests.at(-1) ?? {}, "sessionId"), false);
});
void test("preparation and copied dependency objects cannot request execution clocks", async context => {
  const clock = currentFootprintCopyTransactionClockNativeCases()[0], value = await fixture(context, false); assert.ok(clock);
  assert.equal(isOriginalFootprintExecutionDependency(value.dependency), false);
  assert.throws(() => new CurrentFootprintCopyWorkerStartupTransport(value.dependency), /PURPOSE/u);
  for (const dependency of [value.dependency, Object.freeze({ ...value.dependency })]) {
    await assert.rejects(requestCurrentFootprintCopyTransactionClock(dependency, { ...clock, sessionId: "worker-session" }), /FOOTPRINT_CLOCK_PURPOSE/u);
  }
  assert.equal(value.requests.length, 0);
});
void test("lost clock write acknowledgment consumes the native attempt and does not retry", async context => {
  const value = await fixture(context, true); await open(value);
  await value.dependency.request({ method: "Runtime.enable", sessionId: "worker-session", params: {} });
  const clock = currentFootprintCopyTransactionClockNativeCases().find(command => command.method === "Runtime.callFunctionOn"); assert.ok(clock); value.state.rejectWrite = true;
  await assert.rejects(requestCurrentFootprintCopyTransactionClock(value.dependency, { ...clock, sessionId: "worker-session" }), /WRITE/u);
  await assert.rejects(requestCurrentFootprintCopyTransactionClock(value.dependency, { ...clock, sessionId: "worker-session" }));
  assert.equal(value.requests.filter(request => request["action"] === "footprint-copy-clock").length, 1);
  assert.equal(value.channel.status().failed, true);
});
void test("clock collector issuance retains exact construction adapter and rejects copied ownership", async context => {
  const value = await fixture(context, true);
  const construction: CurrentPcbWorkerConstructionTransport = Object.freeze({ scriptId: "script", assertOriginalPinnedWorker: (): Promise<void> => Promise.resolve(),
    request: (): Promise<unknown> => Promise.reject(new Error("synthetic constructor route must not dispatch")), subscribe: (): (() => void) => (): void => undefined });
  const route: CurrentFootprintCopyClockRoute = Object.freeze({ scriptId: "script", workerSessionId: "worker-session", assertOriginal: (): Promise<void> => Promise.resolve(),
    assertCleanup: (): void => undefined, assertOriginalTermination: (): Promise<void> => Promise.resolve(), request: (): Promise<unknown> => Promise.reject(new Error("unarmed")),
    subscribe: (): (() => void) => (): void => undefined });
  assert.throws(() => { bindCurrentFootprintCopyClockRoute(Object.freeze({ ...value.dependency }), construction, route); }, /ORIGINAL_ROUTE/u);
  bindCurrentFootprintCopyClockRoute(value.dependency, construction, route);
  assert.throws(() => { bindCurrentFootprintCopyClockRoute(value.dependency, construction, route); }, /ORIGINAL_ROUTE/u);
  assert.throws(() => createCurrentFootprintCopyTransactionClockEvents(Object.freeze({ ...construction }), "manager", "lexicals"), /ORIGINAL_ROUTE/u);
  const collector = createCurrentFootprintCopyTransactionClockEvents(construction, "manager", "lexicals");
  assert.equal(collector.retained().runner.phase, "ready");
  assert.throws(() => createCurrentFootprintCopyTransactionClockEvents(construction, "manager", "lexicals"), /ORIGINAL_ROUTE/u);
});

void test("parent pause routing and child diagnostic requests retain the original native contexts", async context => {
  const parentEvents: unknown[] = [], value = await fixture(context, true);
  const route = Object.freeze({ parentSessionId: "parent-session", parentUniqueContextId: "original-context", managerScriptId: "manager-script",
    assertOriginal: (): Promise<void> => Promise.resolve(), assertOriginalSynchronous: (): void => undefined });
  assert.throws(() => { bindCurrentFootprintCopyParentRoute(Object.freeze({ ...value.dependency }), route); }, /ORIGINAL_ROUTE/u);
  bindCurrentFootprintCopyParentRoute(value.dependency, route);
  const unsubscribe = subscribeCurrentFootprintCopyParentEvents(value.dependency, event => { parentEvents.push(event); }, (): void => undefined);
  await open(value);
  await value.dependency.request({ method: "Runtime.enable", sessionId: "worker-session", params: {} });
  value.emit({ method: "Runtime.executionContextCreated", sessionId: "worker-session", params: { context: { uniqueId: "child-context" } } });
  value.emit({ method: "Debugger.paused", sessionId: "parent-session", params: { reason: "synthetic-controller-receives-raw-event" } });
  const sample = currentFootprintCopyParentNativeCases().find(entry => entry.kind === "peer" && entry.command.phase === "childSelect");
  assert.ok(sample?.command.method === "Runtime.callFunctionOn");
  // The actual original channel, not a copied binding, receives both events.
  for (let index = 0; index < 20 && parentEvents.length === 0; index += 1) { await delay(20); }
  assert.equal(parentEvents.length, 1);
  const command = validateCurrentFootprintParentWorkerCommand({ ...sample.command, sessionId: "worker-session", params: { ...sample.command.params, uniqueContextId: "child-context" } });
  await requestCurrentFootprintCopyParent(value.dependency, command, "peer");
  const request = value.requests.at(-1); assert.ok(request);
  assert.equal(request["action"], "footprint-copy-parent"); assert.equal(request["realm"], "child");
  assert.equal(Object.hasOwn(request, "sessionId"), false);
  await assert.rejects(requestCurrentFootprintCopyParent(value.dependency, validateCurrentFootprintParentWorkerCommand({ ...command, params: { ...command.params, uniqueContextId: "foreign" } }), "peer"), /FOOTPRINT_PEER_CONTEXT/u);
  assert.throws(() => subscribeCurrentFootprintCopyParentEvents(value.dependency, (): void => undefined, (): void => undefined), /SUBSCRIBER/u);
  unsubscribe();
});
