/** Closed private vocabulary for one held native cache tuple. Schema acceptance
 * neither chooses a native owner nor authorizes direct caller execution.
 */
import { z } from "zod";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_CALLS as CALLS } from "./current-footprint-saved-cache-held-programs.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_GROUP as GROUP } from "./current-footprint-saved-cache-held-profile.ts";
import { currentFootprintSavedCacheHeldHandleSchema } from "./current-footprint-saved-cache-held-metadata.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = currentFootprintSavedCacheHeldHandleSchema, session = handle.max(128);
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), userGesture: z.literal(false) };
const emptyArguments = z.tuple([]);
const propertyParams = z.object({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }).strict();
const properties = (["array-properties", "constructor-properties", "match-properties", "getter-properties"] as const).map(heldCachePhase =>
  z.object({ heldCachePhase: z.literal(heldCachePhase), method: z.literal("Runtime.getProperties"), sessionId: session, params: propertyParams }).strict());
const rechecks = (["recheck-before-getter", "recheck-first", "recheck-fresh"] as const).map(heldCachePhase => {
  const program = { "recheck-before-getter": CALLS.recheckBeforeGetter, "recheck-first": CALLS.recheckFirst, "recheck-fresh": CALLS.recheckFresh }[heldCachePhase];
  const params = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(program), arguments: emptyArguments,
    throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), returnByValue: z.literal(true) }).strict();
  return z.object({ heldCachePhase: z.literal(heldCachePhase), method: z.literal("Runtime.callFunctionOn"), sessionId: session,
    params }).strict();
});
const projectArgument = z.object({ value: z.string().regex(/^[a-f\d]{64}(?![\s\S])/u) }).strict();
const branchArgument = z.object({ value: z.string().regex(/^[a-f\d]{32}(?![\s\S])/u) }).strict();
const queueArguments = z.tuple([projectArgument, branchArgument]);
const queues = (["queue-first", "queue-fresh"] as const).map(heldCachePhase => {
  const params = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(heldCachePhase === "queue-first" ? CALLS.first : CALLS.fresh),
    arguments: queueArguments, throwOnSideEffect: z.literal(false), awaitPromise: z.literal(true), returnByValue: z.literal(true) }).strict();
  return z.object({ heldCachePhase: z.literal(heldCachePhase), method: z.literal("Runtime.callFunctionOn"), sessionId: session, params }).strict();
});
const captureParams = z.object({ ...flags, uniqueContextId: session, functionDeclaration: z.literal(CALLS.capture), arguments: emptyArguments,
  throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), returnByValue: z.literal(false) }).strict();
const capture = z.object({ heldCachePhase: z.literal("capture"), method: z.literal("Runtime.callFunctionOn"), sessionId: session, params: captureParams }).strict();
const receiverParams = z.object({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.retainReceiver), arguments: emptyArguments,
  throwOnSideEffect: z.literal(false), awaitPromise: z.literal(false), returnByValue: z.literal(true) }).strict();
const receiver = z.object({ heldCachePhase: z.literal("retain-receiver"), method: z.literal("Runtime.callFunctionOn"), sessionId: session, params: receiverParams }).strict();
const releaseParams = z.object({ objectGroup: z.literal(GROUP) }).strict();
const release = z.object({ heldCachePhase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), sessionId: session, params: releaseParams }).strict();
const schema = z.discriminatedUnion("heldCachePhase", [capture, ...properties, ...rechecks, receiver, ...queues, release]);
export type CurrentFootprintSavedCacheHeldCommand = Readonly<z.infer<typeof schema>>;

/** Capture bounded inert input, reject unknown or nonfixed code/flags, and freeze
 * the exact accepted command. Ordering and original ownership belong to the
 * unmounted runner and its future native issuer, not this data decoder.
 */
export function validateCurrentFootprintSavedCacheHeldCommand(input: unknown): CurrentFootprintSavedCacheHeldCommand {
  return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value));
}
