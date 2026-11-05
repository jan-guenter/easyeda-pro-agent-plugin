import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { z } from "zod";
import { CURRENT_PROJECT_STRUCTURE_WORKER_CALLS } from "../src/current-project-structure-worker-programs.ts";
import { CurrentPcb209WorkerConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import { requireCurrentProjectStructureWorkerLease } from "../src/current-project-structure-worker-lease.ts";
import { CurrentProjectStructureWorkerObserver, requireCurrentProjectStructureWorkerObservation } from "../src/current-project-structure-worker-observer.ts";
import { construction209Inspector } from "./helpers/current-pcb-worker-construction-inspector.ts";

async function original(context: TestContext, fault: "none" | "owner" | "pause" = "none"): Promise<Readonly<{ fixture: Awaited<ReturnType<typeof construction209Inspector>>;
  runner: CurrentPcb209WorkerConstructionRunner; lease: Awaited<ReturnType<CurrentPcb209WorkerConstructionRunner["issueStructureObservationLease"]>> }>> {
  const fixture = await construction209Inspector(context);
  let observing = false;
  const runner = new CurrentPcb209WorkerConstructionRunner({ ...fixture.transport,
    request: async (command): Promise<unknown> => {
      const reply = await fixture.transport.request(command);
      if (observing && fault === "owner" && command.method === "Runtime.callFunctionOn" && command.params.functionDeclaration === CURRENT_PROJECT_STRUCTURE_WORKER_CALLS.success) { fixture.lose(); }
      return reply;
    },
    subscribe: (events): (() => void) => fixture.transport.subscribe({ ...events, paused: input => {
      if (observing && fault === "pause") {
        const value = z.looseObject({ hitBreakpoints: z.array(z.string()) }).parse(input);
        events.paused({ reason: "exception", hitBreakpoints: value.hitBreakpoints, callFrames: [] });
      } else { events.paused(input); }
    } }),
  });
  const capture = runner.capture(); await runner.whenArmed(); const running = fixture.run(); const packet = await capture; await running;
  const assignments = await runner.proveCurrentAssignments(packet), lease = await runner.issueStructureObservationLease(packet, assignments);
  await fixture.syntheticEvaluate(`globalThis.SYNTHETIC_TIMER_COUNT=0;globalThis.SYNTHETIC_TIMERS=new Map;globalThis.SYNTHETIC_SET_TIMEOUT=setTimeout;globalThis.SYNTHETIC_CLEAR_TIMEOUT=clearTimeout;globalThis.setTimeout=(callback,delay)=>{const id=++SYNTHETIC_TIMER_COUNT;SYNTHETIC_TIMERS.set(id,SYNTHETIC_SET_TIMEOUT(callback,delay));return id;};globalThis.clearTimeout=id=>SYNTHETIC_CLEAR_TIMEOUT(SYNTHETIC_TIMERS.get(id));PROJECT.uuid="${"a".repeat(64)}";PROJECT._branchUuid="${"b".repeat(32)}";PROJECT.branchUuid=PROJECT._branchUuid;PROJECT.isReady=true;PROJECT.isReadOnly=()=>false;PROJECT.projectDetails={owner:"synthetic-owner"};PROJECT.consistencyManager.getMaxTicket=()=>17;for(const k of ["board","schematic","sheet","pcb","panel","symbol"])PROJECT[k].getStructure=()=>({result:{}});globalThis.ve={SCH:1,BOARD:2,PCB:3,SCH_PAGE:4,SYMBOL:5,PANEL:6};globalThis.De={META:1,DELETE_DOC:2};globalThis.Re={getInstance:()=>({project:{setProfile:async packet=>{globalThis.SYNTHETIC_PACKET=packet;return {success:true};}}})};globalThis.et=()=>{};`);
  observing = true; return { fixture, runner, lease };
}

void test("original209 worker events retain packet/task/serial promises through both real Nd finalizers", { timeout: 30_000 }, async context => {
  const { fixture, runner, lease } = await original(context);
  assert.throws(() => requireCurrentProjectStructureWorkerLease({ ...lease }), /ORIGINAL_WORKER_LEASE/u);
  const owner = "°🍀\n".repeat(4096);
  await fixture.syntheticEvaluate(`PROJECT.projectDetails.owner=${JSON.stringify(owner)}`);
  const observer = new CurrentProjectStructureWorkerObserver(lease); await observer.arm();
  const start = await fixture.syntheticEvaluate("globalThis.SYNTHETIC_UPLOAD=PROJECT.uploadStructure(ve.SCH,De.META,false);true"); assert.notEqual(start, null);
  const observation = await observer.observation();
  assert.equal(observation.ticket, 17); assert.equal(observation.projectUuid, "a".repeat(64));
  assert.equal(observation.structureText, JSON.stringify({ boards: {}, schematics: {}, sheets: {}, pcbs: {}, panels: {}, blockSymbols: {}, owner }));
  assert.ok(Buffer.byteLength(observation.structureText) > 16_384);
  const settledRequests = observer.retained().requests;
  await assert.rejects(observer.observation()); assert.equal(observer.retained().requests, settledRequests);
  assert.equal(observation.nativeQueueCompletionGranted, false); assert.equal(observation.executionAuthorized, false);
  const retained = requireCurrentProjectStructureWorkerObservation(observation);
  assert.equal(retained.debounceTimer, 1); assert.equal(observation.originalDebounceTimerAndResolverRetained, true);
  assert.equal(retained.issuer, runner); assert.equal(retained.lease, lease);
  assert.notEqual(retained.task, retained.uploadPromise); assert.notEqual(retained.task, retained.structurePromise);
  assert.throws(() => requireCurrentProjectStructureWorkerObservation({ ...observation }), /ORIGINAL_OBSERVATION/u);
  await assert.rejects(runner.release(), /STRUCTURE_RETAIN_OBSERVER/u);
  await observer.cleanup(); assert.equal(requireCurrentProjectStructureWorkerObservation(observation), retained);
  await runner.release();
  assert.throws(() => requireCurrentProjectStructureWorkerObservation(observation), /STRUCTURE_ORIGINAL_INPUTS_CHANGED/u);
  assert.throws(() => requireCurrentProjectStructureWorkerLease(lease), /STRUCTURE_ORIGINAL_INPUTS_CHANGED/u);
  assert.equal(observer.retained().unresolvedBreakpoints, false); assert.equal(observer.retained().pendingPause, false);
});

void test("queued original uploads refuse without synthesizing a debounce flush", { timeout: 30_000 }, async context => {
  const { fixture, runner, lease } = await original(context), observer = new CurrentProjectStructureWorkerObserver(lease);
  await observer.arm(); await fixture.syntheticEvaluate("PROJECT.uploadStructure(ve.SCH,De.META,false);PROJECT.uploadStructure(ve.SCH,De.META,false);true");
  await assert.rejects(observer.observation()); assert.equal(observer.retained().failed, true);
  await observer.cleanup(); await runner.release();
});

void test("native callback failure refuses even though the original Nd promise discards its result", { timeout: 30_000 }, async context => {
  const { fixture, runner, lease } = await original(context), observer = new CurrentProjectStructureWorkerObserver(lease);
  await fixture.syntheticEvaluate("Re.getInstance=()=>({project:{setProfile:async()=>({success:false})}})");
  await observer.arm(); await fixture.syntheticEvaluate("PROJECT.uploadStructure(ve.SCH,De.META,false);true");
  await assert.rejects(observer.observation());
  assert.equal(observer.retained().failed, true); assert.equal(observer.retained().pendingPause, true);
  await observer.cleanup(); await runner.release();
});

void test("equal replacement of the posted datas object is refused across the original await", { timeout: 30_000 }, async context => {
  const { fixture, runner, lease } = await original(context), observer = new CurrentProjectStructureWorkerObserver(lease);
  await fixture.syntheticEvaluate("Re.getInstance=()=>({project:{setProfile:async packet=>{packet.datas={...packet.datas};return {success:true}}}})");
  await observer.arm(); await fixture.syntheticEvaluate("PROJECT.uploadStructure(ve.SCH,De.META,false);true");
  await assert.rejects(observer.observation()); assert.equal(observer.retained().failed, true);
  await observer.cleanup(); await runner.release();
});

void test("copied original construction inputs refuse before sends and consume the lease attempt", { timeout: 30_000 }, async context => {
  const fixture = await construction209Inspector(context), runner = new CurrentPcb209WorkerConstructionRunner(fixture.transport);
  const capture = runner.capture(); await runner.whenArmed(); const running = fixture.run(); const packet = await capture; await running;
  const assignments = await runner.proveCurrentAssignments(packet), before = fixture.commands.length;
  let replacedGuardCalls = 0;
  runner.requireCurrentAssignments = (): Promise<void> => { replacedGuardCalls += 1; return Promise.resolve(); };
  await assert.rejects(runner.issueStructureObservationLease({ ...packet }, assignments), /ORIGINAL_PACKET/u);
  assert.equal(replacedGuardCalls, 0);
  await assert.rejects(runner.issueStructureObservationLease(packet, assignments), /STRUCTURE_LEASE_UNAVAILABLE/u);
  assert.equal(fixture.commands.length, before); await runner.release();
});


void test("owner loss after an actual response refuses publication and preserves original cleanup", { timeout: 30_000 }, async context => {
  const { fixture, runner, lease } = await original(context, "owner"), observer = new CurrentProjectStructureWorkerObserver(lease);
  await observer.arm(); await fixture.syntheticEvaluate("PROJECT.uploadStructure(ve.SCH,De.META,false);true");
  await assert.rejects(observer.observation()); assert.equal(observer.retained().failed, true);
  const count = fixture.counts().resumes; await observer.cleanup(); assert.equal(fixture.counts().resumes, count + 1);
  await runner.release();
});

void test("a malformed owned pause remains retained for one original cleanup resume", { timeout: 30_000 }, async context => {
  const { fixture, runner, lease } = await original(context, "pause"), observer = new CurrentProjectStructureWorkerObserver(lease);
  await observer.arm(); await fixture.syntheticEvaluate("PROJECT.uploadStructure(ve.SCH,De.META,false);true");
  await assert.rejects(observer.observation()); assert.equal(observer.retained().pendingPause, true);
  await assert.rejects(runner.release(), /STRUCTURE_RETAIN_OBSERVER/u);
  const count = fixture.counts().resumes; await observer.cleanup(); assert.equal(fixture.counts().resumes, count + 1);
  await observer.cleanup(); assert.equal(fixture.counts().resumes, count + 1);
  assert.equal(runner.status().failed, true);
  await assert.rejects(requireCurrentProjectStructureWorkerLease(lease).assertOriginal(), /STRUCTURE_OBSERVER_FAILED/u);
  await runner.release();
});

