/** Fixed projections and original event/ACK ordering on inert fixtures only. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_AFTER_RUN_PROOF as AFTER, CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_BIND as BIND, CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_DETAILS as DETAILS, CURRENT_SCHEMATIC_RELEVANCE_ACTION_RECEIVER_PROOF as RECEIVER, CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_SAME as SAME, CURRENT_SCHEMATIC_RELEVANCE_FIRST_SETTER_PROOF as SETTER_PROOF } from "../src/current-schematic-relevance-action-callback-programs.ts";
import { CurrentSchematicRelevanceActionCallbackController } from "../src/current-schematic-relevance-action-callback-controller.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_MARKERS as MARKERS } from "../src/current-schematic-relevance-display-action-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_CALLBACK_LOCATION as LOCATION } from "../src/current-schematic-relevance-display-modify-entry-replies.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE as SOURCES } from "../src/generated-schematic-display-accessor-source.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand } from "../src/current-schematic-relevance-display-modify-entry-protocol.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";

const evaluate = (source: string, receiver: unknown, args: readonly unknown[]): unknown => { const fn: unknown = runInThisContext(`(${source})`); assert.ok(typeof fn === "function"); return Reflect.apply(fn, receiver, args); };
const snapshotEntry = (value: object): readonly unknown[] => { const parent: unknown = Object.getPrototypeOf(value); const list: unknown[] = []; for (const key of Reflect.ownKeys(value)) { const d = Object.getOwnPropertyDescriptor(value, key); assert.ok(d !== undefined); const original: unknown = d.value; list.push([key, Object.hasOwn(d, "value"), original, Reflect.get(d, "get"), Reflect.get(d, "set"), d.writable, d.enumerable, d.configurable]); } return [value, parent, list, null]; };
function fixture(busBaseline: "absent" | "null" | "unexpected" = "absent"): Readonly<{ entry: () => unknown; same: (bound: unknown) => unknown; run: () => unknown; receiver: (value: unknown) => unknown; monitor: object; active: object; firstSetter: (fault?: "index" | "binding" | "getter") => unknown; setterCalls: () => number; change: (fault: "peer" | "map" | "runner" | "body" | "bus") => void }> {
  // oxlint-disable-next-line typescript/unbound-method -- Retain exact inert native references for the fixed projection; no object method is called through an unqualified receiver.
  const native = [Object.getOwnPropertyDescriptor, Object.getOwnPropertyDescriptors, Object.getPrototypeOf, Object.is, Object.hasOwn, Reflect.ownKeys, Reflect.apply, Array.isArray, Map.prototype.get, Map.prototype.has, Map.prototype.forEach, Object.getOwnPropertyDescriptor(Map.prototype, "size")?.get, Set.prototype.has, Set.prototype.forEach, Object.getOwnPropertyDescriptor(Set.prototype, "size")?.get, Object.prototype, Array.prototype, Map.prototype, Set.prototype];
  let setterCalls = 0; const getter = (): boolean => { setterCalls += 1; return false; }; const setter = (_value: boolean): void => { setterCalls += 1; }; const textProto = {}; Object.defineProperty(textProto, "underline", { get: getter, set: setter, configurable: true });
  const active = { status: "running", history: "add" }, monitor = {}; const text = { _underline: false }; Object.setPrototypeOf(text, textProto); Object.defineProperty(text, "_underline", { value: false, writable: true, enumerable: true, configurable: true }); const shapes = { shouldUpdateAst: true, modifyMonitor: monitor }; const runner: { _currentAction: object | null } = { _currentAction: null }; const index = new Map([["text", text]]);
  if (busBaseline !== "absent") { Object.defineProperty(shapes, "changedBusGroupIds", { value: busBaseline === "null" ? null : new Set(), writable: true, enumerable: true, configurable: true }); } Object.defineProperty(shapes, Symbol("original-shape-field"), { value: {}, writable: true, enumerable: true, configurable: true });
  const refs: unknown[] = Array.from({ length: 24 }, () => ({})); refs[10] = shapes; refs[12] = index; refs[22] = runner;
  const before = { text }; const binding = { object: text, owner: textProto, key: "underline", get: getter, set: setter }; const mapping = { underline: binding }; const b = { shapes, runner, setters: mapping }; const state: Record<string, unknown> = { before, failed: false, modifyAttempted: true, modifyAcknowledged: false, saveAttempted: false }; const holder = [b, state]; state["owner"] = holder;
  const operation = { textId: "text", beforeBody: { underline: false, value: "unchanged" }, afterBody: { underline: true, value: "unchanged" } }; const context = [holder, b, state, before, [["underline", true]], {}, operation]; const frame = [context, Reflect.apply];
  const entries = [runner, shapes, text].map(value => snapshotEntry(value)); const parent: unknown = Object.getPrototypeOf(index); entries.push([index, parent, [], ["map", [...index]]]); const snapshot = [entries, (): boolean => true];
  Reflect.set(runner, "_currentAction", active); shapes.shouldUpdateAst = false; const busSet = new Set(); Reflect.set(shapes, "changedBusGroupIds", busSet);
  const details = evaluate(DETAILS, context, [native]);
  return { entry: () => evaluate(BIND, frame, [native, refs, holder, details]), same: bound => evaluate(SAME, frame, [native, refs, holder, details, bound]), run: () => evaluate(AFTER, snapshot, [native, refs, active, busSet]), receiver: value => evaluate(RECEIVER, [value], [native, refs]), monitor, active, setterCalls: () => setterCalls,
    firstSetter: fault => { const first = [context, active, fault === "index" ? 1 : 0, Reflect.apply]; const bound = evaluate(BIND, frame, [native, refs, holder, details]); if (fault === "binding") { binding.owner = {}; } if (fault === "getter") { Object.defineProperty(binding, "set", { get: (): typeof setter => { setterCalls += 1; return setter; } }); } return evaluate(SETTER_PROOF, first, [native, refs, bound, [mapping], [binding], getter, setter]); },
    change: fault => { if (fault === "bus") { busSet.add("unexpected"); } else if (fault === "peer") { Reflect.set(text, "_underline", true); } else if (fault === "map") { index.set("foreign", text); } else if (fault === "runner") { Reflect.set(runner, "_currentAction", {}); } else { operation.afterBody.value = "foreign"; } } };
}
void test("original callback context and every baseline descriptor/collection join by JS reference before any setter", () => {
  const f = fixture(); const bound = f.entry(); assert.ok(Array.isArray(bound)); assert.equal(bound[10], f.active); assert.equal(bound[11], f.monitor); assert.equal(f.same(bound), true); assert.equal(f.run(), true); assert.equal(f.receiver(f.monitor), true); assert.throws(() => f.receiver({}), /CALLBACK_RECEIVER/u);
  for (const fault of ["peer", "map", "runner", "bus"] as const) { const changed = fixture(); changed.change(fault); assert.throws(changed.run, /RUN_DELTA/u); }
  const changed = fixture(); const before = changed.entry(); changed.change("runner"); assert.throws(() => changed.same(before), /CALLBACK_ENTRY/u);
  const broad = fixture(); broad.change("body"); assert.throws(broad.entry, /CALLBACK_ENTRY/u);
});
void test("the actual second-start empty Set is a distinct bounded delta for absent or completed-null baseline", () => {
  for (const before of ["absent", "null"] as const) { const f = fixture(before); assert.equal(f.run(), true); assert.equal(f.setterCalls(), 0); }
  const unexpected = fixture("unexpected"); assert.throws(unexpected.run, /RUN_DELTA/u);
});
void test("the held first setter matches actual underline accessor references without invoking either accessor", () => {
  const f = fixture(); assert.equal(f.firstSetter(), true); assert.equal(f.setterCalls(), 0);
  for (const fault of ["index", "binding", "getter"] as const) { const changed = fixture(); assert.throws(() => changed.firstSetter(fault), /FIRST_SETTER_PROOF/u); assert.equal(changed.setterCalls(), 0); }
});
function event(role: "entry" | "setter" | "record" | "setAttribute", script = "original-callback"): DiagnosticEvent {
  let location = { ...LOCATION, scriptId: script }; let functionLocation = location; const ids: string[] = [];
  if (role === "record" || role === "setAttribute") { const row = SOURCES[0].methods[role === "record" ? "monitorRecord" : "monitorSetAttribute"]; functionLocation = { scriptId: "original-source", lineNumber: row.lineNumber, columnNumber: row.columnNumber }; location = functionLocation; ids.push(`point:schematic-callback-arm-${role}`); }
  else { const marker = MARKERS.find(item => item.role === role); assert.ok(marker !== undefined); location = { scriptId: script, lineNumber: marker.lineNumber, columnNumber: marker.columnNumber }; }
  return { method: "Debugger.paused", sessionId: "original-session", params: { reason: "other", hitBreakpoints: ids, callFrames: [{ callFrameId: "original-frame", location, functionLocation }] } };
}
function controller(): Readonly<{ lane: CurrentSchematicRelevanceActionCallbackController; sent: CurrentSchematicRelevanceDisplayModifyEntryCommand[]; failures: () => number }> {
  const sent: CurrentSchematicRelevanceDisplayModifyEntryCommand[] = []; let failures = 0;
  const lane = new CurrentSchematicRelevanceActionCallbackController(Object.freeze({ sessionId: "original-session", callbackScriptId: "original-callback", sourceScriptId: "original-source", variant: 0, functions: Object.freeze({ setAttributeObjectId: "actual-set", recordObjectId: "actual-record", astObjectId: "actual-ast", normalRequests: 113 }),
    assertCurrent: (): void => { assert.equal(failures, 0); }, fail: (): void => { failures += 1; }, request: (command: CurrentSchematicRelevanceDisplayModifyEntryCommand): Promise<unknown> => { sent.push(command); return Promise.resolve({ breakpointId: `point:${command.phase}` }); } }));
  return { lane, sent, failures: () => failures };
}
void test("three original arms and the exact callback pause settle one entry without taking the run owner's resumed event", async () => {
  const f = controller(); await f.lane.arm(); assert.deepEqual(f.sent.map(item => item.phase), ["schematic-callback-arm-setAttribute", "schematic-callback-arm-record", "schematic-callback-arm-ast"]); f.lane.assertArmed();
  assert.equal(f.lane.observeOriginalEvent({ method: "Debugger.resumed", sessionId: "original-session", params: {} }), false); const original = event("entry"); assert.equal(f.lane.observeOriginalEvent(original), true); const held = await f.lane.waitOriginalEntry(); assert.equal(held.event, original); f.lane.requireHeld(held); assert.equal(f.failures(), 0);
  assert.throws(() => { f.lane.requireHeld({ ...held }); }); assert.equal(f.lane.observeOriginalEvent(event("record")), true); assert.equal(f.failures(), 1);
});
void test("foreign session cannot supply an entry and an unexpected original receiver pause remains held/refused", async () => {
  const f = controller(); await f.lane.arm(); const original = event("entry"); assert.equal(f.lane.observeOriginalEvent({ ...original, sessionId: "foreign-session" }), false); assert.equal(f.failures(), 0);
  assert.equal(f.lane.observeOriginalEvent(event("record")), true); assert.equal(f.failures(), 1); await assert.rejects(f.lane.waitOriginalEntry(), /CALLBACK_EVENT/u); assert.equal(f.sent.length, 3);
});

void test("entry resume reservation admits the next setter pause before ACK settlement without admitting a primitive continuation", async () => {
  const f = controller(); await f.lane.arm(); f.lane.observeOriginalEvent(event("entry")); const entry = await f.lane.waitOriginalEntry(); const reservation = f.lane.reserveEntryResume(entry);
  assert.throws(() => { f.lane.reserveEntryResume(entry); }); assert.throws(() => { f.lane.completeEntryResume(reservation); }); f.lane.markEntryResumeSubmitted(reservation);
  assert.equal(f.lane.observeOriginalEvent({ method: "Debugger.resumed", sessionId: "original-session", params: {} }), true);
  const next = event("setter"); assert.equal(f.lane.observeOriginalEvent(next), true); await f.lane.waitEntryResumed(reservation); f.lane.completeEntryResume(reservation); const setter = await f.lane.waitOriginalFirstSetter(); assert.equal(setter.event, next); f.lane.requireHeld(setter); assert.equal(f.failures(), 0);
  assert.throws(() => { f.lane.completeEntryResume(reservation); }); assert.equal(f.lane.observeOriginalEvent(event("record")), true); assert.equal(f.failures(), 1);
});
void test("unacknowledged resumed state is never synthesized and failure wakes the same reservation", async () => {
  const f = controller(); await f.lane.arm(); f.lane.observeOriginalEvent(event("entry")); const held = await f.lane.waitOriginalEntry(); const reservation = f.lane.reserveEntryResume(held); const resumed = f.lane.waitEntryResumed(reservation); f.lane.fail(); await assert.rejects(resumed, /CALLBACK_EVENT/u); await assert.rejects(f.lane.waitOriginalFirstSetter(), /CALLBACK_EVENT/u); assert.equal(f.failures(), 1);
});

void test("a reserved but not submitted entry resume cannot consume a resumed event", async () => {
  const f = controller(); await f.lane.arm(); f.lane.observeOriginalEvent(event("entry")); const held = await f.lane.waitOriginalEntry(); const reservation = f.lane.reserveEntryResume(held);
  assert.equal(f.lane.observeOriginalEvent({ method: "Debugger.resumed", sessionId: "original-session", params: {} }), true); assert.equal(f.failures(), 1); await assert.rejects(f.lane.waitEntryResumed(reservation));
});

void test("setter forwarding burns one attempt and holds the original monitor even when its pause precedes the resume ACK", async () => {
  const f = controller(); await f.lane.arm(); f.lane.observeOriginalEvent(event("entry")); const entry = await f.lane.waitOriginalEntry(); const first = f.lane.reserveEntryResume(entry); f.lane.markEntryResumeSubmitted(first); f.lane.observeOriginalEvent({ method: "Debugger.resumed", sessionId: "original-session", params: {} }); f.lane.observeOriginalEvent(event("setter")); await f.lane.waitEntryResumed(first); f.lane.completeEntryResume(first);
  const setter = await f.lane.waitOriginalFirstSetter(); const original = f.lane.reserveSetterResume(setter); assert.throws(() => { f.lane.reserveSetterResume(setter); }); assert.throws(() => { f.lane.completeSetterResume(original); }); f.lane.markSetterResumeSubmitted(original);
  f.lane.observeOriginalEvent({ method: "Debugger.resumed", sessionId: "original-session", params: {} }); const paused = event("setAttribute"); f.lane.observeOriginalEvent(paused); await f.lane.waitSetterResumed(original); f.lane.completeSetterResume(original); const monitor = await f.lane.waitOriginalSetAttribute(); assert.equal(monitor.event, paused); f.lane.requireHeld(monitor); assert.equal(f.failures(), 0);
  assert.throws(() => { f.lane.reserveSetterResume(monitor); }); assert.equal(f.lane.observeOriginalEvent(event("record")), true); assert.equal(f.failures(), 1);
});
