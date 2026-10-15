import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { deriveWindowsRuntimePaths } from "./windows-runtime.ts";

/** Independent read-only helper; changing it does not admit a native writer. */
export const ORDINARY_LAUNCH_RECOVERY_HELPER = Object.freeze({
  relativePath: "scripts/ordinary-launch-recovery.ps1", bytes: 2320,
  sha256: "8ffb025cdd20c1851c37d57a20816240928c7e6425b44528a623c8b8f72a37aa",
});
const nativeObservationSchema = z.object({
  schema: z.literal("easyeda-pro-control.ordinary-launch-recovery-observation.v1"),
  samples: z.literal(2), otherPowerShellPresent: z.boolean(), sameNameProcessPresent: z.boolean(),
}).strict();
export const ordinaryLaunchRecoveryObservationSchema = nativeObservationSchema.extend({
  helperSha256: z.literal(ORDINARY_LAUNCH_RECOVERY_HELPER.sha256),
}).strict();
/** Read completed 060000 receipts without admitting that helper to new execution. */
export const recordedOrdinaryLaunchRecoveryObservationSchema = nativeObservationSchema.extend({
  helperSha256: z.enum([ORDINARY_LAUNCH_RECOVERY_HELPER.sha256,
    "d68a8029d12d4bcbff1432e21c917ac4dd11c390dc95effea138522b3080298c"]),
}).strict();

type RecoveryFailureCategory = "pre-helper-source" | "spawn" | "timeout" | "stderr" | "output-schema" |
  "output-bound" | "nonzero-exit" | "stream" | "post-helper-source";
export class OrdinaryLaunchRecoveryError extends Error {
  public readonly category: RecoveryFailureCategory;
  public constructor(category: RecoveryFailureCategory) {
    super(`Ordinary launch recovery observation was not proven: ${category}; no recovery is authorized.`);
    this.name = "OrdinaryLaunchRecoveryError";
    this.category = category;
  }
}
function refused(category: RecoveryFailureCategory): OrdinaryLaunchRecoveryError { return new OrdinaryLaunchRecoveryError(category); }
function sameFile(left: BigIntStats, right: BigIntStats): boolean {
  return (["dev", "ino", "size", "mode", "uid", "gid", "nlink", "mtimeNs", "ctimeNs"] as const).every((key) => left[key] === right[key]);
}

async function verifyHelper(helperPath: string, expected?: BigIntStats): Promise<{ readonly stat: BigIntStats; readonly command: string }> {
  if (await realpath(helperPath) !== helperPath) { throw new Error("Recovery helper source check failed."); }
  // oxlint-disable-next-line no-bitwise -- Read only and refuse links or blocking nonregular descriptors.
  const handle = await open(helperPath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await handle.stat({ bigint: true });
    if (!before.isFile() || before.nlink !== 1n || before.size !== BigInt(ORDINARY_LAUNCH_RECOVERY_HELPER.bytes) ||
        expected !== undefined && !sameFile(before, expected)) { throw new Error("Recovery helper source check failed."); }
    const bytes = Buffer.alloc(ORDINARY_LAUNCH_RECOVERY_HELPER.bytes + 1);
    let count = 0;
    while (count < bytes.length) {
      const result = await handle.read(bytes, count, bytes.length - count, count);
      if (result.bytesRead === 0) { break; }
      count += result.bytesRead;
    }
    if (count !== ORDINARY_LAUNCH_RECOVERY_HELPER.bytes ||
        createHash("sha256").update(bytes.subarray(0, count)).digest("hex") !== ORDINARY_LAUNCH_RECOVERY_HELPER.sha256 ||
        !sameFile(before, await handle.stat({ bigint: true })) || !sameFile(before, await lstat(helperPath, { bigint: true })) ||
        await realpath(helperPath) !== helperPath) { throw new Error("Recovery helper source check failed."); }
    // Execute the descriptor-verified bytes, never reopen the mutable pathname in Windows.
    const source = new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, count));
    return { stat: before, command: Buffer.from(source, "utf16le").toString("base64") };
  } finally { await handle.close(); }
}

/** Fixed, short-lived diagnostic invocation. No stdin requests or application authority. */
async function invokeHelper(command: string): Promise<z.infer<typeof nativeObservationSchema>> {
  let child: ChildProcessWithoutNullStreams;
  try {
    child = spawn("/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe", [
      "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", command,
    ], { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
  } catch { throw refused("spawn"); }
  const chunks: Buffer[] = [], completion = Promise.withResolvers<z.infer<typeof nativeObservationSchema>>();
  let count = 0, settled = false;
  function reject(category: RecoveryFailureCategory): void {
    if (settled) { return; }
    settled = true;
    // A failed read-only helper may finish later; do not kill it or any app.
    child.stdin.destroy(); child.stdout.destroy(); child.stderr.destroy(); child.unref();
    completion.reject(refused(category));
  }
  child.stdout.on("data", (chunk: unknown) => {
    if (settled) { return; }
    if (!Buffer.isBuffer(chunk)) { reject("output-schema"); return; }
    count += chunk.length;
    if (count > 4096) { reject("output-bound"); return; }
    chunks.push(chunk);
  });
  child.stderr.on("data", () => { reject("stderr"); });
  child.on("error", () => { reject("spawn"); });
  child.stdin.on("error", () => { reject("stream"); });
  child.stdout.on("error", () => { reject("stream"); });
  child.stderr.on("error", () => { reject("stream"); });
  child.on("close", (code: number | null, signal: string | null) => {
    if (settled) { return; }
    if (code !== 0 || signal !== null) { reject("nonzero-exit"); return; }
    try {
      const decoded = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks, count));
      const result = nativeObservationSchema.parse(JSON.parse(decoded) as unknown);
      settled = true;
      completion.resolve(result);
    } catch { reject("output-schema"); }
  });
  const deadline = setTimeout(() => { reject("timeout"); }, 10_000);
  child.stdin.end();
  try { return await completion.promise; } finally { clearTimeout(deadline); }
}

/** Two ordered native process scans, not original-root or descendant termination proof. */
export async function observeOrdinaryLaunchRecovery(options: {
  readonly pluginRoot: string; readonly assetsRoot: string;
}): Promise<z.infer<typeof ordinaryLaunchRecoveryObservationSchema>> {
  let before: Awaited<ReturnType<typeof verifyHelper>>, helperPath: string;
  try {
    deriveWindowsRuntimePaths(options);
    helperPath = join(options.pluginRoot, ORDINARY_LAUNCH_RECOVERY_HELPER.relativePath);
    before = await verifyHelper(helperPath);
  } catch { throw refused("pre-helper-source"); }
  const observation = await invokeHelper(before.command);
  try { await verifyHelper(helperPath, before.stat); } catch { throw refused("post-helper-source"); }
  return { ...observation, helperSha256: ORDINARY_LAUNCH_RECOVERY_HELPER.sha256 };
}
