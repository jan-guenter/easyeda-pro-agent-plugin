import assert from "node:assert/strict";
import crypto from "node:crypto";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { dirname, join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint } from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";
import { EDITOR_SHELL_RUNTIME_PROFILE, readEditorShell } from "../src/editor-shell-runtime.ts";
import type { EditorShellEngine } from "../src/editor-shell-runtime.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";

const request = { action: "observe-editor-shell" };
const payload = { ok: true, kind: "editor-shell-observation", action: request.action,
  containerCount: 1, tabCount: 1, startPagePresent: true, startPageActive: true, activeTabPresent: true,
  placeholderTabCount: 0, otherTabCount: 0, visibilityVerified: false, restorationCompletionVerified: false,
  projectClosureVerified: false, startupQualified: false, cadAuthority: false, persistenceVerified: false };
const syntheticUi = "synthetic editor-shell UI for coordinator testing only";
const syntheticUiSha256 = crypto.createHash("sha256").update(syntheticUi).digest("hex");

function encoded(value: unknown): unknown {
  return { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(value) } };
}

function fingerprint(assetsRoot: string): ExpectedFingerprint {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
  const bundles = EDITOR_SHELL_RUNTIME_PROFILE.installedBundles;
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

/** Synthetic digest substitution is test-only. The production reader has no
 * injectable verifier, installation selector or compatibility override.
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
      if (encoding === "hex" && actual === syntheticUiSha256) { calls.push("ui-hash"); return EDITOR_SHELL_RUNTIME_PROFILE.uiImplementation.sha256; }
      return actual;
    }
    context.mock.method(hash, "digest", digest);
    return hash;
  });
  syncBuiltinESMExports();
  context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
}

async function runtime(options: { reply?: unknown; changeUi?: boolean; finalDrift?: boolean; quarantine?: boolean } = {}): Promise<{
  engine: EditorShellEngine; calls: string[]; expected: ExpectedFingerprint;
}> {
  const isolatedRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(isolatedRoot !== undefined); assert.match(isolatedRoot, /easyeda-test-control-/u);
  const assetsRoot = await mkdtemp(join(isolatedRoot, "editor-shell-runtime-"));
  const ui = join(assetsRoot, EDITOR_SHELL_RUNTIME_PROFILE.uiImplementation.relativePath);
  await mkdir(dirname(ui), { recursive: true, mode: 0o700 }); await writeFile(ui, syntheticUi, { mode: 0o600 });
  const calls: string[] = [], expected = fingerprint(assetsRoot);
  let statuses = 0;
  return { calls, expected, engine: {
    assertBridgeDispatchAllowed: (): Promise<true> => {
      calls.push("guard"); return options.quarantine === true ? Promise.reject(new Error("quarantined")) : Promise.resolve(true);
    },
    status: () => {
      calls.push("status"); statuses += 1;
      const observed = structuredClone(expected);
      if (options.finalDrift === true && statuses === 2) { observed.installedBundles.assetsRoot = "/opt/another-assets"; }
      return Promise.resolve({ stableFingerprint: observed });
    },
    upstream: { callTool: async (name, args, timeoutMs) => {
      calls.push(name); assert.equal(name, "easyeda_execute"); assert.ok(args);
      assert.equal(args["confirmWrite"], true); assert.equal(args["timeoutMs"], 60_000); assert.equal(timeoutMs, 70_000);
      assert.equal(typeof args["code"], "string");
      if (options.changeUi === true) { await writeFile(ui, "changed synthetic UI"); }
      return options.reply ?? encoded(payload);
    } },
  } };
}

void test("editor shell runtime pins UI around one guarded observation without startup or CAD authority", async (context) => {
  const fixture = await runtime(); mockSyntheticUiDigest(context, fixture.calls);
  const result = await readEditorShell(fixture.engine, request, fixture.expected);
  assert.deepEqual(fixture.calls, ["guard", "status", "ui-hash", "guard", "easyeda_execute", "ui-hash", "guard", "status"]);
  assert.equal(result["startPageActive"], true);
  const admission = result["runtimeAdmission"]; assert.ok(admission !== null && typeof admission === "object");
  for (const field of ["startupQualified", "cadAuthority", "persistenceVerified"]) { assert.equal(Reflect.get(admission, field), false); }
  assert.equal(JSON.stringify(result).includes(fixture.expected.installedBundles.assetsRoot), false);
});

void test("editor shell bad input, wrong runtime, quarantine and unreviewed UI refuse before execute", async () => {
  const invalid = await runtime();
  await assert.rejects(readEditorShell(invalid.engine, { ...request, path: "/opt/override" }, invalid.expected)); assert.deepEqual(invalid.calls, []);
  const wrong = await runtime(); wrong.expected.health.payload.easyeda_version = "3.2.207";
  await assert.rejects(readEditorShell(wrong.engine, request, wrong.expected)); assert.deepEqual(wrong.calls, []);
  const quarantined = await runtime({ quarantine: true });
  await assert.rejects(readEditorShell(quarantined.engine, request, quarantined.expected), /quarantined/u); assert.deepEqual(quarantined.calls, ["guard"]);
  const unreviewed = await runtime();
  await assert.rejects(readEditorShell(unreviewed.engine, request, unreviewed.expected), /UI implementation differs/u); assert.deepEqual(unreviewed.calls, ["guard", "status"]);
});

void test("editor shell changed UI/runtime and invalid results refuse after the sole dispatch", async (context) => {
  mockSyntheticUiDigest(context, []);
  const changed = await runtime({ changeUi: true });
  await assert.rejects(readEditorShell(changed.engine, request, changed.expected), /UI implementation differs/u);
  const drifted = await runtime({ finalDrift: true });
  await assert.rejects(readEditorShell(drifted.engine, request, drifted.expected), /runtime changed/u);
  const invalid = await runtime({ reply: encoded({ ...payload, startupQualified: true }) });
  await assert.rejects(readEditorShell(invalid.engine, request, invalid.expected));
  for (const fixture of [changed, drifted, invalid]) { assert.equal(fixture.calls.filter((call) => call === "easyeda_execute").length, 1); }
});
