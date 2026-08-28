import { constants as fsConstants } from "node:fs";
import type { Stats } from "node:fs";
import { lstat, open } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import process from "node:process";

import { openControlRootCapability } from "./control-root.ts";
import type {
  ControlRootCapability,
  ControlRootDirectory,
} from "./control-root.ts";
import { runWithZeroSoftCoreLimit } from "./soft-core-limit.ts";

const TOKEN_MINIMUM_BYTES = 32;
const TOKEN_MAXIMUM_BYTES = 256;
export const UPSTREAM_DATA_DIRECTORY_DESCRIPTOR = 3;
const UPSTREAM_SANDBOX_DATA_DIRECTORY = "/data";

export interface PrivateUpstreamBridgeEndpoint {
  readonly host: "127.0.0.1";
  readonly port: number;
  readonly sessionToken: string;
}

export interface BoundUpstreamEnvironment {
  readonly assertCurrent: () => Promise<void>;
  readonly dataDirectory: ControlRootDirectory;
  readonly environment: Record<string, string>;
}

function configuredControlRootDirectory(): string {
  return resolve(
    process.env["EASYEDA_CONTROL_DATA_DIR"] ??
      join(process.env["HOME"] ?? "/tmp", ".easyeda-pro-control"),
  );
}

export function openConfiguredControlRootCapability(): Promise<ControlRootCapability> {
  return openControlRootCapability(configuredControlRootDirectory());
}

export const UPSTREAM_CHILD_ENVIRONMENT_NAMES = Object.freeze([
  "AI_ALLOW_DESIGN_MUTATIONS",
  "AI_PROVIDER",
  "BRIDGE_HOST",
  "BRIDGE_HOT_SWAP_ENABLED",
  "BRIDGE_MAX_PAYLOAD_SIZE",
  "BRIDGE_PORT",
  "BRIDGE_PORT_SCAN",
  "BRIDGE_RAW_EXEC_ENABLED",
  "BRIDGE_TOKEN",
  "DATA_DIR",
  "DIGIKEY_ENABLED",
  "DOTENV_CONFIG_PATH",
  "DOTENV_CONFIG_QUIET",
  "HOME",
  "HTTP_AUTH_DISABLED",
  "JLCPCB_ENABLE_ORDERING",
  "JLCPCB_MODE",
  "JLCSEARCH_ENABLED",
  "KEYLESS_SOURCING_ENABLED",
  "LANG",
  "LC_ALL",
  "LOG_LEVEL",
  "LOGNAME",
  "MCP_BRIDGE_BACKEND",
  "MCP_RAW_EXEC_EXPERIMENTAL",
  "MOUSER_ENABLED",
  "NODE_ENV",
  "OAUTH_ENABLED",
  "OTEL_ENABLED",
  "PATH",
  "SHELL",
  "TERM",
  "TOOL_PROFILE",
  "TRANSPORT",
  "TZ",
  "USER",
] as const);

function isWithin(root: string, candidate: string): boolean {
  const relativePath = relative(root, candidate);
  return (
    relativePath.length === 0 ||
    (relativePath !== ".." &&
      !relativePath.startsWith(`..${sep}`) &&
      !isAbsolute(relativePath))
  );
}

async function bindPrivateUpstreamDataDirectory(
  controlRoot: string,
  dataDirectory: string,
  capability: ControlRootCapability,
): Promise<ControlRootDirectory> {
  if (capability.path !== controlRoot) {
    throw new Error(
      "The retained control-root capability does not match EASYEDA_CONTROL_DATA_DIR.",
    );
  }
  const relation = relative(controlRoot, dataDirectory);
  if (
    relation.length === 0 ||
    relation === ".." ||
    relation.startsWith(`..${sep}`) ||
    isAbsolute(relation) ||
    relation.includes(sep)
  ) {
    throw new Error(
      "EASYEDA_UPSTREAM_DATA_DIR must be a dedicated child of EASYEDA_CONTROL_DATA_DIR.",
    );
  }
  await capability.assertCurrent();
  const directory = await capability.openDirectory(dataDirectory);
  try {
    const information = await directory.handle.stat({ bigint: true });
    if (
      !information.isDirectory() ||
      Number(information.mode % 512n) !== 0o700 ||
      (typeof process.getuid === "function" &&
        information.uid !== BigInt(process.getuid()))
    ) {
      throw new Error(
        "EASYEDA_UPSTREAM_DATA_DIR must be an owner-owned mode-0700 directory.",
      );
    }
    await directory.handle.sync();
    await capability.assertCurrent();
    return directory;
  } catch (error) {
    await directory.handle.close();
    throw error;
  }
}

function assertPrivateFileMode(mode: number): void {
  if (process.platform !== "win32" && (mode & 0o077) !== 0) {
    throw new Error(
      "EASYEDA_BRIDGE_TOKEN_FILE must not grant group or other permissions.",
    );
  }
}

async function readBoundBridgeTokenFile(
  configuredPath: string,
  capability: ControlRootCapability,
): Promise<string> {
  if (!isAbsolute(configuredPath)) {
    throw new Error("EASYEDA_BRIDGE_TOKEN_FILE must be absolute.");
  }
  const path = resolve(configuredPath);
  if (!isWithin(capability.path, path) || path === capability.path) {
    throw new Error(
      "EASYEDA_BRIDGE_TOKEN_FILE must stay inside EASYEDA_CONTROL_DATA_DIR.",
    );
  }
  await capability.assertCurrent();
  const directory = await capability.openDirectory(dirname(path), false);
  const descriptorPath = `/proc/self/fd/${directory.handle.fd}/${basename(path)}`;
  try {
    const pathInfo = await lstat(descriptorPath);
    const handle = await open(
      descriptorPath,
      fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
    );
    try {
      const token = await readBridgeTokenFileHandle(handle, pathInfo);
      const openedInfo = await handle.stat();
      const currentDirectory = await capability.openDirectory(
        directory.absolute,
        false,
      );
      try {
        if (
          currentDirectory.info.dev !== directory.info.dev ||
          currentDirectory.info.ino !== directory.info.ino
        ) {
          throw new Error(
            "EASYEDA_BRIDGE_TOKEN_FILE parent changed while being read.",
          );
        }
        const currentPath =
          `/proc/self/fd/${currentDirectory.handle.fd}/${basename(path)}`;
        const currentInfo = await lstat(currentPath);
        if (
          currentInfo.isSymbolicLink() ||
          !currentInfo.isFile() ||
          currentInfo.dev !== openedInfo.dev ||
          currentInfo.ino !== openedInfo.ino ||
          currentInfo.nlink !== 1 ||
          currentInfo.size !== openedInfo.size ||
          currentInfo.mtimeMs !== openedInfo.mtimeMs ||
          currentInfo.ctimeMs !== openedInfo.ctimeMs ||
          (typeof process.getuid === "function" &&
            currentInfo.uid !== process.getuid())
        ) {
          throw new Error("EASYEDA_BRIDGE_TOKEN_FILE changed while being read.");
        }
        assertPrivateFileMode(currentInfo.mode);
      } finally {
        await currentDirectory.handle.close();
      }
      await capability.assertCurrent();
      return token;
    } finally {
      await handle.close();
    }
  } finally {
    await directory.handle.close();
  }
}

export async function readBridgeTokenFileHandle(
  handle: FileHandle,
  pathInfo: Stats,
): Promise<string> {
  if (
    pathInfo.isSymbolicLink() ||
    !pathInfo.isFile() ||
    pathInfo.nlink !== 1
  ) {
    throw new Error(
      "EASYEDA_BRIDGE_TOKEN_FILE must be a single-link regular non-symlink file.",
    );
  }
  if (
    typeof process.getuid === "function" &&
    pathInfo.uid !== process.getuid()
  ) {
    throw new Error("EASYEDA_BRIDGE_TOKEN_FILE must be owned by this user.");
  }
  assertPrivateFileMode(pathInfo.mode);
  const openedInfo = await handle.stat();
  if (
    openedInfo.dev !== pathInfo.dev ||
    openedInfo.ino !== pathInfo.ino ||
    openedInfo.nlink !== 1 ||
    openedInfo.size !== pathInfo.size ||
    openedInfo.size > TOKEN_MAXIMUM_BYTES + 2
  ) {
    throw new Error(
      "EASYEDA_BRIDGE_TOKEN_FILE changed or exceeds the supported size.",
    );
  }
  const tokenContents = await handle.readFile("utf8");
  const token = tokenContents.trim();
  const after = await handle.stat();
  if (
    after.dev !== openedInfo.dev ||
    after.ino !== openedInfo.ino ||
    after.nlink !== 1 ||
    after.size !== openedInfo.size ||
    after.mtimeMs !== openedInfo.mtimeMs ||
    after.ctimeMs !== openedInfo.ctimeMs
  ) {
    throw new Error("EASYEDA_BRIDGE_TOKEN_FILE changed while being read.");
  }
  if (
    Buffer.byteLength(token, "utf8") < TOKEN_MINIMUM_BYTES ||
    Buffer.byteLength(token, "utf8") > TOKEN_MAXIMUM_BYTES ||
    !/^[A-Za-z0-9_-]+$/u.test(token)
  ) {
    throw new Error(
      "EASYEDA_BRIDGE_TOKEN_FILE must contain one 32-256 byte base64url token.",
    );
  }
  return token;
}

export function configuredBridgeAuthenticationKey(
  capability: ControlRootCapability,
): Promise<string> {
  const configuredPath = process.env["EASYEDA_BRIDGE_TOKEN_FILE"];
  if (configuredPath === undefined || configuredPath.length === 0) {
    throw new Error(
      "EASYEDA_BRIDGE_TOKEN_FILE is required; unauthenticated bridge startup is prohibited.",
    );
  }
  return runWithZeroSoftCoreLimit(() =>
    readBoundBridgeTokenFile(configuredPath, capability),
  );
}

export async function prepareBoundUpstreamEnvironment(
  command: string,
  privateBridge: PrivateUpstreamBridgeEndpoint | undefined,
  controlRootCapability: ControlRootCapability,
): Promise<BoundUpstreamEnvironment> {
  if (!isAbsolute(command)) {
    throw new Error("The reviewed upstream command must be absolute.");
  }
  if (
    process.env["EASYEDA_BRIDGE_TOKEN_FILE"] === undefined ||
    process.env["EASYEDA_BRIDGE_TOKEN_FILE"]?.length === 0
  ) {
    throw new Error(
      "EASYEDA_BRIDGE_TOKEN_FILE is required; unauthenticated bridge startup is prohibited.",
    );
  }
  if (privateBridge === undefined) {
    throw new Error(
      "A private authenticated bridge backend endpoint is required.",
    );
  }
  if (
    privateBridge.host !== "127.0.0.1" ||
    !Number.isSafeInteger(privateBridge.port) ||
    privateBridge.port < 1 ||
    privateBridge.port > 65_535 ||
    Buffer.byteLength(privateBridge.sessionToken, "utf8") < TOKEN_MINIMUM_BYTES ||
    Buffer.byteLength(privateBridge.sessionToken, "utf8") > TOKEN_MAXIMUM_BYTES ||
    !/^[A-Za-z0-9_-]+$/u.test(privateBridge.sessionToken)
  ) {
    throw new Error("The private authenticated bridge backend is invalid.");
  }
  const controlRoot = configuredControlRootDirectory();
  const dataDirectory = resolve(
    process.env["EASYEDA_UPSTREAM_DATA_DIR"] ?? join(controlRoot, "upstream"),
  );
  if (!isWithin(controlRoot, dataDirectory)) {
    throw new Error(
      "EASYEDA_UPSTREAM_DATA_DIR must stay inside EASYEDA_CONTROL_DATA_DIR.",
    );
  }
  // Validate the user-owned key through the retained control root even though
  // Only a fresh facade-generated backend token crosses into the child.
  await configuredBridgeAuthenticationKey(controlRootCapability);
  const boundDataDirectory = await bindPrivateUpstreamDataDirectory(
    controlRoot,
    dataDirectory,
    controlRootCapability,
  );
  const environment = {
    AI_ALLOW_DESIGN_MUTATIONS: "false",
    AI_PROVIDER: "none",
    BRIDGE_HOST: privateBridge.host,
    BRIDGE_HOT_SWAP_ENABLED: "false",
    BRIDGE_MAX_PAYLOAD_SIZE:
      process.env["EASYEDA_BRIDGE_MAX_PAYLOAD_SIZE"] ?? "10485760",
    BRIDGE_PORT: String(privateBridge.port),
    BRIDGE_PORT_SCAN: String(privateBridge.port),
    BRIDGE_RAW_EXEC_ENABLED:
      process.env["EASYEDA_RAW_EXEC_ENABLED"] ?? "true",
    BRIDGE_TOKEN: privateBridge.sessionToken,
    DATA_DIR: UPSTREAM_SANDBOX_DATA_DIRECTORY,
    DIGIKEY_ENABLED: "false",
    DOTENV_CONFIG_PATH: "/dev/null",
    DOTENV_CONFIG_QUIET: "true",
    HOME: UPSTREAM_SANDBOX_DATA_DIRECTORY,
    HTTP_AUTH_DISABLED: "false",
    JLCPCB_ENABLE_ORDERING: "false",
    JLCPCB_MODE: "disabled",
    JLCSEARCH_ENABLED: "false",
    KEYLESS_SOURCING_ENABLED: "false",
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
    LOG_LEVEL: process.env["EASYEDA_UPSTREAM_LOG_LEVEL"] ?? "warn",
    LOGNAME: "easyeda-pro-control",
    MCP_BRIDGE_BACKEND: "local_bridge",
    MCP_RAW_EXEC_EXPERIMENTAL:
      process.env["EASYEDA_RAW_EXEC_EXPERIMENTAL"] ?? "true",
    MOUSER_ENABLED: "false",
    // The pinned upstream deliberately disables its raw-exec tool in production.
    // The private stdio child exposes it only to facade-generated authenticated calls.
    // Every remote, sourcing, ordering, and raw caller path remains disabled.
    NODE_ENV: "development",
    OAUTH_ENABLED: "false",
    OTEL_ENABLED: "false",
    PATH: "/runtime",
    SHELL: "",
    TERM: "dumb",
    TOOL_PROFILE: process.env["EASYEDA_TOOL_PROFILE"] ?? "dev",
    TRANSPORT: "stdio",
    TZ: "UTC",
    USER: "easyeda-pro-control",
  };
  const assertCurrent = async (): Promise<void> => {
    await controlRootCapability.assertCurrent();
    const retained = await boundDataDirectory.handle.stat({ bigint: true });
    if (
      retained.dev !== boundDataDirectory.info.dev ||
      retained.ino !== boundDataDirectory.info.ino ||
      !retained.isDirectory() ||
      Number(retained.mode % 512n) !== 0o700 ||
      (typeof process.getuid === "function" &&
        retained.uid !== BigInt(process.getuid()))
    ) {
      throw new Error(
        "The retained upstream data-directory capability changed before spawn.",
      );
    }
    let reopened: ControlRootDirectory;
    try {
      reopened = await controlRootCapability.openDirectory(
        boundDataDirectory.absolute,
        false,
      );
    } catch (error) {
      throw new Error(
        "The upstream data-directory pathname changed before spawn.",
        { cause: error },
      );
    }
    try {
      if (
        reopened.info.dev !== boundDataDirectory.info.dev ||
        reopened.info.ino !== boundDataDirectory.info.ino
      ) {
        throw new Error(
          "The upstream data-directory pathname changed before spawn.",
        );
      }
    } finally {
      await reopened.handle.close();
    }
    await controlRootCapability.assertCurrent();
  };
  try {
    await assertCurrent();
  } catch (error) {
    await boundDataDirectory.handle.close();
    throw error;
  }
  return {
    assertCurrent,
    dataDirectory: boundDataDirectory,
    environment,
  };
}

export async function buildUpstreamEnvironment(
  command: string,
  privateBridge: PrivateUpstreamBridgeEndpoint | undefined,
  controlRootCapability: ControlRootCapability,
): Promise<Record<string, string>> {
  const prepared = await prepareBoundUpstreamEnvironment(
    command,
    privateBridge,
    controlRootCapability,
  );
  try {
    return prepared.environment;
  } finally {
    await prepared.dataDirectory.handle.close();
  }
}

export function sanitizeUpstreamEnvironment(
  environment: NodeJS.ProcessEnv,
): Record<string, string> {
  const output: Record<string, string> = {};
  for (const name of UPSTREAM_CHILD_ENVIRONMENT_NAMES) {
    const value = environment[name];
    if (value !== undefined) {
      output[name] = value;
    }
  }
  return output;
}
