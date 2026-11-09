/** Actual readonly SQLite statement checks. These do not supply the original
 * Electron connection/callback issuer or prove current-head exclusion. */
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { currentFootprintForwardHeadQuery, decodeCurrentFootprintForwardHeadRow } from "../src/current-footprint-forward-head-query.ts";
import type { CurrentFootprintCopyHeadReference } from "../src/current-footprint-copy-head-reference.ts";
import { IDS, fixture, mutate } from "./helpers/symbol-sql-fixture.ts";

// This comparison data is deliberately not a private source-reference token.
const reference: CurrentFootprintCopyHeadReference = Object.freeze({ profile: "private.current-footprint-copy-head-reference.v1",
  projectUuid: IDS.project, branchUuid: IDS.branch, ownerUuid: IDS.actor, historyUuid: IDS.oldHead, createdAtLiteral: "2020-01-01 00:00:00",
  lockState: "locked", beforeCheckpointSha256: "a".repeat(64), beforeSqlSha256: "b".repeat(64), sourcePlanSha256: "c".repeat(64),
  originalCompletedReaderRetained: true, nativeAgeRequired: false, nativeDateProvenanceVerified: false, ageVerified: false, executionAuthorized: false });
async function read(sql?: string): Promise<unknown> {
  const value = await fixture(); if (sql !== undefined) { mutate(value.path, sql); }
  const query = currentFootprintForwardHeadQuery({ projectUuid: IDS.project, branchUuid: IDS.branch });
  // Tiny synthetic SQLite read exercises the exact fixed SELECT without a connected application.
  const database = new DatabaseSync(value.path, { readOnly: true });
  try {
    // Fixed readonly synthetic statement; no application callback or execution token is issued.
    return database.prepare(query.sql).get(...query.parameters);
  } finally { database.close(); }
}
void test("one readonly Main query joins the actual project, branch and locked head", async () => {
  const row = decodeCurrentFootprintForwardHeadRow(await read(), reference);
  assert.equal(row.headUuid, IDS.oldHead); assert.equal(row.isLock, 1); assert.equal(row.projectCount, 1);
  assert.equal(row.branchCount, 1); assert.equal(row.headCount, 1); assert.equal(Object.isFrozen(row), true);
});
for (const [label, sql] of [
  ["lock", `UPDATE project_history_${IDS.branch} SET is_lock=0`],
  ["head pointer", "UPDATE branches SET history_uuid=NULL WHERE node=0"],
  ["owner", "UPDATE projects SET owner_uuid='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'"],
  ["branch owner", "UPDATE branches SET project_uuid='bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'"],
  ["deleted branch", "UPDATE branches SET delete_status=1"],
  ["head timestamp", `UPDATE project_history_${IDS.branch} SET created_at='2026-11-09 10:00:00'`],
] as const) {
  void test(`fresh head query refuses ${label} drift`, async () => { const row = await read(sql); assert.throws(() => decodeCurrentFootprintForwardHeadRow(row, reference)); });
}

void test("unlocked head observation validates its literal without supplying native age provenance", async () => {
  const row = await read(`UPDATE project_history_${IDS.branch} SET is_lock=0`);
  const selected = decodeCurrentFootprintForwardHeadRow(row, { ...reference, lockState: "unlocked", nativeAgeRequired: true });
  assert.equal(selected.isLock, 0);
  assert.throws(() => decodeCurrentFootprintForwardHeadRow({ ...selected, createdAtLiteral: "2019-02-29 00:00:00" },
    { ...reference, lockState: "unlocked", nativeAgeRequired: true, createdAtLiteral: "2019-02-29 00:00:00" }));
});
void test("only exact hexadecimal branch suffixes can enter fixed readonly SQL", () => {
  for (const branchUuid of ["a".repeat(31), "a".repeat(33), `${IDS.branch}\n`, 'a";DROP TABLE projects;--']) {
    assert.throws(() => currentFootprintForwardHeadQuery({ projectUuid: IDS.project, branchUuid }));
  }
  const query = currentFootprintForwardHeadQuery({ projectUuid: IDS.project, branchUuid: IDS.branch });
  assert.equal(query.sql.includes(IDS.project), false); assert.deepEqual(query.parameters, [IDS.branch, IDS.project, IDS.branch]);
});
void test("head rows reject aliases, duplicate counts and accessors before selecting data", async () => {
  const row = decodeCurrentFootprintForwardHeadRow(await read(), reference);
  for (const name of ["projectCount", "branchCount", "headCount"] as const) {
    assert.throws(() => decodeCurrentFootprintForwardHeadRow({ ...row, [name]: 2 }, reference));
  }
  let calls = 0;
  const accessor = { ...row }; Object.defineProperty(accessor, "headUuid", { enumerable: true, get: (): string => { calls += 1; return IDS.oldHead; } });
  assert.throws(() => decodeCurrentFootprintForwardHeadRow(accessor, reference)); assert.equal(calls, 0);
});
