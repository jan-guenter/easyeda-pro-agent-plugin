import { configureTestControlRoot } from "./test-control-root.ts";
/* oxlint-disable import/max-dependencies -- These coordinator regressions combine sealed disk journals with the real flat-profile and Save-attempt validators. */
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, test } from "node:test";
import { OPERATION_SCHEMA, buildPlanHash, newOperationId, sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { prepareFlatDisplayProfile } from "../src/flat-display-profile.ts";
import type { DESIGN_SAVE_ATTEMPT_PROFILE, createDesignSaveIntent } from "../src/design-save-attempt.ts";
import type { controlDataDirectory, controlRootCapability, createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import type { DispatchOperationJournal, EasyedaControlEngine } from "../src/engine.ts";
import type { DesignExecutor, verifyFlatDisplayRetainedSaveAuthority } from "../src/design-execution.ts";
import { context, fixture, operation } from "./flat-display-fixture.ts";

let artifacts: { controlDataDirectory: typeof controlDataDirectory; controlRootCapability: typeof controlRootCapability; createOperation: typeof createOperation; loadOperation: typeof loadOperation;
  operationPath: typeof operationPath; updateOperation: typeof updateOperation; writePhaseArtifact: typeof writePhaseArtifact };
let engines: { EasyedaControlEngine: typeof EasyedaControlEngine };
let executors: { DesignExecutor: typeof DesignExecutor; verifyFlatDisplayRetainedSaveAuthority: typeof verifyFlatDisplayRetainedSaveAuthority };
let profiles: { prepareFlatDisplayProfile: typeof prepareFlatDisplayProfile };
let saveAttempts: { DESIGN_SAVE_ATTEMPT_PROFILE: typeof DESIGN_SAVE_ATTEMPT_PROFILE; createDesignSaveIntent: typeof createDesignSaveIntent };
let directory: string;
let rootIsolated = false;
const priorDirectory = process.env["EASYEDA_CONTROL_DATA_DIR"];
before(async () => {
  directory = await mkdtemp(join(tmpdir(), "easyeda-flat-execution-test-"));
  configureTestControlRoot(directory);
  artifacts = await import("../src/artifacts.ts");
  assert.equal(artifacts.controlDataDirectory(), directory, "Fixture imports must never bind the user's control root");
  rootIsolated = true;
  profiles = await import("../src/flat-display-profile.ts"); saveAttempts = await import("../src/design-save-attempt.ts");
  engines = await import("../src/engine.ts"); executors = await import("../src/design-execution.ts");
});
after(async () => {
  if (rootIsolated) { const capability = await artifacts.controlRootCapability(); await capability.close(); }
  if (priorDirectory === undefined) { configureTestControlRoot(); } else { configureTestControlRoot(priorDirectory); }
  await rm(directory, { recursive: true, force: true });
});

// oxlint-disable-next-line typescript/explicit-function-return-type -- Retain the exact inferred sealed plan and complete fixture fields for targeted journal substitutions.
async function journalFixture() {
  const beforeState = fixture(), prepared = await profiles.prepareFlatDisplayProfile({ ...beforeState, context, operation });
  const operationId = newOperationId();
  const plan = { profile: "easyeda-pro-control.typed-design-transaction.v1" as const, operation: prepared.operation,
    expectedContext: context, expectedFingerprint: {}, flatDisplay: prepared.binding, expectedTopology: prepared.binding.topology };
  const journal = { schema: OPERATION_SCHEMA, operationId, journalPath: artifacts.operationPath(operationId), plan, planHash: buildPlanHash(plan),
    state: "applied-unsaved", mutationState: "after", saved: false, reopened: false, saveAttemptProtocol: saveAttempts.DESIGN_SAVE_ATTEMPT_PROFILE,
    orphanedCallPossible: false, hardStop: false, mutationMayHaveOccurred: true, nextSafeAction: "Synthetic source-only fixture.",
    context: structuredClone(context), before: parseDocumentSource(beforeState.native.source), beforeNative: beforeState.native,
    after: prepared.expectedSource, afterNative: prepared.expectedNative, inverse: prepared.inverse, beforeTopology: prepared.binding.topology,
    createdIds: {}, preCheckpoint: { ...beforeState.evidence.checkpoint }, sequence: 0,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), artifacts: [] as DispatchOperationJournal["artifacts"] };
  assert.equal(dirname(journal.journalPath), join(directory, "operations"), "Refuse a synthetic journal outside its private fixture root");
  return journal;
}

void test("flat retained journal substitutions refuse before every recovery, navigation or transaction side effect", async (t) => {
  const calls: string[] = [];
  const engine = new engines.EasyedaControlEngine({ callTool: (): Promise<unknown> => { calls.push("upstream"); return Promise.reject(new Error("No live test call")); } });
  await engine.controlFingerprintPromise;
  for (const method of ["status", "assertContext", "assertRecoveryOperationIsolated", "recoverDispatchAuthority", "awaitProjectUploads", "exactRead", "checkpoint", "dispatchWithOrphanTracking"] as const) {
    t.mock.method(engine, method, () => { calls.push(method); throw new Error("Unexpected runtime access"); });
  }
  const executor = new executors.DesignExecutor(engine);
  for (const kind of ["checkpoint-path", "checkpoint-hash", "source-hash", "native", "topology", "inverse", "context", "unknown-profile", "mixed-operation"] as const) {
    const journal = await journalFixture();
    if (kind === "checkpoint-path") { journal.preCheckpoint.receiptPath = "/tmp/substituted-receipt"; }
    else if (kind === "checkpoint-hash") { journal.preCheckpoint.sourceDumpSha256 = "f".repeat(64); }
    else if (kind === "source-hash") { journal.before = { ...journal.before, sha256: "f".repeat(64) }; }
    else if (kind === "native") { const part = journal.beforeNative.components[0]; assert.ok(part); part.body["x"] = 100; }
    else if (kind === "topology") { journal.beforeTopology = []; }
    else if (kind === "inverse") { journal.inverse.id = "different-inverse"; }
    else if (kind === "context") { journal.context.document.documentType = 3; }
    else if (kind === "unknown-profile") { Reflect.set(journal.plan.flatDisplay, "profile", "unknown"); journal.planHash = buildPlanHash(journal.plan); }
    else { journal.plan.operation.operations.push({ id: "delete", action: "sch.text.delete", target: { primitiveId: "text" } }); journal.planHash = buildPlanHash(journal.plan); }
    await artifacts.createOperation(journal);
    const bytes = await readFile(journal.journalPath), names = await readdir(dirname(journal.journalPath));
    const attempts = [(): Promise<unknown> => executor.commit(journal.operationId), (): Promise<unknown> => executor.rollback(journal.operationId),
      (): Promise<unknown> => executor.reconcile(journal.operationId), (): Promise<unknown> => executor.openTarget(journal.operationId),
      (): Promise<unknown> => executor.rebindRuntime(journal.operationId, {}), (): Promise<unknown> => executor.recoverAuthority(journal.operationId),
      (): Promise<unknown> => executor.loadLayoutPages(journal.operationId, true), (): Promise<unknown> => executor.repairLayoutNetLabels(journal.operationId, true),
      (): Promise<unknown> => executor.repairLayoutWireGroups(journal.operationId, true), (): Promise<unknown> => executor.repairLayoutLabelVisibility(journal.operationId, true)];
    for (const attempt of attempts) {
      await assert.rejects(attempt());
      assert.deepEqual(calls, [], kind); assert.deepEqual(await readFile(journal.journalPath), bytes); assert.deepEqual(await readdir(dirname(journal.journalPath)), names);
    }
  }
});

void test("flat profile cannot authorize page loading, repair families or unsealed private programs", async () => {
  const engine = new engines.EasyedaControlEngine({ callTool: (): Promise<unknown> => Promise.reject(new Error("No live test call")) });
  await engine.controlFingerprintPromise;
  const executor = new executors.DesignExecutor(engine), journal = await journalFixture();
  await artifacts.createOperation(journal);
  const originalNames = await readdir(dirname(journal.journalPath));
  for (const attempt of [(): Promise<unknown> => executor.loadLayoutPages(journal.operationId, true), (): Promise<unknown> => executor.repairLayoutNetLabels(journal.operationId, true),
    (): Promise<unknown> => executor.repairLayoutWireGroups(journal.operationId, true), (): Promise<unknown> => executor.repairLayoutLabelVisibility(journal.operationId, true)]) {
    await assert.rejects(attempt(), /topology execution is disabled/u);
  }
  const privateCall: unknown = Reflect.get(executor, "call"); assert.ok(typeof privateCall === "function");
  for (const phase of ["apply", "inverse", "save-reopen", "layout-page-load-1", "repair"]) {
    const result: unknown = Reflect.apply(privateCall, executor, [journal, phase, "throw new Error('unsealed')", true]);
    assert.ok(result instanceof Promise); await assert.rejects(result, /prepared program|original preparation/u);
  }
  assert.deepEqual(await readdir(dirname(journal.journalPath)), originalNames);
});

void test("flat Save ambiguity cannot be downgraded by commit, inverse or reconciliation", async (t) => {
  const calls: string[] = [];
  const engine = new engines.EasyedaControlEngine({ callTool: (): Promise<unknown> => Promise.reject(new Error("No live test call")) });
  await engine.controlFingerprintPromise;
  for (const method of ["status", "assertContext", "assertRecoveryOperationIsolated", "awaitProjectUploads", "dispatchWithOrphanTracking"] as const) {
    t.mock.method(engine, method, () => { calls.push(method); throw new Error("Unexpected runtime access"); });
  }
  const executor = new executors.DesignExecutor(engine), journal = await journalFixture();
  await artifacts.createOperation(journal);
  const intent = saveAttempts.createDesignSaveIntent(journal, "save-reopen"); journal.sequence += 1;
  journal.artifacts.push(await artifacts.writePhaseArtifact(journal.operationId, journal.sequence, "design-save-intent", intent));
  journal.state = "commit-needs-recovery"; await artifacts.updateOperation(journal);
  const original = await readFile(journal.journalPath);
  await assert.rejects(executor.commit(journal.operationId), /already attempted/u);
  await assert.rejects(executor.rollback(journal.operationId), /already attempted/u);
  await assert.rejects(executor.reconcile(journal.operationId), /without a retained success/u);
  assert.deepEqual(calls, []); assert.deepEqual(await readFile(journal.journalPath), original);
});

void test("flat retained Save requires its exact sealed synchronous guard acknowledgment", async () => {
  const journal = await journalFixture();
  const bindingSha256 = sha256Json(journal.plan.flatDisplay), observationSha256 = "e".repeat(64);
  const verify = executors.verifyFlatDisplayRetainedSaveAuthority;
  const prepared = { flatBindingSha256: bindingSha256, observationSha256, codeSha256: "f".repeat(64) };
  const acknowledgment = { flatDisplaySaveGuard: { profile: journal.plan.flatDisplay.profile, bindingSha256, observationSha256, finalSynchronousCheck: true } };
  assert.doesNotThrow(() => { executors.verifyFlatDisplayRetainedSaveAuthority(journal, prepared, acknowledgment); });
  for (const replacement of [{}, { ...acknowledgment.flatDisplaySaveGuard, finalSynchronousCheck: false },
    { ...acknowledgment.flatDisplaySaveGuard, bindingSha256: "f".repeat(64) }, { ...acknowledgment.flatDisplaySaveGuard, observationSha256: "f".repeat(64) },
    { ...acknowledgment.flatDisplaySaveGuard, callerAuthority: true }]) {
    assert.throws(() => { verify(journal, prepared, { flatDisplaySaveGuard: replacement }); }, /guard/u);
  }
  assert.throws(() => { executors.verifyFlatDisplayRetainedSaveAuthority(journal, {}, acknowledgment); }, /guard/u);
});
