#!/usr/bin/env node
import { createHash } from "node:crypto";
import {
  access,
  constants as fsConstants,
  lstat,
  open,
  readFile,
  readdir,
} from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import {
  AUTHENTICATED_BRIDGE_BUILD_DIRECTORY,
  AUTHENTICATED_BRIDGE_OUTPUT_FILENAME,
  loadBridgeTokenFile,
} from "./bridge-token.ts";
import {
  REVIEWED_BRIDGE_SOURCE,
  assertReviewedVendoredSource,
  captureVendoredSourceClosure,
} from "./reviewed-bridge-source.ts";
import {
  DESCRIPTOR_SANITIZER_BYTES,
  DESCRIPTOR_SANITIZER_FILE_NAME,
  DESCRIPTOR_SANITIZER_SHA256,
  assertSelfSoftCoreLimitZero,
  controlImplementationFingerprint,
  loadReviewedCompatibilityManifest,
  reviewedCompatibilityManifestFingerprint,
} from "../server/src/core.ts";
import {
  assertReviewedLauncherFingerprint,
  captureLauncherFingerprint,
  launcherFingerprintSha256,
  probeReviewedDescriptorSanitizerRuntime,
} from "../server/src/upstream-trust.ts";
import {
  createPrivateTemporaryDirectory,
  removeEmptyPrivateTemporaryDirectory,
} from "./private-temporary-directory.ts";
import type { PrivateTemporaryDirectory } from "./private-temporary-directory.ts";

interface DoctorCheck {
  readonly check: string;
  readonly detail?: string;
  readonly ok: boolean;
}

type ToolSummary = Awaited<ReturnType<Client["listTools"]>>["tools"][number];

interface McpConfiguration {
  readonly args: string[];
  readonly command: string;
  readonly cwd: string;
  readonly env: Record<string, string>;
}

const TOOL_NAMES = [
  "easyeda_control_status",
  "easyeda_control_discover",
  "easyeda_control_context",
  "easyeda_control_exact_read",
  "easyeda_control_read",
  "easyeda_control_read_batch",
  "easyeda_control_execute",
  "easyeda_control_capture",
  "easyeda_control_export",
  "easyeda_control_plan",
  "easyeda_control_apply",
  "easyeda_control_verify",
  "easyeda_control_rollback",
  "easyeda_control_save_reopen",
  "easyeda_control_checkpoint",
  "easyeda_control_recover_incomplete",
  "easyeda_control_evidence_recover",
  "easyeda_control_evidence_verify",
  "easyeda_control_artifact_read",
] as const;
const SQLITE_BINARY_CANDIDATES = [
  "/usr/bin/sqlite3",
  "/usr/local/bin/sqlite3",
] as const;
const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
async function regularFileExists(path: string): Promise<boolean> {
  try {
    const information = await lstat(path);
    return information.isFile();
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return false;
    }
    throw error;
  }
}
async function pathExists(path: string): Promise<boolean> {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return false;
    }
    throw error;
  }
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readStableRegularFile(
  path: string,
  maximumBytes: number,
): Promise<{
  readonly bytes: Buffer;
  readonly links: number;
  readonly mode: number;
  readonly size: number;
}> {
  const information = await lstat(path);
  if (!information.isFile() || information.size > maximumBytes) {
    throw new Error(`${path} must be a bounded regular file.`);
  }
  const handle = await open(
    path,
    fsConstants.O_RDONLY + fsConstants.O_NOFOLLOW,
  );
  try {
    const opened = await handle.stat();
    if (
      opened.dev !== information.dev ||
      opened.ino !== information.ino ||
      opened.mode !== information.mode ||
      opened.nlink !== information.nlink ||
      opened.size !== information.size ||
      opened.mtimeMs !== information.mtimeMs ||
      opened.ctimeMs !== information.ctimeMs
    ) {
      throw new Error(`${path} changed before it was opened.`);
    }
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (
      after.dev !== opened.dev ||
      after.ino !== opened.ino ||
      after.mode !== opened.mode ||
      after.nlink !== opened.nlink ||
      after.size !== opened.size ||
      after.mtimeMs !== opened.mtimeMs ||
      after.ctimeMs !== opened.ctimeMs
    ) {
      throw new Error(`${path} changed while it was being read.`);
    }
    return {
      bytes,
      links: after.nlink,
      mode: after.mode,
      size: after.size,
    };
  } finally {
    await handle.close();
  }
}

function parseStringRecord(
  value: unknown,
  label: string,
): Record<string, string> {
  if (!isRecord(value)) {
    throw new TypeError(`${label} must be an object of strings.`);
  }
  const output: Record<string, string> = {};
  for (const [name, item] of Object.entries(value)) {
    if (typeof item !== "string") {
      throw new TypeError(`${label} must be an object of strings.`);
    }
    output[name] = item;
  }
  return output;
}

function parseStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be an array of strings.`);
  }
  const output: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      throw new TypeError(`${label} must be an array of strings.`);
    }
    output.push(item);
  }
  return output;
}

function parseMcpConfiguration(value: unknown): McpConfiguration {
  if (!isRecord(value) || !isRecord(value["mcpServers"])) {
    throw new TypeError("MCP configuration must contain mcpServers.");
  }
  const server = value["mcpServers"]["easyeda_pro_control"];
  if (
    !isRecord(server) ||
    typeof server["command"] !== "string" ||
    typeof server["cwd"] !== "string"
  ) {
    throw new TypeError("MCP EasyEDA server configuration is malformed.");
  }
  return {
    args: parseStringArray(server["args"], "MCP arguments"),
    command: server["command"],
    cwd: server["cwd"],
    env: parseStringRecord(server["env"], "MCP environment"),
  };
}
const pluginRoot = resolve(import.meta.dirname, "..");
const manifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
const mcpPath = join(pluginRoot, ".mcp.json");
const distPaths = [
  join(
    pluginRoot,
    "server",
    "bin",
    DESCRIPTOR_SANITIZER_FILE_NAME,
  ),
  join(pluginRoot, "server", "dist", "server.mjs"),
  join(pluginRoot, "server", "dist", "upstream-supervisor.mjs"),
];
const vendoredBridgeRoot = join(pluginRoot, "easyeda-bridge-extension");
const required = [
  ".codex-plugin/plugin.json",
  ".mcp.json",
  "reviewed-compatibility.json",
  "licenses/bundled-runtime.json",
  "server/src/core.ts",
  "server/src/descriptor-sanitizer-identity.ts",
  "server/src/upstream-trust.ts",
  "server/bin/easyeda-fd-sanitizer",
  "server/native/easyeda-fd-sanitizer.S",
  "server/native/easyeda-fd-sanitizer.ld",
  "server/dist/server.mjs",
  "server/dist/upstream-supervisor.mjs",
  "skills/easyeda-pro-control/SKILL.md",
  "skills/easyeda-pro-control/agents/openai.yaml",
];
const checks: DoctorCheck[] = [];
const check = (name: string, ok: unknown, detail?: string): void => {
  checks.push({
    check: name,
    ok: Boolean(ok),
    ...(detail === undefined || detail.length === 0 ? {} : { detail }),
  });
};

for (const relativePath of required) {
  check(
    `file:${relativePath}`,
    await regularFileExists(join(pluginRoot, relativePath)),
  );
}

try {
  const sanitizer = await readStableRegularFile(
    join(pluginRoot, "server", "bin", DESCRIPTOR_SANITIZER_FILE_NAME),
    DESCRIPTOR_SANITIZER_BYTES,
  );
  check(
    "reviewed-descriptor-sanitizer-identity",
    sanitizer.size === DESCRIPTOR_SANITIZER_BYTES &&
      sanitizer.links === 1 &&
      sanitizer.mode % (0o7777 + 1) === 0o755 &&
      createHash("sha256").update(sanitizer.bytes).digest("hex") ===
        DESCRIPTOR_SANITIZER_SHA256,
  );
} catch (error) {
  check(
    "reviewed-descriptor-sanitizer-identity",
    false,
    errorMessage(error),
  );
}

let observedVendoredBridgeSource:
  | Awaited<ReturnType<typeof captureVendoredSourceClosure>>
  | { readonly error: string };
try {
  const closure = await captureVendoredSourceClosure(vendoredBridgeRoot);
  assertReviewedVendoredSource(closure);
  observedVendoredBridgeSource = closure;
  check("reviewed-vendored-bridge-source", true);
} catch (error) {
  observedVendoredBridgeSource = { error: errorMessage(error) };
  check("reviewed-vendored-bridge-source", false, errorMessage(error));
}

let reviewedCompatibility:
  | ReturnType<typeof loadReviewedCompatibilityManifest>
  | { readonly error: string };
let reviewedCompatibilityFingerprint: unknown;
try {
  reviewedCompatibility = loadReviewedCompatibilityManifest();
  reviewedCompatibilityFingerprint = reviewedCompatibilityManifestFingerprint();
  check("reviewed-compatibility-schema", true);
} catch (error) {
  reviewedCompatibility = { error: errorMessage(error) };
  check("reviewed-compatibility-schema", false, errorMessage(error));
}

const manifestText = await readFile(manifestPath, "utf8");
const manifest: unknown = JSON.parse(manifestText);
if (!isRecord(manifest)) {
  throw new TypeError("Plugin manifest must be an object.");
}
const mcpText = await readFile(mcpPath, "utf8");
const mcpConfig = parseMcpConfiguration(JSON.parse(mcpText));
check("manifest-name", manifest["name"] === "easyeda-pro-control");
check("manifest-mcp", manifest["mcpServers"] === "./.mcp.json");
check(
  "node-exact-24.18.0",
  process.versions.node === "24.18.0",
  process.version,
);
check(
  "platform-linux-x64",
  process.platform === "linux" && process.arch === "x64",
  `${process.platform}/${process.arch}`,
);
try {
  await assertSelfSoftCoreLimitZero();
  check("soft-core-limit-zero", true, "0");
} catch (error) {
  check("soft-core-limit-zero", false, errorMessage(error));
}
check("configured-node", await regularFileExists(mcpConfig.command));
check(
  "configured-bundle",
  mcpConfig.args.length === 1 &&
    mcpConfig.args[0] === "server/dist/server.mjs" &&
    mcpConfig.cwd === ".",
);
const configuredDataDirectory =
  mcpConfig.env["EASYEDA_CONTROL_DATA_DIR"] ?? "";
const companionBridgeArtifactBasePath = join(
  configuredDataDirectory,
  AUTHENTICATED_BRIDGE_BUILD_DIRECTORY,
  AUTHENTICATED_BRIDGE_OUTPUT_FILENAME,
);
const companionBridgeReceiptPath =
  `${companionBridgeArtifactBasePath}.receipt.json`;
const companionBridgeBuildDirectory = dirname(
  companionBridgeArtifactBasePath,
);
const companionBridgePairLockPath = join(
  companionBridgeBuildDirectory,
  `.${basename(companionBridgeArtifactBasePath)}.archive-receipt.lock`,
);
const companionBridgePairLockCandidatePrefix =
  `.${basename(companionBridgePairLockPath)}.`;
const companionBridgePairLockCandidateSuffix = ".candidate";
let observedBridgePairLockState:
  | {
      readonly directoryPath: string;
      readonly fixedLock: null;
      readonly observedCandidateNames: readonly string[];
    }
  | {
      readonly directoryPath: string;
      readonly fixedLock: {
        readonly device: string;
        readonly inode: string;
        readonly links: number;
        readonly mode: string;
        readonly path: string;
      };
      readonly observedCandidateNames: readonly string[];
    }
  | { readonly error: string };
try {
  const directoryInformation = await lstat(companionBridgeBuildDirectory);
  if (
    !directoryInformation.isDirectory() ||
    directoryInformation.isSymbolicLink() ||
    directoryInformation.mode % 0o1000 !== 0o700 ||
    (typeof process.getuid === "function" &&
      directoryInformation.uid !== process.getuid())
  ) {
    throw new Error(
      "The authenticated bridge build directory must be an owner-only, non-symlink directory before pair-lock inspection.",
    );
  }
  const bridgeBuildDirectoryEntries = await readdir(
    companionBridgeBuildDirectory,
  );
  const observedCandidateNames = bridgeBuildDirectoryEntries
    .filter((name) => {
      if (
        !name.startsWith(companionBridgePairLockCandidatePrefix) ||
        !name.endsWith(companionBridgePairLockCandidateSuffix)
      ) {
        return false;
      }
      const nonce = name.slice(
        companionBridgePairLockCandidatePrefix.length,
        -companionBridgePairLockCandidateSuffix.length,
      );
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u.test(
        nonce,
      );
    })
    .toSorted();
  let fixedLockInformation;
  try {
    fixedLockInformation = await lstat(companionBridgePairLockPath);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      fixedLockInformation = undefined;
    } else {
      throw error;
    }
  }
  observedBridgePairLockState =
    fixedLockInformation === undefined
      ? {
          directoryPath: companionBridgeBuildDirectory,
          fixedLock: null,
          observedCandidateNames,
        }
      : {
          directoryPath: companionBridgeBuildDirectory,
          fixedLock: {
            device: String(fixedLockInformation.dev),
            inode: String(fixedLockInformation.ino),
            links: fixedLockInformation.nlink,
            mode: (fixedLockInformation.mode % 0o1000).toString(8),
            path: companionBridgePairLockPath,
          },
          observedCandidateNames,
        };
  const noPairLockResidue =
    observedBridgePairLockState.fixedLock === null &&
    observedCandidateNames.length === 0;
  check(
    "authenticated-bridge-pair-lock-residue",
    noPairLockResidue,
    noPairLockResidue
      ? "none observed"
      : `${JSON.stringify(observedBridgePairLockState)}. This is a read-only snapshot; stop every builder and follow exact-path manual recovery before removing anything.`,
  );
} catch (error) {
  if (
    error instanceof Error &&
    "code" in error &&
    error.code === "ENOENT"
  ) {
    observedBridgePairLockState = {
      directoryPath: companionBridgeBuildDirectory,
      fixedLock: null,
      observedCandidateNames: [],
    };
    check(
      "authenticated-bridge-pair-lock-residue",
      true,
      "not-observed: the private bridge build directory is absent",
    );
  } else {
    observedBridgePairLockState = { error: errorMessage(error) };
    check(
      "authenticated-bridge-pair-lock-residue",
      false,
      errorMessage(error),
    );
  }
}
const bridgeTokenPath = mcpConfig.env["EASYEDA_BRIDGE_TOKEN_FILE"] ?? "";
let bridgeTokenFile:
  | {
      readonly bytes: number;
      readonly mode: string;
      readonly path: string;
    }
  | { readonly error: string };
let bridgeTokenSha256: string | undefined;
try {
  const tokenProof = await loadBridgeTokenFile(bridgeTokenPath);
  bridgeTokenSha256 = tokenProof.sha256;
  const info = await lstat(bridgeTokenPath);
  const permissionMode = info.mode % 0o1000;
  const valid =
    configuredDataDirectory.length > 0 &&
    bridgeTokenPath === join(configuredDataDirectory, "bridge-token") &&
    tokenProof.path === bridgeTokenPath;
  bridgeTokenFile = {
    path: bridgeTokenPath,
    bytes: info.size,
    mode: permissionMode.toString(8),
  };
  check("bridge-token-file", valid, JSON.stringify(bridgeTokenFile));
} catch (error) {
  bridgeTokenFile = { error: errorMessage(error) };
  check("bridge-token-file", false, errorMessage(error));
}

let companionBridgeBuild:
  | {
      readonly artifactBytes: number;
      readonly artifactMode: string;
      readonly artifactPath: string;
      readonly buildId: string;
      readonly compatibilityStatus:
        | "reviewed-connected-build-id"
        | "validation-required";
      readonly importVerified: false;
      readonly productionLiveVerified: false;
      readonly receiptMode: string;
      readonly receiptPath: string;
      readonly reviewedConnectedBuildId: string;
      readonly sourceClosureSha256: string;
      readonly status: "verified-build-artifact";
    }
  | {
      readonly importVerified: false;
      readonly note: string;
      readonly productionLiveVerified: false;
      readonly status: "not-observed";
    }
  | {
      readonly error: string;
      readonly importVerified: false;
      readonly productionLiveVerified: false;
    };
const legacyCompanionArtifactExists = await pathExists(
  companionBridgeArtifactBasePath,
);
const companionReceiptExists = await pathExists(companionBridgeReceiptPath);
if (!legacyCompanionArtifactExists && !companionReceiptExists) {
  companionBridgeBuild = {
    status: "not-observed",
    importVerified: false,
    productionLiveVerified: false,
    note: "No authoritative private authenticated-bridge build receipt is present under the configured control directory. Offline doctor cannot determine whether an authenticated extension was imported into EasyEDA Pro.",
  };
  check(
    "authenticated-bridge-build-artifact",
    true,
    companionBridgeBuild.note,
  );
  check(
    "authenticated-bridge-connected-build-id",
    true,
    "not-observed: no local receipt build ID is available to compare with the reviewed connected dispatcher build ID; this is not live-compatibility proof.",
  );
} else {
  try {
    if (legacyCompanionArtifactExists) {
      throw new Error(
        `A legacy fixed-path authenticated bridge artifact remains at ${companionBridgeArtifactBasePath}. Verify that it is obsolete and remove it; import only the immutable generation named by the fixed receipt.`,
      );
    }
    if (!companionReceiptExists) {
      throw new Error("The authenticated bridge commit receipt is absent.");
    }
    const receiptRead = await readStableRegularFile(
      companionBridgeReceiptPath,
      1024 * 1024,
    );
    const receiptMode = receiptRead.mode % 0o1000;
    if (receiptMode !== 0o600) {
      throw new Error(
        "The authenticated bridge commit receipt must have mode 0600.",
      );
    }
    const receipt: unknown = JSON.parse(receiptRead.bytes.toString("utf8"));
    if (!isRecord(receipt)) {
      throw new Error("The authenticated bridge commit receipt is malformed.");
    }
    const buildId = receipt["buildId"];
    if (
      typeof buildId !== "string" ||
      !/^d[0-9a-f]{4}x[0-9a-f]{4}x[0-9a-f]{4}$/u.test(buildId)
    ) {
      throw new Error(
        "The authenticated bridge commit receipt has no valid dispatcher build ID.",
      );
    }
    if ("error" in reviewedCompatibility) {
      throw new Error(
        "The reviewed connected dispatcher build ID is unavailable because the compatibility manifest did not validate.",
      );
    }
    const reviewedConnectedBuildId =
      reviewedCompatibility.connectedRuntime.dispatcher.buildId;
    const compatibilityStatus =
      buildId === reviewedConnectedBuildId
        ? "reviewed-connected-build-id"
        : "validation-required";
    const outputSha256 = receipt["outputSha256"];
    if (
      typeof outputSha256 !== "string" ||
      !/^[a-f0-9]{64}$/u.test(outputSha256)
    ) {
      throw new Error(
        "The authenticated bridge commit receipt has no valid archive hash.",
      );
    }
    const artifactBaseName = basename(companionBridgeArtifactBasePath);
    const expectedArtifactPath = join(
      dirname(companionBridgeArtifactBasePath),
      `${artifactBaseName.slice(0, -".eext".length)}.${outputSha256}.eext`,
    );
    if (receipt["outputPath"] !== expectedArtifactPath) {
      throw new Error(
        "The authenticated bridge commit receipt does not select its same-directory, hash-named immutable generation.",
      );
    }
    const artifactRead = await readStableRegularFile(
      expectedArtifactPath,
      64 * 1024 * 1024,
    );
    const artifactSha256 = createHash("sha256")
      .update(artifactRead.bytes)
      .digest("hex");
    const artifactMode = artifactRead.mode % 0o1000;
    if (artifactMode !== 0o600) {
      throw new Error(
        "The authenticated bridge generation must have mode 0600.",
      );
    }
    const authentication =
      isRecord(receipt["authentication"])
        ? receipt["authentication"]
        : undefined;
    const publicEndpoint =
      isRecord(authentication) && isRecord(authentication["publicEndpoint"])
        ? authentication["publicEndpoint"]
        : undefined;
    const source =
      isRecord(receipt["source"])
        ? receipt["source"]
        : undefined;
    const configuredBridgePort = Number(
      mcpConfig.env["EASYEDA_BRIDGE_PORT"] ?? "",
    );
    if (
      receipt["schema"] !==
        "easyeda-pro-control.authenticated-bridge-build.v2" ||
      receipt["outputSha256"] !== artifactSha256 ||
      receipt["outputBytes"] !== artifactRead.size ||
      receipt["tokenSha256"] !== bridgeTokenSha256 ||
      !isRecord(authentication) ||
      authentication["protocol"] !==
        "easyeda-pro-control.bridge-auth.v1" ||
      authentication["rawTokenTransmission"] !== false ||
      authentication["adjacentPortFallback"] !== false ||
      !isRecord(publicEndpoint) ||
      publicEndpoint["host"] !== mcpConfig.env["EASYEDA_BRIDGE_HOST"] ||
      publicEndpoint["port"] !== configuredBridgePort ||
      !isRecord(source) ||
      source["repository"] !== REVIEWED_BRIDGE_SOURCE.repository ||
      source["commit"] !== REVIEWED_BRIDGE_SOURCE.commit ||
      source["upstreamTreeSha1"] !==
        REVIEWED_BRIDGE_SOURCE.upstreamTreeSha1 ||
      source["closureSha256"] !== REVIEWED_BRIDGE_SOURCE.closureSha256 ||
      source["fileCount"] !== REVIEWED_BRIDGE_SOURCE.fileCount ||
      source["totalBytes"] !== REVIEWED_BRIDGE_SOURCE.totalBytes ||
      JSON.stringify(source["derivative"]) !==
        JSON.stringify(REVIEWED_BRIDGE_SOURCE.derivative) ||
      source["builtFromPrivateSnapshot"] !== true ||
      source["privateSnapshotSealed"] !== true ||
      source["postConsumptionVerified"] !== true ||
      typeof source["sealedPathCount"] !== "number" ||
      !Number.isSafeInteger(source["sealedPathCount"]) ||
      source["sealedPathCount"] <= 0
    ) {
      throw new Error(
        "The authenticated bridge build receipt does not match the configured token, endpoint, reviewed source closure, and artifact bytes.",
      );
    }
    companionBridgeBuild = {
      status: "verified-build-artifact",
      artifactPath: expectedArtifactPath,
      receiptPath: companionBridgeReceiptPath,
      artifactBytes: artifactRead.size,
      artifactMode: artifactMode.toString(8),
      buildId,
      compatibilityStatus,
      reviewedConnectedBuildId,
      receiptMode: receiptMode.toString(8),
      sourceClosureSha256: REVIEWED_BRIDGE_SOURCE.closureSha256,
      importVerified: false,
      productionLiveVerified: false,
    };
    check("authenticated-bridge-build-artifact", true);
    check(
      "authenticated-bridge-connected-build-id",
      compatibilityStatus === "reviewed-connected-build-id",
      compatibilityStatus === "reviewed-connected-build-id"
        ? `Receipt build ${buildId} matches the reviewed connected dispatcher build ID; offline doctor still does not prove import or a live connection.`
        : `validation-required: receipt build ${buildId} differs from reviewed connected dispatcher build ${reviewedConnectedBuildId}; exact and private operations remain unavailable pending connected review.`,
    );
  } catch (error) {
    companionBridgeBuild = {
      error: errorMessage(error),
      importVerified: false,
      productionLiveVerified: false,
    };
    check(
      "authenticated-bridge-build-artifact",
      false,
      errorMessage(error),
    );
    check(
      "authenticated-bridge-connected-build-id",
      false,
      "unavailable because the local authenticated-bridge build artifact or receipt did not validate.",
    );
  }
}

async function sha256File(path: string): Promise<string> {
  const hash = createHash("sha256");
  const file = await open(path, "r");
  try {
    for await (const streamChunk of file.createReadStream({
      autoClose: false,
    })) {
      const chunk: unknown = streamChunk;
      if (!Buffer.isBuffer(chunk)) {
        throw new TypeError(`Expected a binary stream while hashing ${path}.`);
      }
      hash.update(chunk);
    }
  } finally {
    await file.close();
  }
  return hash.digest("hex");
}

let observedLauncher: unknown;
if (!("error" in reviewedCompatibility)) {
  const configuredNames = [
    "EASYEDA_UPSTREAM_COMMAND",
    "EASYEDA_UPSTREAM_ARGS_JSON",
    "EASYEDA_UPSTREAM_CWD",
  ] as const;
  const previousEnvironment = new Map<string, string | undefined>();
  try {
    for (const name of configuredNames) {
      previousEnvironment.set(name, process.env[name]);
      const value = mcpConfig.env[name];
      if (value === undefined) {
        throw new Error(`${name} is absent from the MCP configuration.`);
      }
      process.env[name] = value;
    }
    const captured = await captureLauncherFingerprint();
    observedLauncher = {
      ...captured.fingerprint,
      fingerprintSha256: launcherFingerprintSha256(captured.fingerprint),
      sealedPathCount: captured.seals.length,
    };
    check(
      "reviewed-upstream-launcher",
      assertReviewedLauncherFingerprint(
        captured.fingerprint,
        reviewedCompatibility.upstream.launcher,
      ),
    );
    try {
      await probeReviewedDescriptorSanitizerRuntime(
        captured.fingerprint.sandbox,
      );
      check("reviewed-descriptor-sanitizer-runtime", true);
    } catch (error) {
      check(
        "reviewed-descriptor-sanitizer-runtime",
        false,
        errorMessage(error),
      );
    }
  } catch (error) {
    observedLauncher = { error: errorMessage(error) };
    check("reviewed-upstream-launcher", false, errorMessage(error));
    check(
      "reviewed-descriptor-sanitizer-runtime",
      false,
      errorMessage(error),
    );
  } finally {
    for (const name of configuredNames) {
      const previous = previousEnvironment.get(name);
      if (previous === undefined) {
        Reflect.deleteProperty(process.env, name);
      } else {
        process.env[name] = previous;
      }
    }
  }
}

const assetsRoot = mcpConfig.env["EASYEDA_ASSETS_ROOT"] ?? "";
const pcbBundleVersion = mcpConfig.env["EASYEDA_PCB_BUNDLE_VERSION"] ?? "";
const publicApiBundleVersion =
  mcpConfig.env["EASYEDA_PUBLIC_API_BUNDLE_VERSION"] ?? "";
const installedBundleFiles = {
  pcbImplementation: join(
    assetsRoot,
    "pro-pcb",
    pcbBundleVersion,
    "js",
    "pcb.js",
  ),
  publicApiImplementation: join(
    assetsRoot,
    "pro-api",
    publicApiBundleVersion,
    "api.js",
  ),
  publicApiAdapter: join(
    assetsRoot,
    "pro-api",
    publicApiBundleVersion,
    "api-types.js",
  ),
  publicApiDeclarations: join(
    assetsRoot,
    "pro-api",
    publicApiBundleVersion,
    "api-types.d.ts",
  ),
};
const installedBundleExistence = await Promise.all(
  Object.values(installedBundleFiles).map((path) => regularFileExists(path)),
);
const installedBundlesExist = installedBundleExistence.every(Boolean);
check("installed-easyeda-bundles", installedBundlesExist);
let sqliteBinary: string | undefined;
for (const candidate of SQLITE_BINARY_CANDIDATES) {
  try {
    await access(candidate, fsConstants.X_OK);
    sqliteBinary = candidate;
    break;
  } catch {
    // Continue to the next fixed absolute candidate.
  }
}
check(
  "sqlite3-absolute-candidate",
  sqliteBinary !== undefined,
  sqliteBinary,
);

let installedBundleHashes;
if (installedBundlesExist && !("error" in reviewedCompatibility)) {
  installedBundleHashes = {
    pcbImplementation: await sha256File(installedBundleFiles.pcbImplementation),
    publicApiImplementation: await sha256File(
      installedBundleFiles.publicApiImplementation,
    ),
    publicApiAdapter: await sha256File(installedBundleFiles.publicApiAdapter),
    publicApiDeclarations: await sha256File(
      installedBundleFiles.publicApiDeclarations,
    ),
  };
  check(
    "installed-easyeda-bundle-hashes",
    installedBundleHashes.pcbImplementation ===
      reviewedCompatibility.installedBundles.pcbEditor
        .implementationSha256 &&
      installedBundleHashes.publicApiImplementation ===
        reviewedCompatibility.installedBundles.publicApi
          .implementationSha256 &&
      installedBundleHashes.publicApiAdapter ===
        reviewedCompatibility.installedBundles.publicApi.adapterSha256 &&
      installedBundleHashes.publicApiDeclarations ===
        reviewedCompatibility.installedBundles.publicApi.declarationsSha256,
  );
}

async function bundleProjection(
  source: Awaited<ReturnType<typeof controlImplementationFingerprint>>,
): Promise<{
  readonly fileCount: number;
  readonly files: {
    readonly bytes: number;
    readonly relativePath: string;
    readonly sha256: string;
  }[];
  readonly operationSchema: string;
  readonly sha256: string;
  readonly version: string;
}> {
  const files = [];
  for (const path of distPaths) {
    const bytes = await readFile(path);
    files.push({
      relativePath: path.slice(path.lastIndexOf("/") + 1),
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
  files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  const composite = files
    .map(
      (file) =>
        `${file.relativePath}\0${file.bytes}\0${file.sha256}\n`,
    )
    .join("");
  return {
    version: source.version,
    operationSchema: source.operationSchema,
    sha256: createHash("sha256").update(composite).digest("hex"),
    fileCount: files.length,
    files,
  };
}

const distPathExistence = await Promise.all(
  distPaths.map((path) => regularFileExists(path)),
);
if (!("error" in reviewedCompatibility) && distPathExistence.every(Boolean)) {
  const source = await controlImplementationFingerprint();
  const sourceProjection = {
    version: source.version,
    operationSchema: source.operationSchema,
    sha256: source.sha256,
    fileCount: source.files.length,
    files: source.files.map(({ relativePath, bytes, sha256 }) => ({
      relativePath,
      bytes,
      sha256,
    })),
  };
  const observedBundleProjection = await bundleProjection(source);
  check(
    "reviewed-source-facade",
    JSON.stringify(sourceProjection) ===
      JSON.stringify(reviewedCompatibility.facadeImplementation["source-tree"]),
  );
  check(
    "reviewed-bundle-facade",
    JSON.stringify(observedBundleProjection) ===
      JSON.stringify(reviewedCompatibility.facadeImplementation.bundle),
  );
}

function meaningfulOutputSchema(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  if (
    isRecord(value["properties"]) &&
    Object.keys(value["properties"]).length > 0
  ) {
    return true;
  }
  for (const keyword of ["anyOf", "oneOf"] as const) {
    const alternatives = value[keyword];
    if (
      Array.isArray(alternatives) &&
      alternatives.length > 0 &&
      alternatives.every((item) => meaningfulOutputSchema(item))
    ) {
      return true;
    }
  }
  return false;
}

let toolCatalog:
  | {
      readonly allHaveMeaningfulOutputSchema: boolean;
      readonly count: number;
      readonly names: string[];
    }
  | { readonly error: string };
let smokeDirectory: PrivateTemporaryDirectory | undefined;
try {
  smokeDirectory = await createPrivateTemporaryDirectory(
    "/tmp/easyeda-control-doctor-",
    "The EasyEDA doctor smoke directory",
  );
  const transport = new StdioClientTransport({
    command: mcpConfig.command,
    args: [join(pluginRoot, "server", "dist", "server.mjs")],
    cwd: pluginRoot,
    env: {
      ...process.env,
      ...mcpConfig.env,
      EASYEDA_CONTROL_DATA_DIR: smokeDirectory.path,
    },
    stderr: "pipe",
  });
  const client = new Client(
    { name: "easyeda-pro-control-doctor", version: "0.3.0" },
    { capabilities: {} },
  );
  await client.connect(transport);
  const listed = await client.listTools();
  const listedTools: ToolSummary[] = listed.tools;
  toolCatalog = {
    count: listedTools.length,
    allHaveMeaningfulOutputSchema: listedTools.every((tool) =>
      meaningfulOutputSchema(tool.outputSchema),
    ),
    names: listedTools.map((tool) => tool.name).toSorted(),
  };
  await client.close();
  await transport.close().catch(() => {
    // Closing an already closed doctor transport needs no recovery action.
  });
  check(
    "mcp-tool-catalog",
    toolCatalog.count === TOOL_NAMES.length &&
      toolCatalog.allHaveMeaningfulOutputSchema &&
      JSON.stringify(toolCatalog.names) ===
        JSON.stringify([...TOOL_NAMES].toSorted()),
  );
} catch (error) {
  toolCatalog = { error: errorMessage(error) };
  check("mcp-tool-catalog", false, toolCatalog.error);
} finally {
  if (smokeDirectory !== undefined) {
    await removeEmptyPrivateTemporaryDirectory(
      smokeDirectory,
      "The EasyEDA doctor smoke directory",
      ["operations"],
    ).catch((error: unknown) => {
      check("mcp-tool-catalog-cleanup", false, errorMessage(error));
    });
  }
}

const distSha256 = Object.fromEntries(
  await Promise.all(
    distPaths
      .filter((_path, index) => distPathExistence[index] === true)
      .map(async (path) => [path, await sha256File(path)] as const),
  ),
);
const result = {
  ok: checks.every((item) => item.ok),
  pluginRoot,
  node: process.version,
  offline: process.argv.includes("--offline"),
  checks,
  toolCatalog,
  observedLauncher,
  bridgeTokenFile,
  observedBridgePairLockState,
  companionBridgeBuild,
  observedVendoredBridgeSource,
  installedBundleFiles,
  installedBundleHashes,
  reviewedCompatibility,
  reviewedCompatibilityFingerprint,
  distSha256,
  note: "Offline doctor hashes the reviewed upstream execution closure without starting it and does not connect to EasyEDA. A verified .eext build receipt proves only the local private artifact, never that EasyEDA imported or loaded it. A receipt build-ID mismatch is reported as validation-required and keeps exact/private operations unavailable; use easyeda_control_status, context, and bounded reviewed public reads in a new Codex task to collect connected validation evidence.",
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!result.ok) {
  process.exitCode = 1;
}
