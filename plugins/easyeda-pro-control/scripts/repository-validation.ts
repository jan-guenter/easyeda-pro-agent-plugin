import { readFile } from "node:fs/promises";

import { z } from "zod";
import { portableMcpLaunchSchema } from "./plugin-contract.ts";

const stringSchema = z.string();
const DEFAULT_REPOSITORY_FILE_BYTES = 8 * 1024 * 1024;
const FACADE_BUNDLE_PATH = "plugins/easyeda-pro-control/server/dist/server.mjs";
const FACADE_BUNDLE_BYTES = 12 * 1024 * 1024;
const reviewedBundleFileSchema = z.object({ relativePath: z.string(), bytes: z.int().nonnegative(), sha256: z.string().regex(/^[a-f0-9]{64}$/u) });
const reviewedBundleFilesSchema = z.array(reviewedBundleFileSchema);

/** Only the reproducible facade has a larger scan budget. Installed payload
 * verification independently caps every file at 16 MiB; ordinary files retain
 * 8 MiB. This is never an exemption from complete secret/privacy scanning.
 */
export function repositoryFileByteLimit(relativePath: string): number {
  return relativePath === FACADE_BUNDLE_PATH ? FACADE_BUNDLE_BYTES : DEFAULT_REPOSITORY_FILE_BYTES;
}
export function hasReviewedRepositoryFileSize(relativePath: string, bytes: number, sha256: string, reviewedFiles: unknown): boolean {
  if (!Number.isSafeInteger(bytes) || bytes < 0 || bytes > repositoryFileByteLimit(relativePath)) { return false; }
  if (bytes <= DEFAULT_REPOSITORY_FILE_BYTES) { return true; }
  if (relativePath !== FACADE_BUNDLE_PATH) { return false; }
  const parsed = reviewedBundleFilesSchema.safeParse(reviewedFiles);
  if (!parsed.success) { return false; }
  const matches = parsed.data.filter(file => file.relativePath === "server.mjs");
  return matches.length === 1 && matches[0]?.bytes === bytes && matches[0].sha256 === sha256;
}
const stringRecordSchema = z.record(stringSchema, stringSchema);
const menuSchema = z.object({ id: stringSchema, title: stringSchema });
const stringArraySchema = z.array(stringSchema);
const marketplaceEntrySchema = z.object({
  name: stringSchema,
  category: stringSchema,
  source: z.object({ source: stringSchema, path: stringSchema }),
  policy: z.object({ installation: stringSchema, authentication: stringSchema }),
});
const toolPolicySchema = z.object({ approval_mode: stringSchema });
const mcpServerSchema = portableMcpLaunchSchema.extend({
  type: z.literal("stdio"),
  enabled: z.literal(true),
  default_tools_approval_mode: stringSchema,
  tools: z.record(stringSchema, toolPolicySchema),
});
const lockEnginesSchema = z.object({ node: stringSchema.optional() });
const lockPackageSchema = z.object({
  version: stringSchema.optional(),
  engines: lockEnginesSchema.optional(),
  os: stringArraySchema.optional(),
  cpu: stringArraySchema.optional(),
});
const lintRulesSchema = z.record(stringSchema, z.unknown());
const lintOverrideSchema = z.object({ files: stringArraySchema, rules: lintRulesSchema });
const bridgeCompilerRequirements = {
  strict: true,
  allowUnreachableCode: false,
  allowUnusedLabels: false,
  exactOptionalPropertyTypes: true,
  forceConsistentCasingInFileNames: true,
  isolatedModules: true,
  noFallthroughCasesInSwitch: true,
  noImplicitOverride: true,
  noImplicitReturns: true,
  noUncheckedIndexedAccess: true,
  noUncheckedSideEffectImports: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  noImplicitAny: true,
  skipLibCheck: false,
  useUnknownInCatchVariables: true,
  verbatimModuleSyntax: true,
  erasableSyntaxOnly: true,
} as const;
const reviewedJavaScriptPaths = new Set([
  "plugins/easyeda-pro-control/easyeda-bridge-extension/scripts/build.mjs",
  "plugins/easyeda-pro-control/easyeda-bridge-extension/scripts/dev-watch.mjs",
  "plugins/easyeda-pro-control/easyeda-bridge-extension/scripts/package.mjs",
  "plugins/easyeda-pro-control/server/dist/server.mjs",
  "plugins/easyeda-pro-control/server/dist/upstream-supervisor.mjs",
]);

// Parse repository metadata before inspecting it. JSON.parse returns any; these
// Schemas keep malformed shapes from bypassing checks through coercion.
export const marketplaceSchema = z.object({
  name: stringSchema,
  interface: z.object({ displayName: stringSchema }),
  plugins: z.array(marketplaceEntrySchema),
});

export const pluginManifestSchema = z.object({
  name: stringSchema,
  version: stringSchema,
  skills: stringSchema,
  mcpServers: stringSchema,
  repository: stringSchema,
  description: stringSchema,
  interface: z.object({ capabilities: z.array(stringSchema), longDescription: stringSchema }),
});

export const mcpConfigurationSchema = z.object({
  mcpServers: z.object({
    easyeda_pro_control: mcpServerSchema,
  }),
});

export const bundledRuntimeInventorySchema = z.object({
  dependencies: z.array(z.object({
    name: stringSchema,
    version: stringSchema,
    noticePath: stringSchema,
    license: stringSchema,
  })),
});

export const reviewedCompatibilitySchema = z.object({
  facadeImplementation: z.object({
    bundle: z.object({ version: stringSchema, files: reviewedBundleFilesSchema }),
    "source-tree": z.object({ version: stringSchema }),
  }),
  connectedRuntime: z.object({
    bridgeVersion: stringSchema,
    bridgeEasyedaVersion: stringSchema.nullable(),
    dispatcher: z.object({ buildId: stringSchema }),
  }),
});

export const packageManifestSchema = z.object({
  name: stringSchema,
  version: stringSchema,
  private: z.boolean(),
  packageManager: stringSchema.optional(),
  engines: z.object({ node: stringSchema }).optional(),
  os: z.array(stringSchema).optional(),
  cpu: z.array(stringSchema).optional(),
  scripts: stringRecordSchema,
  devDependencies: stringRecordSchema,
});

export const packageLockSchema = z.object({
  version: stringSchema,
  packages: z.record(stringSchema, lockPackageSchema),
});

export const bridgeExtensionManifestSchema = z.object({
  name: stringSchema,
  uuid: stringSchema,
  version: stringSchema,
  displayName: stringSchema,
  publisher: stringSchema,
  repository: z.object({ type: stringSchema, url: stringSchema }),
  homepage: stringSchema,
  bugs: stringSchema,
  headerMenus: z.record(stringSchema, z.array(menuSchema)),
});

export const lintConfigurationSchema = z.object({
  extends: z.array(stringSchema),
  ignorePatterns: z.array(stringSchema),
  overrides: z.array(lintOverrideSchema),
});

export const typescriptConfigurationSchema = z.object({
  extends: stringSchema.optional(),
  include: z.array(stringSchema),
  files: stringArraySchema.optional(),
  compilerOptions: z.object({ target: stringSchema.optional() }).catchall(z.unknown()).optional(),
});

export function safeRepositoryPath(path: string): boolean {
  return path.length > 0 &&
    // oxlint-disable-next-line eslint/no-control-regex -- Reject controls before Git paths reach line-oriented CI and archive checks.
    !/[\u0000-\u001F\u007F\\:]/u.test(path) &&
    path.split("/").every((segment) => segment !== ".." && segment !== "." && segment !== "");
}

export function parseRepositoryJson<T>(schema: z.ZodType<T>, source: string, lineComments = false): T {
  const text = lineComments
    ? source.split("\n").filter((line) => !line.trimStart().startsWith("//")).join("\n")
    : source;
  return schema.parse(JSON.parse(text));
}

export async function readRepositoryJson<T>(schema: z.ZodType<T>, path: string, lineComments = false): Promise<T> {
  const source = await readFile(path, "utf8");
  return parseRepositoryJson(schema, source, lineComments);
}

export function hasStrictBridgeCompilerOptions(options?: Readonly<Record<string, unknown>>): boolean {
  return Object.entries(bridgeCompilerRequirements).every(([flag, expected]) => options?.[flag] === expected);
}

export function hasSafeNpmInstallConfiguration(source: string): boolean {
  const entries = source.split(/\r?\n/u).map((line) => line.trim()).filter((line) =>
    line.length > 0 && !line.startsWith("#") && !line.startsWith(";"));
  return entries.length === 1 && entries[0] === "ignore-scripts=true";
}

export function unreviewedJavaScriptPaths(paths: readonly string[]): string[] {
  return paths.filter((path) => /\.(?:[cm]?js)$/iu.test(path) && !reviewedJavaScriptPaths.has(path));
}
