/* oxlint-disable import/max-dependencies -- One focused integration composes genuine generated SQL, the real engine/HMAC scope and original runtime cleanup around synthetic UI/model operations. */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { loadOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { canonicalJson, sha256Json } from "../src/core.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { ExecutionAuthorityCaptureInput, ExecutionAuthorityEvidence, RuntimeIdentity } from "../src/engine.ts";
import { GeneratedSchematicOpeningCoordinator } from "../src/managed-schematic-fixture-opening-runtime.ts";
import type { GeneratedSchematicReadOpenCheckpoint as GeneratedSchematicFixtureOpenCheckpoint } from "../src/managed-schematic-fixture-read-source.ts";
import { qualifyGeneratedSchematicRelevanceFixtureInitialSql } from "../src/managed-schematic-relevance-fixture-initial-sql.ts";
import { stageManagedSchematicRelevanceFixtureOpeningSource } from "../src/managed-schematic-relevance-fixture-opening-source.ts";
import { qualifyGeneratedSchematicFixtureInitialSql } from "../src/managed-schematic-fixture-initial-sql.ts";
import { stageManagedSchematicFixtureOpeningSource } from "../src/managed-schematic-fixture-opening-source.ts";
import { OrdinaryTrackedOpenCleanup } from "../src/ordinary-tracked-open-cleanup.ts";
import type { UpstreamToolResult } from "../src/upstream.ts";
import { WindowsControlRuntime } from "../src/windows-runtime.ts";
import { createWindowsRuntimeValidator } from "../src/windows-runtime-validator.ts";
import { authenticatedLoopbackUpstream } from "./helpers/authenticated-loopback-upstream.ts";
import { generatedSchematicOpeningVm } from "./helpers/generated-schematic-opening-vm.ts";
import { managedSchematicFixtureInitialSqlFixture } from "./helpers/managed-schematic-fixture-initial-sql.ts";

async function fixture(context: TestContext, operationId: string, losePublication = false, sourceKind: "original" | "relevance" = "original"): Promise<{
  owner: GeneratedSchematicOpeningCoordinator; run: (request: unknown) => Promise<Record<string, unknown>>;
  expected: Record<string, unknown>; calls: string[]; behavior: { terminated: boolean; current: boolean; failed: boolean }; closeSession: () => Promise<void>;
}> {
  const input = await managedSchematicFixtureInitialSqlFixture(undefined, sourceKind);
  const qualified = await (sourceKind === "relevance" ? qualifyGeneratedSchematicRelevanceFixtureInitialSql : qualifyGeneratedSchematicFixtureInitialSql)(input);
  const vm = generatedSchematicOpeningVm(qualified.qualification, qualified.history); const calls: string[] = [];
  const behavior = { terminated: false, current: true, failed: false }; const expected = { synthetic: "generated-schematic-original-runtime", installedBundles: { assetsRoot: "/mnt/c/Synthetic/resources/app/assets" } };
  const native = async (argumentsValue: Record<string, unknown>): Promise<UpstreamToolResult> => {
    const code = argumentsValue["code"]; assert.equal(typeof code, "string"); calls.push("native-sdk");
    return { content: [], structuredContent: { ok: true, result: await vm.run(String(code)) } };
  };
  const authenticated = await authenticatedLoopbackUpstream(context, native); const { upstream } = authenticated;
  const launch = { jobId: "c".repeat(32), helperInstance: "d".repeat(32), root: { pid: 123, role: "easyeda-main" as const, startIdentity: `win32:123456789012345:job:${"c".repeat(32)}` } };
  const runtime = new WindowsControlRuntime({ upstream, pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets", wslDistribution: "SyntheticReview", reviewedExecutionScopeSha256: "e".repeat(64) });
  const supervisor = {
    capture: (capture: ExecutionAuthorityCaptureInput): Promise<ExecutionAuthorityEvidence> => {
      calls.push("capture-original"); const body = { schema: "easyeda-pro-control.execution-authority.v1" as const, bindingSha256: capture.bindingSha256, capturedAt: new Date().toISOString(),
        policyId: "synthetic-owned-generated-sch", policySha256: "f".repeat(64), processes: [launch.root], processTreeSha256: sha256Json([launch.root]) };
      return Promise.resolve({ ...body, authoritySha256: sha256Json(body) });
    },
    releaseCapture: async (): Promise<void> => { const stored = await loadOperation(operationId); assert.equal(stored["orphanedCallPossible"], false); calls.push("release-capture"); },
    requestNormalClose: (): Promise<void> => { calls.push("normal-close"); return Promise.resolve(); },
    observeLaunchTermination: (): Promise<unknown> => Promise.resolve({ jobId: launch.jobId, helperInstance: launch.helperInstance, terminated: behavior.terminated }),
    observeApplicationWindow: (): Promise<unknown> => Promise.resolve({ jobId: launch.jobId, helperInstance: launch.helperInstance, outcome: "available", hwnd: "12345" }),
  };
  Object.defineProperties(runtime, { supervisor: { value: supervisor }, currentLaunch: { value: launch }, state: { value: "owned" } });
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: createWindowsRuntimeValidator(() => runtime) }); await engine.controlFingerprintPromise;
  context.mock.method(engine, "runtimeIdentity", (): Promise<RuntimeIdentity> => Promise.resolve({ kind: "runtime-identity", generation: "synthetic-original-generated-sch", timeOrigin: 1, processId: null }));
  context.mock.method(engine, "status", (): Promise<{ stableFingerprint: Record<string, unknown> }> => Promise.resolve({ stableFingerprint: expected }));
  const assertOriginal = (): void => { assert.equal(behavior.current, true); assert.equal(canonicalJson(runtime.status().launch), canonicalJson(launch)); };
  const cleanup = new OrdinaryTrackedOpenCleanup(engine, runtime, assertOriginal);
  const importingRuntime = { status: (): ReturnType<WindowsControlRuntime["status"]> => ({ ...runtime.status(), launch: { ...launch, jobId: "a".repeat(32), helperInstance: "b".repeat(32),
    root: { ...launch.root, pid: 122, startIdentity: `win32:123456789012344:job:${"a".repeat(32)}` } } }) };
  const source = qualified.qualification.schema === "easyeda-pro-control.qualified-generated-schematic-relevance-fixture-target.v1" ?
    stageManagedSchematicRelevanceFixtureOpeningSource({ qualification: qualified.qualification, archive: input.archive, importingRuntime }) :
    stageManagedSchematicFixtureOpeningSource({ qualification: qualified.qualification, archive: input.archive, importingRuntime });
  // The production preparer must issue its own genuine Windows-path checkpoint.
  // Only this explicit offline seam supplies a synthetic DTO: original SQL and
  // Navigation/authority are still real code; no target JSON enters production.
  const commonPrepared = {
    preparationCheckpoint: { path: input.syntheticDatabasePath, bytes: 8192, sha256: input.inventory.checkpointSha256 }, history: qualified.history,
    vacuumProjection: { sourceLogicalSha256: input.inventory.logicalSha256, checkpointLogicalSha256: input.inventory.logicalSha256, sourceSchemaVersion: 1, checkpointSchemaVersion: 2, onlySchemaVersionIncremented: true as const },
    checkpoint: { schema: "easyeda-pro-control.checkpoint.v2" as const, source: input.syntheticDatabasePath, checkpoint: input.syntheticDatabasePath, receiptPath: `${input.syntheticDatabasePath}.receipt.json`, createdAt: "2026-01-01T00:00:00Z",
      sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" }, checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" },
      sourceSha256: input.inventory.checkpointSha256, checkpointSha256: input.inventory.checkpointSha256, sourceDumpSha256: "a".repeat(64), checkpointDumpSha256: "a".repeat(64), receiptSha256: "a".repeat(64) } };
  const prepared: GeneratedSchematicFixtureOpenCheckpoint = qualified.qualification.schema === "easyeda-pro-control.qualified-generated-schematic-relevance-fixture-target.v1" ?
    { profile: "easyeda-pro-control.generated-schematic-relevance-fixture-open-checkpoint.v1", qualification: qualified.qualification, ...commonPrepared } :
    { profile: "easyeda-pro-control.generated-schematic-fixture-open-checkpoint.v1", qualification: qualified.qualification, ...commonPrepared };
  const owner = new GeneratedSchematicOpeningCoordinator({ operationId, source, engine, runtime, assetsRoot: "/mnt/c/Synthetic/resources/app/assets", assertOriginalOwner: assertOriginal, cleanup }, {
    assertFingerprint: (value): true => { assert.deepEqual(value, expected); return true; }, verifySources: (): Promise<void> => Promise.resolve(),
    prepareCheckpoint: (): Promise<GeneratedSchematicFixtureOpenCheckpoint> => Promise.resolve(prepared),
    verifyCheckpoint: (value): Promise<void> => { assert.equal(value, prepared); return Promise.resolve(); },
    verifyHistoricalCheckpoint: (value): Promise<void> => { assert.equal(value, prepared); return Promise.resolve(); },
    writeArtifact: async (id, sequence, phase, value): ReturnType<typeof writePhaseArtifact> => {
      const descriptor = await writePhaseArtifact(id, sequence, phase, value);
      if (losePublication && phase === "native-navigation" && !behavior.failed) { behavior.failed = true; throw new Error("Synthetic lost original navigation publication acknowledgment"); }
      return descriptor;
    },
  });
  const run = (request: unknown): Promise<Record<string, unknown>> => upstream.withAuthenticatedBridgeDispatchScope(() => owner.execute(request, expected));
  return { owner, run, expected, calls, behavior, closeSession: authenticated.closeOriginalSession };
}
const opening = (operationId: string): Record<string, unknown> => ({ action: "open-generated-schematic", operationId, confirmGeneratedDisposableFixture: true, acceptRecentPathRegistration: true, acceptNormalOpenEffects: true });

void test("real original engine/HMAC generated SCH navigation and passive reader batch preserve original cleanup through normal closure", async context => {
  const id = "sch209-generated-real-success", value = await fixture(context, id);
  const result = await value.run(opening(id)); assert.equal(result["phase"], "opened-ready"); assert.equal(value.owner.hasPendingWork(), true);
  const reader = await value.run({ action: "observe-text-wire-bus", operationId: id, confirmGeneratedReadOnly: true });
  assert.equal(reader["phase"], "readers-observed-unverified"); assert.equal(reader["connectivityVerified"], false);
  await assert.rejects(value.run(opening(id))); await assert.rejects(value.run({ action: "observe-text-wire-bus", operationId: id, confirmGeneratedReadOnly: true }));
  assert.equal(value.calls.filter(call => call === "native-sdk").length, 2); assert.equal(value.calls.filter(call => call === "capture-original").length, 1);
  const inspection = value.owner.inspect(id); const cleanup = inspection["cleanup"]; assert.ok(cleanup !== null && typeof cleanup === "object" && "cleanupNonce" in cleanup && typeof cleanup.cleanupNonce === "string");
  const bound = { operationId: id, cleanupNonce: cleanup.cleanupNonce };
  await value.owner.execute({ action: "request-cleanup-close", ...bound, confirmNormalClose: true, acceptUnknownFileEffects: true });
  value.behavior.terminated = true; await value.owner.execute({ action: "observe-cleanup-termination", ...bound });
  await value.closeSession(); await value.owner.execute({ action: "finish-cleanup", ...bound });
  await value.owner.execute({ action: "release-owner", operationId: id, confirmReleaseGeneratedSchematicOwner: true });
  assert.equal(value.owner.hasPendingWork(), false); assert.equal(value.calls.filter(call => call === "normal-close").length, 1);
  const stored = await loadOperation(id); assert.equal(stored["orphanedCallPossible"], false);
});
void test("real original engine/HMAC Relevance SCH navigation and passive reader batch preserve original cleanup through normal closure", async context => {
  const id = "sch209-generated-real-relevance", value = await fixture(context, id, false, "relevance");
  const result = await value.run(opening(id)); assert.equal(result["phase"], "opened-ready"); assert.equal(value.owner.hasPendingWork(), true);
  const reader = await value.run({ action: "observe-text-wire-bus", operationId: id, confirmGeneratedReadOnly: true });
  assert.equal(reader["phase"], "readers-observed-unverified"); assert.equal(reader["connectivityVerified"], false);
  await assert.rejects(value.run(opening(id))); await assert.rejects(value.run({ action: "observe-text-wire-bus", operationId: id, confirmGeneratedReadOnly: true }));
  assert.equal(value.calls.filter(call => call === "native-sdk").length, 2); assert.equal(value.calls.filter(call => call === "capture-original").length, 1);
  const inspection = value.owner.inspect(id); const cleanup = inspection["cleanup"]; assert.ok(cleanup !== null && typeof cleanup === "object" && "cleanupNonce" in cleanup && typeof cleanup.cleanupNonce === "string");
  const bound = { operationId: id, cleanupNonce: cleanup.cleanupNonce };
  await value.owner.execute({ action: "request-cleanup-close", ...bound, confirmNormalClose: true, acceptUnknownFileEffects: true });
  value.behavior.terminated = true; await value.owner.execute({ action: "observe-cleanup-termination", ...bound });
  await value.closeSession(); await value.owner.execute({ action: "finish-cleanup", ...bound });
  await value.owner.execute({ action: "release-owner", operationId: id, confirmReleaseGeneratedSchematicOwner: true });
  assert.equal(value.owner.hasPendingWork(), false); assert.equal(value.calls.filter(call => call === "normal-close").length, 1);
  const stored = await loadOperation(id); assert.equal(stored["orphanedCallPossible"], false);
});
void test("lost generated navigation publication settles only original local records and closes its same original HMAC/runtime without replay", async context => {
  const id = "sch209-generated-real-publication", value = await fixture(context, id, true);
  await assert.rejects(value.run(opening(id)), /publication acknowledgment/u); assert.equal(value.owner.inspect(id)["publicationPending"], true);
  await value.owner.execute({ action: "settle-records", operationId: id }); assert.equal(value.owner.inspect(id)["publicationPending"], false);
  await assert.rejects(value.run(opening(id))); assert.equal(value.calls.filter(call => call === "native-sdk").length, 1);
  const cleanup = value.owner.inspect(id)["cleanup"]; assert.ok(cleanup !== null && typeof cleanup === "object" && "cleanupNonce" in cleanup && typeof cleanup.cleanupNonce === "string");
  const bound = { operationId: id, cleanupNonce: cleanup.cleanupNonce };
  await value.owner.execute({ action: "request-cleanup-close", ...bound, confirmNormalClose: true, acceptUnknownFileEffects: true });
  value.behavior.terminated = true; await value.owner.execute({ action: "observe-cleanup-termination", ...bound });
  await value.closeSession(); await value.owner.execute({ action: "finish-cleanup", ...bound });
  await value.owner.execute({ action: "release-owner", operationId: id, confirmReleaseGeneratedSchematicOwner: true }); assert.equal(value.owner.hasPendingWork(), false);
});
