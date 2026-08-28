import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import {
  lstat,
  open,
  readdir,
  readlink,
  realpath,
} from "node:fs/promises";
import type { Stats } from "node:fs";
import type { FileHandle } from "node:fs/promises";
import type { Readable } from "node:stream";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { z } from "zod";

import {
  canonicalJson,
  loadReviewedCompatibilityManifest,
} from "./core.ts";
import type { UpstreamLauncherFingerprint } from "./core.ts";
import { captureUpstreamModuleGraph } from "./upstream-module-execution.ts";
import type { CapturedUpstreamModuleGraph } from "./upstream-module-execution.ts";

interface DependencyLockFingerprint {
  readonly path: string;
  readonly sha256: string;
  readonly type: string;
}

export interface PathSeal {
  readonly ctimeMs: number;
  readonly dev: number;
  readonly ino: number;
  readonly kind: "directory" | "file" | "symlink";
  readonly linkTarget?: string;
  readonly mode: number;
  readonly mtimeMs: number;
  readonly path: string;
  readonly size: number;
  readonly sha256?: string;
}

interface ClosureEntry {
  readonly bytes: number;
  readonly kind: "directory" | "file" | "symlink";
  readonly path: string;
  readonly sha256?: string;
  readonly target?: string;
}

interface ExecutionClosureFingerprint {
  readonly directoryCount: number;
  readonly fileCount: number;
  readonly root: string;
  readonly sha256: string;
  readonly symlinkCount: number;
  readonly totalBytes: number;
}

const DEFAULT_SANDBOX_COMMAND = "/usr/sbin/bwrap";
const REVIEWED_SANDBOX_VERSION = "0.11.2";
const REQUIRED_SANDBOX_OPTIONS = [
  "--as-pid-1",
  "--bind-fd",
  "--block-fd",
  "--cap-drop",
  "--chdir",
  "--clearenv",
  "--dev-bind",
  "--die-with-parent",
  "--dir",
  "--disable-userns",
  "--json-status-fd",
  "--new-session",
  "--perms",
  "--ro-bind",
  "--ro-bind-data",
  "--ro-bind-fd",
  "--seccomp",
  "--setenv",
  "--share-net",
  "--symlink",
  "--tmpfs",
  "--unshare-all",
  "--unshare-pid",
  "--unshare-user",
] as const;
const runtimeSha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const runtimeLauncherFingerprintSchema = z.strictObject({
  args: z.tuple([z.string().min(1)]),
  command: z.string().min(1),
  commandSha256: runtimeSha256Schema,
  cwd: z.string().min(1),
  dependencyLock: z.strictObject({
    path: z.string().min(1),
    sha256: runtimeSha256Schema,
    type: z.string().min(1),
  }),
  entrypoint: z.string().min(1),
  entrypointSha256: runtimeSha256Schema,
  executionClosure: z.strictObject({
    directoryCount: z.number().int().positive(),
    fileCount: z.number().int().positive(),
    root: z.string().min(1),
    sha256: runtimeSha256Schema,
    symlinkCount: z.number().int().nonnegative(),
    totalBytes: z.number().int().positive(),
  }),
  implementationTree: z.strictObject({
    fileCount: z.number().int().positive(),
    root: z.string().min(1),
    sha256: runtimeSha256Schema,
  }),
  moduleGraph: z.strictObject({
    edgeCount: z.number().int().nonnegative(),
    moduleCount: z.number().int().positive(),
    schema: z.literal("easyeda-pro-control.module-graph.v1"),
    sha256: runtimeSha256Schema,
    totalBytes: z.number().int().positive(),
  }),
  sandbox: z.strictObject({
    command: z.string().min(1),
    commandSha256: runtimeSha256Schema,
    version: z.string().min(1),
  }),
});

export interface LauncherCapture {
  readonly fingerprint: UpstreamLauncherFingerprint;
  readonly moduleGraph: CapturedUpstreamModuleGraph;
  readonly seals: readonly PathSeal[];
}

export interface LauncherAdmission {
  readonly fingerprint: UpstreamLauncherFingerprint;
  readonly seals: readonly PathSeal[];
}

export interface ReviewedExecutable {
  readonly descriptor: number;
  readonly executionPath: string;
  readonly handle: FileHandle;
  readonly assertCurrent: () => Promise<void>;
  readonly dispose: () => Promise<void>;
}

export function parseRuntimeLauncherFingerprint(
  value: unknown,
): UpstreamLauncherFingerprint {
  return runtimeLauncherFingerprintSchema.parse(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorCode(error: unknown): string | undefined {
  return isRecord(error) && typeof error["code"] === "string"
    ? error["code"]
    : undefined;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item: unknown) => typeof item === "string")
  );
}

export function configuredUpstreamArgs(): string[] {
  const raw = process.env["EASYEDA_UPSTREAM_ARGS_JSON"];
  if (raw === undefined || raw.length === 0) {
    throw new Error(
      "EASYEDA_UPSTREAM_ARGS_JSON must configure exactly one absolute Node entrypoint.",
    );
  }
  const parsed: unknown = JSON.parse(raw);
  if (
    !isStringArray(parsed) ||
    parsed.length !== 1 ||
    parsed[0] === undefined ||
    !isAbsolute(parsed[0])
  ) {
    throw new Error(
      "EASYEDA_UPSTREAM_ARGS_JSON must contain exactly one absolute Node entrypoint and no runtime flags.",
    );
  }
  return parsed;
}

export function configuredUpstreamCommand(): string {
  const command = process.env["EASYEDA_UPSTREAM_COMMAND"];
  if (command === undefined || command.length === 0 || !isAbsolute(command)) {
    throw new Error("EASYEDA_UPSTREAM_COMMAND must be an absolute path.");
  }
  return resolve(command);
}

export function configuredUpstreamCwd(): string {
  const cwd = process.env["EASYEDA_UPSTREAM_CWD"];
  if (cwd === undefined || cwd.length === 0 || !isAbsolute(cwd)) {
    throw new Error("EASYEDA_UPSTREAM_CWD must be an absolute path.");
  }
  return resolve(cwd);
}

function isWithin(root: string, candidate: string): boolean {
  const relativePath = relative(root, candidate);
  return (
    relativePath.length === 0 ||
    (relativePath !== ".." &&
      !relativePath.startsWith(`..${sep}`) &&
      !isAbsolute(relativePath))
  );
}

function assertTrustedOwnership(
  path: string,
  info: Stats,
  allowRootOwner = false,
): void {
  if (
    typeof process.getuid === "function" &&
    info.uid !== process.getuid() &&
    !(allowRootOwner && info.uid === 0)
  ) {
    throw new Error(`Trusted upstream path is owned by another user: ${path}`);
  }
  if (!info.isSymbolicLink() && (info.mode & 0o022) !== 0) {
    throw new Error(
      `Trusted upstream path is group- or other-writable: ${path}`,
    );
  }
  if (!info.isSymbolicLink() && (info.mode & 0o6000) !== 0) {
    throw new Error(
      `Trusted upstream path must not carry setuid or setgid privilege bits: ${path}`,
    );
  }
}

function sealFor(
  path: string,
  info: Stats,
  kind: PathSeal["kind"],
  linkTarget?: string,
  sha256?: string,
): PathSeal {
  return {
    path,
    kind,
    dev: info.dev,
    ino: info.ino,
    mode: info.mode,
    size: info.size,
    mtimeMs: info.mtimeMs,
    ctimeMs: info.ctimeMs,
    ...(linkTarget === undefined ? {} : { linkTarget }),
    ...(sha256 === undefined ? {} : { sha256 }),
  };
}

function sameIdentity(left: Stats, right: Stats): boolean {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.size === right.size &&
    left.mtimeMs === right.mtimeMs &&
    left.ctimeMs === right.ctimeMs
  );
}

async function hashOpenFile(
  path: string,
  expected: Stats,
): Promise<{ readonly bytes: number; readonly sha256: string }> {
  let handle: FileHandle | undefined;
  try {
    handle = await open(path, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
    const opened = await handle.stat();
    if (!opened.isFile() || !sameIdentity(expected, opened)) {
      throw new Error(`Trusted upstream file changed before open: ${path}`);
    }
    const hash = createHash("sha256");
    for await (const chunk of handle.createReadStream({ autoClose: false })) {
      if (!Buffer.isBuffer(chunk)) {
        throw new TypeError("Trusted upstream file yielded a non-buffer chunk.");
      }
      hash.update(chunk);
    }
    const after = await handle.stat();
    if (!sameIdentity(opened, after)) {
      throw new Error(`Trusted upstream file changed while hashing: ${path}`);
    }
    return { bytes: after.size, sha256: hash.digest("hex") };
  } finally {
    await handle?.close();
  }
}

async function detectDependencyLock(
  cwd: string,
): Promise<readonly [string, string]> {
  const candidates: readonly (readonly [string, string])[] = [
    ["pnpm", "pnpm-lock.yaml"],
    ["npm", "package-lock.json"],
    ["npm-shrinkwrap", "npm-shrinkwrap.json"],
    ["yarn", "yarn.lock"],
  ];
  for (const [type, name] of candidates) {
    const path = join(cwd, name);
    try {
      const info = await lstat(path);
      if (info.isFile() && !info.isSymbolicLink()) {
        return [type, path];
      }
    } catch (error) {
      if (errorCode(error) !== "ENOENT") {
        throw error;
      }
    }
  }
  throw new Error("The upstream dependency lockfile is unavailable.");
}

async function captureExecutionClosure(
  cwd: string,
  implementationRoot: string,
  dependencyLockPath: string,
): Promise<{
  readonly dependencyLockSha256: string;
  readonly entryHashes: ReadonlyMap<string, string>;
  readonly fingerprint: ExecutionClosureFingerprint;
  readonly implementationTree: {
    readonly fileCount: number;
    readonly root: string;
    readonly sha256: string;
  };
  readonly seals: readonly PathSeal[];
}> {
  const dependencyRoot = join(cwd, "node_modules");
  const packagePath = join(cwd, "package.json");
  const roots = [implementationRoot, dependencyRoot, packagePath, dependencyLockPath]
    .map((path) => resolve(path))
    .toSorted();
  const entries: ClosureEntry[] = [];
  const seals: PathSeal[] = [];
  const visitedDirectories = new Set<string>();
  const visitedFiles = new Set<string>();

  const visit = async (path: string): Promise<void> => {
    const absolute = resolve(path);
    if (!isWithin(cwd, absolute)) {
      throw new Error(`Upstream execution closure escapes its cwd: ${absolute}`);
    }
    const info = await lstat(absolute);
    assertTrustedOwnership(absolute, info);
    const relativePath = relative(cwd, absolute).split(sep).join("/");
    if (info.isSymbolicLink()) {
      const target = await readlink(absolute);
      seals.push(sealFor(absolute, info, "symlink", target));
      entries.push({ path: relativePath, kind: "symlink", target, bytes: 0 });
      const resolvedTarget = await realpath(absolute);
      if (!isWithin(cwd, resolvedTarget)) {
        throw new Error(
          `Upstream dependency symlink escapes its reviewed cwd: ${absolute}`,
        );
      }
      await visit(resolvedTarget);
      return;
    }
    if (info.isDirectory()) {
      const realDirectory = await realpath(absolute);
      if (visitedDirectories.has(realDirectory)) {
        return;
      }
      visitedDirectories.add(realDirectory);
      seals.push(sealFor(absolute, info, "directory"));
      entries.push({ path: relativePath, kind: "directory", bytes: 0 });
      const children = await readdir(absolute);
      for (const child of children.toSorted()) {
        await visit(join(absolute, child));
      }
      return;
    }
    if (!info.isFile()) {
      throw new Error(
        `Upstream execution closure contains an unsupported file type: ${absolute}`,
      );
    }
    if (visitedFiles.has(absolute)) {
      return;
    }
    visitedFiles.add(absolute);
    const file = await hashOpenFile(absolute, info);
    seals.push(sealFor(absolute, info, "file", undefined, file.sha256));
    entries.push({
      path: relativePath,
      kind: "file",
      bytes: file.bytes,
      sha256: file.sha256,
    });
  };

  for (const root of roots) {
    await visit(root);
  }
  await assertPathSealsCurrent(seals);

  const sortedEntries = entries.toSorted((left, right) => {
    const pathOrder = left.path.localeCompare(right.path);
    return pathOrder === 0 ? left.kind.localeCompare(right.kind) : pathOrder;
  });
  const closureHash = createHash("sha256");
  for (const entry of sortedEntries) {
    closureHash.update(entry.kind);
    closureHash.update("\0");
    closureHash.update(entry.path);
    closureHash.update("\0");
    closureHash.update(String(entry.bytes));
    closureHash.update("\0");
    closureHash.update(entry.sha256 ?? entry.target ?? "");
    closureHash.update("\n");
  }
  const implementationFiles = sortedEntries.filter(
    (entry) =>
      entry.kind === "file" &&
      isWithin(implementationRoot, join(cwd, entry.path)) &&
      /\.(c?m?js|json)$/iu.test(entry.path),
  );
  const implementationHash = createHash("sha256");
  for (const entry of implementationFiles) {
    implementationHash.update(
      relative(implementationRoot, join(cwd, entry.path))
        .split(sep)
        .join("/"),
    );
    implementationHash.update("\0");
    implementationHash.update(entry.sha256 ?? "");
    implementationHash.update("\n");
  }
  const entryHashes = new Map(
    sortedEntries.flatMap((entry) =>
      entry.kind === "file" && entry.sha256 !== undefined
        ? [[resolve(cwd, entry.path), entry.sha256] as const]
        : [],
    ),
  );
  return {
    dependencyLockSha256: entryHashes.get(dependencyLockPath) ?? "",
    entryHashes,
    fingerprint: {
      root: cwd,
      directoryCount: sortedEntries.filter(
        (entry) => entry.kind === "directory",
      ).length,
      fileCount: sortedEntries.filter((entry) => entry.kind === "file").length,
      symlinkCount: sortedEntries.filter((entry) => entry.kind === "symlink")
        .length,
      totalBytes: sortedEntries.reduce(
        (total, entry) => total + entry.bytes,
        0,
      ),
      sha256: closureHash.digest("hex"),
    },
    implementationTree: {
      root: implementationRoot,
      fileCount: implementationFiles.length,
      sha256: implementationHash.digest("hex"),
    },
    seals,
  };
}

async function captureTrustedFile(
  path: string,
  allowRootOwner = false,
): Promise<{
  readonly seal: PathSeal;
  readonly sha256: string;
}> {
  const info = await lstat(path);
  if (info.isSymbolicLink() || !info.isFile()) {
    throw new Error(`Trusted launcher path must be a regular file: ${path}`);
  }
  assertTrustedOwnership(path, info, allowRootOwner);
  const file = await hashOpenFile(path, info);
  return {
    seal: sealFor(path, info, "file", undefined, file.sha256),
    sha256: file.sha256,
  };
}

function configuredSandboxCommand(): string {
  const command =
    process.env["EASYEDA_BWRAP_COMMAND"] ?? DEFAULT_SANDBOX_COMMAND;
  if (!isAbsolute(command)) {
    throw new Error("EASYEDA_BWRAP_COMMAND must be an absolute path.");
  }
  return resolve(command);
}

async function sha256OpenHandle(
  handle: FileHandle,
  expected: Stats,
  label: string,
): Promise<string> {
  const before = await handle.stat();
  if (!before.isFile() || !sameIdentity(before, expected)) {
    throw new Error(`${label} descriptor identity changed.`);
  }
  const hash = createHash("sha256");
  const buffer = Buffer.allocUnsafe(64 * 1024);
  let position = 0;
  while (position < before.size) {
    const { bytesRead } = await handle.read(
      buffer,
      0,
      Math.min(buffer.length, before.size - position),
      position,
    );
    if (bytesRead === 0) {
      throw new Error(`${label} ended before its recorded byte length.`);
    }
    hash.update(buffer.subarray(0, bytesRead));
    position += bytesRead;
  }
  const after = await handle.stat();
  if (!sameIdentity(before, after)) {
    throw new Error(`${label} changed while its bytes were captured.`);
  }
  return hash.digest("hex");
}

async function openReviewedExecutable(
  path: string,
  expectedSha256: string,
  label: string,
  allowRootOwner: boolean,
): Promise<ReviewedExecutable> {
  const absolute = resolve(path);
  const pathInfo = await lstat(absolute);
  if (pathInfo.isSymbolicLink() || !pathInfo.isFile()) {
    throw new Error(`${label} must be a regular non-symlink file.`);
  }
  assertTrustedOwnership(absolute, pathInfo, allowRootOwner);
  const handle = await open(
    absolute,
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
  );
  let disposed = false;
  try {
    const assertCurrent = async (): Promise<void> => {
      if (disposed) {
        throw new Error(`${label} descriptor is closed.`);
      }
      const currentPath = await lstat(absolute);
      if (
        !sameIdentity(pathInfo, currentPath) ||
        (await sha256OpenHandle(handle, pathInfo, label)) !== expectedSha256
      ) {
        throw new Error(`${label} changed after review.`);
      }
    };
    const dispose = async (): Promise<void> => {
      if (!disposed) {
        await handle.close();
        disposed = true;
      }
    };
    await assertCurrent();
    return {
      assertCurrent,
      descriptor: handle.fd,
      dispose,
      executionPath: `/proc/${process.pid}/fd/${handle.fd}`,
      handle,
    };
  } catch (error) {
    await handle.close();
    throw error;
  }
}

async function collectSandboxProbeOutput(
  stream: Readable,
  label: string,
): Promise<string> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  for await (const chunk of stream) {
    if (!Buffer.isBuffer(chunk)) {
      throw new TypeError(`${label} emitted a non-buffer chunk.`);
    }
    totalBytes += chunk.length;
    if (totalBytes > 64 * 1024) {
      throw new Error(`${label} exceeded its diagnostic output limit.`);
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, totalBytes).toString("utf8");
}

async function runSandboxProbe(
  executable: ReviewedExecutable,
  argument: "--help" | "--version",
): Promise<{ readonly stderr: string; readonly stdout: string }> {
  const child = spawn(executable.executionPath, [argument], {
    env: { LANG: "C.UTF-8", LC_ALL: "C.UTF-8", PATH: "/usr/bin:/bin" },
    killSignal: "SIGKILL",
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 5000,
    windowsHide: true,
  });
  if (child.stdout === null || child.stderr === null) {
    child.kill("SIGKILL");
    throw new Error("Reviewed bubblewrap probe pipes are unavailable.");
  }
  const childClosed = Promise.withResolvers<null>();
  child.once("close", () => {
    childClosed.resolve(null);
  });
  child.once("error", (error: Error) => {
    childClosed.reject(error);
  });
  const results = await Promise.allSettled([
    collectSandboxProbeOutput(child.stdout, "Reviewed bubblewrap stdout"),
    collectSandboxProbeOutput(child.stderr, "Reviewed bubblewrap stderr"),
    childClosed.promise,
  ]);
  const failures: unknown[] = [];
  for (const result of results) {
    if (result.status === "rejected") {
      const reason: unknown = result.reason;
      failures.push(reason);
    }
  }
  if (failures.length > 0) {
    throw new AggregateError(
      failures,
      "Reviewed bubblewrap identity probe failed.",
    );
  }
  const stdoutResult = results[0];
  const stderrResult = results[1];
  if (
    stdoutResult?.status !== "fulfilled" ||
    stderrResult?.status !== "fulfilled" ||
    child.exitCode !== 0 ||
    child.signalCode !== null
  ) {
    throw new Error("Reviewed bubblewrap identity probe did not exit cleanly.");
  }
  return { stderr: stderrResult.value, stdout: stdoutResult.value };
}

async function assertReviewedSandboxRuntime(
  executable: ReviewedExecutable,
  expectedVersion: string,
): Promise<void> {
  const version = await runSandboxProbe(executable, "--version");
  if (
    version.stderr.length > 0 ||
    version.stdout !== `bubblewrap ${expectedVersion}\n`
  ) {
    throw new Error("Reviewed bubblewrap reported an unexpected exact version.");
  }
  const help = await runSandboxProbe(executable, "--help");
  if (help.stderr.length > 0) {
    throw new Error("Reviewed bubblewrap help emitted unexpected stderr.");
  }
  for (const option of REQUIRED_SANDBOX_OPTIONS) {
    if (!help.stdout.includes(`${option} `)) {
      throw new Error(`Reviewed bubblewrap does not expose required ${option}.`);
    }
  }
}

export async function openReviewedSandboxExecutable(
  expected: UpstreamLauncherFingerprint["sandbox"],
): Promise<ReviewedExecutable> {
  if (
    expected.command !== configuredSandboxCommand() ||
    expected.version !== REVIEWED_SANDBOX_VERSION
  ) {
    throw new Error("The configured bubblewrap identity differs from review.");
  }
  const executable = await openReviewedExecutable(
    expected.command,
    expected.commandSha256,
    "Reviewed bubblewrap executable",
    true,
  );
  try {
    await assertReviewedSandboxRuntime(executable, expected.version);
    return executable;
  } catch (error) {
    await executable.dispose();
    throw error;
  }
}

export function openReviewedNodeExecutable(
  command: string,
  expectedSha256: string,
): Promise<ReviewedExecutable> {
  return openReviewedExecutable(
    command,
    expectedSha256,
    "Reviewed Node executable",
    false,
  );
}

async function captureLauncherFingerprintAt(
  commandPath: string,
  args: [string],
  cwd: string,
): Promise<LauncherCapture> {
  const commandRealPath = await realpath(commandPath);
  const currentNodeRealPath = await realpath(process.execPath);
  if (commandRealPath !== currentNodeRealPath) {
    throw new Error(
      "The reviewed upstream command must be the same Node executable running the facade.",
    );
  }
  const entrypointPath = resolve(args[0] ?? "");
  if ((await realpath(cwd)) !== cwd) {
    throw new Error("EASYEDA_UPSTREAM_CWD must not traverse a symbolic link.");
  }
  const cwdInfo = await lstat(cwd);
  if (!cwdInfo.isDirectory() || cwdInfo.isSymbolicLink()) {
    throw new Error("EASYEDA_UPSTREAM_CWD must be a real directory.");
  }
  assertTrustedOwnership(cwd, cwdInfo);
  if (!isWithin(cwd, entrypointPath)) {
    throw new Error("The upstream entrypoint must stay inside its reviewed cwd.");
  }
  if ((await realpath(entrypointPath)) !== entrypointPath) {
    throw new Error("The upstream entrypoint must not traverse a symbolic link.");
  }
  const [dependencyType, dependencyLockPath] =
    await detectDependencyLock(cwd);
  const implementationRoot = dirname(entrypointPath);
  const closure = await captureExecutionClosure(
    cwd,
    implementationRoot,
    dependencyLockPath,
  );
  const sandboxCommand = configuredSandboxCommand();
  const [command, entrypoint, sandbox] = await Promise.all([
    captureTrustedFile(commandPath),
    captureTrustedFile(entrypointPath),
    captureTrustedFile(sandboxCommand, true),
  ]);
  const sandboxExecutable = await openReviewedExecutable(
    sandboxCommand,
    sandbox.sha256,
    "Reviewed bubblewrap executable",
    true,
  );
  try {
    await assertReviewedSandboxRuntime(
      sandboxExecutable,
      REVIEWED_SANDBOX_VERSION,
    );
  } finally {
    await sandboxExecutable.dispose();
  }
  const entrypointSha256 = closure.entryHashes.get(entrypointPath);
  if (
    entrypointSha256 === undefined ||
    entrypointSha256 !== entrypoint.sha256 ||
    closure.dependencyLockSha256.length === 0
  ) {
    throw new Error(
      "The upstream execution closure did not bind its entrypoint and lockfile.",
    );
  }
  const dependencyLock: DependencyLockFingerprint = {
    type: dependencyType,
    path: dependencyLockPath,
    sha256: closure.dependencyLockSha256,
  };
  const moduleGraph = await captureUpstreamModuleGraph(
    cwd,
    entrypointPath,
    closure.seals,
  );
  await assertPathSealsCurrent(
    closure.seals,
    "during reviewed module-graph resolution",
  );
  return {
    fingerprint: {
      command: commandPath,
      commandSha256: command.sha256,
      args,
      entrypoint: entrypointPath,
      entrypointSha256,
      implementationTree: closure.implementationTree,
      executionClosure: closure.fingerprint,
      dependencyLock,
      moduleGraph: moduleGraph.fingerprint,
      sandbox: {
        command: sandboxCommand,
        commandSha256: sandbox.sha256,
        version: REVIEWED_SANDBOX_VERSION,
      },
      cwd,
    },
    moduleGraph,
    seals: [
      sealFor(cwd, cwdInfo, "directory"),
      command.seal,
      sandbox.seal,
      ...closure.seals,
    ],
  };
}

export function captureLauncherFingerprint(): Promise<LauncherCapture> {
  const args = configuredUpstreamArgs();
  const entrypoint = args[0];
  if (entrypoint === undefined) {
    throw new Error("The configured upstream entrypoint is unavailable.");
  }
  return captureLauncherFingerprintAt(
    configuredUpstreamCommand(),
    [entrypoint],
    configuredUpstreamCwd(),
  );
}

async function captureLauncherAdmissionAt(
  expected: UpstreamLauncherFingerprint,
  command: string,
  cwd: string,
  entrypoint: string,
): Promise<LauncherAdmission> {
  const normalizedCommand = resolve(command);
  const normalizedCwd = resolve(cwd);
  const normalizedEntrypoint = resolve(entrypoint);
  if (
    normalizedCommand !== expected.command ||
    normalizedCwd !== expected.cwd ||
    normalizedEntrypoint !== expected.entrypoint ||
    expected.args.length !== 1 ||
    expected.args[0] !== normalizedEntrypoint
  ) {
    throw new Error(
      "Configured upstream command, cwd, or entrypoint differs from the reviewed launcher.",
    );
  }
  if (
    expected.sandbox.command !== configuredSandboxCommand() ||
    expected.sandbox.version !== REVIEWED_SANDBOX_VERSION
  ) {
    throw new Error("The configured bubblewrap identity differs from review.");
  }
  if (
    (await realpath(normalizedCommand)) !== (await realpath(process.execPath))
  ) {
    throw new Error(
      "The reviewed upstream command must be the Node executable running the facade.",
    );
  }
  if ((await realpath(normalizedCwd)) !== normalizedCwd) {
    throw new Error("The reviewed upstream cwd must not traverse a symbolic link.");
  }
  const cwdInfo = await lstat(normalizedCwd);
  if (!cwdInfo.isDirectory() || cwdInfo.isSymbolicLink()) {
    throw new Error("The reviewed upstream cwd must be a real directory.");
  }
  assertTrustedOwnership(normalizedCwd, cwdInfo);
  if (
    !isWithin(normalizedCwd, normalizedEntrypoint) ||
    !isWithin(normalizedCwd, expected.dependencyLock.path)
  ) {
    throw new Error(
      "The reviewed upstream entrypoint and lockfile must remain inside their cwd.",
    );
  }
  const [commandCapture, entrypointCapture, lockCapture, sandboxCapture] =
    await Promise.all([
    captureTrustedFile(normalizedCommand),
    captureTrustedFile(normalizedEntrypoint),
    captureTrustedFile(expected.dependencyLock.path),
      captureTrustedFile(expected.sandbox.command, true),
    ]);
  if (
    commandCapture.sha256 !== expected.commandSha256 ||
    entrypointCapture.sha256 !== expected.entrypointSha256 ||
    lockCapture.sha256 !== expected.dependencyLock.sha256 ||
    sandboxCapture.sha256 !== expected.sandbox.commandSha256
  ) {
    throw new Error(
      "The runtime launcher command, entrypoint, or dependency lock differs from review.",
    );
  }
  const seals = [
    sealFor(normalizedCwd, cwdInfo, "directory"),
    commandCapture.seal,
    entrypointCapture.seal,
    lockCapture.seal,
    sandboxCapture.seal,
  ];
  await assertPathSealsCurrent(seals, "during runtime launcher admission");
  return { fingerprint: expected, seals };
}

export function captureLauncherAdmission(
  override?: UpstreamLauncherFingerprint,
): Promise<LauncherAdmission> {
  const args = configuredUpstreamArgs();
  const entrypoint = args[0];
  if (entrypoint === undefined) {
    throw new Error("The configured upstream entrypoint is unavailable.");
  }
  return captureLauncherAdmissionAt(
    override ?? loadReviewedCompatibilityManifest().upstream.launcher,
    configuredUpstreamCommand(),
    configuredUpstreamCwd(),
    entrypoint,
  );
}

export async function captureRuntimeLauncherExecution(
  expected: UpstreamLauncherFingerprint,
  command: string,
  cwd: string,
  entrypoint: string,
): Promise<LauncherCapture> {
  const admission = await captureLauncherAdmissionAt(
    expected,
    command,
    cwd,
    entrypoint,
  );
  const moduleGraph = await captureUpstreamModuleGraph(cwd, entrypoint);
  if (
    canonicalJson(moduleGraph.fingerprint) !== canonicalJson(expected.moduleGraph)
  ) {
    throw new Error(
      "The captured runtime module graph differs from the reviewed graph fingerprint.",
    );
  }
  const seals = new Map(
    [...admission.seals, ...moduleGraph.seals].map(
      (seal) => [seal.path, seal] as const,
    ),
  );
  const capturedSeals = [...seals.values()].toSorted((left, right) =>
    left.path.localeCompare(right.path),
  );
  await assertPathSealsCurrent(
    capturedSeals,
    "between runtime graph capture and execution",
  );
  return {
    fingerprint: { ...expected, moduleGraph: moduleGraph.fingerprint },
    moduleGraph,
    seals: capturedSeals,
  };
}

export async function assertPathSealsCurrent(
  seals: readonly PathSeal[],
  boundary = "before spawn",
): Promise<void> {
  const batchSize = 256;
  for (let offset = 0; offset < seals.length; offset += batchSize) {
    await Promise.all(
      seals.slice(offset, offset + batchSize).map(async (seal) => {
        const current = await lstat(seal.path);
        let currentKind = "unsupported";
        if (current.isSymbolicLink()) {
          currentKind = "symlink";
        } else if (current.isDirectory()) {
          currentKind = "directory";
        } else if (current.isFile()) {
          currentKind = "file";
        }
        if (
          currentKind !== seal.kind ||
          current.dev !== seal.dev ||
          current.ino !== seal.ino ||
          current.mode !== seal.mode ||
          current.size !== seal.size ||
          current.mtimeMs !== seal.mtimeMs ||
          current.ctimeMs !== seal.ctimeMs
        ) {
          throw new Error(
            `Trusted upstream execution path changed ${boundary}: ${seal.path}`,
          );
        }
        if (
          seal.kind === "symlink" &&
          (await readlink(seal.path)) !== seal.linkTarget
        ) {
          throw new Error(
            `Trusted upstream symlink changed ${boundary}: ${seal.path}`,
          );
        }
      }),
    );
  }
}

export function assertReviewedLauncherFingerprint(
  actual: UpstreamLauncherFingerprint,
  override?: UpstreamLauncherFingerprint,
): true {
  const expected =
    override ?? loadReviewedCompatibilityManifest().upstream.launcher;
  if (canonicalJson(actual) !== canonicalJson(expected)) {
    throw new Error(
      "Refusing to execute the upstream MCP because its complete pre-spawn launcher and dependency closure does not match the reviewed compatibility manifest.",
    );
  }
  return true;
}

export function launcherFingerprintSha256(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}
