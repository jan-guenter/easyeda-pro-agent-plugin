import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { link, mkdtemp, readFile, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { createCheckpoint, verifyCheckpoint } from "../src/checkpoint.ts";
import { readNativeSqlInventory as readNativeSqlInventoryImpl, verifyOrdinarySymbolStructureTicketSlice } from "../src/sqlite-inventory.ts";
import type { NativeSqlInventory, SqlSchemaProfile } from "../src/sqlite-inventory.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";

async function readNativeSqlInventory(input: Omit<Parameters<typeof readNativeSqlInventoryImpl>[0], "runtime">): ReturnType<typeof readNativeSqlInventoryImpl> {
  return readNativeSqlInventoryImpl({ ...input, runtime: await syntheticSqlRuntime() });
}


const TREE = '{"boards":{},"schematics":{},"sheets":{},"pcbs":{},"panels":{},"blockSymbols":{},"owner":{"uuid":"owner"}}';
const TREE_HEX = Buffer.from(TREE).toString("hex");
const DDL = `PRAGMA journal_mode=DELETE;
CREATE TABLE project_structures(id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,ticket INTEGER NOT NULL,project_uuid TEXT NOT NULL,branch_uuid TEXT NOT NULL,structure TEXT NOT NULL);
CREATE TABLE projects(id INTEGER PRIMARY KEY,uuid TEXT NOT NULL);
CREATE TABLE history_data(id INTEGER PRIMARY KEY,body BLOB NOT NULL);
CREATE TABLE project_images(id INTEGER PRIMARY KEY,image BLOB);
CREATE TABLE branch_locks(id INTEGER PRIMARY KEY,document_uuid TEXT);
CREATE TABLE opaque(a,b,c,d,e);
CREATE TABLE dictionary(k TEXT PRIMARY KEY,v BLOB) WITHOUT ROWID;`;

async function fixture(extraSchema = ""): Promise<Readonly<{ path: string; directory: string; profile: SqlSchemaProfile }>> {
  const directory = await mkdtemp(join(syntheticSqlRoot(), "synthetic-fixture-"));
  const path = join(directory, "source.eprj2");
  const database = new DatabaseSync(path);
  try {
    database.exec(DDL);
    database.exec(extraSchema);
    database.prepare("INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) VALUES (?,?,?,?)").run(3, "project", "branch", TREE);
    database.prepare("INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) VALUES (?,?,?,?)").run(7, "peer-project", "peer-branch", TREE);
    database.exec("INSERT INTO projects VALUES(1,'project'); INSERT INTO history_data VALUES(1,X'0001FF'); INSERT INTO project_images VALUES(1,X'00FF'); INSERT INTO branch_locks VALUES(1,'closed-peer'); INSERT INTO dictionary VALUES('first',X'01');");
    database.prepare("INSERT INTO opaque VALUES(?,?,?,?,?)").run(9_007_199_254_740_993n, "a\0b", Buffer.from([0, 255, 128]), 1.25, null);
    const entries = database.prepare("SELECT type,name,tbl_name,sql FROM sqlite_schema ORDER BY type,name").all().map((row) => ({
      type: String(row["type"]), name: String(row["name"]), table: String(row["tbl_name"]), sql: row["sql"] === null ? null : String(row["sql"]),
    }));
    // This synthetic fixture cannot admit a native schema.
    // Production needs a separately source-reviewed fixed profile.
    return { directory, path, profile: { id: "private-synthetic-schema.v1", entries } };
  } finally { database.close(); }
}
async function snapshot(input: Awaited<ReturnType<typeof fixture>>, label: string): Promise<Readonly<{
  inventory: NativeSqlInventory; checkpoint: string; sha256: string;
}>> {
  const receipt = await createCheckpoint({ source: input.path, outputDir: join(input.directory, "checkpoints"), label });
  const checked = await verifyCheckpoint(receipt.receiptPath);
  assert.equal(checked.ok, true);
  const inventory = await readNativeSqlInventory({ checkpointPath: receipt.checkpoint,
    expectedSha256: receipt.checkpointSha256, schemaProfile: input.profile });
  return { inventory, checkpoint: receipt.checkpoint, sha256: receipt.checkpointSha256 };
}
function mutate(path: string, sql: string): void {
  const database = new DatabaseSync(path);
  try { database.exec(sql); } finally { database.close(); }
}
function verify(before: NativeSqlInventory, after: NativeSqlInventory): Readonly<Record<string, unknown>> {
  return verifyOrdinarySymbolStructureTicketSlice({ before, after, projectUuid: "project", branchUuid: "branch",
    preDispatchMaxTicket: 10n, expectedStructureUtf8Hex: TREE_HEX });
}

void test("immutable SQL inventory preserves storage classes, bytes, rowid and WITHOUT ROWID", async () => {
  const input = await fixture();
  const before = await snapshot(input, "inventory");
  const opaque = before.inventory.tables.find((table) => table.name === "opaque");
  assert.deepEqual(opaque?.rows[0]?.cells, [
    { kind: "integer", decimal: "9007199254740993" },
    { kind: "text", hex: "610062" }, { kind: "blob", hex: "00ff80" },
    { kind: "real", ieee754le: "000000000000f43f" }, { kind: "null" },
  ]);
  assert.deepEqual(opaque?.rows[0]?.rowid, { kind: "integer", decimal: "1" });
  assert.equal(before.inventory.tables.find((table) => table.name === "dictionary")?.rows[0]?.rowid, null);
  assert.equal(Object.isFrozen(before.inventory), true);
  assert.equal(Object.isFrozen(opaque?.rows[0]?.cells), true);
  const again = await snapshot(input, "same-state");
  assert.equal(again.inventory.logicalSha256, before.inventory.logicalSha256);
});

void test("single derived structure ticket update passes only a non-authorizing SQL slice", async () => {
  const input = await fixture();
  const before = await snapshot(input, "before");
  mutate(input.path, "UPDATE project_structures SET ticket=11 WHERE branch_uuid='branch'");
  const after = await snapshot(input, "after");
  const proof = verify(before.inventory, after.inventory);
  assert.equal(proof["exactSqlSlice"], true);
  assert.equal(proof["executionAuthorized"], false);
  assert.equal(proof["producerOwnershipVerified"], false);
  assert.equal(proof["completeRenameVerified"], false);
});

for (const [name, sql] of [
  ["missing ticket update", "SELECT 1"],
  ["wrong ticket", "UPDATE project_structures SET ticket=12 WHERE branch_uuid='branch'"],
  ["wrong project", "UPDATE project_structures SET ticket=11,project_uuid='foreign' WHERE branch_uuid='branch'"],
  ["changed structure key order", "UPDATE project_structures SET ticket=11,structure='{}' WHERE branch_uuid='branch'"],
  ["same-ticket duplicate", "UPDATE project_structures SET ticket=11 WHERE branch_uuid='branch'; INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) SELECT ticket,project_uuid,branch_uuid,structure FROM project_structures WHERE branch_uuid='branch'"],
  ["peer branch change", "UPDATE project_structures SET ticket=11"],
  ["image change", "UPDATE project_structures SET ticket=11 WHERE branch_uuid='branch'; UPDATE project_images SET image=X'00FE'"],
  ["lock change", "UPDATE project_structures SET ticket=11 WHERE branch_uuid='branch'; DELETE FROM branch_locks"],
  ["sequence change", "UPDATE project_structures SET ticket=11 WHERE branch_uuid='branch'; UPDATE sqlite_sequence SET seq=99 WHERE name='project_structures'"],
  ["raw history change", "UPDATE project_structures SET ticket=11 WHERE branch_uuid='branch'; UPDATE history_data SET body=X'0001FE'"],
  ["duplicate opaque row", "UPDATE project_structures SET ticket=11 WHERE branch_uuid='branch'; INSERT INTO opaque SELECT * FROM opaque"],
  ["storage-class drift", "UPDATE project_structures SET ticket=11 WHERE branch_uuid='branch'; UPDATE opaque SET b=X'610062'"],
  ["rowid drift", "UPDATE project_structures SET ticket=11 WHERE branch_uuid='branch'; UPDATE opaque SET rowid=2"],
  ["user version drift", "UPDATE project_structures SET ticket=11 WHERE branch_uuid='branch'; PRAGMA user_version=9"],
  ["application id drift", "UPDATE project_structures SET ticket=11 WHERE branch_uuid='branch'; PRAGMA application_id=9"],
] as const) {
  void test(`exact slice rejects ${name}`, async () => {
    const input = await fixture();
    const before = await snapshot(input, "before");
    mutate(input.path, sql);
    const after = await snapshot(input, "after");
    assert.throws(() => verify(before.inventory, after.inventory));
  });
}

void test("duplicate or equal-ticket baseline is refused rather than predicting native INSERT", async () => {
  for (const sql of [
    "UPDATE project_structures SET ticket=11 WHERE branch_uuid='branch'",
    "INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) SELECT ticket,project_uuid,branch_uuid,structure FROM project_structures WHERE branch_uuid='branch'",
  ]) {
    const input = await fixture(); mutate(input.path, sql);
    const baseline = await snapshot(input, "invalid-baseline");
    assert.throws(() => verify(baseline.inventory, baseline.inventory), /prior ticket|exactly one branch/u);
  }
});

void test("reader branding rejects deserialized or cloned inventories", async () => {
  const input = await fixture();
  const before = await snapshot(input, "before");
  assert.throws(() => verify(structuredClone(before.inventory), before.inventory), /fresh immutable/u);
});

for (const [name, sql] of [
  ["unknown table", "CREATE TABLE added(x)"],
  ["unknown index", "CREATE INDEX unexpected ON projects(uuid)"],
  ["trigger", "CREATE TRIGGER unexpected AFTER UPDATE ON projects BEGIN SELECT 1; END"],
  ["view", "CREATE VIEW unexpected AS SELECT * FROM projects"],
] as const) {
  void test(`fixed schema rejects ${name}`, async () => {
    const input = await fixture(); mutate(input.path, sql);
    await assert.rejects(snapshot(input, "changed-schema"), /schema|view|trigger/u);
  });
}

void test("raw invalid UTF8 text bytes remain distinguishable from repaired text", async () => {
  const input = await fixture(); mutate(input.path, "UPDATE opaque SET b=CAST(X'FFFE00' AS TEXT)");
  const result = await snapshot(input, "raw-text");
  assert.deepEqual(result.inventory.tables.find((table) => table.name === "opaque")?.rows[0]?.cells[1], { kind: "text", hex: "fffe00" });
});

void test("SQL byte bounds refuse a large cell before hex expansion", async () => {
  const input = await fixture(); mutate(input.path, "UPDATE opaque SET c=zeroblob(2097153)");
  await assert.rejects(snapshot(input, "oversized"), /cell bound/u);
});

void test("quoted identifiers and a shadowed rowid use the remaining native alias", async () => {
  const input = await fixture(`CREATE TABLE "quoted""table"("rowid" TEXT,"quote""column" BLOB); INSERT INTO "quoted""table" VALUES('user value',X'0001');`);
  const result = await snapshot(input, "quoted-identifiers");
  const table = result.inventory.tables.find((value) => value.name === 'quoted"table');
  assert.deepEqual(table?.rows[0]?.rowid, { kind: "integer", decimal: "1" });
  assert.deepEqual(table?.rows[0]?.cells[1], { kind: "blob", hex: "0001" });
});

for (const [name, schema] of [
  ["generated column", "CREATE TABLE generated(x,y GENERATED ALWAYS AS (x+1) STORED)"],
  ["all rowid aliases shadowed", "CREATE TABLE shadowed(rowid,_rowid_,oid)"],
] as const) {
  void test(`inventory refuses unsupported ${name}`, async () => {
    const input = await fixture(schema);
    await assert.rejects(snapshot(input, name.replaceAll(" ", "-")), /columns|aliases/u);
  });
}

void test("nonfinite REAL refuses rather than conflating it with NULL", async () => {
  const input = await fixture();
  mutate(input.path, "UPDATE opaque SET d=1e999");
  await assert.rejects(snapshot(input, "nonfinite-real"), /REAL encoding/u);
});

void test("checkpoint VACUUM projection is not an exact source schema-cookie proof", async () => {
  const input = await fixture();
  const database = new DatabaseSync(input.path, { defensive: false });
  try { database.exec("PRAGMA schema_version=99"); } finally { database.close(); }
  const source = await readNativeSqlInventory({ checkpointPath: input.path,
    expectedSha256: createHash("sha256").update(await readFile(input.path)).digest("hex"), schemaProfile: input.profile });
  assert.equal(source.properties["schema_version"], 99);
  const checkpoint = await snapshot(input, "normalized-checkpoint");
  assert.notEqual(checkpoint.inventory.properties["schema_version"], source.properties["schema_version"]);
  assert.notEqual(checkpoint.inventory.logicalSha256, source.logicalSha256);
});

void test("hash, symlink, hardlink and sidecar admission remain strict", async () => {
  const input = await fixture();
  const before = await snapshot(input, "before");
  const options = { checkpointPath: before.checkpoint, expectedSha256: before.sha256, schemaProfile: input.profile };
  await assert.rejects(readNativeSqlInventory({ ...options, expectedSha256: "0".repeat(64) }), /hash mismatch/u);
  const symbolic = join(input.directory, "symlink.eprj2"); await symlink(before.checkpoint, symbolic);
  await assert.rejects(readNativeSqlInventory({ ...options, checkpointPath: symbolic }), /symbolic link/u);
  const hard = join(input.directory, "hardlink.eprj2"); await link(before.checkpoint, hard);
  await assert.rejects(readNativeSqlInventory({ ...options, checkpointPath: hard }), /file refused/u);
  const fresh = await snapshot(input, "fresh");
  await writeFile(`${fresh.checkpoint}-wal`, "synthetic sidecar", { flag: "wx", mode: 0o600 });
  await assert.rejects(readNativeSqlInventory({ ...options, checkpointPath: fresh.checkpoint, expectedSha256: fresh.sha256 }), /sidecar/u);
  assert.equal(createHash("sha256").update(await readFile(before.checkpoint)).digest("hex"), before.sha256);
});
