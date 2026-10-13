import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile } from "node:fs/promises";
import { basename, isAbsolute, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { createCheckpoint, verifyCheckpoint } from "../src/checkpoint.ts";
import { assertUnchangedLibraryCheckpoint } from "../src/library-checkpoint.ts";
import { prepareFlatDisplayProfile, verifyFlatDisplayObservation } from "../src/flat-display-profile.ts";
import { context, fixture, operation, replaceSource } from "./flat-display-fixture.ts";

void test("flat profile accepts a real logically exact SQLite backup with different file bytes and rejects later physical-only source drift", async () => {
  const testRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(testRoot !== undefined && isAbsolute(testRoot) && basename(testRoot).startsWith("easyeda-test-control-"),
    "This test requires the private test-isolation preload root.");
  const directory = await mkdtemp(join(testRoot, "flat-checkpoint-"));
  const source = join(directory, "synthetic.eprj2");
  const policy = { expectedSource: source, artifactRoots: [directory] };
  const database = new DatabaseSync(source);
  try {
    // Each statement commits through SQLite, advancing source header counters.
    // No raw header patch or real EasyEDA design is used in this fixture.
    database.exec("PRAGMA journal_mode=DELETE; CREATE TABLE evidence(value TEXT); INSERT INTO evidence VALUES ('first'); UPDATE evidence SET value='second'; UPDATE evidence SET value='final';");
    const receipt = await createCheckpoint({ source, outputDir: join(directory, "checkpoints"), label: "flat-backup" }, policy);
    assert.notEqual(receipt.sourceSha256, receipt.checkpointSha256);
    assert.equal(receipt.sourceDumpSha256, receipt.checkpointDumpSha256);
    assert.equal(createHash("sha256").update(await readFile(source)).digest("hex"), receipt.sourceSha256);
    assert.equal(createHash("sha256").update(await readFile(receipt.checkpoint)).digest("hex"), receipt.checkpointSha256);
    const verified = await verifyCheckpoint(receipt.receiptPath, policy);
    assertUnchangedLibraryCheckpoint(verified, receipt, "Synthetic checkpoint must retain both exact files.");
    assert.equal(verified.sourceSha256, receipt.sourceSha256);
    assert.equal(verified.checkpointSha256, receipt.checkpointSha256);
    assert.equal(verified.sourceDumpSha256, verified.checkpointDumpSha256);

    // This generic SQLite database supplies only the actual receipt.
    // Schematic history and native observations remain the synthetic test model.
    const before = fixture(), expectedContext = { ...context, project: { ...context.project, path: source } };
    before.evidence = { ...before.evidence, checkpoint: receipt,
      history: { ...before.evidence.history, checkpointSha256: receipt.checkpointSha256 } };
    const prepared = await prepareFlatDisplayProfile({ ...before, operation, context: expectedContext });
    assert.equal(prepared.binding.checkpoint.sourceSha256, receipt.sourceSha256);
    assert.equal(prepared.binding.checkpoint.checkpointSha256, receipt.checkpointSha256);
    assert.equal(prepared.binding.checkpoint.sourceDumpSha256, receipt.sourceDumpSha256);
    assert.equal(prepared.binding.checkpoint.checkpointDumpSha256, receipt.checkpointDumpSha256);
    assert.equal(prepared.binding.checkpoint.receiptPath, receipt.receiptPath);
    assert.equal(prepared.binding.checkpoint.receiptSha256, receipt.receiptSha256);
    assert.doesNotThrow(() => { verifyFlatDisplayObservation(prepared.binding, operation, expectedContext, before.evidence, before.native, "before"); });
    const after = replaceSource(before, prepared.expectedSource, prepared.expectedNative);
    assert.doesNotThrow(() => { verifyFlatDisplayObservation(prepared.binding, operation, expectedContext, after.evidence, after.native, "after"); });

    database.exec("VACUUM;");
    const changed = await verifyCheckpoint(receipt.receiptPath, policy);
    assert.equal(changed.ok, false);
    assert.equal(changed.sourceChanged, true);
    assert.equal(changed.sourceMatchesReceipt, false);
    assert.equal(changed.checkpointMatchesReceipt, true);
    assert.equal(changed.sourceEqualsCheckpoint, true);
    assert.notEqual(changed.sourceSha256, receipt.sourceSha256);
    assert.equal(changed.checkpointSha256, receipt.checkpointSha256);
    assert.equal(changed.sourceDumpSha256, receipt.sourceDumpSha256);
    assert.equal(changed.checkpointDumpSha256, receipt.checkpointDumpSha256);
    assert.throws(() => { assertUnchangedLibraryCheckpoint(changed, receipt, "Synthetic source changed after its receipt."); }, /source changed/u);
  } finally {
    database.close();
  }
});
