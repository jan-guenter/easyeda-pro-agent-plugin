/** Test-only split. Actual admission, inspectors, runtime qualification and issuers are not mocked here. */
/* oxlint-disable import/max-dependencies -- Fixed maintained stage/fixture composition, not caller-selected production dependencies. */
import assert from "node:assert/strict";
import childProcess from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { lstat, readFile, readdir, rename } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename, dirname, join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { operationPath } from "../../src/artifacts.ts";
import { listQualifiedOperationStates, scanQualifiedAdmissionOperations } from "../../src/closed-symbol-terminal-admission.ts";
import { ClosedSymbolTerminalStage, assertOriginalClosedSymbolCompletion } from "../../src/closed-symbol-terminal.ts";
import { SQLITE_INVENTORY_PROGRAM } from "../../src/sqlite-inventory-program.ts";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";

type Fixture = Awaited<ReturnType<typeof fixture>>;
type FullEvidence = Awaited<ReturnType<Fixture["stage"]["recordFullEvidence"]>>;
interface CompletedFixture {
  readonly fixture: Fixture;
  readonly full: FullEvidence;
  readonly terminal: ClosedSymbolTerminalStage;
  readonly completion: Awaited<ReturnType<ClosedSymbolTerminalStage["complete"]>>;
}
type SnapshotEntry = Readonly<{ path: string; kind: "directory" }> | Readonly<{ path: string; kind: "file"; bytes: number; sha256: string }>;

async function snapshot(root: string): Promise<readonly SnapshotEntry[]> {
  const discovered = await readdir(root, { recursive: true });
  const entries = discovered.toSorted();
  assert.ok(entries.length < 4096);
  const result: SnapshotEntry[] = [];
  let aggregateBytes = 0;
  for (const path of entries) {
    const full = join(root, path), information = await lstat(full);
    assert.equal(information.isSymbolicLink(), false);
    if (information.isDirectory()) { result.push({ path, kind: "directory" }); }
    else {
      assert.ok(information.isFile() && information.size <= 33_554_432);
      aggregateBytes += information.size;
      assert.ok(aggregateBytes <= 268_435_456);
      const bytes = await readFile(full);
      result.push({ path, kind: "file", bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
    }
  }
  return result;
}

async function completeFixture(context: TestContext): Promise<CompletedFixture> {
  const owner = await fixture(context);
  const full = await owner.stage.recordFullEvidence(owner.plan);
  const terminal = new ClosedSymbolTerminalStage(owner.engine, owner.machine);
  const completion = await terminal.complete(full);
  assert.throws(() => { assertOriginalClosedSymbolCompletion(structuredClone(completion), owner.engine, full.operationId); }, /original/iu);
  return { fixture: owner, full, terminal, completion };
}

async function addSecondFixture(context: TestContext, root: string, first: CompletedFixture): Promise<CompletedFixture> {
  const firstPath = operationPath(first.full.operationId);
  assert.equal(dirname(dirname(firstPath)), root);
  const firstIdentity = await lstat(firstPath, { bigint: true });
  const firstBytes = await readFile(firstPath);
  assert.ok(firstIdentity.isFile() && !firstIdentity.isSymbolicLink());
  assert.equal(firstIdentity.nlink, 1n); assert.equal(firstIdentity.mode % 512n, 0o600n);
  assert.ok(typeof process.getuid === "function"); assert.equal(firstIdentity.uid, BigInt(process.getuid()));
  const originalEvents = [...first.fixture.events];
  // Test fixture assembly only. No admission scan has run, so there is no warm
  // Entry whose recorded ctime can be invalidated by this temporary relocation.
  // Restore the same owned journal before the first measured admission call.
  const held = `${firstPath}.fixture-held-${randomUUID()}`;
  await assert.rejects(lstat(held), { code: "ENOENT" });
  await rename(firstPath, held);
  let second: CompletedFixture | undefined;
  try {
    second = await completeFixture(context);
    assert.notEqual(dirname(second.fixture.source), dirname(first.fixture.source));
    assert.notEqual(second.full.operationId, first.full.operationId);
  } finally {
    await assert.rejects(lstat(firstPath), { code: "ENOENT" });
    await rename(held, firstPath);
  }
  assert.ok(second !== undefined);
  const restored = await lstat(firstPath, { bigint: true });
  for (const field of ["dev", "ino", "size", "mode", "uid", "gid", "nlink"] as const) { assert.equal(restored[field], firstIdentity[field]); }
  assert.deepEqual(await readFile(firstPath), firstBytes);
  assert.deepEqual(first.fixture.events, originalEvents);
  // Rename may change ctime; only the post-assembly snapshot is used below.
  return second;
}

export function registerAdmissionCase(operationCount: 1 | 2): void {
  void test(`actual ${String(operationCount)}-terminal admission is cold once then shares warm results across engine and direct views`, async (context) => {
    const selectedRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
    assert.ok(selectedRoot !== undefined && basename(selectedRoot).startsWith(`easyeda-test-control-${String(process.pid)}-`));
    const root = selectedRoot;
    assert.ok(typeof process.getuid === "function");
    const rootIdentity = await lstat(root);
    assert.ok(rootIdentity.isDirectory() && !rootIdentity.isSymbolicLink());
    assert.equal(rootIdentity.mode % 512, 0o700); assert.equal(rootIdentity.uid, process.getuid());

    const first = await completeFixture(context);
    const completed = [first];
    if (operationCount === 2) { completed.push(await addSecondFixture(context, root, first)); }
    // All source/terminal fixture assembly, including the sole journal hold,
    // Finishes before the snapshot and first admission measurement.
    const retained = await snapshot(root);
    const nativeEvents = completed.map((entry) => [...entry.fixture.events]);
    const spy = context.mock.method(childProcess, "spawn");
    syncBuiltinESMExports();
    context.after((): void => { context.mock.restoreAll(); syncBuiltinESMExports(); });
    const sqlCalls = (): number => spy.mock.calls.filter((call) => {
      const args: unknown = call.arguments[1]; return Array.isArray(args) && args.includes(SQLITE_INVENTORY_PROGRAM);
    }).length;
    async function unchanged(): Promise<void> {
      assert.deepEqual(await snapshot(root), retained);
      for (let index = 0; index < completed.length; index += 1) {
        const entry = completed[index]; assert.ok(entry !== undefined);
        assert.deepEqual(entry.fixture.events, nativeEvents[index]);
      }
    }
    async function measure(label: string, expectedSqlChildren: number, action: () => Promise<void>): Promise<void> {
      const started = performance.now();
      const beforeSql = sqlCalls();
      let largestGapMs = 0, last = started, timerTicks = 0;
      const timer = setInterval((): void => {
        const now = performance.now(); largestGapMs = Math.max(largestGapMs, now - last); last = now; timerTicks += 1;
      }, 2);
      try {
        await action();
        const elapsedMs = performance.now() - started, sqlChildren = sqlCalls() - beforeSql;
        assert.equal(sqlChildren, expectedSqlChildren);
        assert.ok(timerTicks > 0);
        context.diagnostic(JSON.stringify({ label, operationCount, elapsedMs, sqlChildren, timerTicks, largestGapMs }));
      } finally { clearInterval(timer); }
      await unchanged();
    }
    if (operationCount === 1) {
      await measure("one-cold-engine", 18, async (): Promise<void> => {
        const admission = await first.fixture.engine.observeStatusAdmission(); assert.deepEqual(admission.incompleteOperations, []);
      });
      await measure("one-warm-direct", 0, async (): Promise<void> => { assert.deepEqual(await scanQualifiedAdmissionOperations(), []); });
    } else {
      await measure("two-cold-direct", 36, async (): Promise<void> => { assert.deepEqual(await scanQualifiedAdmissionOperations(), []); });
      await measure("two-warm-engine", 0, async (): Promise<void> => {
        const admission = await first.fixture.engine.observeStatusAdmission(); assert.deepEqual(admission.incompleteOperations, []);
      });
      await measure("two-warm-list", 0, async (): Promise<void> => { assert.deepEqual(await listQualifiedOperationStates(), []); });
    }
    const beforeRefusalSql = sqlCalls();
    for (const entry of completed) {
      await assert.rejects(entry.terminal.complete(entry.full), /cannot repeat/u);
      await assert.rejects(entry.fixture.stage.recordFullEvidence(entry.fixture.plan), /consumed|attempt/iu);
      assert.throws(() => { assertOriginalClosedSymbolCompletion(structuredClone(entry.completion), entry.fixture.engine, entry.full.operationId); }, /original/iu);
    }
    assert.equal(sqlCalls(), beforeRefusalSql);
    await unchanged();
  });
}
