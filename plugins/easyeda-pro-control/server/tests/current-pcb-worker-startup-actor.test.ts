import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { CurrentPcbWorkerConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import { CURRENT_PCB_WORKER_STARTUP_UI_ACTOR_CLOCK_FUNCTION, CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION,
  currentPcbWorkerStartupUiActorCommand, decodeCurrentPcbWorkerStartupActor } from "../src/current-pcb-worker-startup-actor.ts";
import { CURRENT_PCB_WORKER_STARTUP_ACTOR_SEQUENCE, CurrentPcbWorkerStartupActorRunner,
  currentPcbWorkerStartupActorPacketSchema } from "../src/current-pcb-worker-startup-actor-runner.ts";
import type { CurrentPcbWorkerStartupActorTransport } from "../src/current-pcb-worker-startup-actor-runner.ts";
import { constructionInspector } from "./helpers/current-pcb-worker-construction-inspector.ts";
import { pcbStringObservationFixture, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

const IDENTITY = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), windowTabId: "window_1" });
const SETUP = `
globalThis.originalProject=PROJECT;globalThis.originalBus=PROJECT.workerBus;
globalThis.sampleTime=1700000000000;Date.now=()=>sampleTime;
globalThis.account={uuid:"f".repeat(32),nickname:"nick",username:"user",avatar:"avatar"};
PROJECT.user={...account};PROJECT._isV2Format=false;
globalThis.gVars={currentProject:{projectId:"a".repeat(64),branchUuid:"b".repeat(32),isV2Format:false},isHistoryMode:false,
globalVariableCookieData:{userInfo:{uuid:account.uuid,username:account.username,nickname:account.nickname}},loginedUserInfo:{...account}};
globalThis.UI={gVars};
`;
type ActorPhase = "ui" | "worker";
function reply(phase: ActorPhase, change = ""): ReturnType<typeof pcbStringReply> {
  const context = pcbStringObservationFixture(phase === "worker", SETUP + change);
  const expression = phase === "ui" ? `(${CURRENT_PCB_WORKER_STARTUP_UI_ACTOR_CLOCK_FUNCTION})()` :
    `(${CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION}).call(originalProject,originalBus)`;
  const result: unknown = runInContext(expression, context, { timeout: 1000 });
  assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  return pcbStringReply(result);
}
function actorFixture(change?: (phase: ActorPhase, index: number) => string): Readonly<{
  runner: CurrentPcbWorkerStartupActorRunner; transport: CurrentPcbWorkerStartupActorTransport;
  calls: ActorPhase[]; expire: () => void;
}> {
  const calls: ActorPhase[] = []; let current = true;
  const read = async (phase: ActorPhase): Promise<unknown> => {
    calls.push(phase); await Promise.resolve(); return reply(phase, change?.(phase, calls.length - 1));
  };
  const transport = { observeUi: (): Promise<unknown> => read("ui"), observeWorker: (): Promise<unknown> => read("worker"),
    assertCurrent: async (): Promise<void> => { await Promise.resolve(); assert.ok(current, "owner expired"); } };
  return { runner: new CurrentPcbWorkerStartupActorRunner(transport, IDENTITY), transport, calls,
    expire: (): void => { current = false; } };
}
async function observe(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // Preserve the original awaited operation's failure.
  }
}

void test("startup actor reads preserve ordered worker user and original constructor receiver", () => {
  const ui = decodeCurrentPcbWorkerStartupActor(reply("ui")), worker = decodeCurrentPcbWorkerStartupActor(reply("worker"));
  assert.equal(ui.phase, "ui"); assert.equal(worker.phase, "worker");
  assert.deepEqual(ui.identity, IDENTITY); assert.equal(worker.workerUserText, ui.workerUserText);
  const parsed: unknown = JSON.parse(worker.workerUserText); assert.ok(parsed !== null && typeof parsed === "object");
  assert.deepEqual(Object.keys(parsed), ["uuid", "nickname", "username", "avatar"]);
  assert.equal(Object.hasOwn(worker.identity, "documentUuid"), false);
  for (const change of [
    'globalThis.PROJECT=Object.assign(Object.create(Object.getPrototypeOf(PROJECT)),PROJECT);',
    'PROJECT.workerBus={...PROJECT.workerBus};', 'PROJECT._isV2Format=true;',
    'Object.defineProperty(PROJECT.user,"nickname",{get(){getterReads++;return "nick";}});',
    'PROJECT.user.extra="extra";', 'Object.defineProperty(PROJECT.user,"avatar",{value:"avatar",enumerable:false});',
  ]) { assert.throws(() => reply("worker", change), /PCB_STRING_OBSERVATION_STATE/u, change); }
});

void test("startup actor UI fields and local Date windows reject malformed or changed descriptors", () => {
  for (const change of [
    'gVars.loginedUserInfo.nickname="different";', String.raw`gVars.currentProject.projectId+="\n";`, String.raw`globalThis._TAB_ID_+="\n";`,
    'Object.defineProperty(gVars.loginedUserInfo,"avatar",{get(){getterReads++;return "avatar";}});',
    'Date.now=()=>-0;', 'Date.now=()=>{sampleTime+=2000;return sampleTime;};',
    'Date.now=()=>{Date.now=()=>1700000000000;return 1700000000000;};',
    'Date.prototype.getTimezoneOffset=()=>-0;',
  ]) { assert.throws(() => reply("ui", change), /PCB_STRING_OBSERVATION_STATE/u, change); }
  const command = currentPcbWorkerStartupUiActorCommand("original-session", "original-context");
  assert.deepEqual(command.params.arguments, []); assert.equal(command.params.throwOnSideEffect, true);
  assert.equal(command.params.awaitPromise, false); assert.equal(command.params.functionDeclaration, CURRENT_PCB_WORKER_STARTUP_UI_ACTOR_CLOCK_FUNCTION);
  assert.throws(() => currentPcbWorkerStartupUiActorCommand("session\n", "context"));
  assert.throws(() => decodeCurrentPcbWorkerStartupActor({ ...reply("ui"), exceptionDetails: {} }), /PCB_WORKER_STARTUP_ACTOR_REPLY/u);
});

void test("startup runner retains four own samples, consumes once and preserves all unproved limits", async () => {
  const f = actorFixture(), packet = await f.runner.observe();
  assert.deepEqual(f.calls, CURRENT_PCB_WORKER_STARTUP_ACTOR_SEQUENCE);
  assert.equal(await f.runner.requireOriginal(packet), packet);
  assert.equal(packet.originalConstructorProjectObserved, true); assert.equal(packet.pcbRealmObserved, false);
  assert.equal(packet.nativeIntrinsicsVerified, false); assert.equal(packet.clockProvenanceVerified, false);
  assert.equal(packet.windowsClockProvenanceVerified, false); assert.equal(packet.serverClockObserved, false);
  assert.equal(packet.completePublicationIntervalVerified, false); assert.equal(packet.writeDestinationsContained, false);
  assert.equal(packet.executionAuthorized, false); assert.equal(packet.saveAuthorized, false);
  await assert.rejects(f.runner.requireOriginal(structuredClone(packet)), /original completed packet/u);
  await assert.rejects(f.runner.observe(), /attempt consumed/u); assert.equal(f.calls.length, 4);
  f.expire(); await assert.rejects(f.runner.requireOriginal(packet), /owner expired/u);
  assert.equal(f.runner.status().phase, "failed"); assert.equal(f.runner.retainedSamples().length, 4);
});

void test("startup runner rejects user order, target drift and backwards or oversized local clock brackets", async () => {
  for (const change of [
    (phase: ActorPhase): string => phase === "worker" ? 'PROJECT.user={uuid:account.uuid,username:"user",nickname:"nick",avatar:"avatar"};' : "",
    (_phase: ActorPhase, index: number): string => index === 2 ? 'PROJECT.user.avatar="changed";' : "",
    (_phase: ActorPhase, index: number): string => index === 3 ? 'sampleTime-=1;' : "",
    (_phase: ActorPhase, index: number): string => index === 3 ? 'sampleTime+=10001;' : "",
    (_phase: ActorPhase, index: number): string => index === 1 ? 'PROJECT._branchUuid="c".repeat(32);' : "",
  ]) {
    const f = actorFixture(change); await assert.rejects(f.runner.observe(), /PCB_WORKER_STARTUP_ACTOR_RUNNER/u);
    assert.equal(f.runner.status().phase, "failed"); await assert.rejects(f.runner.observe(), /attempt consumed/u);
  }
});

void test("startup actor journal schema independently rejects forged order, user bytes, clocks and digest", async () => {
  const packet = await actorFixture().runner.observe();
  assert.ok(currentPcbWorkerStartupActorPacketSchema.safeParse(packet).success);
  for (const change of [
    (copy: typeof packet): void => { Object.defineProperty(copy, "samples", { value: [copy.samples[1], copy.samples[0], ...copy.samples.slice(2)] }); },
    (copy: typeof packet): void => { Object.defineProperty(copy.samples[1], "workerUserText", { value: "{}" }); },
    (copy: typeof packet): void => { Object.defineProperty(copy.samples[2]?.identity, "branchUuid", { value: "c".repeat(32) }); },
    (copy: typeof packet): void => { Object.defineProperty(copy.samples[3]?.clock.before, "milliseconds", { value: 1 }); },
  ]) {
    const copy = structuredClone(packet); change(copy);
    const { packetSha256: _hash, ...body } = copy;
    assert.equal(currentPcbWorkerStartupActorPacketSchema.safeParse({ ...body, packetSha256: sha256Json(body) }).success, false);
  }
  assert.equal(currentPcbWorkerStartupActorPacketSchema.safeParse({ ...packet, packetSha256: "f".repeat(64) }).success, false);
  assert.equal(currentPcbWorkerStartupActorPacketSchema.safeParse({ ...packet, pcbRealmObserved: true }).success, false);
});

void test("startup actor transport changes and loss across await cannot advance the next sample", async () => {
  const f = actorFixture(); let redirected = 0;
  Object.defineProperty(f.transport, "observeWorker", { value: (): Promise<unknown> => { redirected += 1; return Promise.resolve(reply("worker")); } });
  await assert.rejects(f.runner.observe(), /original transport changed/u); assert.equal(redirected, 0); assert.equal(f.calls.length, 0);
  let calls = 0, current = true;
  const runner = new CurrentPcbWorkerStartupActorRunner({
    observeUi: async (): Promise<unknown> => { calls += 1; await Promise.resolve(); current = false; return reply("ui"); },
    observeWorker: (): Promise<unknown> => { calls += 1; return Promise.resolve(reply("worker")); },
    assertCurrent: (): Promise<void> => { assert.ok(current, "owner lost"); return Promise.resolve(); },
  }, IDENTITY);
  await assert.rejects(runner.observe(), /owner lost/u); assert.equal(calls, 1); assert.equal(runner.status().phase, "failed");
  assert.equal(runner.retainedSamples().length, 1);
});

void test("actual constructor inspector supplies two fixed worker samples under V8 side-effect checking", { timeout: 30_000 }, async context => {
  const fixture = await constructionInspector(context), runner = new CurrentPcbWorkerConstructionRunner(fixture.transport);
  const capture = runner.capture(); void observe(capture); await runner.whenArmed(); const running = fixture.run(); void observe(running);
  const packet = await capture; await running;
  await fixture.syntheticEvaluate(`PROJECT.uuid=${JSON.stringify(IDENTITY.projectUuid)};PROJECT._branchUuid=${JSON.stringify(IDENTITY.branchUuid)};
    globalThis._TAB_ID_="window_1";PROJECT._isV2Format=false;PROJECT.user={uuid:"f".repeat(32),nickname:"nick",username:"user",avatar:"avatar"};`);
  await runner.proveProjectIdentity(packet); const assignments = await runner.proveCurrentAssignments(packet);
  const first = runner.observeActorClock(packet, assignments);
  await assert.rejects(runner.observeActorClock(packet, assignments), /ACTOR_SAMPLES_CONSUMED/u);
  assert.equal(decodeCurrentPcbWorkerStartupActor(await first).phase, "worker");
  assert.equal(decodeCurrentPcbWorkerStartupActor(await runner.observeActorClock(packet, assignments)).phase, "worker");
  await assert.rejects(runner.observeActorClock(packet, assignments), /ACTOR_SAMPLES_CONSUMED/u); await runner.release();
});

void test("actual constructor actor read refuses a replacement PROJECT and never adopts its matching fields", { timeout: 30_000 }, async context => {
  const fixture = await constructionInspector(context), runner = new CurrentPcbWorkerConstructionRunner(fixture.transport);
  const capture = runner.capture(); void observe(capture); await runner.whenArmed(); const running = fixture.run(); void observe(running);
  const packet = await capture; await running;
  await fixture.syntheticEvaluate(`PROJECT.uuid=${JSON.stringify(IDENTITY.projectUuid)};PROJECT._branchUuid=${JSON.stringify(IDENTITY.branchUuid)};
    globalThis._TAB_ID_="window_1";PROJECT._isV2Format=false;PROJECT.user={uuid:"f".repeat(32),nickname:"nick",username:"user",avatar:"avatar"};`);
  await runner.proveProjectIdentity(packet); const assignments = await runner.proveCurrentAssignments(packet);
  await fixture.syntheticEvaluate("globalThis.PROJECT=Object.assign(Object.create(Object.getPrototypeOf(PROJECT)),PROJECT)");
  await assert.rejects(runner.observeActorClock(packet, assignments)); assert.equal(runner.status().failed, true);
  await assert.rejects(runner.observeActorClock(packet, assignments)); await runner.release();
});

void test("fixed startup UI command executes under V8 side-effect checking and rejects a proxy without invoking it", async () => {
  const session = new Session(); session.connect(); let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "pcb-string-observation-synthetic" &&
        "uniqueId" in params.context && typeof params.context.uniqueId === "string") { uniqueContextId = params.context.uniqueId; }
  });
  try {
    await session.post("Runtime.enable");
    const context = pcbStringObservationFixture(false, `globalThis.actualDateNow=Date.now;${SETUP}Date.now=actualDateNow;`);
    assert.notEqual(uniqueContextId, "");
    const command = currentPcbWorkerStartupUiActorCommand("synthetic-session", uniqueContextId);
    const observed = await (session.post("Runtime.callFunctionOn", command.params) as Promise<unknown>);
    assert.equal(decodeCurrentPcbWorkerStartupActor(observed).phase, "ui");
    runInContext('gVars.loginedUserInfo=new Proxy(gVars.loginedUserInfo,{getOwnPropertyDescriptor(o,k){getterReads++;return Reflect.getOwnPropertyDescriptor(o,k);}});', context);
    const refused = await (session.post("Runtime.callFunctionOn", command.params) as Promise<unknown>);
    assert.throws(() => decodeCurrentPcbWorkerStartupActor(refused), /PCB_WORKER_STARTUP_ACTOR_REPLY/u);
    assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
  } finally { session.disconnect(); }
});
