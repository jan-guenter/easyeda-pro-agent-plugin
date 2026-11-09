/** Fixed Canvas controls vary only original opaque handles. Neither the
 * wire nor its hash catalogue can authorize a receiver, timer or body resume. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_CONTROL_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FRAMES as FRAMES, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FUNCTION_ROLES as FUNCTIONS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_ROLES as ROLES, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SOURCE_ROLES as SOURCES, currentSchematicRelevanceModifyCanvasFunctionPoint as functionPoint, currentSchematicRelevanceModifyCanvasPoint as point, validateCurrentSchematicRelevanceModifyCanvasControlCommand as validate } from "./current-schematic-relevance-modify-canvas-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyCanvasControlCommand as Command } from "./current-schematic-relevance-modify-canvas-control-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Enumerate the exact original source points, method arms and frame roles.
 * Created callbacks retain source guards until actual frame lineage is proved. */
export function currentSchematicRelevanceModifyCanvasControlCases(): readonly Command[] {
 const rows: Command[] = [];
 for (const role of SOURCES) { const at = point(role), start = functionPoint(role); rows.push(validate({ phase: "modify-canvas-control-possible", role, method: "Debugger.getPossibleBreakpoints", params: { start: { scriptId: "original_ref", ...start }, end: { scriptId: "original_ref", ...at, columnNumber: at.columnNumber + 1 }, restrictToFunction: true } }), validate({ phase: "modify-canvas-control-point", role, method: "Debugger.setBreakpoint", params: { location: { scriptId: "original_ref", ...at }, condition: "" } })); }
 for (const role of FUNCTIONS) { rows.push(validate({ phase: "modify-canvas-control-function", role, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "original_ref", condition: "" } })); }
 for (const role of [...ROLES, "executorCaller", "onChangeCaller"] as const) { rows.push(validate({ phase: "modify-canvas-control-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_ref", expression: FRAMES[role], returnByValue: false, includeCommandLineAPI: false } })); }
 for (const role of ROLES) { rows.push(validate({ phase: "modify-canvas-control-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: "original_ref" } }), validate({ phase: "modify-canvas-control-resume", role, method: "Debugger.resume", params: {} })); }
 return freezeDeep(rows);
}
/** Replace only validated original IDs. Each role retains a distinct native
 * row even where its CDP byte shape equals another source boundary. */
export function currentSchematicRelevanceModifyCanvasControlTemplate(input: unknown): Readonly<{ phase: string; method: string; names: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
 const command = validate(input), names: string[] = [], params: Record<string, unknown> = { ...command.params }, values: Record<string, string> = {};
 const field = (name: string, value: string): string => { if (!names.includes(name)) { names.push(name); } values[name] = value; return `__schematic_modifycanvascontrol_${name}__`; };
 if (command.phase === "modify-canvas-control-possible") { params["start"] = { ...command.params.start, scriptId: field("scriptId", command.params.start.scriptId) }; params["end"] = { ...command.params.end, scriptId: field("scriptId", command.params.end.scriptId) }; }
 else if (command.phase === "modify-canvas-control-point") { params["location"] = { ...command.params.location, scriptId: field("scriptId", command.params.location.scriptId) }; }
 else if (command.phase === "modify-canvas-control-function") { params["objectId"] = field("objectId", command.params.objectId); }
 else if (command.phase === "modify-canvas-control-frame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
 else if (command.phase === "modify-canvas-control-remove") { params["breakpointId"] = field("breakpointId", command.params.breakpointId); }
 return freezeDeep({ phase: `${command.phase}-${command.role}`, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
/** Produce no transport or grant. The original native Canvas ledger must
 * independently admit this exact action, role, request and private stage. */
export function currentSchematicRelevanceModifyCanvasControlWire(input: unknown, requestId: number): Readonly<{ command: Command; request: Readonly<Record<string, string | number>> }> {
 if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCH_MODIFY_CANVAS_CONTROL_REQUEST_ID"); }
 const command = validate(input), row = currentSchematicRelevanceModifyCanvasControlTemplate(command);
 return freezeDeep({ command, request: { action: "schematic-relevance-modify-canvas", requestId, phase: row.phase, method: row.method, ...row.values } });
}
