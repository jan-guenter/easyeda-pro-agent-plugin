/** Real managed thirteen-record histories with synthetic process/file collectors.
 * The separate file-proof tests exercise actual maintained SQLite readers. No native app runs. */
/* oxlint-disable import/max-dependencies -- Exercise the managed snapshot, sidecar publisher, coordinator and global exclusion together. */
import assert from "node:assert/strict";
import { readFile, stat, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { sha256Json, sha256Text } from "../src/core.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "../src/current-pcb-209-opening-profile.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE } from "../src/current-footprint-copy-main-backend-source.ts";
import { CURRENT_FOOTPRINT_FORWARD_OPENING_190023_INSTALLATION, CURRENT_FOOTPRINT_FORWARD_OPENING_190023_PRODUCER,
  CURRENT_FOOTPRINT_FORWARD_OPENING_INSTALLATION, CURRENT_FOOTPRINT_FORWARD_OPENING_PRODUCER,
  currentFootprintForwardOpening190023HistoricalIntentSchema, currentFootprintForwardOpening190023RelinquishmentIntentSchema,
  currentFootprintForwardOpening190023RelinquishmentResultSchema, currentFootprintForwardOpeningHistoricalIntentSchema,
  currentFootprintForwardOpeningKnownHistoricalIntentSchema, currentFootprintForwardOpeningRelinquishmentIntentSchema,
  currentFootprintForwardOpeningRelinquishmentRequestSchema, currentFootprintForwardOpeningRelinquishmentResultSchema } from "../src/current-footprint-forward-opening-relinquishment-contract.ts";
import type { CurrentFootprintForwardOpeningRelinquishmentRequest } from "../src/current-footprint-forward-opening-relinquishment-contract.ts";
import { CurrentFootprintForwardOpeningUnknownRelinquishment } from "../src/current-footprint-forward-opening-unknown-relinquishment.ts";
import { publishCurrentFootprintForwardOpeningRelinquishment, readCurrentFootprintForwardOpeningHistoricalSnapshot,
  readCurrentFootprintForwardOpeningRelinquishment, requireCurrentFootprintForwardOpeningHistoricalSnapshot } from "../src/current-footprint-forward-opening-relinquishment-journal.ts";
import type { CurrentFootprintForwardOpeningFileProof } from "../src/current-footprint-forward-opening-relinquishment-file-proof.ts";
import { currentFootprintForwardOpeningFileProofSchema } from "../src/current-footprint-forward-opening-relinquishment-file-proof.ts";
import { assertNoUnresolvedCurrentPcbDiagnosticLaunches, diagnosticLifecycleRecordSchemas,
  publishCurrentPcbDiagnosticLifecycleRecord } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import type { DiagnosticLifecycleRecords } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticInstallation } from "../src/current-pcb-diagnostic-installation.ts";
import { createCurrentPcb209DiagnosticInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
import type { observeOrdinaryLaunchRecovery } from "../src/ordinary-launch-recovery.ts";
import { ORDINARY_LAUNCH_RECOVERY_HELPER } from "../src/ordinary-launch-recovery.ts";

const createdAt = "2026-11-04T00:00:00.000Z";
/** Publish the maintained predecessor/digest chain through the consumed opening intent. */
async function history(operationId: string, profile: "v1" | "190023"): Promise<DiagnosticLifecycleRecords> {
  const records: DiagnosticLifecycleRecords = {};
  const publish = async <K extends keyof DiagnosticLifecycleRecords>(name: K, input: unknown): Promise<NonNullable<DiagnosticLifecycleRecords[K]>> => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The indexed maintained schema validates this exact record name before its generic publication.
    const value = diagnosticLifecycleRecordSchemas[name].parse(input) as NonNullable<DiagnosticLifecycleRecords[K]>;
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, value);
    Object.defineProperty(records, name, { enumerable: true, value }); return value;
  };
  const base = { operationId, createdAt };
  const intent = await publish("intent.json", { ...base, schema: "easyeda-pro-control.footprint-forward-prewrite-launch-intent.v1",
    facadeSha256: profile === "v1" ? CURRENT_FOOTPRINT_FORWARD_OPENING_PRODUCER : CURRENT_FOOTPRINT_FORWARD_OPENING_190023_PRODUCER,
    installationSha256: profile === "v1" ? CURRENT_FOOTPRINT_FORWARD_OPENING_INSTALLATION : CURRENT_FOOTPRINT_FORWARD_OPENING_190023_INSTALLATION,
    purpose: "worker-startup", confirmValidationOnly: true, confirmDiagnosticLaunch: true,
    acceptExistingProfileEffects: true, acceptDebuggerPauseEffects: true, dispatchProtocol: "challenge-ready-before-launch.v1" });
  const binding = await publish("binding.json", { ...base, schema: "easyeda-pro-control.pcb-diagnostic-launch-binding.v1",
    intentSha256: sha256Json(intent), binding: { helperInstance: "b".repeat(32), jobId: "c".repeat(32), rootPid: 123, rootCreated: "123456789012345" },
    launchAcknowledged: true });
  const bindingSha256 = sha256Json(binding);
  const main = await publish("main-construction-intent.json", { ...base, schema: "easyeda-pro-control.footprint-main-construction-intent.v1", bindingSha256 });
  await publish("main-construction-result.json", { ...base, schema: "easyeda-pro-control.footprint-main-construction-result.v1", intentSha256: sha256Json(main),
    result: { profile: "private.current-footprint-copy-main-backend-construction.v1", originalMainTransportRetained: true,
      runtimeAppSourceQualified: true, runtimeAppSourceSha256: CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE.sha256,
      initialContinuationCount: 1, registrationBreakpointArmedBeforeInitialContinuation: true, actualRegistrationLocationVerified: true,
      originalProtocolCallbackAndBackendRetained: true, originalDriverCallbackAndRouterRetained: true,
      originalActorClockAndSqlFunctionsRetained: true, originalNativeDateNowRetained: true, protocolRegistrationObserved: false,
      requestContextRetained: false, actualActorClockInvocationObserved: false, projectSqlInvocationObserved: false,
      responderExclusivityProven: false, executionAuthorized: false } });
  for (const stage of ["browser", "frames", "script"] as const) {
    const observation = await publish(`${stage}-intent.json`, { ...base, schema: "easyeda-pro-control.pcb-diagnostic-observation-intent.v1",
      bindingSha256, stage, ...(stage === "frames" ? { targetId: "synthetic-page" } : {}), ...(stage === "script" ? { frameId: "synthetic-frame", family: "ui" } : {}) });
    await publish(`${stage}-result.json`, { ...base, schema: "easyeda-pro-control.pcb-diagnostic-observation-result.v1",
      stage, intentSha256: sha256Json(observation), executionAuthorized: false,
      result: stage === "script" ? { family: "ui", sourceVerified: true, sourceSha256: CURRENT_PCB_209_OPENING_SCRIPTS.ui.scriptSha256,
        sourceBytes: CURRENT_PCB_209_OPENING_SCRIPTS.ui.scriptBytes, relativePath: CURRENT_PCB_209_OPENING_SCRIPTS.ui.relativePath } : {} });
  }
  const script = records["script-result.json"]; assert.ok(script !== undefined);
  const handoff = await publish("worker-startup-handoff-intent.json", { ...base, schema: "easyeda-pro-control.pcb-worker-startup-handoff-intent.v1",
    bindingSha256, scriptResultSha256: sha256Json(script) });
  const handed = await publish("worker-startup-handoff-result.json", { ...base, schema: "easyeda-pro-control.pcb-worker-startup-handoff-result.v1",
    intentSha256: sha256Json(handoff), originalParentRetained: true, handoffIrreversible: true, executionAuthorized: false });
  const rawWindowsPath = String.raw`C:\Synthetic\qualification.eprj2`;
  await publish("worker-startup-opening-intent.json", { ...base, schema: "easyeda-pro-control.pcb-worker-startup-opening-intent.v1",
    bindingSha256, handoffResultSha256: sha256Json(handed), target: { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath),
      branchUuid: "d".repeat(32), documentUuid: "e".repeat(16), expectedSourceSha256: "a".repeat(64) },
    preparationCheckpoint: { path: join(controlDataDirectory(), "checkpoints", "synthetic.eprj2"), bytes: 4096, sha256: "f".repeat(64) },
    checkpointReceiptSha256: "1".repeat(64), beforeSqlSha256: "2".repeat(64),
    confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true });
  return records;
}
/** Retain actual managed publisher/snapshot identities while making collection counts explicit. */
async function fixture(operationId: string, profile: "v1" | "190023" = "v1"): Promise<{
  recovery: CurrentFootprintForwardOpeningUnknownRelinquishment; restart: () => CurrentFootprintForwardOpeningUnknownRelinquishment; originalPath: string; request: CurrentFootprintForwardOpeningRelinquishmentRequest;
  state: { producer: string; windows: number; linux: number; files: number; owned: boolean; otherLinux: boolean; present: boolean; fileMismatch: boolean;
    publicationFailure: boolean; publicationAfterWriteFailure: boolean };
}> {
  const records = await history(operationId, profile);
  const state = { producer: "b".repeat(64), windows: 0, linux: 0, files: 0, owned: false, otherLinux: false, present: false, fileMismatch: false,
    publicationFailure: false, publicationAfterWriteFailure: false };
  const options = { pluginRoot: "/mnt/c/Reviewed/Plugin", assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets", powershellSha256: "d".repeat(64), powershellBytes: 123,
    assertLocalAllowed: (): void => undefined, assertAllowed: (): Promise<void> => Promise.resolve(),
    assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve(),
    assertFreshNoOwnedAllocations: (): void => { assert.equal(state.owned, false, "retained original owner"); } };
  const proof = currentFootprintForwardOpeningFileProofSchema.parse({ profile: "private.current-footprint-forward-opening-file-proof.v1",
    projectUuid: records["worker-startup-opening-intent.json"]?.target.projectUuid, branchUuid: "d".repeat(32), documentUuid: "e".repeat(16),
    oldCheckpointSha256: "f".repeat(64), freshCheckpointSha256: "f".repeat(64), oldCheckpointReceiptSha256: "1".repeat(64),
    freshCheckpointReceiptSha256: "3".repeat(64), beforeSqlSha256: "2".repeat(64), freshSqlSha256: "2".repeat(64),
    rawSourceSha256: "a".repeat(64), oldHistorySemanticSha256: "4".repeat(64), freshHistorySemanticSha256: "4".repeat(64),
    fullSqlEqual: true, historyEqual: true, sidecarsAbsent: true, executionAuthorized: false, writerAuthority: false, restored: false });
  const restart = (): CurrentFootprintForwardOpeningUnknownRelinquishment => new CurrentFootprintForwardOpeningUnknownRelinquishment(options, {
    verifyInstallation: (): Promise<CurrentPcbDiagnosticInstallation> => Promise.resolve({ ...createCurrentPcb209DiagnosticInstallationPlan(options), facadeSha256: state.producer }),
    observeLinux: (): Promise<boolean> => { state.linux += 1; return Promise.resolve(state.otherLinux); },
    observeWindows: (): ReturnType<typeof observeOrdinaryLaunchRecovery> => { state.windows += 1; return Promise.resolve({ schema: "easyeda-pro-control.ordinary-launch-recovery-observation.v1" as const,
      samples: 2 as const, otherPowerShellPresent: state.present, sameNameProcessPresent: state.present, helperSha256: ORDINARY_LAUNCH_RECOVERY_HELPER.sha256 }); },
    collectFileProof: async (_opening, current): Promise<CurrentFootprintForwardOpeningFileProof> => { state.files += 1; await current(); assert.equal(state.fileMismatch, false, "complete file proof mismatch"); return proof; },
    publishRecord: async (original, name, value): Promise<void> => {
      if (name === "relinquished.json" && state.publicationFailure) { state.publicationFailure = false; throw new Error("synthetic sidecar publication failure"); }
      await publishCurrentFootprintForwardOpeningRelinquishment(original, name, value);
      if (name === "relinquished.json" && state.publicationAfterWriteFailure) {
        state.publicationAfterWriteFailure = false; throw new Error("synthetic sidecar publication acknowledgment lost");
      }
    },
  });
  return { recovery: restart(), restart, state, originalPath: join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId, "intent.json"),
    request: { action: "relinquish-unknown-opening", operationId, expectedIntentSha256: sha256Json(records["intent.json"]),
      expectedBindingSha256: sha256Json(records["binding.json"]), expectedOpeningIntentSha256: sha256Json(records["worker-startup-opening-intent.json"]),
      confirmRelinquishUnknownOpening: true, acceptUnknownCaptureOutcome: true } };
}
void test("managed original chain, fresh absence and file proofs precede one lexical receipt and publication settlement", async () => {
  const f = await fixture("footprint-copy-qualify-relinquishment-settlement");
  const bytes = await readFile(f.originalPath); const identity = await stat(f.originalPath, { bigint: true });
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches());
  f.state.owned = true; await assert.rejects(f.recovery.run(f.request), /retained original owner/u); assert.equal(f.state.windows, 0);
  f.state.owned = false; f.state.otherLinux = true;
  await assert.rejects(f.recovery.run(f.request), /OTHER_LINUX_FACADE/u); assert.equal(f.state.windows, 0);
  f.state.otherLinux = false; f.state.present = true; await assert.rejects(f.recovery.run(f.request), /WINDOWS_PROCESS_PRESENT/u); assert.equal(f.state.files, 0);
  f.state.present = false; f.state.fileMismatch = true; await assert.rejects(f.recovery.run(f.request), /file proof mismatch/u);
  f.state.fileMismatch = false; f.state.publicationFailure = true;
  await assert.rejects(f.recovery.run(f.request), /sidecar publication failure/u);
  const counts = { windows: f.state.windows, linux: f.state.linux, files: f.state.files };
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches());
  const result = await f.recovery.run(f.request);
  assert.equal(result["captureOutcome"], "unknown"); assert.equal(result["state"], "unknown-opening-relinquished");
  for (const key of ["terminationProved", "nativeResourcesReleased", "helperReleaseAcknowledged", "originalLaunchIdentityVerified",
    "retainedLaunchAuthority", "executionReady", "executionAuthorized", "designExecutionAuthorized", "saveAuthorized"]) { assert.equal(result[key], false); }
  assert.deepEqual({ windows: f.state.windows, linux: f.state.linux, files: f.state.files }, counts);
  assert.deepEqual(await readFile(f.originalPath), bytes); const after = await stat(f.originalPath, { bigint: true });
  for (const key of ["dev", "ino", "mode", "nlink", "size", "mtimeNs", "ctimeNs"] as const) { assert.equal(after[key], identity[key]); }
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches(); await f.recovery.run(f.request);
  assert.deepEqual({ windows: f.state.windows, linux: f.state.linux, files: f.state.files }, counts);
  const receipt = await readCurrentFootprintForwardOpeningRelinquishment(await readCurrentFootprintForwardOpeningHistoricalSnapshot(f.request.operationId));
  assert.ok(receipt !== null && receipt.result !== null);
  assert.equal(currentFootprintForwardOpeningRelinquishmentIntentSchema.parse(receipt.intent).schema, "easyeda-pro-control.footprint-forward-opening-relinquishment-intent.v1");
  assert.equal(currentFootprintForwardOpeningRelinquishmentResultSchema.parse(receipt.result).schema, "easyeda-pro-control.footprint-forward-opening-relinquished.v1");
  assert.equal(currentFootprintForwardOpening190023RelinquishmentResultSchema.safeParse(receipt.result).success, false);
});
void test("exact190023 producer pair selects versioned receipts without widening v1 or skipping original fresh proofs", async () => {
  const f = await fixture("footprint-copy-qualify-relinquishment-native190023", "190023");
  const originalIntent: unknown = JSON.parse(await readFile(f.originalPath, "utf8"));
  const intent = currentFootprintForwardOpening190023HistoricalIntentSchema.parse(originalIntent);
  assert.equal(currentFootprintForwardOpeningHistoricalIntentSchema.safeParse(intent).success, false);
  assert.equal(currentFootprintForwardOpeningKnownHistoricalIntentSchema.safeParse(intent).success, true);
  for (const changed of [
    { facadeSha256: CURRENT_FOOTPRINT_FORWARD_OPENING_PRODUCER },
    { installationSha256: CURRENT_FOOTPRINT_FORWARD_OPENING_INSTALLATION },
    { facadeSha256: "0".repeat(64) }, { installationSha256: "0".repeat(64) }, { profile: "190023" },
  ]) { assert.equal(currentFootprintForwardOpeningKnownHistoricalIntentSchema.safeParse({ ...intent, ...changed }).success, false); }
  await assert.rejects(f.recovery.run({ ...f.request, producerProfile: "190023" }));
  assert.equal(f.state.windows, 0); assert.equal(f.state.files, 0);
  const directory = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", f.request.operationId);
  const extra = join(directory, "worker-startup-footprint-source-intent.json");
  await writeFile(extra, "{}\n", { mode: 0o600 });
  try { await assert.rejects(f.recovery.run(f.request), /JOURNAL_REFUSED/u); }
  finally { await unlink(extra); }
  assert.equal(f.state.windows, 0); assert.equal(f.state.files, 0);
  const snapshot = await readCurrentFootprintForwardOpeningHistoricalSnapshot(f.request.operationId);
  const original = requireCurrentFootprintForwardOpeningHistoricalSnapshot(snapshot);
  const originalFiles = new Map<string, Buffer>();
  for (const name of Object.keys(original.records)) { originalFiles.set(name, await readFile(join(directory, name))); }
  assert.equal(originalFiles.size, 13); assert.equal(original.relinquishmentVersion, 2);
  f.state.present = true; await assert.rejects(f.recovery.run(f.request), /WINDOWS_PROCESS_PRESENT/u);
  assert.equal(f.state.files, 0);
  f.state.present = false; f.state.fileMismatch = true;
  await assert.rejects(f.recovery.run(f.request), /file proof mismatch/u);
  f.state.fileMismatch = false;
  const result = await f.recovery.run(f.request);
  assert.equal(result["schema"], "easyeda-pro-control.footprint-forward-opening-relinquished.v2");
  const receipt = await readCurrentFootprintForwardOpeningRelinquishment(snapshot);
  assert.ok(receipt !== null && receipt.result !== null);
  assert.equal(currentFootprintForwardOpening190023RelinquishmentIntentSchema.parse(receipt.intent).schema, "easyeda-pro-control.footprint-forward-opening-relinquishment-intent.v2");
  assert.deepEqual(currentFootprintForwardOpening190023RelinquishmentResultSchema.parse(receipt.result), receipt.result);
  assert.equal(currentFootprintForwardOpeningRelinquishmentIntentSchema.safeParse(receipt.intent).success, false);
  assert.equal(currentFootprintForwardOpeningRelinquishmentResultSchema.safeParse(receipt.result).success, false);
  for (const name of ["captureOutcome", "terminationOutcome", "helperReleaseOutcome"]) { assert.equal(result[name], "unknown"); }
  for (const name of ["terminationProved", "nativeResourcesReleased", "helperReleaseAcknowledged", "originalLaunchIdentityVerified",
    "retainedLaunchAuthority", "executionReady", "executionAuthorized", "designExecutionAuthorized", "saveAuthorized"]) { assert.equal(result[name], false); }
  for (const [name, bytes] of originalFiles) { assert.deepEqual(await readFile(join(directory, name)), bytes); }
  const counts = { windows: f.state.windows, linux: f.state.linux, files: f.state.files };
  assert.deepEqual(await f.recovery.run(f.request), result);
  assert.deepEqual({ windows: f.state.windows, linux: f.state.linux, files: f.state.files }, counts);
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
});
void test("a new recovery producer recollects fresh proof and preserves the old partial intent's publisher and original binding", async () => {
  const f = await fixture("footprint-copy-qualify-relinquishment-upgraded-producer");
  const originalBytes = await readFile(f.originalPath);
  const original = requireCurrentFootprintForwardOpeningHistoricalSnapshot(await readCurrentFootprintForwardOpeningHistoricalSnapshot(f.request.operationId));
  f.state.publicationFailure = true;
  await assert.rejects(f.recovery.run(f.request), /sidecar publication failure/u);
  const intentPath = join(controlDataDirectory(), "pcb-diagnostic-forward-opening-relinquishments-v1", f.request.operationId, "intent.json");
  const intentBytes = await readFile(intentPath);
  const oldIntent = currentFootprintForwardOpeningRelinquishmentIntentSchema.parse(JSON.parse(intentBytes.toString("utf8")) as unknown);
  assert.equal(oldIntent.facadeSha256, "b".repeat(64));
  const priorCounts = { windows: f.state.windows, linux: f.state.linux, files: f.state.files };
  f.state.producer = "c".repeat(64);
  const upgraded = f.restart();
  for (const field of ["expectedIntentSha256", "expectedBindingSha256", "expectedOpeningIntentSha256"] as const) {
    await assert.rejects(upgraded.run({ ...f.request, [field]: "0".repeat(64) }), /ORIGINAL_DIGEST/u);
  }
  assert.deepEqual({ windows: f.state.windows, linux: f.state.linux, files: f.state.files }, priorCounts);
  // The old sidecar supplies no retained nonce or file/absence authority to a
  // Newly constructed coordinator, even with the exact original expectations.
  f.state.fileMismatch = true;
  await assert.rejects(upgraded.run(f.request), /file proof mismatch/u);
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches());
  f.state.fileMismatch = false;
  const result = await upgraded.run(f.request);
  assert.deepEqual({ windows: f.state.windows, linux: f.state.linux, files: f.state.files }, {
    windows: priorCounts.windows + 3, linux: priorCounts.linux + 3, files: priorCounts.files + 2,
  });
  assert.equal(result["relinquishmentIntentSha256"], sha256Json(oldIntent));
  for (const field of ["captureOutcome", "terminationOutcome", "helperReleaseOutcome"]) { assert.equal(result[field], "unknown"); }
  for (const field of ["retainedLaunchAuthority", "originalLaunchIdentityVerified", "nativeResourcesReleased", "helperReleaseAcknowledged", "executionAuthorized", "saveAuthorized"]) { assert.equal(result[field], false); }
  assert.deepEqual(await readFile(intentPath), intentBytes); assert.deepEqual(await readFile(f.originalPath), originalBytes);
  const after = requireCurrentFootprintForwardOpeningHistoricalSnapshot(await readCurrentFootprintForwardOpeningHistoricalSnapshot(f.request.operationId));
  assert.equal(after.originalRosterSha256, original.originalRosterSha256); assert.equal(after.originalIdentitySha256, original.originalIdentitySha256);
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
});
void test("one resolver settles two distinct original histories after exact result confirmation without replaying observations", async () => {
  const first = await fixture("footprint-copy-qualify-relinquishment-pending-first");
  const firstBytes = await readFile(first.originalPath);
  first.state.publicationAfterWriteFailure = true;
  await assert.rejects(first.recovery.run(first.request), /publication acknowledgment lost/u);
  const counts = { windows: first.state.windows, linux: first.state.linux, files: first.state.files };
  const firstSnapshot = await readCurrentFootprintForwardOpeningHistoricalSnapshot(first.request.operationId);
  const published = await readCurrentFootprintForwardOpeningRelinquishment(firstSnapshot);
  assert.ok(published !== null && published.result !== null);
  const firstResult = await first.recovery.run(first.request);
  assert.equal(firstResult["observationNonceSha256"], published.result.observationNonceSha256);
  assert.deepEqual({ windows: first.state.windows, linux: first.state.linux, files: first.state.files }, counts);
  const second = await fixture("footprint-copy-qualify-relinquishment-pending-second");
  const secondBytes = await readFile(second.originalPath);
  first.state.publicationFailure = true;
  await assert.rejects(first.recovery.run(second.request), /sidecar publication failure/u);
  const secondCounts = { windows: first.state.windows, linux: first.state.linux, files: first.state.files };
  assert.deepEqual(secondCounts, { windows: counts.windows + 2, linux: counts.linux + 2, files: counts.files + 1 });
  // A failed publication retains that exact observation plan until confirmed.
  await assert.rejects(first.recovery.run(first.request), /ORIGINAL_DIGEST/u);
  const secondResult = await first.recovery.run(second.request);
  assert.equal(secondResult["operationId"], second.request.operationId);
  assert.equal(secondResult["originalIntentSha256"], second.request.expectedIntentSha256);
  assert.equal(secondResult["originalBindingSha256"], second.request.expectedBindingSha256);
  assert.notEqual(secondResult["observationNonceSha256"], firstResult["observationNonceSha256"]);
  assert.deepEqual(await first.recovery.run(first.request), firstResult);
  assert.deepEqual(await first.recovery.run(second.request), secondResult);
  assert.deepEqual({ windows: first.state.windows, linux: first.state.linux, files: first.state.files }, secondCounts);
  assert.deepEqual({ windows: second.state.windows, linux: second.state.linux, files: second.state.files }, { windows: 0, linux: 0, files: 0 });
  assert.deepEqual(await readFile(first.originalPath), firstBytes); assert.deepEqual(await readFile(second.originalPath), secondBytes);
  for (const result of [firstResult, secondResult]) {
    for (const key of ["captureOutcome", "terminationOutcome", "helperReleaseOutcome"]) { assert.equal(result[key], "unknown"); }
    for (const key of ["originalLaunchIdentityVerified", "nativeResourcesReleased", "helperReleaseAcknowledged", "executionReady", "executionAuthorized", "saveAuthorized"]) {
      assert.equal(result[key], false);
    }
  }
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
});

void test("caller JSON cannot supply original or observation authority and guard rereads immutable historical bytes", async () => {
  const f = await fixture("footprint-copy-qualify-relinquishment-original");
  assert.equal(currentFootprintForwardOpeningRelinquishmentRequestSchema.safeParse({ ...f.request, observation: {} }).success, false);
  assert.equal(currentFootprintForwardOpeningRelinquishmentRequestSchema.safeParse({ ...f.request, confirmRelinquishUnknownOpening: false }).success, false);
  const original = await readCurrentFootprintForwardOpeningHistoricalSnapshot(f.request.operationId);
  assert.throws(() => requireCurrentFootprintForwardOpeningHistoricalSnapshot({ ...original }));
  const selected = requireCurrentFootprintForwardOpeningHistoricalSnapshot(original);
  assert.equal(currentFootprintForwardOpeningHistoricalIntentSchema.safeParse({ ...selected.intent, facadeSha256: "0".repeat(64) }).success, false);
  await assert.rejects(f.recovery.run({ ...f.request, expectedBindingSha256: "0".repeat(64) }), /ORIGINAL_DIGEST/u);
  await f.recovery.run(f.request); await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
  // Tamper only the isolated test original after issuing a valid sidecar.
  const originalText = await readFile(f.originalPath, "utf8");
  await writeFile(f.originalPath, `${originalText.trim()} \n`);
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /JOURNAL_REFUSED/u);
});

