import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import process from 'node:process';

function parseArgs() {
  const raw = process.env.EASYEDA_UPSTREAM_ARGS_JSON;
  if (raw) {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some((value) => typeof value !== 'string')) {
      throw new Error('EASYEDA_UPSTREAM_ARGS_JSON must be a JSON array of strings.');
    }
    return parsed;
  }
  return ['-y', 'easyeda-mcp-pro@1.0.0-rc.1'];
}

function upstreamEnvironment() {
  const controlRoot =
    process.env.EASYEDA_CONTROL_DATA_DIR ||
    `${process.env.HOME || '/tmp'}/.easyeda-pro-control`;
  return {
    ...process.env,
    TRANSPORT: 'stdio',
    TOOL_PROFILE: process.env.EASYEDA_TOOL_PROFILE ?? 'dev',
    BRIDGE_HOST: process.env.EASYEDA_BRIDGE_HOST ?? '127.0.0.1',
    BRIDGE_PORT: process.env.EASYEDA_BRIDGE_PORT ?? '49621',
    BRIDGE_PORT_SCAN: process.env.EASYEDA_BRIDGE_PORT_SCAN ?? '49621',
    BRIDGE_MAX_PAYLOAD_SIZE: process.env.EASYEDA_BRIDGE_MAX_PAYLOAD_SIZE ?? '10485760',
    BRIDGE_RAW_EXEC_ENABLED: process.env.EASYEDA_RAW_EXEC_ENABLED ?? 'true',
    MCP_RAW_EXEC_EXPERIMENTAL: process.env.EASYEDA_RAW_EXEC_EXPERIMENTAL ?? 'true',
    BRIDGE_HOT_SWAP_ENABLED: 'false',
    LOG_LEVEL: process.env.EASYEDA_UPSTREAM_LOG_LEVEL ?? 'warn',
    DATA_DIR: process.env.EASYEDA_UPSTREAM_DATA_DIR ?? `${controlRoot}/upstream`,
  };
}

async function sha256File(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

async function treeSha256(root) {
  const files = [];
  const visit = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && /\.(c?m?js|json)$/i.test(entry.name)) files.push(path);
    }
  };
  await visit(root);
  const hash = createHash('sha256');
  for (const path of files) {
    hash.update(relative(root, path).replaceAll('\\', '/'));
    hash.update('\0');
    hash.update(await sha256File(path));
    hash.update('\n');
  }
  return { root, fileCount: files.length, sha256: hash.digest('hex') };
}

function upstreamCommand() {
  return process.env.EASYEDA_UPSTREAM_COMMAND ?? '/root/.nvm/versions/node/v24.18.0/bin/npx';
}

async function dependencyLockFingerprint(cwd) {
  const candidates = [
    ['pnpm', 'pnpm-lock.yaml'],
    ['npm', 'package-lock.json'],
    ['npm-shrinkwrap', 'npm-shrinkwrap.json'],
    ['yarn', 'yarn.lock'],
  ];
  for (const [type, name] of candidates) {
    const path = join(cwd, name);
    try {
      const info = await stat(path);
      if (info.isFile()) {
        return { type, path, sha256: await sha256File(path) };
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }
  throw new Error('The upstream dependency lockfile is unavailable.');
}

function requireVersionSegment(value, label) {
  const version = String(value ?? '');
  if (!/^[a-z0-9][a-z0-9._-]{2,80}$/i.test(version)) {
    throw new Error(`${label} must be configured as a filename-safe installed version.`);
  }
  return version;
}

function stableValue(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(stableValue);
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableValue(value[key])]),
  );
}

function fingerprintSha256(value) {
  return createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex');
}

export class UpstreamEasyedaClient {
  constructor() {
    this.client = null;
    this.transport = null;
    this.connectPromise = null;
    this.tools = null;
    this.stderr = '';
    this.startupLauncherFingerprint = null;
  }

  async connect() {
    if (this.client) return this.client;
    if (this.connectPromise) return this.connectPromise;
    this.connectPromise = this.#connect();
    try {
      return await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  async #connect() {
    const command = upstreamCommand();
    // Capture the implementation that the child is about to load. Reading only
    // after spawn can incorrectly attribute later on-disk edits to an old child.
    const startupLauncherFingerprint = await this.launcherFingerprint();
    this.startupLauncherFingerprint = startupLauncherFingerprint;
    const transport = new StdioClientTransport({
      command,
      args: parseArgs(),
      cwd: process.env.EASYEDA_UPSTREAM_CWD || undefined,
      env: upstreamEnvironment(),
      stderr: 'pipe',
    });
    transport.stderr?.on('data', (chunk) => {
      this.stderr = `${this.stderr}${String(chunk)}`.slice(-32768);
    });
    const client = new Client(
      { name: 'easyeda-pro-control-upstream', version: '0.2.0' },
      { capabilities: {} },
    );
    try {
      await client.connect(transport);
    } catch (error) {
      await transport.close().catch(() => undefined);
      this.startupLauncherFingerprint = null;
      throw error;
    }
    this.client = client;
    this.transport = transport;
    return client;
  }

  async listTools(force = false) {
    if (!force && this.tools) return this.tools;
    const client = await this.connect();
    const response = await client.listTools();
    this.tools = Array.isArray(response.tools) ? response.tools : [];
    return this.tools;
  }

  async findTool(name) {
    const tools = await this.listTools();
    return tools.find((tool) => tool.name === name);
  }

  async callTool(name, args, timeoutMs = 70000) {
    const client = await this.connect();
    return await client.callTool(
      { name, arguments: args ?? {} },
      undefined,
      { timeout: timeoutMs, maxTotalTimeout: timeoutMs },
    );
  }

  serverInfo() {
    return this.client?.getServerVersion?.() ?? undefined;
  }

  instructions() {
    return this.client?.getInstructions?.() ?? undefined;
  }

  async launcherFingerprint() {
    const command = upstreamCommand();
    if (!isAbsolute(command)) {
      throw new Error('EASYEDA_UPSTREAM_COMMAND must be absolute for a reproducible launcher hash.');
    }
    const commandPath = resolve(command);
    const commandInfo = await stat(commandPath);
    if (!commandInfo.isFile()) throw new Error('The upstream command is not a regular file.');
    const args = parseArgs();
    const entrypoint = args.find((argument) => isAbsolute(argument));
    if (!entrypoint) {
      throw new Error(
        'EASYEDA_UPSTREAM_ARGS_JSON must contain an absolute server entrypoint for a reproducible hash.',
      );
    }
    const entrypointPath = resolve(entrypoint);
    const entrypointInfo = await stat(entrypointPath);
    if (!entrypointInfo.isFile()) throw new Error('The upstream server entrypoint is not a regular file.');
    const implementationTree = await treeSha256(dirname(entrypointPath));
    const cwd = process.env.EASYEDA_UPSTREAM_CWD
      ? resolve(process.env.EASYEDA_UPSTREAM_CWD)
      : undefined;
    if (!cwd) throw new Error('EASYEDA_UPSTREAM_CWD is required for a reproducible package lock hash.');
    const dependencyLock = await dependencyLockFingerprint(cwd);
    return {
      command: commandPath,
      commandSha256: await sha256File(commandPath),
      args,
      entrypoint: entrypointPath,
      entrypointSha256: await sha256File(entrypointPath),
      implementationTree,
      dependencyLock,
      cwd,
    };
  }

  async launcherState() {
    if (!this.startupLauncherFingerprint) await this.connect();
    const current = await this.launcherFingerprint();
    const startup = this.startupLauncherFingerprint;
    const startupSha256 = fingerprintSha256(startup);
    const currentSha256 = fingerprintSha256(current);
    return {
      startup,
      current,
      startupSha256,
      currentSha256,
      drift: startupSha256 !== currentSha256,
    };
  }

  async installedEasyedaBundles() {
    const assetsRoot = resolve(
      process.env.EASYEDA_ASSETS_ROOT ??
        '/mnt/c/Program Files/easyeda-pro/resources/app/assets',
    );
    const pcbVersion = requireVersionSegment(
      process.env.EASYEDA_PCB_BUNDLE_VERSION,
      'EASYEDA_PCB_BUNDLE_VERSION',
    );
    const apiVersion = requireVersionSegment(
      process.env.EASYEDA_PUBLIC_API_BUNDLE_VERSION,
      'EASYEDA_PUBLIC_API_BUNDLE_VERSION',
    );
    const pcbImplementation = join(assetsRoot, 'pro-pcb', pcbVersion, 'js', 'pcb.js');
    const apiImplementation = join(assetsRoot, 'pro-api', apiVersion, 'api.js');
    const apiAdapter = join(assetsRoot, 'pro-api', apiVersion, 'api-types.js');
    const apiDeclarations = join(assetsRoot, 'pro-api', apiVersion, 'api-types.d.ts');
    for (const path of [pcbImplementation, apiImplementation, apiAdapter, apiDeclarations]) {
      const info = await stat(path);
      if (!info.isFile()) throw new Error(`Installed EasyEDA bundle file is unavailable: ${path}`);
    }
    const [
      pcbImplementationSha256,
      apiImplementationSha256,
      apiAdapterSha256,
      apiDeclarationsSha256,
    ] =
      await Promise.all([
        sha256File(pcbImplementation),
        sha256File(apiImplementation),
        sha256File(apiAdapter),
        sha256File(apiDeclarations),
      ]);
    return {
      available: true,
      assetsRoot,
      pcbEditor: {
        version: pcbVersion,
        implementationPath: pcbImplementation,
        implementationSha256: pcbImplementationSha256,
      },
      publicApi: {
        version: apiVersion,
        implementationPath: apiImplementation,
        implementationSha256: apiImplementationSha256,
        adapterPath: apiAdapter,
        adapterSha256: apiAdapterSha256,
        declarationsPath: apiDeclarations,
        declarationsSha256: apiDeclarationsSha256,
      },
    };
  }

  async close() {
    const client = this.client;
    this.client = null;
    this.tools = null;
    if (client) await client.close().catch(() => undefined);
    if (this.transport) await this.transport.close().catch(() => undefined);
    this.transport = null;
    this.startupLauncherFingerprint = null;
  }
}
