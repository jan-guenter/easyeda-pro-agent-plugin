import assert from "node:assert/strict";
import { test } from "node:test";
import { runInContext } from "node:vm";
import { CURRENT_PCB_209_EMPTY_ROOT_FUNCTION, decodeCurrentPcb209EmptyRootReply } from "../src/current-pcb-209-empty-root-program.ts";
import { CURRENT_PCB_209_EMPTY_ROOT_REQUEST_COUNT, CurrentPcb209EmptyRootRunner } from "../src/current-pcb-209-empty-root-runner.ts";
import type { CurrentPcb209EmptyRootCommand, CurrentPcb209EmptyRootTransport } from "../src/current-pcb-209-empty-root-runner.ts";
import { PCB209_EMPTY_ROOT_SETUP, pcb209EmptyRootScopeReplies } from "./helpers/current-pcb-209-empty-root-fixture.ts";
import { callPcbStringObservation, pcbStringObservationFixture, pcbStringReply } from "./helpers/current-pcb-string-observation-fixture.ts";

function setup(change = ""): ReturnType<typeof pcbStringObservationFixture> {
  return pcbStringObservationFixture(false, PCB209_EMPTY_ROOT_SETUP + change);
}
void test("209 empty raw roots include all17 managers without invoking view serializers or getters", () => {
  const context = setup('emptyRoots.spatial.map.set("Line",new Map([[1,new emptyRoots.Tree()]]));emptyRoots.roots.inner.manager.layerMapSet[3]=new Set();');
  const observed = decodeCurrentPcb209EmptyRootReply(pcbStringReply(callPcbStringObservation(context, CURRENT_PCB_209_EMPTY_ROOT_FUNCTION)));
  assert.equal(Object.keys(observed.families).length, 17);
  assert.equal(observed.spatial.treeCount, 1); assert.equal(observed.spatial.totalKeys, 2);
  assert.deepEqual(observed.innerLayerIds, [3]);
  assert.equal(observed.completeLiveBaselineVerified, false); assert.equal(observed.executionAuthorized, false);
  assert.equal(runInContext("vendorCalls+getterReads", context) as unknown, 0);
});
void test("209 empty roots reject watcherless members, unavailable managers, latent roots and unsupported accessors", () => {
  const changes = [
    'emptyRoots.roots.strings.manager.map.set("watcherless",{_stateWatcher:undefined});',
    'emptyRoots.roots.pads.manager=null;',
    'delete emptyRoots.roots.vias.manager;',
    'emptyRoots.roots.tracks.manager._last={};',
    'emptyRoots.roots.inner.manager.layerMapSet[3]=new Set([{_stateWatcher:undefined}]);',
    'emptyRoots.roots.inner.manager.layerMapSet.unknown=new Set();',
    'Object.defineProperty(emptyRoots.roots.inner.manager.layerMapSet,"3",{get(){getterReads++;return new Set();}});',
    'emptyRoots.board._board={};',
    'emptyRoots.board._outlineCollect.set("outline",{});',
    'emptyRoots.panel._param.on=true;',
    'emptyRoots.panel.holes.push({});',
    'const tree=new emptyRoots.Tree();tree.root.childs.push({});emptyRoots.spatial.otherMap.set(1,tree);',
    'const tree=new emptyRoots.Tree();tree.changeList.add({});emptyRoots.spatial.otherMap.set(1,tree);',
    'Object.defineProperty(emptyRoots.roots.strings.manager,"map",{get(){getterReads++;return new Map();}});',
  ];
  for (const change of changes) {
    const context = setup(change);
    assert.throws(() => callPcbStringObservation(context, CURRENT_PCB_209_EMPTY_ROOT_FUNCTION), /PCB_STRING_OBSERVATION_STATE/u, change);
    assert.equal(runInContext("vendorCalls+getterReads", context) as unknown, 0);
  }
});
function runnerFixture(): Readonly<{
  runner: CurrentPcb209EmptyRootRunner; transport: CurrentPcb209EmptyRootTransport;
  commands: CurrentPcb209EmptyRootCommand[]; change: (source: string) => void; current: (next: boolean) => void;
}> {
  const context = setup(), replies = pcb209EmptyRootScopeReplies();
  const commands: CurrentPcb209EmptyRootCommand[] = [];
  let current = true;
  const transport: CurrentPcb209EmptyRootTransport = {
    assertCurrent: (): void => { if (!current) { throw new Error("OWNER_LOST"); } },
    request: (command): Promise<unknown> => {
      commands.push(command);
      if (command.rootPhase === "release") { return Promise.resolve({}); }
      if (commands.length <= 6) { return Promise.resolve(replies[commands.length - 1]); }
      assert.ok(command.rootPhase === "before" || command.rootPhase === "after");
      return Promise.resolve(pcbStringReply(callPcbStringObservation(context, command.params.functionDeclaration)));
    },
  };
  const runner = new CurrentPcb209EmptyRootRunner(transport, "pcb", "original-context", "d".repeat(16));
  return Object.freeze({ runner, transport, commands, change: (source): void => { runInContext(source, context); }, current: (next): void => { current = next; } });
}
void test("209 root runner brackets an enclosing operation and retains one original pair after cleanup", async () => {
  const token = Object.freeze({ original: true }), value = runnerFixture();
  const observed = await value.runner.observeAround(() => {
    assert.equal(value.commands.at(-1)?.rootPhase, "before"); return Promise.resolve(token);
  });
  assert.equal(observed.value, token); assert.equal(value.commands.length, CURRENT_PCB_209_EMPTY_ROOT_REQUEST_COUNT);
  assert.equal(value.commands.at(-1)?.rootPhase, "release"); value.runner.requireOriginal(observed.pair);
  assert.throws(() => { value.runner.requireOriginal(structuredClone(observed.pair)); }, /ORIGINAL_PAIR/u);
  value.current(false); assert.throws(() => { value.runner.requireOriginal(observed.pair); }, /OWNER_LOST/u);
  value.current(true); assert.throws(() => { value.runner.requireOriginal(observed.pair); }, /ORIGINAL_PAIR/u);
  await assert.rejects(value.runner.observeAround(() => Promise.resolve(token)), /CONSUMED/u);
});
void test("209 root bracket refuses membership drift and enclosing failure but releases its original group", async () => {
  for (const mode of ["drift", "failure"] as const) {
    const value = runnerFixture();
    await assert.rejects(value.runner.observeAround(() => {
      if (mode === "failure") { return Promise.reject(new Error("SQL_MISMATCH")); }
      value.change('emptyRoots.roots.strings.manager.map.set("hidden",{});'); return Promise.resolve(true);
    }), /PCB209_EMPTY_ROOT_RUNNER_FAILED/u);
    assert.equal(value.commands.at(-1)?.rootPhase, "release"); assert.equal(value.runner.status().originalPairRetained, false);
    const count = value.commands.length;
    await assert.rejects(value.runner.observeAround(() => Promise.resolve(true)), /CONSUMED/u); assert.equal(value.commands.length, count);
  }
});
