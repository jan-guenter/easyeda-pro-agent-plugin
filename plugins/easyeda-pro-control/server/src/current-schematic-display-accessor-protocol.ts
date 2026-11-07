/** Finite original page metadata grammar. It cannot express model mutation,
 * application methods, arbitrary programs, a realm, path or native ownership. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_FIELDS as FIELDS } from "./generated-schematic-display-accessor-source.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_CALLS as CALLS, CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_GROUP as GROUP } from "./current-schematic-display-accessor-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Callees+array+26 metadata+one complete source29; eight decorators each
 * at most two bounded scans16 (eight scopes each, final Global excluded) +projection/array/four metadata6;
 * setAttribute monitor scan/proof9; record and AST scans/proofs19; final
 * retained-callee reproof1. Cleanup releases one original object group. */
export const CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_REQUESTS = Object.freeze({ normal: 29 + 8 * 22 + 9 + 19 + 1, cleanup: 1, total: 235 });
export const CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const field = z.enum([FIELDS[2], FIELDS[3], FIELDS[4], FIELDS[5], FIELDS[6], FIELDS[7], FIELDS[8], FIELDS[9]]);
const data = z.string().min(1).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384);
const object = z.strictObject({ objectId: handle }); const json = z.strictObject({ value: data });
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const fieldArgument = z.strictObject({ value: field });
const calleeParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.callees), arguments: z.tuple([json, json]), returnByValue: z.literal(false) });
const closureParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.closure), arguments: z.tuple([object, json, json, fieldArgument, object, fieldArgument]), returnByValue: z.literal(false) });
const monitorParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.monitor), arguments: z.tuple([object, json, json]), returnByValue: z.literal(true) });
const sameParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.same), arguments: z.tuple([object, json, json]), returnByValue: z.literal(true) });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const sourceParams = z.strictObject({ scriptId: handle }); const releaseParams = z.strictObject({ objectGroup: z.literal(GROUP) });
const callees = z.strictObject({ phase: z.literal("schematic-accessor-callees"), method: z.literal("Runtime.callFunctionOn"), params: calleeParams });
const closure = z.strictObject({ phase: z.literal("schematic-accessor-closure"), method: z.literal("Runtime.callFunctionOn"), params: closureParams });
const monitor = z.strictObject({ phase: z.literal("schematic-accessor-monitor"), method: z.literal("Runtime.callFunctionOn"), params: monitorParams });
const same = z.strictObject({ phase: z.literal("schematic-accessor-same"), method: z.literal("Runtime.callFunctionOn"), params: sameParams });
const properties = z.strictObject({ phase: z.literal("schematic-accessor-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams });
const source = z.strictObject({ phase: z.literal("schematic-accessor-source"), method: z.literal("Debugger.getScriptSource"), params: sourceParams });
const release = z.strictObject({ phase: z.literal("schematic-accessor-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams });
const commands = z.union([callees, closure, monitor, same, properties, source, release]);
export type CurrentSchematicDisplayAccessorCommand = z.infer<typeof commands>;
export function validateCurrentSchematicDisplayAccessorCommand(input: unknown): CurrentSchematicDisplayAccessorCommand {
  const command = commands.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "schematic-accessor-closure" && command.params.arguments[3].value !== command.params.arguments[5].value) { throw new Error("SCHEMATIC_DISPLAY_ACCESSOR_CAPTURED_FIELD"); }
  return freezeDeep(command);
}

export function currentSchematicDisplayAccessorNativeCases(): readonly CurrentSchematicDisplayAccessorCommand[] {
  const objectId = "accessor_objectId"; const holder = { objectId: "accessor_holder" }; const target = { value: "{}" }; const operation = { value: "{}" };
  return freezeDeep([
    { phase: "schematic-accessor-callees", method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_FLAGS, objectId, functionDeclaration: CALLS.callees, arguments: [target, operation], returnByValue: false } },
    { phase: "schematic-accessor-closure", method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_FLAGS, objectId, functionDeclaration: CALLS.closure, arguments: [holder, target, operation, { value: "rotation" }, { objectId: "accessor_decorator" }, { value: "rotation" }], returnByValue: false } },
    ...(["monitor", "same"] as const).map(role => ({ phase: `schematic-accessor-${role}`, method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_FLAGS, objectId, functionDeclaration: CALLS[role], arguments: [holder, target, operation], returnByValue: true } })),
    { phase: "schematic-accessor-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "schematic-accessor-source", method: "Debugger.getScriptSource", params: { scriptId: "accessor_scriptId" } },
    { phase: "schematic-accessor-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }
  ].map(command => validateCurrentSchematicDisplayAccessorCommand(command)));
}
