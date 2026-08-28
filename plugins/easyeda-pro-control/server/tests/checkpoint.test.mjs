import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmod, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';

import { canonicalJson, sha256Text } from '../src/core.mjs';
import { createCheckpoint, verifyCheckpoint } from '../src/checkpoint.mjs';

let testDir;

before(async () => {
  testDir = await mkdtemp(join(tmpdir(), 'easyeda-control-checkpoint-'));
});

after(async () => {
  if (testDir) await rm(testDir, { recursive: true, force: true });
});

function createFixtureDatabase(path) {
  execFileSync('sqlite3', [
    path,
    'PRAGMA journal_mode=DELETE; CREATE TABLE evidence(id INTEGER PRIMARY KEY, value TEXT NOT NULL); INSERT INTO evidence(value) VALUES (\'baseline\');',
  ]);
}

describe('SQLite checkpoint creation and verification', () => {
  test('creates a logically exact backup with a canonical self-hashed receipt', async () => {
    const source = join(testDir, 'fixture.eprj2');
    const outputDir = join(testDir, 'checkpoints');
    createFixtureDatabase(source);

    const checkpoint = await createCheckpoint({ source, outputDir, label: 'pre-mutation' });
    const receipt = JSON.parse(await readFile(checkpoint.receiptPath, 'utf8'));
    const { receiptSha256, ...receiptCore } = receipt;

    assert.equal(receipt.schema, 'easyeda-pro-control.checkpoint.v1');
    assert.notEqual(receipt.source, receipt.checkpoint);
    assert.equal(receipt.sourceDumpSha256, receipt.checkpointDumpSha256);
    assert.equal(receipt.quickCheck.sourceBefore, 'ok');
    assert.equal(receipt.quickCheck.sourceAfter, 'ok');
    assert.equal(receipt.quickCheck.checkpoint, 'ok');
    assert.equal(receiptSha256, sha256Text(canonicalJson(receiptCore)));

    const verified = await verifyCheckpoint(checkpoint.receiptPath);
    assert.equal(verified.ok, true);
  });

  test('detects source mutation after checkpoint creation', async () => {
    const source = join(testDir, 'mutable.eprj2');
    const outputDir = join(testDir, 'mutable-checkpoints');
    createFixtureDatabase(source);
    const checkpoint = await createCheckpoint({ source, outputDir, label: 'before-edit' });

    execFileSync('sqlite3', [source, "UPDATE evidence SET value='changed' WHERE id=1;"]);
    const verified = await verifyCheckpoint(checkpoint.receiptPath);
    assert.equal(verified.ok, false);
    assert.notEqual(verified.sourceDumpSha256, checkpoint.sourceDumpSha256);
    assert.equal(verified.checkpointDumpSha256, checkpoint.checkpointDumpSha256);
  });

  test('distinguishes a physical-only rewrite from a logical SQLite change', async () => {
    const source = join(testDir, 'physical-rewrite.eprj2');
    const outputDir = join(testDir, 'physical-rewrite-checkpoints');
    createFixtureDatabase(source);
    const checkpoint = await createCheckpoint({ source, outputDir, label: 'before-vacuum' });

    execFileSync('sqlite3', [source, 'VACUUM;']);
    const verified = await verifyCheckpoint(checkpoint.receiptPath);
    assert.equal(verified.ok, false);
    assert.equal(verified.checkpointMatchesReceipt, true);
    assert.equal(verified.sourceMatchesReceipt, false);
    assert.equal(verified.sourceChanged, true);
    assert.equal(verified.sourceEqualsCheckpoint, true);
    assert.notEqual(verified.sourceSha256, checkpoint.sourceSha256);
    assert.equal(verified.sourceDumpSha256, checkpoint.sourceDumpSha256);
  });

  test('detects a tampered receipt even when database artifacts still match', async () => {
    const source = join(testDir, 'receipt-source.eprj2');
    const outputDir = join(testDir, 'receipt-checkpoints');
    createFixtureDatabase(source);
    const checkpoint = await createCheckpoint({ source, outputDir, label: 'receipt-check' });
    const receipt = JSON.parse(await readFile(checkpoint.receiptPath, 'utf8'));
    receipt.createdAt = '2000-01-01T00:00:00.000Z';
    await writeFile(checkpoint.receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');

    await assert.rejects(
      verifyCheckpoint(checkpoint.receiptPath),
      /Checkpoint receipt hash is invalid/,
    );
  });

  test('rejects unsafe labels, empty source files, and unexpected receipt schemas', async () => {
    const source = join(testDir, 'validation.eprj2');
    createFixtureDatabase(source);
    await assert.rejects(
      createCheckpoint({ source, outputDir: testDir, label: '../escape' }),
      /filename-safe/,
    );

    const empty = join(testDir, 'empty.eprj2');
    await writeFile(empty, '');
    await assert.rejects(
      createCheckpoint({ source: empty, outputDir: testDir, label: 'empty' }),
      /non-empty file/,
    );

    const invalidReceipt = join(testDir, 'invalid-receipt.json');
    await writeFile(invalidReceipt, '{"schema":"unexpected"}\n', 'utf8');
    await assert.rejects(verifyCheckpoint(invalidReceipt), /Unexpected checkpoint receipt schema/);
  });
});

describe('checkpoint failure cleanup', () => {
  test('does not leave a reserved empty checkpoint when SQLite backup fails', async () => {
    const source = join(testDir, 'fake-source.eprj2');
    const outputDir = join(testDir, 'failed-checkpoints');
    const fakeBin = join(testDir, 'fake-bin');
    const fakeSqlite = join(fakeBin, 'sqlite3');
    await import('node:fs/promises').then(({ mkdir }) => mkdir(fakeBin, { recursive: true }));
    await writeFile(source, 'non-empty fixture');
    await writeFile(
      fakeSqlite,
      '#!/bin/sh\ncase "$*" in\n  *".backup"*) echo "forced backup failure" >&2; exit 7 ;;\n  *) echo ok ;;\nesac\n',
      'utf8',
    );
    await chmod(fakeSqlite, 0o700);

    const originalPath = process.env.PATH;
    process.env.PATH = `${fakeBin}:${originalPath}`;
    try {
      await assert.rejects(
        createCheckpoint({ source, outputDir, label: 'forced-failure' }),
        /forced backup failure/,
      );
    } finally {
      process.env.PATH = originalPath;
    }

    assert.deepEqual(await readdir(outputDir), []);
  });

  test('removes the checkpoint when logical dump generation fails after backup', async () => {
    const source = join(testDir, 'dump-failure-source.eprj2');
    const outputDir = join(testDir, 'dump-failure-checkpoints');
    const fakeBin = join(testDir, 'dump-failure-bin');
    const fakeSqlite = join(fakeBin, 'sqlite3');
    await import('node:fs/promises').then(({ mkdir }) => mkdir(fakeBin, { recursive: true }));
    await writeFile(source, 'non-empty dump failure fixture');
    await writeFile(
      fakeSqlite,
      `#!/bin/sh
if [ "$2" = ".dump" ]; then
  echo "forced dump failure" >&2
  exit 7
fi
case "$*" in
  *".backup '"*)
    target=$(printf '%s' "$4" | sed -e "s/^\\.backup '//" -e "s/'$//")
    cp "$EASYEDA_TEST_CHECKPOINT_SOURCE" "$target"
    ;;
  *) echo ok ;;
esac
`,
      'utf8',
    );
    await chmod(fakeSqlite, 0o700);

    const originalPath = process.env.PATH;
    const originalSource = process.env.EASYEDA_TEST_CHECKPOINT_SOURCE;
    process.env.PATH = `${fakeBin}:${originalPath}`;
    process.env.EASYEDA_TEST_CHECKPOINT_SOURCE = source;
    try {
      await assert.rejects(
        createCheckpoint({ source, outputDir, label: 'forced-dump-failure' }),
        /forced dump failure/,
      );
    } finally {
      process.env.PATH = originalPath;
      if (originalSource === undefined) delete process.env.EASYEDA_TEST_CHECKPOINT_SOURCE;
      else process.env.EASYEDA_TEST_CHECKPOINT_SOURCE = originalSource;
    }

    assert.deepEqual(await readdir(outputDir), []);
  });

  test('removes its checkpoint but preserves a pre-existing receipt-path collision', async () => {
    const source = join(testDir, 'receipt-collision-source.eprj2');
    const outputDir = join(testDir, 'receipt-collision-checkpoints');
    const fakeBin = join(testDir, 'receipt-collision-bin');
    const fakeSqlite = join(fakeBin, 'sqlite3');
    await import('node:fs/promises').then(({ mkdir }) => mkdir(fakeBin, { recursive: true }));
    await writeFile(source, 'non-empty receipt collision fixture');
    await writeFile(
      fakeSqlite,
      `#!/bin/sh
if [ "$2" = ".dump" ]; then
  echo "stable logical dump"
  exit 0
fi
case "$*" in
  *".backup '"*)
    target=$(printf '%s' "$4" | sed -e "s/^\\.backup '//" -e "s/'$//")
    cp "$EASYEDA_TEST_CHECKPOINT_SOURCE" "$target"
    receipt="\${target%.eprj2}.checkpoint.json"
    printf '%s' 'pre-existing receipt collision' > "$receipt"
    ;;
  *) echo ok ;;
esac
`,
      'utf8',
    );
    await chmod(fakeSqlite, 0o700);

    const originalPath = process.env.PATH;
    const originalSource = process.env.EASYEDA_TEST_CHECKPOINT_SOURCE;
    process.env.PATH = `${fakeBin}:${originalPath}`;
    process.env.EASYEDA_TEST_CHECKPOINT_SOURCE = source;
    try {
      await assert.rejects(
        createCheckpoint({ source, outputDir, label: 'receipt-collision' }),
        /EEXIST|exist/i,
      );
    } finally {
      process.env.PATH = originalPath;
      if (originalSource === undefined) delete process.env.EASYEDA_TEST_CHECKPOINT_SOURCE;
      else process.env.EASYEDA_TEST_CHECKPOINT_SOURCE = originalSource;
    }

    const remaining = await readdir(outputDir);
    assert.equal(remaining.length, 1);
    assert.match(remaining[0], /\.checkpoint\.json$/);
    assert.equal(
      await readFile(join(outputDir, remaining[0]), 'utf8'),
      'pre-existing receipt collision',
    );
  });

  test('terminates a wedged SQLite subprocess at the configured wall-clock limit', async () => {
    const source = join(testDir, 'timeout-source.eprj2');
    const outputDir = join(testDir, 'timeout-checkpoints');
    const fakeBin = join(testDir, 'timeout-bin');
    const fakeSqlite = join(fakeBin, 'sqlite3');
    await import('node:fs/promises').then(({ mkdir }) => mkdir(fakeBin, { recursive: true }));
    await writeFile(source, 'non-empty fixture');
    await writeFile(fakeSqlite, '#!/bin/sh\nexec sleep 5\n', 'utf8');
    await chmod(fakeSqlite, 0o700);

    const originalPath = process.env.PATH;
    const originalTimeout = process.env.EASYEDA_CHECKPOINT_PROCESS_TIMEOUT_MS;
    process.env.PATH = `${fakeBin}:${originalPath}`;
    process.env.EASYEDA_CHECKPOINT_PROCESS_TIMEOUT_MS = '100';
    const startedAt = Date.now();
    try {
      await assert.rejects(
        createCheckpoint({ source, outputDir, label: 'forced-timeout' }),
        /timed out after 100 ms/,
      );
    } finally {
      process.env.PATH = originalPath;
      if (originalTimeout === undefined) delete process.env.EASYEDA_CHECKPOINT_PROCESS_TIMEOUT_MS;
      else process.env.EASYEDA_CHECKPOINT_PROCESS_TIMEOUT_MS = originalTimeout;
    }

    assert.ok(Date.now() - startedAt < 2000);
    assert.deepEqual(await readdir(outputDir), []);
  });

  test('terminates a SQLite subprocess whose stderr exceeds the configured bound', async () => {
    const source = join(testDir, 'stderr-source.eprj2');
    const outputDir = join(testDir, 'stderr-checkpoints');
    const fakeBin = join(testDir, 'stderr-bin');
    const fakeSqlite = join(fakeBin, 'sqlite3');
    await import('node:fs/promises').then(({ mkdir }) => mkdir(fakeBin, { recursive: true }));
    await writeFile(source, 'non-empty fixture');
    await writeFile(
      fakeSqlite,
      '#!/bin/sh\nhead -c 512 /dev/zero >&2\nexit 7\n',
      'utf8',
    );
    await chmod(fakeSqlite, 0o700);

    const originalPath = process.env.PATH;
    const originalLimit = process.env.EASYEDA_CHECKPOINT_STDERR_MAX_BYTES;
    process.env.PATH = `${fakeBin}:${originalPath}`;
    process.env.EASYEDA_CHECKPOINT_STDERR_MAX_BYTES = '128';
    try {
      await assert.rejects(
        createCheckpoint({ source, outputDir, label: 'forced-stderr-cap' }),
        /stderr exceeded 128 bytes/,
      );
    } finally {
      process.env.PATH = originalPath;
      if (originalLimit === undefined) delete process.env.EASYEDA_CHECKPOINT_STDERR_MAX_BYTES;
      else process.env.EASYEDA_CHECKPOINT_STDERR_MAX_BYTES = originalLimit;
    }

    assert.deepEqual(await readdir(outputDir), []);
  });
});
