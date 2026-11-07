/* oxlint-disable unicorn/max-nested-calls -- Finite fixed command shapes are compared verbatim at every native boundary. */
/** Fixed startup-cache observations and one resume for each original stage.
 * Values are supplied only by the owner’s genuine pre-open cache data plan. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_INITIAL_CACHE_PROGRAMS as PROGRAMS } from "./current-footprint-initial-cache-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS } from "./current-project-save-producer-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INITIAL_CACHE_REQUESTS = Object.freeze({ jobs: 8, proofsPerJob: 3, resumesPerJob: 3, settlementPerJob: 2, cursorRequests: 8 * (3 + 3 + 2), helperSources: 8 * 3, cdpRequests: 8 * (3 + 3 + 2 + 3), events: 8 * 3 });
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const key = z.string().regex(/^https:\/\/client\/(?:dataStr\/[a-f0-9]{32}-(?:[1-7]-)?(?:[a-f0-9]{16}|[a-f0-9]{32}|SYMBOL|FOOTPRINT|BLOB|FONT|PANEL_LIB|DEVICE|BOARD|INSTANCE|CONFIG|VARIANT|COMPONENT_GROUP|COMPONENT_GROUP_DATA)|index\/v1\/[a-f0-9]{32})$/u);
const body = z.string().min(1).max(8192).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 8192);
const flags = { objectGroup: z.literal("easyeda-footprint-inverse-initial-cache-v1"), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false), returnByValue: z.literal(true) };
const baseSchema = z.union([
  ...(["document", "head"] as const).map(role => z.strictObject({ phase: z.literal("footprint-initial-cache-entry"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS[role]), arguments: z.tuple([z.strictObject({ value: key }), z.strictObject({ value: body })]) }) })),
  z.strictObject({ phase: z.literal("footprint-initial-cache-promise"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.promise), arguments: z.tuple([ref]) }) }),
  z.strictObject({ phase: z.literal("footprint-initial-cache-success"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.success), arguments: z.tuple([ref, ref]) }) }),
  z.strictObject({ phase: z.literal("footprint-initial-cache-resume"), role: z.enum(["headEntry", "headPromise", "headSuccess"]), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal("footprint-initial-cache-helper"), role: z.enum(["document", "head", "promise", "success"]), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("footprint-initial-cache-settled-properties"), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
]);
const schema = z.strictObject({ slot: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7)]), command: baseSchema });
export type CurrentFootprintInitialCacheCommand = z.infer<typeof baseSchema> & Readonly<{ slot: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 }>;
export const CURRENT_FOOTPRINT_INITIAL_CACHE_CALL_FLAGS = Object.freeze({ ...CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS, objectGroup: "easyeda-footprint-inverse-initial-cache-v1", returnByValue: true } as const);
export function validateCurrentFootprintInitialCacheCommand(input: unknown): CurrentFootprintInitialCacheCommand { const raw = z.looseObject({ slot: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7)]) }).parse(captureCurrentPcbStringClockReply(input).value); const { slot, ...command } = raw; const fixed = schema.parse({ slot, command }); return freezeDeep({ ...fixed.command, slot: fixed.slot }); }
export function currentFootprintInitialCacheNativeCases(): readonly CurrentFootprintInitialCacheCommand[] {
  const cases: unknown[] = [];
  for (const role of ["document", "head"] as const) { cases.push({ phase: "footprint-initial-cache-entry", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INITIAL_CACHE_CALL_FLAGS, objectId: "original_entry", functionDeclaration: PROGRAMS[role], arguments: [{ value: `https://client/${role === "head" ? "index/v1/" : `dataStr/${"a".repeat(32)}-`}${"b".repeat(32)}` }, { value: "original_body" }] } }); }
  cases.push({ phase: "footprint-initial-cache-promise", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INITIAL_CACHE_CALL_FLAGS, objectId: "original_promise_frame", functionDeclaration: PROGRAMS.promise, arguments: [{ objectId: "original_entry" }] } },
    { phase: "footprint-initial-cache-success", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INITIAL_CACHE_CALL_FLAGS, objectId: "original_success_frame", functionDeclaration: PROGRAMS.success, arguments: [{ objectId: "original_entry" }, { objectId: "original_promise_frame" }] } },
    { phase: "footprint-initial-cache-settled-properties", method: "Runtime.getProperties", params: { objectId: "original_promise", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  for (const role of ["document", "head", "promise", "success"]) { cases.push({ phase: "footprint-initial-cache-helper", role, method: "Debugger.getScriptSource", params: { scriptId: "original_helper_script" } }); }
  for (const role of ["headEntry", "headPromise", "headSuccess"]) { cases.push({ phase: "footprint-initial-cache-resume", role, method: "Debugger.resume", params: {} }); }
  return freezeDeep(([0, 1, 2, 3, 4, 5, 6, 7] as const).flatMap(slot => cases.map(command => { if (command === null || typeof command !== "object") { throw new Error("INITIAL_CACHE_CASE"); } return validateCurrentFootprintInitialCacheCommand({ ...command, slot }); })));
}
