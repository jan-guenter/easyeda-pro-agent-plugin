/** Local-only publication for two fixed stopped validation boundaries.
 * The index must hold its serialized recovery gate. This entry never allocates
 * a runtime, restores process ownership or exposes legacy recovery actions.
 */
import { z } from "zod";
import { abandonClosedSymbolBeforeNavigation } from "./closed-symbol-abandonment.ts";
import type { ClosedSymbolAbandonmentInspection } from "./closed-symbol-abandonment.ts";
import { abandonCurrentSymbolBaselineBeforeRelaunch } from "./current-symbol-baseline-abandonment.ts";
import type { CurrentSymbolBaselineAbandonmentInspection } from "./current-symbol-baseline-abandonment.ts";

const beforeNavigationSchema = z.object({
  action: z.literal("abandon-before-navigation"),
  operationId: z.string().regex(/^easyeda-[a-z0-9-]{8,96}$/u),
  confirmation: z.string().max(160),
}).strict().refine(
  (request) => request.confirmation === `${request.operationId}:abandoned-before-navigation`,
  { message: "confirmation must exactly equal operationId:abandoned-before-navigation.", path: ["confirmation"] },
);
const beforeRelaunchSchema = z.object({
  action: z.literal("abandon-baseline-before-relaunch"), operationId: z.string().regex(/^[a-z0-9][a-z0-9-]{7,95}$/iu),
  confirmDisposableProject: z.literal(true), confirmation: z.string().max(160),
}).strict().refine((request) => request.confirmation === `${request.operationId}:abandoned-before-relaunch`,
  { message: "confirmation must exactly equal operationId:abandoned-before-relaunch.", path: ["confirmation"] });
export const historicalAbandonmentRequestSchema = z.union([beforeNavigationSchema, beforeRelaunchSchema]);

export type HistoricalAbandonmentRequest = z.infer<typeof historicalAbandonmentRequestSchema>;

/** Preserve the maintained qualification, unchanged-source proof and sidecar.
 * Six-event baseline abandonment remains on the retained legacy route, where
 * its original-entry-return reservation is checked separately.
 */
export async function runHistoricalAbandonment(request: unknown): Promise<ClosedSymbolAbandonmentInspection | CurrentSymbolBaselineAbandonmentInspection> {
  const parsed = historicalAbandonmentRequestSchema.parse(request);
  if (parsed.action === "abandon-baseline-before-relaunch") { return abandonCurrentSymbolBaselineBeforeRelaunch(parsed.operationId); }
  const result = await abandonClosedSymbolBeforeNavigation(parsed.operationId);
  return result;
}
