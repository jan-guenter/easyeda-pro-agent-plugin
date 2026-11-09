import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { CLOSED_GENERATED_FIXTURE_HELPER_SHA256, ClosedGeneratedFixtureFileOwner, closedGeneratedFixtureFileObservationSchema } from "../src/closed-generated-fixture-file.ts";

const windowsPath = `C:\\SyntheticTemp\\CodexEasyedaFixture_${"1".repeat(32)}\\Codex_via_only_${"2".repeat(16)}.eprj2`; const sha256 = "3".repeat(64);
function owner(mode: string, selectedPath = windowsPath): ClosedGeneratedFixtureFileOwner {
  const nonce = "4".repeat(64);
  return new ClosedGeneratedFixtureFileOwner({ pluginRoot: "/mnt/c/synthetic-plugin", assetsRoot: "/mnt/c/synthetic-app/resources/app/assets", nonce,
    windowsPath: selectedPath, expectedSha256: sha256, expectedBytes: 512 }, { verifyHelper: () => Promise.resolve(), spawnProcess: () =>
    spawn(process.execPath, [fileURLToPath(new URL("helpers/closed-generated-file-child.ts", import.meta.url)), nonce, selectedPath, sha256, "512", mode], { stdio: ["pipe", "pipe", "pipe"] }) });
}
void test("fresh file owner retains exact original transport, source identity and drained original release without source writes", async () => {
  const original = owner("success"); const held = await original.initialize(); assert.equal(held.observation.readOnlyFileLease, true); assert.equal(held.observation.oldRuntimeAdopted, false);
  const inspected = await original.inspect(); assert.deepEqual(inspected.observation, held.observation); await assert.rejects(original.initialize());
  const released = await original.release(); assert.equal(released.fileLeaseHeldUntilRelease, true); assert.equal(released.originalTransportClosed, true);
  assert.equal(original.isOriginalTransportClosed(), true); assert.equal(released.filesDeleted, false); await assert.rejects(original.release());
});
void test("changed identity/watch and lost release reply never issue a held-through-release proof and close only original transport", async () => {
  for (const mode of ["identity-drift", "watch-failed", "lost-release-reply"]) {
    const original = owner(mode); await original.initialize(); if (mode !== "lost-release-reply") { await assert.rejects(original.inspect()); }
    const result = await original.release(); assert.equal(result.originalTransportClosed, true); assert.equal(result.fileLeaseHeldUntilRelease, false);
  }
});
void test("fresh closed-data helper matches its separately admitted source hash", async () => {
  const bytes = await readFile(new URL("../../scripts/closed-generated-fixture-data.ps1", import.meta.url));
  assert.equal(createHash("sha256").update(bytes).digest("hex"), CLOSED_GENERATED_FIXTURE_HELPER_SHA256);
});

void test("Pad and Relevance paths require the distinct original lease schema and retained release", async () => {
  for (const kind of ["circular_smt_pad", "schematic_relevance"]) {
    const path = windowsPath.replace("Codex_via_only_", `Codex_${kind}_`); const original = owner("success", path);
    const held = await original.initialize(); assert.equal(held.schema, "easyeda-pro-control.closed-generated-alternative-file-lease.v1");
    assert.equal(closedGeneratedFixtureFileObservationSchema.safeParse(held).success, false);
    const inspected = await original.inspect(); assert.deepEqual(inspected.observation, held.observation);
    const released = await original.release(); assert.equal(released.fileLeaseHeldUntilRelease, true);
    const wrong = owner("wrong-schema", path); await assert.rejects(wrong.initialize());
    const refusedRelease = await wrong.release(); assert.equal(refusedRelease.fileLeaseHeldUntilRelease, false);
  }
});

void test("malformed helper JSON permanently poisons inspections and cannot produce a clean release proof", async () => {
  const original = owner("malformed-inspect"); await original.initialize();
  await assert.rejects(original.inspect(), /malformed JSON/u);
  await assert.rejects(original.inspect(), /malformed JSON/u);
  const released = await original.release(); assert.equal(released.originalTransportClosed, true);
  assert.equal(released.fileLeaseHeldUntilRelease, false); assert.equal(released.finalObservation, null);
  assert.equal(original.isOriginalTransportClosed(), true); await assert.rejects(original.release());
});
void test("a valid release followed by unsolicited malformed output cannot grant clean lease release", async () => {
  const original = owner("malformed-after-release"); await original.initialize();
  const released = await original.release(); assert.equal(released.originalTransportClosed, true);
  assert.equal(released.fileLeaseHeldUntilRelease, false); assert.equal(original.isOriginalTransportClosed(), true);
});
