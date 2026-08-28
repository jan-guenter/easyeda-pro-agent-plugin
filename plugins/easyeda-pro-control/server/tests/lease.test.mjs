import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, test } from 'node:test';

import { acquireFacadeLease } from '../src/lease.mjs';

async function temporaryRoot(label) {
  return await mkdtemp(join(tmpdir(), `easyeda-control-lease-${label}-`));
}

async function waitForReady(child) {
  return await new Promise((resolveReady, reject) => {
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => {
      reject(new Error(`Lease child did not become ready. stderr: ${stderr}`));
    }, 10000);
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
      if (stdout.includes('READY\n')) {
        clearTimeout(timeout);
        resolveReady();
      }
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });
    child.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once('exit', (code, signal) => {
      if (!stdout.includes('READY\n')) {
        clearTimeout(timeout);
        reject(new Error(`Lease child exited before ready (${code ?? signal}). stderr: ${stderr}`));
      }
    });
  });
}

async function stopChild(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise((resolveExit) => child.once('exit', resolveExit));
  child.kill('SIGTERM');
  await exited;
}

describe('cross-process facade lease', { concurrency: false }, () => {
  test('rejects a symlinked control root without creating a lock in its target', async () => {
    const parent = await temporaryRoot('symlink-parent');
    const target = join(parent, 'target');
    const link = join(parent, 'control-link');
    try {
      await mkdir(target);
      await symlink(target, link, 'dir');
      await assert.rejects(acquireFacadeLease(link), /real directory|symbolic-link/);
      await assert.rejects(
        readFile(join(target, 'facade.lock'), 'utf8'),
        (error) => error.code === 'ENOENT',
      );
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  });

  test('allows one owner and rejects a second live owner', async () => {
    const root = await temporaryRoot('same-process');
    let lease;
    try {
      lease = await acquireFacadeLease(root);
      const stored = JSON.parse(await readFile(lease.path, 'utf8'));
      assert.equal(stored.pid, process.pid);
      assert.equal(stored.token, lease.token);
      await assert.rejects(acquireFacadeLease(root), /Another EasyEDA control facade owns/);
      await lease.release();
      lease = undefined;
      const replacement = await acquireFacadeLease(root);
      await replacement.release();
    } finally {
      await lease?.release().catch(() => undefined);
      await rm(root, { recursive: true, force: true });
    }
  });

  test('removes a valid dead-PID lease but refuses a corrupt lease', async () => {
    const staleRoot = await temporaryRoot('stale');
    const corruptRoot = await temporaryRoot('corrupt');
    try {
      await writeFile(
        join(staleRoot, 'facade.lock'),
        `${JSON.stringify({
          schema: 'easyeda-pro-control.facade-lease.v1',
          token: 'dead-process-token',
          pid: 2_147_483_647,
          startedAt: '2026-08-27T00:00:00.000Z',
        })}\n`,
        'utf8',
      );
      const replacement = await acquireFacadeLease(staleRoot);
      assert.equal(JSON.parse(await readFile(replacement.path, 'utf8')).pid, process.pid);
      await replacement.release();

      await writeFile(join(corruptRoot, 'facade.lock'), '{not-json}\n', 'utf8');
      await assert.rejects(acquireFacadeLease(corruptRoot), /Unexpected token|JSON/);
      assert.equal(await readFile(join(corruptRoot, 'facade.lock'), 'utf8'), '{not-json}\n');
    } finally {
      await rm(staleRoot, { recursive: true, force: true });
      await rm(corruptRoot, { recursive: true, force: true });
    }
  });

  test('reconciles a dead cleanup lease left by a crashed stale-owner cleanup', async () => {
    const root = await temporaryRoot('cleanup-crash');
    const leasePath = join(root, 'facade.lock');
    const cleanupPath = `${leasePath}.cleanup`;
    const staleToken = 'stale-facade-owner-token';
    try {
      await writeFile(
        leasePath,
        `${JSON.stringify({
          schema: 'easyeda-pro-control.facade-lease.v1',
          token: staleToken,
          pid: 2_147_483_647,
          startedAt: '2026-08-27T00:00:00.000Z',
        })}\n`,
        'utf8',
      );
      await writeFile(
        cleanupPath,
        `${JSON.stringify({
          schema: 'easyeda-pro-control.facade-lease-cleanup.v1',
          token: 'stale-cleanup-owner-token',
          pid: 2_147_483_646,
          staleToken,
          startedAt: '2026-08-27T00:00:01.000Z',
        })}\n`,
        'utf8',
      );

      const replacement = await acquireFacadeLease(root);
      assert.equal(JSON.parse(await readFile(replacement.path, 'utf8')).pid, process.pid);
      await assert.rejects(readFile(cleanupPath, 'utf8'), (error) => error.code === 'ENOENT');
      await replacement.release();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  test('does not release a lease after its ownership token changes', async () => {
    const root = await temporaryRoot('ownership');
    const lease = await acquireFacadeLease(root);
    try {
      const stored = JSON.parse(await readFile(lease.path, 'utf8'));
      stored.token = 'replacement-owner-token';
      await writeFile(lease.path, `${JSON.stringify(stored)}\n`, 'utf8');
      await assert.rejects(lease.release(), /ownership changed/);
      assert.equal(JSON.parse(await readFile(lease.path, 'utf8')).token, 'replacement-owner-token');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  test('rejects a second facade process until the owner exits', async () => {
    const root = await temporaryRoot('child');
    const leaseUrl = pathToFileURL(resolve('server/src/lease.mjs')).href;
    const script = `
      import { acquireFacadeLease } from ${JSON.stringify(leaseUrl)};
      const lease = await acquireFacadeLease(${JSON.stringify(root)});
      process.stdout.write('READY\\n');
      process.once('SIGTERM', async () => {
        await lease.release();
        process.exit(0);
      });
      setInterval(() => {}, 1000);
    `;
    const child = spawn(process.execPath, ['--input-type=module', '--eval', script], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    try {
      await waitForReady(child);
      await assert.rejects(acquireFacadeLease(root), /Another EasyEDA control facade owns/);
      await stopChild(child);
      const replacement = await acquireFacadeLease(root);
      await replacement.release();
    } finally {
      await stopChild(child);
      await rm(root, { recursive: true, force: true });
    }
  });
});
