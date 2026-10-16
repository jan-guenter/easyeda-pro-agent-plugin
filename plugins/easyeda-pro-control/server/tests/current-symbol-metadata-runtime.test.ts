import assert from "node:assert/strict";
import crypto from "node:crypto";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint } from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";
import { CURRENT_PROJECT_ONLY_SCH_IMPLEMENTATION, CURRENT_SYMBOL_CLOCK_IMPLEMENTATION } from "../src/current-disposable-open-profile.ts";
import { CURRENT_SYMBOL_METADATA_RUNTIME_PROFILE, readCurrentSymbolMetadata } from "../src/current-symbol-metadata-runtime.ts";
import { buildCurrentClosedSymbolMetadataProgram, buildCurrentSymbolMetadataProgram } from "../src/current-symbol-metadata-program.ts";
// oxlint-disable-next-line import/max-dependencies -- Exercise both fixed collectors and their distinct source pins against one real file/crypto verification fixture.
import { readCurrentClosedSymbolMetadata } from "../src/current-symbol-closed-target-runtime.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { readCurrentProjectOnlySymbolPreflight } from "../src/current-project-only-symbol-runtime.ts";
import { buildCurrentProjectOnlySymbolPreflightProgram } from "../src/current-project-only-symbol-preflight.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
  tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
const request = { method: "eda.lib_Symbol.get", arguments: { symbolUuid: "d".repeat(16) }, target };
const payload = { ok: true, kind: "current-symbol-metadata-observation", method: request.method, target,
  value: { uuid: request.arguments.symbolUuid, projectUuid: target.projectUuid, ownerUuid: "e".repeat(32),
    name: "Observed symbol", description: "", tagsJson: '["test"]', source: "", version: "", ticket: 1 },
  samples: 2, implementationKind: "native-task-equivalent", targetClosedInRegistry: true, hiddenEditorsVerified: false,
  workerIdentityVerified: false, cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false };
const implementation = CURRENT_SYMBOL_METADATA_RUNTIME_PROFILE.implementation;
const syntheticFiles = [
  { ...implementation.ui, data: Buffer.from("synthetic current symbol metadata UI only") },
  ...implementation.files.map((pin, index) => ({ relativePath: pin.relativePath, sha256: pin.sha256,
    data: Buffer.alloc(pin.bytes, index + 1) })),
].map((file) => Object.assign(file, { syntheticSha256: crypto.createHash("sha256").update(file.data).digest("hex") }));
const clockFile = { ...CURRENT_SYMBOL_CLOCK_IMPLEMENTATION, data: Buffer.alloc(CURRENT_SYMBOL_CLOCK_IMPLEMENTATION.bytes, 9) };
const witnessSyntheticFiles = [...syntheticFiles,
  { ...clockFile, syntheticSha256: crypto.createHash("sha256").update(clockFile.data).digest("hex") }];
const sheetFile = { ...CURRENT_PROJECT_ONLY_SCH_IMPLEMENTATION, data: Buffer.alloc(CURRENT_PROJECT_ONLY_SCH_IMPLEMENTATION.bytes, 10) };
const preflightSyntheticFiles = [...witnessSyntheticFiles,
  { ...sheetFile, syntheticSha256: crypto.createHash("sha256").update(sheetFile.data).digest("hex") }];
const runtimeObservation = { editorVersion: "3.2.206", actor: { uuid: "1".repeat(32), username: "fixture-user", nickname: "Fixture" },
  clockSamples: Array.from({ length: 4 }, (_, index) => ({ rendererBeforeMs: 1000 + index * 3,
    serverTimeMs: 1001 + index * 3, rendererAfterMs: 1002 + index * 3 })),
  backendActorVerified: false, backendClockVerified: false, clockProducerOwnershipVerified: false };
const preflightRequest = { target: { projectUuid: target.projectUuid, branchUuid: target.branchUuid,
  symbolUuid: payload.value.uuid, ownerUuid: payload.value.ownerUuid }, expectedBefore: {
  name: payload.value.name, description: payload.value.description, tagsJson: payload.value.tagsJson,
  source: payload.value.source, version: payload.value.version, ticket: payload.value.ticket,
} };
const preflightPayload = { ok: true, kind: "current-project-only-symbol-preflight", ...preflightRequest,
  samples: 2, currentTabId: "0", noEditorTabsObserved: true, hiddenEditorsAbsentObserved: true,
  dirtyTabsAbsentObserved: true, cachedProjectReadOnlyAbsentObserved: true, concurrentStrictModeAbsentObserved: true,
  clientTicketObservation: { client: "f".repeat(16), maxTicket: 1, samples: 4 }, runtimeObservation,
  expectedBeforeMatched: true, permissionVerified: false, backendActorVerified: false, backendClockVerified: false,
  startupQualified: false, workerIdentityVerified: false, sourceMembershipVerified: false, persistenceVerified: false,
  writerAuthority: false, executionAuthorized: false, mutationDispatched: false, explicitSaveDispatched: false };

function encoded(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(value) } }; }

function fingerprint(assetsRoot: string): ExpectedFingerprint {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
  const bundles = CURRENT_SYMBOL_METADATA_RUNTIME_PROFILE.installedBundles;
  return {
    facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => ({ path: `/opt/control/${file.relativePath}`,
      relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: pinned.healthVersion, node_version: `v${pinned.nodeVersion}`, bridge_connected: true,
      easyeda_version: "3.2.206", extension_version: pinned.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: pinned.bridgeVersion,
      ...(pinned.bridgeEasyedaVersion === null ? {} : { easyeda_version: pinned.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: pinned.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: pinned.dispatcher.source, dispatcher_build_id: pinned.dispatcher.buildId, total: pinned.dispatcher.total } },
    installedBundles: { available: true, assetsRoot, pcbEditor: { ...bundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...bundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/api-types.js", declarationsPath: "/opt/assets/api-types.d.ts" } },
  };
}

/** Substitute only these isolated synthetic digests. Real fixed-path, size and
 * source rechecks still execute; none of this is connected runtime evidence.
 */
function mockSyntheticDigests(context: TestContext, calls: string[]): void {
  const createHash = crypto.createHash;
  context.mock.method(crypto, "createHash", (...args: Parameters<typeof createHash>): ReturnType<typeof createHash> => {
    const hash = createHash(...args), originalDigest = hash.digest.bind(hash);
    function digest(): Buffer;
    function digest(encoding: crypto.BinaryToTextEncoding): string;
    function digest(encoding?: crypto.BinaryToTextEncoding): Buffer | string {
      if (encoding === undefined) { return originalDigest(); }
      const actual = originalDigest(encoding), file = preflightSyntheticFiles.find((entry) => entry.syntheticSha256 === actual);
      if (encoding === "hex" && file !== undefined) { calls.push(`hash:${file.relativePath}`); return file.sha256; }
      return actual;
    }
    context.mock.method(hash, "digest", digest); return hash;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
}

async function runtime(reply: unknown, options: { changeFile?: string; finalDrift?: boolean; quarantine?: boolean; closedTarget?: boolean;
  projectOnly?: boolean; scopeMissing?: boolean; scopeDrift?: "initial-status" | "execute" | "final-status" } = {}): Promise<{
  engine: Parameters<typeof readCurrentProjectOnlySymbolPreflight>[0]; calls: string[]; expected: ExpectedFingerprint;
}> {
  const isolatedRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(isolatedRoot !== undefined); assert.match(isolatedRoot, /easyeda-test-control-/u);
  const scratch = await mkdtemp(join(isolatedRoot, "symbol-metadata-runtime-"));
  const assetsRoot = join(scratch, "assets");
  await mkdir(assetsRoot, { mode: 0o700 });
  for (const file of preflightSyntheticFiles) {
    const path = resolve(assetsRoot, file.relativePath);
    await mkdir(dirname(path), { recursive: true, mode: 0o700 }); await writeFile(path, file.data, { mode: 0o600 });
  }
  const calls: string[] = [], expected = fingerprint(assetsRoot); let statuses = 0;
  const scope = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1" as const, gatewayInstanceId: "g".repeat(43),
    sessionId: "s".repeat(43), sessionSequence: 1, begunAtEpochMs: 1000, leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) };
  return { calls, expected, engine: {
    assertBridgeDispatchAllowed: (): Promise<true> => {
      calls.push("guard"); return options.quarantine === true ? Promise.reject(new Error("quarantined")) : Promise.resolve(true);
    },
    status: () => {
      calls.push("status"); statuses += 1; const observed = structuredClone(expected);
      if ((statuses === 1 && options.scopeDrift === "initial-status") || (statuses === 2 && options.scopeDrift === "final-status")) { scope.sessionSequence += 1; }
      if (options.finalDrift === true && statuses === 2) { observed.installedBundles.assetsRoot = "/opt/another-assets"; }
      return Promise.resolve({ stableFingerprint: observed });
    },
    upstream: { currentAuthenticatedBridgeDispatchBinding: () => options.scopeMissing === true ? undefined : scope,
      callTool: async (name, args, timeoutMs) => {
      calls.push(name); assert.equal(name, "easyeda_execute"); assert.ok(args);
      assert.equal(args["confirmWrite"], true); assert.equal(args["timeoutMs"], options.projectOnly === true ? 15_000 : 60_000);
      assert.equal(timeoutMs, options.projectOnly === true ? 25_000 : 70_000);
      let code: string;
      if (options.projectOnly === true) { code = buildCurrentProjectOnlySymbolPreflightProgram(preflightRequest); }
      else { code = options.closedTarget === true ? buildCurrentClosedSymbolMetadataProgram(request) : buildCurrentSymbolMetadataProgram(request); }
      assert.equal(args["code"], code);
      if (options.scopeDrift === "execute") { scope.sessionSequence += 1; }
      if (options.changeFile !== undefined) { await writeFile(resolve(assetsRoot, options.changeFile), "changed synthetic implementation"); }
      return reply;
    } },
  } };
}

void test("symbol metadata malformed request, wrong fingerprint, quarantine and unknown UI refuse before execute", async () => {
  const invalid = await runtime(encoded(null));
  await assert.rejects(readCurrentSymbolMetadata(invalid.engine, { ...request, arguments: { symbolUuid: "wrong" } }, invalid.expected));
  assert.deepEqual(invalid.calls, []);
  const wrong = await runtime(encoded(null)); wrong.expected.health.payload.easyeda_version = "3.2.207";
  await assert.rejects(readCurrentSymbolMetadata(wrong.engine, request, wrong.expected)); assert.deepEqual(wrong.calls, []);
  const quarantined = await runtime(encoded(null), { quarantine: true });
  await assert.rejects(readCurrentSymbolMetadata(quarantined.engine, request, quarantined.expected), /quarantined/u);
  assert.deepEqual(quarantined.calls, ["guard"]);
  const unreviewed = await runtime(encoded(null));
  await assert.rejects(readCurrentSymbolMetadata(unreviewed.engine, request, unreviewed.expected), /UI implementation differs/u);
  assert.deepEqual(unreviewed.calls, ["guard", "status"]);
});

void test("project-only symbol observation pins its complete sources and retains the authenticated lease", async (context) => {
  const fixture = await runtime(encoded(preflightPayload), { projectOnly: true }); mockSyntheticDigests(context, fixture.calls);
  const result = await readCurrentProjectOnlySymbolPreflight(fixture.engine, preflightRequest, fixture.expected);
  assert.equal(result["expectedBeforeMatched"], true); assert.equal(result["writerAuthority"], false);
  const admission = result["runtimeAdmission"]; assert.ok(admission !== null && typeof admission === "object");
  assert.equal(Reflect.get(admission, "expectedBeforeProvenanceVerified"), false);
  assert.equal(Reflect.get(admission, "designExecutionAuthorized"), false);
  for (const file of preflightSyntheticFiles) { assert.equal(fixture.calls.filter((call) => call === `hash:${file.relativePath}`).length, 2); }
  assert.equal(fixture.calls.filter((call) => call === "easyeda_execute").length, 1);
  assert.equal(fixture.calls.filter((call) => call === "status").length, 2);
});

void test("project-only symbol scope and quarantine failures prevent dispatch or publication", async (context) => {
  mockSyntheticDigests(context, []);
  const missing = await runtime(encoded(preflightPayload), { projectOnly: true, scopeMissing: true });
  await assert.rejects(readCurrentProjectOnlySymbolPreflight(missing.engine, preflightRequest, missing.expected), /requires an authenticated scope/u);
  assert.deepEqual(missing.calls, []);
  const quarantined = await runtime(encoded(preflightPayload), { projectOnly: true, quarantine: true });
  await assert.rejects(readCurrentProjectOnlySymbolPreflight(quarantined.engine, preflightRequest, quarantined.expected), /quarantined/u);
  assert.deepEqual(quarantined.calls, ["guard"]);
  for (const scopeDrift of ["initial-status", "execute", "final-status"] as const) {
    const changed = await runtime(encoded(preflightPayload), { projectOnly: true, scopeDrift });
    await assert.rejects(readCurrentProjectOnlySymbolPreflight(changed.engine, preflightRequest, changed.expected), /scope changed/u);
    assert.equal(changed.calls.filter((call) => call === "easyeda_execute").length, scopeDrift === "initial-status" ? 0 : 1);
  }
});

void test("project-only symbol observation refuses source drift and invented metadata authority without retry", async (context) => {
  mockSyntheticDigests(context, []);
  for (const options of [{ changeFile: clockFile.relativePath }, { changeFile: sheetFile.relativePath }, { finalDrift: true }]) {
    const changed = await runtime(encoded(preflightPayload), { projectOnly: true, ...options });
    await assert.rejects(readCurrentProjectOnlySymbolPreflight(changed.engine, preflightRequest, changed.expected), /implementation differs|runtime changed/u);
    assert.equal(changed.calls.filter((call) => call === "easyeda_execute").length, 1);
  }
  for (const reply of [{ ...preflightPayload, permissionVerified: true },
    { ...preflightPayload, expectedBefore: { ...preflightPayload.expectedBefore, name: "changed" } }]) {
    const invalid = await runtime(encoded(reply), { projectOnly: true });
    await assert.rejects(readCurrentProjectOnlySymbolPreflight(invalid.engine, preflightRequest, invalid.expected));
    assert.equal(invalid.calls.filter((call) => call === "easyeda_execute").length, 1);
  }
});

void test("symbol metadata pins the current UI, app, manager and worker around one fixed execute", async (context) => {
  const fixture = await runtime(encoded(payload)); mockSyntheticDigests(context, fixture.calls);
  const result = await readCurrentSymbolMetadata(fixture.engine, request, fixture.expected);
  const hashes = syntheticFiles.map((file) => `hash:${file.relativePath}`);
  assert.deepEqual(fixture.calls, ["guard", "status", ...hashes, "guard", "easyeda_execute", ...hashes, "guard", "status"]);
  assert.deepEqual(result["value"], payload.value); assert.deepEqual(result["target"], target);
  const admission = result["runtimeAdmission"]; assert.ok(admission !== null && typeof admission === "object");
  assert.equal(Reflect.get(admission, "profile"), CURRENT_SYMBOL_METADATA_RUNTIME_PROFILE.schema);
  assert.equal(Reflect.get(admission, "scope"), "explicit-project-local-symbol-metadata-only");
  assert.equal(Reflect.get(admission, "beforeAndAfterChecked"), true);
  for (const field of ["designExecutionAuthorized", "persistenceVerified"]) { assert.equal(Reflect.get(admission, field), false); }
  for (const field of ["cadAuthority", "persistenceVerified", "workerIdentityVerified", "hiddenEditorsVerified", "sourceMembershipVerified"]) {
    assert.equal(result[field], false);
  }
  assert.match(String(result["observationSha256"]), /^[a-f0-9]{64}$/u);
  assert.equal(JSON.stringify(result).includes(fixture.expected.installedBundles.assetsRoot), false);
});

void test("symbol metadata changed implementation or runtime refuses publication without replay", async (context) => {
  mockSyntheticDigests(context, []);
  for (const file of syntheticFiles) {
    const changed = await runtime(encoded(payload), { changeFile: file.relativePath });
    await assert.rejects(readCurrentSymbolMetadata(changed.engine, request, changed.expected), /implementation differs/u);
    assert.deepEqual(changed.calls, ["guard", "status", "guard", "easyeda_execute"]);
  }
  const drifted = await runtime(encoded(payload), { finalDrift: true });
  await assert.rejects(readCurrentSymbolMetadata(drifted.engine, request, drifted.expected), /runtime changed/u);
  assert.deepEqual(drifted.calls, ["guard", "status", "guard", "easyeda_execute", "guard", "status"]);
});

void test("symbol metadata malformed and mismatched replies refuse after the sole execute", async (context) => {
  mockSyntheticDigests(context, []);
  for (const reply of [null, { ...payload, target: { ...target, branchUuid: "f".repeat(32) } },
    { ...payload, value: { ...payload.value, uuid: "f".repeat(16) } }, { ...payload, workerIdentityVerified: true }]) {
    const fixture = await runtime(encoded(reply));
    await assert.rejects(readCurrentSymbolMetadata(fixture.engine, request, fixture.expected));
    assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute"]);
  }
});

void test("internal closed-target collector runs only its fixed compiler and preserves narrow evidence", async (context) => {
  const observed = { ...payload, kind: "current-closed-symbol-metadata-witness", hiddenEditorsVerified: true,
    runtimeObservation, clientTicketObservation: { client: "f".repeat(16), maxTicket: payload.value.ticket, samples: 4 } };
  const fixture = await runtime(encoded(observed), { closedTarget: true }); mockSyntheticDigests(context, fixture.calls);
  const result = await readCurrentClosedSymbolMetadata(fixture.engine, request, fixture.expected);
  const hashes = witnessSyntheticFiles.map((file) => `hash:${file.relativePath}`);
  assert.deepEqual(fixture.calls, ["guard", "status", ...hashes, "guard", "easyeda_execute", ...hashes, "guard", "status"]);
  assert.deepEqual(result.observation, observed); assert.equal(result.executionAuthorized, false);
  assert.equal(result.sourceImplementationVerified, true); assert.match(result.observationSha256, /^[a-f0-9]{64}$/u);
  assert.match(result.runtimeFingerprintSha256, /^[a-f0-9]{64}$/u);
});

void test("internal closed-target collector refuses broad claims, runtime drift and source replacement", async (context) => {
  mockSyntheticDigests(context, []);
  const observed = { ...payload, kind: "current-closed-symbol-metadata-witness", hiddenEditorsVerified: true,
    runtimeObservation, clientTicketObservation: { client: "f".repeat(16), maxTicket: payload.value.ticket, samples: 4 } };
  for (const reply of [payload, { ...observed, workerIdentityVerified: true }, { ...observed, cadAuthority: true },
    { ...observed, value: { ...observed.value, uuid: "f".repeat(16) } }]) {
    const fixture = await runtime(encoded(reply), { closedTarget: true });
    await assert.rejects(readCurrentClosedSymbolMetadata(fixture.engine, request, fixture.expected));
    assert.equal(fixture.calls.filter((call) => call === "easyeda_execute").length, 1);
  }
  const firstFile = syntheticFiles[0]; assert.ok(firstFile !== undefined);
  for (const options of [{ finalDrift: true }, { changeFile: firstFile.relativePath }, { changeFile: clockFile.relativePath }]) {
    const fixture = await runtime(encoded(observed), { ...options, closedTarget: true });
    await assert.rejects(readCurrentClosedSymbolMetadata(fixture.engine, request, fixture.expected));
    assert.equal(fixture.calls.filter((call) => call === "easyeda_execute").length, 1);
  }
});
