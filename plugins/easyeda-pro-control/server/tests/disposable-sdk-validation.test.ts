import assert from "node:assert/strict";
import { test } from "node:test";
import { assertSubset, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { parseDisposableSdkValidationPlan, runDisposableSdkValidation } from "../src/disposable-sdk-validation.ts";
import type { DisposableSdkFacade, DisposableSdkValidationPlan } from "../src/disposable-sdk-validation.ts";
import { validatePublicSdkReadPayload } from "../src/public-sdk-read.ts";

function fingerprint(): ExpectedFingerprint {
  const manifest = loadReviewedCompatibilityManifest(), projection = manifest.facadeImplementation["source-tree"];
  return {
    facadeImplementation: { ...projection, mode: "source-tree", files: projection.files.map((entry) => ({ path: `/test/src/${entry.relativePath}`, relativePath: entry.relativePath, bytes: entry.bytes, sha256: entry.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: structuredClone(manifest.upstream.launcher), upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCatalogSha256: manifest.upstream.toolCatalog.sha256, toolCount: manifest.upstream.toolCatalog.count,
    health: { payload: { version: manifest.connectedRuntime.healthVersion, node_version: manifest.connectedRuntime.nodeVersion, bridge_connected: true,
      easyeda_version: manifest.connectedRuntime.easyedaVersion, extension_version: manifest.connectedRuntime.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: manifest.connectedRuntime.bridgeVersion, diagnostics: { method_registry_hash: manifest.connectedRuntime.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: "loader_status", dispatcher_build_id: manifest.connectedRuntime.dispatcher.buildId, total: manifest.connectedRuntime.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: "/test/assets", pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/test/assets/pcb.js" },
      publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/test/assets/api.js", adapterPath: "/test/assets/api-types.js", declarationsPath: "/test/assets/api.d.ts" } },
  };
}
function source(uuid = "board", extra = "", docType = "PCB"): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify({ uuid, docType, editVersion: "3.2.149.88089769" })}|\n{"type":"META","id":"META"}||${JSON.stringify({ title: `Disposable${extra}` })}|\n`;
}
function sourceDocumentType(type: 1 | 2 | 3 | 4): string { return ({ 1: "SCH_PAGE", 2: "SYMBOL", 3: "PCB", 4: "PCB" })[type]; }
function plan(type: 1 | 2 | 3 | 4 = 3): DisposableSdkValidationPlan {
  const baselineSource = source("board", "", sourceDocumentType(type));
  return parseDisposableSdkValidationPlan({ schema: "easyeda-pro-control.disposable-sdk-validation-plan.v1",
    fixture: { category: "disposable", projectUuid: "fixture", projectPath: "/test/disposable.eprj2", attestation: "This project is disposable and is authorized for SDK read validation." },
    expectedContext: { project: { uuid: "fixture", path: "/test/disposable.eprj2" }, document: { uuid: "board", documentType: type, tabId: "board@fixture",
      ...([2, 4].includes(type) ? { parentLibraryUuid: "observed-metadata-owner" } : {}) } },
    expectedFingerprint: fingerprint(), checkpoint: { receiptPath: "/test/checkpoint.receipt.json", sourceSha256: "1".repeat(64), sourceDumpSha256: "2".repeat(64) },
    baselineSourceSha256: parseDocumentSource(baselineSource).sha256,
    steps: [{ id: "conversion", request: { method: "eda.sys_Unit.mmToMil", arguments: { mm: 25.4 } } }, { id: "edition", request: { method: "eda.sys_Environment.isClient", arguments: {} } }],
  });
}
function consistent(payload: Record<string, unknown>, sdk = false): Record<string, unknown> {
  return { ...payload, ...(sdk ? { authority: "public-sdk-observation-not-complete-design-proof" } : {}), read_consistency: {
    stable: true, attempts: 2, snapshotSha256: sha256Json(payload), contextBinding: { level: "active-context-stability-required", preAndPostChecked: true, switchAwayAndBackDetectable: false },
  } };
}
function sourceRequest(type: 1 | 2 | 3 | 4): { kind: "schematic-source" | "symbol-source" | "pcb-source" | "footprint-source" } {
  switch (type) {
    case 1: { return { kind: "schematic-source" }; }
    case 2: { return { kind: "symbol-source" }; }
    case 3: { return { kind: "pcb-source" }; }
    case 4: { return { kind: "footprint-source" }; }
    default: { throw new Error("Unknown test editor."); }
  }
}
function sourceResult(value = source(), type: 1 | 2 | 3 | 4 = 3): Record<string, unknown> {
  return consistent({ ok: true, ...sourceRequest(type), documentType: type, source: value, utf8Bytes: Buffer.byteLength(value), authority: { source: "sys_FileManager.getDocumentSource" }, limitations: [] });
}
interface Fixture {
  facade: DisposableSdkFacade;
  calls: string[];
  checkpoint: Record<string, unknown>;
  source: Record<string, unknown>;
  actualContext: DisposableSdkValidationPlan["expectedContext"];
  alter?: (phase: string, count: number) => unknown;
}
function fixture(input: DisposableSdkValidationPlan): Fixture {
  const result: Fixture = {
    calls: [], checkpoint: { ok: true, source: input.fixture.projectPath, receiptPath: input.checkpoint.receiptPath, checkpoint: "/test/checkpoint.eprj2", checkpointMatchesReceipt: true,
      sourceEqualsCheckpoint: true, sourceMatchesReceipt: true, sourceChanged: false, sourceSha256: input.checkpoint.sourceSha256, sourceDumpSha256: input.checkpoint.sourceDumpSha256,
      checkpointSha256: "3".repeat(64), checkpointDumpSha256: input.checkpoint.sourceDumpSha256 },
    source: sourceResult(source("board", "", sourceDocumentType(input.expectedContext.document.documentType)), input.expectedContext.document.documentType),
    actualContext: structuredClone(input.expectedContext),
    facade: {
      verifyCheckpoint: (receipt) => { assert.equal(receipt, input.checkpoint.receiptPath); result.calls.push("checkpoint"); return Promise.resolve(result.alter?.("checkpoint", result.calls.length) ?? result.checkpoint); },
      exactSource: (request, context, expectedFingerprint) => {
        assert.deepEqual(request, sourceRequest(input.expectedContext.document.documentType)); assert.deepEqual(context, input.expectedContext); assert.deepEqual(expectedFingerprint, input.expectedFingerprint);
        result.calls.push("source"); assertSubset(result.actualContext, context, "Active EasyEDA context");
        return Promise.resolve(result.alter?.("source", result.calls.length) ?? result.source);
      },
      sdkRead: (request, context, expectedFingerprint) => {
        assert.deepEqual(context, input.expectedContext); assert.deepEqual(expectedFingerprint, input.expectedFingerprint);
        assertSubset(result.actualContext, context, "Active EasyEDA context");
        result.calls.push(request.method);
        const payload = validatePublicSdkReadPayload({ ok: true, kind: "public-sdk-read", method: request.method, present: true,
          value: request.method === "eda.sys_Unit.mmToMil" ? 1000 : true, undefinedPaths: [] }, request);
        return Promise.resolve(result.alter?.("sdk", result.calls.length) ?? consistent(payload, true));
      },
    },
  };
  return result;
}

void test("disposable SDK validation defaults to a zero-dispatch dry plan", async () => {
  const input = plan();
  const f = fixture(input);
  const result = await runDisposableSdkValidation(input, { facade: f.facade });
  assert.equal(result["mode"], "dry-run"); assert.equal(result["liveDispatched"], false); assert.deepEqual(f.calls, []);
  await assert.rejects(runDisposableSdkValidation(input, { mode: "execute" }), /already-owned/u);
});
void test("disposable plan rejects nonfixtures, wrong identities, missing fingerprints, duplicate IDs and every write/raw method", () => {
  const input = plan();
  for (const invalid of [
    { ...input, fixture: { ...input.fixture, category: "production" } }, { ...input, fixture: { ...input.fixture, projectPath: "/test/other.eprj2" } },
    { ...input, fixture: { ...input.fixture, projectUuid: "other" } }, { ...input, expectedFingerprint: {} },
    { ...input, steps: [input.steps[0], input.steps[0]] }, { ...input, steps: [] }, { ...input, steps: Array.from({ length: 257 }, (_, index) => ({ id: `step${index}`, request: input.steps[0]?.request })) },
    { ...input, steps: [{ id: "write", request: { method: "eda.pcb_Document.save", arguments: {} } }] },
    { ...input, steps: [{ id: "code", request: { code: "mutate()" } }] }, { ...input, tool: "easyeda_execute" },
    { ...input, expectedContext: { ...input.expectedContext, document: { ...input.expectedContext.document, documentType: 26 } } },
  ]) { assert.throws(() => parseDisposableSdkValidationPlan(invalid)); }
});
void test("each SDK request is bracketed by complete source and exact checkpoint invariance without Save or navigation", async () => {
  const input = plan();
  const events: Record<string, unknown>[] = [], f = fixture(input);
  const result = await runDisposableSdkValidation(input, { mode: "execute", facade: f.facade, record: (event) => { events.push(structuredClone(event)); return Promise.resolve(); } });
  assert.equal(result["outcome"], "completed"); assert.equal(result["sdkDispatches"], 2); assert.equal(result["writerValidation"], false);
  assert.deepEqual(f.calls, ["checkpoint", "source", "eda.sys_Unit.mmToMil", "source", "checkpoint", "checkpoint", "source", "eda.sys_Environment.isClient", "source", "checkpoint"]);
  assert.deepEqual(events.map((event) => event["phase"]), ["intent", "sdk-read-intent", "step-completed", "sdk-read-intent", "step-completed", "completed"]);
});
void test("a complete realistic source longer than the identifier bound is accepted", async () => {
  const input = plan(), largeSource = source("board", "x".repeat(10_000));
  input.baselineSourceSha256 = parseDocumentSource(largeSource).sha256;
  const f = fixture(input); f.source = sourceResult(largeSource);
  const result = await runDisposableSdkValidation(input, { mode: "execute", facade: f.facade });
  assert.equal(result["outcome"], "completed"); assert.equal(result["sdkDispatches"], 2);
});
void test("all four editor profiles preserve their original native source and semantic commitment", async () => {
  for (const type of [1, 2, 3, 4] as const) {
    const input = plan(type);
    const events: Record<string, unknown>[] = [];
    const f = fixture(input), retainedPlan = structuredClone(input), retainedSource = structuredClone(f.source);
    const result = await runDisposableSdkValidation(input, { mode: "execute", facade: f.facade,
      record: (event) => { events.push(structuredClone(event)); return Promise.resolve(); } });
    assert.equal(result["outcome"], "completed"); assert.equal(result["sdkDispatches"], 2);
    assert.deepEqual(f.source, retainedSource); assert.deepEqual(input, retainedPlan);
    assert.deepEqual(events.filter((event) => event["phase"] === "step-completed").map((event) => event["sourceSha256"]),
      input.steps.map(() => input.baselineSourceSha256));
    if (type === 4) { assert.equal(parseDocumentSource(String(f.source["source"])).document["docType"], "PCB"); }
  }
});
void test("library plans retain observed owners and refuse missing owners, foreign tabs and conflicting project parents", () => {
  for (const type of [2, 4] as const) {
    const input = plan(type);
    const document = input.expectedContext.document;
    assert.equal(document.parentLibraryUuid, "observed-metadata-owner");
    for (const invalid of [
      { uuid: document.uuid, documentType: type, tabId: document.tabId }, { ...document, parentLibraryUuid: "" },
      { ...document, tabId: "board@another-project" }, { ...document, tabId: "another-library-document@fixture" },
      { ...document, parentProjectUuid: "another-project" },
    ]) { assert.throws(() => parseDisposableSdkValidationPlan({ ...input, expectedContext: { ...input.expectedContext, document: invalid } })); }
  }
  const input = plan();
  input.expectedContext.document.parentProjectUuid = input.fixture.projectUuid;
  assert.equal(parseDisposableSdkValidationPlan(input).expectedContext.document.parentProjectUuid, "fixture");
});
void test("a changed observed library owner is retained for facade refusal before any SDK dispatch", async () => {
  for (const type of [2, 4] as const) {
    const input = plan(type);
    const f = fixture(input);
    f.actualContext.document.parentLibraryUuid = "different-owner";
    const result = await runDisposableSdkValidation(input, { mode: "execute", facade: f.facade });
    assert.equal(result["outcome"], "stopped"); assert.equal(result["phase"], "source-before"); assert.equal(result["sdkDispatches"], 0);
    assert.deepEqual(f.calls, ["checkpoint", "source"]);
  }
});
void test("shared PCB headers cannot substitute an editor type and FOOTPRINT headers are never rewritten", async () => {
  for (const [type, responseType, header] of [[3, 4, "PCB"], [4, 3, "PCB"], [4, 4, "FOOTPRINT"], [3, 3, "FOOTPRINT"], [2, 2, "PCB"], [1, 1, "PCB"]] as const) {
    const input = plan(type), value = source("board", "", header);
    const f = fixture(input);
    input.baselineSourceSha256 = parseDocumentSource(value).sha256;
    f.source = sourceResult(value, responseType);
    const result = await runDisposableSdkValidation(input, { mode: "execute", facade: f.facade });
    assert.equal(result["outcome"], "stopped"); assert.equal(result["phase"], "source-before"); assert.equal(result["sdkDispatches"], 0);
    assert.deepEqual(f.calls, ["checkpoint", "source"]); assert.equal(f.source["source"], value);
  }
});
void test("source validation shares the maintained UTF-8 byte limit rather than a character-count substitute", async () => {
  const input = plan(), value = source("board", "界".repeat(1_048_576));
  const f = fixture(input);
  assert.ok(value.length < 3 * 1024 * 1024); assert.ok(Buffer.byteLength(value) > 3 * 1024 * 1024);
  input.baselineSourceSha256 = parseDocumentSource(value).sha256; f.source = sourceResult(value);
  const result = await runDisposableSdkValidation(input, { mode: "execute", facade: f.facade });
  assert.equal(result["outcome"], "stopped"); assert.equal(result["phase"], "source-before"); assert.equal(result["sdkDispatches"], 0);
});
void test("read adapters must unwrap complete evidence results and never substitute summary or receipt-only output", async () => {
  for (const phase of ["source", "sdk"]) {
    for (const wrapped of ["full", "summary", "receipt-only"]) {
      const input = plan();
      const f = fixture(input);
      f.alter = (current): unknown => {
        if (current !== phase) { return null; }
        const evidence = { resultPath: "/test/evidence.json" }, summary = { jsonBytes: 4096 };
        return wrapped === "full" ? { result: f.source, summary, evidence } : { summary, evidence, ...(wrapped === "receipt-only" ? { inlineResultOmitted: true } : {}) };
      };
      const result = await runDisposableSdkValidation(input, { mode: "execute", facade: f.facade });
      assert.equal(result["outcome"], "stopped"); assert.equal(result["phase"], phase === "source" ? "source-before" : "sdk-read");
      assert.equal(result["sdkDispatches"], phase === "source" ? 0 : 1); assert.deepEqual(result["completed"], []);
      assert.equal(f.calls.length, phase === "source" ? 2 : 3);
    }
  }
});
void test("an unrelated or physically changed checkpoint refuses before any SDK read", async () => {
  for (const patch of [{ source: "/test/other.eprj2" }, { receiptPath: "/test/other.json" }, { sourceSha256: "9".repeat(64) },
    { sourceDumpSha256: "9".repeat(64) }, { checkpointDumpSha256: "9".repeat(64) }, { sourceChanged: true }, { sourceEqualsCheckpoint: false }]) {
    const input = plan();
    const f = fixture(input); Object.assign(f.checkpoint, patch);
    const result = await runDisposableSdkValidation(input, { mode: "execute", facade: f.facade });
    assert.equal(result["outcome"], "stopped"); assert.equal(result["phase"], "checkpoint-before"); assert.equal(result["sdkDispatches"], 0); assert.deepEqual(f.calls, ["checkpoint"]);
  }
});
void test("wrong source identity, altered native records and forged stable hashes refuse before a read", async () => {
  for (const invalid of [sourceResult(source("other")), sourceResult(source("board", " changed")), { ...sourceResult(), source: "truncated" }, { ...sourceResult(), read_consistency: { stable: true } }]) {
    const input = plan();
    const f = fixture(input); f.source = invalid;
    const result = await runDisposableSdkValidation(input, { mode: "execute", facade: f.facade });
    assert.equal(result["outcome"], "stopped"); assert.equal(result["phase"], "source-before"); assert.equal(result["sdkDispatches"], 0); assert.deepEqual(f.calls, ["checkpoint", "source"]);
  }
});
void test("ambiguous SDK failure stops once without a retry or any later bridge work", async () => {
  const input = plan();
  const f = fixture(input);
  f.alter = (phase): unknown => { if (phase === "sdk") { throw new Error("private native failure text"); } return null; };
  const result = await runDisposableSdkValidation(input, { mode: "execute", facade: f.facade });
  assert.equal(result["outcome"], "stopped"); assert.equal(result["sdkDispatches"], 1); assert.equal(result["phase"], "sdk-read");
  assert.deepEqual(f.calls, ["checkpoint", "source", "eda.sys_Unit.mmToMil"]); assert.ok(!JSON.stringify(result).includes("private native failure text"));
});
void test("post-read source or checkpoint drift stops before the next planned method", async () => {
  for (const failure of ["source", "checkpoint"]) {
    const input = plan();
    const f = fixture(input);
    f.alter = (phase, count): unknown => {
      if (phase === failure && count >= 4) { return phase === "source" ? sourceResult(source("board", " drift")) : { ...f.checkpoint, sourceMatchesReceipt: false }; }
      return null;
    };
    const result = await runDisposableSdkValidation(input, { mode: "execute", facade: f.facade });
    assert.equal(result["outcome"], "stopped"); assert.equal(result["sdkDispatches"], 1); assert.deepEqual(result["completed"], []);
    assert.equal(result["phase"], `${failure}-after`); assert.ok(!f.calls.includes("eda.sys_Environment.isClient"));
  }
});
void test("wrong-method and forged consistency SDK payloads never count as completed validation", async () => {
  const wrongMethod = validatePublicSdkReadPayload({ ok: true, kind: "public-sdk-read", method: "eda.sys_Unit.mmToInch", present: true, value: 1, undefinedPaths: [] }, { method: "eda.sys_Unit.mmToInch", arguments: { mm: 25.4 } });
  const valid = validatePublicSdkReadPayload({ ok: true, kind: "public-sdk-read", method: "eda.sys_Unit.mmToMil", present: true, value: 1000, undefinedPaths: [] }, { method: "eda.sys_Unit.mmToMil", arguments: { mm: 25.4 } });
  for (const corrupt of [consistent(wrongMethod, true), { ...consistent(valid, true), value: 5 },
    consistent({ ...valid, publicApiSha256: "9".repeat(64) }, true), consistent({ ...valid, assurance: "complete-persistence-proof" }, true),
    consistent({ ...valid, limitations: [] }, true)]) {
    const input = plan();
    const f = fixture(input); f.alter = (phase): unknown => phase === "sdk" ? corrupt : null;
    const result = await runDisposableSdkValidation(input, { mode: "execute", facade: f.facade });
    assert.equal(result["outcome"], "stopped"); assert.equal(result["phase"], "sdk-read"); assert.deepEqual(result["completed"], []); assert.equal(f.calls.length, 3);
  }
});
void test("failed intent recording refuses SDK dispatch and callbacks cannot mutate the captured plan", async () => {
  const input = plan();
  const f = fixture(input);
  const result = await runDisposableSdkValidation(input, { mode: "execute", facade: f.facade, record: (event) => {
    if (event["phase"] === "sdk-read-intent") { return Promise.reject(new Error("evidence unavailable")); }
    input.fixture.projectPath = "/test/changed.eprj2";
    return Promise.resolve();
  } });
  assert.equal(result["outcome"], "stopped"); assert.equal(result["sdkDispatches"], 0);
  assert.notEqual(result["fixture"], input.fixture);
});
