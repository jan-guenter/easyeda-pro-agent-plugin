/** Fixed readonly grammar for the actual disabled private annotation branch. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_PROGRAMS as PROGRAMS } from "./current-schematic-wire-annotation-absence-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_FLAGS = Object.freeze({ objectGroup: "easyeda-pro-control-wire-annotation-absence-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_CALLS = Object.freeze({
  roots: { program: PROGRAMS.roots, refs: 1, byValue: false }, factoryMain: { program: PROGRAMS.factoryMain, refs: 1, byValue: false }, factoryEditor: { program: PROGRAMS.factoryEditor, refs: 1, byValue: false },
  privateMain: { program: PROGRAMS.privateMain, refs: 1, byValue: false }, privateEditor: { program: PROGRAMS.privateEditor, refs: 1, byValue: false }, complete: { program: PROGRAMS.complete, refs: 4, byValue: true },
} as const);
// Roots/page: 3; at most 12 prototypes; method/scopes: 2; first scope search:
// At most 8 calls plus factory metadata/scopes: 2; second search: 8 calls;
// One returned tuple and final comparison: 2. Each of at most 18 actual
// Helpers has its own source obligation. One cleanup gives total 56.
export const CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_REQUESTS = Object.freeze({ prototypeLimit: 12, scopeLimit: 8, normalMaximum: 37, helperSourcesMaximum: 18, cleanup: 1, totalMaximum: 56 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const argument = z.strictObject({ objectId: handle });
const calls = Object.entries(CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_CALLS).map(([role, row]) => {
  const params = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(row.program), arguments: z.array(argument).length(row.refs), returnByValue: z.literal(row.byValue), awaitPromise: z.literal(false), userGesture: z.literal(false) });
  return z.strictObject({ phase: z.literal("wire-annotation-absence-call"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"), params });
});
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const properties = z.strictObject({ phase: z.literal("wire-annotation-absence-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams });
const releaseParams = z.strictObject({ objectGroup: flags.objectGroup });
const release = z.strictObject({ phase: z.literal("wire-annotation-absence-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams });
const schema = z.union([...calls, properties, release]);
export type CurrentSchematicWireAnnotationAbsenceCommand = z.infer<typeof schema>;
/** Only exact original handle selectors vary; caller programs and actions refuse. */
export function validateCurrentSchematicWireAnnotationAbsenceCommand(input: unknown): CurrentSchematicWireAnnotationAbsenceCommand { return freezeDeep(schema.parse(capture(input).value)); }
/** Enumerate this separate data grammar for later native parity, without a route. */
export function currentSchematicWireAnnotationAbsenceCases(): readonly CurrentSchematicWireAnnotationAbsenceCommand[] {
  return freezeDeep([
    ...Object.entries(CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_CALLS).map(([role, row]) => ({ phase: "wire-annotation-absence-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_FLAGS, objectId: "original_ref", functionDeclaration: row.program, arguments: Array.from({ length: row.refs }, () => ({ objectId: "original_ref" })), returnByValue: row.byValue, awaitPromise: false, userGesture: false } })),
    { phase: "wire-annotation-absence-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "wire-annotation-absence-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_WIRE_ANNOTATION_ABSENCE_FLAGS.objectGroup } },
  ].map(row => validateCurrentSchematicWireAnnotationAbsenceCommand(row)));
}
/** Preserve exact program bytes and derive handle-only native placeholders. */
export function currentSchematicWireAnnotationAbsenceTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireAnnotationAbsenceCommand(input); const fields: Record<string, "handle"> = {}; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__wire_annotation_absence_${name}__`; };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  if (command.phase === "wire-annotation-absence-call") { phase += `-${command.role}`; params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((arg, index) => ({ objectId: field(`arg${String(index)}`, arg.objectId) })); }
  else if (command.phase === "wire-annotation-absence-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  return freezeDeep({ phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
