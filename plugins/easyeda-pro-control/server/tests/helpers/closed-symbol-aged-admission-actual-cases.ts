/* oxlint-disable import/max-dependencies -- Compose the actual maintained coordinator, terminal, engine and retained-file APIs; no inspector or issuer mocks. */
import assert from "node:assert/strict";
import childProcess from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { assertActualLockedCacheGraphAbsent } from "./closed-symbol-admission-cache-load-observer.ts";
import { agedCoordinatorFixture } from "./closed-symbol-aged-coordinator-fixture.ts";
import { syntheticSqlRoot } from "./sqlite-inventory-fixture.ts";
import { ClosedSymbolAgedTerminalStage, assertOriginalAgedClosedSymbolCompletion } from "../../src/closed-symbol-aged-terminal.ts";
import { assertOriginalAgedClosedSymbolFullEvidence } from "../../src/closed-symbol-coordinator.ts";
import { scanQualifiedAdmissionOperations } from "../../src/closed-symbol-terminal-admission.ts";
import { SQLITE_INVENTORY_PROGRAM } from "../../src/sqlite-inventory-program.ts";

async function snapshot(root: string): Promise<readonly Readonly<{ path: string; bytes: number; sha256: string }>[]> {
  const entries = await readdir(root, { recursive: true });
  const paths = entries.toSorted();
  assert.ok(paths.length < 2048);
  const records = [];
  for (const path of paths) {
    const full = join(root, path), information = await lstat(full);
    assert.equal(information.isSymbolicLink(), false);
    if (!information.isDirectory()) {
      assert.ok(information.isFile() && information.size <= 33_554_432);
      const bytes = await readFile(full);
      records.push({ path, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
    }
  }
  return records;
}

void test("combined actual aged admission reuses only pure computation and corrupted reference blocks without loading locked cache", async (context) => {
  const f = await agedCoordinatorFixture(context), full = await f.stage.recordAgedFullEvidence(f.plan);
  const original = assertOriginalAgedClosedSymbolFullEvidence(full, f.engine, full.operationId);
  const stage = new ClosedSymbolAgedTerminalStage(f.engine, f.machine);
  const completion = await stage.complete(full);
  assert.throws(() => { assertOriginalAgedClosedSymbolCompletion(structuredClone(completion), f.engine, full.operationId); }, /original/iu);
  const root = syntheticSqlRoot();
  const before = await snapshot(root);
  const beforeEvents = [...f.events], referenceCalls = f.transport.calls, rendererCalls = f.transport.rendererCalls;
  const hidden = `${f.source}.aged-admission-source-retained`;
  await assert.rejects(lstat(hidden), { code: "ENOENT" });
  const spy = context.mock.method(childProcess, "spawn");
  syncBuiltinESMExports();
  context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  const sqlCalls = (): number => spy.mock.calls.filter((call) => {
    const values: unknown = call.arguments[1]; return Array.isArray(values) && values.includes(SQLITE_INVENTORY_PROGRAM);
  }).length;
  await rename(f.source, hidden);
  try {
    const absent = await snapshot(root);
    await assert.rejects(lstat(f.source), { code: "ENOENT" });
    assertActualLockedCacheGraphAbsent();
    for (const ordinal of [1, 2]) {
      const initialSql = sqlCalls(), started = performance.now();
      const admission = await f.engine.observeStatusAdmission();
      assert.deepEqual(admission.incompleteOperations, []);
      assert.equal(sqlCalls() - initialSql, ordinal === 1 ? 18 : 0);
      assertActualLockedCacheGraphAbsent();
      assert.deepEqual(await snapshot(root), absent);
      assert.deepEqual(f.events, beforeEvents);
      assert.equal(f.transport.calls, referenceCalls); assert.equal(f.transport.rendererCalls, rendererCalls);
      context.diagnostic(JSON.stringify({ stage: "combined-engine-v2-admission", ordinal, elapsedMs: performance.now() - started, sqlChildren: sqlCalls() - initialSql }));
    }

    const reference = original.mainReference.resultArtifact.path;
    const originalBytes = await readFile(reference);
    const changed = Buffer.from(originalBytes); assert.ok(changed.length > 2);
    changed[changed.length - 2] = changed.at(-2) === 32 ? 33 : 32;
    assert.notDeepEqual(changed, originalBytes);
    await writeFile(reference, changed);
    try {
      const beforeSql = sqlCalls(), corrupted = await snapshot(root);
      const observations = await scanQualifiedAdmissionOperations();
      const blocked = observations.find((value) => value.summary.operationId === full.operationId);
      assert.ok(blocked);
      assert.equal(blocked.qualification, "terminal-evidence-invalid"); assert.equal(blocked.bridgeBlocking, true); assert.equal(blocked.unfinished, true);
      assert.equal(blocked.historicalCompletionVerified, false); assert.equal(blocked.authorityRestored, false);
      assert.equal(blocked.executionAuthorized, false); assert.equal(blocked.replayAllowed, false);
      await assert.rejects(f.engine.assertBridgeDispatchAllowed(), /dispatch is quarantined/u);
      assertActualLockedCacheGraphAbsent();
      await assert.rejects(stage.complete(full), /cannot repeat/u);
      await assert.rejects(f.stage.recordAgedFullEvidence(f.plan), /consumed|attempt/iu);
      assert.deepEqual(await snapshot(root), corrupted);
      assert.deepEqual(f.events, beforeEvents); assert.equal(f.transport.calls, referenceCalls); assert.equal(f.transport.rendererCalls, rendererCalls);
      context.diagnostic(JSON.stringify({ stage: "reference-corruption-blocks-adapter-and-engine", sqlChildren: sqlCalls() - beforeSql }));
    } finally { await writeFile(reference, originalBytes); }
    assert.deepEqual(await snapshot(root), absent);
    await assert.rejects(lstat(f.source), { code: "ENOENT" });
  } finally { await rename(hidden, f.source); }
  assert.deepEqual(await snapshot(root), before);
  assertActualLockedCacheGraphAbsent();
});
