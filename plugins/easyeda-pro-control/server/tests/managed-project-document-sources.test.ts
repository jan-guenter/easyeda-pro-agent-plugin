import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { executeManagedLibraryFiles } from "../src/managed-library-files-runtime.ts";
import { decodeManagedProjectArchive, managedLibraryFileSchema, validateManagedLibraryFilesArguments } from "../src/managed-library-files.ts";
import { collectManagedProjectDocumentSources, encodeManagedProjectDocumentSourceIndex,
  pageManagedProjectDocumentRoster, pageManagedProjectDocumentSource } from "../src/managed-project-document-sources.ts";
import { inspectManagedSchematicRecords } from "../src/managed-schematic-records.ts";
import { managedProjectFootprintArchive } from "./helpers/managed-project-footprint-archive.ts";
import type { ManagedProjectFootprintArchiveEntry } from "./helpers/managed-project-footprint-archive.ts";

const ID = "1234567890abcdef", PARENT = "abcdef1234567890";
const MANIFEST = { name: "project2.json", content: '{"title":"Supplied source fixture"}' };
function hash(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex"); }
function native(documentType = "SCH_PAGE", uuid = ID, extras: readonly { readonly id: string; readonly type: string; readonly body: unknown }[] = []): string {
  const rows = [{ header: { type: "DOCHEAD" }, body: { docType: documentType, uuid } },
    { header: { id: "META", type: "META" }, body: { title: "保留😀", note: '{"type":"DOCHEAD"}||not a boundary' } },
    ...extras.map(({ id, type, body }) => ({ header: { id, type }, body }))];
  return rows.map(({ header, body }) => `${JSON.stringify(header)}||${JSON.stringify(body)}|\n`).join("");
}
function collect(entries: readonly ManagedProjectFootprintArchiveEntry[]): ReturnType<typeof collectManagedProjectDocumentSources> {
  const archive = managedProjectFootprintArchive([MANIFEST, ...entries]);
  return collectManagedProjectDocumentSources(decodeManagedProjectArchive("Fixture.epro2", archive).members, hash(archive));
}
function record(value: unknown): Record<string, unknown> { assert.ok(isRecord(value)); return value; }

void test("current combined project stream indexes all exact DOCHEAD segments without executing or losing peer documents", () => {
  const first = native("SCH_PAGE", ID, [{ id: "opaque", type: "FUTURE", body: { exact: "unknown body" } }]);
  const second = native("PCB", PARENT); const third = native("FONT", "FONT");
  const set = collect([{ name: "Fixture.epru", content: first + second + third }, { name: "peer.bin", content: Buffer.from([1, 2, 3]) }]);
  assert.deepEqual(set.sources.map(item => item.documentType), ["SCH_PAGE", "PCB", "FONT"]);
  assert.deepEqual(set.sources.map(item => item.documentSource), [first, second, third]);
  assert.equal(set.sources[1]?.memberByteOffset, Buffer.byteLength(first));
  assert.equal(set.sources[2]?.memberByteOffset, Buffer.byteLength(first + second));
  assert.equal(set.totalSourceBytes, Buffer.byteLength(first + second + third));
  assert.equal(hash(encodeManagedProjectDocumentSourceIndex(set)), set.sourceSetSha256);
  assert.equal(encodeManagedProjectDocumentSourceIndex(set).includes(Buffer.from("unknown body")), false);
  assert.equal(set.inputMembers, 3); assert.equal(set.sources[0]?.documentUuid, ID);
  assert.equal(set.sourceLayout, "combined-native"); assert.equal(pageManagedProjectDocumentRoster(set, 0, 32)["completeProjectDocumentInventory"], false);
});

void test("legacy source names preserve sheet IDs separately from document UUIDs and reject aliases or mixed layouts", () => {
  const source = "opaque future\r\n保留😀";
  const set = collect([{ name: `SHEET/${PARENT}/1.esch`, content: source }, { name: `PCB/${ID}.epcb`, content: native("PCB") }]);
  assert.equal(set.sources[0]?.sheetId, "1"); assert.equal(set.sources[0]?.schematicId, PARENT);
  assert.equal(set.sources[0]?.documentUuid, null); assert.equal(set.sources[0]?.documentSource, source);
  assert.equal(set.sources[1]?.documentUuid, ID); assert.equal(set.sourceLayout, "recognized-legacy-members");
  for (const name of [`SHEET/${PARENT}/1.ESCH`, `sheet/${PARENT}/1.esch`, `SHEET/${PARENT}/1.esch/`, `${ID}.epcb`, `PCB/${ID}.esym`]) {
    assert.throws(() => collect([{ name, content: name.endsWith("/") ? "" : source }]), /canonical/u);
  }
  assert.throws(() => collect([{ name: "Fixture.epru", content: native() }, { name: `SHEET/${PARENT}/1.esch`, content: source }]), /mixed/u);
  assert.throws(() => collect([{ name: "nested/Fixture.epru", content: native() }]), /canonical/u);
});

void test("combined source delimiters are complete and decoded records cannot counterfeit DOCHEAD segments", () => {
  const source = native(); assert.equal(collect([{ name: "Fixture.epru", content: source }]).sources.length, 1);
  for (const changed of [source.slice(0, -2), source + native("PCB", ID), source.replace('"SCH_PAGE"', '"SCH_PAGE", "docType":"PCB"'),
    `{"type":"META","id":"x"}||{}|\n${source}`, `${source}{"type":"FUTURE"}||{broken}|\n`]) {
    assert.throws(() => collect([{ name: "Fixture.epru", content: changed }]));
  }
  assert.throws(() => collect([{ name: "Fixture.epru", content: Buffer.from([0xC3, 0x28]) }]), /encoding|encoded/u);
  assert.throws(() => collect([{ name: "Fixture.epru", content: source }, { name: "Other.epru", content: native("PCB", PARENT) }]), /one canonical/u);
});

void test("document source pages reconstruct exact Unicode bytes and roster identity without general path access", () => {
  const source = native(); const set = collect([{ name: "Fixture.epru", content: source }]); const item = set.sources[0]; assert.ok(item);
  const pages: Buffer[] = []; let offset = 0;
  while (offset < source.length) {
    const page = pageManagedProjectDocumentSource(item, offset, 3); const bytes = Buffer.from(String(page["pageBase64"]), "base64");
    assert.equal(page["sourceId"], item.sourceId); assert.equal(page["documentUuid"], ID); assert.equal(Object.hasOwn(page, "footprintUuid"), false);
    assert.equal(hash(bytes), page["pageSha256"]); pages.push(bytes); offset = Number(page["nextOffset"]);
  }
  assert.deepEqual(Buffer.concat(pages), Buffer.from(source));
  assert.throws(() => pageManagedProjectDocumentSource(item, source.indexOf("😀") + 1, 3), /surrogate/u);
  assert.equal(pageManagedProjectDocumentRoster(set, 0, 1)["completeRosterReturned"], true);
  assert.equal(pageManagedProjectDocumentRoster(set, 1, 1)["completeRosterReturned"], false);
});

void test("schematic raw reports retain exact bodies and distinguish source records from compiled connectivity", () => {
  const body = { symbol: "unresolved", x: 0, rotation: 90, future: { value: null }, pinCount: 12 };
  const source = native("SCH_PAGE", ID, [{ id: "part", type: "COMPONENT", body },
    { id: "wire", type: "WIRE", body: { net: "GND" } }, { id: "opaque", type: "FUTURE", body: { retained: true } }]);
  const item = collect([{ name: "Fixture.epru", content: source }]).sources[0]; assert.ok(item);
  const report = inspectManagedSchematicRecords(item, 0, 1); const rows = report["records"]; assert.ok(Array.isArray(rows));
  assert.deepEqual(record(rows[0])["body"], body); assert.equal(record(rows[0])["recordType"], "COMPONENT");
  assert.equal(report["recordCount"], 5); assert.equal(record(report["recordTypes"])["FUTURE"], 1);
  assert.equal(report["totalRecognizedRecords"], 2); assert.equal(report["nextOffset"], 1); assert.equal(report["endOfRecords"], false);
  for (const key of ["inheritedSymbolPinsResolved", "componentDependenciesVerified", "geometricContactsEvaluated", "connectivityCompiled", "netMembershipVerified", "electricalRulesEvaluated"]) {
    assert.equal(report[key], false);
  }
  const line = source.split("|\n")[2]; assert.ok(line !== undefined); assert.equal(record(rows[0])["recordSha256"], hash(Buffer.from(line)));
});

void test("schematic reports validate the full source and refuse mutable histories, duplicate IDs and other document types", () => {
  const base = native("SCH_PAGE", ID, [{ id: "part", type: "COMPONENT", body: { x: 1 } }]);
  const item = collect([{ name: "Fixture.epru", content: base }]).sources[0]; assert.ok(item);
  const changes = [`${base  }{"type":"DELETE","id":"gone"}||{}|\n`, `${base  }{"type":"LINE","id":"part"}||{}|\n`,
    `${base  }{"type":"PIN","id":"tombstone"}|||\n`, base.replace('"SCH_PAGE"', '"PCB"')];
  for (const changed of changes) { assert.throws(() => inspectManagedSchematicRecords({ ...item, documentSource: changed }, 0, 1)); }
  assert.equal(pageManagedProjectDocumentSource({ ...item, documentSource: changes[0] ?? base, utf16CodeUnits: (changes[0] ?? base).length }, 0, 4096)["documentSource"], changes[0]);
  assert.throws(() => inspectManagedSchematicRecords(item, 2, 1), /offset/u);
});

void test("all new offline actions have strict archive descriptors, digest selectors and separate page bounds", () => {
  const file = { schema: "easyeda-pro-control.library-file.v1", name: "Fixture.epro2", path: "/not-opened", bytes: 100, sha256: "a".repeat(64) };
  const request = { action: "inspect-schematic-records", file, expectedSourceSetSha256: "b".repeat(64), sourceId: "c".repeat(64) };
  assert.equal(validateManagedLibraryFilesArguments(request)["valid"], true);
  for (const changed of [{ ...request, sourceId: "short" }, { ...request, length: 17 }, { ...request, offset: -1 },
    { ...request, file: { ...file, name: "Fixture.esym" } }, { ...request, source: "injected" }]) {
    assert.equal(validateManagedLibraryFilesArguments(changed)["valid"], false);
  }
});

void test("real offline dispatcher publishes complete document index, reports raw records and rechecks archive on every read", async () => {
  const source = native("SCH_PAGE", ID, [{ id: "part", type: "COMPONENT", body: { symbol: "unresolved" } }]);
  const bytes = managedProjectFootprintArchive([MANIFEST, { name: "Fixture.epru", content: source + native("PCB", PARENT) }]);
  const prepared = await executeManagedLibraryFiles({ action: "prepare-file", name: "Fixture.epro2", base64: bytes.toString("base64"), confirmLocalArtifact: true });
  const file = managedLibraryFileSchema.parse(prepared["file"]); const extracted = await executeManagedLibraryFiles({ action: "extract-project-document-sources", file });
  assert.equal(extracted["documentCount"], 2); assert.equal(extracted["offline"], true); assert.equal(extracted["executionAuthorized"], false);
  const index = record(extracted["index"]); const indexBytes = await readFile(String(index["path"]));
  assert.equal(hash(indexBytes), extracted["sourceSetSha256"]);
  const bound = { file, expectedSourceSetSha256: extracted["sourceSetSha256"] };
  const roster = await executeManagedLibraryFiles({ action: "list-project-document-sources", ...bound }); const sources = roster["sources"]; assert.ok(Array.isArray(sources));
  const sourceId = record(sources[0])["sourceId"];
  const raw = await executeManagedLibraryFiles({ action: "read-project-document-source", ...bound, sourceId }); assert.equal(raw["documentSource"], source);
  const report = await executeManagedLibraryFiles({ action: "inspect-schematic-records", ...bound, sourceId });
  assert.equal(report["totalRecognizedRecords"], 1); assert.equal(report["schematicRecordFramingValidated"], true); assert.equal(report["connectivityCompiled"], false);
  await assert.rejects(executeManagedLibraryFiles({ action: "read-project-document-source", ...bound, sourceId, expectedSourceSetSha256: "0".repeat(64) }), /digest/u);
  await assert.rejects(executeManagedLibraryFiles({ action: "read-project-document-source", ...bound, sourceId: "0".repeat(64) }), /absent/u);
  await assert.rejects(executeManagedLibraryFiles({ action: "read-project-document-source", ...bound, sourceId, file: { ...file, path: "/external.epro2" } }), /prepared directory/u);
  await writeFile(file.path, Buffer.concat([bytes, Buffer.from([0])]));
  await assert.rejects(executeManagedLibraryFiles({ action: "inspect-schematic-records", ...bound, sourceId }), /SHA-256|byte/u);
});

void test("generic current project SYMBOL segments reuse exact raw pin inspection without resolving component inheritance", async () => {
  const source = native("SYMBOL", ID, [{ id: "pin", type: "PIN", body: { partId: "part", x: 0, y: 1, length: 10, rotation: 90, display: true } },
    { id: "number", type: "ATTR", body: { partId: "part", parentId: "pin", key: "Pin Number", value: "01", valueVisible: false } }]);
  const bytes = managedProjectFootprintArchive([MANIFEST, { name: "Fixture.epru", content: source }]);
  const prepared = await executeManagedLibraryFiles({ action: "prepare-file", name: "Symbols.epro2", base64: bytes.toString("base64"), confirmLocalArtifact: true });
  const file = managedLibraryFileSchema.parse(prepared["file"]); const extracted = await executeManagedLibraryFiles({ action: "extract-project-document-sources", file });
  const bound = { file, expectedSourceSetSha256: extracted["sourceSetSha256"] };
  const roster = await executeManagedLibraryFiles({ action: "list-project-document-sources", ...bound }); const sources = roster["sources"]; assert.ok(Array.isArray(sources));
  const sourceId = record(sources[0])["sourceId"];
  const pins = await executeManagedLibraryFiles({ action: "inspect-project-symbol-pins", ...bound, sourceId });
  assert.equal(pins["totalPins"], 1); assert.equal(pins["symbolId"], ID); assert.equal(pins["pinToPadMappingVerified"], false);
  const rows = pins["pins"]; assert.ok(Array.isArray(rows)); assert.equal(record(rows[0])["number"], "01");
  assert.equal(pins["symbolPinRecordFramingValidated"], true);
});
