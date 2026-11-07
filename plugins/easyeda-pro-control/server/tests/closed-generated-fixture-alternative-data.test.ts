/* oxlint-disable import/max-dependencies -- Actual managed receipt and complete SQL readers qualify two distinct data profiles; historical runtime fields remain inert. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join, win32 } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, createOperation, ensureManagedDirectory, publishManagedAttachmentExclusive, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash } from "../src/core.ts";
import { loadClosedGeneratedFixtureData, qualifyClosedGeneratedDataSql } from "../src/closed-generated-fixture-data.ts";
import type { ClosedGeneratedFixtureDataKind, ClosedGeneratedFixtureDataStart } from "../src/closed-generated-fixture-data.ts";
import { prepareManagedFixtureArchive, prepareManagedLibraryFile } from "../src/managed-library-files-runtime.ts";
import { managedLibraryFileSchema } from "../src/managed-library-files.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";
import { managedSchematicFixtureInitialSqlFixture } from "./helpers/managed-schematic-fixture-initial-sql.ts";

type Input = Awaited<ReturnType<typeof managedFixtureInitialSqlFixture>>;
async function receipt(input: Input, kind: ClosedGeneratedFixtureDataKind, patch: Readonly<Record<string, unknown>> = {}): Promise<ClosedGeneratedFixtureDataStart> {
  const qualification = await qualifyClosedGeneratedDataSql(input.archive, input.inventory, input.rawWindowsPath, input.sourceCreatedEpochMs, input.sourceModifiedEpochMs, kind);
  const prepared = await prepareManagedLibraryFile({ action: "prepare-file", name: win32.basename(input.rawWindowsPath).replace(/\.eprj2$/u, ".epro2"),
    base64: input.archive.toString("base64"), confirmLocalArtifact: true });
  const staged = await prepareManagedFixtureArchive({ action: "prepare-fixture-archive", file: managedLibraryFileSchema.parse(prepared["file"]), confirmDisposableFixture: true, confirmLocalArtifact: true });
  const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "fixture-import-closed"));
  const snapshot = await publishManagedAttachmentExclusive(join(directory, `${randomUUID()}.eprj2`), "Synthetic distinct initial fixture data", await readFile(input.syntheticDatabasePath), "synthetic-alternative-data");
  const importOperationId = `synthetic-alternative-${randomUUID().replaceAll("-", "")}`, plan = { profile: "managed-fixture-import209-v1" };
  const journal = { schema: OPERATION_SCHEMA, operationId: importOperationId, plan, planHash: buildPlanHash(plan), state: "completed", artifacts: [] as Awaited<ReturnType<typeof writePhaseArtifact>>[] };
  await createOperation(journal); const generated = await writePhaseArtifact(importOperationId, 1, "generated-archive", { prepared, staged });
  const slot = kind === "pad" ? "issuedPadReadOpenTarget" : "issuedSchematicRelevanceDataTarget";
  const captured = await writePhaseArtifact(importOperationId, 2, "closed-import-capture", {
    schema: kind === "pad" ? "easyeda-pro-control.managed-pad-fixture-closed-snapshot.v1" : "easyeda-pro-control.managed-schematic-relevance-fixture-closed-snapshot.v1",
    snapshot, originalSourceSha256: snapshot.sha256, completeInitialSqlRowsQualified: true, [slot]: structuredClone(qualification),
    sourceClockSource: "original-destination-windows-filetime", windowsClosedFileMetadata: { schema: "easyeda-pro-control.fixture-closed-file-metadata.v1",
      destination: { schema: "easyeda-pro-control.fixture-destination-owner.v1", nonce: "a".repeat(64), ownerId: "1".repeat(32), windowsDirectory: win32.dirname(input.rawWindowsPath),
        directoryIdentity: `${"b".repeat(8)}:${"c".repeat(16)}`, expectedBasename: win32.basename(input.rawWindowsPath), entries: [win32.basename(input.rawWindowsPath)], state: "held", deletionAuthorized: false,
        libraries: [{ windowsDirectory: "C:\\SyntheticLibraries", directoryIdentity: `${"b".repeat(8)}:${"d".repeat(16)}`, names: [], watchState: "pending" }] },
      file: { windowsPath: input.rawWindowsPath, fileIdentity: `${"b".repeat(8)}:${"e".repeat(16)}`, sha256: snapshot.sha256, bytes: snapshot.bytes,
        createdFileTime: String(116_444_736_000_000_000n + BigInt(input.sourceCreatedEpochMs) * 10_000n), modifiedFileTime: String(116_444_736_000_000_000n + BigInt(input.sourceModifiedEpochMs) * 10_000n),
        createdEpochMs: input.sourceCreatedEpochMs, modifiedEpochMs: input.sourceModifiedEpochMs, watchState: "pending", readOnlyFileLease: true } },
    forgedHistoricalRuntime: { pid: 123, job: "inert" }, ...patch });
  journal.artifacts.push(generated, captured); await updateOperation(journal);
  return { action: "requalify-closed-generated-fixture", operationId: "fixture-data209-alternative-loader", importOperationId,
    generatedArchiveArtifactSha256: generated.sha256, closedCaptureArtifactSha256: captured.sha256, confirmReadClosedGeneratedFixture: true, confirmFreshNoApplicationCheck: true };
}
void test("distinct Pad/Relevance receipts requalify all initial SQL and source without accepting old runtime claims", async () => {
  for (const kind of ["pad", "schematic-relevance"] as const) {
    const input = kind === "pad" ? await managedFixtureInitialSqlFixture(undefined, "circular-smt-pad-only") : await managedSchematicFixtureInitialSqlFixture(undefined, "relevance");
    const request = await receipt(input, kind); const loaded = await loadClosedGeneratedFixtureData(request, () => { assert.equal(request.confirmFreshNoApplicationCheck, true); });
    assert.equal(loaded.kind, kind); assert.ok(loaded.oldQualification);
    assert.equal(loaded.oldQualification.schema, kind === "pad" ? "easyeda-pro-control.qualified-generated-pad-fixture-target.v1" : "easyeda-pro-control.qualified-generated-schematic-relevance-fixture-target.v1");
    assert.equal(loaded.oldQualification.inventoryLogicalSha256, input.inventory.logicalSha256); assert.equal(loaded.oldQualification.registrationVerified, false);
    assert.equal(loaded.locatorReceipt["historicalRuntimeAdopted"], false); assert.equal(loaded.locatorReceipt["historicalOwnerClaimsAccepted"], false);
    const mixed = await receipt(input, kind, { issuedReadOpenTarget: { target: { rawWindowsPath: input.rawWindowsPath }, sourceCreatedEpochMs: input.sourceCreatedEpochMs, sourceModifiedEpochMs: input.sourceModifiedEpochMs } });
    await assert.rejects(loadClosedGeneratedFixtureData(mixed, () => { assert.equal(request.confirmFreshNoApplicationCheck, true); }), /distinct initial data target/u);
    const wrongSchema = await receipt(input, kind, { schema: "easyeda-pro-control.managed-fixture-closed-snapshot.v2" });
    await assert.rejects(loadClosedGeneratedFixtureData(wrongSchema, () => { assert.equal(request.confirmFreshNoApplicationCheck, true); }));
    const noNativeClock = await receipt(input, kind, { windowsClosedFileMetadata: null });
    await assert.rejects(loadClosedGeneratedFixtureData(noNativeClock, () => { assert.equal(request.confirmFreshNoApplicationCheck, true); }));
  }
});
