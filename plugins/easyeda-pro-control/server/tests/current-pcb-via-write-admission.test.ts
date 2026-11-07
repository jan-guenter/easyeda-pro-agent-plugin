/** Actual managed journals and global admission. These synthetic historical
 * records issue no private plan, native owner, SQL query or CAD operation. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { test } from "node:test";
import { createOperation, loadOperation, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, sha256Json } from "../src/core.ts";
import { scanQualifiedAdmissionOperations } from "../src/closed-symbol-terminal-admission.ts";
import { inspectCurrentPcbViaWriteAdmission } from "../src/current-pcb-via-write-admission.ts";
import type { assertCurrentPcbViaWriteJournalChain } from "../src/current-pcb-via-write-journal.ts";

type Entry = Parameters<typeof assertCurrentPcbViaWriteJournalChain>[0][number];
async function fixture(terminal: boolean): Promise<string> {
  const operationId = `pcb209-via-write-admission-${randomUUID()}`, originalPlan = { operationId, syntheticHistoricalData: true };
  const plan = { profile: "private.pcb209-via-write-journal.v2", plan: originalPlan, nonce: "a".repeat(64) };
  const records: Entry[] = [];
  const add = (kind: Entry["kind"], evidence: Entry["evidence"]): void => {
    records.push({ schema: "easyeda-pro-control.pcb209-via-write-record.v2", operationId, sequence: records.length,
      previousSha256: records.length === 0 ? null : sha256Json(records.at(-1)), kind, evidence, inverseAvailable: false });
  };
  add("operation-intent", { plan: originalPlan });
  if (terminal) { add("failure", { synthetic: true }); add("no-allocation", { allocationNeverEntered: true }); }
  const artifacts = [];
  for (const entry of records) { artifacts.push(await writePhaseArtifact(operationId, entry.sequence, entry.kind, entry)); }
  await createOperation({ schema: OPERATION_SCHEMA, operationId, plan, planHash: buildPlanHash(plan), state: terminal ? "completed" : "prepared", records, artifacts });
  return operationId;
}
async function selected(operationId: string): Promise<Awaited<ReturnType<typeof scanQualifiedAdmissionOperations>>[number] | undefined> {
  const rows = await scanQualifiedAdmissionOperations(); return rows.find(row => row.summary.operationId === operationId);
}
void test("fresh full private terminal chain clears only its blocker and changed phase bytes quarantine it again", async () => {
  const operationId = await fixture(true); const operation = await loadOperation(operationId);
  assert.equal(await selected(operationId), undefined);
  const expected = { operationId, storedJournalSha256: String(operation["journalSha256"]), entireStoredJournalSha256: sha256Json(operation) };
  assert.deepEqual(await inspectCurrentPcbViaWriteAdmission(expected), { terminal: true });
  const artifact = operation.artifacts?.[0]; assert.ok(artifact !== undefined);
  await writeFile(artifact.path, "changed synthetic phase\n");
  const result = await selected(operationId); assert.ok(result?.bridgeBlocking === true); assert.ok(result.unfinished);
  assert.equal(result.executionAuthorized, false); assert.equal(result.authorityRestored, false);
});
void test("a private unfinished operation quarantines bridge dispatch even when generic orphan flags are absent", async () => {
  const operationId = await fixture(false), result = await selected(operationId); assert.ok(result);
  assert.equal(result.qualification, "incomplete"); assert.equal(result.bridgeBlocking, true); assert.equal(result.unfinished, true);
  assert.equal(result.summary.orphanedCallPossible, true); assert.equal(result.replayAllowed, false);
});
void test("a completed manifest cannot hide an incomplete private chain or a different reserved-family profile", async () => {
  const operationId = await fixture(false); const operation = await loadOperation(operationId);
  await updateOperation({ ...operation, state: "completed", orphanedCallPossible: false });
  let result = await selected(operationId); assert.ok(result?.bridgeBlocking === true); assert.ok(result.unfinished);
  const changed = await loadOperation(operationId), plan = { profile: "unrelated", plan: { operationId } };
  await updateOperation({ ...changed, plan, planHash: buildPlanHash(plan) });
  result = await selected(operationId); assert.ok(result?.bridgeBlocking === true); assert.equal(result.executionAuthorized, false);
});
void test("a snapshot descriptor cannot accept another journal or a changed nested plan", async () => {
  const operationId = await fixture(true); const operation = await loadOperation(operationId);
  const expected = { operationId, storedJournalSha256: String(operation["journalSha256"]), entireStoredJournalSha256: sha256Json(operation) };
  const plan = { profile: "private.pcb209-via-write-journal.v2", plan: { operationId, changed: true } };
  await updateOperation({ ...operation, plan, planHash: buildPlanHash(plan) });
  await assert.rejects(inspectCurrentPcbViaWriteAdmission(expected), /JOURNAL_CHANGED/u);
  const result = await selected(operationId); assert.ok(result?.bridgeBlocking === true);
});
