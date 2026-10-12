import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { canonicalJson as maintainedCanonical, sha256Json as maintainedHash } from "../src/core.ts";
import { SqlReaderFailureError, readExactSqlInventory as readExactSqlInventoryImpl, readNativeSqlInventory as readNativeSqlInventoryImpl, readerCompletion } from "../src/sqlite-inventory.ts";
import { canonicalJson, sha256Json } from "../src/sqlite-inventory-json.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";

async function readNativeSqlInventory(input: Omit<Parameters<typeof readNativeSqlInventoryImpl>[0], "runtime">): ReturnType<typeof readNativeSqlInventoryImpl> {
  return readNativeSqlInventoryImpl({ ...input, runtime: await syntheticSqlRuntime() });
}

async function readExactSqlInventory(input: Omit<Parameters<typeof readExactSqlInventoryImpl>[0], "runtime">): ReturnType<typeof readExactSqlInventoryImpl> {
  return readExactSqlInventoryImpl({ ...input, runtime: await syntheticSqlRuntime() });
}


async function synthetic(sql: string): Promise<Readonly<{ checkpointPath: string; expectedSha256: string }>> {
  const directory = await mkdtemp(join(syntheticSqlRoot(), "synthetic-bounds-"));
  const checkpointPath = join(directory, "closed.eprj2");
  const database = new DatabaseSync(checkpointPath);
  try { database.exec(sql); } finally { database.close(); }
  return { checkpointPath, expectedSha256: createHash("sha256").update(await readFile(checkpointPath)).digest("hex") };
}
function manyRows(table: string, count: number, values: string): string {
  return `WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM n WHERE x<${count}) INSERT INTO ${table} SELECT ${values} FROM n;`;
}
function manyColumns(count: number): string { return Array.from({ length: count }, (_, index) => `c${index}`).join(","); }
function nullValues(count: number): string { return Array.from({ length: count }, () => "NULL").join(","); }
async function expectRefusal(input: Awaited<ReturnType<typeof synthetic>>, pattern: RegExp): Promise<void> {
  try { await readExactSqlInventory(input); assert.fail("Expected bounded reader refusal."); }
  catch (error) {
    assert.ok(error instanceof SqlReaderFailureError);
    assert.match(error.message, pattern);
    assert.equal(error.completion.observedChildClose, true);
    assert.equal(error.completion.exitCode, 2);
    assert.equal(error.completion.exitSignal, null);
  }
}

void test("built-in-only canonical JSON matches the maintained helper", () => {
  for (const value of [null, { b: [1, null, { z: "\0", a: false }], a: "x" }, { "__proto__": null, constructor: "data" }, [-0, 1.25, "é"]]) {
    assert.equal(canonicalJson(value), maintainedCanonical(value));
    assert.equal(sha256Json(value), maintainedHash(value));
  }
});

void test("generic inventory captures views and triggers without querying or firing them", async () => {
  const input = await synthetic("CREATE TABLE t(x); INSERT INTO t VALUES(7); CREATE VIEW never_query AS SELECT missing_function(x) FROM t; CREATE TRIGGER never_fire AFTER UPDATE ON t BEGIN SELECT missing_function(new.x); END;");
  const value = await readExactSqlInventory(input);
  assert.deepEqual(value.schema.map((entry) => entry.type), ["table", "trigger", "view"]);
  assert.equal(value.tables.length, 1);
  assert.deepEqual(value.tables[0]?.rows[0]?.cells, [{ kind: "integer", decimal: "7" }]);
  assert.deepEqual(readerCompletion(value).observedChildClose, true);
  assert.equal(readerCompletion(value).exitCode, 0);
  assert.throws(() => readerCompletion(structuredClone(value)), /original inventory/u);
  await assert.rejects(readNativeSqlInventory({ ...input, schemaProfile: { id: "synthetic-only.v1", entries: value.schema.filter((entry) => entry.type === "table") } }), /schema differs/u);
  assert.equal(createHash("sha256").update(await readFile(input.checkpointPath)).digest("hex"), input.expectedSha256);
});

void test("cumulative cell count refuses many NULL cells before row materialization", async () => {
  const input = await synthetic(`CREATE TABLE wide(${manyColumns(100)});${manyRows("wide", 2500, nullValues(100))}`);
  await expectRefusal(input, /cell-count bound/u);
});

void test("cell count is cumulative across tables and includes rowid cells", async () => {
  const input = await synthetic(`CREATE TABLE a(${manyColumns(63)}); CREATE TABLE b(${manyColumns(63)});${manyRows("a", 2000, nullValues(63))}${manyRows("b", 2000, nullValues(63))}`);
  await expectRefusal(input, /cell-count bound/u);
});

void test("encoded-byte bound rejects hex expansion below raw-value and cell limits", async () => {
  const input = await synthetic(`CREATE TABLE payload(x);${manyRows("payload", 100, "zeroblob(100000)")}`);
  await expectRefusal(input, /encoded-byte bound/u);
});

void test("row count is cumulative across otherwise small tables", async () => {
  const input = await synthetic(`CREATE TABLE a(x); CREATE TABLE b(x);${manyRows("a", 60_000, "NULL")}${manyRows("b", 60_000, "NULL")}`);
  await expectRefusal(input, /row bound/u);
});

void test("unsupported virtual tables are recorded in schema but not silently scanned", async () => {
  const input = await synthetic("CREATE VIRTUAL TABLE virtual_data USING fts5(value); INSERT INTO virtual_data VALUES('synthetic');");
  await expectRefusal(input, /table kind/u);
});

void test("a synchronous scan deadline leaves the parent responsive and observes owned child exit", async () => {
  const input = await synthetic(`CREATE TABLE slow(x,y);${manyRows("slow", 80_000, "zeroblob(1024),x")}`);
  let heartbeats = 0;
  const pulse = setInterval(() => { heartbeats += 1; }, 1);
  try {
    await assert.rejects(readExactSqlInventory({ ...input, scanDeadlineMs: 1 }), (error: unknown) => {
      assert.ok(error instanceof SqlReaderFailureError);
      assert.match(error.message, /scan deadline/u);
      assert.equal(error.completion.observedChildClose, true);
      assert.equal(error.completion.exitCode, null);
      assert.equal(error.completion.exitSignal, "SIGKILL");
      return true;
    });
    assert.ok(heartbeats > 5);
    // A later fresh read uses a new owned child; no timed-out process is reused.
    const small = await synthetic("CREATE TABLE t(x); INSERT INTO t VALUES(1)");
    assert.equal(readerCompletion(await readExactSqlInventory(small)).exitCode, 0);
  } finally { clearInterval(pulse); }
});

void test("caller cannot widen the scan deadline or inject Node startup options", async () => {
  const input = await synthetic("CREATE TABLE t(x)");
  for (const scanDeadlineMs of [0, -1, 10_001, Number.NaN, 1.5, Number.POSITIVE_INFINITY]) {
    await assert.rejects(readExactSqlInventory({ ...input, scanDeadlineMs }), /deadline bound/u);
  }
  const old = process.env["NODE_OPTIONS"];
  process.env["NODE_OPTIONS"] = "--this-option-does-not-exist";
  try { assert.equal(readerCompletion(await readExactSqlInventory(input)).exitCode, 0); }
  finally { if (old === undefined) { delete process.env["NODE_OPTIONS"]; } else { process.env["NODE_OPTIONS"] = old; } }
});
