/** Actual collector/protocol with an explicit inert original-origin/source
 * issuer seam. No app constructor, action, setter, Save or native owner runs. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CurrentSchematicDisplayActionObserver } from "../src/current-schematic-display-action-observer.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_CALLEES as ROLES, GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as SOURCES } from "../src/generated-schematic-display-action-source.ts";
import { currentSchematicDisplayActionNativeCases, validateCurrentSchematicDisplayActionCommand } from "../src/current-schematic-display-action-protocol.ts";
import { currentSchematicDisplayActionTemplates, currentSchematicDisplayActionWire } from "../src/current-schematic-display-action-wire.ts";

function field(name: string, value: unknown, writable = true, enumerable = true, configurable = true): unknown { return { name, value, writable, enumerable, configurable, isOwn: true }; }
async function fixture(fault = false): Promise<Readonly<{ observer: CurrentSchematicDisplayActionObserver; calls: string[]; refused: () => boolean; copy: () => unknown; owner: object; argumentsValue: object }>> {
  const owner = Object.freeze({ inertOwner: true }); const argumentsValue = Object.freeze({ inertArguments: true }); const origin = Object.freeze({ inertOriginalOrigin: true });
  const calls: string[] = []; let failed = false;
  const bindings = Object.freeze({ holderObjectId: "original-holder", targetJson: "{}", operationJson: "{}", assertCurrent: (): Promise<void> => Promise.resolve(), fail: (): void => { failed = true; },
    request: (input: unknown): Promise<unknown> => {
      const c = validateCurrentSchematicDisplayActionCommand(input); calls.push(c.phase);
      if (c.phase === "schematic-action-preflight") { return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", description: "Array(18)", objectId: "original-callees" } }); }
      if (c.phase === "schematic-action-source") { assert.equal(c.params.scriptId, "actual-script"); return Promise.resolve({ scriptSource: "explicit inert full-source qualification seam" }); }
      if (c.phase === "schematic-action-same") { assert.equal(c.params.objectId, "original-callees"); return Promise.resolve({ result: { type: "boolean", value: true } }); }
      assert.equal(c.phase, "schematic-action-properties"); assert.equal(c.method, "Runtime.getProperties");
      if (c.params.objectId === "original-callees") { return Promise.resolve({ result: [...ROLES.map((role, i) => field(String(i), { type: "function", className: "Function", description: role, objectId: `function.${role}` })), field("length", { type: "number", value: 18 }, true, false, false)], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", objectId: "array-prototype" } }] }); }
      const role = ROLES.find(r => c.params.objectId === `function.${r}`); assert.ok(role !== undefined); const m = SOURCES[0].methods[role];
      const prototype = m.kind === "class" || m.kind === "regular";
      return Promise.resolve({ result: [field("name", { type: "string", value: fault && role === "runnerRun" ? "foreign" : m.name }, false, false), field("length", { type: "number", value: m.arity }, false, false), ...(prototype ? [field("prototype", { type: "object", objectId: `prototype.${role}` }, m.kind === "regular", false, false)] : [])], internalProperties: [
        { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "actual-script", lineNumber: m.lineNumber, columnNumber: m.columnNumber } } },
        { name: "[[Prototype]]", value: { type: "function", objectId: "function-prototype" } }, { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: `scopes.${role}` } }] });
    } });
  const replacements: Readonly<Record<string, unknown>> = {
    "./current-pcb-diagnostic-owner.ts": { requireOriginalCurrentSchematicDisplayActionOrigin: (o: unknown, actual: unknown, a: unknown): typeof bindings => { assert.equal(o, origin); assert.equal(actual, owner); assert.equal(a, argumentsValue); return bindings; } },
  };
  const url = new URL("../src/current-schematic-display-action-observer.ts", import.meta.url); const sourceRequire = createRequire(url);
  const source = await readFile(url, "utf8"); const compiled = await transform(source, { loader: "ts", format: "cjs", target: "node24" }); const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name in replacements) { return replacements[name]; } const original: unknown = sourceRequire(name);
    if (name !== "./generated-schematic-display-action-replies.ts") { return original; } assert.ok(original !== null && typeof original === "object");
    return { ...original, qualifyGeneratedSchematicDisplayActionSource: (): 0 => 0, requireGeneratedSchematicDisplayActionDescription: (text: string, _source: number, role: string): void => { assert.equal(text, role); } };
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentSchematicDisplayActionObserver"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only explicit inert origin and supplied-source issuers differ; original collector, method metadata decoders and protocol stay unchanged.
  const observer = Reflect.construct(Constructor, [origin, owner, argumentsValue]) as CurrentSchematicDisplayActionObserver;
  return { observer, calls, refused: (): boolean => failed, copy: (): unknown => Reflect.construct(Constructor, [{ ...origin }, owner, argumentsValue]), owner, argumentsValue };
}
void test("original idle action collector binds all18 actual function metadata and leaves setter authority false", async () => {
  assert.throws(() => Reflect.construct(CurrentSchematicDisplayActionObserver, [{}, {}, {}]), /SCHEMATIC_ACTION_ORIGINAL_ORIGIN/u);
  const f = await fixture(); assert.throws(f.copy); const p = await f.observer.observe(); assert.equal(f.calls.length, 22); assert.equal(p.originalFunctions, 18);
  assert.equal(p.activeFirstSetterObserved || p.modifyAuthorized || p.saveAuthorized, false); assert.equal(f.refused(), false);
  const requireData: unknown = Reflect.get(f.observer, "requireData"); assert.ok(typeof requireData === "function"); assert.throws(() => Reflect.apply(requireData, f.observer, [{ ...p }, f.owner, f.argumentsValue])); await assert.rejects(f.observer.observe(), /CONSUMED/u);
});
void test("an original-location function substitution fails before idle graph completion", async () => {
  const f = await fixture(true); await assert.rejects(f.observer.observe(), /NAME_ARITY/u); assert.equal(f.refused(), true); assert.equal(f.calls.includes("schematic-action-same"), false);
});
void test("five fixed native rows omit initial holder/target selectors and refuse code or resume", () => {
  const rows = currentSchematicDisplayActionNativeCases(); assert.equal(rows.length, 5); const templates = currentSchematicDisplayActionTemplates();
  const first = currentSchematicDisplayActionWire(rows[0], 23); assert.deepEqual(first.request, { action: "schematic-display-action", requestId: 23, phase: "schematic-action-preflight", method: "Runtime.callFunctionOn" });
  assert.equal(templates[0]?.template.includes("__schematic_action_boundHolder__"), true);
  assert.throws(() => validateCurrentSchematicDisplayActionCommand({ ...rows[0], method: "Debugger.resume" }));
  assert.throws(() => validateCurrentSchematicDisplayActionCommand({ ...rows[0], callerCode: "void 0" }));
});
