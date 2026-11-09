/** Wire writer observation grammar. Only fixed programs and lexical reads from
 * actual held frames enter this vocabulary. No resume or mutation is admitted. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RAW_COMBINE_PROGRAM, CURRENT_SCHEMATIC_RELEVANCE_RAW_DETAIL_PROGRAM, CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_EXPRESSION,
  CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_PROGRAM, CURRENT_SCHEMATIC_RELEVANCE_RAW_PROTOTYPES_PROGRAM, CURRENT_SCHEMATIC_RELEVANCE_RAW_REFERENCE_PROGRAM,
  CURRENT_SCHEMATIC_RELEVANCE_RAW_RELATED_PROGRAM, CURRENT_SCHEMATIC_RELEVANCE_RAW_SAME_PROGRAM, CURRENT_SCHEMATIC_RELEVANCE_RAW_SNAPSHOT_PROGRAM } from "./current-schematic-relevance-action-raw-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_ACTIVE_ACTION_CALLS as ACTION, CURRENT_SCHEMATIC_WIRE_ACTIVE_LEXICAL_SAME, CURRENT_SCHEMATIC_WIRE_CALLBACK_ENTRY, CURRENT_SCHEMATIC_WIRE_CALLBACK_POINT_AFTER, CURRENT_SCHEMATIC_WIRE_CALLBACK_POINT_BEFORE, CURRENT_SCHEMATIC_WIRE_CALLBACK_SETTER_BEFORE } from "./current-schematic-wire-active-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_INTENT_CALLS } from "./current-schematic-wire-intent-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_WRITER_FRAME_EXPRESSIONS as FRAMES } from "./current-schematic-wire-writer-programs.ts";

export const CURRENT_SCHEMATIC_WIRE_WRITER_GROUP = "easyeda-pro-control-schematic-wire-writer-v2";
export const CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS = Object.freeze({ objectGroup: CURRENT_SCHEMATIC_WIRE_WRITER_GROUP, silent: true, generatePreview: false, throwOnSideEffect: true } as const);
/** This retained snapshot visits the same original eight-model fixture and
 * native prototypes. No model-dependent Text program or origin is reused. */
export const CURRENT_SCHEMATIC_WIRE_WRITER_RAW_REQUESTS = Object.freeze({ rawObservation: 63 });
export const CURRENT_SCHEMATIC_WIRE_WRITER_RAW_CALLS = Object.freeze([
  ["wire-raw-native", CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_PROGRAM, 19, false], ["wire-raw-references", CURRENT_SCHEMATIC_RELEVANCE_RAW_REFERENCE_PROGRAM, 1, false],
  ["wire-raw-related", CURRENT_SCHEMATIC_RELEVANCE_RAW_RELATED_PROGRAM, 1, false], ["wire-raw-detail", CURRENT_SCHEMATIC_RELEVANCE_RAW_DETAIL_PROGRAM, 1, false],
  ["wire-raw-combine", CURRENT_SCHEMATIC_RELEVANCE_RAW_COMBINE_PROGRAM, 3, false], ["wire-raw-prototypes", CURRENT_SCHEMATIC_RELEVANCE_RAW_PROTOTYPES_PROGRAM, 1, false],
  ["wire-raw-snapshot", CURRENT_SCHEMATIC_RELEVANCE_RAW_SNAPSHOT_PROGRAM, 13, false], ["wire-raw-same", CURRENT_SCHEMATIC_RELEVANCE_RAW_SAME_PROGRAM, 1, true],
] as const);
export const CURRENT_SCHEMATIC_WIRE_WRITER_ACTIVE_REQUESTS = Object.freeze({ normal: 1 + 1 + 6 + 4 * (1 + 8 * 2 + 1) + 1, cleanup: 0, total: 81 });
const originalScope = CURRENT_SCHEMATIC_WIRE_INTENT_CALLS.scope;
const beforeStage = 'own(s,"modifyAttempted")!==false';
if (originalScope.split(beforeStage).length !== 2) { throw new Error("SCH209_WIRE_ACTIVE_SCOPE_STAGE"); }
const activeScope = originalScope.replace(beforeStage, 'own(s,"modifyAttempted")!==true');
export const CURRENT_SCHEMATIC_WIRE_WRITER_ACTIVE_CALLS = Object.freeze([
  ["wire-active-functions", ACTION.active, 0, false], ["wire-active-closure", ACTION.closure, 1, true], ["wire-active-same", ACTION.same, 1, true],
  ["wire-active-scope", activeScope, 0, false], ["wire-active-lexical-same", CURRENT_SCHEMATIC_WIRE_ACTIVE_LEXICAL_SAME, 6, true],
] as const);
export const CURRENT_SCHEMATIC_WIRE_WRITER_CALLBACK_CALLS = Object.freeze([
  ["wire-callback-entry-proof", CURRENT_SCHEMATIC_WIRE_CALLBACK_ENTRY, 3, false], ["wire-callback-point-before-proof", CURRENT_SCHEMATIC_WIRE_CALLBACK_POINT_BEFORE, 4, true],
  ["wire-callback-point-after-proof", CURRENT_SCHEMATIC_WIRE_CALLBACK_POINT_AFTER, 4, false], ["wire-callback-setter-before-proof", CURRENT_SCHEMATIC_WIRE_CALLBACK_SETTER_BEFORE, 5, true],
] as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), object = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_WRITER_GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const frameParams = z.strictObject({ ...flags, callFrameId: handle, expression: z.string().max(256), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
function frame(expression: string): typeof frameParams { return frameParams.refine(value => value.expression === expression); }
const calls = CURRENT_SCHEMATIC_WIRE_WRITER_RAW_CALLS.map(row => z.strictObject({ phase: z.literal(row[0]), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle,
  functionDeclaration: z.literal(row[1]), arguments: z.array(object).length(row[2]), returnByValue: z.literal(row[3]), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }));
const data = z.strictObject({ value: z.string().min(1).max(16_384) });
const activeCalls = CURRENT_SCHEMATIC_WIRE_WRITER_ACTIVE_CALLS.map(row => z.strictObject({ phase: z.literal(row[0]), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle,
  functionDeclaration: z.literal(row[1]), arguments: z.tuple([object, data, data], object).refine(value => value.length === row[2] + 3), returnByValue: z.literal(row[3]), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }));
const callbackCalls = CURRENT_SCHEMATIC_WIRE_WRITER_CALLBACK_CALLS.map(row => z.strictObject({ phase: z.literal(row[0]), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle,
  functionDeclaration: z.literal(row[1]), arguments: z.array(object).length(row[2]), returnByValue: z.literal(row[3]), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }));
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const sourceParams = z.strictObject({ scriptId: handle });
const schema = z.union([
  ...calls, ...activeCalls, ...callbackCalls,
  z.strictObject({ phase: z.literal("wire-raw-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frame(CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_EXPRESSION) }),
  z.strictObject({ phase: z.literal("wire-raw-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("wire-raw-source"), method: z.literal("Debugger.getScriptSource"), params: sourceParams }),
  ...Object.entries(FRAMES).map(([role, expression]) => z.strictObject({ phase: z.literal(`wire-callback-${role}`), method: z.literal("Debugger.evaluateOnCallFrame"), params: frame(expression) })),
  z.strictObject({ phase: z.literal("wire-run-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frame("[this,t,r]") }),
  z.strictObject({ phase: z.literal("wire-points-setter-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frame("[this,t]") }),
]);
export type CurrentSchematicWireWriterCommand = z.infer<typeof schema>;
/** Reject every caller program, unknown field and continuation method. */
export function validateCurrentSchematicWireWriterCommand(input: unknown): CurrentSchematicWireWriterCommand { return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value)); }
/** Enumerate every fixed raw, active-action and callback observation row. */
export function currentSchematicWireWriterCases(): readonly CurrentSchematicWireWriterCommand[] {
  return freezeDeep([
    ...CURRENT_SCHEMATIC_WIRE_WRITER_ACTIVE_CALLS.map(row => ({ phase: row[0], method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: [{ objectId: "original_holder" }, { value: "{}" }, { value: "{}" }, ...Array.from({ length: row[2] }, () => ({ objectId: "original_ref" }))], returnByValue: row[3], awaitPromise: false, userGesture: false } })),
    ...CURRENT_SCHEMATIC_WIRE_WRITER_CALLBACK_CALLS.map(row => ({ phase: row[0], method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })),
    ...CURRENT_SCHEMATIC_WIRE_WRITER_RAW_CALLS.map(row => ({ phase: row[0], method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })),
    { phase: "wire-raw-frame", method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS, callFrameId: "original_frame", expression: CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_EXPRESSION, returnByValue: false, includeCommandLineAPI: false } },
    { phase: "wire-raw-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "wire-raw-source", method: "Debugger.getScriptSource", params: { scriptId: "original_script" } },
    ...Object.entries(FRAMES).map(([role, expression]) => ({ phase: `wire-callback-${role}`, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS, callFrameId: "original_frame", expression, returnByValue: false, includeCommandLineAPI: false } })),
    ...[["wire-run-frame", "[this,t,r]"], ["wire-points-setter-frame", "[this,t]"]].map(([phase, expression]) => ({ phase, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS, callFrameId: "original_frame", expression, returnByValue: false, includeCommandLineAPI: false } })),
  ].map(command => validateCurrentSchematicWireWriterCommand(command)));
}
/** Substitute only original handles; native custody supplies bound data. */
export function currentSchematicWireWriterTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireWriterCommand(input), fields: Record<string, "handle"> = {}, values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_wirewriter_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  else { params["objectId"] = command.phase === "wire-raw-references" ? "__schematic_wirewriter_boundHolder__" : field("objectId", command.params.objectId);
    if (command.method === "Runtime.callFunctionOn") {
      const active = CURRENT_SCHEMATIC_WIRE_WRITER_ACTIVE_CALLS.some(row => row[0] === command.phase);
      params["arguments"] = command.params.arguments.map((argument, index) => {
        if (active && index === 0) { return { objectId: "__schematic_wirewriter_boundHolder__" }; }
        if (active && (index === 1 || index === 2)) { return { value: index === 1 ? "__schematic_wirewriter_boundTarget__" : "__schematic_wirewriter_boundOperation__" }; }
        if (!("objectId" in argument)) { throw new Error("SCHEMATIC_WIRE_WRITER_ARGUMENT_KIND"); }
        return { objectId: field(`argument${String(index)}`, argument.objectId) };
      });
    } }
  return freezeDeep({ phase: command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
/** Build the distinct Wire observation request without exposing its programs. */
export function currentSchematicWireWriterWire(input: unknown, id: number): Readonly<{ command: CurrentSchematicWireWriterCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("SCHEMATIC_WIRE_WRITER_REQUEST_ID"); }
  const command = validateCurrentSchematicWireWriterCommand(input), fixed = currentSchematicWireWriterTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-wire-writer-v2-observe", requestId: id, phase: fixed.phase, method: fixed.method, ...fixed.values } });
}
