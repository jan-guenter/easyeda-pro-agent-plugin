import { createHash, randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import type { Stats } from "node:fs";
import { lstat, open, realpath, rename, unlink } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { canonicalJson, loadReviewedCompatibilityManifest } from "./core.ts";
import { openControlRootCapability } from "./control-root.ts";
import {
  MachineProfileError,
  createMachineProfile,
  loadMachineLaunchProfile,
  machineProfileSchema,
  readMachineProfile,
} from "./machine-profile.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { SDK_MATH_RUNTIME_PROFILE } from "./sdk-math-runtime.ts";

const PROFILE_MAX_BYTES = 16 * 1024;
const BUNDLE_MAX_BYTES = 32 * 1024 * 1024;
const APP_PACKAGE_SHA256 = "e349f8d80f809f82a057f1b81799430ba25bfa0f7c7cb96f6155327b49391455";

function sameFile(left: Stats, right: Stats): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.size === right.size &&
    left.mode === right.mode && left.uid === right.uid && left.nlink === right.nlink &&
    left.mtimeMs === right.mtimeMs && left.ctimeMs === right.ctimeMs;
}

async function readPrivateProfile(path: string): Promise<{ bytes: Buffer; information: Stats }> {
  const before = await lstat(path);
  if (!before.isFile() || before.isSymbolicLink() || before.mode % 512 !== 0o600 ||
      before.uid !== process.getuid?.() || before.nlink !== 1 || before.size === 0 || before.size > PROFILE_MAX_BYTES) {
    throw new MachineProfileError("machine-upgrade-profile-not-private");
  }
  // oxlint-disable-next-line eslint/no-bitwise -- Read the checked descriptor-relative leaf without following a symlink replacement.
  const file = await open(path, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
  try {
    if (!sameFile(before, await file.stat())) { throw new MachineProfileError("machine-upgrade-profile-changed"); }
    const bytes = Buffer.alloc(PROFILE_MAX_BYTES + 1);
    const result = await file.read(bytes, 0, bytes.length, 0);
    if (result.bytesRead !== before.size || !sameFile(before, await file.stat()) || !sameFile(before, await lstat(path))) {
      throw new MachineProfileError("machine-upgrade-profile-changed");
    }
    return { bytes: bytes.subarray(0, result.bytesRead), information: before };
  } finally { await file.close(); }
}

async function verifyFileHash(path: string, expected: string): Promise<void> {
  const before = await lstat(path);
  if (!before.isFile() || before.isSymbolicLink() || before.size === 0 || before.size > BUNDLE_MAX_BYTES || await realpath(path) !== path) {
    throw new MachineProfileError("machine-upgrade-installation-not-canonical");
  }
  // oxlint-disable-next-line eslint/no-bitwise -- Hash a retained canonical descriptor, never a substituted symlink.
  const file = await open(path, fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW);
  try {
    if (!sameFile(before, await file.stat())) { throw new MachineProfileError("machine-upgrade-installation-changed"); }
    const hash = createHash("sha256");
    let count = 0;
    for await (const chunk of file.createReadStream({ autoClose: false })) {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
      count += bytes.length;
      if (count > BUNDLE_MAX_BYTES) { throw new MachineProfileError("machine-upgrade-installation-too-large"); }
      hash.update(bytes);
    }
    if (count !== before.size || !sameFile(before, await file.stat()) || !sameFile(before, await lstat(path)) || hash.digest("hex") !== expected) {
      throw new MachineProfileError("machine-upgrade-installation-hash-mismatch");
    }
  } finally { await file.close(); }
}

async function verifyCalculationInstallation(profile: MachineProfile): Promise<void> {
  const assets = profile.easyeda.assetsRoot, pins = SDK_MATH_RUNTIME_PROFILE.installedBundles;
  const api = join(assets, "pro-api", pins.publicApi.version);
  // This exact package identifies app 3.2.206.715d940d independently of bundle
  // Names. Runtime admission still requires the authenticated app-version value.
  const files = [
    [join(dirname(assets), "package.json"), APP_PACKAGE_SHA256],
    [join(assets, "pro-pcb", pins.pcbEditor.version, "js", "pcb.js"), pins.pcbEditor.implementationSha256],
    [join(api, "api.js"), pins.publicApi.implementationSha256],
    [join(api, "api-types.js"), pins.publicApi.adapterSha256],
    [join(api, "api-types.d.ts"), pins.publicApi.declarationsSha256],
  ] as const;
  for (const [path, sha256] of files) { await verifyFileHash(path, sha256); }
}

async function writeExclusive(path: string, bytes: Buffer): Promise<Stats> {
  // oxlint-disable-next-line eslint/no-bitwise -- Never overwrite a retained backup, lock or staging artifact.
  const file = await open(path, fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_EXCL | fsConstants.O_NOFOLLOW, 0o600);
  try {
    await file.chmod(0o600);
    await file.writeFile(bytes);
    await file.sync();
    return await file.stat();
  } finally { await file.close(); }
}

async function removeOwnedFile(path: string, expected: Stats): Promise<void> {
  let current: Stats;
  try { current = await lstat(path); }
  catch (error) {
    if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { return; }
    throw error;
  }
  if (!sameFile(current, expected)) { throw new MachineProfileError("machine-upgrade-artifact-changed"); }
  await unlink(path);
}

export interface CalculationProfileUpgradeReceipt {
  readonly ok: true;
  readonly changed: boolean;
  readonly mode: "calculation-only";
  readonly previousSha256: string;
  readonly profileSha256: string;
  readonly backupFile?: string;
  readonly restartRequired: boolean;
}

/** Explicit configuration migration only. No lease takeover, launcher, bridge,
 * project, token or journal access. A running offline process never promotes.
 * Exact backup bytes remain even if a later stage refuses or is interrupted.
 */
export async function upgradeCalculationProfile(profilePath: string): Promise<CalculationProfileUpgradeReceipt> {
  const loaded = await loadMachineLaunchProfile({ profilePath });
  const original = loaded.profile, pins = SDK_MATH_RUNTIME_PROFILE.installedBundles;
  const legacy = loadReviewedCompatibilityManifest().installedBundles;
  const alreadyNew = original.easyeda.pcbBundleVersion === pins.pcbEditor.version && original.easyeda.publicApiBundleVersion === pins.publicApi.version;
  if (!alreadyNew && (original.easyeda.pcbBundleVersion !== legacy.pcbEditor.version || original.easyeda.publicApiBundleVersion !== legacy.publicApi.version)) {
    throw new MachineProfileError("machine-upgrade-source-generation-unsupported");
  }
  const target = machineProfileSchema.parse({ ...original, easyeda: { ...original.easyeda,
    pcbBundleVersion: pins.pcbEditor.version, publicApiBundleVersion: pins.publicApi.version } });
  const capability = await openControlRootCapability(original.controlDirectory, false);
  const profile = capability.childDescriptorPath(profilePath);
  const lock = capability.childDescriptorPath(join(original.controlDirectory, ".machine-profile-upgrade.lock"));
  const staged = capability.childDescriptorPath(join(original.controlDirectory, `.machine-profile-sdk-math-${randomUUID()}.pending`));
  let lockInfo: Stats | undefined, stagedInfo: Stats | undefined;
  let primaryFailure: unknown;
  try {
    await capability.assertCurrent();
    lockInfo = await writeExclusive(lock, Buffer.from("easyeda-sdk-math-profile-upgrade\n"));
    const before = await readPrivateProfile(profile);
    const parsedBefore: unknown = JSON.parse(before.bytes.toString("utf8"));
    if (canonicalJson(machineProfileSchema.parse(parsedBefore)) !== canonicalJson(original)) {
      throw new MachineProfileError("machine-upgrade-profile-changed");
    }
    const previousSha256 = createHash("sha256").update(before.bytes).digest("hex");
    await verifyCalculationInstallation(target);
    // Check the unchanged upstream, Node and directory configuration before any
    // Profile replacement, even when the old generation can no longer launch.
    const validated = await createMachineProfile({ pluginRoot: original.controlDirectory,
      nodeExecutable: original.runtime.nodeExecutable, upstreamRoot: original.upstream.root,
      assetsRoot: original.easyeda.assetsRoot, controlDirectory: original.controlDirectory,
      pcbBundleVersion: pins.pcbEditor.version, publicApiBundleVersion: pins.publicApi.version });
    if (canonicalJson(validated) !== canonicalJson(target)) { throw new MachineProfileError("machine-upgrade-configuration-changed"); }
    if (alreadyNew) {
      await readMachineProfile(profilePath);
      const unchanged = await readPrivateProfile(profile);
      if (!sameFile(before.information, unchanged.information) || !before.bytes.equals(unchanged.bytes)) { throw new MachineProfileError("machine-upgrade-profile-changed"); }
      return { ok: true, changed: false, mode: "calculation-only", previousSha256, profileSha256: previousSha256, restartRequired: true };
    }
    const backupFile = `${basename(profilePath)}.before-sdk-math-${previousSha256}.json`;
    const backup = capability.childDescriptorPath(join(original.controlDirectory, backupFile));
    try { await writeExclusive(backup, before.bytes); }
    catch (error) { if (error === null || typeof error !== "object" || !("code" in error) || error.code !== "EEXIST") { throw error; } }
    const backupCopy = await readPrivateProfile(backup);
    if (!backupCopy.bytes.equals(before.bytes)) { throw new MachineProfileError("machine-upgrade-backup-conflict"); }
    const bytes = Buffer.from(`${JSON.stringify(target, null, 2)}\n`);
    if (bytes.length > PROFILE_MAX_BYTES) { throw new MachineProfileError("machine-upgrade-profile-too-large"); }
    stagedInfo = await writeExclusive(staged, bytes);
    await capability.handle.sync();
    await capability.assertCurrent();
    const current = await readPrivateProfile(profile);
    if (!sameFile(before.information, current.information) || !before.bytes.equals(current.bytes)) { throw new MachineProfileError("machine-upgrade-profile-changed"); }
    const staging = await readPrivateProfile(staged);
    if (!sameFile(stagedInfo, staging.information) || !staging.bytes.equals(bytes) || !sameFile(lockInfo, await lstat(lock))) {
      throw new MachineProfileError("machine-upgrade-artifact-changed");
    }
    await rename(staged, profile);
    stagedInfo = undefined;
    await capability.handle.sync();
    await capability.assertCurrent();
    if (canonicalJson(await readMachineProfile(profilePath)) !== canonicalJson(target)) { throw new MachineProfileError("machine-upgrade-profile-postcheck-failed"); }
    const installed = await readPrivateProfile(profile);
    if (installed.information.dev !== staging.information.dev || installed.information.ino !== staging.information.ino || !installed.bytes.equals(bytes)) {
      throw new MachineProfileError("machine-upgrade-profile-postcheck-failed");
    }
    return { ok: true, changed: true, mode: "calculation-only", previousSha256,
      profileSha256: createHash("sha256").update(bytes).digest("hex"), backupFile, restartRequired: true };
  } catch (error) {
    primaryFailure = error;
    throw error;
  } finally {
    const cleanupFailures: unknown[] = [];
    const cleanup = [
      async (): Promise<void> => { if (stagedInfo !== undefined) { await removeOwnedFile(staged, stagedInfo); } },
      async (): Promise<void> => { if (lockInfo !== undefined) { await removeOwnedFile(lock, lockInfo); } },
      async (): Promise<void> => { await capability.handle.sync(); },
      async (): Promise<void> => { await capability.close(); },
    ];
    for (const action of cleanup) {
      try { await action(); } catch (error) { cleanupFailures.push(error); }
    }
    if (cleanupFailures.length > 0) {
      const error = new MachineProfileError("machine-upgrade-cleanup-failed");
      error.cause = new AggregateError([...(primaryFailure === undefined ? [] : [primaryFailure]), ...cleanupFailures], "machine-upgrade-cleanup-failed");
      // oxlint-disable-next-line eslint/no-unsafe-finally -- Cleanup failure must refuse success; the aggregate retains any primary failure rather than replacing its evidence.
      throw error;
    }
  }
}
