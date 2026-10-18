/** Actual coordinator body with synthetic owners and I/O. This does not issue
 * a Windows/startup authority or validate a connected native writer.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";
import { currentProjectOnlySymbolPreflightRequestSchema } from "../src/current-project-only-symbol-preflight.ts";
import { CURRENT_SYMBOL_WRITE_TIME_CEILING, CURRENT_SYMBOL_WRITE_WINDOW_MS } from "../src/current-symbol-write-program.ts";

type Bag = Record<string, unknown>;
type Failure = "none" | "post-clock" | "post-clock-unchanged" | "owner-after-write" | "late-clock-plan" | "comparison" | "intent-write" | "transfer-write" | "snapshot" | "journal-drift" | "snapshot-revalidate" | "retirement-release" |
  "preflight-mark-cleanup" | "preflight-clear-release" | "writer-mark-cleanup" | "writer-clear-release";
interface TestCoordinator {
  finishNormalClose: (operationId: string) => Promise<Bag>;
  observeFinish: (operationId: string) => Promise<Bag>;
  inspect: (operationId: string) => Bag;
  continuation: (operationId: string) => unknown;
}
function noOp(): undefined { return undefined; }
function record(result: unknown): Bag { assert.ok(isRecord(result)); return result; }
interface CanvasFixture {
  readonly maximumTargetHeaderTime: number; readonly remainingWrites: 1 | 2;
  readonly purpose?: "disposable-validation" | "ordinary-symbol-metadata";
  readonly maximumMs?: number;
}
async function fixture(failure: Failure = "none", canvas?: CanvasFixture): Promise<{
  coordinator: TestCoordinator; start: () => Promise<unknown>; wrongStartup: () => Promise<unknown>;
  state: { alive: boolean; transferred: boolean; active: boolean; calls: string[]; clocks: number; mutations: number;
    closeCalls: number; probes: number; writes: string[]; releases: number; snapshots: number; comparisons: number };
  values: Map<string, unknown>; original: Bag; writeRaw: object;
  assertContinuation: (value: unknown) => unknown; transferContinuation: (value: unknown) => unknown;
}> {
  const generation = Object.freeze({ profile: "private.current-project-only-symbol-generation.v1", operationId: "synthetic-current-writer" });
  const aged = Object.freeze({ synthetic: "original-age" }), startup = Object.freeze({ synthetic: "original-startup" });
  const actor = { uuid: "c".repeat(32), username: "Fixture", nickname: "Fixture" };
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ownerUuid: "d".repeat(32), symbolUuid: "e".repeat(16) };
  const value = { ...target, name: "Before", description: "Before description", tagsJson: "[]", source: "", version: "1000", ticket: 3 };
  const before = { name: value.name, description: value.description, tags: [], source: value.source };
  const session = { sessionId: "original", sequence: 2, authenticationReceiptSha256: "f".repeat(64), authenticatedAtEpochMs: 1000 };
  const root = { role: "easyeda-main", pid: 123, startIdentity: "win32:11111111111111111:job:fixture-job" };
  const capture = { operationId: generation.operationId, phase: "closed-edit", challengeAttempt: 1, bridgeSession: session, runtimeIdentity: {}, executionAuthority: {} };
  const launch = { root, jobId: "fixture-job", helperInstance: "fixture-helper" }, lease = { synthetic: "scope" };
  const journal: Bag = { operationId: generation.operationId, schema: "synthetic-journal", plan: { profile: "baseline" },
    artifacts: [], sequence: 18, state: "project-only-opened", hardStop: false, orphanedCallPossible: false };
  let disk = structuredClone(journal);
  const state = { alive: true, transferred: false, active: false, calls: [] as string[], clocks: 0, mutations: 0,
    closeCalls: 0, probes: 0, writes: [] as string[], releases: 0, snapshots: 0, comparisons: 0 };
  const values = new Map<string, unknown>();
  const sample = { rendererBeforeMs: 1001, serverTimeMs: 1002, rendererAfterMs: 1003, rendererBeforeIso: "synthetic", rendererAfterIso: "synthetic",
    rendererTimezoneOffsetMinutes: 0, notifyTabId: "1".repeat(16) };
  const writeRaw = Object.freeze({ synthetic: "original-write-raw" });
  const runtime = {
    observeApplicationWindow: (): Promise<unknown> => Promise.resolve({ outcome: "available", hwnd: "9", jobId: launch.jobId, helperInstance: launch.helperInstance }),
    prepareClosedSessionClose: (): Promise<unknown> => Promise.resolve({ synthetic: "close-intent" }),
    requestClosedSessionNormalClose: (): Promise<unknown> => { state.closeCalls += 1; return Promise.resolve({ synthetic: "close-receipt" }); },
    probeClosedSessionTermination: (): Promise<unknown> => {
      state.probes += 1;
      return Promise.resolve(state.probes === 1 ? { status: "pending" } : { status: "terminated", proof: { synthetic: "original-proof" } });
    },
    releaseCapture: (): Promise<void> => { state.releases += 1; return Promise.resolve(); },
  };
  const baseline = { copy: { receiptSha256: "0".repeat(64) }, inventory: { synthetic: "original-before" },
    preparation: { target, patch: { name: "After" }, metadata: { before, after: { ...before, name: "After" }, peerNames: [] } } };
  const original = { source: { purpose: canvas?.purpose ?? "disposable-validation", runtime, expectedFingerprint: { installedBundles: { assetsRoot: "/synthetic/assets" } } }, baseline, capture, launch,
    launchClock: { synthetic: "launch" }, captureClock: { synthetic: "capture" },
    originalPreparation: { closedTargetWitness: { observation: { value, runtimeObservation: { actor } } } } };
  const owner = Object.freeze({ profile: "private.current-symbol-writer-owner.v1", operationId: generation.operationId });
  const source = { generation, original, journal, sqlRuntime: {}, current: (): void => { assert.equal(state.alive, true, "Synthetic owner lost"); },
    beginFinish: (): void => { state.active = false; }, retire: noOp };
  const marked = (): void => {
    Object.assign(journal, { orphanedCallPossible: true, bridgeDispatchBeforeOrphan: lease, bridgeSessionBeforeOrphan: session,
      executionAuthorityBeforeOrphan: { processes: [root] } }); disk = structuredClone(journal);
  };
  const cleared = (): void => { journal["orphanedCallPossible"] = false; disk = structuredClone(journal); };
  const engine = {
    upstream: {
      currentAuthenticatedBridgeDispatchBinding: (): object | undefined => state.active ? lease : undefined,
      withAuthenticatedBridgeDispatchScope: async (task: (binding: object) => Promise<void>): Promise<void> => {
        state.active = true; try { await task(lease); } finally { state.active = false; }
      },
      callTool: (_name: string, args: Bag): Promise<unknown> => {
        const code = args["code"]; assert.equal(typeof code, "string");
        state.calls.push(String(code));
        if (code === "preflight") { return Promise.resolve({ synthetic: "preflight" }); }
        if (code === "clock") { return Promise.resolve({ synthetic: "clock" }); }
        assert.equal(code, "write"); state.mutations += 1;
        if (failure === "owner-after-write") { state.alive = false; }
        if (failure === "journal-drift") { disk["externalMarker"] = "unrelated journal edit"; }
        return Promise.resolve(writeRaw);
      },
      bridgeSessionLifecycle: (): Bag => ({ activeSession: null }),
      assertClosedAuthenticatedBridgeDispatchReleased: (): Bag => ({ ...session, closedAtEpochMs: 2000 }),
    },
    assertBridgeDispatchAllowed: (): Promise<void> => Promise.resolve(),
    assertRecoveryOperationIsolated: (id: string): Promise<void> => { assert.equal(id, generation.operationId); return Promise.resolve(); },
    freshClockObservationForClosedCapture: (received: unknown): Promise<unknown> => {
      assert.equal(received, capture); state.clocks += 1;
      if (state.clocks === 3 && (failure === "post-clock" || failure === "post-clock-unchanged")) { return Promise.reject(new Error("Synthetic post-clock failure")); }
      return Promise.resolve(Object.freeze({ synthetic: `clock-${state.clocks}` }));
    },
    markOrphanedCallRisk: async (_journal: unknown, _phase: unknown, beforeClear: () => Promise<void>): Promise<unknown> => {
      marked();
      if (failure === "writer-mark-cleanup") { await beforeClear(); cleared(); throw new Error("Synthetic mark cleanup after reproof failed"); }
      return { ownedByAuthenticatedScope: true, binding: lease };
    },
    clearOrphanedCallRisk: (): Promise<void> => {
      cleared();
      if (failure === "writer-clear-release") { return Promise.reject(new Error("Synthetic release after durable clear failed")); }
      return Promise.resolve();
    },
    dispatchWithOrphanTracking: async (_journal: unknown, _phase: unknown, name: string, args: Bag, _timeout: unknown,
      beforeDispatch: () => Promise<void>, retain: (raw: unknown) => Promise<void>, beforeClear: () => Promise<void>): Promise<unknown> => {
      marked();
      if (failure === "preflight-mark-cleanup") { await beforeClear(); cleared(); throw new Error("Synthetic preflight mark cleanup failed"); }
      await beforeDispatch(); const raw = await engine.upstream.callTool(name, args); await retain(raw); await beforeClear(); cleared();
      if (failure === "preflight-clear-release") { throw new Error("Synthetic preflight release after durable clear failed"); }
      return raw;
    },
    releaseClosedSessionAuthority: (received: unknown): Promise<void> => {
      assert.equal(received, capture); state.releases += 1;
      return failure === "retirement-release" ? Promise.reject(new Error("Synthetic retirement release failure")) : Promise.resolve();
    },
  };
  const inventory = Object.freeze({ tables: [], synthetic: "original-after" }), snapshot = Object.freeze({ snapshotCaptured: true });
  const originalSnapshot = Object.freeze({ inventory });
  let dispatchOwner: unknown;
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-symbol-writer-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const startupAssert = (received: unknown): Bag => {
    assert.equal(received, startup, "Original startup missing");
    return { expectation: { sheetUuids: ["2".repeat(16)], templates: [] }, ...(canvas === undefined ? {} : {
      canvasClock: Object.freeze({ maximumTargetHeaderTime: canvas.maximumTargetHeaderTime, remainingWrites: canvas.remainingWrites }),
    }) };
  };
  const context = createContext({ Object, Reflect, Map, Date, Promise, AggregateError, structuredClone,
    canonicalJson, isRecord, sha256Json, sha256Text, buildPlanHash: sha256Json, assertExpectedFingerprint: noOp,
    validateSdkLocalRuntimeFingerprint: noOp, assertUpstreamReplySettled: noOp, currentProjectOnlySymbolPreflightRequestSchema,
    verifyCurrentProjectOnlySymbolPreflightImplementation: noOp, verifyCurrentSymbolPersistenceImplementation: noOp,
    assertCurrentProjectOnlySymbolGeneration: (): typeof original => { source.current(); return original; },
    revalidateCurrentProjectOnlySymbolGeneration: noOp,
    assertCurrentSymbolWriterStartup: startupAssert, revalidateCurrentSymbolWriterStartup: startupAssert,
    assertOriginalCurrentSymbolBaselineCopy: (received: unknown): typeof baseline => { assert.equal(received, baseline); return baseline; },
    compareCompleteClosedSql: (beforeInventory: unknown, afterInventory: unknown): Promise<unknown> => {
      assert.equal(beforeInventory, baseline.inventory); assert.equal(afterInventory, inventory);
      return state.mutations === 0 || failure === "post-clock-unchanged" ? Promise.resolve({ exactLogicalSqlUnchanged: true }) : Promise.reject(new Error("Synthetic SQL changed"));
    },
    transferCurrentProjectOnlySymbolGeneration: (): typeof owner => { assert.equal(state.transferred, false); state.transferred = true; return owner; },
    assertCurrentSymbolWriterOwner: (received: unknown): typeof source => { assert.equal(received, owner); source.current(); return source; },
    loadOperation: (): Promise<Bag> => Promise.resolve(structuredClone(disk)),
    updateOperation: (next: Bag): Promise<void> => { disk = structuredClone(next); return Promise.resolve(); },
    writePhaseArtifact: (_id: unknown, _sequence: unknown, phase: string, payload: unknown): Promise<unknown> => {
      state.writes.push(phase); values.set(phase, payload);
      if (phase === "writer-dispatch-intent" && failure === "intent-write") { return Promise.reject(new Error("Synthetic intent publication failed")); }
      if (phase === "writer-ownership-transfer" && failure === "transfer-write") { return Promise.reject(new Error("Synthetic transfer publication failed")); }
      return Promise.resolve({ path: `/synthetic/${phase}.json`, bytes: 1, sha256: "0".repeat(64) });
    },
    assertCurrentSymbolCacheMark: noOp, assertCurrentSymbolCacheClear: noOp,
    buildCurrentProjectOnlySymbolPreflightProgram: (): string => "preflight",
    decodeCurrentProjectOnlySymbolPreflightReply: (): Bag => ({ runtimeObservation: { actor }, clientTicketObservation: { client: "f".repeat(16), maxTicket: 3 } }),
    buildCurrentSymbolWriterClockProgram: (): string => "clock", decodeCurrentSymbolWriterClockReply: (): typeof sample => sample,
    qualifyCurrentAgedSqlHead: (received: unknown): Bag => { assert.equal(received, aged); return { synthetic: "aged" }; },
    prepareCurrentSymbolTransactionClock: (input: Bag): Promise<Bag> => {
      assert.equal(input["before"], baseline.inventory); dispatchOwner = input["dispatchOwner"];
      if (failure === "late-clock-plan") { return Promise.reject(new Error("Synthetic expired clock plan")); }
      const maximumMs = canvas?.maximumMs ?? 61_002;
      return Promise.resolve({ backendWindow: { minimumMs: 1000, maximumMs: 61_000 }, documentWindow: { minimumMs: maximumMs - CURRENT_SYMBOL_WRITE_WINDOW_MS, maximumMs } });
    },
    buildCurrentSymbolWriteProgram: (input: Bag): string => { assert.deepEqual(input["startup"], { sheetUuids: ["2".repeat(16)], templates: [] }); return "write"; },
    CURRENT_SYMBOL_WRITE_TIMEOUT_MS: 15_000,
    CURRENT_SYMBOL_WRITE_TIME_CEILING, CURRENT_SYMBOL_WRITE_WINDOW_MS,
    decodeCurrentSymbolWriteReply: (raw: unknown): Bag => { assert.equal(raw, writeRaw); return { documentAfter: sample }; },
    recordCurrentSymbolTransactionClockPost: (_plan: unknown, input: Bag): Promise<void> => { assert.equal(input["dispatchOwner"], dispatchOwner); return Promise.resolve(); },
    assertCurrentClosedSessionTerminationObservation: noOp, assertCurrentClosedSessionCopyAuthority: noOp,
    assertClosedSessionCopyAuthority: (proof: unknown): Promise<unknown> => Promise.resolve(proof),
    captureCurrentSymbolFinishSnapshot: (_engine: unknown, _input: unknown, retain: (event: unknown) => void): Promise<unknown> => {
      state.snapshots += 1; retain({ kind: "inventory", value: inventory });
      if (failure === "snapshot") { return Promise.reject(new Error("Synthetic snapshot final reproof refused")); }
      return Promise.resolve(snapshot);
    },
    assertOriginalCurrentSymbolFinishSnapshot: (received: unknown): Bag => { assert.equal(received, snapshot); return originalSnapshot; },
    revalidateCurrentSymbolFinishSnapshot: (_engine: unknown, received: unknown): Promise<void> => {
      assert.equal(received, snapshot); assert.equal(state.releases, 0);
      return failure === "snapshot-revalidate" ? Promise.reject(new Error("Synthetic snapshot revalidation refused")) : Promise.resolve();
    },
    verifyCurrentSymbolTransactionClock: (_plan: unknown, input: Bag): Promise<unknown> => {
      assert.equal(input["dispatchOwner"], dispatchOwner); state.comparisons += 1;
      if (failure === "comparison") { return Promise.reject(new Error("Synthetic full SQL comparison refused")); }
      return Promise.resolve({ transactionTimestampsWithinPlannedWindows: true });
    },
  });
  const constructor: unknown = runInContext(`${program}\nCurrentSymbolWriterCoordinator;`, context);
  assert.ok(typeof constructor === "function");
  // The synthetic class runs the complete source body; its imports are explicitly
  // Substituted above rather than adding a production authority-registration hook.
  const instance: unknown = Reflect.construct(constructor, [engine]); assert.ok(isRecord(instance));
  const invoke = (name: string, args: unknown[]): unknown => {
    const method = instance[name]; assert.ok(typeof method === "function"); return Reflect.apply(method, instance, args) as unknown;
  };
  const coordinator: TestCoordinator = {
    finishNormalClose: async (id): Promise<Bag> => record(await invoke("finishNormalClose", [id])),
    observeFinish: async (id): Promise<Bag> => record(await invoke("observeFinish", [id])),
    inspect: (id): Bag => record(invoke("inspect", [id])),
    continuation: (id): unknown => invoke("getVerificationContinuation", [id]),
  };
  const exported: unknown = runInContext("({ assertOriginalCurrentSymbolWriterContinuation, transferCurrentSymbolWriterContinuation })", context);
  assert.ok(isRecord(exported));
  const continuationCall = (name: string, token: unknown): unknown => {
    const method = exported[name]; assert.ok(typeof method === "function"); return Reflect.apply(method, undefined, [token, engine]) as unknown;
  };
  return { coordinator, state, values, original, writeRaw,
    assertContinuation: (token): unknown => continuationCall("assertOriginalCurrentSymbolWriterContinuation", token),
    transferContinuation: (token): unknown => continuationCall("transferCurrentSymbolWriterContinuation", token),
    start: async (): Promise<unknown> => await invoke("execute", [generation, startup, aged]),
    wrongStartup: async (): Promise<unknown> => await invoke("execute", [generation, structuredClone(startup), aged]),
  };
}
const ID = "synthetic-current-writer";

void test("canvas writers require the original purpose-bound write count and a strictly newer clock before mutation", async () => {
  for (const [purpose, remainingWrites] of [["disposable-validation", 1], ["disposable-validation", 2], ["ordinary-symbol-metadata", 1]] as const) {
    const accepted = await fixture("none", { maximumTargetHeaderTime: 1001, remainingWrites, purpose });
    await accepted.start(); assert.equal(accepted.state.mutations, 1);
    for (const canvas of [{ maximumTargetHeaderTime: 1002, remainingWrites, purpose }, { maximumTargetHeaderTime: 1003, remainingWrites, purpose }]) {
      const refused = await fixture("none", canvas);
      await assert.rejects(refused.start(), /strictly newer document window/u);
      assert.deepEqual(refused.state.calls, ["preflight", "clock"]); assert.equal(refused.state.mutations, 0);
      assert.equal(refused.state.writes.includes("writer-dispatch-intent"), false);
    }
  }
  const ordinaryInverse = await fixture("none", { maximumTargetHeaderTime: 1001, remainingWrites: 2, purpose: "ordinary-symbol-metadata" });
  await assert.rejects(ordinaryInverse.start(), /purpose-bound write count/u);
  assert.deepEqual(ordinaryInverse.state.calls, ["preflight", "clock"]); assert.equal(ordinaryInverse.state.mutations, 0);
  assert.equal(ordinaryInverse.state.writes.includes("writer-dispatch-intent"), false);
});

void test("canvas forward reserves a complete strictly later inverse window, not merely one millisecond", async () => {
  const maximumMs = CURRENT_SYMBOL_WRITE_TIME_CEILING - CURRENT_SYMBOL_WRITE_WINDOW_MS - 1;
  const accepted = await fixture("none", { maximumTargetHeaderTime: 1, remainingWrites: 2, maximumMs });
  await accepted.start(); assert.equal(accepted.state.mutations, 1);
  for (const invalid of [maximumMs + 1, CURRENT_SYMBOL_WRITE_TIME_CEILING - 1, CURRENT_SYMBOL_WRITE_TIME_CEILING]) {
    const refused = await fixture("none", { maximumTargetHeaderTime: 1, remainingWrites: 2, maximumMs: invalid });
    await assert.rejects(refused.start(), /inverse window headroom/u); assert.equal(refused.state.mutations, 0);
  }
  const inverse = await fixture("none", { maximumTargetHeaderTime: 1, remainingWrites: 1, maximumMs: CURRENT_SYMBOL_WRITE_TIME_CEILING });
  await inverse.start(); assert.equal(inverse.state.mutations, 1);
  const ordinary = await fixture("none", { maximumTargetHeaderTime: 1, remainingWrites: 1, maximumMs: CURRENT_SYMBOL_WRITE_TIME_CEILING, purpose: "ordinary-symbol-metadata" });
  await ordinary.start(); assert.equal(ordinary.state.mutations, 1);
  const exceeded = await fixture("none", { maximumTargetHeaderTime: 1, remainingWrites: 1, maximumMs: CURRENT_SYMBOL_WRITE_TIME_CEILING + 1, purpose: "ordinary-symbol-metadata" });
  await assert.rejects(exceeded.start(), /headroom/u); assert.equal(exceeded.state.mutations, 0);
  assert.equal(exceeded.state.writes.includes("writer-dispatch-intent"), false);
});

void test("private writer owns exactly one dispatch, original clock capture, normal closure and full comparison", async () => {
  const f = await fixture();
  await assert.rejects(f.wrongStartup(), /Original startup missing/u); assert.equal(f.state.transferred, false);
  await f.start(); assert.deepEqual(f.state.calls, ["preflight", "clock", "write"]); assert.equal(f.state.mutations, 1); assert.equal(f.state.clocks, 3);
  assert.deepEqual(structuredClone(f.coordinator.inspect(ID)["retainedEvidence"]), { preflightReply: true, clockReply: true,
    writeReply: true, beforeClock: true, armedClock: true, afterClock: true });
  assert.throws(() => f.coordinator.continuation(ID));
  assert.ok(f.state.writes.indexOf("writer-dispatch-intent") < f.state.writes.indexOf("writer-dispatch-reply"));
  await assert.rejects(f.start(), /already consumed/u);
  await f.coordinator.finishNormalClose(ID);
  await assert.rejects(f.coordinator.finishNormalClose(ID));
  const pending = await f.coordinator.observeFinish(ID); assert.equal(pending["termination"], "pending");
  const terminal = await f.coordinator.observeFinish(ID); assert.equal(terminal["retired"], true); assert.equal(terminal["executionAuthorized"], false);
  assert.equal(terminal["persistentUploadReplayExcluded"], false); assert.equal(terminal["reopened"], false);
  assert.equal(terminal["dispatchCaptureCleanupUncertain"], false);
  const recovery = record(terminal["recoveryClassification"]);
  assert.equal(recovery["outcome"], "exact-intended-effect");
  assert.equal(recovery["verificationContinuationAuthorized"], false); assert.equal(recovery["inverseAuthorized"], false);
  recovery["outcome"] = "tampered";
  assert.equal(record(f.coordinator.inspect(ID)["recoveryClassification"])["outcome"], "exact-intended-effect");
  assert.equal(f.state.closeCalls, 1); assert.equal(f.state.snapshots, 1); assert.equal(f.state.comparisons, 1); assert.equal(f.state.releases, 1);
  const continuation = f.coordinator.continuation(ID), source = f.assertContinuation(continuation);
  assert.throws(() => f.assertContinuation(structuredClone(continuation)), /not issued/u);
  assert.equal(f.transferContinuation(continuation), source);
  assert.throws(() => f.transferContinuation(continuation), /consumed/u);
  assert.equal(f.assertContinuation(continuation), source);
  await assert.rejects(f.coordinator.observeFinish(ID));
});

for (const failure of ["post-clock", "owner-after-write", "late-clock-plan", "intent-write"] as const) {
  void test(`private writer retains consumed intent and original partial evidence after ${failure}`, async () => {
    const f = await fixture(failure); await assert.rejects(f.start(), /Synthetic|consumed owner/u);
    const summary = f.coordinator.inspect(ID); assert.equal(summary["failed"], true);
    assert.equal(f.state.mutations, failure === "post-clock" || failure === "owner-after-write" ? 1 : 0);
    assert.equal(f.state.clocks, failure === "post-clock" ? 3 : 2);
    if (failure === "post-clock" || failure === "owner-after-write") { assert.equal(summary["originalClockRepliesRetained"], true); }
    assert.deepEqual(structuredClone(summary["retainedEvidence"]), { preflightReply: true, clockReply: true,
      writeReply: failure === "post-clock" || failure === "owner-after-write", beforeClock: true, armedClock: true, afterClock: false });
    await assert.rejects(f.start(), /already consumed/u);
    if (failure === "owner-after-write") {
      await assert.rejects(f.coordinator.finishNormalClose(ID), /Synthetic owner/u); assert.equal(f.state.closeCalls, 0); return;
    }
    await f.coordinator.finishNormalClose(ID); await f.coordinator.observeFinish(ID); await f.coordinator.observeFinish(ID);
    assert.equal(f.state.closeCalls, 1); assert.equal(f.state.snapshots, 1); assert.equal(f.state.comparisons, 0);
    assert.equal(f.state.releases, 2); assert.equal(f.coordinator.inspect(ID)["retired"], true);
    const recovery = record(f.coordinator.inspect(ID)["recoveryClassification"]);
    assert.equal(recovery["outcome"], failure === "post-clock" ? "unresolved" : "unchanged");
    assert.equal(recovery["inverseAuthorized"], false); assert.equal(recovery["replayAllowed"], false);
    assert.throws(() => f.coordinator.continuation(ID));
  });
}

void test("a refused full comparison cannot retry comparison, write or Save and still permits retirement", async () => {
  const f = await fixture("comparison"); await f.start(); await f.coordinator.finishNormalClose(ID); await f.coordinator.observeFinish(ID);
  await assert.rejects(f.coordinator.observeFinish(ID), /Synthetic full SQL/u);
  await f.coordinator.observeFinish(ID);
  assert.equal(f.state.comparisons, 1); assert.equal(f.state.snapshots, 1); assert.equal(f.state.mutations, 1); assert.equal(f.state.closeCalls, 1);
  assert.equal(f.coordinator.inspect(ID)["failed"], true); assert.equal(f.coordinator.inspect(ID)["retired"], true);
  assert.equal(record(f.coordinator.inspect(ID)["recoveryClassification"])["outcome"], "unresolved");
  assert.throws(() => f.coordinator.continuation(ID));
});

void test("unchanged closed SQL cannot replace missing original post-dispatch evidence", async () => {
  const f = await fixture("post-clock-unchanged"); await assert.rejects(f.start(), /Synthetic post-clock/u);
  await f.coordinator.finishNormalClose(ID); await f.coordinator.observeFinish(ID); await f.coordinator.observeFinish(ID);
  const recovery = record(f.coordinator.inspect(ID)["recoveryClassification"]);
  assert.equal(recovery["outcome"], "unresolved"); assert.equal(recovery["basis"], "original-post-dispatch-evidence-incomplete");
  assert.equal(recovery["originalPostEvidenceComplete"], false);
  assert.equal(f.state.mutations, 1); assert.equal(f.state.comparisons, 0);
  assert.throws(() => f.coordinator.continuation(ID));
});

for (const failure of ["snapshot-revalidate", "retirement-release"] as const) {
  void test(`writer continuation cannot escape ${failure}`, async () => {
    const f = await fixture(failure); await f.start(); await f.coordinator.finishNormalClose(ID); await f.coordinator.observeFinish(ID);
    await assert.rejects(f.coordinator.observeFinish(ID), /Synthetic/u);
    assert.throws(() => f.coordinator.continuation(ID));
    assert.equal(f.state.mutations, 1); assert.equal(f.state.snapshots, 1); assert.equal(f.state.comparisons, 1);
  });
}

void test("writer retains close ownership and exact original journal after transfer artifact publication fails", async () => {
  const f = await fixture("transfer-write"); await assert.rejects(f.start(), /Synthetic transfer/u);
  assert.equal(f.state.transferred, true); assert.equal(f.state.calls.length, 0);
  const evidence = record(f.values.get("writer-stopped")); assert.ok(isRecord(evidence["transferJournal"]));
  await f.coordinator.finishNormalClose(ID); await f.coordinator.observeFinish(ID); await f.coordinator.observeFinish(ID);
  assert.equal(f.state.closeCalls, 1); assert.equal(f.state.mutations, 0); assert.equal(f.coordinator.inspect(ID)["retired"], true);
});

void test("writer retires a failed snapshot without retrying it or accepting its partial inventory", async () => {
  const f = await fixture("snapshot"); await f.start(); await f.coordinator.finishNormalClose(ID); await f.coordinator.observeFinish(ID);
  await assert.rejects(f.coordinator.observeFinish(ID), /Synthetic snapshot/u);
  await f.coordinator.observeFinish(ID);
  assert.equal(f.state.snapshots, 1); assert.equal(f.state.comparisons, 0);
  assert.equal(f.coordinator.inspect(ID)["snapshotComplete"], false); assert.equal(f.coordinator.inspect(ID)["retired"], true);
  const recovery = record(f.coordinator.inspect(ID)["recoveryClassification"]);
  assert.equal(recovery["outcome"], "unresolved"); assert.equal(recovery["completeClosedSnapshot"], false);
});

void test("writer never overwrites foreign journal bytes or uses drift to authorize closure", async () => {
  const f = await fixture("journal-drift"); await assert.rejects(f.start(), /consumed owner/u);
  assert.equal(f.coordinator.inspect(ID)["originalClockRepliesRetained"], true);
  await assert.rejects(f.coordinator.finishNormalClose(ID), /changed journal/u);
  assert.equal(f.state.closeCalls, 0); assert.equal(f.state.mutations, 1); assert.equal(f.state.writes.includes("writer-stopped"), false);
});

for (const failure of ["preflight-mark-cleanup", "preflight-clear-release", "writer-mark-cleanup", "writer-clear-release"] as const) {
  void test(`writer retains exact engine-owned cleanup after ${failure} without stranding normal closure`, async () => {
    const f = await fixture(failure); await assert.rejects(f.start(), /Synthetic/u);
    assert.equal(f.coordinator.inspect(ID)["failed"], true);
    assert.equal(f.coordinator.inspect(ID)["dispatchCaptureCleanupUncertain"], true);
    assert.equal(f.state.mutations, failure === "writer-clear-release" ? 1 : 0);
    await f.coordinator.finishNormalClose(ID); await f.coordinator.observeFinish(ID); await f.coordinator.observeFinish(ID);
    assert.equal(f.state.closeCalls, 1); assert.equal(f.state.releases, 1);
    assert.equal(f.coordinator.inspect(ID)["retired"], true);
    assert.equal(f.coordinator.inspect(ID)["dispatchCaptureCleanupUncertain"], true);
    assert.equal(record(f.coordinator.inspect(ID)["recoveryClassification"])["outcome"], "unresolved");
    await assert.rejects(f.start(), /already consumed/u);
  });
}
