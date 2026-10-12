import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { decodeNativeHistoryChunk } from "../src/native-history.ts";
import { HISTORY_TABLE, IDS, OPERATION, WITNESS, applyEffect, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";
import { prepareSymbolNewHeadSqlPlan, verifySymbolNewHeadSqlEffect } from "../src/symbol-sql-comparator.ts";

async function multiChunkFixture(chunks: number, peers: number): ReturnType<typeof fixture> {
  const input = await fixture(); const first = new DatabaseSync(input.path, { enableForeignKeyConstraints: false }); let raw: unknown;
  try { raw = first.prepare("SELECT dataStr FROM history_data WHERE id=7").get()?.["dataStr"]; } finally { first.close(); }
  assert.equal(typeof raw, "string");
  const plaintext = await decodeNativeHistoryChunk({ historyUuid: IDS.oldHead, keyHex: IDS.oldKey, dataBase64: String(raw) });
  const db = new DatabaseSync(input.path, { enableForeignKeyConstraints: false });
  try {
    db.exec("BEGIN"); db.prepare(`UPDATE "${HISTORY_TABLE}" SET num=? WHERE id=5`).run(chunks - 1);
    const insert = db.prepare("INSERT INTO history_data(uuid,history_uuid,dataStr) VALUES(?,?,?)");
    for (let index = 1; index < chunks; index += 1) { insert.run(`${IDS.oldHead}-${index}`, IDS.oldHead, encrypted(plaintext, IDS.oldHead, IDS.oldKey)); }
    for (let index = 0; index < peers; index += 1) { insert.run(`unused-${index}`, IDS.peer, "unused raw ciphertext"); }
    db.exec("COMMIT");
  } finally { db.close(); }
  return { path: input.path, before: await inventory(input.path) };
}
void test("128 selected chunks plus8192 unrelated chunks preserve exact plan/full effect", async () => {
  const input = await multiChunkFixture(128, 8192);
  const plan = await prepareSymbolNewHeadSqlPlan({ before: input.before, operation: OPERATION, witness: WITNESS });
  assert.equal(plan.targetUuid, IDS.target); assert.equal(plan.beforeSqlSha256, input.before.logicalSha256);
  assert.equal(plan.expectedTicket, 101); assert.equal(plan.executionAuthorized, false);
  applyEffect(input.path); const after = await inventory(input.path);
  const proof = await verifySymbolNewHeadSqlEffect(plan, after);
  assert.equal(proof["exactLogicalSqlEffect"], true); assert.equal(proof["newHistoryId"], "6");
  assert.equal(proof["newChunkId"], "8331"); assert.equal(proof["executionAuthorized"], false);
  mutate(input.path, "UPDATE history_data SET dataStr='changed-unused' WHERE uuid='unused-8191'");
  const changed = await inventory(input.path);
  await assert.rejects(verifySymbolNewHeadSqlEffect(plan, changed), /history_data/u);
});
for (const [label, sql, expected] of [
  ["unrelated invalid UTF8", "UPDATE history_data SET uuid=CAST(X'ff' AS TEXT) WHERE uuid='unused-0'", /exact UTF8/u],
  ["selected missing", `DELETE FROM history_data WHERE uuid='${IDS.oldHead}-1'`, /not unique/u],
  ["selected wrong parent", `UPDATE history_data SET history_uuid='${IDS.peer}' WHERE uuid='${IDS.oldHead}-1'`, /parent mismatch/u],
  ["selected invalid ciphertext", `UPDATE history_data SET dataStr='AAAA' WHERE uuid='${IDS.oldHead}-1'`, /./u],
] as const) {
  void test(`indexed preparation refuses ${label}`, async () => {
    const input = await multiChunkFixture(2, 1); mutate(input.path, sql); const before = await inventory(input.path);
    await assert.rejects(prepareSymbolNewHeadSqlPlan({ before, operation: OPERATION, witness: WITNESS }), expected);
  });
}
