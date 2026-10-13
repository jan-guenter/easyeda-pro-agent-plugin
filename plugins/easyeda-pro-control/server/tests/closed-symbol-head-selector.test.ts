/** Shaped parser inputs only. No original inventory/copy or completed graph is claimed. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseHeadLock, selectBaselineHeadData } from "../src/closed-symbol-head-selector.ts";
import { nativeProjectSymbolSqlSchema } from "../src/native-project-sql-schema.ts";
import type { NativeSqlInventory, SqlCell, SqlRow, SqlTable } from "../src/sqlite-inventory-core.ts";

const plan = { projectUuid: "1".repeat(32), branchUuid: "2".repeat(32), ownerUuid: "3".repeat(32) };
const head = "4".repeat(32), historyName = `project_history_${plan.branchUuid}`;
const defaultLock: SqlCell = { kind: "integer", decimal: "1" };
function text(value: string): SqlCell { return { kind: "text", hex: Buffer.from(value).toString("hex") }; }
function table(name: string, names: readonly string[], values: readonly (readonly SqlCell[])[]): SqlTable {
  return { name, columns: names.map((value) => ({ name: value })), rows: values.map((cells) => ({ rowid: null, cells })),
    withoutRowid: false, strict: false, sha256: "0".repeat(64) };
}
function fixture(lock: SqlCell = defaultLock): NativeSqlInventory {
  return { profile: "easyeda-pro-control.exact-sqlite-inventory.v2", checkpointSha256: "0".repeat(64), schemaSha256: "0".repeat(64),
    logicalSha256: "0".repeat(64), properties: {}, schema: nativeProjectSymbolSqlSchema(plan.branchUuid).entries,
    tables: [table("projects", ["uuid", "branch_uuid", "owner_uuid"], [[text(plan.projectUuid), text(plan.branchUuid), text(plan.ownerUuid)]]),
      table("branches", ["uuid", "project_uuid", "history_uuid"], [[text(plan.branchUuid), text(plan.projectUuid), text(head)]]),
      table(historyName, ["uuid", "is_lock", "created_at"], [[text(head), lock, text("2026-01-15 12:34:56")]])] };
}
function mapTable(value: NativeSqlInventory, name: string, change: (selected: SqlTable) => SqlTable): NativeSqlInventory {
  return { ...value, tables: value.tables.map((selected) => selected.name === name ? change(selected) : selected) };
}
function mapCell(value: NativeSqlInventory, name: string, position: number, replacement: SqlCell): NativeSqlInventory {
  return mapTable(value, name, (selected) => ({ ...selected, rows: selected.rows.map((row) => ({ ...row,
    cells: row.cells.map((cell, index) => index === position ? replacement : cell) })) }));
}

for (const [decimal, expected] of [["1", "locked"], ["0", "aged-unlocked"]] as const) {
  void test(`exact SQL integer ${decimal} selects ${expected}`, async () => {
    const input = fixture({ kind: "integer", decimal });
    const before = JSON.stringify(input), result = await selectBaselineHeadData(plan, input);
    assert.deepEqual(result, { headEligibility: expected, historyUuid: head, createdAtLiteral: "2026-01-15 12:34:56" });
    assert.equal(Object.isFrozen(result), true); assert.equal(JSON.stringify(input), before);
  });
}
const invalidLocks: readonly unknown[] = [undefined, null, true, false, 0, 1, "0", "1", [], {},
  { kind: "integer" }, { decimal: "1" }, { kind: "integer", decimal: 1 }, { kind: "integer", decimal: "2" },
  { kind: "integer", decimal: "-1" }, { kind: "integer", decimal: "01" }, { kind: "integer", decimal: "+1" },
  { kind: "integer", decimal: "-0" }, { kind: "integer", decimal: "1.0" }, { kind: "integer", decimal: "1e0" },
  { kind: "integer", decimal: " 1" }, { kind: "integer", decimal: "1\n" }, { kind: "real", ieee754le: "000000000000f03f" },
  { kind: "text", hex: "31" }, { kind: "blob", hex: "31" }, { kind: "null" }, { kind: "integer", decimal: "1", extra: false }];
for (let index = 0; index < invalidLocks.length; index += 1) {
  void test(`unsupported lock cell ${index} refuses`, () => { assert.throws(() => parseHeadLock(invalidLocks[index]), /head lock/u); });
}
void test("accessor lock refuses without evaluating the accessor", () => {
  let calls = 0;
  const input = { kind: "integer", get decimal(): string { calls += 1; return "1"; } };
  assert.throws(() => parseHeadLock(input), /own integer/u); assert.equal(calls, 0);
});
void test("inherited lock and symbol extension refuse", () => {
  const inherited: unknown = Object.create({ decimal: "1" }, { kind: { value: "integer", enumerable: true } });
  assert.throws(() => parseHeadLock(inherited), /exact SQL/u);
  assert.throws(() => parseHeadLock({ kind: "integer", decimal: "1", [Symbol("extra")]: false }), /exact SQL/u);
});
void test("null-prototype own integer is accepted as data only", () => {
  const input: unknown = Object.assign(Object.create(null), { kind: "integer", decimal: "0" });
  assert.equal(parseHeadLock(input), "aged-unlocked");
});
void test("selected branch head wins over an earlier opposite-lock decoy", async () => {
  const input = mapTable(fixture({ kind: "integer", decimal: "0" }), historyName, (selected) => ({ ...selected,
    rows: [{ rowid: null, cells: [text("5".repeat(32)), { kind: "integer", decimal: "1" }, text("2020-01-01 00:00:00")] }, ...selected.rows] }));
  const result = await selectBaselineHeadData(plan, input); assert.equal(result.headEligibility, "aged-unlocked");
});
void test("only the selected row needs supported lock semantics", async () => {
  const input = mapTable(fixture(), historyName, (selected) => ({ ...selected,
    rows: [...selected.rows, { rowid: null, cells: [text("5".repeat(32)), { kind: "integer", decimal: "2" }, text("2020-01-01 00:00:00")] }] }));
  const result = await selectBaselineHeadData(plan, input); assert.equal(result.headEligibility, "locked");
});
for (const name of ["projects", "branches", historyName]) {
  void test(`missing ${name} refuses`, async () => {
    const input = fixture(); await assert.rejects(selectBaselineHeadData(plan, { ...input, tables: input.tables.filter((selected) => selected.name !== name) }), /not unique/u);
  });
  void test(`duplicate ${name} refuses`, async () => {
    const input = fixture(), selected = input.tables.find((entry) => entry.name === name); assert.ok(selected !== undefined);
    await assert.rejects(selectBaselineHeadData(plan, { ...input, tables: [...input.tables, selected] }), /not unique/u);
  });
  void test(`duplicate identity in ${name} refuses`, async () => {
    const input = mapTable(fixture(), name, (selected) => ({ ...selected, rows: [...selected.rows, ...selected.rows] }));
    await assert.rejects(selectBaselineHeadData(plan, input), /not unique/u);
  });
}
for (const [name, position] of [["projects", 1], ["projects", 2], ["branches", 1]] as const) {
  void test(`wrong ${name} relation at ${position} refuses`, async () => {
    const input = mapCell(fixture(), name, position, text("f".repeat(32)));
    await assert.rejects(selectBaselineHeadData(plan, input), /differs/u);
  });
}
void test("missing selected head refuses instead of choosing a valid other head", async () => {
  const input = mapCell(fixture(), "branches", 2, text("e".repeat(32)));
  await assert.rejects(selectBaselineHeadData(plan, input), /not unique/u);
});
void test("unsupported schema refuses before selecting a branch", async () => {
  const input = fixture(); await assert.rejects(selectBaselineHeadData(plan, { ...input, schema: input.schema.slice(1) }), /schema/u);
});
void test("missing lock column refuses", async () => {
  const input = mapTable(fixture(), historyName, (selected) => ({ ...selected, columns: selected.columns.map((value) => value["name"] === "is_lock" ? { name: "other" } : value) }));
  await assert.rejects(selectBaselineHeadData(plan, input), /column/u);
});
for (const invalid of ["x", "2026-01-15T12:34:56Z", "2026-01-15 12:34:56.000", "2026-01-15 12:34:56+01:00"]) {
  void test(`non-native date grammar ${invalid} refuses`, async () => {
    const input = mapCell(fixture(), historyName, 2, text(invalid));
    await assert.rejects(selectBaselineHeadData(plan, input), /date literal/u);
  });
}
void test("malformed UTF8 and invalid hex in selected date refuse", async () => {
  for (const hex of ["ff", "f", "zz", "c080"]) {
    const input = mapCell(fixture(), historyName, 2, { kind: "text", hex });
    await assert.rejects(selectBaselineHeadData(plan, input), /text|UTF8/u);
  }
});
void test("cooperative row scanning still selects a late exact head", async () => {
  const input = mapTable(fixture(), historyName, (selected) => {
    const rows: SqlRow[] = [];
    for (let index = 0; index < 257; index += 1) { rows.push({ rowid: null, cells: [text(index.toString(16).padStart(32, "0")), { kind: "integer", decimal: "0" }, text("2020-01-01 00:00:00")] }); }
    return { ...selected, rows: [...rows, ...selected.rows] };
  });
  const result = await selectBaselineHeadData(plan, input); assert.equal(result.headEligibility, "locked");
});
