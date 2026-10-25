/** Synthetic native transcripts test only original-handle admission. Actual
 * same-realm equality is exercised by the V8 composite suite separately. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CurrentPcb209RatlineHeldConstruction } from "../src/current-pcb-209-ratline-held-construction.ts";
import { CURRENT_PCB_209_RATLINE_NATIVE_CASES } from "../src/current-pcb-209-ratline-native-cases.ts";
import { currentPcb209RatlineNativeWire } from "../src/current-pcb-209-ratline-native-wire.ts";
import { CURRENT_PCB_209_RATLINE_CAPTURE_PROGRAMS as PROGRAMS } from "../src/current-pcb-209-ratline-capture-program.ts";
import type { CurrentPcb209RatlineNativeCommand } from "../src/current-pcb-209-ratline-native-cases.ts";

function command(phase: string, fields: Readonly<Record<string, string>> = {}): CurrentPcb209RatlineNativeCommand {
  const selected = CURRENT_PCB_209_RATLINE_NATIVE_CASES.find(entry => entry.role === "pcb" && entry.phase === phase);
  assert.ok(selected !== undefined);
  const values = { sessionId: "parent-session", callFrameId: "frame", ...fields };
  const raw: unknown = JSON.parse(JSON.stringify(selected.command).replaceAll(/__ratline209_([A-Za-z\d]+)__/gu,
    (_match, name: string): string => { const value = Object.getOwnPropertyDescriptor(values, name)?.value as unknown; assert.equal(typeof value, "string"); return String(value); }));
  const { id: _validation, ...result } = currentPcb209RatlineNativeWire("pcb", raw, 1).command; return result;
}
const object = (objectId: string): object => ({ result: { type: "object", objectId } });
const yes = { result: { type: "boolean", value: true } };
function transcript(): readonly Readonly<{ phase: string; command: CurrentPcb209RatlineNativeCommand; reply: unknown }>[] {
  return [
    { phase: "creation-worker", command: command("creation-worker"), reply: object("constructed-worker") },
    { phase: "creation-this", command: command("creation-this"), reply: object("constructor-manager") },
    { phase: "object-this", command: command("object-this", { callFrameId: "bridge-frame" }), reply: object("bridge") },
    { phase: "object-t", command: command("object-t", { callFrameId: "bridge-frame" }), reply: object("bridge-worker") },
    { phase: "object-o", command: command("object-o", { callFrameId: "bridge-frame" }), reply: object("bus") },
    { phase: "relation-bridge", command: command("relation-bridge", { objectId: "bridge", argument0: "bridge-worker", argument1: "bus" }), reply: yes },
    { phase: "object-this", command: command("object-this", { callFrameId: "factory-frame" }), reply: object("factory-manager") },
    { phase: "relation-factory", command: command("relation-factory", { objectId: "factory-manager", argument0: "bridge-worker", argument1: "bridge", argument2: "bus" }),
      reply: { result: { type: "object", value: { nativeWorkerId: 0 } } } },
  ];
}
function join(fields: Readonly<Record<string, string>> = {}): CurrentPcb209RatlineNativeCommand {
  return command("relation-construction", { objectId: "constructed-worker", argument0: "bridge-worker", argument1: "constructor-manager", argument2: "factory-manager", ...fields });
}
function retained(): CurrentPcb209RatlineHeldConstruction {
  const owner = new CurrentPcb209RatlineHeldConstruction();
  for (const row of transcript()) { owner.observeReply(row.phase, row.command, row.reply); } return owner;
}

void test("held construction joins only its exact ordered retained handles and consumes before a result", () => {
  const original = join(), owner = retained(); owner.assertOriginalJoin(original);
  for (const field of ["sessionId", "objectId", "argument0", "argument1", "argument2"]) {
    assert.throws(() => { owner.assertOriginalJoin(join({ [field]: "foreign" })); });
  }
  owner.assertOriginalJoin(original); owner.consumeOriginalJoin(original);
  assert.throws(() => { owner.assertOriginalJoin(original); }); assert.throws(() => { owner.consumeOriginalJoin(original); });
  owner.observeOriginalJoinReply(yes);
  const other = new CurrentPcb209RatlineHeldConstruction(); assert.throws(() => { other.assertOriginalJoin(original); });
  assert.throws(() => { other.observeOriginalJoinReply(yes); });
});
void test("incomplete, duplicate, malformed and wrong-frame provenance never enables a join", () => {
  const rows = transcript();
  for (const limit of [0, 1, 2, 3, 4, 5, 6, 7]) {
    const owner = new CurrentPcb209RatlineHeldConstruction();
    for (const row of rows.slice(0, limit)) { owner.observeReply(row.phase, row.command, row.reply); }
    assert.throws(() => { owner.assertOriginalJoin(join()); });
  }
  for (const [index, raw] of [[1, command("creation-this", { callFrameId: "other" })], [3, command("object-t", { callFrameId: "other" })],
    [5, command("relation-bridge", { objectId: "foreign", argument0: "bridge-worker", argument1: "bus" })],
    [7, command("relation-factory", { objectId: "factory-manager", argument0: "foreign", argument1: "bridge", argument2: "bus" })]] as const) {
    const owner = new CurrentPcb209RatlineHeldConstruction();
    for (const row of rows.slice(0, index)) { owner.observeReply(row.phase, row.command, row.reply); }
    const row = rows[index]; assert.ok(row !== undefined); assert.throws(() => { owner.observeReply(row.phase, raw, row.reply); });
    assert.throws(() => { owner.assertOriginalJoin(join()); });
  }
  const first = rows[0], owner = new CurrentPcb209RatlineHeldConstruction(); assert.ok(first !== undefined);
  assert.throws(() => { owner.observeReply(first.phase, first.command, { result: { type: "string", value: "constructed-worker" } }); });
  owner.observeReply(first.phase, first.command, first.reply); assert.throws(() => { owner.observeReply(first.phase, first.command, first.reply); });
});
void test("false, coerced and exception replies refuse without restoring consumed join", () => {
  for (const reply of [{ result: { type: "boolean", value: false } }, { result: { type: "boolean", value: "true" } },
    { ...yes, exceptionDetails: {} }, {}, { result: { type: "object", objectId: "true" } }]) {
    const owner = retained(); owner.consumeOriginalJoin(join()); assert.throws(() => { owner.observeOriginalJoinReply(reply); });
    assert.throws(() => { owner.consumeOriginalJoin(join()); });
  }
});
void test("fixed construction comparison compares both object pairs without invoking object hooks", () => {
  const compare: unknown = runInNewContext(`(${PROGRAMS.construction})`); assert.equal(typeof compare, "function"); assert.ok(typeof compare === "function");
  let hooks = 0; const objectHooks = { get: (): never => { hooks += 1; throw new Error("No property access expected"); } };
  const manager = new Proxy({}, objectHooks), worker = new Proxy({}, objectHooks);
  assert.equal(Reflect.apply(compare, worker, [worker, manager, manager]), true);
  assert.equal(Reflect.apply(compare, worker, [{}, manager, manager]), false);
  assert.equal(Reflect.apply(compare, worker, [worker, manager, {}]), false); assert.equal(hooks, 0);
});
