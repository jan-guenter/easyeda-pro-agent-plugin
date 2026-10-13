/* oxlint-disable import/max-dependencies -- Verify policy, public coordinator boundaries and managed historical evidence together without a live engine. */
import assert from "node:assert/strict";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { test } from "node:test";
import { createOperation, listOperationStates, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, newOperationId, sha256Json } from "../src/core.ts";
import { compileDesignAction, designActionSchema } from "../src/design-action.ts";
import { DesignExecutor } from "../src/design-execution.ts";
import type { DesignApplyInput } from "../src/design-execution.ts";
import { DESIGN_STRUCTURE_LIFECYCLE_REFUSAL, assertDesignExecutionLifecycle, designExecutionLifecycleRefusal } from "../src/design-execution-lifecycle.ts";
import type { DispatchOperationJournal } from "../src/engine.ts";
import { invokeDesignInput, noAuthorityExecutor } from "./design-structure-transaction-fixture.ts";

const REFUSAL = { message: DESIGN_STRUCTURE_LIFECYCLE_REFUSAL };
const operations = new Map<number, unknown>([
  [1, { id: "wire", action: "sch.wire.modify", documentType: 1, target: { primitiveId: "wire" }, patch: { line: [0, 0, 10, 0] } }],
  [2, { id: "circle", action: "sch.circle.create", documentType: 2, properties: { centerX: 5, centerY: 10, radius: 3, color: null, fillColor: null, lineWidth: 1, lineType: 0, fillStyle: "None" } }],
  [3, { id: "line", action: "pcb.line.modify", target: { primitiveId: "line" }, patch: { lineWidth: 8 } }],
  [4, { id: "line", action: "footprint.line.modify", target: { primitiveId: "line" }, patch: { lineWidth: 8 } }],
]);
function input(documentType: number): DesignApplyInput {
  const operation = designActionSchema.parse(operations.get(documentType));
  assert.equal(compileDesignAction(operation).documentType, documentType);
  return { operation, confirmWrite: true, expectedFingerprint: {}, expectedContext: {
    project: { uuid: "synthetic-project", path: "/synthetic/disposable.eprj2" },
    document: { uuid: "document", documentType, tabId: "document@synthetic-project" },
  } };
}
async function retainedJournal(documentType: number, state = "applied-unsaved", currentType = documentType): Promise<DispatchOperationJournal> {
  const operationId = newOperationId(), value = input(documentType);
  const plan = { profile: "easyeda-pro-control.typed-design-transaction.v1", operation: value.operation,
    expectedContext: value.expectedContext, expectedFingerprint: {} };
  const source = { schema: "easyeda-pro-control.document-source.v1", document: { uuid: "document", docType: ["", "SCH_PAGE", "SYMBOL", "PCB", "FOOTPRINT"][documentType] }, objects: [] };
  const snapshot = { ...source, sha256: sha256Json(source) };
  const journal: DispatchOperationJournal = { schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), planHash: buildPlanHash(plan), plan,
    state, mutationState: "after", saved: state === "completed", reopened: state === "completed", hardStop: false,
    orphanedCallPossible: state === "apply-outcome-unknown", mutationMayHaveOccurred: true,
    nextSafeAction: "Historical synthetic advice: commit or inverse after proof.", context: {
      ...value.expectedContext, document: { ...value.expectedContext.document, documentType: currentType },
    }, before: snapshot, after: snapshot, inverse: value.operation, sequence: 0, artifacts: [], updatedAt: "2026-10-12T00:00:00Z", preCheckpoint: { receiptPath: "/synthetic/never-read.json" } };
  await createOperation(journal);
  journal.artifacts.push(await writePhaseArtifact(operationId, 1, "before", { provenance: "new synthetic historical fixture", snapshot }));
  journal.sequence = 1;
  await updateOperation(journal);
  return journal;
}
function bytes(journal: DispatchOperationJournal): Promise<Buffer[]> {
  return Promise.all([journal.journalPath, ...journal.artifacts.map((artifact) => artifact.path)].map((path) => readFile(path)));
}
function assertAdvice(result: Record<string, unknown>, retainedNextSafeAction: string): void {
  assert.equal(result["executionRefusal"], DESIGN_STRUCTURE_LIFECYCLE_REFUSAL);
  assert.equal(result["retainedNextSafeAction"], retainedNextSafeAction);
  assert.match(String(result["nextSafeAction"]), /^Inspect retained evidence only\./u);
  assert.deepEqual(result["inverse"], { available: false, reason: "native-project-structure-lifecycle-unavailable" });
}

void test("structure policy blocks exactly schematic page, symbol and PCB, not footprint geometry", () => {
  for (const type of [1, 2, 3]) {
    assert.equal(designExecutionLifecycleRefusal(type), DESIGN_STRUCTURE_LIFECYCLE_REFUSAL);
    assert.throws(() => { assertDesignExecutionLifecycle(4, type); }, REFUSAL);
    assert.throws(() => { assertDesignExecutionLifecycle(type, 4); }, REFUSAL);
  }
  assert.equal(designExecutionLifecycleRefusal(4), undefined);
  assert.doesNotThrow(() => { assertDesignExecutionLifecycle(4, 4); });
});

for (const type of [1, 2, 3]) {
  for (const confirmation of [false, true]) {
    void test(`type ${String(type)} refuses apply and Save preflight before engine or journal access with confirmation ${String(confirmation)}`, async () => {
      const inventory = await listOperationStates(), run = noAuthorityExecutor(), value = { ...input(type), confirmWrite: confirmation };
      await assert.rejects(invokeDesignInput(run.executor, "apply", value), REFUSAL);
      await assert.rejects(invokeDesignInput(run.executor, "preflightSaveNavigation", value), REFUSAL);
      assert.deepEqual(run.accesses, []); assert.deepEqual(await listOperationStates(), inventory);
    });
  }
  for (const state of ["planned", "applied-unsaved", "commit-needs-recovery", "inverse-needs-recovery", "apply-outcome-unknown"]) {
    void test(`type ${String(type)} historical ${state} cannot commit, inverse, repair or reconcile and retains every byte`, async () => {
      const journal = await retainedJournal(type, state), names = await readdir(dirname(journal.journalPath)), original = await bytes(journal);
      const run = noAuthorityExecutor();
      const inspected = await DesignExecutor.inspect(journal.operationId);
      assertAdvice(inspected, journal.nextSafeAction);
      const invocations: (() => Promise<Record<string, unknown>>)[] = [() => run.executor.commit(journal.operationId), () => run.executor.rollback(journal.operationId),
        () => run.executor.reconcile(journal.operationId), () => run.executor.repairLayoutNetLabels(journal.operationId, true),
        () => run.executor.repairLayoutLabelVisibility(journal.operationId, true), () => run.executor.repairLayoutWireGroups(journal.operationId, true)];
      for (const invoke of invocations) {
        await assert.rejects(invoke(), REFUSAL);
      }
      assert.deepEqual(run.accesses, []); assert.deepEqual(await bytes(journal), original);
      assert.deepEqual(await readdir(dirname(journal.journalPath)), names);
    });
  }
  void test(`type ${String(type)} private final dispatch refuses before runtime for every write phase`, async () => {
    const journal = await retainedJournal(type), original = structuredClone(journal), run = noAuthorityExecutor();
    const call: unknown = Reflect.get(run.executor, "call"); assert.ok(typeof call === "function");
    for (const phase of ["apply", "inverse", "save-reopen", "symbol-save", "layout-wire-group-repair"]) {
      // Direct access proves the private defense independently; it never
      // Supplies a replacement implementation or disables the public policy.
      const result: unknown = Reflect.apply(call, run.executor, [journal, phase, "throw new Error('never execute')", true]);
      assert.ok(result instanceof Promise); await assert.rejects(result, REFUSAL);
    }
    assert.deepEqual(run.accesses, []); assert.deepEqual(journal, original);
  });
  for (const state of ["completed", "rolled-back", "reconciled-no-mutation", "plan-invalidated"]) {
    void test(`type ${String(type)} historical terminal ${state} remains read-only and does not authorize an inverse`, async () => {
      const journal = await retainedJournal(type, state), original = await bytes(journal), run = noAuthorityExecutor();
      const inspected = await DesignExecutor.inspect(journal.operationId), reconciled = await run.executor.reconcile(journal.operationId);
      assert.equal(inspected["state"], state); assert.equal(reconciled["state"], state);
      assertAdvice(inspected, journal.nextSafeAction); assertAdvice(reconciled, journal.nextSafeAction);
      assert.deepEqual(run.accesses, []); assert.deepEqual(await bytes(journal), original);
    });
  }
  for (const currentType of [4, type]) {
    const expectedType = currentType === 4 ? type : 4;
    void test(`rebound type ${String(currentType)} cannot conceal immutable expected type ${String(expectedType)}`, async () => {
      const journal = await retainedJournal(expectedType, "applied-unsaved", currentType), original = await bytes(journal), run = noAuthorityExecutor();
      for (const method of ["commit", "rollback", "reconcile"] as const) { await assert.rejects(run.executor[method](journal.operationId), REFUSAL); }
      assertAdvice(await DesignExecutor.inspect(journal.operationId), journal.nextSafeAction);
      assert.deepEqual(run.accesses, []); assert.deepEqual(await bytes(journal), original);
    });
  }
}

void test("type4 context cannot disguise a PCB operation during apply or execute preflight", async () => {
  const inventory = await listOperationStates(), run = noAuthorityExecutor(), value = { ...input(4), operation: input(3).operation };
  await assert.rejects(run.executor.apply(value), /Wrong editor for design action/u);
  await assert.rejects(run.executor.preflightSaveNavigation(value), /Wrong editor for design action/u);
  assert.deepEqual(run.accesses, []); assert.deepEqual(await listOperationStates(), inventory);
});

void test("genuine footprint apply still reaches its existing authority gate, without a structure-policy exemption", async () => {
  const run = noAuthorityExecutor();
  await assert.rejects(run.executor.apply(input(4)), /Unexpected engine access: executionAuthorityValidator/u);
  assert.deepEqual(run.accesses, ["executionAuthorityValidator"]);
  const journal = await retainedJournal(4);
  const inspected = await DesignExecutor.inspect(journal.operationId);
  assert.equal(inspected["executionRefusal"], undefined); assert.equal(inspected["retainedNextSafeAction"], undefined);
  assert.equal(inspected["nextSafeAction"], journal.nextSafeAction);
});

void test("blocked design inspection still verifies retained artifact hashes before any policy summary", async () => {
  const journal = await retainedJournal(3);
  const artifact = journal.artifacts[0]; assert.ok(artifact);
  const original = await readFile(journal.journalPath), run = noAuthorityExecutor();
  await writeFile(artifact.path, "{}\n");
  await assert.rejects(DesignExecutor.inspect(journal.operationId), /phase artifact.*hash/u);
  await assert.rejects(run.executor.reconcile(journal.operationId), /phase artifact.*hash/u);
  assert.deepEqual(run.accesses, []); assert.deepEqual(await readFile(journal.journalPath), original);
});
