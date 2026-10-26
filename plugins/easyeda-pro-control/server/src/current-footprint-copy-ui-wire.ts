/** Fixed copy-purpose parent wire. Existing startup purposes must refuse this
 * envelope; the original parent session stays in the native owner. */
import { validateCurrentFootprintCopyUiCommand } from "./current-footprint-copy-ui-command.ts";
import type { CurrentFootprintCopyUiCommand } from "./current-footprint-copy-ui-command.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentFootprintCopyUiWire(input: unknown, id: number): Readonly<{
  command: CurrentFootprintCopyUiCommand & Readonly<{ id: number }>;
  request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("FOOTPRINT_COPY_UI_WIRE_ID"); }
  const command = validateCurrentFootprintCopyUiCommand(input);
  const fields: Record<string, string | number> = { action: "worker-startup-parent", requestId: id,
    method: command.method, parentPhase: `footprint-copy-ui-${command.phase}` };
  if (command.method === "Runtime.getProperties") { fields["objectId"] = command.params.objectId; }
  if (command.method === "Runtime.callFunctionOn") {
    fields["uniqueContextId" in command.params ? "uniqueContextId" : "objectId"] =
      "uniqueContextId" in command.params ? command.params.uniqueContextId : command.params.objectId;
    let valueIndex = 0;
    for (const [index, argument] of command.params.arguments.entries()) {
      if ("objectId" in argument) { fields[`argument${String(index)}`] = argument.objectId; }
      else {
        const name = ["projectUuid", "branchUuid", "windowTabId"][valueIndex];
        if (name === undefined) { throw new Error("FOOTPRINT_COPY_UI_WIRE_ARGUMENT"); }
        fields[name] = argument.value; valueIndex += 1;
      }
    }
  }
  return freezeDeep({ command: { ...command, id }, request: fields });
}
