/** Separate validation-only diagnostic launch path.
 * Its retained helper owns the original process, non-breakaway Job and pipes.
 * A diagnostic failure never ends stdin or closes an Electron pipe. The only
 * release path first proves original root and complete Job termination.
 * Browser discovery grants no frame, worker, script or CAD execution authority. */
/* oxlint-disable import/max-dependencies -- This owner composes separately audited native installation, fixed protocol, identity observation and original process/pipe cleanup boundaries. */
/* oxlint-disable max-classes-per-file -- Four fixed-purpose exported facades share an unexported retained owner core; exporting a configurable core would expose a purpose-selection bypass. */
import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import process from "node:process";
import { types } from "node:util";
import { PassThrough, Writable } from "node:stream";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { canonicalJson, sha256Json } from "./core.ts";
import { CurrentPcbDiagnosticPipe, CurrentPcbStringPrecreatePipe, CurrentPcbWorkerStartupDiscoveryPipe, decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-pipe.ts";
import type { CurrentPcbDiagnosticFailureObservation } from "./current-pcb-diagnostic-pipe.ts";
import { diagnosticNativeRequest, stringPrecreateNativeRequest } from "./current-pcb-diagnostic-protocol.ts";
import { CurrentPcbDiagnosticContext, diagnosticBoundedObservation, diagnosticTargetInventory, diagnosticTargetSummary,
  validateDiagnosticFrameExpectation, validateDiagnosticScriptProfile } from "./current-pcb-diagnostic-context.ts";
import type { DiagnosticFrameExpectation, DiagnosticScriptProfile } from "./current-pcb-diagnostic-context.ts";
import { CurrentPcbDiagnosticWorkerContext } from "./current-pcb-diagnostic-worker-context.ts";
import type { DiagnosticWorkerScriptProfile } from "./current-pcb-diagnostic-worker-context.ts";
import { qualifyCurrentPcb209StartupActorInstallation, verifyCurrentPcb209DiagnosticFacade, verifyCurrentPcb209DiagnosticInstallation, verifyCurrentPcb209RatlineFacade, verifyCurrentPcb209RatlineInstallation, verifyCurrentPcb209WorkerBootstrapInstallation, verifyCurrentPcbDiagnosticFacade, verifyCurrentPcbDiagnosticInstallation } from "./current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallation, CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { currentPcbDiagnosticOpeningArguments, decodeCurrentPcbDiagnosticOpeningReply } from "./current-pcb-diagnostic-opening.ts";
import type { CurrentPcbDiagnosticOpeningResult } from "./current-pcb-diagnostic-opening.ts";
import { CurrentPcbDiagnosticModelRunner } from "./current-pcb-diagnostic-model-runner.ts";
import type { CurrentPcbDiagnosticModelObservation } from "./current-pcb-diagnostic-model-runner.ts";
import { currentPcbDiagnosticPcbOpeningArguments, decodeCurrentPcbDiagnosticPcbOpeningReply } from "./current-pcb-diagnostic-pcb-opening.ts";
import type { CurrentPcbDiagnosticPcbOpeningResult } from "./current-pcb-diagnostic-pcb-opening.ts";
import { CurrentPcbStringPrecreateRunner } from "./current-pcb-string-precreate-runner.ts";
import { currentPcbObservationFailure, currentPcbObservationFailureDetail } from "./current-pcb-observation-failure.ts";
import type { CurrentPcbObservationFailure, CurrentPcbObservationPhase } from "./current-pcb-observation-failure.ts";
import { CurrentPcbCommonBaselineSession } from "./current-pcb-common-baseline-session.ts";
import { currentPcbCommonBaselineFailure, currentPcbCommonBaselineRefusal, currentPcbCommonBaselineResult } from "./current-pcb-common-baseline-validation.ts";
import type { CurrentPcbCommonBaselineFailure, CurrentPcbCommonBaselineResult } from "./current-pcb-common-baseline-validation.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { CurrentPcbStringWorkerProducerRunner } from "./current-pcb-string-worker-producer-runner.ts";
import { currentPcbStringWorkerProducerFailureDetail } from "./current-pcb-string-worker-producer-evidence.ts";
import { CurrentPcbStringActorClockRunner } from "./current-pcb-string-actor-clock-runner.ts";
import type { CurrentPcbStringActorClockPacket } from "./current-pcb-string-actor-clock-runner.ts";
import { prepareCurrentPcbStringSaveProvenance, requireOriginalCurrentPcbStringSaveProvenance } from "./current-pcb-string-save-provenance.ts";
import type { CurrentPcbStringSaveProvenance } from "./current-pcb-string-save-provenance.ts";
import { CurrentPcbStringMoveRunner, currentPcbStringMoveFailureDetail } from "./current-pcb-string-move-runner.ts";
import { inspectCurrentPcbStringFiniteEffects } from "./current-pcb-string-finite-effects.ts";
import { CurrentFootprintCopyWindowsClockIssuer } from "./current-footprint-copy-windows-clock.ts";
import type { CurrentFootprintCopyWindowsClockObservation, CurrentFootprintCopyWindowsClockPhase, CurrentFootprintCopyWindowsClockTransport } from "./current-footprint-copy-windows-clock.ts";
import { CurrentPcbStringNativeClockIssuer } from "./current-pcb-string-native-clock.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbStringNativeClockObservation, CurrentPcbStringNativeClockPhase } from "./current-pcb-string-native-clock.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CurrentFootprintCombinedStartupChannel, CurrentFootprintCopyExecutionChannel, CurrentFootprintCopyPreparationChannel, CurrentFootprintCopySavedChannel, CurrentPcb209WorkerStartupChannel, CurrentPcbWorkerStartupChannel } from "./current-pcb-worker-startup-channel.ts";
import type { CurrentPcbWorkerStartupParent } from "./current-pcb-worker-startup-channel.ts";
import type { CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";
import { CurrentPcbWorkerStartupOpening } from "./current-pcb-worker-startup-opening.ts";
import type { CurrentPcbWorkerStartupOpeningResult } from "./current-pcb-worker-startup-opening.ts";
import { CurrentPcbWorkerStartupPcbSession } from "./current-pcb-worker-startup-pcb-session.ts";
import { CurrentFootprintCopyManagerRouteRunner } from "./current-footprint-copy-manager-route-runner.ts";
import type { CurrentFootprintParentWorkerObservation } from "./current-footprint-copy-parent-worker-runner.ts";
import type { CurrentFootprintCopyManagerRouteObservation } from "./current-footprint-copy-manager-route-runner.ts";
import type { CurrentFootprintCopyManagerRouteCommand } from "./current-footprint-copy-manager-route-command.ts";
import type { CurrentFootprintCopyClockRegistrationObservation, CurrentFootprintCopyClockRegistrationRunner, CurrentFootprintCopyClockRegistrationSample } from "./current-footprint-copy-clock-registration-runner.ts";
import type { CurrentFootprintCopyClockRegistrationCommand } from "./current-footprint-copy-clock-registration-contract.ts";
import { CurrentFootprintCopyUiRunner } from "./current-footprint-copy-ui-runner.ts";
import type { CurrentFootprintCopyUiCommand } from "./current-footprint-copy-ui-command.ts";
import type { CurrentFootprintCopyUiObservation } from "./current-footprint-copy-ui-runner.ts";
import { qualifyCurrentFootprintCopyUiSource, requireCurrentFootprintCopyUiSource } from "./current-footprint-copy-ui-source.ts";
import type { CurrentFootprintCopyUiSourceQualification } from "./current-footprint-copy-ui-source.ts";
import { bindCurrentFootprintCopyParentRoute } from "./current-footprint-copy-parent-route.ts";
import { CurrentFootprintCopySavedStartupOpening, CurrentPcb209WorkerStartupOpening, originalCurrentFootprintCopyParentPeer, requireCurrentFootprintCopyOpening } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentFootprintCopyOpeningOwner, CurrentFootprintCopyOpeningResult, CurrentPcb209WorkerStartupOpeningResult } from "./current-pcb-209-worker-startup-opening.ts";
import { CurrentPcb209WorkerStartupPcbSession } from "./current-pcb-209-worker-startup-pcb-session.ts";
import type { CurrentPcb209EmptyNativeDependency } from "./current-pcb-209-worker-startup-empty-session.ts";
import { CurrentPcb209EmptyStartupBudgetAnchor, CurrentPcb209EmptyStartupChannel } from "./current-pcb-209-empty-startup-channel.ts";
import { CURRENT_PCB_209_EMPTY_NATIVE_PROFILE } from "./current-pcb-209-empty-native-profile.ts";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE, CurrentPcb209RatlineBudget, assertOriginalCurrentPcb209RatlineBudget } from "./current-pcb-209-ratline-budget.ts";
import { CurrentPcb209RatlineStartupChannel } from "./current-pcb-209-ratline-startup-channel.ts";
import type { CurrentPcb209RatlineStartupNativeDependency } from "./current-pcb-209-ratline-startup-channel.ts";
import { CurrentPcb209RatlineNativeSession } from "./current-pcb-209-ratline-native-session.ts";
import { CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE, CurrentPcb209RatlineContinuationBudget, assertOriginalCurrentPcb209RatlineContinuationBudget } from "./current-pcb-209-ratline-continuation-budget.ts";
import { CurrentPcb209RatlineContinuationChannel } from "./current-pcb-209-ratline-continuation-channel.ts";
import { CurrentPcb209RatlineContinuationNativeSession } from "./current-pcb-209-ratline-continuation-native-session.ts";
import { requireCurrentPcb209ActorClockSourceQualification } from "./current-pcb-209-actor-clock-source.ts";
import type { CurrentPcb209ActorClockSourceQualification } from "./current-pcb-209-actor-clock-source.ts";
import { decodeCurrentPcb209LayersReply } from "./current-pcb-209-layers.ts";
import { decodeCurrentPcb209PrimitivesReply } from "./current-pcb-209-primitives.ts";
import { decodeCurrentPcb209ExtendedPrimitivesReply } from "./current-pcb-209-extended-primitives.ts";
import { decodeCurrentPcb209ImageShapesReply } from "./current-pcb-209-image-shapes.ts";
import { decodeCurrentPcb209ArcShapesReply } from "./current-pcb-209-arc-shapes.ts";
import { decodeCurrentPcb209PouredShapesReply } from "./current-pcb-209-poured-shapes.ts";
import { decodeCurrentPcb209PadShapesReply } from "./current-pcb-209-pad-shapes.ts";
import { currentPcb209SelectionRelationsComponentIdsSchema, decodeCurrentPcb209SelectionRelationsReply } from "./current-pcb-209-selection-relations.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import { controlDataDirectory, controlRootCapability } from "./artifacts.ts";
import { verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { join } from "node:path";
import { requireCurrentFootprintCopyOwned } from "./current-footprint-copy-preparation-runtime.ts";
import type { CurrentFootprintCopyPreparation } from "./current-footprint-copy-preparation.ts";
// oxlint-disable-next-line import/no-cycle -- The native owner consumes only its original footprint snapshot/guard registry; imports are used after construction.
import { requireCurrentFootprintCopyClosedSnapshot } from "./current-footprint-copy-closed-snapshot.ts";
// oxlint-disable-next-line import/no-cycle -- The native owner consumes only its original footprint snapshot/guard registry; imports are used after construction.
import { revalidateCurrentFootprintCopySavedOpenGuard } from "./current-footprint-copy-saved-generation.ts";
import type { CurrentFootprintCopySavedOpenGuard } from "./current-footprint-copy-saved-generation.ts";
import { currentFootprintCopySavedQueueCommand, decodeCurrentFootprintCopySavedQueueReply } from "./current-footprint-copy-saved-queue.ts";
import type { CurrentFootprintCopyV2SavedProjection } from "./current-footprint-copy-v2-saved-source.ts";
import { currentFootprintCopyV2SavedTarget } from "./current-footprint-copy-v2-saved-source.ts";
import type { CurrentFootprintCopyStatePacket } from "./current-footprint-copy-state.ts";
import type { CurrentFootprintCopySourceReadTransport } from "./current-footprint-copy-source-read-runner.ts";
import { currentFootprintCopyMainBackendWire } from "./current-footprint-copy-main-backend-wire.ts";
import type { CurrentFootprintCopyMainBackendCommand } from "./current-footprint-copy-main-backend-contract.ts";
import { currentFootprintCopyMainRequestWire } from "./current-footprint-copy-main-request-wire.ts";
import type { CurrentFootprintCopyMainRequestCollectCommand } from "./current-footprint-copy-main-request-protocol.ts";
import { CURRENT_FOOTPRINT_COMBINED_PROFILE, CURRENT_FOOTPRINT_COMBINED_PURPOSE } from "./current-footprint-copy-combined-profile.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT } from "./current-footprint-copy-main-transport-contract.ts";
// oxlint-disable-next-line import/no-cycle -- This owner constructs the sole main runner; the runner invokes original factory guards only after construction. No owner class or guard is read at module initialization.
import { CurrentFootprintCopyMainBackendRunner } from "./current-footprint-copy-main-backend-runner.ts";
import type { CurrentFootprintCopyMainBackendObservation } from "./current-footprint-copy-main-backend-runner.ts";


const HELPER_SHA256 = "919398ed5f5d6d85394b5b306ff0e977771ccddd278b838e3e4870b2d7e292d3";
const HELPER_BYTES = 1_046_338;
const MAX_LINE = 100_000;
// 64 MiB native bytes need at most 85.34 MiB base64 plus bounded poll envelopes.
const MAX_TOTAL = 96 * 1024 * 1024;
// Original helper owners remain reachable after caller exceptions.
const retainedOwners = new Set<object>();


// oxlint-disable-next-line typescript/unbound-method -- Invoke only with the original purpose-sealed private channel.
const requestFootprintUi = CurrentFootprintCopyPreparationChannel.prototype.requestFootprintUi;
// oxlint-disable-next-line typescript/unbound-method -- Invoke only on the original purpose-sealed channel.
const requestFootprintManagerRoute = CurrentFootprintCopyPreparationChannel.prototype.requestFootprintManagerRoute;
// oxlint-disable-next-line typescript/unbound-method -- Invoke only with the original execution channel receiver retained by this native owner.
const requestFootprintClockRegistration = CurrentFootprintCopyExecutionChannel.prototype.requestFootprintClockRegistration;
// oxlint-disable-next-line typescript/unbound-method -- Child issuance retains the original UI private fields, never an instance override.
const createFootprintManagerRoute = CurrentFootprintCopyUiRunner.prototype.createManagerRoute;
// oxlint-disable-next-line typescript/unbound-method -- Invoke with the original UI runner and its original observation packet.
const createFootprintClockRegistration = CurrentFootprintCopyUiRunner.prototype.createClockRegistration;
// oxlint-disable-next-line typescript/unbound-method -- The exact private manager issuer joins its original peer, never receipt JSON.
const requireFootprintManagerPeer = CurrentFootprintCopyManagerRouteRunner.prototype.requireOriginalWorkerPeer;


type RecordValue = Record<string, unknown>;
type OwnerPurpose = "diagnostic" | "diagnostic209" | "string-precreate" | "worker-startup" | "worker-startup209" | "worker-startup-footprint209" | "worker-startup-footprint-copy209" | "worker-startup-footprint-saved209" | "worker-startup-footprint-main209" | typeof CURRENT_FOOTPRINT_COMBINED_PURPOSE | "worker-startup-empty209" | "worker-startup-ratline209" | "worker-startup-ratline-continuation209";
function footprintCopyObservationPurpose(purpose: OwnerPurpose): boolean {
  return purpose === "worker-startup-footprint-copy209" || purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE;
}
export interface CurrentPcbWorkerStartupOpeningBinding {
  readonly context: () => Readonly<{ sessionId: string; uniqueContextId: string }>;
  readonly reprove: () => Promise<void>;
  readonly begin: (target: CurrentDisposableOpenSealedTarget,
    titleProof: Readonly<{ initialTitle: string; expectedOpenedTitle: string }>) => Readonly<{ sessionId: string; uniqueContextId: string }>;
  readonly finish: (targets: RecordValue, frames: RecordValue) => void;
  readonly observeParent: (targets: RecordValue, frames: RecordValue) => void;
  readonly ancillaryFrame: () => string | null;
  readonly observeAncillary: (owner: RecordValue, node: RecordValue) => void;
  readonly ancillaryObservation: () => RecordValue | null;
}
export interface CurrentPcbWorkerStartupHandoff {
  readonly channel: CurrentPcbWorkerStartupChannel | CurrentPcb209WorkerStartupChannel | CurrentFootprintCopyPreparationChannel | CurrentFootprintCopyExecutionChannel | CurrentFootprintCombinedStartupChannel | CurrentFootprintCopySavedChannel | CurrentPcb209EmptyStartupChannel | CurrentPcb209RatlineContinuationChannel | CurrentPcb209RatlineStartupChannel;
  readonly actorClockSourceQualification?: CurrentPcb209ActorClockSourceQualification;
  readonly dependency: CurrentPcbWorkerStartupDependency;
  readonly opening: CurrentPcbWorkerStartupOpeningBinding;
}
interface Binding { readonly helperInstance: string; readonly jobId: string; readonly rootPid: number; readonly rootCreated: string }
export interface CurrentPcbDiagnosticNoProcessRelease {
  readonly launchRequestOutcome: "not-issued" | "native-refused";
  readonly creationState: "not-entered" | "returned-false";
  readonly createProcessError?: number;
  readonly processCreated: false; readonly released: true;
}
interface NoProcessProof { readonly creationState: "not-entered" | "returned-false"; readonly createProcessError?: number }
const mainNativeActions = ["main-attach", "main-reprove", "main-send", "main-request-send", "main-poll", "main-terminate", "combined-abort"] as const;
type MainNativeAction = typeof mainNativeActions[number];
interface Pending {
  readonly id: string; readonly resolve: (value: RecordValue) => void; readonly reject: (error: Error) => void;
  readonly timer: ReturnType<typeof setTimeout>; readonly launch: boolean; readonly send: boolean; readonly poll: boolean;
  readonly mainAction: MainNativeAction | null; readonly combinedCleanup: boolean; written: boolean; reply: RecordValue | null;
}
function record(value: unknown): value is RecordValue { return value !== null && typeof value === "object" && !Array.isArray(value); }
function exact(value: RecordValue, fields: readonly string[]): boolean { return Object.keys(value).toSorted().join(",") === fields.toSorted().join(","); }
function error(code: string): Error { return new Error(`PCB_DIAGNOSTIC_OWNER_${code}`); }
function ratlineCleanupControl(request: RecordValue, cleanupPhase: boolean): boolean {
  const action = request["action"];
  if (["identity", "window", "normal-close", "termination", "release", "release-unlaunched", "no-process-proof", "release-no-process",
    "worker-startup-ratline-abort", "worker-startup-ratline-continuation-abort"].includes(typeof action === "string" ? action : "")) { return true; }
  if (!cleanupPhase) { return false; }
  if (action === "worker-startup-reprove") { return true; }
  const phase = request["startupPhase"];
  if (action === "worker-startup-send") { return typeof phase === "string" && ["release", "remove", "resume"].includes(phase); }
  if (action === "worker-startup-ratline-continuation") { return request["phase"] === "remove" || request["phase"] === "resume"; }
  return action === "worker-startup-ratline" && (request["phase"] === "remove" || request["role"] === "pcb" && request["phase"] === "resume");
}
function combinedCleanupControl(request: RecordValue): boolean {
  return ["combined-abort", "identity", "termination", "release", "no-process-proof", "release-no-process"].includes(String(request["action"]));
}
interface TerminationObservation { readonly originalRootExited: boolean | null; readonly originalJobEmpty: boolean | null; readonly terminated: boolean }
function terminationObservation(value: RecordValue): Readonly<TerminationObservation> {
  const { originalRootExited, originalJobEmpty, terminated } = value;
  if (!exact(value, ["terminated", "originalRootExited", "originalJobEmpty"]) ||
      typeof terminated !== "boolean" || originalRootExited !== null && typeof originalRootExited !== "boolean" ||
      originalJobEmpty !== null && typeof originalJobEmpty !== "boolean" ||
      terminated !== (originalRootExited === true && originalJobEmpty === true)) { throw error("TERMINATION_REPLY"); }
  return Object.freeze({ originalRootExited, originalJobEmpty, terminated });
}
function binding(value: RecordValue): Binding {
  const { helperInstance, jobId, rootPid, rootCreated } = value;
  if (!exact(value, ["helperInstance", "jobId", "rootPid", "rootCreated"]) ||
      typeof helperInstance !== "string" || !/^[a-f\d]{32}$/u.test(helperInstance) ||
      typeof jobId !== "string" || !/^[a-f\d]{32}$/u.test(jobId) ||
      typeof rootPid !== "number" || !Number.isSafeInteger(rootPid) || rootPid < 1 ||
      typeof rootCreated !== "string" || !/^(?:0|[1-9]\d{14,19})$/u.test(rootCreated)) { throw error("BINDING"); }
  return Object.freeze({ helperInstance, jobId, rootPid, rootCreated });
}
function noProcessState(value: RecordValue, released: boolean): Readonly<NoProcessProof> {
  const code = value["createProcessError"], hasError = Object.hasOwn(value, "createProcessError");
  if (!exact(value, [...(released ? ["released"] : []), "creationState", "processCreated", ...(hasError ? ["createProcessError"] : [])]) ||
      value["processCreated"] !== false || released && value["released"] !== true ||
      value["creationState"] !== "not-entered" && value["creationState"] !== "returned-false" ||
      hasError && (value["creationState"] !== "returned-false" || typeof code !== "number" || !Number.isSafeInteger(code) ||
        code < 0 || code > 4_294_967_295 || Object.is(code, -0))) { throw error("NO_PROCESS_PROOF"); }
  return Object.freeze({ creationState: value["creationState"], ...(hasError && typeof code === "number" ? { createProcessError: code } : {}) });
}

export interface CurrentFootprintCopyNativeTarget {
  readonly operationId: string;
  readonly target: CurrentDisposableOpenSealedTarget;
  readonly source: string;
  readonly runtime: MachineProfile["runtime"];
  readonly checkpoint: CheckpointReceipt;
  readonly before: Awaited<ReturnType<typeof readExactSqlInventory>>;
}
export type CurrentFootprintCopyGenerationOwner = CurrentFootprintCopyNativeOwner | CurrentFootprintCopySavedNativeOwner;
const footprintSavedAllocations = new WeakMap<CurrentFootprintCopyNativeOwner, CurrentFootprintCopySavedNativeOwner>();
const footprintSavedAllocationAttempts = new WeakSet<CurrentFootprintCopyNativeOwner>();
const footprintSavedAllocationStates = new WeakMap<CurrentFootprintCopyNativeOwner, "pending" | "no-resource" | "unresolved">();
const footprintFactories = new WeakMap<object, Readonly<{ options: CurrentPcbDiagnosticInstallationOptions; installation: CurrentPcbDiagnosticInstallation }>>();
const footprintTerminations = new WeakMap<object, Readonly<{ owner: object; binding: Binding | null; noProcess: boolean }>>();
export interface CurrentFootprintCombinedMainCapability {
  readonly profile: "private.current-footprint-combined-main-capability.v1";
  readonly executionAuthorized: false;
}
export interface CurrentFootprintCombinedAbortReservation {
  readonly profile: "private.current-footprint-combined-abort-reservation.v1";
  readonly executionAuthorized: false;
}
const footprintCombinedFactories = new WeakMap<object, CurrentPcbDiagnosticInstallation>();
const footprintCombinedCapabilities = new WeakMap<CurrentFootprintCombinedMainCapability, CurrentPcbRetainedOwnerCore>();

/** Test seams supply a real retained child, never process IDs or an attach path.
 * Only the fixed owner factories check packaged helper source. Neither
 * constructor nor successful discovery grants current runtime admission. */
class CurrentPcbRetainedOwnerCore {
  readonly #child: ChildProcessWithoutNullStreams;
  readonly #verify: () => Promise<void>;
  readonly #verifyInstallation: () => Promise<void>;
  readonly #verifyStartupFacade: () => Promise<void>;
  readonly #installation: CurrentPcbDiagnosticInstallation | null;
  readonly #input = new PassThrough({ autoDestroy: false });
  readonly #output: Writable;
  readonly #pipe: CurrentPcbDiagnosticPipe | CurrentPcbStringPrecreatePipe | CurrentPcbWorkerStartupDiscoveryPipe;
  readonly #stringPurpose: boolean;
  readonly #startupPurpose: boolean;
  readonly #actorClockSource: CurrentPcb209ActorClockSourceQualification | null;
  readonly #purpose: OwnerPurpose;
  #startupHandoffConsumed = false;
  #startupParent: CurrentPcbWorkerStartupParent | null = null;
  #startupChannel: CurrentPcbWorkerStartupChannel | CurrentPcb209WorkerStartupChannel | CurrentFootprintCopyPreparationChannel | CurrentFootprintCopyExecutionChannel | CurrentFootprintCombinedStartupChannel | CurrentFootprintCopySavedChannel | CurrentPcb209EmptyStartupChannel | CurrentPcb209RatlineContinuationChannel | CurrentPcb209RatlineStartupChannel | null = null;
  readonly #emptyAnchor: CurrentPcb209EmptyStartupBudgetAnchor | null;
  readonly #ratlineBudget: CurrentPcb209RatlineBudget | null;
  readonly #continuationBudget: CurrentPcb209RatlineContinuationBudget | null;
  #emptyPolls = 0;
  #emptyControls = 0;
  #startupEmptyDependency: CurrentPcb209EmptyNativeDependency | null = null;
  #startupEmptyPcbContext: Readonly<{ sessionId: string; uniqueContextId: string }> | null = null;
  #startupHandoff: CurrentPcbWorkerStartupHandoff | null = null;
  #footprintUiSource: CurrentFootprintCopyUiSourceQualification | null = null;
  #footprintUiAttempted = false;
  #footprintUiReproofAttempted = false;
  #footprintUiRunner: CurrentFootprintCopyUiRunner | null = null;
  #footprintUiPacket: CurrentFootprintCopyUiObservation | null = null;
  #footprintUiOpening: CurrentFootprintCopyOpeningOwner | null = null;
  #footprintUiOpeningResult: CurrentFootprintCopyOpeningResult | null = null;
  readonly #footprintUiParentReplies: unknown[] = [];
  #footprintManagerAttempted = false;
  #footprintManagerReproofAttempted = false;
  #footprintManagerRunner: CurrentFootprintCopyManagerRouteRunner | null = null;
  #footprintManagerPacket: CurrentFootprintCopyManagerRouteObservation | null = null;
  #footprintManagerCurrent: (() => Promise<void>) | null = null;
  readonly #footprintManagerParentReplies: unknown[] = [];
  #footprintClockRegistrationAttempted = false;
  #footprintClockRegistrationRunner: CurrentFootprintCopyClockRegistrationRunner | null = null;
  #footprintClockRegistrationPacket: CurrentFootprintCopyClockRegistrationObservation | null = null;

  #startupPcbConsumed = false;
  #startupPcbSession: CurrentPcbWorkerStartupPcbSession | CurrentPcb209WorkerStartupPcbSession | CurrentPcb209RatlineContinuationNativeSession | CurrentPcb209RatlineNativeSession | null = null;
  #nativeTail: Promise<void> = Promise.resolve();
  readonly #closed = Promise.withResolvers<null>();
  #pending: Pending | null = null;
  #buffer = Buffer.alloc(0);
  #total = 0;
  #failure: string | null = null;
  #binding: Binding | null = null;
  #busy = false;
  #launchConsumed = false;
  #launchSucceeded = false;
  #launchSettled = false;
  #launchRequestIssued = false;
  #nativeLaunchRefused = false;
  #noProcessProof: Readonly<NoProcessProof> | null = null;
  #nativeLaunchError: string | null = null;
  #nativeSendError: string | null = null;
  #mainNativeFailure: Readonly<{ action: MainNativeAction; code: string }> | null = null;
  #observationFailure: CurrentPcbObservationFailure | null = null;
  #closeConsumed = false;
  #releaseConsumed = false;
  #released = false;
  #childClosed = false;
  #send: Promise<void> | null = null;
  #inspectionConsumed = false;
  #browserObservationConsumed = false;
  #framesConsumed = false;
  #scriptConsumed = false;
  #browserTargets: readonly Readonly<RecordValue>[] | null = null;
  #stagedContext: CurrentPcbDiagnosticContext | null = null;
  #stagedAttachment: Readonly<{ targetId: string; sessionId: string }> | null = null;
  #workerContext: CurrentPcbDiagnosticWorkerContext | null = null;
  #workersConsumed = false;
  #workerScriptConsumed = false;
  #workerStateConsumed = false;
  #projectOpeningConsumed = false;
  #projectOpeningResult: CurrentPcbDiagnosticOpeningResult | null = null;
  #projectOpeningTarget: CurrentDisposableOpenSealedTarget | null = null;
  #pcbOpeningConsumed = false;
  #pcbOpeningResult: CurrentPcbDiagnosticPcbOpeningResult | null = null;
  #pcbObservationConsumed = false;
  #pcbFrameObservation: CurrentPcbDiagnosticPcbOpeningResult | null = null;
  #pcbSourceQualified = false;
  #pcbSourceProfile: DiagnosticScriptProfile | null = null;
  #layers209Consumed = false;
  #primitives209Consumed = false;
  #extendedPrimitives209Consumed = false;
  #padShapes209Consumed = false;
  #imageShapes209Consumed = false;
  #arcShapes209Consumed = false;
  #pouredShapes209Consumed = false;
  #selectionRelations209Consumed = false;
  #modelConsumed = false;
  #stringPrecreateConsumed = false;
  #commonBaselineConsumed = false;
  #commonBaselineSession: CurrentPcbCommonBaselineSession | null = null;
  #commonBaselineFailure: CurrentPcbCommonBaselineFailure | null = null;
  #stringWorkerRunner: CurrentPcbStringWorkerProducerRunner | null = null;
  #stringActorRunner: CurrentPcbStringActorClockRunner | null = null;
  #stringActorPacket: CurrentPcbStringActorClockPacket | null = null;
  #stringBeforeSql: Awaited<ReturnType<typeof readExactSqlInventory>> | null = null;
  #stringSaveProvenance: CurrentPcbStringSaveProvenance | null = null;
  #stringMoveRunner: CurrentPcbStringMoveRunner | null = null;
  #stringNativeClock: CurrentPcbStringNativeClockIssuer | null = null;
  #footprintWindowsClock: CurrentFootprintCopyWindowsClockIssuer | null = null;
  #footprintPeerJoinAttempted = false;
  #terminationObserved = false;
  #terminationObservation: Readonly<TerminationObservation> | null = null;

  #footprintUnlaunchedRelease: object | null = null;
  #footprintSourceBinding: CurrentFootprintCopyNativeTarget | null = null;
  #footprintSourceBindingText: string | null = null;
  #footprintSourceSealAttempted = false;
  #footprintSavedStartAttempted = false;
  #footprintSavedOpenAttempted = false;
  #footprintSavedOpening: CurrentFootprintCopySavedStartupOpening | null = null;
  #footprintSavedOpeningReleased = false;
  #footprintSavedQueues = 0;
  #mainAttachAttempted = false;
  #mainAttached = false;
  #combinedMainBusy = false;
  #mainRequestId = 0;
  #mainNormalRequests = 0;
  #mainCleanupRequests = 0;
  #mainTerminateAttempted = false;
  #combinedAbortAttempted = false;
  #combinedOutputCleanupOnly = false;
  #combinedCleanupControls = 0;
  #combinedAbortReservation: CurrentFootprintCombinedAbortReservation | null = null;
  #combinedAbortBinding: Binding | null = null;
  #combinedAbortDispatchAttempted = false;
  #mainObservationAttempted = false;
  #mainRunner: CurrentFootprintCopyMainBackendRunner | null = null;
  #combinedMainCapability: CurrentFootprintCombinedMainCapability | null = null;
  readonly #footprintSavedQueueReplies: unknown[] = [];

  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    installation: CurrentPcbDiagnosticInstallation | null, verifyInstallation: () => Promise<void>, purpose: OwnerPurpose,
    verifyStartupFacade: () => Promise<void> = verifyInstallation, actorClockSource: CurrentPcb209ActorClockSourceQualification | null = null,
    emptyAnchor: CurrentPcb209EmptyStartupBudgetAnchor | null = null, ratlineBudget: CurrentPcb209RatlineBudget | null = null, continuationBudget: CurrentPcb209RatlineContinuationBudget | null = null) {
    this.#actorClockSource = actorClockSource;
    this.#emptyAnchor = emptyAnchor;
    this.#ratlineBudget = ratlineBudget; this.#continuationBudget = continuationBudget;
    if ((purpose === "worker-startup-ratline-continuation209") !== (continuationBudget !== null)) { throw error("CONTINUATION_BUDGET"); }
    if (continuationBudget !== null) { assertOriginalCurrentPcb209RatlineContinuationBudget(continuationBudget); }
    if ((purpose === "worker-startup-ratline209") !== (ratlineBudget !== null)) { throw error("RATLINE_BUDGET"); }
    if (ratlineBudget !== null) { assertOriginalCurrentPcb209RatlineBudget(ratlineBudget); }
    if ((purpose === "worker-startup-empty209") !== (emptyAnchor !== null)) { throw error("STARTUP_EMPTY_ANCHOR"); }
    if (purpose === "worker-startup209" || (purpose === "worker-startup-footprint209" || purpose === "worker-startup-footprint-copy209" || purpose === "worker-startup-footprint-saved209" || purpose === "worker-startup-footprint-main209" || purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE) || purpose === "worker-startup-empty209" || purpose === "worker-startup-ratline209" || purpose === "worker-startup-ratline-continuation209") {
      if (actorClockSource === null) { throw error("STARTUP209_ACTOR_SOURCE"); }
      requireCurrentPcb209ActorClockSourceQualification(actorClockSource);
    } else if (actorClockSource !== null) { throw error("STARTUP209_PURPOSE"); }
    this.#startupPurpose = purpose === "worker-startup" || purpose === "worker-startup209" || (purpose === "worker-startup-footprint209" || purpose === "worker-startup-footprint-copy209" || purpose === "worker-startup-footprint-saved209" || purpose === "worker-startup-footprint-main209" || purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE) || purpose === "worker-startup-empty209" || purpose === "worker-startup-ratline209" || purpose === "worker-startup-ratline-continuation209";
    this.#child = child; this.#verify = verify; this.#installation = installation; this.#verifyInstallation = verifyInstallation;
    this.#verifyStartupFacade = verifyStartupFacade;
    this.#purpose = purpose; this.#stringPurpose = purpose === "string-precreate";
    this.#output = new Writable({ autoDestroy: false,
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Writable requires its original callback, acknowledged only after native WriteFile.
      write: (chunk: unknown, _encoding, callback): void => {
        this.#send = this.#sendFrame(chunk, callback);
      },
    });
    if (this.#startupPurpose) { this.#pipe = new CurrentPcbWorkerStartupDiscoveryPipe(this.#input, this.#output); }
    else { this.#pipe = this.#stringPurpose ? new CurrentPcbStringPrecreatePipe(this.#input, this.#output) : new CurrentPcbDiagnosticPipe(this.#input, this.#output); }
  }

  /** Retain the object before attaching listeners; failures preserve its child. */
  public start(): void {
    if (this.#pipe.status().started) { throw error("START_CONSUMED"); }
    this.#child.on("error", this.#childError);
    this.#child.on("close", this.#childClose);
    this.#child.stdin.on("error", this.#childError);
    this.#child.stdout.on("error", this.#childError);
    this.#child.stderr.on("error", this.#childError);
    this.#child.stderr.on("data", this.#stderr);
    this.#child.stdout.on("data", this.#data);
    this.#pipe.start();
  }

  public status(): Readonly<{ helperPid: number | null; binding: Binding | null; failure: string | null;
    busy: boolean; launchConsumed: boolean; closeConsumed: boolean; released: boolean; helperClosed: boolean;
    cleanupOnly: boolean; noProcessCleanupAvailable: boolean; frameWorkerVerified: false; executionAuthorized: false;
    nativeLaunchError: string | null; nativeSendError: string | null; createProcessError: number | null;
    mainNativeFailure?: Readonly<{ action: MainNativeAction; code: string }> | null;
    combinedAbortAttempted?: boolean; combinedAbortDispatchAttempted?: boolean; combinedOutputCleanupOnly?: boolean;
    browserObservationConsumed: boolean; frameInspectionConsumed: boolean; scriptInspectionConsumed: boolean; diagnosticFailure: string | null;
    diagnosticFailureObservation: CurrentPcbDiagnosticFailureObservation | null;
    workerStartupChannel?: ReturnType<CurrentPcbWorkerStartupChannel["status"]> | ReturnType<CurrentPcb209EmptyStartupChannel["status"]> |
      ReturnType<CurrentPcb209RatlineStartupChannel["status"]> | ReturnType<CurrentPcb209RatlineContinuationChannel["status"]> | null;
    observationFailure?: CurrentPcbObservationFailure | null;
    lastTerminationObservation?: Readonly<TerminationObservation> | null;
    projectOpeningConsumed: boolean; projectOpeningResult: CurrentPcbDiagnosticOpeningResult | null; modelObservationConsumed: boolean;
    pcbOpeningConsumed: boolean; pcbOpeningResult: CurrentPcbDiagnosticPcbOpeningResult | null;
    pcbObservationConsumed: boolean; pcbFrameObservation: CurrentPcbDiagnosticPcbOpeningResult | null; pcbSourceQualified: boolean;
    stringPrecreateConsumed: boolean; commonBaselineConsumed?: boolean; profile: OwnerPurpose; workerStartupHandoffConsumed?: boolean }> {
    return Object.freeze({ helperPid: this.#child.pid ?? null, binding: this.#binding, failure: this.#failure,
      busy: this.#busy, launchConsumed: this.#launchConsumed, closeConsumed: this.#closeConsumed,
      released: this.#released, helperClosed: this.#childClosed, cleanupOnly: this.#binding !== null && !this.#launchSucceeded,
      noProcessCleanupAvailable: this.#noProcessCleanupAvailable(), frameWorkerVerified: false, executionAuthorized: false, browserObservationConsumed: this.#browserObservationConsumed,
      nativeLaunchError: this.#nativeLaunchError, nativeSendError: this.#nativeSendError, createProcessError: this.#noProcessProof?.createProcessError ?? null,
      mainNativeFailure: this.#mainNativeFailure, combinedAbortAttempted: this.#combinedAbortAttempted, combinedAbortDispatchAttempted: this.#combinedAbortDispatchAttempted, combinedOutputCleanupOnly: this.#combinedOutputCleanupOnly,
      frameInspectionConsumed: this.#framesConsumed, scriptInspectionConsumed: this.#scriptConsumed, diagnosticFailure: this.#pipe.status().failure,
      diagnosticFailureObservation: this.#pipe.status().failureObservation,
      workerStartupChannel: this.#startupChannel?.status() ?? null,
      observationFailure: this.#observationFailure,
      lastTerminationObservation: this.#terminationObservation,
      projectOpeningConsumed: this.#projectOpeningConsumed, projectOpeningResult: this.#projectOpeningResult, modelObservationConsumed: this.#modelConsumed,
      pcbOpeningConsumed: this.#pcbOpeningConsumed, pcbOpeningResult: this.#pcbOpeningResult,
      pcbObservationConsumed: this.#pcbObservationConsumed, pcbFrameObservation: this.#pcbFrameObservation, pcbSourceQualified: this.#pcbSourceQualified,
      stringPrecreateConsumed: this.#stringPrecreateConsumed, commonBaselineConsumed: this.#commonBaselineConsumed,
      profile: this.#purpose, workerStartupHandoffConsumed: this.#startupHandoffConsumed });
  }

  public async launch(input: Readonly<{ executable: string; executableSha256: string; confirmDiagnosticLaunch: true }>): Promise<Binding> {
    if (this.#launchConsumed) { throw error("LAUNCH_CONSUMED"); }
    const { executable, executableSha256, confirmDiagnosticLaunch } = input;
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare, eslint/no-control-regex -- Exact confirmation and exclusion of native command control characters are required at this boundary.
    if (confirmDiagnosticLaunch !== true || !/^[A-Za-z]:\\[^\u0000-\u001F"\r\n]+\\easyeda-pro\.exe$/u.test(executable) ||
        !/^[a-f\d]{64}$/u.test(executableSha256)) { throw error("LAUNCH_INPUT"); }
    this.#enter(); this.#launchConsumed = true;
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      const nativeFile = this.#installation?.plan.files[0];
      if (this.#installation !== null && (nativeFile?.windowsPath !== executable || nativeFile.sha256 !== executableSha256)) { throw error("INSTALLATION_TARGET"); }
      try { this.#binding = binding(await this.#request({ action: "launch", executable, executableSha256, confirmDiagnosticLaunch: true,
        ...(this.#installation === null ? {} : { installation: this.#installation.plan }) })); }
      catch (caughtError) {
        // Native failure can follow successful CreateProcess. Recover only this
        // Original helper's retained binding; never launch or adopt a PID again.
        if (this.#failure === null) { await this.#recoverLaunchBinding(); }
        throw caughtError;
      }
      await this.#verify(); this.#available();
      if (this.#binding.rootCreated === "0") { throw error("CLEANUP_ONLY"); }
      this.#launchSucceeded = true;
      return this.#binding;
    } finally { this.#launchSettled = true; this.#busy = false; }
  }

  async #recoverLaunchBinding(): Promise<void> {
    const observed = await this.#request({ action: "identity" });
    if (observed["rootPid"] !== 0) { this.#binding = binding(observed); }
    else if (this.#nativeLaunchRefused) {
      if (!exact(observed, ["helperInstance", "jobId", "rootPid", "rootCreated"]) || observed["rootCreated"] !== "0" ||
          typeof observed["helperInstance"] !== "string" || !/^[a-f\d]{32}$/u.test(observed["helperInstance"]) ||
          typeof observed["jobId"] !== "string" || !/^[a-f\d]{32}$/u.test(observed["jobId"])) { throw error("NO_PROCESS_IDENTITY"); }
      this.#noProcessProof = noProcessState(await this.#request({ action: "no-process-proof" }), false);
    }
  }

  public getVersion(): Promise<RecordValue> { return this.#discover("version"); }
  public getTargets(): Promise<RecordValue> { return this.#discover("targets"); }

  /** One fixed browser sample. No attachment, bridge startup or profile claim. */
  public async browserObservation(): Promise<Readonly<RecordValue>> {
    if (this.#browserObservationConsumed || this.#inspectionConsumed) { throw error("BROWSER_OBSERVATION_CONSUMED"); }
    this.#enter(true); this.#browserObservationConsumed = true;
    try {
      const version = await this.#transfer(() => this.#pipe.getVersion());
      if (!exact(version, ["protocolVersion", "product", "revision", "userAgent", "jsVersion"]) ||
          Object.values(version).some(value => typeof value !== "string" || value.length > 8192 || value.includes("\0"))) {
        throw error("BROWSER_VERSION_REPLY");
      }
      this.#browserTargets = diagnosticTargetInventory(await this.#transfer(() => this.#pipe.getTargets()));
      return diagnosticBoundedObservation({ schema: "easyeda-pro-control.pcb-diagnostic-browser-observation.v1", version: structuredClone(version),
        targets: this.#browserTargets.map(value => diagnosticTargetSummary(value)), projectFreeVerified: false, profileIsolated: false,
        debuggerSocketAbsenceVerified: false, bridgeAuthentication: false, executionAuthorized: false });
    } catch (caughtError) { this.#input.emit("error", error("BROWSER_OBSERVATION_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Attach once to a member of the retained inventory and expose actual frame
   * IDs. This original context/event sink stays retained between tool calls. */
  public async inspectFrames(targetId: string): Promise<Readonly<RecordValue>> {
    if (this.#framesConsumed || this.#inspectionConsumed || this.#browserTargets === null) { throw error("FRAME_INSPECTION_UNAVAILABLE"); }
    const original = this.#browserTargets.find(item => item["targetId"] === targetId);
    if (original?.["type"] !== "page" || original["attached"] !== false) { throw error("FRAME_TARGET_UNOBSERVED"); }
    this.#enter(true); this.#framesConsumed = true;
    const context = new CurrentPcbDiagnosticContext(targetId); this.#stagedContext = context;
    try {
      const targets = await this.#transfer(() => this.#pipe.getTargets());
      if (JSON.stringify(diagnosticTargetInventory(targets).find(item => item["targetId"] === targetId)) !== JSON.stringify(original)) { throw error("FRAME_TARGET_CHANGED"); }
      context.selectTarget(targets);
      await this.#attach(context, targetId);
      const page = await this.#transfer(() => this.#pipe.enablePage());
      if (!exact(page, [])) { throw error("PAGE_ENABLE_REPLY"); }
      context.observeFrames(await this.#transfer(() => this.#pipe.getFrameTree()));
      context.observeTarget(await this.#transfer(() => this.#pipe.getTargets()));
      return context.observeFrames(await this.#transfer(() => this.#pipe.getFrameTree()));
    } catch (caughtError) { this.#input.emit("error", error("FRAME_INSPECTION_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Internal profile only. Public routing supplies a fixed reviewed family;
   * neither URL/path matching nor source bytes authorize any JavaScript/CAD. */
  public async inspectScript(frameId: string, input: DiagnosticScriptProfile): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = validateDiagnosticScriptProfile(input);
    if (this.#startupPurpose && profile.family !== "ui") { throw error("STARTUP_UI_SOURCE_ONLY"); }
    if (this.#scriptConsumed || context === null || !this.#framesConsumed || this.#inspectionConsumed) { throw error("SCRIPT_INSPECTION_UNAVAILABLE"); }
    this.#enter(true); this.#scriptConsumed = true;
    try {
      context.observeTarget(await this.#transfer(() => this.#pipe.getTargets()));
      context.observeFrames(await this.#transfer(() => this.#pipe.getFrameTree()));
      context.selectFrame(frameId, profile);
      return await this.#inspectScript(context);
    } catch (caughtError) { this.#input.emit("error", error("IDENTITY_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Project-only fixed opening under this original diagnostic process owner.
   * The lifecycle supplies the checkpoint-sealed target and one original
   * reproof callback, after durable intent. No ordinary launcher is borrowed.
   * Even a refused preflight consumes this overall stage; cleanup stays usable. */
  public async openProject(input: CurrentDisposableOpenSealedTarget, reverify: () => Promise<void>): Promise<CurrentPcbDiagnosticOpeningResult> {
    if (this.#startupPurpose) { throw error("STARTUP_LEGACY_ROUTE"); }
    const context = this.#stagedContext, target = currentDisposableOpenSealedTargetSchema.parse(input);
    currentPcbDiagnosticOpeningArguments(target, "preflight");
    if (this.#projectOpeningConsumed || context === null || !this.#scriptConsumed || this.#inspectionConsumed ||
        this.#workersConsumed || this.#workerContext !== null || this.#modelConsumed || typeof reverify !== "function") { throw error("PROJECT_OPENING_UNAVAILABLE"); }
    this.#enter(true); this.#projectOpeningConsumed = true; this.#projectOpeningTarget = Object.freeze(target);
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      await this.#observeOpeningAncillary();
      const selected = context.openingContext();
      await this.#observeParent(); context.openingContext();
      const preflight = decodeCurrentPcbDiagnosticOpeningReply(
        await this.#transfer(() => this.#pipe.observeProjectOpening(selected.uniqueContextId, target, "preflight")), target, "preflight");
      this.#projectOpeningResult = preflight;
      context.openingContext();
      await this.#verifyInstallation(); this.#available();
      if (!preflight.ok) { this.#input.emit("error", error("PROJECT_PREFLIGHT_REFUSED")); return preflight; }
      await reverify(); context.openingContext();
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      await this.#observeParent(); context.openingContext();
      await this.#observeOpeningAncillary(); context.openingContext();
      const titleProof = preflight.observation;
      if (titleProof === null) { throw error("PROJECT_TITLE_PROOF"); }
      const opening = context.beginOpeningTransition(target.projectUuid,
        { initialTitle: titleProof.initialTitle, expectedOpenedTitle: titleProof.expectedOpenedTitle });
      const result = decodeCurrentPcbDiagnosticOpeningReply(
        await this.#transfer(() => this.#pipe.observeProjectOpening(opening.uniqueContextId, target, "open-project")), target, "open-project");
      this.#projectOpeningResult = result;
      context.openingContext();
      await this.#verifyInstallation(); this.#available();
      if (!result.ok) { this.#input.emit("error", error("PROJECT_OPENING_REFUSED")); return result; }
      if (result.observation?.initialTitle !== titleProof.initialTitle ||
          result.observation.expectedOpenedTitle !== titleProof.expectedOpenedTitle) { throw error("PROJECT_TITLE_CHANGED"); }
      // The armed context deliberately retains its original frame/target until
      // Both post-reads settle. Ordinary parent checks would reject the expected
      // Fragment transition instead of completing this one narrow admission.
      const targets = await this.#transfer(() => this.#pipe.getTargets());
      context.openingContext();
      const frameTree = await this.#transfer(() => this.#pipe.getFrameTree());
      context.finishOpeningTransition(targets, frameTree);
      await this.#observeOpeningAncillary(); context.openingContext();
      await this.#verifyInstallation(); await this.#verify(); this.#available(); context.openingContext();
      const ancillaryFrame = context.ancillaryObservation();
      this.#projectOpeningResult = ancillaryFrame === null ? result : Object.freeze({ ...result, ancillaryFrame });
      return this.#projectOpeningResult;
    } catch (caughtError) { this.#input.emit("error", error("PROJECT_OPENING_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Opens only the PCB sealed by this owner's original accepted project open.
   * Acknowledgment is retained before independent frame/source qualification. */
  public async openPcb(input: CurrentDisposableOpenSealedTarget, reverify: () => Promise<void>): Promise<CurrentPcbDiagnosticPcbOpeningResult> {
    if (this.#startupPurpose) { throw error("STARTUP_LEGACY_ROUTE"); }
    const context = this.#stagedContext, target = currentDisposableOpenSealedTargetSchema.parse(input);
    currentPcbDiagnosticPcbOpeningArguments(target, "preflight");
    if (context === null || !this.#scriptConsumed || this.#inspectionConsumed || this.#workersConsumed || this.#workerContext !== null ||
        this.#modelConsumed || this.#pcbOpeningConsumed || this.#projectOpeningResult?.ok !== true ||
        this.#projectOpeningResult.status !== "opened-prefix-observed" ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget) || typeof reverify !== "function") { throw error("PCB_OPENING_UNAVAILABLE"); }
    this.#enter(true); this.#pcbOpeningConsumed = true;
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      const selected = context.openingContext();
      await this.#observeParent(); context.openingContext();
      const preflight = decodeCurrentPcbDiagnosticPcbOpeningReply(
        await this.#transfer(() => this.#pipe.observePcbOpening(selected.uniqueContextId, target, "preflight")), target, "preflight");
      this.#pcbOpeningResult = preflight;
      context.openingContext(); await this.#verifyInstallation(); this.#available();
      if (!preflight.ok) { this.#input.emit("error", error("PCB_PREFLIGHT_REFUSED")); return preflight; }
      await reverify(); context.openingContext();
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      await this.#observeParent(); context.openingContext();
      await this.#observeOpeningAncillary(); context.openingContext();
      const opening = context.beginPcbOpeningTransition(target.projectUuid, target.documentUuid);
      const result = decodeCurrentPcbDiagnosticPcbOpeningReply(
        await this.#transfer(() => this.#pipe.observePcbOpening(opening.uniqueContextId, target, "open-document")), target, "open-document");
      this.#pcbOpeningResult = result;
      context.pcbOpeningContext();
      await this.#verifyInstallation(); await this.#verify(); this.#available(); context.pcbOpeningContext();
      if (!result.ok) { this.#input.emit("error", error("PCB_OPENING_REFUSED")); }
      return result;
    } catch (caughtError) { this.#input.emit("error", error("PCB_OPENING_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Fixed UI/frame/DOM/source observations, never another navigation attempt. */
  public async observePcbOpening(input: CurrentDisposableOpenSealedTarget, inputProfile: DiagnosticScriptProfile): Promise<Readonly<RecordValue>> {
    if (this.#startupPurpose) { throw error("STARTUP_LEGACY_ROUTE"); }
    const context = this.#stagedContext, profile = validateDiagnosticScriptProfile(inputProfile);
    const target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (context === null || this.#pcbObservationConsumed || this.#pcbOpeningResult?.ok !== true ||
        this.#pcbOpeningResult.phase !== "open-document" || this.#pcbOpeningResult.status !== "opened" ||
        this.#workersConsumed || this.#workerContext !== null || this.#modelConsumed || profile.family !== "pcb" ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("PCB_OBSERVATION_UNAVAILABLE"); }
    this.#enter(true); this.#pcbObservationConsumed = true;
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      const selected = context.pcbOpeningContext();
      const targets = await this.#transfer(() => this.#pipe.getTargets()); context.pcbOpeningContext();
      const frameTree = await this.#transfer(() => this.#pipe.getFrameTree()); context.pcbOpeningContext();
      const child = context.observePcbOpeningFrames(targets, frameTree);
      await this.#observeOpeningAncillary(); context.pcbOpeningContext();
      const frameOwner = await this.#transfer(() => this.#pipe.getFrameOwner(child.frameId)); context.pcbOpeningContext();
      const backend = frameOwner["backendNodeId"];
      if (typeof backend !== "number" || !Number.isSafeInteger(backend) || backend < 1 || backend > 2_147_483_647) { throw error("PCB_FRAME_OWNER"); }
      const node = await this.#transfer(() => this.#pipe.describeFrameOwner(backend)); context.pcbOpeningContext();
      context.observePcbFrameOwner(frameOwner, node);
      const script = context.pcbScript(profile);
      const source = await this.#transfer(() => this.#pipe.getScriptSource(script.scriptId)); context.pcbOpeningContext();
      const afterTargets = await this.#transfer(() => this.#pipe.getTargets()); context.pcbOpeningContext();
      const afterFrames = await this.#transfer(() => this.#pipe.getFrameTree()); context.pcbOpeningContext();
      const proof = context.finishPcbOpening(source, afterTargets, afterFrames);
      // The fixed UI observation invokes the child's identity RPC. Admit the
      // Exact child source first, not merely its URL or parent UI source.
      const observed = decodeCurrentPcbDiagnosticPcbOpeningReply(
        await this.#transfer(() => this.#pipe.observePcbOpening(selected.uniqueContextId, target, "observe")), target, "observe");
      this.#pcbFrameObservation = observed; context.pcbOpeningContext(); context.pcbScript(profile);
      if (!observed.ok) { throw error("PCB_FRAME_REFUSED"); }
      await this.#observeParent(); context.pcbScript(profile);
      await this.#verifyInstallation(); context.pcbScript(profile);
      await this.#verify(); this.#available(); context.pcbScript(profile);
      context.completePcbOpening(); context.modelContext();
      const result = diagnosticBoundedObservation({ ...proof, openingObservation: observed, ancillaryFrame: context.ancillaryObservation() });
      this.#pcbSourceQualified = true;
      this.#pcbSourceProfile = profile;
      return result;
    } catch (caughtError) { this.#input.emit("error", error("PCB_OBSERVATION_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** One fixed 209 layer read through the original UI context and child RPC.
   * No bridge dispatch, new target, model scope or raw command is accepted. */
  public async observeLayers209(input: CurrentDisposableOpenSealedTarget): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = this.#pcbSourceProfile, target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (this.#purpose !== "diagnostic209" || context === null || this.#layers209Consumed || !this.#pcbSourceQualified ||
        profile === null ||
        this.#pcbFrameObservation?.ok !== true || this.#workersConsumed || this.#modelConsumed ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("LAYERS209_UNAVAILABLE"); }
    this.#enter(true); this.#layers209Consumed = true;
    try {
      const pcb = context.modelContext(), selected = context.pcbOpeningContext();
      const reprove = (): void => {
        this.#available(); context.pcbScript(profile);
        if (JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(selected) ||
            JSON.stringify(context.modelContext()) !== JSON.stringify(pcb)) { throw error("LAYERS209_CONTEXT"); }
      };
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      const result = decodeCurrentPcb209LayersReply(
        await this.#transfer(() => this.#pipe.observeLayers209(selected.uniqueContextId, target)), target);
      reprove(); await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      return result;
    } catch (caughtError) { this.#input.emit("error", error("LAYERS209_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** One fixed four-family209 DTO read through the original qualified child.
   * This stage owns no model scope, source baseline, write or Save authority. */
  public async observePrimitives209(input: CurrentDisposableOpenSealedTarget): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = this.#pcbSourceProfile, target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (this.#purpose !== "diagnostic209" || context === null || this.#primitives209Consumed || !this.#pcbSourceQualified ||
        profile === null || this.#pcbFrameObservation?.ok !== true || this.#workersConsumed || this.#modelConsumed ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("PRIMITIVES209_UNAVAILABLE"); }
    this.#enter(true); this.#primitives209Consumed = true;
    try {
      const pcb = context.modelContext(), selected = context.pcbOpeningContext();
      const reprove = (): void => {
        this.#available(); context.pcbScript(profile);
        if (JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(selected) ||
            JSON.stringify(context.modelContext()) !== JSON.stringify(pcb)) { throw error("PRIMITIVES209_CONTEXT"); }
      };
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      const result = decodeCurrentPcb209PrimitivesReply(
        await this.#transfer(() => this.#pipe.observePrimitives209(selected.uniqueContextId, target)), target);
      reprove(); await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      return result;
    } catch (caughtError) { this.#input.emit("error", error("PRIMITIVES209_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** One fixed extended209 DTO read through the original qualified child.
   * It grants no complete-board, source, parent ownership or writer authority. */
  public async observeExtendedPrimitives209(input: CurrentDisposableOpenSealedTarget): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = this.#pcbSourceProfile, target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (this.#purpose !== "diagnostic209" || context === null || this.#extendedPrimitives209Consumed || !this.#pcbSourceQualified ||
        profile === null || this.#pcbFrameObservation?.ok !== true || this.#workersConsumed || this.#modelConsumed ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("EXTENDED_PRIMITIVES209_UNAVAILABLE"); }
    this.#enter(true); this.#extendedPrimitives209Consumed = true;
    try {
      const pcb = context.modelContext(), selected = context.pcbOpeningContext();
      const reprove = (): void => {
        this.#available(); context.pcbScript(profile);
        if (JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(selected) ||
            JSON.stringify(context.modelContext()) !== JSON.stringify(pcb)) { throw error("EXTENDED_PRIMITIVES209_CONTEXT"); }
      };
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      const result = decodeCurrentPcb209ExtendedPrimitivesReply(
        await this.#transfer(() => this.#pipe.observeExtendedPrimitives209(selected.uniqueContextId, target)), target);
      reprove(); await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      return result;
    } catch (caughtError) { this.#input.emit("error", error("EXTENDED_PRIMITIVES209_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** One fixed Pad style209 DTO read through the original qualified child.
   * It grants no complete-board, source, parent ownership or writer authority. */
  public async observePadShapes209(input: CurrentDisposableOpenSealedTarget): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = this.#pcbSourceProfile, target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (this.#purpose !== "diagnostic209" || context === null || this.#padShapes209Consumed || !this.#pcbSourceQualified ||
        profile === null || this.#pcbFrameObservation?.ok !== true || this.#workersConsumed || this.#modelConsumed ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("PAD_SHAPES209_UNAVAILABLE"); }
    this.#enter(true); this.#padShapes209Consumed = true;
    try {
      const pcb = context.modelContext(), selected = context.pcbOpeningContext();
      const reprove = (): void => {
        this.#available(); context.pcbScript(profile);
        if (JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(selected) ||
            JSON.stringify(context.modelContext()) !== JSON.stringify(pcb)) { throw error("PAD_SHAPES209_CONTEXT"); }
      };
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      const result = decodeCurrentPcb209PadShapesReply(
        await this.#transfer(() => this.#pipe.observePadShapes209(selected.uniqueContextId, target)), target);
      reprove(); await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      return result;
    } catch (caughtError) { this.#input.emit("error", error("PAD_SHAPES209_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** One fixed Image shape209 DTO read through the original qualified child.
   * It grants no complete-board, source, parent ownership or writer authority. */
  public async observeImageShapes209(input: CurrentDisposableOpenSealedTarget): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = this.#pcbSourceProfile, target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (this.#purpose !== "diagnostic209" || context === null || this.#imageShapes209Consumed || !this.#pcbSourceQualified ||
        profile === null || this.#pcbFrameObservation?.ok !== true || this.#workersConsumed || this.#modelConsumed ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("IMAGE_SHAPES209_UNAVAILABLE"); }
    this.#enter(true); this.#imageShapes209Consumed = true;
    try {
      const pcb = context.modelContext(), selected = context.pcbOpeningContext();
      const reprove = (): void => {
        this.#available(); context.pcbScript(profile);
        if (JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(selected) ||
            JSON.stringify(context.modelContext()) !== JSON.stringify(pcb)) { throw error("IMAGE_SHAPES209_CONTEXT"); }
      };
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      const result = decodeCurrentPcb209ImageShapesReply(
        await this.#transfer(() => this.#pipe.observeImageShapes209(selected.uniqueContextId, target)), target);
      reprove(); await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      return result;
    } catch (caughtError) { this.#input.emit("error", error("IMAGE_SHAPES209_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** One fixed Arc shape209 DTO read through the original qualified child.
   * It grants no complete-board, source, parent ownership or writer authority. */
  public async observeArcShapes209(input: CurrentDisposableOpenSealedTarget): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = this.#pcbSourceProfile, target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (this.#purpose !== "diagnostic209" || context === null || this.#arcShapes209Consumed || !this.#pcbSourceQualified ||
        profile === null || this.#pcbFrameObservation?.ok !== true || this.#workersConsumed || this.#modelConsumed ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("ARC_SHAPES209_UNAVAILABLE"); }
    this.#pipe.assertPcb209ShapeStageCapacity();
    this.#enter(true); this.#arcShapes209Consumed = true;
    try {
      const pcb = context.modelContext(), selected = context.pcbOpeningContext();
      const reprove = (): void => {
        this.#available(); context.pcbScript(profile);
        if (JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(selected) ||
            JSON.stringify(context.modelContext()) !== JSON.stringify(pcb)) { throw error("ARC_SHAPES209_CONTEXT"); }
      };
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      const result = decodeCurrentPcb209ArcShapesReply(
        await this.#transfer(() => this.#pipe.observeArcShapes209(selected.uniqueContextId, target)), target);
      reprove(); await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      return result;
    } catch (caughtError) { this.#input.emit("error", error("ARC_SHAPES209_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** One fixed Poured shape209 DTO read through the original qualified child.
   * It grants no complete-board, source, parent ownership or writer authority. */
  public async observePouredShapes209(input: CurrentDisposableOpenSealedTarget): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = this.#pcbSourceProfile, target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (this.#purpose !== "diagnostic209" || context === null || this.#pouredShapes209Consumed || !this.#pcbSourceQualified ||
        profile === null || this.#pcbFrameObservation?.ok !== true || this.#workersConsumed || this.#modelConsumed ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("POURED_SHAPES209_UNAVAILABLE"); }
    this.#pipe.assertPcb209ShapeStageCapacity();
    this.#enter(true); this.#pouredShapes209Consumed = true;
    try {
      const pcb = context.modelContext(), selected = context.pcbOpeningContext();
      const reprove = (): void => {
        this.#available(); context.pcbScript(profile);
        if (JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(selected) ||
            JSON.stringify(context.modelContext()) !== JSON.stringify(pcb)) { throw error("POURED_SHAPES209_CONTEXT"); }
      };
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      const result = decodeCurrentPcb209PouredShapesReply(
        await this.#transfer(() => this.#pipe.observePouredShapes209(selected.uniqueContextId, target)), target);
      reprove(); await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      return result;
    } catch (caughtError) { this.#input.emit("error", error("POURED_SHAPES209_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** One fixed selection and component-pad association read from the original
   * qualified209 child. Component IDs select relations, never native programs. */
  public async observeSelectionRelations209(input: CurrentDisposableOpenSealedTarget, inputComponentIds: readonly string[]): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = this.#pcbSourceProfile, target = currentDisposableOpenSealedTargetSchema.parse(input);
    const componentIds = Object.freeze(currentPcb209SelectionRelationsComponentIdsSchema.parse(inputComponentIds));
    if (this.#purpose !== "diagnostic209" || context === null || this.#selectionRelations209Consumed || !this.#pcbSourceQualified ||
        profile === null || this.#pcbFrameObservation?.ok !== true || this.#workersConsumed || this.#modelConsumed ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("SELECTION_RELATIONS209_UNAVAILABLE"); }
    this.#enter(true); this.#selectionRelations209Consumed = true;
    try {
      const pcb = context.modelContext(), selected = context.pcbOpeningContext();
      const reprove = (): void => {
        this.#available(); context.pcbScript(profile);
        if (JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(selected) ||
            JSON.stringify(context.modelContext()) !== JSON.stringify(pcb)) { throw error("SELECTION_RELATIONS209_CONTEXT"); }
      };
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      const result = decodeCurrentPcb209SelectionRelationsReply(
        await this.#transfer(() => this.#pipe.observeSelectionRelations209(selected.uniqueContextId, target, componentIds)), target, componentIds);
      reprove(); await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      return result;
    } catch (caughtError) { this.#input.emit("error", error("SELECTION_RELATIONS209_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Fixed parent-only child reporting. The optional profile is an internal
   * synthetic-test seam, never part of the public lifecycle request. */
  public async inspectWorkers(profile?: DiagnosticWorkerScriptProfile): Promise<Readonly<RecordValue>> {
    if (this.#startupPurpose || this.#purpose === "diagnostic209") { throw error("STARTUP_LEGACY_ROUTE"); }
    const attachment = this.#stagedAttachment;
    if (this.#workersConsumed || this.#stagedContext === null || attachment === null || this.#inspectionConsumed ||
        this.#modelConsumed || (this.#stringPurpose ? !this.#pcbSourceQualified : this.#pcbOpeningConsumed)) {
      throw error("WORKER_INSPECTION_UNAVAILABLE");
    }
    this.#enter(true); this.#workersConsumed = true;
    try {
      const context = new CurrentPcbDiagnosticWorkerContext(attachment.targetId, attachment.sessionId, profile);
      this.#workerContext = context;
      await this.#observeParent();
      const reply = await this.#transfer(() => this.#pipe.enableWorkerDiscovery(event => { context.observeEvent(event); }));
      if (!exact(reply, [])) { throw error("WORKER_DISCOVERY_REPLY"); }
      // This is a bounded sample after the ACK, not a complete worker roster.
      const targets = await this.#observeParent();
      return context.finishInventory(targets);
    } catch (caughtError) { this.#input.emit("error", error("WORKER_INSPECTION_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  public async inspectWorkerScript(targetId: string): Promise<Readonly<RecordValue>> {
    const context = this.#workerContext;
    if (this.#workerScriptConsumed || context === null || !this.#workersConsumed) { throw error("WORKER_SCRIPT_UNAVAILABLE"); }
    this.#enter(true); this.#workerScriptConsumed = true;
    try {
      context.observeTargets(await this.#observeParent());
      const selected = context.selectWorker(targetId);
      this.#pipe.selectWorkerSession(selected.sessionId);
      const runtime = await this.#transfer(() => this.#pipe.enableWorkerRuntime());
      if (!exact(runtime, [])) { throw error("WORKER_RUNTIME_REPLY"); }
      const debuggerReply = await this.#transfer(() => this.#pipe.enableWorkerDebugger());
      if (!exact(debuggerReply, ["debuggerId"]) || typeof debuggerReply["debuggerId"] !== "string") { throw error("WORKER_DEBUGGER_REPLY"); }
      const source = await this.#transfer(() => this.#pipe.getWorkerScriptSource(context.script().scriptId));
      return context.finishSource(source, await this.#observeParent());
    } catch (caughtError) { this.#input.emit("error", error("WORKER_SOURCE_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** One fixed side-effect-checked sample. No caller code or context selector. */
  public async observeWorkerState(): Promise<Readonly<RecordValue>> {
    if (this.#startupPurpose) { throw error("STARTUP_LEGACY_ROUTE"); }
    const context = this.#workerContext;
    if (this.#stringPurpose || this.#workerStateConsumed || context === null || !this.#workerScriptConsumed) { throw error("WORKER_STATE_UNAVAILABLE"); }
    this.#enter(true); this.#workerStateConsumed = true;
    try {
      context.observeTargets(await this.#observeParent());
      const reply = await this.#transfer(() => this.#pipe.observeWorkerState(context.evaluationContext()));
      return context.finishState(reply, await this.#observeParent());
    } catch (caughtError) { this.#input.emit("error", error("WORKER_STATE_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Fixed read-only scope path in an already source-qualified PCB context.
   * No opened UI/worker or caller-provided handle can substitute for it. */
  public async observeModelState(): Promise<CurrentPcbDiagnosticModelObservation> {
    if (this.#purpose === "diagnostic209") { throw error("MODEL_OBSERVATION_UNAVAILABLE"); }
    if (this.#startupPurpose) { throw error("STARTUP_LEGACY_ROUTE"); }
    const context = this.#stagedContext;
    if (this.#stringPurpose || this.#modelConsumed || context === null || !this.#scriptConsumed || this.#inspectionConsumed ||
        this.#workersConsumed || this.#workerContext !== null ||
        this.#projectOpeningConsumed && !this.#pcbSourceQualified) { throw error("MODEL_OBSERVATION_UNAVAILABLE"); }
    this.#enter(true); this.#modelConsumed = true;
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      const selected = context.modelContext();
      await this.#observeParent();
      const assertCurrent = (): void => {
        this.#available();
        if (JSON.stringify(context.modelContext()) !== JSON.stringify(selected)) { throw error("MODEL_CONTEXT_CHANGED"); }
      };
      const runner = new CurrentPcbDiagnosticModelRunner({
        request: (command): Promise<unknown> => this.#transfer(() => this.#pipe.observeModel(command)), assertCurrent,
      }, selected.scriptId, selected.uniqueContextId);
      const result = await runner.observe();
      if (this.#pcbSourceQualified && result.documentUuid !== this.#projectOpeningTarget?.documentUuid) { throw error("MODEL_DOCUMENT_CHANGED"); }
      assertCurrent(); await this.#observeParent();
      await this.#verifyInstallation(); await this.#verify(); this.#available(); assertCurrent();
      return result;
    } catch (caughtError) {
      this.#observationFailure ??= currentPcbObservationFailureDetail(caughtError);
      this.#input.emit("error", error("MODEL_OBSERVATION_FAILED")); throw caughtError;
    }
    finally { this.#busy = false; }
  }

  /** Separate pre-create generation only. It collects both original contexts
   * in one retained lifetime but does not qualify backend delivery or writing. */
  public async observeStringPrecreate(before?: Awaited<ReturnType<typeof readExactSqlInventory>>): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, target = this.#projectOpeningTarget, worker = this.#workerContext;
    const pipe = this.#pipe;
    if (!this.#stringPurpose || !(pipe instanceof CurrentPcbStringPrecreatePipe) || this.#stringPrecreateConsumed || context === null || worker === null || target === null ||
        !this.#pcbSourceQualified || !this.#workerScriptConsumed || this.#modelConsumed || this.#workerStateConsumed) {
      throw error("STRING_PRECREATE_UNAVAILABLE");
    }
    this.#enter(true); this.#stringPrecreateConsumed = true;
    let phase: CurrentPcbObservationPhase = "owner";
    try {
      // Only synthetic owners without an admitted installation may omit SQL.
      // The lifecycle forwards its retained pre-navigation reader, never JSON.
      if (this.#installation !== null && before === undefined) { throw error("STRING_ORIGINAL_SQL_REQUIRED"); }
      if (before !== undefined) {
        const completion = readerCompletion(before);
        if (!completion.observedChildClose || completion.exitCode !== 0 || completion.exitSignal !== null) {
          throw error("STRING_ORIGINAL_SQL_REQUIRED");
        }
      }
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      const selected = context.modelContext(), workerContext = worker.evaluationContext();
      const producerContext = worker.producerContext(), uiContext = context.pcbOpeningContext();
      const windowTabId = this.#projectOpeningResult?.observation?.windowTabId;
      if (windowTabId === undefined || windowTabId !== this.#pcbFrameObservation?.windowTabId) { throw error("STRING_WINDOW_CHANGED"); }
      const assertCurrent = (): void => {
        this.#available();
        if (this.#closeConsumed || this.#terminationObserved || this.#releaseConsumed || this.#pipe.status().failure !== null ||
            this.#terminationObservation?.originalRootExited === true || this.#terminationObservation?.originalJobEmpty === true ||
            this.#stagedContext !== context || this.#workerContext !== worker || this.#projectOpeningTarget !== target ||
            JSON.stringify(context.modelContext()) !== JSON.stringify(selected) || worker.evaluationContext() !== workerContext ||
            JSON.stringify(worker.producerContext()) !== JSON.stringify(producerContext) ||
            JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(uiContext)) {
          throw error("STRING_CONTEXT_CHANGED");
        }
      };
      const runner = new CurrentPcbStringPrecreateRunner({
        request: (command): Promise<unknown> => this.#transfer(() => "stringPhase" in command
          ? pipe.observeStringPrecreate(command) : pipe.observeModel(command)),
        assertCurrent,
        observeCurrent: async (): Promise<void> => { assertCurrent(); await this.#observeParent(); assertCurrent(); },
      }, selected.scriptId, selected.uniqueContextId, workerContext, { ...target, windowTabId });
      const result = await runner.observe();
      phase = "owner-observation";
      assertCurrent(); await this.#observeParent(); assertCurrent();
      phase = "worker-producers";
      this.#stringWorkerRunner = new CurrentPcbStringWorkerProducerRunner({
        request: (command): Promise<unknown> => this.#transfer(() => pipe.observeWorkerProducers(command)), assertCurrent,
      }, producerContext, { projectUuid: target.projectUuid, branchUuid: target.branchUuid, windowTabId });
      const workerProducers = await this.#stringWorkerRunner.observe();
      phase = "move-producers";
      this.#stringMoveRunner = new CurrentPcbStringMoveRunner({
        request: (command): Promise<unknown> => this.#transfer(() => pipe.observeMoveProducers(command)), assertCurrent,
      }, selected, { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid, windowTabId });
      const moveProducers = await this.#stringMoveRunner.observe();
      const finiteEffects = inspectCurrentPcbStringFiniteEffects(this.#stringMoveRunner, moveProducers, this.#stringWorkerRunner, workerProducers);
      phase = "actor-clock";
      this.#stringActorRunner = new CurrentPcbStringActorClockRunner({
        request: (command): Promise<unknown> => this.#transfer(() => pipe.observeActorClock(command)), assertCurrent,
      }, { ui: uiContext.uniqueContextId, worker: workerContext, pcb: selected.uniqueContextId },
      { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid, windowTabId });
      const actorClock = await this.#stringActorRunner.observe();
      phase = "owner-final";
      assertCurrent(); await this.#observeParent(); assertCurrent();
      assertCurrent(); await this.#verifyInstallation(); await this.#verify(); assertCurrent();
      this.#stringWorkerRunner.requireOriginal(workerProducers); this.#stringActorRunner.requireOriginalPacket(actorClock);
      this.#stringMoveRunner.requireOriginal(moveProducers);
      phase = "bounds";
      const combined = freezeDeep({ ...result, schema: "easyeda-pro-control.pcb-string-precreate-observation.v3", workerProducers, moveProducers, finiteEffects, actorClock });
      // V2's680KiB plus16KiB move/startup and16KiB finite-effect report.
      if (Buffer.byteLength(canonicalJson(actorClock)) > 131_072 || Buffer.byteLength(canonicalJson(moveProducers)) > 16_384 ||
          Buffer.byteLength(canonicalJson(finiteEffects)) > 16_384 || Buffer.byteLength(canonicalJson(combined)) > 729_088) { throw error("STRING_COMBINED_BOUND"); }
      if (before !== undefined) {
        const provenance = prepareCurrentPcbStringSaveProvenance(this.#stringActorRunner, actorClock, before);
        assertCurrent();
        this.#stringActorPacket = actorClock; this.#stringBeforeSql = before; this.#stringSaveProvenance = provenance;
      }
      return combined;
    } catch (caughtError) {
      const failure = currentPcbObservationFailureDetail(caughtError) === null ?
        currentPcbObservationFailure("STRING_PRECREATE", phase, [caughtError], currentPcbStringWorkerProducerFailureDetail(caughtError)?.cleanup === "failed" ||
          currentPcbStringMoveFailureDetail(caughtError)?.cleanup === "failed") : caughtError;
      this.#observationFailure ??= currentPcbObservationFailureDetail(failure);
      this.#input.emit("error", error("STRING_PRECREATE_FAILED")); throw failure;
    }
    finally { this.#busy = false; }
  }

  /** Private in-process composition only. A copied observation/SQL object is
   * never adopted, and closing the original owner invalidates this live source.
   * Attribution retains its explicit false backend/clock/writer authority. */
  public originalStringSaveProvenance(): CurrentPcbStringSaveProvenance {
    this.#available();
    if (!this.#stringPurpose || this.#busy || this.#closeConsumed || this.#terminationObserved || this.#releaseConsumed ||
        this.#stringActorRunner === null || this.#stringActorPacket === null || this.#stringBeforeSql === null ||
        this.#stringSaveProvenance === null) { throw error("STRING_ORIGINAL_PROVENANCE_UNAVAILABLE"); }
    return requireOriginalCurrentPcbStringSaveProvenance(this.#stringSaveProvenance,
      this.#stringActorRunner, this.#stringActorPacket, this.#stringBeforeSql);
  }

  /** Optional fixed common baseline, before the unchanged precreate attempt.
   * The enclosing lifecycle supplies only its original pre-navigation reader. */
  public async observeCommonBaseline(before: Awaited<ReturnType<typeof readExactSqlInventory>>): Promise<CurrentPcbCommonBaselineResult> {
    const context = this.#stagedContext, target = this.#projectOpeningTarget, worker = this.#workerContext;
    const pipe = this.#pipe;
    if (!this.#stringPurpose || !(pipe instanceof CurrentPcbStringPrecreatePipe) || this.#commonBaselineConsumed ||
        this.#stringPrecreateConsumed || context === null || worker === null || target === null ||
        !this.#pcbSourceQualified || !this.#workerScriptConsumed || this.#modelConsumed || this.#workerStateConsumed) {
      throw error("COMMON_BASELINE_UNAVAILABLE");
    }
    this.#enter(true); this.#commonBaselineConsumed = true;
    const identity = { projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid };
    const progress: { phase: CurrentPcbCommonBaselineFailure["phase"] } = { phase: "owner-before" };
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      const selected = context.modelContext(), workerContext = worker.evaluationContext();
      const assertCurrent = (): void => {
        this.#available();
        if (this.#stagedContext !== context || this.#workerContext !== worker || this.#projectOpeningTarget !== target ||
            JSON.stringify(context.modelContext()) !== JSON.stringify(selected) || worker.evaluationContext() !== workerContext) {
          throw error("COMMON_CONTEXT_CHANGED");
        }
      };
      await this.#observeParent(); assertCurrent();
      const session = new CurrentPcbCommonBaselineSession({ before, identity, scriptId: selected.scriptId,
        uniqueContextId: selected.uniqueContextId, transport: {
          request: (command): Promise<unknown> => this.#transfer(() => pipe.observeCommonBaseline(command)), assertCurrent,
        } });
      this.#commonBaselineSession = session;
      const finishOwner = async (): Promise<void> => {
        progress.phase = "owner-after";
        assertCurrent(); await this.#observeParent(); assertCurrent();
        await this.#verifyInstallation(); await this.#verify(); assertCurrent();
      };
      let packet: Awaited<ReturnType<CurrentPcbCommonBaselineSession["observeAndJoin"]>>;
      try { packet = await session.observeAndJoin(); }
      catch (caughtError) {
        if (!session.comparisonRefused()) { throw caughtError; }
        // Only the original completed reader's comparison exception is eligible.
        // Native, decoder, cleanup and ownership exceptions never enter this path.
        session.requireOriginalComparisonRefusal(); await finishOwner();
        const observation = session.requireOriginalComparisonRefusal();
        this.#commonBaselineFailure = currentPcbCommonBaselineFailure(identity, "stored-relation", observation,
          session.retainedHistoricalHeader(), true);
        return currentPcbCommonBaselineRefusal(this.#commonBaselineFailure, sha256Json(observation));
      }
      await finishOwner();
      session.requireOriginalPacket(packet);
      return currentPcbCommonBaselineResult(packet);
    } catch (caughtError) {
      const session = this.#commonBaselineSession;
      this.#commonBaselineFailure = currentPcbCommonBaselineFailure(identity, progress.phase === "owner-after" ? progress.phase : session?.status().failurePhase ?? progress.phase,
        session?.retainedObservation() ?? null, session?.retainedHistoricalHeader() ?? null, false, session?.retainedFailure());
      this.#input.emit("error", error("COMMON_BASELINE_FAILED")); throw caughtError;
    } finally { this.#busy = false; }
  }

  /** Original retained diagnostic evidence only; callable after reader failure.
   * No historical JSON, new native dispatch or owner adoption is involved. */
  public retainedCommonBaselineFailure(): CurrentPcbCommonBaselineFailure | null { return this.#commonBaselineFailure; }

  async #observeParent(): Promise<RecordValue> {
    const context = this.#stagedContext;
    if (context === null) { throw error("WORKER_PARENT_UNAVAILABLE"); }
    context.assertCurrent();
    const targets = await this.#transfer(() => this.#pipe.getTargets());
    context.observeTarget(targets);
    context.observeFrames(await this.#transfer(() => this.#pipe.getFrameTree()));
    context.assertCurrent(); this.#workerContext?.assertCurrent();
    if (this.#stringPurpose) { this.#workerContext?.observeTargets(targets); }
    return targets;
  }

  /** Five bounded samples at original project/PCB boundaries. The native
   * protocol already supports these two fixed DOM reads. No caller selector,
   * source execution, editor-frame exception or native registry claim follows. */
  async #observeOpeningAncillary(): Promise<void> {
    const context = this.#stagedContext;
    if (context === null) { throw error("ANCILLARY_UNAVAILABLE"); }
    const frameId = context.openingAncillaryFrame();
    if (frameId === null) { return; }
    const owner = await this.#transfer(() => this.#pipe.getFrameOwner(frameId));
    if (context.openingAncillaryFrame() !== frameId) { throw error("ANCILLARY_CHANGED"); }
    const backend = owner["backendNodeId"];
    if (typeof backend !== "number" || !Number.isSafeInteger(backend) || backend < 1 || backend > 2_147_483_647) { throw error("ANCILLARY_BACKEND"); }
    const node = await this.#transfer(() => this.#pipe.describeFrameOwner(backend));
    context.observeOpeningAncillaryOwner(owner, node);
  }

  async #attach(context: CurrentPcbDiagnosticContext, targetId: string): Promise<void> {
    let sessionId: string | null = null;
    await this.#transfer(async () => {
      sessionId = await this.#pipe.attachTarget(targetId, event => { context.observeEvent(event); });
      return { sessionId };
    });
    if (sessionId === null) { throw error("ATTACH_REPLY"); }
    context.bindSession(sessionId);
    if (context === this.#stagedContext) { this.#stagedAttachment = Object.freeze({ targetId, sessionId }); }
  }

  async #inspectScript(context: CurrentPcbDiagnosticContext): Promise<Readonly<RecordValue>> {
    const runtime = await this.#transfer(() => this.#pipe.enableRuntime());
    if (!exact(runtime, [])) { throw error("RUNTIME_ENABLE_REPLY"); }
    const debuggerReply = await this.#transfer(() => this.#pipe.enableDebugger());
    if (!exact(debuggerReply, ["debuggerId"]) || typeof debuggerReply["debuggerId"] !== "string") { throw error("DEBUGGER_ENABLE_REPLY"); }
    const selected = context.script();
    const source = await this.#transfer(() => this.#pipe.getScriptSource(selected.scriptId));
    const targets = await this.#transfer(() => this.#pipe.getTargets());
    const frameTree = await this.#transfer(() => this.#pipe.getFrameTree());
    context.assertCurrent(); const result = context.finish(source, targets, frameTree);
    if ((this.#purpose === "worker-startup-footprint209" || footprintCopyObservationPurpose(this.#purpose) || this.#purpose === "worker-startup-footprint-saved209")) { this.#footprintUiSource = qualifyCurrentFootprintCopyUiSource(source["scriptSource"]); }
    return result;
  }

  /** Transfer the original source-qualified parent and pipe budget once. The
   * durable lifecycle owns intent; this capability cannot be recreated from
   * its journal. No project or worker is opened by the handoff itself. */
  public async handoffWorkerStartup(): Promise<CurrentPcbWorkerStartupHandoff> {
    const attachment = this.#stagedAttachment, context = this.#stagedContext, original = this.#binding;
    if (!this.#startupPurpose || !(this.#pipe instanceof CurrentPcbWorkerStartupDiscoveryPipe) ||
        this.#startupHandoffConsumed || context === null || attachment === null || original === null ||
        !this.#scriptConsumed || this.#inspectionConsumed || this.#projectOpeningConsumed || this.#pcbOpeningConsumed ||
        this.#workersConsumed || this.#workerContext !== null || this.#modelConsumed || !this.#launchSucceeded) {
      throw error("STARTUP_HANDOFF_UNAVAILABLE");
    }
    this.#enter(true); this.#startupHandoffConsumed = true;
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      await this.#observeParent(); await this.#observeOpeningAncillary();
      const selected = context.openingContext();
      if (selected.sessionId !== attachment.sessionId || this.#binding !== original || this.#pending !== null || this.#buffer.length > 0) {
        throw error("STARTUP_HANDOFF_CHANGED");
      }
      const prior = this.#pipe.handoff();
      if (prior.sessionId !== attachment.sessionId) { throw error("STARTUP_HANDOFF_SESSION"); }
      if (this.#purpose === "worker-startup-empty209" && prior.nextRequestId > CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.startupDerivation.discovery + 1) {
        throw error("STARTUP_EMPTY_DISCOVERY_BOUND");
      }
      const parent = Object.freeze({ ...attachment, nextRequestId: prior.nextRequestId });
      this.#startupParent = parent;
      const current = (): void => {
        this.#available();
        if (this.#binding !== original || this.#startupParent !== parent || !this.#launchSucceeded ||
            this.#terminationObserved || this.#releaseConsumed || this.#closeConsumed) { throw error("STARTUP_OWNER_CHANGED"); }
        const observed = this.#startupPcbSession?.status().transitionStarted === true ? context.pcbOpeningContext() : context.openingContext();
        if (observed.sessionId !== selected.sessionId || observed.uniqueContextId !== selected.uniqueContextId) { throw error("STARTUP_PARENT_CHANGED"); }
      };
      const reprove = async (): Promise<void> => {
        // The original native owner holds deny-write/delete installation and
        // Ancestor leases from full launch admission. Reprove those live leases
        // Around fresh facade/helper bytes; never adopt a returned JSON proof.
        current(); await this.#verify(); current();
        const before = await this.#request({ action: "worker-startup-reprove" });
        if (!exact(before, ["current"]) || before["current"] !== true) { throw error("STARTUP_NATIVE_REPROOF"); }
        current(); await this.#verifyStartupFacade(); current(); await this.#verify(); current();
        const after = await this.#request({ action: "worker-startup-reprove" });
        if (!exact(after, ["current"]) || after["current"] !== true) { throw error("STARTUP_NATIVE_REPROOF"); }
        current();
      };
      const native = Object.freeze<CurrentPcb209RatlineStartupNativeDependency>({
        requireOriginalParent: async (): Promise<CurrentPcbWorkerStartupParent> => { await reprove(); return parent; },
        assertOriginalTermination: async (): Promise<void> => {
          this.#available();
          if (this.#binding !== original || this.#startupParent !== parent) { throw error("STARTUP_OWNER_CHANGED"); }
          await this.#verify(); this.#available();
          const observed = terminationObservation(await this.#request({ action: "termination" }));
          await this.#verify(); this.#available();
          if (this.#binding !== original || !observed.terminated) { throw error("RETAIN_LIVE_OWNER"); }
          this.#terminationObservation = observed; this.#terminationObserved = true;
        },
        observeOriginalParentEvent: (event): void => { current(); context.observeEvent(event); current(); },
        exchange: async (request): Promise<unknown> => {
          // Poll and allocation cleanup remain usable after a semantic context
          // Refusal. They retain only the same original process/pipe handles.
          this.#available();
          if (this.#binding !== original || this.#startupParent !== parent || this.#released) { throw error("STARTUP_OWNER_CHANGED"); }
          await this.#verify(); this.#available();
          const result = await this.#request({ ...request });
          await this.#verify(); this.#available();
          if (this.#binding !== original || this.#startupParent !== parent) { throw error("STARTUP_OWNER_CHANGED"); }
          return result;
        },
      });
      const priorUsage = { receivedBytes: prior.receivedBytes, eventCount: prior.eventCount, eventBytes: prior.eventBytes };
      const requireOriginalPcbContext = async (): Promise<Readonly<{ sessionId: string; uniqueContextId: string }>> => {
        if (this.#purpose !== "worker-startup-empty209" || !(this.#startupPcbSession instanceof CurrentPcb209WorkerStartupPcbSession) ||
            this.#startupPcbSession.status().phase !== "completed") { throw error("STARTUP_EMPTY_PCB_REQUIRED"); }
        const pcb = this.#startupPcbSession;
        current(); await reprove(); current();
        if (this.#startupPcbSession !== pcb || pcb.status().phase !== "completed" || this.#stagedContext !== context) { throw error("STARTUP_EMPTY_PCB_CHANGED"); }
        const model = context.modelContext();
        if (model.sessionId !== parent.sessionId) { throw error("STARTUP_EMPTY_PCB_SESSION"); }
        const selectedModel = Object.freeze({ sessionId: model.sessionId, uniqueContextId: model.uniqueContextId });
        this.#startupEmptyPcbContext ??= selectedModel;
        if (canonicalJson(this.#startupEmptyPcbContext) !== canonicalJson(selectedModel)) { throw error("STARTUP_EMPTY_PCB_CHANGED"); }
        return this.#startupEmptyPcbContext;
      };
      let channel: CurrentPcbWorkerStartupChannel | CurrentPcb209WorkerStartupChannel | CurrentFootprintCopyPreparationChannel | CurrentFootprintCopyExecutionChannel | CurrentFootprintCombinedStartupChannel | CurrentFootprintCopySavedChannel | CurrentPcb209EmptyStartupChannel | CurrentPcb209RatlineContinuationChannel | CurrentPcb209RatlineStartupChannel;
      if (this.#purpose === "worker-startup-ratline-continuation209") {
        if (this.#continuationBudget === null) { throw error("CONTINUATION_BUDGET"); }
        this.#continuationBudget.closeDiscovery(prior.nextRequestId); channel = new CurrentPcb209RatlineContinuationChannel(native, this.#continuationBudget);
      } else if (this.#purpose === "worker-startup-ratline209") {
        if (this.#ratlineBudget === null) { throw error("RATLINE_BUDGET"); }
        this.#ratlineBudget.closeDiscovery(prior.nextRequestId);
        channel = new CurrentPcb209RatlineStartupChannel(native, this.#ratlineBudget);
      } else if (this.#purpose === "worker-startup-empty209") {
        if (this.#emptyAnchor === null) { throw error("STARTUP_EMPTY_ANCHOR"); }
        channel = new CurrentPcb209EmptyStartupChannel(native, { ...priorUsage, pollCount: this.#emptyPolls }, this.#emptyAnchor, requireOriginalPcbContext);
      } else if (this.#purpose === "worker-startup-footprint-saved209") {
        channel = new CurrentFootprintCopySavedChannel(native, priorUsage);
      } else if (this.#purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE) {
        channel = new CurrentFootprintCombinedStartupChannel(native, priorUsage);
      } else if ((this.#purpose === "worker-startup-footprint209" || this.#purpose === "worker-startup-footprint-copy209")) {
        channel = this.#purpose === "worker-startup-footprint-copy209" ? new CurrentFootprintCopyExecutionChannel(native, priorUsage) :
          new CurrentFootprintCopyPreparationChannel(native, priorUsage);
      } else {
        channel = this.#purpose === "worker-startup209" ? new CurrentPcb209WorkerStartupChannel(native, priorUsage) :
          new CurrentPcbWorkerStartupChannel(native, priorUsage);
      }
      this.#startupChannel = channel;
      let dependency: CurrentPcbWorkerStartupDependency;
      if (channel instanceof CurrentPcb209EmptyStartupChannel) {
        const emptyDependency = await channel.start(); this.#startupEmptyDependency = emptyDependency; dependency = emptyDependency;
      } else { dependency = await channel.start(); }
      current();
      if (footprintCopyObservationPurpose(this.#purpose)) {
        const manager = context.footprintCopyParentWorkerScript();
        const sameManager = (): void => {
          current();
          const actual = context.footprintCopyParentWorkerScript();
          if (actual.scriptId !== manager.scriptId || actual.sessionId !== manager.sessionId ||
              actual.uniqueContextId !== manager.uniqueContextId) { throw error("FOOTPRINT_PARENT_MANAGER_CHANGED"); }
        };
        bindCurrentFootprintCopyParentRoute(dependency, Object.freeze({ parentSessionId: manager.sessionId,
          parentUniqueContextId: manager.uniqueContextId, managerScriptId: manager.scriptId,
          assertOriginalSynchronous: sameManager,
          assertOriginal: async (): Promise<void> => { sameManager(); await reprove(); sameManager(); },
        }));
      }
      const opening = Object.freeze<CurrentPcbWorkerStartupOpeningBinding>({
        context: (): Readonly<{ sessionId: string; uniqueContextId: string }> => { current(); return selected; }, reprove,
        begin: (input, titleProof): Readonly<{ sessionId: string; uniqueContextId: string }> => {
          current();
          if (this.#projectOpeningConsumed) { throw error("PROJECT_OPENING_UNAVAILABLE"); }
          const target = currentDisposableOpenSealedTargetSchema.parse(input);
          currentPcbDiagnosticOpeningArguments(target, "preflight");
          this.#projectOpeningConsumed = true; this.#projectOpeningTarget = Object.freeze(target);
          return context.beginOpeningTransition(target.projectUuid, titleProof);
        },
        finish: (targets, frames): void => { current(); context.finishOpeningTransition(targets, frames); current(); },
        observeParent: (targets, frames): void => { current(); context.observeTarget(targets); context.observeFrames(frames); current(); },
        ancillaryFrame: (): string | null => { current(); return context.openingAncillaryFrame(); },
        observeAncillary: (owner, node): void => { current(); context.observeOpeningAncillaryOwner(owner, node); current(); },
        ancillaryObservation: (): RecordValue | null => { current(); return context.ancillaryObservation(); },
      });
      this.#startupHandoff = Object.freeze({ channel, dependency, opening,
        ...(this.#actorClockSource === null ? {} : { actorClockSourceQualification: this.#actorClockSource }) });
      return this.#startupHandoff;
    } finally { this.#busy = false; }
  }

  public retainedFootprintCopyUi(): Readonly<RecordValue> {
    return Object.freeze({ attempted: this.#footprintUiAttempted, reproofAttempted: this.#footprintUiReproofAttempted,
      runner: this.#footprintUiRunner?.retained() ?? null, parentReplies: Object.freeze([...this.#footprintUiParentReplies]) });
  }
  async #footprintUiParent(handoff: CurrentPcbWorkerStartupHandoff, current: () => Promise<void>, replies: unknown[] = this.#footprintUiParentReplies): Promise<void> {
    this.#available();
    const request = async (command: Parameters<CurrentPcbWorkerStartupDependency["request"]>[0]): Promise<RecordValue> => {
      await current(); const raw = captureCurrentPcbStringClockReply(await handoff.dependency.request(command)).value;
      replies.push(raw); await current();
      if (!record(raw)) { throw error("FOOTPRINT_UI_PARENT_REPLY"); } return raw;
    };
    const sessionId = handoff.opening.context().sessionId;
    const targets = await request({ method: "Target.getTargets", params: {} });
    const frames = await request({ method: "Page.getFrameTree", sessionId, params: {} });
    handoff.opening.observeParent(targets, frames); await current();
    const frameId = handoff.opening.ancillaryFrame();
    if (frameId !== null) {
      const owner = await request({ method: "DOM.getFrameOwner", sessionId, params: { frameId } });
      const backendNodeId = owner["backendNodeId"];
      if (typeof backendNodeId !== "number" || !Number.isSafeInteger(backendNodeId) || backendNodeId < 1 || backendNodeId > 2_147_483_647 ||
          handoff.opening.ancillaryFrame() !== frameId) { throw error("FOOTPRINT_UI_ANCILLARY"); }
      const node = await request({ method: "DOM.describeNode", sessionId, params: { backendNodeId, depth: 0, pierce: false } });
      if (handoff.opening.ancillaryFrame() !== frameId) { throw error("FOOTPRINT_UI_ANCILLARY"); }
      handoff.opening.observeAncillary(owner, node); await current();
    }
  }
  /** Bind the already inspected original UI to the same original construction
   * owner. This proves route selection only; destination/RPC ownership is not
   * inferred from matching project UUIDs. */
  public async observeFootprintCopyUi(opening: CurrentFootprintCopyOpeningOwner,
    result: CurrentFootprintCopyOpeningResult): Promise<CurrentFootprintCopyUiObservation> {
    const context = this.#stagedContext, handoff = this.#startupHandoff, source = this.#footprintUiSource;
    if ((this.#purpose !== "worker-startup-footprint209" && !footprintCopyObservationPurpose(this.#purpose)) || this.#footprintUiAttempted || handoff === null || context === null || source === null ||
        !(handoff.channel instanceof CurrentFootprintCopyPreparationChannel || handoff.channel instanceof CurrentFootprintCopyExecutionChannel || handoff.channel instanceof CurrentFootprintCombinedStartupChannel)) { throw error("FOOTPRINT_UI_UNAVAILABLE"); }
    this.#enter(true); this.#footprintUiAttempted = true;
    this.#footprintUiOpening = opening; this.#footprintUiOpeningResult = result;
    try {
      requireCurrentFootprintCopyUiSource(source);
      await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency);
      const channel = handoff.channel, original = this.#binding, script = context.script(), selected = context.openingContext();
      const current = async (): Promise<void> => {
        const same = (): void => {
          this.#available(); requireCurrentFootprintCopyUiSource(source);
          if (this.#binding !== original || this.#startupHandoff !== handoff || this.#stagedContext !== context || this.#footprintUiSource !== source ||
              this.#terminationObserved || this.#closeConsumed || this.#releaseConsumed || channel !== this.#startupChannel ||
              context.script().scriptId !== script.scriptId || context.openingContext().uniqueContextId !== selected.uniqueContextId ||
              context.openingContext().sessionId !== selected.sessionId || handoff.dependency.parentSessionId !== selected.sessionId) {
            throw error("FOOTPRINT_UI_OWNER_CHANGED");
          }
        };
        same(); await handoff.opening.reprove(); same();
      };
      await this.#footprintUiParent(handoff, current);
      const runner = new CurrentFootprintCopyUiRunner(source, Object.freeze({ assertCurrent: current,
        request: (command: CurrentFootprintCopyUiCommand): Promise<unknown> => requestFootprintUi.call(channel, command) }),
      { ...selected, scriptId: script.scriptId, ...result.workerIdentity });
      this.#footprintUiRunner = runner;
      const packet = await runner.observe();
      await this.#footprintUiParent(handoff, current);
      await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency); await current();
      this.#footprintUiPacket = packet; return packet;
    } finally { this.#busy = false; }
  }
  public async requireFootprintCopyUi(packet: CurrentFootprintCopyUiObservation): Promise<void> {
    const handoff = this.#startupHandoff, opening = this.#footprintUiOpening, result = this.#footprintUiOpeningResult, runner = this.#footprintUiRunner;
    if ((this.#purpose !== "worker-startup-footprint209" && !footprintCopyObservationPurpose(this.#purpose)) || this.#footprintUiReproofAttempted || runner === null || handoff === null ||
        opening === null || result === null || packet !== this.#footprintUiPacket) { throw error("FOOTPRINT_UI_ORIGINAL"); }
    this.#enter(true); this.#footprintUiReproofAttempted = true;
    try {
      await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency);
      await this.#footprintUiParent(handoff, handoff.opening.reprove);
      await runner.requireOriginal(packet);
      await this.#footprintUiParent(handoff, handoff.opening.reprove);
      await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency);
    } finally { this.#busy = false; }
  }
  public async releaseFootprintCopyUi(): Promise<void> {
    const runner = this.#footprintUiRunner;
    if ((this.#purpose !== "worker-startup-footprint209" && !footprintCopyObservationPurpose(this.#purpose)) || runner === null) { throw error("FOOTPRINT_UI_RELEASE"); }
    this.#enter(true);
    try {
      const clock = this.#footprintClockRegistrationRunner;
      if (clock !== null && !clock.retained().releaseAttempted) { await clock.release(); }
      if (clock !== null && !clock.retained().released) { throw error("FOOTPRINT_CLOCK_REGISTRATION_NOT_RELEASED"); }
      await runner.release();
    } finally { this.#busy = false; }
  }

  public retainedFootprintCopyClockRegistration(): Readonly<RecordValue> {
    return Object.freeze({ attempted: this.#footprintClockRegistrationAttempted, runner: this.#footprintClockRegistrationRunner?.retained() ?? null });
  }
  /** This separate execution-only observation retains the original renderer
   * registration. It does not observe an actual document-clock invocation. */
  public async observeFootprintCopyClockRegistration(opening: CurrentFootprintCopyOpeningOwner,
    result: CurrentFootprintCopyOpeningResult): Promise<CurrentFootprintCopyClockRegistrationObservation> {
    const context = this.#stagedContext, handoff = this.#startupHandoff, packet = this.#footprintUiPacket, ui = this.#footprintUiRunner;
    if (!footprintCopyObservationPurpose(this.#purpose) || this.#footprintClockRegistrationAttempted || context === null || handoff === null ||
        ui === null || packet === null || opening !== this.#footprintUiOpening || result !== this.#footprintUiOpeningResult || !this.#footprintUiReproofAttempted ||
        !(handoff.channel instanceof CurrentFootprintCopyExecutionChannel || handoff.channel instanceof CurrentFootprintCombinedStartupChannel) || CurrentFootprintCopyUiRunner.prototype.createClockRegistration !== createFootprintClockRegistration ||
        (CurrentFootprintCopyExecutionChannel.prototype.requestFootprintClockRegistration !== requestFootprintClockRegistration ||
          CurrentFootprintCombinedStartupChannel.prototype.requestFootprintClockRegistration !== requestFootprintClockRegistration)) { throw error("FOOTPRINT_CLOCK_REGISTRATION_UNAVAILABLE"); }
    this.#enter(true); this.#footprintClockRegistrationAttempted = true;
    try {
      const channel = handoff.channel, original = this.#binding, script = context.script(), selected = context.openingContext();
      const current = async (): Promise<void> => {
        const same = (): void => {
          this.#available();
          if (this.#binding !== original || this.#startupHandoff !== handoff || this.#stagedContext !== context || this.#footprintUiRunner !== ui || this.#footprintUiPacket !== packet ||
              this.#terminationObserved || this.#closeConsumed || this.#releaseConsumed || channel !== this.#startupChannel ||
              context.script().scriptId !== script.scriptId || context.openingContext().uniqueContextId !== selected.uniqueContextId ||
              context.openingContext().sessionId !== selected.sessionId || handoff.dependency.parentSessionId !== selected.sessionId ||
              CurrentFootprintCopyUiRunner.prototype.createClockRegistration !== createFootprintClockRegistration ||
              (CurrentFootprintCopyExecutionChannel.prototype.requestFootprintClockRegistration !== requestFootprintClockRegistration ||
                CurrentFootprintCombinedStartupChannel.prototype.requestFootprintClockRegistration !== requestFootprintClockRegistration)) { throw error("FOOTPRINT_CLOCK_REGISTRATION_OWNER_CHANGED"); }
        };
        same(); await handoff.opening.reprove(); same();
      };
      await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency); await current();
      const runner = createFootprintClockRegistration.call(ui, packet, Object.freeze({ assertCurrent: current,
        request: (command: CurrentFootprintCopyClockRegistrationCommand): Promise<unknown> => requestFootprintClockRegistration.call(channel, command) }));
      // Retain cleanup ownership before the first awaited capture request.
      this.#footprintClockRegistrationRunner = runner;
      const observation = await runner.observe(); await current(); await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency);
      this.#footprintClockRegistrationPacket = observation; return observation;
    } finally { this.#busy = false; }
  }
  public async sampleFootprintCopyClockRegistration(packet: CurrentFootprintCopyClockRegistrationObservation): Promise<CurrentFootprintCopyClockRegistrationSample> {
    const handoff = this.#startupHandoff, opening = this.#footprintUiOpening, result = this.#footprintUiOpeningResult, runner = this.#footprintClockRegistrationRunner;
    if (!footprintCopyObservationPurpose(this.#purpose) || runner === null || handoff === null || opening === null || result === null || packet !== this.#footprintClockRegistrationPacket) { throw error("FOOTPRINT_CLOCK_REGISTRATION_ORIGINAL"); }
    this.#enter(true);
    try { await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency); const sample = await runner.sampleOriginal(packet); await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency); return sample; }
    finally { this.#busy = false; }
  }
  public async releaseFootprintCopyClockRegistration(): Promise<void> {
    const runner = this.#footprintClockRegistrationRunner;
    if (!footprintCopyObservationPurpose(this.#purpose) || runner === null) { throw error("FOOTPRINT_CLOCK_REGISTRATION_RELEASE"); }
    this.#enter(true); try { await runner.release(); } finally { this.#busy = false; }
  }

  public retainedFootprintCopyManagerRoute(): Readonly<RecordValue> {
    return Object.freeze({ attempted: this.#footprintManagerAttempted, reproofAttempted: this.#footprintManagerReproofAttempted,
      runner: this.#footprintManagerRunner?.retained() ?? null, parentReplies: Object.freeze([...this.#footprintManagerParentReplies]) });
  }
  public async observeFootprintCopyManagerRoute(opening: CurrentFootprintCopyOpeningOwner,
    result: CurrentFootprintCopyOpeningResult): Promise<CurrentFootprintCopyManagerRouteObservation> {
    const context = this.#stagedContext, handoff = this.#startupHandoff, packet = this.#footprintUiPacket, ui = this.#footprintUiRunner;
    if ((this.#purpose !== "worker-startup-footprint209" && !footprintCopyObservationPurpose(this.#purpose)) || this.#footprintManagerAttempted || context === null || handoff === null ||
        ui === null || packet === null || opening !== this.#footprintUiOpening || result !== this.#footprintUiOpeningResult ||
        !this.#footprintUiReproofAttempted || !(handoff.channel instanceof CurrentFootprintCopyPreparationChannel || handoff.channel instanceof CurrentFootprintCopyExecutionChannel || handoff.channel instanceof CurrentFootprintCombinedStartupChannel)) { throw error("FOOTPRINT_MANAGER_ROUTE_UNAVAILABLE"); }
    this.#enter(true); this.#footprintManagerAttempted = true;
    try {
      const channel = handoff.channel, original = this.#binding, script = context.script(), selected = context.openingContext();
      const current = async (): Promise<void> => {
        const same = (): void => {
          this.#available();
          if (this.#binding !== original || this.#startupHandoff !== handoff || this.#stagedContext !== context || this.#footprintUiRunner !== ui ||
              this.#footprintUiPacket !== packet || this.#terminationObserved || this.#closeConsumed || this.#releaseConsumed ||
              channel !== this.#startupChannel || context.script().scriptId !== script.scriptId || context.openingContext().uniqueContextId !== selected.uniqueContextId ||
              context.openingContext().sessionId !== selected.sessionId || handoff.dependency.parentSessionId !== selected.sessionId) { throw error("FOOTPRINT_MANAGER_ROUTE_OWNER_CHANGED"); }
        };
        same(); await handoff.opening.reprove(); same();
      };
      this.#footprintManagerCurrent = current;
      await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency); await this.#footprintUiParent(handoff, current, this.#footprintManagerParentReplies);
      const runner = createFootprintManagerRoute.call(ui, packet, Object.freeze({ assertCurrent: current,
        request: (command: CurrentFootprintCopyManagerRouteCommand): Promise<unknown> => requestFootprintManagerRoute.call(channel, command) }));
      this.#footprintManagerRunner = runner;
      const observation = await runner.observe();
      await this.#footprintUiParent(handoff, current, this.#footprintManagerParentReplies); await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency); await current();
      this.#footprintManagerPacket = observation; return observation;
    } finally { this.#busy = false; }
  }
  public async requireFootprintCopyManagerRoute(packet: CurrentFootprintCopyManagerRouteObservation): Promise<void> {
    const current = this.#footprintManagerCurrent, handoff = this.#startupHandoff, opening = this.#footprintUiOpening, result = this.#footprintUiOpeningResult,
      runner = this.#footprintManagerRunner;
    if ((this.#purpose !== "worker-startup-footprint209" && !footprintCopyObservationPurpose(this.#purpose)) || this.#footprintManagerReproofAttempted || runner === null || handoff === null ||
        opening === null || result === null || current === null || packet !== this.#footprintManagerPacket) { throw error("FOOTPRINT_MANAGER_ROUTE_ORIGINAL"); }
    this.#enter(true); this.#footprintManagerReproofAttempted = true;
    try {
      await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency); await this.#footprintUiParent(handoff, current, this.#footprintManagerParentReplies);
      await runner.requireOriginal(packet);
      await this.#footprintUiParent(handoff, current, this.#footprintManagerParentReplies); await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency); await current();
    } finally { this.#busy = false; }
  }
  public async joinFootprintCopyManagerPeer(opening: CurrentFootprintCopyOpeningOwner, result: CurrentFootprintCopyOpeningResult,
    packet: CurrentFootprintCopyManagerRouteObservation): Promise<CurrentFootprintParentWorkerObservation> {
    const handoff = this.#startupHandoff, manager = this.#footprintManagerRunner;
    if (!footprintCopyObservationPurpose(this.#purpose) || this.#footprintPeerJoinAttempted || manager === null || handoff === null ||
        opening !== this.#footprintUiOpening || result !== this.#footprintUiOpeningResult || packet !== this.#footprintManagerPacket ||
        CurrentFootprintCopyManagerRouteRunner.prototype.requireOriginalWorkerPeer !== requireFootprintManagerPeer) { throw error("FOOTPRINT_PEER_JOIN"); }
    this.#enter(true); this.#footprintPeerJoinAttempted = true;
    try {
      const peer = await originalCurrentFootprintCopyParentPeer(opening, result, handoff.dependency);
      await requireFootprintManagerPeer.call(manager, packet, peer.runner, peer.packet);
      if (this.#footprintManagerRunner !== manager || this.#startupHandoff !== handoff ||
          CurrentFootprintCopyManagerRouteRunner.prototype.requireOriginalWorkerPeer !== requireFootprintManagerPeer) { throw error("FOOTPRINT_PEER_JOIN_CHANGED"); }
      return peer.packet;
    } finally { this.#busy = false; }
  }
  public async releaseFootprintCopyManagerRoute(): Promise<void> {
    const runner = this.#footprintManagerRunner;
    if ((this.#purpose !== "worker-startup-footprint209" && !footprintCopyObservationPurpose(this.#purpose)) || runner === null) { throw error("FOOTPRINT_MANAGER_ROUTE_RELEASE"); }
    this.#enter(true); try { await runner.release(); } finally { this.#busy = false; }
  }

  /** Return only the same dependency issued at the original broader handoff.
   * Old256 purposes refuse before any native call, PCB factory or SQL reread. */
  public requireWorkerStartupEmptyDependency209(): Promise<CurrentPcb209EmptyNativeDependency> {
    this.#available();
    const dependency = this.#startupEmptyDependency, handoff = this.#startupHandoff;
    if (this.#purpose !== "worker-startup-empty209" || dependency === null || handoff === null || handoff.dependency !== dependency ||
        !(this.#startupChannel instanceof CurrentPcb209EmptyStartupChannel) || handoff.channel !== this.#startupChannel) {
      throw error("STARTUP_EMPTY_NATIVE_PURPOSE_REQUIRED");
    }
    return (async (): Promise<CurrentPcb209EmptyNativeDependency> => {
      await dependency.assertOriginalOwner(); this.#available();
      if (this.#startupEmptyDependency !== dependency || this.#startupHandoff !== handoff || handoff.channel !== this.#startupChannel) {
        throw error("STARTUP_EMPTY_DEPENDENCY_CHANGED");
      }
      return dependency;
    })();
  }

  /** Private preparation for the same constructor-captured project's PCB.
   * No public action invokes this yet. Its caller must durably consume PCB
   * navigation intent before openAndQualify; preparation itself sends no open.
   * The actual context stays with its original native owner, never caller JSON. */
  public async prepareWorkerStartupPcbSession(opening: CurrentPcbWorkerStartupOpening,
    result: CurrentPcbWorkerStartupOpeningResult, input: CurrentDisposableOpenSealedTarget,
    reverifyCheckpoint: () => Promise<void>): Promise<CurrentPcbWorkerStartupPcbSession> {
    const context = this.#stagedContext, handoff = this.#startupHandoff;
    const target = currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(input).value);
    if (this.#purpose !== "worker-startup" || handoff === null || context === null || this.#startupPcbConsumed ||
        this.#startupPcbSession !== null || this.#projectOpeningTarget === null ||
        canonicalJson(target) !== canonicalJson(this.#projectOpeningTarget) || typeof reverifyCheckpoint !== "function") {
      throw error("STARTUP_PCB_UNAVAILABLE");
    }
    this.#enter(true); this.#startupPcbConsumed = true;
    try {
      await CurrentPcbWorkerStartupOpening.prototype.requireOriginalPcbDependency.call(opening, result, handoff.dependency, target);
      this.#available();
      const parent = context.openingContext();
      if (this.#startupHandoff !== handoff || this.#stagedContext !== context || parent.sessionId !== handoff.dependency.parentSessionId) {
        throw error("STARTUP_PCB_OWNER_CHANGED");
      }
      this.#startupPcbSession = new CurrentPcbWorkerStartupPcbSession(opening, result, handoff.dependency, context, target, reverifyCheckpoint);
      return this.#startupPcbSession;
    } finally { this.#busy = false; }
  }

  /** Prepare the same constructor-captured project's PCB. The purpose-specific
   * lifecycle must durably consume navigation intent before openAndQualify;
   * preparation itself sends no open. The actual context stays with its original
   * native owner. The callback returns the lifecycle's original completed preparation
   * inventory after verifying its managed checkpoint receipt and sealed target.
   * A new reader or equality with the live source hash is not a substitute. */
  public async prepareWorkerStartupPcbSession209(opening: CurrentPcb209WorkerStartupOpening,
    result: CurrentPcb209WorkerStartupOpeningResult, input: CurrentDisposableOpenSealedTarget,
    reverifyCheckpoint: () => Promise<Awaited<ReturnType<typeof readExactSqlInventory>>>): Promise<CurrentPcb209WorkerStartupPcbSession> {
    const context = this.#stagedContext, handoff = this.#startupHandoff;
    const target = currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(input).value);
    if (this.#purpose !== "worker-startup209" && this.#purpose !== "worker-startup-empty209" || handoff === null || context === null || this.#startupPcbConsumed ||
        this.#startupPcbSession !== null || this.#projectOpeningTarget === null ||
        canonicalJson(target) !== canonicalJson(this.#projectOpeningTarget) || typeof reverifyCheckpoint !== "function") {
      throw error("STARTUP_PCB_UNAVAILABLE");
    }
    this.#enter(true); this.#startupPcbConsumed = true;
    try {
      const dependency = await this.requireWorkerStartupEmptyDependency209();
      this.#available();
      if (dependency !== handoff.dependency) { throw error("STARTUP_EMPTY_ORIGINAL_DEPENDENCY_REQUIRED"); }
      await CurrentPcb209WorkerStartupOpening.prototype.requireOriginalPcbDependency.call(opening, result, handoff.dependency, target);
      this.#available();
      const parent = context.openingContext();
      if (this.#startupHandoff !== handoff || this.#stagedContext !== context || parent.sessionId !== handoff.dependency.parentSessionId) {
        throw error("STARTUP_PCB_OWNER_CHANGED");
      }
      this.#startupPcbSession = new CurrentPcb209WorkerStartupPcbSession(opening, result, handoff.dependency, context, target, reverifyCheckpoint);
      return this.#startupPcbSession;
    } finally { this.#busy = false; }
  }

  /** Allocate the fixed continuation on the same launch, context and channel.
   * The session proves the original opening before any PCB navigation. */
  public prepareWorkerStartupRatlineSession209(opening: CurrentPcb209WorkerStartupOpening,
    result: CurrentPcb209WorkerStartupOpeningResult, input: CurrentDisposableOpenSealedTarget,
    reverifyCheckpoint: () => Promise<Awaited<ReturnType<typeof readExactSqlInventory>>>): CurrentPcb209RatlineNativeSession {
    const channel = this.#startupChannel, context = this.#stagedContext, handoff = this.#startupHandoff;
    const target = currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(input).value);
    if (this.#purpose !== "worker-startup-ratline209" || handoff === null || context === null || this.#startupPcbConsumed ||
        this.#startupPcbSession !== null || !(channel instanceof CurrentPcb209RatlineStartupChannel) ||
        handoff.channel !== channel || this.#projectOpeningTarget === null || canonicalJson(target) !== canonicalJson(this.#projectOpeningTarget) ||
        typeof reverifyCheckpoint !== "function") { throw error("RATLINE_ORIGINAL_PURPOSE"); }
    this.#enter(true); this.#startupPcbConsumed = true;
    try {
      this.#available();
      if (this.#startupHandoff !== handoff || this.#stagedContext !== context || this.#startupChannel !== channel) { throw error("RATLINE_OWNER_CHANGED"); }
      this.#startupPcbSession = new CurrentPcb209RatlineNativeSession(opening, result, handoff.dependency, channel, context, target, reverifyCheckpoint);
      return this.#startupPcbSession;
    } finally { this.#busy = false; }
  }

  public prepareWorkerStartupRatlineContinuationSession209(opening: CurrentPcb209WorkerStartupOpening,
    result: CurrentPcb209WorkerStartupOpeningResult, input: CurrentDisposableOpenSealedTarget,
    reverifyCheckpoint: () => Promise<Awaited<ReturnType<typeof readExactSqlInventory>>>): CurrentPcb209RatlineContinuationNativeSession {
    const channel = this.#startupChannel, context = this.#stagedContext, handoff = this.#startupHandoff;
    const target = currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(input).value);
    if (this.#purpose !== "worker-startup-ratline-continuation209" || handoff === null || context === null || this.#startupPcbConsumed ||
        this.#startupPcbSession !== null || !(channel instanceof CurrentPcb209RatlineContinuationChannel) ||
        handoff.channel !== channel || this.#projectOpeningTarget === null || canonicalJson(target) !== canonicalJson(this.#projectOpeningTarget) ||
        typeof reverifyCheckpoint !== "function") { throw error("RATLINE_ORIGINAL_PURPOSE"); }
    this.#enter(true); this.#startupPcbConsumed = true;
    try {
      this.#available();
      if (this.#startupHandoff !== handoff || this.#stagedContext !== context || this.#startupChannel !== channel) { throw error("RATLINE_OWNER_CHANGED"); }
      this.#startupPcbSession = new CurrentPcb209RatlineContinuationNativeSession(opening, result, handoff.dependency, channel, context, target, reverifyCheckpoint);
      return this.#startupPcbSession;
    } finally { this.#busy = false; }
  }

  /** One fixed identity-only attachment. Expectations are comparison inputs,
   * not native installation, project-worker or CAD execution authority. */
  public async inspectFrameIdentity(input: DiagnosticFrameExpectation): Promise<Readonly<Record<string, unknown>>> {
    if (this.#startupPurpose) { throw error("STARTUP_STAGED_QUALIFICATION_REQUIRED"); }
    const expected = validateDiagnosticFrameExpectation(input);
    if (this.#inspectionConsumed || this.#browserObservationConsumed) { throw error("INSPECTION_CONSUMED"); }
    this.#enter(true); this.#inspectionConsumed = true;
    const context = new CurrentPcbDiagnosticContext(expected);
    try {
      context.selectTarget(await this.#transfer(() => this.#pipe.getTargets()));
      await this.#attach(context, expected.targetId);
      const page = await this.#transfer(() => this.#pipe.enablePage());
      if (!exact(page, [])) { throw error("PAGE_ENABLE_REPLY"); }
      context.observeFrame(await this.#transfer(() => this.#pipe.getFrameTree()));
      return await this.#inspectScript(context);
    } catch (caughtError) {
      this.#input.emit("error", error("IDENTITY_FAILED")); throw caughtError;
    } finally { this.#busy = false; }
  }

  public async observeApplicationWindow(): Promise<string | null> {
    this.#enter(true);
    try {
      await this.#verify(); this.#available(); const reply = await this.#request({ action: "window" });
      await this.#verify(); this.#available();
      if (!exact(reply, ["hwnd"]) || (reply["hwnd"] !== null && (typeof reply["hwnd"] !== "string" || !/^[1-9]\d{0,18}$/u.test(reply["hwnd"])))) { throw error("WINDOW_REPLY"); }
      return reply["hwnd"];
    } finally { this.#busy = false; }
  }

  public async requestNormalClose(hwnd: string): Promise<void> {
    if (this.#closeConsumed) { throw error("CLOSE_CONSUMED"); }
    if (!/^[1-9]\d{0,18}$/u.test(hwnd)) { throw error("WINDOW_INPUT"); }
    this.#enter(true); this.#closeConsumed = true;
    try {
      await this.#verify(); this.#available();
      const reply = await this.#request({ action: "normal-close", hwnd, confirmNormalClose: true });
      if (!exact(reply, ["closeDispatched", "saveOrDiscardSelected"]) || reply["closeDispatched"] !== true || reply["saveOrDiscardSelected"] !== false) { throw error("CLOSE_REPLY"); }
      await this.#verify(); this.#available();
    } finally { this.#busy = false; }
  }

  public async observeTermination(): Promise<boolean> {
    this.#enter();
    try {
      await this.#verify(); this.#available(); const reply = terminationObservation(await this.#request({ action: "termination" }));
      await this.#verify(); this.#available();
      this.#terminationObservation = reply;
      if (reply.terminated) { this.#terminationObserved = true; }
      return reply.terminated;
    } finally { this.#busy = false; }
  }

  /** Factory issuance plus private fields, including after deliberate release.
   * A constructor test seam or copied native binding cannot acquire this role. */
  public requireOriginalFootprintGeneration(): void {
    const original = footprintFactories.get(this);
    if (original === undefined || original.installation !== this.#installation ||
      this.#purpose !== "worker-startup-footprint-copy209" && this.#purpose !== "worker-startup-footprint-saved209") {
      throw error("FOOTPRINT_ORIGINAL_FACTORY");
    }
    if (this.#footprintSourceBinding !== null && canonicalJson({ ...this.#footprintSourceBinding, before: undefined }) !== this.#footprintSourceBindingText) {
      throw error("FOOTPRINT_TARGET_CHANGED");
    }
  }
  public originalFootprintSourceBinding(): CurrentFootprintCopyNativeTarget {
    this.requireOriginalFootprintGeneration();
    if (this.#footprintSourceBinding === null) { throw error("FOOTPRINT_SOURCE_NOT_SEALED"); }
    return this.#footprintSourceBinding;
  }
  public originalFootprintTermination(): object {
    this.requireOriginalFootprintGeneration();
    const observed = this.#terminationObservation;
    const noProcess = this.#noProcessProof ?? this.#footprintUnlaunchedRelease;
    if (this.#released && this.#childClosed && !this.#launchSucceeded && noProcess !== null) {
      footprintTerminations.set(noProcess, Object.freeze({ owner: this, binding: this.#binding, noProcess: true })); return noProcess;
    }
    if (!this.#terminationObserved || observed === null || !observed.terminated || this.#binding === null) { throw error("FOOTPRINT_ORIGINAL_TERMINATION"); }
    footprintTerminations.set(observed, Object.freeze({ owner: this, binding: this.#binding, noProcess: false })); return observed;
  }
  public requireFootprintTermination(original: object): void {
    this.requireOriginalFootprintGeneration(); const held = footprintTerminations.get(original);
    if (held?.owner !== this || held.binding !== this.#binding || (held.noProcess ? !this.#released || !this.#childClosed || this.#launchSucceeded || original !== (this.#noProcessProof ?? this.#footprintUnlaunchedRelease) : !this.#terminationObserved)) { throw error("FOOTPRINT_ORIGINAL_TERMINATION"); }
  }
  public observeFootprintCopyRelease(): "pending" | "released" {
    this.requireOriginalFootprintGeneration();
    if (!this.#releaseConsumed) { throw error("FOOTPRINT_RELEASE_NOT_ATTEMPTED"); }
    if (!this.#released || !this.#childClosed) { return "pending"; }
    if (this.#failure !== null || this.#child.exitCode !== 0 || this.#child.signalCode !== null) { throw error("FOOTPRINT_RELEASE_FAILED"); }
    return "released";
  }
  /** Bind the actual source preparation, retained opening and checkpoint once.
   * This selects closed snapshots only; it issues no writer qualification. */
  public async sealFootprintCopyExecutionSource(operationId: string, opening: CurrentFootprintCopyOpeningOwner,
    result: CurrentFootprintCopyOpeningResult, preparation: CurrentFootprintCopyPreparation,
    checkpoint: CheckpointReceipt, runtime: MachineProfile["runtime"]): Promise<void> {
    this.requireOriginalFootprintGeneration();
    const handoff = this.#startupHandoff, target = this.#projectOpeningTarget;
    if (this.#purpose !== "worker-startup-footprint-copy209" || handoff === null || target === null || this.#footprintSourceSealAttempted ||
      !/^footprint-copy-[a-z\d][a-z\d-]{0,95}$(?![\s\S])/u.test(operationId)) { throw error("FOOTPRINT_SOURCE_SEAL_CONSUMED"); }
    this.#footprintSourceSealAttempted = true;
    await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency);
    const prepared = await requireCurrentFootprintCopyOwned(preparation, opening);
    const source = `/mnt/${target.rawWindowsPath[0]?.toLowerCase()}/${target.rawWindowsPath.slice(3).replaceAll("\\", "/")}`;
    if (checkpoint.source !== source || prepared.before.checkpointSha256 !== checkpoint.checkpointSha256 ||
      prepared.sourcePlan.source.projectUuid !== target.projectUuid || prepared.sourcePlan.source.branchUuid !== target.branchUuid) { throw error("FOOTPRINT_SOURCE_SEAL_BINDING"); }
    const text = canonicalJson(checkpoint); const root = await controlRootCapability();
    const verified = await verifyCheckpoint(checkpoint.receiptPath, { expectedSource: source,
      artifactRoots: [join(controlDataDirectory(), "checkpoints")], controlRoot: root, maximumSourceBytes: 268_435_456 });
    await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency);
    const rechecked = await requireCurrentFootprintCopyOwned(preparation, opening);
    if (this.#projectOpeningTarget !== target || rechecked.before !== prepared.before || canonicalJson(checkpoint) !== text ||
      !verified.ok || verified.sourceChanged || !verified.sourceMatchesReceipt || !verified.checkpointMatchesReceipt ||
      !verified.sourceEqualsCheckpoint || verified.sourceSha256 !== checkpoint.sourceSha256 || verified.checkpointSha256 !== checkpoint.checkpointSha256) {
      throw error("FOOTPRINT_SOURCE_SEAL_DRIFT");
    }
    this.#footprintSourceBinding = Object.freeze({ operationId, target, source, runtime: Object.freeze({ ...runtime }),
      checkpoint: freezeDeep(checkpoint), before: prepared.before });
    this.#footprintSourceBindingText = canonicalJson({ ...this.#footprintSourceBinding, before: undefined });
  }
  public bindFootprintSavedSource(writer: CurrentFootprintCopyNativeOwner,
    after: Awaited<ReturnType<typeof readExactSqlInventory>>): void {
    this.requireOriginalFootprintGeneration(); const source = originalCurrentFootprintCopyNativeTarget(writer);
    const snapshot = requireCurrentFootprintCopyClosedSnapshot(writer, after);
    if (this.#purpose !== "worker-startup-footprint-saved209" || this.#launchConsumed || this.#footprintSourceBinding !== null ||
      !writer.status().released || !writer.status().helperClosed) { throw error("FOOTPRINT_SAVED_SOURCE_BINDING"); }
    const target = Object.freeze({ ...source.target, expectedSourceSha256: snapshot.checkpoint.sourceSha256 });
    this.#footprintSourceBinding = Object.freeze({ operationId: source.operationId, target, source: source.source,
      runtime: source.runtime, checkpoint: snapshot.checkpoint, before: after });
    this.#footprintSourceBindingText = canonicalJson({ ...this.#footprintSourceBinding, before: undefined });
  }
  /** One fresh application launch followed by its original UI source capture.
   * All stages retain their native failures and leave normal cleanup available. */
  public async startFootprintCopySavedGeneration(): Promise<void> {
    this.requireOriginalFootprintGeneration(); this.originalFootprintSourceBinding();
    if (this.#purpose !== "worker-startup-footprint-saved209" || this.#footprintSavedStartAttempted || this.#installation === null) {
      throw error("FOOTPRINT_SAVED_START_CONSUMED");
    }
    this.#footprintSavedStartAttempted = true; const executable = this.#installation.plan.files[0];
    if (executable === undefined) { throw error("FOOTPRINT_SAVED_INSTALLATION"); }
    await this.launch({ executable: executable.windowsPath, executableSha256: executable.sha256, confirmDiagnosticLaunch: true });
    await this.browserObservation();
    const selected = this.#browserTargets?.filter(value => value["type"] === "page" && value["attached"] === false &&
      typeof value["url"] === "string" && /^https:\/\/client\/editor\?cll=(?:trace|debug|info|warn|error)(?:#.*)?$/u.test(value["url"]));
    const targetId = selected?.[0]?.["targetId"];
    if (selected?.length !== 1 || typeof targetId !== "string") { throw error("FOOTPRINT_SAVED_BROWSER_TARGET"); }
    const frames = await this.inspectFrames(targetId), rows = frames["frames"];
    if (!Array.isArray(rows)) { throw error("FOOTPRINT_SAVED_FRAMES"); }
    const roots = rows.filter((value: unknown): value is RecordValue => record(value) && !Object.hasOwn(value, "parentId"));
    const frameId = roots[0]?.["id"];
    if (roots.length !== 1 || typeof frameId !== "string") { throw error("FOOTPRINT_SAVED_ROOT_FRAME"); }
    await this.inspectScript(frameId, CURRENT_PCB_209_OPENING_SCRIPTS.ui); await this.handoffWorkerStartup();
  }
  public async observeFootprintCopyUploadQueue(): Promise<unknown> {
    this.requireOriginalFootprintGeneration(); const origin = this.originalFootprintSourceBinding();
    const context = this.#stagedContext, handoff = this.#startupHandoff;
    if (this.#purpose !== "worker-startup-footprint-saved209" || handoff === null || context === null ||
      !(handoff.channel instanceof CurrentFootprintCopySavedChannel) || this.#footprintSavedQueues >= 2 || this.#closeConsumed) {
      throw error("FOOTPRINT_SAVED_QUEUE_CONSUMED");
    }
    this.#footprintSavedQueues += 1;
    const selected = context.openingContext();
    await handoff.dependency.assertOriginalOwner();
    const command = currentFootprintCopySavedQueueCommand({ ...selected, projectUuid: origin.target.projectUuid, branchUuid: origin.target.branchUuid });
    const raw = await handoff.channel.requestFootprintSavedUploadQueue(command); this.#footprintSavedQueueReplies.push(raw);
    await handoff.dependency.assertOriginalOwner();
    if (this.originalFootprintSourceBinding() !== origin || this.#startupHandoff !== handoff || this.#stagedContext !== context ||
      canonicalJson(context.openingContext()) !== canonicalJson(selected)) { throw error("FOOTPRINT_SAVED_QUEUE_CHANGED"); }
    return decodeCurrentFootprintCopySavedQueueReply(raw, { projectUuid: origin.target.projectUuid, branchUuid: origin.target.branchUuid });
  }
  public async openFootprintCopySavedProject(projection: CurrentFootprintCopyV2SavedProjection,
    guard: CurrentFootprintCopySavedOpenGuard): Promise<Readonly<{ state: CurrentFootprintCopyStatePacket; transport: CurrentFootprintCopySourceReadTransport }>> {
    this.requireOriginalFootprintGeneration(); const origin = this.originalFootprintSourceBinding();
    const handoff = this.#startupHandoff, target = currentFootprintCopyV2SavedTarget(projection);
    if (this.#purpose !== "worker-startup-footprint-saved209" || handoff === null || this.#footprintSavedOpenAttempted ||
      this.#footprintSavedQueues !== 1 || target.projectUuid !== origin.target.projectUuid || target.branchUuid !== origin.target.branchUuid ||
      projection.afterSqlSha256 !== origin.before.logicalSha256) {
      throw error("FOOTPRINT_SAVED_OPEN_CONSUMED");
    }
    this.#footprintSavedOpenAttempted = true;
    const opening = new CurrentFootprintCopySavedStartupOpening(handoff); this.#footprintSavedOpening = opening;
    const result = await opening.open(origin.target, (): Promise<void> => Promise.resolve(),
      (): Promise<void> => revalidateCurrentFootprintCopySavedOpenGuard(this, guard));
    const assignments = await opening.proveCurrentAssignments(result);
    const state = await opening.observeFootprintState(result, assignments);
    const transport = await opening.createFootprintSavedReadTransport(result, assignments, state, projection);
    this.requireOriginalFootprintGeneration();
    if (this.originalFootprintSourceBinding() !== origin || this.#footprintSavedOpening !== opening || this.status().profile !== "worker-startup-footprint-saved209" || this.#footprintSavedQueueReplies.length !== 2) {
      throw error("FOOTPRINT_SAVED_OPEN_CHANGED");
    }
    return Object.freeze({ state, transport });
  }

  /** Private String-native clock boundary. Not a public validation action or a
   * Save permit. The future writer must journal and seal these original tokens
   * before closing; historical JSON cannot recreate this retained issuer. */
  public async observeStringNativeClock(phase: CurrentPcbStringNativeClockPhase): Promise<CurrentPcbStringNativeClockObservation> {
    const original = this.#binding;
    if (!this.#stringPurpose || original === null || !this.#launchSucceeded ||
        phase === "termination" && !this.#terminationObserved ||
        phase !== "termination" && (this.#terminationObserved || this.#pipe.status().failure !== null)) {
      throw error("STRING_NATIVE_CLOCK_UNAVAILABLE");
    }
    this.#enter(true);
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      this.#stringNativeClock ??= new CurrentPcbStringNativeClockIssuer({
          request: async (request): Promise<unknown> => {
            await this.#verifyInstallation(); await this.#verify(); this.#available();
            const result = captureCurrentPcbStringClockReply(await this.#request({ ...request }));
            await this.#verifyInstallation(); await this.#verify(); this.#available(); return result.value;
          },
          assertCurrent: (selected): void => {
            this.#available();
            if (this.#binding !== original || !this.#launchSucceeded ||
                selected === "termination" && !this.#terminationObserved ||
                selected !== "termination" && (this.#terminationObserved || this.#pipe.status().failure !== null)) {
              throw error("STRING_NATIVE_CLOCK_OWNER_CHANGED");
            }
          },
        }, original);
      return await this.#stringNativeClock.observe(phase);
    } finally { this.#busy = false; }
  }

  /** Separate footprint purpose; only the low-level Windows sample reader is
   * shared with String. These tokens grant no server/document clock authority. */
  public async observeFootprintCopyWindowsClock(phase: CurrentFootprintCopyWindowsClockPhase): Promise<CurrentFootprintCopyWindowsClockObservation> {
    const original = this.#binding;
    if (!footprintCopyObservationPurpose(this.#purpose) || original === null || !this.#launchSucceeded) { throw error("FOOTPRINT_WINDOWS_CLOCK_PURPOSE"); }
    this.#enter(true);
    try {
      const owned = (): void => {
        if (!footprintCopyObservationPurpose(this.#purpose) || this.#binding !== original || !this.#launchSucceeded) { throw error("FOOTPRINT_WINDOWS_CLOCK_OWNER"); }
      };
      this.#footprintWindowsClock ??= new CurrentFootprintCopyWindowsClockIssuer(Object.freeze<CurrentFootprintCopyWindowsClockTransport>({
        assertOwned: owned,
        assertCurrent: (selected: CurrentFootprintCopyWindowsClockPhase): void => {
          owned(); this.#available();
          if (this.#releaseConsumed || selected === "termination" && !this.#terminationObserved ||
              selected !== "termination" && (this.#terminationObserved || this.#closeConsumed || this.#startupChannel?.status().failed === true)) { throw error("FOOTPRINT_WINDOWS_CLOCK_CURRENT"); }
        },
        request: async (request): Promise<unknown> => {
          owned(); await this.#verifyInstallation(); await this.#verify(); this.#available(); owned();
          const reply = captureCurrentPcbStringClockReply(await this.#request({ ...request }));
          owned(); await this.#verifyInstallation(); await this.#verify(); this.#available(); owned(); return reply.value;
        },
      }), original);
      return await this.#footprintWindowsClock.observe(phase);
    } finally { this.#busy = false; }
  }
  public requireRecordedFootprintCopyWindowsClock(observation: CurrentFootprintCopyWindowsClockObservation): CurrentFootprintCopyWindowsClockObservation {
    if (this.#footprintWindowsClock === null) { throw error("FOOTPRINT_WINDOWS_CLOCK_ORIGINAL"); }
    return this.#footprintWindowsClock.requireRecorded(observation);
  }
  public retainedFootprintCopyWindowsClock(): Readonly<Record<string, unknown>> | null { return this.#footprintWindowsClock?.evidence() ?? null; }

  #requireFootprintMain(attached: boolean): Binding {
    this.#available();
    if ((this.#purpose !== "worker-startup-footprint-main209" && this.#purpose !== CURRENT_FOOTPRINT_COMBINED_PURPOSE) || this.#binding === null || !this.#launchSucceeded ||
      this.#terminationObserved || this.#releaseConsumed || this.#closeConsumed || this.#mainTerminateAttempted || attached && !this.#mainAttached) {
      throw error("MAIN_ORIGINAL_OWNER");
    }
    return this.#binding;
  }
  #enterFootprintMain(): void {
    if (this.#purpose !== CURRENT_FOOTPRINT_COMBINED_PURPOSE) { this.#enter(true); return; }
    this.#available();
    if (this.#binding === null || this.#combinedMainBusy) { throw error("COMBINED_MAIN_BUSY_OR_UNLAUNCHED"); }
    // A renderer observation can await the same original main request. The
    // Sole main runner owns its own lease; both protocols serialize only the
    // Native exchange through #nativeTail, never an entire inspector wait.
    this.#combinedMainBusy = true;
  }
  #leaveFootprintMain(): void {
    if (this.#purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE) { this.#combinedMainBusy = false; }
    else { this.#busy = false; }
  }
  /** The helper discovers its own retained stderr endpoint and proves the
   * original root/Job/image and reciprocal TCP owners. No URL enters here. */
  public async attachFootprintMain(): Promise<void> {
    const original = this.#requireFootprintMain(false);
    if (this.#mainAttachAttempted) { throw error("MAIN_ATTACH_CONSUMED"); }
    this.#enterFootprintMain(); this.#mainAttachAttempted = true;
    try {
      await this.#verifyInstallation(); await this.#verify();
      if (this.#requireFootprintMain(false) !== original) { throw error("MAIN_OWNER_CHANGED"); }
      const reply = await this.#request({ action: "main-attach" });
      if (!exact(reply, ["attached"]) || reply["attached"] !== true) { throw error("MAIN_ATTACH_REPLY"); }
      await this.#verify();
      if (this.#requireFootprintMain(false) !== original) { throw error("MAIN_OWNER_CHANGED"); }
      this.#mainAttached = true;
    } finally { this.#leaveFootprintMain(); }
  }
  public async reproveFootprintMain(): Promise<void> {
    const original = this.#requireFootprintMain(true); this.#enterFootprintMain();
    try {
      await this.#verify();
      const reply = await this.#request({ action: "main-reprove" });
      if (!exact(reply, ["current"]) || reply["current"] !== true || this.#requireFootprintMain(true) !== original) { throw error("MAIN_REPROOF_REPLY"); }
      await this.#verify();
      if (this.#requireFootprintMain(true) !== original) { throw error("MAIN_OWNER_CHANGED"); }
    } finally { this.#leaveFootprintMain(); }
  }
  /** Internal fixed vocabulary only. The native helper chooses the original
   * connection and independently checks its own counters before each write. */
  public async sendFootprintMain(command: CurrentFootprintCopyMainBackendCommand | CurrentFootprintCopyMainRequestCollectCommand, requestId: number): Promise<void> {
    const original = this.#requireFootprintMain(true);
    if (requestId !== this.#mainRequestId + 1) { throw error("MAIN_REQUEST_ID"); }
    const collection = command.phase.startsWith("request-");
    if (collection && this.#purpose !== CURRENT_FOOTPRINT_COMBINED_PURPOSE) { throw error("MAIN_REQUEST_PURPOSE"); }
    const wire = collection ? currentFootprintCopyMainRequestWire(command, requestId) : currentFootprintCopyMainBackendWire(command, requestId);
    const cleanup = command.method === "Debugger.removeBreakpoint" || command.method === "Debugger.resume" || command.method === "Runtime.releaseObjectGroup";
    const maximumNormal = this.#purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE ? CURRENT_FOOTPRINT_COMBINED_PROFILE.main.normalRequestLimit : CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT.normalRequests;
    const maximumCleanup = this.#purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE ? CURRENT_FOOTPRINT_COMBINED_PROFILE.main.cleanupRequestLimit : CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT.cleanupRequests;
    if (cleanup ? this.#mainCleanupRequests >= maximumCleanup : this.#mainNormalRequests >= maximumNormal) { throw error("MAIN_REQUEST_BUDGET"); }
    this.#enterFootprintMain(); this.#mainRequestId += 1;
    if (cleanup) { this.#mainCleanupRequests += 1; } else { this.#mainNormalRequests += 1; }
    try {
      await this.#verify();
      if (this.#requireFootprintMain(true) !== original) { throw error("MAIN_OWNER_CHANGED"); }
      const reply = await this.#request({ ...wire.request });
      if (!exact(reply, ["written"]) || reply["written"] !== true) { throw error("MAIN_WRITE_REPLY"); }
      await this.#verify();
      if (this.#requireFootprintMain(true) !== original) { throw error("MAIN_OWNER_CHANGED"); }
    } finally { this.#leaveFootprintMain(); }
  }
  /** Returns only a bounded transport chunk. The private construction runner
   * owns message framing, outstanding replies and actual inspector events. */
  public async pollFootprintMain(cleanup: boolean): Promise<string> {
    if (typeof cleanup !== "boolean") { throw error("MAIN_POLL_INPUT"); }
    const original = this.#requireFootprintMain(true); this.#enterFootprintMain();
    try {
      const reply = await this.#request({ action: "main-poll", cleanup });
      const encoded = reply["bytes"];
      if (!exact(reply, ["bytes"]) || typeof encoded !== "string" || encoded.length > 43_692 ||
        !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(encoded)) { throw error("MAIN_POLL_REPLY"); }
      const bytes = Buffer.from(encoded, "base64");
      if (bytes.length > 32_768 || bytes.toString("base64") !== encoded || this.#requireFootprintMain(true) !== original) { throw error("MAIN_POLL_REPLY"); }
      return encoded;
    } finally { this.#leaveFootprintMain(); }
  }
  /** Explicit user-authorized cleanup for the original diagnostic Job, including
   * an initial main pause before any window exists. Acknowledgment is not exit. */
  public async terminateFootprintMain(confirmTerminateOriginalDiagnosticJob: true): Promise<void> {
    this.#available();
    // Native creation can retain a live original root before launch admission
    // Finishes. The cleanup path needs its retained binding, not a successful
    // Launch acknowledgment, main attachment or observed application window.
    const original = this.#binding;
    if (this.#purpose !== "worker-startup-footprint-main209" || original === null || this.#terminationObserved ||
      this.#releaseConsumed || this.#closeConsumed || this.#mainTerminateAttempted) { throw error("MAIN_ORIGINAL_CLEANUP_OWNER"); }
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Runtime callers must supply the exact explicit termination confirmation.
    if (confirmTerminateOriginalDiagnosticJob !== true) { throw error("MAIN_TERMINATE_CONFIRMATION"); }
    this.#enter(true); this.#mainTerminateAttempted = true;
    try {
      await this.#verify();
      if (this.#binding !== original) { throw error("MAIN_OWNER_CHANGED"); }
      const reply = await this.#request({ action: "main-terminate", confirmTerminateOriginalDiagnosticJob: true });
      if (!exact(reply, ["terminationDispatched"]) || reply["terminationDispatched"] !== true) { throw error("MAIN_TERMINATE_REPLY"); }
      await this.#verify(); this.#available(); if (this.#binding !== original) { throw error("MAIN_OWNER_CHANGED"); }
    } finally { this.#busy = false; }
  }
  /** Synchronous logical seal before the lifecycle awaits its durable journal.
   * The token is private to this exact original factory owner and binding. */
  public reserveFootprintCombinedAbort(): CurrentFootprintCombinedAbortReservation {
    this.#available();
    const original = this.#binding;
    if (this.#purpose !== CURRENT_FOOTPRINT_COMBINED_PURPOSE || !footprintCombinedFactories.has(this) ||
      footprintCombinedFactories.get(this) !== this.#installation || original === null || this.#terminationObserved ||
      this.#releaseConsumed || this.#combinedAbortAttempted) { throw error("COMBINED_ORIGINAL_ABORT_OWNER"); }
    const reservation: CurrentFootprintCombinedAbortReservation = Object.freeze({ profile: "private.current-footprint-combined-abort-reservation.v1", executionAuthorized: false });
    this.#combinedAbortAttempted = true; this.#mainTerminateAttempted = true;
    this.#combinedAbortReservation = reservation; this.#combinedAbortBinding = original;
    return reservation;
  }
  /** The lifecycle records durable intent before passing the original token.
   * Dispatch consumes once before any await. Acknowledgment never proves exit. */
  public async dispatchFootprintCombinedAbort(reservation: CurrentFootprintCombinedAbortReservation, confirmAbortOriginalCombinedJob: true): Promise<void> {
    this.#available();
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Runtime callers must supply the exact explicit original-Job abort confirmation.
    if (confirmAbortOriginalCombinedJob !== true) { throw error("COMBINED_ABORT_CONFIRMATION"); }
    const original = this.#combinedAbortBinding;
    if (reservation !== this.#combinedAbortReservation || original === null || this.#binding !== original || !this.#combinedAbortAttempted ||
      this.#purpose !== CURRENT_FOOTPRINT_COMBINED_PURPOSE || !footprintCombinedFactories.has(this) ||
      footprintCombinedFactories.get(this) !== this.#installation || this.#releaseConsumed || this.#combinedAbortDispatchAttempted) { throw error("COMBINED_ORIGINAL_ABORT_RESERVATION"); }
    this.#combinedAbortDispatchAttempted = true;
    await this.#verify();
    if (this.#binding !== original) { throw error("COMBINED_ABORT_OWNER_CHANGED"); }
    const reply = await this.#request({ action: "combined-abort", confirmAbortOriginalCombinedJob: true });
    if (!exact(reply, ["terminationDispatched"]) || reply["terminationDispatched"] !== true) { throw error("COMBINED_ABORT_REPLY"); }
    await this.#verify(); this.#available();
    if (this.#binding !== original) { throw error("COMBINED_ABORT_OWNER_CHANGED"); }
  }
  /** Direct private convenience; durable lifecycle users reserve synchronously,
   * persist intent, then dispatch the held token through the separate method. */
  public async abortFootprintCombined(confirmAbortOriginalCombinedJob: true): Promise<void> {
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Reject malformed runtime confirmation before consuming a logical reservation.
    if (confirmAbortOriginalCombinedJob !== true) { throw error("COMBINED_ABORT_CONFIRMATION"); }
    await this.dispatchFootprintCombinedAbort(this.reserveFootprintCombinedAbort(), true);
  }
  public async observeFootprintMainConstruction(): Promise<CurrentFootprintCopyMainBackendObservation> {
    this.#requireFootprintMain(false);
    if (this.#mainObservationAttempted) { throw error("MAIN_OBSERVATION_CONSUMED"); }
    this.#mainObservationAttempted = true;
    await this.attachFootprintMain();
    const runner = new CurrentFootprintCopyMainBackendRunner(Object.freeze({
      assertCurrent: (): Promise<void> => this.reproveFootprintMain(),
      send: (command: CurrentFootprintCopyMainBackendCommand, id: number): Promise<void> => this.sendFootprintMain(command, id),
      poll: (cleanup: boolean): Promise<string> => this.pollFootprintMain(cleanup),
    }));
    this.#mainRunner = runner; return runner.observe();
  }
  public retainedFootprintMainConstruction(): ReturnType<CurrentFootprintCopyMainBackendRunner["retained"]> | null {
    return this.#mainRunner?.retained() ?? null;
  }

  /** Only the actual new factory and its own private runner issue a lease.
   * Historical main/copy owners and constructor test seams cannot supply it. */
  public combinedMainCapability(): CurrentFootprintCombinedMainCapability {
    const runner = this.#mainRunner;
    if (runner === null || !runner.retained().completed || runner.retained().failed || runner.retained().pendingReplies !== 0) { throw error("COMBINED_MAIN_CAPTURE_REQUIRED"); }
    this.requireOriginalCombinedMainRunner(runner, "normal");
    if (this.#combinedMainCapability === null) {
      this.#combinedMainCapability = Object.freeze({ profile: "private.current-footprint-combined-main-capability.v1", executionAuthorized: false });
      footprintCombinedCapabilities.set(this.#combinedMainCapability, this);
    }
    return this.#combinedMainCapability;
  }
  /** Birth-only factory identity survives cleanup; it never admits a new
   * process or upgrades an old diagnostic owner after a restart. */
  public requireOriginalFootprintCombinedGeneration(): void {
    if (this.#purpose !== CURRENT_FOOTPRINT_COMBINED_PURPOSE || !footprintCombinedFactories.has(this) ||
      footprintCombinedFactories.get(this) !== this.#installation) { throw error("COMBINED_ORIGINAL_OWNER"); }
  }
  public requireOriginalCombinedMainRunner(runner: CurrentFootprintCopyMainBackendRunner, mode: "normal" | "cleanup" | "exited"): boolean {
    if (this.#purpose !== CURRENT_FOOTPRINT_COMBINED_PURPOSE || footprintCombinedFactories.get(this) !== this.#installation ||
      !footprintCombinedFactories.has(this) || this.#mainRunner !== runner || this.#binding === null || !this.#launchSucceeded) { throw error("COMBINED_MAIN_ORIGINAL"); }
    if (mode === "normal") { this.#requireFootprintMain(true); }
    else if (mode === "cleanup") {
      if (!retainedOwners.has(this) || this.#releaseConsumed || this.#released || this.#childClosed) { throw error("COMBINED_MAIN_CLEANUP_ENDED"); }
    } else if (mode !== "exited") { throw error("COMBINED_MAIN_MODE"); }
    return this.#terminationObserved && this.#terminationObservation?.terminated === true;
  }

  public releaseClosed(): Promise<void> { return this.#release(false); }

  /** Original helper only, before this owner has ever invoked launch. Native
   * state independently proves no creation attempt and an empty original Job. */
  public async releaseUnlaunched(): Promise<void> {
    if (this.#launchConsumed || this.#binding !== null) { throw error("UNLAUNCHED_RELEASE_REFUSED"); }
    await this.#release(true);
  }

  /** A completed original launch refusal is not an uncertain dispatch. The
   * helper independently proves its creation phase and empty original Job. */
  public async releaseNoProcess(): Promise<Readonly<CurrentPcbDiagnosticNoProcessRelease>> {
    if (this.#releaseConsumed) { throw error("RELEASE_CONSUMED"); }
    if (!this.#noProcessCleanupAvailable()) { throw error("NO_PROCESS_CLEANUP_UNAVAILABLE"); }
    const launchRequestOutcome = this.#launchRequestIssued ? "native-refused" : "not-issued";
    this.#enter();
    try {
      await this.#verify(); this.#available();
      this.#releaseConsumed = true;
      const proof = noProcessState(await this.#request({ action: "release-no-process" }), true);
      if (launchRequestOutcome === "not-issued" ? proof.creationState !== "not-entered" : JSON.stringify(proof) !== JSON.stringify(this.#noProcessProof)) {
        throw error("NO_PROCESS_PROOF_CHANGED");
      }
      this.#noProcessProof = proof; await this.#finishRelease();
      return Object.freeze({ launchRequestOutcome, ...proof, processCreated: false, released: true });
    } finally { this.#busy = false; }
  }

  #noProcessCleanupAvailable(): boolean {
    return this.#launchConsumed && this.#launchSettled && !this.#launchSucceeded && this.#binding === null &&
      !this.#busy && this.#pending === null && this.#failure === null && !this.#releaseConsumed && !this.#released &&
      !this.#childClosed && this.#child.exitCode === null && this.#child.signalCode === null &&
      (!this.#launchRequestIssued || this.#nativeLaunchRefused && this.#noProcessProof !== null);
  }

  async #release(unlaunched: boolean): Promise<void> {
    if (this.#releaseConsumed) { throw error("RELEASE_CONSUMED"); }
    this.#enter();
    try {
      await this.#verify(); this.#available();
      if (!unlaunched) {
        const termination = terminationObservation(await this.#request({ action: "termination" }));
        if (!termination.terminated) { throw error("RETAIN_LIVE_OWNER"); }
        this.#terminationObservation = termination; this.#terminationObserved = true;
        if (this.#startupChannel !== null && !this.#startupChannel.status().released) {
          await this.#startupChannel.releaseAfterTermination();
        }
        if (this.#footprintSavedOpening !== null && !this.#footprintSavedOpeningReleased) {
          await this.#footprintSavedOpening.releaseAfterTermination(); this.#footprintSavedOpeningReleased = true;
        }
      }
      this.#releaseConsumed = true;
      // Native release independently observes original root and Job again.
      // A rejected live release consumes only this call, never closes a pipe.
      const reply = await this.#request({ action: unlaunched ? "release-unlaunched" : "release" });
      if (!exact(reply, unlaunched ? ["released", "launchNeverAttempted"] : ["released"]) || reply["released"] !== true ||
          unlaunched && reply["launchNeverAttempted"] !== true) { throw error("RELEASE_REPLY"); }
      if (unlaunched && this.#purpose === "worker-startup-footprint-saved209") { this.#footprintUnlaunchedRelease = Object.freeze(reply); }
      await this.#finishRelease();
    } finally { this.#busy = false; }
  }

  async #finishRelease(): Promise<void> {
    this.#released = true;
    this.#child.stdin.end();
    await this.#closed.promise;
    if (this.#failure !== null) { throw error(this.#failure); }
    if (this.#child.exitCode !== 0 || this.#child.signalCode !== null) { throw error("RELEASE_EXIT"); }
    this.#input.destroy(); this.#output.destroy();
    // Local synthetic adapters only. Native pipes were released after closure.
    await delay(0); this.#pipe.releaseClosedListeners();
    retainedOwners.delete(this);
  }

  #available(): void {
    if (this.#failure !== null || this.#released || this.#childClosed || this.#child.exitCode !== null || this.#child.signalCode !== null) { throw error(this.#failure ?? "UNAVAILABLE"); }
  }
  #enter(requireLaunch = false): void {
    this.#available();
    if (this.#busy) { throw error("BUSY"); }
    if (requireLaunch && this.#binding === null) { throw error("NO_LAUNCH"); }
    this.#busy = true;
  }
  async #discover(kind: "version" | "targets"): Promise<RecordValue> {
    this.#enter(true);
    try { return await this.#transfer(() => kind === "version" ? this.#pipe.getVersion() : this.#pipe.getTargets()); }
    finally { this.#busy = false; }
  }
  async #transfer(request: () => Promise<RecordValue>): Promise<RecordValue> {
    if (this.#startupParent !== null) { throw error("STARTUP_LEGACY_TRANSFER_DISABLED"); }
    try {
      if (!this.#launchSucceeded) { throw error("CLEANUP_ONLY"); }
      await this.#verify(); this.#available();
      const reply = request();
      // Attach rejection before any await, including the native write callback.
      const observed = (async (): Promise<{ value: RecordValue } | { cause: unknown }> => {
        try { return { value: await reply }; } catch (caughtError) { return { cause: caughtError }; }
      })();
      await this.#send;
      while (this.#pipe.status().pendingRequestId !== null) {
        this.#available(); const chunk = await this.#request({ action: "poll" });
        if (!exact(chunk, ["bytes"]) || typeof chunk["bytes"] !== "string" || chunk["bytes"].length > 87_384 ||
            !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(chunk["bytes"])) { throw error("PIPE_CHUNK"); }
        const bytes = Buffer.from(chunk["bytes"], "base64");
        if (bytes.toString("base64") !== chunk["bytes"] || bytes.length > 65_536) { throw error("PIPE_CHUNK"); }
        if (bytes.length > 0) { this.#input.write(bytes); } else { await delay(20); }
      }
      const result = await observed;
      if ("cause" in result) {
        // Preserve only the native label already admitted by #data, never
        // Arbitrary PowerShell, OS, path, payload or exception text. This is a
        // Diagnostic cause, not proof that WriteFile was never entered.
        if (this.#nativeSendError !== null && result.cause instanceof Error &&
            result.cause.message === "PCB_DIAGNOSTIC_PIPE_OUTPUT") {
          throw new Error(`PCB_DIAGNOSTIC_PIPE_OUTPUT:${this.#nativeSendError}`);
        }
        throw result.cause;
      }
      await this.#verify(); this.#available(); return result.value;
    } catch (caughtError) {
      // A malformed helper chunk must poison discovery immediately, not leave
      // Its prior request pending until the byte transport's later deadline.
      // This local adapter error preserves every native endpoint and normal close.
      this.#input.emit("error", error("DISCOVERY_FAILED")); throw caughtError;
    }
  }
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- This adapter must settle the original Writable completion callback after native WriteFile.
  async #sendFrame(chunk: unknown, callback: (cause?: Error | null) => void): Promise<void> {
    try {
      if (!Buffer.isBuffer(chunk)) { throw error("OUTBOUND_FRAME"); }
      const result = await this.#request(this.#stringPurpose ? stringPrecreateNativeRequest(chunk) : diagnosticNativeRequest(chunk));
      if (!exact(result, ["written"]) || result["written"] !== true) { throw error("WRITE_ACK"); }
      // oxlint-disable-next-line promise/prefer-await-to-callbacks, eslint/no-useless-return -- Writable completion must be the terminal branch operation.
      callback(); return;
    } catch {
      // oxlint-disable-next-line promise/prefer-await-to-callbacks, eslint/no-useless-return -- Native failure settles the Writable callback as the terminal branch operation.
      callback(error("WRITE_FAILED")); return;
    }
  }
  #request(request: RecordValue): Promise<RecordValue> {
    if (this.#startupParent === null && this.#purpose !== CURRENT_FOOTPRINT_COMBINED_PURPOSE) { return this.#requestNow(request); }
    // The startup channel polls independently of lifecycle cleanup. Serialize
    // Both against the same retained helper, never a second poll owner.
    const next = (async (): Promise<RecordValue> => { await this.#nativeTail; return this.#requestNow(request); })();
    this.#nativeTail = (async (): Promise<void> => {
      try { await next; } catch {
        // The original caller retains the refusal.
      }
    })();
    return next;
  }
  #requestNow(request: RecordValue): Promise<RecordValue> {
    this.#available();
    if (this.#pending !== null) { throw error("REQUEST_PENDING"); }
    const combinedCleanup = combinedCleanupControl(request);
    if ((this.#combinedAbortAttempted || this.#combinedOutputCleanupOnly) && !combinedCleanup) { throw error("COMBINED_CLEANUP_ONLY"); }
    if (this.#combinedOutputCleanupOnly) {
      if (this.#combinedCleanupControls >= CURRENT_FOOTPRINT_COMBINED_PROFILE.helperStdout.cleanupControlLimit) { throw error("COMBINED_CLEANUP_CONTROL_BOUND"); }
      this.#combinedCleanupControls += 1;
    }
    if (this.#ratlineBudget !== null) {
      assertOriginalCurrentPcb209RatlineBudget(this.#ratlineBudget);
      if (request["action"] === "launch") { this.#ratlineBudget.assertNormal(); }
      if (request["action"] === "poll") { this.#ratlineBudget.consumePoll(); }
      else { this.#ratlineBudget.consumeHelperControl(ratlineCleanupControl(request, this.#ratlineBudget.snapshot().phase === "cleanup")); }
      if (request["action"] === "worker-startup-ratline-abort") { this.#ratlineBudget.beginCleanup(); }
      const requestId = request["requestId"];
      if (requestId !== undefined) {
        if (typeof requestId !== "number") { throw error("RATLINE_REQUEST_ID"); }
        if (this.#startupChannel instanceof CurrentPcb209RatlineStartupChannel) {
          this.#ratlineBudget.consumeRequest(requestId, this.#startupChannel.classifyPending(requestId));
        } else { this.#ratlineBudget.consumeDiscoveryRequest(requestId); }
      }
    }
    if (this.#continuationBudget !== null) {
      assertOriginalCurrentPcb209RatlineContinuationBudget(this.#continuationBudget);
      if (request["action"] === "launch") { this.#continuationBudget.assertNormal(); }
      if (request["action"] === "poll") { this.#continuationBudget.consumePoll(); }
      else { this.#continuationBudget.consumeHelperControl(ratlineCleanupControl(request, this.#continuationBudget.snapshot().phase === "cleanup")); }
      if (request["action"] === "worker-startup-ratline-continuation-abort") { this.#continuationBudget.beginCleanup(); }
      const requestId = request["requestId"];
      if (requestId !== undefined) {
        if (typeof requestId !== "number") { throw error("RATLINE_REQUEST_ID"); }
        if (this.#startupChannel instanceof CurrentPcb209RatlineContinuationChannel) {
          this.#continuationBudget.consumeRequest(requestId, this.#startupChannel.classifyPending(requestId));
        } else { this.#continuationBudget.consumeDiscoveryRequest(requestId); }
      }
    }
    if (this.#purpose === "worker-startup-empty209") {
      if (request["action"] === "poll") {
        if (this.#emptyPolls >= CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.polling.limit) { throw error("STARTUP_EMPTY_POLL_BOUND"); }
        this.#emptyPolls += 1;
      } else {
        const action = request["action"], phase = request["startupPhase"];
        const cleanup = typeof action === "string" && ["identity", "window", "normal-close", "termination", "release", "release-unlaunched", "no-process-proof", "release-no-process"].includes(action) ||
          action === "worker-startup-send" && typeof phase === "string" && ["release", "remove", "resume", "start"].includes(phase) ||
          request["action"] === "worker-startup-empty-common" && request["commonPhase"] === "release" ||
          request["action"] === "worker-startup-empty-root" && request["rootPhase"] === "release";
        const maximum = CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.helperControlMessages - (cleanup ? 0 : 128);
        if (this.#emptyControls >= maximum) { throw error("STARTUP_EMPTY_HELPER_BOUND"); }
        this.#emptyControls += 1;
      }
    }
    const deferred = Promise.withResolvers<RecordValue>(), id = randomBytes(16).toString("hex");
    const launch = request["action"] === "launch";
    const pending: Pending = { id, resolve: deferred.resolve, reject: deferred.reject, launch, poll: request["action"] === "poll",
      mainAction: mainNativeActions.find(action => action === request["action"]) ?? null, combinedCleanup,
      send: request["action"] === "send" || request["action"] === "worker-startup-send" || request["action"] === "worker-startup-parent" ||
        request["action"] === "worker-startup-empty-common" || request["action"] === "worker-startup-empty-root" ||
        request["action"] === "worker-startup-ratline" || request["action"] === "worker-startup-ratline-continuation" || request["action"] === "main-send" || request["action"] === "main-request-send", written: false, reply: null,
      timer: setTimeout(() => { this.#fail("HELPER_DEADLINE"); }, 15_000) };
    this.#pending = pending;
    if (launch) { this.#launchRequestIssued = true; }
    try {
      const data = `${JSON.stringify({ ...this.#binding, ...request, id })}\n`;
      const combinedRequest = this.#purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE && request["action"] === "main-request-send";
      const maximum = combinedRequest || request["method"] === "Runtime.callFunctionOn" && (request["action"] === "worker-startup-parent" &&
        (request["parentPhase"] === "preflight" || request["parentPhase"] === "open-project" ||
          request["parentPhase"] === "pcb-preflight" || request["parentPhase"] === "pcb-open-document" || request["parentPhase"] === "pcb-observe") || request["action"] === "send" &&
        (request["openingPhase"] === "preflight" || request["openingPhase"] === "open-project" ||
          request["pcbOpeningPhase"] === "preflight" || request["pcbOpeningPhase"] === "open-document" ||
          request["pcbOpeningPhase"] === "observe" || this.#purpose === "diagnostic209" &&
          ["pcbLayers209Phase", "pcbPrimitives209Phase", "pcbExtendedPrimitives209Phase", "pcbSelectionRelations209Phase",
            "pcbPadShapes209Phase", "pcbImageShapes209Phase", "pcbArcShapes209Phase", "pcbPouredShapes209Phase"]
            .some(key => request[key] === "observe"))) ? 32_768 : 4096;
      if (Buffer.byteLength(data) > maximum || combinedRequest && data.length >= 32_768) { throw error("REQUEST_SIZE"); }
      this.#child.stdin.write(data, cause => {
        if (cause !== null && cause !== undefined) { this.#fail("HELPER_WRITE"); }
        else if (this.#pending === pending) { pending.written = true; this.#settle(); }
      });
    } catch { this.#fail("HELPER_WRITE"); }
    return deferred.promise;
  }
  #settle(): void {
    const pending = this.#pending;
    if (pending !== null && pending.written && pending.reply !== null && this.#failure === null) {
      this.#pending = null; clearTimeout(pending.timer);
      const reply = pending.reply;
      if (this.#combinedOutputCleanupOnly && !pending.combinedCleanup) {
        pending.reject(error("COMBINED_HELPER_NORMAL_BOUND")); return;
      }
      if (reply["ok"] === false) {
        // #data admitted only the fixed bounded native error-code grammar.
        // Retain transport refusals even before a main runner was allocated.
        if (pending.mainAction !== null && typeof reply["error"] === "string") {
          this.#mainNativeFailure ??= Object.freeze({ action: pending.mainAction, code: reply["error"] });
        }
        if (pending.send && typeof reply["error"] === "string") { this.#nativeSendError = reply["error"]; }
        if (pending.launch) {
          this.#nativeLaunchRefused = true;
          /* Data parsing admitted only the bounded fixed native label, never
           * arbitrary exception messages, command lines or paths. */
          this.#nativeLaunchError = typeof reply["error"] === "string" ? reply["error"] : null;
        }
        pending.reject(error("NATIVE_REFUSAL"));
      }
      else if (record(reply["result"])) {
        const result = reply["result"];
        const bytes = result["bytes"];
        const ratlineBudget = this.#continuationBudget ?? this.#ratlineBudget;
        if (ratlineBudget !== null && pending.poll) {
          if (typeof bytes !== "string" || !exact(result, ["bytes"])) { pending.reject(error("RATLINE_PIPE_CHUNK")); return; }
          const decoded = Buffer.from(bytes, "base64");
          if (decoded.length > 65_536 || decoded.toString("base64") !== bytes) { this.#fail("RATLINE_PIPE_CHUNK"); pending.reject(error("RATLINE_PIPE_CHUNK")); return; }
          try { ratlineBudget.consumePipeBytes(decoded.length); }
          catch (budgetError) { pending.reject(budgetError instanceof Error ? budgetError : new Error("PCB_DIAGNOSTIC_OWNER_RATLINE_PIPE_BUDGET", { cause: budgetError })); return; }
        }
        pending.resolve(result);
      }
      else { pending.reject(error("HELPER_REPLY")); }
    }
  }
  #fail(reason: string): void {
    this.#failure ??= reason; this.#buffer = Buffer.alloc(0);
    const pending = this.#pending; this.#pending = null;
    if (pending !== null) { clearTimeout(pending.timer); pending.reject(error(this.#failure)); }
    // Do not end, destroy, signal, unref or detach this original helper.
  }
  readonly #data = (chunk: unknown): void => {
    if (this.#failure !== null) { return; }
    let maximum = MAX_TOTAL;
    if (this.#purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE) { maximum = CURRENT_FOOTPRINT_COMBINED_PROFILE.helperStdout.totalBytes; }
    if (this.#purpose === "worker-startup-empty209") { maximum = CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.bytes.helperStdout; }
    if (this.#ratlineBudget !== null) { maximum = CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.bytes.helperStdout; }
    if (this.#continuationBudget !== null) { maximum = CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE.bytes.helperStdout; }
    if (!Buffer.isBuffer(chunk) || chunk.length > MAX_LINE || this.#total + chunk.length > maximum || this.#buffer.length + chunk.length > MAX_LINE) { this.#fail("HELPER_BOUND"); return; }
    if (this.#purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE && this.#total + chunk.length > CURRENT_FOOTPRINT_COMBINED_PROFILE.helperStdout.normalBytes) {
      this.#combinedOutputCleanupOnly = true;
    }
    this.#total += chunk.length; this.#buffer = Buffer.concat([this.#buffer, chunk]);
    const ratlineBudget = this.#continuationBudget ?? this.#ratlineBudget;
    if (ratlineBudget !== null) {
      try { ratlineBudget.consumeHelperStdout(chunk.length); } catch { this.#fail("RATLINE_HELPER_STDOUT"); return; }
    }
    if (this.#combinedOutputCleanupOnly && this.#pending?.combinedCleanup === true &&
      this.#buffer.length > CURRENT_FOOTPRINT_COMBINED_PROFILE.helperStdout.cleanupReplyBytes) { this.#fail("COMBINED_CLEANUP_REPLY_BOUND"); return; }
    const newline = this.#buffer.indexOf(10);
    if (newline === -1) { return; }
    if (newline !== this.#buffer.length - 1) { this.#fail("HELPER_FRAMING"); return; }
    try {
      const raw = decodeCurrentPcbDiagnosticJson(this.#buffer.subarray(0, newline));
      const pending = this.#pending;
      if (!record(raw) || pending === null || pending.reply !== null || raw["id"] !== pending.id ||
          (raw["ok"] === true ? !exact(raw, ["id", "ok", "result"]) || !record(raw["result"]) :
            raw["ok"] !== false || !exact(raw, ["id", "ok", "error"]) || typeof raw["error"] !== "string" || !/^pcb-diagnostic-[a-z-]{1,80}$/u.test(raw["error"]))) { this.#fail("HELPER_REPLY"); return; }
      this.#buffer = Buffer.alloc(0); pending.reply = raw; this.#settle();
    } catch { this.#fail("HELPER_FRAMING"); }
  };
  readonly #stderr = (): void => { this.#fail("HELPER_STDERR"); };
  readonly #childError = (): void => { this.#fail("HELPER_ERROR"); };
  readonly #childClose = (): void => { this.#childClosed = true; if (!this.#released) { this.#fail("HELPER_CLOSED"); } this.#closed.resolve(null); };
}

/** Existing diagnostic facade retains103 requests and mutually exclusive
 * worker/PCB-model branches. Callers cannot select another purpose. */
export class CurrentPcbDiagnosticOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve()) {
    super(child, verify, installation, verifyInstallation, "diagnostic");
  }
}

/** Separate launch-sealed 209 navigation and layer metadata owner. */
export class CurrentPcb209DiagnosticOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve()) {
    super(child, verify, installation, verifyInstallation, "diagnostic209");
  }
}

/** Unregistered pre-create-only facade, with no create, Save or generic send. */
export class CurrentPcbStringPrecreateOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve()) {
    super(child, verify, installation, verifyInstallation, "string-precreate");
  }
}

/** Private launch-sealed constructor-capture owner. No ordinary diagnostic or
 * String owner can be upgraded to this purpose after process allocation. */
export class CurrentPcbWorkerStartupOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, "worker-startup", verifyStartupFacade);
  }
}

/** Fixed209 startup purpose; a legacy/diagnostic owner cannot be upgraded. */
export class CurrentPcb209WorkerStartupOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, "worker-startup209", verifyStartupFacade, actorClockSource);
  }
}

/** Preparation-only launch with its own native counter range. */
export class CurrentFootprintCopyPreparationOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, "worker-startup-footprint209", verifyStartupFacade, actorClockSource);
  }
}
/** Separate native purpose and process/Job ownership. This does not implement
 * CurrentFootprintCopyExecutionNative or enable native create by itself. */
export class CurrentFootprintCopyNativeOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, "worker-startup-footprint-copy209", verifyStartupFacade, actorClockSource);
  }
}

/** Standalone original-main construction purpose. Existing native owners
 * cannot adopt this inspector or receive its launch switch after creation. */
export class CurrentFootprintMainNativeOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, "worker-startup-footprint-main209", verifyStartupFacade, actorClockSource);
  }
}

/** Separate native birth retains both protocols on one original root and Job.
 * The factory never upgrades an existing diagnostic or route owner. */
export class CurrentFootprintCombinedNativeOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, CURRENT_FOOTPRINT_COMBINED_PURPOSE, verifyStartupFacade, actorClockSource);
  }
}

/** Distinct read-only fresh generation. It cannot dispatch native create or
 * transaction clocks and cannot inherit a writer's process/Job handles. */
export class CurrentFootprintCopySavedNativeOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, "worker-startup-footprint-saved209", verifyStartupFacade, actorClockSource);
  }
}
/* oxlint-disable typescript/unbound-method -- Original private-field receiver is explicitly supplied; these exported checks reject prototype and instance substitution. */
const footprintCoreDescriptors = Object.getOwnPropertyDescriptors(CurrentPcbRetainedOwnerCore.prototype);
const footprintOwnerDescriptors = new Map<object, PropertyDescriptorMap>([
  [CurrentFootprintCopyNativeOwner.prototype, Object.getOwnPropertyDescriptors(CurrentFootprintCopyNativeOwner.prototype)],
  [CurrentFootprintCopySavedNativeOwner.prototype, Object.getOwnPropertyDescriptors(CurrentFootprintCopySavedNativeOwner.prototype)],
]);
function originalFootprintDescriptors(prototype: object, original: PropertyDescriptorMap): boolean {
  return Reflect.ownKeys(prototype).length === Reflect.ownKeys(original).length && Object.entries(original).every(([name, held]) => {
    const current = Object.getOwnPropertyDescriptor(prototype, name);
    return current !== undefined && Object.hasOwn(current, "value") === Object.hasOwn(held, "value") &&
      current.value === held.value && current.get === held.get && current.set === held.set && current.writable === held.writable &&
      current.enumerable === held.enumerable && current.configurable === held.configurable;
  });
}
const footprintOwnershipMethods = Object.freeze({ assert: CurrentPcbRetainedOwnerCore.prototype.requireOriginalFootprintGeneration,
  target: CurrentPcbRetainedOwnerCore.prototype.originalFootprintSourceBinding,
  termination: CurrentPcbRetainedOwnerCore.prototype.originalFootprintTermination,
  requireTermination: CurrentPcbRetainedOwnerCore.prototype.requireFootprintTermination });
const combinedOwnershipMethods = Object.freeze({ generation: CurrentPcbRetainedOwnerCore.prototype.requireOriginalFootprintCombinedGeneration,
  require: CurrentPcbRetainedOwnerCore.prototype.requireOriginalCombinedMainRunner,
  send: CurrentPcbRetainedOwnerCore.prototype.sendFootprintMain });
const combinedOwnerDescriptors = Object.getOwnPropertyDescriptors(CurrentFootprintCombinedNativeOwner.prototype);
/* oxlint-enable typescript/unbound-method */
export function assertOriginalCurrentFootprintCombinedNativeOwner(owner: CurrentFootprintCombinedNativeOwner): void {
  if (types.isProxy(owner) || Object.getPrototypeOf(owner) !== CurrentFootprintCombinedNativeOwner.prototype ||
    Reflect.ownKeys(owner).length > 0 || !originalFootprintDescriptors(CurrentFootprintCombinedNativeOwner.prototype, combinedOwnerDescriptors) ||
    Object.getPrototypeOf(CurrentFootprintCombinedNativeOwner.prototype) !== CurrentPcbRetainedOwnerCore.prototype ||
    !originalFootprintDescriptors(CurrentPcbRetainedOwnerCore.prototype, footprintCoreDescriptors)) { throw error("COMBINED_ORIGINAL_OWNER"); }
  combinedOwnershipMethods.generation.call(owner);
}
function originalCombinedCapabilityOwner(capability: CurrentFootprintCombinedMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, mode: "normal" | "cleanup" | "exited"): CurrentPcbRetainedOwnerCore {
  if (types.isProxy(capability)) { throw error("COMBINED_MAIN_CAPABILITY"); }
  const owner = footprintCombinedCapabilities.get(capability);
  if (owner === undefined || types.isProxy(owner) || Object.getPrototypeOf(owner) !== CurrentFootprintCombinedNativeOwner.prototype ||
    Reflect.ownKeys(owner).length > 0 || !originalFootprintDescriptors(CurrentFootprintCombinedNativeOwner.prototype, combinedOwnerDescriptors) ||
    Object.getPrototypeOf(CurrentFootprintCombinedNativeOwner.prototype) !== CurrentPcbRetainedOwnerCore.prototype ||
    !originalFootprintDescriptors(CurrentPcbRetainedOwnerCore.prototype, footprintCoreDescriptors)) { throw error("COMBINED_MAIN_CAPABILITY"); }
  combinedOwnershipMethods.require.call(owner, runner, mode); return owner;
}
export function requireCurrentFootprintCombinedMainCapability(capability: CurrentFootprintCombinedMainCapability, runner: CurrentFootprintCopyMainBackendRunner): void {
  originalCombinedCapabilityOwner(capability, runner, "normal");
}
export function requireCurrentFootprintCombinedMainCleanup(capability: CurrentFootprintCombinedMainCapability, runner: CurrentFootprintCopyMainBackendRunner): void {
  originalCombinedCapabilityOwner(capability, runner, "cleanup");
}
export function currentFootprintCombinedMainGenerationExited(capability: CurrentFootprintCombinedMainCapability, runner: CurrentFootprintCopyMainBackendRunner): boolean {
  const owner = originalCombinedCapabilityOwner(capability, runner, "exited"); return combinedOwnershipMethods.require.call(owner, runner, "exited");
}
export async function sendCurrentFootprintCombinedMainCommand(capability: CurrentFootprintCombinedMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, command: CurrentFootprintCopyMainRequestCollectCommand, id: number): Promise<void> {
  const owner = originalCombinedCapabilityOwner(capability, runner, "normal");
  await combinedOwnershipMethods.send.call(owner, command, id);
  originalCombinedCapabilityOwner(capability, runner, "normal");
}
export function assertOriginalCurrentFootprintCopyNativeOwner(owner: CurrentFootprintCopyGenerationOwner): void {
  if (types.isProxy(owner)) { throw error("FOOTPRINT_ORIGINAL_OWNER"); }
  const proto: unknown = Object.getPrototypeOf(owner);
  if (proto !== CurrentFootprintCopyNativeOwner.prototype && proto !== CurrentFootprintCopySavedNativeOwner.prototype) { throw error("FOOTPRINT_ORIGINAL_OWNER"); }
  const descriptors = footprintOwnerDescriptors.get(proto);
  if (descriptors === undefined || !originalFootprintDescriptors(proto, descriptors) ||
    Object.getPrototypeOf(proto) !== CurrentPcbRetainedOwnerCore.prototype || Reflect.ownKeys(owner).length > 0 ||
    !originalFootprintDescriptors(CurrentPcbRetainedOwnerCore.prototype, footprintCoreDescriptors) ||
    owner.requireOriginalFootprintGeneration !== footprintOwnershipMethods.assert ||
    owner.originalFootprintSourceBinding !== footprintOwnershipMethods.target || owner.originalFootprintTermination !== footprintOwnershipMethods.termination ||
    owner.requireFootprintTermination !== footprintOwnershipMethods.requireTermination) { throw error("FOOTPRINT_ORIGINAL_OWNER"); }
  footprintOwnershipMethods.assert.call(owner);
}
export function originalCurrentFootprintCopyNativeTarget(owner: CurrentFootprintCopyGenerationOwner): CurrentFootprintCopyNativeTarget {
  assertOriginalCurrentFootprintCopyNativeOwner(owner); return footprintOwnershipMethods.target.call(owner);
}
export function originalCurrentFootprintCopyNativeTermination(owner: CurrentFootprintCopyGenerationOwner): object {
  assertOriginalCurrentFootprintCopyNativeOwner(owner); return footprintOwnershipMethods.termination.call(owner);
}
export function assertOriginalCurrentFootprintCopyNativeTermination(owner: CurrentFootprintCopyGenerationOwner, original: object): void {
  assertOriginalCurrentFootprintCopyNativeOwner(owner); footprintOwnershipMethods.requireTermination.call(owner, original);
}

/** Separate fixed launch purpose for the complete empty-baseline vocabulary.
 * Its original monotonic anchor predates helper spawn and cannot be replaced. */
export class CurrentPcb209EmptyStartupOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification, anchor: CurrentPcb209EmptyStartupBudgetAnchor,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, "worker-startup-empty209", verifyStartupFacade, actorClockSource, anchor);
  }
}

/** Separate launch purpose with one cumulative budget created before spawn.
 * Its fixed continuation ends at the first ratline child's held import. */
export class CurrentPcb209RatlineStartupOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification, budget: CurrentPcb209RatlineBudget,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, "worker-startup-ratline209", verifyStartupFacade, actorClockSource, null, budget);
  }
}

export class CurrentPcb209RatlineContinuationOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification, budget: CurrentPcb209RatlineContinuationBudget,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, "worker-startup-ratline-continuation209", verifyStartupFacade, actorClockSource, null, null, budget);
  }
}

// Only the validation lifecycle allocates this owner. It supplies no ordinary
// Windows runtime authority, bridge authentication or connected qualification.
export function startCurrentPcbDiagnosticOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcbDiagnosticOwner> {
  return startFixedOwner(options, "diagnostic");
}
/** Separate 209 opening/layer allocator. No existing owner can be upgraded.
 * The native layer command is purpose-sealed; the103-request budget is unchanged. */
export function startCurrentPcb209DiagnosticOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcb209DiagnosticOwner> {
  return startFixedOwner(options, "diagnostic209", "209-opening");
}
/** Called only by the separate String lifecycle, never diagnostic requests. */
export function startCurrentPcbStringPrecreateOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcbStringPrecreateOwner> {
  return startFixedOwner(options, "string-precreate");
}
export function startCurrentPcbWorkerStartupOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcbWorkerStartupOwner> {
  return startFixedOwner(options, "worker-startup");
}
export function startCurrentPcb209WorkerStartupOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcb209WorkerStartupOwner> {
  return startFixedOwner(options, "worker-startup209", "209-startup");
}
export function startCurrentPcb209EmptyStartupOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcb209EmptyStartupOwner> {
  return startFixedOwner(options, "worker-startup-empty209", "209-startup");
}
export function startCurrentPcb209RatlineStartupOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcb209RatlineStartupOwner> {
  return startFixedOwner(options, "worker-startup-ratline209", "209-startup");
}
export function startCurrentPcb209RatlineContinuationOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcb209RatlineContinuationOwner> {
  return startFixedOwner(options, "worker-startup-ratline-continuation209", "209-startup");
}
export function startCurrentFootprintCopyPreparationOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentFootprintCopyPreparationOwner> {
  return startFixedOwner(options, "worker-startup-footprint209", "209-startup");
}
export function startCurrentFootprintCopyNativeOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentFootprintCopyNativeOwner> {
  return startFixedOwner(options, "worker-startup-footprint-copy209", "209-startup");
}
export function startCurrentFootprintMainNativeOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentFootprintMainNativeOwner> {
  return startFixedOwner(options, "worker-startup-footprint-main209", "209-startup");
}
export function startCurrentFootprintCombinedNativeOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentFootprintCombinedNativeOwner> {
  return startFixedOwner(options, CURRENT_FOOTPRINT_COMBINED_PURPOSE, "209-startup");
}
export async function startCurrentFootprintCopySavedNativeOwner(writer: CurrentFootprintCopyNativeOwner,
  after: Awaited<ReturnType<typeof readExactSqlInventory>>): Promise<CurrentFootprintCopySavedNativeOwner> {
  assertOriginalCurrentFootprintCopyNativeOwner(writer); requireCurrentFootprintCopyClosedSnapshot(writer, after);
  const original = footprintFactories.get(writer);
  if (original === undefined || !writer.status().released || !writer.status().helperClosed) { throw error("FOOTPRINT_WRITER_RELEASE_REQUIRED"); }
  if (footprintSavedAllocationAttempts.has(writer)) { throw error("FOOTPRINT_SAVED_ALLOCATION_CONSUMED"); }
  footprintSavedAllocationAttempts.add(writer);
  footprintSavedAllocationStates.set(writer, "pending");
  let owner: Awaited<ReturnType<typeof startFixedOwner>>;
  try { owner = await startFixedOwner(original.options, "worker-startup-footprint-saved209", "209-startup", writer); }
  catch (caughtError) {
    // Only admission before the spawn boundary proves no helper allocation.
    // Absence of a retained owner after that boundary is unresolved ownership.
    if (footprintSavedAllocationStates.get(writer) === "pending") { footprintSavedAllocationStates.set(writer, "no-resource"); }
    throw caughtError;
  }
  if (!(owner instanceof CurrentFootprintCopySavedNativeOwner)) { throw error("FOOTPRINT_SAVED_FACTORY"); }
  owner.bindFootprintSavedSource(writer, after); return owner;
}
export function currentFootprintCopySavedAllocationOutcome(writer: CurrentFootprintCopyNativeOwner): Readonly<{
  status: "not-attempted" | "pending" | "no-resource" | "unresolved"; owner: null;
}> | Readonly<{ status: "retained"; owner: CurrentFootprintCopySavedNativeOwner }> {
  assertOriginalCurrentFootprintCopyNativeOwner(writer);
  const owner = footprintSavedAllocations.get(writer);
  return owner === undefined ? Object.freeze({ status: footprintSavedAllocationStates.get(writer) ?? "not-attempted", owner: null }) :
    Object.freeze({ status: "retained", owner });
}
export function retainedCurrentFootprintCopySavedAllocation(writer: CurrentFootprintCopyNativeOwner): CurrentFootprintCopySavedNativeOwner | null {
  assertOriginalCurrentFootprintCopyNativeOwner(writer); return footprintSavedAllocations.get(writer) ?? null;
}
async function startFixedOwner(options: CurrentPcbDiagnosticInstallationOptions, purpose: OwnerPurpose,
  generation: "206" | "209-opening" | "209-startup" = "206", savedWriter?: CurrentFootprintCopyNativeOwner): Promise<CurrentPcbDiagnosticOwner | CurrentPcbStringPrecreateOwner | CurrentPcbWorkerStartupOwner> {
  const sealedOptions = Object.freeze({ ...options });
  const startup209 = purpose === "worker-startup209" || (purpose === "worker-startup-footprint209" || purpose === "worker-startup-footprint-copy209" || purpose === "worker-startup-footprint-saved209" || purpose === "worker-startup-footprint-main209" || purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE) || purpose === "worker-startup-empty209" || purpose === "worker-startup-ratline209" || purpose === "worker-startup-ratline-continuation209";
  if ((generation === "209-opening") !== (purpose === "diagnostic209") || (generation === "209-startup") !== startup209) { throw error("INSTALLATION_PURPOSE"); }
  let verifier = generation === "206" ? verifyCurrentPcbDiagnosticInstallation : verifyCurrentPcb209DiagnosticInstallation;
  if (purpose === "worker-startup-ratline209" || purpose === "worker-startup-ratline-continuation209") { verifier = verifyCurrentPcb209RatlineInstallation; }
  const installation = await verifier(sealedOptions);
  if (fileURLToPath(new URL("../..", import.meta.url)) !== `${sealedOptions.pluginRoot}/`) { throw error("INSTALLATION_PLUGIN"); }
  const verifyInstallation = async (): Promise<void> => {
    const current = await verifier(sealedOptions);
    if (current.facadeSha256 !== installation.facadeSha256 || JSON.stringify(current.plan) !== JSON.stringify(installation.plan)) { throw error("INSTALLATION_CHANGED"); }
  };
  const verifyStartupFacade = async (): Promise<void> => {
    let facadeVerifier = generation === "206" ? verifyCurrentPcbDiagnosticFacade : verifyCurrentPcb209DiagnosticFacade;
    if (purpose === "worker-startup-ratline209" || purpose === "worker-startup-ratline-continuation209") { facadeVerifier = verifyCurrentPcb209RatlineFacade; }
    const current = await facadeVerifier(sealedOptions);
    if (current.facadeSha256 !== installation.facadeSha256 || canonicalJson(current.plan) !== canonicalJson(installation.plan)) {
      throw error("INSTALLATION_CHANGED");
    }
  };
  const actorClockSource = startup209 ? await qualifyCurrentPcb209StartupActorInstallation(sealedOptions) : null;
  if (startup209) { await verifyCurrentPcb209WorkerBootstrapInstallation(sealedOptions); }
  const helperPath = fileURLToPath(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url));
  const before = await lstat(helperPath);
  const verify = async (): Promise<void> => {
    const first = await lstat(helperPath);
    if (!first.isFile() || first.isSymbolicLink() || first.nlink !== 1 || first.size !== HELPER_BYTES ||
        first.dev !== before.dev || first.ino !== before.ino || first.size !== before.size ||
        first.mtimeMs !== before.mtimeMs || first.ctimeMs !== before.ctimeMs || await realpath(helperPath) !== helperPath ||
        createHash("sha256").update(await readFile(helperPath)).digest("hex") !== HELPER_SHA256) { throw error("HELPER_SOURCE"); }
    const after = await lstat(helperPath);
    if (after.dev !== first.dev || after.ino !== first.ino || after.size !== first.size || after.mtimeMs !== first.mtimeMs || after.ctimeMs !== first.ctimeMs) { throw error("HELPER_SOURCE"); }
  };
  await verify();
  const distro = sealedOptions.wslDistribution ?? process.env["WSL_DISTRO_NAME"];
  let windowsPath: string;
  if (/^\/mnt\/[a-z]\//u.test(helperPath)) { windowsPath = `${helperPath[5]?.toUpperCase()}:\\${helperPath.slice(7).replaceAll("/", "\\")}`; }
  else {
    if (distro === undefined || !/^[A-Za-z\d][A-Za-z\d_.-]{0,127}$/u.test(distro)) { throw error("WSL_PATH"); }
    windowsPath = `\\\\wsl.localhost\\${distro}${helperPath.replaceAll("/", "\\")}`;
  }
  // PowerShell executes exactly the bytes hashed through this retained file.
  // A short encoded bootstrap avoids the Windows command-length limit for the
  // Entire native helper and avoids reopening a pathname after byte admission.
  let purposeSwitch = "";
  if (purpose === "worker-startup-ratline-continuation209") { purposeSwitch = " -WorkerStartupRatlineContinuation209"; }
  else if (purpose === "worker-startup-ratline209") { purposeSwitch = " -WorkerStartupRatline209"; }
  else if (purpose === "worker-startup-empty209") { purposeSwitch = " -WorkerStartupEmpty209"; }
  else if (purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE) { purposeSwitch = ` ${CURRENT_FOOTPRINT_COMBINED_PROFILE.nativeSwitch}`; }
  else if (purpose === "worker-startup-footprint-main209") { purposeSwitch = " -WorkerStartupFootprintMain209"; }
  else if (purpose === "worker-startup-footprint-saved209") { purposeSwitch = " -WorkerStartupFootprintSaved209"; }
  else if (purpose === "worker-startup-footprint-copy209") { purposeSwitch = " -WorkerStartupFootprintCopy209"; }
  else if (purpose === "worker-startup-footprint209") { purposeSwitch = " -WorkerStartupFootprint209"; }
  else if (purpose === "worker-startup209") { purposeSwitch = " -WorkerStartup209"; }
  else if (purpose === "worker-startup") { purposeSwitch = " -WorkerStartup"; }
  else if (purpose === "string-precreate") { purposeSwitch = " -StringPrecreate"; }
  else if (purpose === "diagnostic209") { purposeSwitch = " -Layers209"; }
  const bootstrap = `$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue';` +
    `$file=[IO.File]::Open('${windowsPath.replaceAll("'", "''")}',[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read);` +
    `try{if($file.Length -ne ${HELPER_BYTES}){throw 'pcb-diagnostic-helper-size'};$bytes=New-Object byte[] ([int]$file.Length);$offset=0;` +
    `while($offset -lt $bytes.Length){$count=$file.Read($bytes,$offset,$bytes.Length-$offset);if($count -le 0){throw 'pcb-diagnostic-helper-eof'};$offset+=$count};` +
    `$hash=[Security.Cryptography.SHA256]::Create();try{$digest=([BitConverter]::ToString($hash.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}finally{$hash.Dispose()};` +
    `if($digest -cne '${HELPER_SHA256}'){throw 'pcb-diagnostic-helper-hash'};` +
    `$decoder=New-Object Text.UTF8Encoding($false,$true);& ([ScriptBlock]::Create($decoder.GetString($bytes)))${purposeSwitch}}finally{$file.Dispose()}`;
  const encoded = Buffer.from(bootstrap, "utf16le").toString("base64");
  if (encoded.length > 16_000) { throw error("BOOTSTRAP_BOUND"); }
  const emptyAnchor = purpose === "worker-startup-empty209" ? new CurrentPcb209EmptyStartupBudgetAnchor() : null;
  const ratlineBudget = purpose === "worker-startup-ratline209" ? new CurrentPcb209RatlineBudget() : null;
  const continuationBudget = purpose === "worker-startup-ratline-continuation209" ? new CurrentPcb209RatlineContinuationBudget() : null;
  if (savedWriter !== undefined) { footprintSavedAllocationStates.set(savedWriter, "unresolved"); }
  const child = spawn(installation.paths.powershellExecutable,
    ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", encoded],
    { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
  let owner: CurrentPcbRetainedOwnerCore;
  if (purpose === "worker-startup-ratline-continuation209") {
    if (actorClockSource === null || continuationBudget === null) { throw error("CONTINUATION_ALLOCATION"); }
    owner = new CurrentPcb209RatlineContinuationOwner(child, verify, actorClockSource, continuationBudget, installation, verifyInstallation, verifyStartupFacade);
  } else if (purpose === "worker-startup-ratline209") {
    if (actorClockSource === null || ratlineBudget === null) { throw error("RATLINE_ALLOCATION"); }
    owner = new CurrentPcb209RatlineStartupOwner(child, verify, actorClockSource, ratlineBudget, installation, verifyInstallation, verifyStartupFacade);
  }
  else if (purpose === "worker-startup-empty209") {
    if (actorClockSource === null || emptyAnchor === null) { throw error("STARTUP_EMPTY_ALLOCATION"); }
    owner = new CurrentPcb209EmptyStartupOwner(child, verify, actorClockSource, emptyAnchor, installation, verifyInstallation, verifyStartupFacade);
  }
  else if (purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE) {
    if (actorClockSource === null) { throw error("STARTUP209_ACTOR_SOURCE"); }
    owner = new CurrentFootprintCombinedNativeOwner(child, verify, actorClockSource, installation, verifyInstallation, verifyStartupFacade);
    footprintCombinedFactories.set(owner, installation);
  }
  else if (purpose === "worker-startup-footprint-main209") {
    if (actorClockSource === null) { throw error("STARTUP209_ACTOR_SOURCE"); }
    owner = new CurrentFootprintMainNativeOwner(child, verify, actorClockSource, installation, verifyInstallation, verifyStartupFacade);
  }
  else if (purpose === "worker-startup-footprint-saved209") {
    if (actorClockSource === null) { throw error("STARTUP209_ACTOR_SOURCE"); }
    owner = new CurrentFootprintCopySavedNativeOwner(child, verify, actorClockSource, installation, verifyInstallation, verifyStartupFacade);
  }
  else if (purpose === "worker-startup-footprint-copy209") {
    if (actorClockSource === null) { throw error("STARTUP209_ACTOR_SOURCE"); }
    owner = new CurrentFootprintCopyNativeOwner(child, verify, actorClockSource, installation, verifyInstallation, verifyStartupFacade);
  }
  else if (purpose === "worker-startup-footprint209") {
    if (actorClockSource === null) { throw error("STARTUP209_ACTOR_SOURCE"); }
    owner = new CurrentFootprintCopyPreparationOwner(child, verify, actorClockSource, installation, verifyInstallation, verifyStartupFacade);
  }
  else if (purpose === "worker-startup209") {
    if (actorClockSource === null) { throw error("STARTUP209_ACTOR_SOURCE"); }
    owner = new CurrentPcb209WorkerStartupOwner(child, verify, actorClockSource, installation, verifyInstallation, verifyStartupFacade);
  }
  else if (purpose === "worker-startup") { owner = new CurrentPcbWorkerStartupOwner(child, verify, installation, verifyInstallation, verifyStartupFacade); }
  else if (purpose === "string-precreate") { owner = new CurrentPcbStringPrecreateOwner(child, verify, installation, verifyInstallation); }
  else if (purpose === "diagnostic209") { owner = new CurrentPcb209DiagnosticOwner(child, verify, installation, verifyInstallation); }
  else { owner = new CurrentPcbDiagnosticOwner(child, verify, installation, verifyInstallation); }
  if (owner instanceof CurrentFootprintCopyNativeOwner || owner instanceof CurrentFootprintCopySavedNativeOwner) {
    footprintFactories.set(owner, Object.freeze({ options: sealedOptions, installation }));
  }
  if (owner instanceof CurrentFootprintCopySavedNativeOwner) {
    if (savedWriter === undefined) { throw error("FOOTPRINT_SAVED_WRITER_REQUIRED"); }
    footprintSavedAllocations.set(savedWriter, owner);
  }
  retainedOwners.add(owner); owner.start();
  return owner;
}
