import { constants as fsConstants } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  access,
  mkdir,
  open,
  lstat,
  realpath,
  readdir,
  rename,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import process from 'node:process';
import {
  canonicalJson,
  buildPlanHash,
  OPERATION_SCHEMA,
  sha256Text,
  validateEvidencePaths,
} from './core.mjs';

const CONTROL_DATA_DIR = resolve(
  process.env.EASYEDA_CONTROL_DATA_DIR || join(process.env.HOME || '/tmp', '.easyeda-pro-control'),
);
const OPERATIONS_DIR = join(CONTROL_DATA_DIR, 'operations');

function isWithin(root, candidate) {
  const normalizedRoot = resolve(root);
  const normalizedCandidate = resolve(candidate);
  return (
    normalizedCandidate === normalizedRoot ||
    normalizedCandidate.startsWith(`${normalizedRoot}/`)
  );
}

function assertManagedPath(path, label = 'Artifact') {
  const absolute = resolve(path);
  if (!isWithin(CONTROL_DATA_DIR, absolute)) {
    throw new Error(`${label} path must stay inside ${CONTROL_DATA_DIR}.`);
  }
  return absolute;
}

async function assertSafeManagedDirectory(directory) {
  const absolute = assertManagedPath(directory, 'Directory');
  await mkdir(CONTROL_DATA_DIR, { recursive: true, mode: 0o700 });
  const rootInfo = await lstat(CONTROL_DATA_DIR);
  if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) {
    throw new Error('EasyEDA control data root must be a real directory, not a symlink.');
  }
  const relativePath = relative(CONTROL_DATA_DIR, absolute);
  if (relativePath.startsWith('..')) throw new Error('Directory escapes the control data root.');
  let current = CONTROL_DATA_DIR;
  for (const segment of relativePath.split('/').filter(Boolean)) {
    current = join(current, segment);
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink() || !info.isDirectory()) {
        throw new Error(`Managed parent ${current} is not a real directory.`);
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      await mkdir(current, { mode: 0o700 });
      const created = await lstat(current);
      if (created.isSymbolicLink() || !created.isDirectory()) {
        throw new Error(`Managed parent ${current} was replaced during creation.`);
      }
    }
  }
  const [realRoot, realDirectory] = await Promise.all([
    realpath(CONTROL_DATA_DIR),
    realpath(absolute),
  ]);
  if (!isWithin(realRoot, realDirectory)) {
    throw new Error('Managed directory resolves outside the control data root.');
  }
  return absolute;
}

async function assertSafeManagedFile(path, label = 'Artifact') {
  const absolute = assertManagedPath(path, label);
  const info = await lstat(absolute);
  if (info.isSymbolicLink() || !info.isFile()) {
    throw new Error(`${label} must be a regular non-symlink file.`);
  }
  const [realRoot, realFile] = await Promise.all([
    realpath(CONTROL_DATA_DIR),
    realpath(absolute),
  ]);
  if (!isWithin(realRoot, realFile)) throw new Error(`${label} resolves outside the control root.`);
  return { absolute, info };
}

function assertSameFileIdentity(expected, actual, label) {
  if (
    !actual.isFile() ||
    expected.dev !== actual.dev ||
    expected.ino !== actual.ino
  ) {
    throw new Error(`${label} was replaced between path validation and open.`);
  }
}

function assertFileStayedUnchanged(before, after, label) {
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

async function openSafeManagedFile(path, label = 'Artifact') {
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

export async function ensureManagedDirectory(path) {
  return await assertSafeManagedDirectory(path);
}

export async function inspectManagedFile(path, label = 'Artifact') {
  return await assertSafeManagedFile(path, label);
}

async function readManagedFile(path, label = 'Artifact') {
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

async function hashManagedAttachment(path, label = 'Evidence attachment') {
  const opened = await openSafeManagedFile(path, label);
  const { handle } = opened;
  try {
    // The upstream producer may have only dirtied the page cache. Flush the
    // artifact itself before binding a receipt to the bytes we are about to
    // hash, then verify that it stayed unchanged while being read.
    await handle.sync();
    const before = await handle.stat();
    const hash = createHash('sha256');
    for await (const chunk of handle.createReadStream({ autoClose: false })) hash.update(chunk);
    const after = await handle.stat();
    assertFileStayedUnchanged(before, after, label);
    const result = {
      path: opened.absolute,
      bytes: after.size,
      sha256: hash.digest('hex'),
    };
    await syncDirectory(dirname(opened.absolute));
    return result;
  } finally {
    await handle.close();
  }
}

async function pathExists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function syncDirectory(path) {
  const handle = await open(path, 'r');
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function writeExclusivePair(resultPath, resultText, receiptPath, receiptText) {
  let resultHandle;
  let receiptHandle;
  try {
    await mkdir(dirname(resultPath), { recursive: true, mode: 0o700 });
    await mkdir(dirname(receiptPath), { recursive: true, mode: 0o700 });
    resultHandle = await open(resultPath, 'wx', 0o600);
    receiptHandle = await open(receiptPath, 'wx', 0o600);
    await resultHandle.writeFile(resultText, 'utf8');
    await receiptHandle.writeFile(receiptText, 'utf8');
    await resultHandle.sync();
    await receiptHandle.sync();
  } catch (error) {
    await resultHandle?.close().catch(() => undefined);
    await receiptHandle?.close().catch(() => undefined);
    if (resultHandle) await unlink(resultPath).catch(() => undefined);
    if (receiptHandle) await unlink(receiptPath).catch(() => undefined);
    for (const directory of new Set([dirname(resultPath), dirname(receiptPath)])) {
      await syncDirectory(directory).catch(() => undefined);
    }
    throw error;
  } finally {
    await resultHandle?.close().catch(() => undefined);
    await receiptHandle?.close().catch(() => undefined);
  }
  for (const directory of new Set([dirname(resultPath), dirname(receiptPath)])) {
    await syncDirectory(directory);
  }
}

export async function reserveEvidencePaths(evidence) {
  const paths = validateEvidencePaths(evidence);
  const resultPath = assertManagedPath(paths.resultPath, 'Evidence result');
  const receiptPath = assertManagedPath(paths.receiptPath, 'Evidence receipt');
  const token = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let resultHandle;
  let receiptHandle;
  try {
    await assertSafeManagedDirectory(dirname(resultPath));
    await assertSafeManagedDirectory(dirname(receiptPath));
    resultHandle = await open(resultPath, 'wx', 0o600);
    receiptHandle = await open(receiptPath, 'wx', 0o600);
    const marker = `${JSON.stringify({ schema: 'easyeda-pro-control.evidence-reservation.v1', token })}\n`;
    await resultHandle.writeFile(marker, 'utf8');
    await receiptHandle.writeFile(marker, 'utf8');
    await resultHandle.sync();
    await receiptHandle.sync();
  } catch (error) {
    await resultHandle?.close().catch(() => undefined);
    await receiptHandle?.close().catch(() => undefined);
    if (resultHandle) await unlink(resultPath).catch(() => undefined);
    if (receiptHandle) await unlink(receiptPath).catch(() => undefined);
    for (const directory of new Set([dirname(resultPath), dirname(receiptPath)])) {
      await syncDirectory(directory).catch(() => undefined);
    }
    throw error;
  } finally {
    await resultHandle?.close().catch(() => undefined);
    await receiptHandle?.close().catch(() => undefined);
  }
  for (const directory of new Set([dirname(resultPath), dirname(receiptPath)])) {
    await syncDirectory(directory);
  }
  return { resultPath, receiptPath, token };
}

async function assertReservation(reservation) {
  if (!reservation?.token) throw new Error('A valid evidence reservation is required.');
  for (const path of [reservation.resultPath, reservation.receiptPath]) {
    const { bytes } = await readManagedFile(path, 'Evidence reservation');
    const parsed = JSON.parse(bytes.toString('utf8'));
    if (
      parsed.schema !== 'easyeda-pro-control.evidence-reservation.v1' ||
      parsed.token !== reservation.token
    ) {
      throw new Error('Evidence reservation identity changed before finalization.');
    }
  }
}

export async function releaseEvidenceReservation(reservation) {
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

async function finalizeReservedPair(reservation, resultText, receiptText) {
  await assertReservation(reservation);
  const replaceReservation = async (path, text) => {
    const handle = await open(
      path,
      fsConstants.O_RDWR | fsConstants.O_NOFOLLOW,
      0o600,
    );
    try {
      const existing = await handle.readFile('utf8');
      const parsed = JSON.parse(existing);
      if (parsed.token !== reservation.token) {
        throw new Error('Evidence reservation changed before final write.');
      }
      await handle.truncate(0);
      const bytes = Buffer.from(text, 'utf8');
      let offset = 0;
      while (offset < bytes.length) {
        const { bytesWritten } = await handle.write(
          bytes,
          offset,
          bytes.length - offset,
          offset,
        );
        if (bytesWritten <= 0) throw new Error('Evidence finalization made no write progress.');
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
}) {
  if (!evidence && !reservation) return undefined;
  const held = reservation ?? (await reserveEvidencePaths(evidence));
  const createdAt = new Date().toISOString();
  const payload = {
    schema: 'easyeda-pro-control.tool-result.v1',
    createdAt,
    request,
    result,
    metadata,
  };
  const resultText = `${JSON.stringify(payload)}\n`;
  const archivedAttachments = [];
  for (const attachment of attachments) {
    const archived = await hashManagedAttachment(attachment.path);
    if (
      (attachment.bytes !== undefined && attachment.bytes !== archived.bytes) ||
      (attachment.sha256 !== undefined && attachment.sha256 !== archived.sha256)
    ) {
      throw new Error('Evidence attachment changed before its receipt was finalized.');
    }
    archivedAttachments.push({
      kind: String(attachment.kind ?? 'artifact').slice(0, 64),
      path: archived.path,
      bytes: archived.bytes,
      sha256: archived.sha256,
    });
  }
  const receiptCore = {
    schema: 'easyeda-pro-control.tool-receipt.v1',
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
  await finalizeReservedPair(held, resultText, `${JSON.stringify(receipt, null, 2)}\n`);
  return { resultPath: held.resultPath, receiptPath: held.receiptPath, ...receipt };
}

export async function archiveCaptureEvidence({ reservation, request, payload, images, metadata }) {
  if (!reservation) throw new Error('Capture evidence must be reserved before dispatch.');
  await assertReservation(reservation);
  const created = [];
  try {
    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];
      const path = assertManagedPath(`${reservation.resultPath}.image-${index + 1}.png`, 'Capture image');
      await assertSafeManagedDirectory(dirname(path));
      const handle = await open(path, 'wx', 0o600);
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
        sha256: createHash('sha256').update(image.bytes).digest('hex'),
      });
    }
    for (const directory of new Set(created.map((item) => dirname(item.path)))) {
      await syncDirectory(directory);
    }
    const createdAt = new Date().toISOString();
    const result = { payload, images: created };
    const resultPayload = {
      schema: 'easyeda-pro-control.capture-result.v1',
      createdAt,
      request,
      result,
      metadata,
    };
    const resultText = `${JSON.stringify(resultPayload)}\n`;
    const receiptCore = {
      schema: 'easyeda-pro-control.capture-receipt.v1',
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
    return { resultPath: reservation.resultPath, receiptPath: reservation.receiptPath, ...receipt };
  } catch (error) {
    for (const item of created) await unlink(item.path).catch(() => undefined);
    for (const directory of new Set(created.map((item) => dirname(item.path)))) {
      await syncDirectory(directory).catch(() => undefined);
    }
    throw error;
  }
}

export async function verifyEvidenceReceipt(receiptPathInput) {
  const receiptPath = assertManagedPath(receiptPathInput, 'Evidence receipt');
  const receipt = JSON.parse((await readManagedFile(receiptPath, 'Evidence receipt')).bytes.toString('utf8'));
  if (
    ![
      'easyeda-pro-control.tool-receipt.v1',
      'easyeda-pro-control.capture-receipt.v1',
    ].includes(receipt.schema)
  ) {
    throw new Error('Unsupported evidence receipt schema.');
  }
  const { receiptSha256, ...receiptCore } = receipt;
  const receiptHashOk = receiptSha256 === sha256Text(canonicalJson(receiptCore));
  const resultPath = assertManagedPath(receipt.resultPath, 'Evidence result');
  const resultText = (await readManagedFile(resultPath, 'Evidence result')).bytes;
  const resultHashOk = sha256Text(resultText) === receipt.resultSha256;
  const imageChecks = [];
  for (const image of receipt.images ?? []) {
    const path = assertManagedPath(image.path, 'Capture image');
    const bytes = (await readManagedFile(path, 'Capture image')).bytes;
    imageChecks.push({
      path,
      ok:
        bytes.length === image.bytes &&
        createHash('sha256').update(bytes).digest('hex') === image.sha256,
    });
  }
  const attachmentChecks = [];
  for (const attachment of receipt.attachments ?? []) {
    try {
      const actual = await hashManagedAttachment(attachment.path);
      attachmentChecks.push({
        path: actual.path,
        ok: actual.bytes === attachment.bytes && actual.sha256 === attachment.sha256,
      });
    } catch (error) {
      attachmentChecks.push({
        path: attachment?.path,
        ok: false,
        error: String(error?.message ?? error).slice(0, 2048),
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

export async function ensureOperationStorage() {
  await assertSafeManagedDirectory(OPERATIONS_DIR);
  return OPERATIONS_DIR;
}

export function operationPath(operationId) {
  if (!/^[a-z0-9][a-z0-9-]{7,95}$/i.test(operationId)) {
    throw new Error('Invalid operationId.');
  }
  return join(OPERATIONS_DIR, `${operationId}.json`);
}

export async function createOperation(operation) {
  await ensureOperationStorage();
  const path = operationPath(operation.operationId);
  const handle = await open(path, 'wx', 0o600);
  try {
    const sealed = sealOperation(operation);
    Object.assign(operation, sealed);
    await handle.writeFile(`${JSON.stringify(sealed, null, 2)}\n`, 'utf8');
    await handle.sync();
  } finally {
    await handle.close();
  }
  await syncDirectory(OPERATIONS_DIR);
  return path;
}

export async function loadOperation(operationId) {
  const path = operationPath(operationId);
  const parsed = JSON.parse((await readManagedFile(path, 'Operation journal')).bytes.toString('utf8'));
  if (parsed.schema !== OPERATION_SCHEMA || parsed.operationId !== operationId) {
    throw new Error(`Operation journal ${operationId} has an invalid schema or identity.`);
  }
  const { journalSha256, ...journalCore } = parsed;
  if (journalSha256 !== sha256Text(canonicalJson(journalCore))) {
    throw new Error(`Operation journal ${operationId} failed its self-hash.`);
  }
  if (!parsed.plan || parsed.planHash !== buildPlanHash(parsed.plan)) {
    throw new Error(`Operation journal ${operationId} has a mismatched plan hash.`);
  }
  for (const descriptor of parsed.artifacts ?? []) {
    if (!isWithin(join(OPERATIONS_DIR, operationId), descriptor.path)) {
      throw new Error(`Operation ${operationId} references an artifact outside its directory.`);
    }
    const text = (await readManagedFile(descriptor.path, 'Operation phase artifact')).bytes;
    if (text.length !== descriptor.bytes || sha256Text(text) !== descriptor.sha256) {
      throw new Error(`Operation ${operationId} phase artifact failed hash verification.`);
    }
  }
  return parsed;
}

function sealOperation(operation) {
  const { journalSha256: ignored, ...journalCore } = operation;
  return { ...journalCore, journalSha256: sha256Text(canonicalJson(journalCore)) };
}

export async function updateOperation(operation) {
  await ensureOperationStorage();
  const path = operationPath(operation.operationId);
  if (!(await pathExists(path))) throw new Error(`Operation ${operation.operationId} does not exist.`);
  const temporary = `${path}.tmp-${process.pid}-${Date.now()}`;
  const sealed = sealOperation(operation);
  let handle;
  try {
    handle = await open(temporary, 'wx', 0o600);
    await handle.writeFile(`${JSON.stringify(sealed, null, 2)}\n`, 'utf8');
    await handle.sync();
    await handle.close();
    handle = undefined;
    await rename(temporary, path);
    await syncDirectory(OPERATIONS_DIR);
    Object.assign(operation, sealed);
  } catch (error) {
    await handle?.close().catch(() => undefined);
    await unlink(temporary).catch(() => undefined);
    throw error;
  }
  return path;
}

export async function writePhaseArtifact(operationId, sequence, phase, value) {
  await ensureOperationStorage();
  const directory = join(OPERATIONS_DIR, operationId);
  await assertSafeManagedDirectory(directory);
  const safePhase = String(phase).replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
  const path = join(directory, `${String(sequence).padStart(2, '0')}-${safePhase}.json`);
  const text = `${JSON.stringify(value)}\n`;
  const handle = await open(path, 'wx', 0o600);
  try {
    await handle.writeFile(text, 'utf8');
    await handle.sync();
  } finally {
    await handle.close();
  }
  await syncDirectory(directory);
  return { path, sha256: sha256Text(text), bytes: Buffer.byteLength(text) };
}

export async function listOperations() {
  await ensureOperationStorage();
  const names = (await readdir(OPERATIONS_DIR)).filter((name) => name.endsWith('.json')).sort();
  const output = [];
  for (const name of names) {
    try {
      const operationId = name.replace(/\.json$/, '');
      output.push(await loadOperation(operationId));
    } catch (error) {
      const journalPath = join(OPERATIONS_DIR, name);
      const message = String(error?.message ?? error);
      output.push({
        operationId: name.replace(/\.json$/, ''),
        state: 'journal-unreadable',
        mutationState: 'unknown',
        hardStop: true,
        mutationMayHaveOccurred: true,
        journalPath,
        lastError: {
          name: String(error?.name ?? 'Error').slice(0, 128),
          message: message.length <= 2048 ? message : `${message.slice(0, 2047)}…`,
        },
        nextSafeAction: 'Inspect and restore the named managed journal before any new mutation.',
      });
    }
  }
  return output;
}

export async function readArtifact(path, offset = 0, length = 65536) {
  const absolute = assertManagedPath(path);
  const boundedOffset = Math.max(0, Number(offset));
  const boundedLength = Math.max(1, Math.min(256 * 1024, Number(length)));
  const opened = await openSafeManagedFile(absolute);
  const { handle, info } = opened;
  try {
    const buffer = Buffer.alloc(Math.min(boundedLength, Math.max(0, info.size - boundedOffset)));
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, boundedOffset);
    const after = await handle.stat();
    assertFileStayedUnchanged(info, after, 'Artifact');
    return {
      path: opened.absolute,
      size: after.size,
      offset: boundedOffset,
      bytesRead,
      eof: boundedOffset + bytesRead >= after.size,
      text: buffer.subarray(0, bytesRead).toString('utf8'),
    };
  } finally {
    await handle.close();
  }
}

export function controlDataDirectory() {
  return CONTROL_DATA_DIR;
}
