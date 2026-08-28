#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dependencyRoots = [
  pluginRoot,
  process.env.EASYEDA_MCP_PRO_ROOT,
  '/root/work/easyeda-mcp-pro',
].filter(Boolean);
const dependencyRoot = dependencyRoots.find((root) => existsSync(join(root, 'node_modules')));
if (!dependencyRoot) {
  throw new Error(
    'Cannot locate plugin dependencies. Run npm install in the plugin directory.',
  );
}
const requireFromUpstream = createRequire(join(dependencyRoot, 'package.json'));
const { build } = requireFromUpstream('esbuild');
const output = join(pluginRoot, 'server', 'dist', 'server.mjs');
await mkdir(dirname(output), { recursive: true });
await build({
  entryPoints: [join(pluginRoot, 'server', 'src', 'index.mjs')],
  outfile: output,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: ['node24'],
  sourcemap: false,
  legalComments: 'eof',
  nodePaths: [join(dependencyRoot, 'node_modules')],
  banner: {
    js: "import { createRequire as __easyedaCreateRequire } from 'node:module'; const require = __easyedaCreateRequire(import.meta.url);",
  },
});
process.stdout.write(`${output}\n`);
