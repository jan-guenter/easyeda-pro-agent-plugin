/** Only the one exact inverse-generated guard may exceed the old8KiB remote
 * description limit. Every other field uses the unchanged generic decoder. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_GUARD_DESCRIPTION as GUARD } from "./current-footprint-inverse-initial-sync-programs.ts";

const property = z.looseObject({ name: z.string(), value: z.looseObject({ type: z.string(), subtype: z.string().optional(), description: z.string().max(16_384).optional() }) });
const packet = z.strictObject({ result: z.array(property).length(17), internalProperties: z.array(z.unknown()).length(1) });
export function decodeCurrentFootprintInverseInitialSyncCapture(input: unknown): ReturnType<typeof decodeCurrentFootprintCopyClockRpcV2Array> {
  const original = packet.parse(captureCurrentPcbStringClockReply(input).value); const guards = original.result.filter(field => field.name === "5"); const guard = guards[0];
  if (guards.length !== 1 || guard?.value.type !== "function" || guard.value.subtype !== undefined || guard.value.description !== GUARD || GUARD.length > 16_384) { throw new Error("FOOTPRINT_INVERSE_INITIAL_SYNC_GUARD_METADATA"); }
  // This local copy is used only to apply every original descriptor, array and
  // Proxy guard. No native result or authority is minted from its shorter text.
  const result = original.result.map(field => field === guard ? { ...field, value: { ...field.value, description: "exact inverse initial-sync guard" } } : field);
  return decodeCurrentFootprintCopyClockRpcV2Array({ result, internalProperties: original.internalProperties }, 16);
}
