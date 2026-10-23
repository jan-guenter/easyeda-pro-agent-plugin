import assert from "node:assert/strict";
import { test } from "node:test";
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "../src/sdk-local-runtime.ts";
import { readSdkPublicReaders, validateSdkPublicReadersFingerprint } from "../src/sdk-public-readers-runtime.ts";
import type { SdkPublicReadersEngine } from "../src/sdk-public-readers-runtime.ts";
import { SDK_PUBLIC_READERS_MAX_BYTES } from "../src/sdk-public-readers.ts";
import { SDK_PUBLIC_UTILITIES_209_PROFILE } from "../src/sdk-public-utilities-profile.ts";

function fingerprint(generation: "206" | "209" = "209"): ExpectedFingerprint {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
  const bundles = (generation === "209" ? SDK_PUBLIC_UTILITIES_209_PROFILE : SDK_LOCAL_RUNTIME_PROFILE).installedBundles;
  return {
    facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => ({ path: `/opt/control/${file.relativePath}`,
      relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: pinned.healthVersion, node_version: `v${pinned.nodeVersion}`, bridge_connected: true,
      easyeda_version: `3.2.${generation}`, extension_version: pinned.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: pinned.bridgeVersion,
      ...(pinned.bridgeEasyedaVersion === null ? {} : { easyeda_version: pinned.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: pinned.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: pinned.dispatcher.source, dispatcher_build_id: pinned.dispatcher.buildId, total: pinned.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: "/opt/assets", pcbEditor: { ...bundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...bundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/api-types.js", declarationsPath: "/opt/assets/api-types.d.ts" } },
  };
}
const request = { method: "eda.sys_Window.getViewportSize", arguments: {} };
const payload = { ok: true, kind: "sdk-public-readers", method: request.method, value: { width: 1920, height: 1080 } };
const encoded = (value: unknown): unknown => ({ content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(value) } });
function runtime(options: { initial?: ExpectedFingerprint; final?: ExpectedFingerprint; quarantineAt?: number; reply?: unknown } = {}): {
  engine: SdkPublicReadersEngine; calls: string[];
} {
  const calls: string[] = []; let guards = 0, statuses = 0;
  return { calls, engine: {
    assertBridgeDispatchAllowed: () => {
      calls.push("guard"); guards += 1;
      return guards === options.quarantineAt ? Promise.reject(new Error("quarantined")) : Promise.resolve(true);
    },
    status: () => {
      calls.push("status"); statuses += 1;
      return Promise.resolve({ stableFingerprint: structuredClone(statuses > 1 ? options.final ?? options.initial ?? fingerprint() : options.initial ?? fingerprint()) });
    },
    upstream: { callTool: (name, args, timeoutMs) => {
      calls.push(name); assert.equal(name, "easyeda_execute"); assert.ok(args);
      assert.equal(args["confirmWrite"], true); assert.equal(args["timeoutMs"], 60_000); assert.equal(timeoutMs, 70_000);
      assert.match(String(args["code"]), /owner=eda\.sys_Window/u);
      return Promise.resolve(options.reply ?? encoded(payload));
    } },
  } };
}

void test("public readers require exact 209 admission and dispatch once through the existing authenticated owner", async () => {
  assert.equal(validateSdkPublicReadersFingerprint(fingerprint()), true);
  assert.throws(() => validateSdkPublicReadersFingerprint(fingerprint("206")), /3\.2\.209/u);
  const fixture = runtime(), value = await readSdkPublicReaders(fixture.engine, request, fingerprint());
  assert.deepEqual(value["value"], payload.value);
  assert.equal(value["apiVersion"], SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles.publicApi.version);
  assert.equal(value["apiSha256"], SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles.publicApi.implementationSha256);
  assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute", "guard", "status"]);
  assert.deepEqual(value["runtimeAdmission"], { profile: SDK_PUBLIC_UTILITIES_209_PROFILE.schema, fingerprintSha256: sha256Json(fingerprint()),
    beforeAndAfterChecked: true, scope: "fixed-language-catalog-or-extension-page-viewport", liveValidation: "not-recorded" });
});

void test("public readers reject invalid input, non-209 expected/observed tuples and quarantine before dispatch", async () => {
  const invalid = runtime(); await assert.rejects(readSdkPublicReaders(invalid.engine, { ...request, arguments: { code: "private()" } }, fingerprint()));
  assert.deepEqual(invalid.calls, []);
  for (const expected of [fingerprint("206"), { ...fingerprint(), upstreamImplementationDrift: true }]) {
    const fixture = runtime(); await assert.rejects(readSdkPublicReaders(fixture.engine, request, expected)); assert.deepEqual(fixture.calls, []);
  }
  const initial = runtime({ initial: fingerprint("206") }); await assert.rejects(readSdkPublicReaders(initial.engine, request, fingerprint()));
  assert.deepEqual(initial.calls, ["guard", "status"]);
  for (const quarantineAt of [1, 2]) {
    const fixture = runtime({ quarantineAt }); await assert.rejects(readSdkPublicReaders(fixture.engine, request, fingerprint()), /quarantined/u);
    assert.equal(fixture.calls.includes("easyeda_execute"), false);
  }
});

void test("public readers reject changed full identity or quarantine after dispatch without retry", async () => {
  const invalidBundle = fingerprint(); invalidBundle.installedBundles.publicApi.declarationsSha256 = "0".repeat(64);
  const changedIdentity = fingerprint(); changedIdentity.installedBundles.assetsRoot = "/opt/changed";
  for (const final of [invalidBundle, changedIdentity, fingerprint("206")]) {
    const fixture = runtime({ final }); await assert.rejects(readSdkPublicReaders(fixture.engine, request, fingerprint()));
    assert.equal(fixture.calls.filter((call) => call === "easyeda_execute").length, 1);
  }
  const fixture = runtime({ quarantineAt: 3 }); await assert.rejects(readSdkPublicReaders(fixture.engine, request, fingerprint()), /quarantined/u);
  assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute", "guard"]);
});

void test("public readers refuse unsettled, malformed, oversized and cross-method transport replies", async () => {
  for (const reply of [
    { isError: true, content: [], structuredContent: { ok: false, error: { code: "BRIDGE_TIMEOUT", message: "timeout" } } },
    encoded({ ...payload, method: "eda.sys_I18n.getAllSupportedLanguages" }), encoded({ ...payload, value: "x".repeat(SDK_PUBLIC_READERS_MAX_BYTES) }),
    encoded({ ...payload, value: { width: 1920.5, height: 1080 } }), encoded({ ...payload, hidden: true }),
  ]) {
    const fixture = runtime({ reply }); await assert.rejects(readSdkPublicReaders(fixture.engine, request, fingerprint()));
    assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute"]);
  }
});
