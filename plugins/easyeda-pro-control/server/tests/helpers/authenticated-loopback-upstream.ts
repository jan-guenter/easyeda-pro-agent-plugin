import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { once } from "node:events";
import type { TestContext } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import WebSocketClient, { WebSocketServer } from "ws";
import { AuthenticatedBridgeGateway, BRIDGE_AUTHENTICATION_PROTOCOL, computeBridgeAuthenticationMac } from "../../src/authenticated-bridge-gateway.ts";
import { UpstreamEasyedaClient } from "../../src/upstream.ts";
import type { UpstreamToolResult } from "../../src/upstream.ts";
import { isRecord, sha256Text } from "../../src/core.ts";

const backendToken = "c".repeat(64), buildId = `i${"b".repeat(43)}`, key = "a".repeat(64), nonce = Buffer.alloc(32, 17).toString("base64url");
const keyHash = createHash("sha256").update(key).digest("hex"), maximum = 1_048_576;
async function nextJson(socket: WebSocketClient): Promise<Record<string, unknown>> {
  const values: unknown[] = await once(socket, "message", { signal: AbortSignal.timeout(5000) });
  const value = values[0];
  assert.ok(Buffer.isBuffer(value)); const parsed: unknown = JSON.parse(value.toString("utf8")); assert.ok(isRecord(parsed)); return parsed;
}
function exchange(socket: WebSocketClient, packet: unknown): Promise<Record<string, unknown>> {
  const response = nextJson(socket); socket.send(JSON.stringify(packet)); return response;
}
/** Actual HMAC gateway and production AsyncLocalStorage/client dispatch. The
 * only socket peers are synthetic loopback test sockets; no MCP child, native
 * helper, application or user bridge connection is started or adopted. */
export async function authenticatedLoopbackUpstream(context: TestContext,
  invoke: (args: Record<string, unknown>) => Promise<UpstreamToolResult>, beforeClient?: () => Promise<void>): Promise<{
    upstream: UpstreamEasyedaClient; gateway: AuthenticatedBridgeGateway; closeOriginalSession: () => Promise<void>;
}> {
  const backend = new WebSocketServer({ host: "127.0.0.1", port: 0, perMessageDeflate: false });
  await once(backend, "listening", { signal: AbortSignal.timeout(5000) });
  const address = backend.address(); assert.ok(address !== null && typeof address !== "string");
  const gateway = new AuthenticatedBridgeGateway({ authenticationKey: key, authenticationTimeoutMs: 2000, backendHost: "127.0.0.1",
    backendPort: address.port, backendSessionToken: backendToken, expectedAuthenticatedIndexBuildId: buildId,
    expectedAuthenticationKeySha256: keyHash, maximumPayloadBytes: maximum, publicHost: "127.0.0.1", publicPort: 0 });
  const holder: { peer?: WebSocketClient } = {};
  context.after(async () => {
    holder.peer?.terminate(); await gateway.close();
    const closed = once(backend, "close", { signal: AbortSignal.timeout(5000) });
    for (const client of backend.clients) { client.terminate(); }
    backend.close(); await closed;
  });
  await gateway.start(); await gateway.bindBackendOwner(process.pid);
  const connection = once(backend, "connection", { signal: AbortSignal.timeout(5000) });
  const peer = new WebSocketClient(`ws://127.0.0.1:${String(gateway.lifecycle().publicEndpoint.port)}`, { headers: { Origin: "https://client" }, perMessageDeflate: false });
  holder.peer = peer; await once(peer, "open", { signal: AbortSignal.timeout(5000) });
  const challenge = await exchange(peer, { type: "auth.client_hello", protocol: BRIDGE_AUTHENTICATION_PROTOCOL, clientNonce: nonce });
  assert.equal(challenge["type"], "auth.server_challenge"); const serverNonce = challenge["serverNonce"]; assert.ok(typeof serverNonce === "string");
  assert.equal(challenge["serverProof"], computeBridgeAuthenticationMac(key, "server-challenge", nonce, serverNonce));
  const proof = computeBridgeAuthenticationMac(key, "client-proof", nonce, serverNonce);
  const accepted = await exchange(peer, { type: "auth.client_proof", protocol: BRIDGE_AUTHENTICATION_PROTOCOL, clientNonce: nonce, serverNonce, clientProof: proof });
  assert.equal(accepted["type"], "auth.accepted"); const sessionId = accepted["sessionId"]; assert.ok(typeof sessionId === "string");
  assert.equal(accepted["serverReceipt"], computeBridgeAuthenticationMac(key, "server-accepted", nonce, serverNonce, sessionId, proof));
  const connections: unknown[] = await connection;
  const privateValue = connections[0]; assert.ok(privateValue instanceof WebSocketClient);
  const privateHandshake = nextJson(privateValue);
  peer.send(JSON.stringify({ type: "handshake", protocol: "easyeda-mcp-pro.bridge", protocolVersion: "1.0.0", contractVersion: 1,
    authenticatedIndexBuildId: buildId, authenticationKeySha256: keyHash }));
  const privatePacket = await privateHandshake; assert.equal(privatePacket["sessionToken"], backendToken);
  const hello = nextJson(peer); privateValue.send(JSON.stringify({ type: "hello", contractVersion: 1, hotSwapEnabled: false,
    maxAggregatePayloadSize: maximum * 8, maxPayloadSize: maximum, supportedProtocolVersions: ["1.0.0"], supportsChunking: true }));
  const helloPacket = await hello; assert.equal(helloPacket["type"], "hello"); assert.ok(gateway.lifecycle().activeSession);
  const upstream = new UpstreamEasyedaClient();
  Object.defineProperties(upstream, { bridgeGateway: { value: gateway }, assertStartupAuthorityCurrent: { value: beforeClient ?? ((): Promise<void> => Promise.resolve()) },
    client: { value: { callTool: (request: { name: string; arguments: Record<string, unknown> }): Promise<UpstreamToolResult> => {
      assert.equal(request.name, "easyeda_execute"); assert.ok(upstream.currentAuthenticatedBridgeDispatchBinding()); return invoke(request.arguments);
    } } } });
  const closeOriginalSession = async (): Promise<void> => {
    if (peer.readyState !== WebSocketClient.CLOSED) {
      const closed = once(peer, "close", { signal: AbortSignal.timeout(5000) }); peer.close(); await closed;
    }
    for (let count = 0; count < 100 && gateway.lifecycle().activeSession !== null; count += 1) { await delay(10); }
    assert.equal(gateway.lifecycle().activeSession, null); assert.equal(gateway.closedSession(sessionId)?.authenticationReceiptSha256,
      sha256Text(String(accepted["serverReceipt"])));
  };
  return { upstream, gateway, closeOriginalSession };
}
