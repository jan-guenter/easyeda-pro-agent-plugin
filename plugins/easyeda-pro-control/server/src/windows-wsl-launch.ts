/** Windows bootstraps only the configured, matching Linux package. Native
 * ownership and all actual admission remain in that original Linux facade. */
import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { link, lstat, mkdir, open, rename, unlink } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { isWindowsWslLinuxPath, serializeWindowsWslRuntimePacket, windowsWslRuntimeFiles, windowsWslRuntimeProgram } from "./windows-wsl-runtime.ts";
import type { WindowsWslRuntimePacket } from "./windows-wsl-runtime.ts";

const PROFILE_BYTES = 32 * 1024;
const absoluteLinuxPath = z.string().min(2).max(4096).refine(isWindowsWslLinuxPath);
export const windowsWslLaunchProfileSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.windows-wsl-launch.v1"),
  distribution: z.string().regex(/^[A-Za-z\d][A-Za-z\d._-]{0,63}$/u),
  nodeExecutable: absoluteLinuxPath, pluginRoot: absoluteLinuxPath, machineProfilePath: absoluteLinuxPath,
});
export type WindowsWslLaunchProfile = z.infer<typeof windowsWslLaunchProfileSchema>;
const failureCodeSchema = z.enum(["windows-wsl-host-unsupported", "windows-wsl-profile-missing", "windows-wsl-profile-invalid",
  "windows-wsl-runtime-invalid", "windows-wsl-executable-missing", "windows-wsl-command-too-large",
  "windows-wsl-child-failed", "windows-wsl-verification-failed", "windows-wsl-profile-exists", "windows-wsl-profile-changed"]);
export class WindowsWslLaunchError extends Error {
  public readonly code: z.infer<typeof failureCodeSchema>;
  public constructor(code: z.infer<typeof failureCodeSchema>) { super(code); this.name = "WindowsWslLaunchError"; this.code = code; }
}
/** Raw caller objects must not execute accessors while selecting an OS process. */
export function parseWindowsWslLaunchProfile(input: unknown): WindowsWslLaunchProfile {
  try { return Object.freeze(windowsWslLaunchProfileSchema.parse(captureCurrentPcbStringClockReply(input).value)); }
  catch { throw new WindowsWslLaunchError("windows-wsl-profile-invalid"); }
}
export function windowsWslProfilePath(explicitPath?: string): string {
  const selected = explicitPath ?? process.env["EASYEDA_WINDOWS_WSL_PROFILE"] ??
    join(homedir(), ".easyeda-pro-control", "windows-wsl-profile.json");
  if (!isAbsolute(selected)) { throw new WindowsWslLaunchError("windows-wsl-profile-invalid"); }
  return resolve(selected);
}
/** Read exactly one bounded regular file and reprove its original identity.
 * This checks filesystem identity, not Windows ACL ownership or native custody. */
async function readWindowsRegularFile(filename: string, maximumBytes: number): Promise<Buffer> {
  const initial = await lstat(filename, { bigint: true });
  if (!initial.isFile() || initial.isSymbolicLink() || initial.nlink !== 1n || initial.size <= 0n || initial.size > BigInt(maximumBytes)) {
    throw new WindowsWslLaunchError("windows-wsl-runtime-invalid");
  }
  // oxlint-disable-next-line no-bitwise -- Combine native descriptor flags; Windows lacks O_NOFOLLOW and is independently checked by handle/path identity.
  const handle = await open(filename, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const before = await handle.stat({ bigint: true });
    if (before.dev !== initial.dev || before.ino !== initial.ino || before.size !== initial.size ||
        before.mode !== initial.mode || before.mtimeNs !== initial.mtimeNs || before.ctimeNs !== initial.ctimeNs) {
      throw new WindowsWslLaunchError("windows-wsl-runtime-invalid");
    }
    const bytes = Buffer.alloc(Number(before.size));
    let offset = 0;
    while (offset < bytes.length) {
      const result = await handle.read(bytes, offset, bytes.length - offset, offset);
      if (result.bytesRead === 0) { throw new WindowsWslLaunchError("windows-wsl-runtime-invalid"); }
      offset += result.bytesRead;
    }
    const extra = await handle.read(Buffer.alloc(1), 0, 1, offset); const after = await handle.stat({ bigint: true });
    const current = await lstat(filename, { bigint: true });
    if (extra.bytesRead !== 0 || !after.isFile() || after.nlink !== 1n || after.dev !== before.dev || after.ino !== before.ino ||
        after.size !== before.size || after.mode !== before.mode || after.mtimeNs !== before.mtimeNs || after.ctimeNs !== before.ctimeNs ||
        !current.isFile() || current.isSymbolicLink() || current.dev !== after.dev || current.ino !== after.ino ||
        current.nlink !== after.nlink || current.size !== after.size || current.mode !== after.mode ||
        current.mtimeNs !== after.mtimeNs || current.ctimeNs !== after.ctimeNs) {
      throw new WindowsWslLaunchError("windows-wsl-runtime-invalid");
    }
    return bytes;
  } finally { await handle.close(); }
}
export async function loadWindowsWslLaunchProfile(explicitPath?: string): Promise<WindowsWslLaunchProfile> {
  try {
    const bytes = await readWindowsRegularFile(windowsWslProfilePath(explicitPath), PROFILE_BYTES);
    return parseWindowsWslLaunchProfile(JSON.parse(bytes.toString("utf8")));
  } catch (error) {
    if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new WindowsWslLaunchError("windows-wsl-profile-missing");
    }
    throw new WindowsWslLaunchError("windows-wsl-profile-invalid");
  }
}
/** The package supplies fixed names; callers can select no extra runtime file. */
export async function captureWindowsWslRuntime(pluginRoot: string, profile: WindowsWslLaunchProfile): Promise<WindowsWslRuntimePacket> {
  const selected = parseWindowsWslLaunchProfile(profile); const files = [];
  for (const spec of windowsWslRuntimeFiles()) {
    const bytes = await readWindowsRegularFile(join(pluginRoot, spec.relativePath), spec.maximumBytes);
    files.push({ relativePath: spec.relativePath, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
  }
  return Object.freeze({ nodeExecutable: selected.nodeExecutable, pluginRoot: selected.pluginRoot,
    machineProfilePath: selected.machineProfilePath, files: Object.freeze(files) });
}
/** Direct argv only. The conservative UTF-16 ceiling allows Windows quoting
 * overhead; shell text, caller programs and command interpolation are absent. */
export function windowsWslLaunchArguments(profile: WindowsWslLaunchProfile, packet: WindowsWslRuntimePacket, mode: "launch" | "verify"): readonly string[] {
  const selected = parseWindowsWslLaunchProfile(profile);
  const args = ["--distribution", selected.distribution, "--cd", "/", "--exec", selected.nodeExecutable,
    "--input-type=module", "--eval", windowsWslRuntimeProgram(), "--", mode, serializeWindowsWslRuntimePacket(packet)];
  let units = 0;
  for (const value of args) { units += value.length * 2 + 3; }
  if (units > 30_000) { throw new WindowsWslLaunchError("windows-wsl-command-too-large"); }
  return Object.freeze(args);
}
function windowsWslExecutable(): string {
  const systemRoot = process.env["SystemRoot"];
  if (process.platform !== "win32" || process.arch !== "x64") { throw new WindowsWslLaunchError("windows-wsl-host-unsupported"); }
  if (systemRoot === undefined || !isAbsolute(systemRoot)) { throw new WindowsWslLaunchError("windows-wsl-executable-missing"); }
  return join(systemRoot, "System32", "wsl.exe");
}
/** Input EOF or a parent termination request closes only the original child's
 * stdin. The wrapper observes that WSL process close; it signals no process and
 * its exit is not evidence of native application/Job/helper closure. */
export async function launchWindowsWslFacade(pluginRoot: string, explicitPath?: string): Promise<void> {
  const executable = windowsWslExecutable(), profile = await loadWindowsWslLaunchProfile(explicitPath);
  const packet = await captureWindowsWslRuntime(pluginRoot, profile); const args = windowsWslLaunchArguments(profile, packet, "launch");
  const child = spawn(executable, args, { stdio: ["pipe", "inherit", "inherit"], windowsHide: true, shell: false });
  const closure = Promise.withResolvers<{ code: number | null; signal: NodeJS.Signals | null }>();
  let spawnFailed = false; let inputFailed = false;
  child.once("error", () => { spawnFailed = true; });
  child.stdin.on("error", () => { inputFailed = true; });
  child.once("close", (code, signal) => { closure.resolve({ code, signal }); });
  const closeOriginalInput = (): void => {
    process.stdin.unpipe(child.stdin);
    if (!child.stdin.destroyed && !child.stdin.writableEnded) { child.stdin.end(); }
  };
  process.on("SIGTERM", closeOriginalInput); process.on("SIGINT", closeOriginalInput);
  process.stdin.pipe(child.stdin);
  try {
    const result = await closure.promise;
    if (spawnFailed || inputFailed || result.code === null || result.signal !== null) { throw new WindowsWslLaunchError("windows-wsl-child-failed"); }
    process.exitCode = result.code;
  } finally {
    process.off("SIGTERM", closeOriginalInput); process.off("SIGINT", closeOriginalInput);
    process.stdin.unpipe(child.stdin); process.stdin.pause();
  }
}
/** Provisioning invokes only fixed readonly WSL verification, never a facade. */
export async function verifyWindowsWslRuntime(pluginRoot: string, input: unknown): Promise<WindowsWslLaunchProfile> {
  const executable = windowsWslExecutable(), profile = parseWindowsWslLaunchProfile(input);
  const packet = await captureWindowsWslRuntime(pluginRoot, profile); const args = windowsWslLaunchArguments(profile, packet, "verify");
  try {
    const stdout = await captureWindowsWslVerification(executable, args);
    z.strictObject({ schema: z.literal("easyeda-pro-control.windows-wsl-verification.v1"), runtimeBytesMatched: z.literal(true),
      platform: z.literal("linux-x64"), nodeVersion: z.literal("v24.18.0"), fileCount: z.literal(6), nativeOwnerAllocated: z.literal(false) }).parse(JSON.parse(stdout));
  } catch { throw new WindowsWslLaunchError("windows-wsl-verification-failed"); }
  return profile;
}
/** Replace only a strictly recognized prior launcher profile after its exact
 * bytes are rechecked. Existing native owners are never retired or adopted here. */
export async function configureWindowsWslLaunch(pluginRoot: string, input: unknown, replace: boolean): Promise<Readonly<{ schema: string; configured: true; changed: boolean }>> {
  const filename = windowsWslProfilePath(); const profile = await verifyWindowsWslRuntime(pluginRoot, input);
  let original: Buffer | null = null;
  try { original = await readWindowsRegularFile(filename, PROFILE_BYTES); parseWindowsWslLaunchProfile(JSON.parse(original.toString("utf8"))); }
  catch (error) {
    if (!(error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT")) { throw error; }
  }
  const bytes = Buffer.from(`${JSON.stringify(profile, null, 2)  }\n`);
  const schema = "easyeda-pro-control.windows-wsl-configuration.v1";
  if (original?.equals(bytes) === true) { return Object.freeze({ schema, configured: true, changed: false }); }
  if (original !== null && !replace) { throw new WindowsWslLaunchError("windows-wsl-profile-exists"); }
  await mkdir(dirname(filename), { recursive: true, mode: 0o700 });
  const pending = join(dirname(filename), `.windows-wsl-profile-${  randomUUID()  }.pending`);
  const pendingHandle = await open(pending, "wx", 0o600);
  try { await pendingHandle.writeFile(bytes); await pendingHandle.sync(); } finally { await pendingHandle.close(); }
  let publicationError: Error | undefined;
  try {
    const current = original === null ? null : await readWindowsRegularFile(filename, PROFILE_BYTES);
    if (original !== null && current?.equals(original) !== true) { throw new WindowsWslLaunchError("windows-wsl-profile-changed"); }
    await (original === null ? link(pending, filename) : rename(pending, filename));
  } catch (error) { publicationError = Error.isError(error) ? error : new WindowsWslLaunchError("windows-wsl-profile-changed"); }
  let cleanupError: Error | undefined;
  try { await unlink(pending); }
  catch (error) {
    if (!(error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT")) { cleanupError = Error.isError(error) ? error : new WindowsWslLaunchError("windows-wsl-profile-changed"); }
  }
  if (publicationError !== undefined) { throw publicationError; }
  if (cleanupError !== undefined) { throw cleanupError; }
  return Object.freeze({ schema, configured: true, changed: true });
}
/** Exact data flags for the offline Windows provisioning entrypoint. */
export function parseWindowsWslConfigurationArguments(args: readonly string[]): Readonly<{ profile: WindowsWslLaunchProfile; replace: boolean }> {
  const values: Record<string, string> = {};
  let replace = false;
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (key === "--replace" && !replace) { replace = true; }
    else {
      const value = args[index + 1];
      if (key === undefined || !["--distribution", "--node", "--plugin-root", "--machine-profile"].includes(key) ||
          value === undefined || value.startsWith("--") || Object.hasOwn(values, key)) { throw new WindowsWslLaunchError("windows-wsl-profile-invalid"); }
      values[key] = value; index += 1;
    }
  }
  const profile = parseWindowsWslLaunchProfile({ schema: "easyeda-pro-control.windows-wsl-launch.v1", distribution: values["--distribution"],
    nodeExecutable: values["--node"], pluginRoot: values["--plugin-root"], machineProfilePath: values["--machine-profile"] });
  return Object.freeze({ profile, replace });
}

/** Drain bounded verification output and observe the original WSL child close.
 * Overflow never signals that process and cannot become a partial result. */
function captureWindowsWslVerification(executable: string, args: readonly string[]): Promise<string> {
  const child = spawn(executable, args, { windowsHide: true, shell: false, stdio: ["pipe", "pipe", "pipe"] });
  const completion = Promise.withResolvers<string>(); const chunks: Buffer[] = [];
  let bytes = 0; let refused = false;
  child.once("error", () => { refused = true; });
  child.stdin.on("error", () => { refused = true; });
  child.stdout.on("data", (chunk: unknown) => {
    if (!Buffer.isBuffer(chunk)) { refused = true; return; }
    bytes += chunk.length;
    if (bytes > 8192) { refused = true; } else { chunks.push(chunk); }
  });
  child.stderr.resume(); child.stdin.end();
  child.once("close", (code, signal) => {
    if (refused || code !== 0 || signal !== null) { completion.reject(new WindowsWslLaunchError("windows-wsl-verification-failed")); }
    else { completion.resolve(Buffer.concat(chunks, bytes).toString("utf8")); }
  });
  return completion.promise;
}
