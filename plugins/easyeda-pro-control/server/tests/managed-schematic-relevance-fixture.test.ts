/* oxlint-disable import/max-dependencies -- Separate generated data, complete SQL, private staging and actual guarded readers must join without an old-profile alias. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { generateManagedSchematicRelevanceFixtureArchiveData } from "../src/managed-schematic-relevance-fixture-generator.ts";
import { assertOriginalGeneratedSchematicRelevanceFixtureTarget, qualifyGeneratedSchematicRelevanceFixtureInitialSql } from "../src/managed-schematic-relevance-fixture-initial-sql.ts";
import { qualifyGeneratedSchematicFixtureInitialSql } from "../src/managed-schematic-fixture-initial-sql.ts";
import { stageManagedSchematicRelevanceFixtureOpeningSource } from "../src/managed-schematic-relevance-fixture-opening-source.ts";
import { consumeManagedSchematicReadOpeningSource } from "../src/managed-schematic-fixture-read-source.ts";
import { buildGeneratedSchematicNavigationProgram, buildGeneratedSchematicReadersProgram, validateGeneratedSchematicNavigation, validateGeneratedSchematicReaders } from "../src/managed-schematic-fixture-opening-program.ts";
import { qualifyManagedFixtureArchive } from "../src/managed-fixture-archive.ts";
import { generatedSchematicOpeningVm } from "./helpers/generated-schematic-opening-vm.ts";
import { managedSchematicFixtureInitialSqlFixture } from "./helpers/managed-schematic-fixture-initial-sql.ts";

type Runtime = Parameters<typeof stageManagedSchematicRelevanceFixtureOpeningSource>[0]["importingRuntime"];
const runtime = (digit: string): Runtime => ({ status: () => ({ state: "owned", launch: { jobId: digit.repeat(32), helperInstance: "3".repeat(32),
    root: { pid: 123, role: "easyeda-main", startIdentity: `win32:123456789012345:job:${digit.repeat(32)}` } }, executableSha256: "4".repeat(64), reviewedExecutionScopeSha256: "5".repeat(64) }) });

void test("Relevance fixture keeps both real SCH documents and one explicit source Wire ATTR under its own initial profile", async () => {
  const generated = generateManagedSchematicRelevanceFixtureArchiveData(); const archive = qualifyManagedFixtureArchive(generated.bytes);
  assert.deepEqual(archive.documents.map(value => value.recordTypes), [["DOCHEAD", "META"], ["ATTR", "BUS", "DOCHEAD", "LINE", "META", "TEXT", "WIRE"]]);
  const input = await managedSchematicFixtureInitialSqlFixture(undefined, "relevance"), result = await qualifyGeneratedSchematicRelevanceFixtureInitialSql(input);
  assertOriginalGeneratedSchematicRelevanceFixtureTarget(result.qualification);
  assert.equal(result.qualification.schema, "easyeda-pro-control.qualified-generated-schematic-relevance-fixture-target.v1");
  const page = result.history.documents.find(value => value.docType === "SCH_PAGE"); assert.equal(page?.records.length, 7);
  const attr = page?.records.find(value => value.type === "ATTR"), wire = page?.records.find(value => value.type === "WIRE");
  assert.equal(attr?.ticket, 7); assert.equal(attr?.body["parentId"], wire?.id); assert.equal(attr?.body["key"], "Relevance"); assert.equal(attr?.body["value"], "[]");
  assert.throws(() => { assertOriginalGeneratedSchematicRelevanceFixtureTarget(structuredClone(result.qualification)); });
  await assert.rejects(qualifyGeneratedSchematicFixtureInitialSql(input));
  for (const patch of ["changed-relevance", "wrong-structure-parent", "extra-auxiliary"] as const) {
    await assert.rejects(qualifyGeneratedSchematicRelevanceFixtureInitialSql(await managedSchematicFixtureInitialSqlFixture(patch, "relevance")));
  }
});
void test("new data staging refuses the importing runtime and copied token, then consumes once on a different original ordinary launch", async () => {
  const input = await managedSchematicFixtureInitialSqlFixture(undefined, "relevance"), result = await qualifyGeneratedSchematicRelevanceFixtureInitialSql(input);
  const fresh = runtime("2"), importing = runtime("1");
  const stage = stageManagedSchematicRelevanceFixtureOpeningSource({ qualification: result.qualification, archive: input.archive, importingRuntime: importing });
  assert.throws(() => consumeManagedSchematicReadOpeningSource(stage, importing));
  assert.throws(() => consumeManagedSchematicReadOpeningSource(structuredClone(stage), fresh));
  const source = consumeManagedSchematicReadOpeningSource(stage, fresh); assert.equal(source.qualification, result.qualification);
  assert.throws(() => consumeManagedSchematicReadOpeningSource(stage, fresh));
});
void test("separate Relevance data reaches exact once-only navigation and all guarded Text/Wire/Bus readers with the explicit child roster", async () => {
  const result = await qualifyGeneratedSchematicRelevanceFixtureInitialSql(await managedSchematicFixtureInitialSqlFixture(undefined, "relevance"));
  const fixture = generatedSchematicOpeningVm(result.qualification, result.history);
  const raw = await fixture.run(buildGeneratedSchematicNavigationProgram(result.qualification));
  assert.equal(validateGeneratedSchematicNavigation(decodeExactReadEnvelope(raw), result.qualification).outcome, "opened-ready");
  const readersRaw = await fixture.run(buildGeneratedSchematicReadersProgram(result.qualification, "original-window"));
  const readers = validateGeneratedSchematicReaders(decodeExactReadEnvelope(readersRaw), result.qualification, result.history, "original-window");
  assert.equal(readers["schema"], "easyeda-pro-control.generated-schematic-relevance-readers-result.v1"); assert.equal(readers["persistenceVerified"], false);
  assert.deepEqual(fixture.evaluate("[calls.registration,calls.project,calls.page]"), [1, 1, 1]);
  const packet = decodeExactReadEnvelope(readersRaw); assert.ok(packet !== null && typeof packet === "object" && "values" in packet && Array.isArray(packet.values));
  const wire: unknown = packet.values[1]; assert.ok(wire !== null && typeof wire === "object" && "json" in wire && typeof wire.json === "string" && "utf8Bytes" in wire);
  const value: unknown = JSON.parse(wire.json); assert.ok(value !== null && typeof value === "object" && "value" in value && Array.isArray(value.value));
  const group: unknown = value.value[0]; assert.ok(group !== null && typeof group === "object" && "customAttributeIds" in group);
  group.customAttributeIds = []; const changedJson = JSON.stringify(value); wire.json = changedJson; wire.utf8Bytes = Buffer.byteLength(changedJson);
  assert.throws(() => validateGeneratedSchematicReaders(packet, result.qualification, result.history, "original-window"));
});
