import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function failureMessage(result: unknown): string {
  assert.ok(isRecord(result));
  assert.equal(result["isError"], true);
  const structuredContent = result["structuredContent"];
  assert.ok(isRecord(structuredContent));
  const error = structuredContent["error"];
  assert.ok(isRecord(error));
  assert.equal(typeof error["message"], "string");
  return String(error["message"]);
}

const pluginRoot = resolve(import.meta.dirname, "../..");
const facadeEntrypoint = join(pluginRoot, "server", "src", "index.ts");

void test("rejects the disabled writer before malformed upstream configuration", async () => {
  const fixtureRoot = await mkdtemp(
    join(tmpdir(), "easyeda-control-disabled-writer-"),
  );
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [facadeEntrypoint],
    cwd: pluginRoot,
    env: {
      ...process.env,
      EASYEDA_CONTROL_DATA_DIR: join(fixtureRoot, "control"),
      EASYEDA_UPSTREAM_ARGS_JSON: "[]",
      EASYEDA_UPSTREAM_COMMAND: join(fixtureRoot, "must-not-execute"),
      EASYEDA_UPSTREAM_CWD: fixtureRoot,
    },
    stderr: "pipe",
  });
  const client = new Client(
    { name: "easyeda-disabled-writer-test", version: "0.1.0" },
    { capabilities: {} },
  );
  try {
    await client.connect(transport);
    const response = await client.callTool({
      name: "easyeda_control_apply",
      arguments: {
        confirmApply: true,
        operationId: "disabled00",
        planHash: "0".repeat(64),
      },
    });
    assert.match(
      failureMessage(response),
      /private PCB component writer is runtime-disabled/u,
    );
  } finally {
    await client.close().catch(() => null);
    await transport.close().catch(() => null);
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});
