#!/usr/bin/env node
import { mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { build } from 'esbuild';

const pluginRoot = resolve(import.meta.dirname, '..');
const output = join(pluginRoot, 'server', 'dist', 'server.mjs');
await mkdir(dirname(output), { recursive: true });
await build({
  entryPoints: [join(pluginRoot, 'server', 'src', 'index.ts')],
  outfile: output,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: ['node24'],
  sourcemap: false,
  legalComments: 'eof',
  nodePaths: [join(pluginRoot, 'node_modules')],
  banner: {
    js: "import { createRequire as __easyedaCreateRequire } from 'node:module'; const require = __easyedaCreateRequire(import.meta.url);",
  },
});
process.stdout.write(`${output}\n`);
