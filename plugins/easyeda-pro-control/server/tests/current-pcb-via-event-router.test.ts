import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcbViaEventRouter } from "../src/current-pcb-via-event-router.ts";
import type { CurrentPcbViaEventPoint } from "../src/current-pcb-via-event-router.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";

const save: CurrentPcbViaEventPoint = Object.freeze({ sessionId: "original-worker", scriptId: "project-script", breakpointId: "save-entry", role: "entry", lineNumber: 110, columnNumber: 131_055 });
const clock: CurrentPcbViaEventPoint = Object.freeze({ sessionId: "original-ui", scriptId: "preload-script", breakpointId: "clock-result", role: "result", lineNumber: 1, columnNumber: 86_544 });
function paused(point: CurrentPcbViaEventPoint): DiagnosticEvent {
  return { method: "Debugger.paused", sessionId: point.sessionId, params: { hitBreakpoints: [point.breakpointId], callFrames: [{ location: { scriptId: point.scriptId, lineNumber: point.lineNumber, columnNumber: point.columnNumber } }] } };
}
function fixture(): Readonly<{ router: CurrentPcbViaEventRouter; reads: { count: number; failed: boolean }; deliver: (event: DiagnosticEvent) => void; entered: () => Promise<true> }> {
  const reads = { count: 0, failed: false }; let gate: ReturnType<typeof Promise.withResolvers<DiagnosticEvent>> | null = null;
  let entered = Promise.withResolvers<true>();
  const router = new CurrentPcbViaEventRouter(Object.freeze({ workerSessionId: save.sessionId, uiSessionId: clock.sessionId,
    assertCurrent: (): Promise<void> => Promise.resolve(), fail: (): void => { reads.failed = true; },
    nextEvent: (): Promise<DiagnosticEvent> => { assert.equal(gate, null); reads.count += 1; gate = Promise.withResolvers<DiagnosticEvent>(); entered.resolve(true); return gate.promise; } }));
  router.register("save", save); router.register("clock", clock);
  return { router, reads, entered: (): Promise<true> => entered.promise, deliver: (event: DiagnosticEvent): void => {
    assert.ok(gate !== null); const current = gate; gate = null; entered = Promise.withResolvers<true>(); current.resolve(event);
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
