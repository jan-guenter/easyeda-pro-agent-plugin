/** Decode one actual getProperties reply on the original async return Promise.
 * Native fulfilled-state/result metadata must come from that retained pause. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const object = z.strictObject({ type: z.literal("object"), className: z.string().min(1).max(128), description: z.string().max(128), objectId: handle });
const prototype = z.strictObject({ name: z.literal("[[Prototype]]"), value: z.strictObject({ type: z.literal("object"), className: z.literal("Promise"), description: z.literal("Promise"), objectId: handle }) });
const fulfilled = z.strictObject({ name: z.literal("[[PromiseState]]"), value: z.strictObject({ type: z.literal("string"), value: z.literal("fulfilled") }) });
const result = z.strictObject({ name: z.literal("[[PromiseResult]]"), value: object });
const internal = z.tuple([prototype, fulfilled, result]);
const schema = z.strictObject({ result: z.tuple([]), internalProperties: internal });
export function captureCurrentMainStartupLibraryReturnReply(input: unknown): Readonly<{ resultObjectId: string; raw: unknown }> {
  const captured = captureCurrentPcbStringClockReply(input).value, parsed = schema.parse(captured);
  return Object.freeze({ resultObjectId: parsed.internalProperties[2].value.objectId, raw: captured });
}
