#!/usr/bin/env node
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, open, rmdir, stat } from "node:fs/promises";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";
import process from "node:process";
import { inflateSync } from "node:zlib";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type {
  CallToolResult,
  ToolAnnotations,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
  archiveCaptureEvidence,
  archiveExternalEvidence,
  controlDataDirectory,
  ensureManagedDirectory,
  inspectManagedFile,
  readArtifact,
  releaseEvidenceReservation,
  reserveEvidencePaths,
  verifyEvidenceReceipt,
} from "./artifacts.ts";
import {
  CONTROL_VERSION,
  assertSubset,
  extractToolPayload,
  filterTools,
  isRecord,
  sha256Text,
  validateExpectedFingerprint,
  validatePrivateFingerprint,
} from "./core.ts";
import { EasyedaControlEngine, SerializedGate } from "./engine.ts";
import { exactReadRequestSchema } from "./exact-readers.ts";
import { acquireFacadeLease } from "./lease.ts";
import { buildDsnExportCode, wrapWithContextGuard } from "./runtime-scripts.ts";
import { UpstreamEasyedaClient } from "./upstream.ts";

const MAX_INLINE_RESULT_BYTES = 256 * 1024;
const EXPORT_TOOLS = new Set(["easyeda_pcb_export_route_context"]);
const CAPTURE_TOOLS = new Set([
  "easyeda_canvas_capture",
  "easyeda_canvas_capture_region",
  "easyeda_schematic_capture_full_page",
]);
const DEDICATED_FACADE_NAME = /(^|_)(capture|export)(_|$)/iu;
const UNBOUND_DIAGNOSTIC_READ_NAMES = new Set([
  "easyeda_component_probe",
  "easyeda_live_smoke_report",
  "easyeda_wire_probe",
]);
const UI_MUTATING_READ_NAMES = new Set([
  "easyeda_canvas_locate",
  "easyeda_schematic_layout_qa",
]);
const validatedControlRoot = await ensureManagedDirectory(
  controlDataDirectory(),
);
const facadeLease = await acquireFacadeLease(validatedControlRoot);
process.once("exit", () => {
  facadeLease.releaseSync();
});
const upstream = new UpstreamEasyedaClient();
const engine = new EasyedaControlEngine(upstream);
const bridgeGate = new SerializedGate();

const recordSchema = z.record(z.string(), z.unknown());
const genericOutputSchema = z.object({}).catchall(z.unknown());
const evidenceSchema = z
  .object({ resultPath: z.string().min(1), receiptPath: z.string().min(1) })
  .strict();
const nonEmptyStringSchema = z.string().min(1);
const readBatchCallSchema = z
  .object({
    upstreamTool: nonEmptyStringSchema,
    arguments: recordSchema.default({}),
  })
  .strict();
const capturePaddingSchema = z.number().nonnegative().default(0);
const captureInferredA4Schema = z.boolean().default(false);
const captureTabArgumentsSchema = z
  .object({ tabId: nonEmptyStringSchema })
  .strict();
const captureRegionArgumentsSchema = z
  .object({
    tabId: nonEmptyStringSchema,
    left: z.number(),
    right: z.number(),
    top: z.number(),
    bottom: z.number(),
  })
  .strict();
const captureFullPageArgumentsSchema = z
  .object({
    projectId: nonEmptyStringSchema,
    tabId: nonEmptyStringSchema,
    padding: capturePaddingSchema,
    allowInferredA4: captureInferredA4Schema,
  })
  .strict();
const captureRequestSchema = z.discriminatedUnion("upstreamTool", [
  z
    .object({
      upstreamTool: z.literal("easyeda_canvas_capture"),
      arguments: captureTabArgumentsSchema,
    })
    .strict(),
  z
    .object({
      upstreamTool: z.literal("easyeda_canvas_capture_region"),
      arguments: captureRegionArgumentsSchema,
    })
    .strict(),
  z
    .object({
      upstreamTool: z.literal("easyeda_schematic_capture_full_page"),
      arguments: captureFullPageArgumentsSchema,
    })
    .strict(),
]);
const capturePayloadSchema = z
  .object({
    byte_length: z.unknown(),
    captured: z.boolean(),
    deterministic_viewport: z.unknown().optional(),
    error: z.unknown().optional(),
    image_base64: z.unknown().optional(),
    image_dimensions: z.unknown().optional(),
    mime_type: z.unknown(),
    project_id: z.unknown().optional(),
    selection_overlays_removed: z.unknown().optional(),
    sheet: z.unknown().optional(),
    sheet_to_image_transform: z.unknown().optional(),
    viewport: z.unknown().optional(),
    warnings: z.unknown().optional(),
  })
  .catchall(z.unknown());
const exportBase = {
  projectId: z.string().min(1),
  filePath: z.string().min(1),
};
const exportRequestSchema = z
  .object({
    upstreamTool: z.literal("easyeda_pcb_export_route_context"),
    arguments: z.object(exportBase).strict(),
  })
  .strict();
const dsnExportPayloadSchema = z
  .object({
    base64: z.unknown(),
    byteLength: z.unknown(),
    document: z.record(z.string(), z.unknown()),
    kind: z.literal("pcb-dsn"),
    ok: z.literal(true),
    project: z.record(z.string(), z.unknown()),
  })
  .catchall(z.unknown());
const checkpointRequestSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("create"),
      source: z.string().min(1),
      outputDir: z.string().min(1),
      label: z.string().regex(/^[a-z0-9][a-z0-9._-]{0,53}$/iu),
    })
    .strict(),
  z
    .object({ action: z.literal("verify"), receiptPath: z.string().min(1) })
    .strict(),
]);
const operationIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{7,95}$/iu);
const planHashSchema = z.string().regex(/^[a-f0-9]{64}$/u);
const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/iu);
const installedBundleAvailableSchema = z
  .object({
    available: z.literal(true),
    assetsRoot: z.string().min(1),
    pcbEditor: z
      .object({
        version: z.string().min(1),
        implementationPath: z.string().min(1),
        implementationSha256: sha256Schema,
      })
      .catchall(z.unknown()),
    publicApi: z
      .object({
        version: z.string().min(1),
        implementationPath: z.string().min(1),
        implementationSha256: sha256Schema,
        adapterPath: z.string().min(1),
        adapterSha256: sha256Schema,
        declarationsPath: z.string().min(1),
        declarationsSha256: sha256Schema,
      })
      .catchall(z.unknown()),
  })
  .catchall(z.unknown());
const facadeImplementationFileSchema = z
  .object({
    path: nonEmptyStringSchema,
    relativePath: nonEmptyStringSchema,
    bytes: z.number().int().positive(),
    sha256: sha256Schema,
  })
  .strict();
const facadeImplementationFilesSchema = z
  .array(facadeImplementationFileSchema)
  .min(1);
const bridgeDiagnosticsSchema = z
  .object({ method_registry_hash: nonEmptyStringSchema })
  .catchall(z.unknown());
const expectedFingerprintBaseShape = {
  facadeImplementation: z
    .object({
      version: z.string().min(1),
      operationSchema: z.string().min(1),
      mode: z.enum(["bundle", "source-tree"]),
      files: facadeImplementationFilesSchema,
      sha256: sha256Schema,
    })
    .strict(),
  reviewedCompatibilityManifest: z
    .object({
      path: z.string().min(1),
      bytes: z.number().int().positive(),
      sha256: sha256Schema,
      schema: z.literal("easyeda-pro-control.reviewed-compatibility.v1"),
      reviewedAt: z.string().min(1),
    })
    .strict(),
  upstreamServer: z
    .object({ version: z.string().min(1) })
    .catchall(z.unknown()),
  upstreamLauncher: z
    .object({
      command: z.string().min(1),
      commandSha256: sha256Schema,
      args: z.array(z.string().min(1)).min(1),
      entrypoint: z.string().min(1),
      entrypointSha256: sha256Schema,
      implementationTree: z
        .object({
          root: z.string().min(1),
          fileCount: z.number().int().positive(),
          sha256: sha256Schema,
        })
        .catchall(z.unknown()),
      dependencyLock: z
        .object({
          type: z.string().min(1),
          path: z.string().min(1),
          sha256: sha256Schema,
        })
        .catchall(z.unknown()),
      cwd: z.string().min(1),
    })
    .catchall(z.unknown()),
  upstreamImplementationDrift: z.literal(false),
  toolCount: z.number().int().positive(),
  toolCatalogSha256: sha256Schema,
  health: z
    .object({
      payload: z
        .object({
          version: z.string().min(1),
          node_version: z.string().min(1),
          bridge_connected: z.literal(true),
          easyeda_version: z.string().min(1),
          extension_version: z.string().min(1),
          extension_version_mismatch: z.literal(false),
          registry_mismatch: z.literal(false),
        })
        .catchall(z.unknown()),
    })
    .catchall(z.unknown()),
  bridge: z
    .object({
      payload: z
        .object({
          connected: z.literal(true),
          bridge_version: z.string().min(1),
          easyeda_version: z.string().min(1),
          diagnostics: bridgeDiagnosticsSchema,
        })
        .catchall(z.unknown()),
    })
    .catchall(z.unknown()),
  bridgeDispatcher: z
    .object({
      payload: z
        .object({
          source: z.literal("loader_status"),
          dispatcher_build_id: z.string().min(4),
          total: z.number().int().positive(),
        })
        .catchall(z.unknown()),
    })
    .catchall(z.unknown()),
};
const expectedFingerprintSchema = z
  .object({
    ...expectedFingerprintBaseShape,
    installedBundles: installedBundleAvailableSchema,
  })
  .catchall(z.unknown());
const privateFingerprintSchema = z
  .object({
    ...expectedFingerprintBaseShape,
    installedBundles: installedBundleAvailableSchema,
  })
  .catchall(z.unknown());
const projectIdentitySchema = z.union([
  z
    .object({
      uuid: z.string().min(1),
      projectUuid: z.string().min(1).optional(),
      path: z.string().min(1),
    })
    .catchall(z.unknown()),
  z
    .object({
      projectUuid: z.string().min(1),
      uuid: z.string().min(1).optional(),
      path: z.string().min(1),
    })
    .catchall(z.unknown()),
]);
const documentIdentitySchema = z.union([
  z
    .object({
      uuid: z.string().min(1),
      documentUuid: z.string().min(1).optional(),
      documentType: z.number().int(),
      tabId: z.string().min(1).optional(),
    })
    .catchall(z.unknown()),
  z
    .object({
      documentUuid: z.string().min(1),
      uuid: z.string().min(1).optional(),
      documentType: z.number().int(),
      tabId: z.string().min(1).optional(),
    })
    .catchall(z.unknown()),
]);
const contextSchema = z
  .object({
    project: projectIdentitySchema,
    document: documentIdentitySchema,
  })
  .catchall(z.unknown());
const operationDocumentIdentitySchema = z.union([
  z
    .object({
      uuid: z.string().min(1),
      documentUuid: z.string().min(1).optional(),
      documentType: z.literal(3),
      tabId: z.string().min(1),
    })
    .catchall(z.unknown()),
  z
    .object({
      documentUuid: z.string().min(1),
      uuid: z.string().min(1).optional(),
      documentType: z.literal(3),
      tabId: z.string().min(1),
    })
    .catchall(z.unknown()),
]);
const operationContextSchema = z
  .object({
    project: projectIdentitySchema,
    document: operationDocumentIdentitySchema,
  })
  .catchall(z.unknown());
const assertionValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.unknown()),
  recordSchema,
]);
const assertionSchema = z.discriminatedUnion("op", [
  z.object({ pointer: z.string(), op: z.literal("exists") }).strict(),
  z
    .object({
      pointer: z.string(),
      op: z.enum(["equals", "not-equals"]),
      value: assertionValueSchema,
    })
    .strict(),
  z
    .object({
      pointer: z.string(),
      op: z.literal("matches"),
      value: z.string(),
    })
    .strict(),
  z
    .object({
      pointer: z.string(),
      op: z.literal("length-equals"),
      value: z.number().int().nonnegative(),
    })
    .strict(),
]);
const typedCallSpecSchema = z
  .object({
    toolName: z
      .string()
      .min(1)
      .regex(/^(?!easyeda_execute$).+/u),
    arguments: recordSchema.default({}),
    assertions: z.array(assertionSchema).max(100).default([]),
  })
  .strict();
const checkpointCreateSchema = z
  .object({
    source: z.string().min(1),
    outputDir: z.string().min(1),
    label: z.string().regex(/^[a-z0-9][a-z0-9._-]{0,53}$/iu),
  })
  .strict();
const operationPlanCommonShape = {
  name: z.string().min(4).max(120),
  intent: z.string().min(12).max(1000),
  targetPrimitiveIds: z
    .array(
      z
        .string()
        .min(1)
        .max(160)
        .regex(/^[A-Za-z0-9._:-]+$/u),
    )
    .length(1)
    .refine((values) => new Set(values).size === values.length, {
      message: "targetPrimitiveIds must be unique.",
    }),
  targetChanges: z
    .array(
      z
        .object({
          primitiveId: z
            .string()
            .min(1)
            .max(160)
            .regex(/^[A-Za-z0-9._:-]+$/u),
          pointer: z
            .string()
            .min(2)
            .max(512)
            .regex(/^\/(?!primitiveId(?:\/|$)).+/u),
          before: assertionValueSchema,
          after: assertionValueSchema,
        })
        .strict(),
    )
    .min(1)
    .max(1000),
  expectedContext: operationContextSchema,
  preflightCalls: z.array(typedCallSpecSchema).min(1).max(30),
  verifyCalls: z.array(typedCallSpecSchema).min(1).max(30),
  verifyAssertions: z.array(assertionSchema).max(100).default([]),
  reopenedVerifyCalls: z.array(typedCallSpecSchema).min(1).max(30),
  reopenedAssertions: z.array(assertionSchema).max(100).default([]),
  checkpoint: checkpointCreateSchema,
};
const operationPlanSchema = z
  .object({
    ...operationPlanCommonShape,
    capabilityLevel: z.literal("private-version-pinned"),
    expectedFingerprint: privateFingerprintSchema,
    applyCall: typedCallSpecSchema,
    rollbackCalls: z.array(typedCallSpecSchema).min(1).max(30),
  })
  .strict();

type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type FacadeHandler<Input> = (input: Input) => unknown;
type EvidencePaths = z.infer<typeof evidenceSchema>;
type EvidenceReservation = Awaited<ReturnType<typeof reserveEvidencePaths>>;
type ExpectedContext = z.infer<typeof contextSchema>;

interface FullPageCapturePayload {
  readonly image_dimensions: Record<string, unknown>;
  readonly selection_overlays_removed: true;
  readonly sheet: Record<string, unknown>;
  readonly sheet_to_image_transform: Record<string, unknown>;
  readonly viewport: Record<string, unknown>;
  readonly warnings: unknown;
}

interface PngDimensions {
  readonly height: number;
  readonly width: number;
}

interface ImageBlock {
  readonly data: string;
  readonly mimeType: string;
  readonly type: "image";
}

function isImageBlock(value: unknown): value is ImageBlock {
  return (
    isRecord(value) &&
    value["type"] === "image" &&
    typeof value["data"] === "string" &&
    typeof value["mimeType"] === "string"
  );
}

interface EvidenceAttachment {
  readonly bytes?: number;
  readonly kind: string;
  readonly path: string;
  readonly sha256?: string;
}

interface EvidenceOptions {
  readonly attachments?: EvidenceAttachment[];
  readonly maxInlineBytes?: number;
  readonly reservation?: EvidenceReservation | undefined;
  readonly returnMode?: "full" | "receipt-only" | "summary";
}

interface SerializedGuardOptions {
  readonly allowDuringOrphanRisk?: boolean;
}

interface FacadeToolConfig<InputArgs extends z.ZodRawShape> {
  readonly annotations?: ToolAnnotations;
  readonly description?: string;
  readonly inputSchema: InputArgs;
  readonly title?: string;
}

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every((item) => isJsonValue(item));
  }
  return (
    isRecord(value) && Object.values(value).every((item) => isJsonValue(item))
  );
}

function jsonSafe(value: unknown): JsonValue {
  const text = JSON.stringify(value, (_key: string, item: unknown): unknown =>
    typeof item === "bigint" ? item.toString() : item,
  );
  if (text === undefined) {
    return null;
  }
  const parsed: unknown = JSON.parse(text);
  if (!isJsonValue(parsed)) {
    throw new TypeError("JSON serialization produced a non-JSON value.");
  }
  return parsed;
}

function success(value: unknown): CallToolResult {
  const safe = jsonSafe(value);
  const structuredContent =
    safe !== null && typeof safe === "object" && !Array.isArray(safe)
      ? safe
      : { value: safe };
  const encoded = JSON.stringify(structuredContent);
  const jsonBytes = Buffer.byteLength(encoded);
  if (jsonBytes > 512 * 1024) {
    throw new Error(
      `Facade result is ${jsonBytes} bytes, above the 512 KiB response limit. Use receipt-only reads or bounded artifact paging.`,
    );
  }
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          ok: true,
          structuredContent: true,
          jsonBytes,
          sha256: sha256Text(encoded),
        }),
      },
    ],
    structuredContent,
  };
}

function failure(error: unknown): CallToolResult {
  const errorRecord = isRecord(error) ? error : {};
  const details = {
    ok: false,
    error: {
      name: errorRecord["name"] ?? "Error",
      message: errorRecord["message"] ?? String(error),
      mismatches: errorRecord["mismatches"],
      assertionResults: errorRecord["assertionResults"],
      blockingOperations: errorRecord["blockingOperations"],
    },
  };
  return {
    isError: true,
    content: [{ type: "text", text: JSON.stringify(details, null, 2) }],
    structuredContent: details,
  };
}

function guarded<Input>(
  handler: FacadeHandler<Input>,
): (input: Input) => Promise<CallToolResult> {
  return async (input: Input): Promise<CallToolResult> => {
    try {
      return success(await handler(input));
    } catch (error) {
      return failure(error);
    }
  };
}

function serializedGuarded<Input>(
  handler: FacadeHandler<Input>,
  options: SerializedGuardOptions = {},
): (input: Input) => Promise<CallToolResult> {
  return guarded((input) =>
    bridgeGate.run(async () => {
      if (options.allowDuringOrphanRisk !== true) {
        await engine.assertBridgeDispatchAllowed();
      }
      return await handler(input);
    }),
  );
}

async function callReadOnly(
  upstreamTool: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  if (UI_MUTATING_READ_NAMES.has(upstreamTool)) {
    throw new Error(
      `${upstreamTool} is excluded from generic reads because its upstream handler can change the viewport or selection.`,
    );
  }
  if (
    upstreamTool === "easyeda_execute" ||
    DEDICATED_FACADE_NAME.test(upstreamTool) ||
    CAPTURE_TOOLS.has(upstreamTool) ||
    EXPORT_TOOLS.has(upstreamTool)
  ) {
    throw new Error(
      `${upstreamTool} must use its dedicated guarded facade tool.`,
    );
  }
  const tools = await upstream.listTools();
  const tool = tools.find((candidate) => candidate.name === upstreamTool);
  const matches = filterTools(tools, {
    query: upstreamTool,
    mode: "read",
    limit: 100,
    includeSchemas: false,
  });
  if (
    !tool ||
    UNBOUND_DIAGNOSTIC_READ_NAMES.has(upstreamTool) ||
    !matches.some((candidate) => candidate.name === upstreamTool)
  ) {
    throw new Error(
      `${upstreamTool} is absent, diagnostic-only, or is not conservatively classified as a target-bound read-only tool. Use discover to inspect its metadata.`,
    );
  }
  return extractToolPayload(await upstream.callTool(upstreamTool, args ?? {}));
}

function resultSummary(result: unknown): {
  readonly jsonBytes: number;
  readonly kind: string;
  readonly keyCount?: number;
  readonly keys?: string[];
  readonly length?: number;
  readonly sha256: string;
} {
  const json = JSON.stringify(jsonSafe(result));
  let value: {
    kind: string;
    keyCount?: number;
    keys?: string[];
    length?: number;
  };
  if (Array.isArray(result)) {
    value = { kind: "array", length: result.length };
  } else if (result !== null && typeof result === "object") {
    const keys = Object.keys(result);
    value = { kind: "object", keys: keys.slice(0, 40), keyCount: keys.length };
  } else {
    value = { kind: typeof result };
  }
  return {
    ...value,
    jsonBytes: Buffer.byteLength(json),
    sha256: sha256Text(json),
  };
}

function assertTargetArguments(
  args: Record<string, unknown>,
  expectedContext: ExpectedContext,
  activeContext: ExpectedContext,
  label: string,
): void {
  const expectedProjectUuid =
    expectedContext.project.uuid ?? expectedContext.project.projectUuid;
  const expectedDocumentUuid =
    expectedContext.document.uuid ?? expectedContext.document.documentUuid;
  for (const key of ["projectId", "projectUuid"]) {
    if (args[key] !== undefined && args[key] !== expectedProjectUuid) {
      throw new Error(
        `${label} arguments.${key} does not match the proven project UUID.`,
      );
    }
  }
  for (const key of [
    "documentId",
    "documentUuid",
    "schematicUuid",
    "pcbUuid",
  ]) {
    if (args[key] !== undefined && args[key] !== expectedDocumentUuid) {
      throw new Error(
        `${label} arguments.${key} does not match the proven document UUID.`,
      );
    }
  }
  if (
    args["tabId"] !== undefined &&
    args["tabId"] !== activeContext.document.tabId
  ) {
    throw new Error(
      `${label} arguments.tabId does not match the active proven tab.`,
    );
  }
}

function assertToolFamilyContext(
  upstreamTool: string,
  activeContext: ExpectedContext,
): void {
  let requiredDocumentType: 1 | 3 | undefined;
  if (/^easyeda_(schematic|bom)_/iu.test(upstreamTool)) {
    requiredDocumentType = 1;
  } else if (/^easyeda_(pcb|board)_/iu.test(upstreamTool)) {
    requiredDocumentType = 3;
  }
  if (
    requiredDocumentType !== undefined &&
    activeContext?.document?.documentType !== requiredDocumentType
  ) {
    throw new Error(
      `${upstreamTool} reads the active document type ${requiredDocumentType}; the proven active document type is ${String(activeContext?.document?.documentType)}. PCB 3D preview type 15 is not a PCB editor context.`,
    );
  }
}

function requiredExportDocumentType(upstreamTool: string): 3 {
  if (upstreamTool === "easyeda_pcb_export_route_context") {
    return 3;
  }
  throw new Error(
    `No reviewed document binding exists for exporter ${upstreamTool}.`,
  );
}

async function withEvidence(
  request: unknown,
  result: unknown,
  evidence: EvidencePaths | undefined,
  metadata: Record<string, unknown> = {},
  {
    reservation,
    returnMode = "full",
    maxInlineBytes = 65_536,
    attachments = [],
  }: EvidenceOptions = {},
): Promise<unknown> {
  let receipt;
  if (evidence !== undefined || reservation !== undefined) {
    receipt = await archiveExternalEvidence({
      ...(evidence === undefined ? {} : { evidence }),
      ...(reservation === undefined ? {} : { reservation }),
      request,
      result,
      metadata,
      attachments,
    });
  }
  const summary = resultSummary(result);
  if (returnMode === "receipt-only") {
    if (receipt === undefined) {
      throw new Error("receipt-only mode requires reserved evidence paths.");
    }
    return { summary, evidence: receipt };
  }
  if (returnMode === "summary") {
    if (receipt === undefined) {
      throw new Error("summary mode requires reserved evidence paths.");
    }
    return { summary, evidence: receipt };
  }
  const limit = Math.min(MAX_INLINE_RESULT_BYTES, maxInlineBytes);
  if (summary.jsonBytes > limit) {
    if (receipt !== undefined) {
      return { summary, evidence: receipt, inlineResultOmitted: true };
    }
    throw new Error(
      `Full result is ${summary.jsonBytes} bytes, above the ${limit}-byte inline limit. Provide fresh evidence paths and use returnMode=receipt-only.`,
    );
  }
  return { result, summary, evidence: receipt };
}

async function finalizeDispatchedFailure(
  reservation: EvidenceReservation | undefined,
  request: unknown,
  error: unknown,
  metadata: Record<string, unknown> = {},
  attachments: EvidenceAttachment[] = [],
): Promise<unknown> {
  if (reservation === undefined) {
    return undefined;
  }
  const errorRecord = isRecord(error) ? error : {};
  try {
    return await archiveExternalEvidence({
      reservation,
      request,
      result: {
        ok: false,
        outcome: "dispatched-but-not-proven",
        error: {
          name: errorRecord["name"] ?? "Error",
          message: errorRecord["message"] ?? String(error),
        },
      },
      metadata: { facadeVersion: CONTROL_VERSION, ...metadata },
      attachments,
    });
  } catch (archiveError) {
    throw new AggregateError(
      [error, archiveError],
      "The EasyEDA call failed and its reserved failure evidence could not be finalized.",
      { cause: archiveError },
    );
  }
}

async function sha256File(path: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const streamChunk of createReadStream(path)) {
    const chunk: unknown = streamChunk;
    if (!Buffer.isBuffer(chunk)) {
      throw new TypeError(`Expected a binary stream while hashing ${path}.`);
    }
    hash.update(chunk);
  }
  return hash.digest("hex");
}

function crc32(...buffers: readonly Buffer[]): number {
  const initialValue = 4_294_967_295;
  const polynomial = 3_988_292_384;
  let crc = initialValue;
  for (const buffer of buffers) {
    for (const byte of buffer) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit += 1) {
        crc = (crc >>> 1) ^ (crc & 1 ? polynomial : 0);
      }
    }
  }
  return (crc ^ initialValue) >>> 0;
}

function nearlyEqual(actual: number, expected: number): boolean {
  return (
    Math.abs(actual - expected) <=
    Number.EPSILON * 8 * Math.max(1, Math.abs(actual), Math.abs(expected))
  );
}

async function ignoreCleanupFailure(promise: Promise<unknown>): Promise<void> {
  try {
    await promise;
  } catch {
    // Cleanup is best effort and must not replace the primary operation failure.
  }
}

async function writeDurableExclusive(
  path: string,
  bytes: Uint8Array,
): Promise<void> {
  let handle;
  let created = false;
  try {
    handle = await open(path, "wx", 0o600);
    created = true;
    await handle.writeFile(bytes);
    await handle.sync();
  } finally {
    if (handle !== undefined) {
      await ignoreCleanupFailure(handle.close());
    }
    if (created) {
      const directoryHandle = await open(dirname(path), "r");
      try {
        await directoryHandle.sync();
      } finally {
        await directoryHandle.close();
      }
    }
  }
}

function readPngDimensions(bytes: Buffer): PngDimensions {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (
    bytes.length < 45 ||
    !bytes.subarray(0, signature.length).equals(signature)
  ) {
    throw new Error(
      "Canvas capture PNG is missing its signature or complete chunk structure.",
    );
  }

  let offset = signature.length;
  let ihdr:
    | {
        readonly bitDepth: number;
        readonly colorType: number;
        readonly height: number;
        readonly width: number;
      }
    | undefined;
  let seenPalette = false;
  let seenIdat = false;
  let idatEnded = false;
  let seenIend = false;
  const idatParts: Buffer[] = [];
  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) {
      throw new Error("Canvas capture PNG contains a truncated chunk header.");
    }
    const length = bytes.readUInt32BE(offset);
    const chunkEnd = offset + 12 + length;
    if (!Number.isSafeInteger(chunkEnd) || chunkEnd > bytes.length) {
      throw new Error(
        "Canvas capture PNG contains a truncated or oversized chunk.",
      );
    }
    const typeBytes = bytes.subarray(offset + 4, offset + 8);
    const type = typeBytes.toString("ascii");
    if (!/^[A-Za-z]{4}$/u.test(type)) {
      throw new Error("Canvas capture PNG contains an invalid chunk type.");
    }
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    const recordedCrc = bytes.readUInt32BE(offset + 8 + length);
    if (crc32(typeBytes, data) !== recordedCrc) {
      throw new Error(`Canvas capture PNG chunk ${type} has an invalid CRC.`);
    }
    if (!ihdr && type !== "IHDR") {
      throw new Error("Canvas capture PNG does not begin with IHDR.");
    }
    if (seenIend) {
      throw new Error("Canvas capture PNG contains data after IEND.");
    }

    if (type === "IHDR") {
      if (ihdr || length !== 13) {
        throw new Error(
          "Canvas capture PNG is missing a unique, valid IHDR chunk.",
        );
      }
      const width = data.readUInt32BE(0);
      const height = data.readUInt32BE(4);
      const bitDepth = data[8];
      const colorType = data[9];
      const compression = data[10];
      const filter = data[11];
      const interlace = data[12];
      const validDepths: Partial<Record<number, ReadonlySet<number>>> = {
        0: new Set([1, 2, 4, 8, 16]),
        2: new Set([8, 16]),
        3: new Set([1, 2, 4, 8]),
        4: new Set([8, 16]),
        6: new Set([8, 16]),
      };
      if (
        width < 1 ||
        height < 1 ||
        bitDepth === undefined ||
        colorType === undefined ||
        validDepths[colorType]?.has(bitDepth) !== true ||
        compression !== 0 ||
        filter !== 0 ||
        interlace !== 0
      ) {
        throw new Error(
          "Canvas capture PNG has invalid dimensions, color settings, or an unsupported interlace mode.",
        );
      }
      ihdr = { width, height, bitDepth, colorType };
    } else if (type === "PLTE") {
      const header = ihdr;
      if (!header) {
        throw new Error("Canvas capture PNG is missing IHDR.");
      }
      if (
        seenPalette ||
        seenIdat ||
        length < 3 ||
        length > 768 ||
        length % 3 !== 0
      ) {
        throw new Error("Canvas capture PNG contains an invalid PLTE chunk.");
      }
      if ([0, 4].includes(header.colorType)) {
        throw new Error("Canvas capture PNG contains a forbidden PLTE chunk.");
      }
      if (header.colorType === 3 && length / 3 > 2 ** header.bitDepth) {
        throw new Error(
          "Canvas capture PNG palette exceeds its indexed-color bit depth.",
        );
      }
      seenPalette = true;
    } else if (type === "IDAT") {
      if (idatEnded) {
        throw new Error("Canvas capture PNG has non-consecutive IDAT chunks.");
      }
      seenIdat = true;
      idatParts.push(data);
    } else if (type === "IEND") {
      if (length !== 0 || !seenIdat) {
        throw new Error(
          "Canvas capture PNG contains an invalid IEND sequence.",
        );
      }
      seenIend = true;
    } else {
      if (seenIdat) {
        idatEnded = true;
      }
      const firstTypeCharacter = type[0];
      if (
        firstTypeCharacter !== undefined &&
        firstTypeCharacter === firstTypeCharacter.toUpperCase()
      ) {
        throw new Error(
          `Canvas capture PNG contains unsupported critical chunk ${type}.`,
        );
      }
    }
    offset = chunkEnd;
  }
  if (!ihdr || !seenIdat || !seenIend || offset !== bytes.length) {
    throw new Error("Canvas capture PNG is missing IHDR, IDAT, or IEND.");
  }
  if (ihdr.colorType === 3 && !seenPalette) {
    throw new Error("Canvas capture indexed PNG is missing PLTE.");
  }

  const channels: number | undefined = new Map<number, number>([
    [0, 1],
    [2, 3],
    [3, 1],
    [4, 2],
    [6, 4],
  ]).get(ihdr.colorType);
  if (channels === undefined) {
    throw new Error("Canvas capture PNG has an unsupported color type.");
  }
  const scanlineBytes = Math.ceil((ihdr.width * channels * ihdr.bitDepth) / 8);
  const decodedBytes = ihdr.height * (scanlineBytes + 1);
  if (!Number.isSafeInteger(decodedBytes) || decodedBytes > 512 * 1024 * 1024) {
    throw new Error(
      "Canvas capture PNG expands beyond the 512 MiB validation limit.",
    );
  }
  let decoded;
  try {
    decoded = inflateSync(Buffer.concat(idatParts), {
      maxOutputLength: decodedBytes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Canvas capture PNG IDAT stream is invalid: ${message}`, {
      cause: error,
    });
  }
  if (decoded.length !== decodedBytes) {
    throw new Error(
      "Canvas capture PNG decoded byte length does not match IHDR.",
    );
  }
  for (let row = 0; row < ihdr.height; row += 1) {
    const filterByte = decoded[row * (scanlineBytes + 1)];
    if (filterByte === undefined || filterByte > 4) {
      throw new Error(
        "Canvas capture PNG contains an invalid scanline filter.",
      );
    }
  }
  return { width: ihdr.width, height: ihdr.height };
}

function assertExactObjectKeys(
  value: object,
  expectedKeys: readonly string[],
  label: string,
): void {
  if (Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  const actual = Object.keys(value).toSorted();
  const expected = [...expectedKeys].toSorted();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} has unexpected or missing fields.`);
  }
}

function assertFiniteCaptureFields<Field extends string>(
  value: Record<string, unknown>,
  fields: readonly Field[],
  label: string,
): asserts value is Record<string, unknown> & Record<Field, number> {
  for (const field of fields) {
    if (typeof value[field] !== "number" || !Number.isFinite(value[field])) {
      throw new TypeError(`${label}.${field} must be a finite number.`);
    }
  }
}

function requireFullPageCapturePayload(
  payload: Record<string, unknown>,
): FullPageCapturePayload {
  const sheet = payload["sheet"];
  const viewport = payload["viewport"];
  const imageDimensions = payload["image_dimensions"];
  const transform = payload["sheet_to_image_transform"];
  if (
    !isRecord(sheet) ||
    !isRecord(viewport) ||
    !isRecord(imageDimensions) ||
    !isRecord(transform) ||
    payload["selection_overlays_removed"] !== true
  ) {
    throw new Error(
      "Full-page capture did not return complete sheet, viewport, transform, dimensions, and cleared-selection evidence.",
    );
  }
  return {
    image_dimensions: imageDimensions,
    selection_overlays_removed: true,
    sheet,
    sheet_to_image_transform: transform,
    viewport,
    warnings: payload["warnings"],
  };
}

function validateFullPageCaptureGeometry(
  payload: FullPageCapturePayload,
  padding: number,
  pngDimensions: PngDimensions,
): void {
  const sheet = payload.sheet;
  const viewport = payload.viewport;
  const imageDimensions = payload.image_dimensions;
  const transform = payload.sheet_to_image_transform;
  assertExactObjectKeys(
    sheet,
    ["width", "height", "unit", "source"],
    "Capture sheet",
  );
  assertFiniteCaptureFields(sheet, ["width", "height"], "Capture sheet");
  if (
    sheet["width"] <= 0 ||
    sheet["height"] <= 0 ||
    typeof sheet["unit"] !== "string" ||
    sheet["unit"].length === 0 ||
    typeof sheet["source"] !== "string" ||
    !["sheet-info", "default-a4-landscape"].includes(sheet["source"])
  ) {
    throw new Error("Capture sheet has invalid dimensions, unit, or source.");
  }
  assertExactObjectKeys(
    viewport,
    ["left", "right", "top", "bottom"],
    "Capture viewport",
  );
  assertFiniteCaptureFields(
    viewport,
    ["left", "right", "top", "bottom"],
    "Capture viewport",
  );
  assertExactObjectKeys(
    imageDimensions,
    ["width", "height"],
    "Capture image dimensions",
  );
  if (
    typeof imageDimensions["width"] !== "number" ||
    !Number.isSafeInteger(imageDimensions["width"]) ||
    imageDimensions["width"] <= 0 ||
    typeof imageDimensions["height"] !== "number" ||
    !Number.isSafeInteger(imageDimensions["height"]) ||
    imageDimensions["height"] <= 0
  ) {
    throw new Error("Capture image dimensions must be positive safe integers.");
  }
  assertExactObjectKeys(
    transform,
    ["scale_x", "scale_y", "offset_x", "offset_y"],
    "Capture sheet-to-image transform",
  );
  assertFiniteCaptureFields(
    transform,
    ["scale_x", "scale_y", "offset_x", "offset_y"],
    "Capture sheet-to-image transform",
  );
  if (
    !Array.isArray(payload.warnings) ||
    payload.warnings.some((warning: unknown) => typeof warning !== "string")
  ) {
    throw new Error("Full-page capture warnings must be an array of strings.");
  }

  const expectedViewport = {
    left: -padding,
    right: sheet["width"] + padding,
    top: sheet["height"] + padding,
    bottom: -padding,
  };
  for (const field of ["left", "right", "top", "bottom"] as const) {
    if (viewport[field] !== expectedViewport[field]) {
      throw new Error(
        "Full-page capture viewport contradicts the sheet dimensions and padding.",
      );
    }
  }
  const regionWidth = viewport["right"] - viewport["left"];
  const regionHeight = viewport["top"] - viewport["bottom"];
  if (regionWidth <= 0 || regionHeight <= 0) {
    throw new Error("Full-page capture viewport spans must be positive.");
  }
  if (
    imageDimensions["width"] !== pngDimensions.width ||
    imageDimensions["height"] !== pngDimensions.height
  ) {
    throw new Error("Full-page capture dimensions do not match the PNG IHDR.");
  }
  const expectedTransform = {
    scale_x: pngDimensions.width / regionWidth,
    scale_y: -pngDimensions.height / regionHeight,
    offset_x: -viewport["left"] * (pngDimensions.width / regionWidth),
    offset_y: viewport["top"] * (pngDimensions.height / regionHeight),
  };
  for (const field of ["scale_x", "scale_y", "offset_x", "offset_y"] as const) {
    if (!nearlyEqual(transform[field], expectedTransform[field])) {
      throw new Error(
        "Full-page capture transform contradicts its viewport and PNG dimensions.",
      );
    }
  }
  if (transform["scale_x"] <= 0 || transform["scale_y"] >= 0) {
    throw new Error("Full-page capture transform has invalid axis direction.");
  }
}

const server = new McpServer(
  { name: "easyeda-pro-control", version: CONTROL_VERSION },
  {
    capabilities: { tools: {} },
    instructions:
      "Use status, context, and conservative reads first. Audit, evidence, checkpoint, capture, draft DSN export, and recovery are the current production capabilities. The experimental PCB component writer is runtime-disabled pending connected sacrificial-board validation. Never retry a timed-out call. A boolean, toast, dialog, preview, or unsaved readback is not persistence. ECO/import dialogs, private APIs, library documents, and UI automation remain explicit capability gates.",
  },
);

function registerFacadeTool<InputArgs extends z.ZodRawShape>(
  name: string,
  config: FacadeToolConfig<InputArgs>,
  handler: ToolCallback<InputArgs>,
): void {
  server.registerTool(
    name,
    { outputSchema: genericOutputSchema, ...config },
    handler,
  );
}

registerFacadeTool(
  "easyeda_control_status",
  {
    title: "EasyEDA control status",
    description:
      "Report facade, upstream MCP, bridge, EasyEDA runtime, tool inventory, and durable-journal status without changing a design.",
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  serializedGuarded(async () => ({
    facade: {
      version: CONTROL_VERSION,
      dataDirectory: controlDataDirectory(),
      processLease: { path: facadeLease.path, pid: facadeLease.pid },
    },
    upstream: await engine.status(),
    incompleteOperations: await engine.recover(),
    safetyModel: "plan-apply-verify-save-reopen-checkpoint",
  })),
);

registerFacadeTool(
  "easyeda_control_discover",
  {
    title: "Discover EasyEDA capabilities",
    description:
      "Search the upstream EasyEDA tool catalog and show conservative read/write classification, annotations, and optionally schemas.",
    inputSchema: {
      query: z.string().default(""),
      mode: z.enum(["all", "read", "write"]).default("all"),
      limit: z.number().int().min(1).max(100).default(30),
      includeSchemas: z.boolean().default(false),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  serializedGuarded(
    async (input) => filterTools(await upstream.listTools(), input),
    { allowDuringOrphanRisk: true },
  ),
);

registerFacadeTool(
  "easyeda_control_context",
  {
    title: "Prove active EasyEDA context",
    description:
      "Read a compact project/document identity using the live EasyEDA runtime. Establish this before any scoped audit or operation.",
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  serializedGuarded(() => engine.context()),
);

registerFacadeTool(
  "easyeda_control_exact_read",
  {
    title: "Read exact EasyEDA design state",
    description:
      "Run a facade-owned, fail-closed field reader twice and return data only when both observations are byte-for-byte stable. Exact context is checked at entry and after each run, but the active tab must remain unchanged while awaited calls execute. Nested component-pad drill geometry is excluded because the pinned wrapper has a scale defect.",
    inputSchema: {
      request: exactReadRequestSchema,
      expectedContext: contextSchema,
      expectedFingerprint: privateFingerprintSchema,
      evidence: evidenceSchema.optional(),
      returnMode: z.enum(["full", "summary", "receipt-only"]).default("full"),
      maxInlineBytes: z
        .number()
        .int()
        .min(1024)
        .max(MAX_INLINE_RESULT_BYTES)
        .default(65_536),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  serializedGuarded(async (input) => {
    if (input.returnMode !== "full" && input.evidence === undefined) {
      throw new Error(
        "summary and receipt-only exact reads require evidence paths.",
      );
    }
    const reservation =
      input.evidence === undefined
        ? undefined
        : await reserveEvidencePaths(input.evidence);
    let dispatched = false;
    const request = {
      reader: input.request,
      expectedContext: input.expectedContext,
      expectedFingerprint: input.expectedFingerprint,
    };
    try {
      validatePrivateFingerprint(input.expectedFingerprint);
      const status = await engine.status();
      assertSubset(
        status.stableFingerprint,
        input.expectedFingerprint,
        "EasyEDA runtime fingerprint",
      );
      dispatched = true;
      const result = await engine.exactRead(
        input.request,
        input.expectedContext,
      );
      return await withEvidence(
        request,
        result,
        input.evidence,
        { facadeVersion: CONTROL_VERSION, reader: "facade-owned-exact" },
        {
          reservation,
          returnMode: input.returnMode,
          maxInlineBytes: input.maxInlineBytes,
        },
      );
    } catch (error) {
      if (reservation && !dispatched) {
        await releaseEvidenceReservation(reservation);
      } else if (reservation) {
        await finalizeDispatchedFailure(reservation, request, error, {
          effect: "facade-owned-exact-read",
        });
      }
      throw error;
    }
  }),
);

registerFacadeTool(
  "easyeda_control_read",
  {
    title: "Call a read-only EasyEDA tool",
    description:
      "Invoke one upstream tool only when its MCP metadata and name classify it conservatively as read-only. Optionally write an append-only result and receipt pair.",
    inputSchema: {
      upstreamTool: z.string().min(1),
      arguments: recordSchema.default({}),
      expectedContext: contextSchema,
      expectedFingerprint: expectedFingerprintSchema,
      evidence: evidenceSchema.optional(),
      returnMode: z.enum(["full", "summary", "receipt-only"]).default("full"),
      maxInlineBytes: z
        .number()
        .int()
        .min(1024)
        .max(MAX_INLINE_RESULT_BYTES)
        .default(65_536),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  serializedGuarded(async (input) => {
    if (input.returnMode !== "full" && input.evidence === undefined) {
      throw new Error("summary and receipt-only reads require evidence paths.");
    }
    const reservation =
      input.evidence === undefined
        ? undefined
        : await reserveEvidencePaths(input.evidence);
    let dispatched = false;
    const request = {
      upstreamTool: input.upstreamTool,
      arguments: input.arguments,
      expectedContext: input.expectedContext,
      expectedFingerprint: input.expectedFingerprint,
    };
    try {
      validateExpectedFingerprint(input.expectedFingerprint);
      const status = await engine.status();
      assertSubset(
        status.stableFingerprint,
        input.expectedFingerprint,
        "EasyEDA runtime fingerprint",
      );
      const activeContext = await engine.assertContext(input.expectedContext);
      assertToolFamilyContext(input.upstreamTool, activeContext);
      assertTargetArguments(
        input.arguments,
        input.expectedContext,
        activeContext,
        input.upstreamTool,
      );
      dispatched = true;
      const result = await callReadOnly(input.upstreamTool, input.arguments);
      await engine.assertContext(input.expectedContext);
      return await withEvidence(
        request,
        result,
        input.evidence,
        { facadeVersion: CONTROL_VERSION },
        {
          reservation,
          returnMode: input.returnMode,
          maxInlineBytes: input.maxInlineBytes,
        },
      );
    } catch (error) {
      if (reservation && !dispatched) {
        await releaseEvidenceReservation(reservation);
      } else if (reservation) {
        await finalizeDispatchedFailure(reservation, request, error, {
          effect: "read",
        });
      }
      throw error;
    }
  }),
);

registerFacadeTool(
  "easyeda_control_read_batch",
  {
    title: "Call a read-only EasyEDA batch",
    description:
      "Invoke a bounded sequence of conservatively classified read-only tools and optionally archive the complete batch with a receipt.",
    inputSchema: {
      calls: z.array(readBatchCallSchema).min(1).max(25),
      expectedContext: contextSchema,
      expectedFingerprint: expectedFingerprintSchema,
      evidence: evidenceSchema.optional(),
      returnMode: z.enum(["full", "summary", "receipt-only"]).default("full"),
      maxInlineBytes: z
        .number()
        .int()
        .min(1024)
        .max(MAX_INLINE_RESULT_BYTES)
        .default(65_536),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  serializedGuarded(async (input) => {
    if (input.returnMode !== "full" && input.evidence === undefined) {
      throw new Error(
        "summary and receipt-only batches require evidence paths.",
      );
    }
    const reservation =
      input.evidence === undefined
        ? undefined
        : await reserveEvidencePaths(input.evidence);
    let dispatched = false;
    const request = {
      calls: input.calls,
      expectedContext: input.expectedContext,
      expectedFingerprint: input.expectedFingerprint,
    };
    try {
      validateExpectedFingerprint(input.expectedFingerprint);
      const status = await engine.status();
      assertSubset(
        status.stableFingerprint,
        input.expectedFingerprint,
        "EasyEDA runtime fingerprint",
      );
      await engine.assertContext(input.expectedContext);
      const results = [];
      for (const call of input.calls) {
        const activeContext = await engine.assertContext(input.expectedContext);
        assertToolFamilyContext(call.upstreamTool, activeContext);
        assertTargetArguments(
          call.arguments,
          input.expectedContext,
          activeContext,
          call.upstreamTool,
        );
        dispatched = true;
        results.push({
          upstreamTool: call.upstreamTool,
          result: await callReadOnly(call.upstreamTool, call.arguments),
        });
        await engine.assertContext(input.expectedContext);
      }
      return await withEvidence(
        request,
        results,
        input.evidence,
        { facadeVersion: CONTROL_VERSION },
        {
          reservation,
          returnMode: input.returnMode,
          maxInlineBytes: input.maxInlineBytes,
        },
      );
    } catch (error) {
      if (reservation && !dispatched) {
        await releaseEvidenceReservation(reservation);
      } else if (reservation) {
        await finalizeDispatchedFailure(reservation, request, error, {
          effect: "read-batch",
        });
      }
      throw error;
    }
  }),
);

registerFacadeTool(
  "easyeda_control_execute",
  {
    title: "Unrestricted EasyEDA execution (disabled)",
    description:
      "Structurally disabled in this release. Arbitrary JavaScript cannot be dispatched through the facade because its collateral effects and ambiguous-timeout recovery cannot be bounded.",
    inputSchema: {},
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
  },
  serializedGuarded(() => {
    throw new Error(
      "Standalone unrestricted JavaScript is structurally disabled in this release; there is no environment opt-in.",
    );
  }),
);

registerFacadeTool(
  "easyeda_control_capture",
  {
    title: "Capture the guarded EasyEDA canvas",
    description:
      "Capture the visible canvas, a framed canvas region, or a complete schematic page while preserving the PNG image content. Region and full-page modes change the visible viewport but not design data.",
    inputSchema: {
      request: captureRequestSchema,
      expectedContext: contextSchema,
      expectedFingerprint: expectedFingerprintSchema,
      evidence: evidenceSchema,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
  (input) =>
    bridgeGate.run(async () => {
      const captureRequest = input.request;
      let reservation;
      let dispatched = false;
      try {
        await engine.assertBridgeDispatchAllowed();
        if (!CAPTURE_TOOLS.has(captureRequest.upstreamTool)) {
          throw new Error("Capture tool is not allowlisted.");
        }
        reservation = await reserveEvidencePaths(input.evidence);
        validateExpectedFingerprint(input.expectedFingerprint);
        const status = await engine.status();
        assertSubset(
          status.stableFingerprint,
          input.expectedFingerprint,
          "EasyEDA runtime fingerprint",
        );
        const activeContext = await engine.assertContext(input.expectedContext);
        const expectedProjectUuid =
          input.expectedContext.project.uuid ??
          input.expectedContext.project.projectUuid;
        if (
          captureRequest.upstreamTool ===
            "easyeda_schematic_capture_full_page" &&
          activeContext.document.documentType !== 1
        ) {
          throw new Error(
            "A full-page schematic capture requires an active schematic document.",
          );
        }
        if (
          "projectId" in captureRequest.arguments &&
          captureRequest.arguments.projectId !== expectedProjectUuid
        ) {
          throw new Error(
            "Capture arguments.projectId must equal the proven project UUID.",
          );
        }
        if (
          typeof activeContext.document.tabId !== "string" ||
          activeContext.document.tabId.length === 0 ||
          captureRequest.arguments.tabId !== activeContext.document.tabId
        ) {
          throw new Error(
            "Capture requires arguments.tabId equal to the active proven tab id.",
          );
        }
        dispatched = true;
        const raw = await upstream.callTool(
          captureRequest.upstreamTool,
          captureRequest.arguments,
          70_000,
        );
        const extractedPayload = extractToolPayload(raw);
        if (!isRecord(extractedPayload)) {
          throw new Error("Canvas capture returned a non-object payload.");
        }
        if (extractedPayload["captured"] !== true) {
          const captureError = extractedPayload["error"];
          let reason: string;
          if (typeof captureError === "string") {
            reason = captureError;
          } else if (captureError === undefined) {
            reason = "unknown reason";
          } else {
            reason = JSON.stringify(jsonSafe(captureError));
          }
          throw new Error(`Canvas capture failed: ${reason}`);
        }
        const payload = capturePayloadSchema.parse(extractedPayload);
        if (
          captureRequest.upstreamTool === "easyeda_schematic_capture_full_page"
        ) {
          if (payload.project_id !== expectedProjectUuid) {
            throw new Error(
              "Full-page capture result.project_id does not match the proven project.",
            );
          }
          if (
            !captureRequest.arguments.allowInferredA4 &&
            payload.deterministic_viewport !== true
          ) {
            throw new Error(
              "Full-page capture did not prove runtime sheet geometry; inferred A4 was not authorized.",
            );
          }
          const fullPagePayload = requireFullPageCapturePayload(payload);
          if (
            payload.deterministic_viewport === true &&
            fullPagePayload.sheet["source"] !== "sheet-info"
          ) {
            throw new Error(
              "Full-page capture reported contradictory viewport provenance.",
            );
          }
        }
        const rawContent =
          isRecord(raw) && Array.isArray(raw.content) ? raw.content : [];
        const images = rawContent.filter((item) => isImageBlock(item));
        if (images.length !== 1) {
          throw new Error(
            "Canvas capture must return exactly one MCP image block.",
          );
        }
        const imageEvidence = images.map((item) => {
          const bytes = Buffer.from(item.data, "base64");
          const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
          if (
            item.mimeType !== "image/png" ||
            bytes.length <= pngSignature.length ||
            !bytes.subarray(0, pngSignature.length).equals(pngSignature)
          ) {
            throw new Error(
              "Canvas capture returned a missing, empty, or non-PNG image.",
            );
          }
          if (
            payload.mime_type !== item.mimeType ||
            !Number.isSafeInteger(payload.byte_length) ||
            payload.byte_length !== bytes.length
          ) {
            throw new Error(
              "Canvas capture payload MIME type or byte length does not match its PNG block.",
            );
          }
          if (Object.hasOwn(payload, "image_base64")) {
            if (typeof payload.image_base64 !== "string") {
              throw new TypeError(
                "Canvas capture payload image_base64 must be a string when present.",
              );
            }
            if (!Buffer.from(payload.image_base64, "base64").equals(bytes)) {
              throw new Error(
                "Canvas capture payload image bytes do not match its MCP image block.",
              );
            }
          }
          const dimensions = readPngDimensions(bytes);
          if (
            captureRequest.upstreamTool ===
            "easyeda_schematic_capture_full_page"
          ) {
            const fullPagePayload = requireFullPageCapturePayload(payload);
            validateFullPageCaptureGeometry(
              fullPagePayload,
              captureRequest.arguments.padding,
              dimensions,
            );
          }
          return {
            mimeType: item.mimeType,
            bytes,
          };
        });
        const capturePayload = { ...payload };
        delete capturePayload.image_base64;
        await engine.assertContext(input.expectedContext);
        const evidence = await archiveCaptureEvidence({
          reservation,
          request: {
            upstreamTool: captureRequest.upstreamTool,
            arguments: captureRequest.arguments,
            expectedContext: input.expectedContext,
            expectedFingerprint: input.expectedFingerprint,
          },
          payload: capturePayload,
          images: imageEvidence,
          metadata: { facadeVersion: CONTROL_VERSION, effect: "viewport-read" },
        });
        const safeStructuredContent = jsonSafe({
          ...capturePayload,
          images: evidence.images,
          evidence,
        });
        const structuredContent = isRecord(safeStructuredContent)
          ? safeStructuredContent
          : { value: safeStructuredContent };
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                ok: true,
                captured: true,
                imageCount: images.length,
                receiptPath: evidence.receiptPath,
              }),
            },
            ...images,
          ],
          structuredContent,
        };
      } catch (error) {
        if (reservation && !dispatched) {
          await ignoreCleanupFailure(releaseEvidenceReservation(reservation));
        } else if (reservation) {
          await finalizeDispatchedFailure(
            reservation,
            {
              upstreamTool: captureRequest.upstreamTool,
              arguments: captureRequest.arguments,
              expectedContext: input.expectedContext,
              expectedFingerprint: input.expectedFingerprint,
            },
            error,
            { effect: "viewport-read" },
          );
        }
        return failure(error);
      }
    }),
);

registerFacadeTool(
  "easyeda_control_export",
  {
    title: "Generate a guarded EasyEDA export",
    description:
      "Generate a PCB DSN route-context artifact through a facade-owned public API call, with exact type-3 context checks immediately before and after generation. The installed API has no document argument, so the artifact is active-context/best-effort rather than identity-bound. Archives a SHA-256 receipt; never fabrication release.",
    inputSchema: {
      request: exportRequestSchema,
      expectedContext: contextSchema,
      expectedFingerprint: privateFingerprintSchema,
      evidence: evidenceSchema,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
  serializedGuarded(async (input) => {
    const exportRequest = input.request;
    if (!EXPORT_TOOLS.has(exportRequest.upstreamTool)) {
      throw new Error("Export tool is not allowlisted.");
    }
    const reservation = await reserveEvidencePaths(input.evidence);
    let dispatched = false;
    let createdExportDirectory: string | undefined;
    const requestedPath = resolve(exportRequest.arguments.filePath);
    const request = {
      upstreamTool: exportRequest.upstreamTool,
      arguments: exportRequest.arguments,
      expectedContext: input.expectedContext,
      expectedFingerprint: input.expectedFingerprint,
    };
    try {
      validatePrivateFingerprint(input.expectedFingerprint);
      const status = await engine.status();
      assertSubset(
        status.stableFingerprint,
        input.expectedFingerprint,
        "EasyEDA runtime fingerprint",
      );
      const activeContext = await engine.assertContext(input.expectedContext);
      const exportDocumentType = requiredExportDocumentType(
        exportRequest.upstreamTool,
      );
      if (activeContext.document.documentType !== exportDocumentType) {
        throw new Error(
          `${exportRequest.upstreamTool} requires active document type ${exportDocumentType}; type ${String(activeContext.document.documentType)} cannot be used. PCB 3D preview type 15 is never an export target.`,
        );
      }
      const expectedProjectUuid =
        input.expectedContext.project.uuid ??
        input.expectedContext.project.projectUuid;
      if (exportRequest.arguments.projectId !== expectedProjectUuid) {
        throw new Error(
          "Export arguments.projectId must equal the proven project UUID.",
        );
      }
      if (!isAbsolute(exportRequest.arguments.filePath)) {
        throw new Error(
          "Every export requires an explicit absolute arguments.filePath.",
        );
      }
      const exportRoot = resolve(
        controlDataDirectory(),
        "upstream",
        "artifacts",
        "facade-exports",
      );
      await ensureManagedDirectory(exportRoot);
      const exportDirectory = dirname(requestedPath);
      if (
        dirname(exportDirectory) !== exportRoot ||
        !/^export-[a-z0-9-]{8,80}$/iu.test(basename(exportDirectory)) ||
        relative(exportRoot, requestedPath).startsWith("..")
      ) {
        throw new Error(
          `Export filePath must use a fresh ${exportRoot}/export-<unique>/ directory.`,
        );
      }
      await mkdir(exportDirectory, { recursive: false, mode: 0o700 });
      await ensureManagedDirectory(exportDirectory);
      createdExportDirectory = exportDirectory;
      if (
        [reservation.resultPath, reservation.receiptPath].includes(
          requestedPath,
        )
      ) {
        throw new Error(
          "Export artifact path must differ from its evidence and receipt paths.",
        );
      }
      try {
        await stat(requestedPath);
        throw new Error(
          "Export artifact path already exists; refusing overwrite.",
        );
      } catch (error) {
        const errorRecord = isRecord(error) ? error : {};
        if (errorRecord["code"] !== "ENOENT") {
          throw error;
        }
      }
      const startedAtMs = Date.now();
      dispatched = true;
      const source = buildDsnExportCode(
        basename(requestedPath),
        input.expectedContext,
      );
      const guardedSource = wrapWithContextGuard(source, input.expectedContext);
      const generated = dsnExportPayloadSchema.parse(
        extractToolPayload(
          await upstream.callTool(
            "easyeda_execute",
            { code: guardedSource, timeoutMs: 60_000, confirmWrite: true },
            70_000,
          ),
        ),
      );
      assertSubset(
        generated,
        {
          ok: true,
          kind: "pcb-dsn",
          project: { uuid: expectedProjectUuid },
          document: {
            uuid:
              input.expectedContext.document.uuid ??
              input.expectedContext.document.documentUuid,
            documentType: 3,
            tabId: input.expectedContext.document.tabId,
          },
        },
        "Facade-owned DSN export",
      );
      if (
        typeof generated.base64 !== "string" ||
        !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(
          generated.base64,
        )
      ) {
        throw new Error("Facade-owned DSN export returned malformed base64.");
      }
      const exportBytes = Buffer.from(generated.base64, "base64");
      if (
        exportBytes.length === 0 ||
        !Number.isInteger(generated.byteLength) ||
        generated.byteLength !== exportBytes.length
      ) {
        throw new Error(
          "Facade-owned DSN export returned an empty or inconsistent byte count.",
        );
      }
      await writeDurableExclusive(requestedPath, exportBytes);
      const inspection = await inspectManagedFile(
        requestedPath,
        "Export artifact",
      );
      const { info } = inspection;
      if (info.isSymbolicLink() || !info.isFile() || info.size === 0) {
        throw new Error(
          "Export artifact is missing, empty, or a symbolic link.",
        );
      }
      if (info.mtimeMs + 2000 < startedAtMs) {
        throw new Error(
          "Export artifact timestamp predates this export dispatch.",
        );
      }
      if (generated.byteLength !== info.size) {
        throw new Error("Export byte length changed after write.");
      }
      await engine.assertContext(input.expectedContext);
      const verified = {
        exported: true,
        kind: generated.kind,
        project_id: expectedProjectUuid,
        document: generated.document,
        contextBinding: {
          level: "active-context-best-effort",
          reason:
            "The installed getDsnFile API accepts no project, document, or tab argument; pre/post context checks cannot detect a switch away and back while generation is pending.",
        },
        sourceSha256: sha256Text(source),
        transmittedSourceSha256: sha256Text(guardedSource),
        artifact: {
          path: requestedPath,
          bytes: info.size,
          mtimeMs: info.mtimeMs,
          sha256: await sha256File(requestedPath),
        },
        fabricationRelease: false,
      };
      return await withEvidence(
        request,
        verified,
        input.evidence,
        { facadeVersion: CONTROL_VERSION, effect: "artifact-write" },
        {
          reservation,
          attachments: [
            {
              kind: "export-artifact",
              path: verified.artifact.path,
              bytes: verified.artifact.bytes,
              sha256: verified.artifact.sha256,
            },
          ],
        },
      );
    } catch (error) {
      if (dispatched) {
        const failureMetadata: Record<string, unknown> = {
          effect: "artifact-write",
          exportDirectory: createdExportDirectory,
        };
        const failureAttachments: EvidenceAttachment[] = [];
        try {
          const observed = await inspectManagedFile(
            requestedPath,
            "Failed export artifact",
          );
          failureMetadata["exportArtifactObserved"] = {
            path: observed.absolute,
            bytes: observed.info.size,
            mtimeMs: observed.info.mtimeMs,
          };
          failureAttachments.push({
            kind: "export-artifact-after-failure",
            path: observed.absolute,
          });
        } catch (inspectionError) {
          const inspectionRecord = isRecord(inspectionError)
            ? inspectionError
            : {};
          if (inspectionRecord["code"] !== "ENOENT") {
            failureMetadata["exportArtifactInspectionError"] = {
              name: inspectionRecord["name"] ?? "Error",
              message: inspectionRecord["message"] ?? String(inspectionError),
            };
          }
        }
        await finalizeDispatchedFailure(
          reservation,
          request,
          error,
          failureMetadata,
          failureAttachments,
        );
      } else {
        await ignoreCleanupFailure(releaseEvidenceReservation(reservation));
        if (
          createdExportDirectory !== undefined &&
          createdExportDirectory.length > 0
        ) {
          await ignoreCleanupFailure(rmdir(createdExportDirectory));
        }
      }
      throw error;
    }
  }),
);

registerFacadeTool(
  "easyeda_control_plan",
  {
    title: "Experimental PCB mutation plan (disabled)",
    description:
      "Runtime-disabled pending connected sacrificial-board validation. The retained candidate plans one facade-generated PCB component placement/layer/lock change with exact checkpoints and rejects caller JavaScript.",
    inputSchema: {
      plan: operationPlanSchema,
      confirmDiscardAnyUnsavedState: z.literal(true),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
  },
  serializedGuarded(({ plan, confirmDiscardAnyUnsavedState }) =>
    engine.plan(plan, { confirmDiscardAnyUnsavedState }),
  ),
);

registerFacadeTool(
  "easyeda_control_apply",
  {
    title: "Experimental PCB mutation apply (disabled)",
    description:
      "Runtime-disabled pending connected sacrificial-board validation. If later enabled, re-prove the preflight and exact tab before one journal-bound unsaved patch; never retry an uncertain call.",
    inputSchema: {
      operationId: operationIdSchema,
      planHash: planHashSchema,
      confirmApply: z.literal(true),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
  },
  serializedGuarded((input) => engine.apply(input.operationId, input.planHash)),
);

registerFacadeTool(
  "easyeda_control_verify",
  {
    title: "Experimental PCB mutation verification (disabled)",
    description:
      "Runtime-disabled with the experimental writer. Retained to test journaled exact readback and invariant assertions.",
    inputSchema: { operationId: operationIdSchema },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
  serializedGuarded((input) => engine.verify(input.operationId)),
);

registerFacadeTool(
  "easyeda_control_rollback",
  {
    title: "Experimental PCB mutation rollback (disabled)",
    description:
      "Runtime-disabled pending connected sacrificial-board validation. The candidate inverse requires exact desired-state proof before dispatch and exact baseline restoration afterward; it never saves.",
    inputSchema: {
      operationId: operationIdSchema,
      planHash: planHashSchema,
      confirmRollback: z.literal(true),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
  },
  serializedGuarded((input) =>
    engine.rollback(input.operationId, input.planHash),
  ),
);

registerFacadeTool(
  "easyeda_control_save_reopen",
  {
    title: "Experimental PCB mutation persistence (disabled)",
    description:
      "Runtime-disabled with the experimental writer. The retained candidate lifecycle re-verifies, saves, closes, reopens, proves durable state, and verifies a final SQLite checkpoint.",
    inputSchema: {
      operationId: operationIdSchema,
      planHash: planHashSchema,
      confirmPersist: z.literal(true),
      confirmDiscardAnyUnsavedState: z.boolean().default(false),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
  },
  serializedGuarded((input) =>
    engine.saveReopen(input.operationId, input.planHash, {
      confirmDiscardAnyUnsavedState: input.confirmDiscardAnyUnsavedState,
    }),
  ),
);

registerFacadeTool(
  "easyeda_control_checkpoint",
  {
    title: "Create or verify an EasyEDA project checkpoint",
    description:
      "Create an exclusive SQLite online backup with quick_check, logical dump comparison, SHA-256 hashes, and receipt, or verify an existing receipt.",
    inputSchema: {
      request: checkpointRequestSchema,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
  serializedGuarded((input) => {
    if (input.request.action === "verify") {
      return engine.checkpoint({ receiptPath: input.request.receiptPath });
    }
    return engine.checkpoint(
      checkpointCreateSchema.parse({
        source: input.request.source,
        outputDir: input.request.outputDir,
        label: input.request.label,
      }),
    );
  }),
);

registerFacadeTool(
  "easyeda_control_recover_incomplete",
  {
    title: "Recover an incomplete EasyEDA operation",
    description:
      "List nonterminal journals, or reconcile one against its stored baseline, desired live state, or reopened state. When orphanedCallPossible is true, resolution is blocked at a destructive human gate until a person has deliberately terminated and restarted EasyEDA Pro, reconnected the bridge, and supplied a fresh operation-bound runtimeRestartConfirmation. If a native unsaved-changes prompt appears, never choose Save; discard or force-quit only with explicit authority and still-valid clean-baseline/no-concurrent-edit assumptions, otherwise cancel and preserve the session for manual review. An agent must never synthesize or replay the attestation, and the facade cannot independently prove process generation or prompt choices.",
    inputSchema: {
      operationId: operationIdSchema.optional(),
      resolution: z
        .enum([
          "reconciled-no-mutation",
          "reconciled-applied-unsaved",
          "reconciled-saved-reopened",
        ])
        .optional(),
      confirmation: z.string().optional(),
      runtimeRestartConfirmation: z
        .string()
        .optional()
        .describe(
          "Fresh human-user attestation only, supplied after the authorized destructive restart gate and bridge reconnect. Agents must never synthesize, infer, copy from an error, or replay it.",
        ),
      confirmDiscardAnyUnsavedState: z.boolean().default(false),
      confirmRepeatAfterUnknownRecovery: z.boolean().default(false),
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
    },
  },
  serializedGuarded(
    (input) => {
      if (input.operationId === undefined || input.operationId.length === 0) {
        return engine.recover();
      }
      if (input.resolution === undefined) {
        throw new Error("resolution is required when operationId is provided.");
      }
      if (input.confirmation !== `${input.operationId}:${input.resolution}`) {
        throw new Error(
          "confirmation must exactly equal operationId:resolution.",
        );
      }
      return engine.recover(input.operationId, input.resolution, {
        confirmDiscardAnyUnsavedState: input.confirmDiscardAnyUnsavedState,
        confirmRepeatAfterUnknownRecovery:
          input.confirmRepeatAfterUnknownRecovery,
        ...(input.runtimeRestartConfirmation === undefined
          ? {}
          : { runtimeRestartConfirmation: input.runtimeRestartConfirmation }),
      });
    },
    { allowDuringOrphanRisk: true },
  ),
);

registerFacadeTool(
  "easyeda_control_evidence_verify",
  {
    title: "Verify EasyEDA evidence receipt",
    description:
      "Recompute the self-hash, result hash, captured PNG hashes, and exported-artifact hashes for a managed EasyEDA control receipt.",
    inputSchema: { receiptPath: z.string().min(1) },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  serializedGuarded((input) => verifyEvidenceReceipt(input.receiptPath), {
    allowDuringOrphanRisk: true,
  }),
);

registerFacadeTool(
  "easyeda_control_artifact_read",
  {
    title: "Read an EasyEDA control artifact",
    description:
      "Read a bounded byte range from a managed EasyEDA control evidence, journal, or receipt file. Paths outside the control data directory are rejected. Maximum 256 KiB per call.",
    inputSchema: {
      path: z.string().min(1),
      offset: z.number().int().min(0).default(0),
      length: z
        .number()
        .int()
        .min(1)
        .max(256 * 1024)
        .default(65_536),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  serializedGuarded(
    (input) => readArtifact(input.path, input.offset, input.length),
    { allowDuringOrphanRisk: true },
  ),
);

const transport = new StdioServerTransport();
const shutdown = async (): Promise<void> => {
  await ignoreCleanupFailure(upstream.close());
  await ignoreCleanupFailure(server.close());
  await ignoreCleanupFailure(facadeLease.release());
};
const shutdownAndExit = async (): Promise<void> => {
  await shutdown();
  process.exit(0);
};
const scheduleShutdown = (): void => {
  void shutdownAndExit();
};
process.once("SIGINT", scheduleShutdown);
process.once("SIGTERM", scheduleShutdown);
process.stdin.once("end", scheduleShutdown);
await server.connect(transport);
