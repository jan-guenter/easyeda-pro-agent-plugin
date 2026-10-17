/* oxlint-disable import/max-dependencies -- Exercise the exact opener and internal stage with their real parser, checkpoint decoder and a private source-evaluation scope. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import type { TestContext } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { assertOperationIdUnused, controlDataDirectory, createOperation, ensureOperationStorage } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, assertSubset, assertUpstreamReplySettled, buildPlanHash, canonicalJson, extractToolPayload, isRecord, isTerminalOperation, sha256Json, sha256Text } from "../src/core.ts";
import { CURRENT_DISPOSABLE_OPEN_MAX_BYTES, CURRENT_DISPOSABLE_OPEN_NAVIGATION_TIMEOUT_MS, buildCurrentDisposableOpenProgram,
  currentDisposableOpenSealedTargetSchema, currentDisposableOpenTargetSchema, parseCurrentDisposableOpenRequest, validateCurrentDisposableOpenResult } from "../src/current-disposable-open.ts";
import type { CurrentDisposableOpenPhase, CurrentDisposableOpenRequest } from "../src/current-disposable-open.ts";
import type { CurrentDisposableOpenCheckpoint } from "../src/current-disposable-open-checkpoint.ts";
import { currentOpenFailureDiagnosticSchema, describeCurrentOpenFailure } from "../src/current-disposable-open-diagnostics.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION } from "../src/current-disposable-open-profile.ts";
import { CurrentDisposableOpenCoordinator, assertCurrentSymbolBaselineOwner } from "../src/current-disposable-open-runtime.ts";
import type { CurrentDisposableOpenDependencies, CurrentDisposableOpenOptions, CurrentSymbolBaselineOwner,
  revalidateCurrentDisposableOpenGeneration, revalidateCurrentSymbolBaselineOwner } from "../src/current-disposable-open-runtime.ts";
import { currentSymbolBaselineRequestSchema, currentSymbolFinishSnapshotStatus } from "../src/current-symbol-baseline-runtime.ts";
import { currentClosedSymbolMetadataProjection, validateCurrentClosedSymbolMetadataResult } from "../src/current-symbol-closed-target.ts";
import type { readCurrentClosedSymbolMetadata } from "../src/current-symbol-closed-target-runtime.ts";
import { currentSymbolMetadataPreparationRequestSchema, prepareCurrentSymbolMetadata } from "../src/current-symbol-metadata-preparation.ts";
import { assertOriginalCurrentOwnedSymbolPreparation } from "../src/current-symbol-owned-preparation.ts";
import { CURRENT_SYMBOL_OPERATION_PURPOSE, parseCurrentSymbolOperationRequest } from "../src/current-symbol-operation.ts";
import { currentSymbolStartupExpectationSchema } from "../src/current-symbol-startup.ts";
import type { AuthenticatedBridgeDispatchBinding, EasyedaControlEngine, ExecutionAuthorityEvidence } from "../src/engine.ts";
import { decodeExactReadEnvelope, encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { encrypted } from "./helpers/symbol-sql-fixture.ts";

type Value = Record<string, unknown>;
// Pinned upstream L0_diagnostics_api.js validates this before calling the bridge.
// Keep its wire bound independent of the facade's selected deadlines.
const executeInputSchema = z.object({ code: z.string().min(1), confirmWrite: z.literal(true),
  timeoutMs: z.number().int().min(1000).max(60_000) }).strict();
const HASH = "a".repeat(64), RAW_PATH = String.raw`C:\Fixtures\Disposable.eprj2`;
const TARGET = { rawWindowsPath: RAW_PATH, projectUuid: sha256Text(RAW_PATH), documentUuid: "b".repeat(16), expectedSourceSha256: HASH };
const SEALED = { ...TARGET, branchUuid: "c".repeat(32) };
const LAUNCH = { jobId: "d".repeat(32), helperInstance: "e".repeat(32),
  root: { pid: 1234, role: "easyeda-main", startIdentity: `win32:134000000000000000:job:${"d".repeat(32)}` } };
const PRIOR = { sessionId: "fixture-session", sequence: 1, authenticatedAtEpochMs: 100, authenticationReceiptSha256: HASH, gatewayInstanceId: "fixture-gateway" };
const BINDING: AuthenticatedBridgeDispatchBinding = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: PRIOR.gatewayInstanceId,
  sessionId: PRIOR.sessionId, sessionSequence: PRIOR.sequence, begunAtEpochMs: 101, bindingReceipt: "fixture-receipt", leaseId: "fixture-lease" };
const AUTHORITY: ExecutionAuthorityEvidence = { schema: "easyeda-pro-control.execution-authority.v1", authoritySha256: HASH, bindingSha256: HASH,
  capturedAt: "2026-01-01T00:00:00Z", policyId: "fixture-policy", policySha256: HASH, processTreeSha256: HASH, processes: [LAUNCH.root] };
const CHECKPOINT: CurrentDisposableOpenCheckpoint = {
  profile: "easyeda-pro-control.current-disposable-open-checkpoint.v1",
  checkpoint: { schema: "easyeda-pro-control.checkpoint.v2", source: "/fixture/source.eprj2", checkpoint: "/fixture/backup.eprj2",
    receiptPath: "/fixture/receipt.json", createdAt: "2026-01-01T00:00:00Z", sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" },
    checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" }, sourceSha256: HASH, checkpointSha256: HASH,
    sourceDumpSha256: HASH, checkpointDumpSha256: HASH, receiptSha256: HASH },
  targetEvidence: { projectUuid: TARGET.projectUuid, branchUuid: SEALED.branchUuid, documentUuid: TARGET.documentUuid, docType: "PCB", sourceSha256: HASH,
    checkpointSha256: HASH, documentSemanticSha256: HASH, historySemanticSha256: HASH, headHistoryUuid: "f".repeat(32) },
};
const ORDINARY_CHECKPOINT: CurrentDisposableOpenCheckpoint = { ...CHECKPOINT, purpose: CURRENT_SYMBOL_OPERATION_PURPOSE,
  startupExpectation: { sheetUuids: ["1".repeat(16)], templates: [] } };
const FINGERPRINT = { fixture: true, installedBundles: { assetsRoot: "/fixture/assets" } };
interface FixtureState {
  uncertainPhase?: CurrentDisposableOpenPhase;
  uncertainMessage?: string;
  nativeFailure?: string;
  failImplementation: boolean;
  restored: boolean;
  nullDocument: boolean;
  terminated: boolean;
  closed: boolean;
  quarantine: boolean;
  ownerLost: boolean;
  failTerminalWrite: boolean;
}
interface Fixture {
  readonly coordinator: CurrentDisposableOpenCoordinator;
  readonly input: Extract<CurrentDisposableOpenRequest, { action: "open" }>;
  readonly state: FixtureState;
  readonly calls: string[];
  readonly journals: Map<string, Value>;
  readonly artifacts: Map<string, Value>;
  readonly services: CurrentDisposableOpenDependencies;
  readonly options: CurrentDisposableOpenOptions;
}
function reply(phase: CurrentDisposableOpenPhase, state: FixtureState): unknown {
  const projectPresent = phase !== "preflight";
  const documentPresent = projectPresent && (phase !== "open-project" || state.restored) && !state.nullDocument;
  let publicResult: string | boolean | null = null;
  if (phase === "open-project") { publicResult = true; }
  if (phase === "open-document" && !state.nullDocument) { publicResult = `${TARGET.documentUuid}@${TARGET.projectUuid}`; }
  return { structuredContent: { ok: true, result: encodeExactReadEnvelope({ ok: true, kind: "current-disposable-open", phase,
    projectUuid: TARGET.projectUuid, documentUuid: TARGET.documentUuid, projectPathMatched: true,
    branchUuid: projectPresent ? SEALED.branchUuid : null, projectPresent, documentPresent, activeTarget: documentPresent,
    nativeIdentityVerified: documentPresent, dispatchAttempted: phase === "open-project" || phase === "open-document", publicResult,
    restorationCompletionVerified: false, persistenceVerified: false, writerAuthority: false }) } };
}

function fixture(suffix: string): Fixture {
  const artifacts = new Map<string, Value>(), calls: string[] = [], journals = new Map<string, Value>();
  const input: Fixture["input"] = { action: "open", operationId: `current-open-${suffix}`, ...TARGET, confirmDisposableProject: true, acceptNormalOpenEffects: true };
  const state: FixtureState = { failImplementation: false, restored: false, nullDocument: false, terminated: false, closed: false,
    quarantine: false, ownerLost: false, failTerminalWrite: false };
  const save = (journal: Value): Promise<string> => {
    const id = journal["operationId"]; assert.equal(typeof id, "string");
    if (typeof id !== "string") { throw new TypeError("Missing fixture journal ID"); }
    if (state.failTerminalWrite && journal["state"] === "plan-invalidated") { return Promise.reject(new Error("fixture terminal write failure")); }
    journals.set(id, structuredClone(journal)); calls.push(`journal:${String(journal["state"])}`); return Promise.resolve(`/fixture/${id}.json`);
  };
  const services: CurrentDisposableOpenDependencies = {
    createOperation: save, updateOperation: save,
    assertOperationIdUnused: (id) => {
      calls.push(`unused-id:${id}`);
      return journals.has(id) ? Promise.reject(new Error("Current disposable-open operation ID is consumed.")) : Promise.resolve();
    },
    loadOperation: (id) => {
      const value = journals.get(id); assert.ok(value !== undefined && isRecord(value["plan"]) && typeof value["planHash"] === "string");
      return Promise.resolve({ ...structuredClone(value), operationId: id, plan: value["plan"], planHash: value["planHash"] });
    },
    writePhaseArtifact: (id, sequence, phase, value) => {
      const path = `/fixture/${id}/${sequence}-${phase}.json`; assert.equal(artifacts.has(path), false); assert.ok(isRecord(value));
      artifacts.set(path, structuredClone(value)); calls.push(`artifact:${phase}`);
      return Promise.resolve({ path, bytes: JSON.stringify(value).length, sha256: sha256Json(value) });
    },
    prepareCheckpoint: (target) => { assert.deepEqual(currentDisposableOpenTargetSchema.parse(target), TARGET); calls.push("prepare"); return Promise.resolve(structuredClone(CHECKPOINT)); },
    verifyCheckpoint: (prepared, target) => { assert.deepEqual(currentDisposableOpenTargetSchema.parse(target), TARGET); assert.deepEqual(prepared, CHECKPOINT); calls.push("verify-checkpoint"); return Promise.resolve(); },
    prepareOrdinaryCheckpoint: (target) => { assert.deepEqual(currentDisposableOpenTargetSchema.parse(target), TARGET); calls.push("prepare-ordinary"); return Promise.resolve(structuredClone(ORDINARY_CHECKPOINT)); },
    verifyOrdinaryCheckpoint: (prepared, target) => { assert.deepEqual(currentDisposableOpenTargetSchema.parse(target), TARGET); assert.deepEqual(prepared, ORDINARY_CHECKPOINT); calls.push("verify-ordinary-checkpoint"); return Promise.resolve(); },
    verifyImplementation: (root) => {
      assert.equal(root, "/fixture/assets"); calls.push("verify-implementation");
      return state.failImplementation ? Promise.reject(new Error("fixture installation drift")) : Promise.resolve();
    },
    validateFingerprint: (fingerprint) => { assert.deepEqual(fingerprint, FINGERPRINT); return true; },
  };
  const runtime: ReturnType<CurrentDisposableOpenOptions["runtime"]> = {
    status: () => ({ state: state.ownerLost ? "released" : "owned", launch: structuredClone(LAUNCH), executableSha256: HASH, reviewedExecutionScopeSha256: HASH }),
    observeLaunchTermination: () => { calls.push("termination"); return Promise.resolve({ jobId: LAUNCH.jobId, helperInstance: LAUNCH.helperInstance, terminated: state.terminated }); },
    observeApplicationWindow: () => { calls.push("window"); return Promise.resolve({ jobId: LAUNCH.jobId, helperInstance: LAUNCH.helperInstance, outcome: "available", hwnd: "123456" }); },
    normalClose: (hwnd) => {
      assert.equal(hwnd, "123456"); assert.equal(calls.includes("normal-close"), false);
      assert.equal(journals.get(input.operationId)?.["normalCloseAttempted"], true);
      calls.push("normal-close"); return Promise.resolve();
    },
  };
  const engine: CurrentDisposableOpenOptions["engine"] = {
    status: () => Promise.resolve({ stableFingerprint: structuredClone(FINGERPRINT) }),
    assertBridgeDispatchAllowed: () => {
      calls.push("guard:bridge");
      assert.equal(state.quarantine, false, "fixture global quarantine");
      assert.equal([...journals.values()].some((item) => item["orphanedCallPossible"] === true), false, "fixture orphan quarantine"); return Promise.resolve(true);
    },
    assertBridgeAndRecoveryAdmission: (operationId) => {
      calls.push(`guard:combined:${operationId}`);
      assert.equal(state.quarantine, false, "fixture combined admission quarantine");
      assert.equal([...journals.values()].some((item) => item["orphanedCallPossible"] === true), false, "fixture orphan quarantine");
      return Promise.resolve(true);
    },
    assertNativeUiEditingAllowed: () => { calls.push("guard:native-edit"); return Promise.resolve(true); },
    assertBridgeAndNativeUiEditingAdmission: () => {
      calls.push("guard:bridge-native-edit");
      assert.equal(state.quarantine, false, "fixture global quarantine");
      assert.equal([...journals.values()].some((item) => item["orphanedCallPossible"] === true), false, "fixture orphan quarantine");
      return Promise.resolve(true);
    },
    assertRecoveryOperationIsolated: () => { calls.push("guard:recovery"); assert.equal(state.quarantine, false, "fixture unrelated quarantine"); return Promise.resolve(true); },
    upstream: {
      callTool: () => Promise.reject(new Error("Only tracked fixture dispatch is allowed")),
      withAuthenticatedBridgeDispatchScope: (run) => { calls.push("scope"); return Promise.resolve(run(BINDING)); },
      assertClosedAuthenticatedBridgeDispatchReleased: (binding, prior) => {
        assert.deepEqual(binding, BINDING); assert.deepEqual(prior, PRIOR); assert.equal(state.closed, true, "fixture session/lease not closed");
        calls.push("closure"); return { sessionId: PRIOR.sessionId, sequence: PRIOR.sequence, authenticatedAtEpochMs: PRIOR.authenticatedAtEpochMs,
          authenticationReceiptSha256: PRIOR.authenticationReceiptSha256, closeReason: "closed", closedAtEpochMs: 200 };
      },
    },
    executionAuthorityValidator: {
      capture: () => Promise.resolve(structuredClone(AUTHORITY)), proveTerminated: () => Promise.reject(new Error("Shared recovery must not run")),
      releaseCapture: () => { assert.equal(journals.get(input.operationId)?.["orphanedCallPossible"], false); calls.push("release-capture"); return Promise.resolve(); },
    },
    dispatchWithOrphanTracking: async (journal, phase, name, args, timeoutMs, before, retain) => {
      assert.ok(phase === "preflight" || phase === "open-project" || phase === "open-document" || phase === "observe");
      assert.equal(name, "easyeda_execute"); assert.equal(args["code"], buildCurrentDisposableOpenProgram(SEALED, phase));
      const wireInput = executeInputSchema.parse(args);
      const navigation = phase === "open-project" || phase === "open-document";
      assert.equal(wireInput.timeoutMs, navigation ? 60_000 : 20_000);
      assert.equal(timeoutMs, wireInput.timeoutMs + 10_000);
      assert.ok(wireInput.code.includes(`},${wireInput.timeoutMs - 10_000}]);`));
      assert.equal(journals.get(journal.operationId)?.["state"], `${phase}-dispatching`);
      assert.ok([...artifacts.keys()].some((path) => path.endsWith(`-${phase}-intent.json`)));
      Object.assign(journal, { orphanedCallPossible: true, orphanedCallPhase: phase, bridgeSessionBeforeOrphan: PRIOR,
        bridgeDispatchBeforeOrphan: BINDING, executionAuthorityBeforeOrphan: AUTHORITY }); await save(journal);
      await before?.(); calls.push(`dispatch:${phase}`);
      if (state.uncertainPhase === phase) { throw new Error(state.uncertainMessage ?? "fixture execution unsettled"); }
      const raw = phase === "open-project" && state.nativeFailure !== undefined
        ? { structuredContent: { ok: false, error: { code: "EASYEDA_API_ERROR", message: state.nativeFailure, private: "PRIVATE_PATH_AND_SOURCE" } } }
        : reply(phase, state);
      assertUpstreamReplySettled(raw);
      await retain?.(raw); journal.orphanedCallPossible = false; await save(journal); return raw;
    },
  };
  const options: CurrentDisposableOpenOptions = { engine, runtime: () => runtime, assertOwner: () => { assert.equal(state.ownerLost, false, "fixture owner lost"); } };
  return { coordinator: new CurrentDisposableOpenCoordinator(options, services), input, state, calls, journals, artifacts, services, options };
}
function resultValue(value: Value): Value { const result = value["result"]; assert.ok(isRecord(result)); return result; }
function dispatches(value: Fixture): string[] { return value.calls.filter((call) => call.startsWith("dispatch:")); }
const RETIRE = { action: "retire-after-termination", confirmRetire: true, acceptUnknownFileEffects: true };
const NORMAL_CLOSE = { action: "request-normal-close", confirmNormalClose: true, acceptUnknownFileEffects: true };

void test("opening keeps full admission and later guards but uses only an exact unused-ID check", async () => {
  const value = fixture("unused-id-check");
  await value.coordinator.run(value.input, FINGERPRINT);
  assert.equal(value.calls.filter((call) => call === "guard:bridge-native-edit").length, 1);
  assert.equal(value.calls.filter((call) => call.startsWith("unused-id:")).length, 1);
  assert.ok(value.calls.indexOf("guard:bridge-native-edit") < value.calls.indexOf(`unused-id:${value.input.operationId}`));
  assert.ok(value.calls.indexOf(`unused-id:${value.input.operationId}`) < value.calls.indexOf("prepare"));
  assert.equal(value.calls.filter((call) => call.startsWith("guard:combined:")).length, 3);
  assert.equal(value.calls.filter((call) => call === "guard:recovery").length, 3);
  assert.deepEqual(dispatches(value), ["dispatch:preflight", "dispatch:open-project", "dispatch:open-document"]);
  const source = await readFile(new URL("../src/current-disposable-open-runtime.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /listQualifiedOperationStates|services\.listOperations/u);
});

void test("existing IDs and failed exact-name observations refuse before checkpoint preparation or navigation", async () => {
  for (const state of ["completed", "unknown", "malformed"] as const) {
    const value = fixture(`existing-id-${state}`);
    value.journals.set(value.input.operationId, { state });
    await assert.rejects(value.coordinator.run(value.input, FINGERPRINT), /ID is consumed/u);
    assert.deepEqual(value.calls, ["guard:bridge-native-edit", `unused-id:${value.input.operationId}`]);
    assert.deepEqual(dispatches(value), []);
  }
  const value = fixture("unknown-id-observation");
  const coordinator = new CurrentDisposableOpenCoordinator(value.options, { ...value.services,
    assertOperationIdUnused: (): Promise<void> => Promise.reject(new Error("synthetic namespace unavailable")),
  });
  await assert.rejects(coordinator.run(value.input, FINGERPRINT), /namespace unavailable/u);
  assert.deepEqual(value.calls, ["guard:bridge-native-edit"]);
});

void test("an ID created after its absence check still fails exclusive publication before navigation", async () => {
  await ensureOperationStorage();
  const plan = { profile: "synthetic-existing-operation" }, value = fixture("raced-exclusive-id");
  const existing = { schema: OPERATION_SCHEMA, operationId: value.input.operationId, plan, planHash: buildPlanHash(plan),
    state: "completed", artifacts: [] };
  let retainedPath = "", retainedText = "";
  const coordinator = new CurrentDisposableOpenCoordinator(value.options, { ...value.services, assertOperationIdUnused, createOperation,
    prepareCheckpoint: async (): Promise<CurrentDisposableOpenCheckpoint> => {
      retainedPath = await createOperation(existing);
      retainedText = await readFile(retainedPath, "utf8");
      return structuredClone(CHECKPOINT);
    },
  });
  await assert.rejects(coordinator.run(value.input, FINGERPRINT), /exist|EEXIST/u);
  assert.notEqual(retainedPath, "");
  assert.equal(await readFile(retainedPath, "utf8"), retainedText);
  assert.deepEqual(value.calls, ["guard:bridge-native-edit"]);
  assert.deepEqual(dispatches(value), []);
  assert.equal(value.artifacts.size, 0);
});

void test("failed disposable opener requests native normal close once without bridge work or clearing quarantine", async () => {
  const value = fixture("owned-close"); value.state.uncertainPhase = "open-project";
  await value.coordinator.run(value.input, FINGERPRINT);
  const before = dispatches(value), beforeScopes = value.calls.filter((call) => call === "scope").length;
  const result = await value.coordinator.run({ ...NORMAL_CLOSE, operationId: value.input.operationId });
  assert.equal(result["normalCloseAttempted"], true); assert.equal(result["normalCloseAcknowledged"], true);
  assert.equal(result["terminationProved"], false); assert.equal(result["quarantineCleared"], false);
  assert.equal(result["orphanedCallPossible"], true); assert.equal(result["hardStop"], true);
  assert.equal(result["state"], "current-open-outcome-unknown");
  assert.deepEqual(dispatches(value), before); assert.equal(value.calls.filter((call) => call === "scope").length, beforeScopes);
  assert.ok(value.calls.indexOf("artifact:normal-close-intent") < value.calls.indexOf("normal-close"));
  assert.ok(value.calls.indexOf("normal-close") < value.calls.indexOf("artifact:normal-close-acknowledged"));
  await assert.rejects(value.coordinator.run({ ...NORMAL_CLOSE, operationId: value.input.operationId }), /consumed/u);
  await assert.rejects(value.coordinator.run({ action: "observe", operationId: value.input.operationId }), /uncertain/u);
  await assert.rejects(value.coordinator.run({ ...value.input, operationId: "current-open-new-close-id" }, FINGERPRINT), /quarantine/u);
  await assert.rejects(value.coordinator.run({ ...RETIRE, operationId: value.input.operationId }));
  value.state.terminated = true; value.state.closed = true;
  const retired = await value.coordinator.run({ ...RETIRE, operationId: value.input.operationId });
  assert.equal(retired["state"], "plan-invalidated"); assert.equal(retired["orphanedCallPossible"], false);
  assert.equal(value.calls.filter((call) => call === "normal-close").length, 1);
});

void test("disposable normal close refuses wrong purpose, completed state, lost owner, replacement fingerprint and unrelated quarantine", async () => {
  const completed = fixture("close-completed"); await completed.coordinator.run(completed.input, FINGERPRINT);
  await assert.rejects(completed.coordinator.run({ ...NORMAL_CLOSE, operationId: completed.input.operationId }), /stopped nonterminal/u);
  assert.equal(completed.calls.includes("window"), false);
  const value = fixture("close-admission"); value.state.uncertainPhase = "open-project";
  await value.coordinator.run(value.input, FINGERPRINT);
  await assert.rejects(value.coordinator.run({ ...NORMAL_CLOSE, operationId: value.input.operationId }, FINGERPRINT), /cannot replace/u);
  const restarted = new CurrentDisposableOpenCoordinator(value.options, value.services);
  await assert.rejects(restarted.run({ ...NORMAL_CLOSE, operationId: value.input.operationId }), /no longer retains/u);
  value.state.quarantine = true;
  await assert.rejects(value.coordinator.run({ ...NORMAL_CLOSE, operationId: value.input.operationId }), /unrelated quarantine/u);
  value.state.quarantine = false; value.state.ownerLost = true;
  await assert.rejects(value.coordinator.run({ ...NORMAL_CLOSE, operationId: value.input.operationId }), /owner lost/u);
  assert.equal(value.calls.includes("window"), false); assert.equal(value.calls.includes("normal-close"), false);
  const ordinary = fixture("close-ordinary"); ordinary.state.uncertainPhase = "open-project";
  await ordinary.coordinator.runOrdinary({ action: "open", operationId: ordinary.input.operationId, ...TARGET, acceptNormalOpenEffects: true }, FINGERPRINT);
  await assert.rejects(ordinary.coordinator.run({ ...NORMAL_CLOSE, operationId: ordinary.input.operationId }), /cannot consume an ordinary/u);
  await assert.rejects(value.coordinator.runOrdinary({ ...NORMAL_CLOSE, operationId: value.input.operationId }), /cannot consume a disposable/u);
  assert.equal(ordinary.calls.includes("window"), false);
  assert.equal(value.calls.includes("window"), false);
});

void test("failed ordinary opener closes only through its purpose-bound retained owner and retires after separate termination", async () => {
  const value = fixture("ordinary-owned-close"); value.state.uncertainPhase = "open-project";
  const opening = { action: "open", operationId: value.input.operationId, ...TARGET, acceptNormalOpenEffects: true };
  await value.coordinator.runOrdinary(opening, FINGERPRINT);
  const before = dispatches(value), beforeScopes = value.calls.filter((call) => call === "scope").length;
  const result = await value.coordinator.runOrdinary({ ...NORMAL_CLOSE, operationId: opening.operationId });
  assert.equal(result["normalCloseAttempted"], true); assert.equal(result["normalCloseAcknowledged"], true);
  assert.equal(result["terminationProved"], false); assert.equal(result["quarantineCleared"], false);
  assert.equal(result["orphanedCallPossible"], true); assert.equal(result["hardStop"], true);
  assert.equal(result["state"], "current-open-outcome-unknown");
  assert.deepEqual(dispatches(value), before); assert.equal(value.calls.filter((call) => call === "scope").length, beforeScopes);
  assert.ok(value.calls.indexOf("artifact:normal-close-intent") < value.calls.indexOf("normal-close"));
  assert.ok(value.calls.indexOf("normal-close") < value.calls.indexOf("artifact:normal-close-acknowledged"));
  await assert.rejects(value.coordinator.runOrdinary({ ...NORMAL_CLOSE, operationId: opening.operationId }), /consumed/u);
  await assert.rejects(value.coordinator.run({ ...NORMAL_CLOSE, operationId: opening.operationId }), /cannot consume an ordinary/u);
  await assert.rejects(value.coordinator.runOrdinary({ action: "observe", operationId: opening.operationId }), /uncertain/u);
  await assert.rejects(value.coordinator.runOrdinary({ ...opening, operationId: "ordinary-new-close-id" }, FINGERPRINT), /quarantine/u);
  await assert.rejects(value.coordinator.runOrdinary({ ...RETIRE, operationId: opening.operationId }));
  value.state.terminated = true; value.state.closed = true;
  const retired = await value.coordinator.runOrdinary({ ...RETIRE, operationId: opening.operationId });
  assert.equal(retired["state"], "plan-invalidated"); assert.equal(retired["orphanedCallPossible"], false);
  assert.equal(value.calls.filter((call) => call === "normal-close").length, 1);
});

void test("ordinary failed-opener close rejects completed attempts, replacement authority, lost owners and unrelated quarantine before native work", async () => {
  const completed = fixture("ordinary-close-completed");
  await completed.coordinator.runOrdinary({ action: "open", operationId: completed.input.operationId, ...TARGET, acceptNormalOpenEffects: true }, FINGERPRINT);
  await assert.rejects(completed.coordinator.runOrdinary({ ...NORMAL_CLOSE, operationId: completed.input.operationId }), /stopped nonterminal/u);
  assert.equal(completed.calls.includes("window"), false);
  const value = fixture("ordinary-close-admission"); value.state.uncertainPhase = "open-project";
  await value.coordinator.runOrdinary({ action: "open", operationId: value.input.operationId, ...TARGET, acceptNormalOpenEffects: true }, FINGERPRINT);
  await assert.rejects(value.coordinator.runOrdinary({ ...NORMAL_CLOSE, operationId: value.input.operationId }, FINGERPRINT), /cannot replace/u);
  const restarted = new CurrentDisposableOpenCoordinator(value.options, value.services);
  await assert.rejects(restarted.runOrdinary({ ...NORMAL_CLOSE, operationId: value.input.operationId }), /no longer retains/u);
  value.state.quarantine = true;
  await assert.rejects(value.coordinator.runOrdinary({ ...NORMAL_CLOSE, operationId: value.input.operationId }), /unrelated quarantine/u);
  value.state.quarantine = false; value.state.ownerLost = true;
  await assert.rejects(value.coordinator.runOrdinary({ ...NORMAL_CLOSE, operationId: value.input.operationId }), /owner lost/u);
  assert.equal(value.calls.includes("window"), false); assert.equal(value.calls.includes("normal-close"), false);
  assert.equal(value.calls.includes("artifact:normal-close-intent"), false);
});

void test("ordinary close publication ambiguity retains its in-memory consumption without native dispatch or journal reconstruction", async () => {
  const value = fixture("ordinary-close-publication"); value.state.uncertainPhase = "open-project";
  const originalWrite = value.services.writePhaseArtifact; assert.ok(originalWrite);
  const coordinator = new CurrentDisposableOpenCoordinator(value.options, { ...value.services,
    writePhaseArtifact: async (...args: Parameters<typeof originalWrite>): ReturnType<typeof originalWrite> => {
      const result = await originalWrite(...args);
      if (args[2] === "normal-close-intent") { throw new Error("synthetic ambiguous ordinary publication"); }
      return result;
    },
  });
  await coordinator.runOrdinary({ action: "open", operationId: value.input.operationId, ...TARGET, acceptNormalOpenEffects: true }, FINGERPRINT);
  await assert.rejects(coordinator.runOrdinary({ ...NORMAL_CLOSE, operationId: value.input.operationId }), /synthetic ambiguous/u);
  const inspected = await coordinator.runOrdinary({ action: "inspect", operationId: value.input.operationId });
  assert.equal(inspected["normalCloseAttempted"], true); assert.equal(inspected["orphanedCallPossible"], true);
  assert.notEqual(value.journals.get(value.input.operationId)?.["normalCloseAttempted"], true);
  await assert.rejects(coordinator.runOrdinary({ ...NORMAL_CLOSE, operationId: value.input.operationId }), /consumed/u);
  value.state.terminated = true; value.state.closed = true;
  await assert.rejects(coordinator.runOrdinary({ ...RETIRE, operationId: value.input.operationId }), /original disposable-open owner and journal/u);
  assert.equal(value.calls.includes("normal-close"), false); assert.equal(value.calls.includes("release-capture"), false);
});

for (const failure of ["intent-publication", "intent-update", "native-close", "acknowledgment-publication"] as const) {
  void test(`disposable normal-close ${failure} ambiguity consumes the attempt and keeps quarantine`, async () => {
    const value = fixture(`close-${failure}`); value.state.uncertainPhase = "open-project";
    const originalUpdate = value.services.updateOperation, originalWrite = value.services.writePhaseArtifact;
    assert.ok(originalWrite && originalUpdate);
    let failingPhase = "never";
    if (failure === "intent-publication") { failingPhase = "normal-close-intent"; }
    if (failure === "acknowledgment-publication") { failingPhase = "normal-close-acknowledged"; }
    const services = { ...value.services,
      writePhaseArtifact: async (...args: Parameters<typeof originalWrite>): ReturnType<typeof originalWrite> => {
        const result = await originalWrite(...args);
        if (args[2] === failingPhase) {
          throw new Error("synthetic ambiguous publication");
        }
        return result;
      },
      updateOperation: async (...args: Parameters<typeof originalUpdate>): ReturnType<typeof originalUpdate> => {
        const result = await originalUpdate(...args);
        if (failure === "intent-update" && args[0]["normalCloseAttempted"] === true) { throw new Error("synthetic ambiguous update"); }
        return result;
      },
    };
    const runtime = value.options.runtime();
    const originalClose = runtime.normalClose;
    runtime.normalClose = async (hwnd): Promise<void> => {
      await originalClose.call(runtime, hwnd);
      if (failure === "native-close") { throw new Error("synthetic ambiguous close"); }
    };
    const coordinator = new CurrentDisposableOpenCoordinator(value.options, services);
    await coordinator.run(value.input, FINGERPRINT);
    await assert.rejects(coordinator.run({ ...NORMAL_CLOSE, operationId: value.input.operationId }), /synthetic ambiguous/u);
    const inspected = await coordinator.run({ action: "inspect", operationId: value.input.operationId });
    assert.equal(inspected["normalCloseAttempted"], true); assert.equal(inspected["orphanedCallPossible"], true);
    await assert.rejects(coordinator.run({ ...NORMAL_CLOSE, operationId: value.input.operationId }), /consumed/u);
    assert.equal(value.calls.filter((call) => call === "normal-close").length, failure.startsWith("intent-") ? 0 : 1);
    assert.equal(value.calls.includes("release-capture"), false);
  });
}

for (const drift of ["owner", "close-method", "window-method", "status-method", "guard-method", "journal", "capture", "foreign-window", "ambiguous-window"] as const) {
  void test(`disposable normal close refuses ${drift} after native window observation without dispatch`, async () => {
    const value = fixture(`close-drift-${drift}`); value.state.uncertainPhase = "open-project";
    const runtime = value.options.runtime();
    let replacementStatusCalled = false;
    runtime.observeApplicationWindow = async (): ReturnType<typeof runtime.observeApplicationWindow> => {
      await Promise.resolve();
      if (drift === "owner") { value.state.ownerLost = true; }
      if (drift === "close-method") { runtime.normalClose = (): Promise<never> => Promise.reject(new Error("replacement close must not run")); }
      if (drift === "window-method") { runtime.observeApplicationWindow = (): Promise<never> => Promise.reject(new Error("replacement window must not run")); }
      if (drift === "status-method") { runtime.status = (): never => { replacementStatusCalled = true; assert.fail("replacement status must not run"); }; }
      if (drift === "guard-method") { value.options.engine.assertRecoveryOperationIsolated = (): Promise<true> => Promise.resolve(true); }
      const journal = value.journals.get(value.input.operationId); assert.ok(journal);
      if (drift === "journal") { journal["nextSafeAction"] = "foreign change"; }
      if (drift === "capture") { journal["executionAuthorityBeforeOrphan"] = { ...AUTHORITY, authoritySha256: "9".repeat(64) }; }
      return { jobId: drift === "foreign-window" ? "9".repeat(32) : LAUNCH.jobId, helperInstance: LAUNCH.helperInstance,
        outcome: drift === "ambiguous-window" ? "ambiguous" : "available", hwnd: drift === "ambiguous-window" ? null : "123456" };
    };
    await value.coordinator.run(value.input, FINGERPRINT);
    await assert.rejects(value.coordinator.run({ ...NORMAL_CLOSE, operationId: value.input.operationId }));
    assert.equal(value.calls.includes("normal-close"), false);
    assert.equal(value.calls.includes("artifact:normal-close-intent"), false);
    assert.equal(value.journals.get(value.input.operationId)?.["orphanedCallPossible"], true);
    assert.equal(replacementStatusCalled, false);
  });
}

for (const boundary of ["first-isolation", "second-isolation", "intent-publication", "third-isolation", "native-close", "acknowledgment-publication"] as const) {
  void test(`disposable normal close rechecks method identity after ${boundary}`, async () => {
    const value = fixture(`close-boundary-${boundary}`); value.state.uncertainPhase = "open-project";
    const runtime = value.options.runtime();
    let armed = false, isolation = 0, replacementCalls = 0;
    const replace = (): void => { runtime.normalClose = (): Promise<void> => { replacementCalls += 1; return Promise.resolve(); }; };
    const originalClose = runtime.normalClose;
    runtime.normalClose = async (hwnd): Promise<void> => {
      await originalClose.call(runtime, hwnd);
      if (boundary === "native-close") { replace(); }
    };
    const originalIsolation = value.options.engine.assertRecoveryOperationIsolated;
    value.options.engine.assertRecoveryOperationIsolated = async (id): Promise<true> => {
      await originalIsolation.call(value.options.engine, id);
      if (armed) {
        isolation += 1;
        if (boundary === `${["first", "second", "third"][isolation - 1] ?? "later"}-isolation`) { replace(); }
      }
      return true;
    };
    const originalWrite = value.services.writePhaseArtifact; assert.ok(originalWrite);
    const coordinator = new CurrentDisposableOpenCoordinator(value.options, { ...value.services,
      writePhaseArtifact: async (...args: Parameters<typeof originalWrite>): ReturnType<typeof originalWrite> => {
        const result = await originalWrite(...args);
        if (boundary === "intent-publication" && args[2] === "normal-close-intent" ||
            boundary === "acknowledgment-publication" && args[2] === "normal-close-acknowledged") { replace(); }
        return result;
      },
    });
    await coordinator.run(value.input, FINGERPRINT); armed = true;
    await assert.rejects(coordinator.run({ ...NORMAL_CLOSE, operationId: value.input.operationId }), /retained methods/u);
    assert.equal(replacementCalls, 0);
    assert.equal(value.calls.filter((call) => call === "normal-close").length,
      boundary === "native-close" || boundary === "acknowledgment-publication" ? 1 : 0);
    assert.equal(value.journals.get(value.input.operationId)?.["orphanedCallPossible"], true);
    if (!["first-isolation", "second-isolation"].includes(boundary)) {
      await assert.rejects(coordinator.run({ ...NORMAL_CLOSE, operationId: value.input.operationId }), /consumed/u);
    }
  });
}

void test("current ordinary opener journals both intents, projects strict checkpoint input and never replays", async () => {
  const value = fixture("success");
  const opened = await value.coordinator.run(value.input, FINGERPRINT);
  assert.equal(opened["state"], "completed"); assert.equal(resultValue(opened)["outcome"], "target-native-identity-observed");
  assert.equal(Object.hasOwn(opened, "preparationCheckpoint"), false);
  assert.deepEqual(dispatches(value), ["dispatch:preflight", "dispatch:open-project", "dispatch:open-document"]);
  assert.equal(value.calls.filter((call) => call === "verify-checkpoint").length, 1);
  assert.ok(value.calls.indexOf("verify-checkpoint") < value.calls.indexOf("dispatch:open-project"));
  await assert.rejects(value.coordinator.run(value.input, FINGERPRINT), /consumed/u);
  await value.coordinator.run({ action: "observe", operationId: value.input.operationId });
  assert.deepEqual(dispatches(value), ["dispatch:preflight", "dispatch:open-project", "dispatch:open-document", "dispatch:observe"]);
  assert.equal(value.calls.filter((call) => call === "prepare").length, 1);
  assert.equal(value.calls.filter((call) => call === "verify-checkpoint").length, 1);
  assert.equal(opened["explicitSaveDispatched"], false); assert.equal(opened["normalOpenEffectsMayHaveOccurred"], true);
});

void test("opening exposes only its retained preparation descriptor and historical inspection neither invents nor refreshes it", async () => {
  const value = fixture("preparation-checkpoint");
  const descriptor = { path: CHECKPOINT.checkpoint.checkpoint, bytes: 4096, sha256: CHECKPOINT.checkpoint.checkpointSha256 };
  const prepared = { ...CHECKPOINT, preparationCheckpoint: descriptor };
  const coordinator = new CurrentDisposableOpenCoordinator(value.options, { ...value.services,
    prepareCheckpoint: (): Promise<CurrentDisposableOpenCheckpoint> => Promise.resolve(structuredClone(prepared)),
    verifyCheckpoint: (actual): Promise<void> => { assert.deepEqual(actual, prepared); return Promise.resolve(); } });
  const opened = await coordinator.run(value.input, FINGERPRINT);
  assert.deepEqual(opened["preparationCheckpoint"], descriptor); assert.equal(opened["writerAuthority"], false);
  assert.ok(isRecord(opened["preparationCheckpoint"])); opened["preparationCheckpoint"].bytes = 1;
  const before = [...value.calls];
  const inspected = await coordinator.run({ action: "inspect", operationId: value.input.operationId });
  assert.deepEqual(inspected["preparationCheckpoint"], descriptor); assert.deepEqual(value.calls, before);
  const journal = value.journals.get(value.input.operationId); assert.ok(journal && isRecord(journal["checkpointProof"]));
  journal["checkpointProof"]["preparationCheckpoint"] = { ...descriptor, sha256: "0".repeat(64) };
  await assert.rejects(coordinator.run({ action: "inspect", operationId: value.input.operationId }), /malformed/u);
  assert.deepEqual(value.calls, before);
});

void test("ordinary entry seals startup before navigation and rejects disposable continuation", async () => {
  const value = fixture("ordinary-symbol-purpose");
  const request = { action: "open", operationId: value.input.operationId, ...TARGET, acceptNormalOpenEffects: true };
  const opened = await value.coordinator.runOrdinary(request, FINGERPRINT);
  assert.equal(opened["state"], "completed");
  assert.deepEqual(dispatches(value), ["dispatch:preflight", "dispatch:open-project", "dispatch:open-document"]);
  assert.equal(value.calls.includes("prepare"), false); assert.equal(value.calls.includes("verify-checkpoint"), false);
  assert.ok(value.calls.indexOf("prepare-ordinary") < value.calls.indexOf("dispatch:preflight"));
  assert.ok(value.calls.indexOf("verify-ordinary-checkpoint") < value.calls.indexOf("dispatch:open-project"));
  const journal = value.journals.get(request.operationId);
  assert.ok(journal && isRecord(journal["plan"]));
  const plan = journal["plan"];
  assert.equal(plan["purpose"], CURRENT_SYMBOL_OPERATION_PURPOSE);
  assert.ok(isRecord(plan["intent"]));
  assert.deepEqual(plan["intent"]["request"], request);
  assert.deepEqual(plan["intent"]["startupExpectation"], ORDINARY_CHECKPOINT.startupExpectation);
  assert.equal(journal["planHash"], buildPlanHash(plan));
  const before = [...value.calls];
  for (const action of ["inspect", "observe", "retire-after-termination"] as const) {
    await assert.rejects(value.coordinator.run({ ...(action === "retire-after-termination" ? RETIRE : {}), action,
      operationId: request.operationId }), /Disposable route cannot consume/u);
  }
  assert.deepEqual(value.calls, before);
  await value.coordinator.runOrdinary({ action: "observe", operationId: request.operationId });
  assert.deepEqual(dispatches(value), ["dispatch:preflight", "dispatch:open-project", "dispatch:open-document", "dispatch:observe"]);
});

void test("every ordinary continuation refuses a replacement fingerprint before journal lookup or native work", async () => {
  const value = fixture("ordinary-fingerprint-refusal");
  const requests = [
    { action: "baseline-begin", operationId: "ordinary-baseline-fingerprint", openingOperationId: value.input.operationId,
      preparation: { checkpoint: { path: "/synthetic/checkpoint.eprj2", bytes: 4096, sha256: "a".repeat(64) },
        target: { projectUuid: TARGET.projectUuid, branchUuid: "b".repeat(32), ownerUuid: "c".repeat(32), symbolUuid: "d".repeat(16) }, patch: { name: "Synthetic" } },
      confirmNormalClose: true, acceptNormalOpenEffects: true },
    ...["inspect", "observe", "baseline-inspect", "baseline-observe-termination", "baseline-admit", "baseline-observe-caches",
      "baseline-observe-clock", "baseline-observe-finish", "metadata-inspect"].map((action) => ({ action, operationId: value.input.operationId })),
    ...["request-normal-close", "baseline-finish-close"].map((action) => ({ action, operationId: value.input.operationId,
      confirmNormalClose: true, acceptUnknownFileEffects: true })),
    { action: "retire-after-termination", operationId: value.input.operationId, confirmRetire: true, acceptUnknownFileEffects: true },
    { action: "baseline-prepare-clock", operationId: value.input.operationId, acceptScratchProcessEffects: true },
    ...["baseline-relaunch", "baseline-open-project"].map((action) => ({ action, operationId: value.input.operationId, acceptNormalOpenEffects: true })),
    { action: "metadata-begin", operationId: value.input.operationId, confirmWrite: true },
    { action: "metadata-advance", operationId: value.input.operationId, step: { expectedPhase: "forward-write", confirmWrite: true, acceptMetadataMutation: true } },
  ];
  for (const request of requests) {
    await assert.rejects(value.coordinator.runOrdinary(request, FINGERPRINT), /Ordinary continuation cannot replace its original runtime fingerprint/u);
  }
  assert.equal(value.journals.size, 0); assert.equal(value.artifacts.size, 0); assert.deepEqual(value.calls, []);
});

void test("ordinary startup refusal creates no journal or navigation and needs no disposable acceptance", async () => {
  const value = fixture("ordinary-startup-refusal");
  const coordinator = new CurrentDisposableOpenCoordinator(value.options, { ...value.services,
    prepareOrdinaryCheckpoint: (): Promise<CurrentDisposableOpenCheckpoint> => Promise.reject(new Error("unsupported ordinary startup")) });
  await assert.rejects(coordinator.runOrdinary({ action: "open", operationId: value.input.operationId,
    ...TARGET, acceptNormalOpenEffects: true }, FINGERPRINT), /unsupported ordinary startup/u);
  assert.equal(value.journals.size, 0); assert.equal(value.artifacts.size, 0); assert.deepEqual(dispatches(value), []);
});

void test("restored active PCB skips redundant open; null document acknowledgement is not opening success", async () => {
  const restored = fixture("restored"); restored.state.restored = true;
  const reused = await restored.coordinator.run(restored.input, FINGERPRINT);
  assert.equal(reused["documentDispatchConsumed"], false); assert.equal(resultValue(reused)["outcome"], "target-native-identity-observed");
  assert.deepEqual(dispatches(restored), ["dispatch:preflight", "dispatch:open-project"]);
  const empty = fixture("null-document"); empty.state.nullDocument = true;
  const refused = await empty.coordinator.run(empty.input, FINGERPRINT);
  assert.equal(resultValue(refused)["outcome"], "public-returned-not-opened"); assert.equal(refused["attemptConsumed"], true);
  await empty.coordinator.run({ action: "observe", operationId: empty.input.operationId });
  assert.deepEqual(dispatches(empty), ["dispatch:preflight", "dispatch:open-project", "dispatch:open-document", "dispatch:observe"]);
});

void test("each ordinary opening dispatch uses one combined admission and retains later tracked-dispatch isolation", async () => {
  for (const restored of [false, true]) {
    const value = fixture(`combined-${String(restored)}`); value.state.restored = restored;
    const opened = await value.coordinator.run(value.input, FINGERPRINT);
    assert.equal(opened["state"], "completed");
    const count = restored ? 2 : 3;
    assert.equal(value.calls.filter((call) => call === "guard:bridge").length, 0);
    assert.equal(value.calls.filter((call) => call === "guard:native-edit").length, 0);
    assert.equal(value.calls.filter((call) => call === "guard:bridge-native-edit").length, 1);
    assert.equal(value.calls.filter((call) => call === `guard:combined:${value.input.operationId}`).length, count);
    assert.equal(value.calls.filter((call) => call === "guard:recovery").length, count);
    await value.coordinator.run({ action: "observe", operationId: value.input.operationId });
    assert.equal(value.calls.filter((call) => call === `guard:combined:${value.input.operationId}`).length, count + 1);
    assert.equal(value.calls.filter((call) => call === "guard:recovery").length, count + 1);
    assert.equal(dispatches(value).length, count + 1);
  }
});

for (const failure of ["bridge quarantine", "native editing blocked"] as const) {
  void test(`combined initial opener admission ${failure} refuses before preparation or dispatch`, async () => {
    const value = fixture(`initial-${failure.replaceAll(" ", "-")}`);
    value.options.engine.assertBridgeAndNativeUiEditingAdmission = (): Promise<never> => Promise.reject(new Error(failure));
    await assert.rejects(value.coordinator.run(value.input, FINGERPRINT), { message: failure });
    assert.equal(value.calls.includes("prepare"), false);
    assert.equal(value.calls.includes("scope"), false);
    assert.equal(value.journals.size, 0);
    assert.deepEqual(dispatches(value), []);
  });
}

for (const failure of ["quarantine", "owner-drift"] as const) {
  void test(`combined opener admission ${failure} refuses before scope or tracked dispatch`, async () => {
    const value = fixture(`combined-${failure}`);
    value.options.engine.assertBridgeAndRecoveryAdmission = async (operationId): Promise<true> => {
      assert.equal(operationId, value.input.operationId);
      await Promise.resolve();
      if (failure === "quarantine") { throw new Error("synthetic combined quarantine"); }
      value.state.ownerLost = true;
      return true;
    };
    const result = await value.coordinator.run(value.input, FINGERPRINT);
    assert.equal(result["state"], "plan-invalidated");
    assert.equal(value.calls.includes("scope"), false);
    assert.deepEqual(dispatches(value), []);
  });
}

void test("pre-navigation admission failure consumes only its plan; uncertain open blocks replay and restart adoption", async () => {
  const clean = fixture("predispatch"); clean.state.failImplementation = true;
  const stopped = await clean.coordinator.run(clean.input, FINGERPRINT);
  assert.equal(stopped["state"], "plan-invalidated"); assert.equal(stopped["hardStop"], false); assert.deepEqual(dispatches(clean), []);
  await assert.rejects(clean.coordinator.run({ action: "observe", operationId: clean.input.operationId }), /retired/u);
  const value = fixture("uncertain"); value.state.uncertainPhase = "open-project";
  const unknown = await value.coordinator.run(value.input, FINGERPRINT);
  assert.equal(unknown["orphanedCallPossible"], true); assert.equal(unknown["documentDispatchConsumed"], false);
  await assert.rejects(value.coordinator.run({ action: "observe", operationId: value.input.operationId }), /uncertain/u);
  await assert.rejects(value.coordinator.run(value.input, FINGERPRINT), /quarantine/u);
  const restarted = new CurrentDisposableOpenCoordinator({ ...value.options, runtime: (): never => { throw new Error("Inspect must not allocate an owner"); } }, value.services);
  const inspected = await restarted.run({ action: "inspect", operationId: value.input.operationId });
  assert.equal(inspected["orphanedCallPossible"], true);
  await assert.rejects(restarted.run({ ...RETIRE, operationId: value.input.operationId }), /no longer retains/u);
  assert.deepEqual(dispatches(value), ["dispatch:preflight", "dispatch:open-project"]);
});

void test("retirement needs original root/Job termination, closed session, isolation and durable no-replay proof", async () => {
  const value = fixture("retire"); value.state.uncertainPhase = "open-project";
  await value.coordinator.run(value.input, FINGERPRINT);
  const initial = value.journals.get(value.input.operationId); assert.ok(initial !== undefined);
  const originalPlan = canonicalJson(initial["plan"]);
  await assert.rejects(value.coordinator.run({ ...RETIRE, operationId: value.input.operationId }));
  value.state.terminated = true;
  await assert.rejects(value.coordinator.run({ ...RETIRE, operationId: value.input.operationId }), /not closed/u);
  value.state.closed = true; value.state.quarantine = true;
  await assert.rejects(value.coordinator.run({ ...RETIRE, operationId: value.input.operationId }), /quarantine/u);
  value.state.quarantine = false; value.state.ownerLost = true;
  await assert.rejects(value.coordinator.run({ ...RETIRE, operationId: value.input.operationId }), /owner lost/u);
  value.state.ownerLost = false;
  const retired = await value.coordinator.run({ ...RETIRE, operationId: value.input.operationId });
  assert.equal(retired["state"], "plan-invalidated"); assert.equal(retired["orphanedCallPossible"], false);
  const proof = resultValue(retired); assert.equal(proof["retired"], true); assert.equal(proof["durableEffects"], "unknown-and-accepted");
  for (const field of ["replayAllowed", "continuationAuthorized", "replacementAuthorityGranted", "persistenceVerified", "writerAuthority"]) { assert.equal(proof[field], false); }
  assert.ok(value.calls.indexOf("artifact:retirement-proof") < value.calls.lastIndexOf("journal:plan-invalidated"));
  assert.ok(value.calls.lastIndexOf("journal:plan-invalidated") < value.calls.indexOf("release-capture"));
  const final = value.journals.get(value.input.operationId); assert.ok(final !== undefined); assert.equal(canonicalJson(final["plan"]), originalPlan);
  await assert.rejects(value.coordinator.run(value.input, FINGERPRINT), /consumed/u);
  await assert.rejects(value.coordinator.run({ action: "observe", operationId: value.input.operationId }), /retired/u);
  assert.deepEqual(dispatches(value), ["dispatch:preflight", "dispatch:open-project"]);
});

void test("failed terminal retirement write preserves orphan quarantine and retained capture", async () => {
  const value = fixture("retire-write"); value.state.uncertainPhase = "open-document";
  await value.coordinator.run(value.input, FINGERPRINT);
  value.state.terminated = true; value.state.closed = true; value.state.failTerminalWrite = true;
  await assert.rejects(value.coordinator.run({ ...RETIRE, operationId: value.input.operationId }), /terminal write failure/u);
  assert.equal(value.journals.get(value.input.operationId)?.["orphanedCallPossible"], true);
  assert.equal(value.calls.includes("release-capture"), false);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: value.input.operationId });
  assert.equal(inspected["orphanedCallPossible"], true);
  await assert.rejects(value.coordinator.run({ action: "observe", operationId: value.input.operationId }), /uncertain/u);
});

void test("stopped opener retains fixed diagnostics across inspect and retirement without raw native errors", async () => {
  for (const code of ["GUARD", "TIMEOUT"] as const) {
    const value = fixture(`diagnostic-${code.toLowerCase()}`);
    value.state.nativeFailure = `CURRENT_DISPOSABLE_OPEN_FAILED:open-project:${code}`;
    const stopped = await value.coordinator.run(value.input, FINGERPRINT);
    const diagnostic = stopped["failureDiagnostic"];
    assert.deepEqual(diagnostic, { schema: "easyeda-pro-control.current-open-failure.v1", phase: "open-project",
      hostStage: code === "TIMEOUT" ? "tracked-dispatch" : "decode-result", category: code === "TIMEOUT" ? "native-timeout" : "native-guard",
      nativeStage: "open-project", nativeCode: code });
    assert.equal(stopped["orphanedCallPossible"], true); assert.equal(stopped["documentDispatchConsumed"], false);
    assert.deepEqual(dispatches(value), ["dispatch:preflight", "dispatch:open-project"]);
    assert.deepEqual([...value.artifacts.values()].filter((artifact) => artifact["schema"] === "easyeda-pro-control.current-open-failure.v1"), [diagnostic]);
    const inspected = await value.coordinator.run({ action: "inspect", operationId: value.input.operationId });
    assert.deepEqual(inspected["failureDiagnostic"], diagnostic);
    assert.equal(JSON.stringify([...value.artifacts.values(), ...value.journals.values(), stopped]).includes("PRIVATE"), false);
    value.state.terminated = true; value.state.closed = true;
    const retired = await value.coordinator.run({ ...RETIRE, operationId: value.input.operationId });
    assert.deepEqual(retired["failureDiagnostic"], diagnostic);
  }
  const unknown = fixture("diagnostic-unknown"); unknown.state.uncertainPhase = "open-project"; unknown.state.uncertainMessage = "PRIVATE_NATIVE_EXCEPTION";
  const result = await unknown.coordinator.run(unknown.input, FINGERPRINT);
  assert.deepEqual(result["failureDiagnostic"], { schema: "easyeda-pro-control.current-open-failure.v1", phase: "open-project",
    hostStage: "tracked-dispatch", category: "unknown", nativeStage: null, nativeCode: null });
  assert.equal(JSON.stringify([...unknown.artifacts.values(), ...unknown.journals.values(), result]).includes("PRIVATE"), false);
});

/** Evaluate the unchanged coordinator/stage in a separate VM with synthetic
 * engine/native classes. Production issuers have no test registration hook;
 * these VM originals are deliberately rejected by the actual module issuer.
 * The checkpoint decoder/preparer below is the real maintained implementation.
 */
async function sourcePreparation(services: CurrentDisposableOpenDependencies, read: typeof readCurrentClosedSymbolMetadata, baselineClass?: unknown): Promise<{
  Coordinator: typeof CurrentDisposableOpenCoordinator;
  original: typeof assertOriginalCurrentOwnedSymbolPreparation;
  revalidate: typeof revalidateCurrentDisposableOpenGeneration;
  baselineOwner: typeof assertCurrentSymbolBaselineOwner;
  revalidateBaselineOwner: typeof revalidateCurrentSymbolBaselineOwner;
}> {
  const source = await Promise.all(["current-disposable-open-runtime", "current-symbol-owned-preparation"].map(async (name) =>
    stripTypeScriptTypes(await readFile(new URL(`../src/${name}.ts`, import.meta.url), "utf8"))
      .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "")));
  const scope = vm.createContext({ z, Buffer, structuredClone, Object, Date, Reflect,
    canonicalJson, sha256Json, sha256Text, isRecord, assertSubset, isTerminalOperation, OPERATION_SCHEMA, buildPlanHash, extractToolPayload,
    CURRENT_DISPOSABLE_OPEN_MAX_BYTES, CURRENT_DISPOSABLE_OPEN_NAVIGATION_TIMEOUT_MS, CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION,
    currentDisposableOpenSealedTargetSchema, parseCurrentDisposableOpenRequest, buildCurrentDisposableOpenProgram, validateCurrentDisposableOpenResult,
    CURRENT_SYMBOL_OPERATION_PURPOSE, parseCurrentSymbolOperationRequest, currentSymbolStartupExpectationSchema,
    currentOpenFailureDiagnosticSchema, describeCurrentOpenFailure, decodeExactReadEnvelope,
    currentSymbolMetadataPreparationRequestSchema, prepareCurrentSymbolMetadata, currentClosedSymbolMetadataProjection, readCurrentClosedSymbolMetadata: read,
    CurrentSymbolBaselineCoordinator: baselineClass, currentSymbolBaselineRequestSchema, currentSymbolFinishSnapshotStatus,
    EasyedaControlEngine: Object, WindowsControlRuntime: Object,
    createOperation: services.createOperation, loadOperation: services.loadOperation, updateOperation: services.updateOperation,
    operationPath: (id: string): string => `/fixture/${id}.json`, writePhaseArtifact: services.writePhaseArtifact,
    assertOperationIdUnused: services.assertOperationIdUnused, prepareCurrentDisposableOpenCheckpoint: services.prepareCheckpoint,
    prepareCurrentSymbolOperationCheckpoint: services.prepareOrdinaryCheckpoint, verifyCurrentSymbolOperationCheckpoint: services.verifyOrdinaryCheckpoint,
    verifyCurrentDisposableOpenCheckpoint: services.verifyCheckpoint, verifyCurrentDisposableOpenImplementation: services.verifyImplementation,
    validateSdkLocalRuntimeFingerprint: services.validateFingerprint,
  });
  const loaded: unknown = vm.runInContext(`${source.join("\n")}\n({ Coordinator: CurrentDisposableOpenCoordinator, original: assertOriginalCurrentOwnedSymbolPreparation, revalidate: revalidateCurrentDisposableOpenGeneration, baselineOwner: assertCurrentSymbolBaselineOwner, revalidateBaselineOwner: revalidateCurrentSymbolBaselineOwner });`, scope);
  assert.ok(isRecord(loaded) && typeof loaded["Coordinator"] === "function" && typeof loaded["original"] === "function" && typeof loaded["revalidate"] === "function" &&
    typeof loaded["baselineOwner"] === "function" && typeof loaded["revalidateBaselineOwner"] === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- These two checked exports were evaluated directly from the maintained source in this private VM, not supplied by a tool caller.
  return loaded as { Coordinator: typeof CurrentDisposableOpenCoordinator; original: typeof assertOriginalCurrentOwnedSymbolPreparation;
    revalidate: typeof revalidateCurrentDisposableOpenGeneration; baselineOwner: typeof assertCurrentSymbolBaselineOwner;
    revalidateBaselineOwner: typeof revalidateCurrentSymbolBaselineOwner };
}

function historyRecord(type: string, body: unknown, id?: string): string {
  return `${JSON.stringify({ type, ticket: 1, ...(id === undefined ? {} : { id }) })}||${JSON.stringify(body)}|\n`;
}

void test("historical baseline inspection reports final snapshot evidence without restoring authority", async () => {
  const value = fixture("historical-baseline-snapshot");
  const operationId = "historical-baseline-snapshot";
  const plan = { profile: "easyeda-pro-control.current-symbol-closed-baseline.v1" };
  for (const [fields, expected] of [
    [{}, "not-recorded"],
    [{ finishSnapshotAttempted: false, finishSnapshotCaptured: false, finishSnapshotFailed: false }, "not-attempted"],
    [{ finishSnapshotAttempted: true, finishSnapshotCaptured: false, finishSnapshotFailed: false }, "attempted"],
    [{ finishSnapshotAttempted: true, finishSnapshotCaptured: true, finishSnapshotFailed: false }, "captured"],
    [{ finishSnapshotAttempted: true, finishSnapshotCaptured: false, finishSnapshotFailed: true }, "failed"],
  ] as const) {
    value.journals.set(operationId, { operationId, plan, planHash: buildPlanHash(plan), state: "plan-invalidated", artifacts: [], ...fields });
    const result = await value.coordinator.run({ action: "baseline-inspect", operationId });
    assert.equal(result["finishSnapshotStatus"], expected);
    assert.equal(result["originalOwnerRetained"], false); assert.equal(result["executionAuthorized"], false);
    if (expected === "not-recorded") {
      assert.equal(result["finishSnapshotAttempted"], null); assert.equal(result["finishSnapshotCaptured"], null);
    }
  }
  assert.deepEqual(value.calls, []);
});
async function preparationCheckpoint(t: TestContext): Promise<unknown> {
  const parent = join(controlDataDirectory(), "checkpoints"); await mkdir(parent, { recursive: true, mode: 0o700 });
  const directory = await mkdtemp(join(parent, "owned-symbol-"));
  t.after(async () => { await rm(directory, { recursive: true, force: true }); });
  const path = join(directory, "fixture.eprj2"), symbolUuid = "a".repeat(16);
  const database = new DatabaseSync(path), head = "f".repeat(32), key = "1".repeat(32);
  try {
    database.exec(`CREATE TABLE projects(uuid TEXT PRIMARY KEY,branch_uuid TEXT,owner_uuid TEXT);
      CREATE TABLE branches(uuid TEXT PRIMARY KEY,project_uuid TEXT,history_uuid TEXT);
      CREATE TABLE project_history_${SEALED.branchUuid}(uuid TEXT PRIMARY KEY,parent TEXT,snapshot TEXT,key TEXT,num INTEGER,snapshot_num INTEGER);
      CREATE TABLE history_data(uuid TEXT PRIMARY KEY,history_uuid TEXT,dataStr TEXT);`);
    database.prepare("INSERT INTO projects VALUES(?,?,?)").run(TARGET.projectUuid, SEALED.branchUuid, "2".repeat(32));
    database.prepare("INSERT INTO branches VALUES(?,?,?)").run(SEALED.branchUuid, TARGET.projectUuid, head);
    database.prepare(`INSERT INTO project_history_${SEALED.branchUuid} VALUES(?,?,?,?,?,?)`).run(head, null, null, key, 0, 0);
    const text = historyRecord("DOCHEAD", { uuid: symbolUuid, docType: "SYMBOL", client: "3".repeat(16), updateTime: 1, version: "1", editVersion: "3.2.196.5cb3e1b3" }) +
      historyRecord("META", { title: "Original", description: "Original description", tags: [], docType: 2, source: "template" }, "META");
    database.prepare("INSERT INTO history_data VALUES(?,?,?)").run(head, head, encrypted(text, head, key));
  } finally { database.close(); }
  await chmod(path, 0o600);
  const bytes = await readFile(path);
  return { checkpoint: { path, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") },
    target: { projectUuid: TARGET.projectUuid, branchUuid: SEALED.branchUuid, ownerUuid: "2".repeat(32), symbolUuid }, patch: { name: "Changed" } };
}

void test("owned symbol preparation uses the real checkpoint preparer and invalidates original objects on lifecycle drift", async (t) => {
  const input = await preparationCheckpoint(t), value = fixture("owned-preparation");
  // Injected production coordinators cannot mint even preparation-only originals.
  await value.coordinator.run(value.input, FINGERPRINT);
  await assert.rejects(value.coordinator.prepareSymbolMetadata(value.input.operationId, input), /injected opening services/u);
  const isolated = fixture("isolated-preparation");
  const readControl: { duringRead?: () => void } = {};
  let reads = 0;
  const loaded = await sourcePreparation(isolated.services, (engine, request, fingerprint): ReturnType<typeof readCurrentClosedSymbolMetadata> => {
    assert.equal(engine, isolated.options.engine); assert.deepEqual(fingerprint, FINGERPRINT); reads += 1;
    const target = { projectUuid: TARGET.projectUuid, branchUuid: SEALED.branchUuid, documentUuid: TARGET.documentUuid,
      tabId: `${TARGET.documentUuid}@${TARGET.projectUuid}` };
    assert.equal(canonicalJson(request), canonicalJson({ method: "eda.lib_Symbol.get", arguments: { symbolUuid: "a".repeat(16) }, target }));
    const observation = validateCurrentClosedSymbolMetadataResult(request, { ok: true, kind: "current-closed-symbol-metadata-witness", method: "eda.lib_Symbol.get",
      target, value: { uuid: "a".repeat(16), projectUuid: TARGET.projectUuid, ownerUuid: "2".repeat(32), name: "Original", description: "Original description",
        tagsJson: "[]", source: "template", version: "1", ticket: 1 }, samples: 2, implementationKind: "native-task-equivalent",
      clientTicketObservation: { client: "f".repeat(16), maxTicket: 1, samples: 4 },
      runtimeObservation: { editorVersion: "3.2.206", actor: { uuid: "1".repeat(32), username: "fixture-user", nickname: "Fixture" },
        clockSamples: Array.from({ length: 4 }, (_, index) => ({ rendererBeforeMs: 1000 + index * 3,
          serverTimeMs: 1001 + index * 3, rendererAfterMs: 1002 + index * 3 })),
        backendActorVerified: false, backendClockVerified: false, clockProducerOwnershipVerified: false },
      targetClosedInRegistry: true, hiddenEditorsVerified: true, workerIdentityVerified: false, cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false });
    readControl.duringRead?.();
    return Promise.resolve({ observation, observationSha256: sha256Json(observation), runtimeFingerprintSha256: sha256Json(FINGERPRINT),
      sourceImplementationVerified: true, executionAuthorized: false });
  });
  let active = false, scopeEntries = 0, sessionChanged = false;
  const upstream = isolated.options.engine.upstream;
  upstream.withAuthenticatedBridgeDispatchScope = async <Result>(run: (binding: AuthenticatedBridgeDispatchBinding) => PromiseLike<Result> | Result): Promise<Result> => {
    scopeEntries += 1; active = true; try { return await run(BINDING); } finally { active = false; }
  };
  upstream.currentAuthenticatedBridgeDispatchBinding = (): AuthenticatedBridgeDispatchBinding | undefined => active ? BINDING : undefined;
  upstream.bridgeSessionLifecycle = (): unknown => ({ schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: PRIOR.gatewayInstanceId,
    activeSession: sessionChanged ? null : { sessionId: PRIOR.sessionId, sequence: PRIOR.sequence,
      authenticatedAtEpochMs: PRIOR.authenticatedAtEpochMs, authenticationReceiptSha256: PRIOR.authenticationReceiptSha256 } });
  const coordinator = new loaded.Coordinator(isolated.options);
  await coordinator.run(isolated.input, FINGERPRINT);
  const beforeScopes = scopeEntries;
  isolated.state.quarantine = true;
  await assert.rejects(coordinator.prepareSymbolMetadata(isolated.input.operationId, input), /quarantine/u);
  assert.equal(scopeEntries, beforeScopes); assert.equal(reads, 0);
  isolated.state.quarantine = false;
  const beforeCombined = isolated.calls.filter((call) => call === `guard:combined:${isolated.input.operationId}`).length;
  const beforeSeparate = isolated.calls.filter((call) => call === "guard:bridge" || call === "guard:recovery").length;
  const beforeDispatches = dispatches(isolated), prepared = await coordinator.prepareSymbolMetadata(isolated.input.operationId, input);
  // Entry plus both original-generation revalidations each perform one scan.
  assert.equal(isolated.calls.filter((call) => call === `guard:combined:${isolated.input.operationId}`).length, beforeCombined + 3);
  assert.equal(isolated.calls.filter((call) => call === "guard:bridge" || call === "guard:recovery").length, beforeSeparate);
  assert.equal(prepared.checkpointPreparation.metadata.after.name, "Changed");
  assert.equal(reads, 1); assert.equal(prepared.closedTargetWitness.observation.hiddenEditorsVerified, true);
  assert.equal(prepared.checkpointPreparation.correlation.metadataMatches, true); assert.equal(prepared.checkpointPreparation.correlation.freshnessVerified, false);
  assert.equal(prepared.postOpeningBaselineVerified, false); assert.equal(prepared.writerReady, false); assert.equal(prepared.executionAuthorized, false);
  assert.deepEqual(dispatches(isolated), beforeDispatches);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the isolated VM treats this fixture as its synthetic engine class; the actual issuer below must reject its originals.
  const engine = isolated.options.engine as EasyedaControlEngine;
  const original = loaded.original(prepared, engine);
  assert.equal(original.source.engine, engine); assert.equal(original.source.runtime, isolated.options.runtime());
  assert.deepEqual(original.source.preNavigationCheckpoint, CHECKPOINT);
  assert.equal(original.source.purpose, "disposable-validation"); assert.equal(original.source.startupExpectation, undefined);
  const beforeWrongPurpose = [...isolated.calls];
  for (const action of ["inspect", "observe", "retire-after-termination"] as const) {
    await assert.rejects(coordinator.runOrdinary({ ...(action === "retire-after-termination" ? RETIRE : {}), action,
      operationId: isolated.input.operationId }), /Ordinary route cannot consume/u);
    assert.equal(loaded.original(prepared, engine), original);
  }
  assert.deepEqual(isolated.calls, beforeWrongPurpose);
  assert.throws(() => loaded.original(structuredClone(prepared), engine), /not issued unchanged/u);
  assert.throws(() => assertOriginalCurrentOwnedSymbolPreparation(prepared, engine), /not issued unchanged/u);
  sessionChanged = true; assert.throws(() => loaded.original(prepared, engine), /session changed/u);
  sessionChanged = false; assert.throws(() => loaded.original(prepared, engine), /retained opening/u);
  const next = await coordinator.prepareSymbolMetadata(isolated.input.operationId, input);
  await coordinator.run({ action: "observe", operationId: isolated.input.operationId });
  assert.throws(() => loaded.original(next, engine), /retained opening/u);
  assert.ok(isRecord(input)); const beforeReads = reads;
  await assert.rejects(coordinator.prepareSymbolMetadata(isolated.input.operationId, { ...input, observationProjection: {} }));
  assert.equal(reads, beforeReads);
  const final = await coordinator.prepareSymbolMetadata(isolated.input.operationId, input), originalFinal = loaded.original(final, engine);
  const saved = isolated.journals.get(isolated.input.operationId); assert.ok(saved);
  isolated.journals.set(isolated.input.operationId, { ...saved, nextSafeAction: "changed on disk" });
  await assert.rejects(loaded.revalidate(originalFinal.generation, engine), /persisted opening changed/u);
  isolated.journals.set(isolated.input.operationId, saved);
  assert.throws(() => loaded.original(final, engine), /retained opening/u);
  readControl.duringRead = (): void => { sessionChanged = true; };
  await assert.rejects(coordinator.prepareSymbolMetadata(isolated.input.operationId, input), /original authenticated session changed/u);
  sessionChanged = false;
  assert.deepEqual(dispatches(isolated), [...beforeDispatches, "dispatch:observe"]);
});

void test("owned baseline transfer reserves the runtime across Jobs and stops in-flight ordinary continuations", async (t) => {
  const input = await preparationCheckpoint(t), isolated = fixture("baseline-transfer");
  const acceptedStartupEffects: (true | undefined)[] = [];
  const followups: string[] = [];
  let active = false, admitted = 0, cacheReads = 0, constructed = 0, observed = 0, relaunched = 0, sessionClosed = false;
  let retainedOwner: CurrentSymbolBaselineOwner | undefined;
  let currentLaunch = structuredClone(LAUNCH);
  const runtime = isolated.options.runtime(), transition = Promise.withResolvers<Value>();
  const originalStatus = runtime.status.bind(runtime);
  runtime.status = (): ReturnType<typeof originalStatus> => ({ ...originalStatus(), launch: structuredClone(currentLaunch) });
  const baselineId = "current-symbol-baseline-transfer", sqlRuntime = { nodeExecutable: "/synthetic/not-invoked", nodeVersion: "24.18.0" as const, nodeSha256: HASH };
  class SyntheticBaseline {
    private readonly ordinal: number;
    public constructor(engine: unknown, retainedRuntime: unknown, sql: unknown) {
      assert.equal(engine, isolated.options.engine); assert.equal(retainedRuntime, isolated.options.runtime()); assert.deepEqual(sql, sqlRuntime);
      constructed += 1; this.ordinal = constructed;
    }
    public capture(owner: CurrentSymbolBaselineOwner): Promise<void> {
      assert.equal(this.ordinal, 1); assert.equal(active, true); assert.equal(retainedOwner, undefined); retainedOwner = owner; return Promise.resolve();
    }
    public close(owner: CurrentSymbolBaselineOwner): Promise<Value> {
      assert.equal(active, false); assert.equal(owner, retainedOwner); sessionClosed = true;
      return Promise.resolve({ state: "awaiting-termination", stageOrdinal: this.ordinal });
    }
    public observe(operationId: string): Promise<Value> {
      assert.equal(operationId, baselineId); observed += 1; return Promise.resolve({ state: "awaiting-termination", stageOrdinal: this.ordinal });
    }
    public relaunch(operationId: string): Promise<Value> {
      assert.equal(this.ordinal, 1); assert.equal(operationId, baselineId); assert.equal(relaunched, 0); relaunched += 1;
      const jobId = "9".repeat(32);
      currentLaunch = { ...LAUNCH, jobId, root: { ...LAUNCH.root, pid: 4321, startIdentity: `win32:134000000000000001:job:${jobId}` } };
      return transition.promise;
    }
    public admit(operationId: string): Promise<Value> {
      assert.equal(this.ordinal, 1); assert.equal(operationId, baselineId); admitted += 1;
      return Promise.resolve({ state: "admitted", stageOrdinal: this.ordinal });
    }
    public observeCaches(operationId: string): Promise<Value> {
      assert.equal(this.ordinal, 1); assert.equal(operationId, baselineId); cacheReads += 1;
      return Promise.resolve({ state: "caches-observed", stageOrdinal: this.ordinal });
    }
    public openProject(operationId: string, acceptance?: true): Promise<Value> {
      assert.equal(this.ordinal, 1); assert.equal(operationId, baselineId); followups.push("open-project");
      acceptedStartupEffects.push(acceptance);
      return Promise.resolve({ state: "project-only-opened", stageOrdinal: this.ordinal, writerAuthority: false });
    }
    public finishNormalClose(operationId: string): Promise<Value> {
      assert.equal(this.ordinal, 1); assert.equal(operationId, baselineId); followups.push("finish-close");
      return Promise.resolve({ state: "awaiting-finish-termination", stageOrdinal: this.ordinal });
    }
    public observeFinish(operationId: string): Promise<Value> {
      assert.equal(this.ordinal, 1); assert.equal(operationId, baselineId); followups.push("observe-finish");
      return Promise.resolve({ state: "retired", stageOrdinal: this.ordinal, executionAuthorized: false });
    }
    public inspect(operationId: string): Promise<Value> {
      assert.equal(this.ordinal, 1); assert.equal(operationId, baselineId); followups.push("inspect");
      return Promise.resolve({ state: "retired", stageOrdinal: this.ordinal, executionAuthorized: false });
    }
    public stopAfterScopeFailure(): Promise<void> { return Promise.reject(new Error(`Unexpected synthetic scope failure in stage ${String(this.ordinal)}`)); }
  }
  const loaded = await sourcePreparation(isolated.services, (engine, request, fingerprint): ReturnType<typeof readCurrentClosedSymbolMetadata> => {
    assert.equal(engine, isolated.options.engine); assert.deepEqual(fingerprint, FINGERPRINT);
    const target = { projectUuid: TARGET.projectUuid, branchUuid: SEALED.branchUuid, documentUuid: TARGET.documentUuid,
      tabId: `${TARGET.documentUuid}@${TARGET.projectUuid}` };
    const observation = validateCurrentClosedSymbolMetadataResult(request, { ok: true, kind: "current-closed-symbol-metadata-witness", method: "eda.lib_Symbol.get",
      target, value: { uuid: "a".repeat(16), projectUuid: TARGET.projectUuid, ownerUuid: "2".repeat(32), name: "Original", description: "Original description",
        tagsJson: "[]", source: "template", version: "1", ticket: 1 }, samples: 2, implementationKind: "native-task-equivalent",
      clientTicketObservation: { client: "f".repeat(16), maxTicket: 1, samples: 4 },
      runtimeObservation: { editorVersion: "3.2.206", actor: { uuid: "1".repeat(32), username: "fixture-user", nickname: "Fixture" },
        clockSamples: Array.from({ length: 4 }, (_, index) => ({ rendererBeforeMs: 1000 + index * 3,
          serverTimeMs: 1001 + index * 3, rendererAfterMs: 1002 + index * 3 })),
        backendActorVerified: false, backendClockVerified: false, clockProducerOwnershipVerified: false },
      targetClosedInRegistry: true, hiddenEditorsVerified: true, workerIdentityVerified: false, cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false });
    return Promise.resolve({ observation, observationSha256: sha256Json(observation), runtimeFingerprintSha256: sha256Json(FINGERPRINT),
      sourceImplementationVerified: true, executionAuthorized: false });
  }, SyntheticBaseline);
  const upstream = isolated.options.engine.upstream;
  upstream.withAuthenticatedBridgeDispatchScope = async <Result>(run: (binding: AuthenticatedBridgeDispatchBinding) => PromiseLike<Result> | Result): Promise<Result> => {
    assert.equal(active, false); active = true; try { return await run(BINDING); } finally { active = false; }
  };
  upstream.currentAuthenticatedBridgeDispatchBinding = (): AuthenticatedBridgeDispatchBinding | undefined => active ? BINDING : undefined;
  upstream.bridgeSessionLifecycle = (): unknown => ({ schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: PRIOR.gatewayInstanceId,
    activeSession: sessionClosed ? null : { sessionId: PRIOR.sessionId, sequence: PRIOR.sequence,
      authenticatedAtEpochMs: PRIOR.authenticatedAtEpochMs, authenticationReceiptSha256: PRIOR.authenticationReceiptSha256 } });
  const coordinator = new loaded.Coordinator(isolated.options);
  await coordinator.run(isolated.input, FINGERPRINT);
  const preparingSibling = new loaded.Coordinator(isolated.options), siblingInput = { ...isolated.input, operationId: "current-open-preparing-sibling" };
  await preparingSibling.run(siblingInput, FINGERPRINT);
  const siblingPreparation = await preparingSibling.prepareSymbolMetadata(siblingInput.operationId, input);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the private source-evaluation scope regards this fixture engine as its synthetic engine class.
  const engine = isolated.options.engine as EasyedaControlEngine;
  let combinedAdmissions = 0;
  const originalCombinedAdmission = engine.assertBridgeAndRecoveryAdmission.bind(engine);
  engine.assertBridgeAndRecoveryAdmission = (operationId: string): Promise<true> => {
    if (operationId !== baselineId) { return originalCombinedAdmission(operationId); }
    assert.equal(operationId, baselineId); combinedAdmissions += 1;
    assert.equal(isolated.state.quarantine, false, "fixture combined admission quarantine");
    return Promise.resolve(true);
  };
  const siblingOriginal = loaded.original(siblingPreparation, engine);
  const observingInput = { ...isolated.input, operationId: "current-open-observing-sibling" }, observingSibling = new loaded.Coordinator(isolated.options);
  await observingSibling.run(observingInput, FINGERPRINT);
  const beforeReservation = dispatches(isolated);
  const request = { operationId: baselineId, preparation: input, confirmNormalClose: true };
  // Both sibling actions begin before the baseline reserves the shared Job.
  // Their next awaited-boundary checks must stop before another CAD dispatch.
  const revalidation = loaded.revalidate(siblingOriginal.generation, engine);
  const queuedObservation = observingSibling.run({ action: "observe", operationId: observingInput.operationId });
  const baseline = coordinator.beginSymbolBaseline(isolated.input.operationId, request, sqlRuntime);
  const [closed] = await Promise.all([baseline, assert.rejects(revalidation, /transferred/u), assert.rejects(queuedObservation, /transferred/u)]);
  assert.deepEqual(dispatches(isolated), beforeReservation);
  assert.equal(closed["state"], "awaiting-termination"); assert.equal(constructed, 1); assert.equal(sessionClosed, true); assert.ok(retainedOwner !== undefined);
  const original = loaded.baselineOwner(retainedOwner, engine);
  assert.equal(original.source.runtime, isolated.options.runtime()); assert.equal(original.preparation.checkpointPreparation.metadata.after.name, "Changed");
  assert.equal(original.source.purpose, "disposable-validation");
  for (const action of ["baseline-inspect", "baseline-observe-termination", "metadata-begin"] as const) {
    await assert.rejects(coordinator.runOrdinary({ action, operationId: baselineId,
      ...(action === "metadata-begin" ? { confirmWrite: true } : {}) }), /another purpose/u);
    assert.equal(loaded.baselineOwner(retainedOwner, engine), original);
  }
  const beforeRevalidation = combinedAdmissions;
  assert.equal(await loaded.revalidateBaselineOwner(retainedOwner, engine), original);
  assert.equal(combinedAdmissions, beforeRevalidation + 1);
  isolated.state.quarantine = true;
  await assert.rejects(loaded.revalidateBaselineOwner(retainedOwner, engine), /combined admission quarantine/u);
  assert.equal(combinedAdmissions, beforeRevalidation + 2);
  isolated.state.quarantine = false;
  assert.throws(() => loaded.baselineOwner(structuredClone(retainedOwner), engine), /not issued/u);
  assert.throws(() => assertCurrentSymbolBaselineOwner(retainedOwner, engine), /not issued/u);
  await assert.rejects(coordinator.prepareSymbolMetadata(isolated.input.operationId, input), /transferred/u);
  await assert.rejects(coordinator.run({ action: "observe", operationId: isolated.input.operationId }), /transferred/u);
  const inspected = await coordinator.run({ action: "inspect", operationId: isolated.input.operationId }); assert.equal(inspected["state"], "completed");
  assert.equal(loaded.baselineOwner(retainedOwner, engine), original);
  await assert.rejects(coordinator.beginSymbolBaseline(isolated.input.operationId, request, sqlRuntime), /distinct unused/u);
  await assert.rejects(coordinator.beginSymbolBaseline(isolated.input.operationId, { ...request, operationId: "another-baseline" }, sqlRuntime), /transferred/u);
  const sibling = new loaded.Coordinator(isolated.options);
  await assert.rejects(sibling.run({ ...isolated.input, operationId: "another-opening" }, FINGERPRINT), /transferred/u);
  const observation = await coordinator.run({ action: "baseline-observe-termination", operationId: baselineId });
  assert.equal(observation["stageOrdinal"], 1); assert.equal(constructed, 1); assert.equal(observed, 1);
  const beforeRelaunch = dispatches(isolated), relaunch = coordinator.run({ action: "baseline-relaunch", operationId: baselineId, acceptNormalOpenEffects: true });
  assert.equal(runtime.status().launch?.jobId, "9".repeat(32)); assert.equal(relaunched, 1);
  await assert.rejects(coordinator.observeSymbolBaseline(baselineId), /busy/u);
  await assert.rejects(coordinator.relaunchSymbolBaseline(baselineId), /busy/u);
  await assert.rejects(coordinator.admitSymbolBaseline(baselineId), /busy/u);
  await assert.rejects(coordinator.observeSymbolBaselineCaches(baselineId), /busy/u);
  await assert.rejects(coordinator.run({ action: "baseline-open-project", operationId: baselineId, acceptNormalOpenEffects: true }), /in progress/u);
  await assert.rejects(sibling.run({ ...isolated.input, operationId: "after-relaunch-opening" }, FINGERPRINT), /transferred/u);
  await assert.rejects(preparingSibling.beginSymbolBaseline(siblingInput.operationId, { ...request, operationId: "after-relaunch-sibling-baseline" }, sqlRuntime), /transferred/u);
  transition.resolve({ state: "relaunched", stageOrdinal: 1 });
  const relaunchedResult = await relaunch;
  assert.equal(relaunchedResult["stageOrdinal"], 1);
  assert.equal(constructed, 1); assert.deepEqual(dispatches(isolated), beforeRelaunch);
  await assert.rejects(coordinator.relaunchSymbolBaseline("unknown-baseline"), /unavailable/u);
  const admission = await coordinator.run({ action: "baseline-admit", operationId: baselineId });
  assert.equal(admission["stageOrdinal"], 1); assert.equal(admitted, 1);
  await assert.rejects(coordinator.admitSymbolBaseline("unknown-baseline"), /unavailable/u);
  const caches = await coordinator.run({ action: "baseline-observe-caches", operationId: baselineId });
  assert.equal(caches["stageOrdinal"], 1); assert.equal(cacheReads, 1);
  await assert.rejects(coordinator.observeSymbolBaselineCaches("unknown-baseline"), /unavailable/u);
  await assert.rejects(coordinator.run({ action: "baseline-open-project", operationId: baselineId, acceptNormalOpenEffects: true }, FINGERPRINT), /cannot replace/u);
  for (const acceptance of [false, "true", null]) {
    await assert.rejects(coordinator.run({ action: "baseline-open-project", operationId: baselineId, acceptNormalOpenEffects: true,
      acceptUnqualifiedSchematicStartupEffects: acceptance }));
  }
  assert.deepEqual(acceptedStartupEffects, []);
  const opened = await coordinator.run({ action: "baseline-open-project", operationId: baselineId, acceptNormalOpenEffects: true });
  assert.equal(opened["stageOrdinal"], 1); assert.equal(opened["writerAuthority"], false);
  assert.deepEqual(acceptedStartupEffects, [undefined]);
  // This inert stage exercises argument forwarding only. The actual baseline
  // Coordinator separately enforces its single navigation attempt.
  const optedIn = await coordinator.run({ action: "baseline-open-project", operationId: baselineId, acceptNormalOpenEffects: true,
    acceptUnqualifiedSchematicStartupEffects: true });
  assert.equal(optedIn["stageOrdinal"], 1); assert.equal(optedIn["writerAuthority"], false);
  assert.deepEqual(acceptedStartupEffects, [undefined, true]);
  const finished = await coordinator.run({ action: "baseline-finish-close", operationId: baselineId, confirmNormalClose: true, acceptUnknownFileEffects: true });
  assert.equal(finished["stageOrdinal"], 1);
  const terminal = await coordinator.run({ action: "baseline-observe-finish", operationId: baselineId });
  assert.equal(terminal["stageOrdinal"], 1); assert.equal(terminal["executionAuthorized"], false);
  isolated.state.quarantine = true;
  const baselineInspection = await coordinator.run({ action: "baseline-inspect", operationId: baselineId });
  assert.equal(baselineInspection["stageOrdinal"], 1); assert.equal(baselineInspection["executionAuthorized"], false);
  isolated.state.quarantine = false;
  assert.deepEqual(followups, ["open-project", "open-project", "finish-close", "observe-finish", "inspect"]);
  assert.equal(constructed, 1); assert.deepEqual(dispatches(isolated), beforeRelaunch);
  // Neither a completed transition nor a later null launch returns this runtime
  // To ordinary ownership. The reservation lasts for the runtime's lifetime.
  runtime.status = (): ReturnType<typeof originalStatus> => ({ ...originalStatus(), launch: null });
  await assert.rejects(sibling.run({ ...isolated.input, operationId: "null-launch-opening" }, FINGERPRINT), /transferred/u);
});
