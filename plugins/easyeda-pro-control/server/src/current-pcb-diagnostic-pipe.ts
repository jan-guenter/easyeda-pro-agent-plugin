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
import { CURRENT_PCB_DIAGNOSTIC_TRANSPORT_LIMITS as TRANSPORT } from "./current-pcb-diagnostic-transport-limits.ts";
import type { Readable, Writable } from "node:stream";
import { DIAGNOSTIC_REQUEST_LIMIT, DIAGNOSTIC_SESSION_BYTES, DIAGNOSTIC_SOURCE_FRAME_BYTES, DIAGNOSTIC_WORKER_ATTACH_PARAMS, diagnosticArcShapes209Params, diagnosticExact, diagnosticExtendedPrimitives209Params, diagnosticImageShapes209Params, diagnosticLayers209Params, diagnosticOpeningParams, diagnosticPadShapes209Params, diagnosticPcbOpeningParams, diagnosticPouredShapes209Params, diagnosticPrimitives209Params, diagnosticSelectionRelations209Params, diagnosticToken, diagnosticVisual209Params, diagnosticWorkerEvaluationParams } from "./current-pcb-diagnostic-protocol.ts";
import type { DiagnosticCommand, DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
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

export { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";

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
type RequestPhase = "discovery" | "frame-owner" | "worker-discovery" | "worker-state" |
  `project-${CurrentPcbDiagnosticOpeningPhase}` | `pcb-${CurrentPcbDiagnosticPcbOpeningPhase}` | "layers209" | "primitives209" | "extended-primitives209" | "selection-relations209" | "visual209" | "pad-shapes209" | "image-shapes209" | "arc-shapes209" | "poured-shapes209" |
  `model-${CurrentPcbDiagnosticModelCommand["modelPhase"]}` | `string-${CurrentPcbStringPrecreatePhase}` |
  `common-${CurrentPcbCommonBaselineCommand["commonPhase"]}` | `worker-producer-${CurrentPcbStringWorkerProducerCommand["workerProducerPhase"]}` |
  `actor-clock-${CurrentPcbStringActorClockCommand["actorClockPhase"]}` | `move-${CurrentPcbStringMoveCommand["movePhase"]}` |
  `saved-cache-${CurrentFootprintSavedCacheCommand["cacheNativePhase"]}`;
const REQUEST_METHODS = [
  "Browser.getVersion", "Target.getTargets", "Target.attachToTarget", "Page.enable", "Page.getFrameTree", "Runtime.enable",
  "Debugger.enable", "Debugger.getScriptSource", "DOM.getFrameOwner", "DOM.describeNode", "Target.setAutoAttach",
  "Runtime.evaluate", "Runtime.callFunctionOn", "Runtime.getProperties", "Runtime.releaseObjectGroup",
] as const satisfies readonly DiagnosticCommand["method"][];
const REQUEST_PHASES = [
  "discovery", "frame-owner", "worker-discovery", "worker-state", "project-preflight", "project-open-project",
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
  #savedCacheSession: string | null = null;
  #savedCacheStep = 0;
  #savedCacheReleaseAttempted = false;
  #savedCacheReleased = false;
  #handedOff = false;
  #started = false;
  #failure: Failure | null = null;
  #failureObservation: CurrentPcbDiagnosticFailureObservation | null = null;
  #lastRequest: RequestObservation | null = null;
  #pending: Pending | null = null;
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

  public constructor(input: Readable, output: Writable, purpose: "diagnostic" | "string-precreate" | "worker-startup" | "combined-discovery") {
    this.#input = input; this.#output = output; this.#stringPurpose = purpose === "string-precreate";
    this.#startupPurpose = purpose === "worker-startup" || purpose === "combined-discovery";
    this.#combinedPurpose = purpose === "combined-discovery";
  }

  /** One clean transfer of the original counter and receive budgets. Listeners
   * remain attached but dormant until their ordinary closed-stream cleanup. */
  protected handoffStartupPipe(): CurrentPcbWorkerStartupPipeHandoff {
    if (!this.#startupPurpose || this.#handedOff || !this.#started || this.#released || this.#failure !== null ||
        this.#sessionId === null || this.#event === null || this.#workerEvent !== null || this.#pending !== null || this.#used !== 0 ||
        this.#inputEnded || this.#inputClosed || this.#outputClosed || this.#output.writableLength !== 0 || this.#input.readableLength !== 0 ||
        this.#combinedPurpose && this.#savedCacheStep > 0 && !this.#savedCacheReleased) {
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
  public getScriptSource(scriptId: string): Promise<Reply> {
    if (this.#sessionId === null || !diagnosticToken(scriptId)) { return Promise.reject(new Error("PCB_DIAGNOSTIC_PIPE_SCRIPT_INPUT")); }
    return this.#request({ id: this.#nextId, method: "Debugger.getScriptSource", params: { scriptId }, sessionId: this.#sessionId });
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
    if (this.#sessionId === null || this.#workerEvent !== null || this.#pending !== null) {
      throw new Error("PCB_DIAGNOSTIC_PIPE_WORKER_DISCOVERY_INPUT");
    }
    this.#workerEvent = event;
    const reply = await this.#request({ id: this.#nextId, method: "Target.setAutoAttach",
      params: DIAGNOSTIC_WORKER_ATTACH_PARAMS, sessionId: this.#sessionId }, "worker-discovery");
    if (!diagnosticExact(reply, [])) { this.#fail("reply", "worker-discovery-result"); throw failureError("reply"); }
    this.#workerDiscoverySettled = true; return reply;
  }
  public selectWorkerSession(sessionId: string): void {
    if (this.#failure !== null || !this.#workerDiscoverySettled || this.#selectedWorkerSession !== null ||
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
    return Object.freeze({ started: this.#started, failure: this.#failure, failureObservation: this.#failureObservation, pendingRequestId: this.#pending?.id ?? null,
      requestCount: this.#nextId - 1, receivedBytes: this.#receivedBytes, inputEnded: this.#inputEnded,
      inputClosed: this.#inputClosed, outputClosed: this.#outputClosed, listenersReleased: this.#released,
      nativeOwnerVerified: false, executionAuthorized: false });
  }

  /** Remove this object's listeners only after BOTH streams have emitted close.
   * This observes transport closure, not original EasyEDA/Job termination.
   * It does not close a stream or authorize a fresh launch. */
  public releaseClosedListeners(): void {
    if (!this.#inputClosed || !this.#outputClosed || this.#pending !== null) {
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

  // oxlint-disable-next-line eslint/require-await -- Async converts pre-dispatch guards to rejected promises; native completion is callback-based.
  async #request(command: DiagnosticCommand | (CurrentFootprintSavedCacheCommand & Readonly<{ id: number }>) | (Omit<CurrentPcbStringPrecreateCommand, "stringPhase"> &
    Readonly<{ id: number; sessionId: string }>), phase: RequestPhase = "discovery"): Promise<Reply> {
    if (!this.#started || this.#released || this.#handedOff) { throw new Error("PCB_DIAGNOSTIC_PIPE_NOT_STARTED"); }
    const savedCache = this.#combinedPurpose && phase.startsWith("saved-cache-") && "cacheNativePhase" in command;
    if (this.#startupPurpose && !savedCache && (phase !== "discovery" && phase !== "frame-owner" ||
        command.method === "Target.setAutoAttach" || command.method === "Runtime.evaluate" || command.method === "Runtime.callFunctionOn")) {
      throw new Error("PCB_DIAGNOSTIC_PIPE_STARTUP_DISCOVERY_ONLY");
    }
    if (this.#failure !== null) { throw failureError(this.#failure); }
    if (this.#pending !== null) { throw new Error("PCB_DIAGNOSTIC_PIPE_REQUEST_PENDING"); }
    if (this.#nextId > (this.#stringPurpose ? CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT : DIAGNOSTIC_REQUEST_LIMIT)) {
      this.#fail("budget"); throw failureError("budget");
    }
    const id = this.#nextId; this.#nextId += 1;
    this.#lastRequest = Object.freeze({ id,
      method: REQUEST_METHODS.find(method => method === command.method) ?? "unknown",
      phase: REQUEST_PHASES.find(value => value === phase) ?? "unknown" });
    const deferred = Promise.withResolvers<Reply>();
    let deadline = DEADLINE_MS;
    if (command.method === "Debugger.getScriptSource") { deadline = 30_000; }
    else if (command.method === "Runtime.callFunctionOn" && command.params.awaitPromise) { deadline = 60_000; }
    const pending: Pending = { id, resolve: deferred.resolve, reject: deferred.reject,
      timer: setTimeout(() => { this.#fail("deadline"); }, deadline), written: false, reply: null,
      sessionId: "sessionId" in command ? command.sessionId : null, source: command.method === "Debugger.getScriptSource",
      common: ["common-packet-read", "common-packet-result", "common-assets", "common-metadata"].includes(phase) };
    this.#pending = pending;
    // Reserve before write, including synchronous throw and synchronous peer
    // Reply. A callback error still defeats an earlier received response.
    try {
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Writable completion is callback-based; an ACK does not replace the write callback.
      this.#output.write(Buffer.from(`${JSON.stringify(command)}\0`), (error): void => {
        if (error !== null && error !== undefined) { this.#fail("output"); }
        else if (this.#pending === pending && this.#failure === null) { pending.written = true; this.#complete(); }
      });
    } catch { this.#fail("output"); }
    return deferred.promise;
  }

  #fail(code: Failure, reason: FailureReason = code, rejectedEvent: EventKind | null = null): void {
    // First failure only. Later cleanup and stream noise cannot replace it.
    // Fixed method/phase/event labels carry no received params or private text.
    this.#failureObservation ??= Object.freeze({
      schema: "easyeda-pro-control.pcb-diagnostic-pipe-failure.v1", code, reason, request: this.#lastRequest,
      requestPending: this.#pending !== null, eventKind: rejectedEvent,
      executionAuthorized: false, dispatchAbsenceVerified: false,
    });
    this.#failure ??= code;
    this.#used = 0;
    const pending = this.#pending;
    this.#pending = null;
    if (pending !== null) { clearTimeout(pending.timer); pending.reject(failureError(this.#failure)); }
  }

  #complete(): void {
    const pending = this.#pending;
    if (this.#failure === null && pending !== null && pending.written && pending.reply !== null && this.#used === 0) {
      this.#pending = null; clearTimeout(pending.timer); pending.resolve(pending.reply);
    }
  }

  #frame(bytes: Buffer): void {
    const pending = this.#pending;
    if (bytes.length === 0) { this.#fail("reply", "empty-frame"); return; }
    let decoded: unknown;
    try { decoded = decodeCurrentPcbDiagnosticJson(bytes); }
    catch { this.#fail("framing"); return; }
    if (!record(decoded)) { this.#fail("reply", "nonobject-frame"); return; }
    if (Object.hasOwn(decoded, "method")) { this.#receiveEvent(decoded, bytes.length); return; }
    if (pending === null) { this.#fail("reply", "reply-unsolicited"); return; }
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

  #receiveEvent(value: Record<string, unknown>, bytes: number): void {
    const method = value["method"], params = value["params"], sessionId = value["sessionId"];
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
        if (this.#workerEvent === null || !diagnosticExact(params, ["sessionId", "targetInfo", "waitingForDebugger"]) ||
            !record(child) || child["type"] !== "worker" || child["attached"] !== true || !diagnosticToken(child["targetId"]) ||
            !diagnosticToken(childSession) || params["waitingForDebugger"] !== false || childSession === this.#sessionId ||
            this.#workerSessions.has(childSession) || [...this.#workerSessions.values()].includes(child["targetId"]) ||
            this.#workerSessions.size >= 16) { this.#fail("reply", "worker-attachment", eventKind(method)); return; }
        this.#workerSessions.set(childSession, child["targetId"]);
        this.#workerEvent(event);
      } else if (typeof sessionId === "string" && this.#workerSessions.has(sessionId)) {
        if (this.#workerEvent === null) { this.#fail("reply", "worker-handler", eventKind(method)); return; }
        this.#workerEvent(event);
      } else if (sessionId === this.#sessionId && method === "Target.detachedFromTarget" && this.#workerEvent !== null) {
        this.#workerEvent(event);
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
/** Separate birth for the combined owner's bounded pre-opening metadata
 * observation. Old startup pipes cannot acquire this fixed command grammar. */
export class CurrentFootprintCombinedDiscoveryPipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable) { super(input, output, "combined-discovery"); }
  public observeSavedCacheNative(command: CurrentFootprintSavedCacheCommand): Promise<Reply> { return this.savedCacheNative(command); }
  public handoff(): CurrentPcbWorkerStartupPipeHandoff { return this.handoffStartupPipe(); }
}
