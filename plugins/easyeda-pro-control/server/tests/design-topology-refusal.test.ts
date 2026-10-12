/* oxlint-disable import/max-dependencies -- The builtin-only fixture helper isolates credential and upstream paths alongside these coordinator test dependencies. */
import { configureTestControlRoot } from "./test-control-root.ts";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, test } from "node:test";
import { OPERATION_SCHEMA, buildPlanHash, newOperationId, sha256Json } from "../src/core.ts";
import type { controlRootCapability, createOperation, listOperationStates, operationPath } from "../src/artifacts.ts";
import type { DispatchOperationJournal, EasyedaControlEngine } from "../src/engine.ts";
import type { DesignExecutor } from "../src/design-execution.ts";
import type { SCHEMATIC_TOPOLOGY_EXECUTION_REFUSAL } from "../src/exact-readers.ts";
import { DESIGN_STRUCTURE_LIFECYCLE_REFUSAL } from "../src/design-execution-lifecycle.ts";

let artifacts: { controlRootCapability: typeof controlRootCapability; createOperation: typeof createOperation;
  listOperationStates: typeof listOperationStates; operationPath: typeof operationPath };
let engines: { EasyedaControlEngine: typeof EasyedaControlEngine };
let executors: { DesignExecutor: typeof DesignExecutor };
let readers: { SCHEMATIC_TOPOLOGY_EXECUTION_REFUSAL: typeof SCHEMATIC_TOPOLOGY_EXECUTION_REFUSAL };
let directory: string;
const previousDirectory = process.env["EASYEDA_CONTROL_DATA_DIR"];
const CONTEXT = { project: { uuid: "project", path: "/fixture/disposable.eprj2" },
  document: { uuid: "page", documentType: 1, tabId: "page@project" } };
const OPERATION = { id: "wire", action: "sch.wire.modify", documentType: 1,
  target: { primitiveId: "wire" }, patch: { line: [0, 0, 10, 0], color: null, lineWidth: 1, lineType: 0 } };

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "easyeda-topology-refusal-test-"));
  configureTestControlRoot(directory);
  artifacts = await import("../src/artifacts.ts");
  engines = await import("../src/engine.ts");
  executors = await import("../src/design-execution.ts");
  readers = await import("../src/exact-readers.ts");
});
after(async () => {
  const capability = await artifacts.controlRootCapability();
  await capability.close();
  if (previousDirectory === undefined) { configureTestControlRoot(); }
  else { configureTestControlRoot(previousDirectory); }
  await rm(directory, { recursive: true, force: true });
});

function journalFixture(documentType = 1): DispatchOperationJournal {
  const operationId = newOperationId();
  const plan = { profile: "easyeda-pro-control.typed-design-transaction.v1", operation: OPERATION,
    expectedContext: CONTEXT, expectedFingerprint: {} };
  const sourceBody = { schema: "easyeda-pro-control.document-source.v1", document: { uuid: "page", docType: "SCH_PAGE" }, objects: [] };
  const source = { ...sourceBody, sha256: sha256Json(sourceBody) };
  return { schema: OPERATION_SCHEMA, operationId, journalPath: artifacts.operationPath(operationId), plan, planHash: buildPlanHash(plan),
    state: "applied-unsaved", mutationState: "after", saved: false, reopened: false, orphanedCallPossible: false,
    hardStop: false, mutationMayHaveOccurred: true, nextSafeAction: "Retain historical evidence; do not repeat the edit.",
    context: { ...CONTEXT, document: { ...CONTEXT.document, documentType } }, before: source, after: source, inverse: OPERATION,
    preCheckpoint: { receiptPath: "/fixture/checkpoint" }, sequence: 0,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), artifacts: [] };
}

function refusal(): { message: string } { return { message: DESIGN_STRUCTURE_LIFECYCLE_REFUSAL }; }

void test("schematic creates, deletes and electrical wire changes refuse before runtime or journal creation", async (t) => {
  const calls: string[] = [];
  const engine = new engines.EasyedaControlEngine({ callTool: (): Promise<unknown> => {
    calls.push("upstream"); return Promise.reject(new Error("No upstream call allowed"));
  } });
  await engine.controlFingerprintPromise;
  for (const method of ["status", "assertContext", "awaitProjectUploads", "exactRead", "checkpoint", "dispatchWithOrphanTracking"] as const) {
    t.mock.method(engine, method, () => { calls.push(method); throw new Error("No runtime calls allowed"); });
  }
  const originalOperations = await artifacts.listOperationStates();
  const blockedOperations = [
    { id: "create-wire", action: "sch.wire.create", documentType: 1, properties: { ...OPERATION.patch, net: "SIGNAL" } },
    { id: "delete-wire", action: "sch.wire.delete", documentType: 1, target: OPERATION.target },
    { ...OPERATION, patch: { ...OPERATION.patch, net: "RENAMED" } },
  ];
  for (const operation of blockedOperations) {
    await assert.rejects(new executors.DesignExecutor(engine).apply({ operation, expectedContext: CONTEXT,
      expectedFingerprint: {}, confirmWrite: true }), refusal());
    assert.deepEqual(calls, []);
    assert.deepEqual(await artifacts.listOperationStates(), originalOperations);
  }
});

void test("flat wire candidates refuse before runtime authority or caller topology can grant execution", async (t) => {
  const calls: string[] = [];
  const engine = new engines.EasyedaControlEngine({ callTool: (): Promise<unknown> => {
    calls.push("upstream"); return Promise.reject(new Error("No upstream call allowed"));
  } });
  await engine.controlFingerprintPromise;
  for (const method of ["status", "assertContext", "awaitProjectUploads", "exactRead", "checkpoint", "dispatchWithOrphanTracking"] as const) {
    t.mock.method(engine, method, () => { calls.push(method); throw new Error("No runtime calls allowed"); });
  }
  const originalOperations = await artifacts.listOperationStates();
  const executor = new executors.DesignExecutor(engine);
  const input = { operation: OPERATION, expectedContext: CONTEXT, expectedFingerprint: {}, confirmWrite: true as const };
  await assert.rejects(executor.apply(input), refusal());
  assert.deepEqual(calls, []);
  assert.deepEqual(await artifacts.listOperationStates(), originalOperations);
  await assert.rejects(executor.apply({ ...input, expectedTopology: [] }), refusal());
  assert.deepEqual(calls, []);
  assert.deepEqual(await artifacts.listOperationStates(), originalOperations);
});

void test("retained schematic journals refuse every mutation, Save, navigation and reconciliation without changing evidence", async (t) => {
  const calls: string[] = [];
  const engine = new engines.EasyedaControlEngine({ callTool: (): Promise<unknown> => {
    calls.push("upstream"); return Promise.reject(new Error("No upstream call allowed"));
  } });
  await engine.controlFingerprintPromise;
  for (const method of ["status", "assertContext", "assertRecoveryOperationIsolated", "awaitProjectUploads", "exactRead", "checkpoint", "dispatchWithOrphanTracking"] as const) {
    t.mock.method(engine, method, () => { calls.push(method); throw new Error("No runtime calls allowed"); });
  }
  const executor = new executors.DesignExecutor(engine);
  // Also cover a rebound current context claiming PCB: the immutable schematic
  // Plan must continue to prohibit dispatch and journal changes.
  for (const documentType of [1, 3]) {
    const journal = journalFixture(documentType);
    await artifacts.createOperation(journal);
    const bytes = await readFile(journal.journalPath), names = await readdir(dirname(journal.journalPath));
    const attempts: (() => Promise<Record<string, unknown>>)[] = [() => executor.commit(journal.operationId), () => executor.rollback(journal.operationId),
      () => executor.repairLayoutNetLabels(journal.operationId, true), () => executor.repairLayoutLabelVisibility(journal.operationId, true),
      () => executor.repairLayoutWireGroups(journal.operationId, true), () => executor.reconcile(journal.operationId)];
    for (const attempt of attempts) {
      await assert.rejects(attempt(), refusal());
      assert.deepEqual(await readFile(journal.journalPath), bytes);
      assert.deepEqual(await readdir(dirname(journal.journalPath)), names);
      assert.deepEqual(calls, []);
    }
    // Navigation remains independently constrained by the older topology gate.
    const navigations: (() => Promise<Record<string, unknown>>)[] = [() => executor.openTarget(journal.operationId), () => executor.loadLayoutPages(journal.operationId, true)];
    for (const attempt of navigations) {
      await assert.rejects(attempt(), { message: readers.SCHEMATIC_TOPOLOGY_EXECUTION_REFUSAL });
      assert.deepEqual(await readFile(journal.journalPath), bytes);
      assert.deepEqual(await readdir(dirname(journal.journalPath)), names);
      assert.deepEqual(calls, []);
    }
    const inspected = await executors.DesignExecutor.inspect(journal.operationId);
    assert.equal(inspected["operationId"], journal.operationId);
    assert.equal(inspected["state"], "applied-unsaved");
    assert.deepEqual(await readFile(journal.journalPath), bytes);
  }
});

void test("the private dispatch boundary independently rejects type1 Save and inverse code before runtime access", async () => {
  const calls: string[] = [];
  const engine = new engines.EasyedaControlEngine({ callTool: (): Promise<unknown> => {
    calls.push("upstream"); return Promise.reject(new Error("No upstream call allowed"));
  } });
  await engine.controlFingerprintPromise;
  const executor = new executors.DesignExecutor(engine);
  const journal = journalFixture();
  const originalJournal = structuredClone(journal);
  const privateCall: unknown = Reflect.get(executor, "call");
  assert.ok(typeof privateCall === "function");
  for (const phase of ["save-reopen", "inverse", "layout-page-load-1", "apply"]) {
    // The private method is intentionally reached only by this regression to
    // Prove defense in depth independently of all public entrypoint guards.
    const result: unknown = Reflect.apply(privateCall, executor, [journal, phase, "throw new Error('must not execute')", true]);
    assert.ok(result instanceof Promise);
    await assert.rejects(result, refusal());
  }
  assert.deepEqual(calls, []);
  assert.deepEqual(journal, originalJournal);
});

void test("schematic authority recovery remains available without granting reconciliation or CAD execution", async (t) => {
  const engine = new engines.EasyedaControlEngine({ callTool: (): Promise<unknown> => Promise.reject(new Error("No upstream call allowed")) });
  await engine.controlFingerprintPromise;
  const journal = journalFixture();
  await artifacts.createOperation(journal);
  let recoveries = 0;
  t.mock.method(engine, "recoverDispatchAuthority", () => { recoveries += 1; return Promise.resolve(); });
  t.mock.method(engine, "assertContext", () => Promise.resolve(CONTEXT));
  const executor = new executors.DesignExecutor(engine);
  const recovered = await executor.recoverAuthority(journal.operationId);
  assert.equal(recoveries, 1);
  assert.equal(recovered["state"], "authority-recovered-needs-reconciliation");
  await assert.rejects(executor.reconcile(journal.operationId), refusal());
  await assert.rejects(executor.commit(journal.operationId), refusal());
});
