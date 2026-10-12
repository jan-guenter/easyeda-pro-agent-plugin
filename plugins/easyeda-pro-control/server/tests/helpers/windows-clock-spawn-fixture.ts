/** Test-only native child streams; only fixed read-only Linux SQLite children may run. */
import assert from "node:assert/strict";
import childProcess from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { chmod, copyFile, mkdtemp, readFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { join } from "node:path";
import { PassThrough } from "node:stream";
import type { TestContext } from "node:test";
import { syntheticSqlRoot } from "./sqlite-inventory-fixture.ts";
import { syntheticSqlSpawn } from "./windows-clock-sql-spawn.ts";

type Bag = Record<string, unknown>;
const HELPER_SOURCE = new URL("../../../scripts/windows-authority.ps1", import.meta.url);
export const HELPER_SHA256 = "5a5095d463afcf8f595c3085ec7d5f377baa2e545b623bca81205137c602e608";
const CLOCK_TICKS = 639_274_896_000_000_000n, HELPER = "b".repeat(32);
type SyntheticChild = PassThrough & { stdin: PassThrough; stdout: PassThrough; stderr: PassThrough; exitCode: number | null; signalCode: null };
function isBag(value: unknown): value is Bag { return value !== null && typeof value === "object" && !Array.isArray(value); }
export interface ClockSpawnBehavior {
  clockMode: "observed" | "unavailable" | "malformed" | "missing";
  errorAction: string | undefined;
  mutateResponse: ((request: Readonly<Bag>, response: Bag) => void) | undefined;
}
export function syntheticClockSample(index = 0): Bag {
  const base = BigInt(index) * 1_000_000n;
  return { schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks: (CLOCK_TICKS + base * 10n).toString(),
    utcAfterTicks: (CLOCK_TICKS + base * 10n + 10_000n).toString(), qpcBefore: (10_000_000_000_000_000n + base).toString(),
    qpcAfter: (10_000_000_000_001_000n + base).toString(), qpcFrequency: "1000000", highResolution: true,
    localOffsetMinutes: 120, zoneRulesSha256: "f".repeat(64) };
}
export async function clockSpawnFixture(context: TestContext): Promise<{
  helperPath: string; requests: Bag[]; behavior: ClockSpawnBehavior; child: SyntheticChild;
  spawnCalls: () => number; closeCount: () => number;
  options: { helperPath: string; helperWindowsPath: string; powershellExecutable: string;
    expectedExecutable: string; expectedExecutableSha256: string; reviewedExecutionScopeSha256: string;
    performAuthenticatedProcessProbe: () => Promise<void> };
  restore: () => void;
}> {
  assert.match(process.env["EASYEDA_CONTROL_DATA_DIR"] ?? "", /easyeda-test-control-/u);
  const originalDistribution = process.env["WSL_DISTRO_NAME"];
  process.env["WSL_DISTRO_NAME"] = "ClockIssuerSynthetic";
  context.after((): void => {
    if (originalDistribution === undefined) { delete process.env["WSL_DISTRO_NAME"]; }
    else { process.env["WSL_DISTRO_NAME"] = originalDistribution; }
  });
  const directory = await mkdtemp(join(syntheticSqlRoot(), "clock-spawn-fixture-"));
  const helperPath = join(directory, "clock-helper.ps1");
  await copyFile(HELPER_SOURCE, helperPath, 1); await chmod(helperPath, 0o600);
  assert.equal(createHash("sha256").update(await readFile(helperPath)).digest("hex"), HELPER_SHA256);
  const behavior: ClockSpawnBehavior = { clockMode: "observed", errorAction: undefined, mutateResponse: undefined };
  const requests: Bag[] = [];
  const stderr = new PassThrough(), stdin = new PassThrough(), stdout = new PassThrough();
  const emitter = new PassThrough();
  const fake = Object.assign(emitter, { stdin, stdout, stderr, exitCode: null as number | null, signalCode: null });
  // Only the native child interface is emulated; issuer factories are unchanged.
  // The fixed read-only Linux SQLite delegate below may spawn.
  const child = fake;
  let clockIndex = 0, closes = 0, generation = 0, spawns = 0;
  let buffer = "", jobId = "";
  const distribution = process.env["WSL_DISTRO_NAME"];
  assert.ok(distribution !== undefined && /^[A-Za-z0-9._-]+$/u.test(distribution));
  const options = { helperPath, helperWindowsPath: `\\\\wsl.localhost\\${distribution}${helperPath.replaceAll("/", "\\")}`, powershellExecutable: "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe",
    expectedExecutable: "C:\\Synthetic\\easyeda-pro.exe", expectedExecutableSha256: "d".repeat(64), reviewedExecutionScopeSha256: "e".repeat(64),
    performAuthenticatedProcessProbe(): Promise<void> { return Promise.resolve(); } };
  function processes(probe: boolean): Bag[] {
    return [{ pid: 100, role: "easyeda-main", startIdentity: `win32:63924748600000000${generation}:job:${jobId}` },
      { pid: 101, role: probe ? "native-socket-owner" : "renderer", startIdentity: `win32:63924748610000000${generation}:job:${jobId}` }];
  }
  function response(request: Bag): Bag {
    const action = request["action"];
    if (action === "begin-probe") { return { schema: "easyeda-pro-control.windows-process-probe.v1", bindingSha256: request["bindingSha256"], port: 12_345, nonce: "0".repeat(64) }; }
    if (action === "end-probe") { return { closed: true, bindingSha256: request["bindingSha256"] }; }
    if (action === "release-capture") { return { released: true, captureBindingSha256: request["captureBindingSha256"], jobId, helperInstance: HELPER }; }
    if (action === "normal-close") { return { closeDispatched: true, jobId, saveOrDiscardSelected: false }; }
    let phase: "launch" | "capture" | "termination";
    let base: Bag;
    if (action === "clocked-launch") {
      generation += 1; jobId = generation.toString(16).padStart(32, "0"); phase = "launch";
      base = { jobId, helperInstance: HELPER, root: processes(false)[0] };
    } else if (action === "clocked-capture" || action === "clocked-finish-probe") {
      phase = "capture";
      const probe = action === "clocked-finish-probe";
      base = { bindingSha256: request["bindingSha256"], jobId, helperInstance: HELPER, capturedAt: "2026-10-12T12:00:00.0000000Z",
        processes: processes(probe), runtimePid: probe ? null : 101, socketOwnerPid: probe ? 101 : null };
    } else {
      assert.equal(action, "clocked-prove-terminated"); phase = "termination";
      base = { captureBindingSha256: request["captureBindingSha256"], jobId, helperInstance: HELPER,
        checkedAt: "2026-10-12T12:00:10.0000000Z", jobEmpty: true, retainedProcessesExited: true };
    }
    const value: Bag = { schema: `easyeda-pro-control.windows-clocked-${phase}.v1`, base };
    if (behavior.clockMode === "unavailable") { value["clock"] = { status: "unavailable", reason: "clock-sample" }; }
    else if (behavior.clockMode === "malformed") { value["clock"] = { status: "observed", before: null }; }
    else if (behavior.clockMode === "observed") {
      value["clock"] = { status: "observed", tzAbsentBefore: true, tzAbsentAfter: true,
        before: syntheticClockSample(clockIndex), after: syntheticClockSample(clockIndex + 1) }; clockIndex += 2;
    }
    return value;
  }
  stdin.setEncoding("utf8");
  stdin.on("data", (chunk: string) => {
    buffer += chunk;
    const newline = buffer.indexOf("\n");
    if (newline === -1) { return; }
    const line = buffer.slice(0, newline); buffer = buffer.slice(newline + 1);
    assert.equal(buffer.length, 0);
    const request: unknown = JSON.parse(line);
    assert.ok(isBag(request));
    const data = request; requests.push(structuredClone(data));
    queueMicrotask(() => {
      if (behavior.errorAction === data["action"]) { stdout.write(`${JSON.stringify({ id: data["id"], ok: false, error: "authority-synthetic-refusal" })}\n`); return; }
      const result = response(data); behavior.mutateResponse?.(data, result);
      stdout.write(`${JSON.stringify({ id: data["id"], ok: true, result })}\n`);
    });
  });
  stdin.once("finish", () => { queueMicrotask(() => { if (closes === 0) { closes += 1; fake.exitCode = 0; emitter.emit("close", 0, null); } }); });
  const originalSpawn = childProcess.spawn;
  context.mock.method(childProcess, "spawn", (executable: unknown, args: unknown, spawnOptions: unknown): SyntheticChild | ChildProcess => {
    const sqlChild = syntheticSqlSpawn(executable, args, spawnOptions, originalSpawn);
    if (sqlChild !== undefined) { return sqlChild; }
    assert.equal(executable, options.powershellExecutable);
    assert.deepEqual(args, ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", options.helperWindowsPath]);
    assert.deepEqual(spawnOptions, { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    spawns += 1; assert.equal(spawns, 1); return child;
  });
  syncBuiltinESMExports();
  return { helperPath, requests, behavior, child, options, spawnCalls: () => spawns, closeCount: () => closes,
    restore(): void { context.mock.restoreAll(); syncBuiltinESMExports(); } };
}
