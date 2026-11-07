/** Completed synthetic SQL/cipher only. No native saved checkpoint, fresh
 * worker, network request or cold-load authority exists in these tests. */
/* oxlint-disable import/max-dependencies -- Both finite history shapes use actual SQL files, finished readers and independent native cipher construction to exercise the private projection. */
import { deriveGeneratedSavedHistoryLoadData } from "../src/current-generated-saved-history-load-data.ts";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { prepareCurrentPcbViaSavedLoadPlan, requireOriginalCurrentPcbViaSavedLoadPlan } from "../src/current-pcb-via-saved-load-plan.ts";
import type { CurrentPcbViaWriteClosedCheckpoint } from "../src/current-pcb-via-write-closed-checkpoint.ts";
import { qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import { readManagedLibraryZip } from "../src/managed-library-files-zip.ts";
import { readExactSqlInventory } from "../src/sqlite-inventory.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";
import { encrypted } from "./helpers/symbol-sql-fixture.ts";
import { syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";

void test("closed two-chunk expectations preserve both finite native heads, nonce selection, URL and exact cipher/plain bytes", async () => {
  const derive = deriveGeneratedSavedHistoryLoadData;
  for (const mode of ["mutable", "append"] as const) {
    const input = await managedFixtureInitialSqlFixture(), qualified = await qualifyGeneratedFixtureInitialSql(input);
    const target = qualified.qualification.target; const head = mode === "mutable" ? "5".repeat(32) : "7".repeat(32), key = mode === "mutable" ? "6".repeat(32) : "8".repeat(32);
    const source = readManagedLibraryZip(input.archive).get("Fixture.epru"); assert.ok(source !== undefined);
    const plaintext = `{"type":"EDIT_HEAD"}||${JSON.stringify({ uuid: "4".repeat(32), username: "", nickname: "", updateTime: Date.now() })}|\n${source.toString("utf8")}`; const cipher = encrypted(plaintext, head, key);
    const database = new DatabaseSync(input.syntheticDatabasePath, { enableForeignKeyConstraints: false });
    try {
      if (mode === "mutable") { database.prepare(`UPDATE project_history_${target.branchUuid} SET num=1 WHERE uuid=?`).run(head); }
      else {
        database.prepare(`INSERT INTO project_history_${target.branchUuid} (uuid,parent,key,is_lock,num,snapshot_num) VALUES (?,?,?,0,0,0)`).run(head, "5".repeat(32), key);
        database.prepare("UPDATE branches SET history_uuid=? WHERE uuid=?").run(head, target.branchUuid);
      }
      database.prepare("INSERT INTO history_data (uuid,history_uuid,dataStr) VALUES (?,?,?)").run(mode === "mutable" ? `${head}-1` : head, head, cipher);
    } finally { database.close(); }
    const sourceSha256 = createHash("sha256").update(await readFile(input.syntheticDatabasePath)).digest("hex");
    const inventory = await readExactSqlInventory({ checkpointPath: input.syntheticDatabasePath, expectedSha256: sourceSha256, runtime: await syntheticSqlRuntime() });
    const scope = { rawWindowsPath: target.rawWindowsPath, projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid, sourceSha256 };
    const data = await derive(inventory, scope); assert.equal(data.chunks.length, 2); assert.equal(data.histories.length, mode === "mutable" ? 1 : 2);
    const saved = data.chunks.find(chunk => chunk.dataBase64 === cipher); assert.ok(saved !== undefined); assert.equal(saved.historyUuid, head); assert.equal(saved.ordinal, mode === "mutable" ? 1 : 0);
    assert.equal(saved.fetchUrl, `/api/v4/histories/dataStr?path=${target.projectUuid}&uuid=${head}${mode === "mutable" ? "-1" : ""}`);
    assert.equal(saved.cipherSha256, createHash("sha256").update(Buffer.from(cipher, "base64")).digest("hex")); assert.equal(saved.plaintext, plaintext);
    assert.equal(data.nativeLoadingVerified, false); assert.equal(data.cacheExclusionVerified, false); assert.equal(data.reopenedVerified, false);
    await assert.rejects(derive(structuredClone(inventory), scope)); await assert.rejects(derive(inventory, { ...scope, sourceSha256: "0".repeat(64) }));
  }
});
void test("copied saved checkpoints and matching plan JSON cannot issue original cold-load expectations", () => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberate serialized forgery must reject at the original closed-checkpoint registry.
  const copied = { profile: "private.current-pcb-via-write-closed-checkpoint.v1" } as CurrentPcbViaWriteClosedCheckpoint;
  assert.throws(() => prepareCurrentPcbViaSavedLoadPlan(copied));
  assert.throws(() => requireOriginalCurrentPcbViaSavedLoadPlan({ profile: "private.current-pcb-via-saved-load-plan.v1" }, copied));
});
