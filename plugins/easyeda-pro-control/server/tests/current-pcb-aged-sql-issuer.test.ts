/** Source-bound collection contracts only. Synthetic reads stop before clock
 * qualification; established neutral clock-math tests remain separate.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";

type Bag = Record<string, unknown>;
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
type Failure = "decode" | "startup-after-reply" | "publication";
async function fixture(failure: Failure): Promise<{
  run: (copy?: "generation" | "reference" | "startup") => Promise<unknown>;
  evidence: (copiedGeneration?: boolean) => unknown;
  raw: unknown;
  state: { startupCurrent: boolean; calls: number; clocks: number; writes: string[]; startupRechecks: number };
}> {
  const generation = { operationId: "synthetic-pcb-age" }, reference = {
    request: { createdAtLiteral: "2026-01-15 12:34:56", referenceUtcMs: Date.UTC(2026, 9, 18), historyUuid: "e".repeat(32) },
  };
  const capture = { synthetic: "original-capture" }, scope = { synthetic: "original-dispatch" }, startup = { synthetic: "original-pcb-startup" };
  const source = { capture, baseline: { intent: { target: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) } } },
    source: { expectedFingerprint: { installedBundles: { assetsRoot: "/synthetic/pinned-assets" } } } };
  const actor = { uuid: "c".repeat(32), username: "synthetic", nickname: "Synthetic" };
  const originalStartup = { source, observation: { runtimeObservation: { actor } } };
  const raw = Object.freeze({ content: [{ type: "text", text: "synthetic original settled reply" }] });
  const state = { startupCurrent: true, calls: 0, clocks: 0, writes: [] as string[], startupRechecks: 0 };
  const engine = { upstream: { currentAuthenticatedBridgeDispatchBinding: (): typeof scope => scope,
    callTool: (name: string, args: unknown, timeout: number): Promise<typeof raw> => {
      assert.equal(name, "easyeda_execute"); assert.equal(timeout, 25_000);
      assert.deepEqual(structuredClone(args), { code: "synthetic-fixed-reader", timeoutMs: 15_000, confirmWrite: true });
      state.calls += 1; if (failure === "startup-after-reply") { state.startupCurrent = false; } return Promise.resolve(raw);
    } },
    freshClockObservationForClosedCapture: (value: unknown): Promise<unknown> => {
      assert.equal(value, capture); state.clocks += 1; return Promise.resolve(Object.freeze({ syntheticClock: state.clocks }));
    }, assertBridgeDispatchAllowed: (): Promise<void> => Promise.resolve() };
  const generationOwned = (value: unknown, candidate: unknown, scopeText: unknown): typeof source => {
    assert.equal(value, generation, "Synthetic original generation required"); assert.equal(candidate, engine);
    assert.equal(scopeText, canonicalJson(scope)); return source;
  };
  const referenceOwned = (value: unknown, candidate: unknown, baseline: unknown): typeof reference => {
    assert.equal(value, reference, "Synthetic original reference required"); assert.equal(candidate, engine); assert.equal(baseline, source.baseline); return reference;
  };
  const startupOwned = (value: unknown, candidate: unknown, selected: unknown): typeof originalStartup => {
    assert.equal(value, startup, "Synthetic original startup required"); assert.equal(candidate, engine); assert.equal(selected, generation);
    assert.equal(state.startupCurrent, true, "Synthetic startup changed"); return originalStartup;
  };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-pcb-aged-sql-issuer.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, canonicalJson, sha256Json, sha256Text,
    assertCurrentProjectOnlyPcbRenameGeneration: generationOwned,
    revalidateCurrentProjectOnlyPcbRenameGeneration: (...args: Parameters<typeof generationOwned>): Promise<typeof source> => Promise.resolve(generationOwned(...args)),
    assertOriginalCurrentPcbAgedSqlReference: referenceOwned,
    revalidateOriginalCurrentPcbAgedSqlReference: (...args: Parameters<typeof referenceOwned>): Promise<typeof reference> => Promise.resolve(referenceOwned(...args)),
    assertOriginalCurrentPcbRenameStartup: startupOwned,
    revalidateCurrentPcbRenameStartupObservation: (...args: Parameters<typeof startupOwned>): Promise<typeof originalStartup> => {
      state.startupRechecks += 1; return Promise.resolve(startupOwned(...args));
    },
    assertExpectedFingerprint: (value: unknown): void => { assert.equal(value, source.source.expectedFingerprint); },
    validateSdkLocalRuntimeFingerprint: (value: unknown): void => { assert.equal(value, source.source.expectedFingerprint); },
    verifyCurrentProjectOnlySymbolPreflightImplementation: (value: unknown): Promise<void> => { assert.equal(value, "/synthetic/pinned-assets"); return Promise.resolve(); },
    currentSymbolClockEvidenceId: (value: unknown): string => { assert.equal(value, generation.operationId); return "synthetic-sidecar"; },
    buildCurrentAgedSqlRendererProgram: (value: unknown): string => {
      const request = bag(value); assert.equal(request["actor"], actor);
      assert.deepEqual(structuredClone(request["target"]), source.baseline.intent.target);
      return "synthetic-fixed-reader";
    },
    writePhaseArtifact: (id: unknown, sequence: unknown, phase: string): Promise<Bag> => {
      assert.equal(id, "synthetic-sidecar"); assert.equal(sequence, 0); state.writes.push(phase);
      if (failure === "publication" && phase === "current-aged-renderer-result") { return Promise.reject(new Error("Synthetic publication refusal")); }
      return Promise.resolve({ path: `/synthetic/${phase}.json`, bytes: 1, sha256: "d".repeat(64) });
    },
    readExactUtf8Artifact: (): Promise<void> => Promise.resolve(),
    decodeCurrentAgedSqlRendererReply: (value: unknown): never => { assert.equal(value, raw); throw new Error("Synthetic decode boundary stop"); },
  });
  const api = bag(runInContext(`${program}\n({collect:collectCurrentPcbAgedSqlClock,evidence:currentPcbAgedSqlCollectionEvidence});`, context));
  const invoke = (name: string, args: unknown[]): unknown => { const method = api[name]; assert.ok(typeof method === "function");
    return Reflect.apply(method, undefined, args) as unknown; };
  return { state, raw, run: async (copy): Promise<unknown> => await invoke("collect", [engine, copy === "generation" ? structuredClone(generation) : generation,
    copy === "reference" ? structuredClone(reference) : reference, copy === "startup" ? structuredClone(startup) : startup]),
  evidence: (copy = false): unknown => invoke("evidence", [copy ? structuredClone(generation) : generation, engine]) };
}

void test("PCB aged collection requires original PCB startup, reference and generation before consuming its read", async () => {
  const f = await fixture("decode");
  for (const copy of ["generation", "reference", "startup"] as const) { await assert.rejects(f.run(copy), /Synthetic original/u); }
  assert.equal(f.state.calls, 0); assert.equal(f.evidence(), undefined); assert.deepEqual(f.state.writes, []);
  await assert.rejects(f.run(), /decode boundary stop/u); assert.equal(f.state.calls, 1); assert.equal(f.state.startupRechecks, 1);
  await assert.rejects(f.run(), /already consumed/u);
});

void test("PCB aged collection retains original settled replies across startup loss, publication and decode refusals without retry", async () => {
  for (const failure of ["startup-after-reply", "publication", "decode"] as const) {
    const f = await fixture(failure); await assert.rejects(f.run(), /Synthetic/u);
    const evidence = bag(f.evidence()); assert.equal(evidence["raw"], f.raw); assert.equal(evidence["rawRetained"], true);
    assert.equal(evidence["beforeRetained"], true); assert.equal(evidence["afterRetained"], failure !== "startup-after-reply");
    assert.equal(evidence["failureObserved"], true); assert.equal(evidence["resultPublicationAttempted"], true); assert.equal(evidence["executionAuthorized"], false);
    assert.equal(f.evidence(true), undefined); f.state.startupCurrent = true;
    await assert.rejects(f.run(), /already consumed/u); assert.equal(f.state.calls, 1);
    assert.equal(f.state.clocks, failure === "startup-after-reply" ? 1 : 2);
    assert.deepEqual(f.state.writes, ["current-aged-renderer-intent", "current-aged-renderer-result"]);
  }
});
