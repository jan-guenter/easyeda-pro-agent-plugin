import {currentSchematicRelevanceMonitorBatchWire} from "./current-schematic-relevance-monitor-batch-wire.ts";
import { currentSchematicRelevanceRecordAstWire } from "./current-schematic-relevance-record-ast-wire.ts";
import { currentSchematicRelevancePrimitiveWire } from "./current-schematic-relevance-primitive-wire.ts";
import { currentSchematicRelevanceUiPublicationWire } from "./current-schematic-relevance-ui-publication-wire.ts";
/* oxlint-disable import/max-dependencies -- Each fixed purpose lane validates its own complete native codec; a caller-selected generic encoder would erase those boundaries. */
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
  if (Object.hasOwn(raw, "schematicRelevanceMonitorBatchCommand")) {
    const { id, sessionId, schematicRelevanceMonitorBatchCommand: marker, ...input } = raw;
    if (marker !== true || typeof sessionId !== "string" || !/^[A-Za-z\d_.:-]{1,128}$/u.test(sessionId)) { throw new Error("SCHEMATIC_MONITOR_BATCH_WIRE"); }
    const fixed = currentSchematicRelevanceMonitorBatchWire(input, id);
    if (!chunk.equals(Buffer.from(`${JSON.stringify({ id, ...fixed.command, schematicRelevanceMonitorBatchCommand: true, sessionId })}\0`))) { throw new Error("SCHEMATIC_MONITOR_BATCH_FIXED_WIRE"); }
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
