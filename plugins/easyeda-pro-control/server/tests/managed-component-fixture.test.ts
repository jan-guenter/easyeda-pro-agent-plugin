/** Complete synthetic archive/SQLite checks only, never a native cache/import. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { compareGeneratedComponentFixtureClosedSources } from "../src/managed-fixture-closed-snapshot.ts";
import { qualifyManagedFixtureArchive } from "../src/managed-fixture-archive.ts";
import { MANAGED_COMPONENT_FIXTURE_KIND, generateManagedComponentFixtureArchiveData } from "../src/managed-component-fixture-generator.ts";
import { assertOriginalGeneratedComponentFixtureTarget, qualifyGeneratedComponentFixtureInitialSql } from "../src/managed-component-fixture-initial-sql.ts";
import { assertOriginalGeneratedPadFixtureTarget } from "../src/managed-pad-fixture-initial-sql.ts";
import { consumeManagedComponentFixtureOpeningSource, stageManagedComponentFixtureOpeningSource } from "../src/managed-component-fixture-opening-source.ts";
import { consumeManagedPcbReadOpeningSource } from "../src/managed-pcb-fixture-read-source.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";

void test("fresh Component archive retains its real footprint Pad and all four explicit hidden attributes", () => {
  const first = generateManagedComponentFixtureArchiveData(); const second = generateManagedComponentFixtureArchiveData(); const archive = qualifyManagedFixtureArchive(first.bytes);
  assert.notEqual(first.name, second.name); assert.deepEqual(archive.documents.map(row => ({ type: row.documentType, count: row.recordCount, families: row.recordTypes })), [
    { type: "FOOTPRINT", count: 5, families: ["ATTR", "DOCHEAD", "META", "PAD"] }, { type: "PCB", count: 5, families: ["ATTR", "COMPONENT", "DOCHEAD", "META"] }]);
  assert.equal(first.metadata["intendedOwnedPadId"], String(first.metadata["componentId"]) + String(first.metadata["padId"]));
  assert.equal(first.metadata["nativeComponentCacheQualified"], false); assert.equal(first.metadata["nativeIndexQualified"], false); assert.equal(first.metadata["nativeImportExecuted"], false);
});
void test("distinct initial model qualifies full SQL and paired documents but no native cache/index or old target", async () => {
  const input = await managedFixtureInitialSqlFixture(undefined, MANAGED_COMPONENT_FIXTURE_KIND), result = await qualifyGeneratedComponentFixtureInitialSql(input);
  assertOriginalGeneratedComponentFixtureTarget(result.qualification); assert.equal(input.inventory.tables.length, 35);
  const compared = compareGeneratedComponentFixtureClosedSources(input.archive, result.history); assert.equal(compared["completeDocumentAndBodyRosterMatched"], true); assert.equal(compared["nativeComponentCacheQualified"], false);
  assert.deepEqual(result.history.documents.map(doc => ({ type: doc.docType, rows: doc.records.length })).toSorted((left, right) => left.type.localeCompare(right.type)), [{ type: "FOOTPRINT", rows: 4 }, { type: "PCB", rows: 4 }]);
  assert.equal(result.qualification.nativeComponentCacheQualified, false); assert.equal(result.qualification.nativeIndexQualified, false); assert.equal(result.qualification.registrationVerified, false);
  assert.throws(() =>{  assertOriginalGeneratedComponentFixtureTarget(structuredClone(result.qualification)); }); assert.throws(() => Reflect.apply(assertOriginalGeneratedPadFixtureTarget, undefined, [result.qualification]));
  const stage = stageManagedComponentFixtureOpeningSource({ qualification: result.qualification, archive: input.archive });
  assert.throws(() => consumeManagedComponentFixtureOpeningSource(structuredClone(stage))); assert.throws(() => Reflect.apply(consumeManagedPcbReadOpeningSource, undefined, [stage]));
  const source = consumeManagedComponentFixtureOpeningSource(stage); assert.equal(source.qualification, result.qualification); assert.deepEqual(source.archive, input.archive);
  assert.throws(() => consumeManagedComponentFixtureOpeningSource(stage)); assert.throws(() => stageManagedComponentFixtureOpeningSource({ qualification: result.qualification, archive: input.archive }));
});
void test("changed Component orientation, footprint UUID, headers or any formerly empty SQL row refuse", async () => {
  for (const patch of ["changed-component", "changed-footprint-link", "changed-attr-origin", "changed-header", "extra-empty-table-row"] as const) {
    await assert.rejects(qualifyGeneratedComponentFixtureInitialSql(await managedFixtureInitialSqlFixture(patch, MANAGED_COMPONENT_FIXTURE_KIND)));
  }
});
