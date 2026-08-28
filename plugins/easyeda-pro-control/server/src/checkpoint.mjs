import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, open, readFile, stat, unlink } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { canonicalJson, sha256Text } from './core.mjs';

function safeLabel(value) {
  const label = String(value ?? '').trim();
  if (!/^[a-z0-9][a-z0-9._-]{0,63}$/i.test(label)) {
    throw new Error('Checkpoint label must be 1-64 filename-safe characters.');
  }
  return label;
}

function timestampForPath(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.(\d{3})Z$/, '$1Z');
}

function sqliteUri(path) {
  return `file:${path}?mode=ro`;
}

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= 0x7fffffff
    ? parsed
    : fallback;
}

async function run(command, args, options = {}) {
  return await new Promise((resolvePromise, reject) => {
    const {
      maxBuffer = 256 * 1024 * 1024,
      maxStderrBuffer: requestedMaxStderrBuffer = process.env.EASYEDA_CHECKPOINT_STDERR_MAX_BYTES,
      timeoutMs: requestedTimeoutMs = process.env.EASYEDA_CHECKPOINT_PROCESS_TIMEOUT_MS,
      ...spawnOptions
    } = options;
    const checkedMaxBuffer = positiveInteger(maxBuffer, 256 * 1024 * 1024);
    const maxStderrBuffer = positiveInteger(requestedMaxStderrBuffer, 1024 * 1024);
    const timeoutMs = positiveInteger(requestedTimeoutMs, 120000);
    const child = spawn(command, args, { ...spawnOptions, stdio: ['ignore', 'pipe', 'pipe'] });
    const stdout = [];
    const stderr = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback(value);
    };
    const abort = (message) => {
      if (settled) return;
      child.kill('SIGKILL');
      finish(reject, new Error(message));
    };
    const timer = setTimeout(() => {
      abort(`${command} timed out after ${timeoutMs} ms.`);
    }, timeoutMs);
    child.stdout.on('data', (chunk) => {
      stdoutBytes += chunk.length;
      if (stdoutBytes > checkedMaxBuffer) {
        abort(`${command} stdout exceeded ${checkedMaxBuffer} bytes.`);
      }
      else stdout.push(chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderrBytes += chunk.length;
      if (stderrBytes > maxStderrBuffer) {
        abort(`${command} stderr exceeded ${maxStderrBuffer} bytes.`);
      } else {
        stderr.push(chunk);
      }
    });
    child.once('error', (error) => finish(reject, error));
    child.once('close', (code, signal) => {
      if (settled) return;
      if (code !== 0) {
        finish(
          reject,
          new Error(
            `${command} failed (${code ?? signal}): ${Buffer.concat(stderr).toString('utf8').trim()}`,
          ),
        );
      } else finish(resolvePromise, Buffer.concat(stdout));
    });
  });
}

async function quickCheck(path) {
  const output = await run('sqlite3', [sqliteUri(path), 'PRAGMA query_only=ON; PRAGMA quick_check;']);
  const value = output.toString('utf8').trim();
  if (value !== 'ok') throw new Error(`SQLite quick_check failed for ${path}: ${value}`);
  return value;
}

async function sha256File(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

async function dumpHash(path) {
  const dump = await run('sqlite3', [sqliteUri(path), '.dump']);
  return createHash('sha256').update(dump).digest('hex');
}

async function syncFile(path) {
  const handle = await open(path, 'r');
  try {
    await handle.sync();
  } finally {
    await handle.close();
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

export async function createCheckpoint({ source, outputDir, label }) {
  const sourcePath = resolve(source);
  const destinationDir = resolve(outputDir);
  const checkedLabel = safeLabel(label);
  const sourceInfoBefore = await stat(sourcePath);
  if (!sourceInfoBefore.isFile() || sourceInfoBefore.size === 0) {
    throw new Error('Checkpoint source must be a non-empty file.');
  }
  await mkdir(destinationDir, { recursive: true, mode: 0o700 });
  await quickCheck(sourcePath);
  const createdAt = new Date();
  const sourceStem = basename(sourcePath).replace(/\.[^.]+$/, '') || 'EasyEDA';
  const stem = `${sourceStem}-${checkedLabel}-${timestampForPath(createdAt)}`;
  const checkpointPath = join(destinationDir, `${stem}.eprj2`);
  const receiptPath = join(destinationDir, `${stem}.checkpoint.json`);
  let checkpointHandle;
  let receiptHandle;
  let checkpointCreated = false;
  let receiptCreated = false;
  try {
    checkpointHandle = await open(checkpointPath, 'wx', 0o600);
    checkpointCreated = true;
    await checkpointHandle.close();
    checkpointHandle = undefined;

    const escapedTarget = checkpointPath.replaceAll("'", "''");
    await run('sqlite3', [
      '-cmd',
      '.timeout 30000',
      sqliteUri(sourcePath),
      `.backup '${escapedTarget}'`,
    ]);
    await syncFile(checkpointPath);
    await quickCheck(checkpointPath);
    await quickCheck(sourcePath);

    const [sourceDumpSha256, checkpointDumpSha256] = await Promise.all([
      dumpHash(sourcePath),
      dumpHash(checkpointPath),
    ]);
    if (sourceDumpSha256 !== checkpointDumpSha256) {
      throw new Error('Checkpoint dump does not match the source dump.');
    }
    const sourceInfoAfter = await stat(sourcePath);
    const receiptCore = {
      schema: 'easyeda-pro-control.checkpoint.v1',
      createdAt: createdAt.toISOString(),
      source: sourcePath,
      checkpoint: checkpointPath,
      sourceStatBefore: { size: sourceInfoBefore.size, mtimeMs: sourceInfoBefore.mtimeMs },
      sourceStatAfter: { size: sourceInfoAfter.size, mtimeMs: sourceInfoAfter.mtimeMs },
      sourceSha256: await sha256File(sourcePath),
      checkpointSha256: await sha256File(checkpointPath),
      sourceDumpSha256,
      checkpointDumpSha256,
      quickCheck: { sourceBefore: 'ok', sourceAfter: 'ok', checkpoint: 'ok' },
    };
    const receipt = {
      ...receiptCore,
      receiptSha256: sha256Text(canonicalJson(receiptCore)),
    };
    receiptHandle = await open(receiptPath, 'wx', 0o600);
    receiptCreated = true;
    await receiptHandle.writeFile(`${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
    await receiptHandle.sync();
    await receiptHandle.close();
    receiptHandle = undefined;
    await syncDirectory(destinationDir);
    return { ...receipt, receiptPath };
  } catch (error) {
    const cleanupErrors = [];
    for (const handle of [receiptHandle, checkpointHandle]) {
      if (!handle) continue;
      try {
        await handle.close();
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
    }
    for (const [created, path] of [
      [receiptCreated, receiptPath],
      [checkpointCreated, checkpointPath],
    ]) {
      if (!created) continue;
      try {
        await unlink(path);
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
    }
    try {
      await syncDirectory(destinationDir);
    } catch (cleanupError) {
      cleanupErrors.push(cleanupError);
    }
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        `Checkpoint creation failed and cleanup was incomplete: ${error.message}`,
        { cause: error },
      );
    }
    throw error;
  }
}

export async function verifyCheckpoint(receiptPathInput) {
  const receiptPath = resolve(receiptPathInput);
  const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
  if (receipt.schema !== 'easyeda-pro-control.checkpoint.v1') {
    throw new Error('Unexpected checkpoint receipt schema.');
  }
  const { receiptSha256, receiptPath: ignoredReceiptPath, ...receiptCore } = receipt;
  if (receiptSha256 !== sha256Text(canonicalJson(receiptCore))) {
    throw new Error('Checkpoint receipt hash is invalid.');
  }
  await quickCheck(receipt.source);
  await quickCheck(receipt.checkpoint);
  const [sourceSha256, checkpointSha256, sourceDumpSha256, checkpointDumpSha256] =
    await Promise.all([
      sha256File(receipt.source),
      sha256File(receipt.checkpoint),
      dumpHash(receipt.source),
      dumpHash(receipt.checkpoint),
    ]);
  const sourceMatchesReceipt =
    sourceSha256 === receipt.sourceSha256 && sourceDumpSha256 === receipt.sourceDumpSha256;
  const checkpointMatchesReceipt =
    checkpointSha256 === receipt.checkpointSha256 &&
    checkpointDumpSha256 === receipt.checkpointDumpSha256;
  const sourceEqualsCheckpoint = sourceDumpSha256 === checkpointDumpSha256;
  const ok = sourceMatchesReceipt && checkpointMatchesReceipt && sourceEqualsCheckpoint;
  return {
    ok,
    receiptPath,
    source: receipt.source,
    checkpoint: receipt.checkpoint,
    sourceMatchesReceipt,
    checkpointMatchesReceipt,
    sourceEqualsCheckpoint,
    sourceChanged: checkpointMatchesReceipt && !sourceMatchesReceipt,
    sourceSha256,
    checkpointSha256,
    sourceDumpSha256,
    checkpointDumpSha256,
  };
}
