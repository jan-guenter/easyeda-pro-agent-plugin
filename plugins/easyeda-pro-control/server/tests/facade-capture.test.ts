/* oxlint-disable import/max-dependencies -- The builtin-only fixture helper isolates credential and upstream paths alongside these coordinator test dependencies. */
import { configureTestControlRoot } from "./test-control-root.ts";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { after, before, describe, test } from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import type { createOperation } from "../src/artifacts.ts";
import {
  OPERATION_SCHEMA,
  buildPlanHash,
  newOperationId,
  sha256Text,
} from "../src/core.ts";
import type { UpstreamLauncherFingerprint } from "../src/core.ts";

type ToolCallResult = Awaited<ReturnType<Client["callTool"]>>;
interface ArtifactModule {
  readonly createOperation: typeof createOperation;
}

interface FixtureConfig extends Record<string, unknown> {
  readonly documentType?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  assert.ok(isRecord(value), `${label} must be an object.`);
  return value;
}

function requireArray(value: unknown, label: string): unknown[] {
  assert.ok(Array.isArray(value), `${label} must be an array.`);
  return value;
}

function isArtifactModule(value: unknown): value is ArtifactModule {
  return isRecord(value) && typeof value["createOperation"] === "function";
}

function structured(result: ToolCallResult): Record<string, unknown> {
  return requireRecord(
    result.structuredContent,
    `structuredContent (${JSON.stringify(result.content)})`,
  );
}

const pluginRoot = resolve(import.meta.dirname, "../..");
const facadeSourceEntrypoint = join(
  pluginRoot,
  "server",
  "src",
  "index.ts",
);

let fixtureRoot: string;
let controlRoot: string;
let configPath: string;
let projectPath: string;
let fabricatedBoardDataMarker: string;
let upstreamCallLogPath: string;
let coldApiResult: Record<string, unknown>;
let coldApiCallLog: string;
let client: Client;
let transport: StdioClientTransport;
let expectedFingerprint: Record<string, unknown>;
let fixtureBridgeEndpoint: Record<string, unknown>;
let evidenceSequence = 0;
let facadeEntrypoint: string;

function replaceFacadeImport(
  _match: string,
  specifier: string,
): string {
  const absolute = resolve(dirname(facadeSourceEntrypoint), specifier);
  return `from ${JSON.stringify(pathToFileURL(absolute).href)}`;
}

function replacePackageImport(
  _match: string,
  specifier: string,
): string {
  return `from ${JSON.stringify(import.meta.resolve(specifier))}`;
}

async function fixtureLauncherFingerprint(
  upstreamEntrypoint: string,
): Promise<UpstreamLauncherFingerprint> {
  const names = [
    "EASYEDA_UPSTREAM_COMMAND",
    "EASYEDA_UPSTREAM_ARGS_JSON",
    "EASYEDA_UPSTREAM_CWD",
  ] as const;
  const previous = new Map<string, string | undefined>();
  try {
    for (const name of names) {
      previous.set(name, process.env[name]);
    }
    process.env["EASYEDA_UPSTREAM_COMMAND"] = process.execPath;
    process.env["EASYEDA_UPSTREAM_ARGS_JSON"] = JSON.stringify([
      upstreamEntrypoint,
    ]);
    process.env["EASYEDA_UPSTREAM_CWD"] = fixtureRoot;
    const { captureLauncherFingerprint } = await import(
      "../src/upstream-trust.ts"
    );
    const captured = await captureLauncherFingerprint();
    assert.deepEqual(
      [...captured.moduleGraph.modules.keys()],
      [pathToFileURL(upstreamEntrypoint).href],
      "the upstream fixture graph must remain self-contained under its cwd",
    );
    return captured.fingerprint;
  } finally {
    for (const name of names) {
      const value = previous.get(name);
      if (value === undefined) {
        Reflect.deleteProperty(process.env, name);
      } else {
        process.env[name] = value;
      }
    }
  }
}

async function writeConfig(config: FixtureConfig = {}): Promise<void> {
  await writeFile(
    configPath,
    `${JSON.stringify({ documentType: 1, ...config })}\n`,
    "utf8",
  );
}

function expectedContext(documentType = 1): Record<string, unknown> {
  return {
    project: { uuid: "project-1", path: projectPath },
    document: {
      uuid: "document-1",
      documentType,
      tabId: "tab-1",
    },
  };
}

function freshEvidence(label: string): {
  receiptPath: string;
  resultPath: string;
} {
  evidenceSequence += 1;
  const base = join(controlRoot, "evidence", `${label}-${evidenceSequence}`);
  return {
    resultPath: `${base}.result.json`,
    receiptPath: `${base}.receipt.json`,
  };
}

async function capture(
  config: FixtureConfig,
  label: string,
  requestOverrides: Record<string, unknown> = {},
  upstreamTool: "easyeda_canvas_capture" | "easyeda_canvas_capture_region" | "easyeda_schematic_capture_full_page" = "easyeda_schematic_capture_full_page",
): Promise<ToolCallResult> {
  await writeConfig(config);
  const documentType = config.documentType ?? 1;
  return client.callTool(
    {
      name: "easyeda_control_capture",
      arguments: {
        request: {
          upstreamTool,
          arguments: {
            ...(upstreamTool === "easyeda_schematic_capture_full_page" ? {
              projectId: "project-1", padding: 0, allowInferredA4: false,
            } : {}),
            ...(upstreamTool === "easyeda_canvas_capture_region" ? { left: 0, right: 100, top: 80, bottom: 0 } : {}),
            tabId: "tab-1",
            ...requestOverrides,
          },
        },
        expectedContext: expectedContext(documentType),
        expectedFingerprint,
        evidence: freshEvidence(label),
      },
    },
    undefined,
    { timeout: 30_000, maxTotalTimeout: 30_000 },
  );
}

async function genericRead(
  documentType: number,
  upstreamTool: string,
  arguments_: Record<string, unknown> = {},
): Promise<ToolCallResult> {
  await writeConfig({ documentType });
  return client.callTool(
    {
      name: "easyeda_control_read",
      arguments: {
        upstreamTool,
        arguments: arguments_,
        expectedContext: expectedContext(documentType),
        expectedFingerprint,
        returnMode: "full",
        maxInlineBytes: 65_536,
      },
    },
    undefined,
    { timeout: 30_000, maxTotalTimeout: 30_000 },
  );
}

function failureMessage(result: ToolCallResult): string {
  assert.equal(result.isError, true);
  const payload = structured(result);
  assert.equal(payload["ok"], false);
  const error = requireRecord(payload["error"], "structuredContent.error");
  assert.equal(typeof error["message"], "string");
  return String(error["message"]);
}

async function apiReference(request: Record<string, unknown>): Promise<Record<string, unknown>> {
  const response = await client.callTool({ name: "easyeda_control_api", arguments: { request } });
  assert.notEqual(response.isError, true, JSON.stringify(response.content));
  const payload = structured(response);
  assert.equal(payload["offline"], true);
  return requireRecord(payload["result"], "API result");
}

before(async () => {
  const { REVIEWED_BRIDGE_SOURCE } = await import("../../scripts/reviewed-bridge-source.ts");
  fixtureRoot = await mkdtemp(
    join(tmpdir(), "easyeda-control-facade-capture-"),
  );
  controlRoot = join(fixtureRoot, "control");
  projectPath = join(fixtureRoot, "fixture.eprj2");
  const implementationRoot = join(fixtureRoot, "upstream-implementation");
  const upstreamEntrypoint = join(implementationRoot, "server.mjs");
  const assetsRoot = join(fixtureRoot, "assets");
  const bridgeTokenPath = join(controlRoot, "bridge-token");
  const bridgeBuildRoot = join(controlRoot, "bridge-build");
  const upstreamDataRoot = join(controlRoot, "upstream-data");
  configPath = join(upstreamDataRoot, "capture-config.json");
  upstreamCallLogPath = join(upstreamDataRoot, "upstream-call-log.jsonl");
  fabricatedBoardDataMarker = join(
    upstreamDataRoot,
    "fabricated-board-data-reached",
  );
  const bridgeToken = [
    "capture",
    "fixture",
    "bridge",
    "credential",
    "0001",
  ].join("-");

  await mkdir(implementationRoot, { recursive: true });
  await mkdir(controlRoot, { mode: 0o700 });
  await mkdir(bridgeBuildRoot, { mode: 0o700 });
  await mkdir(upstreamDataRoot, { mode: 0o700 });
  await writeFile(upstreamCallLogPath, "", "utf8");
  await mkdir(join(fixtureRoot, "node_modules"));
  await mkdir(join(assetsRoot, "pro-pcb", "3.2.149.fixture", "js"), {
    recursive: true,
  });
  await mkdir(join(assetsRoot, "pro-api", "0.2.53.fixture"), {
    recursive: true,
  });
  await writeFile(projectPath, "fixture project identity", "utf8");
  await writeFile(
    join(fixtureRoot, "package.json"),
    `${JSON.stringify({
      name: "capture-fixture",
      private: true,
      type: "module",
    })}\n`,
    "utf8",
  );
  await writeFile(
    bridgeTokenPath,
    bridgeToken,
    { encoding: "utf8", mode: 0o600 },
  );
  const bridgeArchiveBytes = Buffer.from(
    "authenticated bridge fixture archive",
    "utf8",
  );
  const bridgeArchiveSha256 = sha256Text(
    bridgeArchiveBytes.toString("utf8"),
  );
  const bridgeArchivePath = join(
    bridgeBuildRoot,
    `easyeda-pro-control-authenticated-bridge.${bridgeArchiveSha256}.eext`,
  );
  await writeFile(bridgeArchivePath, bridgeArchiveBytes, { mode: 0o600 });
  await writeFile(
    join(
      bridgeBuildRoot,
      "easyeda-pro-control-authenticated-bridge.eext.receipt.json",
    ),
    `${JSON.stringify({
      schema: "easyeda-pro-control.authenticated-bridge-build.v2",
      buildId: "ded07x99dcxb504",
      outputPath: bridgeArchivePath,
      outputSha256: bridgeArchiveSha256,
      outputBytes: bridgeArchiveBytes.length,
      tokenSha256: sha256Text(bridgeToken),
      authenticatedIndexBuildId: ["i", "A".repeat(43)].join(""),
      indexSha256: bridgeArchiveSha256,
      authentication: {
        protocol: "easyeda-pro-control.bridge-auth.v1",
        rawTokenTransmission: false,
        adjacentPortFallback: false,
        publicEndpoint: { host: "127.0.0.1", port: 49_621 },
      },
      source: {
        repository: "https://github.com/oaslananka/easyeda-mcp-pro",
        commit: "964c05082f1c7c9e8b98f56e967e36bfc3f26128",
        upstreamTreeSha1: "cc8893215e736f9efca78e4216033469008ea8e9",
        closureSha256:
          "c5cb4d9ed0d5a93bca655f4f846f4f2e9337633941b2df3482aa3b91d7e43ee5",
        fileCount: 70,
        totalBytes: 853_680,
        derivative: REVIEWED_BRIDGE_SOURCE.derivative,
        builtFromPrivateSnapshot: true,
        privateSnapshotSealed: true,
        postConsumptionVerified: true,
      },
    })}\n`,
    { encoding: "utf8", mode: 0o600 },
  );
  await writeFile(
    join(fixtureRoot, "pnpm-lock.yaml"),
    "lockfileVersion: '9.0'\n",
    "utf8",
  );
  await writeFile(
    join(assetsRoot, "pro-pcb", "3.2.149.fixture", "js", "pcb.js"),
    "pcb fixture",
    "utf8",
  );
  await writeFile(
    join(assetsRoot, "pro-api", "0.2.53.fixture", "api.js"),
    "api fixture",
    "utf8",
  );
  await writeFile(
    join(assetsRoot, "pro-api", "0.2.53.fixture", "api-types.js"),
    "api adapter fixture",
    "utf8",
  );
  await writeFile(
    join(assetsRoot, "pro-api", "0.2.53.fixture", "api-types.d.ts"),
    "api declarations fixture",
    "utf8",
  );
  await writeConfig();

  await writeFile(
    upstreamEntrypoint,
    `
      import { appendFile, readFile, writeFile } from 'node:fs/promises';
      import { deflateSync } from 'node:zlib';

      const tool = (name, annotations, properties = {}) => ({
        name,
        annotations,
        inputSchema: { type: 'object', properties, additionalProperties: true },
        outputSchema: { type: 'object', additionalProperties: true },
      });
      const tools = [
        tool('easyeda_health_check', { readOnlyHint: true, idempotentHint: true }),
        tool('easyeda_bridge_status', { readOnlyHint: true, idempotentHint: true }),
        tool('easyeda_bridge_probe_methods', { readOnlyHint: true, idempotentHint: true }),
        tool(
          'easyeda_execute',
          { destructiveHint: true },
          { confirmWrite: { type: 'boolean' } },
        ),
        tool(
          'easyeda_schematic_capture_full_page',
          { readOnlyHint: true, idempotentHint: true },
        ),
        tool('easyeda_canvas_capture', { readOnlyHint: true, idempotentHint: false }),
        tool('easyeda_canvas_capture_region', { readOnlyHint: true, idempotentHint: false }),
        tool('easyeda_schematic_components', { readOnlyHint: true, idempotentHint: true }),
        tool('easyeda_pcb_components', { readOnlyHint: true, idempotentHint: true }),
        tool('easyeda_pcb_constraint_check', { readOnlyHint: true, idempotentHint: true }),
        tool('easyeda_pcb_constraint_report', { readOnlyHint: true, idempotentHint: true }),
        tool('easyeda_pcb_production_review', { readOnlyHint: true, idempotentHint: true }),
        tool('easyeda_board_dimensions', { readOnlyHint: true, idempotentHint: true }),
        tool('easyeda_component_probe', { readOnlyHint: true, idempotentHint: true }),
        tool('easyeda_live_smoke_report', { readOnlyHint: true, idempotentHint: true }),
        tool('easyeda_wire_probe', { readOnlyHint: true, idempotentHint: true }),
      ];
      const result = (payload, content = []) => ({
        content: [
          { type: 'text', text: JSON.stringify({ ok: true, result: payload }) },
          ...content,
        ],
        structuredContent: { ok: true, result: payload },
      });
      const crc32 = (bytes) => {
        let crc = 0xffffffff;
        for (const byte of bytes) {
          crc ^= byte;
          for (let bit = 0; bit < 8; bit += 1) {
            crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
          }
        }
        return (crc ^ 0xffffffff) >>> 0;
      };
      const pngChunk = (type, data) => {
        const name = Buffer.from(type, 'ascii');
        const body = Buffer.from(data);
        const chunk = Buffer.alloc(12 + body.length);
        chunk.writeUInt32BE(body.length, 0);
        name.copy(chunk, 4);
        body.copy(chunk, 8);
        chunk.writeUInt32BE(crc32(Buffer.concat([name, body])), 8 + body.length);
        return chunk;
      };
      const makePng = (
        validIhdr,
        width,
        height,
        headerWidth = width,
        headerHeight = height,
      ) => {
        const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
        const header = Buffer.alloc(13);
        header.writeUInt32BE(headerWidth, 0);
        header.writeUInt32BE(headerHeight, 4);
        header[8] = 8;
        header[9] = 6;
        header[10] = 0;
        header[11] = 0;
        header[12] = 0;
        const stride = 1 + width * 4;
        const pixels = Buffer.alloc(stride * height);
        for (let row = 0; row < height; row += 1) {
          pixels[row * stride] = 0;
          for (let column = 0; column < width; column += 1) {
            pixels[row * stride + 1 + column * 4 + 3] = 255;
          }
        }
        return Buffer.concat([
          signature,
          pngChunk(validIhdr ? 'IHDR' : 'NOPE', header),
          pngChunk('IDAT', deflateSync(pixels)),
          pngChunk('IEND', Buffer.alloc(0)),
        ]);
      };
      const readConfig = async () =>
        JSON.parse(await readFile('/data/capture-config.json', 'utf8'));

      const handleToolCall = async (request) => {
        const config = await readConfig();
        if (config.unavailable === true) {
          throw new Error('Fixture upstream and editor context are unavailable.');
        }
        if (request.params.name === 'easyeda_health_check') {
          if (config.captureReturned === true && config.captureFingerprintDrift === 'unavailable') {
            throw new Error('Fixture health probe disappeared after capture.');
          }
          return result({
            version: '1.0.0-rc.1',
            node_version: '24.18.0',
            bridge_connected: true,
            easyeda_version: '3.2.149.88089769',
            extension_version: config.captureReturned === true && config.captureFingerprintDrift === 'version'
              ? 'fixture-changed-after-capture' : '1.0.0-rc.1',
            extension_version_mismatch: false,
            registry_mismatch: false,
          });
        }
        if (request.params.name === 'easyeda_bridge_status') {
          return result({
            connected: true,
            bridge_version: '1.0.0-rc.1',
            easyeda_version: '3.2.149.88089769',
            diagnostics: { method_registry_hash: 'fixture-registry' },
          });
        }
        if (request.params.name === 'easyeda_bridge_probe_methods') {
          return result({
            source: 'loader_status',
            dispatcher_build_id: 'd18b6xd531xe6ca',
            total: 116,
          });
        }
        if (request.params.name === 'easyeda_execute') {
          const documentType = config.documentType ?? 1;
          return result({
            ok: true,
            project: {
              uuid: 'project-1',
              name: 'Capture fixture',
              path: ${JSON.stringify(projectPath)},
            },
            document: {
              uuid: 'document-1',
              documentType,
              parentProjectUuid: 'project-1',
              tabId: 'tab-1',
              title: documentType === 1 ? 'Sheet 01' : 'PCB',
            },
            schematic: documentType === 1
              ? { uuid: 'schematic-1', parentProjectUuid: 'project-1' }
              : {},
            schematicPage: documentType === 1
              ? { uuid: 'document-1', parentSchematicUuid: 'schematic-1', parentProjectUuid: 'project-1', tabId: 'tab-1', title: 'Sheet 01' }
              : {},
            pcb: documentType === 3
              ? { uuid: 'document-1', tabId: 'tab-1', title: 'PCB' }
              : {},
          });
        }
        if (['easyeda_canvas_capture', 'easyeda_canvas_capture_region', 'easyeda_schematic_capture_full_page'].includes(request.params.name)) {
          const width = config.pngWidth ?? 2;
          const height = config.pngHeight ?? 3;
          const png = makePng(
            config.validIhdr !== false,
            width,
            height,
            config.pngHeaderWidth ?? width,
            config.pngHeaderHeight ?? height,
          );
          if (config.corruptPngCrc === true) png[png.length - 1] ^= 1;
          const payload = {
            captured: true,
            project_id: 'project-1',
            deterministic_viewport: true,
            sheet: { source: 'sheet-info', width: 100, height: 80, unit: 'mil' },
            viewport: { left: 0, top: 80, right: 100, bottom: 0 },
            image_dimensions: { width, height },
            sheet_to_image_transform: {
              scale_x: width / 100,
              scale_y: -height / 80,
              offset_x: 0,
              offset_y: height,
            },
            selection_overlays_removed: true,
            warnings: [],
            mime_type: config.payloadMimeType ?? 'image/png',
            byte_length: config.payloadByteLength ?? png.length,
            image_base64:
              config.payloadBase64 === 'mismatch'
                ? Buffer.from('different image bytes').toString('base64')
                : png.toString('base64'),
            ...(config.capture ?? {}),
          };
          for (const field of config.omit ?? []) delete payload[field];
          const image = {
            type: 'image',
            data: png.toString('base64'),
            mimeType: config.imageMimeType ?? 'image/png',
          };
          const images = Array.from({ length: config.imageCount ?? 1 }, () => image);
          if (config.captureFingerprintDrift) {
            await writeFile('/data/capture-config.json', JSON.stringify({ ...config, captureReturned: true }), 'utf8');
          }
          return result(payload, images);
        }
        if (
          [
            'easyeda_schematic_components',
            'easyeda_pcb_components',
            'easyeda_pcb_constraint_check',
            'easyeda_pcb_constraint_report',
            'easyeda_pcb_production_review',
            'easyeda_board_dimensions',
            'easyeda_component_probe',
            'easyeda_live_smoke_report',
            'easyeda_wire_probe',
          ].includes(request.params.name)
        ) {
          if (
            request.params.name.startsWith('easyeda_pcb_constraint_') ||
            request.params.name === 'easyeda_pcb_production_review'
          ) {
            if (Object.hasOwn(request.params.arguments ?? {}, 'boardData')) {
              await writeFile(
                '/data/fabricated-board-data-reached',
                request.params.name,
                'utf8',
              );
            }
          }
          return result({ dispatched: true, tool: request.params.name });
        }
        throw new Error('Unexpected fixture tool: ' + request.params.name);
      };

      let bufferedInput = '';
      for await (const chunk of process.stdin) {
        bufferedInput += String(chunk);
        let newline = bufferedInput.indexOf('\\n');
        while (newline !== -1) {
          const line = bufferedInput.slice(0, newline).trim();
          bufferedInput = bufferedInput.slice(newline + 1);
          newline = bufferedInput.indexOf('\\n');
          if (line.length === 0) continue;
          const request = JSON.parse(line);
          if (!Object.hasOwn(request, 'id')) continue;
          await appendFile('/data/upstream-call-log.jsonl', JSON.stringify({
            method: request.method,
            tool: request.params?.name ?? null,
          }) + '\\n', 'utf8');
          try {
            let response;
            if (request.method === 'initialize') {
              response = {
                protocolVersion: request.params.protocolVersion,
                capabilities: { tools: {} },
                serverInfo: { name: 'capture-fixture', version: '1.0.0-rc.1' },
              };
            } else if (request.method === 'ping') {
              response = {};
            } else if (request.method === 'tools/list') {
              response = { tools };
            } else if (request.method === 'tools/call') {
              response = await handleToolCall(request);
            } else {
              throw new Error('Unexpected fixture request: ' + request.method);
            }
            process.stdout.write(JSON.stringify({
              jsonrpc: '2.0',
              id: request.id,
              result: response,
            }) + '\\n');
          } catch (error) {
            process.stdout.write(JSON.stringify({
              jsonrpc: '2.0',
              id: request.id,
              error: {
                code: -32603,
                message: error instanceof Error ? error.message : String(error),
              },
            }) + '\\n');
          }
        }
      }
    `,
    "utf8",
  );

  const trustedLauncher = await fixtureLauncherFingerprint(
    upstreamEntrypoint,
  );
  const facadeSource = await readFile(facadeSourceEntrypoint, "utf8");
  const upstreamMarker = "const upstream = new UpstreamEasyedaClient({";
  assert.ok(
    facadeSource.includes(upstreamMarker),
    "fixture must locate the facade upstream constructor",
  );
  const absoluteImports = facadeSource.replaceAll(
    /from "(\.\/[^"]+\.ts)"/gu,
    replaceFacadeImport,
  );
  const absolutePackages = absoluteImports.replaceAll(
    /from "((?!node:|\.)[^"]+)"/gu,
    replacePackageImport,
  );
  const engineMarker = "const engine = new EasyedaControlEngine(upstream,";
  assert.ok(absolutePackages.includes(engineMarker), "fixture must inject its inert bridge scope at the actual engine constructor");
  const bridgeDiagnosticsMarker = "bridgeConnection: upstream.bridgeConnectionDiagnostics(),";
  assert.ok(absolutePackages.includes(bridgeDiagnosticsMarker), "fixture must observe the actual isolated listener through status diagnostics");
  const transformedFacade = absolutePackages.replace(
    upstreamMarker,
    // The synthetic facade must not compete with a user's live bridge.
    // This private constructor override belongs only in fixture code.
    `${upstreamMarker}\n  bridgePublicPortForTesting: 0,\n  trustedLauncher: ${JSON.stringify(trustedLauncher)},`,
  ).replace(
    engineMarker,
    `upstream.withAuthenticatedBridgeDispatchScope = async (callback) => await callback(Object.freeze({}));\n${engineMarker}`,
  ).replace(
    bridgeDiagnosticsMarker,
    "bridgeConnection: { ...upstream.bridgeConnectionDiagnostics(), fixturePublicEndpoint: upstream.bridgeSessionLifecycle()?.publicEndpoint },",
  );
  facadeEntrypoint = join(fixtureRoot, "facade-index.ts");
  await writeFile(facadeEntrypoint, transformedFacade, "utf8");

  transport = new StdioClientTransport({
    command: process.execPath,
    args: [facadeEntrypoint],
    cwd: pluginRoot,
    env: {
      ...process.env,
      EASYEDA_CONTROL_DATA_DIR: controlRoot,
      EASYEDA_UPSTREAM_COMMAND: process.execPath,
      EASYEDA_UPSTREAM_ARGS_JSON: JSON.stringify([upstreamEntrypoint]),
      EASYEDA_UPSTREAM_CWD: fixtureRoot,
      EASYEDA_UPSTREAM_DATA_DIR: upstreamDataRoot,
      EASYEDA_BRIDGE_TOKEN_FILE: bridgeTokenPath,
      EASYEDA_BRIDGE_MAX_PAYLOAD_SIZE: "1048576",
      EASYEDA_ASSETS_ROOT: assetsRoot,
      EASYEDA_PCB_BUNDLE_VERSION: "3.2.149.fixture",
      EASYEDA_PUBLIC_API_BUNDLE_VERSION: "0.2.53.fixture",
    },
    stderr: "pipe",
  });
  client = new Client(
    { name: "easyeda-control-capture-test", version: "0.1.0" },
    { capabilities: {} },
  );
  await client.connect(transport);
  await client.listTools();
  coldApiResult = await apiReference({ action: "sdk", query: { namespace: "sys_WebSocket", detail: true } });
  coldApiCallLog = await readFile(upstreamCallLogPath, "utf8");
  assert.equal(coldApiCallLog, "", "MCP discovery and API references must not start the upstream process");
  const status = await client.callTool({
    name: "easyeda_control_status",
    arguments: {},
  });
  assert.equal(
    status.isError,
    undefined,
    JSON.stringify(status.structuredContent),
  );
  const statusPayload = structured(status);
  fixtureBridgeEndpoint = requireRecord(
    requireRecord(statusPayload["bridgeConnection"], "status.bridgeConnection")["fixturePublicEndpoint"],
    "status.bridgeConnection.fixturePublicEndpoint",
  );
  const upstreamStatus = requireRecord(
    statusPayload["upstream"],
    "status.upstream",
  );
  expectedFingerprint = requireRecord(
    upstreamStatus["stableFingerprint"],
    "status.upstream.stableFingerprint",
  );
});

after(async () => {
  await client?.close().catch(() => null);
  await transport?.close().catch(() => null);
  if (fixtureRoot) {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

void describe("published facade contracts", { concurrency: false }, () => {
  void test("synthetic facade uses an ephemeral loopback listener isolated from the production bridge port", async () => {
    assert.equal(fixtureBridgeEndpoint["host"], "127.0.0.1");
    const port = fixtureBridgeEndpoint["port"];
    assert.ok(typeof port === "number" && Number.isSafeInteger(port) && port > 0 && port <= 65_535);
    assert.notEqual(port, 49_621, "the fixture must never occupy the production bridge port");
    assert.match(await readFile(facadeEntrypoint, "utf8"), /bridgePublicPortForTesting: 0/u);
  });

  void test("publishes complete nested API selectors and works before upstream startup", async () => {
    assert.equal(coldApiCallLog, "");
    assert.equal(coldApiResult["offline"], true);
    assert.equal(coldApiResult["invocationEnabled"], false);
    const coldEntries = requireArray(coldApiResult["entries"], "cold SDK entries");
    assert.equal(coldEntries.length, 3);
    const listed = await client.listTools();
    const api = listed.tools.find((tool) => tool.name === "easyeda_control_api");
    assert.ok(api, "offline API discovery must be published");
    assert.equal(api.annotations?.readOnlyHint, true);
    const properties = requireRecord(api.inputSchema.properties, "API input properties");
    const request = requireRecord(properties["request"], "API request schema");
    const branches = requireArray(request["anyOf"] ?? request["oneOf"], "API action branches");
    const sdk = branches.map((branch) => requireRecord(branch, "API branch")).find((branch) => {
      const branchProperties = requireRecord(branch["properties"], "API branch properties");
      const action = requireRecord(branchProperties["action"], "API action schema");
      return action["const"] === "sdk";
    });
    const sdkProperties = requireRecord(requireRecord(sdk, "SDK branch")["properties"], "SDK properties");
    const query = requireRecord(sdkProperties["query"], "SDK query schema");
    assert.equal(query["additionalProperties"], false);
    const selectors = requireRecord(query["properties"], "SDK selectors");
    assert.deepEqual(Object.keys(selectors).toSorted(), ["detail", "kind", "limit", "namespace", "offset", "reference", "search"]);
    const reference = requireRecord(selectors["reference"], "SDK reference selector");
    assert.deepEqual(reference["enum"], ["reviewed-installed", "official-latest"]);
    const limit = requireRecord(selectors["limit"], "SDK page limit");
    assert.equal(limit["maximum"], 100);
  });

  void test("API schemas and refinement validation remain offline when upstream and editor context fail", async () => {
    try {
      await writeConfig({ unavailable: true });
      const unavailable = await client.callTool({ name: "easyeda_control_context", arguments: {} });
      assert.equal(unavailable.isError, true, "mock editor context must genuinely be unavailable");
      const beforeCalls = await readFile(upstreamCallLogPath, "utf8");
      const sdk = await apiReference({ action: "sdk", query: { reference: "official-latest", namespace: "sys_Help", detail: true, limit: 1 } });
      assert.equal(requireRecord(sdk["provenance"], "SDK provenance")["version"], "0.4.26");
      const method = requireRecord(requireArray(sdk["entries"], "SDK entries")[0], "SDK method");
      assert.equal(method["executable"], false);
      assert.equal(method["runtimeAvailability"], "not-probed");

      const catalog = await apiReference({ action: "operations", query: { family: "design", operationAction: "pcb.component.model-transform", includeSchemas: true } });
      assert.equal(catalog["executionAuthorized"], false);
      const entry = requireRecord(requireArray(catalog["entries"], "operation entries")[0], "operation entry");
      assert.equal(entry["action"], "pcb.component.model-transform");
      assert.equal(requireRecord(entry["inputSchema"], "exact operation schema")["additionalProperties"], false);
      assert.match(String(entry["inputSchemaSha256"]), /^[a-f0-9]{64}$/u);

      const operation = { id: "export", action: "export.schematic.document", fileName: "review", maxBytes: 1024,
        fileType: "PDF", object: "Current Schematic Page", objectSpecificParams: { range: [1, 2], outputMethod: "Merged sheet" } };
      const valid = await apiReference({ action: "validate", query: { family: "library", operation } });
      assert.equal(valid["valid"], true);
      assert.equal(valid["nativePreflightPerformed"], false);
      assert.equal(valid["executionAuthorized"], false);
      const invalid = await apiReference({ action: "validate", query: { family: "library", operation: { ...operation,
        objectSpecificParams: { ...operation.objectSpecificParams, range: [2, 1] } } } });
      assert.equal(invalid["valid"], false, "offline validation must retain custom range refinement");
      assert.equal(await readFile(upstreamCallLogPath, "utf8"), beforeCalls, "API queries must not dispatch any upstream request");
    } finally {
      await writeConfig();
    }
  });

  void test("API validation bounds oversized normalized operations and rejects caller-code requests without dispatch", async () => {
    const beforeCalls = await readFile(upstreamCallLogPath, "utf8");
    const validation = await apiReference({ action: "validate", query: { family: "library", operation: {
      id: "large-source", action: "library.symbol.source.replace", libraryUuid: "library", target: { uuid: "symbol" }, documentSource: "a".repeat(1_048_576),
    } } });
    assert.equal(validation["valid"], true);
    assert.equal(validation["normalizedOperationOmitted"], true);
    assert.equal(validation["normalizedOperation"], undefined);
    assert.match(String(validation["normalizedOperationSha256"]), /^[a-f0-9]{64}$/u);
    assert.ok(Buffer.byteLength(JSON.stringify(validation), "utf8") < 1024);
    for (const request of [
      { action: "invoke", method: "eda.sys_Help.help" },
      { action: "sdk", query: { code: "eda.sys_Help.help()" } },
      { action: "sdk", query: { limit: 101 } },
      { action: "operations", query: { family: "design", code: "call()" } },
    ]) {
      const refused = await client.callTool({ name: "easyeda_control_api", arguments: { request } });
      assert.equal(refused.isError, true, JSON.stringify(refused.content));
    }
    const callerCode = await apiReference({ action: "validate", query: { family: "design", operation: "arbitrary JavaScript" } });
    assert.equal(callerCode["valid"], false);
    assert.equal(await readFile(upstreamCallLogPath, "utf8"), beforeCalls);
  });

  void test("context output accepts success and retains structured identity failures", async () => {
    try {
      await writeConfig({ documentType: 3 });
      const success = await client.callTool({
        name: "easyeda_control_context",
        arguments: {},
      });
      assert.equal(success.isError, undefined, JSON.stringify(success.content));
      const payload = structured(success);
      assert.equal(payload["ok"], true);
      const project = requireRecord(payload["project"], "context.project");
      const document = requireRecord(payload["document"], "context.document");
      assert.equal(project["uuid"], "project-1");
      assert.equal(project["path"], projectPath);
      assert.equal(document["uuid"], "document-1");
      assert.equal(document["documentType"], 3);
      assert.equal(document["tabId"], "tab-1");

      await writeConfig({ documentType: 0 });
      const failure = await client.callTool({
        name: "easyeda_control_context",
        arguments: {},
      });
      assert.match(failureMessage(failure), /supported document type/u);
    } finally {
      await writeConfig();
    }
  });

  void test("keeps every live evidence facade inside one authenticated bridge scope", async () => {
    const source = await readFile(facadeSourceEntrypoint, "utf8");
    const expectedWrappers = new Map<string, string>([
      ["easyeda_control_status", "serializedStatusGuarded"],
      ["easyeda_control_context", "serializedLiveGuarded"],
      ["easyeda_control_exact_read", "serializedLiveGuarded"],
      ["easyeda_control_read", "serializedLiveGuarded"],
      ["easyeda_control_read_batch", "serializedLiveGuarded"],
      ["easyeda_control_capture", "serializedLiveResult"],
      ["easyeda_control_export", "serializedLiveGuarded"],
      ["easyeda_control_plan", "serializedLiveGuarded"],
      ["easyeda_control_apply", "serializedLiveGuarded"],
      ["easyeda_control_verify", "serializedLiveGuarded"],
      ["easyeda_control_rollback", "serializedLiveGuarded"],
      ["easyeda_control_save_reopen", "serializedLiveGuarded"],
      ["easyeda_control_checkpoint", "serializedLiveGuarded"],
      ["easyeda_control_recover_incomplete", "serializedGuarded"],
    ]);
    for (const [toolName, wrapper] of expectedWrappers) {
      const marker = `registerFacadeTool(\n  "${toolName}"`;
      const start = source.indexOf(marker);
      assert.notEqual(start, -1, `${toolName} registration must exist`);
      const next = source.indexOf("\nregisterFacadeTool(", start + marker.length);
      const block = source.slice(start, next === -1 ? undefined : next);
      assert.match(
        block,
        new RegExp(`\\b${wrapper}\\(`, "u"),
        `${toolName} must hold its authenticated renderer lease through validation and evidence publication`,
      );
      if (toolName === "easyeda_control_recover_incomplete") {
        assert.match(
          block,
          /withAuthenticatedBridgeDispatchScope\(/u,
          "live recovery must acquire an authenticated renderer lease while local journal listing remains disconnected-safe",
        );
      }
    }
  });

  void test("generated operation IDs satisfy the lowercase operation-id JSON Schema", async () => {
    const listed = await client.listTools();
    const apply = listed.tools.find(
      (tool) => tool.name === "easyeda_control_apply",
    );
    const applySchema = requireRecord(apply?.inputSchema, "apply.inputSchema");
    const applyProperties = requireRecord(
      applySchema["properties"],
      "apply properties",
    );
    const operationIdSchema = requireRecord(
      applyProperties["operationId"],
      "apply operationId schema",
    );
    const pattern = operationIdSchema["pattern"];
    assert.equal(typeof pattern, "string");
    assert.equal(pattern, "^[a-z0-9][a-z0-9-]{7,95}$");
    assert.match(
      newOperationId(new Date("2026-08-27T09:08:07.654Z")),
      new RegExp(pattern, "u"),
    );

    const saveReopen = listed.tools.find(
      (tool) => tool.name === "easyeda_control_save_reopen",
    );
    const saveReopenSchema = requireRecord(
      saveReopen?.inputSchema,
      "save-reopen inputSchema",
    );
    const saveReopenProperties = requireRecord(
      saveReopenSchema["properties"],
      "save-reopen properties",
    );
    const discardConfirmation = requireRecord(
      saveReopenProperties["confirmDiscardAnyUnsavedState"],
      "save-reopen discard confirmation",
    );
    assert.equal(discardConfirmation["type"], "boolean");
    assert.equal(discardConfirmation["default"], false);

    const plan = listed.tools.find(
      (tool) => tool.name === "easyeda_control_plan",
    );
    const planSchema = requireRecord(plan?.inputSchema, "plan inputSchema");
    const planProperties = requireRecord(
      planSchema["properties"],
      "plan properties",
    );
    const planDiscardConfirmation = requireRecord(
      planProperties["confirmDiscardAnyUnsavedState"],
      "plan discard confirmation",
    );
    assert.equal(planDiscardConfirmation["const"], true);

    const raw = await client.callTool({
      name: "easyeda_control_execute",
      arguments: {},
    });
    assert.match(
      failureMessage(raw),
      /structurally disabled.*no environment opt-in/iu,
    );
  });

});

void describe("generic read context binding", { concurrency: false }, () => {
  void test("rejects excluded tools and every cross-editor read family before dispatch", async () => {
    const rejected: readonly (readonly [number, string, RegExp])[] = [
      [3, "easyeda_component_probe", /diagnostic-only/u],
      [3, "easyeda_live_smoke_report", /diagnostic-only/u],
      [1, "easyeda_wire_probe", /diagnostic-only/u],
      [1, "easyeda_canvas_locate", /not on the reviewed local-only generic-read allowlist|excluded from generic reads/u],
      [
        1,
        "easyeda_bom_validate",
        /not on the reviewed local-only generic-read allowlist/u,
      ],
      [3, "easyeda_schematic_components", /active document type 1.*type is 3/u],
      [1, "easyeda_pcb_components", /active document type 3.*type is 1/u],
      [1, "easyeda_board_dimensions", /active document type 3.*type is 1/u],
      [15, "easyeda_pcb_components", /type is 15.*not a PCB editor context/u],
      [15, "easyeda_board_dimensions", /type is 15.*not a PCB editor context/u],
    ];
    for (const [documentType, upstreamTool, expectedError] of rejected) {
      const response = await genericRead(documentType, upstreamTool);
      assert.match(failureMessage(response), expectedError);
    }

    const schematic = await genericRead(1, "easyeda_schematic_components");
    assert.notEqual(schematic.isError, true);
    const schematicResult = requireRecord(
      structured(schematic)["result"],
      "schematic result",
    );
    assert.equal(schematicResult["dispatched"], true);
    const pcb = await genericRead(3, "easyeda_pcb_components");
    assert.notEqual(pcb.isError, true);
    const pcbResult = requireRecord(structured(pcb)["result"], "PCB result");
    assert.equal(pcbResult["dispatched"], true);
  });

  void test("allows live PCB constraint reads but rejects every caller-supplied board snapshot", async () => {
    for (const upstreamTool of [
      "easyeda_pcb_constraint_check",
      "easyeda_pcb_constraint_report",
      "easyeda_pcb_production_review",
    ]) {
      const live = await genericRead(3, upstreamTool, {
        projectId: "project-1",
      });
      assert.notEqual(
        live.isError,
        true,
        JSON.stringify(live.structuredContent),
      );
      const liveResult = requireRecord(structured(live)["result"], "live constraint result");
      assert.equal(liveResult["dispatched"], true);

      for (const boardData of [null, { widthMm: 1, heightMm: 1 }]) {
        const fabricated = await genericRead(3, upstreamTool, {
          projectId: "project-1",
          boardData,
        });
        assert.match(
          failureMessage(fabricated),
          /arguments\.boardData is prohibited.*proven live board/u,
        );
        await assert.rejects(readFile(fabricatedBoardDataMarker), {
          code: "ENOENT",
        });
      }
    }
  });
});

void describe(
  "full-page schematic capture facade",
  { concurrency: false },
  () => {
    void test("existing visible and region capture modes retain viewport-only managed image evidence", async () => {
      for (const mode of ["easyeda_canvas_capture", "easyeda_canvas_capture_region"] as const) {
        const accepted = await capture({}, `existing-${mode}`, {}, mode);
        assert.notEqual(accepted.isError, true, JSON.stringify(accepted.content));
        assert.equal(requireArray(accepted.content, "capture content").filter((item) => isRecord(item) && item["type"] === "image").length, 1);
        const evidence = requireRecord(structured(accepted)["evidence"], "capture evidence");
        const archived: unknown = JSON.parse(await readFile(String(evidence["resultPath"]), "utf8"));
        assert.equal(requireRecord(requireRecord(archived, "archived evidence")["request"], "archived request")["upstreamTool"], mode);
        assert.equal(requireRecord(requireRecord(archived, "archived evidence")["metadata"], "capture metadata")["effect"], "viewport-read");
      }
    });

    void test("runtime drift or failed health reproof after any capture mode refuses the image without replay", async () => {
      for (const mode of ["easyeda_canvas_capture", "easyeda_canvas_capture_region", "easyeda_schematic_capture_full_page"] as const) {
        for (const drift of ["version", "unavailable"]) {
          const previousLog = await readFile(upstreamCallLogPath, "utf8");
          const rejected = await capture({ captureFingerprintDrift: drift }, `runtime-drift-${mode}-${drift}`, {}, mode);
          assert.match(failureMessage(rejected), /runtime fingerprint changed during canvas capture/u);
          assert.equal(requireArray(rejected.content, "refused capture content").some((item) => isRecord(item) && item["type"] === "image"), false);
          const currentLog = await readFile(upstreamCallLogPath, "utf8");
          const appended = currentLog.slice(previousLog.length).trim().split("\n").map((line) => {
            const entry: unknown = JSON.parse(line); return requireRecord(entry, "upstream call")["tool"];
          });
          assert.equal(appended.filter((tool) => tool === mode).length, 1, "a refused image must not repeat capture or zoom");
          const capturedAt = appended.indexOf(mode);
          assert.ok(capturedAt !== -1 && appended.lastIndexOf("easyeda_health_check") > capturedAt, "runtime identity must be reproved after image generation");
        }
      }
    });

    void test("requires a schematic document and binds the returned project identity", async () => {
      const wrongEditor = await capture({ documentType: 3 }, "wrong-editor");
      assert.match(
        failureMessage(wrongEditor),
        /requires an active schematic document/u,
      );

      const wrongProject = await capture(
        { capture: { project_id: "other-project" } },
        "wrong-result-project",
      );
      assert.match(
        failureMessage(wrongProject),
        /result\.project_id does not match/u,
      );
    });

    void test("requires deterministic sheet provenance unless inferred A4 is authorized", async () => {
      const inferred = {
        capture: {
          deterministic_viewport: false,
          sheet: {
            source: "default-a4-landscape",
            width: 100,
            height: 80,
            unit: "mil",
          },
        },
      };
      const rejected = await capture(inferred, "inferred-rejected");
      assert.match(failureMessage(rejected), /inferred A4 was not authorized/u);

      const allowed = await capture(inferred, "inferred-allowed", {
        allowInferredA4: true,
      });
      assert.notEqual(allowed.isError, true);
      assert.equal(structured(allowed)["deterministic_viewport"], false);

      const contradictory = await capture(
        {
          capture: {
            deterministic_viewport: true,
            sheet: {
              source: "default-a4-landscape",
              width: 100,
              height: 80,
              unit: "mil",
            },
          },
        },
        "contradictory-provenance",
      );
      assert.match(
        failureMessage(contradictory),
        /contradictory viewport provenance/u,
      );
    });

    void test("requires complete sheet, viewport, dimensions, transform, and cleared-selection evidence", async () => {
      for (const field of [
        "sheet",
        "viewport",
        "image_dimensions",
        "sheet_to_image_transform",
      ]) {
        const rejected = await capture(
          { capture: { deterministic_viewport: false }, omit: [field] },
          `missing-${field}`,
          { allowInferredA4: true },
        );
        assert.match(
          failureMessage(rejected),
          /did not return complete sheet/u,
        );
      }
      const selected = await capture(
        { capture: { selection_overlays_removed: false } },
        "selection-not-cleared",
      );
      assert.match(failureMessage(selected), /did not return complete sheet/u);

      const accepted = await capture({}, "complete-capture");
      assert.notEqual(accepted.isError, true);
      const acceptedPayload = structured(accepted);
      assert.equal(acceptedPayload["project_id"], "project-1");
      assert.deepEqual(acceptedPayload["image_dimensions"], {
        width: 2,
        height: 3,
      });
      assert.equal(acceptedPayload["selection_overlays_removed"], true);
      assert.equal(Object.hasOwn(acceptedPayload, "image_base64"), false);
      const evidence = requireRecord(
        acceptedPayload["evidence"],
        "capture evidence",
      );
      assert.equal(typeof evidence["resultPath"], "string");
      const archivedText = await readFile(
        String(evidence["resultPath"]),
        "utf8",
      );
      const archivedJson: unknown = JSON.parse(archivedText);
      const archived = requireRecord(archivedJson, "archived evidence");
      const archivedResult = requireRecord(
        archived["result"],
        "archived result",
      );
      const archivedPayload = requireRecord(
        archivedResult["payload"],
        "archived payload",
      );
      assert.equal(Object.hasOwn(archivedPayload, "image_base64"), false);
    });

    void test("binds exactly one valid PNG to its payload metadata and IHDR dimensions", async () => {
      const cases: readonly (readonly [FixtureConfig, RegExp])[] = [
        [{ imageCount: 0 }, /exactly one MCP image block/u],
        [{ imageCount: 2 }, /exactly one MCP image block/u],
        [{ imageMimeType: "image/jpeg" }, /missing, empty, or non-PNG image/u],
        [
          { payloadMimeType: "image/jpeg" },
          /MIME type or byte length does not match/u,
        ],
        [
          { payloadByteLength: 999 },
          /MIME type or byte length does not match/u,
        ],
        [
          { payloadByteLength: "69" },
          /payload byte length is invalid/u,
        ],
        [{ payloadBase64: "mismatch" }, /payload image bytes do not match/u],
        [{ capture: { image_base64: {} } }, /image_base64 must be a string/u],
        [{ validIhdr: false }, /IHDR/u],
        [{ corruptPngCrc: true }, /PNG.*CRC|CRC.*PNG/iu],
        [
          { payloadByteLength: 16 * 1024 * 1024 + 1 },
          /exceeds the 16 MiB compressed PNG limit/u,
        ],
        [
          { pngHeaderWidth: 8192, pngHeaderHeight: 8192 },
          /expands beyond the 64 MiB validation limit/u,
        ],
        [
          { capture: { image_dimensions: { width: 99, height: 3 } } },
          /dimensions do not match the PNG IHDR/u,
        ],
      ];
      for (const [index, [config, expectedError]] of cases.entries()) {
        const rejected = await capture(config, `png-binding-${index}`);
        assert.match(failureMessage(rejected), expectedError);
      }
    });

    void test("rejects malformed or contradictory full-page geometry evidence", async () => {
      const cases: readonly (readonly [FixtureConfig, RegExp])[] = [
        [
          { capture: { sheet: { source: "sheet-info" } } },
          /Capture sheet.*fields|Capture sheet.*finite/iu,
        ],
        [
          { capture: { viewport: { left: 0, right: 99, top: 80, bottom: 0 } } },
          /viewport contradicts/u,
        ],
        [
          {
            capture: {
              sheet_to_image_transform: {
                scale_x: 0.02,
                scale_y: -0.0375,
                offset_x: 0,
                offset_y: 0,
              },
            },
          },
          /transform contradicts/u,
        ],
        [
          { capture: { warnings: "not-an-array" } },
          /warnings must be an array/u,
        ],
        [
          {
            capture: {
              sheet_to_image_transform: {
                scale_x: "0.02",
                scale_y: -0.0375,
                offset_x: 0,
                offset_y: 3,
              },
            },
          },
          /scale_x must be a finite number/u,
        ],
      ];
      for (const [index, [config, expectedError]] of cases.entries()) {
        const rejected = await capture(config, `geometry-binding-${index}`);
        assert.match(failureMessage(rejected), expectedError);
      }
    });
  },
);

void describe("global orphan-risk quarantine", { concurrency: false }, () => {
  void test("blocks every live bridge path while local discovery and recovery listing remain available", async () => {
    const previousControlRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
    configureTestControlRoot(controlRoot);
    const loadedArtifacts: unknown = await import(
      `../src/artifacts.ts?facade-orphan=${encodeURIComponent(fixtureRoot)}`
    );
    assert.ok(
      isArtifactModule(loadedArtifacts),
      "artifact fixture module must be valid",
    );
    const journalArtifacts = loadedArtifacts;
    if (previousControlRoot === undefined) {
      configureTestControlRoot();
    } else {
      configureTestControlRoot(previousControlRoot);
    }

    const operationId = newOperationId();
    const plan = { name: "facade-orphan-quarantine-fixture" };
    const journalPath = await journalArtifacts.createOperation({
      schema: OPERATION_SCHEMA,
      operationId,
      plan,
      planHash: buildPlanHash(plan),
      state: "unknown",
      mutationState: "unknown",
      hardStop: true,
      mutationMayHaveOccurred: true,
      orphanedCallPossible: true,
      orphanedCallPhase: "apply",
      runtimeRestartChallenge: `EASYEDA_RESTARTED_AND_RECONNECTED:${operationId}:apply:1:fixture-nonce`,
      artifacts: [],
      updatedAt: new Date().toISOString(),
    });

    const liveCalls = [
      await genericRead(1, "easyeda_schematic_components"),
      await capture({}, "orphan-blocked-capture"),
      await client.callTool({ name: "easyeda_control_status", arguments: {} }),
      await client.callTool({
        name: "easyeda_control_checkpoint",
        arguments: {
          request: { action: "verify", receiptPath: "/not-dispatched" },
        },
      }),
    ];
    for (const result of liveCalls) {
      assert.match(failureMessage(result), /bridge dispatch is quarantined/u);
      const error = requireRecord(
        structured(result)["error"],
        "quarantine error",
      );
      const blocking = requireArray(
        error["blockingOperations"],
        "blocking operations",
      );
      const firstBlocking = requireRecord(
        blocking[0],
        "first blocking operation",
      );
      assert.equal(firstBlocking["operationId"], operationId);
    }

    const discover = await client.callTool({
      name: "easyeda_control_discover",
      arguments: {
        query: "capture",
        mode: "all",
        limit: 10,
        includeSchemas: false,
      },
    });
    assert.notEqual(discover.isError, true);
    const quarantinedCallLog = await readFile(upstreamCallLogPath, "utf8");
    const api = await apiReference({ action: "sdk", query: { namespace: "sys_WebSocket", limit: 1 } });
    assert.equal(api["invocationEnabled"], false);
    assert.equal(await readFile(upstreamCallLogPath, "utf8"), quarantinedCallLog, "offline API discovery must remain available during orphan quarantine");
    const recovery = await client.callTool({
      name: "easyeda_control_recover_incomplete",
      arguments: {},
    });
    const recoveryItems = requireArray(
      structured(recovery)["value"],
      "recovery value",
    );
    const recoveredOperation = recoveryItems.find(
      (item) => isRecord(item) && item["operationId"] === operationId,
    );
    const recoveredRecord = requireRecord(
      recoveredOperation,
      "recovered operation",
    );
    assert.equal(recoveredRecord["orphanedCallPossible"], true);

    const otherOperationId = newOperationId();
    const otherPlan = { name: "foreign-incomplete-recovery-fixture" };
    await journalArtifacts.createOperation({
      schema: OPERATION_SCHEMA,
      operationId: otherOperationId,
      plan: otherPlan,
      planHash: buildPlanHash(otherPlan),
      state: "preflight-proven",
      mutationState: "none",
      hardStop: false,
      mutationMayHaveOccurred: false,
      orphanedCallPossible: false,
      artifacts: [],
      updatedAt: new Date().toISOString(),
    });
    const unisolatedRecovery = await client.callTool({
      name: "easyeda_control_recover_incomplete",
      arguments: {
        operationId,
        resolution: "reconciled-no-mutation",
        confirmation: `${operationId}:reconciled-no-mutation`,
      },
    });
    assert.match(
      failureMessage(unisolatedRecovery),
      /recovery operation.*not isolated/iu,
    );
    const unisolatedError = requireRecord(
      structured(unisolatedRecovery)["error"],
      "unisolated recovery error",
    );
    const unisolatedBlocking = requireArray(
      unisolatedError["blockingOperations"],
      "unisolated blocking operations",
    );
    const unisolatedFirst = requireRecord(
      unisolatedBlocking[0],
      "first unisolated blocking operation",
    );
    assert.equal(unisolatedFirst["operationId"], otherOperationId);

    await writeFile(journalPath, "{broken journal", "utf8");
    const unreadable = await genericRead(1, "easyeda_schematic_components");
    assert.match(failureMessage(unreadable), /journal-unreadable/u);
    const unreadableRecovery = await client.callTool({
      name: "easyeda_control_recover_incomplete",
      arguments: {},
    });
    const unreadableItems = requireArray(
      structured(unreadableRecovery)["value"],
      "unreadable recovery value",
    );
    assert.equal(
      unreadableItems.some(
        (item) =>
          isRecord(item) &&
          item["operationId"] === operationId &&
          item["state"] === "journal-unreadable",
      ),
      true,
    );
  });
});
