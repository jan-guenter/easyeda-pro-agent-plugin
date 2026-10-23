import assert from "node:assert/strict";
import crypto from "node:crypto";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { dirname, join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint } from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";
import { buildEditorContextProgram, queryEditorContext } from "../src/editor-context.ts";
import { EDITOR_OBSERVATION_209_PROVENANCE, EDITOR_OBSERVATION_209_SELECTORS, EDITOR_OBSERVATION_209_UI } from "../src/editor-observation209-profile.ts";
import { EDITOR_CONTEXT_209_RUNTIME_PROFILE, EDITOR_SHELL_209_RUNTIME_PROFILE, EDITOR_SHELL_RUNTIME_PROFILE, readEditorContext, readEditorShell } from "../src/editor-shell-runtime.ts";
import type { EditorShellEngine } from "../src/editor-shell-runtime.ts";
// oxlint-disable-next-line import/max-dependencies -- This focused cross-reader admission test compares all three fixed routes against one synthetic 209 installation.
import { buildEditorShellProgram, queryEditorShell } from "../src/editor-shell.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { SDK_PUBLIC_UTILITIES_209_PROFILE } from "../src/sdk-public-utilities-profile.ts";
import { SHORTCUT_KEYS_209_RUNTIME_PROFILE, readShortcutKeys } from "../src/shortcut-keys-runtime.ts";
import { SHORTCUT_KEYS_METHOD, buildShortcutKeys209Program, queryShortcutKeys, validateShortcutKeys209Result, validateShortcutKeysResult } from "../src/shortcut-keys.ts";

const cases = [
  { reader: readEditorShell, builder: buildEditorShellProgram, request: { action: "observe-editor-shell" },
    profile: EDITOR_SHELL_209_RUNTIME_PROFILE,
    payload: { ok: true, kind: "editor-shell-observation", action: "observe-editor-shell",
      containerCount: 1, tabCount: 1, startPagePresent: true, startPageActive: true, activeTabPresent: true,
      placeholderTabCount: 0, otherTabCount: 0, visibilityVerified: false, restorationCompletionVerified: false,
      projectClosureVerified: false, startupQualified: false, cadAuthority: false, persistenceVerified: false } },
  { reader: readEditorContext, builder: buildEditorContextProgram, request: { action: "observe-editor-context" },
    profile: EDITOR_CONTEXT_209_RUNTIME_PROFILE,
    payload: { ok: true, kind: "editor-context-observation", action: "observe-editor-context",
      active: { state: "start-page" }, project: { state: "undefined" }, branch: { state: "empty" },
      visibilityVerified: false, inputFocusVerified: false, restorationCompletionVerified: false,
      projectClosureVerified: false, startupQualified: false, cadAuthority: false, persistenceVerified: false } },
  { reader: readShortcutKeys, builder: buildShortcutKeys209Program, request: { method: SHORTCUT_KEYS_METHOD, arguments: { includeSystem: true } },
    profile: SHORTCUT_KEYS_209_RUNTIME_PROFILE,
    payload: { ok: true, kind: "shortcut-key-observation", method: SHORTCUT_KEYS_METHOD, includeSystem: true,
      shortcuts: [{ shortcutKey: ["Ctrl", ""], title: "Synthetic shortcut", documentType: [0, 11, 12, 13, 14], scene: [1, 6] }],
      keyboardExecutionAuthorized: false, cadAuthority: false, persistenceVerified: false } },
] as const;

function fingerprint(assetsRoot: string): ExpectedFingerprint {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
  const bundles = SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles;
  return {
    facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => ({ path: `/opt/control/${file.relativePath}`,
      relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: pinned.healthVersion, node_version: `v${pinned.nodeVersion}`, bridge_connected: true,
      easyeda_version: "3.2.209", extension_version: pinned.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: pinned.bridgeVersion,
      ...(pinned.bridgeEasyedaVersion === null ? {} : { easyeda_version: pinned.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: pinned.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: pinned.dispatcher.source, dispatcher_build_id: pinned.dispatcher.buildId, total: pinned.dispatcher.total } },
    installedBundles: { available: true, assetsRoot, pcbEditor: { ...bundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...bundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/api-types.js", declarationsPath: "/opt/assets/api-types.d.ts" } },
  };
}

const pinnedFiles = [EDITOR_OBSERVATION_209_UI, ...EDITOR_OBSERVATION_209_SELECTORS];
const syntheticContents = pinnedFiles.map((profile) => `synthetic 209 reader fixture only: ${profile.relativePath}`);
const syntheticDigests = syntheticContents.map((value) => crypto.createHash("sha256").update(value).digest("hex"));

/** Only synthetic file digests are substituted; production has no verifier,
 * path, profile, generation or hash override in its request surface.
 */
function mockDigests(context: TestContext): void {
  const createHash = crypto.createHash;
  context.mock.method(crypto, "createHash", (...args: Parameters<typeof createHash>): ReturnType<typeof createHash> => {
    const hash = createHash(...args), originalDigest = hash.digest.bind(hash);
    function digest(): Buffer;
    function digest(encoding: crypto.BinaryToTextEncoding): string;
    function digest(encoding?: crypto.BinaryToTextEncoding): Buffer | string {
      if (encoding === undefined) { return originalDigest(); }
      const actual = originalDigest(encoding), index = syntheticDigests.indexOf(actual);
      return encoding === "hex" && index !== -1 ? pinnedFiles[index]?.sha256 ?? actual : actual;
    }
    context.mock.method(hash, "digest", digest); return hash;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
}

async function fixture(selected: typeof cases[number], options: { changeFile?: number; finalDrift?: boolean } = {}): Promise<{
  engine: EditorShellEngine; expected: ExpectedFingerprint; calls: string[]; paths: string[];
}> {
  const control = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(control !== undefined); assert.match(control, /easyeda-test-control-/u);
  const isolated = await mkdtemp(join(control, "observation209-"));
  const assetsRoot = join(isolated, "assets");
  const paths = pinnedFiles.map((profile) => join(assetsRoot, profile.relativePath));
  for (const [index, path] of paths.entries()) {
    await mkdir(dirname(path), { recursive: true, mode: 0o700 });
    const contents = syntheticContents[index]; assert.ok(contents !== undefined); await writeFile(path, contents, { mode: 0o600 });
  }
  const calls: string[] = [], expected = fingerprint(assetsRoot); let statuses = 0;
  return { expected, calls, paths, engine: {
    assertBridgeDispatchAllowed: () => { calls.push("guard"); return Promise.resolve(true); },
    status: () => {
      calls.push("status"); statuses += 1; const observed = structuredClone(expected);
      if (options.finalDrift === true && statuses === 2) { observed.installedBundles.assetsRoot = "/opt/changed-assets"; }
      return Promise.resolve({ stableFingerprint: observed });
    },
    upstream: { callTool: async (name, args, timeout) => {
      calls.push(name); assert.equal(name, "easyeda_execute"); assert.ok(args); assert.equal(args["code"], selected.builder(selected.request));
      assert.equal(args["confirmWrite"], true); assert.equal(args["timeoutMs"], 60_000); assert.equal(timeout, 70_000);
      if (options.changeFile !== undefined) { const path = paths[options.changeFile]; assert.ok(path !== undefined); await writeFile(path, "drifted fixture"); }
      return { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(selected.payload) } };
    } },
  } };
}

void test("209 shell, context and shortcut readers select exact profiles and current provenance without CAD authority", async (context) => {
  mockDigests(context);
  for (const selected of cases) {
    const runtime = await fixture(selected);
    const result = await selected.reader(runtime.engine, selected.request, runtime.expected);
    assert.deepEqual(runtime.calls, ["guard", "status", "guard", "easyeda_execute", "guard", "status"]);
    for (const [key, value] of Object.entries(EDITOR_OBSERVATION_209_PROVENANCE)) { assert.equal(result[key], value); }
    const admission = result["runtimeAdmission"]; assert.ok(admission !== null && typeof admission === "object");
    assert.equal(Reflect.get(admission, "profile"), selected.profile.schema);
    assert.deepEqual(Reflect.get(admission, "uiImplementation"), EDITOR_OBSERVATION_209_UI);
    assert.equal(Reflect.get(admission, "cadAuthority"), false); assert.equal(Reflect.get(admission, "persistenceVerified"), false);
    assert.equal(JSON.stringify(result).includes(runtime.expected.installedBundles.assetsRoot), false);
  }
});

void test("209 readers reject mixed 206 API pins and every unreviewed UI/selector before dispatch", async (context) => {
  mockDigests(context);
  for (const selected of cases) {
    const mixed = await fixture(selected);
    Object.assign(mixed.expected.installedBundles.publicApi, EDITOR_SHELL_RUNTIME_PROFILE.installedBundles.publicApi);
    await assert.rejects(selected.reader(mixed.engine, selected.request, mixed.expected)); assert.deepEqual(mixed.calls, []);
  }
  for (const index of [0, 1, 2]) {
    const selected = cases[index]; assert.ok(selected); const runtime = await fixture(selected);
    const path = runtime.paths[index]; assert.ok(path !== undefined);
    await writeFile(path, "unreviewed fixture");
    await assert.rejects(selected.reader(runtime.engine, selected.request, runtime.expected), /UI implementation differs/u);
    assert.deepEqual(runtime.calls, ["guard", "status"]);
  }
});

void test("209 reader UI/selector drift and final fingerprint drift refuse publication without replay", async (context) => {
  mockDigests(context);
  for (const [index, selected] of cases.entries()) {
    for (const options of [{ changeFile: index }, { finalDrift: true }]) {
      const runtime = await fixture(selected, options);
      await assert.rejects(selected.reader(runtime.engine, selected.request, runtime.expected), /UI implementation differs|runtime changed/u);
      assert.equal(runtime.calls.filter((call) => call === "easyeda_execute").length, 1);
    }
  }
});

void test("209 discovery labels additional generation and raw shortcut scopes without widening the 206 result parser", () => {
  for (const query of [queryEditorShell, queryEditorContext, queryShortcutKeys]) {
    const catalog = query({ includeSchemas: true }); assert.equal(catalog["invocationEnabledByDiscovery"], false);
    assert.match(JSON.stringify(catalog), /additionalReviewedProvenance/u); assert.match(JSON.stringify(catalog), /3\.2\.198\.2800f583/u);
  }
  const selected = cases[2];
  assert.throws(() => validateShortcutKeysResult(selected.request, selected.payload));
  assert.deepEqual(validateShortcutKeys209Result(selected.request, selected.payload)["shortcuts"], selected.payload.shortcuts);
  assert.throws(() => validateShortcutKeys209Result(selected.request, { ...selected.payload,
    shortcuts: [{ ...selected.payload.shortcuts[0], documentType: [15] }] }));
});
