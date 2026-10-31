/** Synthetic complete-reader relations only. No editor or native writer runs. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { requireCurrentFootprintCopyDeleteSqlLifecycle, verifyCurrentFootprintCopyDeleteSqlLifecycle } from "../src/current-footprint-copy-delete-sql-lifecycle.ts";
import type { CurrentFootprintCopyDeleteSqlInput } from "../src/current-footprint-copy-delete-sql-lifecycle.ts";
import { verifyCurrentFootprintCopyV2SqlEffect } from "../src/current-footprint-copy-v2-sql.ts";
import { prepareCurrentFootprintDeleteSqlPlan, verifyCurrentFootprintDeleteSqlEffect } from "../src/current-footprint-delete-sql.ts";
import { DELETE_TARGET, footprintDeleteSqlFixture } from "./helpers/current-footprint-delete-sql-fixture.ts";
import { IDS, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

/** Retain the actual independently completed copy readback as delete baseline. */
async function lifecycle(): Promise<Readonly<{ input: CurrentFootprintCopyDeleteSqlInput; path: string }>> {
  const fixture = await footprintDeleteSqlFixture();
  const deleteSqlPlan = await prepareCurrentFootprintDeleteSqlPlan(fixture.input);
  fixture.apply();
  const deleteAfter = await inventory(fixture.path);
  const deleteEffect = await verifyCurrentFootprintDeleteSqlEffect(deleteSqlPlan, deleteAfter);
  return { path: fixture.path, input: {
    copySqlPlan: fixture.input.copySqlPlan, copyEffect: fixture.input.copyEffect,
    copyAfter: fixture.input.copyAfter, copySaved: fixture.input.before,
    deleteSqlPlan, deleteEffect, deleteAfter, deleteSaved: await inventory(fixture.path),
  } };
}

void test("complete logical copy/readback/delete/readback restores the original visible roster with retained history", async () => {
  const { input } = await lifecycle();
  const relation = await verifyCurrentFootprintCopyDeleteSqlLifecycle(input);
  assert.equal(requireCurrentFootprintCopyDeleteSqlLifecycle(relation), relation);
  assert.equal(relation.originalReaderCount, 5); assert.equal(relation.historyAppends, 2);
  assert.equal(relation.targetUuid, DELETE_TARGET); assert.equal(relation.sourceUuid, IDS.target);
  assert.equal(relation.retainedDocumentsBefore, 2); assert.equal(relation.retainedDocumentsAfter, 3); assert.equal(relation.visibleDocuments, 2);
  assert.equal(relation.copySqlSha256, input.copyAfter.logicalSha256); assert.equal(relation.copySavedSqlSha256, input.copySaved.logicalSha256);
  assert.equal(relation.deleteSqlSha256, input.deleteAfter.logicalSha256); assert.equal(relation.deleteSavedSqlSha256, input.deleteSaved.logicalSha256);
  assert.equal(relation.originalVisibleRosterRestored, true); assert.equal(relation.createdCopyHistoryRetained, true);
  assert.notEqual(relation.beforeSqlSha256, relation.deleteSavedSqlSha256);
  for (const field of ["databaseRestored", "nativeManagerAbsenceVerified", "persistentUploadReplayExcluded", "generationClosureVerified",
    "reopened", "nativeClockProvenanceVerified", "executionAuthorized"] as const) { assert.equal(relation[field], false); }
  assert.throws(() => requireCurrentFootprintCopyDeleteSqlLifecycle(structuredClone(relation)), /ORIGINAL_RELATION/u);
});

void test("readers must be independent and the saved-copy reader must be the inverse's actual original baseline", async () => {
  const { input, path } = await lifecycle();
  await assert.rejects(verifyCurrentFootprintCopyDeleteSqlLifecycle({ ...input, copySaved: input.copyAfter }), /INDEPENDENT_READERS/u);
  await assert.rejects(verifyCurrentFootprintCopyDeleteSqlLifecycle({ ...input, deleteSaved: input.deleteAfter }), /INDEPENDENT_READERS/u);
  await assert.rejects(verifyCurrentFootprintCopyDeleteSqlLifecycle({ ...input, copySaved: await inventory(path) }), /ORIGINAL_EFFECT_CHAIN/u);
  await assert.rejects(verifyCurrentFootprintCopyDeleteSqlLifecycle({ ...input, deleteSaved: structuredClone(input.deleteSaved) }), /original inventory/u);
});

void test("a separately issued effect over identical SQL cannot replace the inverse's original forward relation", async () => {
  const { input } = await lifecycle();
  const secondEffect = await verifyCurrentFootprintCopyV2SqlEffect(input.copySqlPlan, input.copyAfter, { returnedUuid: DELETE_TARGET });
  assert.notEqual(secondEffect, input.copyEffect);
  assert.deepEqual(secondEffect, input.copyEffect);
  await assert.rejects(verifyCurrentFootprintCopyDeleteSqlLifecycle({ ...input, copyEffect: secondEffect }), /ORIGINAL_EFFECT_CHAIN/u);
  await assert.rejects(verifyCurrentFootprintCopyDeleteSqlLifecycle({ ...input, copyEffect: structuredClone(input.copyEffect) }), /original/u);
});

void test("a retained delete effect does not hide a collateral change in the later saved reader", async () => {
  const { input, path } = await lifecycle();
  mutate(path, "UPDATE resources SET dataStr='unrelated change after inverse'");
  await assert.rejects(verifyCurrentFootprintCopyDeleteSqlLifecycle({ ...input, deleteSaved: await inventory(path) }), /equality refused/u);
});

void test("outer getters and proxies cannot run while capturing original input references", async () => {
  const { input } = await lifecycle(); let calls = 0;
  const accessor = { ...input, get copyEffect(): unknown { calls += 1; return input.copyEffect; } };
  await assert.rejects(verifyCurrentFootprintCopyDeleteSqlLifecycle(accessor), /INPUT_ACCESSORS/u);
  const proxy = new Proxy(input, { ownKeys(): string[] { calls += 1; return []; } });
  await assert.rejects(verifyCurrentFootprintCopyDeleteSqlLifecycle(proxy), /LIFECYCLE_INPUT/u);
  assert.equal(calls, 0);
});
