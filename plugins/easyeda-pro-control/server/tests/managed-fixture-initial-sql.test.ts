import assert from "node:assert/strict";
import { test } from "node:test";
import { assertOriginalGeneratedFixtureTarget, qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";

void test("the source-specific complete fresh baseline issues one original read/open target without inventing a DOCHEAD ticket", async () => {
  const input = await managedFixtureInitialSqlFixture(), result = await qualifyGeneratedFixtureInitialSql(input);
  assertOriginalGeneratedFixtureTarget(result.qualification);
  assert.equal(result.qualification.completeInitialSqlRowsQualified, true); assert.equal(result.qualification.untickedDocHeadQualified, true);
  assert.equal(result.qualification.nativeLocalOffsetMinutes, 60); assert.equal(result.qualification.writerClockAuthority, false);
  assert.equal(result.qualification.registrationVerified, false); assert.equal(result.qualification.designExecutionAuthorized, false);
  assert.equal(result.history.documents.length, 1); assert.equal(result.history.documents[0]?.records.length, 3);
  assert.throws(() => { assertOriginalGeneratedFixtureTarget(structuredClone(result.qualification)); });
});

void test("complete fresh qualification rejects extra auxiliary rows, changed seed/defaults, extra history and rewritten native header", async () => {
  for (const patch of ["extra-empty-table-row", "changed-seed", "extra-history", "changed-header", "bad-sequence"] as const) {
    const input = await managedFixtureInitialSqlFixture(patch); await assert.rejects(qualifyGeneratedFixtureInitialSql(input));
  }
  const input = await managedFixtureInitialSqlFixture();
  await assert.rejects(qualifyGeneratedFixtureInitialSql({ ...input, rawWindowsPath: input.rawWindowsPath.replace("SyntheticTemp", "Substituted") }));
  await assert.rejects(qualifyGeneratedFixtureInitialSql({ ...input, sourceModifiedEpochMs: input.sourceCreatedEpochMs + 120_000 }));
});
void test("qualification snapshots the exact archive, path and raw file times before asynchronous native decoding", async () => {
  const original = await managedFixtureInitialSqlFixture(); const archive = Buffer.from(original.archive);
  const input = { ...original, archive }; const pending = qualifyGeneratedFixtureInitialSql(input);
  input.rawWindowsPath = input.rawWindowsPath.replace("SyntheticTemp", "Substituted"); input.sourceModifiedEpochMs += 120_000; archive.fill(0);
  const result = await pending; assert.equal(result.qualification.target.rawWindowsPath, original.rawWindowsPath);
  assert.equal(result.qualification.sourceModifiedEpochMs, original.sourceModifiedEpochMs); assertOriginalGeneratedFixtureTarget(result.qualification);
});
