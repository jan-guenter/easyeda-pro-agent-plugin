/** Real metadata observer with explicit original-origin/inspector seams. Full
 * installed SCH source and all metadata decoders run; no app method executes. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentSchematicRelevanceDisplayAccessorObserver } from "../src/current-schematic-relevance-display-accessor-observer.ts";
import type { CurrentSchematicDisplayAccessorCommand } from "../src/current-schematic-display-accessor-protocol.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CALLEES as CALLEES, GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE as SOURCES } from "../src/generated-schematic-display-accessor-source.ts";
import type { GeneratedSchematicDisplayAccessorRole } from "../src/generated-schematic-display-accessor-source.ts";

async function installedSource(context: TestContext): Promise<string | null> {
  try { return await readFile(`/mnt/c/Program Files/EasyEDA-Pro/resources/app/assets/${SOURCES[0].relativePath}`, "utf8"); }
  catch (error) { if (error instanceof Error && "code" in error && error.code === "ENOENT") { context.skip("Pinned installed SCH source is unavailable in this source-only CI environment."); return null; } throw error; }
}
function addNames(fields: readonly Readonly<{ name: string }>[], names: Set<string>): void { for (const field of fields) { names.add(field.name); } }
const prop = (name: string, value: unknown, writable = true, enumerable = true, configurable = true): unknown => ({ name, value, writable, enumerable, configurable, isOwn: true });
const array = (values: unknown[]): unknown => ({ result: [...values.map((value, index) => prop(String(index), value)), prop("length", { type: "number", value: values.length }, true, false, false)], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", objectId: "array-prototype" } }] });
function scopes(id: string): unknown { return ({ result: [prop("0", { type: "object", subtype: "internal#scope", className: "Object", objectId: `scope:${id.slice("scopes:".length)}`, description: "Closure" }),
    prop("1", { type: "object", subtype: "internal#scope", className: "Object", objectId: "scope-global", description: "Global" })] }); }
async function fixture(text: string, fault: "none" | "validator" | "raw" | "ast" = "none"): Promise<Readonly<{ observer: CurrentSchematicRelevanceDisplayAccessorObserver; state: { normal: number; cleanup: number; failed: boolean; exited: boolean }; owner: object; args: object; origin: object }>> {
  const source = SOURCES[0];
  const owner = Object.freeze({ explicitOriginalOwnerSeam: true }); const origin = Object.freeze({ explicitOriginSeam: true }); const args = Object.freeze({ explicitArgumentsSeam: true });
  const state = { normal: 0, cleanup: 0, failed: false, exited: false };
  const roleFor = (id: string): GeneratedSchematicDisplayAccessorRole => {
    if (id.startsWith("rawSetter:")) { const field = id.slice("rawSetter:".length); const role = `${field}.set`; assert.ok(Object.hasOwn(source.methods, role));
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Complete source profile membership checked immediately above; only fixed field cases enter this test fixture.
      return role as GeneratedSchematicDisplayAccessorRole;
    }
    if (id.startsWith("decoratorSetter:")) { return "decoratorSetter"; } if (id.startsWith("decoratorAccessor:")) { return "decoratorAccessor"; } if (id === "monitor:ast") { return "monitorAst"; }
    const role = id.slice("callee:".length); const found = CALLEES.find(value => value === role); assert.ok(found !== undefined);
    return found.endsWith(".set") && !["x.set", "y.set"].includes(found) ? "decoratedSetter" : found;
  };
  const fn = (id: string): unknown => { const method = source.methods[roleFor(id)]; const description = text.slice(method.start, method.end); return { type: "function", className: "Function", objectId: id, description: fault === "raw" && id.startsWith("rawSetter:") ? `${description} ` : description }; };
  const metadata = (id: string): unknown => {
    const method = source.methods[roleFor(id)]; const values = [prop("name", { type: "string", value: method.name }, false, false), prop("length", { type: "number", value: method.arity }, false, false)];
    if (method.kind === "regular" || method.kind === "class") { values.push(prop("prototype", { type: "object", className: "Object", objectId: `prototype:${id}` }, method.kind === "regular", false, false)); }
    if (roleFor(id) === "decoratedSetter") { values.push(prop("arguments", { type: "object", subtype: "null", value: null }, false, false, false), prop("caller", { type: "object", subtype: "null", value: null }, false, false, false)); }
    return { result: values, internalProperties: [{ name: "[[Prototype]]", value: { type: "function", objectId: "function-prototype", description: "function () { [native code] }" } },
      { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "sch-script", lineNumber: method.lineNumber, columnNumber: method.columnNumber } } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: `scopes:${id}`, description: "Scopes[2]" } }] };
  };
  const scope = (id: string): unknown => {
    const key = id.slice("scope:".length);
    if (key === "callee:monitorSetAttribute" || key === "monitor:ast") { throw new Error("own7 must not invent a scope-this lookup"); }
    if (key === "callee:monitorRecord") { return { result: fault === "ast" ? [] : [prop("t", fn("monitor:ast"))] }; }
    if (key.startsWith("decoratorSetter:")) { return { result: [prop("e", fault === "validator" ? { type: "function", className: "Function", objectId: "foreign-validator", description: "function(){}" } : { type: "undefined" })] }; }
    const field = key.slice("callee:".length, -".set".length);
    return { result: [prop("a", { type: "object", className: "Object", objectId: `raw:${field}` }), prop("i", { type: "object", className: "Object", objectId: `decorator:${field}` }), prop("t", { type: "string", value: field })] };
  };
  const bindings = Object.freeze({ sessionId: "original-ui", holderObjectId: "original-holder", targetJson: "{}", operationJson: "{}",
    assertCurrent: (): Promise<void> => { assert.equal(state.exited, false); return Promise.resolve(); }, assertOriginalGenerationExited: (): Promise<void> => { assert.equal(state.exited, true); return Promise.resolve(); }, fail: (): void => { state.failed = true; },
    request: (command: CurrentSchematicDisplayAccessorCommand, cleanup: boolean): Promise<unknown> => {
      if (cleanup) { state.cleanup += 1; } else { state.normal += 1; }
      if (command.phase === "schematic-accessor-callees") { return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", description: "Array(26)", objectId: "original-callees" } }); }
      if (command.phase === "schematic-accessor-source") { return Promise.resolve({ scriptSource: text }); }
      if (command.phase === "schematic-accessor-closure") { return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", description: "Array(4)", objectId: `closure:${command.params.arguments[3].value}` } }); }
      if (command.phase === "schematic-accessor-monitor" || command.phase === "schematic-accessor-same") { return Promise.resolve({ result: { type: "boolean", value: true } }); }
      if (command.phase === "schematic-accessor-release") { return Promise.resolve({}); }
      const id = command.params.objectId;
      if (id === "original-callees") { return Promise.resolve(array(CALLEES.map(role => fn(`callee:${role}`)))); }
      if (id.startsWith("closure:")) { const field = id.slice("closure:".length); return Promise.resolve(array([fn(`decoratorSetter:${field}`), fn(`callee:${field}.get`), fn(`rawSetter:${field}`), fn(`decoratorAccessor:${field}`)])); }
      if (id.startsWith("scopes:")) { return Promise.resolve(scopes(id)); } if (id.startsWith("scope:")) { return Promise.resolve(scope(id)); }
      return Promise.resolve(metadata(id));
    } });
  const url = new URL("../src/current-schematic-relevance-display-accessor-observer.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" }); const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => name === "./current-pcb-diagnostic-owner.ts" ? { requireOriginalCurrentSchematicRelevanceDisplayAccessorOrigin: (o: unknown, actual: unknown, a: unknown): unknown => { assert.equal(o, origin); assert.equal(actual, owner); assert.equal(a, args); return bindings; } } : sourceRequire(name) as unknown, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentSchematicRelevanceDisplayAccessorObserver"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Runtime checked production class with explicit original-origin/inspector seams; no app or native owner is allocated.
  const observer = Reflect.construct(Constructor, [origin, owner, args]) as CurrentSchematicRelevanceDisplayAccessorObserver;
  return { observer, state, owner, args, origin };
}
void test("actual observer qualifies complete imported source, all original metadata, decorator validators and monitor AST without pretending a lexical-this receiver join", async context => {
  const text = await installedSource(context); if (text === null) { return; } const f = await fixture(text); const packet = await f.observer.observe(); assert.equal(f.state.normal, 113); assert.equal(packet.schema, "private.current-schematic-relevance-display-accessor-observation.v2"); assert.equal(packet.originalMonitorReceiversQualified, false); assert.equal(packet.watchedMonitorAndAstFunctionMetadataObserved, true); assert.equal(packet.fields, 10); assert.equal(packet.executionAuthorized, false); assert.equal(packet.activeActionHistoryCallbackQualified, false);
  const check: unknown = Reflect.get(f.observer, "requireData"); assert.ok(typeof check === "function"); Reflect.apply(check, f.observer, [packet, f.owner, f.args]); assert.throws(() => Reflect.apply(check, f.observer, [structuredClone(packet), f.owner, f.args]), /ORIGINAL_PACKET_DATA/u);
  const requireFunctions: unknown = Reflect.get(f.observer, "requireFunctions"); assert.ok(typeof requireFunctions === "function"); const functions: unknown = Reflect.apply(requireFunctions, f.observer, [packet, f.origin, f.owner, f.args]); assert.ok(functions !== null && typeof functions === "object"); assert.deepEqual(Reflect.get(functions, "positionGetters"), { x: "callee:x.get", y: "callee:y.get", rotation: "callee:rotation.get", hAlign: "callee:hAlign.get", vAlign: "callee:vAlign.get" }); assert.deepEqual(Reflect.get(functions, "underline"), { getObjectId: "callee:underline.get", setObjectId: "callee:underline.set", rawDescriptorObjectId: "raw:underline", rawGetObjectId: "callee:underline.get", rawSetObjectId: "rawSetter:underline", decoratorObjectId: "decorator:underline", decoratorSetterObjectId: "decoratorSetter:underline", decoratorAccessorObjectId: "decoratorAccessor:underline" });
  await f.observer.release(); assert.equal(f.state.cleanup, 1); await assert.rejects(f.observer.observe(), /CONSUMED/u);
});
void test("changed raw method text and a nonempty original decorator validator refuse before action or metadata replay", async context => {
  const text = await installedSource(context); if (text === null) { return; }
  for (const fault of ["raw", "validator"] as const) { const f = await fixture(text, fault); await assert.rejects(f.observer.observe(), /FUNCTION_DESCRIPTION|VALIDATOR_MUST_BE_UNDEFINED/u); assert.equal(f.state.failed, true); assert.equal(f.observer.retained().phase, fault === "raw" ? "metadata:rotation.set" : "validator:rotation"); const count = f.state.normal; await assert.rejects(f.observer.observe(), /CONSUMED/u); assert.equal(f.state.normal, count); f.state.exited = true; await f.observer.retireAfterOriginalExit(); assert.equal(f.state.cleanup, 0); }
});

void test("missing original record AST binding refuses without a metadata completion token", async context => {
  const text = await installedSource(context); if (text === null) { return; } const f = await fixture(text, "ast"); await assert.rejects(f.observer.observe(), /ORIGINAL_AST_BINDING/u); assert.equal(f.state.failed, true); assert.equal(f.observer.retained().phase, "monitor:record-ast");
});

void test("actual uninvoked monitor arrows expose record.t but no lexical-this property", async context => {
  const text = await installedSource(context); if (text === null) { return; } assert.equal(process.versions.node, "24.18.0"); const profile = SOURCES[0];
  const snippet = (role: "monitorAst" | "monitorRecord" | "monitorSetAttribute"): string => { const row = profile.methods[role]; return text.slice(row.start, row.end); };
  const factory: unknown = runInThisContext(`(function(){"use strict";const t=${snippet("monitorAst")};return[${snippet("monitorSetAttribute")},${snippet("monitorRecord")},t]})`); assert.ok(typeof factory === "function");
  const callbacks: unknown = Reflect.apply(factory, Object.create(null), []); const key = "__inertOwn7MonitorScopes"; Object.defineProperty(globalThis, key, { value: callbacks, configurable: true });
  const session = new Session(); session.connect(); await session.post("Debugger.enable");
  try {
    const result = await session.post("Runtime.evaluate", { expression: `globalThis.${key}`, objectGroup: "inert-own7-monitor-scopes" }); assert.ok(result.result.objectId !== undefined);
    const arrays = await session.post("Runtime.getProperties", { objectId: result.result.objectId, ownProperties: true });
    for (let index = 0; index < 3; index += 1) {
      const id = arrays.result.find(item => item.name === String(index))?.value?.objectId; assert.ok(id !== undefined); const properties = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true });
      const scopesId = properties.internalProperties?.find(item => item.name === "[[Scopes]]")?.value?.objectId; assert.ok(scopesId !== undefined); const queriedScopes = await session.post("Runtime.getProperties", { objectId: scopesId, ownProperties: true }); const names = new Set<string>();
      for (const item of queriedScopes.result) { const value = item.value; if (value?.subtype === "internal#scope" && value.objectId !== undefined && value.description !== undefined && /^(?:Closure|Block)/u.test(value.description)) {
          const fields = await session.post("Runtime.getProperties", { objectId: value.objectId, ownProperties: true }); addNames(fields.result, names);
        }
      }
      assert.equal(names.has("this"), false); if (index === 1) { assert.equal(names.has("t"), true); }
    }
  } finally { await session.post("Runtime.releaseObjectGroup", { objectGroup: "inert-own7-monitor-scopes" }); session.disconnect(); Reflect.deleteProperty(globalThis, key); }
});
