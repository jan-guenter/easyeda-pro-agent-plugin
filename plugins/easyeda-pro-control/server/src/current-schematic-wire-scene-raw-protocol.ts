/** New readonly Wire scene raw vocabulary. Released grammars and their
 * packet counts stay unchanged; caller JavaScript and resumes are excluded. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RAW_COMBINE_PROGRAM as COMBINE, CURRENT_SCHEMATIC_RELEVANCE_RAW_DETAIL_PROGRAM as DETAIL, CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_EXPRESSION as FRAME, CURRENT_SCHEMATIC_RELEVANCE_RAW_NATIVE_PROGRAM as NATIVE, CURRENT_SCHEMATIC_RELEVANCE_RAW_PROTOTYPES_PROGRAM as PROTOTYPES, CURRENT_SCHEMATIC_RELEVANCE_RAW_RELATED_PROGRAM as RELATED, CURRENT_SCHEMATIC_RELEVANCE_RAW_SAME_PROGRAM as SAME } from "./current-schematic-relevance-action-raw-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_SCENE_RAW_REFERENCES as REFERENCES, CURRENT_SCHEMATIC_WIRE_SCENE_RAW_SNAPSHOT as SNAPSHOT } from "./current-schematic-wire-scene-raw-programs.ts";

export const CURRENT_SCHEMATIC_WIRE_SCENE_RAW_FLAGS = Object.freeze({ objectGroup: "easyeda-pro-control-schematic-wire-scene-raw-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
// Nineteen actual fixed function calls. The 63-step reader already reads the
// Snapshot/guard source once; eighteen other original helper sources remain.
export const CURRENT_SCHEMATIC_WIRE_SCENE_RAW_REQUESTS = Object.freeze({ rawObservation: 63, functionCalls: 19, helperSources: 18, cleanup: 1, total: 82 } as const);
export const CURRENT_SCHEMATIC_WIRE_SCENE_RAW_CALLS = Object.freeze([
  ["wire-scene-raw-native", NATIVE, 19, false], ["wire-scene-raw-references", REFERENCES, 1, false],
  ["wire-scene-raw-related", RELATED, 1, false], ["wire-scene-raw-detail", DETAIL, 1, false],
  ["wire-scene-raw-combine", COMBINE, 3, false], ["wire-scene-raw-prototypes", PROTOTYPES, 1, false],
  ["wire-scene-raw-snapshot", SNAPSHOT, 13, false], ["wire-scene-raw-same", SAME, 1, true],
] as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u); const object = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_SCENE_RAW_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const calls = CURRENT_SCHEMATIC_WIRE_SCENE_RAW_CALLS.map(row => z.strictObject({ phase: z.literal(row[0]), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(row[1]), arguments: z.array(object).length(row[2]), returnByValue: z.literal(row[3]), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }));
const frame = z.strictObject({ ...flags, callFrameId: handle, expression: z.literal(FRAME), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const props = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const source = z.strictObject({ scriptId: handle }); const release = z.strictObject({ objectGroup: flags.objectGroup });
const schema = z.union([...calls,
  z.strictObject({ phase: z.literal("wire-scene-raw-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frame }),
  z.strictObject({ phase: z.literal("wire-scene-raw-properties"), method: z.literal("Runtime.getProperties"), params: props }),
  z.strictObject({ phase: z.literal("wire-scene-raw-source"), method: z.literal("Debugger.getScriptSource"), params: source }),
  z.strictObject({ phase: z.literal("wire-scene-raw-release"), method: z.literal("Runtime.releaseObjectGroup"), params: release }),
]);
export type CurrentSchematicWireSceneRawCommand = z.infer<typeof schema>;
/** Parse exact fixed source, flags and original handle slots only. */
export function validateCurrentSchematicWireSceneRawCommand(input: unknown): CurrentSchematicWireSceneRawCommand { return freezeDeep(schema.parse(capture(input).value)); }
/** Canonical inert codebook rows are data only. */
export function currentSchematicWireSceneRawCases(): readonly CurrentSchematicWireSceneRawCommand[] {
  return freezeDeep([
    ...CURRENT_SCHEMATIC_WIRE_SCENE_RAW_CALLS.map(row => ({ phase: row[0], method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_SCENE_RAW_FLAGS, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })),
    { phase: "wire-scene-raw-frame", method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_WIRE_SCENE_RAW_FLAGS, callFrameId: "original_frame", expression: FRAME, returnByValue: false, includeCommandLineAPI: false } },
    { phase: "wire-scene-raw-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "wire-scene-raw-source", method: "Debugger.getScriptSource", params: { scriptId: "original_script" } },
    { phase: "wire-scene-raw-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_WIRE_SCENE_RAW_FLAGS.objectGroup } },
  ].map(row => validateCurrentSchematicWireSceneRawCommand(row)));
}
/** Only bounded original selectors replace canonical native handle tokens. */
export function currentSchematicWireSceneRawTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireSceneRawCommand(input); const fields: Record<string, "handle"> = {}; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_wiresceneraw_${name}__`; };
  const params: Record<string, unknown> = { ...command.params };
  if (command.method === "Runtime.callFunctionOn") { params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((arg, index) => ({ objectId: field(`arg${String(index)}`, arg.objectId) })); }
  else if (command.method === "Runtime.getProperties") { params["objectId"] = field("objectId", command.params.objectId); }
  else if (command.method === "Debugger.evaluateOnCallFrame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.method === "Debugger.getScriptSource") { params["scriptId"] = field("scriptId", command.params.scriptId); }
  return freezeDeep({ phase: command.phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
