import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { readFileSync } from "node:fs";

export { assertSelfSoftCoreLimitZero } from "./soft-core-limit.ts";

export const CONTROL_VERSION = "0.3.0";
export const OPERATION_SCHEMA = "easyeda-pro-control.operation.v2";

export type UnknownRecord = Record<string, unknown>;

export interface ImplementationFileFingerprint {
  path: string;
  relativePath: string;
  bytes: number;
  sha256: string;
}

export interface ControlImplementationFingerprint {
  version: string;
  operationSchema: string;
  mode: "bundle" | "source-tree";
  files: ImplementationFileFingerprint[];
  sha256: string;
}

export interface ManifestFileFingerprint {
  relativePath: string;
  bytes: number;
  sha256: string;
}

export interface FacadeManifestProjection {
  version: string;
  operationSchema: string;
  sha256: string;
  fileCount: number;
  files: ManifestFileFingerprint[];
}

export interface UpstreamLauncherFingerprint {
  command: string;
  commandSha256: string;
  args: string[];
  entrypoint: string;
  entrypointSha256: string;
  implementationTree: {
    root: string;
    fileCount: number;
    sha256: string;
  };
  executionClosure: {
    root: string;
    directoryCount: number;
    fileCount: number;
    symlinkCount: number;
    totalBytes: number;
    sha256: string;
  };
  dependencyLock: {
    type: string;
    path: string;
    sha256: string;
  };
  moduleGraph: {
    schema: "easyeda-pro-control.module-graph.v1";
    moduleCount: number;
    edgeCount: number;
    totalBytes: number;
    sha256: string;
  };
  sandbox: {
    command: string;
    commandSha256: string;
    version: string;
  };
  cwd: string;
}

export interface InstalledBundleFingerprint {
  available: true;
  assetsRoot: string;
  pcbEditor: {
    version: string;
    implementationPath: string;
    implementationSha256: string;
  };
  publicApi: {
    version: string;
    implementationPath: string;
    implementationSha256: string;
    adapterPath: string;
    adapterSha256: string;
    declarationsPath: string;
    declarationsSha256: string;
  };
}

export interface ExpectedFingerprint {
  facadeImplementation: ControlImplementationFingerprint;
  reviewedCompatibilityManifest: ReviewedCompatibilityManifestFingerprint;
  upstreamServer: { version: string };
  upstreamLauncher: UpstreamLauncherFingerprint;
  upstreamImplementationDrift: false;
  toolCatalogSha256: string;
  toolCount: number;
  health: {
    payload: {
      version: string;
      node_version: string;
      bridge_connected: true;
      easyeda_version: string;
      extension_version: string;
      extension_version_mismatch: false;
      registry_mismatch: false;
    };
  };
  bridge: {
    payload: {
      connected: true;
      bridge_version: string;
      easyeda_version: string;
      diagnostics: { method_registry_hash: string };
    };
  };
  bridgeDispatcher: {
    payload: {
      source: "loader_status";
      dispatcher_build_id: string;
      total: number;
    };
  };
  installedBundles: InstalledBundleFingerprint;
  [key: string]: unknown;
}

export interface ReviewedCompatibilityManifestFingerprint {
  path: string;
  bytes: number;
  sha256: string;
  schema: "easyeda-pro-control.reviewed-compatibility.v1";
  reviewedAt: string;
}

export interface ReviewedCompatibilityManifest {
  schema: "easyeda-pro-control.reviewed-compatibility.v1";
  reviewedAt: string;
  facadeImplementation: {
    "source-tree": FacadeManifestProjection;
    bundle: FacadeManifestProjection;
  };
  upstream: {
    serverVersion: string;
    launcher: UpstreamLauncherFingerprint;
    toolCatalog: { count: number; sha256: string };
  };
  connectedRuntime: {
    healthVersion: string;
    nodeVersion: string;
    easyedaVersion: string;
    extensionVersion: string;
    bridgeVersion: string;
    bridgeEasyedaVersion: string;
    methodRegistryHash: string;
    dispatcher: {
      source: "loader_status";
      buildId: string;
      total: number;
    };
  };
  installedBundles: {
    pcbEditor: { version: string; implementationSha256: string };
    publicApi: {
      version: string;
      implementationSha256: string;
      adapterSha256: string;
      declarationsSha256: string;
    };
  };
}

export interface ValueAssertion {
  pointer: string;
  op: string;
  value?: unknown;
}

export interface SubsetMismatch {
  pointer: string;
  expected: unknown;
  actual: unknown;
}

export interface ToolClassification {
  readOnly: boolean;
  write: boolean;
  hasConfirmWrite: boolean;
  idempotent: boolean;
}

export interface ToolDescriptor extends UnknownRecord {
  name?: unknown;
  title?: unknown;
  description?: unknown;
  annotations?: unknown;
  inputSchema?: unknown;
  outputSchema?: unknown;
}

export interface FilterToolsOptions {
  query?: unknown;
  mode?: unknown;
  limit?: unknown;
  includeSchemas?: unknown;
}

export interface EvidencePaths {
  resultPath: string;
  receiptPath: string;
}

export interface NormalizedToolResult {
  ok: boolean;
  isError: boolean;
  structuredContent: unknown;
  content: unknown[];
  raw: unknown;
}

export interface EvaluatedAssertion {
  index: number;
  pointer: string;
  op: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
}

export interface CheckpointPointer {
  receiptPath: unknown;
  checkpointPath: unknown;
}

export interface ArtifactSummary {
  path: unknown;
  sha256: unknown;
  bytes: unknown;
}

export interface OperationSummary {
  operationId: unknown;
  planHash: unknown;
  state: unknown;
  mutationState: unknown;
  saved: boolean;
  reopened: boolean;
  hardStop: boolean;
  mutationMayHaveOccurred: boolean;
  orphanedCallPossible: boolean;
  orphanedCallPhase: unknown;
  runtimeRestartChallenge: string | undefined;
  runtimeRestartChallengeIssuedAt: string | undefined;
  runtimeRestartBoundary: unknown;
  nextSafeAction: unknown;
  unknownPhase: unknown;
  lastError:
    | { name: string | undefined; message: string | undefined }
    | undefined;
  journalPath: unknown;
  checkpoints: {
    pre: CheckpointPointer | undefined;
    final: CheckpointPointer | undefined;
  };
  artifacts: {
    count: number;
    recent: ArtifactSummary[];
  };
  updatedAt: unknown;
}

export function errorWithDetails<T extends UnknownRecord>(
  message: string,
  details: T,
): Error & T {
  return Object.assign(new Error(message), details);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function errorName(error: unknown): string {
  return error instanceof Error ? error.name : "Error";
}

export function isErrnoException(
  error: unknown,
): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isSha256(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/iu.test(value);
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function controlImplementationFingerprint(): Promise<ControlImplementationFingerprint> {
  const currentPath = import.meta.filename;
  const sourceDirectory = import.meta.dirname;
  const bundleMode = basename(currentPath) === "server.mjs";
  let candidates: string[];
  if (bundleMode) {
    candidates = ["server.mjs", "upstream-supervisor.mjs"].map((name) =>
      join(sourceDirectory, name),
    );
  } else {
    const sourceEntries = await readdir(sourceDirectory, {
      withFileTypes: true,
    });
    candidates = sourceEntries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
      .map((entry) => entry.name)
      .toSorted()
      .map((name) => join(sourceDirectory, name));
  }
  const files: ImplementationFileFingerprint[] = [];
  for (const path of candidates) {
    const bytes = await readFile(path);
    files.push({
      path,
      relativePath: bundleMode
        ? basename(path)
        : relative(sourceDirectory, path),
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
  const composite = files
    .map((file) => `${file.relativePath}\0${file.bytes}\0${file.sha256}\n`)
    .join("");
  return {
    version: CONTROL_VERSION,
    operationSchema: OPERATION_SCHEMA,
    mode: bundleMode ? "bundle" : "source-tree",
    files,
    sha256: createHash("sha256").update(composite).digest("hex"),
  };
}

export function stable(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stable(item));
  }
  if (!isRecord(value)) {
    return value;
  }
  return Object.fromEntries(
    Object.keys(value)
      .toSorted()
      .map((key) => [key, stable(value[key])]),
  );
}

export function canonicalJson(value: unknown): string {
  const encoded = JSON.stringify(stable(value));
  if (encoded === undefined) {
    throw new TypeError(
      "Canonical JSON requires a JSON-serializable root value.",
    );
  }
  return encoded;
}

export function sha256Text(value: unknown): string {
  return createHash("sha256").update(String(value)).digest("hex");
}

export function sha256Json(value: unknown): string {
  return sha256Text(canonicalJson(value));
}

export function newOperationId(now: Readonly<Date> = new Date()): string {
  const stamp = now
    .toISOString()
    .replaceAll(/[-:]/gu, "")
    .replace(/\.\d{3}Z$/u, "Z")
    .toLowerCase();
  return `easyeda-${stamp}-${randomUUID().slice(0, 8)}`;
}

function reportsExplicitFailure(value: unknown, depth = 0): boolean {
  if (!isRecord(value) || depth > 6) {
    return false;
  }
  if (
    value["ok"] === false ||
    value["success"] === false ||
    value["not_available"] === true
  ) {
    return true;
  }
  const readConsistency = value["read_consistency"];
  if (isRecord(readConsistency) && readConsistency["stable"] === false) {
    return true;
  }
  return (
    Object.hasOwn(value, "result") &&
    reportsExplicitFailure(value["result"], depth + 1)
  );
}

export function normalizeToolResult(result?: unknown): NormalizedToolResult {
  const record = isRecord(result) ? result : {};
  const structured = isRecord(record["structuredContent"])
    ? record["structuredContent"]
    : {};
  const content = isUnknownArray(record["content"]) ? record["content"] : [];
  const hasEnvelope =
    isRecord(result) &&
    (isRecord(record["structuredContent"]) || content.length > 0);
  const failed =
    !hasEnvelope ||
    record["isError"] === true ||
    reportsExplicitFailure(structured);
  return {
    ok: !failed,
    isError: record["isError"] === true,
    structuredContent: record["structuredContent"],
    content,
    raw: result,
  };
}

/**
 * Exact-reader retries add volatile metadata at the result-envelope level.
 * Remove only that envelope metadata from invariant hashes. Recursing by
 * property name would erase legitimate design data when a nested object uses
 * the same key.
 */
export function normalizeProofEnvelope(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== "read_consistency"),
  );
}

export function extractToolPayload(result: unknown): unknown {
  const normalized = normalizeToolResult(result);
  if (!normalized.ok) {
    throw errorWithDetails("The upstream EasyEDA tool reported failure.", {
      upstreamResult: result,
    });
  }
  let value = normalized.structuredContent;
  if (value === undefined) {
    const textItem = normalized.content.find(
      (item) => isRecord(item) && item["type"] === "text",
    );
    const text = isRecord(textItem) ? textItem["text"] : undefined;
    if (typeof text === "string") {
      try {
        value = JSON.parse(text) as unknown;
      } catch {
        value = { text };
      }
    }
  }
  if (reportsExplicitFailure(value)) {
    throw errorWithDetails(
      "The upstream EasyEDA tool reported failure or unavailability.",
      { upstreamResult: result },
    );
  }
  for (let depth = 0; depth < 4; depth += 1) {
    if (!isRecord(value) || !Object.hasOwn(value, "result")) {
      break;
    }
    const keys = Object.keys(value).filter(
      (key) => !["ok", "success", "result"].includes(key),
    );
    if (keys.length > 0) {
      break;
    }
    value = value["result"];
  }
  return value;
}

export function classifyTool(tool: unknown): ToolClassification {
  const record = isRecord(tool) ? tool : {};
  const annotations = isRecord(record["annotations"])
    ? record["annotations"]
    : {};
  const schema = isRecord(record["inputSchema"]) ? record["inputSchema"] : {};
  const properties = isRecord(schema["properties"]) ? schema["properties"] : {};
  const hasConfirmWrite = Object.hasOwn(properties, "confirmWrite");
  const name = stringValue(record["name"]);
  const pinnedReadException = name === "easyeda_schematic_verify_write";
  const knownWriteName =
    !pinnedReadException &&
    /(^|_)(add|apply|begin_transaction|commit|create|delete|export|import|modify|move|place|recover|rollback|route|save|set|sync|update|write)(_|$)/iu.test(
      name,
    );
  const destructive = annotations["destructiveHint"] === true;
  const explicitlyReadOnly =
    annotations["readOnlyHint"] === true && !destructive && !hasConfirmWrite;
  return {
    readOnly: explicitlyReadOnly && !knownWriteName,
    write: destructive || hasConfirmWrite || knownWriteName,
    hasConfirmWrite,
    idempotent: annotations["idempotentHint"] === true,
  };
}

const REVIEWED_LOCAL_GENERIC_READ_NAMES = new Set([
  "easyeda_board_dimensions",
  "easyeda_board_features",
  "easyeda_board_layers",
  "easyeda_board_stackup",
  "easyeda_bom_generate",
  "easyeda_design_rules_lookup",
  "easyeda_pcb_components",
  "easyeda_pcb_constraint_check",
  "easyeda_pcb_constraint_report",
  "easyeda_pcb_production_review",
  "easyeda_pcb_tracks",
  "easyeda_pcb_vias",
  "easyeda_power_tree_analyze",
  "easyeda_rule_check_summary",
  "easyeda_schematic_check_collisions",
  "easyeda_schematic_check_placement",
  "easyeda_schematic_component_pins",
  "easyeda_schematic_components",
  "easyeda_schematic_connectivity_fingerprint",
  "easyeda_schematic_net_detail",
  "easyeda_schematic_nets",
  "easyeda_schematic_plan_layout",
  "easyeda_schematic_plan_safe_region",
  "easyeda_schematic_primitive_bounds",
  "easyeda_schematic_sheet_info",
  "easyeda_schematic_validate_netlist",
  "easyeda_schematic_wires",
]);
const LIVE_PCB_CONSTRAINT_READ_NAMES = new Set([
  "easyeda_pcb_constraint_check",
  "easyeda_pcb_constraint_report",
  "easyeda_pcb_production_review",
]);

/**
 * Generic reads are admitted by a reviewed local-only allowlist, not by
 * upstream annotations. Supplier, catalog-ingestion, quote, simulation, and
 * open-world tools need a separate consent and destination-aware facade.
 */
export function isReviewedLocalGenericRead(name: string): boolean {
  return REVIEWED_LOCAL_GENERIC_READ_NAMES.has(name);
}

export function assertReviewedLocalGenericReadArguments(
  name: string,
  args: Readonly<Record<string, unknown>>,
): void {
  if (
    LIVE_PCB_CONSTRAINT_READ_NAMES.has(name) &&
    Object.hasOwn(args, "boardData")
  ) {
    throw new Error(
      `${name} arguments.boardData is prohibited by the generic facade; PCB constraint evidence must be derived from the proven live board.`,
    );
  }
}

export function filterTools(
  tools: readonly ToolDescriptor[],
  options: Readonly<FilterToolsOptions> = {},
): (ToolDescriptor & { classification: ToolClassification })[] {
  const query = stringValue(options.query).trim().toLowerCase();
  const mode = options.mode ?? "all";
  const limit = Math.max(1, Math.min(100, Number(options.limit ?? 30)));
  const includeSchemas = options.includeSchemas === true;
  return tools
    .filter((tool) => {
      const classification = classifyTool(tool);
      if (mode === "read" && !classification.readOnly) {
        return false;
      }
      if (mode === "write" && !classification.write) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = [tool.name, tool.title, tool.description]
        .filter(
          (value): value is string =>
            typeof value === "string" && value.length > 0,
        )
        .join(" ")
        .toLowerCase();
      return query.split(/\s+/u).every((term) => haystack.includes(term));
    })
    .slice(0, limit)
    .map((tool) => {
      const classification = classifyTool(tool);
      const compact: ToolDescriptor & { classification: ToolClassification } = {
        name: tool.name,
        title: tool.title,
        description: tool.description,
        annotations: tool.annotations,
        classification,
      };
      if (includeSchemas) {
        compact.inputSchema = tool.inputSchema;
        compact.outputSchema = tool.outputSchema;
      }
      return compact;
    });
}

export function validateRawExecutionInput(input: unknown): {
  hasCode: boolean;
  hasPath: boolean;
  timeoutMs: number;
} {
  if (!isRecord(input)) {
    throw new Error("Raw execution input must be an object.");
  }
  const source = isRecord(input["source"]) ? input["source"] : undefined;
  const hasCode =
    (source?.["kind"] === "inline" &&
      typeof source["code"] === "string" &&
      source["code"].length > 0) ||
    (input["source"] === undefined &&
      typeof input["code"] === "string" &&
      input["code"].length > 0);
  const hasPath =
    (source?.["kind"] === "file" &&
      typeof source["scriptPath"] === "string" &&
      source["scriptPath"].length > 0) ||
    (input["source"] === undefined &&
      typeof input["scriptPath"] === "string" &&
      input["scriptPath"].length > 0);
  if (hasCode === hasPath) {
    throw new Error("Provide exactly one of code or scriptPath.");
  }
  const timeoutMs = Number(input["timeoutMs"] ?? 15_000);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 60_000) {
    throw new Error("timeoutMs must be an integer from 1000 through 60000.");
  }
  if (input["confirmWrite"] !== true) {
    throw new Error(
      "Unrestricted EasyEDA execution requires confirmWrite=true.",
    );
  }
  if (
    !["read", "mutate-unsaved", "persist", "native-ui"].includes(
      String(input["mode"]),
    )
  ) {
    throw new Error(
      "mode must be read, mutate-unsaved, persist, or native-ui.",
    );
  }
  if (
    typeof input["intent"] !== "string" ||
    input["intent"].trim().length < 8
  ) {
    throw new Error(
      "intent must describe the bounded operation in at least 8 characters.",
    );
  }
  if (input["acknowledgeUnrestrictedRaw"] !== true) {
    throw new Error(
      "Raw EasyEDA JavaScript is not sandboxed; acknowledgeUnrestrictedRaw must be exactly true.",
    );
  }
  const sourceSha256 = stringValue(input["sourceSha256"]).toLowerCase();
  if (input["unrestrictedConfirmation"] !== `UNRESTRICTED:${sourceSha256}`) {
    throw new Error(
      "unrestrictedConfirmation must exactly bind UNRESTRICTED: to sourceSha256.",
    );
  }
  return { hasCode, hasPath, timeoutMs };
}

export function normalizeEasyedaProjectPath(value: unknown): string {
  let text = stringValue(value).trim();
  if (!text) {
    throw new Error("EasyEDA project path is required.");
  }
  if (/^file:\/\//iu.test(text)) {
    try {
      text = decodeURIComponent(text.replace(/^file:\/+/iu, "/"));
    } catch {
      throw new Error("EasyEDA project file URI contains invalid escaping.");
    }
  }
  text = text.replaceAll("\\", "/");
  const uriDrive = /^\/([a-zA-Z]):\/(.*)$/u.exec(text);
  if (uriDrive?.[1] !== undefined && uriDrive[2] !== undefined) {
    text = `${uriDrive[1]}:/${uriDrive[2]}`;
  }
  const drive = /^([a-zA-Z]):\/(.*)$/u.exec(text);
  if (drive?.[1] !== undefined && drive[2] !== undefined) {
    text = `/mnt/${drive[1].toLowerCase()}/${drive[2]}`;
  }
  if (!isAbsolute(text)) {
    throw new Error(
      "EasyEDA project path must be an absolute POSIX or Windows path.",
    );
  }
  const normalized = resolve(text);
  if (!/\.eprj2$/iu.test(normalized)) {
    throw new Error("EasyEDA project path must identify an .eprj2 database.");
  }
  return normalized;
}

export function validateEvidencePaths(
  evidence?: unknown,
): EvidencePaths | undefined {
  if (evidence === undefined) {
    return undefined;
  }
  if (!isRecord(evidence)) {
    throw new Error("evidence must be an object.");
  }
  const resultPath = stringValue(evidence["resultPath"]);
  const receiptPath = stringValue(evidence["receiptPath"]);
  if (!resultPath || !receiptPath) {
    throw new Error("evidence requires resultPath and receiptPath.");
  }
  if (!isAbsolute(resultPath) || !isAbsolute(receiptPath)) {
    throw new Error("Evidence paths must be absolute.");
  }
  const normalizedResult = resolve(resultPath);
  const normalizedReceipt = resolve(receiptPath);
  if (normalizedResult === normalizedReceipt) {
    throw new Error("Evidence result and receipt paths must be distinct.");
  }
  return { resultPath: normalizedResult, receiptPath: normalizedReceipt };
}

type FingerprintRequirementKind =
  | "string"
  | "sha256"
  | "positive-integer"
  | "nonnegative-integer"
  | "nonempty-string-array"
  | "nonempty-array"
  | "loader-status"
  | "true"
  | "false";

const EXPECTED_FINGERPRINT_REQUIREMENTS: readonly (readonly [
  string,
  FingerprintRequirementKind,
])[] = [
  ["/facadeImplementation/version", "string"],
  ["/facadeImplementation/operationSchema", "string"],
  ["/facadeImplementation/mode", "string"],
  ["/facadeImplementation/files", "nonempty-array"],
  ["/facadeImplementation/sha256", "sha256"],
  ["/upstreamServer/version", "string"],
  ["/upstreamLauncher/command", "string"],
  ["/upstreamLauncher/commandSha256", "sha256"],
  ["/upstreamLauncher/args", "nonempty-string-array"],
  ["/upstreamLauncher/cwd", "string"],
  ["/upstreamLauncher/entrypoint", "string"],
  ["/upstreamLauncher/entrypointSha256", "sha256"],
  ["/upstreamLauncher/implementationTree/root", "string"],
  ["/upstreamLauncher/implementationTree/sha256", "sha256"],
  ["/upstreamLauncher/implementationTree/fileCount", "positive-integer"],
  ["/upstreamLauncher/executionClosure/root", "string"],
  ["/upstreamLauncher/executionClosure/directoryCount", "positive-integer"],
  ["/upstreamLauncher/executionClosure/fileCount", "positive-integer"],
  [
    "/upstreamLauncher/executionClosure/symlinkCount",
    "nonnegative-integer",
  ],
  ["/upstreamLauncher/executionClosure/totalBytes", "positive-integer"],
  ["/upstreamLauncher/executionClosure/sha256", "sha256"],
  ["/upstreamLauncher/dependencyLock/type", "string"],
  ["/upstreamLauncher/dependencyLock/path", "string"],
  ["/upstreamLauncher/dependencyLock/sha256", "sha256"],
  ["/upstreamLauncher/moduleGraph/schema", "string"],
  ["/upstreamLauncher/moduleGraph/moduleCount", "positive-integer"],
  ["/upstreamLauncher/moduleGraph/edgeCount", "nonnegative-integer"],
  ["/upstreamLauncher/moduleGraph/totalBytes", "positive-integer"],
  ["/upstreamLauncher/moduleGraph/sha256", "sha256"],
  ["/upstreamLauncher/sandbox/command", "string"],
  ["/upstreamLauncher/sandbox/commandSha256", "sha256"],
  ["/upstreamLauncher/sandbox/version", "string"],
  ["/upstreamImplementationDrift", "false"],
  ["/toolCatalogSha256", "sha256"],
  ["/toolCount", "positive-integer"],
  ["/reviewedCompatibilityManifest/path", "string"],
  ["/reviewedCompatibilityManifest/bytes", "positive-integer"],
  ["/reviewedCompatibilityManifest/sha256", "sha256"],
  ["/reviewedCompatibilityManifest/schema", "string"],
  ["/reviewedCompatibilityManifest/reviewedAt", "string"],
  ["/health/payload/version", "string"],
  ["/health/payload/node_version", "string"],
  ["/health/payload/bridge_connected", "true"],
  ["/health/payload/easyeda_version", "string"],
  ["/health/payload/extension_version", "string"],
  ["/health/payload/extension_version_mismatch", "false"],
  ["/health/payload/registry_mismatch", "false"],
  ["/bridge/payload/connected", "true"],
  ["/bridge/payload/bridge_version", "string"],
  ["/bridge/payload/easyeda_version", "string"],
  ["/bridge/payload/diagnostics/method_registry_hash", "string"],
  ["/bridgeDispatcher/payload/source", "loader-status"],
  ["/bridgeDispatcher/payload/dispatcher_build_id", "string"],
  ["/bridgeDispatcher/payload/total", "positive-integer"],
  ["/installedBundles/available", "true"],
  ["/installedBundles/assetsRoot", "string"],
  ["/installedBundles/pcbEditor/version", "string"],
  ["/installedBundles/pcbEditor/implementationPath", "string"],
  ["/installedBundles/pcbEditor/implementationSha256", "sha256"],
  ["/installedBundles/publicApi/version", "string"],
  ["/installedBundles/publicApi/implementationPath", "string"],
  ["/installedBundles/publicApi/implementationSha256", "sha256"],
  ["/installedBundles/publicApi/adapterPath", "string"],
  ["/installedBundles/publicApi/adapterSha256", "sha256"],
  ["/installedBundles/publicApi/declarationsPath", "string"],
  ["/installedBundles/publicApi/declarationsSha256", "sha256"],
];

function fingerprintRequirementMissing(
  value: unknown,
  kind: FingerprintRequirementKind,
): boolean {
  if (kind === "string") {
    return typeof value !== "string" || value.length === 0;
  }
  if (kind === "sha256") {
    return !isSha256(value);
  }
  if (kind === "positive-integer") {
    return !Number.isInteger(value) || Number(value) < 1;
  }
  if (kind === "nonnegative-integer") {
    return !Number.isInteger(value) || Number(value) < 0;
  }
  if (kind === "nonempty-string-array") {
    return (
      !Array.isArray(value) ||
      value.length === 0 ||
      value.some((item) => typeof item !== "string" || item.length === 0)
    );
  }
  if (kind === "nonempty-array") {
    return !Array.isArray(value) || value.length === 0;
  }
  if (kind === "loader-status") {
    return value !== "loader_status";
  }
  if (kind === "true") {
    return value !== true;
  }
  return value !== false;
}

export function getJsonPointer(root: unknown, pointer: unknown): unknown {
  if (pointer === "" || pointer === "/") {
    return root;
  }
  if (typeof pointer !== "string" || !pointer.startsWith("/")) {
    throw new Error(`Invalid JSON pointer: ${String(pointer)}`);
  }
  const parts = pointer
    .slice(1)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"));
  let value = root;
  for (const key of parts) {
    if (Array.isArray(value) && /^\d+$/u.test(key)) {
      value = value[Number(key)];
    } else if (isRecord(value)) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value;
}

export function assertExpectedFingerprint(
  fingerprint: unknown,
): asserts fingerprint is ExpectedFingerprint {
  if (!isRecord(fingerprint)) {
    throw new Error("expectedFingerprint must be an object.");
  }
  const missing: { pointer: string; required: string }[] =
    EXPECTED_FINGERPRINT_REQUIREMENTS.filter(([pointer, kind]) =>
      fingerprintRequirementMissing(getJsonPointer(fingerprint, pointer), kind),
    ).map(([pointer, kind]) => ({ pointer, required: kind }));
  const files = getJsonPointer(fingerprint, "/facadeImplementation/files");
  if (Array.isArray(files)) {
    for (const [index, file] of files.entries()) {
      if (
        !isRecord(file) ||
        typeof file["path"] !== "string" ||
        file["path"].length === 0 ||
        typeof file["relativePath"] !== "string" ||
        file["relativePath"].length === 0 ||
        !Number.isInteger(file["bytes"]) ||
        Number(file["bytes"]) < 1 ||
        !isSha256(file["sha256"])
      ) {
        missing.push({
          pointer: `/facadeImplementation/files/${index}`,
          required: "exact implementation file fingerprint",
        });
      }
    }
  }
  if (missing.length > 0) {
    throw errorWithDetails(
      "expectedFingerprint must pin a connected, non-mismatched EasyEDA runtime and method registry.",
      { missingFingerprintFields: missing },
    );
  }
}

export function validateExpectedFingerprint(fingerprint: unknown): true {
  assertExpectedFingerprint(fingerprint);
  return true;
}

const REVIEWED_COMPATIBILITY_SCHEMA =
  "easyeda-pro-control.reviewed-compatibility.v1";

export function reviewedCompatibilityManifestPath(): string {
  return resolve(
    import.meta.dirname,
    "..",
    "..",
    "reviewed-compatibility.json",
  );
}

function manifestObject(
  value: unknown,
  pointer: string,
  keys: readonly string[],
): UnknownRecord {
  if (!isRecord(value)) {
    throw new Error(
      `Reviewed compatibility manifest ${pointer} must be an object.`,
    );
  }
  const actual = Object.keys(value).toSorted();
  const expected = [...keys].toSorted();
  if (canonicalJson(actual) !== canonicalJson(expected)) {
    throw new Error(
      `Reviewed compatibility manifest ${pointer} has unexpected or missing keys: ${actual.join(", ")}.`,
    );
  }
  return value;
}

function manifestString(value: unknown, pointer: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(
      `Reviewed compatibility manifest ${pointer} must be a nonempty string.`,
    );
  }
  return value;
}

function manifestSha256(value: unknown, pointer: string): string {
  if (!isSha256(value)) {
    throw new Error(
      `Reviewed compatibility manifest ${pointer} must be a SHA-256 digest.`,
    );
  }
  return value;
}

function manifestPositiveInteger(value: unknown, pointer: string): number {
  if (!Number.isInteger(value) || Number(value) < 1) {
    throw new Error(
      `Reviewed compatibility manifest ${pointer} must be a positive integer.`,
    );
  }
  return Number(value);
}

function manifestNonnegativeInteger(value: unknown, pointer: string): number {
  if (!Number.isInteger(value) || Number(value) < 0) {
    throw new Error(
      `Reviewed compatibility manifest ${pointer} must be a nonnegative integer.`,
    );
  }
  return Number(value);
}

function assertFacadeManifest(
  value: unknown,
  pointer: string,
): asserts value is FacadeManifestProjection {
  const record = manifestObject(value, pointer, [
    "version",
    "operationSchema",
    "sha256",
    "fileCount",
    "files",
  ]);
  manifestString(record["version"], `${pointer}/version`);
  manifestString(record["operationSchema"], `${pointer}/operationSchema`);
  manifestSha256(record["sha256"], `${pointer}/sha256`);
  const fileCount = manifestPositiveInteger(
    record["fileCount"],
    `${pointer}/fileCount`,
  );
  const files = record["files"];
  if (!Array.isArray(files) || files.length !== fileCount) {
    throw new Error(
      `Reviewed compatibility manifest ${pointer}/files must match fileCount.`,
    );
  }
  const relativePaths: string[] = [];
  for (const [index, file] of files.entries()) {
    const filePointer = `${pointer}/files/${index}`;
    const fileRecord = manifestObject(file, filePointer, [
      "relativePath",
      "bytes",
      "sha256",
    ]);
    const relativePath = manifestString(
      fileRecord["relativePath"],
      `${filePointer}/relativePath`,
    );
    if (
      isAbsolute(relativePath) ||
      relativePath.includes("\\") ||
      relativePath.split("/").includes("..")
    ) {
      throw new Error(
        `Reviewed compatibility manifest ${filePointer}/relativePath must be a normalized relative path.`,
      );
    }
    manifestPositiveInteger(fileRecord["bytes"], `${filePointer}/bytes`);
    manifestSha256(fileRecord["sha256"], `${filePointer}/sha256`);
    relativePaths.push(relativePath);
  }
  if (
    new Set(relativePaths).size !== relativePaths.length ||
    canonicalJson(relativePaths) !==
      canonicalJson([...relativePaths].toSorted())
  ) {
    throw new Error(
      `Reviewed compatibility manifest ${pointer}/files must have unique sorted relative paths.`,
    );
  }
}

function assertReviewedCompatibilityManifest(
  value: unknown,
): asserts value is ReviewedCompatibilityManifest {
  const root = manifestObject(value, "/", [
    "schema",
    "reviewedAt",
    "facadeImplementation",
    "upstream",
    "connectedRuntime",
    "installedBundles",
  ]);
  if (root["schema"] !== REVIEWED_COMPATIBILITY_SCHEMA) {
    throw new Error(
      `Unsupported reviewed compatibility manifest schema ${String(root["schema"])}.`,
    );
  }
  const reviewedAt = manifestString(root["reviewedAt"], "/reviewedAt");
  if (!Number.isFinite(Date.parse(reviewedAt))) {
    throw new TypeError(
      "Reviewed compatibility manifest /reviewedAt must be an ISO date-time.",
    );
  }

  const facadeImplementation = manifestObject(
    root["facadeImplementation"],
    "/facadeImplementation",
    ["source-tree", "bundle"],
  );
  assertFacadeManifest(
    facadeImplementation["source-tree"],
    "/facadeImplementation/source-tree",
  );
  assertFacadeManifest(
    facadeImplementation["bundle"],
    "/facadeImplementation/bundle",
  );

  const upstream = manifestObject(root["upstream"], "/upstream", [
    "serverVersion",
    "launcher",
    "toolCatalog",
  ]);
  manifestString(upstream["serverVersion"], "/upstream/serverVersion");
  const launcher = manifestObject(upstream["launcher"], "/upstream/launcher", [
    "command",
    "commandSha256",
    "args",
    "entrypoint",
    "entrypointSha256",
    "implementationTree",
    "executionClosure",
    "dependencyLock",
    "moduleGraph",
    "sandbox",
    "cwd",
  ]);
  for (const key of ["command", "entrypoint", "cwd"]) {
    const path = manifestString(launcher[key], `/upstream/launcher/${key}`);
    if (!isAbsolute(path)) {
      throw new Error(
        `Reviewed compatibility manifest /upstream/launcher/${key} must be absolute.`,
      );
    }
  }
  manifestSha256(launcher["commandSha256"], "/upstream/launcher/commandSha256");
  manifestSha256(
    launcher["entrypointSha256"],
    "/upstream/launcher/entrypointSha256",
  );
  const launcherArgs = launcher["args"];
  if (
    !Array.isArray(launcherArgs) ||
    launcherArgs.length === 0 ||
    launcherArgs.some((item) => typeof item !== "string" || item.length === 0)
  ) {
    throw new Error(
      "Reviewed compatibility manifest /upstream/launcher/args is malformed.",
    );
  }
  const implementationTree = manifestObject(
    launcher["implementationTree"],
    "/upstream/launcher/implementationTree",
    ["root", "fileCount", "sha256"],
  );
  const implementationRoot = manifestString(
    implementationTree["root"],
    "/upstream/launcher/implementationTree/root",
  );
  if (!isAbsolute(implementationRoot)) {
    throw new Error(
      "Reviewed compatibility manifest implementation-tree root must be absolute.",
    );
  }
  manifestPositiveInteger(
    implementationTree["fileCount"],
    "/upstream/launcher/implementationTree/fileCount",
  );
  manifestSha256(
    implementationTree["sha256"],
    "/upstream/launcher/implementationTree/sha256",
  );
  const executionClosure = manifestObject(
    launcher["executionClosure"],
    "/upstream/launcher/executionClosure",
    [
      "root",
      "directoryCount",
      "fileCount",
      "symlinkCount",
      "totalBytes",
      "sha256",
    ],
  );
  const executionClosureRoot = manifestString(
    executionClosure["root"],
    "/upstream/launcher/executionClosure/root",
  );
  if (!isAbsolute(executionClosureRoot)) {
    throw new Error(
      "Reviewed compatibility manifest execution-closure root must be absolute.",
    );
  }
  manifestPositiveInteger(
    executionClosure["directoryCount"],
    "/upstream/launcher/executionClosure/directoryCount",
  );
  manifestPositiveInteger(
    executionClosure["fileCount"],
    "/upstream/launcher/executionClosure/fileCount",
  );
  manifestNonnegativeInteger(
    executionClosure["symlinkCount"],
    "/upstream/launcher/executionClosure/symlinkCount",
  );
  manifestPositiveInteger(
    executionClosure["totalBytes"],
    "/upstream/launcher/executionClosure/totalBytes",
  );
  manifestSha256(
    executionClosure["sha256"],
    "/upstream/launcher/executionClosure/sha256",
  );
  const dependencyLock = manifestObject(
    launcher["dependencyLock"],
    "/upstream/launcher/dependencyLock",
    ["type", "path", "sha256"],
  );
  manifestString(
    dependencyLock["type"],
    "/upstream/launcher/dependencyLock/type",
  );
  const dependencyLockPath = manifestString(
    dependencyLock["path"],
    "/upstream/launcher/dependencyLock/path",
  );
  if (!isAbsolute(dependencyLockPath)) {
    throw new Error(
      "Reviewed compatibility manifest dependency-lock path must be absolute.",
    );
  }
  manifestSha256(
    dependencyLock["sha256"],
    "/upstream/launcher/dependencyLock/sha256",
  );
  const moduleGraph = manifestObject(
    launcher["moduleGraph"],
    "/upstream/launcher/moduleGraph",
    ["schema", "moduleCount", "edgeCount", "totalBytes", "sha256"],
  );
  if (
    manifestString(
      moduleGraph["schema"],
      "/upstream/launcher/moduleGraph/schema",
    ) !== "easyeda-pro-control.module-graph.v1"
  ) {
    throw new Error(
      "Reviewed compatibility manifest module-graph schema is unsupported.",
    );
  }
  manifestPositiveInteger(
    moduleGraph["moduleCount"],
    "/upstream/launcher/moduleGraph/moduleCount",
  );
  manifestNonnegativeInteger(
    moduleGraph["edgeCount"],
    "/upstream/launcher/moduleGraph/edgeCount",
  );
  manifestPositiveInteger(
    moduleGraph["totalBytes"],
    "/upstream/launcher/moduleGraph/totalBytes",
  );
  manifestSha256(
    moduleGraph["sha256"],
    "/upstream/launcher/moduleGraph/sha256",
  );
  const sandbox = manifestObject(
    launcher["sandbox"],
    "/upstream/launcher/sandbox",
    ["command", "commandSha256", "version"],
  );
  const sandboxCommand = manifestString(
    sandbox["command"],
    "/upstream/launcher/sandbox/command",
  );
  if (!isAbsolute(sandboxCommand)) {
    throw new Error(
      "Reviewed compatibility manifest sandbox command must be absolute.",
    );
  }
  manifestSha256(
    sandbox["commandSha256"],
    "/upstream/launcher/sandbox/commandSha256",
  );
  manifestString(sandbox["version"], "/upstream/launcher/sandbox/version");
  const toolCatalog = manifestObject(
    upstream["toolCatalog"],
    "/upstream/toolCatalog",
    ["count", "sha256"],
  );
  manifestPositiveInteger(toolCatalog["count"], "/upstream/toolCatalog/count");
  manifestSha256(toolCatalog["sha256"], "/upstream/toolCatalog/sha256");

  const runtime = manifestObject(
    root["connectedRuntime"],
    "/connectedRuntime",
    [
      "healthVersion",
      "nodeVersion",
      "easyedaVersion",
      "extensionVersion",
      "bridgeVersion",
      "bridgeEasyedaVersion",
      "methodRegistryHash",
      "dispatcher",
    ],
  );
  for (const key of [
    "healthVersion",
    "nodeVersion",
    "easyedaVersion",
    "extensionVersion",
    "bridgeVersion",
    "bridgeEasyedaVersion",
    "methodRegistryHash",
  ]) {
    manifestString(runtime[key], `/connectedRuntime/${key}`);
  }
  const dispatcher = manifestObject(
    runtime["dispatcher"],
    "/connectedRuntime/dispatcher",
    ["source", "buildId", "total"],
  );
  if (dispatcher["source"] !== "loader_status") {
    throw new Error(
      "Reviewed compatibility manifest dispatcher source must be loader_status.",
    );
  }
  manifestString(dispatcher["buildId"], "/connectedRuntime/dispatcher/buildId");
  manifestPositiveInteger(
    dispatcher["total"],
    "/connectedRuntime/dispatcher/total",
  );

  const bundles = manifestObject(
    root["installedBundles"],
    "/installedBundles",
    ["pcbEditor", "publicApi"],
  );
  const pcbEditor = manifestObject(
    bundles["pcbEditor"],
    "/installedBundles/pcbEditor",
    ["version", "implementationSha256"],
  );
  manifestString(pcbEditor["version"], "/installedBundles/pcbEditor/version");
  manifestSha256(
    pcbEditor["implementationSha256"],
    "/installedBundles/pcbEditor/implementationSha256",
  );
  const publicApi = manifestObject(
    bundles["publicApi"],
    "/installedBundles/publicApi",
    ["version", "implementationSha256", "adapterSha256", "declarationsSha256"],
  );
  manifestString(publicApi["version"], "/installedBundles/publicApi/version");
  for (const key of [
    "implementationSha256",
    "adapterSha256",
    "declarationsSha256",
  ]) {
    manifestSha256(publicApi[key], `/installedBundles/publicApi/${key}`);
  }
}

function readReviewedCompatibilityManifest(): {
  manifest: ReviewedCompatibilityManifest;
  fingerprint: ReviewedCompatibilityManifestFingerprint;
} {
  const path = reviewedCompatibilityManifestPath();
  let bytes: Buffer;
  let parsed: unknown;
  try {
    bytes = readFileSync(path);
    parsed = JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    throw new Error(
      `Reviewed compatibility manifest is unavailable or invalid JSON: ${path}`,
      {
        cause: error,
      },
    );
  }
  assertReviewedCompatibilityManifest(parsed);
  const manifest = parsed;
  return {
    manifest,
    fingerprint: {
      path,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      schema: manifest.schema,
      reviewedAt: manifest.reviewedAt,
    },
  };
}

export function loadReviewedCompatibilityManifest(): ReviewedCompatibilityManifest {
  return readReviewedCompatibilityManifest().manifest;
}

export function reviewedCompatibilityManifestFingerprint(): ReviewedCompatibilityManifestFingerprint {
  return readReviewedCompatibilityManifest().fingerprint;
}

export function compareSubset(
  actual: unknown,
  expected: unknown,
  pointer = "",
): SubsetMismatch[] {
  const mismatches: SubsetMismatch[] = [];
  const visit = (
    actualValue: unknown,
    expectedValue: unknown,
    currentPointer: string,
  ): void => {
    if (isRecord(expectedValue)) {
      if (!isRecord(actualValue)) {
        mismatches.push({
          pointer: currentPointer || "/",
          expected: expectedValue,
          actual: actualValue,
        });
        return;
      }
      for (const [key, child] of Object.entries(expectedValue)) {
        const encoded = key.replaceAll("~", "~0").replaceAll("/", "~1");
        visit(actualValue[key], child, `${currentPointer}/${encoded}`);
      }
      return;
    }
    if (canonicalJson(actualValue) !== canonicalJson(expectedValue)) {
      mismatches.push({
        pointer: currentPointer || "/",
        expected: expectedValue,
        actual: actualValue,
      });
    }
  };
  visit(actual, expected, pointer);
  return mismatches;
}

export function validatePrivateFingerprint(fingerprint: unknown): true {
  assertExpectedFingerprint(fingerprint);
  const reviewed = readReviewedCompatibilityManifest();
  const manifest = reviewed.manifest;
  const manifestMismatches = compareSubset(
    fingerprint.reviewedCompatibilityManifest,
    reviewed.fingerprint,
  );
  if (manifestMismatches.length > 0) {
    throw errorWithDetails(
      "Private EasyEDA automation is unavailable because the expected reviewed-compatibility manifest fingerprint does not match the current external manifest.",
      { mismatches: manifestMismatches },
    );
  }
  const facadeMode = fingerprint.facadeImplementation.mode;
  const reviewedFacade = manifest.facadeImplementation[facadeMode];
  const actual = {
    facadeImplementation: {
      version: fingerprint.facadeImplementation.version,
      operationSchema: fingerprint.facadeImplementation.operationSchema,
      sha256: fingerprint.facadeImplementation.sha256,
      fileCount: fingerprint.facadeImplementation.files.length,
      files: fingerprint.facadeImplementation.files
        .map((file) => ({
          relativePath: file.relativePath,
          bytes: file.bytes,
          sha256: file.sha256,
        }))
        .toSorted((left, right) =>
          left.relativePath.localeCompare(right.relativePath),
        ),
    },
    upstream: {
      serverVersion: fingerprint.upstreamServer?.version,
      launcher: fingerprint.upstreamLauncher,
      toolCatalog: {
        count: fingerprint.toolCount,
        sha256: fingerprint.toolCatalogSha256,
      },
    },
    connectedRuntime: {
      healthVersion: fingerprint.health?.payload?.version,
      nodeVersion: fingerprint.health.payload.node_version.replace(/^v/u, ""),
      easyedaVersion: fingerprint.health?.payload?.easyeda_version,
      extensionVersion: fingerprint.health?.payload?.extension_version,
      bridgeVersion: fingerprint.bridge?.payload?.bridge_version,
      bridgeEasyedaVersion: fingerprint.bridge?.payload?.easyeda_version,
      methodRegistryHash:
        fingerprint.bridge?.payload?.diagnostics?.method_registry_hash,
      dispatcher: {
        source: fingerprint.bridgeDispatcher?.payload?.source,
        buildId: fingerprint.bridgeDispatcher?.payload?.dispatcher_build_id,
        total: fingerprint.bridgeDispatcher?.payload?.total,
      },
    },
    installedBundles: {
      pcbEditor: {
        version: fingerprint.installedBundles?.pcbEditor?.version,
        implementationSha256:
          fingerprint.installedBundles?.pcbEditor?.implementationSha256,
      },
      publicApi: {
        version: fingerprint.installedBundles?.publicApi?.version,
        implementationSha256:
          fingerprint.installedBundles?.publicApi?.implementationSha256,
        adapterSha256: fingerprint.installedBundles?.publicApi?.adapterSha256,
        declarationsSha256:
          fingerprint.installedBundles?.publicApi?.declarationsSha256,
      },
    },
  };
  const expected = {
    facadeImplementation: reviewedFacade,
    upstream: manifest.upstream,
    connectedRuntime: manifest.connectedRuntime,
    installedBundles: manifest.installedBundles,
  };
  const mismatches = compareSubset(actual, expected);
  if (mismatches.length > 0) {
    throw errorWithDetails(
      `Private EasyEDA automation is unavailable because the connected compatibility tuple does not match the external reviewed manifest at ${reviewedCompatibilityManifestPath()}.`,
      { mismatches },
    );
  }
  return true;
}

export function evaluateAssertions(
  root: unknown,
  assertions: readonly ValueAssertion[] = [],
): EvaluatedAssertion[] {
  return assertions.map((assertion, index) => {
    const actual = getJsonPointer(root, assertion.pointer);
    let passed = false;
    switch (assertion.op) {
      case "exists": {
        passed = actual !== undefined;
        break;
      }
      case "equals": {
        passed =
          actual !== undefined &&
          canonicalJson(actual) === canonicalJson(assertion.value);
        break;
      }
      case "not-equals": {
        passed =
          actual !== undefined &&
          canonicalJson(actual) !== canonicalJson(assertion.value);
        break;
      }
      case "matches": {
        passed =
          typeof actual === "string" &&
          new RegExp(stringValue(assertion.value), "u").test(actual);
        break;
      }
      case "length-equals": {
        passed =
          (Array.isArray(actual) || typeof actual === "string") &&
          actual.length === assertion.value;
        break;
      }
      default: {
        throw new Error(
          `Unsupported assertion operation at index ${index}: ${assertion.op}`,
        );
      }
    }
    return {
      index,
      pointer: assertion.pointer,
      op: assertion.op,
      passed,
      expected: assertion.value,
      actual,
    };
  });
}

export function assertSubset(
  actual: unknown,
  expected: unknown,
  label = "value",
): true {
  const mismatches = compareSubset(actual, expected);
  if (mismatches.length > 0) {
    throw errorWithDetails(`${label} does not match the expected subset.`, {
      mismatches,
    });
  }
  return true;
}

export function validateCallSource(spec: unknown): void {
  if (!isRecord(spec) || spec["toolName"] !== "easyeda_execute") {
    return;
  }
  const argumentsRecord = isRecord(spec["arguments"])
    ? spec["arguments"]
    : undefined;
  const code = argumentsRecord?.["code"];
  if (typeof code !== "string" || code.length === 0) {
    throw new Error("easyeda_execute call specs require arguments.code.");
  }
  if (Buffer.byteLength(code) > 1024 * 1024) {
    throw new Error(
      "easyeda_execute source exceeds the 1 MiB control-plane limit.",
    );
  }
  if (!isSha256(spec["sourceSha256"])) {
    throw new Error(
      "easyeda_execute call specs require a 64-character sourceSha256.",
    );
  }
  if (sha256Text(code) !== spec["sourceSha256"].toLowerCase()) {
    throw new Error(
      "easyeda_execute sourceSha256 does not match arguments.code.",
    );
  }
  const timeoutMs = Number(argumentsRecord?.["timeoutMs"] ?? 15_000);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 60_000) {
    throw new Error(
      "easyeda_execute timeoutMs must be an integer from 1000 through 60000.",
    );
  }
  if (argumentsRecord?.["confirmWrite"] !== true) {
    throw new Error("easyeda_execute call specs require confirmWrite=true.");
  }
  if (spec["acknowledgeUnrestrictedRaw"] !== true) {
    throw new Error(
      "easyeda_execute call specs must acknowledge that raw JavaScript is unrestricted.",
    );
  }
  if (
    typeof spec["mode"] !== "string" ||
    !["read", "mutate-unsaved"].includes(spec["mode"])
  ) {
    throw new Error(
      "easyeda_execute call specs require mode read or mutate-unsaved.",
    );
  }
}

export function buildPlanHash(plan: Readonly<UnknownRecord>): string {
  return sha256Json({
    name: plan["name"],
    intent: plan["intent"],
    targetPrimitiveIds: plan["targetPrimitiveIds"] ?? [],
    targetChanges: plan["targetChanges"] ?? [],
    capabilityLevel: plan["capabilityLevel"],
    expectedFingerprint: plan["expectedFingerprint"],
    expectedContext: plan["expectedContext"],
    preflightCalls: plan["preflightCalls"] ?? [],
    applyCall: plan["applyCall"],
    verifyCalls: plan["verifyCalls"] ?? [],
    verifyAssertions: plan["verifyAssertions"] ?? [],
    rollbackCalls: plan["rollbackCalls"] ?? [],
    reopenedVerifyCalls: plan["reopenedVerifyCalls"] ?? [],
    reopenedAssertions: plan["reopenedAssertions"] ?? [],
    checkpoint: plan["checkpoint"],
  });
}

function boundedText(value: unknown, maximum = 2048): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  return value.length <= maximum ? value : `${value.slice(0, maximum - 1)}…`;
}

function checkpointPointer(checkpoint: unknown): CheckpointPointer | undefined {
  return isRecord(checkpoint)
    ? {
        receiptPath: checkpoint["receiptPath"],
        checkpointPath: checkpoint["checkpoint"],
      }
    : undefined;
}

function summarizeArtifact(artifact: unknown): ArtifactSummary {
  const record = isRecord(artifact) ? artifact : {};
  return {
    path: record["path"],
    sha256: record["sha256"],
    bytes: record["bytes"],
  };
}

const LEGACY_ORPHAN_RISK_STATES = new Set([
  "baseline-reopen-dispatching",
  "baseline-reopen-unknown",
  "applying",
  "unknown",
  "rolling-back",
  "rollback-failed",
  "saving",
  "final-reopen-dispatching",
  "final-reopen-unknown",
  "recovery-reopen-dispatching",
  "recovery-reopen-unknown",
  "recovery-target-activation-dispatching",
  "recovery-target-activation-unknown",
]);

export function operationHasOrphanedCallRisk(operation: unknown): boolean {
  if (!isRecord(operation)) {
    return false;
  }
  if (typeof operation["orphanedCallPossible"] === "boolean") {
    return operation["orphanedCallPossible"];
  }
  return LEGACY_ORPHAN_RISK_STATES.has(String(operation["state"]));
}

export function operationSummary(
  operation: Readonly<UnknownRecord>,
): OperationSummary {
  const artifacts = Array.isArray(operation["artifacts"])
    ? operation["artifacts"]
    : [];
  const lastError = isRecord(operation["lastError"])
    ? operation["lastError"]
    : undefined;
  return {
    operationId: operation["operationId"],
    planHash: operation["planHash"],
    state: operation["state"],
    mutationState: operation["mutationState"],
    saved: operation["saved"] === true,
    reopened: operation["reopened"] === true,
    hardStop: operation["hardStop"] === true,
    mutationMayHaveOccurred: operation["mutationMayHaveOccurred"] === true,
    orphanedCallPossible: operationHasOrphanedCallRisk(operation),
    orphanedCallPhase: operation["orphanedCallPhase"],
    runtimeRestartChallenge:
      operationHasOrphanedCallRisk(operation) &&
      typeof operation["runtimeRestartChallenge"] === "string"
        ? operation["runtimeRestartChallenge"]
        : undefined,
    runtimeRestartChallengeIssuedAt:
      operationHasOrphanedCallRisk(operation) &&
      typeof operation["runtimeRestartChallengeIssuedAt"] === "string"
        ? operation["runtimeRestartChallengeIssuedAt"]
        : undefined,
    runtimeRestartBoundary: operation["runtimeRestartBoundary"],
    nextSafeAction: operation["nextSafeAction"],
    unknownPhase: operation["unknownPhase"],
    lastError: lastError
      ? {
          name: boundedText(lastError["name"], 128),
          message: boundedText(lastError["message"]),
        }
      : undefined,
    journalPath: operation["journalPath"],
    checkpoints: {
      pre: checkpointPointer(operation["preCheckpoint"]),
      final: checkpointPointer(operation["finalCheckpoint"]),
    },
    artifacts: {
      count: artifacts.length,
      recent: artifacts
        .slice(-12)
        .map((artifact) => summarizeArtifact(artifact)),
    },
    updatedAt: operation["updatedAt"],
  };
}

export function isTerminalOperation(operation: unknown): boolean {
  const state = isRecord(operation) ? operation["state"] : undefined;
  return [
    "completed",
    "rolled-back",
    "reconciled-no-mutation",
    "plan-invalidated",
  ].includes(String(state));
}
