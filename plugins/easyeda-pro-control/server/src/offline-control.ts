/* oxlint-disable import/max-dependencies -- This entrypoint composes local queries, transport and lease helpers without importing the live runtime coordinator. */
import process from "node:process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, ensureManagedDirectory } from "./artifacts.ts";
import { CONTROL_VERSION, assertSelfSoftCoreLimitZero, sha256Text } from "./core.ts";
import { acquireFacadeLease } from "./lease.ts";
import { diagnoseConfiguredInstallation } from "./machine-installation-diagnostics.ts";
import type { MachineInstallationFailureCode } from "./machine-profile.ts";
import { offlineApiToolConfiguration, runOfflineApi } from "./offline-api.ts";
import { discoverReviewedOrLiveTools } from "./reviewed-upstream-tools.ts";
import { shutdownBeforeLeaseRelease } from "./shutdown.ts";

const outputSchema = z.object({ offline: z.literal(true), result: z.unknown().optional() }).catchall(z.unknown());

function offlineResult(value: Record<string, unknown>): CallToolResult {
  const encoded = JSON.stringify(value);
  if (Buffer.byteLength(encoded) > 512 * 1024) {
    throw new Error("Offline result exceeds the response limit.");
  }
  return {
    content: [{ type: "text", text: JSON.stringify({ ok: true, structuredContent: true,
      jsonBytes: Buffer.byteLength(encoded), sha256: sha256Text(encoded) }) }],
    structuredContent: value,
  };
}

function offlineGuard<Input>(handler: (input: Input) => Record<string, unknown> | Promise<Record<string, unknown>>): (input: Input) => Promise<CallToolResult> {
  return async (input): Promise<CallToolResult> => {
    try { return offlineResult(await handler(input)); }
    catch {
      const details = { offline: true, ok: false, error: { code: "offline-query-failed", dispatched: false } };
      return { isError: true, content: [{ type: "text", text: JSON.stringify(details) }], structuredContent: details };
    }
  };
}

function refuseLiveDiscovery(): Promise<never> {
  return Promise.reject(new Error("Live discovery is unavailable in offline-only mode."));
}

/** This entrypoint has no upstream client, runtime controller or mutation tools. */
export async function startOfflineControlServer(code: MachineInstallationFailureCode): Promise<void> {
  await assertSelfSoftCoreLimitZero();
  const server = new McpServer({ name: "easyeda-pro-control", version: CONTROL_VERSION }, {
    capabilities: { tools: {} },
    instructions: "Offline-only mode: the configured external installation is unavailable. Bundled API reference, argument validation, existing managed-checkpoint symbol preparation, local catalog discovery and bounded startup diagnostics are available. No live execution or recovery tools exist in this process. Repair and review the installation, then restart the MCP session. Offline mode never promotes itself to live mode.",
  });
  const annotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
  server.registerTool("easyeda_control_api", { ...offlineApiToolConfiguration, outputSchema },
    offlineGuard(({ request }) => runOfflineApi(request)));
  server.registerTool("easyeda_control_status", {
    title: "Report offline-only EasyEDA startup status",
    description: "Return the startup failure code and bounded read-only installation drift diagnostics: configured file roles, candidate bundle directory names and app package version. Candidates are not admitted. Does not inspect designs, start an upstream process, access credentials, modify configuration, or connect to EasyEDA. Review the installation, then restart this session to reassess availability.",
    inputSchema: {}, outputSchema, annotations,
  }, offlineGuard(async () => ({ offline: true, mode: "offline-only", liveExecutionAvailable: false,
    installation: { ready: false, code }, diagnostics: await diagnoseConfiguredInstallation(), restartRequired: true,
    availableTools: ["easyeda_control_api", "easyeda_control_discover", "easyeda_control_status"],
    capabilityScope: "Bundled reference, existing managed-checkpoint preparation and installation metadata diagnostics only; no current-runtime admission." })));
  server.registerTool("easyeda_control_discover", {
    title: "Discover the local EasyEDA reference catalog",
    description: "Search the bundled upstream reference. Every execution route is unavailable in this offline-only process. Live discovery is refused; catalog presence does not admit a method on the installed EasyEDA version.",
    inputSchema: { query: z.string().default(""), mode: z.enum(["all", "read", "write"]).default("read"),
      source: z.literal("local").default("local"), limit: z.number().int().min(1).max(100).default(30),
      includeSchemas: z.boolean().default(false) }, outputSchema, annotations,
  }, offlineGuard(async (input) => {
    const entries = await discoverReviewedOrLiveTools(refuseLiveDiscovery, refuseLiveDiscovery, input);
    return { offline: true, liveExecutionAvailable: false,
      result: entries.map((entry) => Object.assign(entry, { facadeTool: null, availability: "unavailable" })) };
  }));

  await ensureManagedDirectory(controlDataDirectory());
  const lease = await acquireFacadeLease(await controlRootCapability());
  let shutdown: Promise<void> | undefined;
  const close = (): Promise<void> => {
    shutdown ??= shutdownBeforeLeaseRelease([server], lease);
    return shutdown;
  };
  const closeAndExit = async (): Promise<void> => {
    let exitCode = 0;
    try { await close(); }
    catch { process.stderr.write("EasyEDA offline control shutdown was incomplete.\n"); exitCode = 1; }
    // oxlint-disable-next-line unicorn/no-process-exit -- Only exit after MCP shutdown and lease cleanup settle; match the stdio facade's signal lifecycle.
    process.exit(exitCode);
  };
  const scheduleShutdown = (): void => { void closeAndExit(); };
  process.once("SIGINT", scheduleShutdown);
  process.once("SIGTERM", scheduleShutdown);
  process.stdin.once("end", scheduleShutdown);
  try { await server.connect(new StdioServerTransport()); }
  catch (error) {
    process.removeListener("SIGINT", scheduleShutdown);
    process.removeListener("SIGTERM", scheduleShutdown);
    process.stdin.removeListener("end", scheduleShutdown);
    await close();
    throw error;
  }
}
