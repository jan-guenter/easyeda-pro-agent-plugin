import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { basename, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { createCheckpoint } from "../src/checkpoint.ts";
import { verifyFlatInverseCheckpoint } from "../src/flat-inverse-checkpoint.ts";

void test("last-boundary flat checkpoint proof rejects source, receipt and backup substitution", async () => {
  const root = controlDataDirectory(); assert.ok(basename(root).startsWith("easyeda-test-control-"));
  const directory = await mkdtemp(join(root, "flat-inverse-checkpoint-")), source = join(directory, "fixture.eprj2");
  const database = new DatabaseSync(source);
  try { database.exec("CREATE TABLE evidence(value TEXT); INSERT INTO evidence VALUES('baseline');"); }
  finally { database.close(); }
  const checkpoint = await createCheckpoint({ source, outputDir: join(root, "checkpoints"), label: "inverse-baseline" });
  await verifyFlatInverseCheckpoint(checkpoint, source);
  await assert.rejects(verifyFlatInverseCheckpoint(checkpoint, join(directory, "foreign.eprj2")), /another source/u);
  await assert.rejects(verifyFlatInverseCheckpoint({ ...checkpoint, sourceSha256: "0".repeat(64) }, source), /receipt changed/u);
  await assert.rejects(verifyFlatInverseCheckpoint({ ...checkpoint, checkpoint: source }, source), /receipt changed/u);
  const backup = new DatabaseSync(checkpoint.checkpoint);
  try { backup.exec("UPDATE evidence SET value='substituted';"); }
  finally { backup.close(); }
  await assert.rejects(verifyFlatInverseCheckpoint(checkpoint, source));
});
