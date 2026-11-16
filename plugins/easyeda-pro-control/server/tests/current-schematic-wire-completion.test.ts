/** Inert original-source and actual Inspector checks; no connected writer,
 * saved artifact, application or native lifecycle is created by these tests. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { Worker } from "node:worker_threads";
import { CURRENT_SCHEMATIC_WIRE_COMPLETION_ROLES as ROLES, CURRENT_SCHEMATIC_WIRE_COMPLETION_SOURCE as SOURCE, decodeCurrentSchematicWireCompletionFunction as decode, qualifyCurrentSchematicWireCompletionSource as qualify } from "../src/current-schematic-wire-completion-source.ts";
import { CurrentSchematicWireConstructCursor } from "../src/current-schematic-wire-construct-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_CONSTRUCT_REQUESTS as LIMIT, currentSchematicWireConstructCases, currentSchematicWireConstructTemplate, validateCurrentSchematicWireConstructCommand as validate } from "../src/current-schematic-wire-construct-protocol.ts";
import { wireCompletionFunctionFixture } from "./helpers/current-schematic-wire-completion-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

for (const variant of [0, 1] as const) {
  void test(`complete Wire completion variant ${String(variant)} qualifies all 27 original functions and PCs`, { timeout: 60_000 }, async context => {
    const source: string | null = await readConfiguredEasyedaAsset(SOURCE[variant].relativePath);
    if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    assert.equal(qualify({ scriptSource: source }), variant); assert.throws(() => qualify({ scriptSource: `${source} ` }));
    const session = new Session(); session.connect(); let scriptId = "";
    session.on("Debugger.scriptParsed", event => { if (event.params.url.startsWith("wireCompletionOriginal")) { scriptId = event.params.scriptId; } });
    try {
      await session.post("Debugger.enable");
      for (const role of ROLES) {
        // oxlint-disable-next-line typescript/no-inferrable-types -- Explicit string breaks TypeScript 7022 overload inference through Inspector post.
        const expression: string = `${wireCompletionFunctionFixture(source, variant, role)}\n//# sourceURL=wireCompletionOriginal${String(variant)}${role}.js`;
        const raw = await session.post("Runtime.evaluate", { expression, objectGroup: "wire-completion-test", silent: true, generatePreview: false });
        assert.equal(raw.exceptionDetails, undefined); assert.ok(raw.result.objectId !== undefined && scriptId.length > 0);
        const metadata = await session.post("Runtime.getProperties", { objectId: raw.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
        const actualScript = scriptId;
        assert.doesNotThrow(() => decode(metadata, raw.result, variant, role, actualScript), `${role} ${String(raw.result.className)}`);
        assert.throws(() => decode(metadata, raw.result, variant, role, "foreign_script"));
        assert.throws(() => decode(metadata, { ...raw.result, description: `${String(raw.result.description)} ` }, variant, role, actualScript));
        await session.post("Runtime.releaseObjectGroup", { objectGroup: "wire-completion-test" });
      }
    } finally { session.disconnect(); }
  });
}
void test("actual two held native construct bindings consume five plus three readonly requests without issuing construction", { timeout: 20_000 }, async context => {
  const vm = createContext({}); const graph: unknown = runInContext(`let calls=0;class Point{constructor(x,y){calls++;this.x=x;this.y=y;}}
const native=[Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype];
function probe(){debugger;Reflect.construct(Point,[2,4]);debugger;Reflect.construct(Point,[92,6]);}({native,probe,count:()=>calls});`, vm);
  assert.ok(graph !== null && typeof graph === "object"); const key = "__wireConstructInert";
  Object.defineProperty(globalThis, key, { value: graph, configurable: true });
  const done = Promise.withResolvers<unknown>(), worker = new Worker(new URL("helpers/current-schematic-wire-construct-worker.ts", import.meta.url), { workerData: { key } });
  context.after(async () => { Reflect.deleteProperty(globalThis, key); await worker.terminate(); });
  worker.on("error", done.reject); worker.on("message", (value: unknown) => {
    if (value !== null && typeof value === "object" && "ready" in value) {
      const probe: unknown = Reflect.get(graph, "probe"); assert.ok(typeof probe === "function"); Reflect.apply(probe, undefined, []);
    } else { done.resolve(value); }
  });
  const result = await done.promise;
  assert.ok(result !== null && typeof result === "object" && "data" in result, JSON.stringify(result));
  assert.equal(Reflect.get(result, "reads"), LIMIT.normal); assert.equal(Reflect.get(result, "pauses"), 2); assert.equal(Reflect.get(result, "resumed"), 2); assert.equal(Reflect.get(result, "helperSources"), LIMIT.helperSourcesMaximum);
  const count: unknown = Reflect.get(graph, "count"); assert.ok(typeof count === "function"); assert.equal(Reflect.apply(count, graph, []), 2);
  const data: unknown = Reflect.get(result, "data"); assert.ok(data !== null && typeof data === "object"); assert.equal(Reflect.get(data, "originalConstructorInvoked"), false); assert.equal(Reflect.get(data, "executionAuthorized"), false);
});
void test("construct vocabulary refuses mutation, copied reservation, malformed evidence and caller code", () => {
  for (const command of currentSchematicWireConstructCases()) {
    assert.deepEqual(validate(command), command); assert.ok(currentSchematicWireConstructTemplate(command).template.length > 0);
    assert.throws(() => validate({ ...command, params: { ...command.params, callerCode: "value" } }));
    if (command.method === "Runtime.callFunctionOn") { assert.throws(() => validate({ ...command, params: { ...command.params, functionDeclaration: "function(){}" } })); }
  }
  assert.throws(() => validate({ phase: "wire-construct-resume", method: "Debugger.resume", params: {} }));
  const cursor = new CurrentSchematicWireConstructCursor("123.1.2", "native.123");
  const command = cursor.next(); assert.ok(command !== null); assert.throws(() => { cursor.reserve(structuredClone(command)); }); cursor.reserve(command);
  assert.throws(() => { cursor.accept(command, { result: { type: "object", subtype: "proxy", objectId: "forged" } }); }); assert.throws(() => cursor.next()); assert.throws(() => cursor.requireCompleted());
});
