import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, open, readFile, stat, unlink } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { basename, join, resolve as resolvePath } from "node:path";
import { spawn } from "node:child_process";
import type { SpawnOptionsWithoutStdio } from "node:child_process";
import { canonicalJson, errorMessage, isRecord, sha256Text } from "./core.ts";

interface RunOptions extends SpawnOptionsWithoutStdio {
  maxBuffer?: unknown;
  maxStderrBuffer?: unknown;
  timeoutMs?: unknown;
}

export interface CheckpointCreateInput {
  readonly source: string;
  readonly outputDir: string;
  readonly label: string;
}

export interface CheckpointReceipt {
  schema: "easyeda-pro-control.checkpoint.v1";
  createdAt: string;
  source: string;
  checkpoint: string;
  sourceSha256: string;
  checkpointSha256: string;
  sourceDumpSha256: string;
  checkpointDumpSha256: string;
  receiptSha256: string;
  receiptPath?: string;
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

function safeLabel(value: string): string {
  const label = value.trim();
  if (!/^[a-z0-9][a-z0-9._-]{0,63}$/iu.test(label)) {
    throw new Error("Checkpoint label must be 1-64 filename-safe characters.");
  }
  return label;
}

function timestampForPath(date: Readonly<Date>): string {
  return date
    .toISOString()
    .replaceAll(/[-:]/gu, "")
    .replace(/\.(\d{3})Z$/u, "$1Z");
}

function sqliteUri(path: string): string {
  return `file:${path}?mode=ro`;
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 2_147_483_647
    ? parsed
    : fallback;
}

function run(
  command: string,
  args: readonly string[],
  options: Readonly<RunOptions> = {},
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const {
      maxBuffer = 256 * 1024 * 1024,
      maxStderrBuffer: requestedMaxStderrBuffer = process.env[
        "EASYEDA_CHECKPOINT_STDERR_MAX_BYTES"
      ],
      timeoutMs: requestedTimeoutMs = process.env[
        "EASYEDA_CHECKPOINT_PROCESS_TIMEOUT_MS"
      ],
      ...spawnOptions
    } = options;
    const checkedMaxBuffer = positiveInteger(maxBuffer, 256 * 1024 * 1024);
    const maxStderrBuffer = positiveInteger(
      requestedMaxStderrBuffer,
      1024 * 1024,
    );
    const timeoutMs = positiveInteger(requestedTimeoutMs, 120_000);
    const child = spawn(command, args, {
      ...spawnOptions,
      stdio: ["ignore", "pipe", "pipe"],
    });
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
    child.stdout.on("data", (chunk: Buffer) => {
      stdoutBytes += chunk.length;
      if (stdoutBytes > checkedMaxBuffer) {
        abort(`${command} stdout exceeded ${checkedMaxBuffer} bytes.`);
      } else {
        stdout.push(chunk);
      }
    });
    child.stderr.on("data", (chunk: Buffer) => {
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

async function quickCheck(path: string): Promise<"ok"> {
  const output = await run("sqlite3", [
    sqliteUri(path),
    "PRAGMA query_only=ON; PRAGMA quick_check;",
  ]);
  const value = output.toString("utf8").trim();
  if (value !== "ok") {
    throw new Error(`SQLite quick_check failed for ${path}: ${value}`);
  }
  return value;
}

async function sha256File(path: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) {
    if (!Buffer.isBuffer(chunk)) {
      throw new TypeError("File stream yielded a non-buffer chunk.");
    }
    hash.update(chunk);
  }
  return hash.digest("hex");
}

async function dumpHash(path: string): Promise<string> {
  const dump = await run("sqlite3", [sqliteUri(path), ".dump"]);
  return createHash("sha256").update(dump).digest("hex");
}

async function syncFile(path: string): Promise<void> {
  const handle = await open(path, "r");
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function syncDirectory(path: string): Promise<void> {
  const handle = await open(path, "r");
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

export async function createCheckpoint({
  source,
  outputDir,
  label,
}: Readonly<CheckpointCreateInput>): Promise<
  CheckpointReceipt & { readonly receiptPath: string }
> {
  const sourcePath = resolvePath(source);
  const destinationDir = resolvePath(outputDir);
  const checkedLabel = safeLabel(label);
  const sourceInfoBefore = await stat(sourcePath);
  if (!sourceInfoBefore.isFile() || sourceInfoBefore.size === 0) {
    throw new Error("Checkpoint source must be a non-empty file.");
  }
  await mkdir(destinationDir, { recursive: true, mode: 0o700 });
  await quickCheck(sourcePath);
  const createdAt = new Date();
  const sourceStem = basename(sourcePath).replace(/\.[^.]+$/u, "") || "EasyEDA";
  const stem = `${sourceStem}-${checkedLabel}-${timestampForPath(createdAt)}`;
  const checkpointPath = join(destinationDir, `${stem}.eprj2`);
  const receiptPath = join(destinationDir, `${stem}.checkpoint.json`);
  let checkpointHandle: FileHandle | undefined;
  let receiptHandle: FileHandle | undefined;
  let checkpointCreated = false;
  let receiptCreated = false;
  try {
    checkpointHandle = await open(checkpointPath, "wx", 0o600);
    checkpointCreated = true;
    await checkpointHandle.close();
    checkpointHandle = undefined;

    const escapedTarget = checkpointPath.replaceAll("'", "''");
    await run("sqlite3", [
      "-cmd",
      ".timeout 30000",
      sqliteUri(sourcePath),
      `.backup '${escapedTarget}'`,
    ]);
    await syncFile(checkpointPath);
    await quickCheck(checkpointPath);
    await quickCheck(sourcePath);

    const [sourceDumpSha256, checkpointDumpSha256] = await Promise.all([
      dumpHash(sourcePath),
      dumpHash(checkpointPath),
    ]);
    if (sourceDumpSha256 !== checkpointDumpSha256) {
      throw new Error("Checkpoint dump does not match the source dump.");
    }
    const sourceInfoAfter = await stat(sourcePath);
    const receiptCore = {
      schema: "easyeda-pro-control.checkpoint.v1" as const,
      createdAt: createdAt.toISOString(),
      source: sourcePath,
      checkpoint: checkpointPath,
      sourceStatBefore: {
        size: sourceInfoBefore.size,
        mtimeMs: sourceInfoBefore.mtimeMs,
      },
      sourceStatAfter: {
        size: sourceInfoAfter.size,
        mtimeMs: sourceInfoAfter.mtimeMs,
      },
      sourceSha256: await sha256File(sourcePath),
      checkpointSha256: await sha256File(checkpointPath),
      sourceDumpSha256,
      checkpointDumpSha256,
      quickCheck: { sourceBefore: "ok", sourceAfter: "ok", checkpoint: "ok" },
    };
    const receipt = {
      ...receiptCore,
      receiptSha256: sha256Text(canonicalJson(receiptCore)),
    };
    receiptHandle = await open(receiptPath, "wx", 0o600);
    receiptCreated = true;
    await receiptHandle.writeFile(
      `${JSON.stringify(receipt, null, 2)}\n`,
      "utf8",
    );
    await receiptHandle.sync();
    await receiptHandle.close();
    receiptHandle = undefined;
    await syncDirectory(destinationDir);
    return { ...receipt, receiptPath };
  } catch (error) {
    const cleanupErrors: unknown[] = [];
    for (const handle of [receiptHandle, checkpointHandle]) {
      if (!handle) {
        continue;
      }
      try {
        await handle.close();
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
    }
    const cleanupPaths: (readonly [boolean, string])[] = [
      [receiptCreated, receiptPath],
      [checkpointCreated, checkpointPath],
    ];
    for (const [created, path] of cleanupPaths) {
      if (!created) {
        continue;
      }
      try {
        await unlink(path);
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
    }
    try {
      await syncDirectory(destinationDir);
    } catch (cleanupError) {
      cleanupErrors.push(cleanupError);
    }
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        `Checkpoint creation failed and cleanup was incomplete: ${errorMessage(error)}`,
        { cause: error },
      );
    }
    throw error;
  }
}

function assertCheckpointReceipt(
  value: unknown,
): asserts value is CheckpointReceipt {
  if (
    !isRecord(value) ||
    value["schema"] !== "easyeda-pro-control.checkpoint.v1"
  ) {
    throw new Error("Unexpected checkpoint receipt schema.");
  }
  for (const key of [
    "source",
    "checkpoint",
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
): Promise<CheckpointVerification> {
  const receiptPath = resolvePath(receiptPathInput);
  const parsed: unknown = JSON.parse(await readFile(receiptPath, "utf8"));
  assertCheckpointReceipt(parsed);
  const receipt = parsed;
  const { receiptSha256, ...receiptCore } = receipt;
  delete receiptCore.receiptPath;
  if (receiptSha256 !== sha256Text(canonicalJson(receiptCore))) {
    throw new Error("Checkpoint receipt hash is invalid.");
  }
  await quickCheck(receipt.source);
  await quickCheck(receipt.checkpoint);
  const [
    sourceSha256,
    checkpointSha256,
    sourceDumpSha256,
    checkpointDumpSha256,
  ] = await Promise.all([
    sha256File(receipt.source),
    sha256File(receipt.checkpoint),
    dumpHash(receipt.source),
    dumpHash(receipt.checkpoint),
  ]);
  const sourceMatchesReceipt =
    sourceSha256 === receipt.sourceSha256 &&
    sourceDumpSha256 === receipt.sourceDumpSha256;
  const checkpointMatchesReceipt =
    checkpointSha256 === receipt.checkpointSha256 &&
    checkpointDumpSha256 === receipt.checkpointDumpSha256;
  const sourceEqualsCheckpoint = sourceDumpSha256 === checkpointDumpSha256;
  const ok =
    sourceMatchesReceipt && checkpointMatchesReceipt && sourceEqualsCheckpoint;
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
}
