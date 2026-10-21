/** Pure source-plan/SQLite rehearsal. This never starts a CAD application. */
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { test } from "node:test";
import { isRecord, sha256Text } from "../src/core.ts";
import { CurrentPcbStringLifecycleLedger } from "../src/current-pcb-string-lifecycle-ledger.ts";
import { stringLedgerFixture, stringLedgerRaw, stringLedgerThroughPublication } from "./helpers/current-pcb-string-ledger-fixture.ts";
import { inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

void test("String ledger joins the full supplied transcript while keeping native lifecycle and visual authority false", async () => {
  const f = await stringLedgerThroughPublication("string-ledger-composed");
  const save = await f.ledger.reserveSave(f.provenance, f.history, f.witness);
  const intent = f.ledger.records().at(-1); assert.ok(intent);
  assert.equal(save.intentSha256, sha256Text(await readFile(intent.path, "utf8")));
  assert.equal(save.durableIntentPublished, true); assert.equal(save.dispatchAuthorized, false);
  await f.ledger.recordSaveOutcome(save, f.saveResult); f.apply();
  await f.ledger.compareClosedSql(await inventory(f.path));
  await f.ledger.compareReopenedString(f.afterRaw, f.afterRaw);
  const status = await f.ledger.compareFinalSql(await inventory(f.path));
  assert.equal(status.phase, "comparisons-complete-awaiting-native-lifecycle-proof"); assert.equal(status.recordCount, 10);
  assert.equal(status.createAttemptConsumed, true); assert.equal(status.saveAttemptConsumed, true);
  for (const name of ["nativeDispatchPerformed", "nativeOwnerVerified", "createEligibilityVerified", "saveEligibilityVerified",
    "originalPublicationVerified", "originalSaveVerified", "generationClosureVerified", "persistentUploadReplayExcluded",
    "freshReopenOwnerVerified", "visualAcceptanceVerified", "completeLifecycleVerified", "connectedValidation",
    "writerSupported", "executionAuthorized"] as const) { assert.equal(status[name], false); }
  let previous: string | null = null;
  for (const [index, record] of f.ledger.records().entries()) {
    const text = await readFile(record.path, "utf8"), value: unknown = JSON.parse(text); assert.ok(isRecord(value));
    assert.equal(value["sequence"], index); assert.equal(value["previousSha256"], previous); previous = sha256Text(text);
  }
  await assert.rejects(f.ledger.reserveCreate(), /phase changed/u);
  await assert.rejects(f.ledger.reserveSave(f.provenance, f.history, f.witness), /phase changed/u);
});
void test("Durable create reservation survives missing acknowledgment and cannot be replayed or adopted", async () => {
  const f = await stringLedgerFixture(), ledger = await CurrentPcbStringLifecycleLedger.prepare("string-ledger-lost-create", f.candidate, f.createPlan, f.before);
  const create = await ledger.reserveCreate();
  const intent = ledger.records().at(-1); assert.ok(intent); assert.match(await readFile(intent.path, "utf8"), /create-intent/u);
  const status = await ledger.recordCreateOutcome(create, null);
  assert.equal(status.phase, "failed"); assert.equal(status.createAttemptConsumed, true); assert.equal(status.saveAttemptConsumed, false);
  await assert.rejects(ledger.reserveCreate(), /phase changed/u);
  await assert.rejects(ledger.recordCreateOutcome(create, f.createResult), /phase changed/u);
  const another = await stringLedgerFixture();
  await assert.rejects(CurrentPcbStringLifecycleLedger.prepare("string-ledger-lost-create", another.candidate, another.createPlan, another.before), /EEXIST/u);
});
void test("Malformed and ambiguous Save outcomes consume the only reservation without a SQL or reopen continuation", async () => {
  for (const [index, supplied] of [null, "{", JSON.stringify({ completed: true })].entries()) {
    const f = await stringLedgerThroughPublication(`string-ledger-lost-save-${index}`);
    const save = await f.ledger.reserveSave(f.provenance, f.history, f.witness);
    const status = await f.ledger.recordSaveOutcome(save, supplied);
    assert.equal(status.phase, "failed"); assert.equal(status.saveAttemptConsumed, true);
    await assert.rejects(f.ledger.recordSaveOutcome(save, f.saveResult), /phase changed/u);
    await assert.rejects(f.ledger.reserveSave(f.provenance, f.history, f.witness), /phase changed/u);
    await assert.rejects(f.ledger.compareClosedSql(f.before), /phase changed/u);
  }
});
void test("Ledger refuses copied plans, SQL inventories and attempt tokens, including another original ledger's token", async () => {
  const f = await stringLedgerFixture();
  await assert.rejects(CurrentPcbStringLifecycleLedger.prepare("string-ledger-copy-plan", f.candidate, structuredClone(f.createPlan), f.before), /original/u);
  await assert.rejects(CurrentPcbStringLifecycleLedger.prepare("string-ledger-copy-sql", f.candidate, f.createPlan, structuredClone(f.before)), /original/u);
  const ledger = await CurrentPcbStringLifecycleLedger.prepare("string-ledger-original", f.candidate, f.createPlan, f.before);
  const token = await ledger.reserveCreate();
  assert.throws(() => ledger.recordCreateOutcome(structuredClone(token), f.createResult), /original ledger/u);
  const other = await stringLedgerThroughPublication("string-ledger-other");
  assert.throws(() => ledger.recordCreateOutcome(other.create, f.createResult), /original ledger/u);
  assert.equal(ledger.status().phase, "create-intent");
  await ledger.recordCreateOutcome(token, f.createResult);
});
void test("Concurrent attempts are serialized before any awaited journal work", async () => {
  const f = await stringLedgerFixture(), ledger = await CurrentPcbStringLifecycleLedger.prepare("string-ledger-concurrent", f.candidate, f.createPlan, f.before);
  const first = ledger.reserveCreate(); await assert.rejects(ledger.reserveCreate(), /phase changed/u);
  await first; assert.equal(ledger.status().recordCount, 2); assert.equal(ledger.status().createAttemptConsumed, true);
});
void test("Journal tampering permanently refuses follow-up rather than trusting remembered receipt hashes", async () => {
  const f = await stringLedgerFixture(), ledger = await CurrentPcbStringLifecycleLedger.prepare("string-ledger-tampered", f.candidate, f.createPlan, f.before);
  const token = await ledger.reserveCreate();
  const initial = ledger.records()[0]; assert.ok(initial);
  await writeFile(initial.path, "{}\n");
  await assert.rejects(ledger.recordCreateOutcome(token, f.createResult), /byte length|SHA-256/u);
  assert.equal(ledger.status().phase, "failed"); assert.equal(ledger.status().createAttemptConsumed, true);
});
void test("Closed SQL collateral changes and nonmatching reopened String cannot reach terminal comparisons", async () => {
  const f = await stringLedgerThroughPublication("string-ledger-collateral"), save = await f.ledger.reserveSave(f.provenance, f.history, f.witness);
  await f.ledger.recordSaveOutcome(save, f.saveResult); f.apply(); mutate(f.path, "UPDATE resources SET dataStr='changed peer'");
  await assert.rejects(f.ledger.compareClosedSql(await inventory(f.path)), /SQL.*delta/u);
  assert.equal(f.ledger.status().phase, "failed");
  const g = await stringLedgerThroughPublication("string-ledger-reopened"), otherSave = await g.ledger.reserveSave(g.provenance, g.history, g.witness);
  await g.ledger.recordSaveOutcome(otherSave, g.saveResult); g.apply(); await g.ledger.compareClosedSql(await inventory(g.path));
  await assert.rejects(g.ledger.compareReopenedString(stringLedgerRaw(), stringLedgerRaw()), /reopened String differs/u);
  assert.equal(g.ledger.status().phase, "failed");
});
