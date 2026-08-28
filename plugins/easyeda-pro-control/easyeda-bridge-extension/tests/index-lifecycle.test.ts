import { createHash, createHmac } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HEARTBEAT_TIMEOUT_MS,
  REGISTER_OPEN_CALLBACK_TIMEOUT_MS,
  reconnectDelayMs,
} from '../src/connection-policy.js';
import { BRIDGE_AUTHENTICATION_PROTOCOL } from '../src/mutual-auth.js';
import type {
  activate,
  connect,
  deactivate,
  disableAutoConnect,
  disconnect,
  enableAutoConnect,
  showStatus,
} from '../src/index.js';

const AUTHENTICATION_KEY = 'k'.repeat(64);
const ROTATED_AUTHENTICATION_KEY = 'r'.repeat(64);
const AUTHENTICATION_KEY_SHA256 = createHash('sha256')
  .update(AUTHENTICATION_KEY, 'utf8')
  .digest('hex');
const ROTATED_AUTHENTICATION_KEY_SHA256 = createHash('sha256')
  .update(ROTATED_AUTHENTICATION_KEY, 'utf8')
  .digest('hex');
const AUTHENTICATED_INDEX_BUILD_ID = `i${'A'.repeat(43)}`;
const UPDATED_AUTHENTICATED_INDEX_BUILD_ID = `i${'B'.repeat(43)}`;
const AUTHENTICATED_PORT = 49_621;
const AUTHENTICATED_RUNTIME_KEY =
  '__easyedaProControlAuthenticatedBridgeRuntime_v1__';
const AUTHENTICATED_RUNTIME_MARKER =
  'easyeda-pro-control.authenticated-bridge-runtime.v1';
const AUTHENTICATED_RUNTIME_OWNERSHIP_PREFIX =
  '__easyedaProControlAuthenticatedBridgeRuntimeOwnership_v1__';
const LEGACY_RUNTIME_KEY = '__easyedaMcpProBridgeRuntime_v8__';
const CALLABLE_THENABLE = Object.assign(() => null, {
  // oxlint-disable-next-line unicorn/no-thenable -- This adversarial fixture proves callable thenables cannot masquerade as synchronous cleanup.
  then: () => null,
});

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

const GLOBAL_KEYS = [
  AUTHENTICATED_RUNTIME_KEY,
  LEGACY_RUNTIME_KEY,
  'connect',
  'disconnect',
  'showStatus',
  'connectRemoteRelay',
  'disconnectRemoteRelay',
  'showRemoteRelayStatus',
  'enableAutoConnect',
  'disableAutoConnect',
  'toggleAutoConnect',
  'activate',
  'deactivate',
  'sys_Message',
  'sys_Storage',
  'sys_Timer',
  'sys_WebSocket',
  'sys_Dialog',
  'eda',
  'WebSocket',
  'SCH_PrimitiveComponent',
  'BRIDGE_AUTHENTICATION_KEY',
  'BRIDGE_AUTHENTICATED_PORT',
  '__MCP_AUTHENTICATED_INDEX_BUILD_ID__',
  '__MCP_AUTHENTICATION_KEY_SHA256__',
] as const;

interface ExtensionModule {
  activate: typeof activate;
  connect: typeof connect;
  deactivate: typeof deactivate;
  disconnect: typeof disconnect;
  disableAutoConnect: typeof disableAutoConnect;
  enableAutoConnect: typeof enableAutoConnect;
  showStatus: typeof showStatus;
}
type LocalBehavior = 'pending' | 'error' | 'success';
type CloseBehavior = 'success' | 'false' | 'throw' | 'thenable';
type SendBehavior = 'success' | 'false-response';

class HarnessSocket {
  static readonly OPEN = 1;
  static readonly CLOSED = 3;
  static instances: HarnessSocket[] = [];
  static localBehavior: LocalBehavior = 'pending';
  static closeBehavior: CloseBehavior = 'success';
  static sendBehavior: SendBehavior = 'success';
  static authenticationKey = AUTHENTICATION_KEY;
  static localHello: Record<string, unknown> = {
    type: 'hello',
    contractVersion: 1,
    hotSwapEnabled: false,
    maxAggregatePayloadSize: 8_388_608,
    maxPayloadSize: 1_048_576,
    supportedProtocolVersions: ['1.0.0'],
    supportsChunking: true,
  };

  readonly sent: Record<string, unknown>[] = [];
  readyState = 0;
  closeCalls = 0;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(readonly url: string) {
    HarnessSocket.instances.push(this);
    if (!url.startsWith('ws://127.0.0.1:')) {return;}
    queueMicrotask(() => {
      if (HarnessSocket.localBehavior === 'error') {
        this.onerror?.(new Error('connection refused'));
      } else if (HarnessSocket.localBehavior === 'success') {
        this.open();
      }
    });
  }

  static required(index: number): HarnessSocket {
    const socket = HarnessSocket.instances[index];
    if (socket === undefined) {
      throw new Error(`Expected harness WebSocket ${index}.`);
    }
    return socket;
  }

  open(): void {
    if (this.readyState === HarnessSocket.OPEN) {return;}
    this.readyState = HarnessSocket.OPEN;
    this.onopen?.();
  }

  receive(payload: Record<string, unknown>): void {
    this.onmessage?.({ data: JSON.stringify(payload) });
  }

  send(payload: string): unknown {
    const parsed = parseJsonObject(payload);
    this.sent.push(parsed);
    if (
      HarnessSocket.sendBehavior === 'false-response' &&
      parsed.type === 'response'
    ) {
      return false;
    }
    if (this.url.startsWith('ws://127.0.0.1:') && parsed.type === 'auth.client_hello') {
      const clientNonce = String(parsed.clientNonce);
      const serverNonce = Buffer.alloc(32, 7).toString('base64url');
      const serverProof = createHmac('sha256', HarnessSocket.authenticationKey)
        .update(
          JSON.stringify([
            BRIDGE_AUTHENTICATION_PROTOCOL,
            'server-challenge',
            clientNonce,
            serverNonce,
            '',
            '',
          ]),
          'utf8',
        )
        .digest('base64url');
      queueMicrotask(() => {
        this.receive({
          clientNonce,
          protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
          serverNonce,
          serverProof,
          type: 'auth.server_challenge',
        }); },
      );
    }
    if (this.url.startsWith('ws://127.0.0.1:') && parsed.type === 'auth.client_proof') {
      const clientNonce = String(parsed.clientNonce);
      const clientProof = String(parsed.clientProof);
      const serverNonce = String(parsed.serverNonce);
      const sessionId = Buffer.alloc(32, 8).toString('base64url');
      const serverReceipt = createHmac('sha256', HarnessSocket.authenticationKey)
        .update(
          JSON.stringify([
            BRIDGE_AUTHENTICATION_PROTOCOL,
            'server-accepted',
            clientNonce,
            serverNonce,
            sessionId,
            clientProof,
          ]),
          'utf8',
        )
        .digest('base64url');
      queueMicrotask(() => {
        this.receive({
          clientNonce,
          clientProof,
          protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
          serverNonce,
          serverReceipt,
          sessionId,
          type: 'auth.accepted',
        }); },
      );
    }
    if (this.url.startsWith('ws://127.0.0.1:') && parsed.type === 'handshake') {
      queueMicrotask(() =>{  this.receive(HarnessSocket.localHello); });
    }
    return true;
  }

  close(): unknown {
    this.closeCalls += 1;
    if (HarnessSocket.closeBehavior === 'throw') {
      throw new Error('fixture close failure');
    }
    if (HarnessSocket.closeBehavior === 'false') {return false;}
    if (HarnessSocket.closeBehavior === 'thenable') {
      return Promise.resolve();
    }
    if (this.readyState === HarnessSocket.CLOSED) {return undefined;}
    this.readyState = HarnessSocket.CLOSED;
    this.onclose?.();
    return undefined;
  }
}

let loaded: ExtensionModule | undefined;

async function flushMicrotasks(): Promise<void> {
  for (let step = 0; step < 12; step += 1) {
    await Promise.resolve();
  }
}

function createDeferred<T>(): {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
} {
  let resolveValue: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolve) => {
    resolveValue = resolve;
  });
  return {
    promise,
    resolve(value: T): void {
      if (resolveValue === undefined) {
        throw new Error('The deferred fixture is not initialized.');
      }
      resolveValue(value);
    },
  };
}

async function loadExtension(
  options: {
    authenticatedIndexBuildId?: string;
    authenticationKey?: string;
    autoConnect?: boolean;
    autoConnectStoredValue?: unknown;
    withWebSocket?: boolean;
    webSocketApi?: Record<string, unknown>;
  } = {},
): Promise<{
  extension: ExtensionModule;
  toasts: string[];
  storage: { autoConnect: unknown };
}> {
  const toasts: string[] = [];
  const authenticationKey = options.authenticationKey ?? AUTHENTICATION_KEY;
  HarnessSocket.authenticationKey = authenticationKey;
  const storage: { autoConnect: unknown } = {
    autoConnect: options.autoConnectStoredValue ?? options.autoConnect ?? false,
  };
  vi.stubGlobal('sys_Message', {
    showToastMessage: (message: string) => toasts.push(message),
  });
  vi.stubGlobal('sys_Storage', {
    getExtensionUserConfig: () => storage.autoConnect,
    setExtensionUserConfig: async (_key: string, value: boolean) => {
      storage.autoConnect = value;
      return true;
    },
  });
  if (options.withWebSocket === true) {vi.stubGlobal('WebSocket', HarnessSocket);}
  vi.stubGlobal('BRIDGE_AUTHENTICATION_KEY', authenticationKey);
  vi.stubGlobal('BRIDGE_AUTHENTICATED_PORT', AUTHENTICATED_PORT);
  vi.stubGlobal(
    '__MCP_AUTHENTICATED_INDEX_BUILD_ID__',
    options.authenticatedIndexBuildId ?? AUTHENTICATED_INDEX_BUILD_ID,
  );
  vi.stubGlobal(
    '__MCP_AUTHENTICATION_KEY_SHA256__',
    createHash('sha256').update(authenticationKey, 'utf8').digest('hex'),
  );
  if (options.webSocketApi !== undefined) {
    vi.stubGlobal('sys_WebSocket', options.webSocketApi);
  }
  vi.resetModules();
  loaded = await import('../src/index.js');
  await flushMicrotasks();
  return { extension: loaded, toasts, storage };
}

describe('extension loader lifecycle source', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    HarnessSocket.instances = [];
    HarnessSocket.localBehavior = 'pending';
    HarnessSocket.closeBehavior = 'success';
    HarnessSocket.sendBehavior = 'success';
    HarnessSocket.authenticationKey = AUTHENTICATION_KEY;
    HarnessSocket.localHello = {
      type: 'hello',
      contractVersion: 1,
      hotSwapEnabled: false,
      maxAggregatePayloadSize: 8_388_608,
      maxPayloadSize: 1_048_576,
      supportedProtocolVersions: ['1.0.0'],
      supportsChunking: true,
    };
    for (const key of GLOBAL_KEYS) {Reflect.deleteProperty(globalThis, key);}
    for (const key of Object.getOwnPropertyNames(globalThis)) {
      if (key.startsWith(AUTHENTICATED_RUNTIME_OWNERSHIP_PREFIX)) {
        Reflect.deleteProperty(globalThis, key);
      }
    }
  });

  afterEach(() => {
    loaded?.deactivate();
    loaded = undefined;
    for (const key of GLOBAL_KEYS) {Reflect.deleteProperty(globalThis, key);}
    for (const key of Object.getOwnPropertyNames(globalThis)) {
      if (key.startsWith(AUTHENTICATED_RUNTIME_OWNERSHIP_PREFIX)) {
        Reflect.deleteProperty(globalThis, key);
      }
    }
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('honors disabled auto-connect activation without allocating timers', async () => {
    const { extension, toasts } = await loadExtension({ autoConnect: false });

    await extension.activate('onStartupFinished');

    expect(toasts).toContain(
      'EasyEDA Pro Control Bridge: Auto-Connect OFF — click Connect to connect',
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it('retires a partial runtime when an exact control cannot be published', async () => {
    const foreignConnect = vi.fn();
    const easyedaScope: Record<string, unknown> = {};
    Object.defineProperty(easyedaScope, 'connect', {
      configurable: true,
      enumerable: true,
      value: foreignConnect,
      writable: false,
    });
    vi.stubGlobal('eda', easyedaScope);

    await expect(loadExtension()).rejects.toThrow(
      /could not publish its exact connect control/u,
    );

    expect(Reflect.get(easyedaScope, 'connect')).toBe(foreignConnect);
    expect(Reflect.has(easyedaScope, 'activate')).toBe(false);
    expect(Reflect.has(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(false);
    expect(Reflect.has(globalThis, 'activate')).toBe(false);
  });

  it('retires a seeded unauthenticated runtime before using the hardened connection', async () => {
    const legacyDisconnect = vi.fn();
    const legacyDeactivate = vi.fn();
    Reflect.set(globalThis, LEGACY_RUNTIME_KEY, {
      connect: vi.fn(),
      disconnect: legacyDisconnect,
      deactivate: legacyDeactivate,
    });
    vi.stubGlobal('connectRemoteRelay', vi.fn());
    vi.stubGlobal('disconnectRemoteRelay', vi.fn());
    vi.stubGlobal('showRemoteRelayStatus', vi.fn());
    HarnessSocket.localBehavior = 'success';

    const { extension } = await loadExtension({ withWebSocket: true });

    expect(legacyDisconnect).toHaveBeenCalledOnce();
    expect(legacyDeactivate).toHaveBeenCalledOnce();
    expect(Reflect.has(globalThis, LEGACY_RUNTIME_KEY)).toBe(false);
    expect(Reflect.has(globalThis, 'connectRemoteRelay')).toBe(false);
    expect(Reflect.has(globalThis, 'disconnectRemoteRelay')).toBe(false);
    expect(Reflect.has(globalThis, 'showRemoteRelayStatus')).toBe(false);

    await extension.connect();

    expect(HarnessSocket.instances).toHaveLength(1);
    expect(HarnessSocket.required(0).sent[0]).toEqual(
      expect.objectContaining({ type: 'auth.client_hello' }),
    );
    expect(HarnessSocket.required(0).sent).toContainEqual(
      expect.objectContaining({
        authenticatedIndexBuildId: AUTHENTICATED_INDEX_BUILD_ID,
        authenticationKeySha256: AUTHENTICATION_KEY_SHA256,
        type: 'handshake',
      }),
    );
  });

  it('blocks replacement when an unauthenticated legacy control cannot be removed', async () => {
    const legacyEdaScope: Record<string, unknown> = {};
    Object.defineProperty(legacyEdaScope, 'connectRemoteRelay', {
      configurable: false,
      enumerable: false,
      value: vi.fn(),
      writable: false,
    });
    vi.stubGlobal('eda', legacyEdaScope);

    await expect(loadExtension()).rejects.toThrow(
      /legacy bridge control connectRemoteRelay could not be removed/u,
    );

    expect(Reflect.has(legacyEdaScope, 'connectRemoteRelay')).toBe(true);
    expect(Reflect.has(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(false);
  });

  it('reuses only the frozen marker-matched authenticated runtime on repeated evaluation', async () => {
    HarnessSocket.localBehavior = 'success';
    const { extension } = await loadExtension({ withWebSocket: true });
    await extension.connect();
    const firstRuntime = requireRecord(
      Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY),
      'authenticated runtime',
    );
    expect(firstRuntime.authenticatedRuntimeMarker).toBe(
      AUTHENTICATED_RUNTIME_MARKER,
    );
    expect(firstRuntime.authenticatedIndexBuildId).toBe(
      AUTHENTICATED_INDEX_BUILD_ID,
    );
    expect(firstRuntime.authenticationKeySha256).toBe(
      AUTHENTICATION_KEY_SHA256,
    );
    expect(Object.isFrozen(firstRuntime)).toBe(true);

    vi.resetModules();
    const reloaded = await import('../src/index.js');
    loaded = reloaded;
    await flushMicrotasks();

    expect(Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(firstRuntime);
    await reloaded.connect();
    expect(HarnessSocket.instances).toHaveLength(1);
    expect(HarnessSocket.required(0).closeCalls).toBe(0);
  });

  it('replaces and retires the persistent runtime after authentication-key rotation', async () => {
    HarnessSocket.localBehavior = 'success';
    const first = await loadExtension({ withWebSocket: true });
    await first.extension.connect();
    const firstRuntime: unknown = Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY);
    const firstSocket = HarnessSocket.required(0);

    const second = await loadExtension({
      authenticationKey: ROTATED_AUTHENTICATION_KEY,
      withWebSocket: true,
    });
    const secondRuntime = requireRecord(
      Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY),
      'rotated authenticated runtime',
    );

    expect(secondRuntime).not.toBe(firstRuntime);
    expect(secondRuntime.authenticationKeySha256).toBe(
      ROTATED_AUTHENTICATION_KEY_SHA256,
    );
    expect(firstSocket.closeCalls).toBeGreaterThan(0);
    await second.extension.connect();
    expect(HarnessSocket.instances).toHaveLength(2);
  });

  it('replaces and retires the runtime after an index-only build identity change', async () => {
    HarnessSocket.localBehavior = 'success';
    const first = await loadExtension({ withWebSocket: true });
    await first.extension.connect();
    const firstRuntime: unknown = Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY);
    const firstSocket = HarnessSocket.required(0);

    await loadExtension({
      authenticatedIndexBuildId: UPDATED_AUTHENTICATED_INDEX_BUILD_ID,
      withWebSocket: true,
    });
    const secondRuntime = requireRecord(
      Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY),
      'updated authenticated runtime',
    );

    expect(secondRuntime).not.toBe(firstRuntime);
    expect(secondRuntime.authenticatedIndexBuildId).toBe(
      UPDATED_AUTHENTICATED_INDEX_BUILD_ID,
    );
    expect(firstSocket.closeCalls).toBeGreaterThan(0);
  });

  it('retires a frozen marker-matched shared shim without an ownership record', async () => {
    const cleanupOrder: string[] = [];
    const shimDisconnect = vi.fn(() => {
      cleanupOrder.push('disconnect');
    });
    const shimDeactivate = vi.fn(() => {
      cleanupOrder.push('deactivate');
    });
    const noop = vi.fn();
    const shim = Object.freeze({
      activate: noop,
      authenticatedIndexBuildId: AUTHENTICATED_INDEX_BUILD_ID,
      authenticatedRuntimeMarker: AUTHENTICATED_RUNTIME_MARKER,
      authenticationKeySha256: AUTHENTICATION_KEY_SHA256,
      connect: noop,
      deactivate: shimDeactivate,
      disableAutoConnect: noop,
      disconnect: shimDisconnect,
      enableAutoConnect: noop,
      showStatus: noop,
      toggleAutoConnect: noop,
    });
    Reflect.set(globalThis, AUTHENTICATED_RUNTIME_KEY, shim);

    await loadExtension();

    expect(shimDisconnect).toHaveBeenCalledOnce();
    expect(shimDeactivate).toHaveBeenCalledOnce();
    expect(cleanupOrder).toEqual(['disconnect', 'deactivate']);
    expect(Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY)).not.toBe(shim);
  });

  it('fails closed when a stale runtime cannot prove synchronous cleanup', async () => {
    const shimDeactivate = vi.fn();
    const noop = vi.fn();
    const shim = Object.freeze({
      activate: noop,
      authenticatedIndexBuildId: AUTHENTICATED_INDEX_BUILD_ID,
      authenticatedRuntimeMarker: AUTHENTICATED_RUNTIME_MARKER,
      authenticationKeySha256: AUTHENTICATION_KEY_SHA256,
      connect: noop,
      deactivate: shimDeactivate,
      disableAutoConnect: noop,
      disconnect: vi.fn(() => {
        throw new Error('socket cleanup failed');
      }),
      enableAutoConnect: noop,
      showStatus: noop,
      toggleAutoConnect: noop,
    });
    Reflect.set(globalThis, AUTHENTICATED_RUNTIME_KEY, shim);

    await expect(loadExtension()).rejects.toThrow(
      /disconnect failed; refusing to install a replacement control runtime/u,
    );

    expect(shimDeactivate).not.toHaveBeenCalled();
    expect(Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(shim);
    expect(Reflect.has(globalThis, 'connect')).toBe(false);
  });

  it.each([
    ['false', false],
    ['an arbitrary object', {}],
    ['a thenable', Promise.resolve()],
    ['a callable thenable', CALLABLE_THENABLE],
  ] as const)('rejects stale runtime cleanup returning %s', async (_label, cleanupResult) => {
    const noop = vi.fn();
    const shim = Object.freeze({
      activate: noop,
      authenticatedIndexBuildId: AUTHENTICATED_INDEX_BUILD_ID,
      authenticatedRuntimeMarker: AUTHENTICATED_RUNTIME_MARKER,
      authenticationKeySha256: AUTHENTICATION_KEY_SHA256,
      connect: noop,
      deactivate: noop,
      disableAutoConnect: noop,
      disconnect: vi.fn(() => cleanupResult),
      enableAutoConnect: noop,
      showStatus: noop,
      toggleAutoConnect: noop,
    });
    Reflect.set(globalThis, AUTHENTICATED_RUNTIME_KEY, shim);

    await expect(loadExtension()).rejects.toThrow(
      /did not synchronously confirm|asynchronous result/u,
    );

    expect(Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(shim);
  });

  it('fails closed when reading a stale cleanup then getter throws', async () => {
    // oxlint-disable-next-line unicorn/no-thenable -- This hostile getter is the exact boundary under test.
    const cleanupResult = Object.defineProperty(() => null, 'then', {
      configurable: true,
      get: () => {
        throw new Error('hostile then getter');
      },
    });
    const noop = vi.fn();
    const shim = Object.freeze({
      activate: noop,
      authenticatedIndexBuildId: AUTHENTICATED_INDEX_BUILD_ID,
      authenticatedRuntimeMarker: AUTHENTICATED_RUNTIME_MARKER,
      authenticationKeySha256: AUTHENTICATION_KEY_SHA256,
      connect: noop,
      deactivate: noop,
      disableAutoConnect: noop,
      disconnect: vi.fn(() => cleanupResult),
      enableAutoConnect: noop,
      showStatus: noop,
      toggleAutoConnect: noop,
    });
    Reflect.set(globalThis, AUTHENTICATED_RUNTIME_KEY, shim);

    await expect(loadExtension()).rejects.toThrow(/hostile then getter/u);

    expect(Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(shim);
  });

  it('blocks replacement when an old exact ownership record cannot be removed', async () => {
    const oldBuildId = `i${'Z'.repeat(43)}`;
    const oldKeySha256 = 'f'.repeat(64);
    const noop = vi.fn();
    const shim = Object.freeze({
      activate: noop,
      authenticatedIndexBuildId: oldBuildId,
      authenticatedRuntimeMarker: AUTHENTICATED_RUNTIME_MARKER,
      authenticationKeySha256: oldKeySha256,
      connect: noop,
      deactivate: noop,
      disableAutoConnect: noop,
      disconnect: noop,
      enableAutoConnect: noop,
      showStatus: noop,
      toggleAutoConnect: noop,
    });
    const oldOwnershipKey =
      `${AUTHENTICATED_RUNTIME_OWNERSHIP_PREFIX}${oldBuildId}_${oldKeySha256}`;
    Reflect.set(globalThis, AUTHENTICATED_RUNTIME_KEY, shim);
    Object.defineProperty(globalThis, oldOwnershipKey, {
      configurable: false,
      enumerable: false,
      value: Object.freeze({ runtime: shim }),
      writable: false,
    });

    await expect(loadExtension()).rejects.toThrow(
      /ownership record could not be removed/u,
    );

    expect(Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(shim);
    expect(Object.prototype.hasOwnProperty.call(globalThis, oldOwnershipKey)).toBe(true);
  });

  it('persists auto-connect transitions and cancels scheduled recovery when disabled', async () => {
    const { extension, toasts, storage } = await loadExtension({ autoConnect: false });

    await extension.enableAutoConnect();

    expect(storage.autoConnect).toBe(true);
    expect(toasts.at(-1)).toBe('Auto-Connect: ON — will reconnect automatically');
    expect(vi.getTimerCount()).toBe(1);

    await extension.disableAutoConnect();

    expect(storage.autoConnect).toBe(false);
    expect(toasts.at(-1)).toBe('Auto-Connect: OFF — use Connect button to connect');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('falls back from a silent register handle to the EasyEDA create API', async () => {
    HarnessSocket.localBehavior = 'success';
    const registeredIds: string[] = [];
    const closedIds: string[] = [];
    let createCalls = 0;
    const { extension, toasts } = await loadExtension({
      webSocketApi: {
        register: (id: string) => registeredIds.push(id),
        send: () => {},
        close: (id: string) => {
          closedIds.push(id);
        },
        create: (url: string) => {
          createCalls += 1;
          return new HarnessSocket(url);
        },
      },
    });

    const connecting = extension.connect();
    await vi.advanceTimersByTimeAsync(REGISTER_OPEN_CALLBACK_TIMEOUT_MS);
    await flushMicrotasks();
    await connecting;

    expect(registeredIds).toHaveLength(1);
    expect(closedIds).toEqual(registeredIds);
    expect(createCalls).toBe(1);
    expect(toasts).toContain('EasyEDA Pro Control Bridge connected to local server');
  });

  it('never contacts a hostile listener on 49620 and retries only authenticated 49621', async () => {
    HarnessSocket.localBehavior = 'error';
    const { extension, toasts } = await loadExtension({ withWebSocket: true });

    await extension.connect();

    const firstAttempt = HarnessSocket.instances.filter((item) => item.url.startsWith('ws://'));
    expect(firstAttempt.map((item) => item.url)).toEqual([
      `ws://127.0.0.1:${AUTHENTICATED_PORT}`,
    ]);
    expect(firstAttempt.some((item) => item.url.endsWith(':49620'))).toBe(false);
    expect(toasts.at(-1)).toContain(
      'EasyEDA Pro Control Bridge offline: no local server found',
    );

    HarnessSocket.localBehavior = 'success';
    await extension.connect();

    extension.showStatus();
    expect(toasts.at(-1)).toContain(
      'EasyEDA Pro Control Bridge connected to local server',
    );
    expect(HarnessSocket.instances).toHaveLength(2);
  });

  it('suppresses duplicate auto-connect calls while one handshake is pending', async () => {
    HarnessSocket.localBehavior = 'pending';
    const { extension } = await loadExtension({ withWebSocket: true });

    const first = extension.connect('auto');
    const second = extension.connect('auto');

    expect(HarnessSocket.instances).toHaveLength(1);
    HarnessSocket.required(0).open();
    await flushMicrotasks();
    await Promise.all([first, second]);

    expect(HarnessSocket.instances).toHaveLength(1);
    expect(HarnessSocket.required(0).sent).toContainEqual(
      expect.objectContaining({ type: 'handshake' }),
    );
  });

  it('closes a heartbeat-stale socket and releases all reconnect resources on deactivate', async () => {
    HarnessSocket.localBehavior = 'success';
    const { extension } = await loadExtension({ autoConnect: true, withWebSocket: true });

    await extension.connect();
    const socket = HarnessSocket.required(0);
    expect(socket.readyState).toBe(HarnessSocket.OPEN);

    await vi.advanceTimersByTimeAsync(HEARTBEAT_TIMEOUT_MS + 15_000);

    expect(socket.closeCalls).toBeGreaterThan(0);
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    extension.deactivate();

    expect(vi.getTimerCount()).toBe(0);
    expect(Reflect.has(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(false);
    expect(Reflect.has(globalThis, LEGACY_RUNTIME_KEY)).toBe(false);
    loaded = undefined;
  });

  it.each([
    ['contract', { contractVersion: 99 }],
    ['protocol', { supportedProtocolVersions: ['9.9.9'] }],
    ['payload limit', { maxPayloadSize: 1.5 }],
    ['chunking', { supportsChunking: false }],
    ['aggregate limit', { maxAggregatePayloadSize: 7_340_032 }],
    ['hot swap', { hotSwapEnabled: true }],
  ] as const)('rejects an incompatible %s hello before connection admission', async (_label, override) => {
    HarnessSocket.localBehavior = 'success';
    HarnessSocket.localHello = {
      contractVersion: 1,
      hotSwapEnabled: false,
      maxAggregatePayloadSize: 8_388_608,
      maxPayloadSize: 1_048_576,
      supportedProtocolVersions: ['1.0.0'],
      supportsChunking: true,
      type: 'hello',
      ...override,
    };
    const { extension, toasts } = await loadExtension({ withWebSocket: true });

    await extension.connect();

    expect(HarnessSocket.required(0).closeCalls).toBeGreaterThan(0);
    expect(toasts).not.toContain('EasyEDA Pro Control Bridge connected to local server');
    expect(toasts.at(-1)).toContain('EasyEDA Pro Control Bridge offline');
  });

  it('rejects a replayed hello after connection admission', async () => {
    HarnessSocket.localBehavior = 'success';
    const { extension, toasts } = await loadExtension({ withWebSocket: true });
    await extension.connect();
    const socket = HarnessSocket.required(0);

    socket.receive(HarnessSocket.localHello);
    await flushMicrotasks();

    expect(socket.closeCalls).toBeGreaterThan(0);
    extension.showStatus();
    expect(toasts.at(-1)).toContain('disconnected');
  });

  it('does not let an ignored reflected response extend server liveness', async () => {
    HarnessSocket.localBehavior = 'success';
    const { extension } = await loadExtension({ withWebSocket: true });
    await extension.connect();
    const socket = HarnessSocket.required(0);

    await vi.advanceTimersByTimeAsync(HEARTBEAT_TIMEOUT_MS - 1000);
    socket.receive({ durationMs: 1, id: 'reflected', ok: true, type: 'response' });
    await flushMicrotasks();
    await vi.advanceTimersByTimeAsync(16_000);

    expect(socket.closeCalls).toBeGreaterThan(0);
  });

  it('fails closed on a malformed non-boolean auto-connect setting', async () => {
    HarnessSocket.localBehavior = 'success';
    const { extension, toasts } = await loadExtension({
      autoConnectStoredValue: 'false',
      withWebSocket: true,
    });

    await extension.activate('onStartupFinished');

    expect(HarnessSocket.instances).toHaveLength(0);
    expect(toasts.at(-1)).toContain('Auto-Connect OFF');
  });

  it.each(['disconnect', 'disable', 'deactivate'] as const)(
    'guards a queued reconnect callback after %s',
    async (action) => {
      const timeoutCallbacks: { callback: () => void; delayMs: number }[] = [];
      vi.stubGlobal('sys_Timer', {
        clearIntervalTimer: () => true,
        clearTimeoutTimer: () => true,
        setIntervalTimer: () => true,
        setTimeoutTimer: (_id: string, delayMs: number, callback: () => void) => {
          timeoutCallbacks.push({ callback, delayMs });
          return true;
        },
      });
      HarnessSocket.localBehavior = 'success';
      const { extension } = await loadExtension({ autoConnect: true, withWebSocket: true });
      await extension.connect();
      HarnessSocket.required(0).close();
      await flushMicrotasks();
      const reconnect = timeoutCallbacks.find(
        ({ delayMs }) => delayMs === reconnectDelayMs(1),
      );
      expect(reconnect).toBeDefined();

      if (action === 'disconnect') {extension.disconnect();}
      if (action === 'disable') {await extension.disableAutoConnect();}
      if (action === 'deactivate') {
        extension.deactivate();
        loaded = undefined;
      }
      reconnect?.callback();
      await flushMicrotasks();

      expect(HarnessSocket.instances).toHaveLength(1);
    },
  );

  it('detaches a fired reconnect timer before its callback starts another attempt', async () => {
    const timeoutCallbacks = new Map<
      string,
      { readonly callback: () => void; readonly delayMs: number }
    >();
    const clearedTimeoutIds: string[] = [];
    vi.stubGlobal('sys_Timer', {
      clearIntervalTimer: () => true,
      clearTimeoutTimer: (id: string) => {
        clearedTimeoutIds.push(id);
        return true;
      },
      setIntervalTimer: () => true,
      setTimeoutTimer: (id: string, delayMs: number, callback: () => void) => {
        timeoutCallbacks.set(id, { callback, delayMs });
        return true;
      },
    });
    HarnessSocket.localBehavior = 'success';
    const { extension } = await loadExtension({ autoConnect: true, withWebSocket: true });
    await extension.connect();
    HarnessSocket.required(0).close();
    await flushMicrotasks();
    const reconnectEntry = [...timeoutCallbacks.entries()].find(
      ([, { delayMs }]) => delayMs === reconnectDelayMs(1),
    );
    expect(reconnectEntry).toBeDefined();
    const reconnectTimerId = reconnectEntry?.[0];

    HarnessSocket.localBehavior = 'pending';
    reconnectEntry?.[1].callback();
    await flushMicrotasks();
    extension.disconnect();

    expect(HarnessSocket.instances).toHaveLength(2);
    expect(
      clearedTimeoutIds.filter((id) => id === reconnectTimerId),
    ).toHaveLength(0);
  });

  it('requires register send and close before accepting the register transport', async () => {
    HarnessSocket.localBehavior = 'success';
    const register = vi.fn();
    const create = vi.fn((url: string) => new HarnessSocket(url));
    const { extension, toasts } = await loadExtension({
      webSocketApi: { create, register, send: () => {} },
    });

    await extension.connect();

    expect(register).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledOnce();
    expect(toasts).toContain('EasyEDA Pro Control Bridge connected to local server');
  });

  it('disconnects when an admitted transport loses its send capability', async () => {
    HarnessSocket.localBehavior = 'success';
    const { extension } = await loadExtension({ withWebSocket: true });
    await extension.connect();
    const socket = HarnessSocket.required(0);
    Reflect.set(socket, 'send', undefined);

    socket.receive({ id: 'lost-send', method: 'system.loaderStatus', type: 'request' });
    await flushMicrotasks();

    expect(socket.closeCalls).toBeGreaterThan(0);
    expect(socket.readyState).toBe(HarnessSocket.CLOSED);
    expect(socket.sent).not.toContainEqual(
      expect.objectContaining({ id: 'lost-send', type: 'response' }),
    );
  });

  it('disconnects when send explicitly reports synchronous failure', async () => {
    HarnessSocket.localBehavior = 'success';
    HarnessSocket.sendBehavior = 'false-response';
    const { extension } = await loadExtension({ withWebSocket: true });
    await extension.connect();
    const socket = HarnessSocket.required(0);

    socket.receive({ id: 'false-send', method: 'system.loaderStatus', type: 'request' });
    await flushMicrotasks();

    expect(socket.sent).toContainEqual(
      expect.objectContaining({ id: 'false-send', type: 'response' }),
    );
    expect(socket.closeCalls).toBeGreaterThan(0);
    expect(socket.readyState).toBe(HarnessSocket.CLOSED);
  });

  it.each(['false', 'throw', 'thenable'] as const)(
    'retains socket authority when close returns %s',
    async (closeBehavior) => {
      HarnessSocket.localBehavior = 'success';
      HarnessSocket.closeBehavior = closeBehavior;
      const { extension, toasts } = await loadExtension({ withWebSocket: true });
      await extension.connect();
      const socket = HarnessSocket.required(0);

      expect(() => {
        extension.disconnect();
      }).toThrow(/could not be disconnected safely/u);
      expect(() => {
        extension.deactivate();
      }).toThrow(/could not be disconnected safely/u);
      await expect(extension.connect()).rejects.toThrow(/could not be closed safely/u);

      expect(socket.closeCalls).toBeGreaterThan(1);
      expect(toasts).not.toContain(
        'EasyEDA Pro Control Bridge disconnected. Auto reconnect is paused until Connect.',
      );
      expect(Reflect.has(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(true);
      loaded = undefined;
    },
  );

  it('attempts socket closure even when heartbeat timer cleanup throws', async () => {
    let intervalClearCalls = 0;
    vi.stubGlobal('sys_Timer', {
      clearIntervalTimer: () => {
        intervalClearCalls += 1;
        throw new Error('fixture interval clear failure');
      },
      clearTimeoutTimer: () => true,
      setIntervalTimer: () => true,
      setTimeoutTimer: () => true,
    });
    HarnessSocket.localBehavior = 'success';
    const { extension } = await loadExtension({ withWebSocket: true });
    await extension.connect();
    const socket = HarnessSocket.required(0);

    expect(() => {
      extension.disconnect();
    }).toThrow(/heartbeat timer could not be cleared/u);
    socket.receive({ id: 'must-not-dispatch', method: 'system.getStatus', type: 'request' });
    await flushMicrotasks();

    expect(intervalClearCalls).toBe(1);
    expect(socket.closeCalls).toBeGreaterThan(0);
    expect(socket.sent).not.toContainEqual(
      expect.objectContaining({ id: 'must-not-dispatch', type: 'response' }),
    );
    await expect(extension.connect()).rejects.toThrow(/could not be closed safely/u);
    loaded = undefined;
  });

  it('retains a pre-admission socket whose timeout close cannot be proven', async () => {
    HarnessSocket.localBehavior = 'pending';
    HarnessSocket.closeBehavior = 'false';
    const { extension } = await loadExtension({ withWebSocket: true });
    const connecting = extension.connect();

    await vi.advanceTimersByTimeAsync(8000);
    await connecting;
    const socket = HarnessSocket.required(0);
    expect(socket.closeCalls).toBe(1);

    expect(() => {
      extension.deactivate();
    }).toThrow(/could not be disconnected safely/u);
    expect(socket.closeCalls).toBeGreaterThan(1);
    expect(Reflect.has(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(true);
    await expect(extension.connect()).rejects.toThrow(/could not be closed safely/u);
    loaded = undefined;
  });

  it('uses one stable register handle when callbacks fire synchronously', async () => {
    let registerCalls = 0;
    const { extension, toasts } = await loadExtension({
      webSocketApi: {
        close: () => true,
        register: (
          _id: string,
          _url: string,
          onMessage: (event: unknown) => void,
          onOpen?: () => void,
          onClose?: () => void,
        ) => {
          registerCalls += 1;
          onOpen?.();
          onMessage(JSON.stringify({ type: 'synchronous-fixture-frame' }));
          onClose?.();
        },
        send: () => {},
      },
    });

    await extension.connect();
    await extension.connect();

    expect(registerCalls).toBe(2);
    expect(toasts.at(-1)).toContain('offline');
  });

  it('does not start fallback after register close synchronously settles the attempt', async () => {
    let onRegisterClose: (() => void) | undefined;
    const create = vi.fn((url: string) => new HarnessSocket(url));
    const { extension } = await loadExtension({
      webSocketApi: {
        close: () => {
          onRegisterClose?.();
          return true;
        },
        create,
        register: (
          _id: string,
          _url: string,
          _onMessage: (event: unknown) => void,
          _onOpen?: () => void,
          onClose?: () => void,
        ) => {
          onRegisterClose = onClose;
        },
        send: () => {},
      },
    });
    const connecting = extension.connect();

    await vi.advanceTimersByTimeAsync(REGISTER_OPEN_CALLBACK_TIMEOUT_MS);
    await connecting;

    expect(create).not.toHaveBeenCalled();
  });

  it('quarantines an unclosable socket returned by the EasyEDA create API', async () => {
    const create = vi.fn(() => ({ send: () => {} }));
    const { extension } = await loadExtension({
      webSocketApi: { create },
      withWebSocket: true,
    });

    await extension.connect();

    expect(create).toHaveBeenCalledOnce();
    expect(HarnessSocket.instances).toHaveLength(0);
    await expect(extension.connect()).rejects.toThrow(/without a callable close/u);
    expect(() => {
      extension.deactivate();
    }).toThrow(/could not be disconnected safely/u);
    expect(Reflect.has(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(true);
    loaded = undefined;
  });

  it('revokes only its exact controls from both global scopes on deactivate', async () => {
    const easyedaScope: Record<string, unknown> = {};
    vi.stubGlobal('eda', easyedaScope);
    const { extension } = await loadExtension();
    const ownedNames = [
      'activate',
      'connect',
      'deactivate',
      'disableAutoConnect',
      'disconnect',
      'enableAutoConnect',
      'showStatus',
      'toggleAutoConnect',
    ] as const;
    const capturedConnect: unknown = Reflect.get(globalThis, 'connect');
    for (const name of ownedNames) {
      expect(typeof Reflect.get(globalThis, name)).toBe('function');
      expect(Reflect.get(easyedaScope, name)).toBe(Reflect.get(globalThis, name));
    }

    extension.deactivate();

    for (const name of ownedNames) {
      expect(Reflect.has(globalThis, name)).toBe(false);
      expect(Reflect.has(easyedaScope, name)).toBe(false);
    }
    if (typeof capturedConnect !== 'function') {
      throw new TypeError('Expected an exposed connect function.');
    }
    const staleConnectResult: unknown = Reflect.apply(capturedConnect, globalThis, []);
    await expect(staleConnectResult).rejects.toThrow(/deactivated/u);
    loaded = undefined;
  });

  it('preserves a foreign replacement while removing its other exact controls', async () => {
    const { extension } = await loadExtension();
    const foreignConnect = vi.fn();
    Reflect.set(globalThis, 'connect', foreignConnect);

    extension.deactivate();

    expect(Reflect.get(globalThis, 'connect')).toBe(foreignConnect);
    expect(Reflect.has(globalThis, 'disconnect')).toBe(false);
    expect(Reflect.has(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(false);
    loaded = undefined;
  });

  it('keeps a failed control revocation sticky and blocks runtime replacement', async () => {
    const easyedaScope: Record<string, unknown> = {};
    vi.stubGlobal('eda', easyedaScope);
    const first = await loadExtension();
    const ownedConnect = Reflect.get(easyedaScope, 'connect');
    Object.defineProperty(easyedaScope, 'connect', {
      configurable: false,
      value: ownedConnect,
      writable: false,
    });

    expect(() => {
      first.extension.deactivate();
    }).toThrow(/could not revoke every owned capability/u);
    expect(() => {
      first.extension.deactivate();
    }).toThrow(/previously failed/u);
    await expect(
      loadExtension({ authenticatedIndexBuildId: UPDATED_AUTHENTICATED_INDEX_BUILD_ID }),
    ).rejects.toThrow(/refusing to install a replacement control runtime/u);

    expect(Reflect.get(easyedaScope, 'connect')).toBe(ownedConnect);
    expect(Reflect.has(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(true);
    loaded = undefined;
  });

  it('removes controls owned by an exact persistent runtime after module reload', async () => {
    const { extension } = await loadExtension();
    const runtimeBeforeReload: unknown = Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY);
    vi.resetModules();
    const reloaded = await import('../src/index.js');
    loaded = reloaded;

    expect(Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(runtimeBeforeReload);
    reloaded.deactivate();

    expect(Reflect.has(globalThis, 'connect')).toBe(false);
    expect(Reflect.has(globalThis, 'deactivate')).toBe(false);
    expect(Reflect.has(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(false);
    await expect(extension.connect()).rejects.toThrow(/deactivated/u);
    loaded = undefined;
  });

  it('serializes requests across runtime rotation without crossing socket sessions', async () => {
    const firstResult = createDeferred<unknown[]>();
    const getAll = vi
      .fn<() => Promise<unknown[]>>()
      .mockImplementationOnce(() => firstResult.promise)
      .mockResolvedValueOnce([{ id: 'second-component' }]);
    vi.stubGlobal('SCH_PrimitiveComponent', { getAll });
    HarnessSocket.localBehavior = 'success';
    const first = await loadExtension({ withWebSocket: true });
    await first.extension.connect();
    const firstSocket = HarnessSocket.required(0);
    firstSocket.receive({
      id: 'request-a',
      method: 'system.inspectComponents',
      params: {},
      type: 'request',
    });
    await flushMicrotasks();
    expect(getAll).toHaveBeenCalledTimes(1);

    const second = await loadExtension({
      authenticationKey: ROTATED_AUTHENTICATION_KEY,
      withWebSocket: true,
    });
    await second.extension.connect();
    const secondSocket = HarnessSocket.required(1);
    secondSocket.receive({
      id: 'request-b',
      method: 'system.inspectComponents',
      params: {},
      type: 'request',
    });
    await flushMicrotasks();
    expect(getAll).toHaveBeenCalledTimes(1);

    firstResult.resolve([{ id: 'first-component' }]);
    await flushMicrotasks();

    expect(getAll).toHaveBeenCalledTimes(2);
    expect(firstSocket.sent).not.toContainEqual(
      expect.objectContaining({ id: 'request-a', type: 'response' }),
    );
    expect(secondSocket.sent).not.toContainEqual(
      expect.objectContaining({ id: 'request-a', type: 'response' }),
    );
    expect(secondSocket.sent).toContainEqual(
      expect.objectContaining({ id: 'request-b', ok: true, type: 'response' }),
    );
  });

  it('chunks multibyte responses by UTF-8 bytes below every frame limit', async () => {
    vi.stubGlobal('SCH_PrimitiveComponent', {
      getAll: async () => [{ description: '界'.repeat(400_000) }],
    });
    HarnessSocket.localBehavior = 'success';
    const { extension } = await loadExtension({ withWebSocket: true });
    await extension.connect();
    const socket = HarnessSocket.required(0);

    socket.receive({
      id: 'unicode-response',
      method: 'system.inspectComponents',
      params: {},
      type: 'request',
    });
    await flushMicrotasks();

    const chunks = socket.sent.filter((frame) => frame.type === 'chunk');
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.length).toBeLessThanOrEqual(8);
    expect(
      chunks.every(
        (frame) => Buffer.byteLength(JSON.stringify(frame), 'utf8') <= 1_048_576,
      ),
    ).toBe(true);
    const reassembled = chunks.map((frame) => String(frame.data)).join('');
    expect(parseJsonObject(reassembled)).toEqual(
      expect.objectContaining({ id: 'unicode-response', ok: true, type: 'response' }),
    );
  });

  it('rejects an oversized aggregate before emitting any chunk', async () => {
    vi.stubGlobal('SCH_PrimitiveComponent', {
      getAll: async () => [{ description: '界'.repeat(2_800_000) }],
    });
    HarnessSocket.localBehavior = 'success';
    const { extension } = await loadExtension({ withWebSocket: true });
    await extension.connect();
    const socket = HarnessSocket.required(0);

    socket.receive({
      id: 'oversized-response',
      method: 'system.inspectComponents',
      params: {},
      type: 'request',
    });
    await flushMicrotasks();

    expect(socket.sent.filter((frame) => frame.type === 'chunk')).toHaveLength(0);
    const response = socket.sent.find((frame) => frame.id === 'oversized-response');
    const responseError = isRecord(response?.error) ? response.error : {};
    expect(response?.id).toBe('oversized-response');
    expect(response?.ok).toBe(false);
    expect(response?.type).toBe('response');
    expect(responseError.message).toContain('aggregate limit');
  });

  it('does not expose the removed Remote Relay control plane', async () => {
    const { extension } = await loadExtension({ withWebSocket: true });
    expect('connectRemoteRelay' in extension).toBe(false);
    expect('disconnectRemoteRelay' in extension).toBe(false);
    expect('showRemoteRelayStatus' in extension).toBe(false);
    expect(Reflect.has(globalThis, 'connectRemoteRelay')).toBe(false);
    expect(Reflect.has(globalThis, 'disconnectRemoteRelay')).toBe(false);
    expect(Reflect.has(globalThis, 'showRemoteRelayStatus')).toBe(false);
  });

  it('preserves the active runtime pointer when its exact ownership record cannot be removed', async () => {
    const first = await loadExtension();
    const runtime: unknown = Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY);
    const ownershipKey =
      `${AUTHENTICATED_RUNTIME_OWNERSHIP_PREFIX}${AUTHENTICATED_INDEX_BUILD_ID}_${AUTHENTICATION_KEY_SHA256}`;
    const ownership: unknown = Reflect.get(globalThis, ownershipKey);
    Object.defineProperty(globalThis, ownershipKey, {
      configurable: false,
      enumerable: false,
      value: ownership,
      writable: false,
    });

    expect(() => {
      first.extension.deactivate();
    }).toThrow(/ownership record could not be removed/u);
    expect(Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(runtime);
    await expect(
      loadExtension({ authenticatedIndexBuildId: UPDATED_AUTHENTICATED_INDEX_BUILD_ID }),
    ).rejects.toThrow(/refusing to install a replacement control runtime/u);
    expect(Reflect.get(globalThis, AUTHENTICATED_RUNTIME_KEY)).toBe(runtime);
    loaded = undefined;
  });
});
