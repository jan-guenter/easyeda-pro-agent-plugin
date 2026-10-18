/** Synthetic historical header shapes; no current producer admission. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentSchematicStoredHeaderSchema } from "../src/current-schematic-stored-header.ts";

const HEADER = { docType: "SCH", client: "a".repeat(16), uuid: "b".repeat(16), updateTime: 200, version: "200" };
const USER = { uuid: "c".repeat(32), nickname: "Historical Ω", username: "", avatar: "image-reference" };
void test("SCH stored header preserves optional historical account without issuing authority", () => {
  assert.deepEqual(currentSchematicStoredHeaderSchema.parse(HEADER), HEADER);
  const full = { ...HEADER, editVersion: "3.2.206", user: USER };
  assert.deepEqual(currentSchematicStoredHeaderSchema.parse(full), full);
  assert.deepEqual(currentSchematicStoredHeaderSchema.parse({ ...HEADER, uuid: "b".repeat(32) }), { ...HEADER, uuid: "b".repeat(32) });
});
void test("SCH stored header refuses sheet/PCB headers and unsupported account shapes", () => {
  for (const value of [{ ...HEADER, docType: "SCH_PAGE" }, { ...HEADER, docType: "PCB" }, { ...HEADER, parent: "" },
    { ...HEADER, user: null }, { ...HEADER, user: {} }, { ...HEADER, user: { ...USER, extra: true } },
    { ...HEADER, user: { ...USER, nickname: 1 } }, { ...HEADER, user: { ...USER, avatar: "a".repeat(4097) } }]) {
    assert.throws(() => currentSchematicStoredHeaderSchema.parse(value));
  }
});
void test("SCH stored header rejects malformed identity, time and version", () => {
  for (const value of [{ ...HEADER, uuid: "not-id" }, { ...HEADER, client: "a".repeat(32) }, { ...HEADER, version: "" }, { ...HEADER, editVersion: "" }]) {
    assert.throws(() => currentSchematicStoredHeaderSchema.parse(value));
  }
  for (const updateTime of [-0, -1, 0.5, Infinity, Number.NaN, 8_640_000_000_000_001]) {
    assert.throws(() => currentSchematicStoredHeaderSchema.parse({ ...HEADER, updateTime }));
  }
});
