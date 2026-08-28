import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { Socket } from "node:net";
import { describe, test } from "node:test";
import { setTimeout as wait } from "node:timers/promises";

import WebSocketClient, { WebSocketServer } from "ws";
import type { RawData } from "ws";

import {
  AuthenticatedBridgeGateway,
  BRIDGE_AUTHENTICATION_PROTOCOL,
  computeBridgeAuthenticationMac,
} from "../src/authenticated-bridge-gateway.ts";
import type {
  BridgeDispatchAbortOutcome,
  BridgeDispatchLeaseBinding,
} from "../src/authenticated-bridge-gateway.ts";
import { UpstreamEasyedaClient } from "../src/upstream.ts";
import type { UpstreamToolResult } from "../src/upstream.ts";

const AUTHENTICATION_KEY = "a".repeat(64);
const AUTHENTICATION_KEY_SHA256 = createHash("sha256")
  .update(AUTHENTICATION_KEY, "utf8")
  .digest("hex");
const AUTHENTICATED_INDEX_BUILD_ID = `i${"c".repeat(43)}`;
const BACKEND_TOKEN = "b".repeat(64);
const CLIENT_NONCE = Buffer.alloc(32, 1).toString("base64url");
const MAXIMUM_PAYLOAD_BYTES = 1_048_576;
const REVIEWED_UPSTREAM_HELLO = Object.freeze({
  contractVersion: 1,
  hotSwapEnabled: false,
  maxAggregatePayloadSize: MAXIMUM_PAYLOAD_BYTES * 8,
  maxPayloadSize: MAXIMUM_PAYLOAD_BYTES,
  supportedProtocolVersions: ["1.0.0"],
  supportsChunking: true,
  type: "hello",
});

function serverPort(server: WebSocketServer): number {
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("The WebSocketClient test server has no TCP port.");
  }
  return address.port;
}

async function listeningServer(): Promise<WebSocketServer> {
  const server = new WebSocketServer({
    host: "127.0.0.1",
    perMessageDeflate: false,
    port: 0,
  });
  await once(server, "listening");
  return server;
}

async function closeServer(server: WebSocketServer): Promise<void> {
  for (const socket of server.clients) {
    socket.terminate();
  }
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
}

async function openClient(port: number): Promise<WebSocketClient> {
  const socket = new WebSocketClient(`ws://127.0.0.1:${port}`, {
    perMessageDeflate: false,
  });
  socket.on("error", () => {
    // Expected hostile-path closures are asserted through their close event.
  });
  await once(socket, "open");
  return socket;
}

async function expectUpgradeRejected(
  port: number,
  headers: Record<string, string> = {},
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const socket = new WebSocketClient(`ws://127.0.0.1:${port}`, {
      headers,
      perMessageDeflate: false,
    });
    let settled = false;
    const finish = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      socket.terminate();
      resolve();
    };
    socket.once("open", () => {
      if (settled) {
        return;
      }
      settled = true;
      socket.terminate();
      reject(new Error("Hostile WebSocket upgrade was accepted."));
    });
    socket.once("error", finish);
    socket.once("close", finish);
    socket.once("unexpected-response", (_request, response) => {
      response.resume();
      finish();
    });
  });
}

function nextConnection(server: WebSocketServer): Promise<WebSocketClient> {
  return new Promise<WebSocketClient>((resolve) => {
    server.once("connection", (socket) => {
      resolve(socket);
    });
  });
}

async function nextJson(socket: WebSocketClient): Promise<Record<string, unknown>> {
  const { data, isBinary } = await new Promise<{
    data: RawData;
    isBinary: boolean;
  }>((resolve) => {
    socket.once("message", (frame, binary) => {
      resolve({ data: frame, isBinary: binary });
    });
  });
  assert.equal(isBinary, false);
  let bytes: Buffer;
  if (Array.isArray(data)) {
    bytes = Buffer.concat(data);
  } else if (data instanceof ArrayBuffer) {
    bytes = Buffer.from(data);
  } else {
    bytes = data;
  }
  const value: unknown = JSON.parse(bytes.toString("utf8"));
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Expected a JSON object WebSocketClient frame.");
  }
  return Object.fromEntries(Object.entries(value));
}

function nextCloseCode(socket: WebSocketClient): Promise<number> {
  return new Promise<number>((resolve) => {
    socket.once("close", (code) => {
      resolve(code);
    });
  });
}

function createGateway(
  backendPort: number,
  publicPort = 0,
  authenticationTimeoutMs = 2000,
): AuthenticatedBridgeGateway {
  return new AuthenticatedBridgeGateway({
    authenticationKey: AUTHENTICATION_KEY,
    authenticationTimeoutMs,
    backendHost: "127.0.0.1",
    backendPort,
    backendSessionToken: BACKEND_TOKEN,
    expectedAuthenticatedIndexBuildId: AUTHENTICATED_INDEX_BUILD_ID,
    expectedAuthenticationKeySha256: AUTHENTICATION_KEY_SHA256,
    maximumPayloadBytes: MAXIMUM_PAYLOAD_BYTES,
    publicHost: "127.0.0.1",
    publicPort,
  });
}

async function authenticate(
  socket: WebSocketClient,
  clientNonce = CLIENT_NONCE,
): Promise<Record<string, unknown>> {
  socket.send(
    JSON.stringify({
      clientNonce,
      protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
      type: "auth.client_hello",
    }),
  );
  const challenge = await nextJson(socket);
  assert.equal(challenge["type"], "auth.server_challenge");
  const serverNonce = String(challenge["serverNonce"]);
  const expectedServerProof = computeBridgeAuthenticationMac(
    AUTHENTICATION_KEY,
    "server-challenge",
    clientNonce,
    serverNonce,
  );
  assert.equal(challenge["serverProof"], expectedServerProof);
  const clientProof = computeBridgeAuthenticationMac(
    AUTHENTICATION_KEY,
    "client-proof",
    clientNonce,
    serverNonce,
  );
  socket.send(
    JSON.stringify({
      clientNonce,
      clientProof,
      protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
      serverNonce,
      type: "auth.client_proof",
    }),
  );
  const accepted = await nextJson(socket);
  assert.equal(accepted["type"], "auth.accepted");
  assert.equal(accepted["clientProof"], clientProof);
  const expectedReceipt = computeBridgeAuthenticationMac(
    AUTHENTICATION_KEY,
    "server-accepted",
    clientNonce,
    serverNonce,
    String(accepted["sessionId"]),
    clientProof,
  );
  assert.equal(accepted["serverReceipt"], expectedReceipt);
  return accepted;
}

async function expectAuthenticationRejection(
  socket: WebSocketClient,
  clientNonce: string,
): Promise<void> {
  socket.send(
    JSON.stringify({
      clientNonce,
      protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
      type: "auth.client_hello",
    }),
  );
  const challenge = await nextJson(socket);
  const serverNonce = String(challenge["serverNonce"]);
  const closed = once(socket, "close");
  socket.send(
    JSON.stringify({
      clientNonce,
      clientProof: computeBridgeAuthenticationMac(
        AUTHENTICATION_KEY,
        "client-proof",
        clientNonce,
        serverNonce,
      ),
      protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
      serverNonce,
      type: "auth.client_proof",
    }),
  );
  await closed;
}

async function establishProxySession(
  gateway: AuthenticatedBridgeGateway,
  backend: WebSocketServer,
  clientNonce: string,
): Promise<{
  readonly accepted: Record<string, unknown>;
  readonly client: WebSocketClient;
  readonly privateSocket: WebSocketClient;
}> {
  const backendConnection = nextConnection(backend);
  const client = await openClient(gateway.lifecycle().publicEndpoint.port);
  const accepted = await authenticate(client, clientNonce);
  const privateSocket = await backendConnection;
  assert.equal(gateway.lifecycle().activeSession, null);
  const privateHandshake = nextJson(privateSocket);
  client.send(
    JSON.stringify({
      authenticatedIndexBuildId: AUTHENTICATED_INDEX_BUILD_ID,
      authenticationKeySha256: AUTHENTICATION_KEY_SHA256,
      contractVersion: 1,
      protocol: "easyeda-mcp-pro.bridge",
      protocolVersion: "1.0.0",
      type: "handshake",
    }),
  );
  const injectedHandshake = await privateHandshake;
  assert.equal(injectedHandshake["sessionToken"], BACKEND_TOKEN);
  const publicHello = nextJson(client);
  privateSocket.send(JSON.stringify(REVIEWED_UPSTREAM_HELLO));
  const receivedPublicHello = await publicHello;
  assert.equal(receivedPublicHello["type"], "hello");
  return { accepted, client, privateSocket };
}

const SUCCESSFUL_TOOL_RESULT: UpstreamToolResult = {
  content: [{ text: "fixture result", type: "text" }],
};

type LeaseSettlementEvent =
  | {
      readonly kind: "abort";
      readonly outcome: BridgeDispatchAbortOutcome;
    }
  | { readonly kind: "end" };

function createUpstreamScopeHarness(
  gateway: AuthenticatedBridgeGateway,
  callTool: () => Promise<UpstreamToolResult>,
): UpstreamEasyedaClient {
  const upstream = new UpstreamEasyedaClient();
  const fakeClient = { callTool };
  assert.equal(Reflect.set(upstream, "bridgeGateway", gateway), true);
  assert.equal(Reflect.set(upstream, "client", fakeClient), true);
  assert.equal(
    Reflect.set(upstream, "assertStartupAuthorityCurrent", () => Promise.resolve()),
    true,
  );
  return upstream;
}

function observeLeaseSettlements(
  gateway: AuthenticatedBridgeGateway,
): LeaseSettlementEvent[] {
  const events: LeaseSettlementEvent[] = [];
  const originalAbort = gateway.abortDispatchLease.bind(gateway);
  const originalEnd = gateway.endDispatchLease.bind(gateway);
  gateway.abortDispatchLease = (
    binding: BridgeDispatchLeaseBinding,
    outcome: BridgeDispatchAbortOutcome,
  ): ReturnType<AuthenticatedBridgeGateway["abortDispatchLease"]> => {
    events.push({ kind: "abort", outcome });
    return originalAbort(binding, outcome);
  };
  gateway.endDispatchLease = (binding: BridgeDispatchLeaseBinding): void => {
    events.push({ kind: "end" });
    originalEnd(binding);
  };
  return events;
}

void describe("mutually authenticated EasyEDA bridge gateway", () => {
  void test("fails closed when an attacker pre-binds the public port", async () => {
    const attacker = await listeningServer();
    const backend = await listeningServer();
    const contestedPort = serverPort(attacker);
    const gateway = createGateway(serverPort(backend), contestedPort);
    let attackerClosed = false;
    try {
      await assert.rejects(gateway.start(), /EADDRINUSE/u);
      await closeServer(attacker);
      attackerClosed = true;
      await gateway.start();
      assert.equal(gateway.lifecycle().publicEndpoint.port, contestedPort);
    } finally {
      await gateway.close();
      if (!attackerClosed) {
        await closeServer(attacker);
      }
      await closeServer(backend);
    }
  });

  void test("rejects a request before authentication without touching the backend", async () => {
    const backend = await listeningServer();
    let backendConnections = 0;
    backend.on("connection", () => {
      backendConnections += 1;
    });
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const socket = await openClient(gateway.lifecycle().publicEndpoint.port);
    try {
      const closed = once(socket, "close");
      socket.send(
        JSON.stringify({
          id: "pre-auth",
          method: "api.execute",
          type: "request",
        }),
      );
      await closed;
      assert.equal(backendConnections, 0);
      assert.equal(gateway.lifecycle().activeSession, null);
    } finally {
      socket.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("rejects browser-origin upgrades before allocating an authentication context", async () => {
    const backend = await listeningServer();
    let backendConnections = 0;
    backend.on("connection", () => {
      backendConnections += 1;
    });
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    try {
      await expectUpgradeRejected(gateway.lifecycle().publicEndpoint.port, {
        Origin: "http://127.0.0.1",
      });
      assert.equal(backendConnections, 0);
      assert.equal(gateway.lifecycle().activeSession, null);
    } finally {
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("bounds shutdown when a peer withholds its WebSocket close reply", async () => {
    const backend = await listeningServer();
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    const socket = await openClient(gateway.lifecycle().publicEndpoint.port);
    const rawSocket: unknown = Reflect.get(socket, "_socket");
    assert.ok(rawSocket instanceof Socket);
    rawSocket.pause();
    const closePromise = gateway.close();
    try {
      await Promise.race([
        closePromise,
        wait(1500, undefined, { ref: false }).then(() => {
          throw new Error("Gateway shutdown exceeded its forced-close bound.");
        }),
      ]);
    } finally {
      rawSocket.resume();
      socket.terminate();
      await closePromise;
      await closeServer(backend);
    }
  });

  void test("retains gateway shutdown authority until a failed close is retried", async () => {
    const backend = await listeningServer();
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    const originalClose: unknown = Reflect.get(
      WebSocketServer.prototype,
      "close",
    );
    if (typeof originalClose !== "function") {
      throw new TypeError("WebSocket server close fixture is unavailable.");
    }
    const serverPrototype: object = WebSocketServer.prototype;
    let injectFailure = true;
    const injectedClose = function injectedClose(
      this: WebSocketServer,
      ...arguments_: unknown[]
    ): unknown {
      if (injectFailure) {
        injectFailure = false;
        const callback = arguments_[0];
        if (typeof callback !== "function") {
          throw new TypeError("Injected gateway close callback is unavailable.");
        }
        Reflect.apply(callback, undefined, [new Error("injected close failure")]);
        return this;
      }
      return Reflect.apply(originalClose, this, arguments_);
    };
    assert.equal(
      Reflect.set(serverPrototype, "close", injectedClose),
      true,
    );
    try {
      await assert.rejects(gateway.close(), /injected close failure/u);
      assert.ok(gateway.lifecycle().publicEndpoint.port > 0);
    } finally {
      assert.equal(
        Reflect.set(serverPrototype, "close", originalClose),
        true,
      );
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("caps pending unauthenticated clients and parser bytes before HMAC proof", async () => {
    const backend = await listeningServer();
    let backendConnections = 0;
    backend.on("connection", () => {
      backendConnections += 1;
    });
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    const clients: WebSocketClient[] = [];
    try {
      for (let index = 0; index < 8; index += 1) {
        clients.push(await openClient(gateway.lifecycle().publicEndpoint.port));
      }
      await expectUpgradeRejected(gateway.lifecycle().publicEndpoint.port);
      const first = clients[0];
      assert.ok(first);
      const closed = once(first, "close");
      first.send("x".repeat(2049));
      await closed;
      assert.equal(backendConnections, 0);
      assert.equal(gateway.lifecycle().activeSession, null);
    } finally {
      for (const client of clients) {
        client.terminate();
      }
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("rejects a bad client MAC before connecting to the backend", async () => {
    const backend = await listeningServer();
    let backendConnections = 0;
    backend.on("connection", () => {
      backendConnections += 1;
    });
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const socket = await openClient(gateway.lifecycle().publicEndpoint.port);
    try {
      socket.send(
        JSON.stringify({
          clientNonce: CLIENT_NONCE,
          protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
          type: "auth.client_hello",
        }),
      );
      const challenge = await nextJson(socket);
      const closed = once(socket, "close");
      socket.send(
        JSON.stringify({
          clientNonce: CLIENT_NONCE,
          clientProof: Buffer.alloc(32, 9).toString("base64url"),
          protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
          serverNonce: challenge["serverNonce"],
          type: "auth.client_proof",
        }),
      );
      await closed;
      assert.equal(backendConnections, 0);
      assert.equal(gateway.lifecycle().activeSession, null);
    } finally {
      socket.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("rejects a replayed client nonce on a later connection", async () => {
    const backend = await listeningServer();
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const first = await openClient(gateway.lifecycle().publicEndpoint.port);
    try {
      await authenticate(first);
      const firstClosed = once(first, "close");
      first.close();
      await firstClosed;

      const replay = await openClient(gateway.lifecycle().publicEndpoint.port);
      try {
        const replayClosed = once(replay, "close");
        replay.send(
          JSON.stringify({
            clientNonce: CLIENT_NONCE,
            protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
            type: "auth.client_hello",
          }),
        );
        await replayClosed;
        assert.equal(gateway.lifecycle().activeSession, null);
      } finally {
        replay.terminate();
      }
    } finally {
      first.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("times out before an authenticated connection reaches upstream hello", async () => {
    const backend = await listeningServer();
    let backendFrames = 0;
    backend.on("connection", (socket) => {
      socket.on("message", () => {
        backendFrames += 1;
      });
    });
    const gateway = createGateway(serverPort(backend), 0, 200);
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const socket = await openClient(gateway.lifecycle().publicEndpoint.port);
    try {
      const accepted = await authenticate(
        socket,
        Buffer.alloc(32, 8).toString("base64url"),
      );
      assert.equal(gateway.lifecycle().activeSession, null);
      await once(socket, "close");
      assert.equal(backendFrames, 0);
      assert.ok(
        gateway.closedSession(String(accepted["sessionId"])) === undefined,
      );
    } finally {
      socket.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("rejects every incompatible private backend hello field before proxy admission", async () => {
    const backend = await listeningServer();
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const invalidHellos: readonly Record<string, unknown>[] = [
      { ...REVIEWED_UPSTREAM_HELLO, contractVersion: 2 },
      { ...REVIEWED_UPSTREAM_HELLO, supportedProtocolVersions: ["1.0.0", "9.9.9"] },
      { ...REVIEWED_UPSTREAM_HELLO, maxPayloadSize: MAXIMUM_PAYLOAD_BYTES - 1 },
      { ...REVIEWED_UPSTREAM_HELLO, supportsChunking: false },
      { ...REVIEWED_UPSTREAM_HELLO, maxAggregatePayloadSize: MAXIMUM_PAYLOAD_BYTES * 7 },
      { ...REVIEWED_UPSTREAM_HELLO, hotSwapEnabled: true },
    ];
    try {
      for (const [index, invalidHello] of invalidHellos.entries()) {
        const backendConnection = nextConnection(backend);
        const client = await openClient(gateway.lifecycle().publicEndpoint.port);
        try {
          await authenticate(
            client,
            Buffer.alloc(32, 50 + index).toString("base64url"),
          );
          const privateSocket = await backendConnection;
          const privateHandshake = nextJson(privateSocket);
          client.send(
            JSON.stringify({
              authenticatedIndexBuildId: AUTHENTICATED_INDEX_BUILD_ID,
              authenticationKeySha256: AUTHENTICATION_KEY_SHA256,
              contractVersion: 1,
              protocol: "easyeda-mcp-pro.bridge",
              protocolVersion: "1.0.0",
              type: "handshake",
            }),
          );
          await privateHandshake;
          const closeCode = nextCloseCode(client);
          privateSocket.send(JSON.stringify(invalidHello));
          assert.equal(await closeCode, 4007);
          assert.equal(gateway.lifecycle().activeSession, null);
          privateSocket.terminate();
        } finally {
          client.terminate();
        }
      }
    } finally {
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("rejects a replayed backend hello after proxy admission", async () => {
    const backend = await listeningServer();
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const authenticated = await establishProxySession(
      gateway,
      backend,
      Buffer.alloc(32, 57).toString("base64url"),
    );
    try {
      const closeCode = nextCloseCode(authenticated.client);
      authenticated.privateSocket.send(JSON.stringify(REVIEWED_UPSTREAM_HELLO));
      assert.equal(await closeCode, 4007);
      assert.equal(gateway.lifecycle().activeSession, null);
    } finally {
      authenticated.client.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("sends no backend token to a listener not owned by the supervised PID", async () => {
    const backend = await listeningServer();
    let backendFrames = 0;
    backend.on("connection", (socket) => {
      socket.on("message", () => {
        backendFrames += 1;
      });
    });
    const nominalOwner = spawn(process.execPath, [
      "--input-type=module",
      "--eval",
      "setInterval(() => {}, 1000)",
    ]);
    if (nominalOwner.pid === undefined) {
      throw new Error("The wrong-owner fixture has no process ID.");
    }
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(nominalOwner.pid);
    const client = await openClient(gateway.lifecycle().publicEndpoint.port);
    try {
      client.send(
        JSON.stringify({
          clientNonce: Buffer.alloc(32, 11).toString("base64url"),
          protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
          type: "auth.client_hello",
        }),
      );
      const challenge = await nextJson(client);
      const closed = once(client, "close");
      const clientNonce = String(challenge["clientNonce"]);
      const serverNonce = String(challenge["serverNonce"]);
      client.send(
        JSON.stringify({
          clientNonce,
          clientProof: computeBridgeAuthenticationMac(
            AUTHENTICATION_KEY,
            "client-proof",
            clientNonce,
            serverNonce,
          ),
          protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
          serverNonce,
          type: "auth.client_proof",
        }),
      );
      await closed;
      assert.equal(backendFrames, 0);
      assert.equal(gateway.lifecycle().activeSession, null);
    } finally {
      client.terminate();
      nominalOwner.kill("SIGKILL");
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("proxies only after mutual auth and records exact session closure", async () => {
    const backend = await listeningServer();
    const backendConnection = nextConnection(backend);
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const client = await openClient(gateway.lifecycle().publicEndpoint.port);
    try {
      const accepted = await authenticate(
        client,
        Buffer.alloc(32, 10).toString("base64url"),
      );
      const privateSocket = await backendConnection;
      assert.equal(gateway.lifecycle().activeSession, null);
      const privateHandshake = nextJson(privateSocket);
      client.send(
        JSON.stringify({
          authenticatedIndexBuildId: AUTHENTICATED_INDEX_BUILD_ID,
          authenticationKeySha256: AUTHENTICATION_KEY_SHA256,
          contractVersion: 1,
          protocol: "easyeda-mcp-pro.bridge",
          protocolVersion: "1.0.0",
          type: "handshake",
        }),
      );
      const injectedHandshake = await privateHandshake;
      assert.equal(injectedHandshake["sessionToken"], BACKEND_TOKEN);
      assert.doesNotMatch(JSON.stringify(injectedHandshake), new RegExp(AUTHENTICATION_KEY, "u"));

      const publicHello = nextJson(client);
      privateSocket.send(JSON.stringify(REVIEWED_UPSTREAM_HELLO));
      const receivedPublicHello = await publicHello;
      assert.equal(receivedPublicHello["type"], "hello");

      const privateRequest = nextJson(privateSocket);
      client.send(
        JSON.stringify({
          id: "request-1",
          method: "system.status",
          padding: "x".repeat(4096),
          type: "request",
        }),
      );
      const receivedPrivateRequest = await privateRequest;
      assert.equal(receivedPrivateRequest["id"], "request-1");

      const lifecycle = gateway.lifecycle();
      assert.equal(lifecycle.activeSession?.sessionId, accepted["sessionId"]);
      assert.match(
        lifecycle.activeSession?.authenticationReceiptSha256 ?? "",
        /^[a-f0-9]{64}$/u,
      );
      const binding = gateway.beginDispatchLease(
        lifecycle.gatewayInstanceId,
        String(lifecycle.activeSession?.sessionId),
      );
      assert.equal(binding.sessionId, accepted["sessionId"]);
      assert.match(binding.bindingReceipt, /^[A-Za-z0-9_-]{43}$/u);
      assert.throws(
        () => {
          gateway.assertDispatchLeaseForCall();
        },
        /requires its exact binding/u,
      );
      assert.doesNotThrow(() => {
        gateway.assertDispatchLeaseForCall(binding);
      });
      assert.throws(
        () => {
          gateway.endDispatchLease({
            ...binding,
            bindingReceipt: Buffer.alloc(32, 12).toString("base64url"),
          });
        },
        /binding is invalid/u,
      );
      gateway.endDispatchLease(binding);
      const notDispatched = gateway.beginDispatchLease(
        lifecycle.gatewayInstanceId,
        String(lifecycle.activeSession?.sessionId),
      );
      assert.deepEqual(
        gateway.abortDispatchLease(notDispatched, "not-dispatched"),
        { released: true, retainedUntilSessionClose: false },
      );
      const knownReturnBeforeClose = gateway.beginDispatchLease(
        lifecycle.gatewayInstanceId,
        String(lifecycle.activeSession?.sessionId),
      );
      const sessionSequence = lifecycle.activeSession?.sequence;
      const closed = once(client, "close");
      client.close();
      await closed;
      gateway.endDispatchLease(knownReturnBeforeClose);
      const after = gateway.lifecycle();
      assert.equal(after.activeSession, null);
      const closure = gateway.closedSession(String(accepted["sessionId"]));
      assert.equal(closure?.sequence, sessionSequence);
      assert.equal(closure?.sessionId, accepted["sessionId"]);
      assert.ok((closure?.closedAtEpochMs ?? 0) >= (closure?.authenticatedAtEpochMs ?? 1));
    } finally {
      client.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("rejects stale authenticated build or credential identity before forwarding the backend token", async () => {
    const backend = await listeningServer();
    let backendFrames = 0;
    backend.on("connection", (socket) => {
      socket.on("message", () => {
        backendFrames += 1;
      });
    });
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    try {
      const hostileIdentities = [
        {
          authenticatedIndexBuildId: `i${"d".repeat(43)}`,
          authenticationKeySha256: AUTHENTICATION_KEY_SHA256,
        },
        {
          authenticatedIndexBuildId: AUTHENTICATED_INDEX_BUILD_ID,
          authenticationKeySha256: "e".repeat(64),
        },
      ];
      for (const [index, identity] of hostileIdentities.entries()) {
        const client = await openClient(
          gateway.lifecycle().publicEndpoint.port,
        );
        try {
          await authenticate(
            client,
            Buffer.alloc(32, 20 + index).toString("base64url"),
          );
          const closed = once(client, "close");
          client.send(
            JSON.stringify({
              ...identity,
              contractVersion: 1,
              protocol: "easyeda-mcp-pro.bridge",
              protocolVersion: "1.0.0",
              type: "handshake",
            }),
          );
          await closed;
          assert.equal(gateway.lifecycle().activeSession, null);
        } finally {
          client.terminate();
        }
      }
      assert.equal(backendFrames, 0);
    } finally {
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("pins dispatch to one session across hostile reconnect races", async () => {
    const backend = await listeningServer();
    let backendConnections = 0;
    backend.on("connection", () => {
      backendConnections += 1;
    });
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const first = await establishProxySession(
      gateway,
      backend,
      Buffer.alloc(32, 21).toString("base64url"),
    );
    let finalClient: WebSocketClient | null = null;
    try {
      const lifecycle = gateway.lifecycle();
      const firstSessionId = String(lifecycle.activeSession?.sessionId);
      const binding = gateway.beginDispatchLease(
        lifecycle.gatewayInstanceId,
        firstSessionId,
      );

      const concurrent = await openClient(lifecycle.publicEndpoint.port);
      try {
        await expectAuthenticationRejection(
          concurrent,
          Buffer.alloc(32, 22).toString("base64url"),
        );
      } finally {
        concurrent.terminate();
      }
      assert.equal(backendConnections, 1);

      const firstClientClosed = once(first.client, "close");
      const firstBackendClosed = once(first.privateSocket, "close");
      first.client.close();
      await Promise.all([firstClientClosed, firstBackendClosed]);
      assert.equal(gateway.lifecycle().activeSession, null);
      assert.equal(gateway.closedSession(firstSessionId)?.sessionId, firstSessionId);

      assert.throws(
        () => {
          gateway.assertDispatchLeaseForCall(binding);
        },
        /no longer proxying/u,
      );
      const replacement = await openClient(lifecycle.publicEndpoint.port);
      try {
        await expectAuthenticationRejection(
          replacement,
          Buffer.alloc(32, 23).toString("base64url"),
        );
      } finally {
        replacement.terminate();
      }
      assert.equal(backendConnections, 1);

      assert.deepEqual(
        gateway.abortDispatchLease(binding, "ambiguous-after-dispatch"),
        { released: true, retainedUntilSessionClose: false },
      );
      const final = await establishProxySession(
        gateway,
        backend,
        Buffer.alloc(32, 24).toString("base64url"),
      );
      finalClient = final.client;
      assert.equal(backendConnections, 2);
      assert.notEqual(
        gateway.lifecycle().activeSession?.sessionId,
        firstSessionId,
      );
    } finally {
      first.client.terminate();
      finalClient?.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });
});

void describe("upstream authenticated bridge dispatch scopes", () => {
  void test("keeps disconnected diagnostics unbound and rejects an evidence scope without a session", async () => {
    const backend = await listeningServer();
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    let fakeCalls = 0;
    let callbackCalls = 0;
    const upstream = createUpstreamScopeHarness(gateway, () => {
      fakeCalls += 1;
      return Promise.resolve(SUCCESSFUL_TOOL_RESULT);
    });
    let authenticated: Awaited<ReturnType<typeof establishProxySession>> | null =
      null;
    try {
      assert.deepEqual(
        await upstream.callTool("fixture_disconnected_status", {}),
        SUCCESSFUL_TOOL_RESULT,
      );
      assert.equal(fakeCalls, 1);
      await assert.rejects(
        upstream.withAuthenticatedBridgeDispatchScope(() => {
          callbackCalls += 1;
          return upstream.callTool("fixture_evidence", {});
        }),
        /requires an active proxying session/u,
      );
      assert.equal(callbackCalls, 0);
      authenticated = await establishProxySession(
        gateway,
        backend,
        Buffer.alloc(32, 31).toString("base64url"),
      );
      await assert.rejects(
        upstream.callTool("fixture_unscoped_active", {}),
        /requires a dispatch scope or its exact binding/u,
      );
      assert.equal(fakeCalls, 1);
    } finally {
      authenticated?.client.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("rejects a disconnected diagnostic result when a session appears mid-call", async () => {
    const backend = await listeningServer();
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const callStarted = Promise.withResolvers<true>();
    const callResult = Promise.withResolvers<UpstreamToolResult>();
    const upstream = createUpstreamScopeHarness(gateway, () => {
      callStarted.resolve(true);
      return callResult.promise;
    });
    let authenticated: Awaited<ReturnType<typeof establishProxySession>> | null =
      null;
    try {
      const pendingDiagnostic = upstream.callTool(
        "fixture_disconnected_status",
        {},
      );
      await callStarted.promise;
      authenticated = await establishProxySession(
        gateway,
        backend,
        Buffer.alloc(32, 41).toString("base64url"),
      );
      callResult.resolve(SUCCESSFUL_TOOL_RESULT);
      await assert.rejects(
        pendingDiagnostic,
        /session changed across an unbound disconnected call boundary/u,
      );
    } finally {
      authenticated?.client.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("aborts a no-call scope as not dispatched and exposes only frozen binding copies", async () => {
    const backend = await listeningServer();
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const authenticated = await establishProxySession(
      gateway,
      backend,
      Buffer.alloc(32, 32).toString("base64url"),
    );
    const settlements = observeLeaseSettlements(gateway);
    const upstream = createUpstreamScopeHarness(gateway, () =>
      Promise.resolve(SUCCESSFUL_TOOL_RESULT),
    );
    try {
      assert.equal(upstream.currentAuthenticatedBridgeDispatchBinding(), undefined);
      const returnedBinding =
        await upstream.withAuthenticatedBridgeDispatchScope((binding) => {
          const current = upstream.currentAuthenticatedBridgeDispatchBinding();
          assert.deepEqual(current, binding);
          assert.notEqual(current, binding);
          assert.equal(Object.isFrozen(current), true);
          assert.equal(Object.isFrozen(binding), true);
          return binding;
        });
      assert.equal(Object.isFrozen(returnedBinding), true);
      assert.equal(upstream.currentAuthenticatedBridgeDispatchBinding(), undefined);
      assert.deepEqual(settlements, [
        { kind: "abort", outcome: "not-dispatched" },
      ]);
    } finally {
      authenticated.client.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("ends a scope after successful known-return calls", async () => {
    const backend = await listeningServer();
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const authenticated = await establishProxySession(
      gateway,
      backend,
      Buffer.alloc(32, 33).toString("base64url"),
    );
    const settlements = observeLeaseSettlements(gateway);
    let fakeCalls = 0;
    const upstream = createUpstreamScopeHarness(gateway, () => {
      fakeCalls += 1;
      return Promise.resolve(SUCCESSFUL_TOOL_RESULT);
    });
    try {
      const result = await upstream.withAuthenticatedBridgeDispatchScope(
        (binding) => {
          assert.deepEqual(
            upstream.currentAuthenticatedBridgeDispatchBinding(),
            binding,
          );
          return upstream.callTool("fixture_success", {});
        },
      );
      assert.deepEqual(result, SUCCESSFUL_TOOL_RESULT);
      assert.equal(fakeCalls, 1);
      assert.deepEqual(settlements, [{ kind: "end" }]);
      assert.equal(upstream.currentAuthenticatedBridgeDispatchBinding(), undefined);
    } finally {
      authenticated.client.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("ends the lease when evidence validation fails after a known return", async () => {
    const backend = await listeningServer();
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const authenticated = await establishProxySession(
      gateway,
      backend,
      Buffer.alloc(32, 34).toString("base64url"),
    );
    const settlements = observeLeaseSettlements(gateway);
    const upstream = createUpstreamScopeHarness(gateway, () =>
      Promise.resolve(SUCCESSFUL_TOOL_RESULT),
    );
    try {
      await assert.rejects(
        upstream.withAuthenticatedBridgeDispatchScope(async () => {
          await upstream.callTool("fixture_known_return", {});
          throw new Error("fixture evidence validation failed");
        }),
        /fixture evidence validation failed/u,
      );
      assert.deepEqual(settlements, [{ kind: "end" }]);
      await upstream.withAuthenticatedBridgeDispatchScope(() =>
        Promise.resolve("lease released"),
      );
      assert.deepEqual(settlements, [
        { kind: "end" },
        { kind: "abort", outcome: "not-dispatched" },
      ]);
    } finally {
      authenticated.client.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("retains an ambiguous thrown call lease until exact session closure", async () => {
    const backend = await listeningServer();
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const first = await establishProxySession(
      gateway,
      backend,
      Buffer.alloc(32, 35).toString("base64url"),
    );
    const settlements = observeLeaseSettlements(gateway);
    const upstream = createUpstreamScopeHarness(gateway, () =>
      Promise.reject(new Error("fixture upstream timeout")),
    );
    let replacement: Awaited<ReturnType<typeof establishProxySession>> | null =
      null;
    try {
      await assert.rejects(
        upstream.withAuthenticatedBridgeDispatchScope(() =>
          upstream.callTool("fixture_timeout", {}, 1),
        ),
        /fixture upstream timeout/u,
      );
      assert.deepEqual(settlements, [
        { kind: "abort", outcome: "ambiguous-after-dispatch" },
      ]);
      await assert.rejects(
        upstream.withAuthenticatedBridgeDispatchScope(() =>
          Promise.resolve("must remain blocked"),
        ),
        /Another authenticated bridge dispatch lease is active/u,
      );

      const firstClientClosed = once(first.client, "close");
      const firstBackendClosed = once(first.privateSocket, "close");
      first.client.close();
      await Promise.all([firstClientClosed, firstBackendClosed]);
      replacement = await establishProxySession(
        gateway,
        backend,
        Buffer.alloc(32, 36).toString("base64url"),
      );
    } finally {
      first.client.terminate();
      replacement?.client.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("refuses gateway shutdown while a dispatched lease is still in flight", async () => {
    const backend = await listeningServer();
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const authenticated = await establishProxySession(
      gateway,
      backend,
      Buffer.alloc(32, 58).toString("base64url"),
    );
    const lifecycle = gateway.lifecycle();
    const binding = gateway.beginDispatchLease(
      lifecycle.gatewayInstanceId,
      String(lifecycle.activeSession?.sessionId),
    );
    try {
      await assert.rejects(gateway.close(), /dispatched call is still in flight/u);
      assert.equal(
        gateway.lifecycle().activeSession?.sessionId,
        lifecycle.activeSession?.sessionId,
      );
      gateway.endDispatchLease(binding);
      await gateway.close();
      assert.equal(gateway.closedSession(binding.sessionId)?.sessionId, binding.sessionId);
    } finally {
      authenticated.client.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("allows exact session shutdown to settle an ambiguous retained lease", async () => {
    const backend = await listeningServer();
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const authenticated = await establishProxySession(
      gateway,
      backend,
      Buffer.alloc(32, 59).toString("base64url"),
    );
    const lifecycle = gateway.lifecycle();
    const binding = gateway.beginDispatchLease(
      lifecycle.gatewayInstanceId,
      String(lifecycle.activeSession?.sessionId),
    );
    assert.deepEqual(
      gateway.abortDispatchLease(binding, "ambiguous-after-dispatch"),
      { released: false, retainedUntilSessionClose: true },
    );
    try {
      await gateway.close();
      assert.equal(gateway.closedSession(binding.sessionId)?.sessionId, binding.sessionId);
      assert.doesNotThrow(() => {
        gateway.assertDispatchLeaseForCall();
      });
    } finally {
      authenticated.client.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("rejects nested scopes without releasing the outer authority", async () => {
    const backend = await listeningServer();
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const authenticated = await establishProxySession(
      gateway,
      backend,
      Buffer.alloc(32, 37).toString("base64url"),
    );
    const settlements = observeLeaseSettlements(gateway);
    const upstream = createUpstreamScopeHarness(gateway, () =>
      Promise.resolve(SUCCESSFUL_TOOL_RESULT),
    );
    try {
      await upstream.withAuthenticatedBridgeDispatchScope(async () => {
        await assert.rejects(
          upstream.withAuthenticatedBridgeDispatchScope(() =>
            Promise.resolve("nested"),
          ),
          /Nested authenticated bridge dispatch scopes are prohibited/u,
        );
        await upstream.callTool("fixture_after_nested_rejection", {});
      });
      assert.deepEqual(settlements, [{ kind: "end" }]);
    } finally {
      authenticated.client.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });

  void test("blocks replacement authentication while the exact A scope is alive", async () => {
    const backend = await listeningServer();
    let backendConnections = 0;
    backend.on("connection", () => {
      backendConnections += 1;
    });
    const gateway = createGateway(serverPort(backend));
    await gateway.start();
    await gateway.bindBackendOwner(process.pid);
    const first = await establishProxySession(
      gateway,
      backend,
      Buffer.alloc(32, 38).toString("base64url"),
    );
    const upstream = createUpstreamScopeHarness(gateway, () =>
      Promise.resolve(SUCCESSFUL_TOOL_RESULT),
    );
    let finalClient: WebSocketClient | null = null;
    try {
      await upstream.withAuthenticatedBridgeDispatchScope(async () => {
        await upstream.callTool("fixture_bound_to_A", {});
        const replacement = await openClient(
          gateway.lifecycle().publicEndpoint.port,
        );
        try {
          await expectAuthenticationRejection(
            replacement,
            Buffer.alloc(32, 39).toString("base64url"),
          );
        } finally {
          replacement.terminate();
        }
        assert.equal(backendConnections, 1);
      });
      const firstClientClosed = once(first.client, "close");
      const firstBackendClosed = once(first.privateSocket, "close");
      first.client.close();
      await Promise.all([firstClientClosed, firstBackendClosed]);
      const final = await establishProxySession(
        gateway,
        backend,
        Buffer.alloc(32, 40).toString("base64url"),
      );
      finalClient = final.client;
      assert.equal(backendConnections, 2);
    } finally {
      first.client.terminate();
      finalClient?.terminate();
      await gateway.close();
      await closeServer(backend);
    }
  });
});
