/** Comparison data for one original strict schematic display request. This adapter supplies no
 * connection, process owner, native binding or replay permission. The manager
 * must still join its privately retained original client/generation/request. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL, currentSchematicRelevanceDisplayWriteActionSchema } from "../server/src/current-schematic-relevance-display-write-contract.ts";

export interface OriginalSchematicDisplayManagerRequest { readonly operationId: string; readonly action: z.infer<typeof currentSchematicRelevanceDisplayWriteActionSchema>["action"] }
const outer = z.strictObject({ request: currentSchematicRelevanceDisplayWriteActionSchema });
const cleanup = z.enum(["inspect", "abort", "observe-termination", "release", "settle-publication"]);
export function captureOriginalSchematicDisplayManagerRequest(tool: string, input: unknown): OriginalSchematicDisplayManagerRequest | null {
  if (tool !== CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL) { return null; }
  const parsed = outer.safeParse(input); if (!parsed.success) { return null; }
  return Object.freeze({ operationId: parsed.data.request.operationId, action: parsed.data.request.action });
}
export function isOriginalSchematicDisplayManagerControl(action: string, inFlight = false): boolean {
  return inFlight ? action === "inspect" || action === "abort" : cleanup.safeParse(action).success;
}
/** Only the manager's original request supplies operationId. The selector has
 * no operation/tool/confirmation fields; inject precisely the abort literal. */
export function originalSchematicDisplayManagerControl(original: OriginalSchematicDisplayManagerRequest, action: string): Readonly<{
  tool: typeof CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL; arguments: { request: z.infer<typeof currentSchematicRelevanceDisplayWriteActionSchema> };
}> {
  const selected = cleanup.parse(action);
  const request = currentSchematicRelevanceDisplayWriteActionSchema.parse({ action: selected, operationId: original.operationId,
    ...(selected === "abort" ? { confirmOriginalJobOnly: true } : {}) });
  return Object.freeze({ tool: CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_TOOL, arguments: { request } });
}
