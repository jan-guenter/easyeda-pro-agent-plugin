import assert from "node:assert/strict";
import crypto from "node:crypto";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { dirname, join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint } from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";
import { CURRENT_PCB_LAYERS_RUNTIME_PROFILE, readCurrentPcbLayers } from "../src/current-pcb-layers-runtime.ts";
import { buildCurrentPcbLayersProgram } from "../src/current-pcb-layers.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(32), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
  tabId: `${"c".repeat(16)}@${"a".repeat(32)}` };
const request = { method: "eda.pcb_Layer.getAllLayers", arguments: {}, target };
const payload = { ok: true, kind: "current-pcb-layer-observation", method: request.method, target,
  nativeLayers: [{ layerId: 1, type: "TOP", name: "Top", order: 1, activeColor: "#ff0000", activeColorAlpha: 1,
    deactiveColor: "#800000", deactiveColorAlpha: 0.5, visible: true, locked: false, active: true, layerStatus: 1 }],
  samples: 2, implementationKind: "native-task-equivalent", cadAuthority: false, persistenceVerified: false, physicalStackVerified: false };
const syntheticUi = "synthetic PCB layer UI for coordinator testing only";
const syntheticUiSha256 = crypto.createHash("sha256").update(syntheticUi).digest("hex");

function encoded(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(value) } }; }

function fingerprint(assetsRoot: string): ExpectedFingerprint {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
  const bundles = CURRENT_PCB_LAYERS_RUNTIME_PROFILE.installedBundles;
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

/** Substitute only the isolated synthetic digest. The real verifier and fixed
 * production pins remain intact; this is not connected runtime evidence.
 */
function mockSyntheticUiDigest(context: TestContext, calls: string[]): void {
  const createHash = crypto.createHash;
  context.mock.method(crypto, "createHash", (...args: Parameters<typeof createHash>): ReturnType<typeof createHash> => {
    const hash = createHash(...args), originalDigest = hash.digest.bind(hash);
    function digest(): Buffer;
    function digest(encoding: crypto.BinaryToTextEncoding): string;
    function digest(encoding?: crypto.BinaryToTextEncoding): Buffer | string {
      if (encoding === undefined) { return originalDigest(); }
      const actual = originalDigest(encoding);
      if (encoding === "hex" && actual === syntheticUiSha256) { calls.push("ui-hash"); return CURRENT_PCB_LAYERS_RUNTIME_PROFILE.uiImplementation.sha256; }
      return actual;
    }
    context.mock.method(hash, "digest", digest); return hash;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
}

async function runtime(reply: unknown, options: { changeUi?: boolean; finalDrift?: boolean; quarantine?: boolean } = {}): Promise<{
  engine: Parameters<typeof readCurrentPcbLayers>[0]; calls: string[]; expected: ExpectedFingerprint;
}> {
  const isolatedRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(isolatedRoot !== undefined); assert.match(isolatedRoot, /easyeda-test-control-/u);
  const assetsRoot = await mkdtemp(join(isolatedRoot, "pcb-layers-runtime-"));
  const ui = join(assetsRoot, CURRENT_PCB_LAYERS_RUNTIME_PROFILE.uiImplementation.relativePath);
  await mkdir(dirname(ui), { recursive: true, mode: 0o700 }); await writeFile(ui, syntheticUi, { mode: 0o600 });
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
      assert.equal(args["code"], buildCurrentPcbLayersProgram(request));
      if (options.changeUi === true) { await writeFile(ui, "changed synthetic UI"); }
      return reply;
    } },
  } };
}

void test("PCB layer bad target, wrong runtime, quarantine and unreviewed UI refuse before dispatch", async () => {
  const invalid = await runtime(encoded(null));
  await assert.rejects(readCurrentPcbLayers(invalid.engine, { ...request, target: { ...target, tabId: "wrong-tab" } }, invalid.expected));
  assert.deepEqual(invalid.calls, []);
  const wrong = await runtime(encoded(null)); wrong.expected.health.payload.easyeda_version = "3.2.207";
  await assert.rejects(readCurrentPcbLayers(wrong.engine, request, wrong.expected)); assert.deepEqual(wrong.calls, []);
  const quarantined = await runtime(encoded(null), { quarantine: true });
  await assert.rejects(readCurrentPcbLayers(quarantined.engine, request, quarantined.expected), /quarantined/u);
  assert.deepEqual(quarantined.calls, ["guard"]);
  const unreviewed = await runtime(encoded(null));
  await assert.rejects(readCurrentPcbLayers(unreviewed.engine, request, unreviewed.expected), /UI implementation differs/u);
  assert.deepEqual(unreviewed.calls, ["guard", "status"]);
});

void test("PCB layer runtime pins the target and current API/UI around one authenticated execute", async (context) => {
  const fixture = await runtime(encoded(payload)); mockSyntheticUiDigest(context, fixture.calls);
  const result = await readCurrentPcbLayers(fixture.engine, request, fixture.expected);
  assert.deepEqual(fixture.calls, ["guard", "status", "ui-hash", "guard", "easyeda_execute", "ui-hash", "guard", "status"]);
  assert.deepEqual(result["value"], [{ id: 1, name: "Top", type: "SIGNAL", color: "#ff0000", transparency: 0,
    inactiveColor: "#800000", inactiveTransparency: 50, layerStatus: 1, locked: false }]);
  assert.deepEqual(result["target"], target); assert.equal(Object.hasOwn(result, "nativeLayers"), false);
  const admission = result["runtimeAdmission"]; assert.ok(admission !== null && typeof admission === "object");
  assert.equal(Reflect.get(admission, "profile"), CURRENT_PCB_LAYERS_RUNTIME_PROFILE.schema);
  assert.equal(Reflect.get(admission, "scope"), "explicit-current-pcb-layer-metadata-only");
  assert.equal(Reflect.get(admission, "beforeAndAfterChecked"), true);
  for (const field of ["designExecutionAuthorized", "persistenceVerified"]) { assert.equal(Reflect.get(admission, field), false); }
  for (const field of ["cadAuthority", "persistenceVerified", "physicalStackVerified"]) { assert.equal(result[field], false); }
  assert.equal(JSON.stringify(result).includes(fixture.expected.installedBundles.assetsRoot), false);
});

void test("PCB layer changed installed UI or runtime refuses publication without replay", async (context) => {
  const changed = await runtime(encoded(payload), { changeUi: true }), drifted = await runtime(encoded(payload), { finalDrift: true });
  mockSyntheticUiDigest(context, []);
  await assert.rejects(readCurrentPcbLayers(changed.engine, request, changed.expected), /UI implementation differs/u);
  assert.deepEqual(changed.calls, ["guard", "status", "guard", "easyeda_execute"]);
  await assert.rejects(readCurrentPcbLayers(drifted.engine, request, drifted.expected), /runtime changed/u);
  assert.deepEqual(drifted.calls, ["guard", "status", "guard", "easyeda_execute", "guard", "status"]);
});

void test("PCB layer result target drift refuses publication after the sole execute", async (context) => {
  const fixture = await runtime(encoded({ ...payload, target: { ...target, branchUuid: "d".repeat(32) } }));
  mockSyntheticUiDigest(context, []);
  await assert.rejects(readCurrentPcbLayers(fixture.engine, request, fixture.expected));
  assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute"]);
});
