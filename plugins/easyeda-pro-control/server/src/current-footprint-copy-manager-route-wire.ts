/** Fixed copy-purpose parent wire. Existing startup purposes must refuse this
 * envelope; the original parent session stays in the native owner. */
import { validateCurrentFootprintCopyManagerRouteCommand } from "./current-footprint-copy-manager-route-command.ts";
import type { CurrentFootprintCopyManagerRouteCommand } from "./current-footprint-copy-manager-route-command.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentFootprintCopyManagerRouteWire(input: unknown, id: number): Readonly<{
  command: CurrentFootprintCopyManagerRouteCommand & Readonly<{ id: number }>;
  request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("FOOTPRINT_COPY_MANAGER_ROUTE_WIRE_ID"); }
  const command = validateCurrentFootprintCopyManagerRouteCommand(input);
  const fields: Record<string, string | number> = { action: "worker-startup-parent", requestId: id,
    method: command.method, parentPhase: `footprint-copy-manager-route-${command.phase}` };
  if (command.method === "Debugger.getScriptSource") { fields["scriptId"] = command.params.scriptId; }
  if (command.method === "Runtime.getProperties") { fields["objectId"] = command.params.objectId; }
  if (command.method === "Runtime.callFunctionOn") {
    fields["objectId"] = command.params.objectId;
    let valueIndex = 0;
    for (const [index, argument] of command.params.arguments.entries()) {
      if ("objectId" in argument) { fields[`argument${String(index)}`] = argument.objectId; }
      else {
        const name = ["projectUuid", "branchUuid", "windowTabId"][valueIndex];
        if (name === undefined) { throw new Error("FOOTPRINT_COPY_MANAGER_ROUTE_WIRE_ARGUMENT"); }
        fields[name] = argument.value; valueIndex += 1;
      }
    }
  }
  return freezeDeep({ command: { ...command, id }, request: fields });
}
