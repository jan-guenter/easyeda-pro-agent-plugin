/* oxlint-disable import/max-dependencies -- Compare reconstruction with the actual original stage owners and completed retained-copy readers, not test registration hooks. */
import assert from "node:assert/strict";
import { copyFile, mkdtemp, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { assertOriginalClosedSymbolFullEvidence } from "../../src/closed-symbol-coordinator.ts";
import { reconstructClosedSymbolSqlEvidence } from "../../src/closed-symbol-recorded-sql.ts";
import type { RecordedSymbolSqlInput } from "../../src/closed-symbol-recorded-sql.ts";
import { loadClosedSymbolHistoricalPhaseJournal } from "../../src/closed-symbol-journal.ts";
import { inspectRecordedClosedCopy } from "../../src/closed-symbol-recorded-copy.ts";
import { assertOriginalClosedSymbolComparison, assertOriginalClosedSymbolPreparation } from "../../src/closed-symbol-sql-comparison.ts";
import { assertOriginalSavedSymbolSource } from "../../src/closed-symbol-saved-source.ts";
import { canonicalJson, isRecord, sha256Json } from "../../src/core.ts";
import { inventory, mutate } from "./symbol-sql-fixture.ts";
import { syntheticSqlRoot } from "./sqlite-inventory-fixture.ts";

function changed(input: RecordedSymbolSqlInput): RecordedSymbolSqlInput {
  return { ...input, journal: structuredClone(input.journal), events: structuredClone(input.events),
    witness: structuredClone(input.witness), witnessClockArtifact: structuredClone(input.witnessClockArtifact) };
}
function field(value: unknown, path: readonly string[]): unknown {
  let current = value;
  for (const key of path) { assert.ok(current !== null && typeof current === "object"); current = Reflect.get(current, key) as unknown; }
  return current;
}
function set(value: unknown, path: readonly string[], replacement: unknown): void {
  const target = field(value, path.slice(0, -1)); const key = path.at(-1);
  assert.ok(target !== null && typeof target === "object" && key !== undefined);
  Object.defineProperty(target, key, { value: replacement, writable: true, enumerable: true, configurable: true });
}
function resealPhase(input: RecordedSymbolSqlInput, sequence: number): void {
  const event = input.events[sequence - 1]; assert.ok(event !== undefined);
  set(event, ["dataSha256"], sha256Json(event.data));
  if (event.kind === "intent") {
    const digest = sha256Json(event.data); set(event, ["requestSha256"], digest);
    const result = input.events[sequence]; assert.ok(result !== undefined); set(result, ["requestSha256"], digest);
  }
}
function rebindCopyData(input: RecordedSymbolSqlInput, sequence: number, value: RecordedSymbolSqlInput["editInventory"]): void {
  const event = input.events[sequence - 1]; assert.ok(event !== undefined && isRecord(event.data));
  const receipt = event.data["copyReceipt"]; assert.ok(isRecord(receipt));
  set(receipt, ["sha256"], value.checkpointSha256);
  const { receiptSha256: _prior, ...body } = receipt;
  set(receipt, ["receiptSha256"], sha256Json(body));
  set(event.data, ["sqlDigests"], { checkpointSha256: value.checkpointSha256, schemaSha256: value.schemaSha256, logicalSha256: value.logicalSha256 });
  resealPhase(input, sequence);
}

void test("retained full coordinator data reconstructs SQL and raw saved source without restoring original owners", async (context) => {
  const f = await fixture(context), full = await f.stage.recordFullEvidence(f.plan);
  const original = assertOriginalClosedSymbolFullEvidence(full, f.engine, full.operationId);
  const { journal, events } = await loadClosedSymbolHistoricalPhaseJournal(full.operationId);
  const baseline = await inspectRecordedClosedCopy({ operationId: full.operationId, phase: "baseline-copy", runtime: f.machine });
  const edit = await inspectRecordedClosedCopy({ operationId: full.operationId, phase: "edit-copy", runtime: f.machine });
  const verification = await inspectRecordedClosedCopy({ operationId: full.operationId, phase: "verify-copy", runtime: f.machine });
  const input: RecordedSymbolSqlInput = { journal, events, baselineInventory: baseline.inventory, editInventory: edit.inventory,
    verificationInventory: verification.inventory, witness: structuredClone(original.edit.witness.witness),
    witnessClockArtifact: structuredClone(original.edit.witness.clockArtifact) };
  const beforeJournal = await readFile(journal.journalPath); const beforeCalls = [...f.events];
  await context.test("exact original-value parity with newly completed readers and no restored Stage brands", async () => {
    const result = await reconstructClosedSymbolSqlEvidence(input);
    assert.deepEqual(result.preparation, original.edit.preparation);
    assert.deepEqual(result.editComparison, original.edit.comparison);
    assert.deepEqual(result.verificationComparison, original.verification.comparison);
    assert.deepEqual(result.savedSource, original.verification.savedSource);
    assert.deepEqual(result.resultHashes, { preparationSha256: sha256Json(original.edit.preparation), editComparisonSha256: sha256Json(original.edit.comparison),
      verificationComparisonSha256: sha256Json(original.verification.comparison), savedSourceSha256: sha256Json(original.verification.savedSource) });
    assert.equal(result.authorityRestored, false); assert.equal(result.executionAuthorized, false); assert.equal(result.completionProved, false);
    assert.equal(result.requiresIndependentWitnessClockAndLifecycleReplay, true);
    assert.throws(() => { assertOriginalClosedSymbolPreparation(result.preparation, f.engine, full.operationId); }, /original/u);
    assert.throws(() => { assertOriginalClosedSymbolComparison(result.editComparison, f.engine, full.operationId, "edit-sql-compare"); }, /original/u);
    assert.throws(() => { assertOriginalSavedSymbolSource(result.savedSource, f.engine, full.operationId); }, /Original successful/u);
    assert.notStrictEqual(input.baselineInventory, original.baseline.copy.inventory);
    assert.deepEqual(f.events, beforeCalls); assert.deepEqual(await readFile(journal.journalPath), beforeJournal);
  });
  for (const name of ["baselineInventory", "editInventory", "verificationInventory"] as const) {
    await context.test(`cloned ${name} cannot replace an actual reader completion`, async () => {
      await assert.rejects(reconstructClosedSymbolSqlEvidence({ ...input, [name]: structuredClone(input[name]) }), /original inventory/u);
    });
  }
  for (const [label, sequence, path, value] of [
    ["write witness", 21, ["witnessArtifactSha256"], "0".repeat(64)],
    ["write clock", 21, ["witnessClockArtifactSha256"], "0".repeat(64)],
    ["write clock descriptor", 21, ["witnessClockArtifact", "bytes"], 1],
    ["write metadata", 21, ["metadataPlanSha256"], "0".repeat(64)],
    ["write prepared", 21, ["preparedSqlPlanSha256"], "0".repeat(64)],
    ["write interval", 21, ["sameOriginalClockWindow"], false],
    ["edit comparison extra", 28, ["forged"], true],
    ["edit comparison digest", 28, ["resultSha256"], "0".repeat(64)],
    ["edit relation ticket", 28, ["comparison", "expectedTicket"], 999],
    ["edit plaintext", 28, ["comparison", "expectedPlaintextSha256"], "0".repeat(64)],
    ["edit ciphertext", 28, ["comparison", "generatedCiphertextSha256"], "0".repeat(64)],
    ["verify comparison digest", 44, ["resultSha256"], "0".repeat(64)],
    ["verify comparison false completion", 44, ["completionProved"], true],
    ["verify relation", 44, ["comparison", "reopenedSqlSha256"], "0".repeat(64)],
    ["edit request receipt", 27, ["copyReceiptSha256"], "0".repeat(64)],
    ["edit request artifact", 27, ["originalWriteResultArtifactSha256"], "0".repeat(64)],
    ["edit request termination hash", 27, ["clockRelation", "terminationObservationSha256"], "0".repeat(64)],
    ["verify original edit", 43, ["originalEditComparisonSha256"], "0".repeat(64)],
    ["verify clock", 43, ["clockRelation"], {}],
    ["verify termination", 43, ["terminationObservation"], {}],
    ["saved source raw", 37, ["source", "rawHistorySha256"], "0".repeat(64)],
    ["saved source editor version", 37, ["source", "headerEditVersion"], "different"],
    ["saved source projection size", 37, ["source", "projectedContentBytes"], 1],
    ["saved source ticket", 37, ["source", "maximumTicket"], 999],
    ["saved source extras", 37, ["source", "executionGrant"], true],
  ] as const) {
    await context.test(`resealed ${label} data cannot change the expected relation`, async () => {
      const candidate = changed(input), event = candidate.events[sequence - 1]; assert.ok(event !== undefined);
      set(event.data, path, value); resealPhase(candidate, sequence);
      await assert.rejects(reconstructClosedSymbolSqlEvidence(candidate));
    });
  }
  for (const [name, path, value] of [
    ["event data seal", ["events", "19", "dataSha256"], "0".repeat(64)],
    ["event sequence", ["events", "19", "sequence"], 19],
    ["event predecessor", ["events", "19", "previousArtifactSha256"], "0".repeat(64)],
    ["journal plan seal", ["journal", "closedPlanSha256"], "0".repeat(64)],
    ["journal orphan", ["journal", "orphanedCallPossible"], true],
    ["journal hard stop", ["journal", "hardStop"], true],
    ["witness client", ["witness", "client"], "0".repeat(16)],
    ["witness ticket", ["witness", "preDispatchMaxTicket"], 99],
    ["witness actor", ["witness", "actorUuid"], "0".repeat(32)],
    ["witness project", ["witness", "projectUuid"], "0".repeat(64)],
    ["aged witness", ["witness", "agedHead"], {}],
    ["clock descriptor path", ["witnessClockArtifact", "path"], "/foreign.json"],
    ["clock descriptor bound", ["witnessClockArtifact", "bytes"], 60_001],
    ["clock descriptor digest", ["witnessClockArtifact", "sha256"], "0".repeat(64)],
  ] as const) {
    await context.test(`${name} input is rejected`, async () => {
      const candidate = changed(input); set(candidate, path, value); await assert.rejects(reconstructClosedSymbolSqlEvidence(candidate));
    });
  }
  await context.test("caller mutation during pure preparation cannot yield an evidence result", async () => {
    const candidate = changed(input), pending = reconstructClosedSymbolSqlEvidence(candidate);
    set(candidate.witness, ["client"], "0".repeat(16));
    await assert.rejects(pending, /caller data changed/u);
  });
  for (const phase of ["editInventory", "verificationInventory"] as const) {
    await context.test(`real changed peer SQL in ${phase} is not learned from poststate`, async () => {
      const directory = await mkdtemp(join(syntheticSqlRoot(), "replay-sql-")), path = join(directory, "peer.eprj2");
      await copyFile(original.edit.copy.copy.artifact, path);
      mutate(path, "UPDATE resources SET dataStr='unexpected peer change'");
      await assert.rejects(reconstructClosedSymbolSqlEvidence({ ...input, [phase]: await inventory(path) }), /copy-result SQL binding/u);
    });
  }
  await context.test("self-consistent changed copy digests cannot conceal collateral peer SQL", async () => {
    const directory = await mkdtemp(join(syntheticSqlRoot(), "replay-sql-peer-")), path = join(directory, "peer.eprj2");
    await copyFile(original.edit.copy.copy.artifact, path); mutate(path, "UPDATE resources SET dataStr='unexpected peer change'");
    const observed = await inventory(path); const candidate = { ...changed(input), editInventory: observed, verificationInventory: observed };
    rebindCopyData(candidate, 26, observed); rebindCopyData(candidate, 42, observed);
    await assert.rejects(reconstructClosedSymbolSqlEvidence(candidate), /Full SQL/u);
  });
  await context.test("self-consistent baseline digests cannot introduce a foreign schema", async () => {
    const directory = await mkdtemp(join(syntheticSqlRoot(), "replay-sql-schema-")), path = join(directory, "schema.eprj2");
    await copyFile(original.baseline.copy.copy.artifact, path); mutate(path, "CREATE TABLE forbidden(value)");
    const observed = await inventory(path); const candidate = { ...changed(input), baselineInventory: observed };
    rebindCopyData(candidate, 10, observed);
    await assert.rejects(reconstructClosedSymbolSqlEvidence(candidate), /SQL schema differs/u);
  });
  assert.deepEqual(f.events, beforeCalls); assert.deepEqual(await readFile(journal.journalPath), beforeJournal);
  assert.ok(isRecord(original.edit.comparison.comparison));
  assert.notEqual(canonicalJson(original.edit.comparison), canonicalJson(original.edit.comparison.comparison));
});
