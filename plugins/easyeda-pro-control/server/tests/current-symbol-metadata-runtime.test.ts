import assert from "node:assert/strict";
import crypto from "node:crypto";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint } from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";
import { CURRENT_SYMBOL_METADATA_RUNTIME_PROFILE, readCurrentSymbolMetadata } from "../src/current-symbol-metadata-runtime.ts";
import { buildCurrentClosedSymbolMetadataProgram, buildCurrentSymbolMetadataProgram } from "../src/current-symbol-metadata-program.ts";
import { readCurrentClosedSymbolMetadata } from "../src/current-symbol-closed-target-runtime.ts";
// oxlint-disable-next-line import/max-dependencies -- Exercise both fixed collectors against the same real source-verification fixture without duplicating its file/crypto setup.
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";

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
      const actual = originalDigest(encoding), file = syntheticFiles.find((entry) => entry.syntheticSha256 === actual);
      if (encoding === "hex" && file !== undefined) { calls.push(`hash:${file.relativePath}`); return file.sha256; }
      return actual;
    }
    context.mock.method(hash, "digest", digest); return hash;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
}

async function runtime(reply: unknown, options: { changeFile?: string; finalDrift?: boolean; quarantine?: boolean; closedTarget?: boolean } = {}): Promise<{
  engine: Parameters<typeof readCurrentSymbolMetadata>[0]; calls: string[]; expected: ExpectedFingerprint;
}> {
  const isolatedRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(isolatedRoot !== undefined); assert.match(isolatedRoot, /easyeda-test-control-/u);
  const scratch = await mkdtemp(join(isolatedRoot, "symbol-metadata-runtime-"));
  const assetsRoot = join(scratch, "assets");
  await mkdir(assetsRoot, { mode: 0o700 });
  for (const file of syntheticFiles) {
    const path = resolve(assetsRoot, file.relativePath);
    await mkdir(dirname(path), { recursive: true, mode: 0o700 }); await writeFile(path, file.data, { mode: 0o600 });
  }
  const calls: string[] = [], expected = fingerprint(assetsRoot); let statuses = 0;
  return { calls, expected, engine: {
    assertBridgeDispatchAllowed: (): Promise<true> => {
      calls.push("guard"); return options.quarantine === true ? Promise.reject(new Error("quarantined")) : Promise.resolve(true);
    },
    status: () => {
      calls.push("status"); statuses += 1; const observed = structuredClone(expected);
      if (options.finalDrift === true && statuses === 2) { observed.installedBundles.assetsRoot = "/opt/another-assets"; }
      return Promise.resolve({ stableFingerprint: observed });
    },
    upstream: { callTool: async (name, args, timeoutMs) => {
      calls.push(name); assert.equal(name, "easyeda_execute"); assert.ok(args);
      assert.equal(args["confirmWrite"], true); assert.equal(args["timeoutMs"], 60_000); assert.equal(timeoutMs, 70_000);
      assert.equal(args["code"], options.closedTarget === true ? buildCurrentClosedSymbolMetadataProgram(request) : buildCurrentSymbolMetadataProgram(request));
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
  const observed = { ...payload, kind: "current-closed-symbol-metadata-witness", hiddenEditorsVerified: true };
  const fixture = await runtime(encoded(observed), { closedTarget: true }); mockSyntheticDigests(context, fixture.calls);
  const result = await readCurrentClosedSymbolMetadata(fixture.engine, request, fixture.expected);
  const hashes = syntheticFiles.map((file) => `hash:${file.relativePath}`);
  assert.deepEqual(fixture.calls, ["guard", "status", ...hashes, "guard", "easyeda_execute", ...hashes, "guard", "status"]);
  assert.deepEqual(result.observation, observed); assert.equal(result.executionAuthorized, false);
  assert.equal(result.sourceImplementationVerified, true); assert.match(result.observationSha256, /^[a-f0-9]{64}$/u);
  assert.match(result.runtimeFingerprintSha256, /^[a-f0-9]{64}$/u);
});

void test("internal closed-target collector refuses broad claims, runtime drift and source replacement", async (context) => {
  mockSyntheticDigests(context, []);
  const observed = { ...payload, kind: "current-closed-symbol-metadata-witness", hiddenEditorsVerified: true };
  for (const reply of [payload, { ...observed, workerIdentityVerified: true }, { ...observed, cadAuthority: true },
    { ...observed, value: { ...observed.value, uuid: "f".repeat(16) } }]) {
    const fixture = await runtime(encoded(reply), { closedTarget: true });
    await assert.rejects(readCurrentClosedSymbolMetadata(fixture.engine, request, fixture.expected));
    assert.equal(fixture.calls.filter((call) => call === "easyeda_execute").length, 1);
  }
  const firstFile = syntheticFiles[0]; assert.ok(firstFile !== undefined);
  for (const options of [{ finalDrift: true }, { changeFile: firstFile.relativePath }]) {
    const fixture = await runtime(encoded(observed), { ...options, closedTarget: true });
    await assert.rejects(readCurrentClosedSymbolMetadata(fixture.engine, request, fixture.expected));
    assert.equal(fixture.calls.filter((call) => call === "easyeda_execute").length, 1);
  }
});
