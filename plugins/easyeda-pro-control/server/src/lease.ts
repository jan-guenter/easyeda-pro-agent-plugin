import { randomUUID } from 'node:crypto';
import { readFileSync, unlinkSync } from 'node:fs';
import { lstat, mkdir, open, readFile, realpath, unlink } from 'node:fs/promises';
import type { FileHandle } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';

interface LeaseRecord {
  schema: 'easyeda-pro-control.facade-lease.v1';
  token: string;
  pid: number;
  startedAt: unknown;
}

interface CleanupLeaseRecord {
  schema: 'easyeda-pro-control.facade-lease-cleanup.v1';
  token: string;
  pid: number;
  staleToken: string;
  startedAt: unknown;
}

interface FacadeLease {
  path: string;
  token: string;
  pid: number;
  release: () => Promise<void>;
  releaseSync: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function errorCode(error: unknown): string | undefined {
  return isRecord(error) && typeof error['code'] === 'string' ? error['code'] : undefined;
}

function pidIsAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return errorCode(error) === 'EPERM';
  }
}

async function parseLease(path: string): Promise<LeaseRecord> {
  const value: unknown = JSON.parse(await readFile(path, 'utf8'));
  if (
    !isRecord(value) ||
    value['schema'] !== 'easyeda-pro-control.facade-lease.v1' ||
    typeof value['pid'] !== 'number' ||
    !Number.isInteger(value['pid']) ||
    typeof value['token'] !== 'string' ||
    value['token'].length < 16
  ) {
    throw new Error('The EasyEDA facade lease is corrupt; refusing to remove it automatically.');
  }
  return {
    schema: 'easyeda-pro-control.facade-lease.v1',
    token: value['token'],
    pid: value['pid'],
    startedAt: value['startedAt'],
  };
}

async function parseCleanupLease(path: string): Promise<CleanupLeaseRecord> {
  const value: unknown = JSON.parse(await readFile(path, 'utf8'));
  if (
    !isRecord(value) ||
    value['schema'] !== 'easyeda-pro-control.facade-lease-cleanup.v1' ||
    typeof value['pid'] !== 'number' ||
    !Number.isInteger(value['pid']) ||
    typeof value['token'] !== 'string' ||
    value['token'].length < 16 ||
    typeof value['staleToken'] !== 'string' ||
    value['staleToken'].length < 16
  ) {
    throw new Error(
      'The EasyEDA facade cleanup lease is corrupt; refusing to remove it automatically.',
    );
  }
  return {
    schema: 'easyeda-pro-control.facade-lease-cleanup.v1',
    token: value['token'],
    pid: value['pid'],
    staleToken: value['staleToken'],
    startedAt: value['startedAt'],
  };
}

async function acquireCleanupLease(
  cleanupPath: string,
  staleToken: string,
): Promise<CleanupLeaseRecord> {
  const token = randomUUID();
  const record: CleanupLeaseRecord = {
    schema: 'easyeda-pro-control.facade-lease-cleanup.v1',
    token,
    pid: process.pid,
    staleToken,
    startedAt: new Date().toISOString(),
  };
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let handle: FileHandle | undefined;
    try {
      handle = await open(cleanupPath, 'wx', 0o600);
      await handle.writeFile(`${JSON.stringify(record)}\n`, 'utf8');
      await handle.close();
      return record;
    } catch (error) {
      await handle?.close().catch(() => {});
      if (errorCode(error) !== 'EEXIST') throw error;
      let existing: CleanupLeaseRecord;
      try {
        existing = await parseCleanupLease(cleanupPath);
      } catch (parseError) {
        if (errorCode(parseError) === 'ENOENT') continue;
        throw parseError;
      }
      if (pidIsAlive(existing.pid)) {
        throw new Error(
          `Another process is reconciling the stale EasyEDA facade lease (pid ${existing.pid}).`, { cause: error },
        );
      }
      let current: CleanupLeaseRecord;
      try {
        current = await parseCleanupLease(cleanupPath);
      } catch (readError) {
        if (errorCode(readError) === 'ENOENT') continue;
        throw readError;
      }
      if (current.token === existing.token && current.pid === existing.pid) {
        await unlink(cleanupPath).catch((unlinkError) => {
          if (errorCode(unlinkError) !== 'ENOENT') throw unlinkError;
        });
      }
    }
  }
  throw new Error('Could not acquire the stale EasyEDA facade cleanup lease safely.');
}

async function releaseCleanupLease(
  cleanupPath: string,
  cleanupLease: CleanupLeaseRecord,
): Promise<void> {
  let currentCleanup: CleanupLeaseRecord;
  try {
    currentCleanup = await parseCleanupLease(cleanupPath);
  } catch (error) {
    if (errorCode(error) === 'ENOENT') return;
    throw error;
  }
  if (currentCleanup.token === cleanupLease.token && currentCleanup.pid === cleanupLease.pid) {
    await unlink(cleanupPath);
  }
}

export async function acquireFacadeLease(controlRoot: string): Promise<FacadeLease> {
  const root = resolve(controlRoot);
  await mkdir(root, { recursive: true, mode: 0o700 });
  const rootInfo = await lstat(root);
  if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) {
    throw new Error('EasyEDA facade lease root must be a real directory, not a symlink.');
  }
  if ((await realpath(root)) !== root) {
    throw new Error('EasyEDA facade lease root must not traverse a symbolic-link path.');
  }
  const path = join(root, 'facade.lock');
  const token = randomUUID();
  const record: LeaseRecord = {
    schema: 'easyeda-pro-control.facade-lease.v1',
    token,
    pid: process.pid,
    startedAt: new Date().toISOString(),
  };

  let handle: FileHandle | undefined;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      handle = await open(path, 'wx', 0o600);
      await handle.writeFile(`${JSON.stringify(record)}\n`, 'utf8');
      await handle.close();
      handle = undefined;
      break;
    } catch (error) {
      await handle?.close().catch(() => {});
      handle = undefined;
      if (errorCode(error) !== 'EEXIST' || attempt > 0) throw error;
      const existing = await parseLease(path);
      if (pidIsAlive(existing.pid)) {
        throw new Error(
          `Another EasyEDA control facade owns ${path} (pid ${existing.pid}). Reuse that MCP connection or close it first.`, { cause: error },
        );
      }
      const cleanupPath = `${path}.cleanup`;
      const cleanupLease = await acquireCleanupLease(cleanupPath, existing.token);
      try {
        const current = await parseLease(path);
        if (current.token !== existing.token || current.pid !== existing.pid) {
          throw new Error('EasyEDA facade lease changed during stale-owner reconciliation.', { cause: error });
        }
        await unlink(path);
      } catch (reconciliationError) {
        try {
          await releaseCleanupLease(cleanupPath, cleanupLease);
        } catch (cleanupError) {
          throw new AggregateError(
            [reconciliationError, cleanupError],
            'EasyEDA facade lease reconciliation and cleanup both failed.',
            { cause: cleanupError },
          );
        }
        throw reconciliationError;
      }
      await releaseCleanupLease(cleanupPath, cleanupLease);
    }
  }

  const ownsLease = (value: unknown): value is LeaseRecord =>
    isRecord(value) && value['token'] === token && value['pid'] === process.pid;
  const release = async (): Promise<void> => {
    let existing: LeaseRecord;
    try {
      existing = await parseLease(path);
    } catch (error) {
      if (errorCode(error) === 'ENOENT') return;
      throw error;
    }
    if (!ownsLease(existing)) {
      throw new Error('EasyEDA facade lease ownership changed; refusing to unlink it.');
    }
    await unlink(path);
  };
  const releaseSync = (): void => {
    try {
      const existing: unknown = JSON.parse(readFileSync(path, 'utf8'));
      if (ownsLease(existing)) unlinkSync(path);
    } catch {
      // Exit-time cleanup is best effort. A dead-PID lease is removed safely on next startup.
    }
  };
  return { path, token, pid: process.pid, release, releaseSync };
}
