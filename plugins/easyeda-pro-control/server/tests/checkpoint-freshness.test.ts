import assert from "node:assert/strict";
import { mkdtemp, open, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { createCheckpoint, verifyCheckpoint } from "../src/checkpoint.ts";

function registerSourceCommitCase(mode: "DELETE" | "WAL", phase: "creation" | "verification"): void {
  void test(`checkpoint ${phase} rejects a ${mode} commit after its snapshot`, async () => {
    const directory = await mkdtemp("/tmp/easyeda-checkpoint-freshness-");
    const source = join(directory, "source.eprj2");
    const outputDir = join(directory, "checkpoints");
    const database = new DatabaseSync(source);
    try {
      database.exec(`PRAGMA journal_mode=${mode}; CREATE TABLE evidence(value TEXT); INSERT INTO evidence VALUES ('before');`);
      const commit = (): Promise<void> => {
        database.exec("UPDATE evidence SET value = 'after';");
        return Promise.resolve();
      };
      if (phase === "creation") {
        await assert.rejects(
          createCheckpoint({ source, outputDir, label: "freshness" }, undefined, commit),
          /source.*changed/iu,
        );
        assert.deepEqual(await readdir(outputDir), []);
      } else {
        const receipt = await createCheckpoint({ source, outputDir, label: "freshness" });
        await assert.rejects(
          verifyCheckpoint(receipt.receiptPath, undefined, commit),
          /source.*changed/iu,
        );
      }
    } finally {
      database.close();
      await rm(directory, { recursive: true, force: true });
    }
  });
}

for (const mode of ["DELETE", "WAL"] as const) {
  for (const phase of ["creation", "verification"] as const) {
    registerSourceCommitCase(mode, phase);
  }
}

void test("checkpoint verification rejects a checkpoint modified after hashing", async () => {
  const directory = await mkdtemp("/tmp/easyeda-checkpoint-artifact-freshness-");
  const source = join(directory, "source.eprj2");
  const outputDir = join(directory, "checkpoints");
  const database = new DatabaseSync(source);
  try {
    database.exec("CREATE TABLE evidence(value TEXT); INSERT INTO evidence VALUES ('before');");
    const receipt = await createCheckpoint({ source, outputDir, label: "freshness" });
    await assert.rejects(
      verifyCheckpoint(receipt.receiptPath, undefined, async () => {
        const bytes = await readFile(receipt.checkpoint);
        await writeFile(receipt.checkpoint, bytes);
      }),
      /artifact.*changed/iu,
    );
  } finally {
    database.close();
    await rm(directory, { recursive: true, force: true });
  }
});

void test("checkpoint verification rejects source replacement after its snapshot", async () => {
  const directory = await mkdtemp("/tmp/easyeda-checkpoint-path-freshness-");
  const source = join(directory, "source.eprj2");
  const outputDir = join(directory, "checkpoints");
  const database = new DatabaseSync(source);
  try {
    database.exec("CREATE TABLE evidence(value TEXT); INSERT INTO evidence VALUES ('before');");
    const receipt = await createCheckpoint({ source, outputDir, label: "freshness" });
    await assert.rejects(
      verifyCheckpoint(receipt.receiptPath, undefined, async () => {
        const bytes = await readFile(source);
        await rename(source, `${source}.displaced`);
        await writeFile(source, bytes);
      }),
      /source.*identity.*changed/iu,
    );
  } finally {
    database.close();
    await rm(directory, { recursive: true, force: true });
  }
});

void test("checkpoint receipt reads reject oversized sparse files before allocation", async () => {
  const directory = await mkdtemp("/tmp/easyeda-checkpoint-receipt-limit-");
  const path = join(directory, "oversized.checkpoint.json");
  const handle = await open(path, "wx", 0o600);
  try {
    await handle.truncate(1024 * 1024 + 1);
    await assert.rejects(verifyCheckpoint(path), /byte limit/iu);
  } finally {
    await handle.close();
    await rm(directory, { recursive: true, force: true });
  }
});
