#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { z } from 'zod';
import {
  controlImplementationFingerprint,
  loadReviewedCompatibilityManifest,
  reviewedCompatibilityManifestFingerprint,
} from '../server/src/core.ts';

interface DoctorCheck {
  readonly check: string;
  readonly ok: boolean;
}

type ToolSummary = Awaited<ReturnType<Client['listTools']>>['tools'][number];

const compatibilityManifestSchema = z.looseObject({
  facadeImplementation: z.object({
      bundle: z.unknown(),
      'source-tree': z.unknown(),
  }),
});
const pluginManifestSchema = z.object({
  mcpServers: z.string(),
  name: z.string(),
});
const mcpConfigurationSchema = z.object({
  mcpServers: z.object({
    easyeda_pro_control: z.object({
      command: z.string(),
      env: z.record(z.string(), z.string()),
    }),
  }),
});
const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const pluginRoot = resolve(import.meta.dirname, '..');
const required = [
  '.codex-plugin/plugin.json',
  '.mcp.json',
  'reviewed-compatibility.json',
  'server/src/core.ts',
  'server/dist/server.mjs',
  'skills/easyeda-pro-control/SKILL.md',
  'skills/easyeda-pro-control/agents/openai.yaml',
];
const checks: DoctorCheck[] = [];

for (const relative of required) {
  checks.push({ check: `file:${relative}`, ok: existsSync(join(pluginRoot, relative)) });
}

let reviewedCompatibility:
  | z.infer<typeof compatibilityManifestSchema>
  | { readonly error: string };
let reviewedCompatibilityFingerprint: unknown;
try {
  reviewedCompatibility = compatibilityManifestSchema.parse(
    loadReviewedCompatibilityManifest(),
  );
  reviewedCompatibilityFingerprint = reviewedCompatibilityManifestFingerprint();
  checks.push({ check: 'reviewed-compatibility-schema', ok: true });
} catch (error) {
  reviewedCompatibility = { error: errorMessage(error) };
  checks.push({ check: 'reviewed-compatibility-schema', ok: false });
}

const manifest = pluginManifestSchema.parse(
  JSON.parse(await readFile(join(pluginRoot, '.codex-plugin', 'plugin.json'), 'utf8')),
);
const mcp = mcpConfigurationSchema.parse(
  JSON.parse(await readFile(join(pluginRoot, '.mcp.json'), 'utf8')),
);
const mcpConfig = mcp.mcpServers.easyeda_pro_control;
checks.push(
  { check: 'manifest-name', ok: manifest.name === 'easyeda-pro-control' },
  { check: 'manifest-mcp', ok: manifest.mcpServers === './.mcp.json' },
  { check: 'node-major-24', ok: Number(process.versions.node.split('.')[0]) === 24 },
  { check: 'configured-node', ok: existsSync(mcpConfig.command) },
);
const upstreamArgs = z
  .array(z.string())
  .parse(JSON.parse(mcpConfig.env['EASYEDA_UPSTREAM_ARGS_JSON'] ?? '[]'));
const [upstreamEntrypoint] = upstreamArgs;
checks.push({
  check: 'upstream-entrypoint',
  ok:
    upstreamArgs.length === 1 &&
    upstreamEntrypoint !== undefined &&
    existsSync(upstreamEntrypoint),
});
const upstreamCwd = mcpConfig.env['EASYEDA_UPSTREAM_CWD'] ?? '';
const dependencyLock = ([
  ['pnpm', 'pnpm-lock.yaml'],
  ['npm', 'package-lock.json'],
  ['npm-shrinkwrap', 'npm-shrinkwrap.json'],
  ['yarn', 'yarn.lock'],
] as const)
  .map(([type, name]) => ({ type, path: join(upstreamCwd, name) }))
  .find((candidate) => existsSync(candidate.path));
checks.push({ check: 'upstream-dependency-lock', ok: Boolean(dependencyLock) });
const assetsRoot = mcpConfig.env['EASYEDA_ASSETS_ROOT'] ?? '';
const pcbBundleVersion = mcpConfig.env['EASYEDA_PCB_BUNDLE_VERSION'] ?? '';
const publicApiBundleVersion = mcpConfig.env['EASYEDA_PUBLIC_API_BUNDLE_VERSION'] ?? '';
const installedBundleFiles = {
  pcbImplementation: join(assetsRoot, 'pro-pcb', pcbBundleVersion, 'js', 'pcb.js'),
  publicApiImplementation: join(assetsRoot, 'pro-api', publicApiBundleVersion, 'api.js'),
  publicApiAdapter: join(assetsRoot, 'pro-api', publicApiBundleVersion, 'api-types.js'),
  publicApiDeclarations: join(assetsRoot, 'pro-api', publicApiBundleVersion, 'api-types.d.ts'),
};
checks.push(
  {
    check: 'installed-easyeda-bundles',
    ok: Object.values(installedBundleFiles).every((path) => existsSync(path)),
  },
  {
    check: 'sqlite3',
    ok: spawnSync('sqlite3', ['--version'], { encoding: 'utf8' }).status === 0,
  },
);

async function sha256File(path: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const streamChunk of createReadStream(path)) {
    const chunk: unknown = streamChunk;
    if (!Buffer.isBuffer(chunk)) {
      throw new TypeError(`Expected a binary stream while hashing ${path}.`);
    }
    hash.update(chunk);
  }
  return hash.digest('hex');
}

let installedBundleHashes;
if (Object.values(installedBundleFiles).every((path) => existsSync(path))) {
  installedBundleHashes = {
    pcbImplementation: await sha256File(installedBundleFiles.pcbImplementation),
    publicApiImplementation: await sha256File(installedBundleFiles.publicApiImplementation),
    publicApiAdapter: await sha256File(installedBundleFiles.publicApiAdapter),
    publicApiDeclarations: await sha256File(installedBundleFiles.publicApiDeclarations),
  };
  checks.push({
    check: 'installed-easyeda-bundle-hashes',
    ok:
      installedBundleHashes.pcbImplementation ===
        '65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54' &&
      installedBundleHashes.publicApiImplementation ===
        '5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc' &&
      installedBundleHashes.publicApiAdapter ===
        '4da5b5184a78e2d3aca843dad6b147d7feb7ec1368160d73f49c4acbcf97dfdb' &&
      installedBundleHashes.publicApiDeclarations ===
        '32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1',
  });
}

const distPath = join(pluginRoot, 'server', 'dist', 'server.mjs');
if (!('error' in reviewedCompatibility) && existsSync(distPath)) {
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
  const distBytes = await readFile(distPath);
  const distFileSha256 = createHash('sha256').update(distBytes).digest('hex');
  const bundleProjection = {
    version: source.version,
    operationSchema: source.operationSchema,
    sha256: createHash('sha256')
      .update(`server.mjs\0${distBytes.length}\0${distFileSha256}\n`)
      .digest('hex'),
    fileCount: 1,
    files: [
      {
        relativePath: 'server.mjs',
        bytes: distBytes.length,
        sha256: distFileSha256,
      },
    ],
  };
  checks.push(
    {
      check: 'reviewed-source-facade',
      ok:
        JSON.stringify(sourceProjection) ===
        JSON.stringify(reviewedCompatibility.facadeImplementation['source-tree']),
    },
    {
      check: 'reviewed-bundle-facade',
      ok:
        JSON.stringify(bundleProjection) ===
        JSON.stringify(reviewedCompatibility.facadeImplementation.bundle),
    },
  );
}
let toolCatalog:
  | {
      readonly allHaveOutputSchema: boolean;
      readonly count: number;
      readonly names: string[];
    }
  | { readonly error: string };
let smokeDirectory: string | undefined;
try {
  smokeDirectory = await mkdtemp(join(tmpdir(), 'easyeda-control-doctor-'));
  const transport = new StdioClientTransport({
    command: mcpConfig.command,
    args: [distPath],
    cwd: pluginRoot,
    env: { ...process.env, EASYEDA_CONTROL_DATA_DIR: smokeDirectory },
    stderr: 'pipe',
  });
  const client = new Client(
    { name: 'easyeda-pro-control-doctor', version: '0.2.0' },
    { capabilities: {} },
  );
  await client.connect(transport);
  const listed = await client.listTools();
  const listedTools: ToolSummary[] = listed.tools;
  toolCatalog = {
    count: listedTools.length,
    allHaveOutputSchema: listedTools.every((tool) => tool.outputSchema),
    names: listedTools.map((tool) => tool.name).toSorted(),
  };
  await client.close();
  await transport.close().catch(() => {});
  checks.push({
    check: 'mcp-tool-catalog',
    ok:
      toolCatalog.count === 18 &&
      toolCatalog.allHaveOutputSchema &&
      toolCatalog.names.includes('easyeda_control_exact_read'),
  });
} catch (error) {
  toolCatalog = { error: errorMessage(error) };
  checks.push({ check: 'mcp-tool-catalog', ok: false });
} finally {
  if (smokeDirectory !== undefined) {
    await rm(smokeDirectory, { recursive: true, force: true });
  }
}
const result = {
  ok: checks.every((item) => item.ok),
  pluginRoot,
  node: process.version,
  offline: process.argv.includes('--offline'),
  checks,
  toolCatalog,
  upstreamDependencyLock: dependencyLock,
  installedBundleFiles,
  installedBundleHashes,
  reviewedCompatibility,
  reviewedCompatibilityFingerprint,
  distSha256: existsSync(distPath) ? await sha256File(distPath) : undefined,
  note:
    'Offline doctor does not connect to EasyEDA. Use easyeda_control_status and context in a new Codex task for live validation.',
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!result.ok) process.exitCode = 1;
