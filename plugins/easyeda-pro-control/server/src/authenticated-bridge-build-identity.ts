import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import type { Stats } from "node:fs";
import { lstat, open } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import process from "node:process";

import type { ControlRootCapability } from "./control-root.ts";

const AUTHENTICATED_BRIDGE_BUILD_DIRECTORY = "bridge-build";
const AUTHENTICATED_BRIDGE_OUTPUT_FILENAME =
  "easyeda-pro-control-authenticated-bridge.eext";
const AUTHENTICATED_BRIDGE_HOST = "127.0.0.1";
const AUTHENTICATED_BRIDGE_PORT = 49_621;
const MAXIMUM_ARCHIVE_BYTES = 64 * 1024 * 1024;
const MAXIMUM_RECEIPT_BYTES = 1024 * 1024;

export const AUTHENTICATED_BRIDGE_REVIEWED_SOURCE_IDENTITY = Object.freeze({
  closureSha256:
    "ce52ca1bf5b2d3d214454790a24516ae5182f1867851c2786c0269bbc7892680",
  commit: "964c05082f1c7c9e8b98f56e967e36bfc3f26128",
  fileCount: 70,
  repository: "https://github.com/oaslananka/easyeda-mcp-pro",
  totalBytes: 847_709,
  upstreamTreeSha1: "cc8893215e736f9efca78e4216033469008ea8e9",
});

interface OpenPrivateDirectory {
  readonly handle: FileHandle;
  readonly path: string;
  readonly stat: Stats;
}

interface StablePrivateFile {
  readonly bytes: Buffer;
  readonly path: string;
  readonly stat: Stats;
}

export interface AuthenticatedBridgeBuildIdentity {
  readonly authenticatedIndexBuildId: string;
  readonly authenticationKeySha256: string;
  readonly outputPath: string;
  readonly outputSha256: string;
  readonly receiptPath: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sameIdentity(left: Stats, right: Stats): boolean {
  return left.dev === right.dev && left.ino === right.ino;
}

function assertPrivateOwnedFile(stat: Stats, label: string): void {
  if (
    !stat.isFile() ||
    stat.nlink !== 1 ||
    stat.mode % 0o1000 !== 0o600 ||
    (typeof process.getuid === "function" && stat.uid !== process.getuid())
  ) {
    throw new Error(`${label} must be an owner-owned mode-0600 single-link file.`);
  }
}

function assertPrivateOwnedDirectory(stat: Stats, label: string): void {
  if (
    !stat.isDirectory() ||
    stat.mode % 0o1000 !== 0o700 ||
    (typeof process.getuid === "function" && stat.uid !== process.getuid())
  ) {
    throw new Error(`${label} must be an owner-owned mode-0700 directory.`);
  }
}

async function readStablePrivateChildFile(
  parent: OpenPrivateDirectory,
  name: string,
  maximumBytes: number,
  label: string,
): Promise<StablePrivateFile> {
  const descriptorPath = `/proc/self/fd/${parent.handle.fd}/${name}`;
  const before = await lstat(descriptorPath);
  if (before.isSymbolicLink() || before.size > maximumBytes) {
    throw new Error(`${label} is not a bounded regular file.`);
  }
  assertPrivateOwnedFile(before, label);
  const handle = await open(
    descriptorPath,
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
  );
  try {
    const opened = await handle.stat();
    if (!sameIdentity(before, opened) || opened.size !== before.size) {
      throw new Error(`${label} changed before it was opened.`);
    }
    assertPrivateOwnedFile(opened, label);
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (
      !sameIdentity(opened, after) ||
      after.size !== opened.size ||
      after.mtimeMs !== opened.mtimeMs ||
      after.ctimeMs !== opened.ctimeMs
    ) {
      throw new Error(`${label} changed while it was read.`);
    }
    return { bytes, path: join(parent.path, name), stat: after };
  } finally {
    await handle.close();
  }
}

export async function loadAuthenticatedBridgeBuildIdentity(
  authenticationKey: string,
  controlRoot: ControlRootCapability,
): Promise<AuthenticatedBridgeBuildIdentity> {
  const configuredControlRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  if (configuredControlRoot !== controlRoot.path) {
    throw new Error(
      "EASYEDA_CONTROL_DATA_DIR must match the retained control-root capability before bridge admission.",
    );
  }
  await controlRoot.assertCurrent();
  let build: OpenPrivateDirectory | undefined;
  try {
    const opened = await controlRoot.openDirectory(
      join(controlRoot.path, AUTHENTICATED_BRIDGE_BUILD_DIRECTORY),
      false,
    );
    build = {
      handle: opened.handle,
      path: opened.absolute,
      stat: await opened.handle.stat(),
    };
    assertPrivateOwnedDirectory(
      build.stat,
      "Authenticated bridge build directory",
    );
    const receiptFile = await readStablePrivateChildFile(
      build,
      `${AUTHENTICATED_BRIDGE_OUTPUT_FILENAME}.receipt.json`,
      MAXIMUM_RECEIPT_BYTES,
      "Authenticated bridge build receipt",
    );
    const authenticationKeySha256 = createHash("sha256")
      .update(authenticationKey, "utf8")
      .digest("hex");
    const parsed: unknown = JSON.parse(receiptFile.bytes.toString("utf8"));
    if (
      !isRecord(parsed) ||
      typeof parsed["outputPath"] !== "string" ||
      typeof parsed["outputSha256"] !== "string" ||
      !/^[0-9a-f]{64}$/u.test(parsed["outputSha256"])
    ) {
      throw new Error(
        "The authenticated bridge commit receipt has no valid immutable generation.",
      );
    }
    const expectedGenerationName = AUTHENTICATED_BRIDGE_OUTPUT_FILENAME.replace(
      /\.eext$/u,
      `.${parsed["outputSha256"]}.eext`,
    );
    if (
      dirname(parsed["outputPath"]) !== build.path ||
      basename(parsed["outputPath"]) !== expectedGenerationName
    ) {
      throw new Error(
        "The authenticated bridge commit receipt points outside its exact immutable generation namespace.",
      );
    }
    const archive = await readStablePrivateChildFile(
      build,
      expectedGenerationName,
      MAXIMUM_ARCHIVE_BYTES,
      "Authenticated bridge archive generation",
    );
    await controlRoot.assertCurrent();
    const archiveSha256 = createHash("sha256")
      .update(archive.bytes)
      .digest("hex");
    const authentication =
      isRecord(parsed) && isRecord(parsed["authentication"])
        ? parsed["authentication"]
        : undefined;
    const endpoint =
      isRecord(authentication) && isRecord(authentication["publicEndpoint"])
        ? authentication["publicEndpoint"]
        : undefined;
    const source =
      isRecord(parsed) && isRecord(parsed["source"])
        ? parsed["source"]
        : undefined;
    if (
      parsed["schema"] !==
        "easyeda-pro-control.authenticated-bridge-build.v2" ||
      parsed["outputPath"] !== archive.path ||
      parsed["outputSha256"] !== archiveSha256 ||
      parsed["outputBytes"] !== archive.stat.size ||
      parsed["tokenSha256"] !== authenticationKeySha256 ||
      typeof parsed["authenticatedIndexBuildId"] !== "string" ||
      !/^i[A-Za-z0-9_-]{43}$/u.test(parsed["authenticatedIndexBuildId"]) ||
      typeof parsed["indexSha256"] !== "string" ||
      !/^[0-9a-f]{64}$/u.test(parsed["indexSha256"]) ||
      !isRecord(authentication) ||
      authentication["protocol"] !==
        "easyeda-pro-control.bridge-auth.v1" ||
      authentication["rawTokenTransmission"] !== false ||
      authentication["adjacentPortFallback"] !== false ||
      !isRecord(endpoint) ||
      endpoint["host"] !== AUTHENTICATED_BRIDGE_HOST ||
      endpoint["port"] !== AUTHENTICATED_BRIDGE_PORT ||
      !isRecord(source) ||
      source["repository"] !==
        AUTHENTICATED_BRIDGE_REVIEWED_SOURCE_IDENTITY.repository ||
      source["commit"] !==
        AUTHENTICATED_BRIDGE_REVIEWED_SOURCE_IDENTITY.commit ||
      source["upstreamTreeSha1"] !==
        AUTHENTICATED_BRIDGE_REVIEWED_SOURCE_IDENTITY.upstreamTreeSha1 ||
      source["closureSha256"] !==
        AUTHENTICATED_BRIDGE_REVIEWED_SOURCE_IDENTITY.closureSha256 ||
      source["fileCount"] !==
        AUTHENTICATED_BRIDGE_REVIEWED_SOURCE_IDENTITY.fileCount ||
      source["totalBytes"] !==
        AUTHENTICATED_BRIDGE_REVIEWED_SOURCE_IDENTITY.totalBytes ||
      source["builtFromPrivateSnapshot"] !== true ||
      source["privateSnapshotSealed"] !== true ||
      source["postConsumptionVerified"] !== true
    ) {
      throw new Error(
        "The private authenticated bridge archive and build receipt are not a verified matching pair for the configured credential epoch.",
      );
    }
    return {
      authenticatedIndexBuildId: parsed["authenticatedIndexBuildId"],
      authenticationKeySha256,
      outputPath: archive.path,
      outputSha256: archiveSha256,
      receiptPath: receiptFile.path,
    };
  } finally {
    await build?.handle.close();
  }
}
