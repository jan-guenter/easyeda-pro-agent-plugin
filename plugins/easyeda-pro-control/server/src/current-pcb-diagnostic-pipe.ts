/* oxlint-disable max-classes-per-file -- Fixed-purpose facades share a private byte-transport core without exposing a caller-selectable purpose or budget. */
/* oxlint-disable import/max-dependencies -- Fixed transport composes independent model/common/worker/actor grammars without merging their source or authority boundaries. */
import { currentFootprintInverseNativeGetTaskManagerWire } from "./current-footprint-inverse-native-get-task-manager-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskManagerCommand } from "./current-footprint-inverse-native-get-task-manager-protocol.ts";
import { currentFootprintInverseNativeGetTaskCallbackWire } from "./current-footprint-inverse-native-get-task-callback-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskCallbackCommand } from "./current-footprint-inverse-native-get-task-callback-protocol.ts";
import { currentFootprintInverseNativeGetTaskDependenciesWire } from "./current-footprint-inverse-native-get-task-dependencies-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskDependenciesCommand } from "./current-footprint-inverse-native-get-task-dependencies-protocol.ts";
import { currentFootprintInverseNativeGetTaskIntrinsicsWire } from "./current-footprint-inverse-native-get-task-intrinsics-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskIntrinsicsCommand } from "./current-footprint-inverse-native-get-task-intrinsics-protocol.ts";
import { currentFootprintInverseNativeGetTaskSenderWire } from "./current-footprint-inverse-native-get-task-sender-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskSenderCommand } from "./current-footprint-inverse-native-get-task-sender-protocol.ts";
import { currentFootprintInverseNativeGetLookupWire } from "./current-footprint-inverse-native-get-lookup-protocol.ts";
import type { CurrentFootprintInverseNativeGetLookupCommand } from "./current-footprint-inverse-native-get-lookup-protocol.ts";
import { currentSchematicRelevanceModifyEchoContinuationWire } from "./current-schematic-relevance-modify-echo-continuation-wire.ts";
import type { CurrentSchematicRelevanceModifyEchoContinuationCommand } from "./current-schematic-relevance-modify-echo-continuation-wire.ts";
import { currentSchematicRelevancePublicationReturnWire } from "./current-schematic-relevance-publication-return-wire.ts";
import { currentSchematicRelevanceModifyReturnContinuationWire } from "./current-schematic-relevance-modify-return-continuation-wire.ts";
import type { CurrentSchematicRelevanceModifyReturnContinuationCommand } from "./current-schematic-relevance-modify-return-continuation-wire.ts";
import { currentSchematicRelevanceModifyCanvasContinuationWire } from "./current-schematic-relevance-modify-canvas-continuation-wire.ts";
import type { CurrentSchematicRelevanceModifyCanvasContinuationCommand } from "./current-schematic-relevance-modify-canvas-continuation-wire.ts";
import { currentSchematicRelevanceModifyCmContinuationWire } from "./current-schematic-relevance-modify-cm-continuation-wire.ts";
import type { CurrentSchematicRelevanceModifyCmContinuationCommand } from "./current-schematic-relevance-modify-cm-continuation-wire.ts";
import { currentFootprintInverseNativeGetWorkerWire } from "./current-footprint-inverse-native-get-worker-protocol.ts";
import type { CurrentFootprintInverseNativeGetWorkerCommand } from "./current-footprint-inverse-native-get-worker-protocol.ts";
import { currentSchematicRelevanceModifyStructureWire } from "./current-schematic-relevance-modify-structure-wire.ts";
import type { CurrentSchematicRelevanceModifyStructureCommand } from "./current-schematic-relevance-modify-structure-protocol.ts";
import { currentSchematicRelevanceModifyContinuationWire } from "./current-schematic-relevance-modify-continuation-wire.ts";
import type { CurrentSchematicRelevanceModifyContinuationCommand } from "./current-schematic-relevance-modify-continuation-wire.ts";
import{currentFootprintInverseDeleteSendWire}from"./current-footprint-inverse-delete-send-protocol.ts";
import type{CurrentFootprintInverseDeleteSendCommand}from"./current-footprint-inverse-delete-send-protocol.ts";
import {currentFootprintInverseDeleteCallbackWire} from "./current-footprint-inverse-delete-callback-protocol.ts";
import type {CurrentFootprintInverseDeleteCallbackCommand} from "./current-footprint-inverse-delete-callback-protocol.ts";
import {currentSchematicRelevanceNotificationWire} from "./current-schematic-relevance-notification-wire.ts";
import type {CurrentSchematicRelevanceNotificationWireCommand} from "./current-schematic-relevance-notification-wire.ts";
import {currentSchematicRelevanceModifyWorkerWire} from "./current-schematic-relevance-modify-worker-wire.ts";
import type {CurrentSchematicRelevanceModifyWorkerCommand} from "./current-schematic-relevance-modify-worker-protocol.ts";
import {currentSchematicRelevancePublicationWire} from "./current-schematic-relevance-publication-wire.ts";
import type {CurrentSchematicRelevancePublicationCommand} from "./current-schematic-relevance-publication-wire.ts";
import {currentSchematicRelevanceSdkGateWire} from "./current-schematic-relevance-sdk-gate-wire.ts";
import type {CurrentSchematicRelevanceSdkGateCommand} from "./current-schematic-relevance-sdk-gate-protocol.ts";
import {currentFootprintInverseDeleteManagerWire} from "./current-footprint-inverse-delete-manager-protocol.ts";
import type {CurrentFootprintInverseDeleteManagerCommand} from "./current-footprint-inverse-delete-manager-protocol.ts";
import {currentFootprintInverseDeleteCollateralWire} from "./current-footprint-inverse-delete-collateral-protocol.ts";
import type {CurrentFootprintInverseDeleteCollateralCommand} from "./current-footprint-inverse-delete-collateral-protocol.ts";
import{currentFootprintInverseDeletePrefixWire}from"./current-footprint-inverse-delete-prefix-protocol.ts";
import type{CurrentFootprintInverseDeletePrefixCommand}from"./current-footprint-inverse-delete-prefix-protocol.ts";
import {currentSchematicRelevanceNormalCommandUiWire} from "./current-schematic-relevance-normal-command-ui-wire.ts";
import type {CurrentSchematicRelevanceNormalCommandUiCommand} from "./current-schematic-relevance-normal-command-ui-protocol.ts";
import {currentSchematicRelevanceFileSaveUiWire} from "./current-schematic-relevance-file-save-ui-wire.ts";
import type {CurrentSchematicRelevanceFileSaveUiCommand} from "./current-schematic-relevance-file-save-ui-protocol.ts";
import {currentSchematicRelevanceRenderDelegateWire} from "./current-schematic-relevance-render-delegate-wire.ts";
import type {CurrentSchematicRelevanceRenderDelegateCommand} from "./current-schematic-relevance-render-delegate-protocol.ts";
import {currentSchematicRelevanceStatusTabMutationWire} from "./current-schematic-relevance-status-tab-mutation-wire.ts";
import type {CurrentSchematicRelevanceStatusTabMutationCommand} from "./current-schematic-relevance-status-tab-mutation-protocol.ts";
import {currentSchematicRelevanceStatusTabLookupWire} from "./current-schematic-relevance-status-tab-lookup-wire.ts";
import type {CurrentSchematicRelevanceStatusTabLookupCommand} from "./current-schematic-relevance-status-tab-lookup-protocol.ts";
import {currentSchematicRelevanceStatusSubscriberWire} from "./current-schematic-relevance-status-subscriber-wire.ts";
import type {CurrentSchematicRelevanceStatusSubscriberCommand} from "./current-schematic-relevance-status-subscriber-protocol.ts";
import{currentFootprintInverseReferenceProgressWire}from"./current-footprint-inverse-reference-progress-protocol.ts";
import type{CurrentFootprintInverseReferenceProgressCommand}from"./current-footprint-inverse-reference-progress-protocol.ts";
import{currentFootprintInverseReferenceResultWire}from"./current-footprint-inverse-reference-result-protocol.ts";
import type{CurrentFootprintInverseReferenceResultCommand}from"./current-footprint-inverse-reference-result-protocol.ts";
import{currentFootprintInverseReferenceSendWire}from"./current-footprint-inverse-reference-send-protocol.ts";
import type{CurrentFootprintInverseReferenceSendCommand}from"./current-footprint-inverse-reference-send-protocol.ts";
import { currentFootprintInverseReferenceWorkerWire } from "./current-footprint-inverse-reference-worker-protocol.ts";
import type { CurrentFootprintInverseReferenceWorkerCommand } from "./current-footprint-inverse-reference-worker-protocol.ts";
import{currentFootprintInverseReferenceCallbackWire}from"./current-footprint-inverse-reference-callback-protocol.ts";
import type{CurrentFootprintInverseReferenceCallbackCommand}from"./current-footprint-inverse-reference-callback-protocol.ts";
import{currentFootprintInverseReferenceDispatchWire}from"./current-footprint-inverse-reference-dispatch-protocol.ts";
import type{CurrentFootprintInverseReferenceDispatchCommand}from"./current-footprint-inverse-reference-dispatch-protocol.ts";
import{currentFootprintInverseReferenceUiWire}from"./current-footprint-inverse-reference-ui-protocol.ts";
import type{CurrentFootprintInverseReferenceUiCommand}from"./current-footprint-inverse-reference-ui-protocol.ts";
import{currentFootprintInverseReferenceEntryWire}from"./current-footprint-inverse-reference-entry-protocol.ts";
import type{CurrentFootprintInverseReferenceEntryCommand}from"./current-footprint-inverse-reference-entry-protocol.ts";
import { canonicalJson } from "./core.ts";
import { decodeCurrentSchematicRelevanceDisplayRegistrationNavigation } from "./current-schematic-relevance-display-registration.ts";
import { assertOriginalGeneratedSchematicRelevanceFixtureTarget } from "./managed-schematic-relevance-fixture-initial-sql.ts";
import type { QualifiedGeneratedSchematicRelevanceFixtureTarget } from "./managed-schematic-relevance-fixture-initial-sql.ts";
import { currentFootprintInverseGetResultWire } from "./current-footprint-inverse-get-result-protocol.ts";
import type { CurrentFootprintInverseGetResultCommand } from "./current-footprint-inverse-get-result-protocol.ts";
import {currentSchematicRelevanceStatusCloneWire} from "./current-schematic-relevance-status-clone-wire.ts";
import type {CurrentSchematicRelevanceStatusCloneCommand} from "./current-schematic-relevance-status-clone-protocol.ts";
import {currentSchematicRelevanceStatusDeliveryWire} from "./current-schematic-relevance-status-delivery-wire.ts";
import type {CurrentSchematicRelevanceStatusDeliveryCommand} from "./current-schematic-relevance-status-delivery-protocol.ts";
import {currentSchematicRelevanceStatusBusWire} from "./current-schematic-relevance-status-bus-wire.ts";
import type {CurrentSchematicRelevanceStatusBusCommand} from "./current-schematic-relevance-status-bus-protocol.ts";
import {currentSchematicRelevanceHistoryStatusWire} from "./current-schematic-relevance-history-status-wire.ts";
import type {CurrentSchematicRelevanceHistoryStatusCommand} from "./current-schematic-relevance-history-status-protocol.ts";
import {currentSchematicRelevanceUploadReturnWire} from "./current-schematic-relevance-upload-return-wire.ts";
import type {CurrentSchematicRelevanceUploadReturnCommand} from "./current-schematic-relevance-upload-return-protocol.ts";
import {currentSchematicRelevancePendingCacheWire} from "./current-schematic-relevance-pending-cache-wire.ts";
import type {CurrentSchematicRelevancePendingCacheCommand} from "./current-schematic-relevance-pending-cache-protocol.ts";
import {currentSchematicRelevanceUploadCmWire} from "./current-schematic-relevance-upload-cm-wire.ts";
import type {CurrentSchematicRelevanceUploadCmCommand} from "./current-schematic-relevance-upload-cm-protocol.ts";
import {currentSchematicRelevanceUploadSerializeWire} from "./current-schematic-relevance-upload-serialize-wire.ts";
import type {CurrentSchematicRelevanceUploadSerializeCommand} from "./current-schematic-relevance-upload-serialize-protocol.ts";
import {currentSchematicRelevanceUploadModelWire} from "./current-schematic-relevance-upload-model-wire.ts";
import type {CurrentSchematicRelevanceUploadModelCommand} from "./current-schematic-relevance-upload-model-protocol.ts";
import {currentSchematicRelevanceUploadEntryWire} from "./current-schematic-relevance-upload-entry-wire.ts";
import type {CurrentSchematicRelevanceUploadEntryCommand} from "./current-schematic-relevance-upload-entry-protocol.ts";
import { currentFootprintInverseGetSendWire } from "./current-footprint-inverse-get-send-protocol.ts";
import type { CurrentFootprintInverseGetSendCommand } from "./current-footprint-inverse-get-send-protocol.ts";
import { currentFootprintInverseGetCallbackWire } from "./current-footprint-inverse-get-callback-protocol.ts";
import type { CurrentFootprintInverseGetCallbackCommand } from "./current-footprint-inverse-get-callback-protocol.ts";
import {currentSchematicRelevanceNoEchoWire} from "./current-schematic-relevance-noecho-wire.ts";
import type {CurrentSchematicRelevanceNoEchoCommand} from "./current-schematic-relevance-noecho-protocol.ts";
import { currentSchematicRelevanceSavedSceneWire } from "./current-schematic-relevance-saved-scene-protocol.ts";
import type { CurrentSchematicRelevanceSavedSceneCommand } from "./current-schematic-relevance-saved-scene-protocol.ts";
import { currentSchematicRelevanceSavedOpeningWire } from "./current-schematic-relevance-saved-opening-wire.ts";
import type { CurrentSchematicRelevanceSavedOpeningPhase } from "./current-schematic-relevance-saved-opening-programs.ts";
import { currentSchematicRelevanceSavedColdWire } from "./current-schematic-relevance-saved-cold-wire.ts";
import { currentSchematicRelevanceSavedRegistrationWire, decodeCurrentSchematicRelevanceSavedRegistrationReply } from "./current-schematic-relevance-saved-registration.ts";
import type { CurrentSchematicRelevanceSavedRegistrationTarget } from "./current-schematic-relevance-saved-registration.ts";
import { currentSchematicRelevanceSavedCacheWire, currentSchematicRelevanceSavedGuardWire, currentSchematicRelevanceSavedMetadataWire, currentSchematicRelevanceSavedParentWire, currentSchematicRelevanceSavedPreflightWire } from "./current-schematic-relevance-saved-cache-wire.ts";
import { currentSchematicRelevanceSavedEarlyWire } from "./current-schematic-relevance-saved-wire.ts";
import type { CurrentSchematicRelevanceSavedEarlyStage } from "./current-schematic-relevance-saved-wire.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PROFILE as SCH_SAVED_PROFILE } from "./current-schematic-relevance-saved-readback-profile.ts";
import {currentSchematicRelevanceNormalRecordWire} from "./current-schematic-relevance-normal-record-wire.ts";
import type {CurrentSchematicRelevanceNormalRecordCommand} from "./current-schematic-relevance-normal-record-protocol.ts";
import {currentSchematicRelevanceNormalDisposalWire} from "./current-schematic-relevance-normal-disposal-wire.ts";
import type {CurrentSchematicRelevanceNormalDisposalCommand} from "./current-schematic-relevance-normal-disposal-protocol.ts";
import {currentSchematicRelevanceNormalUpdateWire} from "./current-schematic-relevance-normal-update-wire.ts";
import type {CurrentSchematicRelevanceNormalUpdateCommand} from "./current-schematic-relevance-normal-update-protocol.ts";
import {currentSchematicRelevanceHistoryCommandWire} from "./current-schematic-relevance-history-command-wire.ts";
import type {CurrentSchematicRelevanceHistoryCommand} from "./current-schematic-relevance-history-command-protocol.ts";
import { currentFootprintInverseGetManagerWire } from "./current-footprint-inverse-get-manager-protocol.ts";
import type { CurrentFootprintInverseGetManagerCommand } from "./current-footprint-inverse-get-manager-protocol.ts";
import { currentFootprintInverseGetForwardingWire } from "./current-footprint-inverse-get-forwarding-protocol.ts";
import type { CurrentFootprintInverseGetForwardingCommand } from "./current-footprint-inverse-get-forwarding-protocol.ts";
import { currentSchematicRelevanceMonitorBatchWire } from "./current-schematic-relevance-monitor-batch-wire.ts";
import type { CurrentSchematicRelevanceMonitorBatchCommand } from "./current-schematic-relevance-monitor-batch-protocol.ts";
import { currentFootprintInverseGetIntrinsicsWire } from "./current-footprint-inverse-get-intrinsics-protocol.ts";
import type { CurrentFootprintInverseGetIntrinsicsCommand } from "./current-footprint-inverse-get-intrinsics-protocol.ts";
import { currentFootprintInverseLookupPreentryWire } from "./current-footprint-inverse-lookup-preentry-protocol.ts";
import type { CurrentFootprintInverseLookupPreentryCommand } from "./current-footprint-inverse-lookup-preentry-protocol.ts";
import { currentFootprintInverseGetRpcEntryWire } from "./current-footprint-inverse-get-rpc-entry-protocol.ts";
import type { CurrentFootprintInverseGetRpcEntryCommand } from "./current-footprint-inverse-get-rpc-entry-protocol.ts";
import { currentFootprintInverseGetCompletionWire } from "./current-footprint-inverse-get-completion-protocol.ts";
import type { CurrentFootprintInverseGetCompletionCommand } from "./current-footprint-inverse-get-completion-protocol.ts";
import { currentFootprintInverseGetNativeWire } from "./current-footprint-inverse-get-native-delivery-protocol.ts";
import type { CurrentFootprintInverseGetNativeCommand } from "./current-footprint-inverse-get-native-delivery-protocol.ts";
import { currentFootprintInverseGetWorkerWire } from "./current-footprint-inverse-get-worker-protocol.ts";
import type { CurrentFootprintInverseGetWorkerCommand } from "./current-footprint-inverse-get-worker-protocol.ts";
import { currentFootprintInverseNativeDeliveryWire } from "./current-footprint-inverse-native-delivery-protocol.ts";
import type { CurrentFootprintInverseNativeDeliveryCommand } from "./current-footprint-inverse-native-delivery-protocol.ts";
import { currentFootprintInverseNativeChannelWire } from "./current-footprint-inverse-native-channel-protocol.ts";
import type { CurrentFootprintInverseNativeChannelCommand } from "./current-footprint-inverse-native-channel-protocol.ts";
import { currentFootprintInverseNativeDeleteSenderWire, validateCurrentFootprintInverseNativeDeleteSenderReadCommand } from "./current-footprint-inverse-native-delete-sender-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteSenderCommand } from "./current-footprint-inverse-native-delete-sender-protocol.ts";
import { currentFootprintInverseNativeDeleteRegistrationWire } from "./current-footprint-inverse-native-delete-registration-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteRegistrationCommand } from "./current-footprint-inverse-native-delete-registration-protocol.ts";
import { currentFootprintInverseNativeDeleteBootstrapWire } from "./current-footprint-inverse-native-delete-bootstrap-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteBootstrapCommand } from "./current-footprint-inverse-native-delete-bootstrap-protocol.ts";
import { currentFootprintInverseUiOwnDataWire } from "./current-footprint-inverse-ui-own-data-protocol.ts";
import type { CurrentFootprintInverseUiOwnDataCommand } from "./current-footprint-inverse-ui-own-data-protocol.ts";
import { currentFootprintInverseOwnDataWire } from "./current-footprint-inverse-own-data-protocol.ts";
import type { CurrentFootprintInverseOwnDataCommand } from "./current-footprint-inverse-own-data-protocol.ts";
import { currentSchematicRelevanceRecordAstWire } from "./current-schematic-relevance-record-ast-wire.ts";
import type { CurrentSchematicRelevanceRecordAstCommand } from "./current-schematic-relevance-record-ast-protocol.ts";
import { currentSchematicRelevancePrimitiveWire } from "./current-schematic-relevance-primitive-wire.ts";
import type { CurrentSchematicRelevancePrimitiveCommand } from "./current-schematic-relevance-primitive-protocol.ts";
import { currentSchematicRelevanceUiPublicationWire } from "./current-schematic-relevance-ui-publication-wire.ts";
import type { CurrentSchematicRelevanceUiPublicationCommand } from "./current-schematic-relevance-ui-publication-protocol.ts";
import { currentFootprintInverseDeleteWorkerPeerWire } from "./current-footprint-inverse-delete-worker-peer-protocol.ts";
import type { CurrentFootprintInverseDeleteWorkerPeerCommand } from "./current-footprint-inverse-delete-worker-peer-protocol.ts";
import { currentFootprintInverseDeleteJobWire } from "./current-footprint-inverse-delete-job-protocol.ts";
import type { CurrentFootprintInverseDeleteJobCommand } from "./current-footprint-inverse-delete-job-protocol.ts";
import { currentFootprintInversePublicPreferencesWire } from "./current-footprint-inverse-public-preferences-protocol.ts";
import type { CurrentFootprintInversePublicPreferencesCommand } from "./current-footprint-inverse-public-preferences-protocol.ts";
import { currentFootprintInversePublicCallWire } from "./current-footprint-inverse-public-call-protocol.ts";
import type { CurrentFootprintInversePublicCallCommand } from "./current-footprint-inverse-public-call-protocol.ts";
import { currentFootprintInverseDeleteRpcWire } from "./current-footprint-inverse-delete-rpc-protocol.ts";
import type { CurrentFootprintInverseDeleteRpcCommand } from "./current-footprint-inverse-delete-rpc-protocol.ts";
import { currentFootprintInversePublicServiceWire } from "./current-footprint-inverse-public-service-protocol.ts";
import type { CurrentFootprintInversePublicServiceCommand } from "./current-footprint-inverse-public-service-protocol.ts";
import { currentFootprintInversePublicApiWire } from "./current-footprint-inverse-public-api-protocol.ts";
import type { CurrentFootprintInversePublicApiCommand } from "./current-footprint-inverse-public-api-protocol.ts";
import { currentFootprintInverseDeleteEntryWire } from "./current-footprint-inverse-delete-entry-protocol.ts";
import type { CurrentFootprintInverseDeleteEntryCommand } from "./current-footprint-inverse-delete-entry-protocol.ts";
import { currentFootprintInverseClockWorkerWire } from "./current-footprint-inverse-clock-worker-protocol.ts";
import type { CurrentFootprintInverseClockWorkerCommand } from "./current-footprint-inverse-clock-worker-protocol.ts";
import { currentFootprintInverseDeleteEncoderWire } from "./current-footprint-inverse-delete-encoder-protocol.ts";
import type { CurrentFootprintInverseDeleteEncoderCommand } from "./current-footprint-inverse-delete-encoder-protocol.ts";
import { currentFootprintInverseDeleteBindingWire } from "./current-footprint-inverse-delete-binding-protocol.ts";
import type { CurrentFootprintInverseDeleteBindingCommand } from "./current-footprint-inverse-delete-binding-protocol.ts";
import { currentSchematicRelevanceDisplayDrainWire, currentSchematicRelevanceDisplayPostSyncWire, currentSchematicRelevanceDisplayTailDeleteWire, currentSchematicRelevanceDisplayTailExtraWire, currentSchematicRelevanceDisplayTailWire } from "./current-schematic-relevance-display-save-drain-wire.ts";
import { currentSchematicRelevanceDisplayLocalCacheWire, currentSchematicRelevanceDisplayLocalWire, currentSchematicRelevanceDisplayUploadWire } from "./current-schematic-relevance-display-save-upload-wire.ts";
import { currentSchematicRelevanceDisplayObservedSourceWire } from "./current-schematic-relevance-display-observed-source.ts";
import type { CurrentProjectLibraryRefreshCommand } from "./current-project-library-refresh-protocol.ts";
import { currentProjectLibraryRefreshEnvelope, currentProjectLibraryRefreshWire } from "./current-project-library-refresh-wire.ts";
import { currentSchematicRelevanceDisplaySyncQuiesceWire } from "./current-schematic-relevance-display-sync-quiesce-wire.ts";
import { currentFootprintInverseModelStepWire } from "./current-footprint-inverse-model-step-protocol.ts";
import type { CurrentFootprintInverseModelStepCommand } from "./current-footprint-inverse-model-step-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_EDIT_NATIVE_PROFILE } from "./current-schematic-wire-edit-native-profile.ts";
import { currentSchematicWireEditNativeCommand } from "./current-schematic-wire-edit-native-command.ts";
import type { CurrentSchematicWireEditNativeCommand } from "./current-schematic-wire-edit-native-command.ts";

import { currentFootprintInverseInitialSyncWire } from "./current-footprint-inverse-initial-sync-wire.ts";
import type { CurrentFootprintInverseInitialSyncNativeCommand } from "./current-footprint-inverse-initial-sync-protocol.ts";import { currentFootprintInverseInitialCacheWire } from "./current-footprint-inverse-initial-cache-wire.ts";
import type { CurrentFootprintInverseInitialCacheCommand } from "./current-footprint-inverse-initial-cache-protocol.ts";
import { currentSchematicRelevanceRunGuardWire } from "./current-schematic-relevance-run-guard-wire.ts";
import type { CurrentSchematicRelevanceRunGuardStep } from "./current-schematic-relevance-run-guard-controller.ts";
import { currentSchematicRelevanceRunPrefixWire } from "./current-schematic-relevance-run-prefix-wire.ts";
import type { CurrentSchematicRelevanceRunPrefixCommand } from "./current-schematic-relevance-run-prefix-protocol.ts";
import { currentSchematicRelevanceDisplayModifyEntryWire } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import { currentFootprintInverseStartupQueueWire } from "./current-footprint-inverse-startup-queue-protocol.ts";
import type { CurrentFootprintInverseStartupQueueCommand } from "./current-footprint-inverse-startup-queue-protocol.ts";
import { currentFootprintInverseConditionWire } from "./current-footprint-inverse-condition-source.ts";
import { currentFootprintInverseTimerWire } from "./current-footprint-inverse-timer-protocol.ts";
import type { CurrentFootprintInverseTimerCommand } from "./current-footprint-inverse-timer-protocol.ts";
import { currentFootprintInverseStartupCallbackWire } from "./current-footprint-inverse-startup-callback-protocol.ts";
import type { CurrentFootprintInverseStartupCallbackCommand } from "./current-footprint-inverse-startup-callback-protocol.ts";
import type { CurrentSchematicRelevanceDisplayNativeCommand } from "./current-schematic-relevance-display-native-command.ts";
import { currentSchematicRelevanceDisplayNativeCommand } from "./current-schematic-relevance-display-native-command.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PROFILE } from "./current-schematic-relevance-display-write-native-profile.ts";
import { currentPcbViaObservedSourceWire } from "./current-pcb-via-observed-source-protocol.ts";
import type { CurrentPcbViaObservedSourceCommand } from "./current-pcb-via-observed-source-protocol.ts";
import { CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM } from "./current-pcb-via-replay-program.ts";
import { currentPcbViaSaveDrainWire } from "./current-pcb-via-save-drain-wire.ts";
import type { CurrentPcbViaSaveDrainCommand } from "./current-pcb-via-save-drain-protocol.ts";
import { currentPcbViaPostHistorySyncWire } from "./current-pcb-via-post-history-sync-wire.ts";
import type { CurrentPcbViaPostHistorySyncTransportCommand } from "./current-pcb-via-post-history-sync-wire.ts";
import type { CurrentPcbViaPostHistorySyncCommand } from "./current-pcb-via-post-history-sync-protocol.ts";
import { currentPcbViaSaveTailDeleteControlWire } from "./current-pcb-via-save-tail-delete-control-wire.ts";
import type { CurrentPcbViaSaveTailDeleteControlCommand } from "./current-pcb-via-save-tail-delete-control-protocol.ts";
import { currentPcbViaSaveTailObservationWire } from "./current-pcb-via-save-tail-observation-wire.ts";
import { currentPcbViaSaveTailExtraObservationWire } from "./current-pcb-via-save-tail-extra-observation-wire.ts";
import type { CurrentPcbViaSaveTailObservationCommand } from "./current-pcb-via-save-tail-observation-protocol.ts";
import { currentFootprintInverseCacheInvalidationWire, currentFootprintInverseCacheMetadataWire, currentFootprintInverseCacheWire } from "./current-footprint-inverse-cache-wire.ts";
import { currentPcbViaUploadRequestWire } from "./current-pcb-via-upload-request-wire.ts";
import type { CurrentPcbViaUploadRequestCommand } from "./current-pcb-via-upload-request-protocol.ts";
import { currentProjectSyncQuiesceWire } from "./current-project-sync-quiesce-wire.ts";
import type { CurrentProjectSyncQuiesceCommand } from "./current-project-sync-quiesce-protocol.ts";
import { currentPcbViaLocalUploadWire } from "./current-pcb-via-local-upload-wire.ts";
import type { CurrentPcbViaLocalUploadCommand } from "./current-pcb-via-local-upload-protocol.ts";
import { currentFootprintInverseProducerArmWire } from "./current-footprint-inverse-producer-protocol.ts";
import type { CurrentFootprintInverseProducerArmCommand } from "./current-footprint-inverse-producer-protocol.ts";
import { currentFootprintInverseConstructionWire } from "./current-footprint-inverse-construction-protocol.ts";
import type { CurrentFootprintInverseConstructionCommand } from "./current-footprint-inverse-construction-protocol.ts";
import { currentGeneratedPeriodicSyncWire } from "./current-generated-periodic-sync-wire.ts";
import type { CurrentGeneratedPeriodicSyncCommand } from "./current-generated-periodic-sync-protocol.ts";
/** Internal helper-owned Chromium diagnostic pipe for validation only.
 * Byte streams are not process/Job authority,
 * and discovery replies are not frame, worker, script or CAD admission.
 *
 * Electron 41.2.1 requests Browser::Quit on debugging-pipe disconnect. This
 * class therefore NEVER ends, destroys or closes either stream, even on error.
 * The original native owner must retain both pipe handles until its reviewed
 * application-closure policy permits release. No TCP endpoint is supported. */
import { currentFootprintInverseColdStepWire } from "./current-footprint-inverse-cold-step-protocol.ts";
import type { CurrentFootprintInverseColdStepCommand } from "./current-footprint-inverse-cold-step-protocol.ts";
import { currentFootprintInverseColdLoadWire } from "./current-footprint-inverse-cold-load-protocol.ts";
import type { CurrentFootprintInverseColdLoadCommand } from "./current-footprint-inverse-cold-load-protocol.ts";
import { currentFootprintInverseActorWire, currentFootprintInverseParentWire, currentFootprintInverseWorkerWire } from "./current-footprint-inverse-worker-wire.ts";
import type { CurrentFootprintInverseActorStage } from "./current-footprint-inverse-worker-wire.ts";
import type { CurrentFootprintInverseWorkerPair } from "./current-footprint-inverse-worker-controller.ts";
import type { CurrentPcbViaSavedLoadBootstrapCommand } from "./current-pcb-via-saved-load-bootstrap-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE } from "./current-footprint-inverse-native-profile.ts";
import { currentFootprintInverseRegistrationParams, decodeCurrentFootprintInverseRegistrationReply } from "./current-footprint-inverse-registration.ts";
import { types } from "node:util";
import { currentGeneratedInitialSyncWire } from "./current-generated-initial-sync-wire.ts";
import type { CurrentGeneratedInitialSyncCommand } from "./current-generated-initial-sync-protocol.ts";
import { currentGeneratedInitialCacheWire } from "./current-generated-initial-cache-wire.ts";
import type { CurrentGeneratedInitialCacheCommand } from "./current-generated-initial-cache-protocol.ts";

import { currentPcbViaSavedStartPageWire } from "./current-pcb-via-saved-start-page-protocol.ts";
import type { CurrentPcbViaSavedStartPageCommand, CurrentPcbViaSavedStartPagePhase } from "./current-pcb-via-saved-start-page-protocol.ts";
import { currentPcbViaSavedSceneWire } from "./current-pcb-via-saved-scene-protocol.ts";
import type { CurrentPcbViaSavedSceneCommand } from "./current-pcb-via-saved-scene-protocol.ts";
import type { CurrentPcbViaSavedModelPhase } from "./current-pcb-via-saved-model-protocol.ts";
import { currentPcbViaSavedLoadWorkerFrame } from "./current-pcb-via-saved-load-worker-wire.ts";
import type { CurrentPcbViaSavedLoadWorkerCommand } from "./current-pcb-via-saved-load-worker-wire.ts";
import type { CurrentPcbViaSavedLoadWorkerPair } from "./current-pcb-via-saved-load-controller.ts";
import { currentProjectSaveProducerWire } from "./current-project-save-producer-wire.ts";
import type { CurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import { currentPcbViaSavedCacheMetadataWire } from "./current-pcb-via-saved-cache-metadata-wire.ts";
import type { CurrentPcbViaSavedCacheMetadataPlan } from "./current-pcb-via-saved-cache-metadata-ledger.ts";
import { currentPcbViaSavedCacheWire, currentPcbViaSavedEarlyActorWire, currentPcbViaSavedReadbackActorWire, currentPcbViaSavedReadbackParentWire } from "./current-pcb-via-saved-cache-wire.ts";
import type { CurrentPcbViaSavedEarlyActorStage, CurrentPcbViaSavedEarlyActorWire } from "./current-pcb-via-saved-cache-wire.ts";
import type { CurrentPcbViaSavedCachePlan } from "./current-pcb-via-saved-cache-ledger.ts";
import { CURRENT_PCB_VIA_SAVED_READBACK_PROFILE } from "./current-pcb-via-saved-readback-profile.ts";
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
import { currentSchematicDisplayActionGuardWire } from "./current-schematic-display-action-guard-protocol.ts";
import type { CurrentSchematicDisplayActionGuardCommand } from "./current-schematic-display-action-guard-protocol.ts";
import { currentSchematicDisplayActionWire } from "./current-schematic-display-action-wire.ts";
import type { CurrentSchematicDisplayActionCommand } from "./current-schematic-display-action-protocol.ts";
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
type PeriodicSyncWireCommand = CurrentGeneratedPeriodicSyncCommand & Readonly<{ periodicSyncCommand: true }>;
type InitialSyncWireCommand = CurrentGeneratedInitialSyncCommand & Readonly<{ initialSyncCommand: true }>;
type InitialCacheWireCommand = CurrentGeneratedInitialCacheCommand & Readonly<{ initialCacheCommand: true }>;
type ProducerObserveWireCommand = CurrentProjectSaveProducerCommand & Readonly<{ producerObserveCommand: true }>;
type ProducerGuardWireCommand = CurrentProjectSaveProducerGuardCommand & Readonly<{ producerGuardCommand: true }>;
type StructureTransportWireCommand = CurrentProjectStructureTransportCommand & Readonly<{ structureTransportCommand: true }>;
type SavedReadbackCacheWire = CurrentPcbViaSavedEarlyActorWire | ReturnType<typeof currentPcbViaSavedReadbackActorWire> | ReturnType<typeof currentPcbViaSavedCacheMetadataWire> | ReturnType<typeof currentPcbViaSavedCacheWire> | ReturnType<typeof currentPcbViaSavedReadbackParentWire>;
type RequestPhase = "inverse-native-get-task-manager" | "inverse-native-get-task-callback" | "schematic-relevance-publication-return" | "schematic-relevance-modify-return" | "schematic-relevance-modify-canvas" | "inverse-native-get-task-dependencies" | "inverse-native-get-task-intrinsics" | "inverse-native-get-task-sender" | "inverse-native-get-lookup" | "inverse-native-get-worker" | "inverse-native-delete-sender" | "inverse-native-delete-registration" | "schematic-relevance-modify-cm-control" | "schematic-relevance-modify-structure" | "inverse-native-delete-bootstrap" | "inverse-delete-send" | "schematic-relevance-modify-control" | "schematic-relevance-modify-worker" | "schematic-relevance-publication" | "schematic-relevance-notification" | "schematic-relevance-sdk-gate" | "inverse-delete-callback" | "inverse-delete-manager" | "inverse-delete-collateral" | "inverse-delete-prefix" | "inverse-reference-progress" | "inverse-reference-result" | "inverse-reference-send" | "schematic-relevance-normal-command-ui" | "schematic-relevance-file-save-ui" | "inverse-reference-callback" | "schematic-relevance-render-delegate" | "inverse-reference-dispatch" | "inverse-reference-worker" | "inverse-reference-ui" | "schematic-relevance-status-tab-mutation" | "schematic-relevance-status-tab-lookup" | "schematic-relevance-status-subscriber" | "inverse-reference-entry" | "schematic-relevance-status-clone" | "inverse-get-result" | "schematic-relevance-status-delivery" | "schematic-relevance-status-bus" | "schematic-relevance-history-status" | "schematic-relevance-upload-return" | "inverse-get-send" | "schematic-relevance-pending-cache" | "schematic-saved-scene" | "schematic-saved-open-preflight" | "schematic-saved-open-project" | "schematic-saved-open-page" | "schematic-saved-register" | "schematic-saved-cold" | "schematic-relevance-upload-cm" | "schematic-saved-guard" | "schematic-relevance-upload-serialize" | "schematic-saved-parent" | "schematic-saved-preflight" | "schematic-saved-cache" | "schematic-saved-metadata" | "schematic-relevance-upload-model" | "inverse-get-callback" | "schematic-relevance-upload-entry" | "schematic-saved-early-actors" | "schematic-relevance-noecho" | "inverse-get-completion" | "inverse-get-native" | "inverse-get-manager" | "inverse-get-forwarding" | "schematic-relevance-normal-record" | "schematic-relevance-normal-disposal" | "schematic-relevance-normal-update" | "inverse-get-rpc-entry" | "schematic-relevance-history-command" | "inverse-get-worker" | "inverse-get-intrinsics" | "schematic-relevance-monitor-batch" | "schematic-relevance-record-ast" | "inverse-native-delivery" | "schematic-relevance-primitive" | "inverse-lookup-preentry" | "schematic-relevance-ui-publication" | "inverse-native-channel" | "inverse-ui-own-data" | "inverse-own-data" | "inverse-public-preferences" | "inverse-delete-worker-peer" | "inverse-delete-job" | "inverse-delete-rpc" | "inverse-public-call" | "inverse-delete-entry" | "inverse-public-service" | "schematic-relevance-run-guard" | "schematic-relevance-run-prefix" | "inverse-clock-worker" | "inverse-public-api" | "inverse-delete-encoder" | "inverse-delete-bindings" | "inverse-library-refresh" | "relevance-save-tail" | "relevance-save-tail-extra" | "relevance-save-tail-delete" | "relevance-save-drain" | "relevance-save-post-sync" | "relevance-observed-source" | "schematic-relevance-library" | "relevance-save-local" | "relevance-save-upload" | "relevance-local-cache" | "schematic-relevance-quiesce" | "inverse-model-step" | "schematic-relevance-clock" | "inverse-initial-sync" | "schematic-relevance-modify-entry" | "inverse-initial-cache" | "inverse-startup-queue" | "inverse-timer" | "inverse-condition-source" | "inverse-startup-callback" | "schematic-action-guard" | "inverse-cold-step" | "schematic-action" | "inverse-cold" | "via-observed-source" | "via-save-drain" | "via-post-sync" | "inverse-producer-arm" | "via-tail-delete" | "via-tail-observe" | "via-tail-extra" | "via-upload-request" | "inverse-cache-invalidate" | "sync-quiesce" | "inverse-cache" | "inverse-cache-metadata" | "inverse-cache-guard" | "inverse-construction" | "saved-readback-start-page" | "via-local" | "inverse-actors" | "inverse-parent" | "inverse-worker" | "inverse-project-open" | "saved-readback-scene" | "saved-readback-model" | "periodic-sync" | "saved-readback-project-preflight" | "saved-readback-open-project" | "inverse-preflight" | "inverse-register" | "saved-readback-early-actors" | "saved-readback-register" | "initial-sync" | "initial-cache" | "saved-readback-worker" | "saved-readback-load-guard" | "saved-readback-actors" | "saved-readback-cache-guard" | "saved-readback-metadata" | "saved-readback-parent" | "saved-readback-cache" | "producer-observe" | "producer-guard" | "structure-transport" | "schematic-accessor" | "schematic-clock" | "schematic-worker" | "schematic-parent-arm" | "schematic-parent-running" | `schematic-display-${CurrentSchematicDisplayNativePhase}` | "via-clock" | "via-worker" | "via-parent-arm" | "via-parent-running" | "generated-fixture-register" | "renderer-capture209" | "discovery" | "frame-owner" | "worker-discovery" | "worker-state" | "schematic-relevance-modify-echo" |
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
const REQUEST_PHASES = ["inverse-native-get-task-manager", "inverse-native-get-task-callback", "schematic-relevance-publication-return", "schematic-relevance-modify-return", "schematic-relevance-modify-canvas", "inverse-native-get-task-dependencies", "inverse-native-get-task-intrinsics", "inverse-native-get-task-sender", "inverse-native-get-lookup", "inverse-native-get-worker", "schematic-relevance-modify-cm-control", "inverse-native-delete-sender", "inverse-native-delete-registration", "schematic-relevance-modify-structure", "inverse-native-delete-bootstrap", "schematic-relevance-modify-control", "inverse-delete-send", "schematic-relevance-modify-worker", "schematic-relevance-publication", "schematic-relevance-notification", "schematic-relevance-sdk-gate", "inverse-delete-callback", "inverse-delete-manager", "inverse-delete-collateral", "inverse-delete-prefix", "inverse-reference-progress", "inverse-reference-result", "inverse-reference-send", "schematic-relevance-normal-command-ui", "schematic-relevance-file-save-ui", "inverse-reference-callback", "schematic-relevance-render-delegate", "inverse-reference-dispatch", "inverse-reference-worker", "inverse-reference-ui", "schematic-relevance-status-tab-mutation", "schematic-relevance-status-tab-lookup", "schematic-relevance-status-subscriber", "inverse-reference-entry", "schematic-relevance-status-clone", "inverse-get-result", "schematic-relevance-status-delivery", "schematic-relevance-status-bus", "schematic-relevance-history-status", "schematic-relevance-upload-return", "inverse-get-send", "schematic-relevance-pending-cache", "schematic-relevance-upload-cm", "schematic-relevance-upload-serialize", "schematic-relevance-upload-model", "inverse-get-callback", "schematic-relevance-upload-entry", "schematic-relevance-noecho", "inverse-get-completion", "inverse-get-native", "inverse-get-manager", "inverse-get-forwarding", "schematic-relevance-normal-record", "schematic-relevance-normal-disposal", "schematic-relevance-normal-update", "inverse-get-rpc-entry", "schematic-relevance-history-command", "inverse-get-worker", "inverse-get-intrinsics", "schematic-relevance-monitor-batch", "schematic-relevance-record-ast", "inverse-native-delivery", "schematic-relevance-primitive", "inverse-lookup-preentry", "schematic-relevance-ui-publication", "inverse-native-channel", "inverse-ui-own-data", "inverse-own-data", "inverse-public-preferences", "inverse-delete-worker-peer", "inverse-delete-job", "inverse-delete-rpc", "inverse-delete-entry", "schematic-relevance-run-prefix", "schematic-relevance-run-guard", "inverse-public-service", "inverse-public-call", "inverse-clock-worker", "inverse-public-api", "inverse-delete-encoder", "inverse-delete-bindings", "inverse-library-refresh", "relevance-save-tail", "relevance-save-tail-extra", "relevance-save-tail-delete", "relevance-save-drain", "relevance-save-post-sync", "relevance-observed-source", "relevance-save-local", "relevance-save-upload", "relevance-local-cache","schematic-relevance-library","schematic-relevance-quiesce","schematic-relevance-clock","schematic-relevance-modify-entry","inverse-preflight", "inverse-register",
  "spatial-bindings-component", "spatial-read-component",
  "renderer-capture209",
  "discovery", "frame-owner", "worker-discovery", "worker-state", "project-preflight", "project-open-project", "generated-fixture-register", "saved-readback-start-page", "saved-readback-scene", "saved-readback-model", "saved-readback-register", "saved-readback-project-preflight", "saved-readback-open-project",
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
  readonly #schematicRelevanceDisplayPurpose: boolean;
  readonly #schematicWireEditPurpose: boolean;
  readonly #viaSpatial = { before: { binding: null as CurrentPcbSpatialBinding | null, stage: 0, read: false, released: false }, after: { binding: null as CurrentPcbSpatialBinding | null, stage: 0, read: false, released: false } };
  #schematicWorkerEvent: ((event: DiagnosticEvent) => void) | null = null;
  #schematicWorkerSession: string | null = null;
  #schematicParentRunning = false;
  readonly #schematicWaitingWorkers = new Set<string>();
  #viaProperties = 0;
  #viaWorkerEvent: ((event: DiagnosticEvent) => void) | null = null;
  #viaWorkerSession: string | null = null;
  #schematicStructureTransportContext: string | null = null;
  #viaProducerContext: string | null = null; #schematicProducerContext: string | null = null;
  #viaStructureTransportContext: string | null = null;
  #schematicRelevanceModifyOriginal: Promise<Reply> | null = null; #schematicRelevanceModifySlot: Pending | null = null;
  #schematicActionGuardBinding: Readonly<{ scriptId: string; variant: 0 | 1 }> | null = null;
  #schematicRelevanceSaveOriginal: Promise<Reply> | null = null;
  #schematicRelevanceSaveSlot: Pending | null = null;
  #schematicRelevanceClockBinding: Readonly<{ workerContext: string; uiSdk: string }> | null = null;
  #schematicClockBinding: Readonly<{ workerContext: string; uiSdk: string }> | null = null;
  #viaClockBinding: Readonly<{ workerContext: string; uiSdk: string }> | null = null;
  #viaParentRunning = false;
  readonly #viaWaitingWorkers = new Set<string>();
  readonly #viaStages = new Set<CurrentPcbViaWriteStage>();
  readonly #spatialPurpose: boolean;
  readonly #componentSpatialPurpose: boolean;
  #componentClonedSelected:boolean|null=null;
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
  #inverseNativeGetTaskPending: Pending | null = null;
  #inverseNativeGetTaskOriginalSlot: Pending | null = null;
  #inverseNativeGetTaskOriginal: Promise<Reply> | null = null;
  #inverseNativeGetTaskWritten: PromiseWithResolvers<undefined> | null = null;
  #inverseNativeGetLookupPending: Pending | null = null;
  #inverseNativeGetLookupOriginalSlot: Pending | null = null;
  #inverseNativeGetLookupOriginal: Promise<Reply> | null = null;
  #inverseNativeGetLookupWritten: PromiseWithResolvers<undefined> | null = null;
  #inversePublicDeletePending: Pending | null = null;
  #inversePublicDeleteOriginal: Promise<Reply> | null = null;
  #inversePublicDeleteWritten: PromiseWithResolvers<undefined> | null = null;
  #inversePublicDeleteOriginalSlot: Pending | null = null;
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
  readonly #savedReadbackPurpose: boolean;
  #inverseActorEvent: ((event: DiagnosticEvent) => "held" | "project") | null = null;
  #inverseWorkerEvent: ((event: DiagnosticEvent) => void) | null = null;
  #inverseActorStep = 0; #inverseParent = false; #inverseProjectOpening = false;
  #inverseWorkerPair: CurrentFootprintInverseWorkerPair | null = null; readonly #inverseWorkerSlots = new Set<string>();
  readonly #inversePurpose: boolean;
  #inverseTarget: string | null = null;
  #inverseContext: string | null = null;
  #inverseOpeningConsumed = false;
  #inverseOriginalPending: Pending | null = null;
  #inverseOriginalPromise: Promise<Reply> | null = null;
  #inverseOriginalReply: Reply | null = null;
  #inverseOriginalSettled = false;
  #savedReadbackLoadEvent: ((event: DiagnosticEvent) => void) | null = null;
  #savedReadbackObservation = false; #savedReadbackRegistrationAttempted = false; #savedReadbackRegistrationPromise: Promise<Reply> | null = null; #savedReadbackRegistrationSlot: Pending | null = null;
  #savedReadbackOpening = false; readonly #savedReadbackOpeningPhases = new Set<CurrentPcbDiagnosticOpeningPhase>();
  #savedReadbackLoadPair: CurrentPcbViaSavedLoadWorkerPair | null = null; readonly #savedReadbackLoadSlots = new Set<string>();
  #savedReadbackActors = false; #savedReadbackLoadingGuard = false; #savedReadbackGuard = 0; #savedReadbackDiscovery = 0; #savedReadbackPreflight = 0; #savedReadbackCache = 0; #savedReadbackMetadata = 0; #savedReadbackParent = false;
  readonly #schematicSavedPurpose: boolean;
  #schematicSavedScene = false; readonly #schematicSavedSceneStages = new Set<string>();
  #schematicSavedOpening = false; readonly #schematicSavedOpeningStages = new Set<CurrentSchematicRelevanceSavedOpeningPhase>();
  #schematicDisplayRegistrationAttempted = false; #schematicDisplayRegistrationPromise: Promise<Reply> | null = null; #schematicDisplayRegistrationSlot: Pending | null = null; #schematicDisplayRegistrationTarget: string | null = null;
  #schematicSavedRegistrationAttempted = false; #schematicSavedRegistrationPromise: Promise<Reply> | null = null; #schematicSavedRegistrationSlot: Pending | null = null;
  #schematicSavedRegistrationTarget: string | null = null;
  #schematicSavedColdEvent: ((event: DiagnosticEvent) => void) | null = null; #schematicSavedColdPair: CurrentPcbViaSavedLoadWorkerPair | null = null; #schematicSavedColdObservation = false;
  readonly #schematicSavedColdSlots = new Set<string>();
  #schematicSavedBackup = false; readonly #schematicSavedGuards = new Set<string>();
  #schematicSavedParent = false; #schematicSavedPreflight = false; #schematicSavedCacheCount = 0; #schematicSavedMetadataCount = 0; #schematicSavedDiscovery = 0;
  #schematicSavedEarlyStep = 0;
  #schematicSavedEarlyEvent: ((event: DiagnosticEvent) => "held" | "project") | null = null;
  #savedReadbackEarlyActorStep = 0;
  #savedReadbackEarlyActorEvent: ((event: DiagnosticEvent) => "held" | "project") | null = null;
  #eventCount = 0;
  #eventBytes = 0;
  #workerEvent: ((event: DiagnosticEvent) => void) | null = null;
  readonly #workerSessions = new Map<string, string>();
  #workerDiscoverySettled = false;
  #selectedWorkerSession: string | null = null;

  public constructor(input: Readable, output: Writable, purpose: "schematic-relevance-saved-readback209" | "schematic-wire-edit209" | "diagnostic" | "string-precreate" | "worker-startup" | "combined-discovery" | "forward-discovery" | "forward-saved-discovery" | "held-cache-diagnostic" | "pcb-spatial209" | "pcb-component-spatial209" | "pcb-via-write209" | "schematic-display-write209" | "schematic-relevance-display-write209" | "pcb-via-saved-readback209" | "footprint-inverse209",
    observeEventBytes: ((bytes: number) => void) | null = null) {
    if ((purpose === "forward-discovery" || purpose === "forward-saved-discovery" || purpose === "held-cache-diagnostic") !== (observeEventBytes !== null) || observeEventBytes !== null && typeof observeEventBytes !== "function") { throw new Error("PCB_DIAGNOSTIC_FORWARD_ACCOUNTING"); }
    this.#observeEventBytes = observeEventBytes;
    this.#input = input; this.#output = output; this.#stringPurpose = purpose === "string-precreate";
    this.#startupPurpose = purpose === "worker-startup" || purpose === "combined-discovery" || purpose === "forward-discovery" || purpose === "forward-saved-discovery";
    this.#combinedPurpose = purpose === "combined-discovery" || purpose === "forward-discovery";
    this.#heldCacheDiagnosticPurpose = purpose === "held-cache-diagnostic";
    this.#savedReadbackPurpose = purpose === "pcb-via-saved-readback209"; this.#schematicSavedPurpose = purpose === "schematic-relevance-saved-readback209";
    this.#inversePurpose = purpose === "footprint-inverse209";
    this.#componentSpatialPurpose = purpose === "pcb-component-spatial209";
    this.#schematicWireEditPurpose = purpose === "schematic-wire-edit209"; this.#spatialPurpose = purpose === "pcb-spatial209"; this.#viaPurpose = purpose === "pcb-via-write209"; this.#schematicRelevanceDisplayPurpose = purpose === "schematic-relevance-display-write209"; this.#schematicDisplayPurpose = purpose === "schematic-display-write209" || this.#schematicRelevanceDisplayPurpose || this.#schematicWireEditPurpose;
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
      else if (phase === "read-component" || phase === "read-component-cloned") {
        if (this.#spatialStage < 4 || this.#spatialStage > 5 || this.#componentClonedSelected !== (phase === "read-component-cloned") || this.#spatialReads >= (this.#componentClonedSelected ? 11 : 16)) { throw new Error("PCB_COMPONENT_PIPE_READ_SEQUENCE"); }
        this.#spatialReads += 1; this.#spatialStage = 5;
      } else {
        const bindingPhase=phase === "bindings-component-cloned" ? "bindings-component" : phase;
        if (["wrapper", "handler", "bindings-component", "functions"][this.#spatialStage] !== bindingPhase) { throw new Error("PCB_COMPONENT_PIPE_SEQUENCE"); }
        if (phase === "wrapper" && fixed.command.params.uniqueContextId !== binding.uniqueContextId) { throw new Error("PCB_COMPONENT_PIPE_CONTEXT"); }
        if (phase === "bindings-component" || phase === "bindings-component-cloned") {this.#componentClonedSelected=phase === "bindings-component-cloned";}
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
    if (!this.#viaPurpose || this.#sessionId === null || this.#viaWorkerEvent !== null || this.#workerEvent !== null || this.#pending !== null || this.#viaRetainedPending !== null || this.#inversePublicDeletePending !== null || this.#inverseNativeGetLookupPending !== null || this.#inverseNativeGetTaskPending !== null) { throw new Error("PCB_VIA_PARENT_ARM"); }
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
    if (!this.#schematicDisplayPurpose || this.#sessionId === null || this.#schematicWorkerEvent !== null || this.#workerEvent !== null || this.#pending !== null || this.#viaRetainedPending !== null || this.#inversePublicDeletePending !== null || this.#inverseNativeGetLookupPending !== null || this.#inverseNativeGetTaskPending !== null) { throw new Error("SCHEMATIC_DISPLAY_PARENT_ARM"); }
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
  protected bindProducerContext(purpose: "via" | "schematic", context: string): void {
    if (!diagnosticToken(context)) { throw new Error("PROJECT_SAVE_PRODUCER_CONTEXT"); }
    if (purpose === "via") { if (!this.#viaPurpose || this.#viaWorkerSession === null || this.#viaParentRunning || this.#viaProducerContext !== null) { throw new Error("PROJECT_SAVE_PRODUCER_VIA_BINDING"); } this.#viaProducerContext = context; }
    else { if (!this.#schematicDisplayPurpose || this.#schematicWorkerSession === null || this.#schematicParentRunning || this.#schematicProducerContext !== null) { throw new Error("PROJECT_SAVE_PRODUCER_SCHEMATIC_BINDING"); } this.#schematicProducerContext = context; }
  }
  protected continuePeriodicSyncCommand(purpose: "via" | "schematic", input: CurrentGeneratedPeriodicSyncCommand): Promise<Reply> {
    const sessionId = purpose === "via" ? this.#viaWorkerSession : this.#schematicWorkerSession;
    if (sessionId === null || (purpose === "via" ? !this.#viaPurpose : !this.#schematicDisplayPurpose)) { throw new Error("PERIODIC_SYNC_ORIGINAL_SESSION"); }
    const wire = currentGeneratedPeriodicSyncWire(input, this.#nextId, purpose);
    return this.#request({ id: this.#nextId, ...wire.command, periodicSyncCommand: true, sessionId }, "periodic-sync");
  }  protected continueInitialSyncCommand(purpose: "via" | "schematic", input: CurrentGeneratedInitialSyncCommand): Promise<Reply> {
    const sessionId = purpose === "via" ? this.#viaWorkerSession : this.#schematicWorkerSession;
    if (sessionId === null || (purpose === "via" ? !this.#viaPurpose : !this.#schematicDisplayPurpose)) { throw new Error("INITIAL_SYNC_ORIGINAL_SESSION"); }
    const wire = currentGeneratedInitialSyncWire(input, this.#nextId, purpose);
    return this.#request({ id: this.#nextId, ...wire.command, initialSyncCommand: true, sessionId }, "initial-sync");
  }  protected continueInitialCacheCommand(purpose: "via" | "schematic", input: CurrentGeneratedInitialCacheCommand): Promise<Reply> {
    const sessionId = purpose === "via" ? this.#viaWorkerSession : this.#schematicWorkerSession;
    if (sessionId === null || (purpose === "via" ? !this.#viaPurpose : !this.#schematicDisplayPurpose)) { throw new Error("INITIAL_CACHE_ORIGINAL_SESSION"); }
    const wire = currentGeneratedInitialCacheWire(input, this.#nextId, purpose);
    return this.#request({ id: this.#nextId, ...wire.command, initialCacheCommand: true, sessionId }, "initial-cache");
  }
  #viaObservedProgram:((kind:"function"|"expression"|"condition",program:string)=>void)|null=null;
  public bindViaObservedPrograms(observer:(kind:"function"|"expression"|"condition",program:string)=>void):void{if(!this.#viaPurpose||this.#viaWorkerSession===null||this.#viaObservedProgram!==null||typeof observer!=="function"||types.isProxy(observer)){throw new Error("VIA_OBSERVED_PROGRAM_ORIGINAL_BIND");}this.#viaObservedProgram=observer;}
  #relevanceSubmitted:((command:object)=>boolean)|null=null;#relevanceReceipt:((command:object,raw:unknown)=>Promise<void>)|null=null;
  public bindSchematicRelevanceDisplaySubmittedHelpers(before:(command:object)=>boolean,after:(command:object,raw:unknown)=>Promise<void>):void{if(!this.#schematicRelevanceDisplayPurpose||this.#schematicWorkerSession===null||this.#relevanceSubmitted!==null||this.#relevanceReceipt!==null||typeof before!=="function"||typeof after!=="function"||types.isProxy(before)||types.isProxy(after)){throw new Error("RELEVANCE_HELPERS_ORIGINAL_BINDING");}this.#relevanceSubmitted=before;this.#relevanceReceipt=after;}
  protected readSchematicRelevanceDisplaySourceCommand(input:CurrentPcbViaObservedSourceCommand):Promise<Reply>{if(!this.#schematicRelevanceDisplayPurpose||this.#schematicWorkerSession===null||this.#relevanceSubmitted===null){throw new Error("RELEVANCE_HELPER_ORIGINAL_SESSION");}const wire=currentSchematicRelevanceDisplayObservedSourceWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,schematicRelevanceObservedSourceCommand:true,sessionId:this.#schematicWorkerSession},"relevance-observed-source");}
  protected readViaObservedSourceCommand(input:CurrentPcbViaObservedSourceCommand):Promise<Reply>{if(!this.#viaPurpose||this.#viaWorkerSession===null||this.#viaObservedProgram===null){throw new Error("VIA_OBSERVED_SOURCE_ORIGINAL_SESSION");}const wire=currentPcbViaObservedSourceWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,viaObservedSourceCommand:true,sessionId:this.#viaWorkerSession},"via-observed-source");}
  protected continueViaSaveDrainCommand(input:CurrentPcbViaSaveDrainCommand):Promise<Reply>{if(!this.#viaPurpose||this.#viaWorkerSession===null){throw new Error("VIA_DRAIN_ORIGINAL_SESSION");}const wire=currentPcbViaSaveDrainWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,viaSaveDrainCommand:true,sessionId:this.#viaWorkerSession},"via-save-drain");}
  protected continueViaPostSyncCommand(input:CurrentPcbViaPostHistorySyncCommand):Promise<Reply>{if(!this.#viaPurpose||this.#viaWorkerSession===null){throw new Error("VIA_POST_SYNC_ORIGINAL_SESSION");}const wire=currentPcbViaPostHistorySyncWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,viaPostSyncCommand:true,sessionId:this.#viaWorkerSession},"via-post-sync");}
  protected continueViaSaveTailDeleteCommand(input:CurrentPcbViaSaveTailDeleteControlCommand):Promise<Reply>{if(!this.#viaPurpose||this.#viaWorkerSession===null){throw new Error("VIA_TAIL_ORIGINAL_SESSION");}const wire=currentPcbViaSaveTailDeleteControlWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,viaTailDeleteCommand:true,sessionId:this.#viaWorkerSession},"via-tail-delete");}
  protected observeViaSaveTailCommand(input:CurrentPcbViaSaveTailObservationCommand):Promise<Reply>{if(!this.#viaPurpose||this.#viaWorkerSession===null){throw new Error("VIA_TAIL_ORIGINAL_SESSION");}const wire=currentPcbViaSaveTailObservationWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,viaTailObservationCommand:true,sessionId:this.#viaWorkerSession},"via-tail-observe");}
  protected observeViaSaveTailExtraCommand(input:CurrentProjectSaveProducerCommand):Promise<Reply>{if(!this.#viaPurpose||this.#viaWorkerSession===null){throw new Error("VIA_TAIL_ORIGINAL_SESSION");}const wire=currentPcbViaSaveTailExtraObservationWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,viaTailExtraObservationCommand:true,sessionId:this.#viaWorkerSession},"via-tail-extra");}
  protected continueViaUploadRequestCommand(input:CurrentPcbViaUploadRequestCommand):Promise<Reply>{if(!this.#viaPurpose||this.#viaWorkerSession===null){throw new Error("VIA_UPLOAD_ORIGINAL_SESSION");}const wire=currentPcbViaUploadRequestWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,viaUploadRequestCommand:true,sessionId:this.#viaWorkerSession},"via-upload-request");}
  protected observeViaSyncQuiesceCommand(input:CurrentProjectSyncQuiesceCommand):Promise<Reply>{if(!this.#viaPurpose||this.#viaWorkerSession===null){throw new Error("SYNC_QUIESCE_ORIGINAL_SESSION");}const wire=currentProjectSyncQuiesceWire(input,this.#nextId,"via");return this.#request({id:this.#nextId,...wire.command,syncQuiesceCommand:true,sessionId:this.#viaWorkerSession},"sync-quiesce");}
  protected observeSchematicRelevanceDisplayTailCommand(input:CurrentPcbViaSaveTailObservationCommand):Promise<Reply>{if(!this.#schematicRelevanceDisplayPurpose||this.#schematicWorkerSession===null){throw new Error("RELEVANCE_DRAIN_ORIGINAL_SESSION");}const wire=currentSchematicRelevanceDisplayTailWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,schematicRelevanceTailCommand:true,sessionId:this.#schematicWorkerSession},"relevance-save-tail");}
  protected observeSchematicRelevanceDisplayTailExtraCommand(input:CurrentProjectSaveProducerCommand):Promise<Reply>{if(!this.#schematicRelevanceDisplayPurpose||this.#schematicWorkerSession===null){throw new Error("RELEVANCE_DRAIN_ORIGINAL_SESSION");}const wire=currentSchematicRelevanceDisplayTailExtraWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,schematicRelevanceTailExtraCommand:true,sessionId:this.#schematicWorkerSession},"relevance-save-tail-extra");}
  protected continueSchematicRelevanceDisplayTailDeleteCommand(input:CurrentPcbViaSaveTailDeleteControlCommand):Promise<Reply>{if(!this.#schematicRelevanceDisplayPurpose||this.#schematicWorkerSession===null){throw new Error("RELEVANCE_DRAIN_ORIGINAL_SESSION");}const wire=currentSchematicRelevanceDisplayTailDeleteWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,schematicRelevanceTailDeleteCommand:true,sessionId:this.#schematicWorkerSession},"relevance-save-tail-delete");}
  protected continueSchematicRelevanceDisplayDrainCommand(input:CurrentPcbViaSaveDrainCommand):Promise<Reply>{if(!this.#schematicRelevanceDisplayPurpose||this.#schematicWorkerSession===null){throw new Error("RELEVANCE_DRAIN_ORIGINAL_SESSION");}const wire=currentSchematicRelevanceDisplayDrainWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,schematicRelevanceDrainCommand:true,sessionId:this.#schematicWorkerSession},"relevance-save-drain");}
  protected continueSchematicRelevanceDisplayPostHistoryCommand(input:CurrentPcbViaPostHistorySyncCommand):Promise<Reply>{if(!this.#schematicRelevanceDisplayPurpose||this.#schematicWorkerSession===null){throw new Error("RELEVANCE_DRAIN_ORIGINAL_SESSION");}const wire=currentSchematicRelevanceDisplayPostSyncWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,schematicRelevancePostSyncCommand:true,sessionId:this.#schematicWorkerSession},"relevance-save-post-sync");}
  protected continueSchematicRelevanceDisplayLocalCommand(input:CurrentPcbViaLocalUploadCommand):Promise<Reply>{if(!this.#schematicRelevanceDisplayPurpose||this.#schematicWorkerSession===null){throw new Error("RELEVANCE_LOCAL_ORIGINAL_SESSION");}const wire=currentSchematicRelevanceDisplayLocalWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,schematicRelevanceSaveLocalCommand:true,sessionId:this.#schematicWorkerSession},"relevance-save-local");}
  protected continueSchematicRelevanceDisplayUploadCommand(input:CurrentPcbViaUploadRequestCommand):Promise<Reply>{if(!this.#schematicRelevanceDisplayPurpose||this.#schematicWorkerSession===null){throw new Error("RELEVANCE_UPLOAD_ORIGINAL_SESSION");}const wire=currentSchematicRelevanceDisplayUploadWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,schematicRelevanceSaveUploadCommand:true,sessionId:this.#schematicWorkerSession},"relevance-save-upload");}
  protected observeSchematicRelevanceDisplayLocalCacheCommand(input:CurrentProjectSaveProducerCommand):Promise<Reply>{if(!this.#schematicRelevanceDisplayPurpose||this.#schematicWorkerSession===null){throw new Error("RELEVANCE_LOCAL_CACHE_ORIGINAL_SESSION");}const wire=currentSchematicRelevanceDisplayLocalCacheWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,schematicRelevanceLocalCacheCommand:true,sessionId:this.#schematicWorkerSession},"relevance-local-cache");}
  protected continueViaLocalUploadCommand(input: CurrentPcbViaLocalUploadCommand): Promise<Reply> {
    if (!this.#viaPurpose || this.#viaWorkerSession === null) { throw new Error("VIA_LOCAL_ORIGINAL_SESSION"); }
    const wire = currentPcbViaLocalUploadWire(input,this.#nextId);
    return this.#request({ id:this.#nextId,...wire.command,viaLocalUploadCommand:true,sessionId:this.#viaWorkerSession },"via-local");
  }
  protected observeProducerCommand(purpose: "via" | "schematic", input: CurrentProjectSaveProducerCommand): Promise<Reply> {
    const sessionId = purpose === "via" ? this.#viaWorkerSession : this.#schematicWorkerSession;
    if (sessionId === null || (purpose === "via" ? !this.#viaPurpose : !this.#schematicDisplayPurpose)) { throw new Error("PROJECT_SAVE_PRODUCER_ORIGINAL_SESSION"); }
    const context = purpose === "via" ? this.#viaProducerContext : this.#schematicProducerContext;
    if (context === null || input.phase === "project-save-producer-intrinsics-constructors" && input.params.uniqueContextId !== context) { throw new Error("PROJECT_SAVE_PRODUCER_ORIGINAL_CONTEXT"); }
    const wire = currentProjectSaveProducerWire(input, this.#nextId, purpose);
    return this.#request({ id: this.#nextId, ...wire.command, producerObserveCommand: true, sessionId }, "producer-observe");
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
  protected bindSchematicDisplayActionGuardCommand(scriptId: string, variant: 0 | 1): void {
    if (!this.#schematicDisplayPurpose || this.#sessionId === null || this.#schematicActionGuardBinding !== null || !diagnosticToken(scriptId)) { throw new Error("SCHEMATIC_ACTION_GUARD_ORIGINAL_BINDING"); }
    this.#schematicActionGuardBinding = Object.freeze({ scriptId, variant });
  }
  protected observeSchematicDisplayActionGuardCommand(input: CurrentSchematicDisplayActionGuardCommand): Promise<Reply> {
    const binding = this.#schematicActionGuardBinding;
    if (!this.#schematicDisplayPurpose || this.#sessionId === null || binding === null || input.params.location.scriptId !== binding.scriptId || input.variant !== binding.variant) { throw new Error("SCHEMATIC_ACTION_GUARD_ORIGINAL_SOURCE"); }
    const wire = currentSchematicDisplayActionGuardWire(input, this.#nextId);
    if (this.#schematicRelevanceDisplayPurpose) { return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceActionGuardCommand: true, sessionId: this.#sessionId }, "schematic-action-guard"); }
    return this.#request({ id: this.#nextId, ...wire.command, schematicActionGuardCommand: true, sessionId: this.#sessionId }, "schematic-action-guard");
  }
  protected generateSchematicRelevanceDisplaySaveCommand(holder: string, target: unknown, operation: unknown): Promise<Reply> {
    if (!this.#schematicRelevanceDisplayPurpose || this.#sessionId === null || this.#schematicRelevanceClockBinding === null || this.#schematicRelevanceSaveOriginal !== null) { throw new Error("SCHEMATIC_RELEVANCE_SAVE_ORIGINAL_GENERATION"); }
    const command = currentSchematicRelevanceDisplayNativeCommand("save", holder, target, operation);
    const request = this.#request({ id: this.#nextId, ...command, schematicRelevanceSaveGeneration: true, sessionId: this.#sessionId }, "schematic-display-save");
    this.#schematicRelevanceSaveOriginal = request; this.#schematicRelevanceSaveSlot = this.#viaRetainedPending; return request;
  }
  protected requireOriginalSchematicRelevanceDisplaySavePendingCommand(request: Promise<Reply>): void {
    const slot = this.#schematicRelevanceSaveSlot;
    if (!this.#schematicRelevanceDisplayPurpose || request !== this.#schematicRelevanceSaveOriginal || slot === null || this.#viaRetainedPending !== slot || !slot.written || slot.reply !== null || this.#failure !== null) { throw new Error("SCHEMATIC_RELEVANCE_SAVE_ORIGINAL_REQUEST_PENDING"); }
  }
  protected generateSchematicRelevanceDisplayModifyCommand(holder: string, target: unknown, operation: unknown): Promise<Reply> {
    if (!this.#schematicRelevanceDisplayPurpose || this.#sessionId === null || this.#schematicActionGuardBinding === null || this.#schematicRelevanceModifyOriginal !== null) { throw new Error("SCHEMATIC_RELEVANCE_MODIFY_ORIGINAL_GENERATION"); }
    const command = currentSchematicRelevanceDisplayNativeCommand("modify", holder, target, operation);
    const request = this.#request({ id: this.#nextId, ...command, schematicRelevanceModifyGeneration: true, sessionId: this.#sessionId }, "schematic-display-modify");
    this.#schematicRelevanceModifyOriginal = request; this.#schematicRelevanceModifySlot = this.#viaRetainedPending; return request;
  }
  protected requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request: Promise<Reply>): void {
    const slot = this.#schematicRelevanceModifySlot;
    if (!this.#schematicRelevanceDisplayPurpose || request !== this.#schematicRelevanceModifyOriginal || slot === null || this.#viaRetainedPending !== slot || !slot.written || slot.reply !== null || this.#failure !== null) { throw new Error("SCHEMATIC_RELEVANCE_MODIFY_ORIGINAL_REQUEST_PENDING"); }
  }
  protected observeSchematicRelevanceRunGuardCommand(input: CurrentSchematicRelevanceRunGuardStep): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RUN_GUARD_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceRunGuardWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.step.command, schematicRelevanceRunGuardCommand: true, schematicRelevanceRunGuardRole: wire.step.guard, sessionId: this.#sessionId }, "schematic-relevance-run-guard");
  }
  protected observeSchematicRelevanceMonitorBatchCommand(input: CurrentSchematicRelevanceMonitorBatchCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceMonitorBatchWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceMonitorBatchCommand: true, sessionId: this.#sessionId }, "schematic-relevance-monitor-batch");
  }
  protected observeSchematicRelevancePendingCacheCommand(input: CurrentSchematicRelevancePendingCacheCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevancePendingCacheWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevancePendingCacheCommand: true, sessionId: this.#sessionId }, "schematic-relevance-pending-cache");
  }  protected observeSchematicRelevanceUploadReturnCommand(input: CurrentSchematicRelevanceUploadReturnCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceUploadReturnWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceUploadReturnCommand: true, sessionId: this.#sessionId }, "schematic-relevance-upload-return");
  }  protected observeSchematicRelevanceNotificationCommand(input: CurrentSchematicRelevanceNotificationWireCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceNotificationWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceNotificationCommand: true, sessionId: this.#sessionId }, "schematic-relevance-notification");
  }
  /** Submit fixed Canvas data/controls only while this same original own7
   * Modify and worker session remain pending; no caller session is accepted. */
  /** Submit the finite original CM return tail under the same pending Modify
   * and worker session. Timer body control is absent from this purpose. */
  /** Retain the same original UI session and pending Modify for the fixed
   * publisher/timer/local-loopback return tail. */
  /** Keep every fixed Echo read/control under this original pending Modify.
   * The native ledger selects the fixed realm; callers supply no session. */
  protected observeSchematicRelevanceModifyEchoCommand(input: CurrentSchematicRelevanceModifyEchoContinuationCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || this.#schematicWorkerSession === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_ECHO_ORIGINAL_PENDING"); }
    this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request); const wire = currentSchematicRelevanceModifyEchoContinuationWire(input, this.#nextId);
    const worker = input.phase.startsWith("modify-canvas-send-") || input.phase.startsWith("modify-canvas-control-") || "role" in input && input.role.startsWith("worker");
    return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceModifyEchoCommand: true, sessionId: worker ? this.#schematicWorkerSession : this.#sessionId }, "schematic-relevance-modify-echo");
  }
  protected observeSchematicRelevancePublicationReturnCommand(input: CurrentSchematicRelevancePublicationCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_PUBLICATION_RETURN_ORIGINAL_PENDING"); }
    this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request); const wire = currentSchematicRelevancePublicationReturnWire(input, this.#nextId);
    return this.#request({ id: this.#nextId, ...wire.command, schematicRelevancePublicationReturnCommand: true, sessionId: this.#sessionId }, "schematic-relevance-publication-return");
  }
  protected observeSchematicRelevanceModifyReturnCommand(input: CurrentSchematicRelevanceModifyReturnContinuationCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#schematicWorkerSession === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_MODIFY_RETURN_ORIGINAL_PENDING"); }
    this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request); const wire = currentSchematicRelevanceModifyReturnContinuationWire(input, this.#nextId);
    return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceModifyReturnCommand: true, sessionId: this.#schematicWorkerSession }, "schematic-relevance-modify-return");
  }
  protected observeSchematicRelevanceModifyCanvasCommand(input: CurrentSchematicRelevanceModifyCanvasContinuationCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#schematicWorkerSession === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_MODIFY_CANVAS_ORIGINAL_PENDING"); }
    this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request); const wire = currentSchematicRelevanceModifyCanvasContinuationWire(input, this.#nextId);
    return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceModifyCanvasCommand: true, sessionId: this.#schematicWorkerSession }, "schematic-relevance-modify-canvas");
  }
  /** Keep CM preparation and controls under the same pending original Modify
   * and worker session. Each row is revalidated by its fixed native codebook. */
  protected observeSchematicRelevanceModifyCmCommand(input: CurrentSchematicRelevanceModifyCmContinuationCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#schematicWorkerSession === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_MODIFY_CM_ORIGINAL_PENDING"); }
    this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request); const wire = currentSchematicRelevanceModifyCmContinuationWire(input, this.#nextId);
    return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceModifyCmCommand: true, sessionId: this.#schematicWorkerSession }, "schematic-relevance-modify-cm-control");
  }
  /** Keep the dedicated TEXT serial wave inside the same pending original
   * Modify and original worker session; its fixed codebook owns all fields. */
  protected observeSchematicRelevanceModifyStructureCommand(input: CurrentSchematicRelevanceModifyStructureCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#schematicWorkerSession === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_MODIFY_STRUCTURE_ORIGINAL_PENDING"); }
    this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request); const wire = currentSchematicRelevanceModifyStructureWire(input, this.#nextId);
    return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceModifyStructureCommand: true, sessionId: this.#schematicWorkerSession }, "schematic-relevance-modify-structure");
  }
  /** Submit only the fixed original-worker guard/event vocabulary while the
   * same genuine Modify request is retained by this own7 pipe. */
  protected observeSchematicRelevanceModifyContinuationCommand(input: CurrentSchematicRelevanceModifyContinuationCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#schematicWorkerSession === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_MODIFY_CONTROL_ORIGINAL_PENDING"); }
    this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request); const wire = currentSchematicRelevanceModifyContinuationWire(input, this.#nextId);
    return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceModifyContinuationCommand: true, sessionId: this.#schematicWorkerSession }, "schematic-relevance-modify-control");
  }
  protected observeSchematicRelevanceModifyWorkerCommand(input:CurrentSchematicRelevanceModifyWorkerCommand):Promise<Reply>{const request=this.#schematicRelevanceModifyOriginal;if(request===null||this.#schematicWorkerSession===null||!this.#schematicRelevanceDisplayPurpose){throw new Error("SCHEMATIC_MODIFY_WORKER_ORIGINAL_PENDING");}this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);const wire=currentSchematicRelevanceModifyWorkerWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,schematicRelevanceModifyWorkerCommand:true,sessionId:this.#schematicWorkerSession},"schematic-relevance-modify-worker");}
  protected observeSchematicRelevancePublicationCommand(input:CurrentSchematicRelevancePublicationCommand):Promise<Reply>{
    const request=this.#schematicRelevanceModifyOriginal;if(request===null||this.#sessionId===null||!this.#schematicRelevanceDisplayPurpose){throw new Error("SCHEMATIC_PUBLICATION_ORIGINAL_PENDING");}this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire=currentSchematicRelevancePublicationWire(input,this.#nextId);return this.#request({id:this.#nextId,...wire.command,schematicRelevancePublicationCommand:true,sessionId:this.#sessionId},"schematic-relevance-publication");
  }
  /** Submit a fixed SDK-gate command only for the same original pending schematic Modify request.
   * The wire encoder supplies the command fields after the own-purpose and session checks.
   */
  protected observeSchematicRelevanceSdkGateCommand(input: CurrentSchematicRelevanceSdkGateCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceSdkGateWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceSdkGateCommand: true, sessionId: this.#sessionId }, "schematic-relevance-sdk-gate");
  }
  protected observeSchematicRelevanceNormalCommandUiCommand(input: CurrentSchematicRelevanceNormalCommandUiCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceNormalCommandUiWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceNormalCommandUiCommand: true, sessionId: this.#sessionId }, "schematic-relevance-normal-command-ui");
  }
  protected observeSchematicRelevanceFileSaveUiCommand(input: CurrentSchematicRelevanceFileSaveUiCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceFileSaveUiWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceFileSaveUiCommand: true, sessionId: this.#sessionId }, "schematic-relevance-file-save-ui");
  }
  protected observeSchematicRelevanceRenderDelegateCommand(input: CurrentSchematicRelevanceRenderDelegateCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceRenderDelegateWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceRenderDelegateCommand: true, sessionId: this.#sessionId }, "schematic-relevance-render-delegate");
  }
  protected observeSchematicRelevanceStatusTabMutationCommand(input: CurrentSchematicRelevanceStatusTabMutationCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceStatusTabMutationWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceStatusTabMutationCommand: true, sessionId: this.#sessionId }, "schematic-relevance-status-tab-mutation");
  }
  protected observeSchematicRelevanceStatusTabLookupCommand(input: CurrentSchematicRelevanceStatusTabLookupCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceStatusTabLookupWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceStatusTabLookupCommand: true, sessionId: this.#sessionId }, "schematic-relevance-status-tab-lookup");
  }
  protected observeSchematicRelevanceStatusSubscriberCommand(input: CurrentSchematicRelevanceStatusSubscriberCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceStatusSubscriberWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceStatusSubscriberCommand: true, sessionId: this.#sessionId }, "schematic-relevance-status-subscriber");
  }
  protected observeSchematicRelevanceStatusCloneCommand(input: CurrentSchematicRelevanceStatusCloneCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceStatusCloneWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceStatusCloneCommand: true, sessionId: this.#sessionId }, "schematic-relevance-status-clone");
  }  protected observeSchematicRelevanceStatusDeliveryCommand(input: CurrentSchematicRelevanceStatusDeliveryCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceStatusDeliveryWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceStatusDeliveryCommand: true, sessionId: this.#sessionId }, "schematic-relevance-status-delivery");
  }  protected observeSchematicRelevanceStatusBusCommand(input: CurrentSchematicRelevanceStatusBusCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceStatusBusWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceStatusBusCommand: true, sessionId: this.#sessionId }, "schematic-relevance-status-bus");
  }  protected observeSchematicRelevanceHistoryStatusCommand(input: CurrentSchematicRelevanceHistoryStatusCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceHistoryStatusWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceHistoryStatusCommand: true, sessionId: this.#sessionId }, "schematic-relevance-history-status");
  }  protected observeSchematicRelevanceUploadCmCommand(input: CurrentSchematicRelevanceUploadCmCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceUploadCmWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceUploadCmCommand: true, sessionId: this.#sessionId }, "schematic-relevance-upload-cm");
  }
  protected observeSchematicRelevanceUploadSerializeCommand(input: CurrentSchematicRelevanceUploadSerializeCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceUploadSerializeWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceUploadSerializeCommand: true, sessionId: this.#sessionId }, "schematic-relevance-upload-serialize");
  }
  protected observeSchematicRelevanceUploadModelCommand(input: CurrentSchematicRelevanceUploadModelCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceUploadModelWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceUploadModelCommand: true, sessionId: this.#sessionId }, "schematic-relevance-upload-model");
  }
  protected observeSchematicRelevanceUploadEntryCommand(input: CurrentSchematicRelevanceUploadEntryCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceUploadEntryWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceUploadEntryCommand: true, sessionId: this.#sessionId }, "schematic-relevance-upload-entry");
  }
  protected observeSchematicRelevanceNoEchoCommand(input: CurrentSchematicRelevanceNoEchoCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceNoEchoWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceNoEchoCommand: true, sessionId: this.#sessionId }, "schematic-relevance-noecho");
  }
  protected observeSchematicRelevanceNormalDisposalCommand(input: CurrentSchematicRelevanceNormalDisposalCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceNormalDisposalWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceNormalDisposalCommand: true, sessionId: this.#sessionId }, "schematic-relevance-normal-disposal");
  }
  protected observeSchematicRelevanceNormalRecordCommand(input: CurrentSchematicRelevanceNormalRecordCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceNormalRecordWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceNormalRecordCommand: true, sessionId: this.#sessionId }, "schematic-relevance-normal-record");
  }
  protected observeSchematicRelevanceNormalUpdateCommand(input: CurrentSchematicRelevanceNormalUpdateCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceNormalUpdateWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceNormalUpdateCommand: true, sessionId: this.#sessionId }, "schematic-relevance-normal-update");
  }
  protected observeSchematicRelevanceHistoryCommandCommand(input: CurrentSchematicRelevanceHistoryCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceHistoryCommandWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceHistoryCommandCommand: true, sessionId: this.#sessionId }, "schematic-relevance-history-command");
  }
  protected observeSchematicRelevanceRecordAstCommand(input: CurrentSchematicRelevanceRecordAstCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_RECORD_AST_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceRecordAstWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceRecordAstCommand: true, sessionId: this.#sessionId }, "schematic-relevance-record-ast");
  }
  protected observeSchematicRelevancePrimitiveCommand(input: CurrentSchematicRelevancePrimitiveCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_PRIMITIVE_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevancePrimitiveWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevancePrimitiveCommand: true, sessionId: this.#sessionId }, "schematic-relevance-primitive");
  }
  protected observeSchematicRelevanceUiPublicationCommand(input: CurrentSchematicRelevanceUiPublicationCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_UI_PUBLICATION_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceUiPublicationWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceUiPublicationCommand: true, sessionId: this.#sessionId }, "schematic-relevance-ui-publication");
  }
  protected observeSchematicRelevanceRunPrefixCommand(input: CurrentSchematicRelevanceRunPrefixCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null || !this.#schematicRelevanceDisplayPurpose) { throw new Error("SCHEMATIC_PREFIX_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceRunPrefixWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceRunPrefixCommand: true, sessionId: this.#sessionId }, "schematic-relevance-run-prefix");
  }
  protected observeSchematicRelevanceDisplayModifyEntryCommand(input: CurrentSchematicRelevanceDisplayModifyEntryCommand): Promise<Reply> {
    const request = this.#schematicRelevanceModifyOriginal; if (request === null || this.#sessionId === null) { throw new Error("SCHEMATIC_RELEVANCE_MODIFY_ENTRY_ORIGINAL_PENDING"); } this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request);
    const wire = currentSchematicRelevanceDisplayModifyEntryWire(input, this.#nextId); return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceModifyEntryCommand: true, sessionId: this.#sessionId }, "schematic-relevance-modify-entry");
  }
  protected observeSchematicDisplayActionCommand(input: CurrentSchematicDisplayActionCommand): Promise<Reply> {
    if (!this.#schematicDisplayPurpose || this.#sessionId === null) { throw new Error("SCHEMATIC_DISPLAY_ACTION_ORIGINAL_PARENT"); }
    const wire = currentSchematicDisplayActionWire(input, this.#nextId);
    if (this.#schematicRelevanceDisplayPurpose) { return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceActionCommand: true, sessionId: this.#sessionId }, "schematic-action"); }
    return this.#request({ id: this.#nextId, ...wire.command, schematicActionCommand: true, sessionId: this.#sessionId }, "schematic-action");
  }
  protected observeSchematicDisplayAccessorCommand(input: CurrentSchematicDisplayAccessorCommand): Promise<Reply> {
    if (!this.#schematicDisplayPurpose || this.#sessionId === null) { throw new Error("SCHEMATIC_DISPLAY_ACCESSOR_ORIGINAL_PARENT"); }
    const wire = currentSchematicDisplayAccessorWire(input, this.#nextId);
    if (this.#schematicRelevanceDisplayPurpose) { return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceAccessorCommand: true, sessionId: this.#sessionId }, "schematic-accessor"); }
    return this.#request({ id: this.#nextId, ...wire.command, schematicAccessorCommand: true, sessionId: this.#sessionId }, "schematic-accessor");
  }
  protected observeSchematicRelevanceLibraryRefreshCommand(input: CurrentProjectLibraryRefreshCommand): Promise<Reply> {
    if (!this.#schematicRelevanceDisplayPurpose || this.#schematicWorkerSession === null) { throw new Error("SCHEMATIC_RELEVANCE_LIBRARY_ORIGINAL_WORKER"); }
    const wire = currentProjectLibraryRefreshWire(input, this.#nextId, "schematic-relevance-library-refresh");
    return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceLibraryRefreshCommand: true, sessionId: this.#schematicWorkerSession }, "schematic-relevance-library");
  }
  protected observeSchematicRelevanceDisplaySyncQuiesceCommand(input: CurrentProjectSyncQuiesceCommand): Promise<Reply> {
    if (!this.#schematicRelevanceDisplayPurpose || this.#schematicWorkerSession === null) { throw new Error("SCHEMATIC_RELEVANCE_QUIESCE_ORIGINAL_WORKER"); }
    const wire = currentSchematicRelevanceDisplaySyncQuiesceWire(input, this.#nextId);
    return this.#request({ id: this.#nextId, ...wire.command, schematicRelevanceSyncQuiesceCommand: true, sessionId: this.#schematicWorkerSession }, "schematic-relevance-quiesce");
  }
  protected bindSchematicRelevanceDisplayClockCommand(workerContext: string, uiSdk: string): void {
    if (!this.#schematicRelevanceDisplayPurpose || this.#schematicRelevanceClockBinding !== null || !this.#schematicParentRunning || !diagnosticToken(workerContext) || !diagnosticToken(uiSdk)) { throw new Error("SCHEMATIC_RELEVANCE_CLOCK_BINDING"); }
    this.#schematicRelevanceClockBinding = Object.freeze({ workerContext, uiSdk });
  }
  protected observeSchematicRelevanceDisplayClockCommand(input: CurrentSchematicDisplayClockCommand, realm: CurrentSchematicDisplayClockRealm): Promise<Reply> {
    const binding = this.#schematicRelevanceClockBinding; if (!this.#schematicRelevanceDisplayPurpose || binding === null || this.#sessionId === null || this.#schematicWorkerSession === null) { throw new Error("SCHEMATIC_RELEVANCE_CLOCK_ORIGINAL_BINDING"); }
    const wire = currentSchematicDisplayClockWire(input, realm, this.#nextId); const command = wire.command;
    if (command.phase === "schematic-clock-worker" && command.params.uniqueContextId !== binding.workerContext || command.phase === "schematic-clock-registration" && command.params.objectId !== binding.uiSdk) { throw new Error("SCHEMATIC_RELEVANCE_CLOCK_INITIAL_RECEIVER"); }
    return this.#request({ id: this.#nextId, ...command, schematicRelevanceClockCommand: true, schematicClockRealm: realm, sessionId: realm === "worker" ? this.#schematicWorkerSession : this.#sessionId }, "schematic-relevance-clock");
  }
  protected bindSchematicDisplayClockCommand(workerContext: string, uiSdk: string): void {
    if (!this.#schematicDisplayPurpose || this.#schematicRelevanceDisplayPurpose || this.#schematicWireEditPurpose || this.#schematicClockBinding !== null || !this.#schematicParentRunning || !diagnosticToken(workerContext) || !diagnosticToken(uiSdk)) { throw new Error("SCHEMATIC_DISPLAY_CLOCK_BINDING"); }
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
  protected navigateSchematicRelevanceDisplayRegisteredCommand(binding: string, target: unknown, retain: (pending: Promise<Reply>) => void): Promise<Reply> {
    if (!this.#schematicRelevanceDisplayPurpose || this.#sessionId === null || this.#schematicDisplayRegistrationAttempted || typeof retain !== "function") { throw new Error("SCHEMATIC_DISPLAY_REGISTRATION_ONCE"); }
    const command = currentSchematicRelevanceDisplayNativeCommand("navigate", binding, target);
    if (command.schematicRelevanceDisplayPhase !== "navigate") { throw new Error("SCHEMATIC_DISPLAY_REGISTRATION_PHASE"); }
    this.#schematicDisplayRegistrationAttempted = true; this.#schematicDisplayRegistrationTarget = command.params.arguments[0].value;
    return this.#request({ id: this.#nextId, ...command, sessionId: this.#sessionId }, "schematic-display-navigate", retain);
  }
  protected requireSchematicRelevanceDisplayRegistrationPendingCommand(pending: Promise<unknown>): void {
    if (!this.#schematicRelevanceDisplayPurpose || this.#failure !== null || this.#schematicDisplayRegistrationPromise !== pending || this.#schematicDisplayRegistrationSlot === null || this.#viaRetainedPending !== this.#schematicDisplayRegistrationSlot) { throw new Error("SCHEMATIC_DISPLAY_REGISTRATION_ORIGINAL_PENDING"); }
  }
  protected requireSchematicRelevanceDisplayRegistrationNoDispatchCommand(pending: Promise<unknown>, qualification: QualifiedGeneratedSchematicRelevanceFixtureTarget): void {
    assertOriginalGeneratedSchematicRelevanceFixtureTarget(qualification); const slot = this.#schematicDisplayRegistrationSlot;
    if (!this.#schematicRelevanceDisplayPurpose || this.#failure !== null || this.#schematicDisplayRegistrationPromise !== pending || slot === null || !slot.written || slot.reply === null || this.#viaRetainedPending === slot || canonicalJson(qualification.target) !== this.#schematicDisplayRegistrationTarget) { throw new Error("SCHEMATIC_DISPLAY_REGISTRATION_ORIGINAL_NO_DISPATCH"); }
    const result = decodeCurrentSchematicRelevanceDisplayRegistrationNavigation(slot.reply, qualification).navigation.registration;
    if (result === null || !result.priorRegistrationPresent || result.registrationDispatched) { throw new Error("SCHEMATIC_DISPLAY_REGISTRATION_NO_DISPATCH_REQUIRED"); }
  }
  protected observeSchematicDisplayCommand(phase: CurrentSchematicDisplayNativePhase, binding: string, target?: unknown, operation?: unknown): Promise<Reply> {
    if (!this.#schematicDisplayPurpose || this.#sessionId === null) { throw new Error("SCHEMATIC_DISPLAY_ORIGINAL_PARENT"); }
    if (this.#schematicRelevanceDisplayPurpose && phase === "navigate") { throw new Error("SCHEMATIC_DISPLAY_ORIGINAL_REGISTRATION_REQUIRED"); }
    if (this.#schematicWireEditPurpose && phase === "save") { throw new Error("SCHEMATIC_WIRE_NO_SAVE_STAGE"); }
    let command: CurrentSchematicWireEditNativeCommand | CurrentSchematicRelevanceDisplayNativeCommand | CurrentSchematicDisplayNativeCommand;
    if (this.#schematicWireEditPurpose && phase !== "save") { command = currentSchematicWireEditNativeCommand(phase, binding, target, operation); }
    else { command = this.#schematicRelevanceDisplayPurpose ? currentSchematicRelevanceDisplayNativeCommand(phase, binding, target, operation) : currentSchematicDisplayNativeCommand(phase, binding, target, operation); }
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
  /** The original deferred is retained before synchronous Writable dispatch,
   * allowing the same owner to bind its pending intent without a race. */
  public registerSavedReadbackProject(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget, retain: (pending: Promise<Reply>) => void): Promise<Reply> {
    if (!this.#savedReadbackPurpose || this.#sessionId === null || !this.#savedReadbackLoadingGuard || this.#savedReadbackRegistrationAttempted || this.#savedReadbackLoadPair !== null || typeof retain !== "function") { throw new Error("SAVED_READBACK_REGISTRATION_ONCE"); }
    this.#savedReadbackRegistrationAttempted = true;
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn", params: diagnosticGeneratedFixtureRegistrationParams(uniqueContextId, target), sessionId: this.#sessionId }, "saved-readback-register", retain);
  }
  #savedStartPageVersion = false; #savedStartPageSamples = 0;
  public observeSavedReadbackStartPage(phase: CurrentPcbViaSavedStartPagePhase): Promise<Reply> {
    if (!this.#savedReadbackPurpose || this.#sessionId !== null || this.#savedReadbackEarlyActorStep !== 3 || this.#savedReadbackParent) { throw new Error("SAVED_START_PAGE_PURPOSE"); }
    if (phase === "version") { if (this.#savedStartPageVersion || this.#savedStartPageSamples !== 0) { throw new Error("SAVED_START_PAGE_VERSION_ONCE"); } this.#savedStartPageVersion = true; }
    else { if (!this.#savedStartPageVersion || this.#savedStartPageSamples >= CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.startPage.inventorySamples) { throw new Error("SAVED_START_PAGE_SAMPLE_BOUND"); } this.#savedStartPageSamples += 1; }
    return this.#request(currentPcbViaSavedStartPageWire(this.#nextId, phase), "saved-readback-start-page");
  }
  #savedReadbackSceneContext: string | null = null; #savedReadbackSceneCount = 0;
  public bindSavedReadbackScene(context: string): void {
    if (!this.#savedReadbackModel || this.#savedReadbackModelStep !== 4 || this.#savedReadbackSceneContext !== null || !diagnosticToken(context) || this.#pending !== null || this.#failure !== null) { throw new Error("SAVED_SCENE_BIND"); } this.#savedReadbackSceneContext = context;
  }
  public observeSavedReadbackScene(command: CurrentPcbSpatialCaptureCommand): Promise<Reply> {
    if (this.#sessionId === null || this.#savedReadbackSceneContext === null || this.#savedReadbackSceneCount >= CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.scene.stage) { throw new Error("SAVED_SCENE_BUDGET"); }
    const fixed = currentPcbViaSavedSceneWire(command, this.#nextId, this.#sessionId, this.#savedReadbackSceneContext); this.#savedReadbackSceneCount += 1; return this.#request(fixed.command, "saved-readback-scene");
  }
  #savedReadbackModel = false; #savedReadbackModelStep = 0;
  public bindSavedReadbackModel(): void {
    if (!this.#savedReadbackPurpose || !this.#savedReadbackObservation || this.#savedReadbackModel || this.#pending !== null || this.#viaRetainedPending !== null || this.#inversePublicDeletePending !== null || this.#inverseNativeGetLookupPending !== null || this.#inverseNativeGetTaskPending !== null || this.#failure !== null) { throw new Error("SAVED_MODEL_BIND"); } this.#savedReadbackModel = true;
  }
  public observeSavedReadbackModel(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget, phase: CurrentPcbViaSavedModelPhase): Promise<Reply> {
    if (!this.#savedReadbackModel || this.#sessionId === null || ["preflight", "open-document", "observe", "primitives"][this.#savedReadbackModelStep] !== phase) { throw new Error("SAVED_MODEL_ORDER"); }
    this.#savedReadbackModelStep += 1; const params = phase === "primitives" ? diagnosticPrimitives209Params(uniqueContextId, target) : diagnosticPcbOpeningParams(uniqueContextId, target, phase);
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn", params, sessionId: this.#sessionId }, "saved-readback-model");
  }
  public bindSavedReadbackOpening(): void {
    if (!this.#savedReadbackPurpose || this.#savedReadbackOpening || this.#savedReadbackRegistrationSlot === null || this.#pending !== null || this.#savedReadbackLoadPair !== null || this.#failure !== null) { throw new Error("SAVED_READBACK_OPENING_ONCE"); }
    this.#savedReadbackOpening = true;
  }
  public observeSavedReadbackOpening(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget, phase: CurrentPcbDiagnosticOpeningPhase): Promise<Reply> {
    if (!this.#savedReadbackPurpose || !this.#savedReadbackOpening || this.#sessionId === null || this.#savedReadbackOpeningPhases.has(phase) || phase === "open-project" && !this.#savedReadbackOpeningPhases.has("preflight")) { throw new Error("SAVED_READBACK_OPENING_ORDER"); }
    this.#savedReadbackOpeningPhases.add(phase);
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn", params: diagnosticOpeningParams(uniqueContextId, target, phase), sessionId: this.#sessionId }, phase === "preflight" ? "saved-readback-project-preflight" : "saved-readback-open-project");
  }
  public requireOriginalSavedReadbackOpeningPending(): void {
    if (!this.#savedReadbackPurpose || !this.#savedReadbackOpening || !this.#savedReadbackOpeningPhases.has("open-project") || this.#viaRetainedPending === null || this.#failure !== null) { throw new Error("SAVED_READBACK_ORIGINAL_OPENING_PENDING"); }
  }
  public requireOriginalSavedReadbackRegistrationPending(pending: Promise<unknown>): void {
    if (!this.#savedReadbackPurpose || this.#failure !== null || pending !== this.#savedReadbackRegistrationPromise || this.#savedReadbackRegistrationSlot === null || this.#pending !== this.#savedReadbackRegistrationSlot && this.#viaRetainedPending !== this.#savedReadbackRegistrationSlot) { throw new Error("SAVED_READBACK_ORIGINAL_REGISTRATION_PENDING"); }
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

  public retainInverseActorEvents(event: (value: DiagnosticEvent) => "held" | "project"): void {
    if (!this.#inversePurpose || this.#sessionId !== null || this.#nextId !== 1 || this.#pending !== null || this.#inverseActorEvent !== null || typeof event !== "function") { throw new Error("FOOTPRINT_INVERSE_ACTOR_EVENTS_ONCE"); }
    this.#inverseActorEvent = event;
  }
  public observeInverseActors(stage: CurrentFootprintInverseActorStage): Promise<Reply> {
    if (!this.#inversePurpose || this.#sessionId !== null || this.#inverseActorEvent === null || this.#pending !== null || ["before", "arm", "after"][this.#inverseActorStep] !== stage) { throw new Error("FOOTPRINT_INVERSE_ACTOR_SEQUENCE"); }
    this.#inverseActorStep += 1; return this.#request(currentFootprintInverseActorWire(this.#nextId, stage), "inverse-actors");
  }
  public armInverseParent(event: (value: DiagnosticEvent) => void): Promise<Reply> {
    if (!this.#inversePurpose || this.#sessionId === null || this.#inverseActorStep !== 3 || this.#inverseParent || this.#inverseWorkerEvent !== null || this.#pending !== null || typeof event !== "function") { throw new Error("FOOTPRINT_INVERSE_PARENT_ONCE"); }
    this.#inverseParent = true; this.#inverseWorkerEvent = event;
    return this.#request(currentFootprintInverseParentWire(this.#nextId, this.#sessionId), "inverse-parent");
  }
  public bindInverseWorker(pair: CurrentFootprintInverseWorkerPair): void {
    if (!this.#inversePurpose || !this.#inverseParent || this.#inverseWorkerPair !== null || this.#workerSessions.get(pair.pageSessionId) !== pair.targetId || this.#workerSessions.get(pair.browserSessionId) !== pair.targetId || pair.pageSessionId === pair.browserSessionId) { throw new Error("FOOTPRINT_INVERSE_WORKER_PAIR"); }
    this.#inverseWorkerPair = pair;
  }
  public observeInverseWorker(input: CurrentPcbViaSavedLoadBootstrapCommand): Promise<Reply> {
    const pair = this.#inverseWorkerPair; if (!this.#inversePurpose || pair === null) { throw new Error("FOOTPRINT_INVERSE_WORKER_PAIR"); }
    const command = currentFootprintInverseWorkerWire(input, this.#nextId, pair), slot = `${command.phase}${"role" in command ? `-${command.role}` : ""}`;
    if (this.#inverseWorkerSlots.has(slot)) { throw new Error("FOOTPRINT_INVERSE_WORKER_COMMAND_CONSUMED"); }
    this.#inverseWorkerSlots.add(slot); return this.#request(command, "inverse-worker");
  }
  public observeInverseCacheGuard(context: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> {
    this.requireInverseNoDispatchOrRegistration(target);
    if (!this.#inversePurpose || this.#sessionId === null || this.#inverseProjectOpening || context !== this.#inverseContext) { return Promise.reject(new Error("FOOTPRINT_INVERSE_CACHE_GUARD_PURPOSE")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn", params: diagnosticOpeningParams(context, target, "preflight"), sessionId: this.#sessionId }, "inverse-cache-guard");
  }
  public observeInverseCache(plan: CurrentPcbViaSavedCachePlan): Promise<Reply> {
    if (!this.#inversePurpose || this.#sessionId === null || this.#inverseProjectOpening) { return Promise.reject(new Error("FOOTPRINT_INVERSE_CACHE_PURPOSE")); }
    return this.#request(currentFootprintInverseCacheWire(plan, this.#nextId, this.#sessionId), "inverse-cache");
  }
  public observeInverseCacheInvalidation(plan: CurrentPcbViaSavedCachePlan): Promise<Reply> {
    if (!this.#inversePurpose || this.#sessionId === null || this.#inverseProjectOpening) { return Promise.reject(new Error("FOOTPRINT_INVERSE_INVALIDATION_PURPOSE")); }
    return this.#request(currentFootprintInverseCacheInvalidationWire(plan, this.#nextId, this.#sessionId), "inverse-cache-invalidate");
  }
  public observeInverseCacheMetadata(plan: CurrentPcbViaSavedCacheMetadataPlan): Promise<Reply> {
    if (!this.#inversePurpose || this.#sessionId === null || this.#inverseProjectOpening) { return Promise.reject(new Error("FOOTPRINT_INVERSE_CACHE_METADATA_PURPOSE")); }
    return this.#request(currentFootprintInverseCacheMetadataWire(plan, this.#nextId, this.#sessionId), "inverse-cache-metadata");
  }
  public observeInverseInitialSyncCall(command:CurrentFootprintInverseInitialSyncNativeCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_INITIAL_SYNC_PAIR");}return this.#request(currentFootprintInverseInitialSyncWire(command,this.#nextId,pair.pageSessionId),"inverse-initial-sync");}
  public observeInverseInitialCache(command:CurrentFootprintInverseInitialCacheCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_INITIAL_CACHE_PAIR");}return this.#request(currentFootprintInverseInitialCacheWire(command,this.#nextId,pair.pageSessionId),"inverse-initial-cache");}
  public observeInverseStartupQueue(command:CurrentFootprintInverseStartupQueueCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_STARTUP_QUEUE_ORIGINAL_PAIR");}return this.#request(currentFootprintInverseStartupQueueWire(command,this.#nextId,pair.pageSessionId),"inverse-startup-queue");}
  public observeInverseConditionSource(scriptId:string):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_CONDITION_ORIGINAL_PAIR");}return this.#request(currentFootprintInverseConditionWire(this.#nextId,pair.pageSessionId,scriptId),"inverse-condition-source");}
  /** One original SDK request has its own pending slot. Observations may
   * progress while it is held; sibling purposes cannot create or use it. */
  public observeInversePublicPreferences(command: CurrentFootprintInversePublicPreferencesCommand): Promise<Reply> {
    if (!this.#inversePurpose || this.#sessionId === null || !this.#inverseProjectOpening || this.#viaRetainedPending !== null) { throw new Error("FOOTPRINT_INVERSE_PREFERENCES_PURPOSE"); }
    return this.#request(currentFootprintInversePublicPreferencesWire(command, this.#nextId, this.#sessionId), "inverse-public-preferences");
  }
  /** Advance only this same original pending request through its registered
   * wrapper/body to getData entry. No settled/public/tw Promise is admitted. */
  public observeInverseNativeGetTaskManager(command: CurrentFootprintInverseNativeGetTaskManagerCommand, original: Promise<Reply>): Promise<Reply> { this.requireInverseNativeGetTaskSenderWritten(original); if (this.#sessionId === null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_TASK_MANAGER_SESSION"); } return this.#request(currentFootprintInverseNativeGetTaskManagerWire(command, this.#nextId, this.#sessionId), "inverse-native-get-task-manager"); }
  /** Continue only the same pending original native-task invocation. The
   * finite callback book owns one resume and supplies no alternate Call/Job. */
  public observeInverseNativeGetTaskCallback(command: CurrentFootprintInverseNativeGetTaskCallbackCommand, original: Promise<Reply>): Promise<Reply> { this.requireInverseNativeGetTaskSenderWritten(original); if (this.#sessionId === null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_TASK_CALLBACK_SESSION"); } return this.#request(currentFootprintInverseNativeGetTaskCallbackWire(command, this.#nextId, this.#sessionId), "inverse-native-get-task-callback"); }
  /** Read only through this exact still-held original native-task request.
   * Matching public/tw Promises cannot enter either dependency grammar. */
  public observeInverseNativeGetTaskIntrinsics(command: CurrentFootprintInverseNativeGetTaskIntrinsicsCommand, original: Promise<Reply>): Promise<Reply> { this.requireInverseNativeGetTaskSenderWritten(original); if (this.#sessionId === null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_TASK_INTRINSICS_SESSION"); } return this.#request(currentFootprintInverseNativeGetTaskIntrinsicsWire(command, this.#nextId, this.#sessionId), "inverse-native-get-task-intrinsics"); }
  /** Qualify fixed live/frame/callback data under the same pending original.
   * There is no invocation, resume, alternate pending slot or Job grant. */
  public observeInverseNativeGetTaskDependencies(command: CurrentFootprintInverseNativeGetTaskDependenciesCommand, original: Promise<Reply>): Promise<Reply> { this.requireInverseNativeGetTaskSenderWritten(original); if (this.#sessionId === null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_TASK_DEPENDENCIES_SESSION"); } return this.#request(currentFootprintInverseNativeGetTaskDependenciesWire(command, this.#nextId, this.#sessionId), "inverse-native-get-task-dependencies"); }
  /** Retain this separate original internal GET invocation while only its
   * exact finite sender probes proceed. No public or UI slot is reused. */
  public observeInverseNativeGetTaskSender(command: CurrentFootprintInverseNativeGetTaskSenderCommand): Promise<Reply> {
    if (!this.#inversePurpose || this.#sessionId === null || !this.#inverseProjectOpening || this.#viaRetainedPending !== null || this.#inversePublicDeletePending !== null || this.#inverseNativeGetLookupPending !== null || this.#inverseNativeGetLookupOriginal !== null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_TASK_PURPOSE"); }
    if (command.phase === "inverse-native-get-task-sender-invoke") {
      if (this.#inverseNativeGetTaskOriginal !== null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_TASK_ONCE"); }
      this.#inverseNativeGetTaskWritten = Promise.withResolvers<undefined>();
      void (async (): Promise<void> => { try { await this.#inverseNativeGetTaskWritten?.promise; } catch {
        // Original request and exit settlement retain the failure.
      } })();
    }
    const original = this.#request(currentFootprintInverseNativeGetTaskSenderWire(command, this.#nextId, this.#sessionId), "inverse-native-get-task-sender");
    if (command.phase === "inverse-native-get-task-sender-invoke") { this.#inverseNativeGetTaskOriginal = original; }
    return original;
  }
  /** Return the write acknowledgement of this exact original pipe Promise. */
  public originalInverseNativeGetTaskSenderWrite(original: Promise<Reply>): Promise<void> { if (!this.#inversePurpose || original !== this.#inverseNativeGetTaskOriginal || this.#inverseNativeGetTaskWritten === null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_TASK_ORIGINAL_WRITE"); } return this.#inverseNativeGetTaskWritten.promise; }
  /** Reprove the actual pending invocation slot and original successful write. */
  public requireInverseNativeGetTaskSenderWritten(original: Promise<Reply>): void { const slot = this.#inverseNativeGetTaskOriginalSlot; if (!this.#inversePurpose || original !== this.#inverseNativeGetTaskOriginal || slot === null || this.#inverseNativeGetTaskPending !== slot || !slot.written || slot.reply !== null || this.#failure !== null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_TASK_WRITTEN"); } }
  /** Retain a separate original native GET invocation while only its exact
   * finite lookup reads may proceed. No public SDK pending slot is reused. */
  public observeInverseNativeGetLookup(command: CurrentFootprintInverseNativeGetLookupCommand): Promise<Reply> {
    if (!this.#inversePurpose || this.#sessionId === null || !this.#inverseProjectOpening || this.#viaRetainedPending !== null || this.#inversePublicDeletePending !== null || this.#inverseNativeGetTaskPending !== null || this.#inverseNativeGetTaskOriginal !== null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_LOOKUP_PURPOSE"); }
    if (command.phase === "inverse-native-get-lookup-invoke") {
      if (this.#inverseNativeGetLookupOriginal !== null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_LOOKUP_ONCE"); }
      this.#inverseNativeGetLookupWritten = Promise.withResolvers<undefined>();
      void (async (): Promise<void> => { try { await this.#inverseNativeGetLookupWritten?.promise; } catch {
        // Original request and exit settlement retain the failure.
      } })();
    }
    const original = this.#request(currentFootprintInverseNativeGetLookupWire(command, this.#nextId, this.#sessionId), "inverse-native-get-lookup");
    if (command.phase === "inverse-native-get-lookup-invoke") { this.#inverseNativeGetLookupOriginal = original; }
    return original;
  }
  /** Return the write acknowledgement of this exact original pipe Promise. */
  public originalInverseNativeGetLookupWrite(original: Promise<Reply>): Promise<void> { if (!this.#inversePurpose || original !== this.#inverseNativeGetLookupOriginal || this.#inverseNativeGetLookupWritten === null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_LOOKUP_ORIGINAL_WRITE"); } return this.#inverseNativeGetLookupWritten.promise; }
  /** Reprove the actual pending invocation slot and original successful write. */
  public requireInverseNativeGetLookupWritten(original: Promise<Reply>): void { const slot = this.#inverseNativeGetLookupOriginalSlot; if (!this.#inversePurpose || original !== this.#inverseNativeGetLookupOriginal || slot === null || this.#inverseNativeGetLookupPending !== slot || !slot.written || slot.reply !== null || this.#failure !== null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_LOOKUP_WRITTEN"); } }
  public observeInversePublicCall(command: CurrentFootprintInversePublicCallCommand): Promise<Reply> {
    if (!this.#inversePurpose || this.#sessionId === null || !this.#inverseProjectOpening || this.#viaRetainedPending !== null) { throw new Error("FOOTPRINT_INVERSE_PUBLIC_CALL_IDLE"); }
    if (command.phase === "inverse-public-call-sdk" && this.#inversePublicDeleteOriginal !== null) { throw new Error("FOOTPRINT_INVERSE_PUBLIC_CALL_ONCE"); }
    if (command.phase === "inverse-public-call-sdk") { this.#inversePublicDeleteWritten = Promise.withResolvers<undefined>(); void (async (): Promise<void> => { try { await this.#inversePublicDeleteWritten?.promise; } catch {
      // The original request and cleanup retain this rejection.
    } })(); }
    const original = this.#request(currentFootprintInversePublicCallWire(command, this.#nextId, this.#sessionId), "inverse-public-call");
    if (command.phase === "inverse-public-call-sdk") { this.#inversePublicDeleteOriginal = original; }
    return original;
  }
  public originalInversePublicDeleteWrite(original: Promise<Reply>): Promise<void> {
    if (!this.#inversePurpose || original !== this.#inversePublicDeleteOriginal || this.#inversePublicDeleteWritten === null) { throw new Error("FOOTPRINT_INVERSE_PUBLIC_CALL_ORIGINAL_WRITE"); } return this.#inversePublicDeleteWritten.promise;
  }
  public requireInversePublicDeleteWritten(original: Promise<Reply>): void {
    const slot = this.#inversePublicDeleteOriginalSlot;
    if (!this.#inversePurpose || original !== this.#inversePublicDeleteOriginal || slot === null || !slot.written || this.#failure !== null) { throw new Error("FOOTPRINT_INVERSE_PUBLIC_CALL_ORIGINAL_WRITE"); }
  }
  public observeInversePublicService(command:CurrentFootprintInversePublicServiceCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_PUBLIC_SERVICE_IDLE");}return this.#request(currentFootprintInversePublicServiceWire(command,this.#nextId,this.#sessionId),"inverse-public-service");}
  public observeInversePublicApi(command:CurrentFootprintInversePublicApiCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_PUBLIC_API_IDLE");}return this.#request(currentFootprintInversePublicApiWire(command,this.#nextId,this.#sessionId),"inverse-public-api");}
  public observeInverseReferenceWorker(command:CurrentFootprintInverseReferenceWorkerCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_REFERENCE_WORKER_PAIR");}return this.#request(currentFootprintInverseReferenceWorkerWire(command,this.#nextId,pair.pageSessionId),"inverse-reference-worker");}
  public observeInverseGetCompletion(command:CurrentFootprintInverseGetCompletionCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_GET_COMPLETION_PAIR");}return this.#request(currentFootprintInverseGetCompletionWire(command,this.#nextId,pair.pageSessionId),"inverse-get-completion");}
  public observeInverseGetNative(command:CurrentFootprintInverseGetNativeCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_GET_NATIVE_PAIR");}return this.#request(currentFootprintInverseGetNativeWire(command,this.#nextId,pair.pageSessionId),"inverse-get-native");}
  /** Distinct native-origin GET preparation uses only the original worker
   * pair and excludes both retained generic and public SDK pending lanes. */
  public observeInverseNativeGetWorker(command: CurrentFootprintInverseNativeGetWorkerCommand): Promise<Reply> {
    const pair = this.#inverseWorkerPair;
    if (!this.#inversePurpose || pair === null || !this.#inverseWorkerSlots.has("saved-load-source-project") || this.#viaRetainedPending !== null || this.#inversePublicDeletePending !== null || this.#inverseNativeGetLookupPending !== null || this.#inverseNativeGetTaskPending !== null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_WORKER_PAIR"); }
    return this.#request(currentFootprintInverseNativeGetWorkerWire(command, this.#nextId, pair.pageSessionId), "inverse-native-get-worker");
  }
  public observeInverseGetWorker(command:CurrentFootprintInverseGetWorkerCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_GET_WORKER_PAIR");}return this.#request(currentFootprintInverseGetWorkerWire(command,this.#nextId,pair.pageSessionId),"inverse-get-worker");}
  public observeInverseNativeDelivery(command:CurrentFootprintInverseNativeDeliveryCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_NATIVE_DELIVERY_PAIR");}return this.#request(currentFootprintInverseNativeDeliveryWire(command,this.#nextId,pair.pageSessionId),"inverse-native-delivery");}
  public observeInverseNativeChannel(command:CurrentFootprintInverseNativeChannelCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_NATIVE_CHANNEL_PAIR");}return this.#request(currentFootprintInverseNativeChannelWire(command,this.#nextId,pair.pageSessionId),"inverse-native-channel");}
  public observeInverseGetSend(command:CurrentFootprintInverseGetSendCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_GET_SEND_PURPOSE");}return this.#request(currentFootprintInverseGetSendWire(command,this.#nextId,this.#sessionId),"inverse-get-send");}
  public observeInverseReferenceDispatch(command:CurrentFootprintInverseReferenceDispatchCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_REFERENCE_DISPATCH_PURPOSE");}return this.#request(currentFootprintInverseReferenceDispatchWire(command,this.#nextId,this.#sessionId),"inverse-reference-dispatch");}
  public observeInverseReferenceCallback(command:CurrentFootprintInverseReferenceCallbackCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_REFERENCE_CALLBACK_PURPOSE");}return this.#request(currentFootprintInverseReferenceCallbackWire(command,this.#nextId,this.#sessionId),"inverse-reference-callback");}
  /** Fixed original body/method steps under retained logical SDK custody. */
  public observeInverseDeleteSend(command:CurrentFootprintInverseDeleteSendCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_DELETE_SEND_PURPOSE");}return this.#request(currentFootprintInverseDeleteSendWire(command,this.#nextId,this.#sessionId),"inverse-delete-send");}
  /** Fixed callback continuation under the original pending SDK call. */
  public observeInverseDeleteCallback(command:CurrentFootprintInverseDeleteCallbackCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_DELETE_CALLBACK_PURPOSE");}return this.#request(currentFootprintInverseDeleteCallbackWire(command,this.#nextId,this.#sessionId),"inverse-delete-callback");}
  public observeInverseDeleteManager(command:CurrentFootprintInverseDeleteManagerCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_DELETE_MANAGER_PURPOSE");}return this.#request(currentFootprintInverseDeleteManagerWire(command,this.#nextId,this.#sessionId),"inverse-delete-manager");}
  public observeInverseDeleteCollateral(command:CurrentFootprintInverseDeleteCollateralCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_DELETE_COLLATERAL_PURPOSE");}return this.#request(currentFootprintInverseDeleteCollateralWire(command,this.#nextId,this.#sessionId),"inverse-delete-collateral");}
  public observeInverseDeletePrefix(command:CurrentFootprintInverseDeletePrefixCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_DELETE_PREFIX_PURPOSE");}return this.#request(currentFootprintInverseDeletePrefixWire(command,this.#nextId,this.#sessionId),"inverse-delete-prefix");}
  public observeInverseReferenceProgress(command:CurrentFootprintInverseReferenceProgressCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_REFERENCE_PROGRESS_PURPOSE");}return this.#request(currentFootprintInverseReferenceProgressWire(command,this.#nextId,this.#sessionId),"inverse-reference-progress");}
  public observeInverseReferenceResult(command:CurrentFootprintInverseReferenceResultCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_REFERENCE_RESULT_PURPOSE");}return this.#request(currentFootprintInverseReferenceResultWire(command,this.#nextId,this.#sessionId),"inverse-reference-result");}
  public observeInverseReferenceSend(command:CurrentFootprintInverseReferenceSendCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_REFERENCE_SEND_PURPOSE");}return this.#request(currentFootprintInverseReferenceSendWire(command,this.#nextId,this.#sessionId),"inverse-reference-send");}
  public observeInverseReferenceUi(command:CurrentFootprintInverseReferenceUiCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_REFERENCE_UI_PURPOSE");}return this.#request(currentFootprintInverseReferenceUiWire(command,this.#nextId,this.#sessionId),"inverse-reference-ui");}
  public observeInverseReferenceEntry(command:CurrentFootprintInverseReferenceEntryCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_REFERENCE_ENTRY_PURPOSE");}return this.#request(currentFootprintInverseReferenceEntryWire(command,this.#nextId,this.#sessionId),"inverse-reference-entry");}
  public observeInverseGetResult(command:CurrentFootprintInverseGetResultCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_GET_RESULT_PURPOSE");}return this.#request(currentFootprintInverseGetResultWire(command,this.#nextId,this.#sessionId),"inverse-get-result");}
  public observeInverseGetCallback(command:CurrentFootprintInverseGetCallbackCommand):Promise<Reply>{if(!this.#inversePurpose||this.#sessionId===null||!this.#inverseProjectOpening||this.#viaRetainedPending!==null){throw new Error("FOOTPRINT_INVERSE_GET_CALLBACK_PURPOSE");}return this.#request(currentFootprintInverseGetCallbackWire(command,this.#nextId,this.#sessionId),"inverse-get-callback");}
  public observeInverseGetManager(command: CurrentFootprintInverseGetManagerCommand): Promise<Reply> { if (!this.#inversePurpose || this.#sessionId === null || !this.#inverseProjectOpening || this.#viaRetainedPending !== null) { throw new Error("FOOTPRINT_INVERSE_GET_MANAGER_PURPOSE"); } return this.#request(currentFootprintInverseGetManagerWire(command, this.#nextId, this.#sessionId), "inverse-get-manager"); }
  public observeInverseGetForwarding(command: CurrentFootprintInverseGetForwardingCommand): Promise<Reply> { if (!this.#inversePurpose || this.#sessionId === null || !this.#inverseProjectOpening || this.#viaRetainedPending !== null) { throw new Error("FOOTPRINT_INVERSE_GET_FORWARDING_PURPOSE"); } return this.#request(currentFootprintInverseGetForwardingWire(command, this.#nextId, this.#sessionId), "inverse-get-forwarding"); }
  public observeInverseGetRpcEntry(command: CurrentFootprintInverseGetRpcEntryCommand): Promise<Reply> { if (!this.#inversePurpose || this.#sessionId === null || !this.#inverseProjectOpening || this.#viaRetainedPending !== null) { throw new Error("FOOTPRINT_INVERSE_GET_RPC_ENTRY_PURPOSE"); } return this.#request(currentFootprintInverseGetRpcEntryWire(command, this.#nextId, this.#sessionId), "inverse-get-rpc-entry"); }
  public observeInverseGetIntrinsics(command: CurrentFootprintInverseGetIntrinsicsCommand): Promise<Reply> { if (!this.#inversePurpose || this.#sessionId === null || !this.#inverseProjectOpening || this.#viaRetainedPending !== null) { throw new Error("FOOTPRINT_INVERSE_GET_INTRINSICS_PURPOSE"); } return this.#request(currentFootprintInverseGetIntrinsicsWire(command, this.#nextId, this.#sessionId), "inverse-get-intrinsics"); }
  public observeInverseLookupPreentry(command: CurrentFootprintInverseLookupPreentryCommand): Promise<Reply> { if (!this.#inversePurpose || this.#sessionId === null || !this.#inverseProjectOpening || this.#viaRetainedPending !== null) { throw new Error("FOOTPRINT_INVERSE_LOOKUP_PREENTRY_PURPOSE"); } return this.#request(currentFootprintInverseLookupPreentryWire(command, this.#nextId, this.#sessionId), "inverse-lookup-preentry"); }
  /** Source qualification accepts only the readonly subset of the fresh sender book. */
  public observeInverseNativeDeleteSender(command: CurrentFootprintInverseNativeDeleteSenderCommand): Promise<Reply> { if (!this.#inversePurpose || this.#sessionId === null || !this.#inverseProjectOpening || this.#viaRetainedPending !== null || this.#inversePublicDeletePending !== null || this.#inverseNativeGetLookupPending !== null || this.#inverseNativeGetTaskPending !== null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_DELETE_SENDER_READ_PURPOSE"); } return this.#request(currentFootprintInverseNativeDeleteSenderWire(validateCurrentFootprintInverseNativeDeleteSenderReadCommand(command), this.#nextId, this.#sessionId), "inverse-native-delete-sender"); }
  /** The independently marked registration lane retains the same original UI session. */
  public observeInverseNativeDeleteRegistration(command: CurrentFootprintInverseNativeDeleteRegistrationCommand): Promise<Reply> { if (!this.#inversePurpose || this.#sessionId === null || !this.#inverseProjectOpening || this.#viaRetainedPending !== null || this.#inversePublicDeletePending !== null || this.#inverseNativeGetLookupPending !== null || this.#inverseNativeGetTaskPending !== null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_DELETE_REGISTRATION_PURPOSE"); } return this.#request(currentFootprintInverseNativeDeleteRegistrationWire(command, this.#nextId, this.#sessionId), "inverse-native-delete-registration"); }
  /** Use only the distinct fresh inverse marker, action and original UI session. */
  public observeInverseNativeDeleteBootstrap(command: CurrentFootprintInverseNativeDeleteBootstrapCommand): Promise<Reply> { if (!this.#inversePurpose || this.#sessionId === null || !this.#inverseProjectOpening || this.#viaRetainedPending !== null || this.#inversePublicDeletePending !== null || this.#inverseNativeGetLookupPending !== null || this.#inverseNativeGetTaskPending !== null) { throw new Error("FOOTPRINT_INVERSE_NATIVE_DELETE_BOOTSTRAP_PURPOSE"); } return this.#request(currentFootprintInverseNativeDeleteBootstrapWire(command, this.#nextId, this.#sessionId), "inverse-native-delete-bootstrap"); }
  public observeInverseUiOwnData(command: CurrentFootprintInverseUiOwnDataCommand): Promise<Reply> { if (!this.#inversePurpose || this.#sessionId === null || !this.#inverseProjectOpening || this.#viaRetainedPending !== null) { throw new Error("FOOTPRINT_INVERSE_UI_OWN_DATA_PURPOSE"); } return this.#request(currentFootprintInverseUiOwnDataWire(command, this.#nextId, this.#sessionId), "inverse-ui-own-data"); }
  public observeInverseOwnData(command:CurrentFootprintInverseOwnDataCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_OWN_DATA_PAIR");}return this.#request(currentFootprintInverseOwnDataWire(command,this.#nextId,pair.pageSessionId),"inverse-own-data");}
  public observeInverseDeleteWorkerPeer(command:CurrentFootprintInverseDeleteWorkerPeerCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_DELETE_WORKER_PEER_PAIR");}return this.#request(currentFootprintInverseDeleteWorkerPeerWire(command,this.#nextId,pair.pageSessionId),"inverse-delete-worker-peer");}
  public observeInverseDeleteJob(command:CurrentFootprintInverseDeleteJobCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_DELETE_JOB_PAIR");}return this.#request(currentFootprintInverseDeleteJobWire(command,this.#nextId,pair.pageSessionId),"inverse-delete-job");}
  public observeInverseDeleteRpc(command:CurrentFootprintInverseDeleteRpcCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_DELETE_RPC_PAIR");}return this.#request(currentFootprintInverseDeleteRpcWire(command,this.#nextId,pair.pageSessionId),"inverse-delete-rpc");}
  public observeInverseDeleteEntry(command:CurrentFootprintInverseDeleteEntryCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_DELETE_ENTRY_PAIR");}return this.#request(currentFootprintInverseDeleteEntryWire(command,this.#nextId,pair.pageSessionId),"inverse-delete-entry");}
  public observeInverseClockWorker(command:CurrentFootprintInverseClockWorkerCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_CLOCK_WORKER_PAIR");}return this.#request(currentFootprintInverseClockWorkerWire(command,this.#nextId,pair.pageSessionId),"inverse-clock-worker");}
  public observeInverseDeleteEncoder(command:CurrentFootprintInverseDeleteEncoderCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_DELETE_ENCODER_PAIR");}return this.#request(currentFootprintInverseDeleteEncoderWire(command,this.#nextId,pair.pageSessionId),"inverse-delete-encoder");}
  public observeInverseDeleteBinding(command:CurrentFootprintInverseDeleteBindingCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_DELETE_BINDING_PAIR");}return this.#request(currentFootprintInverseDeleteBindingWire(command,this.#nextId,pair.pageSessionId),"inverse-delete-bindings");}
  public observeInverseLibraryRefresh(command:CurrentProjectLibraryRefreshCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_LIBRARY_ORIGINAL_PAIR");}return this.#request(currentProjectLibraryRefreshEnvelope(command,this.#nextId,pair.pageSessionId),"inverse-library-refresh");}
  public observeInverseTimer(command: CurrentFootprintInverseTimerCommand): Promise<Reply> { const pair = this.#inverseWorkerPair; if (!this.#inversePurpose || pair === null || !this.#inverseWorkerSlots.has("saved-load-source-project")) { throw new Error("FOOTPRINT_INVERSE_TIMER_ORIGINAL_PAIR"); } return this.#request(currentFootprintInverseTimerWire(command, this.#nextId, pair.pageSessionId), "inverse-timer"); }
  public observeInverseStartupCallback(command:CurrentFootprintInverseStartupCallbackCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_STARTUP_CALLBACK_ORIGINAL_PAIR");}return this.#request(currentFootprintInverseStartupCallbackWire(command,this.#nextId,pair.pageSessionId),"inverse-startup-callback");}
  public stepInverseModel(command:CurrentFootprintInverseModelStepCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_MODEL_ORIGINAL_PAIR");}return this.#request(currentFootprintInverseModelStepWire(command,this.#nextId,pair.pageSessionId),"inverse-model-step");}
  public stepInverseCold(command:CurrentFootprintInverseColdStepCommand):Promise<Reply>{const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_COLD_STEP_ORIGINAL_PAIR");}return this.#request(currentFootprintInverseColdStepWire(command,this.#nextId,pair.pageSessionId),"inverse-cold-step");}
  public observeInverseCold(command:CurrentFootprintInverseColdLoadCommand):Promise<Reply>{
    const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_COLD_ORIGINAL_PAIR");}
    return this.#request(currentFootprintInverseColdLoadWire(command,this.#nextId,pair.pageSessionId),"inverse-cold");
  }
  public observeInverseProducerArm(command: CurrentFootprintInverseProducerArmCommand): Promise<Reply> {
    const pair=this.#inverseWorkerPair;if(!this.#inversePurpose||pair===null||!this.#inverseWorkerSlots.has("saved-load-source-project")){throw new Error("FOOTPRINT_INVERSE_PRODUCER_ORIGINAL_PAIR");}
    return this.#request(currentFootprintInverseProducerArmWire(command,this.#nextId,pair.pageSessionId),"inverse-producer-arm");
  }
  public observeInverseConstruction(command: CurrentFootprintInverseConstructionCommand): Promise<Reply> {
    const pair = this.#inverseWorkerPair; if (!this.#inversePurpose || pair === null || !this.#inverseWorkerSlots.has("saved-load-source-project")) { throw new Error("FOOTPRINT_INVERSE_CONSTRUCTION_ORIGINAL_PAIR"); }
    return this.#request(currentFootprintInverseConstructionWire(command, this.#nextId, pair.pageSessionId), "inverse-construction");
  }
  public openInverseProject(context: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> {
    this.requireInverseNoDispatchOrRegistration(target);
    if (!this.#inversePurpose || !this.#inverseParent || this.#inverseProjectOpening || context !== this.#inverseContext) { throw new Error("FOOTPRINT_INVERSE_OPEN_ONCE"); }
    this.#inverseProjectOpening = true; return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn", params: diagnosticOpeningParams(context, target, "open-project"), sessionId: this.#sessionId ?? "" }, "inverse-project-open");
  }
  private requireInverseNoDispatchOrRegistration(target: CurrentDisposableOpenSealedTarget): void {
    if (!this.#inversePurpose || !this.#inverseOriginalSettled || this.#inverseOriginalReply === null || this.#inverseTarget !== JSON.stringify(target)) { throw new Error("FOOTPRINT_INVERSE_REGISTRATION_REQUIRED"); }
  }
  protected observeInversePreflight(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> {
    if (!this.#inversePurpose || this.#sessionId === null || this.#inverseTarget !== null || this.#workerEvent !== null) { throw new Error("FOOTPRINT_INVERSE_PREFLIGHT_ONCE"); }
    this.#inverseTarget = JSON.stringify(target); this.#inverseContext = uniqueContextId;
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn", params: diagnosticOpeningParams(uniqueContextId, target, "preflight"), sessionId: this.#sessionId }, "inverse-preflight");
  }
  protected registerInverseProject(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> {
    if (!this.#inversePurpose || this.#sessionId === null || this.#inverseTarget !== JSON.stringify(target) || this.#inverseContext !== uniqueContextId || this.#inverseOpeningConsumed || this.#workerEvent !== null) { throw new Error("FOOTPRINT_INVERSE_OPEN_ONCE"); }
    this.#inverseOpeningConsumed = true;
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn", params: currentFootprintInverseRegistrationParams(uniqueContextId, target), sessionId: this.#sessionId }, "inverse-register");
  }
  protected requireInversePending(target: CurrentDisposableOpenSealedTarget): void {
    const pending = this.#pending;
    if (!this.#inversePurpose || !this.#inverseOpeningConsumed || this.#inverseTarget !== JSON.stringify(target) || pending === null || !pending.written ||
      this.#failure !== null || this.#inputEnded || this.#inputClosed || this.#outputClosed || this.#inverseOriginalPending !== pending) { throw new Error("FOOTPRINT_INVERSE_ORIGINAL_OPEN_PENDING"); }
  }
  protected requireInverseNoDispatch(target: CurrentDisposableOpenSealedTarget): void {
    const pending = this.#inverseOriginalPending, reply = this.#inverseOriginalReply;
    if (!this.#inversePurpose || !this.#inverseOpeningConsumed || this.#inverseTarget !== JSON.stringify(target) || pending === null || !pending.written ||
      !types.isPromise(this.#inverseOriginalPromise) || !this.#inverseOriginalSettled || reply === null || pending.reply !== reply || this.#pending === pending ||
      this.#failure !== null || this.#inputEnded || this.#inputClosed || this.#outputClosed) { throw new Error("FOOTPRINT_INVERSE_ORIGINAL_NO_DISPATCH_RESULT"); }
    const decoded = decodeCurrentFootprintInverseRegistrationReply(reply, target);
    if (!decoded.priorRegistrationPresent || decoded.registrationDispatched) { throw new Error("FOOTPRINT_INVERSE_ACTUAL_NO_DISPATCH_REQUIRED"); }
  }
  public observeSavedReadbackCacheGuard(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> {
    if (!this.#savedReadbackPurpose || this.#sessionId === null || !this.#savedReadbackParent || this.#workerEvent !== null) { return Promise.reject(new Error("SAVED_READBACK_CACHE_GUARD_PURPOSE")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn", params: diagnosticOpeningParams(uniqueContextId, target, "preflight"), sessionId: this.#sessionId }, "saved-readback-cache-guard");
  }

  public observeSavedReadbackLoadingGuard(uniqueContextId: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> {
    if (!this.#savedReadbackPurpose || this.#sessionId === null || !this.#savedReadbackParent || this.#workerEvent !== null) { return Promise.reject(new Error("SAVED_READBACK_LOAD_GUARD_PURPOSE")); }
    return this.#request({ id: this.#nextId, method: "Runtime.callFunctionOn", params: diagnosticOpeningParams(uniqueContextId, target, "preflight"), sessionId: this.#sessionId }, "saved-readback-load-guard");
  }

  protected armSchematicSavedCacheParentCommand(): Promise<Reply> {
    if (!this.#schematicSavedPurpose || this.#sessionId === null || this.#schematicSavedEarlyStep !== 3 || this.#schematicSavedParent) { throw new Error("SCHEMATIC_SAVED_PARENT_ONCE"); }
    this.#schematicSavedParent = true; return this.#request(currentSchematicRelevanceSavedParentWire(this.#nextId, this.#sessionId), "schematic-saved-parent");
  }
  protected observeSchematicSavedPreflightCommand(context: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> {
    if (!this.#schematicSavedPurpose || this.#sessionId === null || !this.#schematicSavedParent || this.#schematicSavedPreflight) { throw new Error("SCHEMATIC_SAVED_PREFLIGHT_ONCE"); }
    this.#schematicSavedPreflight = true; return this.#request(currentSchematicRelevanceSavedPreflightWire(this.#nextId, this.#sessionId, context, target), "schematic-saved-preflight");
  }
  protected observeSchematicSavedCacheCommand(plan: CurrentPcbViaSavedCachePlan): Promise<Reply> {
    if (!this.#schematicSavedPurpose || this.#sessionId === null || !this.#schematicSavedPreflight || plan.command.phase === "saved-cache-delete" && (!this.#schematicSavedBackup || !this.#schematicSavedGuards.has(`before-delete-${String(plan.command.ordinal)}`))) { throw new Error("SCHEMATIC_SAVED_CACHE_ORIGINAL"); }
    return this.#request(currentSchematicRelevanceSavedCacheWire(plan, this.#nextId, this.#sessionId), "schematic-saved-cache");
  }
  protected bindSchematicSavedSceneCommand(): void {
    if (!this.#schematicSavedPurpose || this.#schematicSavedScene || !this.#schematicSavedOpeningStages.has("open-page") || this.#pending !== null || this.#viaRetainedPending !== null || this.#failure !== null) { throw new Error("SCHEMATIC_SAVED_SCENE_BIND_ONCE"); } this.#schematicSavedScene = true;
  }
  protected observeSchematicSavedSceneCommand(command: CurrentSchematicRelevanceSavedSceneCommand): Promise<Reply> {
    const phase = command.savedScenePhase;
    if (!this.#schematicSavedPurpose || this.#sessionId === null || !this.#schematicSavedScene || this.#schematicSavedSceneStages.has(phase) || phase !== "capture" && !this.#schematicSavedSceneStages.has("capture") || phase === "observe" && this.#schematicSavedSceneStages.has("release")) { throw new Error("SCHEMATIC_SAVED_SCENE_ONCE"); }
    this.#schematicSavedSceneStages.add(phase); return this.#request(currentSchematicRelevanceSavedSceneWire(command, this.#nextId, this.#sessionId).command, "schematic-saved-scene");
  }
  protected bindSchematicSavedOpeningCommand(): void {
    if (!this.#schematicSavedPurpose || this.#schematicSavedRegistrationSlot === null || this.#pending !== null || this.#schematicSavedOpening || this.#schematicSavedColdPair !== null || this.#failure !== null) { throw new Error("SCHEMATIC_SAVED_OPENING_ONCE"); } this.#schematicSavedOpening = true;
  }
  protected observeSchematicSavedOpeningCommand(context: string, target: CurrentSchematicRelevanceSavedRegistrationTarget, phase: CurrentSchematicRelevanceSavedOpeningPhase, windowId: string): Promise<Reply> {
    if (!this.#schematicSavedPurpose || this.#sessionId === null || !this.#schematicSavedOpening || this.#schematicSavedOpeningStages.has(phase) || phase === "open-project" && !this.#schematicSavedOpeningStages.has("preflight") || phase === "open-page" && (!this.#schematicSavedOpeningStages.has("open-project") || !this.#schematicSavedColdObservation)) { throw new Error("SCHEMATIC_SAVED_OPENING_ORDER"); }
    this.#schematicSavedOpeningStages.add(phase); let label: RequestPhase = "schematic-saved-open-page"; if (phase === "preflight") { label = "schematic-saved-open-preflight"; } else if (phase === "open-project") { label = "schematic-saved-open-project"; } return this.#request(currentSchematicRelevanceSavedOpeningWire(this.#nextId, this.#sessionId, context, target, phase, windowId), label);
  }
  protected requireSchematicSavedOpeningPendingCommand(): void {
    if (!this.#schematicSavedPurpose || !this.#schematicSavedOpening || !this.#schematicSavedOpeningStages.has("open-project") || this.#viaRetainedPending === null || !this.#viaRetainedPending.written || this.#failure !== null) { throw new Error("SCHEMATIC_SAVED_OPENING_ORIGINAL_PENDING"); }
  }
  protected registerSchematicSavedCommand(context: string, target: CurrentSchematicRelevanceSavedRegistrationTarget, retain: (pending: Promise<Reply>) => void): Promise<Reply> {
    if (!this.#schematicSavedPurpose || this.#sessionId === null || !this.#schematicSavedGuards.has("loading") || this.#schematicSavedColdEvent === null || this.#schematicSavedRegistrationAttempted || this.#schematicSavedColdPair !== null || typeof retain !== "function") { throw new Error("SCHEMATIC_SAVED_REGISTRATION_ONCE"); }
    this.#schematicSavedRegistrationAttempted = true; this.#schematicSavedRegistrationTarget = JSON.stringify(target);
    return this.#request(currentSchematicRelevanceSavedRegistrationWire(this.#nextId, this.#sessionId, context, target), "schematic-saved-register", retain);
  }
  protected requireSchematicSavedRegistrationPendingCommand(pending: Promise<unknown>): void {
    if (!this.#schematicSavedPurpose || this.#failure !== null || this.#schematicSavedRegistrationPromise !== pending || this.#schematicSavedRegistrationSlot === null || this.#pending !== this.#schematicSavedRegistrationSlot) { throw new Error("SCHEMATIC_SAVED_REGISTRATION_ORIGINAL_PENDING"); }
  }
  protected requireSchematicSavedRegistrationNoDispatchCommand(pending: Promise<unknown>, target: CurrentSchematicRelevanceSavedRegistrationTarget): void {
    const slot = this.#schematicSavedRegistrationSlot;
    if (!this.#schematicSavedPurpose || this.#failure !== null || this.#schematicSavedRegistrationPromise !== pending || slot === null || !slot.written || slot.reply === null || this.#pending === slot || JSON.stringify(target) !== this.#schematicSavedRegistrationTarget) { throw new Error("SCHEMATIC_SAVED_REGISTRATION_ORIGINAL_NO_DISPATCH"); }
    const result = decodeCurrentSchematicRelevanceSavedRegistrationReply(slot.reply, target); if (!result.priorRegistrationPresent || result.registrationDispatched) { throw new Error("SCHEMATIC_SAVED_REGISTRATION_NO_DISPATCH_REQUIRED"); }
  }
  protected retainSchematicSavedColdCommand(event: (value: DiagnosticEvent) => void): void {
    if (!this.#schematicSavedPurpose || !this.#schematicSavedGuards.has("loading") || this.#schematicSavedColdEvent !== null || this.#pending !== null || typeof event !== "function") { throw new Error("SCHEMATIC_SAVED_COLD_EVENTS_ONCE"); } this.#schematicSavedColdEvent = event;
  }
  protected bindSchematicSavedColdCommand(pair: CurrentPcbViaSavedLoadWorkerPair): void {
    if (!this.#schematicSavedPurpose || this.#schematicSavedColdEvent === null || this.#schematicSavedColdPair !== null || this.#workerSessions.get(pair.pageSessionId) !== pair.targetId || this.#workerSessions.get(pair.browserSessionId) !== pair.targetId || pair.pageSessionId === pair.browserSessionId) { throw new Error("SCHEMATIC_SAVED_COLD_ORIGINAL_PAIR"); } this.#schematicSavedColdPair = pair;
  }
  protected bindSchematicSavedColdObservationCommand(): void {
    if (!this.#schematicSavedPurpose || this.#schematicSavedColdPair === null || this.#schematicSavedColdObservation || !this.#schematicSavedColdSlots.has("saved-load-source-project")) { throw new Error("SCHEMATIC_SAVED_COLD_OBSERVATION_ONCE"); } this.#schematicSavedColdObservation = true;
  }
  protected observeSchematicSavedColdCommand(command: CurrentPcbViaSavedLoadWorkerCommand): Promise<Reply> {
    const pair = this.#schematicSavedColdPair; if (!this.#schematicSavedPurpose || pair === null) { throw new Error("SCHEMATIC_SAVED_COLD_ORIGINAL_PAIR"); }
    const slot = `${command.phase}${"role" in command ? `-${command.role}` : ""}`;
    if (command.phase.startsWith("saved-observe-") && !this.#schematicSavedColdObservation || !command.phase.startsWith("saved-observe-") && this.#schematicSavedColdSlots.has(slot)) { throw new Error("SCHEMATIC_SAVED_COLD_ONCE"); }
    this.#schematicSavedColdSlots.add(slot); return this.#request(currentSchematicRelevanceSavedColdWire(command, this.#nextId, pair), "schematic-saved-cold");
  }
  protected enrollSchematicSavedBackupCommand(): void {
    if (!this.#schematicSavedPurpose || !this.#schematicSavedPreflight || this.#schematicSavedBackup || this.#pending !== null) { throw new Error("SCHEMATIC_SAVED_BACKUP_ENROLL_ONCE"); } this.#schematicSavedBackup = true;
  }
  protected observeSchematicSavedGuardCommand(context: string, target: CurrentDisposableOpenSealedTarget, stage: "before-delete-0" | "before-delete-1" | "loading"): Promise<Reply> {
    if (!this.#schematicSavedPurpose || this.#sessionId === null || !this.#schematicSavedBackup || this.#schematicSavedGuards.has(stage)) { throw new Error("SCHEMATIC_SAVED_GUARD_ONCE"); }
    this.#schematicSavedGuards.add(stage); return this.#request(currentSchematicRelevanceSavedGuardWire(this.#nextId, this.#sessionId, context, target, stage), "schematic-saved-guard");
  }
  protected observeSchematicSavedMetadataCommand(plan: CurrentPcbViaSavedCacheMetadataPlan): Promise<Reply> {
    if (!this.#schematicSavedPurpose || this.#sessionId === null || !this.#schematicSavedPreflight) { throw new Error("SCHEMATIC_SAVED_METADATA_ORIGINAL"); }
    return this.#request(currentSchematicRelevanceSavedMetadataWire(plan, this.#nextId, this.#sessionId), "schematic-saved-metadata");
  }
  protected retainSchematicSavedEarlyActorsCommand(event: (value: DiagnosticEvent) => "held" | "project"): void {
    if (!this.#schematicSavedPurpose || this.#sessionId !== null || this.#nextId !== 1 || this.#pending !== null || this.#schematicSavedEarlyEvent !== null || typeof event !== "function") { throw new Error("SCHEMATIC_SAVED_EARLY_EVENTS_ONCE"); } this.#schematicSavedEarlyEvent = event;
  }
  protected observeSchematicSavedEarlyActorsCommand(stage: CurrentSchematicRelevanceSavedEarlyStage): Promise<Reply> {
    if (!this.#schematicSavedPurpose || this.#sessionId !== null || this.#schematicSavedEarlyEvent === null || this.#pending !== null || ["before", "arm", "after"].indexOf(stage) !== this.#schematicSavedEarlyStep) { throw new Error("SCHEMATIC_SAVED_EARLY_ORDER"); }
    this.#schematicSavedEarlyStep += 1; return this.#request(currentSchematicRelevanceSavedEarlyWire(this.#nextId, stage), "schematic-saved-early-actors");
  }
  public observeSavedReadbackMetadata(plan: CurrentPcbViaSavedCacheMetadataPlan): Promise<Reply> {
    if (!this.#savedReadbackPurpose || this.#sessionId === null || !this.#savedReadbackParent || this.#workerEvent !== null) { return Promise.reject(new Error("SAVED_READBACK_METADATA_PURPOSE")); }
    return this.#request(currentPcbViaSavedCacheMetadataWire(plan, this.#nextId, this.#sessionId), "saved-readback-metadata");
  }
  public armSavedReadbackCacheActors(): Promise<Reply> {
    if (!this.#savedReadbackPurpose || this.#sessionId === null || this.#savedReadbackActors || this.#savedReadbackParent) { return Promise.reject(new Error("SAVED_READBACK_ACTORS_CONSUMED")); }
    this.#savedReadbackActors = true;
    return this.#request(currentPcbViaSavedReadbackActorWire(this.#nextId), "saved-readback-actors");
  }
  public retainSavedReadbackEarlyActors(event: (value: DiagnosticEvent) => "held" | "project"): void {
    if (!this.#savedReadbackPurpose || this.#sessionId !== null || this.#nextId !== 1 || this.#pending !== null || this.#savedReadbackEarlyActorEvent !== null || typeof event !== "function") { throw new Error("SAVED_READBACK_EARLY_ACTOR_EVENTS_ONCE"); }
    this.#savedReadbackEarlyActorEvent = event;
  }
  public observeSavedReadbackEarlyActors(stage: CurrentPcbViaSavedEarlyActorStage): Promise<Reply> {
    if (!this.#savedReadbackPurpose || this.#sessionId !== null || this.#savedReadbackEarlyActorEvent === null || this.#pending !== null ||
      ["before", "arm", "after"][this.#savedReadbackEarlyActorStep] !== stage || this.#nextId !== this.#savedReadbackEarlyActorStep + 1) { return Promise.reject(new Error("SAVED_READBACK_EARLY_ACTOR_SEQUENCE")); }
    this.#savedReadbackEarlyActorStep += 1; if (stage === "arm") { this.#savedReadbackActors = true; }
    return this.#request(currentPcbViaSavedEarlyActorWire(this.#nextId, stage), "saved-readback-early-actors");
  }
  public armSavedReadbackCacheParent(): Promise<Reply> {
    if (!this.#savedReadbackPurpose || this.#sessionId === null || this.#savedReadbackParent || !this.#savedReadbackActors) { return Promise.reject(new Error("SAVED_READBACK_PARENT_CONSUMED")); }
    this.#savedReadbackParent = true;
    return this.#request(currentPcbViaSavedReadbackParentWire(this.#nextId, this.#sessionId), "saved-readback-parent");
  }
  public observeSavedReadbackCache(plan: CurrentPcbViaSavedCachePlan): Promise<Reply> {
    if (!this.#savedReadbackPurpose || this.#sessionId === null || this.#workerEvent !== null) { return Promise.reject(new Error("SAVED_READBACK_CACHE_PURPOSE")); }
    return this.#request(currentPcbViaSavedCacheWire(plan, this.#nextId, this.#sessionId), "saved-readback-cache");
  }

  public retainSavedReadbackLoadEvents(event: (value: DiagnosticEvent) => void): void {
    if (!this.#savedReadbackPurpose || !this.#savedReadbackLoadingGuard || this.#savedReadbackLoadEvent !== null || this.#savedReadbackLoadPair !== null || this.#pending !== null || typeof event !== "function") { throw new Error("SAVED_READBACK_LOAD_EVENTS_ONCE"); }
    this.#savedReadbackLoadEvent = event;
  }
  public bindSavedReadbackLoadWorker(pair: CurrentPcbViaSavedLoadWorkerPair): void {
    if (!this.#savedReadbackPurpose || this.#savedReadbackLoadEvent === null || this.#savedReadbackLoadPair !== null || this.#workerSessions.get(pair.pageSessionId) !== pair.targetId || this.#workerSessions.get(pair.browserSessionId) !== pair.targetId || pair.pageSessionId === pair.browserSessionId) { throw new Error("SAVED_READBACK_LOAD_ORIGINAL_PAIR"); }
    this.#savedReadbackLoadPair = pair;
  }
  public bindSavedReadbackLoadObservation(): void {
    if (!this.#savedReadbackPurpose || this.#savedReadbackLoadPair === null || this.#savedReadbackObservation || !this.#savedReadbackLoadSlots.has("saved-load-source-project")) { throw new Error("SAVED_READBACK_OBSERVATION_BIND_ONCE"); }
    this.#savedReadbackObservation = true;
  }
  public observeSavedReadbackLoadWorker(command: CurrentPcbViaSavedLoadWorkerCommand): Promise<Reply> {
    const pair = this.#savedReadbackLoadPair;
    if (!this.#savedReadbackPurpose || pair === null) { throw new Error("SAVED_READBACK_LOAD_ORIGINAL_PAIR"); }
    const slot = `${command.phase}${"role" in command ? `-${command.role}` : ""}${"index" in command ? `-${String(command.index)}` : ""}`;
    if (!this.#savedReadbackObservation && command.phase.startsWith("saved-observe-")) { throw new Error("SAVED_READBACK_OBSERVATION_NOT_BOUND"); }
    if (this.#savedReadbackLoadSlots.has(slot) && !command.phase.startsWith("saved-observe-")) { throw new Error("SAVED_READBACK_LOAD_COMMAND_CONSUMED"); }
    this.#savedReadbackLoadSlots.add(slot); return this.#request(currentPcbViaSavedLoadWorkerFrame(command, this.#nextId, pair), "saved-readback-worker");
  }

  public status(): Readonly<{ started: boolean; failure: Failure | null; failureObservation: CurrentPcbDiagnosticFailureObservation | null; pendingRequestId: number | null;
    requestCount: number; receivedBytes: number; inputEnded: boolean; inputClosed: boolean;
    outputClosed: boolean; listenersReleased: boolean; nativeOwnerVerified: false; executionAuthorized: false }> {
    return Object.freeze({ started: this.#started, failure: this.#failure, failureObservation: this.#failureObservation, pendingRequestId: this.#pending?.id ?? this.#viaRetainedPending?.id ?? this.#inversePublicDeletePending?.id ?? this.#inverseNativeGetLookupPending?.id ?? this.#inverseNativeGetTaskPending?.id ?? null,
      requestCount: this.#nextId - 1, receivedBytes: this.#receivedBytes, inputEnded: this.#inputEnded,
      inputClosed: this.#inputClosed, outputClosed: this.#outputClosed, listenersReleased: this.#released,
      nativeOwnerVerified: false, executionAuthorized: false });
  }

  /** Remove this object's listeners only after BOTH streams have emitted close.
   * This observes transport closure, not original EasyEDA/Job termination.
   * It does not close a stream or authorize a fresh launch. */
  public releaseClosedListeners(): void {
    if (!this.#inputClosed || !this.#outputClosed || this.#pending !== null || this.#viaRetainedPending !== null || this.#inversePublicDeletePending !== null || this.#inverseNativeGetLookupPending !== null || this.#inverseNativeGetTaskPending !== null) {
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
  /** Submit only an enrolled finite purpose/marker/phase conjunction. Keep
   * original invocation slots separate while their bounded probes proceed;
   * neither an acknowledged write nor a reply can replace the other. */
  async #request(command: ReturnType<typeof currentFootprintInverseNativeGetTaskManagerWire> | (CurrentSchematicRelevanceModifyEchoContinuationCommand & Readonly<{schematicRelevanceModifyEchoCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseNativeGetTaskCallbackWire> | (CurrentSchematicRelevancePublicationCommand & Readonly<{schematicRelevancePublicationReturnCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceModifyReturnContinuationCommand & Readonly<{schematicRelevanceModifyReturnCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceModifyCanvasContinuationCommand & Readonly<{schematicRelevanceModifyCanvasCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseNativeGetTaskDependenciesWire> | ReturnType<typeof currentFootprintInverseNativeGetTaskIntrinsicsWire> | ReturnType<typeof currentFootprintInverseNativeGetTaskSenderWire> | ReturnType<typeof currentFootprintInverseNativeGetLookupWire> | ReturnType<typeof currentFootprintInverseNativeGetWorkerWire> | (CurrentSchematicRelevanceModifyCmContinuationCommand & Readonly<{schematicRelevanceModifyCmCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseNativeDeleteSenderWire> | ReturnType<typeof currentFootprintInverseNativeDeleteRegistrationWire> | (CurrentSchematicRelevanceModifyStructureCommand & Readonly<{schematicRelevanceModifyStructureCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceModifyContinuationCommand & Readonly<{schematicRelevanceModifyContinuationCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseDeleteSendWire> | (CurrentSchematicRelevanceModifyWorkerCommand & Readonly<{schematicRelevanceModifyWorkerCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevancePublicationCommand & Readonly<{schematicRelevancePublicationCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceNotificationWireCommand & Readonly<{schematicRelevanceNotificationCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceSdkGateCommand & Readonly<{schematicRelevanceSdkGateCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseDeleteCallbackWire> | ReturnType<typeof currentFootprintInverseDeleteManagerWire> | ReturnType<typeof currentFootprintInverseDeleteCollateralWire> | ReturnType<typeof currentFootprintInverseDeletePrefixWire> | ReturnType<typeof currentFootprintInverseReferenceProgressWire> | ReturnType<typeof currentFootprintInverseReferenceResultWire> | ReturnType<typeof currentFootprintInverseReferenceSendWire> | (CurrentSchematicRelevanceNormalCommandUiCommand & Readonly<{schematicRelevanceNormalCommandUiCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceFileSaveUiCommand & Readonly<{schematicRelevanceFileSaveUiCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseReferenceCallbackWire> | (CurrentSchematicRelevanceRenderDelegateCommand & Readonly<{schematicRelevanceRenderDelegateCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseReferenceDispatchWire> | ReturnType<typeof currentFootprintInverseReferenceWorkerWire> | ReturnType<typeof currentFootprintInverseReferenceUiWire> | (CurrentSchematicRelevanceStatusTabMutationCommand & Readonly<{schematicRelevanceStatusTabMutationCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceStatusTabLookupCommand & Readonly<{schematicRelevanceStatusTabLookupCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceStatusSubscriberCommand & Readonly<{schematicRelevanceStatusSubscriberCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseReferenceEntryWire> | (CurrentSchematicRelevanceStatusCloneCommand & Readonly<{schematicRelevanceStatusCloneCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseGetResultWire> | (CurrentSchematicRelevanceStatusDeliveryCommand & Readonly<{schematicRelevanceStatusDeliveryCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceStatusBusCommand & Readonly<{schematicRelevanceStatusBusCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceHistoryStatusCommand & Readonly<{schematicRelevanceHistoryStatusCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceUploadReturnCommand & Readonly<{schematicRelevanceUploadReturnCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseGetSendWire> | (CurrentSchematicRelevancePendingCacheCommand & Readonly<{schematicRelevancePendingCacheCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentSchematicRelevanceSavedSceneWire>["command"] | ReturnType<typeof currentSchematicRelevanceSavedOpeningWire> | ReturnType<typeof currentSchematicRelevanceSavedRegistrationWire> | ReturnType<typeof currentSchematicRelevanceSavedColdWire> | (CurrentSchematicRelevanceUploadCmCommand & Readonly<{schematicRelevanceUploadCmCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentSchematicRelevanceSavedGuardWire> | (CurrentSchematicRelevanceUploadSerializeCommand & Readonly<{schematicRelevanceUploadSerializeCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentSchematicRelevanceSavedCacheWire> | ReturnType<typeof currentSchematicRelevanceSavedMetadataWire> | ReturnType<typeof currentSchematicRelevanceSavedParentWire> | ReturnType<typeof currentSchematicRelevanceSavedPreflightWire> | (CurrentSchematicRelevanceUploadModelCommand & Readonly<{schematicRelevanceUploadModelCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseGetCallbackWire> | (CurrentSchematicRelevanceUploadEntryCommand & Readonly<{schematicRelevanceUploadEntryCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentSchematicRelevanceSavedEarlyWire> | (CurrentSchematicRelevanceNoEchoCommand & Readonly<{schematicRelevanceNoEchoCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseGetCompletionWire> | ReturnType<typeof currentFootprintInverseGetNativeWire> | ReturnType<typeof currentFootprintInverseGetManagerWire> | (CurrentSchematicRelevanceNormalRecordCommand & Readonly<{schematicRelevanceNormalRecordCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceNormalDisposalCommand & Readonly<{schematicRelevanceNormalDisposalCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceNormalUpdateCommand & Readonly<{schematicRelevanceNormalUpdateCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseGetForwardingWire> | ReturnType<typeof currentFootprintInverseGetRpcEntryWire> | (CurrentSchematicRelevanceHistoryCommand & Readonly<{schematicRelevanceHistoryCommandCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseGetWorkerWire> | ReturnType<typeof currentFootprintInverseGetIntrinsicsWire> | (CurrentSchematicRelevanceMonitorBatchCommand & Readonly<{schematicRelevanceMonitorBatchCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceRecordAstCommand & Readonly<{schematicRelevanceRecordAstCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseNativeDeliveryWire> | (CurrentSchematicRelevancePrimitiveCommand & Readonly<{schematicRelevancePrimitiveCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseLookupPreentryWire> | (CurrentSchematicRelevanceUiPublicationCommand & Readonly<{schematicRelevanceUiPublicationCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseNativeChannelWire> | ReturnType<typeof currentFootprintInverseNativeDeleteBootstrapWire> | ReturnType<typeof currentFootprintInverseUiOwnDataWire> | ReturnType<typeof currentFootprintInverseOwnDataWire> | ReturnType<typeof currentFootprintInversePublicPreferencesWire> | ReturnType<typeof currentFootprintInverseDeleteWorkerPeerWire> | ReturnType<typeof currentFootprintInverseDeleteJobWire> | ReturnType<typeof currentFootprintInverseDeleteRpcWire> | ReturnType<typeof currentFootprintInversePublicCallWire> | ReturnType<typeof currentFootprintInverseDeleteEntryWire> | ReturnType<typeof currentFootprintInversePublicServiceWire> | ReturnType<typeof currentFootprintInverseClockWorkerWire> | ReturnType<typeof currentFootprintInversePublicApiWire> | ReturnType<typeof currentFootprintInverseDeleteEncoderWire> | ReturnType<typeof currentFootprintInverseDeleteBindingWire> | (CurrentProjectLibraryRefreshCommand & Readonly<{libraryRefresh:true;id:number;sessionId:string}>) | (CurrentPcbViaPostHistorySyncTransportCommand & Readonly<{schematicRelevancePostSyncCommand:true;id:number;sessionId:string}>) | (CurrentPcbViaSaveDrainCommand & Readonly<{schematicRelevanceDrainCommand:true;id:number;sessionId:string}>) | (CurrentPcbViaSaveTailDeleteControlCommand & Readonly<{schematicRelevanceTailDeleteCommand:true;id:number;sessionId:string}>) | (CurrentProjectSaveProducerCommand & Readonly<{schematicRelevanceTailExtraCommand:true;id:number;sessionId:string}>) | (CurrentPcbViaSaveTailObservationCommand & Readonly<{schematicRelevanceTailCommand:true;id:number;sessionId:string}>) | (CurrentPcbViaObservedSourceCommand & Readonly<{schematicRelevanceObservedSourceCommand:true;id:number;sessionId:string}>) | (CurrentProjectLibraryRefreshCommand & Readonly<{schematicRelevanceLibraryRefreshCommand:true;id:number;sessionId:string}>) | (CurrentPcbViaLocalUploadCommand & Readonly<{schematicRelevanceSaveLocalCommand:true;id:number;sessionId:string}>) | (CurrentPcbViaUploadRequestCommand & Readonly<{schematicRelevanceSaveUploadCommand:true;id:number;sessionId:string}>) | (CurrentProjectSaveProducerCommand & Readonly<{schematicRelevanceLocalCacheCommand:true;id:number;sessionId:string}>) | (CurrentProjectSyncQuiesceCommand & Readonly<{schematicRelevanceSyncQuiesceCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseModelStepWire> | (CurrentSchematicRelevanceDisplayNativeCommand & Readonly<{schematicRelevanceSaveGeneration:true;id:number;sessionId:string}>) | (CurrentSchematicDisplayClockCommand & Readonly<{schematicRelevanceClockCommand:true;schematicClockRealm:CurrentSchematicDisplayClockRealm;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseInitialSyncWire> | (CurrentSchematicRelevanceRunPrefixCommand & Readonly<{schematicRelevanceRunGuardCommand:true;schematicRelevanceRunGuardRole:CurrentSchematicRelevanceRunGuardStep["guard"];id:number;sessionId:string}>) | (CurrentSchematicRelevanceRunPrefixCommand & Readonly<{schematicRelevanceRunPrefixCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceDisplayModifyEntryCommand & Readonly<{schematicRelevanceModifyEntryCommand:true;id:number;sessionId:string}>) | (CurrentSchematicRelevanceDisplayNativeCommand & Readonly<{schematicRelevanceModifyGeneration:true;id:number;sessionId:string}>) |  ReturnType<typeof currentFootprintInverseInitialCacheWire> | (CurrentSchematicDisplayAccessorCommand & Readonly<{ schematicRelevanceAccessorCommand: true; id: number; sessionId: string }>) | (CurrentSchematicDisplayActionCommand & Readonly<{ schematicRelevanceActionCommand: true; id: number; sessionId: string }>) | (CurrentSchematicDisplayActionGuardCommand & Readonly<{ schematicRelevanceActionGuardCommand: true; id: number; sessionId: string }>) | ReturnType<typeof currentFootprintInverseStartupQueueWire> | ReturnType<typeof currentFootprintInverseTimerWire> | ReturnType<typeof currentFootprintInverseConditionWire> | ReturnType<typeof currentFootprintInverseStartupCallbackWire> | (CurrentSchematicDisplayActionGuardCommand & Readonly<{ schematicActionGuardCommand: true; id: number; sessionId: string }>) | ReturnType<typeof currentFootprintInverseColdStepWire> | (CurrentSchematicDisplayActionCommand & Readonly<{ schematicActionCommand: true; id: number; sessionId: string }>) | ReturnType<typeof currentFootprintInverseColdLoadWire> | (CurrentPcbViaObservedSourceCommand & Readonly<{viaObservedSourceCommand:true;id:number;sessionId:string}>) | (CurrentPcbViaSaveDrainCommand & Readonly<{viaSaveDrainCommand:true;id:number;sessionId:string}>) | (CurrentPcbViaPostHistorySyncTransportCommand & Readonly<{viaPostSyncCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseProducerArmWire> | (CurrentPcbViaSaveTailDeleteControlCommand & Readonly<{viaTailDeleteCommand:true;id:number;sessionId:string}>) | (CurrentPcbViaSaveTailObservationCommand & Readonly<{viaTailObservationCommand:true;id:number;sessionId:string}>) | (CurrentProjectSaveProducerCommand & Readonly<{viaTailExtraObservationCommand:true;id:number;sessionId:string}>) | (CurrentPcbViaUploadRequestCommand & Readonly<{viaUploadRequestCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseCacheInvalidationWire> | (CurrentProjectSyncQuiesceCommand & Readonly<{syncQuiesceCommand:true;id:number;sessionId:string}>) | ReturnType<typeof currentFootprintInverseCacheWire> | ReturnType<typeof currentFootprintInverseCacheMetadataWire> | ReturnType<typeof currentFootprintInverseConstructionWire> | CurrentPcbViaSavedStartPageCommand | (CurrentPcbViaLocalUploadCommand & Readonly<{ viaLocalUploadCommand: true; id: number; sessionId: string }>) | ReturnType<typeof currentFootprintInverseActorWire> | ReturnType<typeof currentFootprintInverseParentWire> | ReturnType<typeof currentFootprintInverseWorkerWire> | CurrentPcbViaSavedSceneCommand | (PeriodicSyncWireCommand & Readonly<{ id: number; sessionId: string }>) | (InitialSyncWireCommand & Readonly<{ id: number; sessionId: string }>) | (CurrentPcbViaSavedLoadWorkerCommand & Readonly<{ id: number; sessionId: string; savedReadbackWorker: true }>) | SavedReadbackCacheWire | (InitialCacheWireCommand & Readonly<{ id: number; sessionId: string }>) | (ProducerObserveWireCommand & Readonly<{ id: number; sessionId: string }>) | (ProducerGuardWireCommand & Readonly<{ id: number; sessionId: string }>) | (StructureTransportWireCommand & Readonly<{ id: number; sessionId: string }>) | ((CurrentSchematicDisplayAccessorCommand & Readonly<{ schematicAccessorCommand: true }>) & Readonly<{ id: number; sessionId: string }>) | ((CurrentSchematicDisplayClockCommand & Readonly<{ schematicClockCommand: true; schematicClockRealm: CurrentSchematicDisplayClockRealm }>) & Readonly<{ id: number; sessionId: string }>) | ((SchematicWorkerParentCommand | (CurrentSchematicDisplayWorkerCommand & Readonly<{ schematicWorkerCommand: true }>)) & Readonly<{ id: number; sessionId: string }>) | ((CurrentSchematicDisplayNativeCommand | CurrentSchematicRelevanceDisplayNativeCommand | CurrentSchematicWireEditNativeCommand) & Readonly<{ id: number; sessionId: string }>) | DiagnosticCommand | CurrentPcbSpatialWireCommand | ((CurrentPcbViaWriteCommand | CurrentPcbViaSpatialCommand | CurrentPcbViaSdkPropertiesCommand | ViaWorkerParentCommand | ViaClockWireCommand | (CurrentPcbViaWorkerCommand & Readonly<{ viaWorkerCommand: true }>)) & Readonly<{ id: number; sessionId: string }>) | (CurrentFootprintSavedCacheCommand & Readonly<{ id: number }>) | (CurrentFootprintSavedCacheAccessorCommand & Readonly<{ id: number }>) | (CurrentFootprintSavedCacheHeldCommand & Readonly<{ id: number }>) | (Omit<CurrentPcbStringPrecreateCommand, "stringPhase"> &
    Readonly<{ id: number; sessionId: string }>), phase: RequestPhase = "discovery", retainSavedRegistration?: (pending: Promise<Reply>) => void): Promise<Reply> {
    if (!this.#started || this.#released || this.#handedOff) { throw new Error("PCB_DIAGNOSTIC_PIPE_NOT_STARTED"); }
    if (this.#inversePurpose) {
      const discovery = (phase === "discovery" || phase === "frame-owner") && CURRENT_PCB_SPATIAL_DISCOVERY_METHODS.some(method => method === command.method);
      const opening = (phase === "inverse-preflight" || phase === "inverse-register" || phase === "inverse-cache-guard") && command.method === "Runtime.callFunctionOn";
      const finite = this.#inversePurpose && phase === "inverse-native-get-task-manager" && "inverseNativeGetTaskManager" in command || this.#inversePurpose && phase === "inverse-native-get-task-callback" && "inverseNativeGetTaskCallback" in command || this.#inversePurpose && phase === "inverse-native-get-task-dependencies" && "inverseNativeGetTaskDependencies" in command || this.#inversePurpose && phase === "inverse-native-get-task-intrinsics" && "inverseNativeGetTaskIntrinsics" in command || this.#inversePurpose && phase === "inverse-native-get-task-sender" && "inverseNativeGetTaskSender" in command || this.#inversePurpose && phase === "inverse-native-get-lookup" && "inverseNativeGetLookup" in command || this.#inversePurpose && phase === "inverse-native-get-worker" && "inverseNativeGetWorker" in command || this.#inversePurpose && phase === "inverse-native-delete-sender" && "inverseNativeDeleteSender" in command || this.#inversePurpose && phase === "inverse-native-delete-registration" && "inverseNativeDeleteRegistration" in command || this.#inversePurpose && phase === "inverse-native-delete-bootstrap" && "inverseNativeDeleteBootstrap" in command || phase === "inverse-delete-send" && "inverseDeleteSend" in command || phase === "inverse-delete-callback" && "inverseDeleteCallback" in command || phase === "inverse-delete-manager" && "inverseDeleteManager" in command || phase === "inverse-delete-collateral" && "inverseDeleteCollateral" in command || phase === "inverse-delete-prefix" && "inverseDeletePrefix" in command || phase === "inverse-reference-progress" && "inverseReferenceProgress" in command || phase === "inverse-reference-result" && "inverseReferenceResult" in command || phase === "inverse-reference-send" && "inverseReferenceSend" in command || phase === "inverse-reference-callback" && "inverseReferenceCallback" in command || phase === "inverse-reference-dispatch" && "inverseReferenceDispatch" in command || phase === "inverse-reference-worker" && "inverseReferenceWorker" in command || phase === "inverse-reference-ui" && "inverseReferenceUi" in command || phase === "inverse-reference-entry" && "inverseReferenceEntry" in command || phase === "inverse-get-result" && "inverseGetResult" in command || phase === "inverse-get-send" && "inverseGetSend" in command || phase === "inverse-get-callback" && "inverseGetCallback" in command || phase === "inverse-get-completion" && "inverseGetCompletion" in command || phase === "inverse-get-native" && "inverseGetNative" in command || phase === "inverse-get-manager" && "inverseGetManager" in command || phase === "inverse-get-forwarding" && "inverseGetForwarding" in command || phase === "inverse-get-rpc-entry" && "inverseGetRpcEntry" in command || phase === "inverse-get-worker" && "inverseGetWorker" in command || phase === "inverse-get-intrinsics" && "inverseGetIntrinsics" in command || phase === "inverse-native-delivery" && "inverseNativeDelivery" in command || phase === "inverse-lookup-preentry" && "inverseLookupPreentry" in command || phase === "inverse-ui-own-data" && "inverseUiOwnData" in command || phase === "inverse-native-channel" && "inverseNativeChannel" in command || phase === "inverse-own-data" && "inverseOwnData" in command || phase === "inverse-public-preferences" && "inversePublicPreferences" in command || phase === "inverse-delete-worker-peer" && "inverseDeleteWorkerPeer" in command || phase === "inverse-delete-job" && "inverseDeleteJob" in command || phase === "inverse-public-call" && "inversePublicCall" in command || phase==="inverse-clock-worker"&&"inverseClockWorker"in command || phase==="inverse-delete-entry"&&"inverseDeleteEntry"in command || phase==="inverse-delete-rpc"&&"inverseDeleteRpc"in command || phase==="inverse-public-service"&&"inversePublicService"in command || phase==="inverse-public-api"&&"inversePublicApi"in command || phase==="inverse-delete-encoder"&&"inverseDeleteEncoder"in command || phase==="inverse-delete-bindings"&&"inverseDeleteBinding"in command || phase==="inverse-library-refresh"&&"libraryRefresh"in command || phase==="inverse-model-step"&&"inverseModelStep"in command || phase==="inverse-initial-sync"&&"inverseInitialSync"in command || phase==="inverse-initial-cache"&&"inverseInitialCache"in command || phase === "inverse-startup-queue" && "inverseStartupQueue" in command || phase === "inverse-timer" && "inverseTimer" in command || phase==="inverse-condition-source"&&"inverseConditionSource"in command || phase==="inverse-startup-callback"&&"inverseStartupCallback"in command || phase==="inverse-cold-step"&&"inverseColdStep"in command || phase === "inverse-cold" && "inverseColdLoad" in command || phase === "inverse-producer-arm" && "inverseProducerArm" in command || phase === "inverse-cache-invalidate" && "inverseCacheInvalidation" in command || phase === "inverse-cache" && "inverseCache" in command || phase === "inverse-cache-metadata" && "inverseCacheMetadata" in command || phase === "inverse-construction" && "inverseConstruction" in command || phase === "inverse-actors" && "inverseActors" in command || phase === "inverse-parent" && "inverseParent" in command || phase === "inverse-worker" && "inverseWorker" in command || phase === "inverse-project-open" && command.method === "Runtime.callFunctionOn";
      if (!discovery && !opening && !finite) { throw new Error("FOOTPRINT_INVERSE_FINITE_PIPE_ONLY"); }
    }
    if (this.#schematicSavedPurpose) {
      const early = phase === "schematic-saved-early-actors" && "schematicSavedEarlyActors" in command && this.#schematicSavedEarlyEvent !== null && this.#sessionId === null;
      const discovery = this.#schematicSavedEarlyStep === 3 && (phase === "discovery" || phase === "frame-owner") && CURRENT_PCB_SPATIAL_DISCOVERY_METHODS.some(method => method === command.method);
      const parent = phase === "schematic-saved-parent" && "schematicSavedParent" in command && command.schematicSavedParent && this.#schematicSavedParent;
      const preflight = phase === "schematic-saved-preflight" && "schematicSavedPreflight" in command && command.schematicSavedPreflight && this.#schematicSavedPreflight;
      const cache = phase === "schematic-saved-cache" && "schematicSavedCache" in command && command.schematicSavedCache && this.#schematicSavedPreflight;
      const scene = phase === "schematic-saved-scene" && "schematicRelevanceSavedScene" in command && this.#schematicSavedScene;
      const opening = "schematicSavedOpening" in command && this.#schematicSavedOpening && (phase === "schematic-saved-open-preflight" && command.schematicSavedOpening === "preflight" || phase === "schematic-saved-open-project" && command.schematicSavedOpening === "open-project" || phase === "schematic-saved-open-page" && command.schematicSavedOpening === "open-page");
      const registration = phase === "schematic-saved-register" && "schematicSavedRegistration" in command && this.#schematicSavedRegistrationAttempted;
      const cold = phase === "schematic-saved-cold" && "schematicSavedCold" in command && this.#schematicSavedColdPair !== null;
      const guard = phase === "schematic-saved-guard" && "schematicSavedGuard" in command && this.#schematicSavedBackup && this.#schematicSavedGuards.has(command.schematicSavedGuard);
      const metadata = phase === "schematic-saved-metadata" && "schematicSavedMetadata" in command && command.schematicSavedMetadata && this.#schematicSavedPreflight;
      if (!early && !discovery && !parent && !preflight && !cache && !metadata && !guard && !registration && !cold && !opening && !scene) { throw new Error("SCHEMATIC_SAVED_FINITE_PIPE_ONLY"); }
      if (discovery) { if (this.#schematicSavedDiscovery >= 16 + (this.#schematicSavedParent ? 9 : 0) + this.#schematicSavedGuards.size * 9 + (this.#schematicSavedRegistrationAttempted ? 1 : 0) + (this.#schematicSavedOpening ? 15 : 0) + (this.#schematicSavedScene ? 2 : 0)) { throw new Error("SCHEMATIC_SAVED_DISCOVERY_BUDGET"); } this.#schematicSavedDiscovery += 1; }
      if (cache) { if (this.#schematicSavedCacheCount >= SCH_SAVED_PROFILE.renderer.cache) { throw new Error("SCHEMATIC_SAVED_CACHE_BUDGET"); } this.#schematicSavedCacheCount += 1; }
      if (metadata) { if (this.#schematicSavedMetadataCount >= SCH_SAVED_PROFILE.renderer.metadata) { throw new Error("SCHEMATIC_SAVED_METADATA_BUDGET"); } this.#schematicSavedMetadataCount += 1; }
    }
    if (this.#savedReadbackPurpose) {
      const opening = this.#savedReadbackOpening && (phase === "saved-readback-project-preflight" || phase === "saved-readback-open-project") && command.method === "Runtime.callFunctionOn";
      const startPage = phase === "saved-readback-start-page" && "savedStartPagePhase" in command && this.#sessionId === null;
      const scene = this.#savedReadbackSceneContext !== null && phase === "saved-readback-scene" && "savedReadbackScene" in command && command.savedReadbackScene;
      const model = this.#savedReadbackModel && phase === "saved-readback-model" && command.method === "Runtime.callFunctionOn";
      const registration = phase === "saved-readback-register" && command.method === "Runtime.callFunctionOn";
      const worker = phase === "saved-readback-worker" && "savedReadbackWorker" in command && command.savedReadbackWorker;
      const cache = phase === "saved-readback-cache" && "savedReadbackCache" in command && command.savedReadbackCache;
      const metadata = phase === "saved-readback-metadata" && "savedReadbackMetadata" in command && command.savedReadbackMetadata;
      const parent = phase === "saved-readback-parent" && "savedReadbackParent" in command && command.savedReadbackParent === "arm" || phase === "saved-readback-actors" && "savedReadbackActors" in command && command.savedReadbackActors === "arm";
      const guard = phase === "saved-readback-cache-guard" && command.method === "Runtime.callFunctionOn";
      const loadGuard = phase === "saved-readback-load-guard" && command.method === "Runtime.callFunctionOn";
      const preflight = phase === "project-preflight" && command.method === "Runtime.callFunctionOn";
      const discovery = (phase === "discovery" || phase === "frame-owner") && CURRENT_PCB_SPATIAL_DISCOVERY_METHODS.some(method => method === command.method);
      const early = phase === "saved-readback-early-actors" && "savedReadbackEarlyActors" in command && this.#savedReadbackEarlyActorEvent !== null && this.#sessionId === null;
      if (!startPage && !scene && !model && !early && !opening && !registration && !worker && !cache && !metadata && !parent && !preflight && !guard && !loadGuard && !discovery) { throw new Error("SAVED_READBACK_DISCOVERY_ONLY"); }
      if (worker) { if (this.#savedReadbackLoadSlots.size > 22 + CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.loadingObservation) { throw new Error("SAVED_READBACK_LOAD_WORKER_BUDGET"); } }
      else if (metadata) { if (this.#savedReadbackMetadata >= CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.nativeMetadata) { throw new Error("SAVED_READBACK_METADATA_BUDGET"); } this.#savedReadbackMetadata += 1; }
      else if (cache) { if (this.#savedReadbackCache >= 36) { throw new Error("SAVED_READBACK_CACHE_BUDGET"); } this.#savedReadbackCache += 1; }
      else if (loadGuard) { if (this.#savedReadbackLoadingGuard) { throw new Error("SAVED_READBACK_LOAD_GUARD_CONSUMED"); } this.#savedReadbackLoadingGuard = true; }
      else if (guard) { if (this.#savedReadbackGuard >= 2) { throw new Error("SAVED_READBACK_GUARD_CONSUMED"); } this.#savedReadbackGuard += 1; }
      else if (preflight) { if (this.#savedReadbackPreflight !== 0) { throw new Error("SAVED_READBACK_PREFLIGHT_CONSUMED"); } this.#savedReadbackPreflight += 1; }
      else if (!startPage && !scene && !model && !parent && !registration && !opening && !early) { if (this.#savedReadbackDiscovery >= 24 + 3 * (8 + 1) + (this.#savedReadbackOpening ? 12 : 0) + (this.#savedReadbackModel ? 29 : 0) + (this.#savedReadbackSceneContext === null ? 0 : 8)) { throw new Error("SAVED_READBACK_DISCOVERY_BUDGET"); } this.#savedReadbackDiscovery += 1; }
    } else if ("savedReadbackCache" in command) { throw new Error("SAVED_READBACK_CACHE_PURPOSE"); }
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
    if (this.#schematicDisplayPurpose && !("schematicRelevanceModifyEchoCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-modify-echo" || "schematicRelevancePublicationReturnCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-publication-return" || "schematicRelevanceModifyReturnCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-modify-return" || "schematicRelevanceModifyCanvasCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-modify-canvas" || "schematicRelevanceModifyCmCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-modify-cm-control" || "schematicRelevanceModifyStructureCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-modify-structure" || "schematicRelevanceModifyContinuationCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-modify-control" || "schematicRelevanceModifyWorkerCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-modify-worker" || "schematicRelevancePublicationCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-publication" || "schematicRelevanceNotificationCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-notification" || "schematicRelevanceSdkGateCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-sdk-gate" || "schematicRelevancePendingCacheCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-pending-cache" || "schematicRelevanceUploadReturnCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-upload-return" || "schematicRelevanceNormalCommandUiCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-normal-command-ui" || "schematicRelevanceFileSaveUiCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-file-save-ui" || "schematicRelevanceRenderDelegateCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-render-delegate" || "schematicRelevanceStatusTabMutationCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-status-tab-mutation" || "schematicRelevanceStatusTabLookupCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-status-tab-lookup" || "schematicRelevanceStatusSubscriberCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-status-subscriber" || "schematicRelevanceStatusCloneCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-status-clone" || "schematicRelevanceStatusDeliveryCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-status-delivery" || "schematicRelevanceStatusBusCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-status-bus" || "schematicRelevanceHistoryStatusCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-history-status" || "schematicRelevanceUploadCmCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-upload-cm" || "schematicRelevanceUploadSerializeCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-upload-serialize" || "schematicRelevanceUploadModelCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-upload-model" || "schematicRelevanceUploadEntryCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-upload-entry" || "schematicRelevanceNoEchoCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-noecho" || "schematicRelevanceNormalRecordCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-normal-record" || "schematicRelevanceNormalDisposalCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-normal-disposal" || "schematicRelevanceNormalUpdateCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-normal-update" || "schematicRelevanceHistoryCommandCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-history-command" || "schematicRelevanceMonitorBatchCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-monitor-batch" || "schematicRelevanceRecordAstCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-record-ast" || "schematicRelevancePrimitiveCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-primitive" || "schematicRelevanceUiPublicationCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-ui-publication" || "schematicRelevancePostSyncCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "relevance-save-post-sync" || "schematicRelevanceDrainCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "relevance-save-drain" || "schematicRelevanceTailDeleteCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "relevance-save-tail-delete" || "schematicRelevanceTailExtraCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "relevance-save-tail-extra" || "schematicRelevanceTailCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "relevance-save-tail" || "schematicRelevanceObservedSourceCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "relevance-observed-source" || "schematicRelevanceLibraryRefreshCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-library" || "schematicRelevanceSaveLocalCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "relevance-save-local" || "schematicRelevanceSaveUploadCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "relevance-save-upload" || "schematicRelevanceLocalCacheCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "relevance-local-cache" || "schematicRelevanceSyncQuiesceCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-quiesce" || "schematicRelevanceClockCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-clock" || "schematicRelevanceRunGuardCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-run-guard" || "schematicRelevanceRunPrefixCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-run-prefix" || "schematicRelevanceModifyEntryCommand" in command && this.#schematicRelevanceDisplayPurpose && phase === "schematic-relevance-modify-entry" || "schematicWireEditPhase" in command && this.#schematicWireEditPurpose && phase === `schematic-display-${command.schematicWireEditPhase}` || "schematicRelevanceDisplayPhase" in command && this.#schematicRelevanceDisplayPurpose && phase === `schematic-display-${command.schematicRelevanceDisplayPhase}` || "schematicDisplayPhase" in command && !this.#schematicWireEditPurpose && !this.#schematicRelevanceDisplayPurpose && phase === `schematic-display-${command.schematicDisplayPhase}` || "schematicWorkerParentPhase" in command && ["schematic-parent-arm", "schematic-parent-running"].includes(phase) || "schematicWorkerCommand" in command && phase === "schematic-worker" || "schematicClockCommand" in command && phase === "schematic-clock" && !this.#schematicWireEditPurpose && !this.#schematicRelevanceDisplayPurpose || ("schematicActionGuardCommand" in command && phase === "schematic-action-guard" && !this.#schematicWireEditPurpose && !this.#schematicRelevanceDisplayPurpose || "schematicRelevanceActionGuardCommand" in command && phase === "schematic-action-guard" && this.#schematicRelevanceDisplayPurpose) || ("schematicActionCommand" in command && phase === "schematic-action" && !this.#schematicWireEditPurpose && !this.#schematicRelevanceDisplayPurpose || "schematicRelevanceActionCommand" in command && phase === "schematic-action" && this.#schematicRelevanceDisplayPurpose) || ("schematicAccessorCommand" in command && phase === "schematic-accessor" && !this.#schematicWireEditPurpose && !this.#schematicRelevanceDisplayPurpose || "schematicRelevanceAccessorCommand" in command && phase === "schematic-accessor" && this.#schematicRelevanceDisplayPurpose) || "structureTransportCommand" in command && phase === "structure-transport" || "periodicSyncCommand" in command && phase === "periodic-sync" || "initialSyncCommand" in command && phase === "initial-sync" || "initialCacheCommand" in command && phase === "initial-cache" || "producerObserveCommand" in command && phase === "producer-observe" || "producerGuardCommand" in command && phase === "producer-guard") && !CURRENT_SCHEMATIC_DISPLAY_DISCOVERY_METHODS.includes(command.method)) { throw new Error("SCHEMATIC_DISPLAY_DISCOVERY_ONLY"); }
    if (this.#failure !== null) { throw failureError(this.#failure); }
    const viaRetained = this.#schematicSavedPurpose && phase === "schematic-saved-open-project" && "schematicSavedOpening" in command || this.#schematicRelevanceDisplayPurpose && phase === "schematic-display-modify" && "schematicRelevanceModifyGeneration" in command || this.#inversePurpose && phase === "inverse-project-open" || this.#savedReadbackPurpose && phase === "saved-readback-open-project" || this.#viaPurpose && ["via-sdk-save", "project-open-project", "pcb-open-document"].includes(phase) || this.#schematicDisplayPurpose && ["schematic-display-navigate", "schematic-display-save"].includes(phase);
    if (this.#viaRetainedPending !== null && (viaRetained || !(this.#inversePurpose && (phase === "inverse-delete-encoder" || phase === "inverse-delete-bindings" || phase === "inverse-library-refresh" || phase === "inverse-model-step" || phase === "inverse-initial-sync" || phase === "inverse-initial-cache" || phase === "inverse-startup-queue" || phase === "inverse-timer" || phase === "inverse-worker" || phase === "inverse-construction" || phase === "inverse-producer-arm" || phase === "inverse-cold" || phase==="inverse-cold-step" || phase==="inverse-startup-callback" || phase==="inverse-condition-source") || this.#viaPurpose && ["via-observed-source", "via-save-drain", "via-post-sync", "via-tail-delete", "via-tail-observe", "via-tail-extra", "via-upload-request", "sync-quiesce", "via-local", "via-clock", "via-worker", "via-parent-running", "structure-transport", "periodic-sync", "initial-sync", "initial-cache", "producer-observe", "producer-guard"].includes(phase) || this.#schematicRelevanceDisplayPurpose && ((phase === "schematic-relevance-modify-echo" && "schematicRelevanceModifyEchoCommand" in command) || (phase === "schematic-relevance-publication-return" && "schematicRelevancePublicationReturnCommand" in command) || (phase === "schematic-relevance-modify-return" && "schematicRelevanceModifyReturnCommand" in command) || (phase === "schematic-relevance-modify-canvas" && "schematicRelevanceModifyCanvasCommand" in command) || (phase === "schematic-relevance-modify-cm-control" && "schematicRelevanceModifyCmCommand" in command) || (phase === "schematic-relevance-modify-structure" && "schematicRelevanceModifyStructureCommand" in command) || (phase === "schematic-relevance-modify-control" && "schematicRelevanceModifyContinuationCommand" in command) || (phase === "schematic-relevance-modify-worker" && "schematicRelevanceModifyWorkerCommand" in command) || (phase === "schematic-relevance-publication" && "schematicRelevancePublicationCommand" in command) || (phase === "schematic-relevance-status-bus" && "schematicRelevanceStatusBusCommand" in command) || (phase === "schematic-relevance-status-delivery" && "schematicRelevanceStatusDeliveryCommand" in command) || (phase === "schematic-relevance-notification" && "schematicRelevanceNotificationCommand" in command) || (phase === "schematic-relevance-sdk-gate" && "schematicRelevanceSdkGateCommand" in command) || (phase === "schematic-relevance-normal-command-ui" && "schematicRelevanceNormalCommandUiCommand" in command) || (phase === "schematic-relevance-file-save-ui" && "schematicRelevanceFileSaveUiCommand" in command) || (phase === "schematic-relevance-render-delegate" && "schematicRelevanceRenderDelegateCommand" in command) || (phase === "schematic-relevance-status-tab-mutation" && "schematicRelevanceStatusTabMutationCommand" in command) || (phase === "schematic-relevance-status-tab-lookup" && "schematicRelevanceStatusTabLookupCommand" in command) || (phase === "schematic-relevance-status-subscriber" && "schematicRelevanceStatusSubscriberCommand" in command) || (phase === "schematic-relevance-status-clone" && "schematicRelevanceStatusCloneCommand" in command)) || this.#schematicDisplayPurpose && ["schematic-relevance-history-status", "schematic-relevance-upload-return", "schematic-relevance-pending-cache", "schematic-relevance-upload-cm", "schematic-relevance-upload-serialize", "schematic-relevance-upload-model", "schematic-relevance-upload-entry", "schematic-relevance-noecho", "schematic-relevance-normal-update", "schematic-relevance-normal-disposal", "schematic-relevance-normal-record", "schematic-relevance-history-command", "schematic-relevance-monitor-batch", "schematic-relevance-record-ast", "schematic-relevance-primitive", "schematic-relevance-ui-publication", "relevance-save-tail", "relevance-save-tail-extra", "relevance-save-tail-delete", "relevance-save-drain", "relevance-save-post-sync", "relevance-observed-source", "relevance-save-local", "relevance-save-upload", "relevance-local-cache", "schematic-relevance-library", "schematic-relevance-quiesce", "schematic-relevance-clock", "schematic-relevance-modify-entry", "schematic-relevance-run-prefix", "schematic-relevance-run-guard", "schematic-worker", "schematic-clock", "schematic-parent-running", "structure-transport", "periodic-sync", "initial-sync", "initial-cache", "producer-observe", "producer-guard"].includes(phase) || this.#savedReadbackPurpose && phase === "saved-readback-worker" || this.#schematicSavedPurpose && phase === "schematic-saved-cold" && "schematicSavedCold" in command || phase === "discovery" && command.method === "Debugger.getScriptSource"))) { throw new Error("PCB_VIA_RETAINED_PENDING_SCOPE"); }
    if (this.#inversePublicDeletePending !== null && !(this.#inversePurpose && phase === "inverse-delete-send" && "inverseDeleteSend" in command || this.#inversePurpose && phase === "inverse-delete-callback" && "inverseDeleteCallback" in command || this.#inversePurpose && phase === "inverse-delete-manager" && "inverseDeleteManager" in command || this.#inversePurpose && phase === "inverse-delete-collateral" && "inverseDeleteCollateral" in command || this.#inversePurpose && phase === "inverse-delete-prefix" && "inverseDeletePrefix" in command || this.#inversePurpose && phase === "inverse-reference-progress" && "inverseReferenceProgress" in command || this.#inversePurpose && phase === "inverse-reference-result" && "inverseReferenceResult" in command || this.#inversePurpose && phase === "inverse-reference-send" && "inverseReferenceSend" in command || this.#inversePurpose && phase === "inverse-reference-callback" && "inverseReferenceCallback" in command || this.#inversePurpose && phase === "inverse-reference-dispatch" && "inverseReferenceDispatch" in command || this.#inversePurpose && phase === "inverse-reference-worker" && "inverseReferenceWorker" in command || this.#inversePurpose && phase === "inverse-reference-ui" && "inverseReferenceUi" in command || this.#inversePurpose && phase === "inverse-reference-entry" && "inverseReferenceEntry" in command || this.#inversePurpose && phase === "inverse-get-result" && "inverseGetResult" in command || this.#inversePurpose && phase === "inverse-get-send" && "inverseGetSend" in command || this.#inversePurpose && phase === "inverse-get-callback" && "inverseGetCallback" in command || this.#inversePurpose && phase === "inverse-get-completion" && "inverseGetCompletion" in command || this.#inversePurpose && phase === "inverse-get-native" && "inverseGetNative" in command || this.#inversePurpose && phase === "inverse-get-manager" && "inverseGetManager" in command || this.#inversePurpose && phase === "inverse-get-forwarding" && "inverseGetForwarding" in command || this.#inversePurpose && phase === "inverse-get-rpc-entry" && "inverseGetRpcEntry" in command || this.#inversePurpose && phase === "inverse-get-worker" && "inverseGetWorker" in command || this.#inversePurpose && phase === "inverse-get-intrinsics" && "inverseGetIntrinsics" in command || this.#inversePurpose && phase === "inverse-native-delivery" && "inverseNativeDelivery" in command || this.#inversePurpose && phase === "inverse-lookup-preentry" && "inverseLookupPreentry" in command || this.#inversePurpose && phase === "inverse-ui-own-data" && "inverseUiOwnData" in command || this.#inversePurpose && phase === "inverse-public-preferences" && "inversePublicPreferences" in command || this.#inversePurpose && phase === "inverse-public-call" && "inversePublicCall" in command && command.phase !== "inverse-public-call-sdk" || this.#inversePurpose && ["inverse-delete-entry", "inverse-delete-job", "inverse-clock-worker", "inverse-worker", "inverse-condition-source"].includes(phase))) { throw new Error("FOOTPRINT_INVERSE_PUBLIC_CALL_PENDING_SCOPE"); }
    if (this.#inverseNativeGetLookupPending !== null && !(this.#inversePurpose && phase === "inverse-native-get-lookup" && "inverseNativeGetLookup" in command)) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_LOOKUP_PENDING"); }
    if (this.#inverseNativeGetTaskPending !== null && !(this.#inversePurpose && phase === "inverse-native-get-task-manager" && "inverseNativeGetTaskManager" in command || this.#inversePurpose && phase === "inverse-native-get-task-callback" && "inverseNativeGetTaskCallback" in command || this.#inversePurpose && phase === "inverse-native-get-task-sender" && "inverseNativeGetTaskSender" in command || this.#inversePurpose && phase === "inverse-native-get-task-intrinsics" && "inverseNativeGetTaskIntrinsics" in command || this.#inversePurpose && phase === "inverse-native-get-task-dependencies" && "inverseNativeGetTaskDependencies" in command)) { throw new Error("FOOTPRINT_INVERSE_NATIVE_GET_TASK_PENDING"); }
    if (this.#pending !== null) { throw new Error("PCB_DIAGNOSTIC_PIPE_REQUEST_PENDING"); }
    let limit = this.#stringPurpose ? CURRENT_PCB_STRING_PRECREATE_REQUEST_LIMIT : DIAGNOSTIC_REQUEST_LIMIT;
    if (this.#schematicSavedPurpose) { limit = this.#schematicSavedParent ? SCH_SAVED_PROFILE.renderer.activeCache : SCH_SAVED_PROFILE.renderer.total; if (this.#schematicSavedBackup) { limit = this.#schematicSavedGuards.has("loading") ? SCH_SAVED_PROFILE.renderer.activeLoading : SCH_SAVED_PROFILE.renderer.activeInvalidation; } if (this.#schematicSavedRegistrationAttempted) { limit = SCH_SAVED_PROFILE.renderer.activeRegistration; } if (this.#schematicSavedOpening) { limit = SCH_SAVED_PROFILE.renderer.activeOpening; } if (this.#schematicSavedColdPair !== null) { limit = this.#schematicSavedColdObservation ? SCH_SAVED_PROFILE.renderer.activeCold : SCH_SAVED_PROFILE.renderer.activeBootstrap; } if (this.#schematicSavedScene) { limit = SCH_SAVED_PROFILE.renderer.activeScene; } }
    if (this.#heldCacheDiagnosticPurpose) { limit = HELD_DIAGNOSTIC.requestLimit; }
    if (this.#inversePurpose) { limit = CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE.renderer.total; }
    if (this.#spatialPurpose) { limit = CURRENT_PCB_SPATIAL_PROFILE.requestLimit; }
    if (this.#componentSpatialPurpose) { limit = CURRENT_PCB_COMPONENT_SPATIAL_PROFILE.requestLimit; }
    if (this.#savedReadbackPurpose) {
      if (this.#savedReadbackSceneContext !== null) { limit = CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.activeScene; }
      else if (this.#savedReadbackModel) { limit = CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.activePcbModel; }
      else if (this.#savedReadbackObservation) { limit = CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.activeLoadObservation; }
      else if (this.#savedReadbackOpening && this.#savedReadbackLoadPair === null) { limit = CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.activeOpening; }
      else if (this.#savedReadbackLoadPair === null) { limit = this.#savedReadbackRegistrationAttempted ? CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.activeRegistration : CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.activeReadOnly; }
      else { limit = CURRENT_PCB_VIA_SAVED_READBACK_PROFILE.renderer.activeLoadBootstrap; }
    }
    if (this.#viaPurpose) { limit = CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE.renderer.total; }
    if (this.#schematicWireEditPurpose) { limit = CURRENT_SCHEMATIC_WIRE_EDIT_NATIVE_PROFILE.renderer.total; }
    else if (this.#schematicDisplayPurpose) { limit = this.#schematicRelevanceDisplayPurpose ? CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PROFILE.renderer.total : CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE.renderer.total; }
    const heldCleanup = heldCache && command.method === "Runtime.releaseObjectGroup";
    if (this.#nextId > limit || this.#heldCacheDiagnosticPurpose && (heldCleanup ? this.#heldCacheCleanup >= HELD_DIAGNOSTIC.cleanupRequestLimit :
      this.#heldCacheNormal >= HELD_DIAGNOSTIC.normalRequestLimit)) {
      this.#fail("budget"); throw failureError("budget");
    }
    if(this.#viaPurpose&&"sessionId"in command&&command.sessionId===this.#viaWorkerSession&&this.#viaObservedProgram!==null){if(command.method==="Runtime.callFunctionOn"){let declaration:unknown=null;if("functionDeclaration"in command.params){declaration=command.params.functionDeclaration;}else if(phase==="via-post-sync"&&"phase"in command&&command.phase==="via-post-sync-replay"){declaration=CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM;}if(typeof declaration!=="string"){throw new TypeError("VIA_OBSERVED_PROGRAM_FIXED_DECLARATION");}this.#viaObservedProgram("function",declaration);}else if(command.method==="Debugger.evaluateOnCallFrame"){this.#viaObservedProgram("expression",command.params.expression);}else if(command.method==="Debugger.setBreakpoint"&&"condition"in command.params&&typeof command.params.condition==="string"){this.#viaObservedProgram("condition",command.params.condition);}}
    let relevanceReceipt=false;
    if(this.#schematicRelevanceDisplayPurpose&&"sessionId" in command&&command.sessionId===this.#schematicWorkerSession&&phase!=="schematic-relevance-library"&&this.#relevanceSubmitted!==null&&(command.method==="Runtime.callFunctionOn"||command.method==="Debugger.evaluateOnCallFrame"||command.method==="Runtime.evaluate"&&"schematicRelevanceModifyWorkerCommand"in command&&command.phase==="modify-worker-literal"||["Debugger.setBreakpoint","Debugger.setBreakpointOnFunctionCall"].some(method=>method===command.method)&&"condition"in command.params)){relevanceReceipt=this.#relevanceSubmitted(command);}
    const id = this.#nextId; this.#nextId += 1;
    if (this.#heldCacheDiagnosticPurpose) { if (heldCleanup) { this.#heldCacheCleanup += 1; } else { this.#heldCacheNormal += 1; } }
    this.#lastRequest = Object.freeze({ id,
      method: REQUEST_METHODS.find(method => method === command.method) ?? "unknown",
      phase: REQUEST_PHASES.find(value => value === phase) ?? "unknown" });
    const deferred = Promise.withResolvers<Reply>();
    let deadline = DEADLINE_MS;
    if (command.method === "Debugger.getScriptSource") { deadline = 30_000; }
    else if (command.method === "Runtime.callFunctionOn" && "awaitPromise" in command.params && command.params.awaitPromise === true) { deadline = 60_000; }
    if (phase === "inverse-public-call" && "inversePublicCall" in command && command.phase === "inverse-public-call-sdk") { deadline = 60_000; }
    if (phase === "inverse-native-get-lookup" && "inverseNativeGetLookup" in command && command.phase === "inverse-native-get-lookup-invoke") { deadline = 60_000; }
    if (phase === "inverse-native-get-task-sender" && "inverseNativeGetTaskSender" in command && command.phase === "inverse-native-get-task-sender-invoke") { deadline = 60_000; }
    if (heldCache) { deadline = CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS.requestMilliseconds; }
    const pending: Pending = { id, resolve: deferred.resolve, reject: deferred.reject,
      timer: setTimeout(() => { this.#fail("deadline"); }, deadline), written: false, reply: null,
      sessionId: "sessionId" in command ? command.sessionId : null, source: command.method === "Debugger.getScriptSource",
      common: ["common-packet-read", "common-packet-result", "common-assets", "common-metadata"].includes(phase), heldCache };
    if (this.#inversePurpose && phase === "inverse-register") { if (this.#inverseOriginalPending !== null) { throw new Error("FOOTPRINT_INVERSE_ORIGINAL_DISPATCH_CONSUMED"); } this.#inverseOriginalPending = pending; this.#inverseOriginalPromise = deferred.promise; }
    if (this.#inversePurpose && phase === "inverse-public-call" && "inversePublicCall" in command && command.phase === "inverse-public-call-sdk") { this.#inversePublicDeletePending = pending; this.#inversePublicDeleteOriginalSlot = pending; }
    else if (this.#inversePurpose && phase === "inverse-native-get-lookup" && "inverseNativeGetLookup" in command && command.phase === "inverse-native-get-lookup-invoke") { this.#inverseNativeGetLookupPending = pending; this.#inverseNativeGetLookupOriginalSlot = pending; }
    else if (this.#inversePurpose && phase === "inverse-native-get-task-sender" && "inverseNativeGetTaskSender" in command && command.phase === "inverse-native-get-task-sender-invoke") { this.#inverseNativeGetTaskPending = pending; this.#inverseNativeGetTaskOriginalSlot = pending; }
    else if (viaRetained) { this.#viaRetainedPending = pending; } else { this.#pending = pending; }
    // Reserve before write, including synchronous throw and synchronous peer
    if (this.#schematicRelevanceDisplayPurpose && phase === "schematic-display-navigate") {
      if (retainSavedRegistration === undefined || !this.#schematicDisplayRegistrationAttempted || this.#schematicDisplayRegistrationPromise !== null || !("schematicRelevanceDisplayPhase" in command) || command.schematicRelevanceDisplayPhase !== "navigate") { this.#fail("output"); return deferred.promise; }
      this.#schematicDisplayRegistrationPromise = deferred.promise; this.#schematicDisplayRegistrationSlot = pending;
      try { retainSavedRegistration(deferred.promise); } catch { this.#fail("output"); return deferred.promise; }
    } else if (phase === "schematic-saved-register") {
      if (!this.#schematicSavedPurpose || retainSavedRegistration === undefined || this.#schematicSavedRegistrationPromise !== null) { this.#fail("output"); return deferred.promise; }
      this.#schematicSavedRegistrationPromise = deferred.promise; this.#schematicSavedRegistrationSlot = pending;
      try { retainSavedRegistration(deferred.promise); } catch { this.#fail("output"); return deferred.promise; }
    } else if (phase === "saved-readback-register") {
      if (!this.#savedReadbackPurpose || retainSavedRegistration === undefined || this.#savedReadbackRegistrationPromise !== null) { this.#fail("output"); return deferred.promise; }
      this.#savedReadbackRegistrationPromise = deferred.promise; this.#savedReadbackRegistrationSlot = pending;
      try { retainSavedRegistration(deferred.promise); } catch { this.#fail("output"); return deferred.promise; }
    } else if (retainSavedRegistration !== undefined) { this.#fail("output"); return deferred.promise; }
    // Reply. A callback error still defeats an earlier received response.
    try {
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Writable completion is callback-based; an ACK does not replace the write callback.
      this.#output.write(Buffer.from(`${JSON.stringify(command)}\0`), (error): void => {
        if (error !== null && error !== undefined) { this.#fail("output"); }
        else if ((this.#pending === pending || this.#viaRetainedPending === pending || this.#inversePublicDeletePending === pending || this.#inverseNativeGetLookupPending === pending || this.#inverseNativeGetTaskPending === pending) && this.#failure === null) { pending.written = true; if (this.#inversePublicDeletePending === pending) {
          // oxlint-disable-next-line unicorn/no-useless-undefined -- The original PromiseWithResolvers<undefined> requires its acknowledgement argument.
          this.#inversePublicDeleteWritten?.resolve(undefined);
         }
         if (this.#inverseNativeGetLookupPending === pending) {
          // oxlint-disable-next-line unicorn/no-useless-undefined -- The retained acknowledgement has the same exact undefined payload.
          this.#inverseNativeGetLookupWritten?.resolve(undefined);
         }
         if (this.#inverseNativeGetTaskPending === pending) {
          // oxlint-disable-next-line unicorn/no-useless-undefined -- The original write acknowledgement has exactly an undefined payload.
          this.#inverseNativeGetTaskWritten?.resolve(undefined);
         } this.#complete(); }
      });
    } catch { this.#fail("output"); }
    const raw=await deferred.promise;if(relevanceReceipt){const receipt=this.#relevanceReceipt;if(receipt===null){this.#fail("output");throw failureError("output");}try{await receipt(command,raw);}catch(error){this.#fail("output");throw error;}}return raw;
  }

  /** Quarantine the transport once and reject every original retained slot
   * and write acknowledgement without replacing the first failure. */
  #fail(code: Failure, reason: FailureReason = code, rejectedEvent: EventKind | null = null): void {
    // First failure only. Later cleanup and stream noise cannot replace it.
    // Fixed method/phase/event labels carry no received params or private text.
    this.#failureObservation ??= Object.freeze({
      schema: "easyeda-pro-control.pcb-diagnostic-pipe-failure.v1", code, reason, request: this.#lastRequest,
      requestPending: this.#pending !== null || this.#viaRetainedPending !== null || this.#inversePublicDeletePending !== null || this.#inverseNativeGetLookupPending !== null || this.#inverseNativeGetTaskPending !== null, eventKind: rejectedEvent,
      executionAuthorized: false, dispatchAbsenceVerified: false,
    });
    this.#failure ??= code; this.#inversePublicDeleteWritten?.reject(failureError(this.#failure)); this.#inverseNativeGetLookupWritten?.reject(failureError(this.#failure)); this.#inverseNativeGetTaskWritten?.reject(failureError(this.#failure));
    this.#used = 0;
    const pending = this.#pending; const savePending = this.#viaRetainedPending; const deletePending = this.#inversePublicDeletePending; const nativeGetPending = this.#inverseNativeGetLookupPending; const nativeGetTaskPending = this.#inverseNativeGetTaskPending;
    this.#pending = null; this.#viaRetainedPending = null; this.#inversePublicDeletePending = null; this.#inverseNativeGetLookupPending = null; this.#inverseNativeGetTaskPending = null;
    for (const original of [pending, savePending, deletePending, nativeGetPending, nativeGetTaskPending]) { if (original !== null) { clearTimeout(original.timer); original.reject(failureError(this.#failure)); } }
  }

  /** Settle only the same pending slot after its successful original write
   * and complete validated reply, including each separate retained call. */
  #complete(): void {
    for (const pending of [this.#pending, this.#viaRetainedPending, this.#inversePublicDeletePending, this.#inverseNativeGetLookupPending, this.#inverseNativeGetTaskPending]) {
      if (this.#failure === null && pending !== null && pending.written && pending.reply !== null && this.#used === 0) {
        if (this.#heldCacheDiagnosticPurpose && pending.source && typeof pending.reply["scriptSource"] === "string") { this.#heldCacheSourceSeen = true; }
        if (this.#inverseOriginalPending === pending) { this.#inverseOriginalReply = freezeDeep(pending.reply); this.#inverseOriginalSettled = true; }
        if (this.#pending === pending) { this.#pending = null; } else if (this.#viaRetainedPending === pending) { this.#viaRetainedPending = null; } else if (this.#inversePublicDeletePending === pending) { this.#inversePublicDeletePending = null; } else if (this.#inverseNativeGetLookupPending === pending) { this.#inverseNativeGetLookupPending = null; } else { this.#inverseNativeGetTaskPending = null; }
        clearTimeout(pending.timer); pending.resolve(pending.reply);
      }
    }
  }

  /** Route one bounded original byte frame to its exact pending ID/session.
   * Unsolicited, duplicate or malformed replies permanently fail the pipe. */
  #frame(bytes: Buffer): void {
    if (bytes.length === 0) { this.#fail("reply", "empty-frame"); return; }
    let decoded: unknown;
    try { decoded = decodeCurrentPcbDiagnosticJson(bytes); }
    catch { this.#fail("framing"); return; }
    if (!record(decoded)) { this.#fail("reply", "nonobject-frame"); return; }
    if (Object.hasOwn(decoded, "method")) { this.#receiveEvent(decoded, bytes.length); return; }
    let pending = this.#pending; if (this.#inverseNativeGetTaskPending?.id === decoded["id"]) { pending = this.#inverseNativeGetTaskPending; } else if (this.#inverseNativeGetLookupPending?.id === decoded["id"]) { pending = this.#inverseNativeGetLookupPending; } else if (this.#inversePublicDeletePending?.id === decoded["id"]) { pending = this.#inversePublicDeletePending; } else if (this.#viaRetainedPending?.id === decoded["id"]) { pending = this.#viaRetainedPending; }
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
    if (this.#event === null && this.#savedReadbackEarlyActorEvent === null && this.#schematicSavedEarlyEvent === null && this.#inverseActorEvent === null || bytes > MAX_FRAME_BYTES || this.#eventCount > TRANSPORT.maximumEventCount || this.#eventBytes > TRANSPORT.maximumEventBytes) {
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
      if (this.#schematicSavedEarlyEvent !== null && method === "Target.attachedToTarget") {
        if (this.#schematicSavedEarlyEvent(event) === "held") { return; }
        if (this.#schematicSavedColdEvent === null) { throw new Error("SCHEMATIC_SAVED_PROJECT_NOT_ADMITTED"); }
      }
      if (this.#schematicSavedPurpose && this.#schematicSavedColdEvent !== null) {
        if (method === "Target.attachedToTarget" && (sessionId === undefined || sessionId === this.#sessionId)) {
          const childSession = params["sessionId"], info = params["targetInfo"];
          if (!record(info) || !diagnosticToken(info["targetId"]) || !diagnosticToken(childSession) || childSession === this.#sessionId || this.#workerSessions.has(childSession) || this.#workerSessions.size >= 2 || params["waitingForDebugger"] !== true) { this.#fail("reply", "worker-attachment", eventKind(method)); return; }
          this.#workerSessions.set(childSession, info["targetId"]); this.#schematicSavedColdEvent(event); return;
        }
        if (typeof sessionId === "string" && this.#workerSessions.has(sessionId)) { this.#schematicSavedColdEvent(event); return; }
      }
      if (this.#inverseActorEvent !== null && method === "Target.attachedToTarget") {
        if (this.#inverseActorEvent(event) === "held") { return; }
        if (this.#inverseWorkerEvent === null) { this.#fail("reply", "worker-handler", eventKind(method)); return; }
      }
      if (this.#inversePurpose && this.#inverseWorkerEvent !== null) {
        if (method === "Target.attachedToTarget" && (sessionId === undefined || sessionId === this.#sessionId)) {
          const childSession = params["sessionId"], info = params["targetInfo"];
          if (!record(info) || !diagnosticToken(info["targetId"]) || !diagnosticToken(childSession) || childSession === this.#sessionId || this.#workerSessions.has(childSession) || this.#workerSessions.size >= 2 || params["waitingForDebugger"] !== true) { this.#fail("reply", "worker-attachment", eventKind(method)); return; }
          this.#workerSessions.set(childSession, info["targetId"]); this.#inverseWorkerEvent(event); return;
        }
        if (typeof sessionId === "string" && this.#workerSessions.has(sessionId)) { this.#inverseWorkerEvent(event); return; }
      }
      if (this.#savedReadbackEarlyActorEvent !== null && method === "Target.attachedToTarget") {
        if (this.#savedReadbackEarlyActorEvent(event) === "held") { return; }
        if (this.#savedReadbackLoadEvent === null) { this.#fail("reply", "worker-handler", eventKind(method)); return; }
      }
      if (this.#savedReadbackPurpose && this.#savedReadbackLoadEvent !== null) {
        if (method === "Target.attachedToTarget" && (sessionId === undefined || sessionId === this.#sessionId)) {
          const childSession = params["sessionId"], info = params["targetInfo"];
          if (!record(info) || !diagnosticToken(info["targetId"]) || !diagnosticToken(childSession) || childSession === this.#sessionId || this.#workerSessions.has(childSession) || this.#workerSessions.size >= 2 || params["waitingForDebugger"] !== true) { this.#fail("reply", "worker-attachment", eventKind(method)); return; }
          this.#workerSessions.set(childSession, info["targetId"]); this.#savedReadbackLoadEvent(event); return;
        }
        if (typeof sessionId === "string" && this.#workerSessions.has(sessionId)) { this.#savedReadbackLoadEvent(event); return; }
      }
      if (this.#savedReadbackPurpose && this.#savedReadbackActors && sessionId === undefined && method === "Target.attachedToTarget") {
        this.#fail("reply", "worker-attachment", eventKind(method)); return;
      }
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
      } else { if (this.#event === null) { throw new Error("SAVED_READBACK_EARLY_ACTOR_EVENT"); } this.#event(event); }
    }
    catch { this.#fail("reply", "event-callback", eventKind(method)); }
  }

  readonly #data = (chunk: unknown): void => {
    if (this.#failure !== null || this.#handedOff) { return; }
    if (this.#pending === null && this.#event === null && this.#savedReadbackEarlyActorEvent === null && this.#schematicSavedEarlyEvent === null && this.#inverseActorEvent === null) { this.#fail("reply", "unsolicited-data"); return; }
    if (!Buffer.isBuffer(chunk) || chunk.length === 0 || chunk.length > MAX_CHUNK_BYTES ||
      this.#receivedBytes + chunk.length > (this.#event === null && this.#savedReadbackEarlyActorEvent === null && this.#schematicSavedEarlyEvent === null && this.#inverseActorEvent === null ? 8 * MAX_FRAME_BYTES : DIAGNOSTIC_SESSION_BYTES)) { this.#fail("framing"); return; }
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
    if (this.#event === null && this.#savedReadbackEarlyActorEvent === null && this.#schematicSavedEarlyEvent === null && this.#inverseActorEvent === null && this.#pending?.reply !== null && this.#used > 0) { this.#fail("reply", "trailing-reply-data"); }
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
/** Fresh saved-checkpoint pipe. Cache/opening phases require their own later
 * original grants; this initial birth admits only the fixed UI discovery. */
const inversePipes = new WeakSet<object>();
/** Distinct inverse pipe; no saved/cache/writer purpose bit is inherited. */
export class CurrentFootprintInversePipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable) { super(input, output, "footprint-inverse209"); inversePipes.add(this); }
  public preflightInverseProject(context: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> { return this.observeInversePreflight(context, target); }
  public dispatchInverseRegistration(context: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> { return this.registerInverseProject(context, target); }
  public requireOriginalInverseProjectOpeningPending(target: CurrentDisposableOpenSealedTarget): void { this.requireInversePending(target); }
  public requireOriginalInverseNoDispatchResult(target: CurrentDisposableOpenSealedTarget): void { this.requireInverseNoDispatch(target); }
}
const inversePipeCoreDescriptors = Object.getOwnPropertyDescriptors(CurrentPcbFixedPipeCore.prototype), inversePipeDescriptors = Object.getOwnPropertyDescriptors(CurrentFootprintInversePipe.prototype);
export function assertOriginalCurrentFootprintInversePipe(pipe: CurrentFootprintInversePipe): void {
  if (pipe === null || typeof pipe !== "object" || types.isProxy(pipe) || Object.getPrototypeOf(pipe) !== CurrentFootprintInversePipe.prototype || !inversePipes.has(pipe)) { throw new Error("FOOTPRINT_INVERSE_ORIGINAL_PIPE"); }
  for (const [prototype, original] of [[CurrentFootprintInversePipe.prototype, inversePipeDescriptors], [CurrentPcbFixedPipeCore.prototype, inversePipeCoreDescriptors]] as const) {
    const observed = Object.getOwnPropertyDescriptors(prototype);
    if (Reflect.ownKeys(observed).length !== Reflect.ownKeys(original).length || Object.entries(original).some(([name, descriptor]) => {
      const current = observed[name]; return current === undefined || current.value !== descriptor.value || current.get !== descriptor.get || current.set !== descriptor.set || current.writable !== descriptor.writable || current.configurable !== descriptor.configurable || current.enumerable !== descriptor.enumerable;
    })) { throw new Error("FOOTPRINT_INVERSE_PIPE_METHOD_CHANGED"); }
  }
}
export class CurrentSchematicRelevanceSavedReadbackPipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable) { super(input, output, "schematic-relevance-saved-readback209"); }
  public armSchematicSavedCacheParent(): Promise<Reply> { return this.armSchematicSavedCacheParentCommand(); }
  public observeSchematicSavedPreflight(context: string, target: CurrentDisposableOpenSealedTarget): Promise<Reply> { return this.observeSchematicSavedPreflightCommand(context, target); }
  public bindSchematicSavedScene(): void { this.bindSchematicSavedSceneCommand(); }
  public observeSchematicSavedScene(command: CurrentSchematicRelevanceSavedSceneCommand): Promise<Reply> { return this.observeSchematicSavedSceneCommand(command); }
  public bindSchematicSavedOpening(): void { this.bindSchematicSavedOpeningCommand(); }
  public observeSchematicSavedOpening(context: string, target: CurrentSchematicRelevanceSavedRegistrationTarget, phase: CurrentSchematicRelevanceSavedOpeningPhase, windowId: string): Promise<Reply> { return this.observeSchematicSavedOpeningCommand(context, target, phase, windowId); }
  public requireOriginalSchematicSavedOpeningPending(): void { this.requireSchematicSavedOpeningPendingCommand(); }
  public registerSchematicSavedProject(context: string, target: CurrentSchematicRelevanceSavedRegistrationTarget, retain: (pending: Promise<Reply>) => void): Promise<Reply> { return this.registerSchematicSavedCommand(context, target, retain); }
  public requireOriginalSchematicSavedRegistrationPending(pending: Promise<unknown>): void { this.requireSchematicSavedRegistrationPendingCommand(pending); }
  public requireOriginalSchematicSavedRegistrationNoDispatch(pending: Promise<unknown>, target: CurrentSchematicRelevanceSavedRegistrationTarget): void { this.requireSchematicSavedRegistrationNoDispatchCommand(pending, target); }
  public retainSchematicSavedColdEvents(event: (value: DiagnosticEvent) => void): void { this.retainSchematicSavedColdCommand(event); }
  public bindSchematicSavedColdWorker(pair: CurrentPcbViaSavedLoadWorkerPair): void { this.bindSchematicSavedColdCommand(pair); }
  public bindSchematicSavedColdObservation(): void { this.bindSchematicSavedColdObservationCommand(); }
  public observeSchematicSavedCold(command: CurrentPcbViaSavedLoadWorkerCommand): Promise<Reply> { return this.observeSchematicSavedColdCommand(command); }
  public enrollSchematicSavedBackup(): void { this.enrollSchematicSavedBackupCommand(); }
  public observeSchematicSavedGuard(context: string, target: CurrentDisposableOpenSealedTarget, stage: "before-delete-0" | "before-delete-1" | "loading"): Promise<Reply> { return this.observeSchematicSavedGuardCommand(context, target, stage); }
  public observeSchematicSavedCache(plan: CurrentPcbViaSavedCachePlan): Promise<Reply> { return this.observeSchematicSavedCacheCommand(plan); }
  public observeSchematicSavedMetadata(plan: CurrentPcbViaSavedCacheMetadataPlan): Promise<Reply> { return this.observeSchematicSavedMetadataCommand(plan); }
  public retainSchematicSavedEarlyActors(event: (value: DiagnosticEvent) => "held" | "project"): void { this.retainSchematicSavedEarlyActorsCommand(event); }
  public observeSchematicSavedEarlyActors(stage: CurrentSchematicRelevanceSavedEarlyStage): Promise<Reply> { return this.observeSchematicSavedEarlyActorsCommand(stage); }
}
export class CurrentPcbViaSavedReadbackPipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable) { super(input, output, "pcb-via-saved-readback209"); }
}

export class CurrentPcbComponentSpatialPipe extends CurrentPcbFixedPipeCore {
  public constructor(input: Readable, output: Writable) { super(input, output, "pcb-component-spatial209"); }
  public assertSpatialCapacity(): void { this.assertSpatialWorkflowCapacity(); }
  public bindSpatial(binding: CurrentPcbSpatialBinding): void { this.bindSpatialCommand(binding); }
  public observeComponentSpatial(command: CurrentPcbSpatialCaptureCommand): Promise<Reply> { return this.observeComponentSpatialCommand(command); }
}
/** Distinct original schematic navigation/source stages. The separate native
 * worker and writer grammars require their original source issuance. */
class CurrentSchematicDisplayFamilyPipe extends CurrentPcbFixedPipeCore {
  protected constructor(input: Readable, output: Writable, purpose: "schematic-display-write209" | "schematic-relevance-display-write209" | "schematic-wire-edit209") { super(input, output, purpose); }
  public enableSchematicDisplayWorkerDiscovery(event: (value: DiagnosticEvent) => void): Promise<Reply> { return this.enableSchematicDisplayWorkerDiscoveryCommand(event); }
  public configureSchematicDisplayWorkerRunning(): Promise<Reply> { return this.configureSchematicDisplayWorkerRunningCommand(); }
  public bindSchematicDisplayWorker(sessionId: string, targetId: string): void { this.bindSchematicDisplayWorkerCommand(sessionId, targetId); }
  public observeSchematicDisplayWorker(command: CurrentSchematicDisplayWorkerCommand): Promise<Reply> { return this.observeSchematicDisplayWorkerCommand(command); }
  public generateSchematicRelevanceDisplaySave(holder: string, target: unknown, operation: unknown): Promise<Reply> { return this.generateSchematicRelevanceDisplaySaveCommand(holder, target, operation); }
  public requireOriginalSchematicRelevanceDisplaySavePending(request: Promise<Reply>): void { this.requireOriginalSchematicRelevanceDisplaySavePendingCommand(request); }
  public generateSchematicRelevanceDisplayModify(holder: string, target: unknown, operation: unknown): Promise<Reply> { return this.generateSchematicRelevanceDisplayModifyCommand(holder, target, operation); }
  public requireOriginalSchematicRelevanceDisplayModifyPending(request: Promise<Reply>): void { this.requireOriginalSchematicRelevanceDisplayModifyPendingCommand(request); }
  public observeSchematicRelevanceRunGuard(step: CurrentSchematicRelevanceRunGuardStep): Promise<Reply> { return this.observeSchematicRelevanceRunGuardCommand(step); }
  public observeSchematicRelevanceMonitorBatch(command:CurrentSchematicRelevanceMonitorBatchCommand):Promise<Reply>{return this.observeSchematicRelevanceMonitorBatchCommand(command);}
  public observeSchematicRelevancePendingCache(command:CurrentSchematicRelevancePendingCacheCommand):Promise<Reply>{return this.observeSchematicRelevancePendingCacheCommand(command);}
  public observeSchematicRelevanceUploadReturn(command:CurrentSchematicRelevanceUploadReturnCommand):Promise<Reply>{return this.observeSchematicRelevanceUploadReturnCommand(command);}
  public observeSchematicRelevanceNotification(command:CurrentSchematicRelevanceNotificationWireCommand):Promise<Reply>{return this.observeSchematicRelevanceNotificationCommand(command);}
  /** Keep the worker control route behind this exact own7 pipe subclass. */
  /** Keep Canvas continuation behind the original schematic family pipe. */
  public observeSchematicRelevanceModifyEcho(command: CurrentSchematicRelevanceModifyEchoContinuationCommand): Promise<Reply> { return this.observeSchematicRelevanceModifyEchoCommand(command); }
  public observeSchematicRelevancePublicationReturn(command: CurrentSchematicRelevancePublicationCommand): Promise<Reply> { return this.observeSchematicRelevancePublicationReturnCommand(command); }
  public observeSchematicRelevanceModifyReturn(command: CurrentSchematicRelevanceModifyReturnContinuationCommand): Promise<Reply> { return this.observeSchematicRelevanceModifyReturnCommand(command); }
  public observeSchematicRelevanceModifyCanvas(command: CurrentSchematicRelevanceModifyCanvasContinuationCommand): Promise<Reply> { return this.observeSchematicRelevanceModifyCanvasCommand(command); }
  public observeSchematicRelevanceModifyCm(command: CurrentSchematicRelevanceModifyCmContinuationCommand): Promise<Reply> { return this.observeSchematicRelevanceModifyCmCommand(command); }
  public observeSchematicRelevanceModifyStructure(command: CurrentSchematicRelevanceModifyStructureCommand): Promise<Reply> { return this.observeSchematicRelevanceModifyStructureCommand(command); }
  public observeSchematicRelevanceModifyContinuation(command: CurrentSchematicRelevanceModifyContinuationCommand): Promise<Reply> { return this.observeSchematicRelevanceModifyContinuationCommand(command); }
  public observeSchematicRelevanceModifyWorker(command:CurrentSchematicRelevanceModifyWorkerCommand):Promise<Reply>{return this.observeSchematicRelevanceModifyWorkerCommand(command);}
  public observeSchematicRelevancePublication(command:CurrentSchematicRelevancePublicationCommand):Promise<Reply>{return this.observeSchematicRelevancePublicationCommand(command);}
  public observeSchematicRelevanceSdkGate(command:CurrentSchematicRelevanceSdkGateCommand):Promise<Reply>{return this.observeSchematicRelevanceSdkGateCommand(command);}
  public observeSchematicRelevanceNormalCommandUi(command:CurrentSchematicRelevanceNormalCommandUiCommand):Promise<Reply>{return this.observeSchematicRelevanceNormalCommandUiCommand(command);}
  public observeSchematicRelevanceFileSaveUi(command:CurrentSchematicRelevanceFileSaveUiCommand):Promise<Reply>{return this.observeSchematicRelevanceFileSaveUiCommand(command);}
  public observeSchematicRelevanceRenderDelegate(command:CurrentSchematicRelevanceRenderDelegateCommand):Promise<Reply>{return this.observeSchematicRelevanceRenderDelegateCommand(command);}
  public observeSchematicRelevanceStatusTabMutation(command:CurrentSchematicRelevanceStatusTabMutationCommand):Promise<Reply>{return this.observeSchematicRelevanceStatusTabMutationCommand(command);}
  public observeSchematicRelevanceStatusTabLookup(command:CurrentSchematicRelevanceStatusTabLookupCommand):Promise<Reply>{return this.observeSchematicRelevanceStatusTabLookupCommand(command);}
  public observeSchematicRelevanceStatusSubscriber(command:CurrentSchematicRelevanceStatusSubscriberCommand):Promise<Reply>{return this.observeSchematicRelevanceStatusSubscriberCommand(command);}
  public observeSchematicRelevanceStatusClone(command:CurrentSchematicRelevanceStatusCloneCommand):Promise<Reply>{return this.observeSchematicRelevanceStatusCloneCommand(command);}
  public observeSchematicRelevanceStatusDelivery(command:CurrentSchematicRelevanceStatusDeliveryCommand):Promise<Reply>{return this.observeSchematicRelevanceStatusDeliveryCommand(command);}
  public observeSchematicRelevanceStatusBus(command:CurrentSchematicRelevanceStatusBusCommand):Promise<Reply>{return this.observeSchematicRelevanceStatusBusCommand(command);}
  public observeSchematicRelevanceHistoryStatus(command:CurrentSchematicRelevanceHistoryStatusCommand):Promise<Reply>{return this.observeSchematicRelevanceHistoryStatusCommand(command);}
  public observeSchematicRelevanceUploadCm(command:CurrentSchematicRelevanceUploadCmCommand):Promise<Reply>{return this.observeSchematicRelevanceUploadCmCommand(command);}
  public observeSchematicRelevanceUploadSerialize(command:CurrentSchematicRelevanceUploadSerializeCommand):Promise<Reply>{return this.observeSchematicRelevanceUploadSerializeCommand(command);}
  public observeSchematicRelevanceUploadModel(command:CurrentSchematicRelevanceUploadModelCommand):Promise<Reply>{return this.observeSchematicRelevanceUploadModelCommand(command);}
  public observeSchematicRelevanceUploadEntry(command:CurrentSchematicRelevanceUploadEntryCommand):Promise<Reply>{return this.observeSchematicRelevanceUploadEntryCommand(command);}
  public observeSchematicRelevanceNoEcho(command:CurrentSchematicRelevanceNoEchoCommand):Promise<Reply>{return this.observeSchematicRelevanceNoEchoCommand(command);}
  public observeSchematicRelevanceNormalDisposal(command:CurrentSchematicRelevanceNormalDisposalCommand):Promise<Reply>{return this.observeSchematicRelevanceNormalDisposalCommand(command);}
  public observeSchematicRelevanceNormalRecord(command:CurrentSchematicRelevanceNormalRecordCommand):Promise<Reply>{return this.observeSchematicRelevanceNormalRecordCommand(command);}
  public observeSchematicRelevanceNormalUpdate(command:CurrentSchematicRelevanceNormalUpdateCommand):Promise<Reply>{return this.observeSchematicRelevanceNormalUpdateCommand(command);}
  public observeSchematicRelevanceHistoryCommand(command:CurrentSchematicRelevanceHistoryCommand):Promise<Reply>{return this.observeSchematicRelevanceHistoryCommandCommand(command);}
  public observeSchematicRelevanceRecordAst(command: CurrentSchematicRelevanceRecordAstCommand): Promise<Reply> { return this.observeSchematicRelevanceRecordAstCommand(command); }
  public observeSchematicRelevancePrimitive(command: CurrentSchematicRelevancePrimitiveCommand): Promise<Reply> { return this.observeSchematicRelevancePrimitiveCommand(command); }
  public observeSchematicRelevanceUiPublication(command: CurrentSchematicRelevanceUiPublicationCommand): Promise<Reply> { return this.observeSchematicRelevanceUiPublicationCommand(command); }
  public observeSchematicRelevanceRunPrefix(command: CurrentSchematicRelevanceRunPrefixCommand): Promise<Reply> { return this.observeSchematicRelevanceRunPrefixCommand(command); }
  public observeSchematicRelevanceDisplayModifyEntry(command: CurrentSchematicRelevanceDisplayModifyEntryCommand): Promise<Reply> { return this.observeSchematicRelevanceDisplayModifyEntryCommand(command); }
  public bindSchematicDisplayActionGuard(scriptId: string, variant: 0 | 1): void { this.bindSchematicDisplayActionGuardCommand(scriptId, variant); }
  public observeSchematicDisplayActionGuard(command: CurrentSchematicDisplayActionGuardCommand): Promise<Reply> { return this.observeSchematicDisplayActionGuardCommand(command); }
  public observeSchematicDisplayAction(command: CurrentSchematicDisplayActionCommand): Promise<Reply> { return this.observeSchematicDisplayActionCommand(command); }
  public observeSchematicDisplayAccessor(command: CurrentSchematicDisplayAccessorCommand): Promise<Reply> { return this.observeSchematicDisplayAccessorCommand(command); }
  public bindSchematicDisplayProducerContext(context: string): void { this.bindProducerContext("schematic", context); }
  public continueSchematicDisplayInitialSyncCall(command: CurrentGeneratedInitialSyncCommand): Promise<Reply> { return this.continueInitialSyncCommand("schematic", command); }
  public continueSchematicDisplayPeriodicSyncCall(command: CurrentGeneratedPeriodicSyncCommand): Promise<Reply> { return this.continuePeriodicSyncCommand("schematic", command); }
  public continueSchematicDisplayInitialCache(command: CurrentGeneratedInitialCacheCommand): Promise<Reply> { return this.continueInitialCacheCommand("schematic", command); }
  public continueSchematicRelevanceDisplayLocal(command:CurrentPcbViaLocalUploadCommand):Promise<Reply>{return this.continueSchematicRelevanceDisplayLocalCommand(command);}
  public continueSchematicRelevanceDisplayUpload(command:CurrentPcbViaUploadRequestCommand):Promise<Reply>{return this.continueSchematicRelevanceDisplayUploadCommand(command);}
  public observeSchematicRelevanceDisplayLocalCache(command:CurrentProjectSaveProducerCommand):Promise<Reply>{return this.observeSchematicRelevanceDisplayLocalCacheCommand(command);}
  public observeSchematicDisplayProducer(command: CurrentProjectSaveProducerCommand): Promise<Reply> { return this.observeProducerCommand("schematic", command); }
  public observeSchematicDisplayProducerGuard(command: CurrentProjectSaveProducerGuardCommand): Promise<Reply> { return this.observeProducerGuardCommand("schematic", command); }
  public bindSchematicDisplayStructureTransport(context: string): void { this.bindStructureTransportCommand("schematic", context); }
  public observeSchematicDisplayStructureTransport(command: CurrentProjectStructureTransportCommand): Promise<Reply> { return this.observeStructureTransportCommand("schematic", command); }
  public observeSchematicRelevanceDisplayTail(command:CurrentPcbViaSaveTailObservationCommand):Promise<Reply>{return this.observeSchematicRelevanceDisplayTailCommand(command);}
  public observeSchematicRelevanceDisplayTailExtra(command:CurrentProjectSaveProducerCommand):Promise<Reply>{return this.observeSchematicRelevanceDisplayTailExtraCommand(command);}
  public continueSchematicRelevanceDisplayTailDelete(command:CurrentPcbViaSaveTailDeleteControlCommand):Promise<Reply>{return this.continueSchematicRelevanceDisplayTailDeleteCommand(command);}
  public continueSchematicRelevanceDisplayDrain(command:CurrentPcbViaSaveDrainCommand):Promise<Reply>{return this.continueSchematicRelevanceDisplayDrainCommand(command);}
  public continueSchematicRelevanceDisplayPostHistory(command:CurrentPcbViaPostHistorySyncCommand):Promise<Reply>{return this.continueSchematicRelevanceDisplayPostHistoryCommand(command);}
  public readSchematicRelevanceDisplayObservedSource(command:CurrentPcbViaObservedSourceCommand):Promise<Reply>{return this.readSchematicRelevanceDisplaySourceCommand(command);}
  public observeSchematicRelevanceLibraryRefresh(command: CurrentProjectLibraryRefreshCommand): Promise<Reply> { return this.observeSchematicRelevanceLibraryRefreshCommand(command); }
  public observeSchematicRelevanceDisplaySyncQuiesce(command: CurrentProjectSyncQuiesceCommand): Promise<Reply> { return this.observeSchematicRelevanceDisplaySyncQuiesceCommand(command); }
  public bindSchematicRelevanceDisplayClock(workerContext: string, uiSdk: string): void { this.bindSchematicRelevanceDisplayClockCommand(workerContext, uiSdk); }
  public observeSchematicRelevanceDisplayClock(command: CurrentSchematicDisplayClockCommand, realm: CurrentSchematicDisplayClockRealm): Promise<Reply> { return this.observeSchematicRelevanceDisplayClockCommand(command, realm); }
  public bindSchematicDisplayClock(workerContext: string, uiSdk: string): void { this.bindSchematicDisplayClockCommand(workerContext, uiSdk); }
  public observeSchematicDisplayClock(command: CurrentSchematicDisplayClockCommand, realm: CurrentSchematicDisplayClockRealm): Promise<Reply> { return this.observeSchematicDisplayClockCommand(command, realm); }
  public observeSchematicDisplay(phase: CurrentSchematicDisplayNativePhase, binding: string, target?: unknown, operation?: unknown): Promise<Reply> { return this.observeSchematicDisplayCommand(phase, binding, target, operation); }
  public observeSchematicOperation(phase: CurrentSchematicDisplayNativePhase, binding: string, target?: unknown, operation?: unknown): Promise<Reply> {
    return this.observeSchematicDisplayCommand(phase, binding, target, operation);
  }
}
export class CurrentSchematicDisplayWritePipe extends CurrentSchematicDisplayFamilyPipe {
  public constructor(input: Readable, output: Writable) { super(input, output, "schematic-display-write209"); }
}
export class CurrentSchematicRelevanceDisplayWritePipe extends CurrentSchematicDisplayFamilyPipe {
  public constructor(input: Readable, output: Writable) { super(input, output, "schematic-relevance-display-write209"); }
  public navigateSchematicRelevanceDisplayRegistered(binding: string, target: unknown, retain: (pending: Promise<Reply>) => void): Promise<Reply> { return this.navigateSchematicRelevanceDisplayRegisteredCommand(binding, target, retain); }
  public requireOriginalSchematicRelevanceDisplayRegistrationPending(pending: Promise<unknown>): void { this.requireSchematicRelevanceDisplayRegistrationPendingCommand(pending); }
  public requireOriginalSchematicRelevanceDisplayRegistrationNoDispatch(pending: Promise<unknown>, qualification: QualifiedGeneratedSchematicRelevanceFixtureTarget): void { this.requireSchematicRelevanceDisplayRegistrationNoDispatchCommand(pending, qualification); }
}
export class CurrentSchematicWireEditPipe extends CurrentSchematicDisplayFamilyPipe {
  public constructor(input: Readable, output: Writable) { super(input, output, "schematic-wire-edit209"); }
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
  public bindViaProducerContext(context: string): void { this.bindProducerContext("via", context); }
  public continueViaInitialSyncCall(command: CurrentGeneratedInitialSyncCommand): Promise<Reply> { return this.continueInitialSyncCommand("via", command); }
  public continueViaPeriodicSyncCall(command: CurrentGeneratedPeriodicSyncCommand): Promise<Reply> { return this.continuePeriodicSyncCommand("via", command); }
  public readViaObservedSource(command:CurrentPcbViaObservedSourceCommand):Promise<Reply>{return this.readViaObservedSourceCommand(command);}
  public continueViaSaveDrain(command:CurrentPcbViaSaveDrainCommand):Promise<Reply>{return this.continueViaSaveDrainCommand(command);}
  public continueViaPostHistory(command:CurrentPcbViaPostHistorySyncCommand):Promise<Reply>{return this.continueViaPostSyncCommand(command);}
  public continueViaSaveTailDelete(command:CurrentPcbViaSaveTailDeleteControlCommand):Promise<Reply>{return this.continueViaSaveTailDeleteCommand(command);}
  public observeViaSaveTail(command:CurrentPcbViaSaveTailObservationCommand):Promise<Reply>{return this.observeViaSaveTailCommand(command);}
  public observeViaSaveTailExtra(command:CurrentProjectSaveProducerCommand):Promise<Reply>{return this.observeViaSaveTailExtraCommand(command);}
  public continueViaUploadRequest(command:CurrentPcbViaUploadRequestCommand):Promise<Reply>{return this.continueViaUploadRequestCommand(command);}
  public observeViaSyncQuiesce(command:CurrentProjectSyncQuiesceCommand):Promise<Reply>{return this.observeViaSyncQuiesceCommand(command);}
  public continueViaLocalUpload(command: CurrentPcbViaLocalUploadCommand): Promise<Reply> { return this.continueViaLocalUploadCommand(command); }
  public continueViaInitialCache(command: CurrentGeneratedInitialCacheCommand): Promise<Reply> { return this.continueInitialCacheCommand("via", command); }
  public observeViaProducer(command: CurrentProjectSaveProducerCommand): Promise<Reply> { return this.observeProducerCommand("via", command); }
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
