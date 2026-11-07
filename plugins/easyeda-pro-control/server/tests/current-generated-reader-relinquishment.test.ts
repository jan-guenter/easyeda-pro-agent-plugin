/* oxlint-disable import/max-dependencies -- This focused provenance test joins the actual coordinator/index slot, exclusive filesystem publication, original snapshot types and independent synthetic process/installation observers. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { controlDataDirectory, ensureManagedDirectory, publishManagedAttachmentExclusive } from "../src/artifacts.ts";
import { GENERATED_READER_KNOWN_FACADE_SHA256, GENERATED_READER_KNOWN_ROSTER_SHA256, currentGeneratedReaderRelinquishmentIntentSchema, currentGeneratedReaderRelinquishmentRequestSchema,
  currentGeneratedReaderRelinquishmentResultSchema, queryCurrentGeneratedReaderRelinquishment,
  validateCurrentGeneratedReaderRelinquishment } from "../src/current-generated-reader-relinquishment-contract.ts";
import { assertGeneratedReaderHistoricalSnapshot, readGeneratedReaderRelinquishment,
  requireGeneratedReaderHistoricalSnapshot } from "../src/current-generated-reader-relinquishment-journal.ts";
import type { GeneratedReaderHistoricalOriginal, GeneratedReaderHistoricalSnapshot } from "../src/current-generated-reader-relinquishment-journal.ts";
import { CurrentGeneratedReaderRelinquishment, runOriginalGeneratedReaderMetadata } from "../src/current-generated-reader-relinquishment.ts";
import type { CurrentPcbDiagnosticInstallation } from "../src/current-pcb-diagnostic-installation.ts";
import type { observeOrdinaryLaunchRecovery } from "../src/ordinary-launch-recovery.ts";
import { createCurrentPcb209DiagnosticInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
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

/** Real exclusive file publication and the production coordinator/index slot,
 * with explicitly synthetic history and process collectors. No native call. */
async function publicationFixture(): Promise<Readonly<{
  owner: CurrentGeneratedReaderRelinquishment; directory: string;
  state: { fresh: boolean; windows: number; linux: number; failIntentAck: boolean; slot: CurrentGeneratedReaderRelinquishment | undefined };
  run: () => Promise<Record<string, unknown>>;
}>> {
  const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "closed-reader-publication-test", randomUUID()));
  const state = { fresh: true, windows: 0, linux: 0, failIntentAck: true, slot: undefined as CurrentGeneratedReaderRelinquishment | undefined };
  const token: GeneratedReaderHistoricalSnapshot = Object.freeze({ profile: "private.generated-reader-closed-historical-snapshot.v1" });
  const digest = "a".repeat(64);
  const original: GeneratedReaderHistoricalOriginal = Object.freeze({ operationId: request.operationId, records: {},
    originalRosterSha256: GENERATED_READER_KNOWN_ROSTER_SHA256, originalIdentitySha256: digest, originalIntentSha256: digest,
    originalCaptureSha256: digest, originalProducerFacadeSha256: GENERATED_READER_KNOWN_FACADE_SHA256 });
  const requireToken = (value: GeneratedReaderHistoricalSnapshot): GeneratedReaderHistoricalOriginal => { assert.equal(value, token); return original; };
  const empty = (value: GeneratedReaderHistoricalSnapshot): Promise<void> => { requireToken(value); return Promise.resolve(); };
  const optional = async (name: string): Promise<unknown> => {
    try { return JSON.parse(await readFile(join(directory, name), "utf8")) as unknown; }
    catch (error) { if (error instanceof Error && "code" in error && error.code === "ENOENT") { return null; } throw error; }
  };
  const options = { pluginRoot: "/mnt/c/Reviewed/Plugin", assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets", powershellSha256: "d".repeat(64), powershellBytes: 123,
    assertLocalAllowed: (): void => undefined, assertAllowed: (): Promise<void> => Promise.resolve(), assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve(),
    assertFreshNoOwnedAllocations: (): void => { assert.equal(state.fresh, true, "synthetic earlier native allocation"); } };
  const owner = new CurrentGeneratedReaderRelinquishment(options, {
    readHistoricalSnapshot: (): Promise<GeneratedReaderHistoricalSnapshot> => Promise.resolve(token), requireHistoricalSnapshot: requireToken,
    assertHistoricalSnapshot: empty, assertIsolated: empty,
    verifyInstallation: (): Promise<CurrentPcbDiagnosticInstallation> => Promise.resolve({ ...createCurrentPcb209DiagnosticInstallationPlan(options), facadeSha256: "b".repeat(64) }),
    observeLinux: (): Promise<boolean> => { state.linux += 1; return Promise.resolve(false); },
    observeWindows: (): ReturnType<typeof observeOrdinaryLaunchRecovery> => {
      state.windows += 1; return Promise.resolve({ schema: "easyeda-pro-control.ordinary-launch-recovery-observation.v1", samples: 2,
        otherPowerShellPresent: false, sameNameProcessPresent: false, helperSha256: "8ffb025cdd20c1851c37d57a20816240928c7e6425b44528a623c8b8f72a37aa" });
    },
    readReceipt: async (value): ReturnType<typeof readGeneratedReaderRelinquishment> => {
      requireToken(value); const first = await optional("intent.json"); if (first === null) { return null; }
      const last = await optional("relinquished.json"); return { intent: currentGeneratedReaderRelinquishmentIntentSchema.parse(first),
        result: last === null ? null : currentGeneratedReaderRelinquishmentResultSchema.parse(last) };
    },
    publishRecord: async (value, name, record): Promise<void> => {
      requireToken(value); await publishManagedAttachmentExclusive(join(directory, name), "Synthetic historical reader publication", Buffer.from(`${JSON.stringify(record)}\n`), "closed-reader-publication-test", (): Promise<void> => empty(value));
      if (name === "intent.json" && state.failIntentAck) { state.failIntentAck = false; throw new Error("synthetic lost intent publication acknowledgment"); }
    },
  });
  // oxlint-disable-next-line typescript/unbound-method -- The production slot handler supplies this exact original owner as the captured run method receiver.
  const runMethod = owner.run;
  const run = (): Promise<Record<string, unknown>> => runOriginalGeneratedReaderMetadata(owner, runMethod, request, {
    current: (): CurrentGeneratedReaderRelinquishment | undefined => state.slot,
    set: (value): void => { state.slot = value; }, assertOriginal: (): void => undefined,
  });
  return { owner, directory, state, run };
}

void test("lost intent acknowledgment retains the actual metadata slot until original publication settles", async () => {
  const fixture = await publicationFixture();
  await assert.rejects(fixture.run(), /lost intent publication acknowledgment/u);
  const first = await readFile(join(fixture.directory, "intent.json"));
  assert.equal(fixture.owner.hasActiveReservation(), true); assert.equal(fixture.state.slot, fixture.owner);
  assert.equal(fixture.state.windows, 1); assert.equal(fixture.state.linux, 2);
  const competing = await publicationFixture();
  // oxlint-disable-next-line typescript/unbound-method -- The occupied-slot check rejects before invocation; a successful slot would call with the exact paired owner.
  const competingRun = competing.owner.run;
  await assert.rejects(runOriginalGeneratedReaderMetadata(competing.owner, competingRun, request, {
    current: (): CurrentGeneratedReaderRelinquishment | undefined => fixture.state.slot,
    set: (): void => assert.fail("occupied original slot must not be replaced"), assertOriginal: (): void => undefined,
  }), /INDEX_SLOT_CHANGED/u);
  assert.equal(competing.state.windows, 0);
  const result = await fixture.run(); assert.equal(result["originalHelperReleaseAcknowledged"], false);
  assert.equal(fixture.owner.hasActiveReservation(), false); assert.equal(fixture.state.slot, undefined);
  assert.deepEqual(await readFile(join(fixture.directory, "intent.json")), first);
  assert.equal(fixture.state.windows, 1); assert.equal(fixture.state.linux, 2);
});

void test("pre-observation failure releases only the empty metadata slot without publishing a receipt", async () => {
  const fixture = await publicationFixture(); fixture.state.fresh = false;
  await assert.rejects(fixture.run(), /earlier native allocation/u);
  assert.equal(fixture.owner.hasActiveReservation(), false); assert.equal(fixture.state.slot, undefined);
  assert.equal(fixture.state.windows, 0); assert.equal(fixture.state.linux, 0);
  await assert.rejects(readFile(join(fixture.directory, "intent.json")), { code: "ENOENT" });
});
