/* oxlint-disable unicorn/max-nested-calls -- Strict fixed command shapes must retain exact literal field/argument order for native parity. */
/** Separate saved-footprint startup cache vocabulary, at most eight jobs.
 * Slot/data authority belongs to the original owner; no generated issuer or
 * three-job grammar is widened. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-initial-cache-programs.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CALL_FLAGS as FLAGS, currentProjectSaveProducerNativeCases, validateCurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import type { CurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_ROLES = Object.freeze(["headEntry", "headPromise", "headSuccess"] as const);
export type CurrentFootprintInverseInitialCacheRole = typeof CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_ROLES[number];
export function currentFootprintInverseInitialCacheBudget(jobs: number): Readonly<{ jobs: number; captureNormal: number; cursorNormal: number; normal: number; helperSources: number; cdpRequests: number; holds: number; controls: number }> {
  if (!Number.isSafeInteger(jobs) || jobs < 2 || jobs > 8) { throw new Error("FOOTPRINT_INVERSE_INITIAL_CACHE_JOB_BOUND"); }
  // Entry8+5helper, Promise7+4helper, success5+3helper; two native
  // Fulfillment samples per job. Every put has three role-bound resumes.
  return Object.freeze({ jobs, captureNormal:14*jobs, cursorNormal:8*jobs, normal: 22 * jobs, helperSources: 12 * jobs, cdpRequests: 34 * jobs, holds: 3 * jobs, controls: 37 * jobs + 2 });
}
export const CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_REQUESTS = currentFootprintInverseInitialCacheBudget(8);
export const CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_FLAGS = Object.freeze({ ...FLAGS, returnByValue: true } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const value = <T extends z.ZodType>(type: T): z.ZodObject<{ value: T }> => z.strictObject({ value: type });
const key = z.string().regex(/^https:\/\/client\/(?:index\/v1\/[a-f\d]{32}|dataStr\/[a-f\d]{32}(?:-[1-7])?-(?:[a-f\d]{16}|[a-f\d]{32}|SYMBOL|FOOTPRINT|BLOB|FONT|PANEL_LIB|DEVICE|BOARD|INSTANCE|CONFIG|VARIANT|COMPONENT_GROUP|COMPONENT_GROUP_DATA))$/u);
const body = z.string().min(1).max(8192).refine(text => text.isWellFormed() && Buffer.byteLength(text) <= 8192);
const flags = { objectGroup: z.literal(FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false), returnByValue: z.literal(true) };
const scalar = z.number().int().min(0).max(8192), shallow = z.number().int().min(0).max(32);
const continuation = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("inverse-initial-cache-flow"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.flow), arguments: z.tuple([value(key), value(body)]) }) }),
  z.strictObject({ phase: z.literal("inverse-initial-cache-head"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.head), arguments: z.tuple([value(key), value(body), value(scalar.min(1)), value(shallow), value(shallow), value(shallow), value(scalar)]) }) }),
  z.strictObject({ phase: z.literal("inverse-initial-cache-promise"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.promise), arguments: z.tuple([ref]) }) }),
  z.strictObject({ phase: z.literal("inverse-initial-cache-success"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(PROGRAMS.success), arguments: z.tuple([ref, ref]) }) }),
  z.strictObject({ phase: z.literal("inverse-initial-cache-resume"), role: z.enum(CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_ROLES), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal("inverse-initial-cache-settled"), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
]);
const slotted = z.strictObject({ slot: z.number().int().min(0).max(7), command: continuation });
const helper = z.strictObject({ phase: z.literal("inverse-initial-cache-helper"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) });
export type CurrentFootprintInverseInitialCacheCommand = CurrentProjectSaveProducerCommand | (z.infer<typeof continuation> & Readonly<{ slot: number }>) | z.infer<typeof helper>;
function observation(command: CurrentProjectSaveProducerCommand): boolean {
  if (command.phase === "project-save-producer-frame" || command.phase === "project-save-producer-receiver") { return CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_ROLES.some(role => role === command.role); }
  if (command.phase === "project-save-producer-cache-caller" || command.phase === "project-save-producer-cache-receiver") { return command.cacheRole === "flow" || command.cacheRole === "openCloudHead"; }
  return command.phase === "project-save-producer-properties" || command.phase === "project-save-producer-cache-properties" || command.phase === "project-save-producer-cache-promise" || command.phase === "project-save-producer-cache-promise-properties";
}
export function validateCurrentFootprintInverseInitialCacheCommand(input: unknown): CurrentFootprintInverseInitialCacheCommand {
  const raw = captureCurrentPcbStringClockReply(input).value; const base = z.looseObject({ phase: z.string() }).parse(raw);
  if (base.phase === "inverse-initial-cache-helper") { return freezeDeep(helper.parse(raw)); }
  if (base.phase.startsWith("inverse-initial-cache-")) { const { slot, ...command } = z.looseObject({ slot: z.number().int().min(0).max(7) }).parse(raw); const parsed = slotted.parse({ slot, command }); return freezeDeep({ ...parsed.command, slot }); }
  const command = validateCurrentProjectSaveProducerCommand(raw); if (!observation(command)) { throw new Error("FOOTPRINT_INVERSE_INITIAL_CACHE_FIXED_ONLY"); } return command;
}
export function currentFootprintInverseInitialCacheCases(): readonly CurrentFootprintInverseInitialCacheCommand[] {
  const examples: unknown[] = [
    { phase: "inverse-initial-cache-flow", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_FLAGS, objectId: "initial_entry", functionDeclaration: PROGRAMS.flow, arguments: [{ value: `https://client/dataStr/${"a".repeat(32)}-1-FOOTPRINT` }, { value: "original_body" }] } },
    { phase: "inverse-initial-cache-head", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_FLAGS, objectId: "initial_entry", functionDeclaration: PROGRAMS.head, arguments: [{ value: `https://client/index/v1/${"b".repeat(32)}` }, { value: "original_body" }, ...[128, 7, 17, 20, 1024].map(number => ({ value: number }))] } },
    { phase: "inverse-initial-cache-promise", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_FLAGS, objectId: "initial_pending", functionDeclaration: PROGRAMS.promise, arguments: [{ objectId: "initial_entry" }] } },
    { phase: "inverse-initial-cache-success", method: "Runtime.callFunctionOn", params: { ...CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_FLAGS, objectId: "initial_success", functionDeclaration: PROGRAMS.success, arguments: [{ objectId: "initial_entry" }, { objectId: "initial_pending" }] } },
    { phase: "inverse-initial-cache-settled", method: "Runtime.getProperties", params: { objectId: "initial_promise", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    ...CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_ROLES.map(role => ({ phase: "inverse-initial-cache-resume", role, method: "Debugger.resume", params: {} })),
  ];
  const result: CurrentFootprintInverseInitialCacheCommand[] = currentProjectSaveProducerNativeCases().filter(command => observation(command));
  for (let slot = 0; slot < 8; slot += 1) { for (const item of examples) { const plain = z.record(z.string(), z.unknown()).parse(item); result.push(validateCurrentFootprintInverseInitialCacheCommand({ ...plain, slot })); } }
  result.push({ phase: "inverse-initial-cache-helper", method: "Debugger.getScriptSource", params: { scriptId: "initial_helper" } }); return freezeDeep(result);
}
