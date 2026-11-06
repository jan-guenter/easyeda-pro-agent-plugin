/** Observation-only uploader vocabulary. Original receiver joins can retain a
 * held source call; there is no resume, timer, cache or mutation command. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_RECEIVER_CALLS as CALLS } from "./current-project-save-producer-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES } from "./current-project-save-producer-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PROJECT_SAVE_PRODUCER_ROLES = ["localIngress", "bufferIngress", "cloudIngress", "historyCloud", "localReturned", "localFailed", "bufferScheduled", "bufferDrain", "bufferDone", "batchReturned", "historyReply", "historyFailed", "historyQueued", "historyFinally", "cloudReturned", "cloudFinally", "syncEntry", "syncDeferred", "syncFull", "syncReturned", "syncFailed", "detachedEntry", "detachedReturned", "headEntry", "headPromise", "headSuccess", "cacheFailed"] as const;
export const CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS = ["localIngress", "bufferIngress", "cloudIngress", "historyCloud"] as const;
export const CURRENT_PROJECT_SAVE_PRODUCER_GROUP = "easyeda-project-save-producer209-v1";
/** Two original occurrences per source role are a finite observation budget,
 * not a claim that background work finishes or cannot occur again. */
export const CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS = Object.freeze({ newArms: 23, maximumRoleOccurrences: 2, frames: 54, joins: 54, properties: 54,
  normal: 185, cleanup: 0, cdpRequests: 185, events: 54 });
const GROUP = CURRENT_PROJECT_SAVE_PRODUCER_GROUP;
export const CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false, returnByValue: false } as const);
export const CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle }), role = z.enum(CURRENT_PROJECT_SAVE_PRODUCER_ROLES);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const callFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false), returnByValue: z.literal(false) };
const frameFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) };
const schemas = [
  z.strictObject({ phase: z.literal("project-save-producer-arm"), role, method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({ location }) }),
  z.strictObject({ phase: z.literal("project-save-producer-frame"), role, method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ ...frameFlags, callFrameId: handle, expression: z.string() }) }),
  z.strictObject({ phase: z.literal("project-save-producer-receiver"), role, method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.string(), arguments: z.tuple([ref, ref, ref]) }) }),
  z.strictObject({ phase: z.literal("project-save-producer-properties"), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
] as const;
const schema = z.union(schemas);
export type CurrentProjectSaveProducerCommand = z.infer<typeof schema>;
export function validateCurrentProjectSaveProducerCommand(input: unknown): CurrentProjectSaveProducerCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "project-save-producer-arm") {
    if (CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS.some(value => value === command.role) || command.params.location.lineNumber !== SITES[command.role].lineNumber || command.params.location.columnNumber !== SITES[command.role].columnNumber) { throw new Error("PROJECT_SAVE_PRODUCER_FIXED_ARM"); }
  } else if (command.phase === "project-save-producer-frame" && command.params.expression !== SITES[command.role].expression || command.phase === "project-save-producer-receiver" && command.params.functionDeclaration !== CALLS[command.role]) { throw new Error("PROJECT_SAVE_PRODUCER_FIXED_PROGRAM"); }
  return freezeDeep(command);
}
export function currentProjectSaveProducerNativeCases(): readonly CurrentProjectSaveProducerCommand[] {
  const cases: unknown[] = [];
  for (const name of CURRENT_PROJECT_SAVE_PRODUCER_ROLES) {
    const site = SITES[name];
    if (!CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS.some(value => value === name)) { cases.push({ phase: "project-save-producer-arm", role: name, method: "Debugger.setBreakpoint", params: { location: { scriptId: "original_script", lineNumber: site.lineNumber, columnNumber: site.columnNumber } } }); }
    cases.push({ phase: "project-save-producer-frame", role: name, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS, callFrameId: "original_frame", expression: site.expression } },
      { phase: "project-save-producer-receiver", role: name, method: "Runtime.callFunctionOn", params: { ...CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS, objectId: "original_frame_array", functionDeclaration: CALLS[name], arguments: [{ objectId: "original_project" }, { objectId: "original_wrapper" }, { objectId: "original_callback" }] } });
  }
  cases.push({ phase: "project-save-producer-properties", method: "Runtime.getProperties", params: { objectId: "original_frame_array", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  return freezeDeep(cases.map(command => validateCurrentProjectSaveProducerCommand(command)));
}
