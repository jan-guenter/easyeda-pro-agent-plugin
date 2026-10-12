import assert from "node:assert/strict";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { test } from "node:test";
import { createOperation, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, newOperationId } from "../src/core.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { DispatchOperationJournal } from "../src/engine.ts";
import { LEGACY_RECOVERY_FAMILY_REFUSAL, assertLegacyRecoveryJournalFamily } from "../src/legacy-recovery-family.ts";

const profiles = ["easyeda-pro-control.typed-design-transaction.v1", "easyeda-pro-control.library-execution.v1",
  "easyeda-pro-control.rule-check-transaction.v1", "easyeda-pro-control.project-open.v1"] as const;
const refusal = { message: LEGACY_RECOVERY_FAMILY_REFUSAL };
const legacyPlan = { expectedContext: { project: {}, document: {} }, expectedFingerprint: {}, applyCall: {}, checkpoint: {},
  targetPrimitiveIds: [], targetChanges: [], preflightCalls: [], verifyCalls: [], rollbackCalls: [], reopenedVerifyCalls: [], capabilityLevel: "historical" };

async function fixture(profile: string, state: string, documentType: number): Promise<DispatchOperationJournal> {
  const operationId = newOperationId();
  const context = { project: { uuid: "synthetic", path: "/synthetic/never-open.eprj2" }, document: { uuid: "document", documentType } };
  const plan = { profile, operation: { id: "synthetic", action: "retained-synthetic-action" }, expectedContext: context, expectedFingerprint: {} };
  const journal: DispatchOperationJournal = { schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), plan, planHash: buildPlanHash(plan),
    context, state, mutationState: "after", saved: state === "completed", reopened: state === "completed", hardStop: true,
    orphanedCallPossible: false, mutationMayHaveOccurred: true, nextSafeAction: "Read-only synthetic cross-family fixture.", sequence: 0,
    updatedAt: "2026-10-12T00:00:00Z", artifacts: [], preCheckpoint: { receiptPath: "/synthetic/never-read.json" } };
  await createOperation(journal);
  journal.artifacts.push(await writePhaseArtifact(operationId, 1, "before", { syntheticHistoricalEvidence: true }));
  journal.sequence = 1; await updateOperation(journal);
  return journal;
}

function recover(operationId: string, resolution: string, accesses: PropertyKey[]): Promise<unknown> {
  const receiver = new Proxy({}, { get: (_target, key): never => {
    accesses.push(key); throw new Error(`Unexpected legacy engine access: ${String(key)}`);
  } });
  // Invoke the maintained method with no successful engine seams. The family
  // Check must run after managed loading, before even the isolation method.
  const method: unknown = Reflect.get(EasyedaControlEngine.prototype, "recover"); assert.ok(typeof method === "function");
  const result: unknown = Reflect.apply(method, receiver, [operationId, resolution]);
  assert.ok(result instanceof Promise);
  return result;
}

for (const profile of profiles) {
  for (const state of ["planned", "applied-unsaved", "library-needs-review", "completed"]) {
    void test(`legacy recovery refuses ${profile} ${state} before isolation, runtime, navigation or journal rewriting`, async () => {
      for (const documentType of [1, 2, 3, 4]) {
        const journal = await fixture(profile, state, documentType), paths = [journal.journalPath, ...journal.artifacts.map((artifact) => artifact.path)];
        const names = await readdir(dirname(journal.journalPath)), original = await Promise.all(paths.map((path) => readFile(path)));
        const accesses: PropertyKey[] = [];
        for (const resolution of ["reconciled-no-mutation", "reconciled-applied-unsaved", "reconciled-saved-reopened"]) {
          await assert.rejects(recover(journal.operationId, resolution, accesses), refusal);
        }
        assert.deepEqual(accesses, []);
        assert.deepEqual(await Promise.all(paths.map((path) => readFile(path))), original);
        assert.deepEqual(await readdir(dirname(journal.journalPath)), names);
      }
    });
  }
}

void test("family classifier rejects every other owner, malformed legacy shapes and profiled collisions", () => {
  for (const profile of profiles) { assert.throws(() => { assertLegacyRecoveryJournalFamily({ plan: { profile } }); }, refusal); }
  for (const value of [undefined, null, {}, { plan: null }, { plan: {} }, { plan: { profile: "unrecognized-profile" } }]) {
    assert.throws(() => { assertLegacyRecoveryJournalFamily(value); }, refusal);
  }
  for (const key of Object.keys(legacyPlan)) {
    const incomplete = { ...legacyPlan }; Reflect.deleteProperty(incomplete, key);
    assert.throws(() => { assertLegacyRecoveryJournalFamily({ plan: incomplete }); }, refusal);
  }
  for (const profile of [...profiles, "future-family", undefined, null]) {
    assert.throws(() => { assertLegacyRecoveryJournalFamily({ plan: { ...legacyPlan, profile } }); }, refusal);
  }
  assert.doesNotThrow(() => { assertLegacyRecoveryJournalFamily({ plan: legacyPlan }); });
});

void test("genuine legacy shape continues to the existing isolation gate rather than receiving new authority", async () => {
  const journal = await fixture(profiles[0], "applied-unsaved", 3);
  journal.plan = structuredClone(legacyPlan); journal.planHash = buildPlanHash(journal.plan); await updateOperation(journal);
  const accesses: PropertyKey[] = [], original = await readFile(journal.journalPath);
  await assert.rejects(recover(journal.operationId, "reconciled-no-mutation", accesses), /Unexpected legacy engine access: assertRecoveryOperationIsolated/u);
  assert.deepEqual(accesses, ["assertRecoveryOperationIsolated"]);
  assert.deepEqual(await readFile(journal.journalPath), original);
});

void test("cross-family refusal never bypasses managed retained-artifact hash verification", async () => {
  const journal = await fixture(profiles[0], "applied-unsaved", 3), original = await readFile(journal.journalPath);
  const artifact = journal.artifacts[0]; assert.ok(artifact);
  await writeFile(artifact.path, "{}\n");
  const accesses: PropertyKey[] = [];
  await assert.rejects(recover(journal.operationId, "reconciled-no-mutation", accesses), /phase artifact.*hash/u);
  assert.deepEqual(accesses, []); assert.deepEqual(await readFile(journal.journalPath), original);
});
