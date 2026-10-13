/* oxlint-disable import/max-dependencies -- Exercise the actual journal, copy and artifact checks with synthetic retained bytes instead of injected proof callbacks. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fsPromises, { readFile, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { loadOperation, updateOperation } from "../src/artifacts.ts";
import { assertIssuedClosedFileCopy } from "../src/closed-file-copy.ts";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";
import { createClosedSymbolJournal, loadClosedSymbolHistoricalPhaseJournal, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { inspectRecordedClosedCopy } from "../src/closed-symbol-recorded-copy.ts";
import { parseClosedSymbolTerminalEnvelope } from "../src/closed-symbol-terminal-shape.ts";
import { terminalFixture, terminalPlan } from "./helpers/closed-symbol-terminal-fixture.ts";

let retained: Awaited<ReturnType<typeof terminalFixture>> | undefined;
before(async (): Promise<void> => { retained = await terminalFixture(); });
function fixture(): Awaited<ReturnType<typeof terminalFixture>> { assert.ok(retained !== undefined); return retained; }
void test("phase-only loader returns actual terminal storage and the exact44 predecessor without a completion claim", async () => {
  const f = fixture(), loaded = await loadClosedSymbolHistoricalPhaseJournal(f.predecessor.operationId);
  assert.equal(loaded.terminalOutcomeVerified, false); assert.equal(loaded.events.length, 44);
  assert.deepEqual(loaded.journal, f.stored); assert.deepEqual(loaded.predecessor, f.predecessor);
  assert.notEqual(canonicalJson(loaded.journal), canonicalJson(loaded.predecessor));
  await assert.rejects(loadClosedSymbolJournal(f.predecessor.operationId), /terminal artifact/u);
});
for (const phase of ["baseline-copy", "edit-copy", "verify-copy"] as const) {
  void test(`unchanged historical reader handles terminal ${phase} without recursive completion or restored authority`, async () => {
    const f = fixture(), paths = [f.predecessor.journalPath, f.terminalArtifact.path, ...f.predecessor.artifacts.map((item) => item.path)];
    const beforeBytes = await Promise.all(paths.map((path) => readFile(path)));
    const result = await inspectRecordedClosedCopy({ operationId: f.predecessor.operationId, phase, runtime: await syntheticSqlRuntime() });
    assert.equal(result.inventory.properties["schema_version"], 99);
    assert.equal(result.evidence["historicalEvidenceVerified"], true);
    for (const key of ["copyAuthorityRestored", "closureAuthorityRestored", "sourceProjectGenerationBindingVerified", "executionAuthorized", "replayAllowed", "completionProved"]) { assert.equal(result.evidence[key], false); }
    assert.throws(() => { assertIssuedClosedFileCopy(structuredClone(f.copy)); }, /not issued/u);
    assert.deepEqual(await Promise.all(paths.map((path) => readFile(path))), beforeBytes);
  });
}
void test("nonterminal phase loading preserves prefix behavior and refuses reserved terminalArtifact", async () => {
  const f = fixture(), id = `${f.predecessor.operationId}-prefix`;
  const journal = await createClosedSymbolJournal(id, terminalPlan(f.predecessor.plan.projectPath));
  const loaded = await loadClosedSymbolHistoricalPhaseJournal(id);
  assert.equal(loaded.events.length, 0); assert.equal(loaded.terminalOutcomeVerified, false); assert.strictEqual(loaded.journal, loaded.predecessor);
  journal["terminalArtifact"] = f.terminalArtifact; await updateOperation(journal);
  await assert.rejects(loadClosedSymbolHistoricalPhaseJournal(id), /Nonterminal/u);
  await assert.rejects(loadClosedSymbolJournal(id), /Nonterminal/u);
});
for (const changed of ["missing", "corrupt", "extra-outcome", "wrong-body-digest"] as const) {
  void test(`terminal phase inspection refuses ${changed} fixed45 evidence`, async () => {
    const f = await terminalFixture();
    if (changed === "missing") { await fsPromises.rename(f.terminalArtifact.path, `${f.terminalArtifact.path}.retained`); }
    else if (changed === "corrupt") { await writeFile(f.terminalArtifact.path, "corrupt"); }
    else {
      const body = changed === "extra-outcome" ? { ...f.envelope.body, outcome: { ...f.envelope.body.outcome, completionProved: true } } : f.envelope.body;
      const encoded = `${JSON.stringify({ ...f.envelope, body, bodySha256: changed === "wrong-body-digest" ? "0".repeat(64) : sha256Json(body) })}\n`;
      await writeFile(f.terminalArtifact.path, encoded);
      const terminalArtifact = { path: f.terminalArtifact.path, bytes: Buffer.byteLength(encoded), sha256: sha256Text(encoded) };
      await updateOperation({ ...f.stored, terminalArtifact });
    }
    await assert.rejects(loadClosedSymbolHistoricalPhaseJournal(f.predecessor.operationId));
  });
}
void test("historical terminal copy retains the actual journal race check rather than comparing normalized predecessors", async (context) => {
  const f = await terminalFixture(), runtime = await syntheticSqlRuntime();
  const original = fsPromises.lstat; let changed = false, checks = 0;
  context.mock.method(fsPromises, "lstat", async (...args: Parameters<typeof original>) => {
    const value = await original(...args);
    if (basename(String(args[0])) === basename(f.copy.artifact)) {
      checks += 1;
      if (checks === 4) {
        const body = { ...f.envelope.body, recordedAt: new Date(Date.parse(f.envelope.body.recordedAt) + 1).toISOString() };
        const envelope = parseClosedSymbolTerminalEnvelope({ ...f.envelope, body, bodySha256: sha256Json(body) });
        const encoded = `${JSON.stringify(envelope)}\n`;
        await writeFile(f.terminalArtifact.path, encoded);
        const terminalArtifact = { path: f.terminalArtifact.path, bytes: Buffer.byteLength(encoded), sha256: sha256Text(encoded) };
        await updateOperation({ ...f.stored, updatedAt: body.recordedAt, terminalArtifact }); changed = true;
      }
    }
    return value;
  }); syncBuiltinESMExports();
  try {
    await assert.rejects(inspectRecordedClosedCopy({ operationId: f.predecessor.operationId, phase: "baseline-copy", runtime }), /journal changed/u);
    assert.equal(changed, true);
  } finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
  const final = await loadClosedSymbolHistoricalPhaseJournal(f.predecessor.operationId);
  assert.deepEqual(final.predecessor, f.predecessor); assert.notDeepEqual(final.journal, f.stored);
});
void test("terminal phase inspection still rehashes all44 phase artifacts", async () => {
  const f = await terminalFixture(), last = f.predecessor.artifacts.at(-1); assert.ok(last !== undefined);
  await writeFile(last.path, "{}\n");
  await assert.rejects(loadClosedSymbolHistoricalPhaseJournal(f.predecessor.operationId), /hash verification/u);
});
void test("terminal phase inspection refuses a resealed unknown predecessor change", async () => {
  const f = await terminalFixture(); await updateOperation({ ...f.stored, syntheticUnknown: { changed: true } });
  const changed = await loadOperation(f.predecessor.operationId);
  assert.notEqual(changed["journalSha256"], f.stored["journalSha256"]);
  await assert.rejects(loadClosedSymbolHistoricalPhaseJournal(f.predecessor.operationId), /entire predecessor/u);
});
void test("fresh Node reads terminal copy evidence without old issuer registries or recursion", async () => {
  const f = fixture(); const beforeBytes = await readFile(f.predecessor.journalPath);
  const { promise, reject, resolve } = Promise.withResolvers<{ stdout: string; stderr: string }>();
  execFile(process.execPath, [fileURLToPath(new URL("helpers/closed-symbol-terminal-copy-child.ts", import.meta.url)), syntheticSqlRoot(), f.predecessor.operationId],
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Await the bounded actual Node child callback; never spawn Windows or a native helper.
    { env: { NODE_NO_WARNINGS: "1" }, maxBuffer: 32_768, timeout: 30_000 }, (error, stdout, stderr) => {
      if (error === null) { resolve({ stdout, stderr }); } else { reject(new Error("Synthetic terminal restart child failed.", { cause: error })); }
    });
  const result = await promise; const data: unknown = JSON.parse(result.stdout); assert.ok(isRecord(data) && isRecord(data["evidence"]));
  assert.notEqual(data["childPid"], process.pid); assert.equal(data["copyBrandRejected"], true); assert.equal(result.stderr, "");
  assert.equal(data["evidence"]["completionProved"], false); assert.equal(data["evidence"]["executionAuthorized"], false);
  assert.deepEqual(await readFile(f.predecessor.journalPath), beforeBytes);
});
