// oxlint-disable import/max-dependencies -- This end-to-end sandbox fixture composes filesystem, WebSocket, bridge-auth, launcher, and lifecycle boundaries in one process.
import assert from "node:assert/strict";
import { once } from "node:events";
import {
  access,
  chmod,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";
import { setTimeout as wait } from "node:timers/promises";

import WebSocketClient from "ws";
import type { RawData } from "ws";

import { sha256Text } from "../src/core.ts";
import {
  DESCRIPTOR_SANITIZER_SCHEMA,
  DESCRIPTOR_SANITIZER_SHA256,
} from "../src/descriptor-sanitizer-identity.ts";
import { AUTHENTICATED_BRIDGE_REVIEWED_SOURCE_IDENTITY } from "../src/authenticated-bridge-build-identity.ts";
import {
  BRIDGE_AUTHENTICATION_PROTOCOL,
  computeBridgeAuthenticationMac,
} from "../src/authenticated-bridge-gateway.ts";
import {
  buildUpstreamEnvironment,
  configuredBridgeAuthenticationKey,
  openConfiguredControlRootCapability,
  prepareBoundUpstreamEnvironment,
} from "../src/upstream-environment.ts";
import {
  assertPathSealsCurrent,
  captureLauncherFingerprint,
  parseRuntimeLauncherFingerprint,
} from "../src/upstream-trust.ts";
import { UpstreamEasyedaClient } from "../src/upstream.ts";
// oxlint-enable import/max-dependencies

interface SavedEnvironmentValue {
  present: boolean;
  value?: string | undefined;
}

type SavedEnvironment = Record<string, SavedEnvironmentValue>;

let fixtureRoot = "";
let implementationRoot = "";
let entrypoint = "";
let assetsRoot = "";
let dependencyPayload = "";
let dotenvConfigPath = "";
let dotenvConfigSource = "";
let spawnMarker = "";
let bridgeTokenPath = "";
let fixtureServerSource = "";
let originalEnvironment: SavedEnvironment | undefined;
const bridgeToken = "t".repeat(64);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorChainIncludes(error: unknown, pattern: RegExp): boolean {
  const seen = new Set<unknown>();
  let current = error;
  while (current instanceof Error && !seen.has(current)) {
    if (pattern.test(current.message)) {
      return true;
    }
    seen.add(current);
    current = current.cause;
  }
  return false;
}

async function nextWebSocketJson(
  socket: WebSocketClient,
): Promise<Record<string, unknown>> {
  const { data, isBinary } = await Promise.race([
    // oxlint-disable-next-line promise/avoid-new -- ws exposes one frame through an EventEmitter callback, not a promise API.
    new Promise<{
      readonly data: RawData;
      readonly isBinary: boolean;
    }>((resolve) => {
      socket.once("message", (frame, binary) => {
        resolve({ data: frame, isBinary: binary });
      });
    }),
    wait(5000, undefined, { ref: false }).then(() => {
      throw new Error("Timed out waiting for the fixture WebSocket frame.");
    }),
  ]);
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
  if (!isRecord(value)) {
    throw new TypeError("Expected a JSON object WebSocket frame.");
  }
  return value;
}

async function authenticateFixtureExtension(
  socket: WebSocketClient,
): Promise<void> {
  const clientNonce = Buffer.alloc(32, 7).toString("base64url");
  socket.send(JSON.stringify({
    clientNonce,
    protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
    type: "auth.client_hello",
  }));
  const challenge = await nextWebSocketJson(socket);
  const serverNonce = String(challenge["serverNonce"]);
  assert.equal(
    challenge["serverProof"],
    computeBridgeAuthenticationMac(
      bridgeToken,
      "server-challenge",
      clientNonce,
      serverNonce,
    ),
  );
  const clientProof = computeBridgeAuthenticationMac(
    bridgeToken,
    "client-proof",
    clientNonce,
    serverNonce,
  );
  socket.send(JSON.stringify({
    clientNonce,
    clientProof,
    protocol: BRIDGE_AUTHENTICATION_PROTOCOL,
    serverNonce,
    type: "auth.client_proof",
  }));
  const accepted = await nextWebSocketJson(socket);
  assert.equal(accepted["type"], "auth.accepted");
}

function rememberEnvironment(names: readonly string[]): SavedEnvironment {
  return Object.fromEntries(
    names.map((name) => [
      name,
      Object.hasOwn(process.env, name)
        ? { present: true, value: process.env[name] }
        : { present: false },
    ]),
  );
}

function restoreEnvironment(saved: SavedEnvironment): void {
  for (const [name, record] of Object.entries(saved)) {
    if (record.present) {
      process.env[name] = record.value;
    } else {
      Reflect.deleteProperty(process.env, name);
    }
  }
}

before(async () => {
  fixtureRoot = await mkdtemp(join(tmpdir(), "easyeda-control-upstream-"));
  implementationRoot = join(fixtureRoot, "implementation");
  entrypoint = join(implementationRoot, "server.mjs");
  assetsRoot = join(fixtureRoot, "assets");
  dependencyPayload = join(fixtureRoot, "node_modules", "fixture", "payload.txt");
  dotenvConfigPath = join(fixtureRoot, "node_modules", "dotenv", "config.js");
  spawnMarker = join(
    fixtureRoot,
    "control-data",
    "upstream",
    "upstream-spawned.marker",
  );
  bridgeTokenPath = join(fixtureRoot, "control-data", "bridge-token");
  await mkdir(join(fixtureRoot, "control-data"), { mode: 0o700 });
  await mkdir(implementationRoot, { recursive: true });
  await mkdir(join(fixtureRoot, "node_modules", "dotenv"), {
    recursive: true,
  });
  await mkdir(join(fixtureRoot, "node_modules", "fixture"), {
    recursive: true,
  });
  await writeFile(
    join(fixtureRoot, "package.json"),
    `${JSON.stringify({ name: "upstream-fixture", type: "module" })}\n`,
    "utf8",
  );
  await writeFile(
    join(fixtureRoot, "node_modules", "dotenv", "package.json"),
    `${JSON.stringify({
      name: "dotenv",
      type: "module",
      exports: { "./config": "./config.js" },
    })}\n`,
    "utf8",
  );
  dotenvConfigSource = `
      import { readFileSync } from 'node:fs';
      const dotenvPath = process.env.DOTENV_CONFIG_PATH ?? '.env';
      const text = readFileSync(dotenvPath, 'utf8');
      for (const line of text.split(/\\r?\\n/u)) {
        const separator = line.indexOf('=');
        if (separator > 0) process.env[line.slice(0, separator)] = line.slice(separator + 1);
      }
    `;
  await writeFile(dotenvConfigPath, dotenvConfigSource, "utf8");
  await writeFile(dependencyPayload, "reviewed dependency\n", "utf8");
  await writeFile(
    join(fixtureRoot, ".env"),
    "MALICIOUS_DOTENV_SECRET=loaded-from-cwd\n",
    "utf8",
  );
  await writeFile(bridgeTokenPath, `${bridgeToken}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  fixtureServerSource = `
    import 'dotenv/config';
    import { createHash } from 'node:crypto';
    import dgram from 'node:dgram';
    import { fstatSync } from 'node:fs';
    import { writeFile } from 'node:fs/promises';
    import { createServer } from 'node:http';
    import net from 'node:net';

    let bridgeSocket;
    let bridgeRequestSequence = 0;
    const pendingBridgeResponses = new Map();

    function deniedNetworkAttempt(callback) {
      try {
        const value = callback();
        value?.close?.();
        return false;
      } catch {
        return true;
      }
    }

    const expectedBridgePort = Number(process.env.BRIDGE_PORT);
    const networkDenials = {
      datagramConstructor: deniedNetworkAttempt(() => new dgram.Socket('udp4')),
      datagramLowLevel: deniedNetworkAttempt(() => dgram._createSocketHandle('udp4')),
      datagramPrototype: dgram.Socket.prototype === undefined,
      tcpInheritedFd: deniedNetworkAttempt(() => Reflect.apply(
        net.Server.prototype._listen2,
        new net.Server(),
        ['127.0.0.1', expectedBridgePort, 4, false, 99, 0],
      )),
      tcpLowLevel: deniedNetworkAttempt(() => net._createServerHandle('0.0.0.0', 0, 4)),
      tcpWrongHost: deniedNetworkAttempt(() => Reflect.apply(
        net.Server.prototype._listen2,
        new net.Server(),
        ['0.0.0.0', expectedBridgePort, 4, false, undefined, 0],
      )),
      tcpWrongPort: deniedNetworkAttempt(() => Reflect.apply(
        net.Server.prototype._listen2,
        new net.Server(),
        ['127.0.0.1', expectedBridgePort + 1, 4, false, undefined, 0],
      )),
    };
    const unexpectedInheritedDescriptors = [142, 145].filter((descriptor) => {
      try {
        fstatSync(descriptor);
        return true;
      } catch (error) {
        if (error?.code === 'EBADF') return false;
        throw error;
      }
    });

    function sendWebSocketJson(socket, value) {
      const payload = Buffer.from(JSON.stringify(value), 'utf8');
      let header;
      if (payload.length < 126) {
        header = Buffer.from([129, payload.length]);
      } else if (payload.length <= 65535) {
        header = Buffer.alloc(4);
        header[0] = 129;
        header[1] = 126;
        header.writeUInt16BE(payload.length, 2);
      } else {
        throw new Error('fixture WebSocket frame is too large');
      }
      socket.write(Buffer.concat([header, payload]));
    }

    function acceptWebSocketFrames(socket, initial) {
      let bufferedFrames = Buffer.from(initial);
      const consume = () => {
        while (bufferedFrames.length >= 2) {
          const opcode = bufferedFrames[0] & 15;
          const masked = (bufferedFrames[1] & 128) !== 0;
          let length = bufferedFrames[1] & 127;
          let offset = 2;
          if (length === 126) {
            if (bufferedFrames.length < 4) return;
            length = bufferedFrames.readUInt16BE(2);
            offset = 4;
          } else if (length === 127) {
            throw new Error('fixture does not accept 64-bit WebSocket lengths');
          }
          if (!masked || bufferedFrames.length < offset + 4 + length) return;
          const mask = bufferedFrames.subarray(offset, offset + 4);
          offset += 4;
          const payload = Buffer.from(bufferedFrames.subarray(offset, offset + length));
          bufferedFrames = bufferedFrames.subarray(offset + length);
          for (let index = 0; index < payload.length; index += 1) {
            payload[index] ^= mask[index % 4];
          }
          if (opcode === 8) {
            socket.end();
            return;
          }
          if (opcode !== 1) throw new Error('fixture accepts only text frames');
          const message = JSON.parse(payload.toString('utf8'));
          if (message.type === 'handshake') {
            if (message.sessionToken !== process.env.BRIDGE_TOKEN) {
              throw new Error('fixture received the wrong private bridge token');
            }
            bridgeSocket = socket;
            sendWebSocketJson(socket, {
              type: 'hello',
              bridgeVersion: '1.0.0-rc.1',
              contractVersion: 1,
              supportedProtocolVersions: ['1.0.0'],
              maxPayloadSize: 1_048_576,
              supportsChunking: true,
              maxAggregatePayloadSize: 8_388_608,
              hotSwapEnabled: false,
              capabilities: ['api.call'],
              methodRegistryHash: 'fixture',
              devMode: false,
            });
          } else if (message.type === 'response') {
            const pending = pendingBridgeResponses.get(message.id);
            if (pending !== undefined) {
              pendingBridgeResponses.delete(message.id);
              pending(message);
            }
          }
        }
      };
      socket.on('data', (chunk) => {
        bufferedFrames = Buffer.concat([bufferedFrames, chunk]);
        consume();
      });
      consume();
    }

    const bridgeServer = createServer();
    bridgeServer.on('upgrade', (request, socket, head) => {
      const key = request.headers['sec-websocket-key'];
      if (typeof key !== 'string') throw new Error('missing WebSocket key');
      const accept = createHash('sha1')
        .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
        .digest('base64');
      socket.write(
        'HTTP/1.1 101 Switching Protocols\\r\\n' +
        'Upgrade: websocket\\r\\n' +
        'Connection: Upgrade\\r\\n' +
        'Sec-WebSocket-Accept: ' + accept + '\\r\\n\\r\\n',
      );
      acceptWebSocketFrames(socket, head);
    });
    await new Promise((resolve, reject) => {
      bridgeServer.once('error', reject);
      bridgeServer.listen(
        Number(process.env.BRIDGE_PORT),
        process.env.BRIDGE_HOST,
        undefined,
        resolve,
      );
    });
    await writeFile((process.env.DATA_DIR ?? '.') + '/upstream-spawned.marker', 'spawned\\n', 'utf8');
    function callBridge(params) {
      if (bridgeSocket === undefined) throw new Error('fixture bridge is unavailable');
      bridgeRequestSequence += 1;
      const id = 'fixture-' + String(bridgeRequestSequence);
      return new Promise((resolve) => {
        pendingBridgeResponses.set(id, resolve);
        sendWebSocketJson(bridgeSocket, {
          id,
          method: 'api.call',
          params,
          type: 'request',
        });
      });
    }
    async function handleMcpRequest(request) {
      let result;
      if (request.method === 'initialize') {
        result = {
          protocolVersion: request.params.protocolVersion,
          capabilities: { tools: {} },
          serverInfo: { name: 'fingerprint-fixture', version: '1.0.0' },
        };
      } else if (request.method === 'tools/list') {
        result = { tools: [{
          name: 'fixture_environment',
          description: JSON.stringify({
            inheritedSecret: process.env.CODEX_TEST_SECRET ?? null,
            dotenvSecret: process.env.MALICIOUS_DOTENV_SECRET ?? null,
            dotenvPath: process.env.DOTENV_CONFIG_PATH ?? null,
            home: process.env.HOME ?? null,
            nodeEnv: process.env.NODE_ENV ?? null,
            rawExec: process.env.BRIDGE_RAW_EXEC_ENABLED ?? null,
            rawExecExperimental: process.env.MCP_RAW_EXEC_EXPERIMENTAL ?? null,
              networkPolicy: process.env.EASYEDA_SANDBOX_NETWORK_POLICY ?? null,
              networkDenials,
              unexpectedInheritedDescriptors,
          }),
          annotations: { readOnlyHint: true, idempotentHint: true },
          inputSchema: { type: 'object', properties: {} },
        }] };
      } else if (
        request.method === 'tools/call' &&
        request.params?.name === 'easyeda_api_call'
      ) {
        const bridgeResponse = await callBridge(request.params.arguments);
        result = {
          content: [{ type: 'text', text: JSON.stringify(bridgeResponse.result) }],
          structuredContent: { ok: true, result: bridgeResponse.result },
        };
      } else {
        result = {};
      }
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: request.id, result }) + '\\n');
    }
    process.stdin.setEncoding('utf8');
    let buffered = '';
    process.stdin.on('data', (chunk) => {
      buffered += chunk;
      while (buffered.includes('\\n')) {
        const newline = buffered.indexOf('\\n');
        const line = buffered.slice(0, newline);
        buffered = buffered.slice(newline + 1);
        if (!line) continue;
        const request = JSON.parse(line);
        if (request.id === undefined) continue;
        void handleMcpRequest(request);
      }
    });
  `;
  await writeFile(entrypoint, fixtureServerSource, "utf8");
  await writeFile(
    join(fixtureRoot, "pnpm-lock.yaml"),
    "lockfileVersion: '9.0'\n",
    "utf8",
  );
  await mkdir(join(assetsRoot, "pro-pcb", "3.2.149.fixture", "js"), {
    recursive: true,
  });
  await mkdir(join(assetsRoot, "pro-api", "0.2.53.fixture"), {
    recursive: true,
  });
  await writeFile(
    join(assetsRoot, "pro-pcb", "3.2.149.fixture", "js", "pcb.js"),
    "pcb-fixture",
    "utf8",
  );
  await writeFile(
    join(assetsRoot, "pro-api", "0.2.53.fixture", "api.js"),
    "api-fixture",
    "utf8",
  );
  await writeFile(
    join(assetsRoot, "pro-api", "0.2.53.fixture", "api-types.js"),
    "api-adapter-fixture",
    "utf8",
  );
  await writeFile(
    join(assetsRoot, "pro-api", "0.2.53.fixture", "api-types.d.ts"),
    "api-declarations-fixture",
    "utf8",
  );

  const names = [
    "EASYEDA_UPSTREAM_COMMAND",
    "EASYEDA_UPSTREAM_ARGS_JSON",
    "EASYEDA_UPSTREAM_CWD",
    "EASYEDA_CONTROL_DATA_DIR",
    "EASYEDA_ASSETS_ROOT",
    "EASYEDA_PCB_BUNDLE_VERSION",
    "EASYEDA_PUBLIC_API_BUNDLE_VERSION",
    "EASYEDA_BRIDGE_TOKEN_FILE",
    "EASYEDA_BRIDGE_MAX_PAYLOAD_SIZE",
    "CODEX_TEST_SECRET",
  ];
  originalEnvironment = rememberEnvironment(names);
  process.env["EASYEDA_UPSTREAM_COMMAND"] = process.execPath;
  process.env["EASYEDA_UPSTREAM_ARGS_JSON"] = JSON.stringify([entrypoint]);
  process.env["EASYEDA_UPSTREAM_CWD"] = fixtureRoot;
  process.env["EASYEDA_CONTROL_DATA_DIR"] = join(fixtureRoot, "control-data");
  process.env["EASYEDA_ASSETS_ROOT"] = assetsRoot;
  process.env["EASYEDA_PCB_BUNDLE_VERSION"] = "3.2.149.fixture";
  process.env["EASYEDA_PUBLIC_API_BUNDLE_VERSION"] = "0.2.53.fixture";
  process.env["EASYEDA_BRIDGE_TOKEN_FILE"] = bridgeTokenPath;
  process.env["EASYEDA_BRIDGE_MAX_PAYLOAD_SIZE"] = "1048576";
  process.env["CODEX_TEST_SECRET"] = "must-not-cross-boundary";
  await mkdir(join(fixtureRoot, "control-data", "upstream"), {
    recursive: true,
    mode: 0o700,
  });
  const bridgeBuildDirectory = join(
    fixtureRoot,
    "control-data",
    "bridge-build",
  );
  const bridgeArtifactBasePath = join(
    bridgeBuildDirectory,
    "easyeda-pro-control-authenticated-bridge.eext",
  );
  const bridgeArtifact = "authenticated bridge fixture\n";
  const bridgeArtifactSha256 = sha256Text(bridgeArtifact);
  const bridgeArtifactPath = bridgeArtifactBasePath.replace(
    /\.eext$/u,
    `.${bridgeArtifactSha256}.eext`,
  );
  await mkdir(bridgeBuildDirectory, { mode: 0o700 });
  await writeFile(bridgeArtifactPath, bridgeArtifact, { mode: 0o600 });
  await writeFile(
    `${bridgeArtifactBasePath}.receipt.json`,
    `${JSON.stringify({
      schema: "easyeda-pro-control.authenticated-bridge-build.v2",
      outputPath: bridgeArtifactPath,
      outputSha256: bridgeArtifactSha256,
      outputBytes: Buffer.byteLength(bridgeArtifact),
      tokenSha256: sha256Text(bridgeToken),
      authenticatedIndexBuildId: `i${"f".repeat(43)}`,
      indexSha256: "1".repeat(64),
      authentication: {
        protocol: "easyeda-pro-control.bridge-auth.v1",
        publicEndpoint: { host: "127.0.0.1", port: 49_621 },
        rawTokenTransmission: false,
        adjacentPortFallback: false,
      },
      source: {
        ...AUTHENTICATED_BRIDGE_REVIEWED_SOURCE_IDENTITY,
        builtFromPrivateSnapshot: true,
        privateSnapshotSealed: true,
        postConsumptionVerified: true,
      },
    })}\n`,
    { mode: 0o600 },
  );
});

after(async () => {
  if (originalEnvironment) {
    restoreEnvironment(originalEnvironment);
  }
  if (fixtureRoot) {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
  if (spawnMarker) {
    await rm(spawnMarker, { force: true });
  }
});

void describe(
  "running upstream implementation fingerprint",
  { concurrency: false },
  () => {
    void test("accepts only the exact descriptor sanitizer runtime identity", async () => {
      const capture = await captureLauncherFingerprint();
      const fingerprint = capture.fingerprint;
      assert.deepEqual(fingerprint.sandbox.descriptorSanitizer, {
        schema: DESCRIPTOR_SANITIZER_SCHEMA,
        sha256: DESCRIPTOR_SANITIZER_SHA256,
      });
      assert.deepEqual(parseRuntimeLauncherFingerprint(fingerprint), fingerprint);

      const missingSchema = structuredClone(fingerprint);
      Reflect.deleteProperty(
        missingSchema.sandbox.descriptorSanitizer,
        "schema",
      );
      assert.throws(() => parseRuntimeLauncherFingerprint(missingSchema));

      const wrongSchema = structuredClone(fingerprint);
      Reflect.set(
        wrongSchema.sandbox.descriptorSanitizer,
        "schema",
        "easyeda-pro-control.descriptor-sanitizer.v2",
      );
      assert.throws(() => parseRuntimeLauncherFingerprint(wrongSchema));

      const wrongSha256 = structuredClone(fingerprint);
      wrongSha256.sandbox.descriptorSanitizer.sha256 = "b".repeat(64);
      assert.throws(() => parseRuntimeLauncherFingerprint(wrongSha256));
    });

    void test("keeps the startup fingerprint and reports later on-disk drift", async () => {
      const trustedLauncher = await new UpstreamEasyedaClient().launcherFingerprint();
      const controlRoot = await openConfiguredControlRootCapability();
      const upstream = new UpstreamEasyedaClient({
        bridgePublicPortForTesting: 0,
        controlRoot,
        trustedLauncher,
      });
      let extension: WebSocketClient | undefined;
      try {
        const tools = await upstream.listTools();
        assert.deepEqual(
          tools.map((tool) => tool.name),
          ["fixture_environment"],
        );
        const parsedEnvironment: unknown = JSON.parse(
          String(tools[0]?.description),
        );
        if (!isRecord(parsedEnvironment)) {
          throw new TypeError("Fixture environment report must be an object.");
        }
        const environment = parsedEnvironment;
        assert.equal(environment["inheritedSecret"], null);
        assert.equal(environment["dotenvSecret"], null);
        assert.equal(
          environment["dotenvPath"],
          process.platform === "win32" ? "NUL" : "/dev/null",
        );
        assert.equal(environment["home"], "/data");
        assert.equal(environment["nodeEnv"], "development");
        assert.equal(environment["rawExec"], "true");
        assert.equal(environment["rawExecExperimental"], "true");
        assert.equal(environment["networkPolicy"], "connect-denied-eperm");
        assert.deepEqual(environment["networkDenials"], {
          datagramConstructor: true,
          datagramLowLevel: true,
          datagramPrototype: true,
          tcpInheritedFd: true,
          tcpLowLevel: true,
          tcpWrongHost: true,
          tcpWrongPort: true,
        });
        assert.deepEqual(environment["unexpectedInheritedDescriptors"], []);

        const lifecycle = upstream.bridgeSessionLifecycle();
        assert.ok(lifecycle);
        extension = new WebSocketClient(
          `ws://127.0.0.1:${String(lifecycle.publicEndpoint.port)}`,
          { perMessageDeflate: false },
        );
        await once(extension, "open");
        await authenticateFixtureExtension(extension);
        const helloFrame = nextWebSocketJson(extension);
        extension.send(JSON.stringify({
          authenticatedIndexBuildId: `i${"f".repeat(43)}`,
          authenticationKeySha256: sha256Text(bridgeToken),
          clientName: "easyeda-mcp-pro",
          contractVersion: 1,
          protocol: "easyeda-mcp-pro.bridge",
          protocolVersion: "1.0.0",
          type: "handshake",
        }));
        const hello = await helloFrame;
        assert.equal(hello["type"], "hello");
        const forwardedRequest = nextWebSocketJson(extension);
        const proxiedCall = upstream.withAuthenticatedBridgeDispatchScope(
          (): Promise<unknown> =>
            upstream.callTool(
              "easyeda_api_call",
              {
                args: [],
                confirmWrite: false,
                path: "SYS_Environment.getSystemInfo",
              },
              5000,
            ),
        );
        const request = await forwardedRequest;
        assert.equal(request["type"], "request");
        assert.equal(request["method"], "api.call");
        extension.send(JSON.stringify({
          id: request["id"],
          ok: true,
          result: {
            path: "SYS_Environment.getSystemInfo",
            resolvedPath: "SYS_Environment.getSystemInfo",
            result: { sandboxProxy: true },
          },
          type: "response",
        }));
        assert.match(JSON.stringify(await proxiedCall), /sandboxProxy/u);
        extension.terminate();
        extension = undefined;

        const initial = await upstream.launcherState();
        assert.deepEqual(initial.startup, initial.current);
        assert.equal(initial.startupSha256, initial.currentSha256);
        assert.equal(initial.drift, false);
        assert.equal(initial.startup.entrypoint, entrypoint);
        assert.equal(
          initial.startup.implementationTree.root,
          implementationRoot,
        );
        assert.equal(initial.startup.executionClosure.root, fixtureRoot);
        assert.deepEqual(initial.startup.sandbox.descriptorSanitizer, {
          schema: DESCRIPTOR_SANITIZER_SCHEMA,
          sha256: DESCRIPTOR_SANITIZER_SHA256,
        });
        assert.ok(initial.startup.executionClosure.fileCount >= 6);
        assert.deepEqual(initial.startup.dependencyLock, {
          type: "pnpm",
          path: join(fixtureRoot, "pnpm-lock.yaml"),
          sha256: sha256Text("lockfileVersion: '9.0'\n"),
        });

        await writeFile(
          entrypoint,
          "\n// on-disk implementation changed after startup\n",
          {
            encoding: "utf8",
            flag: "a",
          },
        );
        const refreshedTools = await upstream.listTools(true);
        assert.deepEqual(refreshedTools.map((tool) => tool.name), [
          "fixture_environment",
        ]);
        const drifted = await upstream.launcherState();
        assert.deepEqual(drifted.startup, initial.startup);
        assert.notEqual(
          drifted.current.entrypointSha256,
          initial.current.entrypointSha256,
        );
        assert.notEqual(
          drifted.current.implementationTree.sha256,
          initial.current.implementationTree.sha256,
        );
        assert.notEqual(drifted.startupSha256, drifted.currentSha256);
        assert.equal(drifted.drift, true);
      } finally {
        extension?.terminate();
        await upstream.close();
        await controlRoot.close();
        await writeFile(entrypoint, fixtureServerSource, "utf8");
      }
    });

    void test("rejects transient executable mutation before bootstrap", async () => {
      const configuredSandbox = process.env["EASYEDA_BWRAP_COMMAND"];
      const sandboxCopy = join(fixtureRoot, "post-ready-race-bwrap");
      let childAuthorityPersisted = false;
      let upstream: UpstreamEasyedaClient | undefined;
      let controlRoot:
        | Awaited<ReturnType<typeof openConfiguredControlRootCapability>>
        | undefined;
      try {
        await rm(spawnMarker, { force: true });
        await copyFile("/usr/sbin/bwrap", sandboxCopy);
        await chmod(sandboxCopy, 0o755);
        process.env["EASYEDA_BWRAP_COMMAND"] = sandboxCopy;
        const reviewedBytes = await readFile(sandboxCopy);
        const trustedLauncher = await new UpstreamEasyedaClient().launcherFingerprint();
        controlRoot = await openConfiguredControlRootCapability();
        upstream = new UpstreamEasyedaClient({
          afterPreSpawnValidationForTesting: async (): Promise<void> => {
            const modified = Buffer.from(reviewedBytes);
            modified[0] = modified[0] === 0 ? 1 : 0;
            await writeFile(sandboxCopy, modified);
            await writeFile(sandboxCopy, reviewedBytes);
          },
          bridgePublicPortForTesting: 0,
          controlRoot,
          onChildStarted: (): Promise<void> => {
            childAuthorityPersisted = true;
            return Promise.resolve();
          },
          trustedLauncher,
        });
        await assert.rejects(
          upstream.listTools(),
          (error: unknown) =>
            errorChainIncludes(
              error,
              /Trusted upstream execution path changed between graph capture and sandbox admission/u,
            ),
        );
        assert.equal(childAuthorityPersisted, false);
        await assert.rejects(access(spawnMarker), { code: "ENOENT" });
      } finally {
        await upstream?.close();
        await controlRoot?.close();
        if (configuredSandbox === undefined) {
          Reflect.deleteProperty(process.env, "EASYEDA_BWRAP_COMMAND");
        } else {
          process.env["EASYEDA_BWRAP_COMMAND"] = configuredSandbox;
        }
        await rm(sandboxCopy, { force: true });
      }
    });

    void test("rejects dependency drift before the upstream can execute", async () => {
      const trustedLauncher = await new UpstreamEasyedaClient().launcherFingerprint();
      await rm(spawnMarker, { force: true });
      await writeFile(
        dotenvConfigPath,
        `${dotenvConfigSource}\n// unreviewed reachable module drift\n`,
        "utf8",
      );
      const controlRoot = await openConfiguredControlRootCapability();
      const upstream = new UpstreamEasyedaClient({
        bridgePublicPortForTesting: 0,
        controlRoot,
        trustedLauncher,
      });
      try {
        await assert.rejects(
          upstream.listTools(),
          /runtime module graph differs from the reviewed graph fingerprint/u,
        );
        await assert.rejects(
          access(spawnMarker),
          (error: unknown) =>
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "ENOENT",
        );
      } finally {
        await upstream.close();
        await controlRoot.close();
        await writeFile(dotenvConfigPath, dotenvConfigSource, "utf8");
      }
    });

    void test("detects a closure change during the final pre-spawn window", async () => {
      const capture = await captureLauncherFingerprint();
      await writeFile(dependencyPayload, "raced dependency payload\n", "utf8");
      try {
        await assert.rejects(
          assertPathSealsCurrent(capture.seals),
          /changed before spawn/u,
        );
      } finally {
        await writeFile(dependencyPayload, "reviewed dependency\n", "utf8");
      }
    });

    void test("rejects dependency symlinks that escape the reviewed cwd", async () => {
      const externalRoot = await mkdtemp(
        join(tmpdir(), "easyeda-unreviewed-dependency-"),
      );
      const externalFile = join(externalRoot, "payload.js");
      const dependencyLink = join(fixtureRoot, "node_modules", "escape.js");
      try {
        await writeFile(externalFile, "export default 'outside';\n", "utf8");
        await symlink(externalFile, dependencyLink, "file");
        await assert.rejects(
          captureLauncherFingerprint(),
          /dependency symlink escapes its reviewed cwd/u,
        );
      } finally {
        await rm(dependencyLink, { force: true });
        await rm(externalRoot, { recursive: true, force: true });
      }
    });

    void test("rejects launcher flags instead of expanding the trusted command", async () => {
      const originalArgs = process.env["EASYEDA_UPSTREAM_ARGS_JSON"];
      process.env["EASYEDA_UPSTREAM_ARGS_JSON"] = JSON.stringify([
        "--import",
        entrypoint,
      ]);
      try {
        await assert.rejects(
          new UpstreamEasyedaClient().launcherFingerprint(),
          /exactly one absolute Node entrypoint and no runtime flags/u,
        );
      } finally {
        process.env["EASYEDA_UPSTREAM_ARGS_JSON"] = originalArgs;
      }
    });

    void test("rejects a setuid or setgid bubblewrap executable", async () => {
      const configuredSandbox = process.env["EASYEDA_BWRAP_COMMAND"];
      const privilegedSandbox = join(fixtureRoot, "privileged-bwrap");
      try {
        await copyFile("/usr/sbin/bwrap", privilegedSandbox);
        await chmod(privilegedSandbox, 0o4755);
        process.env["EASYEDA_BWRAP_COMMAND"] = privilegedSandbox;
        await assert.rejects(
          captureLauncherFingerprint(),
          /must not carry setuid or setgid privilege bits/u,
        );
      } finally {
        if (configuredSandbox === undefined) {
          Reflect.deleteProperty(process.env, "EASYEDA_BWRAP_COMMAND");
        } else {
          process.env["EASYEDA_BWRAP_COMMAND"] = configuredSandbox;
        }
        await rm(privilegedSandbox, { force: true });
      }
    });

    void test("requires an owner-only bridge token file", async () => {
      const controlRoot = await openConfiguredControlRootCapability();
      try {
        assert.equal(
          await configuredBridgeAuthenticationKey(controlRoot),
          bridgeToken,
        );
        if (process.platform !== "win32") {
          await chmod(bridgeTokenPath, 0o644);
          try {
            await assert.rejects(
              configuredBridgeAuthenticationKey(controlRoot),
              /must not grant group or other permissions/u,
            );
          } finally {
            await chmod(bridgeTokenPath, 0o600);
          }
        }

        const configuredPath = process.env["EASYEDA_BRIDGE_TOKEN_FILE"];
        Reflect.deleteProperty(process.env, "EASYEDA_BRIDGE_TOKEN_FILE");
        try {
          await assert.rejects(
            buildUpstreamEnvironment(
              process.execPath,
              undefined,
              controlRoot,
            ),
            /required; unauthenticated bridge startup is prohibited/u,
          );
        } finally {
          process.env["EASYEDA_BRIDGE_TOKEN_FILE"] = configuredPath;
        }
      } finally {
        await controlRoot.close();
      }
    });

    void test("accepts separator-safe child names beginning with two dots", async () => {
      const configuredDataDirectory =
        process.env["EASYEDA_UPSTREAM_DATA_DIR"];
      const configuredArgs = process.env["EASYEDA_UPSTREAM_ARGS_JSON"];
      const dottedDataDirectory = join(
        fixtureRoot,
        "control-data",
        "..upstream-data",
      );
      const dottedImplementationRoot = join(
        fixtureRoot,
        "..implementation",
      );
      const dottedEntrypoint = join(dottedImplementationRoot, "server.mjs");
      const controlRoot = await openConfiguredControlRootCapability();
      try {
        process.env["EASYEDA_UPSTREAM_DATA_DIR"] = dottedDataDirectory;
        const environment = await buildUpstreamEnvironment(
          process.execPath,
          {
            host: "127.0.0.1",
            port: 49_622,
            sessionToken: "b".repeat(64),
          },
          controlRoot,
        );
        assert.equal(environment["HOME"], "/data");
        assert.equal(environment["DATA_DIR"], "/data");

        await mkdir(dottedImplementationRoot);
        await writeFile(dottedEntrypoint, fixtureServerSource, "utf8");
        process.env["EASYEDA_UPSTREAM_ARGS_JSON"] = JSON.stringify([
          dottedEntrypoint,
        ]);
        const capture = await captureLauncherFingerprint();
        assert.equal(
          capture.fingerprint.implementationTree.root,
          dottedImplementationRoot,
        );
        assert.equal(
          capture.fingerprint.implementationTree.root,
          dottedImplementationRoot,
        );
      } finally {
        await controlRoot.close();
        await rm(dottedImplementationRoot, { recursive: true, force: true });
        if (configuredDataDirectory === undefined) {
          Reflect.deleteProperty(process.env, "EASYEDA_UPSTREAM_DATA_DIR");
        } else {
          process.env["EASYEDA_UPSTREAM_DATA_DIR"] = configuredDataDirectory;
        }
        if (configuredArgs === undefined) {
          Reflect.deleteProperty(process.env, "EASYEDA_UPSTREAM_ARGS_JSON");
        } else {
          process.env["EASYEDA_UPSTREAM_ARGS_JSON"] = configuredArgs;
        }
      }
    });

    void test("rejects a symlinked upstream data directory before spawn", async () => {
      const configuredDataDirectory =
        process.env["EASYEDA_UPSTREAM_DATA_DIR"];
      const controlRoot = join(fixtureRoot, "control-data");
      const outsideDirectory = join(fixtureRoot, "outside-upstream-data");
      const redirectedDirectory = join(controlRoot, "redirected-upstream");
      await mkdir(outsideDirectory, { mode: 0o700 });
      await symlink(outsideDirectory, redirectedDirectory, "dir");
      const controlRootCapability =
        await openConfiguredControlRootCapability();
      try {
        process.env["EASYEDA_UPSTREAM_DATA_DIR"] = redirectedDirectory;
        await assert.rejects(
          buildUpstreamEnvironment(
            process.execPath,
            {
              host: "127.0.0.1",
              port: 49_622,
              sessionToken: "b".repeat(64),
            },
            controlRootCapability,
          ),
          /Managed parent is not a real directory/u,
        );
      } finally {
        await controlRootCapability.close();
        await rm(redirectedDirectory, { force: true });
        await rm(outsideDirectory, { recursive: true, force: true });
        if (configuredDataDirectory === undefined) {
          Reflect.deleteProperty(process.env, "EASYEDA_UPSTREAM_DATA_DIR");
        } else {
          process.env["EASYEDA_UPSTREAM_DATA_DIR"] = configuredDataDirectory;
        }
      }
    });

    void test("rejects the credential-bearing control root as upstream data", async () => {
      const configuredDataDirectory =
        process.env["EASYEDA_UPSTREAM_DATA_DIR"];
      const controlRootPath = join(fixtureRoot, "control-data");
      const controlRoot = await openConfiguredControlRootCapability();
      try {
        process.env["EASYEDA_UPSTREAM_DATA_DIR"] = controlRootPath;
        await assert.rejects(
          buildUpstreamEnvironment(
            process.execPath,
            {
              host: "127.0.0.1",
              port: 49_622,
              sessionToken: "b".repeat(64),
            },
            controlRoot,
          ),
          /must be a dedicated child/u,
        );
      } finally {
        await controlRoot.close();
        if (configuredDataDirectory === undefined) {
          Reflect.deleteProperty(process.env, "EASYEDA_UPSTREAM_DATA_DIR");
        } else {
          process.env["EASYEDA_UPSTREAM_DATA_DIR"] = configuredDataDirectory;
        }
      }
    });

    void test("rejects a multi-segment upstream data path without creating ancestors", async () => {
      const configuredDataDirectory =
        process.env["EASYEDA_UPSTREAM_DATA_DIR"];
      const controlRootPath = join(fixtureRoot, "control-data");
      const unexpectedParent = join(controlRootPath, "unexpected-parent");
      const controlRoot = await openConfiguredControlRootCapability();
      try {
        process.env["EASYEDA_UPSTREAM_DATA_DIR"] = join(
          unexpectedParent,
          "nested-data",
        );
        await assert.rejects(
          buildUpstreamEnvironment(
            process.execPath,
            {
              host: "127.0.0.1",
              port: 49_622,
              sessionToken: "b".repeat(64),
            },
            controlRoot,
          ),
          /must be a dedicated child/u,
        );
        await assert.rejects(access(unexpectedParent), { code: "ENOENT" });
      } finally {
        await controlRoot.close();
        if (configuredDataDirectory === undefined) {
          Reflect.deleteProperty(process.env, "EASYEDA_UPSTREAM_DATA_DIR");
        } else {
          process.env["EASYEDA_UPSTREAM_DATA_DIR"] = configuredDataDirectory;
        }
      }
    });

    void test("rejects a configured bridge token outside the retained control root", async () => {
      const configuredTokenPath = process.env["EASYEDA_BRIDGE_TOKEN_FILE"];
      const outsideTokenPath = join(fixtureRoot, "outside-bridge-token");
      await writeFile(outsideTokenPath, `${bridgeToken}\n`, { mode: 0o600 });
      const controlRoot = await openConfiguredControlRootCapability();
      try {
        process.env["EASYEDA_BRIDGE_TOKEN_FILE"] = outsideTokenPath;
        await assert.rejects(
          buildUpstreamEnvironment(
            process.execPath,
            {
              host: "127.0.0.1",
              port: 49_622,
              sessionToken: "b".repeat(64),
            },
            controlRoot,
          ),
          /must stay inside EASYEDA_CONTROL_DATA_DIR/u,
        );
      } finally {
        await controlRoot.close();
        await rm(outsideTokenPath, { force: true });
        if (configuredTokenPath === undefined) {
          Reflect.deleteProperty(process.env, "EASYEDA_BRIDGE_TOKEN_FILE");
        } else {
          process.env["EASYEDA_BRIDGE_TOKEN_FILE"] = configuredTokenPath;
        }
      }
    });

    void test("rejects a post-validation control-root pathname replacement", async () => {
      const parent = await mkdtemp(join("/tmp", "easyeda-upstream-root-cap-"));
      const root = join(parent, "control");
      const movedRoot = join(parent, "control-moved");
      const dataDirectory = join(root, "upstream");
      const movedDataDirectory = join(root, "upstream-moved");
      const configuredRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
      const configuredDataDirectory =
        process.env["EASYEDA_UPSTREAM_DATA_DIR"];
      const configuredTokenPath = process.env["EASYEDA_BRIDGE_TOKEN_FILE"];
      const rootTokenPath = join(root, "bridge-token");
      await mkdir(root, { mode: 0o700 });
      await writeFile(rootTokenPath, `${bridgeToken}\n`, { mode: 0o600 });
      process.env["EASYEDA_CONTROL_DATA_DIR"] = root;
      process.env["EASYEDA_UPSTREAM_DATA_DIR"] = dataDirectory;
      process.env["EASYEDA_BRIDGE_TOKEN_FILE"] = rootTokenPath;
      const controlRoot = await openConfiguredControlRootCapability();
      let prepared:
        | Awaited<ReturnType<typeof prepareBoundUpstreamEnvironment>>
        | undefined;
      try {
        prepared = await prepareBoundUpstreamEnvironment(
          process.execPath,
          {
            host: "127.0.0.1",
            port: 49_622,
            sessionToken: "b".repeat(64),
          },
          controlRoot,
        );
        const { environment } = prepared;
        assert.equal(environment["HOME"], "/data");
        assert.equal(environment["DATA_DIR"], "/data");
        assert.equal(
          prepared.dataDirectory.absolute,
          dataDirectory,
        );

        await rename(dataDirectory, movedDataDirectory);
        await mkdir(dataDirectory, { mode: 0o700 });
        await assert.rejects(
          prepared.assertCurrent(),
          /data-directory pathname changed/u,
        );
        assert.deepEqual(await readdir(dataDirectory), []);
        await rm(dataDirectory, { recursive: true, force: true });
        await rename(movedDataDirectory, dataDirectory);
        await prepared.assertCurrent();

        await rename(root, movedRoot);
        await mkdir(root, { mode: 0o700 });
        const retainedDataDirectory = await prepared.dataDirectory.handle.stat({
          bigint: true,
        });
        assert.equal(retainedDataDirectory.dev, prepared.dataDirectory.info.dev);
        assert.equal(retainedDataDirectory.ino, prepared.dataDirectory.info.ino);
        await assert.rejects(
          buildUpstreamEnvironment(
            process.execPath,
            {
              host: "127.0.0.1",
              port: 49_622,
              sessionToken: "b".repeat(64),
            },
            controlRoot,
          ),
          /control-root pathname changed/u,
        );
        assert.deepEqual(await readdir(root), []);
      } finally {
        await prepared?.dataDirectory.handle.close();
        await controlRoot.close();
        if (configuredRoot === undefined) {
          Reflect.deleteProperty(process.env, "EASYEDA_CONTROL_DATA_DIR");
        } else {
          process.env["EASYEDA_CONTROL_DATA_DIR"] = configuredRoot;
        }
        if (configuredDataDirectory === undefined) {
          Reflect.deleteProperty(process.env, "EASYEDA_UPSTREAM_DATA_DIR");
        } else {
          process.env["EASYEDA_UPSTREAM_DATA_DIR"] = configuredDataDirectory;
        }
        if (configuredTokenPath === undefined) {
          Reflect.deleteProperty(process.env, "EASYEDA_BRIDGE_TOKEN_FILE");
        } else {
          process.env["EASYEDA_BRIDGE_TOKEN_FILE"] = configuredTokenPath;
        }
        await rm(parent, { recursive: true, force: true });
      }
    });

    void test("hashes the installed PCB and public API implementation files", async () => {
      const upstream = new UpstreamEasyedaClient();
      const bundles = await upstream.installedEasyedaBundles();
      assert.equal(bundles.assetsRoot, assetsRoot);
      assert.deepEqual(bundles.pcbEditor, {
        version: "3.2.149.fixture",
        implementationPath: join(
          assetsRoot,
          "pro-pcb",
          "3.2.149.fixture",
          "js",
          "pcb.js",
        ),
        implementationSha256: sha256Text("pcb-fixture"),
      });
      assert.deepEqual(bundles.publicApi, {
        version: "0.2.53.fixture",
        implementationPath: join(
          assetsRoot,
          "pro-api",
          "0.2.53.fixture",
          "api.js",
        ),
        implementationSha256: sha256Text("api-fixture"),
        adapterPath: join(
          assetsRoot,
          "pro-api",
          "0.2.53.fixture",
          "api-types.js",
        ),
        adapterSha256: sha256Text("api-adapter-fixture"),
        declarationsPath: join(
          assetsRoot,
          "pro-api",
          "0.2.53.fixture",
          "api-types.d.ts",
        ),
        declarationsSha256: sha256Text("api-declarations-fixture"),
      });
    });
  },
);
