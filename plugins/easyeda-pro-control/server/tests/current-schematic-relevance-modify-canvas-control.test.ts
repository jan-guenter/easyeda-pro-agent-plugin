/** Real finite controller, inert original-event bindings. These cases grant
 * no app owner, native timer delivery, sender, canvas or Modify completion. */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLEE_SOURCE as SOURCE } from "../src/current-schematic-relevance-modify-cm-callee-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_SOURCE as STRUCTURE } from "../src/current-schematic-relevance-modify-structure-source.ts";
import { CurrentSchematicRelevanceModifyCanvasController, assertOriginalCurrentSchematicRelevanceModifyCanvasController as assertController } from "../src/current-schematic-relevance-modify-canvas-controller.ts";
import type { CurrentSchematicRelevanceModifyCanvasHeld as Held, CurrentSchematicRelevanceModifyCanvasHost as Host } from "../src/current-schematic-relevance-modify-canvas-controller.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_CONTROL_REQUESTS as REQUESTS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_ROLES as ROLES, currentSchematicRelevanceModifyCanvasFunctionPoint as functionPoint, currentSchematicRelevanceModifyCanvasPoint as point } from "../src/current-schematic-relevance-modify-canvas-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyCanvasRole as Role } from "../src/current-schematic-relevance-modify-canvas-control-protocol.ts";

const isReturn = (role: Role): boolean => role === "publishCanvasReturned" || role === "onDataChangeReturned" || role === "timerReturned";
const resumed: DiagnosticEvent = Object.freeze({ sessionId: "worker", method: "Debugger.resumed", params: {} });
function pause(role: Role, shift = 0): DiagnosticEvent {
 const at = point(role), source = functionPoint(role);
 const frames: unknown[] = [{ callFrameId: `actual-${role}`, functionLocation: { scriptId: "script", ...source }, location: { scriptId: "script", ...at, columnNumber: at.columnNumber + shift }, ...(isReturn(role) ? { returnValue: { type: "undefined" } } : {}) }];
 if (role === "onDataChange" || role === "publishCanvas" || role === "executor") {
  let caller: Readonly<{ lineNumber: number; columnNumber: number }> = STRUCTURE.onChange;
  if (role === "publishCanvas") { caller = SOURCE.roles.sheetOnDataChange; } else if (role === "executor") { caller = SOURCE.roles.sheetPublishCanvas; }
  frames.push({ callFrameId: `actual-${role}-caller`, functionLocation: { scriptId: "script", lineNumber: caller.lineNumber, columnNumber: caller.columnNumber }, location: { scriptId: "script", lineNumber: caller.lineNumber, columnNumber: caller.columnNumber + 40 } });
 }
 return Object.freeze({ sessionId: "worker", method: "Debugger.paused", params: { reason: "other", hitBreakpoints: [`point-${role}`], callFrames: frames } });
}
function harness(mode: "normal" | "rounded" | "wrongType" | "badRemove" = "normal"): Readonly<{ lane: CurrentSchematicRelevanceModifyCanvasController; requests: string[]; reserved: DiagnosticEvent[]; retired: Role[]; failed: () => boolean }> {
 let failed = false; const requests: string[] = [], reserved: DiagnosticEvent[] = [], retired: Role[] = [];
 const host: Host = {
  current: (): void => { assert.equal(failed, false); },
  request: command => {
   requests.push(command.phase);
   if (command.phase === "modify-canvas-control-possible") { return Promise.resolve({ locations: [{ ...command.params.end, columnNumber: command.params.end.columnNumber - 1, ...(isReturn(command.role) || mode === "wrongType" ? { type: "return" } : {}) }] }); }
   if (command.phase === "modify-canvas-control-point") { return Promise.resolve({ breakpointId: `point-${command.role}`, actualLocation: { ...command.params.location, columnNumber: command.params.location.columnNumber + (mode === "rounded" ? 1 : 0) } }); }
   if (command.phase === "modify-canvas-control-function") { return Promise.resolve({ breakpointId: `point-${command.role}` }); }
   assert.equal(command.phase, "modify-canvas-control-remove"); return Promise.resolve(mode === "badRemove" ? { refused: true } : {});
  },
  register: (_role, _id, at): void => { assert.equal(at.scriptId, "script"); },
  reserveOriginalResume: event => { assert.ok(!reserved.includes(event)); reserved.push(event); },
  retire: (role, _id, original): void => { assert.deepEqual(original.params["hitBreakpoints"], ["point-timerReturned"]); retired.push(role); },
  fail: (): void => { failed = true; },
 };
 return Object.freeze({ lane: new CurrentSchematicRelevanceModifyCanvasController(host, "worker", "script", ["foreign"]), requests, reserved, retired, failed: (): boolean => failed });
}
const functions = Object.freeze({ onDataChange: "original-data", publishCanvas: "original-publish" });
async function first(h: ReturnType<typeof harness>): Promise<Held> { await h.lane.arm(functions); h.lane.assertArmed(); h.lane.markParentSubmitted(); const pending = h.lane.waitInitial(); h.lane.observe(pause("onDataChange")); return pending; }
async function advance(lane: CurrentSchematicRelevanceModifyCanvasController, held: Held, role: Role, early: boolean): Promise<Held> {
 const reservation = lane.reserve(held); lane.markSubmitted(reservation); lane.observe(resumed); await lane.waitResumed(reservation);
 if (early) { lane.observe(pause(role)); lane.acknowledge(reservation, {}); return lane.complete(reservation); }
 lane.acknowledge(reservation, {}); const pending = lane.complete(reservation); lane.observe(pause(role)); return pending;
}
async function segment(lane: CurrentSchematicRelevanceModifyCanvasController, held: Held): Promise<void> { const reservation = lane.reserve(held); assert.equal(reservation.target, null); lane.markSubmitted(reservation); lane.acknowledge(reservation, {}); lane.observe(resumed); await lane.waitResumed(reservation); lane.completeReturned(reservation); }
void test("original canvas guard segments retain source scope boundaries, both ACK orders and the later timer", async () => {
 for (const early of [false, true]) {
  const h = harness(); let held = await first(h); assert.equal(h.requests.length, REQUESTS.setup); assert.equal(held.callerFrameId, "actual-onDataChange-caller");
  for (const role of ROLES.slice(1, 6)) { held = await advance(h.lane, held, role, early); }
  await segment(h.lane, held); assert.throws(() => { h.lane.requireCompleted(); }); h.lane.markTimerExpected(); const timer = h.lane.waitTimer(); h.lane.observe(pause("timer")); held = await timer;
  held = await advance(h.lane, held, "timerReturned", early); assert.throws(() => h.lane.reserve(held)); await h.lane.retire(held); await segment(h.lane, held); h.lane.requireCompleted();
  assert.equal(h.reserved.length, REQUESTS.resumes); assert.equal(h.retired.length, REQUESTS.removals); assert.equal(h.failed(), false);
  assert.deepEqual([held.canvasCompleted, held.modifyCompleted, held.saveAuthorized], [false, false, false]);
 }
});
void test("unsubmitted, early-timer, rounded, wrong-type and Proxy preparations cannot gain a canvas continuation", async () => {
 for (const mode of ["rounded", "wrongType"] as const) { const h = harness(mode); await assert.rejects(h.lane.arm(functions)); assert.equal(h.failed(), true); assert.equal(h.reserved.length, 0); }
 let hooks = 0; const proxy = new Proxy(functions, { get(): never { hooks += 1; throw new Error("not called"); }, ownKeys(): never { hooks += 1; throw new Error("not called"); } });
 const bad = harness(); await assert.rejects(bad.lane.arm(proxy)); assert.equal(hooks, 0); assert.equal(bad.requests.length, 0);
 const unsubmitted = harness(); const held = await first(unsubmitted); unsubmitted.lane.reserve(held); unsubmitted.lane.observe(resumed); assert.equal(unsubmitted.failed(), true);
 const early = harness(); let last = await first(early); for (const role of ROLES.slice(1, 6)) { last = await advance(early.lane, last, role, false); } await segment(early.lane, last); early.lane.observe(pause("timer")); assert.equal(early.failed(), true);
 const shifted = harness(); await shifted.lane.arm(functions); shifted.lane.markParentSubmitted(); shifted.lane.observe(pause("onDataChange", 1)); assert.equal(shifted.failed(), true);
});

void test("original Canvas controller lookup rejects copies, Proxies and prototype substitution before reflection effects", () => {
 const h = harness(); assertController(h.lane); const copied: unknown = Object.create(CurrentSchematicRelevanceModifyCanvasController.prototype); assert.throws(() =>{  assertController(copied); });
 let hooks = 0; const proxy = new Proxy(h.lane, { getPrototypeOf(): never { hooks += 1; throw new Error("not called"); } }); assert.throws(() =>{  assertController(proxy); }); assert.equal(hooks, 0);
 const prototype = CurrentSchematicRelevanceModifyCanvasController.prototype; const descriptor = Object.getOwnPropertyDescriptor(prototype, "reserve"); assert.ok(descriptor !== undefined);
 try { Object.defineProperty(prototype, "reserve", { ...descriptor, value: (): never => { throw new Error("substitution must remain uncalled"); } }); assert.throws(() =>{  assertController(h.lane); }); assert.equal(h.reserved.length, 0); } finally { Object.defineProperty(prototype, "reserve", descriptor); } assertController(h.lane);
});
