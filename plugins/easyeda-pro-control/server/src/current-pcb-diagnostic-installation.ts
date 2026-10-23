/** Private diagnostic capability admission. No tool accepts these options.
 * The PowerShell pin must come from a separately reviewed native installation;
 * deriving a pathname or hashing an unknown executable does not establish it.
 * Native ancestry/file leases are acquired by the original diagnostic helper.
 */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import path from "node:path";
import { assertSubset, canonicalJson, controlImplementationFingerprint, loadReviewedCompatibilityManifest,
  reviewedCompatibilityManifestFingerprint } from "./core.ts";
import { ORDINARY_LAUNCH_PROFILE, verifyOrdinaryLaunchInstallation } from "./ordinary-launch.ts";
import { deriveWindowsRuntimePaths } from "./windows-runtime.ts";
import type { WindowsRuntimePaths } from "./windows-runtime.ts";

const POWERSHELL = "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe";
export interface CurrentPcbDiagnosticInstallationOptions {
  readonly pluginRoot: string;
  readonly assetsRoot: string;
  readonly powershellSha256: string;
  readonly powershellBytes: number;
  readonly wslDistribution?: string;
}
export interface CurrentPcbDiagnosticInstallationFile {
  readonly windowsPath: string;
  readonly bytes: number;
  readonly sha256: string;
}
export interface CurrentPcbDiagnosticInstallationPlan {
  readonly schema: "easyeda-pro-control.pcb-diagnostic-installation.v1";
  readonly files: readonly CurrentPcbDiagnosticInstallationFile[];
}
export interface CurrentPcbDiagnosticInstallation {
  readonly paths: WindowsRuntimePaths;
  readonly plan: CurrentPcbDiagnosticInstallationPlan;
  readonly facadeSha256: string;
}
function refuse(): never { throw new Error("PCB_DIAGNOSTIC_INSTALLATION_REFUSED"); }
function windowsPath(host: string): string {
  // Native leases deliberately exclude UNC, alternate streams, device names,
  // Trailing-dot aliases and noncanonical components, not merely ../ traversal.
  if (!/^\/mnt\/[a-z]\//u.test(host) || path.posix.normalize(host) !== host) { refuse(); }
  const components = host.slice(7).split("/");
  if (components.some(value => value.length === 0 || value.length > 120 || value.trim() !== value || value.endsWith(".") ||
      // oxlint-disable-next-line no-control-regex -- Native command/path tokens exclude every control character explicitly.
      /[<>:"\\|?*\u0000-\u001F\u007F]/u.test(value) || /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/iu.test(value))) { refuse(); }
  const result = `${host[5]?.toUpperCase()}:\\${components.join("\\")}`;
  if (result.length > 240) { refuse(); }
  return result;
}

/** Fixed ordered file plan only. This pure function grants no installation proof. */
export function createCurrentPcbDiagnosticInstallationPlan(options: CurrentPcbDiagnosticInstallationOptions): Readonly<{
  paths: WindowsRuntimePaths; plan: CurrentPcbDiagnosticInstallationPlan;
}> {
  if (!/^[a-f\d]{64}$/u.test(options.powershellSha256) || !Number.isSafeInteger(options.powershellBytes) ||
      options.powershellBytes < 1 || options.powershellBytes > 16_777_216) { refuse(); }
  const paths = Object.freeze(deriveWindowsRuntimePaths({ ...options, powershellExecutable: POWERSHELL }));
  const files: CurrentPcbDiagnosticInstallationFile[] = ORDINARY_LAUNCH_PROFILE.installedFiles.map(pin => Object.freeze({
    windowsPath: windowsPath(path.posix.resolve(paths.assetsRoot, pin.relativePath)), bytes: pin.bytes, sha256: pin.sha256,
  }));
  files.push(Object.freeze({ windowsPath: windowsPath(POWERSHELL), bytes: options.powershellBytes, sha256: options.powershellSha256 }));
  // Validate assets itself too, including components removed by relative pins.
  windowsPath(paths.assetsRoot);
  return Object.freeze({ paths, plan: Object.freeze({ schema: "easyeda-pro-control.pcb-diagnostic-installation.v1", files: Object.freeze(files) }) });
}
function same(left: BigIntStats, right: BigIntStats): boolean {
  return (["dev", "ino", "size", "mode", "nlink", "mtimeNs", "ctimeNs"] as const).every(key => left[key] === right[key]);
}
function sameFacadeHelper(left: BigIntStats, right: BigIntStats): boolean {
  return same(left, right) && left.uid === right.uid && left.gid === right.gid;
}
/** Read-only exact descriptor proof. Native image/ancestor leases remain separate. */
export async function verifyCurrentPcbDiagnosticPowerShell(hostPath: string, expected: Readonly<{ bytes: number; sha256: string }>): Promise<void> {
  if (path.posix.resolve(hostPath) !== hostPath || await realpath(hostPath) !== hostPath ||
      !Number.isSafeInteger(expected.bytes) || expected.bytes < 1 || expected.bytes > 16_777_216 || !/^[a-f\d]{64}$/u.test(expected.sha256)) { refuse(); }
  // oxlint-disable-next-line no-bitwise -- Read-only no-follow open; reject nonregular descriptors without blocking.
  const handle = await open(hostPath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await handle.stat({ bigint: true });
    // System executables can have Windows servicing hardlinks. The native lease
    // Denies writes/deletion to the file object, not only one of those names.
    if (!before.isFile() || before.nlink < 1n || before.size !== BigInt(expected.bytes)) { refuse(); }
    const buffer = Buffer.alloc(65_536), hash = createHash("sha256");
    let total = 0;
    while (total < expected.bytes) {
      const result = await handle.read(buffer, 0, Math.min(buffer.length, expected.bytes - total), total);
      if (result.bytesRead === 0) { refuse(); }
      total += result.bytesRead; hash.update(buffer.subarray(0, result.bytesRead));
    }
    const eof = await handle.read(buffer, 0, 1, total);
    if (eof.bytesRead !== 0 || hash.digest("hex") !== expected.sha256 || !same(before, await handle.stat({ bigint: true })) ||
        !same(before, await lstat(hostPath, { bigint: true })) || await realpath(hostPath) !== hostPath) { refuse(); }
  } finally { await handle.close(); }
}

export async function verifyCurrentPcbDiagnosticInstallation(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcbDiagnosticInstallation> {
  const original = createCurrentPcbDiagnosticInstallationPlan(options);
  const facadeSha256 = await verifyOrdinaryLaunchInstallation({ assetsRoot: options.assetsRoot, pluginRoot: options.pluginRoot,
    assertAllowed: () => Promise.reject(new Error("PCB_DIAGNOSTIC_NO_ORDINARY_DISPATCH")),
    allocateRuntime: () => { throw new Error("PCB_DIAGNOSTIC_NO_ORDINARY_DISPATCH"); },
  });
  await verifyCurrentPcbDiagnosticPowerShell(original.paths.powershellExecutable, {
    bytes: options.powershellBytes, sha256: options.powershellSha256,
  });
  return Object.freeze({ ...original, facadeSha256 });
}

/** Fresh facade and its fixed Windows-authority helper bytes. This does not
 * verify installed application/PowerShell bytes or grant launch authority.
 * Startup alone may pair it with active native deny-write/delete leases on
 * the original complete installation plan, reproved before and after this
 * function. It is never a timestamp/cache admission or a historical token. */
export async function verifyCurrentPcbDiagnosticFacade(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcbDiagnosticInstallation> {
  const original = createCurrentPcbDiagnosticInstallationPlan(options);
  if (path.posix.resolve(options.pluginRoot) !== options.pluginRoot || await realpath(options.pluginRoot) !== options.pluginRoot ||
      await realpath(options.assetsRoot) !== options.assetsRoot) { refuse(); }
  const manifestIdentity = reviewedCompatibilityManifestFingerprint();
  const manifest = loadReviewedCompatibilityManifest();
  const actual = await controlImplementationFingerprint();
  assertSubset({ version: actual.version, operationSchema: actual.operationSchema, sha256: actual.sha256, fileCount: actual.files.length,
    files: actual.files.map(({ relativePath, bytes, sha256 }) => ({ relativePath, bytes, sha256 })) },
  manifest.facadeImplementation[actual.mode], "Diagnostic startup facade identity");
  await verifyFacadeHelper(path.posix.join(options.pluginRoot, ORDINARY_LAUNCH_PROFILE.helper.relativePath));
  if (canonicalJson(manifestIdentity) !== canonicalJson(reviewedCompatibilityManifestFingerprint()) ||
      await realpath(options.pluginRoot) !== options.pluginRoot || await realpath(options.assetsRoot) !== options.assetsRoot) { refuse(); }
  return Object.freeze({ ...original, facadeSha256: actual.sha256 });
}

async function verifyFacadeHelper(hostPath: string): Promise<void> {
  if (await realpath(hostPath) !== hostPath) { refuse(); }
  // oxlint-disable-next-line no-bitwise -- The fixed facade helper must remain a bounded ordinary no-follow file.
  const handle = await open(hostPath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await handle.stat({ bigint: true });
    if (!before.isFile() || before.nlink !== 1n || before.size < 1n || before.size > 65_536n) { refuse(); }
    const buffer = Buffer.alloc(Number(before.size) + 1);
    let count = 0;
    while (count < buffer.length) {
      const result = await handle.read(buffer, count, buffer.length - count, count);
      if (result.bytesRead === 0) { break; } count += result.bytesRead;
    }
    if (count !== Number(before.size) || createHash("sha256").update(buffer.subarray(0, count)).digest("hex") !== ORDINARY_LAUNCH_PROFILE.helper.sha256 ||
        !sameFacadeHelper(before, await handle.stat({ bigint: true })) || !sameFacadeHelper(before, await lstat(hostPath, { bigint: true })) ||
        await realpath(hostPath) !== hostPath) { refuse(); }
  } finally { await handle.close(); }
}
