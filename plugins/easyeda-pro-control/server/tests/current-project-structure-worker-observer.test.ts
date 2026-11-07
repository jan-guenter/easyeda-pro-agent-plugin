import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { setImmediate as nextTurn } from "node:timers/promises";
import { z } from "zod";
import { CURRENT_PROJECT_STRUCTURE_WORKER_CALLS } from "../src/current-project-structure-worker-programs.ts";
import { CurrentPcb209WorkerConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import { requireCurrentProjectStructureWorkerLease } from "../src/current-project-structure-worker-lease.ts";
import { CurrentProjectStructureWorkerObserver, requireCurrentProjectStructureWorkerObservation } from "../src/current-project-structure-worker-observer.ts";
import { construction209Inspector } from "./helpers/current-pcb-worker-construction-inspector.ts";

/** Faults intercept only replies from this original inert V8 inspector, after
 * the real allocation; they never replace the opaque construction lease. */
async function original(context: TestContext, fault: "none" | "owner" | "pause" = "none",
  allocation?: Readonly<{ reply: (raw: unknown, lose: () => void) => Promise<unknown>; removed: (id: string) => void }>): Promise<Readonly<{ fixture: Awaited<ReturnType<typeof construction209Inspector>>;
  runner: CurrentPcb209WorkerConstructionRunner; lease: Awaited<ReturnType<CurrentPcb209WorkerConstructionRunner["issueStructureObservationLease"]>>; loseTransport: () => void }>> {
  const fixture = await construction209Inspector(context);
  let lostEvent: (() => void) | null = null, observing = false;
  const runner = new CurrentPcb209WorkerConstructionRunner({ ...fixture.transport,
    request: async (command): Promise<unknown> => {
      if (observing && command.method === "Debugger.removeBreakpoint") { allocation?.removed(command.params.breakpointId); }
      const reply = await fixture.transport.request(command);
      if (observing && command.method === "Debugger.setBreakpoint" && allocation !== undefined) { return allocation.reply(reply, fixture.lose); }
      if (observing && fault === "owner" && command.method === "Runtime.callFunctionOn" && command.params.functionDeclaration === CURRENT_PROJECT_STRUCTURE_WORKER_CALLS.success) { fixture.lose(); }
      return reply;
    },
    subscribe: (events): (() => void) => { lostEvent = events.lost; return fixture.transport.subscribe({ ...events, paused: input => {
      if (observing && fault === "pause") {
        const value = z.looseObject({ hitBreakpoints: z.array(z.string()) }).parse(input);
        events.paused({ reason: "exception", hitBreakpoints: value.hitBreakpoints, callFrames: [] });
      } else { events.paused(input); }
    } }); },
  });
  const capture = runner.capture(); await runner.whenArmed(); const running = fixture.run(); const packet = await capture; await running;
  const assignments = await runner.proveCurrentAssignments(packet), lease = await runner.issueStructureObservationLease(packet, assignments);
  await fixture.syntheticEvaluate(`globalThis.SYNTHETIC_TIMER_COUNT=0;globalThis.SYNTHETIC_TIMERS=new Map;globalThis.SYNTHETIC_SET_TIMEOUT=setTimeout;globalThis.SYNTHETIC_CLEAR_TIMEOUT=clearTimeout;globalThis.setTimeout=(callback,delay)=>{const id=++SYNTHETIC_TIMER_COUNT;SYNTHETIC_TIMERS.set(id,SYNTHETIC_SET_TIMEOUT(callback,delay));return id;};globalThis.clearTimeout=id=>SYNTHETIC_CLEAR_TIMEOUT(SYNTHETIC_TIMERS.get(id));PROJECT.uuid="${"a".repeat(64)}";PROJECT._branchUuid="${"b".repeat(32)}";PROJECT.branchUuid=PROJECT._branchUuid;PROJECT.isReady=true;PROJECT.isReadOnly=()=>false;PROJECT.projectDetails={owner:"synthetic-owner"};PROJECT.consistencyManager.getMaxTicket=()=>17;for(const k of ["board","schematic","sheet","pcb","panel","symbol"])PROJECT[k].getStructure=()=>({result:{}});globalThis.ve={SCH:1,BOARD:2,PCB:3,SCH_PAGE:4,SYMBOL:5,PANEL:6};globalThis.De={META:1,DELETE_DOC:2};globalThis.Re={getInstance:()=>({project:{setProfile:async packet=>{globalThis.SYNTHETIC_PACKET=packet;return {success:true};}}})};globalThis.et=()=>{};`);
  observing = true; return { fixture, runner, lease, loseTransport: (): void => { fixture.lose(); assert.ok(lostEvent); lostEvent(); } };
}

for (const earlierFailure of [false, true]) {
  void test(`transport loss precedes listener failure while preserving earlier cause: ${String(earlierFailure)}`, { timeout: 30_000 }, async context => {
    const { fixture, runner, lease, loseTransport } = await original(context, earlierFailure ? "pause" : "none");
    const observer = new CurrentProjectStructureWorkerObserver(lease); await observer.arm();
    if (earlierFailure) {
      await fixture.syntheticEvaluate("PROJECT.uploadStructure(ve.SCH,De.META,false);true");
      await assert.rejects(observer.observation());
    }
    const before = runner.status().firstFailure;
    assert.equal(before?.code ?? null, earlierFailure ? "STRUCTURE_OBSERVER_FAILED" : null);
    loseTransport();
    assert.equal(runner.status().firstFailure?.code, earlierFailure ? "STRUCTURE_OBSERVER_FAILED" : "OWNER_LOST");
    if (earlierFailure) { assert.equal(runner.status().firstFailure, before); }
    assert.equal(observer.retained().failed, true);
    const commands = fixture.commands.length;
    await assert.rejects(observer.arm()); assert.equal(fixture.commands.length, commands);
    await observer.cleanup(); await runner.release();
  });
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

void test("original allocation reply is retained before a core post-reply owner refusal", { timeout: 30_000 }, async context => {
  const removed: string[] = []; let allocated = "";
  const { fixture, runner, lease } = await original(context, "none", {
    reply: (raw, lose): Promise<unknown> => { allocated = z.looseObject({ breakpointId: z.string() }).parse(raw).breakpointId; lose(); return Promise.resolve(raw); },
    removed: id => { removed.push(id); },
  });
  const observer = new CurrentProjectStructureWorkerObserver(lease);
  await assert.rejects(observer.arm()); const failure = observer.retained().error;
  assert.equal(observer.retained().failed, true); assert.equal(observer.retained().replies.length, 2);
  assert.equal(z.looseObject({ breakpointId: z.string() }).parse(observer.retained().replies[1]).breakpointId, allocated);
  const commands = fixture.commands.length;
  await assert.rejects(observer.arm()); await assert.rejects(requireCurrentProjectStructureWorkerLease(lease).assertOriginal());
  assert.equal(fixture.commands.length, commands);
  await observer.cleanup(); assert.deepEqual(removed, [allocated]); assert.equal(observer.retained().unresolvedBreakpoints, false);
  assert.equal(observer.retained().failed, true); assert.equal(observer.retained().error, failure);
  await observer.cleanup(); assert.deepEqual(removed, [allocated]); await runner.release();
});

void test("late original allocation survives both caller deadlines without reviving normal work", { timeout: 30_000 }, async context => {
  const arrived = Promise.withResolvers<unknown>(), release = Promise.withResolvers<null>(), removed: string[] = [];
  const { fixture, runner, lease } = await original(context, "none", {
    reply: async raw => { arrived.resolve(raw); await release.promise; return raw; }, removed: id => { removed.push(id); },
  });
  const observer = new CurrentProjectStructureWorkerObserver(lease), rejected = assert.rejects(observer.arm(), /DEADLINE/u);
  const allocated = z.looseObject({ breakpointId: z.string() }).parse(await arrived.promise).breakpointId;
  await rejected; const failure = observer.retained().error;
  assert.equal(observer.retained().replies.length, 1); assert.equal(observer.retained().unresolvedBreakpoints, true);
  await assert.rejects(observer.cleanup()); assert.deepEqual(removed, []);
  await assert.rejects(runner.release(), /STRUCTURE_RETAIN_OBSERVER/u);
  const commands = fixture.commands.length; release.resolve(null);
  await nextTurn();
  assert.equal(observer.retained().replies.length, 2); assert.equal(fixture.commands.length, commands);
  assert.equal(observer.retained().failed, true); assert.equal(observer.retained().error, failure);
  await assert.rejects(observer.arm()); await assert.rejects(requireCurrentProjectStructureWorkerLease(lease).assertOriginal());
  await observer.cleanup(); assert.deepEqual(removed, [allocated]); assert.equal(observer.retained().unresolvedBreakpoints, false);
  await observer.cleanup(); assert.deepEqual(removed, [allocated]); await runner.release();
});

for (const expression of ["PROJECT.uploadStructure(ve.SCH,De.META,false)", "PROJECT.uploadStructure(-1,De.META,false)", "PROJECT.task2.add(Promise.resolve())"]) {
  void test(`pre-existing structure producer refuses before breakpoint allocation: ${expression}`, { timeout: 30_000 }, async context => {
    const { fixture, runner, lease } = await original(context);
    await fixture.syntheticEvaluate(`${expression};true`);
    const allocatedBefore = fixture.commands.filter(command => command === "Debugger.setBreakpoint").length;
    const observer = new CurrentProjectStructureWorkerObserver(lease);
    await assert.rejects(observer.arm()); assert.equal(observer.retained().failed, true);
    assert.equal(fixture.commands.filter(command => command === "Debugger.setBreakpoint").length, allocatedBefore);
    assert.equal(observer.retained().unresolvedBreakpoints, false);
    const commands = fixture.commands.length; await assert.rejects(observer.arm()); assert.equal(fixture.commands.length, commands);
    await observer.cleanup(); await runner.release();
  });
}

void test("a producer consumed while arming refuses after retaining all original removable IDs", { timeout: 30_000 }, async context => {
  const removed: string[] = []; let injected = false;
  const f = await original(context, "none", { reply: async raw => {
    if (!injected) { injected = true; await f.fixture.syntheticEvaluate("PROJECT.uploadStructure(-1,De.META,false);true"); }
    return raw;
  }, removed: id => { removed.push(id); } });
  const observer = new CurrentProjectStructureWorkerObserver(f.lease);
  await assert.rejects(observer.arm()); assert.equal(observer.retained().failed, true);
  assert.equal(observer.retained().unresolvedBreakpoints, true); await observer.cleanup();
  assert.equal(removed.length, 5); assert.equal(new Set(removed).size, 5); assert.equal(observer.retained().unresolvedBreakpoints, false);
  await f.runner.release();
});

void test("malformed allocation location still retains only the original removable ID", { timeout: 30_000 }, async context => {
  const removed: string[] = []; let allocated = "";
  const { runner, lease } = await original(context, "none", {
    reply: raw => { allocated = z.looseObject({ breakpointId: z.string() }).parse(raw).breakpointId; return Promise.resolve({ breakpointId: allocated, actualLocation: null }); },
    removed: id => { removed.push(id); },
  });
  const observer = new CurrentProjectStructureWorkerObserver(lease); await assert.rejects(observer.arm());
  assert.equal(observer.retained().failed, true); await observer.cleanup(); assert.deepEqual(removed, [allocated]);
  assert.equal(observer.retained().unresolvedBreakpoints, false); await runner.release();
});

void test("duplicate allocation ID cannot settle the second original uncertain allocation", { timeout: 30_000 }, async context => {
  const removed: string[] = []; let allocations = 0, first = "";
  const { runner, lease } = await original(context, "none", {
    reply: raw => { const reply = z.looseObject({ breakpointId: z.string(), actualLocation: z.unknown() }).parse(raw); allocations += 1;
      if (allocations === 1) { first = reply.breakpointId; return Promise.resolve(raw); }
      assert.notEqual(reply.breakpointId, first); return Promise.resolve({ breakpointId: first, actualLocation: reply.actualLocation }); },
    removed: id => { removed.push(id); },
  });
  const observer = new CurrentProjectStructureWorkerObserver(lease); await assert.rejects(observer.arm());
  assert.equal(allocations, 2); await assert.rejects(observer.cleanup()); assert.deepEqual(removed, [first]);
  assert.equal(observer.retained().unresolvedBreakpoints, true); await assert.rejects(runner.release(), /STRUCTURE_RETAIN_OBSERVER/u);
});

void test("malformed allocation ID keeps original custody and reply callbacks refuse other commands", { timeout: 30_000 }, async context => {
  const removed: string[] = [];
  const { fixture, runner, lease } = await original(context, "none", {
    reply: (): Promise<unknown> => Promise.resolve({ breakpointId: "invalid ID", actualLocation: null }), removed: id => { removed.push(id); },
  });
  const before = fixture.commands.length, binding = requireCurrentProjectStructureWorkerLease(lease);
  await assert.rejects(binding.request({ method: "Debugger.resume", params: {} }, true, () => assert.fail("No allocation callback")), /STRUCTURE_ALLOCATION_REPLY/u);
  assert.equal(fixture.commands.length, before);
  const observer = new CurrentProjectStructureWorkerObserver(lease); await assert.rejects(observer.arm());
  await assert.rejects(observer.cleanup()); assert.deepEqual(removed, []); assert.equal(observer.retained().unresolvedBreakpoints, true);
  await assert.rejects(runner.release(), /STRUCTURE_RETAIN_OBSERVER/u);
});
