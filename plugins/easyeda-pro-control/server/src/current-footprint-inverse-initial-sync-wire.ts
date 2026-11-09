/** Fixed inverse sync only. All remote IDs, data and measured numeric limits
 * are substituted by the same original owner, never a caller tool request. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentProjectSaveProducerTemplate } from "./current-project-save-producer-wire.ts";
import { currentFootprintInverseInitialSyncNativeCommands, validateCurrentFootprintInverseInitialSyncNativeCommand } from "./current-footprint-inverse-initial-sync-protocol.ts";
import type { CurrentFootprintInverseInitialSyncNativeCommand } from "./current-footprint-inverse-initial-sync-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const marker = (name: string): string => `__inverse_initial_sync_${name}__`;
const captureNames = ["key", "body", "nodes", "depth", "array", "keys", "string", "rows"] as const;
export function currentFootprintInverseInitialSyncTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: readonly string[]; numeric: readonly string[]; values: Readonly<Record<string, string | number>>; template: string }> {
  const command = validateCurrentFootprintInverseInitialSyncNativeCommand(input);
  if (command.phase.startsWith("project-save-producer-")) { const row = currentProjectSaveProducerTemplate(command); return freezeDeep({ ...row, numeric: [] }); }
  const numeric: string[] = [], values: Record<string, string | number> = {};
  const field = (name: string, value: string | number): string => { if (Object.hasOwn(values, name)) { throw new Error("FOOTPRINT_INVERSE_INITIAL_SYNC_FIELD_ALIAS"); } values[name] = value; if (typeof value === "number") { numeric.push(name); } return marker(name); };
  const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  else if (command.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.method !== "Debugger.resume") { params["objectId"] = field("objectId", z.looseObject({ objectId: z.string() }).parse(command.params).objectId); }
  if (command.method === "Runtime.callFunctionOn") {
    params["arguments"] = command.params.arguments.map((argument, index) => {
      if ("objectId" in argument) { return { objectId: field(`argument${String(index)}`, argument.objectId) }; }
      if (command.phase === "inverse-initial-sync-capture") { const name = captureNames[index - 4]; if (name === undefined) { throw new Error("FOOTPRINT_INVERSE_INITIAL_SYNC_CAPTURE_INDEX"); } return { value: field(name, argument.value) }; }
      if (command.phase === "inverse-initial-sync-baseline-objects") { return { value: field(index === 0 ? "nodes" : "depth", argument.value) }; }
      return argument;
    });
  }
  let suffix: string | null = null; if ("slot" in command) { suffix = String(command.slot); } else if ("ordinal" in command) { suffix = String(command.ordinal); } else if ("role" in command) { suffix = command.role; }
  return freezeDeep({ phase: command.phase + (suffix === null ? "" : `-${suffix}`), method: command.method, fields: Object.keys(values), numeric, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentFootprintInverseInitialSyncTemplates(): readonly ReturnType<typeof currentFootprintInverseInitialSyncTemplate>[] { return freezeDeep(currentFootprintInverseInitialSyncNativeCommands().map(value => currentFootprintInverseInitialSyncTemplate(value))); }
export function currentFootprintInverseInitialSyncWire(input: CurrentFootprintInverseInitialSyncNativeCommand, id: number, sessionId: string): CurrentFootprintInverseInitialSyncNativeCommand & Readonly<{ id: number; sessionId: string; inverseInitialSync: true }> {
  if (!Number.isSafeInteger(id) || id < 1 || !/^[A-Za-z\d_.:-]{1,256}$/u.test(sessionId)) { throw new Error("FOOTPRINT_INVERSE_INITIAL_SYNC_ENVELOPE"); } return freezeDeep({ ...validateCurrentFootprintInverseInitialSyncNativeCommand(input), id, sessionId, inverseInitialSync: true });
}
export function currentFootprintInverseInitialSyncNativeFrame(chunk: Buffer, input: CurrentFootprintInverseInitialSyncNativeCommand, sessionId: string): Readonly<Record<string, string | number>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("FOOTPRINT_INVERSE_INITIAL_SYNC_FRAME"); } const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1))); const value = z.looseObject({ id: z.number().int().positive() }).parse(captureCurrentPcbStringClockReply(raw).value);
  const command = validateCurrentFootprintInverseInitialSyncNativeCommand(input), expected = currentFootprintInverseInitialSyncWire(command, value.id, sessionId); if (canonicalJson(expected) !== canonicalJson(value) || chunk.toString("utf8") !== `${JSON.stringify(expected)}\0`) { throw new Error("FOOTPRINT_INVERSE_INITIAL_SYNC_FRAME"); }
  const row = currentFootprintInverseInitialSyncTemplate(command); return freezeDeep({ action: "footprint-inverse-initial-sync", requestId: value.id, phase: row.phase, method: row.method, ...row.values });
}
