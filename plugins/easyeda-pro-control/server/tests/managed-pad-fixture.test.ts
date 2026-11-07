import assert from "node:assert/strict";
import { test } from "node:test";
import { qualifyManagedFixtureArchive } from "../src/managed-fixture-archive.ts";
import { MANAGED_PAD_FIXTURE_BODY, MANAGED_PAD_FIXTURE_KIND, generateManagedPadFixtureArchiveData } from "../src/managed-pad-fixture-generator.ts";
import { assertOriginalGeneratedPadFixtureTarget, qualifyGeneratedPadFixtureInitialSql } from "../src/managed-pad-fixture-initial-sql.ts";
import { assertOriginalGeneratedFixtureTarget, qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import { consumeManagedPadFixtureOpeningSource, stageManagedPadFixtureOpeningSource } from "../src/managed-pad-fixture-opening-source.ts";
import { consumeManagedPcbReadOpeningSource } from "../src/managed-pcb-fixture-read-source.ts";
import { readManagedLibraryZip } from "../src/managed-library-files-zip.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";

void test("fresh Pad archive has exactly one native PCB and its fixed independent circular SMT record", () => {
  const another = generateManagedPadFixtureArchiveData(), generated = generateManagedPadFixtureArchiveData();
  const archive = qualifyManagedFixtureArchive(generated.bytes);
  assert.deepEqual(archive.documents.map(row => row.recordTypes), [["DOCHEAD", "META", "PAD"]]);
  assert.equal(archive.documents[0]?.recordCount, 3); assert.notEqual(another.name, generated.name);
  const source = readManagedLibraryZip(generated.bytes).get(archive.source.member); assert.ok(source !== undefined);
  const line = source.toString().slice(0, -2).split("|\n")[2]; assert.ok(line !== undefined);
  const raw = line.slice(line.indexOf("||") + 2); const body: unknown = JSON.parse(raw); assert.deepEqual(body, MANAGED_PAD_FIXTURE_BODY);
  assert.equal(generated.metadata["nativeImportExecuted"], false); assert.equal(generated.metadata["componentDependency"], false);
});
void test("complete Pad initial SQL has a distinct original target and rejects the old profile, copies and changed payloads", async () => {
  const input = await managedFixtureInitialSqlFixture(undefined, MANAGED_PAD_FIXTURE_KIND), result = await qualifyGeneratedPadFixtureInitialSql(input);
  assertOriginalGeneratedPadFixtureTarget(result.qualification);
  assert.equal(result.qualification.schema, "easyeda-pro-control.qualified-generated-pad-fixture-target.v1");
  assert.equal(result.history.documents[0]?.records.length, 2); assert.equal(result.history.documents[0]?.records.find(row => row.type === "PAD")?.ticket, 2);
  assert.equal(result.qualification.registrationVerified, false); assert.equal(result.qualification.writerClockAuthority, false);
  assert.throws(() => { assertOriginalGeneratedPadFixtureTarget(structuredClone(result.qualification)); });
  // The old public data shape is deliberately incompatible; no alias is issued.
  assert.throws(() => { Reflect.apply(assertOriginalGeneratedFixtureTarget, undefined, [result.qualification]); });
  await assert.rejects(qualifyGeneratedFixtureInitialSql(input));
  for (const patch of ["changed-pad", "extra-empty-table-row", "changed-header"] as const) {
    await assert.rejects(qualifyGeneratedPadFixtureInitialSql(await managedFixtureInitialSqlFixture(patch, MANAGED_PAD_FIXTURE_KIND)));
  }
});
void test("only one genuine Pad staging token transfers immutable data into the reader preparation branch", async () => {
  const input = await managedFixtureInitialSqlFixture(undefined, MANAGED_PAD_FIXTURE_KIND), result = await qualifyGeneratedPadFixtureInitialSql(input);
  const staged = stageManagedPadFixtureOpeningSource({ qualification: result.qualification, archive: input.archive });
  assert.equal(staged.schema, "private.generated-pad-fixture-opening-source.v1");
  assert.throws(() => consumeManagedPadFixtureOpeningSource(structuredClone(staged)));
  const source = consumeManagedPcbReadOpeningSource(staged); assert.equal(source.qualification, result.qualification); assert.deepEqual(source.archive, input.archive);
  assert.throws(() => consumeManagedPcbReadOpeningSource(staged));
  assert.throws(() => stageManagedPadFixtureOpeningSource({ qualification: result.qualification, archive: input.archive }));
});
