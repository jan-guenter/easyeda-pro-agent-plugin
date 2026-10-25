import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { test } from "node:test";
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint } from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { compareNetlistFiles, prepareNetlistFile } from "../src/netlist-files-runtime.ts";
import { NETLIST_FILES_MAX_RESULT_BYTES, NETLIST_FILES_METHOD, expectedNetlistDifferences, netlistManagedFileSchema, parseNetlistFileText } from "../src/netlist-files.ts";
import type { NetlistManagedFile } from "../src/netlist-files.ts";
import type { SdkLocalEngine } from "../src/sdk-local-runtime.ts";
import { SDK_PUBLIC_UTILITIES_209_PROFILE } from "../src/sdk-public-utilities-profile.ts";
import { substituteSyntheticUiDigests, uiFixture } from "./sdk-public-readers-runtime-fixtures.ts";

const leftText = "$PACKAGES\nR ; R1\n$NETS\nN1 ; R1.1\n$END\n", rightText = leftText.replace("N1 ;", "N2 ;");
function fingerprint(): ExpectedFingerprint {
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
    installedBundles: { available: true, assetsRoot: "/opt/assets", pcbEditor: { ...bundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...bundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/api-types.js", declarationsPath: "/opt/assets/api-types.d.ts" } },
  };
}
interface Request { action: "compare-files"; left: NetlistManagedFile; right: NetlistManagedFile }
async function inputs(): Promise<Request> {
  const left = await prepareNetlistFile({ action: "prepare-file", name: "left.tel", text: leftText, confirmLocalArtifact: true });
  const right = await prepareNetlistFile({ action: "prepare-file", name: "right.tel", text: rightText, confirmLocalArtifact: true });
  return { action: "compare-files", left: netlistManagedFileSchema.parse(left["file"]), right: netlistManagedFileSchema.parse(right["file"]) };
}
function payload(request: Request): Record<string, unknown> {
  return { ok: true, kind: "netlist-files-comparison", method: NETLIST_FILES_METHOD,
    leftSha256: request.left.sha256, rightSha256: request.right.sha256, samplesMatched: true, independentMembershipMatched: true,
    differences: expectedNetlistDifferences(parseNetlistFileText(leftText), parseNetlistFileText(rightText)) };
}
function runtime(expected: ExpectedFingerprint, request: Request, options: {
  final?: ExpectedFingerprint; denied?: boolean; reply?: unknown; beforeReply?: () => Promise<void>;
} = {}): { engine: SdkLocalEngine; calls: string[] } {
  const calls: string[] = []; let statuses = 0;
  return { calls, engine: {
    assertBridgeDispatchAllowed: () => { calls.push("guard"); return options.denied === true ? Promise.reject(new Error("authentication unavailable")) : Promise.resolve(true); },
    status: () => { calls.push("status"); statuses += 1; return Promise.resolve({ stableFingerprint: structuredClone(statuses > 1 ? options.final ?? expected : expected) }); },
    upstream: { callTool: async (name, args, timeoutMs) => {
      calls.push(name); assert.equal(name, "easyeda_execute"); assert.ok(args);
      assert.equal(args["timeoutMs"], 60_000); assert.equal(timeoutMs, 70_000); assert.equal(args["confirmWrite"], true);
      await options.beforeReply?.();
      return { content: [], structuredContent: { ok: true, result: options.reply ?? encodeExactReadEnvelope(payload(request)) } };
    } },
  } };
}

void test("File comparison runtime qualifies exact managed inputs, authentication, UI and both selectors around one dispatch", async (context) => {
  const request = await inputs(), ui = await uiFixture(fingerprint());
  const observed = runtime(ui.expected, request);
  substituteSyntheticUiDigests(context, ui.substitutions, observed.calls);
  const result = await compareNetlistFiles(observed.engine, request, ui.expected);
  assert.equal(result["ok"], true); assert.equal(result["equalInScope"], false); assert.equal(result["connectedValidation"], false);
  assert.deepEqual(observed.calls, ["guard", "status", "ui-file-hash", "ui-file-hash", "ui-file-hash", "guard", "easyeda_execute",
    "ui-file-hash", "ui-file-hash", "ui-file-hash", "guard", "status"]);
});

void test("tampered managed input refuses before status, authentication or SDK dispatch", async () => {
  const expected = fingerprint(), request = await inputs();
  const observed = runtime(expected, request);
  await writeFile(request.left.path, rightText);
  await assert.rejects(compareNetlistFiles(observed.engine, request, expected), /SHA-256/u);
  assert.deepEqual(observed.calls, []);
});

void test("File comparison refuses missing authentication and unqualified UI before dispatch", async () => {
  const request = await inputs(), ui = await uiFixture(fingerprint());
  const denied = runtime(ui.expected, request, { denied: true });
  await assert.rejects(compareNetlistFiles(denied.engine, request, ui.expected), /authentication unavailable/u);
  assert.deepEqual(denied.calls, ["guard"]);
  const unqualified = runtime(ui.expected, request);
  await assert.rejects(compareNetlistFiles(unqualified.engine, request, ui.expected), /UI implementation differs/u);
  assert.deepEqual(unqualified.calls, ["guard", "status"]);
});

void test("File comparison refuses changed final runtime, oversized or wrong results after exactly one dispatch", async (context) => {
  const request = await inputs(), ui = await uiFixture(fingerprint());
  substituteSyntheticUiDigests(context, ui.substitutions, []);
  const changed = structuredClone(ui.expected); changed.installedBundles.assetsRoot += "-changed";
  const cases = [
    { options: { final: changed }, expectedError: /runtime changed/u },
    { options: { reply: "x".repeat(NETLIST_FILES_MAX_RESULT_BYTES) }, expectedError: /byte bound/u },
    { options: { reply: encodeExactReadEnvelope({ ...payload(request), differences: [] }) }, expectedError: /complete input membership model/u },
  ];
  for (const entry of cases) {
    const observed = runtime(ui.expected, request, entry.options);
    await assert.rejects(compareNetlistFiles(observed.engine, request, ui.expected), entry.expectedError);
    assert.equal(observed.calls.filter((call) => call === "easyeda_execute").length, 1);
  }
});

void test("File comparison rejects each changed UI selector after dispatch and never retries", async (context) => {
  const request = await inputs(), ui = await uiFixture(fingerprint());
  substituteSyntheticUiDigests(context, ui.substitutions, []);
  for (let index = 0; index < ui.fileCount; index += 1) {
    const observed = runtime(ui.expected, request, { beforeReply: () => ui.rewrite(index, true) });
    await assert.rejects(compareNetlistFiles(observed.engine, request, ui.expected), /UI implementation differs/u);
    assert.equal(observed.calls.filter((call) => call === "easyeda_execute").length, 1);
    await ui.rewrite(index, false);
  }
});
