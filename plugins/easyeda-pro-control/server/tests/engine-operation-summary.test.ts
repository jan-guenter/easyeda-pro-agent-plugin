import assert from "node:assert/strict";
import { test } from "node:test";
import { asOperationJournal, operationSummary } from "../src/engine-operation-summary.ts";
import { operationSummary as coreSummary, isRecord } from "../src/core.ts";
import type { UnknownRecord } from "../src/core.ts";
import type { OperationSummary } from "../src/engine.ts";

void test("partial records keep each original core fallback and reject non-record inputs", () => {
  for (const field of ["operationId", "planHash", "state", "mutationState", "saved", "reopened", "hardStop", "mutationMayHaveOccurred", "nextSafeAction", "journalPath", "updatedAt"]) {
    const value = complete(); assert.ok(Reflect.deleteProperty(value, field));
    assert.deepEqual(operationSummary(asOperationJournal(value)), coreSummary(value));
  }
  for (const value of [null, false, 5, [], "journal"]) {
    assert.throws(() => asOperationJournal(value), { name: "TypeError", message: "Operation journal must be an object." });
  }
});

function complete(): UnknownRecord {
  return { operationId: "easyeda-summary-00000001", planHash: "a".repeat(64), state: "apply-unknown",
    mutationState: "unknown", saved: false, reopened: false, hardStop: true, mutationMayHaveOccurred: true,
    nextSafeAction: "Inspect retained evidence.", journalPath: "/synthetic/operation.json", updatedAt: "2026-10-12T00:00:00.000Z",
    orphanedCallPossible: true, orphanedCallPhase: 7, runtimeRestartChallenge: "challenge", runtimeRestartChallengeIssuedAt: "retained-time",
    runtimeRestartBoundary: { retained: "unmodified boundary" }, unknownPhase: { unknown: true },
    preCheckpoint: { receiptPath: "/synthetic/pre.json", checkpoint: "/synthetic/pre.eprj2" },
    finalCheckpoint: { receiptPath: "/synthetic/final.json", checkpoint: "/synthetic/final.eprj2" },
    artifacts: Array.from({ length: 15 }, (_item, index) => ({ path: `/synthetic/phase-${index}.json`, sha256: "b".repeat(64), bytes: index + 1 })),
    lastError: { name: "SyntheticError", message: "retained diagnostic" } };
}

void test("complete projection keeps recent artifacts and checkpoints while sanitizing optional strings", () => {
  const input = complete();
  const value: OperationSummary = operationSummary(asOperationJournal(input));
  const untyped = coreSummary(input);
  assert.equal(value.orphanedCallPhase, undefined); assert.equal(value.unknownPhase, undefined);
  assert.equal(value.orphanedCallPossible, true); assert.equal(value.runtimeRestartChallenge, "challenge");
  assert.equal(value.runtimeRestartChallengeIssuedAt, "retained-time");
  assert.equal(value.runtimeRestartBoundary, input["runtimeRestartBoundary"]);
  assert.deepEqual(value.checkpoints, untyped.checkpoints); assert.deepEqual(value.artifacts, untyped.artifacts);
  assert.ok(isRecord(value.artifacts)); assert.equal(value.artifacts.count, 15);
  assert.ok(Array.isArray(value.artifacts.recent)); assert.equal(value.artifacts.recent.length, 12);
  assert.ok(isRecord(value.checkpoints)); assert.ok(isRecord(value.checkpoints.pre));
  assert.equal(value.checkpoints.pre.receiptPath, "/synthetic/pre.json");
  assert.deepEqual(value.lastError, { name: "SyntheticError", message: "retained diagnostic" });
});
void test("incomplete records retain the original unsanitized core fallback and caller input", () => {
  const input = complete(); delete input["planHash"];
  const before = structuredClone(input), expected = coreSummary(input);
  assert.deepEqual(operationSummary(asOperationJournal(input)), expected);
  assert.equal(expected.orphanedCallPhase, 7); assert.deepEqual(expected.unknownPhase, { unknown: true });
  assert.deepEqual(input, before);
});
