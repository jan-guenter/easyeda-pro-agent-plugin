/** Exact partial-effect proofs, including unchanged original snapshot guards. */
/* oxlint-disable import/max-dependencies -- Compare both immutable snapshot contracts and the separately bounded primitive codebook in one partial-effect regression. */
import assert from "node:assert/strict";
import { runInThisContext } from "node:vm";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_BEFORE as BEFORE, CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_RAW_DELTA as RAW_DELTA, CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_RECORD as RECORD, CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_UI_DELTA as UI_DELTA } from "../src/current-schematic-relevance-primitive-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_AFTER_RUN_PROOF as OLD_RAW } from "../src/current-schematic-relevance-action-callback-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_SNAPSHOT_SAME as OLD_UI, CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_SNAPSHOT as SNAPSHOT } from "../src/current-schematic-relevance-publication-snapshot-programs.ts";
import { currentSchematicRelevancePrimitiveCases } from "../src/current-schematic-relevance-primitive-wire.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest as ownWire } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest as oldWire } from "../src/current-schematic-display-write-protocol.ts";
import { currentSchematicWireEditNativeRequest as wireWire } from "../src/current-schematic-wire-edit-protocol.ts";
import { validateCurrentSchematicRelevancePrimitiveCommand as validate } from "../src/current-schematic-relevance-primitive-protocol.ts";

const run = (source: string, receiver: unknown, args: readonly unknown[]): unknown => { const fn: unknown = runInThisContext(`(${source})`); assert.ok(typeof fn === "function"); return Reflect.apply(fn, receiver, args); };
function fixture(): Readonly<{ before: () => unknown; mutate: () => void; old: () => void; check: () => void; fault: (kind: "peer" | "flags" | "model" | "raw" | "call" | "extra") => void; invocations: () => number }> {
  // oxlint-disable-next-line typescript/unbound-method -- Exact inert native identities are passed only to descriptor/collection inspection with explicit receivers.
  const native = [Object.getOwnPropertyDescriptor, Object.getOwnPropertyDescriptors, Object.getPrototypeOf, Object.is, Object.hasOwn, Reflect.ownKeys, Reflect.apply, Array.isArray, Map.prototype.get, Map.prototype.has, Map.prototype.forEach, Object.getOwnPropertyDescriptor(Map.prototype, "size")?.get, Set.prototype.has, Set.prototype.forEach, Object.getOwnPropertyDescriptor(Set.prototype, "size")?.get, Object.prototype, Array.prototype, Map.prototype, Set.prototype];
  let invocations = 0; const getter = (): boolean => { invocations += 1; return false; }; const setter = (_value: boolean): void => { invocations += 1; }; const record = (): void => { invocations += 1; }; const monitorFunction = (): void => { invocations += 1; };
  const monitor = { record, setAttribute: monitorFunction }; const shapes = { modifyMonitor: monitor, shouldUpdateAst: true }; const text = { _underline: false, shapeManager: shapes, sentinel: "original" }; const runner: { _currentAction: object | null } = { _currentAction: null }; const active = { status: "running", history: "add" }; const bus = new Set();
  const raw = { get: getter, set: setter, configurable: true, writable: undefined, enumerable: false }; const refs: unknown[] = Array.from({ length: 24 }, () => ({})); const entry: unknown[] = Array.from({ length: 13 }, () => ({})); refs[10] = shapes; refs[22] = runner; entry[5] = [["underline", true]]; entry[7] = { beforeBody: { underline: false }, afterBody: { underline: true } }; entry[8] = text; entry[11] = monitor;
  const beforeRows = [text, shapes, runner, monitor].map(object => [object, Object.getPrototypeOf(object) as unknown, Reflect.ownKeys(object).map(key => { const d = Object.getOwnPropertyDescriptor(object, key); assert.ok(d !== undefined); const value: unknown = d.value; return [key, Object.hasOwn(d, "value"), value, Reflect.get(d, "get"), Reflect.get(d, "set"), d.writable, d.enumerable, d.configurable]; }), null]); const original = [beforeRows]; Reflect.set(runner, "_currentAction", active); shapes.shouldUpdateAst = false; Object.defineProperty(shapes, "changedBusGroupIds", { value: bus, writable: true, configurable: true, enumerable: true });
  const known = [text, shapes, runner, monitor, raw, Object.prototype, Function.prototype]; const ui = run(SNAPSHOT, known, [native]); const intrinsic: unknown[] = Array.from({ length: 38 }, () => ({})); intrinsic[28] = Reflect.get(Function.prototype, "call"); const frame: unknown[] = [monitor, text, raw, "underline", true]; let primitive: unknown;
  const args = [native, refs, entry, raw, getter, setter, record, monitorFunction, intrinsic, known]; const event = { model: text, attr: "underline", newValue: true, oldValue: false };
  return { before: () => { primitive = run(BEFORE, frame, args); return primitive; }, mutate: (): void => { Reflect.set(text, "_underline", true); }, old: (): void => { assert.equal(run(OLD_RAW, original, [native, refs, active, bus]), true); assert.equal(run(OLD_UI, ui, [native, known]), true); },
    check: (): void => { assert.equal(run(RAW_DELTA, original, [native, refs, active, bus, entry, primitive]), true); assert.equal(run(UI_DELTA, ui, [native, known, entry, primitive]), true); assert.equal(run(RECORD, [monitor, event], [native, refs, entry, primitive, record]), true); }, invocations: () => invocations,
    fault: kind => { if (kind === "peer") { text.sentinel = "changed"; } else if (kind === "flags") { Object.defineProperty(text, "_underline", { enumerable: false }); } else if (kind === "model") { event.model = { ...text }; } else if (kind === "raw") { frame[2] = { ...raw }; } else if (kind === "call") { Object.defineProperty(getter, "call", { get(): unknown { invocations += 1; return Reflect.get(Function.prototype, "call"); } }); } else { Object.defineProperty(event, Symbol("unknown"), { value: true }); } }
  };
}
void test("the new proof admits exactly one planned partial field change while both original immutable proofs still reject it", () => {
  const f = fixture(); f.old(); const before = f.before(); assert.ok(Array.isArray(before)); assert.deepEqual(before.slice(1), [false, true]); f.mutate(); assert.throws(f.old); f.check(); assert.equal(f.invocations(), 0);
  for (const fault of ["peer", "flags", "model", "extra"] as const) { const changed = fixture(); changed.before(); changed.mutate(); changed.fault(fault); assert.throws(changed.check); assert.equal(changed.invocations(), 0); }
  for (const fault of ["raw", "call"] as const) { const changed = fixture(); changed.fault(fault); assert.throws(changed.before); assert.equal(changed.invocations(), 0); }
});
void test("the one resume syntax remains distinct from every existing purpose and no other action or expression can be encoded", () => {
  const cases = currentSchematicRelevancePrimitiveCases(); assert.equal(cases.filter(command => command.method === "Debugger.resume").length, 1);
  for (const command of cases) { const bytes = Buffer.from(`${JSON.stringify({ id: 1, ...command, schematicRelevancePrimitiveCommand: true, sessionId: "original-session" })}\0`); const encoded = ownWire(bytes); assert.equal(encoded["action"], "schematic-relevance-primitive"); assert.throws(() => oldWire(bytes)); assert.throws(() => wireWire(bytes)); }
  assert.throws(() => validate({ phase: "record-resume", method: "Debugger.resume", params: {} })); assert.throws(() => validate({ phase: "frame", role: "record", method: "Debugger.evaluateOnCallFrame", params: { expression: "this.record()" } }));
});
