/** Local-only publication for the existing sixteen-event validation boundary.
 * The index must hold its serialized recovery gate. This entry never allocates
 * a runtime, restores process ownership or exposes legacy recovery actions.
 */
import { z } from "zod";
import { abandonClosedSymbolBeforeNavigation } from "./closed-symbol-abandonment.ts";
import type { ClosedSymbolAbandonmentInspection } from "./closed-symbol-abandonment.ts";

export const historicalAbandonmentRequestSchema = z.object({
  action: z.literal("abandon-before-navigation"),
  operationId: z.string().regex(/^easyeda-[a-z0-9-]{8,96}$/u),
  confirmation: z.string().max(160),
}).strict().refine(
  (request) => request.confirmation === `${request.operationId}:abandoned-before-navigation`,
  { message: "confirmation must exactly equal operationId:abandoned-before-navigation.", path: ["confirmation"] },
);

export type HistoricalAbandonmentRequest = z.infer<typeof historicalAbandonmentRequestSchema>;

/** Preserve the maintained qualification, unchanged-source proof and sidecar.
 * Six-event baseline abandonment remains on the retained legacy route, where
 * its original-entry-return reservation is checked separately.
 */
export async function runHistoricalAbandonment(request: unknown): Promise<ClosedSymbolAbandonmentInspection> {
  const parsed = historicalAbandonmentRequestSchema.parse(request);
  const result = await abandonClosedSymbolBeforeNavigation(parsed.operationId);
  return result;
}
