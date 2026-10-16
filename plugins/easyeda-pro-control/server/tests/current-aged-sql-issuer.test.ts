/** Actual issuer body with synthetic owners and transport, no Windows process. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";

type Failure = "owner-after-reply" | "post-clock" | "publication";
async function fixture(failure: Failure): Promise<{
  run: () => Promise<unknown>; evidence: (copy?: boolean) => unknown;
  state: { alive: boolean; calls: number; clocks: number; writes: string[]; values: unknown[] };
  raw: unknown;
}> {
  const generation = { operationId: "synthetic-current-clock" }, reference = { request: { createdAtLiteral: "2026-01-15 12:34:56", referenceUtcMs: 1_791_806_400_000 } };
  const capture = { synthetic: "same-original-capture" }, lease = { synthetic: "same-original-lease" };
  const source = { capture, baseline: { preparation: { target: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) } } },
    source: { expectedFingerprint: { installedBundles: { assetsRoot: "/synthetic/pinned-source" } } },
    originalPreparation: { closedTargetWitness: { observation: { runtimeObservation: { actor: { uuid: "c".repeat(32), username: "fixture", nickname: "Fixture" } } } } } };
  const state = { alive: true, calls: 0, clocks: 0, writes: [] as string[], values: [] as unknown[] };
  const raw = Object.freeze({ content: [{ type: "text", text: "synthetic settled original reply" }] });
  const engine = {
    upstream: { currentAuthenticatedBridgeDispatchBinding: (): typeof lease => lease,
      callTool: (): Promise<unknown> => { state.calls += 1; if (failure === "owner-after-reply") { state.alive = false; } return Promise.resolve(raw); } },
    freshClockObservationForClosedCapture: (value: unknown): Promise<unknown> => {
      assert.equal(value, capture); state.clocks += 1;
      if (state.clocks === 2 && failure === "post-clock") { return Promise.reject(new Error("Synthetic post-clock failure")); }
      return Promise.resolve(Object.freeze({ syntheticClock: state.clocks }));
    },
    assertBridgeDispatchAllowed: (): Promise<void> => Promise.resolve(),
  };
  const owned = (value: unknown, receivedEngine: unknown, scopeText: unknown): typeof source => {
    assert.equal(value, generation); assert.equal(receivedEngine, engine); assert.equal(scopeText, canonicalJson(lease));
    assert.equal(state.alive, true, "Synthetic original owner lost"); return source;
  };
  const referenceOwned = (value: unknown, receivedEngine: unknown, baseline: unknown): typeof reference => {
    assert.equal(value, reference); assert.equal(receivedEngine, engine); assert.equal(baseline, source.baseline); return reference;
  };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-aged-sql-issuer.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Reflect, Buffer, canonicalJson, sha256Json, sha256Text,
    assertCurrentProjectOnlySymbolGeneration: owned,
    revalidateCurrentProjectOnlySymbolGeneration: (...args: Parameters<typeof owned>): Promise<typeof source> => Promise.resolve(owned(...args)),
    assertOriginalCurrentAgedSqlReference: referenceOwned,
    revalidateOriginalCurrentAgedSqlReference: (...args: Parameters<typeof referenceOwned>): Promise<typeof reference> => Promise.resolve(referenceOwned(...args)),
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
  const loaded: unknown = runInContext(`${program}\n({collectCurrentAgedSqlClock,currentAgedSqlCollectionEvidence});`, context);
  assert.ok(isRecord(loaded));
  const collect = loaded["collectCurrentAgedSqlClock"], evidence = loaded["currentAgedSqlCollectionEvidence"];
  assert.ok(typeof collect === "function" && typeof evidence === "function");
  return { state, raw,
    run: async (): Promise<unknown> => {
      const result: unknown = Reflect.apply(collect, undefined, [engine, generation, reference]); return await result;
    },
    evidence: (copy = false): unknown => Reflect.apply(evidence, undefined, [copy ? structuredClone(generation) : generation, engine]) as unknown,
  };
}

for (const failure of ["owner-after-reply", "post-clock", "publication"] as const) {
  void test(`current issuer retains original settled reply after ${failure}, refuses copied owner and never retries`, async () => {
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
