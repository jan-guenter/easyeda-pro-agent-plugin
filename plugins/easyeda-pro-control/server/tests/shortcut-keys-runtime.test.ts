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
import { SHORTCUT_KEYS_RUNTIME_PROFILE, readShortcutKeys } from "../src/shortcut-keys-runtime.ts";
import type { ShortcutKeysEngine } from "../src/shortcut-keys-runtime.ts";
import { SHORTCUT_KEYS_MAX_BYTES, SHORTCUT_KEYS_METHOD, buildShortcutKeysProgram } from "../src/shortcut-keys.ts";

const request = { method: SHORTCUT_KEYS_METHOD, arguments: {} };
const payload = { ok: true, kind: "shortcut-key-observation", method: SHORTCUT_KEYS_METHOD, includeSystem: false,
  shortcuts: [{ shortcutKey: ["Ctrl", ""], title: "Synthetic shortcut", documentType: [4], scene: [1, 6] }],
  keyboardExecutionAuthorized: false, cadAuthority: false, persistenceVerified: false };
const syntheticUi = "synthetic shortcut UI for coordinator testing only";
const syntheticUiSha256 = crypto.createHash("sha256").update(syntheticUi).digest("hex");

function encoded(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(value) } }; }

function fingerprint(assetsRoot: string): ExpectedFingerprint {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
  const bundles = SHORTCUT_KEYS_RUNTIME_PROFILE.installedBundles;
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

/** Substitute only the isolated synthetic digest, never a production verifier
 * or caller-selected pin. These fixtures do not establish connected evidence.
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
      if (encoding === "hex" && actual === syntheticUiSha256) { calls.push("ui-hash"); return SHORTCUT_KEYS_RUNTIME_PROFILE.uiImplementation.sha256; }
      return actual;
    }
    context.mock.method(hash, "digest", digest); return hash;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
}

async function runtime(options: { reply?: unknown; changeUi?: boolean; finalDrift?: boolean; quarantine?: boolean } = {}): Promise<{
  engine: ShortcutKeysEngine; calls: string[]; expected: ExpectedFingerprint;
}> {
  const isolatedRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(isolatedRoot !== undefined); assert.match(isolatedRoot, /easyeda-test-control-/u);
  const assetsRoot = await mkdtemp(join(isolatedRoot, "shortcut-runtime-"));
  const ui = join(assetsRoot, SHORTCUT_KEYS_RUNTIME_PROFILE.uiImplementation.relativePath);
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
      assert.equal(args["code"], buildShortcutKeysProgram(request));
      if (options.changeUi === true) { await writeFile(ui, "changed synthetic UI"); }
      return options.reply ?? encoded(payload);
    } },
  } };
}

void test("shortcut runtime pins current API/UI around one authenticated execute and never grants keyboard authority", async (context) => {
  const fixture = await runtime(); mockSyntheticUiDigest(context, fixture.calls);
  const result = await readShortcutKeys(fixture.engine, request, fixture.expected);
  assert.deepEqual(fixture.calls, ["guard", "status", "ui-hash", "guard", "easyeda_execute", "ui-hash", "guard", "status"]);
  assert.deepEqual(result["shortcuts"], payload.shortcuts);
  const admission = result["runtimeAdmission"]; assert.ok(admission !== null && typeof admission === "object");
  assert.equal(Reflect.get(admission, "scope"), "configured-shortcut-registry-only");
  for (const field of ["keyboardExecutionAuthorized", "cadAuthority", "persistenceVerified"]) { assert.equal(Reflect.get(admission, field), false); }
  assert.equal(JSON.stringify(result).includes(fixture.expected.installedBundles.assetsRoot), false);
});

void test("shortcut malformed requests, wrong runtime, quarantine and unreviewed UI refuse before dispatch", async () => {
  const invalid = await runtime();
  await assert.rejects(readShortcutKeys(invalid.engine, { ...request, path: "/opt/override" }, invalid.expected)); assert.deepEqual(invalid.calls, []);
  const wrong = await runtime(); wrong.expected.health.payload.easyeda_version = "3.2.207";
  await assert.rejects(readShortcutKeys(wrong.engine, request, wrong.expected)); assert.deepEqual(wrong.calls, []);
  const quarantined = await runtime({ quarantine: true });
  await assert.rejects(readShortcutKeys(quarantined.engine, request, quarantined.expected), /quarantined/u); assert.deepEqual(quarantined.calls, ["guard"]);
  const unreviewed = await runtime();
  await assert.rejects(readShortcutKeys(unreviewed.engine, request, unreviewed.expected), /UI implementation differs/u); assert.deepEqual(unreviewed.calls, ["guard", "status"]);
});

void test("shortcut changed installed UI or runtime refuses publication without replay", async (context) => {
  const changed = await runtime({ changeUi: true }), drifted = await runtime({ finalDrift: true }); mockSyntheticUiDigest(context, []);
  await assert.rejects(readShortcutKeys(changed.engine, request, changed.expected), /UI implementation differs/u);
  assert.deepEqual(changed.calls, ["guard", "status", "guard", "easyeda_execute"]);
  await assert.rejects(readShortcutKeys(drifted.engine, request, drifted.expected), /runtime changed/u);
  assert.deepEqual(drifted.calls, ["guard", "status", "guard", "easyeda_execute", "guard", "status"]);
});

void test("shortcut unsettled, oversized or wrong-filter replies refuse after the sole execute", async (context) => {
  mockSyntheticUiDigest(context, []);
  for (const reply of [
    { isError: true, content: [], structuredContent: { ok: false, error: { code: "BRIDGE_TIMEOUT", message: "timeout" } } },
    encoded({ ...payload, extra: "x".repeat(SHORTCUT_KEYS_MAX_BYTES) }), encoded({ ...payload, includeSystem: true }),
  ]) {
    const fixture = await runtime({ reply }); await assert.rejects(readShortcutKeys(fixture.engine, request, fixture.expected));
    assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute"]);
  }
});
