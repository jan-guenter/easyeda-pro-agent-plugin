import assert from "node:assert/strict";
import { createCipheriv, createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { gzipSync } from "node:zlib";
import { readNativeHistoryCheckpoint } from "../src/native-history.ts";
import type { nativeFormatFixture } from "./flat-display-native-fixture.ts";

/** Real encrypted SQLite decoding with public synthetic records. Native reads
 * and dispatch in coordinator tests remain explicit isolated test seams.
 */
export async function storedFlatFixture(value: ReturnType<typeof nativeFormatFixture>, directory: string, name: string): Promise<ReturnType<typeof nativeFormatFixture>> {
  const checkpointPath = join(directory, `${name}.eprj2`), history = value.evidence.history;
  const key = "55".repeat(16), uuid = "66".repeat(16);
  const plaintext = history.documents.map((document) => {
    const records = document.records.map((row, index) => `${JSON.stringify({ type: row.type, id: row.id, ticket: index + 1 })}||${JSON.stringify(row.body)}|\n`).join("");
    return `{"type":"DOCHEAD","ticket":0}||${JSON.stringify(document.metadata)}|\n${records}`;
  }).join("");
  const cipher = createCipheriv("aes-128-gcm", Buffer.from(key, "hex"), Buffer.from(uuid, "hex"));
  // oxlint-disable-next-line node/no-sync -- Bounded synthetic history is compressed before its isolated SQLite insert.
  const encrypted = Buffer.concat([cipher.update(gzipSync(plaintext)), cipher.final(), cipher.getAuthTag()]).toString("base64");
  const database = new DatabaseSync(checkpointPath);
  try {
    database.exec(`CREATE TABLE projects(uuid TEXT PRIMARY KEY, branch_uuid TEXT, owner_uuid TEXT);
CREATE TABLE branches(uuid TEXT PRIMARY KEY, project_uuid TEXT, history_uuid TEXT);
CREATE TABLE project_history_${history.branchUuid}(uuid TEXT PRIMARY KEY, parent TEXT, snapshot TEXT, key TEXT, num INTEGER, snapshot_num INTEGER);
CREATE TABLE history_data(uuid TEXT PRIMARY KEY, history_uuid TEXT, dataStr TEXT);`);
    assert.equal(typeof history.projectOwnerUuid, "string");
    assert.ok(history.projectOwnerUuid !== undefined);
    database.prepare("INSERT INTO projects VALUES(?,?,?)").run(history.projectUuid, history.branchUuid, history.projectOwnerUuid);
    database.prepare("INSERT INTO branches VALUES(?,?,?)").run(history.branchUuid, history.projectUuid, uuid);
    database.prepare(`INSERT INTO project_history_${history.branchUuid} VALUES(?,?,?,?,?,?)`).run(uuid, null, null, key, 0, 0);
    database.prepare("INSERT INTO history_data VALUES(?,?,?)").run(uuid, uuid, encrypted);
  } finally { database.close(); }
  const hash = createHash("sha256").update(await readFile(checkpointPath)).digest("hex");
  const decoded = await readNativeHistoryCheckpoint({ checkpointPath, expectedSha256: hash, projectUuid: history.projectUuid });
  const result = structuredClone(value);
  result.evidence = { ...result.evidence, history: decoded, checkpoint: { ...result.evidence.checkpoint,
    checkpoint: checkpointPath, checkpointSha256: hash, sourceSha256: hash, receiptPath: join(directory, `${name}.receipt.json`) } };
  return result;
}
