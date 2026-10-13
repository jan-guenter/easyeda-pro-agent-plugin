import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { after, before, test } from "node:test";
import type { TestContext } from "node:test";
import type { ControlImplementationFingerprint, InstalledBundleFingerprint, ReviewedCompatibilityManifest, UpstreamLauncherFingerprint } from "../src/core.ts";
// oxlint-disable-next-line import/no-namespace -- Type only: retain the exact dynamically imported module after installing the scoped I/O interception.
import type * as CoreModule from "../src/core.ts";
import type { EasyedaControlEngine, ToolDescriptor } from "../src/engine.ts";
import type { UpstreamEasyedaClient } from "../src/upstream.ts";
import type { buildClosedSymbolExpectedFingerprint } from "../src/closed-symbol-expected-fingerprint.ts";
import { manifestPath, manifestState } from "./helpers/closed-symbol-expected-manifest-fs.ts";

let build: typeof buildClosedSymbolExpectedFingerprint;
let core: typeof CoreModule;
let Engine: typeof EasyedaControlEngine;
let Upstream: typeof UpstreamEasyedaClient;
let template: ReviewedCompatibilityManifest;
let unregister: () => void;
const tools: ToolDescriptor[] = ["easyeda_health_check", "easyeda_bridge_status", "easyeda_bridge_probe_methods"].map((name) => ({ name, inputSchema: { type: "object" } }));
before(async () => {
  // Capture repository metadata only; no installed/vendor, profile or project paths are opened.
  manifestState.bytes = await readFile(manifestPath);
  const coreUrl = new URL("../src/core.ts", import.meta.url).href;
  const replacement = new URL("helpers/closed-symbol-expected-manifest-fs.ts", import.meta.url).href;
  const hooks = registerHooks({ resolve(specifier, context, nextResolve) {
    if (specifier === "node:fs" && context.parentURL === coreUrl) { return { url: replacement, shortCircuit: true }; }
    return nextResolve(specifier, context);
  } });
  unregister = (): void => { hooks.deregister(); };
  core = await import("../src/core.ts");
  template = core.loadReviewedCompatibilityManifest();
  const engineModule = await import("../src/engine.ts");
  const upstreamModule = await import("../src/upstream.ts");
  const proposal = await import("../src/closed-symbol-expected-fingerprint.ts");
  Engine = engineModule.EasyedaControlEngine; Upstream = upstreamModule.UpstreamEasyedaClient; build = proposal.buildClosedSymbolExpectedFingerprint;
});
after(() => { unregister(); });

async function fixture(t: TestContext, mode: "source-tree" | "bundle" = "source-tree", bridgeVersion = false): Promise<{
  engine: InstanceType<typeof Engine>; upstream: InstanceType<typeof Upstream>; manifest: ReviewedCompatibilityManifest;
  facade: ControlImplementationFingerprint; launcher: UpstreamLauncherFingerprint; bundles: InstalledBundleFingerprint;
  calls: string[]; behavior: { launcher: (() => void) | undefined; bundles: (() => void) | undefined };
}> {
  const manifest = structuredClone(template);
  manifest.facadeImplementation["source-tree"] = { version: "test-version", operationSchema: core.OPERATION_SCHEMA,
    sha256: "1".repeat(64), fileCount: 1, files: [{ relativePath: "server/src/test.ts", bytes: 12, sha256: "2".repeat(64) }] };
  manifest.facadeImplementation.bundle = { version: "test-version", operationSchema: core.OPERATION_SCHEMA,
    sha256: "3".repeat(64), fileCount: 1, files: [{ relativePath: "server.mjs", bytes: 13, sha256: "4".repeat(64) }] };
  manifest.upstream.toolCatalog = { count: tools.length, sha256: core.sha256Json(tools) };
  manifest.connectedRuntime.bridgeEasyedaVersion = bridgeVersion ? manifest.connectedRuntime.easyedaVersion : null;
  manifestState.bytes = Buffer.from(JSON.stringify(manifest)); manifestState.beforeRead = undefined; manifestState.reads = 0;
  const projection = manifest.facadeImplementation[mode];
  const facade: ControlImplementationFingerprint = { version: projection.version, operationSchema: projection.operationSchema,
    mode, sha256: projection.sha256, files: projection.files.map((value) => ({ relativePath: value.relativePath, bytes: value.bytes,
      sha256: value.sha256, path: `/synthetic/control/${value.relativePath}` })) };
  const launcher = structuredClone(manifest.upstream.launcher);
  const bundles: InstalledBundleFingerprint = { available: true, assetsRoot: "/synthetic/assets",
    pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/synthetic/assets/pcb.js" },
    publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/synthetic/assets/api.js",
      adapterPath: "/synthetic/assets/api-types.js", declarationsPath: "/synthetic/assets/api-types.d.ts" } };
  const calls: string[] = [];
  const behavior: { launcher: (() => void) | undefined; bundles: (() => void) | undefined } = { launcher: undefined, bundles: undefined };
  const upstream = new Upstream();
  t.mock.method(upstream, "connect", () => { calls.push("connect"); throw new Error("Connection forbidden in this test."); });
  t.mock.method(upstream, "launcherState", () => { calls.push("launcherState"); throw new Error("Connecting state probe forbidden."); });
  t.mock.method(upstream, "listTools", () => { calls.push("listTools"); throw new Error("Tool listing forbidden."); });
  t.mock.method(upstream, "callTool", () => { calls.push("callTool"); throw new Error("Tool dispatch forbidden."); });
  t.mock.method(upstream, "launcherFingerprint", function readLauncher(this: InstanceType<typeof Upstream>) {
    assert.equal(this, upstream); calls.push("launcherFingerprint"); behavior.launcher?.(); return Promise.resolve(launcher);
  });
  t.mock.method(upstream, "installedEasyedaBundles", function readBundles(this: InstanceType<typeof Upstream>) {
    assert.equal(this, upstream); calls.push("installedEasyedaBundles"); behavior.bundles?.(); return Promise.resolve(bundles);
  });
  const engine = new Engine(upstream);
  await engine.controlFingerprintPromise;
  Object.defineProperty(engine, "controlFingerprintPromise", { value: Promise.resolve(facade), configurable: true });
  t.mock.method(engine, "status", () => { calls.push("status"); throw new Error("Live status forbidden while constructing expectation."); });
  return { engine, upstream, manifest, facade, launcher, bundles, calls, behavior };
}
function offline(calls: string[]): void { assert.ok(calls.every((name) => name === "launcherFingerprint" || name === "installedEasyedaBundles"), calls.join(",")); }
async function refused(f: Awaited<ReturnType<typeof fixture>>): Promise<void> { await assert.rejects(build(f.engine, f.upstream)); offline(f.calls); }

for (const mode of ["source-tree", "bundle"] as const) {
  for (const bridgeVersion of [false, true]) {
    // oxlint-disable-next-line eslint/no-loop-func -- Module references are initialized once by the awaited before hook, never by loop iterations.
    void test(`expected ${mode}, bridge version ${bridgeVersion} matches the actual maintained status projection`, async (t) => {
      const f = await fixture(t, mode, bridgeVersion);
      const expected = await build(f.engine, f.upstream); offline(f.calls);
      assert.deepEqual(f.calls, ["launcherFingerprint", "installedEasyedaBundles"]);
      assert.equal(expected.expectationOnly, true); assert.equal(expected.connectedRuntimeObserved, false); assert.equal(expected.executionAuthorized, false);
      assert.equal(core.validatePrivateFingerprint(expected.fingerprint), true);
      assert.equal(Object.isFrozen(expected.fingerprint.upstreamLauncher.args), true);
      assert.notEqual(expected.fingerprint.facadeImplementation, f.facade);
      // Call the real status implementation only after replacing every upstream I/O with synthetic data.
      const p = f.manifest.connectedRuntime;
      t.mock.method(f.upstream, "listTools", () => Promise.resolve(structuredClone(tools)));
      t.mock.method(f.upstream, "serverInfo", () => ({ name: "synthetic", version: f.manifest.upstream.serverVersion }));
      t.mock.method(f.upstream, "launcherState", () => Promise.resolve({ startup: f.launcher, current: f.launcher,
        startupSha256: core.sha256Json(f.launcher), currentSha256: core.sha256Json(f.launcher), drift: false }));
      t.mock.method(f.upstream, "callTool", (name: string) => {
        const values: Record<string, unknown> = {
          easyeda_health_check: { version: p.healthVersion, node_version: `v${p.nodeVersion}`, bridge_connected: true,
            easyeda_version: p.easyedaVersion, extension_version: p.extensionVersion, extension_version_mismatch: false, registry_mismatch: false },
          easyeda_bridge_status: { connected: true, bridge_version: p.bridgeVersion,
            ...(p.bridgeEasyedaVersion === null ? {} : { easyeda_version: p.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: p.methodRegistryHash } },
          easyeda_bridge_probe_methods: { source: p.dispatcher.source, dispatcher_build_id: p.dispatcher.buildId, total: p.dispatcher.total },
        };
        assert.ok(Object.hasOwn(values, name));
        return Promise.resolve({ content: [{ type: "text", text: JSON.stringify(values[name]) }] });
      });
      const actual = await Engine.prototype.status.call(f.engine);
      assert.equal(core.canonicalJson(actual.stableFingerprint), core.canonicalJson(expected.fingerprint));
      assert.equal(core.validatePrivateFingerprint(actual.stableFingerprint), true);
      assert.equal(f.calls.includes("connect"), false);
    });
  }
}

void test("expectation preserves upstream process.version spelling without relaxing the raw comparison", async (t) => {
  const f = await fixture(t), value = await build(f.engine, f.upstream);
  assert.equal(value.fingerprint.health.payload.node_version, `v${f.manifest.connectedRuntime.nodeVersion}`);
  const unprefixed = structuredClone(value.fingerprint); unprefixed.health.payload.node_version = f.manifest.connectedRuntime.nodeVersion;
  assert.equal(core.validatePrivateFingerprint(unprefixed), true);
  assert.notDeepEqual(core.compareSubset(unprefixed, value.fingerprint), []);
  offline(f.calls);
});
void test("unrelated engine/upstream pair refuses before local reads", async (t) => {
  const f = await fixture(t); await assert.rejects(build(f.engine, new Upstream()), /ownership/u); assert.deepEqual(f.calls, []);
});
for (const field of ["upstream", "controlFingerprintPromise"]) {
  void test(`engine ${field} accessor is refused without invocation`, async (t) => {
    const f = await fixture(t); let getters = 0;
    Object.defineProperty(f.engine, field, { get() { getters += 1; throw new Error("accessor invoked"); }, configurable: true });
    await refused(f); assert.equal(getters, 0);
  });
}
for (const field of ["launcherFingerprint", "installedEasyedaBundles"]) {
  void test(`local ${field} accessor is refused without invocation`, async (t) => {
    const f = await fixture(t); let getters = 0;
    Object.defineProperty(f.upstream, field, { get() { getters += 1; throw new Error("accessor invoked"); }, configurable: true });
    await refused(f); assert.equal(getters, 0);
  });
}
for (const phase of ["launcher", "bundles"] as const) {
  for (const changed of ["upstream", "promise", "launcher", "bundles", "manifest", "facade"] as const) {
    // oxlint-disable-next-line eslint/no-loop-func -- Module references are initialized once by the awaited before hook, never by loop iterations.
    void test(`refuses ${changed} drift at ${phase} await`, async (t) => {
      const f = await fixture(t);
      f.behavior[phase] = (): void => {
        if (changed === "upstream") { Object.defineProperty(f.engine, "upstream", { value: new Upstream() }); }
        if (changed === "promise") { Object.defineProperty(f.engine, "controlFingerprintPromise", { value: Promise.resolve(f.facade) }); }
        if (changed === "launcher") { f.upstream.launcherFingerprint = (): Promise<UpstreamLauncherFingerprint> => Promise.resolve(f.launcher); }
        if (changed === "bundles") { f.upstream.installedEasyedaBundles = (): Promise<InstalledBundleFingerprint> => Promise.resolve(f.bundles); }
        if (changed === "manifest") { f.manifest.reviewedAt = "2026-10-11T00:00:00Z"; manifestState.bytes = Buffer.from(JSON.stringify(f.manifest)); }
        if (changed === "facade") { const file = f.facade.files[0]; assert.ok(file); file.path += "-changed"; }
      };
      await refused(f);
    });
  }
}
void test("late mutation of the returned launcher is refused", async (t) => {
  const f = await fixture(t); f.behavior.bundles = (): void => { f.launcher.command += "-changed"; }; await refused(f);
});
for (const change of ["promise", "upstream", "reader", "manifest"] as const) {
  // oxlint-disable-next-line eslint/no-loop-func -- Upstream is initialized once in before; each case owns its deferred facade and mutations.
  void test(`refuses ${change} drift while the original facade promise is pending`, async (t) => {
    const f = await fixture(t);
    const deferred = Promise.withResolvers<ControlImplementationFingerprint>();
    Object.defineProperty(f.engine, "controlFingerprintPromise", { value: deferred.promise });
    const pending = build(f.engine, f.upstream);
    if (change === "promise") { Object.defineProperty(f.engine, "controlFingerprintPromise", { value: Promise.resolve(f.facade) }); }
    if (change === "upstream") { Object.defineProperty(f.engine, "upstream", { value: new Upstream() }); }
    if (change === "reader") { f.upstream.launcherFingerprint = (): Promise<UpstreamLauncherFingerprint> => Promise.resolve(f.launcher); }
    if (change === "manifest") { f.manifest.reviewedAt = "2026-10-11T00:00:00Z"; manifestState.bytes = Buffer.from(JSON.stringify(f.manifest)); }
    deferred.resolve(f.facade); await assert.rejects(pending); assert.deepEqual(f.calls, []);
  });
}
for (const field of ["facade", "launcher", "bundles"] as const) {
  void test(`local ${field} mismatch cannot be replaced by a reviewed hash`, async (t) => {
    const f = await fixture(t);
    if (field === "facade") { f.facade.sha256 = "a".repeat(64); }
    if (field === "launcher") { f.launcher.commandSha256 = "a".repeat(64); }
    if (field === "bundles") { f.bundles.publicApi.implementationSha256 = "a".repeat(64); }
    await refused(f);
  });
}
void test("detached immutable result does not freeze or alias owner data", async (t) => {
  const f = await fixture(t), result = await build(f.engine, f.upstream);
  const prior = core.canonicalJson(result);
  const file = f.facade.files[0]; assert.ok(file); file.path += "-later"; f.launcher.args.push("later"); f.bundles.assetsRoot += "-later";
  assert.equal(core.canonicalJson(result), prior);
  assert.throws(() => { result.fingerprint.health.payload.bridge_connected = true; }, TypeError);
  assert.equal(Object.isFrozen(f.launcher), false); offline(f.calls);
});
void test("individual JSON accessor is not invoked", async (t) => {
  const f = await fixture(t); let getters = 0;
  Object.defineProperty(f.launcher, "command", { enumerable: true, get() { getters += 1; return "/bad"; } });
  await refused(f); assert.equal(getters, 0);
});
void test("missing local reader cannot fall back to connecting launcherState", async (t) => {
  const f = await fixture(t); Object.defineProperty(f.upstream, "launcherFingerprint", { value: undefined });
  await refused(f); assert.deepEqual(f.calls, []);
});
void test("local probe failure remains a failure without upstream fallback", async (t) => {
  const f = await fixture(t); f.behavior.bundles = (): void => { throw new Error("synthetic local I/O failure"); }; await refused(f);
});
void test("serialized fingerprint bound includes the artifact newline", async (t) => {
  const f = await fixture(t), first = await build(f.engine, f.upstream);
  const bytes = Buffer.byteLength(JSON.stringify(first.fingerprint));
  f.bundles.assetsRoot += "x".repeat(262_143 - bytes);
  const exact = await build(f.engine, f.upstream); assert.equal(Buffer.byteLength(JSON.stringify(exact.fingerprint)) + 1, 262_144);
  f.bundles.assetsRoot += "x"; await refused(f);
});
void test("cumulative strings reject before a later accessor is traversed", async (t) => {
  const f = await fixture(t); let getters = 0;
  Object.assign(f.bundles, { extra1: "x".repeat(140_000), extra2: "x".repeat(140_000) });
  Object.defineProperty(f.bundles, "late", { enumerable: true, get() { getters += 1; return "late"; } });
  await refused(f); assert.equal(getters, 0);
});
for (const shape of ["undefined", "nan", "negative-zero", "cycle", "sparse", "symbol", "hidden"] as const) {
  void test(`local ${shape} data is refused rather than normalized`, async (t) => {
    const f = await fixture(t);
    const values: Record<string, unknown> = { undefined, nan: Number.NaN, "negative-zero": -0,
      cycle: f.bundles, sparse: Array.from({ length: 2 }, () => "value"), symbol: Symbol("test") };
    if (shape === "sparse") { const array = values["sparse"]; assert.ok(Array.isArray(array)); Reflect.deleteProperty(array, "0"); }
    if (shape === "hidden") { Object.defineProperty(f.bundles, "hidden", { value: "hidden", enumerable: false }); }
    else { Object.assign(f.bundles, { extra: values[shape] }); }
    await refused(f);
  });
}
