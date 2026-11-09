/** Fixed passive Canvas packets carry original handles only. No caller source,
 * source coordinate, owner token or continuation control enters this wire. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FRAMES as FRAMES, validateCurrentSchematicRelevanceModifyCanvasCommand as validate } from "./current-schematic-relevance-modify-canvas-protocol.ts";
import type { CurrentSchematicRelevanceModifyCanvasCommand as Command } from "./current-schematic-relevance-modify-canvas-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Enumerate the exact inert frame, properties and source-owned helper rows. */
export function currentSchematicRelevanceModifyCanvasCases(): readonly Command[] {
  const rows: Command[] = [validate({ phase: "modify-canvas-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })];
  for (const role of ["enums", "entry", "dataChange", "caller", "constructed", "executor", "onChangeCaller"] as const) { rows.push(validate({ phase: "modify-canvas-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original_ref", expression: FRAMES[role], returnByValue: false, includeCommandLineAPI: false } })); }
  for (const row of CALLS) { rows.push(validate({ phase: "modify-canvas-call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })); }
  return freezeDeep(rows);
}
/** Replace only the opaque original IDs in one already validated command. */
export function currentSchematicRelevanceModifyCanvasTemplate(input: unknown): Readonly<{ phase: string; method: string; names: readonly string[]; values: Readonly<Record<string, string>>; template: string }> {
  const command = validate(input); const names: string[] = []; const values: Record<string, string> = {}; const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  const field = (name: string, value: string): string => { if (!names.includes(name)) { names.push(name); } values[name] = value; return `__schematic_modifycanvas_${name}__`; };
  if (command.phase === "modify-canvas-frame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); phase += `-${command.role}`; }
  else { params["objectId"] = field("objectId", command.params.objectId); if (command.phase === "modify-canvas-call") { const index = CALLS.findIndex(row => row[0] === command.role); if (index === -1) { throw new Error("SCH_MODIFY_CANVAS_PROGRAM_INDEX"); } phase += `-${command.role}`; params["functionDeclaration"] = `__schematic_modifycanvas_program${String(index)}__`; params["arguments"] = command.params.arguments.map((arg, argumentIndex) => ({ objectId: field(`argument${String(argumentIndex)}`, arg.objectId) })); } }
  return freezeDeep({ phase, method: command.method, names, values, template: JSON.stringify({ method: command.method, params }) });
}
/** Serialize passive data only; the original native state machine must
 * separately admit this exact phase while the original CM body is held. */
export function currentSchematicRelevanceModifyCanvasWire(input: unknown, requestId: number): Readonly<{ command: Command; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCH_MODIFY_CANVAS_REQUEST_ID"); }
  const command = validate(input); const row = currentSchematicRelevanceModifyCanvasTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-modify-canvas", requestId, phase: row.phase, method: row.method, ...row.values } });
}
