import assert from "node:assert/strict";
import { createCipheriv, createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { gzipSync } from "node:zlib";
import { createNativeAtomHeaderHistorySteps, verifyGeneratedNativeAtomHeaderHistory, verifyNativeAtomHeaderHistory } from "../src/native-atom-header-history.ts";
import {
  isNativeDocumentDeleted, materializeNativeHistory, materializeNativeHistoryCooperatively, readNativeHistoryCheckpoint,
} from "../src/native-history.ts";

const HASH = "a".repeat(64);
const DOCUMENT = "66".repeat(16);
const PROJECT = "11".repeat(32);
const BRANCH = "22".repeat(16);
const HISTORY = "33".repeat(16);
const OPTIONS = { libraryAtomHeaders: "preserve" } as const;

function line(header: Readonly<Record<string, unknown>>, body: unknown): string {
  return `${JSON.stringify(header)}||${body === null ? "" : JSON.stringify(body)}|\n`;
}
function head(docType = "SYMBOL", ticket = 1, uuid = DOCUMENT, client: string | undefined = "fixture-client"): string {
  return line({ type: "DOCHEAD", ticket }, { uuid, docType, ...(client === undefined ? {} : { client }) });
}
function atom(type: string, id: string, ticket: number, body: unknown, firstTicket?: number): string {
  return line({ type, id, ticket, ...(firstTicket === undefined ? {} : { firstTicket }) }, body);
}
function imported(docType = "SYMBOL"): string {
  return head(docType) + atom("META", "META", 1, { title: "Synthetic import" })
    + atom("CANVAS", "canvas", 459, { x: 0, y: 0 }, 2)
    + atom("PIN", "pin", 459, { number: "1" }, 6)
    + atom("ATTR", "attr", 459, { key: "Name", value: "X" }, 0)
    + atom("LINE", "deleted", 456, null, 454);
}

async function checkpoint(t: TestContext, chunks: readonly string[]): Promise<{ checkpointPath: string; expectedSha256: string; projectUuid: string }> {
  const directory = await mkdtemp(join(tmpdir(), "native-first-ticket-"));
  t.after(async () => { await rm(directory, { recursive: true, force: true }); });
  const checkpointPath = join(directory, "fixture.eprj2");
  // Synthetic fixture key, never a runtime credential.
  const key = "55".repeat(16);
  const database = new DatabaseSync(checkpointPath);
  try {
    database.exec(`
      CREATE TABLE projects(uuid TEXT PRIMARY KEY, branch_uuid TEXT, owner_uuid TEXT);
      CREATE TABLE branches(uuid TEXT PRIMARY KEY, project_uuid TEXT, history_uuid TEXT);
      CREATE TABLE project_history_${BRANCH}(uuid TEXT PRIMARY KEY, parent TEXT, snapshot TEXT, key TEXT, num INTEGER, snapshot_num INTEGER);
      CREATE TABLE history_data(uuid TEXT PRIMARY KEY, history_uuid TEXT, dataStr TEXT);
    `);
    database.prepare("INSERT INTO projects VALUES(?,?,?)").run(PROJECT, BRANCH, "44".repeat(16));
    database.prepare("INSERT INTO branches VALUES(?,?,?)").run(BRANCH, PROJECT, HISTORY);
    database.prepare(`INSERT INTO project_history_${BRANCH} VALUES(?,?,?,?,?,?)`).run(HISTORY, null, null, key, chunks.length - 1, 0);
    const insert = database.prepare("INSERT INTO history_data VALUES(?,?,?)");
    for (const [index, plaintext] of chunks.entries()) {
      const cipher = createCipheriv("aes-128-gcm", Buffer.from(key, "hex"), Buffer.from(HISTORY, "hex"));
      // oxlint-disable-next-line node/no-sync -- Bounded synthetic records are compressed before testing the readonly checkpoint reader.
      const compressed = gzipSync(plaintext);
      const encrypted = Buffer.concat([cipher.update(compressed), cipher.final(), cipher.getAuthTag()]);
      insert.run(index === 0 ? HISTORY : `${HISTORY}-${index}`, HISTORY, encrypted.toString("base64"));
    }
  } finally { database.close(); }
  return { checkpointPath, expectedSha256: createHash("sha256").update(await readFile(checkpointPath)).digest("hex"), projectUuid: PROJECT };
}

void test("library import preserves all occurrences, absent versus zero, exact header bytes and tombstones", () => {
  const source = imported();
  const snapshot = materializeNativeHistory([source], HASH, OPTIONS)[0];
  assert.ok(snapshot?.atomHeaderHistory);
  const evidence = snapshot.atomHeaderHistory;
  assert.equal(snapshot.records.length, 4);
  assert.equal(snapshot.records.some(({ id }) => id === "deleted"), false);
  assert.equal(snapshot.records.some((entry) => Object.hasOwn(entry, "firstTicket")), false);
  assert.equal(evidence.occurrences.length, 5);
  assert.equal(Object.hasOwn(evidence.occurrences[0] ?? {}, "serializedFirstTicket"), false);
  assert.equal(evidence.occurrences[3]?.serializedFirstTicket, 0);
  assert.deepEqual(evidence.occurrences[4], {
    chunkIndex: 0, recordIndex: 5, id: "deleted", type: "LINE", ticket: 456, client: "fixture-client",
    clientSource: "inherited", serializedFirstTicket: 454,
    headerSha256: createHash("sha256").update(JSON.stringify({ type: "LINE", id: "deleted", ticket: 456, firstTicket: 454 })).digest("hex"),
    bodySha256: null, bodyEncodingSha256: null, tombstone: true,
  });
  assert.deepEqual(verifyNativeAtomHeaderHistory(evidence, { checkpointSha256: HASH, documentUuid: DOCUMENT, docType: "SYMBOL" }), evidence);
});

void test("physical clocks choose latest whole body without inferring head clocks from smaller imported values", () => {
  const chunks = [head() + atom("ATTR", "a", 100, { kept: "head" }),
    head("SYMBOL", 2) + atom("ATTR", "a", 459, { kept: "latest" }, 6),
    head("SYMBOL", 3) + atom("ATTR", "a", 200, { removed: "stale" }, 1)];
  const snapshot = materializeNativeHistory(chunks, HASH, OPTIONS)[0];
  assert.deepEqual(snapshot?.records, [{ id: "a", type: "ATTR", ticket: 459, client: "fixture-client", body: { kept: "latest" } }]);
  assert.deepEqual(snapshot.atomHeaderHistory?.occurrences.map((entry) => entry.serializedFirstTicket), [undefined, 6, 1]);
  assert.equal(Object.hasOwn(snapshot.records[0] ?? {}, "firstClient"), false);
});

void test("tombstones suppress stale creates and retain provenance after cross-type restore and document deletion", () => {
  const chunks = [head("FOOTPRINT") + atom("LINE", "line", 456, null, 454),
    head("FOOTPRINT", 2) + atom("LINE", "line", 454, { x: 1 }),
    head("FOOTPRINT", 3) + atom("LINE", "line", 500, { x: 2 }),
    head("FOOTPRINT", 4) + atom("STRING", "line", 501, null, 454),
    head("FOOTPRINT", 5) + atom("LINE", "line", 502, { x: 3 }) + atom("DELETE_DOC", "DELETE_DOC", 503, { isDelete: true })];
  const deleted = materializeNativeHistory(chunks.slice(0, 2), HASH, OPTIONS)[0];
  assert.deepEqual(deleted?.records, []);
  const restored = materializeNativeHistory(chunks, HASH, OPTIONS)[0];
  assert.ok(restored?.atomHeaderHistory);
  assert.equal(restored.records.find(({ id }) => id === "line")?.body["x"], 3);
  assert.equal(isNativeDocumentDeleted(restored), true);
  assert.equal(restored.atomHeaderHistory.occurrences.length, 6);
  assert.equal(restored.atomHeaderHistory.occurrences.filter(({ tombstone }) => tombstone).length, 2);
});

void test("header-only provenance changes leave semantic records and hashes unchanged", () => {
  const original = imported();
  const changed = original.replace('"firstTicket":6', '"firstTicket":5');
  const before = materializeNativeHistory([original], HASH, OPTIONS)[0];
  const after = materializeNativeHistory([changed], HASH, OPTIONS)[0];
  assert.ok(before?.atomHeaderHistory && after?.atomHeaderHistory);
  assert.equal(before.semanticSha256, after.semanticSha256);
  assert.deepEqual(before.records, after.records);
  assert.notEqual(before.atomHeaderHistory.sha256, after.atomHeaderHistory.sha256);
  assert.notEqual(before.atomHeaderHistory.occurrencesSha256, after.atomHeaderHistory.occurrencesSha256);
  const retargeted = materializeNativeHistory([original], "b".repeat(64), OPTIONS)[0]?.atomHeaderHistory;
  assert.equal(before.atomHeaderHistory.occurrencesSha256, retargeted?.occurrencesSha256);
  assert.notEqual(before.atomHeaderHistory.sha256, retargeted?.sha256);
});

void test("raw body encoding is retained separately from canonical body content", () => {
  const source = head() + atom("PIN", "pin", 459, { x: 1, y: 2 }, 6);
  const respaced = source.replace('||{"x":1,"y":2}', '||{ "y": 2, "x": 1 }');
  const before = materializeNativeHistory([source], HASH, OPTIONS)[0];
  const after = materializeNativeHistory([respaced], HASH, OPTIONS)[0];
  assert.ok(before?.atomHeaderHistory && after?.atomHeaderHistory);
  const original = before.atomHeaderHistory.occurrences[0];
  const changed = after.atomHeaderHistory.occurrences[0];
  assert.equal(before.semanticSha256, after.semanticSha256);
  assert.equal(original?.bodySha256, changed?.bodySha256);
  assert.notEqual(original?.bodyEncodingSha256, changed?.bodyEncodingSha256);
  assert.equal(changed?.bodyEncodingSha256, createHash("sha256").update('{ "y": 2, "x": 1 }').digest("hex"));
  assert.notEqual(before.atomHeaderHistory.sha256, after.atomHeaderHistory.sha256);
});

void test("provenance rejects missing, truncated, reordered, altered and transplanted evidence", () => {
  const evidence = materializeNativeHistory([imported()], HASH, OPTIONS)[0]?.atomHeaderHistory;
  assert.ok(evidence);
  const expected = { checkpointSha256: HASH, documentUuid: DOCUMENT, docType: "SYMBOL" } as const;
  const mutations = [undefined, {}, { ...evidence, extra: true },
    { ...evidence, occurrences: evidence.occurrences.slice(1) },
    { ...evidence, occurrences: evidence.occurrences.toReversed() },
    { ...evidence, checkpointSha256: "b".repeat(64) },
    { ...evidence, documentUuid: "different" }, { ...evidence, docType: "FOOTPRINT" },
    { ...evidence, occurrencesSha256: "c".repeat(64) }, { ...evidence, sha256: "d".repeat(64) }];
  for (const field of ["recordIndex", "chunkIndex", "clientSource", "serializedFirstTicket", "tombstone", "bodySha256", "bodyEncodingSha256", "headerSha256"]) {
    const occurrences = structuredClone(evidence.occurrences);
    const last = occurrences[4];
    assert.ok(last);
    Object.assign(last, { [field]: field === "bodySha256" || field === "bodyEncodingSha256" ? "e".repeat(64) : null });
    mutations.push({ ...evidence, occurrences });
  }
  for (const mutation of mutations) { assert.throws(() => verifyNativeAtomHeaderHistory(mutation, expected), /atom-header provenance/u); }
});

void test("fresh-reader proof binding accepts only the immutable cooperatively generated object", () => {
  const evidence = materializeNativeHistory([imported()], HASH, OPTIONS)[0]?.atomHeaderHistory;
  assert.ok(evidence);
  const expected = { checkpointSha256: HASH, documentUuid: DOCUMENT, docType: "SYMBOL" } as const;
  assert.equal(verifyGeneratedNativeAtomHeaderHistory(evidence, expected), evidence);
  assert.ok(Object.isFrozen(evidence) && Object.isFrozen(evidence.occurrences) && evidence.occurrences.every(Object.isFrozen));
  assert.throws(() => Object.assign(evidence.occurrences[0] ?? {}, { ticket: 1000 }), TypeError);
  assert.throws(() => verifyGeneratedNativeAtomHeaderHistory(structuredClone(evidence), expected), /provenance/u);
  assert.throws(() => verifyGeneratedNativeAtomHeaderHistory(verifyNativeAtomHeaderHistory(evidence, expected), expected), /provenance/u);
  assert.throws(() => verifyGeneratedNativeAtomHeaderHistory(evidence, { ...expected, documentUuid: "wrong" }), /provenance/u);
});

void test("cooperative constructor freezes captured binding and already processed occurrence data", () => {
  const template = materializeNativeHistory([imported()], HASH, OPTIONS)[0]?.atomHeaderHistory?.occurrences[1];
  assert.ok(template);
  const occurrences = Array.from({ length: 600 }, (_, index) => ({ ...template, id: `atom-${index}`, recordIndex: index }));
  const binding = { checkpointSha256: HASH, documentUuid: DOCUMENT, docType: "SYMBOL" } as const;
  const callerBinding: { checkpointSha256: string; documentUuid: string; docType: "SYMBOL" } = { ...binding };
  const steps = createNativeAtomHeaderHistorySteps(callerBinding, occurrences);
  let step = steps.next();
  assert.equal(step.done, false);
  callerBinding.checkpointSha256 = "b".repeat(64);
  const first = occurrences[0];
  assert.ok(first);
  first.client = "changed after this occurrence was captured";
  const lastCaptured = occurrences[511];
  assert.ok(lastCaptured);
  lastCaptured.recordIndex = 249_999;
  while (step.done !== true) { step = steps.next(); }
  assert.equal(verifyGeneratedNativeAtomHeaderHistory(step.value, binding), step.value);
  assert.equal(step.value.occurrences[0]?.client, "fixture-client");
  assert.equal(step.value.checkpointSha256, HASH);
});

void test("resizing a provenance list during a yield refuses before branding any partial proof", () => {
  const template = materializeNativeHistory([imported()], HASH, OPTIONS)[0]?.atomHeaderHistory?.occurrences[1];
  assert.ok(template);
  const binding = { checkpointSha256: HASH, documentUuid: DOCUMENT, docType: "SYMBOL" } as const;
  for (const resize of ["append", "shrink", "last-yield"] as const) {
    const length = resize === "last-yield" ? 512 : 600;
    const occurrences = Array.from({ length }, (_, index) => ({ ...template, id: `atom-${index}`, recordIndex: index }));
    const steps = createNativeAtomHeaderHistorySteps(binding, occurrences);
    assert.equal(steps.next().done, false);
    if (resize === "shrink") { occurrences.pop(); }
    else { occurrences.push({ ...template, id: "appended", recordIndex: length }); }
    assert.throws(() => steps.next(), /provenance/u);
  }
});

void test("cooperative provenance yields repeatedly and captures options and strings before awaiting", async () => {
  const records = Array.from({ length: 4000 }, (_, index) => atom("PAD", `pad-${index}`, 100, { x: index }, index % 2 === 0 ? 0 : 100));
  const chunks = [head("FOOTPRINT") + records.join("")];
  const expected = materializeNativeHistory(chunks, HASH, OPTIONS);
  const mutableOptions: { libraryAtomHeaders?: "preserve" } = { ...OPTIONS };
  let turns = 0;
  let immediate: ReturnType<typeof setImmediate> | undefined;
  const tick = (): void => { turns += 1; immediate = setImmediate(tick); };
  immediate = setImmediate(tick);
  try {
    const pending = materializeNativeHistoryCooperatively(chunks, HASH, mutableOptions);
    chunks.splice(0, chunks.length, "changed while suspended");
    delete mutableOptions.libraryAtomHeaders;
    assert.deepEqual(await pending, expected);
  } finally { clearImmediate(immediate); }
  assert.ok(turns >= 20);
  assert.equal(expected[0]?.atomHeaderHistory?.occurrences.length, 4000);
});

void test("encrypted readonly checkpoint opt-in retains complete library evidence without changing bytes", async (t) => {
  const chunks = [imported(), head("FOOTPRINT", 1, "77".repeat(16)) + atom("PAD", "pad", 459, { number: "1" }, 10)];
  const input = await checkpoint(t, chunks);
  await assert.rejects(readNativeHistoryCheckpoint(input), /record-invalid/u);
  const bytesBefore = await readFile(input.checkpointPath);
  const snapshot = await readNativeHistoryCheckpoint({ ...input, ...OPTIONS });
  assert.deepEqual(snapshot.documents, materializeNativeHistory(chunks, input.expectedSha256, OPTIONS));
  assert.equal(snapshot.documents.length, 2);
  assert.equal(snapshot.documents[0]?.atomHeaderHistory?.occurrences.length, 5);
  assert.equal(snapshot.documents[1]?.atomHeaderHistory?.occurrences.length, 1);
  assert.match(snapshot.semanticSha256, /^[a-f0-9]{64}$/u);
  assert.deepEqual(await readFile(input.checkpointPath), bytesBefore);
  assert.equal(createHash("sha256").update(bytesBefore).digest("hex"), input.expectedSha256);
});
