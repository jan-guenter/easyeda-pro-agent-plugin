/** Synthetic native-shaped trees only. No application, project or SQL access. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { prepareCurrentSchematicRenameStructure, verifyCurrentSchematicRenameStructure } from "../src/current-schematic-rename-structure.ts";

const BOARD = "a".repeat(16), OWNER = "a".repeat(32), PEER = "c".repeat(16), SHEET = "d".repeat(16), TARGET = "b".repeat(16);
const PANEL = "f".repeat(16), PCB = "e".repeat(16), UNKNOWN = "9".repeat(16);
const BEFORE = { name: "Container Ω", version: "200", updateTime: 200 };
function fixture(): {
  boards: Record<string, { uuid: string; title: string; zIndex: number }>;
  schematics: Record<string, { uuid: string; name: string; board: string; source: string; version: string; updateTime: number }>;
  sheets: Record<string, { uuid: string; title: string; schematic_uuid: string; docType: number; zIndex: number; source: string; version: string; updateTime: number }>;
  pcbs: Record<string, { uuid: string; title: string; board: string; zIndex: number; docType: number; parent_uuid: string; source: string; version: string; updateTime: number }>;
  panels: Record<string, { uuid: string; title: string; zIndex: null }>;
  blockSymbols: Record<string, unknown>;
  owner: { uuid: string; username: null; nickname: string; avatar: null };
} {
  return { boards: { [BOARD]: { uuid: BOARD, title: "Board", zIndex: 2 } },
    schematics: { [PEER]: { uuid: PEER, name: "Keep peer", board: "", source: "", version: "101", updateTime: 101 },
      [TARGET]: { uuid: TARGET, name: BEFORE.name, board: BOARD, source: "", version: BEFORE.version, updateTime: BEFORE.updateTime } },
    sheets: { [SHEET]: { uuid: SHEET, title: "Keep child title", schematic_uuid: TARGET, docType: 1, zIndex: 1, source: "", version: "102", updateTime: 102 } },
    pcbs: { [PCB]: { uuid: PCB, title: "Keep PCB title", board: BOARD, zIndex: 0.5, docType: 3, parent_uuid: "", source: "", version: "103", updateTime: 103 } },
    panels: { [PANEL]: { uuid: PANEL, title: "Panel", zIndex: null } }, blockSymbols: {},
    owner: { uuid: OWNER, username: null, nickname: "Owner Ω", avatar: null } };
}
function input(structure: unknown = fixture()): {
  structureText: string; targetUuid: string; expectedOwnerUuid: string; expectedBefore: typeof BEFORE; desiredTitle: string; documentTime: number;
} {
  return { structureText: JSON.stringify(structure), targetUuid: TARGET, expectedOwnerUuid: OWNER, expectedBefore: { ...BEFORE }, desiredTitle: "Renamed Ω", documentTime: 201 };
}
function target(value: ReturnType<typeof fixture>): NonNullable<ReturnType<typeof fixture>["schematics"][string]> {
  const selected = value.schematics[TARGET]; assert.ok(selected); return selected;
}
void test("SCH structure changes only container name/version/time while preserving every child and peer", () => {
  const expected = fixture(), original = input(), projection = prepareCurrentSchematicRenameStructure(original);
  Object.assign(target(expected), { name: "Renamed Ω", version: "201", updateTime: 201 });
  assert.equal(projection.beforeStructureText, input().structureText); assert.equal(original.structureText, input().structureText);
  assert.equal(projection.afterStructureText, JSON.stringify(expected)); assert.equal(projection.documentCount, 6);
  assert.equal(projection.beforeStructureSha256, createHash("sha256").update(original.structureText).digest("hex"));
  assert.equal(projection.afterStructureSha256, createHash("sha256").update(JSON.stringify(expected)).digest("hex"));
  assert.ok(Object.isFrozen(projection));
  const comparison = verifyCurrentSchematicRenameStructure(projection, JSON.stringify(expected));
  assert.equal(comparison.exactStructureText, true); assert.ok(Object.isFrozen(comparison));
  for (const name of ["executionAuthorized", "producerBindingVerified", "completeHistoryVerified", "actorProvenanceVerified",
    "clockProvenanceVerified", "nativeNamePolicyVerified", "queueCompletionVerified", "fullSqlVerified", "reopened"] as const) {
    assert.equal(projection[name], false); assert.equal(comparison[name], false);
  }
});
void test("SCH structure accepts a free empty container without inventing sheets or board links", () => {
  const original = fixture(); target(original).board = ""; original.sheets = {};
  const projection = prepareCurrentSchematicRenameStructure(input(original));
  Object.assign(target(original), { name: "Renamed Ω", version: "201", updateTime: 201 });
  assert.equal(projection.afterStructureText, JSON.stringify(original)); assert.equal(projection.documentCount, 5);
});
void test("SCH structure refuses unknown fields and PCB/sheet-shaped target properties", () => {
  const before = fixture();
  for (const altered of [{ ...before, extra: true }, { ...before, owner: { ...before.owner, extra: true } },
    { ...before, sheets: { [SHEET]: { ...before.sheets[SHEET], extra: true } } }]) {
    assert.throws(() => prepareCurrentSchematicRenameStructure(input(altered)));
  }
  for (const change of [{ extra: true }, { title: BEFORE.name }, { schematic_uuid: PEER }, { parent_uuid: "" }, { zIndex: null }]) {
    assert.throws(() => prepareCurrentSchematicRenameStructure(input({ ...before, schematics: { ...before.schematics, [TARGET]: { ...target(before), ...change } } })));
  }
});
void test("SCH structure refuses duplicate keys, alternate number/string encodings and native order drift", () => {
  const original = input();
  for (const structureText of [` ${original.structureText}`, original.structureText.replace('"boards":', '"boards":{},"boards":'),
    original.structureText.replace('"name":"Container Ω"', '"name":"old","name":"Container Ω"'),
    original.structureText.replace('"updateTime":200', '"updateTime":2e2'), original.structureText.replace("Ω", String.raw`\u03a9`),
    original.structureText.replace('"zIndex":2', '"zIndex":-0'),
    original.structureText.replace('"version":"200","updateTime":200', '"updateTime":200,"version":"200"')]) {
    assert.throws(() => prepareCurrentSchematicRenameStructure({ ...original, structureText }), /serialization/u);
  }
});
void test("SCH structure binds all target baseline fields and refuses ambiguous or dangling membership", () => {
  const before = fixture(), original = input();
  for (const change of [{ name: "Wrong" }, { version: "199" }, { updateTime: 199 }]) {
    assert.throws(() => prepareCurrentSchematicRenameStructure({ ...original, expectedBefore: { ...BEFORE, ...change } }), /baseline/u);
  }
  for (const altered of [{ ...before, boards: {} }, { ...before, schematics: { [PEER]: before.schematics[PEER] } },
    { ...before, schematics: { ...before.schematics, [TARGET]: { ...target(before), uuid: PEER } } },
    { ...before, panels: { [TARGET]: { uuid: TARGET, title: "Conflict", zIndex: null } } }]) {
    assert.throws(() => prepareCurrentSchematicRenameStructure(input(altered)), /identity/u);
  }
  assert.throws(() => prepareCurrentSchematicRenameStructure({ ...original, expectedOwnerUuid: "b".repeat(32) }), /identity/u);
  assert.throws(() => prepareCurrentSchematicRenameStructure({ ...original, targetUuid: UNKNOWN }), /identity/u);
});
void test("SCH structure refuses inherited containers, child-PCB hierarchies and reuse symbols", () => {
  const before = fixture();
  for (const altered of [{ ...before, schematics: { ...before.schematics, [TARGET]: { ...target(before), source: "inherited" } } },
    { ...before, blockSymbols: { [UNKNOWN]: { uuid: UNKNOWN, title: "Block" } } },
    { ...before, pcbs: { [PCB]: { ...before.pcbs[PCB], parent_uuid: UNKNOWN } } }]) {
    assert.throws(() => prepareCurrentSchematicRenameStructure(input(altered)));
  }
});
void test("SCH structure requires a newer bounded clock and changed supported title", () => {
  for (const documentTime of [200, 199, -1, -0, 200.5, Number.NaN, Infinity, 8_640_000_000_000_001]) {
    assert.throws(() => prepareCurrentSchematicRenameStructure({ ...input(), documentTime }));
  }
  for (const desiredTitle of [BEFORE.name, "", " leading", "trailing ", "line\nbreak", "a".repeat(513)]) {
    assert.throws(() => prepareCurrentSchematicRenameStructure({ ...input(), desiredTitle }));
  }
});
void test("SCH structure complete comparison rejects child/PCB/peer effects and copied projections", () => {
  const projection = prepareCurrentSchematicRenameStructure(input());
  for (const observed of [projection.beforeStructureText, `${projection.afterStructureText} `,
    projection.afterStructureText.replace("Keep child title", "Changed child"), projection.afterStructureText.replace("Keep PCB title", "Changed PCB"),
    projection.afterStructureText.replace("Keep peer", "Changed peer"), projection.afterStructureText.replace("Owner Ω", "Changed owner"), null, {}]) {
    assert.throws(() => verifyCurrentSchematicRenameStructure(projection, observed), /complete structure/u);
  }
  assert.throws(() => verifyCurrentSchematicRenameStructure(structuredClone(projection), projection.afterStructureText), /original/u);
});
void test("SCH structure enforces total membership, UTF8 and byte bounds", () => {
  const before = fixture();
  for (let index = 0; index < 4091; index += 1) {
    const uuid = index.toString(16).padStart(32, "0"); before.boards[uuid] = { uuid, title: "Additional", zIndex: index };
  }
  assert.throws(() => prepareCurrentSchematicRenameStructure(input(before)), /membership bound/u);
  assert.throws(() => prepareCurrentSchematicRenameStructure({ ...input(), structureText: "Ω".repeat(1_048_577) }), /byte bound/u);
  assert.throws(() => prepareCurrentSchematicRenameStructure({ ...input(), structureText: "\uD800" }), /UTF8/u);
});
void test("SCH structure rejects accessors without invoking them and snapshots the supplied comparison", () => {
  let calls = 0;
  const getter = (): string => { calls += 1; return ""; };
  assert.throws(() => prepareCurrentSchematicRenameStructure(Object.defineProperty(input(), "structureText", { get: getter })), /accessors/u);
  const expectedBefore = Object.defineProperty({ ...BEFORE }, "name", { get: getter });
  assert.throws(() => prepareCurrentSchematicRenameStructure({ ...input(), expectedBefore }), /accessors/u);
  assert.equal(calls, 0); assert.throws(() => prepareCurrentSchematicRenameStructure({ ...input(), extra: true }), /keys/u);
  const original = input(), projection = prepareCurrentSchematicRenameStructure(original); original.expectedBefore.name = "Changed";
  assert.equal(verifyCurrentSchematicRenameStructure(projection, projection.afterStructureText).exactStructureText, true);
});
