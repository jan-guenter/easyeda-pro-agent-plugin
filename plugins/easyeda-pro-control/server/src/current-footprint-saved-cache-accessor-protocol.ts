/** Closed read-only grammar. Native metadata rosters remain unqualified. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_CALLS as CALLS, CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_GROUP as GROUP } from "./current-footprint-saved-cache-accessor-probe.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}(?![\s\S])/u), session = handle.max(128);
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false),
  throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false), arguments: z.tuple([]) };
const captureParams = z.object({ ...flags, uniqueContextId: session, functionDeclaration: z.literal(CALLS.capture), returnByValue: z.literal(false) }).strict();
const recheckParams = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.recheck), returnByValue: z.literal(true) }).strict();
const propertyParams = z.object({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict();
const releaseParams = z.object({ objectGroup: z.literal(GROUP) }).strict();
const properties = (["array-properties", "constructor-properties", "match-properties", "getter-properties"] as const).map(cacheAccessorPhase =>
  z.object({ cacheAccessorPhase: z.literal(cacheAccessorPhase), method: z.literal("Runtime.getProperties"), sessionId: session, params: propertyParams }).strict());
const schema = z.discriminatedUnion("cacheAccessorPhase", [
  z.object({ cacheAccessorPhase: z.literal("capture"), method: z.literal("Runtime.callFunctionOn"), sessionId: session, params: captureParams }).strict(),
  ...properties,
  z.object({ cacheAccessorPhase: z.literal("recheck"), method: z.literal("Runtime.callFunctionOn"), sessionId: session, params: recheckParams }).strict(),
  z.object({ cacheAccessorPhase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), sessionId: session, params: releaseParams }).strict(),
]);
export type CurrentFootprintSavedCacheAccessorCommand = Readonly<z.infer<typeof schema>>;
/** Capture inert input, apply the strict seven-phase schema and freeze the result.
 * Only fixed programs, flags and object-group fields survive validation; this does
 * not check a live owner or dispatch the accepted command.
 */
export function validateCurrentFootprintSavedCacheAccessorCommand(input: unknown): CurrentFootprintSavedCacheAccessorCommand {
  return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value));
}
/** Encode one validated metadata command into its narrow native discriminator.
 * Require an integer discovery ID in 1..103 and expose only phase-specific scalar
 * slots; ordering, native ownership and once-only consumption remain the pipe's job.
 */
export function currentFootprintSavedCacheAccessorWire(input: unknown, id: number): Readonly<{
  command: CurrentFootprintSavedCacheAccessorCommand & Readonly<{ id: number }>; request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 103) { throw new Error("SAVED_CACHE_ACCESSOR_PROBE_ID"); }
  const command = validateCurrentFootprintSavedCacheAccessorCommand(input);
  return freezeDeep({ command: { id, ...command }, request: { action: "saved-cache-accessor", requestId: id, phase: command.cacheAccessorPhase,
    method: command.method, sessionId: command.sessionId, ...("uniqueContextId" in command.params ? { uniqueContextId: command.params.uniqueContextId } : {}),
    ...("objectId" in command.params ? { objectId: command.params.objectId } : {}) } });
}
