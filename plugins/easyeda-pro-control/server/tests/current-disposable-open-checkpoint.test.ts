import assert from "node:assert/strict";
import { createCipheriv, createHash } from "node:crypto";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { gzipSync } from "node:zlib";
import { sha256Text } from "../src/core.ts";
import { prepareCurrentDisposableOpenCheckpoint, prepareCurrentSymbolOperationCheckpoint,
  verifyCurrentDisposableOpenCheckpoint, verifyCurrentSymbolOperationCheckpoint, verifyHistoricalCurrentDisposableOpenCheckpoint } from "../src/current-disposable-open-checkpoint.ts";

const BRANCH = "22".repeat(16), DOCUMENT = "66".repeat(8), HISTORY = "33".repeat(16);
const digest = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");
const line = (header: Readonly<Record<string, unknown>>, body: unknown): string => `${JSON.stringify(header)}||${JSON.stringify(body)}|\n`;

function fixturePaths(context: TestContext): Map<string, string> {
  const originalResolve = path.resolve.bind(path), paths = new Map<string, string>();
  // Only the fixed synthetic Windows-to-POSIX lookup is mapped. The real
  // Checkpoint creator, receipt verifier and encrypted-history reader run.
  context.mock.method(path, "resolve", (...parts: string[]): string =>
    parts.length === 1 ? paths.get(parts[0] ?? "") ?? originalResolve(...parts) : originalResolve(...parts));
  syncBuiltinESMExports();
  context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  return paths;
}

async function fixture(paths: Map<string, string>, docType = "PCB", deleted = false, linkedPage = false): Promise<{
  source: string; target: { rawWindowsPath: string; projectUuid: string; documentUuid: string; expectedSourceSha256: string };
}> {
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(root !== undefined && path.basename(root).startsWith("easyeda-test-control-"));
  const directory = await mkdtemp(path.join(root, "disposable-open-checkpoint-")), source = path.join(directory, "fixture.eprj2");
  const rawWindowsPath = ["Z:", "Fixture", path.basename(directory), "fixture.eprj2"].join("\\");
  const projectUuid = sha256Text(rawWindowsPath);
  paths.set(`/mnt/z/Fixture/${path.basename(directory)}/fixture.eprj2`, source);
  const plaintext = line({ type: "DOCHEAD", ticket: 1 }, { uuid: DOCUMENT, docType, client: "fixture-client" })
    + line({ type: "META", id: "META", ticket: 1 }, { title: "Synthetic PCB" })
    + (deleted ? line({ type: "DELETE_DOC", id: "DELETE_DOC", ticket: 2 }, { isDelete: true }) : "")
    + line({ type: "DOCHEAD", ticket: 3 }, { uuid: "77".repeat(16), docType: "SYMBOL", client: "fixture-client" })
    + line({ type: "PIN", id: "pin", ticket: 459, firstTicket: 6 }, { number: "1" })
    + (linkedPage ? line({ type: "DOCHEAD", ticket: 460 }, { uuid: "88".repeat(8), docType: "SCH", client: "fixture-client" })
      + line({ type: "META", id: "META", ticket: 460 }, { title: "Synthetic schematic" })
      + line({ type: "DOCHEAD", ticket: 461 }, { uuid: "99".repeat(8), docType: "SCH_PAGE", client: "fixture-client" })
      + line({ type: "META", id: "META", ticket: 461 }, { title: "Synthetic page", schematic: "88".repeat(8) }) : "");
  // Synthetic encryption key for this generated SQLite fixture, not a credential.
  const key = "55".repeat(16);
  const cipher = createCipheriv("aes-128-gcm", Buffer.from(key, "hex"), Buffer.from(HISTORY, "hex"));
  // oxlint-disable-next-line node/no-sync -- Compress only this bounded synthetic history before encrypting the fixture.
  const compressed = gzipSync(plaintext);
  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final(), cipher.getAuthTag()]);
  const database = new DatabaseSync(source);
  try {
    database.exec(`CREATE TABLE projects(uuid TEXT PRIMARY KEY, branch_uuid TEXT, owner_uuid TEXT);
      CREATE TABLE branches(uuid TEXT PRIMARY KEY, project_uuid TEXT, history_uuid TEXT);
      CREATE TABLE project_history_${BRANCH}(uuid TEXT PRIMARY KEY, parent TEXT, snapshot TEXT, key TEXT, num INTEGER, snapshot_num INTEGER);
      CREATE TABLE history_data(uuid TEXT PRIMARY KEY, history_uuid TEXT, dataStr TEXT);`);
    database.prepare("INSERT INTO projects VALUES(?,?,?)").run(projectUuid, BRANCH, "44".repeat(16));
    database.prepare("INSERT INTO branches VALUES(?,?,?)").run(BRANCH, projectUuid, HISTORY);
    database.prepare(`INSERT INTO project_history_${BRANCH} VALUES(?,?,?,?,?,?)`).run(HISTORY, null, null, key, 0, 0);
    database.prepare("INSERT INTO history_data VALUES(?,?,?)").run(HISTORY, HISTORY, encrypted.toString("base64"));
  } finally { database.close(); }
  return { source, target: { rawWindowsPath, projectUuid, documentUuid: DOCUMENT, expectedSourceSha256: digest(await readFile(source)) } };
}

void test("disposable checkpoint rejects Windows aliases and raw-path identity mismatch before file access", async () => {
  for (const rawWindowsPath of [String.raw`C:\Fixture\..\board.eprj2`, String.raw`C:\Fixture\NUL.eprj2`, String.raw`C:\FIXTUR~1\board.eprj2`, String.raw`\\server\share\board.eprj2`]) {
    await assert.rejects(prepareCurrentDisposableOpenCheckpoint({ rawWindowsPath, projectUuid: sha256Text(rawWindowsPath),
      documentUuid: DOCUMENT, expectedSourceSha256: "a".repeat(64) }), /Windows|path|Invalid/u);
  }
  await assert.rejects(prepareCurrentDisposableOpenCheckpoint({ rawWindowsPath: String.raw`C:\Fixture\board.eprj2`, projectUuid: "a".repeat(64),
    documentUuid: DOCUMENT, expectedSourceSha256: "b".repeat(64) }), /identity|UUID/u);
});

void test("disposable checkpoint uses real private backup and preserved imported headers, then refuses source or evidence drift", async context => {
  const f = await fixture(fixturePaths(context));
  const padded = new DatabaseSync(f.source);
  try { padded.exec("CREATE TABLE discarded(value BLOB); INSERT INTO discarded VALUES(zeroblob(32768)); DROP TABLE discarded;"); }
  finally { padded.close(); }
  f.target.expectedSourceSha256 = digest(await readFile(f.source));
  const prepared = await prepareCurrentDisposableOpenCheckpoint(f.target);
  assert.equal(prepared.targetEvidence.projectUuid, f.target.projectUuid);
  assert.equal(prepared.targetEvidence.branchUuid, BRANCH); assert.equal(prepared.targetEvidence.documentUuid, DOCUMENT);
  assert.equal(prepared.targetEvidence.docType, "PCB"); assert.equal(prepared.targetEvidence.sourceSha256, f.target.expectedSourceSha256);
  assert.equal(prepared.checkpoint.source, f.source); assert.notEqual(prepared.checkpoint.checkpoint, f.source);
  assert.equal(prepared.checkpoint.sourceDumpSha256, prepared.checkpoint.checkpointDumpSha256);
  const checkpointInfo = await stat(prepared.checkpoint.checkpoint), receiptInfo = await stat(prepared.checkpoint.receiptPath);
  assert.equal(checkpointInfo.mode % 512, 0o600); assert.equal(receiptInfo.mode % 512, 0o600);
  assert.deepEqual(prepared.preparationCheckpoint, { path: prepared.checkpoint.checkpoint, bytes: checkpointInfo.size,
    sha256: prepared.checkpoint.checkpointSha256 });
  const sourceInfo = await stat(f.source); assert.ok(sourceInfo.size > checkpointInfo.size);
  assert.equal(digest(await readFile(f.source)), f.target.expectedSourceSha256);
  await verifyCurrentDisposableOpenCheckpoint(prepared, f.target);
  const legacy = { ...prepared }; delete legacy.preparationCheckpoint;
  await verifyCurrentDisposableOpenCheckpoint(legacy, f.target);
  for (const changed of [{ bytes: sourceInfo.size }, { path: f.source }, { sha256: "0".repeat(64) }]) {
    await assert.rejects(verifyCurrentDisposableOpenCheckpoint({ ...prepared,
      preparationCheckpoint: { ...prepared.preparationCheckpoint, ...changed } }, f.target), /descriptor differs|byte length differs/u);
  }
  await assert.rejects(verifyCurrentDisposableOpenCheckpoint({ ...prepared,
    targetEvidence: { ...prepared.targetEvidence, branchUuid: "88".repeat(16) } }, f.target), /target evidence changed/u);
  const database = new DatabaseSync(f.source);
  try { database.exec("CREATE TABLE later_change(id INTEGER)"); } finally { database.close(); }
  await assert.rejects(verifyCurrentDisposableOpenCheckpoint(prepared, f.target), /changed before navigation/u);
  await verifyHistoricalCurrentDisposableOpenCheckpoint(prepared, f.target);
  await assert.rejects(verifyHistoricalCurrentDisposableOpenCheckpoint({ ...prepared,
    targetEvidence: { ...prepared.targetEvidence, branchUuid: "88".repeat(16) } }, f.target), /target evidence changed/u);
  await assert.rejects(verifyHistoricalCurrentDisposableOpenCheckpoint(legacy, f.target), /original managed preparation/u);
  assert.equal(digest(await readFile(prepared.checkpoint.checkpoint)), prepared.checkpoint.checkpointSha256);
});

void test("disposable checkpoint refuses wrong source hash, non-PCB and deleted default-branch targets", async context => {
  const paths = fixturePaths(context);
  const first = await fixture(paths);
  await assert.rejects(prepareCurrentDisposableOpenCheckpoint({ ...first.target, expectedSourceSha256: "0".repeat(64) }), /exact requested original source/u);
  for (const [docType, deleted] of [["SCH_PAGE", false], ["PCB", true]] as const) {
    const f = await fixture(paths, docType, deleted);
    await assert.rejects(prepareCurrentDisposableOpenCheckpoint(f.target), /undeleted PCB/u);
  }
});

void test("ordinary checkpoint seals supported startup from managed history and rejects missing or changed expectations", async context => {
  const paths = fixturePaths(context), unsupported = await fixture(paths);
  await assert.rejects(prepareCurrentSymbolOperationCheckpoint(unsupported.target));
  const value = await fixture(paths, "PCB", false, true);
  const prepared = await prepareCurrentSymbolOperationCheckpoint(value.target);
  assert.equal(prepared.purpose, "ordinary-symbol-metadata");
  assert.deepEqual(prepared.startupExpectation, { sheetUuids: ["99".repeat(8)], templates: [] });
  assert.equal(digest(await readFile(value.source)), value.target.expectedSourceSha256);
  await verifyCurrentSymbolOperationCheckpoint(prepared, value.target);
  const disposable = await prepareCurrentDisposableOpenCheckpoint(value.target);
  await assert.rejects(verifyCurrentSymbolOperationCheckpoint(disposable, value.target), /sealed pre-navigation/u);
  await assert.rejects(verifyCurrentSymbolOperationCheckpoint({ ...prepared,
    startupExpectation: { sheetUuids: ["aa".repeat(8)], templates: [] } }, value.target), /expectation changed/u);
  assert.equal(digest(await readFile(value.source)), value.target.expectedSourceSha256);
});
