/** Original native brackets are bounds, never completion by themselves. The
 * same backend retains the exact native call/resolver/callback correspondence. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbViaMainStructureCommand } from "./current-pcb-via-main-structure-protocol.ts";

export interface CurrentPcbViaMainStructureNativeWindow { readonly beforeEpochMs: number; readonly afterEpochMs: number }
const epoch = z.number().int().positive().max(8_640_000_000_000_000);
const window = z.strictObject({ written: z.literal(true), beforeEpochMs: epoch, afterEpochMs: z.union([z.literal(0), epoch]) });
const written = z.strictObject({ written: z.literal(true) });
export function decodeCurrentPcbViaMainStructureNativeAck(input: unknown, command: CurrentPcbViaMainStructureCommand): CurrentPcbViaMainStructureNativeWindow | null {
  const value = captureCurrentPcbStringClockReply(input).value;
  if (command.phase !== "via-main-structure-step" || command.role !== "run" && command.role !== "callback") { written.parse(value); return null; }
  const observed = window.parse(value);
  if (command.role === "run" ? observed.afterEpochMs !== 0 : observed.afterEpochMs < observed.beforeEpochMs || observed.afterEpochMs - observed.beforeEpochMs > 120_000) { throw new Error("PCB_VIA_STRUCTURE_NATIVE_WINDOW"); }
  return Object.freeze({ beforeEpochMs: observed.beforeEpochMs, afterEpochMs: observed.afterEpochMs });
}
