/** Synthetic journal corruption checks exercise the maintained capture,
 * publisher and descriptor-bound reader. No native owner or app is created. */
/* oxlint-disable import/max-dependencies -- Compose the actual capture, publisher, reader, readiness and original schema exports to verify these distinct boundaries without substitute validators. */
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { sha256Json, sha256Text } from "../src/core.ts";
import { diagnosticLifecycleBindingSchema } from "../src/current-pcb-diagnostic-binding-schema.ts";
import { diagnosticLifecycleBindingSchema as originalBindingExport } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { currentFootprintHeldCacheStartupObservationRecordSchema, currentFootprintHeldCacheStartupObservationSchema,
  currentFootprintHeldCacheStartupObservationV2Schema } from "../src/current-footprint-held-cache-diagnostic-profile.ts";
import { CurrentFootprintHeldCachePageReadiness } from "../src/current-footprint-held-cache-page-readiness.ts";
import { CURRENT_FOOTPRINT_HELD_CACHE_JOURNAL_LIMITS, assertFootprintHeldCacheJournalBudget, captureFootprintHeldCacheValidationRecord,
  currentFootprintHeldCacheValidationRecordSchema } from "../src/current-footprint-held-cache-validation-schema.ts";
import { CURRENT_FOOTPRINT_HELD_CACHE_FRAME_TRANSITION_BYTES, issueCurrentFootprintHeldCacheFrameTargetTransition,
  takeCurrentFootprintHeldCacheFrameTargetTransition } from "../src/current-footprint-held-cache-frame-transition.ts";
import type { CurrentFootprintHeldCacheValidationRecord } from "../src/current-footprint-held-cache-validation-schema.ts";
import { publishFootprintHeldCacheValidationRecord, readFootprintHeldCacheValidation, reserveFootprintHeldCacheValidation } from "../src/current-footprint-held-cache-validation-journal.ts";

const binding = { helperInstance: "a".repeat(32), jobId: "b".repeat(32), rootPid: 1234, rootCreated: "133000000000000000" };
const version = { protocolVersion: "1.3", product: "Chrome/test", revision: "synthetic", userAgent: "synthetic", jsVersion: "synthetic" };
const page = { targetId: "synthetic-page", type: "page", url: "https://client/editor?cll=info", attached: false };

/** Collect a real readiness snapshot using only fulfilled synthetic replies. */
async function readyObservation(): Promise<ReturnType<CurrentFootprintHeldCachePageReadiness["observation"]>> {
  const readiness = new CurrentFootprintHeldCachePageReadiness();
  await readiness.observeBrowser({ assertCurrent: (): void => undefined, version: () => Promise.resolve(version),
    targets: () => Promise.resolve({ targetInfos: [page] }), pause: () => Promise.resolve() });
  readiness.stage("ready"); return readiness.observation();
}

/** Construct ordinary immutable JSON evidence; it supplies no native authority. */
function failureRecord(evidence: Readonly<Record<string, unknown>>, operationId = "footprint-held-cache-startup-schema"): CurrentFootprintHeldCacheValidationRecord {
  return { schema: "easyeda-pro-control.footprint-held-cache-validation-record.v1", operationId, sequence: 0,
    createdAt: "2000-01-01T00:00:00.000Z", previousSha256: null, kind: "failure", evidence: { action: "launch", ...evidence } };
}

void test("the extracted native-binding schema is the unchanged object re-exported by the lifecycle journal", () => {
  assert.equal(diagnosticLifecycleBindingSchema, originalBindingExport);
  assert.deepEqual(diagnosticLifecycleBindingSchema.parse(binding), binding);
  assert.deepEqual(diagnosticLifecycleBindingSchema.parse({ ...binding, rootPid: Number.MAX_SAFE_INTEGER, rootCreated: "0" }),
    { ...binding, rootPid: Number.MAX_SAFE_INTEGER, rootCreated: "0" });
  assert.throws(() => diagnosticLifecycleBindingSchema.parse({ ...binding, extra: "foreign" }));
});

void test("startup snapshots preserve initial, in-flight target failure and ready-before-late-abort states", async () => {
  const readiness = new CurrentFootprintHeldCachePageReadiness();
  assert.equal(currentFootprintHeldCacheStartupObservationV2Schema.parse(readiness.observation()).stage, "checkpoint");
  const entered = Promise.withResolvers<null>(), gate = Promise.withResolvers<Readonly<Record<string, unknown>>>();
  let original = true;
  const pending = readiness.observeBrowser({ assertCurrent: (): void => { assert.equal(original, true); }, version: () => Promise.resolve(version),
    targets: (): Promise<Readonly<Record<string, unknown>>> => { entered.resolve(null); return gate.promise; }, pause: () => Promise.reject(new Error("Unexpected readiness wait")) });
  const refused = assert.rejects(pending); await entered.promise;
  const inFlight = readiness.observation(); assert.equal(inFlight.targetAttempts, 1); assert.equal(inFlight.samples.length, 0);
  original = false; gate.resolve({ targetInfos: [] }); await refused;
  const failed = readiness.observation(); assert.equal(failed.failed, true); assert.equal(failed.failureKind, "transport-or-owner");
  assert.equal(failed.targetAttempts, 1); assert.equal(failed.samples.length, 0);
  const ready = await readyObservation(); assert.equal(ready.failed, false);
  assert.doesNotThrow(() => { captureFootprintHeldCacheValidationRecord(failureRecord({ heldCacheStartupObservation: ready, nativeBinding: binding })); });
});

void test("record acceptance rejects malformed startup fields, inconsistent samples and foreign native bindings", async () => {
  const ready = await readyObservation(), sample = ready.samples[0]; assert.ok(sample !== undefined);
  const malformed: unknown[] = [null, "foreign", { ...ready, stage: "foreign" }, { ...ready, extra: "private-url" },
    { ...ready, failed: true }, { ...ready, versionAttempts: 2 }, { ...ready, versionSha256: "not-a-digest" },
    { ...ready, targetAttempts: -0 }, { ...ready, maximumTargetSamples: 17 }, { ...ready, executionAuthorized: true },
    { ...ready, samples: [{ ...sample, attempt: 2 }] }, { ...ready, samples: [{ ...sample, pageCount: 2 }] },
    { ...ready, samples: [{ ...sample, classification: "empty" }] }, { ...ready, samples: [{ ...sample, privateUrl: "foreign" }] },
    { ...ready, samples: [sample, { ...sample, attempt: 2, inventorySha256: "b".repeat(64) }], targetAttempts: 2 }];
  for (const observation of malformed) {
    const record = failureRecord({ heldCacheStartupObservation: observation });
    assert.equal(currentFootprintHeldCacheValidationRecordSchema.safeParse(record).success, false);
    assert.throws(() => { captureFootprintHeldCacheValidationRecord(record); });
  }
  const tooMany = { ...ready, samples: Array.from({ length: 17 }, (_unused, index) => ({ ...sample, attempt: index + 1 })) };
  const parsed = currentFootprintHeldCacheStartupObservationV2Schema.safeParse(tooMany); assert.equal(parsed.success, false);
  if (!parsed.success) { assert.ok(parsed.error.issues.some(issue => issue.code === "too_big" && issue.path[0] === "samples")); }
  for (const native of [null, { ...binding, rootPid: "1234" }, { ...binding, extra: "foreign" }, { ...binding, helperInstance: "copied" }]) {
    assert.throws(() => { captureFootprintHeldCacheValidationRecord(failureRecord({ nativeBinding: native })); });
  }
});

void test("V2 retains one exclusive editor candidate while its confirming reply is pending or malformed", async () => {
  const readiness = new CurrentFootprintHeldCachePageReadiness();
  const entered = Promise.withResolvers<null>(), gate = Promise.withResolvers<Readonly<Record<string, unknown>>>();
  let attempts = 0;
  const pending = readiness.observeBrowser({ assertCurrent: (): void => undefined, version: () => Promise.resolve(version),
    targets: (): Promise<Readonly<Record<string, unknown>>> => {
      attempts += 1;
      if (attempts === 1) { return Promise.resolve({ targetInfos: [page] }); }
      entered.resolve(null); return gate.promise;
    }, pause: () => Promise.resolve() });
  const refused = assert.rejects(pending); await entered.promise;
  const inFlight = readiness.observation(); assert.equal(inFlight.targetAttempts, 2); assert.equal(inFlight.samples.length, 1);
  assert.equal(inFlight.samples[0]?.classification, "ready"); assert.equal(inFlight.failed, false);
  assert.doesNotThrow(() => currentFootprintHeldCacheStartupObservationV2Schema.parse(inFlight));
  gate.resolve({ targetInfos: [{ ...page, attached: "false" }] }); await refused;
  const failed = readiness.observation(); assert.equal(failed.failureKind, "inventory"); assert.equal(failed.targetAttempts, 2);
  assert.equal(failed.samples.length, 1); assert.equal(attempts, 2);
  assert.doesNotThrow(() => captureFootprintHeldCacheValidationRecord(failureRecord({ heldCacheStartupObservation: failed, nativeBinding: binding })));
});

void test("historical V1 keeps its exact early-selection contract while V2 requires final exclusive stability", async () => {
  const legacy = { schema: "private.current-footprint-held-cache-startup-observation.v1", stage: "frames", failed: true, failureKind: "transport-or-owner",
    versionAttempts: 1, versionSha256: "a".repeat(64), targetAttempts: 6, maximumTargetSamples: 16, delayMilliseconds: 250,
    samples: [...Array.from({ length: 5 }, (_unused, index) => ({ attempt: index + 1, targetCount: 0, pageCount: 0, classification: "empty", inventorySha256: "b".repeat(64) })),
      { attempt: 6, targetCount: 2, pageCount: 2, classification: "ready-with-loading", inventorySha256: "c".repeat(64) }],
    uiSourceQualified: false, cacheQualificationGranted: false, executionAuthorized: false };
  assert.deepEqual(currentFootprintHeldCacheStartupObservationSchema.parse(legacy), legacy);
  assert.deepEqual(currentFootprintHeldCacheStartupObservationRecordSchema.parse(legacy), legacy);
  assert.doesNotThrow(() => captureFootprintHeldCacheValidationRecord(failureRecord({ heldCacheStartupObservation: legacy, nativeBinding: binding })));
  assert.equal(currentFootprintHeldCacheStartupObservationV2Schema.safeParse({ ...legacy, schema: "private.current-footprint-held-cache-startup-observation.v2" }).success, false);
  const current = await readyObservation(); assert.deepEqual(Object.keys(current), Object.keys(legacy));
  assert.equal(currentFootprintHeldCacheStartupObservationSchema.safeParse(current).success, false);
  assert.equal(currentFootprintHeldCacheStartupObservationRecordSchema.safeParse(current).success, true);
  assert.equal(currentFootprintHeldCacheStartupObservationSchema.safeParse({ ...current, schema: "private.current-footprint-held-cache-startup-observation.v1" }).success, false);
  const sample = current.samples[0]; assert.ok(sample);
  const continuedAfterSeal = { ...current, targetAttempts: 3, samples: [...current.samples, { ...sample, attempt: 3 }] };
  assert.equal(currentFootprintHeldCacheStartupObservationV2Schema.safeParse(continuedAfterSeal).success, false);
  const forgedPendingAfterSeal = { ...current, targetAttempts: 3 };
  assert.equal(currentFootprintHeldCacheStartupObservationV2Schema.safeParse(forgedPendingAfterSeal).success, false);
  const changedCounts = { ...current, samples: [sample, { ...current.samples[1], targetCount: 2 }] };
  assert.equal(currentFootprintHeldCacheStartupObservationV2Schema.safeParse(changedCounts).success, false);
});

void test("sixteen V2 loader transitions fit the existing startup packet without new fields or byte caps", () => {
  const maximum = { schema: "private.current-footprint-held-cache-startup-observation.v2", stage: "browser-targets", failed: true, failureKind: "target-limit",
    versionAttempts: 1, versionSha256: "a".repeat(64), targetAttempts: 16, maximumTargetSamples: 16, delayMilliseconds: 250,
    samples: Array.from({ length: 16 }, (_unused, index) => ({ attempt: index + 1, targetCount: 256, pageCount: 2,
      classification: "ready-with-loading", inventorySha256: "b".repeat(64) })),
    uiSourceQualified: false, cacheQualificationGranted: false, executionAuthorized: false };
  assert.deepEqual(currentFootprintHeldCacheStartupObservationV2Schema.parse(maximum), maximum);
  const error = new Error("PCB_DIAGNOSTIC_OWNER_FRAME_TARGET_CHANGED");
  issueCurrentFootprintHeldCacheFrameTargetTransition(error, [page], [{ ...page, title: "changed" }], page.targetId);
  const packet = takeCurrentFootprintHeldCacheFrameTargetTransition(error); assert.ok(packet);
  const maximumBinding = diagnosticLifecycleBindingSchema.parse({ ...binding, rootPid: Number.MAX_SAFE_INTEGER, rootCreated: "9".repeat(20) });
  const evidence = { heldCacheStartupObservation: maximum, nativeBinding: maximumBinding, heldCacheFrameTargetTransition: packet };
  const withoutTransition = Buffer.byteLength(JSON.stringify({ heldCacheStartupObservation: maximum, nativeBinding: maximumBinding }));
  // The 64 bytes cover the fixed new property wrapper and longer failure-kind spelling.
  assert.ok(withoutTransition + CURRENT_FOOTPRINT_HELD_CACHE_FRAME_TRANSITION_BYTES + 64 < CURRENT_FOOTPRINT_HELD_CACHE_JOURNAL_LIMITS.startupEvidenceBytes);
  assert.ok(Buffer.byteLength(JSON.stringify(evidence)) < 8192);
  const captured = captureFootprintHeldCacheValidationRecord(failureRecord(evidence));
  assert.doesNotThrow(() => { assertFootprintHeldCacheJournalBudget([captured]); });
  assert.throws(() => captureFootprintHeldCacheValidationRecord(failureRecord({ heldCacheFrameTargetTransition: { ...packet, rawTitle: "private" } })));
});

void test("invalid startup packets refuse publication and corrupted persisted packets refuse the actual journal reader", async () => {
  const ready = await readyObservation();
  for (const evidence of [{ heldCacheStartupObservation: { ...ready, samples: Array.from({ length: 17 }, () => ready.samples[0]) } },
    { heldCacheStartupObservation: ready, nativeBinding: { ...binding, rootPid: "foreign" } }]) {
    const operationId = `footprint-held-cache-${randomBytes(8).toString("hex")}`;
    await reserveFootprintHeldCacheValidation(operationId);
    const rawWindowsPath = String.raw`C:\synthetic\startup.eprj2`;
    const request = { action: "launch", operationId, target: { rawWindowsPath,
      projectUuid: sha256Text(rawWindowsPath), documentUuid: "b".repeat(16), expectedSourceSha256: "c".repeat(64) },
    confirmValidationOnly: true, confirmDiagnosticLaunch: true, confirmDisposableProject: true, acceptExistingProfileEffects: true, acceptCacheReadEffects: true };
    let previous: CurrentFootprintHeldCacheValidationRecord | null = null;
    for (const [sequence, kind] of (["launch-intent", "prepared", "allocation-intent", "allocation-result"] as const).entries()) {
      let priorEvidence: Record<string, unknown> = {};
      if (kind === "launch-intent") { priorEvidence = { request }; }
      else if (kind === "allocation-result") { priorEvidence = { retained: true }; }
      const record = captureFootprintHeldCacheValidationRecord({ ...failureRecord({}, operationId), sequence, kind,
        previousSha256: previous === null ? null : sha256Json(previous), evidence: priorEvidence });
      await publishFootprintHeldCacheValidationRecord(record); previous = record;
    }
    const invalid = { ...failureRecord(evidence, operationId), sequence: 4, previousSha256: sha256Json(previous) };
    await assert.rejects(publishFootprintHeldCacheValidationRecord(invalid));
    const before = await readFootprintHeldCacheValidation(operationId); assert.equal(before?.records.length, 4);
    // Corruption is confined to this test process's private isolated control root.
    await writeFile(`${controlDataDirectory()}/footprint-held-cache-validation-v1/${operationId}/004-failure.json`, `${JSON.stringify(invalid)}\n`, { mode: 0o600, flag: "wx" });
    await assert.rejects(readFootprintHeldCacheValidation(operationId));
  }
});
