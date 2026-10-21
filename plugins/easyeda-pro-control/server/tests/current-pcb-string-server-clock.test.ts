/* oxlint-disable import/max-dependencies -- This integration test constructs every original actor, SQL, clock and history issuer; a pass-through barrel would hide those independent ownership boundaries. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import type { Context } from "node:vm";
import { CurrentPcbStringActorClockRunner } from "../src/current-pcb-string-actor-clock-runner.ts";
import { planCurrentPcbStringCreate } from "../src/current-pcb-string-create.ts";
import { planCurrentPcbStringCreateObservation } from "../src/current-pcb-string-create-observation.ts";
import { prepareCurrentPcbStringHistory } from "../src/current-pcb-string-history.ts";
import type { CurrentPcbStringHistoryProjection } from "../src/current-pcb-string-history.ts";
import { CurrentPcbStringNativeClockIssuer } from "../src/current-pcb-string-native-clock.ts";
import { planCurrentPcbStringPublication } from "../src/current-pcb-string-publication.ts";
import { compareCurrentPcbStringSaveClockHistory, prepareCurrentPcbStringSaveClock,
  recordCurrentPcbStringSaveClockPost } from "../src/current-pcb-string-save-clock.ts";
import { prepareCurrentPcbStringSaveProvenance } from "../src/current-pcb-string-save-provenance.ts";
import type { CurrentPcbStringSaveProvenance } from "../src/current-pcb-string-save-provenance.ts";
import { CURRENT_PCB_STRING_SERVER_CLOCK_FUNCTION, CURRENT_PCB_STRING_SERVER_CLOCK_RPC,
  currentPcbStringServerClockCommand, decodeCurrentPcbStringServerClock } from "../src/current-pcb-string-server-clock.ts";
import { CurrentPcbStringServerClockRunner } from "../src/current-pcb-string-server-clock-runner.ts";
import type { CurrentPcbStringServerClockTransport } from "../src/current-pcb-string-server-clock-runner.ts";
import { IDS, fixture } from "./helpers/symbol-sql-fixture.ts";

const IDENTITY = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: IDS.branch,
  documentUuid: IDS.target, windowTabId: "original-string-window" });
const USER = Object.freeze({ uuid: IDS.actor, nickname: "UI nickname", username: "UI username", avatar: "" });
const USER_TEXT = JSON.stringify(USER);
function runtime(change = ""): Context {
  const context = createContext({});
  runInContext(`const VP="_MSG_BUS_RPC_";
  globalThis.calls=[];globalThis.clock=1000;globalThis.getterReads=0;globalThis.clearCalls=0;
  globalThis.Date.now=()=>clock;Date.prototype.getTimezoneOffset=()=>0;
  globalThis.setTimeout=(callback,ms)=>{globalThis.timeoutCallback=callback;return 1;};globalThis.clearTimeout=()=>clearCalls++;
  class Mb {constructor(){this.uuid="11111111-1111-1111-1111-111111111111";this.rpcTicket=0;} ${CURRENT_PCB_STRING_SERVER_CLOCK_RPC}
    subscribeOnce(topic,callback){this.replyCallback=callback;}
  }
  class KP extends Mb {push(topic,value){calls.push([topic,value]);clock=1001;this.replyCallback({success:true,result:1000});}}
  class JP extends KP {}
  class Gd {} class Lg extends Gd {}
  globalThis.PROJECT=new Lg();Object.assign(PROJECT,{uuid:${JSON.stringify(IDENTITY.projectUuid)},_branchUuid:${JSON.stringify(IDS.branch)},
    _isV2Format:false,user:${USER_TEXT},wsBus:new JP()});
  globalThis._TAB_ID_=${JSON.stringify(IDENTITY.windowTabId)};globalThis["/"+_TAB_ID_+"/notify"]=PROJECT.wsBus;
  ${change}`, context);
  return context;
}
async function raw(context: Context): Promise<unknown> {
  const value: unknown = await runInContext(`(${CURRENT_PCB_STRING_SERVER_CLOCK_FUNCTION})(${JSON.stringify(IDENTITY)},${JSON.stringify(USER_TEXT)})`, context);
  return { result: { type: "string", value } };
}
async function owned(): Promise<Readonly<{ token: CurrentPcbStringSaveProvenance; expire: () => void }>> {
  let current = true;
  const runner = new CurrentPcbStringActorClockRunner({ async request(command): Promise<unknown> {
    const stamp = { milliseconds: 1000, iso: new Date(1000).toISOString(), timezoneOffsetMinutes: 0 };
    const actor = { uuid: USER.uuid, username: USER.username, nickname: USER.nickname };
    const value = { schema: "easyeda-pro-control.pcb-string-actor-clock.v1", phase: command.actorClockPhase,
      clock: { before: stamp, after: stamp }, ...(command.actorClockPhase === "pcb" ? {} :
        { identity: IDENTITY, workerUser: USER, workerUserText: USER_TEXT,
          ...(command.actorClockPhase === "ui" ? { cachedActor: actor, startupActor: actor } : {}) }) };
    await Promise.resolve(); return { result: { type: "string", value: JSON.stringify(value) } };
  }, assertCurrent(): void { assert.equal(current, true, "actor owner lost"); } },
  { ui: "ui-original", worker: "worker-original", pcb: "pcb-original" }, IDENTITY);
  const packet = await runner.observe(); const database = await fixture({ project: IDENTITY.projectUuid, branch: IDS.branch, target: IDS.target });
  return { token: prepareCurrentPcbStringSaveProvenance(runner, packet, database.before), expire(): void { current = false; } };
}
void test("fixed String server-time program invokes the original worker route once and never claims Save", async () => {
  const context = runtime(), reply = await raw(context), result = decodeCurrentPcbStringServerClock(reply, IDENTITY, USER_TEXT);
  assert.equal(result.serverTimeMs, 1000); assert.equal(result.rpcTicketBefore, 0); assert.equal(result.rpcTicketAfter, 1);
  assert.equal(result.workerUserText, USER_TEXT); assert.equal(runInContext("calls.length", context) as unknown, 1);
  assert.equal(runInContext("calls[0][0]", context) as unknown, "/pro-mgr/serverTime/now");
  assert.equal(runInContext("clearCalls", context) as unknown, 1);
  const command = currentPcbStringServerClockCommand("worker-original", IDENTITY, USER_TEXT);
  assert.equal(command.params.throwOnSideEffect, false); assert.equal(command.params.awaitPromise, true);
  assert.equal(command.params.userGesture, false); assert.equal(command.saveClockPhase, "server-time");
});
void test("worker bus owner, exact method source and actor swaps refuse before dispatch", async () => {
  for (const change of [
    'PROJECT.wsBus.rpcCall=()=>123;', 'PROJECT.wsBus.rpcTicket=-0;', 'PROJECT.user.nickname="other";',
    'PROJECT._branchUuid="e".repeat(32);', 'globalThis["/"+_TAB_ID_+"/notify"]={};',
    'Object.defineProperty(PROJECT.user,"avatar",{get(){getterReads++;return "";}});',
  ]) {
    const context = runtime(change); await assert.rejects(raw(context), /PCB_STRING_SERVER_CLOCK_STATE/u);
    assert.equal(runInContext("calls.length+getterReads", context) as unknown, 0);
  }
});
void test("clock or actor drift after the sole RPC refuses and clears only the agent deadline", async () => {
  for (const change of [
    'KP.prototype.push=function(){calls.push(1);PROJECT.user.nickname="changed";this.replyCallback({success:true,result:1000});};',
    'KP.prototype.push=function(){calls.push(1);this.rpcTicket++;this.replyCallback({success:true,result:1000});};',
    'KP.prototype.push=function(){calls.push(1);this.replyCallback({success:true,result:1002});};',
    'KP.prototype.push=function(){calls.push(1);clock=11001;this.replyCallback({success:true,result:1001});};',
    'KP.prototype.push=function(){calls.push(1);Object.defineProperty(PROJECT.user,"nickname",{get(){getterReads++;return "changed";}});this.replyCallback({success:true,result:1000});};',
  ]) {
    const context = runtime(change); await assert.rejects(raw(context), /PCB_STRING_SERVER_CLOCK_STATE/u);
    assert.equal(runInContext("calls.length", context) as unknown, 1); assert.equal(runInContext("clearCalls", context) as unknown, 1);
    assert.equal(runInContext("getterReads", context) as unknown, 0);
  }
  const timeout = runtime('KP.prototype.push=function(){calls.push(1);timeoutCallback();};');
  await assert.rejects(raw(timeout), /PCB_STRING_SERVER_CLOCK_TIMEOUT/u);
  assert.equal(runInContext("calls.length", timeout) as unknown, 1); assert.equal(runInContext("clearCalls", timeout) as unknown, 1);
});
void test("String server clock conservatively refuses server offsets outside the local bracket", async () => {
  for (const serverTime of [999, 1002]) {
    const context = runtime(`KP.prototype.push=function(){calls.push(1);clock=1001;this.replyCallback({success:true,result:${String(serverTime)}});};`);
    await assert.rejects(raw(context), /PCB_STRING_SERVER_CLOCK_STATE/u);
    assert.equal(runInContext("calls.length", context) as unknown, 1);
    assert.equal(runInContext("clearCalls", context) as unknown, 1);
  }
});
void test("String server-clock runner retains its original actor/SQL selection and consumes one request", async () => {
  const f = await owned(); let calls = 0;
  const transport: CurrentPcbStringServerClockTransport = { request(command): Promise<unknown> {
    calls += 1; assert.equal(command.params.uniqueContextId, "worker-original"); return raw(runtime());
  }, assertCurrent(): void {
    // Synthetic outer native owner.
  } };
  const runner = new CurrentPcbStringServerClockRunner(f.token, transport); const packet = await runner.observe();
  assert.equal(runner.requireOriginal(packet), packet); assert.equal(packet.serverTimeRpcObserved, true);
  for (const name of ["windowsClockProvenanceVerified", "saveClockProvenanceVerified", "futureSaveClockObserved",
    "exclusiveRpcServiceVerified", "executionAuthorized", "saveAuthorized"] as const) { assert.equal(packet[name], false); }
  assert.throws(() => runner.requireOriginal(structuredClone(packet)), /original completed/u);
  await assert.rejects(runner.observe(), /attempt consumed/u);
  await assert.rejects(new CurrentPcbStringServerClockRunner(f.token, transport).observe(), /attempt consumed/u); assert.equal(calls, 1);
  f.expire(); assert.throws(() => runner.requireOriginal(packet), /actor owner lost/u);
});
void test("String server-clock runner retains replies after lost owner and cannot retry malformed or thrown requests", async () => {
  for (const kind of ["owner", "malformed", "throw"] as const) {
    const f = await owned(); let calls = 0;
    const runner = new CurrentPcbStringServerClockRunner(f.token, { async request(): Promise<unknown> {
      calls += 1; if (kind === "throw") { throw new Error("transport timeout"); }
      if (kind === "owner") { const reply = await raw(runtime()); f.expire(); return reply; }
      return { result: { type: "string", value: "{}" } };
    }, assertCurrent(): void {
      // Synthetic outer native owner.
    } });
    await assert.rejects(runner.observe()); assert.equal(runner.status().phase, "failed");
    assert.equal(runner.status().rawReplyRetained, kind !== "throw"); assert.equal(runner.status().rpcMayRemainPending, true);
    await assert.rejects(runner.observe(), /attempt consumed/u); assert.equal(calls, 1);
  }
});
void test("String server-clock captures the arrival before owner hooks and cannot expose a mutable retained alias", async () => {
  const f = await owned(); let incoming: { result: { type: string; value: unknown } } | undefined;
  const runner = new CurrentPcbStringServerClockRunner(f.token, { async request(): Promise<unknown> {
    const context = runtime();
    const value: unknown = await runInContext(`(${CURRENT_PCB_STRING_SERVER_CLOCK_FUNCTION})(${JSON.stringify(IDENTITY)},${JSON.stringify(USER_TEXT)})`, context);
    incoming = { result: { type: "string", value } }; return incoming;
  }, assertCurrent(): void { if (incoming !== undefined) { incoming.result.value = "{}"; } } });
  const packet = await runner.observe(); assert.equal(packet.sample.serverTimeMs, 1000);
  const retained = runner.retainedReply(); assert.ok(retained !== null && typeof retained === "object" && Object.isFrozen(retained));
  const result = Object.getOwnPropertyDescriptor(retained, "result")?.value as unknown;
  assert.ok(result !== null && typeof result === "object" && Object.isFrozen(result));
  assert.throws(() => Object.defineProperty(result, "value", { value: "{}" }));
  assert.equal(runner.requireOriginal(packet), packet);
});

function suppliedHistory(backendTime = 4000): CurrentPcbStringHistoryProjection {
  const candidate = planCurrentPcbStringCreate({ x: 100, y: -200, text: "Original String" });
  const create = planCurrentPcbStringCreateObservation(candidate, { projectUuid: IDENTITY.projectUuid,
    branchUuid: IDENTITY.branchUuid, documentUuid: IDENTITY.documentUuid,
    tabId: `${IDENTITY.documentUuid}@${IDENTITY.projectUuid}` });
  const publication = planCurrentPcbStringPublication(candidate, create, { primitiveId: "d".repeat(16),
    client: "e".repeat(16), uniqueId: "string-token", maximumTicket: 100 });
  return prepareCurrentPcbStringHistory(candidate, publication, { maximumTargetHeaderTime: 0, saveTime: 2000, backendTime,
    saveClock: { minimumMs: 1999, maximumMs: 2001 }, backendClock: { minimumMs: backendTime, maximumMs: backendTime },
    workerUser: USER, backendActor: { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" } });
}
async function clockPlan(): Promise<{ plan: ReturnType<typeof prepareCurrentPcbStringSaveClock>;
  issuer: CurrentPcbStringNativeClockIssuer; terminate: () => void }> {
  const f = await owned(); let terminated = false;
  const binding = Object.freeze({ helperInstance: "a".repeat(32), jobId: "b".repeat(32), rootPid: 1234, rootCreated: "134370398619813012" });
  const issuer = new CurrentPcbStringNativeClockIssuer({ async request(request): Promise<unknown> {
    const ms = { before: 900, armed: 1100, post: 3000, termination: 5000 }[request.phase];
    const ticks = 621_355_968_000_000_000n + BigInt(ms) * 10_000n;
    const sample = { schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks: String(ticks), utcAfterTicks: String(ticks + 10n),
      qpcBefore: String(ms * 1000), qpcAfter: String(ms * 1000 + 1), qpcFrequency: "1000000", highResolution: true,
      localOffsetMinutes: 0, zoneRulesSha256: "c".repeat(64) };
    await Promise.resolve(); return { schema: "easyeda-pro-control.pcb-string-native-clock.v1", phase: request.phase,
      sequence: request.sequence, binding, clock: { before: { tzAbsent: true, reason: null, sample },
        after: { tzAbsent: true, reason: null, sample: { ...sample, utcBeforeTicks: String(ticks + 20n), utcAfterTicks: String(ticks + 30n),
          qpcBefore: String(ms * 1000 + 2), qpcAfter: String(ms * 1000 + 3) } } } };
  }, assertCurrent(phase): void { assert.equal(phase === "termination", terminated, "native lifetime differs"); } }, binding);
  const before = await issuer.observe("before");
  const server = new CurrentPcbStringServerClockRunner(f.token, { request(): Promise<unknown> { return raw(runtime()); },
    assertCurrent(): void { assert.equal(terminated, false); } });
  const packet = await server.observe(); const armed = await issuer.observe("armed");
  const plan = prepareCurrentPcbStringSaveClock(f.token, issuer, before, armed, server, packet);
  assert.throws(() => prepareCurrentPcbStringSaveClock(f.token, issuer, before, armed, server, packet), /consumed/u);
  return { plan, issuer, terminate(): void { terminated = true; f.expire(); } };
}
void test("String clock composition seals live values and accepts only its original termination after actor closure", async () => {
  const f = await clockPlan();
  assert.equal(f.plan.backendWindow.minimumMs, 900); assert.equal(f.plan.saveWindow.minimumMs, 1000);
  assert.equal(f.plan.saveWindow.maximumMs, 61_000); assert.equal(f.plan.originalClockedLaunchVerified, false);
  const post = await f.issuer.observe("post"); recordCurrentPcbStringSaveClockPost(f.plan, post);
  assert.throws(() => { recordCurrentPcbStringSaveClockPost(f.plan, post); }, /consumed/u);
  f.terminate(); const termination = await f.issuer.observe("termination");
  assert.throws(() => f.issuer.requireOriginal(post), /lifetime differs/u);
  // Backend EDIT_HEAD may follow the immediate post reply; closure still bounds it.
  const result = compareCurrentPcbStringSaveClockHistory(f.plan, suppliedHistory(), termination);
  assert.equal(result.suppliedHistoryActorAndClockRelationMatched, true);
  assert.equal(result.originalSaveVerified, false); assert.equal(result.fullSqlVerified, false);
  assert.equal(result.executionAuthorized, false); assert.equal(result.saveAuthorized, false);
  assert.throws(() => compareCurrentPcbStringSaveClockHistory(f.plan, suppliedHistory(), termination), /consumed/u);
});
void test("String clock closure rejects copied plans and a backend timestamp beyond original termination", async () => {
  const f = await clockPlan(); recordCurrentPcbStringSaveClockPost(f.plan, await f.issuer.observe("post"));
  f.terminate(); const termination = await f.issuer.observe("termination");
  assert.throws(() => compareCurrentPcbStringSaveClockHistory(structuredClone(f.plan), suppliedHistory(), termination), /original post/u);
  assert.throws(() => compareCurrentPcbStringSaveClockHistory(f.plan, suppliedHistory(6000), termination), /outside original windows/u);
  assert.throws(() => compareCurrentPcbStringSaveClockHistory(f.plan, suppliedHistory(), termination), /consumed/u);
});
