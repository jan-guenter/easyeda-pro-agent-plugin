/* oxlint-disable typescript/explicit-function-return-type -- These synthetic structural callbacks inherit the maintained owner interfaces; the test fixture and dispatcher have explicit result types. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { loadOperation, readArtifact, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { canonicalJson } from "../src/core.ts";
import type { TrackedDispatchOperationJournal } from "../src/engine.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { ManagedFixtureImportCoordinator, managedFixtureImportRequestSchema } from "../src/managed-fixture-import-runtime.ts";
import type { ManagedFixtureImportOptions } from "../src/managed-fixture-import-runtime.ts";

const targetSchema = z.object({ operationId: z.string(), nonce: z.string(), archiveSha256: z.string(), qualificationSha256: z.string(),
  expectedProjectUuid: z.string(), manifestTitle: z.string() });
function fixture(id: string, lostReply = false, lostEnvironment = false, watchChanged = false, publicationFailure?: "sdk-artifact" | "sdk-journal", environmentReply?: unknown): { owner: ManagedFixtureImportCoordinator; calls: string[]; request: Record<string, unknown>; expected: Record<string, unknown> } {
  const calls: string[] = [], expected = { synthetic: "original-fingerprint" };
  const launch = { jobId: "1".repeat(32), helperInstance: "2".repeat(32), root: { pid: 123, role: "easyeda-main" as const,
    startIdentity: `win32:123456789012345678:job:${"1".repeat(32)}` } };
  let originalJournal: TrackedDispatchOperationJournal | undefined;
  const cleanupComplete = new Set<string>(), cleanupJournals = new Map<string, TrackedDispatchOperationJournal>();
  const dispatcherStates = new WeakMap<TrackedDispatchOperationJournal, { phase: string; settled: boolean; callToolEntered: boolean }>();
  let publicationFailed = false;
  const engine: ManagedFixtureImportOptions["engine"] = {
    assertBridgeDispatchAllowed: () => { calls.push("guard"); return Promise.resolve(true); },
    status: () => { calls.push("status"); return Promise.resolve({ stableFingerprint: expected }); },
    originalTrackedDispatchStatus: (journal) => dispatcherStates.get(journal),
    dispatchWithOrphanTracking: async (journal, phase, name, args, _timeout, before, retain, beforeClear): Promise<unknown> => {
      const dispatchState = { phase, settled: false, callToolEntered: false }; dispatcherStates.set(journal, dispatchState);
      try {
      calls.push("tracked"); assert.equal(journal, originalJournal); assert.equal(phase, "managed-fixture-import"); assert.equal(name, "easyeda_execute");
      assert.equal(canonicalJson(await loadOperation(journal.operationId)), canonicalJson(journal));
      journal.orphanedCallPossible = true; journal.orphanedCallPhase = phase; await updateOperation(journal);
      try { await before?.(); } catch (error) { journal.orphanedCallPossible = false; await updateOperation(journal); throw error; }
      dispatchState.callToolEntered = true;
      if (journal.operationId.endsWith("-environment")) {
        calls.push("environment");
        if (lostEnvironment) { throw new Error("Synthetic lost environment reply"); }
        if (environmentReply !== undefined) { await retain?.(environmentReply); throw new Error("Unexpected successful synthetic environment refusal retention"); }
        const payload = { schema: "easyeda-pro-control.fixture-import-environment.v1", mode: "HALF_OFFLINE", libraryWindowsDirectories: [String.raw`C:\SyntheticLibraries`],
          candidatePredicate: "exclude-all-immediate-elib-names", actualMainConfigDirectories: true, systemLibNameAssumed: false, libraryContentsRead: false, libraryMigrationExcluded: false };
        const raw = { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(payload) } };
        await retain?.(raw); await beforeClear?.(); journal.orphanedCallPossible = false; await updateOperation(journal); return raw;
      }
      calls.push("import");
      if (lostReply) { throw new Error("Synthetic lost import reply"); }
      const code = args["code"]; assert.ok(typeof code === "string");
      const match = /const target=(.+?),root=globalThis/u.exec(code); assert.ok(match !== null && match[1] !== undefined && match[1].length > 0);
      const target = targetSchema.parse(JSON.parse(match[1]) as unknown);
      const observation = { schema: "easyeda-pro-control.managed-fixture-import-job-observation.v1", ...target,
        expectedIdentityMatched: true, state: "sdk-settled", sdkOutcome: "fulfilled-project", returnedUuid: target.expectedProjectUuid,
        returnedProject: { itemType: "Project", uuid: target.expectedProjectUuid, friendlyName: target.manifestTitle, teamUuid: "synthetic-owner", folderUuid: null, folderUuidWasUndefined: true },
        ownerIntact: true, originalPromiseRetained: true, dispatchAttempted: true, nativeEffectsMayHaveOccurred: true,
        retryAllowed: false, delayedNativeJobsCompleted: false, registrationVerified: false, closedSqlVerified: false, originalClosureVerified: false, executionAuthorized: false };
      // ManifestTitle is an internal target binding, not part of serialized SDK evidence.
      const { manifestTitle: omitted, ...payload } = observation; assert.equal(omitted, target.manifestTitle);
      const raw = { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(payload) } };
      await retain?.(raw); await beforeClear?.(); journal.orphanedCallPossible = false; await updateOperation(journal); return raw;
      } finally { dispatchState.settled = true; }
    },
  };
  const owner = new ManagedFixtureImportCoordinator({ pluginRoot: "/mnt/c/synthetic-plugin", assetsRoot: "/mnt/c/synthetic-app/resources/app/assets", engine,
    assertOriginalOwner: () => { calls.push("original-owner"); },
    runtime: { status: () => ({ state: "owned", launch, executableSha256: "3".repeat(64), reviewedExecutionScopeSha256: "4".repeat(64) }),
      observeLaunchTermination: () => Promise.resolve({ jobId: launch.jobId, helperInstance: launch.helperInstance, terminated: true }) },
    cleanup: { retain: (journal) => { calls.push("retain-cleanup"); originalJournal = journal; cleanupJournals.set(journal.operationId, journal); },
      inspect: (operation) => ({ cleanupAvailable: true, cleanupComplete: cleanupComplete.has(operation) }),
      run: async (request) => {
        if (request.action === "finish-cleanup") {
          const journal = cleanupJournals.get(request.operationId); assert.ok(journal !== undefined);
          journal.hardStop = false; journal.orphanedCallPossible = false; journal.state = "completed"; await updateOperation(journal); cleanupComplete.add(request.operationId);
        }
        return { cleanupComplete: cleanupComplete.has(request.operationId) };
      } },
  }, { assertFingerprint: (input) => { assert.deepEqual(input, expected); }, verifySources: () => Promise.resolve(),
    writeArtifact: async (operation, sequence, phase, payload) => {
      const artifact = await writePhaseArtifact(operation, sequence, phase, payload);
      if (!publicationFailed && publicationFailure === "sdk-artifact" && phase === "original-sdk-settlement") { publicationFailed = true; throw new Error("Synthetic lost original SDK artifact acknowledgment"); }
      return artifact;
    },
    updateJournal: async (journal) => {
      const path = await updateOperation(journal);
      if (!publicationFailed && publicationFailure === "sdk-journal" && journal["state"] === "managed-fixture-sdk-settled-unverified") { publicationFailed = true; throw new Error("Synthetic lost original SDK journal acknowledgment"); }
      return path;
    },
    destination: (options) => {
      const observation = { schema: "easyeda-pro-control.fixture-destination-owner.v1" as const, nonce: options.nonce,
        ownerId: "5".repeat(32), windowsDirectory: `C:\\SyntheticTemp\\CodexEasyedaFixture_${"5".repeat(32)}`,
        directoryIdentity: "12345678:1234567812345678", expectedBasename: options.expectedBasename, entries: [], state: "held" as const, deletionAuthorized: false as const,
        libraries: [{ windowsDirectory: "C:\\SyntheticLibraries", directoryIdentity: "12345678:1111111111111111", names: ["asset.step"], watchState: "pending" as const }] };
      return { initialize: () => Promise.resolve(observation), inspect: () => watchChanged ? Promise.reject(new Error("Synthetic original library watch completion")) : Promise.resolve(observation), snapshot: () => observation,
        release: () => { calls.push("release-directory"); return Promise.resolve({ originalTransportClosed: true, filesDeleted: false,
          migrationExclusionHeldUntilRelease: true, finalObservation: { ...observation, state: "released" as const, libraries: observation.libraries.map((entry) => ({ windowsDirectory: entry.windowsDirectory, directoryIdentity: entry.directoryIdentity, names: entry.names, watchState: "cancelled-no-changes" as const })) }, exitCode: 0, signal: null }); } };
    } });
  return { owner, calls, expected, request: { action: "import-generated-fixture", operationId: id, fixtureKind: "via-only",
    confirmDisposableFixture: true, confirmNativeImport: true, acceptPartialImportRetention: true } };
}

void test("actual import coordinator stages a fresh archive, seals destination and tracks its sole SDK call without accepting persistence", async () => {
  const value = fixture("managed-import-runtime-success");
  const result = await value.owner.execute(value.request, value.expected);
  assert.equal(result["phase"], "sdk-settled-unverified"); assert.equal(result["importedFixtureAccepted"], false);
  assert.equal(result["registrationVerified"], false); assert.equal(result["closedSqlVerified"], false);
  const journal = await loadOperation("managed-import-runtime-success");
  assert.equal(journal["orphanedCallPossible"], false); assert.equal(journal["hardStop"], true); assert.equal(journal["saved"], false);
  assert.equal(value.owner.hasRetainedDestination(), true);
  assert.equal(value.owner.hasActiveReservation(), true);
  await assert.rejects(value.owner.execute(value.request, value.expected)); assert.equal(value.calls.filter((call) => call === "import").length, 1);
  const released = await value.owner.execute({ action: "release-destination", operationId: "managed-import-runtime-success", confirmReleaseRetainedDirectory: true });
  assert.equal(released["destinationReleased"], true); assert.equal(released["filesDeleted"], false);
  assert.equal(value.owner.hasActiveReservation(), true);
  await assert.rejects(value.owner.execute({ action: "release-owner", operationId: "managed-import-runtime-success", confirmReleaseFixtureOwner: true }));
  await value.owner.execute({ action: "finish-cleanup", operationId: "managed-import-runtime-success", cleanupNonce: "EASYEDA_ORIGINAL_TRACKED_CLEANUP:managed-import-runtime-success:managed-fixture-import:1:synthetic-original-id" });
  await value.owner.execute({ action: "release-owner", operationId: "managed-import-runtime-success", confirmReleaseFixtureOwner: true });
  assert.equal(value.owner.hasActiveReservation(), false); assert.equal(value.owner.hasPendingWork(), false);
  await assert.rejects(value.owner.execute(value.request, value.expected)); assert.equal(value.owner.hasActiveReservation(), false);
});

void test("local opening staging cannot fall through to original destination release", async () => {
  const value = fixture("managed-import-stage-not-cleanup");
  await value.owner.execute(value.request, value.expected);
  const count = value.calls.length;
  await assert.rejects(value.owner.execute({ action: "stage-for-fresh-opening", operationId: "managed-import-stage-not-cleanup",
    confirmStageClosedFixture: true }), /separate local index handoff/u);
  assert.equal(value.calls.length, count); assert.equal(value.calls.includes("release-directory"), false);
  assert.equal(value.owner.hasRetainedDestination(), true); assert.equal(value.owner.hasActiveReservation(), true);
  assert.equal(managedFixtureImportRequestSchema.safeParse({ action: "stage-for-fresh-opening", operationId: "managed-import-stage-not-cleanup",
    confirmStageClosedFixture: false }).success, false);
});
void test("schematic scenario reaches the original tracked importer with its own fixed generated archive", async () => {
  const id = "managed-import-schematic-runtime", value = fixture(id);
  const result = await value.owner.execute({ ...value.request, fixtureKind: "schematic-text-wire-bus" }, value.expected);
  assert.equal(result["importedFixtureAccepted"], false); assert.equal(result["closedSqlVerified"], false);
  const journal = await loadOperation(id); assert.equal(journal.plan["fixtureKind"], "schematic-text-wire-bus");
  const destination = result["destination"]; assert.ok(destination !== null && typeof destination === "object" && "expectedBasename" in destination);
  assert.match(String(destination.expectedBasename), /^Codex_schematic_[a-f0-9]{16}\.eprj2$/u);
  assert.equal(value.calls.filter(call => call === "import").length, 1); await assert.rejects(value.owner.execute(value.request, value.expected));
  assert.throws(() => value.owner.qualifiedSchematicSourceForFreshOpening()); assert.throws(() => value.owner.qualifiedSourceForFreshOpening());
});

void test("ambiguous environment preserves its own original journal and cannot allocate a destination or importer", async () => {
  const value = fixture("managed-import-environment-ambiguous", false, true);
  await assert.rejects(value.owner.execute(value.request, value.expected), /environment-ambiguous-environment/u);
  const result = await value.owner.execute({ action: "inspect", operationId: "managed-import-environment-ambiguous-environment" });
  assert.equal(result["phase"], "environment-ambiguous-or-refused"); assert.equal(value.owner.hasRetainedDestination(), false);
  assert.equal(value.owner.hasPendingWork(), true);
  await assert.rejects(value.owner.execute({ action: "release-owner", operationId: "managed-import-environment-ambiguous", confirmReleaseFixtureOwner: true }));
  const journal = await loadOperation("managed-import-environment-ambiguous-environment"); assert.equal(journal["orphanedCallPossible"], true);
  assert.equal(value.calls.includes("import"), false); await assert.rejects(value.owner.execute(value.request, value.expected));
});

void test("original failed environment replies survive extraction and base-ID inspection without importer retry", async () => {
  const refusal = { schema: "easyeda-pro-control.fixture-import-environment-refusal.v1", stage: "response-metadata", reason: "predicate-refused",
    configGetAttempted: true, responseReceived: true, responseTextAttempted: false, responseStatus: 200, responseUrl: "empty", effectsUnknown: true, retryAllowed: false };
  const failures = [
    { kind: "upstream", raw: { content: [], structuredContent: { ok: false, error: `Synthetic native refusal ${"x".repeat(24_000)}` } } },
    { kind: "refusal", raw: { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(refusal) } } },
  ];
  for (const failure of failures) {
    const id = `managed-import-environment-evidence-${failure.kind}`, value = fixture(id, false, false, false, undefined, failure.raw);
    await assert.rejects(value.owner.execute(value.request, value.expected), /is incomplete/u);
    const inspected = value.owner.inspect(id);
    assert.equal(inspected["operationId"], `${id}-environment`); assert.equal(inspected["requestedOperationId"], id);
    assert.equal(inspected["nativeImportMayHaveBeenDispatched"], false); assert.equal(inspected["nativeEnvironmentMayHaveBeenDispatched"], true);
    const reply = z.object({ bytes: z.number(), sha256: z.string(), value: z.unknown() }).parse(inspected["originalEnvironmentReply"]);
    assert.equal(canonicalJson(reply.value), canonicalJson(failure.raw));
    const journal = await loadOperation(`${id}-environment`); assert.ok(journal.artifacts !== undefined);
    const artifact = journal.artifacts.find(item => item.path.endsWith("-original-environment-dispatch-reply.json"));
    assert.ok(artifact !== undefined); const retainedArtifact = await readArtifact(artifact.path);
    const retainedValue: unknown = JSON.parse(retainedArtifact.text);
    assert.equal(canonicalJson(retainedValue), canonicalJson(failure.raw));
    if (failure.kind === "refusal") { assert.deepEqual(inspected["environmentRefusal"], refusal); }
    assert.equal(journal["orphanedCallPossible"], true); assert.equal(value.owner.hasRetainedDestination(), false);
    assert.equal(value.calls.includes("import"), false); await assert.rejects(value.owner.execute(value.request, value.expected));
    assert.equal(value.calls.filter(call => call === "environment").length, 1);
  }
});

void test("hostile reply getters are refused before extraction without losing original cleanup custody", async () => {
  let reads = 0;
  const raw = Object.defineProperty({}, "structuredContent", { enumerable: true, get: (): never => { reads += 1; throw new Error("foreign getter"); } });
  const id = "managed-import-environment-foreign-reply", value = fixture(id, false, false, false, undefined, raw);
  await assert.rejects(value.owner.execute(value.request, value.expected)); assert.equal(reads, 0);
  assert.equal(value.calls.includes("import"), false); assert.equal(value.owner.hasRetainedDestination(), false);
  assert.equal(value.owner.inspect(id)["originalJournalRetained"], true);
});

void test("a library watch completion before dispatch retains the destination and prevents import", async () => {
  const value = fixture("managed-import-watch-changed", false, false, true);
  await assert.rejects(value.owner.execute(value.request, value.expected));
  assert.equal(value.calls.includes("import"), false); assert.equal(value.owner.hasRetainedDestination(), true);
  const journal = await loadOperation("managed-import-watch-changed"); assert.equal(journal["mutationMayHaveOccurred"], false);
  assert.equal(journal["state"], "completed"); assert.equal(journal["hardStop"], false);
});

void test("ambiguous native import retains the original tracked orphan and destination while inspect cannot redispatch", async () => {
  const value = fixture("managed-import-runtime-ambiguous", true);
  await assert.rejects(value.owner.execute(value.request, value.expected), /retry is forbidden/u);
  const before = [...value.calls], result = await value.owner.execute({ action: "inspect", operationId: "managed-import-runtime-ambiguous" });
  assert.equal(result["phase"], "import-ambiguous-or-partial"); assert.deepEqual(value.calls, before);
  const journal = await loadOperation("managed-import-runtime-ambiguous"); assert.equal(journal["orphanedCallPossible"], true);
  assert.equal(value.owner.hasRetainedDestination(), true); await assert.rejects(value.owner.execute(value.request, value.expected));
  assert.equal(value.calls.filter((call) => call === "import").length, 1);
});

void test("import schema accepts only fixed generated scenarios and explicit partial-effect acceptance", () => {
  const value = fixture("managed-import-runtime-schema");
  assert.equal(managedFixtureImportRequestSchema.safeParse(value.request).success, true);
  for (const change of [{ path: "C:\\UserProject" }, { archive: "supplied.epro2" }, { code: "arbitrary" }, { geometry: {} },
    { confirmNativeImport: false }, { acceptPartialImportRetention: false }, { fixtureKind: "arbitrary" }]) {
    assert.equal(managedFixtureImportRequestSchema.safeParse({ ...value.request, ...change }).success, false);
  }
});

void test("lost local SDK evidence acknowledgments settle only retained exact candidates without redispatch", async () => {
  for (const failure of ["sdk-artifact", "sdk-journal"] as const) {
    const id = `managed-import-publication-${failure}`, value = fixture(id, false, false, false, failure);
    await assert.rejects(value.owner.execute(value.request, value.expected));
    const pending = value.owner.inspect(id); assert.equal(pending["publicationPending"], true);
    assert.equal(value.owner.hasActiveReservation(), true);
    const calls = value.calls.filter((call) => call === "import").length; assert.equal(calls, 1);
    const settled = await value.owner.execute({ action: "settle-import-records", operationId: id });
    assert.equal(settled["publicationPending"], false); assert.equal(settled["importedFixtureAccepted"], false);
    const journal = await loadOperation(id); assert.equal(journal["hardStop"], true); assert.equal(journal["orphanedCallPossible"], true);
    await assert.rejects(value.owner.execute(value.request, value.expected));
    assert.equal(value.calls.filter((call) => call === "import").length, 1);
  }
});
