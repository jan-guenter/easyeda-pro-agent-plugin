import assert from "node:assert/strict";
import { test } from "node:test";
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json, validatePrivateFingerprint } from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { SDK_MATH_MAX_BYTES } from "../src/sdk-math.ts";
import { SDK_MATH_RUNTIME_PROFILE, calculateSdkMath, validateSdkMathFingerprint } from "../src/sdk-math-runtime.ts";
import type { SdkMathEngine } from "../src/sdk-math-runtime.ts";

const request = { method: "eda.sys_Math.calculateArea", arguments: { polygon: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 }] } };
function fingerprint(): ExpectedFingerprint {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
  const bundles = SDK_MATH_RUNTIME_PROFILE.installedBundles;
  return {
    facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => ({ path: `/opt/control/${file.relativePath}`,
      relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: pinned.healthVersion, node_version: `v${pinned.nodeVersion}`, bridge_connected: true,
      // Literal captured from the authenticated 135500 handshake. Deriving it
      // From the profile hid the package-version/editor-version mismatch.
      easyeda_version: "3.2.206", extension_version: pinned.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: pinned.bridgeVersion,
      ...(pinned.bridgeEasyedaVersion === null ? {} : { easyeda_version: pinned.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: pinned.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: pinned.dispatcher.source, dispatcher_build_id: pinned.dispatcher.buildId, total: pinned.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: "/opt/assets", pcbEditor: { ...bundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...bundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/api-types.js", declarationsPath: "/opt/assets/api-types.d.ts" } },
  };
}
const payload = { ok: true, kind: "sdk-math", method: request.method, value: 6 };
function runtime(options: { reply?: unknown; finalDrift?: boolean; quarantine?: boolean; initial?: ExpectedFingerprint } = {}): {
  engine: SdkMathEngine; calls: string[];
} {
  const calls: string[] = [], original = options.initial ?? fingerprint();
  let statuses = 0;
  return { calls, engine: {
    assertBridgeDispatchAllowed: (): Promise<true> => {
      calls.push("guard");
      return options.quarantine === true ? Promise.reject(new Error("quarantined")) : Promise.resolve(true);
    },
    status: () => {
      calls.push("status"); statuses += 1;
      const observed = structuredClone(original);
      if (options.finalDrift === true && statuses === 2) { observed.installedBundles.publicApi.declarationsSha256 = "0".repeat(64); }
      return Promise.resolve({ stableFingerprint: observed });
    },
    upstream: { callTool: (name, args, timeoutMs) => {
      calls.push(name);
      assert.equal(name, "easyeda_execute");
      assert.ok(args);
      assert.equal(args["confirmWrite"], true);
      assert.equal(args["timeoutMs"], 60_000);
      assert.equal(timeoutMs, 70_000);
      assert.equal(typeof args["code"], "string");
      return Promise.resolve(options.reply ?? { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(payload) } });
    } },
  } };
}

void test("new math admission preserves legacy rejection and exact common trust fields", () => {
  assert.equal(validateSdkMathFingerprint(fingerprint()), true);
  assert.throws(() => validatePrivateFingerprint(fingerprint()), /compatibility tuple/u);
  const defects: ((value: ExpectedFingerprint) => void)[] = [
    (value) => { value.health.payload.easyeda_version = "3.2.206.715d940d"; },
    (value) => { value.health.payload.easyeda_version = "3.2.207"; },
    (value) => { value.health.payload.easyeda_version = loadReviewedCompatibilityManifest().connectedRuntime.easyedaVersion; },
    (value) => { value.installedBundles.publicApi.adapterSha256 = "0".repeat(64); },
    (value) => { value.upstreamLauncher.moduleGraph.sha256 = "0".repeat(64); },
    (value) => { value.bridge.payload.diagnostics.method_registry_hash = "foreign"; },
    (value) => { value.bridgeDispatcher.payload.dispatcher_build_id = "foreign"; },
    (value) => { value.facadeImplementation.sha256 = "0".repeat(64); },
    (value) => { value.reviewedCompatibilityManifest.sha256 = "0".repeat(64); },
  ];
  for (const mutate of defects) { const value = fingerprint(); mutate(value); assert.throws(() => validateSdkMathFingerprint(value)); }
  assert.throws(() => validateSdkMathFingerprint({ ...fingerprint(), upstreamImplementationDrift: true }));
});

void test("calculation uses one existing-owner execute bracketed by fresh admission and orphan guards", async () => {
  const fixture = runtime(), result = await calculateSdkMath(fixture.engine, request, fingerprint());
  assert.equal(result["value"], 6);
  assert.match(String(result["authority"]), /supplied-coordinate-calculation-only/u);
  assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute", "guard", "status"]);
  assert.deepEqual(result["runtimeAdmission"], {
    profile: SDK_MATH_RUNTIME_PROFILE.schema,
    fingerprintSha256: sha256Json(fingerprint()),
    beforeAndAfterChecked: true, scope: "fixed-input-only-sdk-math", liveValidation: "not-recorded",
  });
});

void test("invalid requests, unadmitted expected/observed runtime and quarantine refuse before execution", async () => {
  const invalidRequest = runtime();
  await assert.rejects(calculateSdkMath(invalidRequest.engine, { ...request, method: "eda.sys_FileSystem.writeFile" }, fingerprint()));
  assert.deepEqual(invalidRequest.calls, []);
  const old = fingerprint(), rejected = runtime(); old.health.payload.easyeda_version = "old";
  await assert.rejects(calculateSdkMath(rejected.engine, request, old));
  assert.deepEqual(rejected.calls, []);
  const observed = runtime({ initial: old });
  await assert.rejects(calculateSdkMath(observed.engine, request, fingerprint()));
  assert.deepEqual(observed.calls, ["guard", "status"]);
  const quarantined = runtime({ quarantine: true });
  await assert.rejects(calculateSdkMath(quarantined.engine, request, fingerprint()), /quarantined/u);
  assert.deepEqual(quarantined.calls, ["guard"]);
});

void test("post-calculation API drift refuses the otherwise valid result without replay", async () => {
  const fixture = runtime({ finalDrift: true });
  await assert.rejects(calculateSdkMath(fixture.engine, request, fingerprint()), /SDK math reviewed runtime scope/u);
  assert.equal(fixture.calls.filter((name) => name === "easyeda_execute").length, 1);
});

void test("unsettled upstream replies do not acquire a replacement owner or dispatch post-status", async () => {
  const fixture = runtime({ reply: { isError: true, content: [], structuredContent: { ok: false, error: { code: "BRIDGE_TIMEOUT", message: "timeout" } } } });
  await assert.rejects(calculateSdkMath(fixture.engine, request, fingerprint()), /execution-unsettled/u);
  assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute"]);
});

void test("math output rejects oversized transport and mismatched literal method", async () => {
  for (const value of [{ ...payload, value: "x".repeat(SDK_MATH_MAX_BYTES) }, { ...payload, method: "eda.sys_Math.translate" }]) {
    const fixture = runtime({ reply: { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(value) } } });
    await assert.rejects(calculateSdkMath(fixture.engine, request, fingerprint()));
    assert.equal(fixture.calls.filter((name) => name === "easyeda_execute").length, 1);
  }
});
