import { randomUUID } from 'node:crypto';
import { readFileSync, unlinkSync } from 'node:fs';
import { lstat, mkdir, open, readFile, realpath, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';

function pidIsAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === 'EPERM';
  }
}

async function parseLease(path) {
  const value = JSON.parse(await readFile(path, 'utf8'));
  if (
    value?.schema !== 'easyeda-pro-control.facade-lease.v1' ||
    !Number.isInteger(value.pid) ||
    typeof value.token !== 'string' ||
    value.token.length < 16
  ) {
    throw new Error('The EasyEDA facade lease is corrupt; refusing to remove it automatically.');
  }
  return value;
}

async function parseCleanupLease(path) {
  const value = JSON.parse(await readFile(path, 'utf8'));
  if (
    value?.schema !== 'easyeda-pro-control.facade-lease-cleanup.v1' ||
    !Number.isInteger(value.pid) ||
    typeof value.token !== 'string' ||
    value.token.length < 16 ||
    typeof value.staleToken !== 'string' ||
    value.staleToken.length < 16
  ) {
    throw new Error(
      'The EasyEDA facade cleanup lease is corrupt; refusing to remove it automatically.',
    );
  }
  return value;
}

async function acquireCleanupLease(cleanupPath, staleToken) {
  const token = randomUUID();
  const record = {
    schema: 'easyeda-pro-control.facade-lease-cleanup.v1',
    token,
    pid: process.pid,
    staleToken,
    startedAt: new Date().toISOString(),
  };
  for (let attempt = 0; attempt < 4; attempt += 1) {
    let handle;
    try {
      handle = await open(cleanupPath, 'wx', 0o600);
      await handle.writeFile(`${JSON.stringify(record)}\n`, 'utf8');
      await handle.close();
      return record;
    } catch (error) {
      await handle?.close().catch(() => undefined);
      if (error?.code !== 'EEXIST') throw error;
      let existing;
      try {
        existing = await parseCleanupLease(cleanupPath);
      } catch (parseError) {
        if (parseError?.code === 'ENOENT') continue;
        throw parseError;
      }
      if (pidIsAlive(existing.pid)) {
        throw new Error(
          `Another process is reconciling the stale EasyEDA facade lease (pid ${existing.pid}).`,
        );
      }
      let current;
      try {
        current = await parseCleanupLease(cleanupPath);
      } catch (readError) {
        if (readError?.code === 'ENOENT') continue;
        throw readError;
      }
      if (current.token === existing.token && current.pid === existing.pid) {
        await unlink(cleanupPath).catch((unlinkError) => {
          if (unlinkError?.code !== 'ENOENT') throw unlinkError;
        });
      }
    }
  }
  throw new Error('Could not acquire the stale EasyEDA facade cleanup lease safely.');
}

export async function acquireFacadeLease(controlRoot) {
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
  const record = {
    schema: 'easyeda-pro-control.facade-lease.v1',
    token,
    pid: process.pid,
    startedAt: new Date().toISOString(),
  };

  let handle;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      handle = await open(path, 'wx', 0o600);
      await handle.writeFile(`${JSON.stringify(record)}\n`, 'utf8');
      await handle.close();
      handle = undefined;
      break;
    } catch (error) {
      await handle?.close().catch(() => undefined);
      handle = undefined;
      if (error?.code !== 'EEXIST' || attempt > 0) throw error;
      const existing = await parseLease(path);
      if (pidIsAlive(existing.pid)) {
        throw new Error(
          `Another EasyEDA control facade owns ${path} (pid ${existing.pid}). Reuse that MCP connection or close it first.`,
        );
      }
      const cleanupPath = `${path}.cleanup`;
      const cleanupLease = await acquireCleanupLease(cleanupPath, existing.token);
      try {
        const current = await parseLease(path);
        if (current.token !== existing.token || current.pid !== existing.pid) {
          throw new Error('EasyEDA facade lease changed during stale-owner reconciliation.');
        }
        await unlink(path);
      } finally {
        try {
          const currentCleanup = await parseCleanupLease(cleanupPath);
          if (
            currentCleanup.token === cleanupLease.token &&
            currentCleanup.pid === cleanupLease.pid
          ) {
            await unlink(cleanupPath);
          }
        } catch (cleanupError) {
          if (cleanupError?.code !== 'ENOENT') throw cleanupError;
        }
      }
    }
  }

  const ownsLease = (value) => value?.token === token && value?.pid === process.pid;
  const release = async () => {
    let existing;
    try {
      existing = await parseLease(path);
    } catch (error) {
      if (error?.code === 'ENOENT') return;
      throw error;
    }
    if (!ownsLease(existing)) {
      throw new Error('EasyEDA facade lease ownership changed; refusing to unlink it.');
    }
    await unlink(path);
  };
  const releaseSync = () => {
    try {
      const existing = JSON.parse(readFileSync(path, 'utf8'));
      if (ownsLease(existing)) unlinkSync(path);
    } catch {
      // Exit-time cleanup is best effort. A dead-PID lease is removed safely on next startup.
    }
  };
  return { path, token, pid: process.pid, release, releaseSync };
}
