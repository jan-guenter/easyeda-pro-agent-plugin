/** Actual issuer body with synthetic owners and transport, no Windows process. */
/* oxlint-disable import/max-dependencies -- The regression uses genuine source-qualified Windows issuance and endpoint validation alongside the existing issuer VM; only owner/renderer transport fixtures are synthetic. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";
import { CURRENT_AGED_SQL_DATE_PARSER_SOURCE } from "../src/current-aged-sql-clock-controls.ts";
import { compareRendererClockEndpoints } from "../src/renderer-clock-endpoints.ts";
import { assertCurrentIssuedWindowsClockObservation } from "../src/windows-authority.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { qualifiedClockFixture } from "./helpers/windows-clock-fixture.ts";
import { syntheticClockSample } from "./helpers/windows-clock-spawn-fixture.ts";

type Failure = "owner-after-reply" | "post-clock" | "publication";
async function fixture(failure?: Failure, native?: Awaited<ReturnType<typeof qualifiedClockFixture>>): Promise<{
  run: () => Promise<unknown>; evidence: (copy?: boolean) => unknown;
  qualify: (result: unknown, backend: unknown, copyGeneration?: boolean) => unknown;
  fresh: () => Promise<unknown>; releaseCapture: () => Promise<unknown>;
  state: { alive: boolean; referenceAlive: boolean; calls: number; clocks: number; writes: string[]; values: unknown[] };
  raw: unknown;
}> {
  const base = Date.UTC(2026, 9, 13, 12), clock = (delta: number): Readonly<Record<string, unknown>> =>
    Object.freeze({ epochMs: base + delta, iso: new Date(base + delta).toISOString(), offsetMinutes: -120 });
  const epochs = Object.freeze([]), sql = Object.freeze([Object.freeze({ epochMs: Date.UTC(2026, 0, 15, 10, 34, 56) })]);
  const renderer = Object.freeze({ controlsBefore: Object.freeze({ clockBefore: clock(5200), sql, epochs }),
    controlsAfter: Object.freeze({ clockAfter: clock(5300) }) });
  const generation = { operationId: "synthetic-current-clock" }, reference = {
    request: { createdAtLiteral: "2026-01-15 12:34:56", referenceUtcMs: base, historyUuid: "e".repeat(32) },
    controlsAfter: Object.freeze({ clockAfter: clock(3000), sql, epochs }), nativeAfter: syntheticClockSample(1),
  };
  if (native !== undefined) { await native.supervisor.launch({ confirmLaunch: true }); }
  const nativeCapture = native === undefined ? undefined : await native.supervisor.capture(INPUT);
  const capture = nativeCapture ?? { synthetic: "same-original-capture" };
  const lease = { synthetic: "same-original-lease" };
  const source = { capture, baseline: { preparation: { source: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) } } },
    source: { expectedFingerprint: { installedBundles: { assetsRoot: "/synthetic/pinned-source" } } },
    originalPreparation: { closedTargetWitness: { observation: { runtimeObservation: { actor: { uuid: "c".repeat(32), username: "fixture", nickname: "Fixture" } } } } } };
  const state = { alive: true, referenceAlive: true, calls: 0, clocks: 0, writes: [] as string[], values: [] as unknown[] };
  const raw = Object.freeze({ content: [{ type: "text", text: "synthetic settled original reply" }] });
  const fresh = (): Promise<unknown> => {
    assert.ok(native?.supervisor.observeCurrentClock); assert.ok(nativeCapture); return native.supervisor.observeCurrentClock(nativeCapture);
  };
  const engine = {
    upstream: { currentAuthenticatedBridgeDispatchBinding: (): typeof lease => lease,
      callTool: (): Promise<unknown> => { state.calls += 1; if (failure === "owner-after-reply") { state.alive = false; } return Promise.resolve(raw); } },
    freshClockObservationForClosedCapture: (value: unknown): Promise<unknown> => {
      assert.equal(value, capture); state.clocks += 1;
      if (state.clocks === 2 && failure === "post-clock") { return Promise.reject(new Error("Synthetic post-clock failure")); }
      return native === undefined ? Promise.resolve(Object.freeze({ syntheticClock: state.clocks })) : fresh();
    },
    assertBridgeDispatchAllowed: (): Promise<void> => Promise.resolve(),
  };
  const owned = (value: unknown, receivedEngine: unknown, scopeText: unknown): typeof source => {
    assert.equal(value, generation); assert.equal(receivedEngine, engine); assert.equal(scopeText, canonicalJson(lease));
    assert.equal(state.alive, true, "Synthetic original owner lost"); return source;
  };
  const referenceOwned = (value: unknown, receivedEngine: unknown, baseline: unknown): typeof reference => {
    assert.equal(value, reference); assert.equal(receivedEngine, engine); assert.equal(baseline, source.baseline);
    assert.equal(state.referenceAlive, true, "Synthetic original reference lost"); return reference;
  };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-copy-aged-sql-issuer.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Reflect, Buffer, canonicalJson, sha256Json, sha256Text, CURRENT_AGED_SQL_DATE_PARSER_SOURCE,
    assertCurrentIssuedWindowsClockObservation,
    compareRendererClockEndpoints: (value: unknown): unknown => compareRendererClockEndpoints(structuredClone(value)),
    decodeCurrentAgedSqlRendererReply: (value: unknown): typeof renderer => { assert.equal(value, raw); return renderer; },
    assertCurrentProjectOnlySymbolCopyGeneration: owned,
    revalidateCurrentProjectOnlySymbolCopyGeneration: (...args: Parameters<typeof owned>): Promise<typeof source> => Promise.resolve(owned(...args)),
    assertOriginalCurrentCopyAgedSqlReference: referenceOwned,
    revalidateOriginalCurrentCopyAgedSqlReference: (...args: Parameters<typeof referenceOwned>): Promise<typeof reference> => Promise.resolve(referenceOwned(...args)),
    assertExpectedFingerprint: (value: unknown): void => { assert.equal(value, source.source.expectedFingerprint); },
    validateSdkLocalRuntimeFingerprint: (value: unknown): void => { assert.equal(value, source.source.expectedFingerprint); },
    verifyCurrentProjectOnlySymbolPreflightImplementation: (value: unknown): Promise<void> => { assert.equal(value, "/synthetic/pinned-source"); return Promise.resolve(); },
    currentSymbolClockEvidenceId: (value: unknown): string => { assert.equal(value, generation.operationId); return "synthetic-sidecar"; },
    buildCurrentAgedSqlRendererProgram: (): string => "synthetic fixed program",
    writePhaseArtifact: (id: unknown, sequence: unknown, phase: string, value: unknown): Promise<unknown> => {
      assert.equal(id, "synthetic-sidecar"); assert.equal(sequence, 0); state.writes.push(phase); state.values.push(value);
      if (failure === "publication" && phase === "current-aged-renderer-result") { return Promise.reject(new Error("Synthetic publication failure")); }
      return Promise.resolve({ path: `/synthetic/${phase}.json`, bytes: 1, sha256: "d".repeat(64) });
    },
    readExactUtf8Artifact: (): Promise<void> => Promise.resolve(),
  });
  const loaded: unknown = runInContext(`${program}\n({collectCurrentCopyAgedSqlClock,currentCopyAgedSqlCollectionEvidence,qualifyCurrentCopyAgedSqlHead});`, context);
  assert.ok(isRecord(loaded));
  const collect = loaded["collectCurrentCopyAgedSqlClock"], evidence = loaded["currentCopyAgedSqlCollectionEvidence"], qualify = loaded["qualifyCurrentCopyAgedSqlHead"];
  assert.ok(typeof collect === "function" && typeof evidence === "function" && typeof qualify === "function");
  return { state, raw, fresh,
    releaseCapture: (): Promise<unknown> => { assert.ok(native); assert.ok(nativeCapture); return native.supervisor.releaseCapture(nativeCapture); },
    qualify: (result, backend, copyGeneration = false): unknown => Reflect.apply(qualify, undefined,
      [result, engine, copyGeneration ? structuredClone(generation) : generation, backend]) as unknown,
    run: async (): Promise<unknown> => {
      const result: unknown = Reflect.apply(collect, undefined, [engine, generation, reference]); return await result;
    },
    evidence: (copy = false): unknown => Reflect.apply(evidence, undefined, [copy ? structuredClone(generation) : generation, engine]) as unknown,
  };
}

void test("copy aged issuer retains completed parser evidence across actual supervisor capture/release without reviving stale clocks", async (context) => {
  const native = await qualifiedClockFixture(context), value = await fixture(undefined, native);
  const result = await value.run();
  const evidence = value.evidence(); assert.ok(isRecord(evidence));
  const after = evidence["after"], before = evidence["before"];
  assert.equal(assertCurrentIssuedWindowsClockObservation(before), before);
  assert.equal(assertCurrentIssuedWindowsClockObservation(after), after);
  const interposed = await native.supervisor.capture({ ...INPUT, bindingSha256: "9".repeat(64) });
  await native.supervisor.releaseCapture(interposed);
  assert.throws(() => assertCurrentIssuedWindowsClockObservation(before), /capture, owner or original generation changed/u);
  assert.throws(() => assertCurrentIssuedWindowsClockObservation(after), /capture, owner or original generation changed/u);
  const fresh = await value.fresh();
  assert.equal(assertCurrentIssuedWindowsClockObservation(fresh), fresh);
  assert.deepEqual(structuredClone(value.qualify(result, fresh)), { createdAtLiteral: "2026-01-15 12:34:56",
    nativeParsedLocalMs: Date.UTC(2026, 0, 15, 10, 34, 56), nativeTimezoneOffsetMinutes: -120 });
  assert.throws(() => value.qualify(structuredClone(result), fresh), /issuer refused/u);
  assert.throws(() => value.qualify(result, structuredClone(fresh)), /not issued/u);
  assert.throws(() => value.qualify(result, fresh, true));
  value.state.alive = false; assert.throws(() => value.qualify(result, fresh), /original owner lost/u); value.state.alive = true;
  value.state.referenceAlive = false; assert.throws(() => value.qualify(result, fresh), /original reference lost/u); value.state.referenceAlive = true;
  assert.equal(value.state.calls, 1); assert.equal(native.spawnCalls(), 1);
  assert.deepEqual(native.requests.map((request) => request["action"]), ["clocked-launch", "clocked-capture",
    "clocked-observe-owned-clock", "clocked-observe-owned-clock", "clocked-capture", "release-capture", "clocked-observe-owned-clock"]);
});

void test("copy aged issuer still refuses stale backend, a different capture and released original capture", async (context) => {
  const native = await qualifiedClockFixture(context), value = await fixture(undefined, native);
  const result = await value.run(), stale = await value.fresh();
  const interposed = await native.supervisor.capture({ ...INPUT, bindingSha256: "9".repeat(64) });
  assert.throws(() => value.qualify(result, stale), /capture, owner or original generation changed/u);
  assert.ok(native.supervisor.observeCurrentClock);
  const otherCapture = await native.supervisor.observeCurrentClock(interposed);
  assert.equal(assertCurrentIssuedWindowsClockObservation(otherCapture), otherCapture);
  assert.throws(() => value.qualify(result, otherCapture), /issuer refused/u);
  await native.supervisor.releaseCapture(interposed);
  const fresh = await value.fresh(); assert.doesNotThrow(() => value.qualify(result, fresh));
  await value.releaseCapture();
  assert.throws(() => value.qualify(result, fresh), /capture, owner or original generation changed/u);
  await assert.rejects(value.fresh(), /capture, owner or original generation changed/u);
  assert.equal(value.state.calls, 1); assert.equal(native.spawnCalls(), 1);
});

for (const failure of ["owner-after-reply", "post-clock", "publication"] as const) {
  void test(`current copy issuer retains original settled reply after ${failure}, refuses copied owner and never retries`, async () => {
    const value = await fixture(failure);
    await assert.rejects(value.run(), /Synthetic/u);
    const evidence = value.evidence(); assert.ok(isRecord(evidence));
    assert.equal(evidence["raw"], value.raw); assert.equal(evidence["rawRetained"], true);
    assert.equal(evidence["beforeRetained"], true); assert.equal(evidence["afterRetained"], failure === "publication");
    assert.equal(evidence["failureObserved"], true); assert.equal(evidence["executionAuthorized"], false);
    assert.deepEqual(value.state.writes, ["current-aged-renderer-intent", "current-aged-renderer-result"]);
    assert.equal(value.evidence(true), undefined);
    value.state.alive = true;
    await assert.rejects(value.run(), /already consumed/u);
    assert.equal(value.state.calls, 1); assert.equal(value.state.clocks, failure === "owner-after-reply" ? 1 : 2);
  });
}
