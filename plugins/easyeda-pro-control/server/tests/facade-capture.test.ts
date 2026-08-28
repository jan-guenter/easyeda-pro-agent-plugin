import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { after, before, describe, test } from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import type { createOperation } from "../src/artifacts.ts";
import {
  OPERATION_SCHEMA,
  buildPlanHash,
  newOperationId,
} from "../src/core.ts";

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
  return requireRecord(result.structuredContent, "structuredContent");
}

const pluginRoot = resolve(import.meta.dirname, "../..");
const facadeEntrypoint = join(pluginRoot, "server", "src", "index.ts");

let fixtureRoot: string;
let controlRoot: string;
let configPath: string;
let projectPath: string;
let client: Client;
let transport: StdioClientTransport;
let expectedFingerprint: Record<string, unknown>;
let evidenceSequence = 0;

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
): Promise<ToolCallResult> {
  await writeConfig(config);
  const documentType = config.documentType ?? 1;
  return client.callTool(
    {
      name: "easyeda_control_capture",
      arguments: {
        request: {
          upstreamTool: "easyeda_schematic_capture_full_page",
          arguments: {
            projectId: "project-1",
            tabId: "tab-1",
            padding: 0,
            allowInferredA4: false,
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
): Promise<ToolCallResult> {
  await writeConfig({ documentType });
  return client.callTool(
    {
      name: "easyeda_control_read",
      arguments: {
        upstreamTool,
        arguments: {},
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

before(async () => {
  fixtureRoot = await mkdtemp(
    join(tmpdir(), "easyeda-control-facade-capture-"),
  );
  controlRoot = join(fixtureRoot, "control");
  configPath = join(fixtureRoot, "capture-config.json");
  projectPath = join(fixtureRoot, "fixture.eprj2");
  const implementationRoot = join(fixtureRoot, "upstream-implementation");
  const upstreamEntrypoint = join(implementationRoot, "server.mjs");
  const assetsRoot = join(fixtureRoot, "assets");

  await mkdir(implementationRoot, { recursive: true });
  await mkdir(join(assetsRoot, "pro-pcb", "3.2.149.fixture", "js"), {
    recursive: true,
  });
  await mkdir(join(assetsRoot, "pro-api", "0.2.53.fixture"), {
    recursive: true,
  });
  await writeFile(projectPath, "fixture project identity", "utf8");
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

  const serverUrl = pathToFileURL(
    resolve(
      pluginRoot,
      "node_modules/@modelcontextprotocol/sdk/dist/esm/server/index.js",
    ),
  ).href;
  const stdioUrl = pathToFileURL(
    resolve(
      pluginRoot,
      "node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js",
    ),
  ).href;
  const typesUrl = pathToFileURL(
    resolve(
      pluginRoot,
      "node_modules/@modelcontextprotocol/sdk/dist/esm/types.js",
    ),
  ).href;

  await writeFile(
    upstreamEntrypoint,
    `
      import { readFile } from 'node:fs/promises';
      import { deflateSync } from 'node:zlib';
      import { Server } from ${JSON.stringify(serverUrl)};
      import { StdioServerTransport } from ${JSON.stringify(stdioUrl)};
      import {
        CallToolRequestSchema,
        ListToolsRequestSchema,
      } from ${JSON.stringify(typesUrl)};

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
        tool('easyeda_schematic_components', { readOnlyHint: true, idempotentHint: true }),
        tool('easyeda_pcb_components', { readOnlyHint: true, idempotentHint: true }),
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
      const makePng = (validIhdr, width, height) => {
        const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
        const header = Buffer.alloc(13);
        header.writeUInt32BE(width, 0);
        header.writeUInt32BE(height, 4);
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
        JSON.parse(await readFile(process.env.CAPTURE_FIXTURE_CONFIG, 'utf8'));

      const server = new Server(
        { name: 'capture-fixture', version: '1.0.0-rc.1' },
        { capabilities: { tools: {} } },
      );
      server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
      server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const config = await readConfig();
        if (request.params.name === 'easyeda_health_check') {
          return result({
            version: '1.0.0-rc.1',
            node_version: '24.18.0',
            bridge_connected: true,
            easyeda_version: '3.2.149.88089769',
            extension_version: '1.0.0-rc.1',
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
              tabId: 'tab-1',
              title: documentType === 1 ? 'Sheet 01' : 'PCB',
            },
            schematic: documentType === 1
              ? { uuid: 'document-1', tabId: 'tab-1', title: 'Sheet 01' }
              : {},
            pcb: documentType === 3
              ? { uuid: 'document-1', tabId: 'tab-1', title: 'PCB' }
              : {},
          });
        }
        if (request.params.name === 'easyeda_schematic_capture_full_page') {
          const width = config.pngWidth ?? 2;
          const height = config.pngHeight ?? 3;
          const png = makePng(config.validIhdr !== false, width, height);
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
          return result(payload, images);
        }
        if (
          [
            'easyeda_schematic_components',
            'easyeda_pcb_components',
            'easyeda_board_dimensions',
            'easyeda_component_probe',
            'easyeda_live_smoke_report',
            'easyeda_wire_probe',
          ].includes(request.params.name)
        ) {
          return result({ dispatched: true, tool: request.params.name });
        }
        throw new Error('Unexpected fixture tool: ' + request.params.name);
      });
      await server.connect(new StdioServerTransport());
    `,
    "utf8",
  );

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
      EASYEDA_ASSETS_ROOT: assetsRoot,
      EASYEDA_PCB_BUNDLE_VERSION: "3.2.149.fixture",
      EASYEDA_PUBLIC_API_BUNDLE_VERSION: "0.2.53.fixture",
      CAPTURE_FIXTURE_CONFIG: configPath,
    },
    stderr: "pipe",
  });
  client = new Client(
    { name: "easyeda-control-capture-test", version: "0.1.0" },
    { capabilities: {} },
  );
  await client.connect(transport);
  const status = await client.callTool({
    name: "easyeda_control_status",
    arguments: {},
  });
  assert.equal(status.isError, undefined);
  const statusPayload = structured(status);
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
  void test("rejects diagnostic probes and every cross-editor read family before dispatch", async () => {
    const rejected: readonly (readonly [number, string, RegExp])[] = [
      [3, "easyeda_component_probe", /diagnostic-only/u],
      [3, "easyeda_live_smoke_report", /diagnostic-only/u],
      [1, "easyeda_wire_probe", /diagnostic-only/u],
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
});

void describe(
  "full-page schematic capture facade",
  { concurrency: false },
  () => {
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
          /MIME type or byte length does not match/u,
        ],
        [{ payloadBase64: "mismatch" }, /payload image bytes do not match/u],
        [{ capture: { image_base64: {} } }, /image_base64 must be a string/u],
        [{ validIhdr: false }, /IHDR/u],
        [{ corruptPngCrc: true }, /PNG.*CRC|CRC.*PNG/iu],
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
    process.env["EASYEDA_CONTROL_DATA_DIR"] = controlRoot;
    const loadedArtifacts: unknown = await import(
      `../src/artifacts.ts?facade-orphan=${encodeURIComponent(fixtureRoot)}`
    );
    assert.ok(
      isArtifactModule(loadedArtifacts),
      "artifact fixture module must be valid",
    );
    const journalArtifacts = loadedArtifacts;
    if (previousControlRoot === undefined) {
      delete process.env["EASYEDA_CONTROL_DATA_DIR"];
    } else {
      process.env["EASYEDA_CONTROL_DATA_DIR"] = previousControlRoot;
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
