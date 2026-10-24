import assert from "node:assert/strict";
import { lstat, readFile, readdir, readlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { openControlRootCapability } from "../src/control-root.ts";
import { FacadeLeaseContentionError, acquireFacadeLease } from "../src/lease.ts";
import { acquireFacadeLeaseOrDiagnose } from "../src/ownership-conflict-startup.ts";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

void test("actual index completes MCP handshake in diagnostic-only mode while another facade owns its isolated root", { timeout: 30_000 }, async context => {
  const root = await createTestTemporaryDirectory("easyeda-conflict-startup-");
  const owner = await acquireFacadeLease(root);
  const before = await readFile(owner.path);
  context.after(async () => { await owner.release(); });
  const transport = new StdioClientTransport({ command: process.execPath, args: [resolve("server/src/index.ts")],
    stderr: "pipe", env: { EASYEDA_CONTROL_DATA_DIR: root, EASYEDA_UPSTREAM_ROOT: join(root, "absent-upstream"),
      EASYEDA_ASSETS_ROOT: join(root, "absent-assets") } });
  const client = new Client({ name: "ownership-conflict-regression", version: "1.0.0" }, { capabilities: {} });
  context.after(async () => { await client.close(); });
  const errors: string[] = [];
  transport.stderr?.on("data", (chunk: Buffer) => { errors.push(chunk.toString()); });
  await client.connect(transport, { timeout: 15_000 });
  const catalog = await client.listTools(); assert.deepEqual(catalog.tools.map(tool => tool.name), ["easyeda_control_status"]);
  const first = await client.callTool({ name: "easyeda_control_status", arguments: {} });
  assert.equal(first.isError, true); const snapshot = first.structuredContent; assert.ok(isRecord(snapshot));
  assert.equal(snapshot["mode"], "ownership-conflict");
  assert.equal(snapshot["observation"], "startup-snapshot"); assert.equal(snapshot["observedOwnerPid"], process.pid);
  assert.equal(snapshot["leaseAcquired"], false); assert.equal(snapshot["automaticRetry"], false);
  assert.equal(snapshot["liveControlAvailable"], false);
  assert.equal(JSON.stringify(snapshot).includes(root), false); assert.equal(JSON.stringify(snapshot).includes(owner.token), false);
  const denied = await client.callTool({ name: "easyeda_control_launch", arguments: { request: { action: "launch" } } });
  assert.equal(denied.isError, true);
  const extra = await client.callTool({ name: "easyeda_control_status", arguments: { retry: true } });
  assert.equal(extra.isError, true); assert.equal(extra.structuredContent, undefined);
  assert.deepEqual(await readFile(owner.path), before);
  const pid = transport.pid; assert.ok(pid !== null);
  const children = await readFile(`/proc/${String(pid)}/task/${String(pid)}/children`, "utf8"); assert.equal(children.trim(), "");
  const descriptors = await readdir(`/proc/${String(pid)}/fd`);
  for (const fd of descriptors) {
    if (Number(fd) > 2) {
      const target: string = await readlink(`/proc/${String(pid)}/fd/${fd}`, { encoding: "utf8" });
      assert.equal(target.startsWith("socket:"), false);
    }
  }
  await owner.release();
  const afterCatalog = await client.listTools(); assert.deepEqual(afterCatalog.tools.map(tool => tool.name), ["easyeda_control_status"]);
  const afterRelease = await client.callTool({ name: "easyeda_control_status", arguments: {} });
  assert.deepEqual(afterRelease.structuredContent, snapshot);
  await assert.rejects(lstat(owner.path), { code: "ENOENT" });
  await client.close(); assert.equal(errors.join(""), "");
  await assert.rejects(lstat(`/proc/${String(pid)}`), { code: "ENOENT" });
});

void test("only exact live lease contention is typed; normal ownership and corrupt lease refusal keep their contracts", async () => {
  const root = await createTestTemporaryDirectory("easyeda-conflict-normal-");
  const owner = await acquireFacadeLeaseOrDiagnose(await openControlRootCapability(root));
  assert.ok(owner !== null);
  try {
    await assert.rejects(acquireFacadeLease(root), (error: unknown) => {
      assert.ok(error instanceof FacadeLeaseContentionError); assert.equal(error.observedOwnerPid, process.pid); return true;
    });
  } finally { await owner.release(); }
  await writeFile(join(root, "facade.lock"), "{}", { flag: "wx", mode: 0o600 });
  await assert.rejects(acquireFacadeLeaseOrDiagnose(await openControlRootCapability(root)), (error: unknown) => {
    assert.ok(error instanceof Error); assert.equal(error instanceof FacadeLeaseContentionError, false); return true;
  });
});

void test("legacy live PID without process birth identity remains a hard refusal", { timeout: 5000 }, async () => {
  const root = await createTestTemporaryDirectory("easyeda-conflict-legacy-");
  const path = join(root, "facade.lock");
  const retained = JSON.stringify({ schema: "easyeda-pro-control.facade-lease.v1", token: "retained-legacy-owner",
    pid: process.pid, startedAt: new Date().toISOString() });
  await writeFile(path, retained, { flag: "wx", mode: 0o600 });
  await assert.rejects(acquireFacadeLeaseOrDiagnose(await openControlRootCapability(root)), (error: unknown) => {
    assert.ok(error instanceof Error); assert.equal(error instanceof FacadeLeaseContentionError, false);
    assert.match(error.message, /Another EasyEDA control facade owns/u); return true;
  });
  assert.equal(await readFile(path, "utf8"), retained);
});
