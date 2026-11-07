/** The original native owner supplies the worker session. */
import { currentGeneratedInitialCacheNativeCases, validateCurrentGeneratedInitialCacheCommand } from "./current-generated-initial-cache-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const marker = (name: string): string => `__initial_cache_${name}__`;
export function currentGeneratedInitialCacheTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentGeneratedInitialCacheCommand(input), values: Record<string, string> = {};
  const field = (name: string, value: string): string => { if (Object.hasOwn(values, name)) { throw new Error("INITIAL_CACHE_FIELD_ALIAS"); } values[name] = value; return marker(name); };
  const params: Record<string, unknown> = { ...command.params };
  if (command.method !== "Debugger.resume") { params["objectId"] = field("objectId", command.params.objectId); }
  if (command.method === "Runtime.callFunctionOn") { params["arguments"] = command.params.arguments.map((argument, index) => "value" in argument ? { value: field(index === 0 ? "key" : "body", argument.value) } : { objectId: field(`argument${String(index)}`, argument.objectId) }); }
  return freezeDeep({ phase: `${command.phase}${"role" in command ? `-${command.role}` : ""}-${String(command.slot)}`, method: command.method, fields: Object.keys(values), values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentGeneratedInitialCacheWire(input: unknown, id: number, purpose: "via" | "schematic"): Readonly<{ command: ReturnType<typeof validateCurrentGeneratedInitialCacheCommand>; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("INITIAL_CACHE_ID"); }
  const command = validateCurrentGeneratedInitialCacheCommand(input), row = currentGeneratedInitialCacheTemplate(command);
  return freezeDeep({ command, request: { action: purpose === "via" ? "pcb-via-initial-cache" : "schematic-display-initial-cache", requestId: id, phase: row.phase, method: row.method, ...row.values } });
}
export function currentGeneratedInitialCacheTemplates(): readonly ReturnType<typeof currentGeneratedInitialCacheTemplate>[] { return freezeDeep(currentGeneratedInitialCacheNativeCases().map(command => currentGeneratedInitialCacheTemplate(command))); }
