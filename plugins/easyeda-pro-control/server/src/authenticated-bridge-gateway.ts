import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import type { IncomingMessage } from "node:http";
import { createServer } from "node:net";
import type { Server, Socket } from "node:net";

import WebSocketClient, { WebSocketServer } from "ws";
import type { RawData } from "ws";

import {
  assertBackendConnectionOwnedByProcess,
  captureBackendProcessAuthority,
} from "./backend-listener-authority.ts";
import type { BackendProcessAuthority } from "./backend-listener-authority.ts";

export const BRIDGE_AUTHENTICATION_PROTOCOL =
  "easyeda-pro-control.bridge-auth.v1";

const AUTHENTICATION_FRAME_MAXIMUM_BYTES = 2048;
const AUTHENTICATION_TIMEOUT_MS = 5000;
const PENDING_AUTHENTICATION_CONTEXT_LIMIT = 8;
const NONCE_BYTES = 32;
const NONCE_BASE64URL_LENGTH = 43;
const REPLAY_CACHE_MAXIMUM_ENTRIES = 4096;
const REPLAY_CACHE_TTL_MS = 10 * 60 * 1000;
const CLOSED_SESSION_HISTORY_LIMIT = 256;
const LOOPBACK_HOST = "127.0.0.1";
const UPSTREAM_BRIDGE_CONTRACT_VERSION = 1;
const UPSTREAM_BRIDGE_PROTOCOL_VERSION = "1.0.0";
const UPSTREAM_AGGREGATE_PAYLOAD_MULTIPLIER = 8;
const NORMAL_CLOSE_CODE = 1000;
const POLICY_CLOSE_CODE = 4008;
const PROTOCOL_CLOSE_CODE = 4007;
const WEBSOCKET_CLOSE_GRACE_MS = 250;

const websocketCloseTimers = new WeakMap<
  WebSocketClient,
  ReturnType<typeof setTimeout>
>();

type AuthenticationRole =
  | "server-challenge"
  | "client-proof"
  | "server-accepted";

type ConnectionPhase =
  | "awaiting-client-hello"
  | "awaiting-client-proof"
  | "connecting-backend"
  | "awaiting-upstream-handshake"
  | "awaiting-upstream-hello"
  | "proxying"
  | "closed";

export interface AuthenticatedBridgeSession {
  readonly authenticatedAtEpochMs: number;
  readonly authenticationReceiptSha256: string;
  readonly sequence: number;
  readonly sessionId: string;
}

export interface ClosedAuthenticatedBridgeSession
  extends AuthenticatedBridgeSession {
  readonly closeReason: string;
  readonly closedAtEpochMs: number;
}

export interface AuthenticatedBridgeSessionLifecycle {
  readonly activeSession: AuthenticatedBridgeSession | null;
  readonly gatewayInstanceId: string;
  readonly publicEndpoint: {
    readonly host: typeof LOOPBACK_HOST;
    readonly port: number;
  };
  readonly recentClosedSessions: readonly ClosedAuthenticatedBridgeSession[];
  readonly schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1";
}

export interface BridgeDispatchLeaseBinding {
  readonly begunAtEpochMs: number;
  readonly bindingReceipt: string;
  readonly gatewayInstanceId: string;
  readonly leaseId: string;
  readonly schema: "easyeda-pro-control.bridge-dispatch-lease.v1";
  readonly sessionId: string;
  readonly sessionSequence: number;
}

export type BridgeDispatchAbortOutcome =
  | "not-dispatched"
  | "ambiguous-after-dispatch";

export interface BridgeDispatchAbortResult {
  readonly released: boolean;
  readonly retainedUntilSessionClose: boolean;
}

export interface AuthenticatedBridgeGatewayOptions {
  readonly authenticationKey: string;
  readonly authenticationTimeoutMs?: number;
  readonly backendHost: typeof LOOPBACK_HOST;
  readonly backendPort: number;
  readonly backendSessionToken: string;
  readonly expectedAuthenticatedIndexBuildId: string;
  readonly expectedAuthenticationKeySha256: string;
  readonly maximumPayloadBytes: number;
  readonly now?: () => number;
  readonly publicHost: typeof LOOPBACK_HOST;
  readonly publicPort: number;
  readonly randomSource?: (size: number) => Uint8Array;
}

interface ConnectionContext {
  backend: WebSocketClient | null;
  clientNonce: string | null;
  readonly clientSocket: WebSocketClient;
  phase: ConnectionPhase;
  proxyEstablished: boolean;
  requestedCloseReason: string | null;
  serverNonce: string | null;
  session: AuthenticatedBridgeSession | null;
  timeout: ReturnType<typeof setTimeout> | null;
}

interface DispatchLeaseState {
  readonly binding: BridgeDispatchLeaseBinding;
  readonly context: ConnectionContext;
  releaseOnSessionClose: boolean;
}

interface ClientHello {
  readonly clientNonce: string;
  readonly protocol: typeof BRIDGE_AUTHENTICATION_PROTOCOL;
  readonly type: "auth.client_hello";
}

interface ClientProof {
  readonly clientNonce: string;
  readonly clientProof: string;
  readonly protocol: typeof BRIDGE_AUTHENTICATION_PROTOCOL;
  readonly serverNonce: string;
  readonly type: "auth.client_proof";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertCompatibleUpstreamHello(
  value: Record<string, unknown>,
  maximumPayloadBytes: number,
): void {
  const supportedProtocolVersions = value["supportedProtocolVersions"];
  const hotSwapEnabled = value["hotSwapEnabled"];
  const expectedAggregatePayloadBytes =
    maximumPayloadBytes * UPSTREAM_AGGREGATE_PAYLOAD_MULTIPLIER;
  if (
    value["contractVersion"] !== UPSTREAM_BRIDGE_CONTRACT_VERSION ||
    !Array.isArray(supportedProtocolVersions) ||
    supportedProtocolVersions.length !== 1 ||
    supportedProtocolVersions[0] !== UPSTREAM_BRIDGE_PROTOCOL_VERSION ||
    value["maxPayloadSize"] !== maximumPayloadBytes ||
    value["supportsChunking"] !== true ||
    !Number.isSafeInteger(expectedAggregatePayloadBytes) ||
    value["maxAggregatePayloadSize"] !== expectedAggregatePayloadBytes ||
    (hotSwapEnabled !== undefined && hotSwapEnabled !== false)
  ) {
    throw new Error(
      "The private backend hello does not match the exact reviewed bridge contract, protocol, or payload policy.",
    );
  }
}

function exactKeys(
  record: object,
  expected: readonly string[],
): boolean {
  const actual = Object.keys(record).toSorted();
  return JSON.stringify(actual) === JSON.stringify([...expected].toSorted());
}

function assertBase64UrlSecret(value: string, label: string): void {
  if (
    Buffer.byteLength(value, "utf8") < 32 ||
    Buffer.byteLength(value, "utf8") > 256 ||
    !/^[A-Za-z0-9_-]+$/u.test(value)
  ) {
    throw new Error(`${label} must be a 32-256 byte base64url value.`);
  }
}

function validNonce(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length === NONCE_BASE64URL_LENGTH &&
    /^[A-Za-z0-9_-]+$/u.test(value)
  );
}

function validMac(value: unknown): value is string {
  return validNonce(value);
}

export function bridgeAuthenticationTranscript(
  role: AuthenticationRole,
  clientNonce: string,
  serverNonce: string,
  sessionId = "",
  clientProof = "",
): string {
  return JSON.stringify([
    BRIDGE_AUTHENTICATION_PROTOCOL,
    role,
    clientNonce,
    serverNonce,
    sessionId,
    clientProof,
  ]);
}

export function computeBridgeAuthenticationMac(
  authenticationKey: string,
  role: AuthenticationRole,
  clientNonce: string,
  serverNonce: string,
  sessionId = "",
  clientProof = "",
): string {
  return createHmac("sha256", authenticationKey)
    .update(
      bridgeAuthenticationTranscript(
        role,
        clientNonce,
        serverNonce,
        sessionId,
        clientProof,
      ),
      "utf8",
    )
    .digest("base64url");
}

function macMatches(expected: string, actual: string): boolean {
  if (!validMac(actual)) {
    return false;
  }
  const expectedBytes = Buffer.from(expected, "base64url");
  const actualBytes = Buffer.from(actual, "base64url");
  return (
    expectedBytes.length === actualBytes.length &&
    timingSafeEqual(expectedBytes, actualBytes)
  );
}

function dispatchLeaseTranscript(
  gatewayInstanceId: string,
  leaseId: string,
  sessionId: string,
  sessionSequence: number,
  begunAtEpochMs: number,
): string {
  return JSON.stringify([
    BRIDGE_AUTHENTICATION_PROTOCOL,
    "dispatch-lease",
    gatewayInstanceId,
    leaseId,
    sessionId,
    sessionSequence,
    begunAtEpochMs,
  ]);
}

function parseClientHello(text: string): ClientHello {
  const value: unknown = JSON.parse(text);
  if (
    !isRecord(value) ||
    !exactKeys(value, ["clientNonce", "protocol", "type"]) ||
    value["type"] !== "auth.client_hello" ||
    value["protocol"] !== BRIDGE_AUTHENTICATION_PROTOCOL ||
    !validNonce(value["clientNonce"])
  ) {
    throw new Error("The first frame is not a strict bridge client hello.");
  }
  return {
    clientNonce: value["clientNonce"],
    protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
    type: "auth.client_hello",
  };
}

function parseClientProof(text: string): ClientProof {
  const value: unknown = JSON.parse(text);
  if (
    !isRecord(value) ||
    !exactKeys(value, [
      "clientNonce",
      "clientProof",
      "protocol",
      "serverNonce",
      "type",
    ]) ||
    value["type"] !== "auth.client_proof" ||
    value["protocol"] !== BRIDGE_AUTHENTICATION_PROTOCOL ||
    !validNonce(value["clientNonce"]) ||
    !validNonce(value["serverNonce"]) ||
    !validMac(value["clientProof"])
  ) {
    throw new Error("The frame is not a strict bridge client proof.");
  }
  return {
    clientNonce: value["clientNonce"],
    clientProof: value["clientProof"],
    protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
    serverNonce: value["serverNonce"],
    type: "auth.client_proof",
  };
}

function rawDataBytes(data: RawData): Buffer {
  if (Buffer.isBuffer(data)) {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }
  if (Array.isArray(data)) {
    return Buffer.concat(data);
  }
  throw new TypeError("Unsupported WebSocketClient frame storage.");
}

function strictUtf8(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function randomBase64Url(
  source: (size: number) => Uint8Array,
): string {
  const bytes = source(NONCE_BYTES);
  if (bytes.byteLength !== NONCE_BYTES) {
    throw new Error("The bridge random source returned the wrong byte count.");
  }
  return Buffer.from(bytes).toString("base64url");
}

function validPort(value: number, allowZero: boolean): boolean {
  return (
    Number.isSafeInteger(value) &&
    value >= (allowZero ? 0 : 1) &&
    value <= 65_535
  );
}

function closeWebSocket(socket: WebSocketClient, code: number, reason: string): void {
  if (socket.readyState === WebSocketClient.OPEN) {
    socket.close(code, reason.slice(0, 120));
  } else if (socket.readyState === WebSocketClient.CONNECTING) {
    socket.terminate();
    return;
  }
  if (
    socket.readyState !== WebSocketClient.CLOSED &&
    !websocketCloseTimers.has(socket)
  ) {
    const timer = setTimeout(() => {
      websocketCloseTimers.delete(socket);
      if (socket.readyState !== WebSocketClient.CLOSED) {
        socket.terminate();
      }
    }, WEBSOCKET_CLOSE_GRACE_MS);
    timer.unref();
    websocketCloseTimers.set(socket, timer);
    socket.once("close", () => {
      const activeTimer = websocketCloseTimers.get(socket);
      if (activeTimer !== undefined) {
        clearTimeout(activeTimer);
        websocketCloseTimers.delete(socket);
      }
    });
  }
}

function waitForNetServerListening(server: Server): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const onError = (error: Error): void => {
      reject(error);
    };
    const onListening = (): void => {
      server.off("error", onError);
      resolve();
    };
    server.once("listening", onListening);
    server.once("error", onError);
  });
}

function waitForWebSocketServerListening(server: WebSocketServer): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const onError = (error: Error): void => {
      reject(error);
    };
    const onListening = (): void => {
      server.off("error", onError);
      resolve();
    };
    server.once("listening", onListening);
    server.once("error", onError);
  });
}

function errorCode(value: unknown): string | undefined {
  return value !== null &&
    typeof value === "object" &&
    "code" in value &&
    typeof value.code === "string"
    ? value.code
    : undefined;
}

function closeWebSocketServer(server: WebSocketServer): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      for (const socket of server.clients) {
        socket.terminate();
      }
      reject(new Error("Authenticated bridge server close exceeded its bound."));
    }, 2000);
    timeout.unref();
    try {
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- ws exposes callback completion and callback failure; there is no promise overload.
      server.close((error?: Error) => {
        clearTimeout(timeout);
        if (error === undefined || errorCode(error) === "ERR_SERVER_NOT_RUNNING") {
          resolve();
        } else {
          reject(error);
        }
      });
    } catch (error) {
      clearTimeout(timeout);
      reject(
        error instanceof Error
          ? error
          : new Error("Authenticated bridge server close threw a non-error.", {
              cause: error,
            }),
      );
    }
  });
}

export async function allocatePrivateLoopbackPort(): Promise<number> {
  const reservation = createServer();
  reservation.unref();
  reservation.listen({ exclusive: true, host: LOOPBACK_HOST, port: 0 });
  try {
    await waitForNetServerListening(reservation);
    const address = reservation.address();
    if (address === null || typeof address === "string") {
      throw new Error("The private bridge port reservation has no TCP address.");
    }
    return address.port;
  } finally {
    await new Promise<void>((resolve) => {
      reservation.close(() => {
        resolve();
      });
    });
  }
}

export class AuthenticatedBridgeGateway {
  readonly #authenticationKey: string;
  readonly #authenticationTimeoutMs: number;
  readonly #backendHost: typeof LOOPBACK_HOST;
  readonly #backendPort: number;
  readonly #backendSessionToken: string;
  readonly #expectedAuthenticatedIndexBuildId: string;
  readonly #expectedAuthenticationKeySha256: string;
  readonly #gatewayInstanceId: string;
  readonly #maximumPayloadBytes: number;
  readonly #now: () => number;
  readonly #publicHost: typeof LOOPBACK_HOST;
  readonly #requestedPublicPort: number;
  readonly #randomSource: (size: number) => Uint8Array;
  readonly #recentClosedSessions: ClosedAuthenticatedBridgeSession[] = [];
  readonly #replayCache = new Map<string, number>();
  readonly #pendingAuthenticationContexts = new Set<ConnectionContext>();
  #activeContext: ConnectionContext | null = null;
  #backendAuthority: BackendProcessAuthority | null = null;
  #dispatchLease: DispatchLeaseState | null = null;
  #publicPort: number | null = null;
  #server: WebSocketServer | null = null;
  #sessionSequence = 0;

  public constructor(options: AuthenticatedBridgeGatewayOptions) {
    if (
      options.publicHost !== LOOPBACK_HOST ||
      options.backendHost !== LOOPBACK_HOST
    ) {
      throw new Error("The authenticated bridge gateway must use IPv4 loopback.");
    }
    if (!validPort(options.publicPort, true)) {
      throw new Error("The authenticated bridge public port is invalid.");
    }
    if (!validPort(options.backendPort, false)) {
      throw new Error("The authenticated bridge backend port is invalid.");
    }
    if (
      !Number.isSafeInteger(options.maximumPayloadBytes) ||
      options.maximumPayloadBytes < AUTHENTICATION_FRAME_MAXIMUM_BYTES ||
      options.maximumPayloadBytes > 16 * 1024 * 1024
    ) {
      throw new Error("The authenticated bridge payload limit is invalid.");
    }
    assertBase64UrlSecret(options.authenticationKey, "Bridge authentication key");
    assertBase64UrlSecret(options.backendSessionToken, "Backend bridge token");
    if (!/^i[A-Za-z0-9_-]{43}$/u.test(options.expectedAuthenticatedIndexBuildId)) {
      throw new Error("The expected authenticated bridge build ID is invalid.");
    }
    if (
      !/^[0-9a-f]{64}$/u.test(options.expectedAuthenticationKeySha256) ||
      createHash("sha256").update(options.authenticationKey, "utf8").digest("hex") !==
        options.expectedAuthenticationKeySha256
    ) {
      throw new Error(
        "The expected authenticated bridge credential epoch does not match the configured key.",
      );
    }
    const authenticationTimeoutMs =
      options.authenticationTimeoutMs ?? AUTHENTICATION_TIMEOUT_MS;
    if (
      !Number.isSafeInteger(authenticationTimeoutMs) ||
      authenticationTimeoutMs < 100 ||
      authenticationTimeoutMs > 60_000
    ) {
      throw new Error(
        "The bridge authentication timeout must be an integer from 100 to 60000 milliseconds.",
      );
    }
    this.#authenticationKey = options.authenticationKey;
    this.#authenticationTimeoutMs = authenticationTimeoutMs;
    this.#backendHost = options.backendHost;
    this.#backendPort = options.backendPort;
    this.#backendSessionToken = options.backendSessionToken;
    this.#expectedAuthenticatedIndexBuildId =
      options.expectedAuthenticatedIndexBuildId;
    this.#expectedAuthenticationKeySha256 =
      options.expectedAuthenticationKeySha256;
    this.#maximumPayloadBytes = options.maximumPayloadBytes;
    this.#now = options.now ?? Date.now;
    this.#publicHost = options.publicHost;
    this.#requestedPublicPort = options.publicPort;
    this.#randomSource = options.randomSource ?? randomBytes;
    this.#gatewayInstanceId = randomBase64Url(this.#randomSource);
  }

  public async start(): Promise<void> {
    if (this.#server !== null) {
      throw new Error("The authenticated bridge gateway is already started.");
    }
    const server = new WebSocketServer({
      clientTracking: true,
      host: this.#publicHost,
      // The parser itself enforces the authentication-frame limit.
      // The HMAC proof must be accepted before that limit is raised.
      maxPayload: AUTHENTICATION_FRAME_MAXIMUM_BYTES,
      perMessageDeflate: false,
      port: this.#requestedPublicPort,
      verifyClient: ({ req }: { readonly req: IncomingMessage }): boolean =>
        req.headers.origin === undefined &&
        this.#pendingAuthenticationContexts.size <
          PENDING_AUTHENTICATION_CONTEXT_LIMIT,
    });
    this.#server = server;
    server.on("connection", (socket, request) => {
      if (
        request.headers.origin !== undefined ||
        request.socket.remoteAddress !== this.#publicHost ||
        this.#pendingAuthenticationContexts.size >=
          PENDING_AUTHENTICATION_CONTEXT_LIMIT
      ) {
        closeWebSocket(socket, POLICY_CLOSE_CODE, "loopback-required");
        return;
      }
      this.#acceptClient(socket);
    });
    try {
      await waitForWebSocketServerListening(server);
    } catch (error) {
      try {
        await closeWebSocketServer(server);
        if (this.#server === server) {
          this.#server = null;
          this.#publicPort = null;
        }
      } catch (cleanupError) {
        throw new AggregateError(
          [error, cleanupError],
          "Authenticated bridge startup failed and its listener could not be closed.",
          { cause: cleanupError },
        );
      }
      throw error;
    }
    const address = server.address();
    if (address === null || typeof address === "string") {
      await this.close();
      throw new Error("The authenticated bridge gateway has no TCP address.");
    }
    this.#publicPort = address.port;
  }

  public lifecycle(): AuthenticatedBridgeSessionLifecycle {
    if (this.#publicPort === null) {
      throw new Error("The authenticated bridge gateway is not listening.");
    }
    return {
      activeSession:
        this.#activeContext?.phase === "proxying" &&
        this.#activeContext.session !== null
          ? { ...this.#activeContext.session }
          : null,
      gatewayInstanceId: this.#gatewayInstanceId,
      publicEndpoint: {
        host: this.#publicHost,
        port: this.#publicPort,
      },
      recentClosedSessions: this.#recentClosedSessions.map((entry) => ({
        ...entry,
      })),
      schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1",
    };
  }

  public async bindBackendOwner(pid: number): Promise<void> {
    const authority = await captureBackendProcessAuthority(pid);
    this.bindBackendAuthority(authority);
  }

  public bindBackendAuthority(
    authority: BackendProcessAuthority,
  ): void {
    if (this.#backendAuthority !== null) {
      throw new Error("The private bridge backend owner is already bound.");
    }
    if (
      !Number.isSafeInteger(authority.pid) ||
      authority.pid <= 0 ||
      !/^\d+$/u.test(authority.startTimeTicks)
    ) {
      throw new Error("The private bridge backend authority is invalid.");
    }
    this.#backendAuthority = Object.freeze({ ...authority });
  }

  public closedSession(
    sessionId: string,
  ): ClosedAuthenticatedBridgeSession | undefined {
    const found = this.#recentClosedSessions.find(
      (entry) => entry.sessionId === sessionId,
    );
    return found === undefined ? undefined : { ...found };
  }

  public beginDispatchLease(
    expectedGatewayInstanceId: string,
    expectedSessionId: string,
  ): BridgeDispatchLeaseBinding {
    if (expectedGatewayInstanceId !== this.#gatewayInstanceId) {
      throw new Error("The bridge gateway instance changed before dispatch binding.");
    }
    if (this.#dispatchLease !== null) {
      throw new Error("Another authenticated bridge dispatch lease is active.");
    }
    const context = this.#activeContext;
    if (
      context?.phase !== "proxying" ||
      context.session === null ||
      context.session.sessionId !== expectedSessionId
    ) {
      throw new Error("The expected authenticated bridge session is not proxying.");
    }
    const begunAtEpochMs = this.#now();
    const leaseId = randomBase64Url(this.#randomSource);
    const bindingCore = {
      begunAtEpochMs,
      gatewayInstanceId: this.#gatewayInstanceId,
      leaseId,
      schema: "easyeda-pro-control.bridge-dispatch-lease.v1" as const,
      sessionId: context.session.sessionId,
      sessionSequence: context.session.sequence,
    };
    const binding: BridgeDispatchLeaseBinding = {
      ...bindingCore,
      bindingReceipt: createHmac("sha256", this.#authenticationKey)
        .update(
          dispatchLeaseTranscript(
            bindingCore.gatewayInstanceId,
            bindingCore.leaseId,
            bindingCore.sessionId,
            bindingCore.sessionSequence,
            bindingCore.begunAtEpochMs,
          ),
          "utf8",
        )
        .digest("base64url"),
    };
    this.#dispatchLease = {
      binding,
      context,
      releaseOnSessionClose: false,
    };
    return { ...binding };
  }

  public endDispatchLease(binding: BridgeDispatchLeaseBinding): void {
    const lease = this.#assertDispatchLeaseBinding(binding);
    const activeSessionMatches =
      lease.context === this.#activeContext &&
      lease.context.phase === "proxying" &&
      lease.context.session?.sessionId === lease.binding.sessionId;
    const closedSessionMatches =
      this.closedSession(lease.binding.sessionId)?.sequence ===
      lease.binding.sessionSequence;
    if (!activeSessionMatches && !closedSessionMatches) {
      throw new Error(
        "The dispatch-bound bridge session has no active or closed lifecycle evidence.",
      );
    }
    this.#dispatchLease = null;
  }

  public abortDispatchLease(
    binding: BridgeDispatchLeaseBinding,
    outcome: BridgeDispatchAbortOutcome,
  ): BridgeDispatchAbortResult {
    const lease = this.#assertDispatchLeaseBinding(binding);
    if (outcome === "not-dispatched") {
      this.#dispatchLease = null;
      return { released: true, retainedUntilSessionClose: false };
    }
    if (outcome !== "ambiguous-after-dispatch") {
      throw new Error("The bridge dispatch abort outcome is invalid.");
    }
    if (this.closedSession(lease.binding.sessionId) !== undefined) {
      this.#dispatchLease = null;
      return { released: true, retainedUntilSessionClose: false };
    }
    lease.releaseOnSessionClose = true;
    return { released: false, retainedUntilSessionClose: true };
  }

  public assertDispatchLeaseForCall(
    binding?: BridgeDispatchLeaseBinding,
  ): void {
    if (this.#dispatchLease === null) {
      if (binding !== undefined) {
        throw new Error("No authenticated bridge dispatch lease is active.");
      }
      return;
    }
    if (binding === undefined) {
      throw new Error(
        "Every upstream call during a bridge dispatch lease requires its exact binding.",
      );
    }
    const lease = this.#assertDispatchLeaseBinding(binding);
    if (
      lease.context !== this.#activeContext ||
      lease.context.phase !== "proxying" ||
      lease.context.session?.sessionId !== lease.binding.sessionId
    ) {
      throw new Error("The dispatch-bound bridge session is no longer proxying.");
    }
  }

  public async close(): Promise<void> {
    if (
      this.#dispatchLease !== null &&
      !this.#dispatchLease.releaseOnSessionClose
    ) {
      throw new Error(
        "The authenticated bridge gateway cannot close while a dispatched call is still in flight.",
      );
    }
    const server = this.#server;
    const active = this.#activeContext;
    if (active !== null) {
      this.#closeContext(active, NORMAL_CLOSE_CODE, "gateway-closed");
    }
    if (server === null) {
      this.#publicPort = null;
      return;
    }
    for (const socket of server.clients) {
      closeWebSocket(socket, NORMAL_CLOSE_CODE, "gateway-closed");
    }
    await closeWebSocketServer(server);
    if (this.#server === server) {
      this.#server = null;
      this.#publicPort = null;
    }
  }

  #acceptClient(socket: WebSocketClient): void {
    const context: ConnectionContext = {
      backend: null,
      clientNonce: null,
      clientSocket: socket,
      phase: "awaiting-client-hello",
      proxyEstablished: false,
      requestedCloseReason: null,
      serverNonce: null,
      session: null,
      timeout: null,
    };
    this.#pendingAuthenticationContexts.add(context);
    this.#armAuthenticationTimeout(context);
    socket.on("message", (data, isBinary) => {
      try {
        this.#handleClientFrame(context, data, isBinary);
      } catch {
        this.#closeContext(context, PROTOCOL_CLOSE_CODE, "authentication-failed");
      }
    });
    socket.once("error", () => {
      this.#closeContext(context, PROTOCOL_CLOSE_CODE, "client-error");
    });
    socket.once("close", () => {
      this.#finalizeContext(
        context,
        context.requestedCloseReason ?? "client-closed",
      );
    });
  }

  #armAuthenticationTimeout(context: ConnectionContext): void {
    if (context.timeout !== null) {
      clearTimeout(context.timeout);
    }
    context.timeout = setTimeout(() => {
      this.#closeContext(context, POLICY_CLOSE_CODE, "authentication-timeout");
    }, this.#authenticationTimeoutMs);
    context.timeout.unref();
  }

  #handleClientFrame(
    context: ConnectionContext,
    data: RawData,
    isBinary: boolean,
  ): void {
    if (isBinary || context.phase === "closed") {
      throw new Error("Binary or post-close bridge frame rejected.");
    }
    const bytes = rawDataBytes(data);
    const preAuthentication =
      context.phase === "awaiting-client-hello" ||
      context.phase === "awaiting-client-proof";
    const maximumBytes = preAuthentication
      ? AUTHENTICATION_FRAME_MAXIMUM_BYTES
      : this.#maximumPayloadBytes;
    if (bytes.byteLength === 0 || bytes.byteLength > maximumBytes) {
      throw new Error("Bridge frame exceeds its phase-specific size limit.");
    }
    const text = strictUtf8(bytes);
    if (context.phase === "awaiting-client-hello") {
      this.#handleClientHello(context, text);
      return;
    }
    if (context.phase === "awaiting-client-proof") {
      this.#handleClientProof(context, text);
      return;
    }
    if (context.phase === "awaiting-upstream-handshake") {
      this.#forwardUpstreamHandshake(context, text);
      return;
    }
    if (
      context.phase === "connecting-backend" ||
      context.phase === "awaiting-upstream-hello"
    ) {
      throw new Error("Application frame arrived before the upstream hello.");
    }
    if (context.phase === "proxying") {
      if (context.backend?.readyState !== WebSocketClient.OPEN) {
        throw new Error("The private bridge backend is unavailable.");
      }
      context.backend.send(bytes, { binary: false });
    }
  }

  #handleClientHello(context: ConnectionContext, text: string): void {
    const message = parseClientHello(text);
    this.#pruneReplayCache();
    if (this.#replayCache.has(message.clientNonce)) {
      throw new Error("Bridge client nonce replay rejected.");
    }
    if (this.#replayCache.size >= REPLAY_CACHE_MAXIMUM_ENTRIES) {
      const oldest = this.#replayCache.keys().next().value;
      if (typeof oldest === "string") {
        this.#replayCache.delete(oldest);
      }
    }
    this.#replayCache.set(
      message.clientNonce,
      this.#now() + REPLAY_CACHE_TTL_MS,
    );
    const serverNonce = randomBase64Url(this.#randomSource);
    context.clientNonce = message.clientNonce;
    context.serverNonce = serverNonce;
    context.phase = "awaiting-client-proof";
    this.#armAuthenticationTimeout(context);
    context.clientSocket.send(
      JSON.stringify({
        clientNonce: message.clientNonce,
        protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
        serverNonce,
        serverProof: computeBridgeAuthenticationMac(
          this.#authenticationKey,
          "server-challenge",
          message.clientNonce,
          serverNonce,
        ),
        type: "auth.server_challenge",
      }),
    );
  }

  #handleClientProof(context: ConnectionContext, text: string): void {
    const message = parseClientProof(text);
    if (
      context.clientNonce === null ||
      context.serverNonce === null ||
      message.clientNonce !== context.clientNonce ||
      message.serverNonce !== context.serverNonce
    ) {
      throw new Error("Bridge proof does not match the live challenge.");
    }
    const expected = computeBridgeAuthenticationMac(
      this.#authenticationKey,
      "client-proof",
      context.clientNonce,
      context.serverNonce,
    );
    if (!macMatches(expected, message.clientProof)) {
      throw new Error("Bridge client proof is invalid.");
    }
    this.#raiseAuthenticatedClientPayloadLimit(context.clientSocket);
    this.#pendingAuthenticationContexts.delete(context);
    if (this.#activeContext !== null) {
      throw new Error("Another authenticated EasyEDA bridge is already active.");
    }
    if (this.#dispatchLease !== null) {
      throw new Error("A dispatch lease still pins the prior bridge session.");
    }
    if (this.#backendAuthority === null) {
      throw new Error("The supervised private bridge backend is not ready.");
    }
    this.#sessionSequence += 1;
    const sessionId = randomBase64Url(this.#randomSource);
    const serverReceipt = computeBridgeAuthenticationMac(
      this.#authenticationKey,
      "server-accepted",
      context.clientNonce,
      context.serverNonce,
      sessionId,
      message.clientProof,
    );
    context.session = {
      authenticatedAtEpochMs: this.#now(),
      authenticationReceiptSha256: createHash("sha256")
        .update(serverReceipt, "utf8")
        .digest("hex"),
      sequence: this.#sessionSequence,
      sessionId,
    };
    context.phase = "connecting-backend";
    this.#activeContext = context;
    this.#armAuthenticationTimeout(context);
    this.#connectBackend(context, serverReceipt, message.clientProof);
  }

  #connectBackend(
    context: ConnectionContext,
    serverReceipt: string,
    clientProof: string,
  ): void {
    let backendTcpSocket: Socket | null = null;
    const backend = new WebSocketClient(
      `ws://${this.#backendHost}:${this.#backendPort}`,
      {
        handshakeTimeout: this.#authenticationTimeoutMs,
        maxPayload: this.#maximumPayloadBytes,
        perMessageDeflate: false,
      },
    );
    context.backend = backend;
    backend.once("upgrade", (response) => {
      backendTcpSocket = response.socket;
    });
    backend.once("open", () => {
      void this.#handleBackendOpen(
        context,
        backend,
        backendTcpSocket,
        serverReceipt,
        clientProof,
      );
    });
    backend.on("message", (data, isBinary) => {
      try {
        this.#handleBackendFrame(context, data, isBinary);
      } catch {
        this.#closeContext(context, PROTOCOL_CLOSE_CODE, "backend-protocol-failed");
      }
    });
    backend.once("error", () => {
      this.#closeContext(context, PROTOCOL_CLOSE_CODE, "backend-error");
    });
    backend.once("close", () => {
      this.#closeContext(context, NORMAL_CLOSE_CODE, "backend-closed");
    });
  }

  async #handleBackendOpen(
    context: ConnectionContext,
    backend: WebSocketClient,
    backendTcpSocket: Socket | null,
    serverReceipt: string,
    clientProof: string,
  ): Promise<void> {
    try {
      await this.#acceptProvenBackend(
        context,
        backend,
        backendTcpSocket,
        serverReceipt,
        clientProof,
      );
    } catch {
      this.#closeContext(
        context,
        PROTOCOL_CLOSE_CODE,
        "backend-owner-proof-failed",
      );
    }
  }

  async #acceptProvenBackend(
    context: ConnectionContext,
    backend: WebSocketClient,
    backendTcpSocket: Socket | null,
    serverReceipt: string,
    clientProof: string,
  ): Promise<void> {
    const authority = this.#backendAuthority;
    if (authority === null || backendTcpSocket === null) {
      throw new Error("The private backend connection has no process authority.");
    }
    await assertBackendConnectionOwnedByProcess(backendTcpSocket, authority);
    if (
      context.phase !== "connecting-backend" ||
      context.clientSocket.readyState !== WebSocketClient.OPEN ||
      context.clientNonce === null ||
      context.serverNonce === null ||
      context.session === null
    ) {
      closeWebSocket(backend, NORMAL_CLOSE_CODE, "client-unavailable");
      return;
    }
    context.phase = "awaiting-upstream-handshake";
    this.#armAuthenticationTimeout(context);
    context.clientSocket.send(
      JSON.stringify({
        clientNonce: context.clientNonce,
        clientProof,
        protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
        serverNonce: context.serverNonce,
        serverReceipt,
        sessionId: context.session.sessionId,
        type: "auth.accepted",
      }),
    );
  }

  #forwardUpstreamHandshake(context: ConnectionContext, text: string): void {
    const value: unknown = JSON.parse(text);
    if (
      !isRecord(value) ||
      value["type"] !== "handshake" ||
      value["authenticatedIndexBuildId"] !==
        this.#expectedAuthenticatedIndexBuildId ||
      value["authenticationKeySha256"] !==
        this.#expectedAuthenticationKeySha256 ||
      Object.hasOwn(value, "sessionToken") ||
      context.backend?.readyState !== WebSocketClient.OPEN
    ) {
      throw new Error("The first authenticated application frame is not a handshake.");
    }
    context.phase = "awaiting-upstream-hello";
    this.#armAuthenticationTimeout(context);
    context.backend.send(
      JSON.stringify({ ...value, sessionToken: this.#backendSessionToken }),
    );
  }

  #handleBackendFrame(
    context: ConnectionContext,
    data: RawData,
    isBinary: boolean,
  ): void {
    if (isBinary || context.clientSocket.readyState !== WebSocketClient.OPEN) {
      throw new Error("Binary or orphaned backend frame rejected.");
    }
    const bytes = rawDataBytes(data);
    if (bytes.byteLength === 0 || bytes.byteLength > this.#maximumPayloadBytes) {
      throw new Error("Backend frame exceeds the configured size limit.");
    }
    if (context.phase === "awaiting-upstream-hello") {
      const value: unknown = JSON.parse(strictUtf8(bytes));
      if (!isRecord(value) || value["type"] !== "hello") {
        throw new Error("The private backend did not begin with a bridge hello.");
      }
      assertCompatibleUpstreamHello(value, this.#maximumPayloadBytes);
      if (context.session === null) {
        throw new Error("The private backend hello has no authenticated session.");
      }
      context.session = {
        ...context.session,
        authenticatedAtEpochMs: this.#now(),
      };
      if (context.timeout !== null) {
        clearTimeout(context.timeout);
        context.timeout = null;
      }
      context.proxyEstablished = true;
      context.phase = "proxying";
    } else if (context.phase === "proxying") {
      const value: unknown = JSON.parse(strictUtf8(bytes));
      if (isRecord(value) && value["type"] === "hello") {
        throw new Error("The private backend replayed its hello after admission.");
      }
    } else {
      throw new Error("The private backend sent data before its handshake.");
    }
    context.clientSocket.send(bytes, { binary: false });
  }

  #closeContext(
    context: ConnectionContext,
    code: number,
    reason: string,
  ): void {
    if (context.phase === "closed") {
      return;
    }
    context.requestedCloseReason = reason;
    closeWebSocket(context.clientSocket, code, reason);
    if (context.backend !== null) {
      closeWebSocket(context.backend, code, reason);
    }
    this.#finalizeContext(context, reason);
  }

  #finalizeContext(context: ConnectionContext, reason: string): void {
    if (context.phase === "closed") {
      return;
    }
    context.phase = "closed";
    this.#pendingAuthenticationContexts.delete(context);
    if (context.timeout !== null) {
      clearTimeout(context.timeout);
      context.timeout = null;
    }
    if (context.backend !== null) {
      closeWebSocket(context.backend, NORMAL_CLOSE_CODE, reason);
      context.backend = null;
    }
    if (this.#activeContext === context) {
      this.#activeContext = null;
    }
    if (context.session !== null && context.proxyEstablished) {
      this.#recentClosedSessions.push({
        ...context.session,
        closeReason: reason,
        closedAtEpochMs: this.#now(),
      });
      if (this.#recentClosedSessions.length > CLOSED_SESSION_HISTORY_LIMIT) {
        this.#recentClosedSessions.splice(
          0,
          this.#recentClosedSessions.length - CLOSED_SESSION_HISTORY_LIMIT,
        );
      }
      if (
        this.#dispatchLease?.binding.sessionId === context.session.sessionId &&
        this.#dispatchLease.releaseOnSessionClose
      ) {
        this.#dispatchLease = null;
      }
    }
  }

  #raiseAuthenticatedClientPayloadLimit(socket: WebSocketClient): void {
    if (this.#maximumPayloadBytes === AUTHENTICATION_FRAME_MAXIMUM_BYTES) {
      return;
    }
    // The pinned ws 8.21.3 Receiver owns the parser-side maximum.
    // This exact post-HMAC change preserves a 2 KiB unauthenticated ceiling.
    // Authenticated frames retain the configured application limit.
    // Failure is mandatory if the pinned implementation shape changes.
    const receiver: unknown = Reflect.get(socket, "_receiver");
    if (
      !isRecord(receiver) ||
      Reflect.get(receiver, "_maxPayload") !==
        AUTHENTICATION_FRAME_MAXIMUM_BYTES ||
      !Reflect.set(receiver, "_maxPayload", this.#maximumPayloadBytes) ||
      Reflect.get(receiver, "_maxPayload") !== this.#maximumPayloadBytes
    ) {
      throw new Error(
        "The authenticated WebSocket parser payload limit could not be raised safely.",
      );
    }
  }

  #assertDispatchLeaseBinding(
    binding: BridgeDispatchLeaseBinding,
  ): DispatchLeaseState {
    const lease = this.#dispatchLease;
    const expectedReceipt = createHmac("sha256", this.#authenticationKey)
      .update(
        dispatchLeaseTranscript(
          binding.gatewayInstanceId,
          binding.leaseId,
          binding.sessionId,
          binding.sessionSequence,
          binding.begunAtEpochMs,
        ),
        "utf8",
      )
      .digest("base64url");
    if (
      lease === null ||
      binding.schema !== "easyeda-pro-control.bridge-dispatch-lease.v1" ||
      !macMatches(expectedReceipt, binding.bindingReceipt) ||
      !exactKeys(binding, [
        "begunAtEpochMs",
        "bindingReceipt",
        "gatewayInstanceId",
        "leaseId",
        "schema",
        "sessionId",
        "sessionSequence",
      ]) ||
      binding.begunAtEpochMs !== lease.binding.begunAtEpochMs ||
      binding.bindingReceipt !== lease.binding.bindingReceipt ||
      binding.gatewayInstanceId !== lease.binding.gatewayInstanceId ||
      binding.leaseId !== lease.binding.leaseId ||
      binding.sessionId !== lease.binding.sessionId ||
      binding.sessionSequence !== lease.binding.sessionSequence
    ) {
      throw new Error("The authenticated bridge dispatch lease binding is invalid.");
    }
    return lease;
  }

  #pruneReplayCache(): void {
    const now = this.#now();
    for (const [nonce, expiresAt] of this.#replayCache) {
      if (expiresAt <= now) {
        this.#replayCache.delete(nonce);
      }
    }
  }
}
