import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { qualifyGeneratedFixtureVacuumProjection } from "../src/managed-fixture-generated-open-checkpoint.ts";
import { readExactSqlInventory } from "../src/sqlite-inventory.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";
import { syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";

void test("the narrow generated projection proves the actual VACUUM schema_version increment and complete unchanged rows/properties", async () => {
  const input = await managedFixtureInitialSqlFixture(); const copy = `${input.syntheticDatabasePath}.vacuum.eprj2`;
  const database = new DatabaseSync(input.syntheticDatabasePath);
  try { database.prepare("VACUUM INTO ?").run(copy); } finally { database.close(); }
  const expectedSha256 = createHash("sha256").update(await readFile(copy)).digest("hex");
  const checkpoint = await readExactSqlInventory({ checkpointPath: copy, expectedSha256, runtime: await syntheticSqlRuntime() });
  const result = qualifyGeneratedFixtureVacuumProjection(input.inventory, checkpoint);
  assert.equal(result.checkpointSchemaVersion, result.sourceSchemaVersion + 1); assert.equal(result.onlySchemaVersionIncremented, true);
  assert.notEqual(result.sourceLogicalSha256, result.checkpointLogicalSha256);
  assert.throws(() => qualifyGeneratedFixtureVacuumProjection(input.inventory, input.inventory));
  assert.throws(() => qualifyGeneratedFixtureVacuumProjection(structuredClone(input.inventory), checkpoint));
  const changed = new DatabaseSync(copy);
  try { changed.exec("UPDATE db_versions SET value='unqualified'"); } finally { changed.close(); }
  const changedHash = createHash("sha256").update(await readFile(copy)).digest("hex");
  const changedInventory = await readExactSqlInventory({ checkpointPath: copy, expectedSha256: changedHash, runtime: await syntheticSqlRuntime() });
  assert.throws(() => qualifyGeneratedFixtureVacuumProjection(input.inventory, changedInventory));
});
