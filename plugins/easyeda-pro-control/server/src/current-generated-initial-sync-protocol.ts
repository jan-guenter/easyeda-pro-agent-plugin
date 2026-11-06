/* oxlint-disable unicorn/max-nested-calls -- The finite schema mirrors exact nested CDP arguments; every literal is checked before dispatch. */
/** One finite original startup sync, including all four same-head replies. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_PROGRAMS as PROGRAMS } from "./current-generated-initial-sync-programs.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_CALLER as CALLER, CURRENT_GENERATED_INITIAL_SYNC_MODULE_EXPRESSION as MODULE } from "./current-generated-initial-sync-source.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE } from "./current-project-save-producer-cache-replies.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_GENERATED_INITIAL_SYNC_REQUESTS = Object.freeze({ capture: 14, entryResume: 1, full: 3, histories: 8, merged: 2, finalizing: 2, returned: 5, settlementRetry: 2, cdpRequests: 37, events: 9 });
export const CURRENT_GENERATED_INITIAL_SYNC_FLAGS = Object.freeze({ objectGroup: "easyeda-generated-initial-sync209-v1", silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false, returnByValue: true } as const);
const flags = { objectGroup: z.literal(CURRENT_GENERATED_INITIAL_SYNC_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false), returnByValue: z.literal(true) };
const frameFlags = { objectGroup: z.literal(CURRENT_GENERATED_INITIAL_SYNC_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false), returnByValue: z.literal(false) };
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const roles = ["syncEntry", "syncFull", "syncHistory1", "syncHistory2", "syncHistory3", "syncHistory4", "syncMerged", "syncFinalizing", "syncReturned"] as const;
const slot = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7), z.literal(8), z.literal(9)]);
const ordinal = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]);
const schema = z.union([
  ...(["module", "caller"] as const).map(role => z.strictObject({ phase: z.literal(`initial-sync-${role}`), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ ...frameFlags, callFrameId: handle, expression: z.literal(role === "module" ? MODULE : CALLER.expression) }) })),
  z.strictObject({ phase: z.literal("initial-sync-capture"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, returnByValue: z.literal(false), objectId: handle, functionDeclaration: z.literal(PROGRAMS.capture), arguments: z.tuple([ref, ref, ref, ref, z.strictObject({ value: z.string().regex(/^https:\/\/client\/index\/v1\/[a-f\d]{32}$/u) }), z.strictObject({ value: z.string().min(1).max(8192).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 8192) })]) }) }),
  ...(["capture-properties", "full-properties"] as const).map(role => z.strictObject({ phase: z.literal(`initial-sync-${role}`), method: z.literal("Runtime.getProperties"), params: properties })),
  z.strictObject({ phase: z.literal("initial-sync-callee"), slot, method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("initial-sync-full"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.full), arguments: z.tuple([ref]) }) }),
  z.strictObject({ phase: z.literal("initial-sync-history"), ordinal, method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.history), arguments: z.tuple([ref, ref, z.strictObject({ value: ordinal })]) }) }),
  z.strictObject({ phase: z.literal("initial-sync-merged"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.merged), arguments: z.tuple([ref, ref, ref]) }) }),
  ...(["finalizing", "returned"] as const).map(role => z.strictObject({ phase: z.literal(`initial-sync-${role}`), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS[role]), arguments: z.tuple([ref, ref]) }) })),
  z.strictObject({ phase: z.literal("initial-sync-return-promise"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, returnByValue: z.literal(false), objectId: handle, functionDeclaration: z.literal(CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE), arguments: z.tuple([]) }) }),
  z.strictObject({ phase: z.literal("initial-sync-settled"), role: z.enum(["task", "outer"]), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("initial-sync-resume"), role: z.enum(roles), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
]);
export type CurrentGeneratedInitialSyncCommand = z.infer<typeof schema>;
export function validateCurrentGeneratedInitialSyncCommand(input: unknown): CurrentGeneratedInitialSyncCommand {
  const fixed = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (fixed.phase === "initial-sync-history" && fixed.params.arguments[2].value !== fixed.ordinal) { throw new Error("INITIAL_SYNC_RESPONSE_ORDINAL"); }
  return freezeDeep(fixed);
}
const refValue = (): Readonly<{ objectId: string }> => ({ objectId: "original_object" });
export function currentGeneratedInitialSyncNativeCases(): readonly CurrentGeneratedInitialSyncCommand[] {
  const frame = { objectGroup: CURRENT_GENERATED_INITIAL_SYNC_FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false };
  const propertiesParams = { objectId: "original_object", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false };

  const cases: unknown[] = [
    { phase: "initial-sync-module", method: "Debugger.evaluateOnCallFrame", params: { ...frame, callFrameId: "original_entry", expression: MODULE } },
    { phase: "initial-sync-caller", method: "Debugger.evaluateOnCallFrame", params: { ...frame, callFrameId: "original_caller", expression: CALLER.expression } },
    { phase: "initial-sync-capture", method: "Runtime.callFunctionOn", params: { ...CURRENT_GENERATED_INITIAL_SYNC_FLAGS, returnByValue: false, objectId: "original_entry", functionDeclaration: PROGRAMS.capture, arguments: [refValue(), refValue(), refValue(), refValue(), { value: `https://client/index/v1/${"a".repeat(32)}` }, { value: "original_body" }] } },
    { phase: "initial-sync-capture-properties", method: "Runtime.getProperties", params: propertiesParams },
  ];
  for (let index = 0; index < 10; index += 1) { cases.push({ phase: "initial-sync-callee", slot: index, method: "Runtime.getProperties", params: propertiesParams }); }
  cases.push({ phase: "initial-sync-resume", role: "syncEntry", method: "Debugger.resume", params: {} },
    { phase: "initial-sync-full-properties", method: "Runtime.getProperties", params: propertiesParams },
    { phase: "initial-sync-full", method: "Runtime.callFunctionOn", params: { ...CURRENT_GENERATED_INITIAL_SYNC_FLAGS, objectId: "original_full", functionDeclaration: PROGRAMS.full, arguments: [refValue()] } },
    { phase: "initial-sync-resume", role: "syncFull", method: "Debugger.resume", params: {} });
  for (const index of [1, 2, 3, 4] as const) { cases.push({ phase: "initial-sync-history", ordinal: index, method: "Runtime.callFunctionOn", params: { ...CURRENT_GENERATED_INITIAL_SYNC_FLAGS, objectId: "original_history", functionDeclaration: PROGRAMS.history, arguments: [refValue(), refValue(), { value: index }] } },
    { phase: "initial-sync-resume", role: `syncHistory${String(index)}`, method: "Debugger.resume", params: {} }); }
  cases.push({ phase: "initial-sync-merged", method: "Runtime.callFunctionOn", params: { ...CURRENT_GENERATED_INITIAL_SYNC_FLAGS, objectId: "original_merged", functionDeclaration: PROGRAMS.merged, arguments: [refValue(), refValue(), refValue()] } },
    { phase: "initial-sync-resume", role: "syncMerged", method: "Debugger.resume", params: {} },
    { phase: "initial-sync-finalizing", method: "Runtime.callFunctionOn", params: { ...CURRENT_GENERATED_INITIAL_SYNC_FLAGS, objectId: "original_finalizing", functionDeclaration: PROGRAMS.finalizing, arguments: [refValue(), refValue()] } },
    { phase: "initial-sync-resume", role: "syncFinalizing", method: "Debugger.resume", params: {} },
    { phase: "initial-sync-returned", method: "Runtime.callFunctionOn", params: { ...CURRENT_GENERATED_INITIAL_SYNC_FLAGS, objectId: "original_returned", functionDeclaration: PROGRAMS.returned, arguments: [refValue(), refValue()] } },
    { phase: "initial-sync-return-promise", method: "Runtime.callFunctionOn", params: { ...CURRENT_GENERATED_INITIAL_SYNC_FLAGS, returnByValue: false, objectId: "original_outer", functionDeclaration: CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, arguments: [] } },
    { phase: "initial-sync-resume", role: "syncReturned", method: "Debugger.resume", params: {} });
  for (const role of ["task", "outer"]) { cases.push({ phase: "initial-sync-settled", role, method: "Runtime.getProperties", params: propertiesParams }); }
  return freezeDeep(cases.map(value => validateCurrentGeneratedInitialSyncCommand(value)));
}
