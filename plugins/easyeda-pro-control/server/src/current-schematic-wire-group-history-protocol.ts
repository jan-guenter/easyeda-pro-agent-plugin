/** Finite readonly parent GROUP command vocabulary. There is no mutation,
 * breakpoint, resume, caller function, owner reconstruction or Save command. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_FRAMES as FRAMES, CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_PROGRAMS as PROGRAMS } from "./current-schematic-wire-group-history-programs.ts";

export const CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_FLAGS = Object.freeze({ objectGroup: "easyeda-pro-control-schematic-wire-group-history-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
// Before: frame3 + module5 + roots7 + publication roster3 + collections4
// + payload4 + details4 + records4 + attributes4 + points3 + coordinates4
// + snapshot2 =47. After: frame3 + roots6 + collections4 + payload4
// + details6 + records6 + attributes6 + points4 + coordinates6 + proof1 =46.
// Each of the nineteen generated function calls has its own source obligation.
export const CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_REQUESTS = Object.freeze({ before: 47, after: 46, normal: 93, helperSources: 19, cleanup: 1, total: 113 } as const);
export const CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_CALLS = freezeDeep({
  module: { program: PROGRAMS.module, refs: 3, byValue: false },
  beforeRoots: { program: PROGRAMS.beforeRoots, refs: 3, byValue: false },
  afterRoots: { program: PROGRAMS.afterRoots, refs: 4, byValue: false },
  collections: { program: PROGRAMS.collections, refs: 2, byValue: false },
  data: { program: PROGRAMS.data, refs: 2, byValue: false },
  beforeDetails: { program: PROGRAMS.beforeDetails, refs: 1, byValue: false },
  afterDetails: { program: PROGRAMS.afterDetails, refs: 1, byValue: false },
  beforeRecords: { program: PROGRAMS.beforeRecords, refs: 2, byValue: false },
  afterRecords: { program: PROGRAMS.afterRecords, refs: 2, byValue: false },
  beforeAttributes: { program: PROGRAMS.beforeAttributes, refs: 1, byValue: false },
  afterAttributes: { program: PROGRAMS.afterAttributes, refs: 1, byValue: false },
  beforePoints: { program: PROGRAMS.beforePoints, refs: 1, byValue: false },
  afterPoints: { program: PROGRAMS.afterPoints, refs: 1, byValue: false },
  beforeCoordinates: { program: PROGRAMS.beforeCoordinates, refs: 1, byValue: false },
  afterCoordinates: { program: PROGRAMS.afterCoordinates, refs: 1, byValue: false },
  snapshot: { program: PROGRAMS.snapshot, refs: 11, byValue: false },
  completed: { program: PROGRAMS.completed, refs: 12, byValue: true },
} as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), object = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const calls = Object.entries(CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_CALLS).map(([role, row]) => z.strictObject({ phase: z.literal("wire-group-history-call"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(row.program), arguments: z.array(object).length(row.refs), returnByValue: z.literal(row.byValue), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }));
const frames = Object.entries(FRAMES).map(([role, expression]) => z.strictObject({ phase: z.literal("wire-group-history-frame"), role: z.literal(role), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ ...flags, callFrameId: handle, expression: z.literal(expression), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) }) }));
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const releaseParams = z.strictObject({ objectGroup: flags.objectGroup });
const schema = z.union([...calls, ...frames,
  z.strictObject({ phase: z.literal("wire-group-history-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("wire-group-history-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentSchematicWireGroupHistoryCommand = z.infer<typeof schema>;
/** Accept exact reviewed rows and bounded original handles only. */
export function validateCurrentSchematicWireGroupHistoryCommand(input: unknown): CurrentSchematicWireGroupHistoryCommand { return freezeDeep(schema.parse(capture(input).value)); }
/** Enumerate inert canonical rows for native codebook composition. */
export function currentSchematicWireGroupHistoryCases(): readonly CurrentSchematicWireGroupHistoryCommand[] {
  return freezeDeep([
    ...Object.entries(CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_CALLS).map(([role, row]) => ({ phase: "wire-group-history-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_FLAGS, objectId: "original_ref", functionDeclaration: row.program, arguments: Array.from({ length: row.refs }, () => ({ objectId: "original_ref" })), returnByValue: row.byValue, awaitPromise: false, userGesture: false } })),
    ...Object.entries(FRAMES).map(([role, expression]) => ({ phase: "wire-group-history-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_FLAGS, callFrameId: "original_frame", expression, returnByValue: false, includeCommandLineAPI: false } })),
    { phase: "wire-group-history-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "wire-group-history-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_WIRE_GROUP_HISTORY_FLAGS.objectGroup } },
  ].map(command => validateCurrentSchematicWireGroupHistoryCommand(command)));
}
/** Substitute original handles without admitting any caller code or literals. */
export function currentSchematicWireGroupHistoryTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireGroupHistoryCommand(input), fields: Record<string, "handle"> = {}, values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_wiregrouphistory_${name}__`; };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  if (command.phase === "wire-group-history-call") { phase += `-${command.role}`; params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((arg, index) => ({ objectId: field(`arg${String(index)}`, arg.objectId) })); }
  else if (command.phase === "wire-group-history-frame") { phase += `-${command.role}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "wire-group-history-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  return freezeDeep({ phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
