/** Original held runner-entry reads only. No prefix/setter resume exists. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_AFTER_RUN_PROOF as AFTER_RUN_PROOF, CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_BIND as CALLBACK_BIND, CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_DETAILS as CALLBACK_DETAILS, CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_EXPRESSIONS as CALLBACK_EXPRESSIONS, CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_SAME as CALLBACK_SAME, CURRENT_SCHEMATIC_RELEVANCE_ACTION_RECEIVER_PROOF as RECEIVER_PROOF } from "./current-schematic-relevance-action-callback-programs.ts";
import { GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_RUN_ENTRY_FUNCTION } from "./generated-schematic-display-action-program.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UNDERLINE_PROGRAM as UNDERLINE, CURRENT_SCHEMATIC_RELEVANCE_UNDERLINE_EXPRESSIONS as UNDERLINE_EXPRESSIONS } from "./current-schematic-relevance-underline-program.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RAW_COMBINE_PROGRAM, CURRENT_SCHEMATIC_RELEVANCE_RAW_DETAIL_PROGRAM, CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_EXPRESSION,
  CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_PROGRAM, CURRENT_SCHEMATIC_RELEVANCE_RAW_PROTOTYPES_PROGRAM, CURRENT_SCHEMATIC_RELEVANCE_RAW_REFERENCE_PROGRAM,
  CURRENT_SCHEMATIC_RELEVANCE_RAW_RELATED_PROGRAM, CURRENT_SCHEMATIC_RELEVANCE_RAW_SAME_PROGRAM, CURRENT_SCHEMATIC_RELEVANCE_RAW_SNAPSHOT_PROGRAM } from "./current-schematic-relevance-action-raw-programs.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_GROUP = "easyeda-pro-control-schematic-relevance-modify-entry-v1";
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_REQUESTS = Object.freeze({ generation: 1, observation: 5, rawObservation: 63, underlineEligibility: 5, resume: 0 });
export const CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_REQUESTS = Object.freeze({ arms: 3, entry: 9, receiver: 3 * 3, binding: 1, total: 22 });
const originalEntryProof = GENERATED_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_RUN_ENTRY_FUNCTION;
const oldOptions = 'Reflect.ownKeys(options).length!==2||own(options,"history")!==true||own(options,"name")!=="Codex disposable Text display"';
const newOptions = 'Reflect.ownKeys(options).length!==4||own(options,"history")!==true||own(options,"name")!=="Codex disposable Text display"||own(options,"timeout")!==0||!Array.isArray(own(options,"dependencies"))||Object.getPrototypeOf(own(options,"dependencies"))!==Array.prototype||Reflect.ownKeys(own(options,"dependencies")).length!==1||own(own(options,"dependencies"),"length")!==0';
if (originalEntryProof.split(oldOptions).length !== 2) { throw new Error("SCHEMATIC_RELEVANCE_ENTRY_OPTIONS_ANCHOR"); }
const ownEntryProof = originalEntryProof.replace(oldOptions, newOptions);
export const CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_PROOF = `function(h,t,o,a,c){"use strict";return Reflect.apply(${ownEntryProof},this,[h,JSON.parse(t),JSON.parse(o),a,c]);}`;
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
export const CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_CALLS = Object.freeze([
  ["schematic-callback-details", CALLBACK_DETAILS, 1, false], ["schematic-callback-bind", CALLBACK_BIND, 4, false], ["schematic-callback-same", CALLBACK_SAME, 5, true],
  ["schematic-callback-after-run", AFTER_RUN_PROOF, 3, true], ["schematic-callback-receiver-proof", RECEIVER_PROOF, 2, true],
] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_RAW_CALLS = Object.freeze([
  ["schematic-raw-native", CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_PROGRAM, 19, false], ["schematic-raw-references", CURRENT_SCHEMATIC_RELEVANCE_RAW_REFERENCE_PROGRAM, 1, false],
  ["schematic-raw-related", CURRENT_SCHEMATIC_RELEVANCE_RAW_RELATED_PROGRAM, 1, false], ["schematic-raw-detail", CURRENT_SCHEMATIC_RELEVANCE_RAW_DETAIL_PROGRAM, 1, false],
  ["schematic-raw-combine", CURRENT_SCHEMATIC_RELEVANCE_RAW_COMBINE_PROGRAM, 3, false], ["schematic-raw-prototypes", CURRENT_SCHEMATIC_RELEVANCE_RAW_PROTOTYPES_PROGRAM, 1, false],
  ["schematic-raw-snapshot", CURRENT_SCHEMATIC_RELEVANCE_RAW_SNAPSHOT_PROGRAM, 13, false], ["schematic-raw-same", CURRENT_SCHEMATIC_RELEVANCE_RAW_SAME_PROGRAM, 1, true],
] as const);
const rawPhases = z.enum(["schematic-raw-native", "schematic-raw-references", "schematic-raw-related", "schematic-raw-detail", "schematic-raw-combine", "schematic-raw-prototypes", "schematic-raw-snapshot", "schematic-raw-same"]);
const rawCalls = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(object).max(19), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const rawFrameParams = frameParams.extend({ expression: z.literal(CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_EXPRESSION) });
const underlineMainParams = frameParams.extend({ expression: z.literal(UNDERLINE_EXPRESSIONS[0]) });
const underlineChildParams = frameParams.extend({ expression: z.literal(UNDERLINE_EXPRESSIONS[1]) });
const underlineArguments = z.tuple([object, object]);
const underlineProofParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(UNDERLINE), arguments: underlineArguments, returnByValue: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const callbackEntryParams = frameParams.extend({ expression: z.literal(CALLBACK_EXPRESSIONS.entry) });
const callbackReceiverParams = frameParams.extend({ expression: z.literal(CALLBACK_EXPRESSIONS.receiver) });
const callbackArmParams = z.strictObject({ objectId: handle, condition: z.literal("") });
const callbackPhases = z.enum(["schematic-callback-details", "schematic-callback-bind", "schematic-callback-same", "schematic-callback-after-run", "schematic-callback-receiver-proof"]);
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("schematic-callback-arm-setAttribute"), method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: callbackArmParams }),
  z.strictObject({ phase: z.literal("schematic-callback-arm-record"), method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: callbackArmParams }),
  z.strictObject({ phase: z.literal("schematic-callback-arm-ast"), method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: callbackArmParams }),
  z.strictObject({ phase: z.literal("schematic-callback-entry-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: callbackEntryParams }),
  z.strictObject({ phase: z.literal("schematic-callback-receiver-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: callbackReceiverParams }),
  z.strictObject({ phase: z.literal("schematic-callback-properties"), method: z.literal("Runtime.getProperties"), params: propertiesParams }),
  z.strictObject({ phase: callbackPhases, method: z.literal("Runtime.callFunctionOn"), params: rawCalls }),
  z.strictObject({ phase: z.literal("schematic-underline-frame-main"), method: z.literal("Debugger.evaluateOnCallFrame"), params: underlineMainParams }),
  z.strictObject({ phase: z.literal("schematic-underline-frame-child"), method: z.literal("Debugger.evaluateOnCallFrame"), params: underlineChildParams }),
  z.strictObject({ phase: z.literal("schematic-underline-properties"), method: z.literal("Runtime.getProperties"), params: propertiesParams }),
  z.strictObject({ phase: z.literal("schematic-underline-proof"), method: z.literal("Runtime.callFunctionOn"), params: underlineProofParams }),
  z.strictObject({ phase: z.literal("schematic-modify-entry-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("schematic-modify-entry-properties"), method: z.literal("Runtime.getProperties"), params: propertiesParams }),
  z.strictObject({ phase: z.literal("schematic-modify-entry-source"), method: z.literal("Debugger.getScriptSource"), params: sourceParams }),
  z.strictObject({ phase: z.literal("schematic-modify-entry-proof"), method: z.literal("Runtime.callFunctionOn"), params: proofParams }),
  z.strictObject({ phase: z.literal("schematic-raw-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: rawFrameParams }),
  z.strictObject({ phase: z.literal("schematic-raw-properties"), method: z.literal("Runtime.getProperties"), params: propertiesParams }),
  z.strictObject({ phase: z.literal("schematic-raw-source"), method: z.literal("Debugger.getScriptSource"), params: sourceParams }),
  z.strictObject({ phase: rawPhases, method: z.literal("Runtime.callFunctionOn"), params: rawCalls }),
]);
export type CurrentSchematicRelevanceDisplayModifyEntryCommand = z.infer<typeof schema>;
export function validateCurrentSchematicRelevanceDisplayModifyEntryCommand(input: unknown): CurrentSchematicRelevanceDisplayModifyEntryCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.method === "Runtime.callFunctionOn" && command.phase !== "schematic-modify-entry-proof" && command.phase !== "schematic-underline-proof") { const row = [...CURRENT_SCHEMATIC_RELEVANCE_RAW_CALLS, ...CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_CALLS].find(item => item[0] === command.phase); if (row === undefined || command.params.functionDeclaration !== row[1] || command.params.arguments.length !== row[2] || command.params.returnByValue !== row[3]) { throw new Error("SCHEMATIC_RAW_FIXED_PROGRAM"); } }
  return freezeDeep(command);
}
export function currentSchematicRelevanceDisplayModifyEntryNativeCases(): readonly CurrentSchematicRelevanceDisplayModifyEntryCommand[] {
  return freezeDeep([
    ...["setAttribute", "record", "ast"].map(role => ({ phase: `schematic-callback-arm-${role}`, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: "entry_function", condition: "" } })),
    ...Object.entries(CALLBACK_EXPRESSIONS).map(([role, expression]) => ({ phase: `schematic-callback-${role}-frame`, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS, callFrameId: "entry_frame", expression, returnByValue: false, includeCommandLineAPI: false } })),
    { phase: "schematic-callback-properties", method: "Runtime.getProperties", params: { objectId: "entry_object", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    ...CURRENT_SCHEMATIC_RELEVANCE_ACTION_CALLBACK_CALLS.map(row => ({ phase: row[0], method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS, objectId: "entry_object", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "entry_argument" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })),
    ...UNDERLINE_EXPRESSIONS.map((expression, index) => ({ phase: index === 0 ? "schematic-underline-frame-main" : "schematic-underline-frame-child", method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS, callFrameId: "entry_frame", expression, returnByValue: false, includeCommandLineAPI: false } })),
    { phase: "schematic-underline-properties", method: "Runtime.getProperties", params: { objectId: "entry_object", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "schematic-underline-proof", method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS, objectId: "entry_object", functionDeclaration: UNDERLINE, arguments: [{ objectId: "entry_native" }, { objectId: "entry_map" }], returnByValue: true, awaitPromise: false, userGesture: false } },
    { phase: "schematic-modify-entry-frame", method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS, callFrameId: "entry_frame", expression: CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_EXPRESSION, returnByValue: false, includeCommandLineAPI: false } },
    { phase: "schematic-modify-entry-properties", method: "Runtime.getProperties", params: { objectId: "entry_object", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "schematic-modify-entry-source", method: "Debugger.getScriptSource", params: { scriptId: "entry_script" } },
    { phase: "schematic-modify-entry-proof", method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS, objectId: "entry_object", functionDeclaration: CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_PROOF, arguments: [{ objectId: "entry_holder" }, { value: "{}" }, { value: "{}" }, { objectId: "entry_idle" }, { objectId: "entry_callback" }], returnByValue: true, awaitPromise: false, userGesture: false } },
    { phase: "schematic-raw-frame", method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS, callFrameId: "entry_frame", expression: CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_EXPRESSION, returnByValue: false, includeCommandLineAPI: false } },
    { phase: "schematic-raw-properties", method: "Runtime.getProperties", params: { objectId: "entry_object", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "schematic-raw-source", method: "Debugger.getScriptSource", params: { scriptId: "entry_script" } },
    ...CURRENT_SCHEMATIC_RELEVANCE_RAW_CALLS.map(row => ({ phase: row[0], method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS, objectId: "entry_object", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "entry_argument" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })),
  ].map(command => validateCurrentSchematicRelevanceDisplayModifyEntryCommand(command)));
}
export interface CurrentSchematicRelevanceDisplayModifyEntryTemplate { readonly phase: string; readonly method: string; readonly fields: Readonly<Record<string, "handle">>; readonly values: Readonly<Record<string, string>>; readonly template: string }
export function currentSchematicRelevanceDisplayModifyEntryTemplate(input: unknown): CurrentSchematicRelevanceDisplayModifyEntryTemplate {
  const command = validateCurrentSchematicRelevanceDisplayModifyEntryCommand(input), fields: Record<string, "handle"> = {}, values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_entry_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  else { params["objectId"] = command.phase === "schematic-raw-references" ? "__schematic_entry_boundHolder__" : field("objectId", command.params.objectId);
    if (command.method === "Runtime.callFunctionOn") {
      params["arguments"] = command.phase === "schematic-modify-entry-proof" ? [{ objectId: "__schematic_entry_boundHolder__" }, { value: "__schematic_entry_boundTarget__" }, { value: "__schematic_entry_boundOperation__" }, { objectId: "__schematic_entry_boundIdle__" }, { objectId: field("callback", command.params.arguments[4].objectId) }] : command.params.arguments.map((argument, index) => ({ objectId: field(`argument${String(index)}`, argument.objectId) }));
    } }
  return freezeDeep({ phase: command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
export function currentSchematicRelevanceDisplayModifyEntryWire(input: unknown, requestId: number): Readonly<{ command: CurrentSchematicRelevanceDisplayModifyEntryCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(requestId) || requestId < 1 || requestId > 2_147_483_647) { throw new Error("SCHEMATIC_MODIFY_ENTRY_ID"); }
  const command = validateCurrentSchematicRelevanceDisplayModifyEntryCommand(input), row = currentSchematicRelevanceDisplayModifyEntryTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-relevance-display-modify-entry", requestId, phase: row.phase, method: row.method, ...row.values } });
}
