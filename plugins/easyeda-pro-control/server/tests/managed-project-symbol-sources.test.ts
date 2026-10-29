import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { executeManagedLibraryFiles } from "../src/managed-library-files-runtime.ts";
import { decodeManagedProjectArchive, managedLibraryFileSchema, validateManagedLibraryFilesArguments } from "../src/managed-library-files.ts";
import { collectManagedProjectSymbolSources, collectManagedStandaloneSymbolSource, encodeManagedSymbolSourceIndex,
  pageManagedSymbolRoster, pageManagedSymbolSource } from "../src/managed-project-symbol-sources.ts";
import { inspectManagedSymbolPins } from "../src/managed-symbol-pins.ts";
import { managedProjectFootprintArchive } from "./helpers/managed-project-footprint-archive.ts";
import type { ManagedProjectFootprintArchiveEntry } from "./helpers/managed-project-footprint-archive.ts";

const SYMBOL_ID = "1234567890abcdef";
const OTHER_ID = "abcdef1234567890abcdef1234567890";
const MANIFEST = { name: "project2.json", content: '{"title":"Supplied symbol fixture"}' };
function hash(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex"); }
function jsonSource(extra: readonly (readonly unknown[])[] = []): string {
  const lines = [["DOCTYPE", "SYMBOL", "1.0"], ["HEAD", { symbolType: 2, opaque: "保留😀" }], ["PART", "part-A", { future: true }],
    ["PIN", "pin-A", 0, null, 0, -20, 0, 270, null, 3, 1],
    ["ATTR", "number-A", "pin-A", "NUMBER", "01", 0, 1, null, null, 0, null, 0],
    ["ATTR", "name-A", "pin-A", "NAME", "", null, 0, null, null, 0, null, 0],
    ["ATTR", "type-A", "pin-A", "Pin Type", "Passive", 0, 0, null, null, 0, null, 0],
    ["FUTURE_RECORD", { retained: "exact unknown fields" }], ...extra].map((row) => JSON.stringify(row)).join("\r\n");
  return `${lines}\r\n`;
}
function nativeSource(extra: readonly { readonly id: string; readonly type: string; readonly body: Record<string, unknown> }[] = []): string {
  const rows = [{ header: { type: "DOCHEAD" }, body: { docType: "SYMBOL", uuid: SYMBOL_ID, future: "retained" } },
    { header: { id: "META", type: "META", ticket: 1 }, body: { title: "Fixture" } },
    { header: { id: "part", type: "PART", ticket: 2 }, body: { title: "P" } },
    { header: { id: "pin", type: "PIN", ticket: 3 }, body: { partId: "part", x: 1.25, y: -2, length: 10, rotation: 90, display: true, pinShape: "CLOCK", future: { retained: true } } },
    { header: { id: "number", type: "ATTR", ticket: 4 }, body: { partId: "part", parentId: "pin", key: "Pin Number", value: "1", keyVisible: false, valueVisible: true } },
    ...extra.map(({ id, type, body }, index) => ({ header: { id, type, ticket: index + 5 }, body }))];
  return rows.map(({ header, body }) => `${JSON.stringify(header)}||${JSON.stringify(body)}|\n`).join("");
}
function collect(entries: readonly ManagedProjectFootprintArchiveEntry[]): ReturnType<typeof collectManagedProjectSymbolSources> {
  const bytes = managedProjectFootprintArchive([MANIFEST, ...entries]);
  return collectManagedProjectSymbolSources(decodeManagedProjectArchive("Fixture.epro2", bytes).members, hash(bytes));
}
function record(value: unknown): Record<string, unknown> { assert.ok(isRecord(value)); return value; }

void test("symbol index follows the exact pinned producer member convention and preserves opaque raw sources", () => {
  const first = `\uFEFF${nativeSource()}opaque unknown tail\r\n`;
  const set = collect([{ name: `SYMBOL/${OTHER_ID}.esym`, content: first }, { name: `SYMBOL/${SYMBOL_ID}.esym`, content: jsonSource() },
    { name: "peer.unknown", content: "untouched" }]);
  assert.deepEqual(set.sources.map((item) => item.symbolId), [OTHER_ID, SYMBOL_ID]);
  assert.equal(set.sources[0]?.documentSource, first); assert.equal(set.sources[0]?.sha256, hash(Buffer.from(first)));
  assert.equal(set.inputMembers, 4); assert.equal(hash(encodeManagedSymbolSourceIndex(set)), set.sourceSetSha256);
  assert.equal(encodeManagedSymbolSourceIndex(set).includes(Buffer.from("opaque unknown tail")), false);
  assert.equal(collect([]).sources.length, 0);
  for (const name of [`${SYMBOL_ID}.esym`, `symbol/${SYMBOL_ID}.esym`, `SYMBOL/${SYMBOL_ID}.ESYM`,
    `SYMBOL/${SYMBOL_ID}.esym/`, `SYMBOL/${"a".repeat(64)}.esym`, `SYMBOL/${SYMBOL_ID}.extra.esym`]) {
    assert.throws(() => collect([{ name, content: name.endsWith("/") ? "" : first }]), /canonical/u);
  }
  assert.throws(() => collect([{ name: `SYMBOL/${SYMBOL_ID}.esym`, content: "" }]), /empty/u);
  assert.throws(() => collect([{ name: `SYMBOL/${SYMBOL_ID}.esym`, content: Buffer.from([0xC3, 0x28]) }]), /encoded|encoding/u);
});

void test("lossless symbol pages preserve Unicode pairs, raw unknown rows and digest-bound roster order", () => {
  const source = `\uFEFF${jsonSource()}`; const set = collect([{ name: `SYMBOL/${SYMBOL_ID}.esym`, content: source }]);
  const item = set.sources[0]; assert.ok(item);
  const pages: Buffer[] = []; let offset = 0;
  while (offset < source.length) {
    const page = pageManagedSymbolSource(item, offset, 3); const bytes = Buffer.from(String(page["pageBase64"]), "base64");
    assert.equal(hash(bytes), page["pageSha256"]); assert.equal(page["symbolId"], SYMBOL_ID); assert.equal(Object.hasOwn(page, "footprintUuid"), false);
    pages.push(bytes); offset = Number(page["nextOffset"]);
  }
  assert.deepEqual(Buffer.concat(pages), Buffer.from(source));
  assert.throws(() => pageManagedSymbolSource(item, source.indexOf("😀") + 1, 3), /surrogate/u);
  assert.equal(pageManagedSymbolRoster(set, 0, 1)["completeRosterReturned"], true);
  assert.equal(pageManagedSymbolRoster(set, 1, 1)["completeRosterReturned"], false);
  assert.throws(() => pageManagedSymbolRoster(set, 2, 1), /bounds/u);
});

void test("ordinary standalone pin DTO retains zero, empty string, raw orientation and separate visibility", () => {
  const set = collectManagedStandaloneSymbolSource("Fixture.esym", Buffer.from(jsonSource())); const item = set.sources[0]; assert.ok(item);
  const output = inspectManagedSymbolPins(item, 0, 16); assert.equal(output["totalPins"], 1); assert.equal(output["sourceFormat"], "json-lines-1.0");
  const pins = output["pins"]; assert.ok(Array.isArray(pins)); const pin = record(pins[0]);
  assert.equal(pin["id"], "pin-A"); assert.equal(pin["partId"], "part-A"); assert.equal(pin["number"], "01"); assert.equal(pin["name"], "");
  assert.equal(pin["electricalType"], "Passive"); assert.equal(pin["x"], 0); assert.equal(pin["y"], -20); assert.equal(pin["length"], 0);
  assert.equal(pin["orientation"], 270); assert.equal(pin["visible"], false); assert.equal(pin["pinShapeRaw"], 3);
  assert.equal(record(pin["numberAttribute"])["valueVisible"], true); assert.equal(record(pin["nameAttribute"])["keyVisible"], null);
  const rawLine = jsonSource().split("\r\n")[3]; assert.ok(rawLine !== undefined); assert.equal(pin["recordSha256"], hash(Buffer.from(rawLine)));
  assert.equal(record(output["recordTypes"])["FUTURE_RECORD"], 1); assert.equal(output["electricalRulesEvaluated"], false);
});

void test("native exported SYMBOL pins require member UUID agreement and unique records without folding history", () => {
  const set = collect([{ name: `SYMBOL/${SYMBOL_ID}.esym`, content: nativeSource() }]); const item = set.sources[0]; assert.ok(item);
  const output = inspectManagedSymbolPins(item, 0, 1); const pins = output["pins"]; assert.ok(Array.isArray(pins));
  const pin = record(pins[0]); assert.equal(output["sourceFormat"], "native-dochead"); assert.equal(pin["x"], 1.25); assert.equal(pin["y"], -2);
  assert.equal(pin["number"], "1"); assert.equal(pin["namePresent"], false); assert.equal(pin["name"], null); assert.equal(pin["visible"], true);
  for (const changed of [nativeSource().replace(SYMBOL_ID, OTHER_ID), nativeSource([{ id: "pin", type: "PIN", body: {} }]),
    nativeSource([{ id: "deleted", type: "DELETE_DOC", body: { isDelete: true } }]), nativeSource().replace('|\n', '|\r\n')]) {
    assert.throws(() => inspectManagedSymbolPins({ ...item, documentSource: changed }, 0, 1));
  }
  const duplicate = nativeSource([{ id: "number2", type: "ATTR", body: { partId: "part", parentId: "pin", key: "Pin Number", value: "2" } }]);
  assert.throws(() => inspectManagedSymbolPins({ ...item, documentSource: duplicate }, 0, 1), /ambiguous/u);
  const wrongPart = nativeSource().replace('"partId":"part","parentId":"pin"', '"partId":"other-part","parentId":"pin"');
  assert.throws(() => inspectManagedSymbolPins({ ...item, documentSource: wrongPart }, 0, 1), /part differs/u);
});

void test("pin pages validate the complete source before returning and distinguish part-scoped IDs", () => {
  const invalid = jsonSource([["PIN", "later", 1, null, "not finite", 0, 10, 0, null, 0, 0]]);
  const item = collectManagedStandaloneSymbolSource("Fixture.esym", Buffer.from(invalid)).sources[0]; assert.ok(item);
  assert.throws(() => inspectManagedSymbolPins(item, 0, 1), /finite/u);
  const duplicate = jsonSource([["PIN", "pin-A", 1, null, 1, 0, 10, 0, null, 0, 0]]);
  assert.throws(() => inspectManagedSymbolPins({ ...item, documentSource: duplicate }, 0, 1), /duplicate/u);
  const otherPart = jsonSource([["PART", "part-B", {}], ["PIN", "pin-A", 1, null, 1, 2, 3, 0, null, 0, 0],
    ["ATTR", "number-B", "pin-A", "NUMBER", "2", 0, 1, null, null, 0, null, 0]]);
  const output = inspectManagedSymbolPins({ ...item, documentSource: otherPart }, 1, 1); const pins = output["pins"]; assert.ok(Array.isArray(pins));
  assert.equal(record(pins[0])["number"], "2"); assert.equal(record(pins[0])["partId"], "part-B");
  assert.equal(output["completePinsReturned"], false); assert.equal(output["endOfPins"], true);
});

void test("JSON-line repeated part, pin and attribute identities cannot be projected as clean independent rows", () => {
  const item = collectManagedStandaloneSymbolSource("Fixture.esym", Buffer.from(jsonSource())).sources[0]; assert.ok(item);
  for (const extra of [[["PART", "part-A", {}]], [["ATTR", "number-A", "pin-A", "NAME", "overwritten", 0, 1]],
    [["ATTR", "pin-A", "pin-A", "NUMBER", "same-as-pin", 0, 1]]] as const) {
    const source = jsonSource(extra);
    assert.throws(() => inspectManagedSymbolPins({ ...item, documentSource: source }, 0, 1), /duplicate/u);
    assert.equal(pageManagedSymbolSource({ ...item, documentSource: source, utf16CodeUnits: source.length }, 0, 4096)["documentSource"], source);
  }
  const other = jsonSource([["PART", "part-B", {}], ["PIN", "pin-A", 1, null, 1, 2, 3, 0, null, 0, 0],
    ["ATTR", "number-A", "pin-A", "NUMBER", "2", 0, 1]]);
  const output = inspectManagedSymbolPins({ ...item, documentSource: other }, 0, 16);
  assert.equal(output["totalPins"], 2); assert.equal(output["completePinsReturned"], true);
});

void test("all symbol actions have strict descriptors, digests and separately bounded selectors", () => {
  const file = { schema: "easyeda-pro-control.library-file.v1", name: "Fixture.esym", path: "/not-opened", bytes: 100, sha256: "a".repeat(64) };
  const pin = { action: "inspect-symbol-pins", file, expectedSourceSetSha256: "b".repeat(64), symbolId: "c".repeat(64) };
  assert.equal(validateManagedLibraryFilesArguments(pin)["valid"], true);
  for (const bad of [{ ...pin, length: 17 }, { ...pin, offset: -1 }, { ...pin, symbolId: "INVALID" },
    { ...pin, file: { ...file, name: "Unsupported.efoo" } }, { ...pin, externalSource: "/external" }]) {
    assert.equal(validateManagedLibraryFilesArguments(bad)["valid"], false);
  }
});

void test("the real offline managed dispatcher publishes symbol indexes and retains exact input on every page", async () => {
  const bytes = Buffer.from(jsonSource());
  const prepared = await executeManagedLibraryFiles({ action: "prepare-file", name: "Fixture.esym", base64: bytes.toString("base64"), confirmLocalArtifact: true });
  const file = managedLibraryFileSchema.parse(prepared["file"]); const extracted = await executeManagedLibraryFiles({ action: "extract-symbol-sources", file });
  assert.equal(extracted["symbolCount"], 1); assert.equal(extracted["offline"], true); assert.equal(extracted["installedRuntimeAdmission"], false);
  const index = record(extracted["index"]); const indexBytes = await readFile(String(index["path"])); assert.equal(hash(indexBytes), extracted["sourceSetSha256"]);
  const bound = { file, expectedSourceSetSha256: extracted["sourceSetSha256"] };
  const roster = await executeManagedLibraryFiles({ action: "list-symbol-sources", ...bound }); const entries = roster["sources"]; assert.ok(Array.isArray(entries));
  const symbolId = record(entries[0])["symbolId"];
  const raw = await executeManagedLibraryFiles({ action: "read-symbol-source", ...bound, symbolId }); assert.equal(raw["documentSource"], bytes.toString("utf8"));
  const pins = await executeManagedLibraryFiles({ action: "inspect-symbol-pins", ...bound, symbolId }); assert.equal(pins["totalPins"], 1);
  assert.equal(pins["symbolPinRecordFramingValidated"], true); assert.equal(pins["cadFramingValidated"], false); assert.equal(pins["localArtifactWritten"], false);
  await assert.rejects(executeManagedLibraryFiles({ action: "read-symbol-source", ...bound, symbolId, expectedSourceSetSha256: "0".repeat(64) }), /digest/u);
  await assert.rejects(executeManagedLibraryFiles({ action: "inspect-symbol-pins", ...bound, symbolId: SYMBOL_ID }), /absent/u);
  await assert.rejects(executeManagedLibraryFiles({ action: "inspect-symbol-pins", ...bound, symbolId, file: { ...file, path: "/external.esym" } }), /prepared directory/u);
  await writeFile(file.path, Buffer.from(jsonSource().replace("Passive", "Changed")));
  await assert.rejects(executeManagedLibraryFiles({ action: "inspect-symbol-pins", ...bound, symbolId }), /SHA-256|byte/u);
});

void test("supplied project symbol bodies use the same dispatcher without requiring an editor or SDK", async () => {
  const bytes = managedProjectFootprintArchive([MANIFEST, { name: `SYMBOL/${SYMBOL_ID}.esym`, content: nativeSource() },
    { name: "unknown.member", content: "CRC checked peer" }]);
  const prepared = await executeManagedLibraryFiles({ action: "prepare-file", name: "Fixture.epro2", base64: bytes.toString("base64"), confirmLocalArtifact: true });
  const file = managedLibraryFileSchema.parse(prepared["file"]); const extracted = await executeManagedLibraryFiles({ action: "extract-symbol-sources", file });
  const output = await executeManagedLibraryFiles({ action: "inspect-symbol-pins", file, expectedSourceSetSha256: extracted["sourceSetSha256"], symbolId: SYMBOL_ID });
  assert.equal(output["totalPins"], 1); assert.equal(output["inputMembers"], undefined); assert.equal(output["publicSdkMethodExecuted"], false);
  assert.equal(output["executionAuthorized"], false); assert.equal(output["pinToPadMappingVerified"], false);
});
