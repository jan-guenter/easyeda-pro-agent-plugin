#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { controlImplementationFingerprint } from '../server/src/core.mjs';

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(pluginRoot, 'reviewed-compatibility.json');
const bundlePath = join(pluginRoot, 'server', 'dist', 'server.mjs');
const mode = process.argv[2];
if (!['--check', '--write'].includes(mode)) {
  throw new Error('Usage: reviewed-compatibility.mjs --check|--write');
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const source = await controlImplementationFingerprint();
const sourceProjection = {
  version: source.version,
  operationSchema: source.operationSchema,
  sha256: source.sha256,
  fileCount: source.files.length,
  files: source.files.map(({ relativePath, bytes, sha256 }) => ({
    relativePath,
    bytes,
    sha256,
  })),
};
const bundleBytes = await readFile(bundlePath);
const bundleFileSha256 = createHash('sha256').update(bundleBytes).digest('hex');
const bundleProjection = {
  version: source.version,
  operationSchema: source.operationSchema,
  sha256: createHash('sha256')
    .update(`server.mjs\0${bundleBytes.length}\0${bundleFileSha256}\n`)
    .digest('hex'),
  fileCount: 1,
  files: [
    {
      relativePath: 'server.mjs',
      bytes: bundleBytes.length,
      sha256: bundleFileSha256,
    },
  ],
};

if (mode === '--check') {
  const checks = {
    sourceTree:
      JSON.stringify(sourceProjection) ===
      JSON.stringify(manifest.facadeImplementation?.['source-tree']),
    bundle:
      JSON.stringify(bundleProjection) ===
      JSON.stringify(manifest.facadeImplementation?.bundle),
  };
  const result = { ok: Object.values(checks).every(Boolean), checks, sourceProjection, bundleProjection };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
} else {
  const updated = {
    ...manifest,
    reviewedAt: new Date().toISOString(),
    facadeImplementation: {
      'source-tree': sourceProjection,
      bundle: bundleProjection,
    },
  };
  await writeFile(manifestPath, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');
  process.stdout.write(`${manifestPath}\n`);
}
