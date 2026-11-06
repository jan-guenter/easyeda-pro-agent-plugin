/** Native helper receipts are clock bounds only. The original main cursor
 * separately retains the exact SQL, callback and pending request lineage. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_MAIN_HISTORY_SLOTS } from "./current-pcb-via-main-history-protocol.ts";
import type { CurrentPcbViaMainHistoryCommand, CurrentPcbViaMainHistorySlot } from "./current-pcb-via-main-history-protocol.ts";

export interface CurrentPcbViaMainHistoryNativeWindow { readonly slot: CurrentPcbViaMainHistorySlot; readonly beforeEpochMs: number; readonly afterEpochMs: number }
const epoch = z.number().int().positive().max(8_640_000_000_000_000), zeroOrEpoch = z.union([z.literal(0), epoch]);
const window = z.strictObject({ written: z.literal(true), slot: z.enum(CURRENT_PCB_VIA_MAIN_HISTORY_SLOTS), beforeEpochMs: epoch, afterEpochMs: zeroOrEpoch });
const written = z.strictObject({ written: z.literal(true) });
export function decodeCurrentPcbViaMainHistoryNativeAck(input: unknown, command: CurrentPcbViaMainHistoryCommand): CurrentPcbViaMainHistoryNativeWindow | null {
  const value = captureCurrentPcbStringClockReply(input).value;
  if (command.phase !== "via-main-history-step" || !command.role.startsWith("sql-") && !command.role.startsWith("callback-")) { written.parse(value); return null; }
  const parsed = window.parse(value); const callback = command.role.startsWith("callback-");
  if (command.role !== `${callback ? "callback" : "sql"}-${parsed.slot}` || (callback ? parsed.afterEpochMs < parsed.beforeEpochMs || parsed.afterEpochMs - parsed.beforeEpochMs > 120_000 : parsed.afterEpochMs !== 0)) { throw new Error("PCB_VIA_HISTORY_NATIVE_WINDOW"); }
  return Object.freeze({ slot: parsed.slot, beforeEpochMs: parsed.beforeEpochMs, afterEpochMs: parsed.afterEpochMs });
}
