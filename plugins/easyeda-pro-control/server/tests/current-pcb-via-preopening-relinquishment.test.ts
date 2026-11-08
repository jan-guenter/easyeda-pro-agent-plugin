/* oxlint-disable import/max-dependencies -- This focused test joins the actual managed journal, historical resolver and admission boundary with explicitly synthetic process observations. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { test } from "node:test";
import { createOperation, loadOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, sha256Json, sha256Text } from "../src/core.ts";
import { currentPcbViaPreopeningRelinquishmentRequestSchema, currentPcbViaPreopeningRelinquishmentResultSchema } from "../src/current-pcb-via-preopening-relinquishment-contract.ts";
import { currentPcbViaPreopeningRelinquishmentPath } from "../src/current-pcb-via-preopening-relinquishment-file.ts";
import { assertCurrentPcbViaPreopeningHistoricalSnapshot, readCurrentPcbViaPreopeningHistoricalSnapshot, readCurrentPcbViaPreopeningRelinquishment, requireCurrentPcbViaPreopeningHistoricalSnapshot } from "../src/current-pcb-via-preopening-relinquishment-journal.ts";
import { CurrentPcbViaPreopeningRelinquishment } from "../src/current-pcb-via-preopening-relinquishment.ts";
import { createCurrentPcb209DiagnosticInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallation } from "../src/current-pcb-diagnostic-installation.ts";
import type { observeOrdinaryLaunchRecovery } from "../src/ordinary-launch-recovery.ts";
import { assertCurrentPcbViaPreopeningRelinquishmentIsolated, assertNoUnresolvedCurrentPcbViaWrites } from "../src/current-pcb-via-write-journal.ts";
import type { Entry } from "../src/current-pcb-via-write-journal-codec.ts";
import { inspectCurrentPcbViaWriteAdmission } from "../src/current-pcb-via-write-admission.ts";

async function fixture(): Promise<string> {
  const id = `pcb209-via-write-preopening-${randomUUID()}`, raw = `C:\\Synthetic\\CodexEasyedaFixture_${"a".repeat(32)}\\Codex_via_only_${"b".repeat(16)}.eprj2`;
  const plan = { schema: "private.current-pcb-via-write-plan.v1", operationId: id, target: { rawWindowsPath: raw, projectUuid: sha256Text(raw), branchUuid: "c".repeat(32), documentUuid: "d".repeat(32), expectedSourceSha256: "e".repeat(64) }, initialLogicalSha256: "f".repeat(64), via: { netName: "", xMil: 10, yMil: 20, holeDiameterMil: 4, diameterMil: 8, viaType: 0, designRuleBlindViaName: "", solderMaskExpansion: { topSolderMask: 0, bottomSolderMask: 0 }, primitiveLock: false }, expectedNative: { family: "Via", net: "", x: 1, y: 2, radius: .4, holeRadius: .2, type: 0, startLayer: 1, endLayer: 2, expansionType: 2, topExpansion: 0, bottomExpansion: 0, locked: false }, inverseAvailable: false, footprintDocumentAllocationRequired: false, footprintStructureWriterRequired: false };
  const data = { profile: "private.pcb209-via-write-journal.v2", plan, nonce: "1".repeat(64) }, records: Entry[] = [];
  const add = (kind: Entry["kind"], evidence: Entry["evidence"] = {}): void => { records.push({ schema: "easyeda-pro-control.pcb209-via-write-record.v2", operationId: id, sequence: records.length, previousSha256: records.length === 0 ? null : sha256Json(records.at(-1)), kind, evidence, inverseAvailable: false }); };
  add("operation-intent", { plan }); add("baseline-intent"); add("baseline-result"); add("allocation-intent"); add("allocation-result"); add("launch-intent"); add("launch-result"); add("main-intent");
  add("failure", { stage: "main", originalExecutionStopped: true, retryAuthorized: false }); add("abort-intent"); add("abort-result", { originalAbortAcknowledged: false, retryAuthorized: false }); add("termination-intent", { originalRootAndJobRequired: true });
  const artifacts = []; for (const entry of records) { artifacts.push(await writePhaseArtifact(id, entry.sequence, entry.kind, entry)); }
  await createOperation({ schema: OPERATION_SCHEMA, operationId: id, plan: data, planHash: buildPlanHash(data), state: "prepared", records, artifacts }); return id;
}

void test("copied history cannot select the isolated resolver or publish a receipt", async () => {
  const copied = Object.freeze({ profile: "private.current-pcb-via-preopening-historical-snapshot.v1" as const });
  assert.throws(() => requireCurrentPcbViaPreopeningHistoricalSnapshot(copied), /RELINQUISHMENT_JOURNAL/u);
  await assert.rejects(assertCurrentPcbViaPreopeningHistoricalSnapshot(copied), /RELINQUISHMENT_JOURNAL/u);
  await assert.rejects(readCurrentPcbViaPreopeningRelinquishment(copied), /RELINQUISHMENT_JOURNAL/u);
  await assert.rejects(assertCurrentPcbViaPreopeningRelinquishmentIsolated(copied), /RELINQUISHMENT_JOURNAL/u);
});

void test("real historical publication clears only its blocker and preserves missing native proof", async () => {
  const id = await fixture(); const before = await loadOperation(id);
  const expected = { operationId: id, storedJournalSha256: String(before["journalSha256"]), entireStoredJournalSha256: sha256Json(before) };
  const request = { action: "relinquish-failed-via-before-opening", operationId: id, expectedEntireJournalSha256: expected.entireStoredJournalSha256, confirmHistoricalRelinquishment: true, acceptMissingOriginalJobAndReleaseProof: true, acceptUnknownProfileEffects: true };
  for (const extra of [{ pid: 1 }, { source: "/tmp/design.eprj2" }, { observationNonce: "supplied" }, { operationId: `${id}\n` }, { acceptMissingOriginalJobAndReleaseProof: false }]) { assert.equal(currentPcbViaPreopeningRelinquishmentRequestSchema.safeParse({ ...request, ...extra }).success, false); }
  assert.deepEqual(await inspectCurrentPcbViaWriteAdmission(expected), { terminal: false });
  await assert.rejects(assertNoUnresolvedCurrentPcbViaWrites(), /UNRESOLVED_OPERATION/u);
  const snapshot = await readCurrentPcbViaPreopeningHistoricalSnapshot(id); await assertCurrentPcbViaPreopeningRelinquishmentIsolated(snapshot);
  const state = { fresh: true, present: true, windows: 0, linux: 0 };
  const options = { pluginRoot: "/mnt/c/synthetic/plugin", assetsRoot: "/mnt/c/synthetic/EasyEDA/resources/app/assets", powershellSha256: "d".repeat(64), powershellBytes: 123, assertLocalAllowed: (): void => undefined, assertFreshNoOwnedAllocations: (): void => { assert.equal(state.fresh, true); }, assertOtherOperationsSettled: (): Promise<void> => Promise.resolve() };
  const owner = new CurrentPcbViaPreopeningRelinquishment(options, {
    verifyInstallation: (): Promise<CurrentPcbDiagnosticInstallation> => Promise.resolve({ ...createCurrentPcb209DiagnosticInstallationPlan(options), facadeSha256: "b".repeat(64) }),
    observeLinux: (): Promise<boolean> => { state.linux += 1; return Promise.resolve(false); },
    observeWindows: (): ReturnType<typeof observeOrdinaryLaunchRecovery> => { state.windows += 1; return Promise.resolve({ schema: "easyeda-pro-control.ordinary-launch-recovery-observation.v1", samples: 2, otherPowerShellPresent: state.present, sameNameProcessPresent: false, helperSha256: "8ffb025cdd20c1851c37d57a20816240928c7e6425b44528a623c8b8f72a37aa" }); },
  });
  state.fresh = false; await assert.rejects(owner.run(request)); assert.equal(state.windows, 0); state.fresh = true;
  await assert.rejects(owner.run({ ...request, expectedEntireJournalSha256: "0".repeat(64) })); assert.equal(state.windows, 0);
  await assert.rejects(owner.run(request), /PREOPENING_RELINQUISHMENT/u); assert.equal(state.windows, 1); assert.equal(await readCurrentPcbViaPreopeningRelinquishment(snapshot), null);
  state.present = false; const result = currentPcbViaPreopeningRelinquishmentResultSchema.parse(await owner.run(request).then(value => { const { state: _state, startupBlockerRelinquished: _blocker, executionAuthorized: _execution, ...body } = value; return body; }));
  assert.equal(state.windows, 2); assert.equal(state.linux, 3); assert.equal(owner.hasActiveReservation(), false);
  assert.equal(sha256Json(await loadOperation(id)), expected.entireStoredJournalSha256);
  assert.deepEqual(await inspectCurrentPcbViaWriteAdmission(expected), { terminal: false, abandoned: true }); await assertNoUnresolvedCurrentPcbViaWrites();
  for (const name of ["originalJobEmptyProved", "originalHelperReleaseAcknowledged", "originalNativeHandlesAdopted", "terminationProved", "nativeResourcesReleased", "completionClaimed", "persistenceVerified", "retainedLaunchAuthority", "designExecutionAuthorized", "saveAuthorized"]) { assert.equal(currentPcbViaPreopeningRelinquishmentResultSchema.safeParse({ ...result, [name]: true }).success, false); }
  const path = currentPcbViaPreopeningRelinquishmentPath(id, "relinquished.json"); const bytes = await readFile(path);
  await owner.run(request); assert.deepEqual(await readFile(path), bytes); assert.equal(state.windows, 2);
  await writeFile(path, `${JSON.stringify({ ...result, originalHelperReleaseAcknowledged: true })}\n`);
  await assert.rejects(inspectCurrentPcbViaWriteAdmission(expected)); await assert.rejects(assertNoUnresolvedCurrentPcbViaWrites());
  assert.equal(sha256Json(await loadOperation(id)), expected.entireStoredJournalSha256);
});
