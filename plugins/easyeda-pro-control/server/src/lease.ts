import { randomUUID } from "node:crypto";
import {
  closeSync,
  constants as fsConstants,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  unlinkSync,
} from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, readFile, rename, unlink } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { setTimeout as wait } from "node:timers/promises";

import { openControlRootCapability } from "./control-root.ts";
import type { ControlRootCapability } from "./control-root.ts";

interface LeaseRecord {
  schema: "easyeda-pro-control.facade-lease.v1";
  token: string;
  pid: number;
  pidStartTime?: string;
  childPid?: number;
  childStartTime?: string;
  startedAt: unknown;
}

interface CleanupLeaseRecord {
  schema: "easyeda-pro-control.facade-lease-cleanup.v1";
  token: string;
  pid: number;
  staleToken: string;
  startedAt: unknown;
}

interface PrivateFileIdentity {
  readonly device: bigint;
  readonly inode: bigint;
}

interface ParsedPrivateRecord<RecordType> {
  readonly identity: PrivateFileIdentity;
  readonly record: RecordType;
}

const MAXIMUM_LEASE_RECORD_BYTES = 4096n;

export interface FacadeLease {
  path: string;
  token: string;
  pid: number;
  bindChild: (pid: number) => Promise<void>;
  release: () => Promise<void>;
  releaseSync: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorCode(error: unknown): string | undefined {
  return isRecord(error) && typeof error["code"] === "string"
    ? error["code"]
    : undefined;
}

function privateMode(mode: bigint): number {
  return Number(mode % 512n);
}

function identityOf(information: BigIntStats): PrivateFileIdentity {
  return { device: information.dev, inode: information.ino };
}

function sameIdentity(
  information: { readonly dev: bigint; readonly ino: bigint },
  identity: PrivateFileIdentity,
): boolean {
  return information.dev === identity.device && information.ino === identity.inode;
}

function assertPrivateLeaseFile(
  information: BigIntStats,
  label: string,
  expectedLinkCount = 1n,
): void {
  if (
    information.isSymbolicLink() ||
    !information.isFile() ||
    information.nlink !== expectedLinkCount ||
    privateMode(information.mode) !== 0o600 ||
    information.size <= 0n ||
    information.size > MAXIMUM_LEASE_RECORD_BYTES ||
    (typeof process.getuid === "function" &&
      information.uid !== BigInt(process.getuid()))
  ) {
    throw new Error(
      `${label} must be a current-user-owned, single-link, mode-0600 regular file.`,
    );
  }
}

function readPrivateRecordTextSync(
  path: string,
  label: string,
): { readonly identity: PrivateFileIdentity; readonly text: string } {
  const pathInformation = lstatSync(path, { bigint: true });
  assertPrivateLeaseFile(pathInformation, label);
  const descriptor = openSync(
    path,
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW | fsConstants.O_NONBLOCK,
  );
  try {
    const opened = fstatSync(descriptor, { bigint: true });
    assertPrivateLeaseFile(opened, label);
    if (!sameIdentity(opened, identityOf(pathInformation))) {
      throw new Error(`${label} changed before descriptor open.`);
    }
    const text = readFileSync(descriptor, "utf8");
    const after = fstatSync(descriptor, { bigint: true });
    const currentPath = lstatSync(path, { bigint: true });
    assertPrivateLeaseFile(after, label);
    assertPrivateLeaseFile(currentPath, label);
    assertStablePrivateLeaseFile(opened, after, label);
    assertStablePrivateLeaseFile(after, currentPath, label);
    return { identity: identityOf(after), text };
  } finally {
    closeSync(descriptor);
  }
}

function assertStablePrivateLeaseFile(
  before: BigIntStats,
  after: BigIntStats,
  label: string,
): void {
  if (
    !sameIdentity(after, identityOf(before)) ||
    after.size !== before.size ||
    after.mode !== before.mode ||
    after.nlink !== before.nlink ||
    after.mtimeNs !== before.mtimeNs ||
    after.ctimeNs !== before.ctimeNs
  ) {
    throw new Error(`${label} changed while it was being read.`);
  }
}

async function readPrivateRecordText(
  path: string,
  label: string,
): Promise<{ readonly identity: PrivateFileIdentity; readonly text: string }> {
  const pathInformation = await lstat(path, { bigint: true });
  assertPrivateLeaseFile(pathInformation, label);
  const handle = await open(
    path,
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW | fsConstants.O_NONBLOCK,
  );
  let result:
    | { readonly identity: PrivateFileIdentity; readonly text: string }
    | undefined;
  let operationFailure: unknown;
  try {
    const opened = await handle.stat({ bigint: true });
    assertPrivateLeaseFile(opened, label);
    if (!sameIdentity(opened, identityOf(pathInformation))) {
      throw new Error(`${label} changed before descriptor open.`);
    }
    const text = await handle.readFile("utf8");
    const [after, currentPath] = await Promise.all([
      handle.stat({ bigint: true }),
      lstat(path, { bigint: true }),
    ]);
    assertPrivateLeaseFile(after, label);
    assertPrivateLeaseFile(currentPath, label);
    assertStablePrivateLeaseFile(opened, after, label);
    assertStablePrivateLeaseFile(after, currentPath, label);
    result = { identity: identityOf(after), text };
  } catch (error) {
    operationFailure = error;
  }
  try {
    await handle.close();
  } catch (closeError) {
    if (operationFailure !== undefined) {
      throw new AggregateError(
        [operationFailure, closeError],
        `${label} read and descriptor cleanup both failed.`,
        { cause: closeError },
      );
    }
    throw closeError;
  }
  if (operationFailure !== undefined) {
    throw operationFailure instanceof Error
      ? operationFailure
      : new Error(`${label} read failed.`, { cause: operationFailure });
  }
  if (result === undefined) {
    throw new Error(`${label} read produced no result.`);
  }
  return result;
}

async function writeNewPrivateRecord(
  handle: FileHandle,
  path: string,
  value: unknown,
  label: string,
): Promise<PrivateFileIdentity> {
  await handle.chmod(0o600);
  await handle.writeFile(`${JSON.stringify(value)}\n`, "utf8");
  await handle.sync();
  const [opened, currentPath] = await Promise.all([
    handle.stat({ bigint: true }),
    lstat(path, { bigint: true }),
  ]);
  assertPrivateLeaseFile(opened, label);
  assertPrivateLeaseFile(currentPath, label);
  const identity = identityOf(opened);
  if (!sameIdentity(currentPath, identity)) {
    throw new Error(`${label} changed during exclusive publication.`);
  }
  return identity;
}

async function unlinkExpectedPrivateRecord(
  root: ControlRootCapability,
  path: string,
  identity: PrivateFileIdentity,
  label: string,
): Promise<void> {
  const pathInformation = await lstat(path, { bigint: true });
  assertPrivateLeaseFile(pathInformation, label);
  if (!sameIdentity(pathInformation, identity)) {
    throw new Error(`${label} identity changed before cleanup.`);
  }
  const handle = await open(
    path,
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW | fsConstants.O_NONBLOCK,
  );
  let operationFailure: unknown;
  try {
    const [opened, currentPath] = await Promise.all([
      handle.stat({ bigint: true }),
      lstat(path, { bigint: true }),
    ]);
    assertPrivateLeaseFile(opened, label);
    assertPrivateLeaseFile(currentPath, label);
    if (
      !sameIdentity(opened, identity) ||
      !sameIdentity(currentPath, identity)
    ) {
      throw new Error(`${label} identity changed before unlink.`);
    }
    await unlink(path);
    await syncControlRoot(root);
    const unlinked = await handle.stat({ bigint: true });
    if (!sameIdentity(unlinked, identity) || unlinked.nlink !== 0n) {
      throw new Error(`${label} did not become descriptor-only after unlink.`);
    }
  } catch (error) {
    operationFailure = error;
  }
  try {
    await handle.close();
  } catch (closeError) {
    if (operationFailure !== undefined) {
      throw new AggregateError(
        [operationFailure, closeError],
        `${label} cleanup and descriptor close both failed.`,
        { cause: closeError },
      );
    }
    throw closeError;
  }
  if (operationFailure !== undefined) {
    throw operationFailure instanceof Error
      ? operationFailure
      : new Error(`${label} cleanup failed.`, { cause: operationFailure });
  }
}

function unlinkExpectedPrivateRecordSync(
  path: string,
  identity: PrivateFileIdentity,
  label: string,
): void {
  const pathInformation = lstatSync(path, { bigint: true });
  assertPrivateLeaseFile(pathInformation, label);
  if (!sameIdentity(pathInformation, identity)) {
    throw new Error(`${label} identity changed before synchronous cleanup.`);
  }
  const descriptor = openSync(
    path,
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW | fsConstants.O_NONBLOCK,
  );
  try {
    const opened = fstatSync(descriptor, { bigint: true });
    const currentPath = lstatSync(path, { bigint: true });
    assertPrivateLeaseFile(opened, label);
    assertPrivateLeaseFile(currentPath, label);
    if (
      !sameIdentity(opened, identity) ||
      !sameIdentity(currentPath, identity)
    ) {
      throw new Error(`${label} identity changed before synchronous unlink.`);
    }
    unlinkSync(path);
    const unlinked = fstatSync(descriptor, { bigint: true });
    if (!sameIdentity(unlinked, identity) || unlinked.nlink !== 0n) {
      throw new Error(
        `${label} did not become descriptor-only after synchronous unlink.`,
      );
    }
  } finally {
    closeSync(descriptor);
  }
}

async function retryHandleCloseAfterFailure(
  handle: FileHandle | undefined,
  failure: unknown,
  label: string,
): Promise<void> {
  if (handle === undefined) {
    return;
  }
  try {
    // Node FileHandle.close() is idempotent.
    // Retrying settles an uncertain first close without penalizing an already-closed handle.
    await handle.close();
  } catch (closeError) {
    throw new AggregateError(
      [failure, closeError],
      `${label} and file-handle cleanup both failed.`,
      { cause: closeError },
    );
  }
}

function pidIsAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return errorCode(error) === "EPERM";
  }
}

async function linuxProcessStartTime(pid: number): Promise<string | undefined> {
  if (process.platform !== "linux") {
    return undefined;
  }
  let statLine: string;
  try {
    statLine = await readFile(`/proc/${pid}/stat`, "utf8");
  } catch (error) {
    if (errorCode(error) === "ENOENT" || errorCode(error) === "ESRCH") {
      return undefined;
    }
    throw error;
  }
  const closingParenthesis = statLine.lastIndexOf(")");
  if (closingParenthesis === -1) {
    throw new Error(`Could not parse process identity for pid ${pid}.`);
  }
  const fields = statLine.slice(closingParenthesis + 1).trim().split(/\s+/u);
  const startTime = fields[19];
  if (startTime === undefined || !/^\d+$/u.test(startTime)) {
    throw new Error(`Could not parse process start time for pid ${pid}.`);
  }
  return startTime;
}

async function exactProcessIsAlive(
  pid: number,
  startTime: string | undefined,
): Promise<boolean> {
  if (!pidIsAlive(pid)) {
    return false;
  }
  if (startTime === undefined || process.platform !== "linux") {
    return true;
  }
  return (await linuxProcessStartTime(pid)) === startTime;
}

async function boundChildExited(record: LeaseRecord): Promise<boolean> {
  if (record.childPid === undefined) {
    return true;
  }
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (!(await exactProcessIsAlive(record.childPid, record.childStartTime))) {
      return true;
    }
    await wait(125);
  }
  return !(await exactProcessIsAlive(record.childPid, record.childStartTime));
}

async function syncControlRoot(root: ControlRootCapability): Promise<void> {
  await root.assertCurrent();
  await root.handle.sync();
}

function decodeLease(text: string): LeaseRecord {
  const value: unknown = JSON.parse(text);
  if (
    !isRecord(value) ||
    value["schema"] !== "easyeda-pro-control.facade-lease.v1" ||
    typeof value["pid"] !== "number" ||
    !Number.isInteger(value["pid"]) ||
    value["pid"] <= 0 ||
    typeof value["token"] !== "string" ||
    value["token"].length < 16 ||
    !(
      value["pidStartTime"] === undefined ||
      (typeof value["pidStartTime"] === "string" &&
        /^\d+$/u.test(value["pidStartTime"]))
    ) ||
    !(
      (value["childPid"] === undefined &&
        value["childStartTime"] === undefined) ||
      (typeof value["childPid"] === "number" &&
        Number.isInteger(value["childPid"]) &&
        value["childPid"] > 0 &&
        (value["childStartTime"] === undefined ||
          (typeof value["childStartTime"] === "string" &&
            /^\d+$/u.test(value["childStartTime"]))))
    )
  ) {
    throw new Error(
      "The EasyEDA facade lease is corrupt; refusing to remove it automatically.",
    );
  }
  return {
    schema: "easyeda-pro-control.facade-lease.v1",
    token: value["token"],
    pid: value["pid"],
    ...(typeof value["pidStartTime"] === "string"
      ? { pidStartTime: value["pidStartTime"] }
      : {}),
    ...(typeof value["childPid"] === "number"
      ? { childPid: value["childPid"] }
      : {}),
    ...(typeof value["childStartTime"] === "string"
      ? { childStartTime: value["childStartTime"] }
      : {}),
    startedAt: value["startedAt"],
  };
}

async function parseLease(
  path: string,
): Promise<ParsedPrivateRecord<LeaseRecord>> {
  const opened = await readPrivateRecordText(path, "EasyEDA facade lease");
  return { identity: opened.identity, record: decodeLease(opened.text) };
}

function parseLeaseSync(path: string): ParsedPrivateRecord<LeaseRecord> {
  const opened = readPrivateRecordTextSync(path, "EasyEDA facade lease");
  return { identity: opened.identity, record: decodeLease(opened.text) };
}

async function parseCleanupLease(
  path: string,
): Promise<ParsedPrivateRecord<CleanupLeaseRecord>> {
  const opened = await readPrivateRecordText(
    path,
    "EasyEDA facade cleanup lease",
  );
  const value: unknown = JSON.parse(opened.text);
  if (
    !isRecord(value) ||
    value["schema"] !== "easyeda-pro-control.facade-lease-cleanup.v1" ||
    typeof value["pid"] !== "number" ||
    !Number.isInteger(value["pid"]) ||
    value["pid"] <= 0 ||
    typeof value["token"] !== "string" ||
    value["token"].length < 16 ||
    typeof value["staleToken"] !== "string" ||
    value["staleToken"].length < 16
  ) {
    throw new Error(
      "The EasyEDA facade cleanup lease is corrupt; refusing to remove it automatically.",
    );
  }
  return {
    identity: opened.identity,
    record: {
      schema: "easyeda-pro-control.facade-lease-cleanup.v1",
      token: value["token"],
      pid: value["pid"],
      staleToken: value["staleToken"],
      startedAt: value["startedAt"],
    },
  };
}

async function acquireCleanupLease(
  root: ControlRootCapability,
  cleanupPath: string,
  staleToken: string,
): Promise<ParsedPrivateRecord<CleanupLeaseRecord>> {
  const token = randomUUID();
  const record: CleanupLeaseRecord = {
    schema: "easyeda-pro-control.facade-lease-cleanup.v1",
    token,
    pid: process.pid,
    staleToken,
    startedAt: new Date().toISOString(),
  };
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let handle: FileHandle | undefined;
    try {
      handle = await open(
        cleanupPath,
        fsConstants.O_WRONLY |
          fsConstants.O_CREAT |
          fsConstants.O_EXCL |
          fsConstants.O_NOFOLLOW,
        0o600,
      );
      const identity = await writeNewPrivateRecord(
        handle,
        cleanupPath,
        record,
        "EasyEDA facade cleanup lease",
      );
      await handle.close();
      handle = undefined;
      await syncControlRoot(root);
      return { identity, record };
    } catch (error) {
      await retryHandleCloseAfterFailure(
        handle,
        error,
        "EasyEDA facade cleanup-lease acquisition",
      );
      if (errorCode(error) !== "EEXIST") {
        throw error;
      }
      let existing: ParsedPrivateRecord<CleanupLeaseRecord>;
      try {
        existing = await parseCleanupLease(cleanupPath);
      } catch (parseError) {
        if (errorCode(parseError) === "ENOENT") {
          continue;
        }
        throw parseError;
      }
      if (pidIsAlive(existing.record.pid)) {
        throw new Error(
          `Another process is reconciling the stale EasyEDA facade lease (pid ${existing.record.pid}).`,
          { cause: error },
        );
      }
      let current: ParsedPrivateRecord<CleanupLeaseRecord>;
      try {
        current = await parseCleanupLease(cleanupPath);
      } catch (readError) {
        if (errorCode(readError) === "ENOENT") {
          continue;
        }
        throw readError;
      }
      if (
        current.record.token !== existing.record.token ||
        current.record.pid !== existing.record.pid ||
        !sameIdentity(
          {
            dev: current.identity.device,
            ino: current.identity.inode,
          },
          existing.identity,
        )
      ) {
        continue;
      }
      await unlinkExpectedPrivateRecord(
        root,
        cleanupPath,
        current.identity,
        "EasyEDA facade cleanup lease",
      );
    }
  }
  throw new Error(
    "Could not acquire the stale EasyEDA facade cleanup lease safely.",
  );
}

async function releaseCleanupLease(
  root: ControlRootCapability,
  cleanupPath: string,
  cleanupLease: ParsedPrivateRecord<CleanupLeaseRecord>,
): Promise<void> {
  const currentCleanup = await parseCleanupLease(cleanupPath);
  if (
    currentCleanup.record.token !== cleanupLease.record.token ||
    currentCleanup.record.pid !== cleanupLease.record.pid ||
    !sameIdentity(
      {
        dev: currentCleanup.identity.device,
        ino: currentCleanup.identity.inode,
      },
      cleanupLease.identity,
    )
  ) {
    throw new Error(
      "EasyEDA facade cleanup-lease ownership changed before release.",
    );
  }
  await unlinkExpectedPrivateRecord(
    root,
    cleanupPath,
    cleanupLease.identity,
    "EasyEDA facade cleanup lease",
  );
}

async function acquireFacadeLeaseWithCapability(
  root: ControlRootCapability,
): Promise<FacadeLease> {
  await root.assertCurrent();
  const path = join(root.path, "facade.lock");
  const boundPath = root.childDescriptorPath(path);
  const token = randomUUID();
  const pidStartTime = await linuxProcessStartTime(process.pid);
  const record: LeaseRecord = {
    schema: "easyeda-pro-control.facade-lease.v1",
    token,
    pid: process.pid,
    ...(pidStartTime === undefined ? {} : { pidStartTime }),
    startedAt: new Date().toISOString(),
  };

  let handle: FileHandle | undefined;
  let ownedLeaseIdentity: PrivateFileIdentity | undefined;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      handle = await open(
        boundPath,
        fsConstants.O_WRONLY |
          fsConstants.O_CREAT |
          fsConstants.O_EXCL |
          fsConstants.O_NOFOLLOW,
        0o600,
      );
      ownedLeaseIdentity = await writeNewPrivateRecord(
        handle,
        boundPath,
        record,
        "EasyEDA facade lease",
      );
      await handle.close();
      handle = undefined;
      await syncControlRoot(root);
      break;
    } catch (error) {
      await retryHandleCloseAfterFailure(
        handle,
        error,
        "EasyEDA facade lease acquisition",
      );
      handle = undefined;
      if (errorCode(error) !== "EEXIST" || attempt > 0) {
        throw error;
      }
      const existing = await parseLease(boundPath);
      if (
        await exactProcessIsAlive(
          existing.record.pid,
          existing.record.pidStartTime,
        )
      ) {
        throw new Error(
          `Another EasyEDA control facade owns ${path} (pid ${existing.record.pid}). Reuse that MCP connection or close it first.`,
          { cause: error },
        );
      }
      if (
        existing.record.pidStartTime === undefined &&
        existing.record.childPid === undefined
      ) {
        throw new Error(
          "The stale EasyEDA facade lease predates supervised-child identity tracking. It may have left an untracked bridge owner alive; refusing automatic cleanup. Verify and stop any old upstream process, then remove only this exact lease manually.",
          { cause: error },
        );
      }
      const boundCleanupPath = `${boundPath}.cleanup`;
      const cleanupLease = await acquireCleanupLease(
        root,
        boundCleanupPath,
        existing.record.token,
      );
      try {
        const current = await parseLease(boundPath);
        if (
          current.record.token !== existing.record.token ||
          current.record.pid !== existing.record.pid ||
          !sameIdentity(
            { dev: current.identity.device, ino: current.identity.inode },
            existing.identity,
          )
        ) {
          throw new Error(
            "EasyEDA facade lease changed during stale-owner reconciliation.",
            { cause: error },
          );
        }
        if (!(await boundChildExited(current.record))) {
          throw new Error(
            `The stale EasyEDA facade still has a live upstream supervisor (pid ${String(current.record.childPid)}); refusing to remove its lease.`,
            { cause: error },
          );
        }
        await unlinkExpectedPrivateRecord(
          root,
          boundPath,
          current.identity,
          "EasyEDA facade lease",
        );
      } catch (reconciliationError) {
        try {
          await releaseCleanupLease(root, boundCleanupPath, cleanupLease);
        } catch (cleanupError) {
          throw new AggregateError(
            [reconciliationError, cleanupError],
            "EasyEDA facade lease reconciliation and cleanup both failed.",
            { cause: cleanupError },
          );
        }
        throw reconciliationError;
      }
      await releaseCleanupLease(root, boundCleanupPath, cleanupLease);
    }
  }

  if (ownedLeaseIdentity === undefined) {
    throw new Error("EasyEDA facade lease acquisition produced no identity.");
  }
  let activeLeaseIdentity: PrivateFileIdentity = ownedLeaseIdentity;

  const ownsLease = (value: unknown): value is LeaseRecord =>
    isRecord(value) && value["token"] === token && value["pid"] === process.pid;
  const bindChild = async (childPid: number): Promise<void> => {
    if (!Number.isInteger(childPid) || childPid <= 0) {
      throw new Error("The upstream supervisor PID must be a positive integer.");
    }
    const childStartTime = await linuxProcessStartTime(childPid);
    if (!(await exactProcessIsAlive(childPid, childStartTime))) {
      throw new Error(
        "The upstream supervisor exited before it could be bound to the facade lease.",
      );
    }
    const existing = await parseLease(boundPath);
    if (
      !ownsLease(existing.record) ||
      !sameIdentity(
        { dev: existing.identity.device, ino: existing.identity.inode },
        activeLeaseIdentity,
      )
    ) {
      throw new Error(
        "EasyEDA facade lease ownership changed before child binding.",
      );
    }
    if (
      existing.record.childPid !== undefined &&
      existing.record.childPid !== childPid &&
      (await exactProcessIsAlive(
        existing.record.childPid,
        existing.record.childStartTime,
      ))
    ) {
      throw new Error(
        `The facade lease is already bound to live supervisor pid ${existing.record.childPid}.`,
      );
    }
    const updated: LeaseRecord = {
      ...existing.record,
      childPid,
      ...(childStartTime === undefined ? {} : { childStartTime }),
    };
    if (childStartTime === undefined) {
      delete updated.childStartTime;
    }
    const temporaryPath = `${boundPath}.${token}.next`;
    let temporaryHandle: FileHandle | undefined;
    let temporaryIdentity: PrivateFileIdentity | undefined;
    let renamed = false;
    try {
      temporaryHandle = await open(
        temporaryPath,
        fsConstants.O_WRONLY |
          fsConstants.O_CREAT |
          fsConstants.O_EXCL |
          fsConstants.O_NOFOLLOW,
        0o600,
      );
      temporaryIdentity = await writeNewPrivateRecord(
        temporaryHandle,
        temporaryPath,
        updated,
        "EasyEDA facade child-bound lease candidate",
      );
      await temporaryHandle.close();
      temporaryHandle = undefined;
      const current = await parseLease(boundPath);
      if (
        !ownsLease(current.record) ||
        !sameIdentity(
          { dev: current.identity.device, ino: current.identity.inode },
          activeLeaseIdentity,
        )
      ) {
        throw new Error(
          "EasyEDA facade lease ownership changed during child binding.",
        );
      }
      await rename(temporaryPath, boundPath);
      renamed = true;
      const published = await parseLease(boundPath);
      if (
        !sameIdentity(
          { dev: published.identity.device, ino: published.identity.inode },
          temporaryIdentity,
        ) ||
        published.record.token !== token ||
        published.record.pid !== process.pid ||
        published.record.childPid !== childPid
      ) {
        throw new Error(
          "EasyEDA facade child-bound lease identity changed during publication.",
        );
      }
      activeLeaseIdentity = temporaryIdentity;
      await syncControlRoot(root);
    } catch (error) {
      const cleanupFailures: unknown[] = [];
      await retryHandleCloseAfterFailure(
        temporaryHandle,
        error,
        "EasyEDA facade child-binding publication",
      ).catch((closeError: unknown) => {
        cleanupFailures.push(closeError);
      });
      if (!renamed && temporaryIdentity !== undefined) {
        await unlinkExpectedPrivateRecord(
          root,
          temporaryPath,
          temporaryIdentity,
          "EasyEDA facade child-bound lease candidate",
        ).catch((unlinkError: unknown) => {
          if (errorCode(unlinkError) !== "ENOENT") {
            cleanupFailures.push(unlinkError);
          }
        });
      }
      if (cleanupFailures.length > 0) {
        throw new AggregateError(
          [error, ...cleanupFailures],
          "EasyEDA facade child binding and cleanup both failed.",
          { cause: error },
        );
      }
      throw error;
    }
  };
  let exitListener: (() => void) | undefined;
  const releaseOnce = async (): Promise<void> => {
    let failure: unknown;
    let existing: ParsedPrivateRecord<LeaseRecord> | undefined;
    try {
      existing = await parseLease(boundPath);
    } catch (error) {
      if (errorCode(error) !== "ENOENT") {
        failure = error;
      }
    }
    if (failure === undefined && existing !== undefined) {
      try {
        if (
          !ownsLease(existing.record) ||
          !sameIdentity(
            { dev: existing.identity.device, ino: existing.identity.inode },
            activeLeaseIdentity,
          )
        ) {
          throw new Error(
            "EasyEDA facade lease ownership changed; refusing to unlink it.",
          );
        }
        await unlinkExpectedPrivateRecord(
          root,
          boundPath,
          activeLeaseIdentity,
          "EasyEDA facade lease",
        );
      } catch (error) {
        if (errorCode(error) !== "ENOENT") {
          failure = error;
        }
      }
    }
    try {
      await root.close();
    } catch (error) {
      failure =
        failure === undefined
          ? error
          : new AggregateError(
              [failure, error],
              "EasyEDA facade lease release and control-root cleanup both failed.",
              { cause: failure },
            );
    }
    if (failure !== undefined) {
      throw failure instanceof Error
        ? failure
        : new Error("EasyEDA facade lease release failed.", { cause: failure });
    }
    if (exitListener !== undefined) {
      process.removeListener("exit", exitListener);
      exitListener = undefined;
    }
  };
  let releasePromise: Promise<void> | undefined;
  const release = (): Promise<void> => {
    releasePromise ??= releaseOnce();
    return releasePromise;
  };
  let syncReleaseAttempted = false;
  const releaseSync = (): void => {
    if (syncReleaseAttempted) {
      return;
    }
    syncReleaseAttempted = true;
    if (exitListener !== undefined) {
      process.removeListener("exit", exitListener);
      exitListener = undefined;
    }
    try {
      const existing = parseLeaseSync(boundPath);
      if (
        ownsLease(existing.record) &&
        sameIdentity(
          { dev: existing.identity.device, ino: existing.identity.inode },
          activeLeaseIdentity,
        ) &&
        existing.record.childPid === undefined
      ) {
        unlinkExpectedPrivateRecordSync(
          boundPath,
          activeLeaseIdentity,
          "EasyEDA facade lease",
        );
      }
    } catch {
      // Exit-only failure retains the lease.
      // The next facade requires exact dead-owner and child reconciliation.
    }
    // Abrupt child-bound exit deliberately retains the lease.
    // FileHandle has no safe synchronous close API: raw close(2) would let its
    // Finalizer close a later reused descriptor. The kernel closes it at exit.
  };
  exitListener = releaseSync;
  process.once("exit", exitListener);
  return {
    path,
    token,
    pid: process.pid,
    bindChild,
    release,
    releaseSync,
  };
}

/**
 * Acquire the process-wide facade lease and transfer ownership of the retained
 * control-root capability to that lease. Both normal and exit-time release
 * close the descriptor after attempting exact-token lease cleanup.
 */
export async function acquireFacadeLease(
  input: string | ControlRootCapability,
): Promise<FacadeLease> {
  const root =
    typeof input === "string" ? await openControlRootCapability(input) : input;
  try {
    return await acquireFacadeLeaseWithCapability(root);
  } catch (error) {
    try {
      await root.close();
    } catch (closeError) {
      throw new AggregateError(
        [error, closeError],
        "EasyEDA facade lease acquisition and control-root cleanup both failed.",
        { cause: closeError },
      );
    }
    throw error;
  }
}
