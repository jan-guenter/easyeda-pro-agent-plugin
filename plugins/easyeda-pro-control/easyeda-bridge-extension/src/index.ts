// The loader: socket lifecycle, handshake, heartbeat and menu glue for the
// MCP bridge extension. Every actual EasyEDA API interaction lives in the
// Dispatcher module (dispatcher.ts), which is baked into this authenticated
// Extension. Runtime dispatcher replacement is intentionally unavailable.
import {
  HEARTBEAT_INTERVAL_MS,
  PRIMARY_CONNECT_TIMEOUT_MS,
  REGISTER_OPEN_CALLBACK_TIMEOUT_MS,
  hasHeartbeatTimedOut,
  isServerActivityMessage,
  reconnectDelayMs,
  shouldReconnectAfterSocketFailure,
} from './connection-policy.js';
import { BridgeMutualAuthenticator } from './mutual-auth.js';
import { createDispatcher } from './dispatcher.js';
import type { Dispatcher, DispatcherToolkit } from './toolkit.js';
import { createRuntimeTimers } from './runtime-timers.js';
import type { EasyedaTimerApi, RuntimeTimerHandle } from './runtime-timers.js';
import { isRecord, log, readPath } from './utils.js';

declare const eda: EasyedaGlobal | undefined;
declare const EDA: unknown;
declare const api: unknown;
declare const ESYS_ToastMessageType: { INFO?: unknown } | undefined;
declare const SYS_WebSocket: EasyedaWebSocketApi | undefined;
declare const SYS_Message: EasyedaMessageApi | undefined;

// Injected only into the private local build. The key is used exclusively for
// HMAC challenge/response and is never placed in a WebSocket frame.
declare const BRIDGE_AUTHENTICATION_KEY: string | undefined;
declare const BRIDGE_AUTHENTICATED_PORT: number | undefined;
declare const __MCP_AUTHENTICATED_INDEX_BUILD_ID__: string | undefined;
declare const __MCP_AUTHENTICATION_KEY_SHA256__: string | undefined;

// Single source for the extension version; sync-versions.mjs patches the
// Literal below (first `extensionVersion: '...'` match in this file).
const EXTENSION_INFO = {
  extensionVersion: '1.0.0-rc.1', // X-release-please-version
};

// Safe accessors for optional EasyEDA Pro runtime globals.
// Never reference optional globals directly; they may not exist in the eval context.

function getWsApi(): EasyedaWebSocketApi | undefined {
  return typeof SYS_WebSocket !== 'undefined'
    ? SYS_WebSocket
    : readPath<EasyedaWebSocketApi>(getGlobal(), 'sys_WebSocket');
}

function getSysMessage(): EasyedaMessageApi | undefined {
  return typeof SYS_Message !== 'undefined'
    ? SYS_Message
    : readPath<EasyedaMessageApi>(getGlobal(), 'sys_Message');
}

function getInfoToastType(): string {
  const info =
    typeof ESYS_ToastMessageType !== 'undefined' ? ESYS_ToastMessageType.INFO : undefined;
  return typeof info === 'string' ? info : 'info';
}

type ConnectMode = 'manual' | 'auto';
type ConnectionState = 'disconnected' | 'connecting' | 'connected';
type InboundMessageType = 'hello' | 'heartbeat' | 'request' | 'ignored';

interface EasyedaGlobal {
  [key: string]: unknown;
  activate?: () => Promise<void>;
  deactivate?: () => void;
  connect?: (mode?: ConnectMode) => Promise<void>;
  disconnect?: () => void;
  showStatus?: () => void;
  enableAutoConnect?: () => Promise<void>;
  disableAutoConnect?: () => Promise<void>;
  toggleAutoConnect?: () => Promise<void>;
}

interface EasyedaWebSocketApi {
  register?: (
    id: string,
    url: string,
    onMessage: (event: unknown) => void,
    onOpen?: () => void,
    onClose?: () => void,
    onError?: (error: unknown) => void,
  ) => void;
  send?: (id: string, data: string) => unknown;
  close?: (id: string) => unknown;
  create?: (url: string) => EasyedaSocket;
}

interface EasyedaMessageApi {
  showToastMessage?: (message: string, messageType?: string) => void;
}

interface EasyedaToastApi {
  showMessage?: (message: string, messageType?: string) => void;
}

interface EasyedaSocket {
  onopen?: () => void;
  onmessage?: (event: unknown) => void;
  onclose?: () => void;
  onerror?: (error: unknown) => void;
  send?: (data: string) => unknown;
  close?: () => unknown;
}

interface BridgeRequest {
  id: string;
  type: 'request';
  method: string;
  params?: Record<string, unknown>;
  timeoutMs?: number;
}

interface BridgeResponse {
  id: string;
  type: 'response';
  ok: boolean;
  result?: unknown;
  error?: {
    code: string;
    message: string;
    suggestion: string;
    data?: unknown;
  };
  durationMs: number;
}

interface SocketHandle {
  type: 'easyeda-register' | 'easyeda-create' | 'browser';
  id?: string;
  raw?: EasyedaSocket | WebSocket;
}

interface RequestConnectionBinding {
  readonly handle: SocketHandle;
  readonly runId: number;
  readonly socketGeneration: number;
}

interface CreateSocketOptions {
  skipRegister?: boolean;
}

type LocalConnectionPhase =
  | 'register-open-timeout'
  | 'socket-api-unavailable'
  | 'socket-open-timeout'
  | 'hello-timeout'
  | 'socket-closed'
  | 'socket-error';

interface LocalConnectionDiagnostic {
  phase: LocalConnectionPhase;
  port: number;
  transport?: SocketHandle['type'] | undefined;
  message: string;
  priority: number;
}

const BRIDGE_PROTOCOL = 'easyeda-mcp-pro.bridge';
const BRIDGE_VERSION = '1.0.0';
const BRIDGE_CONTRACT_VERSION = 1;
const LOOPBACK_HOST = ['127', '0', '0', '1'].join('.');
const REVIEWED_AUTHENTICATED_BRIDGE_PORT = 49_621;
const MINIMUM_BRIDGE_PAYLOAD_SIZE = 2048;
const MAXIMUM_BRIDGE_PAYLOAD_SIZE = 16 * 1024 * 1024;
const AGGREGATE_PAYLOAD_MULTIPLIER = 8;
const SOCKET_ID = 'easyeda-pro-control-authenticated-bridge';

let socketHandle: SocketHandle | null = null;
let connectedPort: number | null = null;
let preferredPort = REVIEWED_AUTHENTICATED_BRIDGE_PORT;
let connectionState: ConnectionState = 'disconnected';
let activeConnectPromise: Promise<void> | null = null;
let reconnectAttempts = 0;
let connectRunId = 0;
let activeSocketGeneration = 0;
let manualDisconnectRequested = false;
let reconnectTimer: RuntimeTimerHandle | null = null;
let heartbeatTimer: RuntimeTimerHandle | null = null;
let reconnectGeneration = 0;
let heartbeatGeneration = 0;
let lifecycleGeneration = 0;
let runtimeRetired = false;
let runtimeRetirementFailure: Error | null = null;
let socketTeardownFailure: string | null = null;
const unclosedSocketHandles = new Set<SocketHandle>();
let lastServerActivityMs = 0;
let lastLocalConnectionDiagnostic: LocalConnectionDiagnostic | null = null;
let externalInteractionWarningShown = false;
// Updated from the server's `hello` message; matches BRIDGE_MAX_PAYLOAD_SIZE default
// Until the handshake completes.
let bridgeMaxPayloadSize = 1_048_576;
// From the server's hello: whether it reassembles chunked frames (A5) and the
// Aggregate cap for one chunked payload. When unset, fall back to single-frame
// Sends limited by bridgeMaxPayloadSize, exactly as before.
let serverSupportsChunking = false;
let maxAggregatePayloadSize = 1_048_576;
interface DispatchCoordinator {
  readonly marker: 'easyeda-pro-control.bridge-dispatch-coordinator.v1';
  enqueue(task: () => Promise<void>): void;
}

function createDispatchCoordinator(): DispatchCoordinator {
  let sequence: Promise<void> = Promise.resolve();
  return Object.freeze({
    marker: 'easyeda-pro-control.bridge-dispatch-coordinator.v1' as const,
    enqueue(task: () => Promise<void>): void {
      sequence = sequence
        .then(task)
        .catch((error: unknown) => {
          log('Unexpected bridge request pipeline failure', bridgeErrorMessage(error));
        });
    },
  });
}

let dispatchCoordinator = createDispatchCoordinator();

function connectionIsEstablished(): boolean {
  return connectionState === 'connected' && connectedPort !== null;
}

function getGlobal(): EasyedaGlobal | null {
  if (typeof eda !== 'undefined') {return eda;}
  return globalThis;
}

const runtimeTimers = createRuntimeTimers(
  () => readPath<EasyedaTimerApi>(getGlobal(), 'sys_Timer'),
  undefined,
  SOCKET_ID,
);

function recordLocalConnectionDiagnostic(diagnostic: LocalConnectionDiagnostic): void {
  log(`Local bridge connection phase ${diagnostic.phase}`, {
    port: diagnostic.port,
    transport: diagnostic.transport,
    message: diagnostic.message,
  });
  const effectivePriority = diagnostic.priority + (diagnostic.port === preferredPort ? 1000 : 0);
  if (
    !lastLocalConnectionDiagnostic ||
    effectivePriority >= lastLocalConnectionDiagnostic.priority
  ) {
    lastLocalConnectionDiagnostic = { ...diagnostic, priority: effectivePriority };
  }
}

function localConnectionDiagnosticSuffix(): string {
  if (!lastLocalConnectionDiagnostic) {return '';}
  return ` — ${lastLocalConnectionDiagnostic.message}`;
}

function showToast(message: string): void {
  const safeMessage = message;
  const messageType = getInfoToastType();

  const sysMessage = getSysMessage();
  if (sysMessage?.showToastMessage) {
    try {
      sysMessage.showToastMessage(safeMessage, messageType);
      return;
    } catch (error) {
      log('sysMessage.showToastMessage failed', { message: safeMessage, error: String(error) });
    }
  }

  const toastMessage = readPath<EasyedaToastApi>(getGlobal(), 'sys_ToastMessage');
  if (toastMessage?.showMessage) {
    try {
      toastMessage.showMessage(safeMessage, messageType);
      return;
    } catch (error) {
      log('toastMessage.showMessage failed', { message: safeMessage, error: String(error) });
    }
  }

  log(safeMessage);
}

function showExternalInteractionHintOnce(error?: unknown): void {
  const message =
    'EasyEDA Pro Control Bridge needs EasyEDA External Interactions permission. Enable it in Extension Manager for EasyEDA Pro Control Authenticated Bridge.';
  log(message, error);
  if (externalInteractionWarningShown) {return;}
  externalInteractionWarningShown = true;
  showToast(message);
}

// ── Dispatcher wiring ────────────────────────────────────────────────────────
// The toolkit hands the baked dispatcher everything it needs from the loader.
// All host-runtime globals pass through this explicit boundary.

const dispatcherToolkit: DispatcherToolkit = {
  getEda: () => {
    if (typeof eda !== 'undefined') {return eda;}
    return readPath<unknown>(globalThis, 'eda');
  },
  getEDA: () => {
    if (typeof EDA !== 'undefined') {return EDA;}
    return readPath<unknown>(globalThis, 'EDA');
  },
  getApi: () => {
    if (typeof api !== 'undefined') {return api;}
    return readPath<unknown>(globalThis, 'api');
  },
  getGlobal: () => getGlobal(),
  log,
  showToast,
  // With chunked sends (A5) a single logical payload may span many frames, so
  // The dispatcher's binary self-limit is the aggregate cap, not the frame cap.
  getBridgeMaxPayloadSize: () =>
    serverSupportsChunking ? maxAggregatePayloadSize : bridgeMaxPayloadSize,
  getBridgeVersion: () => BRIDGE_VERSION,
};

const activeDispatcher: Dispatcher = createDispatcher(dispatcherToolkit);

// Same algorithm as the server's computeMethodRegistryHash: sha256 of the
// Sorted method list joined by ',', hex, first 16 chars. Sent in the
// Handshake so a stale dispatcher fails loudly server-side.
let activeMethodListHash = '';

async function sha256Hex(text: string): Promise<string> {
  const subtle = typeof crypto === 'undefined' ? undefined : crypto.subtle;
  if (!subtle) {
    throw new Error(
      'Method-list hashing requires crypto.subtle in the authenticated extension runtime.',
    );
  }
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function compareCodeUnits(a: string, b: string): number {
  if (a === b) {return 0;}
  return a < b ? -1 : 1;
}

async function refreshMethodListHash(): Promise<void> {
  try {
    // Locale-independent ordering: must produce byte-identical input to the
    // Server's computeMethodRegistryHash (do NOT use localeCompare here).
    const sorted = [...activeDispatcher.methodList].sort(compareCodeUnits);
    activeMethodListHash = (await sha256Hex(sorted.join(','))).slice(0, 16);
  } catch (error) {
    log('failed to compute method list hash', String(error));
    activeMethodListHash = '';
  }
}

function loaderStatus(): Record<string, unknown> {
  return {
    loaderVersion: EXTENSION_INFO.extensionVersion,
    bridgeVersion: BRIDGE_VERSION,
    activeDispatcher: 'baked',
    buildId: activeDispatcher.buildId,
    bakedBuildId: activeDispatcher.buildId,
    methodCount: activeDispatcher.methodList.length,
    methodListHash: activeMethodListHash,
    hotSwapCompiled: false,
    hotSwapEnabled: false,
  };
}

/**
 * Loader-level status is handled before the baked dispatcher. Authenticated
 * production bundles have no runtime code-loading or dispatcher-replacement
 * method; every regular bridge method falls through to the baked dispatcher.
 */
interface LoaderMethodResult {
  handled: boolean;
  result?: unknown;
}
type LoaderMethodHandler = (
  method: string,
  params: Record<string, unknown>,
) => Promise<LoaderMethodResult>;

async function handleProductionLoaderMethod(
  method: string,
  _params: Record<string, unknown>,
): Promise<LoaderMethodResult> {
  return method === 'system.loaderStatus'
    ? { handled: true, result: loaderStatus() }
    : { handled: false };
}

const handleLoaderMethod: LoaderMethodHandler = handleProductionLoaderMethod;

// ── Socket lifecycle ─────────────────────────────────────────────────────────

function createSocket(
  id: string,
  url: string,
  onOpen: () => void,
  onMessage: (data: string) => void,
  onClose: () => void,
  onError: (error: unknown) => void,
  installHandle: (handle: SocketHandle) => void,
  options: CreateSocketOptions = {},
): SocketHandle | null {
  const sysWs = getWsApi();

  // Try easyeda-register first (may throw if external interaction is denied).
  // Only the API's real connected callback may mark the socket open. Calling
  // OnOpen speculatively while WebSocket.readyState is CONNECTING makes send()
  // Throw and closes an otherwise healthy loopback connection.
  if (
    options.skipRegister !== true &&
    typeof sysWs?.register === 'function' &&
    typeof sysWs.send === 'function' &&
    typeof sysWs.close === 'function'
  ) {
    const registerHandle: SocketHandle = { type: 'easyeda-register', id };
    installHandle(registerHandle);
    let openFired = false;
    const fireOpen = (): void => {
      if (openFired) {return;}
      openFired = true;
      onOpen();
    };

    try {
      sysWs.register(
        id,
        url,
        (event) =>{  onMessage(String(isRecord(event) && 'data' in event ? event.data : event)); },
        fireOpen,
        onClose,
        onError,
      );
      return registerHandle;
    } catch (error) {
      showExternalInteractionHintOnce(error);
      log('register() threw, falling through', error);
      if (openFired) {
        closeHandle(registerHandle);
        return null;
      }
    }
  }

  // Fallback: easyeda-create (different API path, may have different permissions)
  if (typeof sysWs?.create === 'function') {
    let socket: EasyedaSocket | undefined;
    try {
      socket = sysWs.create(url);
    } catch (error) {
      log('create() threw, falling through', error);
    }
    if (socket !== undefined) {
      const createHandle: SocketHandle = { type: 'easyeda-create', raw: socket };
      installHandle(createHandle);
      if (typeof socket.close !== 'function') {
        recordSocketTeardownFailure(
          'SYS_WebSocket.create() returned a socket without a callable close method.',
        );
        unclosedSocketHandles.add(createHandle);
        return null;
      }
      if (typeof socket.send !== 'function') {
        if (!closeHandle(createHandle)) {return null;}
        log('create() returned a socket without a callable send method; falling through');
      } else {
        socket.onopen = onOpen;
        socket.onmessage = (event) =>{  onMessage(String(isRecord(event) ? event.data : event)); };
        socket.onclose = onClose;
        socket.onerror = onError;
        return createHandle;
      }
    }
  }

  // Last resort: raw browser WebSocket (works outside extension sandbox).
  // Resolve via globalThis because some EasyEDA runtimes shadow the bare
  // WebSocket identifier while preserving the constructor on the global.
  const BrowserWebSocketCtor = (globalThis as { WebSocket?: typeof WebSocket }).WebSocket;
  if (typeof BrowserWebSocketCtor === 'function') {
    try {
      const socket = new BrowserWebSocketCtor(url);
      const browserHandle: SocketHandle = { type: 'browser', raw: socket };
      installHandle(browserHandle);
      if (typeof socket.close !== 'function') {
        recordSocketTeardownFailure(
          'The browser WebSocket constructor returned a socket without a callable close method.',
        );
        unclosedSocketHandles.add(browserHandle);
        return null;
      }
      if (typeof socket.send !== 'function') {
        if (!closeHandle(browserHandle)) {return null;}
        log('The browser WebSocket constructor returned a socket without a callable send method.');
        return null;
      }
      socket.onopen = onOpen;
      socket.onmessage = (event) =>{  onMessage(String(event.data)); };
      socket.onclose = onClose;
      socket.onerror = onError;
      return browserHandle;
    } catch (error) {
      log('WebSocket() threw', error);
    }
  }

  return null;
}

let chunkIdCounter = 0;

function utf8ByteLength(source: string): number {
  return new TextEncoder().encode(source).byteLength;
}

function codePointBoundaryAtOrBefore(source: string, index: number, start: number): number {
  if (index <= start || index >= source.length) {return index;}
  // oxlint-disable-next-line unicorn/prefer-code-point -- Chunk boundaries intentionally inspect individual UTF-16 surrogate code units.
  const current = source.charCodeAt(index);
  // oxlint-disable-next-line unicorn/prefer-code-point -- Chunk boundaries intentionally inspect individual UTF-16 surrogate code units.
  const previous = source.charCodeAt(index - 1);
  return current >= 56_320 && current <= 57_343 &&
    previous >= 55_296 && previous <= 56_319
    ? index - 1
    : index;
}

function prepareChunkFrames(source: string, id: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < source.length && chunks.length < AGGREGATE_PAYLOAD_MULTIPLIER) {
    const sequence = chunks.length;
    let lowestCandidate = start + 1;
    let highestCandidate = source.length;
    let acceptedEnd = start;
    while (lowestCandidate <= highestCandidate) {
      const midpoint = Math.floor((lowestCandidate + highestCandidate) / 2);
      const candidateEnd = codePointBoundaryAtOrBefore(source, midpoint, start);
      if (candidateEnd <= start) {
        lowestCandidate = midpoint + 1;
        continue;
      }
      const candidateFrame = JSON.stringify({
        type: 'chunk',
        id,
        seq: sequence,
        total: AGGREGATE_PAYLOAD_MULTIPLIER,
        data: source.slice(start, candidateEnd),
      });
      if (utf8ByteLength(candidateFrame) <= bridgeMaxPayloadSize) {
        acceptedEnd = candidateEnd;
        lowestCandidate = midpoint + 1;
      } else {
        highestCandidate = midpoint - 1;
      }
    }
    if (acceptedEnd <= start) {
      throw new Error('The authenticated frame limit cannot hold one chunk envelope.');
    }
    chunks.push(source.slice(start, acceptedEnd));
    start = acceptedEnd;
  }
  if (start < source.length) {
    throw new Error(
      `Bridge response requires more than ${AGGREGATE_PAYLOAD_MULTIPLIER} authenticated frames.`,
    );
  }
  return chunks.map((chunk, seq) => JSON.stringify({
    type: 'chunk',
    id,
    seq,
    total: chunks.length,
    data: chunk,
  }));
}

function send(data: unknown): void {
  const payload = JSON.stringify(data);
  const payloadBytes = utf8ByteLength(payload);
  if (payloadBytes > maxAggregatePayloadSize) {
    throw new Error(
      `Bridge response is ${payloadBytes} UTF-8 bytes, exceeding the authenticated aggregate limit ${maxAggregatePayloadSize}.`,
    );
  }

  // A5: split payloads that would exceed the server's per-frame cap into
  // Chunk envelopes the server reassembles. An oversized single frame closes
  // The whole connection (code 4009); chunking turns that into a normal send.
  // Only used when the server's hello advertised chunk support.
  if (serverSupportsChunking && payloadBytes > Math.floor(bridgeMaxPayloadSize / 2)) {
    const id = `chk_${Date.now()}_${chunkIdCounter += 1}`;
    const frames = prepareChunkFrames(payload, id);
    if (
      frames.some(
        (frame) => utf8ByteLength(frame) > bridgeMaxPayloadSize,
      )
    ) {
      throw new Error('A prepared bridge chunk exceeds the advertised UTF-8 frame limit.');
    }
    for (const frame of frames) {
      sendRaw(frame);
    }
    return;
  }

  if (payloadBytes > bridgeMaxPayloadSize) {
    throw new Error(
      `Bridge response is ${payloadBytes} UTF-8 bytes, exceeding the unchunked frame limit ${bridgeMaxPayloadSize}.`,
    );
  }

  sendRaw(payload);
}

function sendRaw(payload: string): void {
  const handle = socketHandle;
  if (handle === null) {
    throw new Error('The authenticated bridge has no active socket for this frame.');
  }
  const sysWs = getWsApi();
  let result: unknown;
  try {
    if (handle.type === 'easyeda-register') {
      if (typeof sysWs?.send !== 'function') {
        throw new TypeError(
          'The accepted SYS_WebSocket.register transport no longer exposes a callable send method.',
        );
      }
      result = sysWs.send(handle.id ?? SOCKET_ID, payload);
    } else {
      const rawSend = handle.raw?.send;
      if (typeof rawSend !== 'function') {
        throw new TypeError(
          `The accepted ${handle.type} transport no longer exposes a callable send method.`,
        );
      }
      result = Reflect.apply(rawSend, handle.raw, [payload]);
    }
    if (isThenable(result)) {
      void Promise.resolve(result).catch((error: unknown) => {
        log('Authenticated bridge send rejected after fail-closed disconnect', error);
      });
      throw new Error(
        'The authenticated bridge transport returned an asynchronous send result whose completion cannot be proven.',
      );
    }
    if (result !== undefined && result !== true) {
      throw new Error(
        'The authenticated bridge transport did not synchronously confirm frame submission.',
      );
    }
  } catch (error) {
    log('Authenticated bridge send failed', error);
    recoverConnection('Bridge send failed; reconnecting');
    throw error;
  }
}

function recordRuntimeTeardownFailure(message: string, error?: unknown): Error {
  if (socketTeardownFailure === null) {
    socketTeardownFailure = message;
  }
  manualDisconnectRequested = true;
  const failure = new Error(
    error === undefined ? message : `${message} ${bridgeErrorMessage(error)}`,
  );
  log('Bridge runtime teardown failed; refusing replacement connection', {
    message,
    ...(error === undefined ? {} : { error: bridgeErrorMessage(error) }),
  });
  return failure;
}

function recordSocketTeardownFailure(message: string, error?: unknown): Error {
  const failure = recordRuntimeTeardownFailure(message, error);
  cancelReconnectTimer();
  return failure;
}

function closeHandle(handle: SocketHandle | null): boolean {
  if (!handle) {return true;}

  const sysWs = getWsApi();
  if (handle.type === 'easyeda-register') {
    if (typeof sysWs?.close !== 'function') {
      recordSocketTeardownFailure(
        'The accepted SYS_WebSocket.register transport no longer exposes a callable close method.',
      );
      unclosedSocketHandles.add(handle);
      return false;
    }
    try {
      const result: unknown = sysWs.close(handle.id ?? SOCKET_ID);
      if (result !== undefined && result !== true) {
        recordSocketTeardownFailure(
          'SYS_WebSocket.close did not synchronously confirm teardown of the authenticated bridge socket.',
        );
        unclosedSocketHandles.add(handle);
        return false;
      }
      unclosedSocketHandles.delete(handle);
      return true;
    } catch (error) {
      recordSocketTeardownFailure('SYS_WebSocket.close threw during bridge teardown.', error);
      unclosedSocketHandles.add(handle);
      return false;
    }
  }

  const close = handle.raw?.close;
  if (typeof close !== 'function') {
    recordSocketTeardownFailure(
      `The accepted ${handle.type} transport no longer exposes a callable close method.`,
    );
    unclosedSocketHandles.add(handle);
    return false;
  }
  try {
    const result: unknown = Reflect.apply(close, handle.raw, []);
    if (result !== undefined && result !== true) {
      recordSocketTeardownFailure(
        `The ${handle.type} transport did not synchronously confirm authenticated bridge teardown.`,
      );
      unclosedSocketHandles.add(handle);
      return false;
    }
    unclosedSocketHandles.delete(handle);
    return true;
  } catch (error) {
    recordSocketTeardownFailure(
      `The ${handle.type} transport threw during authenticated bridge teardown.`,
      error,
    );
    unclosedSocketHandles.add(handle);
    return false;
  }
}

function closeSocket(): boolean {
  const currentHandle = socketHandle;
  const previouslyUnclosedHandles = [...unclosedSocketHandles];
  let allClosed = true;
  if (currentHandle !== null) {
    if (closeHandle(currentHandle)) {
      if (socketHandle === currentHandle) {socketHandle = null;}
    } else {
      allClosed = false;
    }
  }
  for (const retainedHandle of previouslyUnclosedHandles) {
    if (retainedHandle === currentHandle) {continue;}
    if (!closeHandle(retainedHandle)) {allClosed = false;}
  }
  if (socketHandle === null && unclosedSocketHandles.size === 0) {
    connectedPort = null;
    activeSocketGeneration = 0;
    connectionState = 'disconnected';
    lastServerActivityMs = 0;
  }
  return allClosed && socketHandle === null && unclosedSocketHandles.size === 0;
}

function recoverConnection(reason: string): void {
  const wasConnected = connectionState === 'connected' && connectedPort !== null;
  const wasConnecting = connectionState === 'connecting';
  if (!wasConnected && !wasConnecting && !socketHandle) {return;}

  log(reason);
  stopHeartbeat();
  if (!closeHandle(socketHandle)) {return;}
  socketHandle = null;
  connectedPort = null;
  activeSocketGeneration = 0;
  lastServerActivityMs = 0;

  if (wasConnecting) {
    // A failed handshake is one failed port attempt, not a disconnected session.
    // Keep the scan state intact so connectToPort can time out and continue.
    connectionState = 'connecting';
    return;
  }

  connectionState = 'disconnected';
  if (
    shouldReconnectAfterSocketFailure({
      wasConnected,
      manualDisconnectRequested,
      autoConnectEnabled,
    })
  ) {
    scheduleReconnect();
  }
}

function authenticationKey(): string {
  const key =
    typeof BRIDGE_AUTHENTICATION_KEY !== 'undefined'
      ? BRIDGE_AUTHENTICATION_KEY
      : undefined;
  if (key === undefined || key.length === 0) {
    throw new Error('This bridge was not built with mutual authentication.');
  }
  return key;
}

function authenticatedBridgePort(): number {
  const port =
    typeof BRIDGE_AUTHENTICATED_PORT !== 'undefined'
      ? BRIDGE_AUTHENTICATED_PORT
      : undefined;
  if (port !== REVIEWED_AUTHENTICATED_BRIDGE_PORT) {
    throw new Error(
      `The private bridge must use reviewed loopback port ${REVIEWED_AUTHENTICATED_BRIDGE_PORT}.`,
    );
  }
  return port;
}

function sendHandshake(): void {
  const handshake: Record<string, unknown> = {
    type: 'handshake',
    protocol: BRIDGE_PROTOCOL,
    protocolVersion: BRIDGE_VERSION,
    contractVersion: BRIDGE_CONTRACT_VERSION,
    authenticatedIndexBuildId:
      AUTHENTICATED_RUNTIME_IDENTITY.authenticatedIndexBuildId,
    authenticationKeySha256:
      AUTHENTICATED_RUNTIME_IDENTITY.authenticationKeySha256,
    clientName: 'easyeda-mcp-pro',
    extensionVersion: EXTENSION_INFO.extensionVersion,
    easyedaVersion: getEasyedaVersion(),
    devMode: false,
    loaderVersion: EXTENSION_INFO.extensionVersion,
  };
  // Lets the server fail loudly when this extension serves stale dispatch
  // Logic. Computed asynchronously at startup; omitted if not ready yet.
  if (activeMethodListHash !== undefined && activeMethodListHash.length > 0) {
    handshake.methodListHash = activeMethodListHash;
  }
  send(handshake);
}

function getEasyedaVersion(): string | undefined {
  const maybeVersion = readPath<unknown>(getGlobal(), 'sys_Environment.getVersion');
  if (typeof maybeVersion === 'function') {
    try {
      const version: unknown = Reflect.apply(maybeVersion, undefined, []);
      return String(version);
    } catch (error) {
      log('failed to read EasyEDA version', String(error));
      return undefined;
    }
  }
  return undefined;
}

function startHeartbeat(): void {
  const cleanupFailure = stopHeartbeat();
  if (cleanupFailure !== null) {throw cleanupFailure;}
  lastServerActivityMs = Date.now();
  const generation = heartbeatGeneration;
  heartbeatTimer = runtimeTimers.setInterval(() => {
    if (
      generation !== heartbeatGeneration ||
      connectionState !== 'connected' ||
      connectedPort === null
    ) {return;}
    const nowMs = Date.now();
    if (hasHeartbeatTimedOut(lastServerActivityMs, nowMs)) {
      recoverConnection(`Bridge heartbeat timeout; silent for ${nowMs - lastServerActivityMs}ms`);
      return;
    }
    send({ type: 'heartbeat', timestamp: nowMs, source: 'extension' });
  }, HEARTBEAT_INTERVAL_MS);
}

function stopHeartbeat(): Error | null {
  heartbeatGeneration += 1;
  const timer = heartbeatTimer;
  heartbeatTimer = null;
  lastServerActivityMs = 0;
  if (timer === null) {return null;}
  try {
    runtimeTimers.clearInterval(timer);
    return null;
  } catch (error) {
    return recordRuntimeTeardownFailure(
      'The authenticated bridge heartbeat timer could not be cleared safely.',
      error,
    );
  }
}

function bridgeErrorMessage(error: unknown): string {
  if (error instanceof Error) {return error.message;}
  if (isRecord(error) && typeof error.message === 'string') {return error.message;}
  return String(error);
}

function isCurrentRequestConnection(binding: RequestConnectionBinding): boolean {
  return (
    binding.runId === connectRunId &&
    binding.socketGeneration === activeSocketGeneration &&
    socketHandle === binding.handle &&
    connectionState === 'connected'
  );
}

function sendForRequestConnection(
  binding: RequestConnectionBinding,
  response: BridgeResponse,
): void {
  if (!isCurrentRequestConnection(binding)) {return;}
  send(response);
}

async function handleRequest(
  message: BridgeRequest,
  binding: RequestConnectionBinding,
): Promise<void> {
  if (!isCurrentRequestConnection(binding)) {return;}
  const startedAt = Date.now();
  try {
    // Loader status is handled before the baked dispatcher.
    const loaderResult = await handleLoaderMethod(message.method, message.params ?? {});
    const result = loaderResult.handled
      ? loaderResult.result
      : await activeDispatcher.dispatch(message.method, message.params);
    sendForRequestConnection(binding, {
      id: message.id,
      type: 'response',
      ok: true,
      result,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    const record = isRecord(error) ? error : {};
    const response: BridgeResponse = {
      id: message.id,
      type: 'response',
      ok: false,
      error: {
        code: typeof record.code === 'string' ? record.code : 'EASYEDA_API_ERROR',
        message: bridgeErrorMessage(error),
        suggestion:
          typeof record.suggestion === 'string'
            ? record.suggestion
            : 'Check EasyEDA Pro and extension logs.',
        data: record.data,
      },
      durationMs: Date.now() - startedAt,
    };
    sendForRequestConnection(binding, response);
  }
}

function queueRequest(
  message: BridgeRequest,
  binding: RequestConnectionBinding,
): void {
  dispatchCoordinator.enqueue(() => handleRequest(message, binding));
}

function applyHelloPayload(record: Record<string, unknown>): void {
  if (record.contractVersion !== BRIDGE_CONTRACT_VERSION) {
    throw new Error(
      `Bridge hello contract version mismatch: expected ${BRIDGE_CONTRACT_VERSION}, received ${String(record.contractVersion)}.`,
    );
  }
  const supportedVersions = Array.isArray(record.supportedProtocolVersions)
    ? record.supportedProtocolVersions
    : [];
  if (
    supportedVersions.length !== 1 ||
    supportedVersions[0] !== BRIDGE_VERSION
  ) {
    throw new Error(
      `Bridge hello protocol versions mismatch: expected only ${BRIDGE_VERSION}.`,
    );
  }
  const advertisedPayloadSize = record.maxPayloadSize;
  if (
    typeof advertisedPayloadSize !== 'number' ||
    !Number.isSafeInteger(advertisedPayloadSize) ||
    advertisedPayloadSize < MINIMUM_BRIDGE_PAYLOAD_SIZE ||
    advertisedPayloadSize > MAXIMUM_BRIDGE_PAYLOAD_SIZE
  ) {
    throw new Error('Bridge hello maxPayloadSize is outside the reviewed safe integer range.');
  }
  const payloadSize = advertisedPayloadSize;
  const expectedAggregatePayloadSize = payloadSize * AGGREGATE_PAYLOAD_MULTIPLIER;
  if (
    record.supportsChunking !== true ||
    typeof record.maxAggregatePayloadSize !== 'number' ||
    !Number.isSafeInteger(record.maxAggregatePayloadSize) ||
    record.maxAggregatePayloadSize !== expectedAggregatePayloadSize
  ) {
    throw new Error(
      'Bridge hello must advertise reviewed chunking with an exact eight-frame aggregate limit.',
    );
  }
  if (
    record.hotSwapEnabled !== undefined &&
    record.hotSwapEnabled !== false
  ) {
    throw new Error('Bridge hello may not enable hot swap in the production extension.');
  }
  bridgeMaxPayloadSize = payloadSize;
  serverSupportsChunking = true;
  maxAggregatePayloadSize = expectedAggregatePayloadSize;
  log('Bridge handshake accepted');
}

function handleHeartbeatMessage(source: 'server' | 'extension' | undefined): void {
  if (source === 'extension') {return;}
  send({ type: 'heartbeat', timestamp: Date.now(), source: 'extension' });
}

function parseBridgeRequest(message: Record<string, unknown>): BridgeRequest {
  const id = message.id;
  const method = message.method;
  const params = message.params;
  const timeoutMs = message.timeoutMs;
  if (
    message.type !== 'request' ||
    typeof id !== 'string' ||
    typeof method !== 'string' ||
    (params !== undefined && !isRecord(params)) ||
    (timeoutMs !== undefined && (typeof timeoutMs !== 'number' || !Number.isFinite(timeoutMs)))
  ) {
    throw new Error('The bridge request frame is malformed.');
  }
  return {
    id,
    method,
    ...(params === undefined ? {} : { params }),
    ...(timeoutMs === undefined ? {} : { timeoutMs }),
    type: 'request',
  };
}

function handleMessage(
  raw: string,
  allowRequests: boolean,
  binding: RequestConnectionBinding,
): InboundMessageType {
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed)) {
    throw new Error('The bridge frame must be a JSON object.');
  }
  const messageType = typeof parsed.type === 'string' ? parsed.type : undefined;
  const source =
    parsed.source === 'server' || parsed.source === 'extension'
      ? parsed.source
      : undefined;
  switch (messageType) {
    case 'hello': {
      if (allowRequests) {
        throw new Error('The bridge sent a second hello after connection admission.');
      }
      applyHelloPayload(parsed);
      if (isServerActivityMessage(messageType, source)) {
        lastServerActivityMs = Date.now();
      }
      return 'hello';
    }
    case 'heartbeat': {
      handleHeartbeatMessage(source);
      if (isServerActivityMessage(messageType, source)) {
        lastServerActivityMs = Date.now();
      }
      return 'heartbeat';
    }
    case 'request': {
      if (!allowRequests) {
        throw new Error('The bridge sent a request before its authenticated hello.');
      }
      const request = parseBridgeRequest(parsed);
      if (isServerActivityMessage(messageType, source)) {
        lastServerActivityMs = Date.now();
      }
      queueRequest(request, binding);
      return 'request';
    }
    case undefined: { throw new Error('Not implemented yet: undefined case') }
    default: {
      return 'ignored';
    }
  }
}

async function connectToPort(
  port: number,
  runId: number,
  showSuccessToast: boolean,
  timeoutMs: number,
): Promise<boolean> {
  const url = `ws://${LOOPBACK_HOST}:${port}`;
  const socketId = `${SOCKET_ID}-${runId}-${port}`;
  return new Promise((resolve) => {
    let settled = false;
    let handle: SocketHandle | null = null;
    let socketGeneration = 0;
    let socketOpened = false;
    let authenticationStarted = false;
    let handshakeSent = false;
    let registerFallbackTimer: RuntimeTimerHandle | null = null;
    let connectionTimeout: RuntimeTimerHandle | null = null;
    let localTimerCleanupFailure: Error | null = null;

    const clearRegisterFallback = (): Error | null => {
      const timer = registerFallbackTimer;
      registerFallbackTimer = null;
      if (timer === null) {return null;}
      try {
        runtimeTimers.clearTimeout(timer);
        return null;
      } catch (error) {
        localTimerCleanupFailure = recordRuntimeTeardownFailure(
          'The register-fallback timer could not be cleared safely.',
          error,
        );
        return localTimerCleanupFailure;
      }
    };

    const clearConnectionTimeout = (): Error | null => {
      const timer = connectionTimeout;
      connectionTimeout = null;
      if (timer === null) {return null;}
      try {
        runtimeTimers.clearTimeout(timer);
        return null;
      } catch (error) {
        localTimerCleanupFailure = recordRuntimeTeardownFailure(
          'The bridge connection timeout could not be cleared safely.',
          error,
        );
        return localTimerCleanupFailure;
      }
    };

    const finish = (connected: boolean): boolean => {
      if (settled) {return false;}
      settled = true;
      const cleanupFailures = [
        localTimerCleanupFailure,
        clearRegisterFallback(),
        clearConnectionTimeout(),
      ].filter((error): error is Error => error !== null);
      const admitted = connected && cleanupFailures.length === 0;
      if (connected && !admitted) {
        stopHeartbeat();
        closeSocket();
      }
      resolve(admitted);
      return admitted;
    };

    connectionTimeout = runtimeTimers.setTimeout(() => {
      connectionTimeout = null;
      if (settled) {return;}
      if (runId !== connectRunId) {
        const closed = closeHandle(handle);
        if (closed && socketHandle === handle) {socketHandle = null;}
        finish(false);
        return;
      }
      clearRegisterFallback();
      if (handshakeSent) {
        recordLocalConnectionDiagnostic({
          phase: 'hello-timeout',
          port,
          transport: handle?.type,
          message: `Socket opened on port ${port}, but the MCP bridge hello was not received.`,
          priority: 90,
        });
      } else if (authenticationStarted) {
        recordLocalConnectionDiagnostic({
          phase: 'hello-timeout',
          port,
          transport: handle?.type,
          message: `Socket opened on port ${port}, but mutual authentication did not complete.`,
          priority: 100,
        });
      } else if (handle?.type !== 'easyeda-register') {
        recordLocalConnectionDiagnostic({
          phase: 'socket-open-timeout',
          port,
          transport: handle?.type,
          message: `The ${handle?.type ?? 'WebSocket'} path did not open on port ${port}.`,
          priority: 50,
        });
      }
      const closed = closeHandle(handle);
      if (closed && socketHandle === handle) {
        socketHandle = null;
      }
      finish(false);
    }, timeoutMs);

    const startSocket = (options: CreateSocketOptions = {}): SocketHandle | null => {
      socketGeneration += 1;
      const generation = socketGeneration;
      socketOpened = false;
      authenticationStarted = false;
      handshakeSent = false;
      const authenticator = new BridgeMutualAuthenticator(authenticationKey());
      const reflectedAuthenticationFrames = new Set<string>();
      let messageSequence = Promise.resolve();
      let attemptHandle: SocketHandle | null = null;
      const isCurrentGeneration = (): boolean =>
        runId === connectRunId && generation === socketGeneration;
      const resolvedHandle = (): SocketHandle =>
        attemptHandle ?? { type: 'easyeda-register', id: socketId };

      try {
        attemptHandle = createSocket(
          socketId,
          url,
          () => {
            if (settled) {
              closeHandle(attemptHandle);
              return;
            }
            if (runId !== connectRunId) {
              const closed = closeHandle(attemptHandle);
              if (closed && socketHandle === attemptHandle) {socketHandle = null;}
              finish(false);
              return;
            }
            if (!isCurrentGeneration()) {
              closeHandle(attemptHandle);
              return;
            }
            socketOpened = true;
            clearRegisterFallback();
            socketHandle = resolvedHandle();
            authenticationStarted = true;
            const clientHello = JSON.stringify(authenticator.begin());
            reflectedAuthenticationFrames.add(clientHello);
            log('Local bridge socket opened; starting mutual authentication', {
              port,
              transport: socketHandle.type,
            });
            sendRaw(clientHello);
          },
          (data) => {
            if (runId !== connectRunId) {
              const closed = closeHandle(attemptHandle);
              if (closed && socketHandle === attemptHandle) {socketHandle = null;}
              finish(false);
              return;
            }
            if (!isCurrentGeneration()) {return;}
            messageSequence = messageSequence
              .then(async () => {
                if (!isCurrentGeneration()) {return;}
                if (reflectedAuthenticationFrames.delete(data)) {return;}
                if (!authenticator.isAuthenticated()) {
                  const value: unknown = JSON.parse(data);
                  const progress = await authenticator.receive(value);
                  if (progress.outbound !== undefined) {
                    const proof = JSON.stringify(progress.outbound);
                    reflectedAuthenticationFrames.add(proof);
                    sendRaw(proof);
                  }
                  if (
                    progress.authenticatedSessionId !== undefined &&
                    progress.authenticatedSessionId.length > 0
                  ) {
                    handshakeSent = true;
                    sendHandshake();
                  }
                  return;
                }
                const currentHandle = resolvedHandle();
                const binding: RequestConnectionBinding = {
                  handle: currentHandle,
                  runId,
                  socketGeneration: generation,
                };
                const messageType = handleMessage(
                  data,
                  connectionState === 'connected',
                  binding,
                );
                if (messageType === 'hello' && !settled) {
                  socketHandle = currentHandle;
                  connectedPort = port;
                  activeSocketGeneration = generation;
                  connectionState = 'connected';
                  reconnectAttempts = 0;
                  manualDisconnectRequested = false;
                  lastLocalConnectionDiagnostic = null;
                  startHeartbeat();
                  const admitted = finish(true);
                  if (showSuccessToast && admitted) {
                    showToast(`EasyEDA Pro Control Bridge connected to local server`);
                  }
                }
              })
              .catch((error: unknown) => {
                log('Bridge authentication or message error', error);
                const currentHandle = resolvedHandle();
                recordLocalConnectionDiagnostic({
                  phase: 'hello-timeout',
                  port,
                  transport: currentHandle.type,
                  message: `Mutual bridge authentication failed on port ${port}.`,
                  priority: 100,
                });
                if (
                  socketHandle === currentHandle &&
                  connectionState === 'connected'
                ) {
                  recoverConnection(
                    'The authenticated bridge sent an invalid application frame; reconnecting.',
                  );
                } else {
                  const closed = closeHandle(currentHandle);
                  if (closed && socketHandle === currentHandle) {
                    socketHandle = null;
                  }
                }
                finish(false);
              });
          },
          () => {
            if (runId !== connectRunId) {
              const currentHandle = resolvedHandle();
              if (socketHandle === currentHandle) {
                stopHeartbeat();
                socketHandle = null;
                unclosedSocketHandles.delete(currentHandle);
                connectedPort = null;
                activeSocketGeneration = 0;
                connectionState = 'disconnected';
              }
              finish(false);
              return;
            }
            if (!isCurrentGeneration()) {return;}
            clearRegisterFallback();
            const currentHandle = resolvedHandle();
            const wasActiveConnection =
              socketHandle === currentHandle && connectionState === 'connected';
            if (!settled) {
              recordLocalConnectionDiagnostic({
                phase: 'socket-closed',
                port,
                transport: currentHandle.type,
                message: `The ${currentHandle.type} path closed before the bridge handshake completed on port ${port}.`,
                priority: 60,
              });
            }
            if (socketHandle === currentHandle) {
              stopHeartbeat();
              socketHandle = null;
              unclosedSocketHandles.delete(currentHandle);
              connectedPort = null;
              activeSocketGeneration = 0;
              connectionState = 'disconnected';
            }
            if (!settled) {
              finish(false);
            }
            if (wasActiveConnection && !manualDisconnectRequested && runId === connectRunId) {
              scheduleReconnect();
            }
          },
          (error) => {
            if (runId !== connectRunId) {
              const currentHandle = resolvedHandle();
              const closed = closeHandle(currentHandle);
              if (closed && socketHandle === currentHandle) {socketHandle = null;}
              finish(false);
              return;
            }
            if (!isCurrentGeneration()) {return;}
            clearRegisterFallback();
            const currentHandle = resolvedHandle();
            recordLocalConnectionDiagnostic({
              phase: 'socket-error',
              port,
              transport: currentHandle.type,
              message: `The ${currentHandle.type} path failed on port ${port}: ${bridgeErrorMessage(error)}`,
              priority: 70,
            });
            if (socketHandle === currentHandle) {
              if (connectionState === 'connected') {
                recoverConnection('The authenticated bridge socket reported an error; reconnecting.');
              } else {
                const closed = closeHandle(currentHandle);
                if (closed && socketHandle === currentHandle) {
                  socketHandle = null;
                }
              }
            } else {
              closeHandle(currentHandle);
            }
            finish(false);
          },
          (createdHandle) => {
            attemptHandle = createdHandle;
            handle = createdHandle;
          },
          options,
        );
      } catch (error) {
        log('createSocket threw', error);
        closeHandle(attemptHandle);
        return null;
      }

      handle = attemptHandle;
      if (!attemptHandle) {
        recordLocalConnectionDiagnostic({
          phase: 'socket-api-unavailable',
          port,
          message: `No usable EasyEDA or browser WebSocket API was available for port ${port}.`,
          priority: 80,
        });
        return null;
      }

      if (!settled && attemptHandle.type === 'easyeda-register') {
        const registerHandle = attemptHandle;
        registerFallbackTimer = runtimeTimers.setTimeout(() => {
          if (settled || !isCurrentGeneration() || socketOpened) {return;}
          registerFallbackTimer = null;
          recordLocalConnectionDiagnostic({
            phase: 'register-open-timeout',
            port,
            transport: registerHandle.type,
            message:
              `SYS_WebSocket.register() accepted port ${port} but did not invoke its open callback; ` +
              'the extension closed that handle and tried a safe alternate socket API.',
            priority: 85,
          });
          if (!closeHandle(registerHandle)) {
            finish(false);
            return;
          }
          if (socketHandle === registerHandle) {socketHandle = null;}
          if (settled || !isCurrentGeneration()) {return;}

          const fallbackHandle = startSocket({ skipRegister: true });
          if (!fallbackHandle) {
            finish(false);
          }
        }, REGISTER_OPEN_CALLBACK_TIMEOUT_MS);
      }

      return attemptHandle;
    };

    handle = startSocket();
    if (!handle) {finish(false);}
  });
}

function cancelReconnectTimer(): Error | null {
  reconnectGeneration += 1;
  const timer = reconnectTimer;
  reconnectTimer = null;
  if (timer === null) {return null;}
  try {
    runtimeTimers.clearTimeout(timer);
    return null;
  } catch (error) {
    return recordRuntimeTeardownFailure(
      'The authenticated bridge reconnect timer could not be cleared safely.',
      error,
    );
  }
}

async function connectInternal(mode: ConnectMode = 'manual'): Promise<void> {
  const manual = mode === 'manual';

  if (runtimeRetired) {
    throw new Error('This authenticated bridge runtime was deactivated and cannot reconnect.');
  }
  if (socketTeardownFailure !== null) {
    throw new Error(
      `A prior authenticated bridge socket could not be closed safely: ${socketTeardownFailure}`,
    );
  }

  if (connectionState === 'connected' && connectedPort !== null) {
    if (manual) {
      showToast(`EasyEDA Pro Control Bridge already connected to local server`);
    }
    return;
  }

  if (connectionState === 'connecting' && activeConnectPromise) {
    if (!manual) {return activeConnectPromise;}

    // A manual Connect request should not remain trapped behind an auto-connect
    // Scan that may currently be waiting on another port. Cancel the old run and
    // Immediately restart from the preferred/base port.
    connectRunId += 1;
    activeConnectPromise = null;
    if (!closeSocket()) {
      throw new Error('The prior authenticated bridge connection could not be closed safely.');
    }
  }

  const reconnectCleanupFailure = cancelReconnectTimer();
  if (reconnectCleanupFailure !== null) {throw reconnectCleanupFailure;}

  manualDisconnectRequested = false;
  connectionState = 'connecting';
  lastLocalConnectionDiagnostic = null;
  connectRunId += 1;
  const runId = connectRunId;

  if (manual) {
    showToast(`EasyEDA Pro Control Bridge connecting to local server`);
  }

  activeConnectPromise = (async () => {
    try {
      const port = authenticatedBridgePort();
      if (runId !== connectRunId || manualDisconnectRequested) {return;}
      // The private build is compile-bound to one reviewed facade endpoint.
      // Scanning adjacent ports would expose challenge traffic to unrelated
      // Listeners and could let a different service win the connection race.
      const connected = await connectToPort(
        port,
        runId,
        true,
        PRIMARY_CONNECT_TIMEOUT_MS,
      );
      if (connected) {
        preferredPort = port;
      }
    } catch (error) {
      log('connect() threw unexpectedly', error);
    } finally {
      if (runId === connectRunId && !connectionIsEstablished()) {
        connectionState = 'disconnected';
        connectedPort = null;
        const message = `EasyEDA Pro Control Bridge offline: no local server found${localConnectionDiagnosticSuffix()}`;
        if (manual) {
          showToast(message);
        } else {
          log(message);
        }
        if (
          !manualDisconnectRequested &&
          socketTeardownFailure === null &&
          unclosedSocketHandles.size === 0 &&
          socketHandle === null
        ) {
          scheduleReconnect();
        }
      }

      if (runId === connectRunId) {
        activeConnectPromise = null;
      }
    }
  })();

  return activeConnectPromise;
}

function disconnectInternal(notifyUser: boolean): void {
  if (notifyUser) {void updateMenuTitle();}
  const wasDisconnected = connectionState === 'disconnected' && !socketHandle;
  const wasConnecting = connectionState === 'connecting';

  manualDisconnectRequested = true;
  connectRunId += 1;
  activeConnectPromise = null;
  reconnectAttempts = 0;
  const cleanupFailures: Error[] = [];
  const reconnectCleanupFailure = cancelReconnectTimer();
  if (reconnectCleanupFailure !== null) {
    cleanupFailures.push(reconnectCleanupFailure);
  }
  const heartbeatCleanupFailure = stopHeartbeat();
  if (heartbeatCleanupFailure !== null) {
    cleanupFailures.push(heartbeatCleanupFailure);
  }
  if (!closeSocket()) {
    cleanupFailures.push(
      new Error('The authenticated bridge socket could not be closed safely.'),
    );
  }
  if (
    socketTeardownFailure !== null ||
    unclosedSocketHandles.size > 0 ||
    cleanupFailures.length > 0
  ) {
    if (cleanupFailures.length === 0) {
      cleanupFailures.push(
        new Error(
          `Authenticated bridge teardown remains unproven: ${socketTeardownFailure ?? 'an unclosed socket handle remains'}.`,
        ),
      );
    }
    throw new Error(
      `The authenticated bridge runtime could not be disconnected safely: ${cleanupFailures.map((failure) => failure.message).join(' | ')}`,
    );
  }

  if (!notifyUser) {return;}
  if (wasDisconnected) {
    showToast('EasyEDA Pro Control Bridge already disconnected');
  } else if (wasConnecting) {
    showToast('EasyEDA Pro Control Bridge connection cancelled');
  } else {
    showToast(
      'EasyEDA Pro Control Bridge disconnected. Auto reconnect is paused until Connect.',
    );
  }
}

function disconnectCommandInternal(): void {
  disconnectInternal(true);
}

function showStatusInternal(): void {
  autoConnectEnabled = loadAutoConnectSetting();
  const autoLabel = autoConnectEnabled ? 'Auto-Connect: ON' : 'Auto-Connect: OFF';

  if (socketTeardownFailure !== null) {
    showToast(
      `EasyEDA Pro Control Bridge teardown failed; reload EasyEDA before reconnecting — ${socketTeardownFailure}`,
    );
    return;
  }

  if (connectionState === 'connected' && connectedPort !== null) {
    showToast(`EasyEDA Pro Control Bridge connected to local server | ${autoLabel}`);
    return;
  }

  if (connectionState === 'connecting') {
    showToast(`EasyEDA Pro Control Bridge connecting to local server | ${autoLabel}`);
    return;
  }

  if (autoConnectEnabled && !manualDisconnectRequested) {
    showToast(
      `EasyEDA Pro Control Bridge: waiting for server | ${autoLabel} — retrying (attempt ${reconnectAttempts + 1})`,
    );
    scheduleReconnect();
    return;
  }

  showToast(
    `EasyEDA Pro Control Bridge disconnected | ${autoLabel} — click Connect to connect${localConnectionDiagnosticSuffix()}`,
  );
}

function scheduleReconnect(): void {
  if (
    manualDisconnectRequested ||
    !autoConnectEnabled ||
    reconnectTimer ||
    runtimeRetired ||
    socketTeardownFailure !== null
  ) {return;}
  reconnectAttempts += 1;
  const delay = reconnectDelayMs(reconnectAttempts);
  reconnectGeneration += 1;
  const generation = reconnectGeneration;
  const scheduledLifecycleGeneration = lifecycleGeneration;
  let scheduledTimer: RuntimeTimerHandle | null = null;
  scheduledTimer = runtimeTimers.setTimeout(() => {
    if (reconnectTimer === scheduledTimer) {reconnectTimer = null;}
    if (
      generation !== reconnectGeneration ||
      scheduledLifecycleGeneration !== lifecycleGeneration
    ) {return;}
    if (
      connectionState === 'disconnected' &&
      !manualDisconnectRequested &&
      autoConnectEnabled &&
      !runtimeRetired &&
      socketTeardownFailure === null
    ) {
      void connectInternal('auto');
    }
  }, delay);
  reconnectTimer = scheduledTimer;
}

let autoConnectEnabled = true;

interface EasyedaStorageApi {
  getExtensionUserConfig?: (key: string) => unknown;
  setExtensionUserConfig?: (key: string, value: boolean) => unknown;
}

function getStorage(): EasyedaStorageApi | undefined {
  const value = readPath<unknown>(getGlobal(), 'sys_Storage');
  if (!isRecord(value)) {return undefined;}
  const getter = value.getExtensionUserConfig;
  const setter = value.setExtensionUserConfig;
  return {
    ...(typeof getter === 'function'
      ? {
          getExtensionUserConfig: (key: string): unknown => {
            const result: unknown = Reflect.apply(getter, value, [key]);
            return result;
          },
        }
      : {}),
    ...(typeof setter === 'function'
      ? {
          setExtensionUserConfig: (key: string, setting: boolean): unknown => {
            const result: unknown = Reflect.apply(setter, value, [key, setting]);
            return result;
          },
        }
      : {}),
  };
}

function loadAutoConnectSetting(): boolean {
  try {
    const storage = getStorage();
    if (storage?.getExtensionUserConfig !== undefined) {
      const val = storage.getExtensionUserConfig('autoConnect');
      if (val === true || val === false) {return val;}
      if (val !== undefined) {
        log('Ignoring malformed non-boolean autoConnect setting', {
          valueType: typeof val,
        });
        return false;
      }
    }
  } catch (error) {
    log('sys_Storage.getExtensionUserConfig unavailable', error);
  }
  return true;
}

async function saveAutoConnectSetting(value: boolean): Promise<void> {
  try {
    const storage = getStorage();
    if (storage?.setExtensionUserConfig !== undefined) {
      const saved = await storage.setExtensionUserConfig('autoConnect', value);
      if (saved === false) {
        log('sys_Storage.setExtensionUserConfig returned false');
      }
    }
  } catch (error) {
    log('sys_Storage.setExtensionUserConfig unavailable', error);
  }
}

async function updateMenuTitle(): Promise<void> {
  // EasyEDA Pro re-reads extension.json on every menu open; replaceHeaderMenus()
  // Cannot persist between opens. State is communicated via toast only.
  log(`menu state: Auto-Connect=${autoConnectEnabled}`);
}

async function setAutoConnectInternal(enabled: boolean): Promise<void> {
  if (runtimeRetired) {
    throw new Error('This authenticated bridge runtime was deactivated.');
  }
  // EasyEDA may evaluate or invoke a menu callback more than once. Setting an
  // Explicit target state is idempotent; a duplicate Enable call remains ON.
  autoConnectEnabled = enabled;
  await saveAutoConnectSetting(enabled);
  await updateMenuTitle();
  if (enabled) {
    const cleanupFailure = cancelReconnectTimer();
    if (cleanupFailure !== null) {throw cleanupFailure;}
    manualDisconnectRequested = false;
    reconnectAttempts = 0;
    if (connectionState === 'disconnected') {
      await connectInternal('auto');
    }
  } else {
    manualDisconnectRequested = true;
    const cleanupFailure = cancelReconnectTimer();
    if (cleanupFailure !== null) {throw cleanupFailure;}
  }
  showToast(
    enabled
      ? 'Auto-Connect: ON — will reconnect automatically'
      : 'Auto-Connect: OFF — use Connect button to connect',
  );
}

async function enableAutoConnectInternal(): Promise<void> {
  await setAutoConnectInternal(true);
}

async function disableAutoConnectInternal(): Promise<void> {
  await setAutoConnectInternal(false);
}

async function toggleAutoConnectInternal(): Promise<void> {
  await setAutoConnectInternal(!loadAutoConnectSetting());
}

let activationStarted = false;

async function handleActivate(): Promise<void> {
  if (runtimeRetired) {
    throw new Error('This authenticated bridge runtime was deactivated.');
  }
  autoConnectEnabled = loadAutoConnectSetting();
  if (activationStarted) {
    if (autoConnectEnabled && connectionState === 'disconnected' && !activeConnectPromise) {
      void connectInternal('auto');
    }
    return;
  }

  lifecycleGeneration += 1;
  const cleanupFailure = cancelReconnectTimer();
  if (cleanupFailure !== null) {throw cleanupFailure;}
  activationStarted = true;
  if (autoConnectEnabled) {
    showToast(`EasyEDA Pro Control Bridge: Auto-Connect ON — scanning local server`);
    void connectInternal('auto');
  } else {
    showToast('EasyEDA Pro Control Bridge: Auto-Connect OFF — click Connect to connect');
  }
}

async function activateInternal(_status?: 'onStartupFinished', _arg?: string): Promise<void> {
  await handleActivate();
}

function deactivateInternal(): void {
  if (runtimeRetirementFailure !== null) {
    throw new Error(
      `Authenticated bridge retirement previously failed and remains unproven: ${runtimeRetirementFailure.message}`,
    );
  }
  if (runtimeRetired) {return;}
  activationStarted = false;
  lifecycleGeneration += 1;
  disconnectInternal(false);
  runtimeRetired = true;
  try {
    revokeExposedControls();
    const globalScope: object = globalThis;
    const existing: unknown = Reflect.get(globalScope, AUTHENTICATED_RUNTIME_KEY);
    if (
      isAuthenticatedPersistentRuntime(existing) &&
      existing.deactivate === deactivateInternal
    ) {
      const ownership: unknown = Reflect.get(
        globalScope,
        AUTHENTICATED_RUNTIME_OWNERSHIP_KEY,
      );
      if (
        !isAuthenticatedRuntimeOwnership(ownership) ||
        ownership.runtime !== existing
      ) {
        throw new Error(
          'The authenticated bridge runtime ownership record no longer proves exact ownership.',
        );
      }
      if (
        !Reflect.deleteProperty(globalScope, AUTHENTICATED_RUNTIME_OWNERSHIP_KEY) ||
        Object.prototype.hasOwnProperty.call(
          globalScope,
          AUTHENTICATED_RUNTIME_OWNERSHIP_KEY,
        )
      ) {
        throw new Error(
          'The authenticated bridge runtime ownership record could not be removed.',
        );
      }
      if (!Reflect.deleteProperty(globalScope, AUTHENTICATED_RUNTIME_KEY)) {
        throw new Error('The authenticated bridge runtime record could not be removed.');
      }
    }
  } catch (error) {
    runtimeRetirementFailure = new Error(
      `Authenticated bridge retirement could not revoke every owned capability: ${bridgeErrorMessage(error)}`,
    );
    throw runtimeRetirementFailure;
  }
}

function ownedControlBindings(): readonly (readonly [string, unknown])[] {
  return [
    ['activate', activateInternal],
    ['connect', connectInternal],
    ['deactivate', deactivateInternal],
    ['disableAutoConnect', disableAutoConnectInternal],
    ['disconnect', disconnectCommandInternal],
    ['enableAutoConnect', enableAutoConnectInternal],
    ['showStatus', showStatusInternal],
    ['toggleAutoConnect', toggleAutoConnectInternal],
  ];
}

function revokeExposedControls(): void {
  const targets: object[] = [globalThis];
  const easyedaApi = getGlobal();
  if (easyedaApi !== null && easyedaApi !== globalThis) {
    targets.push(easyedaApi);
  }
  for (const target of targets) {
    for (const [name, binding] of ownedControlBindings()) {
      if (
        Reflect.get(target, name) === binding &&
        !Reflect.deleteProperty(target, name)
      ) {
        throw new Error(`The deactivated bridge could not revoke its ${name} control.`);
      }
    }
  }
}

interface PersistentRuntime {
  readonly authenticatedRuntimeMarker: typeof AUTHENTICATED_RUNTIME_MARKER;
  readonly authenticatedIndexBuildId: string;
  readonly authenticationKeySha256: string;
  readonly activate: typeof activateInternal;
  readonly deactivate: typeof deactivateInternal;
  readonly connect: typeof connectInternal;
  readonly disconnect: typeof disconnectCommandInternal;
  readonly showStatus: typeof showStatusInternal;
  readonly enableAutoConnect: typeof enableAutoConnectInternal;
  readonly disableAutoConnect: typeof disableAutoConnectInternal;
  readonly toggleAutoConnect: typeof toggleAutoConnectInternal;
}

interface AuthenticatedRuntimeOwnership {
  readonly authenticatedRuntimeOwnershipMarker:
    typeof AUTHENTICATED_RUNTIME_OWNERSHIP_MARKER;
  readonly dispatchCoordinator: DispatchCoordinator;
  readonly runtime: PersistentRuntime;
}

const AUTHENTICATED_RUNTIME_KEY =
  '__easyedaProControlAuthenticatedBridgeRuntime_v1__';
const AUTHENTICATED_RUNTIME_MARKER =
  'easyeda-pro-control.authenticated-bridge-runtime.v1' as const;
const AUTHENTICATED_RUNTIME_OWNERSHIP_MARKER =
  'easyeda-pro-control.authenticated-bridge-runtime-ownership.v1' as const;
const AUTHENTICATED_RUNTIME_OWNERSHIP_PREFIX =
  '__easyedaProControlAuthenticatedBridgeRuntimeOwnership_v1__';
const LEGACY_RUNTIME_KEY = '__easyedaMcpProBridgeRuntime_v8__';
const LEGACY_EXTERNAL_CONTROL_SUFFIX = ['Rem', 'ote', 'Rel', 'ay'].join('');
const LEGACY_EXTERNAL_CONTROL_GLOBALS = [
  `connect${LEGACY_EXTERNAL_CONTROL_SUFFIX}`,
  `disconnect${LEGACY_EXTERNAL_CONTROL_SUFFIX}`,
  `show${LEGACY_EXTERNAL_CONTROL_SUFFIX}Status`,
] as const;

function isAuthenticatedPersistentRuntime(value: unknown): value is PersistentRuntime {
  return (
    isRecord(value) &&
    Object.isFrozen(value) &&
    value.authenticatedRuntimeMarker === AUTHENTICATED_RUNTIME_MARKER &&
    typeof value.authenticatedIndexBuildId === 'string' &&
    typeof value.authenticationKeySha256 === 'string' &&
    typeof value.activate === 'function' &&
    typeof value.deactivate === 'function' &&
    typeof value.connect === 'function' &&
    typeof value.disconnect === 'function' &&
    typeof value.showStatus === 'function' &&
    typeof value.enableAutoConnect === 'function' &&
    typeof value.disableAutoConnect === 'function' &&
    typeof value.toggleAutoConnect === 'function'
  );
}

function isThenable(value: unknown): boolean {
  if (
    (typeof value !== 'object' || value === null) &&
    typeof value !== 'function'
  ) {
    return false;
  }
  return typeof Reflect.get(value, 'then') === 'function';
}

function isAuthenticatedRuntimeOwnership(
  value: unknown,
): value is AuthenticatedRuntimeOwnership {
  return (
    isRecord(value) &&
    Object.isFrozen(value) &&
    value.authenticatedRuntimeOwnershipMarker ===
      AUTHENTICATED_RUNTIME_OWNERSHIP_MARKER &&
    isRecord(value.dispatchCoordinator) &&
    Object.isFrozen(value.dispatchCoordinator) &&
    value.dispatchCoordinator.marker ===
      'easyeda-pro-control.bridge-dispatch-coordinator.v1' &&
    typeof value.dispatchCoordinator.enqueue === 'function' &&
    isAuthenticatedPersistentRuntime(value.runtime)
  );
}

function currentAuthenticatedRuntimeIdentity(): {
  readonly authenticatedIndexBuildId: string;
  readonly authenticationKeySha256: string;
} {
  const authenticatedIndexBuildId =
    typeof __MCP_AUTHENTICATED_INDEX_BUILD_ID__ !== 'undefined'
      ? __MCP_AUTHENTICATED_INDEX_BUILD_ID__
      : undefined;
  const authenticationKeySha256 =
    typeof __MCP_AUTHENTICATION_KEY_SHA256__ !== 'undefined'
      ? __MCP_AUTHENTICATION_KEY_SHA256__
      : undefined;
  if (
    typeof authenticatedIndexBuildId !== 'string' ||
    !/^i[A-Za-z0-9_-]{43}$/u.test(authenticatedIndexBuildId)
  ) {
    throw new Error(
      'This bridge was not built with an authenticated index-bundle identity.',
    );
  }
  if (
    typeof authenticationKeySha256 !== 'string' ||
    !/^[0-9a-f]{64}$/u.test(authenticationKeySha256)
  ) {
    throw new Error(
      'This bridge was not built with an authentication credential epoch.',
    );
  }
  return Object.freeze({
    authenticatedIndexBuildId,
    authenticationKeySha256,
  });
}

const AUTHENTICATED_RUNTIME_IDENTITY = currentAuthenticatedRuntimeIdentity();
const AUTHENTICATED_RUNTIME_OWNERSHIP_KEY =
  `${AUTHENTICATED_RUNTIME_OWNERSHIP_PREFIX}${AUTHENTICATED_RUNTIME_IDENTITY.authenticatedIndexBuildId}_${AUTHENTICATED_RUNTIME_IDENTITY.authenticationKeySha256}`;

function authenticatedRuntimeOwnershipKey(
  runtime: PersistentRuntime,
): string | undefined {
  if (
    !/^i[A-Za-z0-9_-]{43}$/u.test(runtime.authenticatedIndexBuildId) ||
    !/^[0-9a-f]{64}$/u.test(runtime.authenticationKeySha256)
  ) {
    return undefined;
  }
  return `${AUTHENTICATED_RUNTIME_OWNERSHIP_PREFIX}${runtime.authenticatedIndexBuildId}_${runtime.authenticationKeySha256}`;
}

function isExactAuthenticatedPersistentRuntime(
  value: unknown,
  ownership: unknown,
): value is PersistentRuntime {
  return (
    isAuthenticatedPersistentRuntime(value) &&
    value.authenticatedIndexBuildId ===
      AUTHENTICATED_RUNTIME_IDENTITY.authenticatedIndexBuildId &&
    value.authenticationKeySha256 ===
      AUTHENTICATED_RUNTIME_IDENTITY.authenticationKeySha256 &&
    isAuthenticatedRuntimeOwnership(ownership) &&
    ownership.runtime === value
  );
}

function invokeRuntimeCleanup(
  runtime: Record<string, unknown>,
  method: string,
  runtimeLabel: string,
): void {
  const cleanup = runtime[method];
  if (typeof cleanup !== 'function') {
    throw new TypeError(
      `${runtimeLabel} does not expose callable ${method}; refusing to install a replacement control runtime.`,
    );
  }
  try {
    const result: unknown = Reflect.apply(cleanup, runtime, []);
    if (isThenable(result)) {
      void Promise.resolve(result).catch((error: unknown) => {
        log(`${runtimeLabel} ${method} rejected after fail-closed retirement`, error);
      });
      throw new Error(
        `${runtimeLabel} ${method} returned an asynchronous result whose completion cannot be proven.`,
      );
    }
    if (result !== undefined && result !== true) {
      throw new Error(
        `${runtimeLabel} ${method} did not synchronously confirm successful cleanup.`,
      );
    }
  } catch (error) {
    throw new Error(
      `${runtimeLabel} ${method} failed; refusing to install a replacement control runtime: ${String(error)}`,
    );
  }
}

function removeLegacyExternalControlGlobals(globalScope: object): void {
  const easyedaScope = getGlobal();
  const targets = easyedaScope && easyedaScope !== globalScope
    ? [globalScope, easyedaScope]
    : [globalScope];
  for (const name of LEGACY_EXTERNAL_CONTROL_GLOBALS) {
    for (const target of targets) {
      if (
        !Reflect.deleteProperty(target, name) ||
        Object.prototype.hasOwnProperty.call(target, name)
      ) {
        throw new Error(
          `The unauthenticated legacy bridge control ${name} could not be removed.`,
        );
      }
    }
  }
}

function retireLegacyRuntime(globalScope: object): void {
  const legacy: unknown = Reflect.get(globalScope, LEGACY_RUNTIME_KEY);
  if (isRecord(legacy)) {
    invokeRuntimeCleanup(legacy, 'disconnect', 'Legacy bridge');
    invokeRuntimeCleanup(legacy, 'deactivate', 'Legacy bridge');
  }
  Reflect.deleteProperty(globalScope, LEGACY_RUNTIME_KEY);
  removeLegacyExternalControlGlobals(globalScope);
  if (Object.prototype.hasOwnProperty.call(globalScope, LEGACY_RUNTIME_KEY)) {
    throw new Error('The unauthenticated legacy bridge runtime could not be removed.');
  }
}

function retireAuthenticatedRuntime(
  globalScope: object,
  runtime: unknown,
): void {
  if (runtime !== undefined) {
    if (!isRecord(runtime)) {
      throw new Error(
        'The stale authenticated bridge runtime is malformed; refusing to install a replacement control runtime.',
      );
    }
    invokeRuntimeCleanup(runtime, 'disconnect', 'Stale authenticated bridge');
    invokeRuntimeCleanup(runtime, 'deactivate', 'Stale authenticated bridge');
  }
  const ownershipKey = isAuthenticatedPersistentRuntime(runtime)
    ? authenticatedRuntimeOwnershipKey(runtime)
    : undefined;
  if (
    ownershipKey !== undefined &&
    !Reflect.deleteProperty(globalScope, ownershipKey)
  ) {
    throw new Error(
      'The stale authenticated bridge runtime ownership record could not be removed.',
    );
  }
  if (
    ownershipKey !== AUTHENTICATED_RUNTIME_OWNERSHIP_KEY &&
    !Reflect.deleteProperty(globalScope, AUTHENTICATED_RUNTIME_OWNERSHIP_KEY)
  ) {
    throw new Error(
      'The stale authenticated bridge runtime ownership record could not be removed.',
    );
  }
  if (
    Object.prototype.hasOwnProperty.call(
      globalScope,
      AUTHENTICATED_RUNTIME_OWNERSHIP_KEY,
    )
  ) {
    throw new Error(
      'The stale authenticated bridge runtime ownership record could not be removed.',
    );
  }
  if (
    ownershipKey !== undefined &&
    Object.prototype.hasOwnProperty.call(globalScope, ownershipKey)
  ) {
    throw new Error(
      'The stale authenticated bridge runtime retained its exact ownership record.',
    );
  }
  if (!Reflect.deleteProperty(globalScope, AUTHENTICATED_RUNTIME_KEY)) {
    throw new Error('The stale authenticated bridge runtime could not be removed.');
  }
  if (Object.prototype.hasOwnProperty.call(globalScope, AUTHENTICATED_RUNTIME_KEY)) {
    throw new Error('The stale authenticated bridge runtime could not be removed.');
  }
}

function getPersistentRuntime(): PersistentRuntime {
  const globalScope: object = globalThis;
  retireLegacyRuntime(globalScope);
  const existing: unknown = Reflect.get(globalScope, AUTHENTICATED_RUNTIME_KEY);
  const existingOwnershipKey = isAuthenticatedPersistentRuntime(existing)
    ? authenticatedRuntimeOwnershipKey(existing)
    : undefined;
  const ownership: unknown =
    existingOwnershipKey === undefined
      ? undefined
      : Reflect.get(globalScope, existingOwnershipKey);
  if (isExactAuthenticatedPersistentRuntime(existing, ownership)) {return existing;}
  if (
    isAuthenticatedRuntimeOwnership(ownership) &&
    ownership.runtime === existing
  ) {
    dispatchCoordinator = ownership.dispatchCoordinator;
  }
  retireAuthenticatedRuntime(globalScope, existing);

  const runtime = Object.freeze<PersistentRuntime>({
    authenticatedRuntimeMarker: AUTHENTICATED_RUNTIME_MARKER,
    authenticatedIndexBuildId:
      AUTHENTICATED_RUNTIME_IDENTITY.authenticatedIndexBuildId,
    authenticationKeySha256:
      AUTHENTICATED_RUNTIME_IDENTITY.authenticationKeySha256,
    activate: activateInternal,
    deactivate: deactivateInternal,
    connect: connectInternal,
    disconnect: disconnectCommandInternal,
    showStatus: showStatusInternal,
    enableAutoConnect: enableAutoConnectInternal,
    disableAutoConnect: disableAutoConnectInternal,
    toggleAutoConnect: toggleAutoConnectInternal,
  });
  const runtimeOwnership = Object.freeze<AuthenticatedRuntimeOwnership>({
    authenticatedRuntimeOwnershipMarker:
      AUTHENTICATED_RUNTIME_OWNERSHIP_MARKER,
    dispatchCoordinator,
    runtime,
  });
  Object.defineProperty(globalScope, AUTHENTICATED_RUNTIME_OWNERSHIP_KEY, {
    configurable: true,
    enumerable: false,
    value: runtimeOwnership,
    writable: false,
  });
  Object.defineProperty(globalScope, AUTHENTICATED_RUNTIME_KEY, {
    configurable: true,
    enumerable: false,
    value: runtime,
    writable: false,
  });
  return runtime;
}

const persistentRuntime = getPersistentRuntime();

export async function activate(status?: 'onStartupFinished', arg?: string): Promise<void> {
  await persistentRuntime.activate(status, arg);
}

export function deactivate(): void {
  persistentRuntime.deactivate();
}

export async function connect(mode: ConnectMode = 'manual'): Promise<void> {
  await persistentRuntime.connect(mode);
}

export function disconnect(): void {
  persistentRuntime.disconnect();
}

export function showStatus(): void {
  persistentRuntime.showStatus();
}

export async function enableAutoConnect(): Promise<void> {
  await persistentRuntime.enableAutoConnect();
}

export async function disableAutoConnect(): Promise<void> {
  await persistentRuntime.disableAutoConnect();
}

export async function toggleAutoConnect(): Promise<void> {
  await persistentRuntime.toggleAutoConnect();
}

function publishOwnedControl(
  target: object,
  name: string,
  binding: unknown,
): void {
  if (!Reflect.set(target, name, binding) || Reflect.get(target, name) !== binding) {
    throw new Error(
      `The authenticated bridge could not publish its exact ${name} control.`,
    );
  }
}

function expose(): void {
  const easyedaApi = getGlobal();
  const targets: object[] = easyedaApi !== null && easyedaApi !== globalThis
    ? [easyedaApi, globalThis]
    : [globalThis];
  try {
    const bindings: readonly (readonly [string, unknown])[] = [
      ['activate', persistentRuntime.activate],
      ['connect', persistentRuntime.connect],
      ['deactivate', persistentRuntime.deactivate],
      ['disableAutoConnect', persistentRuntime.disableAutoConnect],
      ['disconnect', persistentRuntime.disconnect],
      ['enableAutoConnect', persistentRuntime.enableAutoConnect],
      ['showStatus', persistentRuntime.showStatus],
      ['toggleAutoConnect', persistentRuntime.toggleAutoConnect],
    ];
    for (const target of targets) {
      for (const [name, binding] of bindings) {
        publishOwnedControl(target, name, binding);
      }
    }
  } catch (publicationError) {
    try {
      persistentRuntime.deactivate();
    } catch (retirementError) {
      throw new Error(
        `Authenticated bridge control publication failed (${bridgeErrorMessage(publicationError)}) and fail-closed retirement also failed (${bridgeErrorMessage(retirementError)}).`,
      );
    }
    throw publicationError;
  }
}

expose();
log('Extension script loaded');
// Compute the method-list hash early so the first handshake can include it.
// oxlint-disable-next-line unicorn/prefer-top-level-await -- EasyEDA imports this ES2020 IIFE; top-level await is unavailable in that output format.
void refreshMethodListHash();

// EasyEDA appends activate('onStartupFinished') after evaluating this bundle.
// The exported activate function above starts the connection only after the
// Extension runtime (including sys_Timer and sys_WebSocket) is ready.
