/** Closed read-only original batch vocabulary. No publisher, worker, timer,
 * resolver, Save or caller function can be invoked through these commands. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_WIRE_PUBLICATION_OBJECT_GROUP } from "./current-schematic-wire-publication-values.ts";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_FRAMES as FRAMES, CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_PROGRAMS as PROGRAMS } from "./current-schematic-wire-pending-batch-programs.ts";

export const CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_FLAGS = Object.freeze({ objectGroup: CURRENT_SCHEMATIC_WIRE_PUBLICATION_OBJECT_GROUP, silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_REQUESTS = Object.freeze({ approvedSlots: 32, payloadMaximum: 37, publishedMaximum: 7, timerReturned: 3, settlementMaximum: 64, helperSourcesMaximum: 8, cleanup: 1, totalMaximum: 120 } as const);
export const CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_CALLS = freezeDeep({
  approved: { program: PROGRAMS.approved, refs: 33, byValue: false },
  payload: { program: PROGRAMS.payload, refs: 1, byValue: false },
  capture: { program: PROGRAMS.capture, refs: 5, byValue: false },
  values: { program: PROGRAMS.values, refs: 1, byValue: true },
  afterRoot: { program: PROGRAMS.afterRoot, refs: 3, byValue: false },
  published: { program: PROGRAMS.published, refs: 3, byValue: false },
  timerReturned: { program: PROGRAMS.timerReturned, refs: 4, byValue: true },
} as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u); const object = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const calls = Object.entries(CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_CALLS).map(([role, row]) => z.strictObject({ phase: z.literal("wire-pending-batch-call"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(row.program), arguments: z.array(object).length(row.refs), returnByValue: z.literal(row.byValue), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }));
const frames = Object.entries(FRAMES).map(([role, expression]) => z.strictObject({ phase: z.literal("wire-pending-batch-frame"), role: z.literal(role), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ ...flags, callFrameId: handle, expression: z.literal(expression), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) }) }));
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const releaseParams = z.strictObject({ objectGroup: flags.objectGroup });
const schema = z.union([...calls, ...frames,
  z.strictObject({ phase: z.literal("wire-pending-batch-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("wire-pending-batch-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentSchematicWirePendingBatchCommand = z.infer<typeof schema>;
/** Accept exact reviewed rows and bounded original handles only. */
export function validateCurrentSchematicWirePendingBatchCommand(input: unknown): CurrentSchematicWirePendingBatchCommand { return freezeDeep(schema.parse(capture(input).value)); }
/** Enumerate inert canonical rows for native codebook composition. */
export function currentSchematicWirePendingBatchCases(): readonly CurrentSchematicWirePendingBatchCommand[] {
  return freezeDeep([
    ...Object.entries(CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_CALLS).map(([role, row]) => ({ phase: "wire-pending-batch-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_FLAGS, objectId: "original_ref", functionDeclaration: row.program, arguments: Array.from({ length: row.refs }, () => ({ objectId: "original_ref" })), returnByValue: row.byValue, awaitPromise: false, userGesture: false } })),
    ...Object.entries(FRAMES).map(([role, expression]) => ({ phase: "wire-pending-batch-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_FLAGS, callFrameId: "original_frame", expression, returnByValue: false, includeCommandLineAPI: false } })),
    { phase: "wire-pending-batch-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "wire-pending-batch-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_WIRE_PENDING_BATCH_FLAGS.objectGroup } },
  ].map(command => validateCurrentSchematicWirePendingBatchCommand(command)));
}
/** Substitute original handles without admitting any caller code or literals. */
export function currentSchematicWirePendingBatchTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWirePendingBatchCommand(input); const fields: Record<string, "handle"> = {}; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_wirependingbatch_${name}__`; };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  if (command.phase === "wire-pending-batch-call") { phase += `-${command.role}`; params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((arg, index) => ({ objectId: field(`arg${String(index)}`, arg.objectId) })); }
  else if (command.phase === "wire-pending-batch-frame") { phase += `-${command.role}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "wire-pending-batch-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  return freezeDeep({ phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}

/** Three CM frames (89) plus the batch tail (111), seventeen generated-source
 * obligations and one shared original object-group cleanup. */
export const CURRENT_SCHEMATIC_WIRE_PUBLICATION_SEQUENCE_REQUESTS = Object.freeze({ cm: 89, batch: 111, normal: 200, helperSources: 17, cleanup: 1, total: 218 } as const);
