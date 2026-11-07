/** Explicit inert graph only. The projections cannot issue an owner, source
 * graph proof, action token or native resume. No method/getter is invoked. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_PREFIX_FUNCTION_PROGRAM as PROGRAM, CURRENT_SCHEMATIC_RELEVANCE_PREFIX_QUALIFIED_PROGRAM as QUALIFIED, CURRENT_SCHEMATIC_RELEVANCE_PREFIX_RUN_PROOF as RUN, CURRENT_SCHEMATIC_RELEVANCE_PREFIX_FUNCTION_SAME_PROGRAM as SAME } from "../src/current-schematic-relevance-action-prefix-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_PREFIX_ROLES as ROLES } from "../src/current-schematic-relevance-action-prefix-source.ts";

function object(parent: object, fields: Readonly<Record<PropertyKey, unknown>> = {}): object {
  const value: unknown = Object.create(parent); assert.ok(value !== null && typeof value === "object"); Object.defineProperties(value, Object.getOwnPropertyDescriptors(fields)); return value;
}
function fixture(): Readonly<{ project: () => unknown; reproof: (original: unknown) => unknown; run: () => unknown; called: () => number; replaceShapeMethod: () => void; removeShapeOwner: () => void }> {
  let calls = 0; const fn = (): never => { calls += 1; throw new Error("inert application call must never run"); };
  const c = fn;
  const runnerBase = { constructor: c };
  const runnerProto = object(runnerBase, { constructor: c, _startAutoCancelActionTimer: fn, isRunningLocalAction: fn });
  const runner = object(runnerProto);
  const shapeBase = { onWillTransact: fn };
  const shapeProto = object(shapeBase, { onWillTransact: fn });
  const shapes = object(shapeProto);
  const channelBase = { constructor: c, pause: fn };
  const channelProto = object(channelBase, { constructor: c, pause: fn });
  const channel = object(channelProto);
  const pauseProto = { constructor: c, tryPause: fn };
  const pause = object(pauseProto, { consistencyChannel: channel });
  const eventBase: object = { constructor: c, _deliver: fn }; Object.defineProperty(eventBase, "event", { get: fn });
  const eventProto = object(eventBase, { constructor: c, dispatch: fn });
  const will = object(eventProto);
  const doc = object(eventProto, { _event: fn });
  const containerProto = { constructor: c, [Symbol.iterator]: fn };
  const container = object(containerProto);
  const storeProto = { constructor: c, register: fn };
  const store = object(storeProto);
  const historyProto: object = {}; Object.defineProperty(historyProto, "onBatchSaveStart", { get: fn });
  const history = object(historyProto, { shapeManager: shapes, _createGroupHistoryCommand: fn });
  const pageProto: object = {}; Object.defineProperty(pageProto, "onAttrChange", { get: fn });
  const page = object(pageProto);
  const queueProto = { constructor: c };
  const queue = object(queueProto);
  const subscriptions = Array.from({ length: 4 }, () => ({ cb: fn }));
  const refs: unknown[] = Array.from({ length: 24 }, () => null); refs[9] = page; refs[10] = shapes; refs[22] = runner;
  const module = [fn, fn, Symbol("disposable-store"), Symbol("ref-disposable")];
  // oxlint-disable-next-line typescript/unbound-method -- The exact native toString is retained as an opaque function; no method is invoked.
  const run = [runner, fn, {}, fn, fn, fn, fn, fn, fn, fn, Object.prototype.toString, module[2], module[3], "parent"];
  const roots = [will, history, doc, container, {}, {}, {}, pause, {}];
  const events = [{}, {}, store, [], {}, [], {}, null, null];
  const details = [[], [], {}, {}, queue, queue, new Set()];
  let qualified: object[] = [runnerBase, runnerProto, runner, shapeBase, shapeProto, shapes, pauseProto, pause, channelBase, channelProto, channel, eventBase, eventProto, will, doc, containerProto, container, storeProto, store, historyProto, history, pageProto, page, queueProto, queue, ...subscriptions, Object.prototype];
  // oxlint-disable-next-line typescript/unbound-method -- Fixed inert native references are passed to the actual read-only programs and called only through their retained Reflect.apply.
  const native = [Object.getOwnPropertyDescriptor, Object.getOwnPropertyDescriptors, Object.getPrototypeOf, Object.is, Object.hasOwn, Reflect.ownKeys, Reflect.apply, Array.isArray, Map.prototype.get, Map.prototype.has, Map.prototype.forEach, Object.getOwnPropertyDescriptor(Map.prototype, "size")?.get, Set.prototype.has, Set.prototype.forEach, Object.getOwnPropertyDescriptor(Set.prototype, "size")?.get, Object.prototype, Array.prototype, Map.prototype, Set.prototype];
  const program: unknown = runInThisContext(`(${PROGRAM})`), proof: unknown = runInThisContext(`(${RUN})`), same: unknown = runInThisContext(`(${SAME})`); assert.ok(typeof program === "function" && typeof proof === "function" && typeof same === "function");
  return { project: () => { const value: unknown = Reflect.apply(program, undefined, [native, run, refs, roots, events, details, subscriptions, module, qualified, channel, c, Symbol.iterator]); return value; },
    reproof: (original: unknown) => { const value: unknown = Reflect.apply(same, original, [native, run, refs, roots, events, details, subscriptions, module, qualified, channel, c, Symbol.iterator]); return value; },
    run: () => { const value: unknown = Reflect.apply(proof, run, [native, run.slice(0, 3), refs]); return value; }, called: () => calls,
    replaceShapeMethod: () => { Object.defineProperty(shapeProto, "onWillTransact", { get: fn }); }, removeShapeOwner: () => { qualified = qualified.filter(value => value !== shapeProto); } };
}
void test("base34 projection selects only qualified descriptor functions and fixed original run references", () => {
  const f = fixture(); assert.equal(f.run(), true); const projected = f.project(); assert.ok(Array.isArray(projected)); assert.equal(projected.length, ROLES.length); assert.equal(f.called(), 0);
  assert.equal(f.reproof(projected), true);
  for (const value of projected) { assert.equal(typeof value, "function"); }
});
void test("an unknown prototype or accessor replacing a method refuses without invoking it", () => {
  const unknown = fixture(); unknown.removeShapeOwner(); assert.throws(unknown.project); assert.equal(unknown.called(), 0);
  const accessor = fixture(); accessor.replaceShapeMethod(); assert.throws(accessor.project); assert.equal(accessor.called(), 0);
});
void test("qualified tuple merging deduplicates actual JS references and leaves opaque fields untouched", () => {
  const native: unknown[] = []; native[0] = Object.getOwnPropertyDescriptor; native[4] = Object.hasOwn; native[5] = Reflect.ownKeys; native[7] = Array.isArray;
  const first = {}, second = {}; Object.defineProperty(first, "unused", { get: () => { throw new Error("unused getter must stay opaque"); } });
  const fn: unknown = runInThisContext(`(${QUALIFIED})`); assert.ok(typeof fn === "function");
  const result: unknown = Reflect.apply(fn, [first, second, null, 4], [native, [first], [], [second], []]); assert.ok(Array.isArray(result)); assert.equal(result.length, 2); assert.equal(result[0], first); assert.equal(result[1], second);
});
