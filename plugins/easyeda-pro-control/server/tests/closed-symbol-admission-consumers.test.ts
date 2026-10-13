/* oxlint-disable import/max-dependencies -- Exercise all five real default admission callers with one isolated managed journal and no native transport. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { before, test } from "node:test";
import { createOperation, listOperationStates, loadOperation, operationPath, updateOperation } from "../src/artifacts.ts";
import { RuleCheckExecutor } from "../src/check-execution.ts";
import { FAMILY } from "../src/closed-symbol-journal.ts";
import { OPERATION_SCHEMA, buildPlanHash, newOperationId } from "../src/core.ts";
import { DesignExecutor } from "../src/design-execution.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import { LibraryExecutor } from "../src/library-execution.ts";
import { discardCloseConfirmation } from "../src/native-close-recovery.ts";
import { ProjectOpenExecutor } from "../src/project-open-execution.ts";
import { context, fingerprint } from "./pcb-selected-objects-fixture.ts";

const operationId = newOperationId();
const afterAdmission = new Error("Synthetic boundary after default admission");
let downstreamCalls = 0;
function stopAfterAdmission(): Promise<never> {
  downstreamCalls += 1;
  return Promise.reject(afterAdmission);
}
class InertEngine extends EasyedaControlEngine {
  private readonly afterAdmission = stopAfterAdmission;
  public override status(): Promise<never> { return this.afterAdmission(); }
}
const engine = new InertEngine({ callTool: stopAfterAdmission }, {
  executionAuthorityValidator: { capture: stopAfterAdmission, proveTerminated: stopAfterAdmission },
});
before(async () => {
  await engine.controlFingerprintPromise;
  const plan = { profile: "synthetic.legacy" };
  await createOperation({ schema: OPERATION_SCHEMA, operationId, plan, planHash: buildPlanHash(plan),
    state: "completed", artifacts: [], orphanedCallPossible: false });
});
async function selectProfile(profile: string): Promise<Buffer> {
  const journal = await loadOperation(operationId), plan = { profile };
  await updateOperation({ ...journal, plan, planHash: buildPlanHash(plan) });
  return readFile(operationPath(operationId));
}
const footprintContext = { ...context, document: { ...context.document, documentType: 4 } };
interface Consumer { readonly name: string; readonly invoke: () => Promise<unknown>; readonly refusal: RegExp }
const consumers: readonly Consumer[] = [
  { name: "library execution", invoke: () => new LibraryExecutor(engine).execute({
    operation: { id: "synthetic-get", action: "library.footprint.get", libraryUuid: "library", target: { uuid: "asset" } },
    expectedContext: footprintContext, expectedFingerprint: fingerprint(),
  }), refusal: /incomplete transaction before library execution/u },
  { name: "design execution", invoke: () => new DesignExecutor(engine).apply({
    operation: { id: "synthetic-line", action: "footprint.line.modify", target: { primitiveId: "line" }, patch: { lineWidth: 8 } },
    expectedContext: footprintContext, expectedFingerprint: fingerprint(), confirmWrite: true,
  }), refusal: /incomplete transaction before another design write/u },
  { name: "native rule check", invoke: () => new RuleCheckExecutor(engine).run({
    kind: "pcb-drc", expectedContext: context, expectedFingerprint: fingerprint(),
  }), refusal: /incomplete operation before running a native check/u },
  { name: "project opening", invoke: () => new ProjectOpenExecutor(engine).openExisting({
    action: "open-existing", projectUuid: "a".repeat(32), projectPath: "/synthetic/project.eprj2",
    documentUuid: "board", documentType: 3, expectedFingerprint: fingerprint(), confirmOpen: true,
  }), refusal: /incomplete transaction before opening another target/u },
];
async function checkConsumer(consumer: Consumer): Promise<void> {
    for (const profile of [FAMILY, FAMILY.replace(".v1", ".v2")]) {
      const original = await selectProfile(profile), priorCalls = downstreamCalls;
      const rawStates = await listOperationStates();
      assert.equal(rawStates.find((entry) => entry["operationId"] === operationId)?.["state"], "completed");
      await assert.rejects(consumer.invoke(), consumer.refusal);
      assert.equal(downstreamCalls, priorCalls);
      assert.deepEqual(await readFile(operationPath(operationId)), original);
    }
    const legacy = await selectProfile("synthetic.legacy"), priorCalls = downstreamCalls;
    await assert.rejects(consumer.invoke(), (error: unknown) => error === afterAdmission);
    assert.equal(downstreamCalls, priorCalls + 1);
    assert.deepEqual(await readFile(operationPath(operationId)), legacy);
}
for (const consumer of consumers) {
  void test(`${consumer.name} default refuses reserved completion claims before runtime and preserves legacy completion`, () => checkConsumer(consumer));
}
void test("discard-close default counts an invalid terminal as a second pending operation before journal or native access", async () => {
  const pendingId = newOperationId(), plan = { profile: "synthetic.pending" };
  await createOperation({ schema: OPERATION_SCHEMA, operationId: pendingId, plan, planHash: buildPlanHash(plan),
    state: "apply-needs-review", artifacts: [], orphanedCallPossible: false });
  const request = { action: "discard-close-confirmation", operationId: pendingId, windowHandle: "65537", confirmUIWrite: true, discardOwnUnsavedChanges: true,
    appBinding: { authority: "observed-unowned", rootPid: 101, rootStartTicks: "639247676666923462", executable: String.raw`C:\Synthetic\easyeda-pro.exe`, executableSha256: "b".repeat(64) },
    target: { projectUuid: "project", documentUuid: "footprint", documentType: 4 },
    capture: { receiptPath: "/synthetic/capture.receipt.json", receiptSha256: "c".repeat(64), imageSha256: "d".repeat(64) },
    observedDialog: { title: "Confirm Close", targetName: "Synthetic", onlyUnsavedTarget: true, discardButton: { label: "Leave this page", x: 300, y: 300 } } };
  const invoke = (): Promise<unknown> => discardCloseConfirmation(request, { runRecoveryCloseClick: stopAfterAdmission }, { load: stopAfterAdmission });
  const original = await selectProfile(FAMILY), priorCalls = downstreamCalls;
  await assert.rejects(invoke(), /exactly its one pending operation/u);
  assert.equal(downstreamCalls, priorCalls);
  assert.deepEqual(await readFile(operationPath(operationId)), original);
  await selectProfile("synthetic.legacy");
  await assert.rejects(invoke(), (error: unknown) => error === afterAdmission);
  assert.equal(downstreamCalls, priorCalls + 1);
});
