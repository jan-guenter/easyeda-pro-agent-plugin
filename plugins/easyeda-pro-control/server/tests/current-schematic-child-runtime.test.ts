/** Synthetic bridge/source/SQL only. No live native access or file data. */
/* oxlint-disable import/max-dependencies -- Exercise actual source admission, original SQL composition and transport at one fixed runtime boundary. */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint } from "../src/core.ts";
import type { ExpectedFingerprint } from "../src/core.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, CURRENT_PROJECT_ONLY_SCH_IMPLEMENTATION, CURRENT_SYMBOL_CLOCK_IMPLEMENTATION } from "../src/current-disposable-open-profile.ts";
import { CURRENT_SCHEMATIC_CHILD_TIMEOUT_MS, buildCurrentSchematicChildProgram } from "../src/current-schematic-child-program.ts";
import { prepareCurrentSchematicChildRoster } from "../src/current-schematic-child-roster.ts";
import { readCurrentSchematicChildren } from "../src/current-schematic-child-runtime.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "../src/sdk-local-runtime.ts";
import { REQUEST, TARGET, schematicBaseline } from "./helpers/current-schematic-rename-observer-fixture.ts";

type Input = Parameters<typeof readCurrentSchematicChildren>[1];
const implementation = CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION;
const files = [{ ...implementation.ui, data: Buffer.from("synthetic child observer UI") },
  ...[...implementation.files, CURRENT_PROJECT_ONLY_SCH_IMPLEMENTATION, CURRENT_SYMBOL_CLOCK_IMPLEMENTATION]
    .map((pin, index) => ({ relativePath: pin.relativePath, sha256: pin.sha256, data: Buffer.alloc(pin.bytes, index + 1) }))]
  .map(file => Object.assign(file, { syntheticSha256: crypto.createHash("sha256").update(file.data).digest("hex") }));
function fingerprint(assetsRoot: string): ExpectedFingerprint {
  const bundles = SDK_LOCAL_RUNTIME_PROFILE.installedBundles, manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
  return { facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map(file => ({ path: `/opt/control/${file.relativePath}`,
    relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: pinned.healthVersion, node_version: `v${pinned.nodeVersion}`, bridge_connected: true,
      easyeda_version: "3.2.206", extension_version: pinned.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: pinned.bridgeVersion,
      ...(pinned.bridgeEasyedaVersion === null ? {} : { easyeda_version: pinned.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: pinned.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: pinned.dispatcher.source, dispatcher_build_id: pinned.dispatcher.buildId, total: pinned.dispatcher.total } },
    installedBundles: { available: true, assetsRoot, pcbEditor: { ...bundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...bundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/api-types.js", declarationsPath: "/opt/assets/api-types.d.ts" } } };
}
function mockHashes(context: TestContext, hashes: string[]): void {
  const original = crypto.createHash;
  context.mock.method(crypto, "createHash", (...args: Parameters<typeof original>): ReturnType<typeof original> => {
    const hash = original(...args);
    const digest = hash.digest.bind(hash);
    function replacement(): Buffer;
    function replacement(encoding: crypto.BinaryToTextEncoding): string;
    function replacement(encoding?: crypto.BinaryToTextEncoding): Buffer | string {
      if (encoding === undefined) { return digest(); }
      const value = digest(encoding);
      const file = files.find(candidate => candidate.syntheticSha256 === value);
      if (encoding === "hex" && file !== undefined) { hashes.push(file.relativePath); return file.sha256; } return value;
    }
    context.mock.method(hash, "digest", replacement); return hash;
  });
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
}
async function baseline(): Promise<Input> {
  const { before, metadata } = await schematicBaseline(); return { before, metadata, roster: await prepareCurrentSchematicChildRoster(metadata, before) };
}
function reply(input: Input): unknown {
  const sample = { childKv: input.roster.childKv, manager: { prjUuid: TARGET.projectUuid, batchDepth: 0, _isClose: false, CBB: false,
    pendingSchematics: null, pendingSheets: null }, ast: { isBuild: true, isPass: false, transId: 1, lastModify: 123, schematic: input.roster.targetAst },
  tempAst: { isBuild: false, isPass: false, transId: 1, schematic: input.roster.targetAst } };
  return { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope({ profile: "private.current-schematic-child-roster-observation.v1",
    target: TARGET, samples: [sample, sample] }) } };
}
async function assets(): Promise<string> {
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"]; assert.ok(root !== undefined); assert.match(root, /easyeda-test-control-/u);
  const path = await mkdtemp(join(root, "schematic-child-runtime-"));
  for (const file of files) { const destination = resolve(path, file.relativePath); await mkdir(dirname(destination), { recursive: true }); await writeFile(destination, file.data); }
  return path;
}
function runtime(assetsRoot: string, response: unknown, driftAt?: number): { engine: Parameters<typeof readCurrentSchematicChildren>[0]; expected: ExpectedFingerprint; calls: string[] } {
  const calls: string[] = [], expected = fingerprint(assetsRoot);
  const scope = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1" as const, gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43),
    sessionSequence: 1, begunAtEpochMs: 1000, leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) };
  const record = (name: string): void => { calls.push(name); if (calls.length === driftAt) { scope.sessionSequence += 1; } };
  return { expected, calls, engine: { assertBridgeDispatchAllowed: () => { record("guard"); return Promise.resolve(true); },
    status: () => { record("status"); return Promise.resolve({ stableFingerprint: structuredClone(expected) }); },
    upstream: { currentAuthenticatedBridgeDispatchBinding: () => scope,
      callTool: (name, args, timeout) => {
        record(name); assert.equal(name, "easyeda_execute"); assert.deepEqual(args, { code: buildCurrentSchematicChildProgram(REQUEST), confirmWrite: true,
          timeoutMs: CURRENT_SCHEMATIC_CHILD_TIMEOUT_MS + 5000 }); assert.equal(timeout, CURRENT_SCHEMATIC_CHILD_TIMEOUT_MS + 15_000);
        return Promise.resolve(response);
      } } } };
}
void test("SCH child runtime verifies original roster and exact sources around the sole fixed observation", async context => {
  const hashes: string[] = [], input = await baseline(), path = await assets(); mockHashes(context, hashes);
  const env = runtime(path, reply(input));
  const result = await readCurrentSchematicChildren(env.engine, input, env.expected);
  assert.deepEqual(hashes, [...files, ...files].map(file => file.relativePath));
  assert.deepEqual(env.calls, ["guard", "status", "guard", "easyeda_execute", "guard", "status"]);
  assert.ok(Object.isFrozen(result)); assert.equal(JSON.stringify(result).includes(path), false);
  const admission = result["runtimeAdmission"], comparison = result["comparison"];
  assert.ok(comparison !== null && typeof comparison === "object"); assert.ok(admission !== null && typeof admission === "object");
  assert.equal(Reflect.get(comparison, "historicalChildRosterMatched"), true); assert.equal(Reflect.get(comparison, "writerAuthority"), false);
  assert.equal(Reflect.get(admission, "startupQualified"), false); assert.equal(Reflect.get(admission, "workerIdentityVerified"), false);
});
void test("SCH child runtime refuses copied identities, accessors and proxies before downstream work", async () => {
  const input = await baseline();
  const env = runtime("/opt/synthetic", reply(input)); let traps = 0;
  const trap = (): never => { traps += 1; throw new Error("must not execute"); };
  for (const invalid of [{ ...input, before: structuredClone(input.before) }, { ...input, metadata: structuredClone(input.metadata) },
    { ...input, roster: structuredClone(input.roster) }, { ...input, code: "untrusted" }, Object.defineProperty({ ...input }, "roster", { get: trap }),
    new Proxy(input, { get: trap, ownKeys: trap, getPrototypeOf: trap }), { ...input, roster: new Proxy(input.roster, { get: trap }) }]) {
    await assert.rejects(readCurrentSchematicChildren(env.engine, invalid, env.expected));
  }
  assert.equal(traps, 0); assert.deepEqual(env.calls, []);
});
void test("SCH child runtime stops scope drift at every await and rejects malformed observations without retry", async context => {
  const input = await baseline(), path = await assets(); mockHashes(context, []);
  for (const driftAt of [1, 2, 3, 4, 5, 6]) {
    const env = runtime(path, reply(input), driftAt);
    await assert.rejects(readCurrentSchematicChildren(env.engine, input, env.expected), /authenticated scope or retained receiver changed/u);
    assert.equal(env.calls.length, driftAt); assert.equal(env.calls.filter(name => name === "easyeda_execute").length, driftAt < 4 ? 0 : 1);
  }
  const env = runtime(path, { content: [], structuredContent: { pending: true } });
  await assert.rejects(readCurrentSchematicChildren(env.engine, input, env.expected));
  assert.deepEqual(env.calls, ["guard", "status", "guard", "easyeda_execute"]);
  const file = files[0]; assert.ok(file !== undefined); await writeFile(resolve(path, file.relativePath), "drift");
  const changed = runtime(path, reply(input)); await assert.rejects(readCurrentSchematicChildren(changed.engine, input, changed.expected), /implementation differs/u);
  assert.deepEqual(changed.calls, ["guard", "status"]);
});
