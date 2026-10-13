import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, mkdtemp, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { copyClosedProjectBytes } from "../src/closed-file-copy.ts";
import { readClosedCopySqlInventory } from "../src/closed-file-sql.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";
import { mintSyntheticClosedSessionProof } from "./helpers/windows-closed-session-fixture.ts";

async function fixture(): Promise<{
  copy: Awaited<ReturnType<typeof copyClosedProjectBytes>>;
  authority: Awaited<ReturnType<typeof mintSyntheticClosedSessionProof>>["fixture"];
}> {
  const directory = await mkdtemp(join(syntheticSqlRoot(), "closed-sql-"));
  const source = join(directory, "source.eprj2");
  const database = new DatabaseSync(source, { defensive: false });
  try { database.exec("CREATE TABLE t(value); INSERT INTO t(rowid,value) VALUES(55,'original'); PRAGMA schema_version=99"); }
  finally { database.close(); }
  const { fixture: authority, proof } = await mintSyntheticClosedSessionProof();
  const expectedSourceSha256 = createHash("sha256").update(await readFile(source)).digest("hex");
  const copy = await copyClosedProjectBytes({ source, expectedSourceSha256,
    artifactDirectory: join(directory, "evidence"), closureProof: proof });
  return { copy, authority };
}

void test("issued raw copy binds complete inventory and preserves source schema cookie and rowid", async () => {
  const { copy } = await fixture();
  const value = await readClosedCopySqlInventory({ copy, runtime: await syntheticSqlRuntime() });
  assert.equal(value.checkpointSha256, copy.sha256);
  assert.equal(value.properties["schema_version"], 99);
  assert.deepEqual(value.tables[0]?.rows[0]?.rowid, { kind: "integer", decimal: "55" });
  assert.equal(copy.executionAuthorized, false);
});

void test("a cloned or edited receipt cannot authorize even an existing artifact", async () => {
  const { copy } = await fixture(), runtime = await syntheticSqlRuntime();
  const edited = { ...copy };
  Object.defineProperty(edited, "sourceProjectGenerationBindingVerified", { value: true });
  for (const invalid of [structuredClone(copy), edited]) {
    await assert.rejects(readClosedCopySqlInventory({ copy: invalid, runtime }), /not issued/u);
  }
});

for (const change of ["same-byte replacement", "metadata", "bytes", "sidecar"] as const) {
  void test(`issued copy refuses artifact ${change}`, async () => {
    const { copy } = await fixture();
    if (change === "same-byte replacement") {
      const bytes = await readFile(copy.artifact);
      await rename(copy.artifact, `${copy.artifact}.retained`);
      await writeFile(copy.artifact, bytes, { mode: 0o600, flag: "wx" });
    } else if (change === "metadata") { await chmod(copy.artifact, 0o644); }
    else if (change === "bytes") { await writeFile(copy.artifact, "changed synthetic evidence"); }
    else { await writeFile(`${copy.artifact}-wal`, "retained synthetic sidecar", { flag: "wx", mode: 0o600 }); }
    await assert.rejects(readClosedCopySqlInventory({ copy, runtime: await syntheticSqlRuntime() }), /receipt|sidecar/u);
  });
}

void test("historical artifact remains readable after later launch without source authority", async () => {
  const { copy, authority } = await fixture();
  await authority.supervisor.launch({ confirmLaunch: true });
  const value = await readClosedCopySqlInventory({ copy, runtime: await syntheticSqlRuntime() });
  assert.equal(value.checkpointSha256, copy.sha256);
  assert.equal(copy.sourceProjectGenerationBindingVerified, false);
});
