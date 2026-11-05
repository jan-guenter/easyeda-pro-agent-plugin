/** Synthetic managed histories and observation seams only. No live recovery or native process is invoked. */
import assert from "node:assert/strict";
import { readFile, rename, rm, symlink, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, createOperation, operationPath } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, isRecord } from "../src/core.ts";
import { CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_PROFILE, queryCurrentFootprintForwardSourceRelinquishment,
  validateCurrentFootprintForwardSourceRelinquishment } from "../src/current-footprint-forward-source-relinquishment-contract.ts";
import { forwardSourceRelinquishmentFixture } from "./helpers/forward-source-relinquishment-fixture.ts";

void test("Source historical schema exposes only the exact reviewed profile and false authority", async context => {
  const f = await forwardSourceRelinquishmentFixture(context, "schema");
  assert.equal(CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_PROFILE.manifestSha256, "6baf29750b2f62e44f20d1b97a8a833ff4b665571fb8c84c19269fd67528f33f");
  assert.equal(queryCurrentFootprintForwardSourceRelinquishment(true)["executionAuthorized"], false);
  assert.equal(validateCurrentFootprintForwardSourceRelinquishment(f.request)["saveAuthorized"], false);
  for (const injected of [{ profile: {} }, { nativeOwner: {} }, { observationNonce: "a" }, { executionAuthorized: true }]) {
    const result = validateCurrentFootprintForwardSourceRelinquishment({ ...f.request, ...injected });
    assert.equal(result["valid"], false); assert.equal(result["saveAuthorized"], false);
  }
});

void test("Source historical receipt clears only the original blocker and leaves all original bytes prepared", async context => {
  const f = await forwardSourceRelinquishmentFixture(context, "receipt");
  await assert.rejects(f.source.assertNoUnresolvedCurrentFootprintForwardExecutionOpenings(), /UNRESOLVED_OWNER/u);
  await assert.rejects(f.engine.assertDiagnosticLaunchOtherOperationsSettled(), /before native UI edits/u);
  const result = f.contract.currentFootprintForwardSourceRelinquishmentResultSchema.parse(await f.owner.run(f.request));
  assert.equal(result.captureOutcome, "unknown"); assert.equal(result.terminationOutcome, "unknown"); assert.equal(result.helperReleaseOutcome, "unknown");
  for (const key of ["terminationProved", "nativeResourcesReleased", "helperReleaseAcknowledged", "originalLaunchIdentityVerified",
    "retainedLaunchAuthority", "historicalCompletionVerified", "authorityRestored", "replayAllowed", "executionReady",
    "executionAuthorized", "designExecutionAuthorized", "saveAuthorized"] as const) { assert.equal(result[key], false); }
  assert.equal(result.startupBlockerRelinquished, true); assert.equal(f.owner.hasActiveReservation(), false);
  assert.deepEqual(await readFile(f.path), f.originalBytes);
  const original: unknown = JSON.parse(f.originalBytes.toString("utf8")); assert.ok(isRecord(original)); assert.equal(original["state"], "prepared");
  await f.source.assertNoUnresolvedCurrentFootprintForwardExecutionOpenings();
  assert.equal(await f.engine.assertDiagnosticLaunchOtherOperationsSettled(), true);
  assert.deepEqual(await f.admission.scanQualifiedAdmissionOperations(), []);
  assert.deepEqual({ linux: f.state.linux, windows: f.state.windows, files: f.state.files }, { linux: 2, windows: 2, files: 1 });
  // Unrelated new operation files change the shared parent directory metadata,
  // But cannot invalidate the original per-operation descriptor binding.
  const other = "easyeda-synthetic-source-history-completed";
  await createOperation({ schema: OPERATION_SCHEMA, operationId: other, plan: {}, planHash: buildPlanHash({}), state: "completed", artifacts: [] });
  context.after(() => rm(operationPath(other), { force: true }));
  await f.source.assertNoUnresolvedCurrentFootprintForwardExecutionOpenings();
  assert.deepEqual(await f.restart().run(f.request), result);
  assert.equal(f.state.files, 1); assert.deepEqual(await readFile(f.path), f.originalBytes);
});

void test("Source historical isolation rejects copied snapshots, wrong digests and unrelated unfinished histories", async context => {
  const f = await forwardSourceRelinquishmentFixture(context, "isolation");
  const token = await f.historical.readCurrentFootprintForwardSourceHistoricalSnapshot(f.operationId);
  await assert.rejects(f.engine.assertForwardSourceRelinquishmentOtherOperationsSettled({ ...token }), /ORIGINAL_SNAPSHOT/u);
  await assert.rejects(f.owner.run({ ...f.request, expectedManifestSha256: "b".repeat(64) }), /ORIGINAL_DIGEST/u);
  assert.equal(f.state.linux, 0);
  const other = "easyeda-synthetic-source-history-unfinished";
  await createOperation({ schema: OPERATION_SCHEMA, operationId: other, plan: {}, planHash: buildPlanHash({}), state: "prepared", artifacts: [] });
  context.after(() => rm(operationPath(other), { force: true }));
  await assert.rejects(f.owner.run(f.request), /before native UI edits/u);
  assert.equal(f.state.linux, 0); assert.equal(f.state.files, 0); assert.equal(f.owner.hasActiveReservation(), false);
  assert.deepEqual(await readFile(f.path), f.originalBytes);
});

for (const category of ["linux", "windows", "files"] as const) {
  void test(`Source historical ${category} refusal publishes no relinquishment`, async context => {
    const f = await forwardSourceRelinquishmentFixture(context, category);
    if (category === "linux") { f.state.otherLinux = true; }
    if (category === "windows") { f.state.windowsPresent = true; }
    if (category === "files") { f.state.fileMismatch = true; }
    let expected = /complete-file proof refusal/u;
    if (category === "linux") { expected = /OTHER_LINUX_FACADE/u; }
    if (category === "windows") { expected = /WINDOWS_PROCESS_PRESENT/u; }
    await assert.rejects(f.owner.run(f.request), expected);
    assert.equal(f.owner.hasActiveReservation(), false);
    const token = await f.historical.readCurrentFootprintForwardSourceHistoricalSnapshot(f.operationId);
    assert.equal(await f.historical.readCurrentFootprintForwardSourceRelinquishment(token), null);
    await assert.rejects(f.source.assertNoUnresolvedCurrentFootprintForwardExecutionOpenings(), /UNRESOLVED_OWNER/u);
    assert.deepEqual(await readFile(f.path), f.originalBytes);
  });
}

void test("Source historical busy and lost publication ACK retain only original metadata settlement", async context => {
  const f = await forwardSourceRelinquishmentFixture(context, "publication");
  f.state.hold = true;
  const pending = f.owner.run(f.request); await f.state.entered.promise;
  assert.equal(f.owner.hasActiveReservation(), true);
  await assert.rejects(f.owner.run(f.request), /BUSY/u);
  f.state.loseResultAck = true; f.state.release.resolve(null);
  await assert.rejects(pending, /lost sidecar ACK/u);
  assert.equal(f.owner.hasActiveReservation(), true);
  const counts = { linux: f.state.linux, windows: f.state.windows, files: f.state.files };
  f.contract.currentFootprintForwardSourceRelinquishmentResultSchema.parse(await f.owner.run(f.request));
  assert.equal(f.owner.hasActiveReservation(), false);
  assert.deepEqual({ linux: f.state.linux, windows: f.state.windows, files: f.state.files }, counts);
  assert.deepEqual(await readFile(f.path), f.originalBytes);
});

void test("Source historical snapshots refuse replaced paths and changed original artifacts", async context => {
  const f = await forwardSourceRelinquishmentFixture(context, "drift");
  const token = await f.historical.readCurrentFootprintForwardSourceHistoricalSnapshot(f.operationId);
  const retained = `${f.path}.retained`;
  await rename(f.path, retained); await symlink(retained, f.path);
  await assert.rejects(f.historical.assertCurrentFootprintForwardSourceHistoricalSnapshot(token));
  await unlink(f.path); await rename(retained, f.path);
  const artifact = join(controlDataDirectory(), "operations", f.operationId, "22-release-intent.json");
  const original = await readFile(artifact); await writeFile(artifact, Buffer.concat([original, Buffer.from(" ")]));
  await assert.rejects(f.historical.readCurrentFootprintForwardSourceHistoricalSnapshot(f.operationId));
  assert.equal(f.owner.hasActiveReservation(), false); assert.equal(f.state.files, 0);
});
