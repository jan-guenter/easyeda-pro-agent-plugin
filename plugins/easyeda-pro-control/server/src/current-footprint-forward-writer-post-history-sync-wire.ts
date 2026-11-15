/** Own full-copy transport. Shared readonly rows are syntax only; the
 * private replay selector never accepts caller body/entry/merged handles. */
import { z } from "zod";
import { currentPcbViaPostHistorySyncWire } from "./current-pcb-via-post-history-sync-wire.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const replay = z.strictObject({ phase: z.literal("via-post-sync-replay"), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({}) });
export function currentFootprintForwardWriterPostHistorySyncWire(input: unknown, id: number): ReturnType<typeof currentPcbViaPostHistorySyncWire> {
  const captured = captureCurrentPcbStringClockReply(input).value;
  const transport = replay.safeParse(captured);
  const original = currentPcbViaPostHistorySyncWire(transport.success ? { phase: "via-post-sync-replay" } : captured, id);
  return freezeDeep({ command: original.command, request: { ...original.request, action: "footprint-forward-copy-post-sync" } });
}
