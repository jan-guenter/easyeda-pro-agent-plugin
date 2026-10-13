import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { generateSqliteInventoryProgram } from "../../scripts/generate-sqlite-inventory-program.ts";
import { SQLITE_INVENTORY_PROGRAM } from "../src/sqlite-inventory-program.ts";

void test("fixed reader program reproduces from exactly three builtin-only source files", async () => {
  const actual = await readFile(new URL("../src/sqlite-inventory-program.ts", import.meta.url), "utf8");
  assert.equal(await generateSqliteInventoryProgram(), actual);
  assert.ok(Buffer.byteLength(SQLITE_INVENTORY_PROGRAM) < 65_536);
  assert.ok(SQLITE_INVENTORY_PROGRAM.includes("scanExactSqliteInventory"));
  assert.equal(SQLITE_INVENTORY_PROGRAM.includes("/root/"), false);
  assert.equal(SQLITE_INVENTORY_PROGRAM.includes("node_modules"), false);
});
