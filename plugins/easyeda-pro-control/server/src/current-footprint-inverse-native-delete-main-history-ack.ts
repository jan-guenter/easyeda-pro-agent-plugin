/** Native helper receipts are clock bounds only. The original main cursor
 * separately retains the exact SQL, callback and pending request lineage. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_HISTORY_SLOTS } from "./current-footprint-inverse-native-delete-main-history-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteMainHistoryCommand, CurrentFootprintInverseNativeDeleteMainHistorySlot } from "./current-footprint-inverse-native-delete-main-history-protocol.ts";

export interface CurrentFootprintInverseNativeDeleteMainHistoryNativeWindow { readonly slot: CurrentFootprintInverseNativeDeleteMainHistorySlot; readonly beforeEpochMs: number; readonly afterEpochMs: number }
const epoch = z.number().int().positive().max(8_640_000_000_000_000), zeroOrEpoch = z.union([z.literal(0), epoch]);
const window = z.strictObject({ written: z.literal(true), slot: z.enum(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_HISTORY_SLOTS), beforeEpochMs: epoch, afterEpochMs: zeroOrEpoch });
const written = z.strictObject({ written: z.literal(true) });
export function decodeCurrentFootprintInverseNativeDeleteMainHistoryNativeAck(input: unknown, command: CurrentFootprintInverseNativeDeleteMainHistoryCommand): CurrentFootprintInverseNativeDeleteMainHistoryNativeWindow | null {
  const value = captureCurrentPcbStringClockReply(input).value;
  if (command.phase !== "inverse-native-delete-main-history-step" || !command.role.startsWith("sql-") && !command.role.startsWith("callback-")) { written.parse(value); return null; }
  const parsed = window.parse(value); const callback = command.role.startsWith("callback-");
  if (command.role !== `${callback ? "callback" : "sql"}-${parsed.slot}` || (callback ? parsed.afterEpochMs < parsed.beforeEpochMs || parsed.afterEpochMs - parsed.beforeEpochMs > 120_000 : parsed.afterEpochMs !== 0)) { throw new Error("INVERSE_NATIVE_DELETE_HISTORY_NATIVE_WINDOW"); }
  return Object.freeze({ slot: parsed.slot, beforeEpochMs: parsed.beforeEpochMs, afterEpochMs: parsed.afterEpochMs });
}
