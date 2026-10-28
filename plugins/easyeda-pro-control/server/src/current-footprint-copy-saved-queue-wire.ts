/** Fixed saved-generation parent cache probe; no caller program or target
 * selection reaches the native helper through this encoder. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_SAVED_QUEUE_FUNCTION } from "./current-footprint-copy-saved-queue.ts";
import type { CurrentFootprintCopySavedQueueCommand } from "./current-footprint-copy-saved-queue.ts";
import { CURRENT_FOOTPRINT_COPY_SAVED_PROFILE } from "./current-footprint-copy-saved-profile.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentFootprintCopySavedQueueChannelCommand = CurrentFootprintCopySavedQueueCommand & Readonly<{ phase: "saved-upload-queue" }>;
const context = z.string().regex(/^[A-Za-z\d_.:-]{1,128}(?![\s\S])/u);
const project = z.object({ value: z.string().regex(/^[a-f\d]{64}(?![\s\S])/u) }).strict();
const branch = z.object({ value: z.string().regex(/^[a-f\d]{32}(?![\s\S])/u) }).strict();
const params = z.object({ uniqueContextId: context, functionDeclaration: z.literal(CURRENT_FOOTPRINT_COPY_SAVED_QUEUE_FUNCTION),
  arguments: z.tuple([project, branch]), returnByValue: z.literal(true), awaitPromise: z.literal(true), silent: z.literal(true),
  userGesture: z.literal(false), objectGroup: z.literal("easyeda-footprint-copy-saved-queue-v1"),
  generatePreview: z.literal(false), throwOnSideEffect: z.literal(false) }).strict();
const schema = z.object({ phase: z.literal("saved-upload-queue"), method: z.literal("Runtime.callFunctionOn"), sessionId: context, params }).strict();
export function currentFootprintCopySavedQueueWire(input: unknown, id: number): Readonly<{
  command: CurrentFootprintCopySavedQueueChannelCommand & Readonly<{ id: number }>;
  request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > CURRENT_FOOTPRINT_COPY_SAVED_PROFILE.requestLimit) { throw new Error("FOOTPRINT_SAVED_QUEUE_REQUEST_ID"); }
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  return freezeDeep({ command: { ...command, id }, request: { action: "footprint-saved-upload-queue", method: command.method, requestId: id,
    uniqueContextId: command.params.uniqueContextId, projectUuid: command.params.arguments[0].value, branchUuid: command.params.arguments[1].value } });
}
