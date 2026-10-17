/** Real qualifier and no-repair selector; synthetic original-owner, file and
 * bridge boundaries. No native process, application or project is opened.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";
import { selectCurrentSymbolStartupExpectation } from "../src/current-symbol-startup.ts";
import { buildCurrentSymbolStartupObservation, decodeCurrentSymbolStartupObservation } from "../src/current-symbol-startup-runtime.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot, NativeObjectSnapshot } from "../src/native-history.ts";

type Bag = Record<string, unknown>;
const BRANCH = "b".repeat(32), OWNER = "9".repeat(32), PROJECT = "a".repeat(64), SCHEMATIC = "d".repeat(16), SHEET = "c".repeat(16), SOURCE = "e".repeat(16);
const META = { title: "Source", description: "Source drawing", tags: ["tag"], source: "template", docType: 2 };
function record(type: string, id: string, body: Bag): NativeObjectSnapshot { return { type, id, body, ticket: 1, client: null }; }
function document(uuid: string, docType: string, records: readonly NativeObjectSnapshot[]): NativeDocumentSnapshot {
  return { uuid, docType, records, metadata: { uuid, docType }, semanticSha256: sha256Json(records),
    documentRecordHistory: { profile: "easyeda.native-history.document-record-chain.v1", checkpointSha256: "2".repeat(64),
      documentUuid: uuid, recordCount: records.length + 1, maximumTicket: 1, chainSha256: "3".repeat(64), sha256: "4".repeat(64) } };
}
function history(): NativeHistorySnapshot {
  const documents = [document(SCHEMATIC, "SCH", [record("META", "META", {})]),
    document(SHEET, "SCH_PAGE", [record("META", "META", { schematic: SCHEMATIC }), record("COMPONENT", "component", { partId: "part", attrs: {} }),
      record("ATTR", "symbol-reference", { parentId: "component", key: "Symbol", value: SOURCE })]),
    document(SOURCE, "SYMBOL", [record("META", "META", META), record("PART", "part", {}), record("RECT", "rect", { partId: "part", x: 0 })])];
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: PROJECT, projectOwnerUuid: OWNER, branchUuid: BRANCH,
    headHistoryUuid: "1".repeat(32), checkpointSha256: "2".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1,
    documents, semanticSha256: sha256Json(documents) };
}
interface Options {
  readonly historyField?: "semantic" | "header" | "records";
  readonly blocker?: string;
  readonly planRefused?: boolean;
  readonly repair?: boolean;
  readonly failDecode?: boolean;
  readonly failResultPublication?: boolean;
  readonly failPinsAfterRead?: boolean;
  readonly changeReceiverAt?: string;
}
interface Harness {
  readonly calls: string[]; readonly source: Bag;
  readonly run: () => Promise<Bag>;
  readonly assert: (value: unknown, cloneGeneration?: boolean) => unknown;
  readonly revalidate: (value: unknown) => Promise<unknown>;
  readonly evidence: () => unknown;
}
async function fixture(options: Options = {}): Promise<Harness> {
  const calls: string[] = [], retained = history(), sourceDocument = retained.documents[2]; assert.ok(sourceDocument !== undefined);
  const expectation = selectCurrentSymbolStartupExpectation(retained), lease = Object.freeze({ original: "lease" });
  const generation = Object.freeze({ profile: "private.current-project-only-symbol-copy-generation.v1", operationId: "synthetic-copy-startup" });
  const plan = { source: { projectUuid: PROJECT, branchUuid: BRANCH, symbolUuid: SOURCE }, ownerUuid: OWNER,
    sourceMetadata: META, beforeRecordsSha256: retained.semanticSha256, beforeCheckpointSha256: "7".repeat(64), beforeSqlSha256: "8".repeat(64) };
  const baseline = { preparation: plan, inventory: Object.freeze({ logicalSha256: "8".repeat(64) }),
    copy: { sha256: "7".repeat(64) }, checkpoint: { checkpoint: "/synthetic/retained.eprj2", checkpointSha256: retained.checkpointSha256 },
    startupPremises: { sqlSchemaSupported: true, databaseVersion: "25.10.31.1", targetPcbSuppliesNonzeroNativeCount: true,
      activeSchematicPages: 1, blockers: [options.blocker ?? "active-schematic-pages"], historySemanticSha256: retained.semanticSha256 } };
  const source = { baseline, capture: { original: "capture" }, source: { purpose: "disposable-validation",
    expectedFingerprint: { installedBundles: { assetsRoot: "/synthetic/pinned-assets" } } },
  originalPreparation: { checkpointPreparation: { target: { ...plan.source, ownerUuid: OWNER }, sourceMetadata: META,
    sourceDocumentSemanticSha256: sourceDocument.semanticSha256, sourceDocumentHeaderSha256: sha256Json(sourceDocument.metadata),
    sourceDocumentRecordsSha256: sourceDocument.documentRecordHistory?.chainSha256 } } };
  const observation = options.failDecode === true ? { profile: "private.current-symbol-startup-failure.v1", stage: "symbol-template-cache", executionAuthorized: false }
    : { profile: "private.current-symbol-startup-observation.v1", projectUuid: PROJECT, branchUuid: BRANCH,
      sheetUuids: expectation.sheetUuids, templates: expectation.templates, executionAuthorized: false };
  const raw = { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(observation) } };
  const artifacts = new Map<string, unknown>();
  const engine = { upstream: { currentAuthenticatedBridgeDispatchBinding: (): typeof lease => lease,
    callTool: (tool: unknown, args: Bag, timeout: unknown): Promise<unknown> => {
      assert.equal(tool, "easyeda_execute"); assert.equal(args["timeoutMs"], 15_000); assert.equal(args["confirmWrite"], true); assert.equal(timeout, 25_000);
      assert.equal(args["code"], buildCurrentSymbolStartupObservation({ projectUuid: PROJECT, branchUuid: BRANCH }, expectation));
      calls.push("native-observation"); change("native-observation"); return Promise.resolve(raw);
    } }, assertBridgeDispatchAllowed: (): Promise<void> => { calls.push("bridge-admission"); return Promise.resolve(); } };
  function change(phase: string): void { if (phase === options.changeReceiverAt) { engine.upstream.callTool = (): Promise<unknown> => Promise.resolve(null); } }
  const text = await readFile(new URL("../src/current-symbol-copy-startup-runtime.ts", import.meta.url), "utf8");
  const start = text.indexOf("const attempts ="); assert.ok(start > 0);
  const code = stripTypeScriptTypes(text.slice(start)).replaceAll(/^export /gmu, "");
  const context = createContext({ Object, WeakMap, WeakSet, Error, AggregateError, canonicalJson, sha256Json, sha256Text,
    engine, generation, selectCurrentSymbolStartupExpectation, decodeCurrentSymbolStartupObservation,
    buildCurrentSymbolStartupObservation: (target: Parameters<typeof buildCurrentSymbolStartupObservation>[0], startup: Parameters<typeof buildCurrentSymbolStartupObservation>[1]): string =>
      buildCurrentSymbolStartupObservation(structuredClone(target), structuredClone(startup)),
    assertCurrentProjectOnlySymbolCopyGeneration: (value: unknown, selectedEngine: unknown, scope: unknown): typeof source => {
      assert.equal(value, generation); assert.equal(selectedEngine, engine); assert.equal(scope, canonicalJson(lease)); return source;
    },
    revalidateCurrentProjectOnlySymbolCopyGeneration: (): Promise<void> => { calls.push("owner-revalidation"); return Promise.resolve(); },
    assertCurrentSymbolCopyPlanInventory: (selected: unknown, inventory: unknown): void => {
      assert.equal(selected, plan); assert.equal(inventory, baseline.inventory); calls.push("original-plan");
      if (options.planRefused === true) { throw new Error("SYNTHETIC_ORIGINAL_PLAN_REQUIRED"); }
    },
    readNativeHistoryCheckpoint: (input: unknown): Promise<NativeHistorySnapshot> => {
      assert.deepEqual(structuredClone(input), { checkpointPath: baseline.checkpoint.checkpoint, expectedSha256: retained.checkpointSha256,
        projectUuid: PROJECT, libraryAtomHeaders: "preserve", documentRecordHistory: "preserve" }); calls.push("closed-history");
      const result = structuredClone(retained);
      if (options.historyField === "semantic") { return Promise.resolve({ ...result, semanticSha256: "0".repeat(64) }); }
      if (options.historyField === "header") { sourceDocument.metadata["new"] = "changed"; return Promise.resolve(retained); }
      if (options.historyField === "records") { return Promise.resolve({ ...result, documents: result.documents.map(item => {
        if (item.uuid !== SOURCE) { return item; }
        const { documentRecordHistory: _ignored, ...remaining } = item; return remaining;
      }) }); }
      if (options.repair === true) {
        const component = result.documents.find(item => item.uuid === SHEET)?.records.find(entry => entry.type === "COMPONENT");
        assert.ok(component !== undefined); component.body["partId"] = "different";
        return Promise.resolve(result);
      }
      return Promise.resolve(retained);
    },
    assertExpectedFingerprint: (): void => { calls.push("fingerprint"); },
    validateSdkLocalRuntimeFingerprint: (): void => { calls.push("runtime-pin"); },
    verifyCurrentProjectOnlySymbolPreflightImplementation: (): Promise<void> => {
      calls.push("source-pins");
      return options.failPinsAfterRead === true && calls.includes("native-observation") ? Promise.reject(new Error("SYNTHETIC_PIN_DRIFT")) : Promise.resolve();
    },
    verifyCurrentSymbolPersistenceImplementation: (): Promise<void> => { calls.push("persistence-pins"); return Promise.resolve(); },
    writePhaseArtifact: (_id: unknown, _sequence: unknown, phase: string, data: unknown): Promise<unknown> => {
      calls.push(phase); change(phase);
      if (phase === "startup-result" && options.failResultPublication === true) { return Promise.reject(new Error("SYNTHETIC_PUBLICATION_FAILURE")); }
      const path = `/synthetic/${phase}.json`; artifacts.set(path, data); return Promise.resolve({ path, bytes: 1, sha256: "1".repeat(64) });
    },
    readExactUtf8Artifact: (artifact: { path: string }): Promise<string> => {
      assert.ok(artifacts.has(artifact.path)); calls.push("artifact-revalidation"); return Promise.resolve(JSON.stringify(artifacts.get(artifact.path)));
    },
  });
  runInContext(code, context);
  return { calls, source,
    run: async (): Promise<Bag> => { const value: unknown = await runInContext("qualifyCurrentSymbolCopyStartup(engine,generation)", context); assert.ok(isRecord(value)); return value; },
    assert(value, cloneGeneration = false): unknown { context["value"] = value; context["selectedGeneration"] = cloneGeneration ? structuredClone(generation) : generation;
      return runInContext("assertCurrentSymbolCopyStartup(value,engine,selectedGeneration)", context) as unknown; },
    revalidate(value): Promise<unknown> { context["value"] = value; return Promise.resolve(runInContext("revalidateCurrentSymbolCopyStartup(value,engine,generation)", context) as unknown); },
    evidence(): unknown { return runInContext("currentSymbolCopyStartupCollectionEvidence(generation,engine)", context) as unknown; },
  };
}

void test("copy startup admits a referenced drawn source with its original no-repair baseline and no writer authority", async () => {
  const env = await fixture(), token = await env.run();
  assert.equal(token["profile"], "private.current-symbol-copy-startup.v1"); assert.equal(token["executionAuthorized"], false);
  assert.equal(token["liveSourceInvarianceVerified"], false); assert.equal(token["persistenceVerified"], false); assert.ok(Object.isFrozen(token));
  const original = env.assert(token); assert.ok(isRecord(original)); assert.equal(original["source"], env.source);
  assert.equal(env.calls.filter(call => call === "native-observation").length, 1);
  await env.revalidate(token); assert.equal(env.calls.filter(call => call === "native-observation").length, 1);
  assert.throws(() => env.assert(structuredClone(token))); assert.throws(() => env.assert(token, true));
  await assert.rejects(env.run(), /qualification refused/u);
});

void test("copy startup refuses missing original plan, baseline drift, unsupported startup and repair inputs before native calls", async () => {
  for (const options of [{ planRefused: true }, { historyField: "semantic" }, { historyField: "header" }, { historyField: "records" },
    { blocker: "unsupported-sql-schema" }, { repair: true }] as const) {
    const env = await fixture(options); await assert.rejects(env.run());
    assert.equal(env.calls.includes("native-observation"), false); assert.equal(env.calls.includes("startup-intent"), false);
    await assert.rejects(env.run(), /qualification refused/u);
  }
});

void test("copy startup consumes failures and retains native returns before decoder, owner or publication failure", async () => {
  for (const options of [{ failDecode: true }, { failResultPublication: true }, { failPinsAfterRead: true },
    { changeReceiverAt: "native-observation" }, { changeReceiverAt: "startup-result" }] as const) {
    const env = await fixture(options); await assert.rejects(env.run());
    const evidence = env.evidence(); assert.ok(isRecord(evidence));
    assert.equal(evidence["rawRetained"], true); assert.equal(evidence["failureObserved"], true);
    assert.equal(evidence["resultPublicationAttempted"], true); assert.equal(evidence["executionAuthorized"], false);
    assert.equal(env.calls.filter(call => call === "native-observation").length, 1);
    await assert.rejects(env.run(), /qualification refused/u);
    assert.equal(env.calls.filter(call => call === "startup-result").length, 1);
  }
  const before = await fixture({ changeReceiverAt: "startup-intent" }); await assert.rejects(before.run());
  assert.equal(before.calls.includes("native-observation"), false);
  const evidence = before.evidence(); assert.ok(isRecord(evidence)); assert.equal(evidence["rawRetained"], false);
});
