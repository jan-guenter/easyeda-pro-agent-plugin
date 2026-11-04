/* oxlint-disable import/max-dependencies -- This focused regression joins the actual SDK transport, serialization gate and isolated process boundary with native-guard inspection. */
import assert from "node:assert/strict";
import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { join, resolve } from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SerializedGate } from "../src/engine.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { FacadeSessionRetirement, sessionRetirementRequestSchema, validateSessionRetirementArguments } from "../src/session-retirement.ts";
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

void test("offline session discovery and validation use the mounted strict grammar without retirement authority", () => {
  const discovery = queryOfflineApi(apiRequestSchema.parse({ action: "session", query: { includeSchemas: true } })).result;
  assert.ok(typeof discovery === "object" && discovery !== null && "requestSchema" in discovery);
  for (const [request, valid] of [[{ action: "inspect" }, true], [{ action: "retire", confirmRetire: true }, true],
    [{ action: "retire", confirmRetire: false }, false], [{ action: "retire", confirmRetire: true, force: true }, false]] as const) {
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
  scope["closedSymbolUnreservedFailure"] = { observed: false };
  vm.runInContext(source.slice(start, end), scope);
  const check = (): unknown => vm.runInContext("assertSessionRetirementNativeOwnersSettled()", scope);
  check();
  for (const name of names) {
    scope[name] = {}; assert.throws(check, /completed native cleanup/u); scope[name] = undefined;
  }
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

void test("actual isolated index retains its lease for unreadable design, ordinary or diagnostic journals with no active call", { timeout: 30_000 }, async context => {
  for (const directory of ["operations", "ordinary-launch-v1", "pcb-diagnostic-lifecycle-v1"]) {
    const root = await createTestTemporaryDirectory("easyeda-session-journal-refusal-");
    await mkdir(join(root, directory), { mode: 0o700 });
    const journalPath = join(root, directory, "easyeda-unreadable-journal.json");
    await writeFile(journalPath, "{unreadable", { flag: "wx", mode: 0o600 });
    const transport = new StdioClientTransport({ command: process.execPath, args: [resolve("server/src/index.ts")], stderr: "pipe",
      env: { EASYEDA_CONTROL_DATA_DIR: root, EASYEDA_UPSTREAM_ROOT: join(root, "absent-upstream"), EASYEDA_ASSETS_ROOT: join(root, "absent-assets") } });
    const client = new Client({ name: "session-journal-regression", version: "1.0.0" }, { capabilities: {} });
    context.after(async () => { await client.close(); }); await client.connect(transport, { timeout: 15_000 });
    const lease = await readFile(join(root, "facade.lock"));
    const result = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "retire", confirmRetire: true } } });
    assert.equal(result.isError, true, directory); assert.deepEqual(await readFile(join(root, "facade.lock")), lease);
    const inspected = await client.callTool({ name: "easyeda_control_session", arguments: { request: { action: "inspect" } } });
    assert.notEqual(inspected.isError, true); assert.match(JSON.stringify(inspected.structuredContent), /"state":"active"/u);
    assert.equal(await readFile(journalPath, "utf8"), "{unreadable");
    await client.close();
  }
});
