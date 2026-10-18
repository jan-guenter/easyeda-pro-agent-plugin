/** Synthetic source admission and bridge only; never launches or reads live CAD. */
/* oxlint-disable import/max-dependencies -- Keep the real fixed-source verifier and original SCH SQL projection explicit in this boundary test. */
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
import { CURRENT_SCHEMATIC_RENAME_PREFLIGHT_TIMEOUT_MS } from "../src/current-schematic-rename-observation.ts";
import { CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES } from "../src/current-schematic-rename-preflight.ts";
import { buildCurrentSchematicRenamePreflightProgram } from "../src/current-schematic-rename-preflight-program.ts";
import { readCurrentSchematicRenamePreflight } from "../src/current-schematic-rename-preflight-runtime.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "../src/sdk-local-runtime.ts";
import { PAYLOAD, REQUEST, TARGET, encoded, schematicBaseline } from "./helpers/current-schematic-rename-observer-fixture.ts";

const implementation = CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION;
const syntheticFiles = [
  { ...implementation.ui, data: Buffer.from("synthetic SCH rename preflight UI") },
  ...[...implementation.files, CURRENT_PROJECT_ONLY_SCH_IMPLEMENTATION, CURRENT_SYMBOL_CLOCK_IMPLEMENTATION]
    .map((pin, index) => ({ relativePath: pin.relativePath, sha256: pin.sha256, data: Buffer.alloc(pin.bytes, index + 1) })),
].map(file => Object.assign(file, { syntheticSha256: crypto.createHash("sha256").update(file.data).digest("hex") }));

function fingerprint(assetsRoot: string): ExpectedFingerprint {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"], pinned = manifest.connectedRuntime;
  const bundles = SDK_LOCAL_RUNTIME_PROFILE.installedBundles;
  return {
    facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map(file => ({ path: `/opt/control/${file.relativePath}`,
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

/** Only private synthetic digests map to fixed pins. Real descriptor, path and
 * byte checks execute unchanged, including the notify WS clock dependency.
 */
function mockSyntheticDigests(context: TestContext, calls: string[], afterHash?: () => void): void {
  const createHash = crypto.createHash;
  context.mock.method(crypto, "createHash", (...args: Parameters<typeof createHash>): ReturnType<typeof createHash> => {
    const hash = createHash(...args), originalDigest = hash.digest.bind(hash);
    function digest(): Buffer;
    function digest(encoding: crypto.BinaryToTextEncoding): string;
    function digest(encoding?: crypto.BinaryToTextEncoding): Buffer | string {
      if (encoding === undefined) { return originalDigest(); }
      const actual = originalDigest(encoding), file = syntheticFiles.find(entry => entry.syntheticSha256 === actual);
      if (encoding === "hex" && file !== undefined) { calls.push(`hash:${file.relativePath}`); afterHash?.(); return file.sha256; }
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
  readonly changeFileBefore?: string;
}
async function runtime(reply: unknown = encoded(), options: RuntimeOptions = {}): Promise<{
  engine: Parameters<typeof readCurrentSchematicRenamePreflight>[0]; calls: string[]; expected: ExpectedFingerprint; changeScope: () => void;
}> {
  const isolatedRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(isolatedRoot !== undefined); assert.match(isolatedRoot, /easyeda-test-control-/u);
  const scratch = await mkdtemp(join(isolatedRoot, "schematic-rename-preflight-runtime-"));
  const assetsRoot = join(scratch, "assets");
  await mkdir(assetsRoot, { mode: 0o700 });
  for (const file of syntheticFiles) {
    const path = resolve(assetsRoot, file.relativePath);
    await mkdir(dirname(path), { recursive: true, mode: 0o700 }); await writeFile(path, file.data, { mode: 0o600 });
  }
  if (options.changeFileBefore !== undefined) { await writeFile(resolve(assetsRoot, options.changeFileBefore), "changed synthetic source"); }
  const calls: string[] = [], expected = fingerprint(assetsRoot); let guards = 0, statuses = 0;
  const scope = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1" as const, gatewayInstanceId: "g".repeat(43),
    sessionId: "s".repeat(43), sessionSequence: 1, begunAtEpochMs: 1000, leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) };
  const changeScope = (): void => { scope.sessionSequence += 1; };
  const upstream = {
    ...(options.scopeMissing === "reader" ? {} : { currentAuthenticatedBridgeDispatchBinding: (): typeof scope | undefined => options.scopeMissing === "binding" ? undefined : scope }),
    callTool: async (name: string, args?: Record<string, unknown>, timeoutMs?: number): Promise<unknown> => {
      calls.push(name); assert.equal(name, "easyeda_execute"); assert.ok(args);
      assert.deepEqual(Object.keys(args).toSorted(), ["code", "confirmWrite", "timeoutMs"]);
      assert.equal(args["code"], buildCurrentSchematicRenamePreflightProgram(REQUEST)); assert.equal(args["confirmWrite"], true);
      assert.equal(args["timeoutMs"], CURRENT_SCHEMATIC_RENAME_PREFLIGHT_TIMEOUT_MS + 5000); assert.equal(timeoutMs, CURRENT_SCHEMATIC_RENAME_PREFLIGHT_TIMEOUT_MS + 15_000);
      if (options.scopeDrift === "execute") { changeScope(); }
      if (options.changeFile !== undefined) { await writeFile(resolve(assetsRoot, options.changeFile), "changed synthetic source"); }
      return reply;
    },
  };
  return { calls, expected, changeScope, engine: { upstream,
    assertBridgeDispatchAllowed: (): Promise<true> => {
      calls.push("guard"); guards += 1;
      const phase = ["initial-guard", "pre-execute-guard", "post-execute-guard"][guards - 1]; assert.ok(phase !== undefined);
      if (options.scopeDrift === phase) { changeScope(); }
      return options.quarantineAt === guards ? Promise.reject(new Error("quarantined")) : Promise.resolve(true);
    },
    status: () => {
      calls.push("status"); statuses += 1; const observed = structuredClone(expected), phase = statuses === 1 ? "initial-status" : "final-status";
      if (options.scopeDrift === phase) { changeScope(); }
      if (options.replaceScopeReader === true && statuses === 1) { upstream.currentAuthenticatedBridgeDispatchBinding = (): typeof scope => scope; }
      if (options.fingerprintDrift === phase) { observed.installedBundles.assetsRoot = "/opt/another-assets"; }
      return Promise.resolve({ stableFingerprint: observed });
    },
  } };
}


void test("SCH runtime pins fixed sources around one exact observation and compares original complete SQL", async context => {
  const { before, metadata } = await schematicBaseline(), env = await runtime(); mockSyntheticDigests(context, env.calls);
  const hashes = syntheticFiles.map(file => `hash:${file.relativePath}`);
  const result = await readCurrentSchematicRenamePreflight(env.engine, { before, metadata }, env.expected);
  assert.deepEqual(env.calls, ["guard", "status", ...hashes, "guard", "easyeda_execute", ...hashes, "guard", "status"]);
  assert.deepEqual(result["target"], TARGET); assert.deepEqual(result["peers"], metadata.peers); assert.equal(result["writerAuthority"], false);
  assert.equal(result["schematicSubscriberCompletionVerified"], false); assert.equal(result["queueCompletionVerified"], false);
  const comparison = result["comparison"]; assert.ok(comparison !== null && typeof comparison === "object");
  assert.equal(Reflect.get(comparison, "sqlSha256"), before.logicalSha256); assert.equal(Reflect.get(comparison, "historicalMetadataMatched"), true);
  const admission = result["runtimeAdmission"]; assert.ok(admission !== null && typeof admission === "object");
  assert.equal(Reflect.get(admission, "scope"), "loaded-project-with-no-editor-tabs-schematic-container-rename-preflight-only");
  assert.equal(Reflect.get(admission, "liveValidation"), "not-recorded"); assert.equal(Reflect.get(admission, "workerIdentityVerified"), false);
  assert.ok(Object.isFrozen(result)); assert.ok(Buffer.byteLength(JSON.stringify(result)) < CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES);
  assert.equal(JSON.stringify(result).includes(env.expected.installedBundles.assetsRoot), false);
});
void test("SCH runtime refuses copied SQL identity, input accessors and unsupported fingerprints before dispatch", async () => {
  const { before, metadata } = await schematicBaseline(), env = await runtime(), input = { before, metadata }; let accessed = false;
  const get = (): never => { accessed = true; throw new Error("getter invoked"); };
  for (const invalid of [{ before: structuredClone(before), metadata }, { before, metadata: structuredClone(metadata) },
    { ...input, code: "caller-code" }, Object.defineProperty({ ...input }, "metadata", { get })]) {
    await assert.rejects(readCurrentSchematicRenamePreflight(env.engine, invalid, env.expected));
  }
  assert.equal(accessed, false); assert.deepEqual(env.calls, []);
  const wrong = structuredClone(env.expected); wrong.health.payload.easyeda_version = "3.2.207";
  await assert.rejects(readCurrentSchematicRenamePreflight(env.engine, input, wrong)); assert.deepEqual(env.calls, []);
});
void test("SCH runtime refuses proxied SQL inputs without traps or downstream calls", async () => {
  const { before, metadata } = await schematicBaseline(), env = await runtime(), input = { before, metadata };
  let traps = 0;
  const trap = (): never => { traps += 1; throw new Error("proxy trap invoked"); };
  const proxied = <T extends object>(value: T): T => new Proxy(value, {
    get: trap, getPrototypeOf: trap, ownKeys: trap, getOwnPropertyDescriptor: trap,
  });
  const revoked = Proxy.revocable(input, {}); revoked.revoke();
  for (const invalid of [proxied(input), revoked.proxy, { before: proxied(before), metadata }, { before, metadata: proxied(metadata) }]) {
    await assert.rejects(readCurrentSchematicRenamePreflight(env.engine, invalid, env.expected), /original own-data SQL metadata|original SQL metadata/u);
  }
  assert.equal(traps, 0); assert.deepEqual(env.calls, []);
});
void test("SCH runtime retains authenticated scope and method receivers at every awaited boundary", async context => {
  const { before, metadata } = await schematicBaseline(), input = { before, metadata }; mockSyntheticDigests(context, []);
  for (const scopeMissing of ["reader", "binding"] as const) {
    const env = await runtime(undefined, { scopeMissing });
    await assert.rejects(readCurrentSchematicRenamePreflight(env.engine, input, env.expected), /authenticated scope/u); assert.deepEqual(env.calls, []);
  }
  const replaced = await runtime(undefined, { replaceScopeReader: true });
  await assert.rejects(readCurrentSchematicRenamePreflight(replaced.engine, input, replaced.expected), /scope or retained receiver changed/u);
  for (const scopeDrift of ["initial-guard", "initial-status", "pre-execute-guard", "execute", "post-execute-guard", "final-status"] as const) {
    const env = await runtime(undefined, { scopeDrift });
    await assert.rejects(readCurrentSchematicRenamePreflight(env.engine, input, env.expected), /scope or retained receiver changed/u);
    assert.equal(env.calls.filter(call => call === "easyeda_execute").length, ["execute", "post-execute-guard", "final-status"].includes(scopeDrift) ? 1 : 0);
  }
  for (const member of ["upstream", "callTool", "assertBridgeDispatchAllowed", "status"]) {
    const env = await runtime(), originalStatus = env.engine.status;
    Reflect.set(env.engine, "status", async () => {
      const result = await originalStatus();
      if (member === "upstream") { Reflect.set(env.engine, member, { ...env.engine.upstream }); }
      else if (member === "callTool") { Reflect.set(env.engine.upstream, member, () => Promise.reject(new Error("replacement must never run"))); }
      else { Reflect.set(env.engine, member, () => Promise.reject(new Error("replacement must never run"))); }
      return result;
    });
    await assert.rejects(readCurrentSchematicRenamePreflight(env.engine, input, env.expected), /scope or retained receiver changed/u);
    assert.deepEqual(env.calls, ["guard", "status"]);
  }
});
void test("SCH runtime checks scope across both source-verification awaits", async context => {
  const { before, metadata } = await schematicBaseline(); let active: (() => void) | undefined;
  mockSyntheticDigests(context, [], () => { active?.(); });
  for (const phase of ["before", "after"]) {
    const env = await runtime(); let hashes = 0;
    active = (): void => { hashes += 1; if (hashes === (phase === "before" ? 1 : syntheticFiles.length + 1)) { env.changeScope(); } };
    await assert.rejects(readCurrentSchematicRenamePreflight(env.engine, { before, metadata }, env.expected), /scope or retained receiver changed/u);
    assert.equal(env.calls.filter(call => call === "easyeda_execute").length, phase === "before" ? 0 : 1); active = undefined;
  }
});
void test("SCH runtime stops quarantine, source drift and fingerprint drift without retry", async context => {
  const { before, metadata } = await schematicBaseline(), input = { before, metadata }; mockSyntheticDigests(context, []);
  for (const quarantineAt of [1, 2, 3]) {
    const env = await runtime(undefined, { quarantineAt });
    await assert.rejects(readCurrentSchematicRenamePreflight(env.engine, input, env.expected), /quarantined/u);
    assert.equal(env.calls.filter(call => call === "easyeda_execute").length, quarantineAt === 3 ? 1 : 0);
  }
  const missingClock = await runtime(undefined, { changeFileBefore: CURRENT_SYMBOL_CLOCK_IMPLEMENTATION.relativePath });
  await assert.rejects(readCurrentSchematicRenamePreflight(missingClock.engine, input, missingClock.expected), /implementation differs/u);
  assert.deepEqual(missingClock.calls, ["guard", "status"]);
  const workerFile = implementation.files[2]; assert.ok(workerFile !== undefined);
  const changedWorker = await runtime(undefined, { changeFile: workerFile.relativePath });
  await assert.rejects(readCurrentSchematicRenamePreflight(changedWorker.engine, input, changedWorker.expected), /implementation differs/u);
  assert.equal(changedWorker.calls.filter(call => call === "easyeda_execute").length, 1);
  for (const fingerprintDrift of ["initial-status", "final-status"] as const) {
    const env = await runtime(undefined, { fingerprintDrift });
    await assert.rejects(readCurrentSchematicRenamePreflight(env.engine, input, env.expected), /expected runtime|runtime changed/u);
    assert.equal(env.calls.filter(call => call === "easyeda_execute").length, fingerprintDrift === "initial-status" ? 0 : 1);
  }
});
void test("SCH runtime rejects observation or original-SQL mismatch after a single call", async context => {
  const { before, metadata } = await schematicBaseline(); mockSyntheticDigests(context, []);
  for (const value of [null, { ...PAYLOAD, desiredTitle: "Wrong title" }, { ...PAYLOAD, peers: PAYLOAD.peers.slice(0, 1) },
    { ...PAYLOAD, writerAuthority: true }, { ...PAYLOAD, clientTicketObservation: { ...PAYLOAD.clientTicketObservation, maxTicket: 101 } }]) {
    const env = await runtime(encoded(value));
    await assert.rejects(readCurrentSchematicRenamePreflight(env.engine, { before, metadata }, env.expected));
    assert.deepEqual(env.calls, ["guard", "status", "guard", "easyeda_execute"]);
  }
});

