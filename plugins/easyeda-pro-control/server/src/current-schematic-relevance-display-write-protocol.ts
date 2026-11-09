/* oxlint-disable import/max-dependencies -- Each fixed purpose lane validates its own complete native codec; a caller-selected generic encoder would erase those boundaries. */
import { currentSchematicRelevancePublicationReturnWire } from "./current-schematic-relevance-publication-return-wire.ts";
import { currentSchematicRelevanceModifyReturnContinuationWire } from "./current-schematic-relevance-modify-return-continuation-wire.ts";
import { currentSchematicRelevanceModifyCanvasContinuationWire } from "./current-schematic-relevance-modify-canvas-continuation-wire.ts";
import { currentSchematicRelevanceModifyCmContinuationWire } from "./current-schematic-relevance-modify-cm-continuation-wire.ts";
import { currentSchematicRelevanceModifyStructureWire } from "./current-schematic-relevance-modify-structure-wire.ts";
import { currentSchematicRelevanceModifyContinuationWire } from "./current-schematic-relevance-modify-continuation-wire.ts";
import {currentSchematicRelevanceModifyWorkerWire} from "./current-schematic-relevance-modify-worker-wire.ts";
import {currentSchematicRelevancePublicationWire} from "./current-schematic-relevance-publication-wire.ts";
import {currentSchematicRelevanceNotificationWire} from "./current-schematic-relevance-notification-wire.ts";
import {currentSchematicRelevanceSdkGateWire} from "./current-schematic-relevance-sdk-gate-wire.ts";
import {currentSchematicRelevanceNormalCommandUiWire} from "./current-schematic-relevance-normal-command-ui-wire.ts";
import {currentSchematicRelevanceFileSaveUiWire} from "./current-schematic-relevance-file-save-ui-wire.ts";
import {currentSchematicRelevanceRenderDelegateWire} from "./current-schematic-relevance-render-delegate-wire.ts";
import {currentSchematicRelevanceStatusTabMutationWire} from "./current-schematic-relevance-status-tab-mutation-wire.ts";
import {currentSchematicRelevanceStatusTabLookupWire} from "./current-schematic-relevance-status-tab-lookup-wire.ts";
import {currentSchematicRelevanceStatusSubscriberWire} from "./current-schematic-relevance-status-subscriber-wire.ts";
import {currentSchematicRelevanceStatusCloneWire} from "./current-schematic-relevance-status-clone-wire.ts";
import {currentSchematicRelevanceStatusDeliveryWire} from "./current-schematic-relevance-status-delivery-wire.ts";
import {currentSchematicRelevanceStatusBusWire} from "./current-schematic-relevance-status-bus-wire.ts";
import {currentSchematicRelevanceHistoryStatusWire} from "./current-schematic-relevance-history-status-wire.ts";
import {currentSchematicRelevanceUploadReturnWire} from "./current-schematic-relevance-upload-return-wire.ts";
import {currentSchematicRelevancePendingCacheWire} from "./current-schematic-relevance-pending-cache-wire.ts";
import { currentSchematicRelevanceDisplayDrainWire, currentSchematicRelevanceDisplayPostSyncWire, currentSchematicRelevanceDisplayTailDeleteWire, currentSchematicRelevanceDisplayTailExtraWire, currentSchematicRelevanceDisplayTailWire } from "./current-schematic-relevance-display-save-drain-wire.ts";
import {currentSchematicRelevanceUploadCmWire} from "./current-schematic-relevance-upload-cm-wire.ts";
import {currentSchematicRelevanceUploadSerializeWire} from "./current-schematic-relevance-upload-serialize-wire.ts";
import {currentSchematicRelevanceUploadModelWire} from "./current-schematic-relevance-upload-model-wire.ts";
import {currentSchematicRelevanceUploadEntryWire} from "./current-schematic-relevance-upload-entry-wire.ts";
import {currentSchematicRelevanceNoEchoWire} from "./current-schematic-relevance-noecho-wire.ts";
import {currentSchematicRelevanceNormalRecordWire} from "./current-schematic-relevance-normal-record-wire.ts";
import {currentSchematicRelevanceNormalDisposalWire} from "./current-schematic-relevance-normal-disposal-wire.ts";
import {currentSchematicRelevanceNormalUpdateWire} from "./current-schematic-relevance-normal-update-wire.ts";
import {currentSchematicRelevanceHistoryCommandWire} from "./current-schematic-relevance-history-command-wire.ts";
import {currentSchematicRelevanceMonitorBatchWire} from "./current-schematic-relevance-monitor-batch-wire.ts";
import { currentSchematicRelevanceRecordAstWire } from "./current-schematic-relevance-record-ast-wire.ts";
import { currentSchematicRelevancePrimitiveWire } from "./current-schematic-relevance-primitive-wire.ts";
import { currentSchematicRelevanceUiPublicationWire } from "./current-schematic-relevance-ui-publication-wire.ts";
import { currentSchematicRelevanceDisplayObservedSourceWire } from "./current-schematic-relevance-display-observed-source.ts";
import { currentProjectLibraryRefreshWire } from "./current-project-library-refresh-wire.ts";
import { currentSchematicRelevanceDisplayLocalCacheWire, currentSchematicRelevanceDisplayLocalWire, currentSchematicRelevanceDisplayUploadWire } from "./current-schematic-relevance-display-save-upload-wire.ts";
import { currentSchematicRelevanceDisplaySyncQuiesceWire } from "./current-schematic-relevance-display-sync-quiesce-wire.ts";
import { currentSchematicDisplayClockWire } from "./current-schematic-display-clock-wire.ts";
import { currentSchematicRelevanceRunGuardWire } from "./current-schematic-relevance-run-guard-wire.ts";
import { currentSchematicRelevanceRunPrefixWire } from "./current-schematic-relevance-run-prefix-wire.ts";
import { currentSchematicRelevanceDisplayModifyEntryWire } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import { currentSchematicDisplayAccessorWire } from "./current-schematic-display-accessor-wire.ts";
import { currentSchematicDisplayActionWire } from "./current-schematic-display-action-wire.ts";
import { currentSchematicDisplayActionGuardWire } from "./current-schematic-display-action-guard-protocol.ts";
/** The seven-record owner admits only its own stage bytes and shared finite
 * observation syntax. No six-record stage or mutation-origin alias is offered. */
import { diagnosticRecord } from "./current-pcb-diagnostic-protocol.ts";
import { validateCurrentSchematicRelevanceDisplayNativeCommand } from "./current-schematic-relevance-display-native-command.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PROFILE as PROFILE } from "./current-schematic-relevance-display-write-native-profile.ts";
import { currentSchematicRelevanceDisplaySharedNativeRequest } from "./current-schematic-display-write-protocol.ts";

export function currentSchematicRelevanceDisplayWriteNativeRequest(chunk: Buffer): Readonly<Record<string, unknown>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("SCHEMATIC_RELEVANCE_DISPLAY_WIRE"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  if (!diagnosticRecord(raw) || typeof raw["id"] !== "number" || !Number.isSafeInteger(raw["id"]) || raw["id"] < 1 || raw["id"] > PROFILE.renderer.total ||
    !chunk.equals(Buffer.from(`${JSON.stringify(raw)}\0`))) { throw new Error("SCHEMATIC_RELEVANCE_DISPLAY_WIRE"); }
  if (Object.hasOwn(raw, "schematicDisplayPhase") || Object.hasOwn(raw, "schematicAccessorCommand") || Object.hasOwn(raw, "schematicActionCommand") || Object.hasOwn(raw, "schematicActionGuardCommand") || Object.hasOwn(raw, "schematicClockCommand")) {
    throw new Error("SCHEMATIC_RELEVANCE_DISPLAY_OWN_MUTATION_ORIGIN_REQUIRED");
  }
  const tail = [
    { marker: "schematicRelevanceTailCommand", encode: currentSchematicRelevanceDisplayTailWire },
    { marker: "schematicRelevanceTailExtraCommand", encode: currentSchematicRelevanceDisplayTailExtraWire },
    { marker: "schematicRelevanceTailDeleteCommand", encode: currentSchematicRelevanceDisplayTailDeleteWire },
    { marker: "schematicRelevanceDrainCommand", encode: currentSchematicRelevanceDisplayDrainWire },
    { marker: "schematicRelevancePostSyncCommand", encode: currentSchematicRelevanceDisplayPostSyncWire },
  ].find(row => Object.hasOwn(raw, row.marker));
  if (tail !== undefined) {
    const { id, sessionId } = raw;
    if (raw[tail.marker] !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_RELEVANCE_DRAIN_WIRE"); }
    const input = Object.fromEntries(Object.entries(raw).filter(([key]) => key !== "id" && key !== "sessionId" && key !== tail.marker));
    const selector = tail.marker === "schematicRelevancePostSyncCommand" && input["phase"] === "via-post-sync-replay" ? { phase: "via-post-sync-replay" } : input;
    const fixed = tail.encode(selector, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, [tail.marker]: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_RELEVANCE_DRAIN_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceMonitorBatchCommand")) {
    const { id, sessionId, schematicRelevanceMonitorBatchCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_MONITOR_BATCH_WIRE"); }
    const fixed = currentSchematicRelevanceMonitorBatchWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceMonitorBatchCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_MONITOR_BATCH_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevancePendingCacheCommand")) {
    const { id, sessionId, schematicRelevancePendingCacheCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_PENDING_CACHE_WIRE"); }
    const fixed = currentSchematicRelevancePendingCacheWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevancePendingCacheCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_PENDING_CACHE_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceUploadReturnCommand")) {
    const { id, sessionId, schematicRelevanceUploadReturnCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_UPLOAD_RETURN_WIRE"); }
    const fixed = currentSchematicRelevanceUploadReturnWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceUploadReturnCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_UPLOAD_RETURN_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceNotificationCommand")) {
    const { id, sessionId, schematicRelevanceNotificationCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_NOTIFICATION_WIRE"); }
    const fixed = currentSchematicRelevanceNotificationWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceNotificationCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_NOTIFICATION_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevancePublicationReturnCommand")) {
    const { id, sessionId, schematicRelevancePublicationReturnCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_PUBLICATION_RETURN_ORIGINAL_WIRE"); }
    const fixed = currentSchematicRelevancePublicationReturnWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevancePublicationReturnCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_PUBLICATION_RETURN_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceModifyReturnCommand")) {
    const { id, sessionId, schematicRelevanceModifyReturnCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_MODIFY_RETURN_ORIGINAL_WIRE"); }
    const fixed = currentSchematicRelevanceModifyReturnContinuationWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceModifyReturnCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_MODIFY_RETURN_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceModifyCanvasCommand")) {
    const { id, sessionId, schematicRelevanceModifyCanvasCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_MODIFY_CANVAS_ORIGINAL_WIRE"); }
    const fixed = currentSchematicRelevanceModifyCanvasContinuationWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceModifyCanvasCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_MODIFY_CANVAS_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceModifyCmCommand")) {
    const { id, sessionId, schematicRelevanceModifyCmCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_MODIFY_CM_ORIGINAL_WIRE"); }
    const fixed = currentSchematicRelevanceModifyCmContinuationWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceModifyCmCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_MODIFY_CM_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceModifyStructureCommand")) {
    const { id, sessionId, schematicRelevanceModifyStructureCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_MODIFY_STRUCTURE_WIRE"); }
    const fixed = currentSchematicRelevanceModifyStructureWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceModifyStructureCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_MODIFY_STRUCTURE_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceModifyContinuationCommand")) {
    const { id, sessionId, schematicRelevanceModifyContinuationCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_MODIFY_CONTROL_WIRE"); }
    const fixed = currentSchematicRelevanceModifyContinuationWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceModifyContinuationCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_MODIFY_CONTROL_FIXED_WIRE"); }
    return fixed.request;
  }
  if(Object.hasOwn(raw,"schematicRelevanceModifyWorkerCommand")){
    const{id,sessionId,schematicRelevanceModifyWorkerCommand:marker,...input}=raw;if(marker!==true||typeof sessionId!=="string"||!/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)){throw new Error("SCHEMATIC_MODIFY_WORKER_WIRE");}const fixed=currentSchematicRelevanceModifyWorkerWire(input,id);if(!chunk.equals(Buffer.from(`${JSON.stringify({id,...fixed.command,schematicRelevanceModifyWorkerCommand:true,sessionId})}\0`))){throw new Error("SCHEMATIC_MODIFY_WORKER_FIXED_WIRE");}return fixed.request;
  }
  if(Object.hasOwn(raw,"schematicRelevancePublicationCommand")){
    const{id,sessionId,schematicRelevancePublicationCommand:marker,...input}=raw;if(marker!==true||typeof sessionId!=="string"||!/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)){throw new Error("SCHEMATIC_PUBLICATION_WIRE");}const fixed=currentSchematicRelevancePublicationWire(input,id);if(!chunk.equals(Buffer.from(`${JSON.stringify({id,...fixed.command,schematicRelevancePublicationCommand:true,sessionId})}\0`))){throw new Error("SCHEMATIC_PUBLICATION_FIXED_WIRE");}return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceSdkGateCommand")) {
    const { id, sessionId, schematicRelevanceSdkGateCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_SDK_GATE_WIRE"); }
    const fixed = currentSchematicRelevanceSdkGateWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceSdkGateCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_SDK_GATE_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceNormalCommandUiCommand")) {
    const { id, sessionId, schematicRelevanceNormalCommandUiCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_NORMAL_COMMAND_UI_WIRE"); }
    const fixed = currentSchematicRelevanceNormalCommandUiWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceNormalCommandUiCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_NORMAL_COMMAND_UI_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceFileSaveUiCommand")) {
    const { id, sessionId, schematicRelevanceFileSaveUiCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_FILE_SAVE_UI_WIRE"); }
    const fixed = currentSchematicRelevanceFileSaveUiWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceFileSaveUiCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_FILE_SAVE_UI_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceRenderDelegateCommand")) {
    const { id, sessionId, schematicRelevanceRenderDelegateCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_RENDER_DELEGATE_WIRE"); }
    const fixed = currentSchematicRelevanceRenderDelegateWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceRenderDelegateCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_RENDER_DELEGATE_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceStatusTabMutationCommand")) {
    const { id, sessionId, schematicRelevanceStatusTabMutationCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_STATUS_TAB_MUTATION_WIRE"); }
    const fixed = currentSchematicRelevanceStatusTabMutationWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceStatusTabMutationCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_STATUS_TAB_MUTATION_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceStatusTabLookupCommand")) {
    const { id, sessionId, schematicRelevanceStatusTabLookupCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_STATUS_TAB_LOOKUP_WIRE"); }
    const fixed = currentSchematicRelevanceStatusTabLookupWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceStatusTabLookupCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_STATUS_TAB_LOOKUP_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceStatusSubscriberCommand")) {
    const { id, sessionId, schematicRelevanceStatusSubscriberCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_STATUS_SUBSCRIBER_WIRE"); }
    const fixed = currentSchematicRelevanceStatusSubscriberWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceStatusSubscriberCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_STATUS_SUBSCRIBER_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceStatusCloneCommand")) {
    const { id, sessionId, schematicRelevanceStatusCloneCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_STATUS_CLONE_WIRE"); }
    const fixed = currentSchematicRelevanceStatusCloneWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceStatusCloneCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_STATUS_CLONE_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceStatusDeliveryCommand")) {
    const { id, sessionId, schematicRelevanceStatusDeliveryCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_STATUS_DELIVERY_WIRE"); }
    const fixed = currentSchematicRelevanceStatusDeliveryWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceStatusDeliveryCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_STATUS_DELIVERY_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceStatusBusCommand")) {
    const { id, sessionId, schematicRelevanceStatusBusCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_STATUS_BUS_WIRE"); }
    const fixed = currentSchematicRelevanceStatusBusWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceStatusBusCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_STATUS_BUS_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceHistoryStatusCommand")) {
    const { id, sessionId, schematicRelevanceHistoryStatusCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_HISTORY_STATUS_WIRE"); }
    const fixed = currentSchematicRelevanceHistoryStatusWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceHistoryStatusCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_HISTORY_STATUS_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceUploadCmCommand")) {
    const { id, sessionId, schematicRelevanceUploadCmCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_UPLOAD_CM_WIRE"); }
    const fixed = currentSchematicRelevanceUploadCmWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceUploadCmCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_UPLOAD_CM_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceUploadSerializeCommand")) {
    const { id, sessionId, schematicRelevanceUploadSerializeCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_UPLOAD_SERIALIZE_WIRE"); }
    const fixed = currentSchematicRelevanceUploadSerializeWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceUploadSerializeCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_UPLOAD_SERIALIZE_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceUploadModelCommand")) {
    const { id, sessionId, schematicRelevanceUploadModelCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_UPLOAD_MODEL_WIRE"); }
    const fixed = currentSchematicRelevanceUploadModelWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceUploadModelCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_UPLOAD_MODEL_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceUploadEntryCommand")) {
    const { id, sessionId, schematicRelevanceUploadEntryCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_UPLOAD_ENTRY_WIRE"); }
    const fixed = currentSchematicRelevanceUploadEntryWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceUploadEntryCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_UPLOAD_ENTRY_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceNoEchoCommand")) {
    const { id, sessionId, schematicRelevanceNoEchoCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_NOECHO_WIRE"); }
    const fixed = currentSchematicRelevanceNoEchoWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceNoEchoCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_NOECHO_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceNormalDisposalCommand")) {
    const { id, sessionId, schematicRelevanceNormalDisposalCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_NORMAL_DISPOSAL_WIRE"); }
    const fixed = currentSchematicRelevanceNormalDisposalWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceNormalDisposalCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_NORMAL_DISPOSAL_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceNormalRecordCommand")) {
    const { id, sessionId, schematicRelevanceNormalRecordCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_NORMAL_RECORD_WIRE"); }
    const fixed = currentSchematicRelevanceNormalRecordWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceNormalRecordCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_NORMAL_RECORD_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceNormalUpdateCommand")) {
    const { id, sessionId, schematicRelevanceNormalUpdateCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_NORMAL_UPDATE_WIRE"); }
    const fixed = currentSchematicRelevanceNormalUpdateWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceNormalUpdateCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_NORMAL_UPDATE_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceHistoryCommandCommand")) {
    const { id, sessionId, schematicRelevanceHistoryCommandCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_HISTORY_COMMAND_WIRE"); }
    const fixed = currentSchematicRelevanceHistoryCommandWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceHistoryCommandCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_HISTORY_COMMAND_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceRecordAstCommand")) {
    const { id, sessionId, schematicRelevanceRecordAstCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_RECORD_AST_WIRE"); }
    const fixed = currentSchematicRelevanceRecordAstWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceRecordAstCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_RECORD_AST_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevancePrimitiveCommand")) {
    const { id, sessionId, schematicRelevancePrimitiveCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_PRIMITIVE_WIRE"); }
    const fixed = currentSchematicRelevancePrimitiveWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevancePrimitiveCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_PRIMITIVE_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceUiPublicationCommand")) {
    const { id, sessionId, schematicRelevanceUiPublicationCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_UI_PUBLICATION_WIRE"); }
    const fixed = currentSchematicRelevanceUiPublicationWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceUiPublicationCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_UI_PUBLICATION_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceRunGuardCommand")) {
    const { id, sessionId, schematicRelevanceRunGuardCommand: marker, schematicRelevanceRunGuardRole: guard, ...command } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_RUN_GUARD_WIRE"); }
    const fixed = currentSchematicRelevanceRunGuardWire({ guard, command }, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.step.command, schematicRelevanceRunGuardCommand: true, schematicRelevanceRunGuardRole: fixed.step.guard, sessionId })}\0`))) { throw new Error("SCHEMATIC_RUN_GUARD_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceRunPrefixCommand")) {
    const { id, sessionId, schematicRelevanceRunPrefixCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_PREFIX_WIRE"); }
    const fixed = currentSchematicRelevanceRunPrefixWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceRunPrefixCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_PREFIX_FIXED_WIRE"); }
    return fixed.request;
  }
  if(Object.hasOwn(raw,"schematicRelevanceObservedSourceCommand")){const {id,sessionId,schematicRelevanceObservedSourceCommand:marker,...input}=raw;if(marker!==true||typeof sessionId!=="string"||!/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)){throw new Error("RELEVANCE_HELPER_SOURCE_WIRE");}const fixed=currentSchematicRelevanceDisplayObservedSourceWire(input,id);if(!chunk.equals(Buffer.from(`${JSON.stringify({id,...fixed.command,schematicRelevanceObservedSourceCommand:true,sessionId})}\0`))){throw new Error("RELEVANCE_HELPER_SOURCE_WIRE");}return fixed.request;}
  if (Object.hasOwn(raw, "schematicRelevanceLibraryRefreshCommand")) {
    const { id, sessionId, schematicRelevanceLibraryRefreshCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_RELEVANCE_LIBRARY_WIRE"); }
    const fixed = currentProjectLibraryRefreshWire(input, id, "schematic-relevance-library-refresh");
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceLibraryRefreshCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_RELEVANCE_LIBRARY_FIXED_WIRE"); }
    return fixed.request;
  }
  if(Object.hasOwn(raw,"schematicRelevanceSaveLocalCommand")){const {id,sessionId,schematicRelevanceSaveLocalCommand:marker,...input}=raw;if(marker!==true||typeof sessionId!=="string"||!/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)){throw new Error("RELEVANCE_SAVE_UPLOAD_WIRE");}const fixed=currentSchematicRelevanceDisplayLocalWire(input,id);if(!chunk.equals(Buffer.from(`${JSON.stringify({id,...fixed.command,schematicRelevanceSaveLocalCommand:true,sessionId})}\0`))){throw new Error("RELEVANCE_SAVE_UPLOAD_WIRE");}return fixed.request;}
  if(Object.hasOwn(raw,"schematicRelevanceSaveUploadCommand")){const {id,sessionId,schematicRelevanceSaveUploadCommand:marker,...input}=raw;if(marker!==true||typeof sessionId!=="string"||!/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)){throw new Error("RELEVANCE_SAVE_UPLOAD_WIRE");}const fixed=currentSchematicRelevanceDisplayUploadWire(input,id);if(!chunk.equals(Buffer.from(`${JSON.stringify({id,...fixed.command,schematicRelevanceSaveUploadCommand:true,sessionId})}\0`))){throw new Error("RELEVANCE_SAVE_UPLOAD_WIRE");}return fixed.request;}
  if(Object.hasOwn(raw,"schematicRelevanceLocalCacheCommand")){const {id,sessionId,schematicRelevanceLocalCacheCommand:marker,...input}=raw;if(marker!==true||typeof sessionId!=="string"||!/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)){throw new Error("RELEVANCE_SAVE_UPLOAD_WIRE");}const fixed=currentSchematicRelevanceDisplayLocalCacheWire(input,id);if(!chunk.equals(Buffer.from(`${JSON.stringify({id,...fixed.command,schematicRelevanceLocalCacheCommand:true,sessionId})}\0`))){throw new Error("RELEVANCE_SAVE_UPLOAD_WIRE");}return fixed.request;}
  if (Object.hasOwn(raw, "schematicRelevanceSyncQuiesceCommand")) {
    const { id, sessionId, schematicRelevanceSyncQuiesceCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_RELEVANCE_QUIESCE_WIRE"); }
    const fixed = currentSchematicRelevanceDisplaySyncQuiesceWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceSyncQuiesceCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_RELEVANCE_QUIESCE_FIXED_WIRE"); }
    return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceClockCommand")) {
    const { id, sessionId, schematicRelevanceClockCommand: marker, schematicClockRealm: realm, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId) || realm !== "worker" && realm !== "ui") { throw new Error("SCHEMATIC_RELEVANCE_CLOCK_WIRE"); }
    const fixed = currentSchematicDisplayClockWire(input, realm, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceClockCommand: true, schematicClockRealm: realm, sessionId })}\0`))) { throw new Error("SCHEMATIC_RELEVANCE_CLOCK_FIXED_WIRE"); }
    return Object.freeze({ ...fixed.request, action: "schematic-relevance-display-clock" });
  }
  if (Object.hasOwn(raw, "schematicRelevanceSaveGeneration")) {
    const { id, sessionId, schematicRelevanceSaveGeneration: marker, ...input } = raw; const command = validateCurrentSchematicRelevanceDisplayNativeCommand(input);
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId) || command.schematicRelevanceDisplayPhase !== "save" || !chunk.equals(Buffer.from(`${JSON.stringify({ id, ...command, schematicRelevanceSaveGeneration: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_RELEVANCE_SAVE_GENERATION_WIRE"); }
    return Object.freeze({ action: "schematic-relevance-display-save-generate", requestId: id });
  }
  if (Object.hasOwn(raw, "schematicRelevanceModifyGeneration")) {
    const { id, sessionId, schematicRelevanceModifyGeneration: marker, ...input } = raw; const command = validateCurrentSchematicRelevanceDisplayNativeCommand(input);
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId) || command.schematicRelevanceDisplayPhase !== "modify" || !chunk.equals(Buffer.from(`${JSON.stringify({ id, ...command, schematicRelevanceModifyGeneration: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_RELEVANCE_MODIFY_GENERATION_WIRE"); }
    return Object.freeze({ action: "schematic-relevance-display-modify-generate", requestId: id });
  }
  if (Object.hasOwn(raw, "schematicRelevanceModifyEntryCommand")) {
    const { id, sessionId, schematicRelevanceModifyEntryCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_RELEVANCE_MODIFY_ENTRY_WIRE"); }
    const fixed = currentSchematicRelevanceDisplayModifyEntryWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceModifyEntryCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_RELEVANCE_MODIFY_ENTRY_FIXED_WIRE"); } return fixed.request;
  }
  if (Object.hasOwn(raw, "schematicRelevanceAccessorCommand")) {
    const { id, sessionId, schematicRelevanceAccessorCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_RELEVANCE_ACTION_WIRE"); }
    const fixed = currentSchematicDisplayAccessorWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceAccessorCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_RELEVANCE_ACTION_FIXED_WIRE"); }
    return Object.freeze({ ...fixed.request, action: "schematic-relevance-display-accessor" });
  }
  if (Object.hasOwn(raw, "schematicRelevanceActionCommand")) {
    const { id, sessionId, schematicRelevanceActionCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_RELEVANCE_ACTION_WIRE"); }
    const fixed = currentSchematicDisplayActionWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceActionCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_RELEVANCE_ACTION_FIXED_WIRE"); }
    return Object.freeze({ ...fixed.request, action: "schematic-relevance-display-action" });
  }
  if (Object.hasOwn(raw, "schematicRelevanceActionGuardCommand")) {
    const { id, sessionId, schematicRelevanceActionGuardCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_RELEVANCE_ACTION_WIRE"); }
    const fixed = currentSchematicDisplayActionGuardWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceActionGuardCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_RELEVANCE_ACTION_FIXED_WIRE"); }
    return Object.freeze({ ...fixed.request, action: "schematic-relevance-display-action-guard" });
  }
  if (!Object.hasOwn(raw, "schematicRelevanceDisplayPhase")) { return currentSchematicRelevanceDisplaySharedNativeRequest(chunk); }
  const { id, sessionId, ...input } = raw, command = validateCurrentSchematicRelevanceDisplayNativeCommand(input);
  if (typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_RELEVANCE_DISPLAY_SESSION"); }
  const phase = command.schematicRelevanceDisplayPhase;
  return Object.freeze({ action: "schematic-relevance-display-native", requestId: id, sessionId, phase,
    ...("uniqueContextId" in command.params ? { uniqueContextId: command.params.uniqueContextId } : { objectId: command.params.objectId }),
    ...(phase === "start" ? {} : { targetJson: command.params.arguments[0].value }), ...(phase === "start" || phase === "navigate" ? {} : { operationJson: command.params.arguments[2].value }) });
}
