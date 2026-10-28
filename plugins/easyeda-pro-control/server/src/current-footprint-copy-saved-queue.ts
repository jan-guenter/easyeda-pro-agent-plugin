/** Fixed parent-context upload-cache probe for the distinct saved generation.
 * CacheStorage.match never creates or deletes either namespace. */
import { z } from "zod";
import { CURRENT_UPLOAD_QUEUE_MAX_BYTES, buildCurrentUploadQueueReadExpression,
  validateCurrentUploadQueueReadResult } from "./current-upload-queue-read.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const placeholder = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) });
const expression = buildCurrentUploadQueueReadExpression(placeholder);
const needle = `const target=${JSON.stringify(placeholder)},root=globalThis,apply=Reflect.apply;`;
if (expression.split(needle).length !== 2) { throw new Error("FOOTPRINT_SAVED_QUEUE_TEMPLATE"); }
export const CURRENT_FOOTPRINT_COPY_SAVED_QUEUE_FUNCTION = `async function(projectUuid,branchUuid){return JSON.stringify(await ${
  expression.replace(needle, "const target={projectUuid,branchUuid},root=globalThis,apply=Reflect.apply;")});}`;
const context = z.string().min(1).max(128).regex(/^[A-Za-z\d_.:-]+$(?![\s\S])/u);
const scopeSchema = z.object({ sessionId: context, uniqueContextId: context,
  projectUuid: z.string().length(64).regex(/^[a-f\d]{64}$/u), branchUuid: z.string().length(32).regex(/^[a-f\d]{32}$/u) }).strict();
export interface CurrentFootprintCopySavedQueueCommand {
  readonly method: "Runtime.callFunctionOn"; readonly sessionId: string;
  readonly params: Readonly<{ uniqueContextId: string; functionDeclaration: string;
    arguments: readonly [Readonly<{ value: string }>, Readonly<{ value: string }>]; returnByValue: true; awaitPromise: true;
    silent: true; userGesture: false; objectGroup: "easyeda-footprint-copy-saved-queue-v1"; generatePreview: false; throwOnSideEffect: false }>;
}
export function currentFootprintCopySavedQueueCommand(input: z.infer<typeof scopeSchema>): CurrentFootprintCopySavedQueueCommand {
  const scope = scopeSchema.parse(captureCurrentPcbStringClockReply(input).value);
  return freezeDeep({ method: "Runtime.callFunctionOn" as const, sessionId: scope.sessionId, params: {
    uniqueContextId: scope.uniqueContextId, functionDeclaration: CURRENT_FOOTPRINT_COPY_SAVED_QUEUE_FUNCTION,
    arguments: [{ value: scope.projectUuid }, { value: scope.branchUuid }] as const, returnByValue: true as const,
    awaitPromise: true as const, silent: true as const, userGesture: false as const,
    objectGroup: "easyeda-footprint-copy-saved-queue-v1", generatePreview: false as const, throwOnSideEffect: false as const,
  } });
}
export function decodeCurrentFootprintCopySavedQueueReply(input: unknown, expected: Readonly<{ projectUuid: string; branchUuid: string }>): Readonly<Record<string, unknown>> {
  const envelope = z.object({ result: z.object({ type: z.literal("string"), value: z.string().min(1).max(CURRENT_UPLOAD_QUEUE_MAX_BYTES) }).strict() }).strict()
    .parse(captureCurrentPcbStringClockReply(input).value);
  if (Buffer.byteLength(envelope.result.value) > CURRENT_UPLOAD_QUEUE_MAX_BYTES) { throw new Error("FOOTPRINT_SAVED_QUEUE_REPLY_BOUND"); }
  return validateCurrentUploadQueueReadResult(JSON.parse(envelope.result.value) as unknown, expected);
}
