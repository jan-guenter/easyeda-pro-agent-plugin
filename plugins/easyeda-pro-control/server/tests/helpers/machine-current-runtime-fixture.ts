/** Real synthetic file descriptors; the version probe is intercepted, never spawned. */
import assert from "node:assert/strict";
import childProcess from "node:child_process";
import type { Stats } from "node:fs";
import fs from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { join } from "node:path";
import { promisify } from "node:util";
import type { TestContext } from "node:test";
import type { currentProcessSqlRuntime, openVerifiedMachineNode } from "../../src/machine-profile.ts";

interface Proposal {
  currentProcessSqlRuntime: typeof currentProcessSqlRuntime;
  openVerifiedMachineNode: typeof openVerifiedMachineNode;
}

const actual = { open: fs.open, lstat: fs.lstat, realpath: fs.realpath, readFile: fs.readFile,
  chmod: fs.chmod, writeFile: fs.writeFile };
type Label = "kernel" | "named";
export interface RuntimeFixtureState {
  namedPath: string;
  kernelPath: string;
  kernelReportedPath: string;
  namedReportedPath: string;
  stdout: string;
  stderr: string;
  probeError: Error | undefined;
  closeFailure: Label | "both" | undefined;
  beforeOpen: ((label: Label) => Promise<void>) | undefined;
  beforeClose: ((label: Label) => Promise<void>) | undefined;
  beforeProbe: ((count: number) => Promise<void>) | undefined;
  beforeStat: ((label: Label, count: number) => Promise<void>) | undefined;
  beforeRealpath: ((path: string, count: number) => Promise<void>) | undefined;
  limits: string;
  namedStatOverride: Stats | undefined;
}
export async function runtimeFixture(context: TestContext): Promise<{
  module: Proposal;
  state: RuntimeFixtureState;
  files: { original: string; sameBytes: string; differentBytes: string };
  reads: string[];
  probes: readonly unknown[][];
  opened: readonly { label: Label; handle: FileHandle }[];
  closed: Label[];
  rewrite: (path: string, bytes: string) => Promise<void>;
  chmod: (path: string, mode: number) => Promise<void>;
}> {
  const isolated = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(isolated !== undefined && isolated.includes("easyeda-test-control-"));
  const directory = await fs.mkdtemp(join(isolated, "current-runtime-"));
  const files = { original: join(directory, "original"), sameBytes: join(directory, "same-bytes"),
    differentBytes: join(directory, "different-bytes") };
  await fs.writeFile(files.original, "synthetic executable\n", { mode: 0o755 });
  await fs.writeFile(files.sameBytes, "synthetic executable\n", { mode: 0o755 });
  await fs.writeFile(files.differentBytes, "different executable\n", { mode: 0o755 });
  for (const path of Object.values(files)) { await fs.chmod(path, 0o755); }
  const state: RuntimeFixtureState = { namedPath: files.original, kernelPath: files.original,
    kernelReportedPath: process.execPath, namedReportedPath: process.execPath,
    stdout: "v24.18.0\n", stderr: "", probeError: undefined, closeFailure: undefined,
    beforeOpen: undefined, beforeClose: undefined, beforeProbe: undefined, beforeStat: undefined, beforeRealpath: undefined,
    limits: "Max core file size         0                    unlimited            bytes\n", namedStatOverride: undefined };
  const closed: Label[] = [], probes: unknown[][] = [], reads: string[] = [];
  const opened: { label: Label; handle: FileHandle }[] = [];
  const probe = async (...args: unknown[]): Promise<{ stdout: string; stderr: string }> => {
    probes.push(args);
    const named = opened.find((entry) => entry.label === "named");
    assert.ok(named);
    assert.deepEqual(args, [`/proc/${process.pid}/fd/${named.handle.fd}`, ["--version"],
      { env: { LANG: "C", LC_ALL: "C" }, timeout: 5000, maxBuffer: 1024 }]);
    assert.equal(opened.length, 2);
    assert.equal(closed.length, 0);
    await state.beforeProbe?.(probes.length);
    if (state.probeError !== undefined) { throw state.probeError; }
    return { stdout: state.stdout, stderr: state.stderr };
  };
  function callbackProbe(...args: unknown[]): Promise<{ stdout: string; stderr: string }> { return probe(...args); }
  Object.defineProperty(callbackProbe, promisify.custom, { value: probe });
  const execDescriptor = Object.getOwnPropertyDescriptor(childProcess, "execFile"); assert.ok(execDescriptor);
  Object.defineProperty(childProcess, "execFile", { ...execDescriptor, value: callbackProbe });
  // oxlint-disable-next-line typescript/strict-void-return -- As in production, promisify consumes execFile's callback contract; this assertion proves its test-only custom implementation.
  assert.equal(promisify(childProcess.execFile), probe);
  context.after((): void => { Object.defineProperty(childProcess, "execFile", execDescriptor); syncBuiltinESMExports(); });
  context.mock.method(fs, "readFile", (path: unknown): Promise<string> => {
    assert.equal(path, "/proc/self/limits"); reads.push(path); return Promise.resolve(state.limits);
  });
  context.mock.method(fs, "lstat", (path: unknown) => {
    assert.equal(path, process.execPath); reads.push(path); return actual.lstat(state.namedPath);
  });
  let realpaths = 0;
  context.mock.method(fs, "realpath", async (path: unknown) => {
    assert.ok(path === "/proc/self/exe" || path === process.execPath); reads.push(path);
    realpaths += 1; await state.beforeRealpath?.(path, realpaths);
    return path === "/proc/self/exe" ? state.kernelReportedPath : state.namedReportedPath;
  });
  context.mock.method(fs, "open", async (path: unknown, flags: number): Promise<FileHandle> => {
    assert.ok(path === "/proc/self/exe" || path === process.execPath); reads.push(path);
    const label: Label = path === "/proc/self/exe" ? "kernel" : "named";
    await state.beforeOpen?.(label);
    const handle = await actual.open(label === "kernel" ? state.kernelPath : state.namedPath, flags);
    const close = handle.close.bind(handle), stat = handle.stat.bind(handle);
    opened.push({ label, handle });
    let stats = 0;
    context.mock.method(handle, "stat", async () => {
      stats += 1; await state.beforeStat?.(label, stats);
      if (label === "named" && state.namedStatOverride !== undefined) { return state.namedStatOverride; }
      return stat();
    });
    let closeStarted = false;
    context.mock.method(handle, "close", async (): Promise<void> => {
      if (closeStarted) { await close(); return; }
      closeStarted = true;
      closed.push(label); await state.beforeClose?.(label); await close();
      if (state.closeFailure === label || state.closeFailure === "both") { throw new Error(`Synthetic ${label} close failure.`); }
    });
    return handle;
  });
  context.mock.method(fs, "readdir", (): never => { throw new Error("No profile or application directory scan permitted."); });
  syncBuiltinESMExports();
  context.after((): void => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  const url = new URL("../../src/machine-profile.ts", import.meta.url);
  url.searchParams.set("fixture", directory);
  // Each instance captures this test's fixed promisified probe, not any native executable.
  // oxlint-disable-next-line typescript/no-unsafe-assignment -- This fixed local proposal URL is cache-busted solely to bind each isolated test's intercepted execFile.
  const module: Proposal = await import(url.href);
  return { module, state, files, reads, probes, opened, closed,
    rewrite: (path, bytes) => actual.writeFile(path, bytes), chmod: actual.chmod };
}
