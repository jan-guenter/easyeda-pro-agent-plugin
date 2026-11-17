/** Strict comparison data for the original full-writer request. No serialized
 * action grants a connection, native owner, cleanup replay or new dispatch. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_CLEANUP_ACTIONS, CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_TOOL, currentFootprintForwardWriterControlActionSchema } from "../server/src/current-footprint-forward-writer-control-contract.ts";
import type { CurrentFootprintForwardWriterControlAction } from "../server/src/current-footprint-forward-writer-control-contract.ts";
import { freezeDeep } from "../server/src/sqlite-inventory-core.ts";

export interface OriginalFootprintForwardWriterManagerRequest {
  readonly operationId: string;
  readonly action: CurrentFootprintForwardWriterControlAction["action"];
  readonly request: Readonly<CurrentFootprintForwardWriterControlAction>;
}
const outer = z.strictObject({ request: currentFootprintForwardWriterControlActionSchema });
const cleanup = z.enum(CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_CLEANUP_ACTIONS);
export function captureOriginalFootprintForwardWriterManagerRequest(tool: string, input: unknown): OriginalFootprintForwardWriterManagerRequest | null {
  if (tool !== CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_TOOL) { return null; }
  const parsed = outer.safeParse(input); if (!parsed.success) { return null; }
  const request = parsed.data.request;
  return freezeDeep({ operationId: request.operationId, action: request.action, request });
}
export function isOriginalFootprintForwardWriterManagerControl(action: string): boolean { return cleanup.safeParse(action).success; }
/** The original request supplies the flow ID; the selector carries no target,
 * caller payload, binding or confirmation override. */
export function originalFootprintForwardWriterManagerControl(original: OriginalFootprintForwardWriterManagerRequest, action: string): Readonly<{
  tool: typeof CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_TOOL;
  arguments: { request: CurrentFootprintForwardWriterControlAction };
}> {
  const selected = cleanup.parse(action);
  const request = currentFootprintForwardWriterControlActionSchema.parse({ action: selected, operationId: original.operationId,
    ...(selected === "cleanup" ? { confirmOriginalJobsOnly: true } : {}) });
  return freezeDeep({ tool: CURRENT_FOOTPRINT_FORWARD_WRITER_CONTROL_TOOL, arguments: { request } });
}
