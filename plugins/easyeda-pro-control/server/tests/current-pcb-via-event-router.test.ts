import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcbViaEventRouter } from "../src/current-pcb-via-event-router.ts";
import { CurrentSchematicDisplayEventRouter } from "../src/current-schematic-display-event-router.ts";
import type { CurrentPcbViaEventPoint } from "../src/current-pcb-via-event-router.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";

const save: CurrentPcbViaEventPoint = Object.freeze({ sessionId: "original-worker", scriptId: "project-script", breakpointId: "save-entry", role: "entry", lineNumber: 110, columnNumber: 131_055 });
const clock: CurrentPcbViaEventPoint = Object.freeze({ sessionId: "original-ui", scriptId: "preload-script", breakpointId: "clock-result", role: "result", lineNumber: 1, columnNumber: 86_544 });
function paused(point: CurrentPcbViaEventPoint): DiagnosticEvent {
  return { method: "Debugger.paused", sessionId: point.sessionId, params: { hitBreakpoints: [point.breakpointId], callFrames: [{ location: { scriptId: point.scriptId, lineNumber: point.lineNumber, columnNumber: point.columnNumber } }] } };
}
function fixture(Constructor: typeof CurrentPcbViaEventRouter | typeof CurrentSchematicDisplayEventRouter = CurrentPcbViaEventRouter): Readonly<{ router: CurrentPcbViaEventRouter | CurrentSchematicDisplayEventRouter; reads: { count: number; failed: boolean }; deliver: (event: DiagnosticEvent) => void; entered: () => Promise<true> }> {
  const reads = { count: 0, failed: false }; let gate: ReturnType<typeof Promise.withResolvers<DiagnosticEvent>> | null = null;
  let entered = Promise.withResolvers<true>(); const queued: DiagnosticEvent[] = [];
  const router = new Constructor(Object.freeze({ workerSessionId: save.sessionId, uiSessionId: clock.sessionId,
    assertCurrent: (): Promise<void> => Promise.resolve(), fail: (): void => { reads.failed = true; },
    nextEvent: (allowNativePoll: boolean): Promise<DiagnosticEvent | null> => { const event = queued.shift(); if (event !== undefined) { return Promise.resolve(event); } if (!allowNativePoll) { return Promise.resolve(null); }
      assert.equal(gate, null); reads.count += 1; gate = Promise.withResolvers<DiagnosticEvent>(); entered.resolve(true); return gate.promise; } }));
  router.register("save", save); router.register("clock", clock);
  return { router, reads, entered: (): Promise<true> => entered.promise, deliver: (event: DiagnosticEvent): void => {
    if (gate === null) { queued.push(event); router.notifyEvent(); return; } const current = gate; gate = null; entered = Promise.withResolvers<true>(); current.resolve(event);
  } };
}
void test("concurrent Save and clock collectors share one original poll and route each resumed event to its consumed pause", async () => {
  const f = fixture(); const saving = f.router.next("save"); const clocking = f.router.next("clock");
  await f.entered(); assert.equal(f.reads.count, 1); f.deliver(paused(clock)); const receivedClock = await clocking; assert.equal(receivedClock.sessionId, clock.sessionId);
  await f.entered(); assert.equal(f.reads.count, 2); f.deliver(paused(save)); const receivedSave = await saving; assert.equal(receivedSave.sessionId, save.sessionId);
  assert.throws(() => { f.router.reserveResume("save", clock.sessionId); }); assert.throws(() => { f.router.reserveResume("clock", clock.sessionId, "complete"); });
  f.router.reserveResume("save", save.sessionId); f.router.reserveResume("clock", clock.sessionId, "result");
  assert.throws(() => { f.router.reserveResume("clock", clock.sessionId, "result"); });
  const saveResumed = f.router.next("save"); const clockResumed = f.router.next("clock"); await f.entered();
  f.deliver({ method: "Debugger.resumed", sessionId: save.sessionId, params: {} }); const savedResult = await saveResumed; assert.equal(savedResult.method, "Debugger.resumed");
  await f.entered(); f.deliver({ method: "Debugger.resumed", sessionId: clock.sessionId, params: {} }); const clockResult = await clockResumed; assert.equal(clockResult.method, "Debugger.resumed");
  assert.equal(f.reads.failed, false); assert.equal(f.reads.count, 4);
});
for (const Constructor of [CurrentPcbViaEventRouter, CurrentSchematicDisplayEventRouter]) {
  void test(`${Constructor.name} parks another collector until the original held worker continuation`, async () => {
    const f = fixture(Constructor), point = { ...save, breakpointId: "structure-bootstrap", role: "bootstrap", columnNumber: 162_932 };
    f.router.register("structure", point); const constructing = f.router.next("structure"), saving = f.router.next("save");
    await f.entered(); f.deliver(paused(point)); await constructing;
    for (let index = 0; index < 20; index += 1) { await Promise.resolve(); }
    assert.equal(f.reads.count, 1, "a held worker cannot produce another worker event");
    f.router.reserveResume("structure", save.sessionId, "bootstrap"); const resumed = f.router.next("structure"); await f.entered();
    f.deliver({ method: "Debugger.resumed", sessionId: save.sessionId, params: {} }); await resumed;
    await f.entered(); f.deliver(paused(save)); await saving; assert.equal(f.reads.count, 3); assert.equal(f.reads.failed, false);
  });
  void test(`${Constructor.name} drains queued UI events while parked and revocation wakes the retained waiter`, async () => {
    const f = fixture(Constructor), held = f.router.next("save"); await f.entered(); f.deliver(paused(save)); await held;
    const clocking = f.router.next("clock"); for (let index = 0; index < 20; index += 1) { await Promise.resolve(); }
    assert.equal(f.reads.count, 1); f.deliver(paused(clock)); await clocking; assert.equal(f.reads.count, 1);
    const waiting = assert.rejects(f.router.next("structure"), /EVENT_ROUTE/u); for (let index = 0; index < 20; index += 1) { await Promise.resolve(); }
    f.router.revoke(); await waiting; assert.equal(f.reads.count, 1); assert.equal(f.reads.failed, false);
  });
}
void test("unknown IDs, overlapping sites and unreserved resumes refuse instead of choosing another collector", async () => {
  const f = fixture(); assert.throws(() => { f.router.register("clock", { ...save, breakpointId: "overlap" }); });
  const next = assert.rejects(f.router.next("clock")); await f.entered(); f.deliver({ method: "Debugger.resumed", sessionId: clock.sessionId, params: {} }); await next;
  assert.equal(f.reads.failed, true);
  const other = fixture(), refused = assert.rejects(other.router.next("save")); await other.entered(); other.deliver(paused({ ...save, breakpointId: "unissued" })); await refused;
  assert.equal(other.reads.failed, true);
});
void test("failure never abandons the already pending original event read", async () => {
  const f = fixture(); let settled = false;
  const original = (async (): Promise<void> => { try { await f.router.next("save"); } finally { settled = true; } })();
  const refused = assert.rejects(original); await f.entered(); f.router.fail(); await Promise.resolve(); assert.equal(settled, false);
  f.deliver(paused(save)); await refused; assert.equal(settled, true);
});
void test("paused data is captured before post-read owner awaits can replace the original envelope", async () => {
  const entered = Promise.withResolvers<true>(), release = Promise.withResolvers<true>(); let checks = 0;
  const head = { scriptId: save.scriptId, lineNumber: save.lineNumber, columnNumber: save.columnNumber };
  const params = { hitBreakpoints: [save.breakpointId], callFrames: [{ location: head }] };
  const router = new CurrentPcbViaEventRouter(Object.freeze({ workerSessionId: save.sessionId, uiSessionId: clock.sessionId,
    nextEvent: (): Promise<DiagnosticEvent> => Promise.resolve({ method: "Debugger.paused", sessionId: save.sessionId, params }), fail: (): void => { assert.fail("unexpected route failure"); },
    assertCurrent: async (): Promise<void> => { checks += 1; if (checks === 2) { entered.resolve(true); await release.promise; } } }));
  router.register("save", save); const pending = router.next("save"); await entered.promise;
  head.columnNumber += 1; params.hitBreakpoints[0] = "foreign"; release.resolve(true);
  const result = await pending; assert.equal(JSON.stringify(result.params), JSON.stringify({ hitBreakpoints: [save.breakpointId], callFrames: [{ location: { scriptId: save.scriptId, lineNumber: save.lineNumber, columnNumber: save.columnNumber } }] }));
  assert.equal(Object.isFrozen(result.params), true);
});
void test("only five delivered original clock resumes together with the unconsumed delivered Save body pass native custody", async () => {
  const f = fixture(); const body = { ...save, breakpointId: "save-body", role: "body", columnNumber: 131_307 }; f.router.register("save", body);
  const points: CurrentPcbViaEventPoint[] = [clock];
  for (const [index, role] of ["push", "dispatch", "reply", "complete"].entries()) {
    const ui = role === "complete"; const point = { sessionId: ui ? clock.sessionId : save.sessionId, scriptId: ui ? clock.scriptId : save.scriptId,
      breakpointId: `clock-${role}`, role, lineNumber: ui ? 1 : 0, columnNumber: ui ? 86_798 : 100 + index };
    points.push(point); f.router.register("clock", point);
  }
  assert.throws(() => { f.router.requireClockCompletionWithHeldSaveBody(); });
  for (const role of ["push", "dispatch", "result", "reply", "complete"]) {
    const point = points.find(value => value.role === role); assert.ok(point !== undefined);
    const pause = f.router.next("clock"); await f.entered(); f.deliver(paused(point)); await pause;
    f.router.reserveResume("clock", point.sessionId, role); const resumed = f.router.next("clock"); await f.entered();
    f.deliver({ method: "Debugger.resumed", sessionId: point.sessionId, params: {} }); await resumed;
    assert.throws(() => { f.router.requireClockCompletionWithHeldSaveBody(); });
  }
  const held = f.router.next("save"); await f.entered(); f.deliver(paused(body)); await held; f.router.requireClockCompletionWithHeldSaveBody();
  f.router.reserveResume("save", save.sessionId, "body"); assert.throws(() => { f.router.requireClockCompletionWithHeldSaveBody(); });
});

void test("producer event ownership never permits the router to reserve a worker resume", async () => {
  const f = fixture(), point = { ...save, breakpointId: "original-producer", role: "localIngress", columnNumber: 17_028 }; f.router.register("producer", point);
  const pending = f.router.next("producer"); await f.entered(); f.deliver(paused(point)); await pending;
  assert.throws(() => { f.router.reserveResume("producer", point.sessionId, point.role); }); assert.equal(f.reads.count, 1);
});
