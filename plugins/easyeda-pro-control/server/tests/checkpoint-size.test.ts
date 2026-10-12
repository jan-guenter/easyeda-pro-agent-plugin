import assert from "node:assert/strict";
import fsPromises, { mkdtemp, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { createCheckpoint } from "../src/checkpoint.ts";
import type { CheckpointAccessPolicy } from "../src/checkpoint.ts";
import { syntheticSqlRoot } from "./helpers/sqlite-inventory-fixture.ts";

async function fixture(): Promise<{ source: string; outputDir: string; size: number; policy: CheckpointAccessPolicy & { maximumSourceBytes: number } }> {
  const directory = await mkdtemp(join(syntheticSqlRoot(), "checkpoint-byte-limit-"));
  const outputDir = join(directory, "checkpoints"), source = join(directory, "synthetic.eprj2");
  const database = new DatabaseSync(source);
  database.exec("CREATE TABLE synthetic(value TEXT); INSERT INTO synthetic VALUES('not native project data')"); database.close();
  const info = await stat(source), size = info.size;
  return { source, outputDir, size, policy: { expectedSource: source, artifactRoots: [outputDir], maximumSourceBytes: size } };
}

void test("checkpoint refuses a source exceeding its exact bound without producing output", async () => {
  const value = await fixture(); value.policy.maximumSourceBytes = value.size - 1;
  const before = await readFile(value.source);
  await assert.rejects(createCheckpoint({ source: value.source, outputDir: value.outputDir, label: "bounded" }, value.policy), /exceeds its byte limit/u);
  await assert.rejects(stat(value.outputDir), { code: "ENOENT" });
  assert.deepEqual(await readFile(value.source), before);
});

void test("source size refusal precedes SQLite parsing of the retained file", async () => {
  const value = await fixture(); await writeFile(value.source, "not a sqlite database"); value.policy.maximumSourceBytes = 1;
  await assert.rejects(createCheckpoint({ source: value.source, outputDir: value.outputDir, label: "before-sqlite" }, value.policy), /exceeds its byte limit/u);
  await assert.rejects(stat(value.outputDir), { code: "ENOENT" });
});

for (const bound of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]) {
  void test(`invalid byte bound ${String(bound)} refuses before opening a missing source`, async () => {
    const value = await fixture(); value.policy.maximumSourceBytes = bound;
    const missing = `${value.source}.missing.eprj2`; value.policy = { ...value.policy, expectedSource: missing };
    await assert.rejects(createCheckpoint({ source: missing, outputDir: value.outputDir, label: "invalid" }, value.policy), /positive safe integer/u);
  });
}

for (const selection of ["exact", "larger", "default"] as const) {
  void test(`${selection} bound preserves actual checkpoint success and source bytes`, async () => {
    const value = await fixture(); const before = await readFile(value.source);
    if (selection === "larger") { value.policy.maximumSourceBytes += 1; }
    const policy = selection === "default" ? { expectedSource: value.source, artifactRoots: [value.outputDir] } : value.policy;
    const receipt = await createCheckpoint({ source: value.source, outputDir: value.outputDir, label: "accepted" }, policy);
    assert.equal(receipt.source, value.source); assert.deepEqual(receipt["quickCheck"], { sourceBefore: "ok", sourceAfter: "ok", checkpoint: "ok" });
    assert.deepEqual(await readFile(value.source), before);
  });
}

void test("policy byte bound is captured before the first source-open await", async (context) => {
  const value = await fixture(); const open = fsPromises.open; let changed = false;
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
    const file = await open(...args);
    if (!changed && basename(String(args[0])) === basename(value.source)) { changed = true; value.policy.maximumSourceBytes = 1; }
    return file;
  }); syncBuiltinESMExports();
  try {
    const receipt = await createCheckpoint({ source: value.source, outputDir: value.outputDir, label: "captured" }, value.policy);
    assert.equal(changed, true); assert.equal(receipt.source, value.source);
  } finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
});
void test("source growth after initial admission is refused at final snapshot and unpublished artifacts are cleaned", async (context) => {
  const value = await fixture(); const open = fsPromises.open; let changed = false;
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
    const file = await open(...args);
    if (!changed && basename(String(args[0])) === basename(value.outputDir)) {
      changed = true;
      const database = new DatabaseSync(value.source);
      database.exec("INSERT INTO synthetic VALUES(zeroblob(32768))"); database.close();
    }
    return file;
  }); syncBuiltinESMExports();
  try {
    await assert.rejects(createCheckpoint({ source: value.source, outputDir: value.outputDir, label: "grew" }, value.policy), /exceeds its byte limit/u);
    assert.equal(changed, true);
    const current = await stat(value.source); assert.ok(current.size > value.size);
    assert.deepEqual(await readdir(value.outputDir), []);
  } finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
});
