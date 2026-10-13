import assert from "node:assert/strict";
import { copyFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { setImmediate } from "node:timers";
import { compareCompleteClosedSql } from "../src/closed-sql-equality.ts";
import { fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

void test("actual complete native-schema SQL equality accepts unchanged logical state despite different raw header bytes", async () => {
  const value = await fixture();
  const original = await readFile(value.path);
  mutate(value.path, "PRAGMA user_version=0");
  const current = await inventory(value.path);
  assert.notDeepEqual(await readFile(value.path), original);
  const result = await compareCompleteClosedSql(value.before, current);
  assert.equal(result.exactLogicalSqlUnchanged, true);
  assert.equal(result.originalEditSqlSha256, value.before.logicalSha256);
  assert.equal(result.reopenedSqlSha256, current.logicalSha256);
  assert.equal(result.executionAuthorized, false); assert.equal(result.completionProved, false);
});
void test("all completed native table rows are compared with cooperative event-loop progress", async () => {
  const value = await fixture(); let yielded = false;
  const tick = setImmediate(() => { yielded = true; });
  try { await compareCompleteClosedSql(value.before, value.before); assert.equal(yielded, true); }
  finally { clearImmediate(tick); }
});
for (const side of ["left", "right"] as const) {
  void test(`serialized ${side} inventory cannot restore original reader completion`, async () => {
    const value = await fixture();
    await assert.rejects(compareCompleteClosedSql(side === "left" ? structuredClone(value.before) : value.before,
      side === "right" ? structuredClone(value.before) : value.before), /original inventory/u);
  });
}
const mutations = [
  ["peer text", "UPDATE resources SET dataStr='unexpected peer change'"],
  ["peer same-value blob storage", "UPDATE resources SET dataStr=CAST(dataStr AS BLOB)"],
  ["peer row identity", "UPDATE resources SET rowid=rowid+10"],
  ["peer removal", "DELETE FROM resources"],
  ["extra schema", "CREATE TABLE collateral (value TEXT)"],
  ["SQL persistent property", "PRAGMA user_version=17"],
  ["old ciphertext", "UPDATE history_data SET dataStr=dataStr||'AAAA'"],
  ["structure ticket", "UPDATE project_structures SET ticket=ticket+1"],
  ["project actor", "UPDATE projects SET modifier_uuid='unexpected'"],
  ["branch pointer", "UPDATE branches SET history_uuid=NULL WHERE node=0"],
  ["autoincrement counter", "UPDATE sqlite_sequence SET seq=seq+1 WHERE name='history_data'"],
] as const;
for (const [name, sql] of mutations) {
  void test(`complete reopened SQL refuses ${name}`, async () => {
    const value = await fixture();
    const reopened = join(value.path.slice(0, value.path.lastIndexOf("/")), "reopened.eprj2");
    await copyFile(value.path, reopened); mutate(reopened, sql);
    await assert.rejects(compareCompleteClosedSql(value.before, await inventory(reopened)), /SQL equality refused/u);
  });
}
