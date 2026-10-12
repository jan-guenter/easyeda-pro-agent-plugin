/* oxlint-disable import/max-dependencies -- Bind refusal tests to real sealed storage, retained preparations and the public executor without a live engine. */
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { test } from "node:test";
import { createOperation, listOperationStates, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, newOperationId, sha256Json, sha256Text } from "../src/core.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { ExpectedContext } from "../src/engine.ts";
import { LibraryExecutor } from "../src/library-execution.ts";
import type { LibraryJournal } from "../src/library-execution.ts";
import { libraryOperationSchema } from "../src/library-operations.ts";
import { libraryMutationReceipt } from "../src/library-recovery-state.ts";
import { LIBRARY_EXECUTION_PROFILE, libraryExecutionKind } from "../src/library-runtime.ts";
import { fingerprint } from "./pcb-selected-objects-fixture.ts";

const HASH = "a".repeat(64), REFUSAL = /operation-owned completion.*project_structures/u;
type Prepared = Pick<LibraryJournal, "symbolPlan" | "symbolCreatePlan" | "pageCreatePlan" | "pageRenamePlan" | "documentRenamePlan" | "pcbCreatePlan" | "schematicCreatePlan">;
interface FixtureInput {
  readonly operation: unknown;
  readonly context: ExpectedContext;
  readonly preparationPhase: string;
  readonly prepare: () => Prepared;
  readonly targetId: string;
  readonly created: boolean;
}

function executorFixture(): { executor: LibraryExecutor; calls: string[] } {
  const calls: string[] = [];
  const engine = new EasyedaControlEngine({ callTool: (): Promise<never> => {
    calls.push("upstream"); return Promise.reject(new Error("Unexpected live transport"));
  } });
  const observed = new Proxy(engine, { get(target, key, receiver): unknown {
    calls.push(String(key)); return Reflect.get(target, key, receiver);
  } });
  return { executor: new LibraryExecutor(observed), calls };
}

function assertReadOnlyAdvice(result: Record<string, unknown>, journal: LibraryJournal): void {
  assert.match(String(result["executionRefusal"]), REFUSAL);
  assert.equal(result["retainedNextSafeAction"], journal.nextSafeAction);
  assert.match(String(result["nextSafeAction"]), /^Inspect retained evidence only\./u);
}

/** Synthetic historical data only: this does not run execute, a native program,
 * a checkpoint reader or an authority validator. The production artifact store
 * seals every journal/phase under the mandatory test-isolation preload's root.
 */
async function retainedFixture(input: FixtureInput, nativeReturn = true, state = "library-needs-review", orphaned = false): Promise<LibraryJournal> {
  const operation = libraryOperationSchema.parse(input.operation), operationId = newOperationId();
  const plan: LibraryJournal["plan"] = { profile: LIBRARY_EXECUTION_PROFILE, operation, expectedContext: input.context, expectedFingerprint: fingerprint() };
  const journal: LibraryJournal = {
    schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), planHash: buildPlanHash(plan), plan,
    state, mutationState: "before", saved: state === "completed", reopened: false, orphanedCallPossible: orphaned,
    hardStop: state === "library-needs-review", mutationMayHaveOccurred: true,
    nextSafeAction: "Synthetic historical fixture: retain evidence; never replay.", context: input.context,
    beforeSourceSha256: sha256Json("synthetic unchanged source"), sequence: 0,
    createdAt: "2026-10-12T00:00:00Z", updatedAt: "2026-10-12T00:00:00Z", artifacts: [],
    preCheckpoint: { schema: "easyeda-pro-control.checkpoint.v2", createdAt: "2026-10-12T00:00:00Z", source: input.context.project.path,
      checkpoint: "/fixture/synthetic-before.sqlite", receiptPath: "/fixture/synthetic-before.json", sourceSha256: HASH, checkpointSha256: HASH,
      sourceDumpSha256: HASH, checkpointDumpSha256: HASH, receiptSha256: HASH,
      sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" }, checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" } },
  };
  await createOperation(journal);
  journal.artifacts.push(await writePhaseArtifact(operationId, 1, "before", { syntheticFixture: true, source: "synthetic unchanged source" }));
  const prepared = input.prepare();
  assert.equal(Object.keys(prepared).length, 1);
  Object.assign(journal, prepared);
  journal.artifacts.push(await writePhaseArtifact(operationId, 2, input.preparationPhase, Object.values(prepared)[0]));
  journal.sequence = 2;
  if (nativeReturn) {
    const returned = { kind: libraryExecutionKind(operation), targetId: input.targetId, createdId: input.created ? input.targetId : null };
    journal.mutationReceipt = libraryMutationReceipt(operation, returned);
    journal.artifacts.push(await writePhaseArtifact(operationId, 3, "native-return", returned));
    journal.sequence = 3;
  }
  await updateOperation(journal);
  return journal;
}

async function retainedBytes(journal: LibraryJournal): Promise<Buffer[]> {
  const bytes = await Promise.all([readFile(journal.journalPath), ...journal.artifacts.map(async (artifact): Promise<Buffer> => {
    const content = await readFile(artifact.path);
    assert.equal(content.length, artifact.bytes); assert.equal(sha256Text(content.toString("utf8")), artifact.sha256);
    return content;
  })]);
  return bytes;
}

export function registerStructureTransactionTests(input: FixtureInput): void {
  const operation = libraryOperationSchema.parse(input.operation);
  const label = operation.action;
  for (const confirmed of [false, true]) {
    void test(`${label} lifecycle refusal precedes authority, engine access and journal creation (confirmed=${String(confirmed)})`, async () => {
      const before = await listOperationStates(), run = executorFixture();
      await assert.rejects(run.executor.execute({ operation, expectedContext: input.context, expectedFingerprint: {}, ...(confirmed ? { confirmWrite: true } : {}) }), REFUSAL);
      assert.deepEqual(run.calls, []); assert.deepEqual(await listOperationStates(), before);
    });
  }
  for (const scenario of ["acknowledged", "missing-native-return", "orphaned"] as const) {
    void test(`${label} retained ${scenario} journal stays inspectable but neither reconciliation mode can complete it`, async () => {
      const journal = await retainedFixture(input, scenario !== "missing-native-return", "library-needs-review", scenario === "orphaned");
      const before = await retainedBytes(journal), run = executorFixture();
      const inspected = await LibraryExecutor.inspect(journal.operationId);
      assert.equal(inspected["state"], "library-needs-review"); assert.equal(inspected["saved"], false);
      assert.deepEqual(inspected["artifacts"], journal.artifacts);
      assertReadOnlyAdvice(inspected, journal);
      await assert.rejects(run.executor.preflightReconcile(journal.operationId), REFUSAL);
      await assert.rejects(run.executor.reconcile(journal.operationId), REFUSAL);
      await assert.rejects(run.executor.reconcileNoMutation(journal.operationId), REFUSAL);
      assert.deepEqual(await retainedBytes(journal), before); assert.deepEqual(run.calls, []);
      const retained = await loadOperation(journal.operationId);
      assert.equal(retained["hardStop"], true); assert.equal(retained["orphanedCallPossible"], scenario === "orphaned");
      assert.deepEqual(retained["mutationReceipt"], journal.mutationReceipt);
    });
  }
  for (const state of ["completed", "reconciled-no-mutation", "plan-invalidated", "rolled-back"]) {
    void test(`${label} historical ${state} summary is read-only evidence, not renewed execution admission`, async () => {
      const journal = await retainedFixture(input, true, state);
      const before = await retainedBytes(journal), run = executorFixture();
      const inspected = await LibraryExecutor.inspect(journal.operationId);
      const reconciled = await run.executor.reconcile(journal.operationId);
      const unchanged = await run.executor.reconcileNoMutation(journal.operationId);
      const preflight = await run.executor.preflightReconcile(journal.operationId); assert.ok(preflight);
      assert.equal(inspected["state"], state); assert.equal(reconciled["state"], state); assert.equal(unchanged["state"], state);
      for (const result of [inspected, reconciled, unchanged, preflight]) { assertReadOnlyAdvice(result, journal); }
      assert.deepEqual(await retainedBytes(journal), before); assert.deepEqual(run.calls, []);
    });
  }
  void test(`${label} retained preparation corruption cannot pass inspection or gain reconciliation authority`, async () => {
    const journal = await retainedFixture(input);
    const artifact = journal.artifacts[1], run = executorFixture();
    assert.ok(artifact);
    const originalJournal = await readFile(journal.journalPath);
    // Deliberately corrupt only this test's fresh managed phase; no journal
    // Repair, hash refresh or execution-policy override is permitted.
    await writeFile(artifact.path, "{}\n");
    await assert.rejects(LibraryExecutor.inspect(journal.operationId), /phase artifact.*hash/u);
    await assert.rejects(run.executor.reconcile(journal.operationId), /phase artifact.*hash/u);
    assert.deepEqual(await readFile(journal.journalPath), originalJournal); assert.deepEqual(run.calls, []);
  });
  void test(`${label} a substituted preparation path cannot pass inspection or gain reconciliation authority`, async () => {
    const journal = await retainedFixture(input);
    const before = await retainedBytes(journal), candidate = structuredClone(journal), run = executorFixture();
    const preparation = candidate.artifacts[1]; assert.ok(preparation);
    preparation.path = journal.journalPath;
    // The internal writer seals supplied content; managed path containment is
    // Enforced on the subsequent read. Inject only into this synthetic journal.
    await updateOperation(candidate);
    const injected = await readFile(journal.journalPath);
    await assert.rejects(LibraryExecutor.inspect(journal.operationId), /artifact outside its directory/u);
    await assert.rejects(run.executor.reconcile(journal.operationId), /artifact outside its directory/u);
    const after = await retainedBytes(journal);
    assert.deepEqual(after[0], injected); assert.deepEqual(after.slice(1), before.slice(1)); assert.deepEqual(run.calls, []);
  });
}
