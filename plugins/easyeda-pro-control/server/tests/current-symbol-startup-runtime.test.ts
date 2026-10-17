/** Run the maintained qualifier with synthetic native and checkpoint boundaries.
 * The complete-history startup selector is real; no live owner is allocated.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";
import { selectCurrentSymbolStartupExpectation } from "../src/current-symbol-startup.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot, NativeObjectSnapshot } from "../src/native-history.ts";

type Bag = Record<string, unknown>;
const BRANCH = "b".repeat(32), PROJECT = "a".repeat(64), SCHEMATIC = "d".repeat(16), SHEET = "c".repeat(16);
const OPERATION_ID = "synthetic-startup-reference-check", UNUSED = "f".repeat(16), USED = "e".repeat(16);
function record(type: string, id: string, body: Bag): NativeObjectSnapshot { return { type, id, body, ticket: 1, client: null }; }
function document(uuid: string, docType: string, records: readonly NativeObjectSnapshot[]): NativeDocumentSnapshot {
  return { uuid, docType, records, metadata: {}, semanticSha256: sha256Json(records) };
}
function history(): NativeHistorySnapshot {
  const documents = [
    document(SCHEMATIC, "SCH", [record("META", "META", {})]),
    document(SHEET, "SCH_PAGE", [record("META", "META", { schematic: SCHEMATIC }),
      record("COMPONENT", "component", { partId: "part", attrs: {} }),
      record("ATTR", "symbol-reference", { parentId: "component", key: "Symbol", value: USED })]),
    ...[USED, UNUSED].map((uuid) => document(uuid, "SYMBOL", [record("META", "META", { docType: 2 }), record("PART", "part", {})])),
  ];
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: PROJECT, branchUuid: BRANCH,
    headHistoryUuid: "1".repeat(32), checkpointSha256: "2".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1,
    documents, semanticSha256: sha256Json(documents) };
}
interface Harness {
  readonly calls: string[];
  readonly run: () => Promise<Bag>;
  readonly original: (value: unknown) => unknown;
  readonly source: object;
}
async function fixture(symbolUuid: string, purpose: "disposable-validation" | "ordinary-symbol-metadata", historyMismatch = false): Promise<Harness> {
  const calls: string[] = [], retainedHistory = history();
  const expectation = selectCurrentSymbolStartupExpectation(retainedHistory);
  const generation = Object.freeze({ operationId: OPERATION_ID }), lease = Object.freeze({ synthetic: "original-lease" });
  const baseline = { checkpoint: { checkpoint: "/synthetic/baseline.eprj2", checkpointSha256: retainedHistory.checkpointSha256 },
    preparation: { target: { projectUuid: PROJECT, branchUuid: BRANCH, symbolUuid } },
    startupPremises: { sqlSchemaSupported: true, databaseVersion: "25.10.31.1", targetPcbSuppliesNonzeroNativeCount: true,
      blockers: ["active-schematic-pages"], activeSchematicPages: 1, historySemanticSha256: retainedHistory.semanticSha256 } };
  const source = { baseline, capture: { synthetic: "original-capture" }, source: { purpose, startupExpectation: expectation,
    expectedFingerprint: { installedBundles: { assetsRoot: "/synthetic/assets" } } } };
  const raw = Object.freeze({ synthetic: "startup-observation-result" });
  const engine = { upstream: {
    currentAuthenticatedBridgeDispatchBinding: (): typeof lease => lease,
    callTool: (tool: unknown, args: Bag, timeout: unknown): Promise<unknown> => {
      assert.equal(tool, "easyeda_execute"); assert.equal(args["code"], "synthetic-startup-observation");
      assert.equal(args["timeoutMs"], 15_000); assert.equal(args["confirmWrite"], true); assert.equal(timeout, 25_000);
      calls.push("native-observation"); return Promise.resolve(raw);
    },
  }, assertBridgeDispatchAllowed: (): Promise<void> => { calls.push("bridge-admission"); return Promise.resolve(); } };
  const text = await readFile(new URL("../src/current-symbol-startup-runtime.ts", import.meta.url), "utf8");
  const helper = /^function need\(.*$/mu.exec(text)?.[0], start = text.indexOf("export async function qualifyCurrentSymbolWriterStartup(");
  assert.ok(start > 0 && helper !== undefined);
  const program = stripTypeScriptTypes(`${helper}\n${text.slice(start)}`).replace("export async function", "async function");
  const context = createContext({ Object, WeakMap, WeakSet, Promise, Error, AggregateError, canonicalJson, sha256Json, sha256Text,
    attempts: new WeakSet(), collections: new WeakMap(), issued: new WeakMap(), engine, generation,
    selectCurrentSymbolStartupExpectation,
    assertCurrentProjectOnlySymbolGeneration: (received: unknown, receivedEngine: unknown, scope: unknown): typeof source => {
      assert.equal(received, generation); assert.equal(receivedEngine, engine); assert.equal(scope, canonicalJson(lease)); return source;
    },
    revalidateCurrentProjectOnlySymbolGeneration: (): Promise<void> => { calls.push("owner-revalidation"); return Promise.resolve(); },
    readNativeHistoryCheckpoint: (input: unknown): Promise<NativeHistorySnapshot> => {
      assert.deepEqual(structuredClone(input), { checkpointPath: baseline.checkpoint.checkpoint, expectedSha256: retainedHistory.checkpointSha256,
        projectUuid: PROJECT, libraryAtomHeaders: "preserve" }); calls.push("closed-history");
      return Promise.resolve(historyMismatch ? { ...retainedHistory, semanticSha256: "0".repeat(64) } : retainedHistory);
    },
    assertExpectedFingerprint: (): void => { calls.push("fingerprint"); },
    validateSdkLocalRuntimeFingerprint: (): void => { calls.push("runtime-pin"); },
    verifyCurrentProjectOnlySymbolPreflightImplementation: (): Promise<void> => { calls.push("source-pins"); return Promise.resolve(); },
    verifyCurrentSymbolPersistenceImplementation: (): Promise<void> => { calls.push("persistence-pins"); return Promise.resolve(); },
    buildCurrentSymbolStartupObservation: (target: unknown, selected: unknown): string => {
      assert.deepEqual(structuredClone(target), { projectUuid: PROJECT, branchUuid: BRANCH }); assert.deepEqual(selected, expectation);
      calls.push("compile-observation"); return "synthetic-startup-observation";
    },
    writePhaseArtifact: (_id: unknown, _sequence: unknown, phase: string): Promise<unknown> => {
      calls.push(phase); return Promise.resolve({ path: `/synthetic/${phase}.json`, bytes: 1, sha256: "3".repeat(64) });
    },
    readExactUtf8Artifact: (): Promise<string> => { calls.push("intent-revalidation"); return Promise.resolve("synthetic-intent"); },
    decodeCurrentSymbolStartupObservation: (observed: unknown, target: unknown, selected: unknown): void => {
      assert.equal(observed, raw); assert.deepEqual(structuredClone(target), { projectUuid: PROJECT, branchUuid: BRANCH });
      assert.deepEqual(selected, expectation); calls.push("decode-observation");
    },
  });
  runInContext(program, context);
  return { calls, source,
    run: async (): Promise<Bag> => {
      const result: unknown = await runInContext("qualifyCurrentSymbolWriterStartup(engine,generation)", context);
      assert.ok(isRecord(result)); return result;
    },
    original: (value: unknown): unknown => { context["selectedToken"] = value; return runInContext("issued.get(selectedToken)?.source", context) as unknown; },
  };
}

void test("startup qualification rejects a referenced target before native observation, artifacts or writer transfer", async () => {
  for (const purpose of ["disposable-validation", "ordinary-symbol-metadata"] as const) {
    const selected = await fixture(USED, purpose);
    await assert.rejects(selected.run(), { message: "Current symbol writer refuses referenced-symbol propagation: native linked-sheet updates are unsupported." });
    assert.deepEqual(selected.calls, ["owner-revalidation", "closed-history"]);
    await assert.rejects(selected.run(), /qualification refused/u);
    assert.deepEqual(selected.calls, ["owner-revalidation", "closed-history"]);
  }
});

void test("unused targets retain the complete original startup qualification and non-authorizing token", async () => {
  for (const purpose of ["disposable-validation", "ordinary-symbol-metadata"] as const) {
    const selected = await fixture(UNUSED, purpose), token = await selected.run();
    assert.equal(token["profile"], "private.current-symbol-writer-startup.v1"); assert.equal(token["operationId"], OPERATION_ID);
    assert.equal(token["executionAuthorized"], false); assert.equal(token["runtimeHoldersObserved"], true);
    assert.equal(selected.original(token), selected.source);
    assert.deepEqual(selected.calls, ["owner-revalidation", "closed-history", "fingerprint", "runtime-pin", "source-pins", "persistence-pins",
      "bridge-admission", "compile-observation", "startup-intent", "intent-revalidation", "native-observation", "startup-result",
      "decode-observation", "source-pins", "persistence-pins", "owner-revalidation"]);
  }
});

void test("the referenced-target prerequisite cannot replace complete closed-history identity verification", async () => {
  for (const target of [USED, UNUSED]) {
    const selected = await fixture(target, "disposable-validation", true);
    await assert.rejects(selected.run(), { message: "Current symbol writer startup qualification refused." });
    assert.deepEqual(selected.calls, ["owner-revalidation", "closed-history"]);
  }
});
