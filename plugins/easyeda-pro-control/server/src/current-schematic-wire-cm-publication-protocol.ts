/** Closed individual original CM/publication-caller comparison vocabulary. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_WIRE_PUBLICATION_OBJECT_GROUP } from "./current-schematic-wire-publication-values.ts";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_FRAMES as FRAMES, CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_PROGRAMS as PROGRAMS } from "./current-schematic-wire-cm-publication-programs.ts";

export const CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_FLAGS = Object.freeze({ objectGroup: CURRENT_SCHEMATIC_WIRE_PUBLICATION_OBJECT_GROUP, silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_REQUESTS = Object.freeze({ firstMaximum: 28, secondMaximum: 30, thirdMaximum: 31, approvedSlots: 32, helperSources: 9, cleanup: 1, totalMaximum: 99 } as const);
export const CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_CALLS = freezeDeep({
  approved: { program: PROGRAMS.approved, refs: 33, byValue: false },
  cm1: { program: PROGRAMS.cm1, refs: 5, byValue: false },
  cm2: { program: PROGRAMS.cm2, refs: 5, byValue: false },
  cm3: { program: PROGRAMS.cm3, refs: 5, byValue: false },
  values: { program: PROGRAMS.values, refs: 1, byValue: true },
} as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u); const object = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const calls = Object.entries(CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_CALLS).map(([role, row]) => z.strictObject({ phase: z.literal("wire-cm-publication-call"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(row.program), arguments: z.array(object).length(row.refs), returnByValue: z.literal(row.byValue), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }));
const frames = Object.entries(FRAMES).map(([role, expression]) => z.strictObject({ phase: z.literal("wire-cm-publication-frame"), role: z.literal(role), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ ...flags, callFrameId: handle, expression: z.literal(expression), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) }) }));
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const releaseParams = z.strictObject({ objectGroup: flags.objectGroup });
const schema = z.union([...calls, ...frames,
  z.strictObject({ phase: z.literal("wire-cm-publication-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("wire-cm-publication-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentSchematicWireCmPublicationCommand = z.infer<typeof schema>;
/** Accept exact reviewed rows and bounded original handles only. */
export function validateCurrentSchematicWireCmPublicationCommand(input: unknown): CurrentSchematicWireCmPublicationCommand { return freezeDeep(schema.parse(capture(input).value)); }
/** Enumerate inert canonical rows for native codebook composition. */
export function currentSchematicWireCmPublicationCases(): readonly CurrentSchematicWireCmPublicationCommand[] {
  return freezeDeep([
    ...Object.entries(CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_CALLS).map(([role, row]) => ({ phase: "wire-cm-publication-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_FLAGS, objectId: "original_ref", functionDeclaration: row.program, arguments: Array.from({ length: row.refs }, () => ({ objectId: "original_ref" })), returnByValue: row.byValue, awaitPromise: false, userGesture: false } })),
    ...Object.entries(FRAMES).map(([role, expression]) => ({ phase: "wire-cm-publication-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_FLAGS, callFrameId: "original_frame", expression, returnByValue: false, includeCommandLineAPI: false } })),
    { phase: "wire-cm-publication-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "wire-cm-publication-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_WIRE_CM_PUBLICATION_FLAGS.objectGroup } },
  ].map(command => validateCurrentSchematicWireCmPublicationCommand(command)));
}
/** Substitute original handles without admitting any caller code or literals. */
export function currentSchematicWireCmPublicationTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireCmPublicationCommand(input); const fields: Record<string, "handle"> = {}; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_wirecmpublication_${name}__`; };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  if (command.phase === "wire-cm-publication-call") { phase += `-${command.role}`; params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((arg, index) => ({ objectId: field(`arg${String(index)}`, arg.objectId) })); }
  else if (command.phase === "wire-cm-publication-frame") { phase += `-${command.role}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "wire-cm-publication-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  return freezeDeep({ phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
