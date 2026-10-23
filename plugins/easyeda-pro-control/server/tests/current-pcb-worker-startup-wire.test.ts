import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { currentPcbWorkerStartupNativeCases, currentPcbWorkerStartupNativeParentCases, currentPcbWorkerStartupNativeSource } from "../src/current-pcb-worker-startup-native.ts";
import { currentPcbWorkerStartupWire } from "../src/current-pcb-worker-startup-wire.ts";
import { CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION, currentPcbWorkerStartupUiActorCommand } from "../src/current-pcb-worker-startup-actor.ts";

const samples = currentPcbWorkerStartupNativeCases();
void test("startup parent grammar retains browser-global reads and exact sealed opener, never caller code", () => {
  const parents = currentPcbWorkerStartupNativeParentCases(); assert.equal(parents.length, 7);
  for (const sample of parents) {
    const result = currentPcbWorkerStartupWire(sample, 256);
    assert.deepEqual(result.command, { id: 256, ...sample });
    assert.equal(result.request["action"], "worker-startup-parent");
    assert.ok(!Object.hasOwn(result.request, "functionDeclaration"));
    assert.throws(() => currentPcbWorkerStartupWire({ ...sample, params: { ...sample.params, extra: true } }, 256));
    if (sample.method === "Target.getTargets") {
      assert.ok(!Object.hasOwn(result.request, "sessionId"));
      assert.throws(() => currentPcbWorkerStartupWire({ ...sample, sessionId: "parent" }, 256));
    }
    if (sample.method === "Runtime.callFunctionOn" && sample.params.arguments.length === 2) {
      for (const patch of [{ functionDeclaration: `${sample.params.functionDeclaration} ` }, { uniqueContextId: "bad\ncontext" },
        { arguments: [{ value: { ...sample.params.arguments[0].value, projectUuid: "0".repeat(64) } }, sample.params.arguments[1]] },
        { throwOnSideEffect: true }, { awaitPromise: false }]) {
        assert.throws(() => currentPcbWorkerStartupWire({ ...sample, params: { ...sample.params, ...patch } }, 256));
      }
      let hooks = 0;
      const parameters = { ...sample.params };
      Object.defineProperty(parameters, "functionDeclaration", { get: (): never => { hooks += 1; throw new Error("Unexpected getter"); } });
      assert.throws(() => currentPcbWorkerStartupWire({ ...sample, params: parameters }, 256)); assert.equal(hooks, 0);
    }
  }
});
void test("startup wire preserves every fixed command and strips native program text", () => {
  assert.equal(samples.length, 37);
  for (const sample of samples) {
    const wire = currentPcbWorkerStartupWire(sample, 1);
    assert.deepEqual(wire.command, { id: 1, ...sample });
    assert.equal(wire.request["action"], "worker-startup-send");
    assert.equal(wire.request["method"], sample.method);
    for (const key of ["params", "functionDeclaration", "expression", "objectGroup", "arguments", "lineNumber", "columnNumber"]) {
      assert.ok(!Object.hasOwn(wire.request, key));
    }
    assert.ok(Object.isFrozen(wire) && Object.isFrozen(wire.command.params) && Object.isFrozen(wire.request));
  }
});
void test("startup actor wire admits only exact fixed UI and original-receiver worker programs", () => {
  const ui = currentPcbWorkerStartupUiActorCommand("parent-session", "original-context");
  const worker = samples.find(sample => sample.method === "Runtime.callFunctionOn" &&
    sample.params.functionDeclaration === CURRENT_PCB_WORKER_STARTUP_WORKER_ACTOR_CLOCK_FUNCTION);
  assert.ok(worker?.method === "Runtime.callFunctionOn");
  const uiWire = currentPcbWorkerStartupWire(ui, 100), workerWire = currentPcbWorkerStartupWire(worker, 101);
  assert.equal(uiWire.request["action"], "worker-startup-parent"); assert.equal(uiWire.request["parentPhase"], "actor-clock");
  assert.equal(workerWire.request["action"], "worker-startup-send"); assert.equal(workerWire.request["startupPhase"], "actor-clock");
  assert.equal(uiWire.request["uniqueContextId"], "original-context");
  assert.equal(Object.hasOwn(uiWire.request, "functionDeclaration"), false);
  assert.equal(Object.hasOwn(workerWire.request, "functionDeclaration"), false);
  for (const patch of [{ functionDeclaration: `${ui.params.functionDeclaration} ` }, { arguments: [{ value: "caller-target" }] },
    { objectId: "caller-receiver" }, { awaitPromise: true }, { throwOnSideEffect: false }, { returnByValue: false },
    { uniqueContextId: "foreign\ncontext" }]) {
    assert.throws(() => currentPcbWorkerStartupWire({ ...ui, params: { ...ui.params, ...patch } }, 100));
  }
  for (const patch of [{ uniqueContextId: "caller-context" }, { arguments: [] }, { arguments: [{ value: "caller-bus" }] },
    { objectGroup: "foreign-group" }, { awaitPromise: true }, { throwOnSideEffect: false }, { returnByValue: false }]) {
    assert.throws(() => currentPcbWorkerStartupWire({ ...worker, params: { ...worker.params, ...patch } }, 101));
  }
});
void test("startup wire refuses extra keys, program changes, effects and arbitrary breakpoint coordinates", () => {
  for (const sample of samples) {
    assert.throws(() => currentPcbWorkerStartupWire({ ...sample, extra: 1 }, 1));
    assert.throws(() => currentPcbWorkerStartupWire({ ...sample, params: { ...sample.params, extra: 1 } }, 1));
    if (sample.method === "Runtime.callFunctionOn") {
      for (const patch of [{ functionDeclaration: `${sample.params.functionDeclaration} ` }, { throwOnSideEffect: false },
        { returnByValue: !sample.params.returnByValue }, { arguments: [...sample.params.arguments, { objectId: "extra" }] }]) {
        assert.throws(() => currentPcbWorkerStartupWire({ ...sample, params: { ...sample.params, ...patch } }, 1));
      }
    }
    if (sample.method === "Debugger.setBreakpoint") {
      assert.throws(() => currentPcbWorkerStartupWire({ ...sample, params: { location: { ...sample.params.location, columnNumber: 1 } } }, 1));
    }
  }
});
void test("startup wire refuses accessors and proxies without invoking caller hooks", () => {
  const sample = samples[0]; assert.ok(sample !== undefined); let hooks = 0;
  const hostile = { ...sample };
  Object.defineProperty(hostile, "params", { get: (): never => { hooks += 1; throw new Error("Getter executed"); } });
  assert.throws(() => currentPcbWorkerStartupWire(hostile, 1));
  assert.throws(() => currentPcbWorkerStartupWire(new Proxy(sample, { ownKeys: (): never => { hooks += 1; throw new Error("Proxy executed"); } }), 1));
  assert.equal(hooks, 0);
});
void test("startup identifiers and budget are bounded; placeholder-shaped handles stay distinct", () => {
  const sample = samples.find(value => value.method === "Runtime.callFunctionOn" && value.params.arguments.length === 1);
  assert.ok(sample?.method === "Runtime.callFunctionOn");
  const wire = currentPcbWorkerStartupWire({ ...sample, params: { ...sample.params,
    objectId: "__startup_argument0__", arguments: [{ objectId: "different" }] } }, 256);
  assert.equal(wire.request["objectId"], "__startup_argument0__");
  assert.equal(wire.request["argument0"], "different");
  for (const id of [0, -0, -1, 257, 1.1, Number.NaN, Number.POSITIVE_INFINITY]) { assert.throws(() => currentPcbWorkerStartupWire(sample, id)); }
  for (const sessionId of ["", "a".repeat(129), "bad\n", null, 4]) { assert.throws(() => currentPcbWorkerStartupWire({ ...sample, sessionId }, 1)); }
});
void test("native startup source is generated exactly and keeps the distinct purpose boundary", async () => {
  const native = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const generated = currentPcbWorkerStartupNativeSource();
  assert.ok(native.includes(generated));
  assert.ok(!generated.includes("parameters.Replace("));
  assert.ok(generated.includes("smoke-placeholder") && generated.includes("smoke-parity"));
  assert.ok(native.includes("if(!workerStartup || stringPrecreate)throw Error(\"startup-purpose\")"));
  assert.ok(native.includes("if ($StringPrecreate -and $WorkerStartup)"));
  assert.ok(native.includes("[EasyedaWorkerStartupProtocol]::VerifySmoke()"));
  assert.ok(native.includes("if ($WorkerStartup -and @('Browser.getVersion'"));
});
