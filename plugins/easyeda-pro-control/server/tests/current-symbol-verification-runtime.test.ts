/** Executes the actual coordinator with explicit synthetic dependency seams.
 * These checks do not grant native handles or connected validation.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";

type Bag = Record<string, unknown>;
type Failure = "none" | "cache-preflight" | "cache-clear-release" | "open-decode" | "saved-read" | "snapshot" | "comparison" | "foreign-journal" | "source-before-launch" |
  "launch-clock" | "admission-before-capture" | "launch-clock-close-ack";
interface Harness {
  invoke: (name: string) => Promise<Bag>;
  inspect: () => Bag;
  state: { calls: string[]; launches: number; closes: number; reads: number; snapshots: number; comparisons: number; releases: number; sourceReads: number };
  artifacts: Map<string, unknown>;
}
const ID = "synthetic-current-verification";
function object(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
function noOp(): undefined { return undefined; }
async function fixture(failure: Failure = "none"): Promise<Harness> {
  const continuation = Object.freeze({ profile: "private.current-symbol-writer-continuation.v1", operationId: ID });
  const prior = { gatewayInstanceId: "g".repeat(43), sessionId: "o".repeat(43), sequence: 4,
    authenticationReceiptSha256: "a".repeat(64), authenticatedAtEpochMs: 1000 };
  const selected = { sessionId: "n".repeat(43), sequence: 5, authenticationReceiptSha256: "b".repeat(64), authenticatedAtEpochMs: 2000 };
  const active = { ...selected, gatewayInstanceId: prior.gatewayInstanceId };
  const previousLaunch = { jobId: "old-job", helperInstance: "original-helper", root: { role: "easyeda-main", pid: 10, startIdentity: "win32:123:job:old-job" } };
  const launch = { jobId: "new-job", helperInstance: "original-helper", root: { role: "easyeda-main", pid: 11, startIdentity: "win32:456:job:new-job" } };
  const capture = { operationId: ID, phase: "closed-verification", challengeAttempt: 1, bridgeSession: active,
    runtimeIdentity: { synthetic: "new-renderer" }, executionAuthority: { processes: [launch.root] } };
  const clock = Object.freeze({ synthetic: "original-clock" });
  const lease = { gatewayInstanceId: prior.gatewayInstanceId, sessionId: selected.sessionId, sessionSequence: selected.sequence };
  const fingerprint = { installedBundles: { assetsRoot: "/synthetic/assets" } };
  const afterInventory = Object.freeze({ synthetic: "verification-inventory" }), beforeInventory = Object.freeze({ synthetic: "post-edit-inventory" });
  const postedit = Object.freeze({ checkpoint: { sourceSha256: "d".repeat(64) }, copy: { receiptSha256: "e".repeat(64) } });
  const finalSnapshot = Object.freeze({ synthetic: "verification-snapshot" });
  const journal: Bag = { operationId: ID, artifacts: [], sequence: 30, plan: { profile: "writer" }, state: "plan-invalidated",
    hardStop: false, orphanedCallPossible: false, bridgeSessionBeforeOrphan: prior,
    bridgeDispatchBeforeOrphan: { old: true }, executionAuthorityBeforeOrphan: { processes: [previousLaunch.root] },
    runtimeIdentityBeforeOrphan: { old: true }, orphanedCallPhase: "old-write", orphanedCallMarkedAt: "old", orphanedCallReturnedAt: "old" };
  let closed = false, consumed = false, disk = structuredClone(journal), launched = false, probeCount = 0, scopeActive = false, statusCount = 0;
  const state = { calls: [] as string[], launches: 0, closes: 0, reads: 0, snapshots: 0, comparisons: 0, releases: 0, sourceReads: 0 };
  const artifacts = new Map<string, unknown>();
  const runtime = {
    launch: (): Promise<unknown> => { state.launches += 1; launched = true; return Promise.resolve(launch); },
    status: (): Bag => ({ state: "owned", launch: launched ? launch : previousLaunch }),
    clockObservationForLaunch: (): Promise<unknown> => failure.startsWith("launch-clock") ? Promise.reject(new Error("Synthetic launch clock refused")) : Promise.resolve(clock),
    releaseCapture: (): Promise<void> => { state.releases += 1; return Promise.resolve(); },
    observeApplicationWindow: (): Promise<unknown> => Promise.resolve({ outcome: "available", hwnd: "5", jobId: launch.jobId, helperInstance: launch.helperInstance }),
    prepareClosedSessionClose: (input: Bag): Promise<unknown> => { assert.equal(input["phase"], "closed-verification"); return Promise.resolve({ synthetic: "intent" }); },
    requestClosedSessionNormalClose: (): Promise<unknown> => { state.closes += 1; closed = true; return Promise.resolve({ synthetic: "receipt" }); },
    normalClose: (hwnd: string): Promise<void> => {
      assert.equal(hwnd, "5"); state.closes += 1; closed = true;
      return failure === "launch-clock-close-ack" ? Promise.reject(new Error("Synthetic ordinary close acknowledgment lost")) : Promise.resolve();
    },
    observeLaunchTermination: (): Promise<unknown> => {
      probeCount += 1; return Promise.resolve({ jobId: launch.jobId, helperInstance: launch.helperInstance, terminated: probeCount > 1 });
    },
    probeClosedSessionTermination: (): Promise<unknown> => {
      probeCount += 1; return Promise.resolve(probeCount === 1 ? { status: "pending" } : { status: "terminated", proof: { synthetic: "original-proof" } });
    },
  };
  const source = { operationId: ID, snapshot: postedit, clockPlan: {}, dispatchOwner: {}, writeInput: {}, sqlRuntime: {}, journal,
    original: { source: { runtime, target: { projectUuid: "p", branchUuid: "b", expectedSourceSha256: "c".repeat(64) }, expectedFingerprint: fingerprint },
      launch: previousLaunch, capture: { bridgeSession: prior }, baseline: { checkpoint: { sourceSha256: "c".repeat(64) } } } };
  const mark = (): void => {
    Object.assign(journal, { orphanedCallPossible: true, bridgeSessionBeforeOrphan: active, bridgeDispatchBeforeOrphan: lease,
      executionAuthorityBeforeOrphan: { processes: [launch.root] } }); disk = structuredClone(journal);
  };
  const clear = (): void => { journal["orphanedCallPossible"] = false; disk = structuredClone(journal); };
  const engine = {
    upstream: {
      bridgeSessionLifecycle: (): Bag => ({ schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: prior.gatewayInstanceId,
        publicEndpoint: { synthetic: true }, activeSession: launched && !closed ? selected : null,
        recentClosedSessions: [{ sessionId: prior.sessionId, sequence: prior.sequence, authenticationReceiptSha256: prior.authenticationReceiptSha256,
          authenticatedAtEpochMs: prior.authenticatedAtEpochMs, closedAtEpochMs: 1500, closeReason: "closed" },
        ...(closed ? [{ ...selected, closedAtEpochMs: 2500, closeReason: "closed" }] : [])] }),
      currentAuthenticatedBridgeDispatchBinding: (): unknown => scopeActive ? lease : undefined,
      withAuthenticatedBridgeDispatchScope: async (task: (value: unknown) => Promise<void>): Promise<void> => {
        assert.equal(scopeActive, false); scopeActive = true; try { await task(lease); } finally { scopeActive = false; }
      },
      callTool: noOp,
      assertClosedAuthenticatedBridgeDispatchReleased: (_dispatch: unknown, priorSession: unknown): Bag => {
        assert.deepEqual(priorSession, active); return { ...selected, closedAtEpochMs: 2500 };
      },
    }, executionAuthorityValidator: {},
    captureClosedSessionAuthority: (_id: string, phase: string): Promise<unknown> => {
      assert.equal(phase, "closed-verification"); assert.equal(scopeActive, true);
      return failure === "admission-before-capture" ? Promise.reject(new Error("Synthetic admission failed before capture")) : Promise.resolve(capture);
    },
    clockObservationForClosedCapture: (value: unknown): Promise<unknown> => { assert.equal(value, capture); return Promise.resolve(clock); },
    releaseClosedSessionAuthority: (value: unknown): Promise<void> => { assert.equal(value, capture); state.releases += 1; return Promise.resolve(); },
    runtimeIdentity: (): Promise<unknown> => Promise.resolve(capture.runtimeIdentity),
    status: (): Promise<unknown> => {
      statusCount += 1; assert.equal(scopeActive, true);
      if (failure === "cache-preflight" && statusCount === 1) { return Promise.reject(new Error("Synthetic cache preflight failed")); }
      return Promise.resolve({ stableFingerprint: fingerprint });
    },
    assertBridgeDispatchAllowed: (): Promise<void> => Promise.resolve(),
    assertRecoveryOperationIsolated: (): Promise<void> => Promise.resolve(),
    markOrphanedCallRisk: noOp, clearOrphanedCallRisk: noOp,
    dispatchWithOrphanTracking: async (_journal: unknown, phase: string, _tool: string, args: Bag, _timeout: unknown,
      before: () => Promise<void>, retain: (raw: unknown) => Promise<void>, beforeClear: () => Promise<void>): Promise<unknown> => {
      mark(); await before(); state.calls.push(String(args["code"]));
      const raw = Object.freeze({ synthetic: phase }); await retain(raw); await beforeClear(); clear();
      if (failure === "cache-clear-release" && phase.includes("caches")) { throw new Error("Synthetic durable clear then release failed"); }
      return raw;
    },
  };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-symbol-verification-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Reflect, Map, WeakMap, Date, Promise, structuredClone, canonicalJson, isRecord, sha256Json, sha256Text,
    buildPlanHash: sha256Json, assertExpectedFingerprint: noOp, assertSubset: noOp, validateSdkLocalRuntimeFingerprint: noOp, assertWindowsRuntimeValidator: noOp,
    assertOriginalCurrentSymbolWriterContinuation: (value: unknown): typeof source => { assert.equal(value, continuation); return source; },
    revalidateCurrentSymbolWriterContinuation: (value: unknown): Promise<typeof source> => { assert.equal(value, continuation); assert.equal(consumed, false); return Promise.resolve(source); },
    transferCurrentSymbolWriterContinuation: (value: unknown): typeof source => { assert.equal(value, continuation); assert.equal(consumed, false); consumed = true; return source; },
    prepareCurrentSavedSymbolSource: (): Promise<unknown> => Promise.resolve(Object.freeze({ synthetic: "saved-source" })),
    verifyCurrentSymbolPosteditPreopenSource: (_engine: unknown, received: unknown): Promise<unknown> => {
      assert.equal(received, postedit); state.sourceReads += 1;
      return failure === "source-before-launch" ? Promise.reject(new Error("Synthetic postedit source changed")) : Promise.resolve({ sourceMatchesClosedResult: true });
    },
    loadOperation: (): Promise<Bag> => Promise.resolve(structuredClone(disk)),
    updateOperation: (value: Bag): Promise<void> => { disk = structuredClone(value); return Promise.resolve(); },
    writePhaseArtifact: (_id: unknown, _sequence: unknown, phase: string, payload: unknown): Promise<unknown> => {
      artifacts.set(phase, payload); return Promise.resolve({ path: `/synthetic/${phase}.json`, bytes: 1, sha256: "0".repeat(64) });
    },
    assertIssuedWindowsClockObservation: (value: unknown): Promise<unknown> => Promise.resolve(value),
    verifyCurrentDisposableOpenImplementation: noOp, verifyCurrentProjectOnlyOpenImplementation: noOp,
    CURRENT_UPLOAD_QUEUE_TIMEOUT_MS: 15_000, CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS: 15_000,
    buildCurrentUploadQueueReadProgram: (): string => "cache",
    decodeCurrentUploadQueueReadReply: noOp,
    buildCurrentProjectOnlyOpenProgram: (target: Bag): string => { assert.equal(target["expectedSourceSha256"], postedit.checkpoint.sourceSha256); return "open"; },
    decodeCurrentProjectOnlyOpenReply: (): void => { if (failure === "open-decode") { throw new Error("Synthetic project-only reply refused"); } },
    assertCurrentSymbolCacheMark: noOp, assertCurrentSymbolCacheClear: noOp,
    collectCurrentSavedSymbolContent: (_engine: unknown, generation: unknown): Promise<unknown> => {
      state.reads += 1; assert.equal(scopeActive, true); assert.ok(isRecord(generation));
      if (failure === "foreign-journal") { disk["foreign"] = true; }
      if (failure === "saved-read") { return Promise.reject(new Error("Synthetic saved content refused")); }
      return Promise.resolve(Object.freeze({ profile: "private.current-symbol-saved-read.v1", exactSavedContent: true }));
    },
    assertCurrentSavedSymbolRead: (value: unknown): unknown => value,
    currentSavedSymbolReadEvidence: (): Bag => ({ rawRetained: true, raw: { synthetic: "saved-read-raw" } }),
    assertCurrentClosedSessionTerminationObservation: noOp, assertCurrentClosedSessionCopyAuthority: noOp,
    assertClosedSessionCopyAuthority: (proof: unknown): Promise<unknown> => Promise.resolve(proof),
    captureCurrentSymbolVerificationSnapshot: (_engine: unknown, input: Bag, retain: (event: unknown) => void): Promise<unknown> => {
      state.snapshots += 1; assert.equal(input["finishSnapshot"], postedit); assert.equal(input["capture"], capture);
      retain({ kind: "inventory", value: afterInventory });
      return failure === "snapshot" ? Promise.reject(new Error("Synthetic final snapshot failed")) : Promise.resolve(finalSnapshot);
    },
    assertOriginalCurrentSymbolFinishSnapshot: (value: unknown): Bag => { assert.equal(value, postedit); return { inventory: beforeInventory }; },
    assertOriginalCurrentSymbolVerificationSnapshot: (value: unknown): Bag => { assert.equal(value, finalSnapshot); return { inventory: afterInventory }; },
    compareCompleteClosedSql: (before: unknown, after: unknown): Promise<unknown> => {
      assert.equal(before, beforeInventory); assert.equal(after, afterInventory); state.comparisons += 1;
      return failure === "comparison" ? Promise.reject(new Error("Synthetic full SQL differs")) : Promise.resolve({ exactLogicalSqlUnchanged: true });
    },
  });
  const constructor: unknown = runInContext(`${program}\nCurrentSymbolVerificationCoordinator;`, context); assert.ok(typeof constructor === "function");
  const instance: unknown = Reflect.construct(constructor, [engine]); assert.ok(isRecord(instance));
  const invokeRaw = (name: string): unknown => {
    const method = instance[name]; assert.ok(typeof method === "function");
    return Reflect.apply(method, instance, [name === "start" ? continuation : ID]) as unknown;
  };
  return { invoke: async (name): Promise<Bag> => object(await invokeRaw(name)), inspect: (): Bag => object(invokeRaw("inspect")), state, artifacts };
}
async function open(f: Harness): Promise<void> { await f.invoke("start"); await f.invoke("admit"); await f.invoke("observeCaches"); await f.invoke("openProject"); }
async function finish(f: Harness): Promise<Bag> {
  await f.invoke("finishNormalClose"); const pending = await f.invoke("observeFinish"); assert.equal(pending["termination"], "pending"); return f.invoke("observeFinish");
}

void test("private verification runs one original post-edit reopen, scoped saved read and full unchanged SQL closure", async () => {
  const f = await fixture(); await open(f); await f.invoke("collectSavedContent");
  const terminal = await finish(f);
  assert.equal(terminal["fullReopenReadbackInvariant"], true); assert.equal(terminal["executionAuthorized"], false);
  assert.equal(terminal["persistentUploadReplayExcluded"], true); assert.equal(terminal["inverseValidated"], false);
  assert.deepEqual(f.state.calls, ["cache", "open"]); assert.equal(f.state.launches, 1); assert.equal(f.state.closes, 1);
  assert.equal(f.state.reads, 1); assert.equal(f.state.snapshots, 1); assert.equal(f.state.comparisons, 1); assert.equal(f.state.releases, 1);
  assert.equal(f.state.sourceReads, 4);
  for (const method of ["start", "admit", "observeCaches", "openProject", "collectSavedContent", "finishNormalClose", "observeFinish"]) { await assert.rejects(f.invoke(method)); }
});
void test("post-edit source refusal occurs before launch or continuation transfer", async () => {
  const f = await fixture("source-before-launch"); await assert.rejects(f.invoke("start"), /source changed/u); assert.equal(f.state.launches, 0);
});
for (const failure of ["launch-clock", "admission-before-capture", "launch-clock-close-ack"] as const) {
  void test(`pre-capture original launch cleanup survives ${failure} without claiming saved-state proof`, async () => {
    const f = await fixture(failure);
    if (failure === "admission-before-capture") { await f.invoke("start"); await assert.rejects(f.invoke("admit"), /before capture/u); }
    else { await assert.rejects(f.invoke("start"), /launch clock/u); }
    await assert.rejects(f.invoke("admit"));
    await (failure === "launch-clock-close-ack" ? assert.rejects(f.invoke("finishNormalClose"), /acknowledgment lost/u) : f.invoke("finishNormalClose"));
    await assert.rejects(f.invoke("finishNormalClose"));
    const pending = await f.invoke("observeFinish"); assert.equal(pending["termination"], "pending");
    const terminal = await f.invoke("observeFinish");
    assert.equal(terminal["retired"], true); assert.equal(terminal["preCaptureTerminationObserved"], true);
    assert.equal(terminal["captureBoundClosureProved"], false); assert.equal(terminal["closedSessionCopyAuthority"], false);
    assert.equal(terminal["fullReopenReadbackInvariant"], false); assert.equal(terminal["savedContentVerified"], false);
    assert.equal(terminal["closeAcknowledged"], failure !== "launch-clock-close-ack");
    assert.equal(terminal["captureAcquisitionCleanupUncertain"], failure === "admission-before-capture");
    assert.equal(f.state.launches, 1); assert.equal(f.state.closes, 1); assert.equal(f.state.snapshots, 0);
    assert.equal(f.state.comparisons, 0); assert.equal(f.state.releases, 0); assert.equal(f.state.calls.length, 0);
    assert.ok(f.artifacts.has("verification-pre-capture-close-intent")); assert.ok(f.artifacts.has("verification-pre-capture-termination"));
    await assert.rejects(f.invoke("observeFinish")); await assert.rejects(f.invoke("start"));
  });
}
void test("cache preflight failure before first dispatch preserves normal close despite previous writer markers", async () => {
  const f = await fixture("cache-preflight"); await f.invoke("start"); await f.invoke("admit");
  await assert.rejects(f.invoke("observeCaches"), /preflight/u); const result = await finish(f);
  assert.equal(result["retired"], true); assert.equal(result["fullReopenReadbackInvariant"], false); assert.equal(f.state.calls.length, 0);
  const previous = object(object(f.artifacts.get("verification-launch-intent"))["previousJournal"]);
  assert.ok(previous["bridgeSessionBeforeOrphan"] !== undefined); assert.equal(f.state.closes, 1); assert.equal(f.state.releases, 1);
});
for (const failure of ["cache-clear-release", "open-decode", "saved-read"] as const) {
  void test(`verification retains one-shot failure and closure after ${failure}`, async () => {
    const f = await fixture(failure); await f.invoke("start"); await f.invoke("admit");
    if (failure === "cache-clear-release") { await assert.rejects(f.invoke("observeCaches"), /Synthetic/u); }
    else {
      await f.invoke("observeCaches");
      if (failure === "open-decode") { await assert.rejects(f.invoke("openProject"), /Synthetic/u); }
      else { await f.invoke("openProject"); await assert.rejects(f.invoke("collectSavedContent"), /Synthetic/u); }
    }
    const result = await finish(f); assert.equal(result["failed"], true); assert.equal(result["retired"], true);
    assert.equal(result["fullReopenReadbackInvariant"], false); assert.equal(f.state.launches, 1); assert.equal(f.state.closes, 1);
    if (failure === "cache-clear-release") { assert.equal(result["dispatchCaptureCleanupUncertain"], true); }
    if (failure === "saved-read") {
      const evidence = object(object(f.artifacts.get("verification-stopped"))["savedReadEvidence"]);
      assert.equal(evidence["rawRetained"], true); assert.deepEqual(evidence["raw"], { synthetic: "saved-read-raw" });
    }
  });
}
for (const failure of ["snapshot", "comparison"] as const) {
  void test(`verification never reuses partial ${failure} evidence or repeats its failed attempt`, async () => {
    const f = await fixture(failure); await open(f); await f.invoke("collectSavedContent"); await f.invoke("finishNormalClose"); await f.invoke("observeFinish");
    await assert.rejects(f.invoke("observeFinish"), /Synthetic/u); const retired = await f.invoke("observeFinish");
    assert.equal(retired["retired"], true); assert.equal(retired["fullReopenReadbackInvariant"], false);
    assert.equal(f.state.snapshots, 1); assert.equal(f.state.comparisons, failure === "snapshot" ? 0 : 1);
  });
}
void test("verification refuses foreign journal replacement without close or overwrite", async () => {
  const f = await fixture("foreign-journal"); await open(f); await assert.rejects(f.invoke("collectSavedContent"), /changed journal/u);
  await assert.rejects(f.invoke("finishNormalClose"), /changed journal/u);
  assert.equal(f.state.closes, 0); assert.equal(f.artifacts.has("verification-stopped"), false);
});
