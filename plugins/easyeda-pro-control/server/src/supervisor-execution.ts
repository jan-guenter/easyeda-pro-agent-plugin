import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import type { BigIntStats } from "node:fs";
import {
  lstat,
  open,
  realpath,
} from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import process from "node:process";

import { loadReviewedCompatibilityManifest } from "./core.ts";
import type { ManifestFileFingerprint } from "./core.ts";
import { stagePrivateRuntimePayload } from "./private-runtime-payload.ts";

const SUPERVISOR_BUNDLE_NAME = "upstream-supervisor.mjs";

export interface SupervisorExecutionStageOptions {
  readonly afterSourceCapture?: (() => Promise<void>) | undefined;
  readonly expectedFingerprint?: ManifestFileFingerprint | undefined;
  readonly sourcePath?: string | undefined;
}

export interface StagedSupervisorExecution {
  readonly bytes: number;
  readonly descriptor: number;
  readonly path: string;
  readonly sha256: string;
  readonly assertCurrent: () => Promise<void>;
  readonly dispose: () => Promise<void>;
}

function bundledSupervisorPath(): string {
  const bundleDirectory =
    basename(import.meta.filename) === "server.mjs"
      ? import.meta.dirname
      : resolve(import.meta.dirname, "..", "dist");
  return join(bundleDirectory, SUPERVISOR_BUNDLE_NAME);
}

function reviewedSupervisorFingerprint(): ManifestFileFingerprint {
  const expected = loadReviewedCompatibilityManifest().facadeImplementation.bundle.files.find(
    (file) => file.relativePath === SUPERVISOR_BUNDLE_NAME,
  );
  if (expected === undefined) {
    throw new Error(
      "The reviewed facade bundle does not identify its upstream supervisor.",
    );
  }
  return expected;
}

function assertSameIdentity(
  expected: BigIntStats,
  actual: BigIntStats,
  label: string,
): void {
  if (
    !actual.isFile() ||
    expected.dev !== actual.dev ||
    expected.ino !== actual.ino
  ) {
    throw new Error(`${label} path identity changed.`);
  }
}

function assertStableFile(
  before: BigIntStats,
  after: BigIntStats,
  label: string,
): void {
  if (
    before.dev !== after.dev ||
    before.ino !== after.ino ||
    before.size !== after.size ||
    before.mtimeNs !== after.mtimeNs ||
    before.ctimeNs !== after.ctimeNs
  ) {
    throw new Error(`${label} changed while its bytes were captured.`);
  }
}

function permissionMode(mode: bigint): number {
  return Number(mode % 512n);
}

function isGroupOrOtherWritable(mode: bigint): boolean {
  const permissions = permissionMode(mode);
  const groupDigit = Math.floor(permissions / 8) % 8;
  const otherDigit = permissions % 8;
  return (
    groupDigit === 2 ||
    groupDigit === 3 ||
    groupDigit === 6 ||
    groupDigit === 7 ||
    otherDigit === 2 ||
    otherDigit === 3 ||
    otherDigit === 6 ||
    otherDigit === 7
  );
}

async function readStableHandle(
  handle: FileHandle,
  label: string,
): Promise<{ readonly bytes: Buffer; readonly info: BigIntStats }> {
  const before = await handle.stat({ bigint: true });
  if (before.size < 0n || before.size > 64n * 1024n * 1024n) {
    throw new Error(`${label} has an unsupported byte length.`);
  }
  const bytes = Buffer.alloc(Number(before.size));
  let offset = 0;
  while (offset < bytes.length) {
    const result = await handle.read(
      bytes,
      offset,
      bytes.length - offset,
      offset,
    );
    if (result.bytesRead === 0) {
      throw new Error(`${label} ended before its recorded byte length.`);
    }
    offset += result.bytesRead;
  }
  const after = await handle.stat({ bigint: true });
  assertStableFile(before, after, label);
  return { bytes, info: after };
}

async function captureReviewedSupervisor(
  sourcePath: string,
  expected: ManifestFileFingerprint,
): Promise<Buffer> {
  const absolute = resolve(sourcePath);
  if ((await realpath(absolute)) !== absolute) {
    throw new Error(
      "The upstream supervisor source must not traverse symbolic links.",
    );
  }
  const pathInfo = await lstat(absolute, { bigint: true });
  if (pathInfo.isSymbolicLink() || !pathInfo.isFile()) {
    throw new Error(
      "The upstream supervisor source must be a regular non-symlink file.",
    );
  }
  if (
    typeof process.getuid === "function" &&
    pathInfo.uid !== BigInt(process.getuid())
  ) {
    throw new Error("The upstream supervisor source is not owned by this user.");
  }
  if (isGroupOrOtherWritable(pathInfo.mode)) {
    throw new Error(
      "The upstream supervisor source must not be group- or other-writable.",
    );
  }
  const handle = await open(
    absolute,
    fsConstants.O_RDONLY + fsConstants.O_NOFOLLOW,
  );
  try {
    const captured = await readStableHandle(handle, "Upstream supervisor source");
    assertSameIdentity(pathInfo, captured.info, "Upstream supervisor source");
    const sha256 = createHash("sha256").update(captured.bytes).digest("hex");
    if (
      expected.relativePath !== SUPERVISOR_BUNDLE_NAME ||
      expected.bytes !== captured.bytes.length ||
      expected.sha256 !== sha256
    ) {
      throw new Error(
        "The upstream supervisor bytes do not match the reviewed facade bundle.",
      );
    }
    return captured.bytes;
  } finally {
    await handle.close();
  }
}

export async function stageReviewedSupervisorExecution(
  privateDirectory: FileHandle,
  options: Readonly<SupervisorExecutionStageOptions> = {},
): Promise<StagedSupervisorExecution> {
  if (process.platform !== "linux") {
    throw new Error(
      "Descriptor-bound upstream supervisor staging requires Linux /proc file descriptors.",
    );
  }
  const sourcePath = options.sourcePath ?? bundledSupervisorPath();
  const expected =
    options.expectedFingerprint ?? reviewedSupervisorFingerprint();
  const sourceBytes = await captureReviewedSupervisor(sourcePath, expected);
  await options.afterSourceCapture?.();
  let payload;
  try {
    payload = await stagePrivateRuntimePayload(
      sourceBytes,
      privateDirectory,
    );
    if (payload.bytes !== expected.bytes || payload.sha256 !== expected.sha256) {
      throw new Error(
        "The staged upstream supervisor differs from its descriptor-bound reviewed source.",
      );
    }
    return {
      assertCurrent: payload.assertCurrent,
      bytes: payload.bytes,
      descriptor: payload.descriptor,
      dispose: payload.dispose,
      path: `/proc/${process.pid}/fd/${payload.descriptor}`,
      sha256: expected.sha256,
    };
  } catch (error) {
    if (payload !== undefined) {
      try {
        await payload.dispose();
      } catch (cleanupError) {
        throw new AggregateError(
          [error, cleanupError],
          "Upstream supervisor staging and descriptor cleanup both failed.",
          { cause: cleanupError },
        );
      }
    }
    throw error;
  }
}
