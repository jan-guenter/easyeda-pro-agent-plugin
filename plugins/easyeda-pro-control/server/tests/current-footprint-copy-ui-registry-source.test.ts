/** Exact source spans and local inspector descriptors, never a live editor. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import vm from "node:vm";
import { decodeCurrentFootprintCopyUiRegistryClassScope, decodeCurrentFootprintCopyUiRegistryFunction } from "../src/current-footprint-copy-ui-registry-metadata.ts";
import { CURRENT_FOOTPRINT_COPY_UI_REGISTRY_FUNCTION_NAMES as NAMES, CURRENT_FOOTPRINT_COPY_UI_REGISTRY_SOURCE as SOURCE,
  assertCurrentFootprintCopyUiRegistryFunction, captureCurrentFootprintCopyUiRegistrySourceReply,
  qualifyCurrentFootprintCopyUiRegistrySource, requireCurrentFootprintCopyUiRegistrySource } from "../src/current-footprint-copy-ui-registry-source.ts";
import { FOOTPRINT_COPY_UI_FIXTURE as UI } from "./current-footprint-copy-ui-fixture.ts";
import { FOOTPRINT_COPY_UI_REGISTRY_FIXTURE as FIXTURE } from "./current-footprint-copy-ui-registry-fixture.ts";

void test("preload registry source spans distinguish its original class from the UI duplicate", () => {
  for (const role of NAMES) {
    assertCurrentFootprintCopyUiRegistryFunction(role, FIXTURE[role]);
    for (const bad of [`${FIXTURE[role]} `, FIXTURE[role].slice(1), "", "\uD800", null]) {
      assert.throws(() => { assertCurrentFootprintCopyUiRegistryFunction(role, bad); }, /FOOTPRINT_COPY_UI_REGISTRY_SOURCE/u);
    }
  }
  for (const role of ["registryHas", "registryInstance", "registryContext", "contextProducer"] as const) {
    assert.throws(() => { assertCurrentFootprintCopyUiRegistryFunction(role, UI[role]); }, /FOOTPRINT_COPY_UI_REGISTRY_SOURCE/u);
  }
  assert.throws(() => Reflect.apply(assertCurrentFootprintCopyUiRegistryFunction, undefined, ["constructor", FIXTURE.registryConstructor]));
  assert.ok(Object.isFrozen(SOURCE)); assert.ok(Object.isFrozen(SOURCE.functions)); assert.ok(Object.isFrozen(SOURCE.initialization));
});

void test("full preload qualification refuses snippets and copied authority without inspecting input objects", () => {
  let calls = 0;
  const accessor = Object.defineProperty({}, "source", { get(): never { calls += 1; throw new Error("must not read"); } });
  const proxy = new Proxy({}, { ownKeys(): never { calls += 1; throw new Error("must not inspect"); } });
  for (const bad of [FIXTURE.registryConstructor, {}, accessor, proxy, null, [], "\uD800"] ) {
    assert.throws(() => { qualifyCurrentFootprintCopyUiRegistrySource(bad); }, /FOOTPRINT_COPY_UI_REGISTRY_SOURCE/u);
  }
  for (const bad of [null, proxy, { sourceSha256: SOURCE.sha256, functionCount: 5, runtimeBound: false, executionAuthorized: false }]) {
    assert.throws(() => { requireCurrentFootprintCopyUiRegistrySource(bad); }, /FOOTPRINT_COPY_UI_REGISTRY_SOURCE/u);
  }
  assert.equal(calls, 0);
});

void test("preload reply capture has its own fixed source ceiling and rejects hooks or extra fields", () => {
  const scriptSource = "x".repeat(SOURCE.bytes);
  const reply = captureCurrentFootprintCopyUiRegistrySourceReply({ scriptSource });
  assert.equal(reply.scriptSource, scriptSource); assert.ok(Object.isFrozen(reply));
  let calls = 0;
  const accessor = Object.defineProperty({}, "scriptSource", { enumerable: true, get(): never { calls += 1; throw new Error("must not read"); } });
  const proxy = new Proxy({ scriptSource }, { ownKeys(): never { calls += 1; throw new Error("must not inspect"); } });
  for (const bad of [accessor, proxy, { scriptSource, extra: true }, { scriptSource, [Symbol("extra")]: true },
    { scriptSource: `${scriptSource}x` }, { scriptSource: "é".repeat(Math.ceil(SOURCE.bytes / 2)) }, { scriptSource: "\uD800" }]) {
    assert.throws(() => { captureCurrentFootprintCopyUiRegistrySourceReply(bad); });
  }
  assert.equal(calls, 0); assert.throws(() => { qualifyCurrentFootprintCopyUiRegistrySource(reply.scriptSource); });
});

void test("pinned Node24 proves source coordinates and refuses its legacy ws roster for the V8 14.6 target", async () => {
  const session = new Session(); session.connect();
  const contexts: { id: number; name: string }[] = [];
  session.on("Runtime.executionContextCreated", event => { contexts.push(event.params.context); });
  const group = "preload-registry-source-regression", sideEffectCheck = { throwOnSideEffect: true };
  try {
    await session.post("Runtime.enable");
    const context = vm.createContext({}, { name: group }), opening = "(()=>{";
    // Line and column coordinates come from the pinned original bundle. Only
    // These declarations run; no constructor, lazy getter or producer is called.
    const source = `${opening}${" ".repeat(48_208 - opening.length)}${FIXTURE.contextProducer}${"\n".repeat(27)}${" ".repeat(4953)}var Yd=${FIXTURE.registryConstructor};Yd.LIB_ID_PREFFIX="extend_lib_";globalThis.fns={registryConstructor:Yd,registryHas:Yd.prototype.hasLib,registryInstance:Yd.getInstance,registryContext:Object.getOwnPropertyDescriptor(Yd,"context").get,contextProducer:ws}})();`;
    vm.runInContext(source, context, { filename: "preload-registry-source-regression.js" });
    const original = contexts.find(value => value.name === group); assert.ok(original !== undefined);
    const evaluated = await session.post("Runtime.evaluate", { expression: "fns", contextId: original.id, objectGroup: group });
    assert.ok(evaluated.result.objectId !== undefined);
    const values = await session.post("Runtime.getProperties", { objectId: evaluated.result.objectId, ownProperties: true });
    let scriptId: string | undefined;
    for (const role of NAMES) {
      const value = values.result.find(item => item.name === role)?.value; assert.ok(value?.objectId !== undefined);
      assertCurrentFootprintCopyUiRegistryFunction(role, value.description);
      const metadata = await session.post("Runtime.getProperties", { objectId: value.objectId, ownProperties: true,
        accessorPropertiesOnly: false, generatePreview: false });
      if (role === "contextProducer") {
        assert.deepEqual(metadata.result.map(item => item.name).toSorted(), ["arguments", "caller", "length", "name", "prototype"]);
        const location: unknown = metadata.internalProperties?.find(item => item.name === "[[FunctionLocation]]")?.value?.value;
        const expectedScriptId = scriptId;
        assert.deepEqual(location, { scriptId: expectedScriptId, lineNumber: SOURCE.functions.contextProducer.lineNumber, columnNumber: SOURCE.functions.contextProducer.columnNumber });
        assert.throws(() => decodeCurrentFootprintCopyUiRegistryFunction(metadata, role, expectedScriptId), /FOOTPRINT_COPY_UI_REGISTRY_METADATA/u);
      } else {
        const decoded = decodeCurrentFootprintCopyUiRegistryFunction(metadata, role, scriptId); scriptId ??= decoded.scriptId;
        assert.equal(decoded.scriptId, scriptId); assert.ok(decoded.scopesId.length > 0);
        assert.throws(() => decodeCurrentFootprintCopyUiRegistryFunction(metadata, role, "other-script"), /FOOTPRINT_COPY_UI_REGISTRY_METADATA/u);
        if (role === "registryContext") {
          const scopes = decodeCurrentFootprintCopyUiRegistryClassScope(await session.post("Runtime.getProperties", { objectId: decoded.scopesId, ownProperties: true }));
          const constructor = values.result.find(item => item.name === "registryConstructor")?.value?.objectId; assert.ok(constructor !== undefined);
          // Inspect the actual internal#scope call receiver, including its Block
          // Envelope. A direct scope.sl lookup would miss the lexical binding.
          const relation = await session.post("Runtime.callFunctionOn", { objectId: scopes.blockScopeId,
            functionDeclaration: 'function(original){const d=Object.getOwnPropertyDescriptor(this,"description"),o=Object.getOwnPropertyDescriptor(this,"object");if(!d||d.value!=="Block"||!o||!Object.hasOwn(o,"value"))throw Error("BLOCK");const binding=Object.getOwnPropertyDescriptor(o.value,"sl");return !!binding&&Object.hasOwn(binding,"value")&&binding.value===original}',
            arguments: [{ objectId: constructor }], returnByValue: true, ...sideEffectCheck });
          assert.equal(relation.exceptionDetails, undefined); assert.equal(relation.result.value, true);
        }
      }
    }
  } finally {
    try { await session.post("Runtime.releaseObjectGroup", { objectGroup: group }); }
    finally { session.disconnect(); }
  }
});
