/** Actual synthetic Node children supply readiness/context events. Negative
 * context events are explicitly injected into the same fixture observer; none
 * proves EasyEDA ownership or explains the retained native SIGSEGV. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { ratlineCaptureInspector } from "./helpers/current-pcb-209-ratline-capture-inspector.ts";

void test("synthetic inspector compiles and runs only after original child readiness and in its explicit default context", async context => {
  const fixture = await ratlineCaptureInspector(context, "pcb", 0, false, false, { holdPcbResult: true });
  const original = fixture.originalContext();
  assert.equal(original.childReady, true); assert.ok(Number.isSafeInteger(original.id)); assert.ok(original.uniqueId.length > 0);
  assert.equal(Object.isFrozen(original), true); assert.equal(fixture.originalContext(), original);
  const before = fixture.commands.length;
  await assert.rejects(fixture.request("Runtime.compileScript", { expression: "1", sourceURL: "foreign.js", persistScript: true }), /EXPLICIT_CONTEXT_REQUIRED/u);
  await assert.rejects(fixture.request("Runtime.runScript", { scriptId: fixture.transport.scriptId, executionContextId: original.id + 1 }), /EXPLICIT_CONTEXT_REQUIRED/u);
  assert.equal(fixture.commands.length, before);
  await fixture.run(); assert.equal(fixture.originalContext(), original);
  const ran = await fixture.request("Runtime.evaluate", { expression: 'typeof globalThis.CAPTURE_DONE === "boolean"', contextId: original.id, returnByValue: true });
  assert.deepEqual(ran, { result: { type: "boolean", value: true } });
  fixture.observeContextForTest("Runtime.executionContextCreated", { context: { id: original.id, uniqueId: original.uniqueId, auxData: { isDefault: true } } });
  assert.equal(fixture.originalContext(), original);
  await fixture.terminate(); await assert.rejects(fixture.request("Runtime.enable", {}));
  assert.throws(() => fixture.originalContext());
});

void test("synthetic inspector never adopts a replacement default context after an injected loss or drift event", async context => {
  for (const kind of ["changed-id", "changed-unique-id", "destroyed", "cleared"] as const) {
    await context.test(kind, async nested => {
      const fixture = await ratlineCaptureInspector(nested, "worker");
      const original = fixture.originalContext();
      const before = fixture.commands.length;
      if (kind === "cleared") { fixture.observeContextForTest("Runtime.executionContextsCleared", {}); }
      else if (kind === "destroyed") { fixture.observeContextForTest("Runtime.executionContextDestroyed", { executionContextId: original.id }); }
      else { fixture.observeContextForTest("Runtime.executionContextCreated", { context: { id: original.id + (kind === "changed-id" ? 1 : 0),
        uniqueId: kind === "changed-unique-id" ? `${original.uniqueId}-replacement` : original.uniqueId, auxData: { isDefault: true } } }); }
      assert.throws(() => fixture.originalContext(), /RATLINE_FIXTURE_CONTEXT/u);
      fixture.observeContextForTest("Runtime.executionContextCreated", { context: { id: original.id, uniqueId: original.uniqueId, auxData: { isDefault: true } } });
      await assert.rejects(fixture.request("Runtime.enable", {}), /RATLINE_FIXTURE_CONTEXT/u);
      assert.equal(fixture.commands.length, before); await fixture.terminate();
    });
  }
});

void test("an awaited original inspector request rejects context loss before returning its late native result", async context => {
  const fixture = await ratlineCaptureInspector(context, "worker");
  const original = fixture.originalContext();
  const pending = fixture.request("Runtime.evaluate", { expression: "new Promise(resolve=>setTimeout(()=>resolve(1),25))", contextId: original.id,
    returnByValue: true, awaitPromise: true });
  const refused = assert.rejects(pending, /RATLINE_FIXTURE_CONTEXT_CLEARED/u);
  fixture.observeContextForTest("Runtime.executionContextsCleared", {});
  await refused; const before = fixture.commands.length;
  await assert.rejects(fixture.request("Runtime.evaluate", { expression: "1", contextId: original.id, returnByValue: true }), /CONTEXT_CLEARED/u);
  assert.equal(fixture.commands.length, before); await fixture.terminate();
});

void test("serialized inspector context checks reject toJSON and getter substitutions before inserting a native request", async context => {
  const fixture = await ratlineCaptureInspector(context, "pcb", 0, false, false, { holdPcbResult: true });
  const original = fixture.originalContext();
  const before = fixture.commands.length;
  let serialized = 0;
  let getters = 0;
  const toJson = { scriptId: fixture.transport.scriptId, executionContextId: original.id,
    toJSON(): object { serialized += 1; return { scriptId: fixture.transport.scriptId, executionContextId: original.id + 1 }; } };
  await assert.rejects(fixture.request("Runtime.runScript", toJson), /EXPLICIT_CONTEXT_REQUIRED/u);
  assert.equal(serialized, 1); assert.equal(fixture.commands.length, before);
  const ownGetter = { scriptId: fixture.transport.scriptId, get executionContextId(): number { getters += 1; return original.id + 1; } };
  await assert.rejects(fixture.request("Runtime.runScript", ownGetter), /EXPLICIT_CONTEXT_REQUIRED/u);
  assert.equal(getters, 1); assert.equal(fixture.commands.length, before); assert.equal(fixture.originalContext(), original);
  await fixture.run(); assert.equal(fixture.originalContext(), original);
  const priorLoss = fixture.commands.length;
  const loseDuringSerialization = { scriptId: fixture.transport.scriptId, executionContextId: original.id,
    toJSON(): object { fixture.observeContextForTest("Runtime.executionContextsCleared", {}); return { scriptId: fixture.transport.scriptId, executionContextId: original.id }; } };
  await assert.rejects(fixture.request("Runtime.runScript", loseDuringSerialization), /CONTEXT_CLEARED/u);
  assert.equal(fixture.commands.length, priorLoss); await fixture.terminate();
});
