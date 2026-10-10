import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import type { Stats } from "node:fs";
import { lstat, open, readdir, realpath } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { promisify } from "node:util";
import { z } from "zod";

import { openControlRootCapability } from "./control-root.ts";
import { assertSelfSoftCoreLimitZero } from "./soft-core-limit.ts";

// oxlint-disable-next-line typescript/strict-void-return -- Node execFile returns a child handle while promisify consumes its documented callback result.
const execFileAsync = promisify(execFile);
const PROFILE_MAX_BYTES = 16 * 1024;
const METADATA_MAX_BYTES = 2 * 1024 * 1024;
const NODE_MAX_BYTES = 256 * 1024 * 1024;
export const MACHINE_NODE_VERSION = "24.18.0";
export const MACHINE_PROFILE_ENVIRONMENT_VARIABLE = "EASYEDA_MACHINE_PROFILE";
export const MACHINE_LAUNCHER_RELATIVE_PATH = "scripts/launch-machine.ts";
const pathSchema = z.string().min(2).max(4096).refine(
  // oxlint-disable-next-line typescript/no-misused-spread -- Only detect ASCII control code points; this does not segment or rewrite user text.
  (value) => isAbsolute(value) && resolve(value) === value && ![...value].some((character) => {
    const point = character.codePointAt(0);
    return point === undefined || point < 32 || point === 127;
  }),
);
const versionSchema = z.string().regex(/^[0-9][A-Za-z0-9.+-]{0,127}$/u);
export const machineProfileSchema = z.strictObject({
  schema: z.literal("easyeda-pro-control.machine-profile.v1"),
  platform: z.literal("linux-x64"),
  runtime: z.strictObject({
    nodeExecutable: pathSchema,
    nodeVersion: z.literal(MACHINE_NODE_VERSION),
    nodeSha256: z.string().regex(/^[a-f0-9]{64}$/u),
  }),
  upstream: z.strictObject({
    root: pathSchema,
    entrypoint: pathSchema,
    serverVersion: versionSchema,
  }),
  easyeda: z.strictObject({
    assetsRoot: pathSchema,
    pcbBundleVersion: versionSchema,
    publicApiBundleVersion: versionSchema,
  }),
  controlDirectory: pathSchema,
}).superRefine((profile, context) => {
  if (profile.upstream.entrypoint !== join(profile.upstream.root, "dist", "index.js")) {
    context.addIssue({ code: "custom", message: "Upstream entrypoint must be dist/index.js inside its root." });
  }
});
export type MachineProfile = z.infer<typeof machineProfileSchema>;

export class MachineProfileError extends Error {
  public readonly code: string;
  public constructor(code: string) {
    super(code);
    this.code = code;
    this.name = "MachineProfileError";
  }
}

export interface MachineProfileOptions {
  readonly pluginRoot: string;
  readonly nodeExecutable?: string;
  readonly upstreamRoot?: string;
  readonly assetsRoot?: string;
  readonly controlDirectory?: string;
  readonly pcbBundleVersion?: string;
  readonly publicApiBundleVersion?: string;
}

function assertSupportedHost(): void {
  if (process.platform !== "linux" || process.arch !== "x64") {
    throw new MachineProfileError("machine-profile-requires-linux-x64");
  }
}

function sameFile(left: Stats, right: Stats): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.size === right.size &&
    left.mtimeMs === right.mtimeMs && left.ctimeMs === right.ctimeMs;
}

function sameNodeFile(left: Stats, right: Stats): boolean {
  return sameFile(left, right) && left.mode === right.mode && left.uid === right.uid &&
    left.gid === right.gid && left.nlink === right.nlink;
}

async function canonicalDirectory(input: string): Promise<string> {
  const path = pathSchema.parse(input);
  const information = await lstat(path);
  if (!information.isDirectory() || information.isSymbolicLink() || await realpath(path) !== path) {
    throw new MachineProfileError("machine-directory-not-canonical");
  }
  return path;
}

async function regularFile(path: string, maximumBytes: number, executable = false): Promise<Stats> {
  pathSchema.parse(path);
  const information = await lstat(path);
  if (!information.isFile() || information.isSymbolicLink() || information.size === 0 ||
      information.size > maximumBytes || await realpath(path) !== path) {
    throw new MachineProfileError("machine-file-not-bounded-canonical-regular");
  }
  if (executable && (information.mode % 512 !== 0o755 || Math.floor(information.mode / 512) % 8 !== 0 ||
      (information.uid !== 0 && information.uid !== process.getuid?.()))) {
    throw new MachineProfileError("machine-node-permissions-invalid");
  }
  return information;
}

async function readJson(path: string, maximumBytes: number, privateFile = false): Promise<unknown> {
  const before = await regularFile(path, maximumBytes);
  if (privateFile && (before.mode % 512 !== 0o600 || before.uid !== process.getuid?.() || before.nlink !== 1)) {
    throw new MachineProfileError("machine-profile-file-not-private");
  }
  // oxlint-disable-next-line eslint/no-bitwise -- O_NOFOLLOW is required when admitting a profile or metadata file.
  const file = await open(path, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
  try {
    if (!sameFile(before, await file.stat())) { throw new MachineProfileError("machine-file-changed"); }
    const bytes = Buffer.alloc(maximumBytes + 1);
    const read = await file.read(bytes, 0, bytes.length, 0);
    if (read.bytesRead !== before.size || !sameFile(before, await file.stat()) ||
        !sameFile(before, await lstat(path))) { throw new MachineProfileError("machine-file-changed"); }
    return JSON.parse(bytes.subarray(0, read.bytesRead).toString("utf8"));
  } finally {
    await file.close();
  }
}

async function nodeDescriptorHash(file: FileHandle, before: Stats): Promise<string> {
  const hash = createHash("sha256");
  if (!sameNodeFile(before, await file.stat())) { throw new MachineProfileError("machine-node-changed"); }
  let total = 0;
  for await (const chunk of file.createReadStream({ autoClose: false, start: 0 })) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    total += bytes.length;
    if (total > NODE_MAX_BYTES) { throw new MachineProfileError("machine-node-too-large"); }
    hash.update(bytes);
  }
  if (total !== before.size || !sameNodeFile(before, await file.stat())) { throw new MachineProfileError("machine-node-changed"); }
  return hash.digest("hex");
}

export interface VerifiedMachineNode {
  readonly runtime: Readonly<MachineProfile["runtime"]>;
  readonly descriptorPath: string;
  readonly assertCurrent: () => Promise<void>;
  readonly close: () => Promise<void>;
}

async function retainNodeIdentity(nodeExecutable: string, expectedHash?: string): Promise<VerifiedMachineNode> {
  const before = await regularFile(nodeExecutable, NODE_MAX_BYTES, true);
  // oxlint-disable-next-line eslint/no-bitwise -- Retain the checked executable without following a replaced leaf symlink.
  const file = await open(nodeExecutable, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
  const descriptorPath = `/proc/${process.pid}/fd/${file.fd}`;
  try {
    const nodeSha256 = await nodeDescriptorHash(file, before);
    if (expectedHash !== undefined && nodeSha256 !== expectedHash) {
      // An unadmitted replacement must never execute, even for the version probe.
      throw new MachineProfileError("machine-node-hash-mismatch");
    }
    const assertVersionAndIdentity = async (): Promise<void> => {
      if (!sameNodeFile(before, await regularFile(nodeExecutable, NODE_MAX_BYTES, true)) ||
          !sameNodeFile(before, await file.stat())) {
        throw new MachineProfileError("machine-node-changed");
      }
      await assertSelfSoftCoreLimitZero();
      // Probe and final launch both resolve this same still-open executable descriptor.
      const result = await execFileAsync(descriptorPath, ["--version"], {
        env: { LANG: "C", LC_ALL: "C" }, timeout: 5000, maxBuffer: 1024,
      });
      if (result.stdout.trim() !== `v${MACHINE_NODE_VERSION}` || result.stderr.length > 0 ||
          !sameNodeFile(before, await file.stat()) ||
          !sameNodeFile(before, await regularFile(nodeExecutable, NODE_MAX_BYTES, true))) {
        throw new MachineProfileError("machine-node-version-or-identity-mismatch");
      }
    };
    const assertCurrent = async (): Promise<void> => {
      if (await nodeDescriptorHash(file, before) !== nodeSha256) {
        throw new MachineProfileError("machine-node-changed");
      }
      await assertVersionAndIdentity();
    };
    await assertVersionAndIdentity();
    return Object.freeze({
      runtime: Object.freeze({ nodeExecutable, nodeVersion: MACHINE_NODE_VERSION, nodeSha256 }),
      descriptorPath, assertCurrent, close: async () => { await file.close(); },
    });
  } catch (error) {
    await file.close();
    throw error;
  }
}

/**
 * Retain admission through descriptor-bound execve; close this capability on refusal.
 * Descriptor binding prevents redirection through a replaced executable pathname.
 * Reproof detects observed inode mutations, not future hostile same-UID writes.
 * Immutable executable storage is required for an absolute content guarantee.
 */
export function openVerifiedMachineNode(runtimeInput: MachineProfile["runtime"]): Promise<VerifiedMachineNode> {
  const runtime = machineProfileSchema.shape.runtime.parse(runtimeInput);
  assertSupportedHost();
  return retainNodeIdentity(runtime.nodeExecutable, runtime.nodeSha256);
}

async function nodeIdentity(nodeExecutable: string): Promise<MachineProfile["runtime"]> {
  const node = await retainNodeIdentity(nodeExecutable);
  try {
    return node.runtime;
  } finally {
    await node.close();
  }
}

async function existingCandidate(candidates: readonly string[], code: string): Promise<string> {
  const found: string[] = [];
  for (const candidate of new Set(candidates)) {
    try {
      found.push(await canonicalDirectory(candidate));
    } catch (error) {
      if (error === null || typeof error !== "object" || !("code" in error) || error.code !== "ENOENT") { throw error; }
    }
  }
  if (found.length !== 1 || found[0] === undefined) { throw new MachineProfileError(code); }
  return found[0];
}

async function bundleVersion(root: string, family: string, explicit: string | undefined): Promise<string> {
  const directory = await canonicalDirectory(join(root, family));
  if (explicit !== undefined) {
    const version = versionSchema.parse(explicit);
    await canonicalDirectory(join(directory, version));
    return version;
  }
  const entries = await readdir(directory, { withFileTypes: true });
  if (entries.length > 128) { throw new MachineProfileError("machine-bundle-discovery-too-large"); }
  const versions = entries.filter((entry) => entry.isDirectory() && versionSchema.safeParse(entry.name).success);
  if (versions.length !== 1 || versions[0] === undefined) {
    throw new MachineProfileError("machine-bundle-version-needs-explicit-selection");
  }
  return versions[0].name;
}

async function validateControlDirectory(path: string, allowMissing: boolean): Promise<void> {
  pathSchema.parse(path);
  try {
    await canonicalDirectory(path);
    const information = await lstat(path);
    if (information.mode % 512 !== 0o700 || information.uid !== process.getuid?.()) {
      throw new MachineProfileError("machine-control-directory-not-private");
    }
  } catch (error) {
    if (allowMissing && error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      await canonicalDirectory(dirname(path));
      return;
    }
    throw error;
  }
}

async function validateInstallation(profile: MachineProfile, allowMissingControl: boolean): Promise<void> {
  await canonicalDirectory(profile.upstream.root);
  const packageValue = await readJson(join(profile.upstream.root, "package.json"), METADATA_MAX_BYTES);
  const packageInfo = z.looseObject({ name: z.literal("easyeda-mcp-pro"), version: versionSchema }).parse(packageValue);
  if (packageInfo.version !== profile.upstream.serverVersion) {
    throw new MachineProfileError("machine-upstream-version-mismatch");
  }
  await regularFile(profile.upstream.entrypoint, METADATA_MAX_BYTES);
  await canonicalDirectory(profile.easyeda.assetsRoot);
  const apiRoot = join(profile.easyeda.assetsRoot, "pro-api", profile.easyeda.publicApiBundleVersion);
  for (const path of [
    join(profile.easyeda.assetsRoot, "pro-pcb", profile.easyeda.pcbBundleVersion, "js", "pcb.js"),
    join(apiRoot, "api.js"), join(apiRoot, "api-types.js"), join(apiRoot, "api-types.d.ts"),
  ]) { await regularFile(path, NODE_MAX_BYTES); }
  await validateControlDirectory(profile.controlDirectory, allowMissingControl);
}

export function defaultMachineProfilePath(): string {
  return join(homedir(), ".easyeda-pro-control", "machine-profile.json");
}

/** Discovery proves file locations, not reviewed runtime admission or a live connection. */
export async function createMachineProfile(options: MachineProfileOptions): Promise<MachineProfile> {
  assertSupportedHost();
  const pluginRoot = await canonicalDirectory(options.pluginRoot);
  const nodeExecutable = await realpath(options.nodeExecutable ?? process.execPath);
  const runtime = await nodeIdentity(nodeExecutable);
  const upstreamRoot = options.upstreamRoot === undefined
    ? await existingCandidate([
        join(pluginRoot, "vendor", "easyeda-mcp-pro"),
        resolve(pluginRoot, "../../../easyeda-mcp-pro"),
      ], "machine-upstream-needs-explicit-selection")
    : await canonicalDirectory(options.upstreamRoot);
  const packageInfo = z.looseObject({ name: z.literal("easyeda-mcp-pro"), version: versionSchema }).parse(
    await readJson(join(upstreamRoot, "package.json"), METADATA_MAX_BYTES),
  );
  const assetsRoot = options.assetsRoot === undefined
    ? await existingCandidate([
        "/mnt/c/Program Files/easyeda-pro/resources/app/assets",
        "/opt/easyeda-pro/resources/app/assets",
      ], "machine-assets-need-explicit-selection")
    : await canonicalDirectory(options.assetsRoot);
  const profile = machineProfileSchema.parse({
    schema: "easyeda-pro-control.machine-profile.v1", platform: "linux-x64", runtime,
    upstream: { root: upstreamRoot, entrypoint: join(upstreamRoot, "dist", "index.js"), serverVersion: packageInfo.version },
    easyeda: {
      assetsRoot,
      pcbBundleVersion: await bundleVersion(assetsRoot, "pro-pcb", options.pcbBundleVersion),
      publicApiBundleVersion: await bundleVersion(assetsRoot, "pro-api", options.publicApiBundleVersion),
    },
    controlDirectory: options.controlDirectory ?? dirname(defaultMachineProfilePath()),
  });
  await validateInstallation(profile, true);
  return profile;
}

export async function readMachineProfile(path: string): Promise<MachineProfile> {
  assertSupportedHost();
  await validateControlDirectory(dirname(path), false);
  const profile = machineProfileSchema.parse(await readJson(path, PROFILE_MAX_BYTES, true));
  if (dirname(path) !== profile.controlDirectory) { throw new MachineProfileError("machine-profile-outside-control-directory"); }
  const node = await openVerifiedMachineNode(profile.runtime);
  await node.close();
  await validateInstallation(profile, false);
  return profile;
}

export async function writeMachineProfile(profileInput: unknown, path: string): Promise<void> {
  assertSupportedHost();
  const profile = machineProfileSchema.parse(profileInput);
  pathSchema.parse(path);
  if (dirname(path) !== profile.controlDirectory || !basename(path).endsWith(".json")) {
    throw new MachineProfileError("machine-profile-outside-control-directory");
  }
  const bytes = Buffer.from(`${JSON.stringify(profile, null, 2)}\n`);
  if (bytes.length > PROFILE_MAX_BYTES) { throw new MachineProfileError("machine-profile-too-large"); }
  const capability = await openControlRootCapability(profile.controlDirectory);
  try {
    await capability.assertCurrent();
    // oxlint-disable-next-line eslint/no-bitwise -- Exclusive descriptor-relative creation must reject pre-existing files and symlinks.
    const file = await open(capability.childDescriptorPath(path), fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_EXCL | fsConstants.O_NOFOLLOW, 0o600);
    try {
      await file.writeFile(bytes);
      await file.sync();
    } finally {
      await file.close();
    }
    await capability.handle.sync();
    await capability.assertCurrent();
  } finally {
    await capability.close();
  }
}

export function machineProfileEnvironment(profileInput: unknown): Record<string, string> {
  const profile = machineProfileSchema.parse(profileInput);
  return {
    EASYEDA_CONTROL_DATA_DIR: profile.controlDirectory,
    EASYEDA_BRIDGE_TOKEN_FILE: join(profile.controlDirectory, "bridge-token"),
    EASYEDA_UPSTREAM_COMMAND: profile.runtime.nodeExecutable,
    EASYEDA_UPSTREAM_ARGS_JSON: JSON.stringify([profile.upstream.entrypoint]),
    EASYEDA_UPSTREAM_CWD: profile.upstream.root,
    EASYEDA_ASSETS_ROOT: profile.easyeda.assetsRoot,
    EASYEDA_PCB_BUNDLE_VERSION: profile.easyeda.pcbBundleVersion,
    EASYEDA_PUBLIC_API_BUNDLE_VERSION: profile.easyeda.publicApiBundleVersion,
    EASYEDA_BRIDGE_HOST: "127.0.0.1", EASYEDA_BRIDGE_PORT: "49621", EASYEDA_BRIDGE_PORT_SCAN: "49621",
  };
}

export async function loadRuntimeMachineProfile(options: { readonly profilePath?: string } = {}): Promise<{
  profilePath: string; profile: MachineProfile; environment: Record<string, string>;
}> {
  const profilePath = options.profilePath ?? process.env[MACHINE_PROFILE_ENVIRONMENT_VARIABLE] ?? defaultMachineProfilePath();
  const profile = await readMachineProfile(profilePath);
  return { profilePath, profile, environment: machineProfileEnvironment(profile) };
}

export function machineProfileLaunchConfiguration(profile: MachineProfile, pluginRoot: string): {
  command: string; args: string[]; cwd: string; env: Record<string, string>;
} {
  pathSchema.parse(pluginRoot);
  return {
    command: profile.runtime.nodeExecutable, args: [join(pluginRoot, "server", "dist", "server.mjs")],
    cwd: pluginRoot, env: machineProfileEnvironment(profile),
  };
}
