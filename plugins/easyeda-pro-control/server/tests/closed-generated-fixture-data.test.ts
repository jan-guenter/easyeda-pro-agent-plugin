/* oxlint-disable import/max-dependencies -- Synthetic old managed artifacts exercise the actual locator, fresh SQL reader and strict initial qualifier; no native/file lease claim. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, createOperation, ensureManagedDirectory, publishManagedAttachmentExclusive, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash } from "../src/core.ts";
import { loadClosedGeneratedFixtureData, validateClosedGeneratedFixtureDataArguments } from "../src/closed-generated-fixture-data.ts";
import type { ClosedGeneratedFixtureDataStart } from "../src/closed-generated-fixture-data.ts";
import { qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import { prepareManagedFixtureArchive, prepareManagedLibraryFile } from "../src/managed-library-files-runtime.ts";
import { managedLibraryFileSchema } from "../src/managed-library-files.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";

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
  assert.equal(loaded.oldQualification.inventoryLogicalSha256, old.qualification.inventoryLogicalSha256);
  assert.equal(loaded.locatorReceipt["historicalOwnerClaimsAccepted"], false); assert.equal(loaded.locatorReceipt["historicalRuntimeAdopted"], false);
  await assert.rejects(loadClosedGeneratedFixtureData({ ...request, closedCaptureArtifactSha256: "a".repeat(64) }, () => { assert.equal(request.confirmReadClosedGeneratedFixture, true); }), /exact closed-import-capture artifact ID/u);
  assert.equal(validateClosedGeneratedFixtureDataArguments({ ...request, rawWindowsPath: input.rawWindowsPath })["valid"], false);
  assert.equal(validateClosedGeneratedFixtureDataArguments({ ...request, oldRuntime: { pid: 123 } })["valid"], false);
});
