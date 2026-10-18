/** Supplied-data tests only. This module has no live preflight route. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCurrentSchematicRenamePreflightRequest } from "../src/current-schematic-rename-preflight.ts";

const target = { projectUuid: "1".repeat(64), branchUuid: "2".repeat(32), schematicUuid: "3".repeat(16), ownerUuid: "4".repeat(32) };
const expectedBefore = { name: "source sch", displayName: "Source SCH", source: "", version: "42", boardUuid: "", ticket: 51, updateTime: 42 };
function input(): { target: typeof target; expectedBefore: typeof expectedBefore; desiredTitle: string } {
  return { target: { ...target }, expectedBefore: { ...expectedBefore }, desiredTitle: "Renamed SCH" };
}
void test("SCH preflight input preserves native name/displayName without PCB-only fields or authority", () => {
  const original = input(), parsed = parseCurrentSchematicRenamePreflightRequest(original);
  assert.deepEqual(parsed, original); assert.ok(Object.isFrozen(parsed));
  assert.ok(Object.isFrozen(parsed.target)); assert.ok(Object.isFrozen(parsed.expectedBefore));
  original.expectedBefore.name = "changed"; assert.equal(parsed.expectedBefore.name, expectedBefore.name);
  for (const key of ["executionAuthorized", "runtimeObservation", "permissionVerified", "writerAuthority"]) { assert.equal(Object.hasOwn(parsed, key), false); }
});
void test("SCH preflight refuses unknown, PCB/sheet-shaped and inherited source inputs", () => {
  for (const candidate of [{ ...input(), extra: true }, { ...input(), target: { ...target, pcbUuid: target.schematicUuid } },
    { ...input(), target: { ...target, sheetUuid: target.schematicUuid } },
    { ...input(), expectedBefore: { ...expectedBefore, docType: 1 } }, { ...input(), expectedBefore: { ...expectedBefore, parentUuid: "" } },
    { ...input(), expectedBefore: { ...expectedBefore, title: expectedBefore.name } },
    { ...input(), expectedBefore: { ...expectedBefore, source: "inherited" } }, { ...input(), expectedBefore: { ...expectedBefore, version: "" } }]) {
    assert.throws(() => parseCurrentSchematicRenamePreflightRequest(candidate));
  }
  for (const desiredTitle of [expectedBefore.displayName, "source sch", "", " leading", "trailing ", "line\nbreak", "a".repeat(513), "Unqualified I", "Ω", "\uD800"]) {
    assert.throws(() => parseCurrentSchematicRenamePreflightRequest({ ...input(), desiredTitle }));
  }
  assert.throws(() => parseCurrentSchematicRenamePreflightRequest({ ...input(), expectedBefore: { ...expectedBefore, name: "unrelated" } }));
  for (const value of [-0, -1, 1.5, Number.NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => parseCurrentSchematicRenamePreflightRequest({ ...input(), expectedBefore: { ...expectedBefore, ticket: value } }));
  }
});
void test("SCH preflight rejects accessors and inherited fields without evaluating getters", () => {
  let calls = 0; const get = (): never => { calls += 1; throw new Error("unexpected getter"); };
  for (const key of Object.keys(input())) { assert.throws(() => parseCurrentSchematicRenamePreflightRequest(Object.defineProperty(input(), key, { get })), /SHAPE/u); }
  assert.throws(() => parseCurrentSchematicRenamePreflightRequest({ ...input(), target: Object.defineProperty({ ...target }, "schematicUuid", { get }) }), /SHAPE/u);
  assert.throws(() => parseCurrentSchematicRenamePreflightRequest({ ...input(), expectedBefore: Object.defineProperty({ ...expectedBefore }, "name", { get }) }), /SHAPE/u);
  assert.throws(() => parseCurrentSchematicRenamePreflightRequest(Object.create(input())), /SHAPE/u); assert.equal(calls, 0);
});
