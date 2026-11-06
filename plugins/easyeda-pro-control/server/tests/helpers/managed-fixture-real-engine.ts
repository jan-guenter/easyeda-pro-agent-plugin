/* oxlint-disable typescript/explicit-function-return-type -- Synthetic structural callbacks inherit the production runtime/coordinator contracts; the exported fixture and dispatcher declare explicit results. */
/* oxlint-disable import/max-dependencies -- Compose the actual engine, HMAC/scope issuer, original runtime validator, tracked cleanup and managed importer in one synthetic no-CAD fixture. */
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { TestContext } from "node:test";
import { z } from "zod";
import { loadOperation, operationPath, writePhaseArtifact } from "../../src/artifacts.ts";
import { canonicalJson, sha256Json } from "../../src/core.ts";
import { EasyedaControlEngine } from "../../src/engine.ts";
import type { ExecutionAuthorityCaptureInput, ExecutionAuthorityEvidence, RuntimeIdentity, TrackedDispatchOperationJournal } from "../../src/engine.ts";
import { encodeExactReadEnvelope } from "../../src/exact-readers.ts";
import { ManagedFixtureImportCoordinator } from "../../src/managed-fixture-import-runtime.ts";
import { OrdinaryTrackedOpenCleanup } from "../../src/ordinary-tracked-open-cleanup.ts";
import type { UpstreamToolResult } from "../../src/upstream.ts";
import { WindowsControlRuntime } from "../../src/windows-runtime.ts";
import { createWindowsRuntimeValidator } from "../../src/windows-runtime-validator.ts";
import { authenticatedLoopbackUpstream } from "./authenticated-loopback-upstream.ts";

const targetSchema = z.object({ operationId: z.string(), nonce: z.string(), archiveSha256: z.string(), qualificationSha256: z.string(),
  expectedProjectUuid: z.string(), manifestTitle: z.string() });
interface Fixture {
  readonly owner: ManagedFixtureImportCoordinator; readonly engine: EasyedaControlEngine; readonly cleanup: OrdinaryTrackedOpenCleanup;
  readonly runtime: WindowsControlRuntime; readonly calls: string[]; readonly behavior: { terminated: boolean; sourceChecks: number; destinationChecks: number; publicationFailed: boolean };
  readonly journals: Map<string, TrackedDispatchOperationJournal>; readonly request: Record<string, unknown>; readonly expected: Record<string, unknown>;
  readonly run: () => Promise<Record<string, unknown>>; readonly importEntered: Promise<boolean>; readonly rejectImport: () => void;
  readonly closeOriginalSession: () => Promise<void>; readonly gateway: Awaited<ReturnType<typeof authenticatedLoopbackUpstream>>["gateway"];
  readonly upstream: Awaited<ReturnType<typeof authenticatedLoopbackUpstream>>["upstream"]; readonly exactJournal: (id: string) => TrackedDispatchOperationJournal;
}
export async function managedFixtureRealEngine(context: TestContext, id: string, options: { watchFailure?: boolean; pendingImport?: boolean; publicationFailure?: boolean; startupRefusal?: boolean; replaceDispatcher?: boolean; refuseEnvironmentBeforeDispatch?: boolean } = {}): Promise<Fixture> {
  const calls: string[] = [], expected = { synthetic: "original-fingerprint" }, journals = new Map<string, TrackedDispatchOperationJournal>();
  const behavior = { terminated: false, sourceChecks: 0, destinationChecks: 0, publicationFailed: false };
  const importEntered = Promise.withResolvers<boolean>(), importReply = Promise.withResolvers<UpstreamToolResult>();
  const native = (args: Record<string, unknown>): Promise<UpstreamToolResult> => {
    const code = args["code"]; assert.ok(typeof code === "string");
    if (!code.includes("const target=")) {
      calls.push("environment-sdk");
      return Promise.resolve({ content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope({ schema: "easyeda-pro-control.fixture-import-environment.v1", mode: "HALF_OFFLINE",
        libraryWindowsDirectories: [String.raw`C:\SyntheticLibraries`], candidatePredicate: "exclude-all-immediate-elib-names", actualMainConfigDirectories: true,
        systemLibNameAssumed: false, libraryContentsRead: false, libraryMigrationExcluded: false }) } });
    }
    calls.push("import-sdk"); importEntered.resolve(true);
    if (options.pendingImport === true) { return importReply.promise; }
    const match = /const target=(.+?),root=globalThis/u.exec(code); assert.ok(match !== null && typeof match[1] === "string" && match[1].length > 0);
    const { manifestTitle, ...target } = targetSchema.parse(JSON.parse(match[1]) as unknown);
    return Promise.resolve({ content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope({ schema: "easyeda-pro-control.managed-fixture-import-job-observation.v1", ...target,
      expectedIdentityMatched: true, state: "sdk-settled", sdkOutcome: "fulfilled-project", returnedUuid: target.expectedProjectUuid,
      returnedProject: { itemType: "Project", uuid: target.expectedProjectUuid, friendlyName: manifestTitle, teamUuid: "synthetic-owner", folderUuid: null, folderUuidWasUndefined: true },
      ownerIntact: true, originalPromiseRetained: true, dispatchAttempted: true, nativeEffectsMayHaveOccurred: true, retryAllowed: false,
      delayedNativeJobsCompleted: false, registrationVerified: false, closedSqlVerified: false, originalClosureVerified: false, executionAuthorized: false }) } });
  };
  const authenticated = await authenticatedLoopbackUpstream(context, native, (): Promise<void> => {
    if (options.startupRefusal === true && behavior.destinationChecks > 0) { return Promise.reject(new Error("Synthetic startup reproof refused before SDK client entry")); }
    return Promise.resolve();
  });
  const { upstream } = authenticated;
  const launch = { jobId: "c".repeat(32), helperInstance: "d".repeat(32), root: { pid: 123, role: "easyeda-main" as const,
    startIdentity: `win32:123456789012345:job:${"c".repeat(32)}` } };
  const runtime = new WindowsControlRuntime({ upstream, pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets",
    wslDistribution: "SyntheticReview", reviewedExecutionScopeSha256: "e".repeat(64) });
  const authorities = new Map<string, string>();
  const supervisor = {
    capture: (input: ExecutionAuthorityCaptureInput): Promise<ExecutionAuthorityEvidence> => {
      assert.equal(upstream.currentAuthenticatedBridgeDispatchBinding()?.sessionId, input.bridgeSession.sessionId); calls.push(`capture:${input.operationId}`);
      const body = { schema: "easyeda-pro-control.execution-authority.v1" as const, bindingSha256: input.bindingSha256, capturedAt: new Date().toISOString(),
        policyId: "synthetic-original-owned-job", policySha256: "f".repeat(64), processes: [launch.root], processTreeSha256: sha256Json([launch.root]) };
      const result = { ...body, authoritySha256: sha256Json(body) }; authorities.set(result.authoritySha256, input.operationId); return Promise.resolve(result);
    },
    releaseCapture: async (authority: ExecutionAuthorityEvidence): Promise<void> => {
      const operation = authorities.get(authority.authoritySha256); assert.ok(typeof operation === "string" && operation.length > 0);
      const journal = await loadOperation(operation); assert.equal(journal["orphanedCallPossible"], false); calls.push(`release-capture:${operation}`);
    },
    observeLaunchTermination: (): Promise<unknown> => Promise.resolve({ jobId: launch.jobId, helperInstance: launch.helperInstance, terminated: behavior.terminated }),
    observeApplicationWindow: (): Promise<unknown> => Promise.resolve({ jobId: launch.jobId, helperInstance: launch.helperInstance, outcome: "available", hwnd: "12345" }),
    requestNormalClose: (): Promise<void> => { calls.push("normal-close"); return Promise.resolve(); },
  };
  Object.defineProperties(runtime, { supervisor: { value: supervisor }, currentLaunch: { value: launch }, state: { value: "owned" } });
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: createWindowsRuntimeValidator(() => runtime) }); await engine.controlFingerprintPromise;
  const identity: RuntimeIdentity = { kind: "runtime-identity", generation: "original-import-renderer", timeOrigin: 1, processId: null };
  context.mock.method(engine, "runtimeIdentity", (): Promise<RuntimeIdentity> => Promise.resolve(identity));
  context.mock.method(engine, "status", (): Promise<{ stableFingerprint: Record<string, unknown> }> => Promise.resolve({ stableFingerprint: expected }));
  const assertOriginal = (): void => { assert.deepEqual(runtime.status().launch, launch); };
  const cleanup = new OrdinaryTrackedOpenCleanup(engine, runtime, assertOriginal);
  const owner = new ManagedFixtureImportCoordinator({ pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets", engine, runtime,
    assertOriginalOwner: assertOriginal, cleanup: { retain: journal => { journals.set(journal.operationId, journal); cleanup.retain(journal); },
      inspect: operation => cleanup.inspect(operation), run: request => cleanup.run(request) } }, {
    assertFingerprint: input => { assert.deepEqual(input, expected); },
    verifySources: (): Promise<void> => {
      behavior.sourceChecks += 1;
      if (options.refuseEnvironmentBeforeDispatch === true && behavior.sourceChecks === 2) { return Promise.reject(new Error("Synthetic environment source refused before SDK entry")); }
      return Promise.resolve();
    },
    writeArtifact: async (operation, sequence, phase, payload) => {
      const result = await writePhaseArtifact(operation, sequence, phase, payload);
      if (options.publicationFailure === true && phase === "original-sdk-settlement" && !behavior.publicationFailed) {
        behavior.publicationFailed = true; throw new Error("Synthetic original SDK artifact acknowledgment lost");
      }
      return result;
    },
    destination: settings => {
      const observation = { schema: "easyeda-pro-control.fixture-destination-owner.v1" as const, nonce: settings.nonce, ownerId: "5".repeat(32),
        windowsDirectory: `C:\\SyntheticTemp\\CodexEasyedaFixture_${"5".repeat(32)}`, directoryIdentity: "12345678:1234567812345678",
        expectedBasename: settings.expectedBasename, entries: [], state: "held" as const, deletionAuthorized: false as const,
        libraries: [{ windowsDirectory: "C:\\SyntheticLibraries", directoryIdentity: "12345678:1111111111111111", names: ["asset.step"], watchState: "pending" as const }] };
      return { initialize: (): Promise<typeof observation> => Promise.resolve(observation), snapshot: (): typeof observation => observation,
        inspect: (): Promise<typeof observation> => {
          behavior.destinationChecks += 1;
          if (options.watchFailure === true) { return Promise.reject(new Error("Synthetic retained watch refused before SDK client entry")); }
          if (options.replaceDispatcher === true) {
            Object.defineProperty(upstream, "callTool", { value: (): Promise<never> => { calls.push("replaced-dispatcher"); return Promise.reject(new Error("Replaced dispatcher must never run")); } });
          }
          return Promise.resolve(observation);
        },
        release: () => {
          calls.push("release-directory");
          return Promise.resolve({ originalTransportClosed: true, filesDeleted: false, migrationExclusionHeldUntilRelease: true,
            finalObservation: { ...observation, state: "released" as const, libraries: observation.libraries.map(entry => ({ windowsDirectory: entry.windowsDirectory, directoryIdentity: entry.directoryIdentity, names: entry.names, watchState: "cancelled-no-changes" as const })) }, exitCode: 0, signal: null });
        },
      };
    },
  });
  const request = { action: "import-generated-fixture", operationId: id, fixtureKind: "via-only", confirmDisposableFixture: true, confirmNativeImport: true, acceptPartialImportRetention: true };
  const run = (): Promise<Record<string, unknown>> => upstream.withAuthenticatedBridgeDispatchScope(() => owner.execute(request, expected));
  context.after(async () => {
    for (const operation of [id, `${id}-environment`]) { const path = operationPath(operation); await rm(path, { force: true }); await rm(join(dirname(path), operation), { recursive: true, force: true }); }
  });
  return { owner, engine, cleanup, runtime, calls, behavior, journals, request, expected, run, importEntered: importEntered.promise,
    rejectImport: (): void => { importReply.reject(new Error("Synthetic original SDK reply lost")); }, closeOriginalSession: authenticated.closeOriginalSession,
    gateway: authenticated.gateway, upstream, exactJournal: (operation: string): TrackedDispatchOperationJournal => { const journal = journals.get(operation); assert.ok(journal); assert.equal(canonicalJson(journal.plan), canonicalJson(owner.originalJournalForCleanup(operation).plan)); return journal; } };
}
