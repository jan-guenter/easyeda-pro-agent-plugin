#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { z } from 'zod';

interface CheckResult {
  readonly detail?: string;
  readonly name: string;
  readonly ok: boolean;
}

type ToolSummary = Awaited<ReturnType<Client['listTools']>>['tools'][number];

const pluginManifestSchema = z.object({
  mcpServers: z.string(),
  name: z.string(),
});
const mcpConfigurationSchema = z.object({
  mcpServers: z.object({
    easyeda_pro_control: z.object({
      env: z.record(z.string(), z.string()).optional(),
      type: z.string(),
    }),
  }),
});

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
const pluginRoot = resolve(import.meta.dirname, '..');
const checks: CheckResult[] = [];
const check = (name: string, ok: unknown, detail?: string): void => {
  checks.push({
    name,
    ok: Boolean(ok),
    ...(detail !== undefined && detail.length > 0 ? { detail } : {}),
  });
};
const required = [
  '.codex-plugin/plugin.json',
  '.mcp.json',
  'reviewed-compatibility.json',
  'server/dist/server.mjs',
  'skills/easyeda-pro-control/SKILL.md',
  'skills/easyeda-pro-control/agents/openai.yaml',
];
for (const path of required) check(`file:${path}`, existsSync(join(pluginRoot, path)));

const manifest = pluginManifestSchema.parse(
  JSON.parse(await readFile(join(pluginRoot, '.codex-plugin', 'plugin.json'), 'utf8')),
);
const mcp = mcpConfigurationSchema.parse(
  JSON.parse(await readFile(join(pluginRoot, '.mcp.json'), 'utf8')),
);
const skill = await readFile(join(pluginRoot, 'skills', 'easyeda-pro-control', 'SKILL.md'), 'utf8');
check('node-major-24', Number(process.versions.node.split('.')[0]) === 24, process.version);
check('manifest-name', manifest.name === 'easyeda-pro-control');
check('manifest-mcp', manifest.mcpServers === './.mcp.json');
check('mcp-server', mcp.mcpServers?.easyeda_pro_control?.type === 'stdio');
check(
  'raw-env-absent',
  !Object.hasOwn(
    mcp.mcpServers?.easyeda_pro_control?.env ?? {},
    'EASYEDA_CONTROL_ALLOW_UNRESTRICTED_EXECUTE',
  ),
);
check('skill-frontmatter-name', /^---\nname: easyeda-pro-control\n/mu.test(skill));
check('skill-writer-disabled', /writer is experimental and runtime-disabled/iu.test(skill));
const scaffoldPlaceholderPrefix = ['[', 'TODO', ':'].join('');
check(
  'no-placeholders',
  !`${JSON.stringify(manifest)}\n${skill}`.includes(scaffoldPlaceholderPrefix),
);

let toolCatalog: ToolSummary[] | { readonly error: string } = [];
let dataDirectory: string | undefined;
try {
  dataDirectory = await mkdtemp(join(tmpdir(), 'easyeda-control-validation-'));
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(pluginRoot, 'server', 'dist', 'server.mjs')],
    cwd: pluginRoot,
    env: { ...process.env, EASYEDA_CONTROL_DATA_DIR: dataDirectory },
    stderr: 'pipe',
  });
  const client = new Client(
    { name: 'easyeda-pro-control-validation', version: '0.2.0' },
    { capabilities: {} },
  );
  await client.connect(transport);
  const listed = await client.listTools();
  toolCatalog = listed.tools;
  await client.close();
  await transport.close().catch(() => {});
  check('tool-count', toolCatalog.length === 18, String(toolCatalog.length));
  check('tool-output-schemas', toolCatalog.every((tool) => tool.outputSchema));
  const raw = toolCatalog.find((tool) => tool.name === 'easyeda_control_execute');
  const plan = toolCatalog.find((tool) => tool.name === 'easyeda_control_plan');
  check('raw-catalog-disabled', /disabled/iu.test(`${raw?.title} ${raw?.description}`));
  check('writer-catalog-disabled', /disabled/iu.test(`${plan?.title} ${plan?.description}`));
} catch (error) {
  toolCatalog = { error: errorMessage(error) };
  check('mcp-catalog-smoke', false, toolCatalog.error);
} finally {
  if (dataDirectory !== undefined) {
    await rm(dataDirectory, { recursive: true, force: true });
  }
}

const result = {
  ok: checks.every((item) => item.ok),
  pluginRoot,
  node: process.version,
  toolNames: Array.isArray(toolCatalog)
    ? toolCatalog.map((tool) => tool.name).toSorted()
    : toolCatalog,
  checks,
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
if (!result.ok) process.exitCode = 1;
