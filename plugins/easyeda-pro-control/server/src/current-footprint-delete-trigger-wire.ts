/** Flat private projection. The future original owner supplies the worker
 * session and accounts every ID before a possible native write. */
import { validateCurrentFootprintDeleteTriggerCommand } from "./current-footprint-delete-trigger-protocol.ts";
import type { CurrentFootprintDeleteTriggerCommand } from "./current-footprint-delete-trigger-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentFootprintDeleteTriggerWire(input: unknown, id: number): Readonly<{
  command: CurrentFootprintDeleteTriggerCommand & Readonly<{ id: number }>;
  request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("FOOTPRINT_DELETE_TRIGGER_ID"); }
  const command = validateCurrentFootprintDeleteTriggerCommand(input);
  const request: Record<string, string | number> = { action: "footprint-delete-trigger-send", role: command.role, requestId: id, objectId: command.params.objectId };
  for (const [index, argument] of command.params.arguments.entries()) {
    if ("objectId" in argument) { request[`argument${String(index)}`] = argument.objectId; }
    else { for (const [key, value] of Object.entries(argument.value)) { request[key] = value; } }
  }
  if (Buffer.byteLength(JSON.stringify({ id, method: command.method, sessionId: command.sessionId, params: command.params })) > 16_384) {
    throw new Error("FOOTPRINT_DELETE_TRIGGER_COMMAND_BYTES");
  }
  return freezeDeep({ command: { ...command, id }, request });
}
