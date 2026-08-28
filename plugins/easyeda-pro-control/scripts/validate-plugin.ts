#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";

import { CONTROL_VERSION } from "../server/src/core.ts";
import {
  assertContainedRegularFile,
  readContainedRegularFile,
} from "./bundled-runtime-license.ts";
import {
  createPrivateTemporaryDirectory,
  removeEmptyPrivateTemporaryDirectory,
} from "./private-temporary-directory.ts";
import type { PrivateTemporaryDirectory } from "./private-temporary-directory.ts";
import { validateReleaseVersionParity } from "./release-version.ts";

interface CheckResult {
  readonly detail?: string;
  readonly name: string;
  readonly ok: boolean;
}

type ToolSummary = Awaited<ReturnType<Client["listTools"]>>["tools"][number];

const TOOL_NAMES = [
  "easyeda_control_status",
  "easyeda_control_discover",
  "easyeda_control_context",
  "easyeda_control_exact_read",
  "easyeda_control_read",
  "easyeda_control_read_batch",
  "easyeda_control_execute",
  "easyeda_control_capture",
  "easyeda_control_export",
  "easyeda_control_plan",
  "easyeda_control_apply",
  "easyeda_control_verify",
  "easyeda_control_rollback",
  "easyeda_control_save_reopen",
  "easyeda_control_checkpoint",
  "easyeda_control_recover_incomplete",
  "easyeda_control_evidence_recover",
  "easyeda_control_evidence_verify",
  "easyeda_control_artifact_read",
] as const;
const AUTO_APPROVED_TOOLS = new Set([
  "easyeda_control_status",
  "easyeda_control_discover",
  "easyeda_control_context",
  "easyeda_control_evidence_verify",
  "easyeda_control_artifact_read",
]);
const AGENT_DEFAULT_PROMPT =
  "Use $easyeda-pro-control to validate the EasyEDA bridge, collect bounded read evidence, or inspect local recovery artifacts without bypassing compatibility gates.";
const MANIFEST_DEFAULT_PROMPTS = [
  "Validate the EasyEDA bridge without bypassing compatibility gates.",
  "Collect bounded public read evidence for connected candidate review.",
  "Inspect local recovery journals and managed artifacts safely.",
] as const;
const OUTPUT_SCHEMA_ANCHORS = {
  easyeda_control_status: ["facade", "upstream"],
  easyeda_control_discover: ["value"],
  easyeda_control_context: ["project", "document"],
  easyeda_control_exact_read: ["summary", "evidence"],
  easyeda_control_read: ["summary", "evidence"],
  easyeda_control_read_batch: ["summary", "evidence"],
  easyeda_control_execute: ["ok", "error"],
  easyeda_control_capture: ["captured", "images"],
  easyeda_control_export: ["summary", "evidence"],
  easyeda_control_plan: ["operationId", "state"],
  easyeda_control_apply: ["operationId", "state"],
  easyeda_control_verify: ["operationId", "state"],
  easyeda_control_rollback: ["operationId", "state"],
  easyeda_control_save_reopen: ["operationId", "state"],
  easyeda_control_checkpoint: ["checkpoint", "receiptPath"],
  easyeda_control_recover_incomplete: ["value", "operationId"],
  easyeda_control_evidence_recover: ["receiptHashOk", "resultHashOk"],
  easyeda_control_evidence_verify: ["receiptHashOk", "resultHashOk"],
  easyeda_control_artifact_read: ["path", "bytesRead", "text"],
} as const satisfies Record<(typeof TOOL_NAMES)[number], readonly string[]>;
const stringSchema = z.string();
const environmentSchema = z.record(stringSchema, stringSchema);
const approvalModeSchema = z.enum(["approve", "prompt"]);
const toolPolicySchema = z.strictObject({
  approval_mode: approvalModeSchema,
});
const pluginManifestSchema = z.looseObject({
  interface: z.object({
    defaultPrompt: z.array(stringSchema),
  }),
  mcpServers: stringSchema,
  name: stringSchema,
  version: stringSchema,
});
const easyedaControlSchema = z.looseObject({
  default_tools_approval_mode: approvalModeSchema,
  env: environmentSchema.optional(),
  tools: z.record(stringSchema, toolPolicySchema),
  type: stringSchema,
});
const mcpConfigurationSchema = z.object({
  mcpServers: z.object({
    easyeda_pro_control: easyedaControlSchema,
  }),
});
const privateBridgeMenuSchema = z.looseObject({
  id: z.literal("EasyEDAProControlAuthenticatedBridge"),
  title: z.literal("Authenticated Control Bridge"),
});
const bridgeExtensionManifestSchema = z.looseObject({
  bugs: z.literal(
    "https://github.com/jan-guenter/easyeda-pro-agent-plugin/issues",
  ),
  displayName: z.literal("EasyEDA Pro Control Authenticated Bridge"),
  headerMenus: z.object({
    home: z.tuple([privateBridgeMenuSchema]),
    pcb: z.tuple([privateBridgeMenuSchema]),
    sch: z.tuple([privateBridgeMenuSchema]),
  }),
  homepage: z.literal(
    "https://github.com/jan-guenter/easyeda-pro-agent-plugin#readme",
  ),
  name: z.literal("easyeda-pro-control-authenticated-bridge"),
  publisher: z.literal("JanGuenter"),
  repository: z.object({
    type: z.literal("git"),
    url: z.literal("https://github.com/jan-guenter/easyeda-pro-agent-plugin"),
  }),
  uuid: z.literal("7e06d286b1ac846ef7eab9c7f2a9ee4"),
  version: stringSchema,
});
const bundledRuntimeInventorySchema = z.looseObject({
  dependencies: z.array(
    z.looseObject({
      license: stringSchema,
      name: stringSchema,
      noticePath: stringSchema,
      version: stringSchema,
    }),
  ),
});

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
const pluginRoot = resolve(import.meta.dirname, "..");
const manifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
const mcpPath = join(pluginRoot, ".mcp.json");
const checks: CheckResult[] = [];
const check = (name: string, ok: unknown, detail?: string): void => {
  checks.push({
    name,
    ok: Boolean(ok),
    ...(detail !== undefined && detail.length > 0 ? { detail } : {}),
  });
};
const required = [
  ".codex-plugin/plugin.json",
  ".mcp.json",
  ".oxlintrc.bridge.json",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
  "easyeda-bridge-extension/extension.json",
  "easyeda-bridge-extension/package.json",
  "easyeda-bridge-extension/tsconfig.json",
  "easyeda-bridge-extension/tsconfig.test.json",
  "easyeda-bridge-extension/vitest.config.ts",
  "reviewed-compatibility.json",
  "licenses/bundled-runtime.json",
  "scripts/bundled-runtime-license.ts",
  "scripts/release-version.ts",
  "server/dist/server.mjs",
  "server/dist/upstream-supervisor.mjs",
  "server/tests/bundled-runtime-license.test.ts",
  "server/tests/release-version.test.ts",
  "skills/easyeda-pro-control/SKILL.md",
  "skills/easyeda-pro-control/agents/openai.yaml",
];
for (const path of required) {
  check(`file:${path}`, existsSync(join(pluginRoot, path)));
}

const manifestText = await readFile(manifestPath, "utf8");
const manifest = pluginManifestSchema.parse(JSON.parse(manifestText));
const mcpText = await readFile(mcpPath, "utf8");
const mcp = mcpConfigurationSchema.parse(JSON.parse(mcpText));
const mcpServer = mcp.mcpServers.easyeda_pro_control;
const skill = await readFile(
  join(pluginRoot, "skills", "easyeda-pro-control", "SKILL.md"),
  "utf8",
);
const licensesRoot = join(pluginRoot, "licenses");
const pluginThirdPartyNoticeBytes = await readContainedRegularFile(
  pluginRoot,
  join(pluginRoot, "THIRD_PARTY_NOTICES.md"),
  "The plugin third-party notice",
);
const pluginThirdPartyNotices = pluginThirdPartyNoticeBytes.toString("utf8");
const bundledRuntimeInventoryBytes = await readContainedRegularFile(
  licensesRoot,
  join(licensesRoot, "bundled-runtime.json"),
  "The bundled runtime inventory",
);
const bundledRuntimeInventoryCandidate: unknown = JSON.parse(
  bundledRuntimeInventoryBytes.toString("utf8"),
);
const bundledRuntimeInventory = bundledRuntimeInventorySchema.parse(
  bundledRuntimeInventoryCandidate,
);
const agentMetadata = await readFile(
  join(
    pluginRoot,
    "skills",
    "easyeda-pro-control",
    "agents",
    "openai.yaml",
  ),
  "utf8",
);
const packageManifest: unknown = JSON.parse(
  await readFile(join(pluginRoot, "package.json"), "utf8"),
);
const packageLockManifest: unknown = JSON.parse(
  await readFile(join(pluginRoot, "package-lock.json"), "utf8"),
);
const reviewedCompatibilityManifest: unknown = JSON.parse(
  await readFile(join(pluginRoot, "reviewed-compatibility.json"), "utf8"),
);
const nvmSource = await readFile(join(pluginRoot, ".nvmrc"), "utf8");
const nvmVersion = nvmSource.trim();
const bridgePackageManifest: unknown = JSON.parse(
  await readFile(
    join(pluginRoot, "easyeda-bridge-extension", "package.json"),
    "utf8",
  ),
);
const bridgeExtensionManifestPath = join(
  pluginRoot,
  "easyeda-bridge-extension",
  "extension.json",
);
const bridgeExtensionManifestSource = await readFile(
  bridgeExtensionManifestPath,
  "utf8",
);
const bridgeExtensionManifest = bridgeExtensionManifestSchema.parse(
  JSON.parse(bridgeExtensionManifestSource),
);
const bridgeLintConfigSource = await readFile(
  join(pluginRoot, ".oxlintrc.bridge.json"),
  "utf8",
);
const bridgeTsconfigSource = await readFile(
  join(pluginRoot, "easyeda-bridge-extension", "tsconfig.json"),
  "utf8",
);
const bridgeTestTsconfigSource = await readFile(
  join(pluginRoot, "easyeda-bridge-extension", "tsconfig.test.json"),
  "utf8",
);
const packageScripts =
  isRecord(packageManifest) && isRecord(packageManifest["scripts"])
    ? packageManifest["scripts"]
    : {};
const packageEngines =
  isRecord(packageManifest) && isRecord(packageManifest["engines"])
    ? packageManifest["engines"]
    : {};
const bridgeScripts =
  isRecord(bridgePackageManifest) && isRecord(bridgePackageManifest["scripts"])
    ? bridgePackageManifest["scripts"]
    : {};
const bridgeDevDependencies =
  isRecord(bridgePackageManifest) &&
  isRecord(bridgePackageManifest["devDependencies"])
    ? bridgePackageManifest["devDependencies"]
    : {};
const packageLockPackages =
  isRecord(packageLockManifest) && isRecord(packageLockManifest["packages"])
    ? packageLockManifest["packages"]
    : {};
const packageLockRoot = isRecord(packageLockPackages[""])
  ? packageLockPackages[""]
  : {};
const reviewedFacadeImplementation =
  isRecord(reviewedCompatibilityManifest) &&
  isRecord(reviewedCompatibilityManifest["facadeImplementation"])
    ? reviewedCompatibilityManifest["facadeImplementation"]
    : {};
const reviewedSourceTree = isRecord(
  reviewedFacadeImplementation["source-tree"],
)
  ? reviewedFacadeImplementation["source-tree"]
  : {};
const reviewedBundle = isRecord(reviewedFacadeImplementation["bundle"])
  ? reviewedFacadeImplementation["bundle"]
  : {};
const releaseVersionParity = validateReleaseVersionParity({
  bridgeExtensionManifest: bridgeExtensionManifest.version,
  bridgePackageManifest: isRecord(bridgePackageManifest)
    ? bridgePackageManifest["version"]
    : undefined,
  controlVersion: CONTROL_VERSION,
  packageLockRoot: packageLockRoot["version"],
  packageLockTopLevel: isRecord(packageLockManifest)
    ? packageLockManifest["version"]
    : undefined,
  packageManifest: isRecord(packageManifest)
    ? packageManifest["version"]
    : undefined,
  pluginManifest: manifest.version,
  reviewedBundle: reviewedBundle["version"],
  reviewedSourceTree: reviewedSourceTree["version"],
});
const bundledRuntimeCoordinates = bundledRuntimeInventory.dependencies.map(
  (dependency) => `${dependency.name}@${dependency.version}`,
);
const bundledRuntimeNoticeFileChecks = await Promise.all(
  bundledRuntimeInventory.dependencies.map(async (dependency) => {
    try {
      await assertContainedRegularFile(
        licensesRoot,
        resolve(pluginRoot, dependency.noticePath),
        `The bundled runtime notice for ${dependency.name}@${dependency.version}`,
      );
      return true;
    } catch {
      return false;
    }
  }),
);
const bundledRuntimeNoticeFilesSafe =
  bundledRuntimeNoticeFileChecks.every(Boolean);
check(
  "node-exact-24.18.0",
  process.versions.node === "24.18.0",
  process.version,
);
check(
  "runtime-platform-linux-x64",
  process.platform === "linux" && process.arch === "x64",
  `${process.platform}/${process.arch}`,
);
check(
  "package-runtime-platform-exact",
  nvmVersion === "24.18.0" &&
    packageEngines["node"] === "24.18.0" &&
    isRecord(packageManifest) &&
    JSON.stringify(packageManifest["os"]) === JSON.stringify(["linux"]) &&
    JSON.stringify(packageManifest["cpu"]) === JSON.stringify(["x64"]),
);
check("manifest-name", manifest.name === "easyeda-pro-control");
check(
  "release-version-parity",
  releaseVersionParity.ok,
  releaseVersionParity.detail,
);
check(
  "bundled-runtime-notices-complete",
  bundledRuntimeInventory.dependencies.length > 0 &&
    new Set(bundledRuntimeCoordinates).size ===
      bundledRuntimeCoordinates.length &&
    bundledRuntimeNoticeFilesSafe &&
    bundledRuntimeInventory.dependencies.every(
      (dependency) =>
        pluginThirdPartyNotices.includes(
          `- \`${dependency.name}\` ${dependency.version} — ${dependency.license} (\`${dependency.noticePath}\`)`,
        ),
    ),
);
check("manifest-mcp", manifest.mcpServers === "./.mcp.json");
check(
  "manifest-default-prompts",
  JSON.stringify(manifest.interface.defaultPrompt) ===
    JSON.stringify(MANIFEST_DEFAULT_PROMPTS),
);
check("mcp-server", mcpServer.type === "stdio");
check(
  "raw-env-absent",
  !Object.hasOwn(
    mcpServer.env ?? {},
    "EASYEDA_CONTROL_ALLOW_UNRESTRICTED_EXECUTE",
  ),
);
const configuredDataDirectory = mcpServer.env?.["EASYEDA_CONTROL_DATA_DIR"];
check(
  "bridge-token-path",
  configuredDataDirectory !== undefined &&
    mcpServer.env?.["EASYEDA_BRIDGE_TOKEN_FILE"] ===
      join(configuredDataDirectory, "bridge-token"),
);
check("approval-default-prompt", mcpServer.default_tools_approval_mode === "prompt");
check(
  "bridge-type-aware-lint-script",
  packageScripts["bridge:lint"] ===
    "oxlint --config .oxlintrc.bridge.json --type-aware --deny-warnings easyeda-bridge-extension/src easyeda-bridge-extension/tests easyeda-bridge-extension/scripts easyeda-bridge-extension/vitest.config.ts" &&
    typeof packageScripts["verify"] === "string" &&
    packageScripts["verify"].includes("npm run bridge:lint") &&
    bridgeLintConfigSource.includes('"extends": ["./.oxlintrc.json"]') &&
    !bridgeLintConfigSource.includes('"easyeda-bridge-extension/src/**/*.ts"],\n      "rules": {\n        "typescript/no-unsafe'),
);
check(
  "bridge-strict-typescript-coverage",
  packageScripts["bridge:typecheck"] ===
    "tsc --noEmit -p easyeda-bridge-extension/tsconfig.json && tsc --noEmit -p easyeda-bridge-extension/tsconfig.test.json" &&
    bridgeScripts["typecheck"] ===
      "tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.test.json" &&
    bridgeTsconfigSource.includes('"target": "ES2020"') &&
    bridgeTsconfigSource.includes('"noUncheckedIndexedAccess": true') &&
    bridgeTsconfigSource.includes('"exactOptionalPropertyTypes": true') &&
    bridgeTsconfigSource.includes('"noUncheckedSideEffectImports": true') &&
    bridgeTestTsconfigSource.includes('"tests/**/*.ts"') &&
    bridgeTestTsconfigSource.includes('"vitest.config.ts"'),
);
check(
  "bridge-single-pinned-toolchain",
  isRecord(bridgePackageManifest) &&
    bridgePackageManifest["name"] ===
      "easyeda-pro-control-authenticated-bridge" &&
    bridgePackageManifest["private"] === true &&
    bridgeDevDependencies["esbuild"] === "0.28.2" &&
    bridgeDevDependencies["typescript"] === "7.0.2" &&
    bridgeDevDependencies["vitest"] === "4.1.9" &&
    !Object.hasOwn(bridgeDevDependencies, "archiver") &&
    !existsSync(join(pluginRoot, "easyeda-bridge-extension", "package-lock.json")),
);
check(
  "bridge-private-extension-identity",
  bridgeExtensionManifest.name ===
    "easyeda-pro-control-authenticated-bridge" &&
    bridgeExtensionManifest.headerMenus.home.length === 1 &&
    bridgeExtensionManifest.headerMenus.sch.length === 1 &&
    bridgeExtensionManifest.headerMenus.pcb.length === 1,
);
const configuredPolicyNames = Object.keys(mcpServer.tools).toSorted();
const expectedToolNames = [...TOOL_NAMES].toSorted();
check(
  "approval-exact-tool-mapping",
  JSON.stringify(configuredPolicyNames) === JSON.stringify(expectedToolNames),
  JSON.stringify(configuredPolicyNames),
);
check(
  "approval-exact-modes",
  TOOL_NAMES.every(
    (name) =>
      mcpServer.tools[name]?.approval_mode ===
      (AUTO_APPROVED_TOOLS.has(name) ? "approve" : "prompt"),
  ),
);
check(
  "skill-frontmatter-name",
  /^---\nname: easyeda-pro-control\n/mu.test(skill),
);
check(
  "skill-writer-disabled",
  /writer is experimental and runtime-disabled/iu.test(skill),
);
check(
  "agent-default-prompt",
  agentMetadata.includes(`default_prompt: ${JSON.stringify(AGENT_DEFAULT_PROMPT)}`),
);
const scaffoldPlaceholderPrefix = ["[", "TODO", ":"].join("");
check(
  "no-placeholders",
  !`${JSON.stringify(manifest)}\n${skill}`.includes(scaffoldPlaceholderPrefix),
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function meaningfulOutputSchema(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  if (
    isRecord(value["properties"]) &&
    Object.keys(value["properties"]).length > 0
  ) {
    return true;
  }
  for (const keyword of ["anyOf", "oneOf"] as const) {
    const alternatives = value[keyword];
    if (
      Array.isArray(alternatives) &&
      alternatives.length > 0 &&
      alternatives.every((item) => meaningfulOutputSchema(item))
    ) {
      return true;
    }
  }
  return false;
}

function outputSchemaAnchors(name: string): readonly string[] | undefined {
  for (const [toolName, anchors] of Object.entries(OUTPUT_SCHEMA_ANCHORS)) {
    if (name === toolName) {
      return anchors;
    }
  }
  return undefined;
}

function resultText(result: unknown): string {
  if (!isRecord(result) || !Array.isArray(result["content"])) {
    return "";
  }
  const text: string[] = [];
  for (const item of result["content"]) {
    if (
      isRecord(item) &&
      item["type"] === "text" &&
      typeof item["text"] === "string"
    ) {
      text.push(item["text"]);
    }
  }
  return text.join("\n");
}

let toolCatalog: ToolSummary[] | { readonly error: string } = [];
let dataDirectory: PrivateTemporaryDirectory | undefined;
try {
  dataDirectory = await createPrivateTemporaryDirectory(
    "/tmp/easyeda-control-validation-",
    "The EasyEDA validation smoke directory",
  );
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(pluginRoot, "server", "dist", "server.mjs")],
    cwd: pluginRoot,
    env: {
      ...process.env,
      EASYEDA_CONTROL_DATA_DIR: dataDirectory.path,
      EASYEDA_UPSTREAM_ARGS_JSON: "[]",
      EASYEDA_UPSTREAM_COMMAND: join(dataDirectory.path, "must-not-execute"),
      EASYEDA_UPSTREAM_CWD: dataDirectory.path,
    },
    stderr: "pipe",
  });
  const client = new Client(
    { name: "easyeda-pro-control-validation", version: "0.3.0" },
    { capabilities: {} },
  );
  await client.connect(transport);
  const listed = await client.listTools();
  toolCatalog = listed.tools;
  const listedNames = toolCatalog.map((tool) => tool.name).toSorted();
  check(
    "tool-exact-catalog",
    JSON.stringify(listedNames) === JSON.stringify(expectedToolNames),
    JSON.stringify(listedNames),
  );
  check(
    "tool-output-schemas-meaningful",
    toolCatalog.every((tool) => meaningfulOutputSchema(tool.outputSchema)),
  );
  check(
    "tool-output-schemas-specific",
    toolCatalog.every((tool) => {
      const anchors = outputSchemaAnchors(tool.name);
      const schema = tool.outputSchema;
      const properties =
        isRecord(schema) && isRecord(schema.properties)
          ? schema.properties
          : undefined;
      return (
        anchors !== undefined &&
        properties !== undefined &&
        anchors.every((anchor) => Object.hasOwn(properties, anchor))
      );
    }),
  );
  const raw = toolCatalog.find(
    (tool) => tool.name === "easyeda_control_execute",
  );
  const plan = toolCatalog.find((tool) => tool.name === "easyeda_control_plan");
  check(
    "raw-catalog-disabled",
    /disabled/iu.test(`${raw?.title} ${raw?.description}`),
  );
  check(
    "writer-catalog-disabled",
    /disabled/iu.test(`${plan?.title} ${plan?.description}`),
  );

  const rawResult = await client.callTool({
    name: "easyeda_control_execute",
    arguments: {},
  });
  check(
    "raw-runtime-disabled",
    rawResult.isError === true &&
      /structurally disabled|no environment opt-in/iu.test(resultText(rawResult)),
    resultText(rawResult),
  );
  const writerResult = await client.callTool({
    name: "easyeda_control_apply",
    arguments: {
      confirmApply: true,
      operationId: "disabled00",
      planHash: "0".repeat(64),
    },
  });
  check(
    "writer-runtime-disabled",
    writerResult.isError === true &&
      /runtime-disabled|disabled in this build/iu.test(resultText(writerResult)),
    resultText(writerResult),
  );

  await client.close();
  await transport.close().catch(() => {
    // Closing an already closed validation transport needs no recovery action.
  });
} catch (error) {
  toolCatalog = { error: errorMessage(error) };
  check("mcp-catalog-smoke", false, toolCatalog.error);
} finally {
  if (dataDirectory !== undefined) {
    await removeEmptyPrivateTemporaryDirectory(
      dataDirectory,
      "The EasyEDA validation smoke directory",
      ["operations"],
    ).catch((error: unknown) => {
      check("mcp-catalog-smoke-cleanup", false, errorMessage(error));
    });
  }
}

const result = {
  ok: checks.every((item) => item.ok),
  pluginRoot,
  node: process.version,
  toolNames: Array.isArray(toolCatalog)
    ? toolCatalog.map((tool) => tool.name).toSorted()
    : toolCatalog,
  checks,
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!result.ok) {
  process.exitCode = 1;
}
