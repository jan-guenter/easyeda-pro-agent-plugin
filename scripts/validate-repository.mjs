#!/usr/bin/env node
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import { promisify } from "node:util";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { CONTROL_VERSION } from "../plugins/easyeda-pro-control/server/src/core.ts";
import { validateReleaseVersionParity } from "../plugins/easyeda-pro-control/scripts/release-version.ts";

const execFileAsync = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const marketplacePath = join(root, ".agents", "plugins", "marketplace.json");
const pluginRoot = join(root, "plugins", "easyeda-pro-control");
const authenticatedBridgeDistPath =
  "plugins/easyeda-pro-control/easyeda-bridge-extension/dist";
const authenticatedBridgeDistPrefix = `${authenticatedBridgeDistPath}/`;
const VALIDATION_CANDIDATE_BRIDGE_BUILD_ID = "ded07x99dcxb504";
const REVIEWED_CONNECTED_BRIDGE_BUILD_ID = "d18b6xd531xe6ca";
const checks = [];
const MAX_REPOSITORY_FILE_BYTES = 8 * 1024 * 1024;
const EXPECTED_TOOL_NAMES = [
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
].sort();
const AUTO_APPROVED_TOOLS = new Set([
  "easyeda_control_status",
  "easyeda_control_discover",
  "easyeda_control_context",
  "easyeda_control_evidence_verify",
  "easyeda_control_artifact_read",
]);

function check(name, condition, detail) {
  checks.push({
    name,
    ok: Boolean(condition),
    ...(detail === undefined || detail.length === 0 ? {} : { detail }),
  });
}

async function exists(path) {
  try {
    return (await lstat(path)).isFile();
  } catch {
    return false;
  }
}

function safeRepositoryPath(path) {
  return (
    path.length > 0 &&
    !path.includes("\0") &&
    !path.startsWith("/") &&
    path.split("/").every((segment) => segment !== ".." && segment !== "")
  );
}

const marketplace = JSON.parse(await readFile(marketplacePath, "utf8"));
const entry = marketplace.plugins?.find(
  (plugin) => plugin.name === "easyeda-pro-control",
);
check("marketplace-name", marketplace.name === "easyeda-pro-agent");
check(
  "marketplace-display-name",
  typeof marketplace.interface?.displayName === "string",
);
check("single-plugin-entry", marketplace.plugins?.length === 1);
check("plugin-source-kind", entry?.source?.source === "local");
check(
  "plugin-source-path",
  entry?.source?.path === "./plugins/easyeda-pro-control",
);
check("plugin-install-policy", entry?.policy?.installation === "AVAILABLE");
check("plugin-auth-policy", entry?.policy?.authentication === "ON_INSTALL");
check(
  "plugin-category",
  typeof entry?.category === "string" && entry.category.length > 0,
);

const manifestPath = join(pluginRoot, ".codex-plugin", "plugin.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
check("manifest-name", manifest.name === "easyeda-pro-control");
check(
  "manifest-version",
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(
    manifest.version,
  ),
);
check("manifest-skill", manifest.skills === "./skills/");
check("manifest-mcp", manifest.mcpServers === "./.mcp.json");
check(
  "manifest-repository",
  manifest.repository ===
    "https://github.com/jan-guenter/easyeda-pro-agent-plugin",
);
check(
  "manifest-capabilities",
  JSON.stringify(manifest.interface?.capabilities) ===
    JSON.stringify(["EasyEDA", "MCP", "Read", "Evidence", "Recovery"]),
);
check(
  "manifest-disabled-writer",
  /writer is experimental and runtime-disabled/i.test(
    String(manifest.interface?.longDescription),
  ),
);
check(
  "manifest-validation-required-truth",
  String(manifest.description).includes("Safety-gated") &&
    String(manifest.interface?.longDescription).includes(
      "currently validation-required",
    ) &&
    String(manifest.interface?.longDescription).includes(
      "exact and private operations fail-closed",
    ),
);

const runtimeNotices = [
  "acorn-MIT.txt",
  "ajv-MIT.txt",
  "ajv-formats-MIT.txt",
  "fast-deep-equal-MIT.txt",
  "fast-uri-BSD-3-Clause.txt",
  "json-schema-traverse-MIT.txt",
  "model-context-protocol-sdk-MIT.txt",
  "ws-MIT.txt",
  "zod-MIT.txt",
  "zod-to-json-schema-ISC.txt",
].map((name) => `licenses/${name}`);
const required = [
  ".codex-plugin/plugin.json",
  ".mcp.json",
  ".nvmrc",
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  ".oxlintrc.json",
  ".oxlintrc.bridge.json",
  "reviewed-compatibility.json",
  "licenses/bundled-runtime.json",
  ...runtimeNotices,
  "licenses/esbuild-MIT.txt",
  "licenses/typescript-Apache-2.0.txt",
  "licenses/typescript-NOTICE.txt",
  "licenses/types-node-MIT.txt",
  "licenses/types-ws-MIT.txt",
  "licenses/oxlint-MIT.txt",
  "licenses/oxlint-tsgolint-MIT.txt",
  "licenses/vitest-MIT.txt",
  "easyeda-bridge-extension/LICENSE",
  "easyeda-bridge-extension/NOTICE",
  "easyeda-bridge-extension/extension.json",
  "easyeda-bridge-extension/package.json",
  "easyeda-bridge-extension/tsconfig.json",
  "easyeda-bridge-extension/tsconfig.test.json",
  "easyeda-bridge-extension/vitest.config.ts",
  "scripts/bridge-token.ts",
  "scripts/build-authenticated-bridge.ts",
  "scripts/bundled-runtime-license.ts",
  "scripts/provision-bridge-token.ts",
  "scripts/release-version.ts",
  "scripts/reviewed-bridge-source.ts",
  "server/dist/server.mjs",
  "server/dist/upstream-supervisor.mjs",
  "server/src/index.ts",
  "server/src/upstream-environment.ts",
  "server/src/upstream-module-execution.ts",
  "server/src/upstream-supervisor.ts",
  "server/src/upstream-trust.ts",
  "server/tests/bundled-runtime-license.test.ts",
  "server/tests/release-version.test.ts",
  "skills/easyeda-pro-control/SKILL.md",
  "skills/easyeda-pro-control/agents/openai.yaml",
];
for (const path of required) {
  check(`required:${path}`, await exists(join(pluginRoot, path)));
}

const mcp = JSON.parse(await readFile(join(pluginRoot, ".mcp.json"), "utf8"));
const mcpServer = mcp.mcpServers?.easyeda_pro_control;
check("mcp-stdio", mcpServer?.type === "stdio");
check(
  "raw-env-absent",
  !Object.hasOwn(
    mcpServer?.env ?? {},
    "EASYEDA_CONTROL_ALLOW_UNRESTRICTED_EXECUTE",
  ),
);
check(
  "mcp-default-prompt",
  mcpServer?.default_tools_approval_mode === "prompt",
);
check(
  "mcp-bridge-token-path",
  typeof mcpServer?.env?.EASYEDA_CONTROL_DATA_DIR === "string" &&
    mcpServer?.env?.EASYEDA_BRIDGE_TOKEN_FILE ===
      join(mcpServer.env.EASYEDA_CONTROL_DATA_DIR, "bridge-token"),
);
const policyNames = Object.keys(mcpServer?.tools ?? {}).sort();
check(
  "mcp-exact-policy-tools",
  JSON.stringify(policyNames) === JSON.stringify(EXPECTED_TOOL_NAMES),
  JSON.stringify(policyNames),
);
check(
  "mcp-exact-policy-modes",
  EXPECTED_TOOL_NAMES.every(
    (name) =>
      mcpServer.tools[name]?.approval_mode ===
      (AUTO_APPROVED_TOOLS.has(name) ? "approve" : "prompt"),
  ),
);

const indexSource = await readFile(
  join(pluginRoot, "server", "src", "index.ts"),
  "utf8",
);
const readmeSource = await readFile(join(root, "README.md"), "utf8");
const securitySource = await readFile(join(root, "SECURITY.md"), "utf8");
const contributingSource = await readFile(
  join(root, "CONTRIBUTING.md"),
  "utf8",
);
const engineeringRecordSource = await readFile(
  join(root, "AGENTS.md"),
  "utf8",
);
const rootLicenseSource = await readFile(join(root, "LICENSE"), "utf8");
const pluginLicenseSource = await readFile(
  join(pluginRoot, "LICENSE"),
  "utf8",
);
const pluginThirdPartyNoticeSource = await readFile(
  join(pluginRoot, "THIRD_PARTY_NOTICES.md"),
  "utf8",
);
const thirdPartyNoticeSource = await readFile(
  join(root, "THIRD_PARTY_NOTICES.md"),
  "utf8",
);
const bundledRuntimeInventory = JSON.parse(
  await readFile(
    join(pluginRoot, "licenses", "bundled-runtime.json"),
    "utf8",
  ),
);
const ciSource = await readFile(
  join(root, ".github", "workflows", "ci.yml"),
  "utf8",
);
const skillSource = await readFile(
  join(pluginRoot, "skills", "easyeda-pro-control", "SKILL.md"),
  "utf8",
);
const compatibilityReferenceSource = await readFile(
  join(
    pluginRoot,
    "skills",
    "easyeda-pro-control",
    "references",
    "compatibility.md",
  ),
  "utf8",
);
const reviewedCompatibilityManifest = JSON.parse(
  await readFile(join(pluginRoot, "reviewed-compatibility.json"), "utf8"),
);
const agentSource = await readFile(
  join(
    pluginRoot,
    "skills",
    "easyeda-pro-control",
    "agents",
    "openai.yaml",
  ),
  "utf8",
);
const doctorSource = await readFile(
  join(pluginRoot, "scripts", "doctor.ts"),
  "utf8",
);
const softCoreLimitSource = await readFile(
  join(pluginRoot, "server", "src", "soft-core-limit.ts"),
  "utf8",
);
const bridgeTokenSource = await readFile(
  join(pluginRoot, "scripts", "bridge-token.ts"),
  "utf8",
);
const reviewedBridgeSource = await readFile(
  join(pluginRoot, "scripts", "reviewed-bridge-source.ts"),
  "utf8",
);
const authenticatedBridgeBuildSource = await readFile(
  join(pluginRoot, "scripts", "build-authenticated-bridge.ts"),
  "utf8",
);
const authenticatedBridgeTestSource = await readFile(
  join(pluginRoot, "server", "tests", "bridge-auth.test.ts"),
  "utf8",
);
const vendoredBridgeBuildSource = await readFile(
  join(
    pluginRoot,
    "easyeda-bridge-extension",
    "scripts",
    "build.mjs",
  ),
  "utf8",
);
const vendoredBridgePackageSource = await readFile(
  join(
    pluginRoot,
    "easyeda-bridge-extension",
    "scripts",
    "package.mjs",
  ),
  "utf8",
);
const vendoredBridgeWatchSource = await readFile(
  join(
    pluginRoot,
    "easyeda-bridge-extension",
    "scripts",
    "dev-watch.mjs",
  ),
  "utf8",
);
const vendoredBridgePackageManifest = JSON.parse(
  await readFile(
    join(pluginRoot, "easyeda-bridge-extension", "package.json"),
    "utf8",
  ),
);
const vendoredBridgeExtensionManifest = JSON.parse(
  await readFile(
    join(pluginRoot, "easyeda-bridge-extension", "extension.json"),
    "utf8",
  ),
);
const pluginPackageManifest = JSON.parse(
  await readFile(join(pluginRoot, "package.json"), "utf8"),
);
const pluginNvmVersion = (
  await readFile(join(pluginRoot, ".nvmrc"), "utf8")
).trim();
const pluginPackageLockManifest = JSON.parse(
  await readFile(join(pluginRoot, "package-lock.json"), "utf8"),
);
const bridgeLintConfigSource = await readFile(
  join(pluginRoot, ".oxlintrc.bridge.json"),
  "utf8",
);
const bridgeLintConfig = JSON.parse(
  bridgeLintConfigSource
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("//"))
    .join("\n"),
);
const bridgeTsconfig = JSON.parse(
  (await readFile(
    join(pluginRoot, "easyeda-bridge-extension", "tsconfig.json"),
    "utf8",
  ))
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("//"))
    .join("\n"),
);
const bridgeTestTsconfig = JSON.parse(
  (await readFile(
    join(pluginRoot, "easyeda-bridge-extension", "tsconfig.test.json"),
    "utf8",
  ))
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("//"))
    .join("\n"),
);
const vendoredBridgeLicense = await readFile(
  join(pluginRoot, "easyeda-bridge-extension", "LICENSE"),
  "utf8",
);
const vendoredBridgeNotice = await readFile(
  join(pluginRoot, "easyeda-bridge-extension", "NOTICE"),
  "utf8",
);
const releaseVersionParity = validateReleaseVersionParity(
  {
    bridgeExtensionManifest: vendoredBridgeExtensionManifest.version,
    bridgePackageManifest: vendoredBridgePackageManifest.version,
    controlVersion: CONTROL_VERSION,
    packageLockRoot: pluginPackageLockManifest.packages?.[""]?.version,
    packageLockTopLevel: pluginPackageLockManifest.version,
    packageManifest: pluginPackageManifest.version,
    pluginManifest: manifest.version,
    reviewedBundle:
      reviewedCompatibilityManifest.facadeImplementation?.bundle?.version,
    reviewedSourceTree:
      reviewedCompatibilityManifest.facadeImplementation?.["source-tree"]
        ?.version,
  },
  { requirePluginCachebuster: true },
);
check(
  "release-version-parity",
  releaseVersionParity.ok,
  releaseVersionParity.detail,
);
check("plugin-license-self-contained", pluginLicenseSource === rootLicenseSource);
check(
  "vendored-bridge-license-exact",
  createHash("sha256").update(vendoredBridgeLicense).digest("hex") ===
    "c17c5ff89cf8a42efa11d0a513f9aba5cefcd107abb7810c68b7e7e5a2eeecdf",
);
check(
  "vendored-bridge-notice-packaged",
  vendoredBridgeNotice.includes("Copyright (c) 2026 Jan Günter") &&
    vendoredBridgeNotice.includes(
      "964c05082f1c7c9e8b98f56e967e36bfc3f26128",
    ) &&
    authenticatedBridgeBuildSource.includes('path === "NOTICE"'),
);
const vendoredBridgeMenus = vendoredBridgeExtensionManifest.headerMenus ?? {};
check(
  "vendored-bridge-private-extension-identity",
  vendoredBridgeExtensionManifest.name ===
    "easyeda-pro-control-authenticated-bridge" &&
    vendoredBridgeExtensionManifest.uuid ===
      "7e06d286b1ac846ef7eab9c7f2a9ee4" &&
    vendoredBridgeExtensionManifest.displayName ===
      "EasyEDA Pro Control Authenticated Bridge" &&
    vendoredBridgeExtensionManifest.publisher === "JanGuenter" &&
    vendoredBridgeExtensionManifest.repository?.type === "git" &&
    vendoredBridgeExtensionManifest.repository?.url ===
      "https://github.com/jan-guenter/easyeda-pro-agent-plugin" &&
    vendoredBridgeExtensionManifest.homepage ===
      "https://github.com/jan-guenter/easyeda-pro-agent-plugin#readme" &&
    vendoredBridgeExtensionManifest.bugs ===
      "https://github.com/jan-guenter/easyeda-pro-agent-plugin/issues" &&
    ["home", "sch", "pcb"].every(
      (surface) =>
        vendoredBridgeMenus[surface]?.length === 1 &&
        vendoredBridgeMenus[surface][0]?.id ===
          "EasyEDAProControlAuthenticatedBridge" &&
        vendoredBridgeMenus[surface][0]?.title ===
          "Authenticated Control Bridge",
    ),
);
const bridgeUnsafeRuleNames = [
  "typescript/no-explicit-any",
  "typescript/no-unsafe-argument",
  "typescript/no-unsafe-assignment",
  "typescript/no-unsafe-call",
  "typescript/no-unsafe-member-access",
  "typescript/no-unsafe-return",
  "typescript/no-unsafe-type-assertion",
  "typescript/strict-boolean-expressions",
];
const bridgeUnsafeExemptFiles = new Set(
  (bridgeLintConfig.overrides ?? [])
    .filter((override) =>
      bridgeUnsafeRuleNames.some((rule) => override.rules?.[rule] === "off"),
    )
    .flatMap((override) => override.files ?? []),
);
check(
  "vendored-bridge-strict-type-aware-lint",
  pluginPackageManifest.scripts?.["bridge:lint"] ===
    "oxlint --config .oxlintrc.bridge.json --type-aware --deny-warnings easyeda-bridge-extension/src easyeda-bridge-extension/tests easyeda-bridge-extension/scripts easyeda-bridge-extension/vitest.config.ts" &&
    pluginPackageManifest.scripts?.verify?.includes("npm run bridge:lint") &&
    JSON.stringify(bridgeLintConfig.extends) ===
      JSON.stringify(["./.oxlintrc.json"]) &&
    JSON.stringify(bridgeLintConfig.ignorePatterns) ===
      JSON.stringify([
        "easyeda-bridge-extension/dist/**",
        "easyeda-bridge-extension/node_modules/**",
      ]) &&
    ![
      "easyeda-bridge-extension/src/index.ts",
      "easyeda-bridge-extension/src/mutual-auth.ts",
      "easyeda-bridge-extension/src/remote-client.ts",
      "easyeda-bridge-extension/src/binary-result.ts",
      "easyeda-bridge-extension/src/binary-result-policy.ts",
      "easyeda-bridge-extension/src/**/*.ts",
      "easyeda-bridge-extension/scripts/**/*.mjs",
      "easyeda-bridge-extension/tests/**/*.ts",
    ].some((path) => bridgeUnsafeExemptFiles.has(path)),
  JSON.stringify([...bridgeUnsafeExemptFiles].toSorted()),
);
const bridgeStrictFlags = [
  "strict",
  "allowUnreachableCode",
  "allowUnusedLabels",
  "exactOptionalPropertyTypes",
  "forceConsistentCasingInFileNames",
  "isolatedModules",
  "noFallthroughCasesInSwitch",
  "noImplicitOverride",
  "noImplicitReturns",
  "noUncheckedIndexedAccess",
  "noUncheckedSideEffectImports",
  "noUnusedLocals",
  "noUnusedParameters",
  "noImplicitAny",
  "skipLibCheck",
  "useUnknownInCatchVariables",
  "verbatimModuleSyntax",
  "erasableSyntaxOnly",
];
check(
  "vendored-bridge-strict-typescript-coverage",
  pluginPackageManifest.scripts?.["bridge:typecheck"] ===
    "tsc --noEmit -p easyeda-bridge-extension/tsconfig.json && tsc --noEmit -p easyeda-bridge-extension/tsconfig.test.json" &&
    vendoredBridgePackageManifest.scripts?.typecheck ===
      "tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.test.json" &&
    bridgeTsconfig.compilerOptions?.target === "ES2020" &&
    JSON.stringify(bridgeTsconfig.include) === JSON.stringify(["src/**/*.ts"]) &&
    bridgeTestTsconfig.extends === "./tsconfig.json" &&
    JSON.stringify(bridgeTestTsconfig.include) ===
      JSON.stringify(["src/**/*.ts", "tests/**/*.ts", "vitest.config.ts"]) &&
    bridgeStrictFlags.every((flag) =>
      Object.hasOwn(bridgeTsconfig.compilerOptions ?? {}, flag),
    ),
);
check(
  "vendored-bridge-single-pinned-toolchain",
  vendoredBridgePackageManifest.name ===
    "easyeda-pro-control-authenticated-bridge" &&
    vendoredBridgePackageManifest.private === true &&
    vendoredBridgePackageManifest.devDependencies?.esbuild === "0.28.2" &&
    vendoredBridgePackageManifest.devDependencies?.typescript === "7.0.2" &&
    vendoredBridgePackageManifest.devDependencies?.vitest === "4.1.9" &&
    vendoredBridgePackageManifest.devDependencies?.esbuild ===
      pluginPackageManifest.devDependencies?.esbuild &&
    vendoredBridgePackageManifest.devDependencies?.typescript ===
      pluginPackageManifest.devDependencies?.typescript &&
    vendoredBridgePackageManifest.devDependencies?.vitest ===
      pluginPackageManifest.devDependencies?.vitest &&
    !Object.hasOwn(vendoredBridgePackageManifest.devDependencies ?? {}, "archiver") &&
    !(await exists(
      join(pluginRoot, "easyeda-bridge-extension", "package-lock.json"),
    )),
);
const bundledRuntimeDependencies = bundledRuntimeInventory.dependencies ?? [];
const bundledRuntimeNoticePathsComplete = (
  await Promise.all(
    bundledRuntimeDependencies.map(
      (dependency) =>
        typeof dependency.noticePath === "string" &&
        safeRepositoryPath(dependency.noticePath) &&
        dependency.noticePath.startsWith("licenses/") &&
        exists(join(pluginRoot, dependency.noticePath)),
    ),
  )
).every(Boolean);
check(
  "bundled-runtime-notice-inventory-unique",
  bundledRuntimeDependencies.length > 0 &&
    bundledRuntimeNoticePathsComplete &&
    new Set(
      bundledRuntimeDependencies.map(
        (dependency) => `${dependency.name}@${dependency.version}`,
      ),
    ).size === bundledRuntimeDependencies.length,
);
check(
  "plugin-third-party-notice-self-contained",
  bundledRuntimeDependencies.every(
    (dependency) =>
      pluginThirdPartyNoticeSource.includes(
        ["`", dependency.name, "` ", dependency.version].join(""),
      ) &&
      pluginThirdPartyNoticeSource.includes(`\`${dependency.noticePath}\``),
  ) &&
    !pluginThirdPartyNoticeSource.includes("plugins/easyeda-pro-control/") &&
    pluginThirdPartyNoticeSource.includes(
      "964c05082f1c7c9e8b98f56e967e36bfc3f26128",
    ),
);
check(
  "third-party-notices-cover-bundled-runtime",
  bundledRuntimeDependencies.every(
    (dependency) => {
      const licenseLabel =
        dependency.license === "BSD-3-Clause"
          ? "BSD 3-Clause"
          : dependency.license;
      return (
        thirdPartyNoticeSource.includes(
          ["[", "`", dependency.name, "` ", dependency.version, "]"].join(
            "",
          ),
        ) &&
        thirdPartyNoticeSource.includes(
          `[${licenseLabel} License](plugins/easyeda-pro-control/${dependency.noticePath})`,
        )
      );
    },
  ),
);
check(
  "third-party-notices-cover-bridge-derivative-and-bubblewrap",
  thirdPartyNoticeSource.includes("adds 5 files, modifies\n57 files, and removes 5 files") &&
    thirdPartyNoticeSource.includes("copyright 2026 oaslananka") &&
    thirdPartyNoticeSource.includes("copyright 2026 Jan Günter") &&
    thirdPartyNoticeSource.includes("LGPL-2.0-or-later") &&
    thirdPartyNoticeSource.includes(
      "1b80120ef26a28e065e67f89bfef873f13bdd317",
    ) &&
    thirdPartyNoticeSource.includes(
      "neither bundled in\nthe plugin archive nor uploaded",
    ),
);
check(
  "vendored-bridge-reviewed-source-closure",
  reviewedBridgeSource.includes(
    '"964c05082f1c7c9e8b98f56e967e36bfc3f26128"',
  ) &&
    reviewedBridgeSource.includes(
      '"cc8893215e736f9efca78e4216033469008ea8e9"',
    ) &&
    reviewedBridgeSource.includes(
      '"ce52ca1bf5b2d3d214454790a24516ae5182f1867851c2786c0269bbc7892680"',
    ) &&
    reviewedBridgeSource.includes("captureVendoredSourceClosure") &&
    reviewedBridgeSource.includes('"src/mutual-auth.ts"') &&
    reviewedBridgeSource.includes('"extension.json"') &&
    reviewedBridgeSource.includes('"scripts/build.mjs"') &&
    reviewedBridgeSource.includes("fixed loopback port 49621") &&
    reviewedBridgeSource.includes("authenticated-runtime marker") &&
    reviewedBridgeSource.includes("authenticated index-bundle ID") &&
    reviewedBridgeSource.includes("authentication-key SHA-256 epoch") &&
    reviewedBridgeSource.includes("cleanup fails closed before replacement") &&
    reviewedBridgeSource.includes("never transmitted"),
);
check(
  "authenticated-bridge-builds-reviewed-private-snapshot",
  authenticatedBridgeBuildSource.includes(
    "captureReviewedVendoredSourceSnapshot",
  ) &&
    authenticatedBridgeBuildSource.includes("sealedVendoredMemoryPlugin") &&
    authenticatedBridgeBuildSource.includes(
      "assertSealedVendoredMemoryUnchanged",
    ) &&
    authenticatedBridgeBuildSource.includes("captureReviewedBuildSnapshot") &&
    authenticatedBridgeBuildSource.includes('absWorkingDir: "/tmp"') &&
    authenticatedBridgeBuildSource.includes("tsconfigRaw") &&
    reviewedBridgeSource.includes("readStableStagedFile") &&
    reviewedBridgeSource.includes("fsConstants.O_NOFOLLOW") &&
    reviewedBridgeSource.includes("vendoredSourceClosureFromFiles") &&
    reviewedBridgeSource.includes("SEALED_VENDORED_MEMORY_NAMESPACE") &&
    authenticatedBridgeBuildSource.includes(
      'entryPoints: ["src/dispatcher-entry.ts"]',
    ) &&
    authenticatedBridgeBuildSource.includes(
      'entryPoints: ["src/index.ts"]',
    ) &&
    authenticatedBridgeBuildSource.includes("sourceSnapshot.files") &&
    authenticatedBridgeBuildSource.includes("isPackagedReviewedSource") &&
    authenticatedBridgeBuildSource.match(/write: false/gu)?.length === 2 &&
    authenticatedBridgeBuildSource.includes(
      "dispatcherBuild.outputFiles",
    ) &&
    authenticatedBridgeBuildSource.includes("indexBuild.outputFiles") &&
    authenticatedBridgeBuildSource.includes("builtFromPrivateSnapshot: true") &&
    authenticatedBridgeBuildSource.includes("privateSnapshotSealed: true") &&
    authenticatedBridgeBuildSource.includes("postConsumptionVerified: true") &&
    authenticatedBridgeBuildSource.includes(
      "__MCP_AUTHENTICATED_INDEX_BUILD_ID__",
    ) &&
    authenticatedBridgeBuildSource.includes(
      "__MCP_AUTHENTICATION_KEY_SHA256__",
    ) &&
    authenticatedBridgeBuildSource.includes("authenticatedIndexBuildId") &&
    authenticatedBridgeBuildSource.includes("indexSha256") &&
    !authenticatedBridgeBuildSource.includes("collectFiles(") &&
    !authenticatedBridgeBuildSource.includes("captureVendoredSourceClosure"),
);
check(
  "authenticated-bridge-output-is-private-and-outside-repository",
  authenticatedBridgeBuildSource.includes(
    "defaultAuthenticatedBridgeOutputPath",
  ) &&
    authenticatedBridgeBuildSource.includes(
      "openPrivateOutputDirectory",
    ) &&
    authenticatedBridgeBuildSource.includes(
      "immutableGenerationOutputPath",
    ) &&
    authenticatedBridgeBuildSource.includes(
      "publishImmutablePrivateOutput",
    ) &&
    authenticatedBridgeBuildSource.includes(
      "atomicallyCommitPrivateReceipt",
    ) &&
    authenticatedBridgeBuildSource.includes("acquirePrivatePairLock") &&
    authenticatedBridgeBuildSource.includes("linuxProcessStartTime") &&
    authenticatedBridgeBuildSource.includes("fsConstants.O_NOFOLLOW") &&
    authenticatedBridgeBuildSource.includes("fsConstants.O_EXCL") &&
    authenticatedBridgeBuildSource.includes("handle.chmod(0o600)") &&
    authenticatedBridgeBuildSource.includes("isWithin(pluginRoot, outputPath)") &&
    authenticatedBridgeBuildSource.includes(
      "isWithin(controlDataDirectory, outputPath)",
    ) &&
    authenticatedBridgeBuildSource.includes(
      "reserved bridge-build subtree",
    ) &&
    authenticatedBridgeBuildSource.includes(
      'outputPath.endsWith(".eext")',
    ) &&
    authenticatedBridgeBuildSource.match(/assertTokenArtifactSeparation\(/gu)
      ?.length === 3 &&
    authenticatedBridgeBuildSource.includes(
      "canonicalPathWhenPresent",
    ) &&
    authenticatedBridgeBuildSource.includes(
      "must be written outside the plugin repository",
    ) &&
    authenticatedBridgeBuildSource.includes(
      "A legacy fixed-path bridge archive still exists",
    ) &&
    authenticatedBridgeTestSource.includes(
      "EASYEDA_TEST_CRASH_BEFORE_BRIDGE_COMMIT",
    ) &&
    authenticatedBridgeTestSource.includes(
      "serializes concurrent builds without mixing token generations",
    ) &&
    !authenticatedBridgeBuildSource.includes('join(pluginRoot, "local-build"'),
);
const vendoredStandaloneBuildSources = [
  vendoredBridgeBuildSource,
  vendoredBridgePackageSource,
  vendoredBridgeWatchSource,
];
check(
  "vendored-bridge-standalone-build-entrypoints-fail-closed",
  vendoredStandaloneBuildSources.every(
    (source) =>
      source.startsWith("throw new Error(\n") &&
      source.endsWith(");\n") &&
      source.split("\n").length === 4 &&
      source.includes("Standalone vendored bridge") &&
      source.includes("npm run bridge:build") &&
      source.includes(
        "only supported path for credential-bearing .eext output",
      ) &&
      !source.includes("MCP_BRIDGE_AUTH_KEY") &&
      !source.includes("MCP_BUILD_OUT_DIR") &&
      !source.includes("writeFile") &&
      !source.includes("execFile") &&
      !source.includes("from 'esbuild'"),
  ) &&
    vendoredBridgePackageManifest.scripts?.build ===
      "node scripts/build.mjs" &&
    vendoredBridgePackageManifest.scripts?.["build:dev"] ===
      "node scripts/build.mjs" &&
    vendoredBridgePackageManifest.scripts?.["build:watch"] ===
      "node scripts/build.mjs",
);
check(
  "bridge-token-provisioning-preserves-existing-parent-mode",
  bridgeTokenSource.includes("openPrivateDirectoryDescriptor") &&
    bridgeTokenSource.includes("isFinalSegment") &&
    bridgeTokenSource.includes("if (!isFinalSegment)") &&
    bridgeTokenSource.includes("Only its final directory may be created.") &&
    bridgeTokenSource.includes("if (!finalCreated)") &&
    bridgeTokenSource.includes("Its mode was not changed.") &&
    bridgeTokenSource.includes("await currentHandle.chmod(0o700)") &&
    authenticatedBridgeTestSource.includes(
      "never creates missing non-final directory segments",
    ),
);
check(
  "readme-authenticated-bridge-bootstrap",
  readmeSource.includes(
    "npm ci\nnpm ls --all\nnpm audit signatures\nnpm audit --audit-level=high\nnpm run bridge:provision\nnpm run bridge:build",
  ) &&
    readmeSource.includes("From\na trusted checkout of this repository") &&
    readmeSource.includes("Advanced") &&
    readmeSource.includes("Extension Manager") &&
    readmeSource.includes("Import the exact generation path reported as `outputPath`") &&
    readmeSource.includes("authoritative current-generation pointer") &&
    readmeSource.includes("unauthenticated stock bridge"),
);
check(
  "skill-authenticated-bridge-required",
  skillSource.includes(
    "requires the locally built, private mutually authenticated bridge",
  ) &&
    skillSource.includes("never transmits the HMAC key") &&
    skillSource.includes("generated `.eext` as credentials") &&
    skillSource.includes("unauthenticated stock bridge"),
);
check(
  "doctor-does-not-trust-path-sqlite",
  !doctorSource.includes('spawnSync("sqlite3"') &&
    !doctorSource.includes('spawn("sqlite3"') &&
    doctorSource.includes('"/usr/bin/sqlite3"') &&
    doctorSource.includes('"/usr/local/bin/sqlite3"'),
);
check(
  "doctor-authenticated-companion-is-offline-verifiable-not-install-proof",
  doctorSource.includes("captureVendoredSourceClosure") &&
    doctorSource.includes("builtFromPrivateSnapshot") &&
    doctorSource.includes("same-directory, hash-named immutable generation") &&
    doctorSource.includes("companionBridgeReceiptPath") &&
    doctorSource.includes("importVerified: false") &&
    doctorSource.includes(
      "never that EasyEDA imported or loaded it",
    ),
);
const bridgeCandidateTruthSources = [
  readmeSource,
  securitySource,
  engineeringRecordSource,
  skillSource,
  compatibilityReferenceSource,
];
check(
  "authenticated-bridge-validation-candidate-truth",
  reviewedCompatibilityManifest.connectedRuntime?.dispatcher?.buildId ===
    REVIEWED_CONNECTED_BRIDGE_BUILD_ID &&
    bridgeCandidateTruthSources.every(
      (source) =>
        source.includes(VALIDATION_CANDIDATE_BRIDGE_BUILD_ID) &&
        source.includes(REVIEWED_CONNECTED_BRIDGE_BUILD_ID) &&
        source.includes("validation-required") &&
        /not\s+a\s+production-live build/u.test(source) &&
        source.includes("narrowly reviewed public generic reads") &&
        source.includes("exact") &&
        source.includes("private"),
    ) &&
    readmeSource.includes(
      "exact and private operations remain unavailable",
    ) &&
    skillSource.includes(
      "Do not call `easyeda_control_exact_read` while the candidate remains `validation-required`",
    ) &&
    doctorSource.includes(
      '"authenticated-bridge-connected-build-id"',
    ) &&
    doctorSource.includes('"validation-required"') &&
    doctorSource.includes("reviewedConnectedBuildId") &&
    doctorSource.includes("productionLiveVerified: false") &&
    doctorSource.includes(
      "differs from reviewed connected dispatcher build",
    ),
  `reviewed=${String(reviewedCompatibilityManifest.connectedRuntime?.dispatcher?.buildId)}`,
);
check(
  "ci-pinned-environment",
  ciSource.includes("runs-on: ubuntu-24.04") &&
    ciSource.includes("node-version: 24.18.0") &&
    ciSource.includes("persist-credentials: false") &&
    ciSource.includes("ulimit -c 0") &&
    ciSource.includes('test "$(ulimit -c)" = "0"') &&
    !/uses:\s+[^\s#]+@(?![a-f0-9]{40}\b)/u.test(ciSource),
);
check(
  "exact-node-runtime-contract",
  pluginNvmVersion === "24.18.0" &&
    pluginPackageManifest.engines?.node === "24.18.0" &&
    JSON.stringify(pluginPackageManifest.os) === JSON.stringify(["linux"]) &&
    JSON.stringify(pluginPackageManifest.cpu) === JSON.stringify(["x64"]) &&
    pluginPackageLockManifest.packages?.[""]?.engines?.node === "24.18.0" &&
    JSON.stringify(pluginPackageLockManifest.packages?.[""]?.os) ===
      JSON.stringify(["linux"]) &&
    JSON.stringify(pluginPackageLockManifest.packages?.[""]?.cpu) ===
      JSON.stringify(["x64"]) &&
    doctorSource.includes('"node-exact-24.18.0"') &&
    doctorSource.includes('process.versions.node === "24.18.0"') &&
    doctorSource.includes('"platform-linux-x64"') &&
    doctorSource.includes('process.platform === "linux"') &&
    doctorSource.includes('process.arch === "x64"') &&
    doctorSource.includes("assertSelfSoftCoreLimitZero") &&
    doctorSource.includes("await assertSelfSoftCoreLimitZero()") &&
    softCoreLimitSource.includes(
      'const SELF_LIMITS_PATH = "/proc/self/limits"',
    ) &&
    softCoreLimitSource.includes("assertZeroSoftCoreLimit") &&
    softCoreLimitSource.includes("return readFile(SELF_LIMITS_PATH, \"utf8\")") &&
    readmeSource.includes("Node.js exactly `24.18.0`") &&
    readmeSource.includes("soft `RLIMIT_CORE` of exactly `0`") &&
    securitySource.includes("Node exactly `24.18.0`") &&
    securitySource.includes("soft `RLIMIT_CORE` of zero") &&
    contributingSource.includes("Node exactly 24.18.0") &&
    engineeringRecordSource.includes("Node exactly `24.18.0`"),
);
check(
  "exact-npm-toolchain-contract",
  pluginPackageManifest.packageManager === "npm@11.16.0" &&
    ciSource.includes('test "$(npm --version)" = "11.16.0"') &&
    readmeSource.includes('test "$(npm --version)" = "11.16.0"') &&
    contributingSource.includes("npm exactly 11.16.0") &&
    engineeringRecordSource.includes("npm exactly `11.16.0`"),
);
check(
  "ci-audits-all-dependencies",
  ciSource.includes("npm ls --all") &&
    ciSource.includes("npm audit signatures") &&
    ciSource.includes("npm audit --audit-level=high") &&
    readmeSource.includes("npm audit --audit-level=high") &&
    !ciSource.includes("npm audit --omit=dev"),
);
check(
  "ci-packages-marketplace-subtree",
  ciSource.includes("HEAD:plugins/easyeda-pro-control") &&
    ciSource.includes("--prefix=easyeda-pro-control/") &&
    ciSource.includes("git ls-tree -r --name-only") &&
    ciSource.includes("cmp expected-plugin-files.txt archived-plugin-files.txt") &&
    !ciSource.includes("plugins/easyeda-pro-control LICENSE THIRD_PARTY_NOTICES.md"),
);
check(
  "ci-authenticated-bridge",
  ciSource.includes("npm run bridge:typecheck") &&
    ciSource.includes("npm run bridge:lint") &&
    ciSource.includes("npm run bridge:test") &&
    ciSource.includes("npm run bridge:provision") &&
    ciSource.match(/npm run (?:--silent )?bridge:build/gu)?.length === 2 &&
    ciSource.includes('first_output_path="$(node -e') &&
    ciSource.includes('second_output_path="$(node -e') &&
    ciSource.includes('cmp "${first_output_path}" "${second_output_path}"'),
);
check(
  "ci-reviewed-bubblewrap",
  ciSource.includes("1b80120ef26a28e065e67f89bfef873f13bdd317") &&
    ciSource.includes("https://github.com/containers/bubblewrap.git") &&
    ciSource.includes("-Dsupport_setuid=false") &&
    ciSource.includes('meson compile -C "${bwrap_source}/_build"') &&
    ciSource.includes("sudo install -o root -g root -m 0755") &&
    ciSource.includes("libcap2-bin") &&
    ciSource.includes("test ! -L /usr/sbin/bwrap") &&
    ciSource.includes('test "$(/usr/sbin/bwrap --version)" = "bubblewrap 0.11.2"') &&
    ciSource.includes('test -z "$(getcap -n /usr/sbin/bwrap)"') &&
    ciSource.includes(
      "--bind-fd --ro-bind-data --ro-bind-fd --json-status-fd --block-fd --disable-userns",
    ) &&
    ciSource.includes("npm test") &&
    !ciSource.includes("install --yes bubblewrap"),
);
check(
  "ci-reproducible-facade-closure",
  ciSource.includes("server/dist/server.mjs") &&
    ciSource.includes("server/dist/upstream-supervisor.mjs"),
);
check(
  "production-writer-not-enabled",
  indexSource.includes("new EasyedaControlEngine(upstream)") &&
    !indexSource.includes(
      "new EasyedaControlEngine(upstream, { privateComponentWriterValidated: true",
    ),
);
check(
  "raw-structurally-disabled",
  indexSource.includes("there is no environment opt-in"),
);
check(
  "skill-declares-disabled-writer",
  /writer is experimental and runtime-disabled/i.test(skillSource),
);
check(
  "agent-default-prompt",
  agentSource.includes(
    'default_prompt: "Use $easyeda-pro-control to validate the EasyEDA bridge, collect bounded read evidence, or inspect local recovery artifacts without bypassing compatibility gates."',
  ),
);

const gitFiles = await execFileAsync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
);
const repositoryPaths = gitFiles.stdout
  .split("\0")
  .filter((path) => path.length > 0)
  .sort();
check(
  "repository-paths-normalized",
  repositoryPaths.every((path) => safeRepositoryPath(path)),
);
const prohibitedExtensions = new Set([
  ".7z",
  ".db",
  ".dsn",
  ".eprj",
  ".eprj2",
  ".epro2",
  ".eext",
  ".gz",
  ".key",
  ".p12",
  ".pem",
  ".pfx",
  ".rar",
  ".ses",
  ".sqlite",
  ".sqlite3",
  ".tar",
  ".tgz",
  ".token",
  ".zip",
]);
const prohibitedDirectoryNames = new Set([
  ".easyeda-pro-control",
  "backups",
  "checkpoints",
  "evidence",
  "operations",
]);
const prohibitedExactNames = new Set([
  ".env",
  ".npmrc",
  "credentials",
  "credentials.json",
  "bridge-token",
  "id_ed25519",
  "id_rsa",
  "secrets",
  "secrets.json",
  "token",
]);
const prohibitedPaths = [];
const symlinkPaths = [];
const oversizedPaths = [];
const binaryPaths = [];
const secretHits = [];
const privacyHits = [];
const placeholderHits = [];
const secretPatterns = [
  ["private-key", /-----BEGIN (?:DSA |EC |OPENSSH |PGP |RSA )?PRIVATE KEY-----/u],
  ["github-classic", /\bgh[opsu]_[A-Za-z0-9]{30,255}\b/u],
  ["github-fine-grained", /\bgithub_pat_[A-Za-z0-9_]{40,255}\b/u],
  ["aws-access-key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/u],
  ["npm-token", /\bnpm_[A-Za-z0-9]{30,255}\b/u],
  ["slack-token", /\bxox[baprs]-[A-Za-z0-9-]{20,255}\b/u],
  ["openai-key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,255}\b/u],
  ["anthropic-key", /\bsk-ant-[A-Za-z0-9_-]{20,255}\b/u],
  ["google-api-key", /\bAIza[A-Za-z0-9_-]{30,60}\b/u],
  [
    "assigned-secret",
    /(?:api[_-]?key|authentication[_-]?key|bridge[_-]?token|credential|password|secret|session[_-]?token|token)\s*[:=]\s*["'][A-Za-z0-9_+./=-]{32,}["']/iu,
  ],
  [
    "esbuild-inlined-secret",
    /\b(?:true|!0)\s*\?\s*["'][A-Za-z0-9_-]{32,256}["']\s*:\s*void 0\b/u,
  ],
  ["credential-url", /https?:\/\/[^\s/@:]+:[^\s/@]+@/iu],
];
check(
  "secret-scan-detects-esbuild-inlined-key",
  secretPatterns.some(
    ([label, pattern]) =>
      label === "esbuild-inlined-secret" &&
      pattern.test(
        `const key = true ? "${"Ab0_".repeat(12)}" : void 0`,
      ),
  ),
);
const privateDesignName = ["Piano", "Pi"].join("");
const privateDesignPath = ["/root/work/", "piano", "pi"].join("");
const privacyPatterns = [
  ["private-design-name", new RegExp(`\\b${privateDesignName}\\b`, "u")],
  ["private-design-path", new RegExp(`${privateDesignPath}(?:/|\\b)`, "u")],
  [
    "windows-user-path",
    /\/mnt\/c\/Users\/(?!Fixture(?:\/|\b)|Public(?:\/|\b))[^/\s]+\//u,
  ],
];
check(
  "privacy-scan-detects-private-design-identifiers",
  privacyPatterns.some(
    ([label, pattern]) =>
      label === "private-design-name" && pattern.test(privateDesignName),
  ) &&
    privacyPatterns.some(
      ([label, pattern]) =>
        label === "private-design-path" &&
        pattern.test(`${privateDesignPath}/private-project.epro2`),
    ),
);
const scaffoldPlaceholderPrefix = ["[", "TODO", ":"].join("");
const decoder = new TextDecoder("utf-8", { fatal: true });
for (const relativePath of repositoryPaths) {
  const segments = relativePath.split("/");
  const basename = segments.at(-1)?.toLowerCase() ?? "";
  const extension = extname(basename);
  if (
    relativePath === authenticatedBridgeDistPath ||
    relativePath.startsWith(authenticatedBridgeDistPrefix) ||
    prohibitedExtensions.has(extension) ||
    segments.some((segment) =>
      prohibitedDirectoryNames.has(segment.toLowerCase()),
    ) ||
    prohibitedExactNames.has(basename) ||
    basename.endsWith(".eext.receipt.json") ||
    (basename.startsWith(".env.") &&
      ![".env.example", ".env.sample"].includes(basename))
  ) {
    prohibitedPaths.push(relativePath);
  }
  const absolutePath = join(root, relativePath);
  const info = await lstat(absolutePath);
  if (info.isSymbolicLink()) {
    symlinkPaths.push(relativePath);
    continue;
  }
  if (!info.isFile()) {
    continue;
  }
  if (info.size > MAX_REPOSITORY_FILE_BYTES) {
    oversizedPaths.push(relativePath);
    continue;
  }
  const bytes = await readFile(absolutePath);
  const byteText = bytes.toString("latin1");
  for (const [label, pattern] of secretPatterns) {
    if (pattern.test(byteText)) {
      secretHits.push(`${relativePath}:${label}`);
    }
  }
  for (const [label, pattern] of privacyPatterns) {
    if (pattern.test(byteText)) {
      privacyHits.push(`${relativePath}:${label}`);
    }
  }
  if (bytes.includes(0)) {
    binaryPaths.push(relativePath);
    continue;
  }
  let text;
  try {
    text = decoder.decode(bytes);
  } catch {
    binaryPaths.push(relativePath);
    continue;
  }
  if (text.includes(scaffoldPlaceholderPrefix)) {
    placeholderHits.push(relativePath);
  }
}
check("no-prohibited-release-paths", prohibitedPaths.length === 0, prohibitedPaths.join(", "));

async function collectTreeEntries(absoluteDirectory, relativeDirectory) {
  let information;
  try {
    information = await lstat(absoluteDirectory);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }
    throw error;
  }
  if (!information.isDirectory() || information.isSymbolicLink()) {
    return [relativeDirectory];
  }
  const entries = [];
  for (const child of (await readdir(absoluteDirectory)).toSorted()) {
    entries.push(
      ...(await collectTreeEntries(
        join(absoluteDirectory, child),
        `${relativeDirectory}/${child}`,
      )),
    );
  }
  return entries;
}

const authenticatedBridgeDistEntries = await collectTreeEntries(
  join(root, authenticatedBridgeDistPath),
  authenticatedBridgeDistPath,
);
check(
  "no-source-adjacent-authenticated-bridge-output",
  authenticatedBridgeDistEntries.length === 0,
  authenticatedBridgeDistEntries.join(", "),
);
check("no-repository-symlinks", symlinkPaths.length === 0, symlinkPaths.join(", "));
check("bounded-release-files", oversizedPaths.length === 0, oversizedPaths.join(", "));
check("no-secret-patterns", secretHits.length === 0, secretHits.join(", "));
check("no-private-design-identifiers", privacyHits.length === 0, privacyHits.join(", "));
check(
  "no-scaffold-placeholders",
  placeholderHits.length === 0,
  placeholderHits.join(", "),
);
const packagePaths = repositoryPaths.filter(
  (path) =>
    path === "LICENSE" ||
    path === "THIRD_PARTY_NOTICES.md" ||
    path.startsWith("plugins/easyeda-pro-control/"),
);
check("package-content-present", packagePaths.length > 0);
check(
  "package-content-scanned",
  packagePaths.every(
    (path) =>
      !symlinkPaths.includes(path) &&
      !oversizedPaths.includes(path) &&
      !prohibitedPaths.includes(path),
  ),
);
const ignoredReleasePatterns = await readFile(join(root, ".gitignore"), "utf8");
for (const pattern of [
  "*.eprj2",
  "*.epro2",
  "*.eext",
  "*.eext.receipt.json",
  "*.token",
  "bridge-token",
  "*.sqlite",
  "*.db",
  "*.dsn",
  "*.ses",
  "evidence/",
  "operations/",
  "checkpoints/",
  "/plugins/easyeda-pro-control/easyeda-bridge-extension/dist/",
]) {
  check(
    `gitignore:${pattern}`,
    ignoredReleasePatterns.split(/\r?\n/u).includes(pattern),
  );
}

const result = {
  ok: checks.every((item) => item.ok),
  root,
  pluginRoot,
  scannedRepositoryFiles: repositoryPaths.length,
  scannedPackageFiles: packagePaths.length,
  binaryFiles: binaryPaths,
  checks,
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!result.ok) {
  process.exitCode = 1;
}
