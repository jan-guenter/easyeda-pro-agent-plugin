/** Distinct readonly SCH action-preflight grammar. No setter, resume or Save. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACTION_CALLS as CALLS, CURRENT_SCHEMATIC_DISPLAY_ACTION_GROUP as GROUP } from "./current-schematic-display-action-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
// Projection+array+18 exact function metadata+one complete source+same graph.
export const CURRENT_SCHEMATIC_DISPLAY_ACTION_REQUESTS = Object.freeze({ normal: 1 + 1 + 18 + 1 + 1, cleanup: 1, total: 23 });
export const CURRENT_SCHEMATIC_DISPLAY_ACTION_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u); const data = z.string().min(1).max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384);
const object = z.strictObject({ objectId: handle }); const json = z.strictObject({ value: data });
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const preflightParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.preflight), arguments: z.tuple([json, json]), returnByValue: z.literal(false) });
const sameParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(CALLS.same), arguments: z.tuple([object, json, json]), returnByValue: z.literal(true) });
const propertiesParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const sourceParams = z.strictObject({ scriptId: handle }); const releaseParams = z.strictObject({ objectGroup: z.literal(GROUP) });
const commands = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("schematic-action-preflight"), method: z.literal("Runtime.callFunctionOn"), params: preflightParams }),
  z.strictObject({ phase: z.literal("schematic-action-same"), method: z.literal("Runtime.callFunctionOn"), params: sameParams }),
  z.strictObject({ phase: z.literal("schematic-action-properties"), method: z.literal("Runtime.getProperties"), params: propertiesParams }),
  z.strictObject({ phase: z.literal("schematic-action-source"), method: z.literal("Debugger.getScriptSource"), params: sourceParams }),
  z.strictObject({ phase: z.literal("schematic-action-release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentSchematicDisplayActionCommand = z.infer<typeof commands>;
export function validateCurrentSchematicDisplayActionCommand(input: unknown): CurrentSchematicDisplayActionCommand { return freezeDeep(commands.parse(captureCurrentPcbStringClockReply(input).value)); }
export function currentSchematicDisplayActionNativeCases(): readonly CurrentSchematicDisplayActionCommand[] {
  const objectId = "action_object"; const target = { value: "{}" }; const operation = { value: "{}" };
  return freezeDeep([
    { phase: "schematic-action-preflight", method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_DISPLAY_ACTION_FLAGS, objectId, functionDeclaration: CALLS.preflight, arguments: [target, operation], returnByValue: false } },
    { phase: "schematic-action-same", method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_DISPLAY_ACTION_FLAGS, objectId, functionDeclaration: CALLS.same, arguments: [{ objectId: "action_holder" }, target, operation], returnByValue: true } },
    { phase: "schematic-action-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "schematic-action-source", method: "Debugger.getScriptSource", params: { scriptId: "action_script" } },
    { phase: "schematic-action-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } },
  ].map(command => validateCurrentSchematicDisplayActionCommand(command)));
}
