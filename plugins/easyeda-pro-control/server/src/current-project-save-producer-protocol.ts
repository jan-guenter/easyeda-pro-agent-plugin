/* oxlint-disable import/max-dependencies -- The fixed producer schema composes separate intrinsic, source, cache and periodic-call grammars. */
/** Observation-only uploader vocabulary. Original receiver joins can retain a
 * held source call; there is no resume, timer, cache or mutation command. */
import { CURRENT_GENERATED_PERIODIC_SYNC_MAXIMUM as PERIODIC } from "./current-generated-periodic-sync-protocol.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_CONDITION as SYNC_CONDITION } from "./current-generated-initial-sync-condition.ts";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as INTRINSICS, CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES as INTRINSIC_PROFILES } from "./current-native-cache-response-intrinsics.ts";
import { z } from "zod";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE } from "./current-project-save-producer-cache-replies.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS as CACHE_CALLERS } from "./current-project-save-producer-cache-source.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLS as CACHE_CALLS } from "./current-project-save-producer-cache-programs.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_RECEIVER_CALLS as CALLS } from "./current-project-save-producer-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES } from "./current-project-save-producer-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PROJECT_SAVE_PRODUCER_ROLES = ["localIngress", "bufferIngress", "cloudIngress", "historyCloud", "localReturned", "localFailed", "bufferScheduled", "bufferDrain", "bufferDone", "batchReturned", "historyReply", "historyFailed", "historyQueued", "historyFinally", "cloudReturned", "cloudFinally", "syncEntry", "syncDeferred", "syncFull", "syncLast", "syncHistory", "syncMerged", "syncFinalizing", "syncReturned", "syncFailed", "detachedEntry", "detachedReturned", "headEntry", "headPromise", "headSuccess", "cacheFailed"] as const;
export const CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS = ["localIngress", "bufferIngress", "cloudIngress", "historyCloud"] as const;
export const CURRENT_PROJECT_SAVE_PRODUCER_GROUP = "easyeda-project-save-producer209-v1";
/** Two observations per general role and three per initial cache role admit
 * the distinct two-document/index jobs. These are finite capacities, not a
 * claim that background work finishes or cannot occur again. */
export function currentProjectSaveProducerRoleLimit(role: string): number { if (role === "syncHistory") { return 4 + PERIODIC; } if (role === "syncLast") { return PERIODIC; } if (["syncEntry", "syncFull", "syncMerged", "syncFinalizing", "syncReturned"].includes(role)) { return 2 + PERIODIC; } return ["headEntry", "headPromise", "headSuccess", "cacheFailed"].includes(role) ? 3 : 2; }
export const CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS = Object.freeze({ newArms: 27, maximumRoleOccurrences: 2, frames: 66 + 7 * PERIODIC, joins: 66 + 7 * PERIODIC, properties: 66 + 7 * PERIODIC,
  intrinsics: 3 + 2 + INTRINSIC_PROFILES.length, cacheCalls: 3 * 3, cachePromises: 3 * 2, normal: 224 + 1 + 3 * (7 * PERIODIC) + 3 + 2 + INTRINSIC_PROFILES.length + 3 * 3 + 3 * 2, cleanup: 0, cdpRequests: 224 + 1 + 3 * (7 * PERIODIC) + 3 + 2 + INTRINSIC_PROFILES.length + 3 * 3 + 3 * 2, events: 66 + 7 * PERIODIC });
const GROUP = CURRENT_PROJECT_SAVE_PRODUCER_GROUP;
export const CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false, returnByValue: false } as const);
export const CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle }), role = z.enum(CURRENT_PROJECT_SAVE_PRODUCER_ROLES);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const callFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false), returnByValue: z.literal(false) };
const frameFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) };
const intrinsicSlots = [1, 2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27] as const;
const propertiesParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const cacheRoles = ["flow", "localSave", "localUpload", "syncHead", "openLocalHead", "openCloudHead"] as const;
const cacheRole = z.enum(cacheRoles);
const schemas = [
  z.strictObject({ phase: z.literal("project-save-producer-cache-promise"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.literal(CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE), arguments: z.tuple([]) }) }),
  z.strictObject({ phase: z.literal("project-save-producer-cache-promise-properties"), method: z.literal("Runtime.getProperties"), params: propertiesParams }),
  z.strictObject({ phase: z.literal("project-save-producer-cache-caller"), cacheRole, method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ ...frameFlags, callFrameId: handle, expression: z.string() }) }),
  z.strictObject({ phase: z.literal("project-save-producer-cache-receiver"), cacheRole, method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.string(), arguments: z.tuple([ref, ref, ref, ref, ref]) }) }),
  z.strictObject({ phase: z.literal("project-save-producer-cache-properties"), method: z.literal("Runtime.getProperties"), params: propertiesParams }),
  z.strictObject({ phase: z.literal("project-save-producer-intrinsics-constructors"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags, uniqueContextId: handle, functionDeclaration: z.literal(INTRINSICS.constructors.program), arguments: z.tuple([]) }) }),
  z.strictObject({ phase: z.literal("project-save-producer-intrinsics-members"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.literal(INTRINSICS.members.program), arguments: z.tuple([]) }) }),
  z.strictObject({ phase: z.literal("project-save-producer-intrinsics-reprove"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags, returnByValue: z.literal(true), objectId: handle, functionDeclaration: z.literal(INTRINSICS.reprove.program), arguments: z.tuple([]) }) }),
  z.strictObject({ phase: z.literal("project-save-producer-intrinsics-properties"), role: z.enum(["constructors", "members"]), method: z.literal("Runtime.getProperties"), params: propertiesParams }),
  z.strictObject({ phase: z.literal("project-save-producer-intrinsics-metadata"), slot: z.union(intrinsicSlots.map(index => z.literal(index))), method: z.literal("Runtime.getProperties"), params: propertiesParams }),
  z.strictObject({ phase: z.literal("project-save-producer-arm"), role, method: z.literal("Debugger.setBreakpoint"), params: z.strictObject({ location, condition: z.literal(SYNC_CONDITION).optional() }) }),
  z.strictObject({ phase: z.literal("project-save-producer-frame"), role, method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ ...frameFlags, callFrameId: handle, expression: z.string() }) }),
  z.strictObject({ phase: z.literal("project-save-producer-receiver"), role, method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.string(), arguments: z.tuple([ref, ref, ref]) }) }),
  z.strictObject({ phase: z.literal("project-save-producer-properties"), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
] as const;
const schema = z.union(schemas);
export type CurrentProjectSaveProducerCommand = z.infer<typeof schema>;
export function validateCurrentProjectSaveProducerCommand(input: unknown): CurrentProjectSaveProducerCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "project-save-producer-arm") {
    if ((command.role === "syncEntry") !== (command.params.condition === SYNC_CONDITION) || CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS.some(value => value === command.role) || command.params.location.lineNumber !== SITES[command.role].lineNumber || command.params.location.columnNumber !== SITES[command.role].columnNumber) { throw new Error("PROJECT_SAVE_PRODUCER_FIXED_ARM"); }
  } else if (command.phase === "project-save-producer-frame" && command.params.expression !== SITES[command.role].expression || command.phase === "project-save-producer-receiver" && command.params.functionDeclaration !== CALLS[command.role]) { throw new Error("PROJECT_SAVE_PRODUCER_FIXED_PROGRAM"); }
  if (command.phase === "project-save-producer-cache-caller" && command.params.expression !== CACHE_CALLERS[command.cacheRole].expression || command.phase === "project-save-producer-cache-receiver" && command.params.functionDeclaration !== CACHE_CALLS[command.cacheRole]) { throw new Error("PROJECT_SAVE_PRODUCER_FIXED_CACHE_CALLER"); }
  return freezeDeep(command);
}
export function currentProjectSaveProducerNativeCases(): readonly CurrentProjectSaveProducerCommand[] {
  const cases: unknown[] = [
    { phase: "project-save-producer-cache-promise", method: "Runtime.callFunctionOn", params: { ...CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS, objectId: "original_put_return_value", functionDeclaration: CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, arguments: [] } },
    { phase: "project-save-producer-cache-promise-properties", method: "Runtime.getProperties", params: { objectId: "original_put_promise", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "project-save-producer-intrinsics-constructors", method: "Runtime.callFunctionOn", params: { ...CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS, uniqueContextId: "original_context", functionDeclaration: INTRINSICS.constructors.program, arguments: [] } },
    { phase: "project-save-producer-intrinsics-members", method: "Runtime.callFunctionOn", params: { ...CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS, objectId: "original_constructors", functionDeclaration: INTRINSICS.members.program, arguments: [] } },
    { phase: "project-save-producer-intrinsics-reprove", method: "Runtime.callFunctionOn", params: { ...CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS, returnByValue: true, objectId: "original_members", functionDeclaration: INTRINSICS.reprove.program, arguments: [] } },
  ];
  for (const arrayRole of ["constructors", "members"]) { cases.push({ phase: "project-save-producer-intrinsics-properties", role: arrayRole, method: "Runtime.getProperties", params: { objectId: "original_array", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  for (const slot of intrinsicSlots) { cases.push({ phase: "project-save-producer-intrinsics-metadata", slot, method: "Runtime.getProperties", params: { objectId: "original_callable", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  for (const name of cacheRoles) { const site = CACHE_CALLERS[name];
    cases.push({ phase: "project-save-producer-cache-caller", cacheRole: name, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS, callFrameId: "original_cache_caller", expression: site.expression } },
      { phase: "project-save-producer-cache-receiver", cacheRole: name, method: "Runtime.callFunctionOn", params: { ...CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS, objectId: "original_cache_entry", functionDeclaration: CACHE_CALLS[name], arguments: [{ objectId: "original_project" }, { objectId: "original_wrapper" }, { objectId: "original_callback" }, { objectId: "original_intrinsics" }, { objectId: "original_cache_caller" }] } });
  }
  cases.push({ phase: "project-save-producer-cache-properties", method: "Runtime.getProperties", params: { objectId: "original_cache_receiver", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  for (const name of CURRENT_PROJECT_SAVE_PRODUCER_ROLES) {
    const site = SITES[name];
    if (!CURRENT_PROJECT_SAVE_PRODUCER_SHARED_GUARDS.some(value => value === name)) { cases.push({ phase: "project-save-producer-arm", role: name, method: "Debugger.setBreakpoint", params: { location: { scriptId: "original_script", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, ...(name === "syncEntry" ? { condition: SYNC_CONDITION } : {}) } }); }
    cases.push({ phase: "project-save-producer-frame", role: name, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS, callFrameId: "original_frame", expression: site.expression } },
      { phase: "project-save-producer-receiver", role: name, method: "Runtime.callFunctionOn", params: { ...CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS, objectId: "original_frame_array", functionDeclaration: CALLS[name], arguments: [{ objectId: "original_project" }, { objectId: "original_wrapper" }, { objectId: "original_callback" }] } });
  }
  cases.push({ phase: "project-save-producer-properties", method: "Runtime.getProperties", params: { objectId: "original_frame_array", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  return freezeDeep(cases.map(command => validateCurrentProjectSaveProducerCommand(command)));
}
