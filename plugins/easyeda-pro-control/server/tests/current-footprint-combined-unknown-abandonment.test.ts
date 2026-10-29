/** Real managed journals and source identities with explicitly synthetic
 * installation/process observations. No Windows process or application is launched. */
/* oxlint-disable import/max-dependencies -- Join exact historical schemas, managed publication, global blockers and the separate recovery coordinator in one provenance regression. */
import assert from "node:assert/strict";
import { readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { sha256Json } from "../src/core.ts";
import { currentFootprintCombinedAbandonUnknownRequestSchema } from "../src/current-footprint-combined-validation.ts";
import { CURRENT_FOOTPRINT_COMBINED_HISTORICAL_PRODUCER, currentFootprintCombinedHistoricalIntentSchema } from "../src/current-footprint-combined-abandonment-contract.ts";
import { CurrentFootprintCombinedUnknownAbandonment } from "../src/current-footprint-combined-unknown-abandonment.ts";
import { publishCurrentFootprintCombinedAbandonment, requireCurrentFootprintCombinedHistoricalSnapshot } from "../src/current-footprint-combined-abandonment-journal.ts";
import type { CurrentFootprintCombinedUnknownAbandonmentOptions } from "../src/current-footprint-combined-unknown-abandonment.ts";
import { assertNoUnresolvedCurrentPcbDiagnosticLaunches, publishCurrentPcbDiagnosticLifecycleRecord } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticInstallation } from "../src/current-pcb-diagnostic-installation.ts";
import { createCurrentPcb209DiagnosticInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
import type { observeOrdinaryLaunchRecovery } from "../src/ordinary-launch-recovery.ts";
import { ORDINARY_LAUNCH_RECOVERY_HELPER } from "../src/ordinary-launch-recovery.ts";

const createdAt = "2026-10-29T00:00:00.000Z";
function oldIntent(operationId: string): ReturnType<typeof currentFootprintCombinedHistoricalIntentSchema.parse> {
  return currentFootprintCombinedHistoricalIntentSchema.parse({ schema: "easyeda-pro-control.footprint-combined-launch-intent.v1",
    operationId, createdAt, purpose: "worker-startup", facadeSha256: CURRENT_FOOTPRINT_COMBINED_HISTORICAL_PRODUCER,
    installationSha256: "a".repeat(64), confirmValidationOnly: true, confirmDiagnosticLaunch: true,
    acceptExistingProfileEffects: true, acceptDebuggerPauseEffects: true });
}
async function fixture(operationId: string): Promise<Readonly<{
  recovery: CurrentFootprintCombinedUnknownAbandonment; request: Record<string, unknown>; originalPath: string;
  state: { windows: number; linux: number; fresh: boolean; otherLinux: boolean; otherPowerShell: boolean; failPublication: boolean };
}>> {
  const intent = oldIntent(operationId); await publishCurrentPcbDiagnosticLifecycleRecord(operationId, "intent.json", intent);
  const state = { windows: 0, linux: 0, fresh: true, otherLinux: false, otherPowerShell: false, failPublication: false };
  const options: CurrentFootprintCombinedUnknownAbandonmentOptions = {
    pluginRoot: "/mnt/c/Reviewed/Plugin", assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets", powershellSha256: "d".repeat(64), powershellBytes: 123,
    assertLocalAllowed: (): void => undefined, assertAllowed: (): Promise<void> => Promise.resolve(),
    assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve(),
    assertFreshNoOwnedAllocations: (): void => { assert.equal(state.fresh, true, "synthetic retained owner exists"); },
  };
  const recovery = new CurrentFootprintCombinedUnknownAbandonment(options, {
    verifyInstallation: (): Promise<CurrentPcbDiagnosticInstallation> => Promise.resolve({ ...createCurrentPcb209DiagnosticInstallationPlan(options), facadeSha256: "b".repeat(64) }),
    observeLinux: (): Promise<boolean> => { state.linux += 1; return Promise.resolve(state.otherLinux); },
    observeWindows: (): ReturnType<typeof observeOrdinaryLaunchRecovery> => { state.windows += 1; return Promise.resolve({ schema: "easyeda-pro-control.ordinary-launch-recovery-observation.v1" as const,
      samples: 2 as const, otherPowerShellPresent: state.otherPowerShell, sameNameProcessPresent: false, helperSha256: ORDINARY_LAUNCH_RECOVERY_HELPER.sha256 }); },
    publishRecord: async (original, name, value): Promise<void> => {
      if (name === "abandoned.json" && state.failPublication) { state.failPublication = false; throw new Error("synthetic abandonment publication failure"); }
      await publishCurrentFootprintCombinedAbandonment(original, name, value);
    },
  });
  return { recovery, state, originalPath: join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId, "intent.json"),
    request: { action: "abandon-unknown-launch", operationId, expectedIntentSha256: sha256Json(intent),
      confirmAbandonUnknownLaunch: true, acceptUnobservedDescendants: true, acceptUnknownProfileEffects: true } };
}
void test("historical abandonment requires exact confirmations and old producer, and copied snapshots grant no recovery exception", () => {
  const operationId = "footprint-combined-historical-schema", request = { action: "abandon-unknown-launch", operationId,
    expectedIntentSha256: "a".repeat(64), confirmAbandonUnknownLaunch: true, acceptUnobservedDescendants: true, acceptUnknownProfileEffects: true };
  assert.equal(currentFootprintCombinedAbandonUnknownRequestSchema.safeParse(request).success, true);
  for (const key of ["confirmAbandonUnknownLaunch", "acceptUnobservedDescendants", "acceptUnknownProfileEffects"]) {
    assert.equal(currentFootprintCombinedAbandonUnknownRequestSchema.safeParse({ ...request, [key]: false }).success, false);
  }
  assert.equal(currentFootprintCombinedAbandonUnknownRequestSchema.safeParse({ ...request, observation: {} }).success, false);
  assert.equal(currentFootprintCombinedHistoricalIntentSchema.safeParse({ ...oldIntent(operationId), facadeSha256: "b".repeat(64) }).success, false);
  assert.equal(currentFootprintCombinedHistoricalIntentSchema.safeParse({ ...oldIntent(operationId), dispatchProtocol: "challenge-ready-before-launch.v1" }).success, false);
  assert.throws(() => requireCurrentFootprintCombinedHistoricalSnapshot({ profile: "private.current-footprint-combined-historical-snapshot.v1", executionAuthorized: false }));
});
void test("separate relinquishment resolves only the startup blocker while preserving original bytes, identity and unknown outcome", async () => {
  const f = await fixture("footprint-combined-historical-normal"); const bytes = await readFile(f.originalPath); const before = await stat(f.originalPath, { bigint: true });
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_LAUNCH/u);
  const result = await f.recovery.run(f.request); assert.equal(result["state"], "unknown-launch-abandoned"); assert.equal(result["launchOutcome"], "unknown");
  for (const key of ["nonDispatchProved", "terminationProved", "nativeResourcesReleased", "retainedLaunchAuthority", "designExecutionAuthorized", "saveAuthorized", "persistenceVerified"]) { assert.equal(result[key], false); }
  assert.equal(f.state.windows, 1); assert.equal(f.state.linux, 2); assert.equal(f.recovery.hasActiveReservation(), false);
  assert.deepEqual(await readFile(f.originalPath), bytes); const after = await stat(f.originalPath, { bigint: true });
  for (const key of ["dev", "ino", "mode", "nlink", "size", "mtimeNs", "ctimeNs"] as const) { assert.equal(after[key], before[key]); }
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches(); await f.recovery.run(f.request); assert.equal(f.state.windows, 1); assert.equal(f.state.linux, 2);
});
void test("retained owners and process presence refuse before publication; retained positive observation settles without replay", async () => {
  const f = await fixture("footprint-combined-historical-refusals"); f.state.fresh = false;
  await assert.rejects(f.recovery.run(f.request), /retained owner/u); assert.equal(f.state.windows, 0);
  f.state.fresh = true; f.state.otherLinux = true; await assert.rejects(f.recovery.run(f.request), /OTHER_LINUX_FACADE/u); assert.equal(f.state.windows, 0);
  f.state.otherLinux = false; f.state.otherPowerShell = true; await assert.rejects(f.recovery.run(f.request), /WINDOWS_PROCESS_PRESENT/u);
  f.state.otherPowerShell = false; f.state.failPublication = true;
  await assert.rejects(f.recovery.run(f.request), /publication failure/u); const windows = f.state.windows; const linux = f.state.linux;
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_LAUNCH/u);
  await f.recovery.run(f.request); assert.equal(f.state.windows, windows); assert.equal(f.state.linux, linux); await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
});
void test("warm startup admission rereads the complete original byte and identity binding", async () => {
  const f = await fixture("footprint-combined-historical-tamper"); await f.recovery.run(f.request); await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
  // Deliberately tamper only this isolated synthetic fixture after completion.
  // Production recovery never writes or normalizes an original journal.
  const original = await readFile(f.originalPath, "utf8"); await writeFile(f.originalPath, `${original.trim()} \n`);
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /ABANDONMENT_JOURNAL_REFUSED/u);
});
