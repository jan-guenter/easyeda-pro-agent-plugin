// oxlint-disable import/max-dependencies -- The isolated supervisor composes an extra fail-closed network authority boundary before loading captured code.
import { createHash } from "node:crypto";
import { constants as fsConstants, fstatSync, lstatSync } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import type { UpstreamLauncherFingerprint } from "./core.ts";
import {
  UPSTREAM_SUPERVISOR_READY_LINE,
  readBridgeBootstrapSecret,
} from "./upstream-bootstrap.ts";
import { sanitizeUpstreamEnvironment } from "./upstream-environment.ts";
import {
  assertOutboundConnectDeniedByKernel,
  installUpstreamNetworkPolicy,
} from "./upstream-network-policy.ts";
import {
  MAXIMUM_SERIALIZED_GRAPH_BYTES,
  deserializeCapturedUpstreamModuleGraph,
  executeCapturedUpstreamModuleGraph,
} from "./upstream-module-execution.ts";
// oxlint-enable import/max-dependencies

const SUPERVISOR_PATH = "/runtime/upstream-supervisor.mjs";
const GRAPH_PATH = "/runtime/graph.json";
const DATA_PATH = "/data";
const MAXIMUM_LOCAL_DEFENSE_DESCRIPTOR = 255;
const EXPECTED_LOCAL_PIPE_DESCRIPTORS = new Set([4, 5, 6, 7, 10, 11, 14, 15]);
const EXPECTED_LOCAL_ANON_DESCRIPTORS = new Set([3, 8, 9, 12, 13, 16]);

async function emitSupervisorReady(): Promise<void> {
  // oxlint-disable-next-line promise/avoid-new -- Writable completion and failure are exposed only through its callback boundary.
  await new Promise<void>((_resolve, reject) => {
    process.stdout.write(`${UPSTREAM_SUPERVISOR_READY_LINE}\n`, (error) => {
      if (error === null || error === undefined) {
        _resolve();
      } else {
        reject(error);
      }
    });
  });
}

function permissionMode(mode: bigint): number {
  return Number(mode % 512n);
}

function expectedSha256(value: string | undefined, label: string): string {
  if (value === undefined || !/^[a-f0-9]{64}$/u.test(value)) {
    throw new Error(`The upstream supervisor requires an exact ${label} SHA-256.`);
  }
  return value;
}

function expectedPositiveInteger(
  value: string | undefined,
  label: string,
  maximum = Number.MAX_SAFE_INTEGER,
): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0 || parsed > maximum) {
    throw new Error(`The upstream supervisor requires a bounded ${label}.`);
  }
  return parsed;
}

function expectedNonnegativeInteger(
  value: string | undefined,
  label: string,
): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`The upstream supervisor requires a bounded ${label}.`);
  }
  return parsed;
}

function expectedBigint(value: string | undefined, label: string): bigint {
  if (value === undefined || !/^\d+$/u.test(value)) {
    throw new Error(`The upstream supervisor requires an exact ${label}.`);
  }
  return BigInt(value);
}

async function assertOwnRuntimeIdentity(
  sha256: string,
  byteLength: number,
): Promise<void> {
  const ownPath = resolve(import.meta.filename);
  if (
    ownPath !== SUPERVISOR_PATH ||
    basename(ownPath) !== "upstream-supervisor.mjs" ||
    dirname(ownPath) !== "/runtime" ||
    (await realpath(ownPath)) !== ownPath
  ) {
    throw new Error("The upstream supervisor was not loaded from /runtime.");
  }
  const pathInfo = await lstat(ownPath, { bigint: true });
  if (
    pathInfo.isSymbolicLink() ||
    !pathInfo.isFile() ||
    pathInfo.size !== BigInt(byteLength) ||
    permissionMode(pathInfo.mode) !== 0o400 ||
    (typeof process.getuid === "function" &&
      pathInfo.uid !== BigInt(process.getuid()))
  ) {
    throw new Error("The mounted upstream supervisor identity is invalid.");
  }
  const handle = await open(
    ownPath,
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
  );
  try {
    const opened = await handle.stat({ bigint: true });
    const bytes = await handle.readFile();
    const after = await handle.stat({ bigint: true });
    if (
      opened.dev !== pathInfo.dev ||
      opened.ino !== pathInfo.ino ||
      after.dev !== opened.dev ||
      after.ino !== opened.ino ||
      after.size !== opened.size ||
      after.mtimeNs !== opened.mtimeNs ||
      after.ctimeNs !== opened.ctimeNs ||
      bytes.length !== byteLength ||
      createHash("sha256").update(bytes).digest("hex") !== sha256
    ) {
      throw new Error("The mounted upstream supervisor failed byte verification.");
    }
  } finally {
    await handle.close();
  }
}

async function assertDataDirectory(
  expectedDevice: bigint,
  expectedInode: bigint,
): Promise<void> {
  if (
    process.env["HOME"] !== DATA_PATH ||
    process.env["DATA_DIR"] !== DATA_PATH
  ) {
    throw new Error("The sandbox HOME and DATA_DIR must both be /data.");
  }
  const pathInfo = await lstat(DATA_PATH, { bigint: true });
  if (
    pathInfo.isSymbolicLink() ||
    !pathInfo.isDirectory() ||
    pathInfo.dev !== expectedDevice ||
    pathInfo.ino !== expectedInode ||
    permissionMode(pathInfo.mode) !== 0o700 ||
    (typeof process.getuid === "function" &&
      pathInfo.uid !== BigInt(process.getuid()))
  ) {
    throw new Error("The mounted upstream data directory identity is invalid.");
  }
  const handle = await open(
    DATA_PATH,
    fsConstants.O_RDONLY |
      fsConstants.O_DIRECTORY |
      fsConstants.O_NOFOLLOW,
  );
  try {
    const opened = await handle.stat({ bigint: true });
    if (
      opened.dev !== expectedDevice ||
      opened.ino !== expectedInode ||
      !opened.isDirectory()
    ) {
      throw new Error("The upstream data-directory descriptor changed.");
    }
  } finally {
    await handle.close();
  }
}

function assertPermissionBoundary(): void {
  if (
    process.permission === undefined ||
    !process.permission.has("fs.read", SUPERVISOR_PATH) ||
    !process.permission.has("fs.read", GRAPH_PATH) ||
    !process.permission.has("fs.read", "/dev/null") ||
    !process.permission.has("fs.read", `${DATA_PATH}/probe`) ||
    !process.permission.has("fs.write", `${DATA_PATH}/probe`) ||
    process.permission.has("child") ||
    process.permission.has("worker") ||
    process.permission.has("addons") ||
    process.permission.has("wasi") ||
    process.permission.has("fs.read", "/etc/passwd") ||
    process.permission.has("fs.write", SUPERVISOR_PATH)
  ) {
    throw new Error("The upstream Node permission boundary is not exact.");
  }
}

function assertCodeGenerationBoundary(): void {
  if (
    !process.execArgv.includes("--disallow-code-generation-from-strings") ||
    !process.execArgv.includes("--jitless") ||
    globalThis.WebAssembly !== undefined
  ) {
    throw new Error("The upstream code-generation boundary is not exact.");
  }
}

function assertLocalDescriptorBaseline(): void {
  const leaked: number[] = [];
  const nullDevice = lstatSync("/dev/null");
  let nullDeviceDescriptorCount = 0;
  for (
    let descriptor = 3;
    descriptor <= MAXIMUM_LOCAL_DEFENSE_DESCRIPTOR;
    descriptor += 1
  ) {
    try {
      const information = fstatSync(descriptor);
      const exactNullDevice =
        information.isCharacterDevice() &&
        nullDevice.isCharacterDevice() &&
        information.dev === nullDevice.dev &&
        information.ino === nullDevice.ino &&
        information.rdev === nullDevice.rdev;
      if (exactNullDevice) {
        if (descriptor !== 17) {
          leaked.push(descriptor);
        }
        nullDeviceDescriptorCount += 1;
      } else if (EXPECTED_LOCAL_PIPE_DESCRIPTORS.has(descriptor)) {
        if (!information.isFIFO()) {
          leaked.push(descriptor);
        }
      } else if (EXPECTED_LOCAL_ANON_DESCRIPTORS.has(descriptor)) {
        if (
          information.isFile() ||
          information.isDirectory() ||
          information.isFIFO() ||
          information.isSocket() ||
          information.isBlockDevice() ||
          information.isCharacterDevice()
        ) {
          leaked.push(descriptor);
        }
      } else {
        leaked.push(descriptor);
      }
    } catch (error) {
      if (
        error === null ||
        typeof error !== "object" ||
        !("code" in error) ||
        error.code !== "EBADF"
      ) {
        throw error;
      }
      if (
        descriptor === 17 ||
        EXPECTED_LOCAL_PIPE_DESCRIPTORS.has(descriptor) ||
        EXPECTED_LOCAL_ANON_DESCRIPTORS.has(descriptor)
      ) {
        leaked.push(descriptor);
      }
    }
  }
  if (leaked.length > 0 || nullDeviceDescriptorCount > 1) {
    throw new Error(
      `The sandbox inherited unexpected authority descriptors: ${leaked.join(",")} (null-device descriptors: ${nullDeviceDescriptorCount}).`,
    );
  }
}

function replaceEnvironment(environment: Record<string, string>): void {
  for (const name of Object.keys(process.env)) {
    Reflect.deleteProperty(process.env, name);
  }
  Object.assign(process.env, environment);
}

async function readMountedGraph(
  expectedBytes: number,
  expectedDigest: string,
): Promise<Buffer> {
  const pathInfo = await lstat(GRAPH_PATH, { bigint: true });
  if (
    pathInfo.isSymbolicLink() ||
    !pathInfo.isFile() ||
    pathInfo.size !== BigInt(expectedBytes) ||
    permissionMode(pathInfo.mode) !== 0o400
  ) {
    throw new Error("The mounted upstream graph file identity is invalid.");
  }
  const handle = await open(
    GRAPH_PATH,
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
  );
  try {
    const opened = await handle.stat({ bigint: true });
    if (
      !opened.isFile() ||
      opened.dev !== pathInfo.dev ||
      opened.ino !== pathInfo.ino ||
      opened.size !== pathInfo.size
    ) {
      throw new Error("The mounted upstream graph changed before open.");
    }
    const bytes = Buffer.alloc(expectedBytes);
    let position = 0;
    while (position < bytes.length) {
      const result = await handle.read(
        bytes,
        position,
        bytes.length - position,
        position,
      );
      if (result.bytesRead === 0) {
        throw new Error("The mounted upstream graph ended early.");
      }
      position += result.bytesRead;
    }
    const trailing = Buffer.alloc(1);
    const trailingRead = await handle.read(trailing, 0, 1, expectedBytes);
    const after = await handle.stat({ bigint: true });
    if (
      trailingRead.bytesRead !== 0 ||
      after.dev !== opened.dev ||
      after.ino !== opened.ino ||
      after.size !== opened.size ||
      after.mtimeNs !== opened.mtimeNs ||
      after.ctimeNs !== opened.ctimeNs ||
      createHash("sha256").update(bytes).digest("hex") !== expectedDigest
    ) {
      throw new Error("The mounted upstream graph failed byte verification.");
    }
    return bytes;
  } finally {
    await handle.close();
  }
}

function exitImmediately(): void {
  process.exit(0);
}

async function run(): Promise<void> {
  const [
    moduleCountValue,
    edgeCountValue,
    totalBytesValue,
    moduleGraphSha256Value,
    graphPayloadSha256Value,
    graphPayloadBytesValue,
    supervisorSha256Value,
    supervisorBytesValue,
    dataDeviceValue,
    dataInodeValue,
    backendPortValue,
    ...unexpected
  ] = process.argv.slice(2);
  if (unexpected.length > 0) {
    throw new Error("The upstream supervisor received unexpected arguments.");
  }
  const expectedGraph: UpstreamLauncherFingerprint["moduleGraph"] = {
    edgeCount: expectedNonnegativeInteger(edgeCountValue, "edge count"),
    moduleCount: expectedPositiveInteger(moduleCountValue, "module count"),
    schema: "easyeda-pro-control.module-graph.v1",
    sha256: expectedSha256(moduleGraphSha256Value, "module-graph"),
    totalBytes: expectedPositiveInteger(totalBytesValue, "module byte count"),
  };
  const graphPayloadSha256 = expectedSha256(
    graphPayloadSha256Value,
    "graph-payload",
  );
  const graphPayloadBytes = expectedPositiveInteger(
    graphPayloadBytesValue,
    "graph-payload byte count",
    MAXIMUM_SERIALIZED_GRAPH_BYTES,
  );
  const supervisorSha256 = expectedSha256(
    supervisorSha256Value,
    "supervisor",
  );
  const supervisorBytes = expectedPositiveInteger(
    supervisorBytesValue,
    "supervisor byte count",
    64 * 1024 * 1024,
  );
  const dataDevice = expectedBigint(dataDeviceValue, "data device");
  const dataInode = expectedBigint(dataInodeValue, "data inode");
  const backendPort = expectedPositiveInteger(
    backendPortValue,
    "private backend port",
    65_535,
  );

  await assertOwnRuntimeIdentity(supervisorSha256, supervisorBytes);
  const sanitizedEnvironment = sanitizeUpstreamEnvironment(process.env);
  if (
    sanitizedEnvironment["BRIDGE_HOST"] !== "127.0.0.1" ||
    sanitizedEnvironment["BRIDGE_PORT"] !== String(backendPort) ||
    sanitizedEnvironment["BRIDGE_PORT_SCAN"] !== String(backendPort)
  ) {
    throw new Error("The private upstream listener environment is not exact.");
  }
  replaceEnvironment(sanitizedEnvironment);
  await assertDataDirectory(dataDevice, dataInode);
  assertPermissionBoundary();
  assertCodeGenerationBoundary();
  // This local check is defense in depth while /proc is intentionally absent.
  // The facade performs the exhaustive unbounded target audit after readiness.
  assertLocalDescriptorBaseline();
  await assertOutboundConnectDeniedByKernel();
  installUpstreamNetworkPolicy(backendPort);
  process.env["EASYEDA_SANDBOX_NETWORK_POLICY"] = "connect-denied-eperm";
  await emitSupervisorReady();

  const bridgeToken = await readBridgeBootstrapSecret();
  process.env["BRIDGE_TOKEN"] = bridgeToken;
  const serializedGraph = await readMountedGraph(
    graphPayloadBytes,
    graphPayloadSha256,
  );
  const graph = deserializeCapturedUpstreamModuleGraph(
    serializedGraph,
    expectedGraph,
  );

  process.chdir(DATA_PATH);
  process.argv = [process.execPath, fileURLToPath(graph.entrypointUrl)];
  process.stdin.once("end", exitImmediately);
  process.stdin.once("close", exitImmediately);
  await executeCapturedUpstreamModuleGraph(graph);
}

try {
  await run();
} catch (error) {
  process.stderr.write(
    `EasyEDA upstream supervisor failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
