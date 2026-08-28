import { constants as fsConstants } from "node:fs";
import type { Stats } from "node:fs";
import { createHash } from "node:crypto";
import {
  access,
  lstat,
  mkdir,
  open,
  readdir,
  realpath,
  rename,
  unlink,
} from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
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

export interface EvidenceReservation extends EvidencePaths {
  readonly token: string;
}

export interface EvidenceAttachment {
  readonly path: string;
  readonly bytes?: number;
  readonly sha256?: string;
  readonly kind?: string;
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
  handle: FileHandle;
}

interface ManagedFileContents extends ManagedFile {
  bytes: Buffer;
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

function ignoreCleanupError(error: unknown): void {
  void error;
}

function isWithin(root: string, candidate: string): boolean {
  const normalizedRoot = resolve(root);
  const normalizedCandidate = resolve(candidate);
  return (
    normalizedCandidate === normalizedRoot ||
    normalizedCandidate.startsWith(`${normalizedRoot}/`)
  );
}

function assertManagedPath(path: string, label = "Artifact"): string {
  const absolute = resolve(path);
  if (!isWithin(CONTROL_DATA_DIR, absolute)) {
    throw new Error(`${label} path must stay inside ${CONTROL_DATA_DIR}.`);
  }
  return absolute;
}

async function assertSafeManagedDirectory(directory: string): Promise<string> {
  const absolute = assertManagedPath(directory, "Directory");
  await mkdir(CONTROL_DATA_DIR, { recursive: true, mode: 0o700 });
  const rootInfo = await lstat(CONTROL_DATA_DIR);
  if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) {
    throw new Error(
      "EasyEDA control data root must be a real directory, not a symlink.",
    );
  }
  const relativePath = relative(CONTROL_DATA_DIR, absolute);
  if (relativePath.startsWith("..")) {
    throw new Error("Directory escapes the control data root.");
  }
  let current = CONTROL_DATA_DIR;
  for (const segment of relativePath.split("/").filter(Boolean)) {
    current = join(current, segment);
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink() || !info.isDirectory()) {
        throw new Error(`Managed parent ${current} is not a real directory.`);
      }
    } catch (error) {
      if (!isErrnoException(error) || error.code !== "ENOENT") {
        throw error;
      }
      await mkdir(current, { mode: 0o700 });
      const created = await lstat(current);
      if (created.isSymbolicLink() || !created.isDirectory()) {
        throw new Error(
          `Managed parent ${current} was replaced during creation.`,
          { cause: error },
        );
      }
    }
  }
  const [realRoot, realDirectory] = await Promise.all([
    realpath(CONTROL_DATA_DIR),
    realpath(absolute),
  ]);
  if (!isWithin(realRoot, realDirectory)) {
    throw new Error(
      "Managed directory resolves outside the control data root.",
    );
  }
  return absolute;
}

async function assertSafeManagedFile(
  path: string,
  label = "Artifact",
): Promise<ManagedFile> {
  const absolute = assertManagedPath(path, label);
  const info = await lstat(absolute);
  if (info.isSymbolicLink() || !info.isFile()) {
    throw new Error(`${label} must be a regular non-symlink file.`);
  }
  const [realRoot, realFile] = await Promise.all([
    realpath(CONTROL_DATA_DIR),
    realpath(absolute),
  ]);
  if (!isWithin(realRoot, realFile)) {
    throw new Error(`${label} resolves outside the control root.`);
  }
  return { absolute, info };
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
  const checked = await assertSafeManagedFile(path, label);
  const handle = await open(
    checked.absolute,
    fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW,
  );
  try {
    const info = await handle.stat();
    assertSameFileIdentity(checked.info, info, label);
    return { absolute: checked.absolute, handle, info };
  } catch (error) {
    await handle.close();
    throw error;
  }
}

export function ensureManagedDirectory(path: string): Promise<string> {
  return assertSafeManagedDirectory(path);
}

export function inspectManagedFile(
  path: string,
  label = "Artifact",
): Promise<ManagedFile> {
  return assertSafeManagedFile(path, label);
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
    return { absolute: opened.absolute, info: after, bytes };
  } finally {
    await opened.handle.close();
  }
}

async function hashManagedAttachment(
  path: string,
  label = "Evidence attachment",
): Promise<ArtifactDescriptor> {
  const opened = await openSafeManagedFile(path, label);
  const { handle } = opened;
  try {
    // The upstream producer may have only dirtied the page cache. Flush the
    // Artifact itself before binding a receipt to the bytes we are about to
    // Hash, then verify that it stayed unchanged while being read.
    await handle.sync();
    const before = await handle.stat();
    const hash = createHash("sha256");
    for await (const chunk of handle.createReadStream({ autoClose: false })) {
      if (!Buffer.isBuffer(chunk)) {
        throw new TypeError("Evidence stream yielded a non-buffer chunk.");
      }
      hash.update(chunk);
    }
    const after = await handle.stat();
    assertFileStayedUnchanged(before, after, label);
    const result = {
      path: opened.absolute,
      bytes: after.size,
      sha256: hash.digest("hex"),
    };
    await syncDirectory(dirname(opened.absolute));
    return result;
  } finally {
    await handle.close();
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function syncDirectory(path: string): Promise<void> {
  const handle = await open(path, "r");
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

export async function reserveEvidencePaths(
  evidence: unknown,
): Promise<EvidenceReservation> {
  const paths = validateEvidencePaths(evidence);
  if (!paths) {
    throw new Error("Evidence paths are required.");
  }
  const resultPath = assertManagedPath(paths.resultPath, "Evidence result");
  const receiptPath = assertManagedPath(paths.receiptPath, "Evidence receipt");
  const token = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let resultHandle: FileHandle | undefined;
  let receiptHandle: FileHandle | undefined;
  try {
    await assertSafeManagedDirectory(dirname(resultPath));
    await assertSafeManagedDirectory(dirname(receiptPath));
    resultHandle = await open(resultPath, "wx", 0o600);
    receiptHandle = await open(receiptPath, "wx", 0o600);
    const marker = `${JSON.stringify({ schema: "easyeda-pro-control.evidence-reservation.v1", token })}\n`;
    await resultHandle.writeFile(marker, "utf8");
    await receiptHandle.writeFile(marker, "utf8");
    await resultHandle.sync();
    await receiptHandle.sync();
  } catch (error) {
    await resultHandle?.close().catch(ignoreCleanupError);
    await receiptHandle?.close().catch(ignoreCleanupError);
    if (resultHandle) {
      await unlink(resultPath).catch(ignoreCleanupError);
    }
    if (receiptHandle) {
      await unlink(receiptPath).catch(ignoreCleanupError);
    }
    for (const directory of new Set([
      dirname(resultPath),
      dirname(receiptPath),
    ])) {
      await syncDirectory(directory).catch(ignoreCleanupError);
    }
    throw error;
  } finally {
    await resultHandle?.close().catch(ignoreCleanupError);
    await receiptHandle?.close().catch(ignoreCleanupError);
  }
  for (const directory of new Set([
    dirname(resultPath),
    dirname(receiptPath),
  ])) {
    await syncDirectory(directory);
  }
  return { resultPath, receiptPath, token };
}

async function assertReservation(
  reservation: EvidenceReservation,
): Promise<void> {
  if (!reservation.token) {
    throw new Error("A valid evidence reservation is required.");
  }
  for (const path of [reservation.resultPath, reservation.receiptPath]) {
    const { bytes } = await readManagedFile(path, "Evidence reservation");
    const parsed: unknown = JSON.parse(bytes.toString("utf8"));
    if (
      !isRecord(parsed) ||
      parsed["schema"] !== "easyeda-pro-control.evidence-reservation.v1" ||
      parsed["token"] !== reservation.token
    ) {
      throw new Error(
        "Evidence reservation identity changed before finalization.",
      );
    }
  }
}

export async function releaseEvidenceReservation(
  reservation: EvidenceReservation,
): Promise<void> {
  await assertReservation(reservation);
  await Promise.all([
    unlink(reservation.resultPath),
    unlink(reservation.receiptPath),
  ]);
  for (const directory of new Set([
    dirname(reservation.resultPath),
    dirname(reservation.receiptPath),
  ])) {
    await syncDirectory(directory);
  }
}

async function finalizeReservedPair(
  reservation: EvidenceReservation,
  resultText: string,
  receiptText: string,
): Promise<void> {
  await assertReservation(reservation);
  const replaceReservation = async (
    path: string,
    text: string,
  ): Promise<void> => {
    const handle = await open(
      path,
      fsConstants.O_RDWR | fsConstants.O_NOFOLLOW,
      0o600,
    );
    try {
      const existing = await handle.readFile("utf8");
      const parsed: unknown = JSON.parse(existing);
      if (!isRecord(parsed) || parsed["token"] !== reservation.token) {
        throw new Error("Evidence reservation changed before final write.");
      }
      await handle.truncate(0);
      const bytes = Buffer.from(text, "utf8");
      let offset = 0;
      while (offset < bytes.length) {
        const { bytesWritten } = await handle.write(
          bytes,
          offset,
          bytes.length - offset,
          offset,
        );
        if (bytesWritten <= 0) {
          throw new Error("Evidence finalization made no write progress.");
        }
        offset += bytesWritten;
      }
      await handle.sync();
    } finally {
      await handle.close();
    }
  };
  await replaceReservation(reservation.resultPath, resultText);
  await replaceReservation(reservation.receiptPath, receiptText);
  for (const directory of new Set([
    dirname(reservation.resultPath),
    dirname(reservation.receiptPath),
  ])) {
    await syncDirectory(directory);
  }
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
  const createdAt = new Date().toISOString();
  const payload = {
    schema: "easyeda-pro-control.tool-result.v1",
    createdAt,
    request,
    result,
    metadata,
  };
  const resultText = `${JSON.stringify(payload)}\n`;
  const archivedAttachments: ArchivedAttachment[] = [];
  for (const attachment of attachments) {
    const archived = await hashManagedAttachment(attachment.path);
    if (
      (attachment.bytes !== undefined && attachment.bytes !== archived.bytes) ||
      (attachment.sha256 !== undefined && attachment.sha256 !== archived.sha256)
    ) {
      throw new Error(
        "Evidence attachment changed before its receipt was finalized.",
      );
    }
    archivedAttachments.push({
      kind: (attachment.kind ?? "artifact").slice(0, 64),
      path: archived.path,
      bytes: archived.bytes,
      sha256: archived.sha256,
    });
  }
  const receiptCore = {
    schema: "easyeda-pro-control.tool-receipt.v1",
    createdAt,
    resultPath: held.resultPath,
    requestSha256: sha256Text(canonicalJson(request)),
    resultSha256: sha256Text(resultText),
    attachments: archivedAttachments,
    metadata,
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
  await assertReservation(reservation);
  const created: ArchivedCaptureImage[] = [];
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
      await assertSafeManagedDirectory(dirname(path));
      const handle = await open(path, "wx", 0o600);
      try {
        await handle.writeFile(image.bytes);
        await handle.sync();
      } finally {
        await handle.close();
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
    const createdAt = new Date().toISOString();
    const result = { payload, images: created };
    const resultPayload = {
      schema: "easyeda-pro-control.capture-result.v1",
      createdAt,
      request,
      result,
      metadata,
    };
    const resultText = `${JSON.stringify(resultPayload)}\n`;
    const receiptCore = {
      schema: "easyeda-pro-control.capture-receipt.v1",
      createdAt,
      resultPath: reservation.resultPath,
      requestSha256: sha256Text(canonicalJson(request)),
      resultSha256: sha256Text(resultText),
      images: created,
      metadata,
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
    for (const item of created) {
      await unlink(item.path).catch(ignoreCleanupError);
    }
    for (const directory of new Set(
      created.map((item) => dirname(item.path)),
    )) {
      await syncDirectory(directory).catch(ignoreCleanupError);
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
  const handle = await open(path, "wx", 0o600);
  try {
    const sealed = sealOperation(operation);
    Object.assign(operation, sealed);
    await handle.writeFile(`${JSON.stringify(sealed, null, 2)}\n`, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await syncDirectory(OPERATIONS_DIR);
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
    throw new Error(`Operation journal ${operationId} failed its self-hash.`);
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
  if (!(await pathExists(path))) {
    throw new Error(`Operation ${operationId} does not exist.`);
  }
  const temporary = `${path}.tmp-${process.pid}-${Date.now()}`;
  const sealed = sealOperation(operation);
  let handle: FileHandle | undefined;
  try {
    handle = await open(temporary, "wx", 0o600);
    await handle.writeFile(`${JSON.stringify(sealed, null, 2)}\n`, "utf8");
    await handle.sync();
    await handle.close();
    handle = undefined;
    await rename(temporary, path);
    await syncDirectory(OPERATIONS_DIR);
    Object.assign(operation, sealed);
  } catch (error) {
    await handle?.close().catch(ignoreCleanupError);
    await unlink(temporary).catch(ignoreCleanupError);
    throw error;
  }
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
  const handle = await open(path, "wx", 0o600);
  try {
    await handle.writeFile(text, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await syncDirectory(directory);
  return { path, sha256: sha256Text(text), bytes: Buffer.byteLength(text) };
}

export async function listOperations(): Promise<UnknownRecord[]> {
  await ensureOperationStorage();
  const directoryEntries = await readdir(OPERATIONS_DIR);
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
    await handle.close();
  }
}

export function controlDataDirectory(): string {
  return CONTROL_DATA_DIR;
}
