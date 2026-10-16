/** Maintained collector with synthetic lifecycle issuers and I/O. These tests
 * do not validate a connected generation or grant production read authority.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { assertSubset, canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";

type Bag = Record<string, unknown>;
type Failure = "none" | "decode" | "retention" | "clear-release" | "fingerprint-before" | "fingerprint-after" | "source-after" | "return-copy";
function noOp(): undefined { return undefined; }
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
interface API {
  collect: (engine: unknown, generation: unknown, source: unknown) => Promise<unknown>;
  evidence: (generation: unknown, engine: unknown) => unknown;
  assert: (value: unknown, engine: unknown, generation: unknown) => unknown;
  provenance: (value: unknown, engine: unknown, generation: unknown) => unknown;
}
async function fixture(failure: Failure = "none"): Promise<{
  api: API; engine: object; generation: object; source: object; raw: Bag;
  state: { active: boolean; calls: number; statuses: number; records: string[]; cleanup: number };
}> {
  const generation = Object.freeze({ profile: "synthetic-generation", operationId: "synthetic-saved-read" });
  const continuation = Object.freeze({ synthetic: "original-continuation" });
  const source = Object.freeze({ profile: "synthetic-source", operationId: generation.operationId, sourceSha256: "a".repeat(64) });
  const lease = Object.freeze({ synthetic: "scope" }), raw = { synthetic: "original-raw" };
  const journal: Bag = { operationId: generation.operationId, artifacts: [], orphanedCallPossible: false };
  const fingerprint = { installedBundles: { assetsRoot: "/synthetic/assets" }, version: "exact" };
  const state = { active: true, calls: 0, statuses: 0, records: [] as string[], cleanup: 0 };
  const saved = { request: { synthetic: "fixed-request" } };
  const current = (scopeText?: string): void => {
    assert.equal(state.active, true);
    if (scopeText !== undefined) { assert.equal(scopeText, canonicalJson(lease)); }
  };
  const retained = { continuation, operationId: generation.operationId, expectedFingerprint: fingerprint, journal,
    current, revalidate: (): Promise<void> => { current(); return Promise.resolve(); },
    record: (phase: string): Promise<void> => {
      current(); state.records.push(phase);
      if (failure === "retention" && phase === "verify-saved-read-reply") { return Promise.reject(new Error("Synthetic retention failure")); }
      return Promise.resolve();
    },
    acceptMark: (before: unknown): Promise<Bag> => { assert.equal(bag(before)["orphanedCallPossible"], false); assert.equal(journal["orphanedCallPossible"], true); return Promise.resolve(structuredClone(journal)); },
    acceptClear: (marked: unknown): Promise<void> => { assert.equal(bag(marked)["orphanedCallPossible"], true); assert.equal(journal["orphanedCallPossible"], false); return Promise.resolve(); },
    retainEngineFailure: (marked: unknown): Promise<void> => { assert.equal(bag(marked)["orphanedCallPossible"], true); state.cleanup += 1; return Promise.resolve(); },
  };
  const engine = { upstream: { currentAuthenticatedBridgeDispatchBinding: (): object | undefined => state.active ? lease : undefined },
    status: (): Promise<Bag> => { state.statuses += 1; return Promise.resolve({ stableFingerprint: { ...fingerprint,
      version: failure === "fingerprint-before" || (failure === "fingerprint-after" && state.statuses === 2) ? "drift" : "exact" } }); },
    assertBridgeDispatchAllowed: (): Promise<void> => Promise.resolve(),
    dispatchWithOrphanTracking: async (received: unknown, phase: unknown, name: unknown, args: Bag, timeout: unknown,
      before: () => Promise<void>, retain: (value: unknown) => Promise<void>, beforeClear: () => Promise<void>): Promise<unknown> => {
      assert.equal(received, journal); assert.equal(phase, "current-symbol-verification-saved-read"); assert.equal(name, "easyeda_execute");
      assert.equal(args["code"], "fixed-saved-read"); assert.equal(args["confirmWrite"], true); assert.equal(timeout, 25_000);
      journal["orphanedCallPossible"] = true; await before(); state.calls += 1; await retain(raw); await beforeClear(); journal["orphanedCallPossible"] = false;
      if (failure === "clear-release") { throw new Error("Synthetic release after clear failed"); }
      return failure === "return-copy" ? { ...raw } : raw;
    },
  };
  const generationAssert = (value: unknown, received: unknown, scopeText?: string): typeof retained => {
    assert.equal(value, generation); assert.equal(received, engine); current(scopeText); return retained;
  };
  const sourceAssert = (value: unknown, received: unknown, prior: unknown): typeof saved => {
    assert.equal(value, source); assert.equal(received, engine); assert.equal(prior, continuation); return saved;
  };
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-symbol-saved-read.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ Object, Map, WeakMap, Error, Promise, structuredClone, canonicalJson, sha256Json, sha256Text, assertSubset,
    assertExpectedFingerprint: noOp, validateSdkLocalRuntimeFingerprint: noOp,
    verifyCurrentProjectOnlySymbolPreflightImplementation: noOp, verifyCurrentSymbolPersistenceImplementation: noOp,
    assertCurrentSymbolVerificationGeneration: generationAssert, revalidateCurrentSymbolVerificationGeneration: generationAssert,
    assertCurrentSavedSymbolSource: sourceAssert,
    revalidateCurrentSavedSymbolSource: (...args: Parameters<typeof sourceAssert>): typeof saved => {
      if (failure === "source-after" && state.calls > 0) { throw new Error("Synthetic preserved source changed"); } return sourceAssert(...args);
    },
    buildCurrentSavedSymbolReadProgram: (request: unknown): string => { assert.equal(request, saved.request); return "fixed-saved-read"; },
    decodeCurrentSavedSymbolReadReply: (value: unknown): object => { assert.equal(value, raw); if (failure === "decode") { throw new Error("Synthetic decode refusal"); } return { observation: { synthetic: "observation" } }; },
    verifyCurrentSavedSymbolContent: (): object => ({ exactContent: true, executionAuthorized: false }),
    CURRENT_SAVED_SYMBOL_READ_TIMEOUT_MS: 10_000,
  });
  const apiValue: unknown = runInContext(`${program}\n({collect:collectCurrentSavedSymbolContent,evidence:currentSavedSymbolReadEvidence,assert:assertCurrentSavedSymbolRead,provenance:assertCurrentSavedSymbolReadSource})`, context);
  assert.ok(isRecord(apiValue));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The isolated VM exposes only these four fixed maintained function declarations.
  return { api: apiValue as unknown as API, engine, generation, source, raw, state };
}

void test("current saved collector binds one original generation, reply and exact relation", async () => {
  const f = await fixture(), result = await f.api.collect(f.engine, f.generation, f.source);
  assert.equal(f.state.calls, 1); assert.equal(f.state.statuses, 2); assert.equal(f.state.cleanup, 0);
  assert.deepEqual(f.state.records, ["verify-saved-read-intent", "verify-saved-read-reply", "verify-saved-content-result"]);
  assert.equal(f.api.assert(result, f.engine, f.generation), result);
  assert.equal(bag(result)["exactSavedContent"], true); assert.equal(bag(result)["persistenceLifecycleComplete"], false);
  await assert.rejects(f.api.collect(f.engine, f.generation, f.source)); assert.equal(f.state.calls, 1);
  assert.throws(() => f.api.assert(structuredClone(result), f.engine, f.generation));
  assert.throws(() => f.api.assert(result, f.engine, { ...f.generation }));
  f.state.active = false;
  const retained = bag(f.api.provenance(result, f.engine, f.generation));
  assert.equal(retained["source"], f.source); assert.equal(f.state.calls, 1);
  assert.throws(() => f.api.provenance(structuredClone(result), f.engine, f.generation));
  bag(retained["observation"])["expectedActor"] = { forged: true };
  assert.throws(() => f.api.provenance(result, f.engine, f.generation));
  f.raw["synthetic"] = "changed"; assert.throws(() => f.api.assert(result, f.engine, f.generation));
});

void test("current saved collector refuses copied generations and absent dispatch scope before collection", async () => {
  const f = await fixture();
  await assert.rejects(f.api.collect(f.engine, { ...f.generation }, f.source));
  f.state.active = false; await assert.rejects(f.api.collect(f.engine, f.generation, f.source)); assert.equal(f.state.calls, 0);
});

void test("current saved collector retains raw failures and consumes once without issuing a saved result", async () => {
  for (const failure of ["decode", "retention", "clear-release", "fingerprint-after", "source-after", "return-copy"] as const) {
    const f = await fixture(failure);
    await assert.rejects(f.api.collect(f.engine, f.generation, f.source));
    const evidence = bag(f.api.evidence(f.generation, f.engine)); assert.equal(evidence["raw"], f.raw); assert.equal(evidence["result"], null);
    assert.equal(f.state.calls, 1); assert.equal(f.state.cleanup, failure === "retention" || failure === "clear-release" ? 1 : 0);
    assert.throws(() => f.api.assert(null, f.engine, f.generation));
    await assert.rejects(f.api.collect(f.engine, f.generation, f.source)); assert.equal(f.state.calls, 1);
  }
});

void test("current saved collector refuses runtime drift before native dispatch", async () => {
  const f = await fixture("fingerprint-before"); await assert.rejects(f.api.collect(f.engine, f.generation, f.source));
  assert.equal(f.state.calls, 0); assert.equal(bag(f.api.evidence(f.generation, f.engine))["rawRetained"], false);
});
