/** Redacted failure evidence only. Issued errors retain no target data, URLs,
 * titles, execution permission or reconstructible original-owner capability. */
import { z } from "zod";
import { sha256Text } from "./core.ts";
import { diagnosticTargetInventory } from "./current-pcb-diagnostic-context.ts";
import { diagnosticToken } from "./current-pcb-diagnostic-protocol.ts";

export const CURRENT_FOOTPRINT_HELD_CACHE_FRAME_TRANSITION_BYTES = 2048;
const fields = ["targetId", "type", "url", "title", "attached", "openerId", "canAccessOpener", "openerFrameId", "browserContextId", "subtype"] as const;
const digest = z.string().regex(/^[a-f\d]{64}(?![\s\S])/u);
export const currentFootprintHeldCacheFrameTargetTransitionSchema = z.object({
  schema: z.literal("private.current-footprint-held-cache-frame-target-transition.v1"),
  beforeInventorySha256: digest, afterInventorySha256: digest, targetPresent: z.boolean(),
  changedFields: z.object({ targetId: z.boolean(), type: z.boolean(), url: z.boolean(), title: z.boolean(), attached: z.boolean(),
    openerId: z.boolean(), canAccessOpener: z.boolean(), openerFrameId: z.boolean(), browserContextId: z.boolean(), subtype: z.boolean(),
    other: z.boolean(), propertyOrder: z.boolean() }).strict().readonly(),
}).strict().refine(value => Object.values(value.changedFields).some(Boolean) && value.beforeInventorySha256 !== value.afterInventorySha256,
  { message: "Frame target transition must describe an actual changed inventory." })
  .refine(value => Buffer.byteLength(JSON.stringify(value)) <= CURRENT_FOOTPRINT_HELD_CACHE_FRAME_TRANSITION_BYTES,
  { message: "Frame target transition exceeds its fixed diagnostic byte bound." }).readonly();
export type CurrentFootprintHeldCacheFrameTargetTransition = z.infer<typeof currentFootprintHeldCacheFrameTargetTransitionSchema>;
const issued = new WeakMap<Error, CurrentFootprintHeldCacheFrameTargetTransition>();
const attempted = new WeakSet<Error>();
type Row = Readonly<Record<string, unknown>>;

/** Preserve the primary Error unchanged if diagnostic construction fails.
 * The caller still throws its exact original FRAME_TARGET_CHANGED refusal. */
export function issueCurrentFootprintHeldCacheFrameTargetTransition(error: Error, beforeInventory: readonly Row[], afterInventory: readonly Row[], targetId: string): Error {
  if (!Error.isError(error) || attempted.has(error) || Object.getOwnPropertyDescriptor(error, "message")?.value !== "PCB_DIAGNOSTIC_OWNER_FRAME_TARGET_CHANGED") { return error; }
  attempted.add(error);
  try {
    if (!diagnosticToken(targetId)) { return error; }
    const after = diagnosticTargetInventory({ targetInfos: afterInventory }), before = diagnosticTargetInventory({ targetInfos: beforeInventory });
    const current = after.find(item => item["targetId"] === targetId), original = before.find(item => item["targetId"] === targetId);
    if (original === undefined || JSON.stringify(original) === JSON.stringify(current)) { return error; }
    const changed = Object.fromEntries(fields.map(field => [field, Object.hasOwn(original, field) !== (current !== undefined && Object.hasOwn(current, field)) ||
      JSON.stringify(original[field]) !== JSON.stringify(current?.[field])]));
    const other = (row: Row | undefined): Record<string, unknown> => Object.fromEntries(Object.entries(row ?? {}).filter(([key]) => !fields.some(field => field === key)));
    const packet = currentFootprintHeldCacheFrameTargetTransitionSchema.parse({
      schema: "private.current-footprint-held-cache-frame-target-transition.v1",
      beforeInventorySha256: sha256Text(JSON.stringify(before)), afterInventorySha256: sha256Text(JSON.stringify(after)), targetPresent: current !== undefined,
      changedFields: { ...changed, other: JSON.stringify(other(original)) !== JSON.stringify(other(current)),
        propertyOrder: JSON.stringify(Object.keys(original)) !== JSON.stringify(Object.keys(current ?? {})) },
    });
    issued.set(error, packet);
  } catch {
    // Diagnostic failure must not replace the exact fail-closed owner error.
  }
  return error;
}

/** WeakMap custody is consumed once. Matching JSON or another Error message
 * cannot attach this packet to a different controller failure. */
export function takeCurrentFootprintHeldCacheFrameTargetTransition(error: unknown): CurrentFootprintHeldCacheFrameTargetTransition | null {
  if (!Error.isError(error)) { return null; }
  const packet = issued.get(error);
  if (packet === undefined) { return null; }
  issued.delete(error); return packet;
}
