/* oxlint-disable unicorn/max-nested-calls -- The exact finite CDP schema checks every fixed nested field before dispatch. */
/** One original periodic call. Capacity comes from the original main readonly
 * request budget, not elapsed time or a claimed quiet producer frontier. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_GENERATED_PERIODIC_SYNC_PROGRAMS as PROGRAMS } from "./current-generated-periodic-sync-programs.ts";
import { CURRENT_GENERATED_PERIODIC_SYNC_CALLER as CALLER } from "./current-generated-periodic-sync-source.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE } from "./current-project-save-producer-cache-replies.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as MAIN } from "./current-selected-file-main-sql-fence-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_GENERATED_PERIODIC_SYNC_MAXIMUM = MAIN.readonlyRequestPauses / 2;
export const CURRENT_GENERATED_PERIODIC_SYNC_REQUESTS = Object.freeze({ entry: 6, full: 3, branch: 4, history: 4, merged: 2, finalizing: 2, returned: 5, settlementRetry: 2, perCall: 28, cdpRequests: 28 * CURRENT_GENERATED_PERIODIC_SYNC_MAXIMUM, events: 7 * CURRENT_GENERATED_PERIODIC_SYNC_MAXIMUM });
export const CURRENT_GENERATED_PERIODIC_SYNC_FLAGS = Object.freeze({ objectGroup: "easyeda-generated-periodic-sync209-v1", silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false, returnByValue: true } as const);
const flags = { objectGroup: z.literal(CURRENT_GENERATED_PERIODIC_SYNC_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false), returnByValue: z.literal(true) };
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const roles = ["syncEntry", "syncFull", "syncLast", "syncHistory", "syncMerged", "syncFinalizing", "syncReturned"] as const;
const schema = z.union([
  z.strictObject({ phase: z.literal("periodic-sync-caller"), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ objectGroup: z.literal(CURRENT_GENERATED_PERIODIC_SYNC_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false), callFrameId: handle, expression: z.literal(CALLER.expression) }) }),
  z.strictObject({ phase: z.literal("periodic-sync-capture"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, returnByValue: z.literal(false), objectId: handle, functionDeclaration: z.literal(PROGRAMS.capture), arguments: z.tuple([ref, ref]) }) }),
  ...(["capture", "full", "branch", "response"] as const).map(role => z.strictObject({ phase: z.literal(`periodic-sync-${role}-properties`), method: z.literal("Runtime.getProperties"), params: properties })),
  z.strictObject({ phase: z.literal("periodic-sync-callee"), slot: z.union([z.literal(0), z.literal(1)]), method: z.literal("Runtime.getProperties"), params: properties }),
  ...(["branchObjects", "responseObjects"] as const).map(role => z.strictObject({ phase: z.literal(`periodic-sync-${role}`), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, returnByValue: z.literal(false), objectId: handle, functionDeclaration: z.literal(PROGRAMS[role]), arguments: z.tuple([]) }) })),
  z.strictObject({ phase: z.literal("periodic-sync-full"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.full), arguments: z.tuple([ref]) }) }),
  z.strictObject({ phase: z.literal("periodic-sync-branch"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.branch), arguments: z.tuple([ref, ref, z.strictObject({ value: z.string().min(1).max(4096).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 4096) })]) }) }),
  ...(["history", "finalizing", "returned"] as const).map(role => z.strictObject({ phase: z.literal(`periodic-sync-${role}`), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS[role]), arguments: z.tuple([ref, ref]) }) })),
  z.strictObject({ phase: z.literal("periodic-sync-merged"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.merged), arguments: z.tuple([ref, ref, ref]) }) }),
  z.strictObject({ phase: z.literal("periodic-sync-return-promise"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, returnByValue: z.literal(false), objectId: handle, functionDeclaration: z.literal(CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE), arguments: z.tuple([]) }) }),
  z.strictObject({ phase: z.literal("periodic-sync-settled"), role: z.enum(["task", "outer"]), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("periodic-sync-resume"), role: z.enum(roles), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
]);
export type CurrentGeneratedPeriodicSyncCommand = z.infer<typeof schema>;
export function validateCurrentGeneratedPeriodicSyncCommand(input: unknown): CurrentGeneratedPeriodicSyncCommand { return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value)); }
const propertiesFor = (phase: string): Readonly<Record<string, unknown>> => ({ phase, method: "Runtime.getProperties", params: { objectId: "original_properties", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
const call = (phase: string, program: string, argumentsValue: readonly object[], byValue = true): Readonly<Record<string, unknown>> => ({ phase, method: "Runtime.callFunctionOn", params: { ...CURRENT_GENERATED_PERIODIC_SYNC_FLAGS, returnByValue: byValue, objectId: "original_frame", functionDeclaration: program, arguments: argumentsValue.map(argument => ({ ...argument })) } });
const reference = { objectId: "original_retained" };
const resume = (role: string): Readonly<Record<string, unknown>> => ({ phase: "periodic-sync-resume", role, method: "Debugger.resume", params: {} });

export function currentGeneratedPeriodicSyncNativeCases(): readonly CurrentGeneratedPeriodicSyncCommand[] {
  return freezeDeep([
    { phase: "periodic-sync-caller", method: "Debugger.evaluateOnCallFrame", params: { objectGroup: CURRENT_GENERATED_PERIODIC_SYNC_FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false, callFrameId: "original_caller", expression: CALLER.expression } },
    call("periodic-sync-capture", PROGRAMS.capture, [reference, reference], false), propertiesFor("periodic-sync-capture-properties"),
    { ...propertiesFor("periodic-sync-callee"), slot: 0 }, { ...propertiesFor("periodic-sync-callee"), slot: 1 }, resume("syncEntry"),
    propertiesFor("periodic-sync-full-properties"), call("periodic-sync-full", PROGRAMS.full, [reference]), resume("syncFull"),
    call("periodic-sync-branchObjects", PROGRAMS.branchObjects, [], false), propertiesFor("periodic-sync-branch-properties"), call("periodic-sync-branch", PROGRAMS.branch, [reference, reference, { value: "original-private-branch" }]), resume("syncLast"),
    call("periodic-sync-responseObjects", PROGRAMS.responseObjects, [], false), propertiesFor("periodic-sync-response-properties"), call("periodic-sync-history", PROGRAMS.history, [reference, reference]), resume("syncHistory"),
    call("periodic-sync-merged", PROGRAMS.merged, [reference, reference, reference]), resume("syncMerged"), call("periodic-sync-finalizing", PROGRAMS.finalizing, [reference, reference]), resume("syncFinalizing"),
    call("periodic-sync-returned", PROGRAMS.returned, [reference, reference]), call("periodic-sync-return-promise", CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, [], false), resume("syncReturned"),
    { ...propertiesFor("periodic-sync-settled"), role: "task" }, { ...propertiesFor("periodic-sync-settled"), role: "outer" },
  ].map(input => validateCurrentGeneratedPeriodicSyncCommand(input)));
}
