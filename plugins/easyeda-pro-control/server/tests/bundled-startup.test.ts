import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, readlink, realpath, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { describe, test } from "node:test";
import type { TestContext } from "node:test";
import { promisify } from "node:util";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import { createMachineProfile, writeMachineProfile } from "../src/machine-profile.ts";

// oxlint-disable-next-line typescript/strict-void-return -- execFile's documented callback carries the complete child result consumed by promisify.
const execFileAsync = promisify(execFile);

interface BundledFixture {
  readonly root: string;
  readonly pluginRoot: string;
  readonly bundle: string;
  readonly bootstrapNode: string;
  readonly pinnedNode: string;
  readonly controlDirectory: string;
  readonly profilePath: string;
  readonly upstreamMarker: string;
  readonly pcbBundle: string;
  readonly environment: Record<string, string>;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown): Record<string, unknown> {
  assert.ok(isObjectRecord(value));
  return value;
}

async function assertNoModuleAncestor(path: string): Promise<void> {
  let current = path;
  for (;;) {
    await assert.rejects(lstat(join(current, "node_modules")), { code: "ENOENT" });
    const parent = dirname(current);
    if (parent === current) { return; }
    current = parent;
  }
}

async function fixture(context: TestContext, calculationOnly = false): Promise<BundledFixture> {
  // Honor the selected filesystem; assertNoModuleAncestor still proves isolation.
  const root = await mkdtemp(join(tmpdir(), "easyeda-bundled-startup-"));
  context.after(async () => { await rm(root, { recursive: true, force: true }); });
  const pluginRoot = join(root, "plugin");
  const distRoot = join(pluginRoot, "server", "dist");
  const binRoot = join(pluginRoot, "server", "bin");
  const upstreamRoot = join(root, "metadata", "upstream");
  const assetsRoot = join(root, "metadata", "assets");
  const controlDirectory = join(root, "control");
  const pcbVersion = calculationOnly ? "3.2.193.682ed44e" : "3.2.149.5378b690";
  const apiVersion = calculationOnly ? "0.3.50.ab46409c" : "0.2.53.aee2f57a";
  for (const path of [distRoot, binRoot, join(upstreamRoot, "dist"),
    join(assetsRoot, "pro-pcb", pcbVersion, "js"), join(assetsRoot, "pro-api", apiVersion),
  ]) { await mkdir(path, { recursive: true, mode: 0o700 }); }
  const bundle = join(distRoot, "server.mjs");
  await Promise.all([
    copyFile(new URL("../dist/server.mjs", import.meta.url), bundle),
    copyFile(new URL("../dist/upstream-supervisor.mjs", import.meta.url), join(distRoot, "upstream-supervisor.mjs")),
    copyFile(new URL("../bin/easyeda-fd-sanitizer", import.meta.url), join(binRoot, "easyeda-fd-sanitizer")),
    writeFile(join(upstreamRoot, "package.json"), JSON.stringify({ name: "easyeda-mcp-pro", version: "1.0.0-rc.1" })),
  ]);
  const upstreamMarker = join(root, "upstream-must-not-execute");
  await writeFile(join(upstreamRoot, "dist", "index.js"),
    `import { writeFileSync } from "node:fs"; writeFileSync(${JSON.stringify(upstreamMarker)}, "unexpected execution"); throw new Error("Synthetic upstream must never execute.");\n`);
  const pcbBundle = join(assetsRoot, "pro-pcb", pcbVersion, "js", "pcb.js");
  for (const path of [pcbBundle,
    ...["api.js", "api-types.js", "api-types.d.ts"].map((name) => join(assetsRoot, "pro-api", apiVersion, name)),
  ]) { await writeFile(path, "synthetic installation metadata; never executed\n"); }
  const pinnedNode = await realpath(process.execPath);
  const bootstrapNode = join(root, "portable-bootstrap-node");
  await copyFile(pinnedNode, bootstrapNode);
  const profile = await createMachineProfile({ pluginRoot, nodeExecutable: pinnedNode, upstreamRoot, assetsRoot, controlDirectory });
  const profilePath = join(controlDirectory, "machine-profile.json");
  await writeMachineProfile(profile, profilePath);
  await assertNoModuleAncestor(distRoot);
  assert.deepEqual(await readdir(pluginRoot), ["server"]);
  const distEntries = await readdir(distRoot);
  assert.deepEqual(distEntries.toSorted(), ["server.mjs", "upstream-supervisor.mjs"]);
  return { root, pluginRoot, bundle, bootstrapNode, pinnedNode, controlDirectory, profilePath, upstreamMarker, pcbBundle,
    environment: { EASYEDA_MACHINE_PROFILE: profilePath, EASYEDA_CONTROL_DATA_DIR: controlDirectory, LANG: "C", LC_ALL: "C" } };
}

async function api(client: Client, request: Record<string, unknown>): Promise<Record<string, unknown>> {
  const reply = await client.callTool({ name: "easyeda_control_api", arguments: { request } }, undefined,
    { timeout: 10_000, maxTotalTimeout: 10_000 });
  assert.notEqual(reply.isError, true, JSON.stringify(reply.content));
  const payload = record(reply.structuredContent);
  assert.equal(payload["offline"], true);
  return record(payload["result"]);
}

async function assertNoLiveStartup(options: BundledFixture, pid: number): Promise<void> {
  const leaseText = await readFile(join(options.controlDirectory, "facade.lock"), "utf8");
  const lease = record(JSON.parse(leaseText));
  assert.equal(lease["pid"], pid);
  assert.equal(Object.hasOwn(lease, "childPid"), false);
  const controlEntries = await readdir(options.controlDirectory);
  assert.deepEqual(controlEntries.toSorted(), ["facade.lock", "machine-profile.json"]);
  await assert.rejects(lstat(options.upstreamMarker), { code: "ENOENT" });
  const descriptors = await readdir(`/proc/${pid}/fd`);
  // Libuv may implement stdio with UNIX socketpairs. Only additional sockets
  // Would signal unexpected gateway or network authority in this offline child.
  const nonStdioDescriptors = descriptors.filter((descriptor) => !["0", "1", "2"].includes(descriptor));
  const targets = await Promise.all(nonStdioDescriptors.map(async (descriptor) => {
    try { return await readlink(`/proc/${pid}/fd/${descriptor}`); }
    catch (error) {
      if (isObjectRecord(error) && error["code"] === "ENOENT") { return ""; }
      throw error;
    }
  }));
  assert.equal(targets.some((target) => target.startsWith("socket:")), false, "Offline startup must not create a bridge socket.");
  const children = await readFile(`/proc/${pid}/task/${pid}/children`, "utf8");
  assert.equal(children.trim(), "", "The offline facade must not start an upstream process.");
}

void describe("self-contained packaged machine startup", () => {
  void test("new configured generation exposes only calculation-mode tools without starting upstream", async (context) => {
    const options = await fixture(context, true);
    const transport = new StdioClientTransport({ command: options.bootstrapNode,
      args: [options.bundle, "--machine-launch"], cwd: options.root, env: options.environment, stderr: "pipe" });
    const client = new Client({ name: "calculation-mode-startup-test", version: "1.0.0" }, { capabilities: {} });
    context.after(async () => { await client.close(); });
    await client.connect(transport, { timeout: 15_000, maxTotalTimeout: 15_000 });
    const pid = transport.pid; assert.ok(pid !== null);
    const listed = await client.listTools();
    assert.deepEqual(listed.tools.map((tool) => tool.name).toSorted(), [
      "easyeda_control_api", "easyeda_control_calculate", "easyeda_control_discover", "easyeda_control_disposable_pcb_rename", "easyeda_control_disposable_schematic_rename", "easyeda_control_disposable_symbol_copy", "easyeda_control_editor_context", "easyeda_control_editor_shell", "easyeda_control_extensions", "easyeda_control_history", "easyeda_control_launch", "easyeda_control_pcb_geometry", "easyeda_control_pcb_identities", "easyeda_control_pcb_layers", "easyeda_control_project_board", "easyeda_control_project_open", "easyeda_control_project_pcb", "easyeda_control_project_schematic", "easyeda_control_project_symbol", "easyeda_control_project_symbol_metadata", "easyeda_control_shortcuts", "easyeda_control_status", "easyeda_control_system",
    ]);
    const catalog = await api(client, { action: "calculations", query: { includeSchemas: true } });
    assert.equal(catalog["total"], 16); assert.equal(catalog["invocationEnabledByDiscovery"], false);
    const schematics = await api(client, { action: "project-schematic", query: { includeSchemas: true } });
    assert.equal(schematics["total"], 4); assert.equal(schematics["invocationEnabledByDiscovery"], false);
    const schematicRequest = await api(client, { action: "project-schematic-validate", query: { request: {
      method: "eda.dmt_Schematic.getAllSchematicsInfo", target: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) },
    } } });
    assert.equal(schematicRequest["valid"], true); assert.equal(schematicRequest["executionAuthorized"], false);
    const valid = await api(client, { action: "calculate-validate", query: { request: {
      method: "eda.sys_Math.calculateArea", arguments: { polygon: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }] },
    } } });
    assert.equal(valid["valid"], true); assert.equal(valid["executionAuthorized"], false);
    const clipping = await api(client, { action: "calculate-validate", query: { request: {
      method: "eda.sys_Math.subtract", arguments: {
        polygon1: [{ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 8 }, { x: 0, y: 8 }],
        polygon2: [{ x: 2, y: 2 }, { x: 6, y: 2 }, { x: 6, y: 6 }, { x: 2, y: 6 }],
      },
    } } });
    assert.equal(clipping["valid"], true); assert.equal(clipping["executionAuthorized"], false);
    const system = await api(client, { action: "system", query: { includeSchemas: true } });
    assert.equal(system["total"], 18); assert.equal(system["invocationEnabledByDiscovery"], false);
    const unit = await api(client, { action: "system-validate", query: { request: {
      method: "eda.sys_Unit.inchToMm", arguments: { inch: 1, numberOfDecimals: 3 },
    } } });
    assert.equal(unit["valid"], true); assert.equal(unit["executionAuthorized"], false);
    const extensions = await api(client, { action: "extensions", query: { includeSchemas: true } });
    assert.equal(extensions["total"], 1); assert.equal(extensions["invocationEnabledByDiscovery"], false);
    const indexRequest = await api(client, { action: "extensions-validate", query: { request: { action: "list-startup-index" } } });
    assert.equal(indexRequest["valid"], true); assert.equal(indexRequest["executionAuthorized"], false);
    const shortcuts = await api(client, { action: "shortcuts", query: { includeSchemas: true } });
    assert.equal(shortcuts["total"], 1); assert.equal(shortcuts["invocationEnabledByDiscovery"], false);
    const shortcutRequest = await api(client, { action: "shortcuts-validate", query: { request: {
      method: "eda.sys_ShortcutKey.getShortcutKeys", arguments: { includeSystem: false },
    } } });
    assert.equal(shortcutRequest["valid"], true); assert.equal(shortcutRequest["executionAuthorized"], false);
    const layers = await api(client, { action: "pcb-layers", query: { includeSchemas: true } });
    assert.equal(layers["total"], 2); assert.equal(layers["invocationEnabledByDiscovery"], false);
    const layerRequest = await api(client, { action: "pcb-layers-validate", query: { request: {
      method: "eda.pcb_Layer.getAllLayers", arguments: {}, target: {
        projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), tabId: `${"c".repeat(16)}@${"a".repeat(64)}`,
      },
    } } });
    assert.equal(layerRequest["valid"], true); assert.equal(layerRequest["executionAuthorized"], false);
    const identities = await api(client, { action: "pcb-identities", query: { includeSchemas: true } });
    assert.equal(identities["total"], 11); assert.equal(identities["invocationEnabledByDiscovery"], false);
    const identityRequest = await api(client, { action: "pcb-identities-validate", query: { request: {
      method: "eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId", arguments: {}, target: {
        projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), tabId: `${"c".repeat(16)}@${"a".repeat(64)}`,
      },
    } } });
    assert.equal(identityRequest["valid"], true); assert.equal(identityRequest["executionAuthorized"], false);
    const geometry = await api(client, { action: "pcb-geometry", query: { includeSchemas: true } });
    assert.equal(geometry["total"], 19); assert.equal(geometry["invocationEnabledByDiscovery"], false);
    const geometryRequest = await api(client, { action: "pcb-geometry-validate", query: { request: {
      method: "eda.pcb_PrimitiveLine.getAll", arguments: {}, target: {
        projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), tabId: `${"c".repeat(16)}@${"a".repeat(64)}`,
      },
    } } });
    assert.equal(geometryRequest["valid"], true); assert.equal(geometryRequest["executionAuthorized"], false);
    const symbol = await api(client, { action: "project-symbol", query: { method: "eda.lib_Symbol.get", includeSchemas: true } });
    assert.equal(symbol["total"], 1); assert.equal(symbol["invocationEnabledByDiscovery"], false);
    const symbolRequest = await api(client, { action: "project-symbol-validate", query: { request: {
      method: "eda.lib_Symbol.get", arguments: { symbolUuid: "d".repeat(32) }, target: {
        projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), tabId: `${"c".repeat(16)}@${"a".repeat(64)}`,
      },
    } } });
    assert.equal(symbolRequest["valid"], true); assert.equal(symbolRequest["executionAuthorized"], false);
    const history = await api(client, { action: "history", query: { includeSchemas: true } });
    assert.equal(history["total"], 2); assert.equal(history["invocationEnabledByDiscovery"], false);
    const historyRequest = await api(client, { action: "history-validate", query: { request: {
      action: "abandon-before-navigation", operationId: "easyeda-synthetic-historical-abandonment",
      confirmation: "easyeda-synthetic-historical-abandonment:abandoned-before-navigation",
    } } });
    assert.equal(historyRequest["valid"], true); assert.equal(historyRequest["executionAuthorized"], false);
    const schematicRename = await api(client, { action: "disposable-schematic-rename", query: { includeSchemas: true } });
    assert.equal(schematicRename["tool"], "easyeda_control_disposable_schematic_rename");
    assert.equal(schematicRename["historicalConnectedValidation"], "installed143713-disposable-schematic-title-only-lifecycle");
    assert.ok(isObjectRecord(schematicRename["inputSchema"]));
    for (const key of ["executionAuthorized", "invocationEnabledByDiscovery", "connectedValidation", "ordinaryProjectsSupported"]) {
      assert.equal(schematicRename[key], false);
    }
    const schematicRenameRequest = await api(client, { action: "disposable-schematic-rename-validate", query: { request: {
      action: "baseline-begin", operationId: "offline-schematic-rename", openingOperationId: "offline-project-opening",
      target: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ownerUuid: "c".repeat(32), schematicUuid: "d".repeat(16) },
      desiredTitle: "Renamed SCH", confirmDisposableProject: true, acceptSchematicRename: true,
    } } });
    assert.equal(schematicRenameRequest["valid"], true); assert.equal(schematicRenameRequest["executionAuthorized"], false);
    const invalidShortcut = await client.callTool({ name: "easyeda_control_shortcuts", arguments: {
      request: { method: "eda.sys_ShortcutKey.getShortcutKeys", arguments: { includeSystem: false }, callback: "caller-code" }, expectedFingerprint: {},
    } });
    assert.equal(invalidShortcut.isError, true);
    const invalidIndex = await client.callTool({ name: "easyeda_control_extensions", arguments: {
      request: { action: "list-startup-index", topic: "caller-selected" }, expectedFingerprint: {},
    } });
    assert.equal(invalidIndex.isError, true);
    for (const [action, request] of [
      ["editor-shell-validate", { action: "observe-editor-shell" }],
      ["editor-context-validate", { action: "observe-editor-context" }],
      ["launch-validate", { action: "launch", operationId: "offline-launch-fixture", confirmLaunch: true, acceptExistingProfileEffects: true }],
      ["launch-validate", { action: "observe-application", operationId: "offline-launch-fixture" }],
      ["launch-validate", { action: "abandon-supervision", operationId: "offline-launch-fixture", expectedLaunchedSha256: "a".repeat(64),
        confirmAbandonSupervision: true, acceptUnobservedDescendants: true }],
    ] as const) {
      const validation = await api(client, { action, query: { request } });
      assert.equal(validation["valid"], true); assert.equal(validation["executionAuthorized"], false);
    }
    const invalidLaunch = await client.callTool({ name: "easyeda_control_launch", arguments: {
      request: { action: "launch", operationId: "offline-launch-fixture", confirmLaunch: true, acceptExistingProfileEffects: true, args: ["caller-selected"] },
    } });
    assert.equal(invalidLaunch.isError, true);
    const invalidPresence = await client.callTool({ name: "easyeda_control_launch", arguments: {
      request: { action: "observe-application", operationId: "offline-launch-fixture", pid: 456 },
    } });
    assert.equal(invalidPresence.isError, true);
    const discovery = await client.callTool({ name: "easyeda_control_discover", arguments: { query: "pcb", mode: "all" } });
    assert.notEqual(discovery.isError, true);
    const entries = record(discovery.structuredContent)["value"];
    assert.ok(Array.isArray(entries) && entries.length > 0);
    for (const entry of entries) { assert.equal(record(entry)["availability"], "unavailable"); assert.equal(record(entry)["facadeTool"], null); }
    for (const name of ["easyeda_control_design", "easyeda_control_read", "easyeda_control_runtime", "easyeda_control_native_ui"]) {
      const refused = await client.callTool({ name, arguments: {} }); assert.equal(refused.isError, true);
    }
    const invalid = await client.callTool({ name: "easyeda_control_calculate", arguments: {
      request: { method: "eda.sys_Math.calculateArea", arguments: { polygon: [] } }, expectedFingerprint: {},
    } });
    assert.equal(invalid.isError, true);
    const live = await client.callTool({ name: "easyeda_control_discover", arguments: { source: "live" } });
    assert.equal(live.isError, true);
    await assertNoLiveStartup(options, pid);
    await client.close();
    assert.deepEqual(await readdir(options.controlDirectory), ["machine-profile.json"]);
  });

  void test("missing pinned installation keeps only offline tools available until a new process starts", async (context) => {
    const options = await fixture(context);
    const pcbBytes = await readFile(options.pcbBundle);
    await rm(options.pcbBundle);
    const transport = new StdioClientTransport({ command: options.bootstrapNode,
      args: [options.bundle, "--machine-launch"], cwd: options.root,
      env: options.environment, stderr: "pipe" });
    const client = new Client({ name: "offline-installation-startup-test", version: "1.0.0" }, { capabilities: {} });
    context.after(async () => { await client.close(); });
    await client.connect(transport, { timeout: 15_000, maxTotalTimeout: 15_000 });
    const pid = transport.pid;
    assert.ok(pid !== null);
    assert.equal(await readlink(`/proc/${pid}/exe`), options.pinnedNode);
    const expectedTools = ["easyeda_control_api", "easyeda_control_discover", "easyeda_control_status"];
    const initialTools = await client.listTools();
    assert.deepEqual(initialTools.tools.map((tool) => tool.name).toSorted(), expectedTools);
    const initialStatus = await client.callTool({ name: "easyeda_control_status", arguments: {} });
    assert.notEqual(initialStatus.isError, true, JSON.stringify(initialStatus.content));
    const status = record(initialStatus.structuredContent);
    assert.equal(status["mode"], "offline-only");
    assert.equal(status["liveExecutionAvailable"], false);
    assert.equal(status["restartRequired"], true);
    assert.deepEqual(status["installation"], { ready: false, code: "machine-installation-pcb-bundle-unavailable" });
    const sdk = await api(client, { action: "sdk", query: { reference: "reviewed-installed", namespace: "sys_WebSocket", limit: 1 } });
    assert.equal(sdk["invocationEnabled"], false);
    const validated = await api(client, { action: "validate", query: { family: "design",
      operation: { id: "pose", action: "pcb.component.modify", target: { primitiveId: "part" }, patch: { x: 10 } } } });
    assert.equal(validated["valid"], true);
    assert.equal(validated["executionAuthorized"], false);
    const discovery = await client.callTool({ name: "easyeda_control_discover", arguments: { query: "pcb", mode: "all" } });
    assert.notEqual(discovery.isError, true);
    const entries = record(discovery.structuredContent)["result"];
    assert.ok(Array.isArray(entries) && entries.length > 0);
    for (const entry of entries) {
      assert.equal(record(entry)["facadeTool"], null);
      assert.equal(record(entry)["availability"], "unavailable");
    }
    const live = await client.callTool({ name: "easyeda_control_discover", arguments: { source: "live" } });
    assert.equal(live.isError, true);
    const runtime = await client.callTool({ name: "easyeda_control_runtime", arguments: { request: { action: "launch-contained", confirmLaunch: true } } });
    assert.equal(runtime.isError, true);
    await assertNoLiveStartup(options, pid);
    // Restoring a synthetic dependency cannot promote an already restricted process.
    await writeFile(options.pcbBundle, pcbBytes);
    const restoredTools = await client.listTools();
    assert.deepEqual(restoredTools.tools.map((tool) => tool.name).toSorted(), expectedTools);
    const restoredStatus = await client.callTool({ name: "easyeda_control_status", arguments: {} });
    assert.deepEqual(restoredStatus.structuredContent, initialStatus.structuredContent);
    await assertNoLiveStartup(options, pid);
    await client.close();
    assert.deepEqual(await readdir(options.controlDirectory), ["machine-profile.json"]);
  });

  void test("replaces a different portable bootstrap executable and serves offline MCP queries without node_modules", async (context) => {
    const options = await fixture(context);
    const transport = new StdioClientTransport({ command: options.bootstrapNode,
      args: [options.bundle, "--machine-launch"],
      cwd: options.root, env: options.environment, stderr: "pipe" });
    const client = new Client({ name: "bundled-startup-test", version: "1.0.0" }, { capabilities: {} });
    let diagnostics = "";
    transport.stderr?.on("data", (chunk: unknown) => { diagnostics += String(chunk); });
    context.after(async () => { await client.close(); });
    try {
      await client.connect(transport, { timeout: 15_000, maxTotalTimeout: 15_000 });
      const pid = transport.pid;
      assert.ok(pid !== null);
      assert.equal(await readlink(`/proc/${pid}/exe`), options.pinnedNode);
      const commandLine = await readFile(`/proc/${pid}/cmdline`, "utf8");
      assert.deepEqual(commandLine.split("\0").filter(Boolean),
        [options.pinnedNode, options.bundle]);
      assert.equal(await readlink(`/proc/${pid}/cwd`), options.pluginRoot);
      const tools = await client.listTools();
      assert.equal(tools.tools.length, 48);
      assert.equal(new Set(tools.tools.map((tool) => tool.name)).size, tools.tools.length);
      assert.ok(tools.tools.some((tool) => tool.name === "easyeda_control_api"));
      assert.ok(tools.tools.some((tool) => tool.name === "easyeda_control_sdk_read"));
      assert.ok(tools.tools.some((tool) => tool.name === "easyeda_control_validate_closed_symbol"));
      assert.ok(tools.tools.some((tool) => tool.name === "easyeda_control_symbol_metadata"));
      assert.ok(tools.tools.some((tool) => tool.name === "easyeda_control_project_symbol_metadata"));
      assert.ok(tools.tools.some((tool) => tool.name === "easyeda_control_project_pcb"));
      assert.ok(tools.tools.some((tool) => tool.name === "easyeda_control_project_schematic"));
      assert.ok(tools.tools.some((tool) => tool.name === "easyeda_control_project_board"));
      assert.ok(tools.tools.some((tool) => tool.name === "easyeda_control_disposable_symbol_copy"));
      assert.ok(tools.tools.some((tool) => tool.name === "easyeda_control_disposable_pcb_rename"));
      assert.ok(tools.tools.some((tool) => tool.name === "easyeda_control_disposable_schematic_rename"));
      for (const [reference, methods] of [["reviewed-installed", 749], ["official-latest", 806]] as const) {
        const sdk = await api(client, { action: "sdk", query: { reference, namespace: "sys_WebSocket", limit: 1, detail: true } });
        assert.equal(sdk["invocationEnabled"], false);
        assert.equal(record(sdk["totals"])["methods"], methods);
      }
      for (const [family, total] of [["design", 108], ["library", 68]] as const) {
        const operations = await api(client, { action: "operations", query: { family, limit: 1, includeSchemas: true } });
        assert.equal(operations["total"], total);
        assert.equal(operations["executionAuthorized"], false);
      }
      const coverage = await api(client, { action: "coverage", query: { search: "pcb_PrimitivePad.get", detail: true } });
      assert.equal(record(coverage["summary"])["totalDistinctMethods"], 774);
      assert.equal(coverage["invocationEnabled"], false);
      const sdkReads = await api(client, { action: "sdk-reads", query: { method: "eda.pcb_PrimitivePad.get", includeSchemas: true } });
      assert.equal(sdkReads["matched"], 1);
      assert.equal(sdkReads["executionAuthorized"], false);
      const sdkValidated = await api(client, { action: "sdk-validate", query: { request: {
        method: "eda.sys_Environment.getEditorCurrentVersion", arguments: {},
      } } });
      assert.equal(sdkValidated["valid"], true);
      assert.equal(sdkValidated["nativePreflightPerformed"], false);
      const validated = await api(client, { action: "validate", query: { family: "design",
        operation: { id: "pose", action: "pcb.component.modify", target: { primitiveId: "part" }, patch: { x: 10 } } } });
      assert.equal(validated["valid"], true);
      assert.equal(validated["executionAuthorized"], false);
      const invalidSdkRead = await client.callTool({ name: "easyeda_control_sdk_read", arguments: {
        request: { method: "sys_FileSystem.writeFile", code: "caller supplied code" },
      } }, undefined, { timeout: 10_000, maxTotalTimeout: 10_000 });
      assert.equal(invalidSdkRead.isError, true);
      await assertNoLiveStartup(options, pid);
      assert.equal(diagnostics.includes("ERR_MODULE_NOT_FOUND"), false);
      await client.close();
      assert.deepEqual(await readdir(options.controlDirectory), ["machine-profile.json"]);
    } catch (error) {
      throw new Error(`Self-contained packaged startup failed: ${diagnostics}`, { cause: error });
    }
  });

  void test("missing or unknown launcher arguments refuse before index, control-root or lease initialization", async (context) => {
    const options = await fixture(context);
    const forbiddenControl = join(options.root, "index-must-not-start");
    for (const args of [
      ["--machine-launch", "--profile"],
      ["--machine-launch", "--unknown"],
      ["--machine-launch", "--profile", options.profilePath, "extra"],
      ["--machine-launch-unknown"],
      ["--profile", options.profilePath],
    ]) {
      await assert.rejects(execFileAsync(options.bootstrapNode, [options.bundle, ...args], {
        cwd: options.root, env: { ...options.environment, EASYEDA_CONTROL_DATA_DIR: forbiddenControl },
        timeout: 10_000, maxBuffer: 16_384,
      }), (error: unknown) => {
        const result = record(error);
        assert.equal(result["code"], 1);
        assert.equal(result["stdout"], "");
        assert.deepEqual(JSON.parse(String(result["stderr"])), { ok: false, error: "machine-launcher-arguments-invalid" });
        return true;
      });
      await assert.rejects(lstat(forbiddenControl), { code: "ENOENT" });
      assert.deepEqual(await readdir(options.controlDirectory), ["machine-profile.json"]);
    }
  });

  void test("missing machine profile refuses before normal facade initialization", async (context) => {
    const options = await fixture(context);
    const forbiddenControl = join(options.root, "index-must-not-start");
    await assert.rejects(execFileAsync(options.bootstrapNode, [options.bundle, "--machine-launch"], {
      cwd: options.root, env: { ...options.environment, EASYEDA_CONTROL_DATA_DIR: forbiddenControl,
        EASYEDA_MACHINE_PROFILE: join(options.controlDirectory, "missing-profile.json") },
      timeout: 10_000, maxBuffer: 16_384,
    }), (error: unknown) => {
      const result = record(error);
      assert.equal(result["code"], 1);
      assert.equal(result["stdout"], "");
      assert.deepEqual(JSON.parse(String(result["stderr"])), { ok: false, error: "machine-launch-failed" });
      return true;
    });
    await assert.rejects(lstat(forbiddenControl), { code: "ENOENT" });
    assert.deepEqual(await readdir(options.controlDirectory), ["machine-profile.json"]);
  });
});
