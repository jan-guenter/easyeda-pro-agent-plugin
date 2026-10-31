import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { crc32, deflateRawSync } from "node:zlib";
import { MANAGED_LIBRARY_ARCHIVE_MAX_SOURCE_BYTES, collectManagedLibraryArchiveSources, encodeManagedLibraryArchiveSourceIndex,
  pageManagedLibraryArchiveRoster, pageManagedLibraryArchiveSource } from "../src/managed-library-archive-sources.ts";

const MEMBER = "ProLib_pc_2026-10-31.elibu", NAME = "ProLib_pc_2026-10-31.elibz2";
const OTHER = "fedcba0987654321fedcba0987654321", UUID = "1234567890abcdef1234567890abcdef";
const PATH = "0819f05c4eef4c71ace90d822a990e87";
function hash(value: Buffer | string): string { return createHash("sha256").update(value).digest("hex"); }
interface Entry { readonly name: string; readonly content: Buffer }
function archive(entries: readonly Entry[]): Buffer {
  const centrals: Buffer[] = [], locals: Buffer[] = []; let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name); const content = entry.content;
    // oxlint-disable-next-line node/no-sync -- Bounded deterministic fixtures exercise the actual ZIP inflation and CRC reader.
    const compressed = deflateRawSync(content); const central = Buffer.alloc(46), local = Buffer.alloc(30);
    local.writeUInt32LE(0x04_03_4B_50); local.writeUInt16LE(20, 4); local.writeUInt16LE(8, 8);
    local.writeUInt32LE(crc32(content), 14); local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(content.length, 22); local.writeUInt16LE(name.length, 26);
    central.writeUInt32LE(0x02_01_4B_50); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(8, 10);
    central.writeUInt32LE(crc32(content), 16); central.writeUInt32LE(compressed.length, 20); central.writeUInt32LE(content.length, 24);
    central.writeUInt16LE(name.length, 28); central.writeUInt32LE(offset, 42);
    locals.push(local, name, compressed); centrals.push(central, name); offset += local.length + name.length + compressed.length;
  }
  const directory = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06_05_4B_50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, directory, end]);
}
function row(type: string, id: string, value: unknown, extra: Record<string, unknown> = {}): string {
  return `${JSON.stringify({ type, ticket: 2, id, ...extra })}||${JSON.stringify(value)}`;
}
function head(uuid = UUID, type = "FOOTPRINT"): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket: 0 })}||${JSON.stringify({ docType: type, uuid, client: "original", future: { retained: true } })}`;
}
function item(uuid = UUID, docType: 2 | 4 = 4): Record<string, unknown> {
  return { uuid, path: PATH, docType, title: "Exact title", description: "Description", tags: ["Tag"], source: "local",
    ticket: 12, future: { url: "https://example.invalid/never-follow", nested: ["retained", 1] } };
}
function meta(docType: 2 | 4 = 4): string {
  return `${JSON.stringify({ type: "META", ticket: 1, id: "META" })}||${JSON.stringify({ title: "Exact title", description: "Description", tags: ["Tag"], source: "local", ...(docType === 2 ? { docType: 2 } : {}) })}`;
}
function body(uuid = UUID, type = "FOOTPRINT", terminal = false): string {
  return `${head(uuid, type)}|\n${row("CANVAS", "CANVAS", { title: "raw 😀", future: "|| source" })}|\n${row("FUTURE", "future", { arbitrary: [1, { value: "retained" }] }, { future: "header||value" })}${terminal ? "|\n" : ""}`;
}
function wrapped(uuid = UUID, docType: 2 | 4 = 4, terminal = false): string {
  return [head(uuid, docType === 4 ? "FOOTPRINT" : "SYMBOL"), meta(docType), body(uuid, docType === 4 ? "FOOTPRINT" : "SYMBOL", terminal)].join("|\n");
}
function manifest(values: readonly Record<string, unknown>[] = [item()], docType: 2 | 4 = 4): string {
  const members: Record<string, unknown> = {};
  for (const value of values) { members[String(value["uuid"])] = value; }
  return JSON.stringify({ devices: {}, symbols: docType === 2 ? members : {},
    footprints: docType === 4 ? members : {}, panelLibs: {}, futureRoot: { keep: true } });
}
function input(source = wrapped(), json = manifest(), member = MEMBER, manifestName = "footprint2.json"): Buffer {
  return archive([{ name: member, content: Buffer.from(source) }, { name: manifestName, content: Buffer.from(json) }]);
}
function collect(bytes = input()): ReturnType<typeof collectManagedLibraryArchiveSources> {
  return collectManagedLibraryArchiveSources(NAME, bytes, hash(bytes));
}

void test("v2 archive decoder binds exact original body, complete manifest, native prefix and unknown fields", () => {
  const bytes = input(); const result = collect(bytes); const source = result.sources[0]; assert.ok(source);
  assert.equal(result.inputSha256, hash(bytes)); assert.equal(result.inputMembers, 2);
  assert.equal(result.manifestSha256, hash(manifest())); assert.equal(result.sourceMemberSha256, hash(wrapped()));
  assert.equal(source.documentSource, body()); assert.equal(source.sha256, hash(body())); assert.equal(source.bytes, Buffer.byteLength(body()));
  const metadataText = JSON.stringify(item());
  assert.equal(source.metadataSha256, hash(metadataText)); assert.deepEqual(source.metadata, { title: "Exact title", path: PATH, description: "Description" });
  const prefix = `${head()}|\n${meta()}|\n`;
  assert.deepEqual(source.exportPrefix, { memberByteOffset: 0, bytes: Buffer.byteLength(prefix), sha256: hash(prefix), headerSha256: hash(head()), metaSha256: hash(meta()) });
  assert.equal(source.memberByteOffset, Buffer.byteLength(prefix)); assert.match(source.documentSource, /header\|\|value/u);
  const index = encodeManagedLibraryArchiveSourceIndex(result); assert.equal(result.sourceSetSha256, hash(index));
  assert.doesNotMatch(index.toString(), /documentSource|never-follow|arbitrary/u);
  assert.match(index.toString(), /"sourceSubtypeVerified":false/u);
  assert.ok(Object.isFrozen(result)); assert.ok(Object.isFrozen(result.sources));
});

void test("native symbol metadata type2 is recognized without claiming geometry subtype or pin validity", () => {
  const bytes = input(wrapped(UUID, 2), manifest([item(UUID, 2)], 2), MEMBER, "symbol2.json"); const result = collect(bytes);
  assert.equal(result.manifestMember, "symbol2.json"); assert.equal(result.sources[0]?.documentType, "SYMBOL"); assert.equal(result.sources[0]?.docType, 2);
  assert.equal(pageManagedLibraryArchiveRoster(result, 0, 32)["sourceSubtypeVerified"], false);
});

void test("multiple exact members preserve native order and original optional terminal delimiters", () => {
  for (const terminal of [false, true]) {
    const source = `${wrapped(OTHER, 4, terminal)}|\n${wrapped(UUID, 4, true)}`;
    const json = manifest([item(), item(OTHER)]); const bytes = input(source, json, "ProLib_2pcs_2026-10-31.elibu"); const result = collect(bytes);
    assert.deepEqual(result.sources.map((entry) => entry.documentUuid), [OTHER, UUID]);
    assert.equal(result.sources[0]?.documentSource, body(OTHER, "FOOTPRINT", terminal)); assert.equal(result.sources[1]?.documentSource, body(UUID, "FOOTPRINT", true));
    const second = result.sources[1]; assert.notEqual(second, undefined); if (second === undefined) { throw new Error("Missing second fixture source."); }
    assert.equal(Buffer.from(source).subarray(second.memberByteOffset, second.memberByteOffset + second.bytes).toString(), second.documentSource);
    assert.equal(result.totalSourceBytes, result.sources.reduce((sum, entry) => sum + entry.bytes, 0));
  }
  const arrayOfOne = input(wrapped(), manifest(), "ProLib_1pcs_2026-10-31.elibu"); assert.equal(collect(arrayOfOne).sources.length, 1);
});

void test("all source pages preserve exact UTF8 bytes, Unicode boundaries and complete digest binding", () => {
  const result = collect(); const source = result.sources[0]; assert.ok(source); let offset = 0, restored = "";
  while (offset < source.utf16CodeUnits) {
    const page = pageManagedLibraryArchiveSource(source, offset, 7); const text = String(page["documentSource"]); const bytes = Buffer.from(String(page["pageBase64"]), "base64");
    assert.equal(bytes.toString(), text); assert.equal(hash(bytes), page["pageSha256"]); assert.equal(page["sourceSha256"], source.sha256);
    restored += text; offset = Number(page["nextOffset"]);
  }
  assert.equal(restored, source.documentSource);
  const emoji = source.documentSource.indexOf("😀"); assert.throws(() => pageManagedLibraryArchiveSource(source, emoji + 1, 7), /surrogate/u);
  assert.throws(() => pageManagedLibraryArchiveSource(source, emoji, 1), /character/u);
  for (const [start, length] of [[-1, 1], [0, 0], [0, 4097], [source.utf16CodeUnits + 1, 1], [0.1, 1]]) { assert.throws(() => pageManagedLibraryArchiveSource(source, start ?? 0, length ?? 0)); }
  const roster = pageManagedLibraryArchiveRoster(result, 0, 32); assert.equal(roster["totalSources"], 1); assert.equal(roster["completeRosterReturned"], true);
  assert.doesNotMatch(JSON.stringify(roster), /documentSource/u); assert.throws(() => pageManagedLibraryArchiveRoster(result, 2, 1));
});

void test("exact container grammar refuses wrong kinds, legacy/project manifests, aliases, extra members and dates", () => {
  const standard = [{ name: MEMBER, content: Buffer.from(wrapped()) }, { name: "footprint2.json", content: Buffer.from(manifest()) }];
  for (const bytes of [archive([standard[0] ?? { name: "", content: Buffer.alloc(0) }]),
    archive([...standard, { name: "project2.json", content: Buffer.from("{}") }]),
    input(wrapped(), manifest(), MEMBER, "footprint.json"), input(wrapped(), manifest(), MEMBER, "device2.json"),
    input(wrapped(), manifest(), MEMBER, "panel-lib2.json"), input(wrapped(), manifest(), `dir/${MEMBER}`),
    input(wrapped(), manifest(), "ProLib_pc_2026-02-30.elibu"), input(wrapped(), manifest(), "ProLib_pc_2026-10-31.ELIBU"),
    input(wrapped(), manifest(), "ProLib_2pcs_2026-10-31.elibu"), input(wrapped(), manifest(), "arbitrary.elibu"),
    archive([{ name: MEMBER, content: Buffer.from(wrapped()) }, { name: MEMBER.toUpperCase(), content: Buffer.from(wrapped()) }])]) {
    assert.throws(() => collect(bytes));
  }
});

void test("missing, duplicate, unknown and contradictory manifest/source memberships never return partial rosters", () => {
  const changedType = { ...item(), docType: 2 }; const changedUuid = { ...item(), uuid: OTHER };
  for (const bytes of [input("", manifest()), input(wrapped(), manifest([])), input(wrapped(), manifest([item(), item(OTHER)]), "ProLib_2pcs_2026-10-31.elibu"),
    input(`${wrapped()}|\n${wrapped()}`, manifest([item(), item(OTHER)]), "ProLib_2pcs_2026-10-31.elibu"),
    input(wrapped(OTHER)), input(wrapped(), manifest([changedType])),
    input(wrapped(), manifest().replace(`"${UUID}":`, `"${OTHER}":`)), input(wrapped(), manifest([changedUuid])),
    input(wrapped(), manifest().replace('"devices":{}', `"devices":{"${OTHER}":{}}`)),
    input(wrapped(), manifest().replace('"symbols":{}', `"symbols":{"${OTHER}":{}}`)),
    input(wrapped(), manifest().replace('"panelLibs":{}', `"panelLibs":{"${OTHER}":{}}`)),
    input(wrapped(), manifest().replace('"footprints":{', '"footprints":{},"footprints":{'))]) { assert.throws(() => collect(bytes)); }
});

void test("synthetic prefix and metadata must match complete exporter model", () => {
  const nonemptyDisplay = { ...item(), display_title: "Visible title" };
  const displayWrapped = wrapped().replace('"title":"Exact title"', '"title":"Visible title"');
  const displayBytes = input(displayWrapped, manifest([nonemptyDisplay])); assert.equal(collect(displayBytes).sources.length, 1);
  const unknown = { ...item(), future: { changed: "retained" } };
  const unknownBytes = input(wrapped(), manifest([unknown])); assert.notEqual(collect(unknownBytes).sourceSetSha256, collect().sourceSetSha256);
  for (const bytes of [input(wrapped().replace('"ticket":1', '"ticket":2')), input(wrapped().replace('"id":"META"', '"id":"other"')),
    input(wrapped().replace('"description":"Description"', '"description":"other"')),
    input(wrapped().replace('"tags":["Tag"]', '"tags":[]')), input(wrapped().replace('"source":"local"', '"source":""')),
    input(wrapped().replace('"title":"Exact title"', '"title":"other"')),
    input(wrapped().replace('"id":"META"}', '"id":"META","unexpected":true}')),
    input(wrapped(), manifest([{ ...item(), tags: { parent_tag: { name: "Parent" } } }])),
    input(wrapped(), manifest([{ ...item(), title: "x".repeat(513) }])),
    input(wrapped(), manifest([{ ...item(), path: "http://example.invalid" }]))]) { assert.throws(() => collect(bytes)); }
});

void test("complete native lexical recognition rejects malformed later records, history, blobs and original type conflicts", () => {
  for (const source of [`${wrapped()}|\ngarbage`, `${wrapped()}|\n|\n`, `${wrapped()}|\n${row("CANVAS", "CANVAS", {})}`,
    `${head()}|\n${meta()}|\n${head()}`,
    `${wrapped()}|\n${row("FUTURE", "empty", null)}`, `${wrapped()}|\n${row("DELETE_DOC", "deleted", { isDelete: true })}`,
    `${wrapped()}|\n${row("EDIT_HEAD", "edit", {})}`, `${wrapped()}|\n${row("META_MODIFY", "meta", {})}`,
    `${wrapped()}|\n${head(OTHER, "BLOB")}|\n${row("BLOB", "blob", {})}`,
    wrapped().replace('"ticket":2', '"ticket":"2"'), wrapped().replace('"arbitrary":[1,', '"arbitrary":[1e999,'),
    wrapped().replace('"value":"retained"', '"value":"retained","value":"duplicate"'), wrapped().replace('"client":"original"', '"client":"altered"'),
    wrapped().replace('header||value', 'header||value\nraw-line')]) {
    assert.throws(() => collect(input(source)));
  }
  const conflictJson = manifest([item(UUID, 2)], 2);
  const conflictBytes = input(`${wrapped(UUID, 2)}|\n${row("META", "META", { docType: 18 })}`, conflictJson, MEMBER, "symbol2.json");
  assert.throws(() => collect(conflictBytes));
});

void test("source, manifest and aggregate membership bounds apply before any page", () => {
  const huge = `${wrapped()}|\n${row("FUTURE", "huge", { text: "a".repeat(MANAGED_LIBRARY_ARCHIVE_MAX_SOURCE_BYTES) })}`;
  assert.throws(() => collect(input(huge)), /source byte bound/u);
  assert.throws(() => collect(input(wrapped(), `${manifest()}${" ".repeat(MANAGED_LIBRARY_ARCHIVE_MAX_SOURCE_BYTES)}`)), /manifest/u);
  const entries = Array.from({ length: 17 }, (_, index) => item(index.toString(16).padStart(16, "0")));
  assert.throws(() => collect(input(wrapped(), manifest(entries), "ProLib_17pcs_2026-10-31.elibu")), /membership/u);
  const records = Array.from({ length: 8192 }, (_, index) => row("FUTURE", `f${index}`, {})).join("|\n");
  assert.throws(() => collect(input(`${wrapped()}|\n${records}`)), /record count/u);
});

void test("exact archive digests, CRC and fatal UTF8 reject corrupt supplied evidence", () => {
  const bytes = input(); assert.throws(() => collectManagedLibraryArchiveSources(NAME, bytes, "0".repeat(64)), /digest/u);
  assert.throws(() => collectManagedLibraryArchiveSources("../Unsafe.elibz2", bytes, hash(bytes)), /filename/u);
  assert.throws(() => collectManagedLibraryArchiveSources("File.elibz", bytes, hash(bytes)), /filename/u);
  const bad = Buffer.from(bytes); bad[35] = ((bad[35] ?? 0) + 1) % 256; assert.throws(() => collect(bad));
  for (const content of [Buffer.from([0xFF]), Buffer.concat([Buffer.from(wrapped()), Buffer.from([0])]), Buffer.from(`\uFEFF${wrapped()}`)]) {
    const malformed = archive([{ name: MEMBER, content }, { name: "footprint2.json", content: Buffer.from(manifest()) }]); assert.throws(() => collect(malformed));
  }
  const malformedJson = archive([{ name: MEMBER, content: Buffer.from(wrapped()) }, { name: "footprint2.json", content: Buffer.from([0xFF]) }]);
  assert.throws(() => collect(malformedJson));
});
