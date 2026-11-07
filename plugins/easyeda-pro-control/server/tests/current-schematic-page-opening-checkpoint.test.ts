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
import { prepareCurrentSchematicPageOpeningCheckpoint, verifyCurrentSchematicPageOpeningCheckpoint } from "../src/current-schematic-page-opening-checkpoint.ts";

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

async function fixture(paths: Map<string, string>, docType = "SCH_PAGE", deleted = false, linkedPage = true): Promise<{
  source: string; target: { rawWindowsPath: string; projectUuid: string; branchUuid: string; documentUuid: string; schematicUuid: string; expectedSourceSha256: string };
}> {
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(root !== undefined && path.basename(root).startsWith("easyeda-test-control-"));
  const directory = await mkdtemp(path.join(root, "schematic-open-checkpoint-")), source = path.join(directory, "fixture.eprj2");
  const rawWindowsPath = ["Z:", "Fixture", path.basename(directory), "fixture.eprj2"].join("\\");
  const projectUuid = sha256Text(rawWindowsPath);
  paths.set(`/mnt/z/Fixture/${path.basename(directory)}/fixture.eprj2`, source);
  const plaintext = line({ type: "DOCHEAD", ticket: 1 }, { uuid: DOCUMENT, docType, client: "fixture-client" })
    + line({ type: "META", id: "META", ticket: 1 }, { title: "Synthetic page", source: "", schematic: "88".repeat(8) })
    + (deleted ? line({ type: "DELETE_DOC", id: "DELETE_DOC", ticket: 2 }, { isDelete: true }) : "")
    + line({ type: "DOCHEAD", ticket: 3 }, { uuid: "77".repeat(16), docType: "SYMBOL", client: "fixture-client" })
    + line({ type: "PIN", id: "pin", ticket: 459, firstTicket: 6 }, { number: "1" })
    + (linkedPage ? line({ type: "DOCHEAD", ticket: 460 }, { uuid: "88".repeat(8), docType: "SCH", client: "fixture-client" })
      + line({ type: "META", id: "META", ticket: 460 }, { title: "Synthetic schematic", source: "" })
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
  return { source, target: { rawWindowsPath, projectUuid, documentUuid: DOCUMENT, branchUuid: BRANCH, schematicUuid: "88".repeat(8), expectedSourceSha256: digest(await readFile(source)) } };
}


void test("schematic page opening preserves a full private checkpoint and proves its exact ordinary parent in the default branch", async context => {
  const value = await fixture(fixturePaths(context));
  const prepared = await prepareCurrentSchematicPageOpeningCheckpoint(value.target);
  assert.equal(prepared.evidence.projectUuid, value.target.projectUuid); assert.equal(prepared.evidence.branchUuid, BRANCH);
  assert.equal(prepared.evidence.documentUuid, DOCUMENT); assert.equal(prepared.evidence.schematicUuid, value.target.schematicUuid);
  assert.equal(prepared.checkpoint.sourceDumpSha256, prepared.checkpoint.checkpointDumpSha256);
  assert.equal(digest(await readFile(value.source)), value.target.expectedSourceSha256);
  const checkpoint = await stat(prepared.checkpoint.checkpoint); assert.equal(checkpoint.mode % 512, 0o600);
  assert.deepEqual(prepared.preparationCheckpoint, { path: prepared.checkpoint.checkpoint, bytes: checkpoint.size, sha256: prepared.checkpoint.checkpointSha256 });
  await verifyCurrentSchematicPageOpeningCheckpoint(prepared, value.target);
  await assert.rejects(verifyCurrentSchematicPageOpeningCheckpoint({ ...prepared, evidence: { ...prepared.evidence, schematicUuid: "f".repeat(16) } }, value.target));
  const database = new DatabaseSync(value.source);
  try { database.exec("CREATE TABLE later_change(id INTEGER)"); } finally { database.close(); }
  await assert.rejects(verifyCurrentSchematicPageOpeningCheckpoint(prepared, value.target));
  assert.equal(digest(await readFile(prepared.checkpoint.checkpoint)), prepared.checkpoint.checkpointSha256);
});

void test("schematic page opening rejects missing parents, wrong branches, symbols and deleted pages before navigation", async context => {
  const paths = fixturePaths(context), value = await fixture(paths);
  for (const changed of [{ schematicUuid: "f".repeat(16) }, { branchUuid: "f".repeat(32) }, { expectedSourceSha256: "f".repeat(64) }]) {
    await assert.rejects(prepareCurrentSchematicPageOpeningCheckpoint({ ...value.target, ...changed }));
  }
  for (const [docType, deleted] of [["SYMBOL", false], ["SCH_PAGE", true]] as const) {
    const other = await fixture(paths, docType, deleted); await assert.rejects(prepareCurrentSchematicPageOpeningCheckpoint(other.target));
  }
  const missing = await fixture(paths, "SCH_PAGE", false, false);
  await assert.rejects(prepareCurrentSchematicPageOpeningCheckpoint(missing.target));
});
