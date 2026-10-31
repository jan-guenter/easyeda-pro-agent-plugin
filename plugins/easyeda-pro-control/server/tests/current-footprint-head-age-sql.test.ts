/** Genuine completed readers of private synthetic SQL only. No native clock,
 * application, process ownership or writer is substituted by these rows. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentFootprintHeadAgeSqlHead, requireCurrentFootprintHeadAgeSqlHead } from "../src/current-footprint-head-age-sql.ts";
import { HISTORY_TABLE, IDS, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

void test("head-age SQL selects an exact unlocked default head and retains the original completed reader", async () => {
  const data = await fixture(); mutate(data.path, `UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-01-15 12:34:56'`);
  const before = await inventory(data.path), target = { projectUuid: IDS.project, branchUuid: IDS.branch };
  const head = await prepareCurrentFootprintHeadAgeSqlHead(before, target);
  assert.equal(head.historyUuid, IDS.oldHead); assert.equal(head.ownerUuid, IDS.actor); assert.equal(head.lockState, "unlocked");
  assert.equal(head.ageVerified, false); assert.equal(head.executionAuthorized, false); requireCurrentFootprintHeadAgeSqlHead(head, before);
  assert.throws(() =>{  requireCurrentFootprintHeadAgeSqlHead(structuredClone(head), before); });
  const equal = await inventory(data.path); assert.equal(equal.logicalSha256, before.logicalSha256);
  assert.throws(() =>{  requireCurrentFootprintHeadAgeSqlHead(head, equal); }); await assert.rejects(prepareCurrentFootprintHeadAgeSqlHead(structuredClone(before), target));
});
void test("locked heads, padded identities and invalid calendars refuse before native allocation", async () => {
  for (const change of ["", `UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-02-30 12:34:56'`,
    `UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-01-15 12:34:56\n'`, `UPDATE projects SET owner_uuid='${IDS.actor}\n'`]) {
    const data = await fixture(); if (change !== "") { mutate(data.path, change); }
    await assert.rejects(prepareCurrentFootprintHeadAgeSqlHead(await inventory(data.path), { projectUuid: IDS.project, branchUuid: IDS.branch }));
  }
});
