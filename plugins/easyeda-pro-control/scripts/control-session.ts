#!/usr/bin/env node
import { createHash } from "node:crypto";
import { once } from "node:events";
import { lstat, open, readFile, realpath } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import process from "node:process";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";

import { assertSelfSoftCoreLimitZero } from "../server/src/soft-core-limit.ts";
import { loadRuntimeMachineProfile, machineProfileLaunchConfiguration } from "../server/src/machine-profile.ts";

export const MAXIMUM_REQUEST_BYTES = 65_536;
const MAXIMUM_INLINE_BYTES = 1_048_576;
const MAXIMUM_RESULT_BYTES = 67_108_864;
const TOOL_PATTERN = /^easyeda_control_[a-z_]+$/u;
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
  const manifestText = await readFile(manifestPath, "utf8");
  const reviewed = reviewedBundleSchema.parse(JSON.parse(manifestText));
  const files = reviewed.facadeImplementation.bundle.files;
  if (new Set(files.map((file) => file.relativePath)).size !== 3) {
    throw new Error("invalid-bundle-manifest");
  }
  for (const file of files) {
    const directory = file.relativePath === "easyeda-fd-sanitizer" ? "bin" : "dist";
    const filePath = join(pluginRoot, "server", directory, file.relativePath);
    const fileInfo = await lstat(filePath);
    if (!fileInfo.isFile()) {
      throw new Error("bundle-not-regular");
    }
    const bytes = await readFile(filePath);
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

async function main(): Promise<void> {
  const option = process.argv[2];
  const suppliedRoot = process.argv[3];
  if (process.argv.length !== 4 || option !== "--plugin-root" ||
    suppliedRoot === undefined || !isAbsolute(suppliedRoot)) {
    throw new Error("usage-control-session--plugin-root-absolute-path");
  }
  await assertSelfSoftCoreLimitZero();
  if (process.version !== "v24.18.0" || process.platform !== "linux" ||
    process.arch !== "x64") {
    throw new Error("unreviewed-runtime");
  }
  const pluginRoot = resolve(suppliedRoot);
  if (await realpath(pluginRoot) !== pluginRoot) {
    throw new Error("plugin-root-not-canonical");
  }
  const configurationPath = join(pluginRoot, ".mcp.json");
  const configurationText = await readFile(configurationPath, "utf8");
  parseSessionConfiguration(JSON.parse(configurationText));
  const { profile } = await loadRuntimeMachineProfile();
  const definition = machineProfileLaunchConfiguration(profile, pluginRoot);
  if (await realpath(definition.command) !== await realpath(process.execPath)) {
    throw new Error("unreviewed-node-command");
  }
  await verifyBundle(pluginRoot);
  // The facade retains its own atomic lease. Never create another data root to
  // Evading an existing owner or spawning the upstream directly is prohibited.
  const transport = new StdioClientTransport({
    command: definition.command,
    args: definition.args,
    cwd: pluginRoot,
    env: sessionTransportEnvironment(definition.env),
    stderr: "ignore",
  });
  const client = new Client({ name: "easyeda-control-session", version: "0.3.0" });
  const abort = new AbortController();
  const stop = (): void => {
    abort.abort();
    process.stdin.destroy();
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  try {
    await client.connect(transport, { timeout: 30_000, signal: abort.signal });
    const catalog = await client.listTools({}, { timeout: 30_000, signal: abort.signal });
    const names = catalog.tools.map((tool) => tool.name);
    if (catalog.nextCursor !== undefined || names.length === 0 ||
      names.some((name) => !TOOL_PATTERN.test(name))) {
      throw new Error("unexpected-facade-catalog");
    }
    await emitJson({ ready: true, facadePid: transport.pid, tools: names });
    await runSessionRequests(
      boundedLines(process.stdin),
      new Set(names),
      (request) => client.callTool({
        name: request.tool, arguments: request.arguments,
      }, undefined, { timeout: request.timeoutMs, signal: abort.signal }),
      emitJson,
    );
  } finally {
    process.removeListener("SIGINT", stop);
    process.removeListener("SIGTERM", stop);
    await client.close();
    await transport.close();
  }
}

if (import.meta.main) {
  try {
    // oxlint-disable-next-line node/no-top-level-await -- This ESM executable keeps one foreground session alive; imports used by tests do not enter it.
    await main();
  } catch {
    process.exitCode = 1;
    process.stdout.write(`${JSON.stringify({ error: "session-stopped", privateDiagnosticsWithheld: true })}\n`);
  }
}
