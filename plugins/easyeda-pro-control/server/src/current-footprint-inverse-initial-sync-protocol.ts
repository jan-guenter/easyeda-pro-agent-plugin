/* oxlint-disable unicorn/max-nested-calls -- The finite schema mirrors exact nested CDP arguments; every literal is checked before dispatch. */
/** Separate saved multi-head inverse sync, including four original same-head responses. */
import { z } from "zod";
import { currentProjectSaveProducerNativeCases, validateCurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import type { CurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-initial-sync-programs.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_CALLER as CALLER, CURRENT_GENERATED_INITIAL_SYNC_MODULE_EXPRESSION as MODULE } from "./current-generated-initial-sync-source.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE } from "./current-project-save-producer-cache-replies.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_REQUESTS = Object.freeze({ capture: 16, entryResume: 1, full: 3, histories: 16, merged: 2, finalizing: 2, returned: 5, settlementRetry: 2, cdpRequests: 47, events: 9 });
export const CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_FLAGS = Object.freeze({ objectGroup: "easyeda-footprint-inverse-initial-sync209-v1", silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false, returnByValue: true } as const);
const flags = { objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false), returnByValue: z.literal(true) };
const frameFlags = { objectGroup: z.literal(CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false), returnByValue: z.literal(false) };
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const roles = ["syncEntry", "syncFull", "syncHistory1", "syncHistory2", "syncHistory3", "syncHistory4", "syncMerged", "syncFinalizing", "syncReturned"] as const;
const slot = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7), z.literal(8), z.literal(9)]);
const ordinal = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
const count = z.number().int().min(1).max(8), scalar = z.number().int().min(0).max(8192), shallow = z.number().int().min(0).max(32);
const schema = z.union([
  ...(["module", "caller"] as const).map(role => z.strictObject({ phase: z.literal(`inverse-initial-sync-${role}`), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ ...frameFlags, callFrameId: handle, expression: z.literal(role === "module" ? MODULE : CALLER.expression) }) })),
  z.strictObject({ phase: z.literal("inverse-initial-sync-capture"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, returnByValue: z.literal(false), objectId: handle, functionDeclaration: z.literal(PROGRAMS.capture), arguments: z.tuple([ref, ref, ref, ref, z.strictObject({ value: z.string().regex(/^https:\/\/client\/index\/v1\/[a-f\d]{32}$/u) }), z.strictObject({ value: z.string().min(1).max(8192).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 8192) }), z.strictObject({ value: scalar.min(1) }), z.strictObject({ value: shallow }), z.strictObject({ value: shallow }), z.strictObject({ value: shallow }), z.strictObject({ value: scalar }), z.strictObject({ value: count })]) }) }),
  ...(["capture-properties", "full-properties"] as const).map(role => z.strictObject({ phase: z.literal(`inverse-initial-sync-${role}`), method: z.literal("Runtime.getProperties"), params: properties })),
  z.strictObject({ phase: z.literal("inverse-initial-sync-callee"), slot, method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("inverse-initial-sync-baseline-objects"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, returnByValue: z.literal(false), objectId: handle, functionDeclaration: z.literal(PROGRAMS.baselineObjects), arguments: z.tuple([z.strictObject({ value: scalar.min(1) }), z.strictObject({ value: shallow })]) }) }),
  z.strictObject({ phase: z.literal("inverse-initial-sync-baseline-object-properties"), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("inverse-initial-sync-response-objects"), ordinal, method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, returnByValue: z.literal(false), objectId: handle, functionDeclaration: z.literal(PROGRAMS.responseObjects), arguments: z.tuple([]) }) }),
  z.strictObject({ phase: z.literal("inverse-initial-sync-response-object-properties"), ordinal, method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("inverse-initial-sync-full"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.full), arguments: z.tuple([ref]) }) }),
  z.strictObject({ phase: z.literal("inverse-initial-sync-history"), ordinal, method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.history), arguments: z.tuple([ref, ref, z.strictObject({ value: ordinal })]) }) }),
  z.strictObject({ phase: z.literal("inverse-initial-sync-merged"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.merged), arguments: z.tuple([ref, ref, ref]) }) }),
  ...(["finalizing", "returned"] as const).map(role => z.strictObject({ phase: z.literal(`inverse-initial-sync-${role}`), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS[role]), arguments: z.tuple([ref, ref]) }) })),
  z.strictObject({ phase: z.literal("inverse-initial-sync-return-promise"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, returnByValue: z.literal(false), objectId: handle, functionDeclaration: z.literal(CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE), arguments: z.tuple([]) }) }),
  z.strictObject({ phase: z.literal("inverse-initial-sync-settled"), role: z.enum(["task", "outer"]), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("inverse-initial-sync-resume"), role: z.enum(roles), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
]);
export type CurrentFootprintInverseInitialSyncCommand = z.infer<typeof schema>;
export function validateCurrentFootprintInverseInitialSyncCommand(input: unknown): CurrentFootprintInverseInitialSyncCommand {
  const fixed = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (fixed.phase === "inverse-initial-sync-history" && fixed.params.arguments[2].value !== fixed.ordinal) { throw new Error("INITIAL_SYNC_RESPONSE_ORDINAL"); }
  return freezeDeep(fixed);
}
const refValue = (): Readonly<{ objectId: string }> => ({ objectId: "original_object" });
export function currentFootprintInverseInitialSyncNativeCases(): readonly CurrentFootprintInverseInitialSyncCommand[] {
  const frame = { objectGroup: CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false };
  const propertiesParams = { objectId: "original_object", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false };

  const cases: unknown[] = [
    { phase: "inverse-initial-sync-module", method: "Debugger.evaluateOnCallFrame", params: { ...frame, callFrameId: "original_entry", expression: MODULE } },
    { phase: "inverse-initial-sync-caller", method: "Debugger.evaluateOnCallFrame", params: { ...frame, callFrameId: "original_caller", expression: CALLER.expression } },
    { phase: "inverse-initial-sync-capture", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_FLAGS, returnByValue: false, objectId: "original_entry", functionDeclaration: PROGRAMS.capture, arguments: [refValue(), refValue(), refValue(), refValue(), { value: `https://client/index/v1/${"a".repeat(32)}` }, { value: "original_body" }, ...[128, 7, 17, 20, 1024, 1].map(value => ({ value }))] } },
    { phase: "inverse-initial-sync-capture-properties", method: "Runtime.getProperties", params: propertiesParams },
  ];
  for (let index = 0; index < 10; index += 1) { cases.push({ phase: "inverse-initial-sync-callee", slot: index, method: "Runtime.getProperties", params: propertiesParams }); }
  cases.push({ phase: "inverse-initial-sync-baseline-objects", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_FLAGS, returnByValue: false, objectId: "original_capture", functionDeclaration: PROGRAMS.baselineObjects, arguments: [{ value: 128 }, { value: 7 }] } },
    { phase: "inverse-initial-sync-baseline-object-properties", method: "Runtime.getProperties", params: propertiesParams },
    { phase: "inverse-initial-sync-resume", role: "syncEntry", method: "Debugger.resume", params: {} },
    { phase: "inverse-initial-sync-full-properties", method: "Runtime.getProperties", params: propertiesParams },
    { phase: "inverse-initial-sync-full", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_FLAGS, objectId: "original_full", functionDeclaration: PROGRAMS.full, arguments: [refValue()] } },
    { phase: "inverse-initial-sync-resume", role: "syncFull", method: "Debugger.resume", params: {} });
  for (const index of [1, 2, 3, 4] as const) { cases.push(
    { phase: "inverse-initial-sync-response-objects", ordinal: index, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_FLAGS, returnByValue: false, objectId: "original_history", functionDeclaration: PROGRAMS.responseObjects, arguments: [] } },
    { phase: "inverse-initial-sync-response-object-properties", ordinal: index, method: "Runtime.getProperties", params: propertiesParams },
    { phase: "inverse-initial-sync-history", ordinal: index, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_FLAGS, objectId: "original_history", functionDeclaration: PROGRAMS.history, arguments: [refValue(), refValue(), { value: index }] } },
    { phase: "inverse-initial-sync-resume", role: `syncHistory${String(index)}`, method: "Debugger.resume", params: {} }); }
  cases.push({ phase: "inverse-initial-sync-merged", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_FLAGS, objectId: "original_merged", functionDeclaration: PROGRAMS.merged, arguments: [refValue(), refValue(), refValue()] } },
    { phase: "inverse-initial-sync-resume", role: "syncMerged", method: "Debugger.resume", params: {} },
    { phase: "inverse-initial-sync-finalizing", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_FLAGS, objectId: "original_finalizing", functionDeclaration: PROGRAMS.finalizing, arguments: [refValue(), refValue()] } },
    { phase: "inverse-initial-sync-resume", role: "syncFinalizing", method: "Debugger.resume", params: {} },
    { phase: "inverse-initial-sync-returned", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_FLAGS, objectId: "original_returned", functionDeclaration: PROGRAMS.returned, arguments: [refValue(), refValue()] } },
    { phase: "inverse-initial-sync-return-promise", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_FLAGS, returnByValue: false, objectId: "original_outer", functionDeclaration: CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, arguments: [] } },
    { phase: "inverse-initial-sync-resume", role: "syncReturned", method: "Debugger.resume", params: {} });
  for (const role of ["task", "outer"]) { cases.push({ phase: "inverse-initial-sync-settled", role, method: "Runtime.getProperties", params: propertiesParams }); }
  return freezeDeep(cases.map(value => validateCurrentFootprintInverseInitialSyncCommand(value)));
}

/** Own source observation/cursor budget. The existing constructor arm supplies
 * all six sites; syncHistory is visited four times. No new breakpoint is added. */
export const CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_NATIVE_REQUESTS = Object.freeze({ cursor: 47, captures: 27, helperSources: 35, cdpRequests: 109, holds: 9, controls: 120, events: 18 });

export const CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_ROLES = Object.freeze(["syncEntry", "syncFull", "syncHistory", "syncMerged", "syncFinalizing", "syncReturned"] as const);
const helper = z.strictObject({ phase: z.literal("inverse-initial-sync-helper"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) });
export type CurrentFootprintInverseInitialSyncNativeCommand = CurrentFootprintInverseInitialSyncCommand | CurrentProjectSaveProducerCommand | z.infer<typeof helper>;
function observation(command: CurrentProjectSaveProducerCommand): boolean { return command.phase === "project-save-producer-properties" || (command.phase === "project-save-producer-frame" || command.phase === "project-save-producer-receiver") && CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_ROLES.some(role => role === command.role); }
export function validateCurrentFootprintInverseInitialSyncNativeCommand(input: unknown): CurrentFootprintInverseInitialSyncNativeCommand {
  const raw = captureCurrentPcbStringClockReply(input).value; const phase = z.looseObject({ phase: z.string() }).parse(raw).phase;
  if (phase === "inverse-initial-sync-helper") { return freezeDeep(helper.parse(raw)); }
  if (phase.startsWith("inverse-initial-sync-")) { return validateCurrentFootprintInverseInitialSyncCommand(raw); }
  const command = validateCurrentProjectSaveProducerCommand(raw); if (!observation(command)) { throw new Error("FOOTPRINT_INVERSE_INITIAL_SYNC_FIXED_OBSERVATIONS"); } return command;
}
export function currentFootprintInverseInitialSyncNativeCommands(): readonly CurrentFootprintInverseInitialSyncNativeCommand[] {
  return freezeDeep([...currentFootprintInverseInitialSyncNativeCases(), ...currentProjectSaveProducerNativeCases().filter(value => observation(value)), { phase: "inverse-initial-sync-helper", method: "Debugger.getScriptSource", params: { scriptId: "inverse_sync_script" } }]);
}
