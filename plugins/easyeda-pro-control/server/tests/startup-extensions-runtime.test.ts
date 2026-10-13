import assert from "node:assert/strict";
import crypto from "node:crypto";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { dirname, join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint } from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { STARTUP_EXTENSIONS_RUNTIME_PROFILE, readStartupExtensions } from "../src/startup-extensions-runtime.ts";
import type { StartupExtensionsEngine } from "../src/startup-extensions-runtime.ts";
import { STARTUP_EXTENSIONS_MAX_BYTES } from "../src/startup-extensions.ts";

const request = { action: "list-startup-index" };
const payload = { ok: true, kind: "startup-extension-index", action: request.action, databaseActorBound: false, startupQualified: false, extensions: [{
  uuid: "7e06d286b1ac846ef7eab9c7f2a9ee40", config: { name: "synthetic-bridge", version: "0.3.0", entry: "./dist/index" },
  isEnable: true, isAutoUpdate: false, isOnlineSync: false,
}] };
const syntheticUi = "synthetic startup-index UI for coordinator testing only";
const syntheticUiSha256 = crypto.createHash("sha256").update(syntheticUi).digest("hex");

function encoded(value: unknown): unknown {
  return { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(value) } };
}

function fingerprint(assetsRoot: string): ExpectedFingerprint {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
  const bundles = STARTUP_EXTENSIONS_RUNTIME_PROFILE.installedBundles;
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

/** Simulate only the synthetic UI digest. The production coordinator has no
 * hash override. These composed tests do not qualify real installed UI bytes.
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
      if (encoding === "hex" && actual === syntheticUiSha256) {
        calls.push("ui-hash");
        return STARTUP_EXTENSIONS_RUNTIME_PROFILE.uiImplementation.sha256;
      }
      return actual;
    }
    context.mock.method(hash, "digest", digest);
    return hash;
  });
  syncBuiltinESMExports();
  context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
}

async function runtime(options: { reply?: unknown; changeUi?: boolean; finalDrift?: boolean; quarantine?: boolean } = {}): Promise<{
  engine: StartupExtensionsEngine; calls: string[]; expected: ExpectedFingerprint;
}> {
  const isolatedRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(isolatedRoot !== undefined);
  assert.match(isolatedRoot, /easyeda-test-control-/u);
  const assetsRoot = await mkdtemp(join(isolatedRoot, "startup-index-runtime-"));
  const ui = join(assetsRoot, STARTUP_EXTENSIONS_RUNTIME_PROFILE.uiImplementation.relativePath);
  await mkdir(dirname(ui), { recursive: true, mode: 0o700 });
  await writeFile(ui, syntheticUi, { mode: 0o600 });
  const calls: string[] = [], expected = fingerprint(assetsRoot);
  let statuses = 0;
  return { calls, expected, engine: {
    assertBridgeDispatchAllowed: (): Promise<true> => {
      calls.push("guard");
      return options.quarantine === true ? Promise.reject(new Error("quarantined")) : Promise.resolve(true);
    },
    status: () => {
      calls.push("status"); statuses += 1;
      const observed = structuredClone(expected);
      if (options.finalDrift === true && statuses === 2) { observed.installedBundles.assetsRoot = "/opt/another-assets"; }
      return Promise.resolve({ stableFingerprint: observed });
    },
    upstream: { callTool: async (name, args, timeoutMs) => {
      calls.push(name);
      assert.equal(name, "easyeda_execute");
      assert.ok(args);
      assert.equal(args["confirmWrite"], true);
      assert.equal(args["timeoutMs"], 60_000);
      assert.equal(timeoutMs, 70_000);
      assert.equal(typeof args["code"], "string");
      if (options.changeUi === true) { await writeFile(ui, "changed synthetic UI"); }
      return options.reply ?? encoded(payload);
    } },
  } };
}

void test("startup index coordinator hashes observed installed UI around one guarded execute without granting launch", async (context) => {
  const fixture = await runtime();
  mockSyntheticUiDigest(context, fixture.calls);
  const result = await readStartupExtensions(fixture.engine, request, fixture.expected);
  assert.deepEqual(fixture.calls, ["guard", "status", "ui-hash", "guard", "easyeda_execute", "ui-hash", "guard", "status"]);
  assert.deepEqual(result["extensions"], payload.extensions);
  const admission = result["runtimeAdmission"];
  assert.ok(admission !== null && typeof admission === "object");
  assert.equal(Reflect.get(admission, "scope"), "observed-initialized-extension-index-only");
  for (const field of ["databaseActorBound", "startupQualified", "launcherQualified", "builtInsIncluded", "queuedActivationsIncluded"]) {
    assert.equal(Reflect.get(admission, field), false);
  }
  assert.equal(JSON.stringify(result).includes(fixture.expected.installedBundles.assetsRoot), false);
});

void test("startup index malformed requests, wrong runtime, quarantine and unreviewed UI refuse before execution", async () => {
  const invalid = await runtime();
  await assert.rejects(readStartupExtensions(invalid.engine, { ...request, assetsRoot: "/opt/override" }, invalid.expected));
  assert.deepEqual(invalid.calls, []);
  const wrongRuntime = await runtime();
  wrongRuntime.expected.health.payload.easyeda_version = "3.2.207";
  await assert.rejects(readStartupExtensions(wrongRuntime.engine, request, wrongRuntime.expected));
  assert.deepEqual(wrongRuntime.calls, []);
  const quarantined = await runtime({ quarantine: true });
  await assert.rejects(readStartupExtensions(quarantined.engine, request, quarantined.expected), /quarantined/u);
  assert.deepEqual(quarantined.calls, ["guard"]);
  const unreviewed = await runtime();
  await assert.rejects(readStartupExtensions(unreviewed.engine, request, unreviewed.expected), /UI implementation differs/u);
  assert.deepEqual(unreviewed.calls, ["guard", "status"]);
});

void test("startup index changed installed UI or complete runtime identity refuses publication without replay", async (context) => {
  const changed = await runtime({ changeUi: true }), drifted = await runtime({ finalDrift: true });
  mockSyntheticUiDigest(context, []);
  await assert.rejects(readStartupExtensions(changed.engine, request, changed.expected), /UI implementation differs/u);
  assert.deepEqual(changed.calls, ["guard", "status", "guard", "easyeda_execute"]);
  await assert.rejects(readStartupExtensions(drifted.engine, request, drifted.expected), /runtime changed/u);
  assert.deepEqual(drifted.calls, ["guard", "status", "guard", "easyeda_execute", "guard", "status"]);
});

void test("startup index unsettled, oversized and mismatched output refuse after the sole dispatch", async (context) => {
  mockSyntheticUiDigest(context, []);
  const replies = [
    { isError: true, content: [], structuredContent: { ok: false, error: { code: "BRIDGE_TIMEOUT", message: "timeout" } } },
    encoded({ ...payload, extra: "x".repeat(STARTUP_EXTENSIONS_MAX_BYTES) }),
    encoded({ ...payload, action: "activate" }),
  ];
  for (const reply of replies) {
    const fixture = await runtime({ reply });
    await assert.rejects(readStartupExtensions(fixture.engine, request, fixture.expected));
    assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute"]);
  }
});
