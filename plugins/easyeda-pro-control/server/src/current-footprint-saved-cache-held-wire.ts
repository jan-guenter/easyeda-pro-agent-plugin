/** Separate unmounted scalar wire for the held native getter/match leaf.
 * Its twelve-command unit count supplies no native issuer or owner permit. */
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS as LIMITS } from "./current-footprint-saved-cache-held-profile.ts";
import { validateCurrentFootprintSavedCacheHeldCommand } from "./current-footprint-saved-cache-held-protocol.ts";
import type { CurrentFootprintSavedCacheHeldCommand } from "./current-footprint-saved-cache-held-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_SAVED_CACHE_HELD_REQUEST_COUNT = LIMITS.normal + LIMITS.cleanup;
const maximumPhysicalRequestId = 2_147_483_647;

/** Validate fixed programs and effects before flattening phase-specific scalar
 * slots. A positive int32 is a physical CDP ID, not a unit counter or allocation
 * permit. A future original owner must allocate global IDs and charge the
 * separately derived normal/cleanup counts after browser/source setup. */
export function currentFootprintSavedCacheHeldWire(input: unknown, id: number): Readonly<{
  command: CurrentFootprintSavedCacheHeldCommand & Readonly<{ id: number }>;
  request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > maximumPhysicalRequestId) { throw new Error("SAVED_CACHE_HELD_WIRE_ID"); }
  const command = validateCurrentFootprintSavedCacheHeldCommand(input);
  const request: Record<string, string | number> = { action: "saved-cache-held", requestId: id, phase: command.heldCachePhase,
    method: command.method, sessionId: command.sessionId };
  if ("uniqueContextId" in command.params) { request["uniqueContextId"] = command.params.uniqueContextId; }
  if ("objectId" in command.params) { request["objectId"] = command.params.objectId; }
  if (command.heldCachePhase === "queue-first" || command.heldCachePhase === "queue-fresh") {
    request["projectUuid"] = command.params.arguments[0].value; request["branchUuid"] = command.params.arguments[1].value;
  }
  return freezeDeep({ command: { id, ...command }, request });
}
