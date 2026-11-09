/** Closed source controls for the two original streams. Only opaque handles
 * vary; the selected realm remains an owner-side native ledger decision. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FRAMES as FRAMES, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FUNCTIONS as FUNCTIONS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_RETURNS as RETURNS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_ROLES as ROLES, currentSchematicRelevanceModifyEchoControlFunction as functionPoint, currentSchematicRelevanceModifyEchoControlPoint as sourcePoint, validateCurrentSchematicRelevanceModifyEchoControlCommand as validate } from "./current-schematic-relevance-modify-echo-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyEchoControlCommand as Command } from "./current-schematic-relevance-modify-echo-control-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Enumerate every fixed control, including both installed UI profiles and
 * the separate final retirement of the already-consumed publication lane. */
export function currentSchematicRelevanceModifyEchoControlCases(): readonly Command[] {
  const rows: Command[] = [validate({phase:"modify-echo-control-prior-remove",role:"cmRemote",method:"Debugger.removeBreakpoint",params:{breakpointId:"original_ref"}})];
  for (const role of FUNCTIONS) { rows.push(validate({ phase: "modify-echo-control-function", role, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "original_ref", condition: "" } })); }
  for (const role of RETURNS) { for (const variant of [0, 1] as const) { if (variant === 0 || !role.startsWith("worker")) {
    const start = { scriptId: "original_ref", ...functionPoint(variant, role) }; const at = { scriptId: "original_ref", ...sourcePoint(variant, role) };
    rows.push(validate({ phase: "modify-echo-control-possible", role, variant, method: "Debugger.getPossibleBreakpoints", params: { start, end: { ...at, columnNumber: at.columnNumber + 1 }, restrictToFunction: true } }), validate({ phase: "modify-echo-control-point", role, variant, method: "Debugger.setBreakpoint", params: { location: at, condition: "" } }));
  } } }
  for (const role of ROLES) {
    rows.push(validate({ phase: "modify-echo-control-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_ref", expression: FRAMES[role], returnByValue: false, includeCommandLineAPI: false } }), validate({ phase: "modify-echo-control-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: "original_ref" } }), validate({ phase: "modify-echo-control-resume", role, method: "Debugger.resume", params: {} }));
  }
  for (const role of ["publicationPost", "publicationPostReturned", "publicationPublisherReturned", "publicationTimerReturned", "publicationLoopback", "publicationLoopbackReturned"] as const) { rows.push(validate({ phase: "modify-echo-control-publication-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: "original_ref" } })); }
  rows.push(validate({ phase: "modify-echo-control-publication-resume", role: "publicationLoopbackReturned", method: "Debugger.resume", params: {} }));
  return freezeDeep(rows);
}
/** Bake the fixed role and source profile into the row key. Native callers
 * supply handle values, never a role table or a new source coordinate. */
export function currentSchematicRelevanceModifyEchoControlTemplate(input: unknown): Readonly<{ phase: string; method: string; names: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
  const command = validate(input); const names: string[] = []; const values: Record<string, string> = {}; const params: Record<string, unknown> = { ...command.params };
  const field = (name: string, value: string): string => { if (!names.includes(name)) { names.push(name); } values[name] = value; return `__schematic_echoctrl_${name}__`; };
  const phase = `${command.phase}${"variant" in command ? `-${String(command.variant)}` : ""}-${command.role}`;
  if (command.phase === "modify-echo-control-function") { params["objectId"] = field("objectId", command.params.objectId); }
  else if (command.phase === "modify-echo-control-possible") { params["start"] = { ...command.params.start, scriptId: field("scriptId", command.params.start.scriptId) }; params["end"] = { ...command.params.end, scriptId: field("scriptId", command.params.end.scriptId) }; }
  else if (command.phase === "modify-echo-control-point") { params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
  else if (command.phase === "modify-echo-control-frame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "modify-echo-control-remove" || command.phase === "modify-echo-control-publication-remove" || command.phase === "modify-echo-control-prior-remove") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
/** Encode only the already-validated closed row. This is not a resume permit;
 * the genuine owner must join its original held event and native ledger. */
export function currentSchematicRelevanceModifyEchoControlWire(input: unknown, requestId: number): Readonly<{ command: Command; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCH_ECHO_CONTROL_REQUEST_ID"); }
  const command = validate(input); const row = currentSchematicRelevanceModifyEchoControlTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-modify-echo-control", requestId, phase: row.phase, method: row.method, ...row.values } });
}
