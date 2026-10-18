/** Isolated runtime control-flow harness, not native generation authority. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";

type Bag = Record<string, unknown>;
type Failure = "none" | "decode" | "sql-compare" | "result-publication" | "call" | "owner-after-return" | "source-after-return";
interface Harness { readonly run: () => Promise<Bag>; readonly assertOriginal: (value: unknown) => unknown; readonly evidence: () => Bag;
  readonly calls: string[]; readonly raw: object; readonly source: object }
async function fixture(failure: Failure = "none"): Promise<Harness> {
  const calls: string[] = [], generation = Object.freeze({ operationId: "synthetic-pcb-startup" }), lease = Object.freeze({ synthetic: "retained-scope" });
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ownerUuid: "c".repeat(32), pcbUuid: "d".repeat(16) };
  const history = Object.freeze({ semanticSha256: "1".repeat(64), projectUuid: target.projectUuid, branchUuid: target.branchUuid, projectOwnerUuid: target.ownerUuid });
  const baseline = { intent: { target, desiredTitle: "Renamed PCB" }, inventory: Object.freeze({ synthetic: "original-reader" }), history,
    rawHistorySha256: "2".repeat(64), maximumTicket: 100 };
  const projection = Object.freeze({ request: Object.freeze({ target, desiredTitle: baseline.intent.desiredTitle }),
    baseline: { historySha256: history.semanticSha256, rawHistorySha256: baseline.rawHistorySha256 }, maximumTicket: 100, projectionSha256: "3".repeat(64) });
  const source = { baseline, capture: Object.freeze({ synthetic: "original-capture" }), source: { expectedFingerprint: { installedBundles: { assetsRoot: "/synthetic/assets" } } } };
  const expectation = Object.freeze({ sheetUuids: ["e".repeat(16)], templates: [] }), raw = Object.freeze({ synthetic: "original-native-return" });
  const observation = Object.freeze({ runtimeObservation: { actor: { uuid: "f".repeat(32), username: "Observed", nickname: "UI only" } },
    clientTicketObservation: { client: "1".repeat(16), maxTicket: 100 } }); let returned = false;
  const engine = { upstream: { currentAuthenticatedBridgeDispatchBinding: (): typeof lease => lease,
    callTool: (name: unknown, args: Bag, timeout: unknown): Promise<unknown> => {
      assert.equal(name, "easyeda_execute"); assert.deepEqual(structuredClone(args), { code: "synthetic-fixed-startup", timeoutMs: 15_000, confirmWrite: true });
      assert.equal(timeout, 25_000); calls.push("native"); returned = true;
      return failure === "call" ? Promise.reject(new Error("synthetic-native-failure")) : Promise.resolve(raw);
    } }, assertBridgeDispatchAllowed: (): Promise<void> => { calls.push("admission"); return Promise.resolve(); } };
  const text = await readFile(new URL("../src/current-pcb-rename-startup-runtime.ts", import.meta.url), "utf8");
  const helper = /^function need\(.*$/mu.exec(text)?.[0]; assert.ok(helper !== undefined);
  const evidenceStart = text.indexOf("export function currentPcbRenameStartupCollectionEvidence("); const evidenceEnd = text.indexOf("/** One invocation", evidenceStart);
  const assertStart = text.indexOf("export function assertOriginalCurrentPcbRenameStartup("); const assertEnd = text.indexOf("export async function revalidateCurrentPcbRenameStartupObservation(", assertStart);
  const collectStart = text.indexOf("export async function collectCurrentPcbRenameStartupObservation("); assert.ok(collectStart > assertEnd && assertEnd > assertStart && evidenceStart > 0 && evidenceEnd > evidenceStart);
  const limitsStart = text.indexOf("const LIMITATIONS ="); const limitsEnd = text.indexOf("export interface", limitsStart);
  const program = stripTypeScriptTypes(`${helper}\n${text.slice(limitsStart, limitsEnd)}\n${text.slice(evidenceStart, evidenceEnd)}\n${text.slice(assertStart, assertEnd)}\n${text.slice(collectStart)}`)
    .replaceAll("export function", "function").replaceAll("export async function", "async function");
  const context = createContext({ Object, WeakMap, WeakSet, Promise, Error, AggregateError, canonicalJson, sha256Json, sha256Text,
    attempts: new WeakSet(), collections: new WeakMap(), issued: new WeakMap(), engine, generation,
    assertCurrentProjectOnlyPcbRenameGeneration: (value: unknown, selectedEngine: unknown, scope: unknown): typeof source => {
      assert.equal(value, generation); assert.equal(selectedEngine, engine); assert.equal(scope, canonicalJson(lease));
      if (returned && failure === "owner-after-return") { throw new Error("synthetic-owner-drift"); } return source;
    },
    assertOriginalCurrentPcbRenameGenerationEvidence: (value: unknown, selectedEngine: unknown, scope: unknown): typeof source => {
      assert.equal(value, generation); assert.equal(selectedEngine, engine); assert.equal(scope, canonicalJson(lease)); return source;
    },
    revalidateCurrentProjectOnlyPcbRenameGeneration: (): Promise<void> => { calls.push("generation-revalidation"); return Promise.resolve(); },
    prepareCurrentPcbNativeMetadata: (input: Bag): Promise<typeof projection> => {
      assert.deepEqual(Object.keys(input).toSorted(), ["before", "desiredTitle", "target"]); assert.equal(input["before"], baseline.inventory);
      assert.equal(input["target"], target); assert.equal(input["desiredTitle"], baseline.intent.desiredTitle); calls.push("original-projection"); return Promise.resolve(projection);
    },
    assertOriginalCurrentPcbNativeMetadata: (value: unknown, inventory: unknown): void => { assert.equal(value, projection); assert.equal(inventory, baseline.inventory); },
    compareCurrentPcbNativeMetadata: (value: unknown, inventory: unknown, result: unknown): void => {
      assert.equal(value, projection); assert.equal(inventory, baseline.inventory); assert.equal(result, observation); calls.push("sql-compare");
      if (failure === "sql-compare") { throw new Error("synthetic-sql-drift"); }
    },
    selectCurrentSymbolStartupExpectation: (value: unknown): typeof expectation => { assert.equal(value, history); calls.push("original-history"); return expectation; },
    assertExpectedFingerprint: (): void => { calls.push("fingerprint"); }, validateSdkLocalRuntimeFingerprint: (): void => { calls.push("runtime-pin"); },
    verifyCurrentProjectOnlySymbolPreflightImplementation: (): Promise<void> => {
      calls.push("source-pins"); return returned && failure === "source-after-return" ? Promise.reject(new Error("synthetic-source-drift")) : Promise.resolve();
    },
    verifyCurrentSymbolPersistenceImplementation: (): Promise<void> => { calls.push("persistence-pins"); return Promise.resolve(); },
    buildCurrentPcbRenameStartupObservation: (request: unknown, startup: unknown): string => {
      assert.equal(request, projection.request); assert.equal(startup, expectation); calls.push("compile"); return "synthetic-fixed-startup";
    },
    writePhaseArtifact: (_id: unknown, sequence: unknown, phase: string, value: Bag): Promise<unknown> => {
      assert.equal(sequence, 0); calls.push(phase);
      if (phase === "pcb-startup-result" && failure !== "call") { assert.equal(value["raw"], raw); }
      return phase === "pcb-startup-result" && failure === "result-publication" ? Promise.reject(new Error("synthetic-publication-failure"))
        : Promise.resolve({ path: `/synthetic/${phase}`, bytes: 1, sha256: "4".repeat(64) });
    },
    readExactUtf8Artifact: (): Promise<string> => { calls.push("intent-revalidation"); return Promise.resolve("synthetic-retained-intent"); },
    decodeCurrentPcbRenameStartupObservation: (value: unknown, request: unknown, startup: unknown): typeof observation => {
      assert.equal(value, raw); assert.equal(request, projection.request); assert.equal(startup, expectation); calls.push("decode");
      if (failure === "decode") { throw new Error("synthetic-decode-refusal"); } return observation;
    },
  });
  runInContext(program, context);
  return { calls, raw, source, run: async (): Promise<Bag> => {
    const result: unknown = await runInContext("collectCurrentPcbRenameStartupObservation(engine,generation)", context); assert.ok(isRecord(result)); return result;
  }, assertOriginal: (value: unknown): unknown => { context["selected"] = value; return runInContext("assertOriginalCurrentPcbRenameStartup(selected,engine,generation).source", context) as unknown; },
  evidence: (): Bag => { const value: unknown = runInContext("currentPcbRenameStartupCollectionEvidence(generation,engine)", context); assert.ok(isRecord(value)); return value; } };
}

void test("PCB startup collector uses original generation/history/SQL and retains result before decoding or revalidation", async () => {
  const env = await fixture(), token = await env.run(); assert.equal(env.assertOriginal(token), env.source);
  assert.equal(token["profile"], "private.current-pcb-rename-startup.v1"); assert.equal(token["runtimeHoldersObserved"], true); assert.equal(token["pcbAstSettledObserved"], true);
  for (const key of ["completeAstSourceBindingVerified", "startupLocalChangesExcluded", "permissionVerified", "backendActorVerified", "backendClockVerified",
    "producerBindingVerified", "writerAuthority", "crossInvocationReceiverContinuityVerified", "globalIdleVerified", "persistenceVerified", "executionAuthorized"]) { assert.equal(token[key], false); }
  assert.deepEqual(env.calls, ["generation-revalidation", "original-projection", "original-history", "fingerprint", "runtime-pin", "source-pins", "persistence-pins", "admission",
    "compile", "pcb-startup-intent", "intent-revalidation", "native", "pcb-startup-result", "decode", "sql-compare", "source-pins", "persistence-pins", "generation-revalidation"]);
  assert.equal(env.evidence()["raw"], env.raw); assert.equal(env.evidence()["rawRetained"], true); assert.equal(env.evidence()["failureObserved"], false);
  assert.throws(() => env.assertOriginal(structuredClone(token)), /observation refused/u); await assert.rejects(env.run(), /observation refused/u);
  assert.equal(env.calls.filter(value => value === "native").length, 1);
});

void test("PCB startup failures consume the attempt and retain native returns even if publication, ownership or checks fail", async () => {
  for (const failure of ["decode", "sql-compare", "result-publication", "call", "owner-after-return", "source-after-return"] as const) {
    const env = await fixture(failure); await assert.rejects(env.run(), /synthetic-/u);
    const evidence = env.evidence(); assert.equal(evidence["failureObserved"], true); assert.equal(evidence["resultPublicationAttempted"], true);
    assert.equal(evidence["rawRetained"], failure !== "call"); assert.equal(evidence["raw"], failure === "call" ? null : env.raw);
    assert.equal(evidence["resultArtifact"] === null, failure === "result-publication");
    await assert.rejects(env.run()); assert.equal(env.calls.filter(value => value === "native").length, 1);
    assert.equal(env.calls.filter(value => value === "pcb-startup-result").length, 1);
  }
});
