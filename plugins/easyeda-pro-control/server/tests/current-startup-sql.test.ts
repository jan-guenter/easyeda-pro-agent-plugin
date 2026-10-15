import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, controlRootCapability } from "../src/artifacts.ts";
import { createCheckpoint } from "../src/checkpoint.ts";
import { selectCurrentStartupSql } from "../src/current-startup-sql.ts";
import type { CurrentStartupSqlInput } from "../src/current-startup-sql.ts";
import { readNativeHistoryCheckpoint } from "../src/native-history.ts";
import { HISTORY_TABLE, IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

async function input(path: string): Promise<CurrentStartupSqlInput> {
  const sql = await inventory(path);
  const hash = sql.checkpointSha256;
  const history = await readNativeHistoryCheckpoint({ checkpointPath: path, expectedSha256: hash, projectUuid: IDS.project });
  return { inventory: sql, sourceSha256: hash, checkpointSha256: hash, history,
    target: { projectUuid: IDS.project, branchUuid: IDS.branch, ownerUuid: IDS.actor } };
}
async function changedInventory(path: string, before: CurrentStartupSqlInput): Promise<CurrentStartupSqlInput> {
  const sql = await inventory(path); return { ...before, inventory: sql, sourceSha256: sql.checkpointSha256 };
}

void test("startup SQL binds original raw-copy facts to a separately hashed VACUUM checkpoint without authority", async () => {
  const f = await fixture(); mutate(f.path, "PRAGMA schema_version=99");
  const before = await input(f.path), outputDir = join(controlDataDirectory(), "checkpoints");
  const checkpoint = await createCheckpoint({ source: f.path, outputDir, label: "synthetic-startup" },
    { expectedSource: f.path, artifactRoots: [outputDir], controlRoot: await controlRootCapability(), maximumSourceBytes: 268_435_456 });
  const history = await readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint,
    expectedSha256: checkpoint.checkpointSha256, projectUuid: IDS.project });
  assert.equal(checkpoint.sourceSha256, before.sourceSha256); assert.notEqual(checkpoint.checkpointSha256, checkpoint.sourceSha256);
  const result = await selectCurrentStartupSql({ ...before, checkpointSha256: checkpoint.checkpointSha256, history });
  assert.deepEqual(result, { supported: true, databaseVersion: "25.10.31.1", projectUuid: IDS.project, branchUuid: IDS.branch,
    ownerUuid: IDS.actor, headHistoryUuid: IDS.oldHead, historyRows: 1, chunks: 1,
    sourceSha256: before.sourceSha256, checkpointSha256: checkpoint.checkpointSha256, sqlLogicalSha256: before.inventory.logicalSha256 });
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.hasOwn(result, "executionAuthorized"), false);
  assert.equal(Object.hasOwn(result, "editorVersion"), false);
});

void test("startup SQL rejects cloned completion and mismatched source, checkpoint, branch and decoded counts", async () => {
  const f = await fixture(); const before = await input(f.path);
  await assert.rejects(selectCurrentStartupSql({ ...before, inventory: structuredClone(before.inventory) }), /original inventory/u);
  for (const wrong of [
    { ...before, sourceSha256: "f".repeat(64) },
    { ...before, checkpointSha256: "f".repeat(64) },
    { ...before, target: { ...before.target, branchUuid: IDS.actor } },
    { ...before, history: { ...before.history, historyRowCount: 2 } },
    { ...before, history: { ...before.history, chunkCount: 2 } },
  ]) { await assert.rejects(selectCurrentStartupSql(wrong), /identity differs|count differs/u); }
});

void test("startup SQL preserves a version literal, refuses invalid TEXT, and only downgrades exact schema mismatch", async () => {
  const f = await fixture(); const before = await input(f.path);
  mutate(f.path, "UPDATE db_versions SET value='24.1.1.1'");
  const older = await selectCurrentStartupSql(await input(f.path));
  assert.ok(older.supported); assert.equal(older.databaseVersion, "24.1.1.1");
  mutate(f.path, "UPDATE db_versions SET value=CAST(X'80' AS TEXT)");
  await assert.rejects(selectCurrentStartupSql(await input(f.path)), /exact UTF8/u);
  mutate(f.path, "CREATE TABLE synthetic_unreviewed(value TEXT)");
  const changed = await changedInventory(f.path, before);
  assert.deepEqual(await selectCurrentStartupSql(changed), { supported: false, reason: "unsupported-sql-schema" });
  await assert.rejects(selectCurrentStartupSql({ ...changed, sourceSha256: before.sourceSha256 }), /identity differs/u);
});

void test("startup SQL refuses a changed default branch, owner, head or deleted branch", async () => {
  for (const sql of [
    `UPDATE projects SET branch_uuid='${IDS.start}'`,
    `UPDATE projects SET owner_uuid='${IDS.peer}'`,
    `UPDATE branches SET history_uuid='${IDS.newHead}' WHERE uuid='${IDS.branch}'`,
    `UPDATE branches SET delete_status=1 WHERE uuid='${IDS.branch}'`,
  ]) {
    const f = await fixture(); const before = await input(f.path); mutate(f.path, sql);
    await assert.rejects(selectCurrentStartupSql(await changedInventory(f.path, before)), /project, default branch, owner or head differs/u);
  }
});

void test("startup SQL requires the exact linear native ID range and each numbered chunk", async () => {
  const numbered = await fixture();
  mutate(numbered.path, `INSERT INTO history_data(uuid,history_uuid,dataStr) SELECT '${IDS.oldHead}-1',history_uuid,dataStr FROM history_data WHERE id=7;
    UPDATE "${HISTORY_TABLE}" SET num=1`);
  const multiple = await selectCurrentStartupSql(await input(numbered.path));
  assert.ok(multiple.supported); assert.equal(multiple.chunks, 2);
  for (const sql of [
    `UPDATE "${HISTORY_TABLE}" SET parent='${IDS.oldHead}'`,
    `UPDATE "${HISTORY_TABLE}" SET snapshot='${IDS.peer}'`,
    `UPDATE history_data SET uuid='${IDS.oldHead}-1' WHERE id=7`,
    `UPDATE history_data SET history_uuid='${IDS.peer}' WHERE id=7`,
  ]) {
    const f = await fixture(); const before = await input(f.path); mutate(f.path, sql);
    await assert.rejects(selectCurrentStartupSql(await changedInventory(f.path, before)), /cyclic|snapshots|chunk selection/u);
  }
  const reversed = await fixture();
  const parent = encrypted('{"type":"EDIT_HEAD"}||{"fixture":true}', IDS.newHead, IDS.newKey);
  mutate(reversed.path, `INSERT INTO "${HISTORY_TABLE}"(id,uuid,parent,key,num,snapshot_num) VALUES(6,'${IDS.newHead}',NULL,'${IDS.newKey}',0,0);
    UPDATE "${HISTORY_TABLE}" SET parent='${IDS.newHead}' WHERE id=5;
    INSERT INTO history_data(uuid,history_uuid,dataStr) VALUES('${IDS.newHead}','${IDS.newHead}','${parent}')`);
  await assert.rejects(selectCurrentStartupSql(await input(reversed.path)), /native history ID order/u);
});
