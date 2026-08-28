import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

import { z } from "zod";

const nonemptyStringSchema = z.string().min(1);
const gitRepositorySchema = z.strictObject({
  type: z.literal("git"),
  url: nonemptyStringSchema,
});
const packageMetadataSchema = z.looseObject({
  license: nonemptyStringSchema,
  name: nonemptyStringSchema,
  repository: z.union([nonemptyStringSchema, gitRepositorySchema]),
  version: nonemptyStringSchema,
});

export interface BundledPackage {
  readonly license: string;
  readonly name: string;
  readonly packageRoot: string;
  readonly repository: string;
  readonly version: string;
}

export interface CapturedContainedRegularFile {
  readonly assertCurrent: () => Promise<void>;
  readonly bytes: Buffer;
  readonly path: string;
  readonly sha256: string;
}

interface InstalledPackageRoot {
  readonly expectedName: string;
  readonly path: string;
}

interface PathIdentity {
  readonly ctimeNs: bigint;
  readonly device: bigint;
  readonly inode: bigint;
  readonly mode: bigint;
  readonly modifiedNs: bigint;
  readonly links: bigint;
  readonly size: bigint;
}

interface SampledPath {
  readonly identities: readonly PathIdentity[];
  readonly paths: readonly string[];
}

interface ContainedFileReadHooks {
  readonly afterOpen?: () => Promise<void>;
}

function isWithin(root: string, path: string): boolean {
  const child = relative(root, path);
  return child !== "" && child !== ".." && !child.startsWith(`..${sep}`);
}

function identity(information: BigIntStats): PathIdentity {
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

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function sameIdentity(left: PathIdentity, right: PathIdentity): boolean {
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

async function sampleContainedPath(
  root: string,
  path: string,
  expectedKind: "directory" | "file",
  label: string,
): Promise<SampledPath> {
  const child = relative(root, path);
  if (!isWithin(root, path)) {
    throw new Error(`${label} escapes its admitted root: ${path}.`);
  }
  const rootInformation = await lstat(root, { bigint: true });
  if (
    rootInformation.isSymbolicLink() ||
    !rootInformation.isDirectory()
  ) {
    throw new Error(`${label} has an unsafe admitted root: ${root}.`);
  }
  const paths = [root];
  const identities = [identity(rootInformation)];
  let current = root;
  const segments = child.split(sep);
  for (const [index, segment] of segments.entries()) {
    current = join(current, segment);
    const information = await lstat(current, { bigint: true });
    const final = index === segments.length - 1;
    if (information.isSymbolicLink()) {
      throw new Error(`${label} must not traverse symbolic links: ${path}.`);
    }
    if (
      (!final && !information.isDirectory()) ||
      (final &&
        ((expectedKind === "file" && !information.isFile()) ||
          (expectedKind === "directory" && !information.isDirectory())))
    ) {
      throw new Error(`${label} is not a regular ${expectedKind}: ${path}.`);
    }
    if (final && expectedKind === "file" && information.nlink !== 1n) {
      throw new Error(`${label} must have exactly one hard link: ${path}.`);
    }
    paths.push(current);
    identities.push(identity(information));
  }
  return { identities, paths };
}

function sameSample(left: SampledPath, right: SampledPath): boolean {
  return (
    left.paths.length === right.paths.length &&
    left.paths.every(
      (path, index) =>
        path === right.paths[index] &&
        right.identities[index] !== undefined &&
        left.identities[index] !== undefined &&
        sameIdentity(left.identities[index], right.identities[index]),
    )
  );
}

export async function assertContainedRegularFile(
  root: string,
  path: string,
  label: string,
): Promise<void> {
  await sampleContainedPath(root, path, "file", label);
}

async function captureContainedRegularFileOnce(
  root: string,
  path: string,
  label: string,
  hooks: ContainedFileReadHooks = {},
): Promise<{ readonly bytes: Buffer; readonly sample: SampledPath }> {
  const before = await sampleContainedPath(root, path, "file", label);
  // O_NOFOLLOW prevents final-segment symlink binding during descriptor open.
  const openFlags =
    // oxlint-disable-next-line eslint/no-bitwise -- Node open(2) flags must be combined bitwise.
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW;
  const handle = await open(path, openFlags);
  try {
    const descriptorBeforeInformation = await handle.stat({ bigint: true });
    const descriptorBefore = identity(descriptorBeforeInformation);
    const pathBefore = before.identities.at(-1);
    if (
      pathBefore === undefined ||
      !sameIdentity(pathBefore, descriptorBefore)
    ) {
      throw new Error(`${label} changed before its descriptor was bound: ${path}.`);
    }
    await hooks.afterOpen?.();
    const bytes = await handle.readFile();
    const descriptorAfterInformation = await handle.stat({ bigint: true });
    const descriptorAfter = identity(descriptorAfterInformation);
    let after: SampledPath;
    try {
      after = await sampleContainedPath(root, path, "file", label);
    } catch (error) {
      throw new Error(`${label} changed while it was read: ${path}.`, {
        cause: error,
      });
    }
    const pathAfter = after.identities.at(-1);
    if (
      pathAfter === undefined ||
      !sameIdentity(descriptorBefore, descriptorAfter) ||
      !sameIdentity(descriptorAfter, pathAfter) ||
      !sameSample(before, after)
    ) {
      throw new Error(`${label} changed while it was read: ${path}.`);
    }
    return { bytes, sample: after };
  } finally {
    await handle.close();
  }
}

export async function captureContainedRegularFile(
  root: string,
  path: string,
  label: string,
  hooks: ContainedFileReadHooks = {},
): Promise<CapturedContainedRegularFile> {
  const absolutePath = resolve(path);
  const captured = await captureContainedRegularFileOnce(
    resolve(root),
    absolutePath,
    label,
    hooks,
  );
  const capturedSha256 = sha256(captured.bytes);
  return {
    assertCurrent: async () => {
      const current = await captureContainedRegularFileOnce(
        resolve(root),
        absolutePath,
        label,
      );
      if (
        !sameSample(captured.sample, current.sample) ||
        sha256(current.bytes) !== capturedSha256 ||
        !current.bytes.equals(captured.bytes)
      ) {
        throw new Error(
          `${label} changed after its reviewed bytes were captured: ${absolutePath}.`,
        );
      }
    },
    bytes: captured.bytes,
    path: absolutePath,
    sha256: capturedSha256,
  };
}

export async function readContainedRegularFile(
  root: string,
  path: string,
  label: string,
  hooks: ContainedFileReadHooks = {},
): Promise<Buffer> {
  const captured = await captureContainedRegularFile(root, path, label, hooks);
  return captured.bytes;
}

function installedPackageRoot(
  inputPath: string,
  pluginRoot: string,
): InstalledPackageRoot {
  const nodeModulesRoot = join(pluginRoot, "node_modules");
  const absoluteInputPath = resolve(pluginRoot, inputPath);
  const segments = relative(nodeModulesRoot, absoluteInputPath).split(sep);
  let packageStart = 0;
  for (const [index, segment] of segments.entries()) {
    if (segment === "node_modules") {
      packageStart = index + 1;
    }
  }
  const firstNameSegment = segments[packageStart];
  const scoped = firstNameSegment?.startsWith("@") === true;
  const secondNameSegment = scoped ? segments[packageStart + 1] : undefined;
  const packageSegmentCount = scoped ? 2 : 1;
  const packageEnd = packageStart + packageSegmentCount;
  if (
    firstNameSegment === undefined ||
    firstNameSegment.length === 0 ||
    firstNameSegment === "node_modules" ||
    (scoped && (secondNameSegment === undefined || secondNameSegment.length === 0)) ||
    segments.length <= packageEnd
  ) {
    throw new Error(
      `Bundled third-party input has no exact installed package root: ${inputPath}.`,
    );
  }
  return {
    expectedName:
      scoped && secondNameSegment !== undefined
        ? `${firstNameSegment}/${secondNameSegment}`
        : firstNameSegment,
    path: join(nodeModulesRoot, ...segments.slice(0, packageEnd)),
  };
}

export function canonicalPackageRepository(
  value: string | { readonly url: string },
): string {
  const raw = typeof value === "string" ? value : value.url;
  const expanded = /^[^/\s]+\/[^/\s]+$/u.test(raw)
    ? `https://github.com/${raw}`
    : raw.replace(/^git\+/u, "");
  let parsed: URL;
  try {
    parsed = new URL(expanded);
  } catch (error) {
    throw new Error(`Installed package repository is malformed: ${raw}.`, {
      cause: error,
    });
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.search !== "" ||
    parsed.hash !== ""
  ) {
    throw new Error(
      `Installed package repository must be an uncredentialed HTTPS URL: ${raw}.`,
    );
  }
  const normalizedPath = parsed.pathname.replace(/\.git\/?$/u, "").replace(/\/$/u, "");
  if (normalizedPath.length < 2) {
    throw new Error(`Installed package repository has no repository path: ${raw}.`);
  }
  return `${parsed.origin}${normalizedPath}`;
}

async function requiredInstalledPackage(
  inputPath: string,
  pluginRoot: string,
): Promise<BundledPackage> {
  const nodeModulesRoot = join(pluginRoot, "node_modules");
  const packageRoot = installedPackageRoot(inputPath, pluginRoot);
  await sampleContainedPath(
    nodeModulesRoot,
    packageRoot.path,
    "directory",
    `The installed package root for bundled input ${inputPath}`,
  );
  const absoluteInputPath = resolve(pluginRoot, inputPath);
  await readContainedRegularFile(
    packageRoot.path,
    absoluteInputPath,
    `The bundled package input ${inputPath}`,
  );
  const packagePath = join(packageRoot.path, "package.json");
  let packageText: string;
  try {
    const packageBytes = await readContainedRegularFile(
      packageRoot.path,
      packagePath,
      `The installed package manifest for bundled input ${inputPath}`,
    );
    packageText = packageBytes.toString("utf8");
  } catch (error) {
    throw new Error(
      `Cannot inspect exact installed package metadata for bundled input ${inputPath}: ${packagePath}.`,
      { cause: error },
    );
  }
  let candidate: unknown;
  try {
    candidate = JSON.parse(packageText);
  } catch (error) {
    throw new Error(
      `Bundled input ${inputPath} has malformed package metadata: ${packagePath}.`,
      { cause: error },
    );
  }
  const packageData = packageMetadataSchema.safeParse(candidate);
  if (!packageData.success) {
    throw new Error(
      `Bundled input ${inputPath} has incomplete package attribution metadata: ${packagePath}.`,
      { cause: packageData.error },
    );
  }
  if (packageData.data.name !== packageRoot.expectedName) {
    throw new Error(
      `Bundled input ${inputPath} identifies package ${packageData.data.name}, but its exact installed root requires ${packageRoot.expectedName}: ${packagePath}.`,
    );
  }
  return {
    license: packageData.data.license,
    name: packageData.data.name,
    packageRoot: packageRoot.path,
    repository: canonicalPackageRepository(packageData.data.repository),
    version: packageData.data.version,
  };
}

export async function bundledPackages(
  inputPaths: readonly string[],
  pluginRoot: string,
): Promise<BundledPackage[]> {
  const sourceRoot = join(pluginRoot, "server", "src");
  const nodeModulesRoot = join(pluginRoot, "node_modules");
  const packages = new Map<string, BundledPackage>();
  for (const inputPath of inputPaths) {
    const absoluteInputPath = resolve(pluginRoot, inputPath);
    if (isWithin(sourceRoot, absoluteInputPath)) {
      await readContainedRegularFile(
        sourceRoot,
        absoluteInputPath,
        `The reviewed first-party bundle input ${inputPath}`,
      );
    } else {
      if (!isWithin(nodeModulesRoot, absoluteInputPath)) {
        throw new Error(
          `Bundle input is outside the reviewed first-party source and pinned node_modules trees: ${inputPath}.`,
        );
      }
      const packageData = await requiredInstalledPackage(inputPath, pluginRoot);
      const previous = packages.get(packageData.name);
      if (
        previous !== undefined &&
        (previous.version !== packageData.version ||
          previous.packageRoot !== packageData.packageRoot ||
          previous.repository !== packageData.repository)
      ) {
        throw new Error(
          `Bundle contains multiple installations of ${packageData.name}.`,
        );
      }
      packages.set(packageData.name, packageData);
    }
  }
  return [...packages.values()].toSorted((left, right) =>
    left.name.localeCompare(right.name),
  );
}
