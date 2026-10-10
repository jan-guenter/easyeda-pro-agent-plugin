import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { expectedNativeEmptyNetDefault } from "../src/native-empty-net-default.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";

function snapshot(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const value = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid: "test", docType: "PCB" }, objects: objects.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...value, sha256: sha256Json(value) };
}

void test("native empty-net correction is one explicit expected field, never a readback normalization", () => {
  const id = '["RULE_SELECTOR",["NET",""]]';
  const before = snapshot([{ id: "opaque", type: "FUTURE", body: { keep: [1, 2] } }, { id, type: "RULE_SELECTOR", body: { ruleOrder: 4, ruleKeyValue: {}, copperValue: {}, innerPlaneValue: {} } }]);
  const expected = expectedNativeEmptyNetDefault(before);
  assert.deepEqual(expected.objects.find((record) => record.id === id)?.body["ruleKeyValue"], { NET_LENGTH_TOLERANCE: ["default", null] });
  assert.equal(expectedNativeEmptyNetDefault(expected), expected);
  assert.deepEqual(expected.objects.filter((record) => record.id !== id), before.objects.filter((record) => record.id !== id));
  const bad = structuredClone(before.objects);
  for (const record of bad) { if (record.id === id) { record.body["ruleKeyValue"] = { TRACK: "custom" }; } }
  assert.throws(() => expectedNativeEmptyNetDefault(snapshot(bad)), /unreviewed overrides/u);
});
