import { constants as fsConstants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, mkdir, open } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";

export interface ControlRootDirectory {
  readonly absolute: string;
  readonly handle: FileHandle;
  readonly info: BigIntStats;
}

export interface ControlRootCapability {
  readonly descriptorPath: string;
  readonly device: bigint;
  readonly handle: FileHandle;
  readonly inode: bigint;
  readonly path: string;
  readonly assertCurrent: () => Promise<void>;
  readonly childDescriptorPath: (absolutePath: string) => string;
  readonly close: () => Promise<void>;
  readonly openDirectory: (
    absolutePath: string,
    createMissing?: boolean,
  ) => Promise<ControlRootDirectory>;
}

function errorCode(error: unknown): string | undefined {
  return error !== null && typeof error === "object" && "code" in error
    ? String(error.code)
    : undefined;
}

function sameIdentity(
  left: { readonly dev: bigint; readonly ino: bigint },
  right: { readonly dev: bigint; readonly ino: bigint },
): boolean {
  return left.dev === right.dev && left.ino === right.ino;
}

function permissionMode(mode: bigint): number {
  return Number(mode % 512n);
}

function isWithin(root: string, candidate: string): boolean {
  const relation = relative(root, candidate);
  return (
    relation.length === 0 ||
    (relation !== ".." &&
      !relation.startsWith(`..${sep}`) &&
      !isAbsolute(relation))
  );
}

function assertPrivateOwnedRoot(
  information: BigIntStats,
  label: string,
): void {
  if (
    !information.isDirectory() ||
    permissionMode(information.mode) !== 0o700 ||
    (typeof process.getuid === "function" &&
      information.uid !== BigInt(process.getuid()))
  ) {
    throw new Error(`${label} must be an owner-owned mode-0700 directory.`);
  }
}

async function duplicateDirectoryHandle(
  descriptorPath: string,
  expected: { readonly dev: bigint; readonly ino: bigint },
  label: string,
): Promise<FileHandle> {
  const handle = await open(
    descriptorPath,
    fsConstants.O_RDONLY | fsConstants.O_DIRECTORY,
  );
  try {
    const information = await handle.stat({ bigint: true });
    if (!information.isDirectory() || !sameIdentity(information, expected)) {
      throw new Error(`${label} descriptor identity changed.`);
    }
    return handle;
  } catch (error) {
    await handle.close();
    throw error;
  }
}

/**
 * Open one owner-only control root and retain its directory descriptor for the
 * complete facade lifetime. Descendants are always resolved from this
 * capability; the configured pathname is only an identity alarm.
 */
export async function openControlRootCapability(
  input: string,
): Promise<ControlRootCapability> {
  if (process.platform !== "linux") {
    throw new Error(
      "EasyEDA control-root confinement requires Linux /proc file descriptors.",
    );
  }
  if (!isAbsolute(input)) {
    throw new Error("EasyEDA control root must be an absolute path.");
  }
  const path = resolve(input);
  if (path === sep) {
    throw new Error("EasyEDA control root must be a non-root absolute path.");
  }
  const segments = path.split(sep).filter(Boolean);
  let currentHandle = await open(
    sep,
    fsConstants.O_RDONLY |
      fsConstants.O_DIRECTORY |
      fsConstants.O_NOFOLLOW,
  );
  let currentPath: string = sep;
  try {
    for (const [index, segment] of segments.entries()) {
      const childPath = `/proc/self/fd/${currentHandle.fd}/${segment}`;
      let before: BigIntStats;
      let created = false;
      try {
        before = await lstat(childPath, { bigint: true });
      } catch (error) {
        if (errorCode(error) !== "ENOENT") {
          throw error;
        }
        if (index !== segments.length - 1) {
          throw new Error(
            `EasyEDA control-root parent must already exist: ${join(currentPath, segment)}`,
            { cause: error },
          );
        }
        await mkdir(childPath, { mode: 0o700 });
        await currentHandle.sync();
        created = true;
        before = await lstat(childPath, { bigint: true });
      }
      if (before.isSymbolicLink() || !before.isDirectory()) {
        throw new Error(
          `EasyEDA control root must not traverse a symbolic-link or non-directory path: ${join(currentPath, segment)}`,
        );
      }
      const childHandle = await open(
        childPath,
        fsConstants.O_RDONLY |
          fsConstants.O_DIRECTORY |
          fsConstants.O_NOFOLLOW,
      );
      try {
        if (created) {
          await childHandle.chmod(0o700);
          await childHandle.sync();
        }
        const opened = await childHandle.stat({ bigint: true });
        if (!opened.isDirectory() || !sameIdentity(before, opened)) {
          throw new Error(
            `EasyEDA control-root directory identity changed during traversal: ${join(currentPath, segment)}`,
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

    const rootInformation = await currentHandle.stat({ bigint: true });
    assertPrivateOwnedRoot(rootInformation, "EasyEDA control root");
    const device = rootInformation.dev;
    const inode = rootInformation.ino;
    const descriptorPath = `/proc/self/fd/${currentHandle.fd}`;
    let closed = false;

    const assertCurrent = async (): Promise<void> => {
      if (closed) {
        throw new Error("The EasyEDA control-root capability is closed.");
      }
      let pathInformation: BigIntStats;
      try {
        pathInformation = await lstat(path, { bigint: true });
      } catch (error) {
        throw new Error(
          "EasyEDA control-root pathname changed after capability acquisition.",
          { cause: error },
        );
      }
      const handleInformation = await currentHandle.stat({ bigint: true });
      if (
        pathInformation.isSymbolicLink() ||
        !pathInformation.isDirectory() ||
        !sameIdentity(pathInformation, { dev: device, ino: inode }) ||
        !sameIdentity(handleInformation, { dev: device, ino: inode })
      ) {
        throw new Error(
          "EasyEDA control-root pathname changed after capability acquisition.",
        );
      }
      assertPrivateOwnedRoot(pathInformation, "EasyEDA control root");
      assertPrivateOwnedRoot(handleInformation, "EasyEDA control root");
    };

    const childDescriptorPath = (absolutePath: string): string => {
      const candidate = resolve(absolutePath);
      if (!isWithin(path, candidate)) {
        throw new Error("Control-root child escapes its retained capability.");
      }
      const child = relative(path, candidate);
      return child.length === 0 ? descriptorPath : join(descriptorPath, child);
    };

    const openDirectory = async (
      absolutePath: string,
      createMissing = true,
    ): Promise<ControlRootDirectory> => {
      const candidate = resolve(absolutePath);
      if (!isWithin(path, candidate)) {
        throw new Error("Managed directory escapes the EasyEDA control root.");
      }
      await assertCurrent();
      let directoryHandle = await duplicateDirectoryHandle(
        descriptorPath,
        { dev: device, ino: inode },
        "EasyEDA control root",
      );
      let directoryPath = path;
      try {
        const relation = relative(path, candidate);
        const childSegments = relation.length === 0 ? [] : relation.split(sep);
        for (const segment of childSegments) {
          const childPath = `/proc/self/fd/${directoryHandle.fd}/${segment}`;
          let before: BigIntStats;
          let created = false;
          try {
            before = await lstat(childPath, { bigint: true });
          } catch (error) {
            if (!createMissing || errorCode(error) !== "ENOENT") {
              throw error;
            }
            await mkdir(childPath, { mode: 0o700 });
            await directoryHandle.sync();
            created = true;
            before = await lstat(childPath, { bigint: true });
          }
          if (before.isSymbolicLink() || !before.isDirectory()) {
            throw new Error(
              `Managed parent is not a real directory: ${join(directoryPath, segment)}`,
            );
          }
          if (!created) {
            assertPrivateOwnedRoot(
              before,
              `Managed directory ${join(directoryPath, segment)}`,
            );
          }
          const childHandle = await open(
            childPath,
            fsConstants.O_RDONLY |
              fsConstants.O_DIRECTORY |
              fsConstants.O_NOFOLLOW,
          );
          try {
            if (created) {
              await childHandle.chmod(0o700);
              await childHandle.sync();
            }
            const opened = await childHandle.stat({ bigint: true });
            if (!opened.isDirectory() || !sameIdentity(before, opened)) {
              throw new Error(
                `Managed directory identity changed: ${join(directoryPath, segment)}`,
              );
            }
            assertPrivateOwnedRoot(
              opened,
              `Managed directory ${join(directoryPath, segment)}`,
            );
            const currentChildPath = await lstat(childPath, { bigint: true });
            if (!sameIdentity(opened, currentChildPath)) {
              throw new Error(
                `Managed directory pathname changed: ${join(directoryPath, segment)}`,
              );
            }
            assertPrivateOwnedRoot(
              currentChildPath,
              `Managed directory ${join(directoryPath, segment)}`,
            );
          } catch (error) {
            await childHandle.close();
            throw error;
          }
          await directoryHandle.close();
          directoryHandle = childHandle;
          directoryPath = join(directoryPath, segment);
        }
        const information = await directoryHandle.stat({ bigint: true });
        await assertCurrent();
        return {
          absolute: candidate,
          handle: directoryHandle,
          info: information,
        };
      } catch (error) {
        await directoryHandle.close();
        throw error;
      }
    };

    const close = async (): Promise<void> => {
      if (closed) {
        return;
      }
      await currentHandle.close();
      closed = true;
    };
    const capability: ControlRootCapability = {
      descriptorPath,
      device,
      handle: currentHandle,
      inode,
      path,
      assertCurrent,
      childDescriptorPath,
      close,
      openDirectory,
    };
    await assertCurrent();
    return capability;
  } catch (error) {
    await currentHandle.close();
    throw error;
  }
}
