/** Synthetic native-shaped trees only. No application, project or SQL access. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { prepareCurrentPcbRenameStructure, verifyCurrentPcbRenameStructure } from "../src/current-pcb-rename-structure.ts";

const BOARD = "b".repeat(16), OWNER = "a".repeat(32), SCH = "c".repeat(16), SHEET = "d".repeat(16);
const PANEL = "a".repeat(16), PEER = "f".repeat(16), TARGET = "e".repeat(16), UNKNOWN = "9".repeat(16);
const BEFORE = { title: "Target Ω", version: "200", updateTime: 200 };
function fixture(): {
  boards: Record<string, { uuid: string; title: string; zIndex: number }>;
  schematics: Record<string, { uuid: string; name: string; board: string; source: string; version: string; updateTime: number }>;
  sheets: Record<string, { uuid: string; title: string; schematic_uuid: string; zIndex: number; source: string; version: string; updateTime: number }>;
  pcbs: Record<string, { uuid: string; title: string; board: string; zIndex?: number; docType?: number; parent_uuid: string; source: string; version: string; updateTime: number }>;
  panels: Record<string, { uuid: string; title: string; zIndex: null }>;
  blockSymbols: Record<string, unknown>;
  owner: { uuid: string; username: null; nickname: string; avatar: null };
} {
  return { boards: { [BOARD]: { uuid: BOARD, title: "Board", zIndex: 2 } },
    schematics: { [SCH]: { uuid: SCH, name: "Schematic", board: BOARD, source: "", version: "101", updateTime: 101 } },
    sheets: { [SHEET]: { uuid: SHEET, title: "Sheet", schematic_uuid: SCH, zIndex: 1, source: "", version: "102", updateTime: 102 } },
    pcbs: { [PEER]: { uuid: PEER, title: "Keep peer", board: "", parent_uuid: "", source: "", version: "103", updateTime: 103 },
      [TARGET]: { uuid: TARGET, title: BEFORE.title, board: BOARD, parent_uuid: "", source: "", version: BEFORE.version, updateTime: BEFORE.updateTime } },
    panels: { [PANEL]: { uuid: PANEL, title: "Panel", zIndex: null } }, blockSymbols: {},
    owner: { uuid: OWNER, username: null, nickname: "Owner Ω", avatar: null } };
}
function input(structure: unknown = fixture()): {
  structureText: string; targetUuid: string; expectedOwnerUuid: string; expectedBefore: typeof BEFORE; desiredTitle: string; documentTime: number;
} {
  return { structureText: JSON.stringify(structure), targetUuid: TARGET, expectedOwnerUuid: OWNER, expectedBefore: { ...BEFORE }, desiredTitle: "Renamed Ω", documentTime: 201 };
}
function target(structure: ReturnType<typeof fixture>): NonNullable<ReturnType<typeof fixture>["pcbs"][string]> {
  const value = structure.pcbs[TARGET]; assert.ok(value); return value;
}

void test("PCB structure projection changes exactly title/version/updateTime and preserves complete native order", () => {
  const before = fixture(), original = input(before), projection = prepareCurrentPcbRenameStructure(original);
  const expected = fixture(); Object.assign(target(expected), { title: original.desiredTitle, version: "201", updateTime: 201 });
  assert.equal(projection.beforeStructureText, JSON.stringify(before)); assert.equal(projection.afterStructureText, JSON.stringify(expected));
  assert.equal(original.structureText, JSON.stringify(before)); assert.deepEqual(target(before), target(fixture()));
  assert.equal(projection.documentCount, 6); assert.equal(projection.documentTime, 201); assert.equal(projection.targetUuid, TARGET);
  assert.equal(projection.afterStructureSha256, createHash("sha256").update(JSON.stringify(expected)).digest("hex"));
  assert.ok(Object.isFrozen(projection));
  for (const name of ["executionAuthorized", "producerBindingVerified", "completeHistoryVerified", "clockProvenanceVerified", "fullSqlVerified"] as const) {
    assert.equal(projection[name], false);
  }
  const comparison = verifyCurrentPcbRenameStructure(projection, JSON.stringify(expected));
  assert.equal(comparison.exactStructureText, true); assert.equal(comparison.fullSqlVerified, false); assert.equal(comparison.executionAuthorized, false);
  assert.ok(Object.isFrozen(comparison));
});

void test("PCB structure preserves present scalar metadata and omitted optional fields", () => {
  const before = fixture(), old = target(before);
  before.pcbs[TARGET] = { uuid: TARGET, title: old.title, board: old.board, zIndex: 0.5, docType: 3,
    parent_uuid: "", source: "", version: old.version, updateTime: old.updateTime };
  const projection = prepareCurrentPcbRenameStructure(input(before));
  Object.assign(target(before), { title: "Renamed Ω", version: "201", updateTime: 201 });
  assert.equal(projection.afterStructureText, JSON.stringify(before));
  assert.equal(projection.afterStructureText.includes('"zIndex":0.5,"docType":3'), true);
});

void test("PCB structure refuses unknown fields instead of dropping or normalizing them", () => {
  const before = fixture();
  for (const altered of [{ ...before, extra: true }, { ...before, owner: { ...before.owner, extra: true } },
    { ...before, pcbs: { ...before.pcbs, [TARGET]: { ...target(before), extra: true } } },
    { ...before, boards: { [BOARD]: { ...before.boards[BOARD], extra: true } } }]) {
    assert.throws(() => prepareCurrentPcbRenameStructure(input(altered)));
  }
});

void test("PCB structure refuses duplicate keys, alternate encodings and native key-order drift", () => {
  const original = input();
  for (const text of [` ${original.structureText}`, original.structureText.replace('"boards":', '"boards":{},"boards":'),
    original.structureText.replace('"title":"Target Ω"', '"title":"old","title":"Target Ω"'),
    original.structureText.replace('"updateTime":200', '"updateTime":2e2'), original.structureText.replace("Ω", String.raw`\u03a9`),
    original.structureText.replace('"zIndex":2', '"zIndex":-0'),
    original.structureText.replace('"version":"200","updateTime":200', '"updateTime":200,"version":"200"')]) {
    assert.throws(() => prepareCurrentPcbRenameStructure({ ...original, structureText: text }), /serialization/u);
  }
  const { boards, ...rest } = fixture();
  assert.throws(() => prepareCurrentPcbRenameStructure(input({ ...rest, boards })), /serialization/u);
});

void test("PCB structure refuses missing, duplicate or contradictory document identities", () => {
  const before = fixture();
  for (const altered of [{ ...before, pcbs: { [PEER]: before.pcbs[PEER] } },
    { ...before, pcbs: { ...before.pcbs, [TARGET]: { ...target(before), uuid: PEER } } },
    { ...before, panels: { [TARGET]: { uuid: TARGET, title: "Conflicting panel", zIndex: null } } }]) {
    assert.throws(() => prepareCurrentPcbRenameStructure(input(altered)), /identity/u);
  }
});

void test("PCB structure binds the owner and all three baseline target fields", () => {
  const original = input();
  for (const altered of [{ ...original, expectedOwnerUuid: "b".repeat(32) }, { ...original, targetUuid: UNKNOWN }]) {
    assert.throws(() => prepareCurrentPcbRenameStructure(altered), /identity|baseline/u);
  }
  for (const change of [{ title: "Other" }, { version: "199" }, { updateTime: 199 }]) {
    assert.throws(() => prepareCurrentPcbRenameStructure({ ...original, expectedBefore: { ...BEFORE, ...change } }), /baseline/u);
  }
});

void test("PCB structure refuses dangling parents, inheritance, child PCBs and reuse blocks", () => {
  const before = fixture();
  for (const altered of [{ ...before, boards: {} }, { ...before, schematics: {} },
    { ...before, blockSymbols: { [UNKNOWN]: { uuid: UNKNOWN, title: "Block" } } },
    { ...before, schematics: { [SCH]: { ...before.schematics[SCH], source: "inherited" } } }]) {
    assert.throws(() => prepareCurrentPcbRenameStructure(input(altered)));
  }
  for (const change of [{ parent_uuid: PEER }, { source: "inherited" }, { board: UNKNOWN }]) {
    const altered = { ...before, pcbs: { ...before.pcbs, [TARGET]: { ...target(before), ...change } } };
    assert.throws(() => prepareCurrentPcbRenameStructure(input(altered)));
  }
});

void test("PCB structure requires a newer bounded exact document clock", () => {
  for (const documentTime of [200, 199, -1, -0, 200.5, Number.NaN, Infinity, Number.MAX_SAFE_INTEGER, 8_640_000_000_000_001]) {
    assert.throws(() => prepareCurrentPcbRenameStructure({ ...input(), documentTime }));
  }
  const ceiling = prepareCurrentPcbRenameStructure({ ...input(), documentTime: 8_640_000_000_000_000 });
  assert.equal(ceiling.documentTime, 8_640_000_000_000_000); assert.equal(ceiling.clockProvenanceVerified, false);
});

void test("PCB structure rejects unchanged or unsupported desired titles", () => {
  for (const desiredTitle of [BEFORE.title, "", " name", "name ", "line\nbreak", "a".repeat(513)]) {
    assert.throws(() => prepareCurrentPcbRenameStructure({ ...input(), desiredTitle }));
  }
});

void test("PCB structure checks complete observed bytes and requires the original pure projection", () => {
  const projection = prepareCurrentPcbRenameStructure(input());
  for (const text of [projection.beforeStructureText, `${projection.afterStructureText} `,
    projection.afterStructureText.replace("Keep peer", "Changed peer"), projection.afterStructureText.replace("Owner Ω", "Other owner"),
    projection.afterStructureText.replace('"version":"201"', '"version":"202"'), null, {}]) {
    assert.throws(() => verifyCurrentPcbRenameStructure(projection, text), /complete structure/u);
  }
  assert.throws(() => verifyCurrentPcbRenameStructure(structuredClone(projection), projection.afterStructureText), /original/u);
});

void test("PCB structure enforces complete membership and UTF8 byte bounds", () => {
  const before = fixture();
  for (let index = 0; index < 4091; index += 1) {
    const uuid = index.toString(16).padStart(32, "0"); before.boards[uuid] = { uuid, title: "Additional", zIndex: index };
  }
  assert.throws(() => prepareCurrentPcbRenameStructure(input(before)), /membership bound/u);
  assert.throws(() => prepareCurrentPcbRenameStructure({ ...input(), structureText: "Ω".repeat(1_048_577) }), /byte bound/u);
  assert.throws(() => prepareCurrentPcbRenameStructure({ ...input(), structureText: "\uD800" }), /UTF8/u);
});

void test("PCB structure does not invoke caller accessors or accept extra input fields", () => {
  let invoked = false;
  const accessor = Object.defineProperty(input(), "structureText", { get(): string { invoked = true; return ""; } });
  assert.throws(() => prepareCurrentPcbRenameStructure(accessor), /accessors/u); assert.equal(invoked, false);
  const before = Object.defineProperty({ ...BEFORE }, "title", { get(): string { invoked = true; return ""; } });
  assert.throws(() => prepareCurrentPcbRenameStructure({ ...input(), expectedBefore: before }), /accessors/u); assert.equal(invoked, false);
  assert.throws(() => prepareCurrentPcbRenameStructure({ ...input(), extra: true }), /keys/u);
});
