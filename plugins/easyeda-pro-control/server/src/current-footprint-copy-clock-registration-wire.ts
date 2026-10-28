/** Parent-only registration grammar. The native owner supplies its original
 * session; callers cannot name a replacement session or send program source. */
import { validateCurrentFootprintCopyClockRegistrationCommand } from "./current-footprint-copy-clock-registration-contract.ts";
import type { CurrentFootprintCopyClockRegistrationCommand } from "./current-footprint-copy-clock-registration-contract.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentFootprintCopyClockRegistrationWire(input: unknown, id: number, originalParentSession: string): Readonly<{
  command: CurrentFootprintCopyClockRegistrationCommand & Readonly<{ id: number }>;
  request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("FOOTPRINT_COPY_CLOCK_REGISTRATION_WIRE_ID"); }
  const command = validateCurrentFootprintCopyClockRegistrationCommand(input);
  if (!/^[A-Za-z\d_.:-]{1,128}$/u.test(originalParentSession) || command.sessionId !== originalParentSession) { throw new Error("FOOTPRINT_COPY_CLOCK_REGISTRATION_WIRE_SESSION"); }
  const request: Record<string, string | number> = { action: "worker-startup-parent", requestId: id, method: command.method, parentPhase: `footprint-copy-clock-registration-${command.phase}` };
  if (command.method === "Debugger.getScriptSource") { request["scriptId"] = command.params.scriptId; }
  if (command.method === "Runtime.getProperties") { request["objectId"] = command.params.objectId; }
  if (command.method === "Runtime.callFunctionOn") {
    request["objectId"] = command.params.objectId; let valueIndex = 0;
    for (const [index, argument] of command.params.arguments.entries()) {
      if ("objectId" in argument) { request[`argument${String(index)}`] = argument.objectId; }
      else { const name = ["projectUuid", "branchUuid", "windowTabId"][valueIndex]; if (name === undefined) { throw new Error("FOOTPRINT_COPY_CLOCK_REGISTRATION_WIRE_ARGUMENT"); } request[name] = argument.value; valueIndex += 1; }
    }
  }
  return freezeDeep({ command: { ...command, id }, request });
}
