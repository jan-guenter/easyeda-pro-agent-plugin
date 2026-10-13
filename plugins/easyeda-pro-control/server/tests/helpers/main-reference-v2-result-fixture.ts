/** Data-only native v2 fixture. No generated program, VM, child or native calls. */
import { controlInputs } from "../../src/symbol-clock-controls.ts";

export type Bag = Record<string, unknown>;
export const BASE = Date.UTC(2026, 9, 12, 12);
export const request = Object.freeze({ profile: "private.exact-literal-main-reference.v1", nonce: "a".repeat(64),
  operationId: "easyeda-20261012t000000z-12345678", closedPlanSha256: "b".repeat(64),
  baselineCopyReceiptSha256: "c".repeat(64), baselineLogicalSha256: "d".repeat(64),
  baselineClosureClockSha256: "e".repeat(64), nativePinsSha256: "f".repeat(64),
  historyUuid: "1".repeat(32), createdAtLiteral: "2026-01-15 12:34:56", referenceUtcMs: BASE });
function vector(input: number | string): Bag {
  const epochMs = typeof input === "number" ? input : Date.parse(`${input.replace(" ", "T")}Z`);
  const date = new Date(epochMs);
  return { input, epochMs, iso: date.toISOString(), offsetMinutes: 0,
    local: [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()] };
}
function sample(offset: number): Bag {
  return { schema: "easyeda-pro-control.windows-clock-sample.v1",
    utcBeforeTicks: String(621_355_968_000_000_000n + BigInt(BASE + offset) * 10_000n),
    utcAfterTicks: String(621_355_968_000_000_000n + BigInt(BASE + offset + 1) * 10_000n),
    qpcBefore: String(10_000_000_000_000_000n + BigInt(offset) * 1000n),
    qpcAfter: String(10_000_000_000_000_000n + BigInt(offset + 1) * 1000n),
    qpcFrequency: "1000000", highResolution: true, localOffsetMinutes: 0, zoneRulesSha256: "a".repeat(64) };
}
export function response(invocation: Readonly<{ requestSha256: string; mainSha256: string; sourcePins: Readonly<Record<string, string>> }>): { native: Bag; owner: Bag } {
  const scope = { createdAtLiteral: request.createdAtLiteral, referenceUtcMs: request.referenceUtcMs };
  const inputs = controlInputs(scope);
  const mainReference = { profile: "private.clock-controls.v1", role: "main-reference", scope,
    clockBefore: vector(BASE + 100), clockAfter: vector(BASE + 900), epochs: inputs.epochs.map(vector), sql: inputs.sql.map(vector),
    environmentTzAbsent: true, producerBindingVerified: false, appClockVerified: false, executionAuthorized: false };
  const owner: Bag = { profile: "private.main-reference-owner-final.v2", nonce: request.nonce,
    requestSha256: invocation.requestSha256, preparedSha256: "b".repeat(64), accepted: true, stage: "COMPLETE",
    rootPid: 123, rootStartFileTime: "134363233783886047", forced: false, emptyRetainedJob: true,
    rootSignaled: true, terminationObserved: true, rootExitCode: 0, killOnCloseAttempted: false,
    nativeCleanupComplete: true, nativeCleanupSucceeded: true, managedCleanupSucceeded: true,
    settlementReceiptPublished: true, primaryCategory: 0, nativePrimaryCode: 0, nativePrimaryError: 0,
    cleanupCodes: [], cleanupSlots: [], cleanupNativeErrors: [], managedCleanupFailureCount: 0,
    managedCleanupOverflow: false, executionAuthorized: false, launchAttempted: true,
    launchCallEntered: true, launchAcknowledged: true, nativeCleanupOverflow: false, ownerRecordingFailed: false,
    nativeAcquisitionUncertain: false, nativeResourceAliasDetected: false, ownershipUnresolved: false, managedCleanupSlots: [] };
  return { owner, native: { profile: "private.main-reference-transport-result.v2", requestSha256: invocation.requestSha256,
    root: String.raw`C:\Synthetic\Temp\easyeda-main-reference-${request.nonce}`, owner,
    nativeBefore: sample(0), nativeAfter: sample(1000),
    result: { profile: "private.main-reference-result.v1", nonce: request.nonce, requestSha256: invocation.requestSha256,
      mainReference, mainDateIdentityRetained: true, rendererCreated: false, appClockDirectlyObserved: false, executionAuthorized: false },
    ownerSourceSha256: invocation.sourcePins["OwnedSyntheticJob.cs"],
    clockSourceSha256: invocation.sourcePins["EasyedaClockObservation.cs"], mainSha256: invocation.mainSha256, executionAuthorized: false } };
}
