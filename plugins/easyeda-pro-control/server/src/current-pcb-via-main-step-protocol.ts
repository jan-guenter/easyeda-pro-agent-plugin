/** Fixed request continuations on the original Via main cursor. A command is
 * data only; the original native sender consumes a separate private grant. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_MAIN_STEP_PHASES = ["via-main-driver-step", "via-main-context-step", "via-main-controller-step", "via-main-edit-head-step"] as const;
const command = z.strictObject({ phase: z.enum(CURRENT_PCB_VIA_MAIN_STEP_PHASES), method: z.literal("Debugger.resume"), params: z.strictObject({}) });
export type CurrentPcbViaMainStepCommand = Readonly<z.infer<typeof command>>;
export const CURRENT_PCB_VIA_MAIN_STEP_REQUESTS = Object.freeze({ normal: CURRENT_PCB_VIA_MAIN_STEP_PHASES.length, cleanup: 0, total: CURRENT_PCB_VIA_MAIN_STEP_PHASES.length,
  selectedSqlResumeAvailable: false, saveAuthorized: false });
export function validateCurrentPcbViaMainStepCommand(input: unknown): CurrentPcbViaMainStepCommand {
  return freezeDeep(command.parse(captureCurrentPcbStringClockReply(input).value));
}
export function currentPcbViaMainStepWire(input: unknown, requestId: number): Readonly<Record<string, string | number>> {
  const checked = validateCurrentPcbViaMainStepCommand(input);
  if (!Number.isSafeInteger(requestId) || requestId < 1) { throw new Error("PCB_VIA_MAIN_STEP_ID"); }
  return Object.freeze({ action: "pcb-via-main-step", phase: checked.phase, method: checked.method, requestId });
}
