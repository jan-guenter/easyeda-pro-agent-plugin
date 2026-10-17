/** Actual retained baseline/inverse coordinator bodies with synthetic native
 * boundaries. No Windows launch or connected validation is represented here.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isRecord, newOperationId, sha256Json } from "../src/core.ts";

type Bag = Record<string, unknown>;
type Failure = "none" | "launch-clock" | "admission" | "close-ack" | "transfer" | "adoption-result" | "created-disk-drift" | "created-memory-drift";
interface Api { adoptInverse: (owner: unknown, copy: unknown, reference: unknown) => Promise<Bag>; relaunch: (id: string) => Promise<Bag>;
  admit: (id: string) => Promise<Bag>; finishNormalClose: (id: string) => Promise<Bag>; observeFinish: (id: string) => Promise<Bag>; inspect: (id: string) => Promise<Bag>; }
function noop(): undefined { return undefined; }
async function baselineFixture(failure: Failure = "none"): Promise<{
  api: Api; adopt: () => Promise<Bag>; id: string; state: { transferred: boolean; launches: number; closes: number; releases: number; proofReads: number };
}> {
  const id = newOperationId(), owner = Object.freeze({ profile: "private.current-symbol-inverse-baseline-owner.v1", operationId: id, openingOperationId: "forward" });
  const session = { gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43), sequence: 1, authenticationReceiptSha256: "a".repeat(64), authenticatedAtEpochMs: 1000 };
  const nextSession = { sessionId: "n".repeat(43), sequence: 2, authenticationReceiptSha256: "b".repeat(64), authenticatedAtEpochMs: 2000 };
  const previousLaunch = { jobId: "prior", helperInstance: "helper", root: { pid: 1, startIdentity: "old" } };
  const nextLaunch = { jobId: "next", helperInstance: "helper", root: { pid: 2, startIdentity: "new" } };
  const capture = { operationId: "forward", phase: "closed-verification", bridgeSession: session }, proof = { original: "proof" };
  const preparation = { preparationSha256: "p", closedTargetWitness: {} }, reference = { operationId: id };
  const copy = { owner, copy: { receiptSha256: "r" }, checkpoint: {}, preparation: {}, startupPremises: {} };
  const state = { transferred: false, launches: 0, closes: 0, releases: 0, proofReads: 0 };
  let active = false, polls = 0;
  const runtime = {
    status: (): Bag => ({ state: "owned", launch: state.launches === 0 ? previousLaunch : nextLaunch }),
    launch: (): Promise<unknown> => { state.launches += 1; active = true; return Promise.resolve(nextLaunch); },
    clockObservationForLaunch: (): Promise<unknown> => failure === "launch-clock" || failure === "close-ack" ?
      Promise.reject(new Error("clock refused")) : Promise.resolve({ clock: { status: "observed" } }),
    observeApplicationWindow: (): Promise<unknown> => Promise.resolve({ outcome: "available", hwnd: "5", jobId: "next", helperInstance: "helper" }),
    normalClose: (): Promise<void> => { state.closes += 1; active = false; return failure === "close-ack" ? Promise.reject(new Error("close acknowledgment lost")) : Promise.resolve(); },
    observeLaunchTermination: (): Promise<unknown> => { polls += 1; return Promise.resolve({ jobId: "next", helperInstance: "helper", terminated: polls > 1 }); },
  };
  const source = { runtime, launchProjection: previousLaunch, bridgeSession: session, target: {}, expectedFingerprint: {}, preNavigationCheckpoint: {} };
  const original = { source, preparation, predecessor: { operationId: "forward" }, result: { writer: { sqlRuntime: {} }, snapshot: {},
    originalSnapshot: { capture, proof }, revalidateClosed: (): Promise<void> => Promise.resolve() } };
  const engine = { executionAuthorityValidator: {}, upstream: {
    currentAuthenticatedBridgeDispatchBinding: noop,
    bridgeSessionLifecycle: (): Bag => ({ schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: session.gatewayInstanceId,
      publicEndpoint: {}, activeSession: active ? nextSession : null, recentClosedSessions: [
        { ...session, closedAtEpochMs: 1500 }, ...(state.closes > 0 ? [{ ...nextSession, closedAtEpochMs: 2500, closeReason: "normal" }] : [])] }),
    withAuthenticatedBridgeDispatchScope: (): Promise<void> => Promise.reject(new Error("admission refused before capture")),
  }, releaseClosedSessionAuthority: (value: unknown): Promise<void> => { assert.equal(value, capture); state.releases += 1; return Promise.resolve(); },
  assertBridgeDispatchAllowed: (): Promise<void> => Promise.resolve(), assertRecoveryOperationIsolated: (): Promise<void> => Promise.resolve() };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-symbol-baseline-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Map, WeakMap, Date, Promise, structuredClone, z, canonicalJson, isRecord, sha256Json,
    OPERATION_SCHEMA, buildPlanHash, currentSymbolMetadataPreparationRequestSchema: z.object({}),
    CurrentAgedSqlReferenceStage: function CurrentAgedSqlReferenceStage(): void { noop(); }, assertWindowsRuntimeValidator: noop,
    assertCurrentSymbolInverseBaselineOwner: (value: unknown): unknown => { assert.equal(value, owner); return original; },
    revalidateCurrentSymbolInverseBaselineOwner: (value: unknown): Promise<unknown> => { assert.equal(value, owner); return Promise.resolve(original); },
    currentSymbolInverseOwnershipTransferred: (): boolean => state.transferred,
    transferCurrentSymbolInverseBaselineOwner: async (): Promise<void> => {
      const journal = await loadOperation(id);
      assert.equal(journal["state"], "plan-invalidated"); assert.equal(journal["sequence"], 1);
      assert.equal(journal.artifacts?.length, 1);
      if (failure === "transfer") { throw new Error("transfer refused"); }
      state.transferred = true;
    },
    assertOriginalCurrentSymbolBaselineCopy: noop,
    assertOriginalCurrentAgedSqlReference: (value: unknown): unknown => { assert.equal(value, reference); return value; },
    revalidateOriginalCurrentAgedSqlReference: (): Promise<void> => Promise.resolve(),
    revalidateCurrentSymbolBaselineCopy: (): Promise<void> => Promise.resolve(),
    assertCurrentClosedSessionCopyAuthority: noop,
    assertClosedSessionCopyAuthority: (value: unknown): Promise<unknown> => { assert.equal(value, proof); state.proofReads += 1; return Promise.resolve(value); },
    windowsClockObservationForResult: (): Promise<unknown> => Promise.resolve({ clock: { status: "observed" } }),
    assertIssuedWindowsClockObservation: (value: unknown): Promise<unknown> => Promise.resolve(value),
    operationPath, loadOperation, updateOperation,
    // The real managed publisher adds integrity fields in place. Keeping it
    // Here covers the handoff boundary that an unsealed in-memory mock missed.
    createOperation: async (value: Bag): Promise<string> => {
      const path = await createOperation(value);
      assert.equal(typeof value["integrityModel"], "string"); assert.equal(typeof value["journalSha256"], "string");
      assert.equal(canonicalJson(await loadOperation(id)), canonicalJson(value));
      if (failure === "created-disk-drift") {
        const changed = await loadOperation(id); changed["nextSafeAction"] = "Externally advanced journal";
        await updateOperation(changed);
      }
      if (failure === "created-memory-drift") { value["nextSafeAction"] = "Unexpected in-memory change"; }
      return path;
    },
    writePhaseArtifact: (operation: string, sequence: number, phase: string, value: unknown): ReturnType<typeof writePhaseArtifact> =>
      failure === "adoption-result" && phase === "inverse-adoption-result" ?
        Promise.reject(new Error("adoption publication refused")) : writePhaseArtifact(operation, sequence, phase, value),
    inspectCurrentSymbolClockEvidence: (): Promise<unknown> => Promise.resolve({}),
  });
  runInContext(`${program}\nthis.Coordinator = CurrentSymbolBaselineCoordinator;`, context);
  const candidate: unknown = context["Coordinator"]; assert.equal(typeof candidate, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The class is the actual stripped module above; this fixture checks its concrete lifecycle calls.
  const Constructor = candidate as new (value: unknown, native: unknown, sql: unknown) => Api;
  const api = new Constructor(engine, runtime, {});
  return { api, id, state, adopt: () => api.adoptInverse(owner, copy, reference) };
}

void test("original inverse adoption keeps closure until explicit no-launch retirement", async () => {
  const fixture = await baselineFixture(); const adopted = await fixture.adopt();
  assert.equal(adopted["baselineCaptured"], true); assert.equal(fixture.state.transferred, true); assert.equal(fixture.state.releases, 0);
  await assert.rejects(fixture.adopt, /already consumed/u);
  const closing = await fixture.api.finishNormalClose(fixture.id); assert.equal(closing["inverseCleanupMode"], "held-closure");
  const finished = await fixture.api.observeFinish(fixture.id);
  assert.equal(finished["retired"], true); assert.equal(fixture.state.launches, 0); assert.equal(fixture.state.closes, 0); assert.equal(fixture.state.releases, 1);
  await assert.rejects(fixture.api.observeFinish(fixture.id), /retained close/u);
});
void test("inverse adoption seals its real managed journal before comparing and transferring ownership", async () => {
  const fixture = await baselineFixture();
  const adopted = await fixture.adopt(), journal = await loadOperation(fixture.id);
  assert.equal(adopted["state"], "completed"); assert.equal(journal["sequence"], 2);
  assert.equal(typeof journal["integrityModel"], "string"); assert.match(String(journal["journalSha256"]), /^[a-f0-9]{64}$/u);
  assert.equal(journal.artifacts?.length, 2); assert.equal(fixture.state.transferred, true);
  assert.equal(fixture.state.launches, 0); assert.equal(fixture.state.closes, 0); assert.equal(fixture.state.releases, 0);
  await assert.rejects(fixture.adopt, /already consumed/u);
});
for (const failure of ["created-disk-drift", "created-memory-drift"] as const) {
  void test(`inverse ${failure} refuses before intent or ownership transfer`, async () => {
    const fixture = await baselineFixture(failure);
    await assert.rejects(fixture.adopt, /baseline journal changed/u);
    const journal = await loadOperation(fixture.id);
    assert.equal(journal["state"], "plan-invalidated"); assert.equal(journal["sequence"], 0); assert.equal(journal.artifacts?.length, 0);
    assert.equal(fixture.state.transferred, false); assert.equal(fixture.state.launches, 0);
    assert.equal(fixture.state.closes, 0); assert.equal(fixture.state.releases, 0);
    if (failure === "created-disk-drift") { assert.equal(journal["nextSafeAction"], "Externally advanced journal"); }
    await assert.rejects(fixture.adopt, /already consumed/u);
  });
}
for (const failure of ["launch-clock", "admission", "close-ack"] as const) {
  void test(`inverse ${failure} preserves one-shot original launch closure`, async () => {
    const fixture = await baselineFixture(failure); await fixture.adopt();
    if (failure === "admission") { await fixture.api.relaunch(fixture.id); await assert.rejects(fixture.api.admit(fixture.id)); }
    else { await assert.rejects(fixture.api.relaunch(fixture.id), /clock refused/u); }
    await (failure === "close-ack" ? assert.rejects(fixture.api.finishNormalClose(fixture.id), /acknowledgment/u) : fixture.api.finishNormalClose(fixture.id));
    await assert.rejects(fixture.api.finishNormalClose(fixture.id), /held closure/u);
    const pending = await fixture.api.observeFinish(fixture.id); assert.equal(pending["termination"], "pending");
    const done = await fixture.api.observeFinish(fixture.id); assert.equal(done["retired"], true);
    assert.equal(fixture.state.launches, 1); assert.equal(fixture.state.closes, 1); assert.equal(fixture.state.releases, 1);
    assert.equal(done["finishSnapshotCaptured"], false);
  });
}
void test("failed inverse transfer leaves predecessor owner and neutral journal", async () => {
  const fixture = await baselineFixture("transfer"); await assert.rejects(fixture.adopt, /transfer refused/u);
  const status = await fixture.api.inspect(fixture.id);
  assert.equal(fixture.state.transferred, false); assert.equal(status["state"], "plan-invalidated");
  await assert.rejects(fixture.api.finishNormalClose(fixture.id), /original transferred/u); assert.equal(fixture.state.releases, 0);
});
void test("post-transfer publication failure retains inverse held-closure retirement", async () => {
  const fixture = await baselineFixture("adoption-result"); await assert.rejects(fixture.adopt, /publication refused/u);
  assert.equal(fixture.state.transferred, true);
  await fixture.api.finishNormalClose(fixture.id); const done = await fixture.api.observeFinish(fixture.id);
  assert.equal(done["retired"], true); assert.equal(fixture.state.releases, 1); assert.equal(fixture.state.launches, 0);
});

interface InverseApi { prepare: (result: unknown) => Promise<Bag>; inspect: () => Promise<Bag>; relaunch: (id: string) => Promise<Bag>; }
async function inverseFixture(failure: "none" | "scratch" | "before-journal"): Promise<{
  api: InverseApi; result: unknown; calls: string[];
}> {
  const calls: string[] = [], owner = { operationId: "inverse-fixed", profile: "original" }, result = Object.freeze({ operationId: "forward" });
  const source = { source: { runtime: {} }, result: { writer: { sqlRuntime: {} }, originalSnapshot: { proof: {} } } };
  let transferred = false;
  class SyntheticBaseline {
    private readonly history = calls;
    private readonly failureCase = failure;
    public readonly adoptInverse = (): Promise<unknown> => {
      this.history.push("adopt");
      if (this.failureCase === "before-journal") { return Promise.reject(new Error("createOperation failed")); }
      transferred = true; return Promise.resolve({});
    };
    public readonly inspect = (): Promise<unknown> => {
      if (this.failureCase === "before-journal") { return Promise.reject(new Error("child journal missing")); }
      return Promise.resolve({ state: "completed" });
    };
    public readonly relaunch = (): Promise<unknown> => { this.history.push("launch"); return Promise.resolve({ state: "relaunched" }); };
  }
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-symbol-inverse-runtime.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Promise, Error, String,
    assertCurrentSymbolVerificationResult: (value: unknown): void => { assert.equal(value, result); },
    prepareCurrentSymbolInverseOwner: (): Promise<unknown> => { calls.push("owner"); return Promise.resolve(owner); },
    assertCurrentSymbolInverseBaselineOwner: (value: unknown): unknown => { assert.equal(value, owner); return source; },
    prepareCurrentSymbolInverseBaselineCopy: (): Promise<unknown> => { calls.push("copy"); return Promise.resolve({}); },
    currentSymbolInverseOwnershipTransferred: (): boolean => transferred,
    CurrentAgedSqlReferenceStage: function CurrentAgedSqlReferenceStage(): object {
      return { runOnce: (): Promise<unknown> => {
        calls.push("fresh-scratch"); return failure === "scratch" ? Promise.reject(new Error("scratch refused")) : Promise.resolve({});
      } };
    },
    CurrentSymbolBaselineCoordinator: SyntheticBaseline,
  });
  runInContext(`${program}\nthis.Coordinator = CurrentSymbolInverseCoordinator;`, context);
  const candidate: unknown = context["Coordinator"]; assert.equal(typeof candidate, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The value is the actual stripped module class, with explicitly synthetic dependency seams.
  const Constructor = candidate as new (engine: unknown) => InverseApi;
  return { api: new Constructor({}), result, calls };
}
void test("inverse coordinator derives fresh scratch before adoption and cannot prepare twice", async () => {
  const fixture = await inverseFixture("none"), status = await fixture.api.prepare(fixture.result);
  assert.equal(status["prepared"], true); assert.equal(status["cleanupOwner"], "inverse-baseline");
  assert.deepEqual(fixture.calls, ["owner", "copy", "fresh-scratch", "adopt"]);
  await assert.rejects(fixture.api.prepare(fixture.result), /already consumed/u);
  await fixture.api.relaunch("inverse-fixed"); assert.equal(fixture.calls.at(-1), "launch");
});
for (const failure of ["scratch", "before-journal"] as const) {
  void test(`inverse ${failure} preparation failure retains predecessor cleanup diagnostics`, async () => {
    const fixture = await inverseFixture(failure); await assert.rejects(fixture.api.prepare(fixture.result));
    const status = await fixture.api.inspect();
    assert.equal(status["failed"], true); assert.equal(status["prepared"], false); assert.equal(status["cleanupOwner"], "predecessor-verifier");
    assert.ok(!fixture.calls.includes("launch")); await assert.rejects(fixture.api.prepare(fixture.result), /already consumed/u);
    if (failure === "before-journal") {
      assert.equal(status["childInspectionAvailable"], false);
      assert.equal(status["childInspectionDiagnostic"], "original-child-inspection-unavailable");
      assert.equal(JSON.stringify(status).includes("child journal missing"), false);
    }
  });
}
