/** Fixed original-main command projection. The retained native owner supplies
 * the original connection; no URL, session or program crosses this boundary. */
import { validateCurrentFootprintCopyMainBackendCommand } from "./current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintCopyMainBackendCommand as Command } from "./current-footprint-copy-main-backend-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE as SOURCE } from "./current-footprint-copy-main-backend-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentFootprintCopyMainBackendWire(input: unknown, id: number): Readonly<{
  command: Command & Readonly<{ id: number }>; request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("FOOTPRINT_MAIN_BACKEND_WIRE_ID"); }
  const command = validateCurrentFootprintCopyMainBackendCommand(input);
  const request: Record<string, string | number> = { action: "main-send", requestId: id, phase: command.phase, method: command.method };
  if (command.method === "Debugger.getScriptSource") { request["scriptId"] = command.params.scriptId; }
  else if (command.method === "Debugger.setBreakpoint") {
    request["scriptId"] = command.params.location.scriptId;
    request["phase"] = command.params.location.columnNumber === SOURCE.registration.https.breakpointColumnNumber ? "breakpoint-https" : "breakpoint-http";
  } else if (command.method === "Debugger.removeBreakpoint") { request["breakpointId"] = command.params.breakpointId; }
  else if (command.method === "Debugger.evaluateOnCallFrame") { request["callFrameId"] = command.params.callFrameId; }
  else if (command.method === "Runtime.getProperties" || command.method === "Runtime.callFunctionOn") {
    request["objectId"] = command.params.objectId;
    if (command.phase === "require") { request["argument0"] = command.params.arguments[0].objectId; }
  }
  return freezeDeep({ command: { ...command, id }, request });
}
