/** Original inverse owns all selectors. Numeric head limits come only from
 * its complete saved graph; no program or raw CDP frame crosses this wire. */
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentProjectSaveProducerTemplate } from "./current-project-save-producer-wire.ts";
import { currentFootprintInverseInitialCacheCases, validateCurrentFootprintInverseInitialCacheCommand } from "./current-footprint-inverse-initial-cache-protocol.ts";
import type { CurrentFootprintInverseInitialCacheCommand } from "./current-footprint-inverse-initial-cache-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { z } from "zod";

const marker = (name: string): string => `__inverse_initial_cache_${name}__`;
const limits = ["nodes", "depth", "array", "keys", "string"] as const;
export interface CurrentFootprintInverseInitialCacheTemplate { readonly phase: string; readonly method: string; readonly fields: readonly string[]; readonly numeric: readonly string[]; readonly values: Readonly<Record<string, string | number>>; readonly template: string }
export function currentFootprintInverseInitialCacheTemplate(input: unknown): CurrentFootprintInverseInitialCacheTemplate {
  const command = validateCurrentFootprintInverseInitialCacheCommand(input);
  if (command.phase.startsWith("project-save-producer-")) { const row = currentProjectSaveProducerTemplate(command); return freezeDeep({ ...row, numeric: [] }); }
  const numeric: string[] = [], values: Record<string, string | number> = {};
  const field = (name: string, value: string | number): string => { if (Object.hasOwn(values, name)) { throw new Error("FOOTPRINT_INVERSE_INITIAL_CACHE_FIELD_ALIAS"); } values[name] = value; if (typeof value === "number") { numeric.push(name); } return marker(name); };
  const params: Record<string, unknown> = { ...command.params };
  if (command.phase === "inverse-initial-cache-helper") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  else if (command.method !== "Debugger.resume") { const parsed = z.looseObject({ objectId: z.string() }).parse(command.params); params["objectId"] = field("objectId", parsed.objectId); }
  if (command.phase === "inverse-initial-cache-flow" || command.phase === "inverse-initial-cache-head") {
    params["arguments"] = command.params.arguments.map((argument, index) => { let name: string | undefined; if (index === 0) { name = "key"; } else if (index === 1) { name = "body"; } else { name = limits[index - 2]; } if (name === undefined) { throw new Error("FOOTPRINT_INVERSE_INITIAL_CACHE_ARGUMENT"); } return { value: field(name, argument.value) }; });
  } else if (command.phase === "inverse-initial-cache-promise" || command.phase === "inverse-initial-cache-success") { params["arguments"] = command.params.arguments.map((argument, index) => ({ objectId: field(`argument${String(index)}`, argument.objectId) })); }
  const phase = `${command.phase}${"role" in command ? `-${command.role}` : ""}${"slot" in command ? `-${String(command.slot)}` : ""}`;
  return freezeDeep({ phase, method: command.method, fields: Object.keys(values), numeric, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentFootprintInverseInitialCacheTemplates(): readonly CurrentFootprintInverseInitialCacheTemplate[] { return freezeDeep(currentFootprintInverseInitialCacheCases().map(command => currentFootprintInverseInitialCacheTemplate(command))); }
export function currentFootprintInverseInitialCacheWire(input: CurrentFootprintInverseInitialCacheCommand, id: number, sessionId: string): CurrentFootprintInverseInitialCacheCommand & Readonly<{ id: number; sessionId: string; inverseInitialCache: true }> {
  if (!Number.isSafeInteger(id) || id < 1 || !/^[A-Za-z\d_.:-]{1,256}$/u.test(sessionId)) { throw new Error("FOOTPRINT_INVERSE_INITIAL_CACHE_ENVELOPE"); }
  return freezeDeep({ ...validateCurrentFootprintInverseInitialCacheCommand(input), id, sessionId, inverseInitialCache: true });
}
export function currentFootprintInverseInitialCacheNativeFrame(chunk: Buffer, input: CurrentFootprintInverseInitialCacheCommand, sessionId: string): Readonly<Record<string, string | number>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("FOOTPRINT_INVERSE_INITIAL_CACHE_FRAME"); }
  const raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1))); const value = z.looseObject({ id: z.number().int().positive() }).parse(captureCurrentPcbStringClockReply(raw).value);
  const command = validateCurrentFootprintInverseInitialCacheCommand(input), expected = currentFootprintInverseInitialCacheWire(command, value.id, sessionId);
  if (canonicalJson(expected) !== canonicalJson(value) || chunk.toString("utf8") !== `${JSON.stringify(expected)}\0`) { throw new Error("FOOTPRINT_INVERSE_INITIAL_CACHE_FRAME"); }
  const row = currentFootprintInverseInitialCacheTemplate(command); return freezeDeep({ action: "footprint-inverse-initial-cache", requestId: value.id, phase: row.phase, method: row.method, ...row.values });
}
