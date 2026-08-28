#!/usr/bin/env node
import { lstat, readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const marketplacePath = join(root, '.agents', 'plugins', 'marketplace.json');
const pluginRoot = join(root, 'plugins', 'easyeda-pro-control');
const checks = [];

function check(name, condition, detail) {
  checks.push({ name, ok: Boolean(condition), ...(detail ? { detail } : {}) });
}

async function exists(path) {
  try {
    return (await lstat(path)).isFile();
  } catch {
    return false;
  }
}

async function filesBelow(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (
      entry.isDirectory() &&
      ['.git', 'node_modules', 'coverage', 'reports', 'dist-artifacts'].includes(entry.name)
    ) {
      continue;
    }
    if (entry.isSymbolicLink()) {
      result.push({ path, symlink: true });
    } else if (entry.isDirectory()) {
      result.push(...(await filesBelow(path)));
    } else if (entry.isFile()) {
      result.push({ path, symlink: false });
    }
  }
  return result;
}

const marketplace = JSON.parse(await readFile(marketplacePath, 'utf8'));
const entry = marketplace.plugins?.find((plugin) => plugin.name === 'easyeda-pro-control');
check('marketplace-name', marketplace.name === 'easyeda-pro-agent');
check('marketplace-display-name', typeof marketplace.interface?.displayName === 'string');
check('single-plugin-entry', marketplace.plugins?.length === 1);
check('plugin-source-kind', entry?.source?.source === 'local');
check('plugin-source-path', entry?.source?.path === './plugins/easyeda-pro-control');
check('plugin-install-policy', entry?.policy?.installation === 'AVAILABLE');
check('plugin-auth-policy', entry?.policy?.authentication === 'ON_INSTALL');
check('plugin-category', typeof entry?.category === 'string' && entry.category.length > 0);

const manifestPath = join(pluginRoot, '.codex-plugin', 'plugin.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
check('manifest-name', manifest.name === 'easyeda-pro-control');
check(
  'manifest-version',
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(manifest.version),
);
check('manifest-skill', manifest.skills === './skills/');
check('manifest-mcp', manifest.mcpServers === './.mcp.json');
check('manifest-repository', manifest.repository === 'https://github.com/jan-guenter/easyeda-pro-agent-plugin');

const required = [
  '.codex-plugin/plugin.json',
  '.mcp.json',
  'package.json',
  'package-lock.json',
  'reviewed-compatibility.json',
  'licenses/model-context-protocol-sdk-MIT.txt',
  'licenses/zod-MIT.txt',
  'licenses/esbuild-MIT.txt',
  'server/dist/server.mjs',
  'server/src/index.mjs',
  'skills/easyeda-pro-control/SKILL.md',
  'skills/easyeda-pro-control/agents/openai.yaml',
];
for (const path of required) check(`required:${path}`, await exists(join(pluginRoot, path)));

const mcp = JSON.parse(await readFile(join(pluginRoot, '.mcp.json'), 'utf8'));
const mcpServer = mcp.mcpServers?.easyeda_pro_control;
check('mcp-stdio', mcpServer?.type === 'stdio');
check('raw-env-absent', !Object.hasOwn(mcpServer?.env ?? {}, 'EASYEDA_CONTROL_ALLOW_UNRESTRICTED_EXECUTE'));
check('raw-tool-prompted', mcpServer?.tools?.easyeda_control_execute?.approval_mode === 'prompt');

const indexSource = await readFile(join(pluginRoot, 'server', 'src', 'index.mjs'), 'utf8');
const skillSource = await readFile(
  join(pluginRoot, 'skills', 'easyeda-pro-control', 'SKILL.md'),
  'utf8',
);
check(
  'production-writer-not-enabled',
  indexSource.includes('new EasyedaControlEngine(upstream)') &&
    !indexSource.includes('new EasyedaControlEngine(upstream, { privateComponentWriterValidated: true'),
);
check('raw-structurally-disabled', indexSource.includes('there is no environment opt-in'));
check('skill-declares-disabled-writer', /writer is experimental and runtime-disabled/i.test(skillSource));

const tree = await filesBelow(root);
check('no-symlinks', tree.every((entryValue) => entryValue.symlink === false));
const textExtensions = new Set(['.json', '.md', '.mjs', '.yaml', '.yml']);
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bghp_[A-Za-z0-9]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{40,}\b/,
];
const secretHits = [];
const placeholderHits = [];
const scaffoldPlaceholderPrefix = ['[', 'TODO', ':'].join('');
for (const entryValue of tree) {
  const path = entryValue.path;
  const relativePath = relative(root, path);
  if (
    relativePath.includes('/node_modules/') ||
    relativePath.includes('/server/dist/') ||
    relativePath.endsWith('package-lock.json') ||
    !textExtensions.has(path.slice(path.lastIndexOf('.')))
  ) {
    continue;
  }
  const text = await readFile(path, 'utf8');
  if (secretPatterns.some((pattern) => pattern.test(text))) secretHits.push(relativePath);
  if (text.includes(scaffoldPlaceholderPrefix)) placeholderHits.push(relativePath);
}
check('no-secret-patterns', secretHits.length === 0, secretHits.join(', '));
check('no-scaffold-placeholders', placeholderHits.length === 0, placeholderHits.join(', '));

const result = { ok: checks.every((item) => item.ok), root, pluginRoot, checks };
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!result.ok) process.exitCode = 1;
