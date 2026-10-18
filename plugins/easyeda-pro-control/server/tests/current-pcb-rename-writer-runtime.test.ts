/** Actual private coordinator body with synthetic imports only. These tests
 * do not issue native ownership or validate a connected rename.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";

type Bag = Record<string, unknown>;
type Failure = "none" | "post-clock" | "stopped-ack" | "comparison" | "intent" | "transfer-before" | "transfer-final" | "owner-first" | "release-drift";
const ID = "synthetic-pcb-rename-writer";
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
function noOp(): undefined { return undefined; }
async function fixture(failure: Failure = "none"): Promise<{
  start: (wrongStartup?: boolean) => Promise<unknown>; close: () => Promise<unknown>; finish: () => Promise<Bag>;
  inspect: () => Bag; continuation: () => unknown; assertContinuation: (token: unknown) => unknown; transferContinuation: (token: unknown) => unknown;
  state: { transferred: boolean; finishing: boolean; retired: boolean; active: boolean; calls: string[]; clocks: number; writes: number; closes: number; comparisons: number; releases: number };
  values: Map<string, unknown>; preparation: Bag; writeResult: Bag; raw: object;
}> {
  const generation = Object.freeze({ operationId: ID, profile: "private.current-project-only-pcb-rename-generation.v1" });
  const lease = Object.freeze({ synthetic: "lease" }), startup = Object.freeze({ synthetic: "original-startup" });
  const actor = { uuid: "c".repeat(32), username: "UI", nickname: "UI" };
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), pcbUuid: "d".repeat(16), ownerUuid: "f".repeat(32) };
  const preparation = Object.freeze({ target, desiredTitle: "Renamed PCB" });
  const nativeBinding = Object.freeze({ synthetic: "original-binding" });
  const storedEffect = Object.freeze({ synthetic: "original-stored-effect" });
  const comparison = Object.freeze({ exactLogicalSqlEffect: true });
  const after = Object.freeze({ synthetic: "original-after" }), before = Object.freeze({ synthetic: "original-before" });
  const baseline = { copy: { receiptSha256: "0".repeat(64) }, inventory: before, intent: preparation };
  const session = { sessionId: "original", sequence: 2, authenticationReceiptSha256: "f".repeat(64), authenticatedAtEpochMs: 1000 };
  const root = { role: "easyeda-main", startIdentity: "win32:11111111111111111:job:fixture-job" };
  const launch = { root, jobId: "fixture-job", helperInstance: "fixture-helper" };
  const capture = { operationId: ID, phase: "closed-edit", challengeAttempt: 1, bridgeSession: session, runtimeIdentity: {}, executionAuthority: {} };
  const journal: Bag = { operationId: ID, plan: { profile: "baseline" }, artifacts: [], sequence: 18, state: "project-only-opened", hardStop: false, orphanedCallPossible: false };
  let disk = structuredClone(journal);
  const state = { transferred: false, finishing: false, retired: false, active: false, calls: [] as string[], clocks: 0, writes: 0, closes: 0, comparisons: 0, releases: 0 };
  const values = new Map<string, unknown>();
  const raw = Object.freeze({ synthetic: "original-write-raw" }), sample = { rendererTimezoneOffsetMinutes: 0, synthetic: "document-clock" };
  const metadata = Object.freeze({ title: "renamed pcb", displayTitle: "Renamed PCB" });
  const writeResult = Object.freeze({ acknowledged: metadata, after: metadata, documentAfter: sample });
  const runtime = {
    observeApplicationWindow: (): Promise<unknown> => Promise.resolve({ outcome: "available", hwnd: "9", jobId: launch.jobId, helperInstance: launch.helperInstance }),
    prepareClosedSessionClose: (): Promise<unknown> => Promise.resolve({ synthetic: "intent" }),
    requestClosedSessionNormalClose: (): Promise<unknown> => { state.closes += 1; return Promise.resolve({ synthetic: "receipt" }); },
    probeClosedSessionTermination: (): Promise<unknown> => Promise.resolve({ status: "terminated", proof: { synthetic: "original-proof" } }),
    releaseCapture: (): Promise<void> => { state.releases += 1; return Promise.resolve(); },
  };
  const original = { source: { target, purpose: "disposable-validation", runtime, expectedFingerprint: { installedBundles: { assetsRoot: "/synthetic/assets" } } },
    baseline, capture, launch, launchClock: {}, captureClock: {} };
  const owner = Object.freeze({ operationId: ID, profile: "private.current-pcb-rename-writer-owner.v1" });
  const source = { generation, original, journal, sqlRuntime: {},
    current: (): void => { assert.equal(state.retired, false); },
    beginFinish: (): void => { assert.equal(state.finishing, false); state.finishing = true; },
    retire: (): void => { assert.equal(state.finishing, true); state.retired = true; } };
  const generationCurrent = (received: unknown): typeof original => {
    assert.equal(received, generation); assert.equal(state.finishing, false); assert.equal(state.retired, false);
    // The actual baseline generation contract checks this exact namespace once
    // Its one-way transfer exists. Do not substitute a no-op startup validator.
    if (state.transferred) { assert.equal(bag(journal["plan"])["profile"], "easyeda-pro-control.current-pcb-rename-writer.v1"); }
    else { assert.equal(journal["state"], "project-only-opened"); }
    return original;
  };
  const startupOriginal = Object.freeze({ expectation: { sheetUuids: [], templates: [] }, observation: { runtimeObservation: { actor } } });
  const startupAssert = (received: unknown, _engine: unknown, observedGeneration: unknown): typeof startupOriginal => {
    assert.equal(received, startup, "Original startup required"); generationCurrent(observedGeneration); return startupOriginal;
  };
  const mark = (): void => { Object.assign(journal, { orphanedCallPossible: true, bridgeDispatchBeforeOrphan: lease,
    bridgeSessionBeforeOrphan: session, executionAuthorityBeforeOrphan: { processes: [root] } }); disk = structuredClone(journal); };
  const clear = (): void => { journal["orphanedCallPossible"] = false; disk = structuredClone(journal); };
  const engine = {
    upstream: {
      currentAuthenticatedBridgeDispatchBinding: (): object | undefined => state.active ? lease : undefined,
      withAuthenticatedBridgeDispatchScope: async (task: (binding: object) => Promise<void>): Promise<void> => {
        state.active = true; try { await task(lease); } finally { state.active = false; }
      },
      callTool: (_name: unknown, args: Bag): Promise<unknown> => {
        const code = String(args["code"]); state.calls.push(code);
        if (code !== "rename") { return Promise.resolve({ synthetic: code }); }
        state.writes += 1; return Promise.resolve(raw);
      },
      bridgeSessionLifecycle: (): Bag => ({ activeSession: null }),
      assertClosedAuthenticatedBridgeDispatchReleased: (): Bag => ({ ...session, closedAtEpochMs: 2000 }),
    },
    assertBridgeDispatchAllowed: (): Promise<void> => Promise.resolve(), assertRecoveryOperationIsolated: (): Promise<void> => Promise.resolve(),
    freshClockObservationForClosedCapture: (): Promise<unknown> => {
      state.clocks += 1;
      return state.clocks === 3 && failure === "post-clock" ? Promise.reject(new Error("Synthetic post clock lost")) : Promise.resolve({ synthetic: state.clocks });
    },
    markOrphanedCallRisk: (): Promise<unknown> => { mark(); return Promise.resolve({ binding: lease }); },
    clearOrphanedCallRisk: (): Promise<void> => { clear(); return Promise.resolve(); },
    dispatchWithOrphanTracking: async (_journal: unknown, _phase: unknown, name: unknown, args: Bag, _timeout: unknown,
      beforeDispatch: () => Promise<void>, retain: (reply: unknown) => Promise<void>, beforeClear: () => Promise<void>): Promise<unknown> => {
      mark(); await beforeDispatch(); const reply = await engine.upstream.callTool(name, args); await retain(reply); await beforeClear(); clear(); return reply;
    },
    releaseClosedSessionAuthority: (): Promise<void> => {
      state.releases += 1; if (failure === "release-drift") { disk["external"] = "changed"; } return Promise.resolve();
    },
  };
  const originalSnapshot = Object.freeze({ inventory: after }), snapshot = Object.freeze({ synthetic: "original-pcb-snapshot" });
  let dispatchOwner: unknown, ownerChecks = 0;
  const context = createContext({ Object, Reflect, Map, Date, Promise, AggregateError, structuredClone,
    canonicalJson, isRecord, sha256Json, sha256Text, buildPlanHash: sha256Json,
    assertExpectedFingerprint: noOp, validateSdkLocalRuntimeFingerprint: noOp, assertUpstreamReplySettled: noOp,
    verifyCurrentProjectOnlySymbolPreflightImplementation: noOp, verifyCurrentSymbolPersistenceImplementation: noOp,
    assertCurrentProjectOnlyPcbRenameGeneration: generationCurrent, revalidateCurrentProjectOnlyPcbRenameGeneration: generationCurrent,
    assertOriginalCurrentPcbRenameStartup: startupAssert, revalidateCurrentPcbRenameStartupObservation: startupAssert,
    transferCurrentProjectOnlyPcbRenameGeneration: (received: unknown): typeof owner => {
      generationCurrent(received); assert.equal(state.transferred, false);
      if (failure === "transfer-before") { throw new Error("Synthetic transfer refused before commitment"); }
      state.transferred = true;
      if (failure === "transfer-final") { throw new Error("Synthetic postcommit transfer guard refused"); } return owner;
    },
    retainedCurrentPcbRenameWriterOwner: (received: unknown): typeof owner | undefined => {
      assert.equal(received, generation); return state.transferred ? owner : undefined;
    },
    assertCurrentPcbRenameWriterOwner: (received: unknown): typeof source => {
      assert.equal(received, owner); ownerChecks += 1;
      if (failure === "owner-first" && ownerChecks === 1) { throw new Error("Synthetic first owner guard refused"); }
      source.current(); return source;
    },
    inventoryForOriginalCurrentPcbRenamePreparation: (plan: unknown): typeof before => { assert.equal(plan, preparation); return before; },
    loadOperation: (): Promise<Bag> => Promise.resolve(structuredClone(disk)),
    updateOperation: (next: Bag): Promise<void> => { disk = structuredClone(next); return Promise.resolve(); },
    writePhaseArtifact: (_id: unknown, _sequence: unknown, phase: string, value: unknown): Promise<unknown> => {
      values.set(phase, value);
      if (phase === "pcb-rename-writer-dispatch-intent" && failure === "intent") { return Promise.reject(new Error("Synthetic intent failed")); }
      return Promise.resolve({ path: `/synthetic/${phase}.json`, bytes: 1, sha256: "0".repeat(64) });
    },
    assertCurrentSymbolCacheMark: noOp, assertCurrentSymbolCacheClear: noOp,
    buildCurrentPcbRenameWriterClockProgram: (): string => "clock", decodeCurrentPcbRenameWriterClockReply: (): typeof sample => sample,
    prepareCurrentPcbRenameClock: (input: Bag): Promise<Bag> => {
      assert.equal(input["generation"], generation); assert.equal(input["startup"], startup); dispatchOwner = input["dispatchOwner"];
      return Promise.resolve({ backendWindow: {}, documentWindow: {} });
    },
    assertOriginalCurrentPcbRenameClock: (): Bag => ({ preparation, binding: nativeBinding }),
    buildCurrentPcbRenameProgram: (plan: unknown, bindingValue: unknown, input: Bag): string => {
      assert.equal(plan, preparation); assert.equal(bindingValue, nativeBinding); assert.equal(input["expectedActor"], actor); return "rename";
    },
    CURRENT_PCB_RENAME_TIMEOUT_MS: 15_000,
    decodeCurrentPcbRenameReply: (reply: unknown): typeof writeResult => {
      assert.equal(reply, raw); if (failure === "stopped-ack") { throw new Error("Synthetic native stopped"); } return writeResult;
    },
    decodeCurrentPcbRenameStoppedReply: (reply: unknown): Bag => {
      assert.equal(reply, raw); assert.equal(failure, "stopped-ack"); return { acknowledged: metadata, nativeReturnAcknowledged: true, failureStage: "ACK" };
    },
    recordCurrentPcbRenameClockPost: (_plan: unknown, input: Bag): Promise<void> => {
      assert.equal(input["dispatchOwner"], dispatchOwner); assert.equal(input["result"], writeResult); return Promise.resolve();
    },
    assertCurrentClosedSessionTerminationObservation: noOp, assertCurrentClosedSessionCopyAuthority: noOp,
    assertClosedSessionCopyAuthority: (proof: unknown): Promise<unknown> => Promise.resolve(proof),
    captureCurrentPcbRenameFinishSnapshot: (_engine: unknown, input: Bag, retain: (event: unknown) => void): Promise<unknown> => {
      assert.equal(input["baseline"], baseline); retain({ kind: "inventory", value: after }); return Promise.resolve(snapshot);
    },
    assertOriginalCurrentPcbRenameSnapshot: (received: unknown): typeof originalSnapshot => { assert.equal(received, snapshot); return originalSnapshot; },
    assertOriginalCurrentPcbRenameBaseline: (received: unknown): void => { assert.equal(received, baseline); },
    revalidateCurrentPcbRenameSnapshot: (_engine: unknown, received: unknown): void => { assert.equal(received, snapshot); assert.equal(state.releases, 0); },
    compareCompleteClosedSql: (): Promise<unknown> => state.writes === 0 ? Promise.resolve({}) : Promise.reject(new Error("Synthetic SQL changed")),
    verifyCurrentPcbRenameClockEffect: (_plan: unknown, input: Bag): Promise<unknown> => {
      assert.equal(input["after"], after); assert.equal(input["dispatchOwner"], dispatchOwner); state.comparisons += 1;
      return failure === "comparison" ? Promise.reject(new Error("Synthetic SQL refused")) : Promise.resolve(comparison);
    },
    completedCurrentPcbRenameClockSource: (): Bag => ({ preparation, binding: nativeBinding, storedEffect, comparison }),
  });
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-pcb-rename-writer-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const constructor: unknown = runInContext(`${program}\nCurrentPcbRenameWriterCoordinator;`, context); assert.ok(typeof constructor === "function");
  const instance = bag(Reflect.construct(constructor, [engine]));
  const invoke = (name: string, args: unknown[] = []): unknown => { const method = instance[name]; assert.ok(typeof method === "function"); return Reflect.apply(method, instance, args) as unknown; };
  const exported = bag(runInContext("({ assertOriginalCurrentPcbRenameWriterContinuation, transferCurrentPcbRenameWriterContinuation })", context));
  const transfer = (name: string, token: unknown): unknown => {
    const fn = exported[name]; assert.ok(typeof fn === "function"); return Reflect.apply(fn, undefined, [token, engine]) as unknown;
  };
  return { state, values, preparation, writeResult, raw,
    start: async wrongStartup => await invoke("execute", [generation, wrongStartup === true ? structuredClone(startup) : startup]),
    close: async () => await invoke("finishNormalClose", [ID]), finish: async () => bag(await invoke("observeFinish", [ID])),
    inspect: () => bag(invoke("inspect", [ID])), continuation: () => invoke("getVerificationContinuation", [ID]),
    assertContinuation: token => transfer("assertOriginalCurrentPcbRenameWriterContinuation", token),
    transferContinuation: token => transfer("transferCurrentPcbRenameWriterContinuation", token) };
}

void test("PCB writer consumes original startup once, retains exact native reply and transfers only after closed SQL retirement", async () => {
  const f = await fixture(); await assert.rejects(f.start(true), /Original startup required/u); assert.equal(f.state.transferred, false);
  await f.start(); assert.deepEqual(f.state.calls, ["clock", "rename"]); assert.equal(f.state.writes, 1); assert.throws(f.continuation);
  assert.equal(f.inspect()["nativeAcknowledgedMetadata"], f.writeResult["acknowledged"]);
  await assert.rejects(f.start(), /already consumed/u); await f.close(); await assert.rejects(f.close());
  const result = await f.finish(); assert.equal(result["retired"], true); assert.equal(result["executionAuthorized"], false);
  const token = f.continuation(); const source = bag(f.assertContinuation(token));
  assert.equal(source["preparation"], f.preparation); assert.equal(source["writeResult"], f.writeResult);
  assert.throws(() => f.assertContinuation(structuredClone(token)), /not issued/u);
  assert.equal(f.transferContinuation(token), source); assert.throws(() => f.transferContinuation(token), /consumed/u);
  assert.equal(f.state.closes, 1); assert.equal(f.state.comparisons, 1); assert.equal(f.state.releases, 1);
});
for (const failure of ["transfer-final", "owner-first"] as const) {
  void test(`PCB writer retains committed owner for cleanup after ${failure} failure without replay`, async () => {
    const f = await fixture(failure); await assert.rejects(f.start(), /guard refused/u);
    assert.equal(f.inspect()["ownerRetained"], true); assert.equal(f.state.writes, 0);
    await assert.rejects(f.start(), /already consumed/u); await f.close(); const result = await f.finish();
    assert.equal(result["retired"], true); assert.equal(bag(result["recoveryClassification"])["outcome"], "unchanged");
    assert.equal(f.state.closes, 1); assert.throws(f.continuation);
  });
}
for (const failure of ["post-clock", "stopped-ack"] as const) {
  void test(`PCB writer retains native acknowledgment through ${failure} without retry or continuation`, async () => {
    const f = await fixture(failure); await assert.rejects(f.start());
    const before = f.inspect(); assert.equal(before["nativeAcknowledgedMetadata"], f.writeResult["acknowledged"]);
    assert.equal(before["nativeReturnAcknowledged"], true); assert.equal(before["postRecorded"], false);
    assert.equal(f.state.clocks, failure === "post-clock" ? 3 : 2);
    assert.equal(bag(f.values.get("pcb-rename-writer-stopped"))["writeRaw"], f.raw);
    await assert.rejects(f.start(), /already consumed/u); await f.close(); const result = await f.finish();
    assert.equal(result["retired"], true); assert.equal(bag(result["recoveryClassification"])["outcome"], "unresolved");
    assert.equal(f.state.writes, 1); assert.equal(f.state.comparisons, 0); assert.throws(f.continuation);
  });
}
void test("PCB writer intent and full SQL refusals cannot retry consumed dispatch or comparison", async () => {
  const intent = await fixture("intent"); await assert.rejects(intent.start(), /intent failed/u); assert.equal(intent.state.writes, 0);
  await intent.close(); const intentResult = await intent.finish();
  assert.equal(bag(intentResult["recoveryClassification"])["outcome"], "unchanged"); assert.throws(intent.continuation);
  const comparison = await fixture("comparison"); await comparison.start(); await comparison.close(); await assert.rejects(comparison.finish(), /SQL refused/u);
  assert.throws(comparison.continuation); const comparisonResult = await comparison.finish(); assert.equal(comparisonResult["retired"], true);
  assert.equal(comparison.state.comparisons, 1); assert.equal(comparison.state.writes, 1); assert.throws(comparison.continuation);
});
void test("PCB writer release-await journal drift cannot overwrite external evidence or publish a continuation", async () => {
  const f = await fixture("release-drift"); await f.start(); await f.close();
  await assert.rejects(f.finish(), (error: unknown): boolean => error instanceof AggregateError &&
    error.errors.length === 2 && String(error.errors[0]).includes("journal changed") && String(error.errors[1]).includes("changed journal"));
  assert.equal(f.state.releases, 1); assert.equal(f.inspect()["retired"], false); assert.throws(f.continuation); await assert.rejects(f.finish());
  assert.equal(f.inspect()["cleanupCloseAvailable"], false); assert.equal(f.inspect()["finishObservationAvailable"], false);
  assert.equal(f.state.releases, 1);
});

void test("PCB writer precommit refusal leaves no writer close authority and cannot retry transfer", async () => {
  const f = await fixture("transfer-before"); await assert.rejects(f.start(), /before commitment/u);
  assert.equal(f.state.transferred, false); assert.equal(f.inspect()["ownerRetained"], false); assert.equal(f.inspect()["cleanupCloseAvailable"], false);
  await assert.rejects(f.start(), /already consumed/u); await assert.rejects(f.close(), /did not retain an owner/u);
  assert.equal(f.state.writes, 0); assert.equal(f.state.closes, 0); assert.equal(f.state.releases, 0);
});

