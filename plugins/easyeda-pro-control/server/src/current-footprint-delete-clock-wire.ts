/** Private fixed scalar projection. Only the original owner supplies both sessions;
 * no session, program, expression or condition is forwarded as a wire field. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_DELETE_CLOCK_SITES as SITES } from "./current-footprint-delete-clock-source.ts";
import { CURRENT_FOOTPRINT_DELETE_CLOCK_DELETE_CALLER as DELETE_CALLER, CURRENT_FOOTPRINT_DELETE_CLOCK_UI_CALLER as UI_CALLER, validateCurrentFootprintDeleteClockCommand } from "./current-footprint-delete-clock-protocol.ts";
import type { CurrentFootprintDeleteClockCommand as Command } from "./current-footprint-delete-clock-protocol.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const scalar = z.union([z.string(), z.number()]);
const scalarObject = z.record(z.string(), scalar);
const valueArgument = z.object({ value: z.union([scalar, scalarObject]) }).strict();
const objectArgument = z.object({ objectId: handle }).strict();
const args = z.array(z.union([objectArgument, valueArgument]));
const siteRoles = ["push", "dispatch", "result", "reply", "entry", "producer"] as const;
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FOOTPRINT_DELETE_CLOCK_WIRE_${code}`); } }
function fieldName(name: string): string { if (name === "requestId") { return "clockRequestId"; } return name === "value" ? "observedValue" : name; }
export function currentFootprintDeleteClockWire(input: unknown, id: number, originalWorkerSession: string, originalUiSession: string): Readonly<{
  command: Command & Readonly<{ id: number }>; request: Readonly<Record<string, string | number>>;
}> {
  need(Number.isSafeInteger(id) && id >= 1 && id <= 2_147_483_647, "ID");
  need(handle.max(128).safeParse(originalWorkerSession).success && handle.max(128).safeParse(originalUiSession).success && originalWorkerSession !== originalUiSession, "SESSIONS");
  const command = validateCurrentFootprintDeleteClockCommand(input);
  need(command.sessionId === originalWorkerSession || command.sessionId === originalUiSession, "SESSION");
  const realm = command.sessionId === originalWorkerSession ? "worker" : "ui";
  const request: Record<string, string | number> = { action: "footprint-delete-clock-send", requestId: id, phase: command.phase, method: command.method, realm };
  if (command.method === "Runtime.callFunctionOn") {
    need((command.phase === "delete-clock-ui" || command.phase === "delete-clock-result") === (realm === "ui"), "CALL_REALM");
    request["objectId"] = handle.parse(command.params["objectId"]);
    for (const [index, argument] of args.parse(command.params["arguments"]).entries()) {
      if ("objectId" in argument) { request[`argument${String(index)}`] = argument.objectId; }
      else if (typeof argument.value === "number") { request["ordinal"] = argument.value; }
      else if (typeof argument.value === "string") { request["uiUuid"] = argument.value; }
      else { for (const [name, value] of Object.entries(argument.value)) { request[fieldName(name)] = value; } }
    }
  } else if (command.method === "Debugger.setBreakpoint") {
    const role = command.role; need(role !== undefined && SITES[role].realm === realm, "SITE_REALM");
    request["phase"] = `delete-clock-site-${role}`;
    request["scriptId"] = handle.parse(z.object({ scriptId: handle }).loose().parse(command.params["location"]).scriptId);
    if (role !== "entry" && role !== "producer") {
      const condition = z.string().parse(command.params["condition"]); const selected = /this\.uuid==="([a-f\d-]{36})"/u.exec(condition)?.[1];
      need(selected !== undefined, "BUS"); request["busUuid"] = selected;
    }
  } else if (command.method === "Debugger.evaluateOnCallFrame") {
    const expression = command.params["expression"]; const role = siteRoles.find(value => SITES[value].expression === expression);
    need(role !== undefined || expression === UI_CALLER || expression === DELETE_CALLER, "FRAME");
    const callerRealm = expression === UI_CALLER ? "ui" : "worker";
    need((role === undefined ? callerRealm : SITES[role].realm) === realm, "FRAME_REALM");
    request["phase"] = `delete-clock-frame-${role ?? (expression === UI_CALLER ? "caller" : "deleteCaller")}`; request["callFrameId"] = handle.parse(command.params["callFrameId"]);
  } else if (command.method === "Runtime.getProperties") { request["objectId"] = handle.parse(command.params["objectId"]); }
  else if (command.method === "Debugger.removeBreakpoint") { request["breakpointId"] = handle.parse(command.params["breakpointId"]); }
  need(Buffer.byteLength(JSON.stringify({ id, method: command.method, sessionId: command.sessionId, params: command.params })) <= 65_536, "COMMAND_BYTES");
  const envelope = `${JSON.stringify({ helperInstance: "f".repeat(32), jobId: "f".repeat(32), rootPid: 4_294_967_295,
    rootCreated: "9".repeat(20), ...request, id: "f".repeat(32) })}\n`;
  need(Buffer.byteLength(envelope) <= 32_768 && envelope.length < 32_768, "ENVELOPE_BYTES");
  return freezeDeep({ command: { ...command, id }, request });
}
