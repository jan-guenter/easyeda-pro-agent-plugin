/** Closed read-only grammar. Native metadata rosters remain unqualified. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_SAVED_CACHE_PROBE_CALLS as CALLS, CURRENT_FOOTPRINT_SAVED_CACHE_PROBE_GROUP as GROUP } from "./current-footprint-saved-cache-probe.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}(?![\s\S])/u), session = handle.max(128);
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false),
  throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false), arguments: z.tuple([]) };
const captureParams = z.object({ ...flags, uniqueContextId: session, functionDeclaration: z.literal(CALLS.capture), returnByValue: z.literal(false) }).strict();
const recheckParams = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.recheck), returnByValue: z.literal(true) }).strict();
const propertyParams = z.object({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict();
const releaseParams = z.object({ objectGroup: z.literal(GROUP) }).strict();
const properties = (["array-properties", "constructor-properties", "match-properties"] as const).map(cacheNativePhase =>
  z.object({ cacheNativePhase: z.literal(cacheNativePhase), method: z.literal("Runtime.getProperties"), sessionId: session, params: propertyParams }).strict());
const schema = z.discriminatedUnion("cacheNativePhase", [
  z.object({ cacheNativePhase: z.literal("capture"), method: z.literal("Runtime.callFunctionOn"), sessionId: session, params: captureParams }).strict(),
  ...properties,
  z.object({ cacheNativePhase: z.literal("recheck"), method: z.literal("Runtime.callFunctionOn"), sessionId: session, params: recheckParams }).strict(),
  z.object({ cacheNativePhase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), sessionId: session, params: releaseParams }).strict(),
]);
export type CurrentFootprintSavedCacheCommand = Readonly<z.infer<typeof schema>>;
export function validateCurrentFootprintSavedCacheCommand(input: unknown): CurrentFootprintSavedCacheCommand {
  return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value));
}
export function currentFootprintSavedCacheWire(input: unknown, id: number): Readonly<{
  command: CurrentFootprintSavedCacheCommand & Readonly<{ id: number }>; request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 103) { throw new Error("SAVED_CACHE_NATIVE_PROBE_ID"); }
  const command = validateCurrentFootprintSavedCacheCommand(input);
  return freezeDeep({ command: { id, ...command }, request: { action: "saved-cache-native", requestId: id, phase: command.cacheNativePhase,
    method: command.method, sessionId: command.sessionId, ...("uniqueContextId" in command.params ? { uniqueContextId: command.params.uniqueContextId } : {}),
    ...("objectId" in command.params ? { objectId: command.params.objectId } : {}) } });
}
