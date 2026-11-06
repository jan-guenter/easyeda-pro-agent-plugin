import assert from "node:assert/strict";
import test from "node:test";
import { GENERATED_READER_KNOWN_ROSTER_SHA256, currentGeneratedReaderRelinquishmentRequestSchema,
  currentGeneratedReaderRelinquishmentResultSchema, queryCurrentGeneratedReaderRelinquishment,
  validateCurrentGeneratedReaderRelinquishment } from "../src/current-generated-reader-relinquishment-contract.ts";
import { assertGeneratedReaderHistoricalSnapshot, readGeneratedReaderRelinquishment,
  requireGeneratedReaderHistoricalSnapshot } from "../src/current-generated-reader-relinquishment-journal.ts";
import { assertGeneratedReaderRelinquishmentIsolated } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

const request = { action: "relinquish-closed-reader", operationId: "pcb209-spatial-pads-adversarial",
  expectedOriginalRosterSha256: GENERATED_READER_KNOWN_ROSTER_SHA256,
  confirmRelinquishClosedReader: true, acceptMissingHelperReleaseAcknowledgment: true } as const;

void test("closed-reader metadata request rejects substituted history, runtime and missing-ack claims", () => {
  assert.equal(currentGeneratedReaderRelinquishmentRequestSchema.safeParse(request).success, true);
  for (const extra of [{ pid: 123 }, { source: "/tmp/project.eprj2" }, { observationNonce: "caller" },
    { originalHelperReleaseAcknowledged: true }, { expectedOriginalRosterSha256: "0".repeat(64) },
    { acceptMissingHelperReleaseAcknowledgment: false }, { operationId: "footprint-combined-other" }]) {
    assert.equal(currentGeneratedReaderRelinquishmentRequestSchema.safeParse({ ...request, ...extra }).success, false);
    assert.equal(validateCurrentGeneratedReaderRelinquishment({ ...request, ...extra })["valid"], false);
  }
  const description = queryCurrentGeneratedReaderRelinquishment(true);
  assert.equal(description["nativeOwnerAdoption"], false); assert.equal(description["processSignalOffered"], false);
});

void test("copied historical fields cannot select a global exclusion or publication origin", async () => {
  const copied = Object.freeze({ profile: "private.generated-reader-closed-historical-snapshot.v1" as const });
  assert.throws(() => requireGeneratedReaderHistoricalSnapshot(copied), /JOURNAL_REFUSED/u);
  await assert.rejects(assertGeneratedReaderHistoricalSnapshot(copied), /JOURNAL_REFUSED/u);
  await assert.rejects(readGeneratedReaderRelinquishment(copied), /JOURNAL_REFUSED/u);
  await assert.rejects(assertGeneratedReaderRelinquishmentIsolated(copied), /JOURNAL_REFUSED/u);
});

void test("historical completion cannot assert native release, adoption, persistence or writing", () => {
  const digest = "a".repeat(64);
  const value = { schema: "easyeda-pro-control.generated-reader-closed-relinquished.v1", operationId: request.operationId,
    originalRosterSha256: GENERATED_READER_KNOWN_ROSTER_SHA256, originalIdentitySha256: digest, originalIntentSha256: digest, originalCaptureSha256: digest,
    originalProducerFacadeSha256: "953724c092cfa616d445977e83da937f8c254a6a75362416bd12a5063decbbb7",
    createdAt: "2026-11-06T00:00:00.000Z", relinquishmentIntentSha256: digest, observationNonceSha256: digest,
    observation: { schema: "easyeda-pro-control.ordinary-launch-recovery-observation.v1", samples: 2, otherPowerShellPresent: false,
      sameNameProcessPresent: false, helperSha256: "8ffb025cdd20c1851c37d57a20816240928c7e6425b44528a623c8b8f72a37aa" },
    otherLinuxFacadePresent: false, linuxFacadeSamples: 2, originalTerminationRecordRetained: true, originalClosedDataArtifactsVerified: true,
    originalHelperReleaseAcknowledged: false, originalNativeHandlesAdopted: false, nativeResourcesReleased: false, originalJournalModified: false,
    retainedLaunchAuthority: false, designExecutionAuthorized: false, saveAuthorized: false, persistenceVerified: false };
  assert.equal(currentGeneratedReaderRelinquishmentResultSchema.safeParse(value).success, true);
  for (const name of ["originalHelperReleaseAcknowledged", "originalNativeHandlesAdopted", "nativeResourcesReleased", "originalJournalModified",
    "retainedLaunchAuthority", "designExecutionAuthorized", "saveAuthorized", "persistenceVerified"]) {
    assert.equal(currentGeneratedReaderRelinquishmentResultSchema.safeParse({ ...value, [name]: true }).success, false);
  }
});
