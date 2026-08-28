import { createHash, randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import type { BigIntStats } from "node:fs";
import {
  link,
  lstat,
  mkdir,
  open,
  realpath,
  unlink,
} from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve as resolvePath,
} from "node:path";
import { spawn } from "node:child_process";
import { DatabaseSync } from "node:sqlite";
import { canonicalJson, errorMessage, isRecord, sha256Text } from "./core.ts";
import type { ControlRootCapability } from "./control-root.ts";

interface RunOptions {
  readonly maxBuffer?: unknown;
  readonly maxStderrBuffer?: unknown;
  readonly timeoutMs?: unknown;
}

interface FileIdentity {
  readonly birthtimeNs: string;
  readonly ctimeNs: string;
  readonly dev: string;
  readonly ino: string;
}

interface BoundDirectory {
  readonly absolute: string;
  readonly controlRoot?: ControlRootCapability;
  readonly handle: FileHandle;
  readonly info: BigIntStats;
}

interface BoundFile {
  readonly absolute: string;
  readonly boundPath: string;
  readonly directory: BoundDirectory;
  readonly handle: FileHandle;
  readonly info: BigIntStats;
}

interface SourceSnapshot {
  readonly dataVersion: number;
  readonly dumpSha256: string;
  readonly file: BoundFile;
  readonly sha256: string;
  readonly stat: BigIntStats;
}

export interface CheckpointCreateInput {
  readonly source: string;
  readonly outputDir: string;
  readonly label: string;
}

export interface CheckpointAccessPolicy {
  readonly artifactRoots: readonly string[];
  readonly controlRoot?: ControlRootCapability;
  readonly expectedSource: string;
}

export interface CheckpointReceipt {
  schema: "easyeda-pro-control.checkpoint.v2";
  createdAt: string;
  source: string;
  checkpoint: string;
  sourceIdentity: FileIdentity;
  checkpointIdentity: FileIdentity;
  sourceSha256: string;
  checkpointSha256: string;
  sourceDumpSha256: string;
  checkpointDumpSha256: string;
  receiptSha256: string;
  receiptPath: string;
  [key: string]: unknown;
}

export interface CheckpointVerification {
  readonly checkpoint: string;
  readonly checkpointDumpSha256: string;
  readonly checkpointMatchesReceipt: boolean;
  readonly checkpointSha256: string;
  readonly ok: boolean;
  readonly receiptPath: string;
  readonly source: string;
  readonly sourceChanged: boolean;
  readonly sourceDumpSha256: string;
  readonly sourceEqualsCheckpoint: boolean;
  readonly sourceMatchesReceipt: boolean;
  readonly sourceSha256: string;
  readonly [key: string]: unknown;
}

const SQLITE_BINARY_CANDIDATES = [
  "/usr/bin/sqlite3",
  "/usr/local/bin/sqlite3",
] as const;
const MAX_STABLE_SNAPSHOT_ATTEMPTS = 3;

function policyAbsolutePath(path: string, label: string): string {
  if (!isAbsolute(path)) {
    throw new Error(`${label} must be an absolute path.`);
  }
  return resolvePath(path);
}

function isWithinRoot(root: string, candidate: string): boolean {
  const relation = relative(root, candidate);
  return (
    relation.length === 0 ||
    (relation !== ".." && !relation.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`))
  );
}

function assertPolicySource(
  source: string,
  policy: Readonly<CheckpointAccessPolicy> | undefined,
): void {
  if (!policy) {
    return;
  }
  const expected = policyAbsolutePath(
    policy.expectedSource,
    "Expected checkpoint source",
  );
  if (!/\.eprj2$/iu.test(expected)) {
    throw new Error("Expected checkpoint source must identify an .eprj2 file.");
  }
  if (source !== expected) {
    throw new Error(
      "Checkpoint source does not match the authorized active project database.",
    );
  }
}

function assertPolicyArtifact(
  path: string,
  policy: Readonly<CheckpointAccessPolicy> | undefined,
  label: string,
): void {
  if (!policy) {
    return;
  }
  if (policy.artifactRoots.length === 0) {
    throw new Error("Checkpoint policy requires at least one artifact root.");
  }
  const authorized = policy.artifactRoots.some((root) =>
    isWithinRoot(policyAbsolutePath(root, "Checkpoint artifact root"), path),
  );
  if (!authorized) {
    throw new Error(`${label} is outside the authorized checkpoint roots.`);
  }
}

function assertDescriptorPathsAvailable(): void {
  if (process.platform !== "linux") {
    throw new Error(
      "Checkpoint identity binding requires Linux /proc file descriptors.",
    );
  }
}

function safeLabel(value: string): string {
  const label = value.trim();
  if (!/^[a-z0-9][a-z0-9._-]{0,63}$/iu.test(label)) {
    throw new Error("Checkpoint label must be 1-64 filename-safe characters.");
  }
  return label;
}

function safeSourceStem(path: string): string {
  const raw = basename(path).replace(/\.[^.]+$/u, "");
  const safe = raw
    .normalize("NFKC")
    .replaceAll(/[^a-z0-9._-]+/giu, "-")
    .replaceAll(/^-+|-+$/gu, "")
    .slice(0, 80);
  return safe.length > 0 ? safe : "EasyEDA";
}

function timestampForPath(date: Readonly<Date>): string {
  return date
    .toISOString()
    .replaceAll(/[-:]/gu, "")
    .replace(/\.(\d{3})Z$/u, "$1Z");
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 2_147_483_647
    ? parsed
    : fallback;
}

function identityOf(info: BigIntStats): FileIdentity {
  return {
    birthtimeNs: info.birthtimeNs.toString(),
    ctimeNs: info.ctimeNs.toString(),
    dev: info.dev.toString(),
    ino: info.ino.toString(),
  };
}

function isSameIdentity(left: BigIntStats, right: BigIntStats): boolean {
  return (
    left.isFile() &&
    right.isFile() &&
    left.dev === right.dev &&
    left.ino === right.ino
  );
}

function assertSameIdentity(
  expected: BigIntStats,
  actual: BigIntStats,
  label: string,
): void {
  if (!isSameIdentity(expected, actual)) {
    throw new Error(`${label} path identity changed.`);
  }
}

function assertStableFile(
  before: BigIntStats,
  after: BigIntStats,
  label: string,
): void {
  if (
    !isSameIdentity(before, after) ||
    before.size !== after.size ||
    before.mtimeNs !== after.mtimeNs ||
    before.ctimeNs !== after.ctimeNs
  ) {
    throw new Error(`${label} changed while it was being read.`);
  }
}

function assertManagedFileAuthority(
  directory: BoundDirectory,
  information: BigIntStats,
  label: string,
  expectedLinkCount = 1n,
): void {
  if (
    directory.controlRoot !== undefined &&
    (information.nlink !== expectedLinkCount ||
      (typeof process.getuid === "function" &&
        information.uid !== BigInt(process.getuid())))
  ) {
    throw new Error(
      `${label} must be a current-user-owned single-link managed file.`,
    );
  }
}

function boundChildPath(directory: BoundDirectory, name: string): string {
  if (name.includes("/") || name.length === 0) {
    throw new Error("Bound child name must be one nonempty path segment.");
  }
  return `/proc/self/fd/${directory.handle.fd}/${name}`;
}

async function openBoundDirectory(
  input: string,
  create: boolean,
  controlRoot?: ControlRootCapability,
): Promise<BoundDirectory> {
  assertDescriptorPathsAvailable();
  const absolute = resolvePath(input);
  if (controlRoot && isWithinRoot(controlRoot.path, absolute)) {
    const opened = await controlRoot.openDirectory(absolute, create);
    return {
      absolute,
      controlRoot,
      handle: opened.handle,
      info: opened.info,
    };
  }
  const segments = absolute.split("/").filter(Boolean);
  let currentPath = "/";
  let currentHandle = await open(
    "/",
    fsConstants.O_RDONLY |
      fsConstants.O_DIRECTORY |
      fsConstants.O_NOFOLLOW,
  );
  try {
    for (const segment of segments) {
      const childPath = `/proc/self/fd/${currentHandle.fd}/${segment}`;
      let before: BigIntStats;
      try {
        before = await lstat(childPath, { bigint: true });
      } catch (error) {
        if (
          !create ||
          !isRecord(error) ||
          error["code"] !== "ENOENT"
        ) {
          throw error;
        }
        await mkdir(childPath, { mode: 0o700 });
        before = await lstat(childPath, { bigint: true });
      }
      if (before.isSymbolicLink() || !before.isDirectory()) {
        throw new Error(
          `Checkpoint directory path contains a non-directory or symbolic link: ${join(currentPath, segment)}`,
        );
      }
      const childHandle = await open(
        childPath,
        fsConstants.O_RDONLY |
          fsConstants.O_DIRECTORY |
          fsConstants.O_NOFOLLOW,
      );
      try {
        const info = await childHandle.stat({ bigint: true });
        if (
          !info.isDirectory() ||
          before.dev !== info.dev ||
          before.ino !== info.ino
        ) {
          throw new Error(
            `Checkpoint directory identity changed: ${join(currentPath, segment)}`,
          );
        }
      } catch (error) {
        await childHandle.close();
        throw error;
      }
      await currentHandle.close();
      currentHandle = childHandle;
      currentPath = join(currentPath, segment);
    }
    const info = await currentHandle.stat({ bigint: true });
    return { absolute, handle: currentHandle, info };
  } catch (error) {
    await currentHandle.close();
    throw error;
  }
}

async function assertDirectoryPathIdentity(
  directory: BoundDirectory,
): Promise<void> {
  const current = await openBoundDirectory(
    directory.absolute,
    false,
    directory.controlRoot,
  );
  try {
    if (
      current.info.dev !== directory.info.dev ||
      current.info.ino !== directory.info.ino
    ) {
      throw new Error(
        `Checkpoint directory path changed: ${directory.absolute}`,
      );
    }
  } finally {
    await current.handle.close();
  }
  await directory.controlRoot?.assertCurrent();
}

async function openBoundFile(
  input: string,
  label: string,
  controlRoot?: ControlRootCapability,
): Promise<BoundFile> {
  const absolute = resolvePath(input);
  const directory = await openBoundDirectory(
    dirname(absolute),
    false,
    controlRoot,
  );
  const boundPath = boundChildPath(directory, basename(absolute));
  try {
    const before = await lstat(boundPath, { bigint: true });
    if (before.isSymbolicLink() || !before.isFile()) {
      throw new Error(`${label} must be a regular non-symlink file.`);
    }
    assertManagedFileAuthority(directory, before, label);
    const handle = await open(
      boundPath,
      fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
    );
    try {
      const info = await handle.stat({ bigint: true });
      assertSameIdentity(before, info, label);
      assertManagedFileAuthority(directory, info, label);
      return { absolute, boundPath, directory, handle, info };
    } catch (error) {
      await handle.close();
      throw error;
    }
  } catch (error) {
    await directory.handle.close();
    throw error;
  }
}

async function createBoundFile(
  directory: BoundDirectory,
  name: string,
  label: string,
): Promise<BoundFile> {
  const absolute = join(directory.absolute, name);
  const boundPath = boundChildPath(directory, name);
  const handle = await open(
    boundPath,
    fsConstants.O_CREAT |
      fsConstants.O_EXCL |
      fsConstants.O_RDWR |
      fsConstants.O_NOFOLLOW,
    0o600,
  );
  try {
    await handle.chmod(0o600);
    const info = await handle.stat({ bigint: true });
    if (
      !info.isFile() ||
      info.size !== 0n ||
      info.nlink !== 1n ||
      (info.mode & 0o777n) !== 0o600n ||
      (typeof process.getuid === "function" &&
        info.uid !== BigInt(process.getuid()))
    ) {
      throw new Error(
        `${label} reservation is not a private owner-owned empty regular file.`,
      );
    }
    const current = await lstat(boundPath, { bigint: true });
    assertSameIdentity(info, current, label);
    return { absolute, boundPath, directory, handle, info };
  } catch (error) {
    const cleanupErrors: unknown[] = [];
    try {
      const opened = await handle.stat({ bigint: true });
      const current = await lstat(boundPath, { bigint: true });
      assertSameIdentity(opened, current, `${label} failed reservation`);
      await unlink(boundPath);
      await directory.handle.sync();
    } catch (cleanupError) {
      cleanupErrors.push(cleanupError);
    }
    await handle.close().catch((cleanupError: unknown) => {
      cleanupErrors.push(cleanupError);
    });
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        `${label} reservation failed and cleanup was incomplete: ${errorMessage(error)}`,
        { cause: error },
      );
    }
    throw error;
  }
}

async function unlinkBoundFile(
  file: BoundFile,
  label: string,
  expectedLinkCount = 1n,
): Promise<void> {
  const current = await lstat(file.boundPath, { bigint: true });
  assertSameIdentity(file.info, current, label);
  assertManagedFileAuthority(
    file.directory,
    current,
    label,
    expectedLinkCount,
  );
  await unlink(file.boundPath);
  await file.directory.handle.sync();
}

async function closeBoundFile(file: BoundFile): Promise<void> {
  await file.handle.close();
  await file.directory.handle.close();
}

async function readStableText(file: BoundFile, label: string): Promise<string> {
  const before = await file.handle.stat({ bigint: true });
  const text = await file.handle.readFile("utf8");
  const after = await file.handle.stat({ bigint: true });
  assertStableFile(before, after, label);
  assertManagedFileAuthority(file.directory, after, label);
  return text;
}

async function sha256Handle(
  handle: FileHandle,
  label: string,
): Promise<{ readonly info: BigIntStats; readonly sha256: string }> {
  const before = await handle.stat({ bigint: true });
  const hash = createHash("sha256");
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  let position = 0;
  while (true) {
    const { bytesRead } = await handle.read(
      buffer,
      0,
      buffer.length,
      position,
    );
    if (bytesRead === 0) {
      break;
    }
    hash.update(buffer.subarray(0, bytesRead));
    position += bytesRead;
  }
  const after = await handle.stat({ bigint: true });
  assertStableFile(before, after, label);
  return { info: after, sha256: hash.digest("hex") };
}

async function trustedSqliteBinary(): Promise<string> {
  for (const candidate of SQLITE_BINARY_CANDIDATES) {
    try {
      const [resolved, info] = await Promise.all([
        realpath(candidate),
        lstat(candidate, { bigint: true }),
      ]);
      if (
        resolved === candidate &&
        info.isFile() &&
        info.uid === 0n &&
        (info.mode & 0o022n) === 0n
      ) {
        return candidate;
      }
    } catch {
      // Try the next fixed system location.
    }
  }
  throw new Error(
    "A root-owned, non-writable SQLite CLI was not found at a fixed system path.",
  );
}

async function runSqliteDump(
  handle: FileHandle,
  options: Readonly<RunOptions> = {},
): Promise<Buffer> {
  const command = await trustedSqliteBinary();
  return new Promise<Buffer>((resolve, reject) => {
    const checkedMaxBuffer = positiveInteger(
      options.maxBuffer ?? process.env["EASYEDA_CHECKPOINT_STDOUT_MAX_BYTES"],
      256 * 1024 * 1024,
    );
    const maxStderrBuffer = positiveInteger(
      options.maxStderrBuffer ??
        process.env["EASYEDA_CHECKPOINT_STDERR_MAX_BYTES"],
      1024 * 1024,
    );
    const timeoutMs = positiveInteger(
      options.timeoutMs ?? process.env["EASYEDA_CHECKPOINT_PROCESS_TIMEOUT_MS"],
      120_000,
    );
    const child = spawn(
      command,
      [
        "-init",
        "/dev/null",
        "-batch",
        "-readonly",
        "-safe",
        "--",
        "file:/proc/self/fd/3?mode=ro&immutable=1",
        ".dump",
      ],
      {
        cwd: "/",
        env: {
          HOME: "/nonexistent/easyeda-pro-control-sqlite",
          LANG: "C.UTF-8",
          LC_ALL: "C.UTF-8",
          TZ: "UTC",
        },
        stdio: ["ignore", "pipe", "pipe", handle.fd],
      },
    );
    const stdoutStream = child.stdout;
    const stderrStream = child.stderr;
    if (!stdoutStream || !stderrStream) {
      child.kill("SIGKILL");
      reject(new Error("SQLite dump subprocess did not expose output pipes."));
      return;
    }
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let settled = false;
    const timerState: { value?: NodeJS.Timeout } = {};
    const finish = (callback: () => void): void => {
      if (settled) {
        return;
      }
      settled = true;
      if (timerState.value !== undefined) {
        clearTimeout(timerState.value);
      }
      callback();
    };
    const fail = (error: unknown): void => {
      finish(() => {
        reject(error instanceof Error ? error : new Error(errorMessage(error)));
      });
    };
    const abort = (message: string): void => {
      if (settled) {
        return;
      }
      child.kill("SIGKILL");
      fail(new Error(message));
    };
    timerState.value = setTimeout(() => {
      abort(`${command} timed out after ${timeoutMs} ms.`);
    }, timeoutMs);
    stdoutStream.on("data", (chunk: Buffer) => {
      stdoutBytes += chunk.length;
      if (stdoutBytes > checkedMaxBuffer) {
        abort(`${command} stdout exceeded ${checkedMaxBuffer} bytes.`);
      } else {
        stdout.push(chunk);
      }
    });
    stderrStream.on("data", (chunk: Buffer) => {
      stderrBytes += chunk.length;
      if (stderrBytes > maxStderrBuffer) {
        abort(`${command} stderr exceeded ${maxStderrBuffer} bytes.`);
      } else {
        stderr.push(chunk);
      }
    });
    child.once("error", fail);
    child.once("close", (code, signal) => {
      if (settled) {
        return;
      }
      if (code === 0) {
        finish(() => {
          resolve(Buffer.concat(stdout));
        });
      } else {
        fail(
          new Error(
            `${command} failed (${code ?? signal}): ${Buffer.concat(stderr).toString("utf8").trim()}`,
          ),
        );
      }
    });
  });
}

async function dumpHash(handle: FileHandle): Promise<string> {
  const dump = await runSqliteDump(handle);
  return createHash("sha256").update(dump).digest("hex");
}

function openReadOnlyDatabase(path: string): DatabaseSync {
  return new DatabaseSync(path, {
    allowExtension: false,
    defensive: true,
    enableDoubleQuotedStringLiterals: false,
    readOnly: true,
    timeout: 30_000,
  });
}

function quickCheck(database: DatabaseSync, label: string): "ok" {
  const rows = database.prepare("PRAGMA quick_check").all();
  if (
    rows.length !== 1 ||
    !isRecord(rows[0]) ||
    rows[0]["quick_check"] !== "ok"
  ) {
    throw new Error(
      `SQLite quick_check failed for ${label}: ${canonicalJson(rows)}`,
    );
  }
  return "ok";
}

function dataVersion(database: DatabaseSync): number {
  const value = database.prepare("PRAGMA data_version").get();
  if (!isRecord(value) || !Number.isSafeInteger(value["data_version"])) {
    throw new Error("SQLite data_version was unavailable.");
  }
  return Number(value["data_version"]);
}

async function assertBoundPathIdentity(
  file: BoundFile,
  label: string,
): Promise<void> {
  const current = await lstat(file.boundPath, { bigint: true });
  assertSameIdentity(file.info, current, label);
  assertManagedFileAuthority(file.directory, current, label);
  await assertDirectoryPathIdentity(file.directory);
}

async function snapshotToNewFile(
  source: DatabaseSync,
  directory: BoundDirectory,
): Promise<BoundFile> {
  const name = `.easyeda-checkpoint-target-${randomUUID()}.tmp`;
  let file: BoundFile | undefined;
  try {
    file = await createBoundFile(directory, name, "SQLite backup staging file");
    source
      .prepare("VACUUM INTO ?")
      .run(`/proc/self/fd/${file.handle.fd}`);
    await file.handle.sync();
    const current = await file.handle.stat({ bigint: true });
    if (
      !isSameIdentity(file.info, current) ||
      current.size === 0n ||
      current.nlink !== 1n ||
      (current.mode & 0o777n) !== 0o600n ||
      (typeof process.getuid === "function" &&
        current.uid !== BigInt(process.getuid()))
    ) {
      throw new Error(
        "SQLite backup did not remain a private owner-owned nonempty regular file.",
      );
    }
    await assertBoundPathIdentity(file, "SQLite backup");
    return { ...file, info: current };
  } catch (error) {
    const cleanupErrors: unknown[] = [];
    await file?.handle.close().catch((cleanupError: unknown) => {
      cleanupErrors.push(cleanupError);
    });
    try {
      if (file) {
        await unlinkBoundFile(file, "Failed SQLite backup");
      }
    } catch (cleanupError) {
      cleanupErrors.push(cleanupError);
    }
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        `SQLite backup failed and cleanup was incomplete: ${errorMessage(error)}`,
        { cause: error },
      );
    }
    throw error;
  }
}

async function publishBoundFile(
  staging: BoundFile,
  name: string,
  label: string,
): Promise<BoundFile> {
  const publishedPath = boundChildPath(staging.directory, name);
  await link(staging.boundPath, publishedPath);
  try {
    const publishedInfo = await lstat(publishedPath, { bigint: true });
    assertSameIdentity(staging.info, publishedInfo, `Published ${label}`);
    // Publication briefly gives this exact inode two names.
    // Require exactly two links before removing only the staging name.
    await unlinkBoundFile(staging, `${label} staging file`, 2n);
    const current = await lstat(publishedPath, { bigint: true });
    assertSameIdentity(staging.info, current, `Published ${label}`);
    if (
      current.nlink !== 1n ||
      (current.mode & 0o777n) !== 0o600n ||
      (typeof process.getuid === "function" &&
        current.uid !== BigInt(process.getuid()))
    ) {
      throw new Error(
        `Published ${label} is not a private owner-owned single-link file.`,
      );
    }
    return {
      absolute: join(staging.directory.absolute, name),
      boundPath: publishedPath,
      directory: staging.directory,
      handle: staging.handle,
      info: staging.info,
    };
  } catch (error) {
    const cleanupErrors: unknown[] = [];
    try {
      const current = await lstat(publishedPath, { bigint: true });
      assertSameIdentity(staging.info, current, `Published ${label} cleanup`);
      await unlink(publishedPath);
      await staging.directory.handle.sync();
    } catch (cleanupError) {
      cleanupErrors.push(cleanupError);
    }
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        `${label} publication failed and cleanup was incomplete: ${errorMessage(error)}`,
        { cause: error },
      );
    }
    throw error;
  }
}

async function reopenPublishedFileReadOnly(
  file: BoundFile,
  label: string,
): Promise<BoundFile> {
  const writableInformation = await file.handle.stat({ bigint: true });
  await file.handle.close();
  const before = await lstat(file.boundPath, { bigint: true });
  assertSameIdentity(writableInformation, before, label);
  assertManagedFileAuthority(file.directory, before, label);
  const handle = await open(
    file.boundPath,
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
  );
  try {
    const information = await handle.stat({ bigint: true });
    assertSameIdentity(before, information, label);
    assertManagedFileAuthority(file.directory, information, label);
    return { ...file, handle, info: information };
  } catch (error) {
    await handle.close();
    throw error;
  }
}

async function stableSourceSnapshot(
  sourceFile: BoundFile,
  sourceDatabase: DatabaseSync,
  targetDirectory: BoundDirectory,
): Promise<SourceSnapshot> {
  for (let attempt = 1; attempt <= MAX_STABLE_SNAPSHOT_ATTEMPTS; attempt += 1) {
    const versionBefore = dataVersion(sourceDatabase);
    await assertBoundPathIdentity(sourceFile, "Checkpoint source");
    const target = await snapshotToNewFile(sourceDatabase, targetDirectory);
    try {
      const targetDatabase = openReadOnlyDatabase(
        `/proc/self/fd/${target.handle.fd}`,
      );
      try {
        quickCheck(targetDatabase, target.absolute);
      } finally {
        targetDatabase.close();
      }
      const [dumpSha256, sourceHash] = await Promise.all([
        dumpHash(target.handle),
        sha256Handle(sourceFile.handle, "Checkpoint source"),
      ]);
      await assertBoundPathIdentity(sourceFile, "Checkpoint source");
      const versionAfter = dataVersion(sourceDatabase);
      if (versionBefore === versionAfter) {
        return {
          dataVersion: versionAfter,
          dumpSha256,
          file: target,
          sha256: sourceHash.sha256,
          stat: sourceHash.info,
        };
      }
      await target.handle.close();
      await unlinkBoundFile(target, "Drifted source snapshot");
    } catch (error) {
      const cleanupErrors: unknown[] = [];
      await target.handle.close().catch((cleanupError: unknown) => {
        cleanupErrors.push(cleanupError);
      });
      await unlinkBoundFile(target, "Failed source snapshot").catch(
        (cleanupError: unknown) => {
          cleanupErrors.push(cleanupError);
        },
      );
      if (cleanupErrors.length > 0) {
        throw new AggregateError(
          [error, ...cleanupErrors],
          `Source snapshot failed and cleanup was incomplete: ${errorMessage(error)}`,
          { cause: error },
        );
      }
      throw error;
    }
  }
  throw new Error(
    "Checkpoint source kept changing during three online-backup attempts.",
  );
}

function openTemporarySnapshotDirectory(): Promise<BoundDirectory> {
  return openBoundDirectory(tmpdir(), false);
}

async function makeSnapshotDescriptorOnly(
  file: BoundFile,
  state: { value: boolean },
): Promise<BoundFile> {
  const linked = await lstat(file.boundPath, { bigint: true });
  assertSameIdentity(file.info, linked, "Temporary checkpoint verification snapshot");
  if (
    linked.nlink !== 1n ||
    (linked.mode & 0o777n) !== 0o600n ||
    (typeof process.getuid === "function" &&
      linked.uid !== BigInt(process.getuid()))
  ) {
    throw new Error(
      "Temporary checkpoint verification snapshot is not a private owner-owned single-link file.",
    );
  }
  await unlink(file.boundPath);
  state.value = true;
  await file.directory.handle.sync();
  const detached = await file.handle.stat({ bigint: true });
  if (
    !isSameIdentity(file.info, detached) ||
    detached.nlink !== 0n ||
    (detached.mode & 0o777n) !== 0o600n ||
    (typeof process.getuid === "function" &&
      detached.uid !== BigInt(process.getuid()))
  ) {
    throw new Error(
      "Temporary checkpoint verification snapshot did not become descriptor-only.",
    );
  }
  return { ...file, info: detached };
}

function checkpointStat(info: BigIntStats): Readonly<Record<string, string>> {
  return {
    size: info.size.toString(),
    mtimeNs: info.mtimeNs.toString(),
    ctimeNs: info.ctimeNs.toString(),
  };
}

function storedIdentity(
  receipt: CheckpointReceipt,
  key: "sourceIdentity" | "checkpointIdentity",
): FileIdentity {
  const value = receipt[key];
  const decimal = /^(?:0|[1-9][0-9]*)$/u;
  if (
    !isRecord(value) ||
    typeof value.birthtimeNs !== "string" ||
    !decimal.test(value.birthtimeNs) ||
    typeof value.ctimeNs !== "string" ||
    !decimal.test(value.ctimeNs) ||
    typeof value.dev !== "string" ||
    !decimal.test(value.dev) ||
    typeof value.ino !== "string" ||
    !decimal.test(value.ino)
  ) {
    throw new Error(`Checkpoint receipt ${key} is invalid.`);
  }
  return {
    birthtimeNs: value.birthtimeNs,
    ctimeNs: value.ctimeNs,
    dev: value.dev,
    ino: value.ino,
  };
}

function identityMatches(
  expected: FileIdentity,
  actual: BigIntStats,
): boolean {
  return (
    expected.birthtimeNs === actual.birthtimeNs.toString() &&
    expected.ctimeNs === actual.ctimeNs.toString() &&
    expected.dev === actual.dev.toString() &&
    expected.ino === actual.ino.toString()
  );
}

export async function createCheckpoint({
  source,
  outputDir,
  label,
}: Readonly<CheckpointCreateInput>, policy?: Readonly<CheckpointAccessPolicy>, beforeFinalPathValidation?: () => Promise<void>): Promise<
  CheckpointReceipt & { readonly receiptPath: string }
> {
  const sourcePath = policyAbsolutePath(source, "Checkpoint source");
  const outputPath = policyAbsolutePath(outputDir, "Checkpoint output directory");
  assertPolicySource(sourcePath, policy);
  assertPolicyArtifact(outputPath, policy, "Checkpoint output directory");
  const checkedLabel = safeLabel(label);
  const createdAt = new Date();
  const sourceFile = await openBoundFile(
    sourcePath,
    "Checkpoint source",
    policy?.controlRoot,
  );
  let destination: BoundDirectory | undefined;
  let checkpointFile: BoundFile | undefined;
  let receiptFile: BoundFile | undefined;
  let sourceDatabase: DatabaseSync | undefined;
  let completed = false;
  try {
    if (sourceFile.info.size === 0n) {
      throw new Error("Checkpoint source must be a non-empty file.");
    }
    sourceDatabase = openReadOnlyDatabase(
      `/proc/self/fd/${sourceFile.handle.fd}`,
    );
    await assertBoundPathIdentity(sourceFile, "Checkpoint source");
    quickCheck(sourceDatabase, sourcePath);

    destination = await openBoundDirectory(
      outputPath,
      true,
      policy?.controlRoot,
    );
    const sourceStem = safeSourceStem(sourcePath);
    const stem = `${sourceStem}-${checkedLabel}-${timestampForPath(createdAt)}`;
    const checkpointName = `${stem}.eprj2`;
    const receiptName = `${stem}.checkpoint.json`;
    const receiptPath = join(destination.absolute, receiptName);
    const snapshot = await stableSourceSnapshot(
      sourceFile,
      sourceDatabase,
      destination,
    );
    checkpointFile = snapshot.file;
    checkpointFile = await publishBoundFile(
      checkpointFile,
      checkpointName,
      "checkpoint",
    );
    // Close the writable publication descriptor before recording metadata.
    // Some filesystems defer ctime until this close.
    checkpointFile = await reopenPublishedFileReadOnly(
      checkpointFile,
      "Published checkpoint",
    );
    quickCheck(sourceDatabase, sourcePath);
    if (dataVersion(sourceDatabase) !== snapshot.dataVersion) {
      throw new Error(
        "Checkpoint source changed after its stable snapshot was created.",
      );
    }
    await assertBoundPathIdentity(sourceFile, "Checkpoint source");
    const checkpointHash = await sha256Handle(
      checkpointFile.handle,
      "Checkpoint",
    );
    const receiptCore = {
      schema: "easyeda-pro-control.checkpoint.v2" as const,
      createdAt: createdAt.toISOString(),
      source: sourcePath,
      checkpoint: checkpointFile.absolute,
      receiptPath,
      sourceIdentity: identityOf(snapshot.stat),
      checkpointIdentity: identityOf(checkpointHash.info),
      sourceStatBefore: checkpointStat(sourceFile.info),
      sourceStatAfter: checkpointStat(snapshot.stat),
      sourceDataVersion: snapshot.dataVersion,
      sourceSha256: snapshot.sha256,
      checkpointSha256: checkpointHash.sha256,
      sourceDumpSha256: snapshot.dumpSha256,
      checkpointDumpSha256: snapshot.dumpSha256,
      quickCheck: { sourceBefore: "ok", sourceAfter: "ok", checkpoint: "ok" },
      integrityModel:
        "Unkeyed SHA-256 values detect accidental corruption. They do not authenticate files against a writer with access to this directory.",
    };
    const receipt = {
      ...receiptCore,
      receiptSha256: sha256Text(canonicalJson(receiptCore)),
    };
    receiptFile = await createBoundFile(
      destination,
      `.easyeda-checkpoint-receipt-${randomUUID()}.tmp`,
      "Checkpoint receipt staging file",
    );
    await receiptFile.handle.writeFile(
      `${JSON.stringify(receipt, null, 2)}\n`,
      "utf8",
    );
    await receiptFile.handle.sync();
    receiptFile = await publishBoundFile(
      receiptFile,
      receiptName,
      "checkpoint receipt",
    );
    await beforeFinalPathValidation?.();
    await assertBoundPathIdentity(checkpointFile, "Checkpoint");
    await assertBoundPathIdentity(receiptFile, "Checkpoint receipt");
    await destination.handle.sync();
    completed = true;
    return receipt;
  } catch (error) {
    const cleanupErrors: unknown[] = [];
    for (const file of [receiptFile, checkpointFile]) {
      if (!file) {
        continue;
      }
      try {
        await file.handle.close();
        await unlinkBoundFile(file, "Checkpoint cleanup target");
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
    }
    if (destination) {
      try {
        await destination.handle.sync();
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
    }
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        `Checkpoint creation failed and cleanup was incomplete: ${errorMessage(error)}`,
        { cause: error },
      );
    }
    throw error;
  } finally {
    sourceDatabase?.close();
    await sourceFile.handle.close();
    await sourceFile.directory.handle.close();
    if (completed) {
      await receiptFile?.handle.close();
      await checkpointFile?.handle.close();
    }
    await destination?.handle.close();
  }
}

function assertCheckpointReceipt(
  value: unknown,
): asserts value is CheckpointReceipt {
  if (
    !isRecord(value) ||
    value["schema"] !== "easyeda-pro-control.checkpoint.v2"
  ) {
    throw new Error("Unexpected checkpoint receipt schema.");
  }
  for (const key of [
    "source",
    "checkpoint",
    "receiptPath",
    "sourceSha256",
    "checkpointSha256",
    "sourceDumpSha256",
    "checkpointDumpSha256",
    "receiptSha256",
  ]) {
    if (typeof value[key] !== "string" || value[key].length === 0) {
      throw new Error(`Checkpoint receipt ${key} must be a nonempty string.`);
    }
  }
}

export async function verifyCheckpoint(
  receiptPathInput: string,
  policy?: Readonly<CheckpointAccessPolicy>,
  beforeTemporarySnapshotCleanup?: () => Promise<void>,
): Promise<CheckpointVerification> {
  const receiptPath = resolvePath(receiptPathInput);
  assertPolicyArtifact(receiptPath, policy, "Checkpoint receipt");
  const receiptFile = await openBoundFile(
    receiptPath,
    "Checkpoint receipt",
    policy?.controlRoot,
  );
  let sourceFile: BoundFile | undefined;
  let checkpointFile: BoundFile | undefined;
  let sourceDatabase: DatabaseSync | undefined;
  let temporaryDirectory: BoundDirectory | undefined;
  let temporaryFile: BoundFile | undefined;
  const temporaryFileIsDescriptorOnly = { value: false };
  try {
    const parsed: unknown = JSON.parse(
      await readStableText(receiptFile, "Checkpoint receipt"),
    );
    assertCheckpointReceipt(parsed);
    const receipt = parsed;
    const receiptSource = policyAbsolutePath(
      receipt.source,
      "Checkpoint receipt source",
    );
    const receiptCheckpoint = policyAbsolutePath(
      receipt.checkpoint,
      "Checkpoint receipt artifact",
    );
    const embeddedReceiptPath = policyAbsolutePath(
      receipt.receiptPath,
      "Checkpoint receipt path",
    );
    if (embeddedReceiptPath !== receiptPath) {
      throw new Error(
        "Checkpoint receipt path does not match the exact receipt path opened.",
      );
    }
    assertPolicySource(receiptSource, policy);
    assertPolicyArtifact(
      receiptCheckpoint,
      policy,
      "Checkpoint receipt artifact",
    );
    assertPolicyArtifact(
      embeddedReceiptPath,
      policy,
      "Checkpoint receipt path",
    );
    const { receiptSha256, ...receiptCore } = receipt;
    if (receiptSha256 !== sha256Text(canonicalJson(receiptCore))) {
      throw new Error("Checkpoint receipt hash is invalid.");
    }
    const expectedSourceIdentity = storedIdentity(receipt, "sourceIdentity");
    const expectedCheckpointIdentity = storedIdentity(
      receipt,
      "checkpointIdentity",
    );
    sourceFile = await openBoundFile(
      receiptSource,
      "Checkpoint source",
      policy?.controlRoot,
    );
    checkpointFile = await openBoundFile(
      receiptCheckpoint,
      "Checkpoint artifact",
      policy?.controlRoot,
    );
    sourceDatabase = openReadOnlyDatabase(
      `/proc/self/fd/${sourceFile.handle.fd}`,
    );
    await assertBoundPathIdentity(sourceFile, "Checkpoint source");
    quickCheck(sourceDatabase, receipt.source);

    const checkpointDatabase = openReadOnlyDatabase(
      `/proc/self/fd/${checkpointFile.handle.fd}`,
    );
    try {
      quickCheck(checkpointDatabase, receipt.checkpoint);
    } finally {
      checkpointDatabase.close();
    }
    temporaryDirectory = await openTemporarySnapshotDirectory();
    const sourceSnapshot = await stableSourceSnapshot(
      sourceFile,
      sourceDatabase,
      temporaryDirectory,
    );
    temporaryFile = sourceSnapshot.file;
    temporaryFile = await makeSnapshotDescriptorOnly(
      temporaryFile,
      temporaryFileIsDescriptorOnly,
    );
    const [checkpointHash, checkpointDumpSha256] = await Promise.all([
      sha256Handle(checkpointFile.handle, "Checkpoint artifact"),
      dumpHash(checkpointFile.handle),
    ]);
    await assertBoundPathIdentity(checkpointFile, "Checkpoint artifact");
    const sourceSha256 = sourceSnapshot.sha256;
    const checkpointSha256 = checkpointHash.sha256;
    const sourceDumpSha256 = sourceSnapshot.dumpSha256;
    const sourceMatchesReceipt =
      sourceSha256 === receipt.sourceSha256 &&
      sourceDumpSha256 === receipt.sourceDumpSha256 &&
      identityMatches(expectedSourceIdentity, sourceSnapshot.stat);
    const checkpointMatchesReceipt =
      checkpointSha256 === receipt.checkpointSha256 &&
      checkpointDumpSha256 === receipt.checkpointDumpSha256 &&
      identityMatches(expectedCheckpointIdentity, checkpointHash.info);
    const sourceEqualsCheckpoint =
      sourceDumpSha256 === checkpointDumpSha256;
    const ok =
      sourceMatchesReceipt && checkpointMatchesReceipt && sourceEqualsCheckpoint;
    await beforeTemporarySnapshotCleanup?.();
    return {
      ok,
      receiptPath,
      source: receipt.source,
      checkpoint: receipt.checkpoint,
      sourceMatchesReceipt,
      checkpointMatchesReceipt,
      sourceEqualsCheckpoint,
      sourceChanged: checkpointMatchesReceipt && !sourceMatchesReceipt,
      sourceSha256,
      checkpointSha256,
      sourceDumpSha256,
      checkpointDumpSha256,
    };
  } finally {
    sourceDatabase?.close();
    if (temporaryFile) {
      if (!temporaryFileIsDescriptorOnly.value) {
        await unlinkBoundFile(
          temporaryFile,
          "Temporary checkpoint verification snapshot cleanup",
        );
      }
      await temporaryFile.handle.close();
    }
    if (temporaryDirectory) {
      await temporaryDirectory.handle.close();
    }
    await checkpointFile?.handle.close();
    await checkpointFile?.directory.handle.close();
    await sourceFile?.handle.close();
    await sourceFile?.directory.handle.close();
    await closeBoundFile(receiptFile);
  }
}
