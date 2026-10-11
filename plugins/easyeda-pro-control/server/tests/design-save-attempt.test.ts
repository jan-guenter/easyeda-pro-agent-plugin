/* oxlint-disable import/max-dependencies -- The builtin-only fixture helper isolates credential and upstream paths alongside these coordinator test dependencies. */
import { configureTestControlRoot } from "./test-control-root.ts";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { OPERATION_SCHEMA, buildPlanHash, newOperationId, sha256Json, sha256Text } from "../src/core.ts";
import type { ArtifactDescriptor, controlRootCapability, createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import type { DispatchOperationJournal, EasyedaControlEngine } from "../src/engine.ts";
import type { DESIGN_SAVE_ATTEMPT_PROFILE, DesignSaveIntent, createDesignSaveIntent, createDesignSaveNotDispatched, hasLegacyDesignSaveEvidence, inspectDesignSaveAttempts } from "../src/design-save-attempt.ts";
import type { DesignExecutor } from "../src/design-execution.ts";

let attempts: { DESIGN_SAVE_ATTEMPT_PROFILE: typeof DESIGN_SAVE_ATTEMPT_PROFILE; createDesignSaveIntent: typeof createDesignSaveIntent;
  createDesignSaveNotDispatched: typeof createDesignSaveNotDispatched; hasLegacyDesignSaveEvidence: typeof hasLegacyDesignSaveEvidence; inspectDesignSaveAttempts: typeof inspectDesignSaveAttempts };
let artifacts: { controlRootCapability: typeof controlRootCapability; createOperation: typeof createOperation; loadOperation: typeof loadOperation;
  operationPath: typeof operationPath; updateOperation: typeof updateOperation; writePhaseArtifact: typeof writePhaseArtifact };
let engines: { EasyedaControlEngine: typeof EasyedaControlEngine };
let executors: { DesignExecutor: typeof DesignExecutor };
let directory: string;
const priorDirectory = process.env["EASYEDA_CONTROL_DATA_DIR"];
const HASH = "a".repeat(64);
const CONTEXT = { project: { uuid: "b".repeat(64), path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "board@project" } };

before(async () => {
  directory = await mkdtemp(join(tmpdir(), "easyeda-save-attempt-test-"));
  configureTestControlRoot(directory);
  attempts = await import("../src/design-save-attempt.ts");
  artifacts = await import("../src/artifacts.ts");
  engines = await import("../src/engine.ts");
  executors = await import("../src/design-execution.ts");
});
after(async () => {
  const capability = await artifacts.controlRootCapability();
  await capability.close();
  if (priorDirectory === undefined) { configureTestControlRoot(); }
  else { configureTestControlRoot(priorDirectory); }
  await rm(directory, { recursive: true, force: true });
});

function fixture(): Parameters<typeof attempts.inspectDesignSaveAttempts>[0] & { artifacts: ArtifactDescriptor[]; sequence: number } {
  return { operationId: "easyeda-synthetic-save", planHash: HASH, sequence: 0, state: "applied-unsaved", saved: false, reopened: false,
    orphanedCallPossible: false, saveAttemptProtocol: attempts.DESIGN_SAVE_ATTEMPT_PROFILE, context: CONTEXT, after: { sha256: HASH }, artifacts: [] };
}
function record(journal: ReturnType<typeof fixture>, phase: string, value: unknown, values: Map<string, unknown>): ArtifactDescriptor {
  journal.sequence += 1;
  const text = `${JSON.stringify(value)}\n`;
  const descriptor = { path: `/synthetic/${journal.sequence.toString().padStart(2, "0")}-${phase}.json`, bytes: Buffer.byteLength(text), sha256: sha256Text(text) };
  journal.artifacts.push(descriptor); values.set(descriptor.path, value); return descriptor;
}
function reader(values: Map<string, unknown>): (descriptor: ArtifactDescriptor) => Promise<unknown> {
  return (descriptor) => Promise.resolve(values.get(descriptor.path));
}

void test("a Save intent remains consumed after returned failure, state changes, rebind and restart without relying on saved flags", async () => {
  const journal = fixture(), values = new Map<string, unknown>();
  const intent = attempts.createDesignSaveIntent(journal, "save-reopen");
  record(journal, "design-save-intent", intent, values);
  for (const state of ["commit-needs-recovery", "runtime-rebound-needs-reconciliation", "target-opened-needs-reconciliation", "applied-unsaved"]) {
    const proof = await attempts.inspectDesignSaveAttempts({ ...journal, state, orphanedCallPhase: "reconcile-upload-barrier" }, reader(values));
    assert.deepEqual(proof, { attempted: true, intentCount: 1, provenNotDispatchedCount: 0 });
  }
});

void test("pre-dispatch read/authority refusals consume no Save; only an exact callback-failure receipt can cancel its intent", async () => {
  const journal = fixture(), values = new Map<string, unknown>();
  assert.deepEqual(await attempts.inspectDesignSaveAttempts({ ...journal, state: "commit-needs-recovery", orphanedCallPhase: "save-reopen" }, reader(values)),
    { attempted: false, intentCount: 0, provenNotDispatchedCount: 0 });
  const intent = attempts.createDesignSaveIntent(journal, "save-reopen");
  const descriptor = record(journal, "design-save-intent", intent, values);
  record(journal, "design-save-not-dispatched", attempts.createDesignSaveNotDispatched(journal, intent, descriptor), values);
  assert.deepEqual(await attempts.inspectDesignSaveAttempts(journal, reader(values)), { attempted: false, intentCount: 1, provenNotDispatchedCount: 1 });
  // A later attempt has another sequence-bound identity. An old cancellation
  // Cannot make it repeatable, even when source and plan hashes are unchanged.
  record(journal, "design-save-intent", attempts.createDesignSaveIntent(journal, "save-reopen"), values);
  assert.deepEqual(await attempts.inspectDesignSaveAttempts(journal, reader(values)), { attempted: true, intentCount: 2, provenNotDispatchedCount: 1 });
});

void test("malformed, foreign, reversed, duplicate or orphan-bound cancellation evidence refuses rather than allowing another Save", async () => {
  for (const patch of [{ operationId: "foreign" }, { planHash: "c".repeat(64) }, { phase: "symbol-save" }, { intentSha256: "d".repeat(64) },
    { dispatchStarted: true }, { reason: "ordinary-native-error" }]) {
    const journal = fixture(), values = new Map<string, unknown>();
    const intent = attempts.createDesignSaveIntent(journal, "save-reopen");
    const descriptor = record(journal, "design-save-intent", intent, values);
    record(journal, "design-save-not-dispatched", { ...attempts.createDesignSaveNotDispatched(journal, intent, descriptor), ...patch }, values);
    await assert.rejects(attempts.inspectDesignSaveAttempts(journal, reader(values)));
  }
  const journal = fixture(), values = new Map<string, unknown>();
  const intent = attempts.createDesignSaveIntent(journal, "save-reopen");
  const descriptor = record(journal, "design-save-intent", intent, values);
  assert.throws(() => attempts.createDesignSaveNotDispatched({ ...journal, orphanedCallPossible: true }, intent, descriptor));
  const cancelled = attempts.createDesignSaveNotDispatched(journal, intent, descriptor);
  record(journal, "design-save-not-dispatched", cancelled, values);
  record(journal, "design-save-not-dispatched", cancelled, values);
  await assert.rejects(attempts.inspectDesignSaveAttempts(journal, reader(values)), /unique preceding/u);
  const first = journal.artifacts[0], second = journal.artifacts[1]; assert.ok(first); assert.ok(second);
  const reversed = { ...journal, artifacts: [second, first] };
  await assert.rejects(attempts.inspectDesignSaveAttempts(reversed, reader(values)), /preceding/u);
  const foreignScope: DesignSaveIntent = { ...intent, scope: { ...intent.scope, documentUuid: "foreign" } };
  values.set(descriptor.path, foreignScope);
  await assert.rejects(attempts.inspectDesignSaveAttempts(journal, reader(values)), /scope/u);
});

void test("legacy successful returns, durable intents and dispatch phases remain no-repeat evidence, but new preflight-only state is not Save", () => {
  const current = fixture(), legacy = { ...current, saveAttemptProtocol: undefined };
  for (const phase of ["save-reopen", "symbol-save", "footprint-save", "library-save-intent", "wire-save-intent"]) {
    assert.equal(attempts.hasLegacyDesignSaveEvidence({ ...legacy, artifacts: [{ path: `/synthetic/06-${phase}.json`, bytes: 1, sha256: HASH }] }), true);
  }
  for (const phase of ["save-reopen", "symbol-save", "footprint-save", "commit-upload-barrier"]) {
    assert.equal(attempts.hasLegacyDesignSaveEvidence({ ...legacy, orphanedCallPhase: phase }), true);
    assert.equal(attempts.hasLegacyDesignSaveEvidence({ ...current, state: "commit-needs-recovery", orphanedCallPhase: phase }), false);
  }
  assert.equal(attempts.hasLegacyDesignSaveEvidence({ ...legacy, designSaveAttempted: true, state: "runtime-rebound-needs-reconciliation" }), true);
  const overwrittenPhase = { state: "commit-needs-recovery", orphanedCallPhase: "reconcile-upload-barrier", artifacts: [] };
  assert.equal(attempts.hasLegacyDesignSaveEvidence({ ...legacy, ...overwrittenPhase }), true);
  assert.equal(attempts.hasLegacyDesignSaveEvidence({ ...current, ...overwrittenPhase }), false);
  assert.throws(() => attempts.hasLegacyDesignSaveEvidence({ ...current, designSaveAttempted: false }));
  assert.throws(() => attempts.hasLegacyDesignSaveEvidence({ ...current, saveAttemptProtocol: "unknown" }));
});

void test("PCB geometry, text lifecycle, rules and stack failed Saves without retained proof cannot become commit-ready or dispatch a second Save", async () => {
  const operations = [{ id: "line", action: "pcb.line.modify", target: { primitiveId: "line" }, patch: { lineWidth: 8 } },
    { id: "text-create", action: "pcb.text.create", properties: { x: 0, y: 0, text: "Fixture1", fontSize: 120, strokeWidth: 8 } },
    { id: "text-delete", action: "pcb.text.delete", target: { primitiveId: "a".repeat(16) } },
    { id: "rules", action: "pcb.rules.net.replace", value: [] },
    { id: "stack", action: "pcb.stack.replace", enabledCopperLayers: [1, 2], layers: [1, 361, 2].map((id, index) =>
      ({ layerId: id, material: id === 361 ? "FR4" : null, thicknessMm: id === 361 ? 1.5 : 0.035, permittivity: null, lossTangent: null, isKeepIsland: true, zIndex: index })) }];
  for (const operation of operations) {
    const operationId = newOperationId(), plan = { profile: "easyeda-pro-control.typed-design-transaction.v1", operation, expectedContext: CONTEXT, expectedFingerprint: {} };
    const base = { schema: "easyeda-pro-control.document-source.v1", document: { uuid: "board", docType: "PCB", editVersion: "3.2.149.88089769" }, objects: [] };
    const source = { ...base, sha256: sha256Json(base) };
    const journal: DispatchOperationJournal = { schema: OPERATION_SCHEMA, operationId, journalPath: artifacts.operationPath(operationId), plan, planHash: buildPlanHash(plan),
      state: "commit-needs-recovery", mutationState: "after", saved: false, reopened: false, orphanedCallPossible: false, hardStop: true,
      mutationMayHaveOccurred: true, nextSafeAction: "Never repeat Save.", context: CONTEXT, before: source, after: source,
      preCheckpoint: { receiptPath: "/synthetic/checkpoint" }, saveAttemptProtocol: attempts.DESIGN_SAVE_ATTEMPT_PROFILE, sequence: 0,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), artifacts: [] };
    await artifacts.createOperation(journal);
    const attempt = attempts.createDesignSaveIntent({ ...journal, after: source }, "save-reopen");
    journal.sequence += 1; journal.artifacts.push(await artifacts.writePhaseArtifact(operationId, journal.sequence, "design-save-intent", attempt));
    await artifacts.updateOperation(journal);
    const calls: string[] = [];
    const engine = new engines.EasyedaControlEngine({ callTool: (): Promise<unknown> => { calls.push("unexpected-dispatch"); return Promise.reject(new Error("No native calls allowed")); } });
    await engine.controlFingerprintPromise;
    const executor = new executors.DesignExecutor(engine);
    let runtimeChecks = 0;
    if (operation.action === "pcb.text.create") {
      // Creation now has a retained-Save proof. Isolate successful read-only
      // Runtime admission to reach its real six-phase evidence gate; this
      // Fixture has only the consumed intent and no successful Save return.
      // No native read/write dispatcher is mocked into success.
      Object.defineProperty(executor, "assertRuntime", { value: (): Promise<void> => {
        runtimeChecks += 1; return Promise.resolve();
      } });
    }
    for (const state of ["commit-needs-recovery", "runtime-rebound-needs-reconciliation", "applied-unsaved"]) {
      journal.state = state; await artifacts.updateOperation(journal);
      await assert.rejects(executor.reconcile(operationId), operation.action === "pcb.text.create"
        ? /PCB text original lifecycle phases are missing or out of order\./u : /Save was already attempted/u);
      await assert.rejects(executor.commit(operationId), /Save was already attempted/u);
      await assert.rejects(executor.rollback(operationId), /Save was already attempted/u);
      await assert.rejects(executor.repairLayoutNetLabels(operationId, true), /Save was already attempted/u);
      await assert.rejects(executor.repairLayoutLabelVisibility(operationId, true), /Save was already attempted/u);
      await assert.rejects(executor.repairLayoutWireGroups(operationId, true), /Save was already attempted/u);
      const retained = await artifacts.loadOperation(operationId);
      assert.equal(retained.planHash, journal.planHash); assert.equal(retained["state"], state);
      assert.equal(retained["saved"], false); assert.equal(retained["reopened"], false);
      assert.deepEqual(await attempts.inspectDesignSaveAttempts({ ...journal, after: source }),
        { attempted: true, intentCount: 1, provenNotDispatchedCount: 0 });
      assert.deepEqual(calls, []);
    }
    assert.equal(runtimeChecks, operation.action === "pcb.text.create" ? 3 : 0);
    journal.state = "completed"; await artifacts.updateOperation(journal);
  }
});

void test("legacy commit uncertainty with a lost return and overwritten phase remains consumed across authority/tab rebinding", async (t) => {
  const operation = { id: "legacy-line", action: "pcb.line.modify", target: { primitiveId: "line" }, patch: { lineWidth: 8 } }, operationId = newOperationId();
  const plan = { profile: "easyeda-pro-control.typed-design-transaction.v1", operation, expectedContext: CONTEXT, expectedFingerprint: {} };
  const base = { schema: "easyeda-pro-control.document-source.v1", document: { uuid: "board", docType: "PCB", editVersion: "3.2.149.88089769" }, objects: [] };
  const source = { ...base, sha256: sha256Json(base) };
  const journal: DispatchOperationJournal = { schema: OPERATION_SCHEMA, operationId, journalPath: artifacts.operationPath(operationId), plan, planHash: buildPlanHash(plan),
    state: "commit-needs-recovery", mutationState: "after", saved: false, reopened: false, orphanedCallPossible: false,
    orphanedCallPhase: "reconcile-upload-barrier", hardStop: true, mutationMayHaveOccurred: true, nextSafeAction: "Inspect the lost legacy Save return.",
    context: CONTEXT, before: source, after: source, preCheckpoint: { receiptPath: "/synthetic/checkpoint" }, sequence: 0,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), artifacts: [] };
  await artifacts.createOperation(journal);
  let nativeCalls = 0;
  const engine = new engines.EasyedaControlEngine({ callTool: (): Promise<unknown> => {
    nativeCalls += 1; return Promise.reject(new Error("This regression forbids native calls"));
  } });
  await engine.controlFingerprintPromise;
  // Typed-recovery tests independently prove the authority gate. Isolate its
  // Successful, read-only completion here to exercise journalPayload before
  // The executor overwrites a legacy state while rebinding the current tab.
  t.mock.method(engine, "recoverDispatchAuthority", () => Promise.resolve());
  t.mock.method(engine, "assertContext", () => Promise.resolve({ ...CONTEXT, document: { ...CONTEXT.document, tabId: "rebound-tab" } }));
  const executor = new executors.DesignExecutor(engine);
  await assert.rejects(executor.reconcile(operationId), /Save was already attempted/u);
  await assert.rejects(executor.commit(operationId), /Save was already attempted/u);
  await executor.recoverAuthority(operationId);
  const rebound = await artifacts.loadOperation(operationId);
  assert.equal(rebound["designSaveAttempted"], true);
  assert.equal(rebound["saveAttemptProtocol"], undefined);
  assert.equal(rebound["state"], "authority-recovered-needs-reconciliation");
  assert.equal(rebound.planHash, journal.planHash);
  await assert.rejects(executor.reconcile(operationId), /Save was already attempted/u);
  await assert.rejects(executor.commit(operationId), /Save was already attempted/u);
  assert.equal(nativeCalls, 0);
  rebound["state"] = "completed"; await artifacts.updateOperation(rebound);
});
