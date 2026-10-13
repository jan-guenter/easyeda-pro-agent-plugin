/* oxlint-disable import/max-dependencies -- Bind retained synthetic text phases, consumed Save evidence and managed journals to the real refused coordinator. */
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname } from "node:path";
import { createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, newOperationId } from "../src/core.ts";
import { DesignExecutor } from "../src/design-execution.ts";
import { DESIGN_STRUCTURE_LIFECYCLE_REFUSAL } from "../src/design-execution-lifecycle.ts";
import { inspectDesignSaveAttempts } from "../src/design-save-attempt.ts";
import type { DispatchOperationJournal } from "../src/engine.ts";
import { noAuthorityExecutor } from "./design-structure-transaction-fixture.ts";
import { CREATED, fixture, recolor } from "./pcb-text-retained-save-fixture.ts";

export type TextHistoryScenario = "acknowledged" | "missing-return" | "foreign-return" | "wrong-primitive" | "missing-preparation" |
  "orphaned" | "collateral-observation" | "duplicate-intent" | "cancelled-intent" | "inverse";

/** Construct new synthetic history using the maintained raw-source fixture.
 * The former extracted-body tests depended on enabled PCB execution. These
 * records grant no runtime authority and are never labelled live validation.
 */
export async function assertBlockedTextHistory(legacy: boolean, saved: boolean, scenario: TextHistoryScenario, terminal = false): Promise<void> {
  const operationId = newOperationId(), value = fixture(legacy);
  const plan = { ...value.journal.plan, profile: "easyeda-pro-control.typed-design-transaction.v1", expectedFingerprint: {} };
  const planHash = buildPlanHash(plan);
  const journal: DispatchOperationJournal = { ...value.journal, schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), plan, planHash,
    state: terminal ? "completed" : "apply-needs-review", mutationState: "after", saved: terminal, reopened: terminal,
    hardStop: !terminal, orphanedCallPossible: scenario === "orphaned", mutationMayHaveOccurred: true,
    nextSafeAction: "Synthetic historical text evidence; never repeat creation or Save.", sequence: 0, artifacts: [], updatedAt: "2026-10-12T00:00:00Z",
    preCheckpoint: { checkpoint: "/synthetic/not-opened.eprj2", receiptPath: "/synthetic/not-opened.json" },
    inverse: { id: "synthetic-inverse", action: "pcb.text.delete", target: { primitiveId: CREATED } } };
  const phases: [string, unknown][] = [["before", value.phases.before], ["prepared", value.phases.prepared]];
  if (scenario === "missing-preparation") { phases.pop(); }
  if (scenario !== "missing-return" || saved) {
    const ack = { ...value.phases.apply };
    if (scenario === "foreign-return") { ack["createdId"] = "f".repeat(16); }
    if (scenario === "wrong-primitive") { ack["primitiveId"] = "f".repeat(16); }
    phases.push(["apply", ack]);
  }
  phases.push(["after", scenario === "collateral-observation" ? { ...value.phases.after, snapshot: recolor(value.current, CREATED, "#ff0000") } : value.phases.after]);
  if (saved) {
    journal.state = terminal ? "completed" : "commit-needs-recovery";
    journal["saveAttemptProtocol"] = "easyeda-pro-control.design-save-attempt.v1";
    const intent = { ...value.phases.intent, operationId, planHash, sequence: phases.length + 1 };
    phases.push(["design-save-intent", intent]);
    if (scenario === "duplicate-intent") { phases.push(["design-save-intent", { ...intent, sequence: phases.length + 1 }]); }
    if (scenario !== "missing-return") { phases.push(["save-reopen", value.phases.save]); }
    if (scenario === "cancelled-intent") { phases.push(["design-save-not-dispatched", { syntheticInvalidCancellation: true }]); }
    if (scenario === "inverse") { journal["inverseAttempted"] = true; }
  }
  await createOperation(journal);
  for (const [name, evidence] of phases) {
    journal.sequence += 1;
    journal.artifacts.push(await writePhaseArtifact(operationId, journal.sequence, name, evidence));
  }
  await updateOperation(journal);
  const paths = [journal.journalPath, ...journal.artifacts.map((artifact) => artifact.path)], retained = await loadOperation(operationId);
  const names = await readdir(dirname(journal.journalPath)), original = await Promise.all(paths.map((path) => readFile(path)));
  const run = noAuthorityExecutor();
  const inspected = await DesignExecutor.inspect(operationId);
  assert.equal(inspected["createdId"], CREATED);
  assert.deepEqual(inspected["artifacts"], journal.artifacts);
  assert.equal(inspected["executionRefusal"], DESIGN_STRUCTURE_LIFECYCLE_REFUSAL);
  assert.equal(inspected["retainedNextSafeAction"], journal.nextSafeAction);
  assert.match(String(inspected["nextSafeAction"]), /^Inspect retained evidence only\./u);
  assert.deepEqual(inspected["inverse"], { available: false, reason: "native-project-structure-lifecycle-unavailable" });
  if (terminal) {
    const result = await run.executor.reconcile(operationId);
    assert.equal(result["state"], "completed"); assert.equal(result["saved"], true); assert.equal(result["reopened"], true);
  } else {
    for (const action of ["commit", "rollback", "reconcile"] as const) {
      await assert.rejects(run.executor[action](operationId), { message: DESIGN_STRUCTURE_LIFECYCLE_REFUSAL });
    }
  }
  if (saved && scenario === "acknowledged") {
    assert.deepEqual(await inspectDesignSaveAttempts({ ...journal, after: value.journal.after }), {
      attempted: true, intentCount: 1, provenNotDispatchedCount: 0,
    });
  }
  assert.deepEqual(run.accesses, []); assert.deepEqual(await loadOperation(operationId), retained);
  assert.deepEqual(await Promise.all(paths.map((path) => readFile(path))), original);
  assert.deepEqual(await readdir(dirname(journal.journalPath)), names);
}
