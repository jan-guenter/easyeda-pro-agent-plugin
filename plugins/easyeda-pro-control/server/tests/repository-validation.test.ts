import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";
import { promisify } from "node:util";

import {
  bridgeExtensionManifestSchema,
  bundledRuntimeInventorySchema,
  hasSafeNpmInstallConfiguration,
  hasStrictBridgeCompilerOptions,
  lintConfigurationSchema,
  marketplaceSchema,
  mcpConfigurationSchema,
  packageLockSchema,
  packageManifestSchema,
  parseRepositoryJson,
  pluginManifestSchema,
  readRepositoryJson,
  reviewedCompatibilitySchema,
  safeRepositoryPath,
  typescriptConfigurationSchema,
  unreviewedJavaScriptPaths,
} from "../../scripts/repository-validation.ts";

const pluginRoot = resolve(import.meta.dirname, "../..");
// oxlint-disable-next-line typescript/strict-void-return -- Node execFile returns its ChildProcess while promisify consumes only its callback.
const execFileAsync = promisify(execFile);

void describe("repository release validation", () => {
  void it("accepts portable normalized repository paths", () => {
    for (const path of ["README.md", ".agents/plugins/marketplace.json", "a b/é.txt"]) {
      assert.equal(safeRepositoryPath(path), true, path);
    }
  });

  void it("rejects traversal, Windows aliases, and line-oriented archive ambiguities", () => {
    for (const path of [
      "", "/root.txt", "./root.txt", "a/./b", "a/../b", "../b", "a//b", "a/",
      String.raw`a\b`, "C:/b", "a\u0000b", "a\nb", "a\rb", "a\tb", "a\u007Fb",
    ]) {
      assert.equal(safeRepositoryPath(path), false, JSON.stringify(path));
    }
  });

  void it("parses packaged release metadata using the validator's actual schemas", async () => {
    const marketplace = {
      name: "easyeda-pro-agent",
      interface: { displayName: "EasyEDA Pro Agent" },
      plugins: [{
        name: "easyeda-pro-control",
        category: "Development",
        source: { source: "local", path: "./plugins/easyeda-pro-control" },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
      }],
    };
    assert.equal(marketplaceSchema.safeParse(marketplace).success, true);
    await readRepositoryJson(pluginManifestSchema, join(pluginRoot, ".codex-plugin", "plugin.json"));
    await readRepositoryJson(mcpConfigurationSchema, join(pluginRoot, ".mcp.json"));
    await readRepositoryJson(bundledRuntimeInventorySchema, join(pluginRoot, "licenses", "bundled-runtime.json"));
    await readRepositoryJson(reviewedCompatibilitySchema, join(pluginRoot, "reviewed-compatibility.json"));
    await readRepositoryJson(packageManifestSchema, join(pluginRoot, "package.json"));
    await readRepositoryJson(packageLockSchema, join(pluginRoot, "package-lock.json"));
    await readRepositoryJson(bridgeExtensionManifestSchema, join(pluginRoot, "easyeda-bridge-extension", "extension.json"));
    await readRepositoryJson(packageManifestSchema, join(pluginRoot, "easyeda-bridge-extension", "package.json"));
    await readRepositoryJson(lintConfigurationSchema, join(pluginRoot, ".oxlintrc.bridge.json"), true);
    await readRepositoryJson(typescriptConfigurationSchema, join(pluginRoot, "easyeda-bridge-extension", "tsconfig.json"), true);
    await readRepositoryJson(typescriptConfigurationSchema, join(pluginRoot, "easyeda-bridge-extension", "tsconfig.test.json"), true);
  });

  void it("rejects malformed JSON and missing metadata without coercion", () => {
    for (const source of ["null", "[]", "{}", "false", "{broken", '{"name":42}']) {
      assert.throws(() => { parseRepositoryJson(marketplaceSchema, source); });
      assert.throws(() => { parseRepositoryJson(pluginManifestSchema, source); });
    }
  });

  void it("checks strict compiler option values, not merely their presence", async () => {
    const path = join(pluginRoot, "easyeda-bridge-extension", "tsconfig.json");
    const config = await readRepositoryJson(typescriptConfigurationSchema, path, true);
    const options = config.compilerOptions;
    assert.equal(hasStrictBridgeCompilerOptions(options), true);
    assert.equal(hasStrictBridgeCompilerOptions(), false);
    assert.equal(hasStrictBridgeCompilerOptions({}), false);
    for (const flag of ["strict", "noImplicitAny", "noUncheckedIndexedAccess"]) {
      assert.equal(hasStrictBridgeCompilerOptions({ ...options, [flag]: false }), false, flag);
    }
    assert.equal(hasStrictBridgeCompilerOptions({ ...options, skipLibCheck: true }), false);
    assert.equal(hasStrictBridgeCompilerOptions({ ...options, strict: "true" }), false);
  });

  void it("accepts only the dependency hook policy, without credentials or overrides", () => {
    assert.equal(hasSafeNpmInstallConfiguration("# reviewed policy\nignore-scripts=true\n"), true);
    for (const source of [
      "", "ignore-scripts=false", "ignore-scripts=true\nignore-scripts=false",
      "ignore-scripts=true\nignore-scripts=true", "ignore-scripts=true\nregistry=https://example.invalid",
      `ignore-scripts=\${POLICY}`, "ignore-scripts=true\n//registry.example.invalid/:_authToken=fixture",
    ]) {
      assert.equal(hasSafeNpmInstallConfiguration(source), false);
    }
  });

  void it("checks npm's effective lifecycle-hook policy without running an install", async () => {
    const npmCli = resolve(process.execPath, "../../lib/node_modules/npm/bin/npm-cli.js");
    const result = await execFileAsync(process.execPath, [npmCli, "config", "get", "ignore-scripts"], {
      cwd: pluginRoot,
      timeout: 10_000,
    });
    assert.equal(result.stdout.trim(), "true");
  });

  void it("resolves strict checkJs and all three frozen stub files through the actual compiler", async () => {
    const compiler = join(pluginRoot, "node_modules", "typescript", "bin", "tsc");
    const result = await execFileAsync(process.execPath, [compiler, "--showConfig", "-p", "tsconfig.bridge-stubs.json"], {
      cwd: pluginRoot,
      timeout: 10_000,
    });
    const config = parseRepositoryJson(typescriptConfigurationSchema, result.stdout);
    const options = config.compilerOptions;
    for (const flag of ["allowJs", "checkJs", "strict", "noEmit", "noUncheckedIndexedAccess", "noPropertyAccessFromIndexSignature"]) {
      assert.equal(options?.[flag], true, flag);
    }
    assert.equal(options?.["skipLibCheck"], false);
    assert.deepEqual(config.files, [
      "./easyeda-bridge-extension/scripts/build.mjs",
      "./easyeda-bridge-extension/scripts/dev-watch.mjs",
      "./easyeda-bridge-extension/scripts/package.mjs",
    ]);
  });

  void it("rejects new JavaScript outside the exact generated bundles and frozen stubs", () => {
    const prefix = "plugins/easyeda-pro-control/";
    assert.deepEqual(unreviewedJavaScriptPaths([
      `${prefix}server/src/core.ts`,
      `${prefix}server/dist/server.mjs`,
      `${prefix}server/dist/upstream-supervisor.mjs`,
      `${prefix}easyeda-bridge-extension/scripts/build.mjs`,
      `${prefix}easyeda-bridge-extension/scripts/dev-watch.mjs`,
      `${prefix}easyeda-bridge-extension/scripts/package.mjs`,
    ]), []);
    const rejected = ["scripts/new.mjs", `${prefix}scripts/new.js`, `${prefix}server/src/new.cjs`, `${prefix}server/dist/other.mjs`];
    assert.deepEqual(unreviewedJavaScriptPaths(rejected), rejected);
  });

  void it("rejects non-string package versions instead of stringifying them", async () => {
    const path = join(pluginRoot, "package.json");
    const valid = await readRepositoryJson(packageManifestSchema, path);
    assert.equal(packageManifestSchema.safeParse({ ...valid, version: 3 }).success, false);
  });

  void it("rejects invalid nested tool policy and license inventory shapes", () => {
    const malformedMcp = {
      mcpServers: {
        easyeda_pro_control: {
          type: "stdio",
          default_tools_approval_mode: "prompt",
          env: {},
          tools: { example: { approval_mode: true } },
        },
      },
    };
    assert.equal(mcpConfigurationSchema.safeParse(malformedMcp).success, false);
    assert.equal(bundledRuntimeInventorySchema.safeParse({ dependencies: {} }).success, false);
    assert.equal(bundledRuntimeInventorySchema.safeParse({ dependencies: [{ noticePath: 3 }] }).success, false);
  });

  void it("only permits whole-line comments when the config reader requests them", async () => {
    const source = await readFile(join(pluginRoot, ".oxlintrc.bridge.json"), "utf8");
    assert.throws(() => { parseRepositoryJson(lintConfigurationSchema, source); });
    const parsed = parseRepositoryJson(lintConfigurationSchema, source, true);
    assert.ok(parsed.overrides.length > 0);
    assert.throws(() => { parseRepositoryJson(lintConfigurationSchema, `${source}\n/* block comment */`, true); });
  });
});
