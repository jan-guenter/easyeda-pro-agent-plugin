import { execFileSync } from 'node:child_process';
import { createHash, createHmac, webcrypto } from 'node:crypto';
import vm from 'node:vm';
import { chmodSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSync } from 'esbuild';
import { afterEach, describe, expect, it } from 'vitest';
import { REGISTER_OPEN_CALLBACK_TIMEOUT_MS } from '../src/connection-policy.js';

// Runtime regression tests bundle in memory with synthetic keys. Credential-
// Bearing filesystem output belongs exclusively to the enclosing facade's
// Hardened `npm run bridge:build` command.

const root = join(import.meta.dirname, '..');
const buildScript = join(root, 'scripts', 'build.mjs');
const packageScript = join(root, 'scripts', 'package.mjs');
const watchScript = join(root, 'scripts', 'dev-watch.mjs');
const BUILD_ID_PLACEHOLDER = '__MCP_DISPATCHER_BUILD_ID_PLACEHOLDER__';
const INDEX_BUILD_ID_PLACEHOLDER =
  '__MCP_AUTHENTICATED_INDEX_BUILD_ID_PLACEHOLDER__';
const AUTHENTICATION_KEY = 'k'.repeat(64);
const ROTATED_AUTHENTICATION_KEY = 'r'.repeat(64);
const AUTHENTICATION_PROTOCOL = 'easyeda-pro-control.bridge-auth.v1';
const AUTHENTICATED_RUNTIME_KEY =
  '__easyedaProControlAuthenticatedBridgeRuntime_v1__';
const AUTHENTICATED_RUNTIME_MARKER =
  'easyeda-pro-control.authenticated-bridge-runtime.v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, context: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new TypeError(`Expected ${context} to be an object.`);
  }
  return value;
}

function parseJsonObject(source: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(source);
  return requireRecord(parsed, 'JSON payload');
}

function readContextRecord(
  context: vm.Context,
  property: string,
): Record<string, unknown> {
  const value: unknown = Reflect.get(context, property);
  return requireRecord(value, `VM global ${property}`);
}

function callContextMethod(
  context: vm.Context,
  property: string,
  methodName: string,
): unknown {
  const receiver = readContextRecord(context, property);
  const method: unknown = Reflect.get(receiver, methodName);
  if (typeof method !== 'function') {
    throw new TypeError(`Expected VM global ${property}.${methodName} to be callable.`);
  }
  const result: unknown = Reflect.apply(method, receiver, []);
  return result;
}

function authenticationResponse(
  frame: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (frame.type === 'auth.client_hello') {
    const clientNonce = String(frame.clientNonce);
    const serverNonce = Buffer.alloc(32, 12).toString('base64url');
    return {
      clientNonce,
      protocol: AUTHENTICATION_PROTOCOL,
      serverNonce,
      serverProof: createHmac('sha256', AUTHENTICATION_KEY)
        .update(
          JSON.stringify([
            AUTHENTICATION_PROTOCOL,
            'server-challenge',
            clientNonce,
            serverNonce,
            '',
            '',
          ]),
          'utf8',
        )
        .digest('base64url'),
      type: 'auth.server_challenge',
    };
  }
  if (frame.type === 'auth.client_proof') {
    const clientNonce = String(frame.clientNonce);
    const clientProof = String(frame.clientProof);
    const serverNonce = String(frame.serverNonce);
    const sessionId = Buffer.alloc(32, 13).toString('base64url');
    return {
      clientNonce,
      clientProof,
      protocol: AUTHENTICATION_PROTOCOL,
      serverNonce,
      serverReceipt: createHmac('sha256', AUTHENTICATION_KEY)
        .update(
          JSON.stringify([
            AUTHENTICATION_PROTOCOL,
            'server-accepted',
            clientNonce,
            serverNonce,
            sessionId,
            clientProof,
          ]),
          'utf8',
        )
        .digest('base64url'),
      sessionId,
      type: 'auth.accepted',
    };
  }
  return undefined;
}

function buildInMemory(
  _retiredBuildEnvironment: Readonly<Record<string, string>>,
  authenticationKey = AUTHENTICATION_KEY,
): string {
  const commonOptions = {
    absWorkingDir: root,
    bundle: true,
    format: 'iife' as const,
    minifySyntax: true,
    platform: 'browser' as const,
    target: 'es2020',
    write: false,
    define: {
      __MCP_DISPATCHER_BUILD_ID__: JSON.stringify(BUILD_ID_PLACEHOLDER),
    },
  };
  const dispatcherBundle = buildSync({
    ...commonOptions,
    entryPoints: ['src/dispatcher-entry.ts'],
    format: 'esm',
    outfile: 'dispatcher.js',
  }).outputFiles?.[0]?.text;
  if (dispatcherBundle === undefined) {
    throw new Error('In-memory dispatcher build produced no output.');
  }
  const dispatcherDigest = createHash('sha256')
    .update(dispatcherBundle)
    .digest('hex');
  const buildId = `d${dispatcherDigest.slice(0, 4)}x${dispatcherDigest.slice(4, 8)}x${dispatcherDigest.slice(8, 12)}`;
  const authenticationKeySha256 = createHash('sha256')
    .update(authenticationKey)
    .digest('hex');
  const indexBundle = buildSync({
    ...commonOptions,
    entryPoints: ['src/index.ts'],
    outfile: 'index.js',
    globalName: 'edaEsbuildExportName',
    define: {
      ...commonOptions.define,
      BRIDGE_AUTHENTICATED_PORT: '49621',
      BRIDGE_AUTHENTICATION_KEY: JSON.stringify(authenticationKey),
      __MCP_AUTHENTICATED_INDEX_BUILD_ID__: JSON.stringify(
        INDEX_BUILD_ID_PLACEHOLDER,
      ),
      __MCP_AUTHENTICATION_KEY_SHA256__: JSON.stringify(
        authenticationKeySha256,
      ),
      __MCP_DISPATCHER_BUILD_ID__: JSON.stringify(buildId),
    },
  }).outputFiles?.[0]?.text;
  if (
    indexBundle === undefined ||
    !indexBundle.includes(INDEX_BUILD_ID_PLACEHOLDER)
  ) {
    throw new Error('In-memory authenticated index build produced invalid output.');
  }
  const indexBuildId = `i${createHash('sha256')
    .update(indexBundle)
    .digest('base64url')}`;
  return indexBundle.replaceAll(INDEX_BUILD_ID_PLACEHOLDER, indexBuildId);
}

function runStandaloneCommand(
  script: string,
  outputDirectory: string,
): void {
  const environment: NodeJS.ProcessEnv = {
    ...process.env,
    MCP_BRIDGE_AUTH_KEY: AUTHENTICATION_KEY,
    MCP_BUILD_OUT_DIR: outputDirectory,
  };
  execFileSync(process.execPath, [script], {
    cwd: root,
    env: environment,
    stdio: 'pipe',
    timeout: 2000,
  });
}

describe('authenticated bridge bundle', () => {
  const scratchDirectories: string[] = [];

  afterEach(() => {
    for (const directory of scratchDirectories.splice(0)) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('keeps every standalone build entry point fail-closed without filesystem output', () => {
    const scratchDirectory = mkdtempSync(join(tmpdir(), 'ext-build-disabled-'));
    scratchDirectories.push(scratchDirectory);
    chmodSync(scratchDirectory, 0o777);
    const expectedScripts = new Map([
      [
        buildScript,
        "throw new Error(\n  'Standalone vendored bridge builds are disabled. From plugins/easyeda-pro-control, run `npm run bridge:build`; it is the only supported path for credential-bearing .eext output.',\n);\n",
      ],
      [
        packageScript,
        "throw new Error(\n  'Standalone vendored bridge packaging is disabled. From plugins/easyeda-pro-control, run `npm run bridge:build`; it is the only supported path for credential-bearing .eext output.',\n);\n",
      ],
      [
        watchScript,
        "throw new Error(\n  'Standalone vendored bridge watch builds are disabled. From plugins/easyeda-pro-control, run `npm run bridge:build`; it is the only supported path for credential-bearing .eext output.',\n);\n",
      ],
    ]);
    const protectedDirectories = [scratchDirectory, root, join(root, 'src'), join(root, '..')];
    const directoryEntriesBefore = protectedDirectories.map((directory) =>
      readdirSync(directory).sort(),
    );

    for (const [script, expectedSource] of expectedScripts) {
      expect(readFileSync(script, 'utf8')).toBe(expectedSource);
      for (const outputDirectory of protectedDirectories) {
        expect(() =>{  runStandaloneCommand(script, outputDirectory); }).toThrow(
          /npm run bridge:build/u,
        );
      }
    }

    expect(readdirSync(scratchDirectory)).toEqual([]);
    for (const [index, directory] of protectedDirectories.entries()) {
      expect(readdirSync(directory).sort()).toEqual(directoryEntriesBefore[index]);
    }

    const packageManifest: unknown = JSON.parse(
      readFileSync(join(root, 'package.json'), 'utf8'),
    );
    expect(packageManifest).toMatchObject({ scripts: {
      build: 'node scripts/build.mjs',
      'build:dev': 'node scripts/build.mjs',
      'build:watch': 'node scripts/build.mjs',
    } });
  });

  it('does not compile the retired hot-swap implementation even when the old flag is set', () => {
    const bundle = buildInMemory({ MCP_DEV_HOTSWAP: 'true' });
    expect(bundle).not.toContain('__MCP_DEV_HOTSWAP__');
    expect(bundle).not.toContain('system.hotSwap.begin');
    expect(bundle).not.toContain('system.hotSwap.chunk');
    expect(bundle).not.toContain('system.hotSwap.commit');
    expect(bundle).not.toContain('system.hotSwap.revert');
    expect(bundle).not.toContain('__mcpDispatcherFactory');
    expect(bundle).not.toContain('DEV_MODE_REQUIRED');
  });

  it('structurally omits the development hot-swap implementation in production', () => {
    const bundle = buildInMemory({ MCP_DEV_HOTSWAP: '' });
    expect(bundle).not.toContain('__MCP_DEV_HOTSWAP__');
    expect(bundle).not.toContain('system.hotSwap.begin');
    expect(bundle).not.toContain('system.hotSwap.chunk');
    expect(bundle).not.toContain('system.hotSwap.commit');
    expect(bundle).not.toContain('system.hotSwap.revert');
    expect(bundle).not.toContain('__mcpDispatcherFactory');
    expect(bundle).not.toContain('DEV_MODE_REQUIRED');
  });

  it('binds the authenticated index identity to the credential epoch', () => {
    const firstBundle = buildInMemory({}, AUTHENTICATION_KEY);
    const secondBundle = buildInMemory({}, ROTATED_AUTHENTICATION_KEY);
    const identityPattern =
      /(?:const|let|var) authenticatedIndexBuildId\s*=\s*"(i[A-Za-z0-9_-]{43})"[,;]/u;
    const firstIdentity = (identityPattern.exec(firstBundle))?.[1];
    const secondIdentity = (identityPattern.exec(secondBundle))?.[1];

    expect(firstIdentity).toMatch(/^i[A-Za-z0-9_-]{43}$/u);
    expect(secondIdentity).toMatch(/^i[A-Za-z0-9_-]{43}$/u);
    expect(secondIdentity).not.toBe(firstIdentity);
    expect(firstBundle).toContain(
      createHash('sha256').update(AUTHENTICATION_KEY).digest('hex'),
    );
    expect(secondBundle).toContain(
      createHash('sha256').update(ROTATED_AUTHENTICATION_KEY).digest('hex'),
    );
    expect(firstBundle).not.toContain(
      '__MCP_AUTHENTICATED_INDEX_BUILD_ID_PLACEHOLDER__',
    );
    expect(secondBundle).not.toContain(
      '__MCP_AUTHENTICATED_INDEX_BUILD_ID_PLACEHOLDER__',
    );
  });

  it('declares the startup activation event required by the EasyEDA loader', () => {
    const manifest: unknown = JSON.parse(
      readFileSync(join(root, 'extension.json'), 'utf8'),
    );

    expect(manifest).toMatchObject({
      activationEvents: { onStartupFinished: true },
    });
  });

  it('reuses one persistent runtime across repeated EasyEDA menu evaluations', async () => {
    const bundle = buildInMemory({ MCP_DEV_HOTSWAP: '' });

    const storageState = { autoConnect: false };
    const toastMessages: string[] = [];
    const socketMessages = new Map<string, (data: string) => void>();
    let registerCalls = 0;
    const context = vm.createContext({
      console,
      crypto: webcrypto,
      TextEncoder,
      TextDecoder,
      URL,
      Promise,
      setTimeout,
      clearTimeout,
      setInterval: () => 0,
      clearInterval: () => {},
      localStorage: {
        getItem: () => String(storageState.autoConnect),
        setItem: (_key: string, value: string) => {
          storageState.autoConnect = value !== 'false';
        },
      },
      eda: {
        sys_Storage: {
          getExtensionUserConfig: () => storageState.autoConnect,
          setExtensionUserConfig: async (_key: string, value: boolean) => {
            await Promise.resolve();
            storageState.autoConnect = value;
            return true;
          },
        },
        sys_Message: {
          showToastMessage: (message: string) => toastMessages.push(message),
        },
        sys_WebSocket: {
          register: (
            id: string,
            _url: string,
            onMessage: (data: string) => void,
            onOpen?: () => void,
          ) => {
            registerCalls += 1;
            socketMessages.set(id, onMessage);
            queueMicrotask(() => onOpen?.());
          },
          send: (id: string, payload: string) => {
            const parsed = parseJsonObject(payload);
            const authentication = authenticationResponse(parsed);
            if (authentication) {
              queueMicrotask(() => {
                socketMessages.get(id)?.(JSON.stringify(authentication));
              });
            }
            if (parsed.type === 'handshake') {
              queueMicrotask(() => {
                socketMessages.get(id)?.(
                  JSON.stringify({
                    type: 'hello',
                    contractVersion: 1,
                    hotSwapEnabled: false,
                    maxAggregatePayloadSize: 8_388_608,
                    maxPayloadSize: 1_048_576,
                    supportedProtocolVersions: ['1.0.0'],
                    supportsChunking: true,
                  }),
                );
              });
            }
          },
          close: () => {},
        },
      },
    });

    vm.runInContext(bundle, context);
    const firstRuntime = readContextRecord(context, AUTHENTICATED_RUNTIME_KEY);
    expect(firstRuntime.authenticatedIndexBuildId).toEqual(
      expect.stringMatching(/^i[A-Za-z0-9_-]{43}$/u),
    );
    expect(firstRuntime.authenticatedRuntimeMarker).toBe(AUTHENTICATED_RUNTIME_MARKER);
    expect(firstRuntime.authenticationKeySha256).toBe(
      createHash('sha256').update(AUTHENTICATION_KEY).digest('hex'),
    );
    expect(typeof firstRuntime.connect).toBe('function');
    expect(typeof firstRuntime.disconnect).toBe('function');
    expect(Object.isFrozen(firstRuntime)).toBe(true);
    await callContextMethod(context, 'edaEsbuildExportName', 'enableAutoConnect');
    await callContextMethod(context, 'edaEsbuildExportName', 'enableAutoConnect');
    expect(storageState.autoConnect).toBe(true);
    expect(registerCalls).toBeGreaterThan(0);
    expect(toastMessages.at(-1)).toContain('Auto-Connect: ON');

    vm.runInContext(bundle, context);
    const secondRuntime = readContextRecord(context, AUTHENTICATED_RUNTIME_KEY);
    expect(secondRuntime).toBe(firstRuntime);
    expect(Object.isFrozen(secondRuntime)).toBe(true);
    await callContextMethod(context, 'edaEsbuildExportName', 'disableAutoConnect');
    await callContextMethod(context, 'edaEsbuildExportName', 'disableAutoConnect');
    expect(storageState.autoConnect).toBe(false);
    expect(toastMessages.at(-1)).toContain('Auto-Connect: OFF');
  });

  it('falls back to sys_WebSocket.create when register never reports open', async () => {
    const bundle = buildInMemory({ MCP_DEV_HOTSWAP: '' });

    const toastMessages: string[] = [];
    const registerClosedIds: string[] = [];
    const rawHandshakePayloads: Record<string, unknown>[] = [];
    let registerCalls = 0;
    let registerSendCalls = 0;
    let createCalls = 0;
    let createdSocket: FakeCreatedSocket | undefined;

    class FakeCreatedSocket {
      onopen: (() => void) | null = null;
      onmessage: ((event: { data: string }) => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: ((error: unknown) => void) | null = null;

      constructor() {
        queueMicrotask(() => this.onopen?.());
      }

      send(payload: string): void {
        const parsed = parseJsonObject(payload);
        rawHandshakePayloads.push(parsed);
        const authentication = authenticationResponse(parsed);
        if (authentication) {
          queueMicrotask(() => {
            this.onmessage?.({ data: JSON.stringify(authentication) });
          });
        }
        if (parsed.type === 'handshake') {
          queueMicrotask(() => {
            this.onmessage?.({
              data: JSON.stringify({
                type: 'hello',
                contractVersion: 1,
                hotSwapEnabled: false,
                maxAggregatePayloadSize: 8_388_608,
                maxPayloadSize: 1_048_576,
                supportedProtocolVersions: ['1.0.0'],
                supportsChunking: true,
              }),
            });
          });
        }
      }

      close(): void {
        this.onclose?.();
      }
    }

    const nativeSetTimeout = setTimeout;
    const nativeClearTimeout = clearTimeout;
    const context = vm.createContext({
      console,
      crypto: webcrypto,
      TextEncoder,
      TextDecoder,
      URL,
      Promise,
      setTimeout: (callback: () => void, delayMs: number) => {
        if (delayMs === REGISTER_OPEN_CALLBACK_TIMEOUT_MS) {return nativeSetTimeout(callback, 0);}
        if (delayMs >= 8000) {return nativeSetTimeout(callback, 20);}
        if (delayMs === 1000) {return nativeSetTimeout(callback, 10);}
        return { ignored: true, delayMs };
      },
      clearTimeout: (
        handle: ReturnType<typeof setTimeout> | { ignored: true; delayMs: number },
      ) => {
        if ('ignored' in handle) {return;}
        nativeClearTimeout(handle);
      },
      setInterval: () => ({ ignored: true }),
      clearInterval: () => {},
      localStorage: {
        getItem: () => 'false',
        setItem: () => {},
      },
      SYS_Message: {
        showToastMessage: (message: string) => toastMessages.push(message),
      },
      SYS_WebSocket: {
        register: () => {
          registerCalls += 1;
          // EasyEDA Pro 3.2.149 on macOS can accept register() without
          // Invoking the optional connected callback.
        },
        send: () => {
          registerSendCalls += 1;
        },
        close: (id: string) => {
          registerClosedIds.push(id);
        },
        create: () => {
          createCalls += 1;
          const socket = new FakeCreatedSocket();
          createdSocket = socket;
          return socket;
        },
      },
    });

    vm.runInContext(bundle, context);
    await callContextMethod(context, 'edaEsbuildExportName', 'connect');

    expect(registerCalls).toBe(1);
    expect(registerSendCalls).toBe(0);
    expect(registerClosedIds).toHaveLength(1);
    expect(createCalls).toBe(1);
    expect(rawHandshakePayloads).toContainEqual(expect.objectContaining({ type: 'handshake' }));
    expect(toastMessages).toContain('EasyEDA Pro Control Bridge connected to local server');

    createdSocket?.onmessage?.({
      data: JSON.stringify({ type: 'heartbeat', source: 'server' }),
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(
      rawHandshakePayloads.some(
        (payload) => payload.type === 'heartbeat' && payload.source === 'extension',
      ),
    ).toBe(true);

    createdSocket?.close();
    callContextMethod(context, 'edaEsbuildExportName', 'showStatus');
    expect(toastMessages.at(-1)).toContain('waiting for server');

    callContextMethod(context, 'edaEsbuildExportName', 'disconnect');
  });

  it('uses globalThis.WebSocket when the bare identifier is shadowed', async () => {
    const bundle = buildInMemory({ MCP_DEV_HOTSWAP: '' });

    const toastMessages: string[] = [];
    const handshakePayloads: Record<string, unknown>[] = [];
    let constructorCalls = 0;

    class FakeBrowserWebSocket {
      onopen: (() => void) | null = null;
      onmessage: ((event: { data: string }) => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: ((error: unknown) => void) | null = null;

      constructor(_url: string) {
        constructorCalls += 1;
        queueMicrotask(() => this.onopen?.());
      }

      send(payload: string): void {
        const parsed = parseJsonObject(payload);
        handshakePayloads.push(parsed);
        const authentication = authenticationResponse(parsed);
        if (authentication) {
          queueMicrotask(() => {
            this.onmessage?.({ data: JSON.stringify(authentication) });
          });
        }
        if (parsed.type === 'handshake') {
          queueMicrotask(() => {
            this.onmessage?.({
              data: JSON.stringify({
                type: 'hello',
                contractVersion: 1,
                hotSwapEnabled: false,
                maxAggregatePayloadSize: 8_388_608,
                maxPayloadSize: 1_048_576,
                supportedProtocolVersions: ['1.0.0'],
                supportsChunking: true,
              }),
            });
          });
        }
      }

      close(): void {
        this.onclose?.();
      }
    }

    const context = vm.createContext({
      console,
      crypto: webcrypto,
      TextEncoder,
      TextDecoder,
      URL,
      Promise,
      setTimeout,
      clearTimeout,
      setInterval: () => ({ ignored: true }),
      clearInterval: () => {},
      localStorage: {
        getItem: () => 'false',
        setItem: () => {},
      },
      SYS_Message: {
        showToastMessage: (message: string) => toastMessages.push(message),
      },
      WebSocket: FakeBrowserWebSocket,
    });

    vm.runInContext(
      `(function (WebSocket) {\n${bundle}\nglobalThis.__shadowedWebSocketExport = edaEsbuildExportName;\n}).call(globalThis, undefined);`,
      context,
    );
    await callContextMethod(context, '__shadowedWebSocketExport', 'connect');

    expect(constructorCalls).toBe(1);
    expect(handshakePayloads).toContainEqual(expect.objectContaining({ type: 'handshake' }));
    expect(toastMessages).toContain('EasyEDA Pro Control Bridge connected to local server');

    callContextMethod(context, '__shadowedWebSocketExport', 'disconnect');
  });

  it('reports the silent register phase when no alternate socket API is available', async () => {
    const bundle = buildInMemory({ MCP_DEV_HOTSWAP: '' });

    const toastMessages: string[] = [];
    const nativeSetTimeout = setTimeout;
    const nativeClearTimeout = clearTimeout;
    const context = vm.createContext({
      console,
      crypto: webcrypto,
      TextEncoder,
      TextDecoder,
      URL,
      Promise,
      setTimeout: (callback: () => void, delayMs: number) => {
        if (delayMs === REGISTER_OPEN_CALLBACK_TIMEOUT_MS) {return nativeSetTimeout(callback, 0);}
        if (delayMs >= 8000) {return nativeSetTimeout(callback, 4);}
        if (delayMs === 1000) {return nativeSetTimeout(callback, 2);}
        return { ignored: true, delayMs };
      },
      clearTimeout: (
        handle: ReturnType<typeof setTimeout> | { ignored: true; delayMs: number },
      ) => {
        if ('ignored' in handle) {return;}
        nativeClearTimeout(handle);
      },
      setInterval: () => ({ ignored: true }),
      clearInterval: () => {},
      SYS_Message: {
        showToastMessage: (message: string) => toastMessages.push(message),
      },
      SYS_WebSocket: {
        register: () => {},
        send: () => {},
        close: () => {},
      },
    });

    vm.runInContext(bundle, context);
    await callContextMethod(context, 'edaEsbuildExportName', 'connect');

    expect(toastMessages.at(-1)).toContain(
      'EasyEDA Pro Control Bridge offline: no local server found',
    );
    expect(toastMessages.at(-1)).toContain('did not invoke its open callback');
    expect(toastMessages.at(-1)).toContain('port 49621');

    callContextMethod(context, 'edaEsbuildExportName', 'disconnect');
  });

  it('publishes EasyEDA lifecycle and menu exports through the official IIFE global', () => {
    const bundle = buildInMemory({ MCP_DEV_HOTSWAP: '' });

    expect(bundle).toContain('var edaEsbuildExportName = (() => {');
    for (const exportedName of [
      'activate',
      'deactivate',
      'connect',
      'disconnect',
      'showStatus',
      'enableAutoConnect',
      'disableAutoConnect',
      'toggleAutoConnect',
    ]) {
      expect(bundle).toMatch(new RegExp(`${exportedName}: \\(\\) => ${exportedName}`));
    }
    expect(bundle).not.toContain('connectRemoteRelay');
    expect(bundle).not.toContain('disconnectRemoteRelay');
    expect(bundle).not.toContain('showRemoteRelayStatus');
    expect(bundle).not.toContain('RemoteRelayClient');
    expect(bundle).toContain('__easyedaProControlAuthenticatedBridgeRuntime_v1__');
    expect(bundle).toContain(
      'easyeda-pro-control.authenticated-bridge-runtime.v1',
    );
  });
});
