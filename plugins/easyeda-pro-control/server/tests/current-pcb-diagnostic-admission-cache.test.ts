/** Actual managed launch gate with isolated synthetic terminal records.
 * No application, native owner or design data is used. */
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { sha256Json } from "../src/core.ts";
import { assertNoUnresolvedCurrentPcbDiagnosticLaunches, publishCurrentPcbDiagnosticLifecycleRecord,
  readCurrentPcbDiagnosticLifecycles, reserveCurrentPcbDiagnosticLifecycle } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

void test("launch gate reuses only parsing after every current record byte is checked", async context => {
  const createdAt = "2026-10-28T00:00:00.000Z", operationId = "diagnostic-cache-test";
  await reserveCurrentPcbDiagnosticLifecycle(operationId);
  const intent = { schema: "easyeda-pro-control.pcb-diagnostic-launch-intent.v1" as const, operationId, createdAt,
    facadeSha256: "a".repeat(64), installationSha256: "b".repeat(64), confirmValidationOnly: true as const,
    confirmDiagnosticLaunch: true as const, acceptExistingProfileEffects: true as const };
  await publishCurrentPcbDiagnosticLifecycleRecord(operationId, "intent.json", intent);
  const releaseIntent = { schema: "easyeda-pro-control.pcb-diagnostic-unlaunched-release-intent.v1" as const, operationId, createdAt,
    intentSha256: sha256Json(intent), nativeLaunchInvoked: false as const, helperAllocated: false };
  await publishCurrentPcbDiagnosticLifecycleRecord(operationId, "unlaunched-release-intent.json", releaseIntent);
  const terminal = { schema: "easyeda-pro-control.pcb-diagnostic-not-dispatched.v1" as const, operationId, createdAt,
    unlaunchedReleaseIntentSha256: sha256Json(releaseIntent), nativeLaunchInvoked: false as const, helperReleased: false };
  await publishCurrentPcbDiagnosticLifecycleRecord(operationId, "not-dispatched.json", terminal);

  const originalParse = JSON.parse, parses: string[] = [];
  context.mock.method(JSON, "parse", (input: string): unknown => { parses.push(input); return originalParse(input) as unknown; });
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches(); assert.equal(parses.length, 3);
  parses.length = 0;
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches(); assert.equal(parses.length, 0);
  // Rich historical inspection still performs every schema/chain check and
  // Returns complete records instead of consuming the gate-only digest.
  const inspected = await readCurrentPcbDiagnosticLifecycles(); assert.equal(parses.length, 3);
  assert.deepEqual(inspected[0]?.records["not-dispatched.json"], terminal);

  const path = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId, "not-dispatched.json");
  await writeFile(path, `${JSON.stringify({ ...terminal, unlaunchedReleaseIntentSha256: "f".repeat(64) })}\n`);
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /NONDISPATCH_CHAIN/u);
  // Matching a formerly valid digest confers no authority. The scanner reads
  // These restored fixture bytes afresh and validates the complete chain.
  await writeFile(path, `${JSON.stringify(terminal)}\n`); parses.length = 0;
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches(); assert.equal(parses.length, 3);
  parses.length = 0;
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches(); assert.equal(parses.length, 0);
  await reserveCurrentPcbDiagnosticLifecycle("diagnostic-cache-incomplete");
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_LAUNCH/u);
});
