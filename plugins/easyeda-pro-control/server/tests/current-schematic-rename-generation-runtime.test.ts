/** Actual coordinator source in a private realm. Boundary fixtures issue only
 * synthetic original closure/clock witnesses; these are not native validation.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { canonicalJson, isRecord, sha256Json } from "../src/core.ts";

type Bag = Record<string, unknown>;
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
function root(job: string, pid: number): Bag { return { pid, role: "easyeda-main", startIdentity: `win32:12345678901234567:job:${job}` }; }
function syntheticLeaf(): void {
  // This private VM boundary is not the leaf validator under test.
}
async function fixture(): Promise<{
  call: (name: string, args?: unknown[]) => Promise<unknown>; state: {
    ordinaryRecorded: boolean; connect: boolean; scopeFailure: boolean; decodeFailure: boolean; publicationFailure: string;
    calls: string[]; disk: Bag; lifecycleUnavailable: boolean; wrongRuntime: boolean; pending: boolean; releaseJournalDrift: boolean;
    statusCalls: number; statusFailAt: number; normalCloseAcknowledgementLost: boolean;
  };
}> {
  const id = "synthetic-schematic-generation";
  const prior = Object.freeze({ jobId: "a".repeat(32), helperInstance: "b".repeat(32), root: root("a".repeat(32), 1) });
  const launch = Object.freeze({ jobId: "c".repeat(32), helperInstance: prior.helperInstance, root: root("c".repeat(32), 2) });
  const gateway = "d".repeat(32), old = { sessionId: "e".repeat(43), sequence: 1, authenticatedAtEpochMs: 10, authenticationReceiptSha256: "f".repeat(64) };
  const selected = { sessionId: "g".repeat(43), sequence: 2, authenticatedAtEpochMs: 30, authenticationReceiptSha256: "1".repeat(64) };
  const lifecycle: Bag = { schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: gateway,
    publicEndpoint: { port: 1 }, activeSession: null, recentClosedSessions: [{ ...old, closedAtEpochMs: 20, closeReason: "closed" }] };
  const journal: Bag = { operationId: id, state: "baseline-captured", sequence: 0, artifacts: [], orphanedCallPossible: false, hardStop: false, plan: {} };
  const state = { ordinaryRecorded: true, connect: true, scopeFailure: false, decodeFailure: false, publicationFailure: "", calls: [] as string[],
    disk: structuredClone(journal), lifecycleUnavailable: false, wrongRuntime: false, pending: false, releaseJournalDrift: false,
    statusCalls: 0, statusFailAt: 0, normalCloseAcknowledgementLost: false };
  const priorCapture = Object.freeze({ synthetic: "prior-capture" }), proof = Object.freeze({ synthetic: "closed-proof" });
  const captureClock = Object.freeze({ synthetic: "capture-clock" }), launchClock = Object.freeze({ synthetic: "launch-clock" });
  const closeIntent = Object.freeze({ synthetic: "close-intent" }), closeReceipt = Object.freeze({ synthetic: "close-receipt" });
  let currentLaunch = prior, scoped: Bag | undefined;
  const closedSessions = bag(lifecycle)["recentClosedSessions"]; assert.ok(Array.isArray(closedSessions));
  const closeSession = (): void => {
    if (lifecycle["activeSession"] !== null) { closedSessions.push({ ...selected, closedAtEpochMs: 40, closeReason: "normal-close" }); }
    lifecycle["activeSession"] = null;
  };
  const runtime = {
    status: (): unknown => {
      state.statusCalls += 1; if (state.statusCalls === state.statusFailAt) { throw new Error("Synthetic original status unavailable"); }
      return { state: "owned", launch: currentLaunch };
    },
    launch: (): Promise<unknown> => { state.calls.push("launch"); currentLaunch = launch; if (state.connect) { lifecycle["activeSession"] = selected; } return Promise.resolve(launch); },
    clockObservationForLaunch: (value: unknown): Promise<unknown> => { assert.equal(value, launch); return Promise.resolve(launchClock); },
    observeApplicationWindow: (): Promise<unknown> => Promise.resolve({ outcome: "available", hwnd: "123", jobId: launch.jobId, helperInstance: launch.helperInstance }),
    prepareClosedSessionClose: (): Promise<unknown> => Promise.resolve(closeIntent),
    requestClosedSessionNormalClose: (): Promise<unknown> => { state.calls.push("close"); closeSession(); return Promise.resolve(closeReceipt); },
    normalClose: (): Promise<void> => {
      state.calls.push("normal-close"); closeSession();
      return state.normalCloseAcknowledgementLost ? Promise.reject(new Error("Synthetic ordinary-close acknowledgement lost")) : Promise.resolve();
    },
    observeLaunchTermination: (): Promise<unknown> => Promise.resolve({ jobId: launch.jobId, helperInstance: launch.helperInstance, terminated: !state.pending }),
    probeClosedSessionTermination: (): Promise<unknown> => Promise.resolve(state.pending ? { status: "pending" } : { status: "terminated", proof }),
    releaseCapture: (): Promise<void> => { state.calls.push("release-tracked"); return Promise.resolve(); },
  };
  const capture = Object.freeze({ operationId: id, phase: "closed-edit", challengeAttempt: 1, bridgeSession: { ...selected, gatewayInstanceId: gateway },
    runtimeIdentity: {}, executionAuthority: { processes: [launch.root] } });
  const fingerprint = { installedBundles: { assetsRoot: "/synthetic/assets" } };
  const engine = {
    executionAuthorityValidator: {},
    captureClosedSessionAuthority: (): Promise<unknown> => { state.calls.push("capture"); return Promise.resolve(capture); },
    releaseClosedSessionAuthority: (value: unknown): Promise<void> => {
      assert.ok(value === capture || value === priorCapture); state.calls.push(value === capture ? "release-capture" : "release-prior");
      if (state.releaseJournalDrift) { state.disk["nextSafeAction"] = "External journal evidence"; } return Promise.resolve();
    },
    clockObservationForClosedCapture: (value: unknown): Promise<unknown> => { assert.equal(value, capture); return Promise.resolve(captureClock); },
    runtimeIdentity: (): Promise<unknown> => Promise.resolve({}), status: (): Promise<unknown> => Promise.resolve({ stableFingerprint: fingerprint }),
    assertBridgeAndRecoveryAdmission: (): Promise<void> => Promise.resolve(), assertRecoveryOperationIsolated: (): Promise<void> => Promise.resolve(),
    assertBridgeDispatchAllowed: (): Promise<void> => Promise.resolve(), clockObservationForTrackedDispatch: (): Promise<unknown> => Promise.resolve(Object.freeze({ synthetic: "dispatch-clock" })),
    dispatchWithOrphanTracking: async (value: Bag, phase: string, _tool: string, _args: unknown, _timeout: number,
      before: () => Promise<void>, retain: (raw: unknown) => Promise<void>, clear: () => Promise<void>): Promise<void> => {
      assert.equal(value, journal); state.calls.push(`dispatch:${phase}`); value["orphanedCallPossible"] = true; value["phase"] = phase;
      value["executionAuthorityBeforeOrphan"] = capture.executionAuthority; value["bridgeSessionBeforeOrphan"] = capture.bridgeSession;
      value["bridgeDispatchBeforeOrphan"] = scoped; state.disk = structuredClone(journal); await before();
      await retain({ synthetic: phase }); await clear(); value["orphanedCallPossible"] = false; state.disk = structuredClone(journal);
    },
    upstream: {
      bridgeSessionLifecycle: (): unknown => state.lifecycleUnavailable ? undefined : lifecycle,
      currentAuthenticatedBridgeDispatchBinding: (): unknown => scoped,
      assertClosedAuthenticatedBridgeDispatchReleased: (): unknown => ({ ...selected, closedAtEpochMs: 40, closeReason: "normal-close" }),
      withAuthenticatedBridgeDispatchScope: async (task: (dispatch: Bag) => Promise<unknown>): Promise<unknown> => {
        scoped = { gatewayInstanceId: gateway, sessionId: selected.sessionId, sessionSequence: selected.sequence };
        try { const result = await task(scoped); if (state.scopeFailure) { throw new Error("Synthetic scope exit failure"); } return result; }
        finally { scoped = undefined; }
      },
    },
  };
  const baseline = Object.freeze({ owner: { operationId: id }, copy: { sha256: "2".repeat(64), receiptSha256: "3".repeat(64) }, history: {}, inventory: {},
    intent: { target: { projectUuid: "4".repeat(64), branchUuid: "5".repeat(32), ownerUuid: "6".repeat(32), schematicUuid: "7".repeat(16) } } });
  const source = { engine, runtime, target: { ...baseline.intent.target, documentUuid: "9".repeat(16) }, expectedFingerprint: fingerprint,
    launchProjection: prior, bridgeSession: { ...old, gatewayInstanceId: gateway }, preNavigationCheckpoint: {} };
  const closed = { original: { source }, baseline, capture: priorCapture, proof, journal, sqlRuntime: Object.freeze({ synthetic: "sql-runtime" }) }, continuation = Object.freeze({ operationId: id });
  let claimed = false;
  const context = createContext({ z, Object, Promise, Date, JSON, structuredClone, canonicalJson, isRecord, sha256Json,
    claimCurrentSchematicRenameClosedContinuation: (token: unknown, candidate: unknown, candidateRuntime: unknown): Promise<unknown> => {
      assert.equal(token, continuation); assert.equal(candidate, engine); assert.equal(candidateRuntime, runtime); assert.equal(state.wrongRuntime, false);
      assert.equal(claimed, false); claimed = true; return Promise.resolve(closed);
    },
    assertOriginalCurrentSchematicRenameBaseline: (value: unknown, candidate: unknown): unknown => { assert.equal(value, baseline); assert.equal(candidate, engine); return baseline; },
    assertCurrentSchematicRenameOpeningOwner: (value: unknown, candidate: unknown): unknown => { assert.equal(value, baseline.owner); assert.equal(candidate, engine); return closed.original; },
    revalidateCurrentSchematicRenameBaseline: (): Promise<void> => Promise.resolve(), assertWindowsRuntimeValidator: syntheticLeaf,
    assertCurrentClosedSessionCopyAuthority: (value: unknown): void => { assert.equal(value, proof); },
    assertOriginalRecordedOrdinaryTermination: (): Promise<unknown> => { state.calls.push("ordinary-record"); assert.equal(state.ordinaryRecorded, true); return Promise.resolve({ synthetic: "recorded" }); },
    assertCurrentIssuedWindowsClockObservation: (value: unknown): unknown => value,
    assertIssuedWindowsClockObservation: (value: unknown): Promise<unknown> => Promise.resolve(value),
    assertCurrentClosedSessionTerminationObservation: (value: unknown): void => {
      const status = String(bag(value)["status"]); assert.ok(["pending", "terminated"].includes(status));
    },
    loadOperation: (): Promise<unknown> => Promise.resolve(structuredClone(state.disk)), updateOperation: (value: Bag): Promise<void> => { state.disk = structuredClone(value); return Promise.resolve(); },
    writePhaseArtifact: (_operation: string, sequence: number, phase: string): Promise<unknown> => {
      state.calls.push(`artifact:${phase}`); if (phase === state.publicationFailure) { throw new Error("Synthetic publication failed"); }
      return Promise.resolve({ path: `/synthetic/${sequence}-${phase}`, bytes: 1, sha256: "8".repeat(64) });
    },
    assessCurrentStartupPremises: (input: Bag): Promise<unknown> => {
      assert.equal(input["documentUuid"], source.target.documentUuid);
      assert.notEqual(input["documentUuid"], baseline.intent.target.schematicUuid); return Promise.resolve({ historicalSubsetSatisfied: true });
    },
    buildCurrentProjectOnlyOpenProgram: (): string => "synthetic-open", buildCurrentUploadQueueReadProgram: (): string => "synthetic-caches",
    decodeCurrentProjectOnlyOpenReply: (raw: unknown): unknown => raw,
    decodeCurrentUploadQueueReadReply: (raw: unknown): unknown => { if (state.decodeFailure) { throw new Error("Synthetic decoder refused"); } return raw; },
    verifyCurrentSchematicRenamePreopenSource: (): Promise<unknown> => Promise.resolve(Object.freeze({ sourceMatchesClosedBaseline: true })),
    verifyCurrentDisposableOpenImplementation: (): Promise<void> => Promise.resolve(), verifyCurrentProjectOnlyOpenImplementation: (): Promise<void> => Promise.resolve(),
    assertCurrentSymbolCacheMark: syntheticLeaf, assertCurrentSymbolCacheClear: syntheticLeaf,
    validateSdkLocalRuntimeFingerprint: syntheticLeaf, assertExpectedFingerprint: syntheticLeaf, assertSubset: syntheticLeaf,
    CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS: 60_000, CURRENT_UPLOAD_QUEUE_TIMEOUT_MS: 45_000, testEngine: engine, testRuntime: runtime, testContinuation: continuation,
  });
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-schematic-rename-generation-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const api = bag(runInContext(`${program}\nconst stage=new CurrentSchematicRenameGenerationCoordinator(testEngine,testRuntime);
({relaunch:()=>stage.relaunch(testContinuation),admit:()=>stage.admit('${id}'),caches:()=>stage.observeCaches('${id}'),open:()=>stage.openProject('${id}'),
generation:()=>stage.generation('${id}'),assertGeneration:value=>assertCurrentProjectOnlySchematicRenameGeneration(value,testEngine),
revalidate:value=>revalidateCurrentProjectOnlySchematicRenameGeneration(value,testEngine),close:()=>stage.finishNormalClose('${id}',true),
finish:()=>stage.observeFinish('${id}'),retireClosed:()=>stage.retireClosedBaseline('${id}'),inspect:()=>stage.inspect('${id}'),
transfer:value=>transferCurrentProjectOnlySchematicRenameGeneration(value,testEngine),writerSource:value=>assertCurrentSchematicRenameWriterOwner(value,testEngine),
writerEvidence:value=>assertOriginalCurrentSchematicRenameGenerationEvidence(value,testEngine),retainedWriter:()=>stage.retainedWriterOwner('${id}'),
retainedWriterForGeneration:value=>retainedCurrentSchematicRenameWriterOwner(value,testEngine),
writerEvidenceInScope:value=>testEngine.upstream.withAuthenticatedBridgeDispatchScope(dispatch=>assertOriginalCurrentSchematicRenameGenerationEvidence(value,testEngine,canonicalJson(dispatch))),
writerFinish:value=>assertCurrentSchematicRenameWriterOwner(value,testEngine).beginFinish(),writerRetire:value=>assertCurrentSchematicRenameWriterOwner(value,testEngine).retire()});`, context));
  return { state, call: async (name: string, args: unknown[] = []): Promise<unknown> => {
    const method = api[name]; assert.ok(typeof method === "function"); return await Reflect.apply(method, undefined, args) as unknown;
  } };
}

void test("SCH fresh coordinator preserves original launch/admission/tracked opening and issues no clone authority", async () => {
  const value = await fixture(); await value.call("relaunch"); await value.call("admit"); await value.call("caches"); await value.call("open");
  const generation = await value.call("generation"), source = bag(await value.call("revalidate", [generation]));
  assert.ok(isRecord(source["baseline"])); assert.ok(isRecord(source["capture"])); assert.ok(isRecord(source["projectOpenClock"]));
  await assert.rejects(value.call("assertGeneration", [structuredClone(generation)]));
  for (const name of ["relaunch", "admit", "caches", "open"]) { await assert.rejects(value.call(name)); }
  await value.call("close"); value.state.pending = true; assert.equal(bag(await value.call("finish"))["termination"], "pending");
  value.state.pending = false; assert.equal(bag(await value.call("finish"))["retired"], true);
  await assert.rejects(value.call("assertGeneration", [generation])); assert.equal(value.state.calls.filter(call => call === "close").length, 1);
});

void test("SCH fresh coordinator requires the original recorded ordinary termination and retains failed prelaunch ownership", async () => {
  for (const key of ["ordinaryRecorded", "lifecycleUnavailable"] as const) {
    const value = await fixture(); value.state[key] = key !== "ordinaryRecorded"; await assert.rejects(value.call("relaunch"));
    const inspect = bag(await value.call("inspect")); assert.equal(inspect["launchRetained"], false); assert.equal(inspect["state"], "stopped");
    assert.equal(value.state.calls.includes("launch"), false);
    assert.equal(bag(await value.call("retireClosed"))["retired"], true); await assert.rejects(value.call("relaunch"));
  }
});

void test("SCH fresh coordinator retains acknowledged launch across publication failure and cleans up before admission", async () => {
  const value = await fixture(); value.state.publicationFailure = "schematic-relaunch-result"; await assert.rejects(value.call("relaunch"), /publication/u);
  assert.equal(bag(await value.call("inspect"))["launchRetained"], true); value.state.publicationFailure = "";
  await value.call("close"); assert.equal(bag(await value.call("finish"))["retired"], true);
  assert.equal(value.state.calls.filter(call => call === "normal-close").length, 1); assert.equal(value.state.calls.filter(call => call === "release-prior").length, 1);
});

void test("SCH held-closure retirement preserves journal drift after release instead of publishing success", async () => {
  const value = await fixture(); value.state.ordinaryRecorded = false; await assert.rejects(value.call("relaunch"));
  value.state.releaseJournalDrift = true; await assert.rejects(value.call("retireClosed"), /journal changed/u);
  assert.equal(value.state.disk["nextSafeAction"], "External journal evidence");
  assert.equal(bag(await value.call("inspect"))["retired"], false); assert.equal(value.state.calls.includes("artifact:schematic-held-closure-retired"), false);
  assert.equal(bag(await value.call("inspect"))["closedBaselineRetirementAvailable"], false);
  await assert.rejects(value.call("retireClosed")); assert.equal(value.state.calls.filter(call => call === "release-prior").length, 1);
});

void test("SCH fresh coordinator retains admission capture on scope-exit failure and permits cleanup only", async () => {
  const value = await fixture(); await value.call("relaunch"); value.state.scopeFailure = true;
  await assert.rejects(value.call("admit"), /scope exit/u); assert.equal(bag(await value.call("inspect"))["admissionCaptureRetained"], true);
  await assert.rejects(value.call("caches")); await value.call("close"); assert.equal(bag(await value.call("finish"))["retired"], true);
  assert.equal(value.state.calls.filter(call => call === "capture").length, 1);
});

void test("SCH pre-admission cleanup observes its original Job after lost ordinary-close acknowledgement without replay", async () => {
  const value = await fixture(); await value.call("relaunch"); value.state.normalCloseAcknowledgementLost = true;
  await assert.rejects(value.call("close"), /acknowledgement lost/u); assert.equal(bag(await value.call("inspect"))["closeAcknowledged"], false);
  assert.equal(bag(await value.call("inspect"))["finishObservationAvailable"], true);
  assert.equal(bag(await value.call("finish"))["retired"], true); await assert.rejects(value.call("close"));
  assert.equal(value.state.calls.filter(call => call === "normal-close").length, 1); assert.equal(value.state.calls.includes("release-capture"), false);
});

void test("SCH fresh coordinator retains decoder-refused raw result and retires only after exact closed dispatch", async () => {
  const value = await fixture(); await value.call("relaunch"); await value.call("admit"); value.state.decodeFailure = true;
  await assert.rejects(value.call("caches"), /decoder/u); const retained = bag(await value.call("inspect"));
  assert.equal(retained["cacheReplyRetained"], true); assert.equal(value.state.disk["orphanedCallPossible"], true);
  await value.call("close"); value.state.publicationFailure = "schematic-finish-close-result";
  assert.equal(bag(await value.call("finish"))["retired"], true); assert.equal(value.state.disk["orphanedCallPossible"], false);
  assert.equal(value.state.calls.filter(call => call === "release-tracked").length, 1);
});

void test("SCH cleanup keeps acknowledged close after publication failure without repeating normal close", async () => {
  const value = await fixture(); await value.call("relaunch"); await value.call("admit"); value.state.publicationFailure = "schematic-finish-close-result";
  await assert.rejects(value.call("close"), /publication/u); assert.equal(bag(await value.call("inspect"))["closeAcknowledged"], true);
  value.state.publicationFailure = ""; assert.equal(bag(await value.call("finish"))["retired"], true);
  assert.equal(value.state.calls.filter(call => call === "close").length, 1); await assert.rejects(value.call("close"));
});

void test("SCH writer transfer is one-use original ownership; historical evidence survives only until finishing", async () => {
  const value = await fixture(); await value.call("relaunch"); await value.call("admit"); await value.call("caches"); await value.call("open");
  const generation = await value.call("generation"), original = await value.call("writerEvidence", [generation]);
  assert.equal(await value.call("retainedWriterForGeneration", [generation]), undefined);
  const owner = await value.call("transfer", [generation]), source = bag(await value.call("writerSource", [owner]));
  assert.equal(source["generation"], generation); assert.equal(source["original"], original); assert.ok(isRecord(source["sqlRuntime"]));
  assert.equal(await value.call("retainedWriter"), owner); assert.equal(await value.call("writerEvidence", [generation]), original);
  assert.equal(await value.call("retainedWriterForGeneration", [generation]), owner);
  await assert.rejects(value.call("retainedWriterForGeneration", [structuredClone(generation)]));
  assert.equal(await value.call("writerEvidenceInScope", [generation]), original);
  await assert.rejects(value.call("writerSource", [structuredClone(owner)])); await assert.rejects(value.call("transfer", [generation]));
  await assert.rejects(value.call("assertGeneration", [generation])); await assert.rejects(value.call("revalidate", [generation]));
  await assert.rejects(value.call("close")); await assert.rejects(value.call("writerRetire", [owner]));
  await value.call("writerFinish", [owner]); await assert.rejects(value.call("writerEvidence", [generation]));
  await value.call("writerRetire", [owner]); await assert.rejects(value.call("writerSource", [owner]));
  const inspect = bag(await value.call("inspect")); assert.equal(inspect["writerOwnershipInvalidated"], true); assert.equal(inspect["retired"], false);
  assert.equal(value.state.calls.includes("release-capture"), false);
});

void test("SCH writer transfer retains cleanup owner even when its final original-status check throws", async () => {
  const value = await fixture(); await value.call("relaunch"); await value.call("admit"); await value.call("caches"); await value.call("open");
  const generation = await value.call("generation"); value.state.statusFailAt = value.state.statusCalls + 3;
  await assert.rejects(value.call("transfer", [generation]), /status unavailable/u); value.state.statusFailAt = 0;
  const owner = await value.call("retainedWriter"); assert.ok(isRecord(await value.call("writerSource", [owner])));
  assert.equal(await value.call("retainedWriterForGeneration", [generation]), owner);
  await assert.rejects(value.call("transfer", [generation])); await assert.rejects(value.call("assertGeneration", [generation]));
  await assert.rejects(value.call("close")); await value.call("writerFinish", [owner]); await value.call("writerRetire", [owner]);
  assert.equal(value.state.calls.includes("close"), false);
});

