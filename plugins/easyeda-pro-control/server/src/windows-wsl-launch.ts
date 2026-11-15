/** Windows bootstraps only the configured, matching Linux package. Native
 * ownership and all actual admission remain in that original Linux facade. */
import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { link, lstat, mkdir, open, realpath, rename, unlink } from "node:fs/promises";
import type { BigIntStats } from "node:fs";
import type { DatabaseSync } from "node:sqlite";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
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
const CONFIGURATION_LOCK_SCHEMA = "easyeda-pro-control.windows-wsl-configuration-lock.v1";
const CONFIGURATION_LOCK_SQL = "CREATE TABLE configuration_lock (profile_path TEXT NOT NULL, schema TEXT NOT NULL) STRICT";
/** This reserved database is configuration metadata, never a control lease.
 * Complete initialization precedes its exclusive link; publishers never replace
 * it. An interrupted link/unlink may leave one harmless initialization alias. */
async function recognizeConfigurationLock(filename: string, profilePath: string): Promise<BigIntStats> {
  const handle = await open(filename, "r");
  try {
    const before = await handle.stat({ bigint: true }), initial = await lstat(filename, { bigint: true });
    if (!before.isFile() || !initial.isFile() || initial.isSymbolicLink() || before.nlink < 1n || before.nlink > 2n ||
        before.size < 100n || before.size > 65_536n || initial.dev !== before.dev || initial.ino !== before.ino) {
      throw new WindowsWslLaunchError("windows-wsl-profile-changed");
    }
    const bytes = Buffer.alloc(Number(before.size)); let offset = 0;
    while (offset < bytes.length) { const read = await handle.read(bytes, offset, bytes.length - offset, offset); if (read.bytesRead === 0) { throw new WindowsWslLaunchError("windows-wsl-profile-changed"); } offset += read.bytesRead; }
    const extra = await handle.read(Buffer.alloc(1), 0, 1, offset); const after = await handle.stat({ bigint: true }), current = await lstat(filename, { bigint: true });
    if (extra.bytesRead !== 0 || bytes.subarray(0, 16).toString("latin1") !== "SQLite format 3\0" || bytes.readUInt32BE(60) !== 1 || bytes.readUInt32BE(68) !== 1_163_350_860 ||
        after.dev !== before.dev || after.ino !== before.ino || after.nlink !== before.nlink || after.size !== before.size ||
        after.mtimeNs !== before.mtimeNs || after.ctimeNs !== before.ctimeNs || !current.isFile() || current.isSymbolicLink() ||
        current.dev !== after.dev || current.ino !== after.ino || current.nlink !== after.nlink || current.size !== after.size ||
        current.mtimeNs !== after.mtimeNs || current.ctimeNs !== after.ctimeNs) { throw new WindowsWslLaunchError("windows-wsl-profile-changed"); }
    const { DatabaseSync: Database } = await import("node:sqlite");
    const database = new Database(filename, { readOnly: true, allowExtension: false });
    try {
      const tables = database.prepare("SELECT type, name, tbl_name, sql FROM sqlite_schema").all();
      const table = tables[0];
      if (tables.length !== 1 || table?.["type"] !== "table" || table["name"] !== "configuration_lock" || table["tbl_name"] !== "configuration_lock" || table["sql"] !== CONFIGURATION_LOCK_SQL) {
        throw new WindowsWslLaunchError("windows-wsl-profile-changed");
      }
      const rows = database.prepare("SELECT profile_path, schema FROM configuration_lock").all(); const row = rows[0];
      if (rows.length !== 1 || row?.["profile_path"] !== profilePath || row["schema"] !== CONFIGURATION_LOCK_SCHEMA) { throw new WindowsWslLaunchError("windows-wsl-profile-changed"); }
    } finally { database.close(); }
    const recognized = await lstat(filename, { bigint: true });
    if (recognized.dev !== after.dev || recognized.ino !== after.ino || recognized.nlink !== after.nlink || recognized.size !== after.size ||
        recognized.mtimeNs !== after.mtimeNs || recognized.ctimeNs !== after.ctimeNs || !recognized.isFile() || recognized.isSymbolicLink()) { throw new WindowsWslLaunchError("windows-wsl-profile-changed"); }
    return recognized;
  } finally { await handle.close(); }
}
/** Initialize only our exclusive temporary database, then publish once. */
async function initializeConfigurationLock(filename: string, canonical: string, binding: string): Promise<void> {
  const { DatabaseSync: Database } = await import("node:sqlite");
const pending = join(dirname(canonical), `.windows-wsl-lock-${randomUUID()}.pending`);
const handle = await open(pending, "wx", 0o600); await handle.close();
try {
  const initialization = new Database(pending, { allowExtension: false });
  try {
    initialization.exec("PRAGMA journal_mode=DELETE; PRAGMA application_id=1163350860; PRAGMA user_version=1;");
    initialization.exec(CONFIGURATION_LOCK_SQL);
    initialization.prepare("INSERT INTO configuration_lock (profile_path, schema) VALUES (?, ?)").run(binding, CONFIGURATION_LOCK_SCHEMA);
  } finally { initialization.close(); }
  const complete = await open(pending, "r+"); try { await complete.sync(); } finally { await complete.close(); }
  try { await link(pending, filename); }
  catch (publicationError) { if (!(publicationError !== null && typeof publicationError === "object" && "code" in publicationError && publicationError.code === "EEXIST")) { throw publicationError; } }
} finally { await unlink(pending); }
}
/** SQLite's OS transaction lock belongs to this publisher process and is
 * released on crash. Busy/unknown locks refuse; no PID-file recovery or retry. */
async function acquireConfigurationLock(profilePath: string): Promise<DatabaseSync> {
  let canonical: string;
  try { canonical = await realpath(profilePath); }
  catch (error) {
    if (!(error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT")) { throw new WindowsWslLaunchError("windows-wsl-profile-changed"); }
    canonical = join(await realpath(dirname(profilePath)), basename(profilePath));
  }
  // Windows case/short-name aliases must select one lock. Coarser case folding
  // In a case-sensitive directory can only refuse an independent publisher.
  const binding = process.platform === "win32" ? canonical.toUpperCase() : canonical;
  const filename = join(dirname(canonical), `.windows-wsl-${createHash("sha256").update(binding).digest("hex")}.lock.sqlite`);
  const { DatabaseSync: Database } = await import("node:sqlite");
  let database: DatabaseSync | undefined;
  try {
    try { await lstat(filename); }
    catch (error) {
      if (!(error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT")) { throw error; }
      await initializeConfigurationLock(filename, canonical, binding);
    }
    const before = await recognizeConfigurationLock(filename, binding);
    database = new Database(filename, { allowExtension: false }); database.exec("BEGIN IMMEDIATE");
    const current = await lstat(filename, { bigint: true });
    if (!current.isFile() || current.isSymbolicLink() || current.dev !== before.dev || current.ino !== before.ino ||
        current.size !== before.size || current.nlink !== before.nlink || current.mtimeNs !== before.mtimeNs || current.ctimeNs !== before.ctimeNs) { throw new WindowsWslLaunchError("windows-wsl-profile-changed"); }
    return database;
  } catch { database?.close(); throw new WindowsWslLaunchError("windows-wsl-profile-changed"); }
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
  let publicationError: Error | undefined; let transaction: DatabaseSync | undefined;
  try {
    transaction = await acquireConfigurationLock(filename);
    let current: Buffer | null = null;
    try { current = await readWindowsRegularFile(filename, PROFILE_BYTES); }
    catch (error) { if (!(error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT")) { throw error; } }
    if (original === null ? current !== null : current?.equals(original) !== true) { throw new WindowsWslLaunchError("windows-wsl-profile-changed"); }
    await (original === null ? link(pending, filename) : rename(pending, filename));
  } catch { publicationError = new WindowsWslLaunchError("windows-wsl-profile-changed"); }
  finally { if (transaction !== undefined) { try { transaction.exec("ROLLBACK"); } catch { publicationError ??= new WindowsWslLaunchError("windows-wsl-profile-changed"); } finally { transaction.close(); } } }
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
