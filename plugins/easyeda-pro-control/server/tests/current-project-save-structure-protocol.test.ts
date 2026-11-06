/** Finite syntax/data checks only, no original worker or writer grant. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CALLS } from "../src/current-project-save-structure-programs.ts";
import { currentProjectSaveStructureNativeCases, decodeCurrentProjectSaveProducerNonprivateMode, validateCurrentProjectSaveStructureCommand } from "../src/current-project-save-structure-protocol.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_SITES, CURRENT_PROJECT_SAVE_STRUCTURE_STARTUP_CONDITION as STARTUP_CONDITION } from "../src/current-project-save-structure-source.ts";

const modeReply = (mode: unknown): object => ({ result: [{ name: "0", isOwn: true, value: { type: "boolean", value: mode } }, { name: "length", isOwn: true, value: { type: "number", value: 1 } }] });

void test("structure vocabulary pins every exact stage, flags, expression and argument count", () => {
  const cases = currentProjectSaveStructureNativeCases(); assert.equal(cases.length, 75);
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

void test("startup condition pauses only its false or unknown state and never invokes a ready getter", () => {
  const context = createContext({}); runInContext("let reads=0;globalThis.PROJECT={isReady:false};", context);
  const expression = `(function(){return ${STARTUP_CONDITION};}).call(PROJECT)`;
  assert.equal(runInContext(expression, context), true); runInContext("PROJECT.isReady=true", context); assert.equal(runInContext(expression, context), false);
  runInContext("Object.defineProperty(PROJECT,'isReady',{get(){reads++;return true;}})", context); assert.equal(runInContext(expression, context), true); assert.equal(runInContext("reads", context), 0);
  const cases = currentProjectSaveStructureNativeCases(); const arm = cases.find(command => command.phase === "project-save-structure-arm" && command.role === "startupEntry"); assert.ok(arm?.method === "Debugger.setBreakpoint");
  assert.throws(() => validateCurrentProjectSaveStructureCommand({ ...arm, params: { location: arm.params.location } }));
  assert.throws(() => validateCurrentProjectSaveStructureCommand({ ...arm, params: { ...arm.params, condition: "false" } }));
});

void test("no-publication projections join the original callback and Nd scope without calling application code", () => {
  const context = createContext({}); runInContext("let calls=0;globalThis.PROJECT={isReady:false};const callback=()=>{calls++};const serial={object:{e:callback,t:Promise.resolve(),s:Promise.resolve(),r:['PCB','VIA',true]}};const entry=[PROJECT,'PCB','VIA',true],caller=[callback,serial.object.t,serial.object.s,serial.object.r],returned=[...entry],finalizer=[serial.object.t,serial.object.s,callback];", context);
  assert.equal(runInContext(`(${CURRENT_PROJECT_SAVE_STRUCTURE_CALLS.startupEntry}).call(entry,PROJECT,callback,caller,serial)`, context), true);
  assert.equal(runInContext(`(${CURRENT_PROJECT_SAVE_STRUCTURE_CALLS.startupReturn}).call(returned,entry,PROJECT)`, context), true);
  assert.equal(runInContext(`(${CURRENT_PROJECT_SAVE_STRUCTURE_CALLS.startupFinalizer}).call(finalizer,PROJECT,callback,serial)`, context), true); assert.equal(runInContext("calls", context), 0);
  runInContext("caller[3]=[...serial.object.r]", context); assert.throws(() => runInContext(`(${CURRENT_PROJECT_SAVE_STRUCTURE_CALLS.startupEntry}).call(entry,PROJECT,callback,caller,serial)`, context)); runInContext("caller[3]=serial.object.r", context);
  runInContext("finalizer[2]=()=>{calls++}", context); assert.throws(() => runInContext(`(${CURRENT_PROJECT_SAVE_STRUCTURE_CALLS.startupFinalizer}).call(finalizer,PROJECT,callback,serial)`, context));
  runInContext("returned[2]='META'", context); assert.throws(() => runInContext(`(${CURRENT_PROJECT_SAVE_STRUCTURE_CALLS.startupReturn}).call(returned,entry,PROJECT)`, context));
  runInContext("Object.defineProperty(PROJECT,'isReady',{get(){calls++;return false}})", context); assert.throws(() => runInContext(`(${CURRENT_PROJECT_SAVE_STRUCTURE_CALLS.startupEntry}).call(entry,PROJECT,callback,caller,serial)`, context)); assert.equal(runInContext("calls", context), 0);
});

void test("bootstrap mode projection accepts only the original own false value with no getter or proxy evaluation", () => {
  assert.equal(decodeCurrentProjectSaveProducerNonprivateMode(modeReply(false)), false); assert.throws(() => decodeCurrentProjectSaveProducerNonprivateMode(modeReply(true)));
  assert.throws(() => decodeCurrentProjectSaveProducerNonprivateMode(modeReply("false"))); let calls = 0;
  const forbidden = (): never => { calls += 1; throw new Error("getter"); };
  assert.throws(() => decodeCurrentProjectSaveProducerNonprivateMode(Object.defineProperty({}, "result", { get: forbidden })));
  assert.throws(() => decodeCurrentProjectSaveProducerNonprivateMode(new Proxy(modeReply(false), { ownKeys: forbidden }))); assert.equal(calls, 0);
  const frame = currentProjectSaveStructureNativeCases().find(command => command.phase === "project-save-structure-frame" && command.role === "mode"); assert.ok(frame);
  assert.throws(() => validateCurrentProjectSaveStructureCommand({ ...frame, phase: "project-save-structure-arm", method: "Debugger.setBreakpoint" }));
});
