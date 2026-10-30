#!/usr/bin/env node
/* oxlint-disable import/max-dependencies -- Keep the original profile/transport boundaries while classifying failures with inert builtin descriptors and native errno constants. */
import { createHash } from "node:crypto";
import { once } from "node:events";
import { lstat, open, readFile, realpath } from "node:fs/promises";
import { constants as systemConstants } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import process from "node:process";
import { types } from "node:util";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";

import { assertSelfSoftCoreLimitZero } from "../server/src/soft-core-limit.ts";
import { loadMachineLaunchProfile, machineProfileLaunchConfiguration } from "../server/src/machine-profile.ts";
import type { MachineProfile } from "../server/src/machine-profile.ts";

export const MAXIMUM_REQUEST_BYTES = 65_536;
const MAXIMUM_INLINE_BYTES = 1_048_576;
const MAXIMUM_RESULT_BYTES = 67_108_864;
const TOOL_PATTERN = /^easyeda_control_[a-z][a-z0-9_]*$/u;
const requestId = z.union([z.string().min(1).max(128), z.number().int()]);
const callSchema = z.strictObject({
  id: requestId,
  tool: z.string().regex(TOOL_PATTERN),
  arguments: z.record(z.string(), z.unknown()).default({}),
  timeoutMs: z.number().int().min(1000).max(600_000).default(600_000),
  responseFile: z.string().refine(isAbsolute).optional(),
});
const requestSchema = z.union([
  callSchema,
  z.strictObject({ id: requestId, shutdown: z.literal(true) }),
]);
type SessionRequest = z.infer<typeof requestSchema>;
type CallRequest = z.infer<typeof callSchema>;
type Emitter = (value: unknown) => Promise<void>;
type Invoker = (request: CallRequest) => Promise<unknown>;

const sessionPhases = ["arguments", "core-limit", "runtime", "plugin-root", "configuration-read", "configuration-parse",
  "machine-profile", "launch-configuration", "configured-node", "executing-node", "node-command",
  "bundle-manifest-read", "bundle-manifest-parse", "bundle-manifest-validate", "bundle-file-stat", "bundle-file-read", "bundle-file-validate",
  "transport-create", "client-create", "connect", "catalog-request", "catalog-validate", "ready-publish", "requests", "client-close", "transport-close"] as const;
type SessionPhase = typeof sessionPhases[number];
const guardMessages = [
  ["usage-control-session--plugin-root-absolute-path", "invalid-arguments"],
  ["unreviewed-runtime", "unreviewed-runtime"], ["plugin-root-not-canonical", "plugin-root-not-canonical"],
  ["unreviewed-node-command", "unreviewed-node-command"], ["invalid-bundle-manifest", "invalid-bundle-manifest"],
  ["bundle-not-regular", "bundle-not-regular"], ["bundle-drift", "bundle-drift"], ["unexpected-facade-catalog", "unexpected-facade-catalog"],
  ["The process limits record exceeds the supported size.", "core-limit-record-too-large"],
  ["The process must expose exactly one zero soft core-file limit.", "core-limit-record-invalid"],
  ["The process must have a zero soft core-file limit.", "core-limit-nonzero"],
  ["The current process soft core-file limit could not be proven zero.", "core-limit-unproven"],
] as const;
const guardReasons = new Map<string, typeof guardMessages[number][1]>(guardMessages);
const profileCodes = ["machine-profile-requires-linux-x64", "machine-profile-outside-control-directory", "machine-profile-file-not-private",
  "machine-directory-not-canonical", "machine-control-directory-not-private", "machine-file-not-bounded-canonical-regular",
  "machine-file-changed", "machine-node-permissions-invalid", "machine-node-hash-mismatch", "machine-node-changed",
  "machine-node-version-or-identity-mismatch", "machine-current-node-kernel-identity-mismatch", "machine-current-node-version-mismatch",
  "machine-current-node-kernel-invalid"] as const;
const osCodes = ["ENOENT", "ENOTDIR", "EACCES", "EPERM", "ELOOP", "EMFILE", "ENFILE", "ENOMEM", "EIO", "ENOSPC",
  "ETIMEDOUT", "ECONNREFUSED", "ECONNRESET", "EPIPE", "ECANCELED", "EADDRINUSE"] as const;
type FailureReason = typeof guardMessages[number][1] | "operating-system-error" | "operation-aborted" | "connection-closed" |
  "request-timeout" | "machine-profile-rejected" | "json-rejected" | "schema-rejected" | "unclassified";
interface SessionFailureDiagnostic {
  readonly error: "session-stopped";
  readonly privateDiagnosticsWithheld: true;
  readonly phase: SessionPhase | "unclassified";
  readonly reason: FailureReason;
  readonly osCode?: typeof osCodes[number];
  readonly errno?: number;
  readonly protocolCode?: -32_000 | -32_001;
  readonly profileCode?: typeof profileCodes[number];
}
let sessionPhase: SessionPhase = "arguments";
let firstSessionFailure: SessionFailureDiagnostic | null = null;
function errorData(error: unknown, key: string): unknown {
  if (error === null || typeof error !== "object" || types.isProxy(error)) { return undefined; }
  const descriptor = Object.getOwnPropertyDescriptor(error, key);
  return descriptor !== undefined && Object.hasOwn(descriptor, "value") ? descriptor.value as unknown : undefined;
}
/** Output contains fixed labels and allowlisted native numbers only. Unknown
 * exception messages, inherited properties, getters and nested data stay private.
 * These diagnostics change no request, retry, lease or cleanup authority. */
export function sessionFailureDiagnostic(phase: unknown, error: unknown): Readonly<SessionFailureDiagnostic> {
  const label = sessionPhases.find(value => value === phase) ?? "unclassified";
  const base = { error: "session-stopped", privateDiagnosticsWithheld: true, phase: label } as const;
  const code = errorData(error, "code"), osCode = osCodes.find(value => value === code);
  if (osCode !== undefined) {
    const errno = errorData(error, "errno"), nativeErrno = systemConstants.errno[osCode];
    return Object.freeze({ ...base, reason: "operating-system-error", osCode,
      ...(typeof errno === "number" && Number.isSafeInteger(errno) && typeof nativeErrno === "number" &&
        nativeErrno > 0 && errno === -nativeErrno ? { errno } : {}) });
  }
  if (code === "ABORT_ERR") { return Object.freeze({ ...base, reason: "operation-aborted" }); }
  if (code === -32_000 || code === -32_001) {
    return Object.freeze({ ...base, reason: code === -32_000 ? "connection-closed" : "request-timeout", protocolCode: code });
  }
  const profileCode = profileCodes.find(value => value === code);
  if (profileCode !== undefined) { return Object.freeze({ ...base, reason: "machine-profile-rejected", profileCode }); }
  const message = errorData(error, "message"), reason = typeof message === "string" && message.length <= 256 ? guardReasons.get(message) : undefined;
  if (reason !== undefined) { return Object.freeze({ ...base, reason }); }
  if (error !== null && typeof error === "object" && !types.isProxy(error)) {
    const prototype: unknown = Object.getPrototypeOf(error);
    if (Error.isError(error) && prototype === SyntaxError.prototype) { return Object.freeze({ ...base, reason: "json-rejected" }); }
    const issues = errorData(error, "issues");
    if (Error.isError(error) && errorData(error, "name") === "ZodError" &&
        issues !== null && typeof issues === "object" && !types.isProxy(issues) && Array.isArray(issues)) {
      return Object.freeze({ ...base, reason: "schema-rejected" });
    }
  }
  return Object.freeze({ ...base, reason: "unclassified" });
}

export function parseSessionRequest(line: string): SessionRequest {
  if (Buffer.byteLength(line) > MAXIMUM_REQUEST_BYTES) {
    throw new Error("request-too-large");
  }
  return requestSchema.parse(JSON.parse(line));
}

export async function* boundedLines(
  chunks: AsyncIterable<Buffer>,
): AsyncGenerator<string> {
  let pending = Buffer.alloc(0);
  for await (const chunk of chunks) {
    pending = Buffer.concat([pending, chunk]);
    let newline = pending.indexOf(10);
    while (newline !== -1) {
      if (newline > MAXIMUM_REQUEST_BYTES) {
        throw new Error("request-too-large");
      }
      const line = pending.subarray(0, newline).toString("utf8");
      pending = pending.subarray(newline + 1);
      yield line;
      newline = pending.indexOf(10);
    }
    if (pending.length > MAXIMUM_REQUEST_BYTES) {
      throw new Error("request-too-large");
    }
  }
  if (pending.length > 0) {
    throw new Error("incomplete-request-line");
  }
}

async function publishResult(
  request: CallRequest,
  result: unknown,
  emit: Emitter,
): Promise<void> {
  const bytes = Buffer.from(JSON.stringify({ id: request.id, result }));
  if (bytes.length > MAXIMUM_RESULT_BYTES) {
    throw new Error("result-too-large");
  }
  if (request.responseFile === undefined) {
    if (bytes.length > MAXIMUM_INLINE_BYTES) {
      throw new Error("result-needs-response-file");
    }
    await emit({ id: request.id, result });
    return;
  }
  const directory = dirname(request.responseFile);
  const directoryInfo = await lstat(directory);
  if (
    !directoryInfo.isDirectory() ||
    directoryInfo.mode % 512 !== 0o700 ||
    directoryInfo.uid !== process.getuid?.() ||
    await realpath(directory) !== directory
  ) {
    throw new Error("response-directory-must-be-private-and-canonical");
  }
  // Exclusive creation refuses existing files and symlinks. The caller must
  // Retain ownership of the private parent directory throughout this call.
  const file = await open(request.responseFile, "wx", 0o600);
  try {
    await file.writeFile(bytes);
    await file.sync();
  } finally {
    await file.close();
  }
  await emit({
    id: request.id,
    responseFile: request.responseFile,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
}

export async function runSessionRequests(
  lines: AsyncIterable<string>,
  allowedTools: ReadonlySet<string>,
  invoke: Invoker,
  emit: Emitter,
): Promise<void> {
  for await (const line of lines) {
    let request: SessionRequest;
    try {
      request = parseSessionRequest(line);
    } catch {
      await emit({ error: "invalid-request", dispatched: false });
      return;
    }
    if ("shutdown" in request) {
      await emit({ id: request.id, closing: true });
      return;
    }
    if (!allowedTools.has(request.tool)) {
      await emit({ id: request.id, error: "tool-not-admitted", dispatched: false });
      return;
    }
    try {
      const result = await invoke(request);
      await publishResult(request, result, emit);
    } catch (error) {
      // Never print private transport stderr or nested exceptions. A timeout,
      // Disconnect or result-publication failure ends this session, never retries.
      await emit({
        id: request.id,
        error: "call-or-publication-failed",
        category: error instanceof Error ? error.name : "unknown",
        outcome: "inspect-facade-journal-before-retry",
        closing: true,
      });
      return;
    }
  }
}

const serverSchema = z.object({
  type: z.literal("stdio"),
  enabled: z.literal(true),
  command: z.literal("node"),
  args: z.tuple([z.literal("server/dist/server.mjs"), z.literal("--machine-launch")]),
  cwd: z.literal("."),
  env: z.record(z.string(), z.string()).refine((environment) => Object.keys(environment).length === 0),
});
const serversSchema = z.strictObject({ easyeda_pro_control: serverSchema });
const configurationSchema = z.object({ mcpServers: serversSchema });

export function parseSessionConfiguration(value: unknown): z.infer<typeof configurationSchema> {
  return configurationSchema.parse(value);
}
const reviewedFileSchema = z.object({
  relativePath: z.enum([
    "easyeda-fd-sanitizer", "server.mjs", "upstream-supervisor.mjs",
  ]),
  bytes: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/u),
});
const bundleSchema = z.object({ files: z.array(reviewedFileSchema).length(3) });
const reviewedBundleSchema = z.object({
  facadeImplementation: z.object({ bundle: bundleSchema }),
});

async function verifyBundle(pluginRoot: string): Promise<void> {
  const manifestPath = join(pluginRoot, "reviewed-compatibility.json");
  sessionPhase = "bundle-manifest-read";
  const manifestText = await readFile(manifestPath, "utf8");
  sessionPhase = "bundle-manifest-parse";
  const reviewed = reviewedBundleSchema.parse(JSON.parse(manifestText));
  const files = reviewed.facadeImplementation.bundle.files;
  sessionPhase = "bundle-manifest-validate";
  if (new Set(files.map((file) => file.relativePath)).size !== 3) {
    throw new Error("invalid-bundle-manifest");
  }
  for (const file of files) {
    const directory = file.relativePath === "easyeda-fd-sanitizer" ? "bin" : "dist";
    const filePath = join(pluginRoot, "server", directory, file.relativePath);
    sessionPhase = "bundle-file-stat";
    const fileInfo = await lstat(filePath);
    if (!fileInfo.isFile()) {
      throw new Error("bundle-not-regular");
    }
    sessionPhase = "bundle-file-read";
    const bytes = await readFile(filePath);
    sessionPhase = "bundle-file-validate";
    if (bytes.length !== file.bytes ||
      createHash("sha256").update(bytes).digest("hex") !== file.sha256) {
      throw new Error("bundle-drift");
    }
  }
}

async function emitJson(value: unknown): Promise<void> {
  if (!process.stdout.write(`${JSON.stringify(value)}\n`)) {
    await once(process.stdout, "drain");
  }
}

/** The native helper needs its WSL share identity, not the caller's full environment. */
export function sessionTransportEnvironment(definitionEnvironment: Readonly<Record<string, string>>, hostEnvironment: Readonly<Record<string, string | undefined>> = process.env): Record<string, string> {
  const environment = { ...definitionEnvironment };
  const distribution = hostEnvironment["WSL_DISTRO_NAME"];
  if (distribution !== undefined) { environment["WSL_DISTRO_NAME"] = distribution; }
  return environment;
}

export function sessionMachineLaunchConfiguration(profilePath: string, profile: MachineProfile, pluginRoot: string): ReturnType<typeof machineProfileLaunchConfiguration> {
  const definition = machineProfileLaunchConfiguration(profile, pluginRoot);
  // The common launcher rechecks external readiness and chooses the restricted
  // Offline entrypoint when needed. Never bypass it by entering index directly.
  return { ...definition, args: [...definition.args, "--machine-launch"], env: { EASYEDA_MACHINE_PROFILE: profilePath } };
}

async function main(): Promise<void> {
  sessionPhase = "arguments";
  const option = process.argv[2];
  const suppliedRoot = process.argv[3];
  if (process.argv.length !== 4 || option !== "--plugin-root" ||
    suppliedRoot === undefined || !isAbsolute(suppliedRoot)) {
    throw new Error("usage-control-session--plugin-root-absolute-path");
  }
  sessionPhase = "core-limit";
  await assertSelfSoftCoreLimitZero();
  sessionPhase = "runtime";
  if (process.version !== "v24.18.0" || process.platform !== "linux" ||
    process.arch !== "x64") {
    throw new Error("unreviewed-runtime");
  }
  const pluginRoot = resolve(suppliedRoot);
  sessionPhase = "plugin-root";
  if (await realpath(pluginRoot) !== pluginRoot) {
    throw new Error("plugin-root-not-canonical");
  }
  const configurationPath = join(pluginRoot, ".mcp.json");
  sessionPhase = "configuration-read";
  const configurationText = await readFile(configurationPath, "utf8");
  sessionPhase = "configuration-parse";
  parseSessionConfiguration(JSON.parse(configurationText));
  sessionPhase = "machine-profile";
  const { profilePath, profile } = await loadMachineLaunchProfile();
  sessionPhase = "launch-configuration";
  const definition = sessionMachineLaunchConfiguration(profilePath, profile, pluginRoot);
  sessionPhase = "configured-node";
  const configuredNode = await realpath(definition.command);
  sessionPhase = "executing-node";
  const executingNode = await realpath(process.execPath);
  sessionPhase = "node-command";
  if (configuredNode !== executingNode) {
    throw new Error("unreviewed-node-command");
  }
  await verifyBundle(pluginRoot);
  // The facade retains its own atomic lease. Never create another data root to
  // Evading an existing owner or spawning the upstream directly is prohibited.
  sessionPhase = "transport-create";
  const transport = new StdioClientTransport({
    command: definition.command,
    args: definition.args,
    cwd: pluginRoot,
    env: sessionTransportEnvironment(definition.env),
    stderr: "ignore",
  });
  sessionPhase = "client-create";
  const client = new Client({ name: "easyeda-control-session", version: "0.3.0" });
  const abort = new AbortController();
  const stop = (): void => {
    abort.abort();
    process.stdin.destroy();
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  try {
    sessionPhase = "connect";
    await client.connect(transport, { timeout: 30_000, signal: abort.signal });
    sessionPhase = "catalog-request";
    const catalog = await client.listTools({}, { timeout: 30_000, signal: abort.signal });
    sessionPhase = "catalog-validate";
    const names = catalog.tools.map((tool) => tool.name);
    if (catalog.nextCursor !== undefined || names.length === 0 ||
      names.some((name) => !TOOL_PATTERN.test(name))) {
      throw new Error("unexpected-facade-catalog");
    }
    sessionPhase = "ready-publish";
    await emitJson({ ready: true, facadePid: transport.pid, tools: names });
    sessionPhase = "requests";
    await runSessionRequests(
      boundedLines(process.stdin),
      new Set(names),
      (request) => client.callTool({
        name: request.tool, arguments: request.arguments,
      }, undefined, { timeout: request.timeoutMs, signal: abort.signal }),
      emitJson,
    );
  } catch (error) {
    firstSessionFailure ??= sessionFailureDiagnostic(sessionPhase, error);
    throw error;
  } finally {
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
    sessionPhase = "client-close";
    await client.close();
    sessionPhase = "transport-close";
    await transport.close();
  }
}

if (import.meta.main) {
  try {
    // oxlint-disable-next-line node/no-top-level-await -- This ESM executable keeps one foreground session alive; imports used by tests do not enter it.
    await main();
  } catch (error) {
    process.exitCode = 1;
    process.stdout.write(`${JSON.stringify(firstSessionFailure ?? sessionFailureDiagnostic(sessionPhase, error))}\n`);
  }
}
