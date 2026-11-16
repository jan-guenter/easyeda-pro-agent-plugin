/** Finite read-only graph census and comparison; no mutation or event command. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_PROGRAMS as PROGRAMS } from "./current-schematic-wire-derived-rtree-programs.ts";

export const CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_FLAGS = Object.freeze({ objectGroup: "easyeda-pro-control-schematic-wire-derived-rtree-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
// Before: 94 metadata + Map extraction + 112-slot reference table + comparison.
// After adds five metadata reads: new scene, old marker array, two old models.
// The original private before snapshot is the fifth addition. No graph BFS.
export const CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_REQUESTS = Object.freeze({ beforeMetadata: 94, afterMetadata: 99, before: 97, after: 102, normal: 199, helperSources: 6, cleanup: 1, total: 206, approvedSlots: 112 } as const);
export const CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_CALLS = freezeDeep({
  approved: { program: PROGRAMS.approved, refs: 113, byValue: false },
  map: { program: PROGRAMS.map, refs: 1, byValue: false },
  before: { program: PROGRAMS.before, refs: 3, byValue: false },
  after: { program: PROGRAMS.after, refs: 4, byValue: true },
} as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u); const object = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const calls = Object.entries(CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_CALLS).map(([role, row]) => z.strictObject({ phase: z.literal("wire-derived-rtree-call"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(row.program), arguments: z.array(object).length(row.refs), returnByValue: z.literal(row.byValue), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }));
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const releaseParams = z.strictObject({ objectGroup: flags.objectGroup });
const schema = z.union([...calls,
  z.strictObject({ phase: z.literal("wire-derived-rtree-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("wire-derived-rtree-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentSchematicWireDerivedRtreeCommand = z.infer<typeof schema>;
/** Accept exact reviewed rows and bounded original handles only. */
export function validateCurrentSchematicWireDerivedRtreeCommand(input: unknown): CurrentSchematicWireDerivedRtreeCommand { return freezeDeep(schema.parse(capture(input).value)); }
/** Enumerate inert canonical rows for native codebook composition. */
export function currentSchematicWireDerivedRtreeCases(): readonly CurrentSchematicWireDerivedRtreeCommand[] {
  return freezeDeep([
    ...Object.entries(CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_CALLS).map(([role, row]) => ({ phase: "wire-derived-rtree-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_FLAGS, objectId: "original_ref", functionDeclaration: row.program, arguments: Array.from({ length: row.refs }, () => ({ objectId: "original_ref" })), returnByValue: row.byValue, awaitPromise: false, userGesture: false } })),
    { phase: "wire-derived-rtree-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "wire-derived-rtree-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_FLAGS.objectGroup } },
  ].map(command => validateCurrentSchematicWireDerivedRtreeCommand(command)));
}
/** Substitute original handles without admitting any caller code or literals. */
export function currentSchematicWireDerivedRtreeTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireDerivedRtreeCommand(input); const fields: Record<string, "handle"> = {}; const values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_wirederivedrtree_${name}__`; };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  if (command.phase === "wire-derived-rtree-call") { phase += `-${command.role}`; params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((arg, index) => ({ objectId: field(`arg${String(index)}`, arg.objectId) })); }
  else if (command.phase === "wire-derived-rtree-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  return freezeDeep({ phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
