/** Separate original inverse parser/ready steps. The older six pre-model
 * roles stay unchanged; only a private actual held-packet permit can dispatch. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_MODEL_STEP_ROLES = Object.freeze(["plaintext", "parsed", "ready"] as const);
export type CurrentFootprintInverseModelStepRole = typeof CURRENT_FOOTPRINT_INVERSE_MODEL_STEP_ROLES[number];
const schema = z.strictObject({ phase: z.literal("inverse-model-step"), role: z.enum(CURRENT_FOOTPRINT_INVERSE_MODEL_STEP_ROLES), method: z.literal("Debugger.resume"), params: z.strictObject({}) });
export type CurrentFootprintInverseModelStepCommand = z.infer<typeof schema>;
export interface CurrentFootprintInverseStartupIdle { readonly profile: "private.current-footprint-inverse-startup-idle.v1" }
export function currentFootprintInverseModelStepBudget(chunks: number): Readonly<{ chunks: number; cdpRequests: number; permits: number; idle: 1; controls: number }> {
  if (!Number.isSafeInteger(chunks) || chunks < 1 || chunks > 8) { throw new Error("FOOTPRINT_INVERSE_MODEL_STEP_CHUNK_BOUND"); } return Object.freeze({ chunks, cdpRequests: chunks + 2, permits: chunks + 2, idle: 1, controls: 2 * (chunks + 2) + 1 });
}
export const CURRENT_FOOTPRINT_INVERSE_MODEL_STEP_REQUESTS = currentFootprintInverseModelStepBudget(8);
export function validateCurrentFootprintInverseModelStepCommand(input: unknown): CurrentFootprintInverseModelStepCommand { return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value)); }
export function currentFootprintInverseModelStepWire(input: CurrentFootprintInverseModelStepCommand, id: number, sessionId: string): CurrentFootprintInverseModelStepCommand & Readonly<{ id: number; sessionId: string; inverseModelStep: true }> {
  if (!Number.isSafeInteger(id) || id < 1 || !/^[A-Za-z\d_.:-]{1,256}$/u.test(sessionId)) { throw new Error("FOOTPRINT_INVERSE_MODEL_STEP_ENVELOPE"); } return freezeDeep({ ...validateCurrentFootprintInverseModelStepCommand(input), id, sessionId, inverseModelStep: true });
}
export function currentFootprintInverseModelStepNativeFrame(chunk: Buffer, input: CurrentFootprintInverseModelStepCommand, sessionId: string): Readonly<{ action: "footprint-inverse-model-step"; requestId: number; stepRole: CurrentFootprintInverseModelStepRole }> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("FOOTPRINT_INVERSE_MODEL_STEP_FRAME"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1))); const value = z.looseObject({ id: z.number().int().positive() }).parse(captureCurrentPcbStringClockReply(raw).value);
  const command = validateCurrentFootprintInverseModelStepCommand(input), expected = currentFootprintInverseModelStepWire(command, value.id, sessionId); if (canonicalJson(value) !== canonicalJson(expected) || chunk.toString("utf8") !== `${JSON.stringify(expected)}\0`) { throw new Error("FOOTPRINT_INVERSE_MODEL_STEP_FRAME"); }
  return Object.freeze({ action: "footprint-inverse-model-step", requestId: value.id, stepRole: command.role });
}
