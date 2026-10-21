import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS, currentPcbStringActorClockCommand,
  decodeCurrentPcbStringActorClock } from "../src/current-pcb-string-actor-clock.ts";
import type { CurrentPcbStringActorClockPhase } from "../src/current-pcb-string-actor-clock.ts";
import { CURRENT_PCB_STRING_ACTOR_CLOCK_SEQUENCE, CurrentPcbStringActorClockRunner } from "../src/current-pcb-string-actor-clock-runner.ts";
import type { CurrentPcbStringActorClockTransport } from "../src/current-pcb-string-actor-clock-runner.ts";
import { pcbStringObservationFixture, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

const IDENTITY = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32),
  documentUuid: "d".repeat(16), windowTabId: "window_1" });
const CONTEXTS = Object.freeze({ ui: "ui-original", worker: "worker-original", pcb: "pcb-original" });
const SETUP = `
globalThis.originalDateNow=Date.now;globalThis.sampleTime=1700000000000;Date.now=()=>sampleTime;
globalThis.account={uuid:"f".repeat(32),nickname:"nick",username:"user",avatar:"avatar"};
PROJECT.user={...account};
globalThis.gVars={currentProject:{projectId:"a".repeat(64),branchUuid:"b".repeat(32),isV2Format:false},isHistoryMode:false,
globalVariableCookieData:{userInfo:{uuid:account.uuid,username:account.username,nickname:account.nickname}},loginedUserInfo:{...account}};
globalThis.UI={gVars};
`;
function reply(phase: CurrentPcbStringActorClockPhase, change = ""): ReturnType<typeof pcbStringReply> {
  const context = pcbStringObservationFixture(phase === "worker", SETUP + change);
  const value: unknown = runInContext(`(${CURRENT_PCB_STRING_ACTOR_CLOCK_FUNCTIONS[phase]})(${JSON.stringify(IDENTITY)})`, context, { timeout: 1000 });
  assert.equal(runInContext("getterReads", context) as unknown, 0);
  assert.equal(runInContext("vendorCalls", context) as unknown, 0);
  return pcbStringReply(value);
}
function fixture(change?: (phase: CurrentPcbStringActorClockPhase, index: number) => string): {
  runner: CurrentPcbStringActorClockRunner; transport: CurrentPcbStringActorClockTransport;
  calls: CurrentPcbStringActorClockPhase[]; expire: () => void;
} {
  const calls: CurrentPcbStringActorClockPhase[] = []; let current = true;
  const transport: CurrentPcbStringActorClockTransport = {
    async request(command) {
      assert.equal(command.params.uniqueContextId, CONTEXTS[command.actorClockPhase]);
      calls.push(command.actorClockPhase);
      await Promise.resolve();
      return reply(command.actorClockPhase, change?.(command.actorClockPhase, calls.length - 1));
    },
    assertCurrent() { assert.equal(current, true, "owner expired"); },
  };
  return { runner: new CurrentPcbStringActorClockRunner(transport, CONTEXTS, IDENTITY), transport, calls,
    expire() { current = false; } };
}

void test("fixed UI/worker actor values preserve the native DOCHEAD user order; clocks stay local", () => {
  const ui = decodeCurrentPcbStringActorClock(reply("ui")), worker = decodeCurrentPcbStringActorClock(reply("worker"));
  assert.equal(ui.phase, "ui"); assert.equal(worker.phase, "worker");
  if (ui.phase !== "ui" || worker.phase !== "worker") { assert.fail("wrong phase"); }
  assert.equal(worker.workerUserText, ui.workerUserText);
  const parsed: unknown = JSON.parse(worker.workerUserText); assert.ok(parsed !== null && typeof parsed === "object");
  assert.deepEqual(Object.keys(parsed), ["uuid", "nickname", "username", "avatar"]);
  assert.equal(ui.clock.before.milliseconds, 1_700_000_000_000);
  const pcb = decodeCurrentPcbStringActorClock(reply("pcb")); assert.equal(pcb.phase, "pcb");
  assert.equal(Object.hasOwn(pcb, "identity"), false); assert.equal(Object.hasOwn(pcb, "workerUser"), false);
});

void test("actor reads reject getters, inherited values, foreign project and unequal startup identity", () => {
  for (const change of [
    'gVars.loginedUserInfo.nickname="other";', 'gVars.currentProject.projectId="e".repeat(64);',
    'globalThis._TAB_ID_="other";', 'gVars.isHistoryMode=true;',
    'Object.defineProperty(gVars.loginedUserInfo,"avatar",{get(){getterReads++;return "avatar";}});',
    'delete gVars.loginedUserInfo.username;Object.setPrototypeOf(gVars.loginedUserInfo,{username:"user"});',
  ]) { assert.throws(() => reply("ui", change), /PCB_STRING_OBSERVATION_STATE/u, change); }
  for (const change of [
    'PROJECT.user.extra="not-serialized-by-supported-producer";', 'PROJECT._branchUuid="e".repeat(32);',
    'Object.defineProperty(PROJECT.user,"nickname",{get(){getterReads++;return "nick";}});',
    'Object.defineProperty(PROJECT.user,"avatar",{value:"avatar",enumerable:false});',
  ]) { assert.throws(() => reply("worker", change), /PCB_STRING_OBSERVATION_STATE/u, change); }
});

void test("Date descriptor swaps and invalid local windows refuse without alternate execution", () => {
  for (const change of [
    'Date.now=()=>-0;', 'Date.now=()=>NaN;', 'Date.now=()=>{sampleTime+=2000;return sampleTime;};',
    'Date.now=()=>{Date.now=()=>1700000000000;return 1700000000000;};',
    'Date.prototype.getTimezoneOffset=()=>-0;',
  ]) { assert.throws(() => reply("pcb", change), /PCB_STRING_OBSERVATION_STATE/u, change); }
});

void test("original runner consumes six exact context-bound calls and never supplies writer authority", async () => {
  const f = fixture(), packet = await f.runner.observe();
  assert.deepEqual(f.calls, CURRENT_PCB_STRING_ACTOR_CLOCK_SEQUENCE);
  assert.equal(packet.originalRunnerIssued, true); assert.equal(packet.pairedActorValuesMatched, true);
  assert.equal(packet.backendActorProvenanceVerified, false); assert.equal(packet.windowsClockProvenanceVerified, false);
  assert.equal(packet.serverClockObserved, false); assert.equal(packet.producerBindingVerified, false);
  assert.equal(packet.executionAuthorized, false); assert.equal(packet.saveAuthorized, false);
  assert.equal(f.runner.requireOriginalPacket(packet), packet);
  assert.throws(() => f.runner.requireOriginalPacket(structuredClone(packet)), /original completed packet/u);
  await assert.rejects(f.runner.observe(), /attempt consumed/u); assert.equal(f.calls.length, 6);
  f.expire(); assert.throws(() => f.runner.requireOriginalPacket(packet), /owner expired/u);
  assert.equal(f.runner.status().phase, "failed"); assert.equal(f.runner.retainedSamples().length, 6);
});

void test("paired comparisons reject user order, user drift and reversed or oversized realm clocks", async () => {
  for (const change of [
    (phase: CurrentPcbStringActorClockPhase): string => phase === "worker" ? 'PROJECT.user={uuid:account.uuid,username:"user",nickname:"nick",avatar:"avatar"};' : "",
    (_phase: CurrentPcbStringActorClockPhase, index: number): string => index === 4 ? 'PROJECT.user.avatar="changed";' : "",
    (_phase: CurrentPcbStringActorClockPhase, index: number): string => index === 5 ? 'sampleTime-=1;' : "",
    (_phase: CurrentPcbStringActorClockPhase, index: number): string => index === 5 ? 'sampleTime+=10001;' : "",
  ]) {
    const f = fixture(change); await assert.rejects(f.runner.observe(), /PCB_STRING_ACTOR_CLOCK_RUNNER/u);
    assert.equal(f.calls.length, 6); assert.equal(f.runner.status().phase, "failed");
    await assert.rejects(f.runner.observe(), /attempt consumed/u);
  }
});

void test("owner loss after await and replaced transport stop before the next observation", async () => {
  const f = fixture(), original = f.transport.request;
  f.transport.request = async (command): Promise<unknown> => { const result = await original(command); f.expire(); return result; };
  await assert.rejects(f.runner.observe(), /original transport changed/u); assert.equal(f.calls.length, 0);
  let checks = 0, requests = 0;
  const runner = new CurrentPcbStringActorClockRunner({
    async request(): Promise<unknown> { requests += 1; await Promise.resolve(); return reply("ui"); },
    assertCurrent(): void { checks += 1; assert.ok(checks < 2, "owner lost after await"); },
  }, CONTEXTS, IDENTITY);
  await assert.rejects(runner.observe(), /owner lost after await/u); assert.equal(requests, 1);
  assert.equal(runner.status().phase, "failed"); await assert.rejects(runner.observe(), /attempt consumed/u);
});

void test("fixed command contracts reject context substitution and malformed replies", () => {
  const command = currentPcbStringActorClockCommand("ui", CONTEXTS.ui, IDENTITY);
  assert.equal(command.params.throwOnSideEffect, true); assert.equal(command.params.awaitPromise, false);
  assert.equal(command.params.userGesture, false); assert.equal(command.params.arguments.length, 1);
  assert.equal(currentPcbStringActorClockCommand("pcb", CONTEXTS.pcb, IDENTITY).params.arguments.length, 0);
  assert.throws(() => currentPcbStringActorClockCommand("worker", "injected\ncontext", IDENTITY), /PCB_STRING_ACTOR_CLOCK_CONTEXT/u);
  assert.throws(() => new CurrentPcbStringActorClockRunner(fixture().transport, { ...CONTEXTS, worker: CONTEXTS.ui }, IDENTITY), /distinct source contexts/u);
  assert.throws(() => decodeCurrentPcbStringActorClock({ result: { type: "string", value: "{}" }, exceptionDetails: {} }), /PCB_STRING_OBSERVATION_REPLY/u);
  assert.throws(() => decodeCurrentPcbStringActorClock(new Proxy({}, {})), /PCB_STRING_OBSERVATION_REPLY/u);
});

/** Local V8 only: synthetic application owners and actual Date intrinsics.
 * This checks the fixed effect contract, not an EasyEDA realm or actor. */
void test("fixed actor/clock commands execute under V8 side-effect checking with actual Date", async () => {
  const session = new Session(); session.connect(); let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "pcb-string-observation-synthetic" &&
        "uniqueId" in params.context && typeof params.context.uniqueId === "string") { uniqueContextId = params.context.uniqueId; }
  });
  try {
    await session.post("Runtime.enable");
    for (const phase of ["ui", "worker", "pcb"] as const) {
      const context = pcbStringObservationFixture(phase === "worker", `${SETUP}Date.now=originalDateNow;`);
      assert.notEqual(uniqueContextId, "");
      const command = currentPcbStringActorClockCommand(phase, uniqueContextId, IDENTITY);
      const observed = await (session.post("Runtime.callFunctionOn", command.params) as Promise<unknown>);
      assert.ok(observed !== null && typeof observed === "object" && !Object.hasOwn(observed, "exceptionDetails"), JSON.stringify(observed));
      assert.equal(decodeCurrentPcbStringActorClock(observed).phase, phase);
      if (phase !== "pcb") {
        runInContext(phase === "ui" ?
          'gVars.loginedUserInfo=new Proxy(gVars.loginedUserInfo,{getOwnPropertyDescriptor(o,k){getterReads++;return Reflect.getOwnPropertyDescriptor(o,k);}});' :
          'PROJECT.user=new Proxy(PROJECT.user,{getOwnPropertyDescriptor(o,k){getterReads++;return Reflect.getOwnPropertyDescriptor(o,k);}});', context);
        const refused = await (session.post("Runtime.callFunctionOn", command.params) as Promise<unknown>);
        assert.throws(() => decodeCurrentPcbStringActorClock(refused), /PCB_STRING_OBSERVATION_REPLY/u);
      }
      assert.equal(runInContext("getterReads+vendorCalls", context) as unknown, 0);
    }
  } finally { session.disconnect(); }
});
