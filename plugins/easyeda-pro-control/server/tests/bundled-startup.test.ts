import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, readlink, realpath, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
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

async function fixture(context: TestContext): Promise<BundledFixture> {
  // Use a filesystem outside the checkout, independent of an ambient TMPDIR.
  const root = await mkdtemp("/tmp/easyeda-bundled-startup-");
  context.after(async () => { await rm(root, { recursive: true, force: true }); });
  const pluginRoot = join(root, "plugin");
  const distRoot = join(pluginRoot, "server", "dist");
  const binRoot = join(pluginRoot, "server", "bin");
  const upstreamRoot = join(root, "metadata", "upstream");
  const assetsRoot = join(root, "metadata", "assets");
  const controlDirectory = join(root, "control");
  for (const path of [distRoot, binRoot, join(upstreamRoot, "dist"),
    join(assetsRoot, "pro-pcb", "3.2.fixture", "js"), join(assetsRoot, "pro-api", "0.2.fixture"),
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
  for (const path of [join(assetsRoot, "pro-pcb", "3.2.fixture", "js", "pcb.js"),
    ...["api.js", "api-types.js", "api-types.d.ts"].map((name) => join(assetsRoot, "pro-api", "0.2.fixture", name)),
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
  return { root, pluginRoot, bundle, bootstrapNode, pinnedNode, controlDirectory, profilePath, upstreamMarker,
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
      assert.equal(tools.tools.length, 26);
      assert.equal(new Set(tools.tools.map((tool) => tool.name)).size, 26);
      assert.ok(tools.tools.some((tool) => tool.name === "easyeda_control_api"));
      assert.ok(tools.tools.some((tool) => tool.name === "easyeda_control_sdk_read"));
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
