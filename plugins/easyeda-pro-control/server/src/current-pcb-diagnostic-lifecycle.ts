/** Original-owner validation lifecycle with one checkpoint-bound disposable
 * opening. No generic debugger command, CAD writer or historical owner recreation. */
/* oxlint-disable max-classes-per-file, import/max-dependencies -- Fixed facades share one private cleanup/journal core; keeping the purpose selector unexported prevents a caller-selectable upgrade API. */
import { CURRENT_WINDOW_RESTORE_LIMITS, currentWindowRestoreResult, requireCurrentWindowRestoreResult } from "./current-pcb-diagnostic-window-restore.ts";
import { CURRENT_WINDOW_RESIZE_LIMITS, currentWindowResizeResult, requireCurrentWindowResizeResult } from "./current-pcb-diagnostic-window-resize.ts";
import { currentWindowCaptureResult, publishCurrentWindowCapture, requireCurrentWindowCaptureResult } from "./current-pcb-diagnostic-window-capture.ts";
import { currentPcb209VisualRequestSchema } from "./current-pcb-209-visual-validation.ts";
import type { CurrentPcb209VisualRequest } from "./current-pcb-209-visual-validation.ts";
import { CURRENT_PCB_209_VISUAL_RESULT_BYTES, requireCurrentPcb209VisualResult } from "./current-pcb-209-visual-actions.ts";
import { publicCurrentFootprintRouteSummary } from "./current-footprint-route-summary.ts";
import type { z } from "zod";
import { join } from "node:path";
import { controlDataDirectory } from "./artifacts.ts";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { currentDisposableOpenPreparationCheckpointSchema, currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { prepareCurrentDisposableOpenCheckpoint, readCurrentPcbCommonOpenInventory, verifyCurrentDisposableOpenCheckpoint, verifyHistoricalCurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import type { CurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import { assertNoUnresolvedOrdinaryLaunches } from "./ordinary-launch.ts";
import { currentFootprintCombinedFactoryFailureDiagnostics, requireCurrentFootprintCombinedUnlaunchedFactoryFailure, startCurrentFootprintCombinedNativeOwner, startCurrentFootprintCopyNativeOwner, startCurrentFootprintCopyPreparationOwner, startCurrentFootprintMainNativeOwner, startCurrentPcb209DiagnosticOwner, startCurrentPcb209EmptyStartupOwner, startCurrentPcb209RatlineContinuationOwner, startCurrentPcb209RatlineStartupOwner, startCurrentPcb209VisualOwner, startCurrentPcb209WorkerStartupOwner, startCurrentPcbDiagnosticOwner, startCurrentPcbStringPrecreateOwner, startCurrentPcbWorkerStartupOwner } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCombinedNativeOwner, CurrentFootprintCopyNativeOwner, CurrentFootprintCopyPreparationOwner, CurrentFootprintMainNativeOwner, CurrentPcb209RatlineContinuationOwner, CurrentPcb209RatlineStartupOwner, CurrentPcb209WorkerStartupOwner, CurrentPcbDiagnosticOwner, CurrentPcbStringPrecreateOwner, CurrentPcbWorkerStartupHandoff, CurrentPcbWorkerStartupOwner } from "./current-pcb-diagnostic-owner.ts";
import { verifyCurrentPcb209DiagnosticInstallation, verifyCurrentPcb209RatlineInstallation, verifyCurrentPcbDiagnosticInstallation } from "./current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallation, CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { CURRENT_PCB_DIAGNOSTIC_SCRIPTS } from "./current-pcb-diagnostic-profile.ts";
import { CURRENT_PCB_209_OPENING_PROFILE, CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import { currentPcb209OpeningRequestSchema } from "./current-pcb-209-opening-validation.ts";
import type { CurrentPcb209OpeningRequest } from "./current-pcb-209-opening-validation.ts";
import { CURRENT_PCB_209_PRIMITIVES_RESULT_BYTES } from "./current-pcb-209-primitives.ts";
import { CURRENT_PCB_209_EXTENDED_PRIMITIVES_RESULT_BYTES } from "./current-pcb-209-extended-primitives.ts";
import { CURRENT_PCB_209_IMAGE_SHAPES_RESULT_BYTES } from "./current-pcb-209-image-shapes.ts";
import { CURRENT_PCB_209_ARC_SHAPES_RESULT_BYTES } from "./current-pcb-209-arc-shapes.ts";
import { CURRENT_PCB_209_POURED_SHAPES_RESULT_BYTES } from "./current-pcb-209-poured-shapes.ts";
import { CURRENT_PCB_209_PAD_SHAPES_RESULT_BYTES } from "./current-pcb-209-pad-shapes.ts";
import { CURRENT_PCB_209_SELECTION_RELATIONS_RESULT_BYTES } from "./current-pcb-209-selection-relations.ts";
import { queryCurrentPcb209Observation } from "./current-pcb-209-observation-query.ts";
import { currentPcbDiagnosticValidationRequestSchema } from "./current-pcb-diagnostic-validation.ts";
import type { CurrentPcbDiagnosticValidationRequest as Request } from "./current-pcb-diagnostic-validation.ts";
import { CURRENT_PCB_STRING_PRECREATE_OPERATION_PREFIX, currentPcbStringPrecreateRequestSchema, currentPcbStringPrecreateStages } from "./current-pcb-string-precreate-validation.ts";
import type { CurrentPcbStringPrecreateRequest } from "./current-pcb-string-precreate-validation.ts";
import { DIAGNOSTIC_OBSERVATION_MAX_BYTES, STRING_PRECREATE_OBSERVATION_MAX_BYTES, acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLifecycleSnapshot,
  assertNoUnresolvedCurrentPcbDiagnosticLaunches, diagnosticLifecycleBindingSchema,
  diagnosticLifecycleDigestSchema, diagnosticLifecycleNoProcessReleaseProofSchema, diagnosticLifecycleRecordSchemas, diagnosticLifecycleWindowSchema,
  diagnosticObservationStageSchema, diagnosticPcbOpeningSourceAccepted, publishCurrentPcbDiagnosticLifecycleRecord, readCurrentPcbDiagnosticLifecycles, releaseCurrentPcbDiagnosticLaunchExclusion,
  reserveCurrentPcbDiagnosticLifecycle, stringPrecreateObservationResultSchema, stringPrecreateTargetMatches } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLaunchLease, CurrentPcbDiagnosticLifecyclePurpose, DiagnosticLifecycleBinding, DiagnosticLifecycleOperation, DiagnosticLifecycleRecordName, DiagnosticLifecycleRecords } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import { currentPcbObservationFailureDetail } from "./current-pcb-observation-failure.ts";
import { currentPcbCommonBaselineFailureSchema, currentPcbCommonBaselineFailureSummary, currentPcbCommonBaselineResultSchema } from "./current-pcb-common-baseline-validation.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { CurrentPcbWorkerStartupOpening } from "./current-pcb-worker-startup-opening.ts";
import type { CurrentPcbWorkerStartupOpeningResult } from "./current-pcb-worker-startup-opening.ts";
import type { CurrentPcb209WorkerStartupTransport, CurrentPcbWorkerStartupTransport } from "./current-pcb-worker-startup-transport.ts";
import type { CurrentPcbWorkerConstructionAssignments } from "./current-pcb-worker-construction-assignment.ts";
import { CurrentFootprintCopyStartupOpening, CurrentPcb209WorkerStartupOpening } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentFootprintCopyStatePacket } from "./current-footprint-copy-state.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_OPERATION_PREFIX, currentFootprintCopyPreparationIdSchema,
  currentFootprintCopyPreparationLifecycleRequestSchema } from "./current-footprint-copy-preparation-validation.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE } from "./current-footprint-copy-preparation-profile.ts";
import { CURRENT_FOOTPRINT_COPY_BINDINGS_REQUESTS } from "./current-footprint-copy-bindings.ts";
import type { CurrentFootprintCopyUiObservation } from "./current-footprint-copy-ui-runner.ts";
import type { CurrentFootprintCopyManagerRouteObservation } from "./current-footprint-copy-manager-route-runner.ts";
import type { CurrentFootprintCopyBindings } from "./current-footprint-copy-bindings.ts";
import { prepareCurrentFootprintCopyBindingsOwned, retainedCurrentFootprintCopyBindingsProducers } from "./current-footprint-copy-bindings-runtime.ts";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_OWNER_REQUESTS } from "./current-footprint-copy-dependency-runner.ts";
import type { CurrentFootprintCopyDependencyObservation } from "./current-footprint-copy-dependency-runner.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_REQUESTS } from "./current-footprint-copy-preparation.ts";
import type { CurrentFootprintCopyPreparation } from "./current-footprint-copy-preparation.ts";
import { prepareCurrentFootprintCopyOwned, requireCurrentFootprintCopyOwned } from "./current-footprint-copy-preparation-runtime.ts";
import type { CurrentFootprintSourcePlan } from "./current-footprint-source-plan.ts";
import { prepareCurrentFootprintSourcePlan } from "./current-footprint-source-plan.ts";
import type { CurrentFootprintSourceReadPacket } from "./current-footprint-source-read-runner.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS } from "./current-footprint-copy-source-read-runner.ts";
import type { CurrentFootprintCopyStartupOpeningResult, CurrentPcb209WorkerStartupOpeningResult } from "./current-pcb-209-worker-startup-opening.ts";
import { adaptCurrentFootprintCopyStartupLifecycle, adaptCurrentPcb209WorkerStartupLifecycle, adaptCurrentPcbWorkerStartupLifecycle, requireCurrentFootprintCopyStartupOpening, requireCurrentPcb209StartupOpening } from "./current-pcb-worker-startup-lifecycle-adapter.ts";
import { currentPcb209StartupCheckpointCallback } from "./current-pcb-209-startup-checkpoint.ts";
import type { CurrentPcb209WorkerStartupEmptyPacket } from "./current-pcb-209-worker-startup-empty-session.ts";
import { CurrentPcb209WorkerStartupEmptySession } from "./current-pcb-209-worker-startup-empty-session.ts";
import { CurrentPcb209WorkerStartupPcbSession } from "./current-pcb-209-worker-startup-pcb-session.ts";
import type { CurrentPcb209WorkerStartupPcbPacket } from "./current-pcb-209-worker-startup-pcb-session.ts";
import type { CurrentFootprintCopyStartupOpeningCoordinator, CurrentPcb209WorkerStartupOpeningCoordinator, CurrentPcbStartupActorPacket, CurrentPcbStartupLifecycleAdapter,
  CurrentPcbStartupOpeningResult, CurrentPcbStartupTransport,
  CurrentPcbWorkerStartupOpeningCoordinator } from "./current-pcb-worker-startup-lifecycle-adapter.ts";
import { CURRENT_PCB_209_EMPTY_STARTUP_OPERATION_PREFIX, currentPcb209EmptyStartupIdSchema, currentPcb209EmptyStartupLifecycleRequestSchema } from "./current-pcb-209-empty-startup-validation.ts";
import { CURRENT_PCB_209_WORKER_STARTUP_OPERATION_PREFIX, currentPcb209WorkerStartupFootprintSourceInputSchema,
  currentPcb209WorkerStartupLifecycleIdSchema, currentPcb209WorkerStartupLifecycleRequestSchema } from "./current-pcb-209-worker-startup-validation.ts";
import { CURRENT_PCB_209_RATLINE_STARTUP_OPERATION_PREFIX, currentPcb209RatlineStartupIdSchema,
  currentPcb209RatlineStartupLifecycleRequestSchema } from "./current-pcb-209-ratline-startup-validation.ts";
import { CurrentPcb209RatlineStartupChannel } from "./current-pcb-209-ratline-startup-channel.ts";
import { CurrentPcb209RatlineNativeSession } from "./current-pcb-209-ratline-native-session.ts";
import { CurrentPcb209RatlineContinuationNativeSession } from "./current-pcb-209-ratline-continuation-native-session.ts";
import { rejectCurrentPcb209RatlineCheckpointPopulation } from "./current-pcb-209-ratline-checkpoint.ts";
import type { CurrentPcb209RatlineContinuationNativePacket } from "./current-pcb-209-ratline-continuation-native-session.ts";
import { CurrentPcb209RatlineContinuationChannel } from "./current-pcb-209-ratline-continuation-channel.ts";
import { CURRENT_PCB_209_RATLINE_CONTINUATION_OPERATION_PREFIX, currentPcb209RatlineContinuationIdSchema, currentPcb209RatlineContinuationLifecycleRequestSchema } from "./current-pcb-209-ratline-continuation-validation.ts";
import type { CurrentPcb209RatlineNativePacket } from "./current-pcb-209-ratline-native-session.ts";
import type { CurrentPcbWorkerStartupChannelPacket } from "./current-pcb-worker-startup-channel-observation.ts";
import { CURRENT_PCB_WORKER_STARTUP_OPERATION_PREFIX, currentPcbWorkerStartupCaptureRequestSchema,
  currentPcbWorkerStartupLifecycleIdSchema, currentPcbWorkerStartupLifecycleRequestSchema } from "./current-pcb-worker-startup-validation.ts";

import { CURRENT_FOOTPRINT_COPY_ROUTE_PREPARATION_OPERATION_PREFIX, currentFootprintCopyRoutePreparationIdSchema, currentFootprintCopyRoutePreparationLifecycleRequestSchema } from "./current-footprint-copy-route-preparation-validation.ts";
import { currentFootprintCopyRouteObservationSchema } from "./current-footprint-copy-route-observation.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE } from "./current-footprint-copy-execution-profile.ts";

import { CURRENT_FOOTPRINT_MAIN_OPERATION_PREFIX, currentFootprintMainIdSchema, currentFootprintMainLifecycleRequestSchema,
  currentFootprintMainValidationRequestSchema } from "./current-footprint-main-validation.ts";
import type { CurrentFootprintMainValidationRequest } from "./current-footprint-main-validation.ts";

import { CURRENT_FOOTPRINT_COMBINED_OPERATION_PREFIX, currentFootprintCombinedIdSchema, currentFootprintCombinedLifecycleRequestSchema, currentFootprintCombinedNativeStateSchema,
  currentFootprintCombinedValidationRequestSchema } from "./current-footprint-combined-validation.ts";
import { currentFootprintCombinedFactoryFailureDiagnosticsSchema } from "./current-footprint-combined-ready.ts";
import type { CurrentFootprintCombinedBeforeLaunchFailureProof, CurrentFootprintCombinedFactoryFailureDiagnostics } from "./current-footprint-combined-ready.ts";
import type { CurrentFootprintCombinedValidationRequest } from "./current-footprint-combined-validation.ts";

export type { CurrentPcbWorkerStartupOpeningCoordinator } from "./current-pcb-worker-startup-lifecycle-adapter.ts";

type LifecycleRequest = Request | CurrentPcbStringPrecreateRequest | CurrentPcb209OpeningRequest | CurrentPcb209VisualRequest;
type LifecycleGeneration = "209-visual" | "209-startup-footprint-combined" | "209-startup-footprint-main" | "209-startup-footprint-route" | "206" | "209-opening" | "209-startup" | "209-startup-footprint" | "209-startup-empty" | "209-startup-ratline" | "209-startup-ratline-continuation";
function opening209(generation: LifecycleGeneration): boolean { return generation === "209-opening" || generation === "209-visual"; }
function routeStartup209(generation: LifecycleGeneration): boolean { return generation === "209-startup-footprint-route" || generation === "209-startup-footprint-combined"; }
function startup209(generation: LifecycleGeneration): boolean { return generation === "209-startup-footprint-combined" || generation === "209-startup-footprint-route" || generation === "209-startup-footprint" || generation === "209-startup" || generation === "209-startup-empty" || generation === "209-startup-ratline" || generation === "209-startup-ratline-continuation"; }
const startupStages = ["browser", "frames", "script"] as const;
const launchPurposeFields = {
  diagnostic: { schema: "easyeda-pro-control.pcb-diagnostic-launch-intent.v1" },
  "string-precreate": { schema: "easyeda-pro-control.pcb-string-precreate-launch-intent.v1", purpose: "string-precreate" },
  "worker-startup": { schema: "easyeda-pro-control.pcb-worker-startup-launch-intent.v1", purpose: "worker-startup" },
} as const;
function launchFields(purpose: CurrentPcbDiagnosticLifecyclePurpose, generation: LifecycleGeneration):
  typeof launchPurposeFields[CurrentPcbDiagnosticLifecyclePurpose] | Readonly<{ schema: "easyeda-pro-control.pcb209-visual-launch-intent.v1" }> | Readonly<{ schema: "easyeda-pro-control.footprint-combined-launch-intent.v2" | "easyeda-pro-control.footprint-main-launch-intent.v1" | "easyeda-pro-control.footprint-copy-route-preparation-launch-intent.v1" | "easyeda-pro-control.footprint-copy-preparation-launch-intent.v1" | "easyeda-pro-control.pcb209-worker-startup-launch-intent.v1" | "easyeda-pro-control.pcb209-empty-startup-launch-intent.v1" | "easyeda-pro-control.pcb209-ratline-startup-launch-intent.v1" | "easyeda-pro-control.pcb209-ratline-continuation-launch-intent.v1"; purpose: "worker-startup" }> {
  if (generation === "209-startup-footprint-combined") { return { schema: "easyeda-pro-control.footprint-combined-launch-intent.v2", purpose: "worker-startup" }; }
  if (generation === "209-startup-footprint-main") { return { schema: "easyeda-pro-control.footprint-main-launch-intent.v1", purpose: "worker-startup" }; }
  if (routeStartup209(generation)) { return { schema: "easyeda-pro-control.footprint-copy-route-preparation-launch-intent.v1", purpose: "worker-startup" }; }
  if (generation === "209-startup-footprint") { return { schema: "easyeda-pro-control.footprint-copy-preparation-launch-intent.v1", purpose: "worker-startup" }; }
  if (generation === "209-startup-ratline-continuation") { return { schema: "easyeda-pro-control.pcb209-ratline-continuation-launch-intent.v1", purpose: "worker-startup" }; }
  if (generation === "209-startup-ratline") { return { schema: "easyeda-pro-control.pcb209-ratline-startup-launch-intent.v1", purpose: "worker-startup" }; }
  if (generation === "209-startup-empty") { return { schema: "easyeda-pro-control.pcb209-empty-startup-launch-intent.v1", purpose: "worker-startup" }; }
  if (generation === "209-startup") { return { schema: "easyeda-pro-control.pcb209-worker-startup-launch-intent.v1", purpose: "worker-startup" }; }
  if (generation === "209-visual") { return { schema: "easyeda-pro-control.pcb209-visual-launch-intent.v1" }; }
  return launchPurposeFields[purpose];
}
const startupCaptureInputSchema = currentPcbWorkerStartupCaptureRequestSchema.omit({ action: true, operationId: true, expectedBindingSha256: true });
const startupOpeningMethods = ["open", "status", "retainedOpeningResult", "requireOriginal", "proveCurrentAssignments", "requireCurrentAssignments",
  "retainedActorObservation", "observeActorClock", "requireActorClock", "retainedChannelObservation", "observeCurrentChannel", "requireCurrentChannel",
  "releaseAfterTermination"] as const;

// oxlint-disable typescript/unbound-method -- Retained private-field methods are invoked only with their original session receiver.
const footprintRouteMethods = Object.freeze({
  cache: CurrentFootprintCopyStartupOpening.prototype.observeFootprintCacheConstruction,
  state: CurrentFootprintCopyStartupOpening.prototype.observeFootprintState,
  producers: CurrentFootprintCopyStartupOpening.prototype.observeFootprintProducers,
  dependencies: CurrentFootprintCopyStartupOpening.prototype.observeFootprintDependencies,
  callbacks: CurrentFootprintCopyStartupOpening.prototype.observeFootprintRegisteredAsync,
  destinations: CurrentFootprintCopyStartupOpening.prototype.observeFootprintDestinations,
  reproof: CurrentFootprintCopyStartupOpening.prototype.requireFootprintRouteObservations,
  retained: CurrentFootprintCopyStartupOpening.prototype.retainedFootprintRouteObservations,
});
const footprintStateMethods = Object.freeze({ observe: CurrentPcb209WorkerStartupOpening.prototype.observeFootprintState,
  require: CurrentPcb209WorkerStartupOpening.prototype.requireFootprintState, retained: CurrentPcb209WorkerStartupOpening.prototype.retainedFootprintState });
const footprintSourceMethods = Object.freeze({ observe: CurrentPcb209WorkerStartupOpening.prototype.observeFootprintSource,
  require: CurrentPcb209WorkerStartupOpening.prototype.requireFootprintSource, retained: CurrentPcb209WorkerStartupOpening.prototype.retainedFootprintSource });
const footprintDependencyMethods = Object.freeze({ observe: CurrentPcb209WorkerStartupOpening.prototype.observeFootprintDependencies,
  require: CurrentPcb209WorkerStartupOpening.prototype.requireFootprintDependencies, retained: CurrentPcb209WorkerStartupOpening.prototype.retainedFootprintDependencies });
const emptySessionMethods = Object.freeze({ openPcb: CurrentPcb209WorkerStartupPcbSession.prototype.openAndQualify,
  pcbStatus: CurrentPcb209WorkerStartupPcbSession.prototype.status, pcbObservation: CurrentPcb209WorkerStartupPcbSession.prototype.retainedOpeningObservation,
  observe: CurrentPcb209WorkerStartupEmptySession.prototype.observeAndJoin, require: CurrentPcb209WorkerStartupEmptySession.prototype.requireOriginal,
  status: CurrentPcb209WorkerStartupEmptySession.prototype.status });
const ratlineChannelCleanup = CurrentPcb209RatlineStartupChannel.prototype.beginCleanup;
const ratlineSessionMethods = Object.freeze({ capture: CurrentPcb209RatlineNativeSession.prototype.captureFirstChildHeld,
  require: CurrentPcb209RatlineNativeSession.prototype.requireOriginal, abort: CurrentPcb209RatlineNativeSession.prototype.abort,
  release: CurrentPcb209RatlineNativeSession.prototype.releaseAfterTermination, status: CurrentPcb209RatlineNativeSession.prototype.status,
  opening: CurrentPcb209RatlineNativeSession.prototype.retainedOpeningObservation,
  originEvidence: CurrentPcb209RatlineNativeSession.prototype.retainedNativeOriginEvidence,
  rejectedStopEvidence: CurrentPcb209RatlineNativeSession.prototype.retainedRejectedStopEvidence,
  ancestryEvidence: CurrentPcb209RatlineNativeSession.prototype.retainedAncestryEvidence });
const continuationChannelCleanup = CurrentPcb209RatlineContinuationChannel.prototype.beginCleanup;
const continuationSessionMethods = Object.freeze({ capture: CurrentPcb209RatlineContinuationNativeSession.prototype.captureContinuation,
  require: CurrentPcb209RatlineContinuationNativeSession.prototype.requireOriginal, abort: CurrentPcb209RatlineContinuationNativeSession.prototype.abort,
  release: CurrentPcb209RatlineContinuationNativeSession.prototype.releaseAfterTermination, status: CurrentPcb209RatlineContinuationNativeSession.prototype.status,
  opening: CurrentPcb209RatlineContinuationNativeSession.prototype.retainedOpeningObservation,
  originEvidence: CurrentPcb209RatlineContinuationNativeSession.prototype.retainedNativeOriginEvidence,
  rejectedStopEvidence: CurrentPcb209RatlineContinuationNativeSession.prototype.retainedRejectedStopEvidence,
  rejectedCaptureReplyEvidence: CurrentPcb209RatlineContinuationNativeSession.prototype.retainedRejectedCaptureReplyEvidence,
  ancestryEvidence: CurrentPcb209RatlineContinuationNativeSession.prototype.retainedAncestryEvidence });
// oxlint-enable typescript/unbound-method

type CleanupRequest = Exclude<LifecycleRequest, { action: "launch" | "inspect" | "query-observation" | "settle-records" | "cleanup-unlaunched" | "cleanup-no-process" }>;
type ObservationRequest = Extract<LifecycleRequest, { action: "restore-window-for-capture" | "resize-window-for-capture" | "capture-window" | "perform-visual" | "browser-observation" | "inspect-frames" | "inspect-script" | "inspect-workers" | "inspect-worker-script" | "observe-worker-state" | "observe-model-state" | "observe-pcb-opening" | "observe-string-precreate" | "observe-layers" | "observe-primitives" | "observe-extended-primitives" | "observe-selection-relations" | "observe-pad-shapes" | "observe-image-shapes" | "observe-arc-shapes" | "observe-poured-shapes" }>;
type ObservationStage = "window-restore209" | "window-resize209" | "window-capture209" | "visual-viewport209" | z.infer<typeof diagnosticObservationStageSchema> | "common-baseline" | "string-precreate" | "layers209" | "primitives209" | "extended-primitives209" | "selection-relations209" | "pad-shapes209" | "image-shapes209" | "arc-shapes209" | "poured-shapes209";
const methods = ["launch", "status", "observeApplicationWindow", "requestNormalClose", "observeTermination", "releaseClosed", "releaseUnlaunched",
  "releaseNoProcess", "browserObservation", "inspectFrames", "inspectScript", "inspectWorkers", "inspectWorkerScript", "observeWorkerState", "observeModelState", "openProject",
  "openPcb", "observePcbOpening"] as const;
export type CurrentPcbDiagnosticLifecycleOwner = Pick<CurrentPcbDiagnosticOwner, (typeof methods)[number]> &
  Partial<Pick<CurrentPcbDiagnosticOwner, "observeLayers209" | "observePrimitives209" | "observeExtendedPrimitives209" | "observeSelectionRelations209" | "observePadShapes209" | "observeImageShapes209" | "observeArcShapes209" | "observePouredShapes209" | "performVisual209" | "captureWindow209" | "observeWindowCaptureReadiness209" | "resizeWindowForCapture209" | "restoreWindowForCapture209" | "terminateVisualJob">>;
type StringOwnerMethods = Pick<CurrentPcbStringPrecreateOwner, "observeStringPrecreate" | "observeCommonBaseline" | "retainedCommonBaselineFailure">;
type StartupOwnerMethods = Pick<CurrentPcbWorkerStartupOwner, "handoffWorkerStartup">;
type StartupContinuationOwnerMethods = Pick<CurrentPcb209RatlineContinuationOwner, "prepareWorkerStartupRatlineContinuationSession209">;
type StartupRatlineOwnerMethods = Pick<CurrentPcb209RatlineStartupOwner, "prepareWorkerStartupRatlineSession209">;
type StartupEmptyOwnerMethods = Pick<CurrentPcb209WorkerStartupOwner, "requireWorkerStartupEmptyDependency209" | "prepareWorkerStartupPcbSession209">;
export type CurrentPcbStringPrecreateLifecycleOwner = CurrentPcbDiagnosticLifecycleOwner & StringOwnerMethods;
export type CurrentPcbWorkerStartupLifecycleOwner = CurrentPcbDiagnosticLifecycleOwner & StartupOwnerMethods & Partial<StartupEmptyOwnerMethods & StartupRatlineOwnerMethods & StartupContinuationOwnerMethods>;
type StartupFootprintUiMethods = Pick<CurrentFootprintCopyPreparationOwner, "observeFootprintCopyUi" | "requireFootprintCopyUi" | "retainedFootprintCopyUi" |
  "observeFootprintCopyManagerRoute" | "requireFootprintCopyManagerRoute" | "retainedFootprintCopyManagerRoute">;
type StartupFootprintRouteMethods = Pick<CurrentFootprintCopyNativeOwner, "observeFootprintCopyWindowsClock" | "joinFootprintCopyManagerPeer" |
  "observeFootprintCopyClockRegistration" | "sampleFootprintCopyClockRegistration" | "retainedFootprintCopyClockRegistration" | "releaseFootprintCopyClockRegistration">;
type MainOwnerMethods = Pick<CurrentFootprintMainNativeOwner, "observeFootprintMainConstruction" | "retainedFootprintMainConstruction" | "terminateFootprintMain">;
type CombinedOwnerMethods = Pick<CurrentFootprintCombinedNativeOwner, "abortFootprintCombined" | "reserveFootprintCombinedAbort" | "dispatchFootprintCombinedAbort" | "observeSavedCacheNative" | "observeSavedCacheAccessor">;
type LifecycleOwner = CurrentPcbDiagnosticLifecycleOwner & Partial<CombinedOwnerMethods & MainOwnerMethods & StartupFootprintRouteMethods & StartupFootprintUiMethods & StringOwnerMethods & StartupOwnerMethods & StartupEmptyOwnerMethods & StartupRatlineOwnerMethods & StartupContinuationOwnerMethods>;
export interface CurrentPcb209StartupEmptyPreparation {
  /** The enclosing lifecycle must durably consume PCB navigation intent before
   * calling openAndQualify. This private preparation does not publish that intent. */
  readonly pcb: CurrentPcb209WorkerStartupPcbSession;
  readonly prepareEmpty: (packet: CurrentPcb209WorkerStartupPcbPacket) => CurrentPcb209WorkerStartupEmptySession;
}
export interface CurrentPcbDiagnosticLifecycleOptions extends CurrentPcbDiagnosticInstallationOptions {
  readonly assertAllowed: () => Promise<void>;
  /** Original local method/environment identity only. No bridge or full startup admission. */
  readonly assertLocalAllowed: () => void;
  /** Must scan unresolved engine/project replacement owners in addition to the
   * mandatory ordinary/diagnostic journals. Presence is not termination proof. */
  readonly assertOtherLaunchesSettled: () => Promise<void>;
}
/** Offline fixture seams only. No public request selects factories or pins. */
export interface CurrentPcbDiagnosticLifecycleDependencies {
  readonly verifyInstallation?: (options: CurrentPcbDiagnosticInstallationOptions) => Promise<CurrentPcbDiagnosticInstallation>;
  readonly allocateOwner?: (options: CurrentPcbDiagnosticInstallationOptions) => Promise<CurrentPcbDiagnosticLifecycleOwner>;
  readonly publishRecord?: typeof publishCurrentPcbDiagnosticLifecycleRecord;
  readonly prepareCheckpoint?: typeof prepareCurrentDisposableOpenCheckpoint;
  readonly verifyCheckpoint?: typeof verifyCurrentDisposableOpenCheckpoint;
  readonly verifyHistoricalCheckpoint?: typeof verifyHistoricalCurrentDisposableOpenCheckpoint;
}
export interface CurrentPcbStringPrecreateLifecycleDependencies extends Omit<CurrentPcbDiagnosticLifecycleDependencies, "allocateOwner"> {
  readonly allocateOwner?: (options: CurrentPcbDiagnosticInstallationOptions) => Promise<CurrentPcbStringPrecreateLifecycleOwner>;
  readonly readCommonInventory?: typeof readCurrentPcbCommonOpenInventory;
}
export interface CurrentPcbWorkerStartupLifecycleDependencies extends Omit<CurrentPcbDiagnosticLifecycleDependencies, "allocateOwner"> {
  readonly allocateOwner?: (options: CurrentPcbDiagnosticInstallationOptions) => Promise<CurrentPcbWorkerStartupLifecycleOwner>;
  readonly readCommonInventory?: typeof readCurrentPcbCommonOpenInventory;
  readonly createStartupOpening?: (handoff: CurrentPcbWorkerStartupHandoff) => CurrentPcbWorkerStartupOpeningCoordinator;
}
export interface CurrentPcb209WorkerStartupLifecycleDependencies extends Omit<CurrentPcbWorkerStartupLifecycleDependencies, "createStartupOpening"> {
  readonly createFootprintRouteStartupOpening?: (handoff: CurrentPcbWorkerStartupHandoff) => CurrentFootprintCopyStartupOpeningCoordinator;
  readonly create209StartupOpening?: (handoff: CurrentPcbWorkerStartupHandoff) => CurrentPcb209WorkerStartupOpeningCoordinator;
}
interface Retained {
  readonly operationId: string;
  readonly owner: LifecycleOwner;
  readonly methods: LifecycleOwner;
  readonly installation: string;
  readonly intentSha256: string;
  binding: DiagnosticLifecycleBinding | null;
}
interface Attempt { readonly operationId: string; readonly intentSha256: string; allocationInvoked: boolean; launchInvoked: boolean }
interface ProjectPreparation {
  readonly sealedTarget: CurrentDisposableOpenSealedTarget;
  readonly prepared: CurrentDisposableOpenCheckpoint;
  readonly preparedText: string;
  readonly originalTarget: Extract<Request, { action: "open-project" }>["target"];
  readonly commonInventory: Awaited<ReturnType<typeof readExactSqlInventory>> | null;
}
const claims = Object.freeze({ bridgeAuthentication: false, frameWorkerVerified: false, startupQualified: false,
  validationOnly: true, executionAuthorized: false, designExecutionAuthorized: false, savedStateVerified: false, historicalOwnershipRecreated: false });
function requireValue(value: boolean, message: string): asserts value {
  if (!value) { throw new Error(`PCB_DIAGNOSTIC_LIFECYCLE_${message}`); }
}
async function assertSnapshot(expected: readonly DiagnosticLifecycleOperation[]): Promise<void> {
  assertCurrentPcbDiagnosticLifecycleSnapshot(await readCurrentPcbDiagnosticLifecycles(), expected);
}
function describe(operationId: string, operation: DiagnosticLifecycleOperation | undefined): Record<string, unknown> {
  const records = operation?.records;
  const binding = records?.["binding.json"];
  let state = operation === undefined ? "not-found" : "launch-unknown";
  if (binding?.launchAcknowledged === true) { state = "launched"; }
  if (binding?.binding.rootCreated === "0") { state = "cleanup-only"; }
  if (records?.["terminated.json"] !== undefined) { state = "terminated"; }
  if (records?.["released.json"] !== undefined) { state = "released"; }
  if (records?.["combined-factory-before-launch.json"] !== undefined) { state = "factory-before-launch-failed"; }
  if (records?.["not-dispatched.json"] !== undefined) { state = "not-dispatched"; }
  if (records?.["no-process-released.json"] !== undefined) { state = "no-process-released"; }
  return { operationId, state, attemptConsumed: operation !== undefined, closeAttemptConsumed: records?.["close-intent.json"] !== undefined,
    closeAcknowledged: records?.["close-acknowledged.json"] !== undefined, releaseAttemptConsumed: records?.["release-intent.json"] !== undefined,
    noProcessReleaseAttemptConsumed: records?.["no-process-release-intent.json"] !== undefined,
    noProcessReleaseProof: records?.["no-process-released.json"]?.proof,
    projectOpeningAttemptConsumed: records?.["project-opening-intent.json"] !== undefined ||
      records?.["worker-startup-opening-intent.json"] !== undefined,
    projectOpeningResultPublished: records?.["project-opening-result.json"] !== undefined,
    pcbOpeningAttemptConsumed: records?.["pcb-open-intent.json"] !== undefined,
    pcbOpeningResultPublished: records?.["pcb-open-result.json"] !== undefined,
    workerStartupHandoffAttemptConsumed: records?.["worker-startup-handoff-intent.json"] !== undefined,
    workerStartupHandoffResultPublished: records?.["worker-startup-handoff-result.json"] !== undefined,
    workerStartupOpeningAttemptConsumed: records?.["worker-startup-opening-intent.json"] !== undefined,
    workerStartupOpeningResultPublished: records?.["worker-startup-opening-result.json"] !== undefined,
    workerStartupAssignmentsAttemptConsumed: records?.["worker-startup-assignments-intent.json"] !== undefined,
    workerStartupAssignmentsResultPublished: records?.["worker-startup-assignments-result.json"] !== undefined,
    workerStartupFootprintAttemptConsumed: records?.["worker-startup-footprint-intent.json"] !== undefined,
    workerStartupFootprintResultPublished: records?.["worker-startup-footprint-result.json"] !== undefined,
    workerStartupFootprintSourceAttemptConsumed: records?.["worker-startup-footprint-source-intent.json"] !== undefined,
    workerStartupFootprintSourceResultPublished: records?.["worker-startup-footprint-source-result.json"] !== undefined,
    workerStartupFootprintPreparationAttemptConsumed: records?.["worker-startup-footprint-preparation-intent.json"] !== undefined,
    workerStartupFootprintPreparationResultPublished: records?.["worker-startup-footprint-preparation-result.json"] !== undefined,
    footprintUiAttemptConsumed: records?.["footprint-copy-ui-intent.json"] !== undefined,
    footprintUiResultPublished: records?.["footprint-copy-ui-result.json"] !== undefined,
    footprintDependenciesAttemptConsumed: records?.["footprint-copy-dependencies-intent.json"] !== undefined,
    footprintDependenciesResultPublished: records?.["footprint-copy-dependencies-result.json"] !== undefined,
    footprintManagerRouteAttemptConsumed: records?.["footprint-copy-manager-route-intent.json"] !== undefined,
    footprintManagerRouteResultPublished: records?.["footprint-copy-manager-route-result.json"] !== undefined,
    footprintBindingsAttemptConsumed: records?.["footprint-copy-bindings-intent.json"] !== undefined,
    footprintBindingsResultPublished: records?.["footprint-copy-bindings-result.json"] !== undefined,
    workerStartupActorAttemptConsumed: records?.["worker-startup-actor-intent.json"] !== undefined,
    workerStartupActorResultPublished: records?.["worker-startup-actor-result.json"] !== undefined,
    workerStartupChannelAttemptConsumed: records?.["worker-startup-channel-intent.json"] !== undefined,
    workerStartupChannelResultPublished: records?.["worker-startup-channel-result.json"] !== undefined,
    ...(binding === undefined ? {} : { binding: binding.binding, bindingSha256: sha256Json(binding), launchAcknowledged: binding.launchAcknowledged }),
    ...claims };
}
/** V2/V3 retain up to680/712KiB on disk. Keep initial and inspect responses
 * below the facade512KiB envelope; the complete original record is unchanged. */
function publicObservationResult(operationId: string, stage: ObservationStage,
  result: Readonly<Record<string, unknown>> | undefined, published: boolean): Readonly<Record<string, unknown>> | undefined {
  if (stage !== "string-precreate" || result?.["schema"] !== "easyeda-pro-control.pcb-string-precreate-observation.v2" &&
      result?.["schema"] !== "easyeda-pro-control.pcb-string-precreate-observation.v3") { return result; }
  const value = stringPrecreateObservationResultSchema.parse(result);
  return { schema: "easyeda-pro-control.pcb-string-precreate-summary.v1", observationSchema: value.schema,
    target: value.target, matchingSamples: value.matchingSamples, originalContextsRechecked: value.originalContextsRechecked,
    summaryOnly: true, record: { path: join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId, "string-precreate-result.json"),
      published, resultSha256: sha256Json(value), resultBytes: Buffer.byteLength(canonicalJson(value)) },
    projectWorkerAssociationVerified: false, publicationCaptureVerified: false, completeLiveSourceVerified: false,
    queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false };
}
/** Inspection already includes parent/opening evidence. Do not duplicate the
 * complete actor packet beside its retained four native samples. */
function publicStartupActorResult(operationId: string,
  record: DiagnosticLifecycleRecords["worker-startup-actor-result.json"], published: boolean): Readonly<Record<string, unknown>> | null {
  if (record === undefined) { return null; }
  const wrapper = record.result.profile === "private.current-pcb209-worker-startup-actor.v1" ? record.result : null;
  const original = record.result.profile === "private.current-pcb209-worker-startup-actor.v1" ? record.result.originalActorPacket : record.result;
  const { samples, workerUserText, ...summary } = original;
  return { schema: wrapper === null ? "easyeda-pro-control.pcb-worker-startup-actor-summary.v1" : "easyeda-pro-control.pcb209-worker-startup-actor-summary.v1", ...summary,
    ...(wrapper === null ? {} : { sourceQualification: { profile: wrapper.profile, sourceClosureSha256: wrapper.sourceClosureSha256,
      packetSha256: wrapper.packetSha256, compatibilityAdmitted: false, nativeSourceContextsOwned: false } }),
    summaryOnly: true, pointInTimeObservation: true, sampleCount: samples.length, workerUserTextSha256: sha256Text(workerUserText),
    record: { path: join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId, "worker-startup-actor-result.json"),
      published, sha256: sha256Json(record), bytes: Buffer.byteLength(canonicalJson(record)) } };
}
/** The manager retains a complete multi-megabyte runtime script privately.
 * Its inspect receipt must fit the unchanged facade response envelope. */
function publicFootprintManagerRouteObservation(observation: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
  const encoded = canonicalJson(observation);
  return { schema: "easyeda-pro-control.footprint-manager-route-retained-summary.v1", summaryOnly: true,
    fullObservationRetainedInOriginalOwner: true, fullObservationPersisted: false, rawRepliesInline: false,
    jsonBytes: Buffer.byteLength(encoded), sha256: sha256Text(encoded) };
}
function publicStartupChannelResult(operationId: string,
  record: DiagnosticLifecycleRecords["worker-startup-channel-result.json"], published: boolean): Readonly<Record<string, unknown>> | null {
  if (record === undefined) { return null; }
  const { gateReplies, ...summary } = record.result;
  return { schema: "easyeda-pro-control.pcb-worker-startup-channel-summary.v1", ...summary,
    summaryOnly: true, pointInTimeObservation: true, sampleCount: gateReplies.length,
    gateReplySha256: gateReplies.map(reply => sha256Text(reply)),
    record: { path: join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId, "worker-startup-channel-result.json"),
      published, sha256: sha256Json(record), bytes: Buffer.byteLength(canonicalJson(record)) } };
}

function publicStartupEmptyResult(operationId: string,
  record: DiagnosticLifecycleRecords["worker-startup-empty-result.json"]): Record<string, unknown> | null {
  if (record === undefined) { return null; }
  return { operationId, validationOnly: true, executionAuthorized: false, saveAuthorized: false,
    profile: record.result.profile, pcbPacketSha256: record.result.pcbPacketSha256,
    baselinePacketSha256: record.result.baseline.packetSha256, nativeCommands: record.result.nativeCommands,
    completeLiveBaselineVerified: false, startupCompletionVerified: false,
    record: { path: join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId, "worker-startup-empty-result.json"),
      sha256: sha256Json(record), bytes: Buffer.byteLength(canonicalJson(record)) } };
}

/** Shared cleanup and journal machinery. Only fixed exported facades
 * construct it; neither public requests nor dependency seams select purpose. */
class CurrentPcbLifecycleCore {
  readonly #purpose: CurrentPcbDiagnosticLifecyclePurpose;
  readonly #generation: LifecycleGeneration;
  readonly #stringPurpose: boolean;
  readonly #stages: readonly ObservationStage[];
  readonly #options: CurrentPcbDiagnosticLifecycleOptions;
  readonly #verify: NonNullable<CurrentPcbDiagnosticLifecycleDependencies["verifyInstallation"]>;
  readonly #allocate: (options: CurrentPcbDiagnosticInstallationOptions) => Promise<LifecycleOwner>;
  readonly #publish: typeof publishCurrentPcbDiagnosticLifecycleRecord;
  readonly #prepareCheckpoint: typeof prepareCurrentDisposableOpenCheckpoint;
  readonly #verifyCheckpoint: typeof verifyCurrentDisposableOpenCheckpoint;
  readonly #verifyHistoricalCheckpoint: typeof verifyHistoricalCurrentDisposableOpenCheckpoint;
  readonly #readCommonInventory: typeof readCurrentPcbCommonOpenInventory;
  readonly #createStartupOpening: (handoff: CurrentPcbWorkerStartupHandoff) => CurrentPcbStartupLifecycleAdapter;
  readonly #pending = new Map<DiagnosticLifecycleRecordName, string>();
  readonly #observations = new Map<ObservationStage, Readonly<Record<string, unknown>>>();
  readonly #observationConsumed = new Set<ObservationStage>();
  #attempt: Attempt | null = null;
  #retained: Retained | null = null;
  #lease: CurrentPcbDiagnosticLaunchLease | null = null;
  #busy = false;
  #launchAttempted = false;
  #closeAttempted = false;
  #releaseAttempted = false;
  #releaseInvoked = false;
  #unlaunchedInvoked = false;
  #noProcessInvoked = false;
  #openingAttempted = false;
  #openingResult: Readonly<Record<string, unknown>> | null = null;
  #projectPreparation: ProjectPreparation | null = null;
  #pcbOpeningAttempted = false;
  #pcbOpeningResult: Readonly<Record<string, unknown>> | null = null;
  #startupHandoffAttempted = false;
  #startupHandoff: CurrentPcbWorkerStartupHandoff | null = null;
  #startupOpening: Readonly<{ owner: CurrentPcbStartupLifecycleAdapter; methods: CurrentPcbStartupLifecycleAdapter }> | null = null;
  #startupOpeningResult: CurrentPcbStartupOpeningResult | null = null;
  #startupOpeningReleased = false;
  #startupAssignmentsAttempted = false;
  #startupAssignments: CurrentPcbWorkerConstructionAssignments | null = null;
  #startupFootprintAttempted = false;
  #startupFootprintPacket: CurrentFootprintCopyStatePacket | null = null;
  #startupFootprintOpening: CurrentPcb209WorkerStartupOpening | null = null;
  #startupFootprintSourceAttempted = false;
  #startupFootprintSourcePacket: CurrentFootprintSourceReadPacket | null = null;
  #startupFootprintSourcePlan: CurrentFootprintSourcePlan | null = null;
  #startupFootprintPreparationAttempted = false;
  #startupFootprintPreparation: CurrentFootprintCopyPreparation | null = null;
  #footprintUiAttempted = false;
  #footprintUiPacket: CurrentFootprintCopyUiObservation | null = null;
  #footprintBindingsAttempted = false;
  #footprintBindings: CurrentFootprintCopyBindings | null = null;
  #footprintDependenciesAttempted = false;
  #footprintDependencies: CurrentFootprintCopyDependencyObservation | null = null;
  #footprintManagerRouteAttempted = false;
  #footprintManagerRoute: CurrentFootprintCopyManagerRouteObservation | null = null;
  #mainObservationAttempted = false;
  #savedCacheNativeAttempted = false;
  #savedCacheAccessorAttempted = false;
  #visualAbortAttempted = false;
  #mainTerminateAttempted = false;
  #combinedFactoryError: unknown = null;
  #combinedFactoryFailure: CurrentFootprintCombinedBeforeLaunchFailureProof | null = null;
  #combinedFactoryDiagnostics: CurrentFootprintCombinedFactoryFailureDiagnostics | null = null;
  #combinedAbortAttempted = false;
  #combinedAbortBusy = false;
  #publicationTail: Promise<void> = Promise.resolve();
  readonly #combinedAbortedRecords = new Map<DiagnosticLifecycleRecordName, string>();
  #footprintRouteAttempted = false;
  #footprintRouteRetained: Record<string, unknown> | null = null;
  #startupActorAttempted = false;
  #startupActorPacket: CurrentPcbStartupActorPacket | null = null;
  #startupChannelAttempted = false;
  #startupChannelPacket: CurrentPcbWorkerStartupChannelPacket | null = null;
  #startupEmptyAttempted = false;
  #startupEmptyPreparation: CurrentPcb209StartupEmptyPreparation | null = null;
  #startupEmptyPcbPacket: CurrentPcb209WorkerStartupPcbPacket | null = null;
  #startupEmptySession: CurrentPcb209WorkerStartupEmptySession | null = null;
  #startupEmptyPacket: CurrentPcb209WorkerStartupEmptyPacket | null = null;
  #startupEmptyFailed = false;
  #startupRatlineAttempted = false;
  #startupRatlineFailed = false;
  #startupRatlineSession: CurrentPcb209RatlineNativeSession | null = null;
  #startupRatlinePacket: CurrentPcb209RatlineNativePacket | null = null;
  #startupRatlineCleanup: Promise<void> | null = null;
  #startupRatlineCleanupFailed = false;
  #startupRatlineReleased = false;
  #startupContinuationAttempted = false;
  #startupContinuationFailed = false;
  #startupContinuationSession: CurrentPcb209RatlineContinuationNativeSession | null = null;
  #startupContinuationPacket: CurrentPcb209RatlineContinuationNativePacket | null = null;
  #startupContinuationCleanup: Promise<void> | null = null;
  #startupContinuationCleanupFailed = false;
  #startupContinuationReleased = false;

  public constructor(options: CurrentPcbDiagnosticLifecycleOptions,
    dependencies: CurrentPcbDiagnosticLifecycleDependencies | CurrentPcbStringPrecreateLifecycleDependencies | CurrentPcbWorkerStartupLifecycleDependencies | CurrentPcb209WorkerStartupLifecycleDependencies,
    purpose: CurrentPcbDiagnosticLifecyclePurpose, generation: LifecycleGeneration = "206") {
    const stringPurpose = purpose === "string-precreate";
    requireValue((!opening209(generation) || purpose === "diagnostic") && (!startup209(generation) || purpose === "worker-startup"), "GENERATION_PURPOSE");
    this.#generation = generation;
    this.#purpose = purpose;
    this.#stringPurpose = stringPurpose;
    this.#stages = opening209(generation) ? [...(generation === "209-visual" ? ["visual-viewport209" as const, "window-restore209" as const, "window-resize209" as const, "window-capture209" as const] : []), "browser", "frames", "script", "pcb-opening", "layers209", "primitives209", "extended-primitives209", "selection-relations209", "pad-shapes209", "image-shapes209", "arc-shapes209", "poured-shapes209"] :
      { diagnostic: diagnosticObservationStageSchema.options, "string-precreate": currentPcbStringPrecreateStages,
        "worker-startup": startupStages }[purpose];
    this.#options = Object.freeze({ ...options });
    let verify = generation === "206" ? verifyCurrentPcbDiagnosticInstallation : verifyCurrentPcb209DiagnosticInstallation;
    if (generation === "209-startup-ratline" || generation === "209-startup-ratline-continuation") { verify = verifyCurrentPcb209RatlineInstallation; }
    this.#verify = dependencies.verifyInstallation ?? verify;
    let allocate = { diagnostic: startCurrentPcbDiagnosticOwner, "string-precreate": startCurrentPcbStringPrecreateOwner,
      "worker-startup": startCurrentPcbWorkerStartupOwner }[purpose];
    if (generation === "209-startup-ratline") { allocate = startCurrentPcb209RatlineStartupOwner; }
    if (generation === "209-startup-ratline-continuation") { allocate = startCurrentPcb209RatlineContinuationOwner; }
    else if (generation === "209-startup-empty") { allocate = startCurrentPcb209EmptyStartupOwner; }
    else if (generation === "209-startup-footprint-combined") { allocate = startCurrentFootprintCombinedNativeOwner; }
    else if (generation === "209-startup-footprint-main") { allocate = startCurrentFootprintMainNativeOwner; }
    else if (routeStartup209(generation)) { allocate = startCurrentFootprintCopyNativeOwner; }
    else if (generation === "209-startup-footprint") { allocate = startCurrentFootprintCopyPreparationOwner; }
    else if (generation === "209-startup") { allocate = startCurrentPcb209WorkerStartupOwner; }
    else if (generation === "209-visual") { allocate = startCurrentPcb209VisualOwner; }
    else if (generation === "209-opening") { allocate = startCurrentPcb209DiagnosticOwner; }
    this.#allocate = dependencies.allocateOwner ?? allocate;
    const publish = dependencies.publishRecord ?? publishCurrentPcbDiagnosticLifecycleRecord;
    this.#publish = generation === "209-startup-footprint-combined" ? (operationId, name, record): Promise<void> => {
      const previous = this.#publicationTail;
      const pending = (async (): Promise<void> => {
        await previous; this.#assertPublicationAllowed(name);
        await publish(operationId, name, record);
      })();
      // Publication remains ordered even if a consumed plan fails. Abort waits
      // Only this disk barrier, never an active renderer/inspector operation.
      this.#publicationTail = (async (): Promise<void> => {
        try { await pending; } catch {
          // The original caller retains the failure and consumed plan.
        }
      })();
      return pending;
    } : publish;
    this.#prepareCheckpoint = dependencies.prepareCheckpoint ?? prepareCurrentDisposableOpenCheckpoint;
    this.#verifyCheckpoint = dependencies.verifyCheckpoint ?? verifyCurrentDisposableOpenCheckpoint;
    this.#verifyHistoricalCheckpoint = dependencies.verifyHistoricalCheckpoint ?? verifyHistoricalCurrentDisposableOpenCheckpoint;
    this.#readCommonInventory = "readCommonInventory" in dependencies ? dependencies.readCommonInventory ?? readCurrentPcbCommonOpenInventory : readCurrentPcbCommonOpenInventory;
    if (routeStartup209(generation)) {
      const create = "createFootprintRouteStartupOpening" in dependencies ? dependencies.createFootprintRouteStartupOpening : undefined;
      this.#createStartupOpening = (handoff): CurrentPcbStartupLifecycleAdapter => adaptCurrentFootprintCopyStartupLifecycle(create === undefined ? new CurrentFootprintCopyStartupOpening(handoff) : create(handoff));
    } else if (startup209(generation)) {
      const create = "create209StartupOpening" in dependencies ? dependencies.create209StartupOpening : undefined;
      this.#createStartupOpening = (handoff): CurrentPcbStartupLifecycleAdapter => adaptCurrentPcb209WorkerStartupLifecycle(create === undefined ? new CurrentPcb209WorkerStartupOpening(handoff) : create(handoff));
    } else {
      const create = "createStartupOpening" in dependencies ? dependencies.createStartupOpening : undefined;
      this.#createStartupOpening = (handoff): CurrentPcbStartupLifecycleAdapter => adaptCurrentPcbWorkerStartupLifecycle(create === undefined ? new CurrentPcbWorkerStartupOpening(handoff) : create(handoff));
    }
  }

  public async run(input: unknown): Promise<Record<string, unknown>> {
    let request: LifecycleRequest;
    if (this.#generation === "209-startup-footprint-main" || this.#generation === "209-startup-footprint-combined") {
      const selected = (this.#generation === "209-startup-footprint-combined" ? currentFootprintCombinedLifecycleRequestSchema : currentFootprintMainLifecycleRequestSchema).parse(input);
      request = selected.action === "launch" ? currentPcbDiagnosticValidationRequestSchema.parse({ action: selected.action, operationId: selected.operationId, confirmValidationOnly: selected.confirmValidationOnly, confirmDiagnosticLaunch: selected.confirmDiagnosticLaunch, acceptExistingProfileEffects: selected.acceptExistingProfileEffects }) : selected;
    }
    else if (this.#generation === "209-startup-footprint-route") { request = currentFootprintCopyRoutePreparationLifecycleRequestSchema.parse(input); }
    else if (this.#generation === "209-startup-footprint") { request = currentFootprintCopyPreparationLifecycleRequestSchema.parse(input); }
    else if (this.#generation === "209-startup-ratline-continuation") { request = currentPcb209RatlineContinuationLifecycleRequestSchema.parse(input); }
    else if (this.#generation === "209-startup-ratline") { request = currentPcb209RatlineStartupLifecycleRequestSchema.parse(input); }
    else if (this.#generation === "209-startup-empty") { request = currentPcb209EmptyStartupLifecycleRequestSchema.parse(input); }
    else if (this.#generation === "209-startup") { request = currentPcb209WorkerStartupLifecycleRequestSchema.parse(input); }
    else if (this.#generation === "209-visual") { request = currentPcb209VisualRequestSchema.parse(input); }
    else if (this.#generation === "209-opening") { request = currentPcb209OpeningRequestSchema.parse(input); }
    else { request = { diagnostic: currentPcbDiagnosticValidationRequestSchema, "string-precreate": currentPcbStringPrecreateRequestSchema,
      "worker-startup": currentPcbWorkerStartupLifecycleRequestSchema }[this.#purpose].parse(input); }
    if (request.action === "query-observation") {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === request.operationId);
      this.#assertPurpose(request.operationId, operation);
      const record = operation?.records[`${request.observation}-result.json`];
      const opening = operation?.records["project-opening-intent.json"];
      const selection = operation?.records["selection-relations209-intent.json"];
      requireValue(record !== undefined && opening !== undefined &&
        sha256Json(record) === request.expectedResultRecordSha256, "QUERY_PUBLISHED_RESULT_REQUIRED");
      const result = queryCurrentPcb209Observation(record.result, opening.target, request.query, {
        operationId: request.operationId, stage: request.observation, resultRecordSha256: request.expectedResultRecordSha256,
        observedAt: record.createdAt,
      }, request.observation === "selection-relations209" ? selection?.componentIds : undefined);
      await assertSnapshot(operations);
      return result;
    }
    if (request.action === "inspect") {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === request.operationId);
      this.#assertPurpose(request.operationId, operation);
      const original = this.#retained?.operationId === request.operationId;
      const pendingIntent = this.#attempt?.operationId === request.operationId ? this.#attempt : null;
      const noProcessCleanupAvailable = original && this.#retained !== null && this.#lease !== null && !this.#noProcessInvoked &&
        this.#retained.methods.status.call(this.#retained.owner).noProcessCleanupAvailable;
      const native = original && this.#retained !== null ? this.#retained.methods.status.call(this.#retained.owner) : null;
      const pendingFailure = original ? this.#pending.get("observation-failure.json") : undefined;
      const failureRecord = pendingFailure === undefined ? operation?.records["observation-failure.json"] :
        diagnosticLifecycleRecordSchemas["observation-failure.json"].parse(JSON.parse(pendingFailure) as unknown);
      const commonPending = original ? this.#pending.get("common-baseline-failure.json") : undefined;
      const commonFailure = commonPending === undefined ? operation?.records["common-baseline-failure.json"] :
        diagnosticLifecycleRecordSchemas["common-baseline-failure.json"].parse(JSON.parse(commonPending) as unknown);
      const selectedStage = request.observation ?? this.#stages.toReversed().find(stage =>
        operation?.records[`${stage}-result.json`] !== undefined || original && this.#pending.has(`${stage}-result.json`));
      const observations = this.#stages.map(stage => {
        const record = operation?.records[`${stage}-result.json`];
        const pending = original ? this.#pending.get(`${stage}-result.json`) : undefined;
        const retained = pending === undefined ? undefined : diagnosticLifecycleRecordSchemas[`${stage}-result.json`].parse(JSON.parse(pending) as unknown);
        return { stage, consumed: operation?.records[`${stage}-intent.json`] !== undefined || original && this.#observationConsumed.has(stage),
          resultRetained: original && this.#observations.has(stage), published: record !== undefined,
          ...(record === undefined || this.#generation !== "209-opening" ||
            !["primitives209", "extended-primitives209", "selection-relations209", "pad-shapes209", "image-shapes209", "arc-shapes209", "poured-shapes209"].includes(stage) ? {} :
            { resultRecordSha256: sha256Json(record), observedAt: record.createdAt }),
          result: stage === selectedStage ? publicObservationResult(request.operationId, stage, (record ?? retained)?.result, record !== undefined) : undefined };
      });
      const openingPending = original ? this.#pending.get("project-opening-result.json") : undefined;
      const openingPublished = operation?.records["project-opening-result.json"];
      const openingRecord = openingPending === undefined ? openingPublished :
        diagnosticLifecycleRecordSchemas["project-opening-result.json"].parse(JSON.parse(openingPending) as unknown);
      const openingConsumed = operation?.records["project-opening-intent.json"] !== undefined ||
        operation?.records["worker-startup-opening-intent.json"] !== undefined || original && this.#openingAttempted;
      const openingResult = original && this.#openingResult !== null ? this.#openingResult : openingRecord?.result;
      const pcbOpeningPending = original ? this.#pending.get("pcb-open-result.json") : undefined;
      const pcbOpeningRecord = pcbOpeningPending === undefined ? operation?.records["pcb-open-result.json"] :
        diagnosticLifecycleRecordSchemas["pcb-open-result.json"].parse(JSON.parse(pcbOpeningPending) as unknown);
      const pcbOpeningResult = original && this.#pcbOpeningResult !== null ? this.#pcbOpeningResult : pcbOpeningRecord?.result;
      // A decoded renderer reply can precede a failed original-frame or final
      // Installation check. Preserve it separately, never as an accepted result
      // Or a publication plan that could authorize worker discovery.
      const nativeOpeningReply = original && openingConsumed && this.#openingResult === null
        ? native?.projectOpeningResult ?? null : null;
      const nativePcbOpeningReply = original && this.#pcbOpeningAttempted && this.#pcbOpeningResult === null
        ? native?.pcbOpeningResult ?? null : null;
      const nativePcbFrameObservation = original && this.#observationConsumed.has("pcb-opening") && !this.#observations.has("pcb-opening")
        ? native?.pcbFrameObservation ?? null : null;
      const actorPending = original ? this.#pending.get("worker-startup-actor-result.json") : undefined;
      const actorPublished = operation?.records["worker-startup-actor-result.json"];
      const actorRecord = actorPending === undefined ? actorPublished :
        diagnosticLifecycleRecordSchemas["worker-startup-actor-result.json"].parse(JSON.parse(actorPending) as unknown);
      const channelPending = original ? this.#pending.get("worker-startup-channel-result.json") : undefined;
      const channelPublished = operation?.records["worker-startup-channel-result.json"];
      const channelRecord = channelPending === undefined ? channelPublished :
        diagnosticLifecycleRecordSchemas["worker-startup-channel-result.json"].parse(JSON.parse(channelPending) as unknown);
      let openingState = openingConsumed ? "opening-unknown" : "not-attempted";
      if (openingResult !== undefined) {
        openingState = openingResult["ok"] === true && openingResult["status"] === "opened-prefix-observed" ? "opened-prefix-observed" : "refused";
      }
      if (this.#attempt?.operationId === request.operationId && this.#combinedFactoryError !== null) {
        const diagnostics = currentFootprintCombinedFactoryFailureDiagnostics(this.#combinedFactoryError, this.#options);
        this.#combinedFactoryDiagnostics = diagnostics === null ? null : currentFootprintCombinedFactoryFailureDiagnosticsSchema.parse(diagnostics);
      }
      const combinedNativeState = this.#generation === "209-startup-footprint-combined" && native !== null ? currentFootprintCombinedNativeStateSchema.parse({
        combinedAbortDispatchAttempted: native.combinedAbortDispatchAttempted, combinedOutputCleanupOnly: native.combinedOutputCleanupOnly,
      }) : { combinedAbortDispatchAttempted: null, combinedOutputCleanupOnly: null };
      return { ...describe(request.operationId, operation), busy: this.#busy, observations, noProcessCleanupAvailable,
        ...combinedNativeState,
        combinedFactoryBeforeLaunchPublished: operation?.records["combined-factory-before-launch.json"] !== undefined,
        combinedFactoryBeforeLaunchRetained: this.#attempt?.operationId === request.operationId && this.#combinedFactoryFailure !== null,
        combinedFactoryFailureDiagnostics: this.#attempt?.operationId === request.operationId ? this.#combinedFactoryDiagnostics : null,
        workerStartupHandoffAttemptConsumed: operation?.records["worker-startup-handoff-intent.json"] !== undefined || original && this.#startupHandoffAttempted,
        workerStartupHandoffRetained: original && this.#startupHandoff !== null,
        workerStartupChannel: native?.workerStartupChannel ?? null,
        visual209RetainedObservation: original && this.#generation === "209-visual" &&
          operation?.records["visual-viewport209-result.json"] === undefined && !this.#pending.has("visual-viewport209-result.json") ?
          native?.visual209RetainedObservation ?? null : null,
        windowCapture209RetainedObservation: original && this.#generation === "209-visual" &&
          operation?.records["window-capture209-result.json"] === undefined && !this.#pending.has("window-capture209-result.json") ?
          native?.windowCapture209RetainedObservation ?? null : null,
        windowNativeFailure: original ? native?.windowNativeFailure ?? null : null,
        windowRestore209AttemptConsumed: operation?.records["window-restore209-intent.json"] !== undefined || original && native?.windowRestore209AttemptConsumed === true,
        windowRestore209ReadinessObserved: original ? native?.windowRestore209ReadinessObserved ?? false : false,
        windowRestore209RetainedObservation: original && operation?.records["window-restore209-result.json"] === undefined ? native?.windowRestore209RetainedObservation ?? null : null,
        windowRestoreObservationAccepted: false,
        windowResize209AttemptConsumed: operation?.records["window-resize209-intent.json"] !== undefined || original && native?.windowResize209AttemptConsumed === true,
        windowResize209ReadinessObserved: original ? native?.windowResize209ReadinessObserved ?? false : false,
        windowResize209RetainedObservation: original && operation?.records["window-resize209-result.json"] === undefined ? native?.windowResize209RetainedObservation ?? null : null,
        windowResizeObservationAccepted: false,
        windowCaptureReadinessQueriesUsed: original ? native?.windowCaptureReadinessQueriesUsed ?? 0 : null,
        windowCapture209NativeDispatchAttempted: original ? native?.windowCapture209NativeDispatchAttempted ?? false : false,
        windowCaptureNativeResourcesMayRemain: original ? native?.windowCaptureNativeResourcesMayRemain ?? false : false,
        windowCaptureObservationAccepted: false,
        visualObservationCurrent: false, visualObservationAccepted: false,
        mainConstructionAttemptConsumed: operation?.records["main-construction-intent.json"] !== undefined || original && this.#mainObservationAttempted,
        mainConstructionResultPublished: operation?.records["main-construction-result.json"] !== undefined,
        savedCacheNativeAttemptConsumed: operation?.records["saved-cache-native-intent.json"] !== undefined || original && this.#savedCacheNativeAttempted,
        savedCacheNativeObservation: original && operation?.records["saved-cache-native-result.json"] === undefined ? native?.savedCacheNativeObservation ?? null : null,
        savedCacheNativeResult: operation?.records["saved-cache-native-result.json"]?.result ?? null,
        savedCacheAccessorAttemptConsumed: operation?.records["saved-cache-accessor-intent.json"] !== undefined || original && this.#savedCacheAccessorAttempted,
        savedCacheAccessorObservation: original && operation?.records["saved-cache-accessor-result.json"] === undefined ? native?.savedCacheAccessorObservation ?? null : null,
        savedCacheAccessorResult: operation?.records["saved-cache-accessor-result.json"]?.result ?? null,
        mainConstructionObservation: original && this.#retained?.methods.retainedFootprintMainConstruction !== undefined ? this.#retained.methods.retainedFootprintMainConstruction.call(this.#retained.owner) : null,
        visualAbortAttemptConsumed: operation?.records["visual-abort-intent.json"] !== undefined || original && this.#visualAbortAttempted,
        visualAbortAcknowledged: operation?.records["visual-abort-acknowledged.json"] !== undefined,
        mainTerminationAttemptConsumed: operation?.records["main-terminate-intent.json"] !== undefined || original && this.#mainTerminateAttempted,
        mainTerminationAcknowledged: operation?.records["main-terminate-acknowledged.json"] !== undefined,
        combinedAbortAttemptConsumed: operation?.records["combined-abort-intent.json"] !== undefined || original && this.#combinedAbortAttempted,
        combinedAbortAcknowledged: operation?.records["combined-abort-acknowledged.json"] !== undefined,
        combinedAbortedUnpublishedRecordCount: original ? this.#combinedAbortedRecords.size : 0,
        workerStartupOpeningAttemptConsumed: operation?.records["worker-startup-opening-intent.json"] !== undefined ||
          original && this.#purpose === "worker-startup" && this.#openingAttempted,
        workerStartupOpeningResultRetained: original && this.#startupOpeningResult !== null,
        workerStartupOpeningState: original && this.#startupOpening !== null ? this.#startupOpening.methods.status.call(this.#startupOpening.owner) : null,
        workerStartupOpeningNativeReply: original && this.#startupOpening !== null ?
          this.#startupOpening.methods.retainedOpeningResult.call(this.#startupOpening.owner) : null,
        workerStartupOpeningResult: operation?.records["worker-startup-opening-result.json"]?.result ?? null,
        workerStartupAssignmentsAttemptConsumed: operation?.records["worker-startup-assignments-intent.json"] !== undefined ||
          original && this.#startupAssignmentsAttempted,
        workerStartupAssignmentsResultRetained: original && this.#startupAssignments !== null,
        workerStartupAssignmentsResult: operation?.records["worker-startup-assignments-result.json"]?.result ?? null,
        workerStartupFootprintAttemptConsumed: operation?.records["worker-startup-footprint-intent.json"] !== undefined || original && this.#startupFootprintAttempted,
        workerStartupFootprintResultRetained: original && this.#startupFootprintPacket !== null,
        workerStartupFootprintObservation: original && this.#startupFootprintOpening !== null ?
          footprintStateMethods.retained.call(this.#startupFootprintOpening) : null,
        workerStartupFootprintResult: operation?.records["worker-startup-footprint-result.json"]?.result ?? null,
        workerStartupFootprintSourceAttemptConsumed: operation?.records["worker-startup-footprint-source-intent.json"] !== undefined || original && this.#startupFootprintSourceAttempted,
        workerStartupFootprintSourceResultRetained: original && this.#startupFootprintSourcePacket !== null,
        workerStartupFootprintSourceObservation: original && this.#startupFootprintOpening !== null ?
          footprintSourceMethods.retained.call(this.#startupFootprintOpening) : null,
        workerStartupFootprintSourceResult: operation?.records["worker-startup-footprint-source-result.json"]?.result ?? null,
        workerStartupFootprintPreparationAttemptConsumed: operation?.records["worker-startup-footprint-preparation-intent.json"] !== undefined || original && this.#startupFootprintPreparationAttempted,
        footprintUiAttemptConsumed: operation?.records["footprint-copy-ui-intent.json"] !== undefined || original && this.#footprintUiAttempted,
        footprintUiRetained: original && this.#footprintUiPacket !== null,
        footprintUiObservation: original && this.#retained?.methods.retainedFootprintCopyUi !== undefined ?
          this.#retained.methods.retainedFootprintCopyUi.call(this.#retained.owner) : null,
        footprintUiResult: operation?.records["footprint-copy-ui-result.json"]?.result ?? null,
        footprintDependenciesAttemptConsumed: operation?.records["footprint-copy-dependencies-intent.json"] !== undefined || original && this.#footprintDependenciesAttempted,
        footprintDependenciesRetained: original && this.#footprintDependencies !== null,
        footprintDependenciesObservation: original && this.#startupFootprintOpening !== null ?
          footprintDependencyMethods.retained.call(this.#startupFootprintOpening) : null,
        footprintDependenciesResult: operation?.records["footprint-copy-dependencies-result.json"]?.result ?? null,
        footprintManagerRouteAttemptConsumed: operation?.records["footprint-copy-manager-route-intent.json"] !== undefined || original && this.#footprintManagerRouteAttempted,
        footprintManagerRouteRetained: original && this.#footprintManagerRoute !== null,
        footprintRouteAttemptConsumed: operation?.records["footprint-copy-route-intent.json"] !== undefined || original && this.#footprintRouteAttempted,
        footprintRouteResult: operation?.records["footprint-copy-route-result.json"]?.result ?? null,
        footprintRouteFailure: operation?.records["footprint-copy-route-failure.json"] ?? null,
        footprintRouteRetained: original ? publicCurrentFootprintRouteSummary(this.#footprintRouteRetained) : null,
        footprintRouteRawObservation: original && routeStartup209(this.#generation) && this.#startupOpening !== null && this.#startupOpeningResult !== null ?
          publicCurrentFootprintRouteSummary(footprintRouteMethods.retained.call(requireCurrentFootprintCopyStartupOpening(this.#startupOpening.owner, this.#startupOpeningResult).opening)) : null,
        footprintManagerRouteObservation: original && this.#retained?.methods.retainedFootprintCopyManagerRoute !== undefined ?
          publicFootprintManagerRouteObservation(this.#retained.methods.retainedFootprintCopyManagerRoute.call(this.#retained.owner)) : null,
        footprintManagerRouteResult: operation?.records["footprint-copy-manager-route-result.json"]?.result ?? null,
        footprintBindingsAttemptConsumed: operation?.records["footprint-copy-bindings-intent.json"] !== undefined || original && this.#footprintBindingsAttempted,
        footprintBindingsRetained: original && this.#footprintBindings !== null,
        footprintBindingsResult: operation?.records["footprint-copy-bindings-result.json"]?.result ?? null,
        workerStartupFootprintPreparationRetained: original && this.#startupFootprintPreparation !== null,
        workerStartupFootprintPreparationResult: operation?.records["worker-startup-footprint-preparation-result.json"]?.result ?? null,
        workerStartupActorAttemptConsumed: operation?.records["worker-startup-actor-intent.json"] !== undefined || original && this.#startupActorAttempted,
        workerStartupActorResultRetained: original && this.#startupActorPacket !== null,
        workerStartupActorObservation: original && this.#startupOpening !== null ?
          this.#startupOpening.methods.retainedActorObservation.call(this.#startupOpening.owner) : null,
        workerStartupActorResult: publicStartupActorResult(request.operationId, actorRecord, actorPublished !== undefined),
        workerStartupChannelAttemptConsumed: operation?.records["worker-startup-channel-intent.json"] !== undefined || original && this.#startupChannelAttempted,
        workerStartupChannelResultRetained: original && this.#startupChannelPacket !== null,
        workerStartupChannelObservation: original && this.#startupOpening !== null ?
          this.#startupOpening.methods.retainedChannelObservation.call(this.#startupOpening.owner) : null,
        workerStartupChannelResult: publicStartupChannelResult(request.operationId, channelRecord, channelPublished !== undefined),
        workerStartupRatlineAttemptConsumed: operation?.records["worker-startup-ratline-intent.json"] !== undefined || original && this.#startupRatlineAttempted,
        workerStartupRatlineResultPublished: operation?.records["worker-startup-ratline-result.json"] !== undefined,
        workerStartupRatlineResultRetained: original && this.#startupRatlinePacket !== null,
        workerStartupRatlineFailed: original && this.#startupRatlineFailed,
        workerStartupRatlineCleanupFailed: original && this.#startupRatlineCleanupFailed,
        workerStartupRatlineState: original && this.#startupRatlineSession !== null ? ratlineSessionMethods.status.call(this.#startupRatlineSession) : null,
        workerStartupRatlineUnpublishedOriginEvidence: operation?.records["worker-startup-ratline-result.json"] === undefined && original &&
          this.#startupRatlineSession !== null ? ratlineSessionMethods.originEvidence.call(this.#startupRatlineSession) : null,
        workerStartupRatlineRejectedStopEvidence: original && this.#startupRatlineSession !== null ?
          ratlineSessionMethods.rejectedStopEvidence.call(this.#startupRatlineSession) : null,
        workerStartupRatlineAncestryEvidence: original && this.#startupRatlineSession !== null ?
          ratlineSessionMethods.ancestryEvidence.call(this.#startupRatlineSession) : null,
        workerStartupRatlineOpening: original && this.#startupRatlineSession !== null ? ratlineSessionMethods.opening.call(this.#startupRatlineSession) : null,
        workerStartupContinuationAttemptConsumed: operation?.records["worker-startup-continuation-intent.json"] !== undefined || original && this.#startupContinuationAttempted,
        workerStartupContinuationResultPublished: operation?.records["worker-startup-continuation-result.json"] !== undefined,
        workerStartupContinuationResultRetained: original && this.#startupContinuationPacket !== null,
        workerStartupContinuationFailed: original && this.#startupContinuationFailed,
        workerStartupContinuationCleanupFailed: original && this.#startupContinuationCleanupFailed,
        workerStartupContinuationState: original && this.#startupContinuationSession !== null ? continuationSessionMethods.status.call(this.#startupContinuationSession) : null,
        workerStartupContinuationUnpublishedOriginEvidence: operation?.records["worker-startup-continuation-result.json"] === undefined && original &&
          this.#startupContinuationSession !== null ? continuationSessionMethods.originEvidence.call(this.#startupContinuationSession) : null,
        workerStartupContinuationRejectedStopEvidence: original && this.#startupContinuationSession !== null ?
          continuationSessionMethods.rejectedStopEvidence.call(this.#startupContinuationSession) : null,
        workerStartupContinuationRejectedCaptureReplyEvidence: original && this.#startupContinuationSession !== null ?
          continuationSessionMethods.rejectedCaptureReplyEvidence.call(this.#startupContinuationSession) : null,
        workerStartupContinuationAncestryEvidence: original && this.#startupContinuationSession !== null ?
          continuationSessionMethods.ancestryEvidence.call(this.#startupContinuationSession) : null,
        workerStartupContinuationOpening: original && this.#startupContinuationSession !== null ? continuationSessionMethods.opening.call(this.#startupContinuationSession) : null,
        workerStartupRatlineResult: operation?.records["worker-startup-ratline-result.json"]?.result ?? null,
        workerStartupEmptyAttemptConsumed: operation?.records["worker-startup-empty-intent.json"] !== undefined || original && this.#startupEmptyAttempted,
        workerStartupEmptyResultPublished: operation?.records["worker-startup-empty-result.json"] !== undefined,
        workerStartupEmptyResultRetained: original && this.#startupEmptyPacket !== null,
        workerStartupEmptyFailed: original && this.#startupEmptyFailed,
        workerStartupEmptyPcbState: original && this.#startupEmptyPreparation !== null ? emptySessionMethods.pcbStatus.call(this.#startupEmptyPreparation.pcb) : null,
        workerStartupEmptyPcbObservation: original && this.#startupEmptyPreparation !== null ? emptySessionMethods.pcbObservation.call(this.#startupEmptyPreparation.pcb) : null,
        workerStartupEmptyPcbPacket: original ? this.#startupEmptyPcbPacket : null,
        workerStartupEmptyState: original && this.#startupEmptySession !== null ? emptySessionMethods.status.call(this.#startupEmptySession) : null,
        workerStartupEmptyResult: publicStartupEmptyResult(request.operationId, operation?.records["worker-startup-empty-result.json"]),
        projectOpeningAttemptConsumed: openingConsumed,
        projectOpeningResultRetained: original && this.#openingResult !== null,
        projectOpeningState: openingState,
        pcbOpeningAttemptConsumed: operation?.records["pcb-open-intent.json"] !== undefined || original && this.#pcbOpeningAttempted,
        pcbOpeningResultRetained: original && this.#pcbOpeningResult !== null,
        ...(pcbOpeningResult === undefined ? {} : { pcbOpeningResult }),
        ...(openingResult === undefined ? {} : { projectOpeningResult: openingResult }),
        ...(nativeOpeningReply === null ? {} : { nativeOpeningReply, hostTransitionAccepted: false }),
        ...(nativePcbOpeningReply === null ? {} : { nativePcbOpeningReply, pcbHostTransitionAccepted: false }),
        ...(nativePcbFrameObservation === null ? {} : { nativePcbFrameObservation, pcbSourceAdmissionAccepted: false }),
        diagnosticFailureObservation: native?.diagnosticFailureObservation ?? null,
        observationFailure: native?.observationFailure ?? failureRecord?.failure ?? null,
        lastTerminationObservation: native?.lastTerminationObservation ?? null,
        observationFailurePublished: operation?.records["observation-failure.json"] !== undefined,
        commonBaselineFailure: commonFailure === undefined ? null : currentPcbCommonBaselineFailureSummary(commonFailure.failure),
        commonBaselineFailurePublished: operation?.records["common-baseline-failure.json"] !== undefined,
        nativeSendError: native?.nativeSendError ?? null,
        mainNativeFailure: native?.mainNativeFailure ?? null,
        ...(native === null ? {} : { nativeLaunchError: native.nativeLaunchError, createProcessError: native.createProcessError }),
        ...(pendingIntent === null ? {} : { intentSha256: pendingIntent.intentSha256, publicationSettlementAvailable: this.#lease !== null,
          unlaunchedCleanupAvailable: !pendingIntent.launchInvoked && (!pendingIntent.allocationInvoked || this.#retained !== null) }),
        closeAttemptConsumed: operation?.records["close-intent.json"] !== undefined || original && this.#closeAttempted,
        releaseAttemptConsumed: operation?.records["release-intent.json"] !== undefined || original && this.#releaseAttempted };
    }
    this.#options.assertLocalAllowed();
    requireValue(!this.#busy && !this.#combinedAbortBusy, "BUSY"); this.#busy = true;
    try {
      if (request.action === "launch") {
        requireValue(this.#lease === null && !this.#launchAttempted, "LAUNCH_CONSUMED");
        this.#lease = acquireCurrentPcbDiagnosticLaunchExclusion();
        try { return await this.#launch(request); }
        finally {
          if (!this.#launchAttempted) { releaseCurrentPcbDiagnosticLaunchExclusion(this.#lease); this.#lease = null; }
        }
      }
      if (request.action === "settle-records") { return await this.#settleRecords(request.operationId, request.expectedIntentSha256); }
      if (request.action === "cleanup-unlaunched") { return await this.#cleanupUnlaunched(request.operationId, request.expectedIntentSha256); }
      if (request.action === "cleanup-no-process") { return await this.#cleanupNoProcess(request.operationId, request.expectedIntentSha256); }
      return await this.#cleanup(request);
    } finally { this.#busy = false; }
  }

  public hasActiveReservation(): boolean { return this.#lease !== null; }
  protected async runMainAction(request: Extract<CurrentFootprintMainValidationRequest,
    { action: "observe-main-construction" | "terminate-main" }>): Promise<Record<string, unknown>> {
    this.#options.assertLocalAllowed();
    requireValue((this.#generation === "209-startup-footprint-main" || this.#generation === "209-startup-footprint-combined") && !this.#busy && !this.#combinedAbortAttempted, "MAIN_PURPOSE_OR_BUSY");
    this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === request.operationId);
      this.#assertPurpose(request.operationId, operation);
      const binding = operation?.records["binding.json"], retained = this.#retained;
      requireValue(retained !== null && retained.operationId === request.operationId && operation !== undefined && binding !== undefined &&
        binding.intentSha256 === retained.intentSha256 && canonicalJson(binding.binding) === canonicalJson(retained.binding) &&
        sha256Json(binding) === request.expectedBindingSha256, "ORIGINAL_OWNER_REQUIRED");
      this.#assertNormalOwner(retained);
      requireValue(operation.records["terminated.json"] === undefined && operation.records["released.json"] === undefined, "MAIN_ALREADY_TERMINATED");
      await assertSnapshot(operations); this.#assertNormalOwner(retained);
      if (request.action === "terminate-main") {
        requireValue(this.#generation === "209-startup-footprint-main", "MAIN_TERMINATE_PURPOSE");
        requireValue(!this.#mainTerminateAttempted && operation.records["main-terminate-intent.json"] === undefined, "MAIN_TERMINATE_CONSUMED");
        const terminate = retained.methods.terminateFootprintMain; requireValue(terminate !== undefined, "MAIN_OWNER_REQUIRED");
        const intent: NonNullable<DiagnosticLifecycleRecords["main-terminate-intent.json"]> = {
          schema: "easyeda-pro-control.footprint-main-terminate-intent.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
          bindingSha256: request.expectedBindingSha256, confirmTerminateOriginalDiagnosticJob: true,
        };
        this.#mainTerminateAttempted = true; await this.#record(request.operationId, "main-terminate-intent.json", intent);
        const updated = { ...operation, records: { ...operation.records, "main-terminate-intent.json": intent } };
        const expected = operations.map(value => value.operationId === request.operationId ? updated : value);
        await assertSnapshot(expected); this.#assertNormalOwner(retained);
        await terminate.call(retained.owner, request.confirmTerminateOriginalDiagnosticJob); this.#assertNormalOwner(retained);
        await assertSnapshot(expected); this.#assertNormalOwner(retained);
        const result: NonNullable<DiagnosticLifecycleRecords["main-terminate-acknowledged.json"]> = {
          schema: "easyeda-pro-control.footprint-main-terminate-acknowledged.v1", operationId: request.operationId,
          createdAt: new Date().toISOString(), intentSha256: sha256Json(intent), terminationDispatched: true, terminationProved: false,
        };
        await this.#record(request.operationId, "main-terminate-acknowledged.json", result); this.#assertNormalOwner(retained);
        return { ...describe(request.operationId, { ...updated, records: { ...updated.records, "main-terminate-acknowledged.json": result } }),
          terminationDispatched: true, terminationProved: false };
      }
      requireValue(!this.#mainObservationAttempted && !this.#mainTerminateAttempted && binding.launchAcknowledged &&
        operation.records["main-construction-intent.json"] === undefined && operation.records["main-terminate-intent.json"] === undefined,
      "MAIN_CONSTRUCTION_CONSUMED");
      const observe = retained.methods.observeFootprintMainConstruction; requireValue(observe !== undefined, "MAIN_OWNER_REQUIRED");
      await this.#installation(retained); this.#assertNormalOwner(retained);
      const intent: NonNullable<DiagnosticLifecycleRecords["main-construction-intent.json"]> = {
        schema: "easyeda-pro-control.footprint-main-construction-intent.v1", operationId: request.operationId,
        createdAt: new Date().toISOString(), bindingSha256: request.expectedBindingSha256,
      };
      this.#mainObservationAttempted = true; await this.#record(request.operationId, "main-construction-intent.json", intent);
      const updated = { ...operation, records: { ...operation.records, "main-construction-intent.json": intent } };
      const expected = operations.map(value => value.operationId === request.operationId ? updated : value);
      await assertSnapshot(expected); this.#assertNormalOwner(retained);
      const observation = await observe.call(retained.owner); this.#assertNormalOwner(retained);
      const result = diagnosticLifecycleRecordSchemas["main-construction-result.json"].parse({
        schema: "easyeda-pro-control.footprint-main-construction-result.v1", operationId: request.operationId,
        createdAt: new Date().toISOString(), intentSha256: sha256Json(intent), result: observation,
      });
      this.#retainRecord("main-construction-result.json", result);
      await assertSnapshot(expected); this.#assertNormalOwner(retained);
      await this.#publish(request.operationId, "main-construction-result.json", result);
      const completed = { ...updated, records: { ...updated.records, "main-construction-result.json": result } };
      await assertSnapshot(operations.map(value => value.operationId === request.operationId ? completed : value)); this.#assertNormalOwner(retained);
      return { ...describe(request.operationId, completed), result: structuredClone(result.result), executionAuthorized: false, saveAuthorized: false };
    } finally { this.#busy = false; }
  }
  protected async runSavedCacheNative(request: Extract<CurrentFootprintCombinedValidationRequest,
    { action: "observe-saved-cache-native" }>): Promise<Record<string, unknown>> {
    this.#options.assertLocalAllowed();
    requireValue(this.#generation === "209-startup-footprint-combined" && !this.#busy && !this.#combinedAbortBusy &&
      !this.#combinedAbortAttempted, "SAVED_CACHE_NATIVE_PURPOSE_OR_BUSY");
    this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === request.operationId), retained = this.#retained;
      this.#assertPurpose(request.operationId, operation);
      const binding = operation?.records["binding.json"], browser = operation?.records["browser-result.json"],
        main = operation?.records["main-construction-result.json"], script = operation?.records["script-result.json"];
      requireValue(retained !== null && retained.operationId === request.operationId && operation !== undefined && binding !== undefined &&
        binding.launchAcknowledged && binding.intentSha256 === retained.intentSha256 && canonicalJson(binding.binding) === canonicalJson(retained.binding) &&
        sha256Json(binding) === request.expectedBindingSha256, "ORIGINAL_OWNER_REQUIRED");
      this.#assertNormalOwner(retained);
      requireValue(this.#mainObservationAttempted && main !== undefined && browser !== undefined && script !== undefined &&
        this.#pending.get("main-construction-result.json") === canonicalJson(main) &&
        this.#pending.get("browser-result.json") === canonicalJson(browser) && canonicalJson(this.#observations.get("browser")) === canonicalJson(browser.result) &&
        this.#pending.get("script-result.json") === canonicalJson(script) && canonicalJson(this.#observations.get("script")) === canonicalJson(script.result) &&
        operation.records["script-intent.json"]?.family === "ui" && script.result["sourceVerified"] === true && script.result["family"] === "ui",
      "SAVED_CACHE_NATIVE_PUBLICATION_REQUIRED");
      requireValue(!this.#savedCacheNativeAttempted && operation.records["saved-cache-native-intent.json"] === undefined &&
        operation.records["worker-startup-handoff-intent.json"] === undefined && operation.records["worker-startup-opening-intent.json"] === undefined &&
        operation.records["project-opening-intent.json"] === undefined && operation.records["close-intent.json"] === undefined &&
        operation.records["terminated.json"] === undefined && operation.records["release-intent.json"] === undefined &&
        !this.#closeAttempted && !this.#releaseAttempted, "SAVED_CACHE_NATIVE_CONSUMED_OR_OPENED");
      const observe = retained.methods.observeSavedCacheNative;
      requireValue(observe !== undefined && retained.owner.observeSavedCacheNative === observe, "SAVED_CACHE_NATIVE_ORIGINAL_METHOD");
      const same = (): void => {
        this.#assertNormalOwner(retained); requireValue(retained.owner.observeSavedCacheNative === observe, "SAVED_CACHE_NATIVE_ORIGINAL_METHOD");
      };
      await this.#installation(retained); same(); await assertSnapshot(operations); same();
      const intent: NonNullable<DiagnosticLifecycleRecords["saved-cache-native-intent.json"]> = {
        schema: "easyeda-pro-control.saved-cache-native-intent.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
        bindingSha256: request.expectedBindingSha256, mainResultSha256: sha256Json(main), browserResultSha256: sha256Json(browser), scriptResultSha256: sha256Json(script),
      };
      this.#savedCacheNativeAttempted = true; await this.#record(request.operationId, "saved-cache-native-intent.json", intent); same();
      const updated = { ...operation, records: { ...operation.records, "saved-cache-native-intent.json": intent } };
      const expected = operations.map(value => value.operationId === request.operationId ? updated : value);
      await assertSnapshot(expected); same();
      const observation = await observe.call(retained.owner);
      requireValue(canonicalJson(observation.engine) === canonicalJson(browser.result["version"]), "SAVED_CACHE_NATIVE_ENGINE_CHANGED");
      // Preserve the bounded complete packet before any post-await owner check.
      const result = diagnosticLifecycleRecordSchemas["saved-cache-native-result.json"].parse({
        schema: "easyeda-pro-control.saved-cache-native-result.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: observation,
      });
      this.#retainRecord("saved-cache-native-result.json", result); same(); await assertSnapshot(expected); same();
      await this.#publish(request.operationId, "saved-cache-native-result.json", result); same();
      const completed = { ...updated, records: { ...updated.records, "saved-cache-native-result.json": result } };
      await assertSnapshot(operations.map(value => value.operationId === request.operationId ? completed : value)); same();
      return { ...describe(request.operationId, completed), result: structuredClone(result.result), executionAuthorized: false, saveAuthorized: false };
    } finally { this.#busy = false; }
  }
  protected async runSavedCacheAccessor(request: Extract<CurrentFootprintCombinedValidationRequest,
    { action: "observe-saved-cache-accessor" }>): Promise<Record<string, unknown>> {
    this.#options.assertLocalAllowed();
    requireValue(this.#generation === "209-startup-footprint-combined" && !this.#busy && !this.#combinedAbortBusy &&
      !this.#combinedAbortAttempted, "SAVED_CACHE_ACCESSOR_PURPOSE_OR_BUSY");
    this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === request.operationId), retained = this.#retained;
      this.#assertPurpose(request.operationId, operation);
      const binding = operation?.records["binding.json"], browser = operation?.records["browser-result.json"],
        main = operation?.records["main-construction-result.json"], script = operation?.records["script-result.json"];
      requireValue(retained !== null && retained.operationId === request.operationId && operation !== undefined && binding !== undefined &&
        binding.launchAcknowledged && binding.intentSha256 === retained.intentSha256 && canonicalJson(binding.binding) === canonicalJson(retained.binding) &&
        sha256Json(binding) === request.expectedBindingSha256, "ORIGINAL_OWNER_REQUIRED");
      this.#assertNormalOwner(retained);
      requireValue(this.#mainObservationAttempted && main !== undefined && browser !== undefined && script !== undefined &&
        this.#pending.get("main-construction-result.json") === canonicalJson(main) &&
        this.#pending.get("browser-result.json") === canonicalJson(browser) && canonicalJson(this.#observations.get("browser")) === canonicalJson(browser.result) &&
        this.#pending.get("script-result.json") === canonicalJson(script) && canonicalJson(this.#observations.get("script")) === canonicalJson(script.result) &&
        operation.records["script-intent.json"]?.family === "ui" && script.result["sourceVerified"] === true && script.result["family"] === "ui",
      "SAVED_CACHE_ACCESSOR_PUBLICATION_REQUIRED");
      requireValue(!this.#savedCacheAccessorAttempted && operation.records["saved-cache-accessor-intent.json"] === undefined &&
        operation.records["worker-startup-handoff-intent.json"] === undefined && operation.records["worker-startup-opening-intent.json"] === undefined &&
        operation.records["project-opening-intent.json"] === undefined && operation.records["close-intent.json"] === undefined &&
        operation.records["terminated.json"] === undefined && operation.records["release-intent.json"] === undefined &&
        !this.#closeAttempted && !this.#releaseAttempted, "SAVED_CACHE_ACCESSOR_CONSUMED_OR_OPENED");
      const observe = retained.methods.observeSavedCacheAccessor;
      requireValue(observe !== undefined && retained.owner.observeSavedCacheAccessor === observe, "SAVED_CACHE_ACCESSOR_ORIGINAL_METHOD");
      const same = (): void => {
        this.#assertNormalOwner(retained); requireValue(retained.owner.observeSavedCacheAccessor === observe, "SAVED_CACHE_ACCESSOR_ORIGINAL_METHOD");
      };
      await this.#installation(retained); same(); await assertSnapshot(operations); same();
      const intent: NonNullable<DiagnosticLifecycleRecords["saved-cache-accessor-intent.json"]> = {
        schema: "easyeda-pro-control.saved-cache-accessor-intent.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
        bindingSha256: request.expectedBindingSha256, mainResultSha256: sha256Json(main), browserResultSha256: sha256Json(browser), scriptResultSha256: sha256Json(script),
      };
      this.#savedCacheAccessorAttempted = true; await this.#record(request.operationId, "saved-cache-accessor-intent.json", intent); same();
      const updated = { ...operation, records: { ...operation.records, "saved-cache-accessor-intent.json": intent } };
      const expected = operations.map(value => value.operationId === request.operationId ? updated : value);
      await assertSnapshot(expected); same();
      const observation = await observe.call(retained.owner);
      requireValue(canonicalJson(observation.engine) === canonicalJson(browser.result["version"]), "SAVED_CACHE_ACCESSOR_ENGINE_CHANGED");
      // Preserve the bounded complete packet before any post-await owner check.
      const result = diagnosticLifecycleRecordSchemas["saved-cache-accessor-result.json"].parse({
        schema: "easyeda-pro-control.saved-cache-accessor-result.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: observation,
      });
      this.#retainRecord("saved-cache-accessor-result.json", result); same(); await assertSnapshot(expected); same();
      await this.#publish(request.operationId, "saved-cache-accessor-result.json", result); same();
      const completed = { ...updated, records: { ...updated.records, "saved-cache-accessor-result.json": result } };
      await assertSnapshot(operations.map(value => value.operationId === request.operationId ? completed : value)); same();
      return { ...describe(request.operationId, completed), result: structuredClone(result.result), executionAuthorized: false, saveAuthorized: false };
    } finally { this.#busy = false; }
  }
  /** Monotonic across cleanup: allocationInvoked is set before the sole native
   * Factory call, including a throw, and the consumed attempt is never reset. */
  public hasAttemptedNativeOwnerAllocation(): boolean { return this.#attempt?.allocationInvoked === true; }

  /** Transfer the original live capability only after its intent is durable.
   * A failed transfer or publication remains consumed and retains cleanup.
   * The generic run path never returns this object or accepts a replacement. */
  protected async handoffStartup(operationId: string, expectedBindingSha256: string): Promise<CurrentPcbWorkerStartupHandoff> {
    this.#startupId(operationId);
    diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed();
    requireValue(this.#purpose === "worker-startup", "WORKER_STARTUP_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId);
      this.#assertPurpose(operationId, operation);
      const binding = operation?.records["binding.json"], retained = this.#retained;
      requireValue(retained !== null && retained.operationId === operationId && operation !== undefined && binding !== undefined &&
        binding.intentSha256 === retained.intentSha256 && canonicalJson(binding.binding) === canonicalJson(retained.binding) &&
        sha256Json(binding) === expectedBindingSha256, "ORIGINAL_OWNER_REQUIRED");
      this.#assertNormalOwner(retained);
      requireValue(!this.#startupHandoffAttempted && operation.records["worker-startup-handoff-intent.json"] === undefined,
        "WORKER_STARTUP_HANDOFF_CONSUMED");
      requireValue(binding.launchAcknowledged && retained.binding?.rootCreated !== "0" && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        !this.#openingAttempted && !this.#pcbOpeningAttempted && !this.#observationConsumed.has("workers") &&
        !this.#observationConsumed.has("model-state"), "WORKER_STARTUP_HANDOFF_UNAVAILABLE");
      const original = this.#observations.get("script"), script = operation.records["script-result.json"];
      requireValue(script !== undefined && original !== undefined && original["family"] === "ui" && original["sourceVerified"] === true &&
        operation.records["script-intent.json"]?.family === "ui" && canonicalJson(script.result) === canonicalJson(original) &&
        this.#pending.get("script-result.json") === canonicalJson(script), "ORIGINAL_UI_SOURCE_REQUIRED");
      const transfer = retained.methods.handoffWorkerStartup;
      requireValue(transfer !== undefined, "WORKER_STARTUP_PURPOSE_REQUIRED");
      await this.#installation(retained); await assertSnapshot(operations); this.#assertNormalOwner(retained);
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-handoff-intent.json"]> = {
        schema: "easyeda-pro-control.pcb-worker-startup-handoff-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, scriptResultSha256: sha256Json(script),
      };
      this.#startupHandoffAttempted = true;
      await this.#record(operationId, "worker-startup-handoff-intent.json", intent);
      const updated = { ...operation, records: { ...operation.records, "worker-startup-handoff-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); this.#assertNormalOwner(retained);
      const handoff = await transfer.call(retained.owner);
      // Keep the same channel even if final checks or publication fail. It is
      // Never reconstructed from a result record or handed to another owner.
      this.#startupHandoff = handoff;
      this.#assertNormalOwner(retained); await assertSnapshot(expected); this.#assertNormalOwner(retained);
      const result: NonNullable<DiagnosticLifecycleRecords["worker-startup-handoff-result.json"]> = {
        schema: "easyeda-pro-control.pcb-worker-startup-handoff-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), originalParentRetained: true, handoffIrreversible: true, executionAuthorized: false,
      };
      await this.#record(operationId, "worker-startup-handoff-result.json", result);
      const completed = { ...updated, records: { ...updated.records, "worker-startup-handoff-result.json": result } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); this.#assertNormalOwner(retained);
      return handoff;
    } finally { this.#busy = false; }
  }

  protected openStartup(operationId: string, expectedBindingSha256: string, input: unknown, generation: "206"): Promise<CurrentPcbWorkerStartupOpeningResult>;
  protected openStartup(operationId: string, expectedBindingSha256: string, input: unknown, generation: "209-startup" | "209-startup-footprint" | "209-startup-empty" | "209-startup-ratline" | "209-startup-ratline-continuation"): Promise<CurrentPcb209WorkerStartupOpeningResult>;
  protected openStartup(operationId: string, expectedBindingSha256: string, input: unknown, generation: "209-startup-footprint-route" | "209-startup-footprint-combined"): Promise<CurrentFootprintCopyStartupOpeningResult>;
  protected async openStartup(operationId: string, expectedBindingSha256: string, input: unknown, generation: "209-startup-footprint-route" | "209-startup-footprint-combined" | "206" | "209-startup" | "209-startup-footprint" | "209-startup-empty" | "209-startup-ratline" | "209-startup-ratline-continuation"): Promise<CurrentPcbStartupOpeningResult> {
    requireValue(this.#generation === generation, "GENERATION_MISMATCH");
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    const request = startupCaptureInputSchema.parse(input);
    this.#options.assertLocalAllowed(); requireValue(this.#purpose === "worker-startup", "WORKER_STARTUP_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId);
      this.#assertPurpose(operationId, operation);
      const binding = operation?.records["binding.json"], retained = this.#retained;
      requireValue(operation !== undefined && binding !== undefined && retained !== null && retained.operationId === operationId &&
        binding.intentSha256 === retained.intentSha256 && canonicalJson(binding.binding) === canonicalJson(retained.binding) &&
        sha256Json(binding) === expectedBindingSha256, "ORIGINAL_OWNER_REQUIRED");
      this.#assertNormalOwner(retained);
      const handedOff = operation.records["worker-startup-handoff-result.json"], handoff = this.#startupHandoff;
      requireValue(handedOff !== undefined && handoff !== null && this.#pending.get("worker-startup-handoff-result.json") === canonicalJson(handedOff),
        "ORIGINAL_STARTUP_HANDOFF_REQUIRED");
      requireValue(!this.#openingAttempted && operation.records["worker-startup-opening-intent.json"] === undefined, "WORKER_STARTUP_OPENING_CONSUMED");
      requireValue(binding.launchAcknowledged && retained.binding?.rootCreated !== "0" && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined, "WORKER_STARTUP_OPENING_UNAVAILABLE");
      // The checkpoint can persist evidence even before the native opener. Any
      // Attempt here is consumed, including a failed checkpoint or publication.
      this.#openingAttempted = true;
      await this.#installation(retained); await assertSnapshot(operations); this.#assertNormalOwner(retained);
      const target = Object.freeze(structuredClone(request.target));
      const prepared = await this.#prepareCheckpoint(target); this.#assertNormalOwner(retained);
      const preparedText = canonicalJson(prepared);
      requireValue(prepared.targetEvidence.projectUuid === target.projectUuid && prepared.targetEvidence.documentUuid === target.documentUuid &&
        prepared.targetEvidence.docType === "PCB" && prepared.targetEvidence.sourceSha256 === target.expectedSourceSha256, "PROJECT_CHECKPOINT_BINDING");
      const sealedTarget = Object.freeze(currentDisposableOpenSealedTargetSchema.parse({ ...target, branchUuid: prepared.targetEvidence.branchUuid }));
      const commonInventory = await this.#readCommonInventory(prepared, target); this.#assertNormalOwner(retained);
      const completion = readerCompletion(commonInventory);
      requireValue(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
        commonInventory.checkpointSha256 === prepared.checkpoint.checkpointSha256, "COMMON_ORIGINAL_SQL_REQUIRED");
      const preparation = Object.freeze({ sealedTarget, prepared, preparedText, originalTarget: target, commonInventory });
      this.#projectPreparation = preparation;
      const preparationCheckpoint = currentDisposableOpenPreparationCheckpointSchema.parse(prepared.preparationCheckpoint);
      await this.#verifyCheckpoint(prepared, target); this.#assertNormalOwner(retained);
      requireValue(canonicalJson(prepared) === preparedText && readerCompletion(commonInventory) === completion, "PROJECT_CHECKPOINT_CHANGED");
      await this.#installation(retained); await assertSnapshot(operations); this.#assertNormalOwner(retained);
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-opening-intent.json"]> = {
        schema: "easyeda-pro-control.pcb-worker-startup-opening-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, handoffResultSha256: sha256Json(handedOff), target: sealedTarget,
        preparationCheckpoint, checkpointReceiptSha256: sha256Json(prepared.checkpoint), beforeSqlSha256: commonInventory.logicalSha256,
        confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: request.acceptDebuggerPauseEffects,
      };
      await this.#record(operationId, "worker-startup-opening-intent.json", intent);
      const updated = { ...operation, records: { ...operation.records, "worker-startup-opening-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); this.#assertNormalOwner(retained);
      const owner = this.#createStartupOpening(handoff);
      const captured = Object.freeze({ assertOriginalMethodsCurrent: owner.assertOriginalMethodsCurrent, open: owner.open, status: owner.status, retainedOpeningResult: owner.retainedOpeningResult,
        requireOriginal: owner.requireOriginal, proveCurrentAssignments: owner.proveCurrentAssignments,
        requireCurrentAssignments: owner.requireCurrentAssignments, retainedActorObservation: owner.retainedActorObservation,
        observeActorClock: owner.observeActorClock, requireActorClock: owner.requireActorClock,
        retainedChannelObservation: owner.retainedChannelObservation, observeCurrentChannel: owner.observeCurrentChannel,
        requireCurrentChannel: owner.requireCurrentChannel, releaseAfterTermination: owner.releaseAfterTermination });
      this.#startupOpening = Object.freeze({ owner, methods: captured }); this.#assertNormalOwner(retained);
      let reverified = false, reverifyAttempted = false;
      const result = await captured.open.call(owner, sealedTarget, async () => {
        requireValue(!reverifyAttempted, "WORKER_STARTUP_REVERIFICATION_CONSUMED"); reverifyAttempted = true;
        await this.#installation(retained); await assertSnapshot(expected); this.#assertNormalOwner(retained);
        requireValue(this.#projectPreparation === preparation && canonicalJson(prepared) === preparedText &&
          readerCompletion(commonInventory) === completion && this.#startupHandoff === handoff, "PROJECT_CHECKPOINT_CHANGED");
        await this.#verifyCheckpoint(prepared, target); this.#assertNormalOwner(retained);
        requireValue(canonicalJson(prepared) === preparedText && readerCompletion(commonInventory) === completion, "PROJECT_CHECKPOINT_CHANGED");
        await this.#installation(retained); await assertSnapshot(expected); this.#assertNormalOwner(retained); reverified = true;
      });
      // Keep the original packet, not the serialized journal projection. Its
      // Constructor runner retains the live object identity needed by require.
      this.#startupOpeningResult = result;
      let expectedConstruction = startup209(this.#generation) ? "private.current-pcb209-worker-construction.v1" : "private.current-pcb-worker-construction.v1";
      if (routeStartup209(this.#generation)) { expectedConstruction = "private.current-footprint-copy-construction.v1"; }
      requireValue(result.construction.profile === expectedConstruction, "WORKER_STARTUP_CONSTRUCTION_GENERATION");
      requireValue(reverified, "WORKER_STARTUP_REVERIFICATION_REQUIRED");
      this.#assertNormalOwner(retained);
      await captured.requireOriginal.call(owner, result); this.#assertNormalOwner(retained);
      const record = diagnosticLifecycleRecordSchemas["worker-startup-opening-result.json"].parse({
        schema: "easyeda-pro-control.pcb-worker-startup-opening-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: structuredClone(result), executionAuthorized: false,
      });
      requireValue(record.result.opening.projectUuid === sealedTarget.projectUuid && record.result.opening.branchUuid === sealedTarget.branchUuid &&
        record.result.opening.documentUuid === sealedTarget.documentUuid && record.result.workerIdentity.projectUuid === sealedTarget.projectUuid &&
        record.result.workerIdentity.branchUuid === sealedTarget.branchUuid &&
        record.result.workerIdentity.windowTabId === record.result.opening.observation.windowTabId, "WORKER_STARTUP_OPENING_TARGET");
      this.#retainRecord("worker-startup-opening-result.json", record);
      await assertSnapshot(expected); this.#assertNormalOwner(retained);
      await this.#publish(operationId, "worker-startup-opening-result.json", record);
      const completed = { ...updated, records: { ...updated.records, "worker-startup-opening-result.json": record } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); this.#assertNormalOwner(retained);
      return result;
    } finally { this.#busy = false; }
  }

  /** Only the original successful packet can reach subsequent private
   * constructor observations. Historical JSON and failed publications cannot. */
  protected requireStartup(operationId: string, expectedBindingSha256: string, result: CurrentPcbWorkerStartupOpeningResult): Promise<CurrentPcbWorkerStartupTransport>;
  protected requireStartup(operationId: string, expectedBindingSha256: string, result: CurrentPcb209WorkerStartupOpeningResult): Promise<CurrentPcb209WorkerStartupTransport>;
  protected async requireStartup(operationId: string, expectedBindingSha256: string,
    result: CurrentPcbStartupOpeningResult): Promise<CurrentPcbStartupTransport> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed(); requireValue(this.#purpose === "worker-startup", "WORKER_STARTUP_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
      this.#assertPurpose(operationId, operation);
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId &&
        result === this.#startupOpeningResult && this.#startupOpening !== null && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 &&
        operation.records["worker-startup-opening-result.json"] !== undefined &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(operation.records["worker-startup-opening-result.json"]),
      "ORIGINAL_STARTUP_RESULT_REQUIRED");
      this.#assertOwner(retained);
      const original = this.#startupOpening;
      const transport = await original.methods.requireOriginal.call(original.owner, result);
      this.#assertOwner(retained); await assertSnapshot(operations); this.#assertOwner(retained); return transport;
    } finally { this.#busy = false; }
  }

  /** Private preparation for the separately admitted native purpose. The old
   * 256-request owner refuses before any PCB factory/native proof. Public input
   * supplies no owner, dependency, replacement target or SQL baseline. */
  protected async prepareStartupEmpty(operationId: string, expectedBindingSha256: string): Promise<CurrentPcb209StartupEmptyPreparation> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed(); requireValue(startup209(this.#generation) && !this.#busy, "STARTUP_EMPTY_UNAVAILABLE");
    requireValue(!this.#startupEmptyAttempted, "STARTUP_EMPTY_CONSUMED");
    this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles(), retained = this.#retained;
      const operation = operations.find(value => value.operationId === operationId);
      this.#assertPurpose(operationId, operation);
      const handoff = this.#startupHandoff, original = this.#startupOpening, preparation = this.#projectPreparation, result = this.#startupOpeningResult;
      const intent = operation?.records["worker-startup-opening-intent.json"], published = operation?.records["worker-startup-opening-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null && result !== null &&
        preparation !== null && handoff !== null && intent !== undefined && published !== undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 &&
        this.#pending.get("worker-startup-opening-intent.json") === canonicalJson(intent) &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(published) &&
        canonicalJson(published.result) === canonicalJson(result), "ORIGINAL_STARTUP_RESULT_REQUIRED");
      const issue = retained.methods.requireWorkerStartupEmptyDependency209, prepare = retained.methods.prepareWorkerStartupPcbSession209;
      requireValue(typeof issue === "function" && typeof prepare === "function", "STARTUP_EMPTY_OWNER_REQUIRED");
      const intentText = canonicalJson(intent), publishedText = canonicalJson(published);
      const current = (): void => {
        this.#assertOwner(retained);
        requireValue(this.#startupOpening === original && this.#startupOpeningResult === result && this.#projectPreparation === preparation &&
          this.#startupHandoff === handoff && !this.#startupOpeningReleased && !this.#closeAttempted && !this.#releaseAttempted &&
          retained.owner.requireWorkerStartupEmptyDependency209 === issue && retained.owner.prepareWorkerStartupPcbSession209 === prepare &&
          this.#pending.get("worker-startup-opening-intent.json") === intentText &&
          this.#pending.get("worker-startup-opening-result.json") === publishedText, "STARTUP_EMPTY_OWNER_CHANGED");
      };
      const assertOriginal = async (): Promise<void> => {
        current(); const emptyIntentText = this.#pending.get("worker-startup-empty-intent.json");
        const snapshot = await readCurrentPcbDiagnosticLifecycles(); current();
        const present = snapshot.find(value => value.operationId === operationId);
        const emptyIntent = present?.records["worker-startup-empty-intent.json"];
        requireValue(this.#pending.get("worker-startup-empty-intent.json") === emptyIntentText &&
          (emptyIntent === undefined ? emptyIntentText === undefined : canonicalJson(emptyIntent) === emptyIntentText), "STARTUP_EMPTY_INTENT_CHANGED");
        requireValue(present !== undefined && sha256Json(present.records["binding.json"]) === expectedBindingSha256 &&
          canonicalJson(present.records["worker-startup-opening-intent.json"]) === intentText &&
          canonicalJson(present.records["worker-startup-opening-result.json"]) === publishedText &&
          present.records["close-intent.json"] === undefined && present.records["terminated.json"] === undefined &&
          present.records["release-intent.json"] === undefined, "STARTUP_EMPTY_JOURNAL_CHANGED");
        await this.#installation(retained); current(); await assertSnapshot(snapshot); current();
      };
      current(); this.#startupEmptyAttempted = true;
      const dependency = await issue.call(retained.owner); current();
      requireValue(dependency === handoff.dependency, "STARTUP_EMPTY_ORIGINAL_DEPENDENCY_REQUIRED");
      await assertOriginal();
      const opened = requireCurrentPcb209StartupOpening(original.owner, result);
      const reverify = currentPcb209StartupCheckpointCallback(preparation, intent,
        Object.freeze({ assertOriginal, verifyHistorical: this.#verifyHistoricalCheckpoint }));
      const pcb = await prepare.call(retained.owner, opened.opening, opened.result, preparation.sealedTarget, reverify);
      current(); await assertOriginal();
      let emptyAttempted = false;
      const prepared = Object.freeze({ pcb, prepareEmpty: (packet: CurrentPcb209WorkerStartupPcbPacket): CurrentPcb209WorkerStartupEmptySession => {
        requireValue(!emptyAttempted, "STARTUP_EMPTY_BASELINE_CONSUMED"); emptyAttempted = true;
        current(); requireValue(this.#startupEmptyPreparation === prepared, "STARTUP_EMPTY_PREPARATION_CHANGED");
        return new CurrentPcb209WorkerStartupEmptySession({ pcb, packet, dependency });
      } });
      this.#startupEmptyPreparation = prepared;
      return prepared;
    } finally { this.#busy = false; }
  }

  /** The distinct launch purpose owns the larger fixed channel from creation.
   * The durable intent precedes PCB navigation; lost replies consume the whole
   * observation and keep the original sessions available only for inspection. */
  protected async observeStartupEmpty(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    requireValue(this.#generation === "209-startup-empty", "STARTUP_EMPTY_PURPOSE_REQUIRED");
    let preparation: CurrentPcb209StartupEmptyPreparation;
    try { preparation = await this.prepareStartupEmpty(operationId, expectedBindingSha256); }
    catch (error) { this.#startupEmptyFailed = true; throw error; }
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
      this.#assertPurpose(operationId, operation);
      const openingIntent = operation?.records["worker-startup-opening-intent.json"], openingResult = operation?.records["worker-startup-opening-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && openingIntent !== undefined && openingResult !== undefined &&
        this.#startupEmptyPreparation === preparation && operation.records["worker-startup-empty-intent.json"] === undefined &&
        this.#pending.get("worker-startup-opening-intent.json") === canonicalJson(openingIntent) &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(openingResult) &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        operation.records["release-intent.json"] === undefined && !this.#closeAttempted && !this.#releaseAttempted, "STARTUP_EMPTY_ORIGINAL_REQUIRED");
      this.#assertOwner(retained); await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-empty-intent.json"]> = {
        schema: "easyeda-pro-control.pcb209-worker-startup-empty-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, openingIntentSha256: sha256Json(openingIntent), openingResultSha256: sha256Json(openingResult),
        acceptNormalOpenEffects: true,
      };
      await this.#record(operationId, "worker-startup-empty-intent.json", intent);
      const updated = { ...operation, records: { ...operation.records, "worker-startup-empty-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); this.#assertOwner(retained);
      const pcb = await emptySessionMethods.openPcb.call(preparation.pcb); this.#startupEmptyPcbPacket = pcb; this.#assertOwner(retained);
      const session = preparation.prepareEmpty(pcb); this.#startupEmptySession = session; this.#assertOwner(retained);
      const packet = await emptySessionMethods.observe.call(session); this.#startupEmptyPacket = packet; this.#assertOwner(retained);
      emptySessionMethods.require.call(session, packet); await this.#installation(retained);
      await assertSnapshot(expected); this.#assertOwner(retained); emptySessionMethods.require.call(session, packet);
      const result = diagnosticLifecycleRecordSchemas["worker-startup-empty-result.json"].parse({
        schema: "easyeda-pro-control.pcb209-worker-startup-empty-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), pcb, result: packet, validationOnly: true, executionAuthorized: false, saveAuthorized: false,
      });
      this.#retainRecord("worker-startup-empty-result.json", result);
      await this.#publish(operationId, "worker-startup-empty-result.json", result);
      const completed = { ...updated, records: { ...updated.records, "worker-startup-empty-result.json": result } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); this.#assertOwner(retained);
      return publicStartupEmptyResult(operationId, result) ?? {};
    } catch (error) { this.#startupEmptyFailed = true; throw error; }
    finally { this.#busy = false; }
  }

  /** One held-import observation, retaining its actual launch, original reader
   * and source session. The durable intent precedes preparation and navigation. */
  protected async observeStartupRatline(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256); this.#options.assertLocalAllowed();
    requireValue(this.#generation === "209-startup-ratline" && !this.#busy, "STARTUP_RATLINE_PURPOSE");
    requireValue(!this.#startupRatlineAttempted, "STARTUP_RATLINE_CONSUMED"); this.#startupRatlineAttempted = true; this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles(), retained = this.#retained;
      const operation = operations.find(value => value.operationId === operationId); this.#assertPurpose(operationId, operation);
      const handoff = this.#startupHandoff, openedResult = this.#startupOpeningResult, original = this.#startupOpening, preparation = this.#projectPreparation;
      const openingIntent = operation?.records["worker-startup-opening-intent.json"], openingResult = operation?.records["worker-startup-opening-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null && openedResult !== null &&
        preparation !== null && handoff !== null && openingIntent !== undefined && openingResult !== undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 &&
        this.#pending.get("worker-startup-opening-intent.json") === canonicalJson(openingIntent) &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(openingResult) &&
        canonicalJson(openingResult.result) === canonicalJson(openedResult) && operation.records["worker-startup-ratline-intent.json"] === undefined,
      "ORIGINAL_STARTUP_RATLINE_REQUIRED");
      const prepare = retained.methods.prepareWorkerStartupRatlineSession209;
      requireValue(typeof prepare === "function", "STARTUP_RATLINE_OWNER_REQUIRED");
      const openingIntentText = canonicalJson(openingIntent), openingResultText = canonicalJson(openingResult);
      const current = (): void => {
        this.#assertOwner(retained);
        requireValue(this.#startupOpening === original && this.#startupOpeningResult === openedResult && this.#projectPreparation === preparation &&
          this.#startupHandoff === handoff && !this.#startupOpeningReleased && !this.#closeAttempted && !this.#releaseAttempted &&
          retained.owner.prepareWorkerStartupRatlineSession209 === prepare &&
          this.#pending.get("worker-startup-opening-intent.json") === openingIntentText &&
          this.#pending.get("worker-startup-opening-result.json") === openingResultText, "STARTUP_RATLINE_OWNER_CHANGED");
      };
      current(); await this.#installation(retained); current(); await assertSnapshot(operations); current();
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-ratline-intent.json"]> = {
        schema: "easyeda-pro-control.pcb209-worker-startup-ratline-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, openingIntentSha256: sha256Json(openingIntent), openingResultSha256: sha256Json(openingResult),
        acceptNormalOpenEffects: true, acceptDebuggerPause: true,
      };
      await this.#record(operationId, "worker-startup-ratline-intent.json", intent);
      const intentText = canonicalJson(intent), updated = { ...operation, records: { ...operation.records, "worker-startup-ratline-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      const assertOriginal = async (): Promise<void> => {
        current(); requireValue(this.#pending.get("worker-startup-ratline-intent.json") === intentText, "STARTUP_RATLINE_INTENT_CHANGED");
        await assertSnapshot(expected); current(); await this.#installation(retained); current();
        requireValue(this.#pending.get("worker-startup-ratline-intent.json") === intentText, "STARTUP_RATLINE_INTENT_CHANGED");
        await assertSnapshot(expected); current();
      };
      await assertOriginal();
      const opened = requireCurrentPcb209StartupOpening(original.owner, openedResult);
      const reverify = currentPcb209StartupCheckpointCallback(preparation, openingIntent,
        Object.freeze({ assertOriginal, verifyHistorical: this.#verifyHistoricalCheckpoint }));
      const session = prepare.call(retained.owner, opened.opening, opened.result, preparation.sealedTarget, reverify);
      this.#startupRatlineSession = session; await assertOriginal();
      const packet = await ratlineSessionMethods.capture.call(session); this.#startupRatlinePacket = packet; current();
      await ratlineSessionMethods.require.call(session, packet); await assertOriginal();
      const result = diagnosticLifecycleRecordSchemas["worker-startup-ratline-result.json"].parse({
        schema: "easyeda-pro-control.pcb209-worker-startup-ratline-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: packet, validationOnly: true, executionAuthorized: false, saveAuthorized: false,
      });
      this.#retainRecord("worker-startup-ratline-result.json", result); await this.#publish(operationId, "worker-startup-ratline-result.json", result);
      const completed = { ...updated, records: { ...updated.records, "worker-startup-ratline-result.json": result } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); current();
      await ratlineSessionMethods.require.call(session, packet); current();
      return { operationId, result: structuredClone(result.result), firstChildImportHeld: true, validationOnly: true,
        nativeWorkerTargetIdentityVerified: false, completeStartupVerified: false, completeLiveBaselineVerified: false,
        executionAuthorized: false, saveAuthorized: false };
    } catch (error) { this.#startupRatlineFailed = true; throw error; }
    finally { this.#busy = false; }
  }

  /** Fresh-purpose complete source-qualified diagnostic continuation only. */
  protected async observeStartupRatlineContinuation(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256); this.#options.assertLocalAllowed();
    requireValue(this.#generation === "209-startup-ratline-continuation" && !this.#busy, "STARTUP_RATLINE_PURPOSE");
    requireValue(!this.#startupContinuationAttempted, "STARTUP_RATLINE_CONSUMED"); this.#startupContinuationAttempted = true; this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles(), retained = this.#retained;
      const operation = operations.find(value => value.operationId === operationId); this.#assertPurpose(operationId, operation);
      const handoff = this.#startupHandoff, openedResult = this.#startupOpeningResult, original = this.#startupOpening, preparation = this.#projectPreparation;
      const openingIntent = operation?.records["worker-startup-opening-intent.json"], openingResult = operation?.records["worker-startup-opening-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null && openedResult !== null &&
        preparation !== null && handoff !== null && openingIntent !== undefined && openingResult !== undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 &&
        this.#pending.get("worker-startup-opening-intent.json") === canonicalJson(openingIntent) &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(openingResult) &&
        canonicalJson(openingResult.result) === canonicalJson(openedResult) && operation.records["worker-startup-continuation-intent.json"] === undefined,
      "ORIGINAL_STARTUP_RATLINE_REQUIRED");
      const prepare = retained.methods.prepareWorkerStartupRatlineContinuationSession209;
      requireValue(typeof prepare === "function", "STARTUP_RATLINE_OWNER_REQUIRED");
      const openingIntentText = canonicalJson(openingIntent), openingResultText = canonicalJson(openingResult);
      const current = (): void => {
        this.#assertOwner(retained);
        requireValue(this.#startupOpening === original && this.#startupOpeningResult === openedResult && this.#projectPreparation === preparation &&
          this.#startupHandoff === handoff && !this.#startupOpeningReleased && !this.#closeAttempted && !this.#releaseAttempted &&
          retained.owner.prepareWorkerStartupRatlineContinuationSession209 === prepare &&
          this.#pending.get("worker-startup-opening-intent.json") === openingIntentText &&
          this.#pending.get("worker-startup-opening-result.json") === openingResultText, "STARTUP_RATLINE_OWNER_CHANGED");
      };
      current(); await this.#installation(retained); current(); await assertSnapshot(operations); current();
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-continuation-intent.json"]> = {
        schema: "easyeda-pro-control.pcb209-worker-startup-continuation-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, openingIntentSha256: sha256Json(openingIntent), openingResultSha256: sha256Json(openingResult),
        acceptNormalOpenEffects: true, acceptDebuggerPause: true,
      };
      await this.#record(operationId, "worker-startup-continuation-intent.json", intent);
      const intentText = canonicalJson(intent), updated = { ...operation, records: { ...operation.records, "worker-startup-continuation-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      const assertOriginal = async (): Promise<void> => {
        current(); requireValue(this.#pending.get("worker-startup-continuation-intent.json") === intentText, "STARTUP_RATLINE_INTENT_CHANGED");
        await assertSnapshot(expected); current(); await this.#installation(retained); current();
        requireValue(this.#pending.get("worker-startup-continuation-intent.json") === intentText, "STARTUP_RATLINE_INTENT_CHANGED");
        await assertSnapshot(expected); current();
      };
      await assertOriginal();
      /* Consume and journal first. This original-checkpoint rejection grants no
       * empty runtime authority; the native continuation retains every guard. */
      await this.#verifyHistoricalCheckpoint(preparation.prepared, preparation.originalTarget); await assertOriginal();
      requireValue(canonicalJson(preparation.prepared) === preparation.preparedText, "STARTUP_RATLINE_CHECKPOINT_CHANGED");
      await rejectCurrentPcb209RatlineCheckpointPopulation(preparation.prepared); await assertOriginal();
      const opened = requireCurrentPcb209StartupOpening(original.owner, openedResult);
      const reverify = currentPcb209StartupCheckpointCallback(preparation, openingIntent,
        Object.freeze({ assertOriginal, verifyHistorical: this.#verifyHistoricalCheckpoint }));
      const session = prepare.call(retained.owner, opened.opening, opened.result, preparation.sealedTarget, reverify);
      this.#startupContinuationSession = session; await assertOriginal();
      const packet = await continuationSessionMethods.capture.call(session); this.#startupContinuationPacket = packet; current();
      await continuationSessionMethods.require.call(session, packet); await assertOriginal();
      const result = diagnosticLifecycleRecordSchemas["worker-startup-continuation-result.json"].parse({
        schema: "easyeda-pro-control.pcb209-worker-startup-continuation-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: packet, validationOnly: true, executionAuthorized: false, saveAuthorized: false,
      });
      this.#retainRecord("worker-startup-continuation-result.json", result); await this.#publish(operationId, "worker-startup-continuation-result.json", result);
      const completed = { ...updated, records: { ...updated.records, "worker-startup-continuation-result.json": result } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); current();
      await continuationSessionMethods.require.call(session, packet); current();
      return { operationId, result: structuredClone(result.result), allThreeOriginalSourcesQualified: true, validationOnly: true,
        nativeWorkerTargetIdentityVerified: false, completeStartupVerified: false, completeLiveBaselineVerified: false,
        executionAuthorized: false, saveAuthorized: false };
    } catch (error) { this.#startupContinuationFailed = true; throw error; }
    finally { this.#busy = false; }
  }

  /** One journaled continuation of the original capture. The public response
   * contains data only; its report cannot recreate the runner's lexical token. */
  protected async observeStartupAssignments(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed(); requireValue(this.#purpose === "worker-startup", "WORKER_STARTUP_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
      this.#assertPurpose(operationId, operation);
      const openingResult = this.#startupOpeningResult, original = this.#startupOpening;
      const openingRecord = operation?.records["worker-startup-opening-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null &&
        openingResult !== null && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 && openingRecord !== undefined &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(openingRecord), "ORIGINAL_STARTUP_RESULT_REQUIRED");
      this.#assertNormalOwner(retained);
      requireValue(!this.#startupAssignmentsAttempted && operation.records["worker-startup-assignments-intent.json"] === undefined,
        "WORKER_STARTUP_ASSIGNMENTS_CONSUMED");
      await this.#installation(retained); await assertSnapshot(operations); this.#assertNormalOwner(retained);
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-assignments-intent.json"]> = {
        schema: "easyeda-pro-control.pcb-worker-startup-assignments-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, openingResultSha256: sha256Json(openingRecord),
      };
      this.#startupAssignmentsAttempted = true;
      await this.#record(operationId, "worker-startup-assignments-intent.json", intent);
      const updated = { ...operation, records: { ...operation.records, "worker-startup-assignments-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); this.#assertNormalOwner(retained);
      const assignments = await original.methods.proveCurrentAssignments.call(original.owner, openingResult);
      // Retain partial success before later reproof/publication. A failed
      // Reproof leaves no accepted result plan for settlement to manufacture.
      this.#startupAssignments = assignments; this.#assertNormalOwner(retained);
      await original.methods.requireCurrentAssignments.call(original.owner, openingResult, assignments); this.#assertNormalOwner(retained);
      const record = diagnosticLifecycleRecordSchemas["worker-startup-assignments-result.json"].parse({
        schema: "easyeda-pro-control.pcb-worker-startup-assignments-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: structuredClone(assignments), pointInTimeObservation: true,
        executionAuthorized: false, saveAuthorized: false,
      });
      this.#retainRecord("worker-startup-assignments-result.json", record);
      await assertSnapshot(expected); this.#assertNormalOwner(retained);
      await this.#publish(operationId, "worker-startup-assignments-result.json", record);
      const completed = { ...updated, records: { ...updated.records, "worker-startup-assignments-result.json": record } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); this.#assertNormalOwner(retained);
      return { operationId, result: structuredClone(record.result), pointInTimeObservation: true,
        validationOnly: true, executionAuthorized: false, saveAuthorized: false };
    } finally { this.#busy = false; }
  }

  /** Future private compositions must reprove the current original assignments.
   * No public action accepts a report, token or replacement owner. */
  protected async requireStartupAssignments(operationId: string, expectedBindingSha256: string): Promise<CurrentPcbWorkerConstructionAssignments> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed(); requireValue(this.#purpose === "worker-startup", "WORKER_STARTUP_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
      this.#assertPurpose(operationId, operation);
      const assignments = this.#startupAssignments, openingResult = this.#startupOpeningResult, original = this.#startupOpening;
      const openingRecord = operation?.records["worker-startup-opening-result.json"], record = operation?.records["worker-startup-assignments-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null &&
        openingResult !== null && assignments !== null && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 && openingRecord !== undefined && record !== undefined &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(openingRecord) &&
        this.#pending.get("worker-startup-assignments-result.json") === canonicalJson(record), "ORIGINAL_STARTUP_ASSIGNMENTS_REQUIRED");
      this.#assertOwner(retained);
      await original.methods.requireCurrentAssignments.call(original.owner, openingResult, assignments); this.#assertOwner(retained);
      await assertSnapshot(operations); this.#assertOwner(retained); return assignments;
    } finally { this.#busy = false; }
  }

  /** One consumed route observation, with no source copy plan or writer dispatch. */
  protected async observeStartupFootprintRoute(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed();
    requireValue(routeStartup209(this.#generation) && !this.#busy, "FOOTPRINT_ROUTE_PURPOSE"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId);
      this.#assertPurpose(operationId, operation);
      const original = this.#startupOpening, result = this.#startupOpeningResult, retained = this.#retained;
      const actor = this.#startupActorPacket, assignments = this.#startupAssignments, checkpoint = this.#projectPreparation;
      const actorRecord = operation?.records["worker-startup-actor-result.json"], assignedRecord = operation?.records["worker-startup-assignments-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null && result !== null &&
        assignments !== null && actor?.profile === "private.current-pcb209-worker-startup-actor.v1" && checkpoint !== null && checkpoint.commonInventory !== null &&
        assignedRecord !== undefined && actorRecord !== undefined &&
        this.#pending.get("worker-startup-assignments-result.json") === canonicalJson(assignedRecord) && canonicalJson(assignedRecord.result) === canonicalJson(assignments) &&
        this.#pending.get("worker-startup-actor-result.json") === canonicalJson(actorRecord) && canonicalJson(actorRecord.result) === canonicalJson(actor) &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined,
      "ORIGINAL_FOOTPRINT_ROUTE_INPUT_REQUIRED");
      this.#assertNormalOwner(retained);
      requireValue(!this.#footprintRouteAttempted && operation.records["footprint-copy-route-intent.json"] === undefined, "FOOTPRINT_ROUTE_CONSUMED");
      this.#footprintRouteAttempted = true;
      const opened = requireCurrentFootprintCopyStartupOpening(original.owner, result);
      const observeUi = retained.methods.observeFootprintCopyUi, reproveUi = retained.methods.requireFootprintCopyUi;
      const joinPeer = retained.methods.joinFootprintCopyManagerPeer, observeManager = retained.methods.observeFootprintCopyManagerRoute;
      const windows = retained.methods.observeFootprintCopyWindowsClock;
      const clockRegistration = retained.methods.observeFootprintCopyClockRegistration, sampleClockRegistration = retained.methods.sampleFootprintCopyClockRegistration;
      requireValue(observeUi !== undefined && reproveUi !== undefined && observeManager !== undefined && joinPeer !== undefined && windows !== undefined && clockRegistration !== undefined && sampleClockRegistration !== undefined,
        "FOOTPRINT_ROUTE_OWNER_REQUIRED");
      const before = checkpoint.commonInventory, completion = readerCompletion(before);
      const current = (): void => {
        this.#assertNormalOwner(retained);
        requireValue(this.#startupOpening === original && this.#startupOpeningResult === result && this.#startupAssignments === assignments &&
          this.#startupActorPacket === actor && this.#projectPreparation === checkpoint && checkpoint.commonInventory === before &&
          readerCompletion(before) === completion && canonicalJson(checkpoint.prepared) === checkpoint.preparedText,
        "FOOTPRINT_ROUTE_INPUT_CHANGED");
        requireValue(opened.opening.observeFootprintCacheConstruction === footprintRouteMethods.cache && opened.opening.observeFootprintState === footprintRouteMethods.state && opened.opening.observeFootprintProducers === footprintRouteMethods.producers &&
          opened.opening.observeFootprintDependencies === footprintRouteMethods.dependencies && opened.opening.observeFootprintRegisteredAsync === footprintRouteMethods.callbacks &&
          opened.opening.observeFootprintDestinations === footprintRouteMethods.destinations && opened.opening.requireFootprintRouteObservations === footprintRouteMethods.reproof &&
          opened.opening.retainedFootprintRouteObservations === footprintRouteMethods.retained,
        "FOOTPRINT_ROUTE_METHODS_CHANGED");
      };
      const capacity = (): void => {
        current(); const channel = retained.methods.status.call(retained.owner).workerStartupChannel;
        // Conservative original reserves include unused source/plan work. The
        // Windows control sample has its own four-message native limit.
        const requests = CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.bindings + CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.dependencies +
          CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.uiObserve + CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.uiReprove +
          CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.managerRoute + CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE.requests.asyncAndHandoff +
          CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE.requests.destinations + 18 + CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE.requests.cacheConstructionDelegates +
          CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE.requests.clockRegistration;
        requireValue(channel !== undefined && channel !== null && channel.started && !channel.failed && !channel.released && channel.pendingReplies === 0 &&
          Number.isSafeInteger(channel.nextRequestId) && channel.nextRequestId >= 1 &&
          channel.nextRequestId + requests - 1 <= CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE.normalRequestLimit, "FOOTPRINT_ROUTE_CAPACITY");
      };
      await this.#installation(retained); current();
      await this.#verifyHistoricalCheckpoint(checkpoint.prepared, checkpoint.originalTarget); current();
      await assertSnapshot(operations); capacity();
      const intent: NonNullable<DiagnosticLifecycleRecords["footprint-copy-route-intent.json"]> = {
        schema: "easyeda-pro-control.footprint-copy-route-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, assignmentsResultSha256: sha256Json(assignedRecord), actorResultSha256: sha256Json(actorRecord),
      };
      await this.#record(operationId, "footprint-copy-route-intent.json", intent); current();
      const updated = { ...operation, records: { ...operation.records, "footprint-copy-route-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); capacity();
      const evidence: Record<string, unknown> = {};
      this.#footprintRouteRetained = evidence;
      let stage: NonNullable<DiagnosticLifecycleRecords["footprint-copy-route-failure.json"]>["failedStage"] = "cache-construction";
      let packet;
      try {
        const cacheConstruction = await footprintRouteMethods.cache.call(opened.opening, opened.result, assignments);
        evidence["cacheConstruction"] = cacheConstruction; current();
        stage = "state";
        const state = await footprintRouteMethods.state.call(opened.opening, opened.result, assignments); evidence["state"] = state; current();
        stage = "producers";
        const producers = await footprintRouteMethods.producers.call(opened.opening, opened.result, assignments, state); evidence["producers"] = producers; current();
        stage = "dependencies";
        const dependencies = await footprintRouteMethods.dependencies.call(opened.opening, opened.result, assignments, state, producers); evidence["dependencies"] = dependencies; current();
        stage = "callbacks";
        const callbacks = await footprintRouteMethods.callbacks.call(opened.opening, opened.result, assignments, state); evidence["callbacks"] = callbacks; current();
        stage = "destinations";
        const destinations = await footprintRouteMethods.destinations.call(opened.opening, opened.result, assignments, state, dependencies, callbacks); evidence["destinations"] = destinations; current();
        stage = "ui";
        const ui = await observeUi.call(retained.owner, opened.opening, opened.result); evidence["ui"] = ui; current();
        await reproveUi.call(retained.owner, ui); current();
        stage = "clock-registration";
        const registration = await clockRegistration.call(retained.owner, opened.opening, opened.result); evidence["clockRegistration"] = registration; current();
        stage = "manager";
        const manager = await observeManager.call(retained.owner, opened.opening, opened.result); evidence["manager"] = manager; current();
        stage = "peer";
        const peer = await joinPeer.call(retained.owner, opened.opening, opened.result, manager); evidence["peer"] = peer; current();
        stage = "reproof";
        await footprintRouteMethods.reproof.call(opened.opening, opened.result, assignments, state, producers, dependencies, callbacks, destinations); current();
        stage = "windows-clock";
        const windowsClock = await windows.call(retained.owner, "before"); evidence["windowsClock"] = windowsClock; current();
        stage = "clock-registration-sample";
        const finalRegistration = await sampleClockRegistration.call(retained.owner, registration); evidence["clockRegistrationFinalSample"] = finalRegistration; current();
        packet = currentFootprintCopyRouteObservationSchema.parse({ profile: "private.current-footprint-copy-route-preparation.v1", ...evidence,
          originalManagerWorkerPeerMatched: true, finalOriginalWorkerObservationsReproved: true, documentClocksArmed: false, createDispatched: false,
          callbacksCompleted: false, backendDynamicDispatchQualified: false, executionAuthorized: false, saveAuthorized: false, persistenceVerified: false });
      } catch (error) {
        const failure = diagnosticLifecycleRecordSchemas["footprint-copy-route-failure.json"].parse({
          schema: "easyeda-pro-control.footprint-copy-route-failure.v1", operationId, createdAt: new Date().toISOString(), intentSha256: sha256Json(intent),
          failedStage: stage, error: (error instanceof Error ? error.message : String(error)).slice(0, 4096), completedObservations: structuredClone(evidence),
          executionAuthorized: false, saveAuthorized: false });
        this.#retainRecord("footprint-copy-route-failure.json", failure);
        await assertSnapshot(expected); await this.#publish(operationId, "footprint-copy-route-failure.json", failure);
        throw error;
      }
      const published = diagnosticLifecycleRecordSchemas["footprint-copy-route-result.json"].parse({
        schema: "easyeda-pro-control.footprint-copy-route-result.v1", operationId, createdAt: new Date().toISOString(), intentSha256: sha256Json(intent),
        result: packet, executionAuthorized: false, saveAuthorized: false });
      this.#retainRecord("footprint-copy-route-result.json", published);
      await assertSnapshot(expected); current(); await this.#publish(operationId, "footprint-copy-route-result.json", published); current();
      const completed = { ...updated, records: { ...updated.records, "footprint-copy-route-result.json": published } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); current();
      return { operationId, result: structuredClone(published.result), routePublished: true, validationOnly: true,
        executionAuthorized: false, saveAuthorized: false, persistenceVerified: false };
    } finally { this.#busy = false; }
  }

  protected async observeStartupFootprint(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed(); requireValue((this.#generation === "209-startup" || this.#generation === "209-startup-footprint") && this.#purpose === "worker-startup", "WORKER_STARTUP_FOOTPRINT_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
      this.#assertPurpose(operationId, operation);
      const assignments = this.#startupAssignments, openingResult = this.#startupOpeningResult, original = this.#startupOpening;
      const openingRecord = operation?.records["worker-startup-opening-result.json"], record = operation?.records["worker-startup-assignments-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null &&
        openingResult !== null && assignments !== null && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 && openingRecord !== undefined && record !== undefined &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(openingRecord) &&
        this.#pending.get("worker-startup-assignments-result.json") === canonicalJson(record), "ORIGINAL_STARTUP_ASSIGNMENTS_REQUIRED");
      this.#assertOwner(retained);
      requireValue(!this.#startupFootprintAttempted && operation.records["worker-startup-footprint-intent.json"] === undefined, "WORKER_STARTUP_FOOTPRINT_CONSUMED");
      await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-footprint-intent.json"]> = {
        schema: "easyeda-pro-control.pcb209-footprint-state-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, assignmentsResultSha256: sha256Json(record),
      };
      this.#startupFootprintAttempted = true;
      await this.#record(operationId, "worker-startup-footprint-intent.json", intent);
      const updated = { ...operation, records: { ...operation.records, "worker-startup-footprint-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); this.#assertOwner(retained);
      const opened = requireCurrentPcb209StartupOpening(original.owner, openingResult);
      this.#startupFootprintOpening = opened.opening;
      const packet = await footprintStateMethods.observe.call(opened.opening, opened.result, assignments);
      this.#startupFootprintPacket = packet; this.#assertOwner(retained);
      await footprintStateMethods.require.call(opened.opening, opened.result, assignments, packet); this.#assertOwner(retained);
      const result = diagnosticLifecycleRecordSchemas["worker-startup-footprint-result.json"].parse({
        schema: "easyeda-pro-control.pcb209-footprint-state-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: structuredClone(packet), pointInTimeObservation: true,
        executionAuthorized: false, saveAuthorized: false,
      });
      requireValue(canonicalJson(result.result.identity) === canonicalJson(openingResult.workerIdentity), "WORKER_STARTUP_FOOTPRINT_IDENTITY");
      this.#retainRecord("worker-startup-footprint-result.json", result);
      await assertSnapshot(expected); this.#assertOwner(retained);
      await this.#publish(operationId, "worker-startup-footprint-result.json", result);
      const completed = { ...updated, records: { ...updated.records, "worker-startup-footprint-result.json": result } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); this.#assertOwner(retained);
      return { operationId, result: structuredClone(result.result), pointInTimeObservation: true,
        validationOnly: true, executionAuthorized: false, saveAuthorized: false };
    } finally { this.#busy = false; }
  }

  protected async observeStartupFootprintSource(operationId: string, expectedBindingSha256: string, input: unknown): Promise<Record<string, unknown>> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    const selected = currentPcb209WorkerStartupFootprintSourceInputSchema.parse(input);
    this.#options.assertLocalAllowed();
    requireValue((this.#generation === "209-startup" || this.#generation === "209-startup-footprint") && this.#purpose === "worker-startup", "WORKER_STARTUP_FOOTPRINT_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
      this.#assertPurpose(operationId, operation);
      const assignments = this.#startupAssignments, openingResult = this.#startupOpeningResult, original = this.#startupOpening;
      const preparation = this.#projectPreparation, state = this.#startupFootprintPacket;
      const stateRecord = operation?.records["worker-startup-footprint-result.json"];
      const openingRecord = operation?.records["worker-startup-opening-result.json"];
      const assignedRecord = operation?.records["worker-startup-assignments-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null &&
        openingResult !== null && assignments !== null && state !== null && preparation !== null && preparation.commonInventory !== null &&
        !this.#startupOpeningReleased && !this.#closeAttempted && operation.records["close-intent.json"] === undefined &&
        operation.records["terminated.json"] === undefined && sha256Json(operation.records["binding.json"]) === expectedBindingSha256 &&
        stateRecord !== undefined && openingRecord !== undefined && assignedRecord !== undefined &&
        this.#pending.get("worker-startup-footprint-result.json") === canonicalJson(stateRecord) &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(openingRecord) &&
        this.#pending.get("worker-startup-assignments-result.json") === canonicalJson(assignedRecord), "ORIGINAL_FOOTPRINT_STATE_REQUIRED");
      this.#assertOwner(retained);
      requireValue(!this.#startupFootprintSourceAttempted && operation.records["worker-startup-footprint-source-intent.json"] === undefined,
        "WORKER_STARTUP_FOOTPRINT_SOURCE_CONSUMED");
      this.#startupFootprintSourceAttempted = true;
      const before = preparation.commonInventory, completion = readerCompletion(before);
      const current = (): void => {
        this.#assertOwner(retained);
        requireValue(this.#projectPreparation === preparation && preparation.commonInventory === before &&
          readerCompletion(before) === completion && canonicalJson(preparation.prepared) === preparation.preparedText,
        "FOOTPRINT_SOURCE_CHECKPOINT_CHANGED");
      };
      await this.#installation(retained); current();
      await this.#verifyHistoricalCheckpoint(preparation.prepared, preparation.originalTarget); current();
      const plan = await prepareCurrentFootprintSourcePlan(before, {
        projectUuid: preparation.sealedTarget.projectUuid, branchUuid: preparation.sealedTarget.branchUuid,
        footprintUuid: selected.footprintUuid,
      }); current();
      requireValue(plan.maximumTicket === state.maximumTicket && plan.beforeSqlSha256 === before.logicalSha256 &&
        plan.beforeCheckpointSha256 === preparation.prepared.checkpoint.checkpointSha256, "FOOTPRINT_SOURCE_BASELINE_CHANGED");
      await assertSnapshot(operations); current();
      const capacity = (): void => {
        current();
        const channel = retained.methods.status.call(retained.owner).workerStartupChannel;
        requireValue(channel !== undefined && channel !== null && channel.started && !channel.failed && !channel.released &&
          channel.pendingReplies === 0 && Number.isSafeInteger(channel.nextRequestId) && channel.nextRequestId >= 1 &&
          channel.nextRequestId + CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS - 1 <= this.#footprintRequestLimit(),
        "FOOTPRINT_SOURCE_CAPACITY");
      };
      capacity();
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-footprint-source-intent.json"]> = {
        schema: "easyeda-pro-control.pcb209-footprint-source-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, stateResultSha256: sha256Json(stateRecord),
        beforeSqlSha256: before.logicalSha256, checkpointSha256: before.checkpointSha256,
        sourcePlanSha256: sha256Json(plan), comparison: "complete-checkpoint-records-native-order", ...selected,
      };
      await this.#record(operationId, "worker-startup-footprint-source-intent.json", intent); current();
      const updated = { ...operation, records: { ...operation.records, "worker-startup-footprint-source-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); current();
      capacity();
      const opened = requireCurrentPcb209StartupOpening(original.owner, openingResult);
      requireValue(opened.opening === this.#startupFootprintOpening, "ORIGINAL_FOOTPRINT_STATE_OWNER");
      this.#startupFootprintSourcePlan = plan;
      const packet = await footprintSourceMethods.observe.call(opened.opening, opened.result, assignments, state, plan);
      this.#startupFootprintSourcePacket = packet; current();
      await footprintSourceMethods.require.call(opened.opening, opened.result, assignments, state, plan, packet); current();
      const result = diagnosticLifecycleRecordSchemas["worker-startup-footprint-source-result.json"].parse({
        schema: "easyeda-pro-control.pcb209-footprint-source-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: structuredClone(packet), executionAuthorized: false, saveAuthorized: false,
      });
      this.#retainRecord("worker-startup-footprint-source-result.json", result);
      await assertSnapshot(expected); current();
      await this.#publish(operationId, "worker-startup-footprint-source-result.json", result); current();
      const completed = { ...updated, records: { ...updated.records, "worker-startup-footprint-source-result.json": result } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); current();
      return { operationId, result: structuredClone(result.result), validationOnly: true,
        executionAuthorized: false, saveAuthorized: false, persistenceVerified: false };
    } finally { this.#busy = false; }
  }

  /** Pure copy modeling belongs to the source's original observation lifecycle.
   * This action reserves only owner reproofs; it cannot upgrade launch purpose. */
  protected async prepareStartupFootprintCopy(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed();
    requireValue((this.#generation === "209-startup" || this.#generation === "209-startup-footprint") && this.#purpose === "worker-startup", "WORKER_STARTUP_FOOTPRINT_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
      this.#assertPurpose(operationId, operation);
      const assignments = this.#startupAssignments, openingResult = this.#startupOpeningResult, original = this.#startupOpening;
      const source = this.#startupFootprintSourcePacket, sourcePlan = this.#startupFootprintSourcePlan, state = this.#startupFootprintPacket;
      const checkpoint = this.#projectPreparation, record = operation?.records["worker-startup-footprint-source-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null &&
        openingResult !== null && assignments !== null && state !== null && source !== null && sourcePlan !== null &&
        checkpoint !== null && checkpoint.commonInventory !== null && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 && record !== undefined &&
        this.#pending.get("worker-startup-footprint-source-result.json") === canonicalJson(record) &&
        canonicalJson(record.result) === canonicalJson(source), "ORIGINAL_FOOTPRINT_SOURCE_REQUIRED");
      this.#assertOwner(retained);
      requireValue(!this.#startupFootprintPreparationAttempted && operation.records["worker-startup-footprint-preparation-intent.json"] === undefined,
        "WORKER_STARTUP_FOOTPRINT_PREPARATION_CONSUMED");
      this.#startupFootprintPreparationAttempted = true;
      const before = checkpoint.commonInventory, completion = readerCompletion(before);
      const current = (): void => {
        this.#assertOwner(retained);
        requireValue(this.#projectPreparation === checkpoint && checkpoint.commonInventory === before && readerCompletion(before) === completion &&
          canonicalJson(checkpoint.prepared) === checkpoint.preparedText && this.#startupFootprintSourcePacket === source &&
          this.#startupFootprintSourcePlan === sourcePlan, "FOOTPRINT_PREPARATION_INPUT_CHANGED");
      };
      const capacity = (): void => {
        current(); const channel = retained.methods.status.call(retained.owner).workerStartupChannel;
        requireValue(channel !== undefined && channel !== null && channel.started && !channel.failed && !channel.released &&
          channel.pendingReplies === 0 && Number.isSafeInteger(channel.nextRequestId) && channel.nextRequestId >= 1 &&
          channel.nextRequestId + CURRENT_FOOTPRINT_COPY_PREPARATION_REQUESTS - 1 <= this.#footprintRequestLimit(), "FOOTPRINT_PREPARATION_CAPACITY");
      };
      await this.#installation(retained); current();
      await this.#verifyHistoricalCheckpoint(checkpoint.prepared, checkpoint.originalTarget); current();
      await assertSnapshot(operations); capacity();
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-footprint-preparation-intent.json"]> = {
        schema: "easyeda-pro-control.pcb209-footprint-preparation-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, sourceResultSha256: sha256Json(record),
      };
      await this.#record(operationId, "worker-startup-footprint-preparation-intent.json", intent); current();
      const updated = { ...operation, records: { ...operation.records, "worker-startup-footprint-preparation-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); capacity();
      const opened = requireCurrentPcb209StartupOpening(original.owner, openingResult);
      requireValue(opened.opening === this.#startupFootprintOpening, "ORIGINAL_FOOTPRINT_STATE_OWNER");
      const prepared = await prepareCurrentFootprintCopyOwned(Object.freeze({ opening: opened.opening, result: opened.result,
        assignments, state, sourcePlan, source, before }));
      this.#startupFootprintPreparation = prepared; current();
      await requireCurrentFootprintCopyOwned(prepared, opened.opening); current();
      const result = diagnosticLifecycleRecordSchemas["worker-startup-footprint-preparation-result.json"].parse({
        schema: "easyeda-pro-control.pcb209-footprint-preparation-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: prepared, executionAuthorized: false, saveAuthorized: false,
      });
      this.#retainRecord("worker-startup-footprint-preparation-result.json", result);
      await assertSnapshot(expected); current();
      await this.#publish(operationId, "worker-startup-footprint-preparation-result.json", result); current();
      const completed = { ...updated, records: { ...updated.records, "worker-startup-footprint-preparation-result.json": result } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); current();
      return { operationId, result: structuredClone(result.result), preparationPublished: true,
        validationOnly: true, executionAuthorized: false, saveAuthorized: false, persistenceVerified: false };
    } finally { this.#busy = false; }
  }

  /** A copy-purpose launch reserves this complete read-only composition.
   * The old startup owner cannot acquire the extra request or state allowance. */
  protected async prepareStartupFootprintCopyBindings(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed();
    requireValue(this.#generation === "209-startup-footprint" && !this.#busy, "FOOTPRINT_BINDINGS_PURPOSE"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId);
      this.#assertPurpose(operationId, operation);
      const original = this.#startupOpening, result = this.#startupOpeningResult, retained = this.#retained;
      const actor = this.#startupActorPacket, assignments = this.#startupAssignments, state = this.#startupFootprintPacket;
      const checkpoint = this.#projectPreparation, preparation = this.#startupFootprintPreparation;
      const preparedRecord = operation?.records["worker-startup-footprint-preparation-result.json"];
      const actorRecord = operation?.records["worker-startup-actor-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null && result !== null &&
        assignments !== null && state !== null && actor?.profile === "private.current-pcb209-worker-startup-actor.v1" && preparation !== null &&
        checkpoint !== null && checkpoint.commonInventory !== null && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 && preparedRecord !== undefined && actorRecord !== undefined &&
        this.#pending.get("worker-startup-footprint-preparation-result.json") === canonicalJson(preparedRecord) &&
        this.#pending.get("worker-startup-actor-result.json") === canonicalJson(actorRecord) &&
        canonicalJson(preparedRecord.result) === canonicalJson(preparation) && canonicalJson(actorRecord.result) === canonicalJson(actor),
      "ORIGINAL_FOOTPRINT_BINDINGS_INPUT_REQUIRED");
      this.#assertOwner(retained);
      requireValue(!this.#footprintBindingsAttempted && operation.records["footprint-copy-bindings-intent.json"] === undefined,
        "FOOTPRINT_BINDINGS_CONSUMED"); this.#footprintBindingsAttempted = true;
      const before = checkpoint.commonInventory, completion = readerCompletion(before);
      const current = (): void => {
        this.#assertOwner(retained);
        requireValue(this.#projectPreparation === checkpoint && checkpoint.commonInventory === before && readerCompletion(before) === completion &&
          canonicalJson(checkpoint.prepared) === checkpoint.preparedText && this.#startupFootprintPreparation === preparation &&
          this.#startupFootprintPacket === state && this.#startupActorPacket === actor && this.#startupAssignments === assignments,
        "FOOTPRINT_BINDINGS_INPUT_CHANGED");
      };
      const capacity = (): void => {
        current(); const channel = retained.methods.status.call(retained.owner).workerStartupChannel;
        requireValue(channel !== undefined && channel !== null && channel.started && !channel.failed && !channel.released &&
          channel.pendingReplies === 0 && Number.isSafeInteger(channel.nextRequestId) && channel.nextRequestId >= 1 &&
          channel.nextRequestId + CURRENT_FOOTPRINT_COPY_BINDINGS_REQUESTS - 1 <= CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalRequestLimit,
        "FOOTPRINT_BINDINGS_CAPACITY");
      };
      await this.#installation(retained); current();
      await this.#verifyHistoricalCheckpoint(checkpoint.prepared, checkpoint.originalTarget); current();
      await assertSnapshot(operations); capacity();
      const intent: NonNullable<DiagnosticLifecycleRecords["footprint-copy-bindings-intent.json"]> = {
        schema: "easyeda-pro-control.footprint-copy-bindings-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, preparationResultSha256: sha256Json(preparedRecord), actorResultSha256: sha256Json(actorRecord),
      };
      await this.#record(operationId, "footprint-copy-bindings-intent.json", intent); current();
      const updated = { ...operation, records: { ...operation.records, "footprint-copy-bindings-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); capacity();
      const opened = requireCurrentPcb209StartupOpening(original.owner, result);
      requireValue(opened.opening === this.#startupFootprintOpening, "ORIGINAL_FOOTPRINT_STATE_OWNER");
      const bindings = await prepareCurrentFootprintCopyBindingsOwned(Object.freeze({ opening: opened.opening,
        result: opened.result, assignments, state, actor, preparation }));
      this.#footprintBindings = bindings; current();
      const published = diagnosticLifecycleRecordSchemas["footprint-copy-bindings-result.json"].parse({
        schema: "easyeda-pro-control.footprint-copy-bindings-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: bindings, executionAuthorized: false, saveAuthorized: false,
      });
      this.#retainRecord("footprint-copy-bindings-result.json", published);
      await assertSnapshot(expected); current();
      await this.#publish(operationId, "footprint-copy-bindings-result.json", published); current();
      const completed = { ...updated, records: { ...updated.records, "footprint-copy-bindings-result.json": published } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); current();
      return { operationId, result: structuredClone(published.result), bindingsPublished: true, validationOnly: true,
        executionAuthorized: false, saveAuthorized: false, persistenceVerified: false };
    } finally { this.#busy = false; }
  }

  /** Separately journaled UI observation. Matching UI source and project fields
   * do not prove the actual project-worker bus destination or a callable writer. */
  protected async observeStartupFootprintCopyUi(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed();
    requireValue(this.#generation === "209-startup-footprint" && !this.#busy, "FOOTPRINT_UI_PURPOSE"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId);
      this.#assertPurpose(operationId, operation);
      const original = this.#startupOpening, result = this.#startupOpeningResult, retained = this.#retained;
      const bindings = this.#footprintBindings, record = operation?.records["footprint-copy-bindings-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null && result !== null &&
        bindings !== null && record !== undefined && this.#pending.get("footprint-copy-bindings-result.json") === canonicalJson(record) &&
        canonicalJson(record.result) === canonicalJson(bindings) && sha256Json(operation.records["binding.json"]) === expectedBindingSha256 &&
        !this.#startupOpeningReleased && !this.#closeAttempted && operation.records["close-intent.json"] === undefined &&
        operation.records["terminated.json"] === undefined, "ORIGINAL_FOOTPRINT_UI_INPUT_REQUIRED");
      this.#assertOwner(retained);
      requireValue(!this.#footprintUiAttempted && operation.records["footprint-copy-ui-intent.json"] === undefined, "FOOTPRINT_UI_CONSUMED");
      this.#footprintUiAttempted = true;
      const observe = retained.methods.observeFootprintCopyUi, reprove = retained.methods.requireFootprintCopyUi;
      requireValue(observe !== undefined && reprove !== undefined, "FOOTPRINT_UI_OWNER_REQUIRED");
      const capacity = (): void => {
        this.#assertOwner(retained); const channel = retained.methods.status.call(retained.owner).workerStartupChannel;
        const requests = CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.uiObserve + CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.uiReprove;
        requireValue(channel !== undefined && channel !== null && channel.started && !channel.failed && !channel.released &&
          channel.pendingReplies === 0 && Number.isSafeInteger(channel.nextRequestId) && channel.nextRequestId >= 1 &&
          channel.nextRequestId + requests - 1 <= CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalRequestLimit, "FOOTPRINT_UI_CAPACITY");
      };
      await this.#installation(retained); this.#assertOwner(retained);
      await assertSnapshot(operations); capacity();
      const intent: NonNullable<DiagnosticLifecycleRecords["footprint-copy-ui-intent.json"]> = {
        schema: "easyeda-pro-control.footprint-copy-ui-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, bindingsResultSha256: sha256Json(record),
      };
      await this.#record(operationId, "footprint-copy-ui-intent.json", intent); this.#assertOwner(retained);
      const updated = { ...operation, records: { ...operation.records, "footprint-copy-ui-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); capacity();
      const opened = requireCurrentPcb209StartupOpening(original.owner, result);
      requireValue(opened.opening === this.#startupFootprintOpening, "ORIGINAL_FOOTPRINT_STATE_OWNER");
      const packet = await observe.call(retained.owner, opened.opening, opened.result);
      this.#footprintUiPacket = packet; this.#assertOwner(retained);
      await reprove.call(retained.owner, packet); this.#assertOwner(retained);
      const published = diagnosticLifecycleRecordSchemas["footprint-copy-ui-result.json"].parse({
        schema: "easyeda-pro-control.footprint-copy-ui-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: packet, originalUiReproofCompleted: true, executionAuthorized: false, saveAuthorized: false,
      });
      this.#retainRecord("footprint-copy-ui-result.json", published);
      await assertSnapshot(expected); this.#assertOwner(retained);
      await this.#publish(operationId, "footprint-copy-ui-result.json", published); this.#assertOwner(retained);
      const completed = { ...updated, records: { ...updated.records, "footprint-copy-ui-result.json": published } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); this.#assertOwner(retained);
      return { operationId, result: structuredClone(published.result), uiObservationPublished: true,
        validationOnly: true, executionAuthorized: false, saveAuthorized: false, persistenceVerified: false };
    } finally { this.#busy = false; }
  }

  /** Selected dependency descriptors are retained on the original worker. This
   * does not establish its parser subscribers, upload callbacks or bus peers. */
  protected async prepareStartupFootprintCopyDependencies(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed();
    requireValue(this.#generation === "209-startup-footprint" && !this.#busy, "FOOTPRINT_DEPENDENCIES_PURPOSE"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId);
      this.#assertPurpose(operationId, operation);
      const original = this.#startupOpening, result = this.#startupOpeningResult, retained = this.#retained;
      const bindings = this.#footprintBindings, ui = this.#footprintUiPacket;
      const assignments = this.#startupAssignments, state = this.#startupFootprintPacket;
      const bound = operation?.records["footprint-copy-bindings-result.json"], uiRecord = operation?.records["footprint-copy-ui-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null && result !== null &&
        bindings !== null && ui !== null && assignments !== null && state !== null && bound !== undefined && uiRecord !== undefined &&
        this.#pending.get("footprint-copy-bindings-result.json") === canonicalJson(bound) && canonicalJson(bound.result) === canonicalJson(bindings) &&
        this.#pending.get("footprint-copy-ui-result.json") === canonicalJson(uiRecord) && canonicalJson(uiRecord.result) === canonicalJson(ui) &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined,
      "ORIGINAL_FOOTPRINT_DEPENDENCIES_INPUT_REQUIRED");
      requireValue(!this.#footprintDependenciesAttempted && operation.records["footprint-copy-dependencies-intent.json"] === undefined,
        "FOOTPRINT_DEPENDENCIES_CONSUMED"); this.#footprintDependenciesAttempted = true;
      const current = (): void => {
        this.#assertOwner(retained);
        requireValue(this.#startupOpening === original && this.#startupOpeningResult === result && this.#footprintBindings === bindings &&
          this.#footprintUiPacket === ui && this.#startupAssignments === assignments && this.#startupFootprintPacket === state &&
          CurrentPcb209WorkerStartupOpening.prototype.observeFootprintDependencies === footprintDependencyMethods.observe &&
          CurrentPcb209WorkerStartupOpening.prototype.requireFootprintDependencies === footprintDependencyMethods.require &&
          CurrentPcb209WorkerStartupOpening.prototype.retainedFootprintDependencies === footprintDependencyMethods.retained,
        "FOOTPRINT_DEPENDENCIES_INPUT_CHANGED");
      };
      const capacity = (): void => {
        current(); const channel = retained.methods.status.call(retained.owner).workerStartupChannel;
        const requests = 4 + CURRENT_FOOTPRINT_COPY_DEPENDENCY_OWNER_REQUESTS.observeMaximum + CURRENT_FOOTPRINT_COPY_DEPENDENCY_OWNER_REQUESTS.requireMaximum;
        requireValue(channel !== undefined && channel !== null && channel.started && !channel.failed && !channel.released &&
          channel.pendingReplies === 0 && Number.isSafeInteger(channel.nextRequestId) && channel.nextRequestId >= 1 &&
          channel.nextRequestId + requests - 1 <= CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalRequestLimit, "FOOTPRINT_DEPENDENCIES_CAPACITY");
      };
      await this.#installation(retained); current();
      await assertSnapshot(operations); capacity();
      const intent: NonNullable<DiagnosticLifecycleRecords["footprint-copy-dependencies-intent.json"]> = {
        schema: "easyeda-pro-control.footprint-copy-dependencies-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, bindingsResultSha256: sha256Json(bound), uiResultSha256: sha256Json(uiRecord),
      };
      await this.#record(operationId, "footprint-copy-dependencies-intent.json", intent); current();
      const updated = { ...operation, records: { ...operation.records, "footprint-copy-dependencies-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); capacity();
      const opened = requireCurrentPcb209StartupOpening(original.owner, result);
      requireValue(opened.opening === this.#startupFootprintOpening, "ORIGINAL_FOOTPRINT_STATE_OWNER");
      const producers = retainedCurrentFootprintCopyBindingsProducers(bindings, opened.opening);
      const packet = await footprintDependencyMethods.observe.call(opened.opening, opened.result, assignments, state, producers);
      this.#footprintDependencies = packet; current();
      await footprintDependencyMethods.require.call(opened.opening, opened.result, assignments, state, producers, packet); current();
      const published = diagnosticLifecycleRecordSchemas["footprint-copy-dependencies-result.json"].parse({
        schema: "easyeda-pro-control.footprint-copy-dependencies-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: packet, originalDependencyReproofCompleted: true, executionAuthorized: false, saveAuthorized: false,
      });
      this.#retainRecord("footprint-copy-dependencies-result.json", published);
      await assertSnapshot(expected); current();
      await this.#publish(operationId, "footprint-copy-dependencies-result.json", published); current();
      const completed = { ...updated, records: { ...updated.records, "footprint-copy-dependencies-result.json": published } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); current();
      return { operationId, result: structuredClone(published.result), dependenciesPublished: true, validationOnly: true,
        executionAuthorized: false, saveAuthorized: false, persistenceVerified: false };
    } finally { this.#busy = false; }
  }

  /** Follow retained UI subscriptions into the original source-qualified manager.
   * A matching channel name and Worker object do not identify its remote peer. */
  protected async observeStartupFootprintCopyManagerRoute(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed();
    requireValue(this.#generation === "209-startup-footprint" && !this.#busy, "FOOTPRINT_MANAGER_ROUTE_PURPOSE"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId);
      this.#assertPurpose(operationId, operation);
      const original = this.#startupOpening, result = this.#startupOpeningResult, retained = this.#retained;
      const dependencies = this.#footprintDependencies, ui = this.#footprintUiPacket;
      const dependencyRecord = operation?.records["footprint-copy-dependencies-result.json"], uiRecord = operation?.records["footprint-copy-ui-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null && result !== null &&
        dependencies !== null && ui !== null && dependencyRecord !== undefined && uiRecord !== undefined &&
        this.#pending.get("footprint-copy-dependencies-result.json") === canonicalJson(dependencyRecord) && canonicalJson(dependencyRecord.result) === canonicalJson(dependencies) &&
        this.#pending.get("footprint-copy-ui-result.json") === canonicalJson(uiRecord) && canonicalJson(uiRecord.result) === canonicalJson(ui) &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined,
      "ORIGINAL_FOOTPRINT_MANAGER_ROUTE_INPUT_REQUIRED");
      this.#assertOwner(retained);
      requireValue(!this.#footprintManagerRouteAttempted && operation.records["footprint-copy-manager-route-intent.json"] === undefined,
        "FOOTPRINT_MANAGER_ROUTE_CONSUMED"); this.#footprintManagerRouteAttempted = true;
      const observe = retained.methods.observeFootprintCopyManagerRoute, reprove = retained.methods.requireFootprintCopyManagerRoute;
      requireValue(observe !== undefined && reprove !== undefined, "FOOTPRINT_MANAGER_ROUTE_OWNER_REQUIRED");
      const current = (): void => {
        this.#assertOwner(retained);
        requireValue(this.#startupOpening === original && this.#startupOpeningResult === result && this.#footprintUiPacket === ui &&
          this.#footprintDependencies === dependencies, "FOOTPRINT_MANAGER_ROUTE_INPUT_CHANGED");
      };
      const capacity = (): void => {
        current(); const channel = retained.methods.status.call(retained.owner).workerStartupChannel;
        const requests = CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.requests.managerRoute;
        requireValue(channel !== undefined && channel !== null && channel.started && !channel.failed && !channel.released &&
          channel.pendingReplies === 0 && Number.isSafeInteger(channel.nextRequestId) && channel.nextRequestId >= 1 &&
          channel.nextRequestId + requests - 1 <= CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalRequestLimit, "FOOTPRINT_MANAGER_ROUTE_CAPACITY");
      };
      await this.#installation(retained); current();
      await assertSnapshot(operations); capacity();
      const intent: NonNullable<DiagnosticLifecycleRecords["footprint-copy-manager-route-intent.json"]> = {
        schema: "easyeda-pro-control.footprint-copy-manager-route-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, dependenciesResultSha256: sha256Json(dependencyRecord), uiResultSha256: sha256Json(uiRecord),
      };
      await this.#record(operationId, "footprint-copy-manager-route-intent.json", intent); current();
      const updated = { ...operation, records: { ...operation.records, "footprint-copy-manager-route-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); capacity();
      const opened = requireCurrentPcb209StartupOpening(original.owner, result);
      requireValue(opened.opening === this.#startupFootprintOpening, "ORIGINAL_FOOTPRINT_STATE_OWNER");
      const packet = await observe.call(retained.owner, opened.opening, opened.result);
      this.#footprintManagerRoute = packet; current();
      await reprove.call(retained.owner, packet); current();
      const published = diagnosticLifecycleRecordSchemas["footprint-copy-manager-route-result.json"].parse({
        schema: "easyeda-pro-control.footprint-copy-manager-route-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: packet, originalManagerRouteReproofCompleted: true, executionAuthorized: false, saveAuthorized: false,
      });
      this.#retainRecord("footprint-copy-manager-route-result.json", published);
      await assertSnapshot(expected); current();
      await this.#publish(operationId, "footprint-copy-manager-route-result.json", published); current();
      const completed = { ...updated, records: { ...updated.records, "footprint-copy-manager-route-result.json": published } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); current();
      return { operationId, result: structuredClone(published.result), managerRoutePublished: true, validationOnly: true,
        executionAuthorized: false, saveAuthorized: false, persistenceVerified: false };
    } finally { this.#busy = false; }
  }

  protected async observeStartupActor(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed(); requireValue(this.#purpose === "worker-startup", "WORKER_STARTUP_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
      this.#assertPurpose(operationId, operation);
      const assignments = this.#startupAssignments, openingResult = this.#startupOpeningResult, original = this.#startupOpening;
      const openingRecord = operation?.records["worker-startup-opening-result.json"], record = operation?.records["worker-startup-assignments-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null &&
        openingResult !== null && assignments !== null && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 && openingRecord !== undefined && record !== undefined &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(openingRecord) &&
        this.#pending.get("worker-startup-assignments-result.json") === canonicalJson(record), "ORIGINAL_STARTUP_ASSIGNMENTS_REQUIRED");
      this.#assertNormalOwner(retained);
      requireValue(!this.#startupActorAttempted && operation.records["worker-startup-actor-intent.json"] === undefined, "WORKER_STARTUP_ACTOR_CONSUMED");
      await this.#installation(retained); await assertSnapshot(operations); this.#assertNormalOwner(retained);
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-actor-intent.json"]> = {
        schema: "easyeda-pro-control.pcb-worker-startup-actor-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, assignmentsResultSha256: sha256Json(record),
      };
      this.#startupActorAttempted = true;
      await this.#record(operationId, "worker-startup-actor-intent.json", intent);
      const updated = { ...operation, records: { ...operation.records, "worker-startup-actor-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); this.#assertNormalOwner(retained);
      const packet = await original.methods.observeActorClock.call(original.owner, openingResult, assignments);
      this.#startupActorPacket = packet; this.#assertNormalOwner(retained);
      requireValue((packet.profile === "private.current-pcb209-worker-startup-actor.v1") === startup209(this.#generation), "WORKER_STARTUP_ACTOR_GENERATION");
      await original.methods.requireActorClock.call(original.owner, openingResult, assignments, packet); this.#assertNormalOwner(retained);
      const result = diagnosticLifecycleRecordSchemas["worker-startup-actor-result.json"].parse({
        schema: "easyeda-pro-control.pcb-worker-startup-actor-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: structuredClone(packet), pointInTimeObservation: true,
        executionAuthorized: false, saveAuthorized: false,
      });
      const actorIdentity = result.result.profile === "private.current-pcb209-worker-startup-actor.v1" ? result.result.originalActorPacket.identity : result.result.identity;
      requireValue(canonicalJson(actorIdentity) === canonicalJson(openingResult.workerIdentity), "WORKER_STARTUP_ACTOR_IDENTITY");
      this.#retainRecord("worker-startup-actor-result.json", result);
      await assertSnapshot(expected); this.#assertNormalOwner(retained);
      await this.#publish(operationId, "worker-startup-actor-result.json", result);
      const completed = { ...updated, records: { ...updated.records, "worker-startup-actor-result.json": result } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); this.#assertNormalOwner(retained);
      return { operationId, result: structuredClone(result.result), pointInTimeObservation: true,
        validationOnly: true, executionAuthorized: false, saveAuthorized: false };
    } finally { this.#busy = false; }
  }

  protected async observeStartupChannel(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    requireValue(!routeStartup209(this.#generation), "FOOTPRINT_ROUTE_CHANNEL_UNAVAILABLE");
    this.#startupId(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    this.#options.assertLocalAllowed(); requireValue(this.#purpose === "worker-startup", "WORKER_STARTUP_PURPOSE_REQUIRED");
    requireValue(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
      this.#assertPurpose(operationId, operation);
      const assignments = this.#startupAssignments, openingResult = this.#startupOpeningResult, original = this.#startupOpening;
      const openingRecord = operation?.records["worker-startup-opening-result.json"], record = operation?.records["worker-startup-assignments-result.json"];
      requireValue(operation !== undefined && retained !== null && retained.operationId === operationId && original !== null &&
        openingResult !== null && assignments !== null && !this.#startupOpeningReleased && !this.#closeAttempted &&
        operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        sha256Json(operation.records["binding.json"]) === expectedBindingSha256 && openingRecord !== undefined && record !== undefined &&
        this.#pending.get("worker-startup-opening-result.json") === canonicalJson(openingRecord) &&
        this.#pending.get("worker-startup-assignments-result.json") === canonicalJson(record), "ORIGINAL_STARTUP_ASSIGNMENTS_REQUIRED");
      this.#assertOwner(retained);
      requireValue(!this.#startupChannelAttempted && operation.records["worker-startup-channel-intent.json"] === undefined, "WORKER_STARTUP_CHANNEL_CONSUMED");
      await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
      const intent: NonNullable<DiagnosticLifecycleRecords["worker-startup-channel-intent.json"]> = {
        schema: "easyeda-pro-control.pcb-worker-startup-channel-intent.v1", operationId, createdAt: new Date().toISOString(),
        bindingSha256: expectedBindingSha256, assignmentsResultSha256: sha256Json(record),
      };
      this.#startupChannelAttempted = true;
      await this.#record(operationId, "worker-startup-channel-intent.json", intent);
      const updated = { ...operation, records: { ...operation.records, "worker-startup-channel-intent.json": intent } };
      const expected = operations.map(value => value.operationId === operationId ? updated : value);
      await assertSnapshot(expected); this.#assertOwner(retained);
      const packet = await original.methods.observeCurrentChannel.call(original.owner, openingResult, assignments);
      this.#startupChannelPacket = packet; this.#assertOwner(retained);
      await original.methods.requireCurrentChannel.call(original.owner, openingResult, assignments, packet); this.#assertOwner(retained);
      const result = diagnosticLifecycleRecordSchemas["worker-startup-channel-result.json"].parse({
        schema: "easyeda-pro-control.pcb-worker-startup-channel-result.v1", operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), result: structuredClone(packet), pointInTimeObservation: true,
        executionAuthorized: false, saveAuthorized: false,
      });
      requireValue(canonicalJson(result.result.identity) === canonicalJson(openingResult.workerIdentity), "WORKER_STARTUP_CHANNEL_IDENTITY");
      this.#retainRecord("worker-startup-channel-result.json", result);
      await assertSnapshot(expected); this.#assertOwner(retained);
      await this.#publish(operationId, "worker-startup-channel-result.json", result);
      const completed = { ...updated, records: { ...updated.records, "worker-startup-channel-result.json": result } };
      await assertSnapshot(expected.map(value => value.operationId === operationId ? completed : value)); this.#assertOwner(retained);
      return { operationId, result: structuredClone(result.result), pointInTimeObservation: true,
        validationOnly: true, executionAuthorized: false, saveAuthorized: false };
    } finally { this.#busy = false; }
  }

  #footprintRequestLimit(): number {
    return this.#generation === "209-startup-footprint" ? CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE.normalRequestLimit : 224;
  }
  #startupId(operationId: string): void {
    if (this.#generation === "209-startup-footprint-combined") { currentFootprintCombinedIdSchema.parse(operationId); }
    else if (this.#generation === "209-startup-footprint-main") { currentFootprintMainIdSchema.parse(operationId); }
    else if (this.#generation === "209-startup-footprint-route") { currentFootprintCopyRoutePreparationIdSchema.parse(operationId); }
    else if (this.#generation === "209-startup-footprint") { currentFootprintCopyPreparationIdSchema.parse(operationId); }
    else if (this.#generation === "209-startup-ratline-continuation") { currentPcb209RatlineContinuationIdSchema.parse(operationId); }
    else if (this.#generation === "209-startup-ratline") { currentPcb209RatlineStartupIdSchema.parse(operationId); }
    else if (this.#generation === "209-startup-empty") { currentPcb209EmptyStartupIdSchema.parse(operationId); }
    else if (this.#generation === "209-startup") { currentPcb209WorkerStartupLifecycleIdSchema.parse(operationId); }
    else { currentPcbWorkerStartupLifecycleIdSchema.parse(operationId); }
  }
  #assertPurpose(operationId: string, operation?: DiagnosticLifecycleOperation): void {
    const intent = operation?.records["intent.json"];
    let idPurpose: CurrentPcbDiagnosticLifecyclePurpose = "diagnostic";
    const continuation209 = operationId.startsWith(CURRENT_PCB_209_RATLINE_CONTINUATION_OPERATION_PREFIX);
    const empty209 = operationId.startsWith(CURRENT_PCB_209_EMPTY_STARTUP_OPERATION_PREFIX), ratline209 = operationId.startsWith(CURRENT_PCB_209_RATLINE_STARTUP_OPERATION_PREFIX);
    const visual209 = operationId.startsWith("pcb209-visual-");
    const combined209 = operationId.startsWith(CURRENT_FOOTPRINT_COMBINED_OPERATION_PREFIX);
    const main209 = operationId.startsWith(CURRENT_FOOTPRINT_MAIN_OPERATION_PREFIX);
    const footprintRoute209 = operationId.startsWith(CURRENT_FOOTPRINT_COPY_ROUTE_PREPARATION_OPERATION_PREFIX);
    const footprint209 = operationId.startsWith(CURRENT_FOOTPRINT_COPY_PREPARATION_OPERATION_PREFIX);
    const project209 = operationId.startsWith(CURRENT_PCB_209_WORKER_STARTUP_OPERATION_PREFIX);
    if (operationId.startsWith(CURRENT_PCB_STRING_PRECREATE_OPERATION_PREFIX)) { idPurpose = "string-precreate"; }
    else if (operationId.startsWith(CURRENT_PCB_WORKER_STARTUP_OPERATION_PREFIX) || project209 || empty209 || ratline209 || continuation209 || footprint209 || footprintRoute209 || main209 || combined209) { idPurpose = "worker-startup"; }
    const expectedSchema = launchFields(this.#purpose, this.#generation).schema;
    requireValue(visual209 === (this.#generation === "209-visual") && combined209 === (this.#generation === "209-startup-footprint-combined") && main209 === (this.#generation === "209-startup-footprint-main") && footprintRoute209 === (this.#generation === "209-startup-footprint-route") && footprint209 === (this.#generation === "209-startup-footprint") && continuation209 === (this.#generation === "209-startup-ratline-continuation") && ratline209 === (this.#generation === "209-startup-ratline") && project209 === (this.#generation === "209-startup") && empty209 === (this.#generation === "209-startup-empty") &&
      (operationId.startsWith(CURRENT_PCB_209_OPENING_PROFILE.operationPrefix) && !project209 && !empty209 && !ratline209 && !continuation209) === (opening209(this.#generation)), "GENERATION_MISMATCH");
    requireValue(idPurpose === this.#purpose && (intent === undefined || intent.schema === expectedSchema || combined209 && intent.schema === "easyeda-pro-control.footprint-combined-launch-intent.v1"), "PURPOSE_MISMATCH");
  }
  protected async requireCombinedMainPublished(operationId: string, expectedBindingSha256: string): Promise<void> {
    this.assertCombinedNormal(); currentFootprintCombinedIdSchema.parse(operationId); diagnosticLifecycleDigestSchema.parse(expectedBindingSha256);
    const operations = await readCurrentPcbDiagnosticLifecycles(); this.assertCombinedNormal();
    const operation = operations.find(value => value.operationId === operationId), retained = this.#retained;
    this.#assertPurpose(operationId, operation);
    const binding = operation?.records["binding.json"], result = operation?.records["main-construction-result.json"];
    requireValue(retained !== null && retained.operationId === operationId && binding !== undefined &&
      sha256Json(binding) === expectedBindingSha256 && canonicalJson(binding.binding) === canonicalJson(retained.binding) &&
      binding.intentSha256 === retained.intentSha256, "ORIGINAL_OWNER_REQUIRED");
    this.#assertNormalOwner(retained);
    requireValue(this.#mainObservationAttempted && result !== undefined && this.#pending.get("main-construction-result.json") === canonicalJson(result), "COMBINED_MAIN_PUBLICATION_REQUIRED");
    await assertSnapshot(operations); this.#assertNormalOwner(retained);
  }
  protected async runCombinedAbort(request: Extract<CurrentFootprintCombinedValidationRequest, { action: "abort-generation" }>): Promise<Record<string, unknown>> {
    this.#options.assertLocalAllowed();
    requireValue(this.#generation === "209-startup-footprint-combined" && !this.#combinedAbortBusy && !this.#combinedAbortAttempted, "COMBINED_ABORT_CONSUMED");
    const retained = this.#retained;
    const bindingText = this.#pending.get("binding.json");
    requireValue(retained !== null && retained.operationId === request.operationId && bindingText !== undefined &&
      sha256Json(JSON.parse(bindingText) as unknown) === request.expectedBindingSha256 && !this.#releaseAttempted, "ORIGINAL_OWNER_REQUIRED");
    this.#assertOwner(retained);
    const dispatch = retained.methods.dispatchFootprintCombinedAbort; const reserve = retained.methods.reserveFootprintCombinedAbort;
    requireValue(reserve !== undefined && dispatch !== undefined, "COMBINED_OWNER_REQUIRED");
    // Consume synchronously, independently of normal #busy. A renderer wait
    // Must not queue a confirmed original-Job abort behind that same wait.
    this.#combinedAbortBusy = true; this.#combinedAbortAttempted = true;
    try {
      const reservation = reserve.call(retained.owner); this.#assertOwner(retained);
      await this.#publicationTail; this.#assertOwner(retained);
      const operations = await readCurrentPcbDiagnosticLifecycles(); this.#assertOwner(retained);
      const operation = operations.find(value => value.operationId === request.operationId);
      this.#assertPurpose(request.operationId, operation);
      const binding = operation?.records["binding.json"];
      requireValue(operation !== undefined && binding !== undefined && canonicalJson(binding) === bindingText &&
        operation.records["combined-abort-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
        operation.records["release-intent.json"] === undefined && operation.records["released.json"] === undefined, "COMBINED_ABORT_UNAVAILABLE");
      requireValue(Object.keys(operation.records).every(name => [...this.#pending].some(([known, text]) => known === name && canonicalJson(operation.records[known]) === text)), "JOURNAL_CHANGED");
      // Retain interrupted plans privately. They cannot become post-abort
      // Success records or obstruct the original generation's cleanup.
      for (const [name, text] of this.#pending) {
        if (operation.records[name] === undefined) { this.#combinedAbortedRecords.set(name, text); this.#pending.delete(name); }
      }
      const intent: NonNullable<DiagnosticLifecycleRecords["combined-abort-intent.json"]> = {
        schema: "easyeda-pro-control.footprint-combined-abort-intent.v1", operationId: request.operationId,
        createdAt: new Date().toISOString(), bindingSha256: request.expectedBindingSha256,
        previousRecordsSha256: sha256Json(operation.records), confirmAbortOriginalCombinedJob: true,
      };
      await assertSnapshot(operations); this.#assertOwner(retained);
      await this.#record(request.operationId, "combined-abort-intent.json", intent); this.#assertOwner(retained);
      const updated = { ...operation, records: { ...operation.records, "combined-abort-intent.json": intent } };
      const expected = operations.map(value => value.operationId === request.operationId ? updated : value);
      await assertSnapshot(expected); this.#assertOwner(retained);
      await dispatch.call(retained.owner, reservation, request.confirmAbortOriginalCombinedJob); this.#assertOwner(retained);
      await assertSnapshot(expected); this.#assertOwner(retained);
      const acknowledgment: NonNullable<DiagnosticLifecycleRecords["combined-abort-acknowledged.json"]> = {
        schema: "easyeda-pro-control.footprint-combined-abort-acknowledged.v1", operationId: request.operationId,
        createdAt: new Date().toISOString(), intentSha256: sha256Json(intent), abortDispatched: true, terminationProved: false,
      };
      await this.#record(request.operationId, "combined-abort-acknowledged.json", acknowledgment); this.#assertOwner(retained);
      return { ...describe(request.operationId, { ...updated, records: { ...updated.records, "combined-abort-acknowledged.json": acknowledgment } }),
        abortDispatched: true, terminationProved: false, executionAuthorized: false, saveAuthorized: false };
    } finally { this.#combinedAbortBusy = false; }
  }
  protected assertCombinedNormal(): void {
    this.#options.assertLocalAllowed();
    requireValue(this.#generation === "209-startup-footprint-combined" && !this.#combinedAbortAttempted, "COMBINED_GENERATION_ABORTED");
  }
  #assertNormalOwner(retained: Retained): void {
    requireValue(this.#generation !== "209-startup-footprint-combined" || !this.#combinedAbortAttempted, "COMBINED_GENERATION_ABORTED");
    requireValue(!this.#visualAbortAttempted, "VISUAL_GENERATION_ABORTED");
    this.#assertOwner(retained);
  }
  #assertPublicationAllowed(name: DiagnosticLifecycleRecordName): void {
    requireValue(!this.#visualAbortAttempted || ["visual-abort-intent.json", "visual-abort-acknowledged.json", "terminated.json", "release-intent.json", "released.json"].includes(name), "VISUAL_GENERATION_ABORTED");
    requireValue(!this.#combinedAbortAttempted || ["combined-abort-intent.json", "combined-abort-acknowledged.json", "terminated.json", "release-intent.json", "released.json"].includes(name), "COMBINED_GENERATION_ABORTED");
  }
  #assertOwner(retained: Retained): void {
    this.#options.assertLocalAllowed();
    requireValue(this.#lease !== null, "ORIGINAL_LEASE_REQUIRED"); assertCurrentPcbDiagnosticLaunchExclusion(this.#lease);
    requireValue(this.#retained === retained && methods.every(name => retained.owner[name] === retained.methods[name]), "OWNER_CHANGED");
    const status = retained.methods.status.call(retained.owner);
    const expectedProfile = this.#generation === "206" ? this.#purpose : { "209-startup-footprint-combined": "worker-startup-footprint-combined209", "209-startup-footprint-main": "worker-startup-footprint-main209", "209-startup-footprint-route": "worker-startup-footprint-copy209", "209-startup-footprint": "worker-startup-footprint209", "209-startup": "worker-startup209", "209-startup-empty": "worker-startup-empty209", "209-startup-ratline": "worker-startup-ratline209", "209-startup-ratline-continuation": "worker-startup-ratline-continuation209", "209-visual": "visual209", "209-opening": "diagnostic209" }[this.#generation];
    requireValue(status.profile === expectedProfile &&
      (this.#generation !== "209-visual" || typeof retained.methods.restoreWindowForCapture209 === "function" && retained.owner.restoreWindowForCapture209 === retained.methods.restoreWindowForCapture209 &&
        typeof retained.methods.resizeWindowForCapture209 === "function" && retained.owner.resizeWindowForCapture209 === retained.methods.resizeWindowForCapture209 &&
        typeof retained.methods.observeWindowCaptureReadiness209 === "function" && retained.owner.observeWindowCaptureReadiness209 === retained.methods.observeWindowCaptureReadiness209 &&
        typeof retained.methods.captureWindow209 === "function" && retained.owner.captureWindow209 === retained.methods.captureWindow209 &&
        typeof retained.methods.performVisual209 === "function" && retained.owner.performVisual209 === retained.methods.performVisual209 &&
        typeof retained.methods.terminateVisualJob === "function" && retained.owner.terminateVisualJob === retained.methods.terminateVisualJob &&
        typeof retained.methods.observeSelectionRelations209 === "function" && retained.owner.observeSelectionRelations209 === retained.methods.observeSelectionRelations209) &&
      (this.#generation !== "209-opening" || typeof retained.methods.observeLayers209 === "function" &&
        retained.owner.observeLayers209 === retained.methods.observeLayers209 &&
        typeof retained.methods.observePrimitives209 === "function" && retained.owner.observePrimitives209 === retained.methods.observePrimitives209 &&
        typeof retained.methods.observeExtendedPrimitives209 === "function" && retained.owner.observeExtendedPrimitives209 === retained.methods.observeExtendedPrimitives209 &&
        typeof retained.methods.observeSelectionRelations209 === "function" && retained.owner.observeSelectionRelations209 === retained.methods.observeSelectionRelations209 &&
        typeof retained.methods.observePadShapes209 === "function" && retained.owner.observePadShapes209 === retained.methods.observePadShapes209 &&
        typeof retained.methods.observeImageShapes209 === "function" && retained.owner.observeImageShapes209 === retained.methods.observeImageShapes209 &&
        typeof retained.methods.observeArcShapes209 === "function" && retained.owner.observeArcShapes209 === retained.methods.observeArcShapes209 &&
        typeof retained.methods.observePouredShapes209 === "function" && retained.owner.observePouredShapes209 === retained.methods.observePouredShapes209) &&
      (!this.#stringPurpose || typeof retained.methods.observeStringPrecreate === "function" &&
        retained.owner.observeStringPrecreate === retained.methods.observeStringPrecreate &&
        typeof retained.methods.observeCommonBaseline === "function" && retained.owner.observeCommonBaseline === retained.methods.observeCommonBaseline &&
        typeof retained.methods.retainedCommonBaselineFailure === "function" && retained.owner.retainedCommonBaselineFailure === retained.methods.retainedCommonBaselineFailure) &&
      (this.#purpose !== "worker-startup" || typeof retained.methods.handoffWorkerStartup === "function" &&
        retained.owner.handoffWorkerStartup === retained.methods.handoffWorkerStartup), "OWNER_PURPOSE_CHANGED");
    requireValue(!startup209(this.#generation) ||
      retained.owner.requireWorkerStartupEmptyDependency209 === retained.methods.requireWorkerStartupEmptyDependency209 &&
      retained.owner.prepareWorkerStartupPcbSession209 === retained.methods.prepareWorkerStartupPcbSession209, "STARTUP_EMPTY_METHODS_CHANGED");
    requireValue(retained.binding === null || canonicalJson(status.binding) === canonicalJson(retained.binding), "BINDING_CHANGED");
    requireValue(this.#startupOpening === null || startupOpeningMethods.every(name =>
      this.#startupOpening?.owner[name] === this.#startupOpening?.methods[name]), "STARTUP_OPENING_OWNER_CHANGED");
    this.#startupOpening?.methods.assertOriginalMethodsCurrent();
    if (this.#generation === "209-startup-footprint" || routeStartup209(this.#generation)) {
      requireValue(typeof retained.methods.observeFootprintCopyUi === "function" && typeof retained.methods.requireFootprintCopyUi === "function" &&
        typeof retained.methods.retainedFootprintCopyUi === "function" && retained.owner.observeFootprintCopyUi === retained.methods.observeFootprintCopyUi &&
        retained.owner.requireFootprintCopyUi === retained.methods.requireFootprintCopyUi &&
        retained.owner.retainedFootprintCopyUi === retained.methods.retainedFootprintCopyUi, "FOOTPRINT_UI_OWNER_CHANGED");
      requireValue(typeof retained.methods.observeFootprintCopyManagerRoute === "function" && typeof retained.methods.requireFootprintCopyManagerRoute === "function" &&
        typeof retained.methods.retainedFootprintCopyManagerRoute === "function" && retained.owner.observeFootprintCopyManagerRoute === retained.methods.observeFootprintCopyManagerRoute &&
        retained.owner.requireFootprintCopyManagerRoute === retained.methods.requireFootprintCopyManagerRoute &&
        retained.owner.retainedFootprintCopyManagerRoute === retained.methods.retainedFootprintCopyManagerRoute, "FOOTPRINT_MANAGER_ROUTE_OWNER_CHANGED");
    }
    if (this.#generation === "209-startup-footprint-combined") {
      for (const name of ["abortFootprintCombined", "reserveFootprintCombinedAbort", "dispatchFootprintCombinedAbort"] as const) {
        requireValue(typeof retained.methods[name] === "function" && retained.owner[name] === retained.methods[name], "COMBINED_OWNER_METHODS_CHANGED");
      }
    }
    if (this.#generation === "209-startup-footprint-main") {
      requireValue(typeof retained.methods.terminateFootprintMain === "function" && retained.owner.terminateFootprintMain === retained.methods.terminateFootprintMain, "MAIN_OWNER_METHODS_CHANGED");
    }
    if (this.#generation === "209-startup-footprint-main" || this.#generation === "209-startup-footprint-combined") {
      for (const name of ["observeFootprintMainConstruction", "retainedFootprintMainConstruction"] as const) {
        requireValue(typeof retained.methods[name] === "function" && retained.owner[name] === retained.methods[name], "MAIN_OWNER_METHODS_CHANGED");
      }
    }
    if (routeStartup209(this.#generation)) {
      requireValue(typeof retained.methods.observeFootprintCopyWindowsClock === "function" && retained.owner.observeFootprintCopyWindowsClock === retained.methods.observeFootprintCopyWindowsClock &&
        typeof retained.methods.joinFootprintCopyManagerPeer === "function" && retained.owner.joinFootprintCopyManagerPeer === retained.methods.joinFootprintCopyManagerPeer, "FOOTPRINT_ROUTE_OWNER_CHANGED");
      for (const name of ["observeFootprintCopyClockRegistration", "sampleFootprintCopyClockRegistration", "retainedFootprintCopyClockRegistration", "releaseFootprintCopyClockRegistration"] as const) {
        requireValue(typeof retained.methods[name] === "function" && retained.owner[name] === retained.methods[name], "FOOTPRINT_CLOCK_REGISTRATION_OWNER_CHANGED");
      }
    }
    if (this.#generation === "209-startup-ratline") {
      requireValue(typeof retained.methods.prepareWorkerStartupRatlineSession209 === "function" &&
        retained.owner.prepareWorkerStartupRatlineSession209 === retained.methods.prepareWorkerStartupRatlineSession209, "STARTUP_RATLINE_OWNER_CHANGED");
    }
    if (this.#startupRatlineSession !== null) {
      const session = this.#startupRatlineSession;
      requireValue(session.captureFirstChildHeld === ratlineSessionMethods.capture && session.requireOriginal === ratlineSessionMethods.require &&
        session.abort === ratlineSessionMethods.abort && session.releaseAfterTermination === ratlineSessionMethods.release &&
        session.status === ratlineSessionMethods.status && session.retainedOpeningObservation === ratlineSessionMethods.opening &&
        session.retainedNativeOriginEvidence === ratlineSessionMethods.originEvidence &&
        session.retainedRejectedStopEvidence === ratlineSessionMethods.rejectedStopEvidence &&
        session.retainedAncestryEvidence === ratlineSessionMethods.ancestryEvidence, "STARTUP_RATLINE_METHODS_CHANGED");
    }
    if (this.#generation === "209-startup-ratline-continuation") {
      requireValue(typeof retained.methods.prepareWorkerStartupRatlineContinuationSession209 === "function" &&
        retained.owner.prepareWorkerStartupRatlineContinuationSession209 === retained.methods.prepareWorkerStartupRatlineContinuationSession209, "STARTUP_RATLINE_OWNER_CHANGED");
    }
    if (this.#startupContinuationSession !== null) {
      const session = this.#startupContinuationSession;
      requireValue(session.captureContinuation === continuationSessionMethods.capture && session.requireOriginal === continuationSessionMethods.require &&
        session.abort === continuationSessionMethods.abort && session.releaseAfterTermination === continuationSessionMethods.release &&
        session.status === continuationSessionMethods.status && session.retainedOpeningObservation === continuationSessionMethods.opening &&
        session.retainedNativeOriginEvidence === continuationSessionMethods.originEvidence &&
        session.retainedRejectedStopEvidence === continuationSessionMethods.rejectedStopEvidence &&
        session.retainedRejectedCaptureReplyEvidence === continuationSessionMethods.rejectedCaptureReplyEvidence &&
        session.retainedAncestryEvidence === continuationSessionMethods.ancestryEvidence, "STARTUP_RATLINE_METHODS_CHANGED");
    }
    if (this.#startupEmptyPreparation !== null) {
      const pcb = this.#startupEmptyPreparation.pcb;
      requireValue(pcb.openAndQualify === emptySessionMethods.openPcb && pcb.status === emptySessionMethods.pcbStatus &&
        pcb.retainedOpeningObservation === emptySessionMethods.pcbObservation, "STARTUP_EMPTY_PCB_METHODS_CHANGED");
    }
    if (this.#startupEmptySession !== null) {
      const session = this.#startupEmptySession;
      requireValue(session.observeAndJoin === emptySessionMethods.observe && session.requireOriginal === emptySessionMethods.require &&
        session.status === emptySessionMethods.status, "STARTUP_EMPTY_SESSION_METHODS_CHANGED");
    }
  }
  async #installation(retained: Retained): Promise<void> {
    this.#assertOwner(retained);
    requireValue(canonicalJson(await this.#verify(this.#options)) === retained.installation, "INSTALLATION_CHANGED");
    this.#assertOwner(retained);
  }
  async #otherLaunches(): Promise<void> {
    await assertNoUnresolvedOrdinaryLaunches(); await this.#options.assertOtherLaunchesSettled();
  }
  async #launchAdmission(): Promise<void> {
    // Production supplies the same combined guard for both contracts. Run it
    // Once, after the mandatory ordinary inventory, at this boundary. Distinct
    // Guards still both run; no result is retained across another await/boundary.
    if (this.#options.assertAllowed !== this.#options.assertOtherLaunchesSettled) { await this.#options.assertAllowed(); }
    await this.#otherLaunches();
  }
  async #record<Key extends DiagnosticLifecycleRecordName>(operationId: string, name: Key,
    record: z.infer<(typeof diagnosticLifecycleRecordSchemas)[Key]>): Promise<void> {
    this.#assertPublicationAllowed(name);
    this.#retainRecord(name, record); await this.#publish(operationId, name, record);
  }
  #retainRecord<Key extends DiagnosticLifecycleRecordName>(name: Key, record: z.infer<(typeof diagnosticLifecycleRecordSchemas)[Key]>): void {
    this.#assertPublicationAllowed(name);
    const original = this.#pending.get(name), text = canonicalJson(record);
    requireValue(original === undefined || original === text, "PUBLICATION_PLAN_CHANGED");
    this.#pending.set(name, text);
  }
  #assertAttempt(operationId: string, intentSha256: string): Attempt {
    this.#options.assertLocalAllowed();
    const attempt = this.#attempt;
    requireValue(attempt !== null && attempt.operationId === operationId && attempt.intentSha256 === intentSha256 && this.#lease !== null, "ORIGINAL_ATTEMPT_REQUIRED");
    this.#assertPurpose(operationId);
    assertCurrentPcbDiagnosticLaunchExclusion(this.#lease);
    if (this.#retained !== null) { this.#assertOwner(this.#retained); }
    return attempt;
  }
  /** Re-publish only the original in-memory bytes when absent; an existing
   * complete record must match exactly. No helper/native operation is called. */
  async #settleRecords(operationId: string, intentSha256: string): Promise<Record<string, unknown>> {
    this.#assertAttempt(operationId, intentSha256);
    for (const [name, text] of this.#pending) {
      const operations = await readCurrentPcbDiagnosticLifecycles(); this.#assertAttempt(operationId, intentSha256);
      const operation = operations.find(value => value.operationId === operationId);
      requireValue(operation !== undefined, "RESERVATION_MISSING");
      requireValue(Object.keys(operation.records).every(key => [...this.#pending].some(([known, value]) =>
        known === key && canonicalJson(operation.records[known]) === value)), "JOURNAL_CHANGED");
      const existing = operation.records[name];
      if (existing === undefined) {
        const parsed = diagnosticLifecycleRecordSchemas[name].parse(JSON.parse(text) as unknown);
        await this.#publish(operationId, name, parsed); this.#assertAttempt(operationId, intentSha256);
      } else { requireValue(canonicalJson(existing) === text, "JOURNAL_CHANGED"); }
    }
    const operations = await readCurrentPcbDiagnosticLifecycles(); this.#assertAttempt(operationId, intentSha256);
    const operation = operations.find(value => value.operationId === operationId);
    requireValue(operation !== undefined, "RESERVATION_MISSING");
    requireValue(Object.keys(operation.records).length === this.#pending.size && [...this.#pending].every(([name, text]) =>
      canonicalJson(operation.records[name]) === text), "JOURNAL_CHANGED");
    if (operation.records["released.json"] !== undefined || operation.records["not-dispatched.json"] !== undefined ||
        operation.records["no-process-released.json"] !== undefined || operation.records["combined-factory-before-launch.json"] !== undefined) {
      this.#releaseLease();
    }
    return describe(operationId, operation);
  }
  #releaseLease(): void {
    requireValue(this.#lease !== null, "ORIGINAL_LEASE_REQUIRED");
    releaseCurrentPcbDiagnosticLaunchExclusion(this.#lease); this.#lease = null;
  }
  async #cleanupUnlaunched(operationId: string, intentSha256: string): Promise<Record<string, unknown>> {
    const attempt = this.#assertAttempt(operationId, intentSha256);
    if (this.#combinedFactoryError !== null && !attempt.launchInvoked && this.#retained === null) {
      const operations = await readCurrentPcbDiagnosticLifecycles(); this.#assertAttempt(operationId, intentSha256);
      const operation = operations.find(candidate => candidate.operationId === operationId);
      if (await this.#completeCombinedFactoryFailure(operation, operations)) {
        const completed = await readCurrentPcbDiagnosticLifecycles(); return describe(operationId, completed.find(candidate => candidate.operationId === operationId));
      }
    }
    requireValue(!attempt.launchInvoked && (!attempt.allocationInvoked || this.#retained !== null || this.#combinedFactoryFailure !== null), "NONDISPATCH_NOT_PROVED");
    const settled = await this.#settleRecords(operationId, intentSha256);
    if (settled["state"] === "not-dispatched" || settled["state"] === "factory-before-launch-failed") { return settled; }
    this.#assertAttempt(operationId, intentSha256);
    const retained = this.#retained;
    if (retained !== null) {
      const status = retained.methods.status.call(retained.owner);
      requireValue(!status.launchConsumed && status.binding === null && !status.released, "NONDISPATCH_NOT_PROVED");
    }
    const existing = this.#pending.get("unlaunched-release-intent.json");
    const intent: NonNullable<DiagnosticLifecycleRecords["unlaunched-release-intent.json"]> = existing === undefined ? {
      schema: "easyeda-pro-control.pcb-diagnostic-unlaunched-release-intent.v1", operationId, createdAt: new Date().toISOString(),
      intentSha256, nativeLaunchInvoked: false, helperAllocated: retained !== null,
    } : diagnosticLifecycleRecordSchemas["unlaunched-release-intent.json"].parse(JSON.parse(existing) as unknown);
    if (existing === undefined) { await this.#record(operationId, "unlaunched-release-intent.json", intent); }
    this.#assertAttempt(operationId, intentSha256); requireValue(!this.#unlaunchedInvoked, "UNLAUNCHED_RELEASE_CONSUMED");
    if (retained !== null) {
      this.#unlaunchedInvoked = true; await retained.methods.releaseUnlaunched.call(retained.owner); this.#assertOwner(retained);
      const status = retained.methods.status.call(retained.owner);
      requireValue(status.released && status.helperClosed && status.failure === null && !status.launchConsumed && status.binding === null, "UNLAUNCHED_RELEASE_UNCONFIRMED");
    }
    const record: NonNullable<DiagnosticLifecycleRecords["not-dispatched.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-not-dispatched.v1", operationId, createdAt: new Date().toISOString(),
      unlaunchedReleaseIntentSha256: sha256Json(intent), nativeLaunchInvoked: false, helperReleased: retained !== null,
    };
    await this.#record(operationId, "not-dispatched.json", record); this.#releaseLease();
    const operations = await readCurrentPcbDiagnosticLifecycles();
    return describe(operationId, operations.find(value => value.operationId === operationId));
  }
  async #cleanupNoProcess(operationId: string, intentSha256: string): Promise<Record<string, unknown>> {
    const attempt = this.#assertAttempt(operationId, intentSha256), retained = this.#retained;
    requireValue(attempt.launchInvoked && retained !== null && retained.binding === null, "ORIGINAL_ROOTLESS_OWNER_REQUIRED");
    const settled = await this.#settleRecords(operationId, intentSha256);
    if (settled["state"] === "no-process-released") { return settled; }
    this.#assertAttempt(operationId, intentSha256); requireValue(!this.#noProcessInvoked, "NO_PROCESS_RELEASE_CONSUMED");
    const healthy = (): void => {
      this.#assertOwner(retained);
      const status = retained.methods.status.call(retained.owner);
      requireValue(status.noProcessCleanupAvailable && status.failure === null && status.binding === null &&
        !status.busy && !status.released && !status.helperClosed, "NO_PROCESS_RELEASE_UNAVAILABLE");
    };
    healthy();
    const original = this.#pending.get("no-process-release-intent.json");
    const intent: NonNullable<DiagnosticLifecycleRecords["no-process-release-intent.json"]> = original === undefined ? {
      schema: "easyeda-pro-control.pcb-diagnostic-no-process-release-intent.v1", operationId, createdAt: new Date().toISOString(),
      intentSha256, originalLaunchMethodInvoked: true,
    } : diagnosticLifecycleRecordSchemas["no-process-release-intent.json"].parse(JSON.parse(original) as unknown);
    if (original === undefined) { await this.#record(operationId, "no-process-release-intent.json", intent); }
    const operations = await readCurrentPcbDiagnosticLifecycles(); healthy();
    const operation = operations.find(value => value.operationId === operationId);
    requireValue(operation !== undefined && Object.keys(operation.records).length === this.#pending.size &&
      [...this.#pending].every(([name, text]) => canonicalJson(operation.records[name]) === text), "PUBLICATION_UNSETTLED");
    this.#noProcessInvoked = true;
    const proof = diagnosticLifecycleNoProcessReleaseProofSchema.parse(await retained.methods.releaseNoProcess.call(retained.owner));
    this.#assertOwner(retained);
    const status = retained.methods.status.call(retained.owner);
    requireValue(status.released && status.helperClosed && status.failure === null && status.binding === null, "NO_PROCESS_RELEASE_UNCONFIRMED");
    const record: NonNullable<DiagnosticLifecycleRecords["no-process-released.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-no-process-released.v1", operationId, createdAt: new Date().toISOString(),
      noProcessReleaseIntentSha256: sha256Json(intent), proof,
    };
    this.#retainRecord("no-process-released.json", record);
    await assertSnapshot(operations); this.#assertOwner(retained);
    await this.#publish(operationId, "no-process-released.json", record);
    const completed = { ...operation, records: { ...operation.records, "no-process-released.json": record } };
    await assertSnapshot(operations.map(value => value.operationId === operationId ? completed : value)); this.#assertOwner(retained);
    this.#releaseLease(); return describe(operationId, completed);
  }
  async #completeCombinedFactoryFailure(operation: DiagnosticLifecycleOperation | undefined, operations: readonly DiagnosticLifecycleOperation[]): Promise<boolean> {
    if (this.#combinedFactoryError === null) { return false; }
    const proof = requireCurrentFootprintCombinedUnlaunchedFactoryFailure(this.#combinedFactoryError, this.#options);
    if (proof === null) { return false; }
    const attempt = this.#attempt, intent = operation?.records["intent.json"];
    requireValue(this.#generation === "209-startup-footprint-combined" && operation !== undefined &&
      intent?.schema === "easyeda-pro-control.footprint-combined-launch-intent.v2" && attempt !== null &&
      attempt.operationId === operation.operationId && attempt.intentSha256 === sha256Json(intent) && attempt.allocationInvoked &&
      !attempt.launchInvoked && this.#retained === null && this.#lease !== null, "COMBINED_FACTORY_FAILURE_PURPOSE");
    this.#combinedFactoryFailure = proof;
    this.#options.assertLocalAllowed(); assertCurrentPcbDiagnosticLaunchExclusion(this.#lease);
    await assertSnapshot(operations); this.#options.assertLocalAllowed(); assertCurrentPcbDiagnosticLaunchExclusion(this.#lease);
    const retained = this.#pending.get("combined-factory-before-launch.json");
    const published = operation.records["combined-factory-before-launch.json"];
    if (published !== undefined) {
      requireValue(retained !== undefined && retained === canonicalJson(published), "COMBINED_FACTORY_PUBLICATION_CHANGED");
      this.#releaseLease(); return true;
    }
    const record: NonNullable<DiagnosticLifecycleRecords["combined-factory-before-launch.json"]> = retained === undefined ? {
      schema: "easyeda-pro-control.footprint-combined-factory-before-launch.v1", operationId: operation.operationId,
      createdAt: new Date().toISOString(), intentSha256: attempt.intentSha256, proof,
    } : diagnosticLifecycleRecordSchemas["combined-factory-before-launch.json"].parse(JSON.parse(retained) as unknown);
    await this.#record(operation.operationId, "combined-factory-before-launch.json", record);
    await assertSnapshot(operations.map(candidate => candidate.operationId === operation.operationId ?
      { ...candidate, records: { ...candidate.records, "combined-factory-before-launch.json": record } } : candidate));
    this.#options.assertLocalAllowed(); assertCurrentPcbDiagnosticLaunchExclusion(this.#lease); this.#releaseLease(); return true;
  }
  async #launch(request: Extract<LifecycleRequest, { action: "launch" }>): Promise<Record<string, unknown>> {
    requireValue(!this.#launchAttempted && this.#retained === null, "LAUNCH_CONSUMED");
    this.#assertPurpose(request.operationId);
    await this.#launchAdmission();
    await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
    const before = await readCurrentPcbDiagnosticLifecycles();
    requireValue(!before.some(value => value.operationId === request.operationId), "OPERATION_CONSUMED");
    const installation = await this.#verify(this.#options);
    diagnosticLifecycleDigestSchema.parse(installation.facadeSha256);
    const executable = installation.plan.files[0]; requireValue(executable !== undefined, "EXECUTABLE_MISSING");
    const installationText = canonicalJson(installation);
    await assertSnapshot(before); await this.#otherLaunches();
    // Reserve before helper allocation. Even failure creating/syncing the intent
    // Can leave a durable reservation and never permits another attempt.
    this.#launchAttempted = true;
    await reserveCurrentPcbDiagnosticLifecycle(request.operationId);
    const intent = diagnosticLifecycleRecordSchemas["intent.json"].parse({
      ...launchFields(this.#purpose, this.#generation), operationId: request.operationId, createdAt: new Date().toISOString(),
      facadeSha256: installation.facadeSha256, installationSha256: sha256Json(installation),
      confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true,
      ...(this.#generation === "209-visual" ? { acceptVisualStateChanges: true as const } : {}),
      ...(this.#generation === "209-startup-footprint-main" || this.#generation === "209-startup-footprint-combined" ? { acceptDebuggerPauseEffects: true as const } : {}),
      ...(this.#generation === "209-startup-footprint-combined" ? { dispatchProtocol: "challenge-ready-before-launch.v1" as const } : {}),
    });
    this.#attempt = { operationId: request.operationId, intentSha256: sha256Json(intent), allocationInvoked: false, launchInvoked: false };
    await this.#record(request.operationId, "intent.json", intent);
    const expected = [...before, { operationId: request.operationId, records: { "intent.json": intent } }]
      .toSorted((left, right) => left.operationId.localeCompare(right.operationId));
    await assertSnapshot(expected);
    this.#attempt.allocationInvoked = true;
    let owner: LifecycleOwner;
    try { owner = await this.#allocate(this.#options); }
    catch (error) {
      if (this.#generation === "209-startup-footprint-combined") {
        const diagnostics = currentFootprintCombinedFactoryFailureDiagnostics(error, this.#options);
        this.#combinedFactoryDiagnostics = diagnostics === null ? null : currentFootprintCombinedFactoryFailureDiagnosticsSchema.parse(diagnostics);
        if (diagnostics !== null) { this.#combinedFactoryError = error; }
        try { await this.#completeCombinedFactoryFailure(expected.find(operation => operation.operationId === request.operationId), expected); }
        catch (publicationError) { throw new AggregateError([error, publicationError], "Combined factory failed; terminal publication remains unresolved.", { cause: publicationError }); }
      }
      throw error;
    }
    // Capture original identities; calls below always use the original receiver.
    const captured = Object.freeze({ launch: owner.launch, status: owner.status, observeApplicationWindow: owner.observeApplicationWindow,
      requestNormalClose: owner.requestNormalClose, observeTermination: owner.observeTermination, releaseClosed: owner.releaseClosed,
      releaseUnlaunched: owner.releaseUnlaunched, releaseNoProcess: owner.releaseNoProcess,
      browserObservation: owner.browserObservation, inspectFrames: owner.inspectFrames, inspectScript: owner.inspectScript,
      inspectWorkers: owner.inspectWorkers, inspectWorkerScript: owner.inspectWorkerScript, observeWorkerState: owner.observeWorkerState,
      observeModelState: owner.observeModelState, openProject: owner.openProject,
      openPcb: owner.openPcb, observePcbOpening: owner.observePcbOpening,
      ...(this.#generation === "209-visual" ? { performVisual209: owner.performVisual209, captureWindow209: owner.captureWindow209, observeWindowCaptureReadiness209: owner.observeWindowCaptureReadiness209, resizeWindowForCapture209: owner.resizeWindowForCapture209, restoreWindowForCapture209: owner.restoreWindowForCapture209, terminateVisualJob: owner.terminateVisualJob } : {}),
      ...(opening209(this.#generation) ? { observeLayers209: owner.observeLayers209, observePrimitives209: owner.observePrimitives209,
        observeExtendedPrimitives209: owner.observeExtendedPrimitives209, observeSelectionRelations209: owner.observeSelectionRelations209,
        observePadShapes209: owner.observePadShapes209, observeImageShapes209: owner.observeImageShapes209, observeArcShapes209: owner.observeArcShapes209, observePouredShapes209: owner.observePouredShapes209 } : {}),
      ...(this.#stringPurpose ? { observeStringPrecreate: owner.observeStringPrecreate, observeCommonBaseline: owner.observeCommonBaseline,
        retainedCommonBaselineFailure: owner.retainedCommonBaselineFailure } : {}),
      ...(this.#purpose === "worker-startup" ? { handoffWorkerStartup: owner.handoffWorkerStartup } : {}),
      ...(this.#generation === "209-startup-footprint" || routeStartup209(this.#generation) ? { observeFootprintCopyUi: owner.observeFootprintCopyUi,
        requireFootprintCopyUi: owner.requireFootprintCopyUi, retainedFootprintCopyUi: owner.retainedFootprintCopyUi,
        observeFootprintCopyManagerRoute: owner.observeFootprintCopyManagerRoute, requireFootprintCopyManagerRoute: owner.requireFootprintCopyManagerRoute,
        retainedFootprintCopyManagerRoute: owner.retainedFootprintCopyManagerRoute } : {}),
      ...(this.#generation === "209-startup-footprint-main" || this.#generation === "209-startup-footprint-combined" ? { observeFootprintMainConstruction: owner.observeFootprintMainConstruction, retainedFootprintMainConstruction: owner.retainedFootprintMainConstruction } : {}),
      ...(this.#generation === "209-startup-footprint-main" ? { terminateFootprintMain: owner.terminateFootprintMain } : {}),
      ...(this.#generation === "209-startup-footprint-combined" ? { abortFootprintCombined: owner.abortFootprintCombined, reserveFootprintCombinedAbort: owner.reserveFootprintCombinedAbort, dispatchFootprintCombinedAbort: owner.dispatchFootprintCombinedAbort, observeSavedCacheNative: owner.observeSavedCacheNative, observeSavedCacheAccessor: owner.observeSavedCacheAccessor } : {}),
      ...(routeStartup209(this.#generation) ? { observeFootprintCopyWindowsClock: owner.observeFootprintCopyWindowsClock, joinFootprintCopyManagerPeer: owner.joinFootprintCopyManagerPeer,
        observeFootprintCopyClockRegistration: owner.observeFootprintCopyClockRegistration, sampleFootprintCopyClockRegistration: owner.sampleFootprintCopyClockRegistration,
        retainedFootprintCopyClockRegistration: owner.retainedFootprintCopyClockRegistration, releaseFootprintCopyClockRegistration: owner.releaseFootprintCopyClockRegistration } : {}),
      ...(this.#generation === "209-startup-ratline" ? { prepareWorkerStartupRatlineSession209: owner.prepareWorkerStartupRatlineSession209 } : {}),
      ...(this.#generation === "209-startup-ratline-continuation" ? { prepareWorkerStartupRatlineContinuationSession209: owner.prepareWorkerStartupRatlineContinuationSession209 } : {}),
      ...(startup209(this.#generation) ? { requireWorkerStartupEmptyDependency209: owner.requireWorkerStartupEmptyDependency209,
        prepareWorkerStartupPcbSession209: owner.prepareWorkerStartupPcbSession209 } : {}) });
    const retained: Retained = { operationId: request.operationId, owner, methods: captured, installation: installationText,
      intentSha256: sha256Json(intent), binding: null };
    this.#retained = retained;
    await this.#installation(retained); await this.#launchAdmission();
    await assertSnapshot(expected); this.#assertOwner(retained);
    let acknowledged = false; let failure: unknown;
    try {
      this.#attempt.launchInvoked = true;
      retained.binding = diagnosticLifecycleBindingSchema.parse(await captured.launch.call(owner, {
        executable: executable.windowsPath, executableSha256: executable.sha256, confirmDiagnosticLaunch: true,
      }));
      this.#assertOwner(retained); requireValue(retained.binding.rootCreated !== "0", "CLEANUP_ONLY"); acknowledged = true;
    } catch (error) {
      failure = error;
      this.#assertOwner(retained);
      const binding = captured.status.call(owner).binding;
      if (binding !== null) { retained.binding = diagnosticLifecycleBindingSchema.parse(binding); }
    }
    if (retained.binding !== null) {
      const record: NonNullable<DiagnosticLifecycleRecords["binding.json"]> = {
        schema: "easyeda-pro-control.pcb-diagnostic-launch-binding.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
        intentSha256: retained.intentSha256, binding: retained.binding, launchAcknowledged: acknowledged,
      };
      try {
        await assertSnapshot(expected); this.#assertOwner(retained);
        await this.#record(request.operationId, "binding.json", record);
        const updated = { operationId: request.operationId, records: { "intent.json": intent, "binding.json": record } };
        await assertSnapshot(expected.map(value => value.operationId === request.operationId ? updated : value));
      }
      catch (error) { if (failure !== undefined) { throw new AggregateError([failure, error], "PCB_DIAGNOSTIC_LIFECYCLE_BINDING_PUBLICATION", { cause: error }); } throw error; }
      this.#assertOwner(retained);
    }
    if (!acknowledged) { throw failure instanceof Error ? failure : new Error("PCB_DIAGNOSTIC_LIFECYCLE_LAUNCH_UNACKNOWLEDGED", { cause: failure }); }
    const completed = await readCurrentPcbDiagnosticLifecycles();
    return describe(request.operationId, completed.find(value => value.operationId === request.operationId));
  }

  async #abortVisual(request: Extract<CleanupRequest, { action: "abort-visual" }>, operation: DiagnosticLifecycleOperation,
    operations: readonly DiagnosticLifecycleOperation[], retained: Retained): Promise<Record<string, unknown>> {
    requireValue(this.#generation === "209-visual" && !this.#visualAbortAttempted &&
      operation.records["visual-abort-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
      operation.records["released.json"] === undefined, "VISUAL_ABORT_CONSUMED");
    const terminate = retained.methods.terminateVisualJob; requireValue(terminate !== undefined, "VISUAL_OWNER_REQUIRED");
    const intent: NonNullable<DiagnosticLifecycleRecords["visual-abort-intent.json"]> = {
      schema: "easyeda-pro-control.pcb209-visual-abort-intent.v1", operationId: request.operationId,
      createdAt: new Date().toISOString(), bindingSha256: request.expectedBindingSha256, confirmAbortOriginalVisualJob: true,
    };
    this.#visualAbortAttempted = true;
    await this.#record(request.operationId, "visual-abort-intent.json", intent);
    const updated = { ...operation, records: { ...operation.records, "visual-abort-intent.json": intent } };
    const expected = operations.map(value => value.operationId === request.operationId ? updated : value);
    await assertSnapshot(expected); this.#assertOwner(retained);
    await terminate.call(retained.owner, request.confirmAbortOriginalVisualJob);
    this.#assertOwner(retained); await assertSnapshot(expected); this.#assertOwner(retained);
    const acknowledgment: NonNullable<DiagnosticLifecycleRecords["visual-abort-acknowledged.json"]> = {
      schema: "easyeda-pro-control.pcb209-visual-abort-acknowledged.v1", operationId: request.operationId,
      createdAt: new Date().toISOString(), intentSha256: sha256Json(intent), terminationDispatched: true, terminationProved: false,
    };
    await this.#record(request.operationId, "visual-abort-acknowledged.json", acknowledgment);
    const completed = { ...updated, records: { ...updated.records, "visual-abort-acknowledged.json": acknowledgment } };
    await assertSnapshot(expected.map(value => value.operationId === request.operationId ? completed : value));
    this.#assertOwner(retained);
    return { ...describe(request.operationId, updated), terminationDispatched: true, terminationProved: false, saveAuthorized: false };
  }

  async #cleanup(request: CleanupRequest): Promise<Record<string, unknown>> {
    const operations = await readCurrentPcbDiagnosticLifecycles();
    const operation = operations.find(value => value.operationId === request.operationId);
    this.#assertPurpose(request.operationId, operation);
    const binding = operation?.records["binding.json"], retained = this.#retained;
    requireValue(retained !== null && retained.operationId === request.operationId && operation !== undefined && binding !== undefined &&
      binding.intentSha256 === retained.intentSha256 && canonicalJson(binding.binding) === canonicalJson(retained.binding) &&
      sha256Json(binding) === request.expectedBindingSha256, "ORIGINAL_OWNER_REQUIRED");
    // Installation is startup admission, not permission to strand original
    // Handles. The native owner still checks its retained helper on cleanup.
    this.#assertOwner(retained);
    await assertSnapshot(operations); this.#assertOwner(retained);
    if (request.action === "abort-visual") { return this.#abortVisual(request, operation, operations, retained); }
    if (this.#visualAbortAttempted) { requireValue(["observe-termination", "release-closed"].includes(request.action), "VISUAL_GENERATION_ABORTED"); }
    if (request.action === "open-project") { return this.#openProject(request, operation, operations, retained); }
    if (request.action === "open-pcb") { return this.#openPcb(request, operation, operations, retained); }
    if (request.action === "observe-common-baseline") { return this.#observeCommonBaseline(request, operation, operations, retained); }
    if (request.action === "browser-observation" || request.action === "inspect-frames" || request.action === "inspect-script" ||
        request.action === "inspect-workers" || request.action === "inspect-worker-script" || request.action === "observe-worker-state" ||
        request.action === "restore-window-for-capture" || request.action === "resize-window-for-capture" || request.action === "capture-window" || request.action === "perform-visual" || request.action === "observe-model-state" || request.action === "observe-pcb-opening" || request.action === "observe-string-precreate" || request.action === "observe-layers" || request.action === "observe-primitives" || request.action === "observe-extended-primitives" || request.action === "observe-selection-relations" || request.action === "observe-pad-shapes" || request.action === "observe-image-shapes" || request.action === "observe-arc-shapes" || request.action === "observe-poured-shapes") {
      return this.#observe(request, operation, operations, retained);
    }
    if (request.action === "observe-capture-readiness") {
      const observe = retained.methods.observeWindowCaptureReadiness209;
      requireValue(this.#generation === "209-visual" && observe !== undefined && operation.records["terminated.json"] === undefined &&
        operation.records["close-intent.json"] === undefined, "WINDOW_READINESS209_PURPOSE");
      this.#originalPcbSource(operation);
      const result = await observe.call(retained.owner); this.#assertOwner(retained);
      await assertSnapshot(operations); this.#assertOwner(retained);
      return { ...describe(request.operationId, operation), readiness: result };
    }
    if (request.action === "observe-window") {
      requireValue(operation.records["terminated.json"] === undefined, "ALREADY_TERMINATED");
      const hwnd = await retained.methods.observeApplicationWindow.call(retained.owner);
      this.#assertOwner(retained); await assertSnapshot(operations);
      return { ...describe(request.operationId, operation), hwnd: diagnosticLifecycleWindowSchema.nullable().parse(hwnd) };
    }
    if (request.action === "normal-close") { return this.#close(request, operation, operations, retained); }
    if (request.action === "release-closed") { return this.#release(operation, operations, retained); }
    if (operation.records["terminated.json"] !== undefined) { return describe(request.operationId, operation); }
    const terminated = await retained.methods.observeTermination.call(retained.owner);
    this.#assertOwner(retained); await assertSnapshot(operations);
    requireValue(typeof terminated === "boolean", "TERMINATION_REPLY");
    if (!terminated) { return { ...describe(request.operationId, operation), terminationObserved: false,
      lastTerminationObservation: retained.methods.status.call(retained.owner).lastTerminationObservation ?? null }; }
    const record: NonNullable<DiagnosticLifecycleRecords["terminated.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-terminated.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      bindingSha256: request.expectedBindingSha256, originalRootExited: true, originalJobEmpty: true,
    };
    await this.#record(request.operationId, "terminated.json", record); this.#assertOwner(retained);
    return describe(request.operationId, { ...operation, records: { ...operation.records, "terminated.json": record } });
  }
  async #close(request: Extract<CleanupRequest, { action: "normal-close" }>, operation: DiagnosticLifecycleOperation,
    operations: readonly DiagnosticLifecycleOperation[], retained: Retained): Promise<Record<string, unknown>> {
    requireValue(!this.#closeAttempted && operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined, "CLOSE_CONSUMED");
    requireValue(await retained.methods.observeApplicationWindow.call(retained.owner) === request.hwnd, "WINDOW_CHANGED");
    this.#assertOwner(retained); await assertSnapshot(operations);
    const intent: NonNullable<DiagnosticLifecycleRecords["close-intent.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-close-intent.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      bindingSha256: request.expectedBindingSha256, hwnd: request.hwnd, confirmNormalClose: true,
    };
    this.#closeAttempted = true; await this.#record(request.operationId, "close-intent.json", intent);
    const updated = { ...operation, records: { ...operation.records, "close-intent.json": intent } };
    this.#options.assertLocalAllowed();
    await assertSnapshot(operations.map(value => value.operationId === operation.operationId ? updated : value)); this.#assertOwner(retained);
    if (this.#generation === "209-startup-ratline" && this.#startupRatlineSession === null && this.#startupHandoff !== null) {
      const { channel } = this.#startupHandoff;
      requireValue(channel instanceof CurrentPcb209RatlineStartupChannel && channel.beginCleanup === ratlineChannelCleanup, "STARTUP_RATLINE_CHANNEL_CHANGED");
      this.#startupRatlineCleanup ??= ratlineChannelCleanup.call(channel);
      try { await this.#startupRatlineCleanup; } catch { this.#startupRatlineCleanupFailed = true; }
      this.#assertOwner(retained);
    }
    if (this.#startupRatlineSession !== null) {
      this.#startupRatlineCleanup ??= ratlineSessionMethods.abort.call(this.#startupRatlineSession);
      try { await this.#startupRatlineCleanup; } catch { this.#startupRatlineCleanupFailed = true; }
      this.#assertOwner(retained);
    }
    if (this.#generation === "209-startup-ratline-continuation" && this.#startupContinuationSession === null && this.#startupHandoff !== null) {
      const { channel } = this.#startupHandoff;
      requireValue(channel instanceof CurrentPcb209RatlineContinuationChannel && channel.beginCleanup === continuationChannelCleanup, "STARTUP_RATLINE_CHANNEL_CHANGED");
      this.#startupContinuationCleanup ??= continuationChannelCleanup.call(channel);
      try { await this.#startupContinuationCleanup; } catch { this.#startupContinuationCleanupFailed = true; }
      this.#assertOwner(retained);
    }
    if (this.#startupContinuationSession !== null) {
      this.#startupContinuationCleanup ??= continuationSessionMethods.abort.call(this.#startupContinuationSession);
      try { await this.#startupContinuationCleanup; } catch { this.#startupContinuationCleanupFailed = true; }
      this.#assertOwner(retained);
    }
    await retained.methods.requestNormalClose.call(retained.owner, request.hwnd); this.#assertOwner(retained);
    await assertSnapshot(operations.map(value => value.operationId === operation.operationId ? updated : value)); this.#assertOwner(retained);
    const acknowledged: NonNullable<DiagnosticLifecycleRecords["close-acknowledged.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-close-acknowledged.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      closeIntentSha256: sha256Json(intent), acknowledged: true, terminationProved: false,
    };
    await this.#record(request.operationId, "close-acknowledged.json", acknowledged);
    return describe(request.operationId, { ...updated, records: { ...updated.records, "close-acknowledged.json": acknowledged } });
  }
  async #observe(request: ObservationRequest, operation: DiagnosticLifecycleOperation, operations: readonly DiagnosticLifecycleOperation[],
    retained: Retained): Promise<Record<string, unknown>> {
    let stage: ObservationStage = "browser";
    if (request.action === "restore-window-for-capture") { stage = "window-restore209"; }
    if (request.action === "resize-window-for-capture") { stage = "window-resize209"; }
    if (request.action === "capture-window") { stage = "window-capture209"; }
    if (request.action === "perform-visual") { stage = "visual-viewport209"; }
    if (request.action === "inspect-frames") { stage = "frames"; }
    if (request.action === "inspect-script") { stage = "script"; }
    if (request.action === "inspect-workers") { stage = "workers"; }
    if (request.action === "inspect-worker-script") { stage = "worker-script"; }
    if (request.action === "observe-worker-state") { stage = "worker-state"; }
    if (request.action === "observe-model-state") { stage = "model-state"; }
    if (request.action === "observe-pcb-opening") { stage = "pcb-opening"; }
    if (request.action === "observe-string-precreate") { stage = "string-precreate"; }
    if (request.action === "observe-layers") { stage = "layers209"; }
    if (request.action === "observe-primitives") { stage = "primitives209"; }
    if (request.action === "observe-extended-primitives") { stage = "extended-primitives209"; }
    if (request.action === "observe-selection-relations") { stage = "selection-relations209"; }
    if (request.action === "observe-pad-shapes") { stage = "pad-shapes209"; }
    if (request.action === "observe-image-shapes") { stage = "image-shapes209"; }
    if (request.action === "observe-arc-shapes") { stage = "arc-shapes209"; }
    if (request.action === "observe-poured-shapes") { stage = "poured-shapes209"; }
    requireValue(operation.records["binding.json"]?.launchAcknowledged === true && retained.binding?.rootCreated !== "0" &&
      operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined, "OBSERVATION_UNAVAILABLE");
    requireValue(!this.#observationConsumed.has(stage) && operation.records[`${stage}-intent.json`] === undefined, "OBSERVATION_CONSUMED");
    requireValue(stage !== "frames" || operation.records["browser-result.json"] !== undefined, "BROWSER_OBSERVATION_REQUIRED");
    requireValue(stage !== "script" || operation.records["frames-result.json"] !== undefined, "FRAME_OBSERVATION_REQUIRED");
    requireValue(stage !== "workers" || operation.records["frames-result.json"] !== undefined, "FRAME_OBSERVATION_REQUIRED");
    requireValue(stage !== "worker-script" || operation.records["workers-result.json"] !== undefined, "WORKER_OBSERVATION_REQUIRED");
    requireValue(stage !== "worker-state" || operation.records["worker-script-result.json"] !== undefined, "WORKER_SOURCE_REQUIRED");
    if (request.action === "restore-window-for-capture") {
      requireValue(this.#generation === "209-visual" && retained.methods.restoreWindowForCapture209 !== undefined &&
        !this.#observationConsumed.has("window-capture209") && !this.#observationConsumed.has("window-resize209") &&
        retained.methods.status.call(retained.owner).windowRestore209RequestCapacity === true, "WINDOW_RESTORE209_CAPACITY");
      this.#originalPcbSource(operation);
    }
    if (request.action === "resize-window-for-capture" || request.action === "capture-window") {
      const status = retained.methods.status.call(retained.owner);
      if (operation.records["window-restore209-intent.json"] !== undefined) {
        const restored = operation.records["window-restore209-result.json"];
        requireValue(restored !== undefined && this.#pending.get("window-restore209-result.json") === canonicalJson(restored) &&
          canonicalJson(this.#observations.get("window-restore209")) === canonicalJson(restored.result) && status.windowRestore209ReadinessObserved === true,
        "WINDOW_RESTORE209_RESULT_AND_READINESS_REQUIRED");
      }
      requireValue(status.windowRestore209AttemptConsumed !== true || status.windowRestore209ReadinessObserved === true, "WINDOW_RESTORE209_READINESS_REQUIRED");
    }
    if (request.action === "resize-window-for-capture") {
      requireValue(this.#generation === "209-visual" && retained.methods.resizeWindowForCapture209 !== undefined &&
        !this.#observationConsumed.has("window-capture209") && retained.methods.status.call(retained.owner).windowResize209RequestCapacity === true,
      "WINDOW_RESIZE209_CAPACITY"); this.#originalPcbSource(operation);
    }
    if (request.action === "capture-window") {
      const status = retained.methods.status.call(retained.owner);
      if (operation.records["window-resize209-intent.json"] !== undefined) {
        const resized = operation.records["window-resize209-result.json"];
        requireValue(resized !== undefined && this.#pending.get("window-resize209-result.json") === canonicalJson(resized) &&
          canonicalJson(this.#observations.get("window-resize209")) === canonicalJson(resized.result) && status.windowResize209ReadinessObserved === true,
        "WINDOW_RESIZE209_RESULT_AND_READINESS_REQUIRED");
      }
      requireValue(status.windowResize209AttemptConsumed !== true || status.windowResize209ReadinessObserved === true, "WINDOW_RESIZE209_READINESS_REQUIRED");
      requireValue(this.#generation === "209-visual" && retained.methods.captureWindow209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "WINDOW_CAPTURE209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (request.action === "perform-visual") {
      requireValue(this.#generation === "209-visual" && retained.methods.performVisual209 !== undefined, "VISUAL209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "layers209") {
      requireValue(opening209(this.#generation) && retained.methods.observeLayers209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "LAYERS209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "primitives209") {
      requireValue(opening209(this.#generation) && retained.methods.observePrimitives209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "PRIMITIVES209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "extended-primitives209") {
      requireValue(opening209(this.#generation) && retained.methods.observeExtendedPrimitives209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "EXTENDED_PRIMITIVES209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "selection-relations209") {
      requireValue(opening209(this.#generation) && retained.methods.observeSelectionRelations209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "SELECTION_RELATIONS209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "pad-shapes209") {
      requireValue(opening209(this.#generation) && retained.methods.observePadShapes209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "PAD_SHAPES209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "image-shapes209") {
      requireValue(opening209(this.#generation) && retained.methods.observeImageShapes209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "IMAGE_SHAPES209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "arc-shapes209") {
      requireValue(opening209(this.#generation) && retained.methods.observeArcShapes209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "ARC_SHAPES209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "poured-shapes209") {
      requireValue(opening209(this.#generation) && retained.methods.observePouredShapes209 !== undefined &&
        !this.#observationConsumed.has("workers") && !this.#observationConsumed.has("model-state"), "POURED_SHAPES209_PURPOSE");
      this.#originalPcbSource(operation);
    }
    if (stage === "model-state") {
      const originalScript = this.#observations.get("script"), script = operation.records["script-result.json"];
      const originalPcb = this.#observations.get("pcb-opening"), pcb = operation.records["pcb-opening-result.json"];
      const originalSource = script !== undefined && originalScript !== undefined && originalScript["family"] === "pcb" &&
        originalScript["sourceVerified"] === true && canonicalJson(script.result) === canonicalJson(originalScript) &&
        this.#pending.get("script-result.json") === canonicalJson(script);
      const openedSource = originalPcb !== undefined && pcb !== undefined && originalPcb["family"] === "pcb" &&
        this.#projectPreparation !== null && diagnosticPcbOpeningSourceAccepted(originalPcb, this.#projectPreparation.sealedTarget) &&
        canonicalJson(pcb.result) === canonicalJson(originalPcb) && this.#pending.get("pcb-opening-result.json") === canonicalJson(pcb);
      requireValue(originalSource || openedSource, "ORIGINAL_PCB_SOURCE_REQUIRED");
    }
    if (stage === "workers") {
      if (this.#stringPurpose) { this.#originalPcbSource(operation); }
      else { requireValue(!this.#pcbOpeningAttempted && operation.records["pcb-open-intent.json"] === undefined, "PCB_BRANCH_SELECTED"); }
    }
    if (stage === "pcb-opening") {
      this.#originalProjectOpening(operation);
      const opened = operation.records["pcb-open-result.json"];
      requireValue(this.#pcbOpeningResult !== null && this.#pcbOpeningResult["ok"] === true &&
        this.#pcbOpeningResult["status"] === "opened" && this.#pcbOpeningResult["failure"] === null &&
        opened !== undefined && canonicalJson(opened.result) === canonicalJson(this.#pcbOpeningResult) &&
        this.#pending.get("pcb-open-result.json") === canonicalJson(opened), "PCB_OPENING_UNCONFIRMED");
      requireValue(!this.#observationConsumed.has("workers") && operation.records["workers-intent.json"] === undefined, "WORKER_BRANCH_SELECTED");
    }
    if (stage === "workers" && (this.#openingAttempted || operation.records["project-opening-intent.json"] !== undefined)) {
      const opened = operation.records["project-opening-result.json"];
      requireValue(this.#openingResult !== null && this.#openingResult["ok"] === true &&
        this.#openingResult["status"] === "opened-prefix-observed" && this.#openingResult["failure"] === null &&
        opened !== undefined && canonicalJson(opened.result) === canonicalJson(this.#openingResult) &&
        this.#pending.get("project-opening-result.json") === canonicalJson(opened), "PROJECT_OPENING_UNCONFIRMED");
    }
    if (stage === "string-precreate") {
      requireValue(this.#stringPurpose, "STRING_PURPOSE_REQUIRED");
      if (this.#observationConsumed.has("common-baseline") || operation.records["common-baseline-intent.json"] !== undefined) {
        const common = operation.records["common-baseline-result.json"], failure = operation.records["common-baseline-failure.json"];
        requireValue(common !== undefined && this.#pending.get("common-baseline-result.json") === canonicalJson(common) &&
          canonicalJson(this.#observations.get("common-baseline")) === canonicalJson(common.result) &&
          (common.result.schema === "easyeda-pro-control.pcb-common-baseline-refusal.v1" ? failure !== undefined &&
            failure.failure.nativeContinuationAllowed && this.#pending.get("common-baseline-failure.json") === canonicalJson(failure) : failure === undefined),
        "COMMON_RESULT_PUBLICATION_REQUIRED");
      }
      this.#originalPcbSource(operation);
      const record = operation.records["worker-script-result.json"], source = this.#observations.get("worker-script");
      requireValue(source !== undefined && record !== undefined && source["sourceVerified"] === true &&
        canonicalJson(source) === canonicalJson(record.result) && this.#pending.get("worker-script-result.json") === canonicalJson(record), "ORIGINAL_WORKER_SOURCE_REQUIRED");
    }
    await this.#installation(retained); await assertSnapshot(operations); this.#assertNormalOwner(retained);
    const restored = operation.records["window-restore209-result.json"];
    const restoreProof = restored === undefined ? {} : { restoreResultSha256: sha256Json(restored), postRestoreStateObserved: true as const };
    const intent: NonNullable<DiagnosticLifecycleRecords["browser-intent.json"] | DiagnosticLifecycleRecords["string-precreate-intent.json"]> = stage === "string-precreate" ? {
      schema: "easyeda-pro-control.pcb-string-precreate-observation-intent.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      bindingSha256: request.expectedBindingSha256, stage, pcbOpeningResultSha256: sha256Json(operation.records["pcb-opening-result.json"]),
      workerScriptResultSha256: sha256Json(operation.records["worker-script-result.json"]),
    } : {
      schema: "easyeda-pro-control.pcb-diagnostic-observation-intent.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      bindingSha256: request.expectedBindingSha256, stage,
      ...(request.action === "inspect-frames" || request.action === "inspect-worker-script" ? { targetId: request.targetId } : {}),
      ...(request.action === "inspect-script" ? { frameId: request.frameId, family: request.family } : {}),
      ...(request.action === "observe-selection-relations" ? { componentIds: [...request.componentIds] } : {}),
      ...(request.action === "restore-window-for-capture" ? { acceptWindowRestoreEffects: true as const } : {}),
      ...(request.action === "resize-window-for-capture" || request.action === "capture-window" ? restoreProof : {}),
      ...(request.action === "resize-window-for-capture" ? { acceptWindowResizeEffects: true as const } : {}),
      ...(request.action === "capture-window" ? { captureHwnd: request.hwnd, acceptWindowPaintEffects: true as const, confirmLocalArtifact: true as const,
        ...(operation.records["window-resize209-result.json"] === undefined ? {} : {
          resizeResultSha256: sha256Json(operation.records["window-resize209-result.json"]), postResizeGeometryObserved: true as const }) } : {}),
      ...(request.action === "perform-visual" ? { visualOperation: request.operation, confirmVisualStateChanges: true as const } : {}),
    };
    this.#observationConsumed.add(stage); await this.#record(request.operationId, `${stage}-intent.json`, intent);
    const updated = { ...operation, records: { ...operation.records, [`${stage}-intent.json`]: intent } };
    const expected = operations.map(value => value.operationId === operation.operationId ? updated : value);
    await assertSnapshot(expected); this.#assertNormalOwner(retained);
    let result: Readonly<Record<string, unknown>>;
    try {
    if (request.action === "browser-observation") { result = await retained.methods.browserObservation.call(retained.owner); }
    else if (request.action === "inspect-frames") { result = await retained.methods.inspectFrames.call(retained.owner, request.targetId); }
    else if (request.action === "inspect-script") {
      requireValue(this.#generation === "206" || request.family === "ui", "GENERATION_SCRIPT_FAMILY");
      const script = this.#generation === "206" ? CURRENT_PCB_DIAGNOSTIC_SCRIPTS[request.family] : CURRENT_PCB_209_OPENING_SCRIPTS.ui;
      result = await retained.methods.inspectScript.call(retained.owner, request.frameId, script);
      requireValue(!startup209(this.#generation) || result["sourceVerified"] === true && result["family"] === "ui" &&
        result["sourceSha256"] === script.scriptSha256 && result["sourceBytes"] === script.scriptBytes &&
        result["relativePath"] === script.relativePath, "WORKER_STARTUP209_UI_SOURCE");
    }
    else if (request.action === "inspect-workers") { result = await retained.methods.inspectWorkers.call(retained.owner); }
    else if (request.action === "inspect-worker-script") { result = await retained.methods.inspectWorkerScript.call(retained.owner, request.targetId); }
    else if (request.action === "observe-model-state") { result = await retained.methods.observeModelState.call(retained.owner); }
    else if (request.action === "observe-layers") {
      const observe = retained.methods.observeLayers209;
      requireValue(opening209(this.#generation) && observe !== undefined, "LAYERS209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget);
    }
    else if (request.action === "observe-primitives") {
      const observe = retained.methods.observePrimitives209;
      requireValue(opening209(this.#generation) && observe !== undefined, "PRIMITIVES209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget);
    }
    else if (request.action === "observe-extended-primitives") {
      const observe = retained.methods.observeExtendedPrimitives209;
      requireValue(opening209(this.#generation) && observe !== undefined, "EXTENDED_PRIMITIVES209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget);
    }
    else if (request.action === "observe-pad-shapes") {
      const observe = retained.methods.observePadShapes209;
      requireValue(opening209(this.#generation) && observe !== undefined, "PAD_SHAPES209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget);
    }
    else if (request.action === "observe-image-shapes") {
      const observe = retained.methods.observeImageShapes209;
      requireValue(opening209(this.#generation) && observe !== undefined, "IMAGE_SHAPES209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget);
    }
    else if (request.action === "observe-arc-shapes") {
      const observe = retained.methods.observeArcShapes209;
      requireValue(opening209(this.#generation) && observe !== undefined, "ARC_SHAPES209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget);
    }
    else if (request.action === "observe-poured-shapes") {
      const observe = retained.methods.observePouredShapes209;
      requireValue(opening209(this.#generation) && observe !== undefined, "POURED_SHAPES209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget);
    }
    else if (request.action === "observe-string-precreate") {
      const observe = retained.methods.observeStringPrecreate;
      requireValue(this.#stringPurpose && observe !== undefined, "STRING_PURPOSE_REQUIRED");
      const before = this.#originalProjectOpening(operation).commonInventory;
      requireValue(before !== null, "STRING_ORIGINAL_SQL_REQUIRED");
      result = await observe.call(retained.owner, before);
    }
    else if (request.action === "restore-window-for-capture") {
      const restore = retained.methods.restoreWindowForCapture209;
      requireValue(this.#generation === "209-visual" && restore !== undefined, "WINDOW_RESTORE209_PURPOSE");
      const selected = this.#originalProjectOpening(operation).sealedTarget;
      result = currentWindowRestoreResult(await restore.call(retained.owner, selected), selected);
      requireCurrentWindowRestoreResult(result, selected);
    }
    else if (request.action === "resize-window-for-capture") {
      const resize = retained.methods.resizeWindowForCapture209;
      requireValue(this.#generation === "209-visual" && resize !== undefined, "WINDOW_RESIZE209_PURPOSE");
      const selected = this.#originalProjectOpening(operation).sealedTarget;
      result = currentWindowResizeResult(await resize.call(retained.owner, selected), selected);
      requireCurrentWindowResizeResult(result, selected);
    }
    else if (request.action === "capture-window") {
      const capture = retained.methods.captureWindow209;
      requireValue(this.#generation === "209-visual" && capture !== undefined, "WINDOW_CAPTURE209_PURPOSE");
      const selected = this.#originalProjectOpening(operation).sealedTarget;
      const raw = await capture.call(retained.owner, selected, request.hwnd);
      const guard = async (): Promise<void> => {
        this.#assertNormalOwner(retained); await this.#installation(retained); this.#assertNormalOwner(retained);
        await assertSnapshot(expected); this.#assertNormalOwner(retained); this.#originalPcbSource(updated);
      };
      await guard();
      const image = await publishCurrentWindowCapture(raw, request.operationId, request.expectedBindingSha256, guard);
      result = currentWindowCaptureResult(image.observation, image.image, selected);
      requireCurrentWindowCaptureResult(result, selected, request.operationId, request.expectedBindingSha256, request.hwnd);
    }
    else if (request.action === "perform-visual") {
      const perform = retained.methods.performVisual209;
      requireValue(this.#generation === "209-visual" && perform !== undefined, "VISUAL209_PURPOSE");
      result = await perform.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget, request.operation);
    }
    else if (request.action === "observe-selection-relations") {
      const observe = retained.methods.observeSelectionRelations209;
      requireValue(opening209(this.#generation) && observe !== undefined, "SELECTION_RELATIONS209_PURPOSE");
      result = await observe.call(retained.owner, this.#originalProjectOpening(operation).sealedTarget, request.componentIds);
    }
    else if (request.action === "observe-pcb-opening") {
      const preparation = this.#originalProjectOpening(operation);
      result = await retained.methods.observePcbOpening.call(retained.owner, preparation.sealedTarget,
        opening209(this.#generation) ? CURRENT_PCB_209_OPENING_SCRIPTS.pcb : CURRENT_PCB_DIAGNOSTIC_SCRIPTS.pcb);
    }
    else { result = await retained.methods.observeWorkerState.call(retained.owner); }
    } catch (caughtError) {
      const failure = currentPcbObservationFailureDetail(caughtError);
      if (failure !== null && (stage === "model-state" || stage === "string-precreate")) {
        const record = diagnosticLifecycleRecordSchemas["observation-failure.json"].parse({
          schema: "easyeda-pro-control.pcb-diagnostic-observation-failure.v1", operationId: request.operationId,
          createdAt: new Date().toISOString(), stage, intentSha256: sha256Json(intent), failure, executionAuthorized: false,
        });
        this.#retainRecord("observation-failure.json", record);
        try {
          this.#assertNormalOwner(retained); await assertSnapshot(expected); this.#assertNormalOwner(retained);
          await this.#publish(request.operationId, "observation-failure.json", record);
          const failed = { ...updated, records: { ...updated.records, "observation-failure.json": record } };
          await assertSnapshot(expected.map(value => value.operationId === request.operationId ? failed : value)); this.#assertNormalOwner(retained);
        } catch (publicationError) {
          // oxlint-disable-next-line eslint/preserve-caught-error -- Keep the primary observation as cause; both it and this later publication error remain in errors.
          throw new AggregateError([caughtError, publicationError], "PCB_DIAGNOSTIC_OBSERVATION_FAILURE_PUBLICATION", { cause: caughtError });
        }
      }
      throw caughtError;
    }
    // Preserve the original observation before validation/publication can fail.
    this.#observations.set(stage, result);
    if (request.action === "perform-visual") {
      requireCurrentPcb209VisualResult(result, this.#originalProjectOpening(operation).sealedTarget, request.operation);
    }
    let observationLimit = DIAGNOSTIC_OBSERVATION_MAX_BYTES;
    if (request.action === "restore-window-for-capture") { observationLimit = CURRENT_WINDOW_RESTORE_LIMITS.resultBytes; }
    if (request.action === "resize-window-for-capture") { observationLimit = CURRENT_WINDOW_RESIZE_LIMITS.resultBytes; }
    if (request.action === "perform-visual") { observationLimit = CURRENT_PCB_209_VISUAL_RESULT_BYTES; }
    else if (stage === "primitives209") { observationLimit = CURRENT_PCB_209_PRIMITIVES_RESULT_BYTES; }
    const extendedLimit = stage === "extended-primitives209" ? CURRENT_PCB_209_EXTENDED_PRIMITIVES_RESULT_BYTES : observationLimit;
    const selectionLimit = stage === "selection-relations209" ? CURRENT_PCB_209_SELECTION_RELATIONS_RESULT_BYTES : extendedLimit;
    const padShapesLimit = stage === "pad-shapes209" ? CURRENT_PCB_209_PAD_SHAPES_RESULT_BYTES : selectionLimit;
    const imageShapesLimit = stage === "image-shapes209" ? CURRENT_PCB_209_IMAGE_SHAPES_RESULT_BYTES : padShapesLimit;
    const arcShapesLimit = stage === "arc-shapes209" ? CURRENT_PCB_209_ARC_SHAPES_RESULT_BYTES : imageShapesLimit;
    const pouredShapesLimit = stage === "poured-shapes209" ? CURRENT_PCB_209_POURED_SHAPES_RESULT_BYTES : arcShapesLimit;
    requireValue(Buffer.byteLength(canonicalJson(result)) <= (stage === "string-precreate" ? STRING_PRECREATE_OBSERVATION_MAX_BYTES : pouredShapesLimit), "OBSERVATION_BOUND");
    if (request.action === "observe-selection-relations") {
      requireValue(Array.isArray(result["requestedComponentIds"]) &&
        canonicalJson(result["requestedComponentIds"]) === canonicalJson(request.componentIds), "SELECTION_RELATIONS209_REQUEST");
    }
    if (stage === "string-precreate") {
      const observed = stringPrecreateObservationResultSchema.parse(result), target = this.#projectPreparation?.sealedTarget;
      requireValue(target !== undefined && stringPrecreateTargetMatches(observed, target, this.#openingResult,
        this.#observations.get("pcb-opening")), "STRING_PRECREATE_TARGET");
    }
    const record = {
      ...(stage === "string-precreate" ? { schema: "easyeda-pro-control.pcb-string-precreate-observation-result.v1" as const,
        stage, result: stringPrecreateObservationResultSchema.parse(structuredClone(result)) } :
        { schema: "easyeda-pro-control.pcb-diagnostic-observation-result.v1" as const, stage, result: structuredClone(result) }),
      operationId: request.operationId, createdAt: new Date().toISOString(),
      intentSha256: sha256Json(intent), executionAuthorized: false as const,
    };
    this.#retainRecord(`${stage}-result.json`, record);
    this.#assertNormalOwner(retained); await assertSnapshot(expected); this.#assertNormalOwner(retained);
    await this.#publish(request.operationId, `${stage}-result.json`, record);
    const completed = { ...updated, records: { ...updated.records, [`${stage}-result.json`]: record } };
    await assertSnapshot(expected.map(value => value.operationId === request.operationId ? completed : value)); this.#assertNormalOwner(retained);
    return { ...describe(request.operationId, completed), stage, result: publicObservationResult(request.operationId, stage, record.result, true) };
  }
  async #observeCommonBaseline(request: Extract<CleanupRequest, { action: "observe-common-baseline" }>, operation: DiagnosticLifecycleOperation,
    operations: readonly DiagnosticLifecycleOperation[], retained: Retained): Promise<Record<string, unknown>> {
    const failureReader = retained.methods.retainedCommonBaselineFailure, observe = retained.methods.observeCommonBaseline;
    requireValue(this.#stringPurpose && observe !== undefined && failureReader !== undefined, "COMMON_PURPOSE_REQUIRED");
    requireValue(!this.#observationConsumed.has("common-baseline") && operation.records["common-baseline-intent.json"] === undefined,
      "COMMON_OBSERVATION_CONSUMED");
    requireValue(!this.#observationConsumed.has("string-precreate") && operation.records["string-precreate-intent.json"] === undefined &&
      operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined, "COMMON_OBSERVATION_UNAVAILABLE");
    this.#originalPcbSource(operation);
    const preparation = this.#originalProjectOpening(operation);
    const before = preparation.commonInventory, originalWorker = this.#observations.get("worker-script"), worker = operation.records["worker-script-result.json"];
    requireValue(before !== null && worker !== undefined && originalWorker !== undefined && originalWorker["sourceVerified"] === true &&
      canonicalJson(worker.result) === canonicalJson(originalWorker) && this.#pending.get("worker-script-result.json") === canonicalJson(worker),
    "COMMON_ORIGINAL_BASELINE_REQUIRED");
    const completion = readerCompletion(before);
    requireValue(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
      before.logicalSha256 === operation.records["project-opening-intent.json"]?.commonBeforeSqlSha256 &&
      before.checkpointSha256 === preparation.prepared.checkpoint.checkpointSha256, "COMMON_ORIGINAL_SQL_REQUIRED");
    await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
    await this.#verifyHistoricalCheckpoint(preparation.prepared, preparation.originalTarget);
    requireValue(this.#projectPreparation === preparation && canonicalJson(preparation.prepared) === preparation.preparedText &&
      readerCompletion(before) === completion, "COMMON_BASELINE_CHANGED");
    await assertSnapshot(operations); this.#assertOwner(retained);
    const intent: NonNullable<DiagnosticLifecycleRecords["common-baseline-intent.json"]> = {
      schema: "easyeda-pro-control.pcb-common-baseline-intent.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      stage: "common-baseline", bindingSha256: request.expectedBindingSha256,
      pcbOpeningResultSha256: sha256Json(operation.records["pcb-opening-result.json"]), workerScriptResultSha256: sha256Json(worker),
      beforeSqlSha256: before.logicalSha256, checkpointSha256: before.checkpointSha256,
    };
    this.#observationConsumed.add("common-baseline"); await this.#record(request.operationId, "common-baseline-intent.json", intent);
    const updated = { ...operation, records: { ...operation.records, "common-baseline-intent.json": intent } };
    const expected = operations.map(value => value.operationId === operation.operationId ? updated : value);
    await assertSnapshot(expected); this.#assertOwner(retained);
    let result: Awaited<ReturnType<NonNullable<LifecycleOwner["observeCommonBaseline"]>>>;
    try { result = await observe.call(retained.owner, before); }
    catch (caughtError) {
      const rawFailure = failureReader.call(retained.owner);
      if (rawFailure !== null) {
        const failure = currentPcbCommonBaselineFailureSchema.parse(rawFailure);
        const record: NonNullable<DiagnosticLifecycleRecords["common-baseline-failure.json"]> = {
          schema: "easyeda-pro-control.pcb-common-baseline-failure-record.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
          intentSha256: sha256Json(intent), failure, executionAuthorized: false,
        };
        this.#retainRecord("common-baseline-failure.json", record);
        try {
          this.#assertOwner(retained); await assertSnapshot(expected); this.#assertOwner(retained);
          await this.#publish(request.operationId, "common-baseline-failure.json", record);
          const failed = { ...updated, records: { ...updated.records, "common-baseline-failure.json": record } };
          await assertSnapshot(expected.map(value => value.operationId === request.operationId ? failed : value)); this.#assertOwner(retained);
        } catch (publicationError) {
          // oxlint-disable-next-line eslint/preserve-caught-error -- Preserve the original observation cause and the distinct later evidence-publication failure.
          throw new AggregateError([caughtError, publicationError], "PCB_COMMON_BASELINE_FAILURE_PUBLICATION", { cause: caughtError });
        }
      }
      throw caughtError;
    }
    this.#observations.set("common-baseline", result);
    const parsed = currentPcbCommonBaselineResultSchema.parse(result), target = preparation.sealedTarget;
    requireValue(parsed.identity.projectUuid === target.projectUuid && parsed.identity.branchUuid === target.branchUuid &&
      parsed.identity.documentUuid === target.documentUuid && parsed.beforeSqlSha256 === before.logicalSha256 &&
      parsed.checkpointSha256 === before.checkpointSha256, "COMMON_RESULT_TARGET");
    const record: NonNullable<DiagnosticLifecycleRecords["common-baseline-result.json"]> = {
      schema: "easyeda-pro-control.pcb-common-baseline-result.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
      stage: "common-baseline", intentSha256: sha256Json(intent), result: parsed, executionAuthorized: false,
    };
    let preceding = updated;
    if (parsed.schema === "easyeda-pro-control.pcb-common-baseline-refusal.v1") {
      const failure = currentPcbCommonBaselineFailureSchema.parse(failureReader.call(retained.owner));
      requireValue(failure.nativeContinuationAllowed && canonicalJson(failure.identity) === canonicalJson(parsed.identity) &&
        failure.historicalHeader?.headerSha256 === parsed.historicalHeaderSha256 &&
        failure.observationSha256 === parsed.observationSha256 &&
        canonicalJson(failure.retainedReplySha256) === canonicalJson(parsed.retainedReplySha256), "COMMON_REFUSAL_EVIDENCE_REQUIRED");
      const failed: NonNullable<DiagnosticLifecycleRecords["common-baseline-failure.json"]> = {
        schema: "easyeda-pro-control.pcb-common-baseline-failure-record.v1", operationId: request.operationId, createdAt: new Date().toISOString(),
        intentSha256: sha256Json(intent), failure, executionAuthorized: false,
      };
      // Retain both plans before the first publication. Settlement can only
      // Publish these same bytes, in failure-before-result order.
      this.#retainRecord("common-baseline-failure.json", failed);
      this.#retainRecord("common-baseline-result.json", record);
      this.#assertOwner(retained); await assertSnapshot(expected); this.#assertOwner(retained);
      await this.#publish(request.operationId, "common-baseline-failure.json", failed);
      preceding = { ...updated, records: { ...updated.records, "common-baseline-failure.json": failed } };
    } else { this.#retainRecord("common-baseline-result.json", record); }
    const precedingExpected = expected.map(value => value.operationId === request.operationId ? preceding : value);
    this.#assertOwner(retained); await assertSnapshot(precedingExpected); this.#assertOwner(retained);
    await this.#publish(request.operationId, "common-baseline-result.json", record);
    const completed = { ...preceding, records: { ...preceding.records, "common-baseline-result.json": record } };
    await assertSnapshot(precedingExpected.map(value => value.operationId === request.operationId ? completed : value)); this.#assertOwner(retained);
    return { ...describe(request.operationId, completed), stage: "common-baseline", result: parsed };
  }

  async #openProject(request: Extract<CleanupRequest, { action: "open-project" }>, operation: DiagnosticLifecycleOperation,
    operations: readonly DiagnosticLifecycleOperation[], retained: Retained): Promise<Record<string, unknown>> {
    requireValue(!this.#openingAttempted && operation.records["project-opening-intent.json"] === undefined, "PROJECT_OPENING_CONSUMED");
    requireValue(operation.records["binding.json"]?.launchAcknowledged === true && retained.binding?.rootCreated !== "0" &&
      !this.#closeAttempted && operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
      !this.#observationConsumed.has("workers") && operation.records["workers-intent.json"] === undefined, "PROJECT_OPENING_UNAVAILABLE");
    const originalScript = this.#observations.get("script"), script = operation.records["script-result.json"];
    requireValue(script !== undefined && originalScript !== undefined && originalScript["family"] === "ui" &&
      originalScript["sourceVerified"] === true && canonicalJson(script.result) === canonicalJson(originalScript) &&
      this.#pending.get("script-result.json") === canonicalJson(script), "ORIGINAL_UI_SOURCE_REQUIRED");
    // Consume before checkpoint or installation work. Failure can preserve a
    // Backup or an uncertain durable intent; neither grants a retry.
    this.#openingAttempted = true;
    await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
    const target = Object.freeze(structuredClone(request.target));
    const prepared = await this.#prepareCheckpoint(target);
    const preparedText = canonicalJson(prepared);
    requireValue(prepared.targetEvidence.projectUuid === target.projectUuid && prepared.targetEvidence.documentUuid === target.documentUuid &&
      prepared.targetEvidence.docType === "PCB" && prepared.targetEvidence.sourceSha256 === target.expectedSourceSha256, "PROJECT_CHECKPOINT_BINDING");
    const sealedTarget = Object.freeze(currentDisposableOpenSealedTargetSchema.parse({ ...target, branchUuid: prepared.targetEvidence.branchUuid }));
    const commonInventory = this.#stringPurpose ? await this.#readCommonInventory(prepared, target) : null;
    this.#assertOwner(retained);
    if (commonInventory !== null) {
      const completion = readerCompletion(commonInventory);
      requireValue(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null &&
        commonInventory.checkpointSha256 === prepared.checkpoint.checkpointSha256, "COMMON_ORIGINAL_SQL_REQUIRED");
    }
    this.#projectPreparation = Object.freeze({ sealedTarget, prepared, preparedText, originalTarget: target, commonInventory });
    const preparationCheckpoint = currentDisposableOpenPreparationCheckpointSchema.parse(prepared.preparationCheckpoint);
    await this.#verifyCheckpoint(prepared, target);
    requireValue(canonicalJson(prepared) === preparedText, "PROJECT_CHECKPOINT_CHANGED");
    await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
    const intent: NonNullable<DiagnosticLifecycleRecords["project-opening-intent.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-project-opening-intent.v1", operationId: request.operationId,
      createdAt: new Date().toISOString(), bindingSha256: request.expectedBindingSha256, scriptResultSha256: sha256Json(script),
      target: sealedTarget, preparationCheckpoint, checkpointReceiptSha256: sha256Json(prepared.checkpoint),
      ...(commonInventory === null ? {} : { commonBeforeSqlSha256: commonInventory.logicalSha256 }),
      confirmDisposableProject: true, acceptNormalOpenEffects: true,
    };
    await this.#record(request.operationId, "project-opening-intent.json", intent);
    const updated = { ...operation, records: { ...operation.records, "project-opening-intent.json": intent } };
    const expected = operations.map(value => value.operationId === operation.operationId ? updated : value);
    await assertSnapshot(expected); this.#assertOwner(retained);
    let reverificationAttempted = false, reverified = false;
    const result = await retained.methods.openProject.call(retained.owner, sealedTarget, async () => {
      requireValue(!reverificationAttempted, "PROJECT_REVERIFICATION_CONSUMED"); reverificationAttempted = true;
      await this.#installation(retained); await assertSnapshot(expected); this.#assertOwner(retained);
      requireValue(canonicalJson(prepared) === preparedText, "PROJECT_CHECKPOINT_CHANGED");
      await this.#verifyCheckpoint(prepared, target);
      requireValue(canonicalJson(prepared) === preparedText, "PROJECT_CHECKPOINT_CHANGED");
      await this.#installation(retained); await assertSnapshot(expected); this.#assertOwner(retained);
      reverified = true;
    });
    // Keep the exact decoded reply even when final owner checks or publication
    // Fail. This result is never a writer token or evidence of full restoration.
    this.#openingResult = result;
    requireValue(Buffer.byteLength(canonicalJson(result)) <= DIAGNOSTIC_OBSERVATION_MAX_BYTES, "PROJECT_OPENING_BOUND");
    requireValue(!result.ok || reverified, "PROJECT_REVERIFICATION_REQUIRED");
    const record: NonNullable<DiagnosticLifecycleRecords["project-opening-result.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-project-opening-result.v1", operationId: request.operationId,
      createdAt: new Date().toISOString(), intentSha256: sha256Json(intent), result: structuredClone(result), executionAuthorized: false,
    };
    this.#retainRecord("project-opening-result.json", record);
    this.#assertOwner(retained); await assertSnapshot(expected); this.#assertOwner(retained);
    await this.#publish(request.operationId, "project-opening-result.json", record);
    const completed = { ...updated, records: { ...updated.records, "project-opening-result.json": record } };
    await assertSnapshot(expected.map(value => value.operationId === request.operationId ? completed : value)); this.#assertOwner(retained);
    return { ...describe(request.operationId, completed), projectOpeningResultRetained: true, result: record.result, preparationCheckpoint };
  }
  #originalProjectOpening(operation: DiagnosticLifecycleOperation): ProjectPreparation {
    const intent = operation.records["project-opening-intent.json"], opened = operation.records["project-opening-result.json"];
    const preparation = this.#projectPreparation;
    requireValue(preparation !== null && this.#openingResult !== null && this.#openingResult["ok"] === true &&
      this.#openingResult["status"] === "opened-prefix-observed" && this.#openingResult["failure"] === null &&
      opened !== undefined && canonicalJson(opened.result) === canonicalJson(this.#openingResult) &&
      this.#pending.get("project-opening-result.json") === canonicalJson(opened) && intent !== undefined &&
      this.#pending.get("project-opening-intent.json") === canonicalJson(intent) &&
      canonicalJson(intent.target) === canonicalJson(preparation.sealedTarget), "PROJECT_OPENING_UNCONFIRMED");
    return preparation;
  }
  #originalPcbSource(operation: DiagnosticLifecycleOperation): void {
    const preparation = this.#originalProjectOpening(operation);
    const record = operation.records["pcb-opening-result.json"], source = this.#observations.get("pcb-opening");
    requireValue(source !== undefined && record !== undefined &&
      diagnosticPcbOpeningSourceAccepted(source, preparation.sealedTarget) &&
      canonicalJson(source) === canonicalJson(record.result) && this.#pending.get("pcb-opening-result.json") === canonicalJson(record), "ORIGINAL_PCB_SOURCE_REQUIRED");
  }
  async #openPcb(request: Extract<CleanupRequest, { action: "open-pcb" }>, operation: DiagnosticLifecycleOperation,
    operations: readonly DiagnosticLifecycleOperation[], retained: Retained): Promise<Record<string, unknown>> {
    requireValue(!this.#pcbOpeningAttempted && operation.records["pcb-open-intent.json"] === undefined, "PCB_OPENING_CONSUMED");
    const preparation = this.#originalProjectOpening(operation);
    requireValue(!this.#closeAttempted && operation.records["close-intent.json"] === undefined && operation.records["terminated.json"] === undefined &&
      !this.#observationConsumed.has("workers") && operation.records["workers-intent.json"] === undefined &&
      !this.#observationConsumed.has("model-state") && operation.records["model-state-intent.json"] === undefined, "PCB_OPENING_UNAVAILABLE");
    this.#pcbOpeningAttempted = true;
    await this.#installation(retained); await assertSnapshot(operations); this.#assertOwner(retained);
    const intent: NonNullable<DiagnosticLifecycleRecords["pcb-open-intent.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-pcb-open-intent.v1", operationId: request.operationId,
      createdAt: new Date().toISOString(), bindingSha256: request.expectedBindingSha256,
      projectOpeningIntentSha256: sha256Json(operation.records["project-opening-intent.json"]),
      projectOpeningResultSha256: sha256Json(operation.records["project-opening-result.json"]), acceptNormalOpenEffects: true,
    };
    await this.#record(request.operationId, "pcb-open-intent.json", intent);
    const updated = { ...operation, records: { ...operation.records, "pcb-open-intent.json": intent } };
    const expected = operations.map(value => value.operationId === operation.operationId ? updated : value);
    await assertSnapshot(expected); this.#assertOwner(retained);
    let reverificationAttempted = false, reverified = false;
    const result = await retained.methods.openPcb.call(retained.owner, preparation.sealedTarget, async () => {
      requireValue(!reverificationAttempted, "PCB_REVERIFICATION_CONSUMED"); reverificationAttempted = true;
      await this.#installation(retained); await assertSnapshot(expected); this.#assertOwner(retained);
      requireValue(this.#projectPreparation === preparation && canonicalJson(preparation.prepared) === preparation.preparedText, "PROJECT_CHECKPOINT_CHANGED");
      await this.#verifyHistoricalCheckpoint(preparation.prepared, preparation.originalTarget);
      requireValue(canonicalJson(preparation.prepared) === preparation.preparedText, "PROJECT_CHECKPOINT_CHANGED");
      await this.#installation(retained); await assertSnapshot(expected); this.#assertOwner(retained); reverified = true;
    });
    this.#pcbOpeningResult = result;
    requireValue(Buffer.byteLength(canonicalJson(result)) <= DIAGNOSTIC_OBSERVATION_MAX_BYTES, "PCB_OPENING_BOUND");
    requireValue(!result.dispatchAttempted || reverified, "PCB_REVERIFICATION_REQUIRED");
    const record: NonNullable<DiagnosticLifecycleRecords["pcb-open-result.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-pcb-open-result.v1", operationId: request.operationId,
      createdAt: new Date().toISOString(), intentSha256: sha256Json(intent), result: structuredClone(result), executionAuthorized: false,
    };
    this.#retainRecord("pcb-open-result.json", record);
    this.#assertOwner(retained); await assertSnapshot(expected); this.#assertOwner(retained);
    await this.#publish(request.operationId, "pcb-open-result.json", record);
    const completed = { ...updated, records: { ...updated.records, "pcb-open-result.json": record } };
    await assertSnapshot(expected.map(value => value.operationId === request.operationId ? completed : value)); this.#assertOwner(retained);
    return { ...describe(request.operationId, completed), pcbOpeningResultRetained: true, result: record.result };
  }
  async #release(operation: DiagnosticLifecycleOperation, operations: readonly DiagnosticLifecycleOperation[], retained: Retained): Promise<Record<string, unknown>> {
    const termination = operation.records["terminated.json"];
    requireValue(termination !== undefined && !this.#releaseInvoked, "RELEASE_UNAVAILABLE");
    requireValue([...this.#pending].every(([name, text]) => canonicalJson(operation.records[name]) === text), "PUBLICATION_UNSETTLED");
    const original = this.#pending.get("release-intent.json");
    requireValue(!this.#releaseAttempted || original !== undefined && canonicalJson(operation.records["release-intent.json"]) === original, "RELEASE_INTENT_UNSETTLED");
    const intent: NonNullable<DiagnosticLifecycleRecords["release-intent.json"]> = original === undefined ? {
      schema: "easyeda-pro-control.pcb-diagnostic-release-intent.v1", operationId: operation.operationId,
      createdAt: new Date().toISOString(), terminationSha256: sha256Json(termination),
    } : diagnosticLifecycleRecordSchemas["release-intent.json"].parse(JSON.parse(original) as unknown);
    this.#releaseAttempted = true;
    if (original === undefined) { await this.#record(operation.operationId, "release-intent.json", intent); }
    const updated = { ...operation, records: { ...operation.records, "release-intent.json": intent } };
    await assertSnapshot(operations.map(value => value.operationId === operation.operationId ? updated : value)); this.#assertOwner(retained);
    if (this.#startupRatlineSession !== null && !this.#startupRatlineReleased) {
      this.#startupRatlineCleanup ??= ratlineSessionMethods.abort.call(this.#startupRatlineSession);
      try { await this.#startupRatlineCleanup; } catch { this.#startupRatlineCleanupFailed = true; }
      await ratlineSessionMethods.release.call(this.#startupRatlineSession); this.#startupRatlineReleased = true; this.#assertOwner(retained);
    }
    if (this.#startupContinuationSession !== null && !this.#startupContinuationReleased) {
      this.#startupContinuationCleanup ??= continuationSessionMethods.abort.call(this.#startupContinuationSession);
      try { await this.#startupContinuationCleanup; } catch { this.#startupContinuationCleanupFailed = true; }
      await continuationSessionMethods.release.call(this.#startupContinuationSession); this.#startupContinuationReleased = true; this.#assertOwner(retained);
    }
    if (this.#startupOpening !== null && !this.#startupOpeningReleased) {
      const opening = this.#startupOpening;
      await opening.methods.releaseAfterTermination.call(opening.owner);
      this.#startupOpeningReleased = true; this.#assertOwner(retained);
      await assertSnapshot(operations.map(value => value.operationId === operation.operationId ? updated : value)); this.#assertOwner(retained);
    }
    this.#releaseInvoked = true; await retained.methods.releaseClosed.call(retained.owner); this.#assertOwner(retained);
    await assertSnapshot(operations.map(value => value.operationId === operation.operationId ? updated : value)); this.#assertOwner(retained);
    const status = retained.methods.status.call(retained.owner);
    requireValue(status.released && status.helperClosed && status.failure === null, "RELEASE_UNCONFIRMED");
    const released: NonNullable<DiagnosticLifecycleRecords["released.json"]> = {
      schema: "easyeda-pro-control.pcb-diagnostic-released.v1", operationId: operation.operationId,
      createdAt: new Date().toISOString(), releaseIntentSha256: sha256Json(intent), released: true,
    };
    await this.#record(operation.operationId, "released.json", released); this.#releaseLease();
    return describe(operation.operationId, { ...updated, records: { ...updated.records, "released.json": released } });
  }
}

/** Existing diagnostic facade never joins its mutually exclusive branches. */
export class CurrentPcbDiagnosticLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcbDiagnosticLifecycleDependencies = {}) {
    super(options, dependencies, "diagnostic");
  }
}

/** New source-qualified disposable project/PCB opening subset. A new instance
 * owns a separate pcb209-* lifetime; no legacy owner or serialized record can
 * select a different generation or enable the old model/worker vocabulary. */
export class CurrentPcb209DiagnosticLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcbDiagnosticLifecycleDependencies = {}) {
    super(options, dependencies, "diagnostic", "209-opening");
  }
}

/** Separate original-owner visual effects, sealed before native launch. */
export class CurrentPcb209VisualLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcbDiagnosticLifecycleDependencies = {}) {
    super(options, dependencies, "diagnostic", "209-visual");
  }
}

/** Separate, fixed-purpose precreate observation only; no create or Save. */
export class CurrentPcbStringPrecreateLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcbStringPrecreateLifecycleDependencies = {}) {
    super(options, dependencies, "string-precreate");
  }
}

/** Fixed startup lifecycle. Its data-only capture entry opens a sealed
 * disposable project; the generic grammar admits no navigation, CAD or Save. */
export class CurrentPcbWorkerStartupLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcbWorkerStartupLifecycleDependencies = {}) {
    super(options, dependencies, "worker-startup");
  }
  public handoffWorkerStartup(operationId: string, expectedBindingSha256: string): Promise<CurrentPcbWorkerStartupHandoff> {
    return this.handoffStartup(operationId, expectedBindingSha256);
  }
  public openWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<CurrentPcbWorkerStartupOpeningResult> {
    return this.openStartup(operationId, expectedBindingSha256, input, "206");
  }
  public requireWorkerStartup(operationId: string, expectedBindingSha256: string,
    result: CurrentPcbWorkerStartupOpeningResult): Promise<CurrentPcbWorkerStartupTransport> {
    return this.requireStartup(operationId, expectedBindingSha256, result);
  }
  /** Data-only validation entrypoint. Native capabilities stay in the original
   * coordinator, and either stage's consumed intent forbids capture replay. */
  public async captureWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<Record<string, unknown>> {
    const request = startupCaptureInputSchema.parse(input);
    await this.handoffStartup(operationId, expectedBindingSha256);
    const result = await this.openStartup(operationId, expectedBindingSha256, request, "206");
    return { ...structuredClone(result), operationId, validationOnly: true, saveAuthorized: false };
  }
  public observeWorkerStartupAssignments(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupAssignments(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupActor(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupActor(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupChannel(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupChannel(operationId, expectedBindingSha256);
  }
}

/** Fixed209 startup lifecycle. Its data-only capture entry opens a sealed
 * disposable project; the generic grammar admits no navigation, CAD or Save. */
export class CurrentPcb209WorkerStartupLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcb209WorkerStartupLifecycleDependencies = {}) {
    super(options, dependencies, "worker-startup", "209-startup");
  }
  public handoffWorkerStartup(operationId: string, expectedBindingSha256: string): Promise<CurrentPcbWorkerStartupHandoff> {
    return this.handoffStartup(operationId, expectedBindingSha256);
  }
  /** Private factory seam only; no registered action calls it. The current
   * native purpose always refuses until its separately bounded successor exists. */
  public prepareWorkerStartupEmpty(operationId: string, expectedBindingSha256: string): Promise<CurrentPcb209StartupEmptyPreparation> {
    return this.prepareStartupEmpty(operationId, expectedBindingSha256);
  }
  public openWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<CurrentPcb209WorkerStartupOpeningResult> {
    return this.openStartup(operationId, expectedBindingSha256, input, "209-startup");
  }
  public requireWorkerStartup(operationId: string, expectedBindingSha256: string,
    result: CurrentPcb209WorkerStartupOpeningResult): Promise<CurrentPcb209WorkerStartupTransport> {
    return this.requireStartup(operationId, expectedBindingSha256, result);
  }
  /** Data-only validation entrypoint. Native capabilities stay in the original
   * coordinator, and either stage's consumed intent forbids capture replay. */
  public async captureWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<Record<string, unknown>> {
    const request = startupCaptureInputSchema.parse(input);
    await this.handoffStartup(operationId, expectedBindingSha256);
    const result = await this.openStartup(operationId, expectedBindingSha256, request, "209-startup");
    return { ...structuredClone(result), operationId, validationOnly: true, saveAuthorized: false };
  }
  public observeWorkerStartupAssignments(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupAssignments(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupFootprint(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupFootprint(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupFootprintSource(operationId: string, expectedBindingSha256: string, input: unknown): Promise<Record<string, unknown>> {
    return this.observeStartupFootprintSource(operationId, expectedBindingSha256, input);
  }
  public prepareWorkerStartupFootprintCopy(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.prepareStartupFootprintCopy(operationId, expectedBindingSha256);
  }

  public observeWorkerStartupActor(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupActor(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupChannel(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupChannel(operationId, expectedBindingSha256);
  }
}

/** Separate preparation-only launch with a fixed additional actor/producer reserve. */
export class CurrentFootprintCopyPreparationLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcb209WorkerStartupLifecycleDependencies = {}) {
    super(options, dependencies, "worker-startup", "209-startup-footprint");
  }
  public handoffWorkerStartup(operationId: string, expectedBindingSha256: string): Promise<CurrentPcbWorkerStartupHandoff> {
    return this.handoffStartup(operationId, expectedBindingSha256);
  }
  public openWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<CurrentPcb209WorkerStartupOpeningResult> {
    return this.openStartup(operationId, expectedBindingSha256, input, "209-startup-footprint");
  }
  public requireWorkerStartup(operationId: string, expectedBindingSha256: string,
    result: CurrentPcb209WorkerStartupOpeningResult): Promise<CurrentPcb209WorkerStartupTransport> {
    return this.requireStartup(operationId, expectedBindingSha256, result);
  }
  /** Data-only validation entrypoint. Native capabilities stay in the original
   * coordinator, and either stage's consumed intent forbids capture replay. */
  public async captureWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<Record<string, unknown>> {
    const request = startupCaptureInputSchema.parse(input);
    await this.handoffStartup(operationId, expectedBindingSha256);
    const result = await this.openStartup(operationId, expectedBindingSha256, request, "209-startup-footprint");
    return { ...structuredClone(result), operationId, validationOnly: true, saveAuthorized: false };
  }
  public observeWorkerStartupAssignments(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupAssignments(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupFootprint(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupFootprint(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupFootprintSource(operationId: string, expectedBindingSha256: string, input: unknown): Promise<Record<string, unknown>> {
    return this.observeStartupFootprintSource(operationId, expectedBindingSha256, input);
  }
  public prepareWorkerStartupFootprintCopy(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.prepareStartupFootprintCopy(operationId, expectedBindingSha256);
  }

  public observeWorkerStartupActor(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupActor(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupChannel(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupChannel(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupFootprintUi(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupFootprintCopyUi(operationId, expectedBindingSha256);
  }
  public prepareWorkerStartupFootprintBindings(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.prepareStartupFootprintCopyBindings(operationId, expectedBindingSha256);
  }
  public prepareWorkerStartupFootprintDependencies(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.prepareStartupFootprintCopyDependencies(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupFootprintManagerRoute(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupFootprintCopyManagerRoute(operationId, expectedBindingSha256);
  }
}

/** Distinct read-only route observation, with original parent/child capture. */
export class CurrentFootprintCopyRoutePreparationLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcb209WorkerStartupLifecycleDependencies = {}) {
    super(options, dependencies, "worker-startup", "209-startup-footprint-route");
  }
  public handoffWorkerStartup(operationId: string, expectedBindingSha256: string): Promise<CurrentPcbWorkerStartupHandoff> {
    return this.handoffStartup(operationId, expectedBindingSha256);
  }
  public openWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<CurrentFootprintCopyStartupOpeningResult> {
    return this.openStartup(operationId, expectedBindingSha256, input, "209-startup-footprint-route");
  }
  public async captureWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<Record<string, unknown>> {
    const request = startupCaptureInputSchema.parse(input);
    await this.handoffStartup(operationId, expectedBindingSha256);
    const result = await this.openStartup(operationId, expectedBindingSha256, request, "209-startup-footprint-route");
    return { ...structuredClone(result), operationId, validationOnly: true, saveAuthorized: false };
  }
  public observeWorkerStartupAssignments(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupAssignments(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupActor(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupActor(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupChannel(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupChannel(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupFootprintRoute(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupFootprintRoute(operationId, expectedBindingSha256);
  }
}

/** Original combined main/renderer diagnostics; no backend request or writer mount. */
export class CurrentFootprintCombinedLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcb209WorkerStartupLifecycleDependencies = {}) {
    super(options, dependencies, "worker-startup", "209-startup-footprint-combined");
  }
  public override run(input: unknown): Promise<Record<string, unknown>> {
    try {
      const request = currentFootprintCombinedValidationRequestSchema.parse(input);
    if (request.action === "abort-generation") { return this.runCombinedAbort(request); }
    if (!["inspect", "observe-termination", "release-closed", "settle-records", "cleanup-unlaunched", "cleanup-no-process"].includes(request.action)) { this.assertCombinedNormal(); }
      if (request.action === "observe-main-construction") { return this.runMainAction(request); }
      if (request.action === "observe-saved-cache-native") { return this.runSavedCacheNative(request); }
      if (request.action === "observe-saved-cache-accessor") { return this.runSavedCacheAccessor(request); }
      return super.run(request);
    } catch (error) { return Promise.reject(error instanceof Error ? error : new Error("COMBINED_REQUEST_REFUSED")); }
  }
  public async handoffWorkerStartup(operationId: string, expectedBindingSha256: string): Promise<CurrentPcbWorkerStartupHandoff> {
    await this.requireCombinedMainPublished(operationId, expectedBindingSha256); this.assertCombinedNormal();
    return this.handoffStartup(operationId, expectedBindingSha256);
  }
  public async openWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<CurrentFootprintCopyStartupOpeningResult> {
    await this.requireCombinedMainPublished(operationId, expectedBindingSha256); this.assertCombinedNormal();
    return this.openStartup(operationId, expectedBindingSha256, input, "209-startup-footprint-combined");
  }
  public async captureWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<Record<string, unknown>> {
    const request = startupCaptureInputSchema.parse(input);
    await this.handoffWorkerStartup(operationId, expectedBindingSha256); this.assertCombinedNormal();
    const result = await this.openWorkerStartup(operationId, expectedBindingSha256, request); this.assertCombinedNormal();
    return { ...structuredClone(result), operationId, validationOnly: true, executionAuthorized: false, saveAuthorized: false };
  }
  public observeWorkerStartupAssignments(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.assertCombinedNormal(); return this.observeStartupAssignments(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupActor(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.assertCombinedNormal(); return this.observeStartupActor(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupChannel(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.assertCombinedNormal(); return this.observeStartupChannel(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupFootprintRoute(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    this.assertCombinedNormal(); return this.observeStartupFootprintRoute(operationId, expectedBindingSha256);
  }
}

/** Standalone main-process observation, with no renderer navigation routes. */
export class CurrentFootprintMainLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcbDiagnosticLifecycleDependencies = {}) {
    super(options, dependencies, "worker-startup", "209-startup-footprint-main");
  }
  public override run(input: unknown): Promise<Record<string, unknown>> {
    const request = currentFootprintMainValidationRequestSchema.parse(input);
    return request.action === "observe-main-construction" || request.action === "terminate-main" ? this.runMainAction(request) : super.run(request);
  }
}

/** Separate launch-sealed empty baseline purpose; never upgrades a retained owner. */
export class CurrentPcb209EmptyStartupLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcb209WorkerStartupLifecycleDependencies = {}) {
    super(options, dependencies, "worker-startup", "209-startup-empty");
  }
  public handoffWorkerStartup(operationId: string, expectedBindingSha256: string): Promise<CurrentPcbWorkerStartupHandoff> {
    return this.handoffStartup(operationId, expectedBindingSha256);
  }
  /** Original preparation only. The public observation must publish its
   * durable navigation intent before invoking the returned PCB session. */
  public prepareWorkerStartupEmpty(operationId: string, expectedBindingSha256: string): Promise<CurrentPcb209StartupEmptyPreparation> {
    return this.prepareStartupEmpty(operationId, expectedBindingSha256);
  }
  public openWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<CurrentPcb209WorkerStartupOpeningResult> {
    return this.openStartup(operationId, expectedBindingSha256, input, "209-startup-empty");
  }
  public requireWorkerStartup(operationId: string, expectedBindingSha256: string,
    result: CurrentPcb209WorkerStartupOpeningResult): Promise<CurrentPcb209WorkerStartupTransport> {
    return this.requireStartup(operationId, expectedBindingSha256, result);
  }
  /** Data-only validation entrypoint. Native capabilities stay in the original
   * coordinator, and either stage's consumed intent forbids capture replay. */
  public async captureWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<Record<string, unknown>> {
    const request = startupCaptureInputSchema.parse(input);
    await this.handoffStartup(operationId, expectedBindingSha256);
    const result = await this.openStartup(operationId, expectedBindingSha256, request, "209-startup-empty");
    return { ...structuredClone(result), operationId, validationOnly: true, saveAuthorized: false };
  }
  public observeWorkerStartupAssignments(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupAssignments(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupActor(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupActor(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupChannel(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupChannel(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupEmpty(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupEmpty(operationId, expectedBindingSha256);
  }
}

/** Separate launch-sealed ratline held-import purpose; never upgrades a retained owner. */
export class CurrentPcb209RatlineStartupLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcb209WorkerStartupLifecycleDependencies = {}) {
    super(options, dependencies, "worker-startup", "209-startup-ratline");
  }
  public handoffWorkerStartup(operationId: string, expectedBindingSha256: string): Promise<CurrentPcbWorkerStartupHandoff> {
    return this.handoffStartup(operationId, expectedBindingSha256);
  }
  public openWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<CurrentPcb209WorkerStartupOpeningResult> {
    return this.openStartup(operationId, expectedBindingSha256, input, "209-startup-ratline");
  }
  public requireWorkerStartup(operationId: string, expectedBindingSha256: string,
    result: CurrentPcb209WorkerStartupOpeningResult): Promise<CurrentPcb209WorkerStartupTransport> {
    return this.requireStartup(operationId, expectedBindingSha256, result);
  }
  /** Data-only validation entrypoint. Native capabilities stay in the original
   * coordinator, and either stage's consumed intent forbids capture replay. */
  public async captureWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<Record<string, unknown>> {
    const request = startupCaptureInputSchema.parse(input);
    await this.handoffStartup(operationId, expectedBindingSha256);
    const result = await this.openStartup(operationId, expectedBindingSha256, request, "209-startup-ratline");
    return { ...structuredClone(result), operationId, validationOnly: true, saveAuthorized: false };
  }
  public observeWorkerStartupAssignments(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupAssignments(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupActor(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupActor(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupChannel(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupChannel(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupRatline(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupRatline(operationId, expectedBindingSha256);
  }
}

/** Separately launch-sealed source-qualified continuation; no held owner upgrade. */
export class CurrentPcb209RatlineContinuationLifecycle extends CurrentPcbLifecycleCore {
  public constructor(options: CurrentPcbDiagnosticLifecycleOptions, dependencies: CurrentPcb209WorkerStartupLifecycleDependencies = {}) {
    super(options, dependencies, "worker-startup", "209-startup-ratline-continuation");
  }
  public handoffWorkerStartup(operationId: string, expectedBindingSha256: string): Promise<CurrentPcbWorkerStartupHandoff> {
    return this.handoffStartup(operationId, expectedBindingSha256);
  }
  public openWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<CurrentPcb209WorkerStartupOpeningResult> {
    return this.openStartup(operationId, expectedBindingSha256, input, "209-startup-ratline-continuation");
  }
  public requireWorkerStartup(operationId: string, expectedBindingSha256: string,
    result: CurrentPcb209WorkerStartupOpeningResult): Promise<CurrentPcb209WorkerStartupTransport> {
    return this.requireStartup(operationId, expectedBindingSha256, result);
  }
  /** Data-only validation entrypoint. Native capabilities stay in the original
   * coordinator, and either stage's consumed intent forbids capture replay. */
  public async captureWorkerStartup(operationId: string, expectedBindingSha256: string, input: unknown): Promise<Record<string, unknown>> {
    const request = startupCaptureInputSchema.parse(input);
    await this.handoffStartup(operationId, expectedBindingSha256);
    const result = await this.openStartup(operationId, expectedBindingSha256, request, "209-startup-ratline-continuation");
    return { ...structuredClone(result), operationId, validationOnly: true, saveAuthorized: false };
  }
  public observeWorkerStartupAssignments(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupAssignments(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupActor(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupActor(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupChannel(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupChannel(operationId, expectedBindingSha256);
  }
  public observeWorkerStartupRatlineContinuation(operationId: string, expectedBindingSha256: string): Promise<Record<string, unknown>> {
    return this.observeStartupRatlineContinuation(operationId, expectedBindingSha256);
  }
}
