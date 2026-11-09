/** A positive original worker timer ID is bounded evidence only. No decoded
 * number grants timer cancellation, delivery, SDK or Save completion. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const timer = z.strictObject({ result: z.strictObject({ type: z.literal("number"), value: z.number().int().min(1).max(2_147_483_647), description: z.string().max(10).optional() }) });
/** Accept only the canonical finite positive ID returned by the fixed
 * introduction/clear proof; exception and remote-handle envelopes refuse. */
export function currentSchematicRelevanceModifyReturnTimer(input: unknown): number { const result = timer.parse(captureCurrentPcbStringClockReply(input).value).result; if (result.description !== undefined && result.description !== String(result.value)) { throw new Error("SCH_MODIFY_RETURN_TIMER_DESCRIPTION"); } return result.value; }
