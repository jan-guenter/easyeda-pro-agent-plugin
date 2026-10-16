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
import { controlDataDirectory } from "../src/artifacts.ts";
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
import { currentSymbolBaselineRequestSchema } from "../src/current-symbol-baseline-runtime.ts";
import { currentClosedSymbolMetadataProjection, validateCurrentClosedSymbolMetadataResult } from "../src/current-symbol-closed-target.ts";
import type { readCurrentClosedSymbolMetadata } from "../src/current-symbol-closed-target-runtime.ts";
import { currentSymbolMetadataPreparationRequestSchema, prepareCurrentSymbolMetadata } from "../src/current-symbol-metadata-preparation.ts";
import { assertOriginalCurrentOwnedSymbolPreparation } from "../src/current-symbol-owned-preparation.ts";
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
    listOperations: () => Promise.resolve([...journals.values()]),
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
    verifyImplementation: (root) => {
      assert.equal(root, "/fixture/assets"); calls.push("verify-implementation");
      return state.failImplementation ? Promise.reject(new Error("fixture installation drift")) : Promise.resolve();
    },
    validateFingerprint: (fingerprint) => { assert.deepEqual(fingerprint, FINGERPRINT); return true; },
  };
  const runtime: ReturnType<CurrentDisposableOpenOptions["runtime"]> = {
    status: () => ({ state: state.ownerLost ? "released" : "owned", launch: structuredClone(LAUNCH), executableSha256: HASH, reviewedExecutionScopeSha256: HASH }),
    observeLaunchTermination: () => { calls.push("termination"); return Promise.resolve({ jobId: LAUNCH.jobId, helperInstance: LAUNCH.helperInstance, terminated: state.terminated }); },
  };
  const engine: CurrentDisposableOpenOptions["engine"] = {
    status: () => Promise.resolve({ stableFingerprint: structuredClone(FINGERPRINT) }),
    assertBridgeDispatchAllowed: () => {
      assert.equal(state.quarantine, false, "fixture global quarantine");
      assert.equal([...journals.values()].some((item) => item["orphanedCallPossible"] === true), false, "fixture orphan quarantine"); return Promise.resolve(true);
    },
    assertNativeUiEditingAllowed: () => Promise.resolve(true),
    assertRecoveryOperationIsolated: () => { assert.equal(state.quarantine, false, "fixture unrelated quarantine"); return Promise.resolve(true); },
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

void test("current ordinary opener journals both intents, projects strict checkpoint input and never replays", async () => {
  const value = fixture("success");
  const opened = await value.coordinator.run(value.input, FINGERPRINT);
  assert.equal(opened["state"], "completed"); assert.equal(resultValue(opened)["outcome"], "target-native-identity-observed");
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
    currentOpenFailureDiagnosticSchema, describeCurrentOpenFailure, decodeExactReadEnvelope,
    currentSymbolMetadataPreparationRequestSchema, prepareCurrentSymbolMetadata, currentClosedSymbolMetadataProjection, readCurrentClosedSymbolMetadata: read,
    CurrentSymbolBaselineCoordinator: baselineClass, currentSymbolBaselineRequestSchema,
    EasyedaControlEngine: Object, WindowsControlRuntime: Object,
    createOperation: services.createOperation, loadOperation: services.loadOperation, updateOperation: services.updateOperation,
    operationPath: (id: string): string => `/fixture/${id}.json`, writePhaseArtifact: services.writePhaseArtifact,
    listQualifiedOperationStates: services.listOperations, prepareCurrentDisposableOpenCheckpoint: services.prepareCheckpoint,
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
  const beforeDispatches = dispatches(isolated), prepared = await coordinator.prepareSymbolMetadata(isolated.input.operationId, input);
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
  assert.equal(await loaded.revalidateBaselineOwner(retainedOwner, engine), original);
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
