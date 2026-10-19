import assert from "node:assert/strict";
import { lstat, readFile, rename, symlink, unlink, utimes, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { mock, test } from "node:test";
import { createOperation, createOperationScanner, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { listQualifiedOperationStates, observeQualifiedAdmissionOperations, scanQualifiedAdmissionOperations } from "../src/closed-symbol-terminal-admission.ts";
import { OPERATION_SCHEMA, buildPlanHash, isTerminalOperation, operationHasOrphanedCallRisk } from "../src/core.ts";
import { asOperationJournal, operationSummary } from "../src/engine-operation-summary.ts";

const COUNT = 390;
const PREFIX = "easyeda-compact-admission-";
const plan = { profile: "synthetic.legacy", name: "Synthetic compact cache measurement" };
const planHash = buildPlanHash(plan);
const idAt = (index: number): string => `${PREFIX}${String(index).padStart(3, "0")}`;

void test("390 completed legacy projections fit the existing cache without changing fresh checks or public views", async (context) => {
  // Twelve references reproduce the retained summary's maximum recent list.
  // They deliberately share one synthetic phase file per journal; the scanner
  // Still validates every descriptor, exactly as it did before this change.
  for (let index = 0; index < COUNT; index += 1) {
    const operationId = idAt(index);
    const artifact = await writePhaseArtifact(operationId, 1, `baseline-${"bounded-synthetic-phase-".repeat(4)}`, { state: "before" });
    await createOperation({ schema: OPERATION_SCHEMA, operationId, plan, planHash, state: "completed", mutationState: "after",
      saved: true, reopened: true, hardStop: false, mutationMayHaveOccurred: true, orphanedCallPossible: false,
      nextSafeAction: "Preserve this synthetic completed journal; it grants no authority.",
      journalPath: operationPath(operationId), updatedAt: "2026-10-19T00:00:00.000Z", artifacts: Array.from({ length: 12 }, () => artifact),
      retainedPayload: "synthetic-only ".repeat(256) });
  }
  // This is the former legacy projection through the unchanged actual scanner,
  // With the same 512-entry, 1-MiB aggregate and 32-KiB per-entry cache limits.
  const richScan = createOperationScanner((operation) => ({
    bridgeBlocking: operation["state"] === "journal-unreadable" || operationHasOrphanedCallRisk(operation),
    unfinished: !isTerminalOperation(operation), summary: operationSummary(asOperationJournal(operation)),
    classification: "legacy", terminal: null, incomplete: null,
  }));
  const originalParse = JSON.parse;
  let parses = 0;
  const parseObserver = mock.method(JSON, "parse", (...args: Parameters<typeof JSON.parse>): unknown => {
    if (args[0].includes(`"operationId": "${PREFIX}`)) { parses += 1; }
    const result: unknown = Reflect.apply(originalParse, JSON, args);
    return result;
  });
  const measurements: { name: string; journalParses: number; elapsedMs: number }[] = [];
  async function measure<T>(name: string, run: () => Promise<T>): Promise<T> {
    parses = 0;
    const start = performance.now();
    const result = await run();
    measurements.push({ name, journalParses: parses, elapsedMs: Math.round(performance.now() - start) });
    return result;
  }
  try {
    const richCold = await measure("prior-rich-cold", richScan);
    const richWarm = await measure("prior-rich-warm", richScan);
    assert.equal(measurements[0]?.journalParses, COUNT);
    const richMisses = measurements[1]?.journalParses;
    assert.ok(typeof richMisses === "number" && richMisses > 0 && richMisses < COUNT);
    assert.deepEqual(richWarm, richCold);
    const expectedStates = richCold.map((candidate) => ({ operationId: candidate.summary.operationId, state: candidate.summary.state,
      recordedState: candidate.summary.state, qualification: "legacy" }));
    const compactCold = await measure("compact-cold", listQualifiedOperationStates);
    const compactWarm = await measure("compact-warm", listQualifiedOperationStates);
    assert.equal(measurements[2]?.journalParses, COUNT);
    assert.equal(measurements[3]?.journalParses, 0);
    assert.deepEqual(compactCold, expectedStates);
    assert.deepEqual(compactWarm, expectedStates);
    context.diagnostic(`Synthetic managed-journal measurements only; not connected latency: ${JSON.stringify(measurements)}`);
  } finally { parseObserver.mock.restore(); }

  // Keep the target's warm projection but remove the other synthetic journal
  // Entries before the focused corruption cases. No further capacity claim is
  // Made, and their private phase files remain for normal test-root cleanup.
  for (let index = 1; index < COUNT; index += 1) { await unlink(operationPath(idAt(index))); }
  const observed = await observeQualifiedAdmissionOperations();
  assert.deepEqual(observed.operations, []);
  assert.equal(observed.diagnostics.journalCount, 1);
  assert.deepEqual(observed.diagnostics.candidateCounts, { legacy: 1, incomplete: 0, invalid: 0, terminal: 0, "current-baseline": 0 });
  const targetId = idAt(0);
  const path = operationPath(targetId), target = await loadOperation(targetId);
  const descriptor = target.artifacts?.[0]; assert.ok(descriptor);
  for (const changedPath of [path, descriptor.path]) {
    const info = await lstat(changedPath), original = await readFile(changedPath, "utf8");
    const changed = changedPath === path ? original.replace('"completed"', '"tampered!"') : original.replace("before", "forged");
    assert.notEqual(changed, original); assert.equal(Buffer.byteLength(changed), Buffer.byteLength(original));
    await writeFile(changedPath, changed); await utimes(changedPath, info.atime, info.mtime);
    const entries = await scanQualifiedAdmissionOperations();
    assert.equal(entries.length, 1);
    assert.equal(entries[0]?.summary.operationId, targetId);
    assert.equal(entries[0]?.summary.state, "journal-unreadable");
    assert.equal(entries[0]?.bridgeBlocking, true);
    await writeFile(changedPath, original);
    assert.deepEqual(await scanQualifiedAdmissionOperations(), []);
    const retained = `${changedPath}.retained`;
    await rename(changedPath, retained); await symlink(retained, changedPath);
    const substituted = await scanQualifiedAdmissionOperations();
    assert.equal(substituted.length, 1); assert.equal(substituted[0]?.summary.state, "journal-unreadable");
    await unlink(changedPath); await rename(retained, changedPath);
    assert.deepEqual(await scanQualifiedAdmissionOperations(), []);
  }
  for (const patch of [
    { state: "applied-unsaved", orphanedCallPossible: false },
    { state: "completed", orphanedCallPossible: true },
  ]) {
    await updateOperation({ ...target, ...patch });
    const expectedSummary = operationSummary(await loadOperation(targetId));
    const entries = await scanQualifiedAdmissionOperations();
    assert.equal(entries.length, 1); assert.deepEqual(entries[0]?.summary, expectedSummary);
    assert.equal(entries[0]?.bridgeBlocking, patch.orphanedCallPossible);
    assert.equal(entries[0]?.unfinished, patch.state !== "completed");
  }
  // A reserved-family claim remains rich and fails closed even with a terminal
  // State. A previous compact hit cannot survive this valid changed journal.
  const reservedPlan = { profile: "easyeda-pro-control.project-symbol-closed-session.v1" };
  await updateOperation({ ...target, plan: reservedPlan, planHash: buildPlanHash(reservedPlan) });
  const reserved = await scanQualifiedAdmissionOperations();
  assert.equal(reserved.length, 1); assert.equal(reserved[0]?.qualification, "terminal-evidence-invalid");
  assert.equal(reserved[0]?.bridgeBlocking, true);
  assert.deepEqual(reserved[0]?.summary.artifacts, operationSummary(await loadOperation(targetId)).artifacts);
});
