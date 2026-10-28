import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { test } from "node:test";
import { managedProjectFootprintArchive } from "./helpers/managed-project-footprint-archive.ts";
import type { ManagedProjectFootprintArchiveEntry } from "./helpers/managed-project-footprint-archive.ts";
import { isRecord } from "../src/core.ts";
import { executeManagedLibraryFiles } from "../src/managed-library-files-runtime.ts";
import { managedLibraryFileSchema, validateManagedLibraryFilesArguments } from "../src/managed-library-files.ts";
import { readManagedLibraryZip } from "../src/managed-library-files-zip.ts";
import { collectManagedProjectFootprintSources, encodeManagedProjectFootprintSourceIndex,
  pageManagedProjectFootprintRoster, pageManagedProjectFootprintSource } from "../src/managed-project-footprint-sources.ts";

function hash(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex"); }
const uuid = "1234567890abcdef";
const otherUuid = "abcdef1234567890abcdef1234567890";
const source = '\uFEFF["DOCTYPE","FOOTPRINT","1.0"]\r\n["HEAD",{"unknown":"保留😀"}]\r\nopaque future record\r\n';
const manifest: ManagedProjectFootprintArchiveEntry = { name: "project2.json", content: '{"title":"Supplied disposable fixture"}' };
function collect(entries: readonly ManagedProjectFootprintArchiveEntry[]): ReturnType<typeof collectManagedProjectFootprintSources> {
  const bytes = managedProjectFootprintArchive([manifest, ...entries]);
  return collectManagedProjectFootprintSources(readManagedLibraryZip(bytes), hash(bytes));
}

void test("complete supplied source index retains archive order, raw source bytes and opaque future records", () => {
  const actual = collect([{ name: `nested/${otherUuid}.efoo`, content: "second named first\n" }, { name: `${uuid}.efoo`, content: source },
    { name: "untouched.unknown", content: "not a footprint" }]);
  assert.deepEqual(actual.sources.map(entry => entry.footprintUuid), [otherUuid, uuid]);
  assert.equal(actual.archiveMembers, 4); assert.equal(actual.sources[1]?.documentSource, source);
  assert.equal(actual.sources[1]?.bytes, Buffer.byteLength(source)); assert.equal(actual.sources[1]?.sha256, hash(Buffer.from(source)));
  const index = encodeManagedProjectFootprintSourceIndex(actual);
  assert.equal(hash(index), actual.sourceSetSha256); assert.equal(index.includes(Buffer.from("opaque future record")), false);
  assert.equal(collect([]).sources.length, 0);
});

void test("every footprint member and repeated basename is recognized before source publication", () => {
  for (const entries of [[{ name: "not-a-uuid.efoo", content: source }], [{ name: `${uuid}.EFOO`, content: source }],
    [{ name: `${uuid}.extra.efoo`, content: source }], [{ name: `${uuid}.efoo/`, content: "" }],
    [{ name: `${uuid}.efoo`, content: source }, { name: `other/${uuid}.efoo`, content: source }],
    [{ name: `${uuid}.efoo`, content: "" }], [{ name: `${uuid}.efoo`, content: Buffer.from([0xC3, 0x28]) }]]) {
    assert.throws(() => collect(entries));
  }
  const bytes = managedProjectFootprintArchive([manifest, { name: `${uuid}.efoo`, content: source }, { name: "peer", content: "crc-peer" }]);
  const centralStart = bytes.readUInt32LE(bytes.length - 6); bytes.writeUInt8((bytes.readUInt8(centralStart + 16) + 1) % 256, centralStart + 16);
  assert.throws(() => collectManagedProjectFootprintSources(readManagedLibraryZip(bytes), hash(bytes)), /CRC|differ/u);
});

void test("lossless text and base64 pages never split Unicode pairs and preserve BOM and line ends", () => {
  const item = collect([{ name: `${uuid}.efoo`, content: source }]).sources[0]; assert.ok(item);
  let offset = 0; const chunks: string[] = []; const byteChunks: Buffer[] = [];
  while (offset < source.length) {
    const page = pageManagedProjectFootprintSource(item, offset, 3);
    assert.equal(typeof page["documentSource"], "string"); assert.equal(typeof page["pageBase64"], "string");
    const text = String(page["documentSource"]); const bytes = Buffer.from(String(page["pageBase64"]), "base64");
    assert.equal(text.isWellFormed(), true); assert.equal(bytes.toString("utf8"), text); chunks.push(text); byteChunks.push(bytes);
    offset = Number(page["nextOffset"]);
  }
  assert.equal(chunks.join(""), source); assert.deepEqual(Buffer.concat(byteChunks), Buffer.from(source));
  const split = source.indexOf("😀") + 1;
  assert.throws(() => pageManagedProjectFootprintSource(item, split, 3), /surrogate/u);
  assert.throws(() => pageManagedProjectFootprintSource(item, split - 1, 1), /Unicode character/u);
  assert.throws(() => pageManagedProjectFootprintSource(item, 0, 4097));
  assert.equal(pageManagedProjectFootprintSource(item, source.length, 3)["endOfSource"], true);
  assert.equal(pageManagedProjectFootprintSource(item, source.length, 3)["completeSourceReturned"], false);
});

void test("bounded roster pages enumerate every unknown UUID in archive order without source bodies", () => {
  const names = Array.from({ length: 65 }, (_, index) => index.toString(16).padStart(16, "0"));
  const actual = collect(names.map((name) => ({ name: `${name}.efoo`, content: source })));
  const ids: unknown[] = []; let offset = 0;
  while (offset < names.length) {
    const page = pageManagedProjectFootprintRoster(actual, offset, 32);
    assert.ok(Array.isArray(page["sources"])); assert.ok(page["sources"].length <= 32);
    assert.equal(JSON.stringify(page).includes("documentSource"), false);
    ids.push(...page["sources"].map((entry: unknown) => { assert.ok(isRecord(entry)); return entry["footprintUuid"]; }));
    offset = Number(page["nextOffset"]);
  }
  assert.deepEqual(ids, names);
  assert.equal(pageManagedProjectFootprintRoster(actual, names.length, 32)["endOfRoster"], true);
  assert.equal(pageManagedProjectFootprintRoster(actual, names.length, 32)["completeRosterReturned"], false);
  assert.equal(pageManagedProjectFootprintRoster(collect([]), 0, 32)["completeRosterReturned"], true);
  assert.throws(() => pageManagedProjectFootprintRoster(actual, names.length + 1, 32));
  assert.throws(() => pageManagedProjectFootprintRoster(actual, 0, 33));
});

void test("strict source extraction schemas require an exact prepared archive and bounded page selector", () => {
  const file = { schema: "easyeda-pro-control.library-file.v1", name: "Fixture.epro2", path: "/not-opened", bytes: 100, sha256: "a".repeat(64) };
  const request = { action: "read-project-footprint-source", file, expectedSourceSetSha256: "b".repeat(64), footprintUuid: uuid };
  assert.equal(validateManagedLibraryFilesArguments(request)["valid"], true);
  assert.equal(validateManagedLibraryFilesArguments({ action: "extract-project-footprint-sources", file })["valid"], true);
  const list = { action: "list-project-footprint-sources", file, expectedSourceSetSha256: "b".repeat(64) };
  assert.equal(validateManagedLibraryFilesArguments(list)["valid"], true);
  for (const invalid of [{ ...list, index: "/external" }, { ...list, offset: -1 }, { ...list, length: 33 },
    { ...list, expectedSourceSetSha256: "bad" }]) { assert.equal(validateManagedLibraryFilesArguments(invalid)["valid"], false); }
  for (const invalid of [{ ...request, sourceIndex: "/external" }, { ...request, footprintUuid: uuid.toUpperCase() },
    { ...request, length: 4097 }, { ...request, offset: -1 }, { ...request, expectedSourceSetSha256: "bad" },
    { ...request, file: { ...file, name: "Part.efoo" } }]) { assert.equal(validateManagedLibraryFilesArguments(invalid)["valid"], false); }
});

void test("real managed dispatcher publishes a complete index and reads bounded exact source pages without a runtime", async () => {
  const largeSource = `${source}${"\u0000".repeat(100_000)}`;
  const bytes = managedProjectFootprintArchive([manifest, { name: `${uuid}.efoo`, content: largeSource }, { name: `nested/${otherUuid}.efoo`, content: "other source\n" }]);
  const prepared = await executeManagedLibraryFiles({ action: "prepare-file", name: "Sources.epro2", base64: bytes.toString("base64"), confirmLocalArtifact: true });
  const file = managedLibraryFileSchema.parse(prepared["file"]);
  const extracted = await executeManagedLibraryFiles({ action: "extract-project-footprint-sources", file });
  assert.equal(extracted["metadataOnly"], false); assert.equal(extracted["publicSdkMethodExecuted"], false); assert.equal(extracted["cadFramingValidated"], false);
  assert.equal(extracted["footprintCount"], 2); assert.ok(Buffer.byteLength(JSON.stringify(extracted)) < 65_536);
  const index = extracted["index"]; assert.ok(isRecord(index)); assert.equal(typeof index["path"], "string");
  const indexBytes = await readFile(String(index["path"])); assert.equal(hash(indexBytes), extracted["sourceSetSha256"]);
  assert.equal(indexBytes.includes(Buffer.from("other source")), false);
  const read = { action: "read-project-footprint-source", file, expectedSourceSetSha256: extracted["sourceSetSha256"], footprintUuid: uuid };
  const list = { action: "list-project-footprint-sources", file, expectedSourceSetSha256: extracted["sourceSetSha256"], length: 1 };
  const roster = await executeManagedLibraryFiles(list);
  assert.equal(roster["metadataOnly"], true); assert.equal(roster["localArtifactWritten"], false);
  assert.equal(roster["nextOffset"], 1); assert.equal(roster["endOfRoster"], false);
  assert.equal(JSON.stringify(roster).includes("documentSource"), false);
  const final = await executeManagedLibraryFiles({ ...list, offset: 1 });
  assert.equal(final["nextOffset"], 2); assert.equal(final["endOfRoster"], true);
  assert.ok(Buffer.byteLength(JSON.stringify(roster)) < 65_536);
  await assert.rejects(executeManagedLibraryFiles({ ...list, expectedSourceSetSha256: "0".repeat(64) }), /digest/u);
  await assert.rejects(executeManagedLibraryFiles({ ...list, offset: 3 }), /bounds/u);
  const page = await executeManagedLibraryFiles(read);
  assert.equal(page["nextOffset"], 4096); assert.equal(page["endOfSource"], false); assert.equal(page["sourceSha256"], hash(Buffer.from(largeSource)));
  assert.equal(Buffer.byteLength(JSON.stringify(page)) < 65_536, true);
  assert.equal(page["localArtifactWritten"], false); assert.equal(page["documentSource"], largeSource.slice(0, 4096));
  await assert.rejects(executeManagedLibraryFiles({ ...read, expectedSourceSetSha256: "0".repeat(64) }), /digest/u);
  await assert.rejects(executeManagedLibraryFiles({ ...read, footprintUuid: "0000000000000000" }), /absent/u);
  await assert.rejects(executeManagedLibraryFiles({ ...read, file: { ...file, path: "/external.epro2" } }), /prepared directory/u);
  const changed = Buffer.from(bytes); changed.writeUInt8((changed.readUInt8(40) + 1) % 256, 40); await writeFile(file.path, changed);
  await assert.rejects(executeManagedLibraryFiles(read), /SHA-256/u);
  await assert.rejects(executeManagedLibraryFiles(list), /SHA-256/u);
});
