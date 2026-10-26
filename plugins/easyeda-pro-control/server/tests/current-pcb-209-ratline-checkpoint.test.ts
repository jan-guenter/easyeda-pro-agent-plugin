import assert from "node:assert/strict";
import { createCipheriv, createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { gzipSync } from "node:zlib";
import { rejectCurrentPcb209RatlineCheckpointPopulation as rejectPopulation } from "../src/current-pcb-209-ratline-checkpoint.ts";
import { readNativeHistoryCheckpoint } from "../src/native-history.ts";

const BRANCH = "22".repeat(16), DOCUMENT = "44".repeat(16), HISTORY = "33".repeat(16), PROJECT = "11".repeat(32);
// Synthetic encryption key, never a runtime credential.
const KEY = "55".repeat(16);
function line(type: string, body: unknown, id?: string, ticket = 1): string {
  return `${JSON.stringify({ type, ...(id === undefined ? {} : { id }), ticket })}||${body === null ? "" : JSON.stringify(body)}|\n`;
}
async function fixture(context: TestContext, family: string, deleted = false): Promise<Parameters<typeof rejectPopulation>[0]> {
  const root = await mkdtemp(join(tmpdir(), "easyeda-ratline-negative-"));
  context.after(async (): Promise<void> => { await rm(root, { recursive: true, force: true }); });
  const path = join(root, "fixture.eprj2");
  const db = new DatabaseSync(path);
  db.exec(`CREATE TABLE projects(uuid TEXT PRIMARY KEY, branch_uuid TEXT, owner_uuid TEXT);
CREATE TABLE branches(uuid TEXT PRIMARY KEY, project_uuid TEXT, history_uuid TEXT);
CREATE TABLE project_history_${BRANCH}(uuid TEXT PRIMARY KEY,parent TEXT,snapshot TEXT,key TEXT,num INTEGER,snapshot_num INTEGER);
CREATE TABLE history_data(uuid TEXT PRIMARY KEY,history_uuid TEXT,dataStr TEXT);`);
  const head = line("DOCHEAD", { uuid: DOCUMENT, docType: "PCB", client: "fixture" });
  const source = head + line(family, { fixture: true }, "object") + (deleted ? line(family, null, "object", 2) : "");
  const cipher = createCipheriv("aes-128-gcm", Buffer.from(KEY, "hex"), Buffer.from(HISTORY, "hex"));
  // oxlint-disable-next-line node/no-sync -- The small synthetic native-history fixture is compressed before writing its private SQLite file.
  const encrypted = Buffer.concat([cipher.update(gzipSync(source)), cipher.final(), cipher.getAuthTag()]).toString("base64");
  try {
    db.prepare("INSERT INTO projects VALUES(?,?,?)").run(PROJECT, BRANCH, "66".repeat(16));
    db.prepare("INSERT INTO branches VALUES(?,?,?)").run(BRANCH, PROJECT, HISTORY);
    db.prepare(`INSERT INTO project_history_${BRANCH} VALUES(?,?,?,?,?,?)`).run(HISTORY, null, null, KEY, 0, 0);
    db.prepare("INSERT INTO history_data VALUES(?,?,?)").run(HISTORY, HISTORY, encrypted);
  } finally { db.close(); }
  const sha = createHash("sha256").update(await readFile(path)).digest("hex");
  const history = await readNativeHistoryCheckpoint({ checkpointPath: path, expectedSha256: sha, projectUuid: PROJECT });
  const document = history.documents[0]; assert.ok(document);
  return { checkpoint: { checkpoint: path, checkpointSha256: sha, sourceSha256: sha }, targetEvidence: {
    projectUuid: PROJECT, branchUuid: BRANCH, documentUuid: DOCUMENT, docType: "PCB", sourceSha256: sha, checkpointSha256: sha,
    documentSemanticSha256: document.semanticSha256, historySemanticSha256: history.semanticSha256, headHistoryUuid: HISTORY,
  } };
}
void test("ratline preflight rejects known physical records using the complete original checkpoint fold", async context => {
  const populated = await fixture(context, "LINE");
  await assert.rejects(rejectPopulation(populated), /PCB209_RATLINE_CHECKPOINT_KNOWN_POPULATED/u);
  const deleted = await fixture(context, "LINE", true);
  await rejectPopulation(deleted);
  const metadata = await fixture(context, "PRIMITIVE");
  await rejectPopulation(metadata);
  // Passing this negative filter returns no empty-baseline or runtime authority.
  const unknown = await fixture(context, "FUTURE_OBJECT");
  await rejectPopulation(unknown);
});
void test("ratline preflight distinguishes mismatched and unreadable history from confirmed population", async context => {
  const input = await fixture(context, "LINE");
  await assert.rejects(rejectPopulation({ ...input, targetEvidence: { ...input.targetEvidence, documentSemanticSha256: "0".repeat(64) } }),
    /PCB209_RATLINE_CHECKPOINT_BINDING/u);
  const wrong = { ...input, checkpoint: { ...input.checkpoint, checkpointSha256: "0".repeat(64) },
    targetEvidence: { ...input.targetEvidence, checkpointSha256: "0".repeat(64) } };
  await assert.rejects(rejectPopulation(wrong), /checkpoint-hash/u);
  await rm(input.checkpoint.checkpoint);
  await assert.rejects(rejectPopulation(input), /ENOENT|checkpoint-file/u);
});
