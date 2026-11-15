/** Fixed readonly vocabulary for the two original scheduled bbox callbacks. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_WIRE_BBOX_FRAME as FRAME, CURRENT_SCHEMATIC_WIRE_BBOX_PROGRAMS as PROGRAMS } from "./current-schematic-wire-bbox-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_BBOX_FLAGS = Object.freeze({ objectGroup: "easyeda-pro-control-schematic-wire-bbox-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_WIRE_BBOX_CALLS = Object.freeze({ running: { program: PROGRAMS.running, refs: 4, byValue: false }, idle: { program: PROGRAMS.idle, refs: 4, byValue: false }, returned: { program: PROGRAMS.returned, refs: 3, byValue: true }, settled: { program: PROGRAMS.settled, refs: 3, byValue: true } } as const);
// The model census bounds each collection by the six persistent models plus
// Both old and both new endpoint markers. Entry: frame/receiver/action 4,
// Capture/snapshot/Promise 3, three arrays 3 and at most twenty pairs: 30.
// Return: 4. Settlement: at most 63 further polls and final identity: 64.
// Two ticks total 196 ordinary, six helper sources and one cleanup: 203.
export const CURRENT_SCHEMATIC_WIRE_BBOX_REQUESTS = Object.freeze({ collectionLimit: 10, entryMaximum: 30, returned: 4, settlementMaximum: 64, promisePollsMaximum: 64, normalMaximum: 196, helperSources: 6, cleanup: 1, totalMaximum: 203 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_BBOX_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const argument = z.strictObject({ objectId: handle });
const calls = Object.entries(CURRENT_SCHEMATIC_WIRE_BBOX_CALLS).map(([role, row]) => {
  const params = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(row.program), arguments: z.array(argument).length(row.refs), returnByValue: z.literal(row.byValue), awaitPromise: z.literal(false), userGesture: z.literal(false) });
  return z.strictObject({ phase: z.literal("wire-bbox-call"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"), params });
});
const frameParams = z.strictObject({ ...flags, callFrameId: handle, expression: z.literal(FRAME), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const frame = z.strictObject({ phase: z.literal("wire-bbox-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const properties = z.strictObject({ phase: z.literal("wire-bbox-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams });
const releaseParams = z.strictObject({ objectGroup: flags.objectGroup });
const release = z.strictObject({ phase: z.literal("wire-bbox-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams });
const schema = z.union([...calls, frame, properties, release]);
export type CurrentSchematicWireBboxCommand = z.infer<typeof schema>;
/** Admit only the exact programs, frame and selector shapes. */
export function validateCurrentSchematicWireBboxCommand(input: unknown): CurrentSchematicWireBboxCommand { return freezeDeep(schema.parse(capture(input).value)); }
/** This codebook is data for later native parity, not a writer route. */
export function currentSchematicWireBboxCases(): readonly CurrentSchematicWireBboxCommand[] {
  return freezeDeep([
    ...Object.entries(CURRENT_SCHEMATIC_WIRE_BBOX_CALLS).map(([role, row]) => ({ phase: "wire-bbox-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_BBOX_FLAGS, objectId: "original_ref", functionDeclaration: row.program, arguments: Array.from({ length: row.refs }, () => ({ objectId: "original_ref" })), returnByValue: row.byValue, awaitPromise: false, userGesture: false } })),
    { phase: "wire-bbox-frame", method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_WIRE_BBOX_FLAGS, callFrameId: "original_frame", expression: FRAME, returnByValue: false, includeCommandLineAPI: false } },
    { phase: "wire-bbox-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "wire-bbox-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_WIRE_BBOX_FLAGS.objectGroup } },
  ].map(row => validateCurrentSchematicWireBboxCommand(row)));
}
/** Only original handle placeholders vary; every program byte remains fixed. */
export function currentSchematicWireBboxTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireBboxCommand(input); const fields: Record<string, "handle"> = {}; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__wire_bbox_${name}__`; };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  if (command.phase === "wire-bbox-call") { phase += `-${command.role}`; params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((arg, index) => ({ objectId: field(`arg${String(index)}`, arg.objectId) })); }
  else if (command.phase === "wire-bbox-frame") { params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "wire-bbox-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  return freezeDeep({ phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
