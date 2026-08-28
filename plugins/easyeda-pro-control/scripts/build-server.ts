#!/usr/bin/env node
import { createHash, randomBytes } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import type { BigIntStats } from "node:fs";
import {
  lstat,
  mkdir,
  open,
  readdir,
  rename,
  rmdir,
  unlink,
} from "node:fs/promises";
import { builtinModules } from "node:module";
import { dirname, extname, join, relative, resolve, sep } from "node:path";

import { parse } from "acorn";
import { build, version as esbuildVersion } from "esbuild";
import type { Loader, Metafile, Plugin } from "esbuild";
import { z } from "zod";

import {
  bundledPackages,
  canonicalPackageRepository,
  captureContainedRegularFile,
} from "./bundled-runtime-license.ts";
import type { CapturedContainedRegularFile } from "./bundled-runtime-license.ts";
import { assertSelfSoftCoreLimitZero } from "../server/src/soft-core-limit.ts";

const BUNDLE_PAIR_PLACEHOLDER =
  "__EASYEDA_CONTROL_BUNDLE_PAIR_SHA256_PLACEHOLDER________________";
const BUNDLE_PAIR_PREFIX = "easyeda-pro-control.bundle-pair.v1";
const BUILD_NODE_VERSION = "v24.18.0";
const BUILD_PLATFORM = "linux";
const BUILD_ARCHITECTURE = "x64";
const PUBLICATION_SCHEMA = "easyeda-pro-control.bundle-publication.v3";
const PUBLICATION_LOCK_NAME = ".bundle-publication.lock";
const PUBLICATION_CANDIDATE_PREFIX = ".bundle-publication-candidate-";
const PUBLICATION_CLEANUP_PREFIX = ".bundle-publication-cleanup-";
const PUBLICATION_JOURNAL_NAME = "publication.json";
const PUBLICATION_COMMIT_READY_NAME = "commit-ready.json";
const PUBLICATION_COMMIT_READY_SCHEMA =
  "easyeda-pro-control.bundle-publication-commit-ready.v1";
const PUBLICATION_TRANSACTION_NAME = "transaction";
const PRIVATE_PUBLICATION_FILE_MODE = 0o600;
const DISABLED_NATIVE_NAMESPACE = "easyeda-disabled-ws-native";
const DISABLED_NATIVE_MODULES = new Set(["bufferutil", "utf-8-validate"]);
const DISABLED_NATIVE_STUB =
  'throw new Error("Optional native ws acceleration is disabled in the reviewed bundle.");\n';
const ESBUILD_TSCONFIG_RAW = Object.freeze({
  compilerOptions: Object.freeze({
    useDefineForClassFields: true,
    verbatimModuleSyntax: true,
  }),
});
// Esbuild serializes plugin filters into Go RE2, which rejects JavaScript's
// Unicode flag even though this ASCII-only expression has identical semantics.
// oxlint-disable-next-line require-unicode-regexp -- Esbuild compiles this filter with RE2, which has no Unicode flag.
const DISABLED_NATIVE_FILTER = /^(bufferutil|utf-8-validate)$/;
// oxlint-disable-next-line require-unicode-regexp -- Esbuild compiles this filter with RE2, which has no Unicode flag.
const ALL_ESBUILD_PATHS_FILTER = /.*/;
const EXACT_OUTPUT_NAMES = ["server.mjs", "upstream-supervisor.mjs"] as const;
const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const bootIdSchema = z.string().regex(
  /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/u,
);
const unsignedIntegerSchema = z.string().regex(/^(?:0|[1-9]\d*)$/u);
const outputNameSchema = z.enum(EXACT_OUTPUT_NAMES);
const journalFileSchema = z.strictObject({
  device: unsignedIntegerSchema,
  inode: unsignedIntegerSchema,
  links: z.literal("1"),
  mode: unsignedIntegerSchema,
  modifiedNs: unsignedIntegerSchema,
  name: outputNameSchema,
  sha256: sha256Schema,
  size: unsignedIntegerSchema,
});
const journalDirectorySchema = z.strictObject({
  device: unsignedIntegerSchema,
  inode: unsignedIntegerSchema,
  mode: unsignedIntegerSchema,
});
const publicationJournalSchema = z.strictObject({
  lockDirectory: journalDirectorySchema,
  newOutputs: z.tuple([journalFileSchema, journalFileSchema]),
  newPairId: sha256Schema,
  oldOutputs: z.tuple([
    journalFileSchema.nullable(),
    journalFileSchema.nullable(),
  ]),
  oldPairId: sha256Schema.nullable(),
  outputDirectory: journalDirectorySchema,
  ownerBootId: bootIdSchema,
  ownerPid: z.int().positive(),
  ownerStartTicks: unsignedIntegerSchema,
  schema: z.literal(PUBLICATION_SCHEMA),
  transactionDirectory: journalDirectorySchema,
});
const publicationCommitReadySchema = z.strictObject({
  journalSha256: sha256Schema,
  newOutputs: z.tuple([journalFileSchema, journalFileSchema]),
  newPairId: sha256Schema,
  schema: z.literal(PUBLICATION_COMMIT_READY_SCHEMA),
});
const bundledDependencySchema = z.strictObject({
  license: z.string().min(1),
  licenseSha256: sha256Schema,
  name: z.string().min(1),
  noticePath: z.string().min(1),
  repository: z.url(),
  sourceLicenseFile: z.string().min(1),
  version: z.string().min(1),
});
const bundledInventorySchema = z.strictObject({
  dependencies: z.array(bundledDependencySchema),
  generatedFrom: z.literal("esbuild metafile inputs"),
  schemaVersion: z.literal(1),
});
const builtinSpecifiers = new Set(
  builtinModules.flatMap((specifier) => [
    specifier,
    specifier.startsWith("node:") ? specifier.slice(5) : `node:${specifier}`,
  ]),
);

interface FileIdentity {
  readonly ctimeNs: bigint;
  readonly device: bigint;
  readonly inode: bigint;
  readonly links: bigint;
  readonly mode: bigint;
  readonly modifiedNs: bigint;
  readonly size: bigint;
}

interface OriginalOutput {
  readonly bytes?: Buffer;
  readonly identity?: FileIdentity;
  readonly name: (typeof EXACT_OUTPUT_NAMES)[number];
  readonly sha256?: string;
}

interface ReleaseOutput {
  readonly bytes: Uint8Array;
  readonly name: (typeof EXACT_OUTPUT_NAMES)[number];
  readonly sha256: string;
}

type PublicationJournal = z.infer<typeof publicationJournalSchema>;
type JournalFile = z.infer<typeof journalFileSchema>;
type PublicationCommitReady = z.infer<typeof publicationCommitReadySchema>;

interface BuildHostFacts {
  readonly architecture: typeof BUILD_ARCHITECTURE;
  readonly nodeVersion: typeof BUILD_NODE_VERSION;
  readonly platform: typeof BUILD_PLATFORM;
  readonly softCoreLimit: 0;
}

interface RuntimeRequireNode {
  readonly arguments?: readonly unknown[];
  readonly callee?: unknown;
  readonly name?: unknown;
  readonly type?: unknown;
  readonly value?: unknown;
  readonly [key: string]: unknown;
}

interface ResolutionDirectorySeal {
  readonly entries: readonly string[];
  readonly identity: FileIdentity;
  readonly path: string;
}

interface ResolutionMetadataSeal {
  readonly assertCurrent: () => Promise<void>;
}

export interface BuildServerOptions {
  readonly afterInputCaptureForTesting?: (
    paths: readonly string[],
  ) => Promise<void>;
  readonly afterOutputAdmissionForTesting?: () => Promise<unknown>;
  readonly afterResolutionMetadataCaptureForTesting?: () => Promise<void>;
  readonly afterStalePublicationRecoveryForTesting?: () => Promise<unknown>;
  readonly afterDurableNewOutputsForTesting?: () => Promise<unknown>;
  readonly afterCommitReadyMarkerForTesting?: () => Promise<unknown>;
  readonly afterFirstNewOutputPublishedForTesting?: () => Promise<unknown>;
  readonly afterOldOutputsRetiredForTesting?: () => Promise<unknown>;
  readonly afterPublicationLockRetiredForTesting?: () => Promise<unknown>;
  readonly beforeOutputPublicationForTesting?: (
    outputName: string,
    index: number,
  ) => Promise<void>;
  readonly beforePublicationLockAcquisitionForTesting?: () => Promise<unknown>;
  readonly bundleBannerSuffixForTesting?: string;
}

async function assertBuildHost(): Promise<BuildHostFacts> {
  if (
    process.version !== BUILD_NODE_VERSION ||
    process.platform !== BUILD_PLATFORM ||
    process.arch !== BUILD_ARCHITECTURE
  ) {
    throw new Error(
      `The bundle build host must be exact ${BUILD_NODE_VERSION} ${BUILD_PLATFORM}/${BUILD_ARCHITECTURE}; received ${process.version} ${process.platform}/${process.arch}.`,
    );
  }
  await assertSelfSoftCoreLimitZero();
  return {
    architecture: BUILD_ARCHITECTURE,
    nodeVersion: BUILD_NODE_VERSION,
    platform: BUILD_PLATFORM,
    softCoreLimit: 0,
  };
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function canonicalLicenseText(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("utf8")
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .trimEnd();
}

function isWithin(root: string, path: string): boolean {
  const child = relative(root, path);
  return child !== "" && child !== ".." && !child.startsWith(`..${sep}`);
}

function errorCode(error: unknown): string | undefined {
  return typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
    ? error.code
    : undefined;
}

function identity(information: BigIntStats): FileIdentity {
  return {
    ctimeNs: information.ctimeNs,
    device: information.dev,
    inode: information.ino,
    links: information.nlink,
    mode: information.mode,
    modifiedNs: information.mtimeNs,
    size: information.size,
  };
}

function sameIdentity(left: FileIdentity, right: FileIdentity): boolean {
  return (
    left.ctimeNs === right.ctimeNs &&
    left.device === right.device &&
    left.inode === right.inode &&
    left.links === right.links &&
    left.mode === right.mode &&
    left.modifiedNs === right.modifiedNs &&
    left.size === right.size
  );
}

function sameIdentityAcrossRename(
  left: FileIdentity,
  right: FileIdentity,
): boolean {
  return (
    left.device === right.device &&
    left.inode === right.inode &&
    left.links === right.links &&
    left.mode === right.mode &&
    left.modifiedNs === right.modifiedNs &&
    left.size === right.size
  );
}

function sameDirectoryIdentity(
  expected: BigIntStats,
  actual: BigIntStats,
): boolean {
  return (
    actual.isDirectory() &&
    !actual.isSymbolicLink() &&
    expected.dev === actual.dev &&
    expected.ino === actual.ino &&
    expected.mode === actual.mode
  );
}

function loaderFor(path: string): Loader {
  switch (extname(path).toLowerCase()) {
    case ".cjs":
    case ".js":
    case ".mjs": {
      return "js";
    }
    case ".cts":
    case ".mts":
    case ".ts": {
      return "ts";
    }
    case ".jsx": {
      return "jsx";
    }
    case ".tsx": {
      return "tsx";
    }
    case ".json": {
      return "json";
    }
    case ".txt": {
      return "text";
    }
    default: {
      throw new Error(`Bundle input uses an unreviewed file loader: ${path}.`);
    }
  }
}

function directoryEntryKind(information: BigIntStats): string {
  if (information.isSymbolicLink()) {
    return "symlink";
  }
  if (information.isDirectory()) {
    return "directory";
  }
  if (information.isFile()) {
    return "file";
  }
  return "other";
}

async function scanResolutionTree(
  root: string,
): Promise<{
  readonly directories: readonly ResolutionDirectorySeal[];
  readonly manifests: readonly string[];
}> {
  const directories: ResolutionDirectorySeal[] = [];
  const manifests: string[] = [];
  const pending = [root];
  while (pending.length > 0) {
    const directory = pending.pop();
    if (directory === undefined) {
      throw new Error("Resolution directory traversal lost its pending path.");
    }
    const before = await lstat(directory, { bigint: true });
    if (before.isSymbolicLink() || !before.isDirectory()) {
      throw new Error(
        `Resolution metadata tree contains an unsafe directory: ${directory}.`,
      );
    }
    const directoryEntries = await readdir(directory);
    const entries: string[] = [];
    for (const name of directoryEntries.toSorted()) {
      const path = join(directory, name);
      const information = await lstat(path, { bigint: true });
      const kind = directoryEntryKind(information);
      entries.push(`${name}\0${kind}`);
      if (kind === "directory") {
        pending.push(path);
      } else if (kind === "file" && name === "package.json") {
        manifests.push(path);
      }
    }
    const after = await lstat(directory, { bigint: true });
    if (!sameIdentity(identity(before), identity(after))) {
      throw new Error(
        `Resolution metadata directory changed during capture: ${directory}.`,
      );
    }
    directories.push({ entries, identity: identity(after), path: directory });
  }
  return {
    directories: directories.toSorted((left, right) =>
      left.path.localeCompare(right.path),
    ),
    manifests: manifests.toSorted(),
  };
}

function sameResolutionTree(
  left: readonly ResolutionDirectorySeal[],
  right: readonly ResolutionDirectorySeal[],
): boolean {
  return (
    left.length === right.length &&
    left.every((directory, index) => {
      const current = right[index];
      return (
        current !== undefined &&
        directory.path === current.path &&
        sameIdentity(directory.identity, current.identity) &&
        JSON.stringify(directory.entries) === JSON.stringify(current.entries)
      );
    })
  );
}

async function optionalRootManifest(
  pluginRoot: string,
): Promise<CapturedContainedRegularFile | undefined> {
  const path = join(pluginRoot, "package.json");
  try {
    return await captureContainedRegularFile(
      pluginRoot,
      path,
      "The package-resolution root manifest",
    );
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

async function assertRootManifestAbsent(pluginRoot: string): Promise<void> {
  const path = join(pluginRoot, "package.json");
  try {
    await lstat(path);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return;
    }
    throw error;
  }
  throw new Error(
    "The package-resolution root manifest appeared after absence was sealed.",
  );
}

async function captureResolutionMetadata(
  pluginRoot: string,
): Promise<ResolutionMetadataSeal> {
  const nodeModulesRoot = join(pluginRoot, "node_modules");
  const before = await scanResolutionTree(nodeModulesRoot);
  const rootManifest = await optionalRootManifest(pluginRoot);
  const manifests = await Promise.all(
    before.manifests.map((path) =>
      captureContainedRegularFile(
        nodeModulesRoot,
        path,
        `The package-resolution manifest ${relative(pluginRoot, path)}`,
      ),
    ),
  );
  const after = await scanResolutionTree(nodeModulesRoot);
  if (
    JSON.stringify(before.manifests) !== JSON.stringify(after.manifests) ||
    !sameResolutionTree(before.directories, after.directories)
  ) {
    throw new Error("Package-resolution metadata changed during capture.");
  }
  return {
    assertCurrent: async () => {
      const current = await scanResolutionTree(nodeModulesRoot);
      if (
        JSON.stringify(after.manifests) !== JSON.stringify(current.manifests) ||
        !sameResolutionTree(after.directories, current.directories)
      ) {
        throw new Error(
          "Package-resolution metadata changed after its descriptor-bound capture.",
        );
      }
      await (rootManifest === undefined
        ? assertRootManifestAbsent(pluginRoot)
        : rootManifest.assertCurrent());
      for (const manifest of manifests) {
        await manifest.assertCurrent();
      }
    },
  };
}

function capturePlugin(
  pluginRoot: string,
  captures: Map<string, CapturedContainedRegularFile>,
): Plugin {
  const sourceRoot = join(pluginRoot, "server", "src");
  const nodeModulesRoot = join(pluginRoot, "node_modules");
  const wsRoot = join(nodeModulesRoot, "ws");
  return {
    name: "descriptor-bound-reviewed-inputs",
    setup(buildApi): void {
      buildApi.onResolve(
        { filter: DISABLED_NATIVE_FILTER },
        (arguments_) => {
          const importer = resolve(arguments_.importer);
          if (!isWithin(wsRoot, importer)) {
            throw new Error(
              `Only the pinned ws package may request disabled native module ${arguments_.path}.`,
            );
          }
          return {
            namespace: DISABLED_NATIVE_NAMESPACE,
            path: arguments_.path,
          };
        },
      );
      buildApi.onLoad(
        { filter: ALL_ESBUILD_PATHS_FILTER, namespace: DISABLED_NATIVE_NAMESPACE },
        (arguments_) => {
          if (!DISABLED_NATIVE_MODULES.has(arguments_.path)) {
            throw new Error(
              `Unexpected disabled native module stub: ${arguments_.path}.`,
            );
          }
          return { contents: DISABLED_NATIVE_STUB, loader: "js" };
        },
      );
      buildApi.onLoad({ filter: ALL_ESBUILD_PATHS_FILTER, namespace: "file" }, async (arguments_) => {
        const absolutePath = resolve(arguments_.path);
        let admittedRoot: string | undefined;
        if (isWithin(sourceRoot, absolutePath)) {
          admittedRoot = sourceRoot;
        } else if (isWithin(nodeModulesRoot, absolutePath)) {
          admittedRoot = nodeModulesRoot;
        }
        if (admittedRoot === undefined) {
          throw new Error(
            `esbuild requested input outside the reviewed source and dependency trees: ${absolutePath}.`,
          );
        }
        let captured = captures.get(absolutePath);
        if (captured === undefined) {
          captured = await captureContainedRegularFile(
            admittedRoot,
            absolutePath,
            `The esbuild input ${relative(pluginRoot, absolutePath)}`,
          );
          captures.set(absolutePath, captured);
        } else {
          await captured.assertCurrent();
        }
        return {
          contents: captured.bytes,
          loader: loaderFor(absolutePath),
          resolveDir: dirname(absolutePath),
        };
      });
    },
  };
}

function fileInputPaths(metafile: Metafile, pluginRoot: string): string[] {
  const result: string[] = [];
  for (const inputPath of Object.keys(metafile.inputs)) {
    if (inputPath.startsWith(`${DISABLED_NATIVE_NAMESPACE}:`)) {
      const moduleName = inputPath.slice(DISABLED_NATIVE_NAMESPACE.length + 1);
      if (!DISABLED_NATIVE_MODULES.has(moduleName)) {
        throw new Error(`Metafile contains an unexpected virtual input: ${inputPath}.`);
      }
    } else {
      result.push(resolve(pluginRoot, inputPath));
    }
  }
  return result.toSorted();
}

async function assertExactCapturedInputs(
  metafile: Metafile,
  pluginRoot: string,
  captures: ReadonlyMap<string, CapturedContainedRegularFile>,
): Promise<string[]> {
  const inputs = fileInputPaths(metafile, pluginRoot);
  const capturedPaths = [...captures.keys()].toSorted();
  if (JSON.stringify(inputs) !== JSON.stringify(capturedPaths)) {
    throw new Error(
      `The esbuild metafile is not exactly bound to the descriptor-captured input set. Inputs: ${JSON.stringify(inputs)}; captures: ${JSON.stringify(capturedPaths)}.`,
    );
  }
  for (const inputPath of inputs) {
    const captured = captures.get(inputPath);
    if (captured === undefined) {
      throw new Error(`Missing descriptor capture for esbuild input: ${inputPath}.`);
    }
    await captured.assertCurrent();
  }
  return inputs;
}

async function validateBundledNotices(
  metafile: Metafile,
  pluginRoot: string,
  captures: ReadonlyMap<string, CapturedContainedRegularFile>,
): Promise<readonly CapturedContainedRegularFile[]> {
  const licensesRoot = join(pluginRoot, "licenses");
  const inventoryPath = join(licensesRoot, "bundled-runtime.json");
  const inventoryCapture = await captureContainedRegularFile(
    licensesRoot,
    inventoryPath,
    "The bundled runtime inventory",
  );
  const inventory = bundledInventorySchema.parse(
    JSON.parse(inventoryCapture.bytes.toString("utf8")),
  );
  const complianceCaptures: CapturedContainedRegularFile[] = [inventoryCapture];
  const inputs = fileInputPaths(metafile, pluginRoot);
  for (const inputPath of inputs) {
    const captured = captures.get(inputPath);
    if (captured === undefined) {
      throw new Error(`Bundled input was not read from captured bytes: ${inputPath}.`);
    }
    await captured.assertCurrent();
  }
  const actual = await bundledPackages(
    inputs.map((path) => relative(pluginRoot, path)),
    pluginRoot,
  );
  const declared = [...inventory.dependencies].toSorted((left, right) =>
    left.name.localeCompare(right.name),
  );
  const actualCoordinates = actual.map(
    ({ name, version, license, repository }) =>
      `${name}@${version} (${license}; ${repository})`,
  );
  const declaredCoordinates = declared.map(
    ({ name, version, license, repository }) =>
      `${name}@${version} (${license}; ${canonicalPackageRepository(repository)})`,
  );
  if (JSON.stringify(actualCoordinates) !== JSON.stringify(declaredCoordinates)) {
    throw new Error(
      `Bundled dependency inventory drifted. Actual: ${JSON.stringify(actualCoordinates)}; declared: ${JSON.stringify(declaredCoordinates)}.`,
    );
  }
  for (const [index, packageData] of actual.entries()) {
    const notice = declared[index];
    if (notice === undefined || notice.name !== packageData.name) {
      throw new Error("Bundled dependency inventory ordering is inconsistent.");
    }
    const sourceLicensePath = resolve(
      packageData.packageRoot,
      notice.sourceLicenseFile,
    );
    const relativeSourceLicensePath = relative(
      packageData.packageRoot,
      sourceLicensePath,
    );
    if (
      relativeSourceLicensePath === ".." ||
      relativeSourceLicensePath.startsWith(`..${sep}`)
    ) {
      throw new Error(
        `Bundled dependency ${notice.name} has an unsafe installed license path.`,
      );
    }
    const noticePath = resolve(pluginRoot, notice.noticePath);
    const relativeNoticePath = relative(pluginRoot, noticePath);
    if (
      relativeNoticePath === ".." ||
      relativeNoticePath.startsWith(`..${sep}`)
    ) {
      throw new Error(
        `Bundled dependency ${notice.name} has a missing or unsafe license path.`,
      );
    }
    const [sourceLicense, shippedNotice] = await Promise.all([
      captureContainedRegularFile(
        packageData.packageRoot,
        sourceLicensePath,
        `The installed license for ${notice.name}@${notice.version}`,
      ),
      captureContainedRegularFile(
        licensesRoot,
        noticePath,
        `The shipped notice for ${notice.name}@${notice.version}`,
      ),
    ]);
    complianceCaptures.push(sourceLicense, shippedNotice);
    if (sourceLicense.sha256 !== notice.licenseSha256) {
      throw new Error(
        `Installed license hash drifted for ${notice.name}@${notice.version}.`,
      );
    }
    if (
      canonicalLicenseText(sourceLicense.bytes) !==
      canonicalLicenseText(shippedNotice.bytes)
    ) {
      throw new Error(
        `Shipped notice does not match the installed license for ${notice.name}@${notice.version}.`,
      );
    }
  }
  return complianceCaptures;
}

function pairIdentity(
  pluginRoot: string,
  buildHost: Readonly<BuildHostFacts>,
  captures: ReadonlyMap<string, CapturedContainedRegularFile>,
  complianceCaptures: readonly CapturedContainedRegularFile[],
  rawOutputs: ReadonlyMap<string, Uint8Array>,
): string {
  const hash = createHash("sha256");
  const disabledNativeStubSha256 = sha256(Buffer.from(DISABLED_NATIVE_STUB));
  hash.update(
    `${BUNDLE_PAIR_PREFIX}\0${JSON.stringify({
      bannerSchema: 1,
      buildHost,
      bundle: true,
      disabledNativeNamespace: DISABLED_NATIVE_NAMESPACE,
      disabledNativeStubSha256,
      esbuildVersion,
      format: "esm",
      legalComments: "eof",
      platform: "node",
      publicationSchema: PUBLICATION_SCHEMA,
      sourcemap: false,
      target: ["node24"],
      tsconfigRaw: ESBUILD_TSCONFIG_RAW,
    })}\0`,
  );
  for (const captured of [...captures.values()].toSorted((left, right) =>
    left.path.localeCompare(right.path),
  )) {
    hash.update(
      `${relative(pluginRoot, captured.path)}\0${captured.bytes.length}\0${captured.sha256}\n`,
    );
  }
  for (const name of [...DISABLED_NATIVE_MODULES].toSorted()) {
    hash.update(
      `${DISABLED_NATIVE_NAMESPACE}:${name}\0${Buffer.byteLength(DISABLED_NATIVE_STUB)}\0${sha256(Buffer.from(DISABLED_NATIVE_STUB))}\n`,
    );
  }
  for (const captured of [...complianceCaptures].toSorted((left, right) =>
    left.path.localeCompare(right.path),
  )) {
    hash.update(
      `release-metadata:${relative(pluginRoot, captured.path)}\0${captured.bytes.length}\0${captured.sha256}\n`,
    );
  }
  for (const [path, bytes] of [...rawOutputs.entries()].toSorted((left, right) =>
    left[0].localeCompare(right[0]),
  )) {
    hash.update(
      `${relative(pluginRoot, path)}\0${bytes.length}\0${sha256(bytes)}\n`,
    );
  }
  return hash.digest("hex");
}

function bundleBanner(suffix: string | undefined): string {
  const encodedSuffix = suffix === undefined
    ? ""
    : `\n/* test-build-banner:${Buffer.from(suffix).toString("base64url")} */`;
  // Normal bundles live in server/dist.
  // Their parent is the publication directory.
  // The descriptor-sealed supervisor is mounted directly at /runtime.
  // Its sandbox allows only /runtime after staging admits exact bytes.
  return `import { constants as __easyedaFsConstants, closeSync as __easyedaCloseSync, fstatSync as __easyedaFstatSync, lstatSync as __easyedaLstatSync, openSync as __easyedaOpenSync, readFileSync as __easyedaReadFileSync } from "node:fs";
import { basename as __easyedaBasename, dirname as __easyedaDirname, join as __easyedaJoin } from "node:path";
import { builtinModules as __easyedaBuiltinModules, createRequire as __easyedaCreateRequire } from "node:module";
const __easyedaBuiltinSpecifiers = new Set(__easyedaBuiltinModules.flatMap((specifier) => [specifier, specifier.startsWith("node:") ? specifier.slice(5) : "node:" + specifier]));
const __easyedaRawRequire = __easyedaCreateRequire(import.meta.url);
const require = function __easyedaGuardedRequire(specifier) { if (typeof specifier !== "string" || !__easyedaBuiltinSpecifiers.has(specifier)) throw new Error("The facade bundle blocked a non-builtin runtime require."); return __easyedaRawRequire(specifier); };
	const __easyedaBundleParentDirectory = __easyedaDirname(import.meta.dirname);
	const __easyedaPublicationDirectory = __easyedaBundleParentDirectory === "/" ? import.meta.dirname : __easyedaBundleParentDirectory;
	const __easyedaPublicationLockPath = __easyedaJoin(__easyedaPublicationDirectory, "${PUBLICATION_LOCK_NAME}");
const __easyedaAssertNoPublication = () => { try { __easyedaLstatSync(__easyedaPublicationLockPath); throw new Error("The facade bundle is undergoing a fail-closed publication transaction."); } catch (__easyedaPublicationError) { if (!__easyedaPublicationError || typeof __easyedaPublicationError !== "object" || !("code" in __easyedaPublicationError) || __easyedaPublicationError.code !== "ENOENT") throw __easyedaPublicationError; } };
__easyedaAssertNoPublication();
const __easyedaBundlePairId = "${BUNDLE_PAIR_PLACEHOLDER}";
if (__easyedaBasename(import.meta.filename) === "server.mjs") {
  const __easyedaPeerPath = __easyedaJoin(import.meta.dirname, "upstream-supervisor.mjs");
  const __easyedaPeerPathBefore = __easyedaLstatSync(__easyedaPeerPath, { bigint: true });
  if (__easyedaPeerPathBefore.isSymbolicLink() || !__easyedaPeerPathBefore.isFile() || __easyedaPeerPathBefore.nlink !== 1n) throw new Error("The facade bundle pair is not a regular single-link release set.");
  const __easyedaPeerDescriptor = __easyedaOpenSync(__easyedaPeerPath, __easyedaFsConstants.O_RDONLY | __easyedaFsConstants.O_NOFOLLOW);
  try {
    const __easyedaPeerDescriptorBefore = __easyedaFstatSync(__easyedaPeerDescriptor, { bigint: true });
    const __easyedaPeerSource = __easyedaReadFileSync(__easyedaPeerDescriptor, "utf8");
    const __easyedaPeerDescriptorAfter = __easyedaFstatSync(__easyedaPeerDescriptor, { bigint: true });
    const __easyedaPeerPathAfter = __easyedaLstatSync(__easyedaPeerPath, { bigint: true });
    if (__easyedaPeerDescriptorBefore.dev !== __easyedaPeerPathBefore.dev || __easyedaPeerDescriptorBefore.ino !== __easyedaPeerPathBefore.ino || __easyedaPeerDescriptorBefore.dev !== __easyedaPeerDescriptorAfter.dev || __easyedaPeerDescriptorBefore.ino !== __easyedaPeerDescriptorAfter.ino || __easyedaPeerDescriptorBefore.size !== __easyedaPeerDescriptorAfter.size || __easyedaPeerDescriptorBefore.mtimeNs !== __easyedaPeerDescriptorAfter.mtimeNs || __easyedaPeerDescriptorBefore.ctimeNs !== __easyedaPeerDescriptorAfter.ctimeNs || __easyedaPeerDescriptorAfter.dev !== __easyedaPeerPathAfter.dev || __easyedaPeerDescriptorAfter.ino !== __easyedaPeerPathAfter.ino || __easyedaPeerDescriptorAfter.nlink !== 1n) throw new Error("The facade bundle pair changed during admission.");
    const __easyedaPeerPair = /const __easyedaBundlePairId = "([a-f0-9]{64})";/u.exec(__easyedaPeerSource)?.[1];
    if (__easyedaPeerPair !== __easyedaBundlePairId) throw new Error("The facade bundle files are from different build transactions.");
  } finally { __easyedaCloseSync(__easyedaPeerDescriptor); }
}
__easyedaAssertNoPublication();${encodedSuffix}`;
}

function replacePairPlaceholder(bytes: Uint8Array, pairId: string): Uint8Array {
  const source = Buffer.from(bytes).toString("utf8");
  const first = source.indexOf(BUNDLE_PAIR_PLACEHOLDER);
  if (
    first === -1 ||
    source.includes(BUNDLE_PAIR_PLACEHOLDER, first + 1) ||
    pairId.length !== BUNDLE_PAIR_PLACEHOLDER.length
  ) {
    throw new Error("Bundle pair identity placeholder cardinality is invalid.");
  }
  return Buffer.from(
    `${source.slice(0, first)}${pairId}${source.slice(first + BUNDLE_PAIR_PLACEHOLDER.length)}`,
    "utf8",
  );
}

function isRuntimeRequireNode(value: unknown): value is RuntimeRequireNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function assertNoUnreviewedRuntimeRequires(source: Uint8Array, name: string): void {
  const ast: unknown = parse(Buffer.from(source).toString("utf8"), {
    allowHashBang: true,
    ecmaVersion: "latest",
    sourceType: "module",
  });
  const stack: unknown[] = [ast];
  while (stack.length > 0) {
    const candidate = stack.pop();
    if (isUnknownArray(candidate)) {
      stack.push(...candidate);
    } else if (isRuntimeRequireNode(candidate)) {
      if (
        candidate.type === "CallExpression" &&
        isRuntimeRequireNode(candidate.callee) &&
        candidate.callee.type === "Identifier" &&
        (candidate.callee.name === "require" ||
          candidate.callee.name === "__require")
      ) {
        const firstArgument = candidate.arguments?.[0];
        if (
          !isRuntimeRequireNode(firstArgument) ||
          firstArgument.type !== "Literal" ||
          typeof firstArgument.value !== "string" ||
          !builtinSpecifiers.has(firstArgument.value)
        ) {
          throw new Error(
            `Bundle ${name} contains a non-builtin or dynamic runtime require.`,
          );
        }
      }
      stack.push(...Object.values(candidate));
    }
  }
}

async function readSafeSingleLinkFile(
  path: string,
  label: string,
): Promise<{ readonly bytes: Buffer; readonly identity: FileIdentity }> {
  const pathBefore = await lstat(path, { bigint: true });
  if (
    pathBefore.isSymbolicLink() ||
    !pathBefore.isFile() ||
    pathBefore.nlink !== 1n
  ) {
    throw new Error(`${label} is not a regular single-link file: ${path}.`);
  }
  const flags =
    // oxlint-disable-next-line eslint/no-bitwise -- Node open(2) flags must be combined bitwise.
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW;
  const handle = await open(path, flags);
  try {
    const descriptorBefore = await handle.stat({ bigint: true });
    const bytes = await handle.readFile();
    const descriptorAfter = await handle.stat({ bigint: true });
    const pathAfter = await lstat(path, { bigint: true });
    if (
      !sameIdentity(identity(pathBefore), identity(descriptorBefore)) ||
      !sameIdentity(identity(descriptorBefore), identity(descriptorAfter)) ||
      !sameIdentity(identity(descriptorAfter), identity(pathAfter))
    ) {
      throw new Error(`${label} changed while its bytes were captured: ${path}.`);
    }
    return { bytes, identity: identity(descriptorAfter) };
  } finally {
    await handle.close();
  }
}

async function outputState(
  descriptorRoot: string,
  name: (typeof EXACT_OUTPUT_NAMES)[number],
): Promise<OriginalOutput> {
  const path = join(descriptorRoot, name);
  try {
    const information = await lstat(path, { bigint: true });
    if (
      information.isSymbolicLink() ||
      !information.isFile() ||
      information.nlink !== 1n
    ) {
      throw new Error(`Refusing an unsafe bundle output target: ${path}.`);
    }
    return { identity: identity(information), name };
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return { name };
    }
    throw error;
  }
}

async function captureOriginalOutput(
  descriptorRoot: string,
  name: (typeof EXACT_OUTPUT_NAMES)[number],
): Promise<OriginalOutput> {
  const state = await outputState(descriptorRoot, name);
  if (state.identity === undefined) {
    return state;
  }
  const captured = await readSafeSingleLinkFile(
    join(descriptorRoot, name),
    `Bundle output ${name}`,
  );
  return {
    bytes: captured.bytes,
    identity: captured.identity,
    name,
    sha256: sha256(captured.bytes),
  };
}

async function assertOutputState(
  descriptorRoot: string,
  expected: OriginalOutput,
  acrossRename = false,
): Promise<void> {
  const current = await outputState(descriptorRoot, expected.name);
  if (
    (expected.identity === undefined) !== (current.identity === undefined) ||
    (expected.identity !== undefined &&
      current.identity !== undefined &&
      !(acrossRename
        ? sameIdentityAcrossRename(expected.identity, current.identity)
        : sameIdentity(expected.identity, current.identity)))
  ) {
    throw new Error(
      `Bundle output target changed after admission: ${expected.name}.`,
    );
  }
  if (expected.bytes !== undefined && expected.sha256 !== undefined) {
    const captured = await readSafeSingleLinkFile(
      join(descriptorRoot, expected.name),
      `Bundle output ${expected.name}`,
    );
    if (
      sha256(captured.bytes) !== expected.sha256 ||
      !captured.bytes.equals(expected.bytes)
    ) {
      throw new Error(`Bundle output content changed: ${expected.name}.`);
    }
  }
}

async function writeStagedOutput(
  transactionRoot: string,
  output: ReleaseOutput,
): Promise<FileIdentity> {
  const path = join(transactionRoot, `${output.name}.new`);
  const flags =
    // oxlint-disable-next-line eslint/no-bitwise -- Node open(2) flags must be combined bitwise.
    fsConstants.O_WRONLY |
    fsConstants.O_CREAT |
    fsConstants.O_EXCL |
    fsConstants.O_NOFOLLOW;
  const handle = await open(path, flags, 0o600);
  try {
    await handle.writeFile(output.bytes);
    await handle.sync();
    const information = await handle.stat({ bigint: true });
    if (
      !information.isFile() ||
      information.nlink !== 1n ||
      information.size !== BigInt(output.bytes.length)
    ) {
      throw new Error(`Staged bundle output has an unsafe identity: ${output.name}.`);
    }
    return identity(information);
  } finally {
    await handle.close();
  }
}

async function readPublishedOutput(
  descriptorRoot: string,
  output: ReleaseOutput,
): Promise<FileIdentity> {
  const path = join(descriptorRoot, output.name);
  const pathBefore = await lstat(path, { bigint: true });
  if (
    pathBefore.isSymbolicLink() ||
    !pathBefore.isFile() ||
    pathBefore.nlink !== 1n
  ) {
    throw new Error(`Published bundle output is unsafe: ${output.name}.`);
  }
  const flags =
    // oxlint-disable-next-line eslint/no-bitwise -- Node open(2) flags must be combined bitwise.
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW;
  const handle = await open(path, flags);
  try {
    const descriptorBefore = await handle.stat({ bigint: true });
    const bytes = await handle.readFile();
    const descriptorAfter = await handle.stat({ bigint: true });
    const pathAfter = await lstat(path, { bigint: true });
    const expectedIdentity = identity(pathBefore);
    if (
      !sameIdentity(expectedIdentity, identity(descriptorBefore)) ||
      !sameIdentity(identity(descriptorBefore), identity(descriptorAfter)) ||
      !sameIdentity(identity(descriptorAfter), identity(pathAfter)) ||
      bytes.length !== output.bytes.length ||
      sha256(bytes) !== output.sha256 ||
      !bytes.equals(output.bytes)
    ) {
      throw new Error(`Published bundle output changed or mismatched: ${output.name}.`);
    }
    return identity(descriptorAfter);
  } finally {
    await handle.close();
  }
}

async function assertDirectoryHandleCurrent(
  handle: Awaited<ReturnType<typeof open>>,
  path: string,
  label: string,
): Promise<void> {
  const [descriptorInformation, pathInformation] = await Promise.all([
    handle.stat({ bigint: true }),
    lstat(path, { bigint: true }),
  ]);
  if (!sameDirectoryIdentity(descriptorInformation, pathInformation)) {
    throw new Error(`${label} path identity changed.`);
  }
}

function journalDirectory(information: BigIntStats): PublicationJournal["outputDirectory"] {
  if (!information.isDirectory() || information.isSymbolicLink()) {
    throw new Error("Publication state contains an unsafe directory.");
  }
  return {
    device: information.dev.toString(),
    inode: information.ino.toString(),
    mode: information.mode.toString(),
  };
}

function journalFile(
  name: (typeof EXACT_OUTPUT_NAMES)[number],
  fileIdentity: FileIdentity,
  fileSha256: string,
): JournalFile {
  return {
    device: fileIdentity.device.toString(),
    inode: fileIdentity.inode.toString(),
    links: "1",
    mode: fileIdentity.mode.toString(),
    modifiedNs: fileIdentity.modifiedNs.toString(),
    name,
    sha256: fileSha256,
    size: fileIdentity.size.toString(),
  };
}

function journalFileMatches(
  expected: JournalFile,
  actual: Readonly<{ readonly identity: FileIdentity; readonly sha256: string }>,
): boolean {
  return (
    expected.device === actual.identity.device.toString() &&
    expected.inode === actual.identity.inode.toString() &&
    expected.links === actual.identity.links.toString() &&
    expected.mode === actual.identity.mode.toString() &&
    expected.modifiedNs === actual.identity.modifiedNs.toString() &&
    expected.sha256 === actual.sha256 &&
    expected.size === actual.identity.size.toString()
  );
}

function journalDirectoryMatches(
  expected: PublicationJournal["outputDirectory"],
  actual: BigIntStats,
): boolean {
  return (
    actual.isDirectory() &&
    !actual.isSymbolicLink() &&
    expected.device === actual.dev.toString() &&
    expected.inode === actual.ino.toString() &&
    expected.mode === actual.mode.toString()
  );
}

function bundlePairId(bytes: Uint8Array): string | undefined {
  return /const __easyedaBundlePairId = "([a-f0-9]{64})";/u.exec(
    Buffer.from(bytes).toString("utf8"),
  )?.[1];
}

function originalPairId(states: readonly OriginalOutput[]): string | null {
  const presentCount = states.filter((state) => state.identity !== undefined).length;
  if (presentCount !== 0 && presentCount !== EXACT_OUTPUT_NAMES.length) {
    throw new Error("The admitted original bundle output set is incomplete.");
  }
  const pairIds = states.map((state) =>
    state.bytes === undefined ? undefined : bundlePairId(state.bytes),
  );
  const defined = pairIds.filter((value): value is string => value !== undefined);
  if (defined.length === 0) {
    return null;
  }
  if (
    defined.length !== EXACT_OUTPUT_NAMES.length ||
    new Set(defined).size !== 1
  ) {
    throw new Error("The admitted original bundle outputs have a mixed pair identity.");
  }
  return defined[0] ?? null;
}

async function processStartTicks(pid: number): Promise<string | undefined> {
  let bytes: Buffer;
  try {
    const captured = await readSafeSingleLinkFile(
      `/proc/${pid}/stat`,
      `The process identity for PID ${pid}`,
    );
    bytes = captured.bytes;
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return undefined;
    }
    throw new Error(`Cannot prove the process identity for PID ${pid}.`, {
      cause: error,
    });
  }
  const record = bytes.toString("utf8");
  const commandEnd = record.lastIndexOf(") ");
  const fields = commandEnd === -1
    ? []
    : record.slice(commandEnd + 2).trim().split(/\s+/u);
  const ticks = fields[19];
  if (ticks === undefined || !unsignedIntegerSchema.safeParse(ticks).success) {
    throw new Error(`The process identity record for PID ${pid} is malformed.`);
  }
  return ticks;
}

async function systemBootId(): Promise<string> {
  const captured = await readSafeSingleLinkFile(
    "/proc/sys/kernel/random/boot_id",
    "The Linux boot identity",
  );
  return bootIdSchema.parse(captured.bytes.toString("utf8").trim());
}

function publicationJournalBytes(journal: PublicationJournal): Buffer {
  return Buffer.from(`${JSON.stringify(journal)}\n`, "utf8");
}

function publicationCommitReady(
  journal: PublicationJournal,
): PublicationCommitReady {
  return {
    journalSha256: sha256(publicationJournalBytes(journal)),
    newOutputs: journal.newOutputs,
    newPairId: journal.newPairId,
    schema: PUBLICATION_COMMIT_READY_SCHEMA,
  };
}

function publicationCommitReadyBytes(
  marker: PublicationCommitReady,
): Buffer {
  return Buffer.from(`${JSON.stringify(marker)}\n`, "utf8");
}

function isPrivatePublicationFile(fileIdentity: FileIdentity): boolean {
  return fileIdentity.mode % 512n === BigInt(PRIVATE_PUBLICATION_FILE_MODE);
}

async function writePublicationJournal(
  candidateRoot: string,
  journal: PublicationJournal,
): Promise<void> {
  const path = join(candidateRoot, PUBLICATION_JOURNAL_NAME);
  const flags =
    // oxlint-disable-next-line eslint/no-bitwise -- Node open(2) flags must be combined bitwise.
    fsConstants.O_WRONLY |
    fsConstants.O_CREAT |
    fsConstants.O_EXCL |
    fsConstants.O_NOFOLLOW;
  const handle = await open(path, flags, PRIVATE_PUBLICATION_FILE_MODE);
  try {
    await handle.writeFile(publicationJournalBytes(journal));
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function readPublicationJournal(
  lockRoot: string,
): Promise<PublicationJournal> {
  const directoryEntries = await readdir(lockRoot);
  const entries = directoryEntries.toSorted();
  const requiredEntries = [
    PUBLICATION_JOURNAL_NAME,
    PUBLICATION_TRANSACTION_NAME,
  ].toSorted();
  const committedEntries = [
    ...requiredEntries,
    PUBLICATION_COMMIT_READY_NAME,
  ].toSorted();
  if (
    JSON.stringify(entries) !== JSON.stringify(requiredEntries) &&
    JSON.stringify(entries) !== JSON.stringify(committedEntries)
  ) {
    throw new Error(
      `The publication lock contains unknown material: ${JSON.stringify(entries)}.`,
    );
  }
  const captured = await readSafeSingleLinkFile(
    join(lockRoot, PUBLICATION_JOURNAL_NAME),
    "The publication journal",
  );
  const journal = publicationJournalSchema.parse(
    JSON.parse(captured.bytes.toString("utf8")),
  );
  if (!captured.bytes.equals(publicationJournalBytes(journal))) {
    throw new Error("The publication journal is not in its exact canonical form.");
  }
  for (const [index, name] of EXACT_OUTPUT_NAMES.entries()) {
    if (
      journal.oldOutputs[index]?.name !== name &&
      journal.oldOutputs[index] !== null
    ) {
      throw new Error("The publication journal has misordered old outputs.");
    }
    if (journal.newOutputs[index]?.name !== name) {
      throw new Error("The publication journal has misordered new outputs.");
    }
  }
  return journal;
}

async function hasExactCommitReadyMarker(
  lockRoot: string,
  journal: PublicationJournal,
): Promise<boolean> {
  try {
    const captured = await readSafeSingleLinkFile(
      join(lockRoot, PUBLICATION_COMMIT_READY_NAME),
      "The publication commit-ready marker",
    );
    if (!isPrivatePublicationFile(captured.identity)) {
      return false;
    }
    const candidate: unknown = JSON.parse(captured.bytes.toString("utf8"));
    const parsed = publicationCommitReadySchema.safeParse(candidate);
    if (!parsed.success) {
      return false;
    }
    const expected = publicationCommitReady(journal);
    return (
      JSON.stringify(parsed.data) === JSON.stringify(expected) &&
      captured.bytes.equals(publicationCommitReadyBytes(expected))
    );
  } catch {
    return false;
  }
}

async function writeCommitReadyMarker(
  lockRoot: string,
  lockHandle: Awaited<ReturnType<typeof open>>,
  journal: PublicationJournal,
): Promise<void> {
  const path = join(lockRoot, PUBLICATION_COMMIT_READY_NAME);
  const marker = publicationCommitReady(journal);
  const bytes = publicationCommitReadyBytes(marker);
  const flags =
    // oxlint-disable-next-line eslint/no-bitwise -- Node open(2) flags must be combined bitwise.
    fsConstants.O_WRONLY |
    fsConstants.O_CREAT |
    fsConstants.O_EXCL |
    fsConstants.O_NOFOLLOW;
  const handle = await open(path, flags, PRIVATE_PUBLICATION_FILE_MODE);
  try {
    await handle.writeFile(bytes);
    await handle.sync();
    const information = await handle.stat({ bigint: true });
    const fileIdentity = identity(information);
    if (
      !information.isFile() ||
      information.nlink !== 1n ||
      information.size !== BigInt(bytes.length) ||
      !isPrivatePublicationFile(fileIdentity)
    ) {
      throw new Error("The publication commit-ready marker has an unsafe identity.");
    }
  } finally {
    await handle.close();
  }
  await lockHandle.sync();
  if (!(await hasExactCommitReadyMarker(lockRoot, journal))) {
    throw new Error("The publication commit-ready marker is not exact.");
  }
}

async function removeCommitReadyMarker(lockRoot: string): Promise<void> {
  const path = join(lockRoot, PUBLICATION_COMMIT_READY_NAME);
  let captured: Awaited<ReturnType<typeof readSafeSingleLinkFile>>;
  try {
    captured = await readSafeSingleLinkFile(
      path,
      "The retiring publication commit-ready marker",
    );
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return;
    }
    throw error;
  }
  if (!isPrivatePublicationFile(captured.identity)) {
    throw new Error("The retiring publication commit-ready marker is not private.");
  }
  const current = await readSafeSingleLinkFile(
    path,
    "The retiring publication commit-ready marker",
  );
  if (!sameIdentity(captured.identity, current.identity)) {
    throw new Error("The publication commit-ready marker changed before cleanup.");
  }
  await unlink(path);
}

type ObservedFileState = "absent" | "new" | "old";

async function observedFileState(
  path: string,
  label: string,
  oldRecord: JournalFile | null,
  newRecord: JournalFile,
  oldPairId: string | null,
  newPairId: string,
): Promise<ObservedFileState> {
  let captured: Awaited<ReturnType<typeof readSafeSingleLinkFile>>;
  try {
    captured = await readSafeSingleLinkFile(path, label);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return "absent";
    }
    throw error;
  }
  const actual = {
    identity: captured.identity,
    sha256: sha256(captured.bytes),
  };
  if (oldRecord !== null && journalFileMatches(oldRecord, actual)) {
    if (bundlePairId(captured.bytes) !== (oldPairId ?? undefined)) {
      throw new Error(`${label} has an old pair marker inconsistent with the journal.`);
    }
    return "old";
  }
  if (journalFileMatches(newRecord, actual)) {
    if (bundlePairId(captured.bytes) !== newPairId) {
      throw new Error(`${label} has a new pair marker inconsistent with the journal.`);
    }
    return "new";
  }
  throw new Error(`${label} is not bound to the publication journal.`);
}

interface PublicationObservation {
  readonly final: ObservedFileState;
  readonly old: ObservedFileState;
  readonly staged: ObservedFileState;
}

async function observePublication(
  outputRoot: string,
  transactionRoot: string,
  journal: PublicationJournal,
): Promise<readonly PublicationObservation[]> {
  const allowedEntries = new Set(
    EXACT_OUTPUT_NAMES.flatMap((name) => [`${name}.new`, `${name}.old`]),
  );
  const transactionEntries = await readdir(transactionRoot);
  if (transactionEntries.some((entry) => !allowedEntries.has(entry))) {
    throw new Error(
      `The publication transaction contains unknown material: ${JSON.stringify(transactionEntries.toSorted())}.`,
    );
  }
  const observations: PublicationObservation[] = [];
  for (const [index, name] of EXACT_OUTPUT_NAMES.entries()) {
    const oldRecord = journal.oldOutputs[index] ?? null;
    const newRecord = journal.newOutputs[index];
    if (newRecord === undefined) {
      throw new Error("The publication journal is missing a new output.");
    }
    const [final, old, staged] = await Promise.all([
      observedFileState(
        join(outputRoot, name),
        `Published bundle output ${name}`,
        oldRecord,
        newRecord,
        journal.oldPairId,
        journal.newPairId,
      ),
      observedFileState(
        join(transactionRoot, `${name}.old`),
        `Retired bundle output ${name}`,
        oldRecord,
        newRecord,
        journal.oldPairId,
        journal.newPairId,
      ),
      observedFileState(
        join(transactionRoot, `${name}.new`),
        `Staged bundle output ${name}`,
        oldRecord,
        newRecord,
        journal.oldPairId,
        journal.newPairId,
      ),
    ]);
    const oldCount = [final, old, staged].filter((state) => state === "old").length;
    const newCount = [final, old, staged].filter((state) => state === "new").length;
    if (
      oldCount !== (oldRecord === null ? 0 : 1) ||
      newCount !== 1 ||
      old === "new" ||
      staged === "old"
    ) {
      throw new Error(`Publication state for ${name} violates the journal.`);
    }
    observations.push({ final, old, staged });
  }
  return observations;
}

function assertNewPublicationReady(
  observations: readonly PublicationObservation[],
  journal: PublicationJournal,
): void {
  for (const [index, observation] of observations.entries()) {
    if (
      observation.final !== "new" ||
      observation.old !== (journal.oldOutputs[index] === null ? "absent" : "old") ||
      observation.staged !== "absent"
    ) {
      throw new Error(
        "The new bundle pair is not in its exact commit-ready publication state.",
      );
    }
  }
}

async function restoreOldPublication(
  outputRoot: string,
  transactionRoot: string,
  journal: PublicationJournal,
  observations: readonly PublicationObservation[],
): Promise<void> {
  for (const [index, name] of EXACT_OUTPUT_NAMES.entries()) {
    if (observations[index]?.final === "new") {
      await rename(
        join(outputRoot, name),
        join(transactionRoot, `${name}.new`),
      );
    }
  }
  for (const [index, name] of EXACT_OUTPUT_NAMES.entries()) {
    const oldRecord = journal.oldOutputs[index] ?? null;
    if (oldRecord !== null && observations[index]?.old === "old") {
      await rename(
        join(transactionRoot, `${name}.old`),
        join(outputRoot, name),
      );
    }
  }
  const restored = await observePublication(outputRoot, transactionRoot, journal);
  for (const [index, observation] of restored.entries()) {
    const expectsOld = journal.oldOutputs[index] !== null;
    if (
      observation.final !== (expectsOld ? "old" : "absent") ||
      observation.old !== "absent" ||
      observation.staged !== "new"
    ) {
      throw new Error("The original bundle pair could not be restored exactly.");
    }
  }
}

async function removeSettledTransactionFiles(
  transactionRoot: string,
  journal: PublicationJournal,
  committedNew: boolean,
): Promise<void> {
  const expectedEntries = EXACT_OUTPUT_NAMES.flatMap((name, index) => {
    if (committedNew) {
      return journal.oldOutputs[index] === null ? [] : [`${name}.old`];
    }
    return [`${name}.new`];
  }).toSorted();
  const currentEntries = await readdir(transactionRoot);
  const admittedEntries = currentEntries.toSorted();
  if (JSON.stringify(admittedEntries) !== JSON.stringify(expectedEntries)) {
    throw new Error(
      `The settled transaction file set is not exact: ${JSON.stringify(admittedEntries)}.`,
    );
  }
  for (const [index, name] of EXACT_OUTPUT_NAMES.entries()) {
    const suffix = committedNew ? "old" : "new";
    const expected = committedNew
      ? journal.oldOutputs[index] ?? null
      : journal.newOutputs[index] ?? null;
    if (expected !== null) {
      const path = join(transactionRoot, `${name}.${suffix}`);
      const state = await observedFileState(
        path,
        `Settled transaction output ${name}.${suffix}`,
        committedNew ? expected : null,
        committedNew ? journal.newOutputs[index] ?? expected : expected,
        committedNew ? journal.oldPairId : null,
        journal.newPairId,
      );
      if (state !== (committedNew ? "old" : "new")) {
        throw new Error(`The settled transaction output is missing: ${name}.${suffix}.`);
      }
      await unlink(path);
    }
  }
  const remaining = await readdir(transactionRoot);
  if (remaining.length > 0) {
    throw new Error(
      `The settled transaction retains unknown material: ${JSON.stringify(remaining.toSorted())}.`,
    );
  }
}

async function retireAndCleanPublicationLock(
  serverRoot: string,
  serverRootHandle: Awaited<ReturnType<typeof open>>,
  lockPath: string,
  lockHandle: Awaited<ReturnType<typeof open>>,
  transactionHandle: Awaited<ReturnType<typeof open>>,
  journal: PublicationJournal,
  committedNew: boolean,
  afterLockRetired?: () => Promise<unknown>,
): Promise<void> {
  const lockRoot = `/proc/self/fd/${lockHandle.fd}`;
  const transactionRoot = `/proc/self/fd/${transactionHandle.fd}`;
  const admittedJournal = await readPublicationJournal(lockRoot);
  if (JSON.stringify(admittedJournal) !== JSON.stringify(journal)) {
    throw new Error("The publication journal changed before lock retirement.");
  }
  const hasCommitReadyMarker = await hasExactCommitReadyMarker(lockRoot, journal);
  if (committedNew && !hasCommitReadyMarker) {
    throw new Error(
      "The new bundle pair has no exact durable commit-ready marker.",
    );
  }
  const cleanupPath = join(
    serverRoot,
    `${PUBLICATION_CLEANUP_PREFIX}${randomBytes(16).toString("hex")}`,
  );
  await assertDirectoryHandleCurrent(
    lockHandle,
    lockPath,
    "The retiring bundle publication lock",
  );
  await rename(lockPath, cleanupPath);
  await assertDirectoryHandleCurrent(
    lockHandle,
    cleanupPath,
    "The retired bundle publication lock",
  );
  await serverRootHandle.sync();
  await afterLockRetired?.();
  await removeSettledTransactionFiles(
    transactionRoot,
    journal,
    committedNew,
  );
  await transactionHandle.sync();
  await transactionHandle.close();
  await rmdir(join(lockRoot, PUBLICATION_TRANSACTION_NAME));
  await removeCommitReadyMarker(lockRoot);
  await unlink(join(lockRoot, PUBLICATION_JOURNAL_NAME));
  await lockHandle.sync();
  await assertDirectoryHandleCurrent(
    lockHandle,
    cleanupPath,
    "The emptied bundle publication cleanup directory",
  );
  await rmdir(cleanupPath);
  await lockHandle.close();
  await serverRootHandle.sync();
}

async function settlePublication(
  serverRoot: string,
  serverRootHandle: Awaited<ReturnType<typeof open>>,
  lockPath: string,
  lockHandle: Awaited<ReturnType<typeof open>>,
  outputRootHandle: Awaited<ReturnType<typeof open>>,
  journal: PublicationJournal,
  mode: "auto" | "rollback",
): Promise<void> {
  const lockRoot = `/proc/self/fd/${lockHandle.fd}`;
  const lockInformation = await lockHandle.stat({ bigint: true });
  if (!journalDirectoryMatches(journal.lockDirectory, lockInformation)) {
    throw new Error("The publication lock directory identity changed.");
  }
  const transactionPath = join(lockRoot, PUBLICATION_TRANSACTION_NAME);
  const rootFlags =
    // oxlint-disable-next-line eslint/no-bitwise -- Node open(2) flags must be combined bitwise.
    fsConstants.O_RDONLY | fsConstants.O_DIRECTORY | fsConstants.O_NOFOLLOW;
  const transactionHandle = await open(transactionPath, rootFlags);
  const transactionInformation = await transactionHandle.stat({ bigint: true });
  if (!journalDirectoryMatches(journal.transactionDirectory, transactionInformation)) {
    await transactionHandle.close();
    throw new Error("The publication transaction directory identity changed.");
  }
  const transactionRoot = `/proc/self/fd/${transactionHandle.fd}`;
  try {
    const observations = await observePublication(
      `/proc/self/fd/${outputRootHandle.fd}`,
      transactionRoot,
      journal,
    );
    const hasCommitReadyMarker =
      mode === "auto" && await hasExactCommitReadyMarker(lockRoot, journal);
    const committedNew =
      mode === "auto" &&
      hasCommitReadyMarker &&
      observations.every((observation) => observation.final === "new");
    if (!committedNew) {
      await restoreOldPublication(
        `/proc/self/fd/${outputRootHandle.fd}`,
        transactionRoot,
        journal,
        observations,
      );
    }
    await outputRootHandle.sync();
    const finalObservations = await observePublication(
      `/proc/self/fd/${outputRootHandle.fd}`,
      transactionRoot,
      journal,
    );
    const expectedFinal = committedNew ? "new" : "old";
    if (
      finalObservations.some((observation, index) =>
        observation.final !==
        (committedNew || journal.oldOutputs[index] !== null
          ? expectedFinal
          : "absent"),
      )
    ) {
      throw new Error("The publication recovery result is not a complete pair.");
    }
    await retireAndCleanPublicationLock(
      serverRoot,
      serverRootHandle,
      lockPath,
      lockHandle,
      transactionHandle,
      journal,
      committedNew,
    );
  } catch (error) {
    try {
      await transactionHandle.close();
    } catch {
      // The original recovery error is the actionable fail-closed result.
    }
    throw error;
  }
}

async function recoverStalePublication(
  serverRoot: string,
  serverRootHandle: Awaited<ReturnType<typeof open>>,
  outputRootHandle: Awaited<ReturnType<typeof open>>,
): Promise<boolean> {
  const lockPath = join(serverRoot, PUBLICATION_LOCK_NAME);
  let lockInformation: BigIntStats;
  try {
    lockInformation = await lstat(lockPath, { bigint: true });
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return false;
    }
    throw error;
  }
  if (lockInformation.isSymbolicLink() || !lockInformation.isDirectory()) {
    throw new Error("The bundle publication lock is unsafe.");
  }
  const rootFlags =
    // oxlint-disable-next-line eslint/no-bitwise -- Node open(2) flags must be combined bitwise.
    fsConstants.O_RDONLY | fsConstants.O_DIRECTORY | fsConstants.O_NOFOLLOW;
  const lockHandle = await open(lockPath, rootFlags);
  try {
    await assertDirectoryHandleCurrent(
      lockHandle,
      lockPath,
      "The bundle publication lock",
    );
    const journal = await readPublicationJournal(`/proc/self/fd/${lockHandle.fd}`);
    const currentBootId = await systemBootId();
    const currentOwnerTicks = journal.ownerBootId === currentBootId
      ? await processStartTicks(journal.ownerPid)
      : undefined;
    if (
      journal.ownerBootId === currentBootId &&
      currentOwnerTicks === journal.ownerStartTicks
    ) {
      throw new Error("Another bundle publication is active.");
    }
    const outputInformation = await outputRootHandle.stat({ bigint: true });
    if (!journalDirectoryMatches(journal.outputDirectory, outputInformation)) {
      throw new Error("The publication output directory identity changed.");
    }
    await settlePublication(
      serverRoot,
      serverRootHandle,
      lockPath,
      lockHandle,
      outputRootHandle,
      journal,
      "auto",
    );
    return true;
  } catch (error) {
    try {
      await lockHandle.close();
    } catch {
      // Preserve the primary fail-closed recovery error.
    }
    throw error;
  }
}

async function publishReleaseSet(
  outputRoot: string,
  outputs: readonly ReleaseOutput[],
  options: Readonly<BuildServerOptions>,
  assertReleaseInputsCurrent: () => Promise<void>,
): Promise<void> {
  const serverRoot = dirname(outputRoot);
  const rootFlags =
    // oxlint-disable-next-line eslint/no-bitwise -- Node open(2) flags must be combined bitwise.
    fsConstants.O_RDONLY | fsConstants.O_DIRECTORY | fsConstants.O_NOFOLLOW;
  const serverRootPathBefore = await lstat(serverRoot, { bigint: true });
  if (
    serverRootPathBefore.isSymbolicLink() ||
    !serverRootPathBefore.isDirectory()
  ) {
    throw new Error(`The bundle server root is not a regular directory: ${serverRoot}.`);
  }
  const serverRootHandle = await open(serverRoot, rootFlags);
  const serverDescriptorRoot = `/proc/self/fd/${serverRootHandle.fd}`;
  const descriptorOutputPath = join(serverDescriptorRoot, "dist");
  let outputRootPathBefore: BigIntStats;
  let outputRootHandle: Awaited<ReturnType<typeof open>>;
  try {
    try {
      await mkdir(descriptorOutputPath, { mode: 0o700 });
    } catch (error) {
      if (errorCode(error) !== "EEXIST") {
        throw error;
      }
    }
    outputRootPathBefore = await lstat(outputRoot, { bigint: true });
    if (
      outputRootPathBefore.isSymbolicLink() ||
      !outputRootPathBefore.isDirectory()
    ) {
      throw new Error(`The bundle output root is not a regular directory: ${outputRoot}.`);
    }
    outputRootHandle = await open(descriptorOutputPath, rootFlags);
  } catch (error) {
    await serverRootHandle.close();
    throw error;
  }
  const descriptorRoot = `/proc/self/fd/${outputRootHandle.fd}`;
  const lockPath = join(serverDescriptorRoot, PUBLICATION_LOCK_NAME);
  const candidateName = `${PUBLICATION_CANDIDATE_PREFIX}${randomBytes(16).toString("hex")}`;
  const candidatePath = join(serverDescriptorRoot, candidateName);
  let candidateHandle: Awaited<ReturnType<typeof open>> | undefined;
  let transactionHandle: Awaited<ReturnType<typeof open>> | undefined;
  let candidateJournal: PublicationJournal | undefined;
  let lockAcquired = false;
  let publicationLockWasAcquired = false;
  let publicationMutationStarted = false;
  try {
    const recoveredStalePublication = await recoverStalePublication(
      serverDescriptorRoot,
      serverRootHandle,
      outputRootHandle,
    );
    if (recoveredStalePublication) {
      await options.afterStalePublicationRecoveryForTesting?.();
    }
    const descriptorInformation = await outputRootHandle.stat({ bigint: true });
    if (!sameDirectoryIdentity(outputRootPathBefore, descriptorInformation)) {
      throw new Error("The bundle output root changed during descriptor admission.");
    }
    await assertDirectoryHandleCurrent(
      serverRootHandle,
      serverRoot,
      "The bundle server root",
    );
    const originalStates = await Promise.all(
      outputs.map((output) => captureOriginalOutput(descriptorRoot, output.name)),
    );
    const oldPairId = originalPairId(originalStates);
    await mkdir(candidatePath, { mode: 0o700 });
    candidateHandle = await open(candidatePath, rootFlags);
    const candidateRoot = `/proc/self/fd/${candidateHandle.fd}`;
    const transactionPath = join(candidateRoot, PUBLICATION_TRANSACTION_NAME);
    await mkdir(transactionPath, { mode: 0o700 });
    transactionHandle = await open(transactionPath, rootFlags);
    const transactionRoot = `/proc/self/fd/${transactionHandle.fd}`;
    const stagedIdentities = await Promise.all(
      outputs.map((output) => writeStagedOutput(transactionRoot, output)),
    );
    const ownerBootId = await systemBootId();
    const ownerStartTicks = await processStartTicks(process.pid);
    if (ownerStartTicks === undefined) {
      throw new Error("The build process identity disappeared during publication.");
    }
    const newPairIds = outputs.map((output) => bundlePairId(output.bytes));
    if (
      newPairIds.some((value) => value === undefined) ||
      new Set(newPairIds).size !== 1
    ) {
      throw new Error("The staged bundle outputs have a mixed pair identity.");
    }
    const serverOutput = outputs[0];
    const supervisorOutput = outputs[1];
    const stagedServerIdentity = stagedIdentities[0];
    const stagedSupervisorIdentity = stagedIdentities[1];
    const originalServer = originalStates[0];
    const originalSupervisor = originalStates[1];
    if (
      serverOutput === undefined ||
      supervisorOutput === undefined ||
      stagedServerIdentity === undefined ||
      stagedSupervisorIdentity === undefined ||
      originalServer === undefined ||
      originalSupervisor === undefined
    ) {
      throw new Error("The exact two-output publication set is incomplete.");
    }
    const journal: PublicationJournal = {
      lockDirectory: journalDirectory(
        await candidateHandle.stat({ bigint: true }),
      ),
      newOutputs: [
        journalFile(
          serverOutput.name,
          stagedServerIdentity,
          serverOutput.sha256,
        ),
        journalFile(
          supervisorOutput.name,
          stagedSupervisorIdentity,
          supervisorOutput.sha256,
        ),
      ],
      newPairId: newPairIds[0] ?? "",
      oldOutputs: [
        originalServer.identity === undefined || originalServer.sha256 === undefined
          ? null
          : journalFile(
              originalServer.name,
              originalServer.identity,
              originalServer.sha256,
            ),
        originalSupervisor.identity === undefined ||
        originalSupervisor.sha256 === undefined
          ? null
          : journalFile(
              originalSupervisor.name,
              originalSupervisor.identity,
              originalSupervisor.sha256,
            ),
      ],
      oldPairId,
      outputDirectory: journalDirectory(descriptorInformation),
      ownerBootId,
      ownerPid: process.pid,
      ownerStartTicks,
      schema: PUBLICATION_SCHEMA,
      transactionDirectory: journalDirectory(
        await transactionHandle.stat({ bigint: true }),
      ),
    };
    publicationJournalSchema.parse(journal);
    await writePublicationJournal(candidateRoot, journal);
    candidateJournal = journal;
    await transactionHandle.sync();
    await candidateHandle.sync();
    await serverRootHandle.sync();
    await options.beforePublicationLockAcquisitionForTesting?.();
    try {
      await rename(candidatePath, lockPath);
      lockAcquired = true;
      publicationLockWasAcquired = true;
    } catch (error) {
      if (errorCode(error) === "EEXIST" || errorCode(error) === "ENOTEMPTY") {
        throw new Error("Another bundle publication is active.", { cause: error });
      }
      throw error;
    }
    await serverRootHandle.sync();
    await assertDirectoryHandleCurrent(
      candidateHandle,
      lockPath,
      "The bundle publication lock",
    );
    await options.afterOutputAdmissionForTesting?.();
    const outputRootPathAfterAdmission = await lstat(outputRoot, { bigint: true });
    if (!sameDirectoryIdentity(descriptorInformation, outputRootPathAfterAdmission)) {
      throw new Error("The bundle output root path changed after admission.");
    }
    if (!sameDirectoryIdentity(serverRootPathBefore, await lstat(serverRoot, { bigint: true }))) {
      throw new Error("The bundle server root path changed after admission.");
    }
    await Promise.all(
      originalStates.map((state) => assertOutputState(descriptorRoot, state)),
    );
    await assertReleaseInputsCurrent();
    for (const [index, output] of outputs.entries()) {
      await options.beforeOutputPublicationForTesting?.(output.name, index);
    }
    await assertReleaseInputsCurrent();
    await assertDirectoryHandleCurrent(
      serverRootHandle,
      serverRoot,
      "The bundle server root before publication mutation",
    );
    await assertDirectoryHandleCurrent(
      outputRootHandle,
      outputRoot,
      "The bundle output root before publication mutation",
    );
    publicationMutationStarted = true;
    for (const state of originalStates) {
      if (state.identity !== undefined) {
        await rename(
          join(descriptorRoot, state.name),
          join(transactionRoot, `${state.name}.old`),
        );
      }
    }
    await transactionHandle.sync();
    await outputRootHandle.sync();
    await options.afterOldOutputsRetiredForTesting?.();
    for (const [index, output] of outputs.entries()) {
      await rename(
        join(transactionRoot, `${output.name}.new`),
        join(descriptorRoot, output.name),
      );
      await readPublishedOutput(descriptorRoot, output);
      if (index === 0) {
        await options.afterFirstNewOutputPublishedForTesting?.();
      }
    }
    await outputRootHandle.sync();
    for (const output of outputs) {
      await readPublishedOutput(descriptorRoot, output);
    }
    await transactionHandle.sync();
    await assertReleaseInputsCurrent();
    await options.afterDurableNewOutputsForTesting?.();
    await assertReleaseInputsCurrent();
    await assertDirectoryHandleCurrent(candidateHandle, lockPath, "The bundle publication lock");
    await assertDirectoryHandleCurrent(
      serverRootHandle,
      serverRoot,
      "The bundle server root before commit",
    );
    await assertDirectoryHandleCurrent(
      outputRootHandle,
      outputRoot,
      "The bundle output root before commit",
    );
    await outputRootHandle.sync();
    await transactionHandle.sync();
    assertNewPublicationReady(
      await observePublication(descriptorRoot, transactionRoot, journal),
      journal,
    );
    await assertReleaseInputsCurrent();
    await writeCommitReadyMarker(candidateRoot, candidateHandle, journal);
    await transactionHandle.sync();
    await candidateHandle.sync();
    await serverRootHandle.sync();
    await options.afterCommitReadyMarkerForTesting?.();
    await assertDirectoryHandleCurrent(candidateHandle, lockPath, "The bundle publication lock");
    await assertDirectoryHandleCurrent(
      serverRootHandle,
      serverRoot,
      "The bundle server root after commit-ready marking",
    );
    await assertDirectoryHandleCurrent(
      outputRootHandle,
      outputRoot,
      "The bundle output root after commit-ready marking",
    );
    assertNewPublicationReady(
      await observePublication(descriptorRoot, transactionRoot, journal),
      journal,
    );
    if (!(await hasExactCommitReadyMarker(candidateRoot, journal))) {
      throw new Error("The publication commit-ready marker changed before retirement.");
    }
    await retireAndCleanPublicationLock(
      serverDescriptorRoot,
      serverRootHandle,
      lockPath,
      candidateHandle,
      transactionHandle,
      journal,
      true,
      options.afterPublicationLockRetiredForTesting,
    );
    candidateHandle = undefined;
    transactionHandle = undefined;
    candidateJournal = undefined;
    lockAcquired = false;
  } catch (error) {
    let recoveryError: unknown;
    if (
      candidateHandle !== undefined &&
      transactionHandle !== undefined &&
      candidateJournal !== undefined &&
      !publicationMutationStarted
    ) {
      try {
        await retireAndCleanPublicationLock(
          serverDescriptorRoot,
          serverRootHandle,
          lockAcquired ? lockPath : candidatePath,
          candidateHandle,
          transactionHandle,
          candidateJournal,
          false,
        );
        candidateHandle = undefined;
        transactionHandle = undefined;
        candidateJournal = undefined;
        lockAcquired = false;
      } catch (caughtRecoveryError) {
        recoveryError = caughtRecoveryError;
      }
    } else if (lockAcquired && candidateHandle !== undefined) {
      try {
        await assertDirectoryHandleCurrent(
          serverRootHandle,
          serverRoot,
          "The rollback bundle server root",
        );
        await assertDirectoryHandleCurrent(
          outputRootHandle,
          outputRoot,
          "The rollback bundle output root",
        );
        await assertDirectoryHandleCurrent(
          candidateHandle,
          lockPath,
          "The rollback bundle publication lock",
        );
        const journal = await readPublicationJournal(
          `/proc/self/fd/${candidateHandle.fd}`,
        );
        if (transactionHandle !== undefined) {
          await transactionHandle.close();
          transactionHandle = undefined;
        }
        await settlePublication(
          serverDescriptorRoot,
          serverRootHandle,
          lockPath,
          candidateHandle,
          outputRootHandle,
          journal,
          "rollback",
        );
        candidateHandle = undefined;
        candidateJournal = undefined;
        lockAcquired = false;
      } catch (caughtRecoveryError) {
        recoveryError = caughtRecoveryError;
      }
    }
    if (transactionHandle !== undefined) {
      try {
        await transactionHandle.close();
      } catch {
        // Preserve the primary publication or recovery error.
      }
    }
    if (candidateHandle !== undefined) {
      try {
        await candidateHandle.close();
      } catch {
        // Preserve the primary publication or recovery error.
      }
    }
    if (recoveryError !== undefined) {
      throw new AggregateError(
        [error, recoveryError],
        "Bundle publication failed and exact journal recovery was incomplete.",
        { cause: error },
      );
    }
    if (
      !publicationLockWasAcquired &&
      error instanceof Error &&
      error.message.includes("publication is active")
    ) {
      throw error;
    }
    throw new Error(`Bundle publication failed: ${String(error)}`, {
      cause: error,
    });
  } finally {
    await outputRootHandle.close();
    await serverRootHandle.close();
  }
}

export async function buildServer(
  pluginRoot: string,
  options: Readonly<BuildServerOptions> = {},
): Promise<readonly string[]> {
  const buildHost = await assertBuildHost();
  const sourceRoot = join(pluginRoot, "server", "src");
  const outputRoot = join(pluginRoot, "server", "dist");
  const outputPaths = EXACT_OUTPUT_NAMES.map((name) => join(outputRoot, name));
  const captures = new Map<string, CapturedContainedRegularFile>();
  const resolutionMetadata = await captureResolutionMetadata(pluginRoot);
  await options.afterResolutionMetadataCaptureForTesting?.();
  const buildResult = await build({
    absWorkingDir: pluginRoot,
    banner: { js: bundleBanner(options.bundleBannerSuffixForTesting) },
    bundle: true,
    entryPoints: {
      server: join(sourceRoot, "index.ts"),
      "upstream-supervisor": join(sourceRoot, "upstream-supervisor.ts"),
    },
    format: "esm",
    legalComments: "eof",
    metafile: true,
    nodePaths: [join(pluginRoot, "node_modules")],
    outdir: outputRoot,
    outExtension: { ".js": ".mjs" },
    platform: "node",
    plugins: [capturePlugin(pluginRoot, captures)],
    sourcemap: false,
    target: ["node24"],
    tsconfigRaw: ESBUILD_TSCONFIG_RAW,
    write: false,
  });
  await options.afterInputCaptureForTesting?.([...captures.keys()].toSorted());
  await resolutionMetadata.assertCurrent();
  await assertExactCapturedInputs(buildResult.metafile, pluginRoot, captures);
  const complianceCaptures = await validateBundledNotices(
    buildResult.metafile,
    pluginRoot,
    captures,
  );
  await assertExactCapturedInputs(buildResult.metafile, pluginRoot, captures);
  const bufferedOutputFiles = new Map(
    buildResult.outputFiles.map((file) => [resolve(file.path), file.contents]),
  );
  if (
    bufferedOutputFiles.size !== outputPaths.length ||
    outputPaths.some((path) => !bufferedOutputFiles.has(path))
  ) {
    throw new Error(
      `Buffered bundle outputs differ from the exact release set: ${JSON.stringify([...bufferedOutputFiles.keys()].toSorted())}.`,
    );
  }
  const pairId = pairIdentity(
    pluginRoot,
    buildHost,
    captures,
    complianceCaptures,
    bufferedOutputFiles,
  );
  const releaseOutputs: ReleaseOutput[] = outputPaths.map((path, index) => {
    const bytes = bufferedOutputFiles.get(path);
    const name = EXACT_OUTPUT_NAMES[index];
    if (bytes === undefined || name === undefined) {
      throw new Error(`Missing validated buffered bundle output: ${path}.`);
    }
    const boundBytes = replacePairPlaceholder(bytes, pairId);
    assertNoUnreviewedRuntimeRequires(boundBytes, name);
    return { bytes: boundBytes, name, sha256: sha256(boundBytes) };
  });
  await resolutionMetadata.assertCurrent();
  await assertExactCapturedInputs(buildResult.metafile, pluginRoot, captures);
  const assertReleaseInputsCurrent = async (): Promise<void> => {
    await resolutionMetadata.assertCurrent();
    await assertExactCapturedInputs(buildResult.metafile, pluginRoot, captures);
    for (const captured of complianceCaptures) {
      await captured.assertCurrent();
    }
  };
  await publishReleaseSet(
    outputRoot,
    releaseOutputs,
    options,
    assertReleaseInputsCurrent,
  );
  return outputPaths;
}

const invokedPath = process.argv[1];
if (
  invokedPath !== undefined &&
  resolve(invokedPath) === import.meta.filename
) {
  const outputPaths = await buildServer(resolve(import.meta.dirname, ".."));
  process.stdout.write(`${outputPaths.join("\n")}\n`);
}
