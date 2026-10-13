/* oxlint-disable import/max-dependencies -- Compose actual coordinator/stages and source registries with synthetic transport only. */
import assert from "node:assert/strict";
import childProcess, { ChildProcess } from "node:child_process";
import { readFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { ClosedSymbolCoordinator, assertOriginalAgedClosedSymbolFullEvidence, assertOriginalClosedSymbolFullEvidence } from "../../src/closed-symbol-coordinator.ts";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { retireSyntheticJournal } from "./synthetic-journal-retirement.ts";
import { HISTORY_TABLE, IDS, mutate } from "./symbol-sql-fixture.ts";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { operationPath } from "../../src/artifacts.ts";
import { isRecord } from "../../src/core.ts";

async function setup(context: TestContext, unlock = false): Promise<Omit<Awaited<ReturnType<typeof fixture>>, "stage"> & { stage: ClosedSymbolCoordinator; referenceCalls: { count: number } }> {
  const f = await fixture(context);
  const stage = new ClosedSymbolCoordinator(f.engine, f.upstream, f.runtime, f.ui, f.machine, f.identity);
  if (unlock) { mutate(f.source, `UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-01-15 12:34:56' WHERE uuid='${IDS.oldHead}'`); }
  context.after(async (): Promise<void> => {
    const operationId = stage.retained()["operationId"];
    if (typeof operationId === "string") { await retireSyntheticJournal(operationId); }
  });
  const original = childProcess.spawn, referenceCalls = { count: 0 };
  const intercept = ((executable: string, args: string[], options: unknown): ChildProcess => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Forward unchanged SQL/version calls to the fixed synthetic fixture; main-reference Windows commands are always intercepted below.
    if (!args.includes("-Command")) { return Reflect.apply(original, childProcess, [executable, args, options]) as ChildProcess; }
    assert.equal(executable, "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe");
    assert.deepEqual(args.slice(0, 4), ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command"]);
    assert.match(String(args[4]), /private\.main-reference-stdin\.v3/u);
    referenceCalls.count += 1;
    const child = new ChildProcess(), error = new PassThrough(), input = new PassThrough(), output = new PassThrough();
    Object.defineProperties(child, { stdin: { value: input }, stdout: { value: output }, stderr: { value: error } });
    context.mock.method(child, "kill", (): boolean => true);
    input.resume();
    input.on("finish", () => { queueMicrotask(() => { output.end("{}\n"); error.end("synthetic reference refusal"); child.emit("close", 1, null); }); });
    return child;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Fake ChildProcess owns real streams but never starts a Windows process.
  }) as typeof childProcess.spawn;
  context.mock.method(childProcess, "spawn", intercept); syncBuiltinESMExports();
  context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  return { ...f, stage, referenceCalls };
}

void test("private shared coordinator keeps the complete locked graph and rejects aged original substitution", async (context) => {
  const f = await setup(context), result = await f.stage.recordFullEvidence(f.plan);
  assert.equal(result.sequence, 44); assert.equal(result.completionProved, false);
  assert.equal(result.saved, false); assert.equal(result.reopened, false);
  assert.equal(f.events.filter((event) => event === "launch").length, 3);
  assert.equal(f.events.filter((event) => event === "normal-close").length, 3);
  assert.equal(f.state.writes, 1); assert.equal(f.state.opens, 2); assert.equal(f.state.reads, 1);
  assert.equal(f.referenceCalls.count, 0); assert.equal(f.stage.retained()["mainReference"], undefined);
  const original = assertOriginalClosedSymbolFullEvidence(result, f.engine, result.operationId);
  assert.equal(Object.hasOwn(original, "mainReference"), false);
  assert.throws(() => assertOriginalAgedClosedSymbolFullEvidence(result, f.engine, result.operationId), /original successful coordinator/u);
  const before = await readFile(operationPath(result.operationId));
  await assert.rejects(f.stage.recordAgedFullEvidence(f.plan), /consumed/u);
  assert.deepEqual(await readFile(operationPath(result.operationId)), before);
});

void test("aged coordinator rejects locked baseline before main-reference dispatch or edit launch", async (context) => {
  const f = await setup(context);
  await assert.rejects(f.stage.recordAgedFullEvidence(f.plan));
  const retained = f.stage.retained();
  const operationId = retained["operationId"]; assert.equal(typeof operationId, "string");
  const loaded = await loadClosedSymbolJournal(String(operationId)); assert.equal(loaded.events.length, 10);
  assert.equal(f.events.filter((event) => event === "launch").length, 1);
  assert.equal(f.state.writes, 0); assert.equal(f.state.opens, 0); assert.equal(f.referenceCalls.count, 0);
  assert.equal(retained["mainReference"], undefined); assert.equal(retained["headEligibility"], "aged-unlocked");
  await assert.rejects(f.stage.recordFullEvidence(f.plan), /consumed/u);
  await assert.rejects(f.stage.recordAgedFullEvidence(f.plan), /consumed/u);
  const replacement = new ClosedSymbolCoordinator(f.engine, f.upstream, f.runtime, f.ui, f.machine, f.identity);
  await assert.rejects(replacement.recordFullEvidence(f.plan), /consumed/u);
  await assert.rejects(replacement.recordAgedFullEvidence(f.plan), /consumed/u);
});

void test("aged coordinator retains actual failed reference output and cannot fall back to a locked run", async (context) => {
  const f = await setup(context, true);
  await assert.rejects(f.stage.recordAgedFullEvidence(f.plan), /transport failed or is ambiguous/u);
  const retained = f.stage.retained();
  const operationId = retained["operationId"]; assert.equal(typeof operationId, "string");
  const raw = retained["mainReferenceRaw"]; assert.ok(isRecord(raw));
  assert.equal(raw["exitCode"], 1); assert.equal(raw["stderr"], "synthetic reference refusal");
  assert.equal(raw["stdout"], "{}\n"); assert.equal(retained["mainReference"], undefined);
  const loaded = await loadClosedSymbolJournal(String(operationId)); assert.equal(loaded.events.length, 10);
  assert.equal(f.events.filter((event) => event === "launch").length, 1);
  assert.equal(f.state.writes, 0); assert.equal(f.state.opens, 0); assert.equal(f.referenceCalls.count, 1);
  await assert.rejects(f.stage.recordFullEvidence(f.plan), /consumed/u);
  await assert.rejects(f.stage.recordAgedFullEvidence(f.plan), /consumed/u);
  assert.equal(f.referenceCalls.count, 1);
});
