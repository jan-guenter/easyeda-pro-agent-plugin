/** Fixed synthetic child; the maintained isolation preload must run first. */
/* eslint-disable node/no-top-level-await -- This fixed ESM bootstrap installs traps and seeds original evidence before importing the actual index. */
import assert from "node:assert/strict";
import childProcess from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import net from "node:net";
import { basename, dirname, join, resolve } from "node:path";
import { mock } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
// eslint-disable-next-line import/max-dependencies -- Fixed child isolation, evidence, source delay and passive input observation require these builtin APIs.
import { fileURLToPath } from "node:url";

const plugin = resolve(import.meta.dirname, "../../..");
const sourcePath = join(plugin, "server/src/core.ts");
const expectedSourceHash = "80876233ce661602df0155a545ba0d5f656611d02fb3aacb94eae00107ba156d";
const scenario = process.argv[2];
assert.ok(["ordinary-first", "reservation-first", "concurrent", "configuration", "shutdown"].includes(scenario ?? ""));
assert.equal(process.argv.length, 3); assert.equal(process.versions.node, "24.18.0");
const root = process.env["EASYEDA_CONTROL_DATA_DIR"];
assert.ok(root !== undefined && dirname(root) === "/tmp" && basename(root).startsWith(`easyeda-test-control-${String(process.pid)}-`));
assert.equal(process.env["EASYEDA_BRIDGE_TOKEN_FILE"], join(root, "bridge-token"));
assert.equal(process.env["EASYEDA_UPSTREAM_DATA_DIR"], join(root, "upstream"));
const reports = process.env["EASYEDA_INDEX_TEST_REPORT_DIRECTORY"];
assert.ok(reports !== undefined && dirname(dirname(reports)) === "/tmp" &&
  basename(dirname(reports)).startsWith("easyeda-test-control-") && basename(reports).startsWith("index-race-"));
const reportDirectory = reports;
const reportInfo = await fsPromises.lstat(reportDirectory);
assert.ok(reportInfo.isDirectory() && !reportInfo.isSymbolicLink());
// eslint-disable-next-line no-bitwise -- POSIX permission bits are the checked filesystem contract.
assert.equal(reportInfo.mode & 0o777, 0o700); assert.equal(reportInfo.uid, process.getuid?.());
const realReadFile = fsPromises.readFile;
const realLstat = fsPromises.lstat;
const realWrite = fs.writeFileSync;
const sourceBefore = await realReadFile(sourcePath);
const sourceInfo = await realLstat(sourcePath);
const sha = (value: Buffer): string => createHash("sha256").update(value).digest("hex");
assert.equal(sha(sourceBefore), expectedSourceHash);
const counts = { processAttempts: 0, networkAttempts: 0, windowsReadAttempts: 0, lifetimeExpired: false,
  fingerprintReads: 0, returnedOriginalBuffer: false, barrierExpired: false, ordinaryInputs: 0,
  ordinaryTurns: 0, inputBytes: 0, configurationChanges: 0, shutdownObserved: false };
function report(name: string, value: Record<string, unknown>): void {
  const text = JSON.stringify(value); assert.ok(Buffer.byteLength(text) <= 8192);
  realWrite(join(reportDirectory, name), text, { flag: "wx", mode: 0o600 });
}
const lifetime = setTimeout(() => {
  counts.lifetimeExpired = true;
  const force = setTimeout(() => { process.kill(process.pid, "SIGKILL"); }, 5000);
  force.unref(); process.kill(process.pid, "SIGTERM");
}, 45_000);
lifetime.unref();
process.once("exit", code => {
  clearTimeout(lifetime);
  report("child-exit.json", { code, pid: process.pid, root, scenario, ...counts });
});
for (const name of ["spawn", "spawnSync", "exec", "execSync", "execFile", "execFileSync", "fork"] as const) {
  mock.method(childProcess, name, (): never => { counts.processAttempts += 1; throw new Error("Race child refused process boundary."); });
}
mock.method(net.Server.prototype, "listen", (): never => { counts.networkAttempts += 1; throw new Error("Race child refused listen boundary."); });
mock.method(net.Socket.prototype, "connect", (): never => { counts.networkAttempts += 1; throw new Error("Race child refused connect boundary."); });
// These are the listed path APIs, not a universal fd/Buffer/stream/native sandbox.
function forbidWindows(value: unknown): void {
  const path = value instanceof URL ? fileURLToPath(value) : value;
  if (typeof path === "string" && (path.startsWith("/mnt/") || /^[A-Za-z]:[\\/]/u.test(path))) {
    counts.windowsReadAttempts += 1; throw new Error("Race child refused Windows path boundary.");
  }
}
for (const name of ["open", "readFile", "stat", "lstat", "readdir", "realpath", "access"] as const) {
  const original = fsPromises[name];
  mock.method(fsPromises, name, (...args: unknown[]): unknown => { forbidWindows(args[0]); return Reflect.apply(original, fsPromises, args); });
}
for (const name of ["openSync", "readFileSync", "statSync", "lstatSync", "readdirSync", "realpathSync", "accessSync"] as const) {
  const original = fs[name];
  mock.method(fs, name, (...args: unknown[]): unknown => { forbidWindows(args[0]); return Reflect.apply(original, fs, args); });
}
syncBuiltinESMExports();
process.env["EASYEDA_UPSTREAM_COMMAND"] = join(root, "must-not-execute");
process.env["EASYEDA_UPSTREAM_ARGS_JSON"] = "[]";
process.env["EASYEDA_UPSTREAM_CWD"] = root;
process.env["EASYEDA_PCB_BUNDLE_VERSION"] = "3.2.149.5378b690";
process.env["EASYEDA_PUBLIC_API_BUNDLE_VERSION"] = "0.2.53.aee2f57a";
process.env["WSL_DISTRO_NAME"] = "DisposableIndexSynthetic";
process.env["EASYEDA_ASSETS_ROOT"] = "/mnt/c/__easyeda_synthetic_never_access__/resources/app/assets";
const artifacts = await import("../../src/artifacts.ts");
const core = await import("../../src/core.ts");
const operationId = "easyeda-index-original-unfinished", plan = { profile: "synthetic.index-unfinished.v1" };
await artifacts.createOperation({ schema: core.OPERATION_SCHEMA, operationId, plan, planHash: core.buildPlanHash(plan),
  state: "library-needs-review", orphanedCallPossible: false, artifacts: [] });
const journalPath = artifacts.operationPath(operationId);
const bytes = await realReadFile(journalPath);
const information = await realLstat(journalPath);
report("child-ready.json", { pid: process.pid, root, scenario, journalPath, journalBytes: bytes.length,
  journalSha256: sha(bytes), inode: information.ino, device: information.dev, mode: information.mode, uid: information.uid });

async function command(name: "release.json" | "change-assets.json", expected: string): Promise<boolean> {
  const path = join(reportDirectory, name);
  let info;
  try { info = await realLstat(path); }
  catch (error) { if (core.isRecord(error) && error["code"] === "ENOENT") { return false; } throw error; }
  assert.ok(info.isFile() && !info.isSymbolicLink()); assert.equal(info.nlink, 1);
  // eslint-disable-next-line no-bitwise -- POSIX permission bits are the checked filesystem contract.
  assert.equal(info.mode & 0o777, 0o600); assert.equal(info.uid, process.getuid?.());
  assert.equal(info.size, Buffer.byteLength(expected));
  assert.equal(await realReadFile(path, "utf8"), expected); return true;
}
const guardedReadFile = fsPromises.readFile;
mock.method(fsPromises, "readFile", async (...args: unknown[]): Promise<unknown> => {
  const original: unknown = await Reflect.apply(guardedReadFile, fsPromises, args);
  if (args[0] !== sourcePath) { return original; }
  assert.equal(args.length, 1); counts.fingerprintReads += 1; assert.equal(counts.fingerprintReads, 1);
  assert.ok(Buffer.isBuffer(original)); assert.equal(original.length, sourceBefore.length); assert.equal(sha(original), expectedSourceHash);
  const current = await realLstat(sourcePath);
  for (const key of ["dev", "ino", "mode", "uid", "gid", "size", "mtimeMs", "ctimeMs"] as const) {
    assert.equal(current[key], sourceInfo[key]);
  }
  const retained = original;
  report("fingerprint-held.json", { sourcePath, sourceSha256: expectedSourceHash, bytes: original.length, reads: counts.fingerprintReads });
  const deadline = performance.now() + 15_000;
  while (true) {
    if (scenario === "configuration" && counts.configurationChanges === 0 &&
      await command("change-assets.json", '{"changeAssets":true}')) {
      process.env["EASYEDA_ASSETS_ROOT"] = "/mnt/c/__easyeda_synthetic_changed_never_access__/resources/app/assets";
      counts.configurationChanges += 1; report("configuration-changed.json", { changed: true, changes: counts.configurationChanges });
    }
    if (await command("release.json", '{"release":true}')) { break; }
    if (performance.now() >= deadline) { counts.barrierExpired = true; throw new Error("Fixed source-read barrier expired."); }
    await delay(10);
  }
  assert.equal(original, retained); assert.equal(sha(retained), expectedSourceHash);
  counts.returnedOriginalBuffer = true;
  return retained;
});
syncBuiltinESMExports();
await import("../../src/index.ts");

const sdkDataListeners = process.stdin.listeners("data");
assert.equal(sdkDataListeners.length, 1);
const sdkListener = sdkDataListeners[0]; assert.equal(typeof sdkListener, "function");
let pending = Buffer.alloc(0);
function listenerOrder(): void {
  const current = process.stdin.listeners("data");
  assert.equal(current.length, 2); assert.equal(current[0], sdkListener); assert.equal(current[1], observeInput);
}
function observeInput(chunk: Buffer): void {
  assert.ok(Buffer.isBuffer(chunk)); listenerOrder();
  counts.inputBytes += chunk.length; assert.ok(counts.inputBytes <= 32_768);
  pending = Buffer.concat([pending, chunk]);
  let end = pending.indexOf(10);
  while (end >= 0) {
    const line = pending.subarray(0, end); pending = pending.subarray(end + 1);
    const message: unknown = JSON.parse(line.toString("utf8")); assert.ok(core.isRecord(message));
    const params = message["params"];
    if (message["method"] === "tools/call" && core.isRecord(params) && params["name"] === "easyeda_control_runtime") {
      const args = params["arguments"];
      if (core.isRecord(args) && core.isRecord(args["request"]) && args["request"]["action"] === "launch-contained") {
        assert.deepEqual(Object.keys(message).toSorted(), ["id", "jsonrpc", "method", "params"]);
        assert.deepEqual(Object.keys(params).toSorted(), ["arguments", "name"]);
        assert.deepEqual(args, { request: { action: "launch-contained", confirmLaunch: true } });
        assert.equal(message["jsonrpc"], "2.0"); assert.ok(Number.isSafeInteger(message["id"]));
        counts.ordinaryInputs += 1; assert.equal(counts.ordinaryInputs, 1);
        const requestId = message["id"];
        setImmediate(() => {
          listenerOrder(); counts.ordinaryTurns += 1; assert.equal(counts.ordinaryTurns, 1);
          assert.equal(counts.barrierExpired, false);
          assert.equal(counts.returnedOriginalBuffer, scenario === "configuration");
          report("ordinary-input-turn.json", { requestId, sdkListenerRetained: true, sdkFirst: true,
            ordinaryInputs: counts.ordinaryInputs, ordinaryTurns: counts.ordinaryTurns,
            fingerprintHeld: !counts.returnedOriginalBuffer });
        });
      }
    }
    end = pending.indexOf(10);
  }
}
process.stdin.on("data", observeInput); listenerOrder();
function observeShutdown(): void {
  counts.shutdownObserved = true;
  report("shutdown-observed.json", { originalListenerRegisteredFirst: true, shutdownObserved: true });
  process.stdin.off("data", observeInput);
}
if (scenario === "shutdown") {
  const originalSignals = process.listeners("SIGTERM"); assert.equal(originalSignals.length, 1);
  process.once("SIGTERM", observeShutdown);
  const registered = process.listeners("SIGTERM");
  assert.equal(registered.length, 2); assert.equal(registered[0], originalSignals[0]); assert.equal(registered[1], observeShutdown);
}
report("observer-ready.json", { sdkListenerRetained: true, sdkFirst: true, dataListeners: 2, scenario });
