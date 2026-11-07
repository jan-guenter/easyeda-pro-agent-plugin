/** Read the actual returnValue and V8 metadata of the original async put.
 * A pending Promise is retained evidence, never completion or a resume grant. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

export const CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE = 'function(){"use strict";return this;}';
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const promise = z.strictObject({ type: z.literal("object"), subtype: z.literal("promise"), className: z.literal("Promise"), description: z.literal("Promise"), objectId: handle });
const value = z.union([
  z.strictObject({ type: z.literal("object"), className: z.literal("Promise"), description: z.literal("Promise"), objectId: handle }),
  z.strictObject({ type: z.literal("string"), value: z.enum(["pending", "fulfilled"]) }),
  z.strictObject({ type: z.literal("undefined") }),
]);
const property = z.strictObject({ name: z.enum(["[[Prototype]]", "[[PromiseState]]", "[[PromiseResult]]"]), value });
const metadata = z.strictObject({ result: z.tuple([]), internalProperties: z.array(property).length(3) });
export function currentProjectSaveProducerCachePromiseHandle(input: unknown): string {
  return promise.parse(captureCurrentPcbStringClockReply(input).value).objectId;
}
export function decodeCurrentProjectSaveProducerCachePromise(input: unknown): "pending" | "fulfilled" {
  const fields = new Map(metadata.parse(captureCurrentPcbStringClockReply(input).value).internalProperties.map(field => [field.name, field.value]));
  const parent = fields.get("[[Prototype]]"), result = fields.get("[[PromiseResult]]"), state = fields.get("[[PromiseState]]");
  if (fields.size !== 3 || parent?.type !== "object" || state?.type !== "string" || result?.type !== "undefined") { throw new Error("PROJECT_SAVE_PRODUCER_ORIGINAL_CACHE_PROMISE"); }
  return state.value;
}
