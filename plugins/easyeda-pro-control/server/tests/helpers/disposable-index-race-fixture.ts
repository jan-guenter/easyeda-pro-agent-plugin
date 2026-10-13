import assert from "node:assert/strict";
import childProcess from "node:child_process";
import type { ChildProcess, SpawnOptions } from "node:child_process";
import { lstat, mkdtemp, readFile, readdir, readlink, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename, join, resolve } from "node:path";
import type { TestContext } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
// eslint-disable-next-line import/max-dependencies -- Actual SDK child, original evidence, local validator and bounded I/O controls are the fixed integration dependencies.
import { isRecord, sha256Text } from "../../src/core.ts";
import { closedSymbolDisposableOutputSchema } from "../../src/closed-symbol-disposable-tool.ts";
import { requestData } from "./disposable-tool-data.ts";

export type Scenario = "ordinary-first" | "reservation-first" | "concurrent" | "configuration" | "shutdown";
type Response = Awaited<ReturnType<Client["callTool"]>>;
export type SettledCall = Readonly<{ ok: true; value: Response } | { ok: false; error: unknown }>;
export interface RaceFixture {
  readonly validation: () => Promise<Response>;
  readonly startValidation: () => Promise<SettledCall>;
  readonly ordinary: () => Promise<Response>;
  readonly startOrdinary: () => Promise<SettledCall>;
  readonly ordinaryTurn: () => Promise<void>;
  readonly release: () => Promise<void>;
  readonly changeConfiguration: () => Promise<void>;
  readonly shutdown: () => Promise<void>;
  readonly waitClosed: () => Promise<void>;
  readonly unchangedAndOffline: () => Promise<void>;
  readonly runtimeStatus: () => Promise<unknown>;
}
const plugin = resolve(import.meta.dirname, "../../..");
const tool = "easyeda_control_validate_closed_symbol";
const reservedMessage = "The Windows runtime is reserved by a consumed closed-symbol attempt.";
async function bounded<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // eslint-disable-next-line promise/avoid-new -- Bridge a bounded deadline timer without replacing the original operation.
    return await Promise.race([promise, new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => { reject(new Error("Owned race child did not settle within its bound.")); }, milliseconds);
    })]);
  } finally { if (timer !== undefined) { clearTimeout(timer); } }
}
function settle(promise: Promise<Response>): Promise<SettledCall> {
  // eslint-disable-next-line promise/prefer-await-to-callbacks -- Attach both settlement observers immediately, before shutdown may reject the original request.
  return promise.then(value => Object.freeze({ ok: true as const, value }), (error: unknown) => Object.freeze({ ok: false as const, error }));
}
export function fulfilled(outcome: SettledCall): Response {
  assert.equal(outcome.ok, true); return outcome.value;
}
export function strictResponse(response: Response): ReturnType<typeof closedSymbolDisposableOutputSchema.parse>["result"] {
  assert.equal(response.isError, true);
  const value = closedSymbolDisposableOutputSchema.parse(response.structuredContent);
  const content = response.content; assert.ok(Array.isArray(content));
  const first: unknown = content[0]; assert.ok(isRecord(first) && typeof first["text"] === "string");
  assert.deepEqual(JSON.parse(first["text"]), { ok: false, structuredContent: true,
    jsonBytes: Buffer.byteLength(JSON.stringify(value)), sha256: sha256Text(JSON.stringify(value)) });
  return value.result;
}
export function reservationRefused(response: Response): void {
  const result = strictResponse(response); assert.ok("attemptReserved" in result);
  assert.equal(result.attemptReserved, true); assert.equal(result.phase, "reservation"); assert.equal(result.reason, "attempt-unavailable");
  assert.equal(result.entryInvocationAttempted, false); assert.equal(result.entryReturnObserved, false); assert.equal(result.entryObservation, null);
}
export function admissionStopped(response: Response): void {
  const result = strictResponse(response);
  assert.equal(result.profile, "easyeda-pro-control.closed-symbol-disposable-result.v1");
  assert.ok(result.outcome === "stopped" && "claimState" in result);
  assert.equal(result.phase, "admission"); assert.equal(result.claimState, "not-attempted");
  assert.equal(result.operationId, null); assert.equal(result.claimArtifact, null); assert.equal(result.terminalArtifact, null);
  assert.equal(result.completionProved, false);
}
export function setupRefused(response: Response): void {
  const result = strictResponse(response); assert.ok("attemptReserved" in result);
  assert.equal(result.attemptReserved, true); assert.equal(result.phase, "facade"); assert.equal(result.reason, "setup-refused");
  assert.equal(result.entryInvocationAttempted, false); assert.equal(result.entryReturnObserved, false); assert.equal(result.entryObservation, null);
}
export function ordinaryRefused(response: Response): void {
  assert.equal(response.isError, true); assert.ok(Array.isArray(response.content));
  const first: unknown = response.content[0]; assert.ok(isRecord(first) && typeof first["text"] === "string");
  const data: unknown = JSON.parse(first["text"]); assert.ok(isRecord(data));
  assert.equal(data["ok"], false); const error = data["error"]; assert.ok(isRecord(error));
  assert.equal(error["name"], "Error"); assert.equal(error["message"], reservedMessage);
}
export function shutdownOutcome(outcome: SettledCall, kind: "ordinary" | "validation"): void {
  if (outcome.ok) { if (kind === "ordinary") { ordinaryRefused(outcome.value); } else { setupRefused(outcome.value); } return; }
  assert.ok(outcome.error instanceof McpError); assert.equal(outcome.error.code, ErrorCode.ConnectionClosed);
  assert.match(outcome.error.message, /Connection closed/u);
}
export async function raceFixture(context: TestContext, scenario: Scenario): Promise<RaceFixture> {
  assert.equal(process.versions.node, "24.18.0");
  const parentRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(parentRoot !== undefined && basename(parentRoot).startsWith(`easyeda-test-control-${String(process.pid)}-`));
  const reports = await mkdtemp(join(parentRoot, "index-race-"));
  const childPath = join(import.meta.dirname, "disposable-index-race-child.ts"), preload = join(plugin, "scripts/test-isolation.ts");
  const args = ["--import", preload, childPath, scenario];
  const originalSpawn = childProcess.spawn;
  let child: ChildProcess | undefined, processCalls = 0, stderr = "", stderrOverflow = false;
  let stdoutBytes = 0;
  let stdoutOverflow = false;
  let released = false;
  let shutdownSent = false;
  let closeObserved = false;
  const readiness: { original: Record<string, unknown> | undefined } = { original: undefined };
  let errorOverflow = false;
  const errors: Error[] = [];
  const { promise: closed, resolve: resolveClosed } = Promise.withResolvers<{ code: number | null; signal: NodeJS.Signals | null }>();
  context.mock.method(childProcess, "spawn", (command: string, parameters: readonly string[], options: SpawnOptions): ChildProcess => {
    assert.equal(command, process.execPath); assert.deepEqual(parameters, args); assert.equal(options.cwd, plugin);
    assert.equal(options.shell, false); assert.equal(processCalls, 0); processCalls += 1;
    const returned = originalSpawn(command, parameters, options); child = returned;
    returned.once("close", (code, signal) => { closeObserved = true; resolveClosed({ code, signal }); });
    assert.ok(returned.stdout !== null);
    returned.stdout.on("data", (chunk: Buffer) => { stdoutBytes += chunk.length; if (stdoutBytes > 1_048_576) { stdoutOverflow = true; } });
    return returned;
  });
  syncBuiltinESMExports();
  const transport = new StdioClientTransport({ command: process.execPath, args, cwd: plugin,
    env: { NODE_NO_WARNINGS: "1", EASYEDA_INDEX_TEST_REPORT_DIRECTORY: reports }, stderr: "pipe", maxBufferSize: 1_048_576 });
  transport.stderr?.on("data", (chunk: Buffer) => {
    if (Buffer.byteLength(stderr) + chunk.length > 32_768) { stderrOverflow = true; } else { stderr += chunk.toString("utf8"); }
  });
  const client = new Client({ name: "disposable-index-races", version: "1.0.0" }, { capabilities: {} });
  // eslint-disable-next-line unicorn/prefer-add-event-listener -- The actual SDK exposes this callback property, not EventTarget.
  client.onerror = (error): void => { if (errors.length === 8) { errorOverflow = true; } else { errors.push(error); } };
  async function readReport(name: string): Promise<Record<string, unknown>> {
    const deadline = performance.now() + 5000;
    while (true) {
      try {
        const path = join(reports, name);
        const info = await lstat(path);
        assert.ok(info.isFile() && !info.isSymbolicLink()); assert.equal(info.nlink, 1);
        // eslint-disable-next-line no-bitwise -- POSIX permission bits are the checked filesystem contract.
        assert.equal(info.mode & 0o777, 0o600); assert.equal(info.uid, process.getuid?.()); assert.ok(info.size <= 8192);
        const text = await readFile(path, "utf8"); assert.ok(Buffer.byteLength(text) <= 8192);
        const value: unknown = JSON.parse(text); assert.ok(isRecord(value)); return value;
      } catch (error) {
        if (!isRecord(error) || error["code"] !== "ENOENT") { throw error; }
        if (performance.now() >= deadline || closeObserved) { throw new Error(`Expected fixed race report ${name} was not observed.`, { cause: error }); }
        await delay(10);
      }
    }
  }
  async function release(): Promise<void> {
    if (released) { return; }
    await writeFile(join(reports, "release.json"), '{"release":true}', { flag: "wx", mode: 0o600 }); released = true;
  }
  async function journalUnchanged(): Promise<void> {
    const originalReady = readiness.original;
    assert.ok(originalReady !== undefined); const path = originalReady["journalPath"]; assert.ok(typeof path === "string");
    const journalPath = path;
    const bytes = await readFile(journalPath);
    const info = await lstat(journalPath);
    assert.equal(bytes.length, originalReady["journalBytes"]); assert.equal(sha256Text(bytes.toString("utf8")), originalReady["journalSha256"]);
    assert.equal(info.ino, originalReady["inode"]); assert.equal(info.dev, originalReady["device"]);
    assert.equal(info.mode, originalReady["mode"]); assert.equal(info.uid, originalReady["uid"]);
  }
  context.after(async () => {
    const cleanupErrors: unknown[] = [];
    try { await release(); } catch (error) { cleanupErrors.push(error); }
    try { await bounded(client.close(), 6000); } catch (error) { cleanupErrors.push(error); }
    try { await bounded(transport.close(), 6000); } catch (error) { cleanupErrors.push(error); }
    const outcome = await bounded(closed, 10_000);
    const exit = await readReport("child-exit.json");
    const diagnostic = { scenario, outcome, processCalls, stdoutBytes, stdoutOverflow, stderrOverflow,
      errorOverflow, errors: errors.map(error => ({ name: error.name, message: error.message.slice(0, 2048),
        truncated: error.message.length > 2048, code: error instanceof McpError ? error.code : null })),
      cleanupFailures: cleanupErrors.length, released, shutdownSent, exit };
    const text = JSON.stringify(diagnostic); assert.ok(Buffer.byteLength(text) <= 32_768);
    await writeFile(join(reports, "parent-diagnostic.json"), text, { flag: "wx", mode: 0o600 });
    assert.equal(outcome.code, 0); assert.equal(outcome.signal, null); assert.equal(processCalls, 1);
    assert.equal(stderrOverflow, false); assert.equal(stderr, ""); assert.equal(stdoutOverflow, false); assert.equal(errorOverflow, false);
    assert.ok(child !== undefined && child.exitCode === 0);
    for (const name of ["processAttempts", "networkAttempts", "windowsReadAttempts"] as const) { assert.equal(exit[name], 0); }
    for (const name of ["lifetimeExpired", "barrierExpired"] as const) { assert.equal(exit[name], false); }
    assert.equal(exit["fingerprintReads"], 1); assert.equal(exit["returnedOriginalBuffer"], true);
    assert.equal(exit["configurationChanges"], scenario === "configuration" ? 1 : 0);
    assert.equal(exit["shutdownObserved"], scenario === "shutdown");
    assert.equal(exit["ordinaryInputs"], scenario === "concurrent" ? 0 : 1);
    assert.equal(exit["ordinaryTurns"], scenario === "concurrent" ? 0 : 1);
    if (scenario === "shutdown") {
      for (const error of errors) { assert.ok(error instanceof McpError); assert.equal(error.code, ErrorCode.ConnectionClosed); }
    } else { assert.equal(errors.length, 0); }
    await journalUnchanged();
    if (cleanupErrors.length > 0) { throw new AggregateError(cleanupErrors, "Owned race child cleanup refused."); }
  });
  await client.connect(transport, { timeout: 20_000, maxTotalTimeout: 20_000 });
  const originalReady = await readReport("child-ready.json"); readiness.original = originalReady;
  const pid = transport.pid; assert.ok(pid !== null); assert.equal(originalReady["pid"], pid);
  const rootValue = originalReady["root"]; assert.ok(typeof rootValue === "string"); assert.notEqual(rootValue, parentRoot);
  const childRoot = rootValue;
  assert.deepEqual(await readReport("observer-ready.json"), { sdkListenerRetained: true, sdkFirst: true, dataListeners: 2, scenario });
  const held = await readReport("fingerprint-held.json"); assert.equal(held["reads"], 1);
  assert.equal(held["sourcePath"], join(plugin, "server/src/core.ts"));
  assert.equal(held["sourceSha256"], "80876233ce661602df0155a545ba0d5f656611d02fb3aacb94eae00107ba156d");
  const call = (name: string, input: Record<string, unknown>): Promise<Response> =>
    client.callTool({ name, arguments: input }, undefined, { timeout: 15_000, maxTotalTimeout: 15_000 });
  async function runtimeStatus(): Promise<unknown> {
    const response = await call("easyeda_control_runtime", { request: { action: "status" } });
    assert.notEqual(response.isError, true); assert.ok(isRecord(response.structuredContent)); return response.structuredContent["result"];
  }
  async function unchangedAndOffline(): Promise<void> {
    await journalUnchanged();
    const rootEntries = await readdir(childRoot);
    assert.deepEqual(rootEntries.toSorted(), ["facade.lock", "operations"]);
    assert.deepEqual(await readdir(join(childRoot, "operations")), ["easyeda-index-original-unfinished.json"]);
    const children = await readFile(`/proc/${String(pid)}/task/${String(pid)}/children`, "utf8");
    assert.equal(children.trim(), "");
    for (const fd of await readdir(`/proc/${String(pid)}/fd`)) {
      if (!["0", "1", "2"].includes(fd)) {
        let target: string | undefined;
        try { target = await readlink(`/proc/${String(pid)}/fd/${fd}`); }
        catch (error) { if (!isRecord(error) || error["code"] !== "ENOENT") { throw error; } }
        if (target !== undefined) { assert.equal(target.startsWith("socket:"), false); }
      }
    }
  }
  async function ordinaryTurn(): Promise<void> {
    const observed = await readReport("ordinary-input-turn.json");
    assert.equal(observed["sdkListenerRetained"], true); assert.equal(observed["sdkFirst"], true);
    assert.equal(observed["ordinaryInputs"], 1); assert.equal(observed["ordinaryTurns"], 1); assert.ok(Number.isSafeInteger(observed["requestId"]));
    assert.equal(observed["fingerprintHeld"], scenario !== "configuration");
  }
  async function changeConfiguration(): Promise<void> {
    assert.equal(scenario, "configuration");
    await writeFile(join(reports, "change-assets.json"), '{"changeAssets":true}', { flag: "wx", mode: 0o600 });
    assert.deepEqual(await readReport("configuration-changed.json"), { changed: true, changes: 1 });
  }
  async function shutdown(): Promise<void> {
    assert.equal(scenario, "shutdown"); assert.equal(shutdownSent, false); assert.ok(child !== undefined);
    assert.equal(child.exitCode, null); assert.equal(child.signalCode, null);
    shutdownSent = true; assert.equal(child.kill("SIGTERM"), true);
    assert.deepEqual(await readReport("shutdown-observed.json"), { originalListenerRegisteredFirst: true, shutdownObserved: true });
  }
  async function waitClosed(): Promise<void> {
    const outcome = await bounded(closed, 10_000); assert.equal(outcome.code, 0); assert.equal(outcome.signal, null);
  }
  const validation = (): Promise<Response> => call(tool, requestData());
  const ordinary = (): Promise<Response> => call("easyeda_control_runtime", { request: { action: "launch-contained", confirmLaunch: true } });
  await unchangedAndOffline(); assert.deepEqual(await runtimeStatus(), { state: "not-launched" });
  return { validation, startValidation: () => settle(validation()), ordinary, startOrdinary: () => settle(ordinary()),
    ordinaryTurn, release, changeConfiguration, shutdown, waitClosed, unchangedAndOffline, runtimeStatus };
}
