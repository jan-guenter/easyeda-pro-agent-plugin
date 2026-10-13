/* oxlint-disable import/max-dependencies -- These integration tests exercise actual journal, closure, copy and SQL-reader modules rather than fake substitutes. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import fsPromises, { chmod, link, mkdtemp, readFile, rename, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { mock, test } from "node:test";
import { fileURLToPath } from "node:url";
import { operationPath } from "../src/artifacts.ts";
import { assertIssuedClosedFileCopy, copyClosedProjectBytes } from "../src/closed-file-copy.ts";
import { readClosedCopySqlInventory } from "../src/closed-file-sql.ts";
import { FAMILY, STEPS, appendClosedSymbolEvent, createClosedSymbolJournal, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import type { AppendInput, ClosedJournal, ClosedSymbolPlan, Generation, LaunchGeneration } from "../src/closed-symbol-journal.ts";
import { canonicalJson, isRecord, newOperationId, sha256Json } from "../src/core.ts";
import { readerCompletion } from "../src/sqlite-inventory.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";
import { mintSyntheticClosedSessionProof } from "./helpers/windows-closed-session-fixture.ts";
import { inspectRecordedClosedCopy } from "../src/closed-symbol-recorded-copy.ts";

const digest = "a".repeat(64), project = "b".repeat(64), target = "c".repeat(32);
function plan(projectPath: string): ClosedSymbolPlan {
  return { profile: FAMILY, projectUuid: project, branchUuid: "d".repeat(32), ownerUuid: "e".repeat(32), targetUuid: target, activeUuid: "f".repeat(32), projectPath,
    operation: { id: "rename-synthetic", action: "library.symbol.modify", libraryUuid: project, target: { uuid: target }, patch: { name: "Historical Ω" } },
    marker: { namespaceNonce: "1".repeat(64), keyNonce: "2".repeat(64), bodyNonce: "3".repeat(64) }, nativePinsSha256: digest, facadeSha256: digest, expectedFingerprintSha256: digest };
}
function phaseInput(journal: ClosedJournal): AppendInput {
  const step = STEPS[Math.floor(journal.sequence / 2)]; assert.ok(step !== undefined);
  const kind = journal.sequence % 2 === 0 ? "intent" : "result";
  let ordinal = 2;
  if (step.startsWith("baseline-")) { ordinal = 0; }
  else if (step.startsWith("edit-")) { ordinal = 1; }
  const jobId = String(ordinal + 1).repeat(32);
  const launch: LaunchGeneration = { ordinal, helperInstance: "a".repeat(32), jobId, rootPid: ordinal + 100, rootStartIdentity: `win32:13436257345960252${String(ordinal)}:job:${jobId}` };
  const full: Generation = { ...launch, runtimeSha256: digest, sessionSha256: digest, captureSha256: digest };
  let generation: LaunchGeneration | Generation | null = full;
  if (step.endsWith("-launch")) { generation = kind === "intent" ? null : launch; }
  else if (step.endsWith("-admission") && kind === "intent") { generation = launch; }
  const launchReceipt = { jobId, helperInstance: launch.helperInstance, root: { pid: launch.rootPid, role: "easyeda-main", startIdentity: launch.rootStartIdentity } };
  return { step, kind, generation, requestSha256: sha256Json({ step }), data: step.endsWith("-launch") && kind === "result" ? { launchReceipt, launchReceiptSha256: sha256Json(launchReceipt) } : { syntheticOnly: true } };
}
async function fixture(mutate?: (data: Record<string, unknown>) => void): Promise<{
  journal: ClosedJournal; source: string; copy: Awaited<ReturnType<typeof copyClosedProjectBytes>>;
  authority: Awaited<ReturnType<typeof mintSyntheticClosedSessionProof>>["fixture"];
}> {
  const directory = await mkdtemp(join(syntheticSqlRoot(), "recorded-copy-"));
  const source = join(directory, "source.eprj2");
  const database = new DatabaseSync(source, { defensive: false });
  try { database.exec("CREATE TABLE t(value); INSERT INTO t(rowid,value) VALUES(55,'historical'); PRAGMA schema_version=99"); }
  finally { database.close(); }
  const journal = await createClosedSymbolJournal(newOperationId(), plan(source));
  while (journal.sequence < 9) { await appendClosedSymbolEvent(journal, phaseInput(journal)); }
  const { fixture: authority, proof } = await mintSyntheticClosedSessionProof();
  const expectedSourceSha256 = createHash("sha256").update(await readFile(source)).digest("hex");
  const copy = await copyClosedProjectBytes({ source, expectedSourceSha256, artifactDirectory: operationPath(journal.operationId).slice(0, -5), closureProof: proof });
  const inventory = await readClosedCopySqlInventory({ copy, runtime: await syntheticSqlRuntime() });
  const data: Record<string, unknown> = { copyReceipt: structuredClone(copy), sqlDigests: { checkpointSha256: inventory.checkpointSha256, schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256 } };
  mutate?.(data);
  await appendClosedSymbolEvent(journal, { ...phaseInput(journal), data });
  return { journal, source, copy, authority };
}
function bytes(journal: ClosedJournal): Promise<Buffer[]> { return Promise.all([journal.journalPath, ...journal.artifacts.map((entry) => entry.path)].map((path) => readFile(path))); }

void test("recorded copy reconstructs only fresh SQL evidence and preserves every retained byte", async () => {
  const { journal, copy } = await fixture(); const before = await bytes(journal);
  const result = await inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "baseline-copy", runtime: await syntheticSqlRuntime() });
  assert.equal(result.inventory.properties["schema_version"], 99);
  assert.deepEqual(result.inventory.tables[0]?.rows[0]?.rowid, { kind: "integer", decimal: "55" });
  assert.equal(readerCompletion(result.inventory).observedChildClose, true);
  for (const name of ["copyAuthorityRestored", "closureAuthorityRestored", "sourceProjectGenerationBindingVerified", "executionAuthorized", "replayAllowed", "completionProved"]) { assert.equal(result.evidence[name], false); }
  assert.throws(() => { assertIssuedClosedFileCopy(structuredClone(copy)); }, /not issued/u);
  assert.deepEqual(await bytes(journal), before);
});
void test("historical source removal and later synthetic launch do not become new source authority", async () => {
  const { journal, source, authority } = await fixture();
  await rename(source, `${source}.retained`); await authority.supervisor.launch({ confirmLaunch: true });
  const result = await inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "baseline-copy", runtime: await syntheticSqlRuntime() });
  assert.equal(result.evidence["historicalEvidenceVerified"], true); assert.equal(result.evidence["sourceProjectGenerationBindingVerified"], false);
});
void test("an actual fresh Node process reads evidence but cannot revive the old copy brand", async () => {
  const { journal } = await fixture(); const before = await bytes(journal);
  const { promise, resolve, reject } = Promise.withResolvers<{ stdout: string; stderr: string }>();
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Node execFile exposes its bounded process completion through this callback.
  execFile(process.execPath, [fileURLToPath(new URL("helpers/closed-symbol-recorded-copy-child.ts", import.meta.url)), syntheticSqlRoot(), journal.operationId], { env: { NODE_NO_WARNINGS: "1" }, maxBuffer: 32_768, timeout: 30_000 }, (error, stdout, stderr) => { if (error === null) { resolve({ stdout, stderr }); } else { reject(new Error("Synthetic restart process failed.", { cause: error })); } });
  const result = await promise;
  const value: unknown = JSON.parse(result.stdout); assert.ok(isRecord(value) && isRecord(value["evidence"]));
  assert.notEqual(value["childPid"], process.pid); assert.equal(value["copyBrandRejected"], true);
  assert.equal(value["evidence"]["executionAuthorized"], false); assert.equal(result.stderr, ""); assert.deepEqual(await bytes(journal), before);
});
for (const kind of ["replace", "bytes", "mode", "hardlink", "wal", "shm", "journal"] as const) {
  void test(`historical copy refuses artifact ${kind}`, async () => {
    const { journal, copy } = await fixture();
    if (kind === "replace") { const value = await readFile(copy.artifact); await rename(copy.artifact, `${copy.artifact}.retained`); await writeFile(copy.artifact, value, { mode: 0o600, flag: "wx" }); }
    else if (kind === "bytes") { await writeFile(copy.artifact, "changed"); }
    else if (kind === "mode") { await chmod(copy.artifact, 0o640); }
    else if (kind === "hardlink") { await link(copy.artifact, `${copy.artifact}.link`); }
    else { await writeFile(`${copy.artifact}-${kind}`, "synthetic", { mode: 0o600, flag: "wx" }); }
    const before = await bytes(journal);
    await assert.rejects(inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "baseline-copy", runtime: await syntheticSqlRuntime() }), /identity|sidecar/u);
    assert.deepEqual(await bytes(journal), before);
  });
}
for (const kind of ["source", "outside", "basename", "receipt-hash", "flags", "bytes", "identity", "digest-shape", "checkpoint-digest", "schema-digest", "logical-digest", "extra-data"] as const) {
  void test(`exact sealed historical data refuses ${kind}`, async () => {
    const { journal } = await fixture((data) => {
      const copy = data["copyReceipt"], digests = data["sqlDigests"]; assert.ok(isRecord(copy) && isRecord(digests));
      if (kind === "source") { copy["source"] = "/not-opened.eprj2"; }
      else if (kind === "outside") { copy["artifact"] = "/not-opened.eprj2"; }
      else if (kind === "basename") { copy["artifact"] = String(copy["artifact"]).replace("closed-copy-", "other-copy-"); }
      else if (kind === "receipt-hash") { copy["receiptSha256"] = "b".repeat(64); }
      else if (kind === "flags") { copy["executionAuthorized"] = true; }
      else if (kind === "bytes") { copy["bytes"] = 0; }
      else if (kind === "identity") { const identity = copy["artifactIdentity"]; assert.ok(isRecord(identity)); identity["links"] = "2"; }
      else if (kind === "digest-shape") { digests["authority"] = true; }
      else if (kind === "checkpoint-digest") { digests["checkpointSha256"] = "b".repeat(64); }
      else if (kind === "schema-digest") { digests["schemaSha256"] = "b".repeat(64); }
      else if (kind === "logical-digest") { digests["logicalSha256"] = "b".repeat(64); }
      else { data["authority"] = true; }
      if (kind !== "receipt-hash") { const { receiptSha256: _omitted, ...payload } = copy; copy["receiptSha256"] = sha256Json(payload); }
    });
    const before = await bytes(journal);
    await assert.rejects(inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "baseline-copy", runtime: await syntheticSqlRuntime() }), /Recorded copy/u);
    assert.deepEqual(await bytes(journal), before);
  });
}
void test("missing phase and wrong runtime refuse, with the journal unchanged", async () => {
  const { journal } = await fixture(); const before = canonicalJson(journal); const runtime = await syntheticSqlRuntime();
  await assert.rejects(inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "verify-copy", runtime }), /absent/u);
  await assert.rejects(inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "baseline-copy", runtime: { ...runtime, nodeSha256: "b".repeat(64) } }), /hash|fingerprint/u);
  assert.equal(canonicalJson(journal), before);
});
for (const phase of ["edit-copy", "verify-copy"] as const) {
  void test(`historical ${phase} selects its exact retained result without restoring a generation`, async () => {
    const { journal } = await fixture();
    const loaded = await loadClosedSymbolJournal(journal.operationId);
    const data = loaded.events[9]?.data; assert.ok(data !== undefined);
    const count = (STEPS.indexOf(phase) + 1) * 2;
    while (journal.sequence < count) {
      const input = phaseInput(journal);
      await appendClosedSymbolEvent(journal, input.step === phase && input.kind === "result" ? { ...input, data } : input);
    }
    const before = await bytes(journal);
    const result = await inspectRecordedClosedCopy({ operationId: journal.operationId, phase, runtime: await syntheticSqlRuntime() });
    assert.equal(result.evidence["phase"], phase); assert.equal(result.evidence["closureAuthorityRestored"], false); assert.deepEqual(await bytes(journal), before);
  });
}
for (const field of ["uid", "gid"] as const) {
  void test(`late observed artifact ${field} drift refuses without chown privilege`, async () => {
    const { journal, copy } = await fixture(); const runtime = await syntheticSqlRuntime();
    const original = fsPromises.lstat; let checks = 0;
    const spy = mock.method(fsPromises, "lstat", async (...args: Parameters<typeof original>) => {
      const value = await original(...args);
      if (basename(String(args[0])) === basename(copy.artifact)) {
        checks += 1;
        if (checks === 6) { const previous = value[field]; assert.equal(typeof previous, "bigint"); Object.defineProperty(value, field, { value: BigInt(previous) + 1n }); }
      }
      return value;
    });
    syncBuiltinESMExports();
    try {
      await assert.rejects(inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "baseline-copy", runtime }), /identity changed/u);
      assert.ok(checks >= 6);
    } finally { spy.mock.restore(); syncBuiltinESMExports(); }
  });
}
void test("a concurrently advanced sealed journal refuses the old inspection result", async () => {
  const { journal, copy } = await fixture(); const runtime = await syntheticSqlRuntime();
  const original = fsPromises.lstat; let checks = 0;
  const spy = mock.method(fsPromises, "lstat", async (...args: Parameters<typeof original>) => {
    const value = await original(...args);
    if (basename(String(args[0])) === basename(copy.artifact)) {
      checks += 1;
      if (checks === 4) { await appendClosedSymbolEvent(journal, phaseInput(journal)); }
    }
    return value;
  });
  syncBuiltinESMExports();
  try {
    await assert.rejects(inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "baseline-copy", runtime }), /journal changed/u);
    assert.equal(journal.sequence, 11);
  } finally { spy.mock.restore(); syncBuiltinESMExports(); }
});
void test("failure to close the retained operation directory prevents an evidence result", async () => {
  const { journal, copy } = await fixture(); const runtime = await syntheticSqlRuntime();
  const originalOpen = fsPromises.open; const originalStat = fsPromises.lstat;
  const retained: (() => Promise<void>)[] = []; let checks = 0, injected = false;
  const statSpy = mock.method(fsPromises, "lstat", async (...args: Parameters<typeof originalStat>) => {
    const result = await originalStat(...args);
    if (basename(String(args[0])) === basename(copy.artifact)) { checks += 1; }
    return result;
  });
  const openSpy = mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>) => {
    const handle = await originalOpen(...args);
    if (checks === 0 && basename(String(args[0])) === journal.operationId) {
      const close = handle.close.bind(handle);
      handle.close = async (): Promise<void> => {
        if (checks >= 3 && !injected) { injected = true; retained.push(close); throw new Error("synthetic retained directory close failure"); }
        await close();
      };
    }
    return handle;
  });
  syncBuiltinESMExports();
  try {
    await assert.rejects(inspectRecordedClosedCopy({ operationId: journal.operationId, phase: "baseline-copy", runtime }), /synthetic retained directory close failure/u);
    assert.equal(injected, true); assert.equal(retained.length, 1);
  } finally {
    statSpy.mock.restore(); openSpy.mock.restore(); syncBuiltinESMExports();
    for (const close of retained) { await close(); }
  }
});
