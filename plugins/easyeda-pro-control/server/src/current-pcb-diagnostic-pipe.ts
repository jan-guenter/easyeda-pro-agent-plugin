/** Internal helper-owned Chromium diagnostic pipe for validation only.
 * Byte streams are not process/Job authority,
 * and discovery replies are not frame, worker, script or CAD admission.
 *
 * Electron 41.2.1 requests Browser::Quit on debugging-pipe disconnect. This
 * class therefore NEVER ends, destroys or closes either stream, even on error.
 * The original native owner must retain both pipe handles until its reviewed
 * application-closure policy permits release. No TCP endpoint is supported. */
/* oxlint-disable max-classes-per-file -- Three fixed-purpose facades share a private byte-transport core without exposing a caller-selectable purpose or budget. */
/* oxlint-disable import/max-dependencies -- Fixed transport composes independent model/common/worker/actor grammars without merging their source or authority boundaries. */
import { currentProjectSaveProducerGuardWire } from "./current-project-save-producer-guard-wire.ts";
import type { CurrentProjectSaveProducerGuardCommand } from "./current-project-save-producer-guard-protocol.ts";
import { CURRENT_PCB_COMPONENT_SPATIAL_PROFILE } from "./current-pcb-component-spatial-profile.ts";
import { currentPcbComponentSpatialWire } from "./current-pcb-component-spatial-protocol.ts";
import { assertOriginalGeneratedComponentFixtureTarget } from "./managed-component-fixture-initial-sql.ts";
import type { QualifiedGeneratedComponentFixtureTarget } from "./managed-component-fixture-initial-sql.ts";
import { GENERATED_COMPONENT_FIXTURE_REGISTRATION_FUNCTION } from "./managed-component-fixture-registration-program.ts";
import { currentProjectStructureTransportWire } from "./current-project-structure-transport-wire.ts";
import type { CurrentProjectStructureTransportPurpose } from "./current-project-structure-transport-wire.ts";
import type { CurrentProjectStructureTransportCommand } from "./current-project-structure-transport-protocol.ts";
import { currentSchematicDisplayAccessorWire } from "./current-schematic-display-accessor-wire.ts";
import type { CurrentSchematicDisplayAccessorCommand } from "./current-schematic-display-accessor-protocol.ts";
import { currentSchematicDisplayWorkerWire } from "./current-schematic-display-worker-wire.ts";
import type { CurrentSchematicDisplayWorkerCommand } from "./current-schematic-display-worker-wire.ts";
import { CURRENT_SCHEMATIC_DISPLAY_WORKER_PARENT_PARAMS, CURRENT_SCHEMATIC_DISPLAY_WORKER_RUNNING_PARAMS } from "./current-schematic-display-worker-bootstrap-protocol.ts";
import { currentSchematicDisplayNativeCommand } from "./current-schematic-display-native-command.ts";
import type { CurrentSchematicDisplayNativeCommand, CurrentSchematicDisplayNativePhase } from "./current-schematic-display-native-command.ts";
import { CURRENT_SCHEMATIC_DISPLAY_DISCOVERY_METHODS, CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE } from "./current-schematic-display-write-native-profile.ts";
import { currentPcbViaClockWire } from "./current-pcb-via-clock-wire.ts";
import type { CurrentPcbViaClockCommand } from "./current-pcb-via-clock-protocol.ts";
import type { CurrentPcbViaClockRealm } from "./current-pcb-via-clock-origin.ts";
import { CURRENT_PCB_DIAGNOSTIC_TRANSPORT_LIMITS as TRANSPORT } from "./current-pcb-diagnostic-transport-limits.ts";
import type { Readable, Writable } from "node:stream";
import { CURRENT_RENDERER_CAPTURE_PARAMS, DIAGNOSTIC_REQUEST_LIMIT, DIAGNOSTIC_SESSION_BYTES, DIAGNOSTIC_SOURCE_FRAME_BYTES, DIAGNOSTIC_WORKER_ATTACH_PARAMS, diagnosticArcShapes209Params, diagnosticExact, diagnosticExtendedPrimitives209Params, diagnosticGeneratedFixtureRegistrationParams, diagnosticImageShapes209Params, diagnosticLayers209Params, diagnosticOpeningParams, diagnosticPadShapes209Params, diagnosticPcbOpeningParams, diagnosticPouredShapes209Params, diagnosticPrimitives209Params, diagnosticSelectionRelations209Params, diagnosticToken, diagnosticVisual209Params, diagnosticWorkerEvaluationParams } from "./current-pcb-diagnostic-protocol.ts";
import type { DiagnosticCommand, DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { assertOriginalGeneratedPcbReadTarget as assertOriginalGeneratedFixtureTarget } from "./managed-pcb-fixture-read-target.ts";
import type { QualifiedGeneratedPcbReadTarget as QualifiedGeneratedFixtureTarget } from "./managed-pcb-fixture-read-target.ts";
import type { CurrentPcb209VisualOperation } from "./current-pcb-209-visual-actions.ts";
import type { CurrentPcbDiagnosticOpeningPhase } from "./current-pcb-diagnostic-opening.ts";
import type { CurrentPcbDiagnosticModelCommand } from "./current-pcb-diagnostic-model-runner.ts";
import type { CurrentPcbCommonBaselineCommand } from "./current-pcb-common-baseline-runner.ts";
import { CURRENT_PCB_COMMON_GRAPH_BYTES } from "./current-pcb-common-graph.ts";
import type { CurrentPcbDiagnosticPcbOpeningPhase } from "./current-pcb-diagnostic-pcb-opening.ts";
import { CURRENT_PCB_STRING_PRECREATE_PHASES, CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT } from "./current-pcb-string-commands.ts";
import type { CurrentPcbStringPrecreateCommand, CurrentPcbStringPrecreatePhase } from "./current-pcb-string-commands.ts";
import { CURRENT_PCB_STRING_WORKER_PRODUCER_SEQUENCE } from "./current-pcb-string-worker-producer-commands.ts";
import type { CurrentPcbStringWorkerProducerCommand } from "./current-pcb-string-worker-producer-commands.ts";
import { CURRENT_PCB_STRING_ACTOR_CLOCK_PHASES } from "./current-pcb-string-actor-clock.ts";
import type { CurrentPcbStringActorClockCommand } from "./current-pcb-string-actor-clock.ts";
import { CURRENT_PCB_STRING_MOVE_SEQUENCE } from "./current-pcb-string-move-runner.ts";
import type { CurrentPcbStringMoveCommand } from "./current-pcb-string-move-runner.ts";
import { currentFootprintSavedCacheWire } from "./current-footprint-saved-cache-protocol.ts";
import type { CurrentFootprintSavedCacheCommand } from "./current-footprint-saved-cache-protocol.ts";
import { currentFootprintSavedCacheAccessorWire } from "./current-footprint-saved-cache-accessor-protocol.ts";
import type { CurrentFootprintSavedCacheAccessorCommand } from "./current-footprint-saved-cache-accessor-protocol.ts";
import { currentFootprintSavedCacheHeldWire } from "./current-footprint-saved-cache-held-wire.ts";
import type { CurrentFootprintSavedCacheHeldCommand } from "./current-footprint-saved-cache-held-protocol.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS } from "./current-footprint-saved-cache-held-profile.ts";
import { CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_METHODS, CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_PROFILE as HELD_DIAGNOSTIC,
  currentFootprintHeldCacheDiagnosticBindingSchema } from "./current-footprint-held-cache-diagnostic-profile.ts";
import type { CurrentFootprintHeldCacheDiagnosticBinding } from "./current-footprint-held-cache-diagnostic-profile.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PCB_SPATIAL_DISCOVERY_METHODS, CURRENT_PCB_SPATIAL_PROFILE, CURRENT_PCB_SPATIAL_REQUEST_DERIVATION, currentPcbSpatialBindingSchema } from "./current-pcb-spatial-profile.ts";
import type { CurrentPcbSpatialBinding } from "./current-pcb-spatial-profile.ts";
import { currentSchematicDisplayClockWire } from "./current-schematic-display-clock-wire.ts";
import type { CurrentSchematicDisplayClockCommand } from "./current-schematic-display-clock-protocol.ts";
import type { CurrentSchematicDisplayClockRealm } from "./current-schematic-display-clock-origin.ts";
import { currentPcbViaWorkerWire } from "./current-pcb-via-worker-wire.ts";
import type { CurrentPcbViaWorkerCommand } from "./current-pcb-via-worker-wire.ts";
import { CURRENT_PCB_VIA_WORKER_PARENT_PARAMS, CURRENT_PCB_VIA_WORKER_RUNNING_PARAMS } from "./current-pcb-via-worker-bootstrap-protocol.ts";
import { currentPcbViaWriteCommand } from "./current-pcb-via-write-protocol.ts";
import type { CurrentPcbViaObservationPhase, CurrentPcbViaSdkPropertiesCommand, CurrentPcbViaSpatialCommand, CurrentPcbViaWriteCommand } from "./current-pcb-via-write-protocol.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import { currentPcbViaWriteProgramArguments } from "./current-pcb-via-write-program.ts";
import type { CurrentPcbViaWriteStage } from "./current-pcb-via-write-program.ts";
import { CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE } from "./current-pcb-via-write-native-profile.ts";
import { currentPcbSpatialWire } from "./current-pcb-spatial-protocol.ts";
import type { CurrentPcbSpatialWireCommand } from "./current-pcb-spatial-protocol.ts";
import type { CurrentPcbSpatialCaptureCommand } from "./current-pcb-spatial-capture-runner.ts";

export { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
export { heldCacheDiagnosticNativeRequest } from "./current-pcb-diagnostic-protocol.ts";

const MAX_FRAME_BYTES = TRANSPORT.maximumFrameBytes;
// A fixed reader returns JSON text inside a CDP string. Escaped quotes and
// Backslashes can double its524288-byte text plus the bounded CDP envelope.
const COMMON_FRAME_BYTES = 2 * CURRENT_PCB_COMMON_GRAPH_BYTES + 1024;
const MAX_CHUNK_BYTES = MAX_FRAME_BYTES + 1;
const DEADLINE_MS = 5000;
type Reply = Readonly<Record<string, unknown>>;
type Failure = "attachment" | "input" | "output" | "eof" | "closed" | "framing" | "reply" | "remote-error" | "deadline" | "budget";
type FailureReason = Failure | "empty-frame" | "nonobject-frame" | "reply-unsolicited" | "reply-duplicate" | "reply-id" | "reply-envelope" | "reply-result" |
  "event-budget-or-handler" | "event-envelope" | "event-session" | "worker-attachment" | "worker-handler" | "event-callback" | "unsolicited-data" |
  "trailing-reply-data" | "attachment-result" | "worker-discovery-result";
type ViaClockWireCommand = CurrentPcbViaClockCommand & Readonly<{ viaClockCommand: true; viaClockRealm: CurrentPcbViaClockRealm }>;
type ViaWorkerParentCommand = Readonly<{ viaWorkerParentPhase: "arm"; method: "Target.setAutoAttach"; params: typeof CURRENT_PCB_VIA_WORKER_PARENT_PARAMS }> |
  Readonly<{ viaWorkerParentPhase: "running"; method: "Target.setAutoAttach"; params: typeof CURRENT_PCB_VIA_WORKER_RUNNING_PARAMS }>;
type SchematicWorkerParentCommand = Readonly<{ schematicWorkerParentPhase: "arm"; method: "Target.setAutoAttach"; params: typeof CURRENT_SCHEMATIC_DISPLAY_WORKER_PARENT_PARAMS }> | Readonly<{ schematicWorkerParentPhase: "running"; method: "Target.setAutoAttach"; params: typeof CURRENT_SCHEMATIC_DISPLAY_WORKER_RUNNING_PARAMS }>;
type ProducerGuardWireCommand = CurrentProjectSaveProducerGuardCommand & Readonly<{ producerGuardCommand: true }>;
type StructureTransportWireCommand = CurrentProjectStructureTransportCommand & Readonly<{ structureTransportCommand: true }>;
type RequestPhase = "producer-guard" | "structure-transport" | "schematic-accessor" | "schematic-clock" | "schematic-worker" | "schematic-parent-arm" | "schematic-parent-running" | `schematic-display-${CurrentSchematicDisplayNativePhase}` | "via-clock" | "via-worker" | "via-parent-arm" | "via-parent-running" | "generated-fixture-register" | "renderer-capture209" | "discovery" | "frame-owner" | "worker-discovery" | "worker-state" |
  `project-${CurrentPcbDiagnosticOpeningPhase}` | `pcb-${CurrentPcbDiagnosticPcbOpeningPhase}` | "layers209" | "primitives209" | "extended-primitives209" | "selection-relations209" | "visual209" | "pad-shapes209" | "image-shapes209" | "arc-shapes209" | "poured-shapes209" |
  `model-${CurrentPcbDiagnosticModelCommand["modelPhase"]}` | `string-${CurrentPcbStringPrecreatePhase}` |
  `common-${CurrentPcbCommonBaselineCommand["commonPhase"]}` | `worker-producer-${CurrentPcbStringWorkerProducerCommand["workerProducerPhase"]}` |
  `actor-clock-${CurrentPcbStringActorClockCommand["actorClockPhase"]}` | `move-${CurrentPcbStringMoveCommand["movePhase"]}` |
  `saved-cache-${CurrentFootprintSavedCacheCommand["cacheNativePhase"]}` |
  `saved-accessor-${CurrentFootprintSavedCacheAccessorCommand["cacheAccessorPhase"]}` |
  `held-cache-${CurrentFootprintSavedCacheHeldCommand["heldCachePhase"]}` | `via-sdk-${CurrentPcbViaWriteStage}` | `via-spatial-${CurrentPcbViaObservationPhase}-${CurrentPcbSpatialCaptureCommand["spatialPhase"]}` | `spatial-${CurrentPcbSpatialCaptureCommand["spatialPhase"]}`;
const HELD_CACHE_PHASES = ["capture", "array-properties", "constructor-properties", "match-properties", "getter-properties", "recheck-before-getter",
  "retain-receiver", "queue-first", "recheck-first", "queue-fresh", "recheck-fresh"] as const;
const REQUEST_METHODS = [
  "Browser.getVersion", "Target.getTargets", "Target.attachToTarget", "Page.enable", "Page.getFrameTree", "Page.captureScreenshot", "Runtime.enable",
  "Debugger.enable", "Debugger.getScriptSource", "DOM.getFrameOwner", "DOM.describeNode", "Target.setAutoAttach",
  "Runtime.evaluate", "Runtime.callFunctionOn", "Runtime.getProperties", "Runtime.releaseObjectGroup",
] as const satisfies readonly DiagnosticCommand["method"][];
const REQUEST_PHASES = [
  "spatial-bindings-component", "spatial-read-component",
  "renderer-capture209",
  "discovery", "frame-owner", "worker-discovery", "worker-state", "project-preflight", "project-open-project", "generated-fixture-register",
  "pcb-preflight", "pcb-open-document", "pcb-observe", "layers209", "primitives209", "extended-primitives209", "selection-relations209", "visual209", "pad-shapes209", "image-shapes209", "arc-shapes209", "poured-shapes209", "model-wrapper", "model-properties", "model-handler",
  "model-constructors-diagnostic", "model-constructors-precreate",
  "model-teardrop-callbacks", "model-teardrop-owner",
  "model-snapshot", "model-pending", "model-raw-strings", "model-root-inventory", "model-release",
  "model-snapshot-v2", "model-pending-v2",
  ...CURRENT_PCB_STRING_PRECREATE_PHASES.map(phase => `string-${phase}` as const),
  "common-wrapper", "common-properties", "common-handler", "common-constructors", "common-presentation-seed", "common-rules-seed",
  "common-preference-seed", "common-packet-advance", "common-packet-read", "common-packet-result", "common-assets", "common-metadata", "common-release",
  ...CURRENT_PCB_STRING_WORKER_PRODUCER_SEQUENCE.map(phase => `worker-producer-${phase}` as const),
  ...CURRENT_PCB_STRING_ACTOR_CLOCK_PHASES.map(phase => `actor-clock-${phase}` as const),
  ...CURRENT_PCB_STRING_MOVE_SEQUENCE.map(phase => `move-${phase}` as const),
  ...(["capture", "array-properties", "constructor-properties", "match-properties", "recheck", "release"] as const).map(phase => `saved-cache-${phase}` as const),
  ...(["capture", "array-properties", "constructor-properties", "match-properties", "getter-properties", "recheck", "release"] as const).map(phase => `saved-accessor-${phase}` as const),
  ...([...HELD_CACHE_PHASES, "release"] as const).map(phase => `held-cache-${phase}` as const),
  ...(["wrapper", "properties", "handler", "bindings", "bindings-track", "bindings-arc", "functions", "read", "read-track", "read-arc", "release"] as const).map(phase => `spatial-${phase}` as const),
] as const satisfies readonly RequestPhase[];
const EVENT_KINDS = [
  "Target.attachedToTarget", "Target.detachedFromTarget", "Target.targetCreated", "Target.targetDestroyed",
  "Target.targetInfoChanged", "Target.targetCrashed", "Inspector.detached", "Inspector.targetCrashed",
  "Runtime.executionContextCreated", "Runtime.executionContextDestroyed", "Runtime.executionContextsCleared",
  "Runtime.consoleAPICalled", "Runtime.exceptionThrown", "Runtime.exceptionRevoked", "Runtime.inspectRequested",
  "Runtime.bindingCalled", "Debugger.scriptParsed", "Debugger.scriptFailedToParse", "Debugger.paused", "Debugger.resumed",
  "Debugger.breakpointResolved", "Debugger.globalObjectCleared",
  "Page.navigatedWithinDocument", "Page.frameAttached", "Page.frameDetached", "Page.frameNavigated",
  "Page.frameStartedLoading", "Page.frameStoppedLoading", "Page.frameStartedNavigating", "Page.frameRequestedNavigation",
  "Page.frameScheduledNavigation", "Page.frameClearedScheduledNavigation", "Page.frameSubtreeWillBeDetached",
  "Page.documentOpened", "Page.windowOpen", "Page.javascriptDialogOpening", "Page.javascriptDialogClosed",
  "Page.backForwardCacheNotUsed", "Page.interstitialShown", "Page.interstitialHidden",
  "Page.compilationCacheProduced", "Page.downloadWillBegin", "Page.downloadProgress",
  "Page.screencastFrame", "Page.screencastVisibilityChanged",
  "Page.domContentEventFired", "Page.loadEventFired", "Page.frameResized", "Page.lifecycleEvent",
  "DOM.documentUpdated", "DOM.setChildNodes", "DOM.childNodeInserted", "DOM.childNodeRemoved",
  "DOM.childNodeCountUpdated", "DOM.attributeModified", "DOM.attributeRemoved", "DOM.characterDataModified",
] as const;
type EventKind = typeof EVENT_KINDS[number] | "unknown";
type RequestObservation = Readonly<{ id: number; method: DiagnosticCommand["method"] | "unknown"; phase: RequestPhase | "unknown" }>;
export interface CurrentPcbDiagnosticFailureObservation {
  readonly schema: "easyeda-pro-control.pcb-diagnostic-pipe-failure.v1";
  readonly code: Failure;
  readonly reason: FailureReason;
  readonly request: RequestObservation | null;
  readonly requestPending: boolean;
  readonly eventKind: EventKind | null;
  readonly executionAuthorized: false;
  readonly dispatchAbsenceVerified: false;
}
function eventKind(value: unknown): EventKind {
  return EVENT_KINDS.find(kind => kind === value) ?? "unknown";
}
interface Pending {
  readonly id: number;
  readonly resolve: (value: Reply) => void;
  readonly reject: (error: Error) => void;
  readonly timer: ReturnType<typeof setTimeout>;
  readonly sessionId: string | null;
  readonly source: boolean;
  readonly common: boolean;
  readonly heldCache: boolean;
  written: boolean;
  reply: Reply | null;
}

export interface CurrentPcbWorkerStartupPipeHandoff {
  readonly sessionId: string;
  readonly nextRequestId: number;
  readonly receivedBytes: number;
  readonly eventCount: number;
  readonly eventBytes: number;
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function failureError(code: Failure): Error { return new Error(`PCB_DIAGNOSTIC_PIPE_${code.toUpperCase()}`); }

/** Fixed browser discovery, one page attachment and bounded direct workers.
 * One immutable worker read is supported. There is no generic send or caller
 * JavaScript, pause, resume,
 * reconnect, retry or pipe-close method. Construction acquires nothing; the
 * caller retains this object before start attaches fallible event listeners. */
class CurrentPcbFixedPipeCore {
  readonly #input: Readable;
  readonly #output: Writable;
  readonly #stringPurpose: boolean;
  readonly #startupPurpose: boolean;
  readonly #combinedPurpose: boolean;
  readonly #heldCacheDiagnosticPurpose: boolean;
  readonly #viaPurpose: boolean;
  readonly #schematicDisplayPurpose: boolean;
  readonly #viaSpatial = { before: { binding: null as CurrentPcbSpatialBinding | null, stage: 0, read: false, released: false }, after: { binding: null as CurrentPcbSpatialBinding | null, stage: 0, read: false, released: false } };
  #schematicWorkerEvent: ((event: DiagnosticEvent) => void) | null = null;
  #schematicWorkerSession: string | null = null;
  #schematicParentRunning = false;
  readonly #schematicWaitingWorkers = new Set<string>();
  #viaProperties = 0;
  #viaWorkerEvent: ((event: DiagnosticEvent) => void) | null = null;
  #viaWorkerSession: string | null = null;
  #schematicStructureTransportContext: string | null = null;
  #viaStructureTransportContext: string | null = null;
  #schematicClockBinding: Readonly<{ workerContext: string; uiSdk: string }> | null = null;
  #viaClockBinding: Readonly<{ workerContext: string; uiSdk: string }> | null = null;
  #viaParentRunning = false;
  readonly #viaWaitingWorkers = new Set<string>();
  readonly #viaStages = new Set<CurrentPcbViaWriteStage>();
  readonly #spatialPurpose: boolean;
  readonly #componentSpatialPurpose: boolean;
  readonly #spatialSources = new Set<string>();
  #spatialBinding: CurrentPcbSpatialBinding | null = null;
  #spatialStage = 0;
  #spatialReads = 0;
  #spatialVariant: "via" | "line-via" | "arc-line-via" | "pad-point" = "via";
  #spatialReleaseAttempted = false;
  readonly #observeEventBytes: ((bytes: number) => void) | null;
  #savedCacheSession: string | null = null;
  #savedCacheStep = 0;
  #savedCacheReleaseAttempted = false;
  #savedCacheReleased = false;
  #savedAccessorSession: string | null = null;
  #savedAccessorStep = 0;
  #savedAccessorReleaseAttempted = false;
  #savedAccessorReleased = false;
  #heldCacheBinding: CurrentFootprintHeldCacheDiagnosticBinding | null = null;
  #heldCacheSourceSeen = false;
  #heldCacheStep = 0;
  #heldCacheTuple: string | null = null;
  #heldCacheReleaseAttempted = false;
  #heldCacheNormal = 0;
  #heldCacheCleanup = 0;
  #handedOff = false;
  #started = false;
  #failure: Failure | null = null;
  #failureObservation: CurrentPcbDiagnosticFailureObservation | null = null;
  #lastRequest: RequestObservation | null = null;
  #pending: Pending | null = null;
  // Only the new Via birth may retain its sole opening/SDK Save response while one
  // Fixed observer request uses the same original stream and ID allocator.
  #viaRetainedPending: Pending | null = null;
  #nextId = 1;
  #receivedBytes = 0;
  #buffer = Buffer.alloc(4096);
  #used = 0;
  #inputEnded = false;
  #inputClosed = false;
  #outputClosed = false;
  #released = false;
  #sessionId: string | null = null;
  #event: ((event: DiagnosticEvent) => void) | null = null;
  #eventCount = 0;
  #eventBytes = 0;
  #workerEvent: ((event: DiagnosticEvent) => void) | null = null;
  readonly #workerSessions = new Map<string, string>();
  #workerDiscoverySettled = false;
  #selectedWorkerSession: string | null = null;

  public constructor(input: Readable, output: Writable, purpose: "diagnostic" | "string-precreate" | "worker-startup" | "combined-discovery" | "forward-discovery" | "forward-saved-discovery" | "held-cache-diagnostic" | "pcb-spatial209" | "pcb-component-spatial209" | "pcb-via-write209" | "schematic-display-write209",
    observeEventBytes: ((bytes: number) => void) | null = null) {
    if ((purpose === "forward-discovery" || purpose === "forward-saved-discovery" || purpose === "held-cache-diagnostic") !== (observeEventBytes !== null) || observeEventBytes !== null && typeof observeEventBytes !== "function") { throw new Error("PCB_DIAGNOSTIC_FORWARD_ACCOUNTING"); }
    this.#observeEventBytes = observeEventBytes;
    this.#input = input; this.#output = output; this.#stringPurpose = purpose === "string-precreate";
    this.#startupPurpose = purpose === "worker-startup" || purpose === "combined-discovery" || purpose === "forward-discovery" || purpose === "forward-saved-discovery";
    this.#combinedPurpose = purpose === "combined-discovery" || purpose === "forward-discovery";
    this.#heldCacheDiagnosticPurpose = purpose === "held-cache-diagnostic";
    this.#componentSpatialPurpose = purpose === "pcb-component-spatial209";
    this.#spatialPurpose = purpose === "pcb-spatial209"; this.#viaPurpose = purpose === "pcb-via-write209"; this.#schematicDisplayPurpose = purpose === "schematic-display-write209";
  }

  /** One clean transfer of the original counter and receive budgets. Listeners
   * remain attached but dormant until their ordinary closed-stream cleanup. */
  protected handoffStartupPipe(): CurrentPcbWorkerStartupPipeHandoff {
    if (!this.#startupPurpose || this.#handedOff || !this.#started || this.#released || this.#failure !== null ||
        this.#sessionId === null || this.#event === null || this.#workerEvent !== null || this.#pending !== null || this.#used !== 0 ||
        this.#inputEnded || this.#inputClosed || this.#outputClosed || this.#output.writableLength !== 0 || this.#input.readableLength !== 0 ||
        this.#combinedPurpose && (this.#savedCacheStep > 0 && !this.#savedCacheReleased || this.#savedAccessorStep > 0 && !this.#savedAccessorReleased)) {
      throw new Error("PCB_DIAGNOSTIC_PIPE_HANDOFF_UNAVAILABLE");
    }
    this.#handedOff = true;
    return Object.freeze({ sessionId: this.#sessionId, nextRequestId: this.#nextId,
      receivedBytes: this.#receivedBytes, eventCount: this.#eventCount, eventBytes: this.#eventBytes });
  }

  public start(): void {
    if (this.#started) { throw new Error("PCB_DIAGNOSTIC_PIPE_START_CONSUMED"); }
    this.#started = true;
    try {
      // Error handlers precede data delivery. A partial attachment failure is
      // Retained on this original object; it never triggers a disconnect.
      this.#input.on("error", this.#inputError);
      this.#output.on("error", this.#outputError);
      this.#input.on("end", this.#inputEnd);
      this.#input.on("close", this.#inputClose);
      this.#output.on("close", this.#outputClose);
      if (this.#input.destroyed || this.#input.readableEnded || this.#output.destroyed || this.#output.writableEnded) {
        throw new Error("PCB_DIAGNOSTIC_PIPE_ALREADY_ENDED");
      }
      this.#input.on("data", this.#data);
    } catch { this.#fail("attachment"); throw failureError("attachment"); }
  }

  public getVersion(): Promise<Reply> { return this.#request({ id: this.#nextId, method: "Browser.getVersion" }); }
  /** Seal only the new diagnostic's owner-selected realm/target after its UI
   * script reply. Actual pinned-source/context admission belongs to the genuine
   * retained owner; this local data seal cannot manufacture that admission. */
  protected bindHeldCacheDiagnostic(input: CurrentFootprintHeldCacheDiagnosticBinding): void {
    if (!this.#heldCacheDiagnosticPurpose || !this.#started || this.#released || this.#failure !== null ||
        this.#heldCacheBinding !== null || this.#pending !== null || this.#used !== 0 || !this.#heldCacheSourceSeen ||
        this.#nextId - 1 > HELD_DIAGNOSTIC.discoveryRequests) { throw new Error("PCB_DIAGNOSTIC_HELD_CACHE_BINDING"); }
    const binding = freezeDeep(currentFootprintHeldCacheDiagnosticBindingSchema.parse(captureCurrentPcbStringClockReply(input).value));
    if (binding.sessionId !== this.#sessionId) { throw new Error("PCB_DIAGNOSTIC_HELD_CACHE_SESSION"); }
    this.#heldCacheBinding = binding;
  }
  /** Execute the exact once-only held phases in the original attached UI.
   * Each attempt consumes before write, including original cleanup release. */
  // oxlint-disable-next-line eslint/require-await -- Preserve the original request promise while converting all pre-dispatch fixed-purpose guards to API rejections.
  protected async heldCacheDiagnostic(command: CurrentFootprintSavedCacheHeldCommand): Promise<Reply> {
    const binding = this.#heldCacheBinding;
    if (!this.#heldCacheDiagnosticPurpose || binding === null || this.#heldCacheReleaseAttempted) { throw new Error("PCB_DIAGNOSTIC_HELD_CACHE_PURPOSE"); }
    const wire = currentFootprintSavedCacheHeldWire(command, this.#nextId);
    const fixed = wire.command, phase = fixed.heldCachePhase;
    if (fixed.sessionId !== binding.sessionId || (phase === "release" ? this.#heldCacheStep === 0 : HELD_CACHE_PHASES[this.#heldCacheStep] !== phase)) { throw new Error("PCB_DIAGNOSTIC_HELD_CACHE_SEQUENCE"); }
    if (phase === "capture") {
      if (fixed.params.uniqueContextId !== binding.uniqueContextId) { throw new Error("PCB_DIAGNOSTIC_HELD_CACHE_CONTEXT"); }
    } else if (phase !== "release" && !["array-properties", "constructor-properties", "match-properties", "getter-properties"].includes(phase) &&
      fixed.params.objectId !== this.#heldCacheTuple) { throw new Error("PCB_DIAGNOSTIC_HELD_CACHE_TUPLE"); }
    if ((phase === "queue-first" || phase === "queue-fresh") && (fixed.params.arguments[0].value !== binding.projectUuid ||
      fixed.params.arguments[1].value !== binding.branchUuid)) { throw new Error("PCB_DIAGNOSTIC_HELD_CACHE_TARGET"); }
    if (phase === "release") { this.#heldCacheReleaseAttempted = true; } else { this.#heldCacheStep += 1; }
    if (phase === "array-properties") { this.#heldCacheTuple = fixed.params.objectId; }
    return this.#request(fixed, `held-cache-${phase}`);
  }
  protected async savedCacheNative(command: CurrentFootprintSavedCacheCommand): Promise<Reply> {
    if (!this.#combinedPurpose || this.#sessionId === null || this.#handedOff || this.#savedCacheReleaseAttempted ||
      command.sessionId !== this.#sessionId) { throw new Error("PCB_DIAGNOSTIC_PIPE_SAVED_CACHE_PURPOSE"); }
    const wire = currentFootprintSavedCacheWire(command, this.#nextId);
    const phase = wire.command.cacheNativePhase;
    const sequence = ["capture", "array-properties", "constructor-properties", "match-properties", "recheck"] as const;
    if (phase === "release" ? this.#savedCacheStep === 0 : sequence[this.#savedCacheStep] !== phase) {
      throw new Error("PCB_DIAGNOSTIC_PIPE_SAVED_CACHE_SEQUENCE");
    }
    if (this.#savedCacheSession !== null && this.#savedCacheSession !== command.sessionId) { throw new Error("PCB_DIAGNOSTIC_PIPE_SAVED_CACHE_SESSION"); }
    this.#savedCacheSession = command.sessionId;
    if (phase === "release") { this.#savedCacheReleaseAttempted = true; } else { this.#savedCacheStep += 1; }
    const reply = await this.#request(wire.command, `saved-cache-${phase}`);
    if (phase === "release") {
      if (!diagnosticExact(reply, [])) { this.#fail("reply"); throw failureError("reply"); }
      this.#savedCacheReleased = true;
    }
    return reply;
  }
  /** Consume the next accessor phase only for the original attached Combined session.
   * Permit one release after a started attempt, require its exact empty reply, and
   * block handoff while its group is unreleased. Lost replies grant no phase retry.
   */
  protected async savedCacheAccessor(command: CurrentFootprintSavedCacheAccessorCommand): Promise<Reply> {
    if (!this.#combinedPurpose || this.#sessionId === null || this.#handedOff || this.#savedAccessorReleaseAttempted ||
      command.sessionId !== this.#sessionId) { throw new Error("PCB_DIAGNOSTIC_PIPE_SAVED_CACHE_PURPOSE"); }
    const wire = currentFootprintSavedCacheAccessorWire(command, this.#nextId);
    const phase = wire.command.cacheAccessorPhase;
    const sequence = ["capture", "array-properties", "constructor-properties", "match-properties", "getter-properties", "recheck"] as const;
    if (phase === "release" ? this.#savedAccessorStep === 0 : sequence[this.#savedAccessorStep] !== phase) {
      throw new Error("PCB_DIAGNOSTIC_PIPE_SAVED_CACHE_SEQUENCE");
    }
    if (this.#savedAccessorSession !== null && this.#savedAccessorSession !== command.sessionId) { throw new Error("PCB_DIAGNOSTIC_PIPE_SAVED_CACHE_SESSION"); }
    this.#savedAccessorSession = command.sessionId;
    if (phase === "release") { this.#savedAccessorReleaseAttempted = true; } else { this.#savedAccessorStep += 1; }
    const reply = await this.#request(wire.command, `saved-accessor-${phase}`);
    if (phase === "release") {
      if (!diagnosticExact(reply, [])) { this.#fail("reply"); throw failureError("reply"); }
      this.#savedAccessorReleased = true;
    }
    return reply;
  }
  public getTargets(): Promise<Reply> { return this.#request({ id: this.#nextId, method: "Target.getTargets" }); }
  public async attachTarget(targetId: string, event: (value: DiagnosticEvent) => void): Promise<string> {
    if (this.#event !== null || !diagnosticToken(targetId)) { throw new Error("PCB_DIAGNOSTIC_PIPE_ATTACH_INPUT"); }
    this.#event = event;
    const reply = await this.#request({ id: this.#nextId, method: "Target.attachToTarget", params: { targetId, flatten: true } });
    if (!diagnosticExact(reply, ["sessionId"]) || !diagnosticToken(reply["sessionId"])) { this.#fail("reply", "attachment-result"); throw failureError("reply"); }
    this.#sessionId = reply["sessionId"]; return this.#sessionId;
  }
  public enablePage(): Promise<Reply> { return this.#sessionRequest("Page.enable"); }
  public getFrameTree(): Promise<Reply> { return this.#sessionRequest("Page.getFrameTree"); }
  public enableRuntime(): Promise<Reply> { return this.#sessionRequest("Runtime.enable"); }
  public enableDebugger(): Promise<Reply> {
    if (this.#sessionId === null) { return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_NO_SESSION")); }
    return this.#request({ id: this.#nextId, method: "Debugger.enable", params: { maxScriptsCacheSize: DIAGNOSTIC_SOURCE_FRAME_BYTES }, sessionId: this.#sessionId });
  }
  public async getScriptSource(scriptId: string): Promise<Reply> {
    if (this.#sessionId === null || !diagnosticToken(scriptId)) { throw new Error("PCB_DIAGNOSTIC_PIPE_SCRIPT_INPUT"); }
    const result = await this.#request({ id: this.#nextId, method: "Debugger.getScriptSource", params: { scriptId }, sessionId: this.#sessionId });
    if ((this.#spatialPurpose || this.#componentSpatialPurpose || this.#viaPurpose) && typeof result["scriptSource"] === "string") { this.#spatialSources.add(scriptId); }
    return result;
  }
  /** Only the new birth can seal its already observed original PCB realm.
   * The owner must separately qualify complete source and reprove every await. */
  protected bindSpatialCommand(input: CurrentPcbSpatialBinding): void {
    if (!(this.#spatialPurpose || this.#componentSpatialPurpose) || !this.#started || this.#released || this.#handedOff || this.#failure !== null ||
      this.#sessionId === null || this.#workerEvent !== null || this.#pending !== null || this.#used !== 0 || this.#spatialBinding !== null) {
      throw new Error("PCB_SPATIAL_PIPE_BINDING");
    }
    const binding = freezeDeep(currentPcbSpatialBindingSchema.parse(captureCurrentPcbStringClockReply(input).value));
    if (!this.#spatialSources.has(binding.scriptId)) { throw new Error("PCB_SPATIAL_PIPE_SOURCE"); }
    this.#spatialBinding = binding;
  }
  protected assertSpatialWorkflowCapacity(): void {
    if (!(this.#spatialPurpose || this.#componentSpatialPurpose) || !this.#started || this.#released || this.#handedOff || this.#failure !== null || this.#pending !== null ||
      this.#spatialBinding !== null || this.#spatialStage !== 0 || this.#nextId !== 1) { throw new Error("PCB_SPATIAL_PIPE_WORKFLOW_CAPACITY"); }
    if (CURRENT_PCB_SPATIAL_PROFILE.requestLimit < CURRENT_PCB_SPATIAL_REQUEST_DERIVATION.fullWorkflow) { throw new Error("PCB_SPATIAL_PIPE_WORKFLOW_BUDGET"); }
  }
  // oxlint-disable-next-line eslint/require-await -- Convert strict pre-dispatch purpose/sequence guards to rejected promises without wrapping the retained request completion.
  protected async observeSpatialCommand(input: CurrentPcbSpatialCaptureCommand): Promise<Reply> {
    const binding = this.#spatialBinding;
    if (!this.#spatialPurpose || binding === null || this.#sessionId === null || this.#spatialReleaseAttempted || this.#workerEvent !== null) {
      throw new Error("PCB_SPATIAL_PIPE_PURPOSE");
    }
    const fixed = currentPcbSpatialWire(input, this.#nextId, this.#sessionId), phase = fixed.command.spatialPhase;
    if (phase === "release") {
      if (this.#spatialStage === 0) { throw new Error("PCB_SPATIAL_PIPE_SEQUENCE"); }
      this.#spatialReleaseAttempted = true;
    } else {
      if (this.#nextId >= CURRENT_PCB_SPATIAL_PROFILE.requestLimit) { throw new Error("PCB_SPATIAL_PIPE_CLEANUP_RESERVE"); }
      if (phase === "properties") {
        if (this.#spatialStage < 1 || this.#spatialStage > 4) { throw new Error("PCB_SPATIAL_PIPE_SEQUENCE"); }
      } else if (phase === "read" || phase === "read-track" || phase === "read-arc" || phase === "read-pad") {
        const variant = { "read-arc": "arc-line-via", "read-track": "line-via", read: "via", "read-pad": "pad-point" }[phase];
        const limit = { "arc-line-via": 6, "line-via": 15, via: CURRENT_PCB_SPATIAL_PROFILE.maximumReads, "pad-point": 16 }[this.#spatialVariant];
        if (variant !== this.#spatialVariant || this.#spatialStage < 4 || this.#spatialStage > 5 || this.#spatialReads >= limit) {
          throw new Error("PCB_SPATIAL_PIPE_READ_SEQUENCE");
        }
        this.#spatialReads += 1; this.#spatialStage = 5;
      } else {
        const step = phase === "bindings-track" || phase === "bindings-arc" || phase === "bindings-pad" ? "bindings" : phase;
        if ((["wrapper", "handler", "bindings", "functions"] as const)[this.#spatialStage] !== step) {
          throw new Error("PCB_SPATIAL_PIPE_SEQUENCE");
        }
        if (phase === "wrapper" && fixed.command.params.uniqueContextId !== binding.uniqueContextId) { throw new Error("PCB_SPATIAL_PIPE_CONTEXT"); }
        if (phase === "bindings-track") { this.#spatialVariant = "line-via"; }
        if (phase === "bindings-arc") { this.#spatialVariant = "arc-line-via"; }
        if (phase === "bindings-pad") { this.#spatialVariant = "pad-point"; }
        this.#spatialStage += 1;
      }
    }
    return this.#request(fixed.command, `spatial-${phase}`);
  }
  /** Component birth has its own finite phase grammar and419-ID allocator. */
  // oxlint-disable-next-line eslint/require-await -- Preserve exact request Promise and convert pre-dispatch guards to rejections.
  protected async observeComponentSpatialCommand(input: CurrentPcbSpatialCaptureCommand): Promise<Reply> {
    const binding = this.#spatialBinding;
    if (!this.#componentSpatialPurpose || binding === null || this.#sessionId === null || this.#spatialReleaseAttempted || this.#workerEvent !== null) { throw new Error("PCB_COMPONENT_PIPE_PURPOSE"); }
    const fixed = currentPcbComponentSpatialWire(input, this.#nextId, this.#sessionId), phase = fixed.command.spatialPhase;
    if (phase === "release") {
      if (this.#spatialStage === 0) { throw new Error("PCB_COMPONENT_PIPE_SEQUENCE"); } this.#spatialReleaseAttempted = true;
    } else {
      if (this.#nextId > CURRENT_PCB_COMPONENT_SPATIAL_PROFILE.normalRequestLimit) { throw new Error("PCB_COMPONENT_PIPE_CLEANUP_RESERVE"); }
      if (phase === "properties") { if (this.#spatialStage < 1 || this.#spatialStage > 4) { throw new Error("PCB_COMPONENT_PIPE_SEQUENCE"); } }
      else if (phase === "read-component") {
        if (this.#spatialStage < 4 || this.#spatialStage > 5 || this.#spatialReads >= 16) { throw new Error("PCB_COMPONENT_PIPE_READ_SEQUENCE"); }
        this.#spatialReads += 1; this.#spatialStage = 5;
      } else {
        if (["wrapper", "handler", "bindings-component", "functions"][this.#spatialStage] !== phase) { throw new Error("PCB_COMPONENT_PIPE_SEQUENCE"); }
        if (phase === "wrapper" && fixed.command.params.uniqueContextId !== binding.uniqueContextId) { throw new Error("PCB_COMPONENT_PIPE_CONTEXT"); }
        this.#spatialStage += 1;
      }
    }
    return this.#request(fixed.command, `spatial-${phase}`);
  }
  protected bindViaSpatialCommand(phase: CurrentPcbViaObservationPhase, input: CurrentPcbSpatialBinding): void {
    const state = this.#viaSpatial[phase];
    if (!this.#viaPurpose || state.binding !== null || this.#pending !== null || this.#sessionId === null || this.#failure !== null ||
      phase === "after" && !this.#viaSpatial.before.released) { throw new Error("PCB_VIA_SCENE_BINDING"); }
    const binding = freezeDeep(currentPcbSpatialBindingSchema.parse(captureCurrentPcbStringClockReply(input).value));
    if (!this.#spatialSources.has(binding.scriptId)) { throw new Error("PCB_VIA_SCENE_SOURCE"); }
    state.binding = binding;
  }
  protected observeViaSpatialCommand(phase: CurrentPcbViaObservationPhase, input: CurrentPcbSpatialCaptureCommand): Promise<Reply> {
    const state = this.#viaSpatial[phase];
    const binding = state.binding;
    if (!this.#viaPurpose || binding === null || this.#sessionId === null || state.released) { throw new Error("PCB_VIA_SCENE_PURPOSE"); }
    const wire = currentPcbSpatialWire(input, 1, this.#sessionId);
    const command = wire.command, step = command.spatialPhase;
    if (step === "release") { if (state.stage === 0) { throw new Error("PCB_VIA_SCENE_SEQUENCE"); } state.released = true; }
    else if (step === "properties") { if (state.stage < 1 || state.stage > 4) { throw new Error("PCB_VIA_SCENE_SEQUENCE"); } }
    else if (step === "read-track") { if (state.stage !== 4 || state.read) { throw new Error("PCB_VIA_SCENE_SEQUENCE"); } state.read = true; }
    else {
      if ((["wrapper", "handler", "bindings-track", "functions"] as const)[state.stage] !== step ||
        step === "wrapper" && command.params.uniqueContextId !== binding.uniqueContextId) { throw new Error("PCB_VIA_SCENE_SEQUENCE"); }
      state.stage += 1;
    }
    return this.#request({ ...command, id: this.#nextId, viaObservationPhase: phase }, `via-spatial-${phase}-${step}`);
  }
  protected enableViaWorkerDiscoveryCommand(event: (value: DiagnosticEvent) => void): Promise<Reply> {
    if (!this.#viaPurpose || this.#sessionId === null || this.#viaWorkerEvent !== null || this.#workerEvent !== null || this.#pending !== null || this.#viaRetainedPending !== null) { throw new Error("PCB_VIA_PARENT_ARM"); }
    this.#viaWorkerEvent = event;
    return this.#request({ id: this.#nextId, viaWorkerParentPhase: "arm", method: "Target.setAutoAttach", params: CURRENT_PCB_VIA_WORKER_PARENT_PARAMS,
      sessionId: this.#sessionId }, "via-parent-arm");
  }
  protected configureViaWorkerRunningCommand(): Promise<Reply> {
    if (!this.#viaPurpose || this.#sessionId === null || this.#viaWorkerSession === null || this.#viaWorkerEvent === null || this.#viaParentRunning) { throw new Error("PCB_VIA_PARENT_RUNNING"); }
    this.#viaParentRunning = true;
    return this.#request({ id: this.#nextId, viaWorkerParentPhase: "running", method: "Target.setAutoAttach", params: CURRENT_PCB_VIA_WORKER_RUNNING_PARAMS,
      sessionId: this.#sessionId }, "via-parent-running");
  }
  protected bindViaWorkerCommand(sessionId: string, targetId: string): void {
    if (!this.#viaPurpose || this.#viaWorkerSession !== null || this.#viaWorkerEvent === null || this.#workerSessions.get(sessionId) !== targetId ||
      !this.#viaWaitingWorkers.has(sessionId) || sessionId === this.#sessionId) { throw new Error("PCB_VIA_WORKER_ORIGINAL_ATTACHMENT"); }
    this.#viaWorkerSession = sessionId;
  }
  protected observeViaWorkerCommand(input: CurrentPcbViaWorkerCommand): Promise<Reply> {
    if (!this.#viaPurpose || this.#viaWorkerSession === null || this.#workerSessions.get(this.#viaWorkerSession) === undefined) { throw new Error("PCB_VIA_WORKER_ORIGINAL_SESSION"); }
    const wire = currentPcbViaWorkerWire(input, this.#nextId);
    return this.#request({ id: this.#nextId, ...wire.command, viaWorkerCommand: true, sessionId: this.#viaWorkerSession }, "via-worker");
  }
  protected enableSchematicDisplayWorkerDiscoveryCommand(event: (value: DiagnosticEvent) => void): Promise<Reply> {
    if (!this.#schematicDisplayPurpose || this.#sessionId === null || this.#schematicWorkerEvent !== null || this.#workerEvent !== null || this.#pending !== null || this.#viaRetainedPending !== null) { throw new Error("SCHEMATIC_DISPLAY_PARENT_ARM"); }
    this.#schematicWorkerEvent = event;
    return this.#request({ id: this.#nextId, schematicWorkerParentPhase: "arm", method: "Target.setAutoAttach", params: CURRENT_SCHEMATIC_DISPLAY_WORKER_PARENT_PARAMS,
      sessionId: this.#sessionId }, "schematic-parent-arm");
  }
  protected configureSchematicDisplayWorkerRunningCommand(): Promise<Reply> {
    if (!this.#schematicDisplayPurpose || this.#sessionId === null || this.#schematicWorkerSession === null || this.#schematicWorkerEvent === null || this.#schematicParentRunning) { throw new Error("SCHEMATIC_DISPLAY_PARENT_RUNNING"); }
    this.#schematicParentRunning = true;
    return this.#request({ id: this.#nextId, schematicWorkerParentPhase: "running", method: "Target.setAutoAttach", params: CURRENT_SCHEMATIC_DISPLAY_WORKER_RUNNING_PARAMS,
      sessionId: this.#sessionId }, "schematic-parent-running");
  }
  protected bindSchematicDisplayWorkerCommand(sessionId: string, targetId: string): void {
    if (!this.#schematicDisplayPurpose || this.#schematicWorkerSession !== null || this.#schematicWorkerEvent === null || this.#workerSessions.get(sessionId) !== targetId ||
      !this.#schematicWaitingWorkers.has(sessionId) || sessionId === this.#sessionId) { throw new Error("SCHEMATIC_DISPLAY_WORKER_ORIGINAL_ATTACHMENT"); }
    this.#schematicWorkerSession = sessionId;
  }
  protected observeSchematicDisplayWorkerCommand(input: CurrentSchematicDisplayWorkerCommand): Promise<Reply> {
    if (!this.#schematicDisplayPurpose || this.#schematicWorkerSession === null || this.#workerSessions.get(this.#schematicWorkerSession) === undefined) { throw new Error("SCHEMATIC_DISPLAY_WORKER_ORIGINAL_SESSION"); }
    const wire = currentSchematicDisplayWorkerWire(input, this.#nextId);
    return this.#request({ id: this.#nextId, ...wire.command, schematicWorkerCommand: true, sessionId: this.#schematicWorkerSession }, "schematic-worker");
  }
  protected observeProducerGuardCommand(purpose: "via" | "schematic", input: CurrentProjectSaveProducerGuardCommand): Promise<Reply> {
    const sessionId = purpose === "via" ? this.#viaWorkerSession : this.#schematicWorkerSession;
    if (sessionId === null || (purpose === "via" ? !this.#viaPurpose || this.#viaParentRunning : !this.#schematicDisplayPurpose || this.#schematicParentRunning)) { throw new Error("PROJECT_SAVE_PRODUCER_GUARD_ORIGINAL_SOURCE"); }
    const wire = currentProjectSaveProducerGuardWire(input, this.#nextId, purpose);
    return this.#request({ id: this.#nextId, ...wire.command, producerGuardCommand: true, sessionId }, "producer-guard");
  }
  protected bindStructureTransportCommand(purpose: CurrentProjectStructureTransportPurpose, context: string): void {
    if (!diagnosticToken(context)) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_CONTEXT"); }
    if (purpose === "via") { if (!this.#viaPurpose || this.#viaWorkerSession === null || this.#viaParentRunning || this.#viaStructureTransportContext !== null) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_VIA_BINDING"); } this.#viaStructureTransportContext = context; }
    else { if (!this.#schematicDisplayPurpose || this.#schematicWorkerSession === null || this.#schematicParentRunning || this.#schematicStructureTransportContext !== null) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_SCH_BINDING"); } this.#schematicStructureTransportContext = context; }
  }
  protected observeStructureTransportCommand(purpose: CurrentProjectStructureTransportPurpose, input: CurrentProjectStructureTransportCommand): Promise<Reply> {
    let context: string | null; let sessionId: string | null;
    if (purpose === "via") { if (!this.#viaPurpose) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_VIA_PURPOSE"); } context = this.#viaStructureTransportContext; sessionId = this.#viaWorkerSession; }
    else { if (!this.#schematicDisplayPurpose) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_SCH_PURPOSE"); } context = this.#schematicStructureTransportContext; sessionId = this.#schematicWorkerSession; }
    if (context === null || sessionId === null) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_ORIGINAL_BINDING"); }
    const wire = currentProjectStructureTransportWire(input, this.#nextId, purpose); const command = wire.command;
    if (command.phase === "project-structure-transport-capture" && command.params.uniqueContextId !== context) { throw new Error("PROJECT_STRUCTURE_TRANSPORT_ORIGINAL_CONTEXT"); }
    return this.#request({ id: this.#nextId, ...command, structureTransportCommand: true, sessionId }, "structure-transport");
  }
  protected observeSchematicDisplayAccessorCommand(input: CurrentSchematicDisplayAccessorCommand): Promise<Reply> {
    if (!this.#schematicDisplayPurpose || this.#sessionId === null) { throw new Error("SCHEMATIC_DISPLAY_ACCESSOR_ORIGINAL_PARENT"); }
    const wire = currentSchematicDisplayAccessorWire(input, this.#nextId);
    return this.#request({ id: this.#nextId, ...wire.command, schematicAccessorCommand: true, sessionId: this.#sessionId }, "schematic-accessor");
  }
  protected bindSchematicDisplayClockCommand(workerContext: string, uiSdk: string): void {
    if (!this.#schematicDisplayPurpose || this.#schematicClockBinding !== null || !this.#schematicParentRunning || !diagnosticToken(workerContext) || !diagnosticToken(uiSdk)) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_BINDING"); }
    this.#schematicClockBinding = Object.freeze({ workerContext, uiSdk });
  }
  protected observeSchematicDisplayClockCommand(input: CurrentSchematicDisplayClockCommand, realm: CurrentSchematicDisplayClockRealm): Promise<Reply> {
    const binding = this.#schematicClockBinding; if (!this.#schematicDisplayPurpose || binding === null || this.#sessionId === null || this.#schematicWorkerSession === null) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_ORIGINAL_BINDING"); }
    const wire = currentSchematicDisplayClockWire(input, realm, this.#nextId); const command = wire.command;
    if (command.phase === "schematic-clock-worker" && command.params.uniqueContextId !== binding.workerContext || command.phase === "schematic-clock-registration" && command.params.objectId !== binding.uiSdk) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_INITIAL_RECEIVER"); }
    return this.#request({ id: this.#nextId, ...command, schematicClockCommand: true, schematicClockRealm: realm, sessionId: realm === "worker" ? this.#schematicWorkerSession : this.#sessionId }, "schematic-clock");
  }
  protected bindViaClockCommand(workerContext: string, uiSdk: string): void {
    if (!this.#viaPurpose || this.#viaClockBinding !== null || !this.#viaParentRunning || !this.#viaStages.has("create") || !diagnosticToken(workerContext) || !diagnosticToken(uiSdk)) { throw new Error("PCB_VIA_CLOCK_BINDING"); }
    this.#viaClockBinding = Object.freeze({ workerContext, uiSdk });
  }
  protected observeViaClockCommand(input: CurrentPcbViaClockCommand, realm: CurrentPcbViaClockRealm): Promise<Reply> {
    const binding = this.#viaClockBinding; if (!this.#viaPurpose || binding === null || this.#sessionId === null || this.#viaWorkerSession === null) { throw new Error("PCB_VIA_CLOCK_ORIGINAL_BINDING"); }
    const wire = currentPcbViaClockWire(input, realm, this.#nextId); const command = wire.command;
    if (command.phase === "via-clock-worker" && command.params.uniqueContextId !== binding.workerContext || command.phase === "via-clock-registration" && command.params.objectId !== binding.uiSdk) { throw new Error("PCB_VIA_CLOCK_INITIAL_RECEIVER"); }
    return this.#request({ id: this.#nextId, ...command, viaClockCommand: true, viaClockRealm: realm, sessionId: realm === "worker" ? this.#viaWorkerSession : this.#sessionId }, "via-clock");
  }
  protected observeViaSdkPropertiesCommand(objectId: string): Promise<Reply> {
    if (!this.#viaPurpose || !this.#viaStages.has("capture") || this.#viaStages.size !== 1 || this.#viaProperties >= 3 || this.#sessionId === null || !diagnosticToken(objectId)) { throw new Error("PCB_VIA_SDK_PROPERTIES"); }
    this.#viaProperties += 1;
    return this.#request({ id: this.#nextId, viaSdkProperties: true, method: "Runtime.getProperties", params: { objectId, ownProperties: true,
      accessorPropertiesOnly: false, generatePreview: false }, sessionId: this.#sessionId });
  }
  protected observeSchematicDisplayCommand(phase: CurrentSchematicDisplayNativePhase, binding: string, target?: unknown, operation?: unknown): Promise<Reply> {
    if (!this.#schematicDisplayPurpose || this.#sessionId === null) { throw new Error("SCHEMATIC_DISPLAY_ORIGINAL_PARENT"); }
    const command = currentSchematicDisplayNativeCommand(phase, binding, target, operation);
    return this.#request({ id: this.#nextId, ...command, sessionId: this.#sessionId }, `schematic-display-${phase}`);
  }
  protected observeViaStageCommand(stage: CurrentPcbViaWriteStage, binding: string, plan: CurrentPcbViaWritePlan): Promise<Reply> {
    if (!this.#viaPurpose || this.#sessionId === null || this.#viaStages.has(stage) || stage !== "capture" && !this.#viaStages.has("capture")) { throw new Error("PCB_VIA_SDK_SEQUENCE"); }
    const command = currentPcbViaWriteCommand(stage, binding, currentPcbViaWriteProgramArguments(plan));
    this.#viaStages.add(stage);
    return this.#request({ id: this.#nextId, ...command, sessionId: this.#sessionId }, `via-sdk-${stage}`);
  }
  /** Original newly observed child frame only. The owner/context validates the
   * reciprocal DOM node; no caller selectors or recursive DOM traversal. */
  public getFrameOwner(frameId: string): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null && !this.#stringPurpose || !diagnosticToken(frameId)) {
      return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_FRAME_OWNER_INPUT"));
    }
    return this.#request({ id: this.#nextId, method: "DOM.getFrameOwner", params: { frameId }, sessionId: this.#sessionId }, "frame-owner");
  }
  public describeFrameOwner(backendNodeId: number): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null && !this.#stringPurpose || !Number.isSafeInteger(backendNodeId) ||
        backendNodeId < 1 || backendNodeId > 2_147_483_647) { return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_FRAME_OWNER_INPUT")); }
    return this.#request({ id: this.#nextId, method: "DOM.describeNode",
      params: { backendNodeId, depth: 0, pierce: false }, sessionId: this.#sessionId }, "frame-owner");
  }
  /** One fixed direct-child discovery on the original page. No recursive
   * autoattachment, debugger waiting, detached adoption or caller target URL. */
  public async enableWorkerDiscovery(event: (value: DiagnosticEvent) => void): Promise<Reply> {
    if (this.#viaPurpose || this.#schematicDisplayPurpose || this.#sessionId === null || this.#workerEvent !== null || this.#pending !== null) {
      throw new Error("PCB_DIAGNOSTIC_PIPE_WORKER_DISCOVERY_INPUT");
    }
    this.#workerEvent = event;
    const reply = await this.#request({ id: this.#nextId, method: "Target.setAutoAttach",
      params: DIAGNOSTIC_WORKER_ATTACH_PARAMS, sessionId: this.#sessionId }, "worker-discovery");
    if (!diagnosticExact(reply, [])) { this.#fail("reply", "worker-discovery-result"); throw failureError("reply"); }
    this.#workerDiscoverySettled = true; return reply;
  }
  public selectWorkerSession(sessionId: string): void {
    if (this.#viaPurpose || this.#failure !== null || !this.#workerDiscoverySettled || this.#selectedWorkerSession !== null ||
        !this.#workerSessions.has(sessionId) || this.#pending !== null) { throw new Error("PCB_DIAGNOSTIC_PIPE_WORKER_SELECTION"); }
    this.#selectedWorkerSession = sessionId;
  }
  public enableWorkerRuntime(): Promise<Reply> {
    return this.#request({ id: this.#nextId, method: "Runtime.enable", params: {}, sessionId: this.#workerSession() });
  }
  public enableWorkerDebugger(): Promise<Reply> {
    return this.#request({ id: this.#nextId, method: "Debugger.enable",
      params: { maxScriptsCacheSize: DIAGNOSTIC_SOURCE_FRAME_BYTES }, sessionId: this.#workerSession() });
  }
  public getWorkerScriptSource(scriptId: string): Promise<Reply> {
    if (!diagnosticToken(scriptId)) { return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_SCRIPT_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Debugger.getScriptSource", params: { scriptId }, sessionId: this.#workerSession() });
  }
  /** The caller must first admit the selected worker's complete source and
   * original context. This primitive never accepts an expression or options. */
  public observeWorkerState(uniqueContextId: string): Promise<Reply> {
    return this.#request({ id: this.#nextId, method: "Runtime.evaluate",
      params: diagnosticWorkerEvaluationParams(uniqueContextId), sessionId: this.#workerSession() }, "worker-state");
  }
  /** The native helper reconstructs this exact fixed service call. No caller
   * function/options; source, checkpoint and one-shot admission live in owner. */
  public observeProjectOpening(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget,
    phase: CurrentPcbDiagnosticOpeningPhase): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_OPENING_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn",
      params: diagnosticOpeningParams(uniqueContextId, target, phase), sessionId: this.#sessionId }, `project-${phase}`);
  }
  public registerGeneratedFixture(uniqueContextId: string, qualified: QualifiedGeneratedFixtureTarget): Promise<Reply> {
    if (this.#componentSpatialPurpose) { return Promise.reject(new Error("PCB_COMPONENT_OLD_REGISTRATION_REFUSED")); }
    assertOriginalGeneratedFixtureTarget(qualified);
    if (this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_GENERATED_REGISTRATION_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn",
      params: diagnosticGeneratedFixtureRegistrationParams(uniqueContextId, qualified.target), sessionId: this.#sessionId }, "generated-fixture-register");
  }
  public registerGeneratedComponentFixture(uniqueContextId: string, qualified: QualifiedGeneratedComponentFixtureTarget): Promise<Reply> {
    assertOriginalGeneratedComponentFixtureTarget(qualified);
    if (!this.#componentSpatialPurpose || this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("PCB_COMPONENT_REGISTRATION_PURPOSE")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn", params: {
      ...diagnosticGeneratedFixtureRegistrationParams(uniqueContextId, qualified.target), functionDeclaration: GENERATED_COMPONENT_FIXTURE_REGISTRATION_FUNCTION,
    }, sessionId: this.#sessionId }, "generated-fixture-register");
  }
  public observeModel(command: CurrentPcbDiagnosticModelCommand): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null && !this.#stringPurpose) { return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_MODEL_INPUT")); }
    if (command.modelPhase === "constructors-diagnostic" && this.#stringPurpose ||
        command.modelPhase === "constructors-precreate" && !this.#stringPurpose) { return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_MODEL_INPUT")); }
    const { modelPhase: _modelPhase, ...wire } = command;
    return this.#request({ id: this.#nextId, ...wire, sessionId: this.#sessionId }, `model-${command.modelPhase}`);
  }
  /** Only the separate fixed String facade can use these pre-create programs.
   * Its selected child and page sessions stay independent and immutable. */
  public observeStringPrecreate(command: CurrentPcbStringPrecreateCommand): Promise<Reply> {
    if (!this.#stringPurpose || this.#sessionId === null || this.#selectedWorkerSession === null) {
      return Promise.reject(new Error("PCB_STRING_PIPE_PURPOSE"));
    }
    const { stringPhase, ...wire } = command;
    return this.#request({ id: this.#nextId, ...wire,
      sessionId: stringPhase === "worker-association" ? this.#workerSession() : this.#sessionId }, `string-${stringPhase}`);
  }
  /** The separate String facade observes common state on its original page.
   * Constructor/reader programs and remote groups are fixed by the adapter. */
  protected observeCommonBaselineCommand(command: CurrentPcbCommonBaselineCommand): Promise<Reply> {
    if (!this.#stringPurpose || this.#sessionId === null || this.#selectedWorkerSession === null) {
      return Promise.reject(new Error("PCB_COMMON_PIPE_PURPOSE"));
    }
    const { commonPhase, ...wire } = command;
    return this.#request({ id: this.#nextId, ...wire, sessionId: this.#sessionId }, `common-${commonPhase}`);
  }
  protected observeWorkerProducerCommand(command: CurrentPcbStringWorkerProducerCommand): Promise<Reply> {
    if (!this.#stringPurpose || this.#sessionId === null || command.sessionId !== this.#workerSession()) {
      return Promise.reject(new Error("PCB_WORKER_PRODUCER_PIPE_PURPOSE"));
    }
    // The private tag distinguishes otherwise identical getProperties wire
    // Shapes; native reconstruction removes it before any Chromium dispatch.
    const { sessionId, ...wire } = command;
    return this.#request({ id: this.#nextId, ...wire, sessionId }, `worker-producer-${command.workerProducerPhase}`);
  }
  protected observeMoveCommand(command: CurrentPcbStringMoveCommand): Promise<Reply> {
    if (!this.#stringPurpose || this.#sessionId === null || this.#selectedWorkerSession === null || command.sessionId !== this.#sessionId) {
      return Promise.reject(new Error("PCB_MOVE_PIPE_PURPOSE"));
    }
    const { sessionId, ...wire } = command;
    return this.#request({ id: this.#nextId, ...wire, sessionId }, `move-${command.movePhase}`);
  }
  protected observeActorClockCommand(command: CurrentPcbStringActorClockCommand): Promise<Reply> {
    if (!this.#stringPurpose || this.#sessionId === null || this.#selectedWorkerSession === null) {
      return Promise.reject(new Error("PCB_ACTOR_CLOCK_PIPE_PURPOSE"));
    }
    return this.#request({ id: this.#nextId, ...command,
      sessionId: command.actorClockPhase === "worker" ? this.#workerSession() : this.#sessionId }, `actor-clock-${command.actorClockPhase}`);
  }
  public observePcbOpening(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget,
    phase: CurrentPcbDiagnosticPcbOpeningPhase): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_OPENING_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn",
      params: diagnosticPcbOpeningParams(uniqueContextId, target, phase), sessionId: this.#sessionId }, `pcb-${phase}`);
  }
  public observeLayers209(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("PCB209_LAYERS_PIPE_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn",
      params: diagnosticLayers209Params(uniqueContextId, target), sessionId: this.#sessionId }, "layers209");
  }
  public observePrimitives209(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("PCB209_PRIMITIVES_PIPE_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn",
      params: diagnosticPrimitives209Params(uniqueContextId, target), sessionId: this.#sessionId }, "primitives209");
  }
  public observeExtendedPrimitives209(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("PCB209_EXTENDED_PRIMITIVES_PIPE_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn",
      params: diagnosticExtendedPrimitives209Params(uniqueContextId, target), sessionId: this.#sessionId }, "extended-primitives209");
  }
  public observePadShapes209(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("PCB209_PAD_SHAPES_PIPE_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn",
      params: diagnosticPadShapes209Params(uniqueContextId, target), sessionId: this.#sessionId }, "pad-shapes209");
  }
  public observeImageShapes209(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("PCB209_IMAGE_SHAPES_PIPE_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn",
      params: diagnosticImageShapes209Params(uniqueContextId, target), sessionId: this.#sessionId }, "image-shapes209");
  }
  /** The owner serializes the complete shape stage. Its fixed worst case is
   * two parent and two ancillary checks on each side plus the native read.
   * Refuse before any stage dispatch; do not reset or expose the pipe counter. */
  public assertPcb209ShapeStageCapacity(): void {
    if (this.#stringPurpose || this.#startupPurpose || !this.#started || this.#released || this.#handedOff ||
        this.#sessionId === null || this.#pending !== null || this.#workerEvent !== null) {
      throw new Error("PCB209_SHAPE_STAGE_CAPACITY_UNAVAILABLE");
    }
    if (this.#failure !== null) { throw failureError(this.#failure); }
    if (DIAGNOSTIC_REQUEST_LIMIT - (this.#nextId - 1) < 9) { throw new Error("PCB209_SHAPE_STAGE_REQUEST_BUDGET"); }
  }
  /** Two fixed parent/ancillary brackets plus two active-PCB identity reads.
   * The native window message itself consumes no CDP request. */
  public assertPcb209WindowCaptureCapacity(): void {
    this.assertPcb209ShapeStageCapacity();
    if (DIAGNOSTIC_REQUEST_LIMIT - (this.#nextId - 1) < 10) { throw new Error("PCB209_WINDOW_CAPTURE_REQUEST_BUDGET"); }
  }
  /** The renderer capture adds one request to the ten existing identity
   * brackets. All eleven IDs remain in the original global pipe allocator. */
  public assertPcb209RendererCaptureCapacity(): void {
    this.assertPcb209ShapeStageCapacity();
    if (DIAGNOSTIC_REQUEST_LIMIT - (this.#nextId - 1) < 11) { throw new Error("PCB209_RENDERER_CAPTURE_REQUEST_BUDGET"); }
  }
  /** The born visual native encoder separately admits this fixed command.
   * No target, clip, flags or session can be supplied by an operation caller. */
  public captureRendererViewport209(): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("PCB209_RENDERER_CAPTURE_NO_PARENT")); }
    return this.#request({ id: this.#nextId, method: "Page.captureScreenshot", params: CURRENT_RENDERER_CAPTURE_PARAMS,
      sessionId: this.#sessionId }, "renderer-capture209");
  }
  public observeArcShapes209(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("PCB209_ARC_SHAPES_PIPE_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn",
      params: diagnosticArcShapes209Params(uniqueContextId, target), sessionId: this.#sessionId }, "arc-shapes209");
  }
  public observePouredShapes209(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("PCB209_POURED_SHAPES_PIPE_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn",
      params: diagnosticPouredShapes209Params(uniqueContextId, target), sessionId: this.#sessionId }, "poured-shapes209");
  }
  public observeSelectionRelations209(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget, componentIds: readonly string[]): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("PCB209_SELECTION_RELATIONS_PIPE_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn",
      params: diagnosticSelectionRelations209Params(uniqueContextId, target, componentIds), sessionId: this.#sessionId }, "selection-relations209");
  }
  public performVisual209(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget, operation: CurrentPcb209VisualOperation): Promise<Reply> {
    if (this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("PCB209_VISUAL_PIPE_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn",
      params: diagnosticVisual209Params(uniqueContextId, target, operation), sessionId: this.#sessionId }, "visual209");
  }
  #workerSession(): string {
    if (!this.#workerDiscoverySettled || this.#selectedWorkerSession === null ||
        !this.#workerSessions.has(this.#selectedWorkerSession)) { throw new Error("PCB_DIAGNOSTIC_PIPE_NO_WORKER"); }
    return this.#selectedWorkerSession;
  }
  #sessionRequest(method: "Page.enable" | "Page.getFrameTree" | "Runtime.enable"): Promise<Reply> {
    if (this.#sessionId === null) { return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_NO_SESSION")); }
    return this.#request({ id: this.#nextId, method, params: {}, sessionId: this.#sessionId });
  }

  public status(): Readonly<{ started: boolean; failure: Failure | null; failureObservation: CurrentPcbDiagnosticFailureObservation | null; pendingRequestId: number | null;
    requestCount: number; receivedBytes: number; inputEnded: boolean; inputClosed: boolean;
    outputClosed: boolean; listenersReleased: boolean; nativeOwnerVerified: false; executionAuthorized: false }> {
    return Object.freeze({ started: this.#started, failure: this.#failure, failureObservation: this.#failureObservation, pendingRequestId: this.#pending?.id ?? this.#viaRetainedPending?.id ?? null,
      requestCount: this.#nextId - 1, receivedBytes: this.#receivedBytes, inputEnded: this.#inputEnded,
      inputClosed: this.#inputClosed, outputClosed: this.#outputClosed, listenersReleased: this.#released,
      nativeOwnerVerified: false, executionAuthorized: false });
  }

  /** Remove this object's listeners only after BOTH streams have emitted close.
   * This observes transport closure, not original EasyEDA/Job termination.
   * It does not close a stream or authorize a fresh launch. */
  public releaseClosedListeners(): void {
    if (!this.#inputClosed || !this.#outputClosed || this.#pending !== null || this.#viaRetainedPending !== null) {
      throw new Error("PCB_DIAGNOSTIC_PIPE_RETAIN_ORIGINAL_STREAMS");
    }
    this.#input.removeListener("data", this.#data);
    this.#input.removeListener("error", this.#inputError);
    this.#input.removeListener("end", this.#inputEnd);
    this.#input.removeListener("close", this.#inputClose);
    this.#output.removeListener("error", this.#outputError);
    this.#output.removeListener("close", this.#outputClose);
    this.#released = true;
  }

  /** Reserve a bounded request ID, deadline and pending reply before writing bytes.
   * Reject unsupported purpose/phase combinations and concurrent requests; require
   * both the original write callback and matching reply before success. Timeout or
   * write ambiguity fails the pipe and never grants an automatic resend.
   */
  // oxlint-disable-next-line eslint/require-await -- Async converts pre-dispatch guards to rejected promises; native completion is callback-based.
  async #request(command: (ProducerGuardWireCommand & Readonly<{ id: number; sessionId: string }>) | (StructureTransportWireCommand & Readonly<{ id: number; sessionId: string }>) | ((CurrentSchematicDisplayAccessorCommand & Readonly<{ schematicAccessorCommand: true }>) & Readonly<{ id: number; sessionId: string }>) | ((CurrentSchematicDisplayClockCommand & Readonly<{ schematicClockCommand: true; schematicClockRealm: CurrentSchematicDisplayClockRealm }>) & Readonly<{ id: number; sessionId: string }>) | ((SchematicWorkerParentCommand | (CurrentSchematicDisplayWorkerCommand & Readonly<{ schematicWorkerCommand: true }>)) & Readonly<{ id: number; sessionId: string }>) | (CurrentSchematicDisplayNativeCommand & Readonly<{ id: number; sessionId: string }>) | DiagnosticCommand | CurrentPcbSpatialWireCommand | ((CurrentPcbViaWriteCommand | CurrentPcbViaSpatialCommand | CurrentPcbViaSdkPropertiesCommand | ViaWorkerParentCommand | ViaClockWireCommand | (CurrentPcbViaWorkerCommand & Readonly<{ viaWorkerCommand: true }>)) & Readonly<{ id: number; sessionId: string }>) | (CurrentFootprintSavedCacheCommand & Readonly<{ id: number }>) | (CurrentFootprintSavedCacheAccessorCommand & Readonly<{ id: number }>) | (CurrentFootprintSavedCacheHeldCommand & Readonly<{ id: number }>) | (Omit<CurrentPcbStringPrecreateCommand, "stringPhase"> &
    Readonly<{ id: number; sessionId: string }>), phase: RequestPhase = "discovery"): Promise<Reply> {
    if (!this.#started || this.#released || this.#handedOff) { throw new Error("PCB_DIAGNOSTIC_PIPE_NOT_STARTED"); }
    const spatial = (this.#spatialPurpose || this.#componentSpatialPurpose) && "spatialPhase" in command && phase.startsWith("spatial-");
    if ((this.#spatialPurpose || this.#componentSpatialPurpose) && !(spatial && command.method === "Runtime.releaseObjectGroup") &&
      this.#nextId > (this.#componentSpatialPurpose ? CURRENT_PCB_COMPONENT_SPATIAL_PROFILE.normalRequestLimit : CURRENT_PCB_SPATIAL_PROFILE.normalRequestLimit)) { throw new Error("PCB_SPATIAL_PIPE_CLEANUP_RESERVE"); }
    const spatialDiscovery = (phase === "discovery" || phase === "frame-owner") &&
      CURRENT_PCB_SPATIAL_DISCOVERY_METHODS.some(method => method === command.method);
    const spatialOpening = phase.startsWith("project-") || phase.startsWith("pcb-") || phase === "generated-fixture-register";
    if ((this.#spatialPurpose || this.#componentSpatialPurpose) && !spatial && (!spatialDiscovery && !spatialOpening ||
      this.#spatialBinding !== null && !spatialDiscovery && phase !== "pcb-observe")) {
      throw new Error("PCB_SPATIAL_PIPE_DISCOVERY_ONLY");
    }
    const heldCache = this.#heldCacheDiagnosticPurpose && "heldCachePhase" in command && phase.startsWith("held-cache-");
    if (this.#heldCacheDiagnosticPurpose && !heldCache && (this.#heldCacheBinding !== null ||
        phase !== "discovery" && phase !== "frame-owner" || !CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_METHODS.some(method => method === command.method) ||
        this.#nextId - 1 >= HELD_DIAGNOSTIC.discoveryRequests)) { throw new Error("PCB_DIAGNOSTIC_HELD_CACHE_DISCOVERY_ONLY"); }
    const savedCache = this.#combinedPurpose && (phase.startsWith("saved-cache-") && "cacheNativePhase" in command ||
      phase.startsWith("saved-accessor-") && "cacheAccessorPhase" in command);
    if (this.#startupPurpose && !savedCache && (phase !== "discovery" && phase !== "frame-owner" ||
        command.method === "Target.setAutoAttach" || command.method === "Runtime.evaluate" || command.method === "Runtime.callFunctionOn")) {
      throw new Error("PCB_DIAGNOSTIC_PIPE_STARTUP_DISCOVERY_ONLY");
    }
    if (this.#schematicDisplayPurpose && !("schematicDisplayPhase" in command && phase === `schematic-display-${command.schematicDisplayPhase}` || "schematicWorkerParentPhase" in command && ["schematic-parent-arm", "schematic-parent-running"].includes(phase) || "schematicWorkerCommand" in command && phase === "schematic-worker" || "schematicClockCommand" in command && phase === "schematic-clock" || "schematicAccessorCommand" in command && phase === "schematic-accessor" || "structureTransportCommand" in command && phase === "structure-transport" || "producerGuardCommand" in command && phase === "producer-guard") && !CURRENT_SCHEMATIC_DISPLAY_DISCOVERY_METHODS.includes(command.method)) { throw new Error("SCHEMATIC_DISPLAY_DISCOVERY_ONLY"); }
    if (this.#failure !== null) { throw failureError(this.#failure); }
    const viaRetained = this.#viaPurpose && ["via-sdk-save", "project-open-project", "pcb-open-document"].includes(phase) || this.#schematicDisplayPurpose && ["schematic-display-navigate", "schematic-display-save"].includes(phase);
    if (this.#viaRetainedPending !== null && (viaRetained || !(this.#viaPurpose && ["via-clock", "via-worker", "via-parent-running", "structure-transport", "producer-guard"].includes(phase) || this.#schematicDisplayPurpose && ["schematic-worker", "schematic-clock", "schematic-parent-running", "structure-transport", "producer-guard"].includes(phase) || phase === "discovery" && command.method === "Debugger.getScriptSource"))) { throw new Error("PCB_VIA_RETAINED_PENDING_SCOPE"); }
    if (this.#pending !== null) { throw new Error("PCB_DIAGNOSTIC_PIPE_REQUEST_PENDING"); }
    let limit = this.#stringPurpose ? CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT : DIAGNOSTIC_REQUEST_LIMIT;
    if (this.#heldCacheDiagnosticPurpose) { limit = HELD_DIAGNOSTIC.requestLimit; }
    if (this.#spatialPurpose) { limit = CURRENT_PCB_SPATIAL_PROFILE.requestLimit; }
    if (this.#componentSpatialPurpose) { limit = CURRENT_PCB_COMPONENT_SPATIAL_PROFILE.requestLimit; }
    if (this.#viaPurpose) { limit = CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE.renderer.total; }
    if (this.#schematicDisplayPurpose) { limit = CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE.renderer.total; }
    const heldCleanup = heldCache && command.method === "Runtime.releaseObjectGroup";
    if (this.#nextId > limit || this.#heldCacheDiagnosticPurpose && (heldCleanup ? this.#heldCacheCleanup >= HELD_DIAGNOSTIC.cleanupRequestLimit :
      this.#heldCacheNormal >= HELD_DIAGNOSTIC.normalRequestLimit)) {
      this.#fail("budget"); throw failureError("budget");
    }
    const id = this.#nextId; this.#nextId += 1;
    if (this.#heldCacheDiagnosticPurpose) { if (heldCleanup) { this.#heldCacheCleanup += 1; } else { this.#heldCacheNormal += 1; } }
    this.#lastRequest = Object.freeze({ id,
      method: REQUEST_METHODS.find(method => method === command.method) ?? "unknown",
      phase: REQUEST_PHASES.find(value => value === phase) ?? "unknown" });
    const deferred = Promise.withResolvers<Reply>();
    let deadline = DEADLINE_MS;
    if (command.method === "Debugger.getScriptSource") { deadline = 30_000; }
    else if (command.method === "Runtime.callFunctionOn" && command.params.awaitPromise) { deadline = 60_000; }
    if (heldCache) { deadline = CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS.requestMilliseconds; }
    const pending: Pending = { id, resolve: deferred.resolve, reject: deferred.reject,
      timer: setTimeout(() => { this.#fail("deadline"); }, deadline), written: false, reply: null,
      sessionId: "sessionId" in command ? command.sessionId : null, source: command.method === "Debugger.getScriptSource",
      common: ["common-packet-read", "common-packet-result", "common-assets", "common-metadata"].includes(phase), heldCache };
    if (viaRetained) { this.#viaRetainedPending = pending; } else { this.#pending = pending; }
    // Reserve before write, including synchronous throw and synchronous peer
    // Reply. A callback error still defeats an earlier received response.
    try {
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Writable completion is callback-based; an ACK does not replace the write callback.
      this.#output.write(Buffer.from(`${JSON.stringify(command)}\0`), (error): void => {
        if (error !== null && error !== undefined) { this.#fail("output"); }
        else if ((this.#pending === pending || this.#viaRetainedPending === pending) && this.#failure === null) { pending.written = true; this.#complete(); }
      });
    } catch { this.#fail("output"); }
    return deferred.promise;
  }

  #fail(code: Failure, reason: FailureReason = code, rejectedEvent: EventKind | null = null): void {
    // First failure only. Later cleanup and stream noise cannot replace it.
    // Fixed method/phase/event labels carry no received params or private text.
    this.#failureObservation ??= Object.freeze({
      schema: "easyeda-pro-control.pcb-diagnostic-pipe-failure.v1", code, reason, request: this.#lastRequest,
      requestPending: this.#pending !== null || this.#viaRetainedPending !== null, eventKind: rejectedEvent,
      executionAuthorized: false, dispatchAbsenceVerified: false,
    });
    this.#failure ??= code;
    this.#used = 0;
    const pending = this.#pending, savePending = this.#viaRetainedPending;
    this.#pending = null; this.#viaRetainedPending = null;
    for (const original of [pending, savePending]) { if (original !== null) { clearTimeout(original.timer); original.reject(failureError(this.#failure)); } }
  }

  #complete(): void {
    for (const pending of [this.#pending, this.#viaRetainedPending]) {
      if (this.#failure === null && pending !== null && pending.written && pending.reply !== null && this.#used === 0) {
        if (this.#heldCacheDiagnosticPurpose && pending.source && typeof pending.reply["scriptSource"] === "string") { this.#heldCacheSourceSeen = true; }
        if (this.#pending === pending) { this.#pending = null; } else { this.#viaRetainedPending = null; }
        clearTimeout(pending.timer); pending.resolve(pending.reply);
      }
    }
  }

  #frame(bytes: Buffer): void {
    if (bytes.length === 0) { this.#fail("reply", "empty-frame"); return; }
    let decoded: unknown;
    try { decoded = decodeCurrentPcbDiagnosticJson(bytes); }
    catch { this.#fail("framing"); return; }
    if (!record(decoded)) { this.#fail("reply", "nonobject-frame"); return; }
    if (Object.hasOwn(decoded, "method")) { this.#receiveEvent(decoded, bytes.length); return; }
    const pending = this.#viaRetainedPending?.id === decoded["id"] ? this.#viaRetainedPending : this.#pending;
    if (pending === null) { this.#fail("reply", "reply-unsolicited"); return; }
    let maximum = MAX_FRAME_BYTES; if (pending.source) { maximum = DIAGNOSTIC_SOURCE_FRAME_BYTES; } else if (pending.common) { maximum = COMMON_FRAME_BYTES; }
    if (bytes.length > maximum) { this.#fail("framing"); return; }
    if (pending.heldCache && bytes.length > HELD_DIAGNOSTIC.maximumHeldReplyFrameBytes) { this.#fail("framing"); return; }
    if (pending.reply !== null) { this.#fail("reply", "reply-duplicate"); return; }
    if (!Object.is(decoded["id"], pending.id)) { this.#fail("reply", "reply-id"); return; }
    const keys = Object.keys(decoded);
    const expectedKeys = pending.sessionId === null ? 2 : 3;
    if (keys.length !== expectedKeys || !keys.includes("id") || (keys.includes("result") === keys.includes("error")) ||
        (pending.sessionId === null ? keys.includes("sessionId") : decoded["sessionId"] !== pending.sessionId)) {
      this.#fail("reply", "reply-envelope"); return;
    }
    if (keys.includes("error")) { this.#fail("remote-error"); return; }
    const result = decoded["result"];
    if (!record(result)) { this.#fail("reply", "reply-result"); return; }
    // Keep the complete decoded result, including unknown fields. No target or
    // Script token is issued and no semantic completeness claim is made here.
    pending.reply = result;
  }

  #originalWorkerHandler(): ((event: DiagnosticEvent) => void) | null {
    if (this.#viaPurpose) { return this.#viaWorkerEvent; } if (this.#schematicDisplayPurpose) { return this.#schematicWorkerEvent; } return this.#workerEvent;
  }
  #receiveEvent(value: Record<string, unknown>, bytes: number): void {
    const method = value["method"], params = value["params"], sessionId = value["sessionId"];
    try { this.#observeEventBytes?.(bytes); }
    catch { this.#fail("reply", "event-budget-or-handler", eventKind(method)); return; }
    this.#eventCount += 1; this.#eventBytes += bytes;
    if (this.#event === null || bytes > MAX_FRAME_BYTES || this.#eventCount > TRANSPORT.maximumEventCount || this.#eventBytes > TRANSPORT.maximumEventBytes) {
      this.#fail("reply", "event-budget-or-handler", eventKind(method)); return;
    }
    if (typeof method !== "string" || !record(params) ||
        !diagnosticExact(value, sessionId === undefined ? ["method", "params"] : ["method", "params", "sessionId"])) {
      this.#fail("reply", "event-envelope", eventKind(method)); return;
    }
    if (sessionId !== undefined && (this.#sessionId === null ||
        sessionId !== this.#sessionId && (typeof sessionId !== "string" || !this.#workerSessions.has(sessionId)))) {
      this.#fail("reply", "event-session", eventKind(method)); return;
    }
    try {
      const event = sessionId === undefined ? { method, params } : { method, params, sessionId };
      if (sessionId === this.#sessionId && method === "Target.attachedToTarget") {
        const child = params["targetInfo"], childSession = params["sessionId"];
        const observeChild = this.#originalWorkerHandler();
        if (observeChild === null || !diagnosticExact(params, ["sessionId", "targetInfo", "waitingForDebugger"]) ||
            !record(child) || child["type"] !== "worker" || child["attached"] !== true || !diagnosticToken(child["targetId"]) ||
            !diagnosticToken(childSession) || ((this.#viaPurpose || this.#schematicDisplayPurpose) ? typeof params["waitingForDebugger"] !== "boolean" : params["waitingForDebugger"] !== false) || childSession === this.#sessionId ||
            this.#workerSessions.has(childSession) || [...this.#workerSessions.values()].includes(child["targetId"]) ||
            this.#workerSessions.size >= 16) { this.#fail("reply", "worker-attachment", eventKind(method)); return; }
        this.#workerSessions.set(childSession, child["targetId"]);
        if (this.#viaPurpose && params["waitingForDebugger"] === true) { this.#viaWaitingWorkers.add(childSession); }
        if (this.#schematicDisplayPurpose && params["waitingForDebugger"] === true) { this.#schematicWaitingWorkers.add(childSession); }
        observeChild(event);
      } else if (typeof sessionId === "string" && this.#workerSessions.has(sessionId)) {
        const observeWorker = this.#originalWorkerHandler();
        if (observeWorker === null) { this.#fail("reply", "worker-handler", eventKind(method)); return; }
        observeWorker(event);
      } else if (sessionId === this.#sessionId && method === "Target.detachedFromTarget" && (this.#workerEvent !== null || this.#viaWorkerEvent !== null || this.#schematicWorkerEvent !== null)) {
        const observeDetached = this.#originalWorkerHandler(); if (observeDetached === null) { throw new Error("PCB_VIA_WORKER_HANDLER"); } observeDetached(event);
      } else { this.#event(event); }
    }
    catch { this.#fail("reply", "event-callback", eventKind(method)); }
  }

  readonly #data = (chunk: unknown): void => {
    if (this.#failure !== null || this.#handedOff) { return; }
    if (this.#pending === null && this.#event === null) { this.#fail("reply", "unsolicited-data"); return; }
    if (!Buffer.isBuffer(chunk) || chunk.length === 0 || chunk.length > MAX_CHUNK_BYTES ||
      this.#receivedBytes + chunk.length > (this.#event === null ? 8 * MAX_FRAME_BYTES : DIAGNOSTIC_SESSION_BYTES)) { this.#fail("framing"); return; }
    this.#receivedBytes += chunk.length;
    let start = 0;
    while (start < chunk.length && this.#failure === null) {
      const delimiter = chunk.indexOf(0, start), end = delimiter === -1 ? chunk.length : delimiter;
      const size = end - start; const needed = this.#used + size;
      let frameLimit = MAX_FRAME_BYTES;
      if (this.#pending?.source === true) { frameLimit = DIAGNOSTIC_SOURCE_FRAME_BYTES; }
      else if (this.#pending?.common === true) { frameLimit = COMMON_FRAME_BYTES; }
      if (needed > frameLimit) { this.#fail("framing"); return; }
      if (needed > this.#buffer.length) {
        const replacement = Buffer.alloc(Math.min(frameLimit, Math.max(needed, this.#buffer.length * 2)));
        this.#buffer.copy(replacement, 0, 0, this.#used); this.#buffer = replacement;
      }
      chunk.copy(this.#buffer, this.#used, start, end); this.#used = needed;
      if (delimiter !== -1) { this.#frame(this.#buffer.subarray(0, this.#used)); this.#used = 0; }
      start = end + 1;
    }
    // Validate every coalesced frame before settling the matching response.
    if (this.#event === null && this.#pending?.reply !== null && this.#used > 0) { this.#fail("reply", "trailing-reply-data"); }
    this.#complete();
  };
  readonly #inputError = (): void => { this.#fail("input"); };
  readonly #outputError = (): void => { this.#fail("output"); };
  readonly #inputEnd = (): void => { this.#inputEnded = true; this.#fail(this.#used === 0 ? "eof" : "framing"); };
  readonly #inputClose = (): void => { this.#inputClosed = true; this.#fail("closed"); };
  readonly #outputClose = (): void => { this.#outputClosed = true; this.#fail("closed"); };
}

/** Legacy diagnostic profile. No caller cap or purpose override exists. */
export class CurrentPcbDiagnosticPipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable) { super(input, output, "diagnostic"); }
}
/** Dedicated private purpose with one original source/context seal. The core
 * remains private; no constructor accepts a purpose, limit or owner handoff. */
export class CurrentPcbSpatialPipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable) { super(input, output, "pcb-spatial209"); }
  public assertSpatialCapacity(): void { this.assertSpatialWorkflowCapacity(); }
  public bindSpatial(binding: CurrentPcbSpatialBinding): void { this.bindSpatialCommand(binding); }
  public observeSpatial(command: CurrentPcbSpatialCaptureCommand): Promise<Reply> { return this.observeSpatialCommand(command); }
}
/** Original generated Component-only birth. No old owner can upgrade. */
export class CurrentPcbComponentSpatialPipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable) { super(input, output, "pcb-component-spatial209"); }
  public assertSpatialCapacity(): void { this.assertSpatialWorkflowCapacity(); }
  public bindSpatial(binding: CurrentPcbSpatialBinding): void { this.bindSpatialCommand(binding); }
  public observeComponentSpatial(command: CurrentPcbSpatialCaptureCommand): Promise<Reply> { return this.observeComponentSpatialCommand(command); }
}
/** Distinct original schematic navigation/source stages. The separate native
 * worker and writer grammars require their original source issuance. */
export class CurrentSchematicDisplayWritePipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable) { super(input, output, "schematic-display-write209"); }
  public enableSchematicDisplayWorkerDiscovery(event: (value: DiagnosticEvent) => void): Promise<Reply> { return this.enableSchematicDisplayWorkerDiscoveryCommand(event); }
  public configureSchematicDisplayWorkerRunning(): Promise<Reply> { return this.configureSchematicDisplayWorkerRunningCommand(); }
  public bindSchematicDisplayWorker(sessionId: string, targetId: string): void { this.bindSchematicDisplayWorkerCommand(sessionId, targetId); }
  public observeSchematicDisplayWorker(command: CurrentSchematicDisplayWorkerCommand): Promise<Reply> { return this.observeSchematicDisplayWorkerCommand(command); }
  public observeSchematicDisplayAccessor(command: CurrentSchematicDisplayAccessorCommand): Promise<Reply> { return this.observeSchematicDisplayAccessorCommand(command); }
  public observeSchematicDisplayProducerGuard(command: CurrentProjectSaveProducerGuardCommand): Promise<Reply> { return this.observeProducerGuardCommand("schematic", command); }
  public bindSchematicDisplayStructureTransport(context: string): void { this.bindStructureTransportCommand("schematic", context); }
  public observeSchematicDisplayStructureTransport(command: CurrentProjectStructureTransportCommand): Promise<Reply> { return this.observeStructureTransportCommand("schematic", command); }
  public bindSchematicDisplayClock(workerContext: string, uiSdk: string): void { this.bindSchematicDisplayClockCommand(workerContext, uiSdk); }
  public observeSchematicDisplayClock(command: CurrentSchematicDisplayClockCommand, realm: CurrentSchematicDisplayClockRealm): Promise<Reply> { return this.observeSchematicDisplayClockCommand(command, realm); }
  public observeSchematicDisplay(phase: CurrentSchematicDisplayNativePhase, binding: string, target?: unknown, operation?: unknown): Promise<Reply> {
    return this.observeSchematicDisplayCommand(phase, binding, target, operation);
  }
}
/** Original Via birth only. Each whole-scene capture has its own immutable
 * ledger; no old spatial pipe is reset or transferred. */
export class CurrentPcbViaWritePipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable) { super(input, output, "pcb-via-write209"); }
  public bindViaSpatial(phase: CurrentPcbViaObservationPhase, binding: CurrentPcbSpatialBinding): void { this.bindViaSpatialCommand(phase, binding); }
  public observeViaSpatial(phase: CurrentPcbViaObservationPhase, command: CurrentPcbSpatialCaptureCommand): Promise<Reply> { return this.observeViaSpatialCommand(phase, command); }
  public enableViaWorkerDiscovery(event: (value: DiagnosticEvent) => void): Promise<Reply> { return this.enableViaWorkerDiscoveryCommand(event); }
  public configureViaWorkerRunning(): Promise<Reply> { return this.configureViaWorkerRunningCommand(); }
  public bindViaWorker(sessionId: string, targetId: string): void { this.bindViaWorkerCommand(sessionId, targetId); }
  public observeViaWorker(command: CurrentPcbViaWorkerCommand): Promise<Reply> { return this.observeViaWorkerCommand(command); }
  public observeViaProducerGuard(command: CurrentProjectSaveProducerGuardCommand): Promise<Reply> { return this.observeProducerGuardCommand("via", command); }
  public bindViaStructureTransport(context: string): void { this.bindStructureTransportCommand("via", context); }
  public observeViaStructureTransport(command: CurrentProjectStructureTransportCommand): Promise<Reply> { return this.observeStructureTransportCommand("via", command); }
  public bindViaClock(workerContext: string, uiSdk: string): void { this.bindViaClockCommand(workerContext, uiSdk); }
  public observeViaClock(command: CurrentPcbViaClockCommand, realm: CurrentPcbViaClockRealm): Promise<Reply> { return this.observeViaClockCommand(command, realm); }
  public observeViaSdkProperties(objectId: string): Promise<Reply> { return this.observeViaSdkPropertiesCommand(objectId); }
  public observeViaStage(stage: CurrentPcbViaWriteStage, binding: string, plan: CurrentPcbViaWritePlan): Promise<Reply> { return this.observeViaStageCommand(stage, binding, plan); }
}
/** Internal, unregistered String pre-create profile. It has no create/Save
 * vocabulary and cannot extend an existing diagnostic pipe's lifetime budget. */
export class CurrentPcbStringPrecreatePipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable) { super(input, output, "string-precreate"); }
  public observeCommonBaseline(command: CurrentPcbCommonBaselineCommand): Promise<Reply> {
    return this.observeCommonBaselineCommand(command);
  }
  public observeWorkerProducers(command: CurrentPcbStringWorkerProducerCommand): Promise<Reply> {
    return this.observeWorkerProducerCommand(command);
  }
  public observeMoveProducers(command: CurrentPcbStringMoveCommand): Promise<Reply> { return this.observeMoveCommand(command); }
  public observeActorClock(command: CurrentPcbStringActorClockCommand): Promise<Reply> {
    return this.observeActorClockCommand(command);
  }
}

/** Fixed discovery prefix for the separate constructor-capture owner. */
export class CurrentPcbWorkerStartupDiscoveryPipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable) { super(input, output, "worker-startup"); }
  public handoff(): CurrentPcbWorkerStartupPipeHandoff { return this.handoffStartupPipe(); }
}
/** Distinct read-only UI qualification. It exposes no startup handoff, worker
 * discovery, project opener or saved/copy dependency marker. The real native
 * owner must qualify the pinned source before supplying the one local seal. */
export class CurrentFootprintHeldCacheDiagnosticPipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable, observeEventBytes: (bytes: number) => void) {
    super(input, output, "held-cache-diagnostic", observeEventBytes);
  }
  public bindHeldCache(binding: CurrentFootprintHeldCacheDiagnosticBinding): void { this.bindHeldCacheDiagnostic(binding); }
  public observeHeldCache(command: CurrentFootprintSavedCacheHeldCommand): Promise<Reply> { return this.heldCacheDiagnostic(command); }
}
/** Separate birth for the combined owner's bounded pre-opening metadata
 * observation. Old startup pipes cannot acquire this fixed command grammar. */
export class CurrentFootprintCombinedDiscoveryPipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable) { super(input, output, "combined-discovery"); }
  public observeSavedCacheNative(command: CurrentFootprintSavedCacheCommand): Promise<Reply> { return this.savedCacheNative(command); }
  public observeSavedCacheAccessor(command: CurrentFootprintSavedCacheAccessorCommand): Promise<Reply> { return this.savedCacheAccessor(command); }
  public handoff(): CurrentPcbWorkerStartupPipeHandoff { return this.handoffStartupPipe(); }
}
/** The born forward owner's original counter observes every discovery event
 * before this parser can retain or deliver it. This callback grants no owner. */
export class CurrentFootprintCopyForwardDiscoveryPipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable, observeEventBytes: (bytes: number) => void) {
    super(input, output, "forward-discovery", observeEventBytes);
  }
  public observeSavedCacheNative(command: CurrentFootprintSavedCacheCommand): Promise<Reply> { return this.savedCacheNative(command); }
  public observeSavedCacheAccessor(command: CurrentFootprintSavedCacheAccessorCommand): Promise<Reply> { return this.savedCacheAccessor(command); }
  public handoff(): CurrentPcbWorkerStartupPipeHandoff { return this.handoffStartupPipe(); }
}

/** The original forward-to-saved observation factory accounts this ordinary
 * startup vocabulary from discovery birth. It gains no combined cache grammar. */
export class CurrentFootprintCopyForwardSavedDiscoveryPipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable, observeEventBytes: (bytes: number) => void) {
    super(input, output, "forward-saved-discovery", observeEventBytes);
  }
  public handoff(): CurrentPcbWorkerStartupPipeHandoff { return this.handoffStartupPipe(); }
}
