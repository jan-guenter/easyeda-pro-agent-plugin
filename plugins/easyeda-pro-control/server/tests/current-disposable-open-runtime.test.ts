import assert from "node:assert/strict";
import { test } from "node:test";
import { assertUpstreamReplySettled, canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";
import { buildCurrentDisposableOpenProgram, currentDisposableOpenTargetSchema } from "../src/current-disposable-open.ts";
import type { CurrentDisposableOpenPhase, CurrentDisposableOpenRequest } from "../src/current-disposable-open.ts";
import type { CurrentDisposableOpenCheckpoint } from "../src/current-disposable-open-checkpoint.ts";
import { CurrentDisposableOpenCoordinator } from "../src/current-disposable-open-runtime.ts";
import type { CurrentDisposableOpenDependencies, CurrentDisposableOpenOptions } from "../src/current-disposable-open-runtime.ts";
import type { AuthenticatedBridgeDispatchBinding, ExecutionAuthorityEvidence } from "../src/engine.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";

type Value = Record<string, unknown>;
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
      assert.equal(timeoutMs, phase === "open-project" || phase === "open-document" ? 130_000 : 30_000);
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
