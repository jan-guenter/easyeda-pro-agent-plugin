#!/usr/bin/env node
import { currentPcb209VisualRequestSchema } from "./current-pcb-209-visual-validation.ts";
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
import { projectPublicEngineStatus } from "./public-status-projection.ts";
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
import { acquireFacadeLeaseOrDiagnose } from "./ownership-conflict-startup.ts";
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
import { CALCULATION_ONLY_TOOLS, PUBLIC_UTILITIES_ONLY_INSTRUCTIONS, PUBLIC_UTILITIES_ONLY_SCOPE, PUBLIC_UTILITIES_ONLY_TOOLS, configuredFacadeMode, facadeToolRegistered, publicUtilitiesOnlyCapabilities } from "./facade-mode.ts";
import { sdkMathRequestSchema } from "./sdk-math.ts";
import { calculateSdkMath } from "./sdk-math-runtime.ts";
import { sdkSystemRequestSchema } from "./sdk-system.ts";
import { readSdkSystem } from "./sdk-system-runtime.ts";
import { sdkPublicReadersOperationSchema } from "./sdk-public-readers.ts";
import { readSdkPublicReaders } from "./sdk-public-readers-runtime.ts";
import { netlistFilesRequestSchema } from "./netlist-files.ts";
import { managedLibraryFilesRequestSchema } from "./managed-library-files.ts";
import { executeManagedLibraryFiles } from "./managed-library-files-runtime.ts";
import { compareNetlistFiles, prepareNetlistFile } from "./netlist-files-runtime.ts";
import { publicSystemCatalogRequestSchema } from "./public-system-catalog.ts";
import { readPublicSystemCatalog } from "./public-system-catalog-runtime.ts";
import { publicSystemFootprintRequestSchema } from "./public-system-footprint.ts";
import { readPublicSystemFootprint } from "./public-system-footprint-runtime.ts";
import { startupExtensionsRequestSchema } from "./startup-extensions.ts";
import { readStartupExtensions } from "./startup-extensions-runtime.ts";
import { editorShellRequestSchema } from "./editor-shell.ts";
import { editorContextRequestSchema } from "./editor-context.ts";
import { readEditorContext, readEditorShell } from "./editor-shell-runtime.ts";
import { OrdinaryLaunchCoordinator, ordinaryLaunchRequestSchema } from "./ordinary-launch.ts";
import type { OrdinaryLaunchRuntime } from "./ordinary-launch.ts";
import { CurrentFootprintCombinedLifecycle, CurrentFootprintCopyPreparationLifecycle, CurrentFootprintCopyRoutePreparationLifecycle, CurrentFootprintMainLifecycle, CurrentPcb209DiagnosticLifecycle, CurrentPcb209EmptyStartupLifecycle, CurrentPcb209RatlineContinuationLifecycle, CurrentPcb209RatlineStartupLifecycle, CurrentPcb209VisualLifecycle, CurrentPcb209WorkerStartupLifecycle, CurrentPcbDiagnosticLifecycle, CurrentPcbStringPrecreateLifecycle, CurrentPcbWorkerStartupLifecycle } from "./current-pcb-diagnostic-lifecycle.ts";
import { currentPcbDiagnosticToolRequestSchema } from "./current-pcb-diagnostic-validation.ts";
import { currentPcb209OpeningRequestSchema } from "./current-pcb-209-opening-validation.ts";
import type { CurrentPcbWorkerStartupValidationRequest } from "./current-pcb-worker-startup-validation.ts";
import type { CurrentFootprintCopyPreparationValidationRequest } from "./current-footprint-copy-preparation-validation.ts";
import type { CurrentFootprintCopyRoutePreparationValidationRequest } from "./current-footprint-copy-route-preparation-validation.ts";
import type { CurrentFootprintMainValidationRequest } from "./current-footprint-main-validation.ts";
import type { CurrentFootprintCombinedValidationRequest } from "./current-footprint-combined-validation.ts";
import { CurrentFootprintCombinedUnknownAbandonment } from "./current-footprint-combined-unknown-abandonment.ts";
import { currentPcb209WorkerStartupToolRequestSchema } from "./current-pcb-209-empty-startup-validation.ts";
import type { CurrentPcb209RatlineContinuationValidationRequest } from "./current-pcb-209-ratline-continuation-validation.ts";
import type { CurrentPcb209RatlineStartupValidationRequest } from "./current-pcb-209-ratline-startup-validation.ts";
import type { CurrentPcb209EmptyStartupValidationRequest } from "./current-pcb-209-empty-startup-validation.ts";
import type { CurrentPcb209WorkerStartupValidationRequest } from "./current-pcb-209-worker-startup-validation.ts";
import { currentPcbStringPrecreateRequestSchema } from "./current-pcb-string-precreate-validation.ts";
import { CURRENT_PCB_DIAGNOSTIC_PROFILE } from "./current-pcb-diagnostic-profile.ts";
import { assertNoUnresolvedCurrentPcbDiagnosticLaunches } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import { shortcutKeysRequestSchema } from "./shortcut-keys.ts";
import { readShortcutKeys } from "./shortcut-keys-runtime.ts";
import { currentPcbLayersRequestSchema } from "./current-pcb-layers.ts";
import { readCurrentPcbLayers } from "./current-pcb-layers-runtime.ts";
import { currentDisposableOpenRequestSchema } from "./current-disposable-open.ts";
import { CurrentDisposableOpenCoordinator, inspectCurrentSchematicOpeningHistory } from "./current-disposable-open-runtime.ts";
import { currentPcbIdentitiesRequestSchema } from "./current-pcb-identities.ts";
import { readCurrentPcbIdentities } from "./current-pcb-identities-runtime.ts";
import { currentPcbGeometryRequestSchema } from "./current-pcb-geometry.ts";
import { readCurrentPcbGeometry } from "./current-pcb-geometry-runtime.ts";
import { currentSymbolMetadataRequestSchema } from "./current-symbol-metadata.ts";
import { currentProjectPcbMetadataRequestSchema } from "./current-project-pcb-metadata.ts";
import { readCurrentProjectPcbMetadata } from "./current-project-pcb-metadata-runtime.ts";
import { currentProjectSchematicMetadataRequestSchema } from "./current-project-schematic-metadata.ts";
import { readCurrentProjectSchematicMetadata } from "./current-project-schematic-metadata-runtime.ts";
import { currentProjectBoardMetadataRequestSchema } from "./current-project-board-metadata.ts";
import { readCurrentProjectBoardMetadata } from "./current-project-board-metadata-runtime.ts";
import { currentPcbRenamePreflightRequestSchema } from "./current-pcb-rename-preflight.ts";
import { readCurrentPcbRenamePreflight } from "./current-pcb-rename-preflight-runtime.ts";
import { currentSymbolOperationRequestSchema } from "./current-symbol-operation.ts";
import { currentSymbolCopyOperationRequestSchema } from "./current-symbol-copy-operation.ts";
import { currentPcbRenameOperationRequestSchema } from "./current-pcb-rename-operation.ts";
import { CurrentPcbRenameOperationCoordinator, inspectCurrentPcbRenameHistory } from "./current-pcb-rename-operation-runtime.ts";
import { currentSchematicRenameOperationRequestSchema } from "./current-schematic-rename-operation.ts";
import { CURRENT_SCHEMATIC_OPERATION_PURPOSE, currentSchematicOperationRequestSchema } from "./current-schematic-operation.ts";
import { CurrentSchematicRenameOperationCoordinator, inspectCurrentSchematicRenameHistory } from "./current-schematic-rename-operation-runtime.ts";
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
const facadeLease = await acquireFacadeLeaseOrDiagnose(retainedControlRoot);
if (facadeLease === null) { process.exit(0); }
const upstream = new UpstreamEasyedaClient({
  controlRoot: retainedControlRoot,
  onChildStarted: (pid): Promise<void> => facadeLease.bindChild(pid),
});
let windowsRuntime: WindowsControlRuntime | undefined;
let ordinaryLaunchCoordinator: OrdinaryLaunchCoordinator | undefined;
let ordinaryLaunchRuntime: WindowsControlRuntime | undefined;
let currentPcbDiagnosticLifecycle: CurrentPcbDiagnosticLifecycle | CurrentPcb209DiagnosticLifecycle | CurrentPcb209VisualLifecycle | undefined;
let currentPcbStringPrecreateLifecycle: CurrentPcbStringPrecreateLifecycle | undefined;
let currentFootprintMainLifecycle: CurrentFootprintMainLifecycle | undefined;
let currentPcbWorkerStartupLifecycle: CurrentFootprintCombinedLifecycle | CurrentFootprintCombinedUnknownAbandonment | CurrentPcbWorkerStartupLifecycle | CurrentPcb209WorkerStartupLifecycle | CurrentFootprintCopyPreparationLifecycle | CurrentFootprintCopyRoutePreparationLifecycle | CurrentPcb209EmptyStartupLifecycle | CurrentPcb209RatlineStartupLifecycle | CurrentPcb209RatlineContinuationLifecycle | undefined;
let currentDisposableOpenCoordinator: CurrentDisposableOpenCoordinator | undefined;
let currentPcbRenameOperationCoordinator: CurrentPcbRenameOperationCoordinator | undefined;
let currentSchematicRenameOperationCoordinator: CurrentSchematicRenameOperationCoordinator | undefined;
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
  if (currentPcbDiagnosticLifecycle?.hasActiveReservation() === true || currentPcbStringPrecreateLifecycle?.hasActiveReservation() === true || currentPcbWorkerStartupLifecycle?.hasActiveReservation() === true || currentFootprintMainLifecycle?.hasActiveReservation() === true) {
    throw new Error("An original diagnostic lifecycle reserves application startup.");
  }
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
    if (closedSymbolIndexReservation !== undefined || windowsRuntime !== undefined || scheduledShutdown !== undefined ||
        currentPcbDiagnosticLifecycle?.hasActiveReservation() === true || currentPcbStringPrecreateLifecycle?.hasActiveReservation() === true || currentPcbWorkerStartupLifecycle?.hasActiveReservation() === true || currentFootprintMainLifecycle?.hasActiveReservation() === true) {
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
      await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
      await upstream.listTools();
      await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
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
const statusAdmissionDiagnosticsSchema = z.object({
  schema: z.literal("easyeda-pro-control.admission-scan-diagnostics.v1"),
  journalCount: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  candidateCounts: z.object({
    legacy: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    incomplete: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    invalid: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    terminal: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    "current-baseline": z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  }).strict(),
  journalScanMs: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  historicalQualificationMs: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  totalMs: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
}).strict();
const statusSuccessOutputSchema = z
  .object({
    facade: recordSchema.optional(),
    upstream: recordSchema.optional(),
    bridgeConnection: recordSchema.optional(),
    upstreamProcess: recordSchema.optional(),
    incompleteOperations: z.array(recordSchema).optional(),
    incompleteOperationsObservedAt: nonEmptyStringSchema.optional(),
    admissionScan: statusAdmissionDiagnosticsSchema.optional(),
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
  easyeda_control_public_readers: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_netlist_files: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_library_files: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_catalog_footprint: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_catalog_components: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_extensions: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_launch: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_pcb_diagnostic_validation: currentSymbolOperationToolOutputSchema,
  easyeda_control_pcb_string_precreate_validation: currentSymbolOperationToolOutputSchema,
  easyeda_control_editor_shell: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_editor_context: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_shortcuts: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_pcb_layers: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_project_open: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_pcb_identities: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_pcb_geometry: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_project_symbol: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_project_pcb: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_project_schematic: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_project_board: z.object({ result: z.unknown().optional(), ...optionalFailureOutputShape }).catchall(z.unknown()),
  easyeda_control_project_symbol_metadata: currentSymbolOperationToolOutputSchema,
  easyeda_control_disposable_symbol_copy: currentSymbolOperationToolOutputSchema,
  easyeda_control_disposable_pcb_rename: currentSymbolOperationToolOutputSchema,
  easyeda_control_disposable_schematic_rename: currentSymbolOperationToolOutputSchema,
  easyeda_control_project_schematic_rename: currentSymbolOperationToolOutputSchema,
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

const previousGenerationInstructions = facadeMode === "calculation-only"
        ? "Restricted compatibility mode. Tools include local reference/discovery, status, separately pinned calculations and metadata observations, exact-target PCB layer and loaded-view identity/geometry reads, historical abandonment, ordinary application launch and one-shot disposable-project opening. Opening requires a retained launcher, empty editor, registered local file and checkpoint-member PCB; it permits migrations/cache replay/automatic Save effects. The project-open validation-* actions run one sealed disposable metadata forward/inverse lifecycle with exact phase acknowledgements and original owners. Its META-only lifecycle passed an installed101500 disposable round trip. Installed210000 passed the disposable canvas-segments forward/inverse round trip with complete closed SQL, reopened content and final closure. The easyeda_control_project_symbol_metadata route supports an original-owner forward-only name/non-null-description change for an unused project-local symbol with complete META-only or bounded canvas-segments history, including tombstones. Ordinary purpose reserves exactly one write and no inverse. Canvas clocks must follow every target header; saved drawing records remain byte-exact. Installed080000 passed the ordinary unused drawn-symbol forward lifecycle with complete closed SQL, exact reopened content and final closure on a disposable fixture. Installed123000 passed that ordinary entrypoint's unused META-only forward lifecycle with exact closed SQL, reopened content and final closure. Historical validation grants no current-invocation authority. Both symbol routes require pre-dispatch proof budgets, exact runtime admission and complete SQL/reopened-content verification. The separate original-owner ordinary SCH-container title route passed its installed203733 disposable-fixture lifecycle, including batching, full closed SQL and fresh metadata/peer/child-roster and both AST readback followed by final closure/SQL equality. Its ordinary-project scope retains the startup, clock and one-write guards; this historical result grants no current-invocation authority. Generic design writers, native controls, navigation, explicit Save and design recovery remain unavailable. Launch does not prove isolation or readiness; observations grant no later authority. Use offline schemas and exact validation first. The internal calculation-only mode name is retained; registration stays fixed until restart."
        : "Use offline easyeda_control_api for documented SDK methods, exact typed operation schemas and argument validation. Declaration presence never authorizes execution. Before live work use status and exact context. Typed transactions require native record/connectivity checks and save/reopen complete-project persistence verification. Inspect library execution capabilities. Native controls handle missing APIs and dialogs; UI acknowledgment is not persistence proof. Raw execution and the old component writer remain refused. Never retry uncertain calls or Save attempts; inspect and reconcile the retained journal.";

const server = new McpServer(
  { name: "easyeda-pro-control", version: CONTROL_VERSION },
  {
    capabilities: { tools: {} },
    instructions: facadeMode === "public-utilities-only" ? PUBLIC_UTILITIES_ONLY_INSTRUCTIONS : previousGenerationInstructions,
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
      ...(facadeMode === "public-utilities-only" ? { availableTools: PUBLIC_UTILITIES_ONLY_TOOLS,
        capabilityScope: PUBLIC_UTILITIES_ONLY_SCOPE } : {}),
      ...(facadeMode === "calculation-only" ? { availableTools: CALCULATION_ONLY_TOOLS,
        capabilityScope: "Separately admitted observations, utilities, historical abandonment, ordinary existing-profile launch and checkpointed disposable opening. The shared unused META-only symbol lifecycle passed an installed101500 disposable forward/inverse round trip. Installed123000 passed the separate ordinary unused META-only forward-only route with exact closed SQL, reopened content and final closure. That historical validation grants no current-invocation authority. Ordinary unused-symbol metadata accepts complete META-only or bounded canvas-segments history, including tombstones, with exactly one write and no inverse. Installed080000 passed the ordinary unused drawn-symbol forward lifecycle with complete closed SQL, exact reopened content and final closure on a disposable fixture. Installed210000 passed the disposable canvas-segments forward/inverse round trip with complete closed SQL, reopened content and final closure. The separate original-owner ordinary SCH-container title route passed its installed203733 disposable-fixture lifecycle, including batching, full closed SQL, fresh metadata/peer/child-roster and both AST readback, final closure and unchanged SQL. Ordinary-project scope retains exact startup, clock and one-write guards; historical validation grants no current-invocation authority. Generic design writers remain disabled. No generic design-content access or legacy-route admission; ordinary opening may change storage and launch does not prove isolation." } : {}),
    },
    upstream: facadeMode === "legacy-reviewed" ? projectPublicEngineStatus(await engine.status()) : {
      ...projectPublicEngineStatus(await engine.status()), capabilities: facadeMode === "public-utilities-only" ? publicUtilitiesOnlyCapabilities() : {
        sdkCalculations: { tool: "easyeda_control_calculate", runtimeAdmissionRequired: true },
        sdkSystem: { tool: "easyeda_control_system", runtimeAdmissionRequired: true },
        startupExtensions: { tool: "easyeda_control_extensions", runtimeAdmissionRequired: true, launchQualification: false },
        editorShell: { tool: "easyeda_control_editor_shell", runtimeAdmissionRequired: true, readinessProof: false },
        editorContext: { tool: "easyeda_control_editor_context", runtimeAdmissionRequired: true, identityOnly: true, cadAuthority: false },
        shortcutKeys: { tool: "easyeda_control_shortcuts", runtimeAdmissionRequired: true, keyboardExecution: false },
        pcbLayers: { tool: "easyeda_control_pcb_layers", runtimeAdmissionRequired: true, explicitTargetRequired: true, nativeEquivalent: true, designExecution: false },
        pcbIdentities: { tool: "easyeda_control_pcb_identities", runtimeAdmissionRequired: true, explicitTargetRequired: true, nativeEquivalent: true, savedMembershipVerified: false },
        pcbGeometry: { tool: "easyeda_control_pcb_geometry", runtimeAdmissionRequired: true, explicitTargetRequired: true, nativeEquivalent: true, savedMembershipVerified: false, connectivityVerified: false },
        projectSymbol: { tool: "easyeda_control_project_symbol", runtimeAdmissionRequired: true, explicitTargetRequired: true, nativeEquivalent: true, savedMembershipVerified: false, cadAuthority: false },
        projectPcb: { tool: "easyeda_control_project_pcb", runtimeAdmissionRequired: true, explicitTargetRequired: true, nativeEquivalent: true,
          noEditorTabsRequired: true, savedMembershipVerified: false, cadAuthority: false, connectedValidation: false },
        projectSchematic: { tool: "easyeda_control_project_schematic", runtimeAdmissionRequired: true, explicitTargetRequired: true, nativeEquivalent: true,
          noEditorTabsRequired: true, savedMembershipVerified: false, cadAuthority: false, connectedValidation: false },
        projectBoard: { tool: "easyeda_control_project_board", runtimeAdmissionRequired: true, explicitTargetRequired: true, nativeEquivalent: true,
          noEditorTabsRequired: true, savedMembershipVerified: false, cadAuthority: false, connectedValidation: false },
        projectSymbolMetadata: { tool: "easyeda_control_project_symbol_metadata", scope: "unreferenced-project-local-meta-only-or-bounded-canvas-segments-name-description-forward-only",
          runtimeAdmissionRequired: true, designMutation: true, connectedValidation: false, originalOwnerRequired: true,
          historicalConnectedValidation: "installed123000-ordinary-unused-meta-only-forward-only",
          historicalCanvasConnectedValidation: "installed080000-ordinary-unused-canvas-segments-forward-only",
          sharedLifecycleConnectedValidation: "installed101500-disposable-meta-only-roundtrip",
          phaseEffectAcknowledgementsRequired: true, inverseSupported: false, genericWritersEnabled: false },
        disposableSymbolCopy: { tool: "easyeda_control_disposable_symbol_copy", scope: "original-disposable-project-local-supported-symbol-copy",
          runtimeAdmissionRequired: true, designMutation: true, connectedValidation: false, originalOwnerRequired: true,
          historicalConnectedValidation: "installed094000-disposable-supported-drawn-symbol-copy",
          phaseEffectAcknowledgementsRequired: true, inverseSupported: false, ordinaryProjectsSupported: false, genericWritersEnabled: false },
        disposablePcbRename: { tool: "easyeda_control_disposable_pcb_rename", scope: "original-disposable-project-local-pcb-title-forward-only",
          runtimeAdmissionRequired: true, designMutation: true, connectedValidation: false, originalOwnerRequired: true,
          historicalConnectedValidation: "installed195000-disposable-pcb-title-only-lifecycle",
          phaseEffectAcknowledgementsRequired: true, inverseSupported: false, ordinaryProjectsSupported: false,
          savedMetadataOnly: true, completeCanvasRead: false, genericWritersEnabled: false },
        disposableSchematicRename: { tool: "easyeda_control_disposable_schematic_rename", scope: "original-disposable-project-local-schematic-title-forward-only",
          runtimeAdmissionRequired: true, designMutation: true, connectedValidation: false, originalOwnerRequired: true,
          historicalConnectedValidation: "installed143713-disposable-schematic-title-only-lifecycle", phaseEffectAcknowledgementsRequired: true, inverseSupported: false,
          ordinaryProjectsSupported: false, savedMetadataAndChildRosterOnly: true, completeCanvasRead: false, genericWritersEnabled: false },
        historicalAbandonment: { tool: "easyeda_control_history", localOnly: true, scope: "sixteen-event-pre-navigation-or-seven-phase-current-baseline-before-relaunch", replayAuthority: false },
        projectSchematicRename: { tool: "easyeda_control_project_schematic_rename", scope: "ordinary-project-local-schematic-title-forward-only",
          runtimeAdmissionRequired: true, designMutation: true, originalOwnerRequired: true, connectedValidation: false,
          historicalConnectedValidation: "installed203733-ordinary-schematic-title-only-lifecycle",
          validationOnly: false, ordinaryProjectsSupported: true, inverseSupported: false, genericWritersEnabled: false },
        ordinaryLaunch: { tool: "easyeda_control_launch", installedIdentityAdmissionRequired: true, profileIsolation: false },
        designAccess: { enabled: false, scope: "generic-design-routes" }, navigation: { enabled: true, tool: "easyeda_control_project_open",
          scope: "registered-disposable-project-and-existing-pcb-opening-plus-owned-validation-reopening", retainedLaunchRequired: true, unchangedStorageGuaranteed: false },
        disposableValidation: { tool: "easyeda_control_project_open", actions: "validation-*",
          scope: "sealed-disposable-unused-meta-only-or-bounded-canvas-segments-symbol-name-description-forward-inverse", designMutation: true, connectedValidation: false,
          sharedLifecycleConnectedValidation: "installed101500-disposable-meta-only-roundtrip",
          canvasSegmentsValidation: "installed210000-disposable-canvas-segments-roundtrip",
          normalWritersEnabled: false, phaseEffectAcknowledgementsRequired: true, originalOwnerRequired: true } },
    },
    bridgeConnection: upstream.bridgeConnectionDiagnostics(),
    upstreamProcess: upstream.processDiagnostics(),
    incompleteOperations: admission.incompleteOperations,
    incompleteOperationsObservedAt: admission.observedAt,
    admissionScan: admission.diagnostics,
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
    if (facadeMode !== "legacy-reviewed" && input.source === "live") {
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
    description: "Run one of sixteen fixed sys_Math calculation subsets on caller-supplied bounded geometry using an exact separately reviewed EasyEDA 3.2.206/API 0.3.50 or 3.2.209/API 0.3.59 profile. Requires the actual authenticated status fingerprint; it does not admit legacy design tools. No project access, context selection, navigation, files, Save, callbacks or arbitrary code. Inspect easyeda_control_api calculations and calculate-validate first. Clipping accepts only a smaller orthogonal integer-ring subset; complete output holes and disconnected regions are preserved. Results retain documented SDK limitations, including boundary behavior; no live validation is implied by registration.",
    inputSchema: { request: z.unknown().pipe(sdkMathRequestSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: await calculateSdkMath(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_system",
  {
    title: "Read local EasyEDA environment or convert units",
    description: "Run one of eighteen fixed sys_Environment/sys_Unit subsets on an exact separately reviewed EasyEDA 3.2.206/API 0.3.50 or 3.2.209/API 0.3.59 profile. Uses the actual authenticated status fingerprint, without active project/context, navigation, Save, network or files. Units accept bounded scalars and precision; environment values describe API initialization metadata, not live account permissions. The compiled-date getter may populate an extension-local cache. Version comparators compare the supplied version against the current version. Inspect offline API system and system-validate first. No arbitrary method, code, callback or legacy-route admission; no connected validation is implied.",
    inputSchema: { request: z.unknown().pipe(sdkSystemRequestSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: await readSdkSystem(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_public_readers",
  {
    title: "Read EasyEDA languages, viewport, theme and toolbar units",
    description: "Seven fixed public readers on exact EasyEDA 3.2.209/API 0.3.59: supported languages, language membership, SDK-resolved language, API viewport, current theme, toolbar data unit and fixed system-library UUID. SDK-resolved language can be a fallback; provider success and the private cached bus identity are not verified. The toolbar unit is not an active-document unit; the fixed UUID does not enumerate personal libraries. Requires the actual authenticated status fingerprint. Preserves case-sensitive language membership and ordered language identifiers. Viewport dimensions describe the API page, not the Windows desktop or PCB geometry. Complete bounded double observations retain their original owners; changed or malformed results refuse. Optional action:batch accepts one to seven unique reviewed methods under one ten-second deadline, with two complete ordered passes and no partial results. Batch observations are sequential, not atomic. Members retain the 8192-byte bound and the complete batch is limited to 65536 bytes. No project, library asset, external file, network, settings change, navigation, callback registration or Save operation. Inspect offline public-readers and public-readers-validate first. Source and offline tests are not connected validation.",
    inputSchema: { request: z.unknown().pipe(sdkPublicReadersOperationSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: await readSdkPublicReaders(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_netlist_files",
  {
    title: "Prepare and compare bounded Allegro netlist files",
    description: "Prepare a private managed .tel artifact from supplied ASCII text with confirmLocalArtifact:true, then compare two exact managed descriptors through the public File/File netlistComparison method on authenticated EasyEDA 3.2.209. prepare-file requires no expectedFingerprint and contacts no app; compare-files requires the actual authenticated expectedFingerprint. Whole Allegro subset recognition and independent membership comparison reject silent parser losses. Reports footprint-to-designator and net-to-pin differences only; values and properties are not compared. No document UUID/object overload, .enet, arbitrary path read, export, project navigation, upload, CAD edit or Save. Two complete bounded SDK samples and retained owners are required. Timeout refuses without retry but cannot cancel native RPC/FileReader. Inspect offline netlist-files/netlist-files-validate first; implementation is not connected validation.",
    inputSchema: { request: z.unknown().pipe(netlistFilesRequestSchema), expectedFingerprint: privateFingerprintSchema.optional() },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  guarded(async (input) => {
    if (input.request.action === "prepare-file") {
      if (input.expectedFingerprint !== undefined) { throw new Error("prepare-file does not accept a runtime fingerprint."); }
      return { result: await prepareNetlistFile(input.request) };
    }
    const expectedFingerprint = input.expectedFingerprint;
    if (expectedFingerprint === undefined) { throw new Error("compare-files requires the actual authenticated runtime fingerprint."); }
    return bridgeGate.run(async () => {
      await engine.assertBridgeDispatchAllowed();
      return upstream.withAuthenticatedBridgeDispatchScope(async () => ({ result: await compareNetlistFiles(engine, input.request, expectedFingerprint) }));
    });
  }),
);

registerFacadeTool(
  "easyeda_control_library_files",
  {
    title: "Inspect supplied EasyEDA project and library files",
    description: "Offline supplied-file metadata, lossless project/library sources, symbol pins, schematic records and persisted PCB stack/rules, in every facade mode without EasyEDA or runtime admission. Discover library-files and validate exact arguments with library-files-validate. prepare-file validates bounded canonical base64 and an ASCII filename, then writes one exclusive managed input with confirmLocalArtifact:true. Exact path/name/size/SHA descriptors bind every later read. extract-library-info reads ordinary .efoo/.epanl/type2 .esym metadata; extract-project-info reads .epro/.epro2 ZIP32 metadata. Dedicated footprint and standalone/legacy symbol source actions provide digest-bound indexes, rosters and lossless paging. extract-project-document-sources indexes canonical legacy document members or every unique native DOCHEAD segment in the current root .epru stream. list-project-document-sources and read-project-document-source page the complete digest-bound roster and exact UTF-8/base64 source, including unknown records. inspect-schematic-records reports recognized raw fields; inspect-pcb-stack-rules preserves persisted stack,14 rule families and raw populated selectors; inspect-project-symbol-pins and inspect-symbol-pins report supported raw pin/attribute fields. Reports do not compile connectivity, resolve inherited pins, calculate effective rule precedence, validate physical stackup or establish live/saved membership. Managed preparation/index actions write local artifacts; no import, SDK invocation, external path, archive extraction to disk, project opening, network, CAD edit or Save. All archive extents/inflation/CRC and complete source/report bounds are checked before paging; oversized records refuse rather than truncate. This is supplied-file inspection, not import suitability or electrical/manufacturing validation.",
    inputSchema: { request: z.unknown().pipe(managedLibraryFilesRequestSchema) },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  guarded(async (input) => ({ result: await executeManagedLibraryFiles(input.request) })),
);

registerFacadeTool(
  "easyeda_control_catalog_footprint",
  {
    title: "Look up one public system-footprint catalog entry",
    description: "Application-independent vendor HTTPS metadata lookup, not execution of lib_Footprint.get or installed SDK admission. Requires one explicit public footprint UUID and confirmNetwork:true. Sends one credential-free GET to the fixed EasyEDA system catalog; the vendor can log the request. No caller URL/library, authentication, redirects, retries, local database, bridge, editor, project access or Save. Requires exact public asset/system-owner/type identity; missing, private, malformed and unsuccessful responses refuse, and 404 does not prove absence. Returns name, description and classification, not geometry, completeness, freshness or manufacturing validation. Inspect offline catalog-footprint/catalog-footprint-validate first.",
    inputSchema: { request: z.unknown().pipe(publicSystemFootprintRequestSchema) },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  guarded(async (input) => ({ result: await readPublicSystemFootprint(input.request) })),
);

registerFacadeTool(
  "easyeda_control_catalog_components",
  {
    title: "Search public footprints, symbols and devices or look up component metadata",
    description: "Application-independent vendor HTTPS catalog queries, not public SDK execution. Eight fixed actions search-footprints, search-footprints-by-name, search-symbols, search-symbols-by-name, search-devices, get-devices-by-lcsc-ids, get-symbol and get-device require confirmNetwork:true and public catalog identifiers or a bounded public search query. Existing actions use one credential-free fixed-host request and at most twenty candidates. Footprint-name and LCSC-code lookups verify every returned candidate through fixed metadata endpoints, allowing at most five candidates and six requests under one 30-second/1-MiB response budget. Paged search requires an explicit page; name lookup accepts one name. No automatic pagination, redirects, retries, credentials, caller URL/library, local database, bridge, editor or Save. Search sends the query to the vendor and returns candidates, not exact or complete matches. Device symbol/footprint associations are catalog references, not verified pin mapping; missing explicit visibility flags are disclosed. The name lookup may parse two bounded native header records to verify symbol type when docType is absent; it never parses drawing geometry or executes source. Other inline vendor source is discarded; no separate asset downloads. No drawings, geometry, stock, pricing or manufacturing qualification. Inspect catalog-components/catalog-components-validate first; responses are untrusted vendor data.",
    inputSchema: { request: z.unknown().pipe(publicSystemCatalogRequestSchema) },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  guarded(async (input) => ({ result: await readPublicSystemCatalog(input.request) })),
);

if (facadeToolRegistered(facadeMode, "easyeda_control_pcb_string_precreate_validation")) {
  const inputSchema = z.object({ request: z.unknown().pipe(currentPcbStringPrecreateRequestSchema) }).strict();
  let original: { readonly owner: CurrentPcbStringPrecreateLifecycle; readonly run: CurrentPcbStringPrecreateLifecycle["run"];
    readonly assertLocal: () => void } | undefined;
  server.registerTool("easyeda_control_pcb_string_precreate_validation", {
    title: "Validate a disposable PCB String precreate baseline",
    description: "Separate fixed-purpose original-owner validation lifecycle. Query offline pcb-string-precreate-validation and validate exact arguments first. Launch with a unique string-precreate-* ID, admit pinned UI source, open the checkpoint-bound disposable project and PCB, separately admit its PCB frame/source, then inspect and source-qualify the original project worker. Optional observe-common-baseline compares five original fixed reader replies with the retained complete pre-open SQL inventory. Only a pure stored-comparison refusal after successful cleanup/context checks and durable failure/result publication permits continuing to the independent precreate read; other failures require normal cleanup. One observe-string-precreate call performs two fixed renderer/worker/model/selected-empty-producer sweeps under retained contexts. These observations do not prove actual channel delivery, complete latent callbacks, atomic state, queue completion or writer/Save authority. Old diagnostic owners cannot be upgraded. No caller SQL/observation adoption, purpose, request budget, expression, URL, source hash, CDP method, create, edit or explicit Save. Existing-profile startup and opening may restore projects, migrate, replay caches and automatically Save. Each stage is consumed once; inspect after uncertain replies. Original normal close, termination, helper release and exact record settlement remain available; no Save/Discard choice, force exit, historical-owner recreation or automatic retry.",
    inputSchema, outputSchema: currentSymbolOperationToolOutputSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  }, guarded((input: z.infer<typeof inputSchema>) => {
    const { request } = inputSchema.parse(input);
    if (original === undefined) {
      const environment = process.env;
      const assetsRoot = environment["EASYEDA_ASSETS_ROOT"], wslDistribution = environment["WSL_DISTRO_NAME"];
      const originalEngine = engine, originalGate = bridgeGate, originalUpstream = upstream;
      const facadePromise = disposableOwnData(engine, "controlFingerprintPromise");
      const authority = disposableOwnData(engine, "executionAuthorityValidator");
      const controlPath = retainedControlRoot.path, pluginRoot = resolve(import.meta.dirname, "../..");
      const methodIdentities = (): readonly unknown[] => [disposableOwnerMethod(bridgeGate, "run"),
        disposableOwnerMethod(engine, "assertDiagnosticLaunchOtherOperationsSettled"),
        disposableOwnerMethod(CurrentPcbStringPrecreateLifecycle.prototype, "run"),
        disposableOwnerMethod(CurrentPcbStringPrecreateLifecycle.prototype, "hasActiveReservation")];
      const capturedMethods = methodIdentities();
      const assertLocal = (): void => {
        const currentMethods = methodIdentities();
        if (engine !== originalEngine || upstream !== originalUpstream || bridgeGate !== originalGate ||
            disposableOwnData(engine, "upstream") !== originalUpstream ||
            disposableOwnData(engine, "controlFingerprintPromise") !== facadePromise ||
            disposableOwnData(engine, "executionAuthorityValidator") !== authority ||
            process.env !== environment || environment["EASYEDA_ASSETS_ROOT"] !== assetsRoot || environment["WSL_DISTRO_NAME"] !== wslDistribution ||
            controlDataDirectory() !== controlPath || retainedControlRoot.path !== controlPath || resolve(import.meta.dirname, "../..") !== pluginRoot ||
            capturedMethods.some((method, index) => method !== currentMethods[index]) ||
            original !== undefined && (currentPcbStringPrecreateLifecycle !== original.owner || original.owner.run !== original.run)) {
          throw new Error("String precreate original index owner, environment or methods changed.");
        }
      };
      const assertUnreserved = (): void => {
        assertLocal();
        if (assetsRoot === undefined || windowsRuntime !== undefined || ordinaryLaunchRuntime !== undefined ||
            currentDisposableOpenCoordinator !== undefined || currentPcbRenameOperationCoordinator !== undefined ||
            currentSchematicRenameOperationCoordinator !== undefined || closedSymbolIndexReservation !== undefined ||
            closedSymbolUnreservedFailure.observed || scheduledShutdown !== undefined || currentPcbDiagnosticLifecycle?.hasActiveReservation() === true || currentPcbWorkerStartupLifecycle?.hasActiveReservation() === true || currentFootprintMainLifecycle?.hasActiveReservation() === true) {
          throw new Error("String precreate launch requires no retained ordinary, project, closed-symbol, diagnostic or replacement owner and no shutdown.");
        }
      };
      const assertOtherLaunchesSettled = async (): Promise<void> => {
        assertUnreserved(); await engine.assertDiagnosticLaunchOtherOperationsSettled(); assertUnreserved();
      };
      const owner = new CurrentPcbStringPrecreateLifecycle({ pluginRoot, assetsRoot: assetsRoot ?? "", ...(wslDistribution === undefined ? {} : { wslDistribution }),
        powershellSha256: CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.sha256, powershellBytes: CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.bytes,
        assertLocalAllowed: assertLocal, assertAllowed: assertOtherLaunchesSettled, assertOtherLaunchesSettled });
      currentPcbStringPrecreateLifecycle = owner;
      // oxlint-disable-next-line typescript/unbound-method -- Original identity is retained and called only with its original receiver.
      original = { owner, run: owner.run, assertLocal };
    }
    const retained = original; retained.assertLocal();
    const run = async (): Promise<{ result: Record<string, unknown> }> => {
      retained.assertLocal(); const result = await retained.run.call(retained.owner, request); retained.assertLocal(); return { result };
    };
    return request.action === "inspect" ? run() : bridgeGate.run(run);
  }));
}

if (facadeToolRegistered(facadeMode, "easyeda_control_pcb_diagnostic_validation") || facadeToolRegistered(facadeMode, "easyeda_control_pcb209_opening")) {
  const diagnostic209 = facadeMode === "public-utilities-only";
  const diagnosticTool = diagnostic209 ? "easyeda_control_pcb209_opening" : "easyeda_control_pcb_diagnostic_validation";
  const visualWrapper = z.object({ action: z.literal("visual"), request: currentPcb209VisualRequestSchema }).strict();
  const diagnosticSchema = diagnostic209 ? z.union([currentPcb209OpeningRequestSchema, visualWrapper]) : currentPcbDiagnosticToolRequestSchema;
  const inputSchema = z.object({ request: z.unknown().pipe(diagnosticSchema) }).strict();
  let original: { readonly owner: CurrentPcbDiagnosticLifecycle | CurrentPcb209DiagnosticLifecycle | CurrentPcb209VisualLifecycle; readonly run: CurrentPcbDiagnosticLifecycle["run"];
    readonly assertLocal: () => void } | undefined;
  let mainOriginal: { readonly owner: CurrentFootprintMainLifecycle; readonly run: CurrentFootprintMainLifecycle["run"];
    readonly assertLocal: () => void } | undefined;
  const runMain = (request: CurrentFootprintMainValidationRequest): Promise<{ result: Record<string, unknown> }> => {
    if (!diagnostic209) { throw new Error("Original main observation requires the209 route."); }
    if (mainOriginal === undefined) {
      const environment = process.env;
      const assetsRoot = environment["EASYEDA_ASSETS_ROOT"], wslDistribution = environment["WSL_DISTRO_NAME"];
      const originalEngine = engine, originalGate = bridgeGate, originalUpstream = upstream;
      const facadePromise = disposableOwnData(engine, "controlFingerprintPromise");
      const authority = disposableOwnData(engine, "executionAuthorityValidator");
      const controlPath = retainedControlRoot.path, pluginRoot = resolve(import.meta.dirname, "../..");
      const methods = (): readonly unknown[] => [disposableOwnerMethod(bridgeGate, "run"),
        disposableOwnerMethod(engine, "assertDiagnosticLaunchOtherOperationsSettled"),
        disposableOwnerMethod(CurrentFootprintMainLifecycle.prototype, "run"),
        disposableOwnerMethod(CurrentFootprintMainLifecycle.prototype, "hasActiveReservation")];
      const capturedMethods = methods();
      const assertLocal = (): void => {
        const current = methods();
        if (engine !== originalEngine || bridgeGate !== originalGate || upstream !== originalUpstream ||
            disposableOwnData(engine, "upstream") !== originalUpstream ||
            disposableOwnData(engine, "controlFingerprintPromise") !== facadePromise ||
            disposableOwnData(engine, "executionAuthorityValidator") !== authority || process.env !== environment ||
            environment["EASYEDA_ASSETS_ROOT"] !== assetsRoot || environment["WSL_DISTRO_NAME"] !== wslDistribution ||
            controlDataDirectory() !== controlPath || retainedControlRoot.path !== controlPath || resolve(import.meta.dirname, "../..") !== pluginRoot ||
            capturedMethods.some((method, index) => method !== current[index]) || mainOriginal !== undefined &&
            (currentFootprintMainLifecycle !== mainOriginal.owner || mainOriginal.owner.run !== mainOriginal.run)) {
          throw new Error("Original main lifecycle owner, environment or methods changed.");
        }
      };
      const assertUnreserved = (): void => {
        assertLocal();
        if (assetsRoot === undefined || windowsRuntime !== undefined || ordinaryLaunchRuntime !== undefined ||
            currentDisposableOpenCoordinator !== undefined || currentPcbRenameOperationCoordinator !== undefined ||
            currentSchematicRenameOperationCoordinator !== undefined || closedSymbolIndexReservation !== undefined ||
            closedSymbolUnreservedFailure.observed || scheduledShutdown !== undefined ||
            currentPcbDiagnosticLifecycle?.hasActiveReservation() === true || currentPcbStringPrecreateLifecycle?.hasActiveReservation() === true ||
            currentPcbWorkerStartupLifecycle?.hasActiveReservation() === true) {
          throw new Error("Original main startup requires no other retained application owner or shutdown.");
        }
      };
      const assertAllowed = async (): Promise<void> => {
        assertUnreserved(); await engine.assertDiagnosticLaunchOtherOperationsSettled(); assertUnreserved();
      };
      const owner = new CurrentFootprintMainLifecycle({ pluginRoot, assetsRoot: assetsRoot ?? "", ...(wslDistribution === undefined ? {} : { wslDistribution }),
        powershellSha256: CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.sha256, powershellBytes: CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.bytes,
        assertLocalAllowed: assertLocal, assertAllowed, assertOtherLaunchesSettled: assertAllowed });
      currentFootprintMainLifecycle = owner;
      // oxlint-disable-next-line typescript/unbound-method -- The exact method always receives its retained lifecycle receiver.
      mainOriginal = { owner, run: owner.run, assertLocal };
    }
    const retained = mainOriginal; retained.assertLocal();
    const run = async (): Promise<{ result: Record<string, unknown> }> => {
      retained.assertLocal(); const result = await retained.run.call(retained.owner, request); retained.assertLocal(); return { result };
    };
    return request.action === "inspect" ? run() : bridgeGate.run(run);
  };
  let startupOriginal: { readonly owner: CurrentPcbWorkerStartupLifecycle | CurrentPcb209WorkerStartupLifecycle | CurrentFootprintCopyPreparationLifecycle | CurrentFootprintCopyRoutePreparationLifecycle | CurrentFootprintCombinedLifecycle | CurrentPcb209EmptyStartupLifecycle | CurrentPcb209RatlineStartupLifecycle | CurrentPcb209RatlineContinuationLifecycle; readonly run: CurrentPcbWorkerStartupLifecycle["run"];
    readonly capture: CurrentPcbWorkerStartupLifecycle["captureWorkerStartup"];
    readonly assignments: CurrentPcbWorkerStartupLifecycle["observeWorkerStartupAssignments"];
    readonly actor: CurrentPcbWorkerStartupLifecycle["observeWorkerStartupActor"];
    readonly footprint: CurrentPcb209WorkerStartupLifecycle["observeWorkerStartupFootprint"] | undefined;
    readonly footprintSource: CurrentPcb209WorkerStartupLifecycle["observeWorkerStartupFootprintSource"] | undefined;
    readonly footprintPreparation: CurrentPcb209WorkerStartupLifecycle["prepareWorkerStartupFootprintCopy"] | undefined;
    readonly channel: CurrentPcbWorkerStartupLifecycle["observeWorkerStartupChannel"];
    readonly empty: CurrentPcb209EmptyStartupLifecycle["observeWorkerStartupEmpty"] | undefined; readonly reserved: CurrentPcbWorkerStartupLifecycle["hasActiveReservation"];
    readonly attempted: CurrentFootprintCombinedLifecycle["hasAttemptedNativeOwnerAllocation"] | undefined;
    readonly ratline: CurrentPcb209RatlineStartupLifecycle["observeWorkerStartupRatline"] | undefined;
    readonly continuation: CurrentPcb209RatlineContinuationLifecycle["observeWorkerStartupRatlineContinuation"] | undefined;
    readonly footprintUi: CurrentFootprintCopyPreparationLifecycle["observeWorkerStartupFootprintUi"] | undefined;
    readonly footprintManagerRoute: CurrentFootprintCopyPreparationLifecycle["observeWorkerStartupFootprintManagerRoute"] | undefined;
    readonly footprintDependencies: CurrentFootprintCopyPreparationLifecycle["prepareWorkerStartupFootprintDependencies"] | undefined;
    readonly combinedPurpose: boolean; readonly routePurpose: boolean; readonly footprintRoute: CurrentFootprintCopyRoutePreparationLifecycle["observeWorkerStartupFootprintRoute"] | undefined;
    readonly footprintPurpose: boolean; readonly footprintBindings: CurrentFootprintCopyPreparationLifecycle["prepareWorkerStartupFootprintBindings"] | undefined;
    readonly emptyPurpose: boolean; readonly ratlinePurpose: boolean; readonly continuationPurpose: boolean; readonly assertLocal: () => void } | undefined;
  let startupCalls = 0;
  let combinedHistoricalOriginal: { readonly owner: CurrentFootprintCombinedUnknownAbandonment;
    readonly run: CurrentFootprintCombinedUnknownAbandonment["run"];
    readonly reserved: CurrentFootprintCombinedUnknownAbandonment["hasActiveReservation"]; readonly assertLocal: () => void } | undefined;
  const runCombinedHistorical = (request: Extract<CurrentFootprintCombinedValidationRequest, { action: "abandon-unknown-launch" }>): Promise<{ result: Record<string, unknown> }> => {
    if (!diagnostic209) { throw new Error("Combined historical relinquishment requires the209 route."); }
    if (combinedHistoricalOriginal === undefined) {
      const environment = process.env;
      const assetsRoot = environment["EASYEDA_ASSETS_ROOT"], wslDistribution = environment["WSL_DISTRO_NAME"];
      const originalEngine = engine, originalGate = bridgeGate, originalUpstream = upstream;
      const authority = disposableOwnData(engine, "executionAuthorityValidator"), facadePromise = disposableOwnData(engine, "controlFingerprintPromise");
      const controlPath = retainedControlRoot.path, pluginRoot = resolve(import.meta.dirname, "../..");
      const methodIdentities = (): readonly unknown[] => [disposableOwnerMethod(bridgeGate, "run"),
        disposableOwnerMethod(engine, "assertDiagnosticLaunchOtherOperationsSettled"),
        disposableOwnerMethod(CurrentFootprintCombinedUnknownAbandonment.prototype, "run"),
        disposableOwnerMethod(CurrentFootprintCombinedUnknownAbandonment.prototype, "hasActiveReservation")];
      const capturedMethods = methodIdentities();
      const ownerReference: { current: CurrentFootprintCombinedUnknownAbandonment | undefined } = { current: undefined };
      const assertLocal = (): void => {
        const methodsNow = methodIdentities();
        if (engine !== originalEngine || bridgeGate !== originalGate || upstream !== originalUpstream ||
            disposableOwnData(engine, "upstream") !== originalUpstream || disposableOwnData(engine, "controlFingerprintPromise") !== facadePromise ||
            disposableOwnData(engine, "executionAuthorityValidator") !== authority || process.env !== environment ||
            environment["EASYEDA_ASSETS_ROOT"] !== assetsRoot || environment["WSL_DISTRO_NAME"] !== wslDistribution ||
            retainedControlRoot.path !== controlPath || resolve(import.meta.dirname, "../..") !== pluginRoot ||
            methodsNow.length !== capturedMethods.length || methodsNow.some((method, index) => method !== capturedMethods[index]) ||
            ownerReference.current !== undefined && (currentPcbWorkerStartupLifecycle !== undefined && currentPcbWorkerStartupLifecycle !== ownerReference.current ||
              disposableOwnerMethod(ownerReference.current, "run") !== capturedMethods[2] ||
              disposableOwnerMethod(ownerReference.current, "hasActiveReservation") !== capturedMethods[3])) {
          throw new Error("Combined historical relinquishment coordinator changed.");
        }
      };
      const assertFreshNoOwnedAllocations = (): void => {
        assertLocal();
        if (windowsRuntime !== undefined || ordinaryLaunchRuntime !== undefined || ordinaryLaunchCoordinator !== undefined ||
            currentDisposableOpenCoordinator !== undefined || currentPcbRenameOperationCoordinator !== undefined ||
            currentSchematicRenameOperationCoordinator !== undefined || closedSymbolIndexReservation !== undefined ||
            closedSymbolUnreservedFailure.observed || scheduledShutdown !== undefined || currentPcbDiagnosticLifecycle !== undefined ||
            currentPcbStringPrecreateLifecycle !== undefined || currentFootprintMainLifecycle !== undefined ||
            currentPcbWorkerStartupLifecycle !== undefined && currentPcbWorkerStartupLifecycle !== ownerReference.current ||
            mainOriginal !== undefined || startupOriginal !== undefined || startupCalls !== 0) {
          throw new Error("Combined historical relinquishment requires a fresh facade with no application-owner allocation or reservation.");
        }
      };
      const assertOtherLaunchesSettled = async (): Promise<void> => {
        assertFreshNoOwnedAllocations(); await engine.assertDiagnosticLaunchOtherOperationsSettled(); assertFreshNoOwnedAllocations();
      };
      assertFreshNoOwnedAllocations();
      const owner = new CurrentFootprintCombinedUnknownAbandonment({ pluginRoot, assetsRoot: assetsRoot ?? "",
        ...(wslDistribution === undefined ? {} : { wslDistribution }), powershellSha256: CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.sha256,
        powershellBytes: CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.bytes, assertLocalAllowed: assertLocal,
        assertAllowed: assertOtherLaunchesSettled, assertOtherLaunchesSettled, assertFreshNoOwnedAllocations });
      ownerReference.current = owner;
      // oxlint-disable-next-line typescript/unbound-method -- Dispatch supplies this exact retained historical coordinator as receiver.
      combinedHistoricalOriginal = { owner, run: owner.run, reserved: owner.hasActiveReservation, assertLocal };
    }
    const retained = combinedHistoricalOriginal; retained.assertLocal();
    return bridgeGate.run(async () => {
      retained.assertLocal();
      if (combinedHistoricalOriginal !== retained) { throw new Error("Combined historical relinquishment owner changed."); }
      currentPcbWorkerStartupLifecycle = retained.owner;
      try { const result = await retained.run.call(retained.owner, request); retained.assertLocal(); return { result }; }
      finally {
        if (currentPcbWorkerStartupLifecycle === retained.owner && !retained.reserved.call(retained.owner)) { currentPcbWorkerStartupLifecycle = undefined; }
      }
    });
  };
  const runStartup = (request: CurrentPcbWorkerStartupValidationRequest | CurrentPcb209WorkerStartupValidationRequest | CurrentPcb209EmptyStartupValidationRequest | CurrentPcb209RatlineStartupValidationRequest | CurrentPcb209RatlineContinuationValidationRequest | CurrentFootprintCopyPreparationValidationRequest | CurrentFootprintCopyRoutePreparationValidationRequest | CurrentFootprintCombinedValidationRequest, emptyPurpose = false, ratlinePurpose = false, continuationPurpose = false, footprintPurpose = false, routePurpose = false, combinedPurpose = false): Promise<{ result: Record<string, unknown> }> => {
    if (combinedHistoricalOriginal !== undefined && currentPcbWorkerStartupLifecycle === combinedHistoricalOriginal.owner) {
      throw new Error("Combined historical relinquishment reserves this facade.");
    }
    let StartupLifecycle: typeof CurrentPcbWorkerStartupLifecycle | typeof CurrentPcb209WorkerStartupLifecycle | typeof CurrentFootprintCopyPreparationLifecycle | typeof CurrentFootprintCopyRoutePreparationLifecycle | typeof CurrentFootprintCombinedLifecycle | typeof CurrentPcb209EmptyStartupLifecycle | typeof CurrentPcb209RatlineStartupLifecycle | typeof CurrentPcb209RatlineContinuationLifecycle = diagnostic209 ? CurrentPcb209WorkerStartupLifecycle : CurrentPcbWorkerStartupLifecycle;
    if (Number(emptyPurpose) + Number(ratlinePurpose) + Number(continuationPurpose) + Number(footprintPurpose) + Number(routePurpose) + Number(combinedPurpose) > 1) { throw new Error("A launch has one fixed startup purpose."); }
    if (combinedPurpose) {
      if (!diagnostic209) { throw new Error("Combined footprint validation requires the209 route."); }
      StartupLifecycle = CurrentFootprintCombinedLifecycle;
    }
    if (routePurpose) {
      if (!diagnostic209) { throw new Error("Footprint route preparation requires the209 route."); }
      StartupLifecycle = CurrentFootprintCopyRoutePreparationLifecycle;
    }
    if (footprintPurpose) {
      if (!diagnostic209) { throw new Error("Footprint preparation requires the209 route."); }
      StartupLifecycle = CurrentFootprintCopyPreparationLifecycle;
    }
    if (emptyPurpose) { StartupLifecycle = CurrentPcb209EmptyStartupLifecycle; }
    if (ratlinePurpose) { StartupLifecycle = CurrentPcb209RatlineStartupLifecycle; }
    if (continuationPurpose) { StartupLifecycle = CurrentPcb209RatlineContinuationLifecycle; }
    if (continuationPurpose && !diagnostic209) { throw new Error("Ratline continuation requires the 209 route."); }
    if (ratlinePurpose && !diagnostic209) { throw new Error("Ratline held-import startup requires the 209 route."); }
    if (emptyPurpose && !diagnostic209) { throw new Error("Empty worker startup requires the 209 route."); }
    if (startupOriginal !== undefined && (startupOriginal.combinedPurpose !== combinedPurpose || startupOriginal.emptyPurpose !== emptyPurpose || startupOriginal.ratlinePurpose !== ratlinePurpose || startupOriginal.continuationPurpose !== continuationPurpose || startupOriginal.footprintPurpose !== footprintPurpose || startupOriginal.routePurpose !== routePurpose)) {
      startupOriginal.assertLocal();
      // A queued launch has no core lease yet. Retain its coordinator until
      // Every admitted call settles, and retain every pending cleanup lease.
      if (startupCalls !== 0 || startupOriginal.reserved.call(startupOriginal.owner)) {
        throw new Error("Worker startup purpose cannot change while an original call or reservation remains.");
      }
      startupOriginal = undefined;
    }
    if (combinedPurpose && request.action === "launch" && startupOriginal?.combinedPurpose === true) {
      startupOriginal.assertLocal();
      // Only a completed original allocation with its durable terminal and
      // Released lease can yield to a new combined launch. Queued calls and
      // Inspect retain the original coordinator; journals keep old IDs consumed.
      if (startupCalls === 0 && !startupOriginal.reserved.call(startupOriginal.owner) &&
          startupOriginal.attempted?.call(startupOriginal.owner) === true) { startupOriginal = undefined; }
    }
    if (startupOriginal === undefined) {
      const environment = process.env;
      const assetsRoot = environment["EASYEDA_ASSETS_ROOT"], wslDistribution = environment["WSL_DISTRO_NAME"];
      const originalEngine = engine, originalGate = bridgeGate, originalUpstream = upstream;
      const facadePromise = disposableOwnData(engine, "controlFingerprintPromise");
      const authority = disposableOwnData(engine, "executionAuthorityValidator");
      const controlPath = retainedControlRoot.path, pluginRoot = resolve(import.meta.dirname, "../..");
      const methodIdentities = (): readonly unknown[] => [disposableOwnerMethod(bridgeGate, "run"),
        disposableOwnerMethod(engine, "assertDiagnosticLaunchOtherOperationsSettled"),
        ...["run", "captureWorkerStartup", "handoffWorkerStartup", "openWorkerStartup", "handoffStartup", "openStartup", "requireStartup",
          "observeWorkerStartupAssignments", "observeStartupAssignments", "requireStartupAssignments", "observeWorkerStartupActor", "observeStartupActor",
          "observeWorkerStartupChannel", "observeStartupChannel", "hasActiveReservation",
          ...((StartupLifecycle === CurrentPcb209WorkerStartupLifecycle || footprintPurpose) ? ["observeWorkerStartupFootprint", "observeStartupFootprint",
            "observeWorkerStartupFootprintSource", "observeStartupFootprintSource",
            "prepareWorkerStartupFootprintCopy", "prepareStartupFootprintCopy"] : []),
          ...(footprintPurpose ? ["prepareWorkerStartupFootprintBindings", "prepareStartupFootprintCopyBindings", "observeWorkerStartupFootprintUi", "observeStartupFootprintCopyUi", "prepareWorkerStartupFootprintDependencies", "prepareStartupFootprintCopyDependencies", "observeWorkerStartupFootprintManagerRoute", "observeStartupFootprintCopyManagerRoute"] : []),
          ...((routePurpose || combinedPurpose) ? ["observeWorkerStartupFootprintRoute", "observeStartupFootprintRoute"] : []),
          ...(combinedPurpose ? ["runMainAction", "runCombinedAbort", "requireCombinedMainPublished", "assertCombinedNormal", "hasAttemptedNativeOwnerAllocation"] : []),
          ...(emptyPurpose ? ["observeWorkerStartupEmpty", "observeStartupEmpty", "prepareWorkerStartupEmpty", "prepareStartupEmpty"] : []),
          ...(ratlinePurpose ? ["observeWorkerStartupRatline", "observeStartupRatline"] : []),
          ...(continuationPurpose ? ["observeWorkerStartupRatlineContinuation", "observeStartupRatlineContinuation"] : [])]
          .map(key => disposableOwnerMethod(StartupLifecycle.prototype, key))];
      const capturedMethods = methodIdentities();
      const assertLocal = (): void => {
        const currentMethods = methodIdentities();
        if (engine !== originalEngine || upstream !== originalUpstream || bridgeGate !== originalGate ||
            disposableOwnData(engine, "upstream") !== originalUpstream || disposableOwnData(engine, "controlFingerprintPromise") !== facadePromise ||
            disposableOwnData(engine, "executionAuthorityValidator") !== authority || process.env !== environment ||
            environment["EASYEDA_ASSETS_ROOT"] !== assetsRoot || environment["WSL_DISTRO_NAME"] !== wslDistribution ||
            controlDataDirectory() !== controlPath || retainedControlRoot.path !== controlPath || resolve(import.meta.dirname, "../..") !== pluginRoot ||
            capturedMethods.some((method, index) => method !== currentMethods[index]) || startupOriginal !== undefined &&
            (currentPcbWorkerStartupLifecycle !== startupOriginal.owner || startupOriginal.owner.run !== startupOriginal.run ||
              startupOriginal.owner.captureWorkerStartup !== startupOriginal.capture ||
              startupOriginal.owner.observeWorkerStartupAssignments !== startupOriginal.assignments ||
              startupOriginal.owner.observeWorkerStartupActor !== startupOriginal.actor ||
              startupOriginal.owner.observeWorkerStartupChannel !== startupOriginal.channel ||
              startupOriginal.owner.hasActiveReservation !== startupOriginal.reserved ||
              startupOriginal.combinedPurpose && startupOriginal.owner.hasAttemptedNativeOwnerAllocation !== startupOriginal.attempted ||
              (startupOriginal.owner instanceof CurrentFootprintCopyRoutePreparationLifecycle || startupOriginal.combinedPurpose && startupOriginal.owner instanceof CurrentFootprintCombinedLifecycle) && startupOriginal.owner.observeWorkerStartupFootprintRoute !== startupOriginal.footprintRoute ||
              startupOriginal.owner instanceof CurrentFootprintCopyPreparationLifecycle && startupOriginal.owner.prepareWorkerStartupFootprintBindings !== startupOriginal.footprintBindings ||
              startupOriginal.owner instanceof CurrentFootprintCopyPreparationLifecycle && startupOriginal.owner.observeWorkerStartupFootprintUi !== startupOriginal.footprintUi ||
              startupOriginal.owner instanceof CurrentFootprintCopyPreparationLifecycle && startupOriginal.owner.observeWorkerStartupFootprintManagerRoute !== startupOriginal.footprintManagerRoute ||
              startupOriginal.owner instanceof CurrentFootprintCopyPreparationLifecycle && startupOriginal.owner.prepareWorkerStartupFootprintDependencies !== startupOriginal.footprintDependencies ||
              (startupOriginal.owner instanceof CurrentPcb209WorkerStartupLifecycle || startupOriginal.owner instanceof CurrentFootprintCopyPreparationLifecycle) && startupOriginal.owner.observeWorkerStartupFootprint !== startupOriginal.footprint ||
              (startupOriginal.owner instanceof CurrentPcb209WorkerStartupLifecycle || startupOriginal.owner instanceof CurrentFootprintCopyPreparationLifecycle) && startupOriginal.owner.observeWorkerStartupFootprintSource !== startupOriginal.footprintSource ||
              (startupOriginal.owner instanceof CurrentPcb209WorkerStartupLifecycle || startupOriginal.owner instanceof CurrentFootprintCopyPreparationLifecycle) && startupOriginal.owner.prepareWorkerStartupFootprintCopy !== startupOriginal.footprintPreparation ||
              startupOriginal.owner instanceof CurrentPcb209EmptyStartupLifecycle && startupOriginal.owner.observeWorkerStartupEmpty !== startupOriginal.empty ||
              startupOriginal.owner instanceof CurrentPcb209RatlineStartupLifecycle && startupOriginal.owner.observeWorkerStartupRatline !== startupOriginal.ratline ||
              startupOriginal.owner instanceof CurrentPcb209RatlineContinuationLifecycle && startupOriginal.owner.observeWorkerStartupRatlineContinuation !== startupOriginal.continuation)) { throw new Error("Worker startup original index owner, environment or methods changed."); }
      };
      const assertUnreserved = (): void => {
        assertLocal();
        if (assetsRoot === undefined || windowsRuntime !== undefined || ordinaryLaunchRuntime !== undefined ||
            currentDisposableOpenCoordinator !== undefined || currentPcbRenameOperationCoordinator !== undefined ||
            currentSchematicRenameOperationCoordinator !== undefined || closedSymbolIndexReservation !== undefined ||
            closedSymbolUnreservedFailure.observed || scheduledShutdown !== undefined ||
            currentPcbDiagnosticLifecycle?.hasActiveReservation() === true || currentPcbStringPrecreateLifecycle?.hasActiveReservation() === true ||
            currentFootprintMainLifecycle?.hasActiveReservation() === true) {
          throw new Error("Worker startup requires no retained ordinary, project, closed-symbol, diagnostic or String owner and no shutdown.");
        }
      };
      const assertOtherLaunchesSettled = async (): Promise<void> => {
        assertUnreserved(); await engine.assertDiagnosticLaunchOtherOperationsSettled(); assertUnreserved();
      };
      const owner = new StartupLifecycle({ pluginRoot, assetsRoot: assetsRoot ?? "", ...(wslDistribution === undefined ? {} : { wslDistribution }),
        powershellSha256: CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.sha256, powershellBytes: CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.bytes,
        assertLocalAllowed: assertLocal, assertAllowed: assertOtherLaunchesSettled, assertOtherLaunchesSettled });
      currentPcbWorkerStartupLifecycle = owner;
      startupOriginal = { owner, run: owner.run, capture: owner.captureWorkerStartup,
        assignments: owner.observeWorkerStartupAssignments, actor: owner.observeWorkerStartupActor,
        channel: owner.observeWorkerStartupChannel,
        footprint: (owner instanceof CurrentPcb209WorkerStartupLifecycle || owner instanceof CurrentFootprintCopyPreparationLifecycle) ? owner.observeWorkerStartupFootprint : undefined,
        footprintSource: (owner instanceof CurrentPcb209WorkerStartupLifecycle || owner instanceof CurrentFootprintCopyPreparationLifecycle) ? owner.observeWorkerStartupFootprintSource : undefined,
        footprintPreparation: (owner instanceof CurrentPcb209WorkerStartupLifecycle || owner instanceof CurrentFootprintCopyPreparationLifecycle) ? owner.prepareWorkerStartupFootprintCopy : undefined,
        // oxlint-disable-next-line typescript/unbound-method -- The purpose-switch guard invokes this retained private-field method only with the original lifecycle receiver.
        reserved: owner.hasActiveReservation,
        // oxlint-disable-next-line typescript/unbound-method -- Only the combined replacement guard calls this retained monotonic method with its original receiver.
        attempted: combinedPurpose ? owner.hasAttemptedNativeOwnerAllocation : undefined,
        // oxlint-disable-next-line typescript/unbound-method -- Retain the exact original method; the sole dispatch supplies its retained private-field receiver.
        empty: owner instanceof CurrentPcb209EmptyStartupLifecycle ? owner.observeWorkerStartupEmpty : undefined,
        // oxlint-disable-next-line typescript/unbound-method -- Retain the exact original method and invoke only with its retained lifecycle receiver.
        ratline: owner instanceof CurrentPcb209RatlineStartupLifecycle ? owner.observeWorkerStartupRatline : undefined,
        // oxlint-disable-next-line typescript/unbound-method -- Keep the original purpose method and invoke only with its retained receiver.
        continuation: owner instanceof CurrentPcb209RatlineContinuationLifecycle ? owner.observeWorkerStartupRatlineContinuation : undefined,
        // oxlint-disable-next-line typescript/unbound-method -- Retain the exact preparation method and always supply its original lifecycle receiver.
        footprintBindings: owner instanceof CurrentFootprintCopyPreparationLifecycle ? owner.prepareWorkerStartupFootprintBindings : undefined,
        // oxlint-disable-next-line typescript/unbound-method -- Retain the exact UI observation method and invoke it only with the original owner.
        footprintUi: owner instanceof CurrentFootprintCopyPreparationLifecycle ? owner.observeWorkerStartupFootprintUi : undefined,
        // oxlint-disable-next-line typescript/unbound-method -- The fixed dependency stage always runs with its retained lifecycle receiver.
        footprintDependencies: owner instanceof CurrentFootprintCopyPreparationLifecycle ? owner.prepareWorkerStartupFootprintDependencies : undefined,
        // oxlint-disable-next-line typescript/unbound-method -- The manager route reader always uses the retained original lifecycle receiver.
        footprintManagerRoute: owner instanceof CurrentFootprintCopyPreparationLifecycle ? owner.observeWorkerStartupFootprintManagerRoute : undefined,
        footprintRoute: (owner instanceof CurrentFootprintCopyRoutePreparationLifecycle || combinedPurpose && owner instanceof CurrentFootprintCombinedLifecycle) ? owner.observeWorkerStartupFootprintRoute : undefined,
        combinedPurpose, routePurpose, footprintPurpose, emptyPurpose, ratlinePurpose, continuationPurpose, assertLocal };
    }
    const retained = startupOriginal; retained.assertLocal();
    const assertRetained = (): void => {
      if (startupOriginal !== retained) { throw new Error("Worker startup original index coordinator changed."); }
      retained.assertLocal();
    };
    const run = async (): Promise<{ result: Record<string, unknown> }> => {
      assertRetained();
      let result: Record<string, unknown>;
      if (request.action === "observe-footprint-route") {
        if (!(retained.owner instanceof CurrentFootprintCopyRoutePreparationLifecycle || retained.combinedPurpose && retained.owner instanceof CurrentFootprintCombinedLifecycle) || !(retained.routePurpose || retained.combinedPurpose) || retained.footprintRoute === undefined) { throw new Error("Original footprint route preparation purpose required."); }
        result = await retained.footprintRoute.call(retained.owner, request.operationId, request.expectedBindingSha256);
      } else if (request.action === "observe-footprint-manager-route") {
        if (!(retained.owner instanceof CurrentFootprintCopyPreparationLifecycle) || !retained.footprintPurpose || retained.footprintManagerRoute === undefined) { throw new Error("Original footprint manager route purpose required."); }
        result = await retained.footprintManagerRoute.call(retained.owner, request.operationId, request.expectedBindingSha256);
      } else if (request.action === "prepare-footprint-dependencies") {
        if (!(retained.owner instanceof CurrentFootprintCopyPreparationLifecycle) || !retained.footprintPurpose || retained.footprintDependencies === undefined) { throw new Error("Original footprint dependency preparation purpose required."); }
        result = await retained.footprintDependencies.call(retained.owner, request.operationId, request.expectedBindingSha256);
      } else if (request.action === "observe-footprint-ui") {
        if (!(retained.owner instanceof CurrentFootprintCopyPreparationLifecycle) || !retained.footprintPurpose || retained.footprintUi === undefined) { throw new Error("Original footprint preparation UI purpose required."); }
        result = await retained.footprintUi.call(retained.owner, request.operationId, request.expectedBindingSha256);
      } else if (request.action === "prepare-footprint-bindings") {
        if (!(retained.owner instanceof CurrentFootprintCopyPreparationLifecycle) || !retained.footprintPurpose || retained.footprintBindings === undefined) { throw new Error("Original footprint preparation purpose required."); }
        result = await retained.footprintBindings.call(retained.owner, request.operationId, request.expectedBindingSha256);
      } else if (request.action === "observe-ratline-continuation") {
        if (!(retained.owner instanceof CurrentPcb209RatlineContinuationLifecycle) || retained.continuation === undefined || !retained.continuationPurpose) { throw new Error("Original ratline continuation launch purpose required."); }
        result = await retained.continuation.call(retained.owner, request.operationId, request.expectedBindingSha256);
      } else if (request.action === "observe-ratline-held-import") {
        if (!(retained.owner instanceof CurrentPcb209RatlineStartupLifecycle) || retained.ratline === undefined || !retained.ratlinePurpose) { throw new Error("Original ratline held-import launch purpose required."); }
        result = await retained.ratline.call(retained.owner, request.operationId, request.expectedBindingSha256);
      } else if (request.action === "observe-empty-baseline") {
        if (!(retained.owner instanceof CurrentPcb209EmptyStartupLifecycle) || retained.empty === undefined || !retained.emptyPurpose) { throw new Error("Original empty-baseline launch purpose required."); }
        result = await retained.empty.call(retained.owner, request.operationId, request.expectedBindingSha256);
      } else if (request.action === "capture-project") {
        const { action: _action, operationId, expectedBindingSha256, ...input } = request;
        result = await retained.capture.call(retained.owner, operationId, expectedBindingSha256, input);
      } else if (request.action === "observe-current-assignments") {
        result = await retained.assignments.call(retained.owner, request.operationId, request.expectedBindingSha256);
      } else if (request.action === "observe-footprint-state") {
        if (!((retained.owner instanceof CurrentPcb209WorkerStartupLifecycle || retained.owner instanceof CurrentFootprintCopyPreparationLifecycle)) || retained.footprint === undefined ||
            retained.emptyPurpose || retained.ratlinePurpose || retained.continuationPurpose) { throw new Error("Original current209 startup footprint owner required."); }
        result = await retained.footprint.call(retained.owner, request.operationId, request.expectedBindingSha256);
      } else if (request.action === "observe-footprint-source") {
        if (!((retained.owner instanceof CurrentPcb209WorkerStartupLifecycle || retained.owner instanceof CurrentFootprintCopyPreparationLifecycle)) || retained.footprintSource === undefined ||
            retained.emptyPurpose || retained.ratlinePurpose || retained.continuationPurpose) { throw new Error("Original current209 startup footprint source owner required."); }
        result = await retained.footprintSource.call(retained.owner, request.operationId, request.expectedBindingSha256,
          { footprintUuid: request.footprintUuid });
      } else if (request.action === "prepare-footprint-copy") {
        if (!((retained.owner instanceof CurrentPcb209WorkerStartupLifecycle || retained.owner instanceof CurrentFootprintCopyPreparationLifecycle)) || retained.footprintPreparation === undefined ||
            retained.emptyPurpose || retained.ratlinePurpose || retained.continuationPurpose) { throw new Error("Original current209 startup footprint preparation owner required."); }
        result = await retained.footprintPreparation.call(retained.owner, request.operationId, request.expectedBindingSha256);
      } else if (request.action === "observe-actor-clock") {
        result = await retained.actor.call(retained.owner, request.operationId, request.expectedBindingSha256);
      } else if (request.action === "observe-current-channel") {
        result = await retained.channel.call(retained.owner, request.operationId, request.expectedBindingSha256);
      } else { result = await retained.run.call(retained.owner, request); }
      assertRetained(); return { result };
    };
    startupCalls += 1;
    try {
      const pending = request.action === "inspect" || request.action === "abort-generation" && retained.combinedPurpose ? run() : bridgeGate.run(run);
      return pending.finally(() => { startupCalls -= 1; });
    } catch (error) { startupCalls -= 1; throw error; }
  };
  if (facadeToolRegistered(facadeMode, "easyeda_control_pcb209_worker_startup")) {
    const startupSchema = z.object({ request: z.unknown().pipe(currentPcb209WorkerStartupToolRequestSchema) }).strict();
    server.registerTool("easyeda_control_pcb209_worker_startup", {
      title: "Capture a disposable EasyEDA 3.2.209 project worker startup",
      description: "Disposable EasyEDA 3.2.209 startup validation with eight separate launch purposes. The footprint-combined wrapper seals an original main/renderer owner before launch, requires published main construction before disposable project capture, and supports the existing exact worker/actor/route observations. A private challenge-matched helper-ready packet precedes launch input. Original-factory closed/zero-input failure proof is distinct from native-resource release. Its separate historical abandon-unknown-launch action requires a fresh facade before any owner allocation, exact reviewed223950 intent-only bytes and bounded process-absence checks; it preserves an unknown outcome and grants no termination or design proof. It enables no request collector, copy/delete or Save; query footprint-combined/-validate first. Its confirmed abort-generation targets only its original Job and blocks subsequent normal work while retaining termination/release. The footprint-main wrapper launches an original main inspector with owned stderr and a root/Job/TCP-bound connection, captures fixed original protocol registration owners and offers explicit once-only termination of that diagnostic Job. Query footprint-main/-validate first. It opens no project and offers no writer or Save. The footprint-copy-route-preparation wrapper uses its own footprint-route-* launch to qualify original Worker identity and callback/destination routes without copy, transaction-clock arming or Save; query footprint-copy-route-preparation/-validate first. The footprint-copy-preparation wrapper uses a separately bounded original launch to retain source, producer, actor, 61 dependency functions and initialized UI/manager route bindings; query footprint-copy-preparation/-validate first. It grants no copy or Save authority. Query the matching offline catalog and argument validator first: pcb209-worker-startup/-validate, pcb209-empty-baseline/-validate, pcb209-ratline-held-import/-validate, or pcb209-ratline-continuation/-validate. Each purpose launches its own original owner; an existing owner cannot be upgraded. Launch, qualify browser/frame/UI source, then capture-project once against the exact disposable checkpoint. The default pcb209-startup-* purpose can subsequently observe current assignments, channel relations, a sequential UI/worker actor-clock bracket and original footprint-manager state. The footprint-state stage reads its captured user/client/ticket. After its published result, observe-footprint-source reconstructs one checkpoint-member footprint from original live consistency entries and existing native Cache chunks, checking every keyed record and generated header against the complete checkpoint while two matching source samples retain observed native order. It is a bounded native equivalent, not a GET_STR dispatch; a cache miss refuses without fetch, parser replay, cache writes or network fallback. Its source-only profile accepts ordinary record families, repeated fragments and tombstones, needs 65 remaining normal requests and grants no copy/delete or persistence authority. After the source result, prepare-footprint-copy journals original-owned plan/argument hashes using eight remaining normal requests. Preparation cannot upgrade launch purpose or enable native create, Save or saved verification. The empty-baseline wrapper uses pcb209-empty-* and joins fixed common data with the original completed SQL checkpoint, bracketed by empty raw-manager samples; populated targets refuse. The ratline-held-import wrapper uses pcb209-ratline-* with the original cumulative budget and complete source leases. After capture-project, observe-ratline-held-import journals intent before the sole PCB navigation, qualifies 29 PCB source stages, captures original construction and holds the first ratline child at its seventh qualified source import. It stops before worker continuation, callback return and full startup or baseline completion. The ratline-continuation wrapper uses pcb209-continuation-* and a separately sealed native budget. After its durable intent, known physical PCB records in the original checkpoint refuse before PCB navigation; passing this negative filter proves no empty live baseline. Native queues must remain exactly empty, including no serialized [] job. After capture-project, observe-ratline-continuation qualifies the original PCB, first worker and subordinate sources, continues their fixed imports and observes original PCB/worker capture checkpoints and callback returnsites. Callback completion, publication completion and native Worker-object/target identity remain unproved. These sequential observations grant no native channel-peer, server-clock, contained-destination, writer or durability proof. Explicit debugger-pause acceptance is required. Launch/open may restore tabs, migrate, replay caches, use the network and automatically persist files. Every stage is consumed once. Inspect after uncertainty and retain the original owner through abort, normal close, original root/Job termination, helper release and record settlement. No caller JavaScript, CDP commands, explicit Save, CAD writer, historical-owner adoption, navigation retry or Save/Discard choice. Forced termination is limited to the explicitly confirmed original footprint-main or footprint-combined Job.",
      inputSchema: startupSchema, outputSchema: currentSymbolOperationToolOutputSchema,
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    }, guarded((input: z.infer<typeof startupSchema>) => {
      const request = startupSchema.parse(input).request;
      if (request.action === "footprint-main") { return runMain(request.request); }
      if (request.action === "footprint-combined") {
        return request.request.action === "abandon-unknown-launch" ? runCombinedHistorical(request.request) : runStartup(request.request, false, false, false, false, false, true);
      }
      if (request.action === "footprint-copy-route-preparation") { return runStartup(request.request, false, false, false, false, true); }
      if (request.action === "footprint-copy-preparation") { return runStartup(request.request, false, false, false, true); }
      if (request.action === "ratline-held-import") { return runStartup(request.request, false, true); }
      if (request.action === "ratline-continuation") { return runStartup(request.request, false, false, true); }
      return request.action === "empty-baseline" ? runStartup(request.request, true) : runStartup(request);
    }));
  }
  server.registerTool(diagnosticTool, {
    title: diagnostic209 ? "Open and qualify a disposable EasyEDA 3.2.209 PCB session" : "Validate a contained native EasyEDA diagnostic session",
    description: diagnostic209
      ? "Query pcb209-visual/-validate for a separate launch-sealed visual purpose, supplied through {action:visual,request:...}. It supports one fit-all, fit-selected or zoom-to viewport action on its sealed disposable PCB. With exact confirmation, abort-visual terminates only its original Job, then requires observed root exit, empty Job and release. It offers no selection writes, PNG, CAD edits or explicit Save; selection dispatch can flush uploads and delete empty items. Existing diagnostic owners cannot upgrade. This visual route is implemented but not connected-validated. Separate EasyEDA3.2.209 validation-only original-owner launch, UI source qualification and one checkpoint-bound disposable project/PCB opening. Query pcb209-opening/pcb209-opening-validate first. After accepted PCB frame/source/identity, observe-layers returns double-sampled layer metadata and copper count. observe-primitives returns matching Line/Arc/Via/parentless-String loaded-view projections and IDs. The separate observe-extended-primitives returns matching Component/Pad/Attribute/Dimension/Image projections, IDs, observed Attribute parent groups and Component metadata presence states. observe-selection-relations combines all nine families with ordered selected IDs and0..16 requested Component child-pad lists, refusing missing or contradictory membership. observe-pad-shapes separately returns supported Pad rows and native top/inner/bottom style groups without physical-layer expansion. observe-image-shapes separately returns Image/Picture rows with bounded serialized vector paths or opaque asset references, without loading asset content or proving rendered boundaries. observe-arc-shapes returns native centers/radii in mil, endpoint radians and sweep while keeping the base Arc DTOs. observe-poured-shapes returns existing native fill IDs, parent groups and serialized contours in native ten-mil units, without copper rebuild, freshness or fabrication proof. New stages require enough remaining original transport capacity before native dispatch. query-observation reads a published historical result by exact record SHA for family filters, requested IDs, retained selection or observed child pads; it makes no live call and grants no current-state or owner authority. Each object stage has a256-row per-family and384KiB aggregate bound; models without views and unqueried families are excluded. No complete-board, reciprocal ownership, connectivity, physical-stackup, startup, asset/rendering or saved-state proof. Uses fixed209 executable/selectors/UI/PCB pins and pcb209-* IDs; older diagnostic/worker/model purposes cannot be selected. No arbitrary protocol, caller code, target URL, worker inspection, ratline capture, CAD edit or explicit Save. Existing-profile launch/open can restore projects, migrate, replay caches and automatically Save. Keep the original owner alive through one-shot opening/observations, normal close, retained root/Job termination, helper release and receipt settlement. Inspect after lost replies; never replay navigation/observations or choose Save/Discard. No historical-owner adoption or new owner after ambiguity."
      : "Validation-only original-owned native launch, fixed source/frame/worker observations and sampled PCB compiler/pending-work/raw-String reads. Query offline pcb-diagnostic-validation and validate exact arguments first. The separate worker-startup wrapper uses its own fixed owner; capture-project requires an exact disposable target and explicit debugger-pause acceptance, arms capture before opening, and binds retained constructors to the selected project/branch/window. After published capture, observe-current-assignments checks the retained wrappers; observe-actor-clock then compares a UI/worker/worker/UI actor and local-Date bracket. The independent observe-current-channel stage checks original channel relations, fixed publisher-method associations and paired gates after published assignments. These are point-in-time, non-atomic observations, not native peer ownership, contained destinations, clock provenance or Save authority. It cannot upgrade an ordinary owner and grants no writer authority. Startup and opening use the existing profile: restoration, migration, cache replay and automatic Save are possible. Ordinary open-project binds an exact registered disposable file/checkpoint and empty source-qualified UI. After accepted project-only opening choose worker discovery OR open-pcb, not both. open-pcb derives the retained PCB target; observe-pcb-opening separately proves its child frame, DOM owner, complete source and native identity before observe-model-state. Samples are non-atomic and do not prove whole-board membership, continuous publishers, containment, queue completion or saved state. No CAD edits, explicit Save, caller executable, URL, source hash, CDP method or JavaScript. Every opening/observation stage is consumed once; inspect retained outcomes after lost replies. Normal close, proved root/Job termination, helper release and record settlement are separate original-owner steps. No forced exit, implicit Save/Discard or journal-derived ownership. Ambiguous creation or a failed suspended-image check cannot use no-process cleanup.",
    inputSchema, outputSchema: currentSymbolOperationToolOutputSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
  }, guarded((input: z.infer<typeof inputSchema>) => {
    const parsed = inputSchema.parse(input).request;
    if (parsed.action === "worker-startup") { return runStartup(parsed.request); }
    const visual = parsed.action === "visual";
    const request = visual ? parsed.request : parsed;
    let DiagnosticLifecycle = diagnostic209 ? CurrentPcb209DiagnosticLifecycle : CurrentPcbDiagnosticLifecycle;
    if (visual) { DiagnosticLifecycle = CurrentPcb209VisualLifecycle; }
    if (original !== undefined && !(original.owner instanceof DiagnosticLifecycle)) {
      throw new Error("The original diagnostic purpose cannot change after allocation.");
    }
    if (original === undefined) {
      const environment = process.env;
      const assetsRoot = environment["EASYEDA_ASSETS_ROOT"], wslDistribution = environment["WSL_DISTRO_NAME"];
      const originalEngine = engine, originalGate = bridgeGate, originalUpstream = upstream;
      const facadePromise = disposableOwnData(engine, "controlFingerprintPromise");
      const authority = disposableOwnData(engine, "executionAuthorityValidator");
      const controlPath = retainedControlRoot.path, pluginRoot = resolve(import.meta.dirname, "../..");
      const methodIdentities = (): readonly unknown[] => [disposableOwnerMethod(bridgeGate, "run"),
        disposableOwnerMethod(engine, "assertDiagnosticLaunchOtherOperationsSettled"),
        disposableOwnerMethod(DiagnosticLifecycle.prototype, "run"),
        disposableOwnerMethod(DiagnosticLifecycle.prototype, "hasActiveReservation")];
      const capturedMethods = methodIdentities();
      const assertLocal = (): void => {
        const currentMethods = methodIdentities();
        if (engine !== originalEngine || upstream !== originalUpstream || bridgeGate !== originalGate ||
            disposableOwnData(engine, "upstream") !== originalUpstream ||
            disposableOwnData(engine, "controlFingerprintPromise") !== facadePromise ||
            disposableOwnData(engine, "executionAuthorityValidator") !== authority ||
            process.env !== environment || environment["EASYEDA_ASSETS_ROOT"] !== assetsRoot || environment["WSL_DISTRO_NAME"] !== wslDistribution ||
            controlDataDirectory() !== controlPath || retainedControlRoot.path !== controlPath || resolve(import.meta.dirname, "../..") !== pluginRoot ||
            capturedMethods.some((method, index) => method !== currentMethods[index]) ||
            original !== undefined && (currentPcbDiagnosticLifecycle !== original.owner || original.owner.run !== original.run)) {
          throw new Error("Diagnostic original index owner, environment or methods changed.");
        }
      };
      const assertUnreserved = (): void => {
        assertLocal();
        if (assetsRoot === undefined || windowsRuntime !== undefined || ordinaryLaunchRuntime !== undefined ||
            currentDisposableOpenCoordinator !== undefined || currentPcbRenameOperationCoordinator !== undefined ||
            currentSchematicRenameOperationCoordinator !== undefined || closedSymbolIndexReservation !== undefined ||
            closedSymbolUnreservedFailure.observed || scheduledShutdown !== undefined || currentPcbStringPrecreateLifecycle?.hasActiveReservation() === true || currentPcbWorkerStartupLifecycle?.hasActiveReservation() === true || currentFootprintMainLifecycle?.hasActiveReservation() === true) {
          throw new Error("Diagnostic launch requires no retained ordinary, project, closed-symbol or replacement owner and no shutdown.");
        }
      };
      const assertOtherLaunchesSettled = async (): Promise<void> => {
        assertUnreserved(); await engine.assertDiagnosticLaunchOtherOperationsSettled(); assertUnreserved();
      };
      const owner = new DiagnosticLifecycle({ pluginRoot, assetsRoot: assetsRoot ?? "", ...(wslDistribution === undefined ? {} : { wslDistribution }),
        powershellSha256: CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.sha256, powershellBytes: CURRENT_PCB_DIAGNOSTIC_PROFILE.powershell.bytes,
        assertLocalAllowed: assertLocal, assertAllowed: assertOtherLaunchesSettled, assertOtherLaunchesSettled });
      currentPcbDiagnosticLifecycle = owner;
      // oxlint-disable-next-line typescript/unbound-method -- Preserve original identity; calls below always supply its original receiver.
      original = { owner, run: owner.run, assertLocal };
    }
    const retained = original; retained.assertLocal();
    // Inspection and historical queries do not wait behind a native call. The
    // Query rechecks its journal snapshot; it cannot adopt the original owner.
    const run = async (): Promise<{ result: Record<string, unknown> }> => {
      retained.assertLocal(); const result = await retained.run.call(retained.owner, request); retained.assertLocal(); return { result };
    };
    return request.action === "inspect" || request.action === "query-observation" ? run() : bridgeGate.run(run);
  }));
}

registerFacadeTool(
  "easyeda_control_launch",
  {
    title: "Launch, observe, normally close or release the reviewed EasyEDA application",
    description: "Launch the exact reviewed EasyEDA executable with no arguments in its existing profile. Requires explicit launch/profile-effect confirmations and a unique operation ID. Startup can load extensions/project lists, use the network and write preferences/cache; it is not isolated or project-free. Journals before dispatch and retains the original Windows root/Job. observe-window requires that current retained launch and its inspected launchedSha256; normal-close also requires its exact unique application HWND and confirmNormalClose:true. One durable close intent precedes the fixed WM_CLOSE request. Acknowledgment is not exit; observe-termination separately proves retained root/Job exit. Explicit release-closed then requires its observed launchedSha256/terminationSha256 and confirmReleaseClosed:true, consumes one intent and awaits original helper transport closure before clearing matching allocations. Project/writer or allocated diagnostic owners block release; uncertainty retains allocation and cannot be retried or reconstructed from historical JSON. Termination alone preserves the proof issuer. No repeat close after uncertainty, prompt choice, force kill, design open or explicit Save. Normal closure can persist application data. inspect is local; observe-application reports same-name presence without identity or relaunch authority. After lost handles, abandon-supervision requires a successful historical launch digest, explicit acceptance and absent samples. For a reviewed intent-only launch, abandon-unknown-launch requires its inspected intentSha256, confirmAbandonUnknownLaunch:true, acceptUnobservedDescendants:true and a fresh coordinator. Its separate read-only helper excludes delayed creation by requiring no other PowerShell process before sampling EasyEDA twice. Both routes record relinquishment without proving termination. Quarantine and design gates remain unchanged. Use offline launch/launch-validate first. Successful startup is not authentication or Start Page readiness.",
    inputSchema: { request: z.unknown().pipe(ordinaryLaunchRequestSchema) },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  },
  serializedGuarded(async ({ request }) => {
    if (ordinaryLaunchCoordinator === undefined) {
      const assetsRoot = process.env["EASYEDA_ASSETS_ROOT"];
      if (assetsRoot === undefined) { throw new Error("Configure the installed EasyEDA assets before ordinary launch."); }
      const pluginRoot = resolve(import.meta.dirname, "../..");
      // oxlint-disable-next-line typescript/unbound-method -- Inspect exact inherited private-field observers; call only with their original lifecycle receiver.
      const diagnosticReserved = CurrentPcbDiagnosticLifecycle.prototype.hasActiveReservation;
      // oxlint-disable-next-line typescript/unbound-method -- This monotonic observer distinguishes never-allocated owners from completed or failed allocations.
      const diagnosticAllocated = CurrentPcbDiagnosticLifecycle.prototype.hasAttemptedNativeOwnerAllocation;
      let releaseDiagnostics: readonly (CurrentPcbDiagnosticLifecycle | CurrentPcbStringPrecreateLifecycle | CurrentPcbWorkerStartupLifecycle | CurrentFootprintCombinedUnknownAbandonment | undefined)[] | undefined;
      const assertLocalAllowed = (): void => {
        if (closedSymbolIndexReservation !== undefined || scheduledShutdown !== undefined ||
            windowsRuntime !== ordinaryLaunchRuntime || process.env["EASYEDA_ASSETS_ROOT"] !== assetsRoot) {
          throw new Error("Ordinary launch runtime allocation is unavailable or changed.");
        }
      };
      const assertReleaseAllowed = (runtime: OrdinaryLaunchRuntime): void => {
        assertLocalAllowed();
        if (runtime !== ordinaryLaunchRuntime || runtime !== windowsRuntime || currentDisposableOpenCoordinator !== undefined ||
            currentPcbRenameOperationCoordinator !== undefined || currentSchematicRenameOperationCoordinator !== undefined ||
            closedSymbolIndexReservation !== undefined || closedSymbolUnreservedFailure.observed || scheduledShutdown !== undefined ||
            disposableOwnerMethod(CurrentPcbDiagnosticLifecycle.prototype, "hasActiveReservation") !== diagnosticReserved ||
            disposableOwnerMethod(CurrentPcbDiagnosticLifecycle.prototype, "hasAttemptedNativeOwnerAllocation") !== diagnosticAllocated) {
          throw new Error("Ordinary runtime release is reserved by another owner or its observer changed.");
        }
        const diagnostics = [currentPcbDiagnosticLifecycle, currentPcbStringPrecreateLifecycle, currentPcbWorkerStartupLifecycle, currentFootprintMainLifecycle] as const;
        if (releaseDiagnostics !== undefined && diagnostics.some((owner, index) => owner !== releaseDiagnostics?.[index])) {
          throw new Error("Ordinary runtime release diagnostic owners changed.");
        }
        for (const owner of diagnostics) {
          if (owner !== undefined && (disposableOwnerMethod(owner, "hasActiveReservation") !== diagnosticReserved ||
              disposableOwnerMethod(owner, "hasAttemptedNativeOwnerAllocation") !== diagnosticAllocated ||
              diagnosticReserved.call(owner) || diagnosticAllocated.call(owner))) {
            throw new Error("Ordinary runtime release requires unreserved diagnostics with no native allocation attempt.");
          }
        }
        releaseDiagnostics ??= diagnostics;
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
        assertReleaseAllowed,
        completeRuntimeRelease: (runtime): void => {
          assertReleaseAllowed(runtime);
          windowsRuntime = undefined; ordinaryLaunchRuntime = undefined; releaseDiagnostics = undefined;
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
    description: "Open one registered local disposable project and checkpoint-member PCB on the separately pinned current runtime. Requires this facade's retained launch, empty editor, exact raw path/hash and acceptance of migrations/cache replay/restored tabs/automatic Save. baseline-* prepares one closed symbol, normal closure, complete baseline, isolated scratch Date reference, replacement launch/admission, inactive-cache exclusion, project-only opening and renderer clocks. validation-begin retains that baseline for one sealed name/description forward/inverse test. Targets referenced by active sheets refuse before mutation. Complete history must be META-only or meet the separate bounded canvas-segments profile: at most 101 complete history chunks including reserved writes, stable atom types, lossless bodies, unambiguous cache actors and a unique latest/max-ticket header. Saved canvas order must be attainable by the pinned concurrent replay, with every output line byte-exact. Fresh document windows must follow every target header and reserve a later inverse window. Installed210000 passed the disposable canvas-segments forward/inverse round trip with complete closed SQL, reopened content and final closure. Proof budgets reserve both writes; physical allocation, heap and deadlines are not guaranteed. validation-advance requires the exact next phase and its acknowledgements; never replay writes, opening or closing. The inverse comes only from original metadata and the verified post-edit snapshot. Original writer/verifier owners retain full closed SQL and reopened-content proofs in both directions. No caller target, patch, fingerprint, code or verifier can replace the baseline. Failure permits only offered original-owner cleanup or inspection, not blind inversion. A stopped opener can request-normal-close through its original Job without a bridge call; quarantine remains until termination/session closure is proved. Close acknowledgement is not termination or saved-content proof. No explicit Save, Save/Discard choice, forced exit or restoration. Inverse restores metadata, not historical database bytes/tickets/timestamps. Lost handles cannot be reconstructed. The META-only lifecycle passed an installed101500 disposable round trip; generic writers stay blocked. Use the separate project-symbol-metadata route for ordinary forward-only work under its one-write history and clock guards, and offline project-open/project-open-validate for this validation route.",
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
    description: "Read the fixed public getShortcutKeys method on separately reviewed EasyEDA 3.2.206/API 0.3.50/UI 3.2.196 or 3.2.209/API 0.3.59/UI 3.2.198. Requires an authenticated fingerprint and two owner-stable matching bounded observations. includeSystem defaults false; true includes the vendor hotkey registry, not its separate menu registry or every executable shortcut. Preserves raw key strings, order, duplicates and empty tokens; scopes differ from document types, and209 includes scopes beyond its declarations. With includeSystem:true only, one exact source-known missing scope slot may be tagged as unmappedScope hole/undefined/null, never guessed or dropped. No key press, callback registration, focus, settings, design, navigation or Save. Inspect offline shortcuts/shortcuts-validate first. Vendor enumeration precedes output bounds and is not cancelled by timeout; no automatic retry or connected validation is implied.",
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
    description: "Observe selected IDs, unfiltered Line/Arc/Via/Component/Pad/String/Dimension/Image/Attribute IDs, or positively classify one ID within Line/Arc/Via only on the separately pinned current API/UI/PCB runtime. Requires exact project/branch/document/tab target and authenticated fingerprint. Retains the native frame/receiver and takes two matching ordered samples; missing, duplicate, ambiguous, malformed or oversized results refuse. Native equivalents, not public-wrapper dispatch. Dimension combines length/radius/angle views; Image includes vector images and pictures without loading their assets. Attribute results retain ordered native component groups, not reciprocal or stored ownership. IDs describe loaded views or selection, not complete saved membership, ownership, geometry, connectivity or persistence. Fill/Polyline/Region remain excluded because their serializer can rebuild children. No filters, selection change, navigation, write or Save. Query offline pcb-identities/pcb-identities-validate first; no connected validation is implied.",
    inputSchema: { request: z.unknown().pipe(currentPcbIdentitiesRequestSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: await readCurrentPcbIdentities(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_project_symbol",
  {
    title: "Read project-local symbol metadata",
    description: "Read one exact project-local symbol on the separately pinned current runtime. lib_Symbol.get requires an active PCB context and observes bounded metadata twice. Project-only preflight instead requires no editor tabs or hidden editors and compares exact caller-supplied expectedBefore metadata twice, with bounded UI actor/client/ticket/clock observations. Query offline project-symbol/project-symbol-validate or project-symbol-preflight/project-symbol-preflight-validate. Both require the authenticated fingerprint. Supplied expectations are not source provenance; the private worker is not independently leased. No backend actor/clock qualification, startup completion, permission, saved membership, connectivity or writer authority. No cloud lookup, geometry load, navigation, mutation or explicit Save. The separate easyeda_control_project_symbol_metadata route provides original-owner forward-only changes for unused symbols with complete META-only or bounded canvas-segments history and exactly one write; project-open validation-* provides disposable forward/inverse validation. This read grants neither authority; generic writers remain blocked.",
    inputSchema: { request: z.unknown().pipe(z.union([currentSymbolMetadataRequestSchema, currentProjectOnlySymbolPreflightRequestSchema])), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: "method" in input.request
    ? await readCurrentSymbolMetadata(engine, input.request, input.expectedFingerprint)
    : await readCurrentProjectOnlySymbolPreflight(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_project_pcb",
  {
    title: "Read project-local PCB metadata without opening an editor",
    description: "Read one exact PCB's native metadata or the complete bounded PCB inventory in an already loaded local project with no editor tabs or hidden editors. Requires an authenticated fingerprint and explicit project/branch identity; selected lookup also requires the PCB UUID. Metadata mode preserves native title/display title, parent, board, source/version, ticket and update time in two matching observations bracketed by project-owner checks. Inventory uses the non-swallowing native key/value route, admits genuine empty maps, sorts by UUID rather than visual order, and bounds the complete sample to 128 PCBs and 65536 UTF-8 bytes after native enumeration. Preflight mode also compares supplied expected metadata, complete bounded native PCB peers, native desired-title availability, client/maxTicket and UI actor/clock samples. Supplied expectations are not saved-source provenance; observations do not lease the worker, qualify its constructor/backend clock, prove startup or authorize renaming. No public object parity, canvas/source loading, navigation, cloud lookup, mutation or Save. Query offline project-pcb/project-pcb-validate or project-pcb-preflight/project-pcb-preflight-validate first. Connected validation is generation-specific; inventory validation is not recorded.",
    inputSchema: { request: z.unknown().pipe(z.union([currentProjectPcbMetadataRequestSchema, currentPcbRenamePreflightRequestSchema])), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: "method" in input.request
    ? await readCurrentProjectPcbMetadata(engine, input.request, input.expectedFingerprint)
    : await readCurrentPcbRenamePreflight(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_project_schematic",
  {
    title: "Read project-local schematic and sheet metadata without opening editors",
    description: "Read one or all schematic containers or sheets in an already loaded local project with no editor tabs or hidden editors. Requires an authenticated fingerprint and explicit project/branch identity; selected sheet lookup also requires its page UUID and expected parent schematic UUID. Two complete bounded native schematic and sheet maps must match, with every child naming an observed container and project-owner checks surrounding each sample. Selected lookup additionally matches its exact native getter. Preserves independent native name/display name, sheet title/display title, source/version, board, ticket, update time and sheet zIndex. Sorted UUID order is comparison order, not visual order. Native-task-equivalent observations, not public object parity, saved-source membership, a worker lease, startup completion or writer authority. No canvas/source loading, AST-holder preflight, navigation, clock/client lookup, name availability, cloud lookup, mutation or Save. Query offline project-schematic/project-schematic-validate first. Connected validation is generation-specific and not recorded for these added page routes.",
    inputSchema: { request: z.unknown().pipe(currentProjectSchematicMetadataRequestSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: await readCurrentProjectSchematicMetadata(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_project_board",
  {
    title: "Read project-local board metadata without opening editors",
    description: "Read one exact board or the complete bounded board metadata inventory in an already loaded local project with no editor tabs or hidden editors. Requires an authenticated fingerprint and explicit project/branch identity; selected lookup also requires its board UUID. The public getBoardInfo boardName selector is not exposed: this native equivalent requires boardUuid and rejects boardName. Two complete native key/value maps must match, bracketed by project-owner checks; selected lookup also matches its exact native getter. Returns UUID, raw title, zIndex and ticket, sorted by UUID rather than visual order. At most 128 boards and 65536 UTF-8 bytes before selected filtering; genuine empty maps are preserved. Native-task-equivalent observations, not public IDMT_BoardItem parity, child document membership, saved-source membership, a worker lease, startup completion or writer authority. No canvas/source loading, navigation, clock/client lookup, name selection, cloud lookup, mutation or Save. Query offline project-board/project-board-validate first. Connected validation is not recorded.",
    inputSchema: { request: z.unknown().pipe(currentProjectBoardMetadataRequestSchema), expectedFingerprint: privateFingerprintSchema },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  serializedLiveGuarded(async (input) => ({ result: await readCurrentProjectBoardMetadata(engine, input.request, input.expectedFingerprint) })),
);

registerFacadeTool(
  "easyeda_control_pcb_geometry",
  {
    title: "Read loaded PCB geometry and placement",
    description: "getSelectedPrimitives accepts empty arguments and returns supported selected-object DTOs in selection order. It brackets each complete compound sample with selected-ID reads and refuses missing, ambiguous or unsupported selected families; observed family rosters and Attribute groups are retained. This is not public-instance parity. " +
      "Observe Line/Arc/Via geometry, Component metadata, Pad parameters, parentless String text, component Attribute text/placement, Dimension geometry and Image/Picture placement on the separately pinned current API/UI/PCB runtime. Requires exact project/branch/document/tab target and authenticated fingerprint, a retained native receiver and two matching bounded samples. getAll accepts empty arguments; get accepts 1..256 distinct primitiveIds and returns caller order after complete-family validation. getAllPinsByPrimitiveId correlates one component's complete child list with global Pad DTOs in child order; reverse parent and symbol-pin mapping remain unverified. Pad includes null/ROUND/SLOT holes, default ELLIPSE/OVAL/RECT parameters, bounded native POLYGON pathSource with native-pad-style coordinate space, mask mode/values and nullable thermal configuration. Lengths use mil, rotations/thermal angle degrees and rectangle corner ratio percent; default shape dimensions already have native 0.1mil rounding. POLYGON preserves and compares up to2048 L/ARC/CARC/C/CIRCLE tokens per pad with native four-decimal mil coordinates/radii and degree sweeps; do not infer a board-space or mirrored transform. The serializer selects the last layer1/2/15 style and can omit tiny/unsupported segments. Physical stacks and full rendered geometry remain unverified; populated polygon live validation is pending. Masks and thermal values are loaded observations, not fresh rule resolution, actual poured geometry or fabrication approval. String returns raw text/font, pose/style, key/show flags, positionIsNull and serialized silkColor. Attribute adds current model value and keyVisible/valueVisible, preserving complete ordered parent groups even for selected IDs. Name values may already be formula-expanded; raw formulaName and evaluation are omitted. Numeric coordinates remain required. Color is a bounded raw string or native-normalized null, not validated CSS or raw-model color proof. Grouping does not prove reciprocal ownership. Dimension returns exact length/radius/angle coordinate tuples and line width in mil, type, layer, precision and lock. Its canvasUnit comes from the current canvas, not a verified stored annotation unit; it does not change the coordinate units or prove a rendered measurement. Image preserves native Image/Picture kind, start anchor, width/height, rotation, mirror flag, layer and lock, without assets, paths, hashes or image-content/rendered-bounds claims. Native Image serialization precedes output bounds, but its Picture source getter is not called. No SDK instances, public-wrapper dispatch, optional filters, rendered-glyph proof, selection change, navigation, write or Save. Loaded-view data does not prove saved membership, connectivity or persistence. Query offline pcb-geometry/pcb-geometry-validate first; connected validation is generation-specific.",
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
      title: "Change one unused project symbol's metadata",
      description: "Change only name and/or non-null description of one unreferenced project-local symbol through an original-owner forward-only lifecycle. Query offline project-symbol-operation/project-symbol-operation-validate first. Complete raw history, including tombstones, must be META-only or satisfy the bounded canvas-segments profile: stable atom types, lossless bodies, unambiguous cache actors, a unique latest/max-ticket header and at most 101 chunks including the reserved write; stricter reader limits still apply. Saved canvas lines remain byte-exact with a valid native replay-order witness. Ordinary purpose reserves exactly one write, never an inverse. Canvas histories also require a document window strictly newer than every target header and within the fixed ceiling. Initial opening requires this facade's retained ordinary launch, empty editor, exact registered local path/hash and checkpoint-member default-branch PCB. Supported schematic startup is sealed before navigation and rechecked before writing; linked-sheet propagation is unsupported. Use the returned preparationCheckpoint for baseline-begin. Ordinary opening may migrate storage, replay caches, restore tabs or automatically Save; scratch processes, opening, normal closure and the write require their exact acknowledgements. Retain the original owners through clocks, one metadata write, full closed SQL comparison, cache-excluded project reopening, saved-content verification and final closed SQL equality. Pre-dispatch budgets bound supported proof sizes, not physical allocation, heap or deadlines. metadata-advance accepts only the exact next phase, never replacement target, patch, clock, runtime, code or verifier. Completion requires requestedMetadataVerified and nextPhase completed, leaving requested metadata with no inverse. Inspect a lost response; never replay writes or navigation. Failed operations allow only offered original-owner cleanup. Saved JSON cannot restore continuation. No tags/source/classification/otherProperty or geometry changes, explicit Save, Save/Discard choice, forced exit, restoration or generic writer enablement. The shared META-only lifecycle passed an installed101500 disposable round trip. Installed123000 passed this ordinary unused META-only forward-only entrypoint with exact closed SQL, reopened saved content, final SQL equality and retained process closure. Historical evidence grants no current-invocation authority. Installed080000 passed the ordinary unused drawn-symbol forward lifecycle with complete closed SQL, exact reopened content and final closure on a disposable fixture.",
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

if (facadeToolRegistered(facadeMode, "easyeda_control_disposable_symbol_copy")) {
  const inputSchema = z.object({ request: z.unknown().pipe(currentSymbolCopyOperationRequestSchema) }).strict();
  server.registerTool("easyeda_control_disposable_symbol_copy", {
    title: "Copy one supported symbol in an owned disposable project",
    description: "Separate disposable-only symbol copy lifecycle. Query offline disposable-symbol-copy/disposable-symbol-copy-validate first; workflow reference: easyeda-pro-control/references/current-symbol-copy.md. Begin from an original retained easyeda_control_project_open disposable opening; no ordinary opening, replacement fingerprint, destination UUID, title or patch is accepted. Seal the source against the managed checkpoint and complete closed SQL baseline. The fixed native clone keeps supported self-contained canvas bytes, chooses a new UUID/title and clears source linkage. Original startup, actors, dual clocks and proof budgets precede one copy attempt. Every copy-advance acknowledges its exact next phase; inspect lost replies, never replay. Completion requires copyVerified with nextPhase completed after closed SQL effect, cache-excluded reopening, exact reopened destination content and unchanged source/peer SQL, and final closed SQL equality. Only offered original-owner cleanup is available after failure. Opening and normal closure can automatically persist changes. No explicit Save, forced exit, delete, inverse, restoration, ordinary-project support or generic lib_Symbol.copy enablement. Installed094000 passed one disposable supported drawn-symbol copy with complete closed SQL, exact reopened content and final closure. Later generations and other source histories remain unvalidated.",
    inputSchema, outputSchema: currentSymbolOperationToolOutputSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  }, serializedGuarded(async ({ request }: z.output<typeof inputSchema>) => {
    if (currentDisposableOpenCoordinator === undefined) {
      const assetsRoot = process.env["EASYEDA_ASSETS_ROOT"];
      const assertOwner = (): void => {
        if (closedSymbolIndexReservation !== undefined || scheduledShutdown !== undefined || ordinaryLaunchRuntime === undefined ||
          windowsRuntime !== ordinaryLaunchRuntime || ordinaryLaunchRuntime.status().state !== "owned" || assetsRoot === undefined ||
          process.env["EASYEDA_ASSETS_ROOT"] !== assetsRoot) {
          throw new Error("Disposable symbol copy requires this facade's unchanged retained launch.");
        }
      };
      currentDisposableOpenCoordinator = new CurrentDisposableOpenCoordinator({ engine, assertOwner,
        runtime: (): WindowsControlRuntime => { assertOwner(); return ownedWindowsRuntime(); } });
    }
    return { result: await currentDisposableOpenCoordinator.runCopy(request) };
  }, { allowDuringOrphanRisk: true }));
}

if (facadeToolRegistered(facadeMode, "easyeda_control_disposable_pcb_rename")) {
  const inputSchema = z.object({ request: z.unknown().pipe(currentPcbRenameOperationRequestSchema) }).strict();
  server.registerTool("easyeda_control_disposable_pcb_rename", {
    title: "Rename one PCB in an owned disposable project",
    description: "Disposable-only title rename through an original-owner forward lifecycle. Query offline disposable-pcb-rename/disposable-pcb-rename-validate first. baseline-begin requires this facade's existing retained easyeda_control_project_open disposable opening and a distinct operation ID; no new opener/runtime or ordinary-project ownership is created by this tool. Complete closed SQL, original metadata, fresh project-only startup, native name availability, both actors and original Windows/document clocks precede one title-only update. Titles are trimmed printable ASCII without capital I. Each advance requires its exact next phase and effect acknowledgements. Inspect lost replies; never replay writes, opening, closing or scratch processes. Completion requires renameVerified and nextPhase completed after acknowledged mutation, original process closure, exact whole-SQL effect, cache-excluded reopening, matching target/all-PCB metadata and final closed SQL equality. Reopened native verification is metadata-only, not a complete PCB canvas read. Cleanup uses only the retained original owner; saved journals cannot restore continuation after restart. Opening/normal closure can automatically persist files. No explicit Save, Save/Discard choice, forced exit, inverse, delete, restoration, ordinary projects or generic dmt_Pcb.modifyPcbName enablement. Installed195000 passed one disposable title-only lifecycle with complete closed SQL, cache-excluded reopened PCB metadata and unchanged final SQL after normal closure. Later generations and other project histories remain unvalidated.",
    inputSchema, outputSchema: currentSymbolOperationToolOutputSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  }, guarded(async ({ request }: z.output<typeof inputSchema>) => {
    const validated = currentPcbRenameOperationRequestSchema.parse(request);
    // Inspection reads only a retained snapshot or historical journal. It must
    // Remain available while the original one-shot phase holds the bridge gate.
    if (validated.action === "inspect") {
      return { result: await (currentPcbRenameOperationCoordinator === undefined
        ? inspectCurrentPcbRenameHistory(validated.operationId) : currentPcbRenameOperationCoordinator.run(validated)) };
    }
    return bridgeGate.run(async () => {
      if (currentPcbRenameOperationCoordinator === undefined) {
        if (validated.action !== "baseline-begin" || currentDisposableOpenCoordinator === undefined) {
          throw new Error("PCB rename requires this facade's existing retained disposable opening and operation coordinator; journals cannot reconstruct ownership.");
        }
        currentPcbRenameOperationCoordinator = new CurrentPcbRenameOperationCoordinator(engine, currentDisposableOpenCoordinator);
      }
      return { result: await currentPcbRenameOperationCoordinator.run(validated) };
    });
  }));
}

if (facadeToolRegistered(facadeMode, "easyeda_control_disposable_schematic_rename")) {
  const inputSchema = z.object({ request: z.unknown().pipe(currentSchematicRenameOperationRequestSchema) }).strict();
  server.registerTool("easyeda_control_disposable_schematic_rename", {
    title: "Rename one schematic container in an owned disposable project",
    description: "Disposable-only schematic title change through a retained original-owner lifecycle. Query offline disposable-schematic-rename/disposable-schematic-rename-validate first. baseline-begin requires this facade's existing disposable project opening and a distinct operation ID. The opener's PCB binds the local project; the separate existing SCH target is selected from complete closed SQL. Every advance names its exact next phase and effects. advance-batch accepts two to four explicit adjacent steps with the same acknowledgments, stopping on failure or pending observation without retry or automatic cleanup; inspect lastBatch after a lost reply, never replay the batch. Original baseline, fresh project-only generation, child roster/startup, actor and Windows/document clock checks precede one project-qualified title update. Titles must be printable ASCII without capital I; old-name duplicates, imported/reuse/block-symbol and child-reparenting branches refuse. Completion needs renameVerified and nextPhase completed after the actual acknowledgment, original root/Job closure, exact complete SQL effect, cache-excluded fresh reopening, matching container/all-peer metadata and unchanged child roster/both ASTs, final normal closure and SQL equality. This is metadata/roster verification, not sheet canvas/connectivity proof. Subscriber completion and prospective backend actor attestation are not claimed. Inspect lost replies for the current phase, elapsed time and last outcome. These passive diagnostics are not writer clocks or retry authority; busy plus stopped reserves ongoing work. Never repeat writes, navigation, close or scratch processes. Cleanup retains original ownership; journals cannot reconstruct it after restart. Opening/closure may automatically persist files. No explicit Save, Save/Discard choice, forced exit, inverse, delete, restore, ordinary projects or generic SDK writer. Installed143713 passed one disposable title-only lifecycle with complete closed SQL, fresh saved metadata/peer/child-roster verification and final closure. That single-phase case does not validate batching; installed163322 separately passed the batched disposable lifecycle. Neither historical case grants current invocation authority or validates the new ordinary-purpose composition.",
    inputSchema, outputSchema: currentSymbolOperationToolOutputSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  }, guarded(async ({ request }: z.output<typeof inputSchema>) => {
    const validated = currentSchematicRenameOperationRequestSchema.parse(request);
    // Read-only inspection must remain available while an original phase owns
    // The bridge gate. It cannot recreate continuation from a journal.
    if (validated.action === "inspect") {
      return { result: await (currentSchematicRenameOperationCoordinator === undefined
        ? inspectCurrentSchematicRenameHistory(validated.operationId) : currentSchematicRenameOperationCoordinator.run(validated)) };
    }
    return bridgeGate.run(async () => {
      if (currentSchematicRenameOperationCoordinator === undefined) {
        if (validated.action !== "baseline-begin" || currentDisposableOpenCoordinator === undefined) {
          throw new Error("Schematic rename requires this facade's existing retained disposable opening and operation coordinator; journals cannot reconstruct ownership.");
        }
        currentSchematicRenameOperationCoordinator = new CurrentSchematicRenameOperationCoordinator(engine, currentDisposableOpenCoordinator);
      }
      return { result: await currentSchematicRenameOperationCoordinator.run(validated) };
    });
  }));
}

if (facadeToolRegistered(facadeMode, "easyeda_control_project_schematic_rename")) {
  const inputSchema = z.object({ request: z.unknown().pipe(currentSchematicOperationRequestSchema),
    expectedFingerprint: privateFingerprintSchema.optional() }).strict();
  server.registerTool("easyeda_control_project_schematic_rename", {
    title: "Rename one ordinary project-local schematic container",
    description: "Original-owner ordinary-purpose SCH-container title lifecycle. Query offline project-schematic-operation/project-schematic-operation-validate first. open seals the exact rename target/title plus supported startup, metadata and complete child projection from the managed pre-navigation checkpoint. Legacy confirmDisposableProject:true is optional for old journals; omission stays omitted and false refuses. The separate disposable route keeps its required confirmations and scope. Initial opening requires this facade's retained ordinary launch, empty editor, exact registered local path/hash and checkpoint-member PCB. Opening and normal closure can persist or migrate data. Separate operation and opening IDs retain one original owner through baseline, aged actor/clock proof, exactly one title write, complete closed SQL effect, cache-excluded fresh metadata/peer/child-roster verification and final closed SQL equality. Use returned nextPhase and exact effect acknowledgments; advance-batch accepts two through four adjacent explicit steps and stops on failure or pending observation without retry. No unqualified startup opt-in, replacement target/title, caller code, explicit Save, prompt choice, force close, inverse, restoration or generic writer. Inspect lost replies without replaying writes, navigation, closure or scratch processes. Journals cannot recreate ownership; only offered original-owner cleanup is available after failure. Completion requires renameVerified and nextPhase completed. Canvas/connectivity and delayed subscriber completion remain unverified. Installed203733 passed this ordinary-purpose title-only lifecycle on a disposable fixture, including batching, complete closed SQL, fresh metadata/peer/child-roster and both AST readback, final normal closure and unchanged full SQL. Historical validation does not grant current-invocation authority or qualify another project history.",
    inputSchema, outputSchema: currentSymbolOperationToolOutputSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  }, guarded(async ({ request, expectedFingerprint }: z.output<typeof inputSchema>) => {
    const validated = currentSchematicOperationRequestSchema.parse(request);
    if (validated.action !== "open" && expectedFingerprint !== undefined) {
      throw new Error("Only initial opening accepts a fingerprint; continuation retains its original authority.");
    }
    // Read-only inspection cannot allocate a process owner or wait behind its
    // Own pending mutation. Purpose is checked even for historical journals.
    if (validated.action === "inspect") {
      return { result: await (currentSchematicRenameOperationCoordinator === undefined
        ? inspectCurrentSchematicRenameHistory(validated.operationId, CURRENT_SCHEMATIC_OPERATION_PURPOSE)
        : currentSchematicRenameOperationCoordinator.runOrdinary(validated, expectedFingerprint)) };
    }
    if (validated.action === "inspect-opening") {
      return { result: await (currentSchematicRenameOperationCoordinator === undefined
        ? inspectCurrentSchematicOpeningHistory(validated.operationId)
        : currentSchematicRenameOperationCoordinator.runOrdinary(validated)) };
    }
    return bridgeGate.run(async () => {
      if (currentSchematicRenameOperationCoordinator === undefined && validated.action !== "open") {
        throw new Error("Ordinary schematic rename requires this facade's retained original opener and coordinator; journals cannot reconstruct ownership.");
      }
      if (currentDisposableOpenCoordinator === undefined) {
        const assetsRoot = process.env["EASYEDA_ASSETS_ROOT"];
        const assertOwner = (): void => {
          if (closedSymbolIndexReservation !== undefined || scheduledShutdown !== undefined || ordinaryLaunchRuntime === undefined ||
              windowsRuntime !== ordinaryLaunchRuntime || ordinaryLaunchRuntime.status().state !== "owned" || assetsRoot === undefined ||
              process.env["EASYEDA_ASSETS_ROOT"] !== assetsRoot) {
            throw new Error("Ordinary schematic rename requires this facade's unchanged retained ordinary launch.");
          }
        };
        currentDisposableOpenCoordinator = new CurrentDisposableOpenCoordinator({ engine, assertOwner,
          runtime: (): WindowsControlRuntime => { assertOwner(); return ownedWindowsRuntime(); } });
      }
      currentSchematicRenameOperationCoordinator ??= new CurrentSchematicRenameOperationCoordinator(engine, currentDisposableOpenCoordinator);
      return { result: await currentSchematicRenameOperationCoordinator.runOrdinary(validated, expectedFingerprint) };
    });
  }));
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
