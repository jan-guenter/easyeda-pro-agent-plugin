import { constants as fsConstants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, mkdtemp, open, readdir, rmdir } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import process from "node:process";

export interface PrivateTemporaryDirectory {
  readonly descriptorPath: string;
  readonly device: bigint;
  readonly handle: FileHandle;
  readonly inode: bigint;
  readonly path: string;
}

function permissionMode(mode: bigint): number {
  return Number(mode % 512n);
}

function errorCode(error: unknown): string | undefined {
  return error !== null && typeof error === "object" && "code" in error
    ? String(error.code)
    : undefined;
}

async function removeOptionalEmptyChildDirectory(
  directory: PrivateTemporaryDirectory,
  name: string,
  label: string,
): Promise<void> {
  if (name.length === 0 || name.includes("/")) {
    throw new Error(`${label} cleanup child must be one path segment.`);
  }
  const path = `${directory.descriptorPath}/${name}`;
  let pathInformation: BigIntStats;
  try {
    pathInformation = await lstat(path, { bigint: true });
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return;
    }
    throw error;
  }
  if (
    !pathInformation.isDirectory() ||
    pathInformation.isSymbolicLink() ||
    permissionMode(pathInformation.mode) !== 0o700 ||
    (typeof process.getuid === "function" &&
      pathInformation.uid !== BigInt(process.getuid()))
  ) {
    throw new Error(`${label} cleanup child is not a private directory.`);
  }
  const handle = await open(
    path,
    fsConstants.O_RDONLY +
      fsConstants.O_DIRECTORY +
      fsConstants.O_NOFOLLOW,
  );
  try {
    const information = await handle.stat({ bigint: true });
    if (
      !information.isDirectory() ||
      information.dev !== pathInformation.dev ||
      information.ino !== pathInformation.ino
    ) {
      throw new Error(`${label} cleanup child identity changed.`);
    }
    const entries = await readdir(`/proc/self/fd/${handle.fd}`);
    if (entries.length > 0) {
      throw new Error(
        `${label} cleanup child is not empty; refusing recursive cleanup.`,
      );
    }
    await rmdir(path);
    await directory.handle.sync();
  } finally {
    await handle.close();
  }
}

export async function createPrivateTemporaryDirectory(
  prefix: string,
  label: string,
): Promise<PrivateTemporaryDirectory> {
  const path = await mkdtemp(prefix);
  let handle: FileHandle | undefined;
  try {
    handle = await open(
      path,
      fsConstants.O_RDONLY +
        fsConstants.O_DIRECTORY +
        fsConstants.O_NOFOLLOW,
    );
    await handle.chmod(0o700);
    const [information, pathInformation] = await Promise.all([
      handle.stat({ bigint: true }),
      lstat(path, { bigint: true }),
    ]);
    if (
      !information.isDirectory() ||
      !pathInformation.isDirectory() ||
      pathInformation.isSymbolicLink() ||
      information.dev !== pathInformation.dev ||
      information.ino !== pathInformation.ino ||
      permissionMode(information.mode) !== 0o700 ||
      permissionMode(pathInformation.mode) !== 0o700 ||
      (typeof process.getuid === "function" &&
        (information.uid !== BigInt(process.getuid()) ||
          pathInformation.uid !== BigInt(process.getuid())))
    ) {
      throw new Error(`${label} is not an owner-owned mode-0700 directory.`);
    }
    return {
      descriptorPath: `/proc/self/fd/${handle.fd}`,
      device: information.dev,
      handle,
      inode: information.ino,
      path,
    };
  } catch (error) {
    const failures: unknown[] = [error];
    await handle?.close().catch((closeError: unknown) => {
      failures.push(closeError);
    });
    await rmdir(path).catch((removeError: unknown) => {
      failures.push(removeError);
    });
    if (failures.length > 1) {
      throw new AggregateError(
        failures,
        `${label} creation and cleanup both failed.`,
        { cause: error },
      );
    }
    throw error;
  }
}

export async function removeEmptyPrivateTemporaryDirectory(
  directory: PrivateTemporaryDirectory,
  label: string,
  expectedEmptyChildDirectories: readonly string[] = [],
): Promise<void> {
  const failures: unknown[] = [];
  try {
    for (const name of expectedEmptyChildDirectories) {
      await removeOptionalEmptyChildDirectory(directory, name, label);
    }
    const entries = await readdir(directory.descriptorPath);
    if (entries.length > 0) {
      throw new Error(`${label} is not empty; refusing recursive cleanup.`);
    }
    const [retained, currentPath] = await Promise.all([
      directory.handle.stat({ bigint: true }),
      lstat(directory.path, { bigint: true }),
    ]);
    if (
      !retained.isDirectory() ||
      !currentPath.isDirectory() ||
      currentPath.isSymbolicLink() ||
      retained.dev !== directory.device ||
      retained.ino !== directory.inode ||
      currentPath.dev !== directory.device ||
      currentPath.ino !== directory.inode ||
      permissionMode(retained.mode) !== 0o700 ||
      permissionMode(currentPath.mode) !== 0o700 ||
      (typeof process.getuid === "function" &&
        (retained.uid !== BigInt(process.getuid()) ||
          currentPath.uid !== BigInt(process.getuid())))
    ) {
      throw new Error(`${label} pathname changed before cleanup.`);
    }
    await rmdir(directory.path);
  } catch (error) {
    failures.push(error);
  }
  await directory.handle.close().catch((error: unknown) => {
    failures.push(error);
  });
  if (failures.length === 1) {
    const failure = failures[0];
    throw failure instanceof Error
      ? failure
      : new Error(`${label} cleanup failed.`, { cause: failure });
  }
  if (failures.length > 0) {
    throw new AggregateError(failures, `${label} cleanup was incomplete.`);
  }
}
