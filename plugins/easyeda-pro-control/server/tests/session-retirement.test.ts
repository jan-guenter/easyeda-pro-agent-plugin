/* oxlint-disable import/max-dependencies -- This focused regression joins the actual SDK transport, serialization gate and isolated process boundary with native-guard inspection. */
import assert from "node:assert/strict";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { join, resolve } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import vm from "node:vm";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";
import { parse } from "acorn";
import { installIndexFixtureDependencies } from "./helpers/index-fixture-dependencies.ts";
import { ForegroundSessionTransport } from "../../scripts/control-session-transport.ts";
import { SerializedGate } from "../src/engine.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { FacadeSessionRetirement, sessionRetiredCloseOutputSchema, sessionRetirementRequestSchema, validateSessionRetirementArguments } from "../src/session-retirement.ts";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";

/** Observe authority/lease cleanup order under a controllable quiescence boundary. */
function fixture(check: () => Promise<void> = (): Promise<void> => Promise.resolve(), failClose = false): {
  session: FacadeSessionRetirement; events: string[];
} {
  const events: string[] = [];
  const session = new FacadeSessionRetirement({ assertQuiescent: check,
    closeLiveAdmission: (): void => { events.push("admission-closed"); },
    authority: { close: (): Promise<void> => {
      events.push("authority-close"); return failClose ? Promise.reject(new Error("gateway close failed")) : Promise.resolve();
    } }, lease: { release: (): Promise<void> => { events.push("lease-release"); return Promise.resolve(); } } });
  return { session, events };
}

/** Start only the real index in this test's private control root. Missing
 * upstream/assets prevent the fixture from acquiring application authority. */
async function connectIsolatedIndex(root: string, context: TestContext, current209 = false): Promise<{ client: Client; transport: StdioClientTransport }> {
  const transport = new StdioClientTransport({ command: process.execPath, args: [resolve("server/src/index.ts")], stderr: "pipe",
    env: { EASYEDA_CONTROL_DATA_DIR: root, EASYEDA_UPSTREAM_ROOT: join(root, "absent-upstream"), EASYEDA_ASSETS_ROOT: join(root, "absent-assets"),
      ...(current209 ? { EASYEDA_PCB_BUNDLE_VERSION: "3.2.195.6b67774e", EASYEDA_PUBLIC_API_BUNDLE_VERSION: "0.3.59.1ca9efb5" } : {}) } });
  const client = new Client({ name: "source-reference-retirement-regression", version: "1.0.0" }, { capabilities: {} });
  context.after(async () => { await client.close(); }); await client.connect(transport, { timeout: 15_000 }); return { client, transport };
}

/** An unsupported future intent is preserved byte-for-byte. Reading its known
 * directory does not make this test claim any native owner or journal schema. */
async function futureDiagnosticJournal(root: string): Promise<{ path: string; bytes: Buffer }> {
  const directory = join(root, "pcb-diagnostic-lifecycle-v1", "footprint-copy-qualify-future-format");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const path = join(directory, "intent.json");
  const bytes = Buffer.from(`${JSON.stringify({
    schema: "easyeda-pro-control.pcb-diagnostic-launch-intent.future-v99", operationId: "footprint-copy-qualify-future-format",
    purpose: "future-native-purpose", createdAt: "2026-11-04T00:00:00.000Z", unknownFutureField: { retained: true },
  })}\n`);
  await writeFile(path, bytes, { flag: "wx", mode: 0o600 }); return { path, bytes };
}

void test("offline session discovery and validation use the mounted strict grammar without retirement authority", () => {
  const discovery = queryOfflineApi(apiRequestSchema.parse({ action: "session", query: { includeSchemas: true } })).result;
  assert.ok(typeof discovery === "object" && discovery !== null && "requestSchema" in discovery);
  for (const [request, valid] of [[{ action: "inspect" }, true], [{ action: "retire", confirmRetire: true }, true],
    [{ action: "retire", confirmRetire: false }, false], [{ action: "retire", confirmRetire: true, force: true }, false],
    [{ action: "close-retired", confirmCloseRetired: true }, true], [{ action: "close-retired", confirmCloseRetired: false }, false],
    [{ action: "close-retired", confirmCloseRetired: true, force: true }, false]] as const) {
    const result = queryOfflineApi(apiRequestSchema.parse({ action: "session-validate", query: { request } })).result;
    assert.ok(typeof result === "object" && result !== null && "valid" in result && "executionAuthorized" in result);
    assert.equal(result.valid, valid); assert.equal(result.executionAuthorized, false);
  }
  const oversized = { action: "retire", confirmRetire: true,
    ...Object.fromEntries(Array.from({ length: 500 }, (_unused, index) => [`unknown-field-${String(index)}`, true])) };
  const refusal = validateSessionRetirementArguments(oversized);
  assert.equal(refusal["valid"], false);
  assert.ok(JSON.stringify(refusal["issues"]).length <= 1024);
});

/** A strict metadata request whose missing managed history refuses locally.
 * No process collector, installation verifier or native owner can be reached. */
function historicalSourceInput(): { request: Record<string, unknown> } {
  return { request: { action: "footprint-forward-source-relinquishment", request: {
    action: "relinquish-unknown-source-opening", operationId: "footprint-forward-execution-retirement-missing-history",
    expectedManifestSha256: "a".repeat(64), expectedRosterSha256: "b".repeat(64), expectedIntentSha256: "c".repeat(64), expectedBindingSha256: "d".repeat(64),
    confirmRelinquishUnknownSourceOpening: true, acceptUnknownCaptureOutcome: true,
  } } };
}

void test("unused historical metadata classification is strict, monotonic and excludes a pending original callback", async () => {
  const { session } = fixture(), held = Promise.withResolvers<null>();
  const pending = session.run("easyeda_control_pcb209_worker_startup", () => held.promise, false, historicalSourceInput());
  assert.equal(session.isSourceReferenceOnly(), false); assert.equal(session.isUnusedSourceMetadataOnly(), false);
  await assert.rejects(session.retire(), /every admitted tool call/u);
  held.resolve(null); await pending; assert.equal(session.isUnusedSourceMetadataOnly(), true);
  for (const name of ["easyeda_control_calculate", "easyeda_control_discover", "easyeda_control_status", "easyeda_control_design"]) {
    const other = fixture().session;
    await other.run(name, () => "refused-without-allocation", false, historicalSourceInput());
    await other.run("easyeda_control_pcb209_worker_startup", () => "finished-metadata", false, historicalSourceInput());
    await other.run("easyeda_control_api", () => "static-reference", true);
    assert.equal(other.isUnusedSourceMetadataOnly(), false, name);
  }
  const malformed = fixture().session;
  await malformed.run("easyeda_control_pcb209_worker_startup", () => "unsupported", false,
    { ...historicalSourceInput(), callerRetirementAllowed: true });
  await malformed.run("easyeda_control_pcb209_worker_startup", () => "finished-metadata", false, historicalSourceInput());
  assert.equal(malformed.isUnusedSourceMetadataOnly(), false);
});

void test("actual default MCP callback retires a finished unused metadata facade without clearing a foreign journal", { timeout: 30_000 }, async context => {
  const root = await createTestTemporaryDirectory("easyeda-unused-source-metadata-retirement-");
  const journal = await futureDiagnosticJournal(root), { client } = await connectIsolatedIndex(root, context, true);
  for (const action of ["loaded-facade", "session", "loaded-facade"]) {
    const reference = await client.callTool({ name: "easyeda_control_api", arguments: { request: { action } } });
    assert.notEqual(reference.isError, true);
  }
  const refused = await client.callTool({ name: "easyeda_control_pcb209_worker_startup", arguments: historicalSourceInput() });
  assert.equal(refused.isError, true); assert.match(JSON.stringify(refused), /ENOENT|no such file/u);
  const inspected = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "inspect" } } });
  assert.match(JSON.stringify(inspected.structuredContent), /"activeCalls":0/u);
  const retired = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "retire", confirmRetire: true } } });
  assert.notEqual(retired.isError, true); assert.match(JSON.stringify(retired.structuredContent), /"state":"retired"/u);
  assert.deepEqual(await readFile(journal.path), journal.bytes);
  await assert.rejects(lstat(join(root, "facade.lock")), { code: "ENOENT" });
  for (const name of ["absent-upstream", "absent-assets"]) { await assert.rejects(lstat(join(root, name)), { code: "ENOENT" }); }
});

void test("actual default MCP callback history cannot regain unused retirement after refused status or upstream discovery", { timeout: 30_000 }, async context => {
  for (const call of [{ name: "easyeda_control_status", arguments: {} },
    { name: "easyeda_control_discover", arguments: { source: "live" } }]) {
    const root = await createTestTemporaryDirectory("easyeda-used-source-metadata-retirement-");
    const journal = await futureDiagnosticJournal(root), { client } = await connectIsolatedIndex(root, context, true);
    const metadata = await client.callTool({ name: "easyeda_control_pcb209_worker_startup", arguments: historicalSourceInput() });
    assert.equal(metadata.isError, true);
    const refused = await client.callTool(call); assert.equal(refused.isError, true);
    const lease = await readFile(join(root, "facade.lock"));
    await client.callTool({ name: "easyeda_control_api", arguments: { request: { action: "loaded-facade" } } });
    const retired = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "retire", confirmRetire: true } } });
    assert.equal(retired.isError, true, call.name);
    assert.deepEqual(await readFile(join(root, "facade.lock")), lease); assert.deepEqual(await readFile(journal.path), journal.bytes);
    await client.close();
  }
});

void test("retirement excludes active callbacks and work queued in the real bridge gate", async () => {
  const { session, events } = fixture(), gate = new SerializedGate(), held = Promise.withResolvers<null>();
  const first = session.run("easyeda_control_api", () => gate.run(() => held.promise));
  const second = session.run("queued-live-tool", () => gate.run(() => "queued-result"));
  assert.equal(session.inspect().activeCalls, 2);
  await assert.rejects(session.retire(), /queued work/u);
  assert.equal(session.inspect().state, "active"); assert.deepEqual(events, []);
  held.resolve(null); assert.deepEqual(await Promise.all([first, second]), [null, "queued-result"]);
  assert.equal(session.inspect().activeCalls, 0);
  await session.retire(); assert.deepEqual(events, ["admission-closed", "authority-close", "lease-release"]);
});

void test("source-reference tracking is private monotonic admission state and taints before a rejected callback awaits", async () => {
  const { session } = fixture();
  assert.equal(session.isSourceReferenceOnly(), true);
  assert.equal(await session.run("easyeda_control_session", () => "inspection"), "inspection");
  assert.equal(await session.run("easyeda_control_api", () => "static-schema", true), "static-schema");
  assert.equal(session.isSourceReferenceOnly(), true);
  const held = Promise.withResolvers<null>(); let entered = false;
  const rejected = session.run("easyeda_control_native_release", async () => {
    entered = true; assert.equal(session.isSourceReferenceOnly(), false); await held.promise; throw new Error("unsupported original native owner");
  }, true);
  assert.equal(entered, true); assert.equal(session.isSourceReferenceOnly(), false); assert.equal(session.inspect().activeCalls, 1);
  held.resolve(null); await assert.rejects(rejected, /unsupported original native owner/u);
  await session.run("easyeda_control_api", () => "later-static-reference", true);
  await session.run("easyeda_control_session", () => "later-inspection");
  assert.equal(session.isSourceReferenceOnly(), false);
  const second = fixture().session;
  assert.equal(second.isSourceReferenceOnly(), true);
  await assert.rejects(second.run("easyeda_control_api", () => Promise.reject(new Error("managed analysis refused"))), /managed analysis refused/u);
  assert.equal(second.isSourceReferenceOnly(), false);
  await second.run("easyeda_control_api", () => "static-reference", true);
  assert.equal(second.isSourceReferenceOnly(), false);
});

void test("retirement blocks arriving callbacks before journal await and preflight refusal permits original cleanup", async () => {
  const checking = Promise.withResolvers<null>(), held = Promise.withResolvers<null>();
  const { session, events } = fixture(async (): Promise<void> => { checking.resolve(null); await held.promise; throw new Error("unreadable journal"); });
  const retiring = session.retire(); await checking.promise;
  assert.equal(session.inspect().state, "checking"); let dispatched = false;
  await assert.rejects(session.run("late-native-abort", () => { dispatched = true; }), /closed live admission/u);
  await assert.rejects(session.retire(), /reserved or consumed/u);
  await assert.rejects(session.run("easyeda_control_api", () => "late-managed-request"), /closed live admission/u);
  held.resolve(null); await assert.rejects(retiring, /unreadable journal/u);
  assert.equal(dispatched, false); assert.deepEqual(events, []);
  assert.equal(await session.run("original-cleanup", () => "allowed"), "allowed");
});

void test("authority cleanup failure retains lease and permanently consumes live admission and retirement", async () => {
  const { session, events } = fixture(undefined, true);
  await assert.rejects(session.retire(), /ownership lease remains retained/u);
  assert.deepEqual(events, ["admission-closed", "authority-close"]);
  assert.equal(session.inspect().state, "retirement-failed"); assert.equal(session.inspect().leaseReleaseAcknowledged, false);
  await assert.rejects(session.retire(), /reserved or consumed/u);
  await assert.rejects(session.run("easyeda_control_status", () => "unsafe"), /closed live admission/u);
  assert.equal(await session.run("easyeda_control_api", () => "offline"), "offline");
});

void test("lease release failure reports no acknowledgement and consumes the attempt without claiming lock presence", async () => {
  let releases = 0;
  const session = new FacadeSessionRetirement({ assertQuiescent: (): Promise<void> => Promise.resolve(),
    closeLiveAdmission: (): void => {
      // No live authority is allocated in this fixed failure case.
    }, authority: { close: (): Promise<void> => Promise.resolve() },
    lease: { release: (): Promise<void> => { releases += 1; return Promise.reject(new Error("descriptor close uncertain")); } } });
  await assert.rejects(session.retire(), /lease release was not acknowledged; the lock state is uncertain/u);
  assert.equal(session.inspect().state, "retirement-failed"); assert.equal(session.inspect().leaseReleaseAcknowledged, false);
  await assert.rejects(session.retire(), /reserved or consumed/u); assert.equal(releases, 1);
});

void test("retirement keeps live admission closed throughout authority cleanup and after acknowledgement", async () => {
  const closed = Promise.withResolvers<null>(), closing = Promise.withResolvers<null>(); let released = false;
  const session = new FacadeSessionRetirement({ assertQuiescent: (): Promise<void> => Promise.resolve(),
    closeLiveAdmission: (): void => {
      // The session has already closed its outer admission.
    },
    authority: { close: async (): Promise<void> => { closing.resolve(null); await closed.promise; } },
    lease: { release: (): Promise<void> => { released = true; return Promise.resolve(); } } });
  const retiring = session.retire(); await closing.promise;
  assert.equal(released, false); await assert.rejects(session.run("live-tool", () => "unsafe"), /closed live admission/u);
  closed.resolve(null); const result = await retiring;
  assert.equal(result.state, "retired"); assert.equal(result.leaseReleaseAcknowledged, true); assert.equal(released, true);
  await assert.rejects(session.run("live-tool", () => "unsafe"), /closed live admission/u);
  assert.equal(sessionRetirementRequestSchema.safeParse({ action: "retire", confirmRetire: false }).success, false);
  assert.equal(sessionRetirementRequestSchema.safeParse({ action: "retire", confirmRetire: true, force: true }).success, false);
});

void test("retired close waits for metadata callbacks, schedules once and permanently refuses further work", async () => {
  let scheduled = 0;
  const session = new FacadeSessionRetirement({ assertQuiescent: (): Promise<void> => Promise.resolve(),
    closeLiveAdmission: (): void => {
      // This fixture has no live native admission to close.
    }, authority: { close: (): Promise<void> => Promise.resolve() }, lease: { release: (): Promise<void> => Promise.resolve() },
    scheduleRetiredClose: (): void => { scheduled += 1; } });
  assert.throws(() => session.closeRetired(), /acknowledged retirement/u);
  assert.equal(session.inspect().state, "active"); assert.equal(scheduled, 0);
  await session.retire();
  const held = Promise.withResolvers<null>();
  const metadata = session.run("easyeda_control_api", () => held.promise, true);
  assert.equal(session.inspect().activeCalls, 1);
  assert.throws(() => session.closeRetired(), /metadata callback/u);
  assert.equal(scheduled, 0);
  held.resolve(null); await metadata;
  assert.equal(session.inspect().activeCalls, 0);
  const result = sessionRetiredCloseOutputSchema.parse(session.closeRetired());
  assert.equal(result.closeScheduled, true); assert.equal(result.leaseReleaseAcknowledged, true);
  assert.equal(result.deliveryAcknowledged, false); assert.equal(result.processExitProved, false); assert.equal(result.retryAllowed, false);
  assert.equal(scheduled, 1);
  assert.throws(() => session.closeRetired(), /already consumed/u);
  let callbacks = 0;
  const metadataCallback = (): void => { callbacks += 1; };
  for (const name of ["easyeda_control_api", "easyeda_control_session", "easyeda_control_status"]) {
    await assert.rejects(session.run(name, metadataCallback, true), /consumed.*connection-close/u);
  }
  assert.equal(callbacks, 0); assert.equal(scheduled, 1);
});

void test("actual index native guard refuses every retained runtime and native reservation without cleanup calls", async () => {
  const source = stripTypeScriptTypes(await readFile(new URL("../src/index.ts", import.meta.url), "utf8"));
  const start = source.indexOf("function assertSessionRetirementNativeOwnersSettled(");
  const end = source.indexOf("\n}\n", start) + 2;
  assert.ok(start > 0 && end > start && end - start < 4000);
  const names = ["scheduledShutdown", "windowsRuntime", "ordinaryLaunchRuntime", "closedSymbolIndexReservation",
    "currentDisposableOpenCoordinator", "currentPcbRenameOperationCoordinator", "currentSchematicRenameOperationCoordinator"];
  const diagnostics = ["currentPcbDiagnosticLifecycle", "currentPcbStringPrecreateLifecycle", "currentPcbWorkerStartupLifecycle",
    "currentFootprintMainLifecycle", "currentFootprintHeldCacheValidation", "currentFootprintHeadAgeValidation"];
  const scope = vm.createContext(Object.fromEntries([...names, ...diagnostics].map(name => [name, undefined])));
  class SourceController {
    readonly #reserved: boolean;
    readonly #owned: boolean;
    public constructor(reserved: boolean, owned: boolean) { this.#reserved = reserved; this.#owned = owned; Object.freeze(this); }
    public hasActiveReservation(): boolean { return this.#reserved; }
    public hasOwnedAllocation(): boolean { return this.#owned; }
    public hasAttemptedNativeOwnerAllocation(): boolean { return this.#owned; }
  }
  scope["CurrentFootprintForwardSourceValidation"] = SourceController;
  scope["currentFootprintForwardSourceValidation"] = undefined;
  scope["closedSymbolUnreservedFailure"] = { observed: false };
  installIndexFixtureDependencies(scope, source);
  const custody = parse(source, { ecmaVersion: "latest", sourceType: "module" }).body.filter(row =>
    row.type === "VariableDeclaration" && row.declarations.some(item => item.id.type === "Identifier" && item.id.name === "forwardSourceCustodyMethods") ||
    row.type === "FunctionDeclaration" && row.id?.name === "hasForwardSourceCustody");
  assert.equal(custody.length, 2);
  for (const row of custody) { assert.ok(row.end - row.start < 2500); vm.runInContext(source.slice(row.start, row.end), scope); }
  vm.runInContext(source.slice(start, end), scope);
  const check = (): unknown => vm.runInContext("assertSessionRetirementNativeOwnersSettled()", scope);
  check();
  for (const name of names) {
    scope[name] = { isRuntimeDisposed: (): boolean => false };
    assert.throws(check, /completed native cleanup/u); scope[name] = undefined;
  }
  for (const name of ["currentDisposableOpenCoordinator", "currentPcbRenameOperationCoordinator", "currentSchematicRenameOperationCoordinator"]) {
    scope[name] = { isRuntimeDisposed: (): boolean => true }; check();
    scope["windowsRuntime"] = {}; assert.throws(check, /completed native cleanup/u);
    scope["windowsRuntime"] = undefined; scope[name] = undefined;
  }
  scope["closedSymbolIndexReservation"] = { entry: { isRuntimeDisposed: (): boolean => true } }; check();
  scope["closedSymbolIndexReservation"] = undefined;
  scope["closedSymbolUnreservedFailure"] = { observed: true }; assert.throws(check, /completed native cleanup/u);
  scope["closedSymbolUnreservedFailure"] = { observed: false };
  for (const name of diagnostics) {
    scope[name] = { hasActiveReservation: (): boolean => true };
    assert.throws(check, /every diagnostic reservation/u); scope[name] = undefined;
  }
  for (const name of ["currentFootprintHeldCacheValidation", "currentFootprintHeadAgeValidation"]) {
    scope[name] = { hasActiveReservation: (): boolean => false, hasOwnedAllocation: (): boolean => true };
    assert.throws(check, /every diagnostic reservation/u); scope[name] = undefined;
  }
  for (const [reserved, owned] of [[true, false], [false, true]] as const) {
    scope["currentFootprintForwardSourceValidation"] = new SourceController(reserved, owned);
    assert.throws(check, /every diagnostic reservation/u);
  }
  scope["currentFootprintForwardSourceValidation"] = new SourceController(false, false); check();
  const descriptor = Object.getOwnPropertyDescriptor(SourceController.prototype, "hasOwnedAllocation"); assert.ok(descriptor);
  let replacements = 0;
  Object.defineProperty(SourceController.prototype, "hasOwnedAllocation", { ...descriptor, value: (): boolean => { replacements += 1; return false; } });
  try { assert.throws(check, /custody observers changed/u); assert.equal(replacements, 0); }
  finally { Object.defineProperty(SourceController.prototype, "hasOwnedAllocation", descriptor); }
  scope["currentFootprintForwardSourceValidation"] = undefined;
  check();
});

void test("actual isolated MCP index retires, stays offline and permits a distinct fresh facade after acknowledgement", { timeout: 30_000 }, async context => {
  const root = await createTestTemporaryDirectory("easyeda-session-retirement-");
  const connect = async (): Promise<{ client: Client; transport: StdioClientTransport }> => {
    const transport = new StdioClientTransport({ command: process.execPath, args: [resolve("server/src/index.ts")], stderr: "pipe",
      env: { EASYEDA_CONTROL_DATA_DIR: root, EASYEDA_UPSTREAM_ROOT: join(root, "absent-upstream"), EASYEDA_ASSETS_ROOT: join(root, "absent-assets") } });
    const client = new Client({ name: "session-retirement-regression", version: "1.0.0" }, { capabilities: {} });
    context.after(async () => { await client.close(); }); await client.connect(transport, { timeout: 15_000 }); return { client, transport };
  };
  const first = await connect();
  const catalog = await first.client.listTools(); assert.ok(catalog.tools.some(tool => tool.name === "easyeda_control_session"));
  assert.ok(catalog.tools.some(tool => tool.name === "easyeda_control_native_release"));
  for (const requestArguments of [
    { request: { action: "release-completed", kind: "pcb-rename", operationId: "never-owned-operation", confirmReleaseOriginalRuntime: true } },
    { request: { action: "release-completed", kind: "project-opening", operationId: "never-owned-operation", confirmReleaseOriginalRuntime: true }, pid: 12_345 },
    { request: { action: "settle-release-records", kind: "symbol-copy", operationId: "never-owned-operation" } },
  ]) {
    const refusedRelease = await first.client.callTool({ name: "easyeda_control_native_release", arguments: requestArguments });
    assert.equal(refusedRelease.isError, true);
  }
  const catalogAfterRefusals = await first.client.listTools();
  assert.deepEqual(catalogAfterRefusals.tools.map(tool => tool.name), catalog.tools.map(tool => tool.name));
  const result = await first.client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "retire", confirmRetire: true } } });
  assert.notEqual(result.isError, true); assert.notEqual(result.structuredContent, undefined);
  assert.match(JSON.stringify(result.structuredContent), /"state":"retired"/u);
  await assert.rejects(lstat(join(root, "facade.lock")), { code: "ENOENT" });
  const offline = await first.client.callTool({ name: "easyeda_control_api", arguments: { request: { action: "loaded-facade" } } });
  assert.notEqual(offline.isError, true);
  const analysis = await first.client.callTool({ name: "easyeda_control_api", arguments: {
    request: { action: "baseline-analyze", query: { request: { operationId: "easyeda-retired-analysis" } } } } });
  assert.equal(analysis.isError, true); assert.match(JSON.stringify(analysis.structuredContent), /source\/reference API queries only/u);
  const refused = await first.client.callTool({ name: "easyeda_control_status", arguments: {} }); assert.equal(refused.isError, true);
  const next = await connect(); assert.notEqual(first.transport.pid, next.transport.pid);
  const freshCatalog = await next.client.listTools(); assert.ok(freshCatalog.tools.some(tool => tool.name === "easyeda_control_session"));
  const fresh = await next.client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "inspect" } } });
  assert.notEqual(fresh.isError, true); assert.match(JSON.stringify(fresh.structuredContent), /"state":"active"/u);
  await next.client.close();
});

void test("actual isolated SDK child refuses active close then closes once after acknowledged retirement with independent exit proof", { timeout: 30_000 }, async context => {
  const root = await createTestTemporaryDirectory("easyeda-retired-connection-close-");
  const transport = new ForegroundSessionTransport({ command: process.execPath, args: [resolve("server/src/index.ts")], cwd: resolve("."),
    env: { EASYEDA_CONTROL_DATA_DIR: root, EASYEDA_UPSTREAM_ROOT: join(root, "absent-upstream"), EASYEDA_ASSETS_ROOT: join(root, "absent-assets") } }, 10_000);
  const client = new Client({ name: "retired-connection-close-regression", version: "1.0.0" }, { capabilities: {} });
  context.after(async () => {
    // Teardown offers only EOF to this isolated unused child and never signals.
    // Independent closure must already be observed by the test body.
    if (transport.hasUnclosedChild()) { await transport.close(); await transport.awaitOwnedClosure(); }
    await client.close();
  });
  await client.connect(transport, { timeout: 15_000 });
  const pid = transport.pid; assert.ok(pid !== undefined);
  const lease = await readFile(join(root, "facade.lock"));
  const refused = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "close-retired", confirmCloseRetired: true } } });
  assert.equal(refused.isError, true); assert.equal(transport.inspectClosure(), null); assert.equal(transport.hasUnclosedChild(), true);
  assert.deepEqual(await readFile(join(root, "facade.lock")), lease);
  const inspected = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "inspect" } } });
  assert.notEqual(inspected.isError, true); assert.match(JSON.stringify(inspected.structuredContent), /"state":"active"/u);
  const retired = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "retire", confirmRetire: true } } });
  assert.notEqual(retired.isError, true); assert.match(JSON.stringify(retired.structuredContent), /"state":"retired"/u);
  assert.match(JSON.stringify(retired.structuredContent), /"leaseReleaseAcknowledged":true/u);
  await assert.rejects(lstat(join(root, "facade.lock")), { code: "ENOENT" });
  assert.equal(transport.hasUnclosedChild(), true);
  try {
    const closed = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "close-retired", confirmCloseRetired: true } } });
    assert.notEqual(closed.isError, true);
    const { result: scheduled } = z.strictObject({ result: sessionRetiredCloseOutputSchema }).parse(closed.structuredContent);
    assert.equal(scheduled.closeScheduled, true); assert.equal(scheduled.deliveryAcknowledged, false); assert.equal(scheduled.processExitProved, false);
  } catch (error) {
    // A closing transport can lose this final reply. It authorizes no retry.
    // Only the original child's independently observed close below can pass.
    assert.ok(error instanceof Error && "code" in error && error.code === -32_000);
  }
  const closure = await transport.awaitOwnedClosure();
  assert.deepEqual(closure, { pid, exitObserved: true, closeObserved: true, exitCode: 0, signal: null, stdinEof: false });
  assert.equal(transport.hasUnclosedChild(), false);
  await assert.rejects(lstat(`/proc/${String(pid)}`), { code: "ENOENT" });
  await assert.rejects(lstat(join(root, "facade.lock")), { code: "ENOENT" });
});

void test("actual isolated index retains its lease for unreadable design, ordinary or diagnostic journals after a refused non-reference call", { timeout: 30_000 }, async context => {
  for (const directory of ["operations", "ordinary-launch-v1", "pcb-diagnostic-lifecycle-v1"]) {
    const root = await createTestTemporaryDirectory("easyeda-session-journal-refusal-");
    await mkdir(join(root, directory), { mode: 0o700 });
    const journalPath = join(root, directory, "easyeda-unreadable-journal.json");
    await writeFile(journalPath, "{unreadable", { flag: "wx", mode: 0o600 });
    const transport = new StdioClientTransport({ command: process.execPath, args: [resolve("server/src/index.ts")], stderr: "pipe",
      env: { EASYEDA_CONTROL_DATA_DIR: root, EASYEDA_UPSTREAM_ROOT: join(root, "absent-upstream"), EASYEDA_ASSETS_ROOT: join(root, "absent-assets") } });
    const client = new Client({ name: "session-journal-regression", version: "1.0.0" }, { capabilities: {} });
    context.after(async () => { await client.close(); }); await client.connect(transport, { timeout: 15_000 });
    const nativeRelease = await client.callTool({ name: "easyeda_control_native_release", arguments: {
      request: { action: "release-completed", kind: "pcb-rename", operationId: "never-owned-operation", confirmReleaseOriginalRuntime: true },
    } });
    assert.equal(nativeRelease.isError, true);
    const lease = await readFile(join(root, "facade.lock"));
    const result = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "retire", confirmRetire: true } } });
    assert.equal(result.isError, true, directory); assert.deepEqual(await readFile(join(root, "facade.lock")), lease);
    const inspected = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "inspect" } } });
    assert.notEqual(inspected.isError, true); assert.match(JSON.stringify(inspected.structuredContent), /"state":"active"/u);
    assert.equal(await readFile(journalPath, "utf8"), "{unreadable");
    await client.close();
  }
});

void test("actual source-reference-only isolated index retires without interpreting an unknown future diagnostic journal", { timeout: 30_000 }, async context => {
  const root = await createTestTemporaryDirectory("easyeda-source-reference-retirement-");
  const journal = await futureDiagnosticJournal(root);
  const { client } = await connectIsolatedIndex(root, context);
  const catalog = await client.listTools();
  assert.ok(catalog.tools.some(tool => tool.name === "easyeda_control_session"));
  const requests = [
    { action: "loaded-facade" },
    { action: "session", query: { includeSchemas: true } },
    { action: "session-validate", query: { request: { action: "retire", confirmRetire: true } } },
    { action: "native-release", query: { includeSchemas: true } },
    { action: "native-release-validate", query: { request: {
      action: "release-completed", kind: "pcb-rename", operationId: "never-owned-operation", confirmReleaseOriginalRuntime: true,
    } } },
  ];
  for (const request of requests) {
    const result = await client.callTool({ name: "easyeda_control_api", arguments: { request } });
    assert.notEqual(result.isError, true, request.action);
  }
  const inspected = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "inspect" } } });
  assert.notEqual(inspected.isError, true); assert.match(JSON.stringify(inspected.structuredContent), /"state":"active"/u);
  const retired = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "retire", confirmRetire: true } } });
  assert.notEqual(retired.isError, true); assert.match(JSON.stringify(retired.structuredContent), /"state":"retired"/u);
  assert.match(JSON.stringify(retired.structuredContent), /"leaseReleaseAcknowledged":true/u);
  await assert.rejects(lstat(join(root, "facade.lock")), { code: "ENOENT" });
  assert.deepEqual(await readFile(journal.path), journal.bytes);
});

void test("a refused non-reference registered call keeps unknown future journal retirement blocked permanently", { timeout: 30_000 }, async context => {
  for (const call of [
    { name: "easyeda_control_native_release", arguments: { request: {
      action: "release-completed", kind: "pcb-rename", operationId: "never-owned-operation", confirmReleaseOriginalRuntime: true,
    } } },
    { name: "easyeda_control_api", arguments: { request: { action: "baseline-analyze", query: { request: { operationId: "easyeda-never-owned-analysis" } } } } },
  ]) {
    const root = await createTestTemporaryDirectory("easyeda-used-reference-retirement-");
    const journal = await futureDiagnosticJournal(root);
    const { client } = await connectIsolatedIndex(root, context);
    const lease = await readFile(join(root, "facade.lock"));
    const refused = await client.callTool(call); assert.equal(refused.isError, true, call.name);
    const laterReference = await client.callTool({ name: "easyeda_control_api", arguments: { request: { action: "loaded-facade" } } });
    assert.notEqual(laterReference.isError, true);
    const retired = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "retire", confirmRetire: true } } });
    assert.equal(retired.isError, true, call.name);
    assert.deepEqual(await readFile(join(root, "facade.lock")), lease);
    assert.deepEqual(await readFile(journal.path), journal.bytes);
    const inspected = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "inspect" } } });
    assert.notEqual(inspected.isError, true); assert.match(JSON.stringify(inspected.structuredContent), /"state":"active"/u);
    await client.close();
  }
});
