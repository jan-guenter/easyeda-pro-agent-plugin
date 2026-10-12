/* oxlint-disable import/max-dependencies -- Integration deliberately exercises real storage, checkpoint, SQL and retained authority leaves. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fsPromises, { readFile, readdir, rename, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { ClosedSymbolCopyStage } from "../src/closed-symbol-copy.ts";
import { copyFixture } from "./helpers/closed-symbol-copy-fixture.ts";
import type { Fixture } from "./helpers/closed-symbol-copy-fixture.ts";
import { appendClosedSymbolEvent, createClosedSymbolJournal, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { updateOperation } from "../src/artifacts.ts";
import { newOperationId } from "../src/core.ts";
import { assertIssuedClosedFileCopy } from "../src/closed-file-copy.ts";
import { readerCompletion } from "../src/sqlite-inventory.ts";
import { syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";

function copy(value: Fixture): ReturnType<ClosedSymbolCopyStage["copy"]> {
  return value.copyStage.copy(value.journal, "baseline-copy", value.generation, value.proof);
}
const digest = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

void test("concurrent copy attempts cannot dispatch a second checkpoint or raw copy", async () => {
  const value = await copyFixture();
  try {
    const first = copy(value);
    await assert.rejects(copy(value), /consumed/u);
    const result = await first;
    const files = await readdir(value.journal.journalPath.slice(0, -5));
    assert.equal(files.filter((entry) => entry.startsWith("closed-copy-")).length, 1);
    assert.equal(result.copy, value.copyStage.originalCopy(value.operationId, "baseline-copy"));
  } finally { await value.dispose(); }
});

void test("actual checkpoint, byte copy and isolated SQL reader preserve source and issue only evidence", async () => {
  const value = await copyFixture();
  const before = await readFile(value.source);
  try {
    const result = await copy(value);
    assert.equal(result.copy, value.copyStage.originalCopy(value.operationId, "baseline-copy"));
    assertIssuedClosedFileCopy(result.copy);
    assert.throws(() => { assertIssuedClosedFileCopy(structuredClone(result.copy)); }, /not issued/u);
    assert.equal(result.checkpoint.sourceSha256, digest(before));
    assert.equal(result.copy.sha256, digest(before));
    assert.equal(result.inventory.checkpointSha256, digest(before));
    assert.equal(readerCompletion(result.inventory).exitCode, 0);
    assert.deepEqual(await readFile(result.copy.artifact), before);
    assert.deepEqual(await readFile(value.source), before);
    assert.equal(result.executionAuthorized, false); assert.equal(result.completionProved, false);
    assert.equal(result.sourceProjectGenerationBindingVerified, false);
    const loaded = await loadClosedSymbolJournal(value.operationId);
    assert.equal(loaded.events.length, 10); assert.equal(loaded.events.at(-1)?.step, "baseline-copy");
    assert.deepEqual(loaded.events.at(-1)?.data, { copyReceipt: result.copy, sqlDigests: {
      checkpointSha256: result.inventory.checkpointSha256, schemaSha256: result.inventory.schemaSha256, logicalSha256: result.inventory.logicalSha256 } });
    assert.equal(loaded.journal.saved, false); assert.equal(loaded.journal.reopened, false);
    assert.equal(value.calls("normal-close"), 1); assert.equal(value.calls("prove-terminated"), 1);
    assert.equal(value.state.runtimeReads, 2);
    await assert.rejects(copy(value), /consumed/u);
    await assert.rejects(new ClosedSymbolCopyStage(value.engine, await syntheticSqlRuntime()).copy(value.journal, "baseline-copy", value.generation, value.proof), /consumed/u);
  } finally { await value.dispose(); }
});

for (const invalid of ["cloned-proof", "generation", "scope", "wrong-runtime"] as const) {
  void test(`${invalid} refuses without issuing copy evidence`, async () => {
    const value = await copyFixture();
    if (invalid === "cloned-proof") { value.proof = structuredClone(value.proof); }
    if (invalid === "generation") { Reflect.set(value.generation, "jobId", "9".repeat(32)); }
    if (invalid === "scope") { value.state.scope = true; }
    if (invalid === "wrong-runtime") { value.copyStage = new ClosedSymbolCopyStage(value.engine, { ...await syntheticSqlRuntime(), nodeSha256: "0".repeat(64) }); }
    try {
      await assert.rejects(copy(value));
      const original = value.copyStage.originalCopy(value.operationId, "baseline-copy");
      // Runtime qualification occurs in the SQL leaf after the raw copy has genuinely completed.
      assert.equal(original !== undefined, invalid === "wrong-runtime");
      if (original !== undefined) { assertIssuedClosedFileCopy(original); }
      const loaded = await loadClosedSymbolJournal(value.operationId);
      assert.equal(loaded.events.at(-1)?.kind, invalid === "wrong-runtime" ? "intent" : "result");
      assert.equal(loaded.journal.saved, false);
    } finally { await value.dispose(); }
  });
}

for (const mutation of ["changed-bytes", "same-byte-replacement"] as const) {
  void test(`${mutation} after checkpoint refuses; completed raw copy is retained when appropriate`, async (context) => {
    const value = await copyFixture(); const link = fsPromises.link; let changed = false;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      await link(...args);
      if (basename(String(args[1])) !== "09-baseline-copy-intent.json") { return; }
      const bytes = await readFile(value.source); changed = true;
      if (mutation === "changed-bytes") { bytes[bytes.length - 1] = bytes.at(-1) === 1 ? 2 : 1; await writeFile(value.source, bytes); }
      else { await rename(value.source, `${value.source}.original`); await writeFile(value.source, bytes, { mode: 0o600, flag: "wx" }); }
    }); syncBuiltinESMExports();
    try {
      await assert.rejects(copy(value), mutation === "changed-bytes" ? /hash/u : /lineage/u);
      assert.equal(changed, true);
      const original = value.copyStage.originalCopy(value.operationId, "baseline-copy");
      assert.equal(original !== undefined, mutation === "same-byte-replacement");
      if (original !== undefined) { assertIssuedClosedFileCopy(original); }
      const loaded = await loadClosedSymbolJournal(value.operationId);
      assert.equal(loaded.events.at(-1)?.kind, "intent");
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
  });
}

for (const boundary of ["after-checkpoint", "after-copy"] as const) {
  void test(`lost retained helper ${boundary} refuses and preserves any completed copy`, async (context) => {
    const value = await copyFixture(); const link = fsPromises.link; let changed = false;
    if (boundary === "after-checkpoint") {
      context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
        await link(...args);
        if (String(args[1]).endsWith(".checkpoint.json")) { changed = true; value.owner.behavior.helperLost = true; }
      }); syncBuiltinESMExports();
    } else {
      value.owner.behavior.onHelperCheck = (): Promise<void> => {
        if (value.copyStage.originalCopy(value.operationId, "baseline-copy") !== undefined) { changed = true; value.owner.behavior.helperLost = true; }
        return Promise.resolve();
      };
    }
    try {
      await assert.rejects(copy(value), /helper/u); assert.equal(changed, true);
      const original = value.copyStage.originalCopy(value.operationId, "baseline-copy");
      assert.equal(original !== undefined, boundary === "after-copy");
      if (original !== undefined) { assertIssuedClosedFileCopy(original); }
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
  });
}

for (const boundary of ["intent", "copy"] as const) {
  void test(`caller peer redirection at ${boundary} cannot overwrite the peer journal`, async (context) => {
    const value = await copyFixture(); const peer = await createClosedSymbolJournal(newOperationId(), value.journal.plan);
    peer.state = "completed"; await updateOperation(peer); const peerBytes = await readFile(peer.journalPath);
    const link = fsPromises.link; let changed = false;
    const mutate = (): void => { changed = true; value.journal.operationId = peer.operationId; value.journal.saved = true; };
    if (boundary === "intent") {
      context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
        await link(...args); if (basename(String(args[1])) === "09-baseline-copy-intent.json") { mutate(); }
      }); syncBuiltinESMExports();
    } else {
      value.owner.behavior.onHelperCheck = (): Promise<void> => {
        if (!changed && value.copyStage.originalCopy(value.operationId, "baseline-copy") !== undefined) { mutate(); }
        return Promise.resolve();
      };
    }
    try {
      await assert.rejects(copy(value), /caller changed/u); assert.equal(changed, true);
      assert.deepEqual(await readFile(peer.journalPath), peerBytes);
      assert.equal(value.copyStage.originalCopy(peer.operationId, "baseline-copy"), undefined);
      assert.equal(value.copyStage.originalCopy(value.operationId, "baseline-copy") !== undefined, boundary === "copy");
      const loaded = await loadClosedSymbolJournal(value.operationId);
      assert.equal(loaded.journal.saved, false);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
  });
}

void test("journal advancement after SQL result publication refuses stale stage admission", async (context) => {
  const value = await copyFixture(); const link = fsPromises.link; let changed = false, published = false;
  context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
    await link(...args); if (basename(String(args[1])) === "10-baseline-copy-result.json") { published = true; }
  }); syncBuiltinESMExports();
  value.owner.behavior.onHelperCheck = async (): Promise<void> => {
    if (!published || changed) { return; } changed = true;
    const loaded = await loadClosedSymbolJournal(value.operationId);
    await appendClosedSymbolEvent(loaded.journal, { step: "edit-launch", kind: "intent", generation: null,
      requestSha256: "a".repeat(64), data: { synthetic: "independent late journal advance, no launch" } });
  };
  try {
    await assert.rejects(copy(value), /journal advanced/u); assert.equal(changed, true);
    assert.ok(value.copyStage.originalCopy(value.operationId, "baseline-copy") !== undefined);
    const loaded = await loadClosedSymbolJournal(value.operationId);
    assert.equal(loaded.events.at(-1)?.step, "edit-launch");
  } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
});

for (const boundary of ["artifact", "journal-before", "journal-after"] as const) {
  void test(`result publication failure ${boundary} retains original issued copy and consumes attempt`, async (context) => {
    const value = await copyFixture(); const link = fsPromises.link, renameFile = fsPromises.rename; let updates = 0;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      if (boundary === "artifact" && basename(String(args[1])) === "10-baseline-copy-result.json") { throw new Error("Synthetic result publication refused"); }
      await link(...args);
    });
    context.mock.method(fsPromises, "rename", async (...args: Parameters<typeof renameFile>): Promise<void> => {
      if (basename(String(args[1])) === `${value.operationId}.json`) { updates += 1; }
      if (updates === 2 && boundary === "journal-before") { throw new Error("Synthetic result publication refused"); }
      await renameFile(...args);
      if (updates === 2 && boundary === "journal-after") { throw new Error("Synthetic result publication refused"); }
    }); syncBuiltinESMExports();
    try {
      await assert.rejects(copy(value), /publication/u);
      const retained = value.copyStage.originalCopy(value.operationId, "baseline-copy"); assert.ok(retained !== undefined);
      assertIssuedClosedFileCopy(retained); assert.equal(digest(await readFile(retained.artifact)), retained.sha256);
      await assert.rejects(copy(value), /consumed/u);
      const files = await readdir(value.journal.journalPath.slice(0, -5));
      assert.ok(files.some((entry) => entry.startsWith("closed-copy-")));
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); await value.dispose(); }
  });
}

for (const mutation of ["generation", "scope", "scope-method", "artifact"] as const) {
  void test(`late ${mutation} drift after raw-copy issuance cannot produce stage success`, async () => {
    const value = await copyFixture(); let changed = false;
    value.owner.behavior.onHelperCheck = async (): Promise<void> => {
      const retained = value.copyStage.originalCopy(value.operationId, "baseline-copy");
      if (changed || retained === undefined) { return; } changed = true;
      if (mutation === "generation") { Reflect.set(value.generation, "captureSha256", "0".repeat(64)); }
      if (mutation === "scope") { value.state.scope = true; }
      if (mutation === "scope-method") { value.upstream.currentAuthenticatedBridgeDispatchBinding = (): undefined => undefined; }
      if (mutation === "artifact") { await rename(retained.artifact, `${retained.artifact}.original`); await writeFile(retained.artifact, await readFile(`${retained.artifact}.original`), { flag: "wx", mode: 0o600 }); }
    };
    try {
      await assert.rejects(copy(value)); assert.equal(changed, true);
      const retained = value.copyStage.originalCopy(value.operationId, "baseline-copy"); assert.ok(retained !== undefined);
      assertIssuedClosedFileCopy(retained);
      const loaded = await loadClosedSymbolJournal(value.operationId);
      assert.equal(loaded.events.at(-1)?.kind, "intent");
      assert.equal(loaded.journal.saved, false);
    } finally { await value.dispose(); }
  });
}
