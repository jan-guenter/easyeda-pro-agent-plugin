#!/usr/bin/env node
import { createHash } from "node:crypto";
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
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
  controlRootCapability,
  ensureManagedDirectory,
  inspectManagedFile,
  loadOperation,
  publishManagedAttachmentExclusive,
  readArtifact,
  recoverPublishedEvidence,
  releaseEvidenceReservation,
  reserveEvidencePaths,
  verifyEvidenceReceipt,
} from "./artifacts.ts";
import type {
  EvidenceAttachment,
  PublishedManagedAttachment,
} from "./artifacts.ts";
import {
  CONTROL_VERSION,
  assertReviewedLocalGenericReadArguments,
  assertSelfSoftCoreLimitZero,
  assertSubset,
  canonicalJson,
  extractToolPayload,
  filterTools,
  isRecord,
  isReviewedLocalGenericRead,
  sha256Text,
  validateExpectedFingerprint,
  validatePrivateFingerprint,
} from "./core.ts";
import { EasyedaControlEngine, SerializedGate } from "./engine.ts";
import type { StatusAdmissionObservation } from "./engine.ts";
import { DesignExecutor } from "./design-execution.ts";
import { compileDesignAction } from "./design-action.ts";
import { assertDesignExecutionLifecycle } from "./design-execution-lifecycle.ts";
import { executeAndCommitDesign } from "./design-execute.ts";
import { RuleCheckExecutor } from "./check-execution.ts";
import { ProjectOpenExecutor, projectOpenTargetSchema } from "./project-open-execution.ts";
import { routeAuditResultSchema, runPcbRouteAudit } from "./route-audit-execution.ts";
import { pcbRouteAuditRequestSchema } from "./pcb-route-audit.ts";
import { boundedTransactionErrorOutput, transactionErrorOutputSchema } from "./transaction-error-output.ts";
import { listDesignActionCapabilities } from "./design-capabilities.ts";
import { designTopologySchema } from "./design-topology.ts";
import { LibraryExecutor, listLibraryExecutionCapabilities } from "./library-execution.ts";
import { assertLibraryExecutionLifecycle } from "./library-execution-lifecycle.ts";
import { assertLegacyRecoveryJournalFamily } from "./legacy-recovery-family.ts";
import { designToolOperationSchema, libraryToolOperationSchema } from "./tool-operation-envelope.ts";
import { WindowsControlRuntime } from "./windows-runtime.ts";
import { createWindowsRuntimeValidator } from "./windows-runtime-validator.ts";
import type { ClosedSymbolDisposableEntry } from "./closed-symbol-disposable-entry.ts";
import type { ClosedSymbolOperationEntry } from "./closed-symbol-operation-entry.ts";
import { assertClosedSymbolOperationValidated } from "./closed-symbol-operation-request.ts";
import { closedSymbolEntryFailureDiagnostic, closedSymbolFailureDiagnostic } from "./closed-symbol-failure-diagnostic.ts";
import { closedSymbolOperationInputSchema, closedSymbolOperationOutputSchema, closedSymbolOperationStopped,
  formatClosedSymbolOperationResult, parseClosedSymbolOperationInput } from "./closed-symbol-operation-tool.ts";
import {
  closedSymbolDisposableIndexRefusal, closedSymbolDisposableInputSchema, closedSymbolDisposableOutputSchema,
  formatClosedSymbolDisposableResult, parseClosedSymbolDisposableInput,
} from "./closed-symbol-disposable-tool.ts";
import type { ClosedSymbolIndexPhase, ClosedSymbolIndexReason } from "./closed-symbol-disposable-tool.ts";
import { WindowsNativeUiController, nativeUiRequestSchema } from "./windows-native-ui.ts";
import { runNativeUiWithOperationAdmission } from "./native-ui-admission.ts";
import { discardCloseConfirmation, nativeCloseRecoveryRequestSchema } from "./native-close-recovery.ts";
import { exactReadRequestSchema } from "./exact-readers.ts";
import { acquireFacadeLease } from "./lease.ts";
import { discoverReviewedOrLiveTools } from "./reviewed-upstream-tools.ts";
import { buildDsnExportCode, wrapWithContextGuard } from "./runtime-scripts.ts";
import { UpstreamEasyedaClient, UpstreamStartupError } from "./upstream.ts";
import { createSerializedShutdown } from "./shutdown.ts";
import { offlineApiToolConfiguration, runOfflineApi } from "./offline-api.ts";
import { publicSdkReadImplementationKind, publicSdkReadRequestSchema } from "./public-sdk-read.ts";
import { isSchematicNativeIdMethod } from "./schematic-native-ids.ts";
import { SCHEMATIC_COMPONENT_PROPERTY_METHOD } from "./schematic-component-properties.ts";
import { SYMBOL_PIN_ENUMERATION_METHOD } from "./symbol-pin-enumeration.ts";
import { isSchematicTextReadMethod } from "./schematic-text-read.ts";
import { isSchematicNetGroupReadMethod } from "./schematic-netgroup-read.ts";
import { PCB_NET_MEMBERSHIP_METHOD } from "./pcb-net-membership.ts";
import { readPcbNetMembership } from "./pcb-net-membership-read.ts";
import { PCB_PRIMITIVE_TYPE_METHOD, readPcbPrimitiveType } from "./pcb-primitive-type-read.ts";
import { PCB_SELECTED_OBJECTS_METHOD } from "./pcb-selected-objects.ts";
import { readPcbSelectedObjects } from "./pcb-selected-objects-read.ts";
import { isPcbSourceObjectsMethod } from "./pcb-source-objects.ts";
import { readPcbSourceObjects } from "./pcb-source-objects-read.ts";
import { PcbSelectedReadTimings } from "./pcb-selected-read-timings.ts";
import { PCB_ACTIVE_LAYER_METHOD, readPcbActiveLayer } from "./pcb-active-layer-read.ts";
import { CALCULATION_ONLY_TOOLS, configuredFacadeMode, facadeToolRegistered } from "./facade-mode.ts";
import { sdkMathRequestSchema } from "./sdk-math.ts";
import { calculateSdkMath } from "./sdk-math-runtime.ts";
import { sdkSystemRequestSchema } from "./sdk-system.ts";
import { readSdkSystem } from "./sdk-system-runtime.ts";
import { startupExtensionsRequestSchema } from "./startup-extensions.ts";
import { readStartupExtensions } from "./startup-extensions-runtime.ts";
import { editorShellRequestSchema } from "./editor-shell.ts";
import { editorContextRequestSchema } from "./editor-context.ts";
import { readEditorContext, readEditorShell } from "./editor-shell-runtime.ts";
import { OrdinaryLaunchCoordinator, ordinaryLaunchRequestSchema } from "./ordinary-launch.ts";
import { shortcutKeysRequestSchema } from "./shortcut-keys.ts";
import { readShortcutKeys } from "./shortcut-keys-runtime.ts";
import { currentPcbLayersRequestSchema } from "./current-pcb-layers.ts";
import { readCurrentPcbLayers } from "./current-pcb-layers-runtime.ts";
import { currentDisposableOpenRequestSchema } from "./current-disposable-open.ts";
import { CurrentDisposableOpenCoordinator } from "./current-disposable-open-runtime.ts";
import { currentPcbIdentitiesRequestSchema } from "./current-pcb-identities.ts";
import { readCurrentPcbIdentities } from "./current-pcb-identities-runtime.ts";
import { currentPcbGeometryRequestSchema } from "./current-pcb-geometry.ts";
import { readCurrentPcbGeometry } from "./current-pcb-geometry-runtime.ts";
import { currentSymbolMetadataRequestSchema } from "./current-symbol-metadata.ts";
import { currentSymbolOperationRequestSchema } from "./current-symbol-operation.ts";
import { readCurrentSymbolMetadata } from "./current-symbol-metadata-runtime.ts";
import { currentProjectOnlySymbolPreflightRequestSchema } from "./current-project-only-symbol-preflight.ts";
import { readCurrentProjectOnlySymbolPreflight } from "./current-project-only-symbol-runtime.ts";
import { historicalAbandonmentRequestSchema, runHistoricalAbandonment } from "./historical-abandonment.ts";

const facadeMode = configuredFacadeMode(process.env);

const MAX_INLINE_RESULT_BYTES = 256 * 1024;
const MAX_CAPTURE_PNG_BYTES = 16 * 1024 * 1024;
const MAX_CAPTURE_BASE64_CHARACTERS =
  Math.ceil(MAX_CAPTURE_PNG_BYTES / 3) * 4;
const MAX_CAPTURE_DECODED_BYTES = 64 * 1024 * 1024;
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
await assertSelfSoftCoreLimitZero();
await ensureManagedDirectory(controlDataDirectory());
const retainedControlRoot = await controlRootCapability();
const facadeLease = await acquireFacadeLease(retainedControlRoot);
const upstream = new UpstreamEasyedaClient({
  controlRoot: retainedControlRoot,
  onChildStarted: (pid): Promise<void> => facadeLease.bindChild(pid),
});
let windowsRuntime: WindowsControlRuntime | undefined;
let ordinaryLaunchCoordinator: OrdinaryLaunchCoordinator | undefined;
let ordinaryLaunchRuntime: WindowsControlRuntime | undefined;
let currentDisposableOpenCoordinator: CurrentDisposableOpenCoordinator | undefined;
let scheduledShutdown: Promise<void> | undefined;
function ownedWindowsRuntime(): WindowsControlRuntime {
  if (windowsRuntime === undefined) { throw new Error("Use easyeda_control_runtime launch-contained before guarded design editing."); }
  return windowsRuntime;
}
const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: createWindowsRuntimeValidator(ownedWindowsRuntime) });
const designExecutor = new DesignExecutor(engine);
const libraryExecutor = new LibraryExecutor(engine);
const ruleCheckExecutor = new RuleCheckExecutor(engine);
const projectOpenExecutor = new ProjectOpenExecutor(engine);
const bridgeGate = new SerializedGate();

interface ClosedSymbolIndexReservation {
  readonly engine: EasyedaControlEngine;
  readonly upstream: UpstreamEasyedaClient;
  readonly gate: SerializedGate;
  readonly facadePromise: EasyedaControlEngine["controlFingerprintPromise"];
  readonly executionAuthority: object;
  readonly environment: typeof process.env;
  readonly assetsRoot: string | undefined;
  readonly wslDistribution: string | undefined;
  readonly controlPath: string;
  readonly pluginRoot: string;
  readonly requestText: string;
  readonly methods: readonly unknown[];
  runtime: WindowsControlRuntime | undefined;
  nativeUi: WindowsNativeUiController | undefined;
  constructedMethods: readonly unknown[] | undefined;
  entry: ClosedSymbolDisposableEntry | ClosedSymbolOperationEntry | undefined;
  entryRun: ((rawRequest: unknown) => Promise<unknown>) | undefined;
  facade: Awaited<EasyedaControlEngine["controlFingerprintPromise"]> | undefined;
  facadeSha256: string | undefined;
  entryInvocationAttempted: boolean;
  entryReturnObserved: boolean;
  originalReturn: unknown;
  failureObserved: boolean;
  originalFailure: unknown;
}
let closedSymbolIndexReservation: ClosedSymbolIndexReservation | undefined;
const closedSymbolUnreservedFailure: { observed: boolean; original: unknown } = { observed: false, original: undefined };

function disposableOwnData(owner: object, key: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(owner, key);
  if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { throw new Error("Disposable index owner data changed."); }
  return descriptor.value as unknown;
}
function disposableOwnerMethod(owner: object, key: string): unknown {
  let candidate: object | null = owner;
  for (let depth = 0; candidate !== null && depth < 8; depth += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(candidate, key);
    if (descriptor !== undefined) {
      if (!Object.hasOwn(descriptor, "value") || typeof descriptor.value !== "function") { throw new Error("Disposable index owner method changed."); }
      return descriptor.value as unknown;
    }
    const parent: unknown = Object.getPrototypeOf(candidate);
    if (parent !== null && typeof parent !== "object") { throw new Error("Disposable index owner prototype changed."); }
    candidate = parent;
  }
  throw new Error("Disposable index owner method unavailable.");
}
function disposableIndexMethods(): readonly unknown[] {
  const authority = disposableOwnData(engine, "executionAuthorityValidator");
  if (authority === null || typeof authority !== "object") { throw new Error("Disposable index engine authority owner is unavailable."); }
  return [
    disposableOwnerMethod(bridgeGate, "run"), disposableOwnerMethod(engine, "assertBridgeDispatchAllowed"),
    disposableOwnerMethod(engine, "assertBridgeAndRecoveryAdmission"),
    disposableOwnerMethod(engine, "assertBridgeAndNativeUiEditingAdmission"),
    disposableOwnerMethod(engine, "assertNativeUiEditingAllowed"),
    ...["capture", "proveTerminated", "releaseCapture"].map(key => disposableOwnerMethod(authority, key)),
    ...["currentAuthenticatedBridgeDispatchBinding", "bridgeSessionLifecycle", "launcherFingerprint", "installedEasyedaBundles",
      "connect", "withAuthenticatedBridgeDispatchScope"].map(key => disposableOwnerMethod(upstream, key)),
    disposableOwnerMethod(WindowsNativeUiController.prototype, "run"),
    ...["status", "launch", "capture", "proveTerminated", "releaseCapture", "prepareClosedSessionClose",
      "requestClosedSessionNormalClose", "probeClosedSessionTermination", "clockObservationForLaunch"]
      .map(key => disposableOwnerMethod(WindowsControlRuntime.prototype, key)),
  ];
}
function disposableConstructedMethods(runtime: WindowsControlRuntime, nativeUi: WindowsNativeUiController): readonly unknown[] {
  return [disposableOwnerMethod(nativeUi, "run"),
    ...["status", "launch", "capture", "proveTerminated", "releaseCapture", "prepareClosedSessionClose",
      "requestClosedSessionNormalClose", "probeClosedSessionTermination", "clockObservationForLaunch"]
      .map(key => disposableOwnerMethod(runtime, key))];
}
function assertOrdinaryRuntimeAllocationAllowed(): void {
  if (closedSymbolIndexReservation !== undefined) { throw new Error("The Windows runtime is reserved by a consumed closed-symbol attempt."); }
  if (ordinaryLaunchRuntime !== undefined) { throw new Error("The Windows runtime is reserved by the ordinary launch coordinator."); }
}

/** No outer gate/authenticated scope. The exact retained entry owns its one gate admission. */
async function runClosedSymbolTool(input: unknown, mode: "validation" | "ordinary"): Promise<CallToolResult> {
  let phase: ClosedSymbolIndexPhase = "request";
  let reason: ClosedSymbolIndexReason = "invalid-request";
  let activeReservation: ClosedSymbolIndexReservation | undefined;
  try {
    const parsed = mode === "validation" ? parseClosedSymbolDisposableInput(input) : parseClosedSymbolOperationInput(input);
    // Refuse before reservation, imports, runtime allocation or bridge admission.
    if (mode === "ordinary") {
      try { assertClosedSymbolOperationValidated(); }
      catch (error) { return formatClosedSymbolOperationResult(closedSymbolOperationStopped({ phase: "validation", attemptReserved: false }),
        closedSymbolFailureDiagnostic(error, "validation")); }
    }
    const requestText = canonicalJson(parsed.request);
    phase = "reservation"; reason = "attempt-unavailable";
    if (closedSymbolIndexReservation !== undefined || windowsRuntime !== undefined || scheduledShutdown !== undefined) {
      throw new Error("Disposable index attempt is unavailable.");
    }
    if (disposableOwnData(engine, "upstream") !== upstream) { throw new Error("Disposable index engine owner differs."); }
    disposableOwnData(engine, "controlFingerprintPromise");
    const facadePromise = engine.controlFingerprintPromise;
    if (disposableOwnData(engine, "controlFingerprintPromise") !== facadePromise) { throw new Error("Disposable index facade promise differs."); }
    const executionAuthority = disposableOwnData(engine, "executionAuthorityValidator");
    if (executionAuthority === null || typeof executionAuthority !== "object") { throw new Error("Disposable index engine authority owner differs."); }
    const environment = process.env;
    const reservation: ClosedSymbolIndexReservation = {
      engine, upstream, gate: bridgeGate, facadePromise, executionAuthority, environment, assetsRoot: environment["EASYEDA_ASSETS_ROOT"],
      wslDistribution: environment["WSL_DISTRO_NAME"], controlPath: retainedControlRoot.path,
      pluginRoot: resolve(import.meta.dirname, "../.."), requestText, methods: disposableIndexMethods(),
      runtime: undefined, nativeUi: undefined, constructedMethods: undefined,
      entry: undefined, entryRun: undefined, facade: undefined, facadeSha256: undefined,
      entryInvocationAttempted: false, entryReturnObserved: false, originalReturn: undefined,
      failureObserved: false, originalFailure: undefined,
    };
    // Permanent before the first await, including setup failure. Never reset or replace.
    closedSymbolIndexReservation = reservation; activeReservation = reservation;
    const current = (): void => {
      if (closedSymbolIndexReservation !== reservation || reservation.engine !== engine || reservation.upstream !== upstream ||
        reservation.gate !== bridgeGate || disposableOwnData(engine, "upstream") !== upstream ||
        disposableOwnData(engine, "controlFingerprintPromise") !== facadePromise || reservation.facadePromise !== facadePromise ||
        disposableOwnData(engine, "executionAuthorityValidator") !== reservation.executionAuthority ||
        reservation.environment !== process.env || process.env["EASYEDA_ASSETS_ROOT"] !== reservation.assetsRoot ||
        process.env["WSL_DISTRO_NAME"] !== reservation.wslDistribution || controlDataDirectory() !== reservation.controlPath ||
        retainedControlRoot.path !== reservation.controlPath || resolve(import.meta.dirname, "../..") !== reservation.pluginRoot ||
        scheduledShutdown !== undefined || canonicalJson((mode === "validation" ? parseClosedSymbolDisposableInput(input) : parseClosedSymbolOperationInput(input)).request) !== requestText) {
        throw new Error("Disposable index reservation, request, configuration or shutdown state changed.");
      }
      const methods = disposableIndexMethods();
      if (methods.length !== reservation.methods.length || methods.some((method, index) => method !== reservation.methods[index]) ||
        windowsRuntime !== reservation.runtime) { throw new Error("Disposable index runtime or method ownership changed."); }
      if (reservation.facade !== undefined && disposableOwnData(reservation.facade, "sha256") !== reservation.facadeSha256) {
        throw new Error("Disposable index original facade hash changed.");
      }
      if (reservation.entry !== undefined && disposableOwnerMethod(reservation.entry, "run") !== reservation.entryRun) {
        throw new Error("Disposable index entry method changed.");
      }
      if (reservation.runtime !== undefined && reservation.nativeUi !== undefined) {
        const constructed = disposableConstructedMethods(reservation.runtime, reservation.nativeUi);
        if (reservation.constructedMethods === undefined || constructed.length !== reservation.constructedMethods.length ||
          constructed.some((method, index) => method !== reservation.constructedMethods?.[index])) {
          throw new Error("Disposable index constructed owner methods changed.");
        }
      }
    };
    reason = "setup-refused"; current();
    const assetsRoot = reservation.assetsRoot;
    if (assetsRoot === undefined || assetsRoot.length === 0) { throw new Error("Disposable index requires installed assets configuration."); }
    phase = "facade";
    const facade = await facadePromise;
    reservation.facade = facade;
    const facadeSha256 = disposableOwnData(facade, "sha256");
    if (typeof facadeSha256 !== "string" || !/^[a-f0-9]{64}$/u.test(facadeSha256)) { throw new Error("Disposable index facade hash refused."); }
    reservation.facadeSha256 = facadeSha256; current();
    phase = "entry-import";
    let Entry: typeof ClosedSymbolDisposableEntry | typeof ClosedSymbolOperationEntry;
    if (mode === "validation") { const entryModule = await import("./closed-symbol-disposable-entry.ts"); Entry = entryModule.ClosedSymbolDisposableEntry; }
    else { const entryModule = await import("./closed-symbol-operation-entry.ts"); Entry = entryModule.ClosedSymbolOperationEntry; }
    current();
    phase = "construction";
    const paths = { pluginRoot: reservation.pluginRoot, assetsRoot,
      ...(reservation.wslDistribution === undefined ? {} : { wslDistribution: reservation.wslDistribution }) };
    const runtime = new WindowsControlRuntime(Object.freeze({ ...paths, upstream, reviewedExecutionScopeSha256: facadeSha256 }));
    reservation.runtime = runtime; windowsRuntime = runtime;
    const nativeUi = new WindowsNativeUiController(Object.freeze({ ...paths, runtime }));
    reservation.nativeUi = nativeUi;
    reservation.constructedMethods = disposableConstructedMethods(runtime, nativeUi);
    const entry = new Entry(engine, upstream, runtime, nativeUi, bridgeGate);
    reservation.entry = entry;
    const entryRun: (rawRequest: unknown) => Promise<unknown> = entry.run;
    reservation.entryRun = entryRun; current();
    phase = "entry"; reason = "entry-boundary-refused";
    reservation.entryInvocationAttempted = true;
    const result = await entryRun.call(entry, parsed.originalRequest);
    // Preserve the exact return before fallible owner reproof or projection.
    reservation.originalReturn = result; reservation.entryReturnObserved = true;
    current();
    if (reservation.entry !== entry || reservation.runtime !== runtime || reservation.nativeUi !== nativeUi ||
      reservation.entryRun !== entryRun || reservation.originalReturn !== result) { throw new Error("Disposable index retained originals changed."); }
    phase = "projection"; reason = "result-refused";
    const diagnostic = closedSymbolEntryFailureDiagnostic(entry);
    return mode === "validation" ? formatClosedSymbolDisposableResult(result, diagnostic) : formatClosedSymbolOperationResult(result, diagnostic);
  } catch (error) {
    if (activeReservation === undefined) {
      if (!closedSymbolUnreservedFailure.observed) {
        closedSymbolUnreservedFailure.observed = true; closedSymbolUnreservedFailure.original = error;
      }
    } else if (!activeReservation.failureObserved) {
      activeReservation.failureObserved = true; activeReservation.originalFailure = error;
    }
    if (mode === "ordinary") {
      return formatClosedSymbolOperationResult(closedSymbolOperationStopped({ phase,
        attemptReserved: activeReservation !== undefined }), closedSymbolFailureDiagnostic(error, phase));
    }
    return closedSymbolDisposableIndexRefusal({
      phase, reason, attemptReserved: closedSymbolIndexReservation !== undefined,
      entryInvocationAttempted: activeReservation?.entryInvocationAttempted ?? false,
      entryReturnObserved: activeReservation?.entryReturnObserved ?? false,
      originalEntryResult: activeReservation?.originalReturn,
    }, closedSymbolFailureDiagnostic(error, phase));
  }
}

function runClosedSymbolDisposableTool(input: unknown): Promise<CallToolResult> { return runClosedSymbolTool(input, "validation"); }
function runClosedSymbolOperationTool(input: unknown): Promise<CallToolResult> { return runClosedSymbolTool(input, "ordinary"); }

const recordSchema = z.record(z.string(), z.unknown());
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
      executionClosure: z
        .object({
          root: z.string().min(1),
          directoryCount: z.number().int().positive(),
          fileCount: z.number().int().positive(),
          symlinkCount: z.number().int().nonnegative(),
          totalBytes: z.number().int().positive(),
          sha256: sha256Schema,
        })
        .strict(),
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
          easyeda_version: z.string().min(1).optional(),
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

function decodeCapturePngBase64(value: string): Buffer {
  if (
    value.length === 0 ||
    value.length > MAX_CAPTURE_BASE64_CHARACTERS ||
    value.length % 4 !== 0 ||
    /[^A-Za-z0-9+/=]/u.test(value)
  ) {
    throw new Error(
      "Canvas capture image block is empty, malformed, or exceeds the 16 MiB compressed PNG limit.",
    );
  }
  const paddingIndex = value.indexOf("=");
  if (
    paddingIndex !== -1 &&
    (paddingIndex < value.length - 2 ||
      value.length - paddingIndex > 2 ||
      !/^={1,2}$/u.test(value.slice(paddingIndex)))
  ) {
    throw new Error("Canvas capture image block contains malformed base64.");
  }
  const bytes = Buffer.from(value, "base64");
  if (
    bytes.length > MAX_CAPTURE_PNG_BYTES ||
    bytes.toString("base64") !== value
  ) {
    throw new Error(
      "Canvas capture image block is malformed or exceeds the 16 MiB compressed PNG limit.",
    );
  }
  return bytes;
}

interface EvidenceOptions {
  readonly attachments?: EvidenceAttachment[];
  readonly maxInlineBytes?: number;
  readonly reservation?: EvidenceReservation | undefined;
  readonly returnMode?: "full" | "receipt-only" | "summary";
}

interface SerializedGuardOptions {
  readonly allowDuringOrphanRisk?: boolean;
  readonly authenticatedBridgeScope?: boolean;
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

function failure(error: unknown, upstreamProcess?: ReturnType<UpstreamEasyedaClient["processDiagnostics"]>): CallToolResult {
  const errorRecord = isRecord(error) ? error : {};
  const details = {
    ok: false,
    error: {
      name: errorRecord["name"] ?? "Error",
      message: errorRecord["message"] ?? String(error),
      mismatches: errorRecord["mismatches"],
      assertionResults: errorRecord["assertionResults"],
      blockingOperations: errorRecord["blockingOperations"],
      ...(upstreamProcess === undefined ? {} : { upstreamProcess }),
      ...boundedTransactionErrorOutput(error),
      ...(typeof errorRecord["dispatched"] === "boolean" ? { dispatched: errorRecord["dispatched"] } : {}),
      ...(error instanceof UpstreamStartupError
        ? { startupDiagnostics: error.startupDiagnostics }
        : {}),
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
  failureDiagnostics?: () => ReturnType<UpstreamEasyedaClient["processDiagnostics"]>,
): (input: Input) => Promise<CallToolResult> {
  return async (input: Input): Promise<CallToolResult> => {
    try {
      return success(await handler(input));
    } catch (error) {
      let diagnostics: ReturnType<UpstreamEasyedaClient["processDiagnostics"]>;
      try { diagnostics = failureDiagnostics?.(); }
      catch {
        // A diagnostic failure must not replace the original refusal.
      }
      return failure(error, diagnostics);
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
      return options.authenticatedBridgeScope === true
        ? upstream.withAuthenticatedBridgeDispatchScope(() => handler(input))
        : handler(input);
    }),
  );
}

function serializedLiveGuarded<Input>(
  handler: FacadeHandler<Input>,
  options: Omit<SerializedGuardOptions, "authenticatedBridgeScope"> = {},
): (input: Input) => Promise<CallToolResult> {
  return serializedGuarded(handler, {
    ...options,
    authenticatedBridgeScope: true,
  });
}

function writerRuntimeGuarded<Input>(
  handler: (input: Input) => Promise<CallToolResult>,
): (input: Input) => Promise<CallToolResult> {
  return (input: Input): Promise<CallToolResult> => {
    try {
      // Run the structural build gate before bridge setup.
      // Bad upstream configuration must not mask it.
      engine.requirePrivateComponentWriterEnabled();
    } catch (error) {
      return Promise.resolve(failure(error));
    }
    return handler(input);
  };
}

function serializedLiveResult<Input>(
  handler: (input: Input) => Promise<CallToolResult>,
): (input: Input) => Promise<CallToolResult> {
  return (input: Input): Promise<CallToolResult> =>
    bridgeGate.run(async () => {
      try {
        await engine.assertBridgeDispatchAllowed();
        return await upstream.withAuthenticatedBridgeDispatchScope(() =>
          handler(input),
        );
      } catch (error) {
        return failure(error);
      }
    });
}

function serializedStatusGuarded<Input>(
  handler: (input: Input, admission: StatusAdmissionObservation) => unknown,
): (input: Input) => Promise<CallToolResult> {
  return guarded((input) =>
    bridgeGate.run(async () => {
      const admission = await engine.observeStatusAdmission();
      await upstream.listTools();
      const lifecycle = upstream.bridgeSessionLifecycle();
      if (lifecycle?.activeSession === null) {
        const disconnectedObservation = await handler(input, admission);
        if (upstream.bridgeSessionLifecycle()?.activeSession === null) { return disconnectedObservation; }
        // A renderer may authenticate while the first read-only startup probe
        // Waits. Resample under a new exact lease instead of issuing unbound calls.
        return upstream.withAuthenticatedBridgeDispatchScope(() => handler(input, admission));
      }
      return upstream.withAuthenticatedBridgeDispatchScope(() =>
        handler(input, admission),
      );
    }),
    () => upstream.processDiagnostics(),
  );
}

async function callReadOnly(
  upstreamTool: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  if (UNBOUND_DIAGNOSTIC_READ_NAMES.has(upstreamTool)) {
    throw new Error(
      `${upstreamTool} is diagnostic-only and is not a target-bound design read.`,
    );
  }
  if (!isReviewedLocalGenericRead(upstreamTool)) {
    throw new Error(
      `${upstreamTool} is not on the reviewed local-only generic-read allowlist. Supplier, quote, catalog-ingestion, simulation, and other open-world reads require a separate consent-aware facade.`,
    );
  }
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
  assertReviewedLocalGenericReadArguments(label, args);
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

async function failedExportObservation(path: string): Promise<{
  readonly attachment?: EvidenceAttachment;
  readonly metadata: Record<string, unknown>;
}> {
  try {
    const observed = await inspectManagedFile(path, "Failed export artifact");
    return {
      attachment: {
        kind: "export-artifact-after-failure",
        path: observed.absolute,
      },
      metadata: {
        exportArtifactObserved: {
          path: observed.absolute,
          bytes: observed.info.size,
          mtimeMs: observed.info.mtimeMs,
        },
      },
    };
  } catch (error) {
    const errorRecord = isRecord(error) ? error : {};
    if (errorRecord["code"] === "ENOENT") {
      return { metadata: {} };
    }
    return {
      metadata: {
        exportArtifactInspectionError: {
          name: errorRecord["name"] ?? "Error",
          message: errorRecord["message"] ?? String(error),
        },
      },
    };
  }
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

function readPngDimensions(bytes: Buffer): PngDimensions {
  if (bytes.length > MAX_CAPTURE_PNG_BYTES) {
    throw new Error(
      "Canvas capture PNG exceeds the 16 MiB compressed validation limit.",
    );
  }
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
  if (
    !Number.isSafeInteger(decodedBytes) ||
    decodedBytes > MAX_CAPTURE_DECODED_BYTES
  ) {
    throw new Error(
      "Canvas capture PNG expands beyond the 64 MiB validation limit.",
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

const errorOutputSchema = z
  .object({
    name: z.unknown().optional(),
    message: z.unknown().optional(),
    mismatches: z.unknown().optional(),
    assertionResults: z.unknown().optional(),
    blockingOperations: z.unknown().optional(),
    ...transactionErrorOutputSchema.partial().shape,
  })
  .catchall(z.unknown());
const optionalFailureOutputShape = {
  ok: z.literal(false).optional(),
  error: errorOutputSchema.optional(),
};
const failureOutputSchema = z
  .object({
    ok: z.literal(false),
    error: errorOutputSchema,
  })
  .strict();
const statusSuccessOutputSchema = z
  .object({
    facade: recordSchema.optional(),
    upstream: recordSchema.optional(),
    bridgeConnection: recordSchema.optional(),
    upstreamProcess: recordSchema.optional(),
    incompleteOperations: z.array(recordSchema).optional(),
    incompleteOperationsObservedAt: nonEmptyStringSchema.optional(),
    safetyModel: nonEmptyStringSchema.optional(),
    ...optionalFailureOutputShape,
  })
  .catchall(z.unknown());
const discoverItemOutputSchema = z
  .object({ name: nonEmptyStringSchema })
  .catchall(z.unknown());
const discoverSuccessOutputSchema = z
  .object({
    value: z.array(discoverItemOutputSchema).optional(),
    ...optionalFailureOutputShape,
  })
  .catchall(z.unknown());
const contextOutputSchema = z
  .object({
    project: projectIdentitySchema.optional(),
    document: documentIdentitySchema.optional(),
    ...optionalFailureOutputShape,
    // The context probe returns ok:true; the guarded error path returns ok:false.
    ok: z.boolean().optional(),
  })
  .catchall(z.unknown());
const evidenceSuccessOutputSchema = z
  .object({
    summary: z
      .object({
        jsonBytes: z.number().int().nonnegative(),
        kind: nonEmptyStringSchema,
        sha256: sha256Schema,
      })
      .catchall(z.unknown())
      .optional(),
    result: z.unknown().optional(),
    evidence: recordSchema.optional(),
    inlineResultOmitted: z.literal(true).optional(),
    ...optionalFailureOutputShape,
  })
  .catchall(z.unknown());
const captureSuccessOutputSchema = z
  .object({
    captured: z.literal(true).optional(),
    images: z.array(recordSchema).min(1).optional(),
    evidence: recordSchema.optional(),
    ...optionalFailureOutputShape,
  })
  .catchall(z.unknown());
const operationSuccessOutputSchema = z
  .object({
    operationId: operationIdSchema.optional(),
    state: nonEmptyStringSchema.optional(),
    ...optionalFailureOutputShape,
  })
  .catchall(z.unknown());
const recoverSuccessOutputSchema = z
  .object({
    value: z.array(operationSuccessOutputSchema).optional(),
    operationId: operationIdSchema.optional(),
    state: nonEmptyStringSchema.optional(),
    ...optionalFailureOutputShape,
  })
  .catchall(z.unknown());
const checkpointSuccessOutputSchema = z
  .object({
    checkpoint: nonEmptyStringSchema.optional(),
    receiptPath: nonEmptyStringSchema.optional(),
    schema: z
      .literal("easyeda-pro-control.checkpoint.v2")
      .optional(),
    ok: z.boolean().optional(),
    receiptSha256: sha256Schema.optional(),
    error: errorOutputSchema.optional(),
  })
  .catchall(z.unknown());
const evidenceVerificationSuccessOutputSchema = z
  .object({
    ok: z.boolean().optional(),
    receiptPath: nonEmptyStringSchema.optional(),
    resultPath: nonEmptyStringSchema.optional(),
    receiptHashOk: z.boolean().optional(),
    resultHashOk: z.boolean().optional(),
    error: errorOutputSchema.optional(),
  })
  .catchall(z.unknown());
const artifactReadSuccessOutputSchema = z
  .object({
    path: nonEmptyStringSchema.optional(),
    size: z.number().int().nonnegative().optional(),
    offset: z.number().int().nonnegative().optional(),
    bytesRead: z.number().int().nonnegative().optional(),
    eof: z.boolean().optional(),
    text: z.string().optional(),
    ...optionalFailureOutputShape,
  })
  .strict();
const currentSymbolOperationToolOutputSchema = z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).strict();
const toolOutputSchemas: Readonly<Record<string, z.ZodType>> = {
  easyeda_control_validate_closed_symbol: closedSymbolDisposableOutputSchema,
  easyeda_control_symbol_metadata: closedSymbolOperationOutputSchema,
  easyeda_control_api: z.object({ offline: z.boolean().optional(), result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_sdk_read: evidenceSuccessOutputSchema,
  easyeda_control_calculate: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_system: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_extensions: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_launch: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_editor_shell: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_editor_context: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_shortcuts: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_pcb_layers: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_project_open: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_pcb_identities: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_pcb_geometry: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_project_symbol: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_project_symbol_metadata: currentSymbolOperationToolOutputSchema,
  easyeda_control_history: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_check: z.object({ result: routeAuditResultSchema.optional(), operationId: z.string().optional(), state: z.string().optional(), report: z.unknown().optional(), proof: z.unknown().optional(), reportArtifact: z.unknown().optional(), nextSafeAction: z.string().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_native_ui: z.object({ schema: z.string().optional(), action: z.string().optional(), result: z.unknown().optional(), observations: z.array(z.unknown()).optional(), authority: z.string().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_runtime: z.object({ action: z.string().optional(), result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_design: z.object({ operationId: z.string().optional(), state: z.string().optional(), nextSafeAction: z.string().optional(), capabilities: z.record(z.string(), z.unknown()).optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_library: z.object({ operationId: z.string().optional(), state: z.string().optional(), result: z.unknown().optional(), nextSafeAction: z.string().optional(), capabilities: z.array(z.unknown()).optional() }).catchall(z.unknown()),
  easyeda_control_status: statusSuccessOutputSchema,
  easyeda_control_discover: discoverSuccessOutputSchema,
  easyeda_control_context: contextOutputSchema,
  easyeda_control_exact_read: evidenceSuccessOutputSchema,
  easyeda_control_read: evidenceSuccessOutputSchema,
  easyeda_control_read_batch: evidenceSuccessOutputSchema,
  easyeda_control_execute: failureOutputSchema,
  easyeda_control_capture: captureSuccessOutputSchema,
  easyeda_control_export: evidenceSuccessOutputSchema,
  easyeda_control_plan: operationSuccessOutputSchema,
  easyeda_control_apply: operationSuccessOutputSchema,
  easyeda_control_verify: operationSuccessOutputSchema,
  easyeda_control_rollback: operationSuccessOutputSchema,
  easyeda_control_save_reopen: operationSuccessOutputSchema,
  easyeda_control_checkpoint: checkpointSuccessOutputSchema,
  easyeda_control_recover_incomplete: recoverSuccessOutputSchema,
  easyeda_control_evidence_recover: evidenceVerificationSuccessOutputSchema,
  easyeda_control_evidence_verify: evidenceVerificationSuccessOutputSchema,
  easyeda_control_artifact_read: artifactReadSuccessOutputSchema,
};

const server = new McpServer(
  { name: "easyeda-pro-control", version: CONTROL_VERSION },
  {
    capabilities: { tools: {} },
    instructions:
      facadeMode === "calculation-only"
        ? "Restricted compatibility mode. Tools include local reference/discovery, status, separately pinned calculations and metadata observations, exact-target PCB layer and loaded-view identity/geometry reads, historical abandonment, ordinary application launch and one-shot disposable-project opening. Opening requires a retained launcher, empty editor, registered local file and checkpoint-member PCB; it permits migrations/cache replay/automatic Save effects. The project-open validation-* actions run one sealed disposable metadata forward/inverse lifecycle with exact phase acknowledgements and original owners. Its META-only lifecycle passed an installed101500 disposable round trip. The separate disposable canvas-segments profile has offline tests only. The easyeda_control_project_symbol_metadata route supports an original-owner forward-only name/description change for an unused symbol with complete META-only history, including tombstones. Installed123000 passed that ordinary entrypoint's unused META-only forward lifecycle with exact closed SQL, reopened content and final closure. Historical validation grants no current-invocation authority. Both routes require pre-dispatch proof budgets, exact runtime admission and complete SQL/reopened-content verification. Generic design writers, native controls, navigation, explicit Save and design recovery remain unavailable. Launch does not prove isolation or readiness; observations grant no later authority. Use offline schemas and exact validation first. The internal calculation-only mode name is retained; registration stays fixed until restart."
        : "Use offline easyeda_control_api for documented SDK methods, exact typed operation schemas and argument validation. Declaration presence never authorizes execution. Before live work use status and exact context. Typed transactions require native record/connectivity checks and save/reopen complete-project persistence verification. Inspect library execution capabilities. Native controls handle missing APIs and dialogs; UI acknowledgment is not persistence proof. Raw execution and the old component writer remain refused. Never retry uncertain calls or Save attempts; inspect and reconcile the retained journal.",
  },
);

function registerFacadeTool<InputArgs extends z.ZodRawShape>(
  name: string,
  config: FacadeToolConfig<InputArgs>,
  handler: ToolCallback<InputArgs>,
): void {
  if (!facadeToolRegistered(facadeMode, name)) { return; }
  const outputSchema = toolOutputSchemas[name];
  if (outputSchema === undefined) {
    throw new Error(`No reviewed output schema is registered for ${name}.`);
  }
  server.registerTool(
    name,
    { outputSchema, ...config },
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
  serializedStatusGuarded(async (_input, admission) => ({
    facade: {
      version: CONTROL_VERSION,
      mode: facadeMode,
      dataDirectory: controlDataDirectory(),
      processLease: { path: facadeLease.path, pid: facadeLease.pid },
      typedDesign: { enabled: facadeMode === "legacy-reviewed", tool: "easyeda_control_design", supervisorRequired: true, persistence: "native-source-plus-complete-project-record-delta", arbitraryCode: false },
      libraryExecution: { tool: "easyeda_control_library", capabilities: facadeMode === "legacy-reviewed" ? listLibraryExecutionCapabilities() : [] },
      ...(facadeMode === "calculation-only" ? { availableTools: CALCULATION_ONLY_TOOLS,
        capabilityScope: "Separately admitted observations, utilities, historical abandonment, ordinary existing-profile launch and checkpointed disposable opening. The shared unused META-only symbol lifecycle passed an installed101500 disposable forward/inverse round trip. Installed123000 passed the separate ordinary unused META-only forward-only route with exact closed SQL, reopened content and final closure. That historical validation grants no current-invocation authority. Ordinary metadata changes still reject all historical canvas, including tombstones. A separate disposable canvas-segments profile has offline tests only. Generic design writers remain disabled. No generic design-content access or legacy-route admission; ordinary opening may change storage and launch does not prove isolation." } : {}),
    },
    upstream: facadeMode === "legacy-reviewed" ? await engine.status() : {
      ...await engine.status(), capabilities: { sdkCalculations: { tool: "easyeda_control_calculate", runtimeAdmissionRequired: true },
        sdkSystem: { tool: "easyeda_control_system", runtimeAdmissionRequired: true },
        startupExtensions: { tool: "easyeda_control_extensions", runtimeAdmissionRequired: true, launchQualification: false },
        editorShell: { tool: "easyeda_control_editor_shell", runtimeAdmissionRequired: true, readinessProof: false },
        editorContext: { tool: "easyeda_control_editor_context", runtimeAdmissionRequired: true, identityOnly: true, cadAuthority: false },
        shortcutKeys: { tool: "easyeda_control_shortcuts", runtimeAdmissionRequired: true, keyboardExecution: false },
        pcbLayers: { tool: "easyeda_control_pcb_layers", runtimeAdmissionRequired: true, explicitTargetRequired: true, nativeEquivalent: true, designExecution: false },
        pcbIdentities: { tool: "easyeda_control_pcb_identities", runtimeAdmissionRequired: true, explicitTargetRequired: true, nativeEquivalent: true, savedMembershipVerified: false },
        pcbGeometry: { tool: "easyeda_control_pcb_geometry", runtimeAdmissionRequired: true, explicitTargetRequired: true, nativeEquivalent: true, savedMembershipVerified: false, connectivityVerified: false },
        projectSymbol: { tool: "easyeda_control_project_symbol", runtimeAdmissionRequired: true, explicitTargetRequired: true, nativeEquivalent: true, savedMembershipVerified: false, cadAuthority: false },
        projectSymbolMetadata: { tool: "easyeda_control_project_symbol_metadata", scope: "unreferenced-project-local-meta-only-history-name-description-forward-only",
          runtimeAdmissionRequired: true, designMutation: true, connectedValidation: false, originalOwnerRequired: true,
          historicalConnectedValidation: "installed123000-ordinary-unused-meta-only-forward-only",
          sharedLifecycleConnectedValidation: "installed101500-disposable-meta-only-roundtrip",
          phaseEffectAcknowledgementsRequired: true, inverseSupported: false, genericWritersEnabled: false },
        historicalAbandonment: { tool: "easyeda_control_history", localOnly: true, scope: "sixteen-event-pre-navigation-or-seven-phase-current-baseline-before-relaunch", replayAuthority: false },
        ordinaryLaunch: { tool: "easyeda_control_launch", installedIdentityAdmissionRequired: true, profileIsolation: false },
        designAccess: { enabled: false, scope: "generic-design-routes" }, navigation: { enabled: true, tool: "easyeda_control_project_open",
          scope: "registered-disposable-project-and-existing-pcb-opening-plus-owned-validation-reopening", retainedLaunchRequired: true, unchangedStorageGuaranteed: false },
        disposableValidation: { tool: "easyeda_control_project_open", actions: "validation-*",
          scope: "sealed-disposable-unused-meta-only-or-bounded-canvas-segments-symbol-name-description-forward-inverse", designMutation: true, connectedValidation: false,
          sharedLifecycleConnectedValidation: "installed101500-disposable-meta-only-roundtrip",
          canvasSegmentsValidation: "offline-regression-only",
          normalWritersEnabled: false, phaseEffectAcknowledgementsRequired: true, originalOwnerRequired: true } },
    },
    bridgeConnection: upstream.bridgeConnectionDiagnostics(),
    upstreamProcess: upstream.processDiagnostics(),
    incompleteOperations: admission.incompleteOperations,
    incompleteOperationsObservedAt: admission.observedAt,
    safetyModel: facadeMode === "legacy-reviewed" ? "plan-apply-verify-save-reopen-checkpoint" : "fixed-local-utilities-with-separate-runtime-admission",
  })),
);

registerFacadeTool(
  "easyeda_control_api",
  offlineApiToolConfiguration,
  guarded(({ request }) => runOfflineApi(request)),
);

registerFacadeTool(
  "easyeda_control_discover",
  {
    title: "Discover EasyEDA capabilities",
    description:
      "Search the reviewed upstream catalog locally by default, without starting a bridge. Each entry names its admitted facade route or marks it unavailable; upstream read-only annotations are not facade permission. Explicit source=live retrieves current schemas after startup succeeds.",
    inputSchema: {
      query: z.string().default(""),
      mode: z.enum(["all", "read", "write"]).default("read"),
      source: z.enum(["local", "live"]).default("local"),
      limit: z.number().int().min(1).max(100).default(30),
      includeSchemas: z.boolean().default(false),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  guarded(async (input) => {
    if (facadeMode === "calculation-only" && input.source === "live") {
      throw new Error("Live upstream discovery is unavailable in local-utility mode; use the offline API catalogs.");
    }
    const entries = await discoverReviewedOrLiveTools(
      () => engine.assertBridgeDispatchAllowed(),
      () =>
        bridgeGate.run(async () => {
          await engine.assertBridgeDispatchAllowed();
          return upstream.listTools();
        }),
      input,
    );
    return facadeMode === "legacy-reviewed" ? entries : entries.map((entry) => Object.assign(entry, { facadeTool: null, availability: "unavailable" }));
  }),
);

registerFacadeTool(
  "easyeda_control_context",
  {
    title: "Prove active EasyEDA context",
    description:
      "Read a compact project/document identity using the live EasyEDA runtime. Establish this before any scoped audit or operation.",
    inputSchema: { includeRuntimeIdentity: z.boolean().default(false) },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  serializedLiveGuarded(async (input) => {
    const context = await engine.context();
    if (!input.includeRuntimeIdentity) {return context;}
    const runtimeIdentity = await engine.runtimeIdentity();
    await engine.assertContext(context);
    return { ...context, runtimeIdentity };
  }),
);

const runtimeRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("status") }).strict(),
  z.object({ action: z.literal("launch-contained"), confirmLaunch: z.literal(true) }).strict(),
  z.object({ action: z.literal("normal-close"), windowHandle: z.string().regex(/^[1-9][0-9]*$/u), confirmNormalClose: z.literal(true) }).strict(),
  projectOpenTargetSchema.extend({ action: z.literal("open-existing"), expectedFingerprint: privateFingerprintSchema, confirmOpen: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect-open"), operationId: z.string().min(1) }).strict(),
  z.object({ action: z.literal("inspect-editor-tabs"), operationId: z.string().min(1) }).strict(),
  z.object({ action: z.literal("recover-open-authority"), operationId: z.string().min(1), confirmRecovery: z.literal(true) }).strict(),
  z.object({ action: z.literal("reconcile-open"), operationId: z.string().min(1) }).strict(),
  z.object({ action: z.literal("rebind-open-runtime"), operationId: z.string().min(1), expectedFingerprint: privateFingerprintSchema, confirmRuntimeUpgrade: z.literal(true) }).strict(),
]);
registerFacadeTool(
  "easyeda_control_native_ui",
  {
    title: "Control the native EasyEDA desktop and dialogs",
    description: "Discover the exact installed EasyEDA process, inspect its owned windows and controls, capture managed screenshots, and perform explicitly confirmed native UI actions. Works before bridge connection; observed-unowned UI binding is not API execution authority. Normal close never chooses Save or Discard, and UI acknowledgment is not persistence proof.",
    inputSchema: { request: z.union([nativeUiRequestSchema, nativeCloseRecoveryRequestSchema]) },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  serializedGuarded(({ request }) => {
    const assetsRoot = process.env["EASYEDA_ASSETS_ROOT"];
    if (assetsRoot === undefined) { throw new Error("Configure the machine's installed EasyEDA assets first."); }
    const controller = new WindowsNativeUiController({
      runtime: { status: (): ReturnType<WindowsControlRuntime["status"]> => windowsRuntime?.status() ?? { state: "not-launched", launch: null, executableSha256: null, reviewedExecutionScopeSha256: "" } },
      pluginRoot: resolve(import.meta.dirname, "../.."), assetsRoot,
    });
    if (request.action === "discard-close-confirmation" || request.action === "discard-save-warning") { return discardCloseConfirmation(request, controller); }
    return runNativeUiWithOperationAdmission(request, (admitted) => controller.run(admitted), () => engine.assertNativeUiEditingAllowed());
  }, { allowDuringOrphanRisk: true }),
);
const designRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("capabilities") }).strict(),
  z.object({ action: z.literal("apply"), operation: designToolOperationSchema, expectedContext: contextSchema, expectedFingerprint: privateFingerprintSchema, expectedTopology: designTopologySchema.optional(), confirmWrite: z.literal(true) }).strict(),
  z.object({ action: z.literal("execute"), operation: designToolOperationSchema, expectedContext: contextSchema, expectedFingerprint: privateFingerprintSchema, expectedTopology: designTopologySchema.optional(), confirmWrite: z.literal(true) }).strict(),
  z.object({ action: z.literal("commit"), operationId: z.string().min(1), confirmWrite: z.literal(true) }).strict(),
  z.object({ action: z.literal("rollback"), operationId: z.string().min(1), confirmWrite: z.literal(true) }).strict(),
  z.object({ action: z.literal("repair-layout-net-labels"), operationId: z.string().min(1), confirmWrite: z.literal(true) }).strict(),
  z.object({ action: z.literal("repair-layout-wire-groups"), operationId: z.string().min(1), confirmWrite: z.literal(true) }).strict(),
  z.object({ action: z.literal("repair-layout-label-visibility"), operationId: z.string().min(1), confirmWrite: z.literal(true) }).strict(),
  z.object({ action: z.literal("load-layout-pages"), operationId: z.string().min(1), confirmOpen: z.literal(true) }).strict(),
  z.object({ action: z.literal("inspect"), operationId: z.string().min(1) }).strict(),
  z.object({ action: z.literal("reconcile"), operationId: z.string().min(1) }).strict(),
  z.object({ action: z.literal("recover-authority"), operationId: z.string().min(1), confirmRecovery: z.literal(true) }).strict(),
  z.object({ action: z.literal("rebind-runtime"), operationId: z.string().min(1), expectedFingerprint: privateFingerprintSchema, confirmRuntimeUpgrade: z.literal(true) }).strict(),
  z.object({ action: z.literal("open-target"), operationId: z.string().min(1), confirmOpen: z.literal(true) }).strict(),
]);

registerFacadeTool(
  "easyeda_control_runtime",
  {
    title: "Manage the retained EasyEDA execution runtime",
    description: "Inspect or launch the retained EasyEDA runtime, request normal close, or open an exact existing project/document from Start Page with checkpoint/registry membership, exclusive-tab guards, tracked recovery and complete unchanged-database proof. Opening never replaces another project, saves or discards. Does not attach to an unowned instance or force-terminate it.",
    inputSchema: { request: runtimeRequestSchema },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  serializedGuarded(async ({ request }) => {
    if (request.action === "status") { return { action: request.action, result: windowsRuntime?.status() ?? { state: "not-launched" } }; }
    if (request.action === "launch-contained") {
      assertOrdinaryRuntimeAllocationAllowed();
      const assetsRoot = process.env["EASYEDA_ASSETS_ROOT"];
      if (assetsRoot === undefined) { throw new Error("Configure the machine's installed EasyEDA assets first."); }
      const implementation = await engine.controlFingerprintPromise;
      assertOrdinaryRuntimeAllocationAllowed();
      windowsRuntime ??= new WindowsControlRuntime({ upstream, pluginRoot: resolve(import.meta.dirname, "../.."), assetsRoot,
        reviewedExecutionScopeSha256: implementation.sha256 });
      assertOrdinaryRuntimeAllocationAllowed();
      return { action: request.action, result: await windowsRuntime.launch() };
    }
    if (request.action === "normal-close") {
      await ownedWindowsRuntime().normalClose(request.windowHandle);
      return { action: request.action, result: ownedWindowsRuntime().status() };
    }
    if (request.action === "inspect-open") { return { action: request.action, result: await projectOpenExecutor.inspect(request.operationId) }; }
    if (request.action !== "recover-open-authority") { await engine.assertBridgeDispatchAllowed(); }
    return upstream.withAuthenticatedBridgeDispatchScope(async () => {
      switch (request.action) {
        case "open-existing": { return { action: request.action, result: await projectOpenExecutor.openExisting(request) }; }
        case "recover-open-authority": { return { action: request.action, result: await projectOpenExecutor.recoverAuthority(request.operationId) }; }
        case "reconcile-open": { return { action: request.action, result: await projectOpenExecutor.reconcileNoMutation(request.operationId) }; }
        case "inspect-editor-tabs": { return { action: request.action, result: await projectOpenExecutor.inspectEditorTabs(request.operationId) }; }
        case "rebind-open-runtime": { return { action: request.action, result: await projectOpenExecutor.rebindRuntime(request.operationId, request.expectedFingerprint) }; }
        default: { throw new Error("Unknown project-open runtime request."); }
      }
    });
  }, { allowDuringOrphanRisk: true }),
);

// This route needs the SDK's full-schema overload. The ordinary raw-shape
// Helper would strip unknown outer fields before the fixed callback sees them.
if (facadeToolRegistered(facadeMode, "easyeda_control_validate_closed_symbol")) {
server.registerTool(
  "easyeda_control_validate_closed_symbol",
  {
    title: "Validate one disposable closed-symbol metadata lifecycle",
    description: "Validation only: launch owned application generations for one explicitly identified disposable project, modify one closed symbol's name/description once, and verify complete closed/reopened SQLite and saved-content evidence. Requires a fresh facade with no allocated Windows runtime or authenticated editor, exact compatibility, and all native prerequisites. Consumes a permanent target claim; a stopped result is not retry permission. This does not enable ordinary library/design writers or authorize another project. Uses a fixed hash-pinned native main-reference helper; a successful helper report alone is not lifecycle completion.",
    inputSchema: closedSymbolDisposableInputSchema,
    outputSchema: closedSymbolDisposableOutputSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  runClosedSymbolDisposableTool,
);
}

if (facadeToolRegistered(facadeMode, "easyeda_control_symbol_metadata")) {
server.registerTool(
  "easyeda_control_symbol_metadata",
  {
    title: "Closed-symbol metadata operation (validation pending)",
    description: "Currently blocked before runtime allocation pending successful disposable full-lifecycle validation. Source implements one operation-owned closed-session name/description change for an exact ordinary project symbol and clean companion PCB. Requires a fresh facade, explicit write confirmation and a unique caller operation ID. No arbitrary code, validation-claim reuse, automatic retry, Save or target-editor opening. Existing ordinary library.execute remains blocked.",
    inputSchema: closedSymbolOperationInputSchema,
    outputSchema: closedSymbolOperationOutputSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  runClosedSymbolOperationTool,
);
}

registerFacadeTool(
  "easyeda_control_design",
  {
    title: "Edit and verify a typed EasyEDA design transaction",
    description: "Discover typed design schemas and inspect retained transactions. Schematic-page, symbol and PCB execution is unavailable pending operation-owned completion and exact SQLite proof of native Save's delayed project-structure writes; sealed display/wire profiles are also blocked. Type-4 footprint operations retain their existing native-preflight, scope and save/reopen guards. Historical evidence and pure argument validation do not authorize execution. A retained contained runtime is required for enabled paths; arbitrary JavaScript is never accepted.",
    inputSchema: { request: designRequestSchema },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  serializedGuarded(async ({ request }) => {
    if (request.action === "capabilities") { return { capabilities: listDesignActionCapabilities() }; }
    if (request.action === "inspect") { return DesignExecutor.inspect(request.operationId); }
    if (request.action === "apply" || request.action === "execute") {
      const compiled = compileDesignAction(request.operation);
      if (request.expectedContext.document.documentType !== compiled.documentType) { throw new Error("Wrong editor for design action."); }
      assertDesignExecutionLifecycle(compiled.documentType);
    }
    if (request.action === "commit" || request.action === "rollback" || request.action === "reconcile" ||
        request.action === "repair-layout-net-labels" || request.action === "repair-layout-wire-groups" || request.action === "repair-layout-label-visibility") {
      const offline = await DesignExecutor.preflightRetainedLifecycle(request.operationId, request.action);
      if (offline !== undefined) { return offline; }
    }
    if (request.action !== "recover-authority") { await engine.assertBridgeDispatchAllowed(); }
    return upstream.withAuthenticatedBridgeDispatchScope(() => {
      switch (request.action) {
      case "apply": { return designExecutor.apply(request);
      }
      case "execute": { return executeAndCommitDesign(designExecutor, request);
      }
      case "commit": { return designExecutor.commit(request.operationId);
      }
      case "rollback": { return designExecutor.rollback(request.operationId);
      }
      case "repair-layout-net-labels": { return designExecutor.repairLayoutNetLabels(request.operationId, request.confirmWrite);
      }
      case "repair-layout-wire-groups": { return designExecutor.repairLayoutWireGroups(request.operationId, request.confirmWrite);
      }
      case "repair-layout-label-visibility": { return designExecutor.repairLayoutLabelVisibility(request.operationId, request.confirmWrite);
      }
      case "load-layout-pages": { return designExecutor.loadLayoutPages(request.operationId, request.confirmOpen);
      }
      case "reconcile": { return designExecutor.reconcile(request.operationId);
      }
      case "recover-authority": { return designExecutor.recoverAuthority(request.operationId);
      }
      case "rebind-runtime": { return designExecutor.rebindRuntime(request.operationId, request.expectedFingerprint);
      }
      case "open-target": { return designExecutor.openTarget(request.operationId);
      }
      default: { throw new Error("Unknown typed design phase.");
      }
      }
    });
  }, { allowDuringOrphanRisk: true }),
);

const libraryRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("capabilities") }).strict(),
  z.object({ action: z.literal("execute"), operation: libraryToolOperationSchema, expectedContext: contextSchema, expectedFingerprint: privateFingerprintSchema, confirmWrite: z.literal(true).optional() }).strict(),
  z.object({ action: z.literal("inspect"), operationId: z.string().min(1) }).strict(),
  z.object({ action: z.literal("recover-authority"), operationId: z.string().min(1), confirmRecovery: z.literal(true) }).strict(),
  z.object({ action: z.literal("reconcile-no-mutation"), operationId: z.string().min(1) }).strict(),
  z.object({ action: z.literal("reconcile"), operationId: z.string().min(1) }).strict(),
  z.object({ action: z.literal("rebind-runtime"), operationId: z.string().min(1), expectedFingerprint: privateFingerprintSchema, confirmRuntimeUpgrade: z.literal(true) }).strict(),
  z.object({ action: z.literal("open-target"), operationId: z.string().min(1), confirmOpen: z.literal(true) }).strict(),
]);

const checkRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("route-audit"), audit: pcbRouteAuditRequestSchema, expectedContext: contextSchema, expectedFingerprint: privateFingerprintSchema,
    evidence: evidenceSchema.optional(), returnMode: z.enum(["full", "summary", "receipt-only"]).default("full"),
    maxInlineBytes: z.number().int().min(1024).max(MAX_INLINE_RESULT_BYTES).default(65_536) }).strict(),
  z.object({ action: z.literal("run"), kind: z.enum(["pcb-drc", "schematic-erc"]), expectedContext: contextSchema, expectedFingerprint: privateFingerprintSchema,
    maxInlineItems: z.number().int().min(0).max(200).default(100) }).strict(),
  z.object({ action: z.literal("inspect"), operationId: z.string().min(1) }).strict(),
  z.object({ action: z.literal("recover-authority"), operationId: z.string().min(1), confirmRecovery: z.literal(true) }).strict(),
  z.object({ action: z.literal("reconcile-no-mutation"), operationId: z.string().min(1) }).strict(),
  z.object({ action: z.literal("open-target"), operationId: z.string().min(1), confirmOpen: z.literal(true) }).strict(),
  z.object({ action: z.literal("rebind-runtime"), operationId: z.string().min(1), expectedFingerprint: privateFingerprintSchema, confirmRuntimeUpgrade: z.literal(true) }).strict(),
]);
registerFacadeTool(
  "easyeda_control_check",
  {
    title: "Check native ERC/DRC or audit exact PCB routes",
    description: "Run the fixed native PCB DRC or schematic ERC with tracked calculation, complete live scope and SQLite invariance proof. Or derive route endpoint connectivity, planar lengths/skew and net/layer widths from stable exact PCB source and physical-pad inventory using action route-audit. Route audits accept typed constraints, never caller geometry; evidence paths support large reports. Native checks honor current enabled-rule policy. Neither path saves or claims fabrication approval.",
    inputSchema: { request: checkRequestSchema },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  serializedGuarded(async ({ request }) => {
    if (request.action === "inspect") { return ruleCheckExecutor.inspect(request.operationId); }
    if (request.action !== "recover-authority") { await engine.assertBridgeDispatchAllowed(); }
    return upstream.withAuthenticatedBridgeDispatchScope(() => {
      switch (request.action) {
        case "route-audit": {
          if (request.returnMode !== "full" && request.evidence === undefined) { throw new Error("Summary and receipt-only route audits require evidence paths."); }
          return runPcbRouteAudit(engine, request).then((result) => withEvidence(request, result, request.evidence,
            { facadeVersion: CONTROL_VERSION, reader: "facade-owned-route-audit" }, { returnMode: request.returnMode, maxInlineBytes: request.maxInlineBytes }));
        }
        case "run": { return ruleCheckExecutor.run(request); }
        case "recover-authority": { return ruleCheckExecutor.recoverAuthority(request.operationId); }
        case "reconcile-no-mutation": { return ruleCheckExecutor.reconcileNoMutation(request.operationId); }
        case "open-target": { return ruleCheckExecutor.openTarget(request.operationId); }
        case "rebind-runtime": { return ruleCheckExecutor.rebindRuntime(request.operationId, request.expectedFingerprint); }
        default: { throw new Error("Unknown native check request."); }
      }
    });
  }, { allowDuringOrphanRisk: true }),
);
registerFacadeTool(
  "easyeda_control_library",
  {
    title: "Execute typed EasyEDA library, lifecycle and export operations",
    description: "Inspect the exact execution capability list, read library metadata, export bounded managed files, open an existing project document, or change supported local project-library assets. Catalog entries without an execution proof are rejected before dispatch; no caller JavaScript or arbitrary output paths.",
    inputSchema: { request: libraryRequestSchema },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  serializedGuarded(async ({ request }) => {
    if (request.action === "capabilities") { return { capabilities: listLibraryExecutionCapabilities() }; }
    if (request.action === "inspect") { return LibraryExecutor.inspect(request.operationId); }
    if (request.action === "execute") { assertLibraryExecutionLifecycle(request.operation); }
    if (request.action === "reconcile" || request.action === "reconcile-no-mutation") {
      const offline = await libraryExecutor.preflightReconcile(request.operationId);
      if (offline !== undefined) { return offline; }
    }
    if (request.action !== "recover-authority") { await engine.assertBridgeDispatchAllowed(); }
    return upstream.withAuthenticatedBridgeDispatchScope(() => {
      if (request.action === "execute") { return libraryExecutor.execute({ operation: request.operation, expectedContext: request.expectedContext, expectedFingerprint: request.expectedFingerprint, ...(request.confirmWrite === undefined ? {} : { confirmWrite: request.confirmWrite }) }); }
      if (request.action === "recover-authority") { return libraryExecutor.recoverAuthority(request.operationId); }
      if (request.action === "rebind-runtime") { return libraryExecutor.rebindRuntime(request.operationId, request.expectedFingerprint); }
      if (request.action === "open-target") { return libraryExecutor.openTarget(request.operationId); }
      if (request.action === "reconcile") { return libraryExecutor.reconcile(request.operationId); }
      return libraryExecutor.reconcileNoMutation(request.operationId);
    });
  }, { allowDuringOrphanRisk: true }),
);

registerFacadeTool(
  "easyeda_control_calculate",
  {
    title: "Calculate with reviewed EasyEDA geometry methods",
    description: "Run one of sixteen fixed sys_Math calculation subsets on caller-supplied bounded geometry using separately reviewed EasyEDA 3.2.206/API 0.3.50. Requires the actual authenticated status fingerprint; it does not admit legacy design tools. No project access, context selection, navigation, files, Save, callbacks or arbitrary code. Inspect easyeda_control_api calculations and calculate-validate first. Clipping accepts only a smaller orthogonal integer-ring subset; complete output holes and disconnected regions are preserved. Results retain documented SDK limitations, including boundary behavior; no live validation is implied by registration.",
    inputSchema: { request: z.unknown().pipe(sdkMathRequestSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: await calculateSdkMath(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_system",
  {
    title: "Read local EasyEDA environment or convert units",
    description: "Run one of eighteen fixed sys_Environment/sys_Unit subsets on separately reviewed EasyEDA 3.2.206/API 0.3.50. Uses the actual authenticated status fingerprint, without active project/context, navigation, Save, network or files. Units accept bounded scalars and precision; environment values describe API initialization metadata, not live account permissions. The compiled-date getter may populate an extension-local cache. Version comparators compare the supplied version against the current version. Inspect offline API system and system-validate first. No arbitrary method, code, callback or legacy-route admission; no connected validation is implied.",
    inputSchema: { request: z.unknown().pipe(sdkSystemRequestSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: await readSdkSystem(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_launch",
  {
    title: "Launch, observe or normally close the reviewed EasyEDA application",
    description: "Launch the exact reviewed EasyEDA executable with no arguments in its existing profile. Requires explicit launch/profile-effect confirmations and a unique operation ID. Startup can load extensions/project lists, use the network and write preferences/cache; it is not isolated or project-free. Journals before dispatch and retains the original Windows root/Job. observe-window requires that current retained launch and its inspected launchedSha256; normal-close also requires its exact unique application HWND and confirmNormalClose:true. One durable close intent precedes the fixed WM_CLOSE request. Acknowledgment is not exit; observe-termination separately proves retained root/Job exit. No repeat close after uncertainty, prompt choice, force kill, design open or explicit Save. Normal closure can persist application data. inspect is local; observe-application reports same-name presence without identity or relaunch authority. After lost handles, abandon-supervision requires a successful historical launch digest, explicit acceptance and absent samples. For a reviewed intent-only launch, abandon-unknown-launch requires its inspected intentSha256, confirmAbandonUnknownLaunch:true, acceptUnobservedDescendants:true and a fresh coordinator. Its separate read-only helper excludes delayed creation by requiring no other PowerShell process before sampling EasyEDA twice. Both routes record relinquishment without proving termination. Quarantine and design gates remain unchanged. Use offline launch/launch-validate first. Successful startup is not authentication or Start Page readiness.",
    inputSchema: { request: z.unknown().pipe(ordinaryLaunchRequestSchema) },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  serializedGuarded(async ({ request }) => {
    if (ordinaryLaunchCoordinator === undefined) {
      const assetsRoot = process.env["EASYEDA_ASSETS_ROOT"];
      if (assetsRoot === undefined) { throw new Error("Configure the installed EasyEDA assets before ordinary launch."); }
      const pluginRoot = resolve(import.meta.dirname, "../..");
      const assertLocalAllowed = (): void => {
        if (closedSymbolIndexReservation !== undefined || scheduledShutdown !== undefined ||
            windowsRuntime !== ordinaryLaunchRuntime || process.env["EASYEDA_ASSETS_ROOT"] !== assetsRoot) {
          throw new Error("Ordinary launch runtime allocation is unavailable or changed.");
        }
      };
      ordinaryLaunchCoordinator = new OrdinaryLaunchCoordinator({
        assetsRoot, pluginRoot, assertLocalAllowed,
        assertAllowed: async (): Promise<void> => {
          assertLocalAllowed();
          await engine.assertBridgeDispatchAllowed();
          assertLocalAllowed();
        },
        allocateRuntime: (identity): WindowsControlRuntime => {
          assertOrdinaryRuntimeAllocationAllowed();
          if (windowsRuntime !== undefined || scheduledShutdown !== undefined) { throw new Error("A Windows runtime is already allocated."); }
          const runtime = new WindowsControlRuntime({ upstream, pluginRoot, assetsRoot, ...identity });
          ordinaryLaunchRuntime = runtime;
          windowsRuntime = runtime;
          return runtime;
        },
      });
    }
    return { result: await ordinaryLaunchCoordinator.run(request) };
  // Local inspection must remain available during quarantine. The coordinator
  // Runs assertAllowed before every other action, so no native guard is skipped.
  }, { allowDuringOrphanRisk: true }),
);

registerFacadeTool(
  "easyeda_control_project_open",
  {
    title: "Open and validate one disposable EasyEDA project",
    description: "Open one registered local disposable project and checkpoint-member PCB on the separately pinned current runtime. Requires this facade's retained launch, empty editor, exact raw path/hash and acceptance of migrations/cache replay/restored tabs/automatic Save. baseline-* prepares one closed symbol, normal closure, complete baseline, isolated scratch Date reference, replacement launch/admission, inactive-cache exclusion, project-only opening and renderer clocks. validation-begin retains that baseline for one sealed name/description forward/inverse test. Targets referenced by active sheets refuse before mutation. Complete history must be META-only or meet the separate bounded canvas-segments profile: at most 101 complete history chunks including reserved writes, stable atom types, lossless bodies, unambiguous cache actors and a unique latest/max-ticket header. Saved canvas order must be attainable by the pinned concurrent replay, with every output line byte-exact. Fresh document windows must follow every target header and reserve a later inverse window. This canvas profile has offline tests only, not connected validation. Proof budgets reserve both writes; physical allocation, heap and deadlines are not guaranteed. validation-advance requires the exact next phase and its acknowledgements; never replay writes, opening or closing. The inverse comes only from original metadata and the verified post-edit snapshot. Original writer/verifier owners retain full closed SQL and reopened-content proofs in both directions. No caller target, patch, fingerprint, code or verifier can replace the baseline. Failure permits only offered original-owner cleanup or inspection, not blind inversion. A stopped opener can request-normal-close through its original Job without a bridge call; quarantine remains until termination/session closure is proved. Close acknowledgement is not termination or saved-content proof. No explicit Save, Save/Discard choice, forced exit or restoration. Inverse restores metadata, not historical database bytes/tickets/timestamps. Lost handles cannot be reconstructed. The META-only lifecycle passed an installed101500 disposable round trip; generic writers stay blocked. Use the separate META-only project-symbol-metadata route for ordinary forward-only work and offline project-open/project-open-validate for this validation route.",
    inputSchema: { request: z.unknown().pipe(currentDisposableOpenRequestSchema), expectedFingerprint: privateFingerprintSchema.optional() },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  serializedGuarded(async ({ request, expectedFingerprint }) => {
    if (currentDisposableOpenCoordinator === undefined) {
      const assetsRoot = process.env["EASYEDA_ASSETS_ROOT"];
      const assertOwner = (): void => {
        if (closedSymbolIndexReservation !== undefined || scheduledShutdown !== undefined ||
            ordinaryLaunchRuntime === undefined || windowsRuntime !== ordinaryLaunchRuntime ||
            ordinaryLaunchRuntime.status().state !== "owned" || assetsRoot === undefined ||
            process.env["EASYEDA_ASSETS_ROOT"] !== assetsRoot) {
          throw new Error("Disposable opening requires this facade's unchanged retained ordinary launch.");
        }
      };
      currentDisposableOpenCoordinator = new CurrentDisposableOpenCoordinator({ engine, assertOwner,
        runtime: (): WindowsControlRuntime => { assertOwner(); return ownedWindowsRuntime(); } });
    }
    return { result: await currentDisposableOpenCoordinator.run(request, expectedFingerprint) };
  }, { allowDuringOrphanRisk: true }),
);

registerFacadeTool(
  "easyeda_control_editor_shell",
  {
    title: "Observe EasyEDA editor tab counts",
    description: "Observe bounded container/tab counts and registered Start Page flags on the separately pinned current UI/API. Requires authenticated bridge and two owner-stable matching samples. Returns no project names, paths, document IDs or raw tab payloads. Does not prove visible windows, completed restoration, project closure, safe startup or permission to navigate. No launch, selection, open, close, settings or Save action. Inspect offline editor-shell/editor-shell-validate first.",
    inputSchema: { request: z.unknown().pipe(editorShellRequestSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  serializedLiveGuarded(async (input) => ({ result: await readEditorShell(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_editor_context",
  {
    title: "Observe EasyEDA active identity context",
    description: "Observe the active tab/document identity subset and current project/branch identity fields on the separately pinned current UI/API. Requires an authenticated bridge and two owner-stable matching samples. No titles, paths, content, selection, project-manager RPC, navigation, settings or Save. Explicitly distinguishes no active document and unsupported tabs; absent project fields do not prove closure. This is a native identity observation, not public SDK parity, saved-state proof or authority for a later read/write. Inspect offline editor-context/editor-context-validate first.",
    inputSchema: { request: z.unknown().pipe(editorContextRequestSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  serializedLiveGuarded(async (input) => ({ result: await readEditorContext(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_extensions",
  {
    title: "Inspect EasyEDA startup extension metadata",
    description: "Observe a bounded projection of the initialized user-extension database index on separately reviewed EasyEDA 3.2.206/API 0.3.50/UI 3.2.196. Two matching observations retain frame, UI actor and RPC ownership, but do not bind the database to the current account. Requires the authenticated bridge in the index; excludes builtin extensions, loaded or queued activation state, file contents, config values and account identifiers. No enable, update, import, launch, project, navigation or Save action. This is not a complete startup baseline or launch authorization. Inspect offline API extensions and extensions-validate first. No caller-selected RPC or code; connected validation is not implied.",
    inputSchema: { request: z.unknown().pipe(startupExtensionsRequestSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: await readStartupExtensions(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_shortcuts",
  {
    title: "Read EasyEDA shortcut-key metadata",
    description: "Read the fixed public getShortcutKeys method on separately reviewed EasyEDA 3.2.206/API 0.3.50/UI 3.2.196. Requires an authenticated fingerprint and two owner-stable matching bounded observations. includeSystem defaults false; true includes the vendor hotkey registry, not its separate menu registry or every executable shortcut. Preserves raw key strings, order, duplicates and empty tokens; scope enums differ from document types. No key press, callback registration, focus, settings, design, navigation or Save. Inspect offline shortcuts/shortcuts-validate first. Vendor enumeration precedes output bounds and is not cancelled by timeout; no automatic retry or connected validation is implied.",
    inputSchema: { request: z.unknown().pipe(shortcutKeysRequestSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: await readShortcutKeys(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_pcb_layers",
  {
    title: "Read layers on an explicitly identified PCB",
    description: "Read a bounded layer list or copper-layer count on the separately reviewed current EasyEDA API/UI/PCB tuple. Requires the actual authenticated fingerprint and exact project/branch/document/tab target. Captures one ordinary active PCB frame and its native receiver, with two complete matching layer observations and target checks around awaits. These are native equivalents of getAllLayers/getTheNumberOfCopperLayers, not public-wrapper dispatch. Preserve raw color strings; copper count follows the vendor layer convention, not verified physical stackup. No footprint/panel/3D, generic project content, current-layer selection, navigation, settings, writes or Save. Query offline pcb-layers/pcb-layers-validate first. No connected validation, persistence or later editing authority is implied.",
    inputSchema: { request: z.unknown().pipe(currentPcbLayersRequestSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: await readCurrentPcbLayers(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_history",
  {
    title: "Qualify stopped validation history without replay",
    description: "Publish local historical abandonment for either the maintained sixteen-event closed-symbol marker-read boundary or the exact seven-phase current closed-baseline prefix stopped before durable relaunch-intent. Both require exact operation-bound confirmation; the latter also requires confirmDisposableProject:true and verifies retained journal, phases, raw copy and checkpoint without reading the original project. Writes only an exclusive sidecar, preserving original history and any permanent claim. No bridge, process, navigation, Save, discard, restart, completion, source-invariance or replay authority is granted. Six-event legacy baseline and later-phase/generic recovery are not exposed here. Existing valid sidecars are requalified, not republished. Query offline history/history-validate first.",
    inputSchema: { request: z.unknown().pipe(historicalAbandonmentRequestSchema) },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedGuarded(async ({ request }) => ({ result: await runHistoricalAbandonment(request) }), { allowDuringOrphanRisk: true }),
);

registerFacadeTool(
  "easyeda_control_pcb_identities",
  {
    title: "Read selected and loaded PCB primitive identities",
    description: "Observe selected IDs, unfiltered Line/Arc/Via/Component/Pad IDs, or positively classify one ID within Line/Arc/Via only on the separately pinned current API/UI/PCB runtime. Requires exact project/branch/document/tab target and authenticated fingerprint. Retains the native frame/receiver and takes two matching ordered samples; missing, duplicate, ambiguous, malformed or oversized results refuse. Native equivalents, not public-wrapper dispatch. IDs describe loaded views or selection, not complete saved membership, ownership, geometry, connectivity or persistence. No filters, selection change, navigation, write or Save. Query offline pcb-identities/pcb-identities-validate first; no connected validation is implied.",
    inputSchema: { request: z.unknown().pipe(currentPcbIdentitiesRequestSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: await readCurrentPcbIdentities(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_project_symbol",
  {
    title: "Read project-local symbol metadata",
    description: "Read one exact project-local symbol on the separately pinned current runtime. lib_Symbol.get requires an active PCB context and observes bounded metadata twice. Project-only preflight instead requires no editor tabs or hidden editors and compares exact caller-supplied expectedBefore metadata twice, with bounded UI actor/client/ticket/clock observations. Query offline project-symbol/project-symbol-validate or project-symbol-preflight/project-symbol-preflight-validate. Both require the authenticated fingerprint. Supplied expectations are not source provenance; the private worker is not independently leased. No backend actor/clock qualification, startup completion, permission, saved membership, connectivity or writer authority. No cloud lookup, geometry load, navigation, mutation or explicit Save. The separate easyeda_control_project_symbol_metadata route provides original-owner forward-only changes for unused symbols with complete META-only history; project-open validation-* provides disposable forward/inverse validation. This read grants neither authority; generic writers remain blocked.",
    inputSchema: { request: z.unknown().pipe(z.union([currentSymbolMetadataRequestSchema, currentProjectOnlySymbolPreflightRequestSchema])), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: "method" in input.request
    ? await readCurrentSymbolMetadata(engine, input.request, input.expectedFingerprint)
    : await readCurrentProjectOnlySymbolPreflight(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_pcb_geometry",
  {
    title: "Read loaded PCB geometry and placement",
    description: "Observe Line/Arc/Via geometry, Component metadata and Pad parameters on the separately pinned current API/UI/PCB runtime. Requires exact project/branch/document/tab target and authenticated fingerprint, a retained native receiver and two matching bounded samples. getAll accepts empty arguments; get accepts 1..256 distinct primitiveIds and returns caller order after complete-family validation. getAllPinsByPrimitiveId correlates one component's complete child list with global Pad DTOs in child order; reverse parent and symbol-pin mapping remain unverified. Pad includes null/ROUND/SLOT holes, default ELLIPSE/OVAL/RECT parameters, a POLYGON not-projected marker, mask mode/values and nullable thermal configuration. Lengths use mil, rotations/thermal angle degrees and rectangle corner ratio percent; default shape dimensions already have native 0.1mil rounding. Omitted polygon paths and physical stacks are not compared. Masks and thermal values are loaded observations, not fresh rule resolution, actual poured geometry or fabrication approval. No SDK instances, public-wrapper dispatch, optional filters, selection change, navigation, write or Save. Loaded-view data does not prove saved membership, connectivity or persistence. Query offline pcb-geometry/pcb-geometry-validate first; connected validation is generation-specific.",
    inputSchema: { request: z.unknown().pipe(currentPcbGeometryRequestSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: await readCurrentPcbGeometry(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_sdk_read",
  {
    title: "Read reviewed EasyEDA SDK methods",
    description: "Run a fixed typed local SDK getter, pure calculation or explicitly classified native task equivalent with exact runtime/context and authenticated-session guards. Two matching observations are required. Results distinguish public SDK data from native identity, property-name, Pin-getter, Text, Wire/Bus, configured font titles, filtered PCB net-membership and PCB identity-type observations, plus native active-layer identity with public layer fields; none is complete native-source, connectivity or persistence proof. No arbitrary method paths, caller code, callbacks, files, navigation or writes. Inspect offline API coverage and SDK-read schemas before calling.",
    inputSchema: {
      request: z.unknown().pipe(publicSdkReadRequestSchema),
      expectedContext: contextSchema,
      expectedFingerprint: privateFingerprintSchema,
      evidence: evidenceSchema.optional(),
      returnMode: z.enum(["full", "summary", "receipt-only"]).default("full"),
      maxInlineBytes: z.number().int().min(1024).max(MAX_INLINE_RESULT_BYTES).default(65_536),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  },
  serializedLiveGuarded(async (input) => {
    if (input.returnMode !== "full" && input.evidence === undefined) {
      throw new Error("summary and receipt-only SDK reads require evidence paths.");
    }
    const reservation = input.evidence === undefined ? undefined : await reserveEvidencePaths(input.evidence);
    let dispatched = false;
    const request = { reader: input.request, expectedContext: input.expectedContext, expectedFingerprint: input.expectedFingerprint };
    const native = publicSdkReadImplementationKind(input.request.method) === "native-task-equivalent";
    let reader = native ? "fixed-native-task-observation" : "fixed-public-sdk-observation";
    let effect = native ? "fixed-native-task-read" : "fixed-public-sdk-read";
    if (isSchematicNativeIdMethod(input.request.method)) { reader = "fixed-native-id-observation"; effect = "fixed-native-id-read"; }
    if (input.request.method === SCHEMATIC_COMPONENT_PROPERTY_METHOD) { reader = "fixed-native-property-name-observation"; effect = "fixed-native-property-name-read"; }
    if (input.request.method === SYMBOL_PIN_ENUMERATION_METHOD) { reader = "fixed-native-pin-getter-observation"; effect = "fixed-native-pin-getter-read"; }
    if (isSchematicTextReadMethod(input.request.method)) { reader = "fixed-native-text-state-observation"; effect = "fixed-native-text-state-read"; }
    if (isSchematicNetGroupReadMethod(input.request.method)) { reader = "fixed-native-netgroup-state-observation"; effect = "fixed-native-netgroup-state-read"; }
    if (input.request.method === PCB_NET_MEMBERSHIP_METHOD) { reader = "fixed-native-net-membership-observation"; effect = "fixed-native-net-membership-read"; }
    if (input.request.method === PCB_PRIMITIVE_TYPE_METHOD) { reader = "fixed-native-pcb-type-observation"; effect = "fixed-native-pcb-type-read"; }
    if (input.request.method === PCB_SELECTED_OBJECTS_METHOD) { reader = "fixed-native-selected-source-observation"; effect = "fixed-native-selected-source-read"; }
    if (isPcbSourceObjectsMethod(input.request.method)) { reader = "fixed-native-explicit-source-observation"; effect = "fixed-native-explicit-source-read"; }
    if (input.request.method === PCB_ACTIVE_LAYER_METHOD) { reader = "fixed-native-active-layer-observation"; effect = "fixed-native-active-layer-read"; }
    const selectedTimings = input.request.method === PCB_SELECTED_OBJECTS_METHOD ? new PcbSelectedReadTimings() : undefined;
    try {
      validatePrivateFingerprint(input.expectedFingerprint);
      // These coordinators own fresh initial and final runtime admission. Do
      // Not repeat their initial full launcher scan at this same entry boundary.
      // Ordinary SDK readers still need the registration-owned admission.
      const coordinated = input.request.method === PCB_NET_MEMBERSHIP_METHOD ||
        input.request.method === PCB_PRIMITIVE_TYPE_METHOD || input.request.method === PCB_ACTIVE_LAYER_METHOD || input.request.method === PCB_SELECTED_OBJECTS_METHOD || isPcbSourceObjectsMethod(input.request.method);
      if (!coordinated) {
        const status = await engine.status();
        assertSubset(status.stableFingerprint, input.expectedFingerprint, "EasyEDA SDK read runtime fingerprint");
      }
      // A coordinator can dispatch its own status probe before refusing. Retain
      // Conservative failure evidence from its entry, including local refusals.
      dispatched = true;
      let result: Record<string, unknown>;
      if (input.request.method === PCB_NET_MEMBERSHIP_METHOD) {
        result = await readPcbNetMembership(engine, input.request, input.expectedContext, input.expectedFingerprint);
      } else if (input.request.method === PCB_PRIMITIVE_TYPE_METHOD) {
        result = await readPcbPrimitiveType(engine, input.request, input.expectedContext, input.expectedFingerprint);
      } else if (input.request.method === PCB_SELECTED_OBJECTS_METHOD) {
        result = await readPcbSelectedObjects(engine, input.request, input.expectedContext, input.expectedFingerprint, selectedTimings);
      } else if (isPcbSourceObjectsMethod(input.request.method)) {
        result = await readPcbSourceObjects(engine, input.request, input.expectedContext, input.expectedFingerprint);
      } else if (input.request.method === PCB_ACTIVE_LAYER_METHOD) {
        result = await readPcbActiveLayer(engine, input.request, input.expectedContext, input.expectedFingerprint);
      } else { result = await engine.publicSdkRead(input.request, input.expectedContext); }
      const diagnostics = selectedTimings === undefined ? undefined : { selectedReaderTimings: selectedTimings.snapshot() };
      const response = await withEvidence(request, result, input.evidence,
        { facadeVersion: CONTROL_VERSION, reader, ...diagnostics },
        { reservation, returnMode: input.returnMode, maxInlineBytes: input.maxInlineBytes });
      if (diagnostics === undefined) { return response; }
      if (!isRecord(response)) { throw new Error("Selected PCB read evidence response is not an object."); }
      return { ...response, diagnostics };
    } catch (error) {
      if (reservation && !dispatched) { await releaseEvidenceReservation(reservation); }
      else if (reservation) { await finalizeDispatchedFailure(reservation, request, error, { effect,
        ...(selectedTimings === undefined ? {} : { selectedReaderTimings: selectedTimings.snapshot() }) }); }
      throw error;
    }
  }),
);

registerFacadeTool(
  "easyeda_control_exact_read",
  {
    title: "Read exact EasyEDA design state",
    description:
      "Run a facade-owned field reader twice and return data only when both observations are stable. The schematic-topology kind is disabled because its installed netlist path can annotate and Save All. Separate schematic-flat-topology diagnostics require checkpoint-bound fully loaded pages, ordinary single-part symbols and literal named orthogonal wires; they do not authorize schematic transactions or claim live validation. Exact context is checked at entry and after each run, but the active tab must remain unchanged during awaited calls. Nested component-pad drill geometry is excluded because the pinned wrapper has a scale defect.",
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
  serializedLiveGuarded(async (input) => {
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
      "Invoke one explicitly reviewed local-only upstream read after conservative metadata, target, context, and runtime checks. Supplier, quote, catalog-ingestion, simulation, and open-world tools are excluded. PCB constraint readers must derive board data from the proven live board; caller-supplied boardData is rejected. Optionally write an append-only result and receipt pair.",
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
  serializedLiveGuarded(async (input) => {
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
      "Invoke a bounded sequence of explicitly reviewed local-only reads and optionally archive the complete batch with a receipt. Open-world and supplier tools are excluded, and PCB constraint readers cannot accept caller-supplied boardData.",
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
  serializedLiveGuarded(async (input) => {
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
      "Request a PNG of the visible canvas, a canvas region or schematic sheet bounds. Region and full-page modes change the visible viewport but not design data. Valid image bytes and requested geometry do not prove target paint completion or page completeness; inspect the actual image before visual review.",
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
  serializedLiveResult(async (input) => {
      const captureRequest = input.request;
      let reservation;
      let dispatched = false;
      try {
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
          typeof payload.byte_length !== "number" ||
          !Number.isSafeInteger(payload.byte_length) ||
          payload.byte_length <= 8 ||
          payload.byte_length > MAX_CAPTURE_PNG_BYTES
        ) {
          throw new Error(
            "Canvas capture payload byte length is invalid or exceeds the 16 MiB compressed PNG limit.",
          );
        }
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
          const bytes = decodeCapturePngBase64(item.data);
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
            if (payload.image_base64 !== item.data) {
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
        const finalStatus = await engine.status();
        if (canonicalJson(finalStatus.stableFingerprint) !== canonicalJson(status.stableFingerprint)) {
          throw new Error("EasyEDA runtime fingerprint changed during canvas capture; image evidence was not accepted.");
        }
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
          try {
            await releaseEvidenceReservation(reservation);
          } catch (cleanupError) {
            throw new AggregateError(
              [error, cleanupError],
              "Canvas capture failed and its evidence reservation could not be released.",
              { cause: cleanupError },
            );
          }
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
        throw error;
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
  serializedLiveGuarded(async (input) => {
    const exportRequest = input.request;
    if (!EXPORT_TOOLS.has(exportRequest.upstreamTool)) {
      throw new Error("Export tool is not allowlisted.");
    }
    const reservation = await reserveEvidencePaths(input.evidence);
    let dispatched = false;
    let publishedExport: PublishedManagedAttachment | undefined;
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
      const exportRelation = relative(exportRoot, requestedPath);
      if (
        dirname(exportDirectory) !== exportRoot ||
        !/^export-[a-z0-9-]{8,80}$/iu.test(basename(exportDirectory)) ||
        exportRelation === ".." ||
        exportRelation.startsWith(`..${sep}`) ||
        isAbsolute(exportRelation)
      ) {
        throw new Error(
          `Export filePath must use a dedicated ${exportRoot}/export-<unique>/ directory.`,
        );
      }
      await ensureManagedDirectory(exportDirectory);
      if (
        [reservation.resultPath, reservation.receiptPath].includes(
          requestedPath,
        )
      ) {
        throw new Error(
          "Export artifact path must differ from its evidence and receipt paths.",
        );
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
      publishedExport = await publishManagedAttachmentExclusive(
        requestedPath,
        "Export artifact",
        exportBytes,
        "export-artifact",
      );
      if (publishedExport.mtimeMs + 2000 < startedAtMs) {
        throw new Error(
          "Export artifact timestamp predates this export dispatch.",
        );
      }
      if (generated.byteLength !== publishedExport.bytes) {
        throw new Error("Export byte length changed after write.");
      }
      if (
        publishedExport.sha256 !==
        createHash("sha256").update(exportBytes).digest("hex")
      ) {
        throw new Error("Export hash changed during managed publication.");
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
          path: publishedExport.path,
          bytes: publishedExport.bytes,
          mtimeMs: publishedExport.mtimeMs,
          sha256: publishedExport.sha256,
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
          attachments: [publishedExport],
        },
      );
    } catch (error) {
      if (dispatched) {
        const failureMetadata: Record<string, unknown> = {
          effect: "artifact-write",
          exportDirectory: dirname(requestedPath),
        };
        const failureAttachments: EvidenceAttachment[] = [];
        if (publishedExport === undefined) {
          const observed = await failedExportObservation(requestedPath);
          Object.assign(failureMetadata, observed.metadata);
          if (observed.attachment !== undefined) {
            failureAttachments.push(observed.attachment);
          }
        } else {
          failureAttachments.push(publishedExport);
        }
        await finalizeDispatchedFailure(
          reservation,
          request,
          error,
          failureMetadata,
          failureAttachments,
        );
      } else {
        try {
          await releaseEvidenceReservation(reservation);
        } catch (cleanupError) {
          throw new AggregateError(
            [error, cleanupError],
            "Export failed before dispatch and its evidence reservation could not be released.",
            { cause: cleanupError },
          );
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
      "Legacy endpoint, runtime-disabled. Use easyeda_control_design for supported typed operations and its operation-specific proof checks. Caller JavaScript remains refused.",
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
  writerRuntimeGuarded(
    serializedLiveGuarded(({ plan, confirmDiscardAnyUnsavedState }) =>
      engine.plan(plan, { confirmDiscardAnyUnsavedState }),
    ),
  ),
);

registerFacadeTool(
  "easyeda_control_apply",
  {
    title: "Experimental PCB mutation apply (disabled)",
    description:
      "Legacy endpoint, runtime-disabled. Use easyeda_control_design with action apply or execute for supported typed edits. Never retry an uncertain call.",
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
  writerRuntimeGuarded(
    serializedLiveGuarded((input) =>
      engine.apply(input.operationId, input.planHash),
    ),
  ),
);

registerFacadeTool(
  "easyeda_control_verify",
  {
    title: "Experimental PCB mutation verification (disabled)",
    description:
      "Legacy endpoint, runtime-disabled. Use easyeda_control_design for typed transaction inspection and reconciliation. Its effect and persistence checks remain mandatory.",
    inputSchema: { operationId: operationIdSchema },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
  },
  writerRuntimeGuarded(
    serializedLiveGuarded((input) => engine.verify(input.operationId)),
  ),
);

registerFacadeTool(
  "easyeda_control_rollback",
  {
    title: "Experimental PCB mutation rollback (disabled)",
    description:
      "Legacy endpoint, runtime-disabled. Use easyeda_control_design with action rollback when that typed operation has an exact supported inverse. Rollback does not imply a save.",
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
  writerRuntimeGuarded(
    serializedLiveGuarded((input) =>
      engine.rollback(input.operationId, input.planHash),
    ),
  ),
);

registerFacadeTool(
  "easyeda_control_save_reopen",
  {
    title: "Experimental PCB mutation persistence (disabled)",
    description:
      "Legacy endpoint, runtime-disabled. Use easyeda_control_design with action commit or execute for supported typed edits with save/reopen and complete durable-delta proof.",
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
  writerRuntimeGuarded(
    serializedLiveGuarded((input) =>
      engine.saveReopen(input.operationId, input.planHash, {
        confirmDiscardAnyUnsavedState: input.confirmDiscardAnyUnsavedState,
      }),
    ),
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
  serializedLiveGuarded((input) => {
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
    title: "Inspect incomplete journals or resolve a supported retained refusal",
    description:
      "Without an operation ID, list unresolved managed journals. Resolution abandoned-before-navigation accepts only the exact closed-symbol validation sixteen-event marker-read transport refusal or successful fixed marker-read boundary, or successful six-event baseline startup stopped before navigation; it preserves the original journal, marker and permanent claim, performs no application call, and never authorizes replay. Baseline abandonment proves neither process closure nor source invariance. Other ID-based resolutions are the retained legacy component workflow, not typed design, library, check or runtime-open recovery; use the originating tool for those journals. Legacy orphan resolution requires a fresh human-supplied operation-bound runtimeRestartConfirmation after an authorized restart and reconnect. Never synthesize that attestation, choose Save after an unknown write, or discard or force-quit without applicable authority.",
    inputSchema: {
      operationId: operationIdSchema.optional(),
      resolution: z
        .enum([
          "abandoned-before-navigation",
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
    async (input) => {
      if (input.operationId === undefined || input.operationId.length === 0) {
        return engine.recover();
      }
      const operationId = input.operationId;
      const resolution = input.resolution;
      if (resolution === undefined) {
        throw new Error(
          "resolution is required when operationId is provided.",
        );
      }
      if (input.confirmation !== `${operationId}:${resolution}`) {
        throw new Error(
          "confirmation must exactly equal operationId:resolution.",
        );
      }
      if (resolution === "abandoned-before-navigation") {
        if (input.runtimeRestartConfirmation !== undefined || input.confirmDiscardAnyUnsavedState || input.confirmRepeatAfterUnknownRecovery) {
          throw new Error("Pre-navigation abandonment accepts no restart, discard or repeat authority.");
        }
        // Historical evidence publication only: never enter an authenticated scope or allocate a runtime.
        const retained = await loadOperation(operationId);
        if (retained["sequence"] === 6) {
          // This callback owns the same gate as the entire coordinator. If this
          // Facade retained an attempt, also require its actual stopped return.
          const reservation = closedSymbolIndexReservation, returned = reservation?.originalReturn;
          if (reservation !== undefined && (!reservation.entryReturnObserved || !isRecord(returned) ||
            returned["outcome"] !== "stopped" || returned["operationId"] !== operationId || returned["completionProved"] !== false)) {
            throw new Error("Baseline abandonment requires the original stopped entry return or a fresh facade.");
          }
          const { abandonClosedSymbolBaselineBeforeNavigation } = await import("./closed-symbol-baseline-abandonment.ts");
          return abandonClosedSymbolBaselineBeforeNavigation(operationId);
        }
        const { abandonClosedSymbolBeforeNavigation } = await import("./closed-symbol-abandonment.ts");
        return abandonClosedSymbolBeforeNavigation(operationId);
      }
      assertLegacyRecoveryJournalFamily(await loadOperation(operationId));
      return upstream.withAuthenticatedBridgeDispatchScope(() =>
        engine.recover(operationId, resolution, {
          confirmDiscardAnyUnsavedState: input.confirmDiscardAnyUnsavedState,
          confirmRepeatAfterUnknownRecovery:
            input.confirmRepeatAfterUnknownRecovery,
          ...(input.runtimeRestartConfirmation === undefined
            ? {}
            : {
                runtimeRestartConfirmation:
                  input.runtimeRestartConfirmation,
              }),
        }),
      );
    },
    { allowDuringOrphanRisk: true },
  ),
);

registerFacadeTool(
  "easyeda_control_evidence_recover",
  {
    title: "Recover a published EasyEDA evidence result",
    description:
      "Commit the receipt for a managed result that was durably published before a facade process exit. Reconstructs the reservation from its marker, rehashes attachments, and never repeats the EasyEDA dispatch.",
    inputSchema: { evidence: evidenceSchema },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
    },
  },
  serializedGuarded(
    (input) => recoverPublishedEvidence(input.evidence),
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

// Use the full-schema overload so the SDK rejects unknown outer keys before
// The callback can retain a coordinator or consume an original operation.
if (facadeToolRegistered(facadeMode, "easyeda_control_project_symbol_metadata")) {
  const inputSchema = z.object({ request: z.unknown().pipe(currentSymbolOperationRequestSchema),
    expectedFingerprint: privateFingerprintSchema.optional() }).strict();
  server.registerTool(
    "easyeda_control_project_symbol_metadata",
    {
      title: "Change one unused META-only project symbol's metadata",
      description: "Change only name and/or non-null description of one unreferenced project-local symbol through an original-owner forward-only lifecycle. Query offline project-symbol-operation/project-symbol-operation-validate first. The complete target raw history must be META-only: historical drawing records, even tombstones, refuse before mutation. Initial opening requires this facade's retained ordinary launch, empty editor, exact registered local path/hash and checkpoint-member default-branch PCB. Supported schematic startup is sealed before navigation and rechecked before writing; linked-sheet propagation is unsupported. Use the returned preparationCheckpoint for baseline-begin. Ordinary opening may migrate storage, replay caches, restore tabs or automatically Save; scratch processes, opening, normal closure and the write require their exact acknowledgements. Retain the original owners through clocks, one metadata write, full closed SQL comparison, cache-excluded project reopening, saved-content verification and final closed SQL equality. Pre-dispatch budgets bound supported proof sizes, not physical allocation, heap or deadlines. metadata-advance accepts only the exact next phase, never replacement target, patch, clock, runtime, code or verifier. Completion requires requestedMetadataVerified and nextPhase completed, leaving requested metadata with no inverse. Inspect a lost response; never replay writes or navigation. Failed operations allow only offered original-owner cleanup. Saved JSON cannot restore continuation. No explicit Save, Save/Discard choice, forced exit, restoration or generic writer enablement. The shared META-only lifecycle passed an installed101500 disposable round trip. Installed123000 passed this ordinary unused META-only forward-only entrypoint with exact closed SQL, reopened saved content, final SQL equality and retained process closure. Historical evidence grants no current-invocation authority or canvas support.",
      inputSchema, outputSchema: currentSymbolOperationToolOutputSchema,
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
    },
    serializedGuarded(async ({ request, expectedFingerprint }: z.output<typeof inputSchema>) => {
      // Both routes share one coordinator and retained runtime; only the
      // Distinct ordinary parser/entry selects ordinary purpose.
      if (currentDisposableOpenCoordinator === undefined) {
        const assetsRoot = process.env["EASYEDA_ASSETS_ROOT"];
        const assertOwner = (): void => {
          if (closedSymbolIndexReservation !== undefined || scheduledShutdown !== undefined ||
              ordinaryLaunchRuntime === undefined || windowsRuntime !== ordinaryLaunchRuntime ||
              ordinaryLaunchRuntime.status().state !== "owned" || assetsRoot === undefined ||
              process.env["EASYEDA_ASSETS_ROOT"] !== assetsRoot) {
            throw new Error("Symbol metadata requires this facade's unchanged retained ordinary launch.");
          }
        };
        currentDisposableOpenCoordinator = new CurrentDisposableOpenCoordinator({ engine, assertOwner,
          runtime: (): WindowsControlRuntime => { assertOwner(); return ownedWindowsRuntime(); } });
      }
      return { result: await currentDisposableOpenCoordinator.runOrdinary(request, expectedFingerprint) };
    }, { allowDuringOrphanRisk: true }),
  );
}

const transport = new StdioServerTransport();
const shutdown = createSerializedShutdown(
  server,
  [upstream, { close: async (): Promise<void> => { await windowsRuntime?.release(); } }],
  facadeLease,
  bridgeGate,
);
const shutdownAndExit = async (): Promise<void> => {
  try {
    await shutdown();
    process.exit(0);
  } catch {
    process.stderr.write("EasyEDA control shutdown was incomplete.\n");
    process.exit(1);
  }
};
const scheduleShutdown = (): void => {
  scheduledShutdown ??= shutdownAndExit();
  void scheduledShutdown;
};
process.once("SIGINT", scheduleShutdown);
process.once("SIGTERM", scheduleShutdown);
process.stdin.once("end", scheduleShutdown);
await server.connect(transport);
