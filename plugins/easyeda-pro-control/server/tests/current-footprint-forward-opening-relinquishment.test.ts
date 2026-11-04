/** Real managed thirteen-record histories with synthetic process/file collectors.
 * The separate file-proof tests exercise actual maintained SQLite readers. No native app runs. */
/* oxlint-disable import/max-dependencies -- Exercise the managed snapshot, sidecar publisher, coordinator and global exclusion together. */
import assert from "node:assert/strict";
import { readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { sha256Json, sha256Text } from "../src/core.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "../src/current-pcb-209-opening-profile.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE } from "../src/current-footprint-copy-main-backend-source.ts";
import { CURRENT_FOOTPRINT_FORWARD_OPENING_INSTALLATION, CURRENT_FOOTPRINT_FORWARD_OPENING_PRODUCER,
  currentFootprintForwardOpeningHistoricalIntentSchema, currentFootprintForwardOpeningRelinquishmentRequestSchema } from "../src/current-footprint-forward-opening-relinquishment-contract.ts";
import type { CurrentFootprintForwardOpeningRelinquishmentRequest } from "../src/current-footprint-forward-opening-relinquishment-contract.ts";
import { CurrentFootprintForwardOpeningUnknownRelinquishment } from "../src/current-footprint-forward-opening-unknown-relinquishment.ts";
import { publishCurrentFootprintForwardOpeningRelinquishment, readCurrentFootprintForwardOpeningHistoricalSnapshot,
  requireCurrentFootprintForwardOpeningHistoricalSnapshot } from "../src/current-footprint-forward-opening-relinquishment-journal.ts";
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
async function history(operationId: string): Promise<DiagnosticLifecycleRecords> {
  const records: DiagnosticLifecycleRecords = {};
  const publish = async <K extends keyof DiagnosticLifecycleRecords>(name: K, input: unknown): Promise<NonNullable<DiagnosticLifecycleRecords[K]>> => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The indexed maintained schema validates this exact record name before its generic publication.
    const value = diagnosticLifecycleRecordSchemas[name].parse(input) as NonNullable<DiagnosticLifecycleRecords[K]>;
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, value);
    Object.defineProperty(records, name, { enumerable: true, value }); return value;
  };
  const base = { operationId, createdAt };
  const intent = await publish("intent.json", { ...base, schema: "easyeda-pro-control.footprint-forward-prewrite-launch-intent.v1",
    facadeSha256: CURRENT_FOOTPRINT_FORWARD_OPENING_PRODUCER, installationSha256: CURRENT_FOOTPRINT_FORWARD_OPENING_INSTALLATION,
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
async function fixture(operationId: string): Promise<{
  recovery: CurrentFootprintForwardOpeningUnknownRelinquishment; originalPath: string; request: CurrentFootprintForwardOpeningRelinquishmentRequest;
  state: { windows: number; linux: number; files: number; owned: boolean; otherLinux: boolean; present: boolean; fileMismatch: boolean; publicationFailure: boolean };
}> {
  const records = await history(operationId);
  const state = { windows: 0, linux: 0, files: 0, owned: false, otherLinux: false, present: false, fileMismatch: false, publicationFailure: false };
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
  const recovery = new CurrentFootprintForwardOpeningUnknownRelinquishment(options, {
    verifyInstallation: (): Promise<CurrentPcbDiagnosticInstallation> => Promise.resolve({ ...createCurrentPcb209DiagnosticInstallationPlan(options), facadeSha256: "b".repeat(64) }),
    observeLinux: (): Promise<boolean> => { state.linux += 1; return Promise.resolve(state.otherLinux); },
    observeWindows: (): ReturnType<typeof observeOrdinaryLaunchRecovery> => { state.windows += 1; return Promise.resolve({ schema: "easyeda-pro-control.ordinary-launch-recovery-observation.v1" as const,
      samples: 2 as const, otherPowerShellPresent: state.present, sameNameProcessPresent: state.present, helperSha256: ORDINARY_LAUNCH_RECOVERY_HELPER.sha256 }); },
    collectFileProof: async (_opening, current): Promise<CurrentFootprintForwardOpeningFileProof> => { state.files += 1; await current(); assert.equal(state.fileMismatch, false, "complete file proof mismatch"); return proof; },
    publishRecord: async (original, name, value): Promise<void> => {
      if (name === "relinquished.json" && state.publicationFailure) { state.publicationFailure = false; throw new Error("synthetic sidecar publication failure"); }
      await publishCurrentFootprintForwardOpeningRelinquishment(original, name, value);
    },
  });
  return { recovery, state, originalPath: join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId, "intent.json"),
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

