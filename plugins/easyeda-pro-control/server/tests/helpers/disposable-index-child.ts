/** Fixed offline child. Ordinary --import isolation must have run before this module. */
/* eslint-disable node/no-top-level-await -- This fixed ESM executable installs traps and seeds evidence before importing the index. */
import assert from "node:assert/strict";
import childProcess from "node:child_process";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import net from "node:net";
import { basename, dirname, join, resolve } from "node:path";
import { mock } from "node:test";
import { fileURLToPath } from "node:url";

const scenario = process.argv[2];
assert.ok(scenario === "seeded" || scenario === "missing-assets" || scenario === "invalid-assets");
assert.equal(process.argv.length, 3); assert.equal(process.versions.node, "24.18.0");
const root = process.env["EASYEDA_CONTROL_DATA_DIR"];
assert.ok(root !== undefined && dirname(root) === "/tmp" && basename(root).startsWith(`easyeda-test-control-${String(process.pid)}-`));
assert.equal(process.env["EASYEDA_BRIDGE_TOKEN_FILE"], join(root, "bridge-token"));
assert.equal(process.env["EASYEDA_UPSTREAM_DATA_DIR"], join(root, "upstream"));
const reportDirectory = process.env["EASYEDA_INDEX_TEST_REPORT_DIRECTORY"];
assert.ok(reportDirectory !== undefined && dirname(dirname(reportDirectory)) === "/tmp" &&
  basename(dirname(reportDirectory)).startsWith("easyeda-test-control-") && basename(reportDirectory).startsWith("index-case-"));
const reportInfo = await fsPromises.lstat(reportDirectory);
assert.ok(reportInfo.isDirectory() && !reportInfo.isSymbolicLink());
// eslint-disable-next-line no-bitwise -- POSIX mode permission bits are the native filesystem contract.
assert.equal(reportInfo.mode & 0o777, 0o700); assert.equal(reportInfo.uid, process.getuid?.());
const counts = { processAttempts: 0, networkAttempts: 0, windowsReadAttempts: 0, lifetimeExpired: false };
const writeReport = fs.writeFileSync;
// This exact Linux child schedules self-expiry even if its parent worker is cancelled.
// No descendant PID or Windows process is selected by these self-signals.
const lifetime = setTimeout(() => {
  counts.lifetimeExpired = true;
  const force = setTimeout(() => { process.kill(process.pid, "SIGKILL"); }, 5000);
  force.unref(); process.kill(process.pid, "SIGTERM");
}, 45_000);
lifetime.unref();
process.once("exit", code => {
  clearTimeout(lifetime);
  writeReport(join(reportDirectory, "child-exit.json"), JSON.stringify({ code, pid: process.pid, root, scenario, ...counts }), { flag: "wx", mode: 0o600 });
});
for (const name of ["spawn", "spawnSync", "exec", "execSync", "execFile", "execFileSync", "fork"] as const) {
  mock.method(childProcess, name, (): never => { counts.processAttempts += 1; throw new Error("Offline index test refused process boundary."); });
}
mock.method(net.Server.prototype, "listen", (): never => { counts.networkAttempts += 1; throw new Error("Offline index test refused listen boundary."); });
mock.method(net.Socket.prototype, "connect", (): never => { counts.networkAttempts += 1; throw new Error("Offline index test refused connect boundary."); });
// Scope is the listed string/file-URL APIs, not every possible fd/Buffer/stream
// Or native I/O entry. The fixed first slice must stop at journal admission.
function forbidWindows(value: unknown): void {
  const path = value instanceof URL ? fileURLToPath(value) : value;
  if (typeof path === "string" && (path.startsWith("/mnt/") || /^[A-Za-z]:[\\/]/u.test(path))) {
    counts.windowsReadAttempts += 1; throw new Error("Offline index test refused Windows filesystem boundary.");
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
process.env["WSL_DISTRO_NAME"] = "DisposableIndexSynthetic";
if (scenario === "missing-assets") { delete process.env["EASYEDA_ASSETS_ROOT"]; }
else {
  process.env["EASYEDA_ASSETS_ROOT"] = scenario === "invalid-assets" ? join(root, "invalid-assets") :
    "/mnt/c/__easyeda_synthetic_never_access__/resources/app/assets";
}
const artifacts = await import("../../src/artifacts.ts");
const core = await import("../../src/core.ts");
const operationId = "easyeda-index-original-unfinished", plan = { profile: "synthetic.index-unfinished.v1" };
const journal = { schema: core.OPERATION_SCHEMA, operationId, plan, planHash: core.buildPlanHash(plan),
  state: "library-needs-review", orphanedCallPossible: false, artifacts: [] };
await artifacts.createOperation(journal);
const journalPath = artifacts.operationPath(operationId);
const bytes = await fsPromises.readFile(journalPath), information = await fsPromises.lstat(journalPath);
const readiness = { pid: process.pid, root, scenario, journalPath, journalBytes: bytes.length,
  journalSha256: core.sha256Text(bytes.toString("utf8")), inode: information.ino, device: information.dev,
  mode: information.mode, uid: information.uid, indexPath: resolve(import.meta.dirname, "../../src/index.ts") };
await fsPromises.writeFile(join(reportDirectory, "child-ready.json"), JSON.stringify(readiness), { flag: "wx", mode: 0o600 });
await import("../../src/index.ts");
