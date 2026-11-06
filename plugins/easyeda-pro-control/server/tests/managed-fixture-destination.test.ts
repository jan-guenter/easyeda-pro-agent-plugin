import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { MANAGED_FIXTURE_DESTINATION_HELPER_SHA256, ManagedFixtureDestinationOwner, managedFixtureClosedFileMetadataSchema, managedFixtureDestinationObservationSchema } from "../src/managed-fixture-destination.ts";

const expectedBasename = `Codex_via_only_${"3".repeat(16)}.eprj2`, nonce = "2".repeat(64);
function owner(mode: string): ManagedFixtureDestinationOwner {
  return new ManagedFixtureDestinationOwner({ pluginRoot: "/mnt/c/synthetic-plugin", assetsRoot: "/mnt/c/synthetic-app/resources/app/assets", nonce, expectedBasename,
    libraryWindowsDirectories: [String.raw`C:\SyntheticLibraries`] }, {
    verifyHelper: (path) => { assert.ok(path.endsWith("/scripts/managed-fixture-destination.ps1")); return Promise.resolve(); },
    spawnProcess: () => spawn(process.execPath, [fileURLToPath(new URL("helpers/managed-fixture-destination-child.ts", import.meta.url)), nonce, expectedBasename, mode], { stdio: ["pipe", "pipe", "pipe"] }),
  });
}

void test("destination owner binds a fresh original transport and releases it without deleting any files", async () => {
  const native = owner("success");
  const allocated = await native.initialize(); assert.deepEqual(allocated.entries, []);
  assert.equal(allocated.deletionAuthorized, false);
  const inspected = await native.inspect(); assert.deepEqual(inspected.entries, [expectedBasename]);
  await assert.rejects(native.initialize(), /cannot be repeated/u);
  const released = await native.release();
  assert.equal(released.originalTransportClosed, true); assert.equal(released.filesDeleted, false); assert.equal(released.exitCode, 0);
  assert.equal(released.migrationExclusionHeldUntilRelease, true);
  await assert.rejects(native.inspect()); await assert.rejects(native.release());
});

void test("destination identity or complete-roster mismatch stops inspection and preserves supported original release", async () => {
  for (const mode of ["substitute-owner", "unexpected-child", "watch-completed"]) {
    const native = owner(mode); await native.initialize();
    await assert.rejects(native.inspect());
    const released = await native.release(); assert.equal(released.originalTransportClosed, true);
    assert.equal(released.migrationExclusionHeldUntilRelease, false);
  }
  assert.equal(managedFixtureDestinationObservationSchema.safeParse({}).success, false);
});

void test("fixed destination and original watcher source retains its separately admitted byte identity", async () => {
  const source = await readFile(new URL("../../scripts/managed-fixture-destination.ps1", import.meta.url));
  assert.equal(createHash("sha256").update(source).digest("hex"), MANAGED_FIXTURE_DESTINATION_HELPER_SHA256);
});

void test("failed original helper retains complete bounded stderr or an explicitly truncated prefix through EOF release", async () => {
  for (const mode of ["stderr-init", "stderr-overflow"]) {
    const native = owner(mode);
    await assert.rejects(native.initialize(), /reported an error/u);
    const initial = native.failureObservation(); assert.ok(initial); assert.equal(initial["replayAllowed"], false);
    const released = await native.release(); assert.equal(released.originalTransportClosed, true);
    assert.equal(released.migrationExclusionHeldUntilRelease, false);
    const final = native.failureObservation(); assert.ok(final); assert.equal(final["originalTransportCloseObserved"], true);
    const stderr = final["stderr"]; assert.ok(stderr !== null && typeof stderr === "object" && "base64" in stderr && typeof stderr.base64 === "string");
    const bytes = Buffer.from(stderr.base64, "base64");
    assert.ok("capturedBytes" in stderr && stderr.capturedBytes === bytes.length && "capturedPrefixSha256" in stderr);
    assert.equal(stderr.capturedPrefixSha256, createHash("sha256").update(bytes).digest("hex"));
    assert.ok("complete" in stderr && "truncated" in stderr && "observedBytes" in stderr);
    assert.equal(stderr.complete, mode === "stderr-init"); assert.equal(stderr.truncated, mode === "stderr-overflow");
    assert.equal(stderr.observedBytes, mode === "stderr-init" ? 38 : 70_000);
    assert.equal(bytes.length, mode === "stderr-init" ? 38 : 65_536);
  }
});
void test("new original closed-file action retains genuine Windows FILETIME data without changing v1 destination observations or retrying capture", async () => {
  const native = owner("success"); await native.initialize(); await assert.rejects(native.inspectClosedFileMetadata());
  const file = await native.captureClosedFileMetadata(); assert.equal(file.file.createdEpochMs, 1_800_000_000_000); assert.equal(file.file.modifiedEpochMs, 1_800_000_000_100);
  assert.equal(file.file.readOnlyFileLease, true); assert.equal(file.destination.schema, "easyeda-pro-control.fixture-destination-owner.v1");
  await assert.rejects(native.captureClosedFileMetadata(), /repeated/u); const again = await native.inspectClosedFileMetadata(); assert.deepEqual(again.file, file.file);
  const destination = await native.inspect(); assert.equal(destination.schema, "easyeda-pro-control.fixture-destination-owner.v1");
  const release = await native.release(); assert.equal(release.migrationExclusionHeldUntilRelease, true);
  await assert.rejects(native.inspectClosedFileMetadata());
});
void test("native clock mismatch and changed original closed-file identity/content refuse while preserving original cleanup", async () => {
  const invalid = owner("metadata-invalid-filetime"); await invalid.initialize(); await assert.rejects(invalid.captureClosedFileMetadata()); await assert.rejects(invalid.captureClosedFileMetadata());
  await invalid.release(); const drift = owner("metadata-drift"); await drift.initialize(); const proof = await drift.captureClosedFileMetadata(); await assert.rejects(drift.inspectClosedFileMetadata(), /changed/u);
  await drift.release(); assert.equal(managedFixtureClosedFileMetadataSchema.safeParse({ ...proof, file: { ...proof.file, createdEpochMs: 0 } }).success, false);
});
