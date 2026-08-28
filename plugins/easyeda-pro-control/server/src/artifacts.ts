import { createHash, randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import type { Stats } from "node:fs";
import {
  link,
  lstat,
  open,
  readdir,
  rename,
  unlink,
} from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import {
  OPERATION_SCHEMA,
  buildPlanHash,
  canonicalJson,
  errorMessage,
  errorName,
  isErrnoException,
  isRecord,
  sha256Text,
  validateEvidencePaths,
} from "./core.ts";
import type { EvidencePaths, UnknownRecord } from "./core.ts";
import { openControlRootCapability } from "./control-root.ts";
import type { ControlRootCapability } from "./control-root.ts";

const configuredControlDataDirectory = process.env["EASYEDA_CONTROL_DATA_DIR"];
const configuredHomeDirectory = process.env["HOME"];
const CONTROL_DATA_DIR = resolve(
  configuredControlDataDirectory !== undefined &&
    configuredControlDataDirectory.length > 0
    ? configuredControlDataDirectory
    : join(
        configuredHomeDirectory !== undefined &&
          configuredHomeDirectory.length > 0
          ? configuredHomeDirectory
          : "/tmp",
        ".easyeda-pro-control",
      ),
);
const OPERATIONS_DIR = join(CONTROL_DATA_DIR, "operations");
const BRIDGE_TOKEN_PATH = resolve(
  process.env["EASYEDA_BRIDGE_TOKEN_FILE"] ??
    join(CONTROL_DATA_DIR, "bridge-token"),
);
const UPSTREAM_DATA_DIR = resolve(
  process.env["EASYEDA_UPSTREAM_DATA_DIR"] ?? join(CONTROL_DATA_DIR, "upstream"),
);
const UPSTREAM_PUBLIC_ARTIFACT_DIR = join(
  UPSTREAM_DATA_DIR,
  "artifacts",
  "facade-exports",
);
const BRIDGE_BUILD_DIR = join(CONTROL_DATA_DIR, "bridge-build");
const FACADE_LEASE_PATH = join(CONTROL_DATA_DIR, "facade.lock");
const EVIDENCE_INTEGRITY_MODEL =
  "Unkeyed SHA-256 values detect accidental corruption. They do not authenticate files against a writer with access to the control-data directory.";
let retainedControlRoot: Promise<ControlRootCapability> | undefined;

export interface EvidenceReservation extends EvidencePaths {
  readonly createdAt: string;
  readonly token: string;
}

interface EvidenceReservationBinding {
  readonly schema: "easyeda-pro-control.evidence-reservation-binding.v1";
  readonly tokenSha256: string;
  readonly resultPath: string;
  readonly receiptPath: string;
}

export interface EvidenceAttachment {
  readonly path: string;
  readonly bytes?: number;
  readonly sha256?: string;
  readonly kind?: string;
  readonly identity?: ManagedFileIdentity;
}

export interface ManagedFileIdentity {
  readonly device: string;
  readonly inode: string;
}

export interface PublishedManagedAttachment extends ArtifactDescriptor {
  readonly identity: ManagedFileIdentity;
  readonly kind: string;
  readonly mtimeMs: number;
}

export interface CaptureImage {
  readonly mimeType: string;
  readonly bytes: Buffer;
}

export interface ArtifactDescriptor extends UnknownRecord {
  path: string;
  bytes: number;
  sha256: string;
}

export interface OperationJournal extends UnknownRecord {
  operationId: string;
  plan: UnknownRecord;
  planHash: string;
  artifacts?: ArtifactDescriptor[];
}

interface ArchiveExternalEvidenceOptions {
  readonly evidence?: EvidencePaths;
  readonly reservation?: EvidenceReservation;
  readonly request: unknown;
  readonly result: unknown;
  readonly metadata?: unknown;
  readonly attachments?: readonly EvidenceAttachment[];
}

interface ArchiveCaptureEvidenceOptions {
  readonly reservation?: EvidenceReservation;
  readonly request: unknown;
  readonly payload: unknown;
  readonly images: readonly CaptureImage[];
  readonly metadata?: unknown;
}

interface ManagedFile {
  absolute: string;
  info: Stats;
}

interface OpenManagedFile extends ManagedFile {
  boundPath: string;
  directory: OpenManagedDirectory;
  handle: FileHandle;
}

interface OpenManagedDirectory {
  absolute: string;
  handle: FileHandle;
  info: Stats;
}

interface ManagedFileContents extends ManagedFile {
  bytes: Buffer;
}

interface HashedManagedAttachment extends ArtifactDescriptor {
  identity: ManagedFileIdentity;
  mtimeMs: number;
}

interface ArchivedAttachment extends ArtifactDescriptor {
  kind: string;
}

interface ArchivedCaptureImage extends ArtifactDescriptor {
  mimeType: string;
}

export interface ExternalEvidenceReceipt extends UnknownRecord {
  schema: string;
  createdAt: string;
  resultPath: string;
  receiptPath: string;
  requestSha256: string;
  resultSha256: string;
  receiptSha256: string;
  attachments: ArchivedAttachment[];
  metadata: unknown;
}

export interface CaptureEvidenceReceipt extends UnknownRecord {
  schema: string;
  createdAt: string;
  resultPath: string;
  receiptPath: string;
  requestSha256: string;
  resultSha256: string;
  receiptSha256: string;
  images: ArchivedCaptureImage[];
  metadata: unknown;
}

export interface EvidenceReceiptVerification extends UnknownRecord {
  ok: boolean;
  receiptPath: string;
  resultPath: string;
  receiptHashOk: boolean;
  resultHashOk: boolean;
  imageChecks: { path: string; ok: boolean }[];
  attachmentChecks: {
    path: string | undefined;
    ok: boolean;
    error?: string;
  }[];
}

export interface ArtifactReadResult extends UnknownRecord {
  path: string;
  size: number;
  offset: number;
  bytesRead: number;
  eof: boolean;
  text: string;
}

function isWithin(root: string, candidate: string): boolean {
  const normalizedRoot = resolve(root);
  const normalizedCandidate = resolve(candidate);
  const relation = relative(normalizedRoot, normalizedCandidate);
  return (
    relation.length === 0 ||
    (relation !== ".." &&
      !relation.startsWith(`..${sep}`) &&
      !isAbsolute(relation))
  );
}

function toError(value: unknown): Error {
  return value instanceof Error
    ? value
    : new Error(errorMessage(value), { cause: value });
}

function assertManagedPath(path: string, label = "Artifact"): string {
  const absolute = resolve(path);
  if (!isWithin(CONTROL_DATA_DIR, absolute)) {
    throw new Error(`${label} path must stay inside ${CONTROL_DATA_DIR}.`);
  }
  const tokenParent = dirname(BRIDGE_TOKEN_PATH);
  const tokenDirectoryIsDedicated =
    isWithin(CONTROL_DATA_DIR, BRIDGE_TOKEN_PATH) &&
    tokenParent !== CONTROL_DATA_DIR;
  if (
    absolute === BRIDGE_TOKEN_PATH ||
    (tokenDirectoryIsDedicated && isWithin(tokenParent, absolute)) ||
    isWithin(BRIDGE_BUILD_DIR, absolute) ||
    (isWithin(CONTROL_DATA_DIR, UPSTREAM_DATA_DIR) &&
      isWithin(UPSTREAM_DATA_DIR, absolute) &&
      !isWithin(UPSTREAM_PUBLIC_ARTIFACT_DIR, absolute)) ||
    absolute === FACADE_LEASE_PATH ||
    absolute.startsWith(`${FACADE_LEASE_PATH}.`)
  ) {
    throw new Error(
      `${label} path is reserved for EasyEDA control credentials or process state.`,
    );
  }
  return absolute;
}

async function assertSafeManagedDirectory(directory: string): Promise<string> {
  const opened = await openSafeManagedDirectory(directory);
  await opened.handle.close();
  return opened.absolute;
}

async function openSafeManagedDirectory(
  directory: string,
  createMissing = true,
): Promise<OpenManagedDirectory> {
  const absolute = assertManagedPath(directory, "Directory");
  const root = await controlRootCapability();
  const opened = await root.openDirectory(absolute, createMissing);
  const info = await opened.handle.stat();
  return { absolute, handle: opened.handle, info };
}

function boundManagedChild(
  directory: OpenManagedDirectory,
  absolutePath: string,
): string {
  if (dirname(absolutePath) !== directory.absolute) {
    throw new Error("Managed child does not belong to its bound directory.");
  }
  const name = absolutePath.slice(directory.absolute.length + 1);
  if (name.length === 0 || name.includes("/")) {
    throw new Error("Managed child name must be one nonempty path segment.");
  }
  return `/proc/self/fd/${directory.handle.fd}/${name}`;
}

function assertSameFileIdentity(
  expected: Stats,
  actual: Stats,
  label: string,
): void {
  if (
    !actual.isFile() ||
    expected.dev !== actual.dev ||
    expected.ino !== actual.ino
  ) {
    throw new Error(`${label} was replaced between path validation and open.`);
  }
}

function assertManagedFileAuthority(info: Stats, label: string): void {
  if (
    !info.isFile() ||
    info.nlink !== 1 ||
    (typeof process.getuid === "function" && info.uid !== process.getuid())
  ) {
    throw new Error(
      `${label} must be a current-user-owned single-link regular file.`,
    );
  }
}

async function assertManagedFilePathCurrent(
  absolutePath: string,
  expectedDirectory: OpenManagedDirectory,
  expectedFile: Stats,
  label: string,
): Promise<void> {
  const currentDirectory = await openSafeManagedDirectory(
    dirname(absolutePath),
    false,
  );
  try {
    if (
      currentDirectory.info.dev !== expectedDirectory.info.dev ||
      currentDirectory.info.ino !== expectedDirectory.info.ino
    ) {
      throw new Error(`${label} parent directory changed after publication.`);
    }
    const currentPath = boundManagedChild(currentDirectory, absolutePath);
    const current = await lstat(currentPath);
    assertSameFileIdentity(expectedFile, current, label);
    assertManagedFileAuthority(current, label);
  } finally {
    await currentDirectory.handle.close();
  }
}

function assertFileStayedUnchanged(
  before: Stats,
  after: Stats,
  label: string,
): void {
  if (
    before.dev !== after.dev ||
    before.ino !== after.ino ||
    before.size !== after.size ||
    before.mtimeMs !== after.mtimeMs ||
    before.ctimeMs !== after.ctimeMs
  ) {
    throw new Error(`${label} changed while it was being read.`);
  }
}

async function openSafeManagedFile(
  path: string,
  label = "Artifact",
): Promise<OpenManagedFile> {
  const absolute = assertManagedPath(path, label);
  if (absolute === CONTROL_DATA_DIR) {
    throw new Error(`${label} must be a regular non-symlink file.`);
  }
  // Artifact reads and verification are contractually read-only.
  // Missing parents stay missing; only publication helpers may create them.
  const directory = await openSafeManagedDirectory(dirname(absolute), false);
  const boundPath = boundManagedChild(directory, absolute);
  try {
    const before = await lstat(boundPath);
    if (before.isSymbolicLink() || !before.isFile()) {
      throw new Error(`${label} must be a regular non-symlink file.`);
    }
    assertManagedFileAuthority(before, label);
    const handle = await open(
      boundPath,
      fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
    );
    const info = await handle.stat();
    try {
      assertSameFileIdentity(before, info, label);
      assertManagedFileAuthority(info, label);
      return { absolute, boundPath, directory, handle, info };
    } catch (error) {
      await handle.close();
      throw error;
    }
  } catch (error) {
    await directory.handle.close();
    throw error;
  }
}

async function createManagedFileExclusive(
  path: string,
  label: string,
): Promise<OpenManagedFile> {
  const absolute = assertManagedPath(path, label);
  const directory = await openSafeManagedDirectory(dirname(absolute));
  const boundPath = boundManagedChild(directory, absolute);
  try {
    const handle = await open(
      boundPath,
      fsConstants.O_CREAT |
        fsConstants.O_EXCL |
        fsConstants.O_RDWR |
        fsConstants.O_NOFOLLOW,
      0o600,
    );
    try {
      await handle.chmod(0o600);
      const info = await handle.stat();
      assertManagedFileAuthority(info, label);
      if (info.size > 0 || info.mode % 0o1000 !== 0o600) {
        throw new Error(
          `${label} reservation is not a private empty regular file.`,
        );
      }
      const current = await lstat(boundPath);
      assertSameFileIdentity(info, current, label);
      assertManagedFileAuthority(current, label);
      return { absolute, boundPath, directory, handle, info };
    } catch (error) {
      await handle.close();
      throw error;
    }
  } catch (error) {
    await directory.handle.close();
    throw error;
  }
}

async function closeManagedFile(file: OpenManagedFile): Promise<void> {
  const results = await Promise.allSettled([
    file.handle.close(),
    file.directory.handle.close(),
  ]);
  const errors: unknown[] = [];
  for (const result of results) {
    if (result.status === "rejected") {
      errors.push(result.reason);
    }
  }
  if (errors.length > 0) {
    throw new AggregateError(errors, "Managed file handles did not all close.");
  }
}

async function unlinkManagedFile(
  file: OpenManagedFile,
  label: string,
): Promise<void> {
  const current = await lstat(file.boundPath);
  assertSameFileIdentity(file.info, current, label);
  assertManagedFileAuthority(current, label);
  await unlink(file.boundPath);
  await file.directory.handle.sync();
}

async function publishManagedBytesExclusive(
  path: string,
  label: string,
  bytes: Buffer,
  acceptMatchingExisting = true,
): Promise<boolean> {
  const absolute = assertManagedPath(path, label);
  const temporaryPath = `${absolute}.tmp-${randomUUID()}`;
  const temporary = await createManagedFileExclusive(
    temporaryPath,
    `${label} temporary`,
  );
  let created = false;
  let publishedBoundPath: string | undefined;
  let matchedExisting: ManagedFile | undefined;
  const cleanupErrors: unknown[] = [];
  let failure: unknown;
  try {
    await temporary.handle.writeFile(bytes);
    await temporary.handle.sync();
    const destination = boundManagedChild(temporary.directory, absolute);
    try {
      await link(temporary.boundPath, destination);
      created = true;
      publishedBoundPath = destination;
      const published = await lstat(destination);
      assertSameFileIdentity(temporary.info, published, label);
      await temporary.directory.handle.sync();
    } catch (error) {
      if (!isErrnoException(error) || error.code !== "EEXIST") {
        throw error;
      }
      if (!acceptMatchingExisting) {
        throw error;
      }
      const existing = await readManagedFile(absolute, label);
      if (!existing.bytes.equals(bytes)) {
        throw new Error(`${label} already exists with different bytes.`, {
          cause: error,
        });
      }
      matchedExisting = existing;
    }
  } catch (error) {
    failure = error;
  }
  await temporary.handle.close().catch((error: unknown) => {
    cleanupErrors.push(error);
  });
  try {
    const current = await lstat(temporary.boundPath);
    assertSameFileIdentity(temporary.info, current, `${label} temporary`);
    await unlink(temporary.boundPath);
    await temporary.directory.handle.sync();
    if (created && publishedBoundPath !== undefined) {
      const published = await lstat(publishedBoundPath);
      assertSameFileIdentity(temporary.info, published, label);
      assertManagedFileAuthority(published, label);
    }
  } catch (error) {
    if (!isErrnoException(error) || error.code !== "ENOENT") {
      cleanupErrors.push(error);
    }
  }
  if (failure === undefined && cleanupErrors.length === 0) {
    try {
      if (created) {
        await assertManagedFilePathCurrent(
          absolute,
          temporary.directory,
          temporary.info,
          label,
        );
      } else if (matchedExisting !== undefined) {
        const current = await openSafeManagedFile(absolute, label);
        try {
          assertSameFileIdentity(matchedExisting.info, current.info, label);
          assertFileStayedUnchanged(matchedExisting.info, current.info, label);
        } finally {
          await closeManagedFile(current);
        }
      }
    } catch (error) {
      failure = error;
    }
  }
  if (
    failure !== undefined &&
    created &&
    publishedBoundPath !== undefined
  ) {
    try {
      const published = await lstat(publishedBoundPath);
      assertSameFileIdentity(temporary.info, published, `${label} cleanup`);
      assertManagedFileAuthority(published, `${label} cleanup`);
      await unlink(publishedBoundPath);
      await temporary.directory.handle.sync();
    } catch (error) {
      if (!isErrnoException(error) || error.code !== "ENOENT") {
        cleanupErrors.push(error);
      }
    }
  }
  await temporary.directory.handle.close().catch((error: unknown) => {
    cleanupErrors.push(error);
  });
  if (failure !== undefined || cleanupErrors.length > 0) {
    if (failure !== undefined && cleanupErrors.length === 0) {
      throw toError(failure);
    }
    throw new AggregateError(
      failure === undefined ? cleanupErrors : [failure, ...cleanupErrors],
      failure === undefined
        ? `${label} temporary cleanup was incomplete.`
        : `${label} publication failed and cleanup was incomplete: ${errorMessage(failure)}`,
      { cause: failure },
    );
  }
  return created;
}

async function replaceManagedBytes(
  path: string,
  label: string,
  bytes: Buffer,
): Promise<void> {
  const current = await openSafeManagedFile(path, label);
  let temporary: OpenManagedFile;
  try {
    temporary = await createManagedFileExclusive(
      `${current.absolute}.tmp-${randomUUID()}`,
      `${label} temporary`,
    );
  } catch (error) {
    try {
      await closeManagedFile(current);
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        `${label} temporary creation failed and handle cleanup was incomplete: ${errorMessage(error)}`,
        { cause: cleanupError },
      );
    }
    throw error;
  }
  let failure: unknown;
  let currentHandleClosed = false;
  let temporaryHandleClosed = false;
  try {
    await temporary.handle.writeFile(bytes);
    await temporary.handle.sync();
    if (
      current.directory.info.dev !== temporary.directory.info.dev ||
      current.directory.info.ino !== temporary.directory.info.ino
    ) {
      throw new Error(`${label} temporary directory identity disagrees.`);
    }
    await temporary.handle.close();
    temporaryHandleClosed = true;
    const temporaryPathInfo = await lstat(temporary.boundPath);
    assertSameFileIdentity(
      temporary.info,
      temporaryPathInfo,
      `${label} temporary`,
    );
    await current.handle.close();
    currentHandleClosed = true;
    const currentPathInfo = await lstat(current.boundPath);
    assertSameFileIdentity(current.info, currentPathInfo, label);
    await rename(temporary.boundPath, current.boundPath);
    const published = await lstat(current.boundPath);
    assertSameFileIdentity(temporary.info, published, label);
    assertManagedFileAuthority(published, label);
    await current.directory.handle.sync();
    await assertManagedFilePathCurrent(
      current.absolute,
      current.directory,
      temporary.info,
      label,
    );
  } catch (error) {
    failure = error;
  }
  const cleanupErrors: unknown[] = [];
  if (!temporaryHandleClosed) {
    await temporary.handle.close().catch((error: unknown) => {
      cleanupErrors.push(error);
    });
  }
  try {
    const temporaryStillExists = await lstat(temporary.boundPath);
    assertSameFileIdentity(
      temporary.info,
      temporaryStillExists,
      `${label} temporary`,
    );
    await unlink(temporary.boundPath);
    await temporary.directory.handle.sync();
  } catch (error) {
    if (!isErrnoException(error) || error.code !== "ENOENT") {
      cleanupErrors.push(error);
    }
  }
  await temporary.directory.handle.close().catch((error: unknown) => {
    cleanupErrors.push(error);
  });
  if (!currentHandleClosed) {
    await current.handle.close().catch((error: unknown) => {
      cleanupErrors.push(error);
    });
  }
  await current.directory.handle.close().catch((error: unknown) => {
    cleanupErrors.push(error);
  });
  if (failure !== undefined || cleanupErrors.length > 0) {
    if (failure !== undefined && cleanupErrors.length === 0) {
      throw toError(failure);
    }
    throw new AggregateError(
      failure === undefined ? cleanupErrors : [failure, ...cleanupErrors],
      failure === undefined
        ? `${label} handle cleanup was incomplete.`
        : `${label} replacement failed and cleanup was incomplete: ${errorMessage(failure)}`,
      { cause: failure },
    );
  }
}

async function removeManagedFileIfExact(
  path: string,
  label: string,
  expected: Buffer,
): Promise<void> {
  const file = await openSafeManagedFile(path, label);
  let failure: unknown;
  try {
    const before = await file.handle.stat();
    const actual = await file.handle.readFile();
    const after = await file.handle.stat();
    assertFileStayedUnchanged(before, after, label);
    if (!actual.equals(expected)) {
      throw new Error(`${label} changed before cleanup.`);
    }
    await unlinkManagedFile(file, label);
  } catch (error) {
    failure = error;
  }
  try {
    await closeManagedFile(file);
  } catch (error) {
    failure =
      failure === undefined
        ? error
        : new AggregateError([failure, error], `${label} cleanup failed.`);
  }
  if (failure !== undefined) {
    throw toError(failure);
  }
}

export async function ensureManagedDirectory(path: string): Promise<string> {
  const directory = await openSafeManagedDirectory(path);
  await directory.handle.close();
  return directory.absolute;
}

export function controlRootCapability(): Promise<ControlRootCapability> {
  retainedControlRoot ??= openControlRootCapability(CONTROL_DATA_DIR);
  return retainedControlRoot;
}

export function inspectManagedFile(
  path: string,
  label = "Artifact",
): Promise<ManagedFile> {
  return openSafeManagedFile(path, label).then(async (file) => {
    await closeManagedFile(file);
    return { absolute: file.absolute, info: file.info };
  });
}

async function readManagedFile(
  path: string,
  label = "Artifact",
): Promise<ManagedFileContents> {
  const opened = await openSafeManagedFile(path, label);
  try {
    const bytes = await opened.handle.readFile();
    const after = await opened.handle.stat();
    assertFileStayedUnchanged(opened.info, after, label);
    assertManagedFileAuthority(after, label);
    return { absolute: opened.absolute, info: after, bytes };
  } finally {
    await closeManagedFile(opened);
  }
}

async function hashOpenManagedAttachment(
  opened: OpenManagedFile,
  label: string,
): Promise<HashedManagedAttachment> {
  const { handle } = opened;
  // The upstream producer may have only dirtied the page cache. Flush the
  // Artifact bytes stay on this descriptor throughout hashing.
  await handle.sync();
  const before = await handle.stat();
  const hash = createHash("sha256");
  for await (const chunk of handle.createReadStream({
    autoClose: false,
    start: 0,
  })) {
    if (!Buffer.isBuffer(chunk)) {
      throw new TypeError("Evidence stream yielded a non-buffer chunk.");
    }
    hash.update(chunk);
  }
  const after = await handle.stat();
  assertFileStayedUnchanged(before, after, label);
  assertManagedFileAuthority(after, label);
  return {
    path: opened.absolute,
    bytes: after.size,
    sha256: hash.digest("hex"),
    mtimeMs: after.mtimeMs,
    identity: {
      device: String(after.dev),
      inode: String(after.ino),
    },
  };
}

async function hashManagedAttachment(
  path: string,
  label = "Evidence attachment",
): Promise<HashedManagedAttachment> {
  const opened = await openSafeManagedFile(path, label);
  try {
    const result = await hashOpenManagedAttachment(opened, label);
    await opened.directory.handle.sync();
    return result;
  } finally {
    await closeManagedFile(opened);
  }
}

export async function publishManagedAttachmentExclusive(
  path: string,
  label: string,
  bytes: Buffer,
  kind: string,
  beforePathRevalidation?: () => Promise<void>,
): Promise<PublishedManagedAttachment> {
  const opened = await createManagedFileExclusive(path, label);
  let failure: unknown;
  let published: PublishedManagedAttachment | undefined;
  try {
    await opened.handle.writeFile(bytes);
    const hashed = await hashOpenManagedAttachment(opened, label);
    const expectedSha256 = createHash("sha256").update(bytes).digest("hex");
    if (
      hashed.bytes !== bytes.length ||
      hashed.sha256 !== expectedSha256
    ) {
      throw new Error(`${label} bytes changed during bound publication.`);
    }
    const boundDestination = await lstat(opened.boundPath);
    assertSameFileIdentity(opened.info, boundDestination, label);
    assertManagedFileAuthority(boundDestination, label);
    await opened.directory.handle.sync();
    await beforePathRevalidation?.();

    const currentDirectory = await openSafeManagedDirectory(
      dirname(opened.absolute),
      false,
    );
    try {
      if (
        currentDirectory.info.dev !== opened.directory.info.dev ||
        currentDirectory.info.ino !== opened.directory.info.ino
      ) {
        throw new Error(
          `${label} parent directory changed after bound publication.`,
        );
      }
      const currentPath = boundManagedChild(
        currentDirectory,
        opened.absolute,
      );
      const current = await lstat(currentPath);
      assertSameFileIdentity(opened.info, current, label);
      assertManagedFileAuthority(current, label);
    } finally {
      await currentDirectory.handle.close();
    }
    published = { ...hashed, kind: kind.slice(0, 64) };
  } catch (error) {
    failure = error;
  }
  if (failure !== undefined) {
    try {
      await unlinkManagedFile(opened, `${label} failed publication`);
    } catch (cleanupError) {
      failure = new AggregateError(
        [failure, cleanupError],
        `${label} publication failed and cleanup was incomplete.`,
        { cause: failure },
      );
    }
  }
  try {
    await closeManagedFile(opened);
  } catch (closeError) {
    failure =
      failure === undefined
        ? closeError
        : new AggregateError(
            [failure, closeError],
            `${label} handle cleanup was incomplete.`,
            { cause: failure },
          );
  }
  if (failure !== undefined) {
    throw toError(failure);
  }
  if (published === undefined) {
    throw new Error(`${label} publication produced no descriptor.`);
  }
  return published;
}

async function syncDirectory(path: string): Promise<void> {
  const directory = await openSafeManagedDirectory(path);
  try {
    await directory.handle.sync();
  } finally {
    await directory.handle.close();
  }
}

export async function reserveEvidencePaths(
  evidence: unknown,
  beforeFinalPathValidation?: () => Promise<void>,
): Promise<EvidenceReservation> {
  const paths = validateEvidencePaths(evidence);
  if (!paths) {
    throw new Error("Evidence paths are required.");
  }
  const resultPath = assertManagedPath(paths.resultPath, "Evidence result");
  const receiptPath = assertManagedPath(paths.receiptPath, "Evidence receipt");
  const token = randomUUID();
  const createdAt = new Date().toISOString();
  let resultFile: OpenManagedFile | undefined;
  let receiptFile: OpenManagedFile | undefined;
  let failure: unknown;
  try {
    resultFile = await createManagedFileExclusive(
      resultPath,
      "Evidence result reservation",
    );
    receiptFile = await createManagedFileExclusive(
      receiptPath,
      "Evidence receipt reservation",
    );
    const marker = `${JSON.stringify({ schema: "easyeda-pro-control.evidence-reservation.v1", token, createdAt })}\n`;
    await resultFile.handle.writeFile(marker, "utf8");
    await receiptFile.handle.writeFile(marker, "utf8");
    await resultFile.handle.sync();
    await receiptFile.handle.sync();
    await resultFile.directory.handle.sync();
    await receiptFile.directory.handle.sync();
    await beforeFinalPathValidation?.();
    await assertManagedFilePathCurrent(
      resultFile.absolute,
      resultFile.directory,
      resultFile.info,
      "Evidence result reservation",
    );
    await assertManagedFilePathCurrent(
      receiptFile.absolute,
      receiptFile.directory,
      receiptFile.info,
      "Evidence receipt reservation",
    );
  } catch (error) {
    failure = error;
  }
  if (failure !== undefined) {
    const cleanupErrors: unknown[] = [];
    for (const file of [receiptFile, resultFile]) {
      if (file) {
        try {
          await unlinkManagedFile(file, "Evidence reservation cleanup");
        } catch (cleanupError) {
          cleanupErrors.push(cleanupError);
        }
      }
    }
    failure =
      cleanupErrors.length === 0
        ? failure
        : new AggregateError(
            [failure, ...cleanupErrors],
            `Evidence reservation failed and cleanup was incomplete: ${errorMessage(failure)}`,
            { cause: failure },
          );
  }
  const closeErrors: unknown[] = [];
  for (const file of [receiptFile, resultFile]) {
    if (file) {
      await closeManagedFile(file).catch((error: unknown) => {
        closeErrors.push(error);
      });
    }
  }
  if (failure !== undefined || closeErrors.length > 0) {
    if (failure !== undefined && closeErrors.length === 0) {
      throw toError(failure);
    }
    throw new AggregateError(
      failure === undefined ? closeErrors : [failure, ...closeErrors],
      failure === undefined
        ? "Evidence reservation handle cleanup was incomplete."
        : `Evidence reservation failed and handle cleanup was incomplete: ${errorMessage(failure)}`,
      { cause: failure },
    );
  }
  return { resultPath, receiptPath, token, createdAt };
}

function assertReservationIdentity(reservation: EvidenceReservation): void {
  if (
    !reservation.token ||
    typeof reservation.createdAt !== "string" ||
    !Number.isFinite(Date.parse(reservation.createdAt))
  ) {
    throw new Error("A valid evidence reservation is required.");
  }
}

function isReservationMarker(
  text: string,
  reservation: EvidenceReservation,
): boolean {
  try {
    const parsed: unknown = JSON.parse(text);
    return (
      isRecord(parsed) &&
      parsed["schema"] === "easyeda-pro-control.evidence-reservation.v1" &&
      parsed["token"] === reservation.token &&
      parsed["createdAt"] === reservation.createdAt
    );
  } catch {
    return false;
  }
}

function evidenceReservationBinding(
  reservation: EvidenceReservation,
): EvidenceReservationBinding {
  return {
    schema: "easyeda-pro-control.evidence-reservation-binding.v1",
    tokenSha256: sha256Text(reservation.token),
    resultPath: reservation.resultPath,
    receiptPath: reservation.receiptPath,
  };
}

function assertPublishedReservationBinding(
  value: unknown,
  reservation: EvidenceReservation,
): void {
  const expected = evidenceReservationBinding(reservation);
  if (
    !isRecord(value) ||
    canonicalJson(Object.keys(value).toSorted()) !==
      canonicalJson(Object.keys(expected).toSorted()) ||
    value["schema"] !== expected.schema ||
    value["tokenSha256"] !== expected.tokenSha256 ||
    value["resultPath"] !== expected.resultPath ||
    value["receiptPath"] !== expected.receiptPath
  ) {
    throw new Error(
      "The evidence result does not bind the recoverable reservation token and exact paths.",
    );
  }
}

function assertPublishedResultPathBinding(
  value: unknown,
  resultPath: string,
  receiptPath: string,
): void {
  if (
    !isRecord(value) ||
    value["schema"] !==
      "easyeda-pro-control.evidence-reservation-binding.v1" ||
    typeof value["tokenSha256"] !== "string" ||
    !/^[a-f0-9]{64}$/u.test(value["tokenSha256"]) ||
    value["resultPath"] !== resultPath ||
    value["receiptPath"] !== receiptPath
  ) {
    throw new Error(
      "The published evidence result does not bind the exact result and receipt paths.",
    );
  }
}

async function resultRemainsReservationMarker(
  reservation: EvidenceReservation,
): Promise<boolean> {
  try {
    const result = await readManagedFile(
      reservation.resultPath,
      "Evidence result reservation state",
    );
    return isReservationMarker(result.bytes.toString("utf8"), reservation);
  } catch {
    // Unknown publication state must retain attachments for explicit recovery.
    return false;
  }
}

async function readOpenManagedText(
  file: OpenManagedFile,
  label: string,
): Promise<string> {
  const before = await file.handle.stat();
  const text = await file.handle.readFile("utf8");
  const after = await file.handle.stat();
  assertFileStayedUnchanged(before, after, label);
  return text;
}

export async function releaseEvidenceReservation(
  reservation: EvidenceReservation,
): Promise<void> {
  assertReservationIdentity(reservation);
  const errors: unknown[] = [];
  for (const path of [reservation.resultPath, reservation.receiptPath]) {
    let file: OpenManagedFile | undefined;
    try {
      file = await openSafeManagedFile(path, "Evidence reservation");
      const text = await readOpenManagedText(file, "Evidence reservation");
      if (!isReservationMarker(text, reservation)) {
        throw new Error(
          "A finalized or changed evidence file cannot be released as a reservation.",
        );
      }
      await unlinkManagedFile(file, "Evidence reservation");
    } catch (error) {
      if (!isErrnoException(error) || error.code !== "ENOENT") {
        errors.push(error);
      }
    } finally {
      await file?.handle.close().catch((error: unknown) => {
        errors.push(error);
      });
      await file?.directory.handle.close().catch((error: unknown) => {
        errors.push(error);
      });
    }
  }
  if (errors.length > 0) {
    throw new AggregateError(
      errors,
      `Evidence reservation release was incomplete: ${errors.map((error) => errorMessage(error)).join("; ")}`,
    );
  }
}

async function finalizeReservedPair(
  reservation: EvidenceReservation,
  resultText: string,
  receiptText: string,
): Promise<void> {
  assertReservationIdentity(reservation);
  const replaceReservation = async (
    path: string,
    text: string,
  ): Promise<void> => {
    const current = await openSafeManagedFile(path, "Evidence reservation");
    let temporary: OpenManagedFile | undefined;
    let failure: unknown;
    let currentHandleClosed = false;
    let temporaryHandleClosed = false;
    try {
      const existing = await readOpenManagedText(
        current,
        "Evidence reservation",
      );
      if (existing !== text) {
        if (!isReservationMarker(existing, reservation)) {
          throw new Error(
            "Evidence reservation identity changed before final publication.",
          );
        }
        const temporaryPath = `${path}.tmp-${randomUUID()}`;
        temporary = await createManagedFileExclusive(
          temporaryPath,
          "Evidence publication temporary",
        );
        await temporary.handle.writeFile(text, "utf8");
        await temporary.handle.sync();
        if (
          current.directory.info.dev !== temporary.directory.info.dev ||
          current.directory.info.ino !== temporary.directory.info.ino
        ) {
          throw new Error(
            "Evidence temporary and reservation directories disagree.",
          );
        }
        await temporary.handle.close();
        temporaryHandleClosed = true;
        const temporaryPathInfo = await lstat(temporary.boundPath);
        assertSameFileIdentity(
          temporary.info,
          temporaryPathInfo,
          "Evidence publication temporary",
        );
        await current.handle.close();
        currentHandleClosed = true;
        const markerNow = await lstat(current.boundPath);
        assertSameFileIdentity(
          current.info,
          markerNow,
          "Evidence reservation",
        );
        await rename(temporary.boundPath, current.boundPath);
        const published = await lstat(current.boundPath);
        assertSameFileIdentity(
          temporary.info,
          published,
          "Published evidence",
        );
        assertManagedFileAuthority(published, "Published evidence");
        await current.directory.handle.sync();
        await assertManagedFilePathCurrent(
          current.absolute,
          current.directory,
          temporary.info,
          "Published evidence",
        );
      }
    } catch (error) {
      failure = error;
    }
    const cleanupErrors: unknown[] = [];
    if (temporary) {
      if (!temporaryHandleClosed) {
        await temporary.handle.close().catch((error: unknown) => {
          cleanupErrors.push(error);
        });
      }
      try {
        const temporaryStillExists = await lstat(temporary.boundPath).catch(
          () => null,
        );
        if (
          temporaryStillExists &&
          temporaryStillExists.dev === temporary.info.dev &&
          temporaryStillExists.ino === temporary.info.ino
        ) {
          await unlink(temporary.boundPath);
          await temporary.directory.handle.sync();
        }
      } catch (error) {
        cleanupErrors.push(error);
      }
      await temporary.directory.handle.close().catch((error: unknown) => {
        cleanupErrors.push(error);
      });
    }
    if (!currentHandleClosed) {
      await current.handle.close().catch((error: unknown) => {
        cleanupErrors.push(error);
      });
    }
    await current.directory.handle.close().catch((error: unknown) => {
      cleanupErrors.push(error);
    });
    if (failure !== undefined || cleanupErrors.length > 0) {
      if (failure !== undefined && cleanupErrors.length === 0) {
        throw toError(failure);
      }
      throw new AggregateError(
        failure === undefined ? cleanupErrors : [failure, ...cleanupErrors],
        failure === undefined
          ? "Evidence publication handle cleanup was incomplete."
          : `Evidence publication failed and cleanup was incomplete: ${errorMessage(failure)}`,
        { cause: failure },
      );
    }
  };
  // Receipt publication is the commit marker; matching bytes make result-first retries resumable.
  await replaceReservation(reservation.resultPath, resultText);
  await replaceReservation(reservation.receiptPath, receiptText);
}

function recoveredReservation(
  paths: EvidencePaths,
  markerText: string,
): EvidenceReservation {
  const parsed: unknown = JSON.parse(markerText);
  if (
    !isRecord(parsed) ||
    parsed["schema"] !== "easyeda-pro-control.evidence-reservation.v1" ||
    typeof parsed["token"] !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/iu.test(
      parsed["token"],
    ) ||
    typeof parsed["createdAt"] !== "string" ||
    !Number.isFinite(Date.parse(parsed["createdAt"]))
  ) {
    throw new Error(
      "The evidence receipt is neither a committed receipt nor a recoverable reservation marker.",
    );
  }
  return {
    resultPath: paths.resultPath,
    receiptPath: paths.receiptPath,
    token: parsed["token"],
    createdAt: parsed["createdAt"],
  };
}

function recoveredArtifactDescriptor(
  value: unknown,
  label: string,
): ArtifactDescriptor {
  if (
    !isRecord(value) ||
    typeof value["path"] !== "string" ||
    typeof value["bytes"] !== "number" ||
    !Number.isSafeInteger(value["bytes"]) ||
    value["bytes"] < 0 ||
    typeof value["sha256"] !== "string" ||
    !/^[a-f0-9]{64}$/u.test(value["sha256"])
  ) {
    throw new Error(`${label} descriptor is invalid.`);
  }
  return {
    path: assertManagedPath(value["path"], label),
    bytes: value["bytes"],
    sha256: value["sha256"],
  };
}

async function assertRecoveredAttachmentsCurrent(
  attachments: readonly ArtifactDescriptor[],
): Promise<void> {
  for (const expected of attachments) {
    const actual = await hashManagedAttachment(
      expected.path,
      "Recovered evidence attachment",
    );
    if (
      actual.bytes !== expected.bytes ||
      actual.sha256 !== expected.sha256
    ) {
      throw new Error(
        "A published evidence attachment changed before crash recovery.",
      );
    }
  }
}

export async function recoverPublishedEvidence(
  evidence: unknown,
): Promise<EvidenceReceiptVerification> {
  const paths = validateEvidencePaths(evidence);
  if (!paths) {
    throw new Error("Evidence paths are required for crash recovery.");
  }
  const managedPaths = {
    resultPath: assertManagedPath(paths.resultPath, "Evidence result"),
    receiptPath: assertManagedPath(paths.receiptPath, "Evidence receipt"),
  };
  const receiptContents = await readManagedFile(
    managedPaths.receiptPath,
    "Evidence recovery receipt",
  );
  const receiptText = receiptContents.bytes.toString("utf8");
  const parsedReceipt: unknown = JSON.parse(receiptText);
  if (
    isRecord(parsedReceipt) &&
    (parsedReceipt["schema"] === "easyeda-pro-control.tool-receipt.v1" ||
      parsedReceipt["schema"] ===
        "easyeda-pro-control.capture-receipt.v1")
  ) {
    if (
      parsedReceipt["resultPath"] !== managedPaths.resultPath ||
      parsedReceipt["receiptPath"] !== managedPaths.receiptPath
    ) {
      throw new Error(
        "The committed evidence receipt does not belong to the supplied result and receipt paths.",
      );
    }
    return verifyEvidenceReceipt(managedPaths.receiptPath);
  }
  const reservation = recoveredReservation(managedPaths, receiptText);
  const resultContents = await readManagedFile(
    managedPaths.resultPath,
    "Evidence recovery result",
  );
  const resultText = resultContents.bytes.toString("utf8");
  const payload: unknown = JSON.parse(resultText);
  if (
    !isRecord(payload) ||
    payload["createdAt"] !== reservation.createdAt
  ) {
    throw new Error(
      "The evidence result is not a published result for the recoverable reservation.",
    );
  }
  assertPublishedReservationBinding(payload["reservation"], reservation);

  let receiptCore: UnknownRecord;
  if (payload["schema"] === "easyeda-pro-control.tool-result.v1") {
    const attachmentValues = payload["attachments"];
    if (
      attachmentValues !== undefined &&
      !Array.isArray(attachmentValues)
    ) {
      throw new TypeError(
        "Recovered tool-result attachments must be an array.",
      );
    }
    const attachments: ArchivedAttachment[] = (
      attachmentValues ?? []
    ).map((value: unknown) => {
      const descriptor = recoveredArtifactDescriptor(
        value,
        "Recovered tool-result attachment",
      );
      if (
        !isRecord(value) ||
        typeof value["kind"] !== "string" ||
        value["kind"].length === 0 ||
        value["kind"].length > 64
      ) {
        throw new TypeError("Recovered attachment kind is invalid.");
      }
      return {
        path: descriptor.path,
        bytes: descriptor.bytes,
        sha256: descriptor.sha256,
        kind: value["kind"],
      };
    });
    await assertRecoveredAttachmentsCurrent(attachments);
    receiptCore = {
      schema: "easyeda-pro-control.tool-receipt.v1",
      createdAt: reservation.createdAt,
      resultPath: reservation.resultPath,
      receiptPath: reservation.receiptPath,
      requestSha256: sha256Text(canonicalJson(payload["request"])),
      resultSha256: sha256Text(resultText),
      attachments,
      metadata: payload["metadata"],
      integrityModel: EVIDENCE_INTEGRITY_MODEL,
    };
  } else if (
    payload["schema"] === "easyeda-pro-control.capture-result.v1"
  ) {
    const result = payload["result"];
    const imageValues = isRecord(result) ? result["images"] : undefined;
    if (!Array.isArray(imageValues)) {
      throw new TypeError("Recovered capture images must be an array.");
    }
    const images: ArchivedCaptureImage[] = imageValues.map(
      (value: unknown) => {
        const descriptor = recoveredArtifactDescriptor(
          value,
          "Recovered capture image",
        );
        if (
          !isRecord(value) ||
          typeof value["mimeType"] !== "string" ||
          !/^image\/[a-z0-9.+-]+$/iu.test(value["mimeType"])
        ) {
          throw new TypeError(
            "Recovered capture image MIME type is invalid.",
          );
        }
        return {
          path: descriptor.path,
          bytes: descriptor.bytes,
          sha256: descriptor.sha256,
          mimeType: value["mimeType"],
        };
      },
    );
    await assertRecoveredAttachmentsCurrent(images);
    receiptCore = {
      schema: "easyeda-pro-control.capture-receipt.v1",
      createdAt: reservation.createdAt,
      resultPath: reservation.resultPath,
      receiptPath: reservation.receiptPath,
      requestSha256: sha256Text(canonicalJson(payload["request"])),
      resultSha256: sha256Text(resultText),
      images,
      metadata: payload["metadata"],
      integrityModel: EVIDENCE_INTEGRITY_MODEL,
    };
  } else {
    throw new Error(
      "The reserved evidence pair has no recoverable published result.",
    );
  }
  const committedReceipt = {
    ...receiptCore,
    receiptSha256: sha256Text(canonicalJson(receiptCore)),
  };
  await finalizeReservedPair(
    reservation,
    resultText,
    `${JSON.stringify(committedReceipt, null, 2)}\n`,
  );
  return verifyEvidenceReceipt(reservation.receiptPath);
}

export async function archiveExternalEvidence({
  evidence,
  reservation,
  request,
  result,
  metadata,
  attachments = [],
}: Readonly<ArchiveExternalEvidenceOptions>): Promise<
  ExternalEvidenceReceipt | undefined
> {
  if (evidence === undefined && reservation === undefined) {
    return evidence;
  }
  const held = reservation ?? (await reserveEvidencePaths(evidence));
  const createdAt = held.createdAt;
  const archivedAttachments: ArchivedAttachment[] = [];
  for (const attachment of attachments) {
    const archived = await hashManagedAttachment(attachment.path);
    if (
      (attachment.bytes !== undefined && attachment.bytes !== archived.bytes) ||
      (attachment.sha256 !== undefined &&
        attachment.sha256 !== archived.sha256) ||
      (attachment.identity !== undefined &&
        (attachment.identity.device !== archived.identity.device ||
          attachment.identity.inode !== archived.identity.inode))
    ) {
      throw new Error(
        "Evidence attachment bytes or file identity changed before its receipt was finalized.",
      );
    }
    archivedAttachments.push({
      kind: (attachment.kind ?? "artifact").slice(0, 64),
      path: archived.path,
      bytes: archived.bytes,
      sha256: archived.sha256,
    });
  }
  const payload = {
    schema: "easyeda-pro-control.tool-result.v1",
    createdAt,
    reservation: evidenceReservationBinding(held),
    request,
    result,
    metadata,
    ...(archivedAttachments.length === 0
      ? {}
      : { attachments: archivedAttachments }),
  };
  const resultText = `${JSON.stringify(payload)}\n`;
  const receiptCore = {
    schema: "easyeda-pro-control.tool-receipt.v1",
    createdAt,
    resultPath: held.resultPath,
    receiptPath: held.receiptPath,
    requestSha256: sha256Text(canonicalJson(request)),
    resultSha256: sha256Text(resultText),
    attachments: archivedAttachments,
    metadata,
    integrityModel: EVIDENCE_INTEGRITY_MODEL,
  };
  const receipt = {
    ...receiptCore,
    receiptSha256: sha256Text(canonicalJson(receiptCore)),
  };
  await finalizeReservedPair(
    held,
    resultText,
    `${JSON.stringify(receipt, null, 2)}\n`,
  );
  return {
    ...receipt,
    resultPath: held.resultPath,
    receiptPath: held.receiptPath,
  };
}

export async function archiveCaptureEvidence({
  reservation,
  request,
  payload,
  images,
  metadata,
}: Readonly<ArchiveCaptureEvidenceOptions>): Promise<CaptureEvidenceReceipt> {
  if (!reservation) {
    throw new Error("Capture evidence must be reserved before dispatch.");
  }
  assertReservationIdentity(reservation);
  const created: ArchivedCaptureImage[] = [];
  const createdNow: { readonly bytes: Buffer; readonly path: string }[] = [];
  try {
    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];
      if (!image) {
        throw new Error(`Capture image ${index + 1} is unavailable.`);
      }
      const path = assertManagedPath(
        `${reservation.resultPath}.image-${index + 1}.png`,
        "Capture image",
      );
      if (
        await publishManagedBytesExclusive(
          path,
          `Capture image ${index + 1}`,
          image.bytes,
        )
      ) {
        createdNow.push({ path, bytes: image.bytes });
      }
      created.push({
        path,
        mimeType: image.mimeType,
        bytes: image.bytes.length,
        sha256: createHash("sha256").update(image.bytes).digest("hex"),
      });
    }
    for (const directory of new Set(
      created.map((item) => dirname(item.path)),
    )) {
      await syncDirectory(directory);
    }
    const createdAt = reservation.createdAt;
    const result = { payload, images: created };
    const resultPayload = {
      schema: "easyeda-pro-control.capture-result.v1",
      createdAt,
      reservation: evidenceReservationBinding(reservation),
      request,
      result,
      metadata,
    };
    const resultText = `${JSON.stringify(resultPayload)}\n`;
    const receiptCore = {
      schema: "easyeda-pro-control.capture-receipt.v1",
      createdAt,
      resultPath: reservation.resultPath,
      receiptPath: reservation.receiptPath,
      requestSha256: sha256Text(canonicalJson(request)),
      resultSha256: sha256Text(resultText),
      images: created,
      metadata,
      integrityModel: EVIDENCE_INTEGRITY_MODEL,
    };
    const receipt = {
      ...receiptCore,
      receiptSha256: sha256Text(canonicalJson(receiptCore)),
    };
    await finalizeReservedPair(
      reservation,
      resultText,
      `${JSON.stringify(receipt, null, 2)}\n`,
    );
    return {
      ...receipt,
      resultPath: reservation.resultPath,
      receiptPath: reservation.receiptPath,
    };
  } catch (error) {
    const cleanupErrors: unknown[] = [];
    if (await resultRemainsReservationMarker(reservation)) {
      for (const item of createdNow.toReversed()) {
        await removeManagedFileIfExact(
          item.path,
          "Capture image cleanup",
          item.bytes,
        ).catch((cleanupError: unknown) => {
          cleanupErrors.push(cleanupError);
        });
      }
    }
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        `Capture evidence failed and cleanup was incomplete: ${errorMessage(error)}`,
        { cause: error },
      );
    }
    throw error;
  }
}

export async function verifyEvidenceReceipt(
  receiptPathInput: string,
): Promise<EvidenceReceiptVerification> {
  const receiptPath = assertManagedPath(receiptPathInput, "Evidence receipt");
  const receiptFile = await readManagedFile(receiptPath, "Evidence receipt");
  const parsed: unknown = JSON.parse(receiptFile.bytes.toString("utf8"));
  if (!isRecord(parsed)) {
    throw new Error("Evidence receipt must be an object.");
  }
  const receipt = parsed;
  if (
    ![
      "easyeda-pro-control.tool-receipt.v1",
      "easyeda-pro-control.capture-receipt.v1",
    ].includes(String(receipt["schema"]))
  ) {
    throw new Error("Unsupported evidence receipt schema.");
  }
  if (typeof receipt["receiptPath"] !== "string") {
    throw new TypeError("Evidence receipt receiptPath must be a string.");
  }
  const boundReceiptPath = assertManagedPath(
    receipt["receiptPath"],
    "Evidence receipt",
  );
  if (boundReceiptPath !== receiptPath) {
    throw new Error(
      "Evidence receipt path does not match the path opened for verification.",
    );
  }
  const { receiptSha256, ...receiptCore } = receipt;
  const receiptHashOk =
    receiptSha256 === sha256Text(canonicalJson(receiptCore));
  if (typeof receipt["resultPath"] !== "string") {
    throw new TypeError("Evidence receipt resultPath must be a string.");
  }
  const resultPath = assertManagedPath(
    receipt["resultPath"],
    "Evidence result",
  );
  const resultFile = await readManagedFile(resultPath, "Evidence result");
  const resultText = resultFile.bytes;
  const resultHashOk = sha256Text(resultText) === receipt["resultSha256"];
  if (resultHashOk) {
    const resultPayload: unknown = JSON.parse(resultText.toString("utf8"));
    if (
      !isRecord(resultPayload) ||
      resultPayload["createdAt"] !== receipt["createdAt"]
    ) {
      throw new Error(
        "Evidence result and receipt creation identities do not match.",
      );
    }
    assertPublishedResultPathBinding(
      resultPayload["reservation"],
      resultPath,
      receiptPath,
    );
  }
  const imageChecks: { path: string; ok: boolean }[] = [];
  const images = Array.isArray(receipt["images"]) ? receipt["images"] : [];
  for (const image of images) {
    if (!isRecord(image) || typeof image["path"] !== "string") {
      throw new Error(
        "Evidence receipt contains an invalid capture-image descriptor.",
      );
    }
    const path = assertManagedPath(image["path"], "Capture image");
    const imageFile = await readManagedFile(path, "Capture image");
    const bytes = imageFile.bytes;
    imageChecks.push({
      path,
      ok:
        bytes.length === image["bytes"] &&
        createHash("sha256").update(bytes).digest("hex") === image["sha256"],
    });
  }
  const attachmentChecks: {
    path: string | undefined;
    ok: boolean;
    error?: string;
  }[] = [];
  const attachments = Array.isArray(receipt["attachments"])
    ? receipt["attachments"]
    : [];
  for (const attachment of attachments) {
    try {
      if (!isRecord(attachment) || typeof attachment["path"] !== "string") {
        throw new Error(
          "Evidence receipt contains an invalid attachment descriptor.",
        );
      }
      const actual = await hashManagedAttachment(attachment["path"]);
      attachmentChecks.push({
        path: actual.path,
        ok:
          actual.bytes === attachment["bytes"] &&
          actual.sha256 === attachment["sha256"],
      });
    } catch (error) {
      attachmentChecks.push({
        path:
          isRecord(attachment) && typeof attachment["path"] === "string"
            ? attachment["path"]
            : undefined,
        ok: false,
        error: errorMessage(error).slice(0, 2048),
      });
    }
  }
  return {
    ok:
      receiptHashOk &&
      resultHashOk &&
      imageChecks.every((item) => item.ok) &&
      attachmentChecks.every((item) => item.ok),
    receiptPath,
    resultPath,
    receiptHashOk,
    resultHashOk,
    imageChecks,
    attachmentChecks,
  };
}

export async function ensureOperationStorage(): Promise<string> {
  await assertSafeManagedDirectory(OPERATIONS_DIR);
  return OPERATIONS_DIR;
}

export function operationPath(operationId: string): string {
  if (!/^[a-z0-9][a-z0-9-]{7,95}$/iu.test(operationId)) {
    throw new Error("Invalid operationId.");
  }
  return join(OPERATIONS_DIR, `${operationId}.json`);
}

export async function createOperation(
  operation: UnknownRecord,
): Promise<string> {
  await ensureOperationStorage();
  const operationId = operation["operationId"];
  if (typeof operationId !== "string") {
    throw new TypeError("Operation requires an operationId.");
  }
  const path = operationPath(operationId);
  const sealed = sealOperation(operation);
  const text = Buffer.from(`${JSON.stringify(sealed, null, 2)}\n`);
  await publishManagedBytesExclusive(
    path,
    "Operation journal",
    text,
    false,
  );
  Object.assign(operation, sealed);
  return path;
}

export async function loadOperation(
  operationId: string,
): Promise<OperationJournal> {
  const path = operationPath(operationId);
  const journalFile = await readManagedFile(path, "Operation journal");
  const value: unknown = JSON.parse(journalFile.bytes.toString("utf8"));
  if (!isRecord(value)) {
    throw new Error(`Operation journal ${operationId} must be an object.`);
  }
  const parsed = value;
  if (
    parsed["schema"] !== OPERATION_SCHEMA ||
    parsed["operationId"] !== operationId
  ) {
    throw new Error(
      `Operation journal ${operationId} has an invalid schema or identity.`,
    );
  }
  const { journalSha256, ...journalCore } = parsed;
  if (journalSha256 !== sha256Text(canonicalJson(journalCore))) {
    throw new Error(
      `Operation journal ${operationId} failed its self-hash, which is an unkeyed corruption-detection hash rather than authentication.`,
    );
  }
  const plan = parsed["plan"];
  if (!isRecord(plan) || parsed["planHash"] !== buildPlanHash(plan)) {
    throw new Error(
      `Operation journal ${operationId} has a mismatched plan hash.`,
    );
  }
  const artifactValues = parsed["artifacts"] ?? [];
  if (!Array.isArray(artifactValues)) {
    throw new TypeError(
      `Operation journal ${operationId} has an invalid artifacts list.`,
    );
  }
  const artifacts: ArtifactDescriptor[] = [];
  for (const descriptor of artifactValues) {
    if (
      !isRecord(descriptor) ||
      typeof descriptor["path"] !== "string" ||
      typeof descriptor["bytes"] !== "number" ||
      typeof descriptor["sha256"] !== "string"
    ) {
      throw new Error(
        `Operation ${operationId} has an invalid phase-artifact descriptor.`,
      );
    }
    if (!isWithin(join(OPERATIONS_DIR, operationId), descriptor["path"])) {
      throw new Error(
        `Operation ${operationId} references an artifact outside its directory.`,
      );
    }
    const artifactFile = await readManagedFile(
      descriptor["path"],
      "Operation phase artifact",
    );
    const text = artifactFile.bytes;
    if (
      text.length !== descriptor["bytes"] ||
      sha256Text(text) !== descriptor["sha256"]
    ) {
      throw new Error(
        `Operation ${operationId} phase artifact failed hash verification.`,
      );
    }
    artifacts.push({
      path: descriptor["path"],
      bytes: descriptor["bytes"],
      sha256: descriptor["sha256"],
    });
  }
  return {
    ...parsed,
    operationId,
    plan,
    planHash: parsed["planHash"],
    artifacts,
  };
}

function sealOperation(operation: Readonly<UnknownRecord>): UnknownRecord {
  const journalCore = { ...operation };
  delete journalCore["journalSha256"];
  journalCore["integrityModel"] =
    "The unkeyed SHA-256 value detects accidental corruption. It does not authenticate the journal against a writer with access to the control-data directory.";
  return {
    ...journalCore,
    journalSha256: sha256Text(canonicalJson(journalCore)),
  };
}

export async function updateOperation(
  operation: UnknownRecord,
): Promise<string> {
  await ensureOperationStorage();
  const operationId = operation["operationId"];
  if (typeof operationId !== "string") {
    throw new TypeError("Operation requires an operationId.");
  }
  const path = operationPath(operationId);
  try {
    await loadOperation(operationId);
  } catch (error) {
    if (isErrnoException(error) && error.code === "ENOENT") {
      throw new Error(`Operation ${operationId} does not exist.`, {
        cause: error,
      });
    }
    throw error;
  }
  const sealed = sealOperation(operation);
  await replaceManagedBytes(
    path,
    "Operation journal",
    Buffer.from(`${JSON.stringify(sealed, null, 2)}\n`),
  );
  Object.assign(operation, sealed);
  return path;
}

export async function writePhaseArtifact(
  operationId: string,
  sequence: number,
  phase: string,
  value: unknown,
): Promise<ArtifactDescriptor> {
  await ensureOperationStorage();
  const directory = join(OPERATIONS_DIR, operationId);
  await assertSafeManagedDirectory(directory);
  const safePhase = phase.replaceAll(/[^a-z0-9_-]+/giu, "-").toLowerCase();
  const path = join(
    directory,
    `${sequence.toString().padStart(2, "0")}-${safePhase}.json`,
  );
  const text = `${JSON.stringify(value)}\n`;
  await publishManagedBytesExclusive(
    path,
    "Operation phase artifact",
    Buffer.from(text),
    false,
  );
  return { path, sha256: sha256Text(text), bytes: Buffer.byteLength(text) };
}

export async function listOperations(): Promise<UnknownRecord[]> {
  const directory = await openSafeManagedDirectory(OPERATIONS_DIR);
  let directoryEntries: string[];
  try {
    directoryEntries = await readdir(`/proc/self/fd/${directory.handle.fd}`);
  } finally {
    await directory.handle.close();
  }
  const names = directoryEntries
    .filter((name) => name.endsWith(".json"))
    .toSorted();
  const output: UnknownRecord[] = [];
  for (const name of names) {
    try {
      const operationId = name.replace(/\.json$/u, "");
      output.push(await loadOperation(operationId));
    } catch (error) {
      const journalPath = join(OPERATIONS_DIR, name);
      const message = errorMessage(error);
      output.push({
        operationId: name.replace(/\.json$/u, ""),
        state: "journal-unreadable",
        mutationState: "unknown",
        hardStop: true,
        mutationMayHaveOccurred: true,
        journalPath,
        lastError: {
          name: errorName(error).slice(0, 128),
          message:
            message.length <= 2048 ? message : `${message.slice(0, 2047)}…`,
        },
        nextSafeAction:
          "Inspect and restore the named managed journal before any new mutation.",
      });
    }
  }
  return output;
}

export async function readArtifact(
  path: string,
  offset = 0,
  length = 65_536,
): Promise<ArtifactReadResult> {
  const absolute = assertManagedPath(path);
  const boundedOffset = Math.max(0, offset);
  const boundedLength = Math.max(1, Math.min(256 * 1024, length));
  const opened = await openSafeManagedFile(absolute);
  const { handle, info } = opened;
  try {
    const buffer = Buffer.alloc(
      Math.min(boundedLength, Math.max(0, info.size - boundedOffset)),
    );
    const { bytesRead } = await handle.read(
      buffer,
      0,
      buffer.length,
      boundedOffset,
    );
    const after = await handle.stat();
    assertFileStayedUnchanged(info, after, "Artifact");
    return {
      path: opened.absolute,
      size: after.size,
      offset: boundedOffset,
      bytesRead,
      eof: boundedOffset + bytesRead >= after.size,
      text: buffer.subarray(0, bytesRead).toString("utf8"),
    };
  } finally {
    await closeManagedFile(opened);
  }
}

export function controlDataDirectory(): string {
  return CONTROL_DATA_DIR;
}
