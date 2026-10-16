/* oxlint-disable import/max-dependencies -- Exercise the unchanged coordinator with actual managed journals, engine captures and native authority issuers in one isolated fixture. */
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, assertSubset, buildPlanHash, canonicalJson, isRecord, newOperationId, sha256Json, sha256Text } from "../src/core.ts";
import type { CurrentSymbolBaselineOwner } from "../src/current-disposable-open-runtime.ts";
import type { CurrentSymbolBaselineCoordinator, assertCurrentProjectOnlySymbolGeneration, assertCurrentSymbolWriterOwner, revalidateCurrentProjectOnlySymbolGeneration, transferCurrentProjectOnlySymbolGeneration } from "../src/current-symbol-baseline-runtime.ts";
import { currentSymbolMetadataPreparationRequestSchema } from "../src/current-symbol-metadata-preparation.ts";
import { currentSymbolClockEvidenceId, inspectCurrentSymbolClockEvidence } from "../src/current-symbol-clock-evidence.ts";
import { assertCurrentSymbolCacheClear, assertCurrentSymbolCacheMark } from "../src/current-symbol-cache-journal.ts";
import { qualifyCurrentSymbolClockRelation } from "../src/current-symbol-clock-relation.ts";
import { selectCurrentSymbolStartupExpectation } from "../src/current-symbol-startup.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { CURRENT_UPLOAD_QUEUE_PROFILE, CURRENT_UPLOAD_QUEUE_TIMEOUT_MS, buildCurrentUploadQueueReadProgram, decodeCurrentUploadQueueReadReply } from "../src/current-upload-queue-read.ts";
import { CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS, buildCurrentProjectOnlyOpenProgram, decodeCurrentProjectOnlyOpenReply } from "../src/current-project-only-open.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { AuthenticatedBridgeDispatchBinding } from "../src/engine.ts";
import { assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation, assertCurrentIssuedWindowsClockObservation, assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "../src/windows-authority.ts";
import { WindowsControlRuntime } from "../src/windows-runtime.ts";
import { assertWindowsRuntimeValidator, createWindowsRuntimeValidator } from "../src/windows-runtime-validator.ts";
import type { WindowsControlRuntimeOptions } from "../src/windows-runtime.ts";
import { qualifiedNativeFixture } from "./helpers/windows-pending-fixture.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { retireSyntheticJournal } from "./helpers/synthetic-journal-retirement.ts";

const HASH = "a".repeat(64);
const SQL_RUNTIME = { nodeExecutable: "/synthetic/no-sql-child", nodeVersion: "24.18.0" as const, nodeSha256: HASH };
const FINGERPRINT = { synthetic: true, installedBundles: { assetsRoot: "/synthetic/current-cache-assets" } };
const RAW_PATH = String.raw`C:\Fixtures\Disposable.eprj2`;
const CACHE_TARGET = { projectUuid: sha256Text(RAW_PATH), branchUuid: "d".repeat(32) };
const OPEN_TARGET = { ...CACHE_TARGET, rawWindowsPath: RAW_PATH, documentUuid: "c".repeat(16), expectedSourceSha256: HASH };
type Upstream = WindowsControlRuntimeOptions["upstream"];
type StartupCase = boolean | Readonly<{ activeSchematicPages: number; blockers: readonly string[]; ordinary?: true; startupMismatch?: true }>;

function startupHistory(mismatch = false): NativeHistorySnapshot {
  const documents = [{ uuid: mismatch ? "e".repeat(16) : "a".repeat(16), docType: "SCH_PAGE", metadata: {}, semanticSha256: HASH,
    records: [{ type: "META", id: "META", body: { schematic: "b".repeat(16) }, ticket: 1, client: null }] },
  { uuid: "b".repeat(16), docType: "SCH", metadata: {}, semanticSha256: HASH, records: [] }];
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", ...CACHE_TARGET, checkpointSha256: HASH,
    headHistoryUuid: "c".repeat(32), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents, semanticSha256: sha256Json(documents) };
}

/** Private owner/copy and installed-source qualification are synthetic seams.
 * The unchanged coordinator, managed storage, engine capture/tracked dispatch,
 * runtime normal-close and termination issuers execute their actual code.
 * Synthetic native child frames do not launch Windows or establish CAD proof.
 */
async function fixture(context: TestContext, ordinary = false): Promise<{
  coordinator: CurrentSymbolBaselineCoordinator; restart: () => CurrentSymbolBaselineCoordinator;
  owner: CurrentSymbolBaselineOwner; native: Awaited<ReturnType<typeof qualifiedNativeFixture>>;
  runtime: WindowsControlRuntime;
  engine: EasyedaControlEngine;
  assertGeneration: typeof assertCurrentProjectOnlySymbolGeneration;
  revalidateGeneration: typeof revalidateCurrentProjectOnlySymbolGeneration;
  transferGeneration: typeof transferCurrentProjectOnlySymbolGeneration;
  assertWriterOwner: typeof assertCurrentSymbolWriterOwner;
  state: { scope: boolean; activeSession: boolean; sessionSequence: number; ownerLost: boolean; copyFailure: boolean; copies: number; events: string[];
    copied: unknown; proof: unknown; cacheReads: number; cacheTimeout: boolean; statusDrift: boolean;
    finishSnapshots: number; finishSnapshotFailure: boolean; afterFinishSnapshot: (() => Promise<void>) | undefined;
    validatorRuntime: WindowsControlRuntime | undefined;
    opens: number; openReply: Awaited<ReturnType<Upstream["callTool"]>>; sourceChecks: number; sourceDrift: boolean; historicalSubset: boolean;
    activeSchematicPages: number; startupBlockers: readonly string[]; startupMismatch: boolean; startupReads: number;
    referenceAttempts: number; referenceFailure: boolean; clockObservations: number; clockFailure: boolean;
    afterReference: (() => Promise<void>) | undefined; afterAgedClock: (() => Promise<void>) | undefined;
    afterOpen: (() => Promise<void>) | undefined; afterSource: (() => Promise<void>) | undefined;
    afterCache: (() => Promise<void>) | undefined; afterStatus: (() => Promise<void>) | undefined;
    afterCompleted: (() => Promise<void>) | undefined; afterLoad: (() => Promise<void>) | undefined; afterStopped: (() => Promise<void>) | undefined;
    afterClockAssert: (() => Promise<void>) | undefined; afterClockRelation: (() => Promise<void>) | undefined;
    beforeScope: (() => void) | undefined; afterScope: (() => Promise<void>) | undefined };
  calls: (action: string) => number;
}> {
  const native = await qualifiedNativeFixture(context), operationId = newOperationId();
  const state = { scope: true, activeSession: true, sessionSequence: 1, ownerLost: false, copyFailure: false, copies: 0, events: [] as string[],
    copied: undefined as unknown, proof: undefined as unknown, cacheReads: 0, cacheTimeout: false, statusDrift: false,
    finishSnapshots: 0, finishSnapshotFailure: false, afterFinishSnapshot: undefined as (() => Promise<void>) | undefined,
    validatorRuntime: undefined as WindowsControlRuntime | undefined,
    opens: 0, openReply: { content: [] } as Awaited<ReturnType<Upstream["callTool"]>>, sourceChecks: 0, sourceDrift: false, historicalSubset: false,
    activeSchematicPages: 0, startupBlockers: ["unsupported-sql-schema"] as readonly string[], startupMismatch: false, startupReads: 0,
    referenceAttempts: 0, referenceFailure: false, clockObservations: 0, clockFailure: false,
    afterReference: undefined as (() => Promise<void>) | undefined, afterAgedClock: undefined as (() => Promise<void>) | undefined,
    afterOpen: undefined as (() => Promise<void>) | undefined, afterSource: undefined as (() => Promise<void>) | undefined,
    afterCache: undefined as (() => Promise<void>) | undefined, afterStatus: undefined as (() => Promise<void>) | undefined,
    afterCompleted: undefined as (() => Promise<void>) | undefined, afterLoad: undefined as (() => Promise<void>) | undefined,
    afterStopped: undefined as (() => Promise<void>) | undefined, afterClockAssert: undefined as (() => Promise<void>) | undefined,
    afterClockRelation: undefined as (() => Promise<void>) | undefined,
    beforeScope: undefined as (() => void) | undefined, afterScope: undefined as (() => Promise<void>) | undefined };
  const session = { gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43), sequence: 1,
    authenticationReceiptSha256: "2".repeat(64), authenticatedAtEpochMs: 1000 };
  const binding: AuthenticatedBridgeDispatchBinding = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: session.gatewayInstanceId,
    sessionId: session.sessionId, sessionSequence: 1, begunAtEpochMs: 1001, leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) };
  const upstream: Upstream & Pick<EasyedaControlEngine["upstream"], "findTool" | "withAuthenticatedBridgeDispatchScope" | "assertClosedAuthenticatedBridgeDispatchReleased"> = {
    findTool: () => Promise.resolve({ name: "easyeda_execute" }),
    callTool: async (name, args, timeout, dispatch) => {
      assert.equal(name, "easyeda_execute"); assert.equal(state.scope, true);
      assert.ok(args !== undefined);
      if (args["code"] === buildCurrentProjectOnlyOpenProgram(OPEN_TARGET)) {
        state.opens += 1; state.events.push("project-only-open");
        assert.equal(args["timeoutMs"], CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS);
        assert.equal(timeout, CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS + 10_000); assert.equal(args["confirmWrite"], true);
        assert.equal(dispatch?.sessionSequence, 2);
        const journal = await loadOperation(operationId);
        assert.equal(journal["orphanedCallPossible"], true); assert.equal(journal["projectOpenAttempted"], true);
        await state.afterOpen?.(); return state.openReply;
      }
      if (args["code"] === buildCurrentUploadQueueReadProgram(CACHE_TARGET)) {
        state.cacheReads += 1; state.events.push("cache-read");
        assert.equal(args["timeoutMs"], CURRENT_UPLOAD_QUEUE_TIMEOUT_MS + 5000);
        assert.equal(timeout, CURRENT_UPLOAD_QUEUE_TIMEOUT_MS + 15_000); assert.equal(args["confirmWrite"], true);
        assert.equal(dispatch?.sessionSequence, 2);
        const journal = await loadOperation(operationId);
        assert.equal(journal["orphanedCallPossible"], true); assert.equal(journal["cacheAttempted"], true);
        await state.afterCache?.();
        if (state.cacheTimeout) { return { content: [], structuredContent: { ok: false, error: { message: "CURRENT_UPLOAD_QUEUE_READ_REFUSED:TIMEOUT" } } }; }
        return { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope({ profile: CURRENT_UPLOAD_QUEUE_PROFILE,
          ...CACHE_TARGET, origin: "https://client", projectV6UploadAbsent: true, localProjectV1UploadAbsent: true,
          scope: "point-in-time-inactive-target", startupQualified: false, persistenceVerified: false, writerAuthority: false, executionAuthorized: false }) } };
      }
      state.events.push("runtime-identity");
      return { content: [{ type: "text", text: JSON.stringify({ kind: "runtime-identity",
        generation: "synthetic-current-symbol-runtime-0001", timeOrigin: 1000, processId: 101 }) }] };
    },
    withAuthenticatedBridgeDispatchScope: async <Result>(run: (value: AuthenticatedBridgeDispatchBinding) => PromiseLike<Result> | Result): Promise<Result> => {
      assert.equal(state.scope, false); state.beforeScope?.(); state.scope = true;
      let result: Result;
      try { result = await run({ ...binding, sessionId: state.sessionSequence === 1 ? session.sessionId : "n".repeat(43), sessionSequence: state.sessionSequence }); }
      finally { state.scope = false; }
      await state.afterScope?.(); return result;
    },
    currentAuthenticatedBridgeDispatchBinding: () => state.scope ? { ...binding,
      sessionId: state.sessionSequence === 1 ? session.sessionId : "n".repeat(43), sessionSequence: state.sessionSequence } : undefined,
    assertClosedAuthenticatedBridgeDispatchReleased: (dispatch, prior) => {
      assert.equal(state.scope, false); assert.equal(state.activeSession, false); assert.equal(state.sessionSequence, 2);
      assert.equal(dispatch.sessionSequence, 2); assert.equal(dispatch.sessionId, "n".repeat(43));
      assert.equal(prior.sessionId, dispatch.sessionId); assert.equal(prior.sequence, dispatch.sessionSequence);
      return { sessionId: prior.sessionId, sequence: prior.sequence, authenticationReceiptSha256: prior.authenticationReceiptSha256,
        authenticatedAtEpochMs: prior.authenticatedAtEpochMs, closedAtEpochMs: 2000, closeReason: "synthetic normal close" };
    },
    bridgeSessionLifecycle: () => ({ schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: session.gatewayInstanceId,
      activeSession: state.activeSession ? { sessionId: state.sessionSequence === 1 ? session.sessionId : "n".repeat(43), sequence: state.sessionSequence,
        authenticationReceiptSha256: session.authenticationReceiptSha256, authenticatedAtEpochMs: session.authenticatedAtEpochMs } : null,
      publicEndpoint: { host: "127.0.0.1", port: 49_100 },
      recentClosedSessions: !state.activeSession || state.sessionSequence > 1 ? [{ sessionId: session.sessionId, sequence: session.sequence,
        authenticationReceiptSha256: session.authenticationReceiptSha256, authenticatedAtEpochMs: session.authenticatedAtEpochMs,
        closedAtEpochMs: 2000, closeReason: "synthetic normal close" },
      ...(!state.activeSession && state.sessionSequence === 2 ? [{ sessionId: "n".repeat(43), sequence: 2,
        authenticationReceiptSha256: session.authenticationReceiptSha256, authenticatedAtEpochMs: session.authenticatedAtEpochMs,
        closedAtEpochMs: 2000, closeReason: "synthetic normal close" }] : [])] : [] }),
  };
  const runtime = new WindowsControlRuntime({ upstream, pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets",
    wslDistribution: "SyntheticReview", reviewedExecutionScopeSha256: native.options.reviewedExecutionScopeSha256 }, {
    hashExecutable: (): Promise<string> => Promise.resolve(native.options.expectedExecutableSha256),
    startSupervisor: (): Promise<typeof native.supervisor> => Promise.resolve(native.supervisor),
  });
  const launch = await runtime.launch();
  native.behavior.mutateResponse = (request, response): void => {
    // A release addresses its retained old capture, not the new current Job.
    if (request["action"] === "release-capture") { response["jobId"] = request["jobId"]; }
    // Unlike the generic child's fixed timestamps, actual capturedAt/checkedAt
    // Values fall inside the corresponding native clock observation.
    const base = response["base"], clock = response["clock"];
    if (isRecord(base) && isRecord(clock) && isRecord(clock["before"])) {
      const ticks = clock["before"]["utcBeforeTicks"]; assert.ok(typeof ticks === "string");
      const epochMs = Number((BigInt(ticks) - 621_355_968_000_000_000n) / 10_000n);
      const timestamp = new Date(epochMs).toISOString();
      if (Object.hasOwn(base, "capturedAt")) { base["capturedAt"] = timestamp; }
      if (Object.hasOwn(base, "checkedAt")) { base["checkedAt"] = timestamp; }
    }
  };
  context.mock.method(runtime, "observeApplicationWindow", () => {
    assert.equal(state.scope, false); state.events.push("window");
    const current = runtime.status().launch; assert.ok(current !== null);
    return Promise.resolve({ jobId: current.jobId, helperInstance: current.helperInstance, outcome: "available" as const, hwnd: "12345" });
  });
  native.state.onFrame = (action): void => {
    state.events.push(`native:${action}`);
    if (action === "normal-close" || action === "clocked-prove-terminated") { assert.equal(state.scope, false); }
    if (action === "normal-close" && state.sessionSequence === 2) { state.activeSession = false; }
  };
  state.validatorRuntime = runtime;
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: createWindowsRuntimeValidator(() => {
    assert.ok(state.validatorRuntime !== undefined); return state.validatorRuntime;
  }) });
  await engine.controlFingerprintPromise;
  context.mock.method(engine, "status", async () => {
    // Production status calls three bridge tools. An active session without
    // Its authenticated lease refuses those probes, not just design dispatch.
    assert.equal(state.scope, true, "live status requires its authenticated dispatch scope");
    assert.equal(state.activeSession, true);
    const dispatch = upstream.currentAuthenticatedBridgeDispatchBinding?.();
    assert.equal(dispatch?.sessionId, "n".repeat(43)); assert.equal(dispatch?.sessionSequence, 2);
    state.events.push("status"); await state.afterStatus?.();
    return { stableFingerprint: { ...structuredClone(FINGERPRINT), ...(state.statusDrift ? { drifted: true } : {}) } };
  });
  const ownerData = { profile: "synthetic.current-symbol-baseline-owner", operationId, openingOperationId: "synthetic-original-opening" };
  const original = { source: { engine, runtime, launchProjection: launch, bridgeSession: session,
    ...(ordinary ? { purpose: "ordinary-symbol-metadata", startupExpectation: selectCurrentSymbolStartupExpectation(startupHistory()) } : {}),
    target: { ...OPEN_TARGET, expectedSourceSha256: "f".repeat(64) },
    expectedFingerprint: structuredClone(FINGERPRINT) }, preparation: { preparationSha256: HASH } };
  const ownerText = canonicalJson(ownerData);
  const checkOwner = (owner: unknown, receivedEngine: unknown): typeof original => {
    assert.equal(receivedEngine, engine); assert.equal(owner, ownerData, "synthetic owner must be original");
    assert.equal(canonicalJson(owner), ownerText, "synthetic owner changed"); assert.equal(state.ownerLost, false, "synthetic owner lost");
    assert.equal(runtime.status().state, "owned"); assert.deepEqual(runtime.status().launch, launch); return original;
  };
  const source = stripTypeScriptTypes(await readFile(new URL("../src/current-symbol-baseline-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  let originalReference: unknown;
  const scope = vm.createContext({ z, Buffer, Object, Date, Reflect, structuredClone,
    OPERATION_SCHEMA, buildPlanHash, canonicalJson, isRecord, sha256Json, currentSymbolMetadataPreparationRequestSchema, assertWindowsRuntimeValidator,
    assertSubset, CURRENT_UPLOAD_QUEUE_TIMEOUT_MS, CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS,
    currentSymbolClockEvidenceId, inspectCurrentSymbolClockEvidence, currentAgedSqlCollectionEvidence: (): undefined => undefined,
    selectCurrentSymbolStartupExpectation,
    readNativeHistoryCheckpoint: (input: unknown): Promise<NativeHistorySnapshot> => {
      assert.equal(ordinary, true); assert.equal(state.scope, false);
      assert.deepEqual(structuredClone(input), { checkpointPath: "/synthetic/current-symbol-baseline.eprj2", expectedSha256: HASH,
        projectUuid: CACHE_TARGET.projectUuid, libraryAtomHeaders: "preserve" });
      state.startupReads += 1; state.events.push("startup-checkpoint"); return Promise.resolve(startupHistory(state.startupMismatch));
    },
    CurrentAgedSqlReferenceStage: class {
      private readonly receivedEngine: unknown;
      public constructor(receivedEngine: unknown) { this.receivedEngine = receivedEngine; }
      public originalReturn(): undefined { assert.equal(this.receivedEngine, engine); return undefined; }
      public async runOnce(input: { baseline: unknown; proof: unknown }): Promise<unknown> {
        assert.equal(this.receivedEngine, engine);
        assert.equal(input.baseline, state.copied); assert.equal(input.proof, state.proof); assert.equal(state.scope, false);
        state.referenceAttempts += 1; await state.afterReference?.();
        assert.equal(state.referenceFailure, false, "synthetic reference refused");
        originalReference = Object.freeze({ profile: "synthetic-original-clock-reference", operationId }); return originalReference;
      }
    },
    assertOriginalCurrentAgedSqlReference: (reference: unknown, receivedEngine: unknown, baseline: unknown): unknown => {
      assert.equal(reference, originalReference); assert.equal(receivedEngine, engine); assert.equal(baseline, state.copied); return reference;
    },
    revalidateOriginalCurrentAgedSqlReference: (reference: unknown, receivedEngine: unknown, baseline: unknown): Promise<unknown> => {
      assert.equal(reference, originalReference); assert.equal(receivedEngine, engine); assert.equal(baseline, state.copied); return Promise.resolve(reference);
    },
    collectCurrentAgedSqlClock: async (receivedEngine: unknown, generation: unknown, reference: unknown): Promise<unknown> => {
      assert.equal(receivedEngine, engine); assert.equal(reference, originalReference); assert.equal(state.scope, true); assert.ok(isRecord(generation));
      assert.equal(generation["operationId"], operationId); state.clockObservations += 1; await state.afterAgedClock?.();
      assert.equal(state.clockFailure, false, "synthetic clock observation refused");
      return Object.freeze({ profile: "synthetic-original-aged-clock", operationId, executionAuthorized: false });
    },
    // Only cross-realm JSON arguments are normalized at these VM boundaries;
    // Actual engine journals, original captures and native issuers stay unchanged.
    assertCurrentSymbolCacheMark: (...args: Parameters<typeof assertCurrentSymbolCacheMark>): void => {
      assertCurrentSymbolCacheMark(structuredClone(args[0]), structuredClone(args[1]), args[2]);
    },
    assertCurrentSymbolCacheClear: (...args: Parameters<typeof assertCurrentSymbolCacheClear>): void => {
      assertCurrentSymbolCacheClear(structuredClone(args[0]), structuredClone(args[1]), args[2]);
    },
    buildCurrentUploadQueueReadProgram: (target: unknown): string => buildCurrentUploadQueueReadProgram(structuredClone(target)),
    decodeCurrentUploadQueueReadReply: (raw: unknown, target: unknown): ReturnType<typeof decodeCurrentUploadQueueReadReply> =>
      decodeCurrentUploadQueueReadReply(raw, structuredClone(target)),
    buildCurrentProjectOnlyOpenProgram: (target: unknown): string => buildCurrentProjectOnlyOpenProgram(structuredClone(target)),
    decodeCurrentProjectOnlyOpenReply: (raw: unknown, target: unknown): ReturnType<typeof decodeCurrentProjectOnlyOpenReply> =>
      decodeCurrentProjectOnlyOpenReply(raw, structuredClone(target)),
    // Normalize only the cross-realm container, preserving every original token.
    qualifyCurrentSymbolClockRelation: async (input: Parameters<typeof qualifyCurrentSymbolClockRelation>[0]): ReturnType<typeof qualifyCurrentSymbolClockRelation> => {
      state.events.push("clock-relation");
      try { return await qualifyCurrentSymbolClockRelation({ ...input }); }
      finally { await state.afterClockRelation?.(); }
    },
    verifyCurrentSymbolPreopenSource: async (receivedEngine: unknown, copy: unknown): Promise<unknown> => {
      assert.equal(receivedEngine, engine); assert.equal(copy, state.copied); state.sourceChecks += 1;
      state.events.push("source-continuity"); await state.afterSource?.();
      assert.equal(state.sourceDrift, false, "synthetic source changed");
      return { profile: "synthetic.preopen-source", sourceSha256: HASH, pointInTimeOnly: true };
    },
    assertExpectedFingerprint: (value: unknown): void => { assert.ok(isRecord(value)); assert.equal(value["synthetic"], true); },
    validateSdkLocalRuntimeFingerprint: (value: unknown): void => { assertSubset(value, FINGERPRINT, "Synthetic current cache runtime"); },
    verifyCurrentDisposableOpenImplementation: (root: unknown): Promise<void> => {
      assert.equal(root, FINGERPRINT.installedBundles.assetsRoot); state.events.push("source-pin"); return Promise.resolve();
    },
    verifyCurrentProjectOnlyOpenImplementation: (root: unknown): Promise<void> => {
      assert.equal(root, FINGERPRINT.installedBundles.assetsRoot); state.events.push("project-only-source-pin"); return Promise.resolve();
    },
    createOperation, operationPath, writePhaseArtifact,
    loadOperation: async (id: string): ReturnType<typeof loadOperation> => {
      const loaded = await loadOperation(id); await state.afterLoad?.(); return loaded;
    },
    updateOperation: async (journal: Parameters<typeof updateOperation>[0]): Promise<string> => {
      const result = await updateOperation(journal); state.events.push(`journal:${String(journal["state"])}`);
      if (journal["state"] === "completed") { await state.afterCompleted?.(); }
      if (journal["state"] === "stopped") { await state.afterStopped?.(); }
      return result;
    },
    assertCurrentSymbolBaselineOwner: checkOwner,
    revalidateCurrentSymbolBaselineOwner: (owner: unknown, receivedEngine: unknown) => Promise.resolve(checkOwner(owner, receivedEngine)),
    assertClosedSessionCopyAuthority, assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation, assertCurrentIssuedWindowsClockObservation, windowsClockObservationForResult,
    assertIssuedWindowsClockObservation: async (value: unknown): ReturnType<typeof assertIssuedWindowsClockObservation> => {
      const originalClock = await assertIssuedWindowsClockObservation(value); await state.afterClockAssert?.(); return originalClock;
    },
    assertOriginalCurrentSymbolBaselineCopy: (copy: unknown, receivedEngine: unknown): void => {
      assert.equal(receivedEngine, engine); assert.equal(copy, state.copied);
    },
    revalidateCurrentSymbolBaselineCopy: async (receivedEngine: unknown, copy: unknown, proof: unknown): Promise<void> => {
      assert.equal(receivedEngine, engine); assert.equal(copy, state.copied); assert.equal(proof, state.proof);
      assert.equal(await assertClosedSessionCopyAuthority(proof), proof); state.events.push("copy-revalidated");
    },
    captureCurrentSymbolBaselineCopy: async (receivedEngine: unknown, input: unknown, onEvidence: (event: unknown) => void): Promise<unknown> => {
      assert.equal(receivedEngine, engine); assert.ok(isRecord(input)); assert.equal(input["owner"], ownerData); assert.equal(state.scope, false);
      assert.deepEqual(input["runtime"], SQL_RUNTIME); assert.ok(isRecord(input["capture"]));
      assert.equal(input["capture"]["operationId"], operationId);
      assert.equal(await assertClosedSessionCopyAuthority(input["proof"]), input["proof"]);
      const journal = await loadOperation(operationId), last = journal.artifacts?.at(-1);
      assert.ok(last !== undefined); assert.match(basename(last.path), /-copy-intent\.json$/u);
      state.copies += 1; state.events.push("copy");
      if (state.copyFailure) { throw new Error("synthetic copy failure"); }
      const checkpoint = { checkpointSha256: HASH, sourceSha256: HASH,
        ...(ordinary ? { checkpoint: "/synthetic/current-symbol-baseline.eprj2" } : {}) };
      const copy = { sha256: HASH, receiptSha256: HASH }, inventory = { checkpointSha256: HASH, schemaSha256: HASH, logicalSha256: HASH };
      onEvidence({ kind: "checkpoint", value: checkpoint }); onEvidence({ kind: "copy", value: copy }); onEvidence({ kind: "inventory", value: inventory });
      state.proof = input["proof"];
      const result = { checkpoint, copy, inventory, preparation: { syntheticCopySink: true }, targetEvidence: { syntheticCopySink: true },
        startupPremises: { syntheticCopySink: true, historicalSubsetSatisfied: state.historicalSubset, startupQualified: false,
          ...(ordinary ? { sqlSchemaSupported: true, databaseVersion: "25.10.31.1", targetPcbSuppliesNonzeroNativeCount: true,
            historySemanticSha256: startupHistory(state.startupMismatch).semanticSha256 } : {}),
          activeSchematicPages: state.activeSchematicPages, blockers: [...state.startupBlockers] } };
      state.copied = result; return result;
    },
    captureCurrentSymbolFinishSnapshot: async (receivedEngine: unknown, input: unknown, onEvidence: (event: unknown) => void): Promise<unknown> => {
      assert.equal(receivedEngine, engine); assert.ok(isRecord(input)); assert.equal(input["baseline"], state.copied);
      assert.equal(state.scope, false); assert.equal(state.activeSession, false); assert.deepEqual(input["runtime"], SQL_RUNTIME);
      assert.equal(await assertClosedSessionCopyAuthority(input["proof"]), input["proof"]);
      const journal = await loadOperation(operationId);
      assert.equal(journal["finishSnapshotAttempted"], true); assert.match(basename(journal.artifacts?.at(-1)?.path ?? ""), /-finish-snapshot-intent\.json$/u);
      state.finishSnapshots += 1; state.events.push("finish-snapshot");
      const checkpoint = { sourceSha256: HASH, checkpointSha256: HASH }, copy = { sha256: HASH, receiptSha256: HASH };
      onEvidence({ kind: "checkpoint", value: checkpoint }); onEvidence({ kind: "copy", value: copy });
      await state.afterFinishSnapshot?.();
      if (state.finishSnapshotFailure) { throw new Error("synthetic final snapshot failed"); }
      return { profile: "private.current-symbol-finish-snapshot.v1", checkpoint, copy, snapshotCaptured: true,
        openingEffectsVerified: false, persistenceVerified: false, writerReady: false, executionAuthorized: false };
    },
  });
  const loaded: unknown = vm.runInContext(`${source}\n({ Coordinator: CurrentSymbolBaselineCoordinator, assertGeneration: assertCurrentProjectOnlySymbolGeneration, revalidateGeneration: revalidateCurrentProjectOnlySymbolGeneration, transferGeneration: transferCurrentProjectOnlySymbolGeneration, assertWriterOwner: assertCurrentSymbolWriterOwner });`, scope);
  assert.ok(isRecord(loaded) && typeof loaded["Coordinator"] === "function" && typeof loaded["assertGeneration"] === "function" && typeof loaded["revalidateGeneration"] === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Checked export is the unchanged maintained coordinator evaluated in this private test scope.
  const Coordinator = loaded["Coordinator"] as typeof CurrentSymbolBaselineCoordinator;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- These checked exports are the unchanged fixed issuers evaluated beside their private coordinator in this test VM.
  const generation = loaded as { assertGeneration: typeof assertCurrentProjectOnlySymbolGeneration; revalidateGeneration: typeof revalidateCurrentProjectOnlySymbolGeneration;
    transferGeneration: typeof transferCurrentProjectOnlySymbolGeneration; assertWriterOwner: typeof assertCurrentSymbolWriterOwner };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only this VM's fixed owner lookup admits this synthetic original; no production issuer is modified.
  const owner = ownerData as unknown as CurrentSymbolBaselineOwner;
  const restart = (): CurrentSymbolBaselineCoordinator => new Coordinator(engine, runtime, SQL_RUNTIME);
  context.after(async (): Promise<void> => {
    try { await loadOperation(operationId); }
    catch (error) { if (isRecord(error) && error["code"] === "ENOENT") { return; } throw error; }
    await retireSyntheticJournal(operationId);
  });
  return { coordinator: restart(), restart, owner, native, runtime, engine, state,
    assertGeneration: generation.assertGeneration, revalidateGeneration: generation.revalidateGeneration,
    transferGeneration: generation.transferGeneration, assertWriterOwner: generation.assertWriterOwner,
    calls: (action): number => native.requests.filter((request) => request["action"] === action).length };
}

void test("current baseline owns one capture and close, polls pending, then copies only after original termination", async (context) => {
  const f = await fixture(context); await f.coordinator.capture(f.owner);
  const captured = await f.coordinator.inspect(f.owner.operationId); assert.equal(captured["state"], "captured");
  f.state.scope = false;
  const closed = await f.coordinator.close(f.owner); assert.equal(closed["state"], "awaiting-termination");
  assert.equal(f.calls("normal-close"), 1); assert.equal(f.state.copies, 0);
  assert.ok(f.state.events.indexOf("journal:close-dispatching") < f.state.events.indexOf("native:normal-close"));
  const dispatchJournal = await loadOperation(f.owner.operationId); assert.equal(dispatchJournal["closeAttempted"], true);
  await assert.rejects(f.coordinator.close(f.owner), /original completed capture/u);
  f.native.state.code = "authority-prior-job-not-empty"; f.native.state.remaining = 1;
  const pending = await f.coordinator.observe(f.owner.operationId);
  assert.equal(pending["termination"], "pending"); assert.equal(pending["state"], "awaiting-termination"); assert.equal(f.state.copies, 0);
  const done = await f.coordinator.observe(f.owner.operationId);
  assert.equal(done["state"], "completed"); assert.equal(done["baselineCaptured"], true);
  assert.deepEqual(done["startupPremises"], { syntheticCopySink: true, historicalSubsetSatisfied: false, startupQualified: false,
    activeSchematicPages: 0, blockers: ["unsupported-sql-schema"] });
  const copied = await loadOperation(f.owner.operationId), copiedArtifact = copied.artifacts?.at(-1);
  assert.ok(copiedArtifact !== undefined);
  const copiedEvidence: unknown = JSON.parse(await readFile(copiedArtifact.path, "utf8"));
  assert.ok(isRecord(copiedEvidence));
  assert.deepEqual(copiedEvidence["startupPremises"], done["startupPremises"]);
  for (const key of ["beforeWriteBaselineVerified", "openingEffectsVerified", "writerReady", "executionAuthorized", "explicitSaveDispatched", "replayAllowed"]) {
    assert.equal(done[key], false);
  }
  assert.equal(f.calls("normal-close"), 1); assert.equal(f.calls("clocked-prove-terminated"), 2); assert.equal(f.state.copies, 1);
  await assert.rejects(f.coordinator.observe(f.owner.operationId), /original acknowledged close/u);
  const restarted = f.restart();
  const inspected = await restarted.inspect(f.owner.operationId); assert.equal(inspected["originalOwnerRetained"], false);
  await assert.rejects(restarted.observe(f.owner.operationId), /original acknowledged close/u);
  assert.equal(f.calls("normal-close"), 1); assert.equal(f.state.copies, 1);
});

void test("current baseline uncertain close stays consumed without copy or restart adoption", async (context) => {
  const f = await fixture(context); await f.coordinator.capture(f.owner); f.state.scope = false;
  f.native.behavior.errorAction = "normal-close";
  await assert.rejects(f.coordinator.close(f.owner));
  const stopped = await f.coordinator.inspect(f.owner.operationId); assert.equal(stopped["state"], "stopped");
  await assert.rejects(f.coordinator.close(f.owner), /original completed capture/u);
  await assert.rejects(f.coordinator.observe(f.owner.operationId), /original acknowledged close/u);
  await assert.rejects(f.restart().close(f.owner), /original completed capture/u);
  assert.equal(f.calls("normal-close"), 1); assert.equal(f.calls("clocked-prove-terminated"), 0); assert.equal(f.state.copies, 0);
});

void test("current baseline refuses copied owners and a failed copy cannot be repeated", async (context) => {
  const f = await fixture(context);
  await assert.rejects(f.coordinator.capture(structuredClone(f.owner)), /owner must be original/u);
  await f.coordinator.capture(f.owner); f.state.scope = false;
  await assert.rejects(f.coordinator.close(structuredClone(f.owner)), /original completed capture/u);
  await f.coordinator.close(f.owner); f.state.copyFailure = true;
  f.state.afterStopped = (): Promise<void> => Promise.reject(new Error("synthetic stopped publication failure"));
  await assert.rejects(f.coordinator.observe(f.owner.operationId), (error: unknown): boolean => {
    assert.ok(isRecord(error)); assert.equal(error["name"], "AggregateError");
    const cause = error["cause"], errors = error["errors"]; assert.ok(cause instanceof Error); assert.equal(cause.message, "synthetic stopped publication failure");
    assert.ok(Array.isArray(errors)); assert.equal(errors.length, 2); assert.equal(errors[1], cause);
    assert.match(String(errors[0]), /synthetic copy failure/u); return true;
  });
  const stopped = await f.coordinator.inspect(f.owner.operationId); assert.equal(stopped["state"], "stopped");
  await assert.rejects(f.coordinator.observe(f.owner.operationId), /original acknowledged close/u);
  assert.equal(f.calls("normal-close"), 1); assert.equal(f.state.copies, 1);
});

void test("current baseline owner loss after capture refuses before native close", async (context) => {
  const f = await fixture(context); await f.coordinator.capture(f.owner); f.state.scope = false; f.state.ownerLost = true;
  await assert.rejects(f.coordinator.close(f.owner), /synthetic owner lost/u);
  const stopped = await f.coordinator.inspect(f.owner.operationId); assert.equal(stopped["state"], "stopped");
  assert.equal(f.calls("normal-close"), 0); assert.equal(f.calls("clocked-prove-terminated"), 0); assert.equal(f.state.copies, 0);
});

void test("current baseline preserves external journal changes during pending or terminated probes", async (context) => {
  for (const pending of [true, false]) {
    await context.test(pending ? "pending probe" : "terminated probe", async (childContext) => {
      const f = await fixture(childContext); await f.coordinator.capture(f.owner); f.state.scope = false; await f.coordinator.close(f.owner);
      if (pending) { f.native.state.code = "authority-prior-job-not-empty"; }
      const probe = f.runtime.probeClosedSessionTermination.bind(f.runtime);
      let external: Buffer | undefined;
      childContext.mock.method(f.runtime, "probeClosedSessionTermination", async (...args: Parameters<typeof probe>): ReturnType<typeof probe> => {
        const observation = await probe(...args);
        const journal = await loadOperation(f.owner.operationId);
        journal["nextSafeAction"] = "Synthetic external advance; must not be overwritten.";
        await updateOperation(journal); external = await readFile(operationPath(f.owner.operationId)); return observation;
      });
      await assert.rejects(f.coordinator.observe(f.owner.operationId), /baseline journal changed/u);
      assert.ok(external !== undefined); assert.deepEqual(await readFile(operationPath(f.owner.operationId)), external);
      await assert.rejects(f.coordinator.observe(f.owner.operationId), /original acknowledged close/u);
      assert.deepEqual(await readFile(operationPath(f.owner.operationId)), external);
      assert.equal(f.calls("normal-close"), 1); assert.equal(f.calls("clocked-prove-terminated"), 1); assert.equal(f.state.copies, 0);
    });
  }
});

void test("current baseline rechecks the retained proof epoch at final pending and completion boundaries", async (context) => {
  for (const pending of [true, false]) {
    await context.test(pending ? "pending final journal read" : "completed publication", async (childContext) => {
      const f = await fixture(childContext); await f.coordinator.capture(f.owner); f.state.scope = false; await f.coordinator.close(f.owner);
      let changed = false, reads = 0;
      const invalidate = async (): Promise<void> => {
        await f.native.supervisor.capture({ ...INPUT, bindingSha256: "8".repeat(64), challengeAttempt: 2 }); changed = true;
      };
      if (pending) {
        f.native.state.code = "authority-prior-job-not-empty";
        f.state.afterLoad = async (): Promise<void> => { reads += 1; if (reads === 2) { await invalidate(); } };
      } else { f.state.afterCompleted = invalidate; }
      await assert.rejects(f.coordinator.observe(f.owner.operationId), pending ? /pending probe owner, input or acknowledged close changed/u : /(?:epoch|authority|capture|retained)/u);
      assert.equal(changed, true);
      const stopped = await f.coordinator.inspect(f.owner.operationId); assert.equal(stopped["state"], "stopped");
      await assert.rejects(f.coordinator.observe(f.owner.operationId), /original acknowledged close/u);
      assert.equal(f.calls("normal-close"), 1); assert.equal(f.calls("clocked-prove-terminated"), 1); assert.equal(f.state.copies, pending ? 0 : 1);
    });
  }
});

async function completedBaseline(context: TestContext, historicalSubset: StartupCase = false): Promise<Awaited<ReturnType<typeof fixture>>> {
  const f = await fixture(context, typeof historicalSubset !== "boolean" && historicalSubset.ordinary === true);
  f.state.historicalSubset = historicalSubset === true;
  f.state.startupMismatch = typeof historicalSubset !== "boolean" && historicalSubset.startupMismatch === true;
  f.state.activeSchematicPages = typeof historicalSubset === "boolean" ? 0 : historicalSubset.activeSchematicPages;
  if (typeof historicalSubset === "boolean") { f.state.startupBlockers = historicalSubset ? [] : ["unsupported-sql-schema"]; }
  else { f.state.startupBlockers = historicalSubset.blockers; }
  await f.coordinator.capture(f.owner); f.state.scope = false;
  await f.coordinator.close(f.owner); await f.coordinator.observe(f.owner.operationId);
  f.state.activeSession = false; return f;
}

void test("current baseline relaunch retains the actual new launch and its clock after releasing the old capture", async (context) => {
  const f = await completedBaseline(context);
  assert.notEqual(f.engine.executionAuthorityValidator, f.runtime); assert.equal(Object.isFrozen(f.engine.executionAuthorityValidator), true);
  const oldClock = await windowsClockObservationForResult(f.state.proof, "termination");
  const launch = f.runtime.launch.bind(f.runtime);
  let originalLaunch: Awaited<ReturnType<typeof launch>> | undefined;
  context.mock.method(f.runtime, "launch", async (): ReturnType<typeof launch> => {
    originalLaunch = await launch(); f.state.activeSession = true; f.state.sessionSequence = 2; return originalLaunch;
  });
  const result = await f.coordinator.relaunch(f.owner.operationId);
  assert.equal(result["state"], "relaunched"); assert.equal(result["launchAcknowledged"], true);
  assert.equal(result["captureReleased"], true); assert.equal(result["nativeLaunchClockStatus"], "observed");
  for (const key of ["beforeWriteBaselineVerified", "openingEffectsVerified", "writerReady", "executionAuthorized", "explicitSaveDispatched", "replayAllowed"]) {
    assert.equal(result[key], false);
  }
  assert.equal(f.calls("clocked-launch"), 2); assert.equal(f.calls("release-capture"), 1);
  assert.ok(f.state.events.indexOf("journal:relaunch-dispatching") < f.state.events.indexOf("native:clocked-launch"));
  assert.ok(f.state.events.indexOf("native:clocked-launch") < f.state.events.indexOf("native:release-capture"));
  assert.ok(originalLaunch !== undefined);
  const newClock = await f.runtime.clockObservationForLaunch(originalLaunch);
  assert.equal(await assertIssuedWindowsClockObservation(newClock), newClock);
  await assert.rejects(f.runtime.clockObservationForLaunch(structuredClone(originalLaunch)), /unchanged original current launch/u);
  await assert.rejects(assertClosedSessionCopyAuthority(f.state.proof));
  await assert.rejects(assertIssuedWindowsClockObservation(oldClock), /launched generation changed/u);
  await assert.rejects(f.coordinator.relaunch(f.owner.operationId));
  await assert.rejects(f.restart().relaunch(f.owner.operationId));
  assert.equal(f.calls("clocked-launch"), 2); assert.equal(f.calls("release-capture"), 1);
});

void test("current baseline relaunch rejects a copied forwarder or changed selected runtime before launch", async (context) => {
  for (const fault of ["copied-forwarder", "runtime-owner"] as const) {
    await context.test(fault, async (childContext) => {
      const f = await completedBaseline(childContext);
      if (fault === "copied-forwarder") { Reflect.set(f.engine, "executionAuthorityValidator", { ...f.engine.executionAuthorityValidator }); }
      else {
        f.state.validatorRuntime = new WindowsControlRuntime({ upstream: {
          callTool: (): Promise<never> => Promise.reject(new Error("Replacement runtime must not dispatch")),
          currentAuthenticatedBridgeDispatchBinding: (): never => { throw new Error("Replacement runtime must not read binding"); },
          bridgeSessionLifecycle: (): never => { throw new Error("Replacement runtime must not read lifecycle"); }
        }, pluginRoot: "/opt/synthetic-control",
          assetsRoot: "/mnt/c/Synthetic/resources/app/assets", wslDistribution: "SyntheticReview", reviewedExecutionScopeSha256: HASH });
      }
      await assert.rejects(f.coordinator.relaunch(f.owner.operationId), /validator/u);
      const stopped = await f.coordinator.inspect(f.owner.operationId); assert.equal(stopped["state"], "stopped");
      assert.equal(stopped["relaunchAttempted"], true); assert.equal(stopped["launchAcknowledged"], false);
      await assert.rejects(f.coordinator.relaunch(f.owner.operationId));
      assert.equal(f.calls("clocked-launch"), 1); assert.equal(f.calls("release-capture"), 0);
    });
  }
});

void test("current baseline relaunch records an unavailable native launch clock without manufacturing clock authority", async (context) => {
  const f = await completedBaseline(context); f.native.behavior.clockMode = "unavailable";
  const result = await f.coordinator.relaunch(f.owner.operationId);
  assert.equal(result["state"], "relaunched"); assert.equal(result["nativeLaunchClockStatus"], "unavailable");
  assert.equal(result["captureReleased"], true); assert.equal(result["writerReady"], false); assert.equal(result["executionAuthorized"], false);
  assert.equal(f.calls("clocked-launch"), 2); assert.equal(f.calls("release-capture"), 1);
});

void test("current baseline consumes ambiguous relaunch and old-capture release attempts", async (context) => {
  for (const failedAction of ["clocked-launch", "release-capture"]) {
    await context.test(failedAction, async (childContext) => {
      const f = await completedBaseline(childContext); f.native.behavior.errorAction = failedAction;
      await assert.rejects(f.coordinator.relaunch(f.owner.operationId));
      const stopped = await f.coordinator.inspect(f.owner.operationId); assert.equal(stopped["state"], "stopped");
      assert.equal(stopped["launchAcknowledged"], failedAction === "release-capture"); assert.equal(stopped["captureReleased"], false);
      assert.equal(stopped["releaseAttempted"], failedAction === "release-capture");
      await assert.rejects(f.coordinator.relaunch(f.owner.operationId));
      await assert.rejects(f.restart().relaunch(f.owner.operationId));
      assert.equal(f.calls("clocked-launch"), 2); assert.equal(f.calls("release-capture"), failedAction === "release-capture" ? 1 : 0);
      assert.equal(f.calls("normal-close"), 1); assert.equal(f.state.copies, 1);
    });
  }
});

void test("current baseline preserves a journal advanced during launch or final clock validation", async (context) => {
  for (const phase of ["launch", "final-clock"]) {
    await context.test(phase, async (childContext) => {
      const f = await completedBaseline(childContext), launch = f.runtime.launch.bind(f.runtime);
      let external: Buffer | undefined;
      const advance = async (): Promise<void> => {
        const journal = await loadOperation(f.owner.operationId);
        journal["nextSafeAction"] = "Synthetic external relaunch advance; preserve this journal.";
        await updateOperation(journal); external = await readFile(operationPath(f.owner.operationId));
      };
      if (phase === "launch") {
        childContext.mock.method(f.runtime, "launch", async (): ReturnType<typeof launch> => {
          const original = await launch(); await advance(); return original;
        });
      } else {
        let observations = 0;
        f.state.afterClockAssert = async (): Promise<void> => { observations += 1; if (observations === 2) { await advance(); } };
      }
      await assert.rejects(f.coordinator.relaunch(f.owner.operationId), /journal changed/u);
      assert.ok(external !== undefined); assert.deepEqual(await readFile(operationPath(f.owner.operationId)), external);
      const retained = await f.coordinator.inspect(f.owner.operationId); assert.equal(retained["launchAcknowledged"], true);
      await assert.rejects(f.coordinator.relaunch(f.owner.operationId));
      assert.deepEqual(await readFile(operationPath(f.owner.operationId)), external);
      assert.equal(f.calls("clocked-launch"), 2); assert.equal(f.calls("release-capture"), phase === "final-clock" ? 1 : 0);
      assert.equal(f.runtime.status().state, "owned");
    });
  }
});

void test("current baseline refuses relaunch while the prior authenticated session remains active", async (context) => {
  const f = await completedBaseline(context); f.state.activeSession = true;
  await assert.rejects(f.coordinator.relaunch(f.owner.operationId));
  await assert.rejects(f.coordinator.relaunch(f.owner.operationId));
  assert.equal(f.calls("clocked-launch"), 1); assert.equal(f.calls("release-capture"), 0);
});

void test("current admission waits without repeating launch, then binds one new session to its original Job", async (context) => {
  const f = await completedBaseline(context); await f.coordinator.relaunch(f.owner.operationId);
  const before = await readFile(operationPath(f.owner.operationId)), captures = f.calls("clocked-capture");
  for (let count = 0; count < 2; count += 1) {
    const waiting = await f.coordinator.admit(f.owner.operationId);
    assert.equal(waiting["authentication"], "pending"); assert.equal(waiting["admissionAttempted"], false);
  }
  assert.deepEqual(await readFile(operationPath(f.owner.operationId)), before);
  f.state.activeSession = true; f.state.sessionSequence = 2;
  const admitted = await f.coordinator.admit(f.owner.operationId);
  assert.equal(admitted["state"], "admitted"); assert.equal(admitted["admissionProved"], true);
  assert.equal(admitted["admissionCaptureRetained"], true); assert.equal(admitted["nativeAdmissionClockStatus"], "observed");
  for (const key of ["startupQualified", "beforeWriteBaselineVerified", "openingEffectsVerified", "backendActorVerified", "backendClockVerified", "writerReady", "executionAuthorized", "explicitSaveDispatched", "replayAllowed"]) {
    assert.equal(admitted[key], false);
  }
  assert.equal(f.state.scope, false); assert.equal(f.calls("clocked-capture"), captures + 1);
  assert.equal(f.calls("clocked-launch"), 2); assert.equal(f.calls("release-capture"), 1);
  const journal = await loadOperation(f.owner.operationId);
  assert.equal(journal["hardStop"], true); assert.equal(journal["admissionAttempted"], true);
  assert.ok(f.state.events.indexOf("journal:admission-dispatching") < f.state.events.lastIndexOf("native:clocked-capture"));
  await assert.rejects(f.coordinator.admit(f.owner.operationId), /original retained relaunch/u);
  await assert.rejects(f.restart().admit(f.owner.operationId), /original retained relaunch/u);
  assert.equal(f.calls("clocked-capture"), captures + 1);
});

void test("current admission consumes session drift before capture and lease-settlement failure after capture", async (context) => {
  for (const phase of ["scope-acquisition", "scope-settlement"]) {
    await context.test(phase, async (childContext) => {
      const f = await completedBaseline(childContext); await f.coordinator.relaunch(f.owner.operationId);
      f.state.activeSession = true; f.state.sessionSequence = 2;
      const captures = f.calls("clocked-capture");
      if (phase === "scope-acquisition") { f.state.beforeScope = (): void => { f.state.sessionSequence = 3; }; }
      else { f.state.afterScope = (): Promise<void> => Promise.reject(new Error("synthetic lease settlement failed")); }
      await assert.rejects(f.coordinator.admit(f.owner.operationId), /(?:replacement session changed|lease settlement failed)/u);
      const stopped = await f.coordinator.inspect(f.owner.operationId);
      assert.equal(stopped["state"], "stopped"); assert.equal(stopped["admissionAttempted"], true); assert.equal(stopped["admissionProved"], false);
      assert.equal(stopped["admissionCaptureRetained"], phase === "scope-settlement");
      await assert.rejects(f.coordinator.admit(f.owner.operationId));
      assert.equal(f.calls("clocked-capture"), captures + (phase === "scope-settlement" ? 1 : 0));
      assert.equal(f.calls("clocked-launch"), 2); assert.equal(f.calls("release-capture"), 1);
    });
  }
});

void test("current admission preserves a foreign journal change at scope settlement and retains its original capture", async (context) => {
  const f = await completedBaseline(context); await f.coordinator.relaunch(f.owner.operationId);
  f.state.activeSession = true; f.state.sessionSequence = 2;
  let external: Buffer | undefined;
  f.state.afterScope = async (): Promise<void> => {
    const journal = await loadOperation(f.owner.operationId); journal["nextSafeAction"] = "Synthetic competing admission history; preserve it.";
    await updateOperation(journal); external = await readFile(operationPath(f.owner.operationId));
  };
  await assert.rejects(f.coordinator.admit(f.owner.operationId), /journal changed/u);
  assert.ok(external !== undefined); assert.deepEqual(await readFile(operationPath(f.owner.operationId)), external);
  const inspected = await f.coordinator.inspect(f.owner.operationId);
  assert.equal(inspected["admissionCaptureRetained"], true); assert.equal(inspected["admissionProved"], false);
  await assert.rejects(f.coordinator.admit(f.owner.operationId));
  assert.deepEqual(await readFile(operationPath(f.owner.operationId)), external); assert.equal(f.calls("release-capture"), 1);
});

void test("current admission rejects capture mutation after scope settlement and keeps unavailable clocks honest", async (context) => {
  for (const mutate of [false, true]) {
    await context.test(mutate ? "capture mutation" : "unavailable clock", async (childContext) => {
      const f = await completedBaseline(childContext);
      if (mutate) {
        const capture = f.engine.captureClosedSessionAuthority.bind(f.engine);
        childContext.mock.method(f.engine, "captureClosedSessionAuthority", async (...args: Parameters<typeof capture>): ReturnType<typeof capture> => {
          const original = await capture(...args);
          f.state.afterScope = (): Promise<void> => { original.runtimeIdentity.processId = 999; return Promise.resolve(); };
          return original;
        });
      } else { f.native.behavior.clockMode = "unavailable"; }
      await f.coordinator.relaunch(f.owner.operationId); f.state.activeSession = true; f.state.sessionSequence = 2;
      if (mutate) {
        await assert.rejects(f.coordinator.admit(f.owner.operationId), /original capture changed/u);
        const stopped = await f.coordinator.inspect(f.owner.operationId);
        assert.equal(stopped["admissionCaptureRetained"], true); assert.equal(stopped["admissionProved"], false);
      } else {
        const admitted = await f.coordinator.admit(f.owner.operationId);
        assert.equal(admitted["admissionProved"], true); assert.equal(admitted["nativeAdmissionClockStatus"], "unavailable");
        assert.equal(admitted["backendClockVerified"], false); assert.equal(admitted["writerReady"], false);
      }
      assert.equal(f.calls("release-capture"), 1); assert.equal(f.calls("clocked-launch"), 2);
    });
  }
});

async function admittedBaseline(context: TestContext, historicalSubset: StartupCase = false, clockReference = false): ReturnType<typeof fixture> {
  const f = await completedBaseline(context, historicalSubset);
  if (clockReference) { await f.coordinator.prepareClockReference(f.owner.operationId); }
  await f.coordinator.relaunch(f.owner.operationId);
  f.state.activeSession = true; f.state.sessionSequence = 2; await f.coordinator.admit(f.owner.operationId); return f;
}

void test("current cache continuation owns one tracked read and settles without admitting startup or writing", async (context) => {
  const f = await admittedBaseline(context);
  const captures = f.calls("clocked-capture");
  const result = await f.coordinator.observeCaches(f.owner.operationId);
  assert.equal(result["state"], "caches-observed"); assert.equal(result["cacheAttempted"], true);
  assert.match(String(result["nextSafeAction"]), /baseline-open-project with explicit opening-effect acceptance/u);
  assert.equal(result["cacheReplyRetained"], true); assert.equal(result["cachesObserved"], true);
  assert.equal(result["nativeCacheClockStatus"], "observed"); assert.equal(f.state.cacheReads, 1);
  assert.equal(f.calls("clocked-capture"), captures + 1); assert.equal(f.calls("release-capture"), 2);
  for (const key of ["startupQualified", "beforeWriteBaselineVerified", "openingEffectsVerified", "backendActorVerified", "backendClockVerified", "writerReady", "executionAuthorized", "explicitSaveDispatched", "replayAllowed"]) {
    assert.equal(result[key], false);
  }
  const journal = await loadOperation(f.owner.operationId);
  assert.equal(journal["orphanedCallPossible"], false); assert.equal(journal["hardStop"], true);
  assert.equal(journal["cacheAttempted"], true); assert.equal(f.state.scope, false);
  assert.ok(f.state.events.indexOf("source-pin") < f.state.events.indexOf("cache-read"));
  assert.ok(f.state.events.lastIndexOf("source-pin") > f.state.events.indexOf("cache-read"));
  assert.equal(f.state.events.filter((event) => event === "status").length, 2);
  assert.ok(f.state.events.indexOf("status") < f.state.events.indexOf("cache-read"));
  assert.ok(f.state.events.lastIndexOf("status") > f.state.events.indexOf("cache-read"));
  await assert.rejects(f.coordinator.observeCaches(f.owner.operationId), /original admitted session/u);
  await assert.rejects(f.restart().observeCaches(f.owner.operationId), /original admitted session/u);
  assert.equal(f.state.cacheReads, 1); assert.equal(f.calls("clocked-launch"), 2);
});

void test("current cache timeout retains its actual reply and quarantine without replay or cleanup", async (context) => {
  const f = await admittedBaseline(context); f.state.cacheTimeout = true;
  await assert.rejects(f.coordinator.observeCaches(f.owner.operationId), /upstream EasyEDA tool reported failure/u);
  const journal = await loadOperation(f.owner.operationId), result = await f.coordinator.inspect(f.owner.operationId);
  assert.equal(result["state"], "stopped"); assert.equal(result["cacheReplyRetained"], true); assert.equal(result["cachesObserved"], false);
  assert.equal(journal["orphanedCallPossible"], true); assert.equal(f.calls("release-capture"), 1);
  await assert.rejects(f.engine.assertBridgeDispatchAllowed());
  await assert.rejects(f.coordinator.observeCaches(f.owner.operationId)); assert.equal(f.state.cacheReads, 1);
});

void test("current cache success waits for scope settlement and the final pinned runtime", async (context) => {
  for (const phase of ["scope-settlement", "runtime-drift"]) {
    await context.test(phase, async (childContext) => {
      const f = await admittedBaseline(childContext);
      if (phase === "scope-settlement") { f.state.afterScope = (): Promise<void> => Promise.reject(new Error("synthetic cache scope failed")); }
      else { f.state.afterCache = (): Promise<void> => { f.state.statusDrift = true; return Promise.resolve(); }; }
      await assert.rejects(f.coordinator.observeCaches(f.owner.operationId), /(?:cache scope failed|runtime changed around observation)/u);
      const result = await f.coordinator.inspect(f.owner.operationId);
      assert.equal(result["cacheReplyRetained"], true); assert.equal(result["cachesObserved"], false); assert.equal(result["state"], "stopped");
      await assert.rejects(f.coordinator.observeCaches(f.owner.operationId)); assert.equal(f.state.cacheReads, 1);
    });
  }
});

void test("current cache continuation preserves conflicting history observed after the actual reply", async (context) => {
  const f = await admittedBaseline(context); let external: Buffer | undefined;
  f.state.afterCache = async (): Promise<void> => {
    const journal = await loadOperation(f.owner.operationId); journal["nextSafeAction"] = "Synthetic cache conflict; preserve this history.";
    await updateOperation(journal); external = await readFile(operationPath(f.owner.operationId));
  };
  await assert.rejects(f.coordinator.observeCaches(f.owner.operationId), /journal changed/u);
  assert.ok(external !== undefined); assert.deepEqual(await readFile(operationPath(f.owner.operationId)), external);
  const result = await f.coordinator.inspect(f.owner.operationId);
  assert.equal(result["cacheReplyRetained"], true); assert.equal(result["cachesObserved"], false);
  const journal = await loadOperation(f.owner.operationId); assert.equal(journal["orphanedCallPossible"], true);
  assert.equal(f.calls("release-capture"), 1); await assert.rejects(f.coordinator.observeCaches(f.owner.operationId));
  assert.deepEqual(await readFile(operationPath(f.owner.operationId)), external);
});

void test("current cache pre-dispatch conflict vetoes cleanup before any cache read", async (context) => {
  const f = await admittedBaseline(context); let external: Buffer | undefined;
  f.state.afterLoad = async (): Promise<void> => {
    const journal = await loadOperation(f.owner.operationId);
    if (external === undefined && journal["orphanedCallPossible"] === true) {
      journal["nextSafeAction"] = "Synthetic pre-dispatch cache conflict; preserve this history.";
      await updateOperation(journal); external = await readFile(operationPath(f.owner.operationId));
    }
  };
  await assert.rejects(f.coordinator.observeCaches(f.owner.operationId));
  assert.ok(external !== undefined); assert.deepEqual(await readFile(operationPath(f.owner.operationId)), external);
  const result = await f.coordinator.inspect(f.owner.operationId);
  assert.equal(result["cacheReplyRetained"], false); assert.equal(result["cachesObserved"], false);
  assert.equal(f.state.cacheReads, 0); assert.equal(f.calls("release-capture"), 1);
  await assert.rejects(f.coordinator.observeCaches(f.owner.operationId));
  assert.deepEqual(await readFile(operationPath(f.owner.operationId)), external);
});

async function projectReadyBaseline(context: TestContext, historicalSubset: StartupCase = true, clockReference = false): ReturnType<typeof fixture> {
  const f = await admittedBaseline(context, historicalSubset, clockReference); await f.coordinator.observeCaches(f.owner.operationId);
  f.state.openReply = { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope({
    ok: true, kind: "current-project-only-open", ...CACHE_TARGET, projectPathMatched: true, projectPresent: true, publicResult: true,
    navigationDispatched: true, inactiveUploadCachesObserved: true, noEditorTabsObserved: true, restoreSetEmptyObserved: true,
    loadProjectCompletedObserved: true, prefixEventProducerVerified: false,
    urlCommandAbsentObserved: true, currentTabId: "0", documentNavigationDispatched: false, explicitSaveDispatched: false,
    restorationCompletionVerified: false, runtimeExamStateVerified: false, startupQualified: false, openingEffectsVerified: false,
    persistenceVerified: false, writerAuthority: false, executionAuthorized: false,
  }) } };
  return f;
}

void test("current project-only continuation binds the post-opening hash and owns exactly one settled navigation", async (context) => {
  const f = await projectReadyBaseline(context), result = await f.coordinator.openProject(f.owner.operationId);
  assert.equal(result["state"], "project-only-opened"); assert.equal(result["projectOpened"], true);
  assert.match(String(result["nextSafeAction"]), /baseline-finish-close then baseline-observe-finish/u);
  assert.equal(result["projectOpenReplyRetained"], true); assert.equal(result["projectOpenAttempted"], true);
  assert.equal(result["projectOpeningMode"], "historical-subset"); assert.equal(result["unqualifiedSchematicStartupEffectsAccepted"], false);
  assert.equal(f.state.opens, 1); assert.equal(f.state.sourceChecks, 2); assert.equal(f.state.cacheReads, 1);
  assert.ok(f.state.events.lastIndexOf("source-continuity") < f.state.events.indexOf("project-only-open"));
  assert.ok(f.state.events.lastIndexOf("project-only-source-pin") > f.state.events.indexOf("project-only-open"));
  assert.equal(f.state.events.filter((event) => event === "status").length, 4);
  assert.ok(f.state.events.lastIndexOf("status") > f.state.events.indexOf("project-only-open"));
  for (const key of ["startupQualified", "openingEffectsVerified", "beforeWriteBaselineVerified", "backendActorVerified", "backendClockVerified", "writerReady", "executionAuthorized"]) {
    assert.equal(result[key], false);
  }
  const journal = await loadOperation(f.owner.operationId); assert.equal(journal["orphanedCallPossible"], false);
  await assert.rejects(f.coordinator.openProject(f.owner.operationId), /original closed baseline/u);
  await assert.rejects(f.restart().openProject(f.owner.operationId), /original closed baseline/u);
  assert.equal(f.state.opens, 1);
});

void test("current project-only generation binds the original replacement and rejects JSON, another engine and a new coordinator", async (context) => {
  const f = await projectReadyBaseline(context);
  assert.throws(() => f.coordinator.getProjectOnlyGeneration(f.owner.operationId), /original settled opening/u);
  await f.coordinator.openProject(f.owner.operationId);
  const token = f.coordinator.getProjectOnlyGeneration(f.owner.operationId);
  const original = f.assertGeneration(token, f.engine);
  assert.equal(token.operationId, f.owner.operationId); assert.equal(Object.isFrozen(token), true);
  assert.equal(Object.isFrozen(original), true); assert.equal(Object.isFrozen(original.source), true);
  assert.equal(original.baseline, f.state.copied); assert.equal(original.source.engine, f.engine); assert.equal(original.source.runtime, f.runtime);
  assert.equal(original.source.launchProjection, original.launch); assert.deepEqual(original.launch, f.runtime.status().launch);
  assert.equal(original.source.bridgeSession, original.capture.bridgeSession); assert.equal(original.source.bridgeSession.sequence, 2);
  assert.equal(await f.revalidateGeneration(token, f.engine), original);
  assert.equal(f.coordinator.getProjectOnlyGeneration(f.owner.operationId), token);
  assert.throws(() => f.assertGeneration(structuredClone(token), f.engine), /retained coordinator/u);
  const otherEngine = new EasyedaControlEngine(f.engine.upstream);
  assert.throws(() => f.assertGeneration(token, otherEngine), /retained coordinator/u);
  assert.throws(() => f.restart().getProjectOnlyGeneration(f.owner.operationId), /original settled opening/u);
  f.state.scope = true;
  assert.throws(() => f.assertGeneration(token, f.engine), /ended scope/u);
  const binding = f.engine.upstream.currentAuthenticatedBridgeDispatchBinding?.(); assert.ok(binding !== undefined);
  const scopeText = canonicalJson(binding);
  assert.equal(f.assertGeneration(token, f.engine, scopeText), original);
  assert.equal(await f.revalidateGeneration(token, f.engine, scopeText), original);
  assert.throws(() => f.assertGeneration(token, f.engine, "{}"), /ended scope/u);
  f.state.scope = false;
  assert.equal(f.state.opens, 1); assert.equal(f.state.cacheReads, 1);
});

void test("current writer transfer consumes baseline closure without copying its original capture or rewriting phase artifacts", async (context) => {
  const f = await projectReadyBaseline(context); await f.coordinator.openProject(f.owner.operationId);
  const generation = f.coordinator.getProjectOnlyGeneration(f.owner.operationId);
  const original = f.assertGeneration(generation, f.engine);
  const before = await loadOperation(f.owner.operationId);
  const artifacts = canonicalJson(before.artifacts);
  assert.throws(() => f.transferGeneration(structuredClone(generation), f.engine), /retained coordinator/u);
  const token = f.transferGeneration(generation, f.engine), transfer = f.assertWriterOwner(token, f.engine);
  assert.equal(transfer.original, original); assert.equal(transfer.original.capture, original.capture);
  assert.equal(transfer.generation, generation); assert.equal(transfer.journal.operationId, f.owner.operationId);
  assert.equal(canonicalJson(transfer.journal.artifacts), artifacts);
  assert.throws(() => f.assertWriterOwner(structuredClone(token), f.engine), /not issued/u);
  assert.throws(() => f.coordinator.getProjectOnlyGeneration(f.owner.operationId), /before ownership transfer/u);
  await assert.rejects(f.coordinator.finishNormalClose(f.owner.operationId), /original admitted new generation/u);
  await assert.rejects(f.coordinator.observeFinish(f.owner.operationId), /original acknowledged close/u);
  assert.equal(canonicalJson(await loadOperation(f.owner.operationId)), canonicalJson(before));
  transfer.journal.plan = { profile: "easyeda-pro-control.current-symbol-writer.v1", baselinePlan: before.plan };
  transfer.journal.planHash = buildPlanHash(transfer.journal.plan); transfer.journal.state = "writer-preparing";
  await updateOperation(transfer.journal);
  assert.equal(await f.revalidateGeneration(generation, f.engine), original);
  assert.throws(() => f.transferGeneration(generation, f.engine), /already consumed/u);
  assert.equal(canonicalJson(transfer.journal.artifacts), artifacts);
  const { capture } = original;
  const binding = { operationId: capture.operationId, phase: capture.phase, challengeAttempt: capture.challengeAttempt,
    bridgeSession: capture.bridgeSession, runtimeIdentity: capture.runtimeIdentity, executionAuthority: capture.executionAuthority };
  const window = await f.runtime.observeApplicationWindow(); assert.ok(window.hwnd !== null);
  const intent = await f.runtime.prepareClosedSessionClose({ ...binding, windowHandle: window.hwnd });
  transfer.beginFinish(); assert.throws(() => { transfer.beginFinish(); }, /already consumed/u);
  assert.throws(() => f.assertGeneration(generation, f.engine), /retired/u);
  assert.equal(f.assertWriterOwner(token, f.engine), transfer);
  const closeReceipt = await f.runtime.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  assert.equal(f.assertWriterOwner(token, f.engine), transfer);
  const ended = await f.runtime.probeClosedSessionTermination({ ...binding, intent, closeReceipt });
  assert.equal(ended.status, "terminated");
  if (ended.status !== "terminated") { throw new Error("Synthetic writer did not terminate"); }
  assert.equal(await assertClosedSessionCopyAuthority(ended.proof), ended.proof);
  await f.engine.releaseClosedSessionAuthority(capture); transfer.retire();
  assert.throws(() => f.assertWriterOwner(token, f.engine), /retired/u);
  assert.equal(f.calls("normal-close"), 2);
});

void test("current transferred writer rejects a replacement authenticated session and never restores baseline closure", async (context) => {
  const f = await projectReadyBaseline(context); await f.coordinator.openProject(f.owner.operationId);
  const generation = f.coordinator.getProjectOnlyGeneration(f.owner.operationId);
  const owner = f.transferGeneration(generation, f.engine), transfer = f.assertWriterOwner(owner, f.engine);
  f.state.sessionSequence = 3;
  assert.throws(() => f.assertWriterOwner(owner, f.engine), /replacement session/u);
  assert.throws(() => { transfer.beginFinish(); }, /replacement session/u);
  await assert.rejects(f.coordinator.finishNormalClose(f.owner.operationId), /original admitted new generation/u);
  assert.equal(f.calls("normal-close"), 1);
});

void test("current project-only generation rejects replaced session and methods without minting new authority", async (context) => {
  const f = await projectReadyBaseline(context); await f.coordinator.openProject(f.owner.operationId);
  const token = f.coordinator.getProjectOnlyGeneration(f.owner.operationId);
  f.state.sessionSequence = 3;
  assert.throws(() => f.assertGeneration(token, f.engine), /replacement session|selected session/u);
  f.state.sessionSequence = 2;
  const mock = context.mock.method(f.engine, "clockObservationForClosedCapture");
  assert.throws(() => f.assertGeneration(token, f.engine), /infrastructure/u); mock.mock.restore();
  await f.coordinator.finishNormalClose(f.owner.operationId);
  assert.throws(() => f.assertGeneration(token, f.engine), /changed, stopped or retired/u);
  await assert.rejects(f.revalidateGeneration(token, f.engine), /changed, stopped or retired/u);
  assert.throws(() => f.coordinator.getProjectOnlyGeneration(f.owner.operationId), /changed, stopped or retired/u);
  assert.equal(f.calls("normal-close"), 2); assert.equal(f.state.opens, 1);
});

void test("current project-only generation revalidation catches owner drift after awaited journal and helper checks", async (context) => {
  for (const boundary of ["journal", "clock"] as const) {
    await context.test(boundary, async (childContext) => {
      const f = await projectReadyBaseline(childContext); await f.coordinator.openProject(f.owner.operationId);
      const token = f.coordinator.getProjectOnlyGeneration(f.owner.operationId);
      const drift = (): Promise<void> => { f.state.sessionSequence = 3; return Promise.resolve(); };
      if (boundary === "journal") { f.state.afterLoad = drift; } else { f.state.afterClockAssert = drift; }
      await assert.rejects(f.revalidateGeneration(token, f.engine), /replacement session|selected session/u);
      assert.equal(f.state.opens, 1); assert.equal(f.calls("normal-close"), 1);
    });
  }
});

void test("current project-only generation revalidation refuses changed durable history", async (context) => {
  const f = await projectReadyBaseline(context); await f.coordinator.openProject(f.owner.operationId);
  const token = f.coordinator.getProjectOnlyGeneration(f.owner.operationId);
  const journal = await loadOperation(f.owner.operationId);
  journal["nextSafeAction"] = "synthetic external history advance"; await updateOperation(journal);
  await assert.rejects(f.revalidateGeneration(token, f.engine), /journal changed/u);
  assert.equal(f.state.opens, 1);
});

void test("current project-only generation is never issued after failed opening settlement", async (context) => {
  const failed = await projectReadyBaseline(context);
  failed.state.afterScope = (): Promise<void> => Promise.reject(new Error("synthetic opening scope settlement failed"));
  await assert.rejects(failed.coordinator.openProject(failed.owner.operationId), /scope settlement failed/u);
  assert.throws(() => failed.coordinator.getProjectOnlyGeneration(failed.owner.operationId), /original settled opening/u);
  assert.equal(failed.state.opens, 1);
});

void test("current optional clock stages keep the original baseline phases and consume each issuer once", async (context) => {
  const f = await projectReadyBaseline(context, true, true);
  assert.equal(f.state.referenceAttempts, 1);
  await assert.rejects(f.coordinator.prepareClockReference(f.owner.operationId), /unused pre-launch attempt/u);
  await f.coordinator.openProject(f.owner.operationId);
  const before = await readFile(operationPath(f.owner.operationId));
  const result = await f.coordinator.observeAgedClock(f.owner.operationId);
  assert.equal(result["clockReferenceAccepted"], true); assert.equal(result["agedClockAccepted"], true);
  assert.equal(result["startupQualified"], false); assert.equal(result["writerReady"], false); assert.equal(result["executionAuthorized"], false);
  assert.equal(f.state.clockObservations, 1); assert.deepEqual(await readFile(operationPath(f.owner.operationId)), before);
  await assert.rejects(f.coordinator.observeAgedClock(f.owner.operationId), /unused observation attempt/u);
  await assert.rejects(f.restart().observeAgedClock(f.owner.operationId), /original accepted reference/u);
  await f.coordinator.finishNormalClose(f.owner.operationId); await f.coordinator.observeFinish(f.owner.operationId);
  const journal = await loadOperation(f.owner.operationId); assert.equal(journal["sequence"], 24); assert.equal(journal.artifacts?.length, 24);
  assert.equal(f.state.referenceAttempts, 1); assert.equal(f.state.clockObservations, 1); assert.equal(f.state.opens, 1);
});

void test("current optional clock reference refusal consumes the attempt and blocks replacement launch", async (context) => {
  const f = await completedBaseline(context, true);
  const before = await readFile(operationPath(f.owner.operationId));
  f.state.referenceFailure = true;
  await assert.rejects(f.coordinator.prepareClockReference(f.owner.operationId), /synthetic reference refused/u);
  await assert.rejects(f.coordinator.prepareClockReference(f.owner.operationId), /unused pre-launch attempt/u);
  await assert.rejects(f.coordinator.relaunch(f.owner.operationId), /original completed baseline/u);
  assert.equal(f.state.referenceAttempts, 1); assert.equal(f.calls("clocked-launch"), 1);
  assert.deepEqual(await readFile(operationPath(f.owner.operationId)), before);
  const result = await f.coordinator.inspect(f.owner.operationId); assert.equal(result["clockReferenceAccepted"], false);
  assert.ok(isRecord(result["clockEvidence"]) && isRecord(result["clockEvidence"]["referenceFailure"]));
});

void test("current optional clock sidecar remains readable after owner loss without restoring authority", async (context) => {
  const f = await completedBaseline(context, true); f.state.referenceFailure = true;
  await assert.rejects(f.coordinator.prepareClockReference(f.owner.operationId), /synthetic reference refused/u);
  const restarted = f.restart(), result = await restarted.inspect(f.owner.operationId);
  assert.equal(result["originalOwnerRetained"], false);
  const sidecar = result["clockSidecar"]; assert.ok(isRecord(sidecar));
  assert.equal(sidecar["status"], "retained-bytes-only"); assert.equal(sidecar["originalAuthorityReconstructed"], false);
  assert.equal(sidecar["continuationAuthorized"], false); assert.equal(sidecar["replayAllowed"], false);
  const artifacts = sidecar["artifacts"]; assert.ok(Array.isArray(artifacts)); assert.equal(artifacts.length, 1);
  await assert.rejects(restarted.prepareClockReference(f.owner.operationId), /original closed baseline/u);
  await writePhaseArtifact(currentSymbolClockEvidenceId(f.owner.operationId), 0, "foreign-clock-evidence", { synthetic: true });
  await assert.rejects(restarted.inspect(f.owner.operationId), /sidecar inspection refused/u);
  assert.equal(f.state.referenceAttempts, 1); assert.equal(f.calls("clocked-launch"), 1);
});

void test("current optional clock observation requires reference and accepts no result before lease settlement", async (context) => {
  for (const reference of [false, true]) {
    await context.test(reference ? "failed settlement" : "missing reference", async (childContext) => {
      const f = await projectReadyBaseline(childContext, true, reference); await f.coordinator.openProject(f.owner.operationId);
      if (reference) { f.state.afterScope = (): Promise<void> => Promise.reject(new Error("synthetic clock scope settlement failed")); }
      await assert.rejects(f.coordinator.observeAgedClock(f.owner.operationId), reference ? /scope settlement failed/u : /original accepted reference/u);
      const result = await f.coordinator.inspect(f.owner.operationId); assert.equal(result["agedClockAccepted"], false);
      assert.equal(f.state.clockObservations, reference ? 1 : 0);
      if (reference) {
        await assert.rejects(f.coordinator.observeAgedClock(f.owner.operationId), /unused observation attempt/u);
        f.state.afterScope = undefined;
      }
      await f.coordinator.finishNormalClose(f.owner.operationId);
      assert.equal(f.calls("normal-close"), 2); assert.equal(f.state.opens, 1);
    });
  }
});

void test("current cache and project-only status awaits retain original session checks before success", async (context) => {
  for (const stage of ["cache", "project-only"] as const) {
    for (const boundary of ["initial", "final"] as const) {
      await context.test(`${stage} ${boundary}`, async (childContext) => {
        const f = stage === "cache" ? await admittedBaseline(childContext) : await projectReadyBaseline(childContext);
        let statusReads = 0;
        f.state.afterStatus = (): Promise<void> => {
          statusReads += 1;
          if (statusReads === (boundary === "initial" ? 1 : 2)) { f.state.sessionSequence = 3; }
          return Promise.resolve();
        };
        const run = (): Promise<Record<string, unknown>> => stage === "cache"
          ? f.coordinator.observeCaches(f.owner.operationId) : f.coordinator.openProject(f.owner.operationId);
        await assert.rejects(run());
        const stopped = await f.coordinator.inspect(f.owner.operationId);
        assert.equal(stopped["state"], "stopped");
        assert.equal(stopped[stage === "cache" ? "cachesObserved" : "projectOpened"], false);
        assert.equal(stage === "cache" ? f.state.cacheReads : f.state.opens, boundary === "initial" ? 0 : 1);
        assert.equal(f.state.scope, false); await assert.rejects(run());
      });
    }
  }
});

void test("current finish closes its admitted new generation once, polls pending, and retires without writer claims", async (context) => {
  const f = await projectReadyBaseline(context); await f.coordinator.openProject(f.owner.operationId);
  const close = await f.coordinator.finishNormalClose(f.owner.operationId);
  assert.equal(close["state"], "awaiting-finish-termination"); assert.equal(close["finishCloseAcknowledged"], true);
  assert.equal(f.calls("normal-close"), 2); assert.equal(f.state.activeSession, false);
  f.native.state.code = "authority-prior-job-not-empty"; f.native.state.remaining = 1;
  const pending = await f.coordinator.observeFinish(f.owner.operationId);
  assert.equal(pending["termination"], "pending"); assert.equal(pending["retired"], false);
  const done = await f.coordinator.observeFinish(f.owner.operationId);
  assert.equal(done["state"], "plan-invalidated"); assert.equal(done["termination"], "terminated"); assert.equal(done["retired"], true);
  assert.equal(done["finishCaptureReleased"], true); assert.equal(done["durableEffects"], "unknown-and-accepted");
  assert.equal(done["finishSnapshotStatus"], "captured"); assert.equal(done["finishSnapshotCaptured"], true); assert.equal(f.state.finishSnapshots, 1);
  assert.ok(f.state.events.indexOf("finish-snapshot") < f.state.events.lastIndexOf("native:release-capture"));
  for (const key of ["startupQualified", "openingEffectsVerified", "writerReady", "executionAuthorized", "explicitSaveDispatched", "replayAllowed"]) {
    assert.equal(done[key], false);
  }
  const journal = await loadOperation(f.owner.operationId);
  assert.equal(journal["orphanedCallPossible"], false); assert.equal(journal["hardStop"], false);
  assert.ok(isRecord(journal["result"]) && isRecord(journal["result"]["clockRelation"]));
  const clock = journal["result"]["clockRelation"];
  assert.equal(clock["status"], "observed"); assert.equal(clock["reason"], null);
  assert.ok(isRecord(clock["relation"])); assert.equal(clock["relation"]["executionAuthorized"], false);
  assert.equal(journal.artifacts?.length, 24);
  assert.ok(f.state.events.indexOf("clock-relation") < f.state.events.lastIndexOf("native:release-capture"));
  assert.ok(f.state.events.indexOf("journal:finish-close-dispatching") < f.state.events.lastIndexOf("native:normal-close"));
  await assert.rejects(f.coordinator.finishNormalClose(f.owner.operationId), /original admitted new generation/u);
  await assert.rejects(f.coordinator.observeFinish(f.owner.operationId), /original acknowledged close/u);
  const historical = await f.restart().inspect(f.owner.operationId); assert.equal(historical["originalOwnerRetained"], false);
  assert.equal(historical["finishSnapshotStatus"], "captured");
  await assert.rejects(f.restart().finishNormalClose(f.owner.operationId), /original admitted new generation/u);
  assert.equal(f.calls("normal-close"), 2); assert.equal(f.state.opens, 1); assert.equal(f.state.cacheReads, 1);
});

void test("current finish records missing clock stages without blocking otherwise valid early retirement", async (context) => {
  const f = await admittedBaseline(context);
  await f.coordinator.finishNormalClose(f.owner.operationId);
  const done = await f.coordinator.observeFinish(f.owner.operationId); assert.equal(done["retired"], true);
  const journal = await loadOperation(f.owner.operationId);
  assert.ok(isRecord(journal["result"]) && isRecord(journal["result"]["clockRelation"]));
  const clock = journal["result"]["clockRelation"];
  assert.equal(clock["status"], "not-qualified"); assert.equal(clock["reason"], "missing-stage-observations");
  assert.equal(clock["relation"], null); assert.ok(isRecord(clock["terminationClock"]));
  assert.equal(clock["executionAuthorized"], false); assert.equal(f.state.events.includes("clock-relation"), false);
});

for (const condition of ["unavailable", "inconsistent"] as const) {
  void test(`current finish records ${condition} clock evidence without another action or qualification`, async (context) => {
    const f = await projectReadyBaseline(context); await f.coordinator.openProject(f.owner.operationId);
    await f.coordinator.finishNormalClose(f.owner.operationId);
    const mutate = f.native.behavior.mutateResponse;
    f.native.behavior.mutateResponse = (request, response): void => {
      mutate?.(request, response);
      if (request["action"] !== "clocked-prove-terminated") { return; }
      if (condition === "unavailable") { response["clock"] = { status: "unavailable", reason: "clock-sample" }; return; }
      const clock = response["clock"]; assert.ok(isRecord(clock));
      for (const field of ["before", "after"]) {
        const sample = clock[field]; assert.ok(isRecord(sample)); sample["zoneRulesSha256"] = "a".repeat(64);
      }
    };
    const closes = f.calls("normal-close"), probes = f.calls("clocked-prove-terminated");
    const done = await f.coordinator.observeFinish(f.owner.operationId); assert.equal(done["retired"], true);
    const journal = await loadOperation(f.owner.operationId);
    assert.ok(isRecord(journal["result"]) && isRecord(journal["result"]["clockRelation"]));
    const clock = journal["result"]["clockRelation"];
    assert.equal(clock["status"], "not-qualified"); assert.equal(clock["relation"], null);
    assert.equal(clock["reason"], condition === "unavailable" ? "clock-observation-unavailable" : "clock-relation-refused");
    for (const flag of ["backendActorVerified", "backendClockVerified", "clockProducerOwnershipVerified", "persistenceVerified", "executionAuthorized"]) {
      assert.equal(clock[flag], false);
    }
    assert.equal(f.calls("normal-close"), closes); assert.equal(f.calls("clocked-prove-terminated"), probes + 1);
    assert.equal(f.state.opens, 1); assert.equal(f.state.cacheReads, 1); assert.equal(journal.artifacts?.length, 24);
  });
}

for (const drift of ["journal", "helper"] as const) {
  void test(`current finish cannot suppress ${drift} drift during optional clock qualification`, async (context) => {
    const f = await projectReadyBaseline(context); await f.coordinator.openProject(f.owner.operationId);
    await f.coordinator.finishNormalClose(f.owner.operationId);
    let foreign: Buffer | undefined;
    f.state.afterClockRelation = async (): Promise<void> => {
      if (drift === "helper") { await writeFile(f.native.helperPath, "synthetic helper drift", { mode: 0o600 }); return; }
      const journal = await loadOperation(f.owner.operationId); journal["nextSafeAction"] = "Foreign clock qualification history";
      await updateOperation(journal); foreign = await readFile(operationPath(f.owner.operationId));
    };
    const releases = f.calls("release-capture");
    await assert.rejects(f.coordinator.observeFinish(f.owner.operationId), drift === "journal" ? /finish journal changed/u : /helper source changed/u);
    assert.equal(f.calls("release-capture"), releases);
    if (foreign === undefined) { const journal = await loadOperation(f.owner.operationId); assert.equal(journal["state"], "stopped"); }
    else { assert.deepEqual(await readFile(operationPath(f.owner.operationId)), foreign); }
  });
}

void test("current finish snapshot failure retains original closure for retirement without another copy, close or probe", async (context) => {
  const f = await projectReadyBaseline(context); await f.coordinator.openProject(f.owner.operationId);
  await f.coordinator.finishNormalClose(f.owner.operationId); f.state.finishSnapshotFailure = true;
  const releasedBefore = f.calls("release-capture");
  await assert.rejects(f.coordinator.observeFinish(f.owner.operationId), /synthetic final snapshot failed/u);
  const stopped = await loadOperation(f.owner.operationId);
  assert.equal(stopped["state"], "stopped"); assert.equal(stopped["finishSnapshotFailed"], true); assert.equal(f.calls("release-capture"), releasedBefore);
  const artifact = stopped.artifacts?.at(-1); assert.ok(artifact !== undefined);
  const partial: unknown = JSON.parse(await readFile(artifact.path, "utf8"));
  assert.ok(isRecord(partial)); assert.equal(partial["phase"], "finish-snapshot"); assert.ok(isRecord(partial["finishSnapshotEvidence"]));
  assert.ok(partial["finishSnapshotEvidence"]["copy"] !== null);
  await assert.rejects(f.restart().observeFinish(f.owner.operationId), /original acknowledged close/u);
  await assert.rejects(f.coordinator.finishNormalClose(f.owner.operationId), /original admitted new generation/u);
  const closes = f.calls("normal-close"), probes = f.calls("clocked-prove-terminated");
  const done = await f.coordinator.observeFinish(f.owner.operationId);
  assert.equal(done["retired"], true); assert.equal(done["finishSnapshotStatus"], "failed"); assert.equal(done["finishSnapshotCaptured"], false);
  assert.equal(done["openingEffectsVerified"], false); assert.equal(done["writerReady"], false);
  assert.equal(f.calls("clocked-prove-terminated"), probes); assert.equal(f.calls("normal-close"), closes); assert.equal(f.state.finishSnapshots, 1);
});

void test("current finish snapshot retains observed foreign history and never copies or releases again", async (context) => {
  const f = await admittedBaseline(context); await f.coordinator.finishNormalClose(f.owner.operationId);
  let foreign: Buffer | undefined;
  f.state.afterFinishSnapshot = async (): Promise<void> => {
    const journal = await loadOperation(f.owner.operationId); journal["nextSafeAction"] = "Foreign final snapshot history";
    await updateOperation(journal); foreign = await readFile(operationPath(f.owner.operationId));
  };
  await assert.rejects(f.coordinator.observeFinish(f.owner.operationId), /finish journal changed/u);
  assert.ok(foreign !== undefined); assert.deepEqual(await readFile(operationPath(f.owner.operationId)), foreign);
  await assert.rejects(f.coordinator.observeFinish(f.owner.operationId), /finish journal changed/u);
  assert.deepEqual(await readFile(operationPath(f.owner.operationId)), foreign);
  assert.equal(f.state.finishSnapshots, 1); assert.equal(f.calls("release-capture"), 1);
});

void test("failed snapshot retirement revalidates reviewed helper bytes without another termination probe", async (context) => {
  const f = await admittedBaseline(context); await f.coordinator.finishNormalClose(f.owner.operationId); f.state.finishSnapshotFailure = true;
  await assert.rejects(f.coordinator.observeFinish(f.owner.operationId), /synthetic final snapshot failed/u);
  const probes = f.calls("clocked-prove-terminated"), releases = f.calls("release-capture");
  const original = await readFile(f.native.helperPath);
  await writeFile(f.native.helperPath, Buffer.concat([original, Buffer.from("\n# synthetic source drift\n")]));
  await assert.rejects(f.coordinator.observeFinish(f.owner.operationId), /helper source changed/u);
  assert.equal(f.calls("clocked-prove-terminated"), probes); assert.equal(f.calls("release-capture"), releases);
  assert.equal(f.state.finishSnapshots, 1);
  const journal = await loadOperation(f.owner.operationId); assert.equal(journal["state"], "stopped"); assert.equal(journal["hardStop"], true);
});

void test("current finish retires only its own orphan after genuine new-generation termination and lease closure", async (context) => {
  const f = await admittedBaseline(context); f.state.cacheTimeout = true;
  await assert.rejects(f.coordinator.observeCaches(f.owner.operationId));
  const quarantined = await loadOperation(f.owner.operationId); assert.equal(quarantined["orphanedCallPossible"], true);
  const captures = f.calls("clocked-capture"), reads = f.state.cacheReads;
  await f.coordinator.finishNormalClose(f.owner.operationId);
  const closed = await loadOperation(f.owner.operationId); assert.equal(closed["orphanedCallPossible"], true);
  const done = await f.coordinator.observeFinish(f.owner.operationId);
  assert.equal(done["retired"], true); assert.equal(done["state"], "plan-invalidated");
  const journal = await loadOperation(f.owner.operationId); assert.equal(journal["orphanedCallPossible"], false);
  assert.equal(f.state.cacheReads, reads); assert.equal(f.calls("clocked-capture"), captures); assert.equal(f.state.opens, 0);
  assert.equal(f.calls("release-capture"), 3); await f.engine.assertBridgeDispatchAllowed();
});

void test("current finish consumes uncertain close and preserves foreign journal history", async (context) => {
  for (const mode of ["uncertain-close", "foreign-history"] as const) {
    await context.test(mode, async (childContext) => {
      const f = await admittedBaseline(childContext);
      if (mode === "uncertain-close") {
        f.native.behavior.errorAction = "normal-close";
        await assert.rejects(f.coordinator.finishNormalClose(f.owner.operationId));
      } else {
        await f.coordinator.finishNormalClose(f.owner.operationId);
        let external: Buffer | undefined;
        f.state.afterLoad = async (): Promise<void> => {
          if (external !== undefined) { return; }
          const journal = await loadOperation(f.owner.operationId); journal["nextSafeAction"] = "Synthetic foreign finish history must remain.";
          await updateOperation(journal); external = await readFile(operationPath(f.owner.operationId));
        };
        await assert.rejects(f.coordinator.observeFinish(f.owner.operationId), /finish journal changed/u);
        assert.ok(external !== undefined); assert.deepEqual(await readFile(operationPath(f.owner.operationId)), external);
      }
      await assert.rejects(f.coordinator.finishNormalClose(f.owner.operationId), /original admitted new generation/u);
      await assert.rejects(f.coordinator.observeFinish(f.owner.operationId), /original acknowledged close/u);
      await assert.rejects(f.restart().observeFinish(f.owner.operationId), /original acknowledged close/u);
      assert.equal(f.calls("normal-close"), 2); assert.equal(f.calls("release-capture"), 1);
    });
  }
});

void test("current project-only opening refuses an unsupported historical subset without consuming navigation", async (context) => {
  const f = await admittedBaseline(context); await f.coordinator.observeCaches(f.owner.operationId);
  await assert.rejects(f.coordinator.openProject(f.owner.operationId), /original qualified baseline/u);
  assert.equal(f.state.opens, 0); assert.equal(f.state.sourceChecks, 0);
  const result = await f.coordinator.inspect(f.owner.operationId); assert.equal(result["projectOpenAttempted"], false);
});

void test("ordinary project-only startup binds its closed expectation and purpose before navigation", async (context) => {
  const ordinary = { ordinary: true, activeSchematicPages: 1, blockers: ["active-schematic-pages"] } as const;
  await context.test("supported ordinary startup refuses disposable acceptance without consuming its own opening", async (childContext) => {
    const f = await projectReadyBaseline(childContext, ordinary);
    await assert.rejects(f.coordinator.openProject(f.owner.operationId, true), /another purpose/u);
    assert.equal(f.state.opens, 0); assert.equal(f.state.startupReads, 0);
    const initial = await f.coordinator.inspect(f.owner.operationId); assert.equal(initial["projectOpenAttempted"], false);
    const result = await f.coordinator.openOrdinaryProject(f.owner.operationId);
    assert.equal(result["purpose"], "ordinary-symbol-metadata"); assert.equal(result["projectOpeningMode"], "supported-symbol-startup");
    assert.equal(result["unqualifiedSchematicStartupEffectsAccepted"], false); assert.equal(result["startupQualified"], false);
    assert.equal(result["writerReady"], false); assert.equal(result["executionAuthorized"], false);
    assert.equal(f.state.startupReads, 1); assert.equal(f.state.opens, 1);
    assert.ok(f.state.events.indexOf("startup-checkpoint") < f.state.events.indexOf("project-only-open"));
    const generation = f.coordinator.getProjectOnlyGeneration(f.owner.operationId);
    assert.equal(f.assertGeneration(generation, f.engine).source.purpose, "ordinary-symbol-metadata");
    await assert.rejects(f.coordinator.openOrdinaryProject(f.owner.operationId), /original closed baseline/u);
    assert.equal(f.state.opens, 1);
  });
  await context.test("changed closed startup expectation refuses dispatch and permits only original cleanup", async (childContext) => {
    const f = await projectReadyBaseline(childContext, { ...ordinary, startupMismatch: true });
    await assert.rejects(f.coordinator.openOrdinaryProject(f.owner.operationId), /sealed pre-navigation expectation/u);
    assert.equal(f.state.startupReads, 1); assert.equal(f.state.opens, 0); assert.equal(f.state.sourceChecks, 0);
    const refused = await f.coordinator.inspect(f.owner.operationId);
    assert.equal(refused["state"], "stopped"); assert.equal(refused["projectOpenAttempted"], true);
    assert.equal(refused["purpose"], "ordinary-symbol-metadata");
    assert.throws(() => f.coordinator.getProjectOnlyGeneration(f.owner.operationId), /original settled opening/u);
    await assert.rejects(f.coordinator.openOrdinaryProject(f.owner.operationId), /original closed baseline/u);
    assert.equal(f.state.startupReads, 1);
    await f.coordinator.finishNormalClose(f.owner.operationId);
    const retired = await f.coordinator.observeFinish(f.owner.operationId);
    assert.equal(retired["retired"], true); assert.equal(retired["purpose"], "ordinary-symbol-metadata");
    assert.equal(retired["writerReady"], false); assert.equal(f.state.opens, 0);
  });
  await context.test("ordinary entry cannot consume a disposable baseline", async (childContext) => {
    const f = await projectReadyBaseline(childContext);
    await assert.rejects(f.coordinator.openOrdinaryProject(f.owner.operationId), /another purpose/u);
    assert.equal(f.state.opens, 0); assert.equal(f.state.startupReads, 0);
    const initial = await f.coordinator.inspect(f.owner.operationId); assert.equal(initial["projectOpenAttempted"], false);
    const result = await f.coordinator.openProject(f.owner.operationId);
    assert.equal(result["purpose"], "disposable-validation"); assert.equal(f.state.opens, 1);
  });
});

void test("current project-only schematic observation requires explicit acceptance and preserves unqualified evidence through retirement", async (context) => {
  const f = await projectReadyBaseline(context, { activeSchematicPages: 2, blockers: ["active-schematic-pages"] });
  await assert.rejects(f.coordinator.openProject(f.owner.operationId), /explicit acceptance/u);
  assert.equal(f.state.opens, 0); assert.equal(f.state.sourceChecks, 0);
  const initial = await f.coordinator.inspect(f.owner.operationId); assert.equal(initial["projectOpenAttempted"], false);
  const result = await f.coordinator.openProject(f.owner.operationId, true);
  assert.equal(result["projectOpeningMode"], "unqualified-schematic-startup-observation");
  assert.equal(result["unqualifiedSchematicStartupEffectsAccepted"], true); assert.equal(f.state.opens, 1);
  assert.deepEqual(result["startupPremises"], { syntheticCopySink: true, historicalSubsetSatisfied: false,
    startupQualified: false, activeSchematicPages: 2, blockers: ["active-schematic-pages"] });
  const journal = await loadOperation(f.owner.operationId);
  const intent = journal.artifacts?.find((artifact) => basename(artifact.path).endsWith("-project-only-intent.json"));
  assert.ok(intent !== undefined);
  const value: unknown = JSON.parse(await readFile(intent.path, "utf8")); assert.ok(isRecord(value));
  assert.equal(value["schematicStartupEffects"], "native-document-rewrites-and-queued-persistence-may-occur");
  assert.equal(value["unqualifiedSchematicStartupEffectsAccepted"], true);
  for (const key of ["startupQualified", "openingEffectsVerified", "beforeWriteBaselineVerified", "backendActorVerified", "backendClockVerified", "writerReady", "executionAuthorized"]) {
    assert.equal(result[key], false);
  }
  await assert.rejects(f.coordinator.openProject(f.owner.operationId, true)); assert.equal(f.state.opens, 1);
  await f.coordinator.finishNormalClose(f.owner.operationId);
  const done = await f.coordinator.observeFinish(f.owner.operationId); assert.equal(done["retired"], true);
  assert.equal(done["unqualifiedSchematicStartupEffectsAccepted"], true); assert.equal(done["writerReady"], false);
  const historical = await f.restart().inspect(f.owner.operationId);
  assert.equal(historical["originalOwnerRetained"], false);
  assert.equal(historical["projectOpeningMode"], "unqualified-schematic-startup-observation");
  assert.equal(historical["unqualifiedSchematicStartupEffectsAccepted"], true);
  await assert.rejects(f.restart().openProject(f.owner.operationId, true)); assert.equal(f.state.opens, 1);
});

void test("schematic observation acceptance cannot bypass other or contradictory historical blockers", async (context) => {
  for (const selected of [
    { activeSchematicPages: 2, blockers: ["active-schematic-pages", "unsupported-database-version"] },
    { activeSchematicPages: 2, blockers: ["unsupported-sql-schema"] },
    { activeSchematicPages: 0, blockers: ["active-schematic-pages"] },
  ]) {
    await context.test(JSON.stringify(selected), async (childContext) => {
      const f = await projectReadyBaseline(childContext, selected);
      await assert.rejects(f.coordinator.openProject(f.owner.operationId, true), /original qualified baseline/u);
      assert.equal(f.state.opens, 0); assert.equal(f.state.sourceChecks, 0);
      const refused = await f.coordinator.inspect(f.owner.operationId); assert.equal(refused["projectOpenAttempted"], false);
    });
  }
});

void test("current project-only source drift or session loss refuses before native navigation", async (context) => {
  for (const phase of ["source-drift", "source-await-session-loss", "last-source-drift"]) {
    await context.test(phase, async (childContext) => {
      const f = await projectReadyBaseline(childContext);
      if (phase === "source-drift") { f.state.sourceDrift = true; }
      else { f.state.afterSource = (): Promise<void> => {
        if (phase === "source-await-session-loss") { f.state.activeSession = false; }
        else if (f.state.sourceChecks === 2) { f.state.sourceDrift = true; }
        return Promise.resolve();
      }; }
      await assert.rejects(f.coordinator.openProject(f.owner.operationId));
      const result = await f.coordinator.inspect(f.owner.operationId);
      assert.equal(f.state.opens, 0); assert.equal(result["projectOpenAttempted"], true);
      await assert.rejects(f.coordinator.openProject(f.owner.operationId));
    });
  }
});

void test("current project-only ambiguous response remains quarantined and is not replayed", async (context) => {
  const f = await projectReadyBaseline(context);
  f.state.openReply = { content: [], structuredContent: { ok: false, error: { message: "CURRENT_PROJECT_ONLY_OPEN_FAILED:TIMEOUT" } } };
  await assert.rejects(f.coordinator.openProject(f.owner.operationId));
  const result = await f.coordinator.inspect(f.owner.operationId);
  assert.equal(result["projectOpenReplyRetained"], true); assert.equal(result["projectOpened"], false);
  const journal = await loadOperation(f.owner.operationId); assert.equal(journal["orphanedCallPossible"], true);
  await assert.rejects(f.engine.assertBridgeDispatchAllowed());
  await assert.rejects(f.coordinator.openProject(f.owner.operationId)); assert.equal(f.state.opens, 1);
});

void test("current project-only return cannot overwrite conflicting history or skip scope settlement", async (context) => {
  for (const phase of ["conflicting-history", "scope-settlement", "runtime-drift"]) {
    await context.test(phase, async (childContext) => {
      const f = await projectReadyBaseline(childContext); let external: Buffer | undefined;
      if (phase === "scope-settlement") { f.state.afterScope = (): Promise<void> => Promise.reject(new Error("synthetic scope failed")); }
      else { f.state.afterOpen = async (): Promise<void> => {
        if (phase === "runtime-drift") { f.state.statusDrift = true; return; }
        const journal = await loadOperation(f.owner.operationId); journal["nextSafeAction"] = "Synthetic external project-only history; preserve.";
        await updateOperation(journal); external = await readFile(operationPath(f.owner.operationId));
      }; }
      await assert.rejects(f.coordinator.openProject(f.owner.operationId));
      const result = await f.coordinator.inspect(f.owner.operationId);
      assert.equal(result["projectOpenReplyRetained"], true); assert.equal(result["projectOpened"], false);
      if (external !== undefined) { assert.deepEqual(await readFile(operationPath(f.owner.operationId)), external); }
      await assert.rejects(f.coordinator.openProject(f.owner.operationId)); assert.equal(f.state.opens, 1);
    });
  }
});
