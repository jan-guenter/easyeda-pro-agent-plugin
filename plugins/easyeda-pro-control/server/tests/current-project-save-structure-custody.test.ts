import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcbViaEventRouter } from "../src/current-pcb-via-event-router.ts";
import { CurrentSchematicDisplayEventRouter } from "../src/current-schematic-display-event-router.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";

for (const Router of [CurrentPcbViaEventRouter, CurrentSchematicDisplayEventRouter]) {
  void test(`${Router.name} routes original structure and Save collectors through one pending native read`, async () => {
    let reads = 0; let reading: ReturnType<typeof Promise.withResolvers<DiagnosticEvent>> | null = null;
    let entered = Promise.withResolvers<true>();
    const router = new Router(Object.freeze({ workerSessionId: "worker", uiSessionId: "ui", assertCurrent: (): Promise<void> => Promise.resolve(), fail: (): never => { assert.fail("Unexpected lane failure"); },
      nextEvent: (): Promise<DiagnosticEvent> => { assert.equal(reading, null); reads += 1; reading = Promise.withResolvers<DiagnosticEvent>(); entered.resolve(true); return reading.promise; } }));
    const save = { sessionId: "worker", scriptId: "project", breakpointId: "save-entry", role: "entry", lineNumber: 110, columnNumber: 131_055 };
    const structure = { ...save, breakpointId: "structure-bootstrap", role: "bootstrap", columnNumber: 162_932 };
    router.register("save", save); router.register("structure", structure);
    const deliver = (event: DiagnosticEvent): void => { assert.ok(reading !== null); const pending = reading; reading = null; entered = Promise.withResolvers<true>(); pending.resolve(event); };
    const paused = (point: typeof save): DiagnosticEvent => ({ method: "Debugger.paused", sessionId: point.sessionId, params: { hitBreakpoints: [point.breakpointId], callFrames: [{ location: { scriptId: point.scriptId, lineNumber: point.lineNumber, columnNumber: point.columnNumber } }] } });
    const saved = router.next("save"); const constructed = router.next("structure"); await entered.promise; assert.equal(reads, 1);
    deliver(paused(structure)); const construction = await constructed; assert.equal(construction.method, "Debugger.paused");
    assert.throws(() => { router.reserveResume("save", "worker"); }); assert.throws(() => { router.reserveResume("structure", "worker", "packet"); });
    router.reserveResume("structure", "worker", "bootstrap"); const resumed = router.next("structure"); await entered.promise;
    deliver({ method: "Debugger.resumed", sessionId: "worker", params: {} }); const continuation = await resumed; assert.equal(continuation.method, "Debugger.resumed");
    await entered.promise; deliver(paused(save)); const saving = await saved; assert.equal(saving.method, "Debugger.paused"); assert.equal(reads, 3);
    assert.throws(() => { router.reserveResume("structure", "worker", "bootstrap"); });
  });
}
