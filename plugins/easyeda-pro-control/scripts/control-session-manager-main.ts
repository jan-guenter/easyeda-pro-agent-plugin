/** Standalone foreground frontend entry. It selects the existing pinned Node
 * before initializing the manager and grants no facade/native admission. */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadMachineLaunchProfile, openVerifiedMachineNode } from "../server/src/machine-profile.ts";
import { assertSelfSoftCoreLimitZero } from "../server/src/soft-core-limit.ts";

declare const easyedaForegroundManagerBuildId: string;
const NAME = "control-session-manager.mjs";
const MAXIMUM_BYTES = 16_777_216;
/** File content/identity checks exclude atime, which reads may legitimately
 * change. The trusted frozen package must remain immutable through startup. */
function same(left: BigIntStats, right: BigIntStats): boolean {
  return right.isFile() && !right.isSymbolicLink() && right.nlink === 1n && left.dev === right.dev && left.ino === right.ino &&
    left.mode === right.mode && left.size === right.size && left.mtimeNs === right.mtimeNs && left.ctimeNs === right.ctimeNs;
}
/** Read the one frontend through a bounded nonfollowing descriptor and reprove
 * its canonical path. This observation is not authority from its own hash. */
async function captureFrontend(): Promise<Readonly<{ path: string; bytes: number; sha256: string; information: BigIntStats }>> {
  const path = import.meta.filename;
  if (basename(path) !== NAME || await realpath(path) !== path) { throw new Error("manager-frontend-path"); }
  const before = await lstat(path, { bigint: true });
  if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1n || before.size <= 0n || before.size > BigInt(MAXIMUM_BYTES)) { throw new Error("manager-frontend-file"); }
  // oxlint-disable-next-line eslint/no-bitwise -- Bind the checked file without following a replaced final symlink.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    if (!same(before, await file.stat({ bigint: true }))) { throw new Error("manager-frontend-drift"); }
    const bytes = Buffer.alloc(Number(before.size) + 1); let length = 0;
    while (length < bytes.length) { const read = await file.read(bytes, length, bytes.length - length, null); if (read.bytesRead === 0) { break; } length += read.bytesRead; }
    const after = await file.stat({ bigint: true });
    if (length !== Number(before.size) || !same(before, after) || !same(after, await lstat(path, { bigint: true })) || await realpath(path) !== path) { throw new Error("manager-frontend-drift"); }
    return Object.freeze({ path, bytes: length, sha256: createHash("sha256").update(bytes.subarray(0, length)).digest("hex"), information: after });
  } finally { await file.close(); }
}
/** Recheck the original frontend across profile/executable awaits. No loaded
 * source graph, native helper or older process is recreated from these bytes. */
async function current(frontend: Awaited<ReturnType<typeof captureFrontend>>): Promise<void> {
  const observed = await captureFrontend();
  if (!same(frontend.information, observed.information) || frontend.bytes !== observed.bytes || frontend.sha256 !== observed.sha256) { throw new Error("manager-frontend-drift"); }
}
/** Enter only this frontend. Every imported executable main guard is false in
 * the bundle, so the legacy client cannot start an unintended second child. */
async function run(): Promise<void> {
  if (process.platform !== "linux" || process.arch !== "x64" || typeof easyedaForegroundManagerBuildId !== "string" || !/^[a-f0-9]{64}$/u.test(easyedaForegroundManagerBuildId)) { throw new Error("manager-frontend-runtime"); }
  await assertSelfSoftCoreLimitZero();
  const args = process.argv.slice(2), frontend = await captureFrontend();
  if (args.length === 1 && args[0] === "--frontend-identity") {
    if (process.version !== "v24.18.0") { throw new Error("manager-frontend-runtime"); }
    process.stdout.write(`${JSON.stringify({ schema: "easyeda-pro-control.foreground-frontend.v1", pid: process.pid,
      nodeVersion: process.version, path: frontend.path, bytes: frontend.bytes, sha256: frontend.sha256,
      buildId: easyedaForegroundManagerBuildId, sdkVersion: "1.32.1", dependencyFree: true, facadeRuntimeIdentityIncluded: false, nativeAdmissionGranted: false,
      admissionGranted: false })}\n`); return;
  }
  if (args.length > 0 && (args.length !== 2 || args[0] !== "--plugin-root" || args[1] === undefined || resolve(args[1]) !== args[1])) { throw new Error("manager-frontend-arguments"); }
  const runtime = await loadMachineLaunchProfile();
  const node = await openVerifiedMachineNode(runtime.profile.runtime);
  try {
    await current(frontend); await node.assertCurrent();
    if (process.version !== "v24.18.0" || await realpath("/proc/self/exe") !== runtime.profile.runtime.nodeExecutable) {
      if (typeof process.execve !== "function") { throw new TypeError("manager-frontend-needs-execve"); }
      process.execve(node.descriptorPath, [runtime.profile.runtime.nodeExecutable, frontend.path, ...args], {
        ...process.env, EASYEDA_MACHINE_PROFILE: runtime.profilePath,
      });
      throw new Error("manager-frontend-execve-returned");
    }
  } finally { await node.close(); }
  await current(frontend);
  if (args.length === 0) { process.argv.push("--plugin-root", fileURLToPath(new URL("../..", import.meta.url)).replace(/\/$/u, "")); }
  const manager = await import("./control-session-manager.ts"); await current(frontend); await manager.runForegroundManagerCli();
}

try {
  // oxlint-disable-next-line node/no-top-level-await -- This dedicated bundled entry owns the launcher; imported client main guards are disabled at build time.
  await run();
} catch {
  process.exitCode = 1;
  process.stderr.write(`${JSON.stringify({ error: "manager-frontend-start-failed", privateDiagnosticsWithheld: true, admissionGranted: false })}\n`);
}
