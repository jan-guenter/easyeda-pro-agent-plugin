import assert from "node:assert/strict";
import { createCipheriv, createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { gzipSync } from "node:zlib";

import { sha256Json } from "../src/core.ts";
import { materializeNativeHistory, materializeNativeHistoryCooperatively, readNativeHistoryCheckpoint } from "../src/native-history.ts";

const CHECKPOINT_HASH = "a".repeat(64);
const DOCUMENT = "66".repeat(16);

function line(type: string, body: unknown, id?: string, ticket?: number): string {
  return `${JSON.stringify({ type, ...(id === undefined ? {} : { id }), ...(ticket === undefined ? {} : { ticket }) })}||${body === null ? "" : JSON.stringify(body)}|\n`;
}

function head(documentUuid = DOCUMENT, ticket = 1, docType = "PCB"): string {
  return line("DOCHEAD", { uuid: documentUuid, docType, client: "fixture-client" }, undefined, ticket);
}

function substantialHistory(documentCount = 8, recordsPerDocument = 1200): string[] {
  const original: string[] = [line("EDIT_HEAD", {})];
  const revised: string[] = [];
  for (let documentIndex = 0; documentIndex < documentCount; documentIndex += 1) {
    const documentUuid = documentIndex.toString(16).padStart(32, "0");
    const docType = documentIndex % 2 === 0 ? "SCH_PAGE" : "PCB";
    original.push(head(documentUuid, 1, docType));
    revised.push(head(documentUuid, 2, docType));
    for (let index = 0; index < recordsPerDocument; index += 1) {
      const id = `object-${index}`;
      const type = index % 3 === 0 ? "ATTR" : "COMPONENT";
      original.push(line(type, { value: `µΩ ${index}`, nested: { preserve: [false, 0, null] } }, id, index + 1));
      revised.push(line(type, { value: `revised ${index}`, x: index }, id, recordsPerDocument + index + 1));
      if (index % 17 === 0) {
        revised.push(line("STRING", null, id, recordsPerDocument * 2 + index + 1),
          line(type, { value: `restored ${index}` }, id, recordsPerDocument * 3 + index + 1));
      }
    }
  }
  const first = original.join("");
  return [first, revised.join(""), first];
}

async function turnsDuring<Result>(run: () => Promise<Result>): Promise<{ result: Result; turns: number }> {
  let turns = 0;
  let handle: ReturnType<typeof setImmediate> | undefined;
  const tick = (): void => { turns += 1; handle = setImmediate(tick); };
  handle = setImmediate(tick);
  try { return { result: await run(), turns }; } finally { clearImmediate(handle); }
}

function synchronousFailure(chunks: readonly string[], checkpointHash = CHECKPOINT_HASH): Error {
  let failure: Error | undefined;
  try { materializeNativeHistory(chunks, checkpointHash); } catch (error) {
    assert.ok(error instanceof Error);
    failure = error;
  }
  assert.ok(failure, "The synchronous parity oracle must refuse this fixture");
  return failure;
}

async function checkpointFixture(t: TestContext, chunks: readonly string[]): Promise<{ checkpointPath: string; expectedSha256: string; projectUuid: string }> {
  const directory = await mkdtemp(join(tmpdir(), "native-history-cooperative-"));
  t.after(async () => { await rm(directory, { recursive: true, force: true }); });
  const checkpointPath = join(directory, "fixture.eprj2");
  const projectUuid = "11".repeat(32);
  const branchUuid = "22".repeat(16);
  const historyUuid = "33".repeat(16);
  // Synthetic encryption key; not a runtime credential.
  const key = "55".repeat(16);
  const database = new DatabaseSync(checkpointPath);
  try {
    database.exec(`
      CREATE TABLE projects(uuid TEXT PRIMARY KEY, branch_uuid TEXT, owner_uuid TEXT);
      CREATE TABLE branches(uuid TEXT PRIMARY KEY, project_uuid TEXT, history_uuid TEXT);
      CREATE TABLE project_history_${branchUuid}(uuid TEXT PRIMARY KEY, parent TEXT, snapshot TEXT, key TEXT, num INTEGER, snapshot_num INTEGER);
      CREATE TABLE history_data(uuid TEXT PRIMARY KEY, history_uuid TEXT, dataStr TEXT);
    `);
    database.prepare("INSERT INTO projects VALUES(?,?,?)").run(projectUuid, branchUuid, "44".repeat(16));
    database.prepare("INSERT INTO branches VALUES(?,?,?)").run(branchUuid, projectUuid, historyUuid);
    database.prepare(`INSERT INTO project_history_${branchUuid} VALUES(?,?,?,?,?,?)`).run(historyUuid, null, null, key, chunks.length - 1, 0);
    const insert = database.prepare("INSERT INTO history_data VALUES(?,?,?)");
    for (const [index, plaintext] of chunks.entries()) {
      const cipher = createCipheriv("aes-128-gcm", Buffer.from(key, "hex"), Buffer.from(historyUuid, "hex"));
      // oxlint-disable-next-line node/no-sync -- Bounded synthetic fixtures are compressed before testing the asynchronous checkpoint reader.
      const compressed = gzipSync(plaintext);
      const encrypted = Buffer.concat([cipher.update(compressed), cipher.final(), cipher.getAuthTag()]);
      insert.run(index === 0 ? historyUuid : `${historyUuid}-${index}`, historyUuid, encrypted.toString("base64"));
    }
  } finally { database.close(); }
  return { checkpointPath, projectUuid, expectedSha256: createHash("sha256").update(await readFile(checkpointPath)).digest("hex") };
}

void test("cooperative history preserves pre-refactor golden hashes, first clocks and metadata lineage", async () => {
  const metadata = { uuid: DOCUMENT, docType: "SCH_PAGE", client: "fixture-client", title: "cooperative parity" };
  const original = line("DOCHEAD", metadata, undefined, 1) + line("ATTR", { key: "Device", value: "device" }, "attr", 7)
    + line("COMPONENT", { x: 1, nested: { keep: true } }, "part", 8);
  const revised = line("DOCHEAD", { ...metadata, title: "cooperative parity revised" }, undefined, 2)
    + line("ATTR", { key: "Device", value: "device revised" }, "attr", 90) + line("COMPONENT", { x: 3 }, "part", 91);
  const chunks = [original, revised];
  const expected = materializeNativeHistory(chunks, CHECKPOINT_HASH);
  assert.equal(sha256Json(expected), "4183647dbf95c23cd4e3d8cf5d7565b0a56c2d111d209555eb7b263b8ddb05cd");
  assert.equal(expected[0]?.semanticSha256, "1c91522675ebc75ab9a439793bd0c29489edfc6788d25d0b2af0ef21cfce01c2");
  assert.equal(expected[0]?.headerHistory?.sha256, "431c553bd826404ad9da113ce4acef1944f9381c7f28d9d8ecba97c85300a5a5");
  assert.deepEqual(await materializeNativeHistoryCooperatively(chunks, CHECKPOINT_HASH), expected);
});

void test("substantial legitimate histories preserve replacement, stale clocks, tombstones and complete output", async () => {
  const chunks = substantialHistory();
  const before = [...chunks];
  const expected = materializeNativeHistory(chunks, CHECKPOINT_HASH);
  const observed = await materializeNativeHistoryCooperatively(chunks, CHECKPOINT_HASH);
  assert.deepEqual(observed, expected);
  assert.deepEqual(chunks, before);
  assert.equal(observed.length, 8);
  assert.equal(observed.reduce((total, document) => total + document.records.length, 0), 9600);
});

void test("cooperative materialization captures all chunk strings before its first await", async () => {
  const chunks = substantialHistory(2, 1000);
  const expected = materializeNativeHistory(chunks, CHECKPOINT_HASH);
  const pending = materializeNativeHistoryCooperatively(chunks, CHECKPOINT_HASH);
  chunks.splice(0, chunks.length, "caller replaced the chunks while suspended");
  assert.deepEqual(await pending, expected);
});

void test("record batches give real timer work repeated opportunities without millisecond thresholds", async () => {
  const chunks = substantialHistory(1, 12_000);
  const expected = materializeNativeHistory(chunks, CHECKPOINT_HASH);
  const observed = await turnsDuring(() => materializeNativeHistoryCooperatively(chunks, CHECKPOINT_HASH));
  assert.deepEqual(observed.result, expected);
  assert.ok(observed.turns >= 20, "Large single-document histories must yield within record processing, not only after finalization");
});

void test("UTF-8 byte batches yield even with fewer records than the record batch threshold", async () => {
  const small = head() + line("EDIT_HEAD", {}).repeat(16);
  const large = head() + line("EDIT_HEAD", { padding: "é".repeat(40_000) }).repeat(16);
  const baseline = await turnsDuring(() => materializeNativeHistoryCooperatively([small], CHECKPOINT_HASH));
  const observed = await turnsDuring(() => materializeNativeHistoryCooperatively([large], CHECKPOINT_HASH));
  assert.deepEqual(observed.result, materializeNativeHistory([large], CHECKPOINT_HASH));
  assert.ok(observed.turns > baseline.turns, "Substantial record bytes must trigger extra real event-loop turns");
});

void test("malformed, duplicate and conflicting histories retain exact synchronous rejection stages", async () => {
  const valid = head() + line("COMPONENT", { x: 1 }, "part", 1);
  const conflict = valid + line("COMPONENT", { x: 2 }, "part", 1);
  const substantial = valid + line("EDIT_HEAD", {}).repeat(5000);
  const malformed = '{"type":"COMPONENT","id":"other","ticket":2}||{"x":1,"\\u0078":2}|\n';
  const fixtures = [
    [], [""], [line("COMPONENT", {}, "part", 1)], [head(), line("COMPONENT", {}, "part", 1)],
    [conflict], [conflict + malformed], [valid + malformed],
    [substantial + malformed], [substantial + line("COMPONENT", { x: 2 }, "part", 1)],
    [substantial + line("COMPONENT", { x: 2 }, "part", 1) + malformed],
    [`${valid}{"type":"LINE","type":"COMPONENT","id":"other","ticket":2}||{}|\n`],
    [`${valid}{"type":"COMPONENT","id":"other","ticket":2}||{"__proto__":{}}|\n`],
    [valid + line("LINE", { x: 2 }, "part", 2)],
    [valid + line("DELETE_DOC", { isDelete: "true" }, "DELETE_DOC", 2)],
    [head(DOCUMENT, 1, "UNSUPPORTED")],
    [head() + line("DOCHEAD", { uuid: DOCUMENT, docType: "PCB", client: "fixture-client", title: "conflicting metadata" }, undefined, 1)],
    [head() + line("EDIT_HEAD", {}).repeat(250_000)],
  ];
  for (const chunks of fixtures) {
    const expected = synchronousFailure(chunks);
    await assert.rejects(materializeNativeHistoryCooperatively(chunks, CHECKPOINT_HASH), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.deepEqual({ name: error.name, message: error.message }, { name: expected.name, message: expected.message });
      return true;
    });
  }
  assert.match(synchronousFailure([conflict + malformed]).message, /\(record-invalid\)/u, "Whole-chunk parse errors must precede application conflicts");
  const invalidHash = synchronousFailure([valid], "invalid");
  await assert.rejects(materializeNativeHistoryCooperatively([valid], "invalid"), { name: invalidHash.name, message: invalidHash.message });
});

void test("asynchronous checkpoint reads retain complete synchronous snapshots and exact immutable file bytes", async (t) => {
  const chunks = substantialHistory(3, 1000);
  const input = await checkpointFixture(t, chunks);
  const expected = materializeNativeHistory(chunks, input.expectedSha256);
  const observed = await readNativeHistoryCheckpoint(input);
  assert.deepEqual(observed.documents, expected);
  assert.equal(observed.chunkCount, chunks.length);
  assert.equal(observed.plaintextBytes, chunks.reduce((total, chunk) => total + Buffer.byteLength(chunk), 0));
  assert.equal(createHash("sha256").update(await readFile(input.checkpointPath)).digest("hex"), input.expectedSha256);
});

void test("checkpoint reading captures primitive authority before its first await", async (t) => {
  const chunks = substantialHistory(2, 1000);
  const input = await checkpointFixture(t, chunks);
  const original = { ...input };
  const pending = readNativeHistoryCheckpoint(input);
  input.checkpointPath = join(original.checkpointPath, "substituted.eprj2");
  input.expectedSha256 = "0".repeat(64);
  input.projectUuid = "0".repeat(64);
  const observed = await pending;
  assert.equal(observed.projectUuid, original.projectUuid);
  assert.equal(observed.checkpointSha256, original.expectedSha256);
  assert.deepEqual(observed.documents, materializeNativeHistory(chunks, original.expectedSha256));
  assert.equal(createHash("sha256").update(await readFile(original.checkpointPath)).digest("hex"), original.expectedSha256);
});
