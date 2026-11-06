import assert from "node:assert/strict";
import { test } from "node:test";
import { assertOriginalGeneratedFixtureTarget, qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import { compareGeneratedFixtureClosedSources, compareGeneratedSchematicFixtureClosedSources } from "../src/managed-fixture-closed-snapshot.ts";
import { assertOriginalGeneratedSchematicFixtureTarget, originalGeneratedSchematicFixtureInventory, qualifyGeneratedSchematicFixtureInitialSql } from "../src/managed-schematic-fixture-initial-sql.ts";
import { consumeManagedSchematicFixtureOpeningSource, stageManagedSchematicFixtureOpeningSource, stageRequalifiedManagedSchematicFixtureOpeningSource } from "../src/managed-schematic-fixture-opening-source.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";
import { managedSchematicFixtureInitialSqlFixture } from "./helpers/managed-schematic-fixture-initial-sql.ts";
import type { WindowsControlRuntimeStatus } from "../src/windows-runtime.ts";

function originalRuntime(id: string): { status: () => WindowsControlRuntimeStatus } {
  return { status: () => ({ state: "owned", launch: { jobId: id.repeat(32), helperInstance: id.repeat(32), root: { pid: id === "a" ? 100 : 200, role: "easyeda-main",
    startIdentity: `win32:123456789012345:job:${id.repeat(32)}` } }, executableSha256: "a".repeat(64), reviewedExecutionScopeSha256: "b".repeat(64) }) };
}

void test("complete fresh SCH/SCH_PAGE SQL and source issue a distinct original data target", async () => {
  const input = await managedSchematicFixtureInitialSqlFixture(), result = await qualifyGeneratedSchematicFixtureInitialSql(input);
  assertOriginalGeneratedSchematicFixtureTarget(result.qualification); assert.equal(originalGeneratedSchematicFixtureInventory(result.qualification), input.inventory);
  assert.equal(result.qualification.completeSchematicAndPageRosterQualified, true); assert.equal(result.qualification.nativePageReadinessVerified, false);
  assert.equal(result.qualification.electricalConnectivityVerified, false); assert.equal(result.qualification.registrationVerified, false);
  assert.equal(Object.hasOwn(result.qualification.target, "documentUuid"), false); assert.notEqual(result.qualification.target.schematicUuid, result.qualification.target.pageUuid);
  assert.deepEqual(result.history.documents.map(document => [document.docType, document.records.length]), [["SCH", 1], ["SCH_PAGE", 6]]);
  assert.equal(compareGeneratedSchematicFixtureClosedSources(input.archive, result.history)["completeDocumentAndBodyRosterMatched"], true);
  assert.throws(() => compareGeneratedFixtureClosedSources(input.archive, result.history));
  assert.throws(() => { assertOriginalGeneratedSchematicFixtureTarget(structuredClone(result.qualification)); });
  assert.throws(() => Reflect.apply(assertOriginalGeneratedFixtureTarget, undefined, [result.qualification]));
  const importingRuntime = originalRuntime("a"); const fresh = originalRuntime("b");
  const staged = stageManagedSchematicFixtureOpeningSource({ qualification: result.qualification, archive: input.archive, importingRuntime });
  assert.throws(() => consumeManagedSchematicFixtureOpeningSource(structuredClone(staged), fresh));
  assert.throws(() => consumeManagedSchematicFixtureOpeningSource(staged, importingRuntime));
  assert.throws(() => consumeManagedSchematicFixtureOpeningSource(staged, originalRuntime("a")));
  assert.equal(consumeManagedSchematicFixtureOpeningSource(staged, fresh).qualification, result.qualification);
  assert.throws(() => consumeManagedSchematicFixtureOpeningSource(staged, fresh));
  assert.throws(() => stageManagedSchematicFixtureOpeningSource({ qualification: result.qualification, archive: input.archive, importingRuntime }));
  await assert.rejects(qualifyGeneratedFixtureInitialSql(input), /generated filename/u);
  await assert.rejects(qualifyGeneratedSchematicFixtureInitialSql(await managedFixtureInitialSqlFixture()), /schematic filename/u);
});
void test("SCH initial qualification covers all auxiliary rows, parent structure, original bytes, unticked page header and history roster", async () => {
  for (const patch of ["extra-auxiliary", "wrong-structure-parent", "changed-text", "ticked-page-header", "extra-history"] as const) {
    await assert.rejects(qualifyGeneratedSchematicFixtureInitialSql(await managedSchematicFixtureInitialSqlFixture(patch)));
  }
  const input = await managedSchematicFixtureInitialSqlFixture(); await assert.rejects(qualifyGeneratedSchematicFixtureInitialSql({ ...input, inventory: structuredClone(input.inventory) }));
});
void test("SCH qualification snapshots its original archive/path/times before native history decoding", async () => {
  const original = await managedSchematicFixtureInitialSqlFixture(); const input = { ...original, archive: Buffer.from(original.archive) };
  const pending = qualifyGeneratedSchematicFixtureInitialSql(input); input.rawWindowsPath += "substituted"; input.sourceModifiedEpochMs += 120_000; input.archive.fill(0);
  const result = await pending; assert.equal(result.qualification.target.rawWindowsPath, original.rawWindowsPath);
  assert.equal(result.qualification.sourceModifiedEpochMs, original.sourceModifiedEpochMs); assertOriginalGeneratedSchematicFixtureTarget(result.qualification);
});

void test("new requalified schematic data stages once without inventing an importing launch and still refuses copied qualifications", async () => {
  const input = await managedSchematicFixtureInitialSqlFixture(); const result = await qualifyGeneratedSchematicFixtureInitialSql(input);
  assert.throws(() => stageRequalifiedManagedSchematicFixtureOpeningSource({ qualification: structuredClone(result.qualification), archive: input.archive }));
  const staged = stageRequalifiedManagedSchematicFixtureOpeningSource({ qualification: result.qualification, archive: input.archive }); const fresh = originalRuntime("b");
  assert.throws(() => consumeManagedSchematicFixtureOpeningSource(structuredClone(staged), fresh));
  assert.equal(consumeManagedSchematicFixtureOpeningSource(staged, fresh).qualification, result.qualification);
  assert.throws(() => consumeManagedSchematicFixtureOpeningSource(staged, fresh));
});
