/** The actual constructor-owner regression is in producer-owner.test.ts.
 * This checks native command coverage and refusal at the fixed wire boundary. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COPY_CREATE_METHOD_CALLS } from "../src/current-footprint-copy-create-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_LEXICAL_CALLS } from "../src/current-footprint-copy-producer-scope.ts";
import { currentFootprintCopyProducerNativeCases, currentPcbWorkerStartupNativeSource } from "../src/current-pcb-worker-startup-native.ts";
import { currentFootprintCopyPreparationWire, currentPcb209WorkerStartupWire, currentPcbWorkerStartupWire } from "../src/current-pcb-worker-startup-wire.ts";

const expected = [
  ["methods-capture", CURRENT_FOOTPRINT_COPY_CREATE_METHOD_CALLS.capture],
  ["methods-recheck", CURRENT_FOOTPRINT_COPY_CREATE_METHOD_CALLS.recheck],
  ["lexicals-capture", CURRENT_FOOTPRINT_COPY_LEXICAL_CALLS.capture],
  ["lexicals-recheck", CURRENT_FOOTPRINT_COPY_LEXICAL_CALLS.recheck],
] as const;

void test("every original producer inspection has a fixed native encoding limited to footprint purpose", () => {
  const cases = currentFootprintCopyProducerNativeCases();
  assert.equal(cases.length, 4);
  const native = currentPcbWorkerStartupNativeSource();
  for (const [name, contract] of expected) {
    const sample = cases.find(value => value.method === "Runtime.callFunctionOn" && value.params.functionDeclaration === contract.program);
    assert.ok(sample?.method === "Runtime.callFunctionOn");
    const wire = currentFootprintCopyPreparationWire(sample, 264);
    assert.deepEqual(wire.command, { id: 264, ...sample });
    assert.equal(wire.request["startupPhase"], `footprint-producer-${name}`);
    assert.equal(wire.request["requestId"], 264);
    assert.equal(Object.hasOwn(wire.request, "functionDeclaration"), false);
    assert.equal(Object.hasOwn(wire.request, "params"), false);
    assert.ok(native.includes(`phase==@"footprint-producer-${name}"`));
    assert.throws(() => currentPcbWorkerStartupWire(sample, 1));
    assert.throws(() => currentPcb209WorkerStartupWire(sample, 1));
  }
});

void test("producer wire rejects program, effect, scope and argument substitutions before native dispatch", () => {
  for (const sample of currentFootprintCopyProducerNativeCases()) {
    assert.equal(sample.method, "Runtime.callFunctionOn");
    if (sample.method !== "Runtime.callFunctionOn") { assert.fail("Expected fixed function command"); }
    for (const patch of [{ functionDeclaration: `${sample.params.functionDeclaration} ` },
      { throwOnSideEffect: false }, { awaitPromise: true }, { returnByValue: !sample.params.returnByValue },
      { objectGroup: "foreign-group" }, { uniqueContextId: "foreign-context" },
      { arguments: [...sample.params.arguments, { objectId: "foreign-object" }] }]) {
      assert.throws(() => currentFootprintCopyPreparationWire({ ...sample, params: { ...sample.params, ...patch } }, 264));
    }
  }
});
