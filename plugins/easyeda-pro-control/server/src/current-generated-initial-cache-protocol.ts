/* oxlint-disable unicorn/max-nested-calls -- Finite fixed command shapes are compared verbatim at every native boundary. */
/** Fixed startup-cache observations and one resume for each original stage.
 * Values are supplied only by the owner’s genuine pre-open cache data plan. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_PROGRAMS as PROGRAMS } from "./current-generated-initial-cache-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS } from "./current-project-save-producer-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_GENERATED_INITIAL_CACHE_REQUESTS = Object.freeze({ jobs: 3, proofsPerJob: 3, resumesPerJob: 3, settlementPerJob: 2, cdpRequests: 3 * (3 + 3 + 2), events: 9 });
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const key = z.string().regex(/^https:\/\/client\/(?:dataStr\/[a-f0-9]{32}-[a-f0-9]{32}|index\/v1\/[a-f0-9]{32})$/u);
const body = z.string().min(1).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384);
const flags = { objectGroup: z.literal(CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false), returnByValue: z.literal(true) };
const baseSchema = z.union([
  ...(["document", "head"] as const).map(role => z.strictObject({ phase: z.literal("initial-cache-entry"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS[role]), arguments: z.tuple([z.strictObject({ value: key }), z.strictObject({ value: body })]) }) })),
  z.strictObject({ phase: z.literal("initial-cache-promise"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.promise), arguments: z.tuple([ref]) }) }),
  z.strictObject({ phase: z.literal("initial-cache-success"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.success), arguments: z.tuple([ref, ref]) }) }),
  z.strictObject({ phase: z.literal("initial-cache-resume"), role: z.enum(["headEntry", "headPromise", "headSuccess"]), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal("initial-cache-settled-properties"), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
]);
const schema = z.strictObject({ slot: z.union([z.literal(0), z.literal(1), z.literal(2)]), command: baseSchema });
export type CurrentGeneratedInitialCacheCommand = z.infer<typeof baseSchema> & Readonly<{ slot: 0 | 1 | 2 }>;
export const CURRENT_GENERATED_INITIAL_CACHE_CALL_FLAGS = Object.freeze({ ...CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS, returnByValue: true } as const);
export function validateCurrentGeneratedInitialCacheCommand(input: unknown): CurrentGeneratedInitialCacheCommand { const raw = z.looseObject({ slot: z.union([z.literal(0), z.literal(1), z.literal(2)]) }).parse(captureCurrentPcbStringClockReply(input).value); const { slot, ...command } = raw; const fixed = schema.parse({ slot, command }); return freezeDeep({ ...fixed.command, slot: fixed.slot }); }
export function currentGeneratedInitialCacheNativeCases(): readonly CurrentGeneratedInitialCacheCommand[] {
  const cases: unknown[] = [];
  for (const role of ["document", "head"] as const) { cases.push({ phase: "initial-cache-entry", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_GENERATED_INITIAL_CACHE_CALL_FLAGS, objectId: "original_entry", functionDeclaration: PROGRAMS[role], arguments: [{ value: `https://client/${role === "head" ? "index/v1/" : `dataStr/${"a".repeat(32)}-`}${"b".repeat(32)}` }, { value: "original_body" }] } }); }
  cases.push({ phase: "initial-cache-promise", method: "Runtime.callFunctionOn", params: { ...CURRENT_GENERATED_INITIAL_CACHE_CALL_FLAGS, objectId: "original_promise_frame", functionDeclaration: PROGRAMS.promise, arguments: [{ objectId: "original_entry" }] } },
    { phase: "initial-cache-success", method: "Runtime.callFunctionOn", params: { ...CURRENT_GENERATED_INITIAL_CACHE_CALL_FLAGS, objectId: "original_success_frame", functionDeclaration: PROGRAMS.success, arguments: [{ objectId: "original_entry" }, { objectId: "original_promise_frame" }] } },
    { phase: "initial-cache-settled-properties", method: "Runtime.getProperties", params: { objectId: "original_promise", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  for (const role of ["headEntry", "headPromise", "headSuccess"]) { cases.push({ phase: "initial-cache-resume", role, method: "Debugger.resume", params: {} }); }
  return freezeDeep(([0, 1, 2] as const).flatMap(slot => cases.map(command => { if (command === null || typeof command !== "object") { throw new Error("INITIAL_CACHE_CASE"); } return validateCurrentGeneratedInitialCacheCommand({ ...command, slot }); })));
}
