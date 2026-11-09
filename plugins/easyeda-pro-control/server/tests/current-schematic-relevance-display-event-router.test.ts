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
void test("the original six-record/Wire router cannot register a seven-record startup or Modify lane", () => {
  for (const lane of ["quiesce", "library", "modify"] as const) {
    const original = new CurrentSchematicDisplayEventRouter(bindings([]));
    assert.throws(() => { original.register(lane, { sessionId: "worker", scriptId: "script", breakpointId: "original", role: "entry", lineNumber: 1, columnNumber: 1 }); }, /EVENT_ROUTE/u);
  }
});

void test("Modify continuation spends the delivered worker event and refuses generic or copied reservations", async () => {
  const events: DiagnosticEvent[] = [{ method: "Debugger.paused", sessionId: "worker", params: { hitBreakpoints: ["original"], callFrames: [{ location: { scriptId: "script", lineNumber: 1, columnNumber: 1 } }] } }, { method: "Debugger.resumed", sessionId: "worker", params: {} }];
  const router = new CurrentSchematicRelevanceDisplayEventRouter(bindings(events));
  router.register("modify", { sessionId: "worker", scriptId: "script", breakpointId: "original", role: "handler", lineNumber: 1, columnNumber: 1 });
  const held = await router.next("modify");
  assert.throws(() => { router.reserveResume("modify", "worker", "handler"); });
  assert.throws(() => { router.reserveModifyResume({ ...held }, "handler"); });
  assert.throws(() => { router.reserveModifyResume(held, "batch"); });
  router.reserveModifyResume(held, "handler");
  assert.throws(() => { router.reserveModifyResume(held, "handler"); });
  const resumed = await router.next("modify");
  assert.equal(resumed.method, "Debugger.resumed");
  assert.equal(events.length, 0);
});

/** Build an inert original worker event; only the router supplies delivery identity. */
function structurePause(id: string, column: number): DiagnosticEvent { return { method: "Debugger.paused", sessionId: "worker", params: { hitBreakpoints: [id], callFrames: [{ location: { scriptId: "script", lineNumber: 1, columnNumber: column } }] } }; }
function workerResumed(): DiagnosticEvent { return { method: "Debugger.resumed", sessionId: "worker", params: {} }; }

void test("the TEXT wave owns fresh allocation epochs and generic structure resumes reopen only after its original finalizer", async () => {
  const events = [structurePause("entry", 1), workerResumed(), structurePause("returned", 2), workerResumed(), structurePause("finalizer", 3), workerResumed(), structurePause("save", 4), workerResumed()];
  const router = new CurrentSchematicRelevanceDisplayEventRouter(bindings(events));
  for (const [id, role, column] of [["entry", "startupEntry", 1], ["returned", "startupReturn", 2], ["finalizer", "initialFinally", 3], ["save", "entry", 4]] as const) {
    router.register("structure", { sessionId: "worker", scriptId: "script", breakpointId: id, role, lineNumber: 1, columnNumber: column });
  }
  // These data-only calls stand for prior empty remove ACKs. This router
  // Fixture has no native sender, owner, serial callback or completion grant.
  router.retireModifyStructurePoint("entry", "startupEntry"); router.retireModifyStructurePoint("returned", "startupReturn");
  for (const [id, role, column] of [["entry", "modifyEntry", 1], ["returned", "modifyReturned", 2]] as const) {
    router.register("structure", { sessionId: "worker", scriptId: "script", breakpointId: id, role, lineNumber: 1, columnNumber: column });
  }
  for (const role of ["modifyEntry", "modifyReturned", "initialFinally"] as const) {
    const held = await router.next("structure");
    assert.throws(() => { router.reserveResume("structure", "worker", role); });
    assert.throws(() => { router.reserveModifyStructureResume({ ...held }, role); });
    if (role === "modifyEntry") { assert.throws(() => { router.retireModifyStructurePoint("entry", role); }); }
    if (role === "initialFinally") { router.retireModifyStructurePoint("entry", "modifyEntry"); router.retireModifyStructurePoint("returned", "modifyReturned"); }
    router.reserveModifyStructureResume(held, role);
    const actual = await router.next("structure"); assert.equal(actual.method, "Debugger.resumed");
  }
  await router.next("structure"); router.reserveResume("structure", "worker", "entry");
  const actual = await router.next("structure"); assert.equal(actual.method, "Debugger.resumed"); assert.equal(events.length, 0);
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

void test("nested CM epochs retain original event identity through removal and cannot be rearmed while held", async () => {
  const events = [structurePause("remote", 1), workerResumed(), structurePause("returned", 2), workerResumed()];
  const router = new CurrentSchematicRelevanceDisplayEventRouter(bindings(events));
  router.register("modify", { sessionId: "worker", scriptId: "script", breakpointId: "remote", role: "remote", lineNumber: 1, columnNumber: 1 });
  router.register("modify", { sessionId: "worker", scriptId: "script", breakpointId: "returned", role: "remoteReturned", lineNumber: 1, columnNumber: 2 });
  const entry = await router.next("modify");
  assert.throws(() => { router.reserveResume("modify", "worker", "remote"); });
  assert.throws(() => { router.reserveModifyResume(entry, "handler"); });
  assert.throws(() => { router.reserveModifyCmResume({ ...entry }, "remote"); });
  assert.throws(() => { router.retireModifyCmPoint("remote", "remote", entry); });
  router.reserveModifyCmResume(entry, "remote"); const entryResumed = await router.next("modify"); assert.equal(entryResumed.method, "Debugger.resumed");
  const returned = await router.next("modify");
  assert.throws(() => { router.retireModifyCmPoint("remote", "remote", { ...returned }); });
  assert.throws(() => { router.retireModifyCmPoint("remote", "onChange", returned); });
  router.retireModifyCmPoint("remote", "remote", returned); router.retireModifyCmPoint("returned", "remoteReturned", returned);
  assert.throws(() => { router.register("modify", { sessionId: "worker", scriptId: "script", breakpointId: "fresh", role: "remoteReturned", lineNumber: 1, columnNumber: 2 }); });
  router.reserveModifyCmResume(returned, "remoteReturned"); assert.throws(() => { router.reserveModifyCmResume(returned, "remoteReturned"); }); const returnResumed = await router.next("modify"); assert.equal(returnResumed.method, "Debugger.resumed");
  router.register("modify", { sessionId: "worker", scriptId: "script", breakpointId: "returned", role: "remoteReturned", lineNumber: 1, columnNumber: 2 });
  assert.throws(() => { router.reserveModifyCmResume(returned, "remoteReturned"); }); assert.equal(events.length, 0);
});
