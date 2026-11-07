/** Real router and event identities; no native transport or startup grant. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentSchematicDisplayEventRouter } from "../src/current-schematic-display-event-router.ts";
import type { CurrentSchematicDisplayEventRouterBindings, DiagnosticEvent } from "../src/current-schematic-display-event-router.ts";
import { CurrentSchematicRelevanceDisplayEventRouter } from "../src/current-schematic-relevance-display-event-router.ts";

function bindings(events: DiagnosticEvent[]): CurrentSchematicDisplayEventRouterBindings {
  return Object.freeze({ workerSessionId: "worker", uiSessionId: "ui", assertCurrent: (): Promise<void> => Promise.resolve(), fail: (): void => { throw new Error("explicit-router-failure"); },
    nextEvent: (): Promise<DiagnosticEvent> => { const event = events.shift(); assert.ok(event !== undefined); return Promise.resolve(event); } });
}
void test("the original six-record/Wire router cannot register either seven-record startup lane", () => {
  for (const lane of ["quiesce", "library"] as const) {
    const original = new CurrentSchematicDisplayEventRouter(bindings([]));
    assert.throws(() => { original.register(lane, { sessionId: "worker", scriptId: "script", breakpointId: "original", role: "entry", lineNumber: 1, columnNumber: 1 }); }, /EVENT_ROUTE/u);
  }
});
void test("seven-record startup routes retain actual pause and acknowledge only the original role's single resume", async () => {
  for (const [lane, role] of [["quiesce", "entry"], ["library", "firstLoop"]] as const) {
    const events: DiagnosticEvent[] = [{ method: "Debugger.paused", sessionId: "worker", params: { hitBreakpoints: ["original"], callFrames: [{ location: { scriptId: "script", lineNumber: 1, columnNumber: 1 } }] } },
      { method: "Debugger.resumed", sessionId: "worker", params: {} }];
    const router = new CurrentSchematicRelevanceDisplayEventRouter(bindings(events));
    router.register(lane, { sessionId: "worker", scriptId: "script", breakpointId: "original", role, lineNumber: 1, columnNumber: 1 });
    const pause = await router.next(lane); assert.equal(pause.method, "Debugger.paused");
    assert.throws(() => { router.reserveResume(lane, "worker", "foreign-role"); }, /EVENT_ROUTE/u);
    router.reserveResume(lane, "worker", role); assert.throws(() => { router.reserveResume(lane, "worker", role); }, /EVENT_ROUTE/u);
    const resumed = await router.next(lane); assert.equal(resumed.method, "Debugger.resumed"); assert.equal(events.length, 0);
  }
});

void test("own7 Save producer continuation consumes only its delivered original event once", async () => {
  for (const role of ["localIngress", "historyCloud"] as const) {
    const events: DiagnosticEvent[] = [{ method: "Debugger.paused", sessionId: "worker", params: { hitBreakpoints: ["original"], callFrames: [{ location: { scriptId: "script", lineNumber: 1, columnNumber: 1 } }] } }, { method: "Debugger.resumed", sessionId: "worker", params: {} }];
    const router = new CurrentSchematicRelevanceDisplayEventRouter(bindings(events)); router.register("producer", { sessionId: "worker", scriptId: "script", breakpointId: "original", role, lineNumber: 1, columnNumber: 1 });
    const held = await router.next("producer");
    if (role === "localIngress") { assert.throws(() => { router.reserveSaveLocalResume({ ...held }, role); }); assert.throws(() => { router.reserveSaveLocalResume(held, "headEntry"); }); router.reserveSaveLocalResume(held, role); assert.throws(() => { router.reserveSaveLocalResume(held, role); }); }
    else { assert.throws(() => { router.reserveSaveUploadResume({ ...held }, role); }); assert.throws(() => { router.reserveSaveUploadResume(held, "cloudIngress"); }); router.reserveSaveUploadResume(held, role); assert.throws(() => { router.reserveSaveUploadResume(held, role); }); }
    const resumed=await router.next("producer");assert.equal(resumed.method, "Debugger.resumed"); assert.equal(events.length, 0);
  }
});
