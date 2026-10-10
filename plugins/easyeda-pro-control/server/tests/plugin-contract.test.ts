import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { FACADE_TOOL_NAMES, hasPortableMcpLaunch } from "../../scripts/plugin-contract.ts";
import { mcpConfigurationSchema } from "../../scripts/repository-validation.ts";

void test("portable MCP launch requires the fixed launcher without machine-specific environment", () => {
  const portable = { command: "node", args: ["scripts/launch-machine.ts"], cwd: ".", env: {} };
  assert.equal(hasPortableMcpLaunch(portable), true);
  for (const candidate of [{ ...portable, command: "/private/node" }, { ...portable, args: ["server/dist/server.mjs"] },
    { ...portable, args: ["scripts/launch-machine.ts", "--profile", "/caller/profile"] }, { ...portable, env: { EASYEDA_BRIDGE_TOKEN_FILE: "/private/key" } },
    { ...portable, cwd: "/workstation" }, { ...portable, env: undefined }]) {
    assert.equal(hasPortableMcpLaunch(candidate), false);
  }
});

void test("all 25 facade tools include offline discovery, typed control and legacy refusal endpoints", () => {
  assert.equal(FACADE_TOOL_NAMES.length, 25);
  assert.equal(new Set(FACADE_TOOL_NAMES).size, 25);
  for (const name of ["easyeda_control_api", "easyeda_control_design", "easyeda_control_library", "easyeda_control_runtime", "easyeda_control_native_ui",
    "easyeda_control_execute", "easyeda_control_apply", "easyeda_control_check"]) {
    assert.ok(FACADE_TOOL_NAMES.some((entry) => entry === name));
  }
});

void test("repository metadata parsing retains the portable launch fields for validation", async () => {
  const source = await readFile(new URL("../../.mcp.json", import.meta.url), "utf8");
  const parsed = mcpConfigurationSchema.parse(JSON.parse(source));
  assert.equal(hasPortableMcpLaunch(parsed.mcpServers.easyeda_pro_control), true);
  assert.deepEqual(Object.keys(parsed.mcpServers.easyeda_pro_control.tools).toSorted(), [...FACADE_TOOL_NAMES].toSorted());
  for (const tool of ["easyeda_control_design", "easyeda_control_library", "easyeda_control_runtime", "easyeda_control_native_ui", "easyeda_control_check"]) {
    assert.equal(parsed.mcpServers.easyeda_pro_control.tools[tool]?.approval_mode, "prompt");
  }
});
