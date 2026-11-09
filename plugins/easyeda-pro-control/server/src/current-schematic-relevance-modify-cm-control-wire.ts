/** Fixed CM guards and captures use only original opaque IDs. The codec
 * cannot choose an owner, callee, source coordinate or resume permission. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_FRAMES as FRAMES, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_KINDS as KINDS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_RETURN_KINDS as RETURNS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_ROLES as ROLES, currentSchematicRelevanceModifyCmControlFunctionPoint as functionPoint, currentSchematicRelevanceModifyCmControlPoint as point, validateCurrentSchematicRelevanceModifyCmControlCommand as validate } from "./current-schematic-relevance-modify-cm-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyCmControlCommand as Command, CurrentSchematicRelevanceModifyCmControlRole as Role } from "./current-schematic-relevance-modify-cm-control-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_CANCEL_PROGRAM as CANCEL } from "./current-schematic-relevance-modify-ticket-control-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Enumerate the immutable source book, including the three original parent
 * batch controls. A separate native ledger must authorize every row use. */
export function currentSchematicRelevanceModifyCmControlCases(): readonly Command[] {
  const rows: Command[] = [];
  for (const kind of RETURNS) {
    let role: Role = "canWsReturned";
    if (kind === "remote") { role = "remoteReturned"; }
    if (kind === "ticket") { role = "ticketReturned"; }
    const at = point(role); const start = functionPoint(kind);
    rows.push(validate({ phase: "modify-cm-control-possible", kind, method: "Debugger.getPossibleBreakpoints", params: { start: { scriptId: "original_ref", ...start }, end: { scriptId: "original_ref", ...at, columnNumber: at.columnNumber + 1 }, restrictToFunction: true } }), validate({ phase: "modify-cm-control-return", kind, method: "Debugger.setBreakpoint", params: { location: { scriptId: "original_ref", ...at }, condition: "" } }));
  }
  for (const kind of KINDS) { rows.push(validate({ phase: "modify-cm-control-function", kind, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "original_ref", condition: "" } })); }
  for (const role of [...ROLES, "batchCaller"] as const) { rows.push(validate({ phase: "modify-cm-control-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_ref", expression: FRAMES[role], returnByValue: false, includeCommandLineAPI: false } })); }
  for (const role of ROLES) { rows.push(validate({ phase: "modify-cm-control-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: "original_ref" } }), validate({ phase: "modify-cm-control-resume", role, method: "Debugger.resume", params: {} })); }
  for (const role of ["batch", "batchReturned", "handlerReturned"] as const) { rows.push(validate({ phase: "modify-cm-control-batch-resume", role, method: "Debugger.resume", params: {} })); }
  for (const role of ["batchReturned", "handlerReturned"] as const) { rows.push(validate({ phase: "modify-cm-control-batch-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_ref", expression: "[this,s]", returnByValue: false, includeCommandLineAPI: false } })); }
  for (const role of ["handler", "batch", "batchReturned", "handlerReturned"] as const) { rows.push(validate({ phase: "modify-cm-control-batch-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: "original_ref" } })); }
  rows.push(validate({ phase: "modify-cm-control-cancel-ticket", method: "Runtime.callFunctionOn", params: { ...FLAGS, throwOnSideEffect: false, objectId: "original_ref", functionDeclaration: CANCEL, arguments: Array.from({ length: 4 }, () => ({ objectId: "original_ref" })), returnByValue: true, awaitPromise: false, userGesture: false } }));
  return freezeDeep(rows);
}
/** Replace only IDs after the exact fixed command has passed validation.
 * Role names keep equal-looking resume packets in separate native rows. */
export function currentSchematicRelevanceModifyCmControlTemplate(input: unknown): Readonly<{ phase: string; method: string; names: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
  const command = validate(input); const names: string[] = []; const values: Record<string, string> = {}; const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  const field = (name: string, value: string): string => { if (!names.includes(name)) { names.push(name); } values[name] = value; return `__schematic_modifycmcontrol_${name}__`; };
  if (command.phase === "modify-cm-control-possible") { phase += `-${command.kind}`; params["start"] = { ...command.params.start, scriptId: field("scriptId", command.params.start.scriptId) }; params["end"] = { ...command.params.end, scriptId: field("scriptId", command.params.end.scriptId) }; }
  else if (command.phase === "modify-cm-control-return") { phase += `-${command.kind}`; params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if (command.phase === "modify-cm-control-function") { phase += `-${command.kind}`; params["objectId"] = field("objectId", command.params.objectId); }
  else if ((command.phase === "modify-cm-control-frame" || command.phase === "modify-cm-control-batch-frame")) { phase += `-${command.role}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if ((command.phase === "modify-cm-control-remove" || command.phase === "modify-cm-control-batch-remove")) { phase += `-${command.role}`; params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  else if (command.phase === "modify-cm-control-cancel-ticket") { params["objectId"] = field("objectId", command.params.objectId); params["functionDeclaration"] = "__schematic_modifycmcontrol_program0__"; params["arguments"] = command.params.arguments.map((arg, index) => ({ objectId: field(`argument${String(index)}`, arg.objectId) })); }
  else { phase += `-${command.role}`; }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
/** Serialize a fixed packet without issuing any native continuation grant. */
export function currentSchematicRelevanceModifyCmControlWire(input: unknown, requestId: number): Readonly<{ command: Command; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCH_MODIFY_CM_CONTROL_REQUEST_ID"); }
  const command = validate(input); const row = currentSchematicRelevanceModifyCmControlTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-modify-cm-control", requestId, phase: row.phase, method: row.method, ...row.values } });
}
