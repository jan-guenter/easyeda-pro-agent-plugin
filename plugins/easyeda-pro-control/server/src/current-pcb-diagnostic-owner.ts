/** Separate validation-only diagnostic launch path.
 * Its retained helper owns the original process, non-breakaway Job and pipes.
 * A diagnostic failure never ends stdin or closes an Electron pipe. The only
 * release path first proves original root and complete Job termination.
 * Browser discovery grants no frame, worker, script or CAD execution authority. */
/* oxlint-disable import/max-dependencies -- This owner composes separately audited native installation, fixed protocol, identity observation and original process/pipe cleanup boundaries. */
/* oxlint-disable max-classes-per-file -- Four fixed-purpose exported facades share an unexported retained owner core; exporting a configurable core would expose a purpose-selection bypass. */
import { currentProjectSaveProducerGuardCases } from "./current-project-save-producer-guard-protocol.ts";
import { qualifyCurrentProjectSaveProducerSource } from "./current-project-save-producer-source.ts";
import { qualifyCurrentProjectSaveProducerGuardSource } from "./current-project-save-producer-guard-source.ts";
import type { CurrentPcbViaSaveProducerPrefix, CurrentProjectSaveProducerPrefix, CurrentProjectSaveProducerPrefixBindings, CurrentSchematicDisplaySaveProducerPrefix } from "./current-project-save-producer-prefix.ts";
import { componentSpatialDiagnosticNativeRequest } from "./current-pcb-component-spatial-protocol.ts";
import { CURRENT_PCB_COMPONENT_SPATIAL_PROFILE, CURRENT_PCB_COMPONENT_SPATIAL_REQUEST_DERIVATION } from "./current-pcb-component-spatial-profile.ts";
import { assertOriginalGeneratedComponentFixtureOpenCheckpoint } from "./managed-component-fixture-generated-open-checkpoint.ts";
import type { GeneratedComponentFixtureOpenCheckpoint } from "./managed-component-fixture-generated-open-checkpoint.ts";
import { assertOriginalGeneratedComponentFixtureTarget } from "./managed-component-fixture-initial-sql.ts";
import type { QualifiedGeneratedComponentFixtureTarget } from "./managed-component-fixture-initial-sql.ts";
import { decodeGeneratedComponentFixtureRegistrationReply } from "./managed-component-fixture-registration-program.ts";
import { buildCurrentPcbComponentSpatialScene, requireOriginalCurrentPcbComponentSpatialScene } from "./current-pcb-component-spatial-scene.ts";
import type { CurrentPcb209ComponentPointResult } from "./current-pcb-209-component-point-read.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_SITES, qualifyCurrentProjectStructureTransportSource } from "./current-project-structure-transport-source.ts";
import { CURRENT_PROJECT_STRUCTURE_TRANSPORT_NATIVE_CAPTURE_LENGTH, validateCurrentProjectStructureTransportCommand } from "./current-project-structure-transport-protocol.ts";
import type { CurrentPcbViaStructureTransportOrigin, CurrentProjectStructureBodyReservation, CurrentProjectStructureBodyReservationValue, CurrentProjectStructureMainPublication, CurrentProjectStructureMainPublicationValue, CurrentProjectStructureTransportBindings, CurrentProjectStructureTransportOrigin, CurrentSchematicDisplayStructureTransportOrigin } from "./current-project-structure-transport-origin.ts";
import type { CurrentSchematicDisplayAccessorBindings, CurrentSchematicDisplayAccessorOrigin } from "./current-schematic-display-accessor-origin.ts";
import { validateCurrentSchematicDisplayAccessorCommand } from "./current-schematic-display-accessor-protocol.ts";
import { currentGeneratedProjectHistorySqlBaseline } from "./current-generated-project-history-sql-baseline.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_SITES } from "./current-project-save-structure-source.ts";
import { decodeCurrentProjectSaveProducerNonprivateMode, validateCurrentProjectSaveStructureCommand } from "./current-project-save-structure-protocol.ts";
import type { CurrentProjectHistorySqlCompletion, CurrentProjectHistorySqlCompletionValue, CurrentProjectSaveStructureBindings, CurrentProjectSaveStructureOrigin } from "./current-project-save-structure-origin.ts";
import type { CurrentSchematicDisplayClockBindings, CurrentSchematicDisplayClockOrigin, CurrentSchematicDisplayClockRealm } from "./current-schematic-display-clock-origin.ts";
import { CURRENT_SCHEMATIC_DISPLAY_CLOCK_SITES, validateCurrentSchematicDisplayClockCommand } from "./current-schematic-display-clock-protocol.ts";
import type { CurrentSchematicDisplayClockCommand } from "./current-schematic-display-clock-protocol.ts";
import { compareGeneratedSchematicDisplayEffect } from "./generated-schematic-display-effect-data.ts";
import type { GeneratedSchematicDisplayEffect } from "./generated-schematic-display-effect-data.ts";
import { CurrentSchematicDisplayWorkerController } from "./current-schematic-display-worker-controller.ts";
import type { CurrentSchematicDisplayWorkerChild } from "./current-schematic-display-worker-controller.ts";
import type { CurrentSchematicDisplayWorkerCommand } from "./current-schematic-display-worker-wire.ts";
import type { CurrentSchematicDisplayProjectSourceHeld } from "./current-schematic-display-worker-bootstrap.ts";
import { qualifyCurrentSchematicDisplaySaveSource } from "./current-schematic-display-save-source.ts";
import { decodeCurrentSchematicDisplaySaveBodyValue, decodeCurrentSchematicDisplaySaveBreakpoint } from "./current-schematic-display-save-replies.ts";
import type { CurrentSchematicDisplaySaveBodyValue } from "./current-schematic-display-save-replies.ts";
import type { CurrentSchematicDisplaySaveCommand } from "./current-schematic-display-save-protocol.ts";
import type { CurrentSchematicDisplaySaveWorkerBindings, CurrentSchematicDisplaySaveWorkerEvent, CurrentSchematicDisplaySaveWorkerOrigin } from "./current-schematic-display-save-origin.ts";
import { CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE, CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE } from "./current-schematic-display-write-native-profile.ts";
import { currentSchematicDisplayWriteNativeRequest } from "./current-schematic-display-write-protocol.ts";
import { validateGeneratedSchematicNavigation } from "./managed-schematic-fixture-opening-program.ts";
import { requireOriginalGeneratedSchematicDisplayNativeArguments } from "./generated-schematic-display-source.ts";
import type { GeneratedSchematicDisplayNativeArguments } from "./generated-schematic-display-source.ts";
import { generatedSchematicDisplayStageResultSchema } from "./generated-schematic-display.ts";
import type { GeneratedSchematicDisplayStageResult } from "./generated-schematic-display.ts";
import type { GeneratedSchematicDisplayDispatch } from "./generated-schematic-display-journal.ts";
import { assertOriginalGeneratedSchematicFixtureOpenCheckpoint, verifyGeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import type { GeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import type { CurrentPcbViaClockBindings, CurrentPcbViaClockOrigin, CurrentPcbViaClockRealm } from "./current-pcb-via-clock-origin.ts";
import { CURRENT_PCB_VIA_CLOCK_SITES, validateCurrentPcbViaClockCommand } from "./current-pcb-via-clock-protocol.ts";
import type { CurrentPcbViaClockCommand } from "./current-pcb-via-clock-protocol.ts";
import type { CurrentPcbViaWriteClosedEffects } from "./current-pcb-via-write-closed-effects.ts";
import type { CurrentProjectStructureSqlEffects } from "./current-project-structure-sql-effects.ts";
import type { CurrentProjectHistorySqlEffects } from "./current-project-history-sql-effects.ts";
import type { CurrentPcbViaMainBindings, CurrentPcbViaMainOrigin } from "./current-pcb-via-main-origin.ts";
import { expectedCurrentGeneratedProjectSaveStructure } from "./current-project-save-structure-expectation.ts";
import { currentPcbViaMainStructureExpectedSchema } from "./current-pcb-via-main-structure-protocol.ts";
import { currentPcbViaMainStructureWire } from "./current-pcb-via-main-structure-wire.ts";
import type { CurrentPcbViaMainStructureCommand } from "./current-pcb-via-main-structure-protocol.ts";
import { decodeCurrentPcbViaMainStructureNativeAck } from "./current-pcb-via-main-structure-ack.ts";
import type { CurrentPcbViaMainStructureNativeWindow } from "./current-pcb-via-main-structure-ack.ts";
import { currentPcbViaMainHistoryWire } from "./current-pcb-via-main-history-wire.ts";
import type { CurrentPcbViaMainHistoryCommand } from "./current-pcb-via-main-history-protocol.ts";
import { decodeCurrentPcbViaMainHistoryNativeAck } from "./current-pcb-via-main-history-ack.ts";
import type { CurrentPcbViaMainHistoryNativeWindow } from "./current-pcb-via-main-history-ack.ts";
import { currentPcbViaMainBeginWire } from "./current-pcb-via-main-begin-wire.ts";
import type { CurrentPcbViaMainBeginCommand } from "./current-pcb-via-main-begin-protocol.ts";
import { currentPcbViaMainStepWire } from "./current-pcb-via-main-step-protocol.ts";
import type { CurrentPcbViaMainStepCommand } from "./current-pcb-via-main-step-protocol.ts";
import { currentPcbViaMainWire } from "./current-pcb-via-main-protocol.ts";
import type { CurrentPcbViaMainCommand } from "./current-pcb-via-main-protocol.ts";
import { compareCurrentPcbViaProjectedEffect } from "./current-pcb-via-write-effect-data.ts";
import type { CurrentPcbViaProjectedEffect } from "./current-pcb-via-write-effect-data.ts";
import { decodeCurrentPcbViaSdkMethod, decodeCurrentPcbViaSdkTuple, qualifyCurrentPcbViaSdkSource } from "./current-pcb-via-write-sdk-source.ts";
import type { CurrentPcbViaWorkerChild } from "./current-pcb-via-worker-controller.ts";
import type { CurrentPcbViaWorkerCommand } from "./current-pcb-via-worker-wire.ts";
import type { CurrentPcbViaSaveCommand } from "./current-pcb-via-save-protocol.ts";
import { CurrentPcbViaWorkerController } from "./current-pcb-via-worker-controller.ts";
import type { CurrentPcbViaProjectSourceHeld } from "./current-pcb-via-worker-bootstrap.ts";
import { decodeCurrentPcbViaSaveBreakpoint, decodeCurrentPcbViaSavePendingBodyValue } from "./current-pcb-via-save-replies.ts";
import type { CurrentPcbViaSavePendingBodyValue } from "./current-pcb-via-save-replies.ts";
import { compareCurrentPcbViaPendingSaveDelta } from "./current-pcb-via-save-delta.ts";
import type { CurrentPcbViaPendingSaveDelta } from "./current-pcb-via-save-delta.ts";
import { currentFootprintCopyClockRpcV2ArrayValue, decodeCurrentFootprintCopyClockRpcV2Array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { qualifyCurrentPcbViaSaveSource } from "./current-pcb-via-save-source.ts";
import type { CurrentPcbViaSaveWorkerBindings, CurrentPcbViaSaveWorkerEvent, CurrentPcbViaSaveWorkerOrigin } from "./current-pcb-via-save-origin.ts";
import { currentPcbViaWriteNativeRequest } from "./current-pcb-via-write-protocol.ts";
import type { CurrentPcbViaObservationPhase } from "./current-pcb-via-write-protocol.ts";
import { requireOriginalCurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import { consumeCurrentPcbViaWriteDispatch, enrollCurrentPcbViaWriteCreateIntent } from "./current-pcb-via-write-journal.ts";
import type { CurrentPcbViaCreateIntentEnrollment, CurrentPcbViaWriteDispatch } from "./current-pcb-via-write-journal.ts";
import type { CurrentPcbViaWriteStage } from "./current-pcb-via-write-program.ts";
import { currentPcbViaWriteStageResultSchema } from "./current-pcb-via-write-contract.ts";
import type { CurrentPcbViaWriteStageResult } from "./current-pcb-via-write-contract.ts";
import { CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE, CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE } from "./current-pcb-via-write-native-profile.ts";
import type { CurrentSelectedFileMainSqlFenceBootstrap } from "./current-selected-file-main-sql-fence-bootstrap.ts";
import { currentSelectedFileMainSqlFenceWire } from "./current-selected-file-main-sql-fence-native.ts";
import type { CurrentSelectedFileMainSqlFenceCommand } from "./current-selected-file-main-sql-fence-protocol.ts";
import { assertOriginalGeneratedFixtureOpenCheckpoint, verifyGeneratedFixtureOpenCheckpoint } from "./managed-fixture-generated-open-checkpoint.ts";
import type { GeneratedFixtureOpenCheckpoint } from "./managed-fixture-generated-open-checkpoint.ts";

import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { assertOriginalGeneratedPcbReadTarget as assertOriginalGeneratedFixtureTarget } from "./managed-pcb-fixture-read-target.ts";
import type { QualifiedGeneratedPcbReadTarget as QualifiedGeneratedFixtureTarget } from "./managed-pcb-fixture-read-target.ts";
import { decodeGeneratedFixtureRegistrationReply } from "./managed-fixture-registration-program.ts";
import { lstat, readFile, realpath } from "node:fs/promises";
import process from "node:process";
import { types } from "node:util";
import { PassThrough, Writable } from "node:stream";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { ORDINARY_LAUNCH_209_PROFILE } from "./ordinary-launch-209-profile.ts";
import { CurrentFootprintCombinedDiscoveryPipe, CurrentFootprintCopyForwardDiscoveryPipe, CurrentFootprintCopyForwardSavedDiscoveryPipe, CurrentFootprintHeldCacheDiagnosticPipe, CurrentPcbComponentSpatialPipe, CurrentPcbDiagnosticPipe, CurrentPcbStringPrecreatePipe, CurrentPcbViaWritePipe, CurrentPcbWorkerStartupDiscoveryPipe, CurrentSchematicDisplayWritePipe, decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-pipe.ts";
import type { CurrentPcbDiagnosticFailureObservation } from "./current-pcb-diagnostic-pipe.ts";
import { CurrentPcbSpatialPipe, spatialDiagnosticNativeRequest } from "./current-pcb-spatial-pipe.ts";
import { CURRENT_PCB_SPATIAL_ARC_REQUEST_DERIVATION, CURRENT_PCB_SPATIAL_PAD_REQUEST_DERIVATION, CURRENT_PCB_SPATIAL_PROFILE, CURRENT_PCB_SPATIAL_REQUEST_DERIVATION, CURRENT_PCB_SPATIAL_TRACK_REQUEST_DERIVATION } from "./current-pcb-spatial-profile.ts";
import { CURRENT_PCB_209_SPATIAL_SOURCE_PROFILE } from "./current-pcb-209-spatial-source-profile.ts";
import { CurrentPcbSpatialCaptureRunner } from "./current-pcb-spatial-capture-runner.ts";
import type { CurrentPcb209SpatialResult } from "./current-pcb-209-spatial-read.ts";
import type { CurrentPcb209SpatialTrackResult } from "./current-pcb-209-spatial-track-read.ts";
import type { CurrentPcb209SpatialArcResult } from "./current-pcb-209-spatial-arc-read.ts";
import type { CurrentPcb209SpatialPadResult } from "./current-pcb-209-spatial-pad-read.ts";
import { DIAGNOSTIC_REQUEST_LIMIT, combinedDiagnosticNativeRequest, diagnosticNativeRequest, heldCacheDiagnosticNativeRequest, stringPrecreateNativeRequest, visualDiagnosticNativeRequest } from "./current-pcb-diagnostic-protocol.ts";
import { CurrentPcbDiagnosticContext, diagnosticBoundedObservation, diagnosticTargetInventory, diagnosticTargetSummary,
  validateDiagnosticFrameExpectation, validateDiagnosticScriptProfile } from "./current-pcb-diagnostic-context.ts";
import type { DiagnosticFrameExpectation, DiagnosticScriptProfile } from "./current-pcb-diagnostic-context.ts";
import { CurrentPcbDiagnosticWorkerContext } from "./current-pcb-diagnostic-worker-context.ts";
import type { DiagnosticWorkerScriptProfile } from "./current-pcb-diagnostic-worker-context.ts";
import { qualifyCurrentPcb209StartupActorInstallation, verifyCurrentPcb209DiagnosticFacade, verifyCurrentPcb209DiagnosticInstallation, verifyCurrentPcb209RatlineFacade, verifyCurrentPcb209RatlineInstallation, verifyCurrentPcb209WorkerBootstrapInstallation, verifyCurrentPcbDiagnosticFacade, verifyCurrentPcbDiagnosticInstallation, verifyCurrentSelectedFileMainSqlFenceInstallation } from "./current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallation, CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { currentDisposableOpenSealedTargetSchema, currentDisposableOpenTargetSchema } from "./current-disposable-open.ts";
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
import type { CurrentFootprintCopyDocumentClockWindow, CurrentFootprintCopyWindowsClockObservation, CurrentFootprintCopyWindowsClockPhase, CurrentFootprintCopyWindowsClockTransport, CurrentFootprintCopyWindowsClockWindow } from "./current-footprint-copy-windows-clock.ts";
import { CurrentPcbStringNativeClockIssuer } from "./current-pcb-string-native-clock.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentWindowFailureAction, currentWindowFailureLabelOnly, decodeCurrentWindowFailure } from "./current-pcb-diagnostic-window-failure.ts";
import type { CurrentWindowFailure, CurrentWindowFailureAction } from "./current-pcb-diagnostic-window-failure.ts";
import { CURRENT_WINDOW_RESTORE_LIMITS, decodeCurrentWindowRestore, requireCurrentWindowRestoreReadiness } from "./current-pcb-diagnostic-window-restore.ts";
import { decodeCurrentWindowResize, requireCurrentWindowResizeReadiness } from "./current-pcb-diagnostic-window-resize.ts";
import { CURRENT_WINDOW_CAPTURE_READINESS_LIMITS, currentWindowCaptureReadiness } from "./current-pcb-diagnostic-window-capture-readiness.ts";
import { CURRENT_WINDOW_CAPTURE_TRANSPORT_RESERVATION, CurrentWindowCaptureTransportBudget } from "./current-pcb-diagnostic-window-capture-budget.ts";
import { CURRENT_PCB_DIAGNOSTIC_TRANSPORT_LIMITS as TRANSPORT } from "./current-pcb-diagnostic-transport-limits.ts";
import { CURRENT_RENDERER_CAPTURE_LIMITS, decodeCurrentRendererCapture } from "./current-pcb-diagnostic-renderer-capture.ts";
import { CurrentRendererCaptureTransportBudget } from "./current-pcb-diagnostic-renderer-capture-budget.ts";
import { CURRENT_WINDOW_CAPTURE_LIMITS, decodeCurrentWindowCapture } from "./current-pcb-diagnostic-window-capture.ts";
import type { CurrentPcbStringNativeClockObservation, CurrentPcbStringNativeClockPhase } from "./current-pcb-string-native-clock.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CurrentFootprintCombinedStartupChannel, CurrentFootprintCopyExecutionChannel, CurrentFootprintCopyForwardSavedStartupChannel, CurrentFootprintCopyForwardStartupChannel, CurrentFootprintCopyHeldSavedStartupChannel, CurrentFootprintCopyPreparationChannel, CurrentFootprintCopySavedChannel, CurrentFootprintForwardExecutionStartupChannel, CurrentPcb209WorkerStartupChannel, CurrentPcbWorkerStartupChannel, CurrentProjectStructureStartupChannel,
  beginCurrentFootprintCopyClockRpcChannel, prepareCurrentFootprintCopyClockRpcChannel, requireOriginalProjectStructurePrefixCapacity } from "./current-pcb-worker-startup-channel.ts";
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
import { requireCurrentFootprintCopyClockRpcRegistrationLease } from "./current-footprint-copy-clock-registration-runner.ts";
import { requireCurrentFootprintCopyClockRpcConstructionLease } from "./current-pcb-worker-construction-runner.ts";
import { prepareCurrentFootprintCopyClockRpcTransport, requireCurrentFootprintCopyClockRpcTransportHandoff } from "./current-pcb-worker-startup-transport.ts";
import { requireCurrentFootprintCopyClockRpcHandoffHeadroom } from "./current-footprint-copy-clock-rpc-budget.ts";
import type { CurrentFootprintCopyClockRpcCommand } from "./current-footprint-copy-clock-rpc-protocol.ts";
import type { CurrentFootprintCopyClockRpcConstructionLease } from "./current-footprint-copy-clock-rpc-leases.ts";
import type { CurrentFootprintCopyClockRegistrationCommand } from "./current-footprint-copy-clock-registration-contract.ts";
import { CurrentFootprintSavedCacheRunner } from "./current-footprint-saved-cache-runner.ts";
import type { CurrentFootprintSavedCacheObservation } from "./current-footprint-saved-cache-runner.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_PROBE_LIMITS } from "./current-footprint-saved-cache-probe.ts";
import type { CurrentFootprintSavedCacheCommand } from "./current-footprint-saved-cache-protocol.ts";
import { CurrentFootprintSavedCacheAccessorRunner } from "./current-footprint-saved-cache-accessor-runner.ts";
import type { CurrentFootprintSavedCacheAccessorObservation } from "./current-footprint-saved-cache-accessor-runner.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_LIMITS } from "./current-footprint-saved-cache-accessor-probe.ts";
import type { CurrentFootprintSavedCacheAccessorCommand } from "./current-footprint-saved-cache-accessor-protocol.ts";
import { CurrentFootprintCopyUiRunner } from "./current-footprint-copy-ui-runner.ts";
import type { CurrentFootprintCopyUiCommand } from "./current-footprint-copy-ui-command.ts";
import type { CurrentFootprintCopyUiObservation } from "./current-footprint-copy-ui-runner.ts";
import { qualifyCurrentFootprintCopyUiSource, requireCurrentFootprintCopyUiSource } from "./current-footprint-copy-ui-source.ts";
import type { CurrentFootprintCopyUiSourceQualification } from "./current-footprint-copy-ui-source.ts";
import { bindCurrentFootprintCopyParentRoute } from "./current-footprint-copy-parent-route.ts";
import { CurrentFootprintCopyHeldSavedStartupOpening, CurrentFootprintCopySavedStartupOpening, CurrentPcb209WorkerStartupOpening, originalCurrentFootprintCopyParentPeer, requireCurrentFootprintCopyOpening } from "./current-pcb-209-worker-startup-opening.ts";
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
import { CURRENT_PCB_209_VISUAL_RESULT_BYTES, currentPcb209VisualOperationSchema, decodeCurrentPcb209VisualReply } from "./current-pcb-209-visual-actions.ts";
import { issueCurrentPcbDiagnosticNativeRefusal } from "./current-pcb-diagnostic-native-refusal.ts";
import type { CurrentPcb209VisualOperation } from "./current-pcb-209-visual-actions.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "./current-pcb-209-opening-profile.ts";
import { controlDataDirectory, controlRootCapability } from "./artifacts.ts";
import { verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { loadRuntimeMachineProfile } from "./machine-profile.ts";
import { verifyCurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import type { CurrentFootprintHeadAgeValidationBinding } from "./current-footprint-head-age-validation.ts";
import { currentFootprintHeadAgeValidationIdSchema } from "./current-footprint-head-age-validation-schema.ts";
import { prepareCurrentFootprintHeadAgeSqlHead, requireCurrentFootprintHeadAgeSqlHead } from "./current-footprint-head-age-sql.ts";
import type { CurrentFootprintHeadAgeSqlHead } from "./current-footprint-head-age-sql.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_NATIVE_LIMITS, currentFootprintHeadAgeNativeWire } from "./current-footprint-head-age-native.ts";
import { captureCurrentFootprintHeadAgeReply } from "./current-footprint-head-age-main.ts";
import type { CurrentFootprintHeadAgeBootstrapCapability } from "./current-footprint-head-age-context.ts";
import { compareCurrentFootprintHeadAgeObservation } from "./current-footprint-head-age-observation.ts";
import type { CurrentFootprintHeadAgeObservation } from "./current-footprint-head-age-observation.ts";
import type { CurrentFootprintHeldCacheValidationBinding } from "./current-footprint-held-cache-validation.ts";
import { currentFootprintHeldCacheValidationIdSchema } from "./current-footprint-held-cache-validation-schema.ts";
import { CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_PROFILE } from "./current-footprint-held-cache-diagnostic-profile.ts";
import type { CURRENT_FOOTPRINT_HELD_CACHE_PAGE_READINESS_V3 } from "./current-footprint-held-cache-diagnostic-profile.ts";
import { CurrentFootprintHeldCachePageReadiness } from "./current-footprint-held-cache-page-readiness.ts";
import { issueCurrentFootprintHeldCacheFrameTargetTransition } from "./current-footprint-held-cache-frame-transition.ts";
import type { CurrentFootprintHeldCacheStartupObservation } from "./current-footprint-held-cache-page-readiness.ts";
import { join } from "node:path";
import { requireCurrentFootprintCopyOwned } from "./current-footprint-copy-preparation-runtime.ts";
import type { CurrentFootprintCopyPreparation } from "./current-footprint-copy-preparation.ts";
// oxlint-disable-next-line import/no-cycle -- The native owner consumes only its original footprint snapshot/guard registry; imports are used after construction.
import { requireCurrentFootprintCopyClosedSnapshot } from "./current-footprint-copy-closed-snapshot.ts";
// oxlint-disable-next-line import/no-cycle -- The native owner consumes only its original footprint snapshot/guard registry; imports are used after construction.
import { revalidateCurrentFootprintCopySavedOpenGuard } from "./current-footprint-copy-saved-generation.ts";
import type { CurrentFootprintCopySavedOpenGuard } from "./current-footprint-copy-saved-generation.ts";
import { currentFootprintCopySavedQueueCommand, decodeCurrentFootprintCopySavedQueueReply } from "./current-footprint-copy-saved-queue.ts";
import { CurrentFootprintSavedCacheHeldRunner } from "./current-footprint-saved-cache-held-runner.ts";
import type { CurrentFootprintSavedCacheHeldObservation } from "./current-footprint-saved-cache-held-runner.ts";
import type { CurrentFootprintSavedCacheHeldCommand } from "./current-footprint-saved-cache-held-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_HELD_SAVED_PROFILE } from "./current-footprint-copy-held-saved-profile.ts";
import { CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY, CurrentFootprintCopyHeldSavedResourceLedger,
  requireOriginalHeldSavedLedgerBinding } from "./current-footprint-copy-held-saved-capacity.ts";
import type { CurrentFootprintCopyHeldSavedLedgerBinding } from "./current-footprint-copy-held-saved-capacity.ts";
// oxlint-disable-next-line import/no-cycle -- The private guard revalidates its retained issuer only after original allocation.
import { revalidateCurrentFootprintCopyHeldSavedOpenGuard } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentFootprintCopyHeldSavedOpenGuard } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentFootprintCopyV2SavedProjection } from "./current-footprint-copy-v2-saved-source.ts";
import { currentFootprintCopyV2SavedTarget } from "./current-footprint-copy-v2-saved-source.ts";
import type { CurrentFootprintCopyStatePacket } from "./current-footprint-copy-state.ts";
import type { CurrentFootprintCopySourceReadTransport } from "./current-footprint-copy-source-read-runner.ts";
import { currentFootprintCopyMainBackendWire } from "./current-footprint-copy-main-backend-wire.ts";
import type { CurrentFootprintCopyMainBackendCommand } from "./current-footprint-copy-main-backend-contract.ts";
import { currentFootprintCopyMainRequestWire } from "./current-footprint-copy-main-request-wire.ts";
import { currentFootprintCopyMainCompletionWire } from "./current-footprint-copy-main-completion-wire.ts";
import type { CurrentFootprintCopyMainCompletionCommand } from "./current-footprint-copy-main-completion-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS } from "./current-footprint-copy-main-completion-protocol.ts";
import { requireCurrentFootprintCopyMainCompletionHeadroom } from "./current-footprint-copy-main-capacity.ts";
import type { CurrentFootprintCopyMainRequestCollectCommand } from "./current-footprint-copy-main-request-protocol.ts";
import type { CurrentProjectStructureMainCommand } from "./current-project-structure-main-protocol.ts";
import { CURRENT_FOOTPRINT_COMBINED_PROFILE, CURRENT_FOOTPRINT_COMBINED_PURPOSE } from "./current-footprint-copy-combined-profile.ts";
import { CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE, CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE } from "./current-footprint-copy-forward-profile.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE } from "./current-footprint-forward-execution-contract.ts";
import { captureCurrentFootprintForwardColdNativeGraph } from "./current-footprint-forward-cold-native-graph.ts";
// oxlint-disable-next-line import/no-cycle -- The original published v2 capability resolves this exact native receiver only after construction.
import { requireCurrentFootprintForwardExecutionMainNativeOwner } from "./current-footprint-forward-execution-main-capability.ts";
import type { CurrentFootprintForwardExecutionMainCapability, CurrentFootprintForwardExecutionMainMode } from "./current-footprint-forward-execution-main-capability.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_BIRTH_PROFILE } from "./current-footprint-forward-execution-profile.ts";
import { CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY, CURRENT_FOOTPRINT_FORWARD_EXECUTION_CAPACITY, CurrentFootprintCopyForwardResourceLedger, requireOriginalForwardLedgerBinding } from "./current-footprint-copy-forward-capacity.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_REQUESTS, CURRENT_FOOTPRINT_COPY_SOURCE_SEAL_REQUESTS } from "./current-footprint-copy-preparation.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS } from "./current-footprint-copy-source-stage-budget.ts";
import type { CurrentFootprintCopyForwardRole } from "./current-footprint-copy-forward-capacity.ts";
import { CurrentFootprintCopyForwardMainAccounting } from "./current-footprint-copy-forward-main-accounting.ts";
import type { CurrentFootprintForwardExecutionInputOrigin, CurrentFootprintForwardExecutionInputs } from "./current-footprint-forward-execution-origin.ts";
import { CURRENT_FOOTPRINT_COMBINED_READY, decodeCurrentFootprintCombinedReady } from "./current-footprint-combined-ready.ts";
import type { CurrentFootprintCombinedBeforeLaunchFailureProof, CurrentFootprintCombinedFactoryFailureDiagnostics, CurrentFootprintCombinedReadyPacket } from "./current-footprint-combined-ready.ts";
import type { CurrentFootprintCopyClockRpcOriginBindings } from "./current-footprint-copy-clock-rpc-origin.ts";

import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT } from "./current-footprint-copy-main-transport-contract.ts";
// oxlint-disable-next-line import/no-cycle -- This owner constructs the sole main runner; the runner invokes original factory guards only after construction. No owner class or guard is read at module initialization.
import { CurrentFootprintCopyMainBackendRunner, requireOriginalCurrentFootprintForwardMainPollRetainer, requireOriginalCurrentFootprintForwardMainRunner } from "./current-footprint-copy-main-backend-runner.ts";
import { CURRENT_FOOTPRINT_FORWARD_NATIVE_MAIN_LIMITS } from "./current-footprint-forward-native-limits.ts";
import type { CurrentFootprintCopyMainBackendObservation } from "./current-footprint-copy-main-backend-runner.ts";
import { CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE, CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE } from "./current-project-structure-native-profile.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS as STRUCTURE_MAIN_CONSTRUCTION } from "./current-footprint-copy-main-backend-budget.ts";
import { currentProjectStructureMainWire } from "./current-project-structure-main-wire.ts";
import type { CurrentProjectStructureMainCapability } from "./current-project-structure-main-capability.ts";
import { requireCurrentProjectStructureWorkerLease } from "./current-project-structure-worker-lease.ts";
import type { CurrentProjectStructureWorkerLease } from "./current-project-structure-worker-lease.ts";
import type { CurrentProjectStructureObservationWorkflow as StructureWorkflow } from "./current-project-structure-observation-workflow.ts";


const HELPER_SHA256 = "032d5af5a87b92b56addc1d711907ebb67918578fd80b32ba00c4d2d10bfc54e";
const HELPER_BYTES = 1_752_275;
const heldRunnerDescriptors = Object.getOwnPropertyDescriptors(CurrentFootprintSavedCacheHeldRunner.prototype);
/* oxlint-disable typescript/unbound-method -- Retain fixed methods and invoke them only on the original private-field runner. */
const heldRunnerMethods = Object.freeze({ prepare: CurrentFootprintSavedCacheHeldRunner.prototype.prepare,
  first: CurrentFootprintSavedCacheHeldRunner.prototype.observeFirst, fresh: CurrentFootprintSavedCacheHeldRunner.prototype.observeFresh,
  release: CurrentFootprintSavedCacheHeldRunner.prototype.release, retained: CurrentFootprintSavedCacheHeldRunner.prototype.retained });
/* oxlint-enable typescript/unbound-method */
const MAX_LINE = TRANSPORT.maximumHelperLineBytes;
// 64 MiB native bytes need at most 85.34 MiB base64 plus bounded poll envelopes.
const MAX_TOTAL = TRANSPORT.maximumHelperStdoutBytes;
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
// oxlint-disable-next-line typescript/unbound-method -- Invoke only with the genuine forward channel retained by this original owner.
const classifyForwardRequest = CurrentFootprintCopyForwardStartupChannel.prototype.classifyForwardRequest;
// oxlint-disable-next-line typescript/unbound-method -- Invoke only with the genuine forward channel retained by this original owner.
const forwardPollWaiting = CurrentFootprintCopyForwardStartupChannel.prototype.forwardPollWaiting;
// oxlint-disable-next-line typescript/unbound-method -- Invoke only on this genuine factory's retained private-field v2 channel.
const forwardExecutionChannelStatus = CurrentFootprintForwardExecutionStartupChannel.prototype.status;


type RecordValue = Record<string, unknown>;

type OwnerPurpose = "pcb-component-spatial209" | typeof CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE | typeof CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE | "pcb-spatial209" | "footprint-head-age209" | "footprint-held-cache209" | "worker-startup-footprint-held-saved209" | "visual209" | "diagnostic" | "diagnostic209" | "string-precreate" | "worker-startup" | "worker-startup209" | "worker-startup-footprint209" | "worker-startup-footprint-copy209" | "worker-startup-footprint-saved209" | "worker-startup-footprint-main209" | typeof CURRENT_FOOTPRINT_COMBINED_PURPOSE | typeof CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE | typeof CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE | typeof CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE | "worker-startup-empty209" | "worker-startup-ratline209" | "worker-startup-ratline-continuation209";
function selectedFileMainPurpose(purpose: OwnerPurpose): boolean { return purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE || purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE; }
function selectedFileMainLimits(purpose: OwnerPurpose): Readonly<{ normal: number; cleanup: number; total: number }> {
  if (purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE) { return CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE.main; }
  if (purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE) { return CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE.main; } throw error("SELECTED_MAIN_PURPOSE");
}
function heldCachePurpose(purpose: OwnerPurpose): boolean {
  return purpose === "worker-startup-footprint-held-saved209" || purpose === "footprint-held-cache209";
}
function bornFootprintTransport(purpose: OwnerPurpose): boolean {
  return purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE || purpose === CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE || forwardBirthPurpose(purpose);
}
function forwardBirthPurpose(purpose: OwnerPurpose): boolean {
  return purpose === CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE || purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE;
}
function footprintCopyObservationPurpose(purpose: OwnerPurpose): boolean {
  return purpose === "worker-startup-footprint-copy209" || bornFootprintTransport(purpose);
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
  readonly channel: CurrentPcbWorkerStartupChannel | CurrentPcb209WorkerStartupChannel | CurrentFootprintCopyPreparationChannel | CurrentFootprintCopyExecutionChannel | CurrentFootprintCombinedStartupChannel | CurrentFootprintCopyForwardStartupChannel | CurrentFootprintCopyForwardSavedStartupChannel | CurrentFootprintCopySavedChannel | CurrentFootprintCopyHeldSavedStartupChannel | CurrentPcb209EmptyStartupChannel | CurrentPcb209RatlineContinuationChannel | CurrentPcb209RatlineStartupChannel;
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
const mainNativeActions = ["head-age-main", "head-age-abort", "main-attach", "main-reprove", "main-send", "structure-main-send", "main-request-send", "main-completion-begin", "main-completion-send", "main-completion-retire", "main-poll", "main-close-detach", "main-terminate", "combined-abort"] as const;
type MainNativeAction = typeof mainNativeActions[number];
interface ForwardExecutionMainRequest {
  readonly capability: CurrentFootprintForwardExecutionMainCapability;
  readonly runner: CurrentFootprintCopyMainBackendRunner;
  readonly mode: CurrentFootprintForwardExecutionMainMode;
  readonly retainChunk?: (chunk: string) => void;
}
interface ForwardExecutionMainPoll {
  readonly id: string; readonly runner: CurrentFootprintCopyMainBackendRunner; readonly retain: (chunk: string) => void;
  buffer: Buffer; complete: boolean; delivered: boolean; failure: Error | null;
}
interface Pending {
  readonly id: string; readonly resolve: (value: RecordValue) => void; readonly reject: (error: Error) => void;
  readonly timer: ReturnType<typeof setTimeout>; readonly launch: boolean; readonly send: boolean; readonly poll: boolean;
  readonly windowAction: CurrentWindowFailureAction | null; windowFailure: CurrentWindowFailure | null; readonly windowRestore: boolean; readonly windowCapture: boolean; readonly windowResize: boolean; readonly mainAction: MainNativeAction | null; readonly combinedCleanup: boolean;
  readonly forwardCleanup: boolean; readonly forwardPollWaiting: boolean; readonly forwardMainPoll: ForwardExecutionMainPoll | null; written: boolean; reply: RecordValue | null;
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
function decodeNativeBinding(value: RecordValue): Binding {
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
export type CurrentFootprintCopyGenerationOwner = CurrentFootprintCopyNativeOwner | CurrentFootprintCopySavedNativeOwner | CurrentFootprintCopyForwardNativeOwner | CurrentFootprintCopyForwardSavedNativeOwner;
const footprintSavedAllocations = new WeakMap<CurrentFootprintCopyNativeOwner, CurrentFootprintCopySavedNativeOwner>();
const footprintSavedAllocationAttempts = new WeakSet<CurrentFootprintCopyNativeOwner>();
const footprintSavedAllocationStates = new WeakMap<CurrentFootprintCopyNativeOwner, "pending" | "no-resource" | "unresolved">();
const footprintFactories = new WeakMap<object, Readonly<{ options: CurrentPcbDiagnosticInstallationOptions; installation: CurrentPcbDiagnosticInstallation }>>();
const savedSuccessorAttempts = new WeakSet<object>();
const heldSavedAllocations = new WeakMap<CurrentFootprintCopyNativeOwner, CurrentFootprintCopyHeldSavedNativeOwner>();
const heldSavedAllocationStates = new WeakMap<CurrentFootprintCopyNativeOwner, "pending" | "no-resource" | "unresolved">();
interface HeldCacheValidationAllocation {
  readonly binding: CurrentFootprintHeldCacheValidationBinding;
  readonly text: string;
  readonly completion: ReturnType<typeof readerCompletion>;
  status: "pending" | "no-resource" | "unresolved" | "retained";
  owner: CurrentFootprintHeldCacheValidationOwner | null;
}
const heldCacheValidationAllocations = new WeakMap<CurrentFootprintHeldCacheValidationBinding, HeldCacheValidationAllocation>();
const heldCacheValidationOperationIds = new Set<string>();
const heldCacheValidationFactories = new WeakMap<CurrentFootprintHeldCacheValidationOwner, Readonly<{
  allocation: HeldCacheValidationAllocation;
  options: CurrentPcbDiagnosticInstallationOptions;
  installation: CurrentPcbDiagnosticInstallation;
}>>();
interface HeadAgeValidationAllocation {
  readonly binding: CurrentFootprintHeadAgeValidationBinding;
  readonly text: string;
  readonly completion: ReturnType<typeof readerCompletion>;
  head: CurrentFootprintHeadAgeSqlHead | null;
  status: "pending" | "no-resource" | "unresolved" | "retained";
  owner: CurrentFootprintHeadAgeValidationOwner | null;
}
const headAgeValidationAllocations = new WeakMap<CurrentFootprintHeadAgeValidationBinding, HeadAgeValidationAllocation>();
const headAgeValidationOperationIds = new Set<string>();
const headAgeValidationFactories = new WeakMap<CurrentFootprintHeadAgeValidationOwner, Readonly<{
  allocation: HeadAgeValidationAllocation;
  options: CurrentPcbDiagnosticInstallationOptions;
  installation: CurrentPcbDiagnosticInstallation;
}>>();
interface SchematicDisplayWriteAllocation { readonly options: CurrentPcbDiagnosticInstallationOptions; readonly prepared: GeneratedSchematicFixtureOpenCheckpoint; state: "pending" | "no-resource" | "unresolved" | "retained"; owner: CurrentSchematicDisplayWriteOwner | null; child: ForwardExecutionBirthAllocation["child"]; eofAttempted: boolean; cleanupFailure: unknown }
const schematicDisplayAllocations = new WeakMap<GeneratedSchematicFixtureOpenCheckpoint, SchematicDisplayWriteAllocation>();
const schematicDisplayFactories = new WeakMap<object, Readonly<{ allocation: SchematicDisplayWriteAllocation; installation: CurrentPcbDiagnosticInstallation }>>();
const schematicDisplayStagePackets = new WeakMap<object, Readonly<{ owner: object; argumentsValue: GeneratedSchematicDisplayNativeArguments; stage: string; text: string }>>();
function requireSchematicArguments(owner: object, value: GeneratedSchematicDisplayNativeArguments): GeneratedSchematicFixtureOpenCheckpoint {
  const original = schematicDisplayFactories.get(owner); if (original === undefined || original.allocation.owner !== owner || original.allocation.owner === null) { throw error("SCHEMATIC_DISPLAY_ORIGINAL_ARGUMENTS"); }
  assertOriginalCurrentSchematicDisplayWriteOwner(original.allocation.owner); requireOriginalGeneratedSchematicDisplayNativeArguments(value, original.allocation.prepared); return original.allocation.prepared;
}
/** Historical packet provenance only. Actual live dispatch separately rechecks
 * the original native generation, source/worker and retained SDK holder. */
export function requireOriginalSchematicDisplayStage(owner: CurrentSchematicDisplayWriteOwner, argumentsValue: GeneratedSchematicDisplayNativeArguments,
  packet: GeneratedSchematicDisplayStageResult, stage: GeneratedSchematicDisplayStageResult["stage"]): GeneratedSchematicDisplayStageResult {
  requireSchematicArguments(owner, argumentsValue); const original = schematicDisplayStagePackets.get(packet);
  if (original === undefined || original.owner !== owner || original.argumentsValue !== argumentsValue || original.stage !== stage || original.text !== canonicalJson(packet)) { throw error("SCHEMATIC_DISPLAY_ORIGINAL_STAGE"); } return packet;
}
interface OriginalSchematicDisplayEffect { readonly owner: CurrentSchematicDisplayWriteOwner; readonly argumentsValue: GeneratedSchematicDisplayNativeArguments; readonly before: GeneratedSchematicDisplayStageResult; readonly modified: GeneratedSchematicDisplayStageResult; readonly observed: GeneratedSchematicDisplayStageResult; readonly text: string }
const schematicDisplayEffectAttempts = new WeakSet<CurrentSchematicDisplayWriteOwner>();
const schematicDisplayEffects = new WeakMap<GeneratedSchematicDisplayEffect, OriginalSchematicDisplayEffect>();
function compareOriginalSchematicDisplayEffect(original: Omit<OriginalSchematicDisplayEffect, "text">): GeneratedSchematicDisplayEffect {
  requireSchematicArguments(original.owner, original.argumentsValue);
  const projected = compareGeneratedSchematicDisplayEffect(original.argumentsValue,
    requireOriginalSchematicDisplayStage(original.owner, original.argumentsValue, original.before, "preflight"),
    requireOriginalSchematicDisplayStage(original.owner, original.argumentsValue, original.modified, "modify"),
    requireOriginalSchematicDisplayStage(original.owner, original.argumentsValue, original.observed, "observe"));
  return freezeDeep({ ...projected, originalNativeStageProvenanceVerified: true });
}
/** One actual owner and the exact three native packet references. The inert
 * source comparator cannot issue this original effect or a clock/Save grant. */
export function qualifyOriginalGeneratedSchematicDisplayEffect(owner: CurrentSchematicDisplayWriteOwner, argumentsValue: GeneratedSchematicDisplayNativeArguments,
  before: GeneratedSchematicDisplayStageResult, modified: GeneratedSchematicDisplayStageResult, observed: GeneratedSchematicDisplayStageResult): GeneratedSchematicDisplayEffect {
  assertOriginalCurrentSchematicDisplayWriteOwner(owner);
  if (schematicDisplayEffectAttempts.has(owner)) { throw error("SCHEMATIC_DISPLAY_EFFECT_ORIGINAL_ISSUE_CONSUMED"); } schematicDisplayEffectAttempts.add(owner);
  const original = Object.freeze({ owner, argumentsValue, before, modified, observed }); const effect = compareOriginalSchematicDisplayEffect(original);
  schematicDisplayEffects.set(effect, Object.freeze({ ...original, text: canonicalJson(effect) })); return effect;
}
/** Historical provenance only; live dispatch additionally rechecks the
 * original native generation, current scene, source and retained SDK tuple. */
export function requireOriginalGeneratedSchematicDisplayEffect(effect: GeneratedSchematicDisplayEffect, owner: CurrentSchematicDisplayWriteOwner, argumentsValue: GeneratedSchematicDisplayNativeArguments): void {
  const original = schematicDisplayEffects.get(effect);
  if (original === undefined || original.owner !== owner || original.argumentsValue !== argumentsValue || original.text !== canonicalJson(effect) || canonicalJson(compareOriginalSchematicDisplayEffect(original)) !== original.text) { throw error("SCHEMATIC_DISPLAY_EFFECT_ORIGINAL_EFFECT"); }
}
export type CurrentSchematicDisplayAccessorSetup = (origin: CurrentSchematicDisplayAccessorOrigin) => Promise<void>;
const schematicDisplayAccessors = new WeakMap<CurrentSchematicDisplayAccessorOrigin, Readonly<{ owner: CurrentSchematicDisplayWriteOwner; argumentsValue: GeneratedSchematicDisplayNativeArguments; bindings: CurrentSchematicDisplayAccessorBindings; assertOriginal: () => void }>>();
export function requireOriginalCurrentSchematicDisplayAccessorOrigin(origin: CurrentSchematicDisplayAccessorOrigin, owner: CurrentSchematicDisplayWriteOwner, argumentsValue: GeneratedSchematicDisplayNativeArguments): CurrentSchematicDisplayAccessorBindings {
  const original = schematicDisplayAccessors.get(origin); if (original === undefined || original.owner !== owner || original.argumentsValue !== argumentsValue) { throw error("SCHEMATIC_DISPLAY_ACCESSOR_ORIGINAL"); }
  requireSchematicArguments(owner, argumentsValue); original.assertOriginal(); return original.bindings;
}
export type CurrentSchematicDisplayClockSetup = (origin: CurrentSchematicDisplayClockOrigin) => Promise<void>;
const schematicDisplayClocks = new WeakMap<CurrentSchematicDisplayClockOrigin, Readonly<{ owner: CurrentSchematicDisplayWriteOwner; argumentsValue: GeneratedSchematicDisplayNativeArguments; bindings: CurrentSchematicDisplayClockBindings; assertOriginal: () => void }>>();
export function requireOriginalCurrentSchematicDisplayClockOrigin(origin: CurrentSchematicDisplayClockOrigin, owner: CurrentSchematicDisplayWriteOwner, argumentsValue: GeneratedSchematicDisplayNativeArguments): CurrentSchematicDisplayClockBindings {
  const original = schematicDisplayClocks.get(origin); if (original === undefined || original.owner !== owner || original.argumentsValue !== argumentsValue) { throw error("SCHEMATIC_DISPLAY_CLOCK_ORIGINAL"); }
  requireSchematicArguments(owner, argumentsValue); original.assertOriginal(); return original.bindings;
}
export type CurrentSchematicDisplaySaveWorkerSetup = (origin: CurrentSchematicDisplaySaveWorkerOrigin) => Promise<void>;
const schematicDisplaySaveWorkers = new WeakMap<CurrentSchematicDisplaySaveWorkerOrigin, Readonly<{ owner: CurrentSchematicDisplayWriteOwner; argumentsValue: GeneratedSchematicDisplayNativeArguments;
  bindings: CurrentSchematicDisplaySaveWorkerBindings; source: CurrentSchematicDisplayProjectSourceHeld; controller: CurrentSchematicDisplayWorkerController; child: CurrentSchematicDisplayWorkerChild; assertOriginal: () => void }>>();
export function requireOriginalCurrentSchematicDisplaySaveWorkerOrigin(origin: CurrentSchematicDisplaySaveWorkerOrigin, owner: CurrentSchematicDisplayWriteOwner,
  argumentsValue: GeneratedSchematicDisplayNativeArguments): CurrentSchematicDisplaySaveWorkerBindings {
  const original = schematicDisplaySaveWorkers.get(origin); if (original === undefined || original.owner !== owner || original.argumentsValue !== argumentsValue) { throw error("SCHEMATIC_DISPLAY_ORIGINAL_SAVE_WORKER"); }
  requireSchematicArguments(owner, argumentsValue); original.assertOriginal(); return original.bindings;
}
const originalProjectSaveProducerPrefixes = new WeakMap<CurrentProjectSaveProducerPrefix, Readonly<{ owner: object; operation: object; bindings: CurrentProjectSaveProducerPrefixBindings; assertOriginal: () => void }>>();
export function requireOriginalCurrentProjectSaveProducerPrefix(token: CurrentProjectSaveProducerPrefix, owner: object, operation: object): CurrentProjectSaveProducerPrefixBindings {
  const original = originalProjectSaveProducerPrefixes.get(token);
  if (original === undefined || original.owner !== owner || original.operation !== operation) { throw error("PROJECT_SAVE_PRODUCER_ORIGINAL_PREFIX"); } original.assertOriginal(); return original.bindings;
}
export type CurrentProjectStructureTransportSetup = (origin: CurrentProjectStructureTransportOrigin) => Promise<void>;
const projectStructureTransportOrigins = new WeakMap<CurrentProjectStructureTransportOrigin, Readonly<{ owner: object; operation: object; bindings: CurrentProjectStructureTransportBindings; assertOriginal: () => void }>>();
// Only the genuine body/publication consumers populate these original maps.
const projectStructureTransportBodyGrants = new WeakMap<CurrentProjectStructureTransportOrigin, Readonly<{ reservation: CurrentProjectStructureBodyReservation; value: CurrentProjectStructureBodyReservationValue; assertCurrent: () => void }>>();
const projectStructureTransportPublicationGrants = new WeakMap<CurrentProjectStructureTransportOrigin, Readonly<{ publication: CurrentProjectStructureMainPublication; value: CurrentProjectStructureMainPublicationValue; assertCurrent: () => void }>>();
const projectSaveStructureBodyGrants = new WeakMap<CurrentProjectSaveStructureOrigin, Readonly<{ reservation: CurrentProjectStructureBodyReservation; value: CurrentProjectStructureBodyReservationValue; transportOrigin: CurrentProjectStructureTransportOrigin; assertCurrent: () => void }>>();
const projectSaveStructureHistoryGrants = new WeakMap<CurrentProjectSaveStructureOrigin, Readonly<{ completion: CurrentProjectHistorySqlCompletion; assertCurrent: () => void }>>();
interface OriginalStructureBody { readonly owner: object; readonly operation: object; readonly transportOrigin: CurrentProjectStructureTransportOrigin; readonly sharedOrigin: CurrentProjectSaveStructureOrigin; readonly value: CurrentProjectStructureBodyReservationValue; readonly assertCurrent: () => void; consumed: boolean }
interface OriginalStructurePublication { readonly owner: object; readonly operation: object; readonly transportOrigin: CurrentProjectStructureTransportOrigin; readonly sharedOrigin: CurrentProjectSaveStructureOrigin; readonly value: CurrentProjectStructureMainPublicationValue; readonly assertCurrent: () => void; consumed: boolean }
const originalStructureBodies = new WeakMap<CurrentProjectStructureBodyReservation, OriginalStructureBody>();
const originalStructurePublications = new WeakMap<CurrentProjectStructureMainPublication, OriginalStructurePublication>();
/** One synchronous original packet-release enrollment. Copies, a different
 * operation and a second release cannot recreate the original body authority. */
export function consumeOriginalCurrentProjectStructureBodyReservation(token: CurrentProjectStructureBodyReservation, owner: object, operation: object): CurrentProjectStructureBodyReservationValue {
  const original = originalStructureBodies.get(token);
  if (original === undefined || original.owner !== owner || original.operation !== operation || original.consumed || projectStructureTransportBodyGrants.has(original.transportOrigin) || projectSaveStructureBodyGrants.has(original.sharedOrigin) || projectSaveStructureHistoryGrants.has(original.sharedOrigin)) { throw error("PROJECT_STRUCTURE_BODY_ORIGINAL_RESERVATION"); }
  requireOriginalCurrentProjectStructureTransportOrigin(original.transportOrigin, owner, operation); requireOriginalCurrentProjectSaveStructureOrigin(original.sharedOrigin, owner, operation); original.assertCurrent(); original.consumed = true;
  projectStructureTransportBodyGrants.set(original.transportOrigin, Object.freeze({ reservation: token, value: original.value, assertCurrent: original.assertCurrent }));
  projectSaveStructureBodyGrants.set(original.sharedOrigin, Object.freeze({ reservation: token, value: original.value, transportOrigin: original.transportOrigin, assertCurrent: original.assertCurrent })); return original.value;
}
/** One actual original response-finalizer continuation, consumed before the
 * held worker send-return task resumes. This never grants another SQL slot. */
export function consumeOriginalCurrentProjectStructureMainPublication(token: CurrentProjectStructureMainPublication, owner: object, operation: object): CurrentProjectStructureMainPublicationValue {
  const original = originalStructurePublications.get(token);
  if (original === undefined || original.owner !== owner || original.operation !== operation || original.consumed || projectStructureTransportPublicationGrants.has(original.transportOrigin)) { throw error("PROJECT_STRUCTURE_PUBLICATION_ORIGINAL"); }
  const body = projectSaveStructureBodyGrants.get(original.sharedOrigin); if (body === undefined || body.transportOrigin !== original.transportOrigin) { throw error("PROJECT_STRUCTURE_PUBLICATION_ORIGINAL_BODY"); }
  requireOriginalCurrentProjectStructureTransportOrigin(original.transportOrigin, owner, operation); requireOriginalCurrentProjectSaveStructureOrigin(original.sharedOrigin, owner, operation); body.assertCurrent(); original.assertCurrent(); original.consumed = true;
  projectStructureTransportPublicationGrants.set(original.transportOrigin, Object.freeze({ publication: token, value: original.value, assertCurrent: original.assertCurrent })); return original.value;
}

export function requireOriginalCurrentProjectStructureTransportOrigin(origin: CurrentProjectStructureTransportOrigin, owner: object, operation: object): CurrentProjectStructureTransportBindings {
  const original = projectStructureTransportOrigins.get(origin); if (original === undefined || original.owner !== owner || original.operation !== operation) { throw error("PROJECT_STRUCTURE_TRANSPORT_ORIGINAL_ORIGIN"); }
  original.assertOriginal(); return original.bindings;
}
export function requireOriginalCurrentProjectStructureTransportBodyReservation(token: CurrentProjectStructureBodyReservation, origin: CurrentProjectStructureTransportOrigin, owner: object, operation: object): CurrentProjectStructureBodyReservationValue {
  requireOriginalCurrentProjectStructureTransportOrigin(origin, owner, operation); const original = projectStructureTransportBodyGrants.get(origin);
  if (original === undefined || original.reservation !== token) { throw error("PROJECT_STRUCTURE_TRANSPORT_BODY_RESERVATION"); } original.assertCurrent(); return original.value;
}
export function requireOriginalCurrentProjectStructureTransportMainPublication(token: CurrentProjectStructureMainPublication, origin: CurrentProjectStructureTransportOrigin, owner: object, operation: object): CurrentProjectStructureMainPublicationValue {
  requireOriginalCurrentProjectStructureTransportOrigin(origin, owner, operation); const original = projectStructureTransportPublicationGrants.get(origin);
  if (original === undefined || original.publication !== token) { throw error("PROJECT_STRUCTURE_TRANSPORT_MAIN_PUBLICATION"); } original.assertCurrent(); return original.value;
}
export type CurrentProjectSaveStructureSetup = (origin: CurrentProjectSaveStructureOrigin) => Promise<void>;
// Only the genuine same-owner history-SQL completion consumer populates this
// Registry after every original native callback and service await completed.
const projectSaveStructureOrigins = new WeakMap<CurrentProjectSaveStructureOrigin, Readonly<{ owner: object; operation: object; bindings: CurrentProjectSaveStructureBindings; assertOriginal: () => void }>>();
interface OriginalProjectHistorySqlCompletion { readonly owner: object; readonly operation: object; readonly origin: CurrentProjectSaveStructureOrigin; readonly value: CurrentProjectHistorySqlCompletionValue; readonly assertCurrent: () => void; consumed: boolean }
const projectHistorySqlCompletions = new WeakMap<CurrentProjectHistorySqlCompletion, OriginalProjectHistorySqlCompletion>();
function originalProjectStructureContinuation(origin: CurrentProjectSaveStructureOrigin, role: string, saving: boolean): Readonly<{ assertCurrent: () => void }> | null | undefined {
  if (role === "bootstrap" || role.startsWith("producer") || role.startsWith("startup") || !saving && (role === "initialFinally" || role === "queuedFinally")) { return null; }
  const history = projectSaveStructureHistoryGrants.get(origin); if (history !== undefined) { return history; }
  const body = projectSaveStructureBodyGrants.get(origin); if (role === "packet" || body === undefined) { return body; }
  return projectStructureTransportPublicationGrants.get(body.transportOrigin);
}
export function requireOriginalCurrentProjectStructureBodyReservationForSharedOrigin(token: CurrentProjectStructureBodyReservation, origin: CurrentProjectSaveStructureOrigin, owner: object, operation: object): CurrentProjectStructureBodyReservationValue {
  const grant = projectSaveStructureBodyGrants.get(origin), source = projectSaveStructureOrigins.get(origin);
  if (source === undefined || source.owner !== owner || source.operation !== operation || grant === undefined || grant.reservation !== token) { throw error("PROJECT_STRUCTURE_ORIGINAL_SHARED_BODY"); }
  source.assertOriginal(); grant.assertCurrent(); return grant.value;
}
export function requireOriginalCurrentProjectStructurePublicationForSharedOrigin(token: CurrentProjectStructureMainPublication, origin: CurrentProjectSaveStructureOrigin, owner: object, operation: object): CurrentProjectStructureMainPublicationValue {
  const body = projectSaveStructureBodyGrants.get(origin), grant = body === undefined ? undefined : projectStructureTransportPublicationGrants.get(body.transportOrigin), source = projectSaveStructureOrigins.get(origin);
  if (source === undefined || source.owner !== owner || source.operation !== operation || body === undefined || grant === undefined || grant.publication !== token) { throw error("PROJECT_STRUCTURE_ORIGINAL_SHARED_PUBLICATION"); }
  source.assertOriginal(); body.assertCurrent(); grant.assertCurrent(); return grant.value;
}
/** Consumed synchronously before the original worker resume is even awaited.
 * This grants only that origin's structure continuation, never an SDK Save. */
export function consumeOriginalCurrentProjectHistorySqlCompletion(token: CurrentProjectHistorySqlCompletion, owner: object, operation: object): CurrentProjectHistorySqlCompletionValue {
  const original = projectHistorySqlCompletions.get(token);
  if (original === undefined || original.owner !== owner || original.operation !== operation || original.consumed || projectSaveStructureHistoryGrants.has(original.origin)) { throw error("PROJECT_HISTORY_SQL_ORIGINAL_COMPLETION"); }
  const structure = projectSaveStructureOrigins.get(original.origin);
  if (structure === undefined || structure.owner !== owner || structure.operation !== operation) { throw error("PROJECT_HISTORY_SQL_ORIGINAL_STRUCTURE"); }
  original.assertCurrent(); structure.assertOriginal(); original.consumed = true;
  projectSaveStructureHistoryGrants.set(original.origin, Object.freeze({ completion: token, assertCurrent: original.assertCurrent })); return original.value;
}

/** The actual source-held callback of the original native birth is the only
 * issuer. Matching targets, old worker leases and caller bindings cannot join. */
export function requireOriginalCurrentProjectSaveStructureOrigin(origin: CurrentProjectSaveStructureOrigin, owner: object, operation: object): CurrentProjectSaveStructureBindings {
  const original = projectSaveStructureOrigins.get(origin);
  if (original === undefined || original.owner !== owner || original.operation !== operation) { throw error("PROJECT_SAVE_STRUCTURE_ORIGINAL_ORIGIN"); }
  original.assertOriginal(); return original.bindings;
}
const pcbViaTerminations = new WeakMap<object, Readonly<{ owner: CurrentPcbViaWriteOwner; binding: Binding }>>();
const schematicDisplayTerminations = new WeakMap<object, Readonly<{ owner: CurrentSchematicDisplayWriteOwner; binding: Binding }>>();
interface PcbViaWriteAllocation { readonly options: CurrentPcbDiagnosticInstallationOptions; readonly prepared: GeneratedFixtureOpenCheckpoint; state: "pending" | "no-resource" | "unresolved" | "retained"; owner: CurrentPcbViaWriteOwner | null; child: ForwardExecutionBirthAllocation["child"]; eofAttempted: boolean; cleanupFailure: unknown }
const pcbViaWriteAllocations = new WeakMap<GeneratedFixtureOpenCheckpoint, PcbViaWriteAllocation>();
const pcbViaWriteFactories = new WeakMap<object, Readonly<{ allocation: PcbViaWriteAllocation; installation: CurrentPcbDiagnosticInstallation }>>();
export type CurrentPcbViaSaveWorkerSetup = (origin: CurrentPcbViaSaveWorkerOrigin) => Promise<void>;
export type CurrentPcbViaClockSetup = (origin: CurrentPcbViaClockOrigin) => Promise<void>;
export type CurrentPcbViaMainSetup = (origin: CurrentPcbViaMainOrigin) => Promise<void>;
export interface CurrentPcbViaNativeObservation { readonly schema: "private.current-pcb-via-native-observation.v1"; readonly phase: CurrentPcbViaObservationPhase; readonly observations: Readonly<Record<string, unknown>> }
export interface CurrentPcbViaSceneObservation { readonly schema: "private.current-pcb-via-scene-observation.v1"; readonly phase: CurrentPcbViaObservationPhase; readonly observation: CurrentPcb209SpatialTrackResult }
const pcbViaPackets = new WeakMap<object, Readonly<{ owner: object; plan: CurrentPcbViaWritePlan; phase: string; kind: "native" | "scene" | "stage" }>>();
function originalProducerArgument(args: readonly unknown[], index: number): string {
  const argument = args[index]; if (!record(argument) || !exact(argument, ["objectId"]) || typeof argument["objectId"] !== "string" || !/^[A-Za-z\d_.:-]{1,256}$/u.test(argument["objectId"])) { throw error("PROJECT_SAVE_PRODUCER_ORIGINAL_ARGUMENT"); } return argument["objectId"];
}
function requireViaPlan(owner: object, plan: CurrentPcbViaWritePlan): void {
  const original = pcbViaWriteFactories.get(owner), preparation = requireOriginalCurrentPcbViaWritePlan(plan).prepared;
  if (original === undefined || original.allocation.prepared !== preparation || original.allocation.owner !== owner || original.allocation.state !== "retained") { throw error("PCB_VIA_ORIGINAL_PLAN"); }
  assertOriginalCurrentPcbViaWriteOwner(original.allocation.owner);
}
function requireViaPacket(owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan, packet: object, phase: string, kind: "native" | "scene" | "stage"): void {
  requireViaPlan(owner, plan); const original = pcbViaPackets.get(packet);
  if (original === undefined || original.owner !== owner || original.plan !== plan || original.phase !== phase || original.kind !== kind) { throw error("PCB_VIA_ORIGINAL_PACKET"); }
}
export function requireOriginalCurrentPcbViaNativeObservation(owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan, packet: CurrentPcbViaNativeObservation,
  phase: CurrentPcbViaObservationPhase): CurrentPcbViaNativeObservation["observations"] { requireViaPacket(owner, plan, packet, phase, "native"); return packet.observations; }
export function requireOriginalCurrentPcbViaSceneObservation(owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan, packet: CurrentPcbViaSceneObservation,
  phase: CurrentPcbViaObservationPhase): CurrentPcb209SpatialTrackResult { requireViaPacket(owner, plan, packet, phase, "scene"); return packet.observation; }
export function requireOriginalCurrentPcbViaWriteStage(owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan, packet: CurrentPcbViaWriteStageResult,
  phase: CurrentPcbViaWriteStage): CurrentPcbViaWriteStageResult { requireViaPacket(owner, plan, packet, phase, "stage"); return packet; }
// BEGIN original Via projected-effect custody.
export interface CurrentPcbViaWriteEffect {
  readonly schema: "private.current-pcb-via-write-effect.v1";
  readonly proof: CurrentPcbViaProjectedEffect;
}
export interface CurrentPcbViaWriteEffectObservations {
  readonly before: CurrentPcbViaNativeObservation; readonly after: CurrentPcbViaNativeObservation;
  readonly beforeScene: CurrentPcbViaSceneObservation; readonly afterScene: CurrentPcbViaSceneObservation;
  readonly createAcknowledgement: CurrentPcbViaWriteStageResult;
}
interface OriginalPcbViaWriteEffect { readonly owner: CurrentPcbViaWriteOwner; readonly plan: CurrentPcbViaWritePlan;
  readonly observations: CurrentPcbViaWriteEffectObservations; readonly text: string }
const pcbViaEffects = new WeakMap<CurrentPcbViaWriteEffect, OriginalPcbViaWriteEffect>();
const pcbViaEffectGenerations = new WeakMap<CurrentPcbViaWriteOwner, CurrentPcbViaWriteEffect>();
function compareOriginalPcbViaEffect(owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan, observations: CurrentPcbViaWriteEffectObservations): CurrentPcbViaProjectedEffect {
  const original = requireOriginalCurrentPcbViaWritePlan(plan);
  return compareCurrentPcbViaProjectedEffect(plan, original.history,
    requireOriginalCurrentPcbViaNativeObservation(owner, plan, observations.before, "before"),
    requireOriginalCurrentPcbViaNativeObservation(owner, plan, observations.after, "after"),
    requireOriginalCurrentPcbViaSceneObservation(owner, plan, observations.beforeScene, "before"),
    requireOriginalCurrentPcbViaSceneObservation(owner, plan, observations.afterScene, "after"),
    requireOriginalCurrentPcbViaWriteStage(owner, plan, observations.createAcknowledgement, "create"));
}
/** Exactly one effect is issued for one genuine native generation. It joins
 * live original objects, never a serialized stage result or facade receipt. */
export function qualifyOriginalCurrentPcbViaWriteEffect(owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan,
  observations: CurrentPcbViaWriteEffectObservations): CurrentPcbViaWriteEffect {
  if (pcbViaEffectGenerations.has(owner)) { throw new Error("PCB_VIA_EFFECT_ALREADY_ISSUED"); }
  const proof = compareOriginalPcbViaEffect(owner, plan, observations); const effect = freezeDeep({ schema: "private.current-pcb-via-write-effect.v1", proof } as const);
  pcbViaEffects.set(effect, Object.freeze({ owner, plan, observations: Object.freeze({ ...observations }), text: canonicalJson(effect) }));
  pcbViaEffectGenerations.set(owner, effect); return effect;
}
/** The native owner's single Save entry uses this exact token and rechecks
 * every original packet and create ACK. It supplies no SQL resume slot. */
export function requireOriginalCurrentPcbViaWriteEffect(effect: CurrentPcbViaWriteEffect, owner: CurrentPcbViaWriteOwner,
  plan: CurrentPcbViaWritePlan): CurrentPcbViaProjectedEffect {
  const original = pcbViaEffects.get(effect);
  if (original === undefined || original.owner !== owner || original.plan !== plan || pcbViaEffectGenerations.get(owner) !== effect ||
      canonicalJson(effect) !== original.text) { throw new Error("PCB_VIA_ORIGINAL_EFFECT"); }
  if (canonicalJson(compareOriginalPcbViaEffect(owner, plan, original.observations)) !== canonicalJson(effect.proof)) { throw new Error("PCB_VIA_EFFECT_CHANGED"); }
  return effect.proof;
}
// END original Via projected-effect custody.
interface OriginalPcbViaSaveWorker {
  readonly owner: CurrentPcbViaWriteOwner; readonly plan: CurrentPcbViaWritePlan;
  readonly bindings: CurrentPcbViaSaveWorkerBindings; readonly assertOriginal: () => void;
  readonly source: CurrentPcbViaProjectSourceHeld; readonly controller: CurrentPcbViaWorkerController; readonly child: CurrentPcbViaWorkerChild;
}
// Only this central original owner's actual pre-project bootstrap can
// Populate this map. The observer has no issuer, registration or adoption API.
const pcbViaSaveWorkers = new WeakMap<CurrentPcbViaSaveWorkerOrigin, OriginalPcbViaSaveWorker>();
const pcbViaClocks = new WeakMap<CurrentPcbViaClockOrigin, Readonly<{ owner: CurrentPcbViaWriteOwner; plan: CurrentPcbViaWritePlan; bindings: CurrentPcbViaClockBindings; assertOriginal: () => void }>>();
export function requireOriginalCurrentPcbViaClockOrigin(origin: CurrentPcbViaClockOrigin, owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan): CurrentPcbViaClockBindings {
  const original = pcbViaClocks.get(origin); if (original === undefined || original.owner !== owner || original.plan !== plan) { throw error("PCB_VIA_CLOCK_ORIGINAL"); }
  requireViaPlan(owner, plan); original.assertOriginal(); return original.bindings;
}
export function requireOriginalCurrentPcbViaSaveWorkerOrigin(origin: CurrentPcbViaSaveWorkerOrigin, owner: CurrentPcbViaWriteOwner,
  plan: CurrentPcbViaWritePlan): CurrentPcbViaSaveWorkerBindings {
  const original = pcbViaSaveWorkers.get(origin);
  if (original === undefined || original.owner !== owner || original.plan !== plan) { throw error("PCB_VIA_SAVE_WORKER_ORIGINAL"); }
  requireViaPlan(owner, plan); original.assertOriginal(); return original.bindings;
}
const selectedSqlFenceBootstraps = new WeakMap<object, Readonly<{ transport: object; runner: () => CurrentFootprintCopyMainBackendRunner | null; owner: CurrentPcbViaWriteOwner | CurrentSchematicDisplayWriteOwner; path: string; reprove: () => void }>>();
export function requireCurrentSelectedFileMainSqlFenceBootstrap(capability: CurrentSelectedFileMainSqlFenceBootstrap, transport: object): string {
  if (types.isProxy(capability) || types.isProxy(transport)) { throw error("SELECTED_SQL_BOOTSTRAP"); }
  const original = selectedSqlFenceBootstraps.get(capability);
  if (original === undefined || original.transport !== transport) { throw error("SELECTED_SQL_BOOTSTRAP"); }
  original.reprove(); return original.path;
}
export async function sendCurrentSelectedFileMainSqlFenceCommand(capability: CurrentSelectedFileMainSqlFenceBootstrap,
  runner: CurrentFootprintCopyMainBackendRunner, command: CurrentSelectedFileMainSqlFenceCommand, id: number): Promise<void> {
  const original = selectedSqlFenceBootstraps.get(capability);
  if (original === undefined || original.runner() !== runner) { throw error("SELECTED_SQL_ORIGINAL_RUNNER"); }
  original.reprove(); await original.owner.sendSelectedFileMainSqlFence(capability, runner, command, id); original.reprove();
}
export async function sendOriginalCurrentPcbViaMainCommand(capability: CurrentSelectedFileMainSqlFenceBootstrap,
  runner: CurrentFootprintCopyMainBackendRunner, command: CurrentPcbViaMainCommand, id: number): Promise<void> {
  const original = selectedSqlFenceBootstraps.get(capability);
  if (original === undefined || original.runner() !== runner) { throw error("PCB_VIA_MAIN_ORIGINAL_RUNNER"); }
  // oxlint-disable-next-line eslint/no-use-before-define -- This sender is callable only after the original native factory and public facade have initialized.
  if (!(original.owner instanceof CurrentPcbViaWriteOwner)) { throw error("PCB_VIA_MAIN_ORIGINAL_OWNER"); }
  assertOriginalCurrentPcbViaWriteOwner(original.owner);
  original.reprove(); await original.owner.sendViaMainObservation(capability, runner, command, id); original.reprove();
}
export async function sendOriginalCurrentPcbViaMainStructure(capability: CurrentSelectedFileMainSqlFenceBootstrap,
  runner: CurrentFootprintCopyMainBackendRunner, command: CurrentPcbViaMainStructureCommand, id: number): Promise<CurrentPcbViaMainStructureNativeWindow | null> {
  const original = selectedSqlFenceBootstraps.get(capability);
  // oxlint-disable-next-line eslint/no-use-before-define -- An actual completed original factory alone issues this bootstrap.
  if (original === undefined || original.runner() !== runner || !(original.owner instanceof CurrentPcbViaWriteOwner)) { throw error("PCB_VIA_MAIN_STRUCTURE_ORIGINAL_OWNER"); }
  assertOriginalCurrentPcbViaWriteOwner(original.owner); original.reprove(); const window = await original.owner.sendViaMainStructure(capability, runner, command, id); original.reprove(); return window;
}
export async function sendOriginalCurrentPcbViaMainHistory(capability: CurrentSelectedFileMainSqlFenceBootstrap,
  runner: CurrentFootprintCopyMainBackendRunner, command: CurrentPcbViaMainHistoryCommand, id: number): Promise<CurrentPcbViaMainHistoryNativeWindow | null> {
  const original = selectedSqlFenceBootstraps.get(capability);
  // oxlint-disable-next-line eslint/no-use-before-define -- Native requests require the already initialized genuine dedicated owner.
  if (original === undefined || original.runner() !== runner || !(original.owner instanceof CurrentPcbViaWriteOwner)) { throw error("PCB_VIA_HISTORY_ORIGINAL_OWNER"); }
  assertOriginalCurrentPcbViaWriteOwner(original.owner); original.reprove(); const window = await original.owner.sendViaMainHistory(capability, runner, command, id); original.reprove(); return window;
}
export async function sendOriginalCurrentPcbViaMainBegin(capability: CurrentSelectedFileMainSqlFenceBootstrap,
  runner: CurrentFootprintCopyMainBackendRunner, command: CurrentPcbViaMainBeginCommand, id: number): Promise<void> {
  const original = selectedSqlFenceBootstraps.get(capability);
  // oxlint-disable-next-line eslint/no-use-before-define -- Native calls occur only after the genuine dedicated factory has initialized.
  if (original === undefined || original.runner() !== runner || !(original.owner instanceof CurrentPcbViaWriteOwner)) { throw error("PCB_VIA_BEGIN_ORIGINAL_OWNER"); }
  assertOriginalCurrentPcbViaWriteOwner(original.owner); original.reprove(); await original.owner.sendViaMainBegin(capability, runner, command, id); original.reprove();
}
export async function sendOriginalCurrentPcbViaMainStep(capability: CurrentSelectedFileMainSqlFenceBootstrap,
  runner: CurrentFootprintCopyMainBackendRunner, command: CurrentPcbViaMainStepCommand, id: number): Promise<void> {
  const original = selectedSqlFenceBootstraps.get(capability);
  // oxlint-disable-next-line eslint/no-use-before-define -- A native sender is reached only after its genuine dedicated owner exists.
  if (original === undefined || original.runner() !== runner || !(original.owner instanceof CurrentPcbViaWriteOwner)) { throw error("PCB_VIA_MAIN_STEP_ORIGINAL_OWNER"); }
  assertOriginalCurrentPcbViaWriteOwner(original.owner); original.reprove(); await original.owner.sendViaMainRequestStep(capability, runner, command, id); original.reprove();
}
const pcbViaMainOrigins = new WeakMap<CurrentPcbViaMainOrigin, Readonly<{ owner: CurrentPcbViaWriteOwner; plan: CurrentPcbViaWritePlan; effect: () => CurrentPcbViaWriteEffect | null; bindings: CurrentPcbViaMainBindings; assertOriginal: () => void }>>();
export function requireOriginalCurrentPcbViaMainOrigin(origin: CurrentPcbViaMainOrigin, owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan): CurrentPcbViaMainBindings {
  const original = pcbViaMainOrigins.get(origin); if (original === undefined || original.owner !== owner || original.plan !== plan) { throw error("PCB_VIA_MAIN_ORIGINAL"); }
  requireViaPlan(owner, plan); original.assertOriginal(); return original.bindings;
}
const headAgeBootstrapCapabilities = new WeakMap<object, Readonly<{ transport: object; reprove: () => void }>>();
/** This token admits only the original head-age transport's passive bootstrap
 * capture. Its fields or a copied transport cannot recreate original custody. */
export function requireCurrentFootprintHeadAgeBootstrapCapability(capability: CurrentFootprintHeadAgeBootstrapCapability, transport: object): void {
  if (types.isProxy(capability) || types.isProxy(transport)) { throw error("HEAD_AGE_BOOTSTRAP_CAPABILITY"); }
  const original = headAgeBootstrapCapabilities.get(capability);
  if (original === undefined || original.transport !== transport) { throw error("HEAD_AGE_BOOTSTRAP_CAPABILITY"); }
  original.reprove();
}
const footprintTerminations = new WeakMap<object, Readonly<{ owner: object; binding: Binding | null; noProcess: boolean }>>();
export interface CurrentFootprintCombinedMainCapability {
  readonly profile: "private.current-footprint-combined-main-capability.v1";
  readonly executionAuthorized: false;
}
export interface CurrentPcbComponentAbortReservation {
  readonly profile: "private.current-pcb-component-abort-reservation.v1";
  readonly executionAuthorized: false;
}
export interface CurrentFootprintCombinedAbortReservation {
  readonly profile: "private.current-footprint-combined-abort-reservation.v1";
  readonly executionAuthorized: false;
}
const footprintCombinedFactories = new WeakMap<object, CurrentPcbDiagnosticInstallation>();
const structureFactories = new WeakMap<object, CurrentPcbDiagnosticInstallation>();
const structureFactoryFailures = new WeakMap<object, Readonly<{ options: CurrentPcbDiagnosticInstallationOptions; owner: CurrentProjectStructureNativeOwner }>>();
const footprintForwardFactories = new WeakMap<object, CurrentPcbDiagnosticInstallation>();
const footprintForwardExecutionFactories = new WeakMap<object, CurrentPcbDiagnosticInstallation>();
type ForwardExecutionReleaseKind = "closed" | "unlaunched" | "no-process";
const forwardExecutionReleasePreflightFailures = new WeakMap<object, Readonly<{
  owner: CurrentPcbRetainedOwnerCore; attempt: object; kind: ForwardExecutionReleaseKind; activity: object | null;
}>>();
const forwardExecutionReleaseFailureErrors = new WeakSet<object>();
interface ForwardExecutionBirthAllocation {
  readonly options: CurrentPcbDiagnosticInstallationOptions;
  state: "pending" | "no-resource" | "unresolved" | "retained";
  owner: CurrentFootprintForwardExecutionNativeOwner | null;
  child: Readonly<{
    original: ChildProcessWithoutNullStreams;
    closed: ReturnType<typeof Promise.withResolvers<true>>;
    observation: { closed: boolean; code: number | null; signal: NodeJS.Signals | null; error: Error | null };
  }> | null;
  eofAttempted: boolean;
  cleanupFailure: unknown;
}
const forwardExecutionBirthAllocations = new WeakMap<CurrentPcbDiagnosticInstallationOptions, ForwardExecutionBirthAllocation>();
const forwardExecutionFactoryFailures = new WeakMap<object, Readonly<{
  options: CurrentPcbDiagnosticInstallationOptions; owner: CurrentFootprintForwardExecutionNativeOwner;
}>>();
interface ForwardFactoryFailure {
  readonly options: CurrentPcbDiagnosticInstallationOptions;
  readonly owner: CurrentFootprintCopyForwardNativeOwner;
  proof: CurrentFootprintCombinedBeforeLaunchFailureProof | null;
}
const forwardFactoryFailures = new WeakMap<object, ForwardFactoryFailure>();
/** These references are issued only inside the genuine original forward
 * factory. A token does not certify that a copy happened or a saved result exists. */
interface ForwardResources {
  readonly ledger: CurrentFootprintCopyForwardResourceLedger;
  readonly methods: ReturnType<typeof requireOriginalForwardLedgerBinding>;
}
interface ForwardSavedObservationHandoff extends ForwardResources {
  readonly writer: CurrentFootprintCopyForwardNativeOwner;
  readonly after: Awaited<ReturnType<typeof readExactSqlInventory>>;
  owner: CurrentFootprintCopyForwardSavedNativeOwner | null;
}
const forwardResourceBirths = new WeakMap<object, ForwardResources>();
interface ForwardSourceInputs {
  readonly opening: CurrentFootprintCopyOpeningOwner;
  readonly result: CurrentFootprintCopyOpeningResult;
  readonly preparation: CurrentFootprintCopyPreparation;
  readonly owned: Awaited<ReturnType<typeof requireCurrentFootprintCopyOwned>>;
  readonly main: CurrentFootprintCopyMainBackendRunner | null;
  readonly mainRetained: CurrentFootprintCopyMainBackendRunner["retained"] | null;
  readonly resources: ForwardResources | undefined;
  readonly binding: Binding | null;
}
const forwardExecutionInputOrigins = new WeakMap<CurrentFootprintForwardExecutionInputOrigin, Readonly<{
  owner: CurrentFootprintCopyForwardNativeOwner;
  requireInputs: (mode: "normal" | "retained") => CurrentFootprintForwardExecutionInputs;
}>>();
const forwardSavedHandoffs = new WeakMap<object, ForwardSavedObservationHandoff>();
const forwardSavedOwnerHandoffs = new WeakMap<object, ForwardSavedObservationHandoff>();
const forwardSavedAllocations = new WeakMap<CurrentFootprintCopyForwardNativeOwner, CurrentFootprintCopyForwardSavedNativeOwner>();
const forwardSavedAllocationAttempts = new WeakSet<CurrentFootprintCopyForwardNativeOwner>();
const forwardSavedAllocationStates = new WeakMap<CurrentFootprintCopyForwardNativeOwner, "pending" | "no-resource" | "unresolved">();
const footprintCombinedCapabilities = new WeakMap<CurrentFootprintCombinedMainCapability, CurrentPcbRetainedOwnerCore>();
const structureCapabilities = new WeakMap<object, CurrentPcbRetainedOwnerCore>();
interface CombinedFactoryFailure {
  readonly options: CurrentPcbDiagnosticInstallationOptions;
  readonly owner: CurrentFootprintCombinedNativeOwner;
  proof: CurrentFootprintCombinedBeforeLaunchFailureProof | null;
}
const combinedFactoryFailures = new WeakMap<object, CombinedFactoryFailure>();
export interface CurrentFootprintCopyClockRpcOrigin { readonly profile: "private.current-footprint-clock-rpc-origin.v1" }
// Only the original combined factory can join both retained issuers and the
// One original channel. No constructor, copied lease or JSON factory can mint it.
const footprintClockRpcOrigins = new WeakMap<CurrentFootprintCopyClockRpcOrigin, CurrentFootprintCopyClockRpcOriginBindings>();
const footprintClockRpcOwners = new WeakMap<CurrentFootprintCopyClockRpcOrigin, CurrentPcbRetainedOwnerCore>();
export function requireCurrentFootprintCopyClockRpcOrigin(token: CurrentFootprintCopyClockRpcOrigin): CurrentFootprintCopyClockRpcOriginBindings {
  if (types.isProxy(token)) { throw error("FOOTPRINT_CLOCK_RPC_ORIGINAL_ORIGIN"); }
  const held = footprintClockRpcOrigins.get(token);
  if (held === undefined) { throw error("FOOTPRINT_CLOCK_RPC_ORIGINAL_ORIGIN"); } return held;
}


/** Test seams supply a real retained child, never process IDs or an attach path.
 * Only the fixed owner factories check packaged helper source. Neither
 * constructor nor successful discovery grants current runtime admission. */
class CurrentPcbRetainedOwnerCore {
  readonly #child: ChildProcessWithoutNullStreams;
  readonly #forwardRole: CurrentFootprintCopyForwardRole | null;
  readonly #forwardSavedHandoff: object | null;
  readonly #forwardLedger: CurrentFootprintCopyForwardResourceLedger | null;
  readonly #forwardLedgerMethods: ReturnType<typeof requireOriginalForwardLedgerBinding> | null;
  readonly #forwardMainAccounting: CurrentFootprintCopyForwardMainAccounting | null;
  #forwardCleanupOnly = false;
  readonly #verify: () => Promise<void>;
  readonly #verifyInstallation: () => Promise<void>;
  readonly #verifyStartupFacade: () => Promise<void>;
  readonly #installation: CurrentPcbDiagnosticInstallation | null;
  readonly #input = new PassThrough({ autoDestroy: false });
  readonly #output: Writable;
  readonly #pipe: CurrentPcbComponentSpatialPipe | CurrentSchematicDisplayWritePipe | CurrentPcbViaWritePipe | CurrentPcbDiagnosticPipe | CurrentPcbStringPrecreatePipe | CurrentPcbWorkerStartupDiscoveryPipe | CurrentFootprintCombinedDiscoveryPipe | CurrentFootprintCopyForwardDiscoveryPipe | CurrentFootprintCopyForwardSavedDiscoveryPipe | CurrentFootprintHeldCacheDiagnosticPipe;
  readonly #stringPurpose: boolean;
  readonly #startupPurpose: boolean;
  readonly #actorClockSource: CurrentPcb209ActorClockSourceQualification | null;
  readonly #purpose: OwnerPurpose;
  #startupHandoffConsumed = false;
  #startupParent: CurrentPcbWorkerStartupParent | null = null;
  #startupChannel: CurrentPcbWorkerStartupChannel | CurrentPcb209WorkerStartupChannel | CurrentFootprintCopyPreparationChannel | CurrentFootprintCopyExecutionChannel | CurrentFootprintCombinedStartupChannel | CurrentFootprintCopyForwardStartupChannel | CurrentFootprintCopyForwardSavedStartupChannel | CurrentFootprintCopySavedChannel | CurrentFootprintCopyHeldSavedStartupChannel | CurrentPcb209EmptyStartupChannel | CurrentPcb209RatlineContinuationChannel | CurrentPcb209RatlineStartupChannel | null = null;
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
  #forwardExecutionUiReproofSucceeded = false;
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
  #footprintClockRpcOriginAttempted = false;

  #startupPcbConsumed = false;
  #startupPcbSession: CurrentPcbWorkerStartupPcbSession | CurrentPcb209WorkerStartupPcbSession | CurrentPcb209RatlineContinuationNativeSession | CurrentPcb209RatlineNativeSession | null = null;
  #nativeTail: Promise<void> = Promise.resolve();
  readonly #closed = Promise.withResolvers<null>();
  readonly #combinedReadyChallenge: string | null;
  readonly #combinedReady = Promise.withResolvers<CurrentFootprintCombinedReadyPacket>();
  #combinedReadyPacket: CurrentFootprintCombinedReadyPacket | null = null;
  #combinedReadyWaitAttempted = false;
  #combinedFactoryReady = false;
  #combinedReadyAbandoned = false;
  #combinedReadyEofAttempted = false;
  #nativeStdinBytes = 0;
  #launchMethodInvoked = false;
  #stderrBytes = 0;
  readonly #stderrHash = createHash("sha256");
  #stderrTruncated = false;

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
  #forwardExecutionReleaseAttempt: object | null = null;
  #forwardExecutionReleaseWorkEverStarted = false;
  #forwardExecutionNativeActivity: object | null = null;
  readonly #forwardExecutionPendingNativeRequests = new Set<object>();
  readonly #forwardExecutionPendingFrameWrites = new Set<object>();
  #released = false;
  #childClosed = false;
  // Retain the last frame promise for transfer even after its settlement.
  #send: Promise<void> | null = null;
  #inspectionConsumed = false;
  #browserObservationConsumed = false;
  #heldCacheStartup: CurrentFootprintHeldCachePageReadiness | null = null;
  #savedCacheBrowserVersion: Readonly<RecordValue> | null = null;
  #savedCacheNativeRunner: CurrentFootprintSavedCacheRunner | null = null;
  #savedCacheNativeAttempted = false;
  #savedCacheNativeSetupPhase: "source" | "parent" | "ancillary-owner" | "selector" | "metadata" | "completed" | null = null;
  #savedCacheNativeSetupFailed = false;
  #savedCacheAccessorRunner: CurrentFootprintSavedCacheAccessorRunner | null = null;
  #savedCacheAccessorAttempted = false;
  #savedCacheAccessorSetupPhase: "source" | "parent" | "ancillary-owner" | "selector" | "metadata" | "completed" | null = null;
  #savedCacheAccessorSetupFailed = false;
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
  #schematicWorkerArguments: GeneratedSchematicDisplayNativeArguments | null = null;
  #schematicWorkerSetup: CurrentSchematicDisplaySaveWorkerSetup | null = null;
  #schematicTransportSetup: CurrentProjectStructureTransportSetup | null = null;
  #schematicTransportOperation: GeneratedSchematicDisplayNativeArguments | null = null;
  #schematicTransportOrigin: CurrentSchematicDisplayStructureTransportOrigin | null = null;
  #schematicProducerGuardOperation: GeneratedSchematicDisplayNativeArguments | null = null;
  #schematicProducerGuardArmed = false;
  #schematicProducerGuardReproof: (() => void) | null = null;
  #schematicProducerEnrollmentAttempted = false;
  #schematicProducerPrefix: CurrentSchematicDisplaySaveProducerPrefix | null = null;
  #schematicProducerRelationAttempted = false; #schematicProducerEntryAttempted = false; #schematicProducerBodyAttempted = false;
  #schematicProducerOriginalUploadWrapper: string | null = null; #schematicProducerOriginalUploadCallback: string | null = null;
  #schematicProducerOriginalSaveEntry: string | null = null; #schematicProducerOriginalSaveBody: string | null = null;
  #schematicProducerModeArray: string | null = null; #schematicProducerModeVerified = false;
  #schematicTransportCapture: string | null = null;
  #schematicTransportCaptureAttempted = false;
  #schematicTransportSendFrame: string | null = null;
  #schematicTransportSendPacket: string | null = null;
  #schematicTransportReturnedFrame: string | null = null;
  #schematicStructureSetup: CurrentProjectSaveStructureSetup | null = null;
  #schematicStructureOrigin: CurrentProjectSaveStructureOrigin | null = null;
  #schematicWorkerController: CurrentSchematicDisplayWorkerController | null = null;
  #schematicWorkerOrigin: CurrentSchematicDisplaySaveWorkerOrigin | null = null;
  #schematicAccessorAttempted = false;
  #schematicAccessorOrigin: CurrentSchematicDisplayAccessorOrigin | null = null;
  #schematicAccessorSetup: CurrentSchematicDisplayAccessorSetup | null = null;
  #schematicClockAttempted = false;
  #schematicClockSetup: CurrentSchematicDisplayClockSetup | null = null;
  #schematicClockOrigin: CurrentSchematicDisplayClockOrigin | null = null;
  readonly #schematicClockArmAttempts = new Set<string>();
  readonly #schematicClockArmedPoints = new Set<string>();
  readonly #schematicClockRemoveAttempts = new Set<string>();
  readonly #schematicClockRemovedPoints = new Set<string>();
  #schematicClockResultArray: string | null = null;
  #schematicClockValue: number | null = null;
  #schematicObserverTail: Promise<void> = Promise.resolve();
  #schematicFailed = false;
  #schematicSaveBodyCaptureAttempted = false;
  #schematicSaveCapturedBody: CurrentSchematicDisplaySaveBodyValue | null = null;
  #schematicArguments: GeneratedSchematicDisplayNativeArguments | null = null;
  #schematicNavigationAttempted = false;
  #schematicNavigationDispatchAttempted = false;
  #schematicNavigationResult: ReturnType<typeof validateGeneratedSchematicNavigation> | null = null;
  #schematicWindowTabId: string | null = null;
  #schematicSdkBinding: string | null = null;
  readonly #schematicStages = new Set<GeneratedSchematicDisplayStageResult["stage"]>();
  #viaProjectNavigationDispatchAttempted = false;
  #viaSdkBinding: string | null = null;
  #viaSdkQualified = false;
  #viaFailed = false;
  #schematicDisplayCleanupOnly = false;
  #schematicDisplayTermination: object | null = null;
  #viaOriginalTermination: object | null = null;
  #viaObserverTail: Promise<void> = Promise.resolve();
  #viaCleanupOnly = false;
  #viaWorkerPlan: CurrentPcbViaWritePlan | null = null;
  #viaWorkerSetup: CurrentPcbViaSaveWorkerSetup | null = null;
  #viaTransportSetup: CurrentProjectStructureTransportSetup | null = null;
  #viaTransportOperation: CurrentPcbViaWritePlan | null = null;
  #viaTransportOrigin: CurrentPcbViaStructureTransportOrigin | null = null;
  #viaProducerGuardOperation: CurrentPcbViaWritePlan | null = null;
  #viaProducerGuardArmed = false;
  #viaProducerGuardReproof: (() => void) | null = null;
  #viaProducerEnrollmentAttempted = false;
  #viaProducerPrefix: CurrentPcbViaSaveProducerPrefix | null = null;
  #viaProducerRelationAttempted = false; #viaProducerEntryAttempted = false; #viaProducerBodyAttempted = false;
  #viaProducerOriginalUploadWrapper: string | null = null; #viaProducerOriginalUploadCallback: string | null = null;
  #viaProducerOriginalSaveEntry: string | null = null; #viaProducerOriginalSaveBody: string | null = null;
  #viaProducerModeArray: string | null = null; #viaProducerModeVerified = false;
  #viaTransportCapture: string | null = null;
  #viaTransportCaptureAttempted = false;
  #viaTransportSendFrame: string | null = null;
  #viaTransportSendPacket: string | null = null;
  #viaTransportReturnedFrame: string | null = null;
  #viaStructureSetup: CurrentProjectSaveStructureSetup | null = null;
  #viaStructureOrigin: CurrentProjectSaveStructureOrigin | null = null;
  #viaWorkerController: CurrentPcbViaWorkerController | null = null;
  #viaWorkerOrigin: CurrentPcbViaSaveWorkerOrigin | null = null;
  #viaClockAttempted = false;
  #viaClockSetup: CurrentPcbViaClockSetup | null = null;
  #viaClockSetupSettled = false;
  #viaClockOrigin: CurrentPcbViaClockOrigin | null = null;
  readonly #viaClockArmAttempts = new Set<string>();
  readonly #viaClockArmedPoints = new Set<string>();
  readonly #viaClockRemoveAttempts = new Set<string>();
  readonly #viaClockRemovedPoints = new Set<string>();
  #viaClockResultArray: string | null = null;
  #viaClockValue: number | null = null;
  #viaSaveBodyCaptureAttempted = false;
  #viaSaveCapturedBody: CurrentPcbViaSavePendingBodyValue | null = null;
  #viaStructureBodyAttempted = false;
  #viaStructureBodyReservation: CurrentProjectStructureBodyReservation | null = null;
  #viaStructurePublication: CurrentProjectStructureMainPublication | null = null;
  #viaHistorySqlEffects: CurrentProjectHistorySqlEffects | null = null;
  #viaStructureSqlEffects: CurrentProjectStructureSqlEffects | null = null;
  #viaClosedEffects: CurrentPcbViaWriteClosedEffects | null = null;
  #viaHistoryCompletion: CurrentProjectHistorySqlCompletion | null = null;
  #viaMainBoundBody: CurrentPcbViaPendingSaveDelta | null = null;
  #viaMainAttempted = false;
  #viaMainCreateEnrollment: CurrentPcbViaCreateIntentEnrollment | null = null;
  #viaMainCreateDispatch: CurrentPcbViaWriteDispatch | null = null;
  #viaMainCreatePrefix: CurrentPcbViaSaveProducerPrefix | null = null;
  #viaMainPrecreateReady = false;
  #viaMainBoundEffect: CurrentPcbViaWriteEffect | null = null;
  #viaMainOrigin: CurrentPcbViaMainOrigin | null = null;
  #viaMainSetupReady = false;
  #viaPlan: CurrentPcbViaWritePlan | null = null;
  readonly #viaNativePhases = new Set<CurrentPcbViaObservationPhase>();
  readonly #viaScenePhases = new Set<CurrentPcbViaObservationPhase>();
  readonly #viaSdkPhases = new Set<CurrentPcbViaWriteStage>();
  #layers209Consumed = false;
  #primitives209Consumed = false;
  #extendedPrimitives209Consumed = false;
  #padShapes209Consumed = false;
  #imageShapes209Consumed = false;
  #arcShapes209Consumed = false;
  #pouredShapes209Consumed = false;
  #selectionRelations209Consumed = false;
  #spatial209Consumed = false;
  #windowNativeFailure: CurrentWindowFailure | null = null;
  #windowRestore209Consumed = false;
  #windowRestore209ReadinessObserved = false;
  #windowRestore209Retained: Readonly<RecordValue> | null = null;
  #windowResize209Consumed = false;
  #windowResize209ReadinessObserved = false;
  #windowResize209Retained: Readonly<RecordValue> | null = null;
  #windowCapture209Consumed = false;
  #windowCapture209ReadinessQueries = 0;
  #windowCapture209Retained: Readonly<RecordValue> | null = null;
  #windowCapture209DispatchAttempted = false;
  #rendererCapture209Consumed = false;
  #rendererCapture209Retained: Readonly<RecordValue> | null = null;
  #windowCapture209Transport: CurrentWindowCaptureTransportBudget | CurrentRendererCaptureTransportBudget | null = null;
  #windowCapture209CleanupReserved = false;
  #visual209Consumed = false;
  #visual209RetainedObservation: Readonly<RecordValue> | null = null;
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
  #forwardSourceInputs: ForwardSourceInputs | null = null;
  #forwardExecutionInputOrigin: CurrentFootprintForwardExecutionInputOrigin | null = null;
  #forwardExecutionSourceInputs: ForwardSourceInputs | null = null;
  #footprintSavedStartAttempted = false;
  #footprintSavedOpenAttempted = false;
  #footprintSavedOpening: CurrentFootprintCopySavedStartupOpening | null = null;
  #footprintSavedOpeningReleased = false;
  #footprintSavedQueues = 0;
  #mainAttachAttempted = false;
  #mainAttached = false;
  #mainCloseCleanupActive = false;
  #mainCloseDetachAttempted = false;
  #mainCloseDetached = false;
  // Capture at original owner construction, after the runner/owner module
  // Cycle has initialized. Cleanup invokes only this private-field receiver.
  // oxlint-disable-next-line typescript/unbound-method -- The retained original runner is explicitly supplied by call below.
  readonly #mainCloseMethods = Object.freeze({ prepare: CurrentFootprintCopyMainBackendRunner.prototype.prepareNormalClose,
    // oxlint-disable-next-line typescript/unbound-method -- The retained original runner is explicitly supplied by call below.
    require: CurrentFootprintCopyMainBackendRunner.prototype.requireNormalClosePrepared });
  #combinedMainBusy = false;
  #mainRequestId = 0;
  #mainNormalRequests = 0;
  #mainCleanupRequests = 0;
  #mainCompletionState: "unused" | "beginning" | "active" | "failed" | "retired" = "unused";
  #mainCompletionFirst = 0;
  #mainCompletionNormal = 0;
  #mainCompletionCleanup = 0;
  #mainCompletionRetireAttempted = false;
  #mainCompletionTailReleaseAttempted = false;
  #visualAbortAttempted = false;
  #componentAbortReservation: CurrentPcbComponentAbortReservation | null = null;
  #componentAbortBinding: Binding | null = null;
  #componentAbortDispatchAttempted = false;
  #mainTerminateAttempted = false;
  #combinedAbortAttempted = false;
  #combinedOutputCleanupOnly = false;
  #combinedCleanupControls = 0;
  #combinedAbortReservation: CurrentFootprintCombinedAbortReservation | null = null;
  #combinedAbortBinding: Binding | null = null;
  #combinedAbortDispatchAttempted = false;
  #mainObservationAttempted = false;
  #mainRunner: CurrentFootprintCopyMainBackendRunner | null = null;
  // oxlint-disable-next-line typescript/unbound-method -- Retain and call only with the private original main runner receiver.
  readonly #headAgeMainMethods = Object.freeze({ prepare: CurrentFootprintCopyMainBackendRunner.prototype.prepareHeadAge, observe: CurrentFootprintCopyMainBackendRunner.prototype.observeHeadAge });
  #headAgeStarted = false;
  #headAgeAttempted = false;
  #headAgeBusy = false;
  #headAgeAbortAttempted = false;
  #headAgeAbortDispatched = false;
  #headAgeAbortToken: object | null = null;
  #headAgeObservation: CurrentFootprintHeadAgeObservation | null = null;
  #headAgeObservationText: string | null = null;
  #headAgeNormalControls = 0;
  #headAgeCleanupControls = 0;
  #headAgeInspectorBytes = Buffer.alloc(0);
  #headAgeBracket: Readonly<{ before: unknown; after: unknown }> | null = null;
  #combinedMainCapability: CurrentFootprintCombinedMainCapability | null = null;
  #structureMainCapability: CurrentProjectStructureMainCapability | null = null;
  #structureMainConstruction: CurrentFootprintCopyMainBackendObservation | null = null;
  #structureNormalControls = 0;
  #structureCleanupControls = 0;
  readonly #forwardExecutionMainReplies: unknown[] = [];
  #forwardExecutionMainPoll: ForwardExecutionMainPoll | null = null;
  readonly #footprintSavedQueueReplies: unknown[] = [];
  #heldSavedStartAttempted = false;
  #heldSavedStarted = false;
  #heldSavedCache: CurrentFootprintSavedCacheHeldRunner | null = null;
  #heldSavedCurrent: (() => void) | null = null;
  #heldSavedCleanupActive = false;
  #heldSavedFailed = false;
  #heldSavedOpenAttempted = false;
  #heldSavedOpening: CurrentFootprintCopyHeldSavedStartupOpening | null = null;
  #heldSavedObservedEventBytes = 0;
  #heldSavedStateReads = 0;
  #heldSavedSourceReads = 0;
  #heldSavedOpeningReleased = false;
  #heldSavedAbortAttempted = false;
  #heldCacheAbortReservation: object | null = null;
  #heldCacheAbortBinding: Binding | null = null;
  #heldCacheAbortDispatchAttempted = false;
  #heldSavedReadCleanup = false;
  #heldSavedLastCommandCleanup = false;
  readonly #heldSavedLedger: CurrentFootprintCopyHeldSavedResourceLedger | null;
  readonly #heldSavedLedgerMethods: CurrentFootprintCopyHeldSavedLedgerBinding | null;

  /** Bind one original helper child to its fixed purpose and verification hooks.
   * Transport and resource-ledger selection happen before listeners or launch. */
  readonly #generatedFixtureBirth: boolean;
  readonly #componentPrepared: GeneratedComponentFixtureOpenCheckpoint | null;
  #generatedFixtureQualification: QualifiedGeneratedFixtureTarget | QualifiedGeneratedComponentFixtureTarget | null = null;
  #generatedFixtureRegistration: Readonly<Record<string, unknown>> | null = null;
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    installation: CurrentPcbDiagnosticInstallation | null, verifyInstallation: () => Promise<void>, purpose: OwnerPurpose,
    verifyStartupFacade: () => Promise<void> = verifyInstallation, actorClockSource: CurrentPcb209ActorClockSourceQualification | null = null,
    emptyAnchor: CurrentPcb209EmptyStartupBudgetAnchor | null = null, ratlineBudget: CurrentPcb209RatlineBudget | null = null, continuationBudget: CurrentPcb209RatlineContinuationBudget | null = null, readyChallenge: string | null = null, forwardSavedHandoff: object | null = null,
    generatedFixtureBirth = false, componentPrepared: GeneratedComponentFixtureOpenCheckpoint | null = null) {
    if ((componentPrepared !== null) !== (purpose === "pcb-component-spatial209")) { throw error("COMPONENT_ORIGINAL_PREPARED"); }
    if (componentPrepared !== null) { assertOriginalGeneratedComponentFixtureOpenCheckpoint(componentPrepared); }
    this.#componentPrepared = componentPrepared;
    if (generatedFixtureBirth && purpose !== "diagnostic209" && purpose !== "pcb-spatial209" && purpose !== "pcb-component-spatial209" && purpose !== CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE) { throw error("GENERATED_FIXTURE_BIRTH_PURPOSE"); }
    this.#generatedFixtureBirth = generatedFixtureBirth;
    const saved = forwardSavedHandoff === null ? null : requireForwardSavedObservationHandoff(forwardSavedHandoff);
    if (saved !== null && purpose !== "worker-startup-footprint-saved209") { throw error("FORWARD_SAVED_PURPOSE"); }
    let role: CurrentFootprintCopyForwardRole | null = null;
    if (forwardBirthPurpose(purpose)) { role = "forward-writer"; }
    else if (saved !== null) { role = "forward-saved-readback"; }
    this.#forwardRole = role;
    this.#forwardSavedHandoff = forwardSavedHandoff;
    this.#forwardLedger = forwardBirthPurpose(purpose) ? new CurrentFootprintCopyForwardResourceLedger(purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE ? "forward-execution-v2" : "observation") : saved?.ledger ?? null;
    this.#forwardLedgerMethods = this.#forwardLedger === null ? null : requireOriginalForwardLedgerBinding(this.#forwardLedger);
    if (this.#forwardRole === "forward-writer" && this.#forwardLedger !== null && this.#forwardLedgerMethods !== null) {
      this.#forwardLedgerMethods.bind.call(this.#forwardLedger, "forward-writer", this);
      forwardResourceBirths.set(this, Object.freeze({ ledger: this.#forwardLedger, methods: this.#forwardLedgerMethods }));
    }
    this.#forwardMainAccounting = this.#forwardRole !== "forward-writer" || this.#forwardLedger === null ? null : new CurrentFootprintCopyForwardMainAccounting(this.#forwardLedger, this);
    if ((bornFootprintTransport(purpose)) !== (readyChallenge !== null) ||
      readyChallenge !== null && !/^[a-f\d]{32}(?![\s\S])/u.test(readyChallenge)) { throw error("COMBINED_READY_CHALLENGE_PROFILE"); }
    this.#combinedReadyChallenge = readyChallenge;
    // Attach rejection handling before any native pipe can emit an error.
    // The original readiness waiter still receives the same rejection.
    if (bornFootprintTransport(purpose)) {
      void (async (): Promise<void> => { try { await this.#combinedReady.promise; } catch {
        // The original readiness waiter retains this failure.
      } })();
    }
    this.#actorClockSource = actorClockSource;
    this.#emptyAnchor = emptyAnchor;
    this.#ratlineBudget = ratlineBudget; this.#continuationBudget = continuationBudget;
    if ((purpose === "worker-startup-ratline-continuation209") !== (continuationBudget !== null)) { throw error("CONTINUATION_BUDGET"); }
    if (continuationBudget !== null) { assertOriginalCurrentPcb209RatlineContinuationBudget(continuationBudget); }
    if ((purpose === "worker-startup-ratline209") !== (ratlineBudget !== null)) { throw error("RATLINE_BUDGET"); }
    if (ratlineBudget !== null) { assertOriginalCurrentPcb209RatlineBudget(ratlineBudget); }
    if ((purpose === "worker-startup-empty209") !== (emptyAnchor !== null)) { throw error("STARTUP_EMPTY_ANCHOR"); }
    if (purpose === "worker-startup209" || (purpose === "worker-startup-footprint209" || purpose === "worker-startup-footprint-copy209" || purpose === "worker-startup-footprint-saved209" || purpose === "worker-startup-footprint-held-saved209" || purpose === "worker-startup-footprint-main209" || purpose === "footprint-head-age209" || bornFootprintTransport(purpose)) || purpose === "worker-startup-empty209" || purpose === "worker-startup-ratline209" || purpose === "worker-startup-ratline-continuation209") {
      if (actorClockSource === null) { throw error("STARTUP209_ACTOR_SOURCE"); }
      requireCurrentPcb209ActorClockSourceQualification(actorClockSource);
    } else if (actorClockSource !== null) { throw error("STARTUP209_PURPOSE"); }
    this.#startupPurpose = purpose === "worker-startup" || purpose === "worker-startup209" || (purpose === "worker-startup-footprint209" || purpose === "worker-startup-footprint-copy209" || purpose === "worker-startup-footprint-saved209" || purpose === "worker-startup-footprint-held-saved209" || purpose === "worker-startup-footprint-main209" || purpose === "footprint-head-age209" || bornFootprintTransport(purpose)) || purpose === "worker-startup-empty209" || purpose === "worker-startup-ratline209" || purpose === "worker-startup-ratline-continuation209";
    this.#child = child; this.#verify = verify; this.#installation = installation; this.#verifyInstallation = verifyInstallation;
    this.#verifyStartupFacade = verifyStartupFacade;
    this.#purpose = purpose; this.#stringPurpose = purpose === "string-precreate";
    this.#heldSavedLedger = heldCachePurpose(purpose) ? new CurrentFootprintCopyHeldSavedResourceLedger() : null;
    this.#heldSavedLedgerMethods = this.#heldSavedLedger === null ? null : requireOriginalHeldSavedLedgerBinding(this.#heldSavedLedger);
    if (this.#heldSavedLedger !== null && this.#heldSavedLedgerMethods !== null) {
      this.#heldSavedLedgerMethods.bind.call(this.#heldSavedLedger, this);
    }
    this.#output = new Writable({ autoDestroy: false,
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Writable requires its original callback, acknowledged only after native WriteFile.
      write: (chunk: unknown, _encoding, callback): void => {
        this.#send = this.#sendFrame(chunk, callback);
      },
    });
    if (this.#purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE) { this.#pipe = new CurrentSchematicDisplayWritePipe(this.#input, this.#output); }
    else if (this.#purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE) { this.#pipe = new CurrentPcbViaWritePipe(this.#input, this.#output); }
    else if (this.#purpose === "pcb-component-spatial209") { this.#pipe = new CurrentPcbComponentSpatialPipe(this.#input, this.#output); }
    else if (this.#purpose === "pcb-spatial209") { this.#pipe = new CurrentPcbSpatialPipe(this.#input, this.#output); }
    else if (this.#purpose === "footprint-held-cache209") { this.#pipe = new CurrentFootprintHeldCacheDiagnosticPipe(this.#input, this.#output, (bytes): void => { this.#heldSavedEventBytes(bytes); }); }
    else if (forwardBirthPurpose(this.#purpose)) { this.#pipe = new CurrentFootprintCopyForwardDiscoveryPipe(this.#input, this.#output, (bytes): void => { this.#forwardRendererEvent(bytes); }); }
    else if (saved !== null) { this.#pipe = new CurrentFootprintCopyForwardSavedDiscoveryPipe(this.#input, this.#output, (bytes): void => { this.#forwardRendererEvent(bytes); }); }
    else if (this.#purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE || this.#purpose === CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE) { this.#pipe = new CurrentFootprintCombinedDiscoveryPipe(this.#input, this.#output); }
    else if (this.#startupPurpose) { this.#pipe = new CurrentPcbWorkerStartupDiscoveryPipe(this.#input, this.#output); }
    else { this.#pipe = this.#stringPurpose ? new CurrentPcbStringPrecreatePipe(this.#input, this.#output) : new CurrentPcbDiagnosticPipe(this.#input, this.#output); }
    if (saved !== null && this.#forwardLedger !== null && this.#forwardLedgerMethods !== null) {
      // Binding happens before start attaches a listener or processes helper output.
      this.#forwardLedgerMethods.bind.call(this.#forwardLedger, "forward-saved-readback", this);
      saved.owner = this; forwardSavedOwnerHandoffs.set(this, saved);
    }
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
    if (this.#pipe instanceof CurrentPcbSpatialPipe || this.#pipe instanceof CurrentPcbComponentSpatialPipe) { this.#pipe.assertSpatialCapacity(); }
  }

  /** Report cached owner, consumption, transport and cleanup state without launching
   * or querying a window. Optional diagnostics describe retained observations only;
   * PID/binding metadata and successful acknowledgments never recreate native ownership.
   */
  public status(): Readonly<{ helperPid: number | null; binding: Binding | null; failure: string | null;
    busy: boolean; launchConsumed: boolean; closeConsumed: boolean; released: boolean; helperClosed: boolean;
    cleanupOnly: boolean; noProcessCleanupAvailable: boolean; frameWorkerVerified: false; executionAuthorized: false;
    nativeLaunchError: string | null; nativeSendError: string | null; createProcessError: number | null;
    windowNativeFailure?: CurrentWindowFailure | null;
    windowRestore209AttemptConsumed?: boolean; windowRestore209ReadinessObserved?: boolean; windowRestore209RetainedObservation?: Readonly<RecordValue>;
    windowRestore209RequestCapacity?: boolean;
    windowResize209AttemptConsumed?: boolean; windowResize209ReadinessObserved?: boolean; windowResize209RetainedObservation?: Readonly<RecordValue>;
    windowResize209RequestCapacity?: boolean;
    windowCaptureReadinessQueriesUsed?: number;
    rendererCapture209AttemptConsumed?: boolean; rendererCapture209RetainedObservation?: Readonly<RecordValue> | null;
    windowCapture209AttemptConsumed?: boolean; windowCapture209NativeDispatchAttempted?: boolean; windowCaptureNativeResourcesMayRemain?: boolean;
    windowCapture209RetainedObservation?: Readonly<RecordValue>; windowCaptureObservationAccepted?: false;
    visual209RetainedObservation?: Readonly<RecordValue>; visualObservationCurrent?: false; visualObservationAccepted?: false;
    mainNativeFailure?: Readonly<{ action: MainNativeAction; code: string }> | null;
    mainCloseDetachAttempted?: boolean; mainCloseDetached?: boolean;
    combinedAbortAttempted?: boolean; combinedAbortDispatchAttempted?: boolean; combinedOutputCleanupOnly?: boolean;
    combinedReadiness?: CurrentFootprintCombinedFactoryFailureDiagnostics | null;
    forwardResources?: Readonly<{ counters: ReturnType<CurrentFootprintCopyForwardResourceLedger["status"]>;
      generation: ReturnType<CurrentFootprintCopyForwardResourceLedger["generationStatus"]>;
      cleanupOnly: boolean; artifactAccountingMounted: false; journalAccountingMounted: false; nativeWriterMounted: false }>;
    savedCacheNativeObservation?: Readonly<Record<string, unknown>> | null;
    savedCacheAccessorObservation?: Readonly<Record<string, unknown>> | null;
    heldCacheStartupObservation?: CurrentFootprintHeldCacheStartupObservation;
    browserObservationConsumed: boolean; frameInspectionConsumed: boolean; scriptInspectionConsumed: boolean; diagnosticFailure: string | null;
    diagnosticFailureObservation: CurrentPcbDiagnosticFailureObservation | null;
    workerStartupChannel?: ReturnType<CurrentPcbWorkerStartupChannel["status"]> | ReturnType<CurrentPcb209EmptyStartupChannel["status"]> |
      ReturnType<CurrentPcb209RatlineStartupChannel["status"]> | ReturnType<CurrentPcb209RatlineContinuationChannel["status"]> | null;
    observationFailure?: CurrentPcbObservationFailure | null;
    lastTerminationObservation?: Readonly<TerminationObservation> | null;
    projectOpeningConsumed: boolean; projectOpeningResult: CurrentPcbDiagnosticOpeningResult | null; modelObservationConsumed: boolean;
    generatedFixtureRegistrationPurpose?: true; generatedFixtureRegistration?: Readonly<Record<string, unknown>> | null;
    pcbOpeningConsumed: boolean; pcbOpeningResult: CurrentPcbDiagnosticPcbOpeningResult | null;
    pcbObservationConsumed: boolean; pcbFrameObservation: CurrentPcbDiagnosticPcbOpeningResult | null; pcbSourceQualified: boolean;
    stringPrecreateConsumed: boolean; commonBaselineConsumed?: boolean; profile: OwnerPurpose; workerStartupHandoffConsumed?: boolean }> {
    return Object.freeze({ helperPid: this.#child.pid ?? null, binding: this.#binding, failure: this.#failure,
      busy: this.#busy, launchConsumed: this.#launchConsumed, closeConsumed: this.#closeConsumed,
      released: this.#released, helperClosed: this.#childClosed, cleanupOnly: this.#binding !== null && !this.#launchSucceeded || this.#purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE && this.#schematicDisplayCleanupOnly,
      noProcessCleanupAvailable: this.#noProcessCleanupAvailable(), frameWorkerVerified: false, executionAuthorized: false, browserObservationConsumed: this.#browserObservationConsumed,
      nativeLaunchError: this.#nativeLaunchError, nativeSendError: this.#nativeSendError, createProcessError: this.#noProcessProof?.createProcessError ?? null,
      ...(this.#heldCacheStartup === null ? {} : { heldCacheStartupObservation: this.#heldCacheStartup.observation() }),
      ...(this.#forwardLedger === null || this.#forwardLedgerMethods === null || this.#forwardRole === null ? {} : { forwardResources: Object.freeze({
        counters: this.#forwardLedgerMethods.status.call(this.#forwardLedger),
        generation: this.#forwardLedgerMethods.generationStatus.call(this.#forwardLedger, this.#forwardRole, this), cleanupOnly: this.#forwardCleanupOnly,
        artifactAccountingMounted: false, journalAccountingMounted: false, nativeWriterMounted: false }) }),
      ...(bornFootprintTransport(this.#purpose) ? { combinedReadiness: this.combinedFactoryFailureDiagnostics(),
        savedCacheNativeObservation: this.#savedCacheNativeRunner?.retained() ?? (this.#savedCacheNativeAttempted ? Object.freeze({
          attempted: true, phase: this.#savedCacheNativeSetupPhase, setupFailed: this.#savedCacheNativeSetupFailed, runnerCreated: false,
          nativeMatchQualified: false, replayTokenIssued: false, executionAuthorized: false,
        }) : null),
        savedCacheAccessorObservation: this.#savedCacheAccessorRunner?.retained() ?? (this.#savedCacheAccessorAttempted ? Object.freeze({
          attempted: true, phase: this.#savedCacheAccessorSetupPhase, setupFailed: this.#savedCacheAccessorSetupFailed, runnerCreated: false,
          nativeGetterQualified: false, nativeMatchQualified: false, replayTokenIssued: false, executionAuthorized: false,
        }) : null) } : {}),
      mainNativeFailure: this.#mainNativeFailure, mainCloseDetachAttempted: this.#mainCloseDetachAttempted, mainCloseDetached: this.#mainCloseDetached,
      combinedAbortAttempted: this.#combinedAbortAttempted, combinedAbortDispatchAttempted: this.#combinedAbortDispatchAttempted, combinedOutputCleanupOnly: this.#combinedOutputCleanupOnly,
      frameInspectionConsumed: this.#framesConsumed, scriptInspectionConsumed: this.#scriptConsumed, diagnosticFailure: this.#pipe.status().failure,
      diagnosticFailureObservation: this.#pipe.status().failureObservation,
      workerStartupChannel: this.#startupChannel?.status() ?? null,
      ...(this.#purpose === "visual209" ? { windowNativeFailure: this.#windowNativeFailure,
        windowRestore209AttemptConsumed: this.#windowRestore209Consumed, windowRestore209ReadinessObserved: this.#windowRestore209ReadinessObserved,
        windowRestore209RequestCapacity: this.#pipe.status().failure === null && this.#pcbSourceQualified && !this.#windowRestore209Consumed && !this.#windowResize209Consumed && !this.#windowCapture209Consumed && !this.#rendererCapture209Consumed &&
          CURRENT_WINDOW_CAPTURE_READINESS_LIMITS.queries - this.#windowCapture209ReadinessQueries >= CURRENT_WINDOW_RESTORE_LIMITS.requiredQuerySlots &&
          this.#pipe.status().requestCount <= DIAGNOSTIC_REQUEST_LIMIT - CURRENT_WINDOW_RESTORE_LIMITS.requiredCdpStages * CURRENT_WINDOW_CAPTURE_TRANSPORT_RESERVATION.cdpRequests &&
          MAX_TOTAL - this.#total >= CURRENT_WINDOW_CAPTURE_TRANSPORT_RESERVATION.requiredHeadroomBytes,
        ...(this.#windowRestore209Retained === null ? {} : { windowRestore209RetainedObservation: this.#windowRestore209Retained }),
        windowResize209AttemptConsumed: this.#windowResize209Consumed, windowResize209ReadinessObserved: this.#windowResize209ReadinessObserved,
        windowResize209RequestCapacity: this.#pipe.status().failure === null && this.#pcbSourceQualified && !this.#windowResize209Consumed && !this.#windowCapture209Consumed && !this.#rendererCapture209Consumed &&
          this.#windowCapture209ReadinessQueries < CURRENT_WINDOW_CAPTURE_READINESS_LIMITS.queries && this.#pipe.status().requestCount <= DIAGNOSTIC_REQUEST_LIMIT - 2 * CURRENT_WINDOW_CAPTURE_TRANSPORT_RESERVATION.cdpRequests &&
          MAX_TOTAL - this.#total >= CURRENT_WINDOW_CAPTURE_TRANSPORT_RESERVATION.requiredHeadroomBytes,
        ...(this.#windowResize209Retained === null ? {} : { windowResize209RetainedObservation: this.#windowResize209Retained }),
        windowCaptureReadinessQueriesUsed: this.#windowCapture209ReadinessQueries, windowCapture209AttemptConsumed: this.#windowCapture209Consumed,
        rendererCapture209AttemptConsumed: this.#rendererCapture209Consumed,
        rendererCapture209RetainedObservation: this.#rendererCapture209Retained === null ? null : (() => { const { pngBase64: _png, ...metadata } = this.#rendererCapture209Retained; return metadata; })(),
        windowCapture209NativeDispatchAttempted: this.#windowCapture209DispatchAttempted,
        windowCaptureNativeResourcesMayRemain: this.#windowCapture209DispatchAttempted && !this.#released } : {}),
      ...(this.#windowCapture209Retained === null ? {} : { windowCapture209RetainedObservation: (() => {
        const { pngBase64: _png, ...metadata } = this.#windowCapture209Retained; return metadata;
      })(), windowCaptureObservationAccepted: false as const }),
      ...(this.#visual209RetainedObservation === null ? {} : { visual209RetainedObservation: this.#visual209RetainedObservation,
        visualObservationCurrent: false as const, visualObservationAccepted: false as const }),
      observationFailure: this.#observationFailure,
      lastTerminationObservation: this.#terminationObservation,
      projectOpeningConsumed: this.#projectOpeningConsumed, projectOpeningResult: this.#projectOpeningResult, modelObservationConsumed: this.#modelConsumed,
      pcbOpeningConsumed: this.#pcbOpeningConsumed, pcbOpeningResult: this.#pcbOpeningResult,
      pcbObservationConsumed: this.#pcbObservationConsumed, pcbFrameObservation: this.#pcbFrameObservation, pcbSourceQualified: this.#pcbSourceQualified,
      stringPrecreateConsumed: this.#stringPrecreateConsumed, commonBaselineConsumed: this.#commonBaselineConsumed,
      ...(selectedFileMainPurpose(this.#purpose) ? { selectedSqlFence: this.#mainRunner?.selectedSqlFenceState() ?? null } : {}),
      ...(this.#purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE ? { originalSchematicWorker: this.#schematicWorkerController?.status() ?? null, originalSchematicSaveBodyRetained: this.#schematicSaveCapturedBody !== null } : {}),
      ...(this.#purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE ? { originalViaWorker: this.#viaWorkerController?.status() ?? null, originalViaClockSetupSettled: this.#viaClockSetupSettled } : {}),
      profile: this.#purpose, workerStartupHandoffConsumed: this.#startupHandoffConsumed,
      ...(this.#generatedFixtureBirth ? { generatedFixtureRegistrationPurpose: true as const, generatedFixtureRegistration: this.#generatedFixtureRegistration } : {}) });
  }

  /** Genuine combined factory only waits for this original stdout packet.
   * No request may enter the original stdin before it has been accepted. */
  public async waitFootprintCombinedReady(): Promise<void> {
    if (!bornFootprintTransport(this.#purpose) || this.#combinedReadyWaitAttempted) { throw error("COMBINED_READY_CONSUMED"); }
    this.#combinedReadyWaitAttempted = true;
    const timer = setTimeout(() => { this.#fail("COMBINED_READY_DEADLINE"); }, CURRENT_FOOTPRINT_COMBINED_READY.milliseconds);
    try {
      await this.#combinedReady.promise;
      this.#available(); await this.#verifyInstallation(); this.#available(); await this.#verify(); this.#available();
      if (this.#combinedReadyPacket === null || this.#combinedReadyAbandoned) { throw error("COMBINED_READY_REQUIRED"); }
      this.#combinedFactoryReady = true;
    } finally { clearTimeout(timer); }
  }
  /** EOF is restricted to this original never-written input. It is not a
   * helper kill, native release command or application termination proof. */
  public async closeFootprintCombinedBeforeLaunch(): Promise<void> {
    if (!bornFootprintTransport(this.#purpose) || this.#nativeStdinBytes !== 0 || this.#launchMethodInvoked || this.#combinedReadyEofAttempted) {
      throw error("COMBINED_PRELAUNCH_EOF_REFUSED");
    }
    this.#combinedReadyAbandoned = true; this.#combinedReadyEofAttempted = true;
    if (!this.#childClosed && !this.#child.stdin.writableEnded) { this.#child.stdin.end(); }
    if (this.#childClosed) { return; }
    const expired = Promise.withResolvers<false>();
    const timer = setTimeout(() => { expired.resolve(false); }, CURRENT_FOOTPRINT_COMBINED_READY.eofCleanupMilliseconds);
    try {
      const closed = (async (): Promise<true> => { await this.#closed.promise; return true; })();
      if (!await Promise.race([closed, expired.promise])) { throw error("COMBINED_PRELAUNCH_CHILD_RETAINED"); }
    } finally { clearTimeout(timer); }
  }
  public combinedFactoryFailureDiagnostics(): CurrentFootprintCombinedFactoryFailureDiagnostics {
    return Object.freeze({ profile: "private.current-footprint-combined-factory-failure-diagnostics.v1", helperClosed: this.#childClosed,
      failure: this.#failure, readinessObserved: this.#combinedReadyPacket !== null, launchInvoked: this.#launchMethodInvoked,
      stdinBytesWritten: this.#nativeStdinBytes,
      stderr: Object.freeze({ bytes: this.#stderrBytes, sha256: this.#stderrBytes === 0 ? null : this.#stderrHash.copy().digest("hex"), truncated: this.#stderrTruncated }) });
  }
  #bindingFromOriginalHelper(value: RecordValue): Binding {
    const observed = decodeNativeBinding(value), ready = this.#combinedReadyPacket;
    if (bornFootprintTransport(this.#purpose) && (ready === null || ready.helperInstance !== observed.helperInstance || ready.jobId !== observed.jobId)) {
      throw error("COMBINED_READY_BINDING_CHANGED");
    }
    return observed;
  }
  public async launch(input: Readonly<{ executable: string; executableSha256: string; confirmDiagnosticLaunch: true }>): Promise<Binding> {
    if (bornFootprintTransport(this.#purpose)) {
      this.#launchMethodInvoked = true;
      if (!this.#combinedFactoryReady || this.#combinedReadyPacket === null || this.#combinedReadyAbandoned) { throw error("COMBINED_READY_REQUIRED"); }
    }
    if (this.#launchConsumed) { throw error("LAUNCH_CONSUMED"); }
    const { executable, executableSha256, confirmDiagnosticLaunch } = input;
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare, eslint/no-control-regex -- Exact confirmation and exclusion of native command control characters are required at this boundary.
    if (confirmDiagnosticLaunch !== true || !/^[A-Za-z]:\\[^\u0000-\u001F"\r\n]+\\easyeda-pro\.exe$/u.test(executable) ||
        !/^[a-f\d]{64}$/u.test(executableSha256)) { throw error("LAUNCH_INPUT"); }
    this.#enter(); this.#launchConsumed = true;
    try {
      if (this.#purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE) {
        const original = schematicDisplayFactories.get(this); if (original === undefined) { throw error("SCHEMATIC_DISPLAY_ORIGINAL_FACTORY"); }
        await verifyGeneratedSchematicFixtureOpenCheckpoint(original.allocation.prepared); this.#available();
      }
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      const nativeFile = this.#installation?.plan.files[0];
      if (this.#installation !== null && (nativeFile?.windowsPath !== executable || nativeFile.sha256 !== executableSha256)) { throw error("INSTALLATION_TARGET"); }
      try { this.#binding = this.#bindingFromOriginalHelper(await this.#request({ action: "launch", executable, executableSha256, confirmDiagnosticLaunch: true,
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
    const ready = this.#combinedReadyPacket;
    if (bornFootprintTransport(this.#purpose) && (ready === null || observed["helperInstance"] !== ready.helperInstance || observed["jobId"] !== ready.jobId)) {
      throw error("COMBINED_READY_BINDING_CHANGED");
    }
    if (observed["rootPid"] !== 0) { this.#binding = this.#bindingFromOriginalHelper(observed); }
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
      if (bornFootprintTransport(this.#purpose) || heldCachePurpose(this.#purpose)) { this.#savedCacheBrowserVersion = Object.freeze(structuredClone(version)); }
      return diagnosticBoundedObservation({ schema: "easyeda-pro-control.pcb-diagnostic-browser-observation.v1", version: structuredClone(version),
        targets: this.#browserTargets.map(value => diagnosticTargetSummary(value)), projectFreeVerified: false, profileIsolated: false,
        debuggerSocketAbsenceVerified: false, bridgeAuthentication: false, executionAuthorized: false });
    } catch (caughtError) { this.#input.emit("error", error("BROWSER_OBSERVATION_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Only the distinct read-only purpose may wait for its original UI page.
   * Valid transient inventories consume bounded requests; malformed responses
   * and transport failures stop without retry or alternative target selection.
   */
  async #observeHeldCacheBrowser(current: () => void): Promise<string> {
    const observation = this.#heldCacheStartup;
    if (this.#purpose !== "footprint-held-cache209" || observation === null || this.#browserObservationConsumed || this.#inspectionConsumed) {
      throw error("HELD_CACHE_BROWSER_UNAVAILABLE");
    }
    this.#enter(true); this.#browserObservationConsumed = true;
    try {
      const observed = await observation.observeBrowser(Object.freeze({ assertCurrent: current,
        version: (): Promise<RecordValue> => this.#transfer(() => this.#pipe.getVersion()),
        targets: (): Promise<RecordValue> => this.#transfer(() => this.#pipe.getTargets()),
        pause: (milliseconds: typeof CURRENT_FOOTPRINT_HELD_CACHE_PAGE_READINESS_V3.delayMilliseconds): Promise<void> => delay(milliseconds),
      }));
      current(); this.#browserTargets = observed.targets; this.#savedCacheBrowserVersion = observed.version;
      return observed.targetId;
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
      const currentInventory = diagnosticTargetInventory(targets);
      if (JSON.stringify(currentInventory.find(item => item["targetId"] === targetId)) !== JSON.stringify(original)) {
        const refusal = error("FRAME_TARGET_CHANGED");
        if (heldCachePurpose(this.#purpose)) { issueCurrentFootprintHeldCacheFrameTargetTransition(refusal, this.#browserTargets, currentInventory, targetId); }
        throw refusal;
      }
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

  #schematicReadContext(argumentsValue: GeneratedSchematicDisplayNativeArguments): Readonly<{ prepared: GeneratedSchematicFixtureOpenCheckpoint; context: CurrentPcbDiagnosticContext; pipe: CurrentSchematicDisplayWritePipe; current: () => void }> {
    const context = this.#stagedContext, pipe = this.#pipe, prepared = requireSchematicArguments(this, argumentsValue);
    if (!(pipe instanceof CurrentSchematicDisplayWritePipe) || this.#schematicFailed || this.#schematicDisplayCleanupOnly || context === null || !this.#scriptConsumed || this.#inspectionConsumed || this.#mainRunner?.selectedSqlFenceState()["ready"] !== true ||
      this.#schematicArguments !== null && this.#schematicArguments !== argumentsValue || this.#schematicWorkerArguments !== null && this.#schematicWorkerArguments !== argumentsValue) { throw error("SCHEMATIC_DISPLAY_ORIGINAL_CONTEXT"); }
    const selected = context.openingContext();
    const current = (): void => { this.#available(); requireSchematicArguments(this, argumentsValue);
      if (this.#stagedContext !== context || this.#pipe !== pipe || canonicalJson(context.openingContext()) !== canonicalJson(selected) || this.#schematicArguments !== argumentsValue) { throw error("SCHEMATIC_DISPLAY_CONTEXT_CHANGED"); } };
    return Object.freeze({ prepared, context, pipe, current });
  }
  /** One original registration/project/page Promise, never replayed after a
   * partial result. Its native helper and early main fence belong to this
   * distinct generated-SCH birth, independently from every ordinary opener. */
  public async openGeneratedSchematicDisplay(argumentsValue: GeneratedSchematicDisplayNativeArguments): Promise<ReturnType<typeof validateGeneratedSchematicNavigation>> {
    const selected = this.#schematicReadContext(argumentsValue);
    if (this.#schematicNavigationAttempted || this.#projectOpeningConsumed || this.#schematicArguments !== null) { throw error("SCHEMATIC_DISPLAY_OPEN_CONSUMED"); }
    this.#enter(true); this.#schematicNavigationAttempted = true; this.#projectOpeningConsumed = true; this.#schematicArguments = argumentsValue;
    try {
      await this.#verifyInstallation(); selected.current(); await this.#verify(); selected.current(); await verifyGeneratedSchematicFixtureOpenCheckpoint(selected.prepared); selected.current();
      await this.#observeParent(); selected.current(); await this.#observeOpeningAncillary(); selected.current(); const parent = selected.context.openingContext();
      const before = await this.#transfer(() => selected.pipe.observeSchematicDisplay("start", parent.uniqueContextId)); selected.current();
      if (!exact(before, ["result"]) || !record(before["result"]) || !exact(before["result"], ["type", "value"]) || before["result"]["type"] !== "object") { throw error("SCHEMATIC_DISPLAY_START_REPLY"); }
      const start = before["result"]["value"];
      if (!record(start) || !exact(start, ["windowTabId", "documentTitle"]) || typeof start["windowTabId"] !== "string" || !/^[A-Za-z\d_-]{1,128}$/u.test(start["windowTabId"]) || typeof start["documentTitle"] !== "string" || start["documentTitle"].length === 0 || start["documentTitle"].length > 512) { throw error("SCHEMATIC_DISPLAY_START_VALUE"); }
      this.#schematicWindowTabId = start["windowTabId"];
      if (this.#schematicWorkerArguments !== null) { await this.#prepareSchematicDisplayWorkerParent(start["windowTabId"]); selected.current(); }
      await verifyGeneratedSchematicFixtureOpenCheckpoint(selected.prepared); selected.current();
      selected.context.beginSchematicOpeningTransition(argumentsValue.target.projectUuid, argumentsValue.target.pageUuid);
      const raw = await this.#transfer(() => { this.#schematicNavigationDispatchAttempted = true; return selected.pipe.observeSchematicDisplay("navigate", parent.uniqueContextId, argumentsValue.target); }); selected.current();
      if (!exact(raw, ["result"]) || !record(raw["result"]) || !exact(raw["result"], ["type", "value"]) || raw["result"]["type"] !== "object" || !record(raw["result"]["value"]) || !exact(raw["result"]["value"], ["navigation", "documentTitle"])) { throw error("SCHEMATIC_DISPLAY_NAVIGATION_REPLY"); }
      const value = raw["result"]["value"]; const envelope = value["navigation"];
      if (!record(envelope) || !exact(envelope, ["schema", "utf8Bytes", "json"]) || envelope["schema"] !== "easyeda-pro-control.exact-json.v1" || typeof envelope["json"] !== "string" || Buffer.byteLength(envelope["json"]) !== envelope["utf8Bytes"] || Buffer.byteLength(envelope["json"]) > 65_536 || !envelope["json"].isWellFormed() || typeof value["documentTitle"] !== "string") { throw error("SCHEMATIC_DISPLAY_NAVIGATION_ENVELOPE"); }
      const result = freezeDeep(validateGeneratedSchematicNavigation(JSON.parse(envelope["json"]) as unknown, selected.prepared.qualification)); this.#schematicNavigationResult = result;
      if (result.outcome !== "opened-ready" || result.identity?.windowTabId !== start["windowTabId"]) { throw error("SCHEMATIC_DISPLAY_NAVIGATION_PARTIAL"); }
      const targets = await this.#transfer(() => selected.pipe.getTargets()); selected.current(); const frames = await this.#transfer(() => selected.pipe.getFrameTree()); selected.current();
      selected.context.finishSchematicOpeningTransition(targets, frames, value["documentTitle"]); selected.current(); await this.#observeOpeningAncillary(); selected.current();
      await this.#verifyInstallation(); selected.current(); await this.#verify(); selected.current(); return result;
    } finally { this.#busy = false; }
  }
  /** Source read stages are reachable. Modify waits for the actual accessor
   * closure/source proof and worker custody; Save additionally needs exact
   * body/clock/main SQL authority. No capability is inferred from these data. */
  public async executeSchematicDisplayStage(stage: GeneratedSchematicDisplayStageResult["stage"], argumentsValue: GeneratedSchematicDisplayNativeArguments,
    _dispatch?: GeneratedSchematicDisplayDispatch): Promise<GeneratedSchematicDisplayStageResult | Readonly<{ captured: true }>> {
    const selected = this.#schematicReadContext(argumentsValue);
    if (stage === "modify" || stage === "save") { throw error("SCHEMATIC_DISPLAY_ORIGINAL_SOURCE_WORKER_AND_SQL_REQUIRED"); }
    if (this.#schematicNavigationResult?.outcome !== "opened-ready" || this.#schematicStages.has(stage) || stage !== "capture" && this.#schematicSdkBinding === null) { throw error("SCHEMATIC_DISPLAY_STAGE_CONSUMED"); }
    this.#enter(true); this.#schematicStages.add(stage);
    try {
      await this.#verifyInstallation(); selected.current(); await this.#verify(); selected.current(); await this.#observeParent(); selected.current(); await this.#observeOpeningAncillary(); selected.current();
      const binding = stage === "capture" ? selected.context.openingContext().uniqueContextId : this.#schematicSdkBinding;
      if (binding === null) { throw error("SCHEMATIC_DISPLAY_HOLDER_REQUIRED"); }
      const raw = await this.#transfer(() => selected.pipe.observeSchematicDisplay(stage, binding, argumentsValue.target, argumentsValue.operation)); selected.current();
      if (stage === "capture") {
        if (!exact(raw, ["result"]) || !record(raw["result"]) || !exact(raw["result"], ["type", "subtype", "className", "description", "objectId"]) || raw["result"]["type"] !== "object" || raw["result"]["subtype"] !== "array" || raw["result"]["className"] !== "Array" || raw["result"]["description"] !== "Array(2)" || typeof raw["result"]["objectId"] !== "string" || !/^[A-Za-z\d_.:-]{1,256}$/u.test(raw["result"]["objectId"])) { throw error("SCHEMATIC_DISPLAY_HOLDER_CAPTURE"); }
        this.#schematicSdkBinding = raw["result"]["objectId"]; await this.#observeParent(); selected.current(); await this.#observeOpeningAncillary(); selected.current(); return Object.freeze({ captured: true });
      }
      if (!exact(raw, ["result"]) || !record(raw["result"]) || !exact(raw["result"], ["type", "value"]) || raw["result"]["type"] !== "object") { throw error("SCHEMATIC_DISPLAY_STAGE_REPLY"); }
      const packet = freezeDeep(generatedSchematicDisplayStageResultSchema.parse(raw["result"]["value"]));
      if (!packet.ok || packet.stage !== stage || packet.windowTabId !== this.#schematicWindowTabId) { throw error("SCHEMATIC_DISPLAY_STAGE_REFUSED"); }
      await this.#observeParent(); selected.current(); await this.#observeOpeningAncillary(); selected.current(); await this.#verifyInstallation(); selected.current(); await this.#verify(); selected.current();
      schematicDisplayStagePackets.set(packet, Object.freeze({ owner: this, argumentsValue, stage, text: canonicalJson(packet) })); return packet;
    } finally { this.#busy = false; }
  }
  /** Project-only fixed opening under this original diagnostic process owner.
   * The lifecycle supplies the checkpoint-sealed target and one original
   * reproof callback, after durable intent. No ordinary launcher is borrowed.
   * Even a refused preflight consumes this overall stage; cleanup stays usable. */
  public async openProject(input: CurrentDisposableOpenSealedTarget, reverify: () => Promise<void>): Promise<CurrentPcbDiagnosticOpeningResult> {
    if (this.#startupPurpose) { throw error("STARTUP_LEGACY_ROUTE"); }
    const context = this.#stagedContext, target = currentDisposableOpenSealedTargetSchema.parse(input);
    const generated = this.#generatedFixtureQualification;
    if (this.#generatedFixtureBirth !== (generated !== null) || generated !== null && canonicalJson(generated.target) !== canonicalJson(target)) { throw error("GENERATED_FIXTURE_ORIGINAL_TARGET"); }
    currentPcbDiagnosticOpeningArguments(target, "preflight");
    if (this.#projectOpeningConsumed || context === null || !this.#scriptConsumed || this.#inspectionConsumed ||
        this.#workersConsumed || this.#workerContext !== null || this.#modelConsumed || typeof reverify !== "function") { throw error("PROJECT_OPENING_UNAVAILABLE"); }
    this.#enter(true); this.#projectOpeningConsumed = true; this.#projectOpeningTarget = Object.freeze(target);
    try {
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      await this.#observeOpeningAncillary();
      const selected = context.openingContext();
      await this.#observeParent(); context.openingContext();
      if (generated !== null) {
        const component = this.#componentPrepared;
        let registration: Readonly<Record<string, unknown>>;
        if (generated.schema === "easyeda-pro-control.qualified-generated-component-fixture-target.v1") {
          assertOriginalGeneratedComponentFixtureTarget(generated);
          if (component === null || component.qualification !== generated) { throw error("COMPONENT_ORIGINAL_QUALIFICATION"); }
          await reverify(); context.openingContext(); this.#available();
          registration = decodeGeneratedComponentFixtureRegistrationReply(await this.#transfer(() => this.#pipe.registerGeneratedComponentFixture(selected.uniqueContextId, generated)), generated);
        } else {
          if (component !== null) { throw error("COMPONENT_ORIGINAL_QUALIFICATION"); }
          assertOriginalGeneratedFixtureTarget(generated); await reverify(); context.openingContext(); this.#available();
          registration = decodeGeneratedFixtureRegistrationReply(await this.#transfer(() => this.#pipe.registerGeneratedFixture(selected.uniqueContextId, generated)), generated);
        }
        this.#generatedFixtureRegistration = registration;
        context.openingContext(); await this.#verifyInstallation(); await this.#verify(); this.#available();
      }
      const preflight = decodeCurrentPcbDiagnosticOpeningReply(
        await this.#transfer(() => this.#pipe.observeProjectOpening(selected.uniqueContextId, target, "preflight")), target, "preflight");
      this.#projectOpeningResult = preflight;
      context.openingContext();
      await this.#verifyInstallation(); this.#available();
      if (!preflight.ok) { this.#input.emit("error", error("PROJECT_PREFLIGHT_REFUSED")); return preflight; }
      if (this.#purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE) {
        if (preflight.observation === null) { throw error("PCB_VIA_PARENT_PREFLIGHT_REQUIRED"); }
        await this.#prepareViaWorkerParent(preflight.observation.windowTabId); context.openingContext();
      }
      await reverify(); context.openingContext();
      await this.#verifyInstallation(); await this.#verify(); this.#available();
      await this.#observeParent(); context.openingContext();
      await this.#observeOpeningAncillary(); context.openingContext();
      const titleProof = preflight.observation;
      if (titleProof === null) { throw error("PROJECT_TITLE_PROOF"); }
      const opening = context.beginOpeningTransition(target.projectUuid,
        { initialTitle: titleProof.initialTitle, expectedOpenedTitle: titleProof.expectedOpenedTitle });
      const result = decodeCurrentPcbDiagnosticOpeningReply(
        await this.#transfer(() => { if (this.#purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE) { this.#viaProjectNavigationDispatchAttempted = true; } return this.#pipe.observeProjectOpening(opening.uniqueContextId, target, "open-project"); }), target, "open-project");
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
      this.#projectOpeningResult = Object.freeze({ ...result, ...(ancillaryFrame === null ? {} : { ancillaryFrame }),
        ...(this.#generatedFixtureRegistration === null ? {} : { generatedPathRegistration: this.#generatedFixtureRegistration }) });
      return this.#projectOpeningResult;
    } catch (caughtError) { this.#input.emit("error", error("PROJECT_OPENING_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }
  /** Separate fresh birth only; one exact qualified baseline, no caller path
   * or reconstructed checkpoint. Overall opening consumption still applies. */
  public openGeneratedFixtureProject(qualification: QualifiedGeneratedFixtureTarget, reverify: () => Promise<void>): Promise<CurrentPcbDiagnosticOpeningResult> {
    assertOriginalGeneratedFixtureTarget(qualification);
    if (!this.#generatedFixtureBirth || this.#generatedFixtureQualification !== null || this.#projectOpeningConsumed) { throw error("GENERATED_FIXTURE_OPENING_CONSUMED"); }
    this.#generatedFixtureQualification = qualification;
    return this.openProject(qualification.target, reverify);
  }
  public openGeneratedComponentFixtureProject(prepared: GeneratedComponentFixtureOpenCheckpoint, reverify: () => Promise<void>): Promise<CurrentPcbDiagnosticOpeningResult> {
    assertOriginalGeneratedComponentFixtureOpenCheckpoint(prepared);
    if (this.#purpose !== "pcb-component-spatial209" || this.#componentPrepared !== prepared || !this.#generatedFixtureBirth || this.#generatedFixtureQualification !== null || this.#projectOpeningConsumed) { throw error("COMPONENT_OPENING_CONSUMED"); }
    this.#generatedFixtureQualification = prepared.qualification; return this.openProject(prepared.qualification.target, reverify);
  }
  public retainedGeneratedFixtureRegistration(): Readonly<Record<string, unknown>> | null {
    return this.#generatedFixtureRegistration === null ? null : Object.freeze(structuredClone(this.#generatedFixtureRegistration));
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

  /** Once-only spatial reader for the separately selected disposable purpose.
   * Only its fresh birth can bind the source-admitted PCB realm and fixed callees.
   * Standard renderer intrinsics remain trusted, not independently verified.
   * Existing owners cannot select this transport or qualification budget.
   */
  public observeSpatial209(input: CurrentDisposableOpenSealedTarget, queries: unknown): Promise<readonly CurrentPcb209SpatialResult[]> {
    return this.#observeSpatial209(input, runner => runner.readBatch(queries), CURRENT_PCB_SPATIAL_REQUEST_DERIVATION.spatialStage);
  }
  /** Separate fixed mixed Track/Line and Via program. Both variants share the
   * original one-shot reservation, so a failed read cannot select a fallback. */
  public observeSpatialTrack209(input: CurrentDisposableOpenSealedTarget, queries: unknown): Promise<readonly CurrentPcb209SpatialTrackResult[]> {
    return this.#observeSpatial209(input, runner => runner.readTrackBatch(queries), CURRENT_PCB_SPATIAL_TRACK_REQUEST_DERIVATION.spatialStage);
  }
  /** Circular ArcTrack, Track and Via share the same consumed original slot. */
  public observeSpatialArc209(input: CurrentDisposableOpenSealedTarget, queries: unknown): Promise<readonly CurrentPcb209SpatialArcResult[]> {
    return this.#observeSpatial209(input, runner => runner.readArcBatch(queries), CURRENT_PCB_SPATIAL_ARC_REQUEST_DERIVATION.spatialStage);
  }
  /** A distinct point-only Pad batch on the same original purpose.
   * No excluded-family or region program is an automatic fallback. */
  public observeSpatialPad209(input: CurrentDisposableOpenSealedTarget, queries: unknown): Promise<readonly CurrentPcb209SpatialPadResult[]> {
    return this.#observeSpatial209(input, runner => runner.readPadBatch(queries), CURRENT_PCB_SPATIAL_PAD_REQUEST_DERIVATION.spatialStage);
  }
  /** Keep all ownership, source and cleanup checks identical for both fixed
   * internal variants; the caller supplies neither a program nor a transport. */
  async #observeSpatial209<T>(input: CurrentDisposableOpenSealedTarget,
    read: (runner: CurrentPcbSpatialCaptureRunner) => Promise<T>, stageRequests: number): Promise<T> {
    const context = this.#stagedContext, pipe = this.#pipe, profile = this.#pcbSourceProfile;
    const source = CURRENT_PCB_209_SPATIAL_SOURCE_PROFILE, target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (this.#purpose !== "pcb-spatial209" || !(pipe instanceof CurrentPcbSpatialPipe) || context === null || profile === null ||
        this.#spatial209Consumed || !this.#pcbSourceQualified || this.#pcbFrameObservation?.ok !== true ||
        this.#workersConsumed || this.#modelConsumed || profile.family !== "pcb" || profile.relativePath !== source.relativePath ||
        profile.scriptSha256 !== source.sha256 || profile.scriptBytes !== source.bytes ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("SPATIAL209_UNAVAILABLE"); }
    this.#enter(true); this.#spatial209Consumed = true;
    try {
      const pcb = context.modelContext(), ui = context.pcbOpeningContext();
      /** Reprove the original staged source and both retained realm identities. */
      const current = (): void => {
        this.#available(); context.pcbScript(profile);
        if (this.#stagedContext !== context || JSON.stringify(context.modelContext()) !== JSON.stringify(pcb) ||
            JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(ui)) { throw error("SPATIAL209_CONTEXT"); }
      };
      await this.#verifyInstallation(); current(); await this.#verify(); current();
      await this.#observeParent(); current(); await this.#observeOpeningAncillary(); current();
      // The stage includes all sixteen reads and its original group release.
      // Retain additional capacity for the existing post-observation reproofs.
      if (pipe.status().requestCount + 1 + stageRequests + 16 > CURRENT_PCB_SPATIAL_PROFILE.requestLimit) {
        throw error("SPATIAL209_CAPACITY");
      }
      pipe.bindSpatial({ uniqueContextId: pcb.uniqueContextId, scriptId: pcb.scriptId });
      const runner = new CurrentPcbSpatialCaptureRunner({
        request: (command): Promise<unknown> => this.#transfer(() => pipe.observeSpatial(command)), assertCurrent: current,
      }, pcb.scriptId, pcb.uniqueContextId, target.documentUuid);
      const result = await read(runner);
      current(); await this.#observeParent(); current(); await this.#observeOpeningAncillary(); current();
      await this.#verifyInstallation(); current(); await this.#verify(); current();
      return result;
    } catch (caughtError) { this.#input.emit("error", error("SPATIAL209_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  public async observeComponentSpatial209(input: CurrentDisposableOpenSealedTarget, queries: unknown): Promise<readonly CurrentPcb209ComponentPointResult[]> {
    const context = this.#stagedContext, pipe = this.#pipe, profile = this.#pcbSourceProfile;
    const source = CURRENT_PCB_209_SPATIAL_SOURCE_PROFILE, target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (this.#purpose !== "pcb-component-spatial209" || !(pipe instanceof CurrentPcbComponentSpatialPipe) || context === null || profile === null ||
        this.#spatial209Consumed || !this.#pcbSourceQualified || this.#pcbFrameObservation?.ok !== true ||
        this.#workersConsumed || this.#modelConsumed || profile.family !== "pcb" || profile.relativePath !== source.relativePath ||
        profile.scriptSha256 !== source.sha256 || profile.scriptBytes !== source.bytes ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("SPATIAL209_UNAVAILABLE"); }
    const prepared = this.#componentPrepared;
    if (prepared === null) { throw error("COMPONENT_PREPARED_REQUIRED"); }
    assertOriginalGeneratedComponentFixtureOpenCheckpoint(prepared); const scene = buildCurrentPcbComponentSpatialScene(prepared);
    this.#enter(true); this.#spatial209Consumed = true;
    try {
      const pcb = context.modelContext(), ui = context.pcbOpeningContext();
      /** Reprove the original staged source and both retained realm identities. */
      const current = (): void => {
        requireOriginalCurrentPcbComponentSpatialScene(scene, prepared); this.#available(); context.pcbScript(profile);
        if (this.#stagedContext !== context || JSON.stringify(context.modelContext()) !== JSON.stringify(pcb) ||
            JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(ui)) { throw error("SPATIAL209_CONTEXT"); }
      };
      await this.#verifyInstallation(); current(); await this.#verify(); current();
      await this.#observeParent(); current(); await this.#observeOpeningAncillary(); current();
      // The stage includes all sixteen reads and its original group release.
      // Retain additional capacity for the existing post-observation reproofs.
      if (pipe.status().requestCount + 1 + CURRENT_PCB_COMPONENT_SPATIAL_REQUEST_DERIVATION.spatialStage + 16 > CURRENT_PCB_COMPONENT_SPATIAL_PROFILE.requestLimit) {
        throw error("SPATIAL209_CAPACITY");
      }
      pipe.bindSpatial({ uniqueContextId: pcb.uniqueContextId, scriptId: pcb.scriptId });
      const runner = new CurrentPcbSpatialCaptureRunner({
        request: (command): Promise<unknown> => this.#transfer(() => pipe.observeComponentSpatial(command)), assertCurrent: current,
      }, pcb.scriptId, pcb.uniqueContextId, target.documentUuid, scene);
      const result = await runner.readComponentBatch(queries);
      current(); await this.#observeParent(); current(); await this.#observeOpeningAncillary(); current();
      await this.#verifyInstallation(); current(); await this.#verify(); current();
      return result;
    } catch (caughtError) { this.#input.emit("error", error("SPATIAL209_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }


  /** Trusted coordinator setup only, absent from every MCP operation schema.
   * Retain this exact callback before awaits; actual origin issuance still
   * requires the fresh direct worker and all original imported source pauses. */
  /** Trusted arm callback only. It installs the fixed structure sites while
   * the same original project source is held; construction waits its resume. */
  public armSchematicDisplayProducerPrefixWorker(argumentsValue: GeneratedSchematicDisplayNativeArguments): void {
    requireSchematicArguments(this, argumentsValue); this.#available();
    if (this.#busy || this.#schematicWorkerController !== null || this.#projectOpeningConsumed || this.#schematicProducerGuardOperation !== null || this.#schematicWorkerSetup === null || this.#schematicStructureSetup === null || this.#schematicNavigationDispatchAttempted) { throw error("PROJECT_SAVE_PRODUCER_GUARD_ARM_UNAVAILABLE"); }
    this.#schematicProducerGuardOperation = argumentsValue;
  }
  public armSchematicDisplayStructureTransportWorker(argumentsValue: GeneratedSchematicDisplayNativeArguments, setup: CurrentProjectStructureTransportSetup): void {
    requireSchematicArguments(this, argumentsValue);
    if (this.#busy || this.#schematicTransportSetup !== null || this.#schematicStructureSetup === null || this.#schematicWorkerController !== null || this.#projectOpeningConsumed || typeof setup !== "function" || types.isProxy(setup)) { throw error("PROJECT_STRUCTURE_TRANSPORT_ARM_UNAVAILABLE"); }
    this.#schematicTransportOperation = argumentsValue; this.#schematicTransportSetup = setup;
  }
  public requireSchematicDisplayProducerPrefixReady(argumentsValue: GeneratedSchematicDisplayNativeArguments): CurrentSchematicDisplaySaveProducerPrefix {
    requireSchematicArguments(this, argumentsValue); const token = this.#schematicProducerPrefix; if (token === null) { throw error("PROJECT_SAVE_PRODUCER_PREFIX_READY_REQUIRED"); }
    requireOriginalCurrentProjectSaveProducerPrefix(token, this, argumentsValue); return token;
  }
  public async enrollSchematicDisplayProducerPrefix(argumentsValue: GeneratedSchematicDisplayNativeArguments): Promise<CurrentSchematicDisplaySaveProducerPrefix> {
    requireSchematicArguments(this, argumentsValue); const reproof = this.#schematicProducerGuardReproof, worker = this.#schematicWorkerController;
    if (this.#schematicProducerEnrollmentAttempted || this.#schematicProducerGuardOperation !== argumentsValue || this.#schematicProducerOriginalUploadWrapper === null || this.#schematicProducerOriginalUploadCallback === null || !this.#schematicProducerModeVerified || reproof === null || worker === null || !worker.status().ready || !this.#schematicStages.has("preflight") || this.#schematicStages.has("modify") || this.#schematicStages.has("save")) { throw error("PROJECT_SAVE_PRODUCER_PREFIX_UNAVAILABLE"); }
    this.#schematicProducerEnrollmentAttempted = true; this.#enter(true);
    const original = (): void => { requireSchematicArguments(this, argumentsValue); reproof(); if (this.#schematicProducerGuardReproof !== reproof || this.#schematicWorkerController !== worker || !worker.status().ready || !this.#schematicProducerModeVerified) { throw error("PROJECT_SAVE_PRODUCER_PREFIX_CHANGED"); } };
    try { original(); await this.#verify(); original(); const reply = await this.#request({ action: "schematic-display-producer-prefix-enroll" }); original();
      if (!exact(reply, ["enrolled"]) || reply["enrolled"] !== true) { throw error("PROJECT_SAVE_PRODUCER_PREFIX_NATIVE_ACK"); }
      await this.#verify(); original(); const token: CurrentSchematicDisplaySaveProducerPrefix = Object.freeze({ profile: "private.current-schematic-display-save-producer-prefix.v1" });
      const assertOriginal = (): void => { original(); if (this.#schematicProducerPrefix !== token) { throw error("PROJECT_SAVE_PRODUCER_PREFIX_REPLACED"); } };
      const bindings: CurrentProjectSaveProducerPrefixBindings = Object.freeze({ originalGuardsArmedBeforeAction: true, originalNonprivateBootstrapObserved: true, unexpectedProducerCannotProceed: true, plannedProducerContinuationAuthorized: false, completeUploadFrontierVerified: false,
        assertCurrent: async (): Promise<void> => { assertOriginal(); await this.#verify(); assertOriginal(); } });
      this.#schematicProducerPrefix = token; originalProjectSaveProducerPrefixes.set(token, Object.freeze({ owner: this, operation: argumentsValue, bindings, assertOriginal })); return token;
    } finally { this.#busy = false; }
  }
  public requireSchematicDisplayStructureTransportReady(argumentsValue: GeneratedSchematicDisplayNativeArguments): CurrentSchematicDisplayStructureTransportOrigin {
    requireSchematicArguments(this, argumentsValue); const origin = this.#schematicTransportOrigin, worker = this.#schematicWorkerController;
    if (origin === null || worker === null || this.#schematicTransportOperation !== argumentsValue || this.#schematicTransportCapture === null || !worker.status().ready) { throw error("PROJECT_STRUCTURE_TRANSPORT_READY_REQUIRED"); }
    const original = projectStructureTransportOrigins.get(origin); if (original === undefined || original.owner !== this || original.operation !== argumentsValue) { throw error("PROJECT_STRUCTURE_TRANSPORT_ORIGINAL_READY"); } original.assertOriginal(); return origin;
  }
  public armSchematicDisplaySaveStructureWorker(argumentsValue: GeneratedSchematicDisplayNativeArguments, setup: CurrentProjectSaveStructureSetup): void {
    requireSchematicArguments(this, argumentsValue);
    if (this.#busy || this.#schematicStructureSetup !== null || this.#projectOpeningConsumed || this.#schematicWorkerController !== null || this.#mainRunner?.selectedSqlFenceState()["ready"] !== true || typeof setup !== "function" || types.isProxy(setup)) { throw error("PROJECT_SAVE_STRUCTURE_ARM_UNAVAILABLE"); }
    this.#schematicStructureSetup = setup;
  }
  public armSchematicDisplaySaveWorker(argumentsValue: GeneratedSchematicDisplayNativeArguments, setup: CurrentSchematicDisplaySaveWorkerSetup): void {
    requireSchematicArguments(this, argumentsValue);
    if (this.#busy || this.#schematicWorkerArguments !== null || this.#projectOpeningConsumed || this.#mainRunner?.selectedSqlFenceState()["ready"] !== true ||
      typeof setup !== "function" || types.isProxy(setup)) { throw error("SCHEMATIC_DISPLAY_WORKER_ARM_UNAVAILABLE"); }
    this.#schematicWorkerArguments = argumentsValue; this.#schematicWorkerSetup = setup;
  }
  /** One fixed observer lane across the same original UI/worker sessions.
   * The original opening/SDK Promise retains its separate transport slot. */
  #serializeSchematicDisplayObserver(request: () => Promise<RecordValue>): Promise<RecordValue> {
    const next = (async (): Promise<RecordValue> => { await this.#schematicObserverTail;
      if (this.#purpose !== CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE || this.#schematicDisplayCleanupOnly || this.#schematicFailed) { throw error("SCHEMATIC_DISPLAY_OBSERVER_CLEANUP_ONLY"); }
      return request(); })();
    this.#schematicObserverTail = (async (): Promise<void> => { try { await next; } catch {
      // The original collector retains its refusal.
    } })(); return next;
  }
  async #prepareSchematicDisplayWorkerParent(windowTabId: string): Promise<void> {
    const argumentsValue = this.#schematicWorkerArguments, attachment = this.#stagedAttachment, context = this.#stagedContext, pipe = this.#pipe, setup = this.#schematicWorkerSetup;
    if (argumentsValue === null || setup === null || context === null || attachment === null || !(pipe instanceof CurrentSchematicDisplayWritePipe) || this.#schematicWorkerController !== null ||
      this.#schematicArguments !== argumentsValue) { throw error("SCHEMATIC_DISPLAY_WORKER_ORIGINAL_OPENING"); }
    requireSchematicArguments(this, argumentsValue); const parent = context.openingContext();
    const current = (): void => {
      this.#available(); requireSchematicArguments(this, argumentsValue);
      if (this.#schematicFailed || this.#schematicWorkerArguments !== argumentsValue || this.#schematicWorkerSetup !== setup || this.#stagedContext !== context || this.#stagedAttachment !== attachment ||
        canonicalJson(context.openingContext()) !== canonicalJson(parent)) { throw error("SCHEMATIC_DISPLAY_WORKER_PARENT_CHANGED"); }
    };
    const inventory = diagnosticTargetInventory(await this.#transfer(() => pipe.getTargets())); current();
    const existingWorkers = inventory.filter(row => row["type"] === "worker").map(row => {
      if (typeof row["targetId"] !== "string" || typeof row["url"] !== "string" || typeof row["title"] !== "string") { throw error("SCHEMATIC_DISPLAY_WORKER_INVENTORY"); }
      return Object.freeze({ targetId: row["targetId"], url: row["url"], title: row["title"] });
    });
    const prepared = await this.#request({ action: "schematic-display-worker-prepare", projectUuid: argumentsValue.target.projectUuid, pageUuid: argumentsValue.target.pageUuid, windowTabId });
    if (!exact(prepared, ["prepared"]) || prepared["prepared"] !== true) { throw error("SCHEMATIC_DISPLAY_WORKER_NATIVE_PREPARATION"); } current();
    let controller: CurrentSchematicDisplayWorkerController | null = null;
    const original = (): CurrentSchematicDisplayWorkerController => {
      current(); if (controller === null || this.#schematicWorkerController !== controller) { throw error("SCHEMATIC_DISPLAY_WORKER_ORIGINAL_CURSOR"); } return controller;
    };
    controller = new CurrentSchematicDisplayWorkerController(Object.freeze({ parentSessionId: parent.sessionId, projectUuid: argumentsValue.target.projectUuid, windowTabId,
      existingWorkers: Object.freeze(existingWorkers),
      bindWorker: async (worker: CurrentSchematicDisplayWorkerChild): Promise<void> => {
        original(); pipe.bindSchematicDisplayWorker(worker.sessionId, worker.targetId);
        const bound = await this.#request({ action: "schematic-display-worker-bind", sessionId: worker.sessionId, targetId: worker.targetId, projectUuid: argumentsValue.target.projectUuid, windowTabId });
        if (!exact(bound, ["bound"]) || bound["bound"] !== true) { throw error("SCHEMATIC_DISPLAY_WORKER_NATIVE_BINDING"); } original();
      }, request: async (command: CurrentSchematicDisplayWorkerCommand): Promise<unknown> => { original(); const reply = await this.#serializeSchematicDisplayObserver(() => this.#transfer(() => { original(); return pipe.observeSchematicDisplayWorker(command); })); original(); return reply; },
      poll: async () => { original(); if (this.#mainRunner !== null) { await this.#mainRunner.pumpSelectedSqlFence(); } original(); await this.#pollRenderer(); original(); },
      assertCurrent: async () => { original(); await this.#verify(); original(); },
      projectSourceHeld: async (source: CurrentSchematicDisplayProjectSourceHeld, selectedController: CurrentSchematicDisplayWorkerController): Promise<void> => {
        const selected = original(); if (selected !== selectedController || this.#schematicWorkerOrigin !== null) { throw error("SCHEMATIC_DISPLAY_WORKER_SOURCE_CONSUMED"); }
        const child = selected.requireHeld(source); const sourceToken = qualifyCurrentSchematicDisplaySaveSource(source.source);
        const owner = schematicDisplayFactories.get(this)?.allocation.owner;
        if (owner === undefined || owner === null || owner !== this) { throw error("SCHEMATIC_DISPLAY_WORKER_ORIGINAL_OWNER"); }
        const origin: CurrentSchematicDisplaySaveWorkerOrigin = Object.freeze({ profile: "private.current-schematic-display-save-worker-origin.v1" });
        const bindings: CurrentSchematicDisplaySaveWorkerBindings = Object.freeze({ sessionId: child.sessionId, scriptId: source.scriptId, uniqueContextId: source.uniqueContextId, source: sourceToken,
          request: async (command: CurrentSchematicDisplaySaveCommand): Promise<unknown> => {
            original(); const reply = await this.#serializeSchematicDisplayObserver(() => this.#transfer(() => { original();
              if (command.phase === "schematic-save-entry") { if (this.#schematicProducerEntryAttempted) { throw error("PROJECT_SAVE_PRODUCER_ORIGINAL_ENTRY_CONSUMED"); } this.#schematicProducerEntryAttempted = true; }
              if (command.phase === "schematic-save-body") { if (this.#schematicProducerBodyAttempted || this.#schematicProducerOriginalSaveEntry === null || originalProducerArgument(command.params.arguments, 0) !== this.#schematicProducerOriginalSaveEntry) { throw error("PROJECT_SAVE_PRODUCER_ORIGINAL_BODY_CONSUMED"); } this.#schematicProducerBodyAttempted = true; }
              if (command.phase === "schematic-save-value") { if (this.#schematicSaveBodyCaptureAttempted) { throw error("SCHEMATIC_DISPLAY_SAVE_BODY_CAPTURE_CONSUMED"); } this.#schematicSaveBodyCaptureAttempted = true; }
              if (command.phase === "schematic-save-resume") { selected.reserveSaveResume(source); }
              return pipe.observeSchematicDisplayWorker(command); }));
            if (command.phase === "schematic-save-entry") { if (this.#schematicProducerOriginalSaveEntry !== null) { throw error("PROJECT_SAVE_PRODUCER_ORIGINAL_ENTRY_ONCE"); } this.#schematicProducerOriginalSaveEntry = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(reply, 13); }
            else if (command.phase === "schematic-save-body") { if (this.#schematicProducerOriginalSaveEntry === null || this.#schematicProducerOriginalSaveBody !== null || originalProducerArgument(command.params.arguments, 0) !== this.#schematicProducerOriginalSaveEntry) { throw error("PROJECT_SAVE_PRODUCER_ORIGINAL_BODY_ONCE"); } this.#schematicProducerOriginalSaveBody = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(reply, 6); }
            if (command.phase === "schematic-save-value") { this.#schematicSaveCapturedBody = decodeCurrentSchematicDisplaySaveBodyValue(reply); }
            if (command.phase === "schematic-save-arm") { selected.bindSaveBreakpoint(source, command.role, decodeCurrentSchematicDisplaySaveBreakpoint(reply, command.role, source.scriptId)); }
            original(); return reply;
          },
          nextEvent: (): Promise<CurrentSchematicDisplaySaveWorkerEvent> => selected.nextSaveEvent(),
          assertCurrent: async (): Promise<void> => { original(); selected.requireOriginal(source, child); await this.#verify(); original(); },
          assertSaveAttempt: (): void => { original(); if (!this.#schematicStages.has("save")) { throw error("SCHEMATIC_DISPLAY_SAVE_ORIGINAL_ATTEMPT"); } },
          assertOriginalGenerationExited: (): Promise<void> => {
            requireSchematicArguments(this, argumentsValue); selected.requireOriginal(source, child);
            if (!this.#terminationObserved || this.#terminationObservation?.terminated !== true) { return Promise.reject(error("SCHEMATIC_DISPLAY_ORIGINAL_GENERATION_EXIT_REQUIRED")); } return Promise.resolve();
          }, fail: (): void => { selected.fail(); } });
        schematicDisplaySaveWorkers.set(origin, Object.freeze({ owner, argumentsValue, bindings, source, controller: selected, child, assertOriginal: (): void => {
          if (this.#schematicWorkerOrigin !== origin || this.#schematicWorkerController !== selected || this.#schematicWorkerSetup !== setup || this.#schematicWorkerArguments !== argumentsValue) { throw error("SCHEMATIC_DISPLAY_SAVE_WORKER_CUSTODY_CHANGED"); }
          selected.requireOriginal(source, child);
        } }));
        this.#schematicWorkerOrigin = origin; await Reflect.apply(setup, undefined, [origin]); original(); selected.requireOriginal(source, child);
        const structureSetup = this.#schematicStructureSetup;
        if (structureSetup !== null) {
          if (this.#schematicStructureOrigin !== null) { throw error("PROJECT_SAVE_STRUCTURE_SOURCE_CONSUMED"); }
          const structurePrepared = requireSchematicArguments(this, argumentsValue); const structureOrigin: CurrentProjectSaveStructureOrigin = Object.freeze({ profile: "private.current-schematic-display-save-structure-origin.v1" });
          const assertStructureOriginal = (): void => { requireSchematicArguments(this, argumentsValue); selected.requireOriginal(source, child);
            if (this.#schematicStructureOrigin !== structureOrigin || this.#schematicStructureSetup !== structureSetup || this.#schematicWorkerController !== selected || this.#schematicWorkerOrigin !== origin) { throw error("PROJECT_SAVE_STRUCTURE_CUSTODY_CHANGED"); } };
          const structureBindings: CurrentProjectSaveStructureBindings = Object.freeze({ sessionId: child.sessionId, scriptId: source.scriptId, uniqueContextId: source.uniqueContextId, prepared: structurePrepared,
            request: async (input: Parameters<CurrentProjectSaveStructureBindings["request"]>[0], cleanup: boolean, retain?: (reply: unknown) => void): Promise<unknown> => {
              const command = validateCurrentProjectSaveStructureCommand(input); original(); assertStructureOriginal();
              if (cleanup !== (command.phase === "project-save-structure-remove" || command.phase === "project-save-structure-release")) { throw error("PROJECT_SAVE_STRUCTURE_REQUEST_CLASS"); }
              const historyGrant = command.phase === "project-save-structure-resume" ? originalProjectStructureContinuation(structureOrigin, command.role, this.#schematicStages.has("save")) : null;
              if (historyGrant === undefined) { throw error("PROJECT_SAVE_STRUCTURE_HISTORY_COMPLETION_REQUIRED"); }
              const assertHistory = (): void => { if (historyGrant !== null) { if (command.phase !== "project-save-structure-resume" || originalProjectStructureContinuation(structureOrigin, command.role, this.#schematicStages.has("save")) !== historyGrant) { throw error("PROJECT_SAVE_STRUCTURE_HISTORY_COMPLETION_CHANGED"); } historyGrant.assertCurrent(); } }; assertHistory();
              if (command.phase === "project-save-structure-uploadRelation") { if (this.#schematicProducerRelationAttempted) { throw error("PROJECT_SAVE_PRODUCER_CONSTRUCTOR_RELATION_CONSUMED"); } this.#schematicProducerRelationAttempted = true; }
              if (retain !== undefined && (typeof retain !== "function" || types.isProxy(retain))) { throw error("PROJECT_SAVE_STRUCTURE_RETAIN_CALLBACK"); }
              const reply = await this.#serializeSchematicDisplayObserver(() => this.#transfer(async () => { original(); assertStructureOriginal();
                if (command.phase === "project-save-structure-resume") { assertHistory(); if (command.role === "bootstrap" && !this.#schematicProducerModeVerified) { throw error("PROJECT_SAVE_PRODUCER_NONPRIVATE_MODE_REQUIRED"); } selected.reserveStructureResume(source, command.role); }
                const actual = await pipe.observeSchematicDisplayWorker(command);
                if (command.phase === "project-save-structure-uploadRelation") {
                  if (this.#schematicProducerOriginalUploadWrapper !== null || this.#schematicProducerOriginalUploadCallback !== null || !exact(actual, ["result"]) || !record(actual["result"]) || !exact(actual["result"], ["type", "value"]) || actual["result"]["type"] !== "boolean" || actual["result"]["value"] !== true) { throw error("PROJECT_SAVE_PRODUCER_ORIGINAL_CONSTRUCTOR_RELATION"); }
                  this.#schematicProducerOriginalUploadWrapper = originalProducerArgument(command.params.arguments, 1); this.#schematicProducerOriginalUploadCallback = originalProducerArgument(command.params.arguments, 2);
                }
                if (command.phase === "project-save-structure-frame" && command.role === "mode") { if (this.#schematicProducerModeArray !== null) { throw error("PROJECT_SAVE_PRODUCER_MODE_ONCE"); } this.#schematicProducerModeArray = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(actual, 1); }
                else if (command.phase === "project-save-structure-properties" && command.params.objectId === this.#schematicProducerModeArray) { decodeCurrentProjectSaveProducerNonprivateMode(actual); this.#schematicProducerModeVerified = true; }
                if (retain !== undefined) { Reflect.apply(retain, undefined, [actual]); }
                return actual;
              }));
              if (command.phase === "project-save-structure-arm") {
                const site = CURRENT_PROJECT_SAVE_STRUCTURE_SITES[command.role];
                if (!record(reply) || !exact(reply, ["breakpointId", "actualLocation"]) || typeof reply["breakpointId"] !== "string" || !record(reply["actualLocation"]) || !exact(reply["actualLocation"], ["scriptId", "lineNumber", "columnNumber"]) || reply["actualLocation"]["scriptId"] !== source.scriptId || reply["actualLocation"]["lineNumber"] !== site.lineNumber || reply["actualLocation"]["columnNumber"] !== site.columnNumber) { throw error("PROJECT_SAVE_STRUCTURE_ARM_REPLY"); }
                selected.bindStructureBreakpoint(source, command.role, reply["breakpointId"]);
              }
              original(); assertStructureOriginal();
              assertHistory(); return reply;
            }, nextEvent: () => selected.nextStructureEvent(),
            assertCurrent: async (): Promise<void> => { original(); assertStructureOriginal(); await this.#verify(); original(); assertStructureOriginal(); },
            assertStartupPending: (): void => { original(); assertStructureOriginal(); if (this.#schematicStages.has("save")) { throw error("PROJECT_SAVE_STRUCTURE_STARTUP_OVER"); } },
            assertOperationPending: (): void => { original(); assertStructureOriginal(); if (!(this.#schematicStages.has("save"))) { throw error("PROJECT_SAVE_STRUCTURE_ORIGINAL_SAVE_REQUIRED"); } },
            assertOriginalGenerationExited: (): Promise<void> => { assertStructureOriginal(); if (!this.#terminationObserved || this.#terminationObservation?.terminated !== true) { return Promise.reject(error("PROJECT_SAVE_STRUCTURE_ORIGINAL_EXIT_REQUIRED")); } return Promise.resolve(); },
            fail: (): void => { selected.fail(); } });
          projectSaveStructureOrigins.set(structureOrigin, Object.freeze({ owner, operation: argumentsValue, bindings: structureBindings, assertOriginal: assertStructureOriginal }));
          this.#schematicStructureOrigin = structureOrigin; await Reflect.apply(structureSetup, undefined, [structureOrigin]); original(); assertStructureOriginal(); selected.requireStructureArmed(source);
        }
        const transportSetup = this.#schematicTransportSetup;
        if (transportSetup !== null) {
          if (this.#schematicTransportOrigin !== null || this.#schematicTransportOperation !== argumentsValue || this.#schematicStructureOrigin === null) { throw error("PROJECT_STRUCTURE_TRANSPORT_SOURCE_CONSUMED"); }
          qualifyCurrentProjectStructureTransportSource(source.source); selected.requireStructureArmed(source); pipe.bindSchematicDisplayStructureTransport(source.uniqueContextId);
          const bound = await this.#request({ action: "schematic-display-structure-transport-bind", workerContext: source.uniqueContextId });
          if (!exact(bound, ["bound"]) || bound["bound"] !== true) { throw error("PROJECT_STRUCTURE_TRANSPORT_NATIVE_BINDING"); } original(); selected.requireOriginal(source, child);
          const transportPrepared = requireSchematicArguments(this, argumentsValue); const transportOrigin: CurrentSchematicDisplayStructureTransportOrigin = Object.freeze({ profile: "private.current-schematic-display-structure-transport-origin.v1" });
          const assertTransportOriginal = (): void => { requireSchematicArguments(this, argumentsValue); selected.requireOriginal(source, child);
            if (this.#schematicTransportOrigin !== transportOrigin || this.#schematicTransportSetup !== transportSetup || this.#schematicTransportOperation !== argumentsValue || this.#schematicWorkerController !== selected || this.#schematicWorkerOrigin !== origin) { throw error("PROJECT_STRUCTURE_TRANSPORT_CUSTODY_CHANGED"); } };
          const transportBindings: CurrentProjectStructureTransportBindings = Object.freeze({ sessionId: child.sessionId, scriptId: source.scriptId, uniqueContextId: source.uniqueContextId, prepared: transportPrepared,
            request: async (input: Parameters<CurrentProjectStructureTransportBindings["request"]>[0], cleanup: boolean): Promise<unknown> => {
              const command = validateCurrentProjectStructureTransportCommand(input); original(); assertTransportOriginal();
              if (cleanup !== (command.phase === "project-structure-transport-remove" || command.phase === "project-structure-transport-release")) { throw error("PROJECT_STRUCTURE_TRANSPORT_REQUEST_CLASS"); }
              if (command.phase === "project-structure-transport-capture") { if (this.#schematicTransportCaptureAttempted || command.params.uniqueContextId !== source.uniqueContextId) { throw error("PROJECT_STRUCTURE_TRANSPORT_CAPTURE_ONCE"); } this.#schematicTransportCaptureAttempted = true; }
              if (command.phase === "project-structure-transport-arm" && command.params.location.scriptId !== source.scriptId) { throw error("PROJECT_STRUCTURE_TRANSPORT_SOURCE_SCRIPT"); }
              if (command.phase === "project-structure-transport-send" && (this.#schematicTransportCapture === null || command.params.arguments[0].objectId !== this.#schematicTransportCapture || command.params.objectId !== this.#schematicTransportSendFrame || this.#schematicTransportSendPacket !== null)) { throw error("PROJECT_STRUCTURE_TRANSPORT_ORIGINAL_SEND"); }
              if (command.phase === "project-structure-transport-value" && command.params.objectId !== this.#schematicTransportSendPacket || command.phase === "project-structure-transport-returned" && (command.params.arguments[0].objectId !== this.#schematicTransportSendPacket || command.params.objectId !== this.#schematicTransportReturnedFrame)) { throw error("PROJECT_STRUCTURE_TRANSPORT_ORIGINAL_PACKET"); }
              let grant: Readonly<{ assertCurrent: () => void }> | null | undefined = null;
              if (command.phase === "project-structure-transport-resume") { grant = command.role === "send" ? projectStructureTransportBodyGrants.get(transportOrigin) : projectStructureTransportPublicationGrants.get(transportOrigin); }
              if (grant === undefined) { throw error("PROJECT_STRUCTURE_TRANSPORT_CONTINUATION_GRANT_REQUIRED"); }
              const assertGrant = (): void => { if (grant !== null) { const activeGrant = command.phase === "project-structure-transport-resume" && command.role === "send" ? projectStructureTransportBodyGrants.get(transportOrigin) : projectStructureTransportPublicationGrants.get(transportOrigin); if (activeGrant !== grant) { throw error("PROJECT_STRUCTURE_TRANSPORT_GRANT_CHANGED"); } grant.assertCurrent(); } }; assertGrant();
              const reply = await this.#serializeSchematicDisplayObserver(() => this.#transfer(() => { original(); assertTransportOriginal(); assertGrant();
                if (command.phase === "project-structure-transport-resume") { selected.reserveStructureTransportResume(source, command.role); }
                return pipe.observeSchematicDisplayStructureTransport(command);
              }));
              if (command.phase === "project-structure-transport-capture") { this.#schematicTransportCapture = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(reply, CURRENT_PROJECT_STRUCTURE_TRANSPORT_NATIVE_CAPTURE_LENGTH); }
              else if (command.phase === "project-structure-transport-frame") {
                const handle = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(reply, CURRENT_PROJECT_STRUCTURE_TRANSPORT_SITES[command.role].length);
                if (command.role === "send") { this.#schematicTransportSendFrame = handle; } else if (command.role === "returned") { this.#schematicTransportReturnedFrame = handle; }
              } else if (command.phase === "project-structure-transport-send") { this.#schematicTransportSendPacket = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(reply, 3); }
              else if (command.phase === "project-structure-transport-arm") {
                const site = CURRENT_PROJECT_STRUCTURE_TRANSPORT_SITES[command.role];
                if (!record(reply) || !exact(reply, ["breakpointId", "actualLocation"]) || typeof reply["breakpointId"] !== "string" || !record(reply["actualLocation"]) || !exact(reply["actualLocation"], ["scriptId", "lineNumber", "columnNumber"]) || reply["actualLocation"]["scriptId"] !== source.scriptId || reply["actualLocation"]["lineNumber"] !== site.lineNumber || reply["actualLocation"]["columnNumber"] !== site.columnNumber) { throw error("PROJECT_STRUCTURE_TRANSPORT_ARM_REPLY"); }
                selected.bindStructureTransportBreakpoint(source, command.role, reply["breakpointId"]);
              }
              original(); assertTransportOriginal(); assertGrant(); return reply;
            }, nextEvent: () => selected.nextStructureTransportEvent(), assertCurrent: async (): Promise<void> => { original(); assertTransportOriginal(); await this.#verify(); original(); assertTransportOriginal(); },
            assertOperationPending: (): void => { original(); assertTransportOriginal(); if (!(this.#schematicStages.has("save"))) { throw error("PROJECT_STRUCTURE_TRANSPORT_ORIGINAL_SAVE_REQUIRED"); } },
            assertOriginalGenerationExited: (): Promise<void> => { assertTransportOriginal(); if (!this.#terminationObserved || this.#terminationObservation?.terminated !== true) { return Promise.reject(error("PROJECT_STRUCTURE_TRANSPORT_ORIGINAL_EXIT_REQUIRED")); } return Promise.resolve(); }, fail: (): void => { selected.fail(); } });
          projectStructureTransportOrigins.set(transportOrigin, Object.freeze({ owner, operation: argumentsValue, bindings: transportBindings, assertOriginal: assertTransportOriginal })); this.#schematicTransportOrigin = transportOrigin;
          await Reflect.apply(transportSetup, undefined, [transportOrigin]); original(); assertTransportOriginal(); selected.requireStructureTransportArmed(source); if (this.#schematicTransportCapture === null) { throw error("PROJECT_STRUCTURE_TRANSPORT_CAPTURE_REQUIRED"); }
        }
        if (this.#schematicProducerGuardOperation !== null) {
          if (this.#schematicProducerGuardOperation !== argumentsValue || this.#schematicProducerGuardArmed || this.#schematicStructureOrigin === null) { throw error("PROJECT_SAVE_PRODUCER_GUARD_SOURCE_CONSUMED"); }
          qualifyCurrentProjectSaveProducerGuardSource(source.source); qualifyCurrentProjectSaveProducerSource(source.source); selected.requireStructureArmed(source);
          for (const command of currentProjectSaveProducerGuardCases(source.scriptId)) {
            const reply = await this.#serializeSchematicDisplayObserver(() => this.#transfer(() => { original(); selected.requireOriginal(source, child); return pipe.observeSchematicDisplayProducerGuard(command); }));
            const site = command.params.location;
            if (!record(reply) || !exact(reply, ["breakpointId", "actualLocation"]) || typeof reply["breakpointId"] !== "string" || !record(reply["actualLocation"]) || !exact(reply["actualLocation"], ["scriptId", "lineNumber", "columnNumber"]) || reply["actualLocation"]["scriptId"] !== source.scriptId || reply["actualLocation"]["lineNumber"] !== site.lineNumber || reply["actualLocation"]["columnNumber"] !== site.columnNumber) { throw error("PROJECT_SAVE_PRODUCER_GUARD_ARM_REPLY"); }
            selected.bindProducerGuardBreakpoint(source, command.role, reply["breakpointId"]); original(); selected.requireOriginal(source, child);
          }
          selected.requireProducerGuardsArmed(source); this.#schematicProducerGuardArmed = true;
          this.#schematicProducerGuardReproof = (): void => { original(); selected.requireOriginal(source, child); selected.requireProducerGuardsArmed(source); if (this.#schematicProducerGuardOperation !== argumentsValue || this.#schematicWorkerController !== selected || !this.#schematicProducerGuardArmed) { throw error("PROJECT_SAVE_PRODUCER_GUARD_CUSTODY_CHANGED"); } };
        }
      }, releaseParentWait: async () => { original(); const reply = await this.#transfer(() => pipe.configureSchematicDisplayWorkerRunning());
        if (!exact(reply, [])) { throw error("SCHEMATIC_DISPLAY_WORKER_PARENT_RUNNING_REPLY"); } original(); },
      fail: (): void => { this.#schematicFailed = true; } }));
    this.#schematicWorkerController = controller;
    const reply = await this.#transfer(() => pipe.enableSchematicDisplayWorkerDiscovery(event => { if (controller === null) { throw error("SCHEMATIC_DISPLAY_WORKER_ORIGINAL_CURSOR"); }
      const targetInfo = event.params["targetInfo"];
      if (!this.#schematicNavigationDispatchAttempted && event.method === "Target.attachedToTarget" && record(targetInfo) && targetInfo["title"] === `project_${argumentsValue.target.projectUuid}_${windowTabId}`) { controller.fail(); return; }
      controller.observeEvent(event); }));
    if (!exact(reply, [])) { throw error("SCHEMATIC_DISPLAY_WORKER_PARENT_ARM_REPLY"); } original();
  }
  /** Trusted arm callback only. It installs the fixed structure sites while
   * the same original project source is held; construction waits its resume. */
  public armViaProducerPrefixWorker(plan: CurrentPcbViaWritePlan): void {
    requireViaPlan(this, plan); this.#available();
    if (this.#busy || this.#viaWorkerController !== null || this.#projectOpeningConsumed || this.#viaProducerGuardOperation !== null || this.#viaWorkerSetup === null || this.#viaStructureSetup === null || this.#viaProjectNavigationDispatchAttempted) { throw error("PROJECT_SAVE_PRODUCER_GUARD_ARM_UNAVAILABLE"); }
    this.#viaProducerGuardOperation = plan;
  }
  public armViaStructureTransportWorker(plan: CurrentPcbViaWritePlan, setup: CurrentProjectStructureTransportSetup): void {
    requireViaPlan(this, plan);
    if (this.#busy || this.#viaTransportSetup !== null || this.#viaStructureSetup === null || this.#viaWorkerController !== null || this.#projectOpeningConsumed || typeof setup !== "function" || types.isProxy(setup)) { throw error("PROJECT_STRUCTURE_TRANSPORT_ARM_UNAVAILABLE"); }
    this.#viaTransportOperation = plan; this.#viaTransportSetup = setup;
  }
  public requireViaProducerPrefixReady(plan: CurrentPcbViaWritePlan): CurrentPcbViaSaveProducerPrefix {
    requireViaPlan(this, plan); const token = this.#viaProducerPrefix; if (token === null) { throw error("PROJECT_SAVE_PRODUCER_PREFIX_READY_REQUIRED"); }
    requireOriginalCurrentProjectSaveProducerPrefix(token, this, plan); return token;
  }
  public async enrollViaProducerPrefix(plan: CurrentPcbViaWritePlan): Promise<CurrentPcbViaSaveProducerPrefix> {
    requireViaPlan(this, plan); const reproof = this.#viaProducerGuardReproof, worker = this.#viaWorkerController;
    if (this.#viaProducerEnrollmentAttempted || this.#viaProducerGuardOperation !== plan || this.#viaProducerOriginalUploadWrapper === null || this.#viaProducerOriginalUploadCallback === null || !this.#viaProducerModeVerified || reproof === null || worker === null || !worker.status().ready || !this.#viaSdkPhases.has("preflight") || this.#viaSdkPhases.has("create") || this.#viaSdkPhases.has("save")) { throw error("PROJECT_SAVE_PRODUCER_PREFIX_UNAVAILABLE"); }
    this.#viaProducerEnrollmentAttempted = true; this.#enter(true);
    const original = (): void => { requireViaPlan(this, plan); reproof(); if (this.#viaProducerGuardReproof !== reproof || this.#viaWorkerController !== worker || !worker.status().ready || !this.#viaProducerModeVerified) { throw error("PROJECT_SAVE_PRODUCER_PREFIX_CHANGED"); } };
    try { original(); await this.#verify(); original(); const reply = await this.#request({ action: "pcb-via-producer-prefix-enroll" }); original();
      if (!exact(reply, ["enrolled"]) || reply["enrolled"] !== true) { throw error("PROJECT_SAVE_PRODUCER_PREFIX_NATIVE_ACK"); }
      await this.#verify(); original(); const token: CurrentPcbViaSaveProducerPrefix = Object.freeze({ profile: "private.current-pcb-via-save-producer-prefix.v1" });
      const assertOriginal = (): void => { original(); if (this.#viaProducerPrefix !== token) { throw error("PROJECT_SAVE_PRODUCER_PREFIX_REPLACED"); } };
      const bindings: CurrentProjectSaveProducerPrefixBindings = Object.freeze({ originalGuardsArmedBeforeAction: true, originalNonprivateBootstrapObserved: true, unexpectedProducerCannotProceed: true, plannedProducerContinuationAuthorized: false, completeUploadFrontierVerified: false,
        assertCurrent: async (): Promise<void> => { assertOriginal(); await this.#verify(); assertOriginal(); } });
      this.#viaProducerPrefix = token; originalProjectSaveProducerPrefixes.set(token, Object.freeze({ owner: this, operation: plan, bindings, assertOriginal })); return token;
    } finally { this.#busy = false; }
  }
  public requireViaStructureTransportReady(plan: CurrentPcbViaWritePlan): CurrentPcbViaStructureTransportOrigin {
    requireViaPlan(this, plan); const origin = this.#viaTransportOrigin, worker = this.#viaWorkerController;
    if (origin === null || worker === null || this.#viaTransportOperation !== plan || this.#viaTransportCapture === null || !worker.status().ready) { throw error("PROJECT_STRUCTURE_TRANSPORT_READY_REQUIRED"); }
    const original = projectStructureTransportOrigins.get(origin); if (original === undefined || original.owner !== this || original.operation !== plan) { throw error("PROJECT_STRUCTURE_TRANSPORT_ORIGINAL_READY"); } original.assertOriginal(); return origin;
  }
  public armViaSaveStructureWorker(plan: CurrentPcbViaWritePlan, setup: CurrentProjectSaveStructureSetup): void {
    requireViaPlan(this, plan);
    if (this.#busy || this.#viaStructureSetup !== null || this.#projectOpeningConsumed || this.#viaWorkerController !== null || this.#mainRunner?.selectedSqlFenceState()["ready"] !== true || typeof setup !== "function" || types.isProxy(setup)) { throw error("PROJECT_SAVE_STRUCTURE_ARM_UNAVAILABLE"); }
    this.#viaStructureSetup = setup;
  }
  public armViaSaveWorker(plan: CurrentPcbViaWritePlan, setup: CurrentPcbViaSaveWorkerSetup): void {
    requireViaPlan(this, plan);
    if (this.#viaWorkerPlan !== null || this.#projectOpeningConsumed || this.#mainRunner?.selectedSqlFenceState()["ready"] !== true ||
      typeof setup !== "function" || types.isProxy(setup)) { throw error("PCB_VIA_WORKER_ARM_UNAVAILABLE"); }
    this.#viaWorkerPlan = plan; this.#viaWorkerSetup = setup;
  }
  /** One fixed observer lane across the same original UI/worker sessions.
   * The original opening/SDK Promise retains its separate transport slot. */
  #serializeViaObserver(request: () => Promise<RecordValue>): Promise<RecordValue> {
    const next = (async (): Promise<RecordValue> => { await this.#viaObserverTail;
      if (this.#purpose !== CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE || this.#viaCleanupOnly || this.#viaFailed) { throw error("PCB_VIA_OBSERVER_CLEANUP_ONLY"); }
      return request(); })();
    this.#viaObserverTail = (async (): Promise<void> => { try { await next; } catch {
      // The original collector retains its refusal.
    } })(); return next;
  }
  async #prepareViaWorkerParent(windowTabId: string): Promise<void> {
    const attachment = this.#stagedAttachment, context = this.#stagedContext, pipe = this.#pipe, plan = this.#viaWorkerPlan, setup = this.#viaWorkerSetup;
    if (plan === null || setup === null || context === null || attachment === null || !(pipe instanceof CurrentPcbViaWritePipe) || this.#viaWorkerController !== null ||
      canonicalJson(plan.target) !== canonicalJson(this.#projectOpeningTarget)) { throw error("PCB_VIA_WORKER_ORIGINAL_OPENING"); }
    requireViaPlan(this, plan); const parent = context.openingContext();
    const current = (): void => {
      this.#available(); requireViaPlan(this, plan);
      if (this.#viaFailed || this.#viaWorkerPlan !== plan || this.#viaWorkerSetup !== setup || this.#stagedContext !== context || this.#stagedAttachment !== attachment ||
        canonicalJson(this.#pcbSourceQualified ? context.pcbOpeningContext() : context.openingContext()) !== canonicalJson(parent)) { throw error("PCB_VIA_WORKER_PARENT_CHANGED"); }
    };
    const inventory = diagnosticTargetInventory(await this.#transfer(() => pipe.getTargets())); current();
    const existingWorkers = inventory.filter(row => row["type"] === "worker").map(row => {
      if (typeof row["targetId"] !== "string" || typeof row["url"] !== "string" || typeof row["title"] !== "string") { throw error("PCB_VIA_WORKER_INVENTORY"); }
      return Object.freeze({ targetId: row["targetId"], url: row["url"], title: row["title"] });
    });
    let controller: CurrentPcbViaWorkerController | null = null;
    const original = (): CurrentPcbViaWorkerController => {
      current(); if (controller === null || this.#viaWorkerController !== controller) { throw error("PCB_VIA_WORKER_ORIGINAL_CURSOR"); } return controller;
    };
    controller = new CurrentPcbViaWorkerController(Object.freeze({ parentSessionId: parent.sessionId, projectUuid: plan.target.projectUuid, windowTabId,
      existingWorkers: Object.freeze(existingWorkers),
      bindWorker: async (worker: CurrentPcbViaWorkerChild): Promise<void> => {
        original(); pipe.bindViaWorker(worker.sessionId, worker.targetId);
        const bound = await this.#request({ action: "pcb-via-worker-bind", sessionId: worker.sessionId, targetId: worker.targetId, projectUuid: plan.target.projectUuid, windowTabId });
        if (!exact(bound, ["bound"]) || bound["bound"] !== true) { throw error("PCB_VIA_WORKER_NATIVE_BINDING"); } original();
      }, request: async (command: CurrentPcbViaWorkerCommand): Promise<unknown> => { original(); const reply = await this.#serializeViaObserver(() => this.#transfer(() => { original(); return pipe.observeViaWorker(command); })); original(); return reply; },
      poll: async () => { original(); if (this.#mainRunner !== null) { await this.#mainRunner.pumpSelectedSqlFence(); } original(); await this.#pollRenderer(); original(); },
      assertCurrent: async () => { original(); await this.#verify(); original(); },
      projectSourceHeld: async (source: CurrentPcbViaProjectSourceHeld, selectedController: CurrentPcbViaWorkerController): Promise<void> => {
        const selected = original(); if (selected !== selectedController || this.#viaWorkerOrigin !== null) { throw error("PCB_VIA_WORKER_SOURCE_CONSUMED"); }
        const child = selected.requireHeld(source); const sourceToken = qualifyCurrentPcbViaSaveSource(source.source);
        const owner = pcbViaWriteFactories.get(this)?.allocation.owner;
        if (owner === undefined || owner === null || owner !== this) { throw error("PCB_VIA_WORKER_ORIGINAL_OWNER"); }
        const origin: CurrentPcbViaSaveWorkerOrigin = Object.freeze({ profile: "private.current-pcb-via-save-worker-origin.v1" });
        const bindings: CurrentPcbViaSaveWorkerBindings = Object.freeze({ sessionId: child.sessionId, scriptId: source.scriptId, uniqueContextId: source.uniqueContextId, source: sourceToken,
          request: async (command: CurrentPcbViaSaveCommand): Promise<unknown> => {
            original(); const reply = await this.#serializeViaObserver(() => this.#transfer(() => { original();
              if (command.phase === "via-save-entry") { if (this.#viaProducerEntryAttempted) { throw error("PROJECT_SAVE_PRODUCER_ORIGINAL_ENTRY_CONSUMED"); } this.#viaProducerEntryAttempted = true; }
              if (command.phase === "via-save-body") { if (this.#viaProducerBodyAttempted || this.#viaProducerOriginalSaveEntry === null || originalProducerArgument(command.params.arguments, 0) !== this.#viaProducerOriginalSaveEntry) { throw error("PROJECT_SAVE_PRODUCER_ORIGINAL_BODY_CONSUMED"); } this.#viaProducerBodyAttempted = true; }
              if (command.phase === "via-save-value") { if (this.#viaSaveBodyCaptureAttempted) { throw error("PCB_VIA_SAVE_BODY_CAPTURE_CONSUMED"); } this.#viaSaveBodyCaptureAttempted = true; }
              if (command.phase === "via-save-resume") { selected.reserveSaveResume(source); }
              return pipe.observeViaWorker(command); }));
            if (command.phase === "via-save-entry") { if (this.#viaProducerOriginalSaveEntry !== null) { throw error("PROJECT_SAVE_PRODUCER_ORIGINAL_ENTRY_ONCE"); } this.#viaProducerOriginalSaveEntry = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(reply, 13); }
            else if (command.phase === "via-save-body") { if (this.#viaProducerOriginalSaveEntry === null || this.#viaProducerOriginalSaveBody !== null || originalProducerArgument(command.params.arguments, 0) !== this.#viaProducerOriginalSaveEntry) { throw error("PROJECT_SAVE_PRODUCER_ORIGINAL_BODY_ONCE"); } this.#viaProducerOriginalSaveBody = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(reply, 6); }
            if (command.phase === "via-save-value") { this.#viaSaveCapturedBody = decodeCurrentPcbViaSavePendingBodyValue(reply); }
            if (command.phase === "via-save-arm") { selected.bindSaveBreakpoint(source, command.role, decodeCurrentPcbViaSaveBreakpoint(reply, command.role, source.scriptId)); }
            original(); return reply;
          },
          nextEvent: (): Promise<CurrentPcbViaSaveWorkerEvent> => selected.nextSaveEvent(),
          assertCurrent: async (): Promise<void> => { original(); selected.requireOriginal(source, child); await this.#verify(); original(); },
          assertSaveAttempt: (): void => { original(); if (!this.#viaSdkPhases.has("save")) { throw error("PCB_VIA_SAVE_ORIGINAL_ATTEMPT"); } },
          assertOriginalGenerationExited: (): Promise<void> => {
            requireViaPlan(this, plan); selected.requireOriginal(source, child);
            if (!this.#terminationObserved || this.#terminationObservation?.terminated !== true) { return Promise.reject(error("PCB_VIA_ORIGINAL_GENERATION_EXIT_REQUIRED")); } return Promise.resolve();
          }, fail: (): void => { selected.fail(); } });
        pcbViaSaveWorkers.set(origin, Object.freeze({ owner, plan, bindings, source, controller: selected, child, assertOriginal: (): void => {
          if (this.#viaWorkerOrigin !== origin || this.#viaWorkerController !== selected || this.#viaWorkerSetup !== setup || this.#viaWorkerPlan !== plan) { throw error("PCB_VIA_SAVE_WORKER_CUSTODY_CHANGED"); }
          selected.requireOriginal(source, child);
        } }));
        this.#viaWorkerOrigin = origin; await Reflect.apply(setup, undefined, [origin]); original(); selected.requireOriginal(source, child);
        const structureSetup = this.#viaStructureSetup;
        if (structureSetup !== null) {
          if (this.#viaStructureOrigin !== null) { throw error("PROJECT_SAVE_STRUCTURE_SOURCE_CONSUMED"); }
          const structurePrepared = requireOriginalCurrentPcbViaWritePlan(plan).prepared; const structureOrigin: CurrentProjectSaveStructureOrigin = Object.freeze({ profile: "private.current-pcb-via-save-structure-origin.v1" });
          const assertStructureOriginal = (): void => { requireViaPlan(this, plan); selected.requireOriginal(source, child);
            if (this.#viaStructureOrigin !== structureOrigin || this.#viaStructureSetup !== structureSetup || this.#viaWorkerController !== selected || this.#viaWorkerOrigin !== origin) { throw error("PROJECT_SAVE_STRUCTURE_CUSTODY_CHANGED"); } };
          const structureBindings: CurrentProjectSaveStructureBindings = Object.freeze({ sessionId: child.sessionId, scriptId: source.scriptId, uniqueContextId: source.uniqueContextId, prepared: structurePrepared,
            request: async (input: Parameters<CurrentProjectSaveStructureBindings["request"]>[0], cleanup: boolean, retain?: (reply: unknown) => void): Promise<unknown> => {
              const command = validateCurrentProjectSaveStructureCommand(input); original(); assertStructureOriginal();
              if (cleanup !== (command.phase === "project-save-structure-remove" || command.phase === "project-save-structure-release")) { throw error("PROJECT_SAVE_STRUCTURE_REQUEST_CLASS"); }
              const historyGrant = command.phase === "project-save-structure-resume" ? originalProjectStructureContinuation(structureOrigin, command.role, this.#viaSdkPhases.has("save")) : null;
              if (historyGrant === undefined) { throw error("PROJECT_SAVE_STRUCTURE_HISTORY_COMPLETION_REQUIRED"); }
              const assertHistory = (): void => { if (historyGrant !== null) { if (command.phase !== "project-save-structure-resume" || originalProjectStructureContinuation(structureOrigin, command.role, this.#viaSdkPhases.has("save")) !== historyGrant) { throw error("PROJECT_SAVE_STRUCTURE_HISTORY_COMPLETION_CHANGED"); } historyGrant.assertCurrent(); } }; assertHistory();
              if (command.phase === "project-save-structure-uploadRelation") { if (this.#viaProducerRelationAttempted) { throw error("PROJECT_SAVE_PRODUCER_CONSTRUCTOR_RELATION_CONSUMED"); } this.#viaProducerRelationAttempted = true; }
              if (retain !== undefined && (typeof retain !== "function" || types.isProxy(retain))) { throw error("PROJECT_SAVE_STRUCTURE_RETAIN_CALLBACK"); }
              const reply = await this.#serializeViaObserver(() => this.#transfer(async () => { original(); assertStructureOriginal();
                if (command.phase === "project-save-structure-resume") { assertHistory(); if (command.role === "bootstrap" && !this.#viaProducerModeVerified) { throw error("PROJECT_SAVE_PRODUCER_NONPRIVATE_MODE_REQUIRED"); } selected.reserveStructureResume(source, command.role); }
                const actual = await pipe.observeViaWorker(command);
                if (command.phase === "project-save-structure-uploadRelation") {
                  if (this.#viaProducerOriginalUploadWrapper !== null || this.#viaProducerOriginalUploadCallback !== null || !exact(actual, ["result"]) || !record(actual["result"]) || !exact(actual["result"], ["type", "value"]) || actual["result"]["type"] !== "boolean" || actual["result"]["value"] !== true) { throw error("PROJECT_SAVE_PRODUCER_ORIGINAL_CONSTRUCTOR_RELATION"); }
                  this.#viaProducerOriginalUploadWrapper = originalProducerArgument(command.params.arguments, 1); this.#viaProducerOriginalUploadCallback = originalProducerArgument(command.params.arguments, 2);
                }
                if (command.phase === "project-save-structure-frame" && command.role === "mode") { if (this.#viaProducerModeArray !== null) { throw error("PROJECT_SAVE_PRODUCER_MODE_ONCE"); } this.#viaProducerModeArray = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(actual, 1); }
                else if (command.phase === "project-save-structure-properties" && command.params.objectId === this.#viaProducerModeArray) { decodeCurrentProjectSaveProducerNonprivateMode(actual); this.#viaProducerModeVerified = true; }
                if (retain !== undefined) { Reflect.apply(retain, undefined, [actual]); }
                return actual;
              }));
              if (command.phase === "project-save-structure-arm") {
                const site = CURRENT_PROJECT_SAVE_STRUCTURE_SITES[command.role];
                if (!record(reply) || !exact(reply, ["breakpointId", "actualLocation"]) || typeof reply["breakpointId"] !== "string" || !record(reply["actualLocation"]) || !exact(reply["actualLocation"], ["scriptId", "lineNumber", "columnNumber"]) || reply["actualLocation"]["scriptId"] !== source.scriptId || reply["actualLocation"]["lineNumber"] !== site.lineNumber || reply["actualLocation"]["columnNumber"] !== site.columnNumber) { throw error("PROJECT_SAVE_STRUCTURE_ARM_REPLY"); }
                selected.bindStructureBreakpoint(source, command.role, reply["breakpointId"]);
              }
              original(); assertStructureOriginal();
              assertHistory(); return reply;
            }, nextEvent: () => selected.nextStructureEvent(),
            assertCurrent: async (): Promise<void> => { original(); assertStructureOriginal(); await this.#verify(); original(); assertStructureOriginal(); },
            assertStartupPending: (): void => { original(); assertStructureOriginal(); if (this.#viaSdkPhases.has("save")) { throw error("PROJECT_SAVE_STRUCTURE_STARTUP_OVER"); } },
            assertOperationPending: (): void => { original(); assertStructureOriginal(); if (!(this.#viaSdkPhases.has("save"))) { throw error("PROJECT_SAVE_STRUCTURE_ORIGINAL_SAVE_REQUIRED"); } },
            assertOriginalGenerationExited: (): Promise<void> => { assertStructureOriginal(); if (!this.#terminationObserved || this.#terminationObservation?.terminated !== true) { return Promise.reject(error("PROJECT_SAVE_STRUCTURE_ORIGINAL_EXIT_REQUIRED")); } return Promise.resolve(); },
            fail: (): void => { selected.fail(); } });
          projectSaveStructureOrigins.set(structureOrigin, Object.freeze({ owner, operation: plan, bindings: structureBindings, assertOriginal: assertStructureOriginal }));
          this.#viaStructureOrigin = structureOrigin; await Reflect.apply(structureSetup, undefined, [structureOrigin]); original(); assertStructureOriginal(); selected.requireStructureArmed(source);
        }
        const transportSetup = this.#viaTransportSetup;
        if (transportSetup !== null) {
          if (this.#viaTransportOrigin !== null || this.#viaTransportOperation !== plan || this.#viaStructureOrigin === null) { throw error("PROJECT_STRUCTURE_TRANSPORT_SOURCE_CONSUMED"); }
          qualifyCurrentProjectStructureTransportSource(source.source); selected.requireStructureArmed(source); pipe.bindViaStructureTransport(source.uniqueContextId);
          const bound = await this.#request({ action: "pcb-via-structure-transport-bind", workerContext: source.uniqueContextId });
          if (!exact(bound, ["bound"]) || bound["bound"] !== true) { throw error("PROJECT_STRUCTURE_TRANSPORT_NATIVE_BINDING"); } original(); selected.requireOriginal(source, child);
          const transportPrepared = requireOriginalCurrentPcbViaWritePlan(plan).prepared; const transportOrigin: CurrentPcbViaStructureTransportOrigin = Object.freeze({ profile: "private.current-pcb-via-structure-transport-origin.v1" });
          const assertTransportOriginal = (): void => { requireViaPlan(this, plan); selected.requireOriginal(source, child);
            if (this.#viaTransportOrigin !== transportOrigin || this.#viaTransportSetup !== transportSetup || this.#viaTransportOperation !== plan || this.#viaWorkerController !== selected || this.#viaWorkerOrigin !== origin) { throw error("PROJECT_STRUCTURE_TRANSPORT_CUSTODY_CHANGED"); } };
          const transportBindings: CurrentProjectStructureTransportBindings = Object.freeze({ sessionId: child.sessionId, scriptId: source.scriptId, uniqueContextId: source.uniqueContextId, prepared: transportPrepared,
            request: async (input: Parameters<CurrentProjectStructureTransportBindings["request"]>[0], cleanup: boolean): Promise<unknown> => {
              const command = validateCurrentProjectStructureTransportCommand(input); original(); assertTransportOriginal();
              if (cleanup !== (command.phase === "project-structure-transport-remove" || command.phase === "project-structure-transport-release")) { throw error("PROJECT_STRUCTURE_TRANSPORT_REQUEST_CLASS"); }
              if (command.phase === "project-structure-transport-capture") { if (this.#viaTransportCaptureAttempted || command.params.uniqueContextId !== source.uniqueContextId) { throw error("PROJECT_STRUCTURE_TRANSPORT_CAPTURE_ONCE"); } this.#viaTransportCaptureAttempted = true; }
              if (command.phase === "project-structure-transport-arm" && command.params.location.scriptId !== source.scriptId) { throw error("PROJECT_STRUCTURE_TRANSPORT_SOURCE_SCRIPT"); }
              if (command.phase === "project-structure-transport-send" && (this.#viaTransportCapture === null || command.params.arguments[0].objectId !== this.#viaTransportCapture || command.params.objectId !== this.#viaTransportSendFrame || this.#viaTransportSendPacket !== null)) { throw error("PROJECT_STRUCTURE_TRANSPORT_ORIGINAL_SEND"); }
              if (command.phase === "project-structure-transport-value" && command.params.objectId !== this.#viaTransportSendPacket || command.phase === "project-structure-transport-returned" && (command.params.arguments[0].objectId !== this.#viaTransportSendPacket || command.params.objectId !== this.#viaTransportReturnedFrame)) { throw error("PROJECT_STRUCTURE_TRANSPORT_ORIGINAL_PACKET"); }
              let grant: Readonly<{ assertCurrent: () => void }> | null | undefined = null;
              if (command.phase === "project-structure-transport-resume") { grant = command.role === "send" ? projectStructureTransportBodyGrants.get(transportOrigin) : projectStructureTransportPublicationGrants.get(transportOrigin); }
              if (grant === undefined) { throw error("PROJECT_STRUCTURE_TRANSPORT_CONTINUATION_GRANT_REQUIRED"); }
              const assertGrant = (): void => { if (grant !== null) { const activeGrant = command.phase === "project-structure-transport-resume" && command.role === "send" ? projectStructureTransportBodyGrants.get(transportOrigin) : projectStructureTransportPublicationGrants.get(transportOrigin); if (activeGrant !== grant) { throw error("PROJECT_STRUCTURE_TRANSPORT_GRANT_CHANGED"); } grant.assertCurrent(); } }; assertGrant();
              const reply = await this.#serializeViaObserver(() => this.#transfer(() => { original(); assertTransportOriginal(); assertGrant();
                if (command.phase === "project-structure-transport-resume") { selected.reserveStructureTransportResume(source, command.role); }
                return pipe.observeViaStructureTransport(command);
              }));
              if (command.phase === "project-structure-transport-capture") { this.#viaTransportCapture = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(reply, CURRENT_PROJECT_STRUCTURE_TRANSPORT_NATIVE_CAPTURE_LENGTH); }
              else if (command.phase === "project-structure-transport-frame") {
                const handle = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(reply, CURRENT_PROJECT_STRUCTURE_TRANSPORT_SITES[command.role].length);
                if (command.role === "send") { this.#viaTransportSendFrame = handle; } else if (command.role === "returned") { this.#viaTransportReturnedFrame = handle; }
              } else if (command.phase === "project-structure-transport-send") { this.#viaTransportSendPacket = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(reply, 3); }
              else if (command.phase === "project-structure-transport-arm") {
                const site = CURRENT_PROJECT_STRUCTURE_TRANSPORT_SITES[command.role];
                if (!record(reply) || !exact(reply, ["breakpointId", "actualLocation"]) || typeof reply["breakpointId"] !== "string" || !record(reply["actualLocation"]) || !exact(reply["actualLocation"], ["scriptId", "lineNumber", "columnNumber"]) || reply["actualLocation"]["scriptId"] !== source.scriptId || reply["actualLocation"]["lineNumber"] !== site.lineNumber || reply["actualLocation"]["columnNumber"] !== site.columnNumber) { throw error("PROJECT_STRUCTURE_TRANSPORT_ARM_REPLY"); }
                selected.bindStructureTransportBreakpoint(source, command.role, reply["breakpointId"]);
              }
              original(); assertTransportOriginal(); assertGrant(); return reply;
            }, nextEvent: () => selected.nextStructureTransportEvent(), assertCurrent: async (): Promise<void> => { original(); assertTransportOriginal(); await this.#verify(); original(); assertTransportOriginal(); },
            assertOperationPending: (): void => { original(); assertTransportOriginal(); if (!(this.#viaSdkPhases.has("save"))) { throw error("PROJECT_STRUCTURE_TRANSPORT_ORIGINAL_SAVE_REQUIRED"); } },
            assertOriginalGenerationExited: (): Promise<void> => { assertTransportOriginal(); if (!this.#terminationObserved || this.#terminationObservation?.terminated !== true) { return Promise.reject(error("PROJECT_STRUCTURE_TRANSPORT_ORIGINAL_EXIT_REQUIRED")); } return Promise.resolve(); }, fail: (): void => { selected.fail(); } });
          projectStructureTransportOrigins.set(transportOrigin, Object.freeze({ owner, operation: plan, bindings: transportBindings, assertOriginal: assertTransportOriginal })); this.#viaTransportOrigin = transportOrigin;
          await Reflect.apply(transportSetup, undefined, [transportOrigin]); original(); assertTransportOriginal(); selected.requireStructureTransportArmed(source); if (this.#viaTransportCapture === null) { throw error("PROJECT_STRUCTURE_TRANSPORT_CAPTURE_REQUIRED"); }
        }
        if (this.#viaProducerGuardOperation !== null) {
          if (this.#viaProducerGuardOperation !== plan || this.#viaProducerGuardArmed || this.#viaStructureOrigin === null) { throw error("PROJECT_SAVE_PRODUCER_GUARD_SOURCE_CONSUMED"); }
          qualifyCurrentProjectSaveProducerGuardSource(source.source); qualifyCurrentProjectSaveProducerSource(source.source); selected.requireStructureArmed(source);
          for (const command of currentProjectSaveProducerGuardCases(source.scriptId)) {
            const reply = await this.#serializeViaObserver(() => this.#transfer(() => { original(); selected.requireOriginal(source, child); return pipe.observeViaProducerGuard(command); }));
            const site = command.params.location;
            if (!record(reply) || !exact(reply, ["breakpointId", "actualLocation"]) || typeof reply["breakpointId"] !== "string" || !record(reply["actualLocation"]) || !exact(reply["actualLocation"], ["scriptId", "lineNumber", "columnNumber"]) || reply["actualLocation"]["scriptId"] !== source.scriptId || reply["actualLocation"]["lineNumber"] !== site.lineNumber || reply["actualLocation"]["columnNumber"] !== site.columnNumber) { throw error("PROJECT_SAVE_PRODUCER_GUARD_ARM_REPLY"); }
            selected.bindProducerGuardBreakpoint(source, command.role, reply["breakpointId"]); original(); selected.requireOriginal(source, child);
          }
          selected.requireProducerGuardsArmed(source); this.#viaProducerGuardArmed = true;
          this.#viaProducerGuardReproof = (): void => { original(); selected.requireOriginal(source, child); selected.requireProducerGuardsArmed(source); if (this.#viaProducerGuardOperation !== plan || this.#viaWorkerController !== selected || !this.#viaProducerGuardArmed) { throw error("PROJECT_SAVE_PRODUCER_GUARD_CUSTODY_CHANGED"); } };
        }
      }, releaseParentWait: async () => { original(); const reply = await this.#transfer(() => pipe.configureViaWorkerRunning());
        if (!exact(reply, [])) { throw error("PCB_VIA_WORKER_PARENT_RUNNING_REPLY"); } original(); },
      fail: (): void => { this.#viaFailed = true; } }));
    this.#viaWorkerController = controller;
    const reply = await this.#transfer(() => pipe.enableViaWorkerDiscovery(event => { if (controller === null) { throw error("PCB_VIA_WORKER_ORIGINAL_CURSOR"); }
      const targetInfo = event.params["targetInfo"];
      if (!this.#viaProjectNavigationDispatchAttempted && event.method === "Target.attachedToTarget" && record(targetInfo) && targetInfo["title"] === `project_${plan.target.projectUuid}_${windowTabId}`) { controller.fail(); return; }
      controller.observeEvent(event); }));
    if (!exact(reply, [])) { throw error("PCB_VIA_WORKER_PARENT_ARM_REPLY"); } original();
  }
  /** Fixed read-only callee/closure metadata over the original page holder.
   * This origin provides no model action, resume, Save or SQL authority. */
  public async createSchematicDisplayAccessorOrigin(argumentsValue: GeneratedSchematicDisplayNativeArguments, setup: CurrentSchematicDisplayAccessorSetup): Promise<CurrentSchematicDisplayAccessorOrigin> {
    const selected = this.#schematicReadContext(argumentsValue); const holder = this.#schematicSdkBinding;
    if (this.#schematicAccessorAttempted || holder === null || !this.#schematicStages.has("preflight") || this.#schematicStages.has("modify") || this.#schematicStages.has("save") || typeof setup !== "function" || types.isProxy(setup)) { throw error("SCHEMATIC_DISPLAY_ACCESSOR_UNAVAILABLE"); }
    this.#enter(true); this.#schematicAccessorAttempted = true; this.#schematicAccessorSetup = setup;
    const targetJson = canonicalJson(argumentsValue.target); const operationJson = canonicalJson(argumentsValue.operation); const ui = selected.context.openingContext();
    const current = (): void => { selected.current(); if (this.#schematicFailed || this.#schematicDisplayCleanupOnly || this.#schematicAccessorSetup !== setup || this.#schematicSdkBinding !== holder || canonicalJson(selected.context.openingContext()) !== canonicalJson(ui)) { throw error("SCHEMATIC_DISPLAY_ACCESSOR_CHANGED"); } };
    try { await this.#verifyInstallation(); current(); await this.#verify(); current();
      const origin: CurrentSchematicDisplayAccessorOrigin = Object.freeze({ profile: "private.current-schematic-display-accessor-origin.v1" });
      const bindings: CurrentSchematicDisplayAccessorBindings = Object.freeze({ sessionId: ui.sessionId, holderObjectId: holder, targetJson, operationJson,
        request: async (input: Parameters<CurrentSchematicDisplayAccessorBindings["request"]>[0], cleanup: boolean): Promise<unknown> => { current(); const command = validateCurrentSchematicDisplayAccessorCommand(input);
          if (cleanup !== (command.phase === "schematic-accessor-release")) { throw error("SCHEMATIC_DISPLAY_ACCESSOR_REQUEST_CLASS"); }
          if (command.method === "Runtime.callFunctionOn") {
            const args = command.params.arguments; const first = command.phase === "schematic-accessor-callees" ? 0 : 1;
            if (command.phase === "schematic-accessor-callees" ? command.params.objectId !== holder : !("objectId" in args[0]) || args[0].objectId !== holder) { throw error("SCHEMATIC_DISPLAY_ACCESSOR_ORIGINAL_HOLDER"); }
            const target = args[first]; const operation = args[first + 1];
            if (target === undefined || !("value" in target) || target.value !== targetJson || operation === undefined || !("value" in operation) || operation.value !== operationJson) { throw error("SCHEMATIC_DISPLAY_ACCESSOR_ORIGINAL_ARGUMENTS"); }
          }
          const reply = await this.#serializeSchematicDisplayObserver(() => this.#transfer(() => { current(); return selected.pipe.observeSchematicDisplayAccessor(command); })); current(); return reply;
        }, assertCurrent: async (): Promise<void> => { current(); await this.#verify(); current(); },
        assertOriginalGenerationExited: (): Promise<void> => { requireSchematicArguments(this, argumentsValue); if (!this.#terminationObserved || this.#terminationObservation?.terminated !== true) { return Promise.reject(error("SCHEMATIC_DISPLAY_ACCESSOR_ORIGINAL_EXIT_REQUIRED")); } return Promise.resolve(); },
        fail: (): void => { this.#schematicFailed = true; } });
      schematicDisplayAccessors.set(origin, Object.freeze({ owner: this, argumentsValue, bindings, assertOriginal: (): void => { requireSchematicArguments(this, argumentsValue);
        if (this.#schematicAccessorOrigin !== origin || this.#schematicAccessorSetup !== setup || this.#schematicSdkBinding !== holder) { throw error("SCHEMATIC_DISPLAY_ACCESSOR_CUSTODY_CHANGED"); } } })); this.#schematicAccessorOrigin = origin;
      await Reflect.apply(setup, undefined, [origin]); current(); await this.#verify(); current(); return origin;
    } catch (caughtError) { this.#schematicFailed = true; throw caughtError; } finally { this.#busy = false; }
  }
  /** Exact acknowledged Text effect and same original page/worker only.
   * This issues observation custody and no Save or selected SQL grant. */
  public async createSchematicDisplayClockOrigin(plan: GeneratedSchematicDisplayNativeArguments, effect: GeneratedSchematicDisplayEffect, setup: CurrentSchematicDisplayClockSetup): Promise<CurrentSchematicDisplayClockOrigin> {
    // oxlint-disable-next-line eslint/no-use-before-define -- The fixed public facade is initialized before an original factory can call this method.
    if (!(this instanceof CurrentSchematicDisplayWriteOwner)) { throw error("SCHEMATIC_DISPLAY_CLOCK_OWNER"); }
    requireOriginalGeneratedSchematicDisplayEffect(effect, this, plan); const selected = this.#schematicReadContext(plan);
    const sdk = this.#schematicSdkBinding, windowTabId = this.#schematicWindowTabId, workerOrigin = this.#schematicWorkerOrigin;
    const worker = workerOrigin === null ? undefined : schematicDisplaySaveWorkers.get(workerOrigin);
    if (typeof setup !== "function" || types.isProxy(setup) || this.#schematicClockAttempted || sdk === null  || !this.#schematicStages.has("modify") || worker === undefined || worker.owner !== this || worker.argumentsValue !== plan ||
      worker.controller !== this.#schematicWorkerController || !worker.controller.status().ready || typeof windowTabId !== "string") { throw error("SCHEMATIC_DISPLAY_CLOCK_UNAVAILABLE"); }
    this.#enter(true); this.#schematicClockAttempted = true; this.#schematicClockSetup = setup;
    const current = (): void => { selected.current(); requireOriginalGeneratedSchematicDisplayEffect(effect, this, plan); worker.assertOriginal();
      if (this.#schematicFailed || this.#schematicDisplayCleanupOnly || this.#schematicClockSetup !== setup || this.#schematicSdkBinding !== sdk || this.#schematicWorkerOrigin !== workerOrigin || this.#schematicWindowTabId !== windowTabId) { throw error("SCHEMATIC_DISPLAY_CLOCK_CHANGED"); } };
    try {
      await this.#verifyInstallation(); current(); await this.#verify(); current();
      const reply = await this.#request({ action: "schematic-display-clock-bind", workerContext: worker.bindings.uniqueContextId, uiSdkObject: sdk });
      if (!exact(reply, ["bound"]) || reply["bound"] !== true) { throw error("SCHEMATIC_DISPLAY_CLOCK_BIND_REPLY"); } current();
      selected.pipe.bindSchematicDisplayClock(worker.bindings.uniqueContextId, sdk);
      const origin: CurrentSchematicDisplayClockOrigin = Object.freeze({ profile: "private.current-schematic-display-clock-origin.v1" });
      const bindings: CurrentSchematicDisplayClockBindings = Object.freeze({ workerSessionId: worker.bindings.sessionId, uiSessionId: selected.context.openingContext().sessionId,
        workerScriptId: worker.bindings.scriptId, workerUniqueContextId: worker.bindings.uniqueContextId, uiSdkObjectId: sdk, windowTabId, workerSource: worker.bindings.source,
        request: async (input: CurrentSchematicDisplayClockCommand, realm: CurrentSchematicDisplayClockRealm): Promise<unknown> => {
          current(); const command = validateCurrentSchematicDisplayClockCommand(input);
          const raw = await this.#serializeSchematicDisplayObserver(() => this.#transfer(() => { current();
            if (command.phase === "schematic-clock-registration" && (command.params.objectId !== sdk || canonicalJson(command.params.arguments) !== canonicalJson([{ value: plan.target.projectUuid }, { value: plan.target.branchUuid }, { value: windowTabId }])) ||
              command.phase === "schematic-clock-worker" && (command.params.uniqueContextId !== worker.bindings.uniqueContextId || canonicalJson(command.params.arguments) !== canonicalJson([{ value: plan.target.projectUuid }, { value: windowTabId }]))) { throw error("SCHEMATIC_DISPLAY_CLOCK_INITIAL_RECEIVER"); }
            if (command.phase === "schematic-clock-arm") { if (this.#schematicClockArmAttempts.has(command.role)) { throw error("SCHEMATIC_DISPLAY_CLOCK_ARM_CONSUMED"); } this.#schematicClockArmAttempts.add(command.role); }
            if (command.phase === "schematic-clock-remove") { if (this.#schematicClockRemoveAttempts.has(command.role)) { throw error("SCHEMATIC_DISPLAY_CLOCK_REMOVE_CONSUMED"); } this.#schematicClockRemoveAttempts.add(command.role); }
            if (command.phase === "schematic-clock-resume") { worker.controller.reserveClockResume(worker.source, realm, command.role); }
            return selected.pipe.observeSchematicDisplayClock(command, realm); }));
          if (command.phase === "schematic-clock-arm") {
            const value = captureCurrentPcbStringClockReply(raw).value; const point = command.params.location, site = CURRENT_SCHEMATIC_DISPLAY_CLOCK_SITES[command.role];
            if (!record(value) || !exact(value, ["breakpointId", "actualLocation"]) || typeof value["breakpointId"] !== "string" || !record(value["actualLocation"]) ||
              !exact(value["actualLocation"], ["scriptId", "lineNumber", "columnNumber"]) || canonicalJson(value["actualLocation"]) !== canonicalJson(point) || site.realm !== realm) { throw error("SCHEMATIC_DISPLAY_CLOCK_ARM_REPLY"); }
            worker.controller.bindClockBreakpoint(worker.source, { sessionId: realm === "worker" ? worker.bindings.sessionId : selected.context.openingContext().sessionId, scriptId: point.scriptId,
              breakpointId: value["breakpointId"], lineNumber: point.lineNumber, columnNumber: point.columnNumber, role: command.role }); this.#schematicClockArmedPoints.add(command.role);
          }
          if (command.phase === "schematic-clock-result") { if (this.#schematicClockResultArray !== null) { throw error("SCHEMATIC_DISPLAY_CLOCK_RESULT_CONSUMED"); } this.#schematicClockResultArray = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, 8); }
          if (command.phase === "schematic-clock-properties" && command.params.objectId === this.#schematicClockResultArray) {
            const value = currentFootprintCopyClockRpcV2ArrayValue(decodeCurrentFootprintCopyClockRpcV2Array(raw, 8), 3);
            if (this.#schematicClockValue !== null || typeof value !== "number" || value < 1 || value > 8_640_000_000_000_000) { throw error("SCHEMATIC_DISPLAY_CLOCK_RESULT_VALUE"); } this.#schematicClockValue = value;
          }
          if (command.phase === "schematic-clock-remove") { if (!exact(raw, [])) { throw error("SCHEMATIC_DISPLAY_CLOCK_REMOVE_REPLY"); } this.#schematicClockRemovedPoints.add(command.role); }
          current(); return raw;
        }, nextEvent: () => worker.controller.nextClockEvent(), assertCurrent: async (): Promise<void> => { current(); await this.#verify(); current(); },
        assertSaveAttempt: (): void => { current(); worker.bindings.assertSaveAttempt(); }, assertOriginalGenerationExited: (): Promise<void> => worker.bindings.assertOriginalGenerationExited(),
        fail: (): void => { worker.controller.fail(); } });
      schematicDisplayClocks.set(origin, Object.freeze({ owner: this, argumentsValue: plan, bindings, assertOriginal: (): void => { worker.assertOriginal();
        if (this.#schematicClockOrigin !== origin || this.#schematicClockSetup !== setup || this.#schematicSdkBinding !== sdk || this.#schematicWorkerOrigin !== workerOrigin) { throw error("SCHEMATIC_DISPLAY_CLOCK_CUSTODY_CHANGED"); } } })); this.#schematicClockOrigin = origin;
      // Exact trusted Node setup only, absent from MCP input. Source/metadata
      // Qualification and all arms settle while the SDK entry remains busy.
      await Reflect.apply(setup, undefined, [origin]); current();
      if (this.#schematicClockArmAttempts.size !== 5 || this.#schematicClockArmedPoints.size !== 5) { throw error("SCHEMATIC_DISPLAY_CLOCK_SETUP_INCOMPLETE"); }
      await this.#verify(); current(); return origin;
    } catch (caughtError) { this.#schematicFailed = true; throw caughtError; } finally { this.#busy = false; }
  }
  /** Actual original effect + SDK ACK + pre-project worker only. This creates
   * clock observation custody, never Save or SQL authority. */
  public async createViaClockOrigin(plan: CurrentPcbViaWritePlan, effect: CurrentPcbViaWriteEffect, setup: CurrentPcbViaClockSetup): Promise<CurrentPcbViaClockOrigin> {
    // oxlint-disable-next-line eslint/no-use-before-define -- The fixed public facade is initialized before an original factory can call this method.
    if (!(this instanceof CurrentPcbViaWriteOwner)) { throw error("PCB_VIA_CLOCK_OWNER"); }
    requireOriginalCurrentPcbViaWriteEffect(effect, this, plan); const selected = this.#viaReadContext(plan);
    const sdk = this.#viaSdkBinding, windowTabId = this.#projectOpeningResult?.observation?.windowTabId, workerOrigin = this.#viaWorkerOrigin;
    const worker = workerOrigin === null ? undefined : pcbViaSaveWorkers.get(workerOrigin);
    if (typeof setup !== "function" || types.isProxy(setup) || this.#viaClockAttempted || sdk === null || !this.#viaSdkQualified || !this.#viaSdkPhases.has("create") || worker === undefined || worker.owner !== this || worker.plan !== plan ||
      worker.controller !== this.#viaWorkerController || !worker.controller.status().ready || typeof windowTabId !== "string") { throw error("PCB_VIA_CLOCK_UNAVAILABLE"); }
    this.#enter(true); this.#viaClockAttempted = true; this.#viaClockSetup = setup;
    const current = (): void => { selected.current(); requireOriginalCurrentPcbViaWriteEffect(effect, this, plan); worker.assertOriginal();
      if (this.#viaFailed || this.#viaCleanupOnly || this.#viaClockSetup !== setup || this.#viaSdkBinding !== sdk || this.#viaWorkerOrigin !== workerOrigin || this.#projectOpeningResult?.observation?.windowTabId !== windowTabId) { throw error("PCB_VIA_CLOCK_CHANGED"); } };
    try {
      await this.#verifyInstallation(); current(); await this.#verify(); current();
      const reply = await this.#request({ action: "pcb-via-clock-bind", workerContext: worker.bindings.uniqueContextId, uiSdkObject: sdk });
      if (!exact(reply, ["bound"]) || reply["bound"] !== true) { throw error("PCB_VIA_CLOCK_BIND_REPLY"); } current();
      selected.pipe.bindViaClock(worker.bindings.uniqueContextId, sdk);
      const origin: CurrentPcbViaClockOrigin = Object.freeze({ profile: "private.current-pcb-via-clock-origin.v1" });
      const bindings: CurrentPcbViaClockBindings = Object.freeze({ workerSessionId: worker.bindings.sessionId, uiSessionId: selected.ui.sessionId,
        workerScriptId: worker.bindings.scriptId, workerUniqueContextId: worker.bindings.uniqueContextId, uiSdkObjectId: sdk, windowTabId, workerSource: worker.bindings.source,
        request: async (input: CurrentPcbViaClockCommand, realm: CurrentPcbViaClockRealm): Promise<unknown> => {
          current(); const command = validateCurrentPcbViaClockCommand(input);
          const raw = await this.#serializeViaObserver(() => this.#transfer(() => { current();
            if (command.phase === "via-clock-registration" && (command.params.objectId !== sdk || canonicalJson(command.params.arguments) !== canonicalJson([{ value: plan.target.projectUuid }, { value: plan.target.branchUuid }, { value: windowTabId }])) ||
              command.phase === "via-clock-worker" && (command.params.uniqueContextId !== worker.bindings.uniqueContextId || canonicalJson(command.params.arguments) !== canonicalJson([{ value: plan.target.projectUuid }, { value: windowTabId }]))) { throw error("PCB_VIA_CLOCK_INITIAL_RECEIVER"); }
            if (command.phase === "via-clock-arm") { if (this.#viaClockArmAttempts.has(command.role)) { throw error("PCB_VIA_CLOCK_ARM_CONSUMED"); } this.#viaClockArmAttempts.add(command.role); }
            if (command.phase === "via-clock-remove") { if (this.#viaClockRemoveAttempts.has(command.role)) { throw error("PCB_VIA_CLOCK_REMOVE_CONSUMED"); } this.#viaClockRemoveAttempts.add(command.role); }
            if (command.phase === "via-clock-resume") { worker.controller.reserveClockResume(worker.source, realm, command.role); }
            return selected.pipe.observeViaClock(command, realm); }));
          if (command.phase === "via-clock-arm") {
            const value = captureCurrentPcbStringClockReply(raw).value; const point = command.params.location, site = CURRENT_PCB_VIA_CLOCK_SITES[command.role];
            if (!record(value) || !exact(value, ["breakpointId", "actualLocation"]) || typeof value["breakpointId"] !== "string" || !record(value["actualLocation"]) ||
              !exact(value["actualLocation"], ["scriptId", "lineNumber", "columnNumber"]) || canonicalJson(value["actualLocation"]) !== canonicalJson(point) || site.realm !== realm) { throw error("PCB_VIA_CLOCK_ARM_REPLY"); }
            worker.controller.bindClockBreakpoint(worker.source, { sessionId: realm === "worker" ? worker.bindings.sessionId : selected.ui.sessionId, scriptId: point.scriptId,
              breakpointId: value["breakpointId"], lineNumber: point.lineNumber, columnNumber: point.columnNumber, role: command.role }); this.#viaClockArmedPoints.add(command.role);
          }
          if (command.phase === "via-clock-result") { if (this.#viaClockResultArray !== null) { throw error("PCB_VIA_CLOCK_RESULT_CONSUMED"); } this.#viaClockResultArray = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, 8); }
          if (command.phase === "via-clock-properties" && command.params.objectId === this.#viaClockResultArray) {
            const value = currentFootprintCopyClockRpcV2ArrayValue(decodeCurrentFootprintCopyClockRpcV2Array(raw, 8), 3);
            if (this.#viaClockValue !== null || typeof value !== "number" || value < 1 || value > 8_640_000_000_000_000) { throw error("PCB_VIA_CLOCK_RESULT_VALUE"); } this.#viaClockValue = value;
          }
          if (command.phase === "via-clock-remove") { if (!exact(raw, [])) { throw error("PCB_VIA_CLOCK_REMOVE_REPLY"); } this.#viaClockRemovedPoints.add(command.role); }
          current(); return raw;
        }, nextEvent: () => worker.controller.nextClockEvent(), assertCurrent: async (): Promise<void> => { current(); await this.#verify(); current(); },
        assertSaveAttempt: (): void => { current(); worker.bindings.assertSaveAttempt(); }, assertOriginalGenerationExited: (): Promise<void> => worker.bindings.assertOriginalGenerationExited(),
        fail: (): void => { worker.controller.fail(); } });
      pcbViaClocks.set(origin, Object.freeze({ owner: this, plan, bindings, assertOriginal: (): void => { worker.assertOriginal();
        if (this.#viaClockOrigin !== origin || this.#viaClockSetup !== setup || this.#viaSdkBinding !== sdk || this.#viaWorkerOrigin !== workerOrigin) { throw error("PCB_VIA_CLOCK_CUSTODY_CHANGED"); } } })); this.#viaClockOrigin = origin;
      // Exact trusted Node setup only, absent from MCP input. Source/metadata
      // Qualification and all arms settle while the SDK entry remains busy.
      await Reflect.apply(setup, undefined, [origin]); current();
      if (this.#viaClockArmAttempts.size !== 5 || this.#viaClockArmedPoints.size !== 5) { throw error("PCB_VIA_CLOCK_SETUP_INCOMPLETE"); }
      await this.#verify(); current(); this.#viaClockSetupSettled = true; return origin;
    } catch (caughtError) { this.#viaFailed = true; throw caughtError; } finally { this.#busy = false; }
  }
  /** Prospective original action enrollment: the same published create-intent
   * and producer prefix precede the actual SDK action and every await here. */
  public async prepareViaMainObservationOrigin(plan: CurrentPcbViaWritePlan, dispatch: CurrentPcbViaWriteDispatch, setup: CurrentPcbViaMainSetup): Promise<CurrentPcbViaMainOrigin> {
    // oxlint-disable-next-line eslint/no-use-before-define -- The dedicated original facade exists before its factory can invoke this method.
    if (!(this instanceof CurrentPcbViaWriteOwner) || typeof setup !== "function" || types.isProxy(setup) || this.#viaMainAttempted || this.#mainRunner === null || !this.#viaSdkPhases.has("preflight") || this.#viaSdkPhases.has("create") || this.#viaSdkPhases.has("save")) { throw error("PCB_VIA_MAIN_PRECREATE_UNAVAILABLE"); }
    const prefix = this.requireViaProducerPrefixReady(plan); const selected = this.#viaReadContext(plan); const runner = this.#mainRunner;
    this.#enter(true); this.#viaMainAttempted = true;
    try {
      const enrollment = enrollCurrentPcbViaWriteCreateIntent(dispatch, this, plan); this.#viaMainCreateEnrollment = enrollment; this.#viaMainCreateDispatch = dispatch; this.#viaMainCreatePrefix = prefix;
      const before = async (): Promise<void> => { selected.current(); enrollment.assertBeforeAttempt(); if (this.requireViaProducerPrefixReady(plan) !== prefix) { throw error("PCB_VIA_MAIN_PRECREATE_PREFIX_CHANGED"); }
        await enrollment.assertPublished(); selected.current(); await requireOriginalCurrentProjectSaveProducerPrefix(prefix, this, plan).assertCurrent(); selected.current(); enrollment.assertBeforeAttempt(); };
      await before(); await this.#verify(); await before(); const captured = await runner.beginViaMainObservation(); await before(); const { origin } = captured;
      runner.bindViaInitialHistoryBaseline(origin, currentGeneratedProjectHistorySqlBaseline(requireOriginalCurrentPcbViaWritePlan(plan).inventory, plan.target.projectUuid, plan.target.branchUuid));
      const original = (): void => { selected.current(); enrollment.assertCurrent(); if (this.requireViaProducerPrefixReady(plan) !== prefix || this.#mainRunner !== runner || this.#viaMainOrigin !== origin || this.#viaMainCreateEnrollment !== enrollment || this.#viaMainCreateDispatch !== dispatch || this.#viaMainCreatePrefix !== prefix || this.#viaFailed || this.#viaCleanupOnly) { throw error("PCB_VIA_MAIN_PRECREATE_CHANGED"); }
        if (this.#viaMainBoundEffect !== null) { requireOriginalCurrentPcbViaWriteEffect(this.#viaMainBoundEffect, this, plan); } };
      const bindings: CurrentPcbViaMainBindings = Object.freeze({ ...captured.bindings, assertSaveAttempt: (): void => { original(); enrollment.assertOriginalAttempted(); if (!this.#viaSdkPhases.has("save") || this.#viaMainBoundEffect === null) { throw error("PCB_VIA_MAIN_ORIGINAL_SAVE_ATTEMPT"); } } });
      this.#viaMainOrigin = origin; pcbViaMainOrigins.set(origin, Object.freeze({ owner: this, plan, effect: (): CurrentPcbViaWriteEffect | null => this.#viaMainBoundEffect, bindings, assertOriginal: original }));
      await Reflect.apply(setup, undefined, [origin]); original(); await before(); runner.requireViaMainObservationArmed(origin); bindings.requireBeginArmed(); bindings.requireHistoryArmed(); bindings.requireStructureArmed();
      const reply = await this.#request({ action: "pcb-via-main-precreate-enroll" });
      if (!exact(reply, ["enrolled"]) || reply["enrolled"] !== true) { throw error("PCB_VIA_MAIN_PRECREATE_NATIVE_ACK"); }
      await this.#verify(); await before(); original(); runner.requireViaMainObservationArmed(origin); bindings.requireBeginArmed(); bindings.requireHistoryArmed(); bindings.requireStructureArmed(); this.#viaMainSetupReady = true; this.#viaMainPrecreateReady = true; return origin;
    } catch (caughtError) { this.#viaFailed = true; throw caughtError; } finally { this.#busy = false; }
  }
  #requireViaMainPrecreate(plan: CurrentPcbViaWritePlan, dispatch: CurrentPcbViaWriteDispatch | undefined, attempted: boolean): void {
    const enrollment = this.#viaMainCreateEnrollment; const origin = this.#viaMainOrigin;
    if (!this.#viaMainPrecreateReady || !this.#viaMainSetupReady || enrollment === null || origin === null || dispatch === undefined || this.#viaMainCreateDispatch !== dispatch || this.#mainRunner === null || this.#viaMainBoundEffect !== null || this.#viaFailed || this.#viaCleanupOnly || this.requireViaProducerPrefixReady(plan) !== this.#viaMainCreatePrefix) { throw error("PCB_VIA_MAIN_PRECREATE_REQUIRED"); }
    if (attempted) { enrollment.assertOriginalAttempted(); } else { enrollment.assertBeforeAttempt(); }
    const bindings = requireOriginalCurrentPcbViaMainOrigin(origin, this, plan); this.#mainRunner.requireViaMainObservationArmed(origin); bindings.requireBeginArmed(); bindings.requireHistoryArmed(); bindings.requireStructureArmed();
  }
  /** Actual post-create observations issue this effect; prospective intent
   * and SDK acknowledgement alone cannot replace that original evidence. */
  public bindViaMainOriginalEffect(plan: CurrentPcbViaWritePlan, origin: CurrentPcbViaMainOrigin, effect: CurrentPcbViaWriteEffect): void {
    requireOriginalCurrentPcbViaMainOrigin(origin, this, plan); const enrollment = this.#viaMainCreateEnrollment;
    if (!this.#viaMainPrecreateReady || !this.#viaMainSetupReady || this.#viaMainOrigin !== origin || enrollment === null || this.#viaMainBoundEffect !== null || !this.#viaSdkPhases.has("create") || this.#viaSdkPhases.has("save") || this.#busy) { throw error("PCB_VIA_MAIN_ORIGINAL_EFFECT_UNAVAILABLE"); }
    enrollment.assertOriginalAttempted(); requireOriginalCurrentPcbViaWriteEffect(effect, this, plan); this.#viaMainBoundEffect = effect;
  }
  /** Original Via main cursor only. This setup installs fixed observation
   * points and retains the SQL fence; it grants neither Save nor a resume. */
  public async createViaMainObservationOrigin(plan: CurrentPcbViaWritePlan, effect: CurrentPcbViaWriteEffect, setup: CurrentPcbViaMainSetup): Promise<CurrentPcbViaMainOrigin> {
    // oxlint-disable-next-line eslint/no-use-before-define -- The fixed public facade exists before its original factory can call this method.
    if (!(this instanceof CurrentPcbViaWriteOwner) || typeof setup !== "function" || types.isProxy(setup) || this.#viaMainAttempted || this.#mainRunner === null) { throw error("PCB_VIA_MAIN_SETUP"); }
    requireOriginalCurrentPcbViaWriteEffect(effect, this, plan); const selected = this.#viaReadContext(plan); const runner = this.#mainRunner;
    this.#enter(true); this.#viaMainAttempted = true;
    try {
      await this.#verify(); selected.current(); const captured = await runner.beginViaMainObservation(); selected.current();
      const { origin } = captured;
      runner.bindViaInitialHistoryBaseline(origin, currentGeneratedProjectHistorySqlBaseline(requireOriginalCurrentPcbViaWritePlan(plan).inventory, plan.target.projectUuid, plan.target.branchUuid));
      const original = (): void => { selected.current(); requireOriginalCurrentPcbViaWriteEffect(effect, this, plan);
        if (this.#mainRunner !== runner || this.#viaMainOrigin !== origin || this.#viaFailed || this.#viaCleanupOnly) { throw error("PCB_VIA_MAIN_CHANGED"); } };
      const bindings: CurrentPcbViaMainBindings = Object.freeze({ ...captured.bindings, assertSaveAttempt: (): void => { original(); if (!this.#viaSdkPhases.has("save")) { throw error("PCB_VIA_MAIN_ORIGINAL_SAVE_ATTEMPT"); } } });
      this.#viaMainOrigin = origin; pcbViaMainOrigins.set(origin, Object.freeze({ owner: this, plan, effect: (): CurrentPcbViaWriteEffect => effect, bindings, assertOriginal: original }));
      await Reflect.apply(setup, undefined, [origin]); original(); runner.requireViaMainObservationArmed(origin); await this.#verify(); original(); this.#viaMainSetupReady = true; return origin;
    } catch (caughtError) { this.#viaFailed = true; throw caughtError; } finally { this.#busy = false; }
  }
  public requireViaMainObservationReady(plan: CurrentPcbViaWritePlan, origin: CurrentPcbViaMainOrigin): void {
    requireOriginalCurrentPcbViaMainOrigin(origin, this, plan);
    if (!this.#viaMainSetupReady || this.#mainRunner === null) { throw error("PCB_VIA_MAIN_SETUP_NOT_READY"); }
    this.#mainRunner.requireViaMainObservationArmed(origin);
  }
  /** This operation's native value reply and delivered clock/body pauses are
   * retained privately. Caller JSON or a copied Node observation supplies none
   * of these inputs. Binding still grants no native SQL continuation. */
  public bindViaMainOriginalBody(plan: CurrentPcbViaWritePlan, origin: CurrentPcbViaMainOrigin): CurrentPcbViaPendingSaveDelta {
    this.requireViaMainObservationReady(plan, origin); const actual = pcbViaMainOrigins.get(origin), workerOrigin = this.#viaWorkerOrigin;
    const worker = workerOrigin === null ? undefined : pcbViaSaveWorkers.get(workerOrigin);
    if (actual === undefined || actual.owner !== this || actual.plan !== plan || this.#mainRunner === null || this.#viaMainBoundBody !== null ||
      worker === undefined || worker.owner !== this || worker.plan !== plan || !this.#viaClockSetupSettled || this.#viaClockRemovedPoints.size !== 5 ||
      this.#viaSaveCapturedBody === null || this.#viaClockValue === null || this.#viaSaveCapturedBody.clock !== this.#viaClockValue || !this.#viaSdkPhases.has("save")) { throw error("PCB_VIA_MAIN_BODY_UNAVAILABLE"); }
    actual.assertOriginal(); worker.assertOriginal(); worker.controller.requireClockCompletionWithHeldSaveBody(worker.source);
    const original = requireOriginalCurrentPcbViaWritePlan(plan); const originalEffect = actual.effect(); if (originalEffect === null) { throw error("PCB_VIA_MAIN_ORIGINAL_EFFECT_REQUIRED"); }
    const effect = requireOriginalCurrentPcbViaWriteEffect(originalEffect, this, plan);
    const delta = compareCurrentPcbViaPendingSaveDelta(plan, original.history, effect, this.#viaSaveCapturedBody);
    this.#mainRunner.bindViaExpectedHistoryBody(origin, { projectUuid: plan.target.projectUuid, branchUuid: plan.target.branchUuid,
      projectKey: plan.target.projectUuid, path: plan.target.rawWindowsPath, dataStr: delta.dataStr });
    actual.assertOriginal(); worker.assertOriginal(); this.#viaMainBoundBody = delta; return delta;
  }
  /** Existing original Save/clock/body custody only. The SDK Save dispatcher
   * remains closed until its earlier operation-owned action prefix is joined. */
  public async reserveViaStructurePublication(plan: CurrentPcbViaWritePlan, origin: CurrentPcbViaMainOrigin): Promise<CurrentProjectStructureBodyReservation> {
    this.requireViaMainObservationReady(plan, origin); const actual = pcbViaMainOrigins.get(origin), workerOrigin = this.#viaWorkerOrigin;
    const worker = workerOrigin === null ? undefined : pcbViaSaveWorkers.get(workerOrigin); const transportOrigin = this.requireViaStructureTransportReady(plan); const sharedOrigin = this.#viaStructureOrigin;
    if (this.#viaStructureBodyAttempted || actual === undefined || actual.owner !== this || actual.plan !== plan || worker === undefined || worker.owner !== this || worker.plan !== plan || sharedOrigin === null || this.#mainRunner === null || this.#viaMainBoundBody === null || this.#viaClockValue === null || this.#viaSaveCapturedBody?.clock !== this.#viaClockValue || !this.#viaSdkPhases.has("save") || this.#viaFailed || this.#viaCleanupOnly) { throw error("PCB_VIA_STRUCTURE_BODY_UNAVAILABLE"); }
    actual.assertOriginal(); worker.assertOriginal(); worker.controller.requireClockCompletionWithHeldSaveBody(worker.source); this.#viaStructureBodyAttempted = true;
    const runner = this.#mainRunner; const body = this.#viaMainBoundBody; const prepared = requireOriginalCurrentPcbViaWritePlan(plan).prepared;
    const expected = currentPcbViaMainStructureExpectedSchema.parse({ projectUuid: plan.target.projectUuid, branchUuid: plan.target.branchUuid, ticket: body.headTicket, structureText: expectedCurrentGeneratedProjectSaveStructure(prepared, this.#viaClockValue) });
    const value: CurrentProjectStructureBodyReservationValue = Object.freeze({ projectUuid: expected.projectUuid, branchUuid: expected.branchUuid, documentUuid: body.documentUuid, bodySha256: body.bodySha256, saveHeadTicket: expected.ticket, workerClock: this.#viaClockValue, expectedStructureText: expected.structureText });
    const same = (): void => { requireViaPlan(this, plan); actual.assertOriginal(); worker.assertOriginal(); requireOriginalCurrentProjectSaveStructureOrigin(sharedOrigin, this, plan);
      if (this.#viaFailed || this.#viaCleanupOnly || this.#mainRunner !== runner || this.#viaMainBoundBody !== body || this.#viaMainOrigin !== origin || this.#viaStructureOrigin !== sharedOrigin || this.requireViaStructureTransportReady(plan) !== transportOrigin) { throw error("PCB_VIA_STRUCTURE_BODY_CHANGED"); } };
    try { await this.#verify(); same(); worker.controller.requireClockCompletionWithHeldSaveBody(worker.source);
      const reply = await this.#request({ action: "pcb-via-structure-body-enroll", projectUuid: expected.projectUuid, branchUuid: expected.branchUuid, ticket: expected.ticket, structureText: expected.structureText });
      if (!exact(reply, ["reserved"]) || reply["reserved"] !== true) { throw error("PCB_VIA_STRUCTURE_BODY_NATIVE_ACK"); } await this.#verify(); same(); worker.controller.requireClockCompletionWithHeldSaveBody(worker.source); runner.bindViaExpectedStructure(origin, expected);
      const token: CurrentProjectStructureBodyReservation = Object.freeze({ profile: "private.current-project-structure-body-reservation.v1" });
      const assertCurrent = (): void => { same(); if (this.#viaStructureBodyReservation !== token || canonicalJson(runner.requireViaExpectedStructure(origin)) !== canonicalJson(expected)) { throw error("PCB_VIA_STRUCTURE_BODY_ORIGINAL_CHANGED"); } };
      this.#viaStructureBodyReservation = token; originalStructureBodies.set(token, { owner: this, operation: plan, transportOrigin, sharedOrigin, value, assertCurrent, consumed: false }); assertCurrent(); return token;
    } catch (caughtError) { this.#viaFailed = true; throw caughtError; }
  }
  public completeViaStructurePublication(plan: CurrentPcbViaWritePlan): CurrentProjectStructureMainPublication {
    requireViaPlan(this, plan); const origin = this.#viaMainOrigin, sharedOrigin = this.#viaStructureOrigin, transportOrigin = this.requireViaStructureTransportReady(plan);
    const body = sharedOrigin === null ? undefined : projectSaveStructureBodyGrants.get(sharedOrigin);
    if (origin === null || sharedOrigin === null || this.#mainRunner === null || body === undefined || body.transportOrigin !== transportOrigin || this.#viaStructurePublication !== null || this.#viaFailed || this.#viaCleanupOnly) { throw error("PCB_VIA_STRUCTURE_PUBLICATION_UNAVAILABLE"); }
    body.assertCurrent(); const runner = this.#mainRunner; const effects = runner.requireViaStructureCompleted(origin);
    if (effects.projectUuid !== body.value.projectUuid || effects.branchUuid !== body.value.branchUuid || effects.ticket !== body.value.saveHeadTicket || effects.structureText !== body.value.expectedStructureText) { throw error("PCB_VIA_STRUCTURE_PUBLICATION_EXPECTED"); }
    if (this.#viaStructureSqlEffects !== null) { throw error("PCB_VIA_STRUCTURE_EFFECTS_CONSUMED"); } this.#viaStructureSqlEffects = effects;
    const value: CurrentProjectStructureMainPublicationValue = Object.freeze({ projectUuid: effects.projectUuid, branchUuid: effects.branchUuid, ticket: effects.ticket, structureSha256: sha256Text(effects.structureText), nativeChanges: 1, nativeBeforeEpochMs: effects.nativeBeforeEpochMs, nativeAfterEpochMs: effects.nativeAfterEpochMs, originalResponsePublished: true, selectedSqlStillFenced: true });
    const token: CurrentProjectStructureMainPublication = Object.freeze({ profile: "private.current-project-structure-main-publication.v1" });
    const assertCurrent = (): void => { body.assertCurrent(); if (this.#viaStructurePublication !== token || this.#mainRunner !== runner || this.#viaMainOrigin !== origin || runner.requireViaStructureCompleted(origin) !== effects) { throw error("PCB_VIA_STRUCTURE_PUBLICATION_CHANGED"); } };
    this.#viaStructurePublication = token; originalStructurePublications.set(token, { owner: this, operation: plan, transportOrigin, sharedOrigin, value, assertCurrent, consumed: false }); assertCurrent(); return token;
  }
  /** Source-owned data for the original worker response/head-index joins.
   * This live lookup grants no continuation and exports no worker program. */
  public requireViaHistorySqlEffects(plan: CurrentPcbViaWritePlan): CurrentProjectHistorySqlEffects {
    requireViaPlan(this, plan); const origin = this.#viaMainOrigin;
    if (origin === null || this.#mainRunner === null || this.#viaMainBoundBody === null || this.#viaFailed || this.#viaCleanupOnly) { throw error("PCB_VIA_HISTORY_ORIGINAL_EFFECTS_UNAVAILABLE"); }
    requireOriginalCurrentPcbViaMainOrigin(origin, this, plan); const effects = this.#mainRunner.requireViaHistoryCompleted(origin);
    if (effects.projectUuid !== plan.target.projectUuid || effects.branchUuid !== plan.target.branchUuid || effects.initialLogicalSha256 !== plan.initialLogicalSha256 || effects.bodySha256 !== this.#viaMainBoundBody.bodySha256) { throw error("PCB_VIA_HISTORY_ORIGINAL_EFFECTS_SCOPE"); }
    if (this.#viaHistorySqlEffects !== null && this.#viaHistorySqlEffects !== effects) { throw error("PCB_VIA_HISTORY_ORIGINAL_EFFECTS_CHANGED"); } this.#viaHistorySqlEffects = effects; return effects;
  }
  /** The original backend, original native callback ACKs and retained body
   * issue this completion. It records no structure publication or durability. */
  public completeViaHistorySql(plan: CurrentPcbViaWritePlan): CurrentProjectHistorySqlCompletion {
    requireViaPlan(this, plan); const origin = this.#viaMainOrigin, structureOrigin = this.#viaStructureOrigin;
    if (origin === null || structureOrigin === null || this.#mainRunner === null || this.#viaMainBoundBody === null || this.#viaHistoryCompletion !== null ||
      this.#viaClockValue === null || this.#viaSaveCapturedBody === null || this.#viaSaveCapturedBody.clock !== this.#viaClockValue || !this.#viaSdkPhases.has("save") || this.#viaFailed || this.#viaCleanupOnly) { throw error("PCB_VIA_HISTORY_COMPLETION_UNAVAILABLE"); }
    const actual = pcbViaMainOrigins.get(origin), structure = projectSaveStructureOrigins.get(structureOrigin);
    if (actual === undefined || actual.owner !== this || actual.plan !== plan || structure === undefined || structure.owner !== this || structure.operation !== plan) { throw error("PCB_VIA_HISTORY_COMPLETION_ORIGINAL"); }
    actual.assertOriginal(); structure.assertOriginal(); const runner = this.#mainRunner; const body = this.#viaMainBoundBody;
    const effects = this.requireViaHistorySqlEffects(plan);
    if (effects.projectUuid !== plan.target.projectUuid || effects.branchUuid !== plan.target.branchUuid || effects.bodySha256 !== body.bodySha256 ||
      body.documentUuid !== plan.target.documentUuid || this.#viaSaveCapturedBody.headTicket !== body.headTicket) { throw error("PCB_VIA_HISTORY_COMPLETION_BODY"); }
    const value: CurrentProjectHistorySqlCompletionValue = Object.freeze({ projectUuid: effects.projectUuid, branchUuid: effects.branchUuid, documentUuid: body.documentUuid,
      bodySha256: effects.bodySha256, saveHeadTicket: body.headTicket, workerClock: this.#viaClockValue, workerEditVersion: body.workerEditVersion,
      originalHistoryNativeCallbacksCompleted: true, selectedSqlStillFenced: true });
    const token: CurrentProjectHistorySqlCompletion = Object.freeze({ profile: "private.current-project-history-sql-completion.v1" });
    const assertCurrent = (): void => { requireViaPlan(this, plan); actual.assertOriginal(); structure.assertOriginal();
      if (this.#viaHistoryCompletion !== token || this.#mainRunner !== runner || this.#viaMainBoundBody !== body || this.#viaMainOrigin !== origin || this.#viaStructureOrigin !== structureOrigin ||
        this.#viaFailed || this.#viaCleanupOnly || runner.requireViaHistoryCompleted(origin) !== effects) { throw error("PCB_VIA_HISTORY_COMPLETION_CHANGED"); } };
    this.#viaHistoryCompletion = token; projectHistorySqlCompletions.set(token, { owner: this, operation: plan, origin: structureOrigin, value, assertCurrent, consumed: false }); assertCurrent(); return token;
  }
  #viaReadContext(plan: CurrentPcbViaWritePlan): Readonly<{ context: CurrentPcbDiagnosticContext; pipe: CurrentPcbViaWritePipe; pcb: ReturnType<CurrentPcbDiagnosticContext["modelContext"]>; ui: ReturnType<CurrentPcbDiagnosticContext["pcbOpeningContext"]>; current: () => void }> {
    requireViaPlan(this, plan); const context = this.#stagedContext, pipe = this.#pipe, profile = this.#pcbSourceProfile;
    if (!(pipe instanceof CurrentPcbViaWritePipe) || context === null || profile === null || !this.#pcbSourceQualified || this.#pcbFrameObservation?.ok !== true ||
      this.#mainRunner?.selectedSqlFenceState()["ready"] !== true || canonicalJson(plan.target) !== canonicalJson(this.#projectOpeningTarget) ||
      this.#viaFailed || this.#viaPlan !== null && this.#viaPlan !== plan) { throw error("PCB_VIA_CONTEXT"); }
    this.#viaPlan = plan;
    const pcb = context.modelContext(), ui = context.pcbOpeningContext();
    const current = (): void => { this.#available(); requireViaPlan(this, plan); context.pcbScript(profile);
      if (this.#stagedContext !== context || canonicalJson(context.modelContext()) !== canonicalJson(pcb) || canonicalJson(context.pcbOpeningContext()) !== canonicalJson(ui) ||
        this.#viaPlan !== plan) { throw error("PCB_VIA_CONTEXT_CHANGED"); } };
    current(); return { context, pipe, pcb, ui, current };
  }
  public async observeViaPrimitives(plan: CurrentPcbViaWritePlan, phase: CurrentPcbViaObservationPhase): Promise<CurrentPcbViaNativeObservation> {
    const selected = this.#viaReadContext(plan);
    if (this.#viaNativePhases.has(phase)) { throw error("PCB_VIA_NATIVE_CONSUMED"); }
    this.#enter(true); this.#viaNativePhases.add(phase);
    try {
      await this.#verifyInstallation(); selected.current(); await this.#verify(); selected.current();
      await this.#observeParent(); selected.current(); await this.#observeOpeningAncillary(); selected.current();
      const observations = decodeCurrentPcb209PrimitivesReply(await this.#transfer(() => selected.pipe.observePrimitives209(selected.ui.uniqueContextId, plan.target)), plan.target);
      selected.current(); await this.#observeParent(); selected.current(); await this.#observeOpeningAncillary(); selected.current();
      await this.#verifyInstallation(); selected.current(); await this.#verify(); selected.current();
      const packet: CurrentPcbViaNativeObservation = Object.freeze({ schema: "private.current-pcb-via-native-observation.v1", phase, observations });
      pcbViaPackets.set(packet, Object.freeze({ owner: this, plan, phase, kind: "native" })); return packet;
    } finally { this.#busy = false; }
  }
  public async observeViaSceneMembership(plan: CurrentPcbViaWritePlan, phase: CurrentPcbViaObservationPhase): Promise<CurrentPcbViaSceneObservation> {
    const selected = this.#viaReadContext(plan);
    if (this.#viaScenePhases.has(phase)) { throw error("PCB_VIA_SCENE_CONSUMED"); }
    this.#enter(true); this.#viaScenePhases.add(phase);
    try {
      await this.#verifyInstallation(); selected.current(); await this.#verify(); selected.current();
      await this.#observeParent(); selected.current(); await this.#observeOpeningAncillary(); selected.current();
      selected.pipe.bindViaSpatial(phase, { uniqueContextId: selected.pcb.uniqueContextId, scriptId: selected.pcb.scriptId });
      const runner = new CurrentPcbSpatialCaptureRunner({ request: (command): Promise<unknown> => this.#transfer(() => selected.pipe.observeViaSpatial(phase, command)),
        assertCurrent: selected.current }, selected.pcb.scriptId, selected.pcb.uniqueContextId, plan.target.documentUuid);
      const rows = await runner.readTrackBatch([{ kind: "region", mode: "inside", leftMil: -10_000_000, rightMil: 10_000_000, bottomMil: -10_000_000, topMil: 10_000_000 }]);
      selected.current(); const observation = rows[0];
      if (rows.length !== 1 || observation === undefined || observation.identities.length !== observation.sceneLineCount + observation.sceneViaCount) { throw error("PCB_VIA_SCENE_INCOMPLETE"); }
      await this.#observeParent(); selected.current(); await this.#observeOpeningAncillary(); selected.current();
      await this.#verifyInstallation(); selected.current(); await this.#verify(); selected.current();
      const packet: CurrentPcbViaSceneObservation = Object.freeze({ schema: "private.current-pcb-via-scene-observation.v1", phase, observation });
      pcbViaPackets.set(packet, Object.freeze({ owner: this, plan, phase, kind: "scene" })); return packet;
    } finally { this.#busy = false; }
  }
  /** Fixed original SDK binding only. Save remains denied until the separate
   * original effect and selected-SQL request grants have been implemented. */
  public async executeViaStage(stage: CurrentPcbViaWriteStage, plan: CurrentPcbViaWritePlan, dispatch?: CurrentPcbViaWriteDispatch): Promise<CurrentPcbViaWriteStageResult | Readonly<{ captured: true }>> {
    const selected = this.#viaReadContext(plan);
    if (stage === "save") { throw error("PCB_VIA_SAVE_EFFECT_AND_SQL_REQUIRED"); }
    if (stage === "create") { this.#requireViaMainPrecreate(plan, dispatch, false); }
    const intent = stage === "create" && dispatch !== undefined ? consumeCurrentPcbViaWriteDispatch(dispatch, stage, this, plan) : null;
    if (stage === "create" && this.#viaProducerPrefix === null) { throw error("PCB_VIA_ORIGINAL_PRODUCER_PREFIX_REQUIRED"); }
    if (stage === "create" && intent === null || this.#viaSdkPhases.has(stage) || stage !== "capture" && (this.#viaSdkBinding === null || !this.#viaSdkQualified)) { throw error("PCB_VIA_SDK_CONSUMED"); }
    this.#enter(true); this.#viaSdkPhases.add(stage);
    try {
      if (intent !== null) { await intent.assertPublished(); selected.current(); const prefix = this.#viaProducerPrefix; if (prefix === null) { throw error("PCB_VIA_ORIGINAL_PRODUCER_PREFIX_REQUIRED"); } await requireOriginalCurrentProjectSaveProducerPrefix(prefix, this, plan).assertCurrent(); selected.current(); }
      await this.#verifyInstallation(); selected.current(); await this.#verify(); selected.current();
      const binding = stage === "capture" ? selected.ui.uniqueContextId : this.#viaSdkBinding;
      if (binding === null) { throw error("PCB_VIA_SDK_BINDING"); }
      if (stage === "create") { this.#requireViaMainPrecreate(plan, dispatch, true); }
      const raw = await this.#transfer(() => { if (stage === "create") { this.#requireViaMainPrecreate(plan, dispatch, true); } return selected.pipe.observeViaStage(stage, binding, plan); }); selected.current();
      if (stage === "capture") {
        if (!exact(raw, ["result"]) || !record(raw["result"]) || !exact(raw["result"], ["type", "subtype", "className", "description", "objectId"]) || raw["result"]["type"] !== "object" ||
          raw["result"]["subtype"] !== "array" || raw["result"]["className"] !== "Array" || raw["result"]["description"] !== "Array(9)" ||
          typeof raw["result"]["objectId"] !== "string" || !/^[A-Za-z\d_.:-]{1,256}$/u.test(raw["result"]["objectId"])) { throw error("PCB_VIA_SDK_CAPTURE"); }
        this.#viaSdkBinding = raw["result"]["objectId"];
        const methods = decodeCurrentPcbViaSdkTuple(await this.#transfer(() => selected.pipe.observeViaSdkProperties(this.#viaSdkBinding ?? ""))); selected.current();
        const createScript = decodeCurrentPcbViaSdkMethod(await this.#transfer(() => selected.pipe.observeViaSdkProperties(methods.create)), "create"); selected.current();
        const saveScript = decodeCurrentPcbViaSdkMethod(await this.#transfer(() => selected.pipe.observeViaSdkProperties(methods.save)), "save"); selected.current();
        if (createScript !== saveScript) { throw error("PCB_VIA_SDK_SOURCE_REALM"); }
        qualifyCurrentPcbViaSdkSource(await this.#transfer(() => selected.pipe.getScriptSource(createScript))); selected.current();
        await this.#verifyInstallation(); selected.current(); await this.#verify(); selected.current();
        this.#viaSdkQualified = true; return Object.freeze({ captured: true });
      }
      if (!exact(raw, ["result"]) || !record(raw["result"]) || !exact(raw["result"], ["type", "value"]) || raw["result"]["type"] !== "object") { throw error("PCB_VIA_SDK_RESULT"); }
      const result = Object.freeze(currentPcbViaWriteStageResultSchema.parse(raw["result"]["value"]));
      if (result.stage !== stage || !result.ok) { throw error("PCB_VIA_SDK_FAILED"); }
      pcbViaPackets.set(result, Object.freeze({ owner: this, plan, phase: stage, kind: "stage" })); return result;
    } catch (caughtError) { this.#viaFailed = true; throw caughtError; } finally { this.#busy = false; }
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
    if ((this.#purpose !== "diagnostic209" && this.#purpose !== "visual209") || context === null || this.#selectionRelations209Consumed || !this.#pcbSourceQualified ||
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

  /** One consumed camera stage under a purpose sealed at birth. Neither
   * selection mutation, transport retries nor automatic restoration is offered. */
  public async performVisual209(input: CurrentDisposableOpenSealedTarget, operationInput: CurrentPcb209VisualOperation): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = this.#pcbSourceProfile, target = currentDisposableOpenSealedTargetSchema.parse(input);
    const operation = Object.freeze(currentPcb209VisualOperationSchema.parse(operationInput));
    if (this.#purpose !== "visual209" || context === null || this.#visual209Consumed || !this.#pcbSourceQualified ||
        profile === null || this.#pcbFrameObservation?.ok !== true || this.#workersConsumed || this.#modelConsumed ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("VISUAL209_UNAVAILABLE"); }
    this.#pipe.assertPcb209ShapeStageCapacity();
    this.#enter(true); this.#visual209Consumed = true;
    try {
      const pcb = context.modelContext(), selected = context.pcbOpeningContext();
      const reprove = (): void => {
        this.#available(); context.pcbScript(profile);
        if (JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(selected) ||
            JSON.stringify(context.modelContext()) !== JSON.stringify(pcb)) { throw error("VISUAL209_CONTEXT"); }
      };
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      await this.#transfer(async (): Promise<RecordValue> => {
        const raw = await this.#pipe.performVisual209(selected.uniqueContextId, target, operation);
        const observed = decodeCurrentPcb209VisualReply(raw, target, operation);
        if (Buffer.byteLength(canonicalJson(observed)) > CURRENT_PCB_209_VISUAL_RESULT_BYTES) { throw error("VISUAL209_RESULT_BOUND"); }
        // Retain before #transfer's final owner check and all parent/frame/
        // Installation reproofs. This candidate never authorizes a retry.
        this.#visual209RetainedObservation = observed; return raw;
      });
      const result = this.#visual209RetainedObservation;
      if (result === null) { throw error("VISUAL209_RESULT_MISSING"); }
      reprove(); await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      return result;
    } catch (caughtError) { this.#input.emit("error", error("VISUAL209_FAILED")); throw caughtError; }
    finally { this.#busy = false; }
  }

  /** Bounded original-window geometry and budget snapshot. No CDP or paint call. */
  public async observeWindowCaptureReadiness209(): Promise<Readonly<RecordValue>> {
    if (this.#purpose !== "visual209" || this.#windowCapture209ReadinessQueries >= CURRENT_WINDOW_CAPTURE_READINESS_LIMITS.queries ||
        this.#closeConsumed || this.#terminationObserved || this.#visualAbortAttempted) { throw error("WINDOW_READINESS209_UNAVAILABLE"); }
    if (MAX_TOTAL - this.#total < MAX_LINE + CURRENT_WINDOW_CAPTURE_TRANSPORT_RESERVATION.cleanupReplyBytes) { throw error("WINDOW_READINESS209_STDOUT_HEADROOM"); }
    this.#enter(true); this.#windowCapture209ReadinessQueries += 1; this.#windowCapture209CleanupReserved = true;
    if (this.#windowResize209Consumed) { this.#windowResize209ReadinessObserved = false; }
    if (this.#windowRestore209Consumed) { this.#windowRestore209ReadinessObserved = false; }
    try {
      await this.#verifyInstallation(); this.#available(); await this.#verify(); this.#available();
      const raw = await this.#request({ action: "window-capture-readiness" });
      const result = currentWindowCaptureReadiness(raw, { helperStdoutBytes: this.#total, cdpRequests: this.#pipe.status().requestCount,
        readerAvailable: this.#pipe.status().failure === null, sourceQualified: this.#pcbSourceQualified,
        captureConsumed: this.#windowCapture209Consumed || this.#rendererCapture209Consumed, restoreConsumed: this.#windowRestore209Consumed, resizeConsumed: this.#windowResize209Consumed, queriesUsed: this.#windowCapture209ReadinessQueries });
      await this.#verifyInstallation(); this.#available(); await this.#verify(); this.#available();
      if (this.#windowRestore209Consumed && result["restoreStateObserved"] === true) {
        requireCurrentWindowRestoreReadiness(result, this.#windowRestore209Retained); this.#windowRestore209ReadinessObserved = true;
      }
      if (this.#windowResize209Consumed && result["resizeGeometryObserved"] === true) {
        requireCurrentWindowResizeReadiness(result, this.#windowResize209Retained); this.#windowResize209ReadinessObserved = true;
      }
      return result;
    } finally { this.#busy = false; }
  }

  /** One fixed nonactivating restore submission. Geometry is observed separately. */
  public async restoreWindowForCapture209(input: CurrentDisposableOpenSealedTarget): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = this.#pcbSourceProfile, target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (this.#purpose !== "visual209" || context === null || profile === null || !this.#pcbSourceQualified ||
        this.#windowRestore209Consumed || this.#windowResize209Consumed || this.#windowCapture209Consumed || this.#rendererCapture209Consumed || this.#workersConsumed || this.#modelConsumed ||
        CURRENT_WINDOW_CAPTURE_READINESS_LIMITS.queries - this.#windowCapture209ReadinessQueries < CURRENT_WINDOW_RESTORE_LIMITS.requiredQuerySlots ||
        this.#pipe.status().requestCount > DIAGNOSTIC_REQUEST_LIMIT - CURRENT_WINDOW_RESTORE_LIMITS.requiredCdpStages * CURRENT_WINDOW_CAPTURE_TRANSPORT_RESERVATION.cdpRequests ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("WINDOW_RESTORE209_UNAVAILABLE"); }
    this.#pipe.assertPcb209WindowCaptureCapacity(); const transport = new CurrentWindowCaptureTransportBudget(this.#total);
    this.#enter(true); this.#windowRestore209Consumed = true; this.#windowRestore209ReadinessObserved = false;
    this.#windowCapture209Transport = transport; this.#windowCapture209CleanupReserved = true;
    try {
      const pcb = context.modelContext(), selected = context.pcbOpeningContext();
      const reprove = (): void => {
        this.#available(); context.pcbScript(profile);
        if (JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(selected) || JSON.stringify(context.modelContext()) !== JSON.stringify(pcb)) {
          throw error("WINDOW_RESTORE209_CONTEXT");
        }
      };
      const identity = async (): Promise<void> => {
        const result = decodeCurrentPcbDiagnosticPcbOpeningReply(
          await this.#transfer(() => this.#pipe.observePcbOpening(selected.uniqueContextId, target, "observe")), target, "observe");
        reprove();
        if (!result.ok || result.status !== "frame-observed" || !result.frameObserved ||
            result.windowTabId !== this.#projectOpeningResult?.observation?.windowTabId) { throw error("WINDOW_RESTORE209_ACTIVE_PCB"); }
      };
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove(); await identity();
      const raw = await this.#request({ action: "restore-window-for-capture", acceptWindowRestoreEffects: true });
      this.#windowRestore209Retained = decodeCurrentWindowRestore(raw);
      reprove(); await identity(); await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove(); return this.#windowRestore209Retained;
    } catch (caughtError) { this.#input.emit("error", error("WINDOW_RESTORE209_FAILED")); throw caughtError; }
    finally { this.#windowCapture209Transport = null; this.#busy = false; }
  }

  /** One fixed asynchronous resize submission. Geometry is observed separately. */
  public async resizeWindowForCapture209(input: CurrentDisposableOpenSealedTarget): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = this.#pcbSourceProfile, target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (this.#purpose !== "visual209" || context === null || profile === null || !this.#pcbSourceQualified ||
        this.#windowResize209Consumed || this.#windowCapture209Consumed || this.#rendererCapture209Consumed || this.#windowRestore209Consumed && !this.#windowRestore209ReadinessObserved || this.#workersConsumed || this.#modelConsumed ||
        this.#windowCapture209ReadinessQueries >= CURRENT_WINDOW_CAPTURE_READINESS_LIMITS.queries ||
        this.#pipe.status().requestCount > DIAGNOSTIC_REQUEST_LIMIT - 2 * CURRENT_WINDOW_CAPTURE_TRANSPORT_RESERVATION.cdpRequests ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("WINDOW_RESIZE209_UNAVAILABLE"); }
    this.#pipe.assertPcb209WindowCaptureCapacity(); const transport = new CurrentWindowCaptureTransportBudget(this.#total);
    this.#enter(true); this.#windowResize209Consumed = true; this.#windowResize209ReadinessObserved = false;
    this.#windowCapture209Transport = transport; this.#windowCapture209CleanupReserved = true;
    try {
      const pcb = context.modelContext(), selected = context.pcbOpeningContext();
      const reprove = (): void => {
        this.#available(); context.pcbScript(profile);
        if (JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(selected) || JSON.stringify(context.modelContext()) !== JSON.stringify(pcb)) {
          throw error("WINDOW_RESIZE209_CONTEXT");
        }
      };
      const identity = async (): Promise<void> => {
        const result = decodeCurrentPcbDiagnosticPcbOpeningReply(
          await this.#transfer(() => this.#pipe.observePcbOpening(selected.uniqueContextId, target, "observe")), target, "observe");
        reprove();
        if (!result.ok || result.status !== "frame-observed" || !result.frameObserved ||
            result.windowTabId !== this.#projectOpeningResult?.observation?.windowTabId) { throw error("WINDOW_RESIZE209_ACTIVE_PCB"); }
      };
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove(); await identity();
      const raw = await this.#request({ action: "resize-window-for-capture", acceptWindowResizeEffects: true });
      this.#windowResize209Retained = decodeCurrentWindowResize(raw);
      reprove(); await identity(); await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove(); return this.#windowResize209Retained;
    } catch (caughtError) { this.#input.emit("error", error("WINDOW_RESIZE209_FAILED")); throw caughtError; }
    finally { this.#windowCapture209Transport = null; this.#busy = false; }
  }

  /** Derive the source-qualified original parent session without adopting a
   * caller-selected target/session or refreshing a historical capture token. */
  public rendererCaptureSession209(): string {
    this.#available(); const context = this.#stagedContext, profile = this.#pcbSourceProfile;
    if (this.#purpose !== "visual209" || context === null || profile === null || !this.#pcbSourceQualified || this.#pcbFrameObservation?.ok !== true) {
      throw error("RENDERER_CAPTURE209_SOURCE_REQUIRED");
    }
    context.pcbScript(profile); return context.modelContext().sessionId;
  }
  /** Consume one fixed original-parent screenshot. PNG bytes are retained
   * before final reproof; a refusal or blank result never permits fallback. */
  public async captureRendererViewport209(input: CurrentDisposableOpenSealedTarget): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = this.#pcbSourceProfile, target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (this.#purpose !== "visual209" || context === null || profile === null || !this.#pcbSourceQualified || this.#pcbFrameObservation?.ok !== true ||
        this.#windowCapture209Consumed || this.#rendererCapture209Consumed || this.#workersConsumed || this.#modelConsumed ||
        JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("RENDERER_CAPTURE209_UNAVAILABLE"); }
    this.#pipe.assertPcb209RendererCaptureCapacity(); const transport = new CurrentRendererCaptureTransportBudget(this.#total);
    this.#enter(true); this.#rendererCapture209Consumed = true; this.#windowCapture209Transport = transport; this.#windowCapture209CleanupReserved = true;
    try {
      const pcb = context.modelContext(), selected = context.pcbOpeningContext();
      const reprove = (): void => {
        this.#available(); context.pcbScript(profile);
        if (JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(selected) || JSON.stringify(context.modelContext()) !== JSON.stringify(pcb) ||
            this.rendererCaptureSession209() !== pcb.sessionId) { throw error("RENDERER_CAPTURE209_CONTEXT"); }
      };
      const identity = async (): Promise<void> => {
        const result = decodeCurrentPcbDiagnosticPcbOpeningReply(
          await this.#transfer(() => this.#pipe.observePcbOpening(selected.uniqueContextId, target, "observe")), target, "observe");
        reprove();
        if (!result.ok || result.status !== "frame-observed" || !result.frameObserved ||
            result.windowTabId !== this.#projectOpeningResult?.observation?.windowTabId) { throw error("RENDERER_CAPTURE209_ACTIVE_PCB"); }
      };
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove(); await identity();
      await this.#transfer(async (): Promise<RecordValue> => {
        const raw = await this.#pipe.captureRendererViewport209();
        if (!exact(raw, ["data"]) || typeof raw["data"] !== "string" || raw["data"].length > CURRENT_RENDERER_CAPTURE_LIMITS.maximumBase64Units) {
          throw error("RENDERER_CAPTURE209_REPLY");
        }
        const captured = decodeCurrentRendererCapture({ schema: "easyeda-pro-control.renderer-viewport-png.v1", sessionId: pcb.sessionId,
          pngBase64: raw["data"], screenshotReplyReceived: true, renderCompletionVerified: false });
        // Retain the complete bounded candidate before #transfer's final owner
        // Check and all later parent/frame/source reproofs. It grants no retry.
        this.#rendererCapture209Retained = freezeDeep({ ...captured.observation, pngBase64: captured.png.toString("base64") });
        return raw;
      });
      reprove(); await identity(); await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      if (this.#rendererCapture209Retained === null) { throw error("RENDERER_CAPTURE209_RESULT_MISSING"); }
      return Object.freeze({ schema: "easyeda-pro-control.renderer-viewport-png.v1", sessionId: pcb.sessionId,
        pngBase64: this.#rendererCapture209Retained["pngBase64"], screenshotReplyReceived: true, renderCompletionVerified: false });
    } catch (caughtError) { this.#input.emit("error", error("RENDERER_CAPTURE209_FAILED")); throw caughtError; }
    finally { this.#windowCapture209Transport = null; this.#busy = false; }
  }

  /** One original-window paint. Exact native image data is retained before any
   * final context check; only this successful method return can be published. */
  public async captureWindow209(input: CurrentDisposableOpenSealedTarget, hwnd: string): Promise<Readonly<RecordValue>> {
    const context = this.#stagedContext, profile = this.#pcbSourceProfile, target = currentDisposableOpenSealedTargetSchema.parse(input);
    if (this.#purpose !== "visual209" || context === null || this.#windowCapture209Consumed || this.#rendererCapture209Consumed ||
        this.#windowResize209Consumed && !this.#windowResize209ReadinessObserved || this.#windowRestore209Consumed && !this.#windowRestore209ReadinessObserved || !this.#pcbSourceQualified ||
        profile === null || this.#pcbFrameObservation?.ok !== true || this.#workersConsumed || this.#modelConsumed ||
        !/^[1-9][0-9]{0,18}$/u.test(hwnd) || JSON.stringify(target) !== JSON.stringify(this.#projectOpeningTarget)) { throw error("WINDOW_CAPTURE209_UNAVAILABLE"); }
    this.#pipe.assertPcb209WindowCaptureCapacity();
    const transport = new CurrentWindowCaptureTransportBudget(this.#total);
    this.#enter(true); this.#windowCapture209Consumed = true; this.#windowCapture209Transport = transport;
    this.#windowCapture209CleanupReserved = true;
    try {
      const pcb = context.modelContext(), selected = context.pcbOpeningContext();
      const reprove = (): void => {
        this.#available(); context.pcbScript(profile);
        if (JSON.stringify(context.pcbOpeningContext()) !== JSON.stringify(selected) ||
            JSON.stringify(context.modelContext()) !== JSON.stringify(pcb)) { throw error("WINDOW_CAPTURE209_CONTEXT"); }
      };
      const identity = async (): Promise<void> => {
        const result = decodeCurrentPcbDiagnosticPcbOpeningReply(
          await this.#transfer(() => this.#pipe.observePcbOpening(selected.uniqueContextId, target, "observe")), target, "observe");
        reprove();
        if (!result.ok || result.status !== "frame-observed" || !result.frameObserved ||
            result.windowTabId !== this.#projectOpeningResult?.observation?.windowTabId) { throw error("WINDOW_CAPTURE209_ACTIVE_PCB"); }
      };
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove(); await identity();
      this.#windowCapture209DispatchAttempted = true;
      const raw = await this.#request({ action: "capture-window", hwnd, acceptWindowPaintEffects: true });
      const captured = decodeCurrentWindowCapture(raw);
      this.#windowCapture209Retained = freezeDeep({ ...captured.observation, pngBase64: captured.png.toString("base64") });
      if (captured.observation.hwnd !== hwnd) { throw error("WINDOW_CAPTURE209_HWND"); }
      reprove(); await identity(); await this.#observeParent(); reprove(); await this.#observeOpeningAncillary(); reprove();
      await this.#verifyInstallation(); reprove(); await this.#verify(); reprove();
      return this.#windowCapture209Retained;
    } catch (caughtError) { this.#input.emit("error", error("WINDOW_CAPTURE209_FAILED")); throw caughtError; }
    finally { this.#windowCapture209Transport = null; this.#busy = false; }
  }

  /** Fixed parent-only child reporting. The optional profile is an internal
   * synthetic-test seam, never part of the public lifecycle request. */
  public async inspectWorkers(profile?: DiagnosticWorkerScriptProfile): Promise<Readonly<RecordValue>> {
    if (this.#startupPurpose || (this.#purpose === "diagnostic209" || this.#purpose === "visual209" || this.#purpose === "pcb-spatial209" || this.#purpose === "pcb-component-spatial209")) { throw error("STARTUP_LEGACY_ROUTE"); }
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
    if (this.#purpose === "diagnostic209" || this.#purpose === "visual209" || this.#purpose === "pcb-spatial209" || this.#purpose === "pcb-component-spatial209") { throw error("MODEL_OBSERVATION_UNAVAILABLE"); }
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
      sessionId = await this.#pipe.attachTarget(targetId, event => {
        if (this.#purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE && this.#viaWorkerController?.observeUiEvent(event) === true) { return; } if (this.#purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE && this.#schematicWorkerController?.observeUiEvent(event) === true) { return; } context.observeEvent(event); });
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
    if ((this.#purpose === "worker-startup-footprint209" || footprintCopyObservationPurpose(this.#purpose) || this.#purpose === "worker-startup-footprint-saved209" || this.#purpose === "worker-startup-footprint-held-saved209")) { this.#footprintUiSource = qualifyCurrentFootprintCopyUiSource(source["scriptSource"]); }
    return result;
  }

  /** Transfer the original source-qualified parent and pipe budget once. The
   * durable lifecycle owns intent; this capability cannot be recreated from
   * its journal. No project or worker is opened by the handoff itself. */
  public async handoffWorkerStartup(): Promise<CurrentPcbWorkerStartupHandoff> {
    const attachment = this.#stagedAttachment, context = this.#stagedContext, original = this.#binding;
    if (!this.#startupPurpose || !(this.#pipe instanceof CurrentPcbWorkerStartupDiscoveryPipe || this.#pipe instanceof CurrentFootprintCombinedDiscoveryPipe ||
        this.#pipe instanceof CurrentFootprintCopyForwardDiscoveryPipe || this.#pipe instanceof CurrentFootprintCopyForwardSavedDiscoveryPipe) ||
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
        if (this.#purpose === "worker-startup-footprint-held-saved209") {
          // Retained context and local bytes are not fresh Windows evidence.
          // Separate native stage brackets and native I/O retain kernel proof.
          current(); await this.#verify(); current(); await this.#verifyStartupFacade(); current();
          return;
        }
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
      let channel: CurrentPcbWorkerStartupChannel | CurrentPcb209WorkerStartupChannel | CurrentFootprintCopyPreparationChannel | CurrentFootprintCopyExecutionChannel | CurrentFootprintCombinedStartupChannel | CurrentFootprintCopyForwardStartupChannel | CurrentFootprintCopyForwardSavedStartupChannel | CurrentFootprintCopySavedChannel | CurrentFootprintCopyHeldSavedStartupChannel | CurrentPcb209EmptyStartupChannel | CurrentPcb209RatlineContinuationChannel | CurrentPcb209RatlineStartupChannel;
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
       } else if (this.#purpose === "worker-startup-footprint-held-saved209") {
        const origin = this.originalFootprintSourceBinding();
        channel = new CurrentFootprintCopyHeldSavedStartupChannel(native,
          Object.freeze({ sessionId: selected.sessionId, uniqueContextId: selected.uniqueContextId,
            projectUuid: origin.target.projectUuid, branchUuid: origin.target.branchUuid }),
          (bytes): void => { this.#heldSavedEventBytes(bytes); }, priorUsage);
      } else if (this.#purpose === "worker-startup-footprint-saved209") {
        channel = this.#forwardRole === "forward-saved-readback" ?
          new CurrentFootprintCopyForwardSavedStartupChannel(native, (bytes): void => { this.#forwardRendererEvent(bytes); }, priorUsage) :
          new CurrentFootprintCopySavedChannel(native, priorUsage);
      } else if (this.#purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE) {
        channel = new CurrentFootprintForwardExecutionStartupChannel(native, (bytes): void => { this.#forwardRendererEvent(bytes); }, priorUsage);
      } else if (this.#purpose === CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE) {
        channel = new CurrentFootprintCopyForwardStartupChannel(native, (bytes): void => { this.#forwardRendererEvent(bytes); }, priorUsage);
      } else if (this.#purpose === CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE) {
        channel = new CurrentProjectStructureStartupChannel(native, priorUsage);
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
          if (this.#forwardRole === "forward-saved-readback") { throw error("FORWARD_SAVED_OBSERVATION_OPEN_UNAVAILABLE"); }
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
        !(handoff.channel instanceof CurrentFootprintCopyPreparationChannel || handoff.channel instanceof CurrentFootprintCopyExecutionChannel || handoff.channel instanceof CurrentFootprintCombinedStartupChannel || handoff.channel instanceof CurrentFootprintCopyForwardStartupChannel || handoff.channel instanceof CurrentFootprintForwardExecutionStartupChannel)) { throw error("FOOTPRINT_UI_UNAVAILABLE"); }
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
      if (this.#purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE) {
        this.#available();
        if (this.#startupHandoff !== handoff || this.#footprintUiRunner !== runner || this.#footprintUiPacket !== packet ||
            this.#footprintUiOpening !== opening || this.#footprintUiOpeningResult !== result) { throw error("FORWARD_EXECUTION_UI_REPROOF_CHANGED"); }
        this.#forwardExecutionUiReproofSucceeded = true;
      }
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
        !(handoff.channel instanceof CurrentFootprintCopyExecutionChannel || handoff.channel instanceof CurrentFootprintCombinedStartupChannel || handoff.channel instanceof CurrentFootprintCopyForwardStartupChannel) || CurrentFootprintCopyUiRunner.prototype.createClockRegistration !== createFootprintClockRegistration ||
        (CurrentFootprintCopyExecutionChannel.prototype.requestFootprintClockRegistration !== requestFootprintClockRegistration ||
          CurrentFootprintCombinedStartupChannel.prototype.requestFootprintClockRegistration !== requestFootprintClockRegistration ||
          CurrentFootprintCopyForwardStartupChannel.prototype.requestFootprintClockRegistration !== requestFootprintClockRegistration)) { throw error("FOOTPRINT_CLOCK_REGISTRATION_UNAVAILABLE"); }
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
                CurrentFootprintCombinedStartupChannel.prototype.requestFootprintClockRegistration !== requestFootprintClockRegistration ||
          CurrentFootprintCopyForwardStartupChannel.prototype.requestFootprintClockRegistration !== requestFootprintClockRegistration)) { throw error("FOOTPRINT_CLOCK_REGISTRATION_OWNER_CHANGED"); }
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

  /** Private original-generation handoff only. This arms no breakpoint and
   * invokes no document clock, create, backend request or Save. The entire
   * writer reservation and actual native invocation are still unmounted. */
  public async issueFootprintCopyClockRpcOrigin(opening: CurrentFootprintCopyOpeningOwner,
    result: CurrentFootprintCopyOpeningResult, workerLease: CurrentFootprintCopyClockRpcConstructionLease): Promise<CurrentFootprintCopyClockRpcOrigin> {
    this.requireOriginalFootprintCombinedGeneration();
    const handoff = this.#startupHandoff, packet = this.#footprintClockRegistrationPacket, ui = this.#footprintClockRegistrationRunner;
    const context = this.#stagedContext, original = this.#binding;
    if (this.#footprintClockRpcOriginAttempted || handoff === null || !(handoff.channel instanceof CurrentFootprintCombinedStartupChannel) ||
        original === null || context === null || ui === null || packet === null || opening !== this.#footprintUiOpening ||
        result !== this.#footprintUiOpeningResult || this.#combinedAbortAttempted || this.#combinedOutputCleanupOnly) {
      throw error("FOOTPRINT_CLOCK_RPC_UNAVAILABLE");
    }
    this.#enter(true); this.#footprintClockRpcOriginAttempted = true;
    try {
      // This full opening proof may execute fixed project getters. It belongs
      // Before the handoff and before either realm can be paused by the RPC unit.
      await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency);
      const worker = requireCurrentFootprintCopyClockRpcConstructionLease(workerLease);
      const registrationLease = ui.issueInvocationLease(packet);
      const registration = requireCurrentFootprintCopyClockRpcRegistrationLease(registrationLease);
      const selected = context.openingContext();
      const same = (cleanup: boolean): void => {
        this.#available(); this.requireOriginalFootprintCombinedGeneration(); worker.assertCleanup(); registration.assertCleanup();
        if (this.#binding !== original || this.#startupHandoff !== handoff || this.#stagedContext !== context ||
            this.#footprintClockRegistrationRunner !== ui || this.#footprintClockRegistrationPacket !== packet ||
            this.#footprintUiOpening !== opening || this.#footprintUiOpeningResult !== result || this.#startupChannel !== handoff.channel ||
            registration.issuer !== ui || registration.sessionId !== selected.sessionId || selected.sessionId !== handoff.dependency.parentSessionId ||
            context.script().scriptId !== registration.scriptId || this.#releaseConsumed ||
            !cleanup && (this.#terminationObserved || this.#closeConsumed || this.#combinedAbortAttempted || this.#combinedOutputCleanupOnly)) {
          throw error("FOOTPRINT_CLOCK_RPC_OWNER_CHANGED");
        }
      };
      same(false); await worker.assertOriginal(); same(false); await registration.assertOriginal(); same(false);
      requireCurrentFootprintCopyClockRpcHandoffHeadroom(handoff.channel.status().nextRequestId);
      const prepared = await prepareCurrentFootprintCopyClockRpcTransport(handoff.dependency, workerLease); same(false);
      const transport = requireCurrentFootprintCopyClockRpcTransportHandoff(prepared);
      if (transport.dependency !== handoff.dependency || transport.workerLease !== workerLease) { throw error("FOOTPRINT_CLOCK_RPC_TRANSPORT"); }
      const reservation = await prepareCurrentFootprintCopyClockRpcChannel(handoff.dependency, transport.workerSessionId); same(false);
      transport.consume();
      const route = await beginCurrentFootprintCopyClockRpcChannel(handoff.dependency, reservation); same(false);
      const token = Object.freeze({ profile: "private.current-footprint-clock-rpc-origin.v1" as const });
      footprintClockRpcOwners.set(token, this);
      footprintClockRpcOrigins.set(token, Object.freeze({ workerLease, registrationLease, workerSessionId: route.workerSessionId,
        assertOriginal: async (): Promise<void> => { same(false); await route.assertOriginal(); same(false); },
        assertCleanup: async (): Promise<void> => { same(true); await route.assertCleanup(); same(true); },
        assertOriginalGenerationExited: async (): Promise<void> => { same(true); await route.assertOriginalGenerationExited(); same(true); },
        request: async (command: CurrentFootprintCopyClockRpcCommand, cleanup: boolean): Promise<unknown> => { same(cleanup); const reply = await route.request(command, cleanup); same(cleanup); return reply; },
        pump: async (cleanup: boolean): Promise<void> => { same(cleanup); await route.pump(cleanup); same(cleanup); },
        takeEvent: () => { same(true); return route.takeEvent(); },
        fail: (): void => { route.fail(); },
        retire: async (): Promise<void> => { same(true); await route.retire(); same(true); },
      }));
      return token;
    } finally { this.#busy = false; }
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
        !this.#footprintUiReproofAttempted || !(handoff.channel instanceof CurrentFootprintCopyPreparationChannel || handoff.channel instanceof CurrentFootprintCopyExecutionChannel || handoff.channel instanceof CurrentFootprintCombinedStartupChannel || handoff.channel instanceof CurrentFootprintCopyForwardStartupChannel)) { throw error("FOOTPRINT_MANAGER_ROUTE_UNAVAILABLE"); }
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

  /** Request normal closure of the original window, attempting any unused held
   * group release first. Preserve a failed release acknowledgment; closure never
   * selects Save/Discard or substitutes for later root/Job termination proof. */
  public async requestNormalClose(hwnd: string): Promise<void> {
    if (this.#closeConsumed) { throw error("CLOSE_CONSUMED"); }
    if (!/^[1-9]\d{0,18}$/u.test(hwnd)) { throw error("WINDOW_INPUT"); }
    if (heldCachePurpose(this.#purpose) && this.#heldSavedCache !== null &&
        this.#heldSavedCache.retained()["releaseAttempted"] !== true) {
      try { await this.releaseFootprintCopyHeldSavedCache(); }
      catch {
        // Retain the consumed group failure. A still-available original close
        // May end the realm, but never fabricates a group-release reply.
        this.#heldSavedFailed = true;
      }
    }
    this.#enter(true); this.#closeConsumed = true;
    try {
      await this.#verify(); this.#available();
      if (this.#purpose === "worker-startup-footprint-main209" || this.#purpose === "footprint-head-age209" || bornFootprintTransport(this.#purpose)) {
        await this.#detachMainForNormalClose();
      }
      const reply = await this.#request({ action: "normal-close", hwnd, confirmNormalClose: true });
      if (!exact(reply, ["closeDispatched", "saveOrDiscardSelected"]) || reply["closeDispatched"] !== true || reply["saveOrDiscardSelected"] !== false) { throw error("CLOSE_REPLY"); }
      await this.#verify(); this.#available();
    } finally { this.#busy = false; }
  }

  async #detachMainForNormalClose(): Promise<void> {
    const methods = this.#mainCloseMethods, original = this.#binding, runner = this.#mainRunner;
    // This original owner has never entered inspector attachment. The helper
    // Independently proves no attempt and no retained socket before WM_CLOSE.
    if (!this.#mainAttachAttempted && !this.#mainAttached && runner === null) { return; }
    if (original === null || runner === null || !this.#mainAttached || this.#combinedMainBusy || this.#mainCloseDetachAttempted ||
      this.#mainCompletionState !== "unused" && this.#mainCompletionState !== "retired") { throw error("MAIN_CLOSE_QUIESCENCE"); }
    this.#mainCloseDetachAttempted = true;
    const same = (): void => {
      this.#available();
      if (this.#binding !== original || this.#mainRunner !== runner || !this.#busy || !this.#closeConsumed ||
        CurrentFootprintCopyMainBackendRunner.prototype.prepareNormalClose !== methods.prepare ||
        CurrentFootprintCopyMainBackendRunner.prototype.requireNormalClosePrepared !== methods.require) { throw error("MAIN_CLOSE_OWNER_CHANGED"); }
    };
    this.#mainCloseCleanupActive = true;
    try {
      same(); await methods.prepare.call(runner); same(); methods.require.call(runner);
      const reply = await this.#request({ action: "main-close-detach" });
      same(); methods.require.call(runner);
      if (!exact(reply, ["inspectorDetached"]) || reply["inspectorDetached"] !== true) { throw error("MAIN_CLOSE_DETACH_REPLY"); }
      this.#mainCloseDetached = true; this.#mainAttached = false;
      await this.#verify(); same();
    } finally { this.#mainCloseCleanupActive = false; }
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
      this.#purpose !== "worker-startup-footprint-copy209" && this.#purpose !== "worker-startup-footprint-saved209" && this.#purpose !== "worker-startup-footprint-held-saved209" && this.#purpose !== CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE) {
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
  /** V2 target custody comes from its exact sealed source inputs. The legacy
   * generation accessor remains closed to this separately born native owner. */
  public originalFootprintForwardExecutionTarget(): CurrentFootprintCopyNativeTarget {
    assertOriginalCurrentFootprintForwardExecutionNativeOwner(this); return this.originalFootprintForwardExecutionSource().source;
  }
  /** Record only this original v2 owner's actual exit or unlaunched closure.
   * The retained object and kernel binding use the existing termination core. */
  public originalFootprintForwardExecutionTermination(): object {
    assertOriginalCurrentFootprintForwardExecutionNativeOwner(this);
    const noProcess = this.#noProcessProof ?? this.#footprintUnlaunchedRelease, observed = this.#terminationObservation;
    if (this.#released && this.#childClosed && !this.#launchSucceeded && noProcess !== null) {
      footprintTerminations.set(noProcess, Object.freeze({ owner: this, binding: this.#binding, noProcess: true })); return noProcess;
    }
    if (!this.#terminationObserved || observed === null || !observed.terminated || this.#binding === null) { throw error("FOOTPRINT_ORIGINAL_TERMINATION"); }
    footprintTerminations.set(observed, Object.freeze({ owner: this, binding: this.#binding, noProcess: false })); return observed;
  }
  public requireFootprintForwardExecutionTermination(original: object): void {
    assertOriginalCurrentFootprintForwardExecutionNativeOwner(this); const held = footprintTerminations.get(original);
    if (held?.owner !== this || held.binding !== this.#binding || (held.noProcess ? !this.#released || !this.#childClosed || this.#launchSucceeded || original !== (this.#noProcessProof ?? this.#footprintUnlaunchedRelease) : !this.#terminationObserved)) { throw error("FOOTPRINT_ORIGINAL_TERMINATION"); }
  }
  /** Historical original Via closure only. No-process cleanup and an abort
   * acknowledgement cannot substitute for observed root exit and empty Job. */
  public originalViaWriteTermination(): object {
    assertOriginalCurrentPcbViaWriteOwner(this); const observed = this.#terminationObservation;
    if (!this.#terminationObserved || observed === null || !observed.terminated || observed.originalRootExited !== true || observed.originalJobEmpty !== true || this.#binding === null) { throw error("PCB_VIA_ORIGINAL_TERMINATION"); }
    if (this.#viaOriginalTermination === null) { this.#viaOriginalTermination = observed; pcbViaTerminations.set(observed, Object.freeze({ owner: this, binding: this.#binding })); }
    this.requireViaWriteTermination(this.#viaOriginalTermination); return this.#viaOriginalTermination;
  }
  public requireViaWriteTermination(original: object): void {
    assertOriginalCurrentPcbViaWriteOwner(this); const retained = pcbViaTerminations.get(original); const observed = this.#terminationObservation;
    if (retained?.owner !== this || retained.binding !== this.#binding || original !== this.#viaOriginalTermination || !this.#terminationObserved || observed === null || !observed.terminated || observed.originalRootExited !== true || observed.originalJobEmpty !== true) { throw error("PCB_VIA_ORIGINAL_TERMINATION"); }
  }
  /** Historical original body/SQL facts only. These private completed values
   * cannot recreate live observer readiness after the original generation ends. */
  public originalViaWriteClosedEffects(plan: CurrentPcbViaWritePlan, termination: object): CurrentPcbViaWriteClosedEffects {
    assertOriginalCurrentPcbViaWriteOwner(this); this.requireViaWriteTermination(termination); requireViaPlan(this, plan);
    const body=this.#viaMainBoundBody; const history=this.#viaHistorySqlEffects; const structure=this.#viaStructureSqlEffects; const clock=this.#viaClockValue;
    if (!this.#viaMainPrecreateReady || this.#viaMainCreateEnrollment===null || !this.#viaSdkPhases.has("save") || this.#viaMainBoundEffect===null || body===null || history===null || structure===null || clock===null || this.#viaSaveCapturedBody?.clock!==clock || body.bodySha256!==history.bodySha256 || body.headTicket!==structure.ticket || history.projectUuid!==plan.target.projectUuid || history.branchUuid!==plan.target.branchUuid || structure.projectUuid!==history.projectUuid || structure.branchUuid!==history.branchUuid || structure.structureText!==expectedCurrentGeneratedProjectSaveStructure(requireOriginalCurrentPcbViaWritePlan(plan).prepared,clock)) { throw error("PCB_VIA_ORIGINAL_CLOSED_EFFECTS_UNAVAILABLE"); }
    this.#viaMainCreateEnrollment.assertOriginalAttempted();
    this.#viaClosedEffects ??= Object.freeze({schema:"private.current-pcb-via-write-closed-effects.v1",body,history,structure,workerClock:clock,originalSaveAttemptRetained:true,originalRootAndJobClosureRetained:true,liveContinuationAuthorized:false});
    return this.#viaClosedEffects;
  }
  /** Distinct SCH data capture accepts only this generation's actual observed
   * root exit and empty original Job. Unlaunched/no-process cleanup is not an
   * executed writer termination and cannot issue this reference. */
  public originalSchematicDisplayTermination(): object {
    assertOriginalCurrentSchematicDisplayWriteOwner(this); const observed = this.#terminationObservation;
    if (!this.#terminationObserved || observed === null || !observed.terminated || observed.originalRootExited !== true ||
      observed.originalJobEmpty !== true || this.#binding === null) { throw error("SCHEMATIC_DISPLAY_ORIGINAL_TERMINATION"); }
    if (this.#schematicDisplayTermination === null) {
      this.#schematicDisplayTermination = observed; schematicDisplayTerminations.set(observed, Object.freeze({ owner: this, binding: this.#binding }));
    }
    this.requireSchematicDisplayTermination(this.#schematicDisplayTermination); return this.#schematicDisplayTermination;
  }
  public requireSchematicDisplayTermination(original: object): void {
    assertOriginalCurrentSchematicDisplayWriteOwner(this); const observed = this.#terminationObservation, retained = schematicDisplayTerminations.get(original);
    if (retained?.owner !== this || retained.binding !== this.#binding || original !== this.#schematicDisplayTermination || !this.#terminationObserved || observed === null ||
      !observed.terminated || observed.originalRootExited !== true || observed.originalJobEmpty !== true) { throw error("SCHEMATIC_DISPLAY_ORIGINAL_TERMINATION"); }
  }
  public observeFootprintCopyRelease(): "pending" | "released" {
    this.requireOriginalFootprintGeneration();
    if (!this.#releaseConsumed) { throw error("FOOTPRINT_RELEASE_NOT_ATTEMPTED"); }
    if (!this.#released || !this.#childClosed) { return "pending"; }
    if (this.#failure !== null || this.#child.exitCode !== 0 || this.#child.signalCode !== null) { throw error("FOOTPRINT_RELEASE_FAILED"); }
    return "released";
  }
  /** Observe the one original v2 release without sending it again. The legacy
   * generation/release accessors deliberately retain their old purpose guards. */
  public observeFootprintForwardExecutionRelease(): "pending" | "released" {
    assertOriginalCurrentFootprintForwardExecutionNativeOwner(this);
    if (!this.#releaseConsumed) { throw error("FORWARD_EXECUTION_RELEASE_NOT_ATTEMPTED"); }
    if (!this.#released || !this.#childClosed) { return "pending"; }
    if (this.#failure !== null || this.#child.exitCode !== 0 || this.#child.signalCode !== null) { throw error("FORWARD_EXECUTION_RELEASE_FAILED"); }
    return "released";
  }
  /** Bind the actual source preparation, retained opening and checkpoint once.
   * This selects closed snapshots only; it issues no writer qualification. */
  public async sealFootprintCopyExecutionSource(operationId: string, opening: CurrentFootprintCopyOpeningOwner,
    result: CurrentFootprintCopyOpeningResult, preparation: CurrentFootprintCopyPreparation,
    checkpoint: CheckpointReceipt, runtime: MachineProfile["runtime"]): Promise<void> {
    this.requireOriginalFootprintGeneration();
    if (this.#purpose !== "worker-startup-footprint-copy209" && this.#purpose !== CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE ||
        !/^footprint-copy-[a-z\d][a-z\d-]{0,95}$(?![\s\S])/u.test(operationId)) { throw error("FOOTPRINT_SOURCE_SEAL_CONSUMED"); }
    await this.#sealFootprintSourceInputs(operationId, opening, result, preparation, checkpoint, runtime);
  }
  /** Seal only this separately born v2 writer's actual opening and preparation.
   * The legacy generation/seal accessors still reject this native purpose. */
  public async sealFootprintForwardExecutionSource(operationId: string, opening: CurrentFootprintCopyOpeningOwner,
    result: CurrentFootprintCopyOpeningResult, preparation: CurrentFootprintCopyPreparation,
    checkpoint: CheckpointReceipt, runtime: MachineProfile["runtime"]): Promise<void> {
    assertOriginalCurrentFootprintForwardExecutionNativeOwner(this);
    if (!/^footprint-forward-execution-[a-z\d][a-z\d-]*$(?![\s\S])/u.test(operationId) || operationId.length > 96) { throw error("FORWARD_EXECUTION_SOURCE_ID"); }
    await this.#sealFootprintSourceInputs(operationId, opening, result, preparation, checkpoint, runtime);
  }
  /** Preflight the fixed source/preparation/seal unit against this birth's
   * actual normal-class use and separate shared physical-ID ceiling. */
  public assertFootprintForwardExecutionSourceCapacity(): void {
    assertOriginalCurrentFootprintForwardExecutionNativeOwner(this); this.#available();
    const channel = this.#startupChannel, resources = forwardResourceBirths.get(this);
    if (!(channel instanceof CurrentFootprintForwardExecutionStartupChannel) || this.#startupHandoff?.channel !== channel || resources === undefined) { throw error("FORWARD_EXECUTION_SOURCE_CHANNEL"); }
    resources.methods.requireOriginal();
    const counters = resources.methods.generationStatus.call(resources.ledger, "forward-writer", this), status = forwardExecutionChannelStatus.call(channel);
    const required = CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS + CURRENT_FOOTPRINT_COPY_PREPARATION_REQUESTS + CURRENT_FOOTPRINT_COPY_SOURCE_SEAL_REQUESTS;
    const capacity = CURRENT_FOOTPRINT_FORWARD_EXECUTION_CAPACITY.writer.renderer;
    if (!status.started || status.failed || status.released || status.pendingReplies !== 0 || !Number.isSafeInteger(status.nextRequestId) ||
        counters.failed || counters.rendererNormalRequests + required > capacity.normalClassLimit || status.nextRequestId + required - 1 > capacity.normalIdCeiling) {
      throw error("FORWARD_EXECUTION_SOURCE_CAPACITY");
    }
  }
  /** Original v2 input references survive cleanup as historical custody only.
   * This accessor issues no main, clock, create or saved-generation capability. */
  public originalFootprintForwardExecutionSource(): Readonly<ForwardSourceInputs & { source: CurrentFootprintCopyNativeTarget }> {
    assertOriginalCurrentFootprintForwardExecutionNativeOwner(this);
    const inputs = this.#forwardExecutionSourceInputs, source = this.#footprintSourceBinding;
    if (inputs === null || source === null || inputs.resources !== forwardResourceBirths.get(this) || inputs.binding !== this.#binding ||
        canonicalJson({ ...source, before: undefined }) !== this.#footprintSourceBindingText) { throw error("FORWARD_EXECUTION_SOURCE_REQUIRED"); }
    return Object.freeze({ ...inputs, source });
  }
  async #sealFootprintSourceInputs(operationId: string, opening: CurrentFootprintCopyOpeningOwner,
    result: CurrentFootprintCopyOpeningResult, preparation: CurrentFootprintCopyPreparation,
    checkpoint: CheckpointReceipt, runtime: MachineProfile["runtime"]): Promise<void> {
    const execution = this.#purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE;
    const original = (): void => {
      if (execution) { assertOriginalCurrentFootprintForwardExecutionNativeOwner(this); }
      else { this.requireOriginalFootprintGeneration(); }
    };
    original();
    const handoff = this.#startupHandoff, target = this.#projectOpeningTarget;
    if ((!execution && this.#purpose !== "worker-startup-footprint-copy209" && this.#purpose !== CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE) ||
        handoff === null || target === null || this.#footprintSourceSealAttempted) { throw error("FOOTPRINT_SOURCE_SEAL_CONSUMED"); }
    if (execution && (this.#footprintUiOpening !== opening || this.#footprintUiOpeningResult !== result || !this.#forwardExecutionUiReproofSucceeded)) {
      throw error("FORWARD_EXECUTION_SOURCE_UI_REQUIRED");
    }
    this.#footprintSourceSealAttempted = true;
    const binding = this.#binding, main = this.#mainRunner, resources = forwardResourceBirths.get(this);
    // oxlint-disable-next-line typescript/unbound-method -- Retain the original method identity and call it only with this exact main receiver.
    const mainRetained = main?.retained ?? null;
    await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency);
    const prepared = await requireCurrentFootprintCopyOwned(preparation, opening);
    original();
    const source = `/mnt/${target.rawWindowsPath[0]?.toLowerCase()}/${target.rawWindowsPath.slice(3).replaceAll("\\", "/")}`;
    if (checkpoint.source !== source || prepared.before.checkpointSha256 !== checkpoint.checkpointSha256 ||
      prepared.sourcePlan.source.projectUuid !== target.projectUuid || prepared.sourcePlan.source.branchUuid !== target.branchUuid) { throw error("FOOTPRINT_SOURCE_SEAL_BINDING"); }
    const text = canonicalJson(checkpoint); const root = await controlRootCapability();
    const verified = await verifyCheckpoint(checkpoint.receiptPath, { expectedSource: source,
      artifactRoots: [join(controlDataDirectory(), "checkpoints")], controlRoot: root, maximumSourceBytes: 268_435_456 });
    await requireCurrentFootprintCopyOpening(opening, result, handoff.dependency);
    const rechecked = await requireCurrentFootprintCopyOwned(preparation, opening);
    original();
    // oxlint-disable-next-line typescript/unbound-method -- Compare the captured original method; do not invoke an unbound replacement.
    if (this.#projectOpeningTarget !== target || this.#mainRunner !== main || (main?.retained ?? null) !== mainRetained || this.#binding !== binding ||
      forwardResourceBirths.get(this) !== resources || rechecked.before !== prepared.before || rechecked.copyPlan !== prepared.copyPlan ||
      rechecked.sourcePlan !== prepared.sourcePlan || rechecked.nativeArguments !== prepared.nativeArguments ||
      rechecked.headReference !== prepared.headReference || rechecked.sourceAssets !== prepared.sourceAssets || canonicalJson(checkpoint) !== text ||
      !verified.ok || verified.sourceChanged || !verified.sourceMatchesReceipt || !verified.checkpointMatchesReceipt ||
      !verified.sourceEqualsCheckpoint || verified.sourceSha256 !== checkpoint.sourceSha256 || verified.checkpointSha256 !== checkpoint.checkpointSha256) {
      throw error("FOOTPRINT_SOURCE_SEAL_DRIFT");
    }
    this.#footprintSourceBinding = Object.freeze({ operationId, target, source, runtime: Object.freeze({ ...runtime }),
      checkpoint: freezeDeep(checkpoint), before: prepared.before });
    this.#footprintSourceBindingText = canonicalJson({ ...this.#footprintSourceBinding, before: undefined });
    if (this.#purpose === CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE) {
      this.#forwardSourceInputs = Object.freeze({ opening, result, preparation, owned: rechecked, main, mainRetained, resources, binding });
    } else if (execution) {
      if (resources === undefined || main === null || mainRetained === null) { throw error("FORWARD_EXECUTION_SOURCE_RESOURCES"); }
      this.#forwardExecutionSourceInputs = Object.freeze({ opening, result, preparation, owned: rechecked, main, mainRetained, resources, binding });
    }
  }
  /** Retain actual sealed inputs for a future factory, without admitting any
   * writer command, changing launch purpose or proving settled publication. */
  public issueFootprintForwardExecutionInputOrigin(): CurrentFootprintForwardExecutionInputOrigin {
    assertOriginalCurrentFootprintCopyForwardNativeOwner(this);
    const held = this.#forwardSourceInputs, source = this.#footprintSourceBinding;
    if (held === null || source === null || held.main === null || held.mainRetained === null || held.resources === undefined || held.binding === null) {
      throw error("FORWARD_EXECUTION_INPUTS_UNSEALED");
    }
    const { main, mainRetained, resources, binding } = held;
    const requireInputs = (mode: "normal" | "retained"): CurrentFootprintForwardExecutionInputs => {
      assertOriginalCurrentFootprintCopyForwardNativeOwner(this);
      if (this.#forwardSourceInputs !== held || this.#footprintSourceBinding !== source || this.#mainRunner !== main ||
        this.#binding !== binding || forwardResourceBirths.get(this) !== resources || this.#forwardLedger !== resources.ledger ||
        this.#forwardLedgerMethods !== resources.methods || requireOriginalForwardLedgerBinding(resources.ledger) !== resources.methods ||
        main.retained !== mainRetained || held.owned.before !== source.before || source.checkpoint !== this.originalFootprintSourceBinding().checkpoint) {
        throw error("FORWARD_EXECUTION_INPUTS_CHANGED");
      }
      const generation = resources.methods.generationStatus.call(resources.ledger, "forward-writer", this);
      if (mode === "normal") {
        this.#requireFootprintMain(true);
        if (generation.failed || this.#combinedAbortAttempted || this.#combinedOutputCleanupOnly || this.#forwardCleanupOnly || this.#mainCloseCleanupActive) {
          throw error("FORWARD_EXECUTION_INPUTS_CLEANUP_ONLY");
        }
        const observed = mainRetained.call(main);
        if (!observed.completed || observed.failed || observed.pendingReplies !== 0 || observed.requestOriginIssued || observed.releaseAttempted || observed.released || !observed.sourceQualified) {
          throw error("FORWARD_EXECUTION_INPUTS_MAIN_UNAVAILABLE");
        }
      } else if (mode !== "retained") { throw error("FORWARD_EXECUTION_INPUTS_MODE"); }
      return Object.freeze({ owner: this, main, source, opening: held.opening, result: held.result, preparation: held.preparation,
        owned: held.owned, ledger: resources.ledger, ledgerMethods: resources.methods });
    };
    requireInputs("normal");
    if (this.#forwardExecutionInputOrigin === null) {
      this.#forwardExecutionInputOrigin = Object.freeze({ profile: "private.current-footprint-forward-execution-input-origin.v1", executionAuthorized: false });
      forwardExecutionInputOrigins.set(this.#forwardExecutionInputOrigin, Object.freeze({ owner: this, requireInputs }));
    }
    return this.#forwardExecutionInputOrigin;
  }
  public bindFootprintSavedSource(writer: CurrentFootprintCopyNativeOwner | CurrentFootprintCopyForwardNativeOwner,
    after: Awaited<ReturnType<typeof readExactSqlInventory>>): void {
    this.requireOriginalFootprintGeneration(); const source = originalCurrentFootprintCopyNativeTarget(writer);
    const snapshot = requireCurrentFootprintCopyClosedSnapshot(writer, after);
    if (this.#forwardRole === "forward-saved-readback") {
      if (this.#forwardSavedHandoff === null) { throw error("FORWARD_SAVED_HANDOFF"); }
      const held = requireForwardSavedObservationHandoff(this.#forwardSavedHandoff, this);
      if (held.writer !== writer || held.after !== after) { throw error("FORWARD_SAVED_SOURCE_BINDING"); }
    }
    if (this.#purpose !== "worker-startup-footprint-saved209" && this.#purpose !== "worker-startup-footprint-held-saved209" || this.#launchConsumed || this.#footprintSourceBinding !== null ||
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
  /** Admit the two genuine held roles without widening generic copy ownership. */
  #requireHeldRole(): void {
    if (this.#purpose === "footprint-held-cache209") { assertOriginalCurrentFootprintHeldCacheValidationOwner(this); }
    else if (this.#purpose === "worker-startup-footprint-held-saved209") { this.requireOriginalFootprintGeneration(); }
    else { throw error("HELD_CACHE_ORIGINAL_ROLE"); }
  }

  /** Select only the genuine role's original target. A diagnostic binding is
   * deliberately excluded from every copy/saved source or generation registry. */
  #heldOrigin(): Readonly<{ target: CurrentDisposableOpenSealedTarget }> {
    this.#requireHeldRole();
    if (this.#purpose === "footprint-held-cache209") {
      const original = heldCacheValidationFactories.get(this);
      if (original === undefined) { throw error("HELD_CACHE_ORIGINAL_FACTORY"); } return original.allocation.binding;
    }
    return this.originalFootprintSourceBinding();
  }

  /** Bracket local identity checks with native point samples. A normal stage
   * rechecks cutoff and its original transport after every asynchronous step. */
  async #heldSavedNativeReprove(guard?: () => void): Promise<void> {
    this.#requireHeldRole();
    const binding = this.#binding;
    const cleanup = this.#heldSavedCleanupActive;
    const current = (): void => {
      this.#requireHeldRole(); this.#available();
      if (binding === null || this.#binding !== binding || !this.#launchSucceeded || this.#terminationObserved || this.#releaseConsumed ||
          !cleanup && (this.#heldSavedFailed || this.#closeConsumed || this.#heldSavedAbortAttempted)) { throw error("HELD_SAVED_NATIVE_LIFETIME"); }
      guard?.();
    };
    current(); await this.#verify(); current();
    const before = await this.#request({ action: "worker-startup-reprove", heldCleanup: cleanup });
    current();
    if (!exact(before, ["current"]) || before["current"] !== true) { throw error("HELD_SAVED_NATIVE_REPROOF"); }
    await this.#verifyStartupFacade(); current(); await this.#verify(); current();
    const after = await this.#request({ action: "worker-startup-reprove", heldCleanup: cleanup });
    current();
    if (!exact(after, ["current"]) || after["current"] !== true || this.#binding !== binding) { throw error("HELD_SAVED_NATIVE_REPROOF"); }
  }

  /** Charge observed renderer events to this original held-purpose ledger and
   * its aggregate byte ceiling before accepting further event traffic. */
  #heldSavedEventBytes(bytes: number): void {
    if (!heldCachePurpose(this.#purpose) || !Number.isSafeInteger(bytes) || bytes < 0 ||
        this.#heldSavedObservedEventBytes + bytes > 8 * 1024 * 1024) { throw error("HELD_SAVED_EVENT_BYTES"); }
    this.#heldSavedObservedEventBytes += bytes;
    const { ledger, methods } = this.#heldSavedResources();
    methods.consumeRendererEvent.call(ledger, this, bytes);
  }

  /** Start only this fresh factory-issued generation, retain its original
   * browser engine and parent realm, then create one privately held runner. */
  public async startFootprintHeldCacheValidationGeneration(): Promise<void> {
    this.#requireHeldRole();
    if (this.#purpose !== "footprint-held-cache209" || this.#heldSavedStartAttempted || this.#installation === null ||
        !(this.#pipe instanceof CurrentFootprintHeldCacheDiagnosticPipe)) { throw error("HELD_CACHE_START_CONSUMED"); }
    this.#heldSavedStartAttempted = true;
    const allocation = heldCacheValidationFactories.get(this)?.allocation;
    if (allocation === undefined) { throw error("HELD_CACHE_ORIGINAL_FACTORY"); }
    const origin = allocation.binding;
    const current = (): void => {
      this.#requireHeldRole(); this.#available(); requireHeldCacheValidationBinding(allocation);
      if (this.#heldSavedFailed || this.#heldSavedAbortAttempted || this.#closeConsumed || this.#terminationObserved || this.#releaseConsumed) { throw error("HELD_CACHE_NORMAL_ENDED"); }
    };
    const backend = this.#installation.plan.files[1];
    if (backend === undefined || backend.sha256 !== ORDINARY_LAUNCH_209_PROFILE.installedFiles[1].sha256) { throw error("HELD_CACHE_BACKEND_INSTALLATION"); }
    const startup = new CurrentFootprintHeldCachePageReadiness(backend.windowsPath); this.#heldCacheStartup = startup;
    try {
      await verifyCurrentDisposableOpenCheckpoint(origin.prepared, origin.originalTarget); current();
      const executable = this.#installation.plan.files[0];
      if (executable === undefined) { throw error("HELD_CACHE_INSTALLATION"); }
      startup.stage("launch");
      await this.launch({ executable: executable.windowsPath, executableSha256: executable.sha256, confirmDiagnosticLaunch: true }); current();
      startup.stage("native-reproof"); await this.#heldSavedNativeReprove(); current();
      const targetId = await this.#observeHeldCacheBrowser(current); current();
      startup.stage("frames");
      const frames = await this.inspectFrames(targetId); current();
      const rows = frames["frames"];
      if (!Array.isArray(rows)) { throw error("HELD_CACHE_FRAMES"); }
      const roots = rows.filter((value: unknown): value is RecordValue => record(value) && !Object.hasOwn(value, "parentId"));
      const frameId = roots[0]?.["id"];
      if (roots.length !== 1 || typeof frameId !== "string") { throw error("HELD_CACHE_ROOT_FRAME"); }
      startup.stage("ui-source");
      await this.inspectScript(frameId, CURRENT_PCB_209_OPENING_SCRIPTS.ui); current();
      startup.stage("parent"); await this.#observeParent(); current();
      startup.stage("ancillary"); await this.#observeOpeningAncillary(); current();
      const context = this.#stagedContext;
      const engine = this.#savedCacheBrowserVersion;
      const binding = this.#binding;
      const pipe = this.#pipe;
      if (context === null || engine === null || binding === null) { throw error("HELD_CACHE_ORIGINAL_CONTEXT"); }
      // oxlint-disable-next-line typescript/unbound-method -- Capture exact methods from original private-field receivers; every call below supplies those same receivers.
      const assertContext = context.assertCurrent, metadataContext = context.savedCacheMetadataContext, requestCache = pipe.observeHeldCache;
      const selected = metadataContext.call(context);
      const same = (): void => {
        this.#requireHeldRole(); this.#available(); requireHeldCacheValidationBinding(allocation);
        if (this.#binding !== binding || this.#stagedContext !== context || this.#pipe !== pipe || this.#savedCacheBrowserVersion !== engine ||
            this.#heldOrigin() !== origin || context.assertCurrent !== assertContext || context.savedCacheMetadataContext !== metadataContext ||
            pipe.observeHeldCache !== requestCache || this.#terminationObserved || this.#releaseConsumed || !this.#launchSucceeded) { throw error("HELD_CACHE_CONTEXT_CHANGED"); }
        if (!this.#heldSavedCleanupActive) {
          current(); assertContext.call(context); const actual = metadataContext.call(context);
          if (actual.sessionId !== selected.sessionId || actual.uniqueContextId !== selected.uniqueContextId) { throw error("HELD_CACHE_REALM_CHANGED"); }
        }
      };
      startup.stage("cache-bind");
      pipe.bindHeldCache({ ...selected, projectUuid: origin.target.projectUuid, branchUuid: origin.target.branchUuid });
      const bound = await this.#request({ action: "held-saved-bind", ...selected,
        projectUuid: origin.target.projectUuid, branchUuid: origin.target.branchUuid }); same();
      if (!exact(bound, ["bound"]) || bound["bound"] !== true) { throw error("HELD_CACHE_BIND_ACK"); }
      this.#heldSavedCurrent = same;
      this.#heldSavedCache = new CurrentFootprintSavedCacheHeldRunner(Object.freeze({
        assertCurrent: (): Promise<void> => { same(); return Promise.resolve(); },
        request: async (command: CurrentFootprintSavedCacheHeldCommand): Promise<unknown> => {
          same(); const reply = await this.#transfer(() => requestCache.call(pipe, command)); same();
          const { ledger, methods } = this.#heldSavedResources();
          methods.consumeHeldReply.call(ledger, this, Buffer.byteLength(canonicalJson(reply))); return reply;
        },
      }), { ...selected, projectUuid: origin.target.projectUuid, branchUuid: origin.target.branchUuid }, engine);
      await this.#heldSavedNativeReprove(); same(); this.#heldSavedStarted = true; startup.stage("ready");
    } catch (caughtError) { startup.fail(); this.#heldSavedFailed = true; throw caughtError; }
  }

  /** Start the separate saved generation without borrowing diagnostic authority. */
  public async startFootprintCopyHeldSavedGeneration(): Promise<void> {
    this.requireOriginalFootprintGeneration();
    const origin = this.originalFootprintSourceBinding();
    if (this.#purpose !== "worker-startup-footprint-held-saved209" || this.#heldSavedStartAttempted || this.#installation === null) { throw error("HELD_SAVED_START_CONSUMED"); }
    this.#heldSavedStartAttempted = true;
    try {
    const executable = this.#installation.plan.files[0];
    if (executable === undefined) { throw error("HELD_SAVED_INSTALLATION"); }
    await this.launch({ executable: executable.windowsPath, executableSha256: executable.sha256, confirmDiagnosticLaunch: true });
    await this.#heldSavedNativeReprove(); await this.browserObservation();
    const pages = this.#browserTargets?.filter(value => value["type"] === "page" && value["attached"] === false &&
      typeof value["url"] === "string" && /^https:\/\/client\/editor\?cll=(?:trace|debug|info|warn|error)(?:#.*)?$/u.test(value["url"]));
    const targetId = pages?.[0]?.["targetId"];
    if (pages?.length !== 1 || typeof targetId !== "string") { throw error("HELD_SAVED_PAGE"); }
    const frames = await this.inspectFrames(targetId), rows = frames["frames"];
    if (!Array.isArray(rows)) { throw error("HELD_SAVED_FRAMES"); }
    const roots = rows.filter((value: unknown): value is RecordValue => record(value) && !Object.hasOwn(value, "parentId"));
    const frameId = roots[0]?.["id"];
    if (roots.length !== 1 || typeof frameId !== "string") { throw error("HELD_SAVED_ROOT_FRAME"); }
    await this.inspectScript(frameId, CURRENT_PCB_209_OPENING_SCRIPTS.ui); await this.handoffWorkerStartup();
    const context = this.#stagedContext;
    const handoff = this.#startupHandoff;
    const engine = this.#savedCacheBrowserVersion;
    const binding = this.#binding;
    if (context === null || handoff === null || engine === null || binding === null ||
        !(handoff.channel instanceof CurrentFootprintCopyHeldSavedStartupChannel)) { throw error("HELD_SAVED_ORIGINAL_CONTEXT"); }
    // oxlint-disable-next-line typescript/unbound-method -- Capture originals and invoke only on their original private-field receivers.
    const assertContext = context.assertCurrent, openingContext = context.openingContext, requestCache = handoff.channel.requestFootprintHeldSavedCache;
    const selected = context.savedCacheMetadataContext();
    const channel = handoff.channel;
    const bound = await this.#request({ action: "held-saved-bind", sessionId: selected.sessionId,
      uniqueContextId: selected.uniqueContextId, projectUuid: origin.target.projectUuid, branchUuid: origin.target.branchUuid });
    if (!exact(bound, ["bound"]) || bound["bound"] !== true) { throw error("HELD_SAVED_BIND_ACK"); }
    const same = (): void => {
      this.#available(); this.requireOriginalFootprintGeneration();
      if (this.#binding !== binding || this.#stagedContext !== context || this.#startupHandoff !== handoff ||
          this.#savedCacheBrowserVersion !== engine || this.originalFootprintSourceBinding() !== origin ||
          context.assertCurrent !== assertContext || context.openingContext !== openingContext || channel.requestFootprintHeldSavedCache !== requestCache ||
          this.#terminationObserved || this.#releaseConsumed || !this.#launchSucceeded) { throw error("HELD_SAVED_CONTEXT_CHANGED"); }
      if (!this.#heldSavedCleanupActive) {
        if (this.#heldSavedFailed || this.#closeConsumed) { throw error("HELD_SAVED_NORMAL_ENDED"); }
        assertContext.call(context); const actual = openingContext.call(context);
        if (actual.sessionId !== selected.sessionId || actual.uniqueContextId !== selected.uniqueContextId) { throw error("HELD_SAVED_REALM_CHANGED"); }
      }
    };
    this.#heldSavedCurrent = same;
    this.#heldSavedCache = new CurrentFootprintSavedCacheHeldRunner(Object.freeze({
      // Retained JavaScript custody only. Fresh native samples belong to the
      // Enclosing stage; this callback issues neither CDP nor helper controls.
      assertCurrent: (): Promise<void> => { same(); return Promise.resolve(); },
        request: async (command: CurrentFootprintSavedCacheHeldCommand): Promise<unknown> => {
          same(); const reply = await requestCache.call(channel, command); same();
          const { ledger, methods } = this.#heldSavedResources();
          methods.consumeHeldReply.call(ledger, this, Buffer.byteLength(canonicalJson(reply))); return reply;
        },
    }), { sessionId: selected.sessionId, uniqueContextId: selected.uniqueContextId,
      projectUuid: origin.target.projectUuid, branchUuid: origin.target.branchUuid }, engine);
    await this.#heldSavedNativeReprove(); same(); this.#heldSavedStarted = true;
    } catch (caughtError) { this.#heldSavedFailed = true; throw caughtError; }
  }

  public retainedFootprintCopyHeldSavedCache(): CurrentFootprintSavedCacheHeldRunner {
    this.#requireHeldRole();
    if (this.#heldSavedCache === null) { throw error("HELD_SAVED_RUNNER_REQUIRED"); }
    if (types.isProxy(this.#heldSavedCache) || Object.getPrototypeOf(this.#heldSavedCache) !== CurrentFootprintSavedCacheHeldRunner.prototype ||
        Reflect.ownKeys(this.#heldSavedCache).length > 0 ||
        !originalFootprintDescriptors(CurrentFootprintSavedCacheHeldRunner.prototype, heldRunnerDescriptors)) { throw error("HELD_SAVED_RUNNER_METHODS"); }
    return this.#heldSavedCache;
  }
  public requireOriginalFootprintCopyHeldSavedCache(runner: CurrentFootprintSavedCacheHeldRunner): void {
    if (this.retainedFootprintCopyHeldSavedCache() !== runner) { throw error("HELD_SAVED_ORIGINAL_RUNNER"); }
  }

  /** Bracket one retained runner stage with fresh native ownership checks.
   * A refusal ends normal work without releasing the owner; cleanup uses its
   * separate reserved bucket and cannot restore a failed normal stage. */
  async #heldSavedStage<T>(work: (runner: CurrentFootprintSavedCacheHeldRunner) => Promise<T>, cleanup = false): Promise<T> {
    const runner = this.retainedFootprintCopyHeldSavedCache();
    if (!cleanup && (this.#heldSavedFailed || !this.#heldSavedStarted)) { throw error("HELD_SAVED_NORMAL_ENDED"); }
    this.#enter(true); this.#heldSavedCleanupActive = cleanup;
    try {
      await this.#heldSavedNativeReprove(this.#heldSavedCurrent ?? undefined); this.#heldSavedCurrent?.();
      const result = await work(runner);
      await this.#heldSavedNativeReprove(this.#heldSavedCurrent ?? undefined); this.#heldSavedCurrent?.(); return result;
    } catch (caughtError) { this.#heldSavedFailed = true; throw caughtError; }
    finally { this.#heldSavedCleanupActive = false; this.#busy = false; }
  }
  public prepareFootprintCopyHeldSavedCache(): Promise<void> { return this.#heldSavedStage(runner => heldRunnerMethods.prepare.call(runner)); }
  public observeFirstFootprintCopyHeldSavedCache(): Promise<CurrentFootprintSavedCacheHeldObservation> {
    return this.#heldSavedStage(runner => heldRunnerMethods.first.call(runner));
  }
  public observeFreshFootprintCopyHeldSavedCache(): Promise<CurrentFootprintSavedCacheHeldObservation> {
    return this.#heldSavedStage(runner => heldRunnerMethods.fresh.call(runner));
  }
  public releaseFootprintCopyHeldSavedCache(): Promise<void> { return this.#heldSavedStage(runner => heldRunnerMethods.release.call(runner), true); }

  /** Consume one termination request for this exact original Job. A reply is
   * not exit proof; original termination observation and release remain separate. */
  public async abortFootprintCopyHeldSavedJob(confirmAbortOriginalJob: true): Promise<void> {
    this.requireOriginalFootprintGeneration();
    if (this.#purpose !== "worker-startup-footprint-held-saved209") { throw error("HELD_SAVED_ABORT_PURPOSE"); }
    await this.#abortHeldJob(confirmAbortOriginalJob);
  }

  /** Seal normal work synchronously before the lifecycle's first journal await.
   * The original token binds this owner and root; no native I/O or busy flag is
   * touched. A missing root still consumes cutoff without inventing authority. */
  public reserveFootprintHeldCacheValidationAbort(): object {
    assertOriginalCurrentFootprintHeldCacheValidationOwner(this);
    if (this.#purpose !== "footprint-held-cache209") { throw error("HELD_CACHE_ABORT_PURPOSE"); }
    this.#available();
    if (this.#heldSavedAbortAttempted || this.#terminationObserved || this.#releaseConsumed) { throw error("HELD_CACHE_ABORT_CONSUMED"); }
    this.#heldSavedAbortAttempted = true; this.#heldSavedFailed = true;
    const binding = this.#binding;
    if (binding === null) { throw error("HELD_CACHE_ABORT_ORIGINAL_BINDING_REQUIRED"); }
    const reservation = Object.freeze({});
    this.#heldCacheAbortReservation = reservation; this.#heldCacheAbortBinding = binding; return reservation;
  }

  /** Dispatch only the retained token after durable intent. Dispatch is consumed
   * before any await; acknowledgment proves neither root exit nor Job closure. */
  public async dispatchFootprintHeldCacheValidationAbort(reservation: object, confirmOriginalJob: true): Promise<void> {
    assertOriginalCurrentFootprintHeldCacheValidationOwner(this); this.#available();
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Runtime callers must confirm the exact original Job before a native dispatch is consumed.
    if (confirmOriginalJob !== true) { throw error("HELD_CACHE_ABORT_CONFIRMATION"); }
    const binding = this.#heldCacheAbortBinding;
    const current = (): void => {
      assertOriginalCurrentFootprintHeldCacheValidationOwner(this); this.#available();
      if (this.#purpose !== "footprint-held-cache209" || reservation !== this.#heldCacheAbortReservation ||
          binding === null || this.#binding !== binding || !this.#heldSavedAbortAttempted || !this.#heldSavedFailed ||
          this.#terminationObserved || this.#releaseConsumed) { throw error("HELD_CACHE_ABORT_ORIGINAL_RESERVATION"); }
    };
    current();
    if (this.#heldCacheAbortDispatchAttempted) { throw error("HELD_CACHE_ABORT_DISPATCH_CONSUMED"); }
    this.#heldCacheAbortDispatchAttempted = true;
    await this.#verify(); current();
    const result = await this.#request({ action: "held-saved-abort", confirmAbortOriginalJob: true }, current); current();
    if (!exact(result, ["abortRequested", "originalJobOnly"]) || result["abortRequested"] !== true || result["originalJobOnly"] !== true) { throw error("HELD_CACHE_ABORT_ACK"); }
  }

  /** Private convenience. Durable lifecycle callers reserve before awaiting
   * their journal, then pass that exact token to the separate dispatch method. */
  public async abortFootprintHeldCacheValidationJob(confirmAbortOriginalJob: true): Promise<void> {
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Reject malformed runtime confirmation before consuming a reservation.
    if (confirmAbortOriginalJob !== true) { throw error("HELD_CACHE_ABORT_CONFIRMATION"); }
    await this.dispatchFootprintHeldCacheValidationAbort(this.reserveFootprintHeldCacheValidationAbort(), true);
  }

  /** Consume cutoff before awaiting local checks. Only the retained helper's
   * exact Job may be addressed, and queued normal commands cannot run afterward. */
  async #abortHeldJob(confirmAbortOriginalJob: unknown): Promise<void> {
    this.#requireHeldRole(); this.#available();
    if (confirmAbortOriginalJob !== true || this.#heldSavedAbortAttempted || this.#terminationObserved || this.#releaseConsumed) { throw error("HELD_SAVED_ABORT_CONSUMED"); }
    this.#heldSavedAbortAttempted = true; this.#heldSavedFailed = true;
    const binding = this.#binding;
    if (binding === null) { throw error("HELD_SAVED_ABORT_ORIGINAL_BINDING_REQUIRED"); }
    const current = (): void => {
      this.#requireHeldRole(); this.#available();
      if (this.#binding !== binding || this.#releaseConsumed) { throw error("HELD_SAVED_ABORT_OWNER_CHANGED"); }
    };
    await this.#verify(); current();
    const result = await this.#request({ action: "held-saved-abort", confirmAbortOriginalJob: true }, current); current();
    if (!exact(result, ["abortRequested", "originalJobOnly"]) || result["abortRequested"] !== true || result["originalJobOnly"] !== true) { throw error("HELD_SAVED_ABORT_ACK"); }
  }

  /** Guarded original open. The adapter's private guard performs the later
   * freshness read, acknowledged group release and descriptor-bound byte check
   * at the maintained opener's sole before-dispatch hook. */
  public async openFootprintCopyHeldSavedProject(projection: CurrentFootprintCopyV2SavedProjection,
    guard: CurrentFootprintCopyHeldSavedOpenGuard): Promise<Readonly<{ state: CurrentFootprintCopyStatePacket; transport: CurrentFootprintCopySourceReadTransport }>> {
    this.requireOriginalFootprintGeneration();
    const origin = this.originalFootprintSourceBinding();
    const handoff = this.#startupHandoff;
    const target = currentFootprintCopyV2SavedTarget(projection);
    if (this.#purpose !== "worker-startup-footprint-held-saved209" || handoff === null || !this.#heldSavedStarted || this.#heldSavedOpenAttempted ||
        this.#heldSavedFailed || this.#closeConsumed || this.retainedFootprintCopyHeldSavedCache().retained()["phase"] !== "first-observed" ||
        target.projectUuid !== origin.target.projectUuid || target.branchUuid !== origin.target.branchUuid ||
        projection.afterSqlSha256 !== origin.before.logicalSha256) { throw error("HELD_SAVED_OPEN_CONSUMED"); }
    this.#heldSavedOpenAttempted = true;
    try {
    const opening = new CurrentFootprintCopyHeldSavedStartupOpening(handoff); this.#heldSavedOpening = opening;
    await this.#heldSavedNativeReprove();
    const result = await opening.open(origin.target, (): Promise<void> => Promise.resolve(),
      (): Promise<void> => revalidateCurrentFootprintCopyHeldSavedOpenGuard(this, guard));
    const assignments = await opening.proveCurrentAssignments(result), state = await opening.observeFootprintState(result, assignments);
    const original = await opening.createFootprintSavedReadTransport(result, assignments, state, projection);
    await this.#heldSavedNativeReprove();
    // Capture actual methods. Source callbacks have fixed two/four call limits
    // And their own native pre/post samples; local assertions retain custody.
    if (types.isProxy(original) || !Object.isFrozen(original) || Reflect.ownKeys(original).length !== 3 ||
        ["assertOriginalState", "observeState", "readSource"].some(name => {
          const field = Object.getOwnPropertyDescriptor(original, name); return field === undefined || !Object.hasOwn(field, "value") || typeof field.value !== "function";
        })) { throw error("HELD_SAVED_SOURCE_TRANSPORT"); }
    const assert = original.assertOriginalState, observe = original.observeState, read = original.readSource;
    const current = (): void => {
      this.requireOriginalFootprintGeneration(); this.#available();
      if (this.#heldSavedFailed || this.#closeConsumed || this.#heldSavedAbortAttempted || this.#terminationObserved || this.#releaseConsumed ||
          this.#heldSavedOpening !== opening || original.assertOriginalState !== assert || original.observeState !== observe || original.readSource !== read) { throw error("HELD_SAVED_SOURCE_ENDED"); }
    };
    current();
    const transport = Object.freeze<CurrentFootprintCopySourceReadTransport>({
      assertOriginalState: async packet => {
        current();
        try { await assert.call(original, packet); current(); } catch (caughtError) { this.#heldSavedFailed = true; throw caughtError; }
      },
      observeState: async () => {
        current();
        if (this.#heldSavedStateReads >= 4 || this.#heldSavedOpening !== opening || this.#heldSavedFailed) { throw error("HELD_SAVED_STATE_CONSUMED"); }
        this.#heldSavedStateReads += 1;
        try {
          await this.#heldSavedNativeReprove(current); current();
          const packet = await observe.call(original); current(); await this.#heldSavedNativeReprove(current); current(); return packet;
        } catch (caughtError) { this.#heldSavedFailed = true; throw caughtError; }
      },
      readSource: async request => {
        current();
        if (this.#heldSavedSourceReads >= 2 || this.#heldSavedOpening !== opening || this.#heldSavedFailed) { throw error("HELD_SAVED_SOURCE_CONSUMED"); }
        this.#heldSavedSourceReads += 1;
        try {
          await this.#heldSavedNativeReprove(current); current();
          const packet = await read.call(original, request); current(); await this.#heldSavedNativeReprove(current); current(); return packet;
        } catch (caughtError) { this.#heldSavedFailed = true; throw caughtError; }
      },
    });
    return Object.freeze({ state, transport });
    } catch (caughtError) { this.#heldSavedFailed = true; throw caughtError; }
  }

  public async observeFootprintCopyUploadQueue(): Promise<unknown> {
    this.requireOriginalFootprintGeneration(); const origin = this.originalFootprintSourceBinding();
    const context = this.#stagedContext, handoff = this.#startupHandoff;
    if (this.#forwardRole === "forward-saved-readback" && this.#footprintSavedQueues > 0) { throw error("FORWARD_SAVED_QUEUE_OBSERVATION_CONSUMED"); }
    if (this.#purpose !== "worker-startup-footprint-saved209" || handoff === null || context === null ||
      !(handoff.channel instanceof CurrentFootprintCopySavedChannel || handoff.channel instanceof CurrentFootprintCopyForwardSavedStartupChannel) || this.#footprintSavedQueues >= 2 || this.#closeConsumed) {
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
    this.requireOriginalFootprintGeneration();
    if (this.#forwardRole === "forward-saved-readback") { throw error("FORWARD_SAVED_OBSERVATION_OPEN_UNAVAILABLE"); }
    const origin = this.originalFootprintSourceBinding();
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
  /** Historical numeric closure only. These methods keep the original issuer
   * private; caller JSON or a foreign generation cannot become its window. */
  public closedFootprintCopyWindowsClockWindow(): CurrentFootprintCopyWindowsClockWindow {
    if (this.#footprintWindowsClock === null) { throw error("FOOTPRINT_WINDOWS_CLOCK_ORIGINAL"); }
    return this.#footprintWindowsClock.closedWindow();
  }
  /** Require the original issuer's exact retained closed window, refusing copied or
   * foreign values. This historical identity check issues no native request and
   * establishes no document-clock provenance or execution permission.
   */
  public requireClosedFootprintCopyWindowsClockWindow(window: CurrentFootprintCopyWindowsClockWindow): CurrentFootprintCopyWindowsClockWindow {
    if (this.#footprintWindowsClock === null) { throw error("FOOTPRINT_WINDOWS_CLOCK_ORIGINAL"); }
    return this.#footprintWindowsClock.requireClosedWindow(window);
  }
  /** Check both supplied result/offset pairs against the original issuer's retained
   * closed interval. The values remain caller-supplied numerical evidence; a match
   * cannot prove the original Date/RPC calls or admit a writer.
   */
  public boundFootprintCopyDocumentClockValues(window: CurrentFootprintCopyWindowsClockWindow,
    values: readonly [readonly [number, number], readonly [number, number]]): CurrentFootprintCopyDocumentClockWindow {
    if (this.#footprintWindowsClock === null) { throw error("FOOTPRINT_WINDOWS_CLOCK_ORIGINAL"); }
    return this.#footprintWindowsClock.boundDocumentValues(window, values);
  }
  public retainedFootprintCopyWindowsClock(): Readonly<Record<string, unknown>> | null { return this.#footprintWindowsClock?.evidence() ?? null; }

  #requireFootprintMain(attached: boolean): Binding {
    this.#available();
    if ((this.#purpose !== "worker-startup-footprint-main209" && this.#purpose !== "footprint-head-age209" && !selectedFileMainPurpose(this.#purpose) && !bornFootprintTransport(this.#purpose)) || this.#binding === null || !this.#launchSucceeded ||
      this.#terminationObserved || this.#releaseConsumed || this.#closeConsumed && !this.#mainCloseCleanupActive && !selectedFileMainPurpose(this.#purpose) ||
      this.#mainCloseDetached || this.#mainTerminateAttempted || this.#headAgeAbortAttempted || attached && !this.#mainAttached) {
      throw error("MAIN_ORIGINAL_OWNER");
    }
    return this.#binding;
  }
  #enterFootprintMain(): void {
    if (!bornFootprintTransport(this.#purpose) && !selectedFileMainPurpose(this.#purpose) && !this.#mainCloseCleanupActive) { this.#enter(true); return; }
    this.#available();
    if (this.#binding === null || this.#combinedMainBusy) { throw error("COMBINED_MAIN_BUSY_OR_UNLAUNCHED"); }
    // A renderer observation can await the same original main request. The
    // Sole main runner owns its own lease; both protocols serialize only the
    // Native exchange through #nativeTail, never an entire inspector wait.
    this.#combinedMainBusy = true;
  }
  #leaveFootprintMain(): void {
    if (bornFootprintTransport(this.#purpose) || selectedFileMainPurpose(this.#purpose) || this.#mainCloseCleanupActive) { this.#combinedMainBusy = false; }
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
  public async sendFootprintMain(command: CurrentFootprintCopyMainBackendCommand | CurrentFootprintCopyMainRequestCollectCommand | CurrentProjectStructureMainCommand, requestId: number): Promise<void> {
    const original = this.#requireFootprintMain(true);
    if (selectedFileMainPurpose(this.#purpose) && (this.#mainRunner === null || this.#mainRunner.retained().completed || this.#mainRunner.retained().failed)) { throw error("SELECTED_MAIN_CONSTRUCTION_SENDER_CLOSED"); }
    if (this.#mainCloseCleanupActive && command.phase !== "release") { throw error("MAIN_CLOSE_CLEANUP_ONLY"); }
    if (this.#mainCompletionState !== "unused" && !(this.#mainCompletionState === "retired" && command.phase === "release")) {
      throw error("MAIN_COMPLETION_OLD_ROLE_CONSUMED");
    }
    if (this.#mainCompletionState === "retired" && this.#mainCompletionTailReleaseAttempted) { throw error("MAIN_COMPLETION_TAIL_RELEASE_CONSUMED"); }
    if (requestId !== this.#mainRequestId + 1) { throw error("MAIN_REQUEST_ID"); }
    const collection = command.phase.startsWith("request-");
    if (this.#purpose === "footprint-head-age209" && !["runtime-enable", "debugger-enable", "run-waiting", "resume", "registration-arm", "source", "breakpoint", "frame", "capture", "require", "properties", "remove", "release", "head-age-context-capture", "head-age-context-source", "head-age-context-bind", "head-age-capture", "head-age-observe"].includes(command.phase)) { throw error("HEAD_AGE_MAIN_PHASE_PURPOSE"); }
    if (collection && this.#purpose !== CURRENT_FOOTPRINT_COMBINED_PURPOSE) { throw error("MAIN_REQUEST_PURPOSE"); }
    const headAge = command.phase.startsWith("head-age-");
    if (headAge && this.#purpose !== "footprint-head-age209" && this.#purpose !== CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE) { throw error("HEAD_AGE_MAIN_PURPOSE"); }
    let wire: Readonly<{ request: Readonly<Record<string, string | number>> }>;
    if (headAge) { wire = { request: currentFootprintHeadAgeNativeWire(command, requestId) }; }
    else { wire = collection ? currentFootprintCopyMainRequestWire(command, requestId) : currentFootprintCopyMainBackendWire(command, requestId); }
    const cleanup = command.method === "Debugger.removeBreakpoint" || command.method === "Debugger.resume" || command.method === "Runtime.releaseObjectGroup";
    let maximumNormal: number = CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT.normalRequests;
    let maximumCleanup: number = CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT.cleanupRequests;
    if (selectedFileMainPurpose(this.#purpose)) {
      const limits = selectedFileMainLimits(this.#purpose); maximumNormal = limits.normal; maximumCleanup = limits.cleanup;
    } else if (this.#purpose === "footprint-head-age209") {
      maximumNormal = CURRENT_FOOTPRINT_HEAD_AGE_NATIVE_LIMITS.normalMainRequests;
      maximumCleanup = CURRENT_FOOTPRINT_HEAD_AGE_NATIVE_LIMITS.cleanupMainRequests;
    } else if (this.#purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE) {
      maximumNormal = CURRENT_FOOTPRINT_COMBINED_PROFILE.main.normalRequestLimit;
      maximumCleanup = CURRENT_FOOTPRINT_COMBINED_PROFILE.main.cleanupRequestLimit;
    } else if (this.#purpose === CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE) {
      maximumNormal = CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE.main.normal;
      maximumCleanup = CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE.main.cleanup;
    } else if (this.#purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE) {
      maximumNormal = CURRENT_FOOTPRINT_FORWARD_NATIVE_MAIN_LIMITS.normalRequestLimit;
      maximumCleanup = CURRENT_FOOTPRINT_FORWARD_NATIVE_MAIN_LIMITS.cleanupRequestLimit;
    } else if (this.#purpose === CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE) {
      maximumNormal = CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE.main.normalRequestLimit;
      maximumCleanup = CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE.main.cleanupRequestLimit;
    }
    if (cleanup ? this.#mainCleanupRequests >= maximumCleanup : this.#mainNormalRequests >= maximumNormal) { throw error("MAIN_REQUEST_BUDGET"); }
    this.#enterFootprintMain(); this.#mainRequestId += 1;
    if (this.#mainCompletionState === "retired") { this.#mainCompletionTailReleaseAttempted = true; }
    if (cleanup) { this.#mainCleanupRequests += 1; } else { this.#mainNormalRequests += 1; }
    try {
      await this.#verify();
      if (this.#requireFootprintMain(true) !== original) { throw error("MAIN_OWNER_CHANGED"); }
      const reply = await this.#request({ ...wire.request });
      if (command.phase === "head-age-observe") {
        const encoded = reply["bytes"];
        if (!exact(reply, ["written", "bytes", "before", "after"]) || reply["written"] !== true || typeof encoded !== "string" || encoded.length > 87_384 ||
          !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(encoded) || this.#headAgeBracket !== null || this.#headAgeInspectorBytes.length > 0) { throw error("HEAD_AGE_MAIN_NATIVE_REPLY"); }
        const bytes = Buffer.from(encoded, "base64");
        if (bytes.length === 0 || bytes.length > 65_536 || bytes.toString("base64") !== encoded) { throw error("HEAD_AGE_MAIN_NATIVE_BYTES"); }
        const before = captureCurrentPcbStringClockReply(reply["before"]).value; const after = captureCurrentPcbStringClockReply(reply["after"]).value;
        this.#headAgeBracket = Object.freeze({ before, after }); this.#headAgeInspectorBytes = bytes;
      } else if (!exact(reply, ["written"]) || reply["written"] !== true) { throw error("MAIN_WRITE_REPLY"); }
      await this.#verify();
      if (this.#requireFootprintMain(true) !== original) { throw error("MAIN_OWNER_CHANGED"); }
    } finally { this.#leaveFootprintMain(); }
  }
  /** Check the original counters before the held collector can transfer its
   * lease. The current observation profile deliberately cannot fit this unit. */
  /** Only the original Via/bootstrap pair reaches this finite SQL fence codec.
   * A descriptive packet or another main receiver cannot send or resume it. */
  public async sendSelectedFileMainSqlFence(capability: CurrentSelectedFileMainSqlFenceBootstrap, runner: CurrentFootprintCopyMainBackendRunner,
    command: CurrentSelectedFileMainSqlFenceCommand, requestId: number): Promise<void> {
    const held = selectedSqlFenceBootstraps.get(capability); const original = this.#requireFootprintMain(true);
    if (!selectedFileMainPurpose(this.#purpose) || held?.owner !== this || held.runner() !== runner || this.#mainRunner !== runner ||
      requestId !== this.#mainRequestId + 1 || this.#mainNormalRequests >= selectedFileMainLimits(this.#purpose).normal) { throw error("SELECTED_SQL_ORIGINAL_MAIN"); }
    held.reprove(); const wire = currentSelectedFileMainSqlFenceWire(command, requestId);
    this.#enterFootprintMain(); this.#mainRequestId += 1; this.#mainNormalRequests += 1;
    try {
      await this.#verify(); held.reprove(); if (this.#requireFootprintMain(true) !== original) { throw error("SELECTED_SQL_OWNER_CHANGED"); }
      const reply = await this.#request({ ...wire.request });
      held.reprove(); if (!exact(reply, ["written"]) || reply["written"] !== true || this.#requireFootprintMain(true) !== original) { throw error("SELECTED_SQL_WRITE_REPLY"); }
      await this.#verify(); held.reprove();
    } finally { this.#leaveFootprintMain(); }
  }
  public async sendViaMainRequestStep(capability: CurrentSelectedFileMainSqlFenceBootstrap, runner: CurrentFootprintCopyMainBackendRunner,
    command: CurrentPcbViaMainStepCommand, requestId: number): Promise<void> {
    const held = selectedSqlFenceBootstraps.get(capability), original = this.#requireFootprintMain(true);
    if (this.#purpose !== CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE || held?.owner !== this || held.runner() !== runner || this.#mainRunner !== runner ||
      this.#viaMainBoundBody === null || this.#viaMainOrigin === null || !this.#viaSdkPhases.has("save") || !this.#viaMainSetupReady ||
      requestId !== this.#mainRequestId + 1 || this.#mainNormalRequests >= CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE.main.normal) { throw error("PCB_VIA_MAIN_DRIVER_GRANT_REQUIRED"); }
    let grant: Readonly<{ origin: CurrentPcbViaMainOrigin; dataStr: string }>;
    if (command.phase === "via-main-driver-step") { grant = runner.consumeOriginalViaMainDriverStep(command, requestId); }
    else if (command.phase === "via-main-context-step") { grant = runner.consumeOriginalViaMainContextStep(command, requestId); }
    else { grant = runner.consumeOriginalViaMainControllerStep(command, requestId); }
    if (grant.origin !== this.#viaMainOrigin || grant.dataStr !== this.#viaMainBoundBody.dataStr) { throw error("PCB_VIA_MAIN_DRIVER_BODY_CHANGED"); }
    held.reprove(); const wire = currentPcbViaMainStepWire(command, requestId); this.#enterFootprintMain(); this.#mainRequestId += 1; this.#mainNormalRequests += 1;
    try { await this.#verify(); held.reprove(); const reply = await this.#request({ ...wire });
      if (!exact(reply, ["written"]) || reply["written"] !== true || this.#requireFootprintMain(true) !== original) { throw error("PCB_VIA_MAIN_DRIVER_WRITE_REPLY"); }
      await this.#verify(); held.reprove();
    } finally { this.#leaveFootprintMain(); }
  }
  public async sendViaMainStructure(capability: CurrentSelectedFileMainSqlFenceBootstrap, runner: CurrentFootprintCopyMainBackendRunner,
    command: CurrentPcbViaMainStructureCommand, requestId: number): Promise<CurrentPcbViaMainStructureNativeWindow | null> {
    const held = selectedSqlFenceBootstraps.get(capability), original = this.#requireFootprintMain(true); const cleanup = command.phase === "via-main-structure-remove" || command.phase === "via-main-structure-release";
    if (this.#purpose !== CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE || held?.owner !== this || held.runner() !== runner || this.#mainRunner !== runner || this.#viaMainOrigin === null ||
      requestId !== this.#mainRequestId + 1 || (cleanup ? this.#mainCleanupRequests >= CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE.main.cleanup : this.#mainNormalRequests >= CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE.main.normal)) { throw error("PCB_VIA_STRUCTURE_ORIGINAL_SENDER"); }
    const beforeSaveArm = command.phase === "via-main-structure-arm" && command.role !== "context" && command.role !== "finalReturned" && command.role !== "finalFailed";
    if (beforeSaveArm) { if (this.#viaSdkPhases.has("save")) { throw error("PCB_VIA_STRUCTURE_PRE_ACTION_ARM"); } }
    else {
      const source = this.#viaStructureOrigin, transport = this.#viaTransportOrigin; const grant = source === null ? undefined : projectSaveStructureBodyGrants.get(source);
      if (grant === undefined || transport === null || grant.transportOrigin !== transport || !this.#viaSdkPhases.has("save") || !this.#viaMainSetupReady || this.#viaMainBoundBody === null) { throw error("PCB_VIA_STRUCTURE_ORIGINAL_BODY_RESERVATION"); }
      grant.assertCurrent(); const expected = { projectUuid: grant.value.projectUuid, branchUuid: grant.value.branchUuid, ticket: grant.value.saveHeadTicket, structureText: grant.value.expectedStructureText };
      if (canonicalJson(expected) !== canonicalJson(runner.requireViaExpectedStructure(this.#viaMainOrigin))) { throw error("PCB_VIA_STRUCTURE_ORIGINAL_EXPECTED_SCOPE"); }
      if (command.phase === "via-main-structure-step") { const actual = runner.consumeOriginalViaMainStructure(command, requestId); if (actual.origin !== this.#viaMainOrigin || canonicalJson(actual.expected) !== canonicalJson(expected) || actual.role !== command.role) { throw error("PCB_VIA_STRUCTURE_ORIGINAL_PENDING_GRANT"); } }
    }
    held.reprove(); const wire = currentPcbViaMainStructureWire(command, requestId); this.#enterFootprintMain(); this.#mainRequestId += 1; if (cleanup) { this.#mainCleanupRequests += 1; } else { this.#mainNormalRequests += 1; }
    try { await this.#verify(); held.reprove(); const reply = await this.#request({ ...wire.request }); const window = decodeCurrentPcbViaMainStructureNativeAck(reply, command); if (this.#requireFootprintMain(true) !== original) { throw error("PCB_VIA_STRUCTURE_WRITE_OWNER"); } await this.#verify(); held.reprove(); return window; }
    finally { this.#leaveFootprintMain(); }
  }
  public async sendViaMainHistory(capability: CurrentSelectedFileMainSqlFenceBootstrap, runner: CurrentFootprintCopyMainBackendRunner,
    command: CurrentPcbViaMainHistoryCommand, requestId: number): Promise<CurrentPcbViaMainHistoryNativeWindow | null> {
    const held = selectedSqlFenceBootstraps.get(capability), original = this.#requireFootprintMain(true); const cleanup = command.phase === "via-main-history-remove";
    if (this.#purpose !== CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE || held?.owner !== this || held.runner() !== runner || this.#mainRunner !== runner || this.#viaMainOrigin === null ||
      requestId !== this.#mainRequestId + 1 || (cleanup ? this.#mainCleanupRequests >= CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE.main.cleanup : this.#mainNormalRequests >= CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE.main.normal)) { throw error("PCB_VIA_HISTORY_ORIGINAL_SENDER"); }
    if (command.phase === "via-main-history-arm") { if (this.#viaSdkPhases.has("save")) { throw error("PCB_VIA_HISTORY_PRE_SAVE_ARM"); } }
    else { if (this.#viaMainBoundBody === null || !this.#viaSdkPhases.has("save") || !this.#viaMainSetupReady) { throw error("PCB_VIA_HISTORY_SAVE_BODY_REQUIRED"); }
      if (command.phase === "via-main-history-step") { const grant = runner.consumeOriginalViaMainHistory(command, requestId); if (grant.origin !== this.#viaMainOrigin || grant.dataStr !== this.#viaMainBoundBody.dataStr || grant.role !== command.role) { throw error("PCB_VIA_HISTORY_ORIGINAL_BODY_GRANT"); } }
    }
    held.reprove(); const wire = currentPcbViaMainHistoryWire(command, requestId); this.#enterFootprintMain(); this.#mainRequestId += 1; if (cleanup) { this.#mainCleanupRequests += 1; } else { this.#mainNormalRequests += 1; }
    try { await this.#verify(); held.reprove(); const reply = await this.#request({ ...wire.request }); const window = decodeCurrentPcbViaMainHistoryNativeAck(reply, command);
      if (this.#requireFootprintMain(true) !== original) { throw error("PCB_VIA_HISTORY_WRITE_OWNER"); } await this.#verify(); held.reprove(); return window;
    } finally { this.#leaveFootprintMain(); }
  }
  public async sendViaMainBegin(capability: CurrentSelectedFileMainSqlFenceBootstrap, runner: CurrentFootprintCopyMainBackendRunner,
    command: CurrentPcbViaMainBeginCommand, requestId: number): Promise<void> {
    const held = selectedSqlFenceBootstraps.get(capability), original = this.#requireFootprintMain(true); const cleanup = command.phase === "via-main-begin-remove";
    if (this.#purpose !== CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE || held?.owner !== this || held.runner() !== runner || this.#mainRunner !== runner || this.#viaMainOrigin === null ||
      requestId !== this.#mainRequestId + 1 || (cleanup ? this.#mainCleanupRequests >= CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE.main.cleanup : this.#mainNormalRequests >= CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE.main.normal)) { throw error("PCB_VIA_BEGIN_ORIGINAL_SENDER"); }
    if (command.phase === "via-main-begin-arm") { if (this.#viaSdkPhases.has("save")) { throw error("PCB_VIA_BEGIN_PRE_SAVE_ARM"); } }
    else { if (this.#viaMainBoundBody === null || !this.#viaSdkPhases.has("save") || !this.#viaMainSetupReady) { throw error("PCB_VIA_BEGIN_SAVE_BODY_REQUIRED"); }
      if (command.phase === "via-main-begin-step") { const grant = runner.consumeOriginalViaMainBegin(command, requestId); if (grant.origin !== this.#viaMainOrigin || grant.dataStr !== this.#viaMainBoundBody.dataStr) { throw error("PCB_VIA_BEGIN_ORIGINAL_BODY_GRANT"); } }
    }
    held.reprove(); const wire = currentPcbViaMainBeginWire(command, requestId); this.#enterFootprintMain(); this.#mainRequestId += 1; if (cleanup) { this.#mainCleanupRequests += 1; } else { this.#mainNormalRequests += 1; }
    try { await this.#verify(); held.reprove(); const reply = await this.#request({ ...wire.request });
      if (!exact(reply, ["written"]) || reply["written"] !== true || this.#requireFootprintMain(true) !== original) { throw error("PCB_VIA_BEGIN_WRITE_REPLY"); } await this.#verify(); held.reprove();
    } finally { this.#leaveFootprintMain(); }
  }
  public async sendViaMainObservation(capability: CurrentSelectedFileMainSqlFenceBootstrap, runner: CurrentFootprintCopyMainBackendRunner,
    command: CurrentPcbViaMainCommand, requestId: number): Promise<void> {
    const held = selectedSqlFenceBootstraps.get(capability); const original = this.#requireFootprintMain(true);
    const cleanup = command.method === "Debugger.removeBreakpoint" || command.method === "Runtime.releaseObjectGroup";
    if (this.#purpose !== CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE || held?.owner !== this || held.runner() !== runner || this.#mainRunner !== runner ||
      requestId !== this.#mainRequestId + 1 || (cleanup ? this.#mainCleanupRequests >= CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE.main.cleanup : this.#mainNormalRequests >= CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE.main.normal)) { throw error("PCB_VIA_MAIN_ORIGINAL_SENDER"); }
    held.reprove(); const wire = currentPcbViaMainWire(command, requestId); this.#enterFootprintMain(); this.#mainRequestId += 1;
    if (cleanup) { this.#mainCleanupRequests += 1; } else { this.#mainNormalRequests += 1; }
    try { await this.#verify(); held.reprove(); const reply = await this.#request({ ...wire.request });
      if (!exact(reply, ["written"]) || reply["written"] !== true || this.#requireFootprintMain(true) !== original) { throw error("PCB_VIA_MAIN_WRITE_REPLY"); }
      await this.#verify(); held.reprove();
    } finally { this.#leaveFootprintMain(); }
  }

  public assertFootprintMainCompletionCapacity(firstRequestId: number): void {
    this.#requireFootprintMain(true);
    if (this.#purpose !== CURRENT_FOOTPRINT_COMBINED_PURPOSE || this.#mainCompletionState !== "unused" ||
      !Number.isSafeInteger(firstRequestId) || firstRequestId !== this.#mainRequestId + 1) { throw error("MAIN_COMPLETION_CAPACITY_OWNER"); }
    requireCurrentFootprintCopyMainCompletionHeadroom(this.#mainRequestId, this.#mainNormalRequests, this.#mainCleanupRequests);
  }
  public async beginFootprintMainCompletion(firstRequestId: number): Promise<void> {
    this.assertFootprintMainCompletionCapacity(firstRequestId);
    const original = this.#requireFootprintMain(true);
    this.#enterFootprintMain(); this.#mainCompletionState = "beginning"; this.#mainCompletionFirst = firstRequestId;
    try {
      await this.#verify();
      if (this.#requireFootprintMain(true) !== original) { throw error("MAIN_COMPLETION_OWNER_CHANGED"); }
      const reply = await this.#request({ action: "main-completion-begin", firstRequestId });
      if (!exact(reply, ["begun"]) || reply["begun"] !== true || this.#requireFootprintMain(true) !== original) { throw error("MAIN_COMPLETION_BEGIN_REPLY"); }
      await this.#verify();
      if (this.#requireFootprintMain(true) !== original) { throw error("MAIN_COMPLETION_OWNER_CHANGED"); }
      this.#mainCompletionState = "active";
    } catch (caughtError) { this.#mainCompletionState = "failed"; throw caughtError; }
    finally { this.#leaveFootprintMain(); }
  }
  public async sendFootprintMainCompletion(command: CurrentFootprintCopyMainCompletionCommand, requestId: number): Promise<void> {
    const original = this.#requireFootprintMain(true);
    if (this.#mainCompletionState !== "active" || requestId !== this.#mainRequestId + 1 ||
      requestId !== this.#mainCompletionFirst + this.#mainCompletionNormal + this.#mainCompletionCleanup) { throw error("MAIN_COMPLETION_SEQUENCE"); }
    const wire = currentFootprintCopyMainCompletionWire(command, requestId);
    const cleanup = command.method === "Debugger.removeBreakpoint" || command.method === "Debugger.resume" || command.method === "Runtime.releaseObjectGroup";
    const limits = CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS;
    if (cleanup ? this.#mainCompletionCleanup >= limits.cleanup : this.#mainCompletionNormal >= limits.normal) { throw error("MAIN_COMPLETION_BUDGET"); }
    this.#enterFootprintMain(); this.#mainRequestId += 1;
    if (cleanup) { this.#mainCompletionCleanup += 1; this.#mainCleanupRequests += 1; }
    else { this.#mainCompletionNormal += 1; this.#mainNormalRequests += 1; }
    try {
      await this.#verify();
      if (this.#requireFootprintMain(true) !== original) { throw error("MAIN_COMPLETION_OWNER_CHANGED"); }
      const reply = await this.#request({ ...wire.request });
      if (!exact(reply, ["written"]) || reply["written"] !== true || this.#requireFootprintMain(true) !== original) { throw error("MAIN_COMPLETION_WRITE_REPLY"); }
      await this.#verify();
      if (this.#requireFootprintMain(true) !== original) { throw error("MAIN_COMPLETION_OWNER_CHANGED"); }
    } catch (caughtError) { this.#mainCompletionState = "failed"; throw caughtError; }
    finally { this.#leaveFootprintMain(); }
  }
  public async retireFootprintMainCompletion(): Promise<void> {
    const ended = this.#terminationObserved && this.#terminationObservation?.originalRootExited === true && this.#terminationObservation.originalJobEmpty === true;
    if (this.#purpose !== CURRENT_FOOTPRINT_COMBINED_PURPOSE || this.#mainCompletionState === "unused" && !ended ||
      this.#mainCompletionState === "retired" || this.#mainCompletionRetireAttempted) { throw error("MAIN_COMPLETION_RETIRE_OWNER"); }
    const limits = CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS;
    const complete = this.#mainCompletionState === "active" && this.#mainCompletionNormal === limits.normal && this.#mainCompletionCleanup === limits.cleanup &&
      this.#mainRequestId + 1 === this.#mainCompletionFirst + limits.total;
    if (!complete && !ended) { this.#mainCompletionState = "failed"; throw error("MAIN_COMPLETION_RETIRE_NEEDS_EXIT"); }
    this.#available(); this.#enterFootprintMain(); this.#mainCompletionRetireAttempted = true;
    try {
      const reply = await this.#request({ action: "main-completion-retire" });
      if (!exact(reply, ["retired"]) || reply["retired"] !== true) { throw error("MAIN_COMPLETION_RETIRE_REPLY"); }
      this.#mainCompletionState = "retired";
    } catch (caughtError) { this.#mainCompletionState = "failed"; throw caughtError; }
    finally { this.#leaveFootprintMain(); }
  }
  public failFootprintMainCompletion(): void {
    if (this.#mainCompletionState !== "unused" && this.#mainCompletionState !== "retired") { this.#mainCompletionState = "failed"; }
  }
  /** Resolve the actual published v2 source/main pair. Cleanup retains original
   * references; only the original root/whole-Job observation proves exit. */
  public requireOriginalForwardExecutionMainRunner(runner: CurrentFootprintCopyMainBackendRunner, mode: CurrentFootprintForwardExecutionMainMode): boolean {
    assertOriginalCurrentFootprintForwardExecutionNativeOwner(this);
    const source = this.originalFootprintForwardExecutionSource();
    if (footprintForwardExecutionFactories.get(this) !== this.#installation || this.#mainRunner !== runner || source.main !== runner ||
      source.binding !== this.#binding || this.#binding === null || !this.#launchSucceeded) { throw error("FORWARD_EXECUTION_MAIN_ORIGINAL"); }
    if (mode === "normal") { this.#requireFootprintMain(true); }
    else if (mode === "cleanup") {
      if (!retainedOwners.has(this) || this.#releaseConsumed || this.#released || this.#childClosed) { throw error("FORWARD_EXECUTION_MAIN_CLEANUP_ENDED"); }
    } else if (mode !== "exited") { throw error("FORWARD_EXECUTION_MAIN_MODE"); }
    return this.#terminationObserved && this.#terminationObservation?.terminated === true && this.#terminationObservation.originalRootExited === true && this.#terminationObservation.originalJobEmpty === true;
  }
  #requireForwardExecutionMain(capability: CurrentFootprintForwardExecutionMainCapability, runner: CurrentFootprintCopyMainBackendRunner,
    mode: CurrentFootprintForwardExecutionMainMode): void {
    if (requireCurrentFootprintForwardExecutionMainNativeOwner(capability, runner, mode) !== this) { throw error("FORWARD_EXECUTION_MAIN_CAPABILITY"); }
  }
  /** Retain the bounded original control reply before the post-await capability
   * check. This does not settle CDP allocation replies hidden inside main polls. */
  async #forwardExecutionMainRequest(capability: CurrentFootprintForwardExecutionMainCapability, runner: CurrentFootprintCopyMainBackendRunner,
    request: RecordValue, mode: CurrentFootprintForwardExecutionMainMode): Promise<RecordValue> {
    const same = (): void => { this.#requireForwardExecutionMain(capability, runner, mode); };
    same(); const captured = captureCurrentPcbStringClockReply(await this.#request(request, same, { capability, runner, mode })).value;
    if (this.#forwardExecutionMainReplies.length >= CURRENT_FOOTPRINT_FORWARD_NATIVE_MAIN_LIMITS.requestLimit + 2 || !record(captured)) { throw error("FORWARD_EXECUTION_MAIN_REPLY_BOUND"); }
    this.#forwardExecutionMainReplies.push(captured); same(); return captured;
  }
  /** Fixed collector command over the same physical main cursor. The new
   * native profile checks its direct birth and remaining units independently. */
  public async sendForwardExecutionMainCommand(capability: CurrentFootprintForwardExecutionMainCapability, runner: CurrentFootprintCopyMainBackendRunner,
    command: CurrentFootprintCopyMainRequestCollectCommand, requestId: number): Promise<void> {
    const cleanup = command.phase === "request-remove" || command.phase === "request-resume" || command.phase === "request-release";
    const mode = cleanup ? "cleanup" : "normal";
    this.#requireForwardExecutionMain(capability, runner, mode); const original = this.#binding;
    if (this.#mainCompletionState !== "unused" || this.#mainCloseCleanupActive || requestId !== this.#mainRequestId + 1) { throw error("FORWARD_EXECUTION_MAIN_REQUEST_SEQUENCE"); }
    const limits = CURRENT_FOOTPRINT_FORWARD_NATIVE_MAIN_LIMITS, wire = currentFootprintCopyMainRequestWire(command, requestId);
    if (cleanup ? this.#mainCleanupRequests >= limits.cleanupRequestLimit : this.#mainNormalRequests >= limits.normalRequestLimit) { throw error("FORWARD_EXECUTION_MAIN_REQUEST_BUDGET"); }
    this.#enterFootprintMain(); this.#mainRequestId += 1;
    if (cleanup) { this.#mainCleanupRequests += 1; } else { this.#mainNormalRequests += 1; }
    try {
      await this.#verify(); this.#requireForwardExecutionMain(capability, runner, mode); if (this.#binding !== original) { throw error("FORWARD_EXECUTION_MAIN_CHANGED"); }
      const reply = await this.#forwardExecutionMainRequest(capability, runner, { ...wire.request }, mode);
      if (!exact(reply, ["written"]) || reply["written"] !== true) { throw error("FORWARD_EXECUTION_MAIN_WRITE_REPLY"); }
      await this.#verify(); this.#requireForwardExecutionMain(capability, runner, mode); if (this.#binding !== original) { throw error("FORWARD_EXECUTION_MAIN_CHANGED"); }
    } finally { this.#leaveFootprintMain(); }
  }
  /** Check original source/counters before held-PB transfer. Reserve the
   * construction group release in addition to every completion unit. */
  public assertForwardExecutionMainCompletionCapacity(capability: CurrentFootprintForwardExecutionMainCapability, runner: CurrentFootprintCopyMainBackendRunner, firstRequestId: number): void {
    this.#requireForwardExecutionMain(capability, runner, "normal"); const limits = CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS, maximum = CURRENT_FOOTPRINT_FORWARD_NATIVE_MAIN_LIMITS;
    if (this.#mainCompletionState !== "unused" || !Number.isSafeInteger(firstRequestId) || firstRequestId !== this.#mainRequestId + 1 ||
      this.#mainNormalRequests + limits.normal > maximum.normalRequestLimit || this.#mainCleanupRequests + limits.cleanup + 1 > maximum.cleanupRequestLimit ||
      firstRequestId + limits.total > maximum.requestLimit) { throw error("FORWARD_EXECUTION_MAIN_COMPLETION_CAPACITY"); }
  }
  /** Consume completion begin only after the native-capacity gate accepts the
   * original main cursor. A failed begin keeps the phase failed. */
  public async beginForwardExecutionMainCompletion(capability: CurrentFootprintForwardExecutionMainCapability, runner: CurrentFootprintCopyMainBackendRunner, firstRequestId: number): Promise<void> {
    this.assertForwardExecutionMainCompletionCapacity(capability, runner, firstRequestId);
    this.#enterFootprintMain(); this.#mainCompletionState = "beginning"; this.#mainCompletionFirst = firstRequestId;
    try {
      await this.#verify(); this.#requireForwardExecutionMain(capability, runner, "normal");
      const reply = await this.#forwardExecutionMainRequest(capability, runner, { action: "main-completion-begin", firstRequestId }, "normal");
      if (!exact(reply, ["begun"]) || reply["begun"] !== true) { throw error("FORWARD_EXECUTION_MAIN_COMPLETION_BEGIN_REPLY"); }
      await this.#verify(); this.#requireForwardExecutionMain(capability, runner, "normal"); this.#mainCompletionState = "active";
    } catch (caughtError) { this.#mainCompletionState = "failed"; throw caughtError; } finally { this.#leaveFootprintMain(); }
  }
  /** Charge one fixed completion command against the same original main
   * counter and retain its control acknowledgement before fresh checks. */
  public async sendForwardExecutionMainCompletion(capability: CurrentFootprintForwardExecutionMainCapability, runner: CurrentFootprintCopyMainBackendRunner,
    command: CurrentFootprintCopyMainCompletionCommand, requestId: number): Promise<void> {
    const cleanup = command.method === "Debugger.removeBreakpoint" || command.method === "Debugger.resume" || command.method === "Runtime.releaseObjectGroup";
    const mode = cleanup ? "cleanup" : "normal";
    this.#requireForwardExecutionMain(capability, runner, mode);
    if (this.#mainCompletionState !== "active" || requestId !== this.#mainRequestId + 1 || requestId !== this.#mainCompletionFirst + this.#mainCompletionNormal + this.#mainCompletionCleanup) { throw error("FORWARD_EXECUTION_MAIN_COMPLETION_SEQUENCE"); }
    const limits = CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS, wire = currentFootprintCopyMainCompletionWire(command, requestId);
    if (cleanup ? this.#mainCompletionCleanup >= limits.cleanup : this.#mainCompletionNormal >= limits.normal) { throw error("FORWARD_EXECUTION_MAIN_COMPLETION_BUDGET"); }
    this.#enterFootprintMain(); this.#mainRequestId += 1;
    if (cleanup) { this.#mainCompletionCleanup += 1; this.#mainCleanupRequests += 1; } else { this.#mainCompletionNormal += 1; this.#mainNormalRequests += 1; }
    try {
      await this.#verify(); this.#requireForwardExecutionMain(capability, runner, mode);
      const reply = await this.#forwardExecutionMainRequest(capability, runner, { ...wire.request }, mode);
      if (!exact(reply, ["written"]) || reply["written"] !== true) { throw error("FORWARD_EXECUTION_MAIN_COMPLETION_WRITE_REPLY"); }
      await this.#verify(); this.#requireForwardExecutionMain(capability, runner, mode);
    } catch (caughtError) { this.#mainCompletionState = "failed"; throw caughtError; } finally { this.#leaveFootprintMain(); }
  }
  /** Retire once after every completion unit settles or the original root and
   * whole Job exit. Refused or lost retirement acknowledgements stay failed. */
  public async retireForwardExecutionMainCompletion(capability: CurrentFootprintForwardExecutionMainCapability, runner: CurrentFootprintCopyMainBackendRunner): Promise<void> {
    this.#requireForwardExecutionMain(capability, runner, "cleanup"); const ended = this.requireOriginalForwardExecutionMainRunner(runner, "exited"), limits = CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS;
    if (this.#mainCompletionState === "retired" || this.#mainCompletionRetireAttempted || this.#mainCompletionState === "unused" && !ended) { throw error("FORWARD_EXECUTION_MAIN_COMPLETION_RETIRE_OWNER"); }
    const complete = this.#mainCompletionState === "active" && this.#mainCompletionNormal === limits.normal && this.#mainCompletionCleanup === limits.cleanup && this.#mainRequestId + 1 === this.#mainCompletionFirst + limits.total;
    if (!complete && !ended) { this.#mainCompletionState = "failed"; throw error("FORWARD_EXECUTION_MAIN_COMPLETION_RETIRE_NEEDS_EXIT"); }
    this.#available(); this.#enterFootprintMain(); this.#mainCompletionRetireAttempted = true;
    try {
      const reply = await this.#forwardExecutionMainRequest(capability, runner, { action: "main-completion-retire" }, "cleanup");
      if (!exact(reply, ["retired"]) || reply["retired"] !== true) { throw error("FORWARD_EXECUTION_MAIN_COMPLETION_RETIRE_REPLY"); }
      this.#requireForwardExecutionMain(capability, runner, "cleanup"); this.#mainCompletionState = "retired";
    } catch (caughtError) { this.#mainCompletionState = "failed"; throw caughtError; } finally { this.#leaveFootprintMain(); }
  }
  public failForwardExecutionMainCompletion(capability: CurrentFootprintForwardExecutionMainCapability, runner: CurrentFootprintCopyMainBackendRunner): void {
    this.#requireForwardExecutionMain(capability, runner, "cleanup"); this.failFootprintMainCompletion();
  }
  /** Retain the original allocation bytes before accounting or postguards.
   * The registered parser receives one canonical chunk; a late reply restores
   * no normal authority and cannot authorize replacement polling. */
  public async pollForwardExecutionMain(capability: CurrentFootprintForwardExecutionMainCapability, runner: CurrentFootprintCopyMainBackendRunner,
    cleanup: boolean, retainChunk?: (chunk: string) => void): Promise<string> {
    if (typeof cleanup !== "boolean") { throw error("FORWARD_EXECUTION_MAIN_POLL_INPUT"); }
    const mode = cleanup ? "cleanup" : "normal";
    const same = (): void => { this.#requireForwardExecutionMain(capability, runner, mode); };
    same(); if (retainChunk !== undefined) { requireOriginalCurrentFootprintForwardMainPollRetainer(runner, retainChunk); }
    this.#enterFootprintMain();
    try {
      const context: ForwardExecutionMainRequest = retainChunk === undefined ? { capability, runner, mode } : { capability, runner, mode, retainChunk };
      const reply = await this.#request({ action: "main-poll", cleanup }, same, context);
      const bytes = CurrentPcbRetainedOwnerCore.#forwardExecutionMainPollBytes(reply); same(); await this.#verify(); same(); return bytes;
    } finally { this.#leaveFootprintMain(); }
  }
  static #forwardExecutionMainPollBytes(reply: RecordValue, native = false): string {
    const raw = reply["bytes"];
    if (!exact(reply, native ? ["bytes", "receivedBytes", "frames"] : ["bytes"]) || typeof raw !== "string" || raw.length > 43_692 ||
      !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(raw)) { throw error("FORWARD_EXECUTION_MAIN_POLL_CHUNK"); }
    const bytes = Buffer.from(raw, "base64");
    if (bytes.length > 32_768 || bytes.toString("base64") !== raw) { throw error("FORWARD_EXECUTION_MAIN_POLL_CHUNK"); } return raw;
  }
  /** Keep one exact pending poll through refusal, under the absolute native
   * envelope bound. Purpose byte accounting follows this original copy. */
  #retainForwardExecutionMainPollChunk(chunk: unknown): void {
    const held = this.#forwardExecutionMainPoll;
    if (held === null || held.complete) { return; }
    try {
      if (!Buffer.isBuffer(chunk) || chunk.length > MAX_LINE || held.buffer.length + chunk.length > MAX_LINE) { throw error("FORWARD_EXECUTION_MAIN_POLL_ENVELOPE"); }
      held.buffer = Buffer.concat([held.buffer, chunk]); const newline = held.buffer.indexOf(10); if (newline === -1) { return; }
      held.complete = true;
      if (newline !== held.buffer.length - 1) { throw error("FORWARD_EXECUTION_MAIN_POLL_FRAMING"); }
      const raw = decodeCurrentPcbDiagnosticJson(held.buffer.subarray(0, newline)); held.buffer = Buffer.alloc(0);
      // A fixed native refusal carries no CDP reply bytes. Keep its original
      // Label for normal settlement and leave this slot blocked.
      if (record(raw) && exact(raw, ["id", "ok", "error"]) && raw["id"] === held.id && raw["ok"] === false &&
        typeof raw["error"] === "string" && /^pcb-diagnostic-[a-z-]{1,80}$/u.test(raw["error"])) { return; }
      if (!record(raw) || !exact(raw, ["id", "ok", "result"]) || raw["id"] !== held.id || raw["ok"] !== true || !record(raw["result"])) { throw error("FORWARD_EXECUTION_MAIN_POLL_REPLY"); }
      const encoded = CurrentPcbRetainedOwnerCore.#forwardExecutionMainPollBytes(raw["result"], true);
      requireOriginalCurrentFootprintForwardMainPollRetainer(held.runner, held.retain);
      held.delivered = true; held.retain(encoded);
    } catch (caughtError) {
      held.complete = true; held.buffer = Buffer.alloc(0); held.failure ??= caughtError instanceof Error ? caughtError : error("FORWARD_EXECUTION_MAIN_POLL_RETAIN"); this.#forwardCleanupOnly = true;
    }
  }
  /** Returns only a bounded transport chunk. The private construction runner
   * owns message framing, outstanding replies and actual inspector events. */
  public async pollFootprintMain(cleanup: boolean): Promise<string> {
    if (typeof cleanup !== "boolean") { throw error("MAIN_POLL_INPUT"); }
    if (this.#mainCloseCleanupActive && !cleanup) { throw error("MAIN_CLOSE_CLEANUP_ONLY"); }
    const original = this.#requireFootprintMain(true); this.#enterFootprintMain();
    try {
      if (this.#purpose === "footprint-head-age209" && this.#headAgeInspectorBytes.length > 0) {
        const chunk = this.#headAgeInspectorBytes.subarray(0, 32_768); this.#headAgeInspectorBytes = this.#headAgeInspectorBytes.subarray(chunk.length);
        if (this.#requireFootprintMain(true) !== original) { throw error("HEAD_AGE_MAIN_OWNER_CHANGED"); } return chunk.toString("base64");
      }
      const reply = await this.#request({ action: "main-poll", cleanup });
      const encoded = reply["bytes"];
      if (!exact(reply, ["bytes"]) || typeof encoded !== "string" || encoded.length > 43_692 ||
        !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(encoded)) { throw error("MAIN_POLL_REPLY"); }
      const bytes = Buffer.from(encoded, "base64");
      if (bytes.length > 32_768 || bytes.toString("base64") !== encoded || this.#requireFootprintMain(true) !== original) { throw error("MAIN_POLL_REPLY"); }
      return encoded;
    } finally { this.#leaveFootprintMain(); }
  }
  /** Explicit cleanup of this original visual Job. Lost replies never permit another send. */
  public async terminateVisualJob(confirmAbortOriginalVisualJob: true): Promise<void> {
    this.#available();
    const original = this.#binding;
    if (this.#purpose !== "visual209" || original === null || original.rootCreated === "0" || this.#terminationObserved ||
      this.#releaseConsumed || this.#visualAbortAttempted) { throw error("VISUAL_ORIGINAL_CLEANUP_OWNER"); }
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Runtime callers must supply the exact explicit original-Job confirmation.
    if (confirmAbortOriginalVisualJob !== true) { throw error("VISUAL_ABORT_CONFIRMATION"); }
    this.#enter(true); this.#visualAbortAttempted = true;
    try {
      await this.#verify(); this.#available();
      if (this.#binding !== original) { throw error("VISUAL_ORIGINAL_CLEANUP_OWNER"); }
      const reply = await this.#request({ action: "terminate-visual", confirmAbortOriginalVisualJob: true });
      if (!exact(reply, ["terminationDispatched"]) || reply["terminationDispatched"] !== true) { throw error("VISUAL_ABORT_REPLY"); }
    } finally { this.#busy = false; }
  }

  /** Seal only this original generated Component owner before journal awaits. */
  public reserveComponentSpatialAbort(): CurrentPcbComponentAbortReservation {
    this.#available(); const original = this.#binding;
    if (this.#purpose !== "pcb-component-spatial209" || this.#componentPrepared === null || original === null ||
      original.rootCreated === "0" || this.#componentAbortReservation !== null || this.#terminationObserved || this.#releaseConsumed) { throw error("COMPONENT_ABORT_OWNER"); }
    assertOriginalGeneratedComponentFixtureOpenCheckpoint(this.#componentPrepared);
    const token: CurrentPcbComponentAbortReservation = Object.freeze({ profile: "private.current-pcb-component-abort-reservation.v1", executionAuthorized: false });
    this.#componentAbortBinding = original; this.#componentAbortReservation = token; return token;
  }
  /** Durable intent precedes this once-only original Job control. The normal
   * caller retains its Promise and busy slot; acknowledgment never proves exit. */
  public async dispatchComponentSpatialAbort(token: CurrentPcbComponentAbortReservation, confirmAbortOriginalComponentJob: true): Promise<void> {
    this.#available(); const original = this.#componentAbortBinding;
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Runtime confirmation must be exact before consuming the original native dispatch.
    if (confirmAbortOriginalComponentJob !== true) { throw error("COMPONENT_ABORT_CONFIRMATION"); }
    if (this.#purpose !== "pcb-component-spatial209" || token !== this.#componentAbortReservation || original === null ||
      this.#binding !== original || this.#componentAbortDispatchAttempted || this.#terminationObserved || this.#releaseConsumed) { throw error("COMPONENT_ABORT_RESERVATION"); }
    this.#componentAbortDispatchAttempted = true;
    this.#input.emit("error", error("COMPONENT_ORIGINAL_ABORT"));
    await this.#nativeTail; await this.#verify(); this.#available();
    if (this.#binding !== original || this.#terminationObserved || this.#releaseConsumed) { throw error("COMPONENT_ABORT_OWNER_CHANGED"); }
    const reply = await this.#request({ action: "component-abort", confirmAbortOriginalComponentJob: true });
    if (!exact(reply, ["terminationDispatched"]) || reply["terminationDispatched"] !== true) { throw error("COMPONENT_ABORT_REPLY"); }
    await this.#verify(); this.#available(); if (this.#binding !== original) { throw error("COMPONENT_ABORT_OWNER_CHANGED"); }
  }

  /** Explicit user-authorized cleanup for the original diagnostic Job, including
   * an initial main pause before any window exists. Acknowledgment is not exit. */
  public async abortPcbViaWrite(): Promise<void> {
    // oxlint-disable-next-line eslint/no-use-before-define -- The actual fixed facade exists before any original native abort can be invoked.
    if (!(this instanceof CurrentPcbViaWriteOwner)) { throw error("PCB_VIA_ABORT_PURPOSE"); }
    assertOriginalCurrentPcbViaWriteOwner(this); this.#available();
    if (this.#purpose !== CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE || this.#binding === null || this.#mainTerminateAttempted || this.#terminationObserved || this.#releaseConsumed) { throw error("PCB_VIA_ABORT_CONSUMED"); }
    // Claim the original Job-only control before awaits. The pending normal
    // Caller keeps its own busy slot and Promise; this cleanup never clears it.
    const original = this.#binding;
    this.#mainTerminateAttempted = true; this.#viaCleanupOnly = true; this.#viaFailed = true;
    this.#viaWorkerController?.fail(); this.#input.emit("error", error("PCB_VIA_ORIGINAL_ABORT"));
    await this.#nativeTail;
    await this.#verify(); this.#available();
    if (this.#binding !== original || this.#terminationObserved || this.#releaseConsumed) { throw error("PCB_VIA_ABORT_OWNER_CHANGED"); }
    const reply = await this.#request({ action: "pcb-via-abort" });
    if (!exact(reply, ["terminationDispatched"]) || reply["terminationDispatched"] !== true) { throw error("PCB_VIA_ABORT_REPLY"); }
    await this.#verify(); this.#available();
    if (this.#binding !== original) { throw error("PCB_VIA_ABORT_OWNER_CHANGED"); }
  }

  public async abortSchematicDisplayWrite(): Promise<void> {
    // oxlint-disable-next-line eslint/no-use-before-define -- The fixed facade exists before an original native cleanup can be invoked.
    if (!(this instanceof CurrentSchematicDisplayWriteOwner)) { throw error("SCHEMATIC_DISPLAY_ABORT_PURPOSE"); }
    assertOriginalCurrentSchematicDisplayWriteOwner(this); this.#available(); const original = this.#binding;
    if (original === null || this.#mainTerminateAttempted || this.#terminationObserved || this.#releaseConsumed) { throw error("SCHEMATIC_DISPLAY_ABORT_CONSUMED"); }
    this.#mainTerminateAttempted = true; this.#schematicDisplayCleanupOnly = true; this.#schematicWorkerController?.fail(); this.#input.emit("error", error("SCHEMATIC_DISPLAY_ORIGINAL_ABORT"));
    await this.#nativeTail; await this.#verify(); this.#available();
    if (this.#binding !== original || this.#terminationObserved || this.#releaseConsumed) { throw error("SCHEMATIC_DISPLAY_ABORT_OWNER_CHANGED"); }
    const reply = await this.#request({ action: "schematic-display-abort" });
    if (!exact(reply, ["terminationDispatched"]) || reply["terminationDispatched"] !== true) { throw error("SCHEMATIC_DISPLAY_ABORT_REPLY"); }
    await this.#verify(); this.#available(); if (this.#binding !== original) { throw error("SCHEMATIC_DISPLAY_ABORT_OWNER_CHANGED"); }
  }

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
  #originalBornFootprintFactory(): boolean {
    let factories = footprintCombinedFactories;
    if (this.#purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE) { factories = footprintForwardExecutionFactories; }
    else if (this.#purpose === CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE) { factories = footprintForwardFactories; }
    return bornFootprintTransport(this.#purpose) && factories.has(this) && factories.get(this) === this.#installation;
  }
  /** Synchronous logical seal before the lifecycle awaits its durable journal.
   * The token is private to this exact original factory owner and binding. */
  public reserveFootprintCombinedAbort(): CurrentFootprintCombinedAbortReservation {
    this.#available();
    const original = this.#binding;
    if (!this.#originalBornFootprintFactory() || original === null || this.#terminationObserved ||
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
      !this.#originalBornFootprintFactory() || this.#releaseConsumed || this.#combinedAbortDispatchAttempted) { throw error("COMBINED_ORIGINAL_ABORT_RESERVATION"); }
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
  /** Require the distinct factory even during cleanup. This reference check
   * never adopts another generation or grants a live request after release. */
  #headAgeAllocation(normal: boolean): HeadAgeValidationAllocation {
    if (this.#purpose !== "footprint-head-age209") { throw error("HEAD_AGE_PURPOSE"); }
    const entry = headAgeValidationFactories.get(this);
    if (entry === undefined || entry.allocation.owner !== this || entry.allocation.head === null) { throw error("HEAD_AGE_ORIGINAL_FACTORY"); }
    assertOriginalCurrentFootprintHeadAgeValidationOwner(this);
    if (normal) {
      this.#available();
      if (CurrentFootprintCopyMainBackendRunner.prototype.prepareHeadAge !== this.#headAgeMainMethods.prepare || CurrentFootprintCopyMainBackendRunner.prototype.observeHeadAge !== this.#headAgeMainMethods.observe) { throw error("HEAD_AGE_MAIN_METHOD_CHANGED"); }
      if (this.#headAgeAbortAttempted || this.#closeConsumed || this.#terminationObserved || this.#releaseConsumed) { throw error("HEAD_AGE_NORMAL_ENDED"); }
    }
    return entry.allocation;
  }
  /** Start the one genuinely allocated main-only diagnostic. The exact
   * disposable checkpoint is checked again before the paused application starts. */
  public async startFootprintHeadAgeValidationGeneration(): Promise<void> {
    const allocation = this.#headAgeAllocation(true);
    if (this.#headAgeStarted || this.#installation === null) { throw error("HEAD_AGE_START_CONSUMED"); }
    this.#headAgeStarted = true;
    await verifyCurrentDisposableOpenCheckpoint(allocation.binding.prepared, allocation.binding.originalTarget); this.#headAgeAllocation(true);
    const executable = this.#installation.plan.files[0]; if (executable === undefined) { throw error("HEAD_AGE_INSTALLATION"); }
    await this.launch({ executable: executable.windowsPath, executableSha256: executable.sha256, confirmDiagnosticLaunch: true }); this.#headAgeAllocation(true);
  }
  /** Qualify the original app-main parser and native Date methods, then collect
   * one finite Windows/app bracket for the original completed SQL head. There
   * is no project navigation, backend request, copy, delete or Save command. */
  public async observeFootprintHeadAgeValidation(): Promise<CurrentFootprintHeadAgeObservation> {
    const allocation = this.#headAgeAllocation(true);
    if (!this.#headAgeStarted || !this.#launchSucceeded || this.#headAgeAttempted || this.#headAgeBusy || allocation.head === null) { throw error("HEAD_AGE_OBSERVE_CONSUMED"); }
    this.#headAgeAttempted = true; this.#headAgeBusy = true;
    try {
      await this.observeFootprintMainConstruction(); this.#headAgeAllocation(true);
      const main = this.#mainRunner, original = this.#binding;
      if (main === null || original === null) { throw error("HEAD_AGE_MAIN_REQUIRED"); }
      await this.#headAgeMainMethods.prepare.call(main, original.rootPid); this.#headAgeAllocation(true);
      await verifyCurrentDisposableOpenCheckpoint(allocation.binding.prepared, allocation.binding.originalTarget); this.#headAgeAllocation(true);
      const observed = await this.#headAgeMainMethods.observe.call(main, { createdAtLiteral: allocation.head.createdAtLiteral, referenceUtcMs: 0 }); this.#headAgeAllocation(true);
      const bracket = this.#headAgeBracket;
      if (bracket === null || this.#headAgeInspectorBytes.length > 0) { throw error("HEAD_AGE_NATIVE_BRACKET_REQUIRED"); }
      if (this.#mainRunner !== main || this.#binding !== original) { throw error("HEAD_AGE_ORIGINAL_MAIN_CHANGED"); }
      const compared = compareCurrentFootprintHeadAgeObservation(allocation.binding.operationId, allocation.head, original, observed, bracket.before, bracket.after);
      await verifyCurrentDisposableOpenCheckpoint(allocation.binding.prepared, allocation.binding.originalTarget); this.#headAgeAllocation(true);
      const packet: CurrentFootprintHeadAgeObservation = Object.freeze({ ...compared, nativeDateProvenanceVerified: true, appClockDirectlyObserved: true });
      this.#headAgeObservationText = captureCurrentFootprintHeadAgeReply(packet).text; this.#headAgeObservation = packet; return packet;
    } finally { this.#headAgeBusy = false; }
  }
  /** Historical original-object custody only. This remains usable after actual
   * termination and helper release so evidence publication can finish. */
  public requireOriginalFootprintHeadAgeValidationObservation(packet: CurrentFootprintHeadAgeObservation): void {
    this.#headAgeAllocation(false);
    if (packet !== this.#headAgeObservation || this.#headAgeObservationText === null || captureCurrentFootprintHeadAgeReply(packet).text !== this.#headAgeObservationText) { throw error("HEAD_AGE_ORIGINAL_OBSERVATION"); }
  }
  /** Synchronously cut off every normal continuation before durable abort
   * intent is awaited. The opaque reservation retains this original Job only. */
  public reserveFootprintHeadAgeValidationAbort(): object {
    this.#headAgeAllocation(false);
    if (this.#binding === null || this.#headAgeAbortAttempted || this.#terminationObserved || this.#releaseConsumed) { throw error("HEAD_AGE_ABORT_CONSUMED"); }
    this.#headAgeAbortAttempted = true; this.#headAgeAbortToken = Object.freeze({}); return this.#headAgeAbortToken;
  }
  /** Dispatch the retained abort once; its acknowledgment never proves exit,
   * saved-state invariance, discard or successful cache/clock observations. */
  public async dispatchFootprintHeadAgeValidationAbort(token: object, confirmOriginalJob: true): Promise<void> {
    this.#headAgeAllocation(false);
    // oxlint-disable-next-line typescript/no-unnecessary-boolean-literal-compare -- Reject malformed runtime confirmations before consuming the original dispatch.
    if (confirmOriginalJob !== true || token !== this.#headAgeAbortToken || !this.#headAgeAbortAttempted || this.#headAgeAbortDispatched || this.#binding === null || this.#terminationObserved || this.#releaseConsumed) { throw error("HEAD_AGE_ABORT_ORIGINAL_RESERVATION"); }
    this.#headAgeAbortDispatched = true; const original = this.#binding;
    await this.#verify(); this.#headAgeAllocation(false);
    if (this.#binding !== original) { throw error("HEAD_AGE_ABORT_OWNER_CHANGED"); }
    const reply = await this.#request({ action: "head-age-abort", confirmOriginalJob: true });
    if (!exact(reply, ["terminationDispatched"]) || reply["terminationDispatched"] !== true) { throw error("HEAD_AGE_ABORT_REPLY"); }
  }
  /** Capture the original main registration once on its retained transport.
   * The distinct head-age purpose alone receives passive bootstrap custody.
   * That token stays bound to this runner and its original native generation. */
  public async observeFootprintMainConstruction(): Promise<CurrentFootprintCopyMainBackendObservation> {
    this.#requireFootprintMain(false);
    if (this.#mainObservationAttempted) { throw error("MAIN_OBSERVATION_CONSUMED"); }
    this.#mainObservationAttempted = true;
    await this.attachFootprintMain();
    const transport = Object.freeze({
      assertCurrent: (): Promise<void> => this.reproveFootprintMain(),
      send: (command: CurrentFootprintCopyMainBackendCommand, id: number): Promise<void> => this.sendFootprintMain(command, id),
      poll: (cleanup: boolean): Promise<string> => this.pollFootprintMain(cleanup),
    });
    let runner: CurrentFootprintCopyMainBackendRunner | null = null;
    let bootstrap: CurrentFootprintHeadAgeBootstrapCapability | undefined;
    if (this.#purpose === "footprint-head-age209") {
      this.#headAgeAllocation(true); const original = this.#requireFootprintMain(true);
      bootstrap = Object.freeze({ profile: "private.current-footprint-head-age-bootstrap-capability.v1", executionAuthorized: false });
      headAgeBootstrapCapabilities.set(bootstrap, Object.freeze({ transport, reprove: (): void => {
        // Only the original owner's normal-close lane may retain cleanup
        // Custody after close is consumed; its main transport admits release only.
        this.#headAgeAllocation(!this.#mainCloseCleanupActive);
        if (this.#requireFootprintMain(true) !== original || this.#mainRunner !== runner) { throw error("HEAD_AGE_BOOTSTRAP_OWNER_CHANGED"); }
      } }));
    }
    let selectedBootstrap: CurrentSelectedFileMainSqlFenceBootstrap | undefined;
    if (this.#purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE) {
      // oxlint-disable-next-line eslint/no-use-before-define -- Native factory registers the actual fixed facade before main observation.
      if (!(this instanceof CurrentPcbViaWriteOwner)) { throw error("PCB_VIA_ORIGINAL_FACTORY"); }
      assertOriginalCurrentPcbViaWriteOwner(this); const allocation = pcbViaWriteFactories.get(this)?.allocation, original = this.#requireFootprintMain(true);
      if (allocation === undefined) { throw error("PCB_VIA_ORIGINAL_PREPARATION"); }
      selectedBootstrap = Object.freeze({ profile: "private.selected-file-main-sql-fence-bootstrap.v1", executionAuthorized: false });
      selectedSqlFenceBootstraps.set(selectedBootstrap, Object.freeze({ transport, runner: () => runner, owner: this,
        path: allocation.prepared.qualification.target.rawWindowsPath, reprove: (): void => {
          assertOriginalCurrentPcbViaWriteOwner(this);
          if (this.#requireFootprintMain(true) !== original || this.#mainRunner !== runner) { throw error("SELECTED_SQL_BOOTSTRAP_OWNER_CHANGED"); }
        } }));
    }
    if (this.#purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE) {
      // oxlint-disable-next-line eslint/no-use-before-define -- This distinct original factory registers the actual facade before main observation.
      if (!(this instanceof CurrentSchematicDisplayWriteOwner)) { throw error("SCHEMATIC_DISPLAY_ORIGINAL_FACTORY"); }
      assertOriginalCurrentSchematicDisplayWriteOwner(this); const allocation = schematicDisplayFactories.get(this)?.allocation, original = this.#requireFootprintMain(true);
      if (allocation === undefined) { throw error("SCHEMATIC_DISPLAY_ORIGINAL_PREPARATION"); }
      selectedBootstrap = Object.freeze({ profile: "private.selected-file-main-sql-fence-bootstrap.v1", executionAuthorized: false });
      selectedSqlFenceBootstraps.set(selectedBootstrap, Object.freeze({ transport, runner: () => runner, owner: this,
        path: allocation.prepared.qualification.target.rawWindowsPath, reprove: (): void => {
          assertOriginalCurrentSchematicDisplayWriteOwner(this);
          if (this.#requireFootprintMain(true) !== original || this.#mainRunner !== runner) { throw error("SCHEMATIC_DISPLAY_MAIN_OWNER_CHANGED"); }
        } }));
    }
    runner = new CurrentFootprintCopyMainBackendRunner(transport, bootstrap, selectedBootstrap);
    this.#mainRunner = runner;
    const packet = await runner.observe();
    if (this.#purpose === CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE) { this.#structureMainConstruction = packet; }
    return packet;
  }
  /** Observe original native descriptors before opening. No native roster,
   * CacheStorage invocation or saved-generation replay authority is inferred. */
  public async observeSavedCacheNative(): Promise<CurrentFootprintSavedCacheObservation> {
    // Original target/frame reads plus at most two ancillary DOM-owner reads.
    const contextRequests = 4;
    const context = this.#stagedContext, engine = this.#savedCacheBrowserVersion, main = this.#mainRunner,
      original = this.#binding, pipe = this.#pipe, source = this.#footprintUiSource;
    if (!bornFootprintTransport(this.#purpose) || !(pipe instanceof CurrentFootprintCombinedDiscoveryPipe) && !(pipe instanceof CurrentFootprintCopyForwardDiscoveryPipe) ||
        context === null || source === null || original === null || engine === null || main === null ||
        !main.retained().completed || main.retained().failed || !main.retained().sourceQualified ||
        this.#savedCacheNativeAttempted || !this.#scriptConsumed || this.#inspectionConsumed || this.#startupHandoffConsumed ||
        this.#projectOpeningConsumed || this.#startupParent !== null || this.#closeConsumed || this.#terminationObserved || this.#releaseConsumed ||
        pipe.status().requestCount > DIAGNOSTIC_REQUEST_LIMIT - contextRequests - CURRENT_FOOTPRINT_SAVED_CACHE_PROBE_LIMITS.normal - CURRENT_FOOTPRINT_SAVED_CACHE_PROBE_LIMITS.cleanup) {
      throw error("SAVED_CACHE_NATIVE_PROBE_UNAVAILABLE");
    }
    // oxlint-disable-next-line typescript/unbound-method -- Retain original method identities and invoke only with their original pipe/context receivers.
    const request = pipe.observeSavedCacheNative, selectContext = context.savedCacheMetadataContext;
    this.#enter(true); this.#savedCacheNativeAttempted = true;
    try {
      this.#savedCacheNativeSetupPhase = "source";
      const script = context.script();
      const sameOwner = (): void => {
        this.#available(); requireCurrentFootprintCopyUiSource(source); context.assertCurrent();
        if (this.#pipe !== pipe || pipe.observeSavedCacheNative !== request || this.#stagedContext !== context || context.savedCacheMetadataContext !== selectContext ||
            this.#binding !== original || this.#footprintUiSource !== source || this.#mainRunner !== main || this.#savedCacheBrowserVersion !== engine ||
            !this.#busy || !this.#savedCacheNativeAttempted || !main.retained().completed || main.retained().failed ||
            this.#startupHandoffConsumed || this.#startupParent !== null || this.#projectOpeningConsumed ||
            this.#closeConsumed || this.#terminationObserved || this.#releaseConsumed || context.script().scriptId !== script.scriptId) {
          throw error("SAVED_CACHE_NATIVE_PROBE_OWNER_CHANGED");
        }
      };
      sameOwner(); await this.#verify(); sameOwner(); await this.#verifyInstallation(); sameOwner();
      this.#savedCacheNativeSetupPhase = "parent";
      await this.#observeParent(); sameOwner();
      this.#savedCacheNativeSetupPhase = "ancillary-owner";
      await this.#observeOpeningAncillary(); sameOwner();
      this.#savedCacheNativeSetupPhase = "selector";
      const selected = selectContext.call(context);
      const same = (): void => {
        sameOwner(); const observed = selectContext.call(context);
        if (observed.sessionId !== selected.sessionId || observed.uniqueContextId !== selected.uniqueContextId) { throw error("SAVED_CACHE_NATIVE_PROBE_OWNER_CHANGED"); }
      };
      const current = async (): Promise<void> => {
        same(); await this.#verify(); same(); await this.#verifyInstallation(); same();
      };
      const runner = new CurrentFootprintSavedCacheRunner(Object.freeze({ assertCurrent: current,
        request: (command: CurrentFootprintSavedCacheCommand): Promise<unknown> => this.#transfer(() => request.call(pipe, command)),
      }), selected, engine);
      this.#savedCacheNativeRunner = runner; this.#savedCacheNativeSetupPhase = "metadata";
      const result = await runner.observe(); this.#savedCacheNativeSetupPhase = "completed"; return result;
    } catch (caughtError) { this.#savedCacheNativeSetupFailed = true; throw caughtError; }
    finally { this.#busy = false; }
  }
  /** Observe original native accessor descriptors before opening. No native roster,
   * CacheStorage invocation or saved-generation replay authority is inferred. */
  public async observeSavedCacheAccessor(): Promise<CurrentFootprintSavedCacheAccessorObservation> {
    // Original target/frame reads plus at most two ancillary DOM-owner reads.
    const contextRequests = 4;
    const context = this.#stagedContext, engine = this.#savedCacheBrowserVersion, main = this.#mainRunner,
      original = this.#binding, pipe = this.#pipe, source = this.#footprintUiSource;
    if (!bornFootprintTransport(this.#purpose) || !(pipe instanceof CurrentFootprintCombinedDiscoveryPipe) && !(pipe instanceof CurrentFootprintCopyForwardDiscoveryPipe) ||
        context === null || source === null || original === null || engine === null || main === null ||
        !main.retained().completed || main.retained().failed || !main.retained().sourceQualified ||
        this.#savedCacheAccessorAttempted || !this.#scriptConsumed || this.#inspectionConsumed || this.#startupHandoffConsumed ||
        this.#projectOpeningConsumed || this.#startupParent !== null || this.#closeConsumed || this.#terminationObserved || this.#releaseConsumed ||
        pipe.status().requestCount > DIAGNOSTIC_REQUEST_LIMIT - contextRequests - CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_LIMITS.normal - CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_LIMITS.cleanup) {
      throw error("SAVED_CACHE_ACCESSOR_PROBE_UNAVAILABLE");
    }
    // oxlint-disable-next-line typescript/unbound-method -- Retain original method identities and invoke only with their original pipe/context receivers.
    const request = pipe.observeSavedCacheAccessor, selectContext = context.savedCacheMetadataContext;
    this.#enter(true); this.#savedCacheAccessorAttempted = true;
    try {
      this.#savedCacheAccessorSetupPhase = "source";
      const script = context.script();
      /** Reprove every captured owner, source, context and method before continuing this
       * metadata attempt. Checks use retained objects and refuse close, handoff or context
       * drift instead of adopting a replacement owner.
       */
      const sameOwner = (): void => {
        this.#available(); requireCurrentFootprintCopyUiSource(source); context.assertCurrent();
        if (this.#pipe !== pipe || pipe.observeSavedCacheAccessor !== request || this.#stagedContext !== context || context.savedCacheMetadataContext !== selectContext ||
            this.#binding !== original || this.#footprintUiSource !== source || this.#mainRunner !== main || this.#savedCacheBrowserVersion !== engine ||
            !this.#busy || !this.#savedCacheAccessorAttempted || !main.retained().completed || main.retained().failed ||
            this.#startupHandoffConsumed || this.#startupParent !== null || this.#projectOpeningConsumed ||
            this.#closeConsumed || this.#terminationObserved || this.#releaseConsumed || context.script().scriptId !== script.scriptId) {
          throw error("SAVED_CACHE_ACCESSOR_PROBE_OWNER_CHANGED");
        }
      };
      sameOwner(); await this.#verify(); sameOwner(); await this.#verifyInstallation(); sameOwner();
      this.#savedCacheAccessorSetupPhase = "parent";
      await this.#observeParent(); sameOwner();
      this.#savedCacheAccessorSetupPhase = "ancillary-owner";
      await this.#observeOpeningAncillary(); sameOwner();
      this.#savedCacheAccessorSetupPhase = "selector";
      const selected = selectContext.call(context);
      /** Recheck the original owner and exact session/context selector after awaits.
       * A newly matching context cannot replace the original captured selector result.
       */
      const same = (): void => {
        sameOwner(); const observed = selectContext.call(context);
        if (observed.sessionId !== selected.sessionId || observed.uniqueContextId !== selected.uniqueContextId) { throw error("SAVED_CACHE_ACCESSOR_PROBE_OWNER_CHANGED"); }
      };
      const current = async (): Promise<void> => {
        same(); await this.#verify(); same(); await this.#verifyInstallation(); same();
      };
      const runner = new CurrentFootprintSavedCacheAccessorRunner(Object.freeze({ assertCurrent: current,
        request: (command: CurrentFootprintSavedCacheAccessorCommand): Promise<unknown> => this.#transfer(() => request.call(pipe, command)),
      }), selected, engine);
      this.#savedCacheAccessorRunner = runner; this.#savedCacheAccessorSetupPhase = "metadata";
      const result = await runner.observe(); this.#savedCacheAccessorSetupPhase = "completed"; return result;
    } catch (caughtError) { this.#savedCacheAccessorSetupFailed = true; throw caughtError; }
    finally { this.#busy = false; }
  }
  public retainedFootprintMainConstruction(): ReturnType<CurrentFootprintCopyMainBackendRunner["retained"]> | null {
    return this.#mainRunner?.retained() ?? null;
  }

  /** Join the real native allocation's own startup dependency to the original
   * constructor lease. Genuine leases from another native owner still refuse. */
  public structureObservationInput(lease: CurrentProjectStructureWorkerLease, cleanup: boolean): Readonly<{
    main: CurrentFootprintCopyMainBackendRunner; capability: CurrentProjectStructureMainCapability; target: CurrentDisposableOpenSealedTarget;
    construction: CurrentFootprintCopyMainBackendObservation;
  }> {
    const handoff = this.#startupHandoff, main = this.#mainRunner, target = this.#projectOpeningTarget;
    if (main === null || handoff === null || target === null || this.#structureMainConstruction === null) { throw error("STRUCTURE_ORIGINAL_CONSTRUCTORS_REQUIRED"); }
    this.requireOriginalProjectStructureMainRunner(main, cleanup ? "cleanup" : "normal");
    requireCurrentProjectStructureWorkerLease(lease).requireNativeDependency(handoff.dependency);
    if (this.#structureMainCapability === null) {
      if (cleanup) { throw error("STRUCTURE_ORIGINAL_CAPABILITY_REQUIRED"); }
      requireOriginalProjectStructurePrefixCapacity(handoff.dependency);
      if (this.#mainNormalRequests > STRUCTURE_MAIN_CONSTRUCTION.observeNormal || this.#mainCleanupRequests > STRUCTURE_MAIN_CONSTRUCTION.observeCleanup ||
        this.#mainRequestId !== this.#mainNormalRequests + this.#mainCleanupRequests || this.#mainRequestId > STRUCTURE_MAIN_CONSTRUCTION.maximumObserve) {
        throw error("STRUCTURE_ORIGINAL_CAPACITY_REQUIRED");
      }
      this.#structureMainCapability = Object.freeze({ profile: "private.current-project-structure-main-capability.v1" as const });
      structureCapabilities.set(this.#structureMainCapability, this);
    }
    return Object.freeze({ main, capability: this.#structureMainCapability, target, construction: this.#structureMainConstruction });
  }
  /** Reach the paired observer only through this actual factory allocation.
   * Its caller retains the durable operation intent; no writer is invoked. */
  public async createStructureObservation(lease: CurrentProjectStructureWorkerLease, plan: unknown): Promise<StructureWorkflow> {
    const owner = originalStructureOwner(this);
    const { CurrentProjectStructureObservationWorkflow } = await import("./current-project-structure-observation-workflow.ts");
    if (originalStructureOwner(this) !== owner) { throw error("STRUCTURE_NATIVE_OWNER"); }
    return new CurrentProjectStructureObservationWorkflow(owner, lease, plan);
  }
  /** Cleanup keeps the original child/Job/connection and never reopens the
   * normal lane after a semantic observer refusal or consumed dispatch. */
  public requireOriginalProjectStructureMainRunner(runner: CurrentFootprintCopyMainBackendRunner, mode: "normal" | "cleanup" | "exited"): boolean {
    requireOriginalCurrentFootprintForwardMainRunner(runner);
    if (this.#purpose !== CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE || !structureFactories.has(this) ||
      structureFactories.get(this) !== this.#installation || this.#mainRunner !== runner || this.#binding === null || !this.#launchSucceeded) {
      throw error("STRUCTURE_ORIGINAL_MAIN_OWNER");
    }
    if (mode === "normal") {
      this.#requireFootprintMain(true);
      if (!runner.retained().completed || runner.retained().failed) { throw error("STRUCTURE_NORMAL_ENDED"); }
    } else if (mode === "cleanup") {
      if (!retainedOwners.has(this) || this.#releaseConsumed || this.#released || this.#childClosed) { throw error("STRUCTURE_CLEANUP_ENDED"); }
    } else if (mode !== "exited") { throw error("STRUCTURE_OWNER_MODE"); }
    return this.#terminationObserved && this.#terminationObservation?.originalRootExited === true && this.#terminationObservation.originalJobEmpty === true;
  }
  /** Send only the newly born observer's finite grammar. The old main/request
   * vocabulary cannot acquire the structure role by matching a packet. */
  public async sendProjectStructureMain(command: CurrentProjectStructureMainCommand, requestId: number): Promise<void> {
    const runner = this.#mainRunner;
    if (runner === null || this.#structureMainCapability === null) { throw error("STRUCTURE_ORIGINAL_MAIN_OWNER"); }
    const cleanup = ["structure-main-remove", "structure-main-resume", "structure-main-release"].includes(command.phase);
    const current = (): void => {
      this.requireOriginalProjectStructureMainRunner(runner, cleanup ? "cleanup" : "normal");
      if (!this.#mainAttached || this.#mainCloseDetached || this.#mainTerminateAttempted || this.#terminationObserved || this.#closeConsumed) {
        throw error("STRUCTURE_MAIN_CONNECTION_ENDED");
      }
    };
    current(); const wire = currentProjectStructureMainWire(command, requestId);
    if (requestId !== this.#mainRequestId + 1 || (cleanup ? this.#mainCleanupRequests >= CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE.main.cleanup :
      this.#mainNormalRequests >= CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE.main.normal)) { throw error("STRUCTURE_MAIN_REQUEST_BOUND"); }
    this.#enterFootprintMain(); this.#mainRequestId += 1;
    if (cleanup) { this.#mainCleanupRequests += 1; } else { this.#mainNormalRequests += 1; }
    try {
      await this.#verify(); current();
      const reply = await this.#request({ ...wire.request });
      if (!exact(reply, ["written"]) || reply["written"] !== true) { throw error("STRUCTURE_MAIN_WRITE_REPLY"); }
      await this.#verify(); current();
    } finally { this.#leaveFootprintMain(); }
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

  public releaseClosed(): Promise<void> { return this.#releaseWithPreflightProof("closed", () => this.#release(false)); }

  /** Original helper only, before this owner has ever invoked launch. Native
   * state independently proves no creation attempt and an empty original Job. */
  public releaseUnlaunched(): Promise<void> {
    return this.#releaseWithPreflightProof("unlaunched", async () => {
      if (this.#launchConsumed || this.#binding !== null) { throw error("UNLAUNCHED_RELEASE_REFUSED"); }
      await this.#release(true);
    });
  }

  /** A completed original launch refusal is not an uncertain dispatch. The
   * helper independently proves its creation phase and empty original Job. */
  public releaseNoProcess(): Promise<Readonly<CurrentPcbDiagnosticNoProcessRelease>> {
    return this.#releaseWithPreflightProof("no-process", () => this.#releaseNoProcess());
  }

  async #releaseNoProcess(): Promise<Readonly<CurrentPcbDiagnosticNoProcessRelease>> {
    if (this.#releaseConsumed) { throw error("RELEASE_CONSUMED"); }
    if (!this.#noProcessCleanupAvailable()) { throw error("NO_PROCESS_CLEANUP_UNAVAILABLE"); }
    const launchRequestOutcome = this.#launchRequestIssued ? "native-refused" : "not-issued";
    this.#enter();
    try {
      await this.#verify(); this.#available();
      this.#beginReleaseWork();
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

  /** A one-use original-error proof permits a later explicit cleanup call only
   * when this genuine v2 pipeline has never begun native or channel release. */
  public consumeFootprintForwardExecutionReleasePreflightFailure(caught: unknown, kind: ForwardExecutionReleaseKind): boolean {
    if (!footprintForwardExecutionFactories.has(this) || caught === null || typeof caught !== "object" || types.isProxy(caught)) { return false; }
    try { assertOriginalCurrentFootprintForwardExecutionNativeOwner(this); } catch { return false; }
    const held = forwardExecutionReleasePreflightFailures.get(caught);
    if (held?.owner !== this || held.kind !== kind || held.attempt !== this.#forwardExecutionReleaseAttempt ||
        held.activity !== this.#forwardExecutionNativeActivity || !this.#releasePreflightIdle()) { return false; }
    forwardExecutionReleasePreflightFailures.delete(caught); return true;
  }

  #releasePreflightIdle(): boolean {
    return !this.#forwardExecutionReleaseWorkEverStarted && !this.#releaseConsumed && !this.#released && !this.#busy &&
      this.#pending === null && this.#forwardExecutionPendingFrameWrites.size === 0 && this.#forwardExecutionPendingNativeRequests.size === 0 &&
      this.#failure === null && !this.#childClosed && this.#child.exitCode === null && this.#child.signalCode === null &&
      (this.#forwardExecutionMainPoll === null || this.#forwardExecutionMainPoll.delivered);
  }

  #releaseWithPreflightProof<Result>(kind: ForwardExecutionReleaseKind, run: () => Promise<Result>): Promise<Result> {
    if (this.#purpose !== CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE) { return run(); }
    return this.#forwardExecutionRelease(kind, run);
  }

  async #forwardExecutionRelease<Result>(kind: ForwardExecutionReleaseKind, run: () => Promise<Result>): Promise<Result> {
    const activity = this.#forwardExecutionNativeActivity, attempt = Object.freeze({});
    this.#forwardExecutionReleaseAttempt = attempt;
    try { return await run(); }
    catch (caughtError) {
      if (caughtError !== null && typeof caughtError === "object" && !types.isProxy(caughtError) && !forwardExecutionReleaseFailureErrors.has(caughtError) &&
          this.#forwardExecutionReleaseAttempt === attempt && this.#forwardExecutionNativeActivity === activity && this.#releasePreflightIdle()) {
        try {
          assertOriginalCurrentFootprintForwardExecutionNativeOwner(this);
          forwardExecutionReleaseFailureErrors.add(caughtError);
          forwardExecutionReleasePreflightFailures.set(caughtError, Object.freeze({ owner: this, attempt, kind, activity }));
        } catch {
          // Preserve the original refusal without issuing a proof for drift.
        }
      }
      throw caughtError;
    }
  }

  #beginReleaseWork(): void {
    if (this.#purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE) { this.#forwardExecutionReleaseWorkEverStarted = true; }
  }

  async #release(unlaunched: boolean): Promise<void> {
    if (this.#releaseConsumed) { throw error("RELEASE_CONSUMED"); }
    this.#enter();
    try {
      await this.#verify(); this.#available();
      if (!unlaunched) {
        this.#beginReleaseWork();
        const termination = terminationObservation(await this.#request({ action: "termination" }));
        if (!termination.terminated) { throw error("RETAIN_LIVE_OWNER"); }
        this.#terminationObservation = termination; this.#terminationObserved = true;
        if (this.#startupChannel !== null && !this.#startupChannel.status().released) {
          await this.#startupChannel.releaseAfterTermination();
        }
        if (this.#footprintSavedOpening !== null && !this.#footprintSavedOpeningReleased) {
          await this.#footprintSavedOpening.releaseAfterTermination(); this.#footprintSavedOpeningReleased = true;
        }
        if (this.#heldSavedOpening !== null && !this.#heldSavedOpeningReleased) {
          await this.#heldSavedOpening.releaseAfterTermination(); this.#heldSavedOpeningReleased = true;
        }
      }
      this.#beginReleaseWork();
      this.#releaseConsumed = true;
      // Native release independently observes original root and Job again.
      // A rejected live release consumes only this call, never closes a pipe.
      const reply = await this.#request({ action: unlaunched ? "release-unlaunched" : "release" });
      if (!exact(reply, unlaunched ? ["released", "launchNeverAttempted"] : ["released"]) || reply["released"] !== true ||
          unlaunched && reply["launchNeverAttempted"] !== true) { throw error("RELEASE_REPLY"); }
      if (unlaunched && (this.#purpose === "worker-startup-footprint-saved209" || this.#purpose === "worker-startup-footprint-held-saved209")) { this.#footprintUnlaunchedRelease = Object.freeze(reply); }
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
    if (this.#purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE) { assertOriginalCurrentPcbViaWriteOwner(this); }
    if (this.#purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE) { assertOriginalCurrentSchematicDisplayWriteOwner(this); }
    if (this.#purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE) { assertOriginalCurrentFootprintForwardExecutionNativeOwner(this); }
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
  async #pollRenderer(): Promise<void> {
    this.#available(); const chunk = await this.#request({ action: "poll" });
    if (!exact(chunk, ["bytes"]) || typeof chunk["bytes"] !== "string" || chunk["bytes"].length > TRANSPORT.maximumNativePollBase64Units ||
      !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(chunk["bytes"])) { throw error("PIPE_CHUNK"); }
    const bytes = Buffer.from(chunk["bytes"], "base64");
    if (bytes.toString("base64") !== chunk["bytes"] || bytes.length > TRANSPORT.maximumNativePollBytes) { throw error("PIPE_CHUNK"); }
    if (bytes.length > 0) { this.#input.write(bytes); } else { await delay(20); }
  }
  async #transfer(request: () => Promise<RecordValue>): Promise<RecordValue> {
    if (this.#startupParent !== null) { throw error("STARTUP_LEGACY_TRANSFER_DISABLED"); }
    try {
      if (!this.#launchSucceeded) { throw error("CLEANUP_ONLY"); }
      await this.#verify(); this.#available();
      const reply = request();
      // Attach rejection before any await, including the native write callback.
      let settled = false;
      const observed = (async (): Promise<{ value: RecordValue } | { cause: unknown }> => {
        try { return { value: await reply }; } catch (caughtError) { return { cause: caughtError }; } finally { settled = true; }
      })();
      await this.#send;
      while (selectedFileMainPurpose(this.#purpose) ? !settled : this.#pipe.status().pendingRequestId !== null) {
        if (selectedFileMainPurpose(this.#purpose) && this.#mainRunner !== null) { await this.#mainRunner.pumpSelectedSqlFence(); }
        if (this.#purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE && this.#viaProjectNavigationDispatchAttempted && this.#viaWorkerController !== null && !this.#viaWorkerController.status().pumping) { await this.#viaWorkerController.pump(); }
        if (this.#purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE && this.#schematicNavigationDispatchAttempted && this.#schematicWorkerController !== null && !this.#schematicWorkerController.status().pumping) { await this.#schematicWorkerController.pump(); }
        await this.#pollRenderer();
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
  /** Encode one Buffer through its fixed purpose-specific native grammar and
   * settle the original Writable callback after an exact written acknowledgment.
   * Invalid frames and uncertain writes retain the fixed failure result. */
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- This adapter must settle the original Writable completion callback after native WriteFile.
  async #sendFrame(chunk: unknown, callback: (cause?: Error | null) => void): Promise<void> {
    const frame = this.#purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE ? Object.freeze({}) : null;
    if (frame !== null) { this.#forwardExecutionPendingFrameWrites.add(frame); }
    try {
      if (!Buffer.isBuffer(chunk)) { throw error("OUTBOUND_FRAME"); }
      let nativeRequest = diagnosticNativeRequest;
      if (bornFootprintTransport(this.#purpose)) { nativeRequest = combinedDiagnosticNativeRequest; }
      else if (this.#purpose === "footprint-held-cache209") { nativeRequest = heldCacheDiagnosticNativeRequest; }
      else if (this.#purpose === "visual209") { nativeRequest = visualDiagnosticNativeRequest; }
      else if (this.#purpose === "pcb-spatial209") { nativeRequest = spatialDiagnosticNativeRequest; }
      else if (this.#purpose === "pcb-component-spatial209") { nativeRequest = componentSpatialDiagnosticNativeRequest; }
      else if (this.#purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE) { nativeRequest = currentPcbViaWriteNativeRequest; }
      else if (this.#purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE) { nativeRequest = currentSchematicDisplayWriteNativeRequest; }
      const result = await this.#request(this.#stringPurpose ? stringPrecreateNativeRequest(chunk) : nativeRequest(chunk));
      if (!exact(result, ["written"]) || result["written"] !== true) { throw error("WRITE_ACK"); }
      // oxlint-disable-next-line promise/prefer-await-to-callbacks, eslint/no-useless-return -- Writable completion must be the terminal branch operation.
      callback(); return;
    } catch {
      // oxlint-disable-next-line promise/prefer-await-to-callbacks, eslint/no-useless-return -- Native failure settles the Writable callback as the terminal branch operation.
      callback(error("WRITE_FAILED")); return;
    } finally { if (frame !== null) { this.#forwardExecutionPendingFrameWrites.delete(frame); } }
  }
  #forwardResources(): Readonly<ForwardResources & { role: CurrentFootprintCopyForwardRole }> {
    const ledger = this.#forwardLedger, methods = this.#forwardLedgerMethods, role = this.#forwardRole;
    if (ledger === null || methods === null || role === null || requireOriginalForwardLedgerBinding(ledger) !== methods) { throw error("FORWARD_ORIGINAL_ACCOUNTING"); }
    if (role === "forward-writer") {
      const original = forwardResourceBirths.get(this);
      if (!forwardBirthPurpose(this.#purpose) || original?.ledger !== ledger || original.methods !== methods) { throw error("FORWARD_ORIGINAL_ACCOUNTING"); }
    } else {
      if (this.#purpose !== "worker-startup-footprint-saved209" || this.#forwardSavedHandoff === null) { throw error("FORWARD_ORIGINAL_ACCOUNTING"); }
      const held = requireForwardSavedObservationHandoff(this.#forwardSavedHandoff, this);
      if (held.ledger !== ledger || held.methods !== methods) { throw error("FORWARD_ORIGINAL_ACCOUNTING"); }
    }
    return { ledger, methods, role };
  }
  #forwardRendererEvent(bytes: number): void {
    const { ledger, methods, role } = this.#forwardResources();
    try { methods.consumeRendererEvent.call(ledger, role, this, bytes); }
    catch (caughtError) { this.#forwardCleanupOnly = true; throw caughtError; }
  }
  #forwardCapacity(): typeof CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY | typeof CURRENT_FOOTPRINT_FORWARD_EXECUTION_CAPACITY {
    return this.#purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE ? CURRENT_FOOTPRINT_FORWARD_EXECUTION_CAPACITY : CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY;
  }
  #forwardRequest(request: RecordValue, forwardMain?: ForwardExecutionMainRequest): Readonly<{ cleanup: boolean; waiting: boolean }> {
    const { ledger, methods, role } = this.#forwardResources(), action = request["action"];
    const mainLane = ["main-request-send", "main-completion-begin", "main-completion-send", "main-completion-retire"].includes(String(action));
    if (forwardMain !== undefined) { this.#requireForwardExecutionMain(forwardMain.capability, forwardMain.runner, forwardMain.mode); }
    // This born observation owner has no current head/cache/native-clock
    // Qualification or four-generation reservation. Refuse every unmounted
    // Create/clock route; main lanes require their fresh original capability.
    if (["footprint-copy-native-create", "footprint-copy-create-clock-begin", "footprint-copy-allocated-create-clock-begin",
      "footprint-copy-create-clock-retire", "footprint-copy-clock", "footprint-clock-rpc-begin", "footprint-clock-rpc-send",
      "footprint-clock-rpc-retire", "footprint-copy-clock-registration-v2", "footprint-clock-rpc-v2-send",
      "footprint-forward-allocated-clock-begin", "main-request-send", "main-completion-begin", "main-completion-send", "main-completion-retire"].includes(String(action)) && !(mainLane && forwardMain !== undefined)) {
      throw error(this.#purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE ? "FORWARD_EXECUTION_QUALIFICATION_REQUIRED" : "FORWARD_WRITER_UNMOUNTED");
    }
    const channel = this.#startupChannel;
    const requestId = request["requestId"];
    if (requestId !== undefined && typeof requestId !== "number") { throw error("FORWARD_REQUEST_ID"); }
    const main = action === "main-send" || mainLane && (action === "main-request-send" || action === "main-completion-send");
    const commandCleanup = requestId !== undefined && !main && (channel instanceof CurrentFootprintCopyForwardStartupChannel || channel instanceof CurrentFootprintForwardExecutionStartupChannel || channel instanceof CurrentFootprintCopyForwardSavedStartupChannel) ?
      classifyForwardRequest.call(channel, requestId) :
      request["method"] === "Debugger.removeBreakpoint" || request["method"] === "Debugger.resume" || request["method"] === "Runtime.releaseObjectGroup";
    const cleanup = commandCleanup || combinedCleanupControl(request) || mainLane && action === "main-completion-retire" ||
      ["window", "normal-close", "main-close-detach", "release-unlaunched"].includes(String(action)) || action === "main-poll" && request["cleanup"] === true ||
      action === "worker-startup-reprove" && (this.#forwardCleanupOnly || channel?.status().failed === true) ||
      action === "main-reprove" && this.#mainCloseCleanupActive;
    const waiting = action === "poll" && ((channel instanceof CurrentFootprintCopyForwardStartupChannel || channel instanceof CurrentFootprintForwardExecutionStartupChannel || channel instanceof CurrentFootprintCopyForwardSavedStartupChannel) ?
      forwardPollWaiting.call(channel) : this.#pipe.status().pendingRequestId !== null);
    try {
      if (this.#forwardCleanupOnly && !cleanup && action !== "poll") { throw error("FORWARD_CLEANUP_ONLY"); }
      if (requestId !== undefined) {
        if (typeof requestId !== "number") { throw error("FORWARD_REQUEST_ID"); }
        methods.consumeRequest.call(ledger, role, this, main ? "main" : "renderer", requestId, commandCleanup);
      } else if (action === "main-poll") {
        methods.consumeMainPoll.call(ledger, role, this, request["cleanup"] === true);
      } else if (action !== "poll") {
        const controls = this.#forwardCapacity().controls;
        const limits = role === "forward-writer" ? controls.writer : controls.saved;
        if (!cleanup && methods.generationStatus.call(ledger, role, this).normalControls >= limits.normal) { throw error("FORWARD_CONTROL_CLEANUP_RESERVE"); }
        methods.consumeControl.call(ledger, role, this, cleanup);
      }
    } catch (caughtError) { this.#forwardCleanupOnly = true; throw caughtError; }
    return Object.freeze({ cleanup, waiting });
  }
  #forwardRendererChunk(raw: RecordValue, pending: Pending): void {
    const encoded = raw["bytes"];
    if (!exact(raw, ["bytes"]) || typeof encoded !== "string" || encoded.length > TRANSPORT.maximumNativePollBase64Units ||
      !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(encoded)) { throw error("FORWARD_RENDERER_CHUNK"); }
    const bytes = Buffer.from(encoded, "base64");
    if (bytes.length > TRANSPORT.maximumNativePollBytes || bytes.toString("base64") !== encoded) { throw error("FORWARD_RENDERER_CHUNK"); }
    const { ledger, methods, role } = this.#forwardResources();
    let kind: "data" | "wait" | "idle" = "idle";
    if (bytes.length > 0) { kind = "data"; } else if (pending.forwardPollWaiting) { kind = "wait"; }
    methods.consumeRendererPoll.call(ledger, role, this, kind, pending.forwardCleanup || this.#forwardCleanupOnly);
    methods.consumeBytes.call(ledger, role, this, "renderer", bytes.length);
  }
  #forwardReply(result: RecordValue, pending: Pending): RecordValue {
    if (pending.poll) { this.#forwardRendererChunk(result, pending); }
    else if (pending.mainAction === "main-poll") {
      if (this.#forwardMainAccounting === null) { throw error("FORWARD_MAIN_ACCOUNTING"); }
      return Object.freeze({ bytes: this.#forwardMainAccounting.capture(result) });
    }
    return result;
  }
  /** Recover only this purpose's original ledger and captured method binding.
   * A matching shape or another owner's ledger cannot supply accounting custody. */
  #heldSavedResources(): Readonly<{ ledger: CurrentFootprintCopyHeldSavedResourceLedger; methods: CurrentFootprintCopyHeldSavedLedgerBinding }> {
    this.#requireHeldRole();
    const ledger = this.#heldSavedLedger, methods = this.#heldSavedLedgerMethods;
    if (!heldCachePurpose(this.#purpose) || ledger === null || methods === null ||
        requireOriginalHeldSavedLedgerBinding(ledger) !== methods) { throw error("HELD_SAVED_ORIGINAL_ACCOUNTING"); }
    methods.requireOriginal(); return { ledger, methods };
  }
  /** Charge requests and controls before native dispatch, deriving cleanup and
   * waiting buckets from the retained channel/state and preserving normal-output
   * headroom. These accounting fields grant no native ownership authority. */
  #heldSavedRequest(request: RecordValue): Readonly<{ cleanup: boolean; waiting: boolean }> {
    const { ledger, methods } = this.#heldSavedResources();
    const action = request["action"], channel = this.#startupChannel, id = request["requestId"];
    if (id !== undefined && typeof id !== "number") { throw error("HELD_SAVED_REQUEST_ID"); }
    const commandCleanup = typeof id === "number" && channel instanceof CurrentFootprintCopyHeldSavedStartupChannel ?
      classifyForwardRequest.call(channel, id) : ["Debugger.removeBreakpoint", "Debugger.resume", "Runtime.runIfWaitingForDebugger", "Runtime.releaseObjectGroup"].includes(String(request["method"]));
    const cleanup = commandCleanup ||
      action === "poll" && (this.#heldSavedLastCommandCleanup || this.#heldSavedFailed || this.#closeConsumed) ||
      ["identity", "window", "normal-close", "termination", "release", "release-unlaunched", "no-process-proof", "release-no-process", "held-saved-abort"].includes(String(action)) ||
      action === "worker-startup-reprove" && request["heldCleanup"] === true;
    if (!cleanup && action !== "poll" && (this.#heldSavedFailed || this.#heldSavedAbortAttempted || this.#closeConsumed || this.#releaseConsumed)) { throw error("HELD_CACHE_NORMAL_ENDED"); }
    const waiting = action === "poll" && (channel instanceof CurrentFootprintCopyHeldSavedStartupChannel ?
      forwardPollWaiting.call(channel) : this.#pipe.status().pendingRequestId !== null);
    if (!cleanup) {
      const usage = methods.status.call(ledger, this);
      const maximum = CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY;
      if (usage.bytes["helper-stdout"].normal + MAX_LINE > maximum.normalHelperStdoutBytes ||
          action === "poll" && usage.bytes.renderer.normal + TRANSPORT.maximumNativePollBytes > maximum.renderer.normalReceivedBytes) {
        methods.fail.call(ledger, this); this.#heldSavedFailed = true; throw error("HELD_SAVED_NORMAL_OUTPUT_RESERVE");
      }
    }
    if (typeof id === "number") {
      methods.consumeRequest.call(ledger, this, id, commandCleanup); this.#heldSavedLastCommandCleanup = commandCleanup;
    }
    else if (action !== "poll") { methods.consumeControl.call(ledger, this, cleanup); }
    this.#heldSavedReadCleanup = cleanup; return { cleanup, waiting };
  }
  /** Validate canonical bounded poll bytes and charge their actual data/wait/idle
   * category against the original pending request's normal or cleanup reservation.
   * Return the complete original result without treating empty bytes as completion. */
  #heldSavedReply(result: RecordValue, pending: Pending): RecordValue {
    if (!pending.poll) { return result; }
    const encoded = result["bytes"];
    if (!exact(result, ["bytes"]) || typeof encoded !== "string" || !/^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(encoded)) { throw error("HELD_SAVED_RENDERER_CHUNK"); }
    const bytes = Buffer.from(encoded, "base64");
    if (bytes.length > TRANSPORT.maximumNativePollBytes || bytes.toString("base64") !== encoded) { throw error("HELD_SAVED_RENDERER_CHUNK"); }
    const { ledger, methods } = this.#heldSavedResources();
    let kind: "data" | "wait" | "idle" = "idle";
    if (bytes.length > 0) { kind = "data"; } else if (pending.forwardPollWaiting) { kind = "wait"; }
    methods.consumeRendererPoll.call(ledger, this, kind, pending.forwardCleanup);
    methods.consumeBytes.call(ledger, this, "renderer", bytes.length, pending.forwardCleanup); return result;
  }
  /** Serialize startup polling and lifecycle work on the same retained helper.
   * Recheck held normal-work cutoff and the optional original-owner assertion
   * at dispatch, preserving a predecessor's refusal without blocking cleanup. */
  #request(request: RecordValue, beforeDispatch?: () => void, forwardMain?: ForwardExecutionMainRequest): Promise<RecordValue> {
    if (this.#purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE) {
      return this.#forwardExecutionTrackedRequest(request, beforeDispatch, forwardMain);
    }
    return this.#queuedRequest(request, beforeDispatch, forwardMain);
  }
  async #forwardExecutionTrackedRequest(request: RecordValue, beforeDispatch?: () => void, forwardMain?: ForwardExecutionMainRequest): Promise<RecordValue> {
    const activity = Object.freeze({});
    this.#forwardExecutionNativeActivity = activity; this.#forwardExecutionPendingNativeRequests.add(activity);
    try { return await this.#queuedRequest(request, beforeDispatch, forwardMain); }
    finally { this.#forwardExecutionPendingNativeRequests.delete(activity); }
  }
  #queuedRequest(request: RecordValue, beforeDispatch?: () => void, forwardMain?: ForwardExecutionMainRequest): Promise<RecordValue> {
    if (this.#startupParent === null && !bornFootprintTransport(this.#purpose) && !heldCachePurpose(this.#purpose) && this.#purpose !== "footprint-head-age209" && this.#purpose !== "pcb-component-spatial209" && !selectedFileMainPurpose(this.#purpose)) {
      beforeDispatch?.(); return this.#requestNow(request, forwardMain);
    }
    const heldNormal = heldCachePurpose(this.#purpose) && request["action"] !== "poll" &&
      !(request["action"] === "worker-startup-reprove" && request["heldCleanup"] === true) &&
      !["identity", "window", "normal-close", "termination", "release", "release-unlaunched", "no-process-proof", "release-no-process", "held-saved-abort"].includes(String(request["action"])) &&
      !["Debugger.removeBreakpoint", "Debugger.resume", "Runtime.runIfWaitingForDebugger", "Runtime.releaseObjectGroup"].includes(String(request["method"]));
    // The startup channel polls independently of lifecycle cleanup. Serialize
    // Both against the same retained helper, never a second poll owner.
    const next = (async (): Promise<RecordValue> => {
      await this.#nativeTail;
      if (heldNormal && (this.#heldSavedFailed || this.#heldSavedAbortAttempted || this.#closeConsumed || this.#releaseConsumed)) { throw error("HELD_CACHE_QUEUED_NORMAL_ENDED"); }
      beforeDispatch?.();
      return this.#requestNow(request, forwardMain);
    })();
    this.#nativeTail = (async (): Promise<void> => {
      try { await next; } catch {
        // The original caller retains the refusal.
      }
    })();
    return next;
  }
  /** Admit one correlated helper request after purpose, ownership and resource
   * checks, then bound its encoded input and original reply deadline. A write or
   * deadline failure consumes the attempt without proving exit or allowing retry. */
  #requestNow(request: RecordValue, forwardMain?: ForwardExecutionMainRequest): Promise<RecordValue> {
    if (request["action"] === "main-poll" && this.#forwardExecutionMainPoll !== null && !this.#forwardExecutionMainPoll.delivered) { throw error("FORWARD_EXECUTION_MAIN_POLL_UNSETTLED"); }
    this.#available();
    if (this.#purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE && this.#viaCleanupOnly &&
      !["identity", "pcb-via-abort", "termination", "release"].includes(String(request["action"]))) { throw error("PCB_VIA_CLEANUP_ONLY"); }
    if (this.#purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE && this.#schematicDisplayCleanupOnly &&
      !["identity", "schematic-display-abort", "termination", "release"].includes(String(request["action"]))) { throw error("SCHEMATIC_DISPLAY_CLEANUP_ONLY"); }
    if (this.#componentAbortReservation !== null && !["identity", "component-abort", "termination", "release"].includes(String(request["action"]))) { throw error("COMPONENT_CLEANUP_ONLY"); }
    if (this.#pending !== null) { throw error("REQUEST_PENDING"); }
    if (this.#purpose === CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE) {
      const action = String(request["action"]);
      if (!["identity", "launch", "version", "targets", "send", "poll", "window", "normal-close", "termination", "release", "release-unlaunched",
        "no-process-proof", "release-no-process", "worker-startup-send", "worker-startup-parent", "worker-startup-reprove", "structure-worker-send",
        "structure-main-send", "main-attach", "main-reprove", "main-send", "main-poll", "main-close-detach"].includes(action)) { throw error("STRUCTURE_ACTION_PURPOSE"); }
      const cleanup = ["identity", "window", "normal-close", "termination", "release", "release-unlaunched", "no-process-proof", "release-no-process", "main-close-detach"].includes(action) ||
        ["Debugger.removeBreakpoint", "Debugger.resume", "Runtime.releaseObjectGroup"].includes(String(request["method"])) || action === "main-poll" && request["cleanup"] === true;
      const limits = CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE.controls;
      if (cleanup) { if (this.#structureCleanupControls >= limits.cleanup) { throw error("STRUCTURE_CLEANUP_CONTROL_BOUND"); } this.#structureCleanupControls += 1; }
      else { if (this.#structureNormalControls >= limits.normal) { throw error("STRUCTURE_NORMAL_CONTROL_BOUND"); } this.#structureNormalControls += 1; }
    } else if (request["action"] === "structure-main-send" || request["action"] === "structure-worker-send") { throw error("STRUCTURE_ACTION_PURPOSE"); }
    if (this.#purpose === "footprint-head-age209") {
      const action = String(request["action"]), cleanup = ["identity", "window", "normal-close", "termination", "release", "release-unlaunched", "release-no-process", "no-process-proof", "head-age-abort", "main-close-detach"].includes(action) || action === "main-poll" && request["cleanup"] === true || action === "main-send" && ["release", "remove", "resume"].includes(String(request["phase"]));
      if (!["identity", "launch", "window", "normal-close", "termination", "release", "release-unlaunched", "release-no-process", "no-process-proof", "main-attach", "main-reprove", "main-send", "main-poll", "main-close-detach", "head-age-main", "head-age-abort"].includes(action) || this.#headAgeAbortAttempted && !["identity", "termination", "release", "head-age-abort"].includes(action)) { throw error("HEAD_AGE_ACTION_PURPOSE"); }
      if (cleanup) { if (this.#headAgeCleanupControls >= CURRENT_FOOTPRINT_HEAD_AGE_NATIVE_LIMITS.cleanupControls) { throw error("HEAD_AGE_CLEANUP_CONTROL_BOUND"); } this.#headAgeCleanupControls += 1; }
      else { if (this.#headAgeNormalControls >= CURRENT_FOOTPRINT_HEAD_AGE_NATIVE_LIMITS.normalControls || this.#total > MAX_TOTAL - CURRENT_FOOTPRINT_HEAD_AGE_NATIVE_LIMITS.helperCleanupReserveBytes) { throw error("HEAD_AGE_NORMAL_CONTROL_BOUND"); } this.#headAgeNormalControls += 1; }
    }
    if (bornFootprintTransport(this.#purpose) && (!this.#combinedFactoryReady || this.#combinedReadyPacket === null || this.#combinedReadyAbandoned)) { throw error("COMBINED_READY_REQUIRED"); }

    if (this.#visualAbortAttempted && !["identity", "termination", "release", "terminate-visual"].includes(String(request["action"]))) { throw error("VISUAL_CLEANUP_ONLY"); }
    const rpcRetireAfterTermination = bornFootprintTransport(this.#purpose) &&
      (request["action"] === "footprint-clock-rpc-retire" || request["action"] === "main-completion-retire") &&
      this.#terminationObserved && this.#terminationObservation?.originalRootExited === true && this.#terminationObservation.originalJobEmpty === true;
    const combinedCleanup = combinedCleanupControl(request) || rpcRetireAfterTermination;
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
    if (this.#windowCapture209CleanupReserved &&
      !["identity", "window", "normal-close", "terminate-visual", "termination", "release"].includes(String(request["action"]))) {
      const nextReplyBytes = request["action"] === "capture-window" ? CURRENT_WINDOW_CAPTURE_TRANSPORT_RESERVATION.nativeCaptureReplyBytes : MAX_LINE;
      if (this.#total > MAX_TOTAL - CURRENT_WINDOW_CAPTURE_TRANSPORT_RESERVATION.cleanupReplyBytes - nextReplyBytes) {
        throw error("WINDOW_CAPTURE209_CLEANUP_RESERVE");
      }
    }
    let forward: Readonly<{ cleanup: boolean; waiting: boolean }> = { cleanup: false, waiting: false };
    if (heldCachePurpose(this.#purpose)) { forward = this.#heldSavedRequest(request); }
    else if (this.#forwardLedger !== null) { forward = this.#forwardRequest(request, forwardMain); }
    this.#windowCapture209Transport?.consume(request["action"] === "poll");
    const deferred = Promise.withResolvers<RecordValue>(), id = randomBytes(16).toString("hex");
    let forwardMainPoll: ForwardExecutionMainPoll | null = null;
    if (forwardMain?.retainChunk !== undefined) {
      this.#requireForwardExecutionMain(forwardMain.capability, forwardMain.runner, forwardMain.mode);
      requireOriginalCurrentFootprintForwardMainPollRetainer(forwardMain.runner, forwardMain.retainChunk);
      if (request["action"] !== "main-poll" || this.#forwardExecutionMainPoll !== null && !this.#forwardExecutionMainPoll.delivered) { throw error("FORWARD_EXECUTION_MAIN_POLL_UNSETTLED"); }
      forwardMainPoll = { id, runner: forwardMain.runner, retain: forwardMain.retainChunk, buffer: Buffer.alloc(0), complete: false, delivered: false, failure: null };
      this.#forwardExecutionMainPoll = forwardMainPoll;
    }
    const launch = request["action"] === "launch";
    const pending: Pending = { id, resolve: deferred.resolve, reject: deferred.reject, launch, windowAction: this.#purpose === "visual209" ? currentWindowFailureAction(request["action"]) : null, windowFailure: null, windowRestore: request["action"] === "restore-window-for-capture" && this.#purpose === "visual209", windowCapture: request["action"] === "capture-window" && this.#purpose === "visual209", windowResize: request["action"] === "resize-window-for-capture" && this.#purpose === "visual209", poll: request["action"] === "poll",
      mainAction: mainNativeActions.find(action => action === request["action"]) ?? null, combinedCleanup,
      forwardCleanup: forward.cleanup, forwardPollWaiting: forward.waiting, forwardMainPoll,
      send: request["action"] === "saved-cache-held" || request["action"] === "footprint-held-saved-worker" || request["action"] === "renderer-viewport-send" || request["action"] === "send" || request["action"] === "worker-startup-send" || request["action"] === "worker-startup-parent" ||
        request["action"] === "worker-startup-empty-common" || request["action"] === "worker-startup-empty-root" ||
        request["action"] === "worker-startup-ratline" || request["action"] === "worker-startup-ratline-continuation" || request["action"] === "main-send" || request["action"] === "main-request-send" || request["action"] === "structure-worker-send" || request["action"] === "structure-main-send" ||
        request["action"] === "footprint-clock-rpc-send" || request["action"] === "main-completion-send" || request["action"] === "head-age-main", written: false, reply: null,
      timer: setTimeout(() => { this.#fail("HELPER_DEADLINE"); }, 15_000) };
    this.#pending = pending;
    if (launch) { this.#launchRequestIssued = true; }
    try {
      let heldAccounting: RecordValue = {};
      if (heldCachePurpose(this.#purpose)) {
        if (request["action"] === "poll") { heldAccounting = { heldCleanup: forward.cleanup, heldWaiting: forward.waiting }; }
        else if (request["action"] === "worker-startup-reprove") { heldAccounting = { heldCleanup: forward.cleanup }; }
      }
      const data = `${JSON.stringify({ ...this.#binding, ...request, ...heldAccounting, id })}\n`;
      const combinedRequest = bornFootprintTransport(this.#purpose) &&
        (request["action"] === "main-request-send" || request["action"] === "footprint-clock-rpc-send" || request["action"] === "main-completion-send" || request["action"] === "structure-worker-send" || request["action"] === "structure-main-send");
      // Only already-owned Via body values receive the corresponding fixed
      // Body capacity. No expression or caller program is admitted here.
      const viaStructureEnrollment = this.#purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE && request["action"] === "pcb-via-structure-body-enroll" && this.#viaStructureBodyAttempted;
      const viaHistoryController = this.#purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE && request["action"] === "pcb-via-main-observe" && request["phase"] === "via-main-request-controller" && this.#viaMainBoundBody !== null && request["dataStr"] === this.#viaMainBoundBody.dataStr;
      const maximum = combinedRequest || viaStructureEnrollment || viaHistoryController || request["method"] === "Runtime.callFunctionOn" && (request["action"] === "worker-startup-parent" &&
        (request["parentPhase"] === "preflight" || request["parentPhase"] === "open-project" ||
          request["parentPhase"] === "pcb-preflight" || request["parentPhase"] === "pcb-open-document" || request["parentPhase"] === "pcb-observe") || request["action"] === "send" &&
        (request["openingPhase"] === "preflight" || request["openingPhase"] === "open-project" ||
          request["pcbOpeningPhase"] === "preflight" || request["pcbOpeningPhase"] === "open-document" ||
          request["pcbOpeningPhase"] === "observe" || this.#purpose === "visual209" && request["pcbVisual209Phase"] === "visual" || (this.#purpose === "diagnostic209" || this.#purpose === "visual209") &&
          ["pcbLayers209Phase", "pcbPrimitives209Phase", "pcbExtendedPrimitives209Phase", "pcbSelectionRelations209Phase",
            "pcbPadShapes209Phase", "pcbImageShapes209Phase", "pcbArcShapes209Phase", "pcbPouredShapes209Phase"]
            .some(key => request[key] === "observe"))) ? 32_768 : 4096;
      if (Buffer.byteLength(data) > maximum || (combinedRequest || request["pcbVisual209Phase"] === "visual") && data.length >= 32_768) { throw error("REQUEST_SIZE"); }
      this.#nativeStdinBytes += Buffer.byteLength(data);
      this.#child.stdin.write(data, cause => {
        if (cause !== null && cause !== undefined) { this.#fail("HELPER_WRITE"); }
        else if (this.#pending === pending) { pending.written = true; this.#settle(); }
      });
    } catch { this.#fail("HELPER_WRITE"); }
    return deferred.promise;
  }
  /** Settle only when the original stdin write completed and its admitted reply
   * arrived. Apply purpose-specific output accounting before resolution and retain
   * fixed native refusals for original cleanup; neither condition proves durability. */
  #settle(): void {
    const pending = this.#pending;
    if (pending !== null && pending.written && pending.reply !== null && this.#failure === null) {
      this.#pending = null; clearTimeout(pending.timer);
      const reply = pending.reply;
      const reject = (cause: Error): void => { pending.reject(pending.forwardMainPoll?.failure ?? cause); };
      if (this.#combinedOutputCleanupOnly && !pending.combinedCleanup) {
        reject(error("COMBINED_HELPER_NORMAL_BOUND")); return;
      }
      if (this.#forwardCleanupOnly && !pending.forwardCleanup && !pending.poll) {
        reject(error("FORWARD_CLEANUP_ONLY")); return;
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
        const nativeLabel = reply["error"];
        if (pending.windowAction !== null && typeof nativeLabel === "string") {
          const windowFailure = pending.windowFailure ?? currentWindowFailureLabelOnly(pending.windowAction, nativeLabel);
          if (windowFailure !== null) { this.#windowNativeFailure = windowFailure; }
        }
        reject(typeof nativeLabel === "string" ? issueCurrentPcbDiagnosticNativeRefusal(nativeLabel) : error("HELPER_REPLY"));
      }
      else if (record(reply["result"])) {
        let result = reply["result"];
        if (this.#forwardLedger !== null) {
          try { result = this.#forwardReply(result, pending); }
          catch (caughtError) {
            this.#forwardCleanupOnly = true;
            reject(caughtError instanceof Error ? caughtError : error("FORWARD_REPLY_ACCOUNTING")); return;
          }
        }
        if (this.#heldSavedLedger !== null) {
          try { result = this.#heldSavedReply(result, pending); }
          catch (caughtError) {
            this.#heldSavedFailed = true;
            reject(caughtError instanceof Error ? caughtError : error("HELD_SAVED_REPLY_ACCOUNTING")); return;
          }
        }
        const bytes = result["bytes"];
        const ratlineBudget = this.#continuationBudget ?? this.#ratlineBudget;
        if (ratlineBudget !== null && pending.poll) {
          if (typeof bytes !== "string" || !exact(result, ["bytes"])) { reject(error("RATLINE_PIPE_CHUNK")); return; }
          const decoded = Buffer.from(bytes, "base64");
          if (decoded.length > 65_536 || decoded.toString("base64") !== bytes) { this.#fail("RATLINE_PIPE_CHUNK"); reject(error("RATLINE_PIPE_CHUNK")); return; }
          try { ratlineBudget.consumePipeBytes(decoded.length); }
          catch (budgetError) { reject(budgetError instanceof Error ? budgetError : new Error("PCB_DIAGNOSTIC_OWNER_RATLINE_PIPE_BUDGET", { cause: budgetError })); return; }
        }
        if (pending.forwardMainPoll?.failure !== null && pending.forwardMainPoll?.failure !== undefined) { reject(pending.forwardMainPoll.failure); }
        else { pending.resolve(result); }
      }
      else { reject(error("HELPER_REPLY")); }
    }
  }
  #fail(reason: string): void {
    this.#failure ??= reason; this.#buffer = Buffer.alloc(0);
    if (bornFootprintTransport(this.#purpose) && this.#combinedReadyPacket === null) {
      this.#combinedReadyAbandoned = true; this.#combinedReady.reject(error(this.#failure ?? reason));
    }

    const pending = this.#pending; this.#pending = null;
    if (pending !== null) { clearTimeout(pending.timer); pending.reject(pending.forwardMainPoll?.failure ?? error(this.#failure)); }
    // Do not end, destroy, signal, unref or detach this original helper.
  }
  readonly #data = (chunk: unknown): void => {
    this.#retainForwardExecutionMainPollChunk(chunk);
    if (this.#failure !== null) { return; }
    let maximum = MAX_TOTAL;
    if (heldCachePurpose(this.#purpose)) { maximum = CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY.helperStdoutBytes; }
    if (this.#purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE) { maximum = CURRENT_FOOTPRINT_COMBINED_PROFILE.helperStdout.totalBytes; }
    if (forwardBirthPurpose(this.#purpose)) { maximum = this.#forwardCapacity().writer.helperStdoutBytes; }
    if (this.#purpose === "worker-startup-empty209") { maximum = CURRENT_PCB_209_EMPTY_NATIVE_PROFILE.bytes.helperStdout; }
    if (this.#ratlineBudget !== null) { maximum = CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.bytes.helperStdout; }
    if (this.#continuationBudget !== null) { maximum = CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE.bytes.helperStdout; }
    const lineMaximum = this.#pending?.windowCapture === true ? CURRENT_WINDOW_CAPTURE_LIMITS.maximumReplyBytes + 128 : MAX_LINE;
    if (!Buffer.isBuffer(chunk) || chunk.length > lineMaximum || this.#total + chunk.length > maximum || this.#buffer.length + chunk.length > lineMaximum) { this.#fail("HELPER_BOUND"); return; }
    if (this.#purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE && this.#total + chunk.length > CURRENT_FOOTPRINT_COMBINED_PROFILE.helperStdout.normalBytes) {
      this.#combinedOutputCleanupOnly = true;
    }
    if (bornFootprintTransport(this.#purpose) && this.#combinedReadyPacket === null &&
      this.#buffer.length + chunk.length > CURRENT_FOOTPRINT_COMBINED_READY.maximumBytes) { this.#fail("COMBINED_READY_BOUND"); return; }
    if (this.#forwardLedger !== null) {
      try {
        const { ledger, methods, role } = this.#forwardResources();
        methods.consumeBytes.call(ledger, role, this, "helper-stdout", chunk.length);
      } catch { this.#fail("FORWARD_HELPER_STDOUT"); return; }
      const limits = this.#forwardRole === "forward-writer" ? this.#forwardCapacity().controls.writer : CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.controls.saved;
      const reserve = limits.cleanup * CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.controls.replyHeaderBytes + MAX_LINE;
      const ceiling = this.#forwardRole === "forward-writer" ? this.#forwardCapacity().writer.helperStdoutBytes :
        Math.min(MAX_TOTAL, CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.saved.helperStdoutBytes);
      if (this.#total + chunk.length > ceiling - reserve) { this.#forwardCleanupOnly = true; }
    }
    if (this.#heldSavedLedger !== null) {
      try {
        const { ledger, methods } = this.#heldSavedResources();
        methods.consumeBytes.call(ledger, this, "helper-stdout", chunk.length, this.#heldSavedReadCleanup);
      } catch { this.#fail("HELD_SAVED_HELPER_STDOUT"); return; }
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
      if (bornFootprintTransport(this.#purpose) && this.#combinedReadyPacket === null) {
        if (this.#combinedReadyAbandoned || this.#nativeStdinBytes !== 0 || this.#launchMethodInvoked || this.#buffer.length > CURRENT_FOOTPRINT_COMBINED_READY.maximumBytes) {
          this.#fail("COMBINED_READY_PACKET"); return;
        }
        const ready = decodeCurrentFootprintCombinedReady(raw);
        if (ready.challenge !== this.#combinedReadyChallenge) { this.#fail("COMBINED_READY_CHALLENGE"); return; }
        this.#buffer = Buffer.alloc(0); this.#combinedReadyPacket = ready; this.#combinedReady.resolve(ready); return;
      }
      const pending = this.#pending;
      if (!record(raw) || pending === null || pending.reply !== null || raw["id"] !== pending.id ||
          (raw["ok"] === true ? !exact(raw, ["id", "ok", "result"]) || !record(raw["result"]) :
            raw["ok"] !== false || !exact(raw, Object.hasOwn(raw, "windowFailure") ? ["id", "ok", "error", "windowFailure"] : ["id", "ok", "error"]) || typeof raw["error"] !== "string" || !/^pcb-diagnostic-[a-z-]{1,80}$/u.test(raw["error"]))) { this.#fail("HELPER_REPLY"); return; }
      if (Object.hasOwn(raw, "windowFailure")) {
        if (raw["ok"] !== false || pending.windowAction === null || typeof raw["error"] !== "string") { this.#fail("HELPER_REPLY"); return; }
        pending.windowFailure = decodeCurrentWindowFailure(raw["windowFailure"], pending.windowAction, raw["error"]);
      } else if (raw["ok"] === false && pending.windowAction !== null && typeof raw["error"] === "string") {
        pending.windowFailure = currentWindowFailureLabelOnly(pending.windowAction, raw["error"]);
      }
      // Retain admitted evidence before narrower budgets or a late native write
      // Callback can reject/clear pending. This snapshot grants no retry.
      if (pending.windowFailure !== null) { this.#windowNativeFailure = pending.windowFailure; }
      try {
        const pollReplyKind = pending.poll && raw["ok"] === true ? "poll" : "control";
        const resizeKind = pending.windowResize ? "resize" : pollReplyKind;
        const largeKind = pending.windowRestore ? "restore" : resizeKind;
        const kind = pending.windowCapture ? "image" : largeKind;
        const result = record(raw["result"]) ? raw["result"] : {};
        this.#windowCapture209Transport?.observeReply(kind, newline + 1, result);
      } catch (budgetError) {
        // A complete, bounded response exceeded this capture's narrower budget.
        // Settle only its request; retain native close/abort/termination/release.
        this.#buffer = Buffer.alloc(0); this.#pending = null; clearTimeout(pending.timer);
        pending.reject(budgetError instanceof Error ? budgetError : error("WINDOW_CAPTURE209_HELPER_ENVELOPE")); return;
      }
      this.#buffer = Buffer.alloc(0); pending.reply = raw; this.#settle();
    } catch { this.#fail("HELPER_FRAMING"); }
  };
  readonly #stderr = (chunk: unknown): void => {
    if (Buffer.isBuffer(chunk)) {
      const remaining = CURRENT_FOOTPRINT_COMBINED_READY.stderrBytes - this.#stderrBytes;
      const selected = chunk.subarray(0, remaining); this.#stderrHash.update(selected); this.#stderrBytes += selected.length;
      if (chunk.length > remaining) { this.#stderrTruncated = true; }
    } else { this.#stderrTruncated = true; }
    this.#fail("HELPER_STDERR");
  };
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

/** Distinct birth purpose for disposable selection and camera changes. */
export class CurrentPcb209VisualOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve()) {
    super(child, verify, installation, verifyInstallation, "visual209");
  }
}

/** Separate launch-sealed 209 navigation and layer metadata owner. */
export class CurrentPcb209DiagnosticOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(), generatedFixtureBirth = false) {
    super(child, verify, installation, verifyInstallation, "diagnostic209", verifyInstallation, null, null, null, null, null, null, generatedFixtureBirth);
  }
}

/** Distinct fresh schematic generation. It retains its own checkpoint and
 * original main inspector before any project source can be opened. */
export class CurrentSchematicDisplayWriteOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>, installation: CurrentPcbDiagnosticInstallation, verifyInstallation: () => Promise<void>) {
    super(child, verify, installation, verifyInstallation, CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE);
  }
}

/** Fresh generated-fixture Via generation. No existing diagnostic owner can
 * acquire this purpose or its early original-main inspector. */
export class CurrentPcbViaWriteOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>, installation: CurrentPcbDiagnosticInstallation,
    verifyInstallation: () => Promise<void>) {
    super(child, verify, installation, verifyInstallation, CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE, verifyInstallation, null, null, null, null, null, null, true);
  }
}

/** Separate fresh spatial birth. Its fixed larger qualification budget is
 * Unavailable to existing diagnostic, visual, model and writer owners.
 */
export class CurrentPcbSpatialOwner extends CurrentPcbRetainedOwnerCore {
  /** Select the spatial transport at construction; no existing owner is upgraded. */
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(), generatedFixtureBirth = false) {
    super(child, verify, installation, verifyInstallation, "pcb-spatial209", verifyInstallation, null, null, null, null, null, null, generatedFixtureBirth);
  }
}

/** Separate Component birth; no Layers/old spatial/writer purpose flags. */
export class CurrentPcbComponentSpatialOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>, prepared: GeneratedComponentFixtureOpenCheckpoint,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve()) {
    assertOriginalGeneratedComponentFixtureOpenCheckpoint(prepared);
    super(child, verify, installation, verifyInstallation, "pcb-component-spatial209", verifyInstallation, null, null, null, null, null, null, true, prepared);
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

/** Read-only closed-head/native-Date birth. Only the genuine factory below
 * registers its original binding; constructor seams cannot issue observations. */
export class CurrentFootprintHeadAgeValidationOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification, installation: CurrentPcbDiagnosticInstallation | null = null,
    verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(), verifyFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, "footprint-head-age209", verifyFacade, actorClockSource);
  }
}
const headAgeValidationOwnerDescriptors = Object.getOwnPropertyDescriptors(CurrentFootprintHeadAgeValidationOwner.prototype);

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
    verifyStartupFacade: () => Promise<void> = verifyInstallation, readyChallenge = randomBytes(16).toString("hex")) {
    super(child, verify, installation, verifyInstallation, CURRENT_FOOTPRINT_COMBINED_PURPOSE, verifyStartupFacade, actorClockSource, null, null, null, readyChallenge);
  }
}
/** Dedicated observer allocation. It cannot issue any footprint writer or
 * Combined capability and is never inferred from a later source snapshot. */
export class CurrentProjectStructureNativeOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification, installation: CurrentPcbDiagnosticInstallation | null = null,
    verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(), verifyStartupFacade: () => Promise<void> = verifyInstallation,
    readyChallenge = randomBytes(16).toString("hex")) {
    super(child, verify, installation, verifyInstallation, CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE, verifyStartupFacade, actorClockSource, null, null, null, readyChallenge);
  }
}
const structureOwnerDescriptors = Object.getOwnPropertyDescriptors(CurrentProjectStructureNativeOwner.prototype);

/** Born forward observation purpose. Its private original ledger starts before
 * helper output, and its helper rejects create/clock/completion commands. */
export class CurrentFootprintCopyForwardNativeOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation, readyChallenge = randomBytes(16).toString("hex")) {
    super(child, verify, installation, verifyInstallation, CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE, verifyStartupFacade, actorClockSource, null, null, null, readyChallenge);
  }
}

/** Separately allocated writer-v2 birth. Its original channel has fixed
 * allocation/create roles; fresh v2 qualification and full writer reservation
 * remain required before any execution action or public mount can exist. */
export class CurrentFootprintForwardExecutionNativeOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation, readyChallenge = randomBytes(16).toString("hex")) {
    super(child, verify, installation, verifyInstallation, CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE, verifyStartupFacade, actorClockSource, null, null, null, readyChallenge);
  }
}
const forwardExecutionOwnerDescriptors = Object.getOwnPropertyDescriptors(CurrentFootprintForwardExecutionNativeOwner.prototype);

/** Distinct read-only fresh generation. It cannot dispatch native create or
 * transaction clocks and cannot inherit a writer's process/Job handles. */
export class CurrentFootprintCopyHeldSavedNativeOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, CURRENT_FOOTPRINT_COPY_HELD_SAVED_PROFILE.purpose, verifyStartupFacade, actorClockSource);
  }
}
/** Separate read-only qualification birth. No copy/saved factory, worker
 * bootstrap, main transport or actor-clock capability is installed here. */
export class CurrentFootprintHeldCacheValidationOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_PROFILE.purpose, verifyFacade);
  }
}
const heldCacheValidationOwnerDescriptors = Object.getOwnPropertyDescriptors(CurrentFootprintHeldCacheValidationOwner.prototype);
export class CurrentFootprintCopySavedNativeOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, "worker-startup-footprint-saved209", verifyStartupFacade, actorClockSource);
  }
}
/** Fresh read-only second generation with the original forward ledger. The
 * private handoff is required even by constructor seams; it is not saved-copy
 * evidence and cannot open a project through the copy-specific saved path. */
export class CurrentFootprintCopyForwardSavedNativeOwner extends CurrentPcbRetainedOwnerCore {
  public constructor(child: ChildProcessWithoutNullStreams, verify: () => Promise<void>,
    actorClockSource: CurrentPcb209ActorClockSourceQualification, forwardSavedHandoff: object,
    installation: CurrentPcbDiagnosticInstallation | null = null, verifyInstallation: () => Promise<void> = (): Promise<void> => Promise.resolve(),
    verifyStartupFacade: () => Promise<void> = verifyInstallation) {
    super(child, verify, installation, verifyInstallation, "worker-startup-footprint-saved209", verifyStartupFacade, actorClockSource, null, null, null, null, forwardSavedHandoff);
  }
}
/* oxlint-disable typescript/unbound-method -- Original private-field receiver is explicitly supplied; these exported checks reject prototype and instance substitution. */
const schematicDisplayOwnerDescriptors = Object.getOwnPropertyDescriptors(CurrentSchematicDisplayWriteOwner.prototype);
const viaOwnerDescriptors = Object.getOwnPropertyDescriptors(CurrentPcbViaWriteOwner.prototype);
const footprintCoreDescriptors = Object.getOwnPropertyDescriptors(CurrentPcbRetainedOwnerCore.prototype);
const footprintOwnerDescriptors = new Map<object, PropertyDescriptorMap>([
  [CurrentFootprintCopyNativeOwner.prototype, Object.getOwnPropertyDescriptors(CurrentFootprintCopyNativeOwner.prototype)],
  [CurrentFootprintCopyForwardNativeOwner.prototype, Object.getOwnPropertyDescriptors(CurrentFootprintCopyForwardNativeOwner.prototype)],
  [CurrentFootprintCopySavedNativeOwner.prototype, Object.getOwnPropertyDescriptors(CurrentFootprintCopySavedNativeOwner.prototype)],
  [CurrentFootprintCopyHeldSavedNativeOwner.prototype, Object.getOwnPropertyDescriptors(CurrentFootprintCopyHeldSavedNativeOwner.prototype)],
  [CurrentFootprintCopyForwardSavedNativeOwner.prototype, Object.getOwnPropertyDescriptors(CurrentFootprintCopyForwardSavedNativeOwner.prototype)],
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
  requireTermination: CurrentPcbRetainedOwnerCore.prototype.requireFootprintTermination,
  forwardExecutionTarget: CurrentPcbRetainedOwnerCore.prototype.originalFootprintForwardExecutionTarget,
  forwardExecutionTermination: CurrentPcbRetainedOwnerCore.prototype.originalFootprintForwardExecutionTermination,
  requireForwardExecutionTermination: CurrentPcbRetainedOwnerCore.prototype.requireFootprintForwardExecutionTermination });
const pcbViaOwnershipMethods = Object.freeze({ closedEffects: CurrentPcbRetainedOwnerCore.prototype.originalViaWriteClosedEffects, termination: CurrentPcbRetainedOwnerCore.prototype.originalViaWriteTermination,
  requireTermination: CurrentPcbRetainedOwnerCore.prototype.requireViaWriteTermination });
const schematicDisplayOwnershipMethods = Object.freeze({ termination: CurrentPcbRetainedOwnerCore.prototype.originalSchematicDisplayTermination,
  requireTermination: CurrentPcbRetainedOwnerCore.prototype.requireSchematicDisplayTermination });
const combinedOwnershipMethods = Object.freeze({ generation: CurrentPcbRetainedOwnerCore.prototype.requireOriginalFootprintCombinedGeneration,
  require: CurrentPcbRetainedOwnerCore.prototype.requireOriginalCombinedMainRunner,
  send: CurrentPcbRetainedOwnerCore.prototype.sendFootprintMain,
  completionCapacity: CurrentPcbRetainedOwnerCore.prototype.assertFootprintMainCompletionCapacity,
  completionBegin: CurrentPcbRetainedOwnerCore.prototype.beginFootprintMainCompletion,
  completionSend: CurrentPcbRetainedOwnerCore.prototype.sendFootprintMainCompletion,
  completionRetire: CurrentPcbRetainedOwnerCore.prototype.retireFootprintMainCompletion,
  completionFail: CurrentPcbRetainedOwnerCore.prototype.failFootprintMainCompletion });
const combinedOwnerDescriptors = Object.getOwnPropertyDescriptors(CurrentFootprintCombinedNativeOwner.prototype);
/* oxlint-enable typescript/unbound-method */
export function assertOriginalCurrentFootprintCombinedNativeOwner(owner: CurrentFootprintCombinedNativeOwner): void {
  if (types.isProxy(owner) || Object.getPrototypeOf(owner) !== CurrentFootprintCombinedNativeOwner.prototype ||
    Reflect.ownKeys(owner).length > 0 || !originalFootprintDescriptors(CurrentFootprintCombinedNativeOwner.prototype, combinedOwnerDescriptors) ||
    Object.getPrototypeOf(CurrentFootprintCombinedNativeOwner.prototype) !== CurrentPcbRetainedOwnerCore.prototype ||
    !originalFootprintDescriptors(CurrentPcbRetainedOwnerCore.prototype, footprintCoreDescriptors)) { throw error("COMBINED_ORIGINAL_OWNER"); }
  combinedOwnershipMethods.generation.call(owner);
}
export function currentFootprintCombinedFactoryFailureDiagnostics(failure: unknown, expectedOptions: CurrentPcbDiagnosticInstallationOptions): CurrentFootprintCombinedFactoryFailureDiagnostics | null {
  if (failure === null || typeof failure !== "object" || types.isProxy(failure)) { return null; }
  const held = combinedFactoryFailures.get(failure);
  if (held === undefined || held.options !== expectedOptions) { return null; }
  assertOriginalCurrentFootprintCombinedNativeOwner(held.owner); return held.owner.combinedFactoryFailureDiagnostics();
}
export function requireCurrentFootprintCombinedUnlaunchedFactoryFailure(failure: unknown, expectedOptions: CurrentPcbDiagnosticInstallationOptions): CurrentFootprintCombinedBeforeLaunchFailureProof | null {
  const diagnostics = currentFootprintCombinedFactoryFailureDiagnostics(failure, expectedOptions);
  if (diagnostics === null || !diagnostics.helperClosed || diagnostics.launchInvoked || diagnostics.stdinBytesWritten !== 0) { return null; }
  if (failure === null || typeof failure !== "object") { return null; }
  const held = combinedFactoryFailures.get(failure); if (held === undefined) { return null; }
  held.proof ??= Object.freeze({ profile: "private.current-footprint-combined-before-launch-failure.v1", helperTransportClosed: true,
    launchRequestWritten: false, applicationLaunchDispatched: false, terminationProved: false });
  return held.proof;
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
/** Original factory lookup plus unmodified private-field prototypes. Neither a
 * caller object, subclass nor overridden instance method can issue this lane. */
function originalStructureOwner(owner: unknown): CurrentProjectStructureNativeOwner {
  if (owner === null || typeof owner !== "object" || types.isProxy(owner) || !structureFactories.has(owner) ||
    Object.getPrototypeOf(owner) !== CurrentProjectStructureNativeOwner.prototype || Reflect.ownKeys(owner).length > 0 ||
    !originalFootprintDescriptors(CurrentProjectStructureNativeOwner.prototype, structureOwnerDescriptors) ||
    Object.getPrototypeOf(CurrentProjectStructureNativeOwner.prototype) !== CurrentPcbRetainedOwnerCore.prototype ||
    !originalFootprintDescriptors(CurrentPcbRetainedOwnerCore.prototype, footprintCoreDescriptors) || !(owner instanceof CurrentProjectStructureNativeOwner)) {
    throw error("STRUCTURE_NATIVE_OWNER");
  }
  return owner;
}
export function requireOriginalProjectStructureObservationInput(owner: CurrentProjectStructureNativeOwner,
  lease: CurrentProjectStructureWorkerLease, cleanup = false): ReturnType<CurrentProjectStructureNativeOwner["structureObservationInput"]> {
  return CurrentPcbRetainedOwnerCore.prototype.structureObservationInput.call(originalStructureOwner(owner), lease, cleanup);
}
/** A rejected readiness wait retains its actual original child and zero-input
 * closure outcome. Matching diagnostics cannot adopt another helper. */
export function currentProjectStructureFactoryFailureDiagnostics(failure: unknown,
  options: CurrentPcbDiagnosticInstallationOptions): CurrentFootprintCombinedFactoryFailureDiagnostics | null {
  if (failure === null || typeof failure !== "object" || types.isProxy(failure)) { return null; }
  const held = structureFactoryFailures.get(failure); if (held === undefined || held.options !== options) { return null; }
  return CurrentPcbRetainedOwnerCore.prototype.combinedFactoryFailureDiagnostics.call(originalStructureOwner(held.owner));
}
export function isCurrentProjectStructureMainCapability(value: unknown): value is CurrentProjectStructureMainCapability {
  return value !== null && typeof value === "object" && !types.isProxy(value) && structureCapabilities.has(value);
}
function originalStructureCapability(capability: CurrentProjectStructureMainCapability, runner: CurrentFootprintCopyMainBackendRunner,
  mode: "normal" | "cleanup" | "exited"): CurrentPcbRetainedOwnerCore {
  const owner = structureCapabilities.get(capability); if (owner === undefined) { throw error("STRUCTURE_MAIN_CAPABILITY"); }
  const original = originalStructureOwner(owner);
  CurrentPcbRetainedOwnerCore.prototype.requireOriginalProjectStructureMainRunner.call(original, runner, mode); return original;
}
export function requireCurrentProjectStructureMainCapability(capability: CurrentProjectStructureMainCapability, runner: CurrentFootprintCopyMainBackendRunner): void {
  originalStructureCapability(capability, runner, "normal");
}
export function requireCurrentProjectStructureMainCleanup(capability: CurrentProjectStructureMainCapability, runner: CurrentFootprintCopyMainBackendRunner): void {
  originalStructureCapability(capability, runner, "cleanup");
}
export function currentProjectStructureMainGenerationExited(capability: CurrentProjectStructureMainCapability, runner: CurrentFootprintCopyMainBackendRunner): boolean {
  return CurrentPcbRetainedOwnerCore.prototype.requireOriginalProjectStructureMainRunner.call(originalStructureCapability(capability, runner, "exited"), runner, "exited");
}
export async function sendCurrentProjectStructureMainCommand(capability: CurrentProjectStructureMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, command: CurrentProjectStructureMainCommand, id: number): Promise<void> {
  const mode = ["structure-main-remove", "structure-main-resume", "structure-main-release"].includes(command.phase) ? "cleanup" : "normal";
  const owner = originalStructureCapability(capability, runner, mode);
  await CurrentPcbRetainedOwnerCore.prototype.sendProjectStructureMain.call(owner, command, id); originalStructureCapability(capability, runner, mode);
}
/** Original cross-process identity only. It reserves no writer/native budget
 * and cannot upgrade a validation generation or mint a new clock origin. */
export function requireCurrentFootprintCombinedPairedSchedule(capability: CurrentFootprintCombinedMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, clock: CurrentFootprintCopyClockRpcOrigin): void {
  const owner = originalCombinedCapabilityOwner(capability, runner, "normal");
  if (footprintClockRpcOwners.get(clock) !== owner || !footprintClockRpcOrigins.has(clock)) { throw error("FOOTPRINT_PAIRED_ORIGINAL_OWNER"); }
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
  runner: CurrentFootprintCopyMainBackendRunner, command: CurrentFootprintCopyMainRequestCollectCommand | CurrentProjectStructureMainCommand, id: number): Promise<void> {
  const owner = originalCombinedCapabilityOwner(capability, runner, "normal");
  await combinedOwnershipMethods.send.call(owner, command, id);
  originalCombinedCapabilityOwner(capability, runner, "normal");
}
export function assertCurrentFootprintCombinedMainCompletionCapacity(capability: CurrentFootprintCombinedMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, firstRequestId: number): void {
  const owner = originalCombinedCapabilityOwner(capability, runner, "normal");
  combinedOwnershipMethods.completionCapacity.call(owner, firstRequestId);
}
export async function beginCurrentFootprintCombinedMainCompletion(capability: CurrentFootprintCombinedMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, firstRequestId: number): Promise<void> {
  const owner = originalCombinedCapabilityOwner(capability, runner, "normal");
  await combinedOwnershipMethods.completionBegin.call(owner, firstRequestId);
  originalCombinedCapabilityOwner(capability, runner, "normal");
}
export async function sendCurrentFootprintCombinedMainCompletion(capability: CurrentFootprintCombinedMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, command: CurrentFootprintCopyMainCompletionCommand, id: number): Promise<void> {
  const owner = originalCombinedCapabilityOwner(capability, runner, "normal");
  await combinedOwnershipMethods.completionSend.call(owner, command, id);
  originalCombinedCapabilityOwner(capability, runner, "normal");
}
export async function retireCurrentFootprintCombinedMainCompletion(capability: CurrentFootprintCombinedMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): Promise<void> {
  const owner = originalCombinedCapabilityOwner(capability, runner, "cleanup");
  await combinedOwnershipMethods.completionRetire.call(owner);
  originalCombinedCapabilityOwner(capability, runner, "cleanup");
}
export function failCurrentFootprintCombinedMainCompletion(capability: CurrentFootprintCombinedMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): void {
  try {
    const owner = originalCombinedCapabilityOwner(capability, runner, "cleanup");
    combinedOwnershipMethods.completionFail.call(owner);
  } catch {
    // Revocation never masks the primary failure. A foreign, released or
    // Substituted capability cannot acquire normal authority from this sink.
  }
}
export function assertOriginalCurrentFootprintCopyNativeOwner(owner: CurrentFootprintCopyGenerationOwner): void {
  if (types.isProxy(owner)) { throw error("FOOTPRINT_ORIGINAL_OWNER"); }
  const proto: unknown = Object.getPrototypeOf(owner);
  if (proto !== CurrentFootprintCopyNativeOwner.prototype && proto !== CurrentFootprintCopySavedNativeOwner.prototype && proto !== CurrentFootprintCopyHeldSavedNativeOwner.prototype && proto !== CurrentFootprintCopyForwardNativeOwner.prototype && proto !== CurrentFootprintCopyForwardSavedNativeOwner.prototype) { throw error("FOOTPRINT_ORIGINAL_OWNER"); }
  const descriptors = footprintOwnerDescriptors.get(proto);
  if (descriptors === undefined || !originalFootprintDescriptors(proto, descriptors) ||
    Object.getPrototypeOf(proto) !== CurrentPcbRetainedOwnerCore.prototype || Reflect.ownKeys(owner).length > 0 ||
    !originalFootprintDescriptors(CurrentPcbRetainedOwnerCore.prototype, footprintCoreDescriptors) ||
    owner.requireOriginalFootprintGeneration !== footprintOwnershipMethods.assert ||
    owner.originalFootprintSourceBinding !== footprintOwnershipMethods.target || owner.originalFootprintTermination !== footprintOwnershipMethods.termination ||
    owner.requireFootprintTermination !== footprintOwnershipMethods.requireTermination) { throw error("FOOTPRINT_ORIGINAL_OWNER"); }
  footprintOwnershipMethods.assert.call(owner);
}
/** Normal access proves the original input owners remain available. Retained
 * access after cleanup returns only historical references, never a send lease. */
export function requireCurrentFootprintForwardExecutionInputs(owner: CurrentFootprintCopyForwardNativeOwner,
  origin: CurrentFootprintForwardExecutionInputOrigin, mode: "normal" | "retained" = "normal"): CurrentFootprintForwardExecutionInputs {
  assertOriginalCurrentFootprintCopyForwardNativeOwner(owner);
  if (origin === null || typeof origin !== "object" || types.isProxy(origin)) { throw error("FORWARD_EXECUTION_INPUTS_ORIGINAL"); }
  const held = forwardExecutionInputOrigins.get(origin);
  if (held === undefined || held.owner !== owner) { throw error("FORWARD_EXECUTION_INPUTS_ORIGINAL"); }
  return held.requireInputs(mode);
}
export function assertOriginalCurrentFootprintCopyForwardNativeOwner(owner: CurrentFootprintCopyForwardNativeOwner): void {
  if (types.isProxy(owner) || Object.getPrototypeOf(owner) !== CurrentFootprintCopyForwardNativeOwner.prototype ||
    !footprintForwardFactories.has(owner)) { throw error("FORWARD_ORIGINAL_OWNER"); }
  assertOriginalCurrentFootprintCopyNativeOwner(owner);
}
/** Require this exact separately allocated writer-v2 birth. Read-only v1 and
 * Combined owners, matching descriptors and constructor seams cannot pass. */
export function assertOriginalCurrentFootprintForwardExecutionNativeOwner(owner: CurrentFootprintForwardExecutionNativeOwner): void {
  if (owner === null || typeof owner !== "object" || types.isProxy(owner) || Object.getPrototypeOf(owner) !== CurrentFootprintForwardExecutionNativeOwner.prototype ||
    Reflect.ownKeys(owner).length > 0 || !originalFootprintDescriptors(CurrentFootprintForwardExecutionNativeOwner.prototype, forwardExecutionOwnerDescriptors) ||
    Object.getPrototypeOf(CurrentFootprintForwardExecutionNativeOwner.prototype) !== CurrentPcbRetainedOwnerCore.prototype ||
    !originalFootprintDescriptors(CurrentPcbRetainedOwnerCore.prototype, footprintCoreDescriptors) || !footprintForwardExecutionFactories.has(owner)) {
    throw error("FORWARD_EXECUTION_ORIGINAL_BIRTH");
  }
}
/** Preserve the actual original failed birth for cleanup and diagnostics. This
 * getter never adopts a helper from a serialized error, PID or options clone. */
export function currentFootprintForwardExecutionBirthFailureDiagnostics(failure: unknown,
  expectedOptions: CurrentPcbDiagnosticInstallationOptions): CurrentFootprintCombinedFactoryFailureDiagnostics | null {
  if (failure === null || typeof failure !== "object" || types.isProxy(failure)) { return null; }
  const held = forwardExecutionFactoryFailures.get(failure);
  if (held === undefined || held.options !== expectedOptions) { return null; }
  assertOriginalCurrentFootprintForwardExecutionNativeOwner(held.owner); return held.owner.combinedFactoryFailureDiagnostics();
}
/** Validate immutable own-data options before consuming an allocation attempt.
 * The existing installation verifier still owns all path/hash/runtime rules. */
function requireForwardExecutionBirthOptions(options: CurrentPcbDiagnosticInstallationOptions): void {
  if (options === null || typeof options !== "object" || types.isProxy(options) || !Object.isFrozen(options) || Object.getPrototypeOf(options) !== Object.prototype) {
    throw error("FORWARD_EXECUTION_BIRTH_OPTIONS");
  }
  const allowed = new Set(["pluginRoot", "assetsRoot", "powershellSha256", "powershellBytes", "wslDistribution"]);
  if (!["pluginRoot", "assetsRoot", "powershellSha256", "powershellBytes"].every(key => Object.hasOwn(options, key))) { throw error("FORWARD_EXECUTION_BIRTH_OPTIONS"); }
  for (const key of Reflect.ownKeys(options)) {
    const descriptor = Object.getOwnPropertyDescriptor(options, key);
    if (typeof key !== "string" || !allowed.has(key) || descriptor === undefined || !Object.hasOwn(descriptor, "value") ||
      (key === "powershellBytes" ? typeof descriptor.value !== "number" : typeof descriptor.value !== "string")) { throw error("FORWARD_EXECUTION_BIRTH_OPTIONS"); }
  }
}
/** Return only the original input reference's attempt, including an owner
 * retained before a listener/ready failure. Unknown spawn is never no-resource. */
export function currentFootprintForwardExecutionBirthAllocationOutcome(options: CurrentPcbDiagnosticInstallationOptions): Readonly<{
  state: "not-attempted" | "pending" | "no-resource" | "unresolved"; owner: null;
}> | Readonly<{ state: "retained"; owner: CurrentFootprintForwardExecutionNativeOwner }> | Readonly<{
  state: "retained-before-owner" | "closed-before-owner"; owner: null;
  helperClosed: boolean; eofAttempted: boolean; helperExitCode: number | null; helperExitSignal: NodeJS.Signals | null;
}> {
  requireForwardExecutionBirthOptions(options);
  const allocation = forwardExecutionBirthAllocations.get(options);
  if (allocation === undefined) { return Object.freeze({ state: "not-attempted", owner: null }); }
  if (allocation.owner !== null) {
    assertOriginalCurrentFootprintForwardExecutionNativeOwner(allocation.owner);
    return Object.freeze({ state: "retained", owner: allocation.owner });
  }
  if (allocation.child !== null) {
    const observation = allocation.child.observation;
    return Object.freeze({ state: observation.closed ? "closed-before-owner" : "retained-before-owner", owner: null,
      helperClosed: observation.closed, eofAttempted: allocation.eofAttempted, helperExitCode: observation.code, helperExitSignal: observation.signal });
  }
  return Object.freeze({ state: allocation.state === "retained" ? "unresolved" : allocation.state, owner: null });
}

/** Retain the actual child before owner construction can throw. This is not an
 * adopted owner: no request has entered stdin, and close is observed directly. */
function retainForwardExecutionBirthChild(allocation: ForwardExecutionBirthAllocation | PcbViaWriteAllocation, child: ChildProcessWithoutNullStreams): void {
  if (allocation.state !== "unresolved" || allocation.owner !== null || allocation.child !== null) { throw error("FORWARD_EXECUTION_CHILD_CUSTODY"); }
  const closed = Promise.withResolvers<true>();
  const observation = { closed: false, code: null as number | null, signal: null as NodeJS.Signals | null, error: null as Error | null };
  allocation.child = Object.freeze({ original: child, closed, observation });
  const retainError = (failure: Error): void => { observation.error ??= failure; };
  child.on("error", retainError); child.stdin.on("error", retainError); child.stdout.on("error", retainError); child.stderr.on("error", retainError);
  child.once("close", (code, signal) => {
    observation.closed = true; observation.code = code; observation.signal = signal; closed.resolve(true); retainedOwners.delete(allocation);
  });
}

/** An ownerless constructor failure may end only its original never-written
 * stdin once. Deadline expiry retains that child and its late close observer. */
async function closeForwardExecutionOwnerlessBirth(allocation: ForwardExecutionBirthAllocation | PcbViaWriteAllocation): Promise<void> {
  const held = allocation.child;
  if (held === null || allocation.owner !== null || allocation.eofAttempted) { throw error("FORWARD_EXECUTION_OWNERLESS_EOF_REFUSED"); }
  allocation.eofAttempted = true;
  if (held.observation.closed) { return; }
  if (!held.original.stdin.writableEnded) { held.original.stdin.end(); }
  const expired = Promise.withResolvers<false>();
  const timer = setTimeout(() => { expired.resolve(false); }, CURRENT_FOOTPRINT_COMBINED_READY.eofCleanupMilliseconds);
  try {
    const closed = (async (): Promise<true> => { await held.closed.promise; return true; })();
    if (!await Promise.race([closed, expired.promise])) { throw error("FORWARD_EXECUTION_OWNERLESS_CHILD_RETAINED"); }
  } finally { clearTimeout(timer); }
}
/** The handoff selects original resources and closed SQL only. It never
 * proves a preceding write, replay exclusion or a saved result. */
function requireForwardSavedObservationHandoff(token: object, owner: CurrentPcbRetainedOwnerCore | null = null): ForwardSavedObservationHandoff {
  if (token === null || typeof token !== "object" || types.isProxy(token)) { throw error("FORWARD_SAVED_HANDOFF"); }
  const held = forwardSavedHandoffs.get(token);
  if (held === undefined) { throw error("FORWARD_SAVED_HANDOFF"); }
  assertOriginalCurrentFootprintCopyForwardNativeOwner(held.writer);
  const resources = forwardResourceBirths.get(held.writer);
  if (resources === undefined || resources.ledger !== held.ledger || resources.methods !== held.methods ||
      requireOriginalForwardLedgerBinding(held.ledger) !== held.methods) { throw error("FORWARD_SAVED_ORIGINAL_LEDGER"); }
  held.methods.requireOriginal();
  requireCurrentFootprintCopyClosedSnapshot(held.writer, held.after);
  const state = held.writer.status();
  if (!state.released || !state.helperClosed || held.writer.observeFootprintCopyRelease() !== "released") { throw error("FORWARD_SAVED_WRITER_RELEASE_REQUIRED"); }
  held.methods.generationStatus.call(held.ledger, "forward-writer", held.writer);
  if (owner === null) {
    const counters = held.methods.status.call(held.ledger);
    if (held.owner !== null || counters.failed || counters.boundGenerations !== 1) { throw error("FORWARD_SAVED_HANDOFF_CONSUMED"); }
  } else if (held.owner !== owner || forwardSavedOwnerHandoffs.get(owner) !== held) { throw error("FORWARD_SAVED_ORIGINAL_OWNER"); }
  return held;
}
export function assertOriginalCurrentFootprintCopyForwardSavedNativeOwner(owner: CurrentFootprintCopyForwardSavedNativeOwner): void {
  if (types.isProxy(owner) || Object.getPrototypeOf(owner) !== CurrentFootprintCopyForwardSavedNativeOwner.prototype) { throw error("FORWARD_SAVED_ORIGINAL_OWNER"); }
  assertOriginalCurrentFootprintCopyNativeOwner(owner);
  const held = forwardSavedOwnerHandoffs.get(owner);
  if (held === undefined || held.owner !== owner || forwardSavedAllocations.get(held.writer) !== owner) { throw error("FORWARD_SAVED_ORIGINAL_OWNER"); }
  const resources = forwardResourceBirths.get(held.writer);
  if (resources === undefined || resources.ledger !== held.ledger || resources.methods !== held.methods) { throw error("FORWARD_SAVED_ORIGINAL_LEDGER"); }
  held.methods.requireOriginal(); held.methods.generationStatus.call(held.ledger, "forward-saved-readback", owner);
}
export function currentFootprintCopyForwardFactoryFailureDiagnostics(failure: unknown,
  expectedOptions: CurrentPcbDiagnosticInstallationOptions): CurrentFootprintCombinedFactoryFailureDiagnostics | null {
  if (failure === null || typeof failure !== "object" || types.isProxy(failure)) { return null; }
  const held = forwardFactoryFailures.get(failure);
  if (held === undefined || held.options !== expectedOptions) { return null; }
  assertOriginalCurrentFootprintCopyForwardNativeOwner(held.owner); return held.owner.combinedFactoryFailureDiagnostics();
}
export function requireCurrentFootprintCopyForwardUnlaunchedFactoryFailure(failure: unknown,
  expectedOptions: CurrentPcbDiagnosticInstallationOptions): CurrentFootprintCombinedBeforeLaunchFailureProof | null {
  const diagnostics = currentFootprintCopyForwardFactoryFailureDiagnostics(failure, expectedOptions);
  if (diagnostics === null || !diagnostics.helperClosed || diagnostics.launchInvoked || diagnostics.stdinBytesWritten !== 0 ||
    failure === null || typeof failure !== "object") { return null; }
  const held = forwardFactoryFailures.get(failure); if (held === undefined) { return null; }
  held.proof ??= Object.freeze({ profile: "private.current-footprint-combined-before-launch-failure.v1", helperTransportClosed: true,
    launchRequestWritten: false, applicationLaunchDispatched: false, terminationProved: false }); return held.proof;
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
/** Exact v2 source custody only; legacy owner unions and factory predicates stay closed. */
export function originalCurrentFootprintForwardExecutionNativeTarget(owner: CurrentFootprintForwardExecutionNativeOwner): CurrentFootprintCopyNativeTarget {
  assertOriginalCurrentFootprintForwardExecutionNativeOwner(owner); return footprintOwnershipMethods.forwardExecutionTarget.call(owner);
}
export function originalCurrentFootprintForwardExecutionNativeTermination(owner: CurrentFootprintForwardExecutionNativeOwner): object {
  assertOriginalCurrentFootprintForwardExecutionNativeOwner(owner); return footprintOwnershipMethods.forwardExecutionTermination.call(owner);
}
export function assertOriginalCurrentFootprintForwardExecutionNativeTermination(owner: CurrentFootprintForwardExecutionNativeOwner, original: object): void {
  assertOriginalCurrentFootprintForwardExecutionNativeOwner(owner); footprintOwnershipMethods.requireForwardExecutionTermination.call(owner, original);
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
export function startCurrentPcb209VisualOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcb209VisualOwner> {
  return startFixedOwner(options, "visual209", "209-visual");
}

export function startCurrentPcb209DiagnosticOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcb209DiagnosticOwner> {
  return startFixedOwner(options, "diagnostic209", "209-opening");
}
export function startCurrentGeneratedFixture209DiagnosticOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcb209DiagnosticOwner> {
  return startFixedOwner(options, "diagnostic209", "209-opening", undefined, null, null, null, null, true);
}

/** Private spatial factory only. No live route is registered by this export. */
export function assertOriginalCurrentPcbViaWriteOwner(owner: CurrentPcbViaWriteOwner): void {
  const original = pcbViaWriteFactories.get(owner);
  if (original === undefined || original.allocation.owner !== owner || original.allocation.state !== "retained" ||
    pcbViaWriteAllocations.get(original.allocation.prepared) !== original.allocation || Object.getPrototypeOf(owner) !== CurrentPcbViaWriteOwner.prototype ||
    Reflect.ownKeys(owner).length > 0 || !originalFootprintDescriptors(CurrentPcbViaWriteOwner.prototype, viaOwnerDescriptors) ||
    !originalFootprintDescriptors(CurrentPcbRetainedOwnerCore.prototype, footprintCoreDescriptors) || owner.status().profile !== CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE) { throw error("PCB_VIA_ORIGINAL_FACTORY"); }
  assertOriginalGeneratedFixtureOpenCheckpoint(original.allocation.prepared);
}
/** Retained original preparation and historical closure only; neither can
 * issue another writer birth or a cache-excluded readback generation. */
export function originalCurrentPcbViaWriteTarget(owner: CurrentPcbViaWriteOwner): GeneratedFixtureOpenCheckpoint {
  assertOriginalCurrentPcbViaWriteOwner(owner); const original = pcbViaWriteFactories.get(owner); if (original === undefined) { throw error("PCB_VIA_ORIGINAL_PREPARATION"); } return original.allocation.prepared;
}
export function originalCurrentPcbViaWriteClosedEffects(owner: CurrentPcbViaWriteOwner, plan: CurrentPcbViaWritePlan, termination: object): CurrentPcbViaWriteClosedEffects {
  assertOriginalCurrentPcbViaWriteOwner(owner); return pcbViaOwnershipMethods.closedEffects.call(owner,plan,termination);
}
export function originalCurrentPcbViaWriteTermination(owner: CurrentPcbViaWriteOwner): object {
  assertOriginalCurrentPcbViaWriteOwner(owner); return pcbViaOwnershipMethods.termination.call(owner);
}
export function assertOriginalCurrentPcbViaWriteTermination(owner: CurrentPcbViaWriteOwner, original: object): void {
  assertOriginalCurrentPcbViaWriteOwner(owner); pcbViaOwnershipMethods.requireTermination.call(owner, original);
}
/** The complete original closed-SQL checkpoint must exist before allocation.
 * A failed allocation remains consumed and never adopts another owner. */
function requirePcbViaBirthOptions(options: CurrentPcbDiagnosticInstallationOptions): void {
  if (options === null || typeof options !== "object" || types.isProxy(options) || !Object.isFrozen(options) || Object.getPrototypeOf(options) !== Object.prototype) { throw error("PCB_VIA_BIRTH_OPTIONS"); }
  const required = ["pluginRoot", "assetsRoot", "powershellSha256", "powershellBytes"];
  if (required.some(name => !Object.hasOwn(options, name))) { throw error("PCB_VIA_BIRTH_OPTIONS"); }
  for (const key of Reflect.ownKeys(options)) {
    const field = Object.getOwnPropertyDescriptor(options, key);
    if (typeof key !== "string" || ![...required, "wslDistribution"].includes(key) || field === undefined || !Object.hasOwn(field, "value") ||
      (key === "powershellBytes" ? typeof field.value !== "number" : typeof field.value !== "string")) { throw error("PCB_VIA_BIRTH_OPTIONS"); }
  }
}
export async function startCurrentPcbViaWriteOwner(options: CurrentPcbDiagnosticInstallationOptions,
  prepared: GeneratedFixtureOpenCheckpoint): Promise<CurrentPcbViaWriteOwner> {
  requirePcbViaBirthOptions(options); assertOriginalGeneratedFixtureOpenCheckpoint(prepared);
  if (pcbViaWriteAllocations.has(prepared)) { throw error("PCB_VIA_ALLOCATION_CONSUMED"); }
  const allocation: PcbViaWriteAllocation = { options, prepared, state: "pending", owner: null, child: null, eofAttempted: false, cleanupFailure: null };
  pcbViaWriteAllocations.set(prepared, allocation);
  try {
    await verifyGeneratedFixtureOpenCheckpoint(prepared);
    const owner = await startFixedOwner(options, CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE, "209-via-write", undefined, null, null, null, null, false, allocation);
    if (!(owner instanceof CurrentPcbViaWriteOwner)) { throw error("PCB_VIA_FACTORY"); }
    assertOriginalCurrentPcbViaWriteOwner(owner); return owner;
  } catch (caughtError) {
    if (allocation.state === "pending") { allocation.state = "no-resource"; }
    else if (allocation.owner === null && allocation.child !== null) { try { await closeForwardExecutionOwnerlessBirth(allocation); } catch (cleanupError) { allocation.cleanupFailure = cleanupError; } }
    throw caughtError;
  }
}
export function currentPcbViaWriteAllocationOutcome(prepared: GeneratedFixtureOpenCheckpoint): Readonly<{ state: "not-attempted" | PcbViaWriteAllocation["state"]; owner: CurrentPcbViaWriteOwner | null }> {
  const original = pcbViaWriteAllocations.get(prepared); assertOriginalGeneratedFixtureOpenCheckpoint(prepared);
  if (original === undefined) { return Object.freeze({ state: "not-attempted", owner: null }); }
  if (original.owner !== null) { assertOriginalCurrentPcbViaWriteOwner(original.owner); }
  return Object.freeze({ state: original.state, owner: original.owner });
}

export function assertOriginalCurrentSchematicDisplayWriteOwner(owner: CurrentSchematicDisplayWriteOwner): void {
  const original = schematicDisplayFactories.get(owner);
  if (original === undefined || original.allocation.owner !== owner || original.allocation.state !== "retained" ||
    schematicDisplayAllocations.get(original.allocation.prepared) !== original.allocation || Object.getPrototypeOf(owner) !== CurrentSchematicDisplayWriteOwner.prototype || Reflect.ownKeys(owner).length > 0 ||
    !originalFootprintDescriptors(CurrentSchematicDisplayWriteOwner.prototype, schematicDisplayOwnerDescriptors) || !originalFootprintDescriptors(CurrentPcbRetainedOwnerCore.prototype, footprintCoreDescriptors) ||
    owner.status().profile !== CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE) { throw error("SCHEMATIC_DISPLAY_ORIGINAL_FACTORY"); }
  assertOriginalGeneratedSchematicFixtureOpenCheckpoint(original.allocation.prepared);
}
/** Original data identity survives deliberate helper release. This retrieval
 * grants neither another launch nor ownership from a serialized checkpoint. */
export function originalCurrentSchematicDisplayWriteTarget(owner: CurrentSchematicDisplayWriteOwner): GeneratedSchematicFixtureOpenCheckpoint {
  assertOriginalCurrentSchematicDisplayWriteOwner(owner); const original = schematicDisplayFactories.get(owner);
  if (original === undefined) { throw error("SCHEMATIC_DISPLAY_ORIGINAL_PREPARATION"); } return original.allocation.prepared;
}
export function originalCurrentSchematicDisplayWriteTermination(owner: CurrentSchematicDisplayWriteOwner): object {
  assertOriginalCurrentSchematicDisplayWriteOwner(owner); return schematicDisplayOwnershipMethods.termination.call(owner);
}
export function assertOriginalCurrentSchematicDisplayWriteTermination(owner: CurrentSchematicDisplayWriteOwner, original: object): void {
  assertOriginalCurrentSchematicDisplayWriteOwner(owner); schematicDisplayOwnershipMethods.requireTermination.call(owner, original);
}
export async function startCurrentSchematicDisplayWriteOwner(options: CurrentPcbDiagnosticInstallationOptions, prepared: GeneratedSchematicFixtureOpenCheckpoint): Promise<CurrentSchematicDisplayWriteOwner> {
  requirePcbViaBirthOptions(options); assertOriginalGeneratedSchematicFixtureOpenCheckpoint(prepared);
  if (schematicDisplayAllocations.has(prepared)) { throw error("SCHEMATIC_DISPLAY_ALLOCATION_CONSUMED"); }
  const allocation: SchematicDisplayWriteAllocation = { options, prepared, state: "pending", owner: null, child: null, eofAttempted: false, cleanupFailure: null }; schematicDisplayAllocations.set(prepared, allocation);
  try { await verifyGeneratedSchematicFixtureOpenCheckpoint(prepared);
    const owner = await startFixedOwner(options, CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE, "209-schematic-display", undefined, null, null, null, null, false, null, allocation);
    if (!(owner instanceof CurrentSchematicDisplayWriteOwner)) { throw error("SCHEMATIC_DISPLAY_FACTORY"); } assertOriginalCurrentSchematicDisplayWriteOwner(owner); return owner;
  } catch (caughtError) { if (allocation.state === "pending") { allocation.state = "no-resource"; }
    else if (allocation.owner === null && allocation.child !== null) { try { await closeForwardExecutionOwnerlessBirth(allocation); } catch (cleanupError) { allocation.cleanupFailure = cleanupError; } } throw caughtError;
  }
}
export function currentSchematicDisplayWriteAllocationOutcome(prepared: GeneratedSchematicFixtureOpenCheckpoint): Readonly<{ state: "not-attempted" | SchematicDisplayWriteAllocation["state"]; owner: CurrentSchematicDisplayWriteOwner | null }> {
  assertOriginalGeneratedSchematicFixtureOpenCheckpoint(prepared); const original = schematicDisplayAllocations.get(prepared);
  if (original === undefined) { return Object.freeze({ state: "not-attempted", owner: null }); } if (original.owner !== null) { assertOriginalCurrentSchematicDisplayWriteOwner(original.owner); } return Object.freeze({ state: original.state, owner: original.owner });
}

export function startCurrentPcbSpatialOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcbSpatialOwner> {
  return startFixedOwner(options, "pcb-spatial209", "209-spatial");
}
export function startCurrentGeneratedFixtureSpatial209Owner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentPcbSpatialOwner> {
  return startFixedOwner(options, "pcb-spatial209", "209-spatial", undefined, null, null, null, null, true);
}
const componentSpatialAllocations = new WeakSet<GeneratedComponentFixtureOpenCheckpoint>();
/** Consume the genuine checkpoint before the first asynchronous allocation. */
export function startCurrentPcbComponentSpatialOwner(options: CurrentPcbDiagnosticInstallationOptions, prepared: GeneratedComponentFixtureOpenCheckpoint): Promise<CurrentPcbComponentSpatialOwner> {
  assertOriginalGeneratedComponentFixtureOpenCheckpoint(prepared);
  if (componentSpatialAllocations.has(prepared)) { throw error("COMPONENT_ALLOCATION_CONSUMED"); } componentSpatialAllocations.add(prepared);
  return startFixedOwner(options, "pcb-component-spatial209", "209-component-spatial", undefined, null, null, null, null, true, null, null, prepared);
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
export async function startCurrentFootprintCombinedNativeOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentFootprintCombinedNativeOwner> {
  const owner = await startFixedOwner(options, CURRENT_FOOTPRINT_COMBINED_PURPOSE, "209-startup");
  if (!(owner instanceof CurrentFootprintCombinedNativeOwner)) { throw error("COMBINED_FACTORY_OWNER"); }
  try { await owner.waitFootprintCombinedReady(); return owner; }
  catch {
    const failure = error("COMBINED_FACTORY_READY_FAILED"); combinedFactoryFailures.set(failure, { options, owner, proof: null });
    try { await owner.closeFootprintCombinedBeforeLaunch(); } catch {
      // Original child closure is still unresolved. The private diagnostics
      // Getter retains this owner; no terminal proof is issued while it lives.
    }
    throw failure;
  }
}
/** Actual read-only native allocation. Source/build installation must contain
 * the dedicated generated switch before this can enter the ready handshake. */
export async function startCurrentProjectStructureNativeOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentProjectStructureNativeOwner> {
  const owner = await startFixedOwner(options, CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE, "209-startup");
  if (!(owner instanceof CurrentProjectStructureNativeOwner)) { throw error("STRUCTURE_FACTORY_OWNER"); }
  try { await owner.waitFootprintCombinedReady(); return owner; }
  catch {
    const failure = error("STRUCTURE_FACTORY_READY_FAILED"); structureFactoryFailures.set(failure, Object.freeze({ options, owner }));
    try { await owner.closeFootprintCombinedBeforeLaunch(); } catch {
      // Retain original unresolved child custody. No replacement is allocated.
    }
    throw failure;
  }
}
/** Source-only private factory. No registered controller mounts this owner as
 * a writer, and its retained native purpose cannot admit a create command. */
export async function startCurrentFootprintCopyForwardNativeOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentFootprintCopyForwardNativeOwner> {
  const owner = await startFixedOwner(options, CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE, "209-startup");
  if (!(owner instanceof CurrentFootprintCopyForwardNativeOwner)) { throw error("FORWARD_FACTORY_OWNER"); }
  try { await owner.waitFootprintCombinedReady(); return owner; }
  catch {
    const failure = error("FORWARD_FACTORY_READY_FAILED"); forwardFactoryFailures.set(failure, { options, owner, proof: null });
    try { await owner.closeFootprintCombinedBeforeLaunch(); } catch {
      // Preserve the original unresolved child. No copied PID or JSON receipt
      // Can manufacture its zero-input closure observation.
    }
    throw failure;
  }
}

/** Allocate the distinct native birth, retaining its ledger before helper I/O.
 * This returns an original owner, not CurrentFootprintCopyExecutionNative:
 * same-writer v2 qualification/main/clocks/saved providers remain unmounted. */
export async function startCurrentFootprintForwardExecutionNativeOwner(options: CurrentPcbDiagnosticInstallationOptions): Promise<CurrentFootprintForwardExecutionNativeOwner> {
  requireForwardExecutionBirthOptions(options);
  if (forwardExecutionBirthAllocations.has(options)) { throw error("FORWARD_EXECUTION_BIRTH_CONSUMED"); }
  const allocation: ForwardExecutionBirthAllocation = { options, state: "pending", owner: null, child: null, eofAttempted: false, cleanupFailure: null };
  forwardExecutionBirthAllocations.set(options, allocation);
  try {
    const owner = await startFixedOwner(options, CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE, "209-startup", undefined, null, null, null, allocation);
    if (!(owner instanceof CurrentFootprintForwardExecutionNativeOwner) || allocation.owner !== owner) { throw error("FORWARD_EXECUTION_FACTORY_OWNER"); }
    await owner.waitFootprintCombinedReady(); assertOriginalCurrentFootprintForwardExecutionNativeOwner(owner); return owner;
  } catch (caughtError) {
    if (allocation.state === "pending") { allocation.state = "no-resource"; }
    const owner = allocation.owner;
    if (owner === null) {
      if (allocation.child !== null) {
        try { await closeForwardExecutionOwnerlessBirth(allocation); } catch (cleanupError) { allocation.cleanupFailure = cleanupError; }
      }
      throw caughtError;
    }
    const failure = error("FORWARD_EXECUTION_FACTORY_READY_FAILED");
    Object.defineProperty(failure, "cause", { value: caughtError });
    forwardExecutionFactoryFailures.set(failure, Object.freeze({ options, owner }));
    try { await owner.closeFootprintCombinedBeforeLaunch(); } catch {
      // The original child remains retained under this failure.
      // No copied receipt or new allocation replaces its unresolved cleanup.
    }
    throw failure;
  }
}

/** Allocate one actual read-only second generation from the original closed
 * and released forward observation. It inherits no writer/project-open route,
 * saved projection, replay token or result authority. */
export async function startCurrentFootprintCopyForwardSavedObservationOwner(writer: CurrentFootprintCopyForwardNativeOwner,
  after: Awaited<ReturnType<typeof readExactSqlInventory>>): Promise<CurrentFootprintCopyForwardSavedNativeOwner> {
  assertOriginalCurrentFootprintCopyForwardNativeOwner(writer);
  requireCurrentFootprintCopyClosedSnapshot(writer, after);
  if (forwardSavedAllocationAttempts.has(writer) || savedSuccessorAttempts.has(writer)) { throw error("FORWARD_SAVED_ALLOCATION_CONSUMED"); }
  const original = footprintFactories.get(writer), resources = forwardResourceBirths.get(writer);
  if (original === undefined || resources === undefined) { throw error("FORWARD_SAVED_ORIGINAL_LEDGER"); }
  const token = Object.freeze({});
  forwardSavedHandoffs.set(token, { writer, after, ...resources, owner: null });
  requireForwardSavedObservationHandoff(token);
  savedSuccessorAttempts.add(writer); forwardSavedAllocationAttempts.add(writer); forwardSavedAllocationStates.set(writer, "pending");
  let owner: Awaited<ReturnType<typeof startFixedOwner>>;
  try { owner = await startFixedOwner(original.options, "worker-startup-footprint-saved209", "209-startup", undefined, token); }
  catch (caughtError) {
    if (forwardSavedAllocationStates.get(writer) === "pending") { forwardSavedAllocationStates.set(writer, "no-resource"); }
    throw caughtError;
  }
  if (!(owner instanceof CurrentFootprintCopyForwardSavedNativeOwner)) { throw error("FORWARD_SAVED_FACTORY"); }
  owner.bindFootprintSavedSource(writer, after); return owner;
}
export function currentFootprintCopyForwardSavedObservationAllocationOutcome(writer: CurrentFootprintCopyForwardNativeOwner): Readonly<{
  status: "not-attempted" | "pending" | "no-resource" | "unresolved"; owner: null;
}> | Readonly<{ status: "retained"; owner: CurrentFootprintCopyForwardSavedNativeOwner }> {
  assertOriginalCurrentFootprintCopyForwardNativeOwner(writer);
  const owner = forwardSavedAllocations.get(writer);
  if (owner !== undefined) { assertOriginalCurrentFootprintCopyForwardSavedNativeOwner(owner); return Object.freeze({ status: "retained", owner }); }
  return Object.freeze({ status: forwardSavedAllocationStates.get(writer) ?? "not-attempted", owner: null });
}
export async function startCurrentFootprintCopySavedNativeOwner(writer: CurrentFootprintCopyNativeOwner,
  after: Awaited<ReturnType<typeof readExactSqlInventory>>): Promise<CurrentFootprintCopySavedNativeOwner> {
  assertOriginalCurrentFootprintCopyNativeOwner(writer);
  // The separate forward factory has no original shared-ledger/replay join to
  // This older saved birth. A structurally compatible class cannot adopt it.
  if (Object.getPrototypeOf(writer) !== CurrentFootprintCopyNativeOwner.prototype) { throw error("FOOTPRINT_SAVED_WRITER_KIND_UNMOUNTED"); }
  requireCurrentFootprintCopyClosedSnapshot(writer, after);
  const original = footprintFactories.get(writer);
  if (original === undefined || !writer.status().released || !writer.status().helperClosed) { throw error("FOOTPRINT_WRITER_RELEASE_REQUIRED"); }
  if (footprintSavedAllocationAttempts.has(writer) || savedSuccessorAttempts.has(writer)) { throw error("FOOTPRINT_SAVED_ALLOCATION_CONSUMED"); }
  savedSuccessorAttempts.add(writer); footprintSavedAllocationAttempts.add(writer);
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
/** This assertion joins private factory custody to exact unmodified prototypes.
 * A matching constructor, packet or injected child cannot issue the role. */
export function assertOriginalCurrentFootprintCopyHeldSavedNativeOwner(owner: CurrentFootprintCopyHeldSavedNativeOwner): void {
  const descriptors = footprintOwnerDescriptors.get(CurrentFootprintCopyHeldSavedNativeOwner.prototype);
  if (types.isProxy(owner) || Object.getPrototypeOf(owner) !== CurrentFootprintCopyHeldSavedNativeOwner.prototype ||
      Reflect.ownKeys(owner).length > 0 || descriptors === undefined ||
      !originalFootprintDescriptors(CurrentFootprintCopyHeldSavedNativeOwner.prototype, descriptors) ||
      Object.getPrototypeOf(CurrentFootprintCopyHeldSavedNativeOwner.prototype) !== CurrentPcbRetainedOwnerCore.prototype ||
      !originalFootprintDescriptors(CurrentPcbRetainedOwnerCore.prototype, footprintCoreDescriptors)) { throw error("HELD_SAVED_ORIGINAL_OWNER"); }
  footprintOwnershipMethods.assert.call(owner);
}

/** Consume one original closed predecessor before allocating a distinct native
 * purpose. This supplies no original forward-ledger or native writer admission. */
export async function startCurrentFootprintCopyHeldSavedNativeOwner(writer: CurrentFootprintCopyNativeOwner,
  after: Awaited<ReturnType<typeof readExactSqlInventory>>): Promise<CurrentFootprintCopyHeldSavedNativeOwner> {
  assertOriginalCurrentFootprintCopyNativeOwner(writer);
  if (Object.getPrototypeOf(writer) !== CurrentFootprintCopyNativeOwner.prototype) { throw error("HELD_SAVED_PREDECESSOR_KIND_UNMOUNTED"); }
  requireCurrentFootprintCopyClosedSnapshot(writer, after);
  const original = footprintFactories.get(writer);
  if (original === undefined || !writer.status().released || !writer.status().helperClosed) { throw error("HELD_SAVED_PREDECESSOR_RELEASE_REQUIRED"); }
  if (savedSuccessorAttempts.has(writer) || footprintSavedAllocationAttempts.has(writer)) { throw error("HELD_SAVED_ALLOCATION_CONSUMED"); }
  savedSuccessorAttempts.add(writer); heldSavedAllocationStates.set(writer, "pending");
  let owner: Awaited<ReturnType<typeof startFixedOwner>>;
  try { owner = await startFixedOwner(original.options, "worker-startup-footprint-held-saved209", "209-startup", writer); }
  catch (caughtError) {
    if (heldSavedAllocationStates.get(writer) === "pending") { heldSavedAllocationStates.set(writer, "no-resource"); }
    throw caughtError;
  }
  if (!(owner instanceof CurrentFootprintCopyHeldSavedNativeOwner)) { throw error("HELD_SAVED_FACTORY"); }
  owner.bindFootprintSavedSource(writer, after); return owner;
}

export function currentFootprintCopyHeldSavedAllocationOutcome(writer: CurrentFootprintCopyNativeOwner): Readonly<{
  status: "not-attempted" | "pending" | "no-resource" | "unresolved"; owner: null;
}> | Readonly<{ status: "retained"; owner: CurrentFootprintCopyHeldSavedNativeOwner }> {
  assertOriginalCurrentFootprintCopyNativeOwner(writer);
  const owner = heldSavedAllocations.get(writer);
  if (owner !== undefined) { assertOriginalCurrentFootprintCopyHeldSavedNativeOwner(owner); return Object.freeze({ status: "retained", owner }); }
  return Object.freeze({ status: heldSavedAllocationStates.get(writer) ?? "not-attempted", owner: null });
}

/** Capture only the inert frozen binding fields. Its original completed SQL
 * reader remains a separate reference and is never reconstructed from JSON. */
function heldCacheValidationBindingText(binding: CurrentFootprintHeldCacheValidationBinding): string {
  if (binding === null || typeof binding !== "object" || types.isProxy(binding) || Object.getPrototypeOf(binding) !== Object.prototype || !Object.isFrozen(binding)) { throw error("HELD_CACHE_BINDING"); }
  const names = ["operationId", "target", "originalTarget", "prepared", "inventory", "runtime"] as const;
  if (Reflect.ownKeys(binding).length !== names.length || names.some(name => {
    const field = Object.getOwnPropertyDescriptor(binding, name); return field === undefined || !Object.hasOwn(field, "value") || field.enumerable !== true;
  })) { throw error("HELD_CACHE_BINDING_FIELDS"); }
  const fields = captureCurrentPcbStringClockReply({ operationId: binding.operationId, target: binding.target,
    originalTarget: binding.originalTarget, prepared: binding.prepared, runtime: binding.runtime }).value;
  return canonicalJson(fields);
}

/** Require exact allocation input references and the genuine reader-completion
 * record. This is local custody, not a new disk or Windows observation. */
function requireHeldCacheValidationBinding(allocation: HeldCacheValidationAllocation): void {
  const binding = allocation.binding, completion = readerCompletion(binding.inventory);
  if (heldCacheValidationAllocations.get(binding) !== allocation || heldCacheValidationBindingText(binding) !== allocation.text ||
      completion !== allocation.completion || !completion.observedChildClose || completion.exitCode !== 0 || completion.exitSignal !== null ||
      binding.inventory.checkpointSha256 !== binding.prepared.checkpoint.checkpointSha256) { throw error("HELD_CACHE_PREPARATION_CHANGED"); }
}

/** Only the genuinely allocated read-only class passes. Its installation and
 * descriptor registry is intentionally absent from all copy/saved predicates. */
export function assertOriginalCurrentFootprintHeldCacheValidationOwner(owner: CurrentFootprintHeldCacheValidationOwner): void {
  if (owner === null || typeof owner !== "object" || types.isProxy(owner) || Object.getPrototypeOf(owner) !== CurrentFootprintHeldCacheValidationOwner.prototype ||
      Reflect.ownKeys(owner).length > 0 || !originalFootprintDescriptors(CurrentFootprintHeldCacheValidationOwner.prototype, heldCacheValidationOwnerDescriptors) ||
      Object.getPrototypeOf(CurrentFootprintHeldCacheValidationOwner.prototype) !== CurrentPcbRetainedOwnerCore.prototype ||
      !originalFootprintDescriptors(CurrentPcbRetainedOwnerCore.prototype, footprintCoreDescriptors)) { throw error("HELD_CACHE_ORIGINAL_OWNER"); }
  const original = heldCacheValidationFactories.get(owner);
  if (original === undefined || original.allocation.owner !== owner || original.allocation.status !== "retained" ||
      original.installation.facadeSha256.length !== 64 || !Object.isFrozen(original.options)) { throw error("HELD_CACHE_ORIGINAL_FACTORY"); }
  requireHeldCacheValidationBinding(original.allocation);
}

/** Allocate a distinct helper only after independently checking the original
 * managed source/checkpoint, complete SQL reader and current machine runtime.
 * The owner is registered and retained before fallible helper listeners start. */
export async function startCurrentFootprintHeldCacheValidationOwner(options: CurrentPcbDiagnosticInstallationOptions,
  binding: CurrentFootprintHeldCacheValidationBinding): Promise<CurrentFootprintHeldCacheValidationOwner> {
  const text = heldCacheValidationBindingText(binding);
  currentFootprintHeldCacheValidationIdSchema.parse(binding.operationId);
  const target = currentDisposableOpenSealedTargetSchema.parse(binding.target);
  const originalTarget = currentDisposableOpenTargetSchema.parse(binding.originalTarget);
  const completion = readerCompletion(binding.inventory);
  if (!completion.observedChildClose || completion.exitCode !== 0 || completion.exitSignal !== null || !Object.isFrozen(binding.inventory) ||
      binding.inventory.checkpointSha256 !== binding.prepared.checkpoint.checkpointSha256 || binding.prepared.purpose !== undefined ||
      canonicalJson(target) !== canonicalJson({ ...originalTarget, branchUuid: binding.prepared.targetEvidence.branchUuid })) { throw error("HELD_CACHE_PREPARATION"); }
  if (heldCacheValidationAllocations.has(binding) || heldCacheValidationOperationIds.has(binding.operationId)) { throw error("HELD_CACHE_ALLOCATION_CONSUMED"); }
  const allocation: HeldCacheValidationAllocation = { binding, text, completion, owner: null, status: "pending" };
  heldCacheValidationAllocations.set(binding, allocation); heldCacheValidationOperationIds.add(binding.operationId);
  try {
    await verifyCurrentDisposableOpenCheckpoint(binding.prepared, binding.originalTarget); requireHeldCacheValidationBinding(allocation);
    const configured = await loadRuntimeMachineProfile(); requireHeldCacheValidationBinding(allocation);
    if (canonicalJson(configured.profile.runtime) !== canonicalJson(binding.runtime)) { throw error("HELD_CACHE_RUNTIME_CHANGED"); }
    const root = await controlRootCapability(); requireHeldCacheValidationBinding(allocation);
    const checkpoint = binding.prepared.checkpoint;
    const verified = await verifyCheckpoint(checkpoint.receiptPath, { expectedSource: checkpoint.source, controlRoot: root,
      artifactRoots: [join(controlDataDirectory(), "checkpoints")], maximumSourceBytes: 268_435_456 });
    requireHeldCacheValidationBinding(allocation);
    if (!verified.ok || verified.sourceChanged || !verified.sourceMatchesReceipt || !verified.checkpointMatchesReceipt || !verified.sourceEqualsCheckpoint ||
        verified.sourceSha256 !== checkpoint.sourceSha256 || verified.checkpointSha256 !== checkpoint.checkpointSha256) { throw error("HELD_CACHE_CHECKPOINT_CHANGED"); }
    const owner = await startFixedOwner(options, CURRENT_FOOTPRINT_HELD_CACHE_DIAGNOSTIC_PROFILE.purpose, "209-held-cache", undefined, null, allocation);
    requireHeldCacheValidationBinding(allocation);
    if (!(owner instanceof CurrentFootprintHeldCacheValidationOwner)) { throw error("HELD_CACHE_FACTORY"); }
    assertOriginalCurrentFootprintHeldCacheValidationOwner(owner); return owner;
  } catch (caughtError) {
    if (allocation.status === "pending") { allocation.status = "no-resource"; } throw caughtError;
  }
}

/** Return only this exact input reference's original allocation, including a
 * helper retained after factory/listener failure. JSON cannot recover an owner. */
export function currentFootprintHeldCacheValidationAllocationOutcome(binding: CurrentFootprintHeldCacheValidationBinding): Readonly<{
  status: "not-attempted" | "pending" | "no-resource" | "unresolved"; owner: null;
}> | Readonly<{ status: "retained"; owner: CurrentFootprintHeldCacheValidationOwner }> {
  const allocation = heldCacheValidationAllocations.get(binding);
  if (allocation === undefined) { return Object.freeze({ status: "not-attempted", owner: null }); }
  requireHeldCacheValidationBinding(allocation);
  if (allocation.owner !== null) { assertOriginalCurrentFootprintHeldCacheValidationOwner(allocation.owner); return Object.freeze({ status: "retained", owner: allocation.owner }); }
  return Object.freeze({ status: allocation.status === "retained" ? "unresolved" : allocation.status, owner: null });
}

/** Capture only the inert frozen binding fields. Its original completed SQL
 * reader remains a separate reference and is never reconstructed from JSON. */
function headAgeValidationBindingText(binding: CurrentFootprintHeadAgeValidationBinding): string {
  if (binding === null || typeof binding !== "object" || types.isProxy(binding) || Object.getPrototypeOf(binding) !== Object.prototype || !Object.isFrozen(binding)) { throw error("HEAD_AGE_BINDING"); }
  const names = ["operationId", "target", "originalTarget", "prepared", "inventory", "runtime"] as const;
  if (Reflect.ownKeys(binding).length !== names.length || names.some(name => {
    const field = Object.getOwnPropertyDescriptor(binding, name); return field === undefined || !Object.hasOwn(field, "value") || field.enumerable !== true;
  })) { throw error("HEAD_AGE_BINDING_FIELDS"); }
  const fields = captureCurrentPcbStringClockReply({ operationId: binding.operationId, target: binding.target,
    originalTarget: binding.originalTarget, prepared: binding.prepared, runtime: binding.runtime }).value;
  return canonicalJson(fields);
}

/** Require exact allocation input references and the genuine reader-completion
 * record. This is local custody, not a new disk or Windows observation. */
function requireHeadAgeValidationBinding(allocation: HeadAgeValidationAllocation): void {
  if (allocation.head !== null) { requireCurrentFootprintHeadAgeSqlHead(allocation.head, allocation.binding.inventory); }
  const binding = allocation.binding, completion = readerCompletion(binding.inventory);
  if (headAgeValidationAllocations.get(binding) !== allocation || headAgeValidationBindingText(binding) !== allocation.text ||
      completion !== allocation.completion || !completion.observedChildClose || completion.exitCode !== 0 || completion.exitSignal !== null ||
      binding.inventory.checkpointSha256 !== binding.prepared.checkpoint.checkpointSha256) { throw error("HEAD_AGE_PREPARATION_CHANGED"); }
}

/** Only the genuinely allocated read-only class passes. Its installation and
 * descriptor registry is intentionally absent from all copy/saved predicates. */
export function assertOriginalCurrentFootprintHeadAgeValidationOwner(owner: CurrentFootprintHeadAgeValidationOwner): void {
  if (owner === null || typeof owner !== "object" || types.isProxy(owner) || Object.getPrototypeOf(owner) !== CurrentFootprintHeadAgeValidationOwner.prototype ||
      Reflect.ownKeys(owner).length > 0 || !originalFootprintDescriptors(CurrentFootprintHeadAgeValidationOwner.prototype, headAgeValidationOwnerDescriptors) ||
      Object.getPrototypeOf(CurrentFootprintHeadAgeValidationOwner.prototype) !== CurrentPcbRetainedOwnerCore.prototype ||
      !originalFootprintDescriptors(CurrentPcbRetainedOwnerCore.prototype, footprintCoreDescriptors)) { throw error("HEAD_AGE_ORIGINAL_OWNER"); }
  const original = headAgeValidationFactories.get(owner);
  if (original === undefined || original.allocation.owner !== owner || original.allocation.status !== "retained" ||
      original.installation.facadeSha256.length !== 64 || !Object.isFrozen(original.options)) { throw error("HEAD_AGE_ORIGINAL_FACTORY"); }
  requireHeadAgeValidationBinding(original.allocation);
}

/** Allocate a distinct helper only after independently checking the original
 * managed source/checkpoint, complete SQL reader and current machine runtime.
 * The owner is registered and retained before fallible helper listeners start. */
export async function startCurrentFootprintHeadAgeValidationOwner(options: CurrentPcbDiagnosticInstallationOptions,
  binding: CurrentFootprintHeadAgeValidationBinding): Promise<CurrentFootprintHeadAgeValidationOwner> {
  const text = headAgeValidationBindingText(binding);
  currentFootprintHeadAgeValidationIdSchema.parse(binding.operationId);
  const target = currentDisposableOpenSealedTargetSchema.parse(binding.target);
  const originalTarget = currentDisposableOpenTargetSchema.parse(binding.originalTarget);
  const completion = readerCompletion(binding.inventory);
  if (!completion.observedChildClose || completion.exitCode !== 0 || completion.exitSignal !== null || !Object.isFrozen(binding.inventory) ||
      binding.inventory.checkpointSha256 !== binding.prepared.checkpoint.checkpointSha256 || binding.prepared.purpose !== undefined ||
      canonicalJson(target) !== canonicalJson({ ...originalTarget, branchUuid: binding.prepared.targetEvidence.branchUuid })) { throw error("HEAD_AGE_PREPARATION"); }
  if (headAgeValidationAllocations.has(binding) || headAgeValidationOperationIds.has(binding.operationId)) { throw error("HEAD_AGE_ALLOCATION_CONSUMED"); }
  const allocation: HeadAgeValidationAllocation = { binding, text, completion, head: null, owner: null, status: "pending" };
  headAgeValidationAllocations.set(binding, allocation); headAgeValidationOperationIds.add(binding.operationId);
  try {
    allocation.head = await prepareCurrentFootprintHeadAgeSqlHead(binding.inventory, binding.target); requireHeadAgeValidationBinding(allocation);
    await verifyCurrentDisposableOpenCheckpoint(binding.prepared, binding.originalTarget); requireHeadAgeValidationBinding(allocation);
    const configured = await loadRuntimeMachineProfile(); requireHeadAgeValidationBinding(allocation);
    if (canonicalJson(configured.profile.runtime) !== canonicalJson(binding.runtime)) { throw error("HEAD_AGE_RUNTIME_CHANGED"); }
    const root = await controlRootCapability(); requireHeadAgeValidationBinding(allocation);
    const checkpoint = binding.prepared.checkpoint;
    const verified = await verifyCheckpoint(checkpoint.receiptPath, { expectedSource: checkpoint.source, controlRoot: root,
      artifactRoots: [join(controlDataDirectory(), "checkpoints")], maximumSourceBytes: 268_435_456 });
    requireHeadAgeValidationBinding(allocation);
    if (!verified.ok || verified.sourceChanged || !verified.sourceMatchesReceipt || !verified.checkpointMatchesReceipt || !verified.sourceEqualsCheckpoint ||
        verified.sourceSha256 !== checkpoint.sourceSha256 || verified.checkpointSha256 !== checkpoint.checkpointSha256) { throw error("HEAD_AGE_CHECKPOINT_CHANGED"); }
    const owner = await startFixedOwner(options, "footprint-head-age209", "209-startup", undefined, null, null, allocation);
    requireHeadAgeValidationBinding(allocation);
    if (!(owner instanceof CurrentFootprintHeadAgeValidationOwner)) { throw error("HEAD_AGE_FACTORY"); }
    assertOriginalCurrentFootprintHeadAgeValidationOwner(owner); return owner;
  } catch (caughtError) {
    if (allocation.status === "pending") { allocation.status = "no-resource"; } throw caughtError;
  }
}

/** Return only this exact input reference's original allocation, including a
 * helper retained after factory/listener failure. JSON cannot recover an owner. */
export function currentFootprintHeadAgeValidationAllocationOutcome(binding: CurrentFootprintHeadAgeValidationBinding): Readonly<{
  status: "not-attempted" | "pending" | "no-resource" | "unresolved"; owner: null;
}> | Readonly<{ status: "retained"; owner: CurrentFootprintHeadAgeValidationOwner }> {
  const allocation = headAgeValidationAllocations.get(binding);
  if (allocation === undefined) { return Object.freeze({ status: "not-attempted", owner: null }); }
  requireHeadAgeValidationBinding(allocation);
  if (allocation.owner !== null) { assertOriginalCurrentFootprintHeadAgeValidationOwner(allocation.owner); return Object.freeze({ status: "retained", owner: allocation.owner }); }
  return Object.freeze({ status: allocation.status === "retained" ? "unresolved" : allocation.status, owner: null });
}

/** Pin the generation, purpose and original source inputs before helper allocation.
 * Construct the matching fixed owner and retain it before listeners start;
 * Callers cannot substitute native arguments or upgrade an existing purpose. */
async function startFixedOwner(options: CurrentPcbDiagnosticInstallationOptions, purpose: OwnerPurpose,
  generation: "206" | "209-opening" | "209-visual" | "209-spatial" | "209-component-spatial" | "209-startup" | "209-held-cache" | "209-via-write" | "209-schematic-display" = "206", savedWriter?: CurrentFootprintCopyNativeOwner,
  forwardSavedHandoff: object | null = null, heldValidation: HeldCacheValidationAllocation | null = null, headAgeValidation: HeadAgeValidationAllocation | null = null,
  forwardExecutionBirth: ForwardExecutionBirthAllocation | null = null, generatedFixtureBirth = false, viaWriteAllocation: PcbViaWriteAllocation | null = null, schematicDisplayAllocation: SchematicDisplayWriteAllocation | null = null, componentPrepared: GeneratedComponentFixtureOpenCheckpoint | null = null): Promise<CurrentPcbDiagnosticOwner | CurrentPcbStringPrecreateOwner | CurrentPcbWorkerStartupOwner> {
  if (generatedFixtureBirth && !(purpose === "diagnostic209" && generation === "209-opening" || purpose === "pcb-spatial209" && generation === "209-spatial" || purpose === "pcb-component-spatial209" && generation === "209-component-spatial")) { throw error("GENERATED_FIXTURE_BIRTH_PURPOSE"); }
  if ((schematicDisplayAllocation !== null) !== (purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE) || schematicDisplayAllocation !== null &&
    (schematicDisplayAllocation.options !== options || schematicDisplayAllocations.get(schematicDisplayAllocation.prepared) !== schematicDisplayAllocation || schematicDisplayAllocation.state !== "pending")) { throw error("SCHEMATIC_DISPLAY_ORIGINAL_ALLOCATION"); }
  if ((viaWriteAllocation !== null) !== (purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE) || viaWriteAllocation !== null &&
    (viaWriteAllocation.options !== options || pcbViaWriteAllocations.get(viaWriteAllocation.prepared) !== viaWriteAllocation || viaWriteAllocation.state !== "pending")) { throw error("PCB_VIA_ORIGINAL_ALLOCATION"); }
  if ((forwardExecutionBirth !== null) !== (purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE) || forwardExecutionBirth !== null &&
    (forwardExecutionBirth.options !== options || forwardExecutionBirthAllocations.get(options) !== forwardExecutionBirth || forwardExecutionBirth.state !== "pending")) {
    throw error("FORWARD_EXECUTION_ORIGINAL_ALLOCATION");
  }
  if ((componentPrepared !== null) !== (purpose === "pcb-component-spatial209")) { throw error("COMPONENT_ALLOCATION_PREPARED"); }
  if (componentPrepared !== null) { assertOriginalGeneratedComponentFixtureOpenCheckpoint(componentPrepared); }
  const sealedOptions = Object.freeze({ ...options });
  const forwardSaved = forwardSavedHandoff === null ? null : requireForwardSavedObservationHandoff(forwardSavedHandoff);
  if (forwardSaved !== null && (purpose !== "worker-startup-footprint-saved209" || generation !== "209-startup" || savedWriter !== undefined)) { throw error("FORWARD_SAVED_PURPOSE"); }
  const startup209 = purpose === "worker-startup209" || (purpose === "worker-startup-footprint209" || purpose === "worker-startup-footprint-copy209" || purpose === "worker-startup-footprint-saved209" || purpose === "worker-startup-footprint-held-saved209" || purpose === "worker-startup-footprint-main209" || purpose === "footprint-head-age209" || bornFootprintTransport(purpose)) || purpose === "worker-startup-empty209" || purpose === "worker-startup-ratline209" || purpose === "worker-startup-ratline-continuation209";
  if ((generation === "209-opening") !== (purpose === "diagnostic209") || (generation === "209-visual") !== (purpose === "visual209") ||
      (generation === "209-component-spatial") !== (purpose === "pcb-component-spatial209") || (generation === "209-spatial") !== (purpose === "pcb-spatial209") || (generation === "209-via-write") !== (purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE) || (generation === "209-schematic-display") !== (purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE) ||
      (generation === "209-startup") !== startup209 || (generation === "209-held-cache") !== (purpose === "footprint-held-cache209") ||
      (heldValidation !== null) !== (purpose === "footprint-held-cache209")) { throw error("INSTALLATION_PURPOSE"); }
  if (heldValidation !== null) { requireHeldCacheValidationBinding(heldValidation); }
  if ((headAgeValidation !== null) !== (purpose === "footprint-head-age209")) { throw error("HEAD_AGE_INSTALLATION_PURPOSE"); }
  if (headAgeValidation !== null) { requireHeadAgeValidationBinding(headAgeValidation); }
  let verifier = generation === "206" ? verifyCurrentPcbDiagnosticInstallation : verifyCurrentPcb209DiagnosticInstallation;
  if (purpose === "worker-startup-ratline209" || purpose === "worker-startup-ratline-continuation209") { verifier = verifyCurrentPcb209RatlineInstallation; }
  const installation = await verifier(sealedOptions);
  if (selectedFileMainPurpose(purpose)) { await verifyCurrentSelectedFileMainSqlFenceInstallation(sealedOptions); }
  if (fileURLToPath(new URL("../..", import.meta.url)) !== `${sealedOptions.pluginRoot}/`) { throw error("INSTALLATION_PLUGIN"); }
  const verifyInstallation = async (): Promise<void> => {
    const current = await verifier(sealedOptions);
    if (selectedFileMainPurpose(purpose)) { await verifyCurrentSelectedFileMainSqlFenceInstallation(sealedOptions); }
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
  const graphChallenge = purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE ? randomBytes(16).toString("hex") : null;
  const nativeGraph = graphChallenge === null ? null : await captureCurrentFootprintForwardColdNativeGraph(sealedOptions.wslDistribution ?? process.env["WSL_DISTRO_NAME"], graphChallenge);
  const helperPath = fileURLToPath(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url));
  const before = nativeGraph === null ? await lstat(helperPath) : null;
  const verify = async (): Promise<void> => {
    if (nativeGraph !== null) { await nativeGraph.verify(); return; }
    if (before === null) { throw error("HELPER_SOURCE"); }
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
  const readyChallenge = graphChallenge ?? (bornFootprintTransport(purpose) ? randomBytes(16).toString("hex") : null);
  let purposeSwitch = "";
  if (purpose === "worker-startup-ratline-continuation209") { purposeSwitch = " -WorkerStartupRatlineContinuation209"; }
  else if (purpose === "worker-startup-ratline209") { purposeSwitch = " -WorkerStartupRatline209"; }
  else if (purpose === "worker-startup-empty209") { purposeSwitch = " -WorkerStartupEmpty209"; }
  else if (purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE) { purposeSwitch = ` ${CURRENT_FOOTPRINT_FORWARD_EXECUTION_BIRTH_PROFILE.nativeSwitch} -CombinedReadyChallenge '${readyChallenge ?? ""}'`; }
  else if (purpose === CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE) { purposeSwitch = ` ${CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE.nativeSwitch} -CombinedReadyChallenge '${readyChallenge ?? ""}'`; }
  else if (purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE) { purposeSwitch = ` ${CURRENT_FOOTPRINT_COMBINED_PROFILE.nativeSwitch} -CombinedReadyChallenge '${readyChallenge ?? ""}'`; }
  else if (purpose === CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE) { purposeSwitch = ` ${CURRENT_PROJECT_STRUCTURE_NATIVE_PROFILE.nativeSwitch} -CombinedReadyChallenge '${readyChallenge ?? ""}'`; }
  else if (purpose === "footprint-head-age209") { purposeSwitch = " -FootprintHeadAge209"; }
  else if (purpose === "worker-startup-footprint-main209") { purposeSwitch = " -WorkerStartupFootprintMain209"; }
  else if (purpose === "worker-startup-footprint-held-saved209") { purposeSwitch = " -WorkerStartupFootprintHeldSaved209"; }
  else if (purpose === "worker-startup-footprint-saved209") { purposeSwitch = " -WorkerStartupFootprintSaved209"; }
  else if (purpose === "worker-startup-footprint-copy209") { purposeSwitch = " -WorkerStartupFootprintCopy209"; }
  else if (purpose === "worker-startup-footprint209") { purposeSwitch = " -WorkerStartupFootprint209"; }
  else if (purpose === "worker-startup209") { purposeSwitch = " -WorkerStartup209"; }
  else if (purpose === "worker-startup") { purposeSwitch = " -WorkerStartup"; }
  else if (purpose === "string-precreate") { purposeSwitch = " -StringPrecreate"; }
  else if (purpose === "visual209") { purposeSwitch = " -Visual209"; }
  else if (purpose === "diagnostic209") { purposeSwitch = generatedFixtureBirth ? " -GeneratedFixture209" : " -Layers209"; }
  else if (purpose === "pcb-component-spatial209") { purposeSwitch = " -ComponentSpatial209"; }
  else if (purpose === "pcb-spatial209") { purposeSwitch = generatedFixtureBirth ? " -GeneratedFixtureSpatial209" : " -Spatial209"; }
  else if (purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE) { purposeSwitch = ` ${CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE.nativeSwitch}`; }
  else if (purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE) { purposeSwitch = ` ${CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE.nativeSwitch}`; }
  else if (purpose === "footprint-held-cache209") { purposeSwitch = " -FootprintHeldCache209"; }
  const legacyBootstrap = `$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue';` +
    `$file=[IO.File]::Open('${windowsPath.replaceAll("'", "''")}',[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read);` +
    `try{if($file.Length -ne ${HELPER_BYTES}){throw 'pcb-diagnostic-helper-size'};$bytes=New-Object byte[] ([int]$file.Length);$offset=0;` +
    `while($offset -lt $bytes.Length){$count=$file.Read($bytes,$offset,$bytes.Length-$offset);if($count -le 0){throw 'pcb-diagnostic-helper-eof'};$offset+=$count};` +
    `$hash=[Security.Cryptography.SHA256]::Create();try{$digest=([BitConverter]::ToString($hash.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}finally{$hash.Dispose()};` +
    `if($digest -cne '${HELPER_SHA256}'){throw 'pcb-diagnostic-helper-hash'};` +
    `$decoder=New-Object Text.UTF8Encoding($false,$true);& ([ScriptBlock]::Create($decoder.GetString($bytes)))${purposeSwitch}}finally{$file.Dispose()}`;
  const bootstrap = nativeGraph?.bootstrap ?? legacyBootstrap;
  const encoded = Buffer.from(bootstrap, "utf16le").toString("base64");
  if (encoded.length > 16_000) { throw error("BOOTSTRAP_BOUND"); }
  const emptyAnchor = purpose === "worker-startup-empty209" ? new CurrentPcb209EmptyStartupBudgetAnchor() : null;
  const ratlineBudget = purpose === "worker-startup-ratline209" ? new CurrentPcb209RatlineBudget() : null;
  const continuationBudget = purpose === "worker-startup-ratline-continuation209" ? new CurrentPcb209RatlineContinuationBudget() : null;
  if (forwardSavedHandoff !== null) {
    if (requireForwardSavedObservationHandoff(forwardSavedHandoff) !== forwardSaved || forwardSaved === null) { throw error("FORWARD_SAVED_HANDOFF"); }
    forwardSavedAllocationStates.set(forwardSaved.writer, "unresolved");
  }
  if (savedWriter !== undefined) {
    if (purpose === "worker-startup-footprint-held-saved209") { heldSavedAllocationStates.set(savedWriter, "unresolved"); }
    else { footprintSavedAllocationStates.set(savedWriter, "unresolved"); }
  }
  if (heldValidation !== null) { requireHeldCacheValidationBinding(heldValidation); heldValidation.status = "unresolved"; }
  if (headAgeValidation !== null) { requireHeadAgeValidationBinding(headAgeValidation); headAgeValidation.status = "unresolved"; }
  if (forwardExecutionBirth !== null) { forwardExecutionBirth.state = "unresolved"; retainedOwners.add(forwardExecutionBirth); }
  if (viaWriteAllocation !== null) { viaWriteAllocation.state = "unresolved"; retainedOwners.add(viaWriteAllocation); }
  if (schematicDisplayAllocation !== null) { schematicDisplayAllocation.state = "unresolved"; retainedOwners.add(schematicDisplayAllocation); }
  const child = spawn(installation.paths.powershellExecutable,
    ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", encoded],
    { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
  if (forwardExecutionBirth !== null) { retainForwardExecutionBirthChild(forwardExecutionBirth, child); }
  if (viaWriteAllocation !== null) { retainForwardExecutionBirthChild(viaWriteAllocation, child); }
  if (schematicDisplayAllocation !== null) { retainForwardExecutionBirthChild(schematicDisplayAllocation, child); }
  let owner: CurrentPcbRetainedOwnerCore;
  if (purpose === "footprint-head-age209") {
    if (headAgeValidation === null || actorClockSource === null || headAgeValidation.head === null) { throw error("HEAD_AGE_FACTORY_PROFILE"); }
    const diagnostic = new CurrentFootprintHeadAgeValidationOwner(child, verify, actorClockSource, installation, verifyInstallation, verifyStartupFacade);
    headAgeValidationFactories.set(diagnostic, Object.freeze({ allocation: headAgeValidation, options: sealedOptions, installation }));
    headAgeValidation.owner = diagnostic; headAgeValidation.status = "retained"; owner = diagnostic;
  } else if (purpose === "footprint-held-cache209") {
    if (heldValidation === null || actorClockSource !== null) { throw error("HELD_CACHE_FACTORY_PROFILE"); }
    const diagnostic = new CurrentFootprintHeldCacheValidationOwner(child, verify, installation, verifyInstallation, verifyStartupFacade);
    heldCacheValidationFactories.set(diagnostic, Object.freeze({ allocation: heldValidation, options: sealedOptions, installation }));
    heldValidation.owner = diagnostic; heldValidation.status = "retained"; owner = diagnostic;
  } else if (purpose === "worker-startup-ratline-continuation209") {
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
  else if (purpose === CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE) {
    if (actorClockSource === null || readyChallenge === null || forwardExecutionBirth === null) { throw error("FORWARD_EXECUTION_FACTORY_PROFILE"); }
    owner = new CurrentFootprintForwardExecutionNativeOwner(child, verify, actorClockSource, installation, verifyInstallation, verifyStartupFacade, readyChallenge);
    footprintForwardExecutionFactories.set(owner, installation);
    forwardExecutionBirth.owner = owner; forwardExecutionBirth.state = "retained";
  }
  else if (purpose === CURRENT_FOOTPRINT_COPY_FORWARD_PURPOSE) {
    if (actorClockSource === null || readyChallenge === null) { throw error("FORWARD_FACTORY_PROFILE"); }
    owner = new CurrentFootprintCopyForwardNativeOwner(child, verify, actorClockSource, installation, verifyInstallation, verifyStartupFacade, readyChallenge);
    footprintForwardFactories.set(owner, installation);
  }
  else if (purpose === CURRENT_FOOTPRINT_COMBINED_PURPOSE) {
    if (actorClockSource === null) { throw error("STARTUP209_ACTOR_SOURCE"); }
    if (readyChallenge === null) { throw error("COMBINED_READY_CHALLENGE_PROFILE"); }
    owner = new CurrentFootprintCombinedNativeOwner(child, verify, actorClockSource, installation, verifyInstallation, verifyStartupFacade, readyChallenge);
    footprintCombinedFactories.set(owner, installation);
  }
  else if (purpose === CURRENT_PROJECT_STRUCTURE_NATIVE_PURPOSE) {
    if (actorClockSource === null || readyChallenge === null) { throw error("STRUCTURE_FACTORY_PROFILE"); }
    owner = new CurrentProjectStructureNativeOwner(child, verify, actorClockSource, installation, verifyInstallation, verifyStartupFacade, readyChallenge);
    structureFactories.set(owner, installation);
  }
  else if (purpose === "worker-startup-footprint-main209") {
    if (actorClockSource === null) { throw error("STARTUP209_ACTOR_SOURCE"); }
    owner = new CurrentFootprintMainNativeOwner(child, verify, actorClockSource, installation, verifyInstallation, verifyStartupFacade);
  }
  else if (purpose === "worker-startup-footprint-held-saved209") {
    if (actorClockSource === null || savedWriter === undefined) { throw error("HELD_SAVED_FACTORY_PROFILE"); }
    owner = new CurrentFootprintCopyHeldSavedNativeOwner(child, verify, actorClockSource, installation, verifyInstallation, verifyStartupFacade);
  }
  else if (purpose === "worker-startup-footprint-saved209") {
    if (actorClockSource === null) { throw error("STARTUP209_ACTOR_SOURCE"); }
    owner = forwardSavedHandoff === null ? new CurrentFootprintCopySavedNativeOwner(child, verify, actorClockSource, installation, verifyInstallation, verifyStartupFacade) :
      new CurrentFootprintCopyForwardSavedNativeOwner(child, verify, actorClockSource, forwardSavedHandoff, installation, verifyInstallation, verifyStartupFacade);
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
  else if (purpose === "visual209") { owner = new CurrentPcb209VisualOwner(child, verify, installation, verifyInstallation); }
  else if (purpose === "diagnostic209") { owner = new CurrentPcb209DiagnosticOwner(child, verify, installation, verifyInstallation, generatedFixtureBirth); }
  else if (purpose === "pcb-component-spatial209") { if (componentPrepared === null) { throw error("COMPONENT_PREPARED_REQUIRED"); } owner = new CurrentPcbComponentSpatialOwner(child, verify, componentPrepared, installation, verifyInstallation); }
  else if (purpose === "pcb-spatial209") { owner = new CurrentPcbSpatialOwner(child, verify, installation, verifyInstallation, generatedFixtureBirth); }
  else if (purpose === CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PURPOSE) { owner = new CurrentSchematicDisplayWriteOwner(child, verify, installation, verifyInstallation); }
  else if (purpose === CURRENT_PCB_VIA_WRITE_NATIVE_PURPOSE) { owner = new CurrentPcbViaWriteOwner(child, verify, installation, verifyInstallation); }
  else { owner = new CurrentPcbDiagnosticOwner(child, verify, installation, verifyInstallation); }
  if (owner instanceof CurrentFootprintCopyNativeOwner || owner instanceof CurrentFootprintCopySavedNativeOwner || owner instanceof CurrentFootprintCopyHeldSavedNativeOwner || owner instanceof CurrentFootprintCopyForwardNativeOwner || owner instanceof CurrentFootprintCopyForwardSavedNativeOwner) {
    footprintFactories.set(owner, Object.freeze({ options: sealedOptions, installation }));
  }
  if (owner instanceof CurrentFootprintCopyHeldSavedNativeOwner) {
    if (savedWriter === undefined) { throw error("HELD_SAVED_WRITER_REQUIRED"); }
    heldSavedAllocations.set(savedWriter, owner);
  } else if (owner instanceof CurrentFootprintCopySavedNativeOwner) {
    if (savedWriter === undefined) { throw error("FOOTPRINT_SAVED_WRITER_REQUIRED"); }
    footprintSavedAllocations.set(savedWriter, owner);
  } else if (owner instanceof CurrentFootprintCopyForwardSavedNativeOwner) {
    if (forwardSaved === null || forwardSaved.owner !== owner) { throw error("FORWARD_SAVED_WRITER_REQUIRED"); }
    forwardSavedAllocations.set(forwardSaved.writer, owner);
  }
  if (viaWriteAllocation !== null) {
    if (!(owner instanceof CurrentPcbViaWriteOwner)) { throw error("PCB_VIA_FACTORY"); }
    viaWriteAllocation.owner = owner; viaWriteAllocation.state = "retained"; pcbViaWriteFactories.set(owner, Object.freeze({ allocation: viaWriteAllocation, installation }));
  }
  if (schematicDisplayAllocation !== null) {
    if (!(owner instanceof CurrentSchematicDisplayWriteOwner)) { throw error("SCHEMATIC_DISPLAY_FACTORY"); }
    schematicDisplayAllocation.owner = owner; schematicDisplayAllocation.state = "retained"; schematicDisplayFactories.set(owner, Object.freeze({ allocation: schematicDisplayAllocation, installation }));
  }
  retainedOwners.add(owner); owner.start();
  return owner;
}
