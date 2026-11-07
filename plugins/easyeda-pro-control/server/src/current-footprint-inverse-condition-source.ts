/** Persistent inverse condition receipts. Text comes only from the fixed
 * original arm vocabulary; no supplied expression is admitted. */
import { z } from "zod";
import { CURRENT_GENERATED_INITIAL_SYNC_CONDITION as SYNC } from "./current-generated-initial-sync-condition.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_STARTUP_CONDITION as STARTUP } from "./current-project-save-structure-source.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_ENTRY_CONDITION as TIMER } from "./current-project-sync-quiesce-source.ts";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

export const CURRENT_FOOTPRINT_INVERSE_CONDITION_ROLES = Object.freeze(["startupEntry", "startupReturn", "syncEntry", "timer"] as const);
export type CurrentFootprintInverseConditionRole = typeof CURRENT_FOOTPRINT_INVERSE_CONDITION_ROLES[number];
const fixed = Object.freeze({ startupEntry: STARTUP, startupReturn: STARTUP, syncEntry: SYNC, timer: TIMER });
export function currentFootprintInverseConditionText(role: CurrentFootprintInverseConditionRole): string { return fixed[z.enum(CURRENT_FOOTPRINT_INVERSE_CONDITION_ROLES).parse(role)]; }
export function currentFootprintInverseConditionBudget(records: number): number { if (!Number.isSafeInteger(records) || records < 1 || records > 512) { throw new Error("FOOTPRINT_INVERSE_CONDITION_BOUND"); } return 2 * records + 2; }
export const CURRENT_FOOTPRINT_INVERSE_CONDITION_SOURCE_REQUESTS = Object.freeze({ reads: currentFootprintInverseConditionBudget(512), controls: currentFootprintInverseConditionBudget(512) + 1 });
export function qualifyCurrentFootprintInverseConditionSource(text: unknown, registered: readonly CurrentFootprintInverseConditionRole[], records: number): Readonly<{ text: string; maximum: number }> {
  currentFootprintInverseConditionBudget(records);
  if (typeof text !== "string" || !registered.some(role => currentFootprintInverseConditionText(role) === text)) { throw new Error("FOOTPRINT_INVERSE_CONDITION_SOURCE"); }
  return Object.freeze({ text, maximum: text === STARTUP ? 2 * records : 1 });
}
const command = z.strictObject({ method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u) }) });
export function currentFootprintInverseConditionWire(id: number, sessionId: string, scriptId: string): z.infer<typeof command> & Readonly<{ id: number; sessionId: string; inverseConditionSource: true }> {
  if (!Number.isSafeInteger(id) || id < 1 || !/^[A-Za-z\d_.:-]{1,256}$/u.test(sessionId)) { throw new Error("FOOTPRINT_INVERSE_CONDITION_ENVELOPE"); }
  return Object.freeze({ ...command.parse({ method: "Debugger.getScriptSource", params: { scriptId } }), id, sessionId, inverseConditionSource: true });
}
export function currentFootprintInverseConditionNativeFrame(chunk: Buffer, scriptId: string, sessionId: string): Readonly<{ action: "footprint-inverse-condition-source"; requestId: number; scriptId: string }> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("FOOTPRINT_INVERSE_CONDITION_FRAME"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  const value = z.looseObject({ id: z.number().int().positive() }).parse(captureCurrentPcbStringClockReply(raw).value); const expected = currentFootprintInverseConditionWire(value.id, sessionId, scriptId);
  if (canonicalJson(value) !== canonicalJson(expected) || chunk.toString("utf8") !== `${JSON.stringify(expected)}\0`) { throw new Error("FOOTPRINT_INVERSE_CONDITION_FRAME"); }
  return Object.freeze({ action: "footprint-inverse-condition-source", requestId: value.id, scriptId });
}
