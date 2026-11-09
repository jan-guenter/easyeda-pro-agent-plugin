/** Distinct Wire readonly run-prefix grammar. The fixed model-independent
 * algorithms match the historical eight-model source. Its owner, native
 * sender, object group, packet marker and continuation remain separate. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_READ_BOUND, CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_GROUP as SHARED_GROUP,
  currentSchematicRelevanceRunPrefixExpression, validateCurrentSchematicRelevanceRunPrefixCommand } from "./current-schematic-relevance-run-prefix-protocol.ts";
import { currentSchematicRelevanceRunPrefixTemplate } from "./current-schematic-relevance-run-prefix-wire.ts";
import type { CurrentSchematicRelevanceRunPrefixCommand } from "./current-schematic-relevance-run-prefix-protocol.ts";

export const CURRENT_SCHEMATIC_WIRE_PREFIX_GROUP = "easyeda-pro-control-schematic-wire-run-prefix-v2";
export const CURRENT_SCHEMATIC_WIRE_PREFIX_REQUESTS = Object.freeze({ normal: CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_READ_BOUND, cleanup: 0, total: CURRENT_SCHEMATIC_RELEVANCE_RUN_PREFIX_READ_BOUND });
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), object = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_PREFIX_GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const frameParams = z.strictObject({ ...flags, callFrameId: handle, expression: z.string().max(256), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const callParams = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(32_768), arguments: z.array(object).max(12), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const sourceParams = z.strictObject({ scriptId: handle });
const frameRoles = z.enum(["run", "group", "module", "intrinsics", "empty", "receiver"]);
const variantSchema = z.union([z.literal(0), z.literal(1)]); const callRoles = z.enum(CALLS.map(row => row[0]));
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("wire-prefix-frame"), role: frameRoles, variant: variantSchema, method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("wire-prefix-call"), role: callRoles, method: z.literal("Runtime.callFunctionOn"), params: callParams }),
  z.strictObject({ phase: z.literal("wire-prefix-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("wire-prefix-source"), method: z.literal("Debugger.getScriptSource"), params: sourceParams }),
]);
export type CurrentSchematicWirePrefixCommand = z.infer<typeof schema>;
function shared(command: CurrentSchematicWirePrefixCommand): CurrentSchematicRelevanceRunPrefixCommand {
  return validateCurrentSchematicRelevanceRunPrefixCommand({ ...command, phase: command.phase.slice(5), params: "objectGroup" in command.params ? { ...command.params, objectGroup: SHARED_GROUP } : command.params });
}
/** Validate only fixed readonly prefix rows under the Wire object group. */
export function validateCurrentSchematicWirePrefixCommand(input: unknown): CurrentSchematicWirePrefixCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value); shared(command); return freezeDeep(command);
}
/** Internal inert command translation. The Wire schema refuses every arm,
 * remove and resume phase before the shared readonly cursor sees a reply. */
export function currentSchematicWirePrefixDataCommand(command: CurrentSchematicRelevanceRunPrefixCommand): CurrentSchematicWirePrefixCommand {
  return validateCurrentSchematicWirePrefixCommand({ ...command, phase: `wire-${command.phase}`, params: "objectGroup" in command.params ? { ...command.params, objectGroup: CURRENT_SCHEMATIC_WIRE_PREFIX_GROUP } : command.params });
}
/** Enumerate the complete closed readonly vocabulary for native encoding. */
export function currentSchematicWirePrefixCases(): readonly CurrentSchematicWirePrefixCommand[] {
  const base = { objectGroup: CURRENT_SCHEMATIC_WIRE_PREFIX_GROUP, silent: true, generatePreview: false, throwOnSideEffect: true };
  return freezeDeep([
    ...([0, 1] as const).flatMap(variant => (["run", "group", "module", "intrinsics", "empty", "receiver"] as const).map(role => ({ phase: "wire-prefix-frame", role, variant, method: "Debugger.evaluateOnCallFrame", params: { ...base, callFrameId: "original_frame", expression: currentSchematicRelevanceRunPrefixExpression(role, variant), returnByValue: false, includeCommandLineAPI: false } }))),
    ...CALLS.map(row => ({ phase: "wire-prefix-call", role: row[0], method: "Runtime.callFunctionOn", params: { ...base, objectId: "original_ref", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original_ref" })), returnByValue: row[3], awaitPromise: false, userGesture: false } })),
    { phase: "wire-prefix-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "wire-prefix-source", method: "Debugger.getScriptSource", params: { scriptId: "original_script" } },
  ].map(command => validateCurrentSchematicWirePrefixCommand(command)));
}
/** Derive the identical fixed program with its distinct Wire group and phase. */
export function currentSchematicWirePrefixTemplate(input: unknown): ReturnType<typeof currentSchematicRelevanceRunPrefixTemplate> {
  const command = validateCurrentSchematicWirePrefixCommand(input); const fixed = currentSchematicRelevanceRunPrefixTemplate(shared(command));
  const field = `"objectGroup":"${SHARED_GROUP}"`, replacement = `"objectGroup":"${CURRENT_SCHEMATIC_WIRE_PREFIX_GROUP}"`;
  const grouped = command.method === "Runtime.callFunctionOn" || command.method === "Debugger.evaluateOnCallFrame";
  if (fixed.template.split(field).length !== (grouped ? 2 : 1)) { throw new Error("SCHEMATIC_WIRE_PREFIX_FIXED_GROUP"); }
  return freezeDeep({ ...fixed, phase: `wire-${fixed.phase}`, template: fixed.template.replace(field, replacement) });
}
/** Project validated handles into the Wire-only native request discriminator. */
export function currentSchematicWirePrefixWire(input: unknown, id: number): Readonly<{ command: CurrentSchematicWirePrefixCommand; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("SCHEMATIC_WIRE_PREFIX_REQUEST_ID"); }
  const command = validateCurrentSchematicWirePrefixCommand(input), fixed = currentSchematicWirePrefixTemplate(command);
  return freezeDeep({ command, request: { action: "schematic-wire-writer-v2-prefix", requestId: id, phase: fixed.phase, method: fixed.method, ...fixed.values } });
}
