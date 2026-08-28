import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
  chmod,
  cp,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
} from "node:fs/promises";
import { join, posix, relative, sep } from "node:path";

import type { Plugin } from "esbuild";

const IGNORED_BRIDGE_TOP_LEVEL_ENTRIES = new Set(["dist", "node_modules"]);

export const REVIEWED_BRIDGE_SOURCE = {
  repository: "https://github.com/oaslananka/easyeda-mcp-pro",
  commit: "964c05082f1c7c9e8b98f56e967e36bfc3f26128",
  upstreamTreeSha1: "cc8893215e736f9efca78e4216033469008ea8e9",
  closureSha256:
    "ce52ca1bf5b2d3d214454790a24516ae5182f1867851c2786c0269bbc7892680",
  fileCount: 70,
  totalBytes: 847_709,
  derivative: {
    addedFiles: [
      "LICENSE",
      "NOTICE",
      "src/mutual-auth.ts",
      "tests/mutual-auth.test.ts",
      "tsconfig.test.json",
    ],
    modifiedFiles: [
      "CHANGELOG.md",
      "README.md",
      "extension.json",
      "package.json",
      "scripts/build.mjs",
      "scripts/dev-watch.mjs",
      "scripts/package.mjs",
      "src/api-introspection.ts",
      "src/api-runtime.ts",
      "src/binary-result-policy.ts",
      "src/binary-result.ts",
      "src/board-inspection.ts",
      "src/canvas-operations.ts",
      "src/connection-policy.ts",
      "src/design-rule-check-operations.ts",
      "src/dispatcher-domain-router.ts",
      "src/dispatcher-entry.ts",
      "src/dispatcher.ts",
      "src/export-operations.ts",
      "src/index.ts",
      "src/pcb-primitive-state.ts",
      "src/pcb-read-operations.ts",
      "src/pcb-write-operations.ts",
      "src/read-only-operations.ts",
      "src/remote-client.ts",
      "src/runtime-timers.ts",
      "src/schematic-component-inspection.ts",
      "src/schematic-inspection.ts",
      "src/schematic-snapshot-recreation.ts",
      "src/schematic-transaction-operations.ts",
      "src/system-api-operations.ts",
      "src/toolkit.ts",
      "src/utils.ts",
      "tests/api-introspection.test.ts",
      "tests/api-runtime.test.ts",
      "tests/binary-result.test.ts",
      "tests/board-inspection.test.ts",
      "tests/build.test.ts",
      "tests/canvas-operations.test.ts",
      "tests/connection-policy.test.ts",
      "tests/dispatcher-domain-router.test.ts",
      "tests/dispatcher.test.ts",
      "tests/export-operations.test.ts",
      "tests/index-lifecycle.test.ts",
      "tests/manifest.test.ts",
      "tests/pcb-read-operations.test.ts",
      "tests/pcb-write-operations.test.ts",
      "tests/remote-client.test.ts",
      "tests/runtime-timers.test.ts",
      "tests/schematic-component-inspection.test.ts",
      "tests/schematic-inspection.test.ts",
      "tests/schematic-snapshot-recreation.test.ts",
      "tests/schematic-transaction-operations.test.ts",
      "tests/socket-lifecycle.test.ts",
      "tests/system-api-operations.test.ts",
      "tsconfig.json",
      "vitest.config.ts",
    ],
    removedFiles: [
      "scripts/archive.mjs",
      "scripts/checksums.mjs",
      "scripts/reproducible-time.mjs",
      "scripts/verify-dist.mjs",
      "tsconfig.eslint.json",
    ],
    implementationDelta:
      "The derivative uses a private UUID, package/display/menu/socket identity and repository metadata distinct from the stock bridge. Its private build injects an HMAC authentication key and fixed loopback port 49621; the extension uses nonce-bound mutual authentication and removes adjacent-port fallback from its production connection path. A distinct frozen authenticated-runtime marker identifies the hardened runtime family. Persistent runtime reuse requires an exact content-derived authenticated index-bundle ID, authentication-key SHA-256 epoch, and build-specific ownership record; stale, rotated, or shared runtimes are synchronously disconnected, deactivated, deleted, and replaced. Missing, throwing, or asynchronous cleanup fails closed before replacement. The raw key and private backend token are never transmitted to the extension-facing socket. Runtime payloads and trusted envelope fields are validated before use. Strict TypeScript and type-aware lint remediation preserves the ES2020 renderer target and omission-sensitive EasyEDA calls. Nested standalone build, package, and watch commands fail closed; the enclosing facade's hardened `npm run bridge:build` command is the only supported credential-bearing `.eext` publication path. Runtime regression tests build only in memory with synthetic keys.",
    packageDelta:
      'package.json is private, adds "type": "module", pins the root-owned TypeScript 7.0.2, esbuild 0.28.2, and Vitest 4.1.9 toolchain exactly, covers source and tests with strict typechecking, and routes every legacy build script to the fail-closed entry point. Unused standalone archive tooling and its obsolete lint configuration are removed; the repository root lockfile is authoritative.',
    licenseAddition:
      "LICENSE is an exact copy of the upstream repository root MIT license; NOTICE records upstream and derivative attribution",
  },
} as const;

export interface VendoredSourceClosure {
  readonly fileCount: number;
  readonly sha256: string;
  readonly totalBytes: number;
}

interface StagedVendoredPathSeal {
  readonly ctimeNanoseconds: string;
  readonly device: string;
  readonly inode: string;
  readonly kind: "directory" | "file";
  readonly mode: number;
  readonly modifiedNanoseconds: string;
  readonly path: string;
  readonly size: string;
  readonly userId: string;
}

export interface StagedVendoredFile {
  readonly bytes: Buffer;
  readonly path: string;
}

export interface StagedVendoredSourceSnapshot {
  readonly closure: VendoredSourceClosure;
  readonly files: readonly StagedVendoredFile[];
  readonly pathSeals: readonly StagedVendoredPathSeal[];
}

export const SEALED_VENDORED_MEMORY_NAMESPACE =
  "easyeda-reviewed-bridge-memory";

async function collectVendoredFiles(root: string, entry: string): Promise<string[]> {
  const absolute = join(root, entry);
  const information = await lstat(absolute);
  if (information.isFile()) {
    return [absolute];
  }
  if (!information.isDirectory()) {
    throw new Error(`Vendored bridge source contains a non-regular path: ${absolute}`);
  }
  const output: string[] = [];
  const children = await readdir(absolute);
  for (const child of children.toSorted()) {
    if (
      entry !== "." ||
      !IGNORED_BRIDGE_TOP_LEVEL_ENTRIES.has(child)
    ) {
      output.push(...(await collectVendoredFiles(root, join(entry, child))));
    }
  }
  return output;
}

async function collectVendoredDirectories(
  root: string,
  entry: string,
): Promise<string[]> {
  const absolute = join(root, entry);
  const information = await lstat(absolute);
  if (!information.isDirectory()) {
    if (information.isFile()) {
      return [];
    }
    throw new Error(`Vendored bridge source contains a non-regular path: ${absolute}`);
  }
  const output = [absolute];
  const children = await readdir(absolute);
  for (const child of children.toSorted()) {
    if (entry !== "." || !IGNORED_BRIDGE_TOP_LEVEL_ENTRIES.has(child)) {
      output.push(...(await collectVendoredDirectories(root, join(entry, child))));
    }
  }
  return output;
}

async function captureStagedPathSeals(
  root: string,
): Promise<readonly StagedVendoredPathSeal[]> {
  const [filePaths, directories] = await Promise.all([
    collectVendoredFiles(root, "."),
    collectVendoredDirectories(root, "."),
  ]);
  const output: StagedVendoredPathSeal[] = [];
  for (const path of [...filePaths, ...directories].toSorted((left, right) =>
    left.localeCompare(right),
  )) {
    const information = await lstat(path, { bigint: true });
    let kind: StagedVendoredPathSeal["kind"] | undefined;
    if (information.isFile()) {
      kind = "file";
    } else if (information.isDirectory()) {
      kind = "directory";
    }
    if (kind === undefined) {
      throw new Error(`Staged bridge source contains a non-regular path: ${path}`);
    }
    output.push({
      path: relative(root, path).split(sep).join("/") || ".",
      kind,
      device: information.dev.toString(),
      inode: information.ino.toString(),
      mode: Number(information.mode % 512n),
      size: information.size.toString(),
      modifiedNanoseconds: information.mtimeNs.toString(),
      ctimeNanoseconds: information.ctimeNs.toString(),
      userId: information.uid.toString(),
    });
  }
  return output.toSorted((left, right) => left.path.localeCompare(right.path));
}

function vendoredSourceClosureFromFiles(
  files: readonly StagedVendoredFile[],
): VendoredSourceClosure {
  let totalBytes = 0;
  const records = files
    .map((file) => {
      totalBytes += file.bytes.length;
      return {
        path: file.path,
        byteLength: file.bytes.length,
        sha256: createHash("sha256").update(file.bytes).digest("hex"),
      };
    });
  return {
    fileCount: records.length,
    sha256: createHash("sha256")
      .update(JSON.stringify(records))
      .digest("hex"),
    totalBytes,
  };
}

async function readStableStagedFile(
  root: string,
  path: string,
): Promise<StagedVendoredFile> {
  const normalized = relative(root, path).split(sep).join("/");
  const before = await lstat(path, { bigint: true });
  if (
    before.isSymbolicLink() ||
    !before.isFile() ||
    before.nlink !== 1n ||
    Number(before.mode % 512n) !== 0o400 ||
    (typeof process.getuid === "function" &&
      before.uid !== BigInt(process.getuid()))
  ) {
    throw new Error(
      `Staged bridge input is not one owner-owned, sealed regular file: ${normalized}`,
    );
  }
  const handle = await open(
    path,
    fsConstants.O_RDONLY + fsConstants.O_NOFOLLOW,
  );
  try {
    const opened = await handle.stat({ bigint: true });
    if (
      opened.dev !== before.dev ||
      opened.ino !== before.ino ||
      opened.size !== before.size
    ) {
      throw new Error(`Staged bridge input changed before open: ${normalized}`);
    }
    const bytes = await handle.readFile();
    const [after, pathAfter] = await Promise.all([
      handle.stat({ bigint: true }),
      lstat(path, { bigint: true }),
    ]);
    if (
      after.dev !== opened.dev ||
      after.ino !== opened.ino ||
      after.size !== opened.size ||
      after.mtimeNs !== opened.mtimeNs ||
      after.ctimeNs !== opened.ctimeNs ||
      pathAfter.dev !== opened.dev ||
      pathAfter.ino !== opened.ino ||
      bytes.length !== Number(opened.size)
    ) {
      throw new Error(`Staged bridge input changed while read: ${normalized}`);
    }
    return { bytes, path: normalized };
  } finally {
    await handle.close();
  }
}

async function readStableReviewedFile(
  root: string,
  path: string,
): Promise<StagedVendoredFile> {
  const normalized = relative(root, path).split(sep).join("/");
  const before = await lstat(path, { bigint: true });
  if (
    before.isSymbolicLink() ||
    !before.isFile() ||
    before.nlink !== 1n ||
    (typeof process.getuid === "function" &&
      before.uid !== BigInt(process.getuid()))
  ) {
    throw new Error(
      `Reviewed bridge input is not one owner-owned regular file: ${normalized}`,
    );
  }
  const handle = await open(
    path,
    fsConstants.O_RDONLY +
      fsConstants.O_NOFOLLOW +
      fsConstants.O_NONBLOCK,
  );
  try {
    const opened = await handle.stat({ bigint: true });
    if (
      opened.dev !== before.dev ||
      opened.ino !== before.ino ||
      opened.size !== before.size ||
      opened.mode !== before.mode ||
      opened.nlink !== before.nlink ||
      opened.mtimeNs !== before.mtimeNs ||
      opened.ctimeNs !== before.ctimeNs
    ) {
      throw new Error(`Reviewed bridge input changed before open: ${normalized}`);
    }
    const bytes = await handle.readFile();
    const [after, pathAfter] = await Promise.all([
      handle.stat({ bigint: true }),
      lstat(path, { bigint: true }),
    ]);
    if (
      after.dev !== opened.dev ||
      after.ino !== opened.ino ||
      after.size !== opened.size ||
      after.mode !== opened.mode ||
      after.nlink !== 1n ||
      after.mtimeNs !== opened.mtimeNs ||
      after.ctimeNs !== opened.ctimeNs ||
      pathAfter.dev !== opened.dev ||
      pathAfter.ino !== opened.ino ||
      pathAfter.mode !== opened.mode ||
      pathAfter.nlink !== 1n ||
      pathAfter.mtimeNs !== opened.mtimeNs ||
      pathAfter.ctimeNs !== opened.ctimeNs ||
      bytes.length !== Number(opened.size)
    ) {
      throw new Error(`Reviewed bridge input changed while read: ${normalized}`);
    }
    return { bytes, path: normalized };
  } finally {
    await handle.close();
  }
}

async function captureStagedVendoredFiles(
  root: string,
): Promise<readonly StagedVendoredFile[]> {
  const paths = await collectVendoredFiles(root, ".");
  const files: StagedVendoredFile[] = [];
  for (const path of paths) {
    files.push(await readStableStagedFile(root, path));
  }
  return files;
}

function memoryModulePath(
  importPath: string,
  importer: string,
  entryPoint: boolean,
): string {
  const candidate = entryPoint
    ? posix.normalize(importPath)
    : posix.normalize(posix.join(posix.dirname(importer), importPath));
  return candidate.endsWith(".js")
    ? `${candidate.slice(0, -".js".length)}.ts`
    : candidate;
}

export function sealedVendoredMemoryPlugin(
  snapshot: StagedVendoredSourceSnapshot,
): Plugin {
  const sourceFiles = new Map(
    snapshot.files
      .filter((file) => file.path.startsWith("src/") && file.path.endsWith(".ts"))
      .map((file) => [file.path, Buffer.from(file.bytes)]),
  );
  return {
    name: SEALED_VENDORED_MEMORY_NAMESPACE,
    setup(build): void {
      // oxlint-disable-next-line unicorn/require-unicode-regexp -- Esbuild compiles plugin filters with Go's RE2 syntax, which rejects JavaScript's Unicode flag.
      build.onResolve({ filter: /.*/ }, (arguments_) => {
        const entryPoint = arguments_.kind === "entry-point";
        if (
          !entryPoint &&
          (arguments_.namespace !== SEALED_VENDORED_MEMORY_NAMESPACE ||
            !arguments_.path.startsWith("."))
        ) {
          return {
            errors: [
              {
                text: `The sealed bridge build rejected non-relative input ${arguments_.path}.`,
              },
            ],
          };
        }
        const path = memoryModulePath(
          arguments_.path,
          arguments_.importer,
          entryPoint,
        );
        if (
          path.startsWith("../") ||
          path.startsWith("/") ||
          !sourceFiles.has(path)
        ) {
          return {
            errors: [
              { text: `The sealed bridge module is absent: ${path}.` },
            ],
          };
        }
        return { namespace: SEALED_VENDORED_MEMORY_NAMESPACE, path };
      });
      build.onLoad(
        // oxlint-disable-next-line unicorn/require-unicode-regexp -- Esbuild compiles plugin filters with Go's RE2 syntax, which rejects JavaScript's Unicode flag.
        { filter: /.*/, namespace: SEALED_VENDORED_MEMORY_NAMESPACE },
        (arguments_) => {
          const contents = sourceFiles.get(arguments_.path);
          if (contents === undefined) {
            return {
              errors: [
                {
                  text: `The sealed bridge module disappeared: ${arguments_.path}.`,
                },
              ],
            };
          }
          return { contents, loader: "ts" };
        },
      );
    },
  };
}

export function assertSealedVendoredMemoryUnchanged(
  snapshot: StagedVendoredSourceSnapshot,
): void {
  const closure = vendoredSourceClosureFromFiles(snapshot.files);
  assertReviewedVendoredSource(closure);
  if (JSON.stringify(closure) !== JSON.stringify(snapshot.closure)) {
    throw new Error(
      "The sealed in-memory bridge source changed while it was being consumed.",
    );
  }
}

/**
 * Capture the exact reviewed tree directly into process-owned buffers. Two
 * complete path-seal samples bind the bytes to one stable source generation;
 * the content closure then makes the filesystem unnecessary to the build.
 */
export async function captureReviewedVendoredSourceSnapshot(
  root: string,
): Promise<StagedVendoredSourceSnapshot> {
  const sealsBefore = await captureStagedPathSeals(root);
  const paths = await collectVendoredFiles(root, ".");
  const files: StagedVendoredFile[] = [];
  for (const path of paths) {
    files.push(await readStableReviewedFile(root, path));
  }
  const sealsAfter = await captureStagedPathSeals(root);
  if (JSON.stringify(sealsAfter) !== JSON.stringify(sealsBefore)) {
    throw new Error(
      "The reviewed bridge source identity or metadata changed during capture.",
    );
  }
  const closure = vendoredSourceClosureFromFiles(files);
  assertReviewedVendoredSource(closure);
  return { closure, files, pathSeals: sealsAfter };
}

export async function captureVendoredSourceClosure(
  root: string,
): Promise<VendoredSourceClosure> {
  const files = await collectVendoredFiles(root, ".");
  const records = [];
  let totalBytes = 0;
  for (const path of files) {
    const bytes = await readFile(path);
    totalBytes += bytes.length;
    records.push({
      path: relative(root, path).split(sep).join("/"),
      byteLength: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
  return {
    fileCount: records.length,
    sha256: createHash("sha256")
      .update(JSON.stringify(records))
      .digest("hex"),
    totalBytes,
  };
}

export function assertReviewedVendoredSource(
  closure: VendoredSourceClosure,
): void {
  if (
    closure.fileCount !== REVIEWED_BRIDGE_SOURCE.fileCount ||
    closure.totalBytes !== REVIEWED_BRIDGE_SOURCE.totalBytes ||
    closure.sha256 !== REVIEWED_BRIDGE_SOURCE.closureSha256
  ) {
    throw new Error(
      `Vendored bridge source differs from reviewed upstream commit ${REVIEWED_BRIDGE_SOURCE.commit}: ${JSON.stringify(closure)}. Review and refresh the pinned source closure before building.`,
    );
  }
}

export async function stageReviewedVendoredSource(
  sourceRoot: string,
  destinationRoot: string,
): Promise<VendoredSourceClosure> {
  await mkdir(destinationRoot, { mode: 0o700 });
  const entries = await readdir(sourceRoot);
  for (const entry of entries.toSorted()) {
    if (!IGNORED_BRIDGE_TOP_LEVEL_ENTRIES.has(entry)) {
      await cp(join(sourceRoot, entry), join(destinationRoot, entry), {
        dereference: false,
        errorOnExist: true,
        force: false,
        recursive: true,
      });
    }
  }
  const closure = await captureVendoredSourceClosure(destinationRoot);
  assertReviewedVendoredSource(closure);
  return closure;
}

export async function stageSealedReviewedVendoredSource(
  sourceRoot: string,
  destinationRoot: string,
): Promise<StagedVendoredSourceSnapshot> {
  const initialClosure = await stageReviewedVendoredSource(
    sourceRoot,
    destinationRoot,
  );
  const [filePaths, directories] = await Promise.all([
    collectVendoredFiles(destinationRoot, "."),
    collectVendoredDirectories(destinationRoot, "."),
  ]);
  for (const path of filePaths) {
    await chmod(path, 0o400);
  }
  for (const path of directories.toSorted(
    (left, right) => right.length - left.length,
  )) {
    await chmod(path, 0o500);
  }
  const files = await captureStagedVendoredFiles(destinationRoot);
  const closure = vendoredSourceClosureFromFiles(files);
  assertReviewedVendoredSource(closure);
  if (JSON.stringify(closure) !== JSON.stringify(initialClosure)) {
    throw new Error("The staged bridge source changed while it was being sealed.");
  }
  return {
    closure,
    files,
    pathSeals: await captureStagedPathSeals(destinationRoot),
  };
}

export async function assertStagedVendoredSourceUnchanged(
  root: string,
  snapshot: StagedVendoredSourceSnapshot,
): Promise<void> {
  const closure = await captureVendoredSourceClosure(root);
  assertReviewedVendoredSource(closure);
  if (JSON.stringify(closure) !== JSON.stringify(snapshot.closure)) {
    throw new Error("The staged bridge source content changed during the build.");
  }
  const pathSeals = await captureStagedPathSeals(root);
  if (JSON.stringify(pathSeals) !== JSON.stringify(snapshot.pathSeals)) {
    throw new Error(
      "The staged bridge source identity or metadata changed during the build.",
    );
  }
}

export async function prepareStagedVendoredSourceRemoval(
  root: string,
): Promise<void> {
  let directories: string[];
  try {
    directories = await collectVendoredDirectories(root, ".");
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }
    throw error;
  }
  for (const path of directories.toSorted(
    (left, right) => left.length - right.length,
  )) {
    await chmod(path, 0o700);
  }
}
