/* oxlint-disable import/max-dependencies -- Focused data-owner composition uses genuine Linux copy/SQL and actual Windows runtime lifecycle, with explicit synthetic Windows lease/no-app supervisor seams only. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { copyFile, mkdir, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { writePhaseArtifact } from "../src/artifacts.ts";
import { scanQualifiedAdmissionOperations } from "../src/closed-symbol-terminal-admission.ts";
import { normalizeEasyedaProjectPath } from "../src/core.ts";
import type { ClosedGeneratedFixtureDataLocator } from "../src/closed-generated-fixture-data.ts";
import { ClosedGeneratedFixtureFileOwner } from "../src/closed-generated-fixture-file.ts";
import type { ClosedGeneratedFixtureFileObservation } from "../src/closed-generated-fixture-file.ts";
import { ClosedGeneratedFixtureDataCoordinator } from "../src/closed-generated-fixture-runtime.ts";
import { qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import { consumeManagedFixtureOpeningSource } from "../src/managed-fixture-opening-source.ts";
import type { WindowsAuthoritySupervisor } from "../src/windows-authority.ts";
import { WindowsControlRuntime } from "../src/windows-runtime.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";
import { syntheticSqlRoot } from "./helpers/sqlite-inventory-fixture.ts";

const forbidden = (): Promise<never> => Promise.reject(new Error("Synthetic data-only test forbids any application/bridge/capture call"));
async function fixture(operationId: string, running = false, releaseFails = false): Promise<{ owner: ClosedGeneratedFixtureDataCoordinator; calls: string[] }> {
  const calls: string[] = [];
  const runtime = new WindowsControlRuntime({ upstream: { callTool: forbidden, bridgeSessionLifecycle: (): undefined => undefined,
    currentAuthenticatedBridgeDispatchBinding: (): undefined => undefined }, pluginRoot: "/mnt/c/synthetic-plugin", assetsRoot: "/mnt/c/synthetic-app/resources/app/assets", reviewedExecutionScopeSha256: "1".repeat(64) }, {
    hashExecutable: (): Promise<string> => Promise.resolve("2".repeat(64)), startSupervisor: (): Promise<WindowsAuthoritySupervisor> => {
      calls.push("new-no-app-helper"); return Promise.resolve({ capture: forbidden, releaseCapture: forbidden, validate: forbidden, proveTerminated: forbidden,
        prepareClosedSessionClose: forbidden, requestClosedSessionNormalClose: forbidden, proveClosedSession: forbidden, probeClosedSessionTermination: forbidden,
        launch: forbidden, requestNormalClose: forbidden, observeExistingApplication: (): Promise<{ running: boolean }> => { calls.push("observe-no-app"); return Promise.resolve({ running }); },
        release: (): Promise<void> => { calls.push("release-original-no-app-helper"); return releaseFails ? Promise.reject(new Error("Synthetic original proof release unknown")) : Promise.resolve(); } });
    },
  });
  const directory = join(syntheticSqlRoot(), `CodexEasyedaFixture_${randomUUID().replaceAll("-", "")}`); await mkdir(directory);
  const input = await managedFixtureInitialSqlFixture(undefined, "arc-line-and-via", directory), old = await qualifyGeneratedFixtureInitialSql(input);
  const source = normalizeEasyedaProjectPath(input.rawWindowsPath); await copyFile(input.syntheticDatabasePath, source);
  const sourceInfo = await stat(input.syntheticDatabasePath);
  const locator: ClosedGeneratedFixtureDataLocator = { archive: input.archive, rawWindowsPath: input.rawWindowsPath, snapshot: { path: input.syntheticDatabasePath,
    sha256: input.inventory.checkpointSha256, bytes: sourceInfo.size }, oldQualification: old.qualification, kind: "pcb", locatorReceipt: { syntheticDataOnly: true } };
  const native: ClosedGeneratedFixtureFileObservation = { schema: "easyeda-pro-control.closed-generated-file-lease.v1", nonce: "3".repeat(64), state: "held", originalHandlesClosed: false, filesDeleted: false,
    observation: { leaseId: "4".repeat(32), windowsPath: input.rawWindowsPath, parentDirectory: dirname(source), directoryIdentity: `${"5".repeat(8)}:${"6".repeat(16)}`,
      fileIdentity: `${"5".repeat(8)}:${"7".repeat(16)}`, sha256: locator.snapshot.sha256, bytes: locator.snapshot.bytes,
      createdEpochMs: input.sourceCreatedEpochMs, modifiedEpochMs: input.sourceModifiedEpochMs, watchState: "pending", privateDirectoryOwnerVerified: true, readOnlyFileLease: true, oldRuntimeAdopted: false } };
  // No WinAPI is executed. This deliberate seam substitutes only the original
  // Windows file/watch lease. The Linux descriptor copy and full SQL are real.
  class SyntheticFileOwner extends ClosedGeneratedFixtureFileOwner {
    #closed = false; #allocated = false;
    public override initialize(): Promise<ClosedGeneratedFixtureFileObservation> { assert.equal(this.#allocated, false); this.#allocated = true; calls.push("lease-initialize"); return Promise.resolve(structuredClone(native)); }
    public override inspect(): Promise<ClosedGeneratedFixtureFileObservation> { assert.equal(this.#allocated && !this.#closed, true); calls.push("lease-inspect"); return Promise.resolve(structuredClone(native)); }
    public override hasOriginalTransport(): boolean { return this.#allocated; }
    public override isOriginalTransportClosed(): boolean { return this.#closed; }
    public override release(): ReturnType<ClosedGeneratedFixtureFileOwner["release"]> { calls.push("lease-release"); this.#closed = true;
      return Promise.resolve({ originalTransportClosed: true, filesDeleted: false, fileLeaseHeldUntilRelease: true, finalObservation: { ...native, state: "released", originalHandlesClosed: true,
        observation: { ...native.observation, watchState: "cancelled-no-changes" } }, exitCode: 0, signal: null }); }
  }
  let lost = false;
  const owner = new ClosedGeneratedFixtureDataCoordinator({ operationId, pluginRoot: "/mnt/c/synthetic-plugin", assetsRoot: "/mnt/c/synthetic-app/resources/app/assets", runtime,
    assertOriginalOwner: (): void => { assert.equal(calls.includes("native-app-launch"), false); } }, {
    verifySources: (): Promise<void> => Promise.resolve(), loadData: (): Promise<ClosedGeneratedFixtureDataLocator> => { calls.push("load-data"); return Promise.resolve(locator); },
    createFileOwner: (): ClosedGeneratedFixtureFileOwner => new SyntheticFileOwner({ pluginRoot: "/mnt/c/synthetic-plugin", assetsRoot: "/mnt/c/synthetic-app/resources/app/assets",
      nonce: "3".repeat(64), windowsPath: `C:\\SyntheticTemp\\CodexEasyedaFixture_${"8".repeat(32)}\\Codex_arc_line_and_via_${"9".repeat(16)}.eprj2`, expectedSha256: locator.snapshot.sha256, expectedBytes: locator.snapshot.bytes }),
    writeArtifact: async (id, sequence, phase, value): ReturnType<typeof writePhaseArtifact> => { const result = await writePhaseArtifact(id, sequence, phase, value);
      if (phase === "fresh-data-result" && !lost) { lost = true; throw new Error("Synthetic lost original data-result publication acknowledgment"); } return result; },
  });
  return { owner, calls };
}
function start(operationId: string): Record<string, unknown> { return { action: "requalify-closed-generated-fixture", operationId, importOperationId: "synthetic-old-import", generatedArchiveArtifactSha256: "a".repeat(64),
  closedCaptureArtifactSha256: "b".repeat(64), confirmReadClosedGeneratedFixture: true, confirmFreshNoApplicationCheck: true }; }
void test("fresh data qualification copies complete SQL and settles a lost result locally before one new source staging", async () => {
  const id = "fixture-data209-runtime-success"; const { owner, calls } = await fixture(id);
  await assert.rejects(owner.execute(start(id)), /publication acknowledgment/u); const pending = owner.inspect(id);
  assert.equal(pending["freshResourcesClosed"], true); assert.equal(pending["publicationPending"], true); assert.equal(pending["requalifiedDataAvailable"], false);
  assert.equal(owner.hasPendingWork(), true); assert.throws(() => { owner.stageSourceForFreshOpening(id); }); await assert.rejects(owner.execute(start(id)));
  await owner.execute({ action: "settle-records", operationId: id }); assert.equal(owner.inspect(id)["requalifiedDataAvailable"], true);
  const admission = await scanQualifiedAdmissionOperations(); assert.equal(admission.some(entry => entry.summary.operationId === id), false);
  await owner.execute({ action: "release-owner", operationId: id, confirmReleaseClosedDataOwner: true }); assert.equal(owner.hasPendingWork(), false);
  const source = owner.stageSourceForFreshOpening(id); const consumed = consumeManagedFixtureOpeningSource(source);
  assert.equal(consumed.qualification.exactInitialNativePayloadQualified, true); assert.equal(consumed.qualification.registrationVerified, false);
  assert.throws(() => { owner.stageSourceForFreshOpening(id); }); assert.equal(calls.filter(value => value === "lease-initialize").length, 1);
  assert.equal(calls.filter(value => value === "lease-release").length, 1); assert.equal(calls.filter(value => value === "release-original-no-app-helper").length, 1);
});
void test("a fresh observation of an existing app stops before source allocation and releases only its own new proof helper", async () => {
  const id = "fixture-data209-existing-refusal"; const { owner, calls } = await fixture(id, true);
  await assert.rejects(owner.execute(start(id)), /publication acknowledgment/u); await owner.execute({ action: "settle-records", operationId: id });
  assert.match(String(owner.inspect(id)["lastError"]), /APPLICATION_MUST_BE_CLOSED/u); assert.equal(owner.inspect(id)["requalifiedDataAvailable"], false);
  const admission = await scanQualifiedAdmissionOperations(); assert.equal(admission.some(entry => entry.summary.operationId === id), false);
  assert.equal(calls.includes("load-data"), false); assert.equal(calls.includes("lease-initialize"), false);
  await owner.execute({ action: "release-owner", operationId: id, confirmReleaseClosedDataOwner: true }); assert.equal(owner.hasPendingWork(), false);
  assert.throws(() => { owner.stageSourceForFreshOpening(id); }); assert.equal(calls.filter(value => value === "release-original-no-app-helper").length, 1);
});

void test("an unacknowledged original fresh proof release stays nonterminal and blocks generic admission", async () => {
  const id = "fixture-data209-release-uncertain"; const { owner } = await fixture(id, true, true);
  await assert.rejects(owner.execute(start(id)), /publication acknowledgment/u); await owner.execute({ action: "settle-records", operationId: id });
  const admission = await scanQualifiedAdmissionOperations(); const blocked = admission.find(entry => entry.summary.operationId === id);
  assert.equal(blocked?.unfinished, true); assert.equal(blocked?.summary.state, "closed-data-resource-release-unresolved"); assert.equal(blocked.summary.hardStop, true);
  assert.equal(owner.hasPendingWork(), true); assert.equal(owner.inspect(id)["freshResourcesClosed"], false);
  await assert.rejects(owner.execute({ action: "release-owner", operationId: id, confirmReleaseClosedDataOwner: true }));
  assert.throws(() => { owner.stageSourceForFreshOpening(id); });
});
