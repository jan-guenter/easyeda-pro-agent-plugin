import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { qualifyManagedFixtureArchive } from "../src/managed-fixture-archive.ts";
import { readManagedLibraryZip } from "../src/managed-library-files-zip.ts";
import { generateManagedSchematicFixtureArchiveData } from "../src/managed-schematic-fixture-generator.ts";

const rowSchema = z.object({ header: z.object({ type: z.string(), id: z.string().optional(), ticket: z.number().optional() }), body: z.record(z.string(), z.unknown()) });
function rows(bytes: Buffer): readonly z.infer<typeof rowSchema>[] {
  const members = readManagedLibraryZip(bytes); assert.deepEqual([...members.keys()], ["project2.json", "Fixture.epru"]);
  const source = members.get("Fixture.epru"); assert.ok(source !== undefined);
  return source.toString("utf8").slice(0, -2).split("|\n").map((text) => {
    const boundary = text.indexOf("||"); assert.ok(boundary > 0);
    return rowSchema.parse({ header: JSON.parse(text.slice(0, boundary)) as unknown, body: JSON.parse(text.slice(boundary + 2)) as unknown });
  });
}
void test("schematic fixture has complete parent/page and disjoint Wire/Bus ownership without library dependencies", () => {
  const generated = generateManagedSchematicFixtureArchiveData(), qualification = qualifyManagedFixtureArchive(generated.bytes), source = rows(generated.bytes);
  assert.deepEqual(qualification.documents.map((doc) => doc.documentType), ["SCH", "SCH_PAGE"]);
  assert.deepEqual(source.map((row) => row.header.type), ["DOCHEAD", "META", "DOCHEAD", "META", "TEXT", "WIRE", "LINE", "BUS", "LINE"]);
  assert.equal(source[3]?.body["schematic"], source[0]?.body["uuid"]);
  assert.equal(source[6]?.body["lineGroup"], source[5]?.header.id); assert.equal(source[8]?.body["lineGroup"], source[7]?.header.id);
  assert.notEqual(source[6]?.body["lineGroup"], source[8]?.body["lineGroup"]);
  assert.notEqual(source[6]?.body["startY"], source[8]?.body["startY"]);
  assert.deepEqual(source.slice(4).map((row) => row.header.ticket), [2, 3, 4, 5, 6]);
  for (const row of source.slice(4)) { assert.match(row.header.id ?? "", /^0[a-f0-9]{15}$/u); }
  for (const key of ["existingProjectRead", "sqliteAccessed", "nativeImportExecuted", "nativeSceneVerified", "nativeImportabilityVerified", "connectivityVerified", "currentInstalledSourcesVerified", "executionAuthorized"]) {
    assert.equal(generated.metadata[key], false);
  }
});
void test("separate schematic generations allocate new complete identities without accepting caller paths or geometry", () => {
  const seen = new Set<unknown>();
  for (let index = 0; index < 3; index += 1) {
    const generated = generateManagedSchematicFixtureArchiveData(), source = rows(generated.bytes);
    for (const id of [generated.name, source[0]?.body["client"], source[0]?.body["uuid"], source[2]?.body["uuid"], ...source.slice(4).map((row) => row.header.id)]) {
      assert.equal(typeof id, "string"); assert.equal(seen.has(id), false); seen.add(id);
    }
  }
});
