/** Finite structure observer projection. Original transport ownership remains
 * required; this codec grants neither a native purpose nor writer eligibility. */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { validateCurrentProjectStructureMainCommand } from "./current-project-structure-main-protocol.ts";
import type { CurrentProjectStructureMainCommand as Command } from "./current-project-structure-main-protocol.ts";

/** Project only variable data. Programs, expressions, locations, flags and
 * argument shapes come from the native fixed table, never caller wire fields. */
export function currentProjectStructureMainWire(input: unknown, id: number): Readonly<{
  command: Command & Readonly<{ id: number }>; request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("PROJECT_STRUCTURE_MAIN_WIRE_ID"); }
  const command = validateCurrentProjectStructureMainCommand(input);
  const request: Record<string, string | number> = { action: "structure-main-send", requestId: id, phase: command.phase, method: command.method };
  if (command.phase === "structure-main-arm") {
    request["phase"] = `structure-main-site-${command.stage}`; request["scriptId"] = command.params.location.scriptId;
  } else if (command.phase === "structure-main-frame") {
    request["phase"] = `structure-main-frame-${command.stage}`; request["callFrameId"] = command.params.callFrameId;
  } else if (command.phase === "structure-main-join") {
    request["phase"] = `structure-main-join-${command.stage}`; request["objectId"] = command.params.objectId;
    for (const [index, arg] of command.params.arguments.entries()) {
      if ("objectId" in arg) { request[`argument${String(index)}`] = arg.objectId; }
      else { for (const [name, value] of Object.entries(arg.value)) { request[name] = value; } }
    }
  } else if (command.phase === "structure-main-properties") { request["objectId"] = command.params.objectId; }
  else if (command.phase === "structure-main-remove") { request["breakpointId"] = command.params.breakpointId; }
  // The schema accepts larger comparison trees. This transport separately
  // Refuses any packet that cannot fit its unchanged 32KiB helper input.
  const envelope = `${JSON.stringify({ helperInstance: "f".repeat(32), jobId: "f".repeat(32), rootPid: 4_294_967_295,
    rootCreated: "9".repeat(20), ...request, id: "f".repeat(32) })}\n`;
  if (Buffer.byteLength(envelope) > 32_768 || envelope.length >= 32_768 ||
      Buffer.byteLength(JSON.stringify({ id, method: command.method, params: command.params })) > 65_536) {
    throw new Error("PROJECT_STRUCTURE_MAIN_WIRE_BYTES");
  }
  return freezeDeep({ command: { ...command, id }, request });
}
