import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { FACADE_TOOL_NAMES, hasPortableMcpLaunch } from "../../scripts/plugin-contract.ts";
import { mcpConfigurationSchema } from "../../scripts/repository-validation.ts";

void test("portable MCP launch requires the exact bundled launcher tuple without machine-specific environment", () => {
  const portable = { command: "node", args: ["server/dist/server.mjs", "--machine-launch"], cwd: ".", env: {} };
  assert.equal(hasPortableMcpLaunch(portable), true);
  for (const candidate of [{ ...portable, command: "/private/node" }, { ...portable, args: [] },
    { ...portable, args: ["server/dist/server.mjs"] }, { ...portable, args: ["scripts/launch-machine.ts"] },
    { ...portable, args: ["scripts/launch-machine.ts", "--machine-launch"] },
    { ...portable, args: ["--machine-launch", "server/dist/server.mjs"] },
    { ...portable, args: ["server/dist/server.mjs", "--machine-launch", "--profile", "/caller/profile"] },
    { ...portable, args: ["server/dist/server.mjs", "--machine-launch", "--machine-launch"] },
    { ...portable, args: ["server/dist/server.mjs", "--other-mode"] },
    { ...portable, args: ["/private/server.mjs", "--machine-launch"] },
    { ...portable, args: ["server/dist/server.mjs", true] },
    { ...portable, env: { EASYEDA_BRIDGE_TOKEN_FILE: "/private/key" } },
    { ...portable, cwd: "/workstation" }, { ...portable, env: undefined }]) {
    assert.equal(hasPortableMcpLaunch(candidate), false);
  }
});

void test("all 26 facade tools include offline discovery, typed control and legacy refusal endpoints", () => {
  assert.equal(FACADE_TOOL_NAMES.length, 26);
  assert.equal(new Set(FACADE_TOOL_NAMES).size, 26);
  for (const name of ["easyeda_control_api", "easyeda_control_sdk_read", "easyeda_control_design", "easyeda_control_library", "easyeda_control_runtime", "easyeda_control_native_ui",
    "easyeda_control_execute", "easyeda_control_apply", "easyeda_control_check"]) {
    assert.ok(FACADE_TOOL_NAMES.some((entry) => entry === name));
  }
});

void test("repository metadata parsing retains the portable launch fields for validation", async () => {
  const source = await readFile(new URL("../../.mcp.json", import.meta.url), "utf8");
  const parsed = mcpConfigurationSchema.parse(JSON.parse(source));
  const server = parsed.mcpServers.easyeda_pro_control;
  assert.equal(hasPortableMcpLaunch(server), true);
  assert.deepEqual(server.args, ["server/dist/server.mjs", "--machine-launch"]);
  for (const args of [["scripts/launch-machine.ts"], ["server/dist/server.mjs"],
    ["--machine-launch", "server/dist/server.mjs"], ["server/dist/server.mjs", "--machine-launch", "--profile", "/caller/profile"]]) {
    assert.equal(mcpConfigurationSchema.safeParse({ mcpServers: { easyeda_pro_control: { ...server, args } } }).success, false);
  }
  assert.deepEqual(Object.keys(parsed.mcpServers.easyeda_pro_control.tools).toSorted(), [...FACADE_TOOL_NAMES].toSorted());
  for (const tool of ["easyeda_control_sdk_read", "easyeda_control_design", "easyeda_control_library", "easyeda_control_runtime", "easyeda_control_native_ui", "easyeda_control_check"]) {
    assert.equal(parsed.mcpServers.easyeda_pro_control.tools[tool]?.approval_mode, "prompt");
  }
});
