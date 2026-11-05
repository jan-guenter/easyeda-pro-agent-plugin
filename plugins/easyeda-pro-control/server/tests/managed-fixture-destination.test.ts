import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { MANAGED_FIXTURE_DESTINATION_HELPER_SHA256, ManagedFixtureDestinationOwner, managedFixtureDestinationObservationSchema } from "../src/managed-fixture-destination.ts";

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
