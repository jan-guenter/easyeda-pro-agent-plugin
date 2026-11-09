import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { z } from "zod";
import { managedFixtureArchiveQualificationSchema, qualifyManagedFixtureArchive } from "../src/managed-fixture-archive.ts";
import { MANAGED_FIXTURE_ARC_BODY, MANAGED_FIXTURE_ARC_FIELDS, MANAGED_FIXTURE_GENERATOR_KINDS, MANAGED_FIXTURE_GENERATOR_PROFILE, MANAGED_FIXTURE_LINE_FIELDS,
  MANAGED_FIXTURE_VIA_FIELDS, generateManagedFixtureArchiveData } from "../src/managed-fixture-generator.ts";
import { executeManagedLibraryFiles } from "../src/managed-library-files-runtime.ts";
import { readManagedLibraryZip } from "../src/managed-library-files-zip.ts";
import { validateManagedLibraryFilesArguments } from "../src/managed-library-files.ts";

const rowSchema = z.object({ header: z.object({ type: z.string(), id: z.string().optional(), ticket: z.number().optional() }), body: z.record(z.string(), z.unknown()) });
function rows(bytes: Buffer): readonly z.infer<typeof rowSchema>[] {
  const members = readManagedLibraryZip(bytes); assert.deepEqual([...members.keys()], ["project2.json", "Fixture.epru"]);
  const body = members.get("Fixture.epru"); assert.ok(body); const text = body.toString("utf8"); assert.equal(text.endsWith("|\n"), true);
  return text.slice(0, -2).split("|\n").map((row) => {
    const boundary = row.indexOf("||");
    return rowSchema.parse({ header: JSON.parse(row.slice(0, boundary)) as unknown, body: JSON.parse(row.slice(boundary + 2)) as unknown });
  });
}

void test("fixed new fixture archives have one complete ordinary root PCB and exactly the requested physical families", () => {
  for (const kind of MANAGED_FIXTURE_GENERATOR_KINDS) {
    const generated = generateManagedFixtureArchiveData(kind), qualification = qualifyManagedFixtureArchive(generated.bytes), source = rows(generated.bytes);
    assert.equal(qualification.documents.length, 1); assert.equal(qualification.documents[0]?.documentType, "PCB");
    assert.deepEqual(source.map((row) => row.header.type), ["DOCHEAD", "META", "VIA", ...(kind === "via-only" ? [] : ["LINE"]), ...(kind === "arc-line-and-via" ? ["ARC"] : [])]);
    assert.deepEqual(source[1]?.body, { title: "PCB1", parent: "", source: "", board: "", zIndex: null });
    const via = source[2]; assert.ok(via); assert.deepEqual(Object.keys(via.body), MANAGED_FIXTURE_VIA_FIELDS);
    assert.equal(via.body["ruleName"], ""); assert.equal(via.body["viaType"], "NORMAL");
    assert.equal(via.body["holeDiameter"], 100); assert.equal(via.body["viaDiameter"], 200);
    assert.equal(via.body["topSolderExpansion"], 0); assert.equal(via.body["bottomSolderExpansion"], 0);
    assert.equal(via.body["locked"], false); assert.equal(via.body["netName"], "");
    assert.equal(generated.metadata["sqliteAccessed"], false); assert.equal(generated.metadata["existingProjectRead"], false);
    assert.equal(generated.metadata["nativeSceneVerified"], false); assert.equal(generated.metadata["nativeImportabilityVerified"], false);
    assert.equal(generated.metadata["currentInstalledSourcesVerified"], false);
    if (kind !== "via-only") {
      const line = source[3]; assert.ok(line); assert.deepEqual(Object.keys(line.body), MANAGED_FIXTURE_LINE_FIELDS);
      assert.equal(line.body["layerId"], 1); assert.equal(line.body["startX"], 500); assert.equal(line.body["endX"], 1500); assert.equal(line.body["width"], 100);
    }
    if (kind === "arc-line-and-via") {
      const arc = source[4]; assert.ok(arc); assert.equal(arc.header.ticket, 4); assert.deepEqual(Object.keys(arc.body), MANAGED_FIXTURE_ARC_FIELDS);
      assert.deepEqual(arc.body, MANAGED_FIXTURE_ARC_BODY); assert.match(String(arc.header.id), /^[a-f0-9]{16}$/u);
      const intended = z.object({ arc: z.object({ centerX: z.literal(350), centerY: z.literal(100), radius: z.literal(100), angleDegrees: z.literal(90), arcType: z.literal(1), sweep: z.literal(1) }) }).parse(generated.metadata["intendedNativeGeometry"]);
      assert.equal(intended.arc.arcType, 1);
    }
    assert.equal(generated.metadata["sourceTemplateProfile"], MANAGED_FIXTURE_GENERATOR_PROFILE);
  }
});

void test("each archive generation allocates fresh document, primitive and client identities without caller IDs or geometry", () => {
  const seen = new Set<unknown>();
  for (let index = 0; index < 5; index += 1) {
    const generated = generateManagedFixtureArchiveData("line-and-via"), source = rows(generated.bytes);
    for (const value of [generated.name, source[0]?.body["uuid"], source[0]?.body["client"], source[2]?.header.id, source[3]?.header.id]) {
      assert.equal(typeof value, "string"); assert.equal(seen.has(value), false); seen.add(value);
    }
  }
  assert.throws(() => generateManagedFixtureArchiveData("arbitrary-family"));
  assert.throws(() => generateManagedFixtureArchiveData({ fixtureKind: "via-only", viaId: "forced" }));
});

void test("reachable generation uses ordinary input preparation and complete private fixture staging", async () => {
  for (const fixtureKind of MANAGED_FIXTURE_GENERATOR_KINDS) {
    const output = await executeManagedLibraryFiles({ action: "generate-fixture-archive", fixtureKind, confirmDisposableFixture: true, confirmLocalArtifact: true });
    assert.equal(output["action"], "generate-fixture-archive"); assert.equal(output["state"], "prepared");
    assert.equal(output["nativeImportAvailable"], false); assert.equal(output["executionAuthorized"], false);
    const artifact = z.object({ path: z.string() }).parse(output["archive"]), bytes = await readFile(artifact.path);
    const qualification = managedFixtureArchiveQualificationSchema.parse(output["qualification"]);
    assert.equal(qualifyManagedFixtureArchive(bytes).archiveSha256, qualification.archiveSha256);
    const expectedCount = { "via-only": 1, "line-and-via": 2, "arc-line-and-via": 3 }[fixtureKind];
    assert.equal(rows(bytes).filter((row) => ["VIA", "LINE", "ARC"].includes(row.header.type)).length, expectedCount);
  }
});

void test("generation schema refuses arbitrary versions, source, paths, geometry and false confirmations", () => {
  const request = { action: "generate-fixture-archive", fixtureKind: "via-only", confirmDisposableFixture: true, confirmLocalArtifact: true };
  assert.equal(validateManagedLibraryFilesArguments(request)["valid"], true);
  for (const change of [{ fixtureKind: "PCB" }, { source: "external source" }, { version: "3.2.210" }, { path: "/not-used" },
    { via: { x: 1, y: 2 } }, { confirmDisposableFixture: false }, { confirmLocalArtifact: false }]) {
    assert.equal(validateManagedLibraryFilesArguments({ ...request, ...change })["valid"], false);
  }
});
