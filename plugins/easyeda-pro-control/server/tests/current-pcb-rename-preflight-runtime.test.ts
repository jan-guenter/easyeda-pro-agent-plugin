/** Synthetic fixed-source and bridge observations only. No live CAD reads. */
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
import { readCurrentPcbRenamePreflight } from "../src/current-pcb-rename-preflight-runtime.ts";
import { buildCurrentPcbRenamePreflightProgram } from "../src/current-pcb-rename-preflight-program.ts";
// oxlint-disable-next-line import/max-dependencies -- Exercise the complete source admission and real offline route without a fixture that conceals the dependency boundary.
import { CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES, CURRENT_PCB_RENAME_PREFLIGHT_TIMEOUT_MS } from "../src/current-pcb-rename-preflight.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "../src/sdk-local-runtime.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), pcbUuid: "c".repeat(16), ownerUuid: "d".repeat(32) };
const before = { title: "Original PCB", displayTitle: "Original PCB", parentUuid: "", source: "", version: "123", boardUuid: "", ticket: 2, updateTime: 123, docType: 3 };
const request = { target, expectedBefore: before, desiredTitle: "Renamed PCB" };
const payload = { ok: true, kind: "current-pcb-rename-preflight", ...request, samples: 2, currentTabId: "0",
  peers: [{ uuid: target.pcbUuid, ...before }], nativeNameAvailableObserved: true, completeNativePcbMapObserved: true, expectedBeforeMatched: true,
  noEditorTabsObserved: true, hiddenEditorsAbsentObserved: true, dirtyTabsAbsentObserved: true, cachedProjectReadOnlyAbsentObserved: true,
  concurrentStrictModeAbsentObserved: true, clientTicketObservation: { client: "e".repeat(16), maxTicket: 2, samples: 4 },
  runtimeObservation: { editorVersion: "3.2.206", actor: { uuid: target.ownerUuid, username: "synthetic-user", nickname: "Synthetic" },
    clockSamples: [0, 1, 2, 3].map(index => ({ rendererBeforeMs: 1000 + index * 3, serverTimeMs: 1001 + index * 3, rendererAfterMs: 1002 + index * 3 })),
    backendActorVerified: false, backendClockVerified: false, clockProducerOwnershipVerified: false },
  permissionVerified: false, backendActorVerified: false, backendClockVerified: false, startupQualified: false, workerIdentityVerified: false,
  producerBindingVerified: false, sourceMembershipVerified: false, persistenceVerified: false, writerAuthority: false,
  executionAuthorized: false, mutationDispatched: false, explicitSaveDispatched: false };
const implementation = CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION;
const syntheticFiles = [
  { ...implementation.ui, data: Buffer.from("synthetic PCB rename preflight UI") },
  ...[...implementation.files, CURRENT_PROJECT_ONLY_SCH_IMPLEMENTATION, CURRENT_SYMBOL_CLOCK_IMPLEMENTATION]
    .map((pin, index) => ({ relativePath: pin.relativePath, sha256: pin.sha256, data: Buffer.alloc(pin.bytes, index + 1) })),
].map(file => Object.assign(file, { syntheticSha256: crypto.createHash("sha256").update(file.data).digest("hex") }));

function encoded(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: encodeExactReadEnvelope(value) } }; }
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
async function runtime(reply: unknown = encoded(payload), options: RuntimeOptions = {}): Promise<{
  engine: Parameters<typeof readCurrentPcbRenamePreflight>[0]; calls: string[]; expected: ExpectedFingerprint; changeScope: () => void;
}> {
  const isolatedRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(isolatedRoot !== undefined); assert.match(isolatedRoot, /easyeda-test-control-/u);
  const scratch = await mkdtemp(join(isolatedRoot, "pcb-rename-preflight-runtime-"));
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
      assert.equal(args["code"], buildCurrentPcbRenamePreflightProgram(request)); assert.equal(args["confirmWrite"], true);
      assert.equal(args["timeoutMs"], CURRENT_PCB_RENAME_PREFLIGHT_TIMEOUT_MS + 5000); assert.equal(timeoutMs, CURRENT_PCB_RENAME_PREFLIGHT_TIMEOUT_MS + 15_000);
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

void test("PCB rename preflight pins every source including notify WS around one exact bounded read", async context => {
  const fixture = await runtime(); mockSyntheticDigests(context, fixture.calls);
  const hashes = syntheticFiles.map(file => `hash:${file.relativePath}`), result = await readCurrentPcbRenamePreflight(fixture.engine, request, fixture.expected);
  assert.deepEqual(fixture.calls, ["guard", "status", ...hashes, "guard", "easyeda_execute", ...hashes, "guard", "status"]);
  assert.equal(hashes.includes(`hash:${CURRENT_SYMBOL_CLOCK_IMPLEMENTATION.relativePath}`), true);
  assert.deepEqual(result["target"], target); assert.deepEqual(result["peers"], payload.peers); assert.equal(result["desiredTitle"], request.desiredTitle);
  for (const key of ["permissionVerified", "backendActorVerified", "backendClockVerified", "startupQualified", "workerIdentityVerified",
    "producerBindingVerified", "sourceMembershipVerified", "persistenceVerified", "writerAuthority", "executionAuthorized", "mutationDispatched", "explicitSaveDispatched"]) {
    assert.equal(result[key], false);
  }
  const admission = result["runtimeAdmission"]; assert.ok(admission !== null && typeof admission === "object");
  assert.equal(Reflect.get(admission, "scope"), "loaded-project-with-no-editor-tabs-pcb-rename-preflight-only");
  assert.equal(Reflect.get(admission, "beforeAndAfterChecked"), true); assert.equal(Reflect.get(admission, "liveValidation"), "not-recorded");
  for (const key of ["workerIdentityVerified", "designExecutionAuthorized", "persistenceVerified"]) { assert.equal(Reflect.get(admission, key), false); }
  assert.match(String(result["observationSha256"]), /^[a-f0-9]{64}$/u); assert.ok(Buffer.byteLength(JSON.stringify(result)) < CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES);
  assert.equal(JSON.stringify(result).includes(fixture.expected.installedBundles.assetsRoot), false);
});

void test("PCB rename preflight malformed inputs or unsupported expected runtime never dispatch", async () => {
  const fixture = await runtime(); let invoked = false;
  const accessor = Object.defineProperty({ ...request }, "desiredTitle", { get(): string { invoked = true; return request.desiredTitle; } });
  for (const invalid of [{ ...request, method: "eda.dmt_Pcb.modifyPcbName" }, { ...request, target: { ...target, pcbUuid: "wrong" } },
    { ...request, desiredTitle: before.displayTitle }, { ...request, expectedBefore: { ...before, source: "inherited" } }, accessor]) {
    await assert.rejects(readCurrentPcbRenamePreflight(fixture.engine, invalid, fixture.expected));
  }
  assert.equal(invoked, false); assert.deepEqual(fixture.calls, []);
  const wrong = structuredClone(fixture.expected); wrong.health.payload.easyeda_version = "3.2.207";
  await assert.rejects(readCurrentPcbRenamePreflight(fixture.engine, request, wrong)); assert.deepEqual(fixture.calls, []);
});

void test("PCB rename preflight retains the authenticated reader and scope at every async boundary", async context => {
  mockSyntheticDigests(context, []);
  for (const scopeMissing of ["reader", "binding"] as const) {
    const fixture = await runtime(undefined, { scopeMissing });
    await assert.rejects(readCurrentPcbRenamePreflight(fixture.engine, request, fixture.expected), /authenticated scope/u); assert.deepEqual(fixture.calls, []);
  }
  const replaced = await runtime(undefined, { replaceScopeReader: true });
  await assert.rejects(readCurrentPcbRenamePreflight(replaced.engine, request, replaced.expected), /scope changed/u); assert.deepEqual(replaced.calls, ["guard", "status"]);
  for (const scopeDrift of ["initial-guard", "initial-status", "pre-execute-guard", "execute", "post-execute-guard", "final-status"] as const) {
    const fixture = await runtime(undefined, { scopeDrift });
    await assert.rejects(readCurrentPcbRenamePreflight(fixture.engine, request, fixture.expected), /scope changed/u);
    assert.equal(fixture.calls.filter(call => call === "easyeda_execute").length, ["execute", "post-execute-guard", "final-status"].includes(scopeDrift) ? 1 : 0);
  }
});

for (const sourcePhase of ["before", "after"] as const) {
  void test(`PCB rename preflight refuses a session change during ${sourcePhase} source verification`, async context => {
    const fixture = await runtime(); let hashes = 0;
    mockSyntheticDigests(context, [], () => { hashes += 1; if (hashes === (sourcePhase === "before" ? 1 : syntheticFiles.length + 1)) { fixture.changeScope(); } });
    await assert.rejects(readCurrentPcbRenamePreflight(fixture.engine, request, fixture.expected), /scope changed/u);
    assert.equal(fixture.calls.filter(call => call === "easyeda_execute").length, sourcePhase === "before" ? 0 : 1);
  });
}

void test("PCB rename preflight quarantine stops dispatch or publication without retry", async context => {
  mockSyntheticDigests(context, []);
  for (const quarantineAt of [1, 2, 3]) {
    const fixture = await runtime(undefined, { quarantineAt });
    await assert.rejects(readCurrentPcbRenamePreflight(fixture.engine, request, fixture.expected), /quarantined/u);
    assert.equal(fixture.calls.filter(call => call === "easyeda_execute").length, quarantineAt === 3 ? 1 : 0);
    assert.equal(fixture.calls.filter(call => call === "guard").length, quarantineAt);
  }
});

void test("PCB rename preflight requires the notify WS source before dispatch and every source after dispatch", async context => {
  mockSyntheticDigests(context, []);
  const missingClock = await runtime(undefined, { changeFileBefore: CURRENT_SYMBOL_CLOCK_IMPLEMENTATION.relativePath });
  await assert.rejects(readCurrentPcbRenamePreflight(missingClock.engine, request, missingClock.expected), /implementation differs/u);
  assert.deepEqual(missingClock.calls, ["guard", "status"]);
  for (const file of syntheticFiles) {
    const fixture = await runtime(undefined, { changeFile: file.relativePath });
    await assert.rejects(readCurrentPcbRenamePreflight(fixture.engine, request, fixture.expected), /implementation differs/u);
    assert.equal(fixture.calls.filter(call => call === "easyeda_execute").length, 1);
  }
  for (const fingerprintDrift of ["initial-status", "final-status"] as const) {
    const fixture = await runtime(undefined, { fingerprintDrift });
    await assert.rejects(readCurrentPcbRenamePreflight(fixture.engine, request, fixture.expected), /expected runtime|runtime changed/u);
    assert.equal(fixture.calls.filter(call => call === "easyeda_execute").length, fingerprintDrift === "initial-status" ? 0 : 1);
  }
});

void test("PCB rename preflight rejects malformed, mismatched, oversized or authority-inventing replies", async context => {
  mockSyntheticDigests(context, []);
  for (const value of [null, { ...payload, target: { ...target, branchUuid: "f".repeat(32) } }, { ...payload, desiredTitle: "Wrong title" },
    { ...payload, peers: [...payload.peers, ...payload.peers] }, { ...payload, writerAuthority: true }, { ...payload, noEditorTabsObserved: false },
    { ...payload, unexpected: "x".repeat(CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES) }]) {
    const fixture = await runtime(encoded(value));
    await assert.rejects(readCurrentPcbRenamePreflight(fixture.engine, request, fixture.expected));
    assert.deepEqual(fixture.calls, ["guard", "status", "guard", "easyeda_execute"]);
  }
});

void test("PCB rename preflight offline schemas and argument checks grant no execution authority", () => {
  const query = queryOfflineApi(apiRequestSchema.parse({ action: "project-pcb-preflight", query: { includeSchemas: true } }));
  assert.equal(query.offline, true); assert.ok(query.result !== null && typeof query.result === "object");
  assert.equal(Reflect.get(query.result, "invocationEnabledByDiscovery"), false); assert.equal(Reflect.get(query.result, "total"), 1);
  const entries: unknown = Reflect.get(query.result, "entries"); assert.ok(Array.isArray(entries) && entries.length === 1);
  const entry: unknown = entries[0]; assert.ok(entry !== null && typeof entry === "object");
  for (const key of ["inputSchema", "resultSchema"]) {
    const schema: unknown = Reflect.get(entry, key); assert.ok(schema !== null && typeof schema === "object");
    assert.equal(Reflect.get(schema, "additionalProperties"), false);
  }
  for (const candidate of [request, { ...request, target: { ...target, pcbUuid: "wrong" } }, { ...request, desiredTitle: before.displayTitle }, { ...request, code: "caller-code" }]) {
    const validation = queryOfflineApi(apiRequestSchema.parse({ action: "project-pcb-preflight-validate", query: { request: candidate } }));
    assert.equal(validation.offline, true); assert.ok(validation.result !== null && typeof validation.result === "object");
    assert.equal(Reflect.get(validation.result, "valid"), candidate === request); assert.equal(Reflect.get(validation.result, "executionAuthorized"), false);
  }
  assert.throws(() => apiRequestSchema.parse({ action: "project-pcb-preflight", query: { method: "eda.dmt_Pcb.modifyPcbName" } }));
});
