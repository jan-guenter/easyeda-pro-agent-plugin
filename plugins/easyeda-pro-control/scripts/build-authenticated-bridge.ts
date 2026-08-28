#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
  link,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  realpath,
  rename,
  stat,
  unlink,
} from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { deflateRawSync } from "node:zlib";
import { build } from "esbuild";
import type { Metafile } from "esbuild";

import {
  AUTHENTICATED_BRIDGE_BUILD_DIRECTORY,
  assertPrivateDirectoryDescriptorUnchanged,
  bridgeControlDataDirectory,
  bridgeTokenPathFromArguments,
  defaultAuthenticatedBridgeOutputPath,
  openBridgeTokenFileCapability,
  openPrivateDirectoryDescriptor,
  privateDirectoryChildDescriptorPath,
} from "./bridge-token.ts";
import type {
  BridgeTokenFileCapability,
  BridgeTokenProof,
  PrivateDirectoryDescriptor,
} from "./bridge-token.ts";
import {
  REVIEWED_BRIDGE_SOURCE,
  SEALED_VENDORED_MEMORY_NAMESPACE,
  assertSealedVendoredMemoryUnchanged,
  captureReviewedVendoredSourceSnapshot,
  sealedVendoredMemoryPlugin,
} from "./reviewed-bridge-source.ts";
import type { StagedVendoredSourceSnapshot } from "./reviewed-bridge-source.ts";
import {
  assertSelfSoftCoreLimitZero,
  runWithZeroSoftCoreLimit,
} from "../server/src/soft-core-limit.ts";

const BUILD_ID_PLACEHOLDER = "__MCP_DISPATCHER_BUILD_ID_PLACEHOLDER__";
const INDEX_BUILD_ID_PLACEHOLDER =
  "__MCP_AUTHENTICATED_INDEX_BUILD_ID_PLACEHOLDER__";
const ZIP_UTF8_FLAG = 2048;
const ZIP_DEFLATE_METHOD = 8;
const ZIP_VERSION = 20;
const AUTHENTICATED_BRIDGE_HOST = "127.0.0.1";
const AUTHENTICATED_BRIDGE_PORT = 49_621;
const AUTHENTICATION_PROTOCOL = "easyeda-pro-control.bridge-auth.v1";
const PRIVATE_PAIR_LOCK_SCHEMA = "easyeda-pro-control.bridge-pair-lock.v2";
const PRIVATE_CANDIDATE_NONCE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;

interface ArchiveEntry {
  readonly data: Buffer;
  readonly name: string;
}

type PrivateOutputDirectory = PrivateDirectoryDescriptor;

interface PrivateOutputIdentity {
  readonly device: bigint;
  readonly inode: bigint;
}

interface StagedPrivateOutput {
  readonly descriptorPath: string;
  readonly identity: PrivateOutputIdentity;
}

interface PreparedPrivateOutput extends StagedPrivateOutput {
  readonly byteLength: number;
  readonly outputPath: string;
}

function asError(value: unknown, message: string): Error {
  return value instanceof Error ? value : new Error(message, { cause: value });
}

interface PrivatePairLock extends StagedPrivateOutput {
  readonly handle: FileHandle;
}

function errorCode(error: unknown): string | undefined {
  return error !== null && typeof error === "object" && "code" in error
    ? String(error.code)
    : undefined;
}

function sameIdentity(
  information: { readonly dev: bigint; readonly ino: bigint },
  identity: PrivateOutputIdentity,
): boolean {
  return information.dev === identity.device && information.ino === identity.inode;
}

function identityOf(information: {
  readonly dev: bigint;
  readonly ino: bigint;
}): PrivateOutputIdentity {
  return { device: information.dev, inode: information.ino };
}

function privateMode(mode: bigint): number {
  return Number(mode % 512n);
}

async function assertPrivateOutputDirectoryUnchanged(
  directory: PrivateOutputDirectory,
): Promise<void> {
  await assertPrivateDirectoryDescriptorUnchanged(
    directory,
    "The private bridge output directory",
  );
}

async function assertPrivateOutputPathIdentityAfterClose(
  directory: PrivateOutputDirectory,
): Promise<void> {
  let reopened: PrivateDirectoryDescriptor | undefined;
  let failure: unknown;
  try {
    reopened = await openPrivateDirectoryDescriptor(
      directory.path,
      "The final private bridge output pathname",
      false,
    );
    const information = await reopened.handle.stat({ bigint: true });
    if (
      information.dev !== directory.device ||
      information.ino !== directory.inode
    ) {
      throw new Error("The final output directory has a different identity.");
    }
  } catch (error) {
    failure = error;
  }
  if (reopened !== undefined) {
    await reopened.handle.close().catch((closeError: unknown) => {
      failure =
        failure === undefined
          ? closeError
          : new AggregateError(
              [failure, closeError],
              "Final output-path proof and descriptor cleanup both failed.",
              { cause: closeError },
            );
    });
  }
  if (failure !== undefined) {
    throw new Error(
      "The private bridge output pathname changed before success reporting.",
      { cause: failure },
    );
  }
}

function openPrivateOutputDirectory(
  outputPath: string,
): Promise<PrivateOutputDirectory> {
  return openPrivateDirectoryDescriptor(
    dirname(outputPath),
    "The private bridge output directory",
  );
}

function descriptorOutputPath(
  directory: PrivateOutputDirectory,
  outputPath: string,
): string {
  if (dirname(outputPath) !== directory.path) {
    throw new Error("Private bridge outputs must share one verified parent directory.");
  }
  return privateDirectoryChildDescriptorPath(directory, outputPath);
}

function privatePairLockPath(outputPath: string): string {
  return join(
    dirname(outputPath),
    `.${basename(outputPath)}.archive-receipt.lock`,
  );
}

async function linuxProcessStartTime(pid: number): Promise<string | undefined> {
  try {
    const statText = await readFile(`/proc/${pid}/stat`, "utf8");
    const commandEnd = statText.lastIndexOf(")");
    if (commandEnd === -1) {
      throw new Error(`Linux process ${pid} has a malformed stat record.`);
    }
    const fields = statText.slice(commandEnd + 2).trim().split(/\s+/u);
    const state = fields[0];
    if (state === "Z" || state === "X") {
      return undefined;
    }
    if (state === undefined || !/^[A-Z]$/u.test(state)) {
      throw new Error(`Linux process ${pid} has no valid state.`);
    }
    const startTime = fields[19];
    if (startTime === undefined || !/^\d+$/u.test(startTime)) {
      throw new Error(`Linux process ${pid} has no valid start time.`);
    }
    return startTime;
  } catch (error) {
    if (errorCode(error) === "ENOENT" || errorCode(error) === "ESRCH") {
      return undefined;
    }
    throw error;
  }
}

async function linuxBootId(): Promise<string> {
  const bootIdText = await readFile("/proc/sys/kernel/random/boot_id", "utf8");
  const bootId = bootIdText.trim();
  if (!PRIVATE_CANDIDATE_NONCE.test(bootId)) {
    throw new Error("Linux returned an invalid boot identity.");
  }
  return bootId;
}

async function linuxPidNamespaceIdentity(): Promise<{
  readonly device: string;
  readonly inode: string;
}> {
  const information = await stat("/proc/self/ns/pid", { bigint: true });
  if (!information.isFile()) {
    throw new Error("The Linux PID namespace descriptor is not a file.");
  }
  return {
    device: information.dev.toString(10),
    inode: information.ino.toString(10),
  };
}

type PrivatePairLockRecord =
  | {
      readonly bootId: string;
      readonly nonce: string;
      readonly pid: number;
      readonly pidNamespaceDevice: string;
      readonly pidNamespaceInode: string;
      readonly schema: typeof PRIVATE_PAIR_LOCK_SCHEMA;
      readonly startTime: string;
    }
  | {
      readonly nonce: string;
      readonly pid: number;
      readonly schema: "legacy-unverifiable";
      readonly startTime: string;
    };

function hasExactKeys(
  record: Readonly<Record<string, unknown>>,
  expectedKeys: readonly string[],
): boolean {
  return Object.keys(record).toSorted().join("\0") ===
    expectedKeys.toSorted().join("\0");
}

function parsePrivatePairLock(text: string): PrivatePairLockRecord {
  const value: unknown = JSON.parse(text);
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The bridge archive/receipt lock record is malformed.");
  }
  const record = Object.fromEntries(Object.entries(value));
  if (
    typeof record["pid"] !== "number" ||
    !Number.isSafeInteger(record["pid"]) ||
    record["pid"] <= 0 ||
    typeof record["startTime"] !== "string" ||
    !/^\d+$/u.test(record["startTime"]) ||
    typeof record["nonce"] !== "string" ||
    !PRIVATE_CANDIDATE_NONCE.test(record["nonce"])
  ) {
    throw new Error("The bridge archive/receipt lock record is invalid.");
  }
  if (
    record["schema"] === undefined &&
    hasExactKeys(record, ["nonce", "pid", "startTime"])
  ) {
    return {
      nonce: record["nonce"],
      pid: record["pid"],
      schema: "legacy-unverifiable",
      startTime: record["startTime"],
    };
  }
  if (
    record["schema"] !== PRIVATE_PAIR_LOCK_SCHEMA ||
    !hasExactKeys(record, [
      "bootId",
      "nonce",
      "pid",
      "pidNamespaceDevice",
      "pidNamespaceInode",
      "schema",
      "startTime",
    ]) ||
    typeof record["bootId"] !== "string" ||
    !PRIVATE_CANDIDATE_NONCE.test(record["bootId"]) ||
    typeof record["pidNamespaceDevice"] !== "string" ||
    !/^\d+$/u.test(record["pidNamespaceDevice"]) ||
    typeof record["pidNamespaceInode"] !== "string" ||
    !/^\d+$/u.test(record["pidNamespaceInode"])
  ) {
    throw new Error("The bridge archive/receipt lock record is invalid.");
  }
  return {
    bootId: record["bootId"],
    nonce: record["nonce"],
    pid: record["pid"],
    pidNamespaceDevice: record["pidNamespaceDevice"],
    pidNamespaceInode: record["pidNamespaceInode"],
    schema: PRIVATE_PAIR_LOCK_SCHEMA,
    startTime: record["startTime"],
  };
}

function privateCandidateDescriptorPath(
  directory: PrivateOutputDirectory,
  outputPath: string,
  nonce: string,
): string {
  if (!/^[a-f0-9-]{36}$/u.test(nonce)) {
    throw new Error("The private bridge candidate nonce is invalid.");
  }
  return join(
    directory.descriptorPath,
    `.${basename(outputPath)}.${nonce}.candidate`,
  );
}

function injectCrashDuringPrivatePairLockPublicationForTest(): void {
  if (
    process.env["EASYEDA_TEST_CRASH_DURING_BRIDGE_LOCK_PUBLICATION"] !== "1"
  ) {
    return;
  }
  process.kill(process.pid, "SIGKILL");
  throw new Error("The injected bridge-lock crash signal did not terminate.");
}

function injectCrashBeforePrivatePairLockLinkForTest(): void {
  if (
    process.env["EASYEDA_TEST_CRASH_BEFORE_BRIDGE_LOCK_LINK"] !== "1"
  ) {
    return;
  }
  process.kill(process.pid, "SIGKILL");
  throw new Error("The injected pre-link bridge-lock crash did not terminate.");
}

let stoppedBeforePrivatePairLockLinkForTest = false;

function injectStopBeforePrivatePairLockLinkForTest(): void {
  if (
    process.env["EASYEDA_TEST_STOP_BEFORE_BRIDGE_LOCK_LINK"] !== "1" ||
    stoppedBeforePrivatePairLockLinkForTest
  ) {
    return;
  }
  stoppedBeforePrivatePairLockLinkForTest = true;
  process.kill(process.pid, "SIGSTOP");
}

function injectStopAfterPrivatePairLockAcquisitionForTest(): void {
  if (
    process.env["EASYEDA_TEST_STOP_AFTER_BRIDGE_LOCK_ACQUIRE"] !== "1"
  ) {
    return;
  }
  process.kill(process.pid, "SIGSTOP");
}

function injectStopAfterPrivateReceiptCommitForTest(): void {
  if (
    process.env["EASYEDA_TEST_STOP_AFTER_BRIDGE_RECEIPT_COMMIT"] !== "1"
  ) {
    return;
  }
  process.kill(process.pid, "SIGSTOP");
}

function injectCrashAfterPrivateCandidatePrepareForTest(
  kind: "archive" | "receipt",
): void {
  if (
    process.env["EASYEDA_TEST_CRASH_AFTER_BRIDGE_CANDIDATE_PREPARE"] !== kind
  ) {
    return;
  }
  process.kill(process.pid, "SIGKILL");
  throw new Error("The injected bridge-candidate crash did not terminate.");
}

function injectCrashDuringPrivateArchiveLinkForTest(): void {
  if (
    process.env["EASYEDA_TEST_CRASH_DURING_BRIDGE_ARCHIVE_LINK"] !== "1"
  ) {
    return;
  }
  process.kill(process.pid, "SIGKILL");
  throw new Error("The injected bridge-archive link crash did not terminate.");
}

async function tryAcquirePrivatePairLock(
  directory: PrivateOutputDirectory,
  lockPath: string,
): Promise<PrivatePairLock | undefined> {
  const descriptorPath = descriptorOutputPath(directory, lockPath);
  const [bootId, pidNamespace, startTime] = await Promise.all([
    linuxBootId(),
    linuxPidNamespaceIdentity(),
    linuxProcessStartTime(process.pid),
  ]);
  if (startTime === undefined) {
    throw new Error("The bridge builder cannot prove its Linux process identity.");
  }
  const nonce = randomUUID();
  const lockRecord = {
    bootId,
    schema: PRIVATE_PAIR_LOCK_SCHEMA,
    pid: process.pid,
    pidNamespaceDevice: pidNamespace.device,
    pidNamespaceInode: pidNamespace.inode,
    startTime,
    nonce,
  };
  const lockBytes = Buffer.from(`${JSON.stringify(lockRecord)}\n`, "utf8");
  const prepared = await preparePrivateOutput(
    directory,
    lockPath,
    lockBytes,
    nonce,
  );
  injectStopBeforePrivatePairLockLinkForTest();
  injectCrashBeforePrivatePairLockLinkForTest();
  try {
    await link(prepared.descriptorPath, descriptorPath);
  } catch (error) {
    if (errorCode(error) === "EEXIST") {
      await removeExpectedPrivateEntry(
        directory,
        prepared.descriptorPath,
        prepared.identity,
      );
      return undefined;
    }
    await removeExpectedPrivateEntry(
      directory,
      prepared.descriptorPath,
      prepared.identity,
    );
    throw error;
  }
  let handle: FileHandle | undefined;
  try {
    const linked = await lstat(descriptorPath, { bigint: true });
    if (
      !sameIdentity(linked, prepared.identity) ||
      linked.nlink !== 2n
    ) {
      throw new Error("The bridge archive/receipt lock failed its identity proof.");
    }
    injectCrashDuringPrivatePairLockPublicationForTest();
    await unlink(prepared.descriptorPath);
    handle = await open(
      descriptorPath,
      fsConstants.O_RDONLY + fsConstants.O_NOFOLLOW,
    );
    const opened = await handle.stat({ bigint: true });
    if (
      !sameIdentity(opened, prepared.identity) ||
      opened.nlink !== 1n ||
      privateMode(opened.mode) !== 0o600
    ) {
      throw new Error("The bridge archive/receipt lock changed after linking.");
    }
    await directory.handle.sync();
    return { descriptorPath, handle, identity: prepared.identity };
  } catch (error) {
    const cleanupFailures: unknown[] = [];
    if (handle !== undefined) {
      await handle.close().catch((closeError: unknown) => {
        cleanupFailures.push(closeError);
      });
    }
    for (const path of [prepared.descriptorPath, descriptorPath]) {
      await removeExpectedPrivateEntry(
        directory,
        path,
        prepared.identity,
      ).catch((cleanupError: unknown) => {
        cleanupFailures.push(cleanupError);
      });
    }
    if (cleanupFailures.length > 0) {
      throw new AggregateError(
        [error, ...cleanupFailures],
        "Bridge pair-lock acquisition and cleanup both failed.",
        { cause: error },
      );
    }
    throw error;
  }
}

async function existingPrivatePairLock(
  directory: PrivateOutputDirectory,
  lockPath: string,
): Promise<boolean> {
  const descriptorPath = descriptorOutputPath(directory, lockPath);
  let information;
  try {
    information = await lstat(descriptorPath, { bigint: true });
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return false;
    }
    throw error;
  }
  if (
    !information.isFile() ||
    information.isSymbolicLink() ||
    (information.nlink !== 1n && information.nlink !== 2n) ||
    privateMode(information.mode) !== 0o600 ||
    (typeof process.getuid === "function" &&
      information.uid !== BigInt(process.getuid()))
  ) {
    throw new Error(
      "Refusing to wait on an untrusted bridge archive/receipt lock.",
    );
  }
  const identity = identityOf(information);
  let handle: FileHandle;
  try {
    handle = await open(
      descriptorPath,
      fsConstants.O_RDONLY + fsConstants.O_NOFOLLOW,
    );
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      await assertPrivateOutputDirectoryUnchanged(directory);
      return false;
    }
    throw error;
  }
  let record: ReturnType<typeof parsePrivatePairLock>;
  let stableLinkCount = information.nlink;
  try {
    const opened = await handle.stat({ bigint: true });
    const linkedCandidateWasRemovedWhileOpening =
      information.nlink === 2n && opened.nlink === 1n;
    if (
      !sameIdentity(opened, identity) ||
      opened.size !== information.size ||
      (opened.nlink !== information.nlink &&
        !linkedCandidateWasRemovedWhileOpening) ||
      opened.size > 1024n
    ) {
      throw new Error("The bridge archive/receipt lock changed while opening.");
    }
    const text = await handle.readFile("utf8");
    const after = await handle.stat({ bigint: true });
    const linkedCandidateWasRemovedWhileReading =
      opened.nlink === 2n && after.nlink === 1n;
    if (
      !sameIdentity(after, identity) ||
      after.size !== opened.size ||
      (after.nlink !== opened.nlink &&
        !linkedCandidateWasRemovedWhileReading) ||
      after.mtimeMs !== opened.mtimeMs ||
      (after.ctimeMs !== opened.ctimeMs &&
        !linkedCandidateWasRemovedWhileReading)
    ) {
      throw new Error("The bridge archive/receipt lock changed while reading.");
    }
    stableLinkCount = after.nlink;
    record = parsePrivatePairLock(text);
  } finally {
    await handle.close();
  }
  const [currentBootId, currentPidNamespace] = await Promise.all([
    linuxBootId(),
    linuxPidNamespaceIdentity(),
  ]);
  const sameOwnerContext =
    record.schema === PRIVATE_PAIR_LOCK_SCHEMA &&
    record.bootId === currentBootId &&
    record.pidNamespaceDevice === currentPidNamespace.device &&
    record.pidNamespaceInode === currentPidNamespace.inode;
  if (
    sameOwnerContext &&
    (await linuxProcessStartTime(record.pid)) === record.startTime
  ) {
    return true;
  }
  let staleCandidatePath: string | undefined;
  if (stableLinkCount === 2n) {
    const candidateDescriptorPath = privateCandidateDescriptorPath(
      directory,
      lockPath,
      record.nonce,
    );
    let candidateInformation;
    try {
      candidateInformation = await lstat(candidateDescriptorPath, {
        bigint: true,
      });
    } catch (error) {
      if (errorCode(error) === "ENOENT") {
        throw new Error(
          "Refusing to recover a two-link bridge lock without its exact candidate.",
          { cause: error },
        );
      }
      throw error;
    }
    if (!sameIdentity(candidateInformation, identity)) {
      throw new Error(
        "Refusing to recover a two-link bridge lock with a changed candidate.",
      );
    }
    staleCandidatePath = join(
      directory.path,
      basename(candidateDescriptorPath),
    );
  }
  const currentLock = await lstat(descriptorPath, { bigint: true }).catch(
    (error: unknown) => {
      if (errorCode(error) === "ENOENT") {
        return null;
      }
      throw error;
    },
  );
  if (currentLock === null) {
    return false;
  }
  if (!sameIdentity(currentLock, identity)) {
    // Another owner replaced a lock that was removed outside this process.
    // Never apply a stale owner's recovery decision to that new pathname.
    return true;
  }
  let recoverySteps =
    `recheck that ${lockPath} is the reported lock device/inode with one link, then unlink only that exact lock path`;
  if (staleCandidatePath !== undefined) {
    recoverySteps =
      `recheck that ${lockPath} and ${staleCandidatePath} are the reported same inode with two links, unlink the exact candidate first, recheck that the lock is still the reported inode with one link, then unlink the exact lock`;
  }
  let ownerStatus = "belongs to another boot or PID namespace and is not verifiable here";
  if (sameOwnerContext) {
    ownerStatus = "does not identify a live process";
  } else if (record.schema === "legacy-unverifiable") {
    ownerStatus =
      "uses the legacy owner record without boot or PID-namespace identity and is not verifiable";
  }
  const ownerIdentity =
    record.schema === "legacy-unverifiable"
      ? "schema=legacy-unverifiable"
      : `schema=${record.schema}, bootId=${record.bootId}, pidNamespaceDevice=${record.pidNamespaceDevice}, pidNamespaceInode=${record.pidNamespaceInode}`;
  await assertPrivateOutputDirectoryUnchanged(directory);
  throw new Error(
    `Stale or unverifiable bridge archive/receipt lock at ${lockPath}: ${ownerIdentity}, pid=${record.pid}, startTime=${record.startTime}, nonce=${record.nonce} ${ownerStatus}; parentDirectoryDevice=${directory.device}, parentDirectoryInode=${directory.inode}, lockDevice=${identity.device}, lockInode=${identity.inode}. Automatic removal is disabled because pathname cleanup cannot be made compare-and-swap safe. Prove that no bridge builder is running in every relevant PID namespace, re-prove the owner-only 0700 parent identity, then ${recoverySteps}. Never use a glob for manual lock recovery.`,
  );
}

async function acquirePrivatePairLock(
  directory: PrivateOutputDirectory,
  lockPath: string,
): Promise<PrivatePairLock> {
  const deadline = Date.now() + 60_000;
  for (;;) {
    await assertPrivateOutputDirectoryUnchanged(directory);
    const lock = await tryAcquirePrivatePairLock(directory, lockPath);
    if (lock !== undefined) {
      return lock;
    }
    if (await existingPrivatePairLock(directory, lockPath)) {
      if (Date.now() >= deadline) {
        throw new Error(
          `Timed out waiting for live bridge archive/receipt lock ${lockPath}. Do not remove it while its recorded pid/startTime remains live.`,
        );
      }
      await delay(100);
    }
  }
}

async function releasePrivatePairLock(
  directory: PrivateOutputDirectory,
  lock: PrivatePairLock,
): Promise<void> {
  try {
    const [pathInformation, handleInformation] = await Promise.all([
      lstat(lock.descriptorPath, { bigint: true }),
      lock.handle.stat({ bigint: true }),
    ]);
    if (
      !sameIdentity(pathInformation, lock.identity) ||
      !sameIdentity(handleInformation, lock.identity)
    ) {
      throw new Error("The bridge archive/receipt lock changed identity.");
    }
    await unlink(lock.descriptorPath);
    await directory.handle.sync();
    const unlinkedInformation = await lock.handle.stat({ bigint: true });
    if (
      !sameIdentity(unlinkedInformation, lock.identity) ||
      unlinkedInformation.nlink !== 0n
    ) {
      throw new Error(
        "The released bridge archive/receipt lock retained a filesystem link.",
      );
    }
  } finally {
    await lock.handle.close();
  }
}

async function inspectExistingPrivateOutput(
  directory: PrivateOutputDirectory,
  outputPath: string,
): Promise<PrivateOutputIdentity | undefined> {
  await assertPrivateOutputDirectoryUnchanged(directory);
  const descriptorPath = descriptorOutputPath(directory, outputPath);
  let pathInformation;
  try {
    pathInformation = await lstat(descriptorPath, { bigint: true });
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return undefined;
    }
    throw error;
  }
  if (
    !pathInformation.isFile() ||
    pathInformation.isSymbolicLink() ||
    pathInformation.nlink !== 1n ||
    privateMode(pathInformation.mode) !== 0o600 ||
    (typeof process.getuid === "function" &&
      pathInformation.uid !== BigInt(process.getuid()))
  ) {
    throw new Error(
      `Refusing to replace a non-private or non-regular bridge output: ${outputPath}`,
    );
  }
  const handle = await open(
    descriptorPath,
    fsConstants.O_RDONLY + fsConstants.O_NOFOLLOW,
  );
  try {
    const handleInformation = await handle.stat({ bigint: true });
    const identity = identityOf(pathInformation);
    if (
      !handleInformation.isFile() ||
      !sameIdentity(handleInformation, identity) ||
      handleInformation.nlink !== 1n ||
      privateMode(handleInformation.mode) !== 0o600
    ) {
      throw new Error(
        `The existing private bridge output changed while it was being inspected: ${outputPath}`,
      );
    }
    return identity;
  } finally {
    await handle.close();
  }
}

async function removeExpectedPrivateEntry(
  directory: PrivateOutputDirectory,
  descriptorPath: string,
  identity: PrivateOutputIdentity,
): Promise<void> {
  try {
    const information = await lstat(descriptorPath, { bigint: true });
    if (!sameIdentity(information, identity)) {
      throw new Error(
        `Refusing to remove a changed private entry: ${descriptorPath}`,
      );
    }
    await unlink(descriptorPath);
    await directory.handle.sync();
  } catch (error) {
    if (errorCode(error) !== "ENOENT") {
      throw error;
    }
  }
}

function privateCandidateTargetBasename(name: string): string | undefined {
  const suffix = ".candidate";
  if (!name.startsWith(".") || !name.endsWith(suffix)) {
    return undefined;
  }
  const withoutMarkers = name.slice(1, -suffix.length);
  const nonceSeparator = withoutMarkers.lastIndexOf(".");
  if (nonceSeparator <= 0) {
    return undefined;
  }
  const nonce = withoutMarkers.slice(nonceSeparator + 1);
  return PRIVATE_CANDIDATE_NONCE.test(nonce)
    ? withoutMarkers.slice(0, nonceSeparator)
    : undefined;
}

function isPrivateGenerationBasename(
  name: string,
  outputPath: string,
): boolean {
  const outputBasename = basename(outputPath);
  const generationPrefix = `${outputBasename.slice(0, -".eext".length)}.`;
  if (!name.startsWith(generationPrefix) || !name.endsWith(".eext")) {
    return false;
  }
  const digest = name.slice(
    generationPrefix.length,
    -".eext".length,
  );
  return /^[a-f0-9]{64}$/u.test(digest);
}

function isReservedPrivateCandidateName(
  name: string,
  outputPath: string,
  receiptPath: string,
): boolean {
  const target = privateCandidateTargetBasename(name);
  if (target === undefined) {
    return false;
  }
  const outputBasename = basename(outputPath);
  if (
    target === outputBasename ||
    target === basename(receiptPath)
  ) {
    return true;
  }
  return isPrivateGenerationBasename(target, outputPath);
}

async function listObservedPrivatePairLockCandidateNames(
  directory: PrivateOutputDirectory,
  lockPath: string,
): Promise<readonly string[]> {
  await assertPrivateOutputDirectoryUnchanged(directory);
  const lockBasename = basename(lockPath);
  const directoryEntries = await readdir(directory.descriptorPath);
  const observed = directoryEntries
    .filter(
      (name) => privateCandidateTargetBasename(name) === lockBasename,
    )
    .toSorted();
  await assertPrivateOutputDirectoryUnchanged(directory);
  return observed;
}

async function assertRetainedPrivateCandidateTarget(
  linkedTargetPath: string,
  identity: PrivateOutputIdentity,
  name: string,
): Promise<void> {
  const retainedTarget = await lstat(linkedTargetPath, { bigint: true });
  if (
    retainedTarget.nlink !== 1n ||
    !sameIdentity(retainedTarget, identity)
  ) {
    throw new Error(
      `The partially published bridge target changed during recovery: ${name}`,
    );
  }
}

async function removeOrphanedPrivateCandidates(
  directory: PrivateOutputDirectory,
  outputPath: string,
  receiptPath: string,
): Promise<readonly string[]> {
  await assertPrivateOutputDirectoryUnchanged(directory);
  const directoryEntries = await readdir(directory.descriptorPath);
  const candidates = directoryEntries
    .filter((name) =>
      isReservedPrivateCandidateName(
        name,
        outputPath,
        receiptPath,
      ),
    )
    .toSorted();
  const removed: string[] = [];
  for (const name of candidates) {
    const targetBasename = privateCandidateTargetBasename(name);
    if (targetBasename === undefined) {
      throw new Error("The reserved bridge candidate parser is inconsistent.");
    }
    const descriptorPath = join(directory.descriptorPath, name);
    const pathInformation = await lstat(descriptorPath, { bigint: true });
    if (
      pathInformation.isSymbolicLink() ||
      !pathInformation.isFile() ||
      (pathInformation.nlink !== 1n && pathInformation.nlink !== 2n) ||
      privateMode(pathInformation.mode) !== 0o600 ||
      (typeof process.getuid === "function" &&
        pathInformation.uid !== BigInt(process.getuid()))
    ) {
      throw new Error(
        `Refusing to recover a changed or non-private bridge candidate: ${name}`,
      );
    }
    const linkedTargetPath =
      pathInformation.nlink === 2n
        ? join(directory.descriptorPath, targetBasename)
        : undefined;
    if (linkedTargetPath !== undefined) {
      const linkedTarget = await lstat(linkedTargetPath, { bigint: true });
      if (
        linkedTarget.isSymbolicLink() ||
        !linkedTarget.isFile() ||
        linkedTarget.nlink !== 2n ||
        !sameIdentity(linkedTarget, identityOf(pathInformation))
      ) {
        throw new Error(
          `Refusing to recover a two-link bridge candidate without its exact target: ${name}`,
        );
      }
    }
    const handle = await open(
      descriptorPath,
      fsConstants.O_RDONLY |
        fsConstants.O_NOFOLLOW |
        fsConstants.O_NONBLOCK,
    );
    let operationFailure: unknown;
    try {
      const [opened, currentPath, currentTarget] = await Promise.all([
        handle.stat({ bigint: true }),
        lstat(descriptorPath, { bigint: true }),
        linkedTargetPath === undefined
          ? Promise.resolve(null)
          : lstat(linkedTargetPath, { bigint: true }),
      ]);
      if (
        !sameIdentity(opened, identityOf(pathInformation)) ||
        !sameIdentity(currentPath, identityOf(pathInformation)) ||
        !opened.isFile() ||
        opened.nlink !== pathInformation.nlink ||
        currentPath.nlink !== pathInformation.nlink ||
        privateMode(opened.mode) !== 0o600 ||
        (typeof process.getuid === "function" &&
          opened.uid !== BigInt(process.getuid())) ||
        (linkedTargetPath !== undefined &&
          (currentTarget === null ||
            currentTarget.nlink !== 2n ||
            !sameIdentity(currentTarget, identityOf(pathInformation))))
      ) {
        throw new Error(
          `The orphaned bridge candidate changed during recovery: ${name}`,
        );
      }
      await unlink(descriptorPath);
      await directory.handle.sync();
      const unlinked = await handle.stat({ bigint: true });
      if (
        !sameIdentity(unlinked, identityOf(pathInformation)) ||
        unlinked.nlink !== pathInformation.nlink - 1n
      ) {
        throw new Error(
          `The orphaned bridge candidate did not become descriptor-only: ${name}`,
        );
      }
      if (linkedTargetPath !== undefined) {
        await assertRetainedPrivateCandidateTarget(
          linkedTargetPath,
          identityOf(pathInformation),
          name,
        );
      }
      removed.push(name);
    } catch (error) {
      operationFailure = error;
    }
    try {
      await handle.close();
    } catch (closeError) {
      if (operationFailure !== undefined) {
        throw new AggregateError(
          [operationFailure, closeError],
          `Orphaned bridge candidate recovery and descriptor cleanup both failed: ${name}`,
          { cause: closeError },
        );
      }
      throw closeError;
    }
    if (operationFailure !== undefined) {
      throw asError(
        operationFailure,
        `Orphaned bridge candidate recovery failed: ${name}`,
      );
    }
    await assertPrivateOutputDirectoryUnchanged(directory);
  }
  return removed;
}

async function listRetainedPrivateGenerations(
  directory: PrivateOutputDirectory,
  outputPath: string,
  currentGenerationPath: string,
): Promise<readonly string[]> {
  await assertPrivateOutputDirectoryUnchanged(directory);
  const entries = await readdir(directory.descriptorPath);
  const currentBasename = basename(currentGenerationPath);
  const retained = entries
    .filter(
      (name) =>
        name !== currentBasename &&
        isPrivateGenerationBasename(name, outputPath),
    )
    .toSorted();
  for (const name of retained) {
    const identity = await inspectExistingPrivateOutput(
      directory,
      join(directory.path, name),
    );
    if (identity === undefined) {
      throw new Error(
        `A retained bridge generation disappeared during reporting: ${name}`,
      );
    }
  }
  await assertPrivateOutputDirectoryUnchanged(directory);
  return retained;
}

async function preparePrivateOutput(
  directory: PrivateOutputDirectory,
  outputPath: string,
  bytes: Uint8Array,
  candidateNonce = randomUUID(),
): Promise<PreparedPrivateOutput> {
  const descriptorPath = privateCandidateDescriptorPath(
    directory,
    outputPath,
    candidateNonce,
  );
  let handle: FileHandle | undefined;
  let identity: PrivateOutputIdentity | undefined;
  try {
    await assertPrivateOutputDirectoryUnchanged(directory);
    handle = await open(
      descriptorPath,
      fsConstants.O_CREAT +
        fsConstants.O_EXCL +
        fsConstants.O_WRONLY +
        fsConstants.O_NOFOLLOW,
      0o600,
    );
    await handle.chmod(0o600);
    const emptyInformation = await handle.stat({ bigint: true });
    identity = identityOf(emptyInformation);
    const publishedPathInformation = await lstat(descriptorPath, {
      bigint: true,
    });
    if (
      !emptyInformation.isFile() ||
      emptyInformation.size !== 0n ||
      emptyInformation.nlink !== 1n ||
      privateMode(emptyInformation.mode) !== 0o600 ||
      !sameIdentity(publishedPathInformation, identity) ||
      (typeof process.getuid === "function" &&
        emptyInformation.uid !== BigInt(process.getuid()))
    ) {
      throw new Error(
        `The new private bridge output failed its pre-write identity or mode proof: ${outputPath}`,
      );
    }
    await assertPrivateOutputDirectoryUnchanged(directory);
    await handle.writeFile(bytes);
    await handle.sync();
    const finalInformation = await handle.stat({ bigint: true });
    const finalPathInformation = await lstat(descriptorPath, { bigint: true });
    if (
      !sameIdentity(finalInformation, identity) ||
      !sameIdentity(finalPathInformation, identity) ||
      finalInformation.size !== BigInt(bytes.byteLength) ||
      finalInformation.nlink !== 1n ||
      privateMode(finalInformation.mode) !== 0o600
    ) {
      throw new Error(
        `The private bridge output changed during publication: ${outputPath}`,
      );
    }
    await directory.handle.sync();
    await handle.close();
    handle = undefined;
    return {
      byteLength: bytes.byteLength,
      descriptorPath,
      identity,
      outputPath,
    };
  } catch (error) {
    const cleanupFailures: unknown[] = [];
    if (handle !== undefined) {
      await handle.close().catch((closeError: unknown) => {
        cleanupFailures.push(closeError);
      });
    }
    if (identity !== undefined) {
      await removeExpectedPrivateEntry(
        directory,
        descriptorPath,
        identity,
      ).catch((cleanupError: unknown) => {
        cleanupFailures.push(cleanupError);
      });
    }
    if (cleanupFailures.length > 0) {
      throw new AggregateError(
        [error, ...cleanupFailures],
        `Private bridge candidate preparation and cleanup both failed: ${outputPath}`,
        { cause: error },
      );
    }
    throw error;
  }
}

async function commitPreparedPrivateOutput(
  directory: PrivateOutputDirectory,
  prepared: PreparedPrivateOutput,
): Promise<void> {
  const descriptorPath = descriptorOutputPath(directory, prepared.outputPath);
  await link(prepared.descriptorPath, descriptorPath);
  const linkedInformation = await lstat(descriptorPath, { bigint: true });
  if (
    !sameIdentity(linkedInformation, prepared.identity) ||
    linkedInformation.nlink !== 2n
  ) {
    throw new Error(
      `The prepared bridge output changed while it was linked: ${prepared.outputPath}`,
    );
  }
  injectCrashDuringPrivateArchiveLinkForTest();
  await unlink(prepared.descriptorPath);
  const finalInformation = await lstat(descriptorPath, { bigint: true });
  if (
    !sameIdentity(finalInformation, prepared.identity) ||
    finalInformation.size !== BigInt(prepared.byteLength) ||
    finalInformation.nlink !== 1n ||
    privateMode(finalInformation.mode) !== 0o600
  ) {
    throw new Error(
      `The prepared bridge output failed final publication proof: ${prepared.outputPath}`,
    );
  }
}

function immutableGenerationOutputPath(
  outputBasePath: string,
  archiveSha256: string,
): string {
  if (!/^[a-f0-9]{64}$/u.test(archiveSha256)) {
    throw new Error("The authenticated bridge archive hash is invalid.");
  }
  return `${outputBasePath.slice(0, -".eext".length)}.${archiveSha256}.eext`;
}

async function assertPrivateOutputMatches(
  directory: PrivateOutputDirectory,
  outputPath: string,
  expectedBytes: Uint8Array,
  expectedSha256: string,
): Promise<void> {
  const identity = await inspectExistingPrivateOutput(directory, outputPath);
  if (identity === undefined) {
    throw new Error(`The immutable bridge generation is absent: ${outputPath}`);
  }
  const descriptorPath = descriptorOutputPath(directory, outputPath);
  const handle = await open(
    descriptorPath,
    fsConstants.O_RDONLY + fsConstants.O_NOFOLLOW,
  );
  try {
    const before = await handle.stat({ bigint: true });
    if (
      !sameIdentity(before, identity) ||
      before.size !== BigInt(expectedBytes.byteLength)
    ) {
      throw new Error(
        `The immutable bridge generation has the wrong identity or size: ${outputPath}`,
      );
    }
    const bytes = await handle.readFile();
    const after = await handle.stat({ bigint: true });
    if (
      !sameIdentity(after, identity) ||
      after.size !== before.size ||
      after.mtimeMs !== before.mtimeMs ||
      after.ctimeMs !== before.ctimeMs ||
      createHash("sha256").update(bytes).digest("hex") !== expectedSha256
    ) {
      throw new Error(
        `The immutable bridge generation changed or does not match its filename: ${outputPath}`,
      );
    }
  } finally {
    await handle.close();
  }
}

async function publishImmutablePrivateOutput(
  directory: PrivateOutputDirectory,
  outputPath: string,
  bytes: Uint8Array,
  sha256: string,
): Promise<void> {
  const prepared = await preparePrivateOutput(directory, outputPath, bytes);
  injectCrashAfterPrivateCandidatePrepareForTest("archive");
  try {
    await commitPreparedPrivateOutput(directory, prepared);
    await directory.handle.sync();
    await assertPrivateOutputDirectoryUnchanged(directory);
  } catch (error) {
    if (errorCode(error) === "EEXIST") {
      await removeExpectedPrivateEntry(
        directory,
        prepared.descriptorPath,
        prepared.identity,
      );
      await assertPrivateOutputMatches(directory, outputPath, bytes, sha256);
      await assertPrivateOutputDirectoryUnchanged(directory);
      return;
    }
    const cleanupErrors: unknown[] = [];
    for (const path of [
      prepared.descriptorPath,
      descriptorOutputPath(directory, outputPath),
    ]) {
      try {
        await removeExpectedPrivateEntry(directory, path, prepared.identity);
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
    }
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        "Immutable bridge generation publication and cleanup both failed.",
        { cause: error },
      );
    }
    throw error;
  }
}

async function atomicallyCommitPrivateReceipt(
  directory: PrivateOutputDirectory,
  receiptPath: string,
  receiptBytes: Uint8Array,
): Promise<void> {
  await inspectExistingPrivateOutput(directory, receiptPath);
  const prepared = await preparePrivateOutput(
    directory,
    receiptPath,
    receiptBytes,
  );
  injectCrashAfterPrivateCandidatePrepareForTest("receipt");
  const descriptorPath = descriptorOutputPath(directory, receiptPath);
  try {
    await assertPrivateOutputDirectoryUnchanged(directory);
    await rename(prepared.descriptorPath, descriptorPath);
    const information = await lstat(descriptorPath, { bigint: true });
    if (
      !sameIdentity(information, prepared.identity) ||
      information.size !== BigInt(receiptBytes.byteLength) ||
      information.nlink !== 1n ||
      privateMode(information.mode) !== 0o600
    ) {
      throw new Error(
        "The authenticated bridge commit receipt failed its final identity proof.",
      );
    }
    await directory.handle.sync();
    await assertPrivateOutputDirectoryUnchanged(directory);
  } catch (error) {
    try {
      await removeExpectedPrivateEntry(
        directory,
        prepared.descriptorPath,
        prepared.identity,
      );
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Bridge commit-receipt publication and cleanup both failed.",
        { cause: cleanupError },
      );
    }
    throw error;
  }
}

async function injectOutputDirectorySwapAfterCommitForTest(
  directory: PrivateOutputDirectory,
): Promise<void> {
  if (process.env["EASYEDA_TEST_SWAP_BRIDGE_OUTPUT_AFTER_COMMIT"] !== "1") {
    return;
  }
  const displacedPath = `${directory.path}.swapped-after-commit-for-test`;
  await rename(directory.path, displacedPath);
  await mkdir(directory.path, { mode: 0o700 });
}

function injectCrashBeforeBridgeCommitForTest(): void {
  if (process.env["EASYEDA_TEST_CRASH_BEFORE_BRIDGE_COMMIT"] !== "1") {
    return;
  }
  process.kill(process.pid, "SIGKILL");
  throw new Error("The injected bridge-build crash signal did not terminate.");
}


function crc32(data: Uint8Array): number {
  let crc = 4_294_967_295;
  for (const byte of data) {
    crc = (crc ^ byte) >>> 0;
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = ((crc >>> 1) ^ (mask & 3_988_292_384)) >>> 0;
    }
  }
  return (crc ^ 4_294_967_295) >>> 0;
}

function isWithin(parent: string, candidate: string): boolean {
  const child = relative(parent, candidate);
  return (
    child === "" ||
    (child !== ".." && !child.startsWith(`..${sep}`) && !isAbsolute(child))
  );
}

function pathsOverlap(left: string, right: string): boolean {
  return isWithin(left, right) || isWithin(right, left);
}

async function canonicalPathWhenPresent(path: string): Promise<string | undefined> {
  try {
    return await realpath(path);
  } catch (error) {
    if (errorCode(error) === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

async function assertTokenArtifactSeparation(
  tokenPath: string,
  outputPath: string,
  receiptPath: string,
  lockPath: string,
): Promise<void> {
  if (
    pathsOverlap(tokenPath, outputPath) ||
    pathsOverlap(tokenPath, receiptPath) ||
    pathsOverlap(tokenPath, lockPath)
  ) {
    throw new Error(
      "The bridge output, receipt, and pair lock must not overlap the bridge token path.",
    );
  }
  const [canonicalOutput, canonicalReceipt, canonicalLock] = await Promise.all([
    canonicalPathWhenPresent(outputPath),
    canonicalPathWhenPresent(receiptPath),
    canonicalPathWhenPresent(lockPath),
  ]);
  if (
    (canonicalOutput !== undefined &&
      pathsOverlap(tokenPath, canonicalOutput)) ||
    (canonicalReceipt !== undefined &&
      pathsOverlap(tokenPath, canonicalReceipt)) ||
    (canonicalLock !== undefined && pathsOverlap(tokenPath, canonicalLock))
  ) {
    throw new Error(
      "A canonical bridge artifact path overlaps the bridge token path.",
    );
  }
}

async function loadSeparatedBridgeToken(
  capability: BridgeTokenFileCapability,
  outputPath: string,
  receiptPath: string,
  lockPath: string,
): Promise<BridgeTokenProof> {
  const proof = await capability.read();
  await assertTokenArtifactSeparation(
    proof.path,
    outputPath,
    receiptPath,
    lockPath,
  );
  await capability.assertCurrent();
  return proof;
}

function assertSourceOnlyBundle(
  metafile: Metafile,
): void {
  const sourcePrefix = `${SEALED_VENDORED_MEMORY_NAMESPACE}:src/`;
  const unexpected = Object.keys(metafile.inputs).filter(
    (input) => !input.startsWith(sourcePrefix),
  );
  if (unexpected.length > 0) {
    throw new Error(
      `Authenticated bridge unexpectedly bundles non-vendored input(s): ${unexpected.toSorted().join(", ")}. Review licenses before adding dependencies.`,
    );
  }
}

function zipArchive(entries: readonly ArchiveEntry[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let localOffset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const compressed = deflateRawSync(entry.data, { level: 9 });
    const checksum = crc32(entry.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(67_324_752, 0);
    local.writeUInt16LE(ZIP_VERSION, 4);
    local.writeUInt16LE(ZIP_UTF8_FLAG, 6);
    local.writeUInt16LE(ZIP_DEFLATE_METHOD, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(33, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(33_639_248, 0);
    central.writeUInt16LE(788, 4);
    central.writeUInt16LE(ZIP_VERSION, 6);
    central.writeUInt16LE(ZIP_UTF8_FLAG, 8);
    central.writeUInt16LE(ZIP_DEFLATE_METHOD, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(33, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(33_188 * 65_536, 38);
    central.writeUInt32LE(localOffset, 42);
    centralParts.push(central, name);
    localOffset += local.length + name.length + compressed.length;
  }
  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(101_010_256, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(localOffset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function isPackagedReviewedSource(path: string): boolean {
  return (
    path === "extension.json" ||
    path === "LICENSE" ||
    path === "NOTICE" ||
    path === "README.md" ||
    path === "CHANGELOG.md" ||
    path.startsWith("images/") ||
    path.startsWith("locales/")
  );
}

function captureReviewedBuildSnapshot(
  sourceRoot: string,
): Promise<StagedVendoredSourceSnapshot> {
  return captureReviewedVendoredSourceSnapshot(sourceRoot);
}

function argumentValue(
  cliArguments: readonly string[],
  name: string,
): string | undefined {
  const index = cliArguments.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  const value = cliArguments[index + 1];
  if (value === undefined || value.length === 0) {
    throw new Error(`${name} requires a value.`);
  }
  return value;
}

async function rethrowAfterCleanup(
  error: unknown,
  cleanup: () => Promise<void>,
  label: string,
): Promise<never> {
  try {
    await cleanup();
  } catch (cleanupError) {
    throw new AggregateError(
      [error, cleanupError],
      `${label} and cleanup both failed.`,
      { cause: cleanupError },
    );
  }
  throw asError(error, `${label} failed.`);
}

const scriptDirectory = import.meta.dirname;
const pluginRoot = resolve(scriptDirectory, "..");
const bridgeRoot = join(pluginRoot, "easyeda-bridge-extension");
const cliArguments = process.argv.slice(2);
await assertSelfSoftCoreLimitZero();
const tokenFile = bridgeTokenPathFromArguments(cliArguments);
const outputPath = resolve(
  argumentValue(cliArguments, "--output") ??
    defaultAuthenticatedBridgeOutputPath(),
);
if (!outputPath.endsWith(".eext")) {
  throw new Error("The authenticated bridge output path must end with .eext.");
}
if (
  /[.][a-f0-9]{64}$/u.test(
    basename(outputPath).slice(0, -".eext".length),
  )
) {
  throw new Error(
    "The authenticated bridge output basename must not occupy the reserved content-addressed generation namespace.",
  );
}
const receiptPath = `${outputPath}.receipt.json`;
const pairLockPath = privatePairLockPath(outputPath);
const controlDataDirectory = bridgeControlDataDirectory();
const privateBridgeBuildDirectory = join(
  controlDataDirectory,
  AUTHENTICATED_BRIDGE_BUILD_DIRECTORY,
);
if (isWithin(pluginRoot, outputPath) || isWithin(pluginRoot, receiptPath)) {
  throw new Error(
    "The credential-bearing bridge extension and receipt must be written outside the plugin repository.",
  );
}
if (
  (isWithin(controlDataDirectory, outputPath) &&
    !isWithin(privateBridgeBuildDirectory, outputPath)) ||
  (isWithin(controlDataDirectory, receiptPath) &&
    !isWithin(privateBridgeBuildDirectory, receiptPath))
) {
  throw new Error(
    "A bridge output inside the control-data directory must remain under its reserved bridge-build subtree.",
  );
}
const tokenCapability = await runWithZeroSoftCoreLimit(() =>
  openBridgeTokenFileCapability(tokenFile),
);
const tokenProof: BridgeTokenProof = await loadSeparatedBridgeToken(
  tokenCapability,
  outputPath,
  receiptPath,
  pairLockPath,
).catch((error: unknown) =>
  rethrowAfterCleanup(
    error,
    () => tokenCapability.close(),
    "Bridge token validation",
  ),
);
const privateOutputDirectory: PrivateOutputDirectory =
  await openPrivateOutputDirectory(outputPath).catch((error: unknown) =>
    rethrowAfterCleanup(
      error,
      () => tokenCapability.close(),
      "Private bridge output-directory acquisition",
    ),
  );
let privatePairLock: PrivatePairLock | undefined;
let recoveredOrphanCandidates: readonly string[] = [];
let retainedPrivateGenerations: readonly string[] = [];
let observedPrivatePairLockCandidateNames: readonly string[] = [];
let successOutput: string | undefined;
let operationFailure: unknown;
try {
  privatePairLock = await acquirePrivatePairLock(
    privateOutputDirectory,
    pairLockPath,
  );
  injectStopAfterPrivatePairLockAcquisitionForTest();
  // Only the exclusive lock owner may recover archive, receipt, or immutable candidates.
  // Pair-lock candidates belong solely to their creator; no other process scans them.
  recoveredOrphanCandidates = await removeOrphanedPrivateCandidates(
    privateOutputDirectory,
    outputPath,
    receiptPath,
  );
  const [legacyOutput] = await Promise.all([
    inspectExistingPrivateOutput(privateOutputDirectory, outputPath),
    inspectExistingPrivateOutput(privateOutputDirectory, receiptPath),
  ]);
  if (legacyOutput !== undefined) {
    throw new Error(
      `A legacy fixed-path bridge archive still exists at ${outputPath}. Verify that it is obsolete, remove it, then rebuild and import only the content-addressed outputPath named by ${receiptPath}.`,
    );
  }
  const sourceSnapshot = await captureReviewedBuildSnapshot(bridgeRoot);
  const { closure: sourceClosure } = sourceSnapshot;
  const sealedSourcePlugin = sealedVendoredMemoryPlugin(sourceSnapshot);
  const commonOptions = {
    absWorkingDir: "/tmp",
    bundle: true,
    format: "iife" as const,
    minifySyntax: true,
    platform: "browser" as const,
    target: "es2020",
    plugins: [sealedSourcePlugin],
    tsconfigRaw: { compilerOptions: { useDefineForClassFields: true } },
    define: {
      __MCP_DISPATCHER_BUILD_ID__: JSON.stringify(BUILD_ID_PLACEHOLDER),
    },
  };
  const dispatcherBuild = await build({
    ...commonOptions,
    entryPoints: ["src/dispatcher-entry.ts"],
    format: "esm",
    metafile: true,
    outfile: "dispatcher.js",
    write: false,
  });
  assertSourceOnlyBundle(dispatcherBuild.metafile);
  if (dispatcherBuild.outputFiles.length !== 1) {
    throw new Error("Authenticated dispatcher build did not produce one output.");
  }
  const placeholderBundle = dispatcherBuild.outputFiles[0]?.text;
  if (placeholderBundle === undefined) {
    throw new Error("Authenticated dispatcher build output is absent.");
  }
  const dispatcherDigest = createHash("sha256")
    .update(placeholderBundle)
    .digest("hex");
  const buildId = `d${dispatcherDigest.slice(0, 4)}x${dispatcherDigest.slice(4, 8)}x${dispatcherDigest.slice(8, 12)}`;
  const stampedDispatcher = placeholderBundle.replaceAll(
    BUILD_ID_PLACEHOLDER,
    buildId,
  );
  const indexBuild = await build({
    ...commonOptions,
    entryPoints: ["src/index.ts"],
    outfile: "index.js",
    globalName: "edaEsbuildExportName",
    metafile: true,
    write: false,
    define: {
      ...commonOptions.define,
      BRIDGE_AUTHENTICATED_PORT: String(AUTHENTICATED_BRIDGE_PORT),
      BRIDGE_AUTHENTICATION_KEY: JSON.stringify(tokenProof.token),
      __MCP_AUTHENTICATED_INDEX_BUILD_ID__: JSON.stringify(
        INDEX_BUILD_ID_PLACEHOLDER,
      ),
      __MCP_AUTHENTICATION_KEY_SHA256__: JSON.stringify(tokenProof.sha256),
      __MCP_DISPATCHER_BUILD_ID__: JSON.stringify(buildId),
    },
  });
  assertSourceOnlyBundle(indexBuild.metafile);
  if (indexBuild.outputFiles.length !== 1) {
    throw new Error("Authenticated bridge build did not produce one output.");
  }
  const placeholderIndexBundle = indexBuild.outputFiles[0]?.text;
  if (placeholderIndexBundle === undefined) {
    throw new Error("Authenticated bridge build output is absent.");
  }
  if (!placeholderIndexBundle.includes(INDEX_BUILD_ID_PLACEHOLDER)) {
    throw new Error(
      "Authenticated bridge build identity placeholder is absent.",
    );
  }
  const authenticatedIndexBuildId = `i${createHash("sha256")
    .update(placeholderIndexBundle, "utf8")
    .digest("base64url")}`;
  const indexBundle = Buffer.from(
    placeholderIndexBundle.replaceAll(
      INDEX_BUILD_ID_PLACEHOLDER,
      authenticatedIndexBuildId,
    ),
    "utf8",
  );
  const indexSha256 = createHash("sha256").update(indexBundle).digest("hex");
  const stampedDispatcherBytes = Buffer.from(stampedDispatcher, "utf8");
  const dispatcherMeta = {
    buildId,
    sha256: createHash("sha256")
      .update(stampedDispatcherBytes)
      .digest("hex"),
    byteLength: stampedDispatcherBytes.length,
    authenticated: true,
    packagedExecutable: false,
    purpose: "reviewed-dispatcher-build-identity",
    tokenSha256: tokenProof.sha256,
  };
  const dispatcherMetaBytes = Buffer.from(
    `${JSON.stringify(dispatcherMeta, null, 2)}\n`,
    "utf8",
  );

  const archiveEntries: ArchiveEntry[] = sourceSnapshot.files
    .filter((file) => isPackagedReviewedSource(file.path))
    .map((file) => ({ data: Buffer.from(file.bytes), name: file.path }));
  assertSealedVendoredMemoryUnchanged(sourceSnapshot);
  archiveEntries.push(
    { data: indexBundle, name: "dist/index.js" },
    { data: dispatcherMetaBytes, name: "dist/dispatcher.meta.json" },
  );
  archiveEntries.sort((left, right) => left.name.localeCompare(right.name));
  const archive = zipArchive(archiveEntries);
  const outputSha256 = createHash("sha256").update(archive).digest("hex");
  const generationOutputPath = immutableGenerationOutputPath(
    outputPath,
    outputSha256,
  );
  await assertTokenArtifactSeparation(
    tokenProof.path,
    generationOutputPath,
    receiptPath,
    pairLockPath,
  );
  await tokenCapability.assertCurrent();
  const receipt = {
    schema: "easyeda-pro-control.authenticated-bridge-build.v2",
    outputPath: generationOutputPath,
    outputSha256,
    outputBytes: archive.length,
    tokenSha256: tokenProof.sha256,
    authentication: {
      protocol: AUTHENTICATION_PROTOCOL,
      publicEndpoint: {
        host: AUTHENTICATED_BRIDGE_HOST,
        port: AUTHENTICATED_BRIDGE_PORT,
      },
      rawTokenTransmission: false,
      adjacentPortFallback: false,
    },
    buildId,
    authenticatedIndexBuildId,
    indexSha256,
    dispatcherSha256: dispatcherMeta.sha256,
    source: {
      repository: REVIEWED_BRIDGE_SOURCE.repository,
      commit: REVIEWED_BRIDGE_SOURCE.commit,
      upstreamTreeSha1: REVIEWED_BRIDGE_SOURCE.upstreamTreeSha1,
      closureSha256: sourceClosure.sha256,
      fileCount: sourceClosure.fileCount,
      totalBytes: sourceClosure.totalBytes,
      derivative: REVIEWED_BRIDGE_SOURCE.derivative,
      vendoredDirectory: bridgeRoot,
      builtFromPrivateSnapshot: true,
      privateSnapshotSealed: true,
      postConsumptionVerified: true,
      sealedPathCount: sourceSnapshot.pathSeals.length,
    },
  };
  await publishImmutablePrivateOutput(
    privateOutputDirectory,
    generationOutputPath,
    archive,
    outputSha256,
  );
  injectCrashBeforeBridgeCommitForTest();
  await atomicallyCommitPrivateReceipt(
    privateOutputDirectory,
    receiptPath,
    Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`, "utf8"),
  );
  injectStopAfterPrivateReceiptCommitForTest();
  await tokenCapability.assertCurrent();
  retainedPrivateGenerations = await listRetainedPrivateGenerations(
    privateOutputDirectory,
    outputPath,
    generationOutputPath,
  );
  observedPrivatePairLockCandidateNames =
    await listObservedPrivatePairLockCandidateNames(
      privateOutputDirectory,
      pairLockPath,
    );
  await injectOutputDirectorySwapAfterCommitForTest(privateOutputDirectory);
  await tokenCapability.assertCurrent();
  successOutput = `${JSON.stringify(receipt)}\n`;
} catch (error) {
  operationFailure = error;
}
const cleanupFailures: unknown[] = [];
if (privatePairLock !== undefined) {
  await releasePrivatePairLock(
    privateOutputDirectory,
    privatePairLock,
  ).catch((error: unknown) => {
    cleanupFailures.push(error);
  });
}
await privateOutputDirectory.handle.close().catch((error: unknown) => {
  cleanupFailures.push(error);
});
await tokenCapability.close().catch((error: unknown) => {
  cleanupFailures.push(error);
});
if (operationFailure !== undefined) {
  if (cleanupFailures.length > 0) {
    throw new AggregateError(
      [operationFailure, ...cleanupFailures],
      "Authenticated bridge build and cleanup both failed.",
      { cause: operationFailure },
    );
  }
  throw asError(operationFailure, "Authenticated bridge build failed.");
}
if (cleanupFailures.length === 1) {
  throw asError(
    cleanupFailures[0],
    "Authenticated bridge build cleanup failed.",
  );
}
if (cleanupFailures.length > 1) {
  throw new AggregateError(
    cleanupFailures,
    "Authenticated bridge build cleanup was incomplete.",
  );
}
await assertPrivateOutputPathIdentityAfterClose(privateOutputDirectory);
if (successOutput === undefined) {
  throw new Error("The authenticated bridge build completed without a receipt.");
}
if (
  recoveredOrphanCandidates.length > 0 ||
  retainedPrivateGenerations.length > 0 ||
  observedPrivatePairLockCandidateNames.length > 0
) {
  process.stderr.write(
    `${JSON.stringify({
      schema: "easyeda-pro-control.authenticated-bridge-recovery.v1",
      privateOutputDirectory: {
        path: privateOutputDirectory.path,
        device: privateOutputDirectory.device.toString(10),
        inode: privateOutputDirectory.inode.toString(10),
      },
      removedPrivateCandidates: recoveredOrphanCandidates,
      observedPrivatePairLockCandidateNames,
      retainedSupersededOrUncommittedGenerations: retainedPrivateGenerations,
    })}\n`,
  );
}
process.stdout.write(successOutput);
