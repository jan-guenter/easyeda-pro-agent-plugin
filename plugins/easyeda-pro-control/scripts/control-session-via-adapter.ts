/** Comparison data for one original strict Via request. This adapter supplies no
 * connection, process owner, native binding or replay permission. The manager
 * must still join its privately retained original client/generation/request. */
import { z } from "zod";
import { CURRENT_PCB_VIA_WRITE_TOOL, currentPcbViaWriteActionSchema } from "../server/src/current-pcb-via-write-contract.ts";

export interface OriginalViaManagerRequest { readonly operationId: string; readonly action: z.infer<typeof currentPcbViaWriteActionSchema>["action"] }
const outer = z.strictObject({ request: currentPcbViaWriteActionSchema });
const cleanup = z.enum(["inspect", "abort", "observe-termination", "release", "settle-publication"]);
export function captureOriginalViaManagerRequest(tool: string, input: unknown): OriginalViaManagerRequest | null {
  if (tool !== CURRENT_PCB_VIA_WRITE_TOOL) { return null; }
  const parsed = outer.safeParse(input); if (!parsed.success) { return null; }
  return Object.freeze({ operationId: parsed.data.request.operationId, action: parsed.data.request.action });
}
export function isOriginalViaManagerControl(action: string, inFlight = false): boolean {
  return inFlight ? action === "inspect" || action === "abort" : cleanup.safeParse(action).success;
}
/** Only the manager's original request supplies operationId. The selector has
 * no operation/tool/confirmation fields; inject precisely the abort literal. */
export function originalViaManagerControl(original: OriginalViaManagerRequest, action: string): Readonly<{
  tool: typeof CURRENT_PCB_VIA_WRITE_TOOL; arguments: { request: z.infer<typeof currentPcbViaWriteActionSchema> };
}> {
  const selected = cleanup.parse(action);
  const request = currentPcbViaWriteActionSchema.parse({ action: selected, operationId: original.operationId,
    ...(selected === "abort" ? { confirmOriginalJobOnly: true } : {}) });
  return Object.freeze({ tool: CURRENT_PCB_VIA_WRITE_TOOL, arguments: { request } });
}
