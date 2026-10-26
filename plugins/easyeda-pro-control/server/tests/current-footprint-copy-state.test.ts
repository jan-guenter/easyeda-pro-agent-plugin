import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CURRENT_FOOTPRINT_COPY_CONSTRUCTORS_EXPRESSION, CURRENT_FOOTPRINT_COPY_STATE_CALLS, decodeCurrentFootprintCopyState } from "../src/current-footprint-copy-state.ts";
import { CurrentPcb209WorkerConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
import { construction209Inspector } from "./helpers/current-pcb-worker-construction-inspector.ts";

const SETUP = 'PROJECT.uuid="a".repeat(64);PROJECT._branchUuid="b".repeat(32);globalThis._TAB_ID_="window_1";';
async function observe(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original awaited work retains its own failure.
  }
}
void test("footprint state comes from original constructor handles, preserves own undefined user and rejects copied packets", { timeout: 30_000 }, async context => {
  const peer = await construction209Inspector(context), runner = new CurrentPcb209WorkerConstructionRunner(peer.transport);
  const captureStart = peer.commands.length;
  const capture = runner.capture(); void observe(capture); await runner.whenArmed(); const running = peer.run(); void observe(running);
  const packet = await capture; await running;
  // Runtime.runScript belongs to this synthetic harness, not the constructor
  // Transport. Count its actual CDP requests separately from fixture setup.
  const constructorCommands = peer.commands.slice(captureStart).filter(method => method !== "Runtime.runScript");
  assert.equal(constructorCommands.length, 55);
  assert.deepEqual(Object.fromEntries(["Debugger.setBreakpoint", "Debugger.evaluateOnCallFrame", "Runtime.callFunctionOn",
    "Runtime.getProperties", "Debugger.resume", "Debugger.removeBreakpoint"].map(method =>
    [method, constructorCommands.filter(value => value === method).length])), {
    "Debugger.setBreakpoint": 8, "Debugger.evaluateOnCallFrame": 16, "Runtime.callFunctionOn": 10,
    "Runtime.getProperties": 4, "Debugger.resume": 9, "Debugger.removeBreakpoint": 8,
  });
  await peer.syntheticEvaluate(SETUP);
  await runner.proveProjectIdentity(packet); const assignments = await runner.proveCurrentAssignments(packet);
  const observing = peer.commands.length;
  const state = await runner.observeFootprintState(packet, assignments);
  assert.equal(peer.commands.length - observing, 6);
  assert.equal(state.client, "1234567890abcdef"); assert.equal(state.maximumTicket, 0);
  assert.equal(state.capturedUser, "own-undefined"); assert.equal(state.executionAuthorized, false);
  assert.equal(state.originalConstructorManagerMatched, true); assert.equal(state.samples, 2);
  const before = peer.commands.length;
  await assert.rejects(runner.requireFootprintState(packet, assignments, structuredClone(state)), /ORIGINAL_FOOTPRINT_PACKET/u);
  await assert.rejects(runner.observeFootprintState(packet, assignments), /FOOTPRINT_CONSUMED/u);
  assert.equal(peer.commands.length, before);
  await runner.requireFootprintState(packet, assignments, state);
  assert.equal(peer.commands.length - before, 3);
  await peer.syntheticEvaluate("PROJECT.consistencyManager.maxTicket=1");
  await assert.rejects(runner.requireFootprintState(packet, assignments, state), /FOOTPRINT_CHANGED/u);
  assert.equal(runner.status().failed, true); await runner.release();
});

void test("same-field replacement managers and captured-user/client drift refuse actual original owner observations", { timeout: 30_000 }, async context => {
  for (const mutation of [
    "PROJECT.footprint=Object.assign(Object.create(Object.getPrototypeOf(PROJECT.footprint)),PROJECT.footprint)",
    "PROJECT.consistencyManager=Object.assign(Object.create(Object.getPrototypeOf(PROJECT.consistencyManager)),PROJECT.consistencyManager)",
    "PROJECT.footprint.user={uuid:'f'.repeat(32)}",
    "delete PROJECT.footprint.user",
    "PROJECT.footprint.client='abcdef1234567890'",
  ]) {
    const peer = await construction209Inspector(context), runner = new CurrentPcb209WorkerConstructionRunner(peer.transport);
    const capture = runner.capture(); void observe(capture); await runner.whenArmed(); const running = peer.run(); void observe(running);
    const packet = await capture; await running; await peer.syntheticEvaluate(SETUP);
    await runner.proveProjectIdentity(packet); const assignments = await runner.proveCurrentAssignments(packet);
    await peer.syntheticEvaluate(`${mutation};void 0;`);
    await assert.rejects(runner.observeFootprintState(packet, assignments));
    assert.equal(runner.status().failed, true); await runner.release();
  }
});

const SYNTHETIC = `class Pi{constructor(p){this.projectManager=p;this.client=p.consistencyManager.client;this.user=undefined;}}
class ar extends Pi{}class Tg extends ar{}class zy{}class Vc extends zy{constructor(){super();this.client="1234567890abcdef";this.maxTicket=8;}}class ja extends Vc{}
const bus={};const consistency=new ja();globalThis.PROJECT={workerBus:bus,consistencyManager:consistency,uuid:"a".repeat(64),_branchUuid:"b".repeat(32)};
globalThis._TAB_ID_="window_1";const manager=new Tg(PROJECT);PROJECT.footprint=manager;const constructors=[Tg,ar,Pi,ja,Vc,zy];`;
void test("fixed footprint state reads reject accessors without invoking them and retain bounded exact native fields", () => {
  const source = CURRENT_FOOTPRINT_COPY_STATE_CALLS.observe.program;
  for (const [receiver, field] of [["manager", "user"], ["manager", "client"], ["consistency", "maxTicket"], ["PROJECT", "footprint"]]) {
    let hooks = 0;
    const hook = (): never => { hooks += 1; throw new Error("Getter executed"); };
    assert.throws(() => runInNewContext(`${SYNTHETIC}Object.defineProperty(${receiver},${JSON.stringify(field)},{get:hook});(${source}).call(PROJECT,bus,manager,consistency,constructors);`, { hook }), /FOOTPRINT_COPY_STATE/u);
    assert.equal(hooks, 0);
  }
  const value: unknown = runInNewContext(`${SYNTHETIC}(${source}).call(PROJECT,bus,manager,consistency,constructors);`);
  const decoded = decodeCurrentFootprintCopyState({ result: { type: "string", value } });
  assert.equal(decoded.maximumTicket, 8); assert.equal(Object.isFrozen(decoded.identity), true);
  for (const invalid of [-0, -1, 1.5, Number.MAX_SAFE_INTEGER, Number.NaN]) {
    assert.throws(() => runInNewContext(`${SYNTHETIC}consistency.maxTicket=invalid;(${source}).call(PROJECT,bus,manager,consistency,constructors);`, { invalid }), /FOOTPRINT_COPY_STATE/u);
  }
  assert.throws(() => decodeCurrentFootprintCopyState({ result: { type: "string", value }, exceptionDetails: {} }));
});

void test("constructor capture binds original lexical classes and state rejects same-name prototype replacement", () => {
  const capture = CURRENT_FOOTPRINT_COPY_CONSTRUCTORS_EXPRESSION;
  const source = CURRENT_FOOTPRINT_COPY_STATE_CALLS.observe.program;
  const result: unknown = runInNewContext(`${SYNTHETIC}(function(){return ${capture};}).call(PROJECT);`);
  assert.ok(Array.isArray(result)); assert.equal(result.length, 6);
  for (const mutation of [
    "Object.setPrototypeOf(manager,{constructor:class Tg extends ar{}})",
    "Object.setPrototypeOf(consistency,{constructor:class ja extends Vc{}})",
  ]) {
    assert.throws(() => runInNewContext(`${SYNTHETIC}${mutation};(function(){return ${capture};}).call(PROJECT);`), /FOOTPRINT_CONSTRUCTOR_BINDING/u);
    assert.throws(() => runInNewContext(`${SYNTHETIC}${mutation};(${source}).call(PROJECT,bus,manager,consistency,constructors);`), /FOOTPRINT_COPY_STATE/u);
  }
  assert.throws(() => runInNewContext(`${SYNTHETIC}(function(Tg){return ${capture};}).call(PROJECT,class Tg extends ar{});`), /FOOTPRINT_CONSTRUCTOR_BINDING/u);
  assert.throws(() => runInNewContext(`${SYNTHETIC}(function(Tg){return ${capture};}).call(PROJECT,undefined);`), /FOOTPRINT_CONSTRUCTOR_BINDING/u);
});
