import assert from "node:assert/strict";
import { test } from "node:test";
import { parseDocumentSource } from "../src/document-source.ts";
import { verifySchematicLifecycleEquivalence } from "../src/schematic-lifecycle.ts";
import { schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";

const attr = (id: string, key: string, zIndex: number): { id: string; key: string; value: string; symbolValue: string; blockValue: null; instanceValue: null; body: Record<string, unknown> } => ({ id, key, value: key, symbolValue: key, blockValue: null, instanceValue: null, body: { x: null, y: null, key, value: key, parentId: "part", zIndex } });
function fixture(reopened: boolean): SchematicNativeSnapshot {
  const stored = attr("stored", "Manufacturer", reopened ? 1 : 2);
  const inherited = attr(reopened ? "b".repeat(16) : "a".repeat(16), "Part", reopened ? 2 : 1);
  const component = { id: "part", kind: "part", locked: false, body: { x: 100, y: 200, rotation: 0, isMirror: false }, pins: [], attributes: [stored, inherited].toSorted((a, b) => a.id.localeCompare(b.id)) };
  const records = [{ id: "part", type: "COMPONENT", body: component.body }, { id: stored.id, type: "ATTR", body: stored.body }];
  const source = `{"type":"DOCHEAD"}||${JSON.stringify({ uuid: "doc", docType: "SCH_PAGE", editVersion: "3.2.149.88089769" })}|\n${records.map((entry) => `${JSON.stringify({ id: entry.id, type: entry.type })}||${JSON.stringify(entry.body)}|\n`).join("")}`;
  return schematicNativeSnapshotSchema.parse({ profile: "easyeda-pro-control.schematic-native.v1", document: { documentUuid: "doc", tabId: "doc@project" }, source, components: [component] });
}
function verify(before: SchematicNativeSnapshot, after: SchematicNativeSnapshot): ReturnType<typeof verifySchematicLifecycleEquivalence> {
  return verifySchematicLifecycleEquivalence(parseDocumentSource(before.source), before, parseDocumentSource(after.source), after);
}
void test("lifecycle aligns only virtual IDs and null-position sibling-order permutations without changing raw evidence", () => {
  const before = fixture(false);
  const after = fixture(true);
  const original = JSON.stringify(after);
  const result = verify(before, after);
  assert.equal(result.changes.length, 2);
  assert.equal(result.changes.find((entry) => entry.stored)?.afterId, "stored");
  assert.notEqual(result.sourceBeforeSha256, result.sourceAfterSha256);
  assert.equal(JSON.stringify(after), original);
  const changed = structuredClone(after);
  const inherited = changed.components[0]?.attributes.find((entry) => entry.key === "Part");
  assert.ok(inherited);
  inherited.value = "wrong";
  assert.throws(() => verify(before, changed), /changed content/u);
  inherited.value = "Part";
  inherited.body["zIndex"] = 7;
  assert.throws(() => verify(before, changed), /non-permutation/u);
  inherited.body["zIndex"] = 2; inherited.body["x"] = 10;
  assert.throws(() => verify(before, changed), /non-permutation/u);
});
void test("lifecycle rejects replacing a stored identity or changing source metadata", () => {
  const before = fixture(false);
  const after = fixture(true);
  const stored = after.components[0]?.attributes.find((entry) => entry.id === "stored");
  assert.ok(stored);
  stored.id = "c".repeat(16);
  after.source = after.source.replace('"id":"stored"', `"id":"${stored.id}"`);
  assert.throws(() => verify(before, after), /identity changed/u);
  const wrong = fixture(true);
  wrong.source = wrong.source.replace('"editVersion":"3.2.149.88089769"', '"editVersion":"other"');
  assert.throws(() => verify(before, wrong), /version binding/u);
});
