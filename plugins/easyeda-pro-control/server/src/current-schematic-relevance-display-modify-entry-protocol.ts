/** Original held runner-entry reads only. No prefix/setter resume exists. */
import { z } from "zod";
import { GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_RUN_ENTRY_FUNCTION } from "./generated-schematic-display-action-program.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_GROUP = "easyeda-pro-control-schematic-relevance-modify-entry-v1";
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_REQUESTS = Object.freeze({ generation: 1, observation: 5, resume: 0 });
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_PROOF = `function(h,t,o,a,c){"use strict";return Reflect.apply(${GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_RUN_ENTRY_FUNCTION},this,[h,JSON.parse(t),JSON.parse(o),a,c]);}`;
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_EXPRESSION = "[this,t,r]";
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS = Object.freeze({ objectGroup: CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_GROUP, silent: true, generatePreview: false, throwOnSideEffect: true } as const);
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), object = z.strictObject({ objectId: handle });
const data = z.strictObject({ value: z.string().min(1).max(16_384) });
const frameParams = z.strictObject({ ...flags, callFrameId: handle, expression: z.literal(CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_EXPRESSION), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const propertiesParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const sourceParams = z.strictObject({ scriptId: handle });
const argumentsSchema = z.tuple([object, data, data, object, object]);
const proofParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_PROOF), arguments: argumentsSchema, returnByValue: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("schematic-modify-entry-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("schematic-modify-entry-properties"), method: z.literal("Runtime.getProperties"), params: propertiesParams }),
  z.strictObject({ phase: z.literal("schematic-modify-entry-source"), method: z.literal("Debugger.getScriptSource"), params: sourceParams }),
  z.strictObject({ phase: z.literal("schematic-modify-entry-proof"), method: z.literal("Runtime.callFunctionOn"), params: proofParams }),
]);
export type CurrentSchematicRelevanceDisplayModifyEntryCommand = z.infer<typeof schema>;
export function validateCurrentSchematicRelevanceDisplayModifyEntryCommand(input: unknown): CurrentSchematicRelevanceDisplayModifyEntryCommand { return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value)); }
export function currentSchematicRelevanceDisplayModifyEntryNativeCases(): readonly CurrentSchematicRelevanceDisplayModifyEntryCommand[] {
  return freezeDeep([
    { phase: "schematic-modify-entry-frame", method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS, callFrameId: "entry_frame", expression: CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_EXPRESSION, returnByValue: false, includeCommandLineAPI: false } },
    { phase: "schematic-modify-entry-properties", method: "Runtime.getProperties", params: { objectId: "entry_object", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "schematic-modify-entry-source", method: "Debugger.getScriptSource", params: { scriptId: "entry_script" } },
    { phase: "schematic-modify-entry-proof", method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS, objectId: "entry_object", functionDeclaration: CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_PROOF, arguments: [{ objectId: "entry_holder" }, { value: "{}" }, { value: "{}" }, { objectId: "entry_idle" }, { objectId: "entry_callback" }], returnByValue: true, awaitPromise: false, userGesture: false } },
  ].map(command => validateCurrentSchematicRelevanceDisplayModifyEntryCommand(command)));
}
export interface CurrentSchematicRelevanceDisplayModifyEntryTemplate { readonly phase: string; readonly method: string; readonly fields: Readonly<Record<string, "handle">>; readonly values: Readonly<Record<string, string>>; readonly template: string }
export function currentSchematicRelevanceDisplayModifyEntryTemplate(input: unknown): CurrentSchematicRelevanceDisplayModifyEntryTemplate {
  const command = validateCurrentSchematicRelevanceDisplayModifyEntryCommand(input), fields: Record<string, "handle"> = {}, values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_entry_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  else { params["objectId"] = field("objectId", command.params.objectId);
    if (command.method === "Runtime.callFunctionOn") { params["arguments"] = [{ objectId: "__schematic_entry_boundHolder__" }, { value: "__schematic_entry_boundTarget__" }, { value: "__schematic_entry_boundOperation__" }, { objectId: "__schematic_entry_boundIdle__" }, { objectId: field("callback", command.params.arguments[4].objectId) }]; } }
  return freezeDeep({ phase: command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicRelevanceDisplayModifyEntryWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicRelevanceDisplayModifyEntryCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_MODIFY_ENTRY_ID"); }
  const command = validateCurrentSchematicRelevanceDisplayModifyEntryCommand(input), row = currentSchematicRelevanceDisplayModifyEntryTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-display-modify-entry", requestId, phase: row.phase, method: row.method, ...row.values } });
}
