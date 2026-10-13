import assert from "node:assert/strict";
import { test } from "node:test";
import { assertUnchangedLibraryCheckpoint } from "../src/library-checkpoint.ts";
import type { CheckpointReceipt } from "../src/checkpoint.ts";

const HASH = "a".repeat(64);
const RECEIPT: CheckpointReceipt = { schema: "easyeda-pro-control.checkpoint.v2", createdAt: "2026-10-10T00:00:00Z", source: "/fixture/project.eprj2",
  checkpoint: "/fixture/checkpoint.sqlite", receiptPath: "/fixture/receipt.json", sourceSha256: HASH, sourceDumpSha256: HASH,
  checkpointSha256: HASH, checkpointDumpSha256: HASH, receiptSha256: HASH,
  sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" }, checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" } };
const VALID = { ...RECEIPT, ok: true, sourceChanged: false, sourceMatchesReceipt: true, sourceEqualsCheckpoint: true, checkpointMatchesReceipt: true };
void test("library verification requires complete validity, not sourceChanged=false from a corrupt checkpoint", () => {
  assertUnchangedLibraryCheckpoint(VALID, RECEIPT, "invalid");
  for (const patch of [{ ok: false }, { checkpointMatchesReceipt: false }, { sourceEqualsCheckpoint: false }, { sourceMatchesReceipt: false },
    { sourceChanged: true }, { receiptPath: "/fixture/other.json" }, { checkpoint: "/fixture/other.sqlite" }, { source: "/fixture/other.eprj2" },
    { checkpointSha256: "b".repeat(64) }, { checkpointDumpSha256: "b".repeat(64) }]) {
    assert.throws(() => { assertUnchangedLibraryCheckpoint({ ...VALID, ...patch }, RECEIPT, "invalid"); }, /invalid/u);
  }
  assert.throws(() => { assertUnchangedLibraryCheckpoint({ sourceChanged: false }, RECEIPT, "invalid"); }, /invalid/u);
});
