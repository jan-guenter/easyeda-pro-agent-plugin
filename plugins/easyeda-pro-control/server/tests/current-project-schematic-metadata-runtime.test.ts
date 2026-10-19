/** Isolated synthetic runtime evidence only. No application or project reads. */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint } from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, CURRENT_PROJECT_ONLY_SCH_IMPLEMENTATION } from "../src/current-disposable-open-profile.ts";
import { readCurrentProjectSchematicMetadata } from "../src/current-project-schematic-metadata-runtime.ts";
import { buildCurrentProjectSchematicMetadataProgram } from "../src/current-project-schematic-metadata-program.ts";
// oxlint-disable-next-line import/max-dependencies -- Keep this admission test's source pins, engine, envelope and filesystem dependencies explicit instead of hiding them in a shared fixture.
import { CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES, CURRENT_PROJECT_SCHEMATIC_METADATA_TIMEOUT_MS } from "../src/current-project-schematic-metadata.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "../src/sdk-local-runtime.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), schematicUuid: "c".repeat(16) };
const request = { method: "eda.dmt_Schematic.getSchematicInfo", target };
const payload = { ok: true, kind: "current-project-schematic-metadata-observation", ...request, ownerUuid: "d".repeat(32),
  schematics: [{ uuid: target.schematicUuid, name: "observed", displayName: "Observed", source: "", version: "123", boardUuid: "", ticket: 2, updateTime: 123,
    children: [{ uuid: "e".repeat(16), schematicUuid: target.schematicUuid, title: "page", displayTitle: "Page", docType: 1, zIndex: 0, source: "", version: "123", ticket: 3, updateTime: 123 }] }],
  observedSchematicCount: 1, observedSheetCount: 1, completeNativeSchematicMapObserved: true, completeNativeSheetMapObserved: true, parentMembershipObserved: true,
  samples: 2, currentTabId: "0", implementationKind: "native-task-equivalent", noEditorTabsObserved: true, hiddenEditorsAbsentObserved: true,
  dirtyTabsAbsentObserved: true, cachedProjectReadOnlyAbsentObserved: true, concurrentStrictModeAbsentObserved: true,
  workerIdentityVerified: false, cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false,
  permissionVerified: false, startupCompletionVerified: false, mutationDispatched: false, explicitSaveDispatched: false };
const implementation = CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION;
const syntheticFiles = [
  { ...implementation.ui, data: Buffer.from("synthetic project SCHEMATIC metadata UI") },
  ...[...implementation.files, CURRENT_PROJECT_ONLY_SCH_IMPLEMENTATION].map((pin, index) => ({ relativePath: pin.relativePath, sha256: pin.sha256, data: Buffer.alloc(pin.bytes, index + 1) })),
].map((file) => Object.assign(file, { syntheticSha256: crypto.createHash("sha256").update(file.data).digest("hex") }));

function encoded(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(value) } }; }
function fingerprint(assetsRoot: string): ExpectedFingerprint {
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
    installedBundles: { available: true, assetsRoot, pcbEditor: { ...bundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...bundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/api-types.js", declarationsPath: "/opt/assets/api-types.d.ts" } },
  };
}

/** Map only private synthetic bytes to their fixed pins. Real bounded filesystem,
 * descriptor and crypto verification still executes, before and after dispatch.
 */
function mockSyntheticDigests(context: TestContext, calls: string[]): void {
  const createHash = crypto.createHash;
  context.mock.method(crypto, "createHash", (...args: Parameters<typeof createHash>): ReturnType<typeof createHash> => {
    const hash = createHash(...args), originalDigest = hash.digest.bind(hash);
    function digest(): Buffer;
    function digest(encoding: crypto.BinaryToTextEncoding): string;
    function digest(encoding?: crypto.BinaryToTextEncoding): Buffer | string {
      if (encoding === undefined) { return originalDigest(); }
      const actual = originalDigest(encoding), file = syntheticFiles.find((entry) => entry.syntheticSha256 === actual);
      if (encoding === "hex" && file !== undefined) { calls.push(`hash:${file.relativePath}`); return file.sha256; }
      return actual;
    }
    context.mock.method(hash, "digest", digest); return hash;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
}

type ScopeDrift = "initial-guard" | "initial-status" | "pre-execute-guard" | "execute" | "post-execute-guard" | "final-status";
interface RuntimeOptions {
  readonly quarantineAt?: number;
  readonly scopeMissing?: "reader" | "binding";
  readonly scopeDrift?: ScopeDrift;
  readonly replaceScopeReader?: boolean;
  readonly fingerprintDrift?: "initial-status" | "final-status";
  readonly changeFile?: string;
}
async function runtime(reply: unknown = encoded(payload), options: RuntimeOptions = {}): Promise<{
  engine: Parameters<typeof readCurrentProjectSchematicMetadata>[0]; calls: string[]; expected: ExpectedFingerprint;
}> {
  const isolatedRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(isolatedRoot !== undefined); assert.match(isolatedRoot, /easyeda-test-control-/u);
  const scratch = await mkdtemp(join(isolatedRoot, "project-schematic-metadata-runtime-"));
  const assetsRoot = join(scratch, "assets");
  await mkdir(assetsRoot, { mode: 0o700 });
  for (const file of syntheticFiles) {
    const path = resolve(assetsRoot, file.relativePath);
    await mkdir(dirname(path), { recursive: true, mode: 0o700 }); await writeFile(path, file.data, { mode: 0o600 });
  }
  const calls: string[] = [], expected = fingerprint(assetsRoot); let guards = 0, statuses = 0;
  const scope = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1" as const, gatewayInstanceId: "g".repeat(43),
    sessionId: "s".repeat(43), sessionSequence: 1, begunAtEpochMs: 1000, leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) };
  const upstream = {
    ...(options.scopeMissing === "reader" ? {} : { currentAuthenticatedBridgeDispatchBinding: (): typeof scope | undefined => options.scopeMissing === "binding" ? undefined : scope }),
    callTool: async (name: string, args?: Record<string, unknown>, timeoutMs?: number): Promise<unknown> => {
      calls.push(name); assert.equal(name, "easyeda_execute"); assert.ok(args);
      assert.deepEqual(Object.keys(args).toSorted(), ["code", "confirmWrite", "timeoutMs"]);
      assert.equal(args["code"], buildCurrentProjectSchematicMetadataProgram(request)); assert.equal(args["confirmWrite"], true);
      assert.equal(args["timeoutMs"], CURRENT_PROJECT_SCHEMATIC_METADATA_TIMEOUT_MS + 5000); assert.equal(timeoutMs, CURRENT_PROJECT_SCHEMATIC_METADATA_TIMEOUT_MS + 15_000);
      if (options.scopeDrift === "execute") { scope.sessionSequence += 1; }
      if (options.changeFile !== undefined) { await writeFile(resolve(assetsRoot, options.changeFile), "changed synthetic source"); }
      return reply;
    },
  };
  return { calls, expected, engine: { upstream,
    assertBridgeDispatchAllowed: (): Promise<true> => {
      calls.push("guard"); guards += 1;
      const phase = ["initial-guard", "pre-execute-guard", "post-execute-guard"][guards - 1]; assert.ok(phase !== undefined);
      if (options.scopeDrift === phase) { scope.sessionSequence += 1; }
      return options.quarantineAt === guards ? Promise.reject(new Error("quarantined")) : Promise.resolve(true);
    },
    status: () => {
      calls.push("status"); statuses += 1; const observed = structuredClone(expected), phase = statuses === 1 ? "initial-status" : "final-status";
      if (options.scopeDrift === phase) { scope.sessionSequence += 1; }
      if (options.replaceScopeReader === true && statuses === 1) { upstream.currentAuthenticatedBridgeDispatchBinding = (): typeof scope => scope; }
      if (options.fingerprintDrift === phase) { observed.installedBundles.assetsRoot = "/opt/another-assets"; }
      return Promise.resolve({ stableFingerprint: observed });
    },
  } };
}

void test("project SCHEMATIC metadata pins every source around one bounded observation without granting authority", async (context) => {
  const fixture = await runtime(); mockSyntheticDigests(context, fixture.calls);
  const hashes = syntheticFiles.map((file) => `hash:${file.relativePath}`);
  const result = await readCurrentProjectSchematicMetadata(fixture.engine, request, fixture.expected);
  assert.deepEqual(fixture.calls, ["guard", "status", ...hashes, "guard", "easyeda_execute", ...hashes, "guard", "status"]);
  assert.deepEqual(result["schematics"], payload.schematics); assert.deepEqual(result["target"], target);
  assert.equal(result["liveValidation"], "not-recorded"); assert.equal(result["implementationKind"], "native-task-equivalent");
  for (const key of ["workerIdentityVerified", "cadAuthority", "persistenceVerified", "sourceMembershipVerified", "permissionVerified", "mutationDispatched", "explicitSaveDispatched"]) {
    assert.equal(result[key], false);
  }
  const admission = result["runtimeAdmission"]; assert.ok(admission !== null && typeof admission === "object");
  assert.equal(Reflect.get(admission, "scope"), "loaded-project-with-no-editor-tabs-schematic-metadata-only");
  assert.equal(Reflect.get(admission, "beforeAndAfterChecked"), true); assert.equal(Reflect.get(admission, "liveValidation"), "not-recorded");
  for (const key of ["workerIdentityVerified", "designExecutionAuthorized", "persistenceVerified"]) { assert.equal(Reflect.get(admission, key), false); }
  assert.match(String(result["observationSha256"]), /^[a-f0-9]{64}$/u);
  assert.ok(Buffer.byteLength(JSON.stringify(result), "utf8") < CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES);
  assert.equal(JSON.stringify(result).includes(fixture.expected.installedBundles.assetsRoot), false);
});

void test("project SCHEMATIC runtime rejects malformed requests, accessors and unsupported fingerprints before dispatch", async () => {
  const fixture = await runtime(); let invoked = false;
  const accessor = Object.defineProperty({ ...request }, "method", { get(): string { invoked = true; return request.method; } });
  for (const invalid of [{ ...request, extra: true }, { ...request, target: { ...target, schematicUuid: "wrong" } }, accessor]) {
    await assert.rejects(readCurrentProjectSchematicMetadata(fixture.engine, invalid, fixture.expected));
  }
  assert.equal(invoked, false); assert.deepEqual(fixture.calls, []);
  const wrong = structuredClone(fixture.expected); wrong.health.payload.easyeda_version = "3.2.207";
  await assert.rejects(readCurrentProjectSchematicMetadata(fixture.engine, request, wrong)); assert.deepEqual(fixture.calls, []);
});

void test("project SCHEMATIC runtime requires the original authenticated reader and binding at each async boundary", async (context) => {
  mockSyntheticDigests(context, []);
  for (const scopeMissing of ["reader", "binding"] as const) {
    const fixture = await runtime(undefined, { scopeMissing });
    await assert.rejects(readCurrentProjectSchematicMetadata(fixture.engine, request, fixture.expected), /authenticated scope/u); assert.deepEqual(fixture.calls, []);
  }
  const replaced = await runtime(undefined, { replaceScopeReader: true });
  await assert.rejects(readCurrentProjectSchematicMetadata(replaced.engine, request, replaced.expected), /scope changed/u);
  assert.deepEqual(replaced.calls, ["guard", "status"]);
  for (const scopeDrift of ["initial-guard", "initial-status", "pre-execute-guard", "execute", "post-execute-guard", "final-status"] as const) {
    const fixture = await runtime(undefined, { scopeDrift });
    await assert.rejects(readCurrentProjectSchematicMetadata(fixture.engine, request, fixture.expected), /scope changed/u);
    assert.equal(fixture.calls.filter((call) => call === "easyeda_execute").length, ["execute", "post-execute-guard", "final-status"].includes(scopeDrift) ? 1 : 0);
  }
});

void test("project SCHEMATIC quarantine blocks dispatch or result publication without retry", async (context) => {
  mockSyntheticDigests(context, []);
  for (const quarantineAt of [1, 2, 3]) {
    const fixture = await runtime(undefined, { quarantineAt });
    await assert.rejects(readCurrentProjectSchematicMetadata(fixture.engine, request, fixture.expected), /quarantined/u);
    assert.equal(fixture.calls.filter((call) => call === "easyeda_execute").length, quarantineAt === 3 ? 1 : 0);
    assert.equal(fixture.calls.filter((call) => call === "guard").length, quarantineAt);
  }
});

void test("project SCHEMATIC runtime refuses unreviewed source before dispatch", async () => {
  const fixture = await runtime();
  await assert.rejects(readCurrentProjectSchematicMetadata(fixture.engine, request, fixture.expected), /UI implementation differs/u);
  assert.deepEqual(fixture.calls, ["guard", "status"]);
});

void test("project SCHEMATIC changed source or fingerprint refuses publication and never retries", async (context) => {
  mockSyntheticDigests(context, []);
  for (const file of syntheticFiles) {
    const fixture = await runtime(undefined, { changeFile: file.relativePath });
    await assert.rejects(readCurrentProjectSchematicMetadata(fixture.engine, request, fixture.expected), /implementation differs/u);
    assert.equal(fixture.calls.filter((call) => call === "easyeda_execute").length, 1);
  }
  for (const fingerprintDrift of ["initial-status", "final-status"] as const) {
    const fixture = await runtime(undefined, { fingerprintDrift });
    await assert.rejects(readCurrentProjectSchematicMetadata(fixture.engine, request, fixture.expected), /expected runtime|runtime changed/u);
    assert.equal(fixture.calls.filter((call) => call === "easyeda_execute").length, fingerprintDrift === "initial-status" ? 0 : 1);
  }
});

void test("project SCHEMATIC malformed, mismatched, oversized and authority-inventing replies refuse after one execute", async (context) => {
  mockSyntheticDigests(context, []);
  for (const value of [null, { ...payload, target: { ...target, branchUuid: "f".repeat(32) } }, { ...payload, schematics: [] },
    { ...payload, workerIdentityVerified: true }, { ...payload, noEditorTabsObserved: false }, { ...payload, unexpected: "x".repeat(CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES) }]) {
    const fixture = await runtime(encoded(value));
    await assert.rejects(readCurrentProjectSchematicMetadata(fixture.engine, request, fixture.expected));
    assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute"]);
  }
});
