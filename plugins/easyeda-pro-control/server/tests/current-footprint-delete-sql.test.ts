/** Pure exact SQL and saved tombstone comparisons over private synthetic files.
 * No supplied native success flag grants persistence or an inverse writer. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { completedCurrentFootprintDeleteSqlSource, prepareCurrentFootprintDeleteSqlPlan, verifyCurrentFootprintDeleteSqlEffect } from "../src/current-footprint-delete-sql.ts";
import { prepareCurrentFootprintDeleteSavedProjection, verifyCurrentFootprintDeleteSavedAbsence } from "../src/current-footprint-delete-saved-source.ts";
import { DELETE_HEAD, DELETE_TARGET, footprintDeleteSqlFixture } from "./helpers/current-footprint-delete-sql-fixture.ts";
import { IDS, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

void test("one-clock delete preserves full SQL peers and retained records, then proves only logical saved absence", async () => {
  const f = await footprintDeleteSqlFixture(), plan = await prepareCurrentFootprintDeleteSqlPlan(f.input);
  assert.equal(plan.targetUuid, DELETE_TARGET); assert.equal(plan.expectedTicket, 103); assert.equal(plan.headEligibility, "aged-unlocked");
  assert.equal(plan.documentClockCalls, 1); assert.equal(plan.explicitSaveAttempts, 0); assert.equal(plan.expectedStructureRequests, 0);
  f.apply(); const after = await inventory(f.path), effect = await verifyCurrentFootprintDeleteSqlEffect(plan, after);
  assert.equal(effect["exactLogicalSqlEffect"], true); assert.equal(effect["targetHistoricalRecordsRetained"], true); assert.equal(effect["allPeerDocumentsUnchanged"], true);
  const source = completedCurrentFootprintDeleteSqlSource(plan, effect, after);
  assert.equal(source.after, after); assert.equal(source.before, f.input.before); assert.equal(source.workerUpload.split("|\n").length, 2);
  const projection = await prepareCurrentFootprintDeleteSavedProjection(plan, effect, after);
  assert.equal(projection.retainedDocuments, 3); assert.equal(projection.visibleDocuments, 2); assert.equal(projection.targetLogicallyDeleted, true);
  await assert.rejects(verifyCurrentFootprintDeleteSavedAbsence(projection, after), /independently completed/u);
  const saved = await verifyCurrentFootprintDeleteSavedAbsence(projection, await inventory(f.path));
  assert.equal(saved["exactLogicalSqlUnchanged"], true); assert.equal(saved["targetHistoryRetained"], true);
  for (const field of ["executionAuthorized", "producerBindingVerified", "dependencyEligibilityVerified", "nativeClockProvenanceVerified", "completionProved", "generationClosureVerified", "savedAbsenceVerified", "reopened"]) {
    assert.equal(effect[field], false);
  }
  assert.equal(saved["nativeManagerAbsenceVerified"], false); assert.equal(saved["persistentUploadReplayExcluded"], false); assert.equal(saved["reopened"], false);
  await assert.rejects(verifyCurrentFootprintDeleteSavedAbsence(structuredClone(projection), after), /original projection/u);
  assert.throws(() => completedCurrentFootprintDeleteSqlSource(plan, structuredClone(effect), after), /original/u);
  assert.throws(() => completedCurrentFootprintDeleteSqlSource(plan, effect, structuredClone(after)), /original/u);
  await assert.rejects(verifyCurrentFootprintDeleteSqlEffect(structuredClone(plan), after), /original/u);
});

void test("false native upload success and collateral SQL changes never become delete effects", async () => {
  const f = await footprintDeleteSqlFixture(), plan = await prepareCurrentFootprintDeleteSqlPlan(f.input);
  // The pinned delete method returns success even when uploadLocal returns
  // False. An unchanged independently read database still lacks the append.
  await assert.rejects(verifyCurrentFootprintDeleteSqlEffect(plan, await inventory(f.path)), /newly allocated row/u);
  f.apply(); mutate(f.path, "UPDATE resources SET dataStr='collateral'");
  await assert.rejects(verifyCurrentFootprintDeleteSqlEffect(plan, await inventory(f.path)), /full cell effect/u);
  mutate(f.path, "UPDATE resources SET dataStr='keep raw peer bytes';CREATE INDEX delete_extra_schema ON projects(name)");
  await assert.rejects(verifyCurrentFootprintDeleteSqlEffect(plan, await inventory(f.path)), /schema/u);
});

void test("raw deletion must keep the original prefix and exact target, ticket, clock, client and tombstone bytes", async () => {
  for (const change of [
    (raw: string): string => raw.replace('"isDelete":true', '"isDelete":false'),
    (raw: string): string => raw.replace(DELETE_TARGET, IDS.target),
    (raw: string): string => `${raw}|\n`,
  ]) {
    const f = await footprintDeleteSqlFixture(), plan = await prepareCurrentFootprintDeleteSqlPlan(f.input);
    f.apply(change(f.raw)); await assert.rejects(verifyCurrentFootprintDeleteSqlEffect(plan, await inventory(f.path)), /tombstone|three-record/u);
  }
});

void test("original copy relation and aged native head are required before preparing any inverse", async () => {
  const f = await footprintDeleteSqlFixture();
  await assert.rejects(prepareCurrentFootprintDeleteSqlPlan({ ...f.input, copyEffect: structuredClone(f.input.copyEffect) }), /original/u);
  await assert.rejects(prepareCurrentFootprintDeleteSqlPlan({ ...f.input, before: structuredClone(f.input.before) }), /original/u);
  await assert.rejects(prepareCurrentFootprintDeleteSqlPlan({ ...f.input, witness: { ...f.input.witness,
    agedHead: { ...f.input.witness.agedHead, nativeParsedLocalMs: f.input.witness.backendClockMinMs } } }), /age/u);
  let invoked = 0;
  const witness = { ...f.input.witness, get client(): string { invoked += 1; return "a".repeat(16); } };
  await assert.rejects(prepareCurrentFootprintDeleteSqlPlan({ ...f.input, witness }), /accessors/u); assert.equal(invoked, 0);
  const plan = await prepareCurrentFootprintDeleteSqlPlan(f.input); f.apply(); const after = await inventory(f.path);
  const effect = await verifyCurrentFootprintDeleteSqlEffect(plan, after), projection = await prepareCurrentFootprintDeleteSavedProjection(plan, effect, after);
  mutate(f.path, `UPDATE history_data SET updated_at='changed' WHERE history_uuid='${DELETE_HEAD}'`);
  await assert.rejects(verifyCurrentFootprintDeleteSavedAbsence(projection, await inventory(f.path)));
});
