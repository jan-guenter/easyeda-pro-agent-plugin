import { createHash, randomBytes } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, mkdir, open, unlink } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { homedir } from "node:os";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  parse,
  resolve,
  sep,
} from "node:path";

import {
  readBridgeTokenFileHandle,
} from "../server/src/upstream-environment.ts";
import { runWithZeroSoftCoreLimit } from "../server/src/soft-core-limit.ts";

export const AUTHENTICATED_BRIDGE_BUILD_DIRECTORY = "bridge-build";
export const AUTHENTICATED_BRIDGE_OUTPUT_FILENAME =
  "easyeda-pro-control-authenticated-bridge.eext";

function errorCode(error: unknown): string | undefined {
  return error !== null && typeof error === "object" && "code" in error
    ? String(error.code)
    : undefined;
}

function toError(error: unknown, message: string): Error {
  return error instanceof Error ? error : new Error(message, { cause: error });
}

function privatePermissionDigits(mode: number | bigint): string {
  return (Number(mode) % 512).toString(8).padStart(3, "0");
}

function sameIdentity(
  information: { readonly dev: bigint; readonly ino: bigint },
  device: bigint,
  inode: bigint,
): boolean {
  return information.dev === device && information.ino === inode;
}

export interface BridgeTokenProof {
  readonly path: string;
  readonly sha256: string;
  readonly token: string;
}

export interface PrivateDirectoryDescriptor {
  readonly created: boolean;
  readonly descriptorPath: string;
  readonly device: bigint;
  readonly handle: FileHandle;
  readonly inode: bigint;
  readonly path: string;
}

export function bridgeControlDataDirectory(): string {
  const defaultControlDirectory = join(homedir(), ".easyeda-pro-control");
  return resolve(
    process.env["EASYEDA_CONTROL_DATA_DIR"] ?? defaultControlDirectory,
  );
}

export function defaultAuthenticatedBridgeOutputPath(): string {
  return join(
    bridgeControlDataDirectory(),
    AUTHENTICATED_BRIDGE_BUILD_DIRECTORY,
    AUTHENTICATED_BRIDGE_OUTPUT_FILENAME,
  );
}

export function bridgeTokenPathFromArguments(
  cliArguments: readonly string[],
): string {
  const optionIndexes = cliArguments
    .map((argument, index) => (argument === "--token-file" ? index : -1))
    .filter((index) => index !== -1);
  if (optionIndexes.length > 1) {
    throw new Error("--token-file may be specified only once.");
  }
  const optionIndex = optionIndexes[0];
  const explicit =
    optionIndex === undefined ? undefined : cliArguments[optionIndex + 1];
  if (
    optionIndex !== undefined &&
    (explicit === undefined || explicit.length === 0 || explicit.startsWith("--"))
  ) {
    throw new Error("--token-file requires a path.");
  }
  const configured = explicit ?? process.env["EASYEDA_BRIDGE_TOKEN_FILE"];
  return resolve(
    configured ?? join(bridgeControlDataDirectory(), "bridge-token"),
  );
}

export async function assertPrivateDirectoryDescriptorUnchanged(
  directory: PrivateDirectoryDescriptor,
  label: string,
): Promise<void> {
  const [pathInformation, handleInformation] = await Promise.all([
    lstat(directory.path, { bigint: true }),
    directory.handle.stat({ bigint: true }),
  ]);
  if (
    !pathInformation.isDirectory() ||
    pathInformation.isSymbolicLink() ||
    !sameIdentity(pathInformation, directory.device, directory.inode) ||
    !sameIdentity(handleInformation, directory.device, directory.inode) ||
    privatePermissionDigits(pathInformation.mode) !== "700" ||
    privatePermissionDigits(handleInformation.mode) !== "700" ||
    (typeof process.getuid === "function" &&
      handleInformation.uid !== BigInt(process.getuid()))
  ) {
    throw new Error(`${label} changed identity, ownership, or permissions.`);
  }
}

export function privateDirectoryChildDescriptorPath(
  directory: PrivateDirectoryDescriptor,
  childPath: string,
): string {
  if (dirname(childPath) !== directory.path) {
    throw new Error("A private-directory child must use its verified parent.");
  }
  const name = basename(childPath);
  if (name.length === 0 || name === "." || name === "..") {
    throw new Error("The private-directory child name is invalid.");
  }
  return join(directory.descriptorPath, name);
}

async function inspectOrCreateFinalDirectory(
  parentHandle: FileHandle,
  childPath: string,
  isFinalSegment: boolean,
  allowFinalCreation: boolean,
  label: string,
): Promise<{ readonly created: boolean; readonly information: BigIntStats }> {
  try {
    return {
      created: false,
      information: await lstat(childPath, { bigint: true }),
    };
  } catch (error) {
    if (errorCode(error) !== "ENOENT") {
      throw error;
    }
  }
  if (!isFinalSegment) {
    throw new Error(
      `${label} has a missing ancestor. Only its final directory may be created.`,
    );
  }
  if (!allowFinalCreation) {
    throw new Error(`${label} does not exist.`);
  }

  let created = false;
  try {
    await mkdir(childPath, { mode: 0o700 });
    created = true;
    await parentHandle.sync();
  } catch (error) {
    if (errorCode(error) !== "EEXIST") {
      throw error;
    }
  }
  return {
    created,
    information: await lstat(childPath, { bigint: true }),
  };
}

export async function openPrivateDirectoryDescriptor(
  input: string,
  label: string,
  allowFinalCreation = true,
): Promise<PrivateDirectoryDescriptor> {
  if (process.platform !== "linux") {
    throw new Error(`${label} requires Linux descriptor-relative path handling.`);
  }
  if (!isAbsolute(input)) {
    throw new Error(`${label} must be absolute.`);
  }
  const path = resolve(input);
  const root = parse(path).root;
  if (root !== sep) {
    throw new Error(`${label} must use the Linux filesystem root.`);
  }
  const segments = path.slice(root.length).split(sep).filter(Boolean);
  if (segments.length === 0) {
    throw new Error(`${label} must not be the filesystem root.`);
  }

  let currentPath: string = root;
  let currentHandle = await open(
    root,
    fsConstants.O_RDONLY + fsConstants.O_DIRECTORY + fsConstants.O_NOFOLLOW,
  );
  let finalCreated = false;
  try {
    for (const [index, segment] of segments.entries()) {
      const childPath = join(`/proc/self/fd/${currentHandle.fd}`, segment);
      const isFinalSegment = index === segments.length - 1;
      const { created, information: before } =
        await inspectOrCreateFinalDirectory(
          currentHandle,
          childPath,
          isFinalSegment,
          allowFinalCreation,
          label,
        );
      if (before.isSymbolicLink() || !before.isDirectory()) {
        throw new Error(`${label} must not traverse symbolic links.`);
      }
      const childHandle = await open(
        childPath,
        fsConstants.O_RDONLY +
          fsConstants.O_DIRECTORY +
          fsConstants.O_NOFOLLOW,
      );
      try {
        if (created) {
          await childHandle.chmod(0o700);
          await childHandle.sync();
        }
        const opened = await childHandle.stat({ bigint: true });
        if (
          !opened.isDirectory() ||
          before.dev !== opened.dev ||
          before.ino !== opened.ino
        ) {
          throw new Error(`${label} changed during descriptor traversal.`);
        }
      } catch (error) {
        await childHandle.close();
        throw error;
      }
      await currentHandle.close();
      currentHandle = childHandle;
      currentPath = join(currentPath, segment);
      if (isFinalSegment) {
        finalCreated = created;
      }
    }

    const information = await currentHandle.stat({ bigint: true });
    if (
      typeof process.getuid === "function" &&
      information.uid !== BigInt(process.getuid())
    ) {
      throw new Error(`${label} must be owned by the current user.`);
    }
    if (privatePermissionDigits(information.mode) !== "700") {
      if (!finalCreated) {
        throw new Error(
          `${label} already exists and must be private mode 700. Its mode was not changed.`,
        );
      }
      await currentHandle.chmod(0o700);
      await currentHandle.sync();
    }
    const finalInformation = await currentHandle.stat({ bigint: true });
    const directory = {
      created: finalCreated,
      descriptorPath: `/proc/self/fd/${currentHandle.fd}`,
      device: finalInformation.dev,
      handle: currentHandle,
      inode: finalInformation.ino,
      path: currentPath,
    };
    await assertPrivateDirectoryDescriptorUnchanged(directory, label);
    return directory;
  } catch (error) {
    await currentHandle.close();
    throw error;
  }
}

interface BoundBridgeTokenProof {
  readonly device: number;
  readonly inode: number;
  readonly proof: BridgeTokenProof;
}

async function loadBoundBridgeTokenFromPrivateDirectory(
  directory: PrivateDirectoryDescriptor,
  path: string,
): Promise<BoundBridgeTokenProof> {
  await assertPrivateDirectoryDescriptorUnchanged(
    directory,
    "The bridge token directory",
  );
  const descriptorPath = privateDirectoryChildDescriptorPath(directory, path);
  const pathInformation = await lstat(descriptorPath);
  const handle = await open(
    descriptorPath,
    fsConstants.O_RDONLY + fsConstants.O_NOFOLLOW,
  );
  let token: string;
  try {
    token = await readBridgeTokenFileHandle(handle, pathInformation);
  } finally {
    await handle.close();
  }
  await assertPrivateDirectoryDescriptorUnchanged(
    directory,
    "The bridge token directory",
  );
  return {
    device: pathInformation.dev,
    inode: pathInformation.ino,
    proof: {
      path,
      sha256: createHash("sha256").update(token).digest("hex"),
      token,
    },
  };
}

async function loadBridgeTokenFromPrivateDirectory(
  directory: PrivateDirectoryDescriptor,
  path: string,
): Promise<BridgeTokenProof> {
  const bound = await loadBoundBridgeTokenFromPrivateDirectory(directory, path);
  return bound.proof;
}

export interface BridgeTokenFileCapability {
  readonly assertCurrent: () => Promise<void>;
  readonly close: () => Promise<void>;
  readonly path: string;
  readonly read: () => Promise<BridgeTokenProof>;
}

export async function openBridgeTokenFileCapability(
  input: string,
): Promise<BridgeTokenFileCapability> {
  if (!isAbsolute(input)) {
    throw new Error("The bridge token file path must be absolute.");
  }
  const path = resolve(input);
  const directory = await openPrivateDirectoryDescriptor(
    dirname(path),
    "The bridge token directory",
    false,
  );
  let closed = false;
  let expected: BoundBridgeTokenProof | undefined;
  function ensureOpen(): void {
    if (closed) {
      throw new Error("The bridge token-file capability is closed.");
    }
  }
  return Object.freeze({
    path,
    read: async (): Promise<BridgeTokenProof> => {
      ensureOpen();
      expected = await runWithZeroSoftCoreLimit(() =>
        loadBoundBridgeTokenFromPrivateDirectory(directory, path),
      );
      return expected.proof;
    },
    assertCurrent: async (): Promise<void> => {
      ensureOpen();
      await assertPrivateDirectoryDescriptorUnchanged(
        directory,
        "The bridge token directory",
      );
      if (expected === undefined) {
        throw new Error("The bridge token-file capability has not been read.");
      }
      const current = await loadBoundBridgeTokenFromPrivateDirectory(
        directory,
        path,
      );
      if (
        current.device !== expected.device ||
        current.inode !== expected.inode ||
        current.proof.sha256 !== expected.proof.sha256
      ) {
        throw new Error("The bridge token file changed after it was read.");
      }
    },
    close: async (): Promise<void> => {
      if (!closed) {
        await directory.handle.close();
        closed = true;
      }
    },
  });
}

export async function loadBridgeTokenFile(input: string): Promise<BridgeTokenProof> {
  const capability = await openBridgeTokenFileCapability(input);
  let proof: BridgeTokenProof | undefined;
  let failure: unknown;
  try {
    proof = await capability.read();
    await capability.assertCurrent();
  } catch (error) {
    failure = error;
  }
  try {
    await capability.close();
  } catch (closeError) {
    if (failure !== undefined) {
      throw new AggregateError(
        [failure, closeError],
        "Bridge token read and descriptor cleanup both failed.",
        { cause: closeError },
      );
    }
    throw closeError;
  }
  if (failure !== undefined) {
    throw toError(failure, "Bridge token read failed.");
  }
  if (proof === undefined) {
    throw new Error("Bridge token read produced no proof.");
  }
  return proof;
}

async function removeCreatedTokenAfterFailure(
  directory: PrivateDirectoryDescriptor,
  descriptorPath: string,
  device: bigint | undefined,
  inode: bigint | undefined,
  publicationError: unknown,
): Promise<void> {
  if (device === undefined || inode === undefined) {
    return;
  }
  try {
    const information = await lstat(descriptorPath, { bigint: true });
    if (sameIdentity(information, device, inode)) {
      await unlink(descriptorPath);
      await directory.handle.sync();
    }
  } catch (cleanupError) {
    if (errorCode(cleanupError) !== "ENOENT") {
      throw new AggregateError(
        [publicationError, cleanupError],
        "Bridge token publication and cleanup both failed.",
        { cause: cleanupError },
      );
    }
  }
}

async function provisionBridgeTokenInDirectory(
  directory: PrivateDirectoryDescriptor,
  path: string,
): Promise<BridgeTokenProof & { readonly created: boolean }> {
  const descriptorPath = privateDirectoryChildDescriptorPath(directory, path);
  let handle: FileHandle;
  try {
    handle = await open(
      descriptorPath,
      fsConstants.O_CREAT +
        fsConstants.O_EXCL +
        fsConstants.O_WRONLY +
        fsConstants.O_NOFOLLOW,
      0o600,
    );
  } catch (error) {
    if (errorCode(error) === "EEXIST") {
      return {
        ...(await loadBridgeTokenFromPrivateDirectory(directory, path)),
        created: false,
      };
    }
    throw error;
  }

  let createdDevice: bigint | undefined;
  let createdInode: bigint | undefined;
  let publicationFailure: unknown;
  try {
    await handle.chmod(0o600);
    const emptyInformation = await handle.stat({ bigint: true });
    createdDevice = emptyInformation.dev;
    createdInode = emptyInformation.ino;
    const pathInformation = await lstat(descriptorPath, { bigint: true });
    if (
      !emptyInformation.isFile() ||
      emptyInformation.size !== 0n ||
      emptyInformation.nlink !== 1n ||
      privatePermissionDigits(emptyInformation.mode) !== "600" ||
      !sameIdentity(pathInformation, createdDevice, createdInode) ||
      (typeof process.getuid === "function" &&
        emptyInformation.uid !== BigInt(process.getuid()))
    ) {
      throw new Error(
        "The new bridge token file failed its pre-write identity or mode proof.",
      );
    }
    await assertPrivateDirectoryDescriptorUnchanged(
      directory,
      "The bridge token directory",
    );
    const token = randomBytes(48).toString("base64url");
    await handle.writeFile(`${token}\n`, { encoding: "utf8" });
    await handle.sync();
    const finalInformation = await handle.stat({ bigint: true });
    const finalPathInformation = await lstat(descriptorPath, { bigint: true });
    if (
      !sameIdentity(finalInformation, createdDevice, createdInode) ||
      !sameIdentity(finalPathInformation, createdDevice, createdInode) ||
      finalInformation.nlink !== 1n ||
      privatePermissionDigits(finalInformation.mode) !== "600"
    ) {
      throw new Error("The bridge token file changed during publication.");
    }
    await directory.handle.sync();
  } catch (error) {
    try {
      await removeCreatedTokenAfterFailure(
        directory,
        descriptorPath,
        createdDevice,
        createdInode,
        error,
      );
      publicationFailure = error;
    } catch (cleanupError) {
      publicationFailure = cleanupError;
    }
  }
  try {
    await handle.close();
  } catch (closeError) {
    if (publicationFailure !== undefined) {
      throw new AggregateError(
        [publicationFailure, closeError],
        "Bridge token publication and descriptor cleanup both failed.",
        { cause: closeError },
      );
    }
    throw closeError;
  }
  if (publicationFailure !== undefined) {
    throw toError(publicationFailure, "Bridge token publication failed.");
  }
  return {
    ...(await loadBridgeTokenFromPrivateDirectory(directory, path)),
    created: true,
  };
}

async function provisionBridgeTokenAfterCoreBoundary(
  input: string,
): Promise<BridgeTokenProof & { readonly created: boolean }> {
  if (!isAbsolute(input)) {
    throw new Error("The bridge token file path must be absolute.");
  }
  const path = resolve(input);
  const directory = await openPrivateDirectoryDescriptor(
    dirname(path),
    "The bridge token directory",
  );
  let result: (BridgeTokenProof & { readonly created: boolean }) | undefined;
  let failure: unknown;
  try {
    result = await provisionBridgeTokenInDirectory(directory, path);
  } catch (error) {
    failure = error;
  }
  try {
    await directory.handle.close();
  } catch (closeError) {
    if (failure !== undefined) {
      throw new AggregateError(
        [failure, closeError],
        "Bridge token provisioning and parent-descriptor cleanup both failed.",
        { cause: closeError },
      );
    }
    throw closeError;
  }
  if (failure !== undefined) {
    throw toError(failure, "Bridge token provisioning failed.");
  }
  if (result === undefined) {
    throw new Error("Bridge token provisioning produced no result.");
  }
  return result;
}

export function provisionBridgeTokenFile(
  input: string,
): Promise<BridgeTokenProof & { readonly created: boolean }> {
  return runWithZeroSoftCoreLimit(() =>
    provisionBridgeTokenAfterCoreBoundary(input),
  );
}
