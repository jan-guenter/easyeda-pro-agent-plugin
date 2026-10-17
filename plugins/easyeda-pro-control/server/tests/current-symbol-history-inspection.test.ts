import assert from "node:assert/strict";
import { appendFile, readFile } from "node:fs/promises";
import { test } from "node:test";
import { createOperation, operationPath, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash } from "../src/core.ts";
import { CurrentDisposableOpenCoordinator } from "../src/current-disposable-open-runtime.ts";
import { inspectCurrentSymbolHistory } from "../src/current-symbol-history-inspection.ts";

type Value = Record<string, unknown>;
type Purpose = "disposable-validation" | "ordinary-symbol-metadata";
const HASH = "a".repeat(64);
const BASELINE = "easyeda-pro-control.current-symbol-closed-baseline.v1";
const WRITER = "easyeda-pro-control.current-symbol-writer.v1";
const VERIFICATION = "easyeda-pro-control.current-symbol-verification.v1";
function plans(purpose: Purpose): readonly Value[] {
  const baseline = { profile: BASELINE, purpose, target: { rawWindowsPath: "C:\\must-not-read\\private.eprj2" } };
  const writer = { profile: WRITER, baselinePlan: baseline, baselineJournalSha256: HASH, baselineCopyReceiptSha256: HASH, startupSha256: HASH };
  return [baseline, writer, { profile: VERIFICATION, writerPlan: writer, writerJournalSha256: HASH, posteditCopyReceiptSha256: HASH }];
}
async function persist(operationId: string, plan: Value, fields: Value = {}): Promise<Value> {
  const artifact = await writePhaseArtifact(operationId, 1, "historical-result", { privateDiagnostic: "Do not copy this payload into the summary." });
  const journal = { schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), plan, planHash: buildPlanHash(plan),
    state: "plan-invalidated", sequence: 1, artifacts: [artifact], hardStop: false, orphanedCallPossible: false,
    mutationMayHaveOccurred: true, finishSnapshotFailed: false, nextSafeAction: "Untrusted historical action text.", ...fields };
  await createOperation(journal); return journal;
}
function noNativeCoordinator(): { coordinator: CurrentDisposableOpenCoordinator; calls: () => number } {
  let calls = 0;
  const forbidden = (): never => { calls += 1; throw new Error("Historical inspection must not touch a runtime or bridge."); };
  return { calls: (): number => calls, coordinator: new CurrentDisposableOpenCoordinator({ assertOwner: forbidden, runtime: forbidden,
    engine: { assertBridgeDispatchAllowed: forbidden, assertNativeUiEditingAllowed: forbidden, assertRecoveryOperationIsolated: forbidden,
      assertBridgeAndRecoveryAdmission: forbidden, assertBridgeAndNativeUiEditingAdmission: forbidden, dispatchWithOrphanTracking: forbidden,
      status: forbidden, executionAuthorityValidator: undefined, upstream: { callTool: forbidden } } }) };
}

void test("historical baseline, writer and verifier inspection keeps both purposes local and non-resumable", async () => {
  for (const purpose of ["disposable-validation", "ordinary-symbol-metadata"] as const) {
    for (const [index, plan] of plans(purpose).entries()) {
      const operationId = `history-${purpose}-${index}`;
      const journal = await persist(operationId, plan);
      const before = await readFile(operationPath(operationId));
      const value = noNativeCoordinator();
      const request = { action: purpose === "disposable-validation" ? "validation-inspect" : "metadata-inspect", operationId };
      const result = purpose === "disposable-validation" ? await value.coordinator.run(request) : await value.coordinator.runOrdinary(request);
      assert.deepEqual(result, { profile: "easyeda-pro-control.current-symbol-historical-inspection.v1", operationId, purpose,
        journalPath: operationPath(operationId), recordedPlanProfile: plan["profile"], recordedState: "plan-invalidated", recordedSequence: 1,
        recordedFlags: { hardStop: false, orphanedCallPossible: false, mutationMayHaveOccurred: true, finishSnapshotFailed: false }, artifacts: journal["artifacts"],
        historicalEvidenceOnly: true, currentStateVerified: false, originalOwnerRetained: false,
        continuationAuthorized: false, replayAllowed: false, executionAuthorized: false });
      for (const key of ["nextPhase", "lastResult", "nextSafeAction", "forwardVerified", "inverseVerified", "metadataRestorationVerified", "clockSidecar"]) {
        assert.equal(Object.hasOwn(result, key), false);
      }
      assert.equal(JSON.stringify(result).includes("privateDiagnostic"), false);
      assert.equal(JSON.stringify(result).includes("must-not-read"), false);
      assert.equal(value.calls(), 0); assert.deepEqual(await readFile(operationPath(operationId)), before);
      const opposite: Purpose = purpose === "disposable-validation" ? "ordinary-symbol-metadata" : "disposable-validation";
      await assert.rejects(inspectCurrentSymbolHistory(operationId, opposite), /identity or purpose/u);
      await assert.rejects(value.coordinator.run({ action: "validation-begin", operationId, confirmDisposableProject: true }), /original production opening owner/u);
      await assert.rejects(value.coordinator.runOrdinary({ action: "metadata-begin", operationId, confirmWrite: true }), /original production opening owner/u);
      await assert.rejects(value.coordinator.run({ action: "validation-advance", operationId,
        step: { expectedPhase: "forward-write", confirmDisposableProject: true, acceptMetadataMutation: true } }), /original production opening owner/u);
      await assert.rejects(value.coordinator.runOrdinary({ action: "metadata-advance", operationId,
        step: { expectedPhase: "forward-write", confirmWrite: true, acceptMetadataMutation: true } }), /original production opening owner/u);
      assert.equal(value.calls(), 0);
    }
  }
});

void test("historical inspection rejects missing or malformed purpose, wrapper chain and recorded fields", async () => {
  const [baseline, writer, verification] = plans("disposable-validation");
  assert.ok(baseline && writer && verification);
  const invalid = [
    { plan: { profile: BASELINE } },
    { plan: { ...baseline, purpose: "caller" } },
    { plan: { ...writer, baselinePlan: writer } },
    { plan: { ...verification, writerPlan: baseline } },
    { plan: { ...writer, purpose: "ordinary-symbol-metadata" } },
    { plan: { ...verification, extra: true } },
    { plan: { profile: "easyeda-pro-control.current-disposable-open.v1", purpose: "disposable-validation" } },
    { plan: writer, fields: { journalPath: "/unrelated/history.json" } },
    { plan: writer, fields: { hardStop: "false" } },
    { plan: writer, fields: { sequence: -1 } },
    { plan: writer, fields: { state: "x".repeat(161) } },
  ];
  for (const [index, item] of invalid.entries()) {
    const operationId = `history-invalid-${index}`;
    await persist(operationId, item.plan, item.fields); await assert.rejects(inspectCurrentSymbolHistory(operationId, "disposable-validation"));
  }
  await assert.rejects(inspectCurrentSymbolHistory("../unsafe-operation", "disposable-validation"));
});

void test("historical inspection rechecks artifact bytes on every call", async () => {
  const operationId = "history-changed-artifact", plan = plans("disposable-validation")[1]; assert.ok(plan);
  await persist(operationId, plan); await inspectCurrentSymbolHistory(operationId, "disposable-validation");
  await appendFile(operationPath(operationId).replace(/\.json$/u, "/01-historical-result.json"), " ");
  await assert.rejects(inspectCurrentSymbolHistory(operationId, "disposable-validation"), /artifact failed hash verification/u);
});

void test("historical inspection forbids replacement fingerprints before local reads", async () => {
  const operationId = "history-missing-operation", value = noNativeCoordinator();
  await assert.rejects(value.coordinator.run({ action: "validation-inspect", operationId }, {}), /cannot replace/u);
  await assert.rejects(value.coordinator.runOrdinary({ action: "metadata-inspect", operationId }, {}), /cannot replace/u);
  assert.equal(value.calls(), 0);
});
