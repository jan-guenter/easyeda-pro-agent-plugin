/* oxlint-disable import/max-dependencies -- Exercise the fixed policy at execute, final dispatch and retained recovery, including the existing task1-only barrier. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { listOperationStates } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, sha256Json } from "../src/core.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import { LibraryExecutor } from "../src/library-execution.ts";
import type { LibraryJournal } from "../src/library-execution.ts";
import { assertLibraryExecutionLifecycle, libraryExecutionLifecycleRefusal } from "../src/library-execution-lifecycle.ts";
import { libraryOperationSchema } from "../src/library-operations.ts";
import type { LibraryOperation } from "../src/library-operations.ts";
import { LibraryRecoveryCoordinator } from "../src/library-recovery.ts";
import type { LibraryRecoveryEngine } from "../src/library-recovery.ts";
import { LIBRARY_EXECUTION_PROFILE, libraryExecutionKind } from "../src/library-runtime.ts";
import { buildProjectUploadBarrierExpression, validateProjectUploadBarrierResult } from "../src/project-upload-barrier.ts";
import { transactionErrorDetails } from "../src/transaction-error.ts";
import { context, fingerprint } from "./pcb-selected-objects-fixture.ts";

const HASH = "a".repeat(64), REFUSAL = /operation-owned completion.*project_structures/u;
const OPERATIONS: readonly LibraryOperation[] = [
  { id: "symbol-create", action: "library.symbol.create", libraryUuid: "project", name: "Empty", symbolType: 2 },
  { id: "symbol-modify", action: "library.symbol.modify", libraryUuid: "project", target: { uuid: "symbol" }, patch: { name: "New name" } },
  { id: "page-create", action: "document.page.create", schematic: { uuid: "parent" } },
  { id: "page-rename", action: "document.page.rename", target: { uuid: "page" }, name: "New name" },
  { id: "pcb-create", action: "document.pcb.create" },
  { id: "pcb-rename", action: "document.pcb.rename", target: { uuid: "pcb" }, name: "New name" },
  { id: "schematic-create", action: "document.schematic.create" },
  { id: "schematic-rename", action: "document.schematic.rename", target: { uuid: "parent" }, name: "New name" },
];
const PREPARATIONS: Readonly<Record<string, string>> = {
  "library.symbol.create": "symbol-create-prepared", "library.symbol.modify": "symbol-prepared",
  "document.page.create": "page-create-prepared", "document.page.rename": "page-rename-prepared",
  "document.pcb.create": "pcb-create-prepared", "document.schematic.create": "schematic-create-prepared",
  "document.pcb.rename": "document-rename-prepared", "document.schematic.rename": "document-rename-prepared",
};

function executionFixture(): { executor: LibraryExecutor; calls: string[] } {
  const calls: string[] = [];
  const engine = new EasyedaControlEngine({ callTool: (): Promise<never> => { calls.push("upstream"); return Promise.reject(new Error("Unexpected upstream")); } });
  const observed = new Proxy(engine, { get(target, key, receiver): unknown { calls.push(String(key)); return Reflect.get(target, key, receiver); } });
  return { executor: new LibraryExecutor(observed), calls };
}

function retainedJournal(operation: LibraryOperation): LibraryJournal {
  const plan: LibraryJournal["plan"] = { profile: LIBRARY_EXECUTION_PROFILE, operation, expectedFingerprint: fingerprint(), expectedContext: context };
  return { schema: OPERATION_SCHEMA, operationId: "synthetic-lifecycle", journalPath: "/fixture/journal.json", planHash: buildPlanHash(plan), plan,
    state: "library-needs-review", mutationState: "before", saved: false, reopened: false, orphanedCallPossible: false,
    hardStop: true, mutationMayHaveOccurred: true, nextSafeAction: "Inspect retained evidence without replay.", context,
    beforeSourceSha256: sha256Json("unchanged active source"), sequence: 2, updatedAt: "2026-10-12T00:00:00Z",
    artifacts: [{ path: `/fixture/02-${PREPARATIONS[operation.action]}.json`, bytes: 2, sha256: HASH }],
    preCheckpoint: { schema: "easyeda-pro-control.checkpoint.v2", createdAt: "2026-10-12T00:00:00Z", source: context.project.path,
      checkpoint: "/fixture/before.sqlite", receiptPath: "/fixture/before.json", sourceSha256: HASH, checkpointSha256: HASH,
      sourceDumpSha256: HASH, checkpointDumpSha256: HASH, receiptSha256: HASH,
      sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" }, checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" } } };
}

function recoveryFixture(journal: LibraryJournal): { coordinator: LibraryRecoveryCoordinator; calls: string[] } {
  const calls: string[] = [];
  const forbidden = (name: string): Promise<never> => { calls.push(name); return Promise.reject(new Error(`Unexpected ${name}`)); };
  const engine: LibraryRecoveryEngine = {
    status: () => forbidden("status"), upstream: { installedEasyedaBundles: () => forbidden("native-profile") },
    context: () => forbidden("context"), assertContext: () => forbidden("assert-context"),
    assertRecoveryOperationIsolated: () => forbidden("isolation"), awaitProjectUploads: () => forbidden("upload-barrier"),
    checkpoint: () => forbidden("checkpoint"), exactRead: () => forbidden("exact-read"),
    dispatchWithOrphanTracking: () => forbidden("dispatch"), ensureRuntimeRestartChallenge: () => forbidden("restart"),
    recoverDispatchAuthority: () => forbidden("authority"),
  };
  const coordinator = new LibraryRecoveryCoordinator(engine, {
    load: (): Promise<LibraryJournal> => Promise.resolve(structuredClone(journal)), record: (): Promise<never> => forbidden("record"), updateOperation: (): Promise<never> => forbidden("update"),
    readNativeHistoryCheckpoint: (): Promise<never> => forbidden("history"), readArtifact: (): Promise<never> => forbidden("artifact"),
  });
  return { coordinator, calls };
}

for (const operation of OPERATIONS) {
  void test(`${operation.action} refuses execute before engine access or journal publication`, async () => {
    assert.deepEqual(libraryOperationSchema.parse(operation), operation);
    assert.ok(libraryExecutionKind(operation).startsWith("project-"));
    const { calls, executor } = executionFixture();
    // A missing authority validator and fingerprint would reject later. The
    // Lifecycle policy must win without reading either or creating a journal.
    const before = await listOperationStates();
    await assert.rejects(executor.execute({ operation, expectedContext: context, expectedFingerprint: {}, confirmWrite: true }), REFUSAL);
    assert.deepEqual(calls, []);
    assert.deepEqual(await listOperationStates(), before);
  });

  void test(`${operation.action} retains a final-dispatch defense without acquiring authority`, async () => {
    const { calls, executor } = executionFixture();
    const dispatch: unknown = Reflect.get(executor, "dispatch");
    assert.equal(typeof dispatch, "function");
    if (typeof dispatch !== "function") { assert.fail("Missing final dispatch boundary"); }
    const result: unknown = Reflect.apply(dispatch, executor, [{ operation, expectedContext: context, expectedFingerprint: {} }, retainedJournal(operation), operation, "execute"]);
    await assert.rejects(Promise.resolve(result), REFUSAL);
    assert.deepEqual(calls, []);
  });

  void test(`${operation.action} cannot complete potentially dispatched recovery even when no mutation is requested`, async () => {
    for (const requireNoMutation of [false, true]) {
      for (const mutationMayHaveOccurred of [false, true]) {
        const journal = retainedJournal(operation); journal.mutationMayHaveOccurred = mutationMayHaveOccurred;
        const before = structuredClone(journal), run = recoveryFixture(journal);
        await assert.rejects(run.coordinator.reconcile(journal.operationId, requireNoMutation), (error: unknown): boolean => {
          assert.ok(error instanceof Error); assert.match(error.message, REFUSAL);
          assert.equal(transactionErrorDetails(error)?.operationId, journal.operationId); return true;
        });
        assert.deepEqual(journal, before); assert.deepEqual(run.calls, []);
      }
    }
  });

  void test(`${operation.action} keeps historical terminal evidence inspectable without authority`, async () => {
    for (const state of ["completed", "reconciled-no-mutation", "plan-invalidated", "rolled-back"]) {
      const journal = retainedJournal(operation); journal.state = state;
      const before = structuredClone(journal), run = recoveryFixture(journal);
      const result = await run.coordinator.reconcile(journal.operationId);
      assert.equal(result["state"], state); assert.deepEqual(journal, before); assert.deepEqual(run.calls, []);
    }
  });
}

void test("the structure policy does not relabel footprint, device, metadata-read or navigation routes", () => {
  for (const action of ["library.footprint.create", "library.footprint.modify", "library.device.create", "library.device.modify",
    "library.device.model-transform", "library.symbol.get", "library.symbol.open", "document.open", "document.activate", "document.close"]) {
    assert.equal(libraryExecutionLifecycleRefusal(action), undefined);
  }
  for (const operation of OPERATIONS) { assert.throws(() => { assertLibraryExecutionLifecycle(operation); }, REFUSAL); }
});

void test("a successful task1 receipt and unchanged observations cannot complete recovery ahead of a delayed structure job", async () => {
  const projectUuid = "a".repeat(64), task1 = new Set<Promise<void>>(), task2 = new Set<Promise<void>>();
  const structure = { ticket: 1 };
  // Model the pinned scheduler's ownership gap without wall-clock sleeps: its
  // Timer is pending before any task2 promise exists, independently of task1.
  const update = async (): Promise<void> => { await Promise.resolve(); structure.ticket = 2; };
  const pendingTimers: (() => Promise<void>)[] = [async (): Promise<void> => {
    const job = update();
    task2.add(job); await job; task2.delete(job);
  }];
  const host = { currentProject: { projectId: projectUuid }, messageBus: { rpcCall: async (): Promise<unknown> => {
    await Promise.all(task1); return { message: { success: true } };
  } } };
  const eda = { dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: projectUuid }) } };
  const receipt: unknown = await runInNewContext(buildProjectUploadBarrierExpression(projectUuid), { gVars: host, eda });
  assert.equal(validateProjectUploadBarrierResult(receipt, projectUuid).scheduledWritesSettled, true);
  assert.equal(task1.size, 0); assert.equal(task2.size, 0); assert.equal(pendingTimers.length, 1);
  const first = sha256Json(structure), second = sha256Json(structure); assert.equal(first, second);
  const operation = OPERATIONS[1]; assert.ok(operation);
  const journal = retainedJournal(operation), run = recoveryFixture(journal);
  await assert.rejects(run.coordinator.reconcile(journal.operationId, true), REFUSAL);
  const timer = pendingTimers.shift(); assert.ok(timer); await timer();
  assert.notEqual(sha256Json(structure), first);
  await assert.rejects(run.coordinator.reconcile(journal.operationId), REFUSAL);
  assert.deepEqual(run.calls, []); assert.equal(journal.state, "library-needs-review");
});
