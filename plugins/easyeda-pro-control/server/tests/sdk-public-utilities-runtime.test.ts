import assert from "node:assert/strict";
import { test } from "node:test";
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, validatePrivateFingerprint } from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE, validateSdkLocalRuntimeFingerprint } from "../src/sdk-local-runtime.ts";
import type { SdkLocalEngine } from "../src/sdk-local-runtime.ts";
import { calculateSdkMath } from "../src/sdk-math-runtime.ts";
import { readSdkSystem } from "../src/sdk-system-runtime.ts";
import { sdkMathDescriptors } from "../src/sdk-math.ts";
import { sdkSystemDescriptors } from "../src/sdk-system.ts";
import { SDK_PUBLIC_UTILITIES_209_PROFILE, isPublicUtilities209Configured, selectSdkPublicUtilitiesRuntimeProfile } from "../src/sdk-public-utilities-profile.ts";

function fingerprint(generation: "206" | "209" = "209"): ExpectedFingerprint {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
  const profile = generation === "209" ? SDK_PUBLIC_UTILITIES_209_PROFILE : SDK_LOCAL_RUNTIME_PROFILE;
  const bundles = profile.installedBundles;
  return {
    facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => ({ path: `/opt/control/${file.relativePath}`,
      relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: pinned.healthVersion, node_version: `v${pinned.nodeVersion}`, bridge_connected: true,
      easyeda_version: generation === "209" ? "3.2.209" : "3.2.206", extension_version: pinned.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: pinned.bridgeVersion,
      ...(pinned.bridgeEasyedaVersion === null ? {} : { easyeda_version: pinned.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: pinned.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: pinned.dispatcher.source, dispatcher_build_id: pinned.dispatcher.buildId, total: pinned.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: "/opt/assets", pcbEditor: { ...bundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...bundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/api-types.js", declarationsPath: "/opt/assets/api-types.d.ts" } },
  };
}

const math = { method: "eda.sys_Math.calculateArea", arguments: { polygon: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 }] } };
const system = { method: "eda.sys_Unit.milToMm", arguments: { mil: 100 } };
const cases = [
  { run: calculateSdkMath, request: math, payload: { ok: true, kind: "sdk-math", method: math.method, value: 6 } },
  { run: readSdkSystem, request: system, payload: { ok: true, kind: "sdk-system", method: system.method, value: 2.54, negativeZero: false } },
] as const;

function runtime(payload: unknown, options: { initial?: ExpectedFingerprint; final?: ExpectedFingerprint; quarantined?: boolean; unsettled?: boolean } = {}): {
  engine: SdkLocalEngine; calls: string[];
} {
  const calls: string[] = []; let statuses = 0;
  return { calls, engine: {
    assertBridgeDispatchAllowed: () => {
      calls.push("guard");
      return options.quarantined === true ? Promise.reject(new Error("quarantined")) : Promise.resolve(true);
    },
    status: () => {
      calls.push("status"); statuses += 1;
      return Promise.resolve({ stableFingerprint: structuredClone(statuses > 1 ? options.final ?? options.initial ?? fingerprint() : options.initial ?? fingerprint()) });
    },
    upstream: { callTool: (name) => {
      calls.push(name);
      return Promise.resolve(options.unsettled === true
        ? { isError: true, content: [], structuredContent: { ok: false, error: { code: "BRIDGE_TIMEOUT", message: "timeout" } } }
        : { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(payload) } });
    } },
  } };
}

void test("209 selectors and profile are exact and cannot authorize the old native or private validators", () => {
  assert.equal(isPublicUtilities209Configured({ EASYEDA_PCB_BUNDLE_VERSION: "3.2.195.6b67774e", EASYEDA_PUBLIC_API_BUNDLE_VERSION: "0.3.59.1ca9efb5" }), true);
  for (const value of [{}, { EASYEDA_PCB_BUNDLE_VERSION: "3.2.195.6b67774e" },
    { EASYEDA_PCB_BUNDLE_VERSION: "3.2.193.682ed44e", EASYEDA_PUBLIC_API_BUNDLE_VERSION: "0.3.59.1ca9efb5" }]) {
    assert.equal(isPublicUtilities209Configured(value), false);
  }
  for (const value of [SDK_PUBLIC_UTILITIES_209_PROFILE, SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles,
    SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles.pcbEditor, SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles.publicApi]) {
    assert.equal(Object.isFrozen(value), true);
  }
  assert.equal(selectSdkPublicUtilitiesRuntimeProfile(fingerprint()), SDK_PUBLIC_UTILITIES_209_PROFILE);
  assert.equal(selectSdkPublicUtilitiesRuntimeProfile(fingerprint("206")), SDK_LOCAL_RUNTIME_PROFILE);
  assert.throws(() => validateSdkLocalRuntimeFingerprint(fingerprint()));
  assert.throws(() => validatePrivateFingerprint(fingerprint()));
  assert.equal(validateSdkLocalRuntimeFingerprint(fingerprint("206")), true);
});

void test("209 public utility admission preserves every common trust field and rejects mixed generations", () => {
  const defects: ((value: ExpectedFingerprint) => void)[] = [
    (value) => { value.health.payload.easyeda_version = "3.2.209.8a704eab"; },
    (value) => { value.health.payload.easyeda_version = "3.2.210"; },
    (value) => { value.health.payload.easyeda_version = "3.2.206"; },
    (value) => { value.installedBundles.publicApi = fingerprint("206").installedBundles.publicApi; },
    (value) => { value.installedBundles.pcbEditor.implementationSha256 = "0".repeat(64); },
    (value) => { value.installedBundles.publicApi.implementationSha256 = "0".repeat(64); },
    (value) => { value.installedBundles.publicApi.adapterSha256 = "0".repeat(64); },
    (value) => { value.installedBundles.publicApi.declarationsSha256 = "0".repeat(64); },
    (value) => { value.upstreamLauncher.moduleGraph.sha256 = "0".repeat(64); },
    (value) => { value.bridge.payload.diagnostics.method_registry_hash = "foreign"; },
    (value) => { value.bridgeDispatcher.payload.dispatcher_build_id = "foreign"; },
    (value) => { value.facadeImplementation.sha256 = "0".repeat(64); },
    (value) => { value.reviewedCompatibilityManifest.sha256 = "0".repeat(64); },
  ];
  for (const mutate of defects) { const value = fingerprint(); mutate(value); assert.throws(() => selectSdkPublicUtilitiesRuntimeProfile(value)); }
  assert.throws(() => selectSdkPublicUtilitiesRuntimeProfile({ ...fingerprint(), upstreamImplementationDrift: true }));
});

void test("both public utility coordinators report actual 209 provenance with one original-owner dispatch", async () => {
  for (const entry of cases) {
    const fixture = runtime(entry.payload), result = await entry.run(fixture.engine, entry.request, fingerprint());
    assert.equal(result["apiVersion"], "0.3.59.1ca9efb5");
    assert.equal(result["apiSha256"], SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles.publicApi.implementationSha256);
    assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute", "guard", "status"]);
    const admission = result["runtimeAdmission"];
    assert.ok(typeof admission === "object" && admission !== null && "profile" in admission);
    assert.equal(admission.profile, SDK_PUBLIC_UTILITIES_209_PROFILE.schema);
  }
  for (const descriptor of [...sdkMathDescriptors(), ...sdkSystemDescriptors()]) {
    assert.equal(descriptor.provenance.version, "0.3.50.ab46409c");
    assert.deepEqual(descriptor.additionalReviewedProvenance, [{ version: "0.3.59.1ca9efb5",
      apiSha256: SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles.publicApi.implementationSha256,
      scope: "public-utilities-only", liveValidation: "not-recorded" }]);
  }
});

void test("both 209 coordinators preserve pre-dispatch quarantine, mismatch and post-dispatch no-replay refusal", async () => {
  for (const entry of cases) {
    const quarantine = runtime(entry.payload, { quarantined: true });
    await assert.rejects(entry.run(quarantine.engine, entry.request, fingerprint()), /quarantined/u);
    assert.deepEqual(quarantine.calls, ["guard"]);
    const wrongInitial = runtime(entry.payload, { initial: fingerprint("206") });
    await assert.rejects(entry.run(wrongInitial.engine, entry.request, fingerprint()));
    assert.deepEqual(wrongInitial.calls, ["guard", "status"]);
    const final = fingerprint(); final.installedBundles.publicApi.declarationsSha256 = "0".repeat(64);
    for (const changed of [final, fingerprint("206")]) {
      const drift = runtime(entry.payload, { final: changed });
      await assert.rejects(entry.run(drift.engine, entry.request, fingerprint()));
      assert.equal(drift.calls.filter((name) => name === "easyeda_execute").length, 1);
    }
    const unsettled = runtime(entry.payload, { unsettled: true });
    await assert.rejects(entry.run(unsettled.engine, entry.request, fingerprint()), /execution-unsettled/u);
    assert.deepEqual(unsettled.calls, ["guard", "status", "guard", "easyeda_execute"]);
  }
});
