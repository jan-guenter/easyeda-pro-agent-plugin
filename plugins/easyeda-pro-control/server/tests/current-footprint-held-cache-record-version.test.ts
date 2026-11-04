/** Real capture, journal and budget boundaries preserve historical records
 * while admitting the longer-wait observation only under the new envelope. */
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { sha256Json, sha256Text } from "../src/core.ts";
import { assertFootprintHeldCacheValidationChain, publishFootprintHeldCacheValidationRecord,
  readFootprintHeldCacheValidation, reserveFootprintHeldCacheValidation } from "../src/current-footprint-held-cache-validation-journal.ts";
import { CURRENT_FOOTPRINT_HELD_CACHE_JOURNAL_LIMITS, assertFootprintHeldCacheJournalBudget, captureFootprintHeldCacheValidationRecord,
  currentFootprintHeldCacheValidationPersistedRecordSchema, currentFootprintHeldCacheValidationRecordSchema,
  currentFootprintHeldCacheValidationRecordV2Schema } from "../src/current-footprint-held-cache-validation-schema.ts";
import type { CurrentFootprintHeldCacheValidationRecord as Entry } from "../src/current-footprint-held-cache-validation-schema.ts";

const V1 = "easyeda-pro-control.footprint-held-cache-validation-record.v1";
const V2 = "easyeda-pro-control.footprint-held-cache-validation-record.v2";
const initial = { stage: "checkpoint", failed: false, failureKind: null, versionAttempts: 0, versionSha256: null,
  targetAttempts: 0, maximumTargetSamples: 16, samples: [], uiSourceQualified: false,
  cacheQualificationGranted: false, executionAuthorized: false };
const historical = [
  { ...initial, schema: "private.current-footprint-held-cache-startup-observation.v1", delayMilliseconds: 250 },
  { ...initial, schema: "private.current-footprint-held-cache-startup-observation.v2", delayMilliseconds: 250 },
];
const current = { ...initial, schema: "private.current-footprint-held-cache-startup-observation.v3", delayMilliseconds: 1000 };

/** Give each synthetic durable chain a distinct isolated operation directory. */
function operation(): string { return `footprint-held-cache-${randomBytes(8).toString("hex")}`; }

/** Construct complete inert records without granting an original native owner. */
function failure(schema: Entry["schema"], observation: unknown, operationId = operation()): Entry {
  return { schema, operationId, sequence: 0, createdAt: "2000-01-01T00:00:00.000Z", previousSha256: null,
    kind: "failure", evidence: { action: "launch", heldCacheStartupObservation: observation } };
}

/** Build an actual supported launch-intent followed by its original failure. */
function chain(schema: Entry["schema"], observation: unknown): readonly Entry[] {
  const last = failure(schema, observation), rawWindowsPath = String.raw`C:\synthetic\record-version.eprj2`;
  const first: Entry = { ...last, kind: "launch-intent", evidence: { request: { action: "launch", operationId: last.operationId,
    target: { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "b".repeat(16), expectedSourceSha256: "c".repeat(64) },
    confirmValidationOnly: true, confirmDiagnosticLaunch: true, confirmDisposableProject: true,
    acceptExistingProfileEffects: true, acceptCacheReadEffects: true } } };
  return [first, { ...last, sequence: 1, previousSha256: sha256Json(first) }];
}

void test("released outer V1 preserves both historical observation contracts and rejects V3 at every acceptance boundary", async () => {
  for (const observation of historical) {
    const record = failure(V1, observation);
    assert.deepEqual(currentFootprintHeldCacheValidationRecordSchema.parse(record), record);
    assert.deepEqual(currentFootprintHeldCacheValidationPersistedRecordSchema.parse(record), record);
    assert.deepEqual(captureFootprintHeldCacheValidationRecord(record), record);
    assert.doesNotThrow(() => { assertFootprintHeldCacheJournalBudget([record]); });
    const records = chain(V1, observation);
    const first = records[0], last = records[1]; assert.ok(first && last);
    await reserveFootprintHeldCacheValidation(first.operationId);
    for (const row of records) { await publishFootprintHeldCacheValidationRecord(row); }
    const persisted = await readFootprintHeldCacheValidation(first.operationId); assert.deepEqual(persisted?.records, records);
  }
  const invalid = failure(V1, current);
  assert.equal(currentFootprintHeldCacheValidationRecordSchema.safeParse(invalid).success, false);
  assert.equal(currentFootprintHeldCacheValidationPersistedRecordSchema.safeParse(invalid).success, false);
  assert.throws(() => captureFootprintHeldCacheValidationRecord(invalid));
  assert.throws(() => { assertFootprintHeldCacheJournalBudget([invalid]); });
  const records = chain(V1, current);
  const first = records[0], last = records[1]; assert.ok(first && last);
  await reserveFootprintHeldCacheValidation(first.operationId); await publishFootprintHeldCacheValidationRecord(first);
  await assert.rejects(publishFootprintHeldCacheValidationRecord(last));
  const persisted = await readFootprintHeldCacheValidation(first.operationId); assert.equal(persisted?.records.length, 1);
  await writeFile(`${controlDataDirectory()}/footprint-held-cache-validation-v1/${first.operationId}/001-failure.json`,
    `${JSON.stringify(last)}\n`, { mode: 0o600, flag: "wx" });
  await assert.rejects(readFootprintHeldCacheValidation(first.operationId));
});

void test("outer V2 captures and durably reads V3 within the existing journal byte reservations", async () => {
  assert.equal(Buffer.byteLength(V1), Buffer.byteLength(V2));
  const record = failure(V2, current);
  assert.deepEqual(currentFootprintHeldCacheValidationRecordV2Schema.parse(record), record);
  assert.deepEqual(captureFootprintHeldCacheValidationRecord(record), record);
  assert.doesNotThrow(() => { assertFootprintHeldCacheJournalBudget([record]); });
  const records = chain(V2, current);
  const first = records[0]; assert.ok(first);
  await reserveFootprintHeldCacheValidation(first.operationId);
  for (const row of records) { await publishFootprintHeldCacheValidationRecord(row); }
  const persisted = await readFootprintHeldCacheValidation(first.operationId); assert.deepEqual(persisted?.records, records);
  assert.equal(CURRENT_FOOTPRINT_HELD_CACHE_JOURNAL_LIMITS.operationBytes, 8 * 1024 * 1024);
  assert.equal(CURRENT_FOOTPRINT_HELD_CACHE_JOURNAL_LIMITS.startupEvidenceBytes, 8192);
});

void test("mixed outer generations refuse before append and during descriptor-bound history reads in both directions", async () => {
  for (const schema of [V1, V2] as const) {
    const records = chain(schema, historical[0]);
    const first = records[0], last = records[1]; assert.ok(first && last);
    const changed: Entry = { ...last, schema: schema === V1 ? V2 : V1 };
    assert.throws(() => { assertFootprintHeldCacheValidationChain([first, changed]); }, /RECORD_VERSION_CHANGED/u);
    assert.throws(() => { assertFootprintHeldCacheJournalBudget([first, changed]); }, /RECORD_VERSION/u);
    await reserveFootprintHeldCacheValidation(first.operationId); await publishFootprintHeldCacheValidationRecord(first);
    await assert.rejects(publishFootprintHeldCacheValidationRecord(changed), /RECORD_VERSION_CHANGED/u);
    const persisted = await readFootprintHeldCacheValidation(first.operationId); assert.equal(persisted?.records.length, 1);
    await writeFile(`${controlDataDirectory()}/footprint-held-cache-validation-v1/${first.operationId}/001-failure.json`,
      `${JSON.stringify(changed)}\n`, { mode: 0o600, flag: "wx" });
    await assert.rejects(readFootprintHeldCacheValidation(first.operationId), /RECORD_VERSION_CHANGED/u);
  }
});
