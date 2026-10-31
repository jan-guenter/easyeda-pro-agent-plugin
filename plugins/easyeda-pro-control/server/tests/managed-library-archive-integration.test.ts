import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import { executeManagedLibraryFiles } from "../src/managed-library-files-runtime.ts";
import { managedLibraryFileSchema, queryManagedLibraryFiles, validateManagedLibraryFilesArguments } from "../src/managed-library-files.ts";
import { managedLibraryArchiveFixture } from "./helpers/managed-library-archive.ts";
import { managedProjectFootprintArchive } from "./helpers/managed-project-footprint-archive.ts";

function hash(value: Buffer | string): string { return createHash("sha256").update(value).digest("hex"); }
const fixture = managedLibraryArchiveFixture();
const prepare = { action: "prepare-file", name: "Supplied.elibz2", base64: fixture.archive.toString("base64"), confirmLocalArtifact: true };

void test("archive discovery recognizes complete supplied containers without content echo or exporter authority", () => {
  const valid = validateManagedLibraryFilesArguments(prepare);
  assert.equal(valid["valid"], true); assert.equal(valid["executionAuthorized"], false);
  assert.equal(JSON.stringify(valid).includes(prepare.base64), false); assert.equal(Object.hasOwn(valid, "request"), false);
  const catalog = queryManagedLibraryFiles({ includeSchemas: true }); const serialized = JSON.stringify(catalog);
  for (const action of ["extract-library-archive-sources", "list-library-archive-sources", "read-library-archive-source"]) { assert.ok(serialized.includes(action)); }
  assert.equal(serialized.includes('"inspect-library-archive-symbol-pins"'), false);
  assert.equal(catalog["publicSdkMethodExecuted"], false); assert.equal(catalog["installedRuntimeAdmission"], false);
  assert.ok(isRecord(catalog["nextRequirements"])); assert.match(String(catalog["nextRequirements"]["libraryArchiveSymbolPins"]), /subtype/u);
  for (const method of ["getFootprintFileByFootprintUuid", "getSymbolFileBySymbolUuid", "getDeviceFileByDeviceUuid", "getPanelLibraryFileByPanelLibraryUuid"]) {
    assert.equal(JSON.stringify(catalog["methods"]).includes(method), false);
  }
  const empty = managedProjectFootprintArchive([{ name: fixture.member, content: "" }, { name: "footprint2.json", content: fixture.manifest }]);
  for (const invalid of [{ ...prepare, name: "Supplied.elibz" }, { ...prepare, base64: empty.toString("base64") },
    { ...prepare, outputPath: "/external.elibz2" }, { ...prepare, confirmLocalArtifact: false }]) {
    assert.equal(validateManagedLibraryFilesArguments(invalid)["valid"], false);
  }
});

void test("library archive extraction publishes a complete hash-bound index and pages the exact original source", async () => {
  const prepared = await executeManagedLibraryFiles(prepare); const file = managedLibraryFileSchema.parse(prepared["file"]);
  assert.deepEqual(await readFile(file.path), fixture.archive);
  const extracted = await executeManagedLibraryFiles({ action: "extract-library-archive-sources", file });
  const index = extracted["index"]; assert.ok(isRecord(index) && typeof index["path"] === "string");
  const indexBytes = await readFile(index["path"]); assert.equal(hash(indexBytes), extracted["sourceSetSha256"]);
  assert.equal(index["sha256"], extracted["sourceSetSha256"]); assert.equal(index["bytes"], indexBytes.length);
  const contents: unknown = JSON.parse(indexBytes.toString()); assert.ok(isRecord(contents));
  assert.equal(contents["schema"], "easyeda-pro-control.library-archive-source-index.v1");
  assert.equal(contents["inputSha256"], file.sha256); assert.equal(contents["manifestSha256"], hash(fixture.manifest));
  assert.equal(contents["sourceMemberSha256"], hash(fixture.prefix + fixture.source));
  assert.equal(indexBytes.includes(Buffer.from("documentSource")), false); assert.equal(indexBytes.includes(Buffer.from("never-follow")), false);
  const bound = { file, expectedSourceSetSha256: extracted["sourceSetSha256"] };
  const roster = await executeManagedLibraryFiles({ action: "list-library-archive-sources", ...bound, length: 1 });
  assert.equal(roster["completeRosterReturned"], true); assert.equal(roster["endOfRoster"], true);
  const entries = roster["sources"]; assert.ok(Array.isArray(entries) && isRecord(entries[0]));
  const source = entries[0]; assert.equal(source["sha256"], hash(fixture.source)); assert.equal(source["memberByteOffset"], Buffer.byteLength(fixture.prefix));
  assert.ok(isRecord(source["exportPrefix"])); assert.equal(source["exportPrefix"]["sha256"], hash(fixture.prefix));
  assert.equal(Object.hasOwn(source, "documentSource"), false);
  let offset = 0, reconstructed = "";
  while (offset < fixture.source.length) {
    const page = await executeManagedLibraryFiles({ action: "read-library-archive-source", ...bound, sourceId: source["sourceId"], offset, length: 17 });
    assert.equal(page["sourceSha256"], hash(fixture.source)); assert.equal(page["symbolSubtypeVerified"], false);
    assert.equal(page["publicSdkMethodExecuted"], false); assert.equal(page["executionAuthorized"], false);
    const base64 = page["pageBase64"], text = page["documentSource"]; assert.ok(typeof text === "string" && typeof base64 === "string");
    assert.equal(Buffer.from(base64, "base64").toString(), text); assert.equal(page["pageSha256"], hash(Buffer.from(base64, "base64")));
    reconstructed += text; assert.ok(typeof page["nextOffset"] === "number" && page["nextOffset"] > offset); offset = page["nextOffset"];
  }
  assert.equal(reconstructed, fixture.source);
  for (const request of [{ action: "list-library-archive-sources", ...bound, expectedSourceSetSha256: "0".repeat(64) },
    { action: "read-library-archive-source", ...bound, sourceId: "0".repeat(64) },
    { action: "list-library-archive-sources", ...bound, file: { ...file, path: "/external.elibz2" } }]) { await assert.rejects(executeManagedLibraryFiles(request)); }
  await writeFile(file.path, Buffer.concat([fixture.archive, Buffer.from("changed")]));
  await assert.rejects(executeManagedLibraryFiles({ action: "list-library-archive-sources", ...bound }), /length|SHA-256/u);
});

void test("unknown manifest fields stay artifact-bound and cannot reuse an earlier source-set digest", async () => {
  const original = await executeManagedLibraryFiles(prepare); const file = managedLibraryFileSchema.parse(original["file"]);
  const baseline = await executeManagedLibraryFiles({ action: "extract-library-archive-sources", file });
  const changedManifest = fixture.manifest.replace('"futureRoot":true', '"futureRoot":false'); assert.notEqual(changedManifest, fixture.manifest);
  const archive = managedProjectFootprintArchive([{ name: fixture.member, content: fixture.prefix + fixture.source }, { name: "footprint2.json", content: changedManifest }]);
  const changed = await executeManagedLibraryFiles({ ...prepare, base64: archive.toString("base64") }); const changedFile = managedLibraryFileSchema.parse(changed["file"]);
  const extracted = await executeManagedLibraryFiles({ action: "extract-library-archive-sources", file: changedFile });
  assert.notEqual(extracted["sourceSetSha256"], baseline["sourceSetSha256"]);
  await assert.rejects(executeManagedLibraryFiles({ action: "list-library-archive-sources", file: changedFile, expectedSourceSetSha256: baseline["sourceSetSha256"] }), /digest/u);
  const bound = { file, expectedSourceSetSha256: baseline["sourceSetSha256"] };
  for (const invalid of [{ action: "inspect-library-archive-symbol-pins", ...bound, sourceId: "0".repeat(64) },
    { action: "extract-library-info", files: [file] }, { action: "extract-project-info", file },
    { action: "read-library-archive-source", ...bound, sourceId: "0".repeat(64), length: 4097 },
    { action: "list-library-archive-sources", ...bound, libraryUuid: "0819f05c4eef4c71ace90d822a990e87" }]) {
    assert.equal(validateManagedLibraryFilesArguments(invalid)["valid"], false);
  }
});

void test("the four direct library exporters retain concrete omitted status and no execution route", () => {
  for (const method of ["getFootprintFileByFootprintUuid", "getSymbolFileBySymbolUuid", "getDeviceFileByDeviceUuid", "getPanelLibraryFileByPanelLibraryUuid"]) {
    const entry = inventoryExtensionApiCoverage().find((row) => row.path === `eda.sys_FileManager.${method}`); assert.ok(entry);
    assert.equal(entry.status, "omitted"); assert.deepEqual(entry.routes, []); assert.ok(entry.omission);
    assert.match(entry.omission.code, /^library-archive-/u); assert.match(entry.omission.nextRequirement, /original.*worker/u);
    assert.ok(entry.omission.evidence.some((item) => item.includes("lib-worker.js@sha256:") && item.includes("utf16:")));
    assert.equal(entry.omission.evidence.some((item) => item.includes("/root/.cache/")), false);
    if (method.includes("Device")) { assert.match(entry.omission.nextRequirement, /Symbol\/Footprint closure/u); }
    if (method.includes("Panel")) { assert.match(entry.omission.nextRequirement, /docType29 panel/u); }
  }
});
