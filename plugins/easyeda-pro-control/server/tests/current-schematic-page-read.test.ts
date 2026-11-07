import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { currentSchematicPageReadRequestSchema, queryCurrentSchematicPageRead, validateCurrentSchematicPageReadArguments, validateCurrentSchematicPageReadResult } from "../src/current-schematic-page-read.ts";
import { buildCurrentSchematicPageReadProgram } from "../src/current-schematic-page-read-program.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { currentSchematicPageReadFixture } from "./helpers/current-schematic-page-read-fixture.ts";
import { queryOfflineApi } from "../src/offline-api.ts";

function read(value: ReturnType<typeof currentSchematicPageReadFixture>, method = "eda.sch_PrimitiveText.getAll",
  argumentsValue: Record<string, unknown> = {}): ReturnType<typeof validateCurrentSchematicPageReadResult> {
  const request = { target: value.target, operation: { method, arguments: argumentsValue } };
  const scope = createContext({ ...value.scope, TextEncoder });
  runInContext("globalThis.window=globalThis;globalThis.top=globalThis;document.defaultView=globalThis;", scope);
  const result: unknown = runInContext(`(function(){${buildCurrentSchematicPageReadProgram(request)}})()`, scope, { timeout: 1000 });
  return validateCurrentSchematicPageReadResult(request, decodeExactReadEnvelope(structuredClone(result)));
}

void test("current209 type-1 reads reuse nonempty Text/Wire/Bus DTOs with exact page/source ownership", () => {
  for (const family of ["Text", "Wire", "Bus"]) {
    const value = currentSchematicPageReadFixture();
    const snapshot = [...value.sources];
    const result = read(value, `eda.sch_Primitive${family}.getAll`);
    assert.equal(result.samples, 2); assert.equal(result.sourceIdsUnchanged, true);
    assert.equal(result.completeSourceVerified, false); assert.equal(result.saveAuthorized, false);
    const rows = result.value; assert.ok(Array.isArray(rows)); assert.equal(rows.length, 1);
    const first = rows[0]; assert.ok(first);
    assert.equal(first.primitiveId, { Text: "m-text", Wire: "z-wire", Bus: "a-bus" }[family]);
    assert.deepEqual([...value.sources], snapshot);
  }
  const value = currentSchematicPageReadFixture();
  const result = read(value, "eda.sch_PrimitiveText.get", { primitiveIds: value.text.id });
  assert.equal(Array.isArray(result.value), true);
});

void test("current209 selected DTOs promote observed line children and preserve supported selection order", () => {
  const value = currentSchematicPageReadFixture(); value.selected.push(value.wire.id);
  const result = read(value, "eda.sch_SelectControl.getSelectedPrimitives"), rows = result.value;
  assert.ok(Array.isArray(rows)); assert.deepEqual(rows.map(row => row.primitiveId), [value.wire.id, value.text.id, value.bus.id]);
  value.selected.length = 0;
  assert.deepEqual(read(value, "eda.sch_SelectControl.getSelectedPrimitives").value, []);
  for (const id of ["component", "inherited-text", "missing"]) {
    value.selected.splice(0, value.selected.length, id);
    assert.throws(() => read(value, "eda.sch_SelectControl.getSelectedPrimitives"));
  }
});

void test("current209 page reads reject type, branch, parent, source, readiness and scalar drift", () => {
  const cases: ((value: ReturnType<typeof currentSchematicPageReadFixture>) => void)[] = [
    value => { value.page["docType"] = 2; }, value => { value.data["doctype"] = 2; },
    value => { value.metadata["branchUuid"] = "e".repeat(32); }, value => { value.page["schematicUuid"] = "e".repeat(16); },
    value => { value.page["source"] = "library-origin"; }, value => { value.page["isBlockSymbolInstancePage"] = true; },
    value => { value.sources.delete(value.text.id); }, value => { value.text["x"] = -0; },
    value => { value.text["value"] = "\uD800"; }, value => { value.shapes["actionRunner"] = { running: true }; },
    value => { Object.defineProperty(value.text, "x", { get: (() => { let x = 0; return (): number => { x += 1; return x; }; })() }); },
  ];
  for (const alter of cases) { const value = currentSchematicPageReadFixture(); alter(value); assert.throws(() => read(value)); }
});

void test("current209 page reads and offline schemas expose no opener, source export, writer or caller code", () => {
  const value = currentSchematicPageReadFixture();
  const request = { target: value.target,
    operation: { method: "eda.sch_PrimitiveText.getAll", arguments: {} } };
  assert.deepEqual(currentSchematicPageReadRequestSchema.parse(request), request);
  const query = queryCurrentSchematicPageRead({ includeSchemas: true });
  assert.equal(query["wrapperAction"], "schematic-page-read"); assert.equal(query["connectedValidation"], false);
  assert.deepEqual(queryOfflineApi({ action: "schematic-page-read" }).result, queryCurrentSchematicPageRead());
  for (const extra of [{ code: "caller" }, { action: "open-page" }, { expectedSource: "caller" }, { save: true }]) {
    assert.equal(validateCurrentSchematicPageReadArguments({ ...request, ...extra })["valid"], false);
  }
  for (const method of ["eda.sch_PrimitivePin.get", "eda.sch_PrimitiveComponent.get", "eda.sys_Document.save", "eda.dmt_EditorControl.openDocument"]) {
    assert.equal(validateCurrentSchematicPageReadArguments({ ...request, operation: { method, arguments: {} } })["valid"], false);
  }
});
