import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { after, before, describe, test } from 'node:test';

import { sha256Text } from '../src/core.ts';
import { UpstreamEasyedaClient } from '../src/upstream.ts';

interface SavedEnvironmentValue {
  present: boolean;
  value?: string | undefined;
}

type SavedEnvironment = Record<string, SavedEnvironmentValue>;

let fixtureRoot = '';
let implementationRoot = '';
let entrypoint = '';
let assetsRoot = '';
let originalEnvironment: SavedEnvironment | undefined;

function rememberEnvironment(names: readonly string[]): SavedEnvironment {
  return Object.fromEntries(
    names.map((name) => [
      name,
      Object.hasOwn(process.env, name) ? { present: true, value: process.env[name] } : { present: false },
    ]),
  );
}

function restoreEnvironment(saved: SavedEnvironment): void {
  for (const [name, record] of Object.entries(saved)) {
    if (record.present) process.env[name] = record.value;
    else delete process.env[name];
  }
}

before(async () => {
  fixtureRoot = await mkdtemp(join(tmpdir(), 'easyeda-control-upstream-'));
  implementationRoot = join(fixtureRoot, 'implementation');
  entrypoint = join(implementationRoot, 'server.mjs');
  assetsRoot = join(fixtureRoot, 'assets');
  await mkdir(implementationRoot, { recursive: true });

  const serverUrl = pathToFileURL(
    resolve('node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js'),
  ).href;
  const stdioUrl = pathToFileURL(
    resolve('node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js'),
  ).href;
  const typesUrl = pathToFileURL(
    resolve('node_modules/@modelcontextprotocol/sdk/dist/esm/types.js'),
  ).href;
  await writeFile(
    entrypoint,
    `
      import { Server } from ${JSON.stringify(serverUrl)};
      import { StdioServerTransport } from ${JSON.stringify(stdioUrl)};
      import { ListToolsRequestSchema } from ${JSON.stringify(typesUrl)};
      const server = new Server(
        { name: 'fingerprint-fixture', version: '1.0.0' },
        { capabilities: { tools: {} } },
      );
      server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [] }));
      await server.connect(new StdioServerTransport());
    `,
    'utf8',
  );
  await writeFile(
    join(fixtureRoot, 'pnpm-lock.yaml'),
    "lockfileVersion: '9.0'\n",
    'utf8',
  );
  await mkdir(join(assetsRoot, 'pro-pcb', '3.2.149.fixture', 'js'), { recursive: true });
  await mkdir(join(assetsRoot, 'pro-api', '0.2.53.fixture'), { recursive: true });
  await writeFile(
    join(assetsRoot, 'pro-pcb', '3.2.149.fixture', 'js', 'pcb.js'),
    'pcb-fixture',
    'utf8',
  );
  await writeFile(
    join(assetsRoot, 'pro-api', '0.2.53.fixture', 'api.js'),
    'api-fixture',
    'utf8',
  );
  await writeFile(
    join(assetsRoot, 'pro-api', '0.2.53.fixture', 'api-types.js'),
    'api-adapter-fixture',
    'utf8',
  );
  await writeFile(
    join(assetsRoot, 'pro-api', '0.2.53.fixture', 'api-types.d.ts'),
    'api-declarations-fixture',
    'utf8',
  );

  const names = [
    'EASYEDA_UPSTREAM_COMMAND',
    'EASYEDA_UPSTREAM_ARGS_JSON',
    'EASYEDA_UPSTREAM_CWD',
    'EASYEDA_CONTROL_DATA_DIR',
    'EASYEDA_ASSETS_ROOT',
    'EASYEDA_PCB_BUNDLE_VERSION',
    'EASYEDA_PUBLIC_API_BUNDLE_VERSION',
  ];
  originalEnvironment = rememberEnvironment(names);
  process.env['EASYEDA_UPSTREAM_COMMAND'] = process.execPath;
  process.env['EASYEDA_UPSTREAM_ARGS_JSON'] = JSON.stringify([entrypoint]);
  process.env['EASYEDA_UPSTREAM_CWD'] = fixtureRoot;
  process.env['EASYEDA_CONTROL_DATA_DIR'] = join(fixtureRoot, 'control-data');
  process.env['EASYEDA_ASSETS_ROOT'] = assetsRoot;
  process.env['EASYEDA_PCB_BUNDLE_VERSION'] = '3.2.149.fixture';
  process.env['EASYEDA_PUBLIC_API_BUNDLE_VERSION'] = '0.2.53.fixture';
});

after(async () => {
  if (originalEnvironment) restoreEnvironment(originalEnvironment);
  if (fixtureRoot) await rm(fixtureRoot, { recursive: true, force: true });
});

void describe('running upstream implementation fingerprint', { concurrency: false }, () => {
  void test('keeps the startup fingerprint and reports later on-disk drift', async () => {
    const upstream = new UpstreamEasyedaClient();
    try {
      assert.deepEqual(await upstream.listTools(), []);
      const initial = await upstream.launcherState();
      assert.deepEqual(initial.startup, initial.current);
      assert.equal(initial.startupSha256, initial.currentSha256);
      assert.equal(initial.drift, false);
      assert.equal(initial.startup.entrypoint, entrypoint);
      assert.equal(initial.startup.implementationTree.root, implementationRoot);
      assert.deepEqual(initial.startup.dependencyLock, {
        type: 'pnpm',
        path: join(fixtureRoot, 'pnpm-lock.yaml'),
        sha256: sha256Text("lockfileVersion: '9.0'\n"),
      });

      await writeFile(entrypoint, '\n// on-disk implementation changed after startup\n', {
        encoding: 'utf8',
        flag: 'a',
      });
      const drifted = await upstream.launcherState();
      assert.deepEqual(drifted.startup, initial.startup);
      assert.notEqual(drifted.current.entrypointSha256, initial.current.entrypointSha256);
      assert.notEqual(
        drifted.current.implementationTree.sha256,
        initial.current.implementationTree.sha256,
      );
      assert.notEqual(drifted.startupSha256, drifted.currentSha256);
      assert.equal(drifted.drift, true);
    } finally {
      await upstream.close();
    }
  });

  void test('hashes the installed PCB and public API implementation files', async () => {
    const upstream = new UpstreamEasyedaClient();
    const bundles = await upstream.installedEasyedaBundles();
    assert.equal(bundles.assetsRoot, assetsRoot);
    assert.deepEqual(bundles.pcbEditor, {
      version: '3.2.149.fixture',
      implementationPath: join(assetsRoot, 'pro-pcb', '3.2.149.fixture', 'js', 'pcb.js'),
      implementationSha256: sha256Text('pcb-fixture'),
    });
    assert.deepEqual(bundles.publicApi, {
      version: '0.2.53.fixture',
      implementationPath: join(assetsRoot, 'pro-api', '0.2.53.fixture', 'api.js'),
      implementationSha256: sha256Text('api-fixture'),
      adapterPath: join(assetsRoot, 'pro-api', '0.2.53.fixture', 'api-types.js'),
      adapterSha256: sha256Text('api-adapter-fixture'),
      declarationsPath: join(assetsRoot, 'pro-api', '0.2.53.fixture', 'api-types.d.ts'),
      declarationsSha256: sha256Text('api-declarations-fixture'),
    });
  });
});
