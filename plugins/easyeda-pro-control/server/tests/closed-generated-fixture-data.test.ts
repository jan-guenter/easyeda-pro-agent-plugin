/* oxlint-disable import/max-dependencies -- Synthetic old managed artifacts exercise the actual locator, fresh SQL reader and strict initial qualifier; no native/file lease claim. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join, win32 } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, createOperation, ensureManagedDirectory, publishManagedAttachmentExclusive, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash } from "../src/core.ts";
import { loadClosedGeneratedFixtureData, qualifyClosedGeneratedBaselineWithFileClocks, validateClosedGeneratedFixtureDataArguments } from "../src/closed-generated-fixture-data.ts";
import type { ClosedGeneratedFixtureDataStart } from "../src/closed-generated-fixture-data.ts";
import { qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import { prepareManagedFixtureArchive, prepareManagedLibraryFile } from "../src/managed-library-files-runtime.ts";
import { managedLibraryFileSchema } from "../src/managed-library-files.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";

function destinationData(path: string, entries: string[]): Record<string, unknown> {
  return { schema: "easyeda-pro-control.fixture-destination-owner.v1", nonce: "a".repeat(64), ownerId: "1".repeat(32), windowsDirectory: win32.dirname(path),
    directoryIdentity: `${"b".repeat(8)}:${"c".repeat(16)}`, expectedBasename: win32.basename(path), entries, state: "held", deletionAuthorized: false,
    libraries: [{ windowsDirectory: "C:\\SyntheticLibraries", directoryIdentity: `${"b".repeat(8)}:${"d".repeat(16)}`, names: [], watchState: "pending" }] };
}

void test("managed receipt IDs re-read complete old SQL and issue a new data qualification without adopting historical owner flags", async () => {
  const input = await managedFixtureInitialSqlFixture(undefined, "arc-line-and-via"), old = await qualifyGeneratedFixtureInitialSql(input);
  const prepared = await prepareManagedLibraryFile({ action: "prepare-file", name: input.rawWindowsPath.slice(input.rawWindowsPath.lastIndexOf("\\") + 1).replace(/\.eprj2$/u, ".epro2"),
    base64: input.archive.toString("base64"), confirmLocalArtifact: true });
  const staged = await prepareManagedFixtureArchive({ action: "prepare-fixture-archive", file: managedLibraryFileSchema.parse(prepared["file"]), confirmDisposableFixture: true, confirmLocalArtifact: true });
  const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "fixture-import-closed"));
  const snapshot = await publishManagedAttachmentExclusive(join(directory, `${randomUUID()}.eprj2`), "Synthetic earlier closed import data", await readFile(input.syntheticDatabasePath), "synthetic-closed-data");
  const importOperationId = "synthetic-old-fixture-data", plan = { profile: "managed-fixture-import209-v1" };
  const journal = { schema: OPERATION_SCHEMA, operationId: importOperationId, plan, planHash: buildPlanHash(plan), state: "completed", artifacts: [] as Awaited<ReturnType<typeof writePhaseArtifact>>[] };
  await createOperation(journal);
  const generated = await writePhaseArtifact(importOperationId, 1, "generated-archive", { generated: {}, prepared, staged });
  const capture = await writePhaseArtifact(importOperationId, 2, "closed-import-capture", { schema: "easyeda-pro-control.managed-fixture-closed-snapshot.v1", snapshot,
    originalSourceSha256: snapshot.sha256, completeInitialSqlRowsQualified: true, issuedReadOpenTarget: structuredClone(old.qualification),
    originalRootAndJobReobservedClosed: false, registrationVerified: false, forgedHistoricalRuntime: { pid: 123, job: "untrusted" } });
  journal.artifacts.push(generated, capture); await updateOperation(journal);
  const request: ClosedGeneratedFixtureDataStart = { action: "requalify-closed-generated-fixture", operationId: "fixture-data209-locator-test", importOperationId,
    generatedArchiveArtifactSha256: generated.sha256, closedCaptureArtifactSha256: capture.sha256, confirmReadClosedGeneratedFixture: true, confirmFreshNoApplicationCheck: true };
  const loaded = await loadClosedGeneratedFixtureData(request, () => { assert.equal(journal.state, "completed"); });
  assert.notEqual(loaded.oldQualification, old.qualification); assert.equal(loaded.kind, "pcb"); assert.deepEqual(loaded.archive, input.archive);
  assert.ok(loaded.oldQualification); assert.equal(loaded.oldQualification.inventoryLogicalSha256, old.qualification.inventoryLogicalSha256);
  assert.equal(loaded.locatorReceipt["historicalOwnerClaimsAccepted"], false); assert.equal(loaded.locatorReceipt["historicalRuntimeAdopted"], false);
  await assert.rejects(loadClosedGeneratedFixtureData({ ...request, closedCaptureArtifactSha256: "a".repeat(64) }, () => { assert.equal(request.confirmReadClosedGeneratedFixture, true); }), /exact closed-import-capture artifact ID/u);
  assert.equal(validateClosedGeneratedFixtureDataArguments({ ...request, rawWindowsPath: input.rawWindowsPath })["valid"], false);
  assert.equal(validateClosedGeneratedFixtureDataArguments({ ...request, oldRuntime: { pid: 123 } })["valid"], false);
  const nativeId = "synthetic-native-clock-data", nativeJournal = { ...journal, operationId: nativeId, artifacts: [] as typeof journal.artifacts };
  await createOperation(nativeJournal);
  const nativeGenerated = await writePhaseArtifact(nativeId, 1, "generated-archive", { generated: {}, prepared, staged });
  const nativeCapture = await writePhaseArtifact(nativeId, 2, "closed-import-capture", { schema: "easyeda-pro-control.managed-fixture-closed-snapshot.v2", snapshot,
    originalSourceSha256: snapshot.sha256, completeInitialSqlRowsQualified: true, issuedReadOpenTarget: structuredClone(old.qualification),
    sourceClockSource: "original-destination-windows-filetime", windowsClosedFileMetadata: { schema: "easyeda-pro-control.fixture-closed-file-metadata.v1",
      destination: destinationData(input.rawWindowsPath, [win32.basename(input.rawWindowsPath)]), file: { windowsPath: input.rawWindowsPath,
        fileIdentity: `${"b".repeat(8)}:${"e".repeat(16)}`, sha256: snapshot.sha256, bytes: snapshot.bytes,
        createdFileTime: String(116_444_736_000_000_000n + BigInt(input.sourceCreatedEpochMs) * 10_000n),
        modifiedFileTime: String(116_444_736_000_000_000n + BigInt(input.sourceModifiedEpochMs) * 10_000n),
        createdEpochMs: input.sourceCreatedEpochMs, modifiedEpochMs: input.sourceModifiedEpochMs, watchState: "pending", readOnlyFileLease: true } } });
  nativeJournal.artifacts.push(nativeGenerated, nativeCapture); await updateOperation(nativeJournal);
  const nativeLoaded = await loadClosedGeneratedFixtureData({ ...request, importOperationId: nativeId,
    generatedArchiveArtifactSha256: nativeGenerated.sha256, closedCaptureArtifactSha256: nativeCapture.sha256 }, () => { assert.equal(nativeJournal.state, "completed"); });
  assert.ok(nativeLoaded.oldQualification); assert.equal(nativeLoaded.oldQualification.sourceCreatedEpochMs, input.sourceCreatedEpochMs);
  assert.equal(nativeLoaded.oldQualification.inventoryLogicalSha256, old.qualification.inventoryLogicalSha256);
});

void test("a released clock-refused capture locates only data and requires fresh native clocks to qualify every initial SQL row", async () => {
  const input = await managedFixtureInitialSqlFixture(undefined, "arc-line-and-via");
  await assert.rejects(qualifyGeneratedFixtureInitialSql({ ...input, sourceCreatedEpochMs: 0 }), /bounded fresh native file clock interval/u);
  const prepared = await prepareManagedLibraryFile({ action: "prepare-file", name: win32.basename(input.rawWindowsPath).replace(/\.eprj2$/u, ".epro2"),
    base64: input.archive.toString("base64"), confirmLocalArtifact: true });
  const staged = await prepareManagedFixtureArchive({ action: "prepare-fixture-archive", file: managedLibraryFileSchema.parse(prepared["file"]), confirmDisposableFixture: true, confirmLocalArtifact: true });
  const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "fixture-import-closed"));
  const snapshot = await publishManagedAttachmentExclusive(join(directory, `${randomUUID()}.eprj2`), "Synthetic clock-refused initial import data", await readFile(input.syntheticDatabasePath), "synthetic-closed-data");
  const importOperationId = "synthetic-clock-refused-data", plan = { profile: "managed-fixture-import209-v1" };
  const journal = { schema: OPERATION_SCHEMA, operationId: importOperationId, plan, planHash: buildPlanHash(plan), state: "completed", artifacts: [] as Awaited<ReturnType<typeof writePhaseArtifact>>[] };
  await createOperation(journal);
  const generated = await writePhaseArtifact(importOperationId, 1, "generated-archive", { generated: {}, prepared, staged });
  const destination = await writePhaseArtifact(importOperationId, 2, "destination-held", destinationData(input.rawWindowsPath, []));
  const capture = await writePhaseArtifact(importOperationId, 3, "closed-import-capture", { schema: "easyeda-pro-control.managed-fixture-closed-snapshot.v1", snapshot,
    originalSourceSha256: snapshot.sha256, completeInitialSqlRowsQualified: false, completeSqlInventoryCaptured: true, issuedReadOpenTarget: null, decoded: null, sourceComparison: null,
    qualificationFailure: "Generated fixture initial SQL refused: bounded fresh native file clock interval." });
  journal.artifacts.push(generated, destination, capture); await updateOperation(journal);
  const request: ClosedGeneratedFixtureDataStart = { action: "requalify-closed-generated-fixture", operationId: "fixture-data209-clock-refused-test", importOperationId,
    generatedArchiveArtifactSha256: generated.sha256, closedCaptureArtifactSha256: capture.sha256, confirmReadClosedGeneratedFixture: true, confirmFreshNoApplicationCheck: true };
  const loaded = await loadClosedGeneratedFixtureData(request, () => { assert.equal(journal.state, "completed"); });
  assert.equal(loaded.oldQualification, null); assert.equal(loaded.rawWindowsPath, input.rawWindowsPath); assert.ok(loaded.clockRefusedInitialInventory);
  await assert.rejects(qualifyClosedGeneratedBaselineWithFileClocks(loaded, 0, input.sourceModifiedEpochMs), /bounded fresh native file clock interval/u);
  const withoutInventory = { archive: loaded.archive, rawWindowsPath: loaded.rawWindowsPath, snapshot: loaded.snapshot,
    oldQualification: null, kind: loaded.kind, locatorReceipt: loaded.locatorReceipt };
  await assert.rejects(qualifyClosedGeneratedBaselineWithFileClocks(withoutInventory, input.sourceCreatedEpochMs, input.sourceModifiedEpochMs), /retained complete clock-refused initial data inventory/u);
  const qualified = await qualifyClosedGeneratedBaselineWithFileClocks(loaded, input.sourceCreatedEpochMs, input.sourceModifiedEpochMs);
  assert.equal(qualified.exactInitialNativePayloadQualified, true); assert.equal(qualified.writerClockAuthority, false); assert.equal(qualified.registrationVerified, false);
  assert.equal(loaded.oldQualification, null);
  const altered = await managedFixtureInitialSqlFixture("extra-empty-table-row", "arc-line-and-via");
  await assert.rejects(qualifyClosedGeneratedBaselineWithFileClocks({ ...loaded, archive: altered.archive, rawWindowsPath: altered.rawWindowsPath,
    snapshot: { ...loaded.snapshot, sha256: altered.inventory.checkpointSha256 }, clockRefusedInitialInventory: altered.inventory }, altered.sourceCreatedEpochMs, altered.sourceModifiedEpochMs), /editor_caches exact empty baseline/u);
});
