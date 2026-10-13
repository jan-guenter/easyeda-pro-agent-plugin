import assert from "node:assert/strict";
import { test } from "node:test";
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json, validatePrivateFingerprint } from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE, validateSdkLocalRuntimeFingerprint } from "../src/sdk-local-runtime.ts";
import { SDK_SYSTEM_RUNTIME_PROFILE, readSdkSystem } from "../src/sdk-system-runtime.ts";
import type { SdkSystemEngine } from "../src/sdk-system-runtime.ts";
import { SDK_SYSTEM_API_SHA256, SDK_SYSTEM_API_VERSION, SDK_SYSTEM_MAX_BYTES } from "../src/sdk-system.ts";

const request = { method: "eda.sys_Unit.milToMm", arguments: { mil: 100, numberOfDecimals: 4 } };
const payload = { ok: true, kind: "sdk-system", method: request.method, value: 2.54, negativeZero: false };
function encoded(value: unknown): unknown {
  return { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(value) } };
}

function fingerprint(): ExpectedFingerprint {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
  const bundles = SDK_LOCAL_RUNTIME_PROFILE.installedBundles;
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
    installedBundles: { available: true, assetsRoot: "/opt/assets", pcbEditor: { ...bundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...bundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/api-types.js", declarationsPath: "/opt/assets/api-types.d.ts" } },
  };
}

function runtime(options: { reply?: unknown; finalDrift?: "bundle" | "identity"; quarantine?: boolean; initial?: ExpectedFingerprint } = {}): {
  engine: SdkSystemEngine; calls: string[];
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
      if (statuses === 2 && options.finalDrift === "bundle") { observed.installedBundles.publicApi.declarationsSha256 = "0".repeat(64); }
      if (statuses === 2 && options.finalDrift === "identity") { observed.installedBundles.assetsRoot = "/opt/another-assets"; }
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
      assert.match(String(args["code"]), /owner=eda\.sys_Unit/u);
      return Promise.resolve(options.reply ?? { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(payload) } });
    } },
  } };
}

void test("local system coordinator retains separate exact admission and one existing-owner dispatch", async () => {
  assert.equal(validateSdkLocalRuntimeFingerprint(fingerprint()), true);
  assert.throws(() => validatePrivateFingerprint(fingerprint()), /compatibility tuple/u);
  assert.equal(SDK_SYSTEM_API_VERSION, SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.version);
  assert.equal(SDK_SYSTEM_API_SHA256, SDK_LOCAL_RUNTIME_PROFILE.installedBundles.publicApi.implementationSha256);
  const fixture = runtime(), result = await readSdkSystem(fixture.engine, request, fingerprint());
  assert.equal(result["value"], 2.54);
  assert.equal(result["negativeZero"], false);
  assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute", "guard", "status"]);
  assert.deepEqual(result["runtimeAdmission"], {
    profile: SDK_SYSTEM_RUNTIME_PROFILE.schema,
    fingerprintSha256: sha256Json(fingerprint()),
    beforeAndAfterChecked: true, scope: "fixed-local-sdk-system", liveValidation: "not-recorded",
  });
});

void test("invalid system requests, wrong expected or observed tuple and quarantine refuse before execution", async () => {
  const invalid = runtime();
  await assert.rejects(readSdkSystem(invalid.engine, { ...request, method: "eda.sys_FileSystem.writeFile" }, fingerprint()));
  assert.deepEqual(invalid.calls, []);
  const expected = runtime(), other = fingerprint();
  other.health.payload.easyeda_version = "3.2.207";
  await assert.rejects(readSdkSystem(expected.engine, request, other));
  assert.deepEqual(expected.calls, []);
  const observed = runtime({ initial: other });
  await assert.rejects(readSdkSystem(observed.engine, request, fingerprint()));
  assert.deepEqual(observed.calls, ["guard", "status"]);
  const quarantined = runtime({ quarantine: true });
  await assert.rejects(readSdkSystem(quarantined.engine, request, fingerprint()), /quarantined/u);
  assert.deepEqual(quarantined.calls, ["guard"]);
});

void test("system coordinator rejects bundle or full-identity drift after one dispatch without replay", async () => {
  for (const finalDrift of ["bundle", "identity"] as const) {
    const fixture = runtime({ finalDrift });
    await assert.rejects(readSdkSystem(fixture.engine, request, fingerprint()), /SDK (?:local reviewed runtime scope|system runtime changed)/u);
    assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute", "guard", "status"]);
  }
});

void test("system output preserves signed zero and rejects unsettled, oversized or mismatched replies", async () => {
  const zero = runtime({ reply: encoded({ ...payload, value: 0, negativeZero: true }) });
  const result = await readSdkSystem(zero.engine, { ...request, arguments: { mil: -0.001, numberOfDecimals: 4 } }, fingerprint());
  assert.equal(result["value"], 0);
  assert.equal(result["negativeZero"], true);
  const replies = [
    { isError: true, content: [], structuredContent: { ok: false, error: { code: "BRIDGE_TIMEOUT", message: "timeout" } } },
    encoded({ ...payload, value: "x".repeat(SDK_SYSTEM_MAX_BYTES) }),
    encoded({ ...payload, method: "eda.sys_Unit.mmToMil" }),
  ];
  for (const reply of replies) {
    const fixture = runtime({ reply });
    await assert.rejects(readSdkSystem(fixture.engine, request, fingerprint()));
    assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute"]);
  }
});
