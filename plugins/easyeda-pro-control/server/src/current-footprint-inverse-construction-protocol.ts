/** Inverse-only constructor custody. Shared commands are fixed source/metadata
 * projections; bootstrap publication and project methods remain absent. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS as STRUCTURE, validateCurrentProjectSaveStructureCommand } from "./current-project-save-structure-protocol.ts";
import type { CurrentProjectSaveStructureCommand } from "./current-project-save-structure-protocol.ts";
import { currentPcbViaWorkerWire } from "./current-pcb-via-worker-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_CONSTRUCTION_REQUESTS = Object.freeze({
  sharedNormal: STRUCTURE.normal, sharedCleanup: STRUCTURE.cleanup, helperSources: STRUCTURE.normal, sourceStart: 2,
  cdpRequests: STRUCTURE.cdpRequests + STRUCTURE.normal + 2, heldEvents: STRUCTURE.events,
  controls: STRUCTURE.cdpRequests + STRUCTURE.normal + 2 + STRUCTURE.events + 1,
});
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const extra = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("inverse-construction-instrument"), method: z.literal("Debugger.removeBreakpoint"), params: z.strictObject({ breakpointId: handle }) }),
  z.strictObject({ phase: z.literal("inverse-construction-start"), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
  z.strictObject({ phase: z.literal("inverse-construction-helper"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
]);
export type CurrentFootprintInverseConstructionCommand = CurrentProjectSaveStructureCommand | z.infer<typeof extra>;
export function validateCurrentFootprintInverseConstructionCommand(input: unknown): CurrentFootprintInverseConstructionCommand {
  const value = captureCurrentPcbStringClockReply(input).value;
  try { return freezeDeep(extra.parse(value)); } catch { return validateCurrentProjectSaveStructureCommand(value); }
}
export function currentFootprintInverseConstructionWire(input: CurrentFootprintInverseConstructionCommand, id: number, sessionId: string): CurrentFootprintInverseConstructionCommand & Readonly<{ id: number; sessionId: string; inverseConstruction: true }> {
  if (!Number.isSafeInteger(id) || id < 1) { throw new Error("FOOTPRINT_INVERSE_CONSTRUCTION_ID"); }
  return freezeDeep({ ...validateCurrentFootprintInverseConstructionCommand(input), id, sessionId, inverseConstruction: true });
}
export function currentFootprintInverseConstructionNativeFrame(chunk: Buffer, input: CurrentFootprintInverseConstructionCommand, sessionId: string): Readonly<Record<string, string | number>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("FOOTPRINT_INVERSE_CONSTRUCTION_FRAME"); }
  const command = validateCurrentFootprintInverseConstructionCommand(input), raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  const value = captureCurrentPcbStringClockReply(raw).value;
  if (value === null || typeof value !== "object" || !("id" in value) || typeof value.id !== "number") { throw new Error("FOOTPRINT_INVERSE_CONSTRUCTION_FRAME"); }
  const expected = currentFootprintInverseConstructionWire(command, value.id, sessionId);
  if (canonicalJson(expected) !== canonicalJson(value) || chunk.toString("utf8") !== `${JSON.stringify(expected)}\0`) { throw new Error("FOOTPRINT_INVERSE_CONSTRUCTION_FRAME"); }
  const base = { action: "footprint-inverse-construction", requestId: value.id, phase: command.phase, method: command.method };
  if (command.phase === "inverse-construction-instrument") { return freezeDeep({ ...base, breakpointId: command.params.breakpointId }); }
  if (command.phase === "inverse-construction-helper") { return freezeDeep({ ...base, scriptId: command.params.scriptId }); }
  if (command.phase === "inverse-construction-start") { return freezeDeep(base); }
  return freezeDeep({ ...currentPcbViaWorkerWire(command, value.id).request, action: base.action });
}
