import assert from "node:assert/strict";
import { createCipheriv, createHash } from "node:crypto";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { gzipSync } from "node:zlib";
import {
  decodeNativeHistoryChunk,
  isNativeDocumentDeleted,
  materializeNativeHistory,
  readNativeHistoryCheckpoint,
} from "../src/native-history.ts";

const PROJECT = "11".repeat(32);
const BRANCH = "22".repeat(16);
const HISTORY = "33".repeat(16);
const SECOND_HISTORY = "44".repeat(16);
// Synthetic fixture key, never a runtime credential.
const KEY = "55".repeat(16);
const DOCUMENT = "66".repeat(16);

function encrypt(content: string | Buffer, historyUuid = HISTORY): string {
  const cipher = createCipheriv("aes-128-gcm", Buffer.from(KEY, "hex"), Buffer.from(historyUuid, "hex"));
  // oxlint-disable-next-line node/no-sync -- Bounded synthetic input is compressed synchronously before encryption.
  const compressed = gzipSync(content);
  const data = Buffer.concat([cipher.update(compressed), cipher.final(), cipher.getAuthTag()]);
  return data.toString("base64");
}

function line(type: string, body: unknown, id?: string, ticket?: number): string {
  return `${JSON.stringify({ type, ...(id === undefined ? {} : { id }), ...(ticket === undefined ? {} : { ticket }) })}||${body === null ? "" : JSON.stringify(body)}|\n`;
}

function head(ticket = 1, documentUuid = DOCUMENT): string {
  return line("DOCHEAD", { uuid: documentUuid, docType: "PCB", client: "fixture-client" }, undefined, ticket);
}

function recordLimitChunk(records: number): string {
  assert.ok(Number.isSafeInteger(records) && records >= 2);
  const chunk = head() + line("EDIT_HEAD", {}).repeat(records - 2) + line("COMPONENT", { x: 1 }, "c1", 1);
  assert.ok(Buffer.byteLength(chunk) < 32 * 1024 * 1024, "Record-limit fixture must not hit the byte limit first");
  return chunk;
}

function byteLimitChunk(bytes: number): string {
  const source = head() + line("COMPONENT", { x: 1 }, "c1", 1);
  assert.ok(Number.isSafeInteger(bytes) && bytes >= Buffer.byteLength(source) && bytes <= 32 * 1024 * 1024);
  // Valid JSON whitespace grows plaintext without constructing a large object graph.
  const chunk = `${source.slice(0, -2)}${" ".repeat(bytes - Buffer.byteLength(source))}|\n`;
  assert.equal(Buffer.byteLength(chunk), bytes);
  return chunk;
}

async function fixture(t: TestContext, options: { snapshot?: string; cycle?: boolean; missingChunk?: boolean; repeatedFirstChunk?: { plaintext: string; count: number } } = {}): Promise<{ checkpointPath: string; expectedSha256: string; projectUuid: string }> {
  const directory = await mkdtemp(join(tmpdir(), "easyeda-native-history-test-"));
  t.after(async () => { await rm(directory, { recursive: true, force: true }); });
  const checkpointPath = join(directory, "fixture.eprj2");
  const database = new DatabaseSync(checkpointPath);
  database.exec(`
    CREATE TABLE projects(uuid TEXT PRIMARY KEY, branch_uuid TEXT, owner_uuid TEXT);
    CREATE TABLE branches(uuid TEXT PRIMARY KEY, project_uuid TEXT, history_uuid TEXT);
    CREATE TABLE project_history_${BRANCH}(uuid TEXT PRIMARY KEY, parent TEXT, snapshot TEXT, key TEXT, num INTEGER, snapshot_num INTEGER);
    CREATE TABLE history_data(uuid TEXT PRIMARY KEY, history_uuid TEXT, dataStr TEXT);
  `);
  database.prepare("INSERT INTO projects VALUES(?,?,?)").run(PROJECT, BRANCH, "d".repeat(32));
  database.prepare("INSERT INTO branches VALUES(?,?,?)").run(BRANCH, PROJECT, SECOND_HISTORY);
  const insert = database.prepare(`INSERT INTO project_history_${BRANCH} VALUES(?,?,?,?,?,?)`);
  const firstChunkCount = options.repeatedFirstChunk?.count ?? 1;
  assert.ok(Number.isSafeInteger(firstChunkCount) && firstChunkCount >= 1 && firstChunkCount <= 1025);
  insert.run(HISTORY, options.cycle === true ? SECOND_HISTORY : null, options.snapshot ?? null, KEY, firstChunkCount - 1, 0);
  insert.run(SECOND_HISTORY, HISTORY, null, KEY, options.missingChunk === true ? 1 : 0, 0);
  const data = database.prepare("INSERT INTO history_data VALUES(?,?,?)");
  const firstData = encrypt(options.repeatedFirstChunk?.plaintext ?? head() + line("COMPONENT", { x: 1, y: 2, attrs: { Device: "fixture" } }, "c1", 1));
  for (let index = 0; index < firstChunkCount; index += 1) {
    data.run(index === 0 ? HISTORY : `${HISTORY}-${String(index)}`, HISTORY, firstData);
  }
  data.run(SECOND_HISTORY, SECOND_HISTORY, encrypt(head(2) + line("COMPONENT", { x: 3, y: 2, attrs: { Device: "fixture" } }, "c1", 2), SECOND_HISTORY));
  database.close();
  const expectedSha256 = createHash("sha256").update(await readFile(checkpointPath)).digest("hex");
  return { checkpointPath, expectedSha256, projectUuid: PROJECT };
}

void test("authenticates and decodes native GCM plus gzip", async () => {
  const source = head() + line("COMPONENT", { x: 1, label: "contains || framing" }, "c1", 1);
  assert.equal(await decodeNativeHistoryChunk({ historyUuid: HISTORY, keyHex: KEY, dataBase64: encrypt(source) }), source);
});

void test("closed-container raw occurrence evidence comes only from an authenticated immutable checkpoint opt-in", async (t) => {
  const input = await fixture(t), plain = await readNativeHistoryCheckpoint(input);
  const observed = await readNativeHistoryCheckpoint({ ...input, documentRecordHistory: "preserve" });
  assert.ok(plain.documents.every((document) => document.documentRecordHistory === undefined));
  assert.equal(observed.semanticSha256, plain.semanticSha256);
  const value = observed.documents[0]?.documentRecordHistory; assert.ok(value);
  assert.equal(value.checkpointSha256, input.expectedSha256); assert.equal(value.documentUuid, DOCUMENT);
  assert.equal(value.recordCount, 4); assert.equal(value.maximumTicket, 2);
  await assert.rejects(readNativeHistoryCheckpoint({ ...input, expectedSha256: "0".repeat(64), documentRecordHistory: "preserve" }), /checkpoint-hash/u);
});

void test("rejects wrong UUID, key, tag and noncanonical base64 without exposing input", async () => {
  const data = encrypt(head());
  const tampered = Buffer.from(data, "base64");
  tampered[0] = (tampered[0] ?? 0) + 1;
  for (const input of [
    { historyUuid: "invalid", keyHex: KEY, dataBase64: data },
    { historyUuid: HISTORY, keyHex: "77".repeat(16), dataBase64: data },
    { historyUuid: HISTORY, keyHex: KEY, dataBase64: tampered.toString("base64") },
    { historyUuid: HISTORY, keyHex: KEY, dataBase64: `${data}\n` },
  ]) {
    await assert.rejects(decodeNativeHistoryChunk(input), (error: unknown) => error instanceof Error && /^Unsupported, malformed, unstable or unauthenticated native history \((?:record-invalid|chunk-decode|chunk-encoding)\)\.$/u.test(error.message));
  }
});

void test("rejects invalid UTF-8 and oversized gzip output", async () => {
  const invalid = encrypt(Buffer.from([255]));
  const oversized = encrypt(Buffer.alloc(32 * 1024 * 1024 + 1));
  await assert.rejects(decodeNativeHistoryChunk({ historyUuid: HISTORY, keyHex: KEY, dataBase64: invalid }));
  await assert.rejects(decodeNativeHistoryChunk({ historyUuid: HISTORY, keyHex: KEY, dataBase64: oversized }));
});

void test("materializes replacement, ordering and tombstones without merging fields", () => {
  const source = head() + line("COMPONENT", { x: 1, removed: true }, "c1", 1) + line("LINE", { width: 1 }, "l1", 1);
  const next = head(3) + line("COMPONENT", { x: 3 }, "c1", 3) + line("LINE", null, "l1", 3);
  const stale = head(2) + line("COMPONENT", { x: 2 }, "c1", 2) + line("LINE", { width: 2 }, "l1", 2);
  const result = materializeNativeHistory([source, next, stale]);
  assert.equal(result.length, 1);
  assert.equal(result[0]?.records.length, 1);
  assert.deepEqual(result[0]?.records[0]?.body, { x: 3 });
});

void test("byte limits accept exactly 256 MiB of cumulative plaintext", () => {
  const chunk = byteLimitChunk(32 * 1024 * 1024);
  const chunks = Array.from({ length: 8 }, () => chunk);
  assert.equal(chunks.reduce((bytes, value) => bytes + Buffer.byteLength(value), 0), 256 * 1024 * 1024);
  const result = materializeNativeHistory(chunks);
  assert.equal(result.length, 1);
  assert.equal(result[0]?.records.length, 1);
  assert.deepEqual(result[0]?.records[0]?.body, { x: 1 });
});

void test("byte limits reject cumulative plaintext above 256 MiB", () => {
  const chunk = byteLimitChunk(32 * 1024 * 1024);
  const chunks = [...Array.from({ length: 8 }, () => chunk), head()];
  assert.throws(() => materializeNativeHistory(chunks), /native history \(total-bytes-limit\)\./u);
});

void test("byte limits accept authenticated checkpoint plaintext above 128 MiB", async (t) => {
  const input = await fixture(t, { repeatedFirstChunk: { plaintext: byteLimitChunk(32 * 1024 * 1024), count: 4 } });
  const checkpointBytes = await readFile(input.checkpointPath);
  assert.ok(checkpointBytes.byteLength < 1024 * 1024, "Compressed fixture must stay small");
  const result = await readNativeHistoryCheckpoint(input);
  assert.ok(result.plaintextBytes > 128 * 1024 * 1024 && result.plaintextBytes < 256 * 1024 * 1024);
  assert.equal(result.historyRowCount, 2);
  assert.equal(result.chunkCount, 5);
  assert.equal(result.documents.length, 1);
  assert.deepEqual(result.documents[0]?.records[0]?.body, { x: 3, y: 2, attrs: { Device: "fixture" } });
});

void test("byte limits reject authenticated checkpoint plaintext above 256 MiB", async (t) => {
  const input = await fixture(t, { repeatedFirstChunk: { plaintext: byteLimitChunk(32 * 1024 * 1024), count: 8 } });
  const checkpointBytes = await readFile(input.checkpointPath);
  assert.ok(checkpointBytes.byteLength < 1024 * 1024, "Compressed fixture must stay small");
  await assert.rejects(readNativeHistoryCheckpoint(input), /native history \(total-bytes-limit\)\./u);
});

void test("record limits accept exactly one million cumulative records across bounded chunks", () => {
  const chunk = recordLimitChunk(250_000);
  const chunks = [chunk, chunk, chunk, chunk];
  assert.ok(chunks.reduce((bytes, value) => bytes + Buffer.byteLength(value), 0) < 128 * 1024 * 1024);
  const result = materializeNativeHistory(chunks);
  assert.equal(result.length, 1);
  assert.equal(result[0]?.records.length, 1);
  assert.deepEqual(result[0]?.records[0]?.body, { x: 1 });
});

void test("record limits reject cumulative records above one million before materialization completes", () => {
  const chunk = recordLimitChunk(250_000);
  const chunks = [chunk, chunk, chunk, chunk, head()];
  assert.ok(chunks.reduce((bytes, value) => bytes + Buffer.byteLength(value), 0) < 128 * 1024 * 1024);
  assert.throws(() => materializeNativeHistory(chunks), /native history \(total-records-limit\)\./u);
});

void test("record limits still reject a single chunk above 250000 records", () => {
  const chunk = recordLimitChunk(250_001);
  assert.throws(() => materializeNativeHistory([chunk]), /native history \(record-invalid\)\./u);
});

void test("semantic hash excludes record tickets but includes every body field", () => {
  const first = materializeNativeHistory([head() + line("COMPONENT", { x: 1 }, "c1", 1)]);
  const reticketed = materializeNativeHistory([head(2) + line("COMPONENT", { x: 1 }, "c1", 2)]);
  const changed = materializeNativeHistory([head(2) + line("COMPONENT", { x: 2 }, "c1", 2)]);
  assert.equal(first[0]?.semanticSha256, reticketed[0]?.semanticSha256);
  assert.notEqual(first[0]?.semanticSha256, changed[0]?.semanticSha256);
});

void test("native record ordering breaks equal tickets by client and preserves same-clock conflict refusal", () => {
  const low = line("DOCHEAD", { uuid: DOCUMENT, docType: "PCB", client: "a" }, undefined, 1) + line("COMPONENT", { x: 1 }, "c1", 4);
  const high = line("DOCHEAD", { uuid: DOCUMENT, docType: "PCB", client: "z" }, undefined, 2) + line("COMPONENT", { x: 2 }, "c1", 4);
  const result = materializeNativeHistory([low, high, low]);
  assert.equal(result[0]?.records[0]?.body["x"], 2);
  assert.equal(result[0]?.records[0]?.client, "z");
  const conflicting = line("DOCHEAD", { uuid: DOCUMENT, docType: "PCB", client: "z" }, undefined, 3) + line("COMPONENT", { x: 3 }, "c1", 4);
  assert.throws(() => materializeNativeHistory([low, high, conflicting]), /record-ticket-conflict/u);
});

void test("schematic attribute first clocks retain exact insertion order without changing semantic hashes", () => {
  const schHead = (ticket: number, client = "fixture-client"): string => line("DOCHEAD", { uuid: DOCUMENT, docType: "SCH_PAGE", client }, undefined, ticket);
  const device = { key: "Device", value: "device-id" };
  const relevance = { key: "Relevance", value: null };
  const original = schHead(1) + line("ATTR", device, "device", 7) + line("ATTR", relevance, "relevance", 8);
  const refreshed = schHead(2) + line("ATTR", device, "device", 90);
  const result = materializeNativeHistory([refreshed, original])[0];
  assert.ok(result);
  assert.deepEqual(result.records.find((entry) => entry.id === "device"), { id: "device", type: "ATTR", ticket: 90, client: "fixture-client", firstTicket: 7, firstClient: "fixture-client", body: device });
  assert.equal(result.records.find((entry) => entry.id === "relevance")?.firstTicket, 8);
  const changedFirstClock = materializeNativeHistory([schHead(1) + line("ATTR", device, "device", 6) + line("ATTR", relevance, "relevance", 8), refreshed])[0];
  assert.equal(result.semanticSha256, changedFirstClock?.semanticSha256);
  assert.equal(result.semanticSha256, materializeNativeHistory([schHead(2) + line("ATTR", device, "device", 90) + line("ATTR", relevance, "relevance", 8)])[0]?.semanticSha256);
  assert.notEqual(result.semanticSha256, materializeNativeHistory([refreshed + line("ATTR", { ...relevance, value: "changed" }, "relevance", 91)])[0]?.semanticSha256);

  const deleted = schHead(3) + line("STRING", null, "device", 91);
  const restored = schHead(4) + line("ATTR", device, "device", 92);
  assert.equal(materializeNativeHistory([original, refreshed, deleted, restored])[0]?.records.find((entry) => entry.id === "device")?.firstTicket, 7);
  const highClient = schHead(5, "z") + line("ATTR", device, "device", 7);
  const lowClient = schHead(6, "a") + line("ATTR", device, "device", 7);
  const tied = materializeNativeHistory([highClient, lowClient])[0]?.records[0];
  assert.equal(tied?.client, "z");
  assert.equal(tied?.firstTicket, 7);
  assert.equal(tied?.firstClient, "a");
  const zero = materializeNativeHistory([schHead(1) + line("ATTR", device, "device", 0), refreshed])[0]?.records[0];
  assert.equal(zero?.firstTicket, 0);
  assert.equal(zero?.ticket, 90);
  // Native firstTicket || ticket applies to the head, not the latest record.
  const missingClient = line("DOCHEAD", { uuid: DOCUMENT, docType: "SCH_PAGE" }, undefined, 0) + line("ATTR", device, "device", 7);
  const ambiguous = materializeNativeHistory([refreshed, original, missingClient])[0]?.records.find((entry) => entry.id === "device");
  assert.ok(ambiguous);
  assert.equal(Object.hasOwn(ambiguous, "firstTicket"), false);
  assert.equal(Object.hasOwn(ambiguous, "firstClient"), false);
  assert.equal(ambiguous.ticket, 90);
  assert.throws(() => materializeNativeHistory([original, schHead(2) + line("ATTR", { ...device, value: "conflict" }, "device", 7)]), /record-ticket-conflict/u);
  const pcb = materializeNativeHistory([head() + line("ATTR", device, "device", 7)])[0]?.records[0];
  assert.ok(pcb);
  assert.equal(Object.hasOwn(pcb, "firstTicket"), false);
  assert.equal(Object.hasOwn(pcb, "firstClient"), false);
});

void test("native tombstones delete by ID across text types without admitting conflicting nonempty replacements", () => {
  const original = head() + line("ATTR", { key: "Name", value: "part" }, "text-id", 1);
  const deleted = head(2) + line("STRING", null, "text-id", 2);
  const restored = head(3) + line("ATTR", { key: "Name", value: "restored" }, "text-id", 3);
  assert.equal(materializeNativeHistory([original, deleted])[0]?.records.length, 0);
  const result = materializeNativeHistory([original, deleted, restored, deleted]);
  assert.equal(result[0]?.records[0]?.type, "ATTR");
  assert.equal(result[0]?.records[0]?.body["value"], "restored");
  assert.throws(() => materializeNativeHistory([original, head(2) + line("STRING", { text: "changed" }, "text-id", 2)]), /record-type-conflict/u);
});

void test("semantic hash includes all document metadata", () => {
  const original = materializeNativeHistory([head() + line("COMPONENT", { x: 1 }, "c1", 1)]);
  const alteredHead = line("DOCHEAD", { uuid: DOCUMENT, docType: "PCB", client: "fixture-client", title: "Unexpected rename", configuration: { enabled: false } }, undefined, 2);
  const changed = materializeNativeHistory([alteredHead + line("COMPONENT", { x: 1 }, "c1", 1)]);
  assert.notEqual(original[0]?.semanticSha256, changed[0]?.semanticSha256);
});

void test("native document deletion and restoration retain hidden records in complete durable evidence", () => {
  const original = head() + line("COMPONENT", { x: 1 }, "c1", 1);
  const deleted = head(2) + line("DELETE_DOC", { isDelete: true }, "DELETE_DOC", 2);
  const restored = head(3) + line("DELETE_DOC", { isDelete: false }, "DELETE_DOC", 3);
  const before = materializeNativeHistory([original])[0];
  const hidden = materializeNativeHistory([original, deleted])[0];
  const visible = materializeNativeHistory([original, deleted, restored, deleted])[0];
  assert.ok(before && hidden && visible);
  assert.equal(isNativeDocumentDeleted(before), false);
  assert.equal(isNativeDocumentDeleted(hidden), true);
  assert.equal(isNativeDocumentDeleted(visible), false);
  assert.deepEqual(hidden.records.find((entry) => entry.id === "c1")?.body, { x: 1 });
  assert.deepEqual(visible.records.find((entry) => entry.id === "c1")?.body, { x: 1 });
  assert.notEqual(hidden.semanticSha256, visible.semanticSha256);
  assert.throws(() => materializeNativeHistory([original, head(2) + line("DELETE_DOC", { isDelete: false }, "DELETE_DOC", 2), deleted]), /record-ticket-conflict/u);
  for (const [id, body] of [["wrong", { isDelete: true }], ["DELETE_DOC", {}], ["DELETE_DOC", { isDelete: "true" }], ["DELETE_DOC", { isDelete: true, dropped: true }], ["DELETE_DOC", null]] as const) {
    assert.throws(() => materializeNativeHistory([original, head(2) + line("DELETE_DOC", body, id, 2)]), /delete-document/u);
  }
});

void test("isolates matching object IDs in different documents", () => {
  const result = materializeNativeHistory([head() + line("COMPONENT", { x: 1 }, "c1", 1) + head(1, "77".repeat(16)) + line("COMPONENT", { x: 2 }, "c1", 1)]);
  assert.equal(result.length, 2);
  assert.notEqual(result[0]?.semanticSha256, result[1]?.semanticSha256);
});

void test("rejects context-free, malformed, unsafe and conflicting records", () => {
  const component = line("COMPONENT", { x: 1 }, "c1", 1);
  for (const source of [
    component,
    `${head()}garbage`,
    head() + component + line("COMPONENT", { x: 2 }, "c1", 1),
    head() + component + line("LINE", { x: 2 }, "c1", 2),
    head() + line("DELETE_DOC", { deleted: true }, "deleted", 2),
    `${head()}{"type":"COMPONENT","id":"c1","ticket":1,"pend":true}||{}|\n`,
    `${head()}{"type":"COMPONENT","id":"c1","ticket":1}||{"__proto__":{}}|\n`,
    `${head()}{"type":"COMPONENT","id":"c1","ticket":1}||{"x":1e999}|\n`,
    `${head()}{"type":"COMPONENT","id":"c1","ticket":1}||{"x":1,"\\u0078":2}|\n`,
    `${head()}{"type":"LINE","type":"COMPONENT","id":"c1","ticket":1}||{}|\n`,
  ]) {assert.throws(() => materializeNativeHistory([source]));}
});

void test("requires each independent chunk to establish its document", () => {
  assert.throws(() => materializeNativeHistory([head(), line("COMPONENT", { x: 1 }, "c1", 1)]));
});

void test("reads a hash-bound linear native checkpoint and leaves its bytes unchanged", async (t) => {
  const input = await fixture(t);
  const result = await readNativeHistoryCheckpoint(input);
  assert.equal(result.historyRowCount, 2);
  assert.equal(result.chunkCount, 2);
  assert.equal(result.documents[0]?.records[0]?.body["x"], 3);
  assert.equal(createHash("sha256").update(await readFile(input.checkpointPath)).digest("hex"), input.expectedSha256);
  assert.ok(!JSON.stringify(result).includes(KEY));
});

void test("rejects hash mismatch and wrong project identity", async (t) => {
  const input = await fixture(t);
  await assert.rejects(readNativeHistoryCheckpoint({ ...input, expectedSha256: "00".repeat(32) }));
  await assert.rejects(readNativeHistoryCheckpoint({ ...input, projectUuid: "00".repeat(16) }));
});

void test("rejects snapshots, cycles and missing chunks", async (t) => {
  for (const options of [{ snapshot: "fixture-snapshot" }, { cycle: true }, { missingChunk: true }]) {
    await assert.rejects(readNativeHistoryCheckpoint(await fixture(t, options)));
  }
});

void test("rejects symlinks and checkpoint sidecars", async (t) => {
  const input = await fixture(t);
  const symbolicPath = `${input.checkpointPath}.link.eprj2`;
  await symlink(input.checkpointPath, symbolicPath);
  await assert.rejects(readNativeHistoryCheckpoint({ ...input, checkpointPath: symbolicPath }));
  await writeFile(`${input.checkpointPath}-wal`, "fixture-sidecar");
  await assert.rejects(readNativeHistoryCheckpoint(input));
});
