import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, rename, symlink, writeFile } from "node:fs/promises";
import { test } from "node:test";
import { crc32, deflateRawSync } from "node:zlib";
import { readExactBinaryArtifact } from "../src/artifacts.ts";
import { executeManagedLibraryFiles } from "../src/managed-library-files-runtime.ts";
import { MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES, readManagedLibraryZip } from "../src/managed-library-files-zip.ts";
import { decodeManagedLibraryBase64, extractManagedLibraryMetadata, extractManagedProjectMetadata, managedLibraryFileSchema,
  queryManagedLibraryFiles, validateManagedLibraryFilesArguments } from "../src/managed-library-files.ts";

interface Entry { readonly name: string; readonly text: string; readonly deflate?: boolean }
function archive(entries: readonly Entry[]): Buffer {
  const locals: Buffer[] = []; const centrals: Buffer[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name); const content = Buffer.from(entry.text);
    // oxlint-disable-next-line node/no-sync -- Small deterministic compressed fixtures exercise the production bounded decoder.
    const compressed = entry.deflate === true ? deflateRawSync(content) : content;
    const local = Buffer.alloc(30); const central = Buffer.alloc(46); const method = entry.deflate === true ? 8 : 0;
    local.writeUInt32LE(0x04_03_4B_50); local.writeUInt16LE(20, 4); local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc32(content), 14); local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(content.length, 22); local.writeUInt16LE(name.length, 26);
    central.writeUInt32LE(0x02_01_4B_50); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc32(content), 16); central.writeUInt32LE(compressed.length, 20); central.writeUInt32LE(content.length, 24);
    central.writeUInt16LE(name.length, 28); central.writeUInt32LE(offset, 42);
    locals.push(local, name, compressed); centrals.push(central, name); offset += local.length + name.length + compressed.length;
  }
  const directory = Buffer.concat(centrals); const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06_05_4B_50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}
const symbol = '["DOCTYPE","SYMBOL","1.0"]\n["HEAD",{"symbolType":2}]\n["PIN","p1",{"x":0,"y":0}]\n';
const footprint = '["DOCTYPE","FOOTPRINT","1.0"]\r\n["HEAD",{}]\r\n["PAD","p1",{"unknown":"retained"}]\r\n';
const panel = '["DOCTYPE","PANEL_LIB","1.0"]\n["HEAD",{}]\n';
const project = JSON.stringify({ title: "Disposable", cbb_project: false, editorVersion: "3.2.209", description: "Not returned by native manager", drawings: {} });
const projectArchive = archive([{ name: "project2.json", text: project, deflate: true }, { name: "FOOTPRINT/f1", text: footprint }]);

void test("offline library extraction retains native filename identities and complete supported framing", () => {
  const actual = extractManagedLibraryMetadata("Part.esym", Buffer.from(symbol));
  assert.deepEqual(actual, { devices: [], symbols: [{ uuid: createHash("sha256").update("Part.esym").digest("hex"),
    title: "Part", description: "", tags: [], docType: 2 }], footprints: [], panelLibs: [] });
  assert.equal(extractManagedLibraryMetadata("Part.efoo", Buffer.from(footprint)).footprints[0]?.docType, 4);
  assert.equal(extractManagedLibraryMetadata("Part.epanl", Buffer.from(panel)).panelLibs[0]?.docType, 29);
  for (const invalid of [symbol.replace('"symbolType":2', '"symbolType":18'), symbol.replace('"symbolType":2', '"symbolType": 2'),
    symbol.replace('"symbolType":2', '"symbolType":2,"symbolType":2'), `${symbol  }["HEAD",{}]\n`, `${symbol  }garbage\n`,
    symbol.replace('"SYMBOL"', '"FOOTPRINT"'), symbol.replace('"x":0', '"x":1e999'), `${symbol  }\n`, `${symbol  }["X",{"same":1,"same":2}]`]) {
    assert.throws(() => extractManagedLibraryMetadata("Part.esym", Buffer.from(invalid)));
  }
});

void test("project metadata matches both native manifest projections without invented optional fields", () => {
  assert.deepEqual(extractManagedProjectMetadata("Fixture.epro2", projectArchive), { title: "Disposable", cbbProject: false, editorVersion: "3.2.209" });
  const legacy = archive([{ name: "project.json", text: JSON.stringify({ config: { title: "Legacy", cbbProject: true } }) }]);
  assert.deepEqual(extractManagedProjectMetadata("Fixture.epro", legacy), { title: "Legacy", cbbProject: true });
  assert.throws(() => extractManagedProjectMetadata("Fixture.epro", projectArchive));
  for (const invalid of ['{"title":"a","title":"b"}', '{"title":"a","cbb_project":1}', '{"title":"a","editorVersion":123}']) {
    assert.throws(() => extractManagedProjectMetadata("Fixture.epro2", archive([{ name: "project2.json", text: invalid }])));
  }
  assert.throws(() => extractManagedProjectMetadata("Fixture.epro2", archive([{ name: "project2.json", text: project }, { name: "project.json", text: "{}" }])));
});

void test("ZIP member integrity includes unprojected peers, bounds, duplicate aliases and complete extent", () => {
  assert.equal(readManagedLibraryZip(projectArchive).size, 2);
  const badCrc = Buffer.from(projectArchive); badCrc[40] = 128;
  const appended = Buffer.concat([projectArchive, Buffer.from("trailing")]);
  for (const invalid of [badCrc, appended, projectArchive.subarray(0, -1),
    archive([{ name: "project2.json", text: project }, { name: "project2.json", text: project }]),
    archive([{ name: "project2.json", text: project }, { name: "PROJECT2.JSON", text: project }]),
    archive([{ name: "../project2.json", text: project }]), archive([{ name: "/project2.json", text: project }]),
    archive([{ name: "FOOTPRINT", text: "x" }, { name: "FOOTPRINT/f1", text: footprint }]),
    archive([{ name: "dir/", text: "bad" }])]) { assert.throws(() => readManagedLibraryZip(invalid)); }
  const unknownPeer = archive([{ name: "project2.json", text: project }, { name: "peer", text: "opaque peer content" }]);
  const peerOffset = unknownPeer.indexOf("opaque peer content"); unknownPeer[peerOffset] = 0;
  assert.throws(() => extractManagedProjectMetadata("Fixture.epro2", unknownPeer), /CRC/u);
  const inflatedBound = archive([{ name: "x", text: "x" }]); const central = inflatedBound.readUInt32LE(inflatedBound.length - 6);
  inflatedBound.writeUInt32LE(MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES + 1, central + 24);
  assert.throws(() => readManagedLibraryZip(inflatedBound), /expansion/u);
});

void test("ZIP refuses unsupported encryption, descriptors, ZIP64, symlinks and local disagreement", () => {
  const clean = archive([{ name: "x", text: "content", deflate: true }]); const central = clean.readUInt32LE(clean.length - 6);
  for (const [offset, value, width] of [[central + 8, 1, 2], [central + 8, 8, 2], [central + 6, 45, 2],
    [central + 30, 1, 2], [central + 38, 0xA0_00 * 65_536, 4], [6, 2048, 2], [central + 42, 1, 4]] as const) {
    const bytes = Buffer.from(clean);
    if (width === 2) { bytes.writeUInt16LE(value, offset); } else { bytes.writeUInt32LE(value, offset); }
    assert.throws(() => readManagedLibraryZip(bytes));
  }
  // A valid compressed stream plus one undeclared stream byte must not pass.
  const length = clean.readUInt32LE(18); const dataEnd = 31 + length; const extended = Buffer.concat([clean.subarray(0, dataEnd), Buffer.from([0]), clean.subarray(dataEnd)]);
  extended.writeUInt32LE(length + 1, 18); extended.writeUInt32LE(length + 1, central + 1 + 20);
  extended.writeUInt32LE(central + 1, extended.length - 6);
  assert.throws(() => readManagedLibraryZip(extended), /unconsumed/u);
});

void test("schemas and discovery reject external selectors, malformed base64 and unsupported file overloads", () => {
  const good = { action: "prepare-file", name: "Part.esym", base64: Buffer.from(symbol).toString("base64"), confirmLocalArtifact: true };
  assert.equal(validateManagedLibraryFilesArguments(good)["valid"], true);
  for (const value of [{ ...good, path: "/tmp/input" }, { ...good, name: "../Part.esym" }, { ...good, name: "Part.zip" },
    { ...good, base64: "garbage" }, { ...good, confirmLocalArtifact: false }, { action: "extract-library-info", files: ["storage-id"] }]) {
    assert.equal(validateManagedLibraryFilesArguments(value)["valid"], false);
  }
  for (const invalid of ["", "AA=", "AB==", "AA==\n", "_w=="]) { assert.throws(() => decodeManagedLibraryBase64(invalid)); }
  const discovery = queryManagedLibraryFiles({ includeSchemas: true });
  assert.equal(discovery["publicSdkMethodExecuted"], false); assert.equal(discovery["installedRuntimeAdmission"], false);
  const descriptor = { schema: "easyeda-pro-control.library-file.v1", name: "Part.esym", path: "/not-opened", bytes: 10, sha256: "0".repeat(64) };
  for (const invalid of [{ action: "extract-project-info", file: descriptor },
    { action: "extract-library-info", files: [{ ...descriptor, name: "Part.epro2" }] },
    { action: "extract-library-info", files: [descriptor, { ...descriptor, name: "PART.esym" }] }]) {
    assert.equal(validateManagedLibraryFilesArguments(invalid)["valid"], false);
  }
});

void test("managed binary inputs are exclusive and filename-bound; metadata extraction detects tampering and symlinks", async () => {
  const prepare = { action: "prepare-file", name: "Fixture.epro2", base64: projectArchive.toString("base64"), confirmLocalArtifact: true };
  const first = await executeManagedLibraryFiles(prepare); const second = await executeManagedLibraryFiles(prepare);
  const file = managedLibraryFileSchema.parse(first["file"]); const secondFile = managedLibraryFileSchema.parse(second["file"]);
  assert.notEqual(file.path, secondFile.path); assert.deepEqual(await readFile(file.path), projectArchive);
  const verified = await readExactBinaryArtifact(file);
  assert.deepEqual(verified.content, projectArchive);
  const extracted = await executeManagedLibraryFiles({ action: "extract-project-info", file });
  assert.deepEqual(extracted["metadata"], { title: "Disposable", cbbProject: false, editorVersion: "3.2.209" });
  assert.equal(extracted["publicSdkMethodExecuted"], false); assert.equal(extracted["designValidityVerified"], false);
  await assert.rejects(executeManagedLibraryFiles({ action: "extract-project-info", file: { ...file, name: "Renamed.epro2" } }), /filename/u);
  const changed = Buffer.from(projectArchive); changed[40] = 128; await writeFile(file.path, changed);
  await assert.rejects(executeManagedLibraryFiles({ action: "extract-project-info", file }), /SHA-256/u);
  await rename(secondFile.path, `${secondFile.path}.original`); await symlink(`${secondFile.path}.original`, secondFile.path);
  await assert.rejects(executeManagedLibraryFiles({ action: "extract-project-info", file: secondFile }));
});

void test("library batches preserve all input members and refuse native last-wins filename deduplication", async () => {
  const files = [];
  for (const [name, source] of [["Part.esym", symbol], ["Part.efoo", footprint], ["Panel.epanl", panel]]) {
    const prepared = await executeManagedLibraryFiles({ action: "prepare-file", name, base64: Buffer.from(source ?? "").toString("base64"), confirmLocalArtifact: true });
    files.push(managedLibraryFileSchema.parse(prepared["file"]));
  }
  const extracted = await executeManagedLibraryFiles({ action: "extract-library-info", files });
  assert.equal(extracted["offline"], true);
  const metadata = extracted["metadata"];
  assert.ok(metadata !== null && typeof metadata === "object");
  assert.equal(JSON.stringify(metadata).includes('"docType":29'), true);
  await assert.rejects(executeManagedLibraryFiles({ action: "extract-library-info", files: [files[0], files[0]] }), /distinct/u);
});
