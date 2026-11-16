/** Closed, read-only vocabulary for one original serialized tree child. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_WIRE_ASYNC_FRAMES as FRAMES, CURRENT_SCHEMATIC_WIRE_ASYNC_PROGRAMS as PROGRAMS } from "./current-schematic-wire-async-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_ASYNC_FLAGS = Object.freeze({ objectGroup: "easyeda-pro-control-schematic-wire-async-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_WIRE_ASYNC_CALLS = Object.freeze({
  entryObject: { program: PROGRAMS.entryObject, refs: 5, byValue: false }, entryPage: { program: PROGRAMS.entryPage, refs: 5, byValue: false },
  entryNet: { program: PROGRAMS.entryNet, refs: 5, byValue: false }, entrySymbol: { program: PROGRAMS.entrySymbol, refs: 5, byValue: false },
  target: { program: PROGRAMS.target, refs: 3, byValue: true }, targetExtended: { program: PROGRAMS.targetExtended, refs: 3, byValue: true },
  caller: { program: PROGRAMS.caller, refs: 3, byValue: true }, scope: { program: PROGRAMS.scope, refs: 1, byValue: false },
  returned: { program: PROGRAMS.returned, refs: 3, byValue: false }, settled: { program: PROGRAMS.settled, refs: 4, byValue: true },
} as const);
// Entry: 9; target receiver: 3; caller/closure/initial Promise: 10; at most 63 further
// Metadata polls and five final fresh-scope/idle comparisons. Seven actual helper
// Invocations each need source qualification, plus one cleanup obligation.
export const CURRENT_SCHEMATIC_WIRE_ASYNC_REQUESTS = Object.freeze({ entry: 9, target: 3, continuation: 10, settlementMaximum: 68, promisePollsMaximum: 64, scopeLimit: 8, normalMaximum: 90, helperSources: 7, cleanup: 1, totalMaximum: 98 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_ASYNC_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const argument = z.strictObject({ objectId: handle });
const calls = Object.entries(CURRENT_SCHEMATIC_WIRE_ASYNC_CALLS).map(([role, row]) => z.strictObject({ phase: z.literal("wire-async-call"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(row.program), arguments: z.array(argument).length(row.refs), returnByValue: z.literal(row.byValue), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }));
const frames = Object.entries(FRAMES).map(([role, expression]) => z.strictObject({ phase: z.literal("wire-async-frame"), role: z.literal(role), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ ...flags, callFrameId: handle, expression: z.literal(expression), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) }) }));
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const properties = z.strictObject({ phase: z.literal("wire-async-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams });
const releaseParams = z.strictObject({ objectGroup: flags.objectGroup });
const release = z.strictObject({ phase: z.literal("wire-async-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams });
const schema = z.union([...calls, ...frames, properties, release]);
export type CurrentSchematicWireAsyncCommand = z.infer<typeof schema>;
/** Caller code, navigation, resume, awaitPromise and unbounded selectors refuse. */
export function validateCurrentSchematicWireAsyncCommand(input: unknown): CurrentSchematicWireAsyncCommand { return freezeDeep(schema.parse(capture(input).value)); }
/** Fixed inert rows support later native parity without granting a route. */
export function currentSchematicWireAsyncCases(): readonly CurrentSchematicWireAsyncCommand[] {
  return freezeDeep([
    ...Object.entries(CURRENT_SCHEMATIC_WIRE_ASYNC_CALLS).map(([role, row]) => ({ phase: "wire-async-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_ASYNC_FLAGS, objectId: "original_ref", functionDeclaration: row.program, arguments: Array.from({ length: row.refs }, () => ({ objectId: "original_ref" })), returnByValue: row.byValue, awaitPromise: false, userGesture: false } })),
    ...Object.entries(FRAMES).map(([role, expression]) => ({ phase: "wire-async-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_WIRE_ASYNC_FLAGS, callFrameId: "original_frame", expression, returnByValue: false, includeCommandLineAPI: false } })),
    { phase: "wire-async-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "wire-async-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_WIRE_ASYNC_FLAGS.objectGroup } },
  ].map(row => validateCurrentSchematicWireAsyncCommand(row)));
}
/** Only original opaque handle fields may vary in the fixed command roster. */
export function currentSchematicWireAsyncTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireAsyncCommand(input); const fields: Record<string, "handle"> = {}; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_wireasync_${name}__`; };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  if (command.phase === "wire-async-frame") { phase += `-${command.role}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "wire-async-call") { phase += `-${command.role}`; params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((arg, index) => ({ objectId: field(`arg${String(index)}`, arg.objectId) })); }
  else if (command.phase === "wire-async-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  return freezeDeep({ phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
