import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstat, readFile, readdir, symlink, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { managedFixtureArchiveQualificationSchema, qualifyManagedFixtureArchive } from "../src/managed-fixture-archive.ts";
import { executeManagedLibraryFiles } from "../src/managed-library-files-runtime.ts";
import { managedLibraryFileSchema, queryManagedLibraryFiles, validateManagedLibraryFilesArguments } from "../src/managed-library-files.ts";
import { managedProjectFootprintArchive } from "./helpers/managed-project-footprint-archive.ts";

const BOARD = "abcdef1234567890", PCB = "1234567890abcdef";
function source(uuid = PCB, docType = "PCB", extra = ""): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify({ uuid, docType })}|\n{"type":"META","id":"META"}||{"title":"Fixture"}|\n${extra}`;
}
function archive(body = source(), manifest = '{"title":"Fixture","cbb_project":false,"editorVersion":"3.2.209"}'): Buffer {
  return managedProjectFootprintArchive([{ name: "project2.json", content: manifest }, { name: "Fixture.epru", content: body }]);
}
function hash(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex"); }
async function prepared(bytes: Buffer): Promise<ReturnType<typeof managedLibraryFileSchema.parse>> {
  const response = await executeManagedLibraryFiles({ action: "prepare-file", name: "Fixture.epro2", base64: bytes.toString("base64"), confirmLocalArtifact: true });
  return managedLibraryFileSchema.parse(response["file"]);
}
async function stages(): Promise<readonly string[]> {
  try { return await readdir(join(controlDataDirectory(), "artifacts", "fixture-archives")); }
  catch (error) { if (error instanceof Error && "code" in error && error.code === "ENOENT") { return []; } throw error; }
}

void test("fixture qualification binds every supplied member and original document without claiming native import", () => {
  const opaque = '{"type":"FUTURE","id":"opaque"}||{"unknown":[true,null,1]}|\n';
  const bytes = archive(source() + source(BOARD, "BOARD", opaque));
  const result = qualifyManagedFixtureArchive(bytes);
  assert.equal(result.archiveSha256, hash(bytes));
  assert.equal(result.documents.length, 2);
  assert.deepEqual(result.documents.map((item) => item.uuid), [PCB, BOARD]);
  assert.deepEqual(result.documents[1]?.recordTypes, ["DOCHEAD", "FUTURE", "META"]);
  const sourceBytes = Buffer.from(source() + source(BOARD, "BOARD", opaque));
  assert.equal(result.source.sha256, hash(sourceBytes));
  assert.equal(result.completeSuppliedDocumentRoster, true);
  for (const key of ["nativeImportExecuted", "nativeDestinationReserved", "registrationVerified", "geometryVerified", "dependencyClosureVerified", "executionAuthorized"] as const) {
    assert.equal(result[key], false);
  }
  assert.deepEqual(managedFixtureArchiveQualificationSchema.parse(result), result);
});

void test("fixture qualification refuses incomplete framing, histories, ambiguous IDs and unsafe output names", () => {
  for (const body of [source().slice(0, -2), source() + source(), source().replace('"id":"META"', '"id":null'),
    source(PCB, "PCB", '{"type":"DELETE","id":"gone"}||{}|\n'),
    source(PCB, "PCB", '{"type":"LINE","id":"META"}||{}|\n'),
    source(PCB, "PCB", '{"type":"LINE","id":"gone"}|||\n')]) {
    assert.throws(() => qualifyManagedFixtureArchive(archive(body)));
  }
  for (const title of ["../escape", "CON", "NUL", "trailing ", "a.b", "a:b"]) {
    assert.throws(() => qualifyManagedFixtureArchive(archive(source(), JSON.stringify({ title }))));
  }
  assert.throws(() => qualifyManagedFixtureArchive(archive(source(), '{"title":"Fixture","cbb_project":true}')));
  assert.throws(() => qualifyManagedFixtureArchive(archive(source(), '{"title":"Fixture","editorVersion":"3.2.210"}')));
  assert.throws(() => qualifyManagedFixtureArchive(archive(source(), '{"title":"Fixture","title":"Other"}')));
});

void test("fixture archives reject unsupported members and inspect the complete CRC checked input", () => {
  const extra = managedProjectFootprintArchive([{ name: "project2.json", content: '{"title":"Fixture"}' },
    { name: "Fixture.epru", content: source() }, { name: "IMAGE/opaque", content: "unawaited native image work" }]);
  assert.throws(() => qualifyManagedFixtureArchive(extra), /exact project2/u);
  const mutated = Buffer.from(archive()); mutated[35] = 0;
  assert.throws(() => qualifyManagedFixtureArchive(mutated));
  assert.throws(() => qualifyManagedFixtureArchive(archive(Array.from({ length: 33 }, (_, index) => source(index.toString(16).padStart(16, "0"))).join(""))), /bounded/u);
  const wide = Array.from({ length: 60 }, (_, index) => `{"type":"FUTURE_${index}_${"X".repeat(40)}","id":"r${index}"}||{}|\n`).join("");
  const many = Array.from({ length: 16 }, (_, index) => source(index.toString(16).padStart(16, "0"), "PCB", wide)).join("");
  assert.throws(() => qualifyManagedFixtureArchive(archive(many)), /report byte bound/u);
});

void test("public preparation publishes exact archive, intent and complete roster in an exclusive private directory", async () => {
  const bytes = archive(); const file = await prepared(bytes); const before = await readFile(file.path);
  const output = await executeManagedLibraryFiles({ action: "prepare-fixture-archive", file, confirmDisposableFixture: true, confirmLocalArtifact: true });
  const directory = String(output["directory"]);
  assert.equal(output["state"], "prepared");
  assert.equal(output["nativeImportAvailable"], false);
  assert.equal(output["cadAuthority"], false);
  const entries = await readdir(directory); const info = await lstat(directory); const archiveInfo = await lstat(join(directory, "Fixture.epro2"));
  assert.deepEqual(entries.toSorted(), ["Fixture.epro2", "intent.json", "qualification.json"]);
  assert.equal(info.mode % 512, 0o700);
  assert.equal(archiveInfo.mode % 512, 0o600);
  assert.deepEqual(await readFile(join(directory, "Fixture.epro2")), bytes);
  assert.deepEqual(await readFile(file.path), before);
  const reportText = await readFile(join(directory, "qualification.json"), "utf8");
  const report = managedFixtureArchiveQualificationSchema.parse(JSON.parse(reportText) as unknown);
  assert.equal(report.archiveSha256, file.sha256);
  const second = await executeManagedLibraryFiles({ action: "prepare-fixture-archive", file, confirmDisposableFixture: true, confirmLocalArtifact: true });
  assert.notEqual(second["directory"], directory);
});

void test("invalid archives or substituted input refuse before any staging directory is allocated", async () => {
  const invalid = await prepared(archive(source() + source()));
  const before = await stages();
  await assert.rejects(executeManagedLibraryFiles({ action: "prepare-fixture-archive", file: invalid, confirmDisposableFixture: true, confirmLocalArtifact: true }));
  assert.deepEqual(await stages(), before);
  const file = await prepared(archive()); await writeFile(file.path, Buffer.alloc(file.bytes));
  await assert.rejects(executeManagedLibraryFiles({ action: "prepare-fixture-archive", file, confirmDisposableFixture: true, confirmLocalArtifact: true }));
  const original = await prepared(archive()); const linked = join(controlDataDirectory(), "external.epro2");
  await symlink(original.path, linked);
  await assert.rejects(executeManagedLibraryFiles({ action: "prepare-fixture-archive", file: { ...original, path: linked }, confirmDisposableFixture: true, confirmLocalArtifact: true }));
  assert.deepEqual(await stages(), before);
});

void test("offline catalog exposes strict preparation schema and false confirmations never allocate output", async () => {
  const file = await prepared(archive()); const request = { action: "prepare-fixture-archive", file, confirmDisposableFixture: true, confirmLocalArtifact: true };
  assert.equal(validateManagedLibraryFilesArguments(request)["valid"], true);
  for (const change of [{ confirmDisposableFixture: false }, { confirmLocalArtifact: false }, { destinationPath: "/not-admitted" }, { action: "import-fixture" }]) {
    assert.equal(validateManagedLibraryFilesArguments({ ...request, ...change })["valid"], false);
  }
  assert.ok(JSON.stringify(queryManagedLibraryFiles({ includeSchemas: true })).includes('prepare-fixture-archive'));
  assert.equal(basename(file.path).endsWith(file.name), true);
});
