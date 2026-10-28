/** Original-main request projection. The native scheduler supplies the actual
 * retained connection and IDs; no URL, session, expression or program is sent. */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_COLLECTION_SITES as SITES, validateCurrentFootprintCopyMainRequestCollectCommand } from "./current-footprint-copy-main-request-protocol.ts";
import type { CurrentFootprintCopyMainRequestCollectCommand as Command } from "./current-footprint-copy-main-request-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_EXPRESSIONS as EXPRESSIONS } from "./current-footprint-copy-main-request-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_INVOCATION_EXPRESSIONS as INVOCATION } from "./current-footprint-copy-main-request-collect-programs.ts";

function argumentFields(command: Extract<Command, { method: "Runtime.callFunctionOn" }>, request: Record<string, string | number>): void {
  for (const [index, argument] of command.params.arguments.entries()) {
    if ("objectId" in argument) { request[`argument${String(index)}`] = argument.objectId; }
    else { for (const [name, value] of Object.entries(argument.value)) { request[name] = value; } }
  }
}
export function currentFootprintCopyMainRequestWire(input: unknown, id: number): Readonly<{
  command: Command & Readonly<{ id: number }>; request: Readonly<Record<string, string | number>>;
}> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("FOOTPRINT_MAIN_REQUEST_WIRE_ID"); }
  const command = validateCurrentFootprintCopyMainRequestCollectCommand(input), request: Record<string, string | number> = {
    action: "main-request-send", requestId: id, phase: command.phase, method: command.method,
  };
  if (command.phase === "request-controller") {
    const plan = command.params.arguments[1].value;
    if (plan.path.length > 4096 || plan.dataStr.length > 16_384 || Buffer.byteLength(plan.dataStr) > 16_384 ||
        !plan.path.isWellFormed() || !plan.dataStr.isWellFormed()) { throw new Error("FOOTPRINT_MAIN_REQUEST_PLAN_TEXT"); }
  }
  if (Buffer.byteLength(JSON.stringify({ ...command, id })) > 65_536) { throw new Error("FOOTPRINT_MAIN_REQUEST_COMMAND_BYTES"); }
  if (command.method === "Debugger.setBreakpoint") {
    request["scriptId"] = command.params.location.scriptId;
    const role = (["context", "controller", "editHead"] as const).find(value => SITES[value].lineNumber === command.params.location.lineNumber && SITES[value].columnNumber === command.params.location.columnNumber);
    if (role === undefined) { throw new Error("FOOTPRINT_MAIN_REQUEST_SITE"); } request["phase"] = `request-site-${role}`;
  } else if (command.method === "Debugger.setBreakpointOnFunctionCall") { request["objectId"] = command.params.objectId; }
  else if (command.method === "Debugger.evaluateOnCallFrame") {
    request["callFrameId"] = command.params.callFrameId;
    if (command.phase === "request-invocation-frame") {
      const role = command.params.expression === INVOCATION.driver ? "driver" : "caller"; request["phase"] = `request-invocation-frame-${role}`;
    } else {
      const role = (["context", "controller", "actor", "editHead"] as const).find(value => EXPRESSIONS[value] === command.params.expression);
      if (role === undefined) { throw new Error("FOOTPRINT_MAIN_REQUEST_FRAME"); } request["phase"] = `request-frame-${role}`;
    }
  } else if (command.method === "Debugger.removeBreakpoint") { request["breakpointId"] = command.params.breakpointId; }
  else if (command.method === "Runtime.getProperties" || command.method === "Runtime.callFunctionOn") {
    request["objectId"] = command.params.objectId;
    if (command.method === "Runtime.callFunctionOn") { argumentFields(command, request); }
  }
  const envelope = `${JSON.stringify({ helperInstance: "f".repeat(32), jobId: "f".repeat(32), rootPid: 4_294_967_295,
    rootCreated: "9".repeat(20), ...request, id: "f".repeat(32) })}\n`;
  if (Buffer.byteLength(envelope) > 32_768 || envelope.length >= 32_768) { throw new Error("FOOTPRINT_MAIN_REQUEST_ENVELOPE_BYTES"); }
  return freezeDeep({ command: { ...command, id }, request });
}
