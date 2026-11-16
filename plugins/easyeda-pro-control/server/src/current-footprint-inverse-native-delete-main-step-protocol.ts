/** Fixed request continuations on the original native DELETE main cursor. A command is
 * data only; the original native sender consumes a separate private grant. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_STEP_PHASES = ["inverse-native-delete-main-driver-step", "inverse-native-delete-main-context-step", "inverse-native-delete-main-controller-step"] as const;
const command = z.strictObject({ phase: z.enum(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_STEP_PHASES), method: z.literal("Debugger.resume"), params: z.strictObject({}) });
export type CurrentFootprintInverseNativeDeleteMainStepCommand = Readonly<z.infer<typeof command>>;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_STEP_REQUESTS = Object.freeze({ normal: CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_STEP_PHASES.length, cleanup: 0, total: CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_STEP_PHASES.length,
  selectedSqlResumeAvailable: false, saveAuthorized: false });
export function validateCurrentFootprintInverseNativeDeleteMainStepCommand(input: unknown): CurrentFootprintInverseNativeDeleteMainStepCommand {
  return freezeDeep(command.parse(captureCurrentPcbStringClockReply(input).value));
}
export function currentFootprintInverseNativeDeleteMainStepWire(input: unknown, requestId: number): Readonly<Record<string, string | number>> {
  const checked = validateCurrentFootprintInverseNativeDeleteMainStepCommand(input);
  if (!Number.isSafeInteger(requestId) || requestId < 1) { throw new Error("INVERSE_NATIVE_DELETE_MAIN_STEP_ID"); }
  return Object.freeze({ action: "inverse-native-delete-main-step", phase: checked.phase, method: checked.method, requestId });
}
