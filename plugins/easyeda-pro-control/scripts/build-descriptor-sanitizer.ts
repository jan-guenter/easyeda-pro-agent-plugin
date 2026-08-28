#!/usr/bin/env node
import { execFile } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import type { Stats } from "node:fs";
import {
  lstat,
  mkdtemp,
  open,
  readFile,
  realpath,
  rename,
  rm,
  unlink,
} from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import { promisify } from "node:util";

import {
  DESCRIPTOR_SANITIZER_BYTES,
  DESCRIPTOR_SANITIZER_FILE_NAME,
  DESCRIPTOR_SANITIZER_SHA256,
} from "../server/src/descriptor-sanitizer-identity.ts";

// oxlint-disable-next-line typescript/strict-void-return -- Node's documented promisify overload returns the child result even though the callback overload is void-returning.
const execFileAsync = promisify(execFile);
const pluginRoot = resolve(import.meta.dirname, "..");
const sourcePath = join(
  pluginRoot,
  "server",
  "native",
  "easyeda-fd-sanitizer.S",
);
const linkerScriptPath = join(
  pluginRoot,
  "server",
  "native",
  "easyeda-fd-sanitizer.ld",
);
const committedPath = join(
  pluginRoot,
  "server",
  "bin",
  DESCRIPTOR_SANITIZER_FILE_NAME,
);
const committedDirectory = join(pluginRoot, "server", "bin");
const buildEnvironment = {
  LANG: "C",
  LC_ALL: "C",
  PATH: "/usr/bin:/bin",
};

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function errorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return undefined;
}

function sameIdentity(
  left: Stats,
  right: Stats,
): boolean {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.size === right.size &&
    left.mtimeMs === right.mtimeMs &&
    left.ctimeMs === right.ctimeMs
  );
}

function sameFileObject(left: Stats, right: Stats): boolean {
  return left.dev === right.dev && left.ino === right.ino;
}

async function openReviewedOutputDirectory(): Promise<FileHandle> {
  if ((await realpath(committedDirectory)) !== committedDirectory) {
    throw new Error(
      "The descriptor-sanitizer output directory must not traverse a symbolic link.",
    );
  }
  const pathInformation = await lstat(committedDirectory);
  if (
    !pathInformation.isDirectory() ||
    pathInformation.isSymbolicLink() ||
    (pathInformation.mode & 0o7022) !== 0 ||
    (typeof process.getuid === "function" &&
      pathInformation.uid !== process.getuid())
  ) {
    throw new Error(
      "The descriptor-sanitizer output directory has an unsafe identity or mode.",
    );
  }
  const handle = await open(
    committedDirectory,
    fsConstants.O_RDONLY |
      fsConstants.O_DIRECTORY |
      fsConstants.O_NOFOLLOW,
  );
  const descriptorInformation = await handle.stat();
  if (!sameIdentity(pathInformation, descriptorInformation)) {
    await handle.close();
    throw new Error(
      "The descriptor-sanitizer output directory changed during admission.",
    );
  }
  return handle;
}

async function publishReviewedBinary(bytes: Buffer): Promise<void> {
  const directory = await openReviewedOutputDirectory();
  const descriptorRoot = `/proc/self/fd/${String(directory.fd)}`;
  const temporaryName = `.${DESCRIPTOR_SANITIZER_FILE_NAME}.${randomBytes(16).toString("hex")}.tmp`;
  const temporaryPath = join(descriptorRoot, temporaryName);
  const publishedPath = join(descriptorRoot, DESCRIPTOR_SANITIZER_FILE_NAME);
  let staged: FileHandle | undefined;
  let stagedIdentity: Stats | undefined;
  let stagedObject: Stats | undefined;
  let stagedCreated = false;
  let published = false;
  let publicationError: unknown;
  try {
    staged = await open(
      temporaryPath,
      fsConstants.O_CREAT |
        fsConstants.O_EXCL |
        fsConstants.O_NOFOLLOW |
        fsConstants.O_WRONLY,
      0o755,
    );
    stagedCreated = true;
    stagedObject = await staged.stat();
    if (!stagedObject.isFile() || stagedObject.isSymbolicLink()) {
      throw new Error(
        "The descriptor-sanitizer staging descriptor is not a regular file.",
      );
    }
    await staged.writeFile(bytes);
    await staged.chmod(0o755);
    await staged.sync();
    stagedIdentity = await staged.stat();
    if (
      !stagedIdentity.isFile() ||
      stagedIdentity.isSymbolicLink() ||
      (stagedIdentity.mode & 0o7777) !== 0o755 ||
      stagedIdentity.size !== bytes.length
    ) {
      throw new Error(
        "The staged descriptor sanitizer has an unsafe identity or mode.",
      );
    }
    const existing = await lstat(publishedPath).catch((error: unknown) => {
      if (errorCode(error) === "ENOENT") {
        return null;
      }
      throw error;
    });
    if (
      existing !== null &&
      (existing.isSymbolicLink() || !existing.isFile())
    ) {
      throw new Error(
        "Refusing to replace a non-regular descriptor-sanitizer output.",
      );
    }
    await rename(temporaryPath, publishedPath);
    published = true;
    const [descriptorInformation, pathInformation] = await Promise.all([
      staged.stat(),
      lstat(publishedPath),
    ]);
    if (
      stagedIdentity === undefined ||
      !sameFileObject(stagedIdentity, descriptorInformation) ||
      descriptorInformation.mode !== stagedIdentity.mode ||
      descriptorInformation.size !== stagedIdentity.size ||
      !sameIdentity(descriptorInformation, pathInformation)
    ) {
      throw new Error(
        "The descriptor sanitizer changed during atomic publication.",
      );
    }
    await directory.sync();
  } catch (error) {
    publicationError = error;
  }

  const cleanupErrors: unknown[] = [];
  if (!published && stagedCreated) {
    if (stagedObject === undefined && staged !== undefined) {
      try {
        stagedObject = await staged.stat();
      } catch (error) {
        cleanupErrors.push(error);
      }
    }
    try {
      if (stagedObject === undefined) {
        throw new Error(
          "The descriptor-sanitizer staging identity is unavailable for cleanup.",
        );
      }
      const information = await lstat(temporaryPath);
      if (!sameFileObject(stagedObject, information)) {
        throw new Error(
          "Refusing to remove a changed descriptor-sanitizer staging file.",
        );
      }
      await unlink(temporaryPath);
    } catch (error) {
      if (errorCode(error) !== "ENOENT") {
        cleanupErrors.push(error);
      }
    }
  }
  await staged?.close().catch((error: unknown) => {
    cleanupErrors.push(error);
  });
  await directory.close().catch((error: unknown) => {
    cleanupErrors.push(error);
  });
  if (cleanupErrors.length > 0) {
    throw new AggregateError(
      publicationError === undefined
        ? cleanupErrors
        : [publicationError, ...cleanupErrors],
      "Descriptor-sanitizer publication cleanup was incomplete.",
      publicationError === undefined ? undefined : { cause: publicationError },
    );
  }
  if (publicationError !== undefined) {
    throw publicationError instanceof Error
      ? publicationError
      : new Error("Descriptor-sanitizer publication failed.", {
          cause: publicationError,
        });
  }
}

async function readCommittedBinary(): Promise<Buffer> {
  const pathBefore = await lstat(committedPath);
  if (
    pathBefore.isSymbolicLink() ||
    !pathBefore.isFile() ||
    (pathBefore.mode & 0o7777) !== 0o755
  ) {
    throw new Error(
      "The committed descriptor sanitizer must be a regular mode-0755 file.",
    );
  }
  const handle = await open(
    committedPath,
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
  );
  try {
    const descriptorBefore = await handle.stat();
    if (!sameIdentity(pathBefore, descriptorBefore)) {
      throw new Error(
        "The committed descriptor sanitizer changed before descriptor capture.",
      );
    }
    const bytes = await handle.readFile();
    const [descriptorAfter, pathAfter] = await Promise.all([
      handle.stat(),
      lstat(committedPath),
    ]);
    if (
      !sameIdentity(descriptorBefore, descriptorAfter) ||
      !sameIdentity(descriptorAfter, pathAfter)
    ) {
      throw new Error(
        "The committed descriptor sanitizer changed during descriptor capture.",
      );
    }
    return bytes;
  } finally {
    await handle.close();
  }
}

async function buildOne(directory: string, name: string): Promise<Buffer> {
  const objectPath = join(directory, `${name}.o`);
  const outputPath = join(directory, name);
  await execFileAsync(
    "/usr/bin/as",
    ["--64", "-o", objectPath, sourcePath],
    { env: buildEnvironment },
  );
  await execFileAsync(
    "/usr/bin/ld",
    [
      "-m",
      "elf_x86_64",
      "-static",
      "--build-id=none",
      "-s",
      "-T",
      linkerScriptPath,
      "-o",
      outputPath,
      objectPath,
    ],
    { env: buildEnvironment },
  );
  return readFile(outputPath);
}

function assertReviewedBytes(bytes: Buffer, label: string): void {
  if (
    bytes.length !== DESCRIPTOR_SANITIZER_BYTES ||
    sha256(bytes) !== DESCRIPTOR_SANITIZER_SHA256
  ) {
    throw new Error(
      `${label} differs from the reviewed descriptor-sanitizer identity: ${String(bytes.length)} bytes, SHA-256 ${sha256(bytes)}.`,
    );
  }
}

const mode = process.argv[2];
if (mode !== "--check" && mode !== "--write") {
  throw new Error(
    "Usage: build-descriptor-sanitizer.ts --check|--write",
  );
}

const temporaryDirectory = await mkdtemp(
  join(tmpdir(), "easyeda-fd-sanitizer-build-"),
);
try {
  const [first, second] = await Promise.all([
    buildOne(temporaryDirectory, "first"),
    buildOne(temporaryDirectory, "second"),
  ]);
  if (!first.equals(second)) {
    throw new Error(
      "Repeated descriptor-sanitizer builds were not byte reproducible.",
    );
  }
  assertReviewedBytes(first, "The rebuilt descriptor sanitizer");

  if (mode === "--write") {
    await publishReviewedBinary(first);
  }

  const committed = await readCommittedBinary();
  assertReviewedBytes(committed, "The committed descriptor sanitizer");
  if (!committed.equals(first)) {
    throw new Error(
      "The committed descriptor sanitizer differs from the reproducible build.",
    );
  }
  process.stdout.write(
    `${JSON.stringify({ bytes: committed.length, ok: true, path: committedPath, sha256: sha256(committed) })}\n`,
  );
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true });
}
