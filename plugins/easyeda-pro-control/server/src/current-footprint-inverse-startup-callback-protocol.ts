/** Inverse-only startup callback vocabulary. Shared fixed source templates
 * supply no generated-fixture count, owner, history or publication grant. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentProjectSaveStructureNativeCases, validateCurrentProjectSaveStructureCommand } from "./current-project-save-structure-protocol.ts";
import type { CurrentProjectSaveStructureCommand } from "./current-project-save-structure-protocol.ts";
import { currentPcbViaWorkerWire } from "./current-pcb-via-worker-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_STARTUP_CALLBACK_ROLES = Object.freeze(["startupEntry", "startupReturn", "initialFinally", "queuedFinally"] as const);
export type CurrentFootprintInverseStartupCallbackRole = typeof CURRENT_FOOTPRINT_INVERSE_STARTUP_CALLBACK_ROLES[number];
const helper = z.strictObject({ phase: z.literal("inverse-startup-callback-helper"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u) }) });
export type CurrentFootprintInverseStartupCallbackCommand = CurrentProjectSaveStructureCommand | z.infer<typeof helper>;
export function currentFootprintInverseStartupCallbackBudget(records: number): Readonly<{ records: number; normal: number; helpers: number; cdpRequests: number; held: number; events: number; controls: number }> {
  if (!Number.isSafeInteger(records) || records < 1 || records > 512) { throw new Error("FOOTPRINT_INVERSE_STARTUP_CALLBACK_SOURCE_BOUND"); }
  // Entry8, return4 and finalizer6 include three role-bound resumes. Seven
  // Actual evaluated helper scripts require their own exact source reads.
  return Object.freeze({ records, normal: 18 * records, helpers: 7 * records, cdpRequests: 25 * records, held: 3 * records, events: 6 * records, controls: 28 * records + 1 });
}
export const CURRENT_FOOTPRINT_INVERSE_STARTUP_CALLBACK_REQUESTS = currentFootprintInverseStartupCallbackBudget(512);
function allowed(command: CurrentProjectSaveStructureCommand): boolean {
  if (command.phase === "project-save-structure-properties") { return true; }
  if (command.phase === "project-save-structure-frame") { return [...CURRENT_FOOTPRINT_INVERSE_STARTUP_CALLBACK_ROLES, "startupCaller"].includes(command.role); }
  if (command.phase === "project-save-structure-resume") { return CURRENT_FOOTPRINT_INVERSE_STARTUP_CALLBACK_ROLES.some(role => role === command.role); }
  return command.phase === "project-save-structure-startupEntry" || command.phase === "project-save-structure-startupReturn" || command.phase === "project-save-structure-startupFinalizer";
}
export function validateCurrentFootprintInverseStartupCallbackCommand(input: unknown): CurrentFootprintInverseStartupCallbackCommand {
  const value = captureCurrentPcbStringClockReply(input).value;
  if (helper.safeParse(value).success) { return freezeDeep(helper.parse(value)); }
  const command = validateCurrentProjectSaveStructureCommand(value);
  if (!allowed(command)) { throw new Error("FOOTPRINT_INVERSE_STARTUP_CALLBACK_FIXED_ONLY"); } return command;
}
export function currentFootprintInverseStartupCallbackCases(): readonly CurrentFootprintInverseStartupCallbackCommand[] {
  return freezeDeep([...currentProjectSaveStructureNativeCases().filter(command => allowed(command)), { phase: "inverse-startup-callback-helper", method: "Debugger.getScriptSource", params: { scriptId: "original_helper" } }].map(value => validateCurrentFootprintInverseStartupCallbackCommand(value)));
}
export function currentFootprintInverseStartupCallbackWire(input: CurrentFootprintInverseStartupCallbackCommand, id: number, sessionId: string): CurrentFootprintInverseStartupCallbackCommand & Readonly<{ id: number; sessionId: string; inverseStartupCallback: true }> {
  if (!Number.isSafeInteger(id) || id < 1 || !/^[A-Za-z\d_.:-]{1,256}$/u.test(sessionId)) { throw new Error("FOOTPRINT_INVERSE_STARTUP_CALLBACK_ENVELOPE"); }
  return freezeDeep({ ...validateCurrentFootprintInverseStartupCallbackCommand(input), id, sessionId, inverseStartupCallback: true });
}
export function currentFootprintInverseStartupCallbackNativeFrame(chunk: Buffer, input: CurrentFootprintInverseStartupCallbackCommand, sessionId: string): Readonly<Record<string, string | number>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("FOOTPRINT_INVERSE_STARTUP_CALLBACK_FRAME"); }
  const command = validateCurrentFootprintInverseStartupCallbackCommand(input), raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  const value = z.looseObject({ id: z.number().int().positive() }).parse(captureCurrentPcbStringClockReply(raw).value); const expected = currentFootprintInverseStartupCallbackWire(command, value.id, sessionId);
  if (canonicalJson(expected) !== canonicalJson(value) || chunk.toString("utf8") !== `${JSON.stringify(expected)}\0`) { throw new Error("FOOTPRINT_INVERSE_STARTUP_CALLBACK_FRAME"); }
  if (command.phase === "inverse-startup-callback-helper") { return freezeDeep({ action: "footprint-inverse-startup-callback", requestId: value.id, phase: command.phase, method: command.method, scriptId: command.params.scriptId }); }
  return freezeDeep({ ...currentPcbViaWorkerWire(command, value.id).request, action: "footprint-inverse-startup-callback" });
}

export { CURRENT_FOOTPRINT_INVERSE_STARTUP_QUEUE_REQUESTS } from "./current-footprint-inverse-startup-queue-protocol.ts";
