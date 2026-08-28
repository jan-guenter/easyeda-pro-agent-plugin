import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, test } from 'node:test';

import { acquireFacadeLease } from '../src/lease.ts';

type FacadeLease = Awaited<ReturnType<typeof acquireFacadeLease>>;

interface StoredLease {
  schema: 'easyeda-pro-control.facade-lease.v1';
  pid: number;
  token: string;
  startedAt: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseStoredLease(text: string): StoredLease {
  const value: unknown = JSON.parse(text);
  if (
    !isRecord(value) ||
    value['schema'] !== 'easyeda-pro-control.facade-lease.v1' ||
    typeof value['pid'] !== 'number' ||
    !Number.isInteger(value['pid']) ||
    typeof value['token'] !== 'string'
  ) {
    throw new TypeError('Test fixture did not contain a valid facade lease.');
  }
  return {
    schema: 'easyeda-pro-control.facade-lease.v1',
    pid: value['pid'],
    token: value['token'],
    startedAt: value['startedAt'],
  };
}

function hasErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}

async function temporaryRoot(label: string): Promise<string> {
  return mkdtemp(join(tmpdir(), `easyeda-control-lease-${label}-`));
}

async function waitForReady(child: ChildProcess): Promise<void> {
  if (!child.stdout || !child.stderr) throw new Error('Lease child requires piped output.');
  const { stdout: childStdout, stderr: childStderr } = child;
  await new Promise<void>((resolveReady, reject) => {
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => {
      reject(new Error(`Lease child did not become ready. stderr: ${stderr}`));
    }, 10000);
    childStdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
      if (stdout.includes('READY\n')) {
        clearTimeout(timeout);
        resolveReady();
      }
    });
    childStderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });
    child.once('error', (error: Error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once('exit', (code: number | null, signal: NodeJS.Signals | null) => {
      if (!stdout.includes('READY\n')) {
        clearTimeout(timeout);
        reject(new Error(`Lease child exited before ready (${code ?? signal}). stderr: ${stderr}`));
      }
    });
  });
}

async function stopChild(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise<void>((resolveExit) => {
    child.once('exit', () => {
      resolveExit();
    });
  });
  child.kill('SIGTERM');
  await exited;
}

void describe('cross-process facade lease', { concurrency: false }, () => {
  void test('rejects a symlinked control root without creating a lock in its target', async () => {
    const parent = await temporaryRoot('symlink-parent');
    const target = join(parent, 'target');
    const link = join(parent, 'control-link');
    try {
      await mkdir(target);
      await symlink(target, link, 'dir');
      await assert.rejects(acquireFacadeLease(link), /real directory|symbolic-link/u);
      await assert.rejects(
        readFile(join(target, 'facade.lock'), 'utf8'),
        (error: unknown) => hasErrorCode(error, 'ENOENT'),
      );
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  });

  void test('allows one owner and rejects a second live owner', async () => {
    const root = await temporaryRoot('same-process');
    let lease: FacadeLease | undefined;
    try {
      lease = await acquireFacadeLease(root);
      const stored = parseStoredLease(await readFile(lease.path, 'utf8'));
      assert.equal(stored.pid, process.pid);
      assert.equal(stored.token, lease.token);
      await assert.rejects(acquireFacadeLease(root), /Another EasyEDA control facade owns/u);
      await lease.release();
      lease = undefined;
      const replacement = await acquireFacadeLease(root);
      await replacement.release();
    } finally {
      await lease?.release().catch(() => {});
      await rm(root, { recursive: true, force: true });
    }
  });

  void test('removes a valid dead-PID lease but refuses a corrupt lease', async () => {
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
      assert.equal(parseStoredLease(await readFile(replacement.path, 'utf8')).pid, process.pid);
      await replacement.release();

      await writeFile(join(corruptRoot, 'facade.lock'), '{not-json}\n', 'utf8');
      await assert.rejects(acquireFacadeLease(corruptRoot), /Unexpected token|JSON/u);
      assert.equal(await readFile(join(corruptRoot, 'facade.lock'), 'utf8'), '{not-json}\n');
    } finally {
      await rm(staleRoot, { recursive: true, force: true });
      await rm(corruptRoot, { recursive: true, force: true });
    }
  });

  void test('reconciles a dead cleanup lease left by a crashed stale-owner cleanup', async () => {
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
      assert.equal(parseStoredLease(await readFile(replacement.path, 'utf8')).pid, process.pid);
      await assert.rejects(
        readFile(cleanupPath, 'utf8'),
        (error: unknown) => hasErrorCode(error, 'ENOENT'),
      );
      await replacement.release();
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  void test('does not release a lease after its ownership token changes', async () => {
    const root = await temporaryRoot('ownership');
    const lease = await acquireFacadeLease(root);
    try {
      const stored = parseStoredLease(await readFile(lease.path, 'utf8'));
      stored.token = 'replacement-owner-token';
      await writeFile(lease.path, `${JSON.stringify(stored)}\n`, 'utf8');
      await assert.rejects(lease.release(), /ownership changed/u);
      assert.equal(
        parseStoredLease(await readFile(lease.path, 'utf8')).token,
        'replacement-owner-token',
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  void test('rejects a second facade process until the owner exits', async () => {
    const root = await temporaryRoot('child');
    const leaseUrl = pathToFileURL(resolve('server/src/lease.ts')).href;
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
      await assert.rejects(acquireFacadeLease(root), /Another EasyEDA control facade owns/u);
      await stopChild(child);
      const replacement = await acquireFacadeLease(root);
      await replacement.release();
    } finally {
      await stopChild(child);
      await rm(root, { recursive: true, force: true });
    }
  });
});
