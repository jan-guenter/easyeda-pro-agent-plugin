/** Finite syntax/data checks only, no original worker or writer grant. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CALLS } from "../src/current-project-save-structure-programs.ts";
import { currentProjectSaveStructureNativeCases, validateCurrentProjectSaveStructureCommand } from "../src/current-project-save-structure-protocol.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_SITES } from "../src/current-project-save-structure-source.ts";

void test("structure vocabulary pins every exact stage, flags, expression and argument count", () => {
  const cases = currentProjectSaveStructureNativeCases(); assert.equal(cases.length, 64);
  for (const command of cases) { assert.deepEqual(validateCurrentProjectSaveStructureCommand(command), command); }
  const arm = cases.find(command => command.phase === "project-save-structure-arm"); assert.ok(arm?.method === "Debugger.setBreakpoint");
  assert.throws(() => validateCurrentProjectSaveStructureCommand({ ...arm, params: { location: { ...arm.params.location, columnNumber: arm.params.location.columnNumber + 1 } } }));
  const frame = cases.find(command => command.phase === "project-save-structure-frame"); assert.ok(frame?.method === "Debugger.evaluateOnCallFrame");
  assert.throws(() => validateCurrentProjectSaveStructureCommand({ ...frame, params: { ...frame.params, expression: "PROJECT" } }));
  assert.throws(() => validateCurrentProjectSaveStructureCommand({ ...frame, params: { ...frame.params, throwOnSideEffect: false } }));
  assert.equal(CURRENT_PROJECT_SAVE_STRUCTURE_SITES.initialFinally.columnNumber, 145_736);
});
void test("bootstrap projection reads only the actual PROJECT tuple and refuses existing tasks", () => {
  const context = createContext({}); runInContext("const bus={},u=()=>{},s=()=>{};globalThis.PROJECT={wsBus:bus,task2:new Set,uploadStructure:u,structure:s};const tuple=[PROJECT,bus];", context);
  assert.equal(runInContext(`(${CURRENT_PROJECT_SAVE_STRUCTURE_CALLS.bootstrap}).call(tuple).length`, context), 3);
  runInContext("PROJECT.task2.add(Promise.resolve())", context);
  assert.throws(() => runInContext(`(${CURRENT_PROJECT_SAVE_STRUCTURE_CALLS.bootstrap}).call(tuple)`, context));
});
